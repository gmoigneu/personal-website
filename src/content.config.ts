import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			summary: z.string().optional(),
			socialTitle: z.string().trim().min(1).max(180).optional(),
			socialImage: z.object({
				src: z.preprocess((value, ctx) => {
					const result = z.string().regex(/\.(png|jpe?g)$/i, 'Social images must use PNG or JPEG.')
						.refine((path) => path.startsWith('./') || path.startsWith('../'), 'Use a relative path to a local social image.')
						.safeParse(value);
					if (!result.success) {
						for (const issue of result.error.issues) ctx.addIssue({ code: 'custom', message: issue.message });
						return z.NEVER;
					}
					return result.data;
				}, image()),
				alt: z.string().trim().min(1),
			}).optional(),
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
			conferenceUrl: z.url().optional(),
			slidesUrl: z.string().optional(),
			videoUrl: z.url().optional(),
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
		url: z.url(),
		featured: z.boolean().default(false),
	}),
});

export const collections = { blog, talks, publications };
