import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cp, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import sharp from 'sharp';

function metadata(html) {
	const values = new Map();
	for (const tag of html.match(/<meta\s[^>]*>/g) ?? []) {
		const attributes = Object.fromEntries([...tag.matchAll(/([\w:]+)="([^"]*)"/g)].map((match) => [match[1], match[2]]));
		values.set(attributes.property ?? attributes.name, attributes.content);
	}
	return values;
}

test('built pages publish valid branded cards and respect explicit overrides', async () => {
	const root = process.cwd();
	const temporary = await mkdtemp(path.join(tmpdir(), 'social-preview-'));
	try {
		// Fixtures never enter the working site or its deployment output.
		await cp(path.join(root, 'src'), path.join(temporary, 'src'), { recursive: true });
		for (const file of ['package.json', 'astro.config.mjs', 'tsconfig.json']) {
			await cp(path.join(root, file), path.join(temporary, file));
		}
		for (const directory of ['node_modules', 'public']) {
			await symlink(path.join(root, directory), path.join(temporary, directory), 'dir');
		}
		await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#AD3C16' } })
			.png().toFile(path.join(temporary, 'src/assets/social-override.png'));
		const fixtures = {
			'social-override-check': 'title: Custom preview\nsocialImage:\n  src: ../../assets/social-override.png\n  alt: A red test card\nheroImage: ../../assets/portrait.jpg',
			'social-hero-check': 'title: A hero image must not become the social preview\nheroImage: ../../assets/portrait.jpg',
			'social-title-check': 'title: A long article title that remains the page title\nsocialTitle: A shorter preview title',
			'social-long-check': `title: ${'A practical guide to building and operating reliable software with coding agents and clear human decisions across product discovery, validation, delivery, maintenance, and strategy'}`,
		};
		for (const [slug, frontmatter] of Object.entries(fixtures)) {
			await writeFile(path.join(temporary, `src/content/blog/${slug}.md`), `---\n${frontmatter}\ndescription: Social preview integration check\npubDate: 2026-09-10T12:00:00Z\n---\n\nArticle body stays visible.\n`);
		}
		try {
			execFileSync(process.execPath, [path.join(root, 'node_modules/astro/astro.js'), 'build'], {
				cwd: temporary,
				env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
				stdio: 'pipe',
			});
		} catch (error) {
			throw new Error(`Fixture build failed\n${error.stdout}\n${error.stderr}`, { cause: error });
		}
		const dist = path.join(temporary, 'dist');
		const home = metadata(await readFile(path.join(dist, 'index.html'), 'utf8'));
		assert.match(home.get('og:image'), /^https:\/\/guillaume\.id\/social\/home-[a-f0-9]+\.png$/);
		assert.ok(home.get('og:image:alt').includes('Guillaume Moigneu'));
		const articleImages = new Set();
		const pages = ['index.html', 'blog/index.html', 'whoami/index.html', 'talks/index.html', 'publications/index.html'];
		for (const entry of await readdir(path.join(dist, 'blog'), { withFileTypes: true })) {
			if (entry.isDirectory()) pages.push(`blog/${entry.name}/index.html`);
		}
		for (const page of pages) {
			const html = await readFile(path.join(dist, page), 'utf8');
			const meta = metadata(html);
			const imageURL = new URL(meta.get('og:image'));
			assert.equal(imageURL.origin, 'https://guillaume.id', page);
			assert.equal(meta.get('twitter:image'), imageURL.href, page);
			assert.equal(meta.get('twitter:image:alt'), meta.get('og:image:alt'), page);
			assert.ok(meta.get('og:image:alt')?.trim(), page);
			assert.equal(meta.get('twitter:card'), 'summary_large_image', page);
			assert.equal(meta.get('twitter:url'), meta.get('og:url'), page);
			assert.equal(new URL(meta.get('og:url')).origin, 'https://guillaume.id', page);
			assert.ok(!imageURL.pathname.includes('blog-placeholder'), page);
			const image = await sharp(path.join(dist, decodeURIComponent(imageURL.pathname))).metadata();
			assert.equal(image.width, Number(meta.get('og:image:width')), page);
			assert.equal(image.height, Number(meta.get('og:image:height')), page);
			assert.equal(meta.get('og:image:type'), `image/${image.format}`, page);
			if (meta.get('og:type') === 'article') {
				assert.notEqual(imageURL.href, home.get('og:image'), page);
				assert.ok(!articleImages.has(imageURL.href), `Distinct titles need distinct cards. ${page}`);
				articleImages.add(imageURL.href);
				assert.ok(html.includes(`"image":"${imageURL.href}"`), `Article structured data must agree. ${page}`);
			} else {
				assert.equal(imageURL.href, home.get('og:image'), page);
			}
			if (imageURL.pathname.startsWith('/social/')) {
				assert.equal(image.width, 1200, page);
				assert.equal(image.height, 630, page);
				assert.equal(image.format, 'png', page);
			}
		}
		const overrideHTML = await readFile(path.join(dist, 'blog/social-override-check/index.html'), 'utf8');
		const override = metadata(overrideHTML);
		assert.match(override.get('og:image'), /social-override/);
		assert.equal(override.get('og:image:alt'), 'A red test card');
		assert.match(overrideHTML, /<img[^>]*portrait/);
		const heroHTML = await readFile(path.join(dist, 'blog/social-hero-check/index.html'), 'utf8');
		assert.match(heroHTML, /<img[^>]*portrait/);
		assert.match(metadata(heroHTML).get('og:image'), /\/social\/article-/);
		const shorter = metadata(await readFile(path.join(dist, 'blog/social-title-check/index.html'), 'utf8'));
		assert.equal(shorter.get('og:title'), 'A long article title that remains the page title');
		assert.match(shorter.get('og:image:alt'), /^A shorter preview title\./);
	} finally {
		await rm(temporary, { recursive: true, force: true });
	}
});
