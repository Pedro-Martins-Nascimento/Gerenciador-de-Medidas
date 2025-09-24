// ===== MODEL =====
class Medida {
  constructor(nome, valor, unidade) {
    this.nome = nome;
    this.valor = valor;
    this.unidade = unidade;
  }
}

// ===== CONTROLLER =====
class MedidaController {
  constructor() {
    this.storageKey = "medidas";
    this.medidas = this.carregarMedidas();
    this.view = new MedidaView(this);
    this.view.render(this.medidas);
  }

  adicionar(medida) {
    this.medidas.push(medida);
    this.salvarMedidas();
    this.view.render(this.medidas);
    showToast("Medida adicionada com sucesso!");
  }

  remover(index) {
    this.medidas.splice(index, 1);
    this.salvarMedidas();
    this.view.render(this.medidas);
    showToast("Medida removida.");
  }

  salvarMedidas() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.medidas));
  }

  carregarMedidas() {
    const raw = localStorage.getItem(this.storageKey);
    return raw ? JSON.parse(raw) : [];
  }

  filtrar(filtros) {
    return this.medidas.filter(m => {
      const nomeOk = (m.nome || '').toLowerCase().includes((filtros.nome || '').toLowerCase());
      const valorOk = !filtros.valor || (m.valor || '').toString().includes(filtros.valor);
      const unidadeOk = !filtros.unidade || filtros.unidade === "Todas" || m.unidade === filtros.unidade;
      return nomeOk && valorOk && unidadeOk;
    });
  }
}

// ===== VIEW =====
class MedidaView {
  constructor(controller) {
    this.controller = controller;

    // Elements
    this.form = document.getElementById("measurement-form");
    this.tableBody = document.getElementById("measurement-table-body");
    this.tableContainer = document.getElementById("table-container");
    this.emptyState = document.getElementById("empty-state");
    this.filtersSection = document.getElementById("filters-section");
    this.filterName = document.getElementById("filter-name");
    this.filterValue = document.getElementById("filter-value");
    this.filterUnit = document.getElementById("filter-unit");
    this.clearBtn = document.getElementById("clear-filters-btn");

    // Background layers
    this.bgLight = document.getElementById("bg-light");
    this.bgDark = document.getElementById("bg-dark");

    // Theme toggle elements
    this.themeToggle = document.getElementById("theme-toggle");
    this.toggleIndicator = document.getElementById("toggle-indicator");
    this.toggleIcon = document.getElementById("toggle-icon");
    this.htmlEl = document.documentElement;

    // Listeners
    this.form.addEventListener("submit", e => this.handleSubmit(e));
    if (this.filterName) this.filterName.addEventListener("input", () => this.applyFilters());
    if (this.filterValue) this.filterValue.addEventListener("input", () => this.applyFilters());
    if (this.filterUnit) this.filterUnit.addEventListener("change", () => this.applyFilters());
    if (this.clearBtn) this.clearBtn.addEventListener("click", () => this.clearFilters());
    if (this.themeToggle) this.themeToggle.addEventListener("click", () => this.toggleTheme());

    this.initThemeState();
  }

  initThemeState() {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = (saved === 'dark') || (!saved && prefersDark) || this.htmlEl.classList.contains('dark');
    if (isDark) this.htmlEl.classList.add('dark'); else this.htmlEl.classList.remove('dark');

    // inicializa opacidades (se tiver bg layers)
    if (this.bgLight && this.bgDark) {
      this.bgLight.style.opacity = isDark ? '0' : '1';
      this.bgDark.style.opacity = isDark ? '1' : '0';
    }

    this.updateToggleVisual(isDark, false);
  }

  updateToggleVisual(isDark, persist = true) {
    if (!this.toggleIndicator || !this.toggleIcon) return;
    if (isDark) {
      this.toggleIndicator.classList.add('translate-x-6');
      this.toggleIcon.textContent = 'dark_mode';
    } else {
      this.toggleIndicator.classList.remove('translate-x-6');
      this.toggleIcon.textContent = 'light_mode';
    }
    if (persist) localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }

  toggleTheme() {
    const nowDark = !this.htmlEl.classList.contains('dark');
    if (nowDark) this.htmlEl.classList.add('dark'); else this.htmlEl.classList.remove('dark');

    if (this.bgLight && this.bgDark) {
      this.bgLight.style.opacity = nowDark ? '0' : '1';
      this.bgDark.style.opacity = nowDark ? '1' : '0';
    }

    this.updateToggleVisual(nowDark, true);
  }

  handleSubmit(e) {
    e.preventDefault();
    const nome = document.getElementById("measurement-name").value.trim();
    const valor = document.getElementById("measurement-value").value.trim();
    const unidade = document.getElementById("measurement-unit").value;

    if (!nome || !valor) {
      showToast("Preencha todos os campos!", { type: 'danger' });
      return;
    }

    // Limite 15 caracteres, apenas letras no nome
    const nomeRegex = /^[A-Za-zÀ-ú ]{1,15}$/;
    if (!nomeRegex.test(nome)) {
      showToast("Nome inválido! Apenas letras (máx. 15).", { type: 'danger' });
      return;
    }

    // Valor numérico
    const valorNum = parseFloat(valor);
    if (isNaN(valorNum)) {
      showToast("Valor inválido! Digite apenas números.", { type: 'danger' });
      return;
    }

    this.controller.adicionar(new Medida(nome, valorNum, unidade));
    this.form.reset();
  }

  render(medidas) {
    this.tableBody.innerHTML = "";

    if (!medidas || medidas.length === 0) {
      this.emptyState.classList.remove("hidden");
      this.filtersSection.classList.add("hidden");
      this.tableContainer.classList.add("hidden");
      this.emptyState.querySelector('p').textContent = 'Nenhuma medida cadastrada ainda.';
      return;
    }

    this.emptyState.classList.add("hidden");
    this.filtersSection.classList.remove("hidden");
    this.tableContainer.classList.remove("hidden");

    medidas.forEach((m, index) => {
      const row = document.createElement("tr");
      row.classList.add("border-t", "border-border-light", "dark:border-border-dark");
      row.innerHTML = `
        <td class="p-2 sm:p-3 text-center">${m.nome}</td>
        <td class="p-2 sm:p-3 text-center">${m.valor}</td>
        <td class="p-2 sm:p-3 text-center">${m.unidade}</td>
        <td class="p-2 sm:p-3 text-center w-12">
          <button class="bg-danger text-white px-2 py-1 rounded-md hover:bg-red-700 transition font-bold uppercase text-sm sm:text-base" data-index="${index}">
            X
          </button>
        </td>
      `;
      row.querySelector("button").addEventListener("click", () => this.controller.remover(index));
      this.tableBody.appendChild(row);
    });
  }

  applyFilters() {
    const filtros = {
      nome: this.filterName ? this.filterName.value.trim() : '',
      valor: this.filterValue ? this.filterValue.value : '',
      unidade: this.filterUnit ? this.filterUnit.value : 'Todas',
    };
    const filtradas = this.controller.filtrar(filtros);

    if (filtradas.length === 0) {
      this.tableBody.innerHTML = "";
      this.tableContainer.classList.remove("hidden");
      this.emptyState.classList.remove("hidden");
      this.emptyState.querySelector('p').textContent = 'Nenhuma medida encontrada.';
      return;
    } else {
      this.emptyState.classList.add("hidden");
      this.emptyState.querySelector('p').textContent = 'Nenhuma medida cadastrada ainda.';
    }

    this.render(filtradas);
  }

  clearFilters() {
    if (this.filterName) this.filterName.value = "";
    if (this.filterValue) this.filterValue.value = "";
    if (this.filterUnit) this.filterUnit.value = "Todas";
    this.render(this.controller.medidas);
  }
}

function showToast(message, opts = {}) {
  // opts: { type: 'info'|'success'|'danger', link: '#', duration: ms }
  const toast = document.getElementById("toast");
  if (!toast) {
    console.warn("Toast não encontrado (id='toast').");
    return;
  }

  const duration = opts.duration || 4000;
  const type = opts.type || 'info';
  const link = opts.link || '#';

  // conteúdo
  const contentEl = toast.querySelector(".card-content");
  if (contentEl) contentEl.textContent = message;
  const linkEl = toast.querySelector(".card-link");
  if (linkEl) {
    linkEl.setAttribute("href", link);
    linkEl.style.display = opts.showLink === false ? "none" : ""; // opcional
  }

  // classes de cor (se quiser alterar visual por tipo)
  toast.classList.remove("toast-success", "toast-danger", "toast-info");
  if (type === 'success') toast.classList.add("toast-success");
  if (type === 'danger') toast.classList.add("toast-danger");
  if (type === 'info') toast.classList.add("toast-info");

  // garante que o elemento esteja visível, ativa animação
  toast.classList.remove("hidden", "hide");
  // force reflow para reiniciar animação
  void toast.offsetWidth;
  toast.classList.add("show");

  // cancela timeout anterior se existir
  if (toast._timeout) {
    clearTimeout(toast._timeout);
  }
  toast._timeout = setTimeout(() => {
    closeToast();
  }, duration);
}

function closeToast() {
  const toast = document.getElementById("toast");
  if (!toast) return;

  // remove classe de entrada e adiciona saída
  toast.classList.remove("show");
  toast.classList.add("hide");

  // quando animação de saída terminar, adiciona hidden
  const onEnd = () => {
    toast.classList.add("hidden");
    toast.classList.remove("hide");
    toast.removeEventListener("animationend", onEnd);
  };
  toast.addEventListener("animationend", onEnd);

  if (toast._timeout) {
    clearTimeout(toast._timeout);
    toast._timeout = null;
  }
}

// ===== APP INIT =====
document.addEventListener("DOMContentLoaded", () => {
  new MedidaController();
});
