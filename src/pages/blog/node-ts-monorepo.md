---
layout: '../../layouts/BlogPost.astro'
title: 'Building a Typescript + NodeJS Monorepo in 2024'
pubDate: 'Jan 18 2024'
---

It shouldn't be hard to build projects with Typescript in 2024 CE, but here we are.

I've spent years trying to find the holy grail of Typescript monorepos:

- Node servers and Vite web apps both work
- At dev time, all projects use Typescript source (NO watch mode transpiling)
- In prod, all projects use transpiled Javascript (NO `tsx` on production server)
- Isomorphic monorepo dependencies used by both server and web
- No dirty tricks

It turns out there's a semi-official, community convention for doing this already! It's supported by Node, Vite, Webpack, and most other tools.

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

No, you still can't (they do the same resolution!) But what you _can_ do is tell Node and Vite (or whatever tool you're using for web builds) to resolve things differently, using a configuration option you may have ignored as useless to you: custom conditions. We don't need tricks, we can use the tools as designed.

Custom conditions tells module resolution to accept your custom `export` conditions. We're going to use this to make Typescript and Node resolve modules differently, so that our projects resolve `.ts` files during dev time (when running via `tsx`) and `.js` files in production.

All that, and we won't need to hijack `import` anymore, either!

## Setting it up

I use conditions named `production` and `development`. [`production`/`development` is a community convention for sources only used in each environment.](https://nodejs.org/api/packages.html#community-conditions-definitions)

> **WARNING!** I am a full-blown ESM user. I don't really touch CJS anymore if I can help it. So most of this config is going to be ESM-oriented. You may need to make adjustments, like using `require` instead of `import` for fallback conditions. It's complicated...

### Update your monorepo dependencies

Add your new `exports` condition to your monorepo libraries for your Node server.

Your `package.json` `exports` will look like this:

```json
{
  "exports": {
    ".": {
      "production": "./dist/index.js",
      "development": "./src/index.ts",
      "default": "./dist/index.js"
    }
  }
}
```

You may need to adjust those file paths to match your actual project structure. For example, if your entry file is JSX, you'd want `import` to be `./src/index.tsx`. Or if your Typescript `tsconfig.json` has an `outDir` besides `dist`, replace it with yours. Or maybe you want to add some more export entrypoints.

### Update your `tsconfig.json`

We need to help Typescript resolve the `development` condition when it's doing typechecking. Since I use [Typescript config inheritance](https://www.typescriptlang.org/tsconfig#extends) I just updated my root config:

```json
{
  "compilerOptions": {
    //...
    "customConditions": ["development"]
  }
}
```

### For the Node server

In development mode, pass `--conditions=development` to whatever is running Node. For example, I use `tsx` to watch and recompile my Typescript server, and it passes flags on to Node under the hood, so I do this:

```json
{
  "scripts": {
    "dev": "tsx watch --conditions=development ./src/server.ts"
  }
}
```

For your production server, transpile all your sources and monorepo dependencies, then run Node against your JS files with the `conditions` flag, too:

```json
{
  "scripts": {
    "start": "node --conditions=production ./build/server.js"
  }
}
```

Make sure to build all packages before running your server in production mode, since it will be working with JS sources across all libraries.

### For Vite

You can supply conditions to Vite using the `resolve.conditions` configuration. We can supply different conditions for `development` and `production` mode, just like we do with Node.

```js
export default defineConfig(({ mode }) => ({
  // ...
  resolve: {
    conditions:
      mode === 'production'
        ? ['production', 'import', 'module', 'browser', 'default']
        : ['development', 'import', 'module', 'browser', 'default'],
  },
}));
```

Here I've prepended my custom condition for each mode onto the default list of conditions which Vite uses for module resolution.

When running Vite, I set an explicit mode just to be sure:

```json
{
	"scripts": {
		"dev": "vite --host --mode development",
		"build": "vite build --mode production",
```

Again, _be sure to transpile dependencies before building_ -- we've told Vite to look at the `production` condition for build mode, which points to the output JS files.

For example, in my Vercel config for my Vite app build, I've changed the build command to (remember this is a monorepo, hence `../..`):

```
cd ../.. && pnpm --filter @aglio/react... run build
```

PNPM knows that `@aglio/react...` means build all dependencies of the project before building the project.

### For NextJS (with Webpack config, at least)

I'm not on the cutting edge of NextJS, honestly their config kinda confuses me. But I know this at least works: I specify the conditions as part of the Webpack config.

```ts
const nextConfig = {
  //...
	webpack: (config, { dev, buildId }) => {
		config.resolve.extensionAlias = {
			'.js': ['.ts', '.tsx', '.js', '.jsx'],
			'.jsx': ['.ts', '.tsx', '.js', '.jsx'],
		};
		config.resolve.conditionNames = dev
			? ['development', 'import', 'module', 'default']
			: ['production', 'import', 'module', 'default'];
```

I'm not sure if the `extensionAlias` thing is still necessary, but I already had that around to help it resolve the TS sources from dependencies. Here I've also added `conditionNames` to Webpack's `resolve` config, again selecting on which environment I'm in to add a different condition as the first item.

### Other tools

What you need to look for is a way to specify "conditions" or "custom conditions" in your tool, and follow the `development` / `production` pattern.

Not all tools support these, unfortunately. If your tools can't be configured to accept conditions, you may need to fall back on my old hack: Hijack the `import` condition and use it for your TS sources.

## Show me an example

I'm doing this in my monorepo for my groceries and cooking app, [Gnocchi](https://github.com/a-type/gnocchi). It's open source, feel free to browse.

## If you publish any of your libraries, read this too

`production` and `development` are community standards, but even so, you may not want to leave them in your exports config if you publish any of your libraries to a registry.

Luckily I'm using PNPM, which supports `publishConfig` in `package.json`. `publishConfig` overrides the base config when publishing, which is perfect for undoing these conditions and providing a more typical exports config. So the `package.json` for a published module would look something like this:

```json
{
  "exports": {
    ".": {
      "production": "./dist/index.js",
      "development": "./src/index.ts",
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

Now we don't need to worry about anything strange happening because of our local development convenience tricks.

## One last thing

Perhaps you work alone, but it's always good to document uncommon configurations. I like to use _another_ hack to stick comments in `package.json`...

```json
{
  "exports": {
    ".": {
      "//": "This is our custom condition for Node to find our JS files. TS ignores it.",
      "production": "./dist/index.js",
      "///": "And this lets TS use our ts source files at dev time!",
      "development": "./src/index.ts",
```

Be a good citizen!

That's all, happy coding.
