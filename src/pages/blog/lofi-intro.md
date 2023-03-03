---
layout: '../../layouts/BlogPost.astro'
title: 'Towards small, local web apps'
description: "why I'm building a new system for web storage and sync"
pubDate: 'Sep 15 2022'
heroImage: '/images/blog/mariola-grobelska-n3JPNo11Aac-unsplash.jpg'
---

> lo-fi series
>
> 1. [The goal](/blog/lofi-intro)
> 2. [Sync](/blog/lofi-sync)
> 3. [Migrations](/blog/lofi-migrations)

Over the past several years of my career I have developed a growing suspicion of scale.

I think it's great that we can build such wide-reaching systems. And solving the problems that come with that can be very satisfying and introduce fascinating new concepts and ideas.

But ultimately, once the thrill of problem-solving wears off, those systems need to be maintained. And each new problem you solve has a risk of making the overall system just that much more complex. New services require new hardware, distribution, discovery, integration testing... and all of that requires teams full of specialized individuals. It's a testament to ingenuity and cooperation that we're able to make such systems work.

I find I thrive most when I can reason about a system in its entirety. Past a certain scale, that just isn't feasible. I can feel that moment coming, a shadow on the horizon, growing closer as each new feature is added.

The costs grow on two fronts: infrastructure and team size. Diminishing returns abound. Freedom to tweak and experiment becomes restricted. Returning to simplicity feels more and more out of reach.

It's not a bad thing, on the whole. It's not the end of the world. But it's always the end of an era, and I always miss that era.

When it comes to personal endeavors, I tend to bail when that shadow starts looming on the horizon. The threat of 'no going back' really kills my momentum. The point at which you're looking down the barrel of spending so enough on that hobby project you either have to make revenue or seek funding (accelerating the loss of control). Taking money from people crosses a threshold. It's not something I feel I can ever take lightly.

I used to worry this was a lack of grit, a personal defect. That I was just not cut out for building things _for real_, just dreaming.

But these days I try to listen more to my intuition.

# Local-first software

My intuition says that what I want should be possible. Sitting with that a bit, I've realized the obvious truth I hide from myself: I'm a habitual over-engineerer, too easily swayed by systems which, while beautiful in their own way, I will never need to utilize. I even bothered to learn Kubernetes!

It's time to reset how I build. In the web we have an amazing, free, powerful distribution tool for local software. How much can I get done with just a webpage? And, after that, what would it take to incorporate modern table-stakes like sync or realtime collaboration? Do these things really require globally distributed servers, pub/sub channels to connect them all, database replicas, all that?

Local-first software is not a new idea. It's still relatively new to the web, but we've been shipping software that interacts with local files or SQLite in other contexts for ages. I'm kind of jealous of mobile apps.

Cloud-hosted web content has really changed user expectations, though. Syncing data to the cloud, quietly, without conflicts, is table stakes. Real-time interactions with others seems like a growing expectation as well, depending on the needs you're solving. Plus, multiplayer is just fun, it's great UX.

Writing to a local database isn't so bad, but these new baseline features are _hard_. They've got a lot of people completely rethinking how we architect and host software. From integrating CRDTs in high-scale cloud-hosted products, to building out globally distributed peer-to-peer data layers. A lot of these new ideas are really promising, but the scale of their proposed solutions starts to undermine my hope for simplicity.

For example, in the peer-to-peer realm. It's fun to get something up and running on a system like GunDB or IPFS. But -- and this may be just a personal limitation in my thinking -- once you decide to go full distributed and embrace cryptography as a hammer, the proliferation of nails is pretty daunting. I guess my experience is that trustless systems spend a lot of time, energy, and complexity solving problems inherent to their own design, unrelated to application goals.

Meanwhile you can certainly use CRDTs in a more traditional setup, and many do. But there seem to be tradeoffs in most CRDT implementations I've dug into which rub me the wrong way -- specifically, unbounded growth of data storage. Right now I'm building a [grocery list app](https://aglio.gfor.rest), and the whole point of it is to check off items and feel the satisfaction of deleting them, of completing your list. Knowing those deleted items might remain 'tombstoned' but stored indefinitely makes me uneasy. It could be I'm just ignorant of how that process works... in fact, it's likely, since CRDTs are quite complicated. It's hard to justify why I turn away from CRDTs as a general solution, but I think my gut feeling on this is that generic CRDT work seems to aim to be useful in a wider range of scenarios than I need, and those kinds of constraints always introduce trade-offs in complexity or features.

And anyway, I can't learn and know everything before pushing forward. I decided to draw the line somewhere. It's in my nature to build in order to learn. And I felt that if I could apply a few important constraints to this problem, I could produce a solution that works much better for me than what I've seen so far.

# Looking for a simpler -- or at least more familiar -- model

So I took inventory of my needs.

I'm still in pursuit of something I can build and host myself. Something which embraces simplicity as much as possible for as long as possible. Something which won't steer me into a scale trap, costing more and more in time and money until I am forced to sacrifice control to keep the machine alive. Or at least stave off that moment as long as possible, allowing me to explore and experiment.

I also want to avoid unknown unknowns as much as I can. Of course, the point is they're 'unknown,' right? Avoiding something you can't anticipate is a matter of strategy, I think. I choose to take a pass on emerging paradigms, like peer-to-peer, in favor of paradigms where at least some of my problems (like authentication and identity) are so thoroughly solved it's boring.

And in the principle of local-first, I'd love to have a system where local usage is free, for me and everyone else. A static webpage which provides the core of the product that I can host indefinitely for the cost of a domain name. It's such a nice feeling to imagine that people who want to can still use my software even if I can't manage to make it work as a hosted service business.

Simplicity is a difficult thing to accomplish. It requires a lot of focus, and often, compromise.

# Creating lofi

So I decided to begin from these ideas, combine it with my product goals for [Aglio](https://aglio.gfor.rest), and identify priorities which would guide my implementation.

1. **Cloud syncing**: My devices should not have to be online concurrently to sync with each other.
2. **Storage friendly** Storage usage should grow and _shrink_ relative to the undeleted data I am storing. 'Deleted' data should eventually be truly deleted.
3. **Traditionally authorized** Authentication should not be a concern of the data layer. Any authorization should have a trusted user identity to work with.
4. **Multiplayer-ready** Conflicts should be resolved automatically and instantly, within reason.

There are also common concerns of local-first or peer-to-peer data layers I explicitly did not want to deal with:

1. **I don't care about peer-to-peer.** In fact, I'd prefer to avoid it and solve fewer problems.
2. **I don't care about being able to rewind the history of an object**, outside of some N undo operations.
3. **I don't care about a client's experience if they have offline changes over N days old.** If you're offline that long, you get a bad merge or a full reset.
4. **I don't care about cross-system interoperability.** Keeping things simple, I want to design for building 1 small app at a time, not dreams of universal platforms.
5. **I definitely don't care about creating a global network** or coming up with ambitious pseudo-economies arranged around storing other people's data. I will store the data in SQLite on my server if you want sync. I want to make a little delightful product for you, I am not pursuing ambitions about inventing the next internet.

## Why these opinions?

I've built a prototype system to solve my own problem: I wanted to create a small, friendly, _cheap_ web app which I could host indefinitely without getting sucked into a cycle of continual product growth in order to pay the bills. But I also didn't want to abandon more traditional client-server simplicity and complicate my life with the concerns of peer-to-peer highly distributed trustless systems. Something I could have full understanding and control of, which was as free as a webpage for local-only users, and as cheap as a single Node server for anyone who wanted sync or realtime features.

So that's what I'm building. I hope I can release it in a reusable set of packages soon!

## But really, why?

It's easy, as someone who believes I'm a capable designer of systems, who wants to be respected for my technical work, to act like this is all an intellectual pursuit.

But you may have picked up throughout this post that a lot of my impetus here is entangled with anxiety. I worry about shipping products. Taking money makes me feel obligated, responsible, constrained. And yet there's nothing I want more than the freedom which I hope making a business for myself out of my skills could provide. It's a confounding position to be in.

All this leads to an incredibly lean, bootstrapping mindset for me. I want to create small things that provide as much value as they can with a limited footprint. Services that won't eat away at the very life I'm trying to create by evolving into complicated, 'web-scale' monsters hungry for VC cash.

I also have anxiety about the sustainability of my work, and what happens if my costs become more than I can recoup. So I'm almost pathologically avoiding paid tools and services. Ideally if I wanted to put a project aside for months, or if it were drawing no revenue at all, these would not present do-or-die choices to me. I could step away, rest, think, reinvent.

But perhaps the biggest threat of all to me is what I call the 'scale trap,' as I alluded to at the outset. I do eventually want to ramp up my own work to become a meaningful source of income. But doing that requires serving a lot of users. The more it costs me to add one user, the more I have to charge them. The more I charge them, the more usefulness I have to provide. The more usefulness I have to provide, the more scope I have to add to the product. It seems to me that there is a line which you cross, after which growth is compulsory. It's an exhausting concept.

I don't really want to maximize profits, to be honest. I don't want to be beholden to stakeholders or investors. If I could sell a small product, for a small price, to a small number of people, and still make enough to live on... that would be great. Build things I think are meaningful, make as much as I need, and spend the rest of my time and energy on living.

My latest work is an experiment toward that end. It exists, not just because of what I think, but what I feel. What I hope for.
