const cards = Array.from(document.querySelectorAll(".stack-card"));
const dots = Array.from(document.querySelectorAll(".stack-progress__dot"));
const stackSection = document.querySelector(".stack-scroll");

const state = {
	current: 0,
	target: 0,
	max: Math.max(cards.length - 1, 0),
	reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches
};

function clamp(value, min, max) {
	return Math.min(Math.max(value, min), max);
}

function mix(start, end, amount) {
	return start + (end - start) * amount;
}

function setActiveDot(index) {
	dots.forEach((dot, dotIndex) => {
		dot.classList.toggle("is-active", dotIndex === index);
	});
}

function getScrollProgress() {
	const sectionTop = stackSection.offsetTop;
	const maxScroll = window.innerHeight * state.max;
	const distance = clamp(window.scrollY - sectionTop, 0, maxScroll);
	return maxScroll === 0 ? 0 : distance / window.innerHeight;
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
	state.target = getScrollProgress();
	state.current = state.reduceMotion
		? state.target
		: mix(state.current, state.target, 0.12);

	if (Math.abs(state.target - state.current) < 0.0008) {
		state.current = state.target;
	}

	const activeIndex = clamp(Math.round(state.current), 0, state.max);
	setActiveDot(activeIndex);

	cards.forEach((card, index) => {
		const relativeIndex = index - state.current;
		const transform = getCardTransform(relativeIndex, index);
		card.style.zIndex = String(cards.length - Math.round(relativeIndex * 10));
		card.style.opacity = transform.opacity.toFixed(3);
		card.style.filter = `blur(${transform.blur.toFixed(2)}px)`;
		card.style.transform = `translate3d(calc(-50% + ${transform.x}vw), calc(-50% + ${transform.y}vh), ${transform.z}px) scale(${transform.scale}) rotate(${transform.rotate}deg)`;
	});

	requestAnimationFrame(render);
}

function resizeSection() {
	stackSection.style.height = `${cards.length * 100}vh`;
	state.max = Math.max(cards.length - 1, 0);
}

window.addEventListener("resize", resizeSection);

resizeSection();
setActiveDot(0);
render();
