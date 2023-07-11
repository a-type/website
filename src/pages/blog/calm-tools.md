---
layout: '../../layouts/BlogPost.astro'
title: 'Calm tools'
description: 'can software be better at helping us live without dictating how we do it?'
pubDate: 'July 10 2023'
heroImage: '/images/blog/\mitchell-luo-G5i9LQ7sPOw-unsplash.jpg'
---

My cooking app, [Gnocchi](https://gnocchi.club), does not help you find recipes.

There's no weekly newsletter, no hub for self-published recipes and comment boxes, no home feed to scroll.

At first, these things were on my roadmap. After all, a lot of cooking is deciding what to cook. Doesn't it make sense that the same app that helps you plan out grocery runs and organize your favorite recipes is _also_ the place you go to discover new ideas? Wouldn't it be cool to have great chefs posting their latest inventions in a foodie social network? Think of all the shares that might generate! User growth, engagement, success!

That progression may seem natural in our current tech product landscape, but it's really just one particular path. A framework, a worldview. And one which I am more and more consciously trying to avoid.

## Busy Technology

Nearly everything we interact with online is trying to acquire our attention. Cooking sites are a prime example of the phenomenon. You can't just have a grocery list, or a recipe keeper. It has to bother you to turn on notifications (why?), sign up for the daily newsletter of new recipes, scroll the infinite list of user-created content presented right on the homepage. The website is designed to keep you there, keep you scrolling, and the reason is as straightforward as it is painfully in your face: ads. Again, cooking spaces online excel (read: horrify) here. Instead of spending 10 minutes learning how to prepare the fresh green beans I got from my produce co-op, I'm stuck scrolling through paragraph after paragraph of how you met your spouse at the farmer's market while video after video obstructs half of my phone screen. Now the garlic is burning in the pan but I can't find the next step because the content layout shifted with a new batch of ads.

(Seriously, turn off your adblocker/pihole, open a food blog and watch the network tab of your devtools. The amount of ad traffic is wild.)

It's not at all that I blame the chefs for this, really. This is the way the technological ecosystem they operate in was designed. The incentives are encoded into the way we make websites, do business, and even think about what the internet _is._

But as a software developer and a tool maker, I'm grateful I have some power to forge a different path.

## Tool vs Lifestyle

The internet and smartphone era has shifted our understanding of software. Now, I'm out on a limb in saying that—I basically came of age on the internet, so I can only infer what it felt like to build and use software before, say, search engines. But my impression is that we began thinking of computers as a tool to help us implement existing life-processes (business procedures, hobbies, chores) more efficiently or effectively. Then, over the course of decades, we began thinking of computers as a medium to _re-invent_ those processes. Computing became a lifestyle.

How did we once connect with friends? Far enough back, it was visiting one another. Then, sending mail. Phones closed the loop even further. Texting, further still. It might be easy to plot social media along that trendline, but I think that somewhere between SMS and message boards, the _lifestyle_ shift began. Communication is no longer an event we initiate mutually with someone we know. Our friends feel 'present' all the time, through their feeds and stories and reels in our pocket. We can scroll endless feeds of communication, often with people we don't know, and join in anytime (think how _dead_ a social network would feel if it were only friends you knew IRL. Only like, a few posts an hour, how would you scroll??). But I think many folks feel that something has been lost for all that we gained.

For my part, I think about how we used to cook compared to how modern recipe websites want us to. There's not a huge difference in the general form of it. You seek out dish ideas, discover some publications you find some rapport with, and clip the recipes you want to try later. For my mom, this meant subscribing to cooking magazines which showed up in her mailbox each month. What does it look like for me? Realistically, it's googling the kind of dish I want to make and "recipe," then looking for a link to Bon Appetit or a food blog I've had good results from before, like [Cafe Delites](https://cafedelites.com/) (try the [baked honey garlic salmon](https://cafedelites.com/honey-garlic-butter-salmon-in-foil/)).

In principle these are fairly similar patterns of behavior, but things begin to diverge in terms of how our digital cooking tools have evolved. I've noticed over the years how a lot of cooking sites have created their own versions of a shopping list. Even on small food blogs, usually they're using a Wordpress plugin which offers to add the recipe ingredients to your grocery list. The problem here is obvious if you spend a lot of time browsing recipe sites: it's not the same list. Every publication or plugin has its own, separate list. The objective (cynically interpreted) is to try to lure you into a walled garden and incentivize you to visit that site more often than the others, since it's where your list is.

I don't know anyone who uses these things. Why would you? Why choose to tie your shopping list to AllRecipes? So what I used to do was just copy-paste things into Google Keep. It worked fine, plus my wife also had access to the list.

But it began to bug me how little software was helping me _perform my life tasks more efficiently and effectively._ My mom would jot down ingredients she needed on a pad of paper with the Cooking Light magazine open in front of her. Now I was arduously copy-pasting text from one app to another in my phone. Honestly, the notepad is probably easier. Recipe sites don't want to help me plan groceries like I want to, but better—they want me to adopt their lifestyle for how I cook and shop.

I'm not saying this is a malicious thing. Yes, there's the ad impressions incentive, but I don't think the kinds of people who painstakingly take beautiful photos of each step of a recipe are consciously doing it to lock me into their ecosystem and collect ad revenue. But that's the way the internet works these days, that's how you do business. They have to—right?

## Reclaiming Software as Tool

So I thought, maybe I can do this differently. I've built up a lot of skills I need to launch a web app over the years, and I love cooking and have some opinions about how I want to go about it. And since I've observed this anti-pattern at play, I also have a good shot at avoiding it if I'm careful about how I proceed.

That process eventually lead to Gnocchi, but first I had to create Verdant, my local-first web toolkit. To reinvent how web products work on a business level, I had to do a little re-invention of the technical level, too. Local-first is a burgeoning space with a lot of talented and creative builders, I'd recommend taking a look.

I go into this more at length elsewhere, but one of the core motivators for me going to local-first was sustainable "free trials" — software runs on the user's device, not my servers, so I can let people use it for free without running a deficit. This aligns the incentives for paying (access to server-powered features like sync and multiplayer) with my incentives as a maker (I don't have to buy server time unless people are paying me for it). Compare that to traditional cloud models, where every free user costs you money. It's a little simplistic, but **I think that misalignment is the source of a lot of the web's problems**, and drives the ad- (or data)-economy dysfunction which leads product managers to distort perfectly usable _tools_ into _lifestyle products_ and _ecosystems_ that keep your attention captive.

Meanwhile, I know two things:

- If you're using the app for free, that's great, keep doing that forever. No issue for me.
- If you're paying for more features, that's also great. One or two subscriptions keep the server online.

It might be harder for me to "scale" with this kind of model, but it puts me in a very nice spot for focusing on solving real user problems, because I'm not under existential pressure to pay cloud bills or raise the next round of funding.

**It also means I am not in the attention economy.** I gain nothing if you have my app open for hours at a time. Which is good, because this is a grocery list; the goal is efficiency! I don't want to have an incentive to keep the user in my app when what they're trying to do is get through the grocery store or finish preparing a weeknight dinner. [That would tempt me to make my product worse for my own gain.](https://en.wiktionary.org/wiki/enshittification)

## Turning Away from Engagement Addiction

When my incentives and my user's incentives are more aligned, I am empowered to respect their goals and process more—to adapt my tool to _them_, not try to adapt their behavior to my product.

In this case, I'm my own user. We have a lot of cookbooks in our house, full of a lot of recipes I've never tried. I want to cook some of them! So every once in a while I'll open one up and find something that sounds delicious. My problem really wasn't not being able to discover new recipes; they're everywhere! It was just getting them all in one place and pulling a grocery list together.

So, while it might increase 'engagement' to build that recipe social hub into my app, I eventually realized this was my "web as lifestyle" training speaking. Did I, the guy cooking dinner, really want a recipe social hub? Or was that just me, the guy who thinks "user engagement" is important for his app? I had to remind myself: I can keep this app going indefinitely. Nobody really _needs_ to spend their attention on it. It can just be a good tool, used when needed, invisible when not.

Will people find that worth paying for? I'm not really sure yet, but I suppose I'll find out. Either way, I'm happy with what I've created, and I use it every week. That feels great.

## Tools are Calm

Think about a hammer. Nothing about its appearance really grabs your attention. It doesn't have a notification chime to remind you to pick it up. There's no LCD screen to keep track of your total number of swings and award badges. The tool is there when you need it, crafted solely for its task. When we need a tool, we reach for it. And, as it happens, **the more we value a process, the more we invest in our tools.**

Tools like that are an example of a Calm Technology. Fit to their purpose, respectful of your objective, and demanding nothing else of you but to use them well. I hope as we continue to grapple with the busy, disruptive, demanding experiences we have created in this era of software, we can begin to reclaim a bit of that calm.
