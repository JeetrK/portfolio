const projectCards = [
	{
		fileName: "Roster Project.png",
		title: "Roster Project",
		info: "This project is being showcased because I distinctly remember the struggle of trying to figure out how to make the code work. I would keep running into random problems over and over again and it was very frustrating. However, I kept trying and eventually got it to work and it felt like such an accomplishment. It was a great learning experience for me."
	},
	{
		fileName: "Problem Solving Project.png",
		title: "Problem Solving",
		info: "I picked this project to showcase because it was my first time working to solve a problem with code. Prior to this we only made websites in this class just to learn how to use certain tools in coding. This was the first project where we were given a task and just had to do it."
	},
	{
		fileName: "Holiday Game Project.png",
		title: "Holiday Game",
		info: "I chose this project to showcase because it was the first time I made a game. It was really fun to make and I enjoyed the process of creating something interactive."
	}
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
				<a href="${card.href}" target="_blank" rel="noopener noreferrer" class="card-link" aria-label="Open ${card.title} repository">
					<img src="imgs/${card.fileName}" alt="${card.title}" class="card-image">
				</a>
				<div class="card-overlay">
					<button class="more-info-btn" type="button">More info</button>
				</div>
				<div class="card-info">
					<div class="info-top-row">
						<button class="info-close-btn" type="button" aria-label="Return to link">← Back to link</button>
					</div>
					<div class="info-copy">
						<p class="info-text">${card.info}</p>
					</div>
				</div>
			</div>
		`;
		carousel.appendChild(cardElement);

		const moreInfoBtn = cardElement.querySelector(".more-info-btn");
		const closeInfoBtn = cardElement.querySelector(".info-close-btn");

		moreInfoBtn.addEventListener("click", () => {
			cardElement.classList.add("is-info-open");
		});

		closeInfoBtn.addEventListener("click", () => {
			cardElement.classList.remove("is-info-open");
		});
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
