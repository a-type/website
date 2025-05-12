---
layout: ../../layouts/BlogPost.astro
title: Idiosyncratic Engineering
description: Is it ok to rely on platform behavior?
pubDate: 2024-08-26
heroImage:
---

A couple years ago I decided to make a sync engine for web apps. Not because such a thing didn't already exist--there were a number of promising upcoming projects in the blooming local-first space alongside me, many of which are going strong today. In fact I usually recommend them over my own solution to anyone who's not me.

But there was a specific oversight, I felt, among other builders in the space: seamless, powerful migrations. I'd just come out of a real-time collaborative startup project, and I'd witnessed firsthand how difficult it can be to modify the data schema of such an app without either disrupting users or burdening the codebase with long-lived, if not unkillable, conditional 'migration' logic.

As I said, not a lot of people seemed to be paying attention to this problem at the time. A lot of focus was on bringing SQL into the browser, or the nuances of different types of CRDTs. I skipped SQL, learned the very barebones of CRDTs (and delivered a rather unsophisticated implementation), and spent my time thinking about migration.

[What that amounted to was a system I'm still fairly proud of.](./lofi-migrations). But along the way, well after I'd begun using Verdant in production, I've had several "oh, no" moments where I'm sitting in the shower and thinking about how to implement a new feature, only to suddenly realize... the whole thing is flawed. I'm sitting on a data corruption landmine.

When these moments happen I try to take a breath, step back, and think about the actual behavior of the system versus what I want the system to do. In my head I picture the banner hung behind Lee Byron's desk in the React documentary video, which reads, "You'll Think of Something." Corny and embarrassing, sure, but it helps.

![a still from the React documentary showing Lee sitting at a desk in front of a large black cloth banner embroidered with the words "You'll Think of Something" in white block letters](/images/idiosyncratic-engeering/youll-think-of-something.png)

The most recent of these was this past weekend, and of course it was the migration system I worked so hard on which suddenly felt like it would surely collapse at any moment. But rather than thinking of a new modification to the system to mitigate this newly realized risk, this time the resolution came a bit differently, and now I'm writing a blog post instead of code.

## Into the specifics

The concept I want to illuminate in this post is generalized, but the incident which inspired it is very specific. Rather than toss around generalities, I'll try instead to flesh out this one example as an illustration.

Verdant's migration system is versatile. From the start I wanted it to essentially be arbitrary code. Although Verdant documents are organized in schema-defined collections, a migration doesn't simply iterate over all documents in a collection and apply a transformation. It can, in fact, do any async logic you desire--including querying other data the same way your app does, creating or deleting documents, and even external stuff like making `fetch` requests or calling NPM libraries.

As is usual in the world of engineering, flexibility in this area presents tradeoffs in the assumptions the system is able to make about these migrations. Because migrations are so flexible and powerful, they can only really be run in very specific conditions--once per device, with all data from the previous version's database readily available, and without interruptions from external modifications to that data. These constraints turn out to be as limiting as the migrations themselves are _not_ limiting. That's just the way of things.

Migrations in a distributed, eventually-consistent system are tricky. In Verdant, _all_ changes to documents are represented as 'patches'--little messages which describe not the state of the object, but a change applied to _whatever its current state is_. Migrations are patches, just like everything else. The key insight, which as far as I know is unique to Verdant, was to place migration patches in a specific "virtual time window" which always falls between patches of the previous version, and patches of the next version. In real time, the migration might be applied whenever; but the timestamps produced by the migrator system will be restricted to this window.

![TODO: illustration]()

I'll try to summarize the logic behind this insight. In a non-distributed system, the point of a migration is to guarantee that data from the old format is properly and holistically converted to the new format before any logic dependent on the new format is performed. In a simple, single-node world, this is relatively trivial; you stop performing the old logic, migrate the data to the new format, and then proceed with the new logic.

In a distributed system, where nodes can be offline for extended periods but still operating, things get more difficult. A node which does not have the latest schema and logic is trapped in an alternate timeline where the new version doesn't yet exist, but the changes it is making are still ordered in real time _after_ the new version was officially 'deployed.' Other peers might already be thinking of their data in the new format and their latest patches will reflect that. Peer systems have diverged in their understanding of the data model.

What I essentially did was prepend the version number to timestamps as a first-position ordering factor. By wall clock time, an outdated peer on version 1 may be making concurrent changes with a new peer on version 2. But in _logical time_, according to my customized timestamps, the former peer's changes are always relegated to an 'era' before any changes from version 2.

This tradeoff sacrifices an intuitive 'real time' ordering of changes in the system to re-establish the migration guarantee that data will be in the proper format by the time a patch which assumes that format is applied. And in practice, this was a good tradeoff; users are rarely aware of the exact concurrent timing of their changes in relation to those of their peers, so muddling with the ordering isn't noticeable in most cases.

Migration changes are given a special ordering encoding; they are always sorted between the prior version and the next one. So, while all peers will run their own migrations on the same data locally, all of those changes get confined to the same 'era' between version 1 and 2. So long as migrations are idempotent, the multiple applications of these migration changes from each peer, when all squashed together in this 'era,' remain stable and predictable.

There are a few quirks which come with this system. One is that, while a version 2 peer may be able to receive and interpret version 1 changes arriving from an outdated peer, any version 2 changes it sends back are ignored. The two peers will see different states, and the older peer cannot possibly reconcile with the newer one until it upgrades. To account for this, I incorporated a "future seen" concept into the client, which the app developer observes and proactively prompts the user to upgrade their app to resolve the discrepancy.

The biggest edge case here is when an old peer has created _new_ documents in the old schema and those are synchronized to upgraded peers. Because migrations can only be applied once, against the entire database, those upgraded peers have already passed their migration window. Yet they now receive a new document which has not been migrated, and whose data format is likely incompatible with their upgraded logic. In such cases, the client notices the invalid state of the document and "prunes" it--preserving as much schema-valid data as it can, but nulling out or removing parts which can no longer be interpreted.

![TODO: pruning illustration]()

This is another compromise; a mere mitigation of an unfortunate system state. But it's also quite rare in practice. The additional complexity of pruning seemed a worthwhile engineering investment to at least gracefully handle this edge-case.

Once the "future seen" process has prompted the outdated peer to upgrade, that peer will run its own migrations on its new data, and this invalid state will be resolved and synchronized to other peers. The document will be un-pruned, and all is right with the world.

## The latest snag

As I was standing in the shower thinking about potentially updating my blog post detailing these migration systems, I had another 'cold epiphany' of realization that there was a flaw in the system.

What happens when an outdated peer has pushed new, invalid documents, and then gone offline--forever? Since it never upgrades its app logic to migrate these locally-originated documents to the new format, and never comes back to do it, won't those documents be stuck in pruned limbo indefinitely? What's worse, they can't even necessarily be deleted from the system; they might be so thoroughly pruned that other peers don't even see them to know to delete them.

This question haunted me for two days (You'll Think of Something). I weighed different ways I could add limitations to migration which would allow me to re-run migrations at arbitrary times, just for these pruned documents. But those limitations would restrict the freedom I found so valuable in the migration system. I began considering constraints on the order of operations during client startup--perhaps I could force the client to sync remote changes _before_ migrating, so that another living peer could have a chance to 'adopt' the invalid docs from the dead one before it ran its one-chance migration. But these constraints would have a negative impact on startup time, which honestly is already kind of slow.

But this latest idea made me realize something: because of a quirk in how the web works, my real-life system was already doing something very similar to that.

When a PWA (Portable Web App) updates its codebase, it doesn't necessarily happen all at once. The way I have my PWAs set up, the client code is all cached on-device. That means that even after I've released a new version of the code, the client always loads cache-first. For the first run of the app after the new version is released, the client still runs the prior version's code. Detecting the availability of the new version leads the app to prompt the user to upgrade, at which point the app is reloaded with the new code.

The key trait of this behavior which works in my advantage is this: while the client is still receiving the latest code and preparing to update, it's also syncing the latest changes to data from the server. In this case, the peer is still on version 1. It would receive all those new version 1 documents from the dead peer and store them, even as it prompts the user to upgrade the app to version 2. By the time the version 2 upgrade _actually_ happens, the extra changes are safe with the upgraded peer, and included in the migration.

## Is this ok?

Here's where I get nervous.
