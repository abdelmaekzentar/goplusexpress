/* ============================================================
   GO PLUS EXPRESS — main.js
   Navbar, scroll-to-top, ticker, general init
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Navbar scroll behaviour ─────────────────────────────────
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const current = window.scrollY;

    if (current > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Hide on scroll down, show on scroll up
    if (current > lastScroll && current > 300) {
      navbar.classList.add('nav-hidden');
    } else {
      navbar.classList.remove('nav-hidden');
    }
    lastScroll = current <= 0 ? 0 : current;

    // Scroll-to-top button
    const btn = document.getElementById('scroll-top');
    if (btn) btn.classList.toggle('visible', current > 500);
  }, { passive: true });

  // ── Mobile menu toggle ──────────────────────────────────────
  const menuBtn  = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');
  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded',
        navLinks.classList.contains('open') ? 'true' : 'false');
    });
    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }

  // ── Scroll-to-top button ────────────────────────────────────
  const scrollBtn = document.getElementById('scroll-top');
  if (scrollBtn) {
    scrollBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── Duplicate ticker tape for seamless loop ─────────────────
  const tickerInner = document.querySelector('.ticker-inner');
  if (tickerInner) {
    const original = tickerInner.innerHTML;
    tickerInner.innerHTML = original + original; // clone for infinite scroll
  }

  // ── Smooth scroll for anchor links ─────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = navbar ? navbar.offsetHeight + 8 : 72;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ── Active nav link on scroll (IntersectionObserver) ───────
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('#nav-links a[href^="#"]');

  if (sections.length && navAnchors.length) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navAnchors.forEach(a => {
            a.classList.toggle('nav-active',
              a.getAttribute('href') === `#${id}`);
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(s => observer.observe(s));
  }

  // ── Animate elements on scroll (fade-in-up) ─────────────────
  const animEls = document.querySelectorAll('.animate-on-scroll');
  if (animEls.length) {
    const aObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          aObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    animEls.forEach(el => aObserver.observe(el));
  }

  // ── Cookie / GDPR banner ────────────────────────────────────
  if (!localStorage.getItem('gpx_cookie_ok')) {
    const banner = document.getElementById('cookie-banner');
    if (banner) {
      banner.style.display = 'flex';
      banner.querySelector('#cookie-accept')?.addEventListener('click', () => {
        localStorage.setItem('gpx_cookie_ok', '1');
        banner.style.display = 'none';
      });
    }
  }

  // ── WhatsApp floating button tooltip ───────────────────────
  const waBtn = document.getElementById('wa-float');
  if (waBtn) {
    setTimeout(() => waBtn.classList.add('pulse'), 3000);
  }

  // ── Contact form validation ─────────────────────────────────
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      const name  = contactForm.querySelector('#c-name')?.value.trim();
      const email = contactForm.querySelector('#c-email')?.value.trim();
      const msg   = contactForm.querySelector('#c-message')?.value.trim();
      if (!name || !email || !msg) {
        showToast(t('formRequired') || 'Veuillez remplir tous les champs.', 'warning');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast(t('formEmailInvalid') || 'Email invalide.', 'warning');
        return;
      }
      // Mailto fallback (no backend)
      const subject = encodeURIComponent(`[SITE WEB] Message de ${name}`);
      const body    = encodeURIComponent(`Nom: ${name}\nEmail: ${email}\n\n${msg}`);
      window.location.href = `mailto:contact@goplusexpress.ma?subject=${subject}&body=${body}`;
      showToast(t('formSent') || 'Merci ! Votre message a été envoyé.', 'success');
      contactForm.reset();
    });
  }

  // ── Toast notification helper ───────────────────────────────
  // (global so simulators.js can call it too)
  window.showToast = function(msg, type = 'success') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = { success: 'fa-check-circle', warning: 'fa-exclamation-circle', error: 'fa-times-circle' }[type] || 'fa-info-circle';
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> ${msg}`;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  };

  // ── Guide tabs ──────────────────────────────────────────────
  window.showGuide = function(name) {
    document.querySelectorAll('.guide-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.guide-tab').forEach(t => t.classList.remove('active'));
    const panel = document.getElementById('guide-' + name);
    const tabs  = document.querySelectorAll('.guide-tab');
    if (panel) panel.classList.add('active');
    // activate the matching tab by checking its onclick
    tabs.forEach(t => {
      if (t.getAttribute('onclick') && t.getAttribute('onclick').includes(name)) {
        t.classList.add('active');
      }
    });
  };

  // ── Lazy load images ────────────────────────────────────────
  if ('IntersectionObserver' in window) {
    document.querySelectorAll('img[data-src]').forEach(img => {
      const imgObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imgObs.unobserve(img);
          }
        });
      });
      imgObs.observe(img);
    });
  }

  // ── Counter animation for stats ─────────────────────────────
  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    if (isNaN(target)) return;
    const duration = 1800;
    const start = performance.now();
    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out-expo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      el.textContent = Math.round(eased * target).toLocaleString('fr-MA');
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const counterEls = document.querySelectorAll('[data-count]');
  if (counterEls.length) {
    const cObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateCounter(e.target);
          cObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    counterEls.forEach(el => cObs.observe(el));
  }

  // ── Certifications carousel (auto-scroll if overflow) ──────
  const certStrip = document.querySelector('.certif-strip');
  if (certStrip) {
    let scrollDir = 1;
    setInterval(() => {
      certStrip.scrollLeft += scrollDir * 1;
      if (certStrip.scrollLeft + certStrip.clientWidth >= certStrip.scrollWidth) scrollDir = -1;
      if (certStrip.scrollLeft <= 0) scrollDir = 1;
    }, 30);
  }

});
