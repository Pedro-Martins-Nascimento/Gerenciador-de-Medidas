
// ===== MODELO =====
/**
 * Representa uma medida cadastrada pelo usuário.
 */
class Medida {
  /**
   * Construtor da entidade Medida.
   * @param {string} nome Nome da medida (ex: Cintura)
   * @param {number} valor Valor numérico
   * @param {string} unidade Unidade de medida (ex: cm, mm)
   */
  constructor(nome, valor, unidade) {
    this.nome = nome;
    this.valor = valor;
    this.unidade = unidade;
  }
}

// ===== CONTROLADOR =====
/**
 * Gerencia as operações de negócio e persistência das medidas.
 */
class ControladorMedidas {
  constructor() {
    // Chave utilizada para persistência local.
    this.chaveArmazenamento = "medidas";
    // Carrega dados persistidos ao iniciar.
    this.medidas = this.carregarMedidas();
    // Instancia a Visão e conecta ao controlador.
    this.visao = new VisaoMedidas(this);
    // Renderiza interface inicial.
    this.visao.renderizar(this.medidas);
  }

  /**
   * Adiciona uma nova medida e atualiza a interface e o armazenamento.
   * @param {Medida} medida Instância a ser inserida
   */
  adicionar(medida) {
    this.medidas.push(medida);
    this.salvarMedidas();
    this.visao.renderizar(this.medidas);
    // Feedback visual ao usuário
    exibirToast("Medida adicionada com sucesso!");
  }

  /**
   * Remove uma medida pelo índice e atualiza interface e armazenamento.
   * @param {number} indice Índice da medida
   */
  remover(indice) {
    this.medidas.splice(indice, 1);
    this.salvarMedidas();
    this.visao.renderizar(this.medidas);
    // Feedback visual ao usuário
    exibirToast("Medida removida.");
  }

  /**
   * Persiste a lista de medidas no localStorage.
   */
  salvarMedidas() {
    // Serializa e armazena as medidas localmente
    localStorage.setItem(this.chaveArmazenamento, JSON.stringify(this.medidas));
  }

  /**
   * Recupera a lista de medidas do localStorage.
   * @returns {Medida[]} Array de medidas
   */
  carregarMedidas() {
    // Recupera e desserializa as medidas do localStorage
    const bruto = localStorage.getItem(this.chaveArmazenamento);
    return bruto ? JSON.parse(bruto) : [];
  }

  /**
   * Filtra as medidas conforme critérios informados.
   * @param {Object} filtros Filtros de nome, valor e unidade
   * @returns {Medida[]} Medidas filtradas
   */
  filtrar(filtros) {
    // Aplica filtros de nome, valor e unidade
    return this.medidas.filter(medida => {
      const nomeOk = (medida.nome || '').toLowerCase().includes((filtros.nome || '').toLowerCase());
      const valorOk = !filtros.valor || (medida.valor || '').toString().includes(filtros.valor);
      const unidadeOk = !filtros.unidade || filtros.unidade === "Todas" || medida.unidade === filtros.unidade;
      return nomeOk && valorOk && unidadeOk;
    });
  }
}

// ===== VISÃO =====
/**
 * Responsável pela atualização e interação da interface do usuário.
 */
class VisaoMedidas {
  constructor(controlador) {
    this.controlador = controlador;

    // Seletores dos elementos de interface (DOM)
    this.formulario = document.getElementById("measurement-form"); // Formulário de cadastro
    this.corpoTabela = document.getElementById("measurement-table-body"); // Corpo da tabela
    this.containerTabela = document.getElementById("table-container"); // Container da tabela
    this.estadoVazio = document.getElementById("empty-state"); // Mensagem de estado vazio
    this.secaoFiltros = document.getElementById("filters-section"); // Seção de filtros
    this.filtroNome = document.getElementById("filter-name"); // Campo filtro nome
    this.filtroValor = document.getElementById("filter-value"); // Campo filtro valor
    this.filtroUnidade = document.getElementById("filter-unit"); // Campo filtro unidade
    this.botaoLimpar = document.getElementById("clear-filters-btn"); // Botão limpar filtros

    // Elementos de background para transição de tema
    this.bgClaro = document.getElementById("bg-light");
    this.bgEscuro = document.getElementById("bg-dark");

    // Elementos do botão de alternância de tema (dark/light)
    this.botaoTema = document.getElementById("theme-toggle");
    this.indicadorToggle = document.getElementById("toggle-indicator");
    this.iconeToggle = document.getElementById("toggle-icon");
    this.htmlEl = document.documentElement;

    // Listeners para eventos de interação do usuário
    this.formulario.addEventListener("submit", e => this.tratarEnvioFormulario(e));
    if (this.filtroNome) this.filtroNome.addEventListener("input", () => this.aplicarFiltros());
    if (this.filtroValor) this.filtroValor.addEventListener("input", () => this.aplicarFiltros());
    if (this.filtroUnidade) this.filtroUnidade.addEventListener("change", () => this.aplicarFiltros());
    if (this.botaoLimpar) this.botaoLimpar.addEventListener("click", () => this.limparFiltros());
    if (this.botaoTema) this.botaoTema.addEventListener("click", () => this.alternarTema());

    // Inicializa o estado visual do tema e animações
    this.inicializarEstadoTema();
  }

  /**
   * Inicializa o estado visual do tema e animação de fundo.
   * Considera preferências salvas/local ou do sistema.
   */
  inicializarEstadoTema() {
    // Verifica se há tema salvo ou preferência do sistema
    const salvo = localStorage.getItem('theme');
    const prefereEscuro = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const estaEscuro = (salvo === 'dark') || (!salvo && prefereEscuro) || this.htmlEl.classList.contains('dark');
    if (estaEscuro) this.htmlEl.classList.add('dark');
    else this.htmlEl.classList.remove('dark');

    // Ajusta opacidade das camadas de fundo para efeito visual do dark mode
    if (this.bgClaro && this.bgEscuro) {
      this.bgClaro.style.opacity = estaEscuro ? '0' : '1';
      this.bgEscuro.style.opacity = estaEscuro ? '1' : '0';
    }

    this.atualizarVisualToggle(estaEscuro, false);
  }

  /**
   * Atualiza visual do botão de alternância de tema.
   * @param {boolean} estaEscuro Indica se tema é escuro
   * @param {boolean} persistir Salva preferência localmente
   */
  atualizarVisualToggle(estaEscuro, persistir = true) {
    if (!this.indicadorToggle || !this.iconeToggle) return;
    if (estaEscuro) {
      this.indicadorToggle.classList.add('translate-x-6');
      this.iconeToggle.textContent = 'dark_mode';
    } else {
      this.indicadorToggle.classList.remove('translate-x-6');
      this.iconeToggle.textContent = 'light_mode';
    }
    if (persistir) localStorage.setItem('theme', estaEscuro ? 'dark' : 'light');
  }

  /**
   * Alterna entre tema claro e escuro.
   */
  alternarTema() {
    const agoraEscuro = !this.htmlEl.classList.contains('dark');
    if (agoraEscuro) this.htmlEl.classList.add('dark');
    else this.htmlEl.classList.remove('dark');

    if (this.bgClaro && this.bgEscuro) {
      this.bgClaro.style.opacity = agoraEscuro ? '0' : '1';
      this.bgEscuro.style.opacity = agoraEscuro ? '1' : '0';
    }

    this.atualizarVisualToggle(agoraEscuro, true);
  }

  /**
   * Trata o envio do formulário de cadastro de medida.
   * Valida os campos e aciona o controlador.
   * @param {Event} evento Evento de submit
   */
  tratarEnvioFormulario(evento) {
    evento.preventDefault();
    const nome = document.getElementById("measurement-name").value.trim();
    const valor = document.getElementById("measurement-value").value.trim();
    const unidade = document.getElementById("measurement-unit").value;

    if (!nome || !valor) {
      exibirToast("Preencha todos os campos!", { type: 'danger' });
      return;
    }

    // Validação de nome: até 15 letras
    const regexNome = /^[A-Za-zÀ-ú ]{1,15}$/;
    if (!regexNome.test(nome)) {
      exibirToast("Nome inválido! Apenas letras (máx. 15).", { type: 'danger' });
      return;
    }

    // Validação de valor numérico
    const valorNumerico = parseFloat(valor);
    if (isNaN(valorNumerico)) {
      exibirToast("Valor inválido! Digite apenas números.", { type: 'danger' });
      return;
    }

    this.controlador.adicionar(new Medida(nome, valorNumerico, unidade));
    this.formulario.reset();
  }

  /**
   * Atualiza a tabela de medidas na interface.
   * @param {Medida[]} medidas Lista de medidas a exibir
   */
  renderizar(medidas) {
    this.corpoTabela.innerHTML = "";

    if (!medidas || medidas.length === 0) {
      this.estadoVazio.classList.remove("hidden");
      this.secaoFiltros.classList.add("hidden");
      this.containerTabela.classList.add("hidden");
      this.estadoVazio.querySelector('p').textContent = 'Nenhuma medida cadastrada ainda.';
      return;
    }

    this.estadoVazio.classList.add("hidden");
    this.secaoFiltros.classList.remove("hidden");
    this.containerTabela.classList.remove("hidden");

    medidas.forEach((medida, indice) => {
      const linha = document.createElement("tr");
      linha.classList.add("border-t", "border-border-light", "dark:border-border-dark");
      linha.innerHTML = `
        <td class="p-2 sm:p-3 text-center">${medida.nome}</td>
        <td class="p-2 sm:p-3 text-center">${medida.valor}</td>
        <td class="p-2 sm:p-3 text-center">${medida.unidade}</td>
        <td class="p-2 sm:p-3 text-center w-12">
          <button class="bg-danger text-white px-2 py-1 rounded-md hover:bg-red-700 transition font-bold uppercase text-sm sm:text-base" data-indice="${indice}">
            X
          </button>
        </td>
      `;
      // Listener para remoção de medida
      linha.querySelector("button").addEventListener("click", () => this.controlador.remover(indice));
      this.corpoTabela.appendChild(linha);
    });
  }

  /**
   * Aplica filtros e atualiza a tabela conforme critérios informados.
   */
  aplicarFiltros() {
    const nomeFiltro = this.filtroNome ? this.filtroNome.value.trim() : '';
    const valorFiltro = this.filtroValor ? this.filtroValor.value : '';
    const unidadeFiltro = this.filtroUnidade ? this.filtroUnidade.value : 'Todas';

    // Se todos os filtros estiverem vazios ou padrão, mostra tudo
    if (!nomeFiltro && !valorFiltro && (unidadeFiltro === 'Todas' || !unidadeFiltro)) {
      this.renderizar(this.controlador.medidas);
      return;
    }

    const filtros = {
      nome: nomeFiltro,
      valor: valorFiltro,
      unidade: unidadeFiltro,
    };
    const filtradas = this.controlador.filtrar(filtros);

    if (filtradas.length === 0) {
      this.corpoTabela.innerHTML = "";
      this.containerTabela.classList.remove("hidden");
      this.estadoVazio.classList.remove("hidden");
      this.estadoVazio.querySelector('p').textContent = 'Nenhuma medida encontrada.';
      return;
    } else {
      this.estadoVazio.classList.add("hidden");
      this.estadoVazio.querySelector('p').textContent = 'Nenhuma medida cadastrada ainda.';
    }

    this.renderizar(filtradas);
  }

  /**
   * Limpa todos os filtros e exibe a lista completa.
   */
  limparFiltros() {
    if (this.filtroNome) this.filtroNome.value = "";
    if (this.filtroValor) this.filtroValor.value = "";
    if (this.filtroUnidade) this.filtroUnidade.value = "Todas";
    this.renderizar(this.controlador.medidas);
  }
}

/**
 * Exibe uma notificação flutuante (toast) para feedback ao usuário.
 * @param {string} mensagem Mensagem a ser exibida
 * @param {Object} opcoes Opções de exibição (tipo, duração, link)
 */
function exibirToast(mensagem, opcoes = {}) {
  // opcoes: { type: 'info'|'success'|'danger', link: '#', duration: ms }
  const toast = document.getElementById("toast");
  if (!toast) {
    console.warn("Toast não encontrado (id='toast').");
    return;
  }

  const duracao = opcoes.duration || 4000;
  const tipo = opcoes.type || 'info';
  const link = opcoes.link || '#';

  // conteúdo
  const elementoConteudo = toast.querySelector(".card-content");
  if (elementoConteudo) elementoConteudo.textContent = mensagem;
  const elementoLink = toast.querySelector(".card-link");
  if (elementoLink) {
    elementoLink.setAttribute("href", link);
    elementoLink.style.display = opcoes.showLink === false ? "none" : ""; // opcional
  }

  // classes de cor (se quiser alterar visual por tipo)
  toast.classList.remove("toast-success", "toast-danger", "toast-info");
  if (tipo === 'success') toast.classList.add("toast-success");
  if (tipo === 'danger') toast.classList.add("toast-danger");
  if (tipo === 'info') toast.classList.add("toast-info");

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
    fecharToast();
  }, duracao);
}

/**
 * Fecha a notificação flutuante (toast).
 */
function fecharToast() {
  const toast = document.getElementById("toast");
  if (!toast) return;

  // remove classe de entrada e adiciona saída
  toast.classList.remove("show");
  toast.classList.add("hide");

  // quando animação de saída terminar, adiciona hidden
  const aoFinalizar = () => {
    toast.classList.add("hidden");
    toast.classList.remove("hide");
    toast.removeEventListener("animationend", aoFinalizar);
  };
  toast.addEventListener("animationend", aoFinalizar);

  if (toast._timeout) {
    clearTimeout(toast._timeout);
    toast._timeout = null;
  }
}

// ===== Inicialização da aplicação =====
document.addEventListener("DOMContentLoaded", () => {
  new ControladorMedidas();
});
