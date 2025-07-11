document.querySelectorAll('.carousel').forEach((carousel) => {
    const imagesContainer = carousel.querySelector('.carousel-images');
    const images = carousel.querySelectorAll('.carousel-images img');
    const prevButton = carousel.querySelector('.prev');
    const nextButton = carousel.querySelector('.next');
    const indicatorsContainer = carousel.querySelector('.indicators');

    let currentIndex = 0;
    const totalImages = images.length;

    // Crear indicadores
    images.forEach((_, i) => {
        const span = document.createElement('span');
        if (i === 0) span.classList.add('active');
        span.addEventListener('click', () => {
            currentIndex = i;
            updateCarousel();
        });
        indicatorsContainer.appendChild(span);
    });

    const indicators = indicatorsContainer.querySelectorAll('span');

    function updateCarousel() {
        imagesContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
        indicators.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === currentIndex);
        });
    }

    function nextImage() {
        currentIndex = (currentIndex + 1) % totalImages;
        updateCarousel();
    }

    function prevImage() {
        currentIndex = (currentIndex - 1 + totalImages) % totalImages;
        updateCarousel();
    }

    prevButton.addEventListener('click', prevImage);
    nextButton.addEventListener('click', nextImage);

    setInterval(nextImage, 4000);  // Automático cada 4 segundos
});

const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('nav');

menuToggle.addEventListener('click', () => {
    nav.classList.toggle('active');
});