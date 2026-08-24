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

    // 👇 Agregar soporte para swipe en mobile
    let startX = 0;
    let endX = 0;

    imagesContainer.addEventListener("touchstart", (e) => {
        startX = e.touches[0].clientX;
    });

    imagesContainer.addEventListener("touchmove", (e) => {
        endX = e.touches[0].clientX;
    });

    imagesContainer.addEventListener("touchend", () => {
        let diff = startX - endX;

        if (Math.abs(diff) > 50) { // umbral para que no dispare con toques cortos
            if (diff > 0) {
                nextImage(); // deslizó a la izquierda
            } else {
                prevImage(); // deslizó a la derecha
            }
        }
    });
});

// 👇 Carga dinámica de eventos y salidas desde JSON (Panel Admin)
async function cargarDatosDinamicos() {
    try {
        const resEvento = await fetch('data/eventos.json');
        if (resEvento.ok) {
            const evento = await resEvento.json();
            renderEvento(evento);
        }
    } catch (e) {
        console.log('Usando contenido HTML estático para eventos');
    }

    try {
        const resSalidas = await fetch('data/salidas.json');
        if (resSalidas.ok) {
            const data = await resSalidas.json();
            const salidas = data.salidas || data;
            renderSalidas(salidas);
        }
    } catch (e) {
        console.log('Usando contenido HTML estático para salidas');
    }
}

function renderEvento(evento) {
    const sec = document.getElementById('eventos');
    if (!sec || !evento) return;
    
    let html = `<h2>${evento.titulo_seccion || 'Proximo evento'}</h2>`;
    if (evento.descripcion) {
        html += `<p>${evento.descripcion}</p>`;
    }
    if (evento.imagen) {
        html += `<div class="evento-card"><img src="${evento.imagen}" alt="${evento.alt_imagen || 'Evento'}" class="evento-img"></div>`;
    }
    if (evento.mostrar_botones) {
        html += `<div class="botonesEvento">`;
        if (evento.link_itinerario) {
            html += `<p class="botones"><a href="${evento.link_itinerario}" target="_blank">Itinerario</a></p>`;
        }
        if (evento.link_inscripcion) {
            html += `<p class="botones"><a href="${evento.link_inscripcion}" target="_blank">Inscripción</a></p>`;
        }
        if (evento.whatsapp) {
            html += `<p class="botones"><a href="https://wa.me/${evento.whatsapp}" target="_blank" class="whatsapp-btn"><img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" alt="WhatsApp"> WhatsApp</a></p>`;
        }
        html += `</div>`;
    }
    sec.innerHTML = html;
}

function renderSalidas(salidas) {
    const sec = document.getElementById('salidas');
    if (!sec || !Array.isArray(salidas)) return;

    let html = `<h2>Salidas</h2>`;
    salidas.forEach(salida => {
        html += `<div class="salida">
            <h4>${salida.titulo}</h4>
            <div class="salida-img">`;
        if (Array.isArray(salida.imagenes)) {
            salida.imagenes.forEach(img => {
                const src = typeof img === 'string' ? img : img.imagen;
                html += `<img src="${src}" alt="salida">`;
            });
        }
        html += `</div></div>`;
    });
    sec.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', () => {
    cargarDatosDinamicos();
    
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');
    const navLinks = nav ? nav.querySelectorAll('a') : [];

    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
        });

        // Cerrar el menú al hacer clic en cualquier enlace
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('active');
            });
        });
    }
});



