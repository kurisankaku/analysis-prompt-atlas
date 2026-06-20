// src/content.config.ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { methodSchema } from './content/schema';

const methods = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/methods' }),
  schema: methodSchema,
});

export const collections = { methods };
