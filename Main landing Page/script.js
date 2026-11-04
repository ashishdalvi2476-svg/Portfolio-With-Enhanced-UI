const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');
const navLinks = document.querySelectorAll('.main-nav a');
const siteHeader = document.querySelector('.site-header');
const heroSection = document.querySelector('.hero');

function updateHeaderTheme() {
  if (!siteHeader || !heroSection) return;
  const heroBottom = heroSection.getBoundingClientRect().bottom;
  siteHeader.classList.toggle('is-scrolled', heroBottom <= siteHeader.offsetHeight + 24);
}

updateHeaderTheme();
window.addEventListener('scroll', updateHeaderTheme, { passive: true });
window.addEventListener('resize', updateHeaderTheme);

function closeMenu() {
  menuButton?.setAttribute('aria-expanded', 'false');
  menuButton?.setAttribute('aria-label', 'Open navigation');
  navigation?.classList.remove('is-open');
  siteHeader?.classList.remove('menu-active');
  document.body.classList.remove('menu-open');
}

menuButton?.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
  navigation?.classList.toggle('is-open', !isOpen);
  siteHeader?.classList.toggle('menu-active', !isOpen);
  document.body.classList.toggle('menu-open', !isOpen);
});

navLinks.forEach((link) => link.addEventListener('click', closeMenu));
navigation?.addEventListener('click', (event) => {
  // Tapping the blurred backdrop (outside the menu links) closes the menu.
  if (event.target === navigation) closeMenu();
});
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});

// Reveal sections as they enter the viewport. Falls back gracefully when unsupported.
const revealElements = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add('is-visible'));
}

// Reading progress indicator.
const progressBar = document.querySelector('.scroll-progress');
const backTopButton = document.querySelector('.back-top');
const siteFooter = document.querySelector('.site-footer');
function updateScrollProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  if (progressBar) progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  if (backTopButton) {
    // Keep the floating control out of the footer's visual area.
    const footerIsVisible = siteFooter && siteFooter.getBoundingClientRect().top < window.innerHeight;
    const showButton = window.scrollY > 520 && !footerIsVisible;
    backTopButton.classList.toggle('is-visible', showButton);
    backTopButton.setAttribute('aria-hidden', String(!showButton));
    backTopButton.tabIndex = showButton ? 0 : -1;
  }
}
window.addEventListener('scroll', updateScrollProgress, { passive: true });
updateScrollProgress();

// Keep the footer year current.
const yearElement = document.getElementById('year');
if (yearElement) yearElement.textContent = new Date().getFullYear();

// Let the central AD emblem gently follow the pointer while the galaxy panel is hovered.
// The movement is deliberately subtle and resets smoothly when the pointer leaves.
const galaxyPanel = document.querySelector('.hero-art');
const adEmblem = galaxyPanel?.querySelector('.art-monogram-image');
if (galaxyPanel && adEmblem && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const moveEmblem = (event) => {
    const bounds = galaxyPanel.getBoundingClientRect();
    const offsetX = (event.clientX - bounds.left - bounds.width / 2) / (bounds.width / 2);
    const offsetY = (event.clientY - bounds.top - bounds.height / 2) / (bounds.height / 2);
    const x = Math.max(-1, Math.min(1, offsetX)) * 13;
    const y = Math.max(-1, Math.min(1, offsetY)) * 13;
    adEmblem.style.setProperty('--emblem-x', `${x.toFixed(1)}px`);
    adEmblem.style.setProperty('--emblem-y', `${y.toFixed(1)}px`);
  };
  galaxyPanel.addEventListener('pointerenter', () => galaxyPanel.classList.add('is-emblem-hovered'));
  galaxyPanel.addEventListener('pointermove', moveEmblem);
  galaxyPanel.addEventListener('pointerleave', () => {
    galaxyPanel.classList.remove('is-emblem-hovered');
    adEmblem.style.setProperty('--emblem-x', '0px');
    adEmblem.style.setProperty('--emblem-y', '0px');
  });
}


// Floating back-to-top control: shown after the visitor scrolls down the page.
backTopButton?.addEventListener('click', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
});


// Cinematic first-view intro: the AD emblem appears at screen centre, then
// travels into the exact position of the hero emblem as the page is revealed.
(() => {
  const intro = document.querySelector('#portfolio-intro');
  const introEmblem = intro?.querySelector('.intro-emblem');
  const introBackdrop = intro?.querySelector('.intro-backdrop');
  const introCaption = intro?.querySelector('.intro-caption');
  const heroEmblem = document.querySelector('.hero-art .art-monogram-image');
  if (!intro || !introEmblem || !introBackdrop || !heroEmblem) return;

  const finishIntro = () => {
    intro.remove();
    document.body.classList.remove('portfolio-intro-running');
  };
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion || !introEmblem.animate) {
    finishIntro();
    return;
  }

  document.body.classList.add('portfolio-intro-running');
  const pause = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));
  const centerTransform = 'translate3d(-50%, -50%, 0) scale(1)';

  (async () => {
    try {
      // Phase 1: a soft focus-to-sharp reveal, with a growing but restrained glow.
      const reveal = introEmblem.animate([
        { opacity: 0, transform: 'translate3d(-50%, -50%, 0) scale(.72)', filter: 'blur(12px) brightness(.65) drop-shadow(0 0 0 rgba(232,96,46,0))' },
        { opacity: 1, transform: 'translate3d(-50%, -50%, 0) scale(1.045)', filter: 'blur(0) brightness(1.28) drop-shadow(0 0 34px rgba(232,96,46,.60))', offset: .78 },
        { opacity: 1, transform: centerTransform, filter: 'blur(0) brightness(1.08) drop-shadow(0 0 22px rgba(232,96,46,.38))' }
      ], { duration: 1900, easing: 'cubic-bezier(.2,.7,.22,1)', fill: 'forwards' });
      await reveal.finished;
      if (introCaption?.animate) {
        introCaption.animate([
          { opacity: 0, transform: 'translateX(-50%) translateY(8px)' },
          { opacity: 1, transform: 'translateX(-50%) translateY(0)' }
        ], { duration: 520, easing: 'ease-out', fill: 'forwards' });
      }
      // Give the fully revealed AD mark a moment to breathe before it moves.
      await pause(1300);

      // Recalculate after layout/fonts have settled so the emblem lands precisely.
      const target = heroEmblem.getBoundingClientRect();
      const dx = target.left + target.width / 2 - window.innerWidth / 2;
      const dy = target.top + target.height / 2 - window.innerHeight / 2;
      const targetScale = Math.max(.28, Math.min(1, target.width / 210));
      const middleScale = 1 + (targetScale - 1) * .76;
      const move = introEmblem.animate([
        { transform: centerTransform, opacity: 1, filter: 'blur(0) brightness(1.08) drop-shadow(0 0 22px rgba(232,96,46,.38))', offset: 0 },
        { transform: `translate3d(calc(-50% + ${dx * .76}px), calc(-50% + ${dy * .76}px), 0) scale(${middleScale})`, opacity: 1, offset: .76 },
        { transform: `translate3d(calc(-50% + ${dx}px), calc(-50% + ${dy}px), 0) scale(${targetScale})`, opacity: 1 }
      ], { duration: 2300, easing: 'cubic-bezier(.68,0,.22,1)', fill: 'forwards' });
      introCaption?.animate?.([{ opacity: 1 }, { opacity: 0 }], { duration: 500, fill: 'forwards' });
      intro.querySelectorAll('.intro-orbit').forEach((orbit) => {
        orbit.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 1900, easing: 'ease-in', fill: 'forwards' });
      });
      introBackdrop.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 2200, easing: 'cubic-bezier(.55,0,.8,.25)', fill: 'forwards' });
      await move.finished;
      finishIntro();
    } catch (error) {
      // A cancelled animation or interrupted navigation must never leave a black screen.
      finishIntro();
    }
  })();
})();
