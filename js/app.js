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

    try {
        const resAuspiciantes = await fetch('data/auspiciantes.json');
        if (resAuspiciantes.ok) {
            const data = await resAuspiciantes.json();
            const auspiciantes = data.auspiciantes || data;
            if (Array.isArray(auspiciantes) && auspiciantes.length > 0) {
                renderAuspiciantes(auspiciantes);
            }
        }
    } catch (e) {
        console.log('Usando contenido HTML estático para auspiciantes');
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

function renderAuspiciantes(auspiciantes) {
    const sec = document.getElementById('auspiciantes');
    if (!sec || !Array.isArray(auspiciantes) || auspiciantes.length === 0) return;

    let html = `<h2>Nuestros Auspiciantes</h2>
    <p>Agradecemos especialmente a las empresas y comercios que acompañan y hacen posible nuestro evento.</p>
    <div class="auspiciantes-grid">`;

    auspiciantes.forEach(ausp => {
        const src = typeof ausp === 'string' ? ausp : ausp.imagen;
        const nombre = (typeof ausp === 'object' && ausp.nombre) ? ausp.nombre : 'Auspiciante';
        const link = (typeof ausp === 'object' && ausp.link) ? ausp.link : '';

        if (link) {
            html += `<a href="${link}" target="_blank" rel="noopener noreferrer" class="auspiciante-card">
                <img src="${src}" alt="${nombre}">
            </a>`;
        } else {
            html += `<div class="auspiciante-card">
                <img src="${src}" alt="${nombre}">
            </div>`;
        }
    });

    html += `</div>`;
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

    initLightbox();
});

function initLightbox() {
    const modal = document.getElementById('lightboxModal');
    const modalImg = document.getElementById('lightboxImg');
    const captionText = document.getElementById('lightboxCaption');
    const closeBtn = document.querySelector('.lightbox-close');

    if (!modal || !modalImg) return;

    document.body.addEventListener('click', (e) => {
        if (e.target.tagName === 'IMG' && (
            e.target.closest('.salida-img') || 
            e.target.closest('.carousel-images') || 
            e.target.closest('.evento-card') ||
            e.target.closest('.historia-img-wrapper')
        )) {
            modal.classList.add('active');
            modalImg.src = e.target.src;
            captionText.innerText = e.target.alt || 'Club Siambretta Chivilcoy';
        }
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
        }
    });
}



