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

// Mobile menu with smooth toggle and animation
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const menuBtnSvg = menuBtn?.querySelector('svg');

if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
        const isHidden = mobileMenu.classList.contains('hidden');
        mobileMenu.classList.toggle('hidden');
        
        // Animate hamburger to X
        if (!isHidden) {
            menuBtn.style.transform = 'rotate(0deg)';
            menuBtnSvg.style.transform = 'rotate(0deg)';
        } else {
            menuBtn.style.transform = 'rotate(90deg)';
            menuBtnSvg.style.transform = 'rotate(90deg)';
        }
    });

    // Close mobile menu when clicking a link
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
            menuBtn.style.transform = 'rotate(0deg)';
            if (menuBtnSvg) menuBtnSvg.style.transform = 'rotate(0deg)';
        });
    });
}

// Enhanced navbar scroll effect
const navbar = document.getElementById('navbar');
let lastScroll = 0;
let ticking = false;

function updateNavbar() {
    const currentScroll = window.scrollY;
    
    if (currentScroll > 80) {
        navbar.style.backgroundColor = 'rgba(78, 52, 46, 0.98)';
        navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.4)';
        navbar.style.borderBottom = '1px solid rgba(192, 151, 83, 0.2)';
    } else {
        navbar.style.backgroundColor = 'transparent';
        navbar.style.boxShadow = 'none';
        navbar.style.borderBottom = 'none';
    }
    
    // Smart hide/show navbar
    if (currentScroll > lastScroll && currentScroll > 150) {
        // Scrolling down - hide navbar
        navbar.style.transform = 'translateY(-100%)';
    } else {
        // Scrolling up - show navbar
        navbar.style.transform = 'translateY(0)';
    }
    
    lastScroll = currentScroll;
    ticking = false;
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            updateNavbar();
        });
        ticking = true;
    }
}, { passive: true });// Active link highlighting with smooth transition
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
