const projectCards = [
	{ fileName: "Roster Project.png", title: "Roster Project" },
	{ fileName: "Problem Solving Project.png", title: "Problem Solving" },
	{ fileName: "Holiday Game Project.png", title: "Holiday Game" }
];

let currentIndex = 0;

const carousel = document.getElementById("cards-carousel");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const indicators = document.getElementById("carousel-indicators");

function initCarousel() {
	// Render cards
	projectCards.forEach((card, index) => {
		const cardElement = document.createElement("div");
		cardElement.className = "carousel-card";
		cardElement.innerHTML = `
			<div class="stack-card__label">${card.title}</div>
			<div class="card-content">
				<img src="imgs/${card.fileName}" alt="${card.title}" class="card-image">
				<div class="card-overlay">
					<h3 class="card-title">${card.title}</h3>
				</div>
			</div>
		`;
		carousel.appendChild(cardElement);
	});

	// Render indicators
	projectCards.forEach((_, index) => {
		const indicator = document.createElement("button");
		indicator.className = "indicator-dot";
		if (index === 0) indicator.classList.add("is-active");
		indicator.setAttribute("aria-label", `Go to project ${index + 1}`);
		indicator.addEventListener("click", () => goToSlide(index));
		indicators.appendChild(indicator);
	});

	updateCarousel();
}

function updateCarousel() {
	const cards = document.querySelectorAll(".carousel-card");
	const indicatorDots = document.querySelectorAll(".indicator-dot");

	cards.forEach((card, index) => {
		card.classList.remove("is-center", "is-left", "is-right");

		if (index === currentIndex) {
			card.classList.add("is-center");
		} else if (index === (currentIndex - 1 + projectCards.length) % projectCards.length) {
			card.classList.add("is-left");
		} else if (index === (currentIndex + 1) % projectCards.length) {
			card.classList.add("is-right");
		}
	});

	indicatorDots.forEach((dot, index) => {
		dot.classList.toggle("is-active", index === currentIndex);
	});
}

function goToSlide(index) {
	currentIndex = index;
	updateCarousel();
}

function nextSlide() {
	currentIndex = (currentIndex + 1) % projectCards.length;
	updateCarousel();
}

function prevSlide() {
	currentIndex = (currentIndex - 1 + projectCards.length) % projectCards.length;
	updateCarousel();
}

// Event listeners
prevBtn.addEventListener("click", prevSlide);
nextBtn.addEventListener("click", nextSlide);

// Keyboard navigation
document.addEventListener("keydown", (e) => {
	if (e.key === "ArrowLeft") prevSlide();
	if (e.key === "ArrowRight") nextSlide();
});

// Initialize on page load
initCarousel();
