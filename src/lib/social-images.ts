import { createHash } from 'node:crypto';
import type { ImageMetadata } from 'astro';
import { SITE_TITLE } from '../consts';

export interface SocialImage {
	src: string;
	width: number;
	height: number;
	type: string;
	alt: string;
}

// Bump when the card design, bundled fonts, or portrait changes.
const CARD_VERSION = '1';

export function generatedSocialImage(title: string, kind: 'home' | 'article'): SocialImage {
	const hash = createHash('sha256').update(`${CARD_VERSION}\0${kind}\0${title}`).digest('hex').slice(0, 16);
	return {
		src: `/social/${kind}-${hash}.png`,
		width: 1200,
		height: 630,
		type: 'image/png',
		alt: kind === 'home'
			? 'Guillaume Moigneu speaking, beside the words How people and teams put AI to work.'
			: `${title}. An article by Guillaume Moigneu on guillaume.id.`,
	};
}

export function defaultSocialImage(): SocialImage {
	return generatedSocialImage(SITE_TITLE, 'home');
}

export function articleSocialImage(post: {
	title: string;
	socialTitle?: string;
	socialImage?: { src: ImageMetadata; alt: string };
}): SocialImage {
	if (post.socialImage) {
		const { src: image, alt } = post.socialImage;
		return {
			src: image.src,
			width: image.width,
			height: image.height,
			type: image.format === 'jpg' ? 'image/jpeg' : `image/${image.format}`,
			alt,
		};
	}
	return generatedSocialImage(post.socialTitle ?? post.title, 'article');
}
