(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const cards = document.querySelectorAll("[data-demo]");
  const states = new WeakMap();
  const animate = window.Motion.animate;
  function stop(card) {
    const state = states.get(card);
    if (!state) return;
    state.timers.forEach(clearTimeout);
    state.animations.forEach((animation) => animation.cancel());
    card.querySelector(".demo-visual").innerHTML = state.html;
    states.delete(card);
  }
  function schedule(state, fn, delay) {
    state.timers.push(setTimeout(fn, delay));
  }
  function tri(card, state) {
    const bins = card.querySelectorAll(".bin b");
    bins.forEach((bin) => (bin.textContent = "0"));
    const visual = card.querySelector(".demo-visual");
    const messages = [
      ["Devis · Lefort", 0],
      ["Devis incomplet", 1],
      ["Facture F002", 2],
      ["Commande · Durand", 0],
      ["Délai ?", 1],
      ["Devis · Moulin", 0],
    ];
    messages.forEach(([label, index], i) => {
      schedule(
        state,
        () => {
          const envelope = document.createElement("span");
          envelope.className = "envelope";
          envelope.textContent = label;
          visual.append(envelope);
          const offset =
            bins[index].getBoundingClientRect().left +
            bins[index].getBoundingClientRect().width / 2 -
            visual.getBoundingClientRect().left -
            visual.clientWidth / 2;
          state.animations.push(
            animate(
              envelope,
              { x: [0, 0, offset], y: [-20, 10, 110], opacity: [0, 1, 0] },
              { duration: 1.1 },
            ),
          );
          schedule(
            state,
            () => {
              envelope.remove();
              bins[index].textContent = String(
                Number(bins[index].textContent) + 1,
              );
            },
            1100,
          );
        },
        i * 800,
      );
    });
  }
  function matin(card, state) {
    const subject = card.querySelector(".subject");
    const text = subject.textContent;
    const lines = [...card.querySelectorAll(".mail-reveal")];
    lines.forEach((line) => {
      line.hidden = true;
    });
    subject.textContent = "";
    const caret = document.createElement("span");
    caret.className = "caret";
    caret.setAttribute("aria-hidden", "true");
    subject.append(caret);
    for (let i = 1; i <= text.length; i++) {
      schedule(
        state,
        () => {
          subject.textContent = text.slice(0, i);
          if (i < text.length) subject.append(caret);
        },
        i * 22,
      );
    }
    lines.forEach((line, i) => {
      schedule(
        state,
        () => {
          line.hidden = false;
          state.animations.push(
            animate(line, { opacity: [0, 1], y: [6, 0] }, { duration: 0.4 }),
          );
        },
        text.length * 22 + 150 + i * 240,
      );
    });
  }
  function prix(card, state) {
    card.querySelectorAll(".prow").forEach((row, i) => {
      const status = row.querySelector(".st");
      const bar = row.querySelector(".new");
      status.className = "st";
      status.textContent = "en attente";
      bar.style.visibility = "hidden";
      schedule(
        state,
        () => {
          bar.style.visibility = "visible";
          state.animations.push(
            animate(bar, { scaleX: [0, 1] }, { duration: 0.8 }),
          );
          const change = row.dataset.change;
          if (change === "inchangé") {
            status.textContent = change;
          } else {
            status.textContent = `${change} · à valider`;
            status.classList.add("wait");
            schedule(
              state,
              () => {
                status.textContent = "validé ✓";
                status.className = "st ok";
              },
              1800 + i * 250,
            );
          }
        },
        500 + i * 420,
      );
    });
  }
  function echeance(card, state) {
    const cursor = card.querySelector(".cur");
    const toast = card.querySelector(".toast");
    const show = (text) => {
      toast.innerHTML = `<b>Rappel</b> · TVA à déclarer ${text} → Marc`;
      state.animations.push(
        animate(toast, { opacity: [0, 1], y: [12, 0] }, { duration: 0.35 }),
      );
    };
    toast.style.opacity = "0";
    state.animations.push(
      animate(
        cursor,
        { left: ["0%", "78%"] },
        { duration: 5.2, ease: "linear" },
      ),
    );
    schedule(state, () => show("dans 7 jours"), 1000);
    schedule(
      state,
      () =>
        state.animations.push(
          animate(toast, { opacity: [1, 0], y: [0, 12] }, { duration: 0.35 }),
        ),
      3000,
    );
    schedule(state, () => show("demain"), 4600);
  }
  const registry = { tri, matin, prix, echeance };
  function start(card) {
    stop(card);
    if (reduced.matches || document.hidden) return;
    const state = {
      html: card.querySelector(".demo-visual").innerHTML,
      timers: [],
      animations: [],
    };
    states.set(card, state);
    registry[card.dataset.demo](card, state);
    schedule(state, () => start(card), 8000);
  }
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach(({ target, isIntersecting }) => {
        target.dataset.visible = String(isIntersecting);
        if (isIntersecting) start(target);
        else stop(target);
      }),
    { threshold: 0.1 },
  );
  cards.forEach((card) => {
    observer.observe(card);
    card.querySelector(".restart").addEventListener("click", () => start(card));
  });
  function refresh() {
    cards.forEach((card) =>
      card.dataset.visible === "true" ? start(card) : stop(card),
    );
  }
  reduced.addEventListener("change", refresh);
  document.addEventListener("visibilitychange", refresh);
})();
