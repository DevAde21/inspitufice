let prompts = {};

async function loadPrompts() {
  try {
    const response = await fetch("prompts.json");
    if (!response.ok) throw new Error("Não foi possível carregar prompts.json");
    prompts = await response.json();
    initializeApp();
  } catch (error) {
    const promptText = document.getElementById("promptText");
    if (promptText) {
      promptText.textContent = "Não foi possível carregar as inspirações. Abra o projeto por um servidor local e confira se prompts.json está na mesma pasta.";
    }
    console.error(error);
  }
}

function initializeApp() {
  const categoryButtons = [...document.querySelectorAll(".category")];
  const promptText = document.getElementById("promptText");
  const generateBtn = document.getElementById("generateBtn");
  const copyBtn = document.getElementById("copyBtn");
  const toast = document.getElementById("toast");

  // O site começa com todos os caminhos selecionados.
  const activeCategories = new Set(Object.keys(prompts));
  let lastPrompt = "";
  let toastTimeout;

  function allPrompts() {
    return [...activeCategories].flatMap(category =>
      (prompts[category] || []).map(text => ({ text, category }))
    );
  }

  function pickPrompt() {
    const pool = allPrompts();
    if (!pool.length) return;

    let choices = pool.filter(item => item.text !== lastPrompt);
    if (!choices.length) choices = pool;
    const choice = choices[Math.floor(Math.random() * choices.length)];

    lastPrompt = choice.text;
    promptText.classList.remove("fade-in");
    void promptText.offsetWidth;
    promptText.textContent = choice.text;
    promptText.classList.add("fade-in");
  }

  function updateCategoryButtons() {
    categoryButtons.forEach(button => {
      button.setAttribute("aria-pressed", String(activeCategories.has(button.dataset.category)));
    });
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("visible");
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove("visible"), 2200);
  }

  categoryButtons.forEach(button => {
    button.addEventListener("click", () => {
      const category = button.dataset.category;

      if (activeCategories.has(category)) {
        // Mantém pelo menos um caminho selecionado.
        if (activeCategories.size === 1) {
          showToast("Mantenha pelo menos um caminho selecionado.");
          return;
        }
        activeCategories.delete(category);
      } else {
        activeCategories.add(category);
      }

      updateCategoryButtons();
      pickPrompt();
    });
  });

  generateBtn.addEventListener("click", pickPrompt);

  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(promptText.textContent);
      showToast("Prompt copiado!");
    } catch {
      const field = document.createElement("textarea");
      field.value = promptText.textContent;
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      const success = document.execCommand("copy");
      field.remove();
      showToast(success ? "Prompt copiado!" : "Não foi possível copiar automaticamente.");
    }
  });

  updateCategoryButtons();
  pickPrompt();
}

document.addEventListener("DOMContentLoaded", loadPrompts);
