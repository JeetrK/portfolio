// Page transition effect
document.addEventListener('DOMContentLoaded', () => {
	// Handle navigation link clicks
	const navLinks = document.querySelectorAll('.nav-link');
	
	navLinks.forEach(link => {
		link.addEventListener('click', (e) => {
			e.preventDefault();
			const href = link.getAttribute('href');
			
			// Add exit animation
			document.body.classList.add('is-page-exiting');
			
			// Navigate after animation completes
			setTimeout(() => {
				window.location.href = href;
			}, 400);
		});
	});
});
