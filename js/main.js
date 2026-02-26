document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');

    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', () => {
            nav.classList.toggle('mobile-open');
            mobileMenuBtn.classList.toggle('active');
        });

        // Close menu when clicking on a nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('mobile-open');
                mobileMenuBtn.classList.remove('active');
            });
        });
    }

    // FAQ functionality
    document.querySelectorAll('.faq-item').forEach(item => {
        item.querySelector('.faq-question').addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
            if (!isActive) item.classList.add('active');
        });
    });

    // Header scroll shadow
    window.addEventListener('scroll', () => {
        document.querySelector('.header').style.boxShadow = window.pageYOffset > 50 ? '0 2px 20px rgba(0,0,0,0.1)' : 'none';
    });

    // Contact form
    const form = document.querySelector('.contact-form');
    if (form) form.addEventListener('submit', function(e) { e.preventDefault(); alert('Hvala! Javimo se u 24h.'); form.reset(); });

    // Gallery lightbox
    document.querySelectorAll('.gallery-item').forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            const lb = document.createElement('div');
            lb.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.9);display:flex;align-items:center;justify-content:center;z-index:10000;cursor:pointer';
            lb.innerHTML = '<img src="'+img.src+'" style="max-width:90%;max-height:90%;border-radius:12px">';
            document.body.appendChild(lb);
            lb.onclick = () => lb.remove();
        });
    });
});
