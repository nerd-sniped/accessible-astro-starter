import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
  type: 'content',
  format: 'mdx', // ✅ Enables .mdx support
  schema: z.object({
    title: z.string(),
    repo: z.string().url(),
    tags: z.array(z.string()),
    author: z.string().optional(),
    description: z.string().optional(),
  }),
});

export const collections = {
  projects,
};