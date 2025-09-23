// Modelo
class Medida {
  constructor(nome, valor, unidade) {
    this.nome = nome;
    this.valor = valor;
    this.unidade = unidade;
  }
}

// Controller
class MedidaController {
  constructor() {
    this.tabela = document.getElementById("tabelaMedidas");
    this.emptyState = document.getElementById("emptyState");
    this.medidas = this.carregarMedidas();
    this.atualizarTabela();
  }

  adicionarMedida(medida) {
    this.medidas.push(medida);
    this.salvarMedidas();
    this.atualizarTabela();
  }

  removerMedida(index) {
    this.medidas.splice(index, 1);
    this.salvarMedidas();
    this.atualizarTabela();
  }

  atualizarTabela() {
    this.tabela.innerHTML = "";

    if (this.medidas.length === 0) {
      this.emptyState.classList.remove("hidden");
      return;
    } else {
      this.emptyState.classList.add("hidden");
    }

    this.medidas.forEach((medida, index) => {
      const row = document.createElement("tr");
      row.classList.add("border-b");

      row.innerHTML = `
        <td class="p-3">${medida.nome}</td>
        <td class="p-3">${medida.valor}</td>
        <td class="p-3">${medida.unidade}</td>
        <td class="p-3 text-right">
          <button class="bg-danger text-white px-3 py-1 rounded-lg hover:bg-red-700 transition"
            data-index="${index}">
            Remover
          </button>
        </td>
      `;

      this.tabela.appendChild(row);
    });

    document.querySelectorAll("button[data-index]").forEach(button => {
      button.addEventListener("click", (e) => {
        const index = e.target.getAttribute("data-index");
        this.removerMedida(index);
      });
    });
  }

  salvarMedidas() {
    localStorage.setItem("medidas", JSON.stringify(this.medidas));
  }

  carregarMedidas() {
    const dados = localStorage.getItem("medidas");
    return dados ? JSON.parse(dados) : [];
  }
}

// Instância
const controller = new MedidaController();

// Formulário
document.getElementById("formMedidas").addEventListener("submit", function(event) {
  event.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const valor = document.getElementById("valor").value.trim();
  const unidade = document.getElementById("unidade").value;

  if (nome && valor && unidade) {
    const medida = new Medida(nome, valor, unidade);
    controller.adicionarMedida(medida);
    this.reset();
  }
});
