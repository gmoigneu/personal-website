// @ts-check

import mdx from '@astrojs/mdx';
import { satteri } from '@astrojs/markdown-satteri';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import GithubSlugger, { slug } from 'github-slugger';

// https://astro.build/config
export default defineConfig({
	site: 'https://guillaume.id',
	// Preserve HTML-aware inline spacing from Astro 5.
	compressHTML: true,
	markdown: {
		processor: satteri({
			hastPlugins: [() => {
				const slugger = new GithubSlugger();
				return {
					name: 'astro-5-heading-ids',
					element: {
						filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
						visit(node, ctx) {
							if (typeof node.properties?.id === 'string') return;
							// Keep published anchors unchanged when a heading ends with an emoji.
							const base = slug(ctx.textContent(node)).replace(/-$/, '');
							ctx.setProperty(node, 'id', slugger.slug(base));
						},
					},
				};
			}],
		}),
	},
	integrations: [mdx(), sitemap()],
	vite: {
		plugins: [tailwindcss()],
	},
});
