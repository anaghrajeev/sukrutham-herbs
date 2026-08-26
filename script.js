/* ====================================
   SUKRUTHAM HERBS — JavaScript
   ==================================== */

/* ---------- Navbar Scroll Effect ---------- */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

/* ---------- Mobile Menu Toggle ---------- */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
const mobileOverlay = document.getElementById('mobile-menu-overlay');
const closeBtn = document.getElementById('mobile-menu-close');

function openMenu() {
  mobileMenu.classList.add('open');
  mobileOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  mobileMenu.classList.remove('open');
  mobileOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', openMenu);
if (closeBtn) closeBtn.addEventListener('click', closeMenu);
if (mobileOverlay) mobileOverlay.addEventListener('click', closeMenu);

// Close mobile menu when a link is clicked
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeMenu);
});

/* ---------- Scroll Animation (IntersectionObserver) ---------- */
const animatedEls = document.querySelectorAll('[data-animate]');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger cards in grids
      const card = entry.target;
      const siblings = [...card.parentElement.children].filter(el => el.hasAttribute('data-animate'));
      const idx = siblings.indexOf(card);
      card.style.transitionDelay = `${idx * 0.08}s`;
      card.classList.add('visible');
      observer.unobserve(card);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

animatedEls.forEach(el => observer.observe(el));

/* ---------- Hero Floating Particles ---------- */
function createParticles() {
  const container = document.getElementById('hero-particles');
  if (!container) return;
  const count = 22;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = `${Math.random() * 100}%`;
    p.style.top = `${Math.random() * 100}%`;
    p.style.setProperty('--dur', `${6 + Math.random() * 8}s`);
    p.style.setProperty('--delay', `${-Math.random() * 8}s`);
    // Vary sizes
    const size = 3 + Math.random() * 5;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    // Vary opacity
    p.style.opacity = `${0.2 + Math.random() * 0.5}`;
    container.appendChild(p);
  }
}

createParticles();

/* ---------- Smooth Scroll for Anchor Links ---------- */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ---------- WhatsApp Float — Show after 2s ---------- */
const waBtn = document.getElementById('whatsapp-float');
if (waBtn) {
  waBtn.style.opacity = '0';
  waBtn.style.transform = 'scale(0.5)';
  waBtn.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  setTimeout(() => {
    waBtn.style.opacity = '1';
    waBtn.style.transform = 'scale(1)';
  }, 2000);
}

/* ---------- Price Bar Animation on Scroll ---------- */
const pbBars = document.querySelectorAll('.pb-bar');
const barObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const bar = entry.target;
      const target = bar.dataset.target || 100;
      bar.style.width = '0%';
      requestAnimationFrame(() => {
        setTimeout(() => {
          bar.style.width = target + '%';
        }, 200);
      });
      barObserver.unobserve(bar);
    }
  });
}, { threshold: 0.5 });

pbBars.forEach(bar => {
  const w = bar.style.width;
  bar.dataset.target = parseInt(w);
  bar.style.width = '0%';
  barObserver.observe(bar);
});

/* ---------- Counter Animation for Trust Stats ---------- */
function animateCounter(el, target, suffix = '') {
  let start = 0;
  const duration = 1800;
  const startTime = performance.now();
  function tick(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(eased * target);
    el.textContent = current.toLocaleString('en-IN') + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// Observe hero section for trust pill counter animation
const heroSection = document.querySelector('.hero');
let countersRun = false;
const counterObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting && !countersRun) {
    countersRun = true;
    const trustStrongs = document.querySelectorAll('.trust-pill strong');
    // 35+ and 2 Lakh+
    if (trustStrongs[0]) animateCounter(trustStrongs[0], 35, '+ Years');
    if (trustStrongs[1]) {
      let count = 0;
      const dur = 1800;
      const start = performance.now();
      function tick(now) {
        const prog = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - prog, 3);
        count = Math.floor(eased * 200000);
        const lakh = (count / 100000).toFixed(1);
        trustStrongs[1].textContent = lakh + ' Lakh+';
        if (prog < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }
  }
}, { threshold: 0.5 });

if (heroSection) counterObserver.observe(heroSection);

/* ---------- Navbar Active Link Highlight on Scroll ---------- */
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => {
    const top = sec.offsetTop - 100;
    if (window.scrollY >= top) current = sec.id;
  });
  navAnchors.forEach(a => {
    a.style.color = '';
    if (a.getAttribute('href') === '#' + current) {
      a.style.color = 'var(--gold-light)';
    }
  });
}, { passive: true });

/* ---------- Ingredients Auto-Carousel ---------- */
(function () {
  const track = document.getElementById('ing-track');
  const dots = document.querySelectorAll('.ing-dot');
  const prevBtn = document.getElementById('ing-prev');
  const nextBtn = document.getElementById('ing-next');
  const progressFill = document.getElementById('ing-progress');

  if (!track) return;

  const total = track.children.length;
  let current = 0;
  let autoInterval;
  const AUTO_DELAY = 4000;
  const TICK = 50;
  let elapsed = 0;

  function goTo(idx) {
    current = (idx + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
    elapsed = 0;
    if (progressFill) progressFill.style.width = '0%';
  }

  function startAuto() {
    clearInterval(autoInterval);
    autoInterval = setInterval(() => {
      elapsed += TICK;
      const pct = Math.min((elapsed / AUTO_DELAY) * 100, 100);
      if (progressFill) progressFill.style.width = pct + '%';
      if (elapsed >= AUTO_DELAY) goTo(current + 1);
    }, TICK);
  }

  if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); startAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); startAuto(); });
  dots.forEach(dot => dot.addEventListener('click', () => { goTo(+dot.dataset.idx); startAuto(); }));

  track.addEventListener('mouseenter', () => clearInterval(autoInterval));
  track.addEventListener('mouseleave', () => startAuto());

  // Add touch swipe support
  let touchStartX = 0;
  let touchEndX = 0;

  track.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
    clearInterval(autoInterval);
  }, { passive: true });

  track.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
    startAuto();
  }, { passive: true });

  function handleSwipe() {
    const minSwipeDist = 40;
    if (touchEndX < touchStartX - minSwipeDist) {
      goTo(current + 1); // swiped left
    }
    if (touchEndX > touchStartX + minSwipeDist) {
      goTo(current - 1); // swiped right
    }
  }

  goTo(0);
  startAuto();
})();

/* ---------- Supabase Testimonials ---------- */
(function () {
  const grid = document.getElementById('testimonials-grid');
  if (!grid) return;

  // Fallback testimonials (shown if Supabase is not configured or fails)
  const fallbackTestimonials = [
    {
      name: 'Suresh Rajan',
      location: 'Kochi, Kerala',
      quote: "I've been taking Diabetone for 8 months. My HbA1c has reduced from 9.2 to 6.8. My doctor is amazed. This is truly a miracle product!",
      rating: 5,
      is_featured: false
    },
    {
      name: 'Priya Menon',
      location: 'Thrissur, Kerala',
      quote: "My mother has been using Diabetone for over a year now. She feels more energetic, her sugar levels are stable and she hasn't had a single side effect.",
      rating: 5,
      is_featured: false
    },
    {
      name: 'Anand Kumar',
      location: 'Ernakulam, Kerala',
      quote: "As a diabetic for 15 years, I was sceptical about Ayurveda. But after 3 months on Diabetone, my fasting sugar dropped by 40 points. Completely natural, no side effects!",
      rating: 5,
      is_featured: true
    }
  ];

  function getInitials(name) {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  function renderStars(count) {
    let html = '<div class="stars">';
    for (let i = 0; i < count; i++) {
      html += '<i class="ph-fill ph-star"></i>';
    }
    html += '</div>';
    return html;
  }

  function renderTestimonials(testimonials) {
    grid.innerHTML = '';
    testimonials.forEach((t, idx) => {
      const card = document.createElement('div');
      card.className = 'testimonial-card' + (t.is_featured ? ' featured-testimonial' : '');
      card.setAttribute('data-animate', '');
      card.innerHTML = `
        ${renderStars(t.rating)}
        <p>"${t.quote}"</p>
        <div class="t-author">
          <div class="t-avatar">${getInitials(t.name)}</div>
          <div>
            <strong>${t.name}</strong>
            <small>${t.location}</small>
          </div>
        </div>
      `;
      grid.appendChild(card);

      // Re-observe for scroll animation
      card.style.transitionDelay = `${idx * 0.08}s`;
      observer.observe(card);
    });
  }

  async function loadTestimonials() {
    // Check if Supabase is configured
    if (typeof SUPABASE_URL === 'undefined' ||
        typeof SUPABASE_ANON_KEY === 'undefined' ||
        SUPABASE_URL === 'YOUR_SUPABASE_URL_HERE' ||
        SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY_HERE') {
      // Not configured — use fallback
      renderTestimonials(fallbackTestimonials);
      return;
    }

    try {
      const { createClient } = supabase;
      const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

      const { data, error } = await client
        .from('testimonials')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        renderTestimonials(fallbackTestimonials);
        return;
      }

      renderTestimonials(data);
    } catch (err) {
      console.warn('Supabase load failed, using fallback testimonials:', err);
      renderTestimonials(fallbackTestimonials);
    }
  }

  loadTestimonials();
})();
