import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
  type: 'content',
  format: 'mdx', // ✅ Enables .mdx support
  schema: z.object({
    title: z.string(),
    repo: z.string().url().optional(),
    tags: z.array(z.string()).optional(),
    author: z.string().optional(),
    description: z.string().optional(),
  }),
});

export const collections = {
  projects,
};