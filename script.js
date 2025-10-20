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
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scroll
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('active');
    document.body.style.overflow = ''; // Restore scroll
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
    
    // Smooth fade effect
    img.style.opacity = '0';
    setTimeout(() => {
        img.src = galleryData[currentIndex].src;
        caption.textContent = galleryData[currentIndex].caption;
        img.style.transition = 'opacity 0.3s ease';
        img.style.opacity = '1';
    }, 150);
}

// Keyboard navigation for lightbox
document.addEventListener('keydown', (e) => {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox.classList.contains('active')) return;
    
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') prevLightbox();
    if (e.key === 'ArrowRight') nextLightbox();
});

// Click outside lightbox to close
document.getElementById('lightbox')?.addEventListener('click', (e) => {
    if (e.target.id === 'lightbox') {
        closeLightbox();
    }
});

// Mobile menu with smooth toggle
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
        // Animate menu button
        menuBtn.style.transform = mobileMenu.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(90deg)';
    });
    
    // Close mobile menu when clicking a link
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
            menuBtn.style.transform = 'rotate(0deg)';
        });
    });
}

// Navbar scroll effect with smooth transition
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    
    if (currentScroll > 50) {
        navbar.style.backgroundColor = 'rgba(78, 52, 46, 0.95)';
        navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.backgroundColor = 'transparent';
        navbar.style.boxShadow = 'none';
        navbar.style.backdropFilter = 'none';
    }
    
    // Hide navbar on scroll down, show on scroll up
    if (currentScroll > lastScroll && currentScroll > 100) {
        navbar.style.transform = 'translateY(-100%)';
    } else {
        navbar.style.transform = 'translateY(0)';
    }
    
    lastScroll = currentScroll;
}, { passive: true });

// Active link highlighting with smooth transition
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
        link.style.transform = 'scale(1)';
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('text-batik-gold');
            link.style.transform = 'scale(1.1)';
        }
    });
}, { passive: true });

// Smooth scroll for all anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add parallax effect to hero
window.addEventListener('scroll', () => {
    const heroSection = document.querySelector('.hero-bg');
    if (heroSection) {
        const scrolled = window.scrollY;
        heroSection.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
}, { passive: true });
