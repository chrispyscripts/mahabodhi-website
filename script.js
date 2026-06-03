// ===== Mahabodhi — interactions =====
document.addEventListener('DOMContentLoaded', () => {

  // Year in footer
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Sticky nav background on scroll
  const nav = document.getElementById('nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 30);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });
  links.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    })
  );

  // Reveal on scroll
  const reveals = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  reveals.forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 70}ms`;
    io.observe(el);
  });

  // Animated counters
  const counters = document.querySelectorAll('.stat__num');
  const animate = (el) => {
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || '';
    const dur = 1400;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.floor(eased * target);
      el.textContent = val.toLocaleString() + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString() + suffix;
    };
    requestAnimationFrame(step);
  };
  const cio = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { animate(e.target); cio.unobserve(e.target); }
    });
  }, { threshold: 0.6 });
  counters.forEach((c) => cio.observe(c));

  // Contact form (front-end demo) — only present on the home page
  const form = document.getElementById('contactForm');
  const note = document.getElementById('formNote');
  if (form) form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const btn = form.querySelector('button[type="submit"]');
    const original = btn.textContent;
    note.hidden = false;
    btn.textContent = '✓';
    form.reset();
    setTimeout(() => {
      note.hidden = true;
      btn.textContent = original; // restore current-language label
    }, 4000);
  });
});
