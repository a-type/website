---
layout: "../../layouts/BlogPost.astro"
title: "Building lofi: Sync"
description: "Part 2 on the internals of lofi, my local-first data framework."
pubDate: "Sep 12 2022"
heroImage: "/resource-database-I12XKpvVz9g-unsplash.jpg"
---

> lofi series
> 1. [The goal](/blog/lofi-intro)
> 2. [Sync](/blog/lofi-sync)
> 3. [Storage & Queries](/blog/lofi-storage)
> 4. [Migration](/blog/lofi-migration)

Sync is a big part of lofi, and the core concepts which power it are relevant even to local-only scenarios.

Here are some of the high-level concepts we need to cover:

1. Operations
2. Rebasing and baselines
3. Consensus

## Operations

The core of sync is the Operation. An Operation describes an incremental change applied to a Document. All Operations on all Documents are stored in one big list, on both the client and server!

Operations look roughly like this on the server:

```ts
{
  id: '1',
  libraryId: 'some-group-library-id',
  collection: 'todos',
  documentId: 'abc1',
  patch: [...], // we'll explain later
  timestamp: '2020-01-01T00:00:00.000Z:2342341:ajsdflaksjdf',
  replicaId: 'grants phone'
}
```

On the client they're similar, but the client doesn't store `libraryId`.

Let's go over each field:

- `id`: A globally unique identifier for the operation.
- `libraryId`: A "Library" is the collection of all documents shared among a group of users. Each group of users can only access documents in their library.
- `collection`: A collection is a group of documents defined in your schema which share a shape.
- `documentId`: The ID of the document this operation is applied to.
- `patch`: The patch is a list of operations to apply to the document. We'll talk about it later on.
- `timestamp`: The timestamp is a hybrid logical clock value that represents the moment the operation was created. What you need to know about a hybrid logical clock is that it can create sequentially ordered timestamps across distributed devices, even with clock drift.
- `replicaId`: The replica ID is a unique identifier for the device that created the operation. It wouldn't actually be human readable but is here for demonstration.

### Patches

Operations apply patches. Patches are lists of changes to make to a document. lofi uses JSON-Patch as the primary syntax for patches. A JSON-Patch operation looks like this:

```
{
  op: 'replace',
  path: '/foo/bar',
  value: 'baz'
}
```

The value at `path` is replaced with `'baz'` in this example. JSON-Patch describes several operations to do a lot of useful transformations.

lofi extends JSON-Patch with a few extra transforms for lists: push, and move.

lofi also adds a special kind of patch which is literally: `'DELETE'`. Hopefully the meaning is clear.

So any time you modify a document, it will create an operation like the one above, which will include a list of patches to make.

### Syncing operations

When a client connects to the server after being offline, it might have some operations that it created offline it wants to tell the server about. Likewise, the server probably has quite a few operations from other clients which were created while the client was offline.

So the client and server do a synchronization dance. The dance includes 3 steps. The shape of each message in this exchange can be found in detail in `@lofi/common/src/protocol.ts`.

#### Sync 1: The client introduces itself

The client sends a message which includes its `replicaId`. The replica ID tells the server which client this is, so the server can make the first move in syncing operations back.

> Side note: can't I just send someone else's replica ID?
>
> That would be nefarious, but no - since we have a trusted server, we actually link replica IDs to particular logged-in users when they're
> seen. If you tried to hijack someone's replica ID, the app server should refuse to forward your message to lofi's server code.

#### Sync 2: The server responds with changes to apply

The server computes the changes which the client needs using its `replicaId`. It responds with a message that includes the list of Operations, a list of Baselines (more on that later), and a timestamp which tells the client which operations it should send back - i.e. all of the local operations it has since that timestamp.

This is the reason the client doesn't send operations in its first message. It may not have as clear of an understanding of when to start its history than the server does.

#### Sync 3: The client responds with local changes

The client now knows which operations it should pull and send to the server. It responds with those, and we're done.

### Syncing realtime operations

Of course, once you're online, we want things to be more responsive. Syncing operations as they happen lets us have full realtime multiplayer quite easily! Whenever a change is made to a document, the client sends that operation in a message to the server. The server then rebroadcasts the operation to all of its peers.

### What happens when a replica receives operations

When either the client or server receives new operations, it inserts them into its big global operations list.

It takes note of which documents were affected by each new operation while it does that.

Then, for each updated document, it pulls the whole operation history in order, and re-applies all the operations to recompute the "view" of the document. We can't just apply the new operations, because they could have been created in the past, while we were offline. They might come before local operations we already have, and that might affect the outcome of those changes as well.

For example, imagine we pushed an item onto the `todo1.tags` list while we were offline, at 5:00 PM. Meanwhile, a peer who was online also pushed a tag at 4:30 PM, but we didn't know that. When we come back online, our peer's operation will be inserted _before_ ours into our operation history. So their tag would come before ours. If we had naively applied their operation to our existing document, we'd have them in the wrong order.

These recomputed views are stored in the database where you would expect your documents to be. And on the client, any queries affected get re-run.

How does the replica re-apply these operations? For that we can start on Baselines.

## Baselines

A Baseline is a snapshot of a document at a particular point in time. A newly created document doesn't have a baseline at all, so the system assumes `{}` is the base state until one is stored.

To compute a document view, you basically start with the baseline and iterate over every operation in your history which related to that document, in timestamp order. Apply each operation to the baseline, and your final copy of that data is the current state of the document (according to your replica).

Where baselines come in handy is rebasing. As stated in lofi's [goals](/blog/lofi-intro), we don't really care about preserving history past a certain point.

Let's say we only want to support 100 undo events on each device. That means, logically, that if I made 101 local operations, I can _no longer undo my first one_. If I can't undo it, no one can - which means this change is set in stone. There's no reason we should continue storing it in history, so we want to apply it to our Baseline and drop it.

Doing that is not quite so simple, though. Sure, I could drop my local operations, but then how do other people know to drop them, too? There's also a snag we have to consider: what if someone inserts an operation before my oldest one? In that case, I would need to still have it around so I could re-apply it when I merge their operations with my own.

These complexities give rise to some constraints which define how we "rebase" documents:

1. We can only drop the oldest operations applied to a document. We can never drop operations in the 'middle' of a document's history.
2. We can only drop operations which everyone has seen. Otherwise we won't have that operation to sync to them when they come online.
3. We can only drop operations which are older than the oldest thing which the creating client can undo. i.e. if my undo stack is 100 long, we can only drop items 101+ in the past. Hope that makes sense.

### Announcing our undo status

To get things going, each replica announces its oldest historical timestamp it still can undo to the server, each time it makes a change. The server stores this and keeps track. That helps us implement constraint 3.

### Broadcasting the global "ack"

"Ack" stands for "acknowledge." Each time any replica receives an operation, it "acks" it. The server then stores the latest timestamp of acked operations for each replica. By doing so it can now compute a "global ack" - the earliest timestamped operation every single replica has definitely seen. This helps us implement constraint 2.

### Deciding what to rebase

The server has the most knowledge in our system, so it's the best place to decide what to rebase. At regular intervals after changes are made, it will scan for any new rebases it can do.

It does this by choosing some N operations from the start of history, then determining which ones fit the criteria above. For any set of collected operations which relate to a document, it will rebase the document. It keeps track of individual document history so that it can conform to constraint 1, too.

### Client rebasing

The server stores which documents were rebased, and up to which timestamp. It can then send this summarized information to clients, so they can rebase those documents, too. Clients need less information for their rebase - they don't need to be aware of the state of every peer. Since the server is trusted with higher information and decisions, the client can just do as it's told (or not - there's no harm in not rebasing at all, except that the client's storage will grow indefinitely).

## Consensus

While the sync process outlined so far is not quite _simple_, I hope it feels simple enough to understand. However, we're not out of the woods yet. There's a 'nefarious' case to consider related to clients which go offline for a long time.

### Rebasing with absent peers

> Status: no optimizations implemented yet. This is as of yet theoretical.

As long as one replica goes offline, it's not possible to rebase a document if they were the earliest one to edit it. While they are offline, we don't know if they will undo their original change. If that replica never comes back online, we're stuck with this document's operations, even if it gets deleted by another peer.

To mitigate this, the server may set a 'delinquent' window for replicas. If a replica doesn't connect within that timeframe, it is flagged and ignored for consensus. This might be longer for highly asynchronous applications or shorter for more realtime ones.

When a delinquent peer reconnects, their local changes are forfeit, and they must reset to the consensus state of the rest of the network. It's possible to be a little smarter about this and allow documents which originated entirely on the offline peer still be synchronized back.
