// Gallery data
const galleryData = [
    { src: 'assets/batik/1_MotifLiris.jpg', caption: 'Jetis – Udan Liris' },
    { src: 'assets/batik/2_MotifAlunAlunContong.jpg', caption: 'Jetis – Alun-Alun Contong' },
    { src: 'assets/batik/3_MotifBurungMerak.jpg', caption: 'Jetis – Burung Merak' },
    { src: 'assets/batik/4_MotifSekarJagad.jpg', caption: 'Jetis – Sekar Jagad' },
    { src: 'assets/batik/5_MotifParangJabon.jpg', caption: 'Jetis – Parang Jabon' },
    { src: 'assets/batik/6_MotifLovePutihan.jpg', caption: 'Jetis – Love Putihan' }
];

let currentIndex = 0;

// Lightbox functions
function openLightbox(index) {
    currentIndex = index;
    updateLightbox();
    document.getElementById('lightbox').classList.add('active');
}

function closeLightbox() {
    document.getElementById('lightbox').classList.remove('active');
}

function prevLightbox() {
    currentIndex = (currentIndex - 1 + galleryData.length) % galleryData.length;
    updateLightbox();
}

function nextLightbox() {
    currentIndex = (currentIndex + 1) % galleryData.length;
    updateLightbox();
}

function updateLightbox() {
    const img = document.getElementById('lightbox-image');
    const caption = document.getElementById('lightbox-caption');
    img.src = galleryData[currentIndex].src;
    caption.textContent = galleryData[currentIndex].caption;
}

// Keyboard for lightbox
document.addEventListener('keydown', (e) => {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox.classList.contains('active')) return;
    
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') prevLightbox();
    if (e.key === 'ArrowRight') nextLightbox();
});

// Mobile menu
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
if (menuBtn) {
    menuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}

// Navbar scroll
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.style.backgroundColor = 'rgba(78, 52, 46, 0.95)';
        navbar.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
    } else {
        navbar.style.backgroundColor = 'transparent';
        navbar.style.boxShadow = 'none';
    }
});

// Active link
const navLinks = document.querySelectorAll('.nav-link');
window.addEventListener('scroll', () => {
    let current = '';
    document.querySelectorAll('section').forEach(section => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    navLinks.forEach(link => {
        link.classList.remove('text-batik-gold');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('text-batik-gold');
        }
    });
});
