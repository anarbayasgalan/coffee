import './style.css'

document.addEventListener('DOMContentLoaded', () => {
    // 1. Sticky Navigation Logic
    const stickyNav = document.querySelector('.sticky-nav');
    const hero = document.querySelector('.hero');
    const topNav = document.querySelector('.top-nav');
    const navHeight = topNav.offsetHeight;

    window.addEventListener('scroll', () => {
        const heroBottom = hero.getBoundingClientRect().bottom;
        
        if (heroBottom <= navHeight) {
            stickyNav.classList.add('is-fixed');
        } else {
            stickyNav.classList.remove('is-fixed');
        }
    });

    // 2. Scroll Reveal Animation (Intersection Observer)
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            } else {
                // Reset animation when scrolling away
                entry.target.classList.remove('active');
            }
        });
    }, { threshold: 0.15 });

    revealElements.forEach(el => revealObserver.observe(el));

    // 3. Active Link Tracking (ScrollSpy)
    const stickyLinks = document.querySelectorAll('.sticky-link');
    const heroBg = document.getElementById('hero-bg');
    
    // Set initial hero color
    if (stickyLinks.length > 0) {
        heroBg.style.backgroundColor = stickyLinks[0].getAttribute('data-color');
    }

    const sections = document.querySelectorAll('section[id], header[id]');
    
    window.addEventListener('scroll', () => {
        let currentSectionId = '';
        const scrollPos = window.scrollY + window.innerHeight / 2;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (scrollPos >= sectionTop && scrollPos <= sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        if (currentSectionId) {
            stickyLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSectionId}`) {
                    link.classList.add('active');
                    const color = link.getAttribute('data-color');
                    if (window.scrollY < hero.offsetHeight) {
                        heroBg.style.backgroundColor = color;
                    }
                }
            });
        }
    });

    // 4. Smooth Scroll
    stickyLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const isFixed = stickyNav.classList.contains('is-fixed');
                const offset = navHeight + (isFixed ? stickyNav.offsetHeight : stickyNav.offsetHeight);
                
                window.scrollTo({
                    top: targetElement.offsetTop - offset,
                    behavior: 'smooth'
                });
            }
        });
    });
    // 5. Visual Mode Toggle Logic
    const btnSolid = document.getElementById('btn-solid');
    const btnImmersive = document.getElementById('btn-immersive');
    const body = document.body;

    const setMode = (mode) => {
        if (mode === 'immersive') {
            body.classList.add('immersive-mode');
            btnImmersive.classList.add('active');
            btnSolid.classList.remove('active');
            localStorage.setItem('coffee_mode', 'immersive');
        } else {
            body.classList.remove('immersive-mode');
            btnSolid.classList.add('active');
            btnImmersive.classList.remove('active');
            localStorage.setItem('coffee_mode', 'solid');
        }
    };

    btnSolid.addEventListener('click', () => setMode('solid'));
    btnImmersive.addEventListener('click', () => setMode('immersive'));

    // Check preference
    const savedMode = localStorage.getItem('coffee_mode');
    if (savedMode === 'immersive') setMode('immersive');
});
