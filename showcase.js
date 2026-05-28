const projectCards = [
	{ fileName: "gallery1.png", title: "Monthly Gallery" },
	{ fileName: "Madlib.png", title: "Madlib Game" },
	{ fileName: "Magic 8 Ball.png", title: "Magic 8 Ball" },
	{ fileName: "Medieval Name Generator .png", title: "Name Generator" },
	{ fileName: "Rock Paper Scissors.png", title: "Rock Paper Scissors" },
	{ fileName: "President Project.png", title: "President Site" },
	{ fileName: "Hangman.png", title: "Hangman Game" },
	{ fileName: "Calculator and Java Practice.png", title: "Calculator App" },
	{ fileName: "Array Practice.png", title: "Array Practice" },
	{ fileName: "JSON Practice.png", title: "JSON Project" },
	{ fileName: "NJIT-Project.png", title: "NJIT Project" },
	{ fileName: "Roster Project.png", title: "Roster Project" },
	{ fileName: "College Website.png", title: "College Website" },
	{ fileName: "Mock Client Project.png", title: "Client Project" },
	{ fileName: "Holiday Game Project.png", title: "Holiday Game" },
	{ fileName: "Problem Solving Project.png", title: "Problem Solving" },
	{ fileName: "Client Project.png", title: "Client Work" }
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
		indicator.aria-label = `Go to project ${index + 1}`;
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
