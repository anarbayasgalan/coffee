import './style.css'

document.addEventListener('DOMContentLoaded', () => {
    // 1. Scroll Reveal Animation (Intersection Observer)
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            } else {
                entry.target.classList.remove('active');
            }
        });
    }, { threshold: 0.15 });

    revealElements.forEach(el => revealObserver.observe(el));

    // Immersive mode is always on
    document.body.classList.add('immersive-mode');

    // --- Mobile Menu Toggle ---
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelectorAll('.nav-links'); // both left and right

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navLinks.forEach(nav => nav.classList.toggle('active'));
            document.body.classList.toggle('no-scroll'); // Prevent background scrolling
        });

        // Close menu when a link is clicked
        const navItems = document.querySelectorAll('.nav-item > a');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 768 && !item.parentElement.classList.contains('has-dropdown')) {
                    menuToggle.classList.remove('active');
                    navLinks.forEach(nav => nav.classList.remove('active'));
                    document.body.classList.remove('no-scroll');
                }
            });
        });
    }

    // Handle mobile dropdowns
    const mobileDropdowns = document.querySelectorAll('.nav-item.has-dropdown > a');
    mobileDropdowns.forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                // If it's a mobile dropdown, toggle it on click instead of navigating
                e.preventDefault();
                anchor.parentElement.classList.toggle('active');
            }
        });
    });

    // --- Background Video & Slideshow Logic ---
    const video = document.getElementById('hero-bg-video');
    const slideshowContainer = document.getElementById('hero-slideshow');
    let transitionTriggered = false;
    let slideshowInterval = null;

    function resetHeroSection() {
        if (!video) return;
        
        // Stop any existing slideshow interval
        if (slideshowInterval) clearInterval(slideshowInterval);
        
        // Reset flags
        transitionTriggered = false;
        
        // Reset Video State
        video.currentTime = 0;
        video.style.transition = 'none';
        video.style.transform = 'translate(0, 0)';
        video.style.opacity = '1';
        video.play().catch(() => {});

        // Reset Slideshow State
        if (slideshowContainer) {
            slideshowContainer.classList.remove('active');
            slideshowContainer.innerHTML = ''; // Clear existing slides
        }
    }

    if (video) {
        // Force play as soon as possible
        video.play().catch(() => {
            // If autoplay fails, fallback to interaction (kept as silent insurance)
            const forcePlay = () => {
                video.play().catch(() => {});
                window.removeEventListener('click', forcePlay);
                window.removeEventListener('touchstart', forcePlay);
            };
            window.addEventListener('click', forcePlay);
            window.addEventListener('touchstart', forcePlay, { passive: true });
        });

        // We use 'timeupdate' to catch the end instantly on all devices
        video.addEventListener('timeupdate', () => {
            const timeLeft = video.duration - video.currentTime;
            if (!transitionTriggered && timeLeft <= 0.3 && video.duration > 0) {
                transitionTriggered = true;
                triggerSlideshowTransition();
            }
        });

        video.addEventListener('ended', () => {
            if (!transitionTriggered) {
                transitionTriggered = true;
                triggerSlideshowTransition();
            }
        });
    }

    // --- Reset Hero on Home/Logo Click ---
    const homeLinks = document.querySelectorAll('a[href="#home"]');
    homeLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // If we are already on the page, reset the hero
            resetHeroSection();
        });
    });

    function triggerSlideshowTransition() {
        if (!video) return;
        // Smoothly slide out the localized video
        video.style.transition = 'transform 1.0s cubic-bezier(0.25, 1, 0.5, 1), opacity 1.0s ease-out';
        video.style.transform = 'translate(-100%, 0)'; // Slide left
        video.style.opacity = '0'; 
        startHeroSlideshow();
    }

    // Slideshow: images 1-15 except 4
    const heroImages = [];
    for (let i = 1; i <= 15; i++) {
        if (i !== 4) heroImages.push(`/media/image${i}.jpg`);
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    shuffleArray(heroImages);

    let currentSlideIndex = 0;

    function createSlide(imageUrl, zIndex) {
        const slide = document.createElement('div');
        slide.className = 'hero-slide';
        slide.style.backgroundImage = `url('${imageUrl}')`;
        slide.style.zIndex = zIndex;
        return slide;
    }

    function startHeroSlideshow() {
        if (!slideshowContainer) return;
        
        slideshowContainer.classList.add('active'); 
        
        // Create first slide
        let currentSlide = createSlide(heroImages[currentSlideIndex], -3);
        slideshowContainer.appendChild(currentSlide);
        
        currentSlide.style.transform = 'translateX(100%)';
        void currentSlide.offsetWidth; 
        currentSlide.style.transform = 'translateX(0)';

        if (slideshowInterval) clearInterval(slideshowInterval);
        
        slideshowInterval = setInterval(() => {
            currentSlideIndex = (currentSlideIndex + 1) % heroImages.length;
            
            const nextSlide = createSlide(heroImages[currentSlideIndex], -2);
            nextSlide.style.transform = 'translateX(100%)';
            slideshowContainer.appendChild(nextSlide);
            
            void nextSlide.offsetWidth; 
            
            nextSlide.style.transform = 'translateX(0)';
            currentSlide.style.transform = 'translateX(-30%)'; 
            currentSlide.style.opacity = '0'; 
            
            const slideToRemove = currentSlide;
            setTimeout(() => {
                if (slideToRemove.parentNode) slideToRemove.parentNode.removeChild(slideToRemove);
            }, 1000); 
            
            currentSlide = nextSlide;
            currentSlide.style.zIndex = -3; 
            
        }, 5000);
    }
});
