---
layout: ../../layouts/BlogPost.astro
title: 'Solve the cause, not the effects'
description: 'At the risk of stating the obvious: it pays to care why things go wrong.'
pubDate: 2024-03-14
heroImage:
---

This post is basically going to expand upon a concept I think most software people intuit pretty early in our careers. But there's a difference between intuition and wisdom, and while I appreciate both, I think wisdom is more helpful. I'll propose a framework for going from intuition to wisdom as one of naming, examining, and expanding upon the subject of our intuitions. Systematizing them.

Here's the subject for this post: when you're altering a system to mitigate some unwanted behavior, _solve the cause, not (just) the effects_.

To demonstrate what I mean, let's contrive an example to study.

```js
function getRandomItem(list) {
  const index = randomInt(list.length);
  return list[index];
}
```

Here's a little function to grab a random item from a list. It utilizes another function called `randomInt`, which we can infer should return a randomized integer less than the provided parameter and greater than 0. Hopefully this code is pretty intuitive. In our imaginary app, we use this function to pick a random color for a new player joining the game from a list of colors.

Here's the problem: support just opened a ticket because players are complaining that most people in the game are blue, even though there are many possible colors.

You've got to debug the problem. So let's tinker with it to examine the issue a bit more.

```js
const colors = ['blue', 'green', 'red', 'yellow'];
const counts = {};
for (let i = 0; i < 100; i++) {
  const value = getRandomItem(colors);
  counts[value] = counts[value] || 0;
  counts[value]++;
}
console.log(counts);
// { blue: 90, green: 2, red: 5, yellow: 3 }
```

Woah, that's quite a discrepancy indeed! We need to get this fixed, so let's get clever.

See, it looks like the first item is somewhere around 30:1 more likely than the other items to get picked. Well, we can utilize that ratio to tweak our function...

```js
function getRandomItem(list) {
  // make 30 extra copies of every item except the first one,
  // because for some reason this is choosing the first one
  // 30x more often!
  const [first, ...rest] = list;
  const finalList = [
    first,
    ...rest.flatMap((item) => new Array(30).fill(item)),
  ];
  return finalList[randomInt(finalList.length)];
}
```

So clever! What talented software engineers we are!

Oh? You're curious what `randomInt` looks like? Well, I already pushed the fix to prod and I've started on my next task, but I guess we could take a look.

```js
function randomInt(max) {
  if (Math.random() < 1 / 3) {
    return 0;
  }
  return Math.floor(Math.random() * max);
}
```

This is silly, isn't it? Let's remove that `if` clause from `randomInt`! Why would someone even write that code?

Now, if the point of this post was that you should actually read the function that's behaving strangely in your codebase, it would be pretty silly indeed.

But here's the thing: we remove that `if`... and now several tests break.

A git blame reveals that `if` clause (and the tests) came from a PR with this description:

> Design says the placeholder graph during loading is too visually noisy, so I've altered the random generator to supply more zeroes and make it look more realistic to an actual game outcome.

This seems out of scope. Time to file it under tech debt in the backlog and keep moving.

(Side note: I know these contrived examples are very specific, but I'm not citing any real code here... I'm only channeling the spirit of this problem as I've seen it so, so many times...)

---

I have always been someone who loves the thrill of a bug-hunt like this. But I get the sense that not everyone does. I suppose there's a mental disconnect inherent in this kind of yak-shaving, and maybe that throws some people off. Like, "I took this task to fix players all getting blue, and now I'm supposed to fix a placeholder graph to accomplish that?"

I can see where it gets confusing, maybe even overwhelming. After all, the tests may be failing, but it's not the tests that need to be fixed (I've seen people try to 'fix' the tests in this kind of scenario, too). We've still got another layer of indirection to track down; we need to fix the _implementation_ of the thing those tests are testing. Even more layers!

I purposefully designed this example to be simple and easy to follow for the sake of making a readable argument, but in real life these rabbit holes are both deeper and twistier.

Here's my argument, though: if you don't do this work, your codebase is only going to get worse. I think we know that, but I'm here to shout _do the work anyway_.

Look at the code we walked away from this with, all laid out together:

```js
function randomInt(max) {
  if (Math.random() < 1 / 3) {
    return 0;
  }
  return Math.floor(Math.random() * max);
}
function getRandomItem(list) {
  const [first, ...rest] = list;
  const finalList = [
    first,
    ...rest.flatMap((item) => new Array(30).fill(item)),
  ];
  return finalList[randomInt(finalList.length)];
}
```

We were trying to pick a random item from a list.

The problem is not that this didn't solve the problem. The problem is precisely that this _did_ solve the **effects** of the problem. And that's not good enough!

At risk of stating the obvious, let's recap all of the adverse outcomes of this little exercise:

- Our code is less computationally efficient
- Our code is more complicated to understand
- Any other future (or current) user of `randomInt` is going to have to 'solve' this problem again
- Our 'solution' doesn't even fix the problem, it only estimates a fix. The first item will still show up more often, just maybe not noticeably so.

Just one small instance of only solving the _effects_ has multiplied our tech debt in a substantial way. And _every_ instance of this happening will do the same. Hit the same connected systems often enough and the rot only multiplies further.

Before you absolve yourself of this behavior, remember, this is a purposefully simplified, contrived example. The thing I'm gesturing at here exists in far more sinister permutations.

- When a third party library behaves in an unexpected way, do you read its source code to understand the root of the behavior? Or do you paper over it?
- When an API returns a strangely formatted response, do you track down the owning team and ask them about it? Or do you rework it into a more useful shape ad-hoc on the client?
- When you realize a state you need to represent is unrepresentable in the underlying database, do you modify the database's constraints or overhaul the entire model to support your requirements? Or do you approximate it and post-process the rest of the way?

I'm not saying we're lazy. There's a pervasive disincentive against this kind of work when you're working on a team, for a business, delivering planned work against deadlines.

But what I am saying is if we don't stand our ground a bit and dig into these causes, the rot will just keep happening. It's not enough to solve for the effects alone and call the job done.

Is it too dramatic of me to suggest that we may be due for a reckoning of code rot across the industry? Am I paranoid for seeing the effects of it seemingly everywhere, even in well-regarded software?

I'm fairly convinced this is the core issue at the source of so much tech debt and code rot today. We are not encouraged to dig in and deeply understand the systems we maintain. We're not well trained in how to do that investigative research (like tracing a source code change through Git to the PR and connected work item). We're not rewarded for doing it when we do put in the effort.

But a healthy codebase is its own reward. It could mean your life gets easier, less stressful overall. Fewer bugs to triage, fewer on-call incidents, less code to pick through in the codebase. It could even mean the survival of your business (tech debt can kill).

Not only that, but solving these problems builds craftsmanship and intuition about future problems. It helps you see one step down the road from the solution you're currently attempting to implement. After all, we don't want to _always_ be removing `if` blocks from `randomInt` functions. At some point, we want to have the wisdom to know that we need to put those special conditions within the domain of the specific implementation concerned with them in the first place. Then we won't have to fix anything later, our code will make more sense, and we can get on with our lives.

I believe software can be good. Maybe that's the bottom line here. I'm doing my best to internalize the lessons I need to learn to make it that way. _Solve the cause, not just the effect_ is one of them.
