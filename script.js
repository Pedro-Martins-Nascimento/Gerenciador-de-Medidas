// Aplicação MVC: Model (Medida), Controller, View

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
  }

  remover(index) {
    this.medidas.splice(index, 1);
    this.salvarMedidas();
    this.view.render(this.medidas);
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

    // Background layers (para animação)
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

    // Inicializa estado do toggle (posição + ícone) e backgrounds
    this.initThemeState();
  }

  // configura estado inicial do tema e das camadas de fundo
  initThemeState() {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = (saved === 'dark') || (!saved && prefersDark) || this.htmlEl.classList.contains('dark');
    if (isDark) this.htmlEl.classList.add('dark'); else this.htmlEl.classList.remove('dark');

    // define opacidades iniciais sem animar (coloca valores imediatamente)
    this.bgLight.style.transition = 'none';
    this.bgDark.style.transition = 'none';

    if (isDark) {
      this.bgLight.style.opacity = '0';
      this.bgLight.style.transform = 'scale(1.02)';
      this.bgDark.style.opacity = '1';
      this.bgDark.style.transform = 'scale(1)';
    } else {
      this.bgLight.style.opacity = '1';
      this.bgLight.style.transform = 'scale(1)';
      this.bgDark.style.opacity = '0';
      this.bgDark.style.transform = 'scale(1.02)';
    }

    // force reflow then re-enable transitions (prevents initial animation)
    void this.bgLight.offsetWidth;
    void this.bgDark.offsetWidth;
    this.bgLight.style.transition = '';
    this.bgDark.style.transition = '';

    this.updateToggleVisual(isDark, false);
  }

  // atualiza visual do toggle (posição + ícone) e salva tema se persist=true
  updateToggleVisual(isDark, persist = true) {
    if (isDark) {
      this.toggleIndicator.classList.add('translate-x-6');
      this.toggleIcon.textContent = 'dark_mode';
    } else {
      this.toggleIndicator.classList.remove('translate-x-6');
      this.toggleIcon.textContent = 'light_mode';
    }
    if (persist) localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }

  // alterna tema com animação crossfade + parallax (ajusta opacidade e transform)
  toggleTheme() {
    const nowDark = !this.htmlEl.classList.contains('dark');

    // aplicamos a classe dark imediatamente (isso afeta cores dos componentes)
    if (nowDark) this.htmlEl.classList.add('dark'); else this.htmlEl.classList.remove('dark');

    // animação das camadas (crossfade)
    if (nowDark) {
      // light -> fade out, dark -> fade in
      this.bgLight.style.opacity = '0';
      this.bgLight.style.transform = 'scale(1.02)';
      this.bgDark.style.opacity = '1';
      this.bgDark.style.transform = 'scale(1)';
    } else {
      // dark -> fade out, light -> fade in
      this.bgLight.style.opacity = '1';
      this.bgLight.style.transform = 'scale(1)';
      this.bgDark.style.opacity = '0';
      this.bgDark.style.transform = 'scale(1.02)';
    }

    // atualiza o indicador do toggle e persiste escolha
    this.updateToggleVisual(nowDark, true);
  }

  // manipula envio do formulário: valida + adiciona
  handleSubmit(e) {
    e.preventDefault();
    const nome = document.getElementById("measurement-name").value.trim();
    const valor = document.getElementById("measurement-value").value.trim();
    const unidade = document.getElementById("measurement-unit").value;

    if (!nome || !valor) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    this.controller.adicionar(new Medida(nome, valor, unidade));
    this.form.reset();
  }

  // renderiza lista (recebe array de medidas)
  render(medidas) {
    this.tableBody.innerHTML = "";

    if (!medidas || medidas.length === 0) {
      // sem medidas: mostra mensagem, esconde filtros e tabela
      this.emptyState.classList.remove("hidden");
      this.filtersSection.classList.add("hidden");
      this.tableContainer.classList.add("hidden");
      // resetar texto padrão
      this.emptyState.querySelector('p').textContent = 'Nenhuma medida cadastrada ainda.';
      return;
    }

    // há medidas: mostra filtros e tabela e esconde mensagem
    this.emptyState.classList.add("hidden");
    this.filtersSection.classList.remove("hidden");
    this.tableContainer.classList.remove("hidden");

    medidas.forEach((m, index) => {
      const row = document.createElement("tr");
      row.classList.add("border-t", "border-border-light", "dark:border-border-dark");
      row.innerHTML = `
        <td class="p-3">${m.nome}</td>
        <td class="p-3">${m.valor}</td>
        <td class="p-3">${m.unidade}</td>
        <td class="p-3 text-right">
          <button class="bg-danger text-white px-3 py-1 rounded-lg hover:bg-red-700 transition" data-index="${index}">
            Remover
          </button>
        </td>
      `;
      // evento remover
      row.querySelector("button").addEventListener("click", () => this.controller.remover(index));
      this.tableBody.appendChild(row);
    });
  }

  // aplica filtros e trata caso "nenhuma medida encontrada"
  applyFilters() {
    const filtros = {
      nome: this.filterName ? this.filterName.value : '',
      valor: this.filterValue ? this.filterValue.value : '',
      unidade: this.filterUnit ? this.filterUnit.value : 'Todas',
    };
    const filtradas = this.controller.filtrar(filtros);

    if (filtradas.length === 0) {
      // sem resultados: mantém cabeçalho da tabela visível + mostra mensagem "Nenhuma medida encontrada."
      this.tableBody.innerHTML = "";
      this.tableContainer.classList.remove("hidden");
      this.emptyState.classList.remove("hidden");
      this.emptyState.querySelector('p').textContent = 'Nenhuma medida encontrada.';
      return;
    } else {
      // restaurar texto padrão e renderizar
      this.emptyState.classList.add("hidden");
      this.emptyState.querySelector('p').textContent = 'Nenhuma medida cadastrada ainda.';
    }

    this.render(filtradas);
  }

  // limpa filtros
  clearFilters() {
    if (this.filterName) this.filterName.value = "";
    if (this.filterValue) this.filterValue.value = "";
    if (this.filterUnit) this.filterUnit.value = "Todas";
    this.render(this.controller.medidas);
  }
}

// ===== APP INIT =====
document.addEventListener("DOMContentLoaded", () => {
  const app = new MedidaController();

  // expõe toggleTheme para o botão (usado caso queira ligar manualmente)
  // document.getElementById('theme-toggle').addEventListener('click', () => app.view.toggleTheme());
});
