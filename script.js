// === MODEL ===
class Medida {
  constructor(nome, valor, unidade) {
    this.nome = nome;
    this.valor = valor;
    this.unidade = unidade;
  }
}

// === CONTROLLER ===
class MedidaController {
  constructor() {
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
    localStorage.setItem("medidas", JSON.stringify(this.medidas));
  }

  carregarMedidas() {
    return JSON.parse(localStorage.getItem("medidas")) || [];
  }

  filtrar(filtros) {
    return this.medidas.filter(m => {
      const nomeOk = m.nome.toLowerCase().includes(filtros.nome.toLowerCase());
      const valorOk = filtros.valor === "" || m.valor.toString().includes(filtros.valor);
      const unidadeOk = filtros.unidade === "Todas" || m.unidade === filtros.unidade;
      return nomeOk && valorOk && unidadeOk;
    });
  }
}

// === VIEW ===
class MedidaView {
  constructor(controller) {
    this.controller = controller;

    // Elementos
    this.form = document.getElementById("measurement-form");
    this.tableBody = document.getElementById("measurement-table-body");
    this.emptyState = document.getElementById("empty-state");
    this.filterName = document.getElementById("filter-name");
    this.filterValue = document.getElementById("filter-value");
    this.filterUnit = document.getElementById("filter-unit");
    this.clearBtn = document.getElementById("clear-filters-btn");
    this.themeToggle = document.getElementById("theme-toggle");
    this.htmlElement = document.documentElement;

    // Eventos
    this.form.addEventListener("submit", e => this.handleSubmit(e));
    this.filterName.addEventListener("input", () => this.applyFilters());
    this.filterValue.addEventListener("input", () => this.applyFilters());
    this.filterUnit.addEventListener("change", () => this.applyFilters());
    this.clearBtn.addEventListener("click", () => this.clearFilters());
    this.themeToggle.addEventListener("click", () => this.htmlElement.classList.toggle("dark"));
  }

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

  render(medidas) {
    this.tableBody.innerHTML = "";

    if (medidas.length === 0) {
      this.emptyState.classList.remove("hidden");
      return;
    } else {
      this.emptyState.classList.add("hidden");
    }

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

      row.querySelector("button").addEventListener("click", () => this.controller.remover(index));
      this.tableBody.appendChild(row);
    });
  }

  applyFilters() {
    const filtros = {
      nome: this.filterName.value,
      valor: this.filterValue.value,
      unidade: this.filterUnit.value,
    };
    const filtradas = this.controller.filtrar(filtros);
    this.render(filtradas);
  }

  clearFilters() {
    this.filterName.value = "";
    this.filterValue.value = "";
    this.filterUnit.value = "Todas";
    this.render(this.controller.medidas);
  }
}

// === APP ===
document.addEventListener("DOMContentLoaded", () => {
  new MedidaController();
});
