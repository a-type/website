---
layout: '../../layouts/BlogPost.astro'
title: 'Compound index queries in IndexedDB'
description: 'hacking unicode for advanced querying'
pubDate: 'Dec 31 2022'
---

> lo-fi series
>
> 1. [The goal](/blog/lofi-intro)
> 2. [Sync](/blog/lofi-sync)
> 3. [Migrations](/blog/lofi-migrations)
> 4. [Index queries](/blog/lofi-storage)

A big part of my goal for creating a local-first data layer is to provide a great client-server sync library. But beyond that, I want provide a delightful interface over IndexedDB, our notoriously awkward web-native database.

IndexedDB has a very constrained feature set which makes it unintuitive to anyone used to SQL's extensive querying capabilities. As the name implies, IndexedDB only really offers _indexes_ - pre-computed bits of data which can quickly connect you to the matching objects. That means if you want to optimally look up data, you'll want to plan ahead and create relevant indexes.

So far my schema design is oriented around exposing easy ways to create useful indexes that help you query in a way that's intuitive and efficient. One of the most powerful ideas I've incorporated is compound indexes.

## Compound indexes

Compound indexes are a way to leverage how IndexedDB works (that is, its limitations) to still provide complex queries like "items tagged 'indexeddb' in ascending order of id." You might wonder how that can be done when the database only allows indexes to reference a single key, and only order by that key's property value!

The trick is to compute certain indexable properties before storing the object, structured in such a way that we can then lookup these values later using intuitive query semantics.

Let's model a simple compound query, "items in category 'development' in ascending order of id," on the following document schema:

```ts
interface Post {
  id: string;
  tags: string[];
  category: string;
  content: string;
  published: boolean;
}
```

First, before storing each Post, we write a new 'invisible' value to it for our synthetic index. But what do we write to it so we can query it like above? Since IndexedDB only allows ordering and limiting on the entire value (not a subset, like just filtering on 'category' but sorting on 'id'), we need to be thoughtful about the structure of our value.

```ts
const post = {
  id: cuid(),
  tags: ['react'],
  category: 'development',
  content: 'useEffect is back, baby!',
  published: false,
};

post.category_id = `${post.category}\uFFFFFE${post.id}`;
```

We have to think ahead to how we will use this index to decide how it's structured. For example, because we intend to filter on `category` and sort on `id`, category _must_ come first! We also choose a particular character as our separator - not because we need recognizably distinct sections (this value is not going to be read in our application), but because of the sorting properties of that character.

### The boundary character

I chose `\uFFFFFE` as the boundary character for constructing compound indexes for a few reasons:

1. It's unlikely this character will show up in an actual indexed value.
2. It's nicely far off to one side of the valid UTF-8 range. I think. I'm not an expert in character encoding.
3. It's not the largest UTF-8 character you can make, which is convenient.

This boundary character lets us construct an index value and then match blocks of those values later that contain a specific, contiguous, starting set of values.

In our example above, that means we can construct a range index query in IndexedDB to look up only the Posts with `category === 'development'` by asking for the following range:

```
('development\uFFFFFE\u0000', 'development\uFFFFFF') (exclusive)
```

Basically, we ask for items from (desired value)-(our separator)-(lowest possible value, never used) to (desired value)-(something bigger than our separator). Whatever lies in the middle of that range should be exclusively things which begin with (desired value)-(our separator)-! We've thus solved the problem of matching a subset of fields.

### Ordering

The final trick is to always put fields we want to order by at the end of our index value. If we do that, we can instruct IndexedDB on the traversal order, and we're good to go! The caveat is we can only order in one direction for all ordered values (you can't order ascending for id, and descending tiebreak on author name, etc). But at that granularity you may as well just sort in memory.

### Putting it all together

So the rules of our compound indexes create the following constraints to how they're defined and used:

- Order of specified indexed fields matters.
- When matching specific values, your values must all be taken from the start of the indexed fields list.
- You can only order in one direction for the whole query.
- You must order on all fields. You cannot exclude fields from the ordering.

This means how you define a compound index looks like this:

```
{ of: ['category', id'] }
```

and how you query it looks like this:

```
{ match: { category: 'development' }, order: 'asc' }
```

There's no point in specifying ordered properties since you have to sort on everything.

### Matching on multiple values: does it still work?

It might feel dicey to match on 2 or more values with this hacky index setup! Don't worry, it works. Here's why.

Consider a compound index `fieldA_fieldB_fieldC`, which we want to use to match `fieldA=foo` and `fieldB=bar` and sort by `fieldC, asc`. We would start by constructing the initial part of our index bound value:

```ts
'foo\uFFFFFEbar';
```

We want the upper and lower bound of the range of values which start with the above value, sorted ascending.

> While sorting ascending technically sorts the whole string, because the first parts will all be identical, we're logically sorting on `fieldC`.

We construct our lower and upper bounding values:

```ts
const lower = 'foo\uFFFFFEbar\uFFFFFE\u0000';
const upper = 'foo\uFFFFFEbar\uFFFFFF';
```

The important part is that we should not see any values starting with `foo1\uFFFFFE...` or `foo\uFFFFFEbaa...` or `foo\uFFFFFEzzz...` sneak in. How do we know they wont? Let's go through them case by case (and more cases than these are covered in tests).

1. `foo1\uFFFFFE...` is `<` our lower bound (character at index 3, `1`, is less than `\uFFFFFE`).
2. `foo\uFFFFFEbaa...` is `<` our lower bound (character at index 6, `a`, is less than `r`).
3. `foo\uFFFFFEzzz...` is `>` our upper bound (character at index 4, `z`, is more than `b`).

There are more nefarious cases, like weird unicode values, but the point is our boundary and lower/upper maximum values help ensure that the indexes are sorted correctly, even if the encoded values aren't the same length! As long as we only match values at the start of the index string.

### What about matching array values?

You might imagine a more complex query like the one that started out this section: "items tagged 'indexeddb' in ascending order of id." Such a query depends on a value being _in_ an array field.

Lucky for us, IndexedDB supports the tools needed to make this work! It allows indexes to be on arrays, such that any array value which matches the index will match the object.

So what we do is expand all of the values in our compound-indexed arrays into one big array with all the permutations. It can be a little expensive, but it works!
