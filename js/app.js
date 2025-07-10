
const imagesContainer = document.querySelector('.carousel-images');
const images = document.querySelectorAll('.carousel-images img');
const prevButton = document.querySelector('.prev');
const nextButton = document.querySelector('.next');
const indicatorsContainer = document.querySelector('.indicators');

let currentIndex = 0;
const totalImages = images.length;

// Crear indicadores
for (let i = 0; i < totalImages; i++) {
    const span = document.createElement('span');
    if (i === 0) span.classList.add('active');
    span.addEventListener('click', () => goToImage(i));
    indicatorsContainer.appendChild(span);
}

const indicators = document.querySelectorAll('.indicators span');

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

function goToImage(index) {
    currentIndex = index;
    updateCarousel();
}

prevButton.addEventListener('click', prevImage);
nextButton.addEventListener('click', nextImage);

setInterval(nextImage, 4000);  // Automático cada 4 segundos