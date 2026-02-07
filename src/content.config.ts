import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: image().optional(),
		}),
});

const talks = defineCollection({
	loader: glob({ base: './src/content/talks', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			conference: z.string(),
			date: z.coerce.date(),
			status: z.enum(['upcoming', 'past']),
			conferenceUrl: z.string().url().optional(),
			slidesUrl: z.string().optional(),
			videoUrl: z.string().url().optional(),
			heroImage: image().optional(),
		}),
});

const publications = defineCollection({
	loader: glob({ base: './src/content/publications', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		source: z.string(),
		pubDate: z.coerce.date(),
		url: z.string().url(),
		featured: z.boolean().default(false),
	}),
});

export const collections = { blog, talks, publications };
