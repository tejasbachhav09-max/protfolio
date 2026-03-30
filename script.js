// 1. Scroll Reveal Animation (Fade In) - Placed at the top so it always runs
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('appear');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(element => {
    observer.observe(element);
});

// Ensure immediate view items appear immediately if already in view
setTimeout(() => {
    document.querySelectorAll('.fade-in').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
            el.classList.add('appear');
        }
    });
}, 100);

// 2. Initialize Feather Icons safely
try {
    if (typeof feather !== 'undefined') {
        feather.replace();
    } else {
        console.warn('Feather icons could not be loaded.');
    }
} catch (e) {
    console.error('Error loading feather icons:', e);
}

// 3. Navbar & Menu Logic
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });
}

const navbar = document.getElementById('navbar');
if (navbar) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(6, 6, 8, 0.95)';
            navbar.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
        } else {
            navbar.style.background = 'rgba(6, 6, 8, 0.8)';
            navbar.style.boxShadow = 'none';
        }
    });
}

// 4. Booking Modal Logic
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
        // close modal if user clicks outside of the modal container
        if (e.target === bookingModal) {
            bookingModal.classList.remove('active');
        }
    });
}

// 5. Set minimum date to today (prevent booking in the past)
const dateInput = document.getElementById('preferredDate');
if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
}

// 6. Supabase Integration
const supabaseUrl = 'https://hdizxldtzuyeegiqmrah.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkaXp4bGR0enV5ZWVnaXFtcmFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3ODk2MTEsImV4cCI6MjA5MDM2NTYxMX0.fCrNyQllJZnXGECRvuSpyRmAuK-8cO1uAbfpORs0aLc';

let supabaseClient = null;
try {
    if (typeof supabase !== 'undefined') {
        supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
    } else if (window.supabase) {
        supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
    } else {
        console.warn('Supabase client library not found.');
    }
} catch (e) {
    console.error('Failed to initialize Supabase:', e);
}

const bookingForm = document.getElementById('bookingForm');
const bookingSubmitBtn = document.getElementById('bookingSubmitBtn');

if (bookingForm && bookingSubmitBtn) {
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!supabaseClient) {
            alert('Database connection failed. Please ensure you are connected to the internet.');
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
            const { data, error } = await supabaseClient
                .from('leads')
                .insert([payload]);

            if (error) throw error;

            alert('🎉 Demo booked successfully for ' + payload.preferred_date + ' at ' + payload.preferred_time + '!\n\nWe will confirm your slot shortly.');
            bookingForm.reset();
            bookingModal.classList.remove('active');
        } catch (error) {
            console.error('Error inserting lead:', error);
            alert('Error: ' + (error.message || JSON.stringify(error)));
        } finally {
            bookingSubmitBtn.innerText = originalBtnText;
            bookingSubmitBtn.disabled = false;
        }
    });
}
