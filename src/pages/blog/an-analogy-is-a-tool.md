---
layout: ../../layouts/BlogPost.astro
title: An analogy is a tool
description: You can't escape complexity
pubDate: 2024-08-10
heroImage:
---

An analogy is a language tool we use to simplify the process of explaining a concept.

Comparing an analogy to a tool like I just did is an example of an analogy. I utilized your familiarity with the concept of a tool to reduce the amount of work I would need to do to explain what an analogy does.

That is, if you were already familiar with what what makes a tool _a tool_. If you had not previously reflected on 'tool' as a concept, and what separates it from other concepts, my analogy may not have been helpful. For example, if you are fixated on a hammer as the quintessential 'tool,' you might perhaps be left wondering what a 'language hammer' is, and perhaps what 'language nails' are, and what it means to swing an analogy. A hammer is too specific to substitute for 'tool,' here, and actually adds complexity to the process of understanding.

Most analogies are vulnerable to this problem, if not all of them. But most people are also familiar enough with how analogies function to navigate that ambiguity. They realize analogies are tools, and sometimes you use the claw end of a hammer to scrape the rust off something, and that's fine, you got there in the end.

Tools are like analogies. We use them to simplify a process.

But if you're going to use a tool effectively, it's important to recognize something: simplification is not necessarily the removal of complexity.

Remember, if your analogy refers to a concept with which your reader is not already familiar, or one which they have confused with a different concept, your analogy may either leak complexity, or cause additional complexity in the process of explanation!

For example, if I said "coming up with examples is like fishing, you have to set the bait and wait," and you had never been fishing, you may have to learn about how fishing works before you will understand the analogy. This process may be about as complex as if I had simply explained how it feels to come up with examples to you directly. This is _inherent complexity_, and it's unavoidable. A tool can't eliminate inherent complexity, but it can _encapsulate_ it, rearrange it, reapply it, and control how it is expressed. In the case of an analogy, it captures some of that complexity into the related concept and leverages your familiarity with that concept to bypass it in your experience of understanding.

On the other hand, if you thought "fishing" meant "being a fish," you might continue on with an inaccurate understanding of what it's like to come up with examples. At some point, if we continued building upon that concept, it would be necessary to go back and revisit that misunderstanding and correct it. This is _accidental complexity_, which is avoidable--even if it's not always anyone's fault. Accidental complexity can also be managed in such a way as to be beneficial.

To force a nail into some wood, it is _inherent_ that a force must be applied to it. Any solution to the problem will require the application of force. The most straightforward solution is to push on a nail with the requisite force. However, in most situations, this isn't feasible for a human to do without a tool.

A hammer is a tool which is designed to apply force to a nail, and it accomplishes this by incorporating accidental complexity into the process. It adds the complexity of the utilization of leverage and mass, which is inherent to its own design. Utilizing leverage and mass is not inherent to the nail problem, but it is effectively incorporated here, despite being more complex than simply pushing on the nail. The hammer adds complexity in order to overcome a limitation; namely the limitation of a human's inherent strength. The tool-user manages this additional complexity by learning _how to swing_ the hammer. A hammer is called _ergonomic_ because its complexities are relatively easy for the average person to manage with enough practice. The swinging motion leverages our existing intuition around swinging our arm. It's also possible for humans to offload this management to "muscle memory" and effectively minimize consciousness of it (using another very complex tool incorporated into our brain and nervous system).

A nailgun is another tool designed to apply force to a nail. It incorporates a fair bit more accidental complexity into that process. The nailgun utilizes this additional accidental complexity, as compared to the hammer, to _move_ complexity further away from the human operating it. The complex mechanical components of a nailgun are costly to produce and maintain, but it does simplify the process of setting a nail for the user by reallocating the complexity of both lining up and starting the nail, and swinging and aiming the hammer itself. It also absorbs the complexity of managing fatigue from repeatedly swinging the hammer. All of this accidental complexity, plus some more, is moved into the mechanics of the machine itself. The inherent complexity of applying force to the nail remains. But the process, from the user's perspective, has been simplified.

I am using these tools as examples of the general pattern of _tools_ (an example is a kind of analogy, which is a tool). I've noticed confusion regarding developers and our relationship with tools which I hope these examples can help to clarify.

Many developers seem to believe that tools can simplify the _inherent complexity_ of a problem. I do not believe this is meaningfully true. However, tools can help to rearrange this complexity to make the solution more _ergonomic_ for the user--i.e. to make it more reliant on the user's strengths, and reduce exposure to the user's weaknesses. This is often accomplished by adding additional complexity! But if a tool is crafted well, it leverages this added complexity efficiently to capitalize on ergonomics. In the world of physical tools, professionally trusted "power tools" are often the most complex in design, but they also move the most complexity of the task away from the usage. We should still expect our most powerful tools to make the experience of solving a problem feel simpler. But we should not pretend that they are simplifying the problem itself, nor be indignant if the tool is internally complex.

For example, human memory is often an inherent weakness. Not for everyone, but for most people. Tools which shift burden away from memory are often worth the extra complexity involved in their usage. Consider a "find" tool in your editor, for instance. This tool is quite a bit more complex than simply remembering every instance of where a symbol is in your codebase. It has to dynamically index files, store these indexed files in some particular format, and provide querying syntax for matching the correct patterns. Most find tools incorporate additional complexity to further shift burden away from memory; for example, by searching case-insensitive to allow you to forget what case the word was that you're looking for.

It would be rather foolish to call a find tool "overcomplicated" or imply the user of it is unskilled for not simply remembering things themselves. But imagine a person who only ever worked on a single, 50-line file. To such a person, learning to use a find tool might be quite frivolous indeed. This person would be inexperienced in the burden which the tool is designed to solve.

Now imagine another person who also spent all of their time on one single 50-line file. However, this person's code imports a different module, or set of modules, which collectively represent many thousands of additional lines of code. If this person was unaware that these imports referenced other lines of code, or if they were under the impression that the referenced code was irrelevant to them, they might similarly find no use for a find tool. However, that does not eliminate the inherent complexity of their system. They are either ignorant of it, or ignore it.

Suppose one day this person encounters an error with a specific symbol in their program. They search the 50-line file themselves, but do not find the referenced symbol. They now have three options:

They can ignore the error, blaming it on some unknowable and uncontrollable force,

They can begin manually combing through each code dependency referenced by their 50-line file for the problematic symbol,

Or, they can accept the usefulness of the find tool and adopt its usage.

It is an unfortunate phenomenon that many developers become quite proud of their disdain for certain types of tools, and so are forced to choose one of the first two options.

But an over-reliance on tools can also lead to accumulation of excess accidental complexity with no requisite benefit. A careful evaluation of essential complexity versus a tool's contributions to the management of that complexity is critical in selection of appropriate tools.

To return to the previous family of examples, imagine you were tasked with inserting a nail into a piece of soft foam. While a hammer would certainly be a viable option, it would not be an effective choice if you were not already very familiar with its operation and had learned to manage the accidental complexity of swinging it. For most people, the experience of solving this problem would be much simpler without a tool at all. This is not because the hammer made the problem more _inherently_ complex, but rather that the problem was already _inherently simple_, and the hammer's additional accidental complexity was not efficient in allocating the small amount of remaining complexity away from the user to justify its existence.

Likewise, if you were tasked with setting thousands of nails into very dense hardwood, a stubborn insistence on using a hammer is not exactly ridiculous (especially if you are very good with a hammer). But it would be rather ridiculous to scoff at the nailgun and deride its extra complexity as pointless.

Ultimately, it remains vital to be familiar with inherent complexity. Consider the wisdom of handing a nailgun to a user who is not familiar with the inherent complexity of driving a nail. It is very likely they will not only fail to effectively drive the nail as desired, but will actually harm themselves through misuse of the tool. A trip to the hospital will certainly add accidental complexity to your building project.

I don't feel this is a suitable conclusion, but I think I'm out of things to say on the subject.
