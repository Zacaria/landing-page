(() => {
  let mode = "system";
  try {
    const saved = localStorage.getItem("hsc-theme");
    if (["light", "dark", "system"].includes(saved)) mode = saved;
  } catch {
    /* Storage can be disabled; Auto still works. */
  }
  window.hscThemeMode = mode;
  document.documentElement.dataset.theme =
    mode === "system"
      ? matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : mode;
})();
