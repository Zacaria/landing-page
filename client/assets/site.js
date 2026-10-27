(() => {
  const themeButtons = [...document.querySelectorAll(".theme-choice")];
  const device = matchMedia("(prefers-color-scheme: dark)");
  function applyTheme() {
    const mode = window.hscThemeMode || "system";
    document.documentElement.dataset.theme =
      mode === "system" ? (device.matches ? "dark" : "light") : mode;
    themeButtons.forEach((button) =>
      button.setAttribute("aria-pressed", String(button.dataset.mode === mode)),
    );
  }
  themeButtons.forEach((button) =>
    button.addEventListener("click", () => {
      window.hscThemeMode = button.dataset.mode;
      try {
        localStorage.setItem("hsc-theme", window.hscThemeMode);
      } catch {
        /* Optional persistence. */
      }
      applyTheme();
    }),
  );
  device.addEventListener("change", applyTheme);
  applyTheme();

  const input = document.getElementById("search");
  if (!input) return;
  const rows = [...document.querySelectorAll(".post[data-search]")];
  const topicLinks = [...document.querySelectorAll("[data-topic-link]")];
  let topic = "";
  function filter() {
    const query = input.value.trim().toLocaleLowerCase();
    let count = 0;
    rows.forEach((row) => {
      const topics = JSON.parse(row.dataset.topics);
      row.hidden = !(
        row.dataset.search.toLocaleLowerCase().includes(query) &&
        (!topic || topics.includes(topic))
      );
      if (!row.hidden) count++;
    });
    document.getElementById("posts-label").textContent = query
      ? "RÉSULTATS :"
      : topic
        ? `NOTES ${topic.toUpperCase()} :`
        : "DERNIÈRES NOTES :";
    document.getElementById("no-results").hidden = !rows.length || count > 0;
    document.getElementById("result-count").textContent =
      `${count} ${count === 1 ? "note trouvée" : "notes trouvées"}`;
    document.querySelectorAll("[data-featured]").forEach((el) => {
      el.hidden = !!query || !!topic;
    });
    topicLinks.forEach((a) => {
      if (a.dataset.topicLink === topic) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  }
  input.addEventListener("input", filter);
  topicLinks.forEach((a) =>
    a.addEventListener("click", (event) => {
      event.preventDefault();
      topic = a.dataset.topicLink;
      filter();
    }),
  );
  document.querySelectorAll("[data-all]").forEach((a) =>
    a.addEventListener("click", (event) => {
      event.preventDefault();
      topic = "";
      input.value = "";
      filter();
      document.getElementById("posts").scrollIntoView();
    }),
  );
  // Topic links on article pages still work as normal navigable links.
  const requestedTopic = new URLSearchParams(location.search).get("topic");
  if (
    requestedTopic &&
    topicLinks.some((a) => a.dataset.topicLink === requestedTopic)
  )
    topic = requestedTopic;
  filter();
})();
