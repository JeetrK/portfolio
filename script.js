const imageFiles = [
	"Array Practice.png",
	"Calculator and Java Practice.png",
	"Client Project.png",
	"College Website.png",
	"gallery1.png",
	"Hangman.png",
	"Holiday Game Project.png",
	"JSON Practice.png",
	"Madlib.png",
	"Magic 8 Ball.png",
	"Medieval Name Generator .png",
	"Mock Client Project.png",
	"NJIT-Project.png",
	"President Project.png",
	"Problem Solving Project.png",
	"Rock Paper Scissors.png",
	"Roster Project.png"
];

const stackStage = document.querySelector("#stack-stage");
const stackProgress = document.querySelector("#stack-progress");
const stackSection = document.querySelector(".stack-scroll");
const SCROLL_KEYS = new Set([
	"ArrowDown",
	"ArrowUp",
	"PageDown",
	"PageUp",
	" ",
	"Spacebar"
]);
const TOUCH_STEP_THRESHOLD = 40;
const SECTION_STEP_VH = 85;
const PALETTE_SAMPLE_SIZE = 24;

function createBackgroundLayers() {
	const host = document.createElement("div");
	host.className = "bg-transition";
	host.innerHTML = `
		<div class="bg-theme bg-theme--a is-active"></div>
		<div class="bg-theme bg-theme--b"></div>`;
	document.body.prepend(host);
	return {
		host,
		themes: Array.from(host.querySelectorAll(".bg-theme"))
	};
}

let cards = [];
let dots = [];
const background = createBackgroundLayers();
const backgroundLayers = background.themes;

const fallbackPalette = {
	accent: { r: 113, g: 250, b: 255 },
	base: { r: 12, g: 18, b: 30 },
	shadow: { r: 4, g: 6, b: 12 }
};

const state = {
	current: 0,
	target: 0,
	max: 0,
	reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
	isStepping: false,
	touchStartY: 0,
	activeThemeIndex: -1,
	activeThemeLayer: 0
};

function getTitleFromFilename(fileName) {
	return fileName.replace(/\.[^.]+$/, "").trim();
}

function clamp(value, min, max) {
	return Math.min(Math.max(value, min), max);
}

function mix(start, end, amount) {
	return start + (end - start) * amount;
}

function mixColor(colorA, colorB, amount) {
	return {
		r: Math.round(mix(colorA.r, colorB.r, amount)),
		g: Math.round(mix(colorA.g, colorB.g, amount)),
		b: Math.round(mix(colorA.b, colorB.b, amount))
	};
}

function toCssColor(color, alpha = 1) {
	return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
}

function rgbToHsl(color) {
	const red = color.r / 255;
	const green = color.g / 255;
	const blue = color.b / 255;
	const max = Math.max(red, green, blue);
	const min = Math.min(red, green, blue);
	const lightness = (max + min) / 2;

	if (max === min) {
		return { h: 0, s: 0, l: lightness };
	}

	const delta = max - min;
	const saturation = lightness > 0.5
		? delta / (2 - max - min)
		: delta / (max + min);

	let hue = 0;

	switch (max) {
		case red:
			hue = (green - blue) / delta + (green < blue ? 6 : 0);
			break;
		case green:
			hue = (blue - red) / delta + 2;
			break;
		default:
			hue = (red - green) / delta + 4;
	}

	return {
		h: hue / 6,
		s: saturation,
		l: lightness
	};
}

function getImagePalette(image) {
	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d", { willReadFrequently: true });

	if (!context || !image.naturalWidth || !image.naturalHeight) {
		return fallbackPalette;
	}

	canvas.width = PALETTE_SAMPLE_SIZE;
	canvas.height = PALETTE_SAMPLE_SIZE;

	try {
		context.drawImage(image, 0, 0, PALETTE_SAMPLE_SIZE, PALETTE_SAMPLE_SIZE);
	} catch {
		return fallbackPalette;
	}

	const { data } = context.getImageData(0, 0, PALETTE_SAMPLE_SIZE, PALETTE_SAMPLE_SIZE);
	let accentWeight = 0;
	let baseWeight = 0;
	let shadowWeight = 0;
	const accent = { r: 0, g: 0, b: 0 };
	const base = { r: 0, g: 0, b: 0 };
	const shadow = { r: 0, g: 0, b: 0 };

	for (let index = 0; index < data.length; index += 4) {
		const alpha = data[index + 3] / 255;

		if (alpha < 0.4) {
			continue;
		}

		const color = {
			r: data[index],
			g: data[index + 1],
			b: data[index + 2]
		};
		const hsl = rgbToHsl(color);
		const lightnessBias = 1 - Math.min(Math.abs(hsl.l - 0.52) / 0.52, 1);
		const vividWeight = alpha * (0.4 + hsl.s * 1.8 + lightnessBias * 0.8);
		const surfaceWeight = alpha * (0.35 + (1 - Math.abs(hsl.l - 0.38)) * 0.65);
		const shadowMix = mixColor(color, fallbackPalette.shadow, 0.58);
		const shadowPixelWeight = alpha * (0.5 + (1 - hsl.l) * 1.2);

		accent.r += color.r * vividWeight;
		accent.g += color.g * vividWeight;
		accent.b += color.b * vividWeight;
		accentWeight += vividWeight;

		base.r += color.r * surfaceWeight;
		base.g += color.g * surfaceWeight;
		base.b += color.b * surfaceWeight;
		baseWeight += surfaceWeight;

		shadow.r += shadowMix.r * shadowPixelWeight;
		shadow.g += shadowMix.g * shadowPixelWeight;
		shadow.b += shadowMix.b * shadowPixelWeight;
		shadowWeight += shadowPixelWeight;
	}

	if (!accentWeight || !baseWeight || !shadowWeight) {
		return fallbackPalette;
	}

	return {
		accent: {
			r: Math.round(accent.r / accentWeight),
			g: Math.round(accent.g / accentWeight),
			b: Math.round(accent.b / accentWeight)
		},
		base: mixColor({
			r: Math.round(base.r / baseWeight),
			g: Math.round(base.g / baseWeight),
			b: Math.round(base.b / baseWeight)
		}, fallbackPalette.base, 0.42),
		shadow: mixColor({
			r: Math.round(shadow.r / shadowWeight),
			g: Math.round(shadow.g / shadowWeight),
			b: Math.round(shadow.b / shadowWeight)
		}, fallbackPalette.shadow, 0.25)
	};
}

function applyCardTheme(card, palette) {
	card.style.setProperty("--card-accent", toCssColor(palette.accent, 0.34));
	card.style.setProperty("--card-accent-strong", toCssColor(palette.accent, 0.8));
	card.style.setProperty("--card-surface", toCssColor(palette.base, 0.97));
	card.style.setProperty("--card-surface-soft", toCssColor(mixColor(palette.base, palette.accent, 0.16), 0.94));
	card.style.setProperty("--card-shadow", toCssColor(palette.shadow, 0.7));
	card.style.setProperty("--card-label-bg", toCssColor(mixColor(palette.shadow, palette.base, 0.45), 0.62));
}

function setBackgroundLayerTheme(layer, palette, index) {
	const glowLeft = mixColor(palette.accent, { r: 255, g: 255, b: 255 }, 0.08);
	const glowRight = mixColor(palette.accent, palette.base, 0.25);
	const glowBottom = mixColor(palette.base, { r: 255, g: 215, b: 140 }, 0.15);
	const bgStart = mixColor(palette.shadow, palette.base, 0.4);
	const bgMid = mixColor(palette.base, palette.accent, 0.18);
	const bgEnd = mixColor(palette.shadow, { r: 0, g: 0, b: 0 }, 0.35);
	const orbit = 18 + (index % 5) * 7;
	const rotation = `${(index % 2 === 0 ? 1 : -1) * (10 + index * 3)}deg`;
	const angle = `${35 + index * 22}deg`;

	layer.style.setProperty("--theme-spot-1", toCssColor(glowLeft, 0.26));
	layer.style.setProperty("--theme-spot-2", toCssColor(glowRight, 0.22));
	layer.style.setProperty("--theme-spot-3", toCssColor(glowBottom, 0.18));
	layer.style.setProperty("--theme-start", toCssColor(bgStart));
	layer.style.setProperty("--theme-mid", toCssColor(bgMid));
	layer.style.setProperty("--theme-end", toCssColor(bgEnd));
	layer.style.setProperty("--theme-ring-1", toCssColor(mixColor(palette.accent, palette.base, 0.15), 0.18));
	layer.style.setProperty("--theme-ring-2", toCssColor(mixColor(palette.accent, { r: 255, g: 255, b: 255 }, 0.24), 0.12));
	layer.style.setProperty("--theme-ring-3", toCssColor(mixColor(palette.base, palette.shadow, 0.22), 0.16));
	layer.style.setProperty("--theme-angle", angle);
	layer.style.setProperty("--theme-orbit", `${orbit}%`);
	layer.style.setProperty("--theme-rotation", rotation);
}

function applyPageTheme(index) {
	if (index === state.activeThemeIndex || !cards[index]) {
		return;
	}

	const palette = cards[index].palette || fallbackPalette;
	const nextLayerIndex = state.activeThemeLayer === 0 ? 1 : 0;
	const nextLayer = backgroundLayers[nextLayerIndex];
	const currentLayer = backgroundLayers[state.activeThemeLayer];

	setBackgroundLayerTheme(nextLayer, palette, index);
	nextLayer.classList.add("is-active");
	currentLayer.classList.remove("is-active");
	state.activeThemeLayer = nextLayerIndex;
	state.activeThemeIndex = index;
}

function hydrateCardPalette(card) {
	const image = card.querySelector(".stack-card__image");

	if (!image) {
		return;
	}

	const updatePalette = () => {
		const palette = getImagePalette(image);
		const cardIndex = Number(card.dataset.index);
		card.palette = palette;
		applyCardTheme(card, palette);

		if (cardIndex === clamp(Math.round(state.current), 0, state.max)) {
			state.activeThemeIndex = -1;
		}

		applyPageTheme(clamp(Math.round(state.current), 0, state.max));
	};

	if (image.complete && image.naturalWidth) {
		updatePalette();
		return;
	}

	image.addEventListener("load", updatePalette, { once: true });
}

function buildStack() {
	const cardsMarkup = imageFiles.map((fileName, index) => {
		const title = getTitleFromFilename(fileName);

		return `
			<div class="stack-card" data-index="${index}">
				<div class="stack-card__label">${title}</div>
				<div class="stack-card__media">
					<img class="stack-card__image" src="imgs/${encodeURIComponent(fileName)}" alt="${title}">
				</div>
			</div>`;
	}).join("");

	const dotsMarkup = imageFiles.map((_, index) => (
		`<span class="stack-progress__dot${index === 0 ? " is-active" : ""}"></span>`
	)).join("");

	stackStage.innerHTML = cardsMarkup;
	stackProgress.innerHTML = dotsMarkup;

	cards = Array.from(document.querySelectorAll(".stack-card"));
	dots = Array.from(document.querySelectorAll(".stack-progress__dot"));
	state.max = Math.max(cards.length - 1, 0);
	cards.forEach(hydrateCardPalette);
}

function setActiveDot(index) {
	dots.forEach((dot, dotIndex) => {
		dot.classList.toggle("is-active", dotIndex === index);
	});
}

function getSectionMetrics() {
	const sectionTop = stackSection.offsetTop;
	const stepDistance = window.innerHeight * (SECTION_STEP_VH / 100);
	const maxScroll = stepDistance * state.max;

	return {
		sectionTop,
		sectionBottom: sectionTop + maxScroll,
		maxScroll,
		stepDistance
	};
}

function isSectionActive() {
	const { sectionTop, sectionBottom } = getSectionMetrics();
	return window.scrollY >= sectionTop && window.scrollY <= sectionBottom;
}

function syncScrollToTarget() {
	const { sectionTop, stepDistance } = getSectionMetrics();
	window.scrollTo({
		top: sectionTop + state.target * stepDistance,
		behavior: "auto"
	});
}

function queueStep(direction) {
	if (state.isStepping || direction === 0) {
		return false;
	}

	const nextTarget = clamp(state.target + direction, 0, state.max);

	if (nextTarget === state.target) {
		return false;
	}

	state.target = nextTarget;
	state.isStepping = true;
	syncScrollToTarget();
	return true;
}

function handleStepInput(direction, event) {
	if (!isSectionActive()) {
		return;
	}

	const atStart = state.target === 0;
	const atEnd = state.target === state.max;
	const leavingSection = (direction < 0 && atStart) || (direction > 0 && atEnd);

	if (leavingSection) {
		return;
	}

	event.preventDefault();
	queueStep(direction);
}

function getCardTransform(relativeIndex, parity) {
	const isTop = parity % 2 === 0;
	const verticalAnchor = isTop ? -1 : 1;

	if (relativeIndex <= 0) {
		const progressOut = clamp(-relativeIndex, 0, 1);
		return {
			x: mix(0, 0, progressOut),
			y: mix(0, verticalAnchor * -12, progressOut),
			z: mix(0, -260, progressOut),
			scale: mix(1, 0.7, progressOut),
			rotate: mix(0, verticalAnchor * 4, progressOut),
			opacity: mix(1, 0.12, progressOut),
			blur: mix(0, 8, progressOut)
		};
	}

	const depth = clamp(relativeIndex, 0, 1);
	const yOffset = isTop ? -22 : 22;

	return {
		x: mix(0, 0, depth === 0 ? 0 : 1 - depth),
		y: mix(yOffset + relativeIndex * 2.5, 0, 1 - depth),
		z: mix(-340 - relativeIndex * 110, 0, 1 - depth),
		scale: mix(0.7 - relativeIndex * 0.025, 1, 1 - depth),
		rotate: mix(verticalAnchor * 6, 0, 1 - depth),
		opacity: mix(Math.max(0.08, 0.52 - relativeIndex * 0.08), 1, 1 - depth),
		blur: mix(8 + relativeIndex * 0.8, 0, 1 - depth)
	};
}

function render() {
	state.current = state.reduceMotion
		? state.target
		: mix(state.current, state.target, 0.12);

	if (Math.abs(state.target - state.current) < 0.0008) {
		state.current = state.target;
		state.isStepping = false;
	}

	const activeIndex = clamp(Math.round(state.current), 0, state.max);
	setActiveDot(activeIndex);
	applyPageTheme(activeIndex);

	cards.forEach((card, index) => {
		const relativeIndex = index - state.current;
		const transform = getCardTransform(relativeIndex, index);
		const isSettledFocus = !state.isStepping && index === activeIndex;
		card.style.zIndex = String(cards.length - Math.round(relativeIndex * 10));
		card.style.opacity = isSettledFocus ? "1" : transform.opacity.toFixed(3);
		card.style.filter = `blur(${transform.blur.toFixed(2)}px)`;
		card.style.transform = `translate3d(calc(-50% + ${transform.x}vw), calc(-50% + ${transform.y}vh), ${transform.z}px) scale(${transform.scale}) rotate(${transform.rotate}deg)`;
	});

	requestAnimationFrame(render);
}

function resizeSection() {
	stackSection.style.height = `${cards.length * SECTION_STEP_VH}vh`;
	state.max = Math.max(cards.length - 1, 0);
	state.target = clamp(Math.round(state.target), 0, state.max);
	state.current = clamp(state.current, 0, state.max);
	syncScrollToTarget();
	state.activeThemeIndex = -1;
	applyPageTheme(clamp(Math.round(state.current), 0, state.max));
}

function handleWheel(event) {
	const direction = Math.sign(event.deltaY);
	handleStepInput(direction, event);
}

function handleKeydown(event) {
	if (!SCROLL_KEYS.has(event.key) || event.altKey || event.ctrlKey || event.metaKey) {
		return;
	}

	const direction = event.key === "ArrowUp" || event.key === "PageUp"
		? -1
		: 1;

	handleStepInput(direction, event);
}

function handleTouchStart(event) {
	if (event.touches.length !== 1) {
		return;
	}

	state.touchStartY = event.touches[0].clientY;
}

function handleTouchMove(event) {
	if (event.touches.length !== 1 || state.touchStartY === 0) {
		return;
	}

	const touchY = event.touches[0].clientY;
	const deltaY = state.touchStartY - touchY;

	if (Math.abs(deltaY) < TOUCH_STEP_THRESHOLD) {
		return;
	}

	handleStepInput(Math.sign(deltaY), event);
	state.touchStartY = touchY;
}

function handleTouchEnd() {
	state.touchStartY = 0;
}

buildStack();
window.addEventListener("resize", resizeSection);
window.addEventListener("wheel", handleWheel, { passive: false });
window.addEventListener("keydown", handleKeydown);
window.addEventListener("touchstart", handleTouchStart, { passive: true });
window.addEventListener("touchmove", handleTouchMove, { passive: false });
window.addEventListener("touchend", handleTouchEnd);

resizeSection();
setActiveDot(0);
render();