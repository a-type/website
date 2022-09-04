---
layout: "../../layouts/BlogPost.astro"
title: "Building lofi: the goal"
description: "Part 1 on the internals of lofi, my local-first data framework."
pubDate: "Sep 3 2022"
heroImage: "/mariola-grobelska-n3JPNo11Aac-unsplash.jpg"
---

Over the past several years of my career I have developed a growing suspicion of scale.

I think it's neat how we can build such wide-reaching systems. And solving the problems that come with that can be very satisfying and introduce fascinating new concepts and ideas.

But ultimately, once the thrill of problem-solving wears off, those systems need to be maintained. And each new problem you solve has a risk of making the overall system just that much more complex. New services require new hardware, distribution, discovery, integration testing... and all of that requires teams full of specialized individuals. It's a testament to ingenuity and cooperation that we're able to make such systems work.

I find I thrive most when I can reason about a system in its entirety. Past a certain scale, that just isn't feasible. I can feel that moment coming, a shadow on the horizon, growing closer as each new feature is added.

The costs grow on two fronts: infrastructure and team size. Diminishing returns abound. Freedom to tweak and experiment becomes restricted. Returning to simplicity feels more and more out of reach.

It's not a bad thing, on the whole. It's not the end of the world. But it's always the end of an era, and I always miss that era.

When it comes to personal endeavors, I tend to bail when that shadow starts looming on the horizon. The threat of 'no going back' really kills my momentum. The point at which you're looking down the barrel of spending so much on infrastructure you either have to make revenue or seek funding (accelerating the loss of control). Taking money from people crosses a threshold. It's not something I feel I can ever take lightly.

I used to worry this was a lack of grit, a personal defect. That I was just not cut out to build things _for real_, only a dreamer.

But these days I try to listen more to my intuition.

# Local-first software

Local-first is not a new idea. It's still relatively new to the web, but we've been shipping software that interacts with local files or SQLite in other contexts as long as we've been shipping software.

Cloud-hosted web content has really changed user expectations, though. Syncing data to the cloud, quietly, without conflicts, is table stakes. Real-time interactions with others seems like a growing expectation as well, depending on the needs you're solving. Plus, multiplayer is just fun, it's great UX.

Writing to a local database isn't so bad, but these new baseline features are _hard_. They've got a lot of people completely rethinking how we architect and host software. From integrating CRDTs in high-scale cloud-hosted products, to building out globally distributed peer-to-peer data layers. A lot of these new ideas are really promising, but the complexity starts to undermine my hope for simplicity. It's fun to get something up and running on a peer-to-peer system like GunDB or IPFS. But -- and this may be just a personal limitation in my thinking -- once you decide to go full distributed and embrace cryptography as a hammer, the proliferation of nails is pretty daunting. I guess my experience is that trustless systems spend a lot of time, energy, and complexity solving problems inherent to their own design, unrelated to application goals.

# Looking for a simpler -- or at least more familiar -- model

I'm still in pursuit of something I can build and host myself. Something which embraces simplicity as much as possible for as long as possible. Something which won't steer me into a scale trap, costing more and more in time and money until I am forced to sacrifice control to keep the machine alive. Or at least stave off that moment as long as possible, allowing me to explore and experiment.

And in the principle of local-first, I'd love to have a system where local usage is free, for me and everyone else. A static webpage which provides the core of the product that I can host indefinitely for the cost of a domain name.

But simplicity is a difficult thing to accomplish. It requires a lot of focus, and often, compromise.

# Enter lofi

So I decided to begin from this commitment to simplicity, and identify priorities which would guide my implementation.

1. **Cloud syncing**: My devices should not have to be online concurrently to sync with each other.
2. **Storage friendly** Storage usage should grow and _shrink_ relative to the undeleted data I am storing (off-the-shelf CRDTs rarely provide this).
3. **Data ownership** 'Deleted' data should eventually be truly deleted.
4. **Traditionally authorized** Authentication should not be a concern of the data layer. Any authorization should have a trusted user identity to work with.
5. **Multiplayer-ready** Conflicts should be resolved automatically and instantly, within reason.

There are also common concerns of local-first or peer-to-peer data layers I explicitly did not want to deal with:

1. **I don't care about peer-to-peer.** In fact, I'd prefer to avoid it and solve fewer problems.
2. **I don't care about being able to rewind the history of an object**, outside of some N undo operations.
3. **I don't care about a client's experience if they have offline changes over N days old.** If you're offline that long, you can reset.
4. **I don't care about cross-system interoperability.** Keeping things simple, I want to design for building 1 small app at a time, not dreams of universal platforms.
5. **I definitely don't care about creating a global network** or coming up with ambitious pseudo-economies arranged around storing other people's data. I will store the data in SQLite on my server if you want sync. I want to make a little delightful product for you, I am not pursuing ambitions about inventing the next internet.

## Why these opinions?

I built lofi to solve my own problem: I wanted to create a small, friendly, _cheap_ web app which I could host indefinitely without getting sucked into a cycle of continual product growth in order to pay the bills. But I also didn't want to abandon more traditional client-server simplicity and complicate my life with the concerns of peer-to-peer highly distributed trustless systems. Something I could have full understanding and control of, which was as free as a webpage for local-only users, and as cheap as a single Node server for anyone who wanted sync or realtime features.

So that's what I'm building. I hope lofi is a humble but effective option if your needs are similar to mine.
