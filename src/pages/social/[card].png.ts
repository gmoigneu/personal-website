import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { SITE_TITLE } from '../../consts';
import { generatedSocialImage } from '../../lib/social-images';
import { renderSocialCard } from '../../lib/render-social-card';

export const getStaticPaths = (async () => {
	const posts = await getCollection('blog');
	const cards: { title: string; kind: 'home' | 'article' }[] = [
		{ title: SITE_TITLE, kind: 'home' },
		...posts.filter((post) => !post.data.socialImage).map((post) => ({
			title: post.data.socialTitle ?? post.data.title,
			kind: 'article' as const,
		})),
	];
	// Articles with the same display title can share the same rendered card.
	return [...new Map(cards.map((card) => {
		const id = generatedSocialImage(card.title, card.kind).src.split('/').pop()!.replace(/\.png$/, '');
		return [id, { params: { card: id }, props: card }];
	})).values()];
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
	const png = await renderSocialCard(props.title, props.kind);
	return new Response(new Uint8Array(png), {
		headers: { 'Content-Type': 'image/png' },
	});
};
