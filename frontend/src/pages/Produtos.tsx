import React, { useEffect, useState } from "react";
import { api } from "../services/api";

interface Produto {
  id: number;
  codigo: number | null;
  nome: string;
  marca: string;
  quantidade: number;
  valor: number;
  categoria: string;
  tipoVenda: "UNIDADE" | "PESO";
  user?: unknown;
}

interface ProdutosProps {
  onNavegar?: (
    tela: "dashboard" | "produtos" | "vendas" | "movimentacoes",
  ) => void;
  onLogout?: () => void;
}

interface Mensagem {
  texto: string;
  erro: boolean;
}

const categorias = [
  "HIGIENIE",
  "ALIMENTOS",
  "BEBIDAS",
  "LIMPEZA",
  "AÇOUGUE",
  "FRUTAS",
];

const tiposVenda: Array<"UNIDADE" | "PESO"> = ["UNIDADE", "PESO"];

function formatarMoeda(valor: number): string {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function Produtos({ onNavegar, onLogout }: ProdutosProps) {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [busca, setBusca] = useState("");
  const [codigo, setCodigo] = useState<number | "">("");
  const [nome, setNome] = useState("");
  const [marca, setMarca] = useState("");
  const [quantidade, setQuantidade] = useState<number | "">("");
  const [valor, setValor] = useState<number | "">("");
  const [categoria, setCategoria] = useState("ALIMENTOS");
  const [tipoVenda, setTipoVenda] = useState<"UNIDADE" | "PESO">("UNIDADE");
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [mensagem, setMensagem] = useState<Mensagem | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const userId = localStorage.getItem("userId");

  function exibirMensagem(texto: string, erro: boolean = false) {
    setMensagem({ texto, erro });
    window.setTimeout(() => setMensagem(null), 4000);
  }

  async function carregarProdutos(termoBusca: string = "") {
    if (!userId) return;

    setCarregando(true);

    try {
      const endpoint =
        `/returnProdutos?userId=${encodeURIComponent(userId)}` +
        `&busca=${encodeURIComponent(termoBusca)}`;

      const lista = await api.get<Produto[]>(endpoint);
      setProdutos(Array.isArray(lista) ? lista : []);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);

      const mensagemErro =
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os produtos.";

      exibirMensagem(mensagemErro, true);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    if (userId) carregarProdutos();
  }, [userId]);

  function limparFormulario() {
    setEditandoId(null);
    setCodigo("");
    setNome("");
    setMarca("");
    setQuantidade("");
    setValor("");
    setCategoria("ALIMENTOS");
    setTipoVenda("UNIDADE");
  }

  function handleNavegar(
    tela: "dashboard" | "produtos" | "vendas" | "movimentacoes",
  ) {
    if (onNavegar) {
      onNavegar(tela);
      return;
    }

    window.location.href = `/${tela}`;
  }

  function handleBuscaChange(event: React.ChangeEvent<HTMLInputElement>) {
    const termo = event.target.value;
    setBusca(termo);
    carregarProdutos(termo);
  }

  async function handleSalvarProduto(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!userId) {
      exibirMensagem("Usuário não encontrado. Faça login novamente.", true);
      return;
    }

    const codigoNumerico = Number(codigo);
    const codigoValido =
      codigo !== "" && Number.isInteger(codigoNumerico) && codigoNumerico > 0;
    const nomeLimpo = nome.trim();
    const marcaLimpa = marca.trim();
    const quantidadeNumerica = Number(quantidade);
    const valorNumerico = Number(valor);

    if (tipoVenda === "PESO" && !codigoValido) {
      exibirMensagem(
        "Informe um código inteiro maior que zero para produtos vendidos por peso.",
        true,
      );
      return;
    }

    if (!nomeLimpo) {
      exibirMensagem("Informe o nome do produto.", true);
      return;
    }

    if (!marcaLimpa) {
      exibirMensagem("Informe a marca do produto.", true);
      return;
    }

    if (
      quantidade === "" ||
      !Number.isInteger(quantidadeNumerica) ||
      quantidadeNumerica < 0
    ) {
      exibirMensagem(
        "A quantidade deve ser um número inteiro maior ou igual a zero.",
        true,
      );
      return;
    }

    if (valor === "" || !Number.isFinite(valorNumerico) || valorNumerico <= 0) {
      exibirMensagem("O valor deve ser maior que zero.", true);
      return;
    }

    if (!categoria) {
      exibirMensagem("Selecione uma categoria.", true);
      return;
    }

    if (!tipoVenda) {
      exibirMensagem("Selecione o tipo de venda.", true);
      return;
    }

    setSalvando(true);

    try {
      const dadosProduto = {
        codigo: tipoVenda === "PESO" ? codigoNumerico : null,
        nome: nomeLimpo,
        marca: marcaLimpa,
        quantidade: quantidadeNumerica,
        valor: valorNumerico,
        categoria,
        tipoVenda,
      };

      if (editandoId !== null) {
        await api.put(`/updateProduto/${encodeURIComponent(userId)}`, {
          id: editandoId,
          ...dadosProduto,
        });

        exibirMensagem("Produto atualizado com sucesso!");
      } else {
        await api.post(
          `/createProduct/?userId=${encodeURIComponent(userId)}`,
          dadosProduto,
        );

        exibirMensagem("Produto cadastrado com sucesso!");
      }

      limparFormulario();
      await carregarProdutos(busca);
    } catch (error) {
      console.error("Erro ao salvar produto:", error);

      const mensagemErro =
        error instanceof Error ? error.message : "Erro ao salvar produto.";

      exibirMensagem(mensagemErro, true);
    } finally {
      setSalvando(false);
    }
  }

  function handleEditar(produto: Produto) {
    if (!produto.id) {
      exibirMensagem("ID do produto inválido.", true);
      return;
    }

    setEditandoId(produto.id);
    setCodigo(produto.codigo ?? "");
    setNome(produto.nome || "");
    setMarca(produto.marca || "");
    setQuantidade(produto.quantidade ?? "");
    setValor(produto.valor ?? "");
    setCategoria(produto.categoria || "ALIMENTOS");
    setTipoVenda(produto.tipoVenda || "UNIDADE");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleDeletar(produtoId: number) {
    if (!userId) {
      exibirMensagem("Usuário não encontrado. Faça login novamente.", true);
      return;
    }

    if (!produtoId) {
      exibirMensagem("ID do produto inválido.", true);
      return;
    }

    const confirmou = window.confirm(
      "Tem certeza que deseja excluir este produto?",
    );

    if (!confirmou) return;

    try {
      await api.delete(
        `/deleteproduto/${encodeURIComponent(produtoId)}` +
          `?userId=${encodeURIComponent(userId)}`,
      );

      exibirMensagem("Produto excluído com sucesso!");

      if (editandoId === produtoId) limparFormulario();

      await carregarProdutos(busca);
    } catch (error) {
      console.error("Erro ao excluir produto:", error);

      const mensagemErro =
        error instanceof Error ? error.message : "Erro ao excluir produto.";

      exibirMensagem(mensagemErro, true);
    }
  }

  function handleLogout() {
    localStorage.removeItem("userId");
    localStorage.removeItem("usuarioLogado");

    if (onLogout) {
      onLogout();
      return;
    }

    window.location.href = "/";
  }

  const produtosComEstoqueBaixo = produtos.filter(
    (produto) => produto.quantidade <= 5,
  ).length;

  const quantidadeTotalEstoque = produtos.reduce(
    (total, produto) => total + Number(produto.quantidade || 0),
    0,
  );

  if (!userId) return null;

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <div>
          <div style={styles.brand}>
            <div style={styles.logoIcon}>📦</div>
            <div>
              <strong style={styles.brandTitle}>Sistema de Estoque</strong>
              <span style={styles.brandSubtitle}>Gestão comercial</span>
            </div>
          </div>

          <nav style={styles.navigation}>
            <button
              type="button"
              onClick={() => handleNavegar("dashboard")}
              style={styles.navButton}
            >
              <span>▦</span> Dashboard
            </button>

            <button
              type="button"
              onClick={() => handleNavegar("produtos")}
              style={{
                ...styles.navButton,
                ...styles.navButtonActive,
              }}
            >
              <span>📦</span> Produtos
            </button>

            <button
              type="button"
              onClick={() => handleNavegar("vendas")}
              style={styles.navButton}
            >
              <span>🛒</span> Caixa / Vendas
            </button>

            <button
              type="button"
              onClick={() => handleNavegar("movimentacoes")}
              style={styles.navButton}
            >
              <span>↕</span> Movimentações
            </button>
          </nav>
        </div>

        <div style={styles.sidebarUser}>
          <div style={styles.avatar}>U</div>
          <div>
            <strong style={styles.sidebarUserName}>Usuário conectado</strong>
            <span style={styles.sidebarUserType}>
              Controle de estoque · ID {userId}
            </span>
          </div>
        </div>
      </aside>

      <div style={styles.mainArea}>
        <header style={styles.header}>
          <div style={styles.searchContainer}>
            <span style={styles.searchIcon}>⌕</span>
            <input
              type="text"
              value={busca}
              onChange={handleBuscaChange}
              placeholder="Buscar produtos ou categorias..."
              style={styles.searchInput}
            />
          </div>

          <div style={styles.headerActions}>
            <button
              type="button"
              onClick={() => handleNavegar("vendas")}
              style={styles.salesButton}
            >
              Ir para vendas
            </button>

            <button
              type="button"
              onClick={handleLogout}
              style={styles.logoutButton}
            >
              Sair
            </button>
          </div>
        </header>

        <main style={styles.content}>
          <div style={styles.pageHeading}>
            <div>
              <span style={styles.eyebrow}>CATÁLOGO E ESTOQUE</span>
              <h1 style={styles.title}>Gestão de produtos</h1>
              <p style={styles.subtitle}>
                Cadastre, atualize e acompanhe os produtos do seu mercado.
              </p>
            </div>

            <div style={styles.statusBadge}>
              <span style={styles.statusDot} />
              Estoque sincronizado
            </div>
          </div>

          {mensagem && (
            <div
              style={{
                ...styles.message,
                ...(mensagem.erro
                  ? styles.errorMessage
                  : styles.successMessage),
              }}
            >
              <strong>{mensagem.erro ? "Atenção: " : "Concluído: "}</strong>
              {mensagem.texto}
            </div>
          )}

          <section style={styles.summaryGrid}>
            <div style={styles.summaryCard}>
              <span style={styles.summaryLabel}>PRODUTOS CADASTRADOS</span>
              <strong style={styles.summaryValue}>{produtos.length}</strong>
              <span style={styles.summaryCaption}>
                Itens disponíveis no catálogo
              </span>
            </div>

            <div style={styles.summaryCard}>
              <span style={styles.summaryLabel}>UNIDADES EM ESTOQUE</span>
              <strong style={styles.summaryValueBlue}>
                {quantidadeTotalEstoque}
              </strong>
              <span style={styles.summaryCaption}>
                Soma das quantidades cadastradas
              </span>
            </div>

            <div style={styles.summaryCardWarning}>
              <span style={styles.summaryLabel}>ESTOQUE BAIXO</span>
              <strong style={styles.summaryValueOrange}>
                {produtosComEstoqueBaixo}
              </strong>
              <span style={styles.summaryCaption}>
                Produtos com até 5 unidades
              </span>
            </div>
          </section>

          <div style={styles.contentGrid}>
            <section style={styles.formCard}>
              <div style={styles.cardHeader}>
                <div>
                  <h2 style={styles.cardTitle}>
                    {editandoId !== null ? "Editar produto" : "Novo produto"}
                  </h2>
                  <p style={styles.cardSubtitle}>
                    {editandoId !== null
                      ? "Atualize os dados deste item."
                      : "Preencha os dados para cadastrar um item."}
                  </p>
                </div>
                <span style={styles.cardIcon}>
                  {editandoId !== null ? "✎" : "+"}
                </span>
              </div>

              <form onSubmit={handleSalvarProduto}>
                {tipoVenda === "PESO" && (
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Código PLU</label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={codigo}
                      onChange={(event) => {
                        const value = event.target.value;
                        setCodigo(value === "" ? "" : Number(value));
                      }}
                      placeholder="Ex.: 1001"
                      disabled={salvando}
                      style={styles.input}
                    />
                  </div>
                )}

                <div style={styles.formGroup}>
                  <label style={styles.label}>Nome do produto</label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(event) => setNome(event.target.value)}
                    placeholder="Ex.: Arroz 5kg"
                    maxLength={255}
                    disabled={salvando}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Marca</label>
                  <input
                    type="text"
                    value={marca}
                    onChange={(event) => setMarca(event.target.value)}
                    placeholder="Ex.: Tio João"
                    maxLength={80}
                    disabled={salvando}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Tipo de venda</label>
                  <select
                    value={tipoVenda}
                    onChange={(event) => {
                      const novoTipo = event.target.value as "UNIDADE" | "PESO";
                      setTipoVenda(novoTipo);
                      if (novoTipo === "UNIDADE") setCodigo("");
                    }}
                    disabled={salvando}
                    style={styles.input}
                  >
                    {tiposVenda.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {tipo === "PESO" ? "Por peso (kg)" : "Por unidade"}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.twoColumns}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Quantidade</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={quantidade}
                      onChange={(event) => {
                        const value = event.target.value;
                        setQuantidade(value === "" ? "" : Number(value));
                      }}
                      placeholder="0"
                      disabled={salvando}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Preço unitário</label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={valor}
                      onChange={(event) => {
                        const value = event.target.value;
                        setValor(value === "" ? "" : Number(value));
                      }}
                      placeholder="0,00"
                      disabled={salvando}
                      style={styles.input}
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Categoria</label>
                  <select
                    value={categoria}
                    onChange={(event) => setCategoria(event.target.value)}
                    disabled={salvando}
                    style={styles.input}
                  >
                    {categorias.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.formActions}>
                  <button
                    type="submit"
                    disabled={salvando}
                    style={{
                      ...styles.saveButton,
                      ...(salvando ? styles.disabledButton : {}),
                    }}
                  >
                    {salvando
                      ? "Salvando..."
                      : editandoId !== null
                        ? "Atualizar produto"
                        : "Cadastrar produto"}
                  </button>

                  {editandoId !== null && (
                    <button
                      type="button"
                      onClick={limparFormulario}
                      disabled={salvando}
                      style={styles.cancelButton}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </section>

            <section style={styles.tableCard}>
              <div style={styles.tableHeader}>
                <div>
                  <h2 style={styles.cardTitle}>Produtos cadastrados</h2>
                  <p style={styles.cardSubtitle}>
                    Consulte e gerencie os itens do estoque.
                  </p>
                </div>
                <span style={styles.counter}>{produtos.length} produto(s)</span>
              </div>

              {carregando ? (
                <div style={styles.emptyState}>Carregando produtos...</div>
              ) : produtos.length === 0 ? (
                <div style={styles.emptyState}>Nenhum produto encontrado.</div>
              ) : (
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.tableHeading}>
                        <th style={styles.tableCell}>PRODUTO</th>
                        <th style={styles.tableCell}>MARCA</th>
                        <th style={styles.tableCell}>CÓDIGO</th>
                        <th style={styles.tableCell}>CATEGORIA</th>
                        <th style={styles.tableCell}>ESTOQUE</th>
                        <th style={styles.tableCell}>PREÇO UNIT.</th>
                        <th
                          style={{
                            ...styles.tableCell,
                            textAlign: "right",
                          }}
                        >
                          AÇÕES
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {produtos.map((produto) => {
                        const estoqueBaixo = produto.quantidade <= 5;

                        return (
                          <tr key={produto.id} style={styles.tableRow}>
                            <td style={styles.tableCell}>
                              <strong style={styles.productName}>
                                {produto.nome}
                              </strong>
                              <span style={styles.productId}>
                                ID interno #{produto.id}
                              </span>
                            </td>

                            <td style={styles.tableCell}>{produto.marca}</td>

                            <td style={styles.tableCell}>
                              <span style={styles.codeBadge}>
                                {produto.codigo}
                              </span>
                            </td>

                            <td style={styles.tableCell}>
                              <span style={styles.categoryBadge}>
                                {produto.categoria}
                              </span>
                              <span style={styles.saleTypeBadge}>
                                {produto.tipoVenda === "PESO"
                                  ? "PESO"
                                  : "UNIDADE"}
                              </span>
                            </td>

                            <td
                              style={{
                                ...styles.tableCell,
                                color: estoqueBaixo ? "#c2410c" : "#334155",
                                fontWeight: estoqueBaixo ? "800" : "600",
                              }}
                            >
                              {produto.quantidade}{" "}
                              {produto.tipoVenda === "PESO" ? "kg" : "un"}
                              {estoqueBaixo && (
                                <span style={styles.stockWarning}>Atenção</span>
                              )}
                            </td>

                            <td style={styles.tableCell}>
                              {formatarMoeda(produto.valor)}
                            </td>

                            <td
                              style={{
                                ...styles.tableCell,
                                textAlign: "right",
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => handleEditar(produto)}
                                style={styles.editButton}
                              >
                                Editar
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeletar(produto.id)}
                                style={styles.deleteButton}
                              >
                                Excluir
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f1f5f9",
    fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
  },

  sidebar: {
    width: "246px",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    backgroundColor: "#0b122b",
    color: "#ffffff",
    boxSizing: "border-box",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "26px 22px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },

  logoIcon: {
    width: "34px",
    height: "34px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "10px",
    backgroundColor: "#2563eb",
    fontSize: "17px",
  },

  brandTitle: {
    display: "block",
    color: "#ffffff",
    fontSize: "14px",
  },

  brandSubtitle: {
    display: "block",
    marginTop: "3px",
    color: "#94a3b8",
    fontSize: "11px",
  },

  navigation: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    padding: "24px 12px",
  },

  navButton: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    width: "100%",
    padding: "13px 14px",
    border: "none",
    borderRadius: "9px",
    backgroundColor: "transparent",
    color: "#aab5ce",
    fontSize: "13px",
    fontWeight: "600",
    textAlign: "left",
    cursor: "pointer",
  },

  navButtonActive: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    boxShadow: "0 8px 20px rgba(37,99,235,0.25)",
  },

  sidebarUser: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "18px",
    borderTop: "1px solid rgba(255,255,255,0.08)",
  },

  avatar: {
    width: "34px",
    height: "34px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    backgroundColor: "#1d4ed8",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: "700",
  },

  sidebarUserName: {
    display: "block",
    color: "#e2e8f0",
    fontSize: "12px",
  },

  sidebarUserType: {
    display: "block",
    marginTop: "3px",
    color: "#94a3b8",
    fontSize: "10px",
  },

  mainArea: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    minWidth: 0,
  },

  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: "72px",
    gap: "20px",
    padding: "0 38px",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e2e8f0",
    boxSizing: "border-box",
  },

  searchContainer: {
    position: "relative",
    width: "390px",
    maxWidth: "100%",
  },

  searchIcon: {
    position: "absolute",
    top: "8px",
    left: "12px",
    color: "#64748b",
    fontSize: "20px",
    lineHeight: 1,
  },

  searchInput: {
    width: "100%",
    padding: "11px 12px 11px 35px",
    border: "1px solid #dbe3ef",
    borderRadius: "8px",
    outline: "none",
    backgroundColor: "#f8fafc",
    color: "#0f172a",
    fontSize: "13px",
    boxSizing: "border-box",
  },

  headerActions: {
    display: "flex",
    gap: "10px",
  },

  salesButton: {
    padding: "10px 15px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#10b981",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },

  logoutButton: {
    padding: "10px 15px",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    backgroundColor: "#fff1f2",
    color: "#dc2626",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },

  content: {
    flex: 1,
    padding: "34px 38px",
    boxSizing: "border-box",
  },

  pageHeading: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "18px",
    marginBottom: "24px",
  },

  eyebrow: {
    color: "#2563eb",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "1.5px",
  },

  title: {
    margin: "7px 0 4px",
    color: "#0f172a",
    fontSize: "30px",
    fontWeight: "800",
    letterSpacing: "-1px",
  },

  subtitle: {
    margin: 0,
    color: "#64748b",
    fontSize: "14px",
  },

  statusBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "9px 12px",
    border: "1px solid #bbf7d0",
    borderRadius: "20px",
    backgroundColor: "#f0fdf4",
    color: "#15803d",
    fontSize: "12px",
    fontWeight: "700",
  },

  statusDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    backgroundColor: "#16a34a",
  },

  message: {
    padding: "13px 16px",
    marginBottom: "20px",
    borderRadius: "9px",
    fontSize: "13px",
  },

  successMessage: {
    color: "#166534",
    backgroundColor: "#f0fdf4",
    border: "1px solid #bbf7d0",
  },

  errorMessage: {
    color: "#991b1b",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "17px",
    marginBottom: "22px",
  },

  summaryCard: {
    minHeight: "112px",
    padding: "18px 20px",
    border: "1px solid #e2e8f0",
    borderRadius: "13px",
    backgroundColor: "#ffffff",
    boxShadow: "0 5px 18px rgba(15,23,42,0.04)",
    boxSizing: "border-box",
  },

  summaryCardWarning: {
    minHeight: "112px",
    padding: "18px 20px",
    border: "1px solid #fed7aa",
    borderRadius: "13px",
    backgroundColor: "#fffaf5",
    boxShadow: "0 5px 18px rgba(15,23,42,0.04)",
    boxSizing: "border-box",
  },

  summaryLabel: {
    display: "block",
    color: "#64748b",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "0.8px",
  },

  summaryValue: {
    display: "block",
    marginTop: "12px",
    color: "#0f172a",
    fontSize: "24px",
  },

  summaryValueBlue: {
    display: "block",
    marginTop: "12px",
    color: "#2563eb",
    fontSize: "24px",
  },

  summaryValueOrange: {
    display: "block",
    marginTop: "12px",
    color: "#c2410c",
    fontSize: "24px",
  },

  summaryCaption: {
    display: "block",
    marginTop: "4px",
    color: "#94a3b8",
    fontSize: "11px",
  },

  contentGrid: {
    display: "grid",
    gridTemplateColumns: "340px minmax(0, 1fr)",
    gap: "22px",
    alignItems: "start",
  },

  formCard: {
    padding: "22px",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    backgroundColor: "#ffffff",
    boxShadow: "0 5px 18px rgba(15,23,42,0.04)",
    boxSizing: "border-box",
  },

  tableCard: {
    overflow: "hidden",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    backgroundColor: "#ffffff",
    boxShadow: "0 5px 18px rgba(15,23,42,0.04)",
  },

  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "22px",
  },

  cardTitle: {
    margin: 0,
    color: "#172033",
    fontSize: "16px",
    fontWeight: "800",
  },

  cardSubtitle: {
    margin: "5px 0 0",
    color: "#94a3b8",
    fontSize: "12px",
    lineHeight: 1.4,
  },

  cardIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "30px",
    height: "30px",
    borderRadius: "9px",
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    fontSize: "18px",
    fontWeight: "800",
  },

  formGroup: {
    marginBottom: "16px",
  },

  label: {
    display: "block",
    marginBottom: "7px",
    color: "#334155",
    fontSize: "12px",
    fontWeight: "700",
  },

  input: {
    width: "100%",
    padding: "11px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    outline: "none",
    backgroundColor: "#ffffff",
    color: "#0f172a",
    fontSize: "13px",
    boxSizing: "border-box",
  },

  twoColumns: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },

  formActions: {
    display: "flex",
    gap: "8px",
    marginTop: "22px",
  },

  saveButton: {
    flex: 1,
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: "800",
    cursor: "pointer",
  },

  cancelButton: {
    padding: "12px 14px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#94a3b8",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
  },

  disabledButton: {
    backgroundColor: "#93c5fd",
    cursor: "not-allowed",
  },

  tableHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "12px",
    padding: "22px",
    borderBottom: "1px solid #f1f5f9",
  },

  counter: {
    padding: "6px 10px",
    borderRadius: "20px",
    backgroundColor: "#eff6ff",
    color: "#1d4ed8",
    fontSize: "11px",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "13px",
  },

  tableHeading: {
    color: "#64748b",
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    textAlign: "left",
    fontSize: "10px",
    letterSpacing: "0.4px",
  },

  tableRow: {
    borderBottom: "1px solid #f1f5f9",
  },

  tableCell: {
    padding: "14px 16px",
    color: "#475569",
    whiteSpace: "nowrap",
  },

  productName: {
    display: "block",
    color: "#0f172a",
    fontSize: "13px",
  },

  productId: {
    display: "block",
    marginTop: "3px",
    color: "#94a3b8",
    fontSize: "10px",
  },

  categoryBadge: {
    padding: "5px 8px",
    borderRadius: "6px",
    backgroundColor: "#f1f5f9",
    color: "#475569",
    fontSize: "10px",
    fontWeight: "700",
  },

  codeBadge: {
    display: "inline-block",
    padding: "5px 8px",
    borderRadius: "6px",
    backgroundColor: "#f8fafc",
    color: "#334155",
    fontSize: "11px",
    fontWeight: "800",
  },

  saleTypeBadge: {
    display: "inline-block",
    marginLeft: "6px",
    padding: "4px 6px",
    borderRadius: "5px",
    backgroundColor: "#ecfdf5",
    color: "#047857",
    fontSize: "9px",
    fontWeight: "800",
  },

  stockWarning: {
    display: "inline-block",
    marginLeft: "7px",
    padding: "3px 6px",
    borderRadius: "5px",
    backgroundColor: "#ffedd5",
    color: "#c2410c",
    fontSize: "9px",
    fontWeight: "800",
  },

  editButton: {
    padding: "7px 10px",
    marginRight: "6px",
    border: "1px solid #bfdbfe",
    borderRadius: "7px",
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    fontSize: "11px",
    fontWeight: "700",
    cursor: "pointer",
  },

  deleteButton: {
    padding: "7px 10px",
    border: "1px solid #fecaca",
    borderRadius: "7px",
    backgroundColor: "#fff1f2",
    color: "#dc2626",
    fontSize: "11px",
    fontWeight: "700",
    cursor: "pointer",
  },

  emptyState: {
    padding: "60px 20px",
    color: "#94a3b8",
    textAlign: "center",
    fontSize: "13px",
  },
};

export default Produtos;
