(() => {
  const form = document.querySelector("[data-interest]");
  if (!form) return;
  const status = form.querySelector("[data-interest-status]");
  const button = form.querySelector("button[type=submit]");
  const generic =
    "Votre demande n’a pas pu être enregistrée. Réessayez dans un moment, ou écrivez-moi à z@havesomecode.io.";
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (button.disabled) return;
    button.disabled = true;
    status.className = "interest-status";
    status.textContent = "";
    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new URLSearchParams(new FormData(form)),
      });
      const result = await response.json();
      if (result.ok) {
        form.reset();
        form.classList.add("is-done");
        status.classList.add("is-ok");
        status.textContent = result.message;
        status.tabIndex = -1;
        status.focus();
        return;
      }
      status.classList.add("is-error");
      status.textContent = result.message || generic;
    } catch {
      status.classList.add("is-error");
      status.textContent = generic;
    }
    button.disabled = false;
  });
})();
