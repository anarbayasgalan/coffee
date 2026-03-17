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
});

// --- YouTube Background & Slideshow Logic ---
let player;
window.onYouTubeIframeAPIReady = function() {
    player = new YT.Player('youtube-player', {
        videoId: 'T98vf10W064',
        playerVars: {
            'autoplay': 1,
            'controls': 0,
            'mute': 1,
            'rel': 0,
            'modestbranding': 1,
            'showinfo': 0,
            'playsinline': 1,
            'loop': 0, // Do NOT loop so it fires the ENDED event
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
};

function onPlayerReady(event) {
    event.target.mute();
    event.target.playVideo();
    
    // Fallback for mobile browser's "no-autoplay" policy:
    // Play the video as soon as the user touches the screen anywhere
    const forcePlay = () => {
        if (player && typeof player.playVideo === 'function') {
            player.playVideo();
            console.log("Forced video play on interaction");
        }
        window.removeEventListener('touchstart', forcePlay);
        window.removeEventListener('click', forcePlay);
    };
    window.addEventListener('touchstart', forcePlay, { passive: true });
    window.addEventListener('click', forcePlay);
}

let timeCheckerInterval = null;
let slideshowTriggered = false;

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        // Clear any existing interval
        if (timeCheckerInterval) clearInterval(timeCheckerInterval);
        
        // Start polling the time to catch the end instantly
        timeCheckerInterval = setInterval(() => {
            const currentTime = player.getCurrentTime();
            const duration = player.getDuration();
            
            // If we are within 0.3 seconds of the end, trigger transition instantly
            if (duration > 0 && (duration - currentTime) <= 0.3 && !slideshowTriggered) {
                slideshowTriggered = true;
                clearInterval(timeCheckerInterval);
                triggerSlideshowTransition();
            }
        }, 100);
    }
}

function triggerSlideshowTransition() {
    const playerEl = document.getElementById('youtube-player');
    // Speed up the slide out transition slightly for a snappier feel
    playerEl.style.transition = 'transform 1.0s cubic-bezier(0.25, 1, 0.5, 1), opacity 1.0s ease-out';
    playerEl.style.transform = 'translate(-100%, -50%)'; // Slide left
    playerEl.style.opacity = '0'; 
    startHeroSlideshow();
}

// Load the YouTube API dynamically
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);

// Slideshow: images 1-15 except 4
const heroImages = [];
for (let i = 1; i <= 15; i++) {
    if (i !== 4) heroImages.push(`/media/image${i}.jpg`);
}

// Randomly shuffle images perfectly
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
    const slideshowContainer = document.getElementById('hero-slideshow');
    slideshowContainer.classList.add('active'); 
    
    // Create first slide
    let currentSlide = createSlide(heroImages[currentSlideIndex], -3);
    slideshowContainer.appendChild(currentSlide);
    
    // Animate first slide in from right
    // Start it off-screen right
    currentSlide.style.transform = 'translateX(100%)';
    
    // Force reflow
    void currentSlide.offsetWidth;
    
    // Slide it to center
    currentSlide.style.transform = 'translateX(0)';

    // Loop through images sliding in from right
    setInterval(() => {
        currentSlideIndex = (currentSlideIndex + 1) % heroImages.length;
        
        const nextSlide = createSlide(heroImages[currentSlideIndex], -2);
        // Start off-screen right
        nextSlide.style.transform = 'translateX(100%)';
        slideshowContainer.appendChild(nextSlide);
        
        // Force reflow
        void nextSlide.offsetWidth;
        
        // Slide next in to center, current out to left
        nextSlide.style.transform = 'translateX(0)';
        currentSlide.style.transform = 'translateX(-30%)'; // slight parallax
        currentSlide.style.opacity = '0'; // fade out old one smoothly
        
        // Clean up old slide after transition completes
        const slideToRemove = currentSlide;
        setTimeout(() => {
            if (slideToRemove.parentNode) slideToRemove.parentNode.removeChild(slideToRemove);
        }, 1000); // matches updated CSS transition time
        
        // Update reference
        currentSlide = nextSlide;
        currentSlide.style.zIndex = -3; // reset z-index for next overlap
        
    }, 5000); // Slide every 5 seconds
}
