---
layout: "../../layouts/BlogPost.astro"
title: "Syncing local web app data"
description: "one naive approach, at least"
pubDate: "Sep 19 2022"
heroImage: "/resource-database-I12XKpvVz9g-unsplash.jpg"
---

> lo-fi series
> 1. [The goal](/blog/lofi-intro)
> 2. [Sync](/blog/lofi-sync)
> 3. [Migrations](/blog/lofi-migrations)

Sync is a big part of the problem space for local web storage, and the core concepts which power it are relevant even to local-only scenarios. In this post I'll outline how I approached server-client sync for IndexedDB documents.

## Operations

The core of sync (in my world at least) is the Operation. An Operation describes an incremental change applied to a Document. All Operations on all Documents are stored in one big list, on both the client and server!

Operations look roughly like this on the server:

```ts
{
  libraryId: 'grant\'s library',
  oid: 'todos/1.tags:abcd123',
  data: ..., // we'll explain later
  timestamp: '2020-01-01T00:00:00.000Z:2342341:ajsdflaksjdf',
}
```

On the client they're similar, but the client doesn't store `libraryId`.

Let's go over each field:

- `libraryId`: A "Library" is the collection of all documents shared among a group of users. Each group of users can only access documents in their library.
- `oid`: A formatted unique identifier for an object within the library. Encoded in the OID is the document collection, the unique document ID, a subpath of the field (if any), and a random string.
- `data`: The data is a patch operation to apply to the document. We'll talk about it later on.
- `timestamp`: The timestamp is a hybrid logical clock value that represents the moment the operation was created. What you need to know about a hybrid logical clock is that it can create sequentially ordered timestamps across distributed devices, even with clock drift.

### Patches

Operations apply patches. Patches are changes that combine to make to a document. There are a variety of patch types, but basically they're atomic inputs for pure functions that modify an initial object to produce an output one.

For example:

```
{
  op: 'set',
  name: 'bar',
  value: 1
}
```

The value at `name` of the given object is replaced with `1` in this example.

So any time you modify a document, instead of directly assigning to properties, lo-fi generates a list of operations which contain instructions like above. Successive application, in order, of all of these instructions computes the canonical data for your object (which, for performance's sake, is often cached in-memory).

### Objects and object references

You may have noticed that the OID, the encoded object identifier, stores a lot of meaningful information. There's an OID assigned to every nested level of object in a document (think: JS `object`s and `Array`s). All objects are 'normalized' in the sync system, even though the replicas themselves deal with denormalized document-style data. Why?

Individual object identity is vital when computing conflict resolution in offline scenarios, especially lists. For example, consider a case where you have a list of comments attached to a post. While replicas A and B are offline, they both push a new comment with initial empty text to that list:

```ts
{
  op: 'list-push',
  name: 'comments',
  value: {
    text: '',
  },
}
```

This would be a naive way to do it. But suppose they go on to write entirely different comments. If we don't have object identity, each replica believes their comment is at index `0`. We have no better way to reference which comment the replica is modifying. So both replicas will start writing operations like this...

```ts
{
  op: 'set',
  name: 'comments.0.text',
  value: 'hello from A',
}

{
  op: 'set',
  name: 'comments.0.text',
  value: 'hello from B'
}
```

And when both of these replicas come back online, here's what will happen:

1. Both list push operations will be applied. There will be two empty comments in the list
2. Both sets of change operations will be applied against the comment at index `0`
3. We end up with 1 comment that was written and then overwritten by both replicas, and one that is still empty!

Instead, we must generate unique identities for both comments. Then each replica knows exactly which comment it is editing, even if the final computed position of their comment differs from what they see while offline.

So instead of naively pushing a whole comment object, we split it up:

```ts
// The comment from replica A
{
  oid: 'posts/1.comments.#:abcd123',
  op: 'init',
  value: {
    text: ''
  }
},
{
  oid: 'posts/1.comments:fghi234',
  op: 'list-push',
  value: {
    '@@type': 'ref',
    id: 'posts/1.comments.#:abcd123'
  }
}
```

Our new operation list initializes our identified comment object, then pushes a _reference to it_ onto the comments list.

Notice how the OID we generated for the comment includes a random string. When each replica creates its comment independently, their OIDs will not overlap.

```ts
// The comment from replica B
{
  oid: 'posts/1.comments.#:wxyz7890',
  op: 'init',
  value: {
    text: ''
  }
},
{
  oid: 'posts/1.comments:fghi234',
  op: 'list-push',
  value: {
    '@@type': 'ref',
    id: 'posts/1.comments.#:wxyz7890'
  }
}
```

Replicas can now make changes to their comments by their OID, and those changes will end up on their exact comment. The order the comments show up in once all changes are merged together is entirely up to the timestamp ordering of those `list-push` operations, but won't affect the final state of each comment.

### Syncing operations

When a replica connects to the server after being offline, it might have some operations that it created offline it wants to tell the server about. Likewise, the server probably has quite a few operations from other replicas which were created while the replica was offline.

So the replica and server do a synchronization exchange.

#### Sync: The replica introduces itself and provides its changes

The replica sends a message which includes its `replicaId`. The replica ID tells the server which replica this is.

> Side note: can't I just send someone else's replica ID?
>
> That would be nefarious, but no - since we have a trusted server, we actually link replica IDs to particular logged-in users when they're
> seen. If you tried to hijack someone's replica ID, the app server should refuse to forward your message to the sync server code.

Included in the initial sync message is a list of operations the replica has created since it last synced with the server.

#### Sync response: The server responds with changes to apply

When the server receives a sync message from a replica, it inserts all the new operations into its own database. It also rebroadcasts these operations to any connected peers.

The server then computes the list of operations which the replica needs to be informed of since its last connection using its `replicaId`. It responds with a message that includes the list of Operations, a list of Baselines (more on that later), and a timestamp.

There's some additional metadata in the server's response that's useful, but that's what is important for syncing.

### Syncing realtime operations

Of course, once you're online, we want things to be more responsive. Syncing operations as they happen lets us have full realtime multiplayer quite easily! Whenever a change is made to a document, the replica sends that operation in a message to the server. The server then rebroadcasts the operation to all of its peers.

In lo-fi, clients don't stream operations immediately to the server by default - they batch them to reduce traffic. Batching timerange is configurable.

### What happens when a replica receives operations

When either the replica or server receives new operations, it inserts them into its big global operations list.

It takes note of which documents were affected by each new operation while it does that.

On the replica, for each updated document, it pulls the whole operation history in order, and re-applies all the operations to recompute the "view" of the document. We can't just apply the new operations, because they could have been created in the past, while we were offline. They might come before local operations we already have, and that might affect the outcome of those changes as well.

For example, imagine we pushed an item onto the `todo1.tags` list while we were offline, at 5:00 PM. Meanwhile, a peer who was online also pushed a tag at 4:30 PM, but we didn't know that. When we come back online, our peer's operation will be inserted _before_ ours into our operation history. So their tag would come before ours. If we had naively applied their operation to our existing document, we'd have them in the wrong order.

> _Note:_ for performance tuning, we can store a 'high water mark' snapshot of an object instead of recomputing the whole history. If an operation arrives which is before the high water mark, we discard it and recompute from the beginning, storing a new high water mark along the way. The position of the high water mark could be a heuristic decision.

These recomputed views are stored in the database where you would expect your documents to be. And on the replica, any queries affected get re-run.

How does the replica re-apply these operations? For that we can start on Baselines.

> _Note:_ The server doesn't actually need to do any of that operation-reapplying. In fact, it has no final 'view' of the object at all. It only needs to store and work with the raw operations.

## Baselines

A Baseline is a snapshot of an object at a particular point in time. A newly created object doesn't have a baseline at all.

To compute an object view, you basically start with the baseline and iterate over every operation in your history which related to that document, in timestamp order. Apply each operation to the baseline, and your final copy of that data is the current state of the object (according to your replica).

If the object doesn't have a baseline, the first operation is always an `init` operation, which sets the state of the entire object to an initial value.

Where baselines come in handy is compacting history. As stated in my [goals](/blog/lofi-intro), I don't really care about preserving history past a certain point.

To determine when we can start compacting old operations, we need to know what all of our peer replicas have seen. Once everybody agrees on history, we can condense that history back into the baseline.

### Broadcasting the global "ack"

"Ack" stands for "acknowledge." Each time any replica receives an operation, it "acks" it. The server then stores the latest timestamp of acked operations for each replica. By doing so it can now compute a "global ack" - the earliest timestamped operation every single replica has definitely seen. Once a client receives the global ack, it knows it's safe to rebase any operations which occurred before that time. Since all operations are stored together in one big table, this is as simple as a single indexed query, then iterating over the result list to group changes by object.

> As a proponent of verbosity for the sake of understanding, you'd think I'd just write out "acknowledge." But "ack" is more fun to say.

## Some edge cases

While the sync process outlined so far is not quite _simple_, I hope it feels simple enough to understand. However, we're not out of the woods yet. There's a 'nefarious' case to consider related to replicas which go offline for a long time.

### Rebasing with absent peers

As long as one replica goes offline, it's not possible to compute a new global ack timestamp! If that replica never comes back online, we're stuck. That may be unintuitive, but consider: if that replica comes back online with old operations and we've deleted that history, we won't know how to insert those operations in order to resolve a merged final state.

To mitigate this, the server may set a 'truant' window for replicas. If a replica doesn't connect within that timeframe, it is flagged and ignored for global ack computation. This might be longer for highly asynchronous applications or shorter for more realtime ones.

When a truant peer reconnects, their local changes are forfeit, and they must reset to the consensus state of the rest of the network. It's possible to be a little smarter about this and allow documents which originated entirely on the offline peer still be synchronized back (TODO).

### Read-only replicas

Since read-only replicas could never submit a new operation, they don't have the same problems as truant replicas above. We can just ignore them altogether for global ack. They still have to rebase like any other replica, but we don't wait on them to be online to rebase peers.

### Rebasing for replicas which never go online

Ideally, it shouldn't only be syncing replicas who benefit from history compaction. In fact, replicas who never sync and are offline-only should have a much easier time of rebasing, since they don't need to worry about acks at all.

If a replica has never synced before, it doesn't need a global ack timestamp to start a rebase. It just periodically compacts history as it goes.

### Syncing for the first time

When an offline replica upgrades to become a syncing replica for the first time, it may have local baselines from its personal history compaction. Without these baselines, synced state will be broken.

So, when a replica detects it has never synced before, it also sends its local baselines with the initial sync. For all subsequent syncs, this is not needed.

## Wrapping up

Hopefully that was clear enough to illuminate my approach to syncing local-first data. It's not the only way, by a long shot, but it aligns with my personal project goals, and so far, it works!
