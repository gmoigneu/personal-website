# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

Prerequisites: `nvm use 24`

```bash
pnpm dev          # Start dev server at localhost:4321
pnpm build        # Build production site to ./dist/
pnpm preview      # Preview production build locally
pnpm astro check  # Run TypeScript type checking
```

## Architecture

This is an Astro 5 blog using the official blog template with MDX and sitemap integrations.

### Content Collections

Blog posts live in `src/content/blog/` as Markdown or MDX files. The schema is defined in [src/content.config.ts](src/content.config.ts):
- `title` (required): Post title
- `description` (required): Post description for SEO
- `pubDate` (required): Publication date
- `updatedDate` (optional): Last update date
- `heroImage` (optional): Hero image with automatic optimization

### Key Files

- [src/consts.ts](src/consts.ts) - Site-wide constants (SITE_TITLE, SITE_DESCRIPTION)
- [astro.config.mjs](astro.config.mjs) - Astro configuration including the `site` URL for production
- [src/layouts/BlogPost.astro](src/layouts/BlogPost.astro) - Blog post layout template
- [src/pages/blog/[...slug].astro](src/pages/blog/[...slug].astro) - Dynamic route that generates pages from blog collection

### Routing

- `/` - Homepage ([src/pages/index.astro](src/pages/index.astro))
- `/blog` - Blog listing ([src/pages/blog/index.astro](src/pages/blog/index.astro))
- `/blog/:slug` - Individual blog posts (generated from content collection)
- `/about` - About page
- `/rss.xml` - RSS feed

### Styling

Global styles in [src/styles/global.css](src/styles/global.css). Component-scoped styles use `<style>` blocks within `.astro` files.
