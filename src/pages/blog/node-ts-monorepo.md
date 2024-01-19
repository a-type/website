---
layout: '../../layouts/BlogPost.astro'
title: 'Building a Typescript + NodeJS Monorepo in 2024'
pubDate: 'Jan 18 2024'
---

It shouldn't be hard to build projects with Typescript in 2024 CE, but here we are.

**I should warn you now - the technique I will outline is a slight hack. But it does work.**

I've spent years trying to find the holy grail of Typescript monorepos:

- Node servers and Vite web apps both work
- At dev time, all projects use Typescript source (NO watch mode transpiling)
- In prod, all projects use transpiled Javascript (NO `tsx` on production server)
- Isomorphic monorepo dependencies used by both server and web
- No dirty tricks\*

<sup>\* didn't _quite_ accomplish this, but close.</sup>

## What I was doing

You'd think this would be possible, right? Just like, use PNPM or something. Well, I do, and no, it didn't work. Here's the problem I had: I could get my app and server to point to TS source files of monorepo dependencies just fine, but it meant doing this to my library `package.json`s:

```json
{
  "exports": {
    ".": {
      "import": "./src/index.ts"
    }
  }
}
```

And this works great for dev mode. I use Vite to watch and bundle my web app, and I use `tsx` to watch and run my Node server using Typescript source. No problem so far.

But what happens when I want to build for production?

Vite handles this like a champ. It's a bundler, so it just consumes those source files as if they were in the app's own module. Everything gets munched together and spit out.

Node, on the other hand...

## The Node problem

To get my Typescript server running in Node when shipping to production, I want to transpile it to JS. Easy enough, just use `tsc`. Hey, it may not be the fastest out there, but I don't care.

Here's the issue--all those packages whose root `exports` I set to `.ts` source files so that dev mode works? `tsc` doesn't touch those. It outputs the transpiled `.js` files for my server's code, and does nothing else.

When I go to actually _run_ that JS code with Node, I get an error.

```
TypeError [ERR_UNKNOWN_FILE_EXTENSION]: Unknown file extension ".ts"
```

<sup>Perhaps Google indexed that and led you here. Hopefully you're having the same headache, because I did find a solution.</sup>

See, Node is taking my `package.json` `exports` at their word, and resolving my monorepo dependencies to their Typescript source files, which it can't read.

> I'm ashamed to admit it, but before I discovered the solution below, I spent a year running `tsx` on my prod server just so I wouldn't lose the development benefits of working with pure TS sources.

Yes, even if I build those libraries to JS, this still happens! In fact, I do that, as part of my server build process. But because the `"import"` export condition matches, Node uses that. [Typescript and Node use the exact same module resolution algorithms by design](https://www.typescriptlang.org/docs/handbook/modules/reference.html#the-moduleresolution-compiler-option:~:text=TypeScript%E2%80%99s%20implementation%20for%20resolving%20a%20module%20specifier%20through%20%22exports%22%20to%20a%20file%20path%20follows%20Node.js%20exactly.), so you can't be clever and get Typescript to resolve to `.ts` source and simultaneously trick Node into finding the `.js` instead by fancy arrangement of conditions.

## Or can you?

No, you still can't (they do the same resolution!) But what you _can_ do is tell Node to resolve things differently, using a CLI flag you may have ignored as useless to you:

```
node --conditions=prod ./build/server.js
```

The `--conditions` flag tells Node to accept your custom `export` conditions. We're going to use this to make Typescript and Node resolve modules differently, so that our server resolves `.ts` files during dev time (when running via `tsx`) and `.js` files in production (when running via `node --conditions prod`).

## Setting it up

I use a condition named `prod`, but you can name it whatever you like. I'd avoid naming it something that sounds official so no one gets confused.

Add your new `exports` condition to your monorepo libraries. **It needs to come first**. Export condition order matters; both Node and Typescript will try conditions in order. The behavior we want is that Node will try your custom condition first and use it, but Typescript won't recognize it and move on to the next one (`import`).

Your `package.json` `exports` will look like this:

```json
{
  "exports": {
    ".": {
      "prod": "./dist/index.js",
      "import": "./src/index.ts",
      "default": "./dist/index.js"
    }
  }
}
```

You may need to adjust those file paths to match your actual project structure. For example, if your entry file is JSX, you'd want `import` to be `./src/index.tsx`. Or if your Typescript `tsconfig.json` has an `outDir` besides `dist`, replace it with yours. Or maybe you want to add some more export entrypoints.

Make no changes to dev mode tools; they should ignore `prod` and continue using `import`, which points to Typescript sources.

For your server, update your `node` CLI usage to include `--conditions=prod`.

Make sure to build all packages before running your server in production mode, since it will be working with JS sources across all libraries.

## Show me an example

I'm doing this in my monorepo for my groceries and cooking app, [Gnocchi](https://github.com/a-type/gnocchi). It's open source, feel free to browse.

## If you publish any of your libraries, read this too

I would be remiss if I didn't warn you that I'm not using all the tools here as designed. `--conditions` is perfectly fine (I think), but the real hack here is pointing `imports` to Typescript sources.

If you publish your libraries to NPM or another registry, these exports are not correct for your users, who will expect `imports` to point to transpiled ESM Javascript files.

Luckily I'm using PNPM, which supports `publishConfig` in `package.json`. `publishConfig` overrides the base config when publishing, which is perfect for undoing our little hack. So the `package.json` for a published module would look something like this:

```json
{
  "exports": {
    ".": {
      "prod": "./dist/index.js",
      "import": "./src/index.ts",
      "default": "./dist/index.js"
    }
  },
  "publishConfig": {
    "exports": {
      ".": {
        "import": "./dist/index.js",
        "default": "./dist/index.js"
      }
    }
  }
}
```

Now ESM users can import your published library.

## One last thing

Perhaps you work alone, but it's always good to document hacks. I like to use _another_ hack to stick comments in `package.json`...

```json
{
  "exports": {
    ".": {
      "//": "This is our custom condition for Node to find our JS files. TS ignores it.",
      "prod": "./dist/index.js",
      "///": "And this lets TS use our ts source files at dev time!",
      "import": "./src/index.ts",
```

Be a good citizen!

That's all, happy coding.
