import { glob } from 'astro/loaders';
import { defineCollection } from 'astro:content';

const blog = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
});

const projects = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
});

export const collections = { blog, projects };
