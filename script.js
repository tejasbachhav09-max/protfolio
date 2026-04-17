// 1. Interaction Engine - Obsidian Kinetic

// --- CUSTOM CURSOR & SPOTLIGHT ---
const cursor = document.getElementById('cursor');
const spotlight = document.getElementById('cursor-spotlight');
const glows = document.querySelectorAll('.glow');

let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Move spotlight instantly for zero lag
    if (spotlight) {
        spotlight.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    }

    // Parallax background glows
    glows.forEach((glow, index) => {
        const speed = (index + 1) * 2;
        const x = (window.innerWidth / 2 - mouseX) / (25 * speed);
        const y = (window.innerHeight / 2 - mouseY) / (25 * speed);
        glow.style.transform = `translate(${x}px, ${y}px)`;
    });
});

// Smooth cursor follow
function animateCursor() {
    cursorX += (mouseX - cursorX) * 0.15;
    cursorY += (mouseY - cursorY) * 0.15;
    
    if (cursor) {
        cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
    }
    requestAnimationFrame(animateCursor);
}
animateCursor();

// --- MAGNETIC & TILT ELEMENTS ---
const interactives = document.querySelectorAll('[data-magnetic], .card, .service-card, .price-header-card, .btn, .testimonial-card, .stat-card, .addon-card, .cta-box, .feature-table-card');

interactives.forEach(el => {
    el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Localized Glow (for buttons and cards)
        el.style.setProperty('--mouse-x', `${x}px`);
        el.style.setProperty('--mouse-y', `${y}px`);

        // Magnetic / Tilt Logic
        if (el.hasAttribute('data-magnetic') || el.classList.contains('btn')) {
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const moveX = (x - centerX) * 0.2;
            const moveY = (y - centerY) * 0.2;
            el.style.transform = `translate(${moveX}px, ${moveY}px)`;
        } else {
            // General Tilt for cards
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (centerY - y) / 15;
            const rotateY = (x - centerX) / 15;
            el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px) scale(1.01)`;
        }
        
        // Cursor Feedback
        if (cursor) cursor.classList.add('active');
    });

    el.addEventListener('mouseleave', () => {
        el.style.transform = ``;
        if (cursor) cursor.classList.remove('active');
    });
});

// --- KINETIC SCROLLING (LENIS) ---
try {
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
} catch (e) {
    console.warn('Lenis scroll engine failed to initialize:', e);
}

// 2. Scroll Reveal Animation (Fade In)
const observerOptions = {
    threshold: 0.15
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('appear');
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(element => {
    observer.observe(element);
});

// 3. Initialize Feather Icons
try {
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
} catch (e) {}

// 4. Navbar & Menu Logic
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

// 5. Booking Modal Logic
const bookingModal = document.getElementById('bookingModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const openModalBtns = document.querySelectorAll('.open-modal-btn');

if (bookingModal && closeModalBtn) {
    openModalBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            bookingModal.classList.add('active');
        });
    });

    closeModalBtn.addEventListener('click', () => {
        bookingModal.classList.remove('active');
    });

    bookingModal.addEventListener('click', (e) => {
        if (e.target === bookingModal) {
            bookingModal.classList.remove('active');
        }
    });
}

// 6. Supabase Integration
const supabaseUrl = SUPABASE_CONFIG.url;
const supabaseKey = SUPABASE_CONFIG.key;

let supabaseClient = null;
try {
    if (typeof supabase !== 'undefined') {
        supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
    }
} catch (e) {}

const bookingForm = document.getElementById('bookingForm');
const bookingSubmitBtn = document.getElementById('bookingSubmitBtn');

if (bookingForm && bookingSubmitBtn) {
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!supabaseClient) {
            alert('Database connection failed.');
            return;
        }

        const originalBtnText = bookingSubmitBtn.innerText;
        bookingSubmitBtn.innerText = 'Booking...';
        bookingSubmitBtn.disabled = true;

        const payload = {
            full_name: document.getElementById('fullName').value,
            work_email: document.getElementById('workEmail').value,
            phone: document.getElementById('phone').value,
            company_name: document.getElementById('companyName').value,
            preferred_date: document.getElementById('preferredDate').value,
            preferred_time: document.getElementById('preferredTime').value,
            bottleneck: document.getElementById('bottleneck').value
        };

        try {
            const { error } = await supabaseClient
                .from('leads')
                .insert([payload]);

            if (error) throw error;

            alert('🎉 Demo booked successfully for ' + payload.preferred_date + '!\nWe will confirm shortly.');
            bookingForm.reset();
            bookingModal.classList.remove('active');
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            bookingSubmitBtn.innerText = originalBtnText;
            bookingSubmitBtn.disabled = false;
        }
    });
}
