---
layout: '../../layouts/BlogPost.astro'
title: 'Local-first data migrations'
description: 'now with time travel!'
pubDate: 'Nov 23 2022'
heroImage: '/images/blog/susan-wilkinson-vnus9kq-96w-unsplash.jpg'
heroCredit: 'Susan Wilkinson on Unsplash'
---

> Local-first series
>
> 1. [The goal](/blog/lofi-intro)
> 2. [Sync](/blog/lofi-sync)
> 3. [Migrations](/blog/lofi-migrations)
> 4. [Index queries](/blog/lofi-storage)

I have to tell you, after finally feeling like I'd figured out how to store, query, and sync data... Migrations nearly broke me!

Not because they're that much more complex than sync (not at all, really), but simply because once again what seems like a straightforward scenario (change A to B) hides various edge cases when applied to an offline world.

Up to this point my solutions have distributed the concerns and functionality of the system unequally across server and client. The server actually doesn't have to know about the shape of the data at all. It stores operations and baselines and doesn't really interpret them (beyond knowing operations are ordered, and how to apply them in a rebase, but these things are not dependent on the schema). It would be nice to keep it that way. In fact it would make it quite simple to host multiple apps on the same infrastructure since the server is not opinionated about the shape of the documents it stores.

How, then, can we ensure that when a client updates its app and begins using a new data format, that the whole system doesn't get thrown into confusion and ambiguity? What if other connected clients are still running version 1? They could receive operations which reshape their local documents into a format unsupported by the code they're already executing!

Since we have a coordinating server, it would be nice if the server were able to arbitrate this process. Perhaps the server will update first, learn about version 2, then block syncing on any clients until they are on version 2 as well. Connected clients will be forced to reload...

But what if the server _isn't_ updated first? Perhaps our backend is hosted in a container somewhere, but the frontend is a static website in a CDN. It's possible a client could get its copy of the new code before the server is updated. While we could simply make it a rule that the server must come first in your deployment, this seems needlessly rigid.

I hope it's understandable why migration suddenly felt like a daunting challenge, even after all the work to build the rest of the system!

But I hope it's also clear why a local-first storage and sync framework without a story for migrations could result in headaches down the road.

## Versioning operations

The solution I've adopted is to version the operations. Versioning allows us to make decisions about operations as they come in and preserve the sequential aspect of migration -- i.e. the only sane way to create data migrations is to assume that once you have migrated a collection, you are _from then on_ working with data of the specified migrated shape. So our goal is to ensure that operations with version 1 are always and only ever applied to objects _before_ any operation with version 2, and so on.

There are two ways to go about this. Let's imagine we have Replica A who has already updated to version 2 and is making changes to Document 1. So, in abstract, A's history of operations for Document 1 looks like this:

```
A: 1a, 1b, 1c, 1d, 2e, 2f, 2g, 2h, 2i
```

Replica B is offline and hasn't updated their app. It was working off a shared history with Replica A, but has now diverged...

```
A: 1a, 1b, 1c, 1d, 2e, 2f, 2g, 2h, 2i
B: 1a, 1b, 1cc, 1dd, 1ee, 1ff, 1gg, 1hh
          ^
          divergence
```

(the 'double letter' operations are used to represent that these operations are still sequentially related from B's perspective, but are distinct from A's operations).

Suppose that these two clients are working simultaneously, and the two timelines are roughly aligned in real-time. So `2e` and `1ee` have basically sequential timestamps, for example.

Now when B comes online, it will sync up its operations as usual. And now we must decide how those operations are applied (or not) into peer history.

One option is to drop any version 1 operations which are after any version 2 operation. We simply ignore changes made after the first peer migrates. Our new history would look like this:

```
A,B: 1a, 1b, 1c, 1cc, 1d, 1dd, 2e, 2f, 2g, 2h, 2i

(1cc and 1dd 'sneak in' because they are before the first version 2 operation, 2e)
```

This feels simple at first, but we have to remember that Replica B has already stored those operations. We now have to include logic for B to filter its own operation set as part of its migration (which isn't awful, but undercuts the simplicity of this option). Plus, B loses its changes! Offline blips can happen anytime while doing realtime collaboration, and this would end up looking like a confusing stutter.

Another option is to decide that time is relative, after all, and if Replica B was working on a version of the data which is now 'old,' well, aren't all their changes in the logical 'past?' We could insert them in order behind every version 2 operation without dropping them:

```
A,B: 1a, 1b, 1c, 1cc, 1d, 1dd, 1ee, 1ff, 1gg, 1hh, 2e, 2f, 2g, 2h, 2i
```

And in fact this would be trivial to do without altering the system by changing our logical clock algorithm to always begin with the version number (in a stable, orderable format... like with several 0s prepended).

Since we favor simplicity, this feels good. But are there drawbacks to meddling with time? Fantasy and sci-fi authors seem to think so. Let's explore what our abstract example would look like with real document changes.

First, we need to imagine what the migration change was. Suppose we have a document format:

```ts
type Post = {
	id: string;
	content: string;
	tags: string[];
	title: string;
};
```

now we migrate it to look like:

```ts
type Post = {
	id: string;
	content: string;
	tags: { name: string; color: string }[];
	title: string;
	summary: string;
};
```

So we've expanded tags into an object, and added `summary`. We'll be working with a document baseline for version 1:

```ts
const post: Post = {
	id: 'xyz',
	content: 'Hello world',
	tags: ['dev'],
	title: 'First post',
};
```

For a contrived example, let's suppose Replica A changed the `title` field to `'Initial post'`, then migrated the post up to version 2, running a routine which converted the string tags into tags with colors and adding a blank `summary` field. Then Replica A fills in their summary.

```ts
// first change operation
[
  {
    oid: 'posts/1',
    op: 'set',
    name: 'title',
    value: 'Initial post',
  }
]
// migration operation changes all migrated fields - future operations are all version 2 now
[
  // create the object tag
  {
    oid: 'posts/1.tags.#:fghi',
    op: 'init',
    value: { name: 'dev', color: '#ff0000' },
  },
  // replace the string tag with a ref to the new object
  {
    oid: 'posts/1.tags:abcd',
    op: 'set',
    name: 0,
    value: { '@@type': 'ref', id: 'posts/1.tags.#:fghi' }
  },
  // add the summary field
  {
    oid: 'posts/1',
    op: 'set',
    name: 'summary',
    value: ''
  },
]
// after the migration - replica starts modifying data
[
  {
    oid: 'posts/1',
    op: 'set',
    name: 'summary',
    value: 'First post in my blog'
  }
]
```

Now in the meantime, back on version 1, Replica B modifies the `content` and adds a `react` tag.

```ts
[
	{
		oid: 'posts/1',
		op: 'set',
		name: 'content',
		content: 'Some new content',
	},
][
	{
		oid: 'posts/1:tags:abcd',
		op: 'list-push',
		value: 'react',
	}
];
```

if we merge our operation histories in version order naively, we get some trouble.

```ts
[
  {
    oid: 'posts/1',
    op: 'set',
    name: 'title',
    value: 'Initial post',
  }
]
[
  {
    oid: 'posts/1',
    op: 'set',
    name: 'content',
    content: 'Some new content',
  }
]
[
  {
    oid: 'posts/1:tags:abcd',
    op: 'list-push',
    value: 'react'
  }
]
[
  {
    oid: 'posts/1.tags.#:fghi',
    op: 'init',
    value: { name: 'dev', color: '#ff0000' },
  },
  {
    oid: 'posts/1.tags:abcd',
    op: 'set',
    name: 0,
    value: { '@@type': 'ref', id: 'posts/1.tags.#:fghi' }
  },
  {
    oid: 'posts/1',
    op: 'set',
    name: 'summary',
    value: ''
  },
]
[
  {
    oid: 'posts/1',
    op: 'set',
    name: 'summary',
    value: 'First post in my blog'
  }
]
```

Our final document would look like this:

```ts
const post: Post = {
	id: 'xyz',
	title: 'Initial post',
	content: 'Some new content',
	tags: [{ name: 'dev', color: '#ff0000' }, 'react'],
	summary: 'First post in my blog',
};
```

Some notable things happened:

- Changes on fields which stayed the same merged just as well as ever (`title`, `content`)
- We managed to preserve the intent of adding the `react` tag
- But we ended up with invalid data for the `tags` field

However, there's an interesting moment in our history, right before Replica A's migration operation, were we might have an opportunity to correct the error. At this point in history, our document is still in version 1 format, and looks like this

```ts
const post: Post = {
	id: 'xyz',
	title: 'Initial post',
	content: 'Some new content',
	tags: ['dev', 'react'],
};
```

When Replica B performs its local migration, it will see this state as the final one before version 2. What if we have Replica B perform its own local migration operation?

```ts
[
	{
		oid: 'posts/1.tags.#:lmno1234',
		op: 'init',
		value: { name: 'dev', color: '#ff0000' },
	},
	{
		oid: 'posts/1.tags:abcd',
		op: 'set',
		name: 0,
		value: { '@@type': 'ref', id: 'posts/1.tags.#:lmno1234' },
	},
	{
		oid: 'posts/1.tags.#:qwer4356',
		op: 'init',
		value: { name: 'react', color: '#00ff00' },
	},
	{
		oid: 'posts/1.tags:abcd',
		op: 'set',
		name: 1,
		value: { '@@type': 'ref', id: 'posts/1.tags.#:qwer4356' },
	},
	{
		oid: 'posts/1',
		op: 'set',
		name: 'summary',
		value: '',
	},
];
```

> Note: we assume color generation is deterministic, or randomness is acceptable.

This patch would fix our problem, but there's an issue - Replica B isn't migrating until well after Replica A has made its own version 2 changes. Inserting the patch in clock order would reset the summary A wrote to `''`.

As long as we're messing with time, why not group migration operations together? After all, we have already assured that any data which a migration is operating on comes before the migration in history. That means we can safely move the operation which represents the migration itself backward as far as that point.

To accomplish this we can tweak the timestamps for migration operations one last time and add a `\u0000` character after the version number - so they will all be the first operations for version 2, otherwise sorted in timestamp order.

```ts
[
  {
    oid: 'posts/1',
    op: 'set',
    name: 'title',
    value: 'Initial post',
  }
]
[
  {
    oid: 'posts/1',
    op: 'set',
    name: 'content',
    content: 'Some new content',
  }
]
[
  {
    oid: 'posts/1:tags:abcd',
    op: 'list-push',
    value: 'react'
  }
]
[
  {
    oid: 'posts/1.tags.#:fghi',
    op: 'init',
    value: { name: 'dev', color: '#ff0000' },
  },
  {
    oid: 'posts/1.tags:abcd',
    op: 'set',
    name: 0,
    value: { '@@type': 'ref', id: 'posts/1.tags.#:fghi' }
  },
  {
    oid: 'posts/1',
    op: 'set',
    name: 'summary',
    value: ''
  },
]
[
  {
    oid: 'posts/1.tags.#:lmno1234',
    op: 'init',
    value: { name: 'dev', color: '#ff0000' }
  },
  {
    oid: 'posts/1.tags:abcd',
    op: 'set',
    name: 0,
    value: { '@@type': 'ref', id: 'posts/1.tags.#:lmno1234' }
  },
  {
    oid: 'posts/1.tags.#:qwer4356',
    op: 'init',
    value: { name: 'react', color: '#00ff00' }
  },
    {
    oid: 'posts/1.tags:abcd',
    op: 'set',
    name: 1,
    value: { '@@type': 'ref', id: 'posts/1.tags.#:qwer4356' }
  },
  {
    oid: 'posts/1',
    op: 'set',
    name: 'summary',
    value: ''
  }
]
[
  {
    oid: 'posts/1',
    op: 'set',
    name: 'summary',
    value: 'First post in my blog'
  }
]
```

With this ordering, we've successfully migrated all our data and avoided overwriting values of version 2 operations as new clients come online!

```ts
const post: Post = {
	id: 'xyz',
	title: 'Initial post',
	content: 'Some new content',
	tags: [
		{ name: 'dev', color: '#ff0000' },
		{ name: 'react', color: '#00ff00' },
	],
	summary: 'First post in my blog',
};
```

### A final small problem

I didn't catch this when originally implementing this migration algorithm, and it's not the end of the world, but there is a catch.

Notice how, as part of the migration, we end up creating two copies of the `dev` tag. Each one is a distinct object. Replica B's migration overwrites the one created by Replica A - which is fine, since they're exactly the same.

But this object 'lives on' in our history. It's essentially a ghost now, so we need some sort of logic to clean it up. I haven't done that yet!

The good news is that deleting a document entirely will also delete all operations and baselines whose OIDs are prefixed by that document's OID - which means even those ghost objects will be deleted in the end. But for long-lived or immortal documents, you might see unnecessary storage clutter if your client makes shape-changing migrations like this frequently.

On the other hand, such migrations aren't really that common. It's likely this bug will remain for a while since the priority isn't too high.

> Next up: [Indexing and Queries](/blog/lofi-storage)
