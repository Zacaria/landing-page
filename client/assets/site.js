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
    if (window.innerWidth > 800) setMenu(false);
  });
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const revealElements = [...document.querySelectorAll('[data-reveal]')];

if (reducedMotion.matches || !('IntersectionObserver' in window)) {
  revealElements.forEach(element => element.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
  );

  document.documentElement.classList.add('motion-ready');
  revealElements.forEach((element, index) => {
    element.style.transitionDelay = `${(index % 4) * 70}ms`;
    revealObserver.observe(element);
  });
}

const pointerField = document.querySelector('[data-pointer-field]');
const finePointer = window.matchMedia('(pointer: fine)');

if (pointerField && finePointer.matches && !reducedMotion.matches) {
  pointerField.addEventListener('pointermove', event => {
    const bounds = pointerField.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 14;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 14;

    pointerField.style.setProperty('--pointer-x', `${x.toFixed(2)}px`);
    pointerField.style.setProperty('--pointer-y', `${y.toFixed(2)}px`);
  });

  pointerField.addEventListener('pointerleave', () => {
    pointerField.style.setProperty('--pointer-x', '0px');
    pointerField.style.setProperty('--pointer-y', '0px');
  });
}

const principles = document.querySelector('[data-principles]');

if (principles) {
  const principleItems = [...principles.querySelectorAll('[data-principle-item]')];
  const principleIndex = principles.querySelector('[data-principle-index]');
  const principleStatement = principles.querySelector('[data-principle-statement]');
  const principlePoint = principles.querySelector('[data-principle-point]');

  const selectPrinciple = item => {
    principleItems.forEach(otherItem => {
      if (otherItem !== item) otherItem.removeAttribute('open');
    });

    if (principleIndex) principleIndex.textContent = item.dataset.index;
    if (principleStatement) principleStatement.textContent = item.dataset.statement;
    if (principlePoint) {
      principlePoint.setAttribute('cx', item.dataset.pointX);
      principlePoint.setAttribute('cy', item.dataset.pointY);
    }
  };

  principleItems.slice(1).forEach(item => item.removeAttribute('open'));
  principleItems.forEach(item => {
    item.addEventListener('toggle', () => {
      if (item.open) selectPrinciple(item);
    });
  });
}

const sectionLinks = [...document.querySelectorAll('[data-section-link]')];
const trackedSections = sectionLinks
  .map(link => ({ link, section: document.querySelector(link.hash) }))
  .filter(item => item.section);

if (trackedSections.length && 'IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(
    entries => {
      const visibleEntry = entries
        .filter(entry => entry.isIntersecting)
        .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];

      if (!visibleEntry) return;

      trackedSections.forEach(({ link, section }) => {
        if (section === visibleEntry.target) {
          link.setAttribute('aria-current', 'location');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    },
    { rootMargin: '-20% 0px -65% 0px', threshold: [0, 0.01, 0.25] }
  );

  trackedSections.forEach(({ section }) => sectionObserver.observe(section));
}

if (currentYear) {
  currentYear.textContent = String(new Date().getFullYear());
}
