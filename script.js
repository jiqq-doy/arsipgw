// Initialize Lucide Icons
lucide.createIcons();

// Custom Cursor Logic
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

window.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;

    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;

    // Add a slight delay for the outline for a smooth trailing effect
    cursorOutline.animate({
        left: `${posX}px`,
        top: `${posY}px`
    }, { duration: 500, fill: "forwards" });
});

// Hover effect for cursor on clickable elements
const interactables = document.querySelectorAll('a, button, .memory-item, .close-lightbox');
interactables.forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursorOutline.style.transform = 'translate(-50%, -50%) scale(1.5)';
        cursorOutline.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    });
    el.addEventListener('mouseleave', () => {
        cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
        cursorOutline.style.backgroundColor = 'transparent';
    });
});

// Audio Toggle Logic
const audio = document.getElementById('ambient-audio');
const audioToggle = document.getElementById('audio-toggle');
const audioIcon = document.getElementById('audio-icon');
let isPlaying = false;

// Set default volume to 20%
if (audio) {
    audio.volume = 0.2;
}

if (audioToggle) {
    audioToggle.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent triggering the window click
        if (isPlaying) {
            audio.pause();
            audioIcon.setAttribute('data-lucide', 'volume-x');
        } else {
            audio.volume = 0;
            audio.play();
            let fadeAudio = setInterval(() => {
                if (audio.volume < 0.18) {
                    audio.volume += 0.02;
                } else {
                    audio.volume = 0.2;
                    clearInterval(fadeAudio);
                }
            }, 100);
            audioIcon.setAttribute('data-lucide', 'volume-2');
        }
        lucide.createIcons();
        isPlaying = !isPlaying;
    });
}

// Trick for Autoplay: Play on first user interaction anywhere on the page
window.addEventListener('click', function initAudio() {
    if (!isPlaying && audio) {
        audio.volume = 0;
        audio.play().then(() => {
            audioIcon.setAttribute('data-lucide', 'volume-2');
            lucide.createIcons();
            isPlaying = true;
            let fadeAudio = setInterval(() => {
                if (audio.volume < 0.18) {
                    audio.volume += 0.02;
                } else {
                    audio.volume = 0.2;
                    clearInterval(fadeAudio);
                }
            }, 100);
        }).catch(err => console.log("Audio play blocked: ", err));

        // Remove this listener after it fires once
        window.removeEventListener('click', initAudio);
    }
}, { once: true });

// === OBSERVER 1: Early trigger — Judul & Foto ===
// Threshold rendah, muncul begitu section masuk viewport
const earlyObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
        }
    });
}, { root: null, rootMargin: '0px', threshold: 0.1 });

document.querySelectorAll('.fade-up, .hero-content, .memory-story-row').forEach(el => {
    earlyObserver.observe(el);
});

// === OBSERVER 2: Title-centered trigger — 3 Paragraf Utama ===
// Trigger ketika judul "Kenalin, gw ajiq" sudah hampir penuh terlihat (80%)
// Ini artinya user sudah benar-benar di dalam section narasi
const lateItems = document.querySelectorAll('.fade-up-late');
const sectionCenterObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Trigger masing-masing paragraf secara berurutan berdasarkan data-stagger
            lateItems.forEach(item => {
                const delay = (parseInt(item.dataset.stagger) - 1) * 800; // 800ms jeda antar paragraf
                setTimeout(() => {
                    item.classList.add('visible');
                }, delay);
            });
            obs.unobserve(entry.target);
        }
    });
}, { root: null, rootMargin: '0px', threshold: 0.8 });

// Observer pada judul h2 — bukan pada section keseluruhan
const aboutTitle = document.querySelector('.about .section-title');
if (aboutTitle) sectionCenterObserver.observe(aboutTitle);

// === OBSERVER 3: Element-scroll trigger — Blockquote & konten di bawah garis merah ===
// Masing-masing elemen punya observer sendiri, muncul ketika elemen tsb masuk viewport
const scrollObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
        }
    });
}, { root: null, rootMargin: '0px', threshold: 0.2 });

document.querySelectorAll('.fade-up-scroll').forEach(el => {
    scrollObserver.observe(el);
});


// Parallax effect for Memory Images
const parallaxImages = document.querySelectorAll('.parallax-img');
window.addEventListener('scroll', () => {
    parallaxImages.forEach(img => {
        const rect = img.getBoundingClientRect();
        const elementCenter = rect.top + rect.height / 2;
        const viewportCenter = window.innerHeight / 2;
        const offset = (elementCenter - viewportCenter) * 0.1;
        img.style.transform = `scale(1.15) translateY(${offset}px)`;
    });
});

// Memory Slideshow Logic
const slideContainers = document.querySelectorAll('.reveal-wrapper');

slideContainers.forEach(container => {
    const slides = container.querySelectorAll('.slide-img');
    const totalSlides = slides.length;
    
    // Start slideshow only if there are multiple slides
    if (totalSlides > 1) {
        let currentVisualIndex = 0; // Slide currently active (set in HTML)
        let shuffledIndices = [];
        
        function fillBag() {
            shuffledIndices = Array.from({length: totalSlides}, (_, i) => i);
            // Fisher-Yates shuffle
            for (let i = totalSlides - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
            }
            // Avoid showing the same image twice in a row when refilling the bag
            if (shuffledIndices[0] === currentVisualIndex) {
                [shuffledIndices[0], shuffledIndices[totalSlides - 1]] = [shuffledIndices[totalSlides - 1], shuffledIndices[0]];
            }
        }
        
        fillBag();
        
        setInterval(() => {
            const oldSlide = slides[currentVisualIndex];
            
            // Add fading class for blur out effect (2s transition)
            oldSlide.classList.remove('active');
            oldSlide.classList.add('fading');
            
            // Get next random slide
            const nextIndex = shuffledIndices.shift();
            currentVisualIndex = nextIndex;
            const newSlide = slides[currentVisualIndex];
            
            // Refill the bag if empty
            if (shuffledIndices.length === 0) {
                fillBag();
            }
            
            // Wait 2s for the fade out to complete before fading in the new one
            setTimeout(() => {
                oldSlide.classList.remove('fading');
                newSlide.classList.add('active');
            }, 2000); 
        }, 7000);
    }
});

// Intro Curtain Logic
document.addEventListener("DOMContentLoaded", () => {
    const curtain = document.getElementById('intro-curtain');
    if (curtain) {
        // Hide curtain after intro text animation (4s) + buffer
        setTimeout(() => {
            curtain.classList.add('hidden');
            // Remove from DOM after transition completes
            setTimeout(() => {
                curtain.style.display = 'none';
            }, 1500); 
        }, 3800);
    }
});


