import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import satori, { type Font } from 'satori';
import sharp from 'sharp';

const WIDTH = 1200;
const HEIGHT = 630;
const BACKGROUND = '#FDFCF9';
const INK = '#1A1A1A';
const ORANGE = '#FF6B35';

// Astro prerenders from the project root. Read source assets once, without network access.
const fontData = Promise.all([
	readFile(resolve('src/assets/social-fonts/Inter-Regular.ttf')),
	readFile(resolve('src/assets/social-fonts/PlayfairDisplay-SemiBold.ttf')),
]).then(([inter, playfair]): Font[] => [
	{ name: 'Inter', data: inter, weight: 400, style: 'normal' },
	{ name: 'Playfair Display', data: playfair, weight: 600, style: 'normal' },
]);
let portraitData: Promise<string> | undefined;

type CardNode = string | {
	type: string;
	key: string | null;
	props: Record<string, unknown>;
};

function element(type: string, props: Record<string, unknown>, ...children: CardNode[]) {
	return {
		type,
		key: typeof props.key === 'string' ? props.key : null,
		props: { ...props, children: children.length === 1 ? children[0] : children },
	};
}

function portrait() {
	return portraitData ??= readFile(resolve('src/assets/portrait.jpg'))
		.then((data) => `data:image/jpeg;base64,${data.toString('base64')}`);
}

function mark() {
	return element('div', {
		style: { display: 'flex', position: 'absolute', left: 64, top: 48,
			fontSize: 58, lineHeight: 1, letterSpacing: -5 },
	}, element('span', {}, 'G'), element('span', { style: { color: ORANGE } }, '/'));
}

function domain() {
	return element('div', {
		style: { display: 'flex', position: 'absolute', left: 64, bottom: 48, fontSize: 26, letterSpacing: -0.5 },
	}, 'guillaume.id');
}

function canvas(children: CardNode[]) {
	return element('div', {
		style: { display: 'flex', width: WIDTH, height: HEIGHT, position: 'relative',
			backgroundColor: BACKGROUND, color: INK, fontFamily: 'Inter', fontWeight: 400 },
	}, ...children);
}

async function homepage(fonts: Font[]) {
	return satori(canvas([
		mark(),
		element('div', {
			style: { display: 'flex', flexDirection: 'column', position: 'absolute', left: 64,
				top: 176, width: 620, fontFamily: 'Playfair Display', fontWeight: 600,
				fontSize: 86, lineHeight: 1.07, letterSpacing: -2 },
		}, element('div', { style: { display: 'flex' } }, 'Guillaume'), element('div', { style: { display: 'flex' } }, 'Moigneu')),
		element('div', {
			style: { display: 'block', position: 'absolute', left: 67, top: 399,
				width: 580, fontSize: 33, lineHeight: 1.36, letterSpacing: -0.5, whiteSpace: 'pre-wrap' },
		}, 'How people and teams\nput AI to work.'),
		element('img', {
			src: await portrait(), width: 380, height: 494,
			style: { display: 'flex', position: 'absolute', left: 756, top: 64, objectFit: 'cover', objectPosition: '50% 50%' },
		}),
		element('div', {
			style: { display: 'flex', position: 'absolute', left: 756, top: 558, width: 380, height: 8, backgroundColor: ORANGE },
		}),
		domain(),
	]), { width: WIDTH, height: HEIGHT, fonts });
}

async function article(title: string, fonts: Font[]) {
	// Measure the rendered font and wrapping, not character count. Never clip or silently shorten a title.
	for (let fontSize = 80; fontSize >= 36; fontSize -= 2) {
		let titleHeight = 0;
		const titleStyle = {
			display: 'block', width: 1072, fontFamily: 'Playfair Display', fontWeight: 600,
			fontSize, lineHeight: 1.14, letterSpacing: -1.4, wordBreak: 'break-word', textWrap: 'balance',
		};
		await satori(element('div', { key: 'measured-title', style: titleStyle }, title), {
			width: 1072, fonts,
			onNodeDetected(node) {
				if (node.key === 'measured-title') titleHeight = node.height;
			},
		});
		if (titleHeight <= 0 || titleHeight > 310) continue;

		const titleTop = 165 + (310 - titleHeight) / 2;
		return satori(canvas([
			mark(),
			element('div', {
				style: { ...titleStyle, position: 'absolute', left: 64, top: titleTop },
			}, title),
			element('div', {
				style: { display: 'flex', position: 'absolute', left: 67, top: titleTop + titleHeight + 28, fontSize: 27 },
			}, 'Guillaume Moigneu'),
			domain(),
			element('div', {
				style: { display: 'flex', position: 'absolute', right: 64, bottom: 61, width: 86, height: 6, backgroundColor: ORANGE },
			}),
		]), { width: WIDTH, height: HEIGHT, fonts });
	}
	throw new Error(`Social card title does not fit. Supply a shorter socialTitle for: ${title}`);
}

export async function renderSocialCard(title: string, kind: 'home' | 'article'): Promise<Buffer> {
	const fonts = await fontData;
	const normalizedTitle = title.replace(/\s+/gu, ' ').trim();
	if (kind === 'article' && !normalizedTitle) throw new Error('Social card title must not be empty.');
	const svg = kind === 'home' ? await homepage(fonts) : await article(normalizedTitle, fonts);
	return sharp(Buffer.from(svg)).png().toBuffer();
}
