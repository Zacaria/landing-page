(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  if (reduced.matches || !window.Motion) return;
  const { animate } = window.Motion;
  if (innerWidth > 600) {
    document.querySelectorAll(".offer-sheet").forEach((sheet, index) => {
      const final = getComputedStyle(sheet).transform;
      const offset = (1.5 - index) * sheet.parentElement.clientWidth * 0.15;
      animate(
        sheet,
        { transform: [`translateX(${offset}px) rotate(0deg)`, final] },
        { duration: 0.8, delay: index * 0.08 },
      );
    });
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        observer.unobserve(target);
        const sort = target.querySelector(".offer-sort");
        if (sort) {
          const inbox = document.createElement("div");
          inbox.className = "sort-inbox";
          inbox.setAttribute("aria-hidden", "true");
          inbox.innerHTML =
            "<b>Boîte de réception</b><span>Demande de devis</span><span>Information</span><span>Demande urgente</span><span>À compléter</span>";
          target.append(inbox);
          animate(inbox, { opacity: [1, 1, 0] }, { duration: 1.5 });
          setTimeout(() => inbox.remove(), 1600);
        }
        target.querySelectorAll(".offer-reveal").forEach((item, index) => {
          animate(
            item,
            { opacity: [0, 1], translateY: [12, 0] },
            { duration: 0.5, delay: (sort ? 1 : 0) + index * 0.3 },
          );
        });
        const cursor = target.querySelector(".offer-cursor");
        if (cursor) animate(cursor, { left: ["0%", "95%"] }, { duration: 2 });
      });
    },
    { threshold: 0.15 },
  );
  document
    .querySelectorAll("[data-offer-visual]")
    .forEach((visual) => observer.observe(visual));
})();
