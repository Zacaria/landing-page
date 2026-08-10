const menuButton = document.querySelector('.menu');
const navigation = document.querySelector('.nav-links');
const currentYear = document.getElementById('currentYear');

function setMenu(open) {
  if (!menuButton || !navigation) return;

  navigation.classList.toggle('open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.textContent = open ? 'Close' : 'Menu';
  document.body.classList.toggle('menu-open', open);
}

if (menuButton && navigation) {
  menuButton.addEventListener('click', () => {
    setMenu(!navigation.classList.contains('open'));
  });

  navigation.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenu(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navigation.classList.contains('open')) {
      setMenu(false);
      menuButton.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 760) setMenu(false);
  });

  document.documentElement.classList.add('js');
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const revealElements = [...document.querySelectorAll('[data-reveal]')];

if (!reducedMotion.matches && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('motion-ready');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -7% 0px', threshold: 0.08 }
  );

  revealElements.forEach((element) => revealObserver.observe(element));
}

const sectionLinks = [...document.querySelectorAll('[data-section-link]')];
const trackedSections = sectionLinks
  .map((link) => ({ link, section: document.querySelector(link.hash) }))
  .filter(({ section }) => section);

if (trackedSections.length && 'IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];

      if (!visible) return;

      trackedSections.forEach(({ link, section }) => {
        if (section === visible.target) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    },
    { rootMargin: '-20% 0px -65% 0px', threshold: [0.01, 0.2] }
  );

  trackedSections.forEach(({ section }) => sectionObserver.observe(section));
}

if (currentYear) currentYear.textContent = String(new Date().getFullYear());
