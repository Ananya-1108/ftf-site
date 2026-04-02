/* ============================================================
   Fridge to Fork — Marketing Site JS
   ============================================================ */

// ── Supabase Config ──
// Replace these with your actual Supabase project values from:
// https://supabase.com/dashboard → your project → Settings → API
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_PUBLIC_KEY';

let supabaseClient = null;
try {
  if (window.supabase && SUPABASE_URL !== 'https://YOUR_PROJECT_ID.supabase.co') {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
} catch (e) {
  console.warn('Supabase not configured yet:', e.message);
}

// ── Nav: scroll shadow + mobile menu ──
const nav = document.getElementById('nav');
const hamburger = document.getElementById('hamburger');
const navMobile = document.getElementById('navMobile');

window.addEventListener('scroll', () => {
  if (!nav) return;
  if (window.scrollY > 12) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
}, { passive: true });

hamburger?.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navMobile?.classList.toggle('open');
});

// Close mobile nav on link click
navMobile?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger?.classList.remove('open');
    navMobile?.classList.remove('open');
  });
});

// ── Scroll Fade-in Animations ──
function initFadeIn() {
  const els = document.querySelectorAll('.fade-in');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
}

// ── Waitlist Form (index.html) ──
function initWaitlistForm() {
  const form = document.getElementById('waitlistForm');
  const success = document.getElementById('waitlistSuccess');
  const btn = document.getElementById('wlBtn');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name  = document.getElementById('wlName')?.value.trim();
    const email = document.getElementById('wlEmail')?.value.trim();
    const school = document.getElementById('wlSchool')?.value.trim();

    if (!name || !email) return;

    btn.disabled = true;
    btn.textContent = 'Saving your spot…';

    let saved = false;

    // Try Supabase first
    if (supabaseClient) {
      try {
        const { error } = await supabase
          .from('waitlist')
          .insert([{ name, email, school: school || null, created_at: new Date().toISOString() }]);

        if (!error) {
          saved = true;
        } else {
          console.error('Supabase error:', error.message);
        }
      } catch (err) {
        console.warn('Supabase insert failed (waitlist):', err.message);
      }
    }

    // Fallback: store in localStorage (demo mode)
    if (!saved) {
      const existing = JSON.parse(localStorage.getItem('ftf_waitlist') || '[]');
      existing.push({ name, email, school, ts: Date.now() });
      localStorage.setItem('ftf_waitlist', JSON.stringify(existing));
      console.info('Demo mode: saved to localStorage. Configure Supabase for production.');
    }

    // Show success regardless
    form.style.display = 'none';
    success.style.display = 'flex';
  });
}

// ── Contact Form (contact.html) ──
function initContactForm() {
  const form = document.getElementById('contactForm');
  const success = document.getElementById('contactSuccess');
  const btn = document.getElementById('ctBtn');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name    = document.getElementById('ctName')?.value.trim();
    const email   = document.getElementById('ctEmail')?.value.trim();
    const subject = document.getElementById('ctSubject')?.value;
    const message = document.getElementById('ctMsg')?.value.trim();

    if (!name || !email || !message) return;

    btn.disabled = true;
    btn.textContent = 'Sending…';

    let saved = false;

    if (supabaseClient) {
      try {
        const { error } = await supabase
          .from('contact_messages')
          .insert([{ name, email, subject, message, created_at: new Date().toISOString() }]);

        if (!error) saved = true;
        else console.error('Supabase error:', error.message);
      } catch (err) {
        console.warn('Supabase insert failed:', err.message);
      }
    }

    if (!saved) {
      const msgs = JSON.parse(localStorage.getItem('ftf_contact') || '[]');
      msgs.push({ name, email, subject, message, ts: Date.now() });
      localStorage.setItem('ftf_contact', JSON.stringify(msgs));
    }

    form.style.display = 'none';
    success.style.display = 'flex';
  });
}

// ── Mockup Typing Animation (index.html hero) ──
function initMockupTyping() {
  const genEl = document.querySelector('.mockup-generating span');
  if (!genEl) return;

  const dots = ['…', '.. ', '.  '];
  let i = 0;
  setInterval(() => {
    i = (i + 1) % dots.length;
    genEl.textContent = `AI generating 12 more recipes${dots[i]}`;
  }, 500);
}

// ── Demo chips on how-it-works.html ──
function initDemoChips() {
  document.querySelectorAll('.demo-chip').forEach(chip => {
    if (chip.textContent.includes('+')) return; // skip "Add" chip
    chip.addEventListener('click', () => chip.classList.toggle('active'));
  });
}

// ── Init on DOM ready ──
document.addEventListener('DOMContentLoaded', () => {
  initFadeIn();
  initWaitlistForm();
  initContactForm();
  initMockupTyping();
  initDemoChips();

  // Trigger visible immediately for elements already in view
  setTimeout(() => {
    document.querySelectorAll('.fade-in').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.95) {
        el.classList.add('visible');
      }
    });
  }, 50);
});
