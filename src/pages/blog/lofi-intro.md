---
layout: "../../layouts/BlogPost.astro"
title: "Building lofi: the goal"
description: "Part 1 on the internals of lofi, my local-first data framework."
pubDate: "Sep 3 2022"
heroImage: "/mariola-grobelska-n3JPNo11Aac-unsplash.jpg"
---

There are many ways to create distributed client-database apps. Here's what I prioritized.

1. My devices should not have to be online concurrently to reach consensus.
2. Storage usage should grow and _shrink_ relative to the undeleted data I am storing.
3. Deleted data should eventually be truly deleted everywhere.
4. Authentication should not be a concern of the data layer. Any authorization should have a trusted user identity to work with.
5. Conflicts should be resolved automatically.

There are also common concerns of local-first data layers I explicitly did not want to deal with:

1. I don't care about peer-to-peer. In fact, I'd prefer to avoid it and solve fewer problems.
2. I don't care about being able to rewind the history of an object, outside of some N undo operations.
3. I don't care about a client's experience if they have offline changes over N days old. If you're offline that long, you can reset.
4. I don't care about cross-system interoperability. Keeping things simple, I want to design for building 1 small app at a time, not dreams of universal platforms.
5. I definitely don't care about creating a global network or coming up with ambitious pseudo-economies arranged around storing other people's data. I will store the data in SQLite on my server if you want sync.

## Why these opinions?

I built lofi to solve my own problem: I wanted to create a small, friendly, _cheap_ web app which I could host indefinitely without getting sucked into a cycle of continual product growth in order to pay the bills. But I also didn't want to abandon more traditional client-server simplicity and complicate my life with the concerns of peer-to-peer highly distributed trustless systems. Something I could have full understanding and control of, which was as free as a webpage for local-only users, and as cheap as a single Node server for anyone who wanted sync or realtime features.

So that's what I built. lofi is a humble but effective option if your needs are similar to mine.
