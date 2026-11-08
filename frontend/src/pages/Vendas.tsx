import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

interface Produto {
  id: number;
  nome: string;
  quantidade: number;
  valor: number;
  categoria?: string;
}

interface Caixa {
  id: number;
  valorInicial: number;
  valorEsperado?: number;
  valorContado?: number;
  diferenca?: number;
  horarioAbertura?: string;
  horarioFechamento?: string;
  status: 'ABERTO' | 'FECHADO';
}

interface ItemCarrinho {
  produto: Produto;
  qtdDesejada: number;
  subtotal: number;
}

interface VendasProps {
  onNavegar?: (
    tela: 'dashboard' | 'produtos' | 'vendas' | 'movimentacoes'
  ) => void;
  onLogout?: () => void;
}

type FormaPagamento =
  | 'DINHEIRO'
  | 'PIX'
  | 'CARTAO_CREDITO'
  | 'CARTAO_DEBITO'
  | 'FIADO';

interface Mensagem {
  texto: string;
  erro: boolean;
}

function normalizarProduto(
  produto: Produto & {
    name_produtos?: string;
    valor_produto?: number;
  }
): Produto {
  return {
    id: produto.id,
    nome:
      produto.nome ||
      produto.name_produtos ||
      'Produto sem nome',
    quantidade: Number(produto.quantidade ?? 0),
    valor: Number(
      produto.valor ?? produto.valor_produto ?? 0
    ),
    categoria: produto.categoria,
  };
}

function formatarMoeda(valor: number): string {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function Vendas({
  onNavegar,
  onLogout,
}: VendasProps) {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [produtoId, setProdutoId] = useState<number | ''>('');
  const [qtd, setQtd] = useState<number | ''>(1);
  const [formaPagamento, setFormaPagamento] =
    useState<FormaPagamento>('PIX');
  const [mensagem, setMensagem] = useState<Mensagem | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [finalizando, setFinalizando] = useState(false);
  const [caixa, setCaixa] = useState<Caixa | null>(null);
  const [carregandoCaixa, setCarregandoCaixa] = useState(true);
  const [abrindoCaixa, setAbrindoCaixa] = useState(false);
  const [fechandoCaixa, setFechandoCaixa] = useState(false);
  const [valorInicial, setValorInicial] = useState('');
  const [valorContado, setValorContado] = useState('');
  const [modalAbertura, setModalAbertura] = useState(false);
  const [modalFechamento, setModalFechamento] = useState(false);

  const userId = localStorage.getItem('userId');

  function exibirMensagem(
    texto: string,
    erro: boolean = false
  ) {
    setMensagem({ texto, erro });
    window.setTimeout(() => setMensagem(null), 4500);
  }

  function converterValor(valor: string): number {
    return Number(valor.replace(',', '.'));
  }

  function formatarDataHora(valor?: string): string {
    if (!valor) return '—';

    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) return valor;

    return data.toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  }

  async function carregarCaixaAberto() {
    if (!userId) return;

    setCarregandoCaixa(true);

    try {
      const resposta = await api.get<Caixa | null>(
        `/buscarCaixaAberto?userId=${encodeURIComponent(userId)}`
      );

      setCaixa(resposta && resposta.status === 'ABERTO' ? resposta : null);
    } catch (error) {
      console.error('Erro ao buscar caixa aberto:', error);
      setCaixa(null);
    } finally {
      setCarregandoCaixa(false);
    }
  }

  async function handleAbrirCaixa(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!userId) {
      exibirMensagem('Usuário não encontrado. Faça login novamente.', true);
      return;
    }

    const valor = converterValor(valorInicial);

    if (!Number.isFinite(valor) || valor < 0) {
      exibirMensagem('Informe um valor inicial válido.', true);
      return;
    }

    setAbrindoCaixa(true);

    try {
      const resposta = await api.post<Caixa>(
        `/AberturaCaixa?valor=${encodeURIComponent(valor.toFixed(2))}&userId=${encodeURIComponent(userId)}`,
        {}
      );

      setCaixa(resposta);
      setValorInicial('');
      setModalAbertura(false);
      exibirMensagem('Caixa aberto com sucesso. As vendas estão liberadas.');
    } catch (error) {
      console.error('Erro ao abrir caixa:', error);
      const mensagemErro =
        error instanceof Error
          ? error.message
          : 'Não foi possível abrir o caixa.';
      exibirMensagem(mensagemErro, true);
    } finally {
      setAbrindoCaixa(false);
    }
  }

  async function handleFecharCaixa(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!caixa) {
      exibirMensagem('Nenhum caixa aberto foi encontrado.', true);
      return;
    }

    const valor = converterValor(valorContado);

    if (!Number.isFinite(valor) || valor < 0) {
      exibirMensagem('Informe um valor contado válido.', true);
      return;
    }

    setFechandoCaixa(true);

    try {
      const resposta = await api.put<Caixa>(
        `/fechamentoCaixa/${caixa.id}`,
        { valorInformado: valor }
      );

      setCaixa(null);
      setValorContado('');
      setModalFechamento(false);

      const diferenca = Number(resposta?.diferenca ?? 0);
      const textoDiferenca = formatarMoeda(diferenca);

      exibirMensagem(
        `Caixa fechado com sucesso. Diferença apurada: ${textoDiferenca}.`
      );
    } catch (error) {
      console.error('Erro ao fechar caixa:', error);
      const mensagemErro =
        error instanceof Error
          ? error.message
          : 'Não foi possível fechar o caixa.';
      exibirMensagem(mensagemErro, true);
    } finally {
      setFechandoCaixa(false);
    }
  }

  async function carregarProdutos() {
    if (!userId) return;

    setCarregando(true);

    try {
      const resposta = await api.get<Produto[]>(
        `/returnProdutos?userId=${encodeURIComponent(
          userId
        )}&busca=`
      );

      const lista = Array.isArray(resposta) ? resposta : [];

      setProdutos(
        lista.map((produto) =>
          normalizarProduto(
            produto as Produto & {
              name_produtos?: string;
              valor_produto?: number;
            }
          )
        )
      );
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);

      const mensagemErro =
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar os produtos.';

      exibirMensagem(mensagemErro, true);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    if (userId) {
      carregarProdutos();
      carregarCaixaAberto();
    }
  }, [userId]);

  function handleNavegar(
    tela: 'dashboard' | 'produtos' | 'vendas' | 'movimentacoes'
  ) {
    if (onNavegar) {
      onNavegar(tela);
      return;
    }

    window.location.href = `/${tela}`;
  }

  function handleAdicionarItem(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!caixa) {
      exibirMensagem('Abra o caixa antes de adicionar produtos à venda.', true);
      return;
    }

    if (produtoId === '') {
      exibirMensagem('Selecione um produto.', true);
      return;
    }

    const quantidadeNumerica = Number(qtd);

    if (
      qtd === '' ||
      !Number.isInteger(quantidadeNumerica) ||
      quantidadeNumerica <= 0
    ) {
      exibirMensagem(
        'A quantidade deve ser um número inteiro maior que zero.',
        true
      );
      return;
    }

    const produtoSelecionado = produtos.find(
      (produto) => produto.id === Number(produtoId)
    );

    if (!produtoSelecionado) {
      exibirMensagem('Produto não encontrado.', true);
      return;
    }

    const itemExistente = carrinho.find(
      (item) => item.produto.id === produtoSelecionado.id
    );

    const quantidadeNoCarrinho =
      itemExistente?.qtdDesejada ?? 0;
    const novaQuantidade =
      quantidadeNoCarrinho + quantidadeNumerica;

    if (novaQuantidade > produtoSelecionado.quantidade) {
      exibirMensagem(
        `Estoque insuficiente. Disponível: ${produtoSelecionado.quantidade} unidade(s).`,
        true
      );
      return;
    }

    if (itemExistente) {
      setCarrinho((carrinhoAtual) =>
        carrinhoAtual.map((item) =>
          item.produto.id === produtoSelecionado.id
            ? {
                ...item,
                qtdDesejada: novaQuantidade,
                subtotal:
                  novaQuantidade * produtoSelecionado.valor,
              }
            : item
        )
      );
    } else {
      setCarrinho((carrinhoAtual) => [
        ...carrinhoAtual,
        {
          produto: produtoSelecionado,
          qtdDesejada: quantidadeNumerica,
          subtotal:
            quantidadeNumerica * produtoSelecionado.valor,
        },
      ]);
    }

    setProdutoId('');
    setQtd(1);
  }

  function handleRemoverItem(produtoIdParaRemover: number) {
    setCarrinho((carrinhoAtual) =>
      carrinhoAtual.filter(
        (item) => item.produto.id !== produtoIdParaRemover
      )
    );
  }

  const totalGeral = carrinho.reduce(
    (total, item) => total + item.subtotal,
    0
  );

  const totalItens = carrinho.reduce(
    (total, item) => total + item.qtdDesejada,
    0
  );

  async function handleFinalizarVenda() {
    if (!caixa) {
      exibirMensagem(
        'Abra o caixa antes de finalizar uma venda.',
        true
      );
      return;
    }

    if (!userId) {
      exibirMensagem(
        'Usuário não encontrado. Faça login novamente.',
        true
      );
      return;
    }

    if (carrinho.length === 0) {
      exibirMensagem('O carrinho está vazio.', true);
      return;
    }

    const dadosVenda = {
      userId: Number(userId),
      pagamento: formaPagamento,
      lista: carrinho.map((item) => ({
        produtoId: item.produto.id,
        quantidade: item.qtdDesejada,
      })),
    };

    setFinalizando(true);

    try {
      await api.post('/createVenda/', dadosVenda);

      exibirMensagem('Venda realizada com sucesso!');
      setCarrinho([]);
      setProdutoId('');
      setQtd(1);
      await carregarProdutos();
    } catch (error) {
      console.error('Erro ao finalizar venda:', error);

      const mensagemErro =
        error instanceof Error
          ? error.message
          : 'Erro ao processar a venda.';

      exibirMensagem(mensagemErro, true);
    } finally {
      setFinalizando(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('userId');
    localStorage.removeItem('usuarioLogado');

    if (onLogout) {
      onLogout();
      return;
    }

    window.location.href = '/';
  }

  if (!userId) return null;

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <div>
          <div style={styles.brand}>
            <div style={styles.logoIcon}>📦</div>
            <div>
              <strong style={styles.brandTitle}>
                Sistema de Estoque
              </strong>
              <span style={styles.brandSubtitle}>
                Gestão comercial
              </span>
            </div>
          </div>

          <nav style={styles.navigation}>
            <button
              type="button"
              onClick={() => handleNavegar('dashboard')}
              style={styles.navButton}
            >
              <span>▦</span> Dashboard
            </button>

            <button
              type="button"
              onClick={() => handleNavegar('produtos')}
              style={styles.navButton}
            >
              <span>📦</span> Produtos
            </button>

            <button
              type="button"
              onClick={() => handleNavegar('vendas')}
              style={{
                ...styles.navButton,
                ...styles.navButtonActive,
              }}
            >
              <span>🛒</span> Caixa / Vendas
            </button>

            <button
              type="button"
              onClick={() => handleNavegar('movimentacoes')}
              style={styles.navButton}
            >
              <span>↕</span> Movimentações
            </button>
          </nav>
        </div>

        <div style={styles.sidebarUser}>
          <div style={styles.avatar}>U</div>
          <div>
            <strong style={styles.userName}>
              Usuário conectado
            </strong>
            <span style={styles.userRole}>
              Frente de caixa · ID {userId}
            </span>
          </div>
        </div>
      </aside>

      <div style={styles.mainArea}>
        <header style={styles.header}>
          <div>
            <span style={styles.headerEyebrow}>
              OPERAÇÃO DE VENDAS
            </span>
            <strong style={styles.headerTitle}>
              Frente de caixa
            </strong>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            style={styles.logoutButton}
          >
            Sair
          </button>
        </header>

        <main style={styles.content}>
          <div style={styles.pageHeading}>
            <div>
              <span style={styles.eyebrow}>CAIXA</span>
              <h1 style={styles.title}>Registrar venda</h1>
              <p style={styles.subtitle}>
                Adicione os produtos, confira o total e finalize o atendimento.
              </p>
            </div>

            <div
              style={{
                ...styles.statusBadge,
                ...(caixa ? {} : styles.statusBadgeClosed),
              }}
            >
              <span
                style={{
                  ...styles.statusDot,
                  ...(caixa ? {} : styles.statusDotClosed),
                }}
              />
              {caixa ? 'Caixa aberto' : 'Caixa fechado'}
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
              <strong>
                {mensagem.erro ? 'Atenção: ' : 'Concluído: '}
              </strong>
              {mensagem.texto}
            </div>
          )}

          <section
            style={{
              ...styles.cashCard,
              ...(caixa ? styles.cashCardOpen : styles.cashCardClosed),
            }}
          >
            <div style={styles.cashCardInfo}>
              <div style={styles.cashCardIcon}>{caixa ? '✓' : '!'}</div>
              <div>
                <span style={styles.cashCardLabel}>CONTROLE DE CAIXA</span>
                <strong style={styles.cashCardTitle}>
                  {carregandoCaixa
                    ? 'Verificando caixa...'
                    : caixa
                      ? 'Caixa aberto'
                      : 'Nenhum caixa aberto'}
                </strong>
                <span style={styles.cashCardCaption}>
                  {carregandoCaixa
                    ? 'Aguarde um momento.'
                    : caixa
                      ? `Abertura: ${formatarDataHora(caixa.horarioAbertura)} · Valor inicial: ${formatarMoeda(Number(caixa.valorInicial || 0))}`
                      : 'Abra o caixa para liberar o registro de vendas.'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => (caixa ? setModalFechamento(true) : setModalAbertura(true))}
              disabled={carregandoCaixa || abrindoCaixa || fechandoCaixa}
              style={{
                ...styles.cashActionButton,
                ...(caixa ? styles.cashCloseButton : styles.cashOpenButton),
                ...(carregandoCaixa || abrindoCaixa || fechandoCaixa
                  ? styles.disabledButton
                  : {}),
              }}
            >
              {caixa ? 'Fechar caixa' : 'Abrir caixa'}
            </button>
          </section>

          <section style={styles.summaryGrid}>
            <div style={styles.summaryCard}>
              <span style={styles.summaryLabel}>ITENS NO CARRINHO</span>
              <strong style={styles.summaryValue}>{totalItens}</strong>
              <span style={styles.summaryCaption}>
                {carrinho.length} produto(s) diferente(s)
              </span>
            </div>

            <div style={styles.summaryCard}>
              <span style={styles.summaryLabel}>TOTAL DA VENDA</span>
              <strong style={styles.summaryValueBlue}>
                {formatarMoeda(totalGeral)}
              </strong>
              <span style={styles.summaryCaption}>
                Pagamento: {formaPagamento.replaceAll('_', ' ')}
              </span>
            </div>

            <div style={styles.summaryCard}>
              <span style={styles.summaryLabel}>PRODUTOS DISPONÍVEIS</span>
              <strong style={styles.summaryValue}>
                {produtos.filter((produto) => produto.quantidade > 0).length}
              </strong>
              <span style={styles.summaryCaption}>
                Catálogo carregado para venda
              </span>
            </div>
          </section>

          <div style={styles.contentGrid}>
            <section style={styles.selectionCard}>
              <div style={styles.cardHeader}>
                <div>
                  <h2 style={styles.cardTitle}>Selecionar carrinho</h2>
                  <p style={styles.cardSubtitle}>
                    Selecione um item e informe a quantidade.
                  </p>
                </div>
                <span style={styles.cardIcon}>+</span>
              </div>

              <form onSubmit={handleAdicionarItem}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Produto</label>
                  <select
                    value={produtoId}
                    onChange={(event) => {
                      const valorSelecionado = event.target.value;
                      setProdutoId(
                        valorSelecionado === ''
                          ? ''
                          : Number(valorSelecionado)
                      );
                    }}
                    disabled={carregando || finalizando || carregandoCaixa || !caixa}
                    style={styles.input}
                  >
                    <option value="">
                      {carregando
                        ? 'Carregando produtos...'
                        : 'Selecione um produto'}
                    </option>
                    {produtos.map((produto) => (
                      <option
                        key={produto.id}
                        value={produto.id}
                        disabled={produto.quantidade <= 0}
                      >
                        {produto.nome} · {formatarMoeda(produto.valor)} · estoque:{' '}
                        {produto.quantidade}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Quantidade</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={qtd}
                    onChange={(event) => {
                      const valorDigitado = event.target.value;
                      setQtd(
                        valorDigitado === ''
                          ? ''
                          : Number(valorDigitado)
                      );
                    }}
                    disabled={carregando || finalizando || carregandoCaixa || !caixa}
                    style={styles.input}
                  />
                </div>

                <button
                  type="submit"
                  disabled={carregando || finalizando || carregandoCaixa || !caixa}
                  style={{
                    ...styles.addButton,
                    ...(carregando || finalizando
                      ? styles.disabledButton
                      : {}),
                  }}
                >
                  Adicionar ao carrinho
                </button>
              </form>

              <div style={styles.divider} />

              <div style={styles.cardHeaderSmall}>
                <div>
                  <h3 style={styles.paymentTitle}>
                    Forma de pagamento
                  </h3>
                  <p style={styles.cardSubtitle}>
                    Aplicada uma única vez à venda.
                  </p>
                </div>
                <span style={styles.paymentIcon}>$</span>
              </div>

              <select
                value={formaPagamento}
                onChange={(event) =>
                  setFormaPagamento(
                    event.target.value as FormaPagamento
                  )
                }
                disabled={finalizando || carregandoCaixa || !caixa}
                style={styles.input}
              >
                <option value="DINHEIRO">Dinheiro</option>
                <option value="PIX">Pix</option>
                <option value="CARTAO_CREDITO">
                  Cartão de crédito
                </option>
                <option value="CARTAO_DEBITO">
                  Cartão de débito
                </option>
                <option value="FIADO">Fiado</option>
              </select>
            </section>

            <section style={styles.cartCard}>
              <div style={styles.cardHeader}>
                <div>
                  <h2 style={styles.cardTitle}>Carrinho de venda</h2>
                  <p style={styles.cardSubtitle}>
                    Revise os itens antes de concluir.
                  </p>
                </div>
                <span style={styles.itemCounter}>
                  {carrinho.length} item(ns)
                </span>
              </div>

              {carrinho.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>🛒</div>
                  <strong style={styles.emptyTitle}>
                    Seu carrinho está vazio
                  </strong>
                  <span>
                    Adicione produtos ao lado para iniciar a venda.
                  </span>
                </div>
              ) : (
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.tableHeading}>
                        <th style={styles.tableCell}>ITEM</th>
                        <th style={styles.tableCell}>QTD.</th>
                        <th style={styles.tableCell}>UNIT.</th>
                        <th style={styles.tableCell}>SUBTOTAL</th>
                        <th
                          style={{
                            ...styles.tableCell,
                            textAlign: 'right',
                          }}
                        >
                          AÇÃO
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {carrinho.map((item) => (
                        <tr
                          key={item.produto.id}
                          style={styles.tableRow}
                        >
                          <td style={styles.tableCell}>
                            <strong style={styles.productName}>
                              {item.produto.nome}
                            </strong>
                            <span style={styles.productCategory}>
                              {item.produto.categoria || 'Produto'}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            {item.qtdDesejada} un
                          </td>
                          <td style={styles.tableCell}>
                            {formatarMoeda(item.produto.valor)}
                          </td>
                          <td
                            style={{
                              ...styles.tableCell,
                              fontWeight: '800',
                              color: '#0f172a',
                            }}
                          >
                            {formatarMoeda(item.subtotal)}
                          </td>
                          <td
                            style={{
                              ...styles.tableCell,
                              textAlign: 'right',
                            }}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoverItem(item.produto.id)
                              }
                              disabled={finalizando}
                              style={styles.deleteButton}
                            >
                              Remover
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div style={styles.cartFooter}>
                <div style={styles.totalRow}>
                  <div>
                    <span style={styles.totalLabel}>Total da venda</span>
                    <span style={styles.totalCaption}>
                      {totalItens} unidade(s)
                    </span>
                  </div>
                  <strong style={styles.totalValue}>
                    {formatarMoeda(totalGeral)}
                  </strong>
                </div>

                <button
                  type="button"
                  onClick={handleFinalizarVenda}
                  disabled={carrinho.length === 0 || finalizando || carregandoCaixa || !caixa}
                  style={{
                    ...styles.finishButton,
                    ...(carrinho.length === 0 || finalizando || carregandoCaixa || !caixa
                      ? styles.disabledButton
                      : {}),
                  }}
                >
                  {finalizando
                    ? 'Processando venda...'
                    : !caixa
                      ? 'Abra o caixa para vender'
                      : 'Finalizar venda'}
                </button>
              </div>
            </section>
          </div>
        </main>

        {modalAbertura && (
          <div style={styles.modalOverlay}>
            <form style={styles.modalCard} onSubmit={handleAbrirCaixa}>
              <div style={styles.modalHeader}>
                <div>
                  <span style={styles.modalEyebrow}>CONTROLE DE CAIXA</span>
                  <h2 style={styles.modalTitle}>Abrir caixa</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setModalAbertura(false)}
                  style={styles.modalClose}
                  aria-label="Fechar modal"
                >
                  ×
                </button>
              </div>
              <p style={styles.modalText}>
                Informe o valor inicial disponível no caixa.
              </p>
              <label style={styles.label} htmlFor="valorInicial">
                Valor inicial
              </label>
              <input
                id="valorInicial"
                type="text"
                inputMode="decimal"
                value={valorInicial}
                onChange={(event) => setValorInicial(event.target.value)}
                placeholder="0,00"
                autoFocus
                style={styles.input}
              />
              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setModalAbertura(false)}
                  style={styles.secondaryButton}
                  disabled={abrindoCaixa}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={styles.primaryModalButton}
                  disabled={abrindoCaixa}
                >
                  {abrindoCaixa ? 'Abrindo...' : 'Abrir caixa'}
                </button>
              </div>
            </form>
          </div>
        )}

        {modalFechamento && caixa && (
          <div style={styles.modalOverlay}>
            <form style={styles.modalCard} onSubmit={handleFecharCaixa}>
              <div style={styles.modalHeader}>
                <div>
                  <span style={styles.modalEyebrow}>CONTROLE DE CAIXA</span>
                  <h2 style={styles.modalTitle}>Fechar caixa</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setModalFechamento(false)}
                  style={styles.modalClose}
                  aria-label="Fechar modal"
                >
                  ×
                </button>
              </div>
              <p style={styles.modalText}>
                Conte o dinheiro físico e informe o valor encontrado.
              </p>
              <div style={styles.cashSummaryMini}>
                <span>Valor inicial</span>
                <strong>{formatarMoeda(Number(caixa.valorInicial || 0))}</strong>
              </div>
              <label style={styles.label} htmlFor="valorContado">
                Valor contado
              </label>
              <input
                id="valorContado"
                type="text"
                inputMode="decimal"
                value={valorContado}
                onChange={(event) => setValorContado(event.target.value)}
                placeholder="0,00"
                autoFocus
                style={styles.input}
              />
              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setModalFechamento(false)}
                  style={styles.secondaryButton}
                  disabled={fechandoCaixa}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={styles.closeModalButton}
                  disabled={fechandoCaixa}
                >
                  {fechandoCaixa ? 'Fechando...' : 'Fechar caixa'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f1f5f9',
    fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
  },

  sidebar: {
    width: '246px',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: '#0b122b',
    color: '#ffffff',
    boxSizing: 'border-box',
  },

  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '26px 22px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },

  logoIcon: {
    width: '34px',
    height: '34px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '10px',
    backgroundColor: '#2563eb',
    fontSize: '17px',
  },

  brandTitle: {
    display: 'block',
    color: '#ffffff',
    fontSize: '14px',
  },

  brandSubtitle: {
    display: 'block',
    marginTop: '3px',
    color: '#94a3b8',
    fontSize: '11px',
  },

  navigation: {
    display: 'flex',
    flexDirection: 'column',
    gap: '7px',
    padding: '24px 12px',
  },

  navButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    padding: '13px 14px',
    border: 'none',
    borderRadius: '9px',
    backgroundColor: 'transparent',
    color: '#aab5ce',
    fontSize: '13px',
    fontWeight: '600',
    textAlign: 'left',
    cursor: 'pointer',
  },

  navButtonActive: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    boxShadow: '0 8px 20px rgba(37,99,235,0.25)',
  },

  sidebarUser: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '18px',
    borderTop: '1px solid rgba(255,255,255,0.08)',
  },

  avatar: {
    width: '34px',
    height: '34px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: '700',
  },

  userName: {
    display: 'block',
    color: '#e2e8f0',
    fontSize: '12px',
  },

  userRole: {
    display: 'block',
    marginTop: '3px',
    color: '#94a3b8',
    fontSize: '10px',
  },

  mainArea: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    minWidth: 0,
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: '72px',
    padding: '0 38px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    boxSizing: 'border-box',
  },

  headerEyebrow: {
    display: 'block',
    color: '#2563eb',
    fontSize: '10px',
    fontWeight: '800',
    letterSpacing: '1.3px',
  },

  headerTitle: {
    display: 'block',
    marginTop: '4px',
    color: '#0f172a',
    fontSize: '15px',
  },

  logoutButton: {
    padding: '9px 15px',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    backgroundColor: '#fff1f2',
    color: '#dc2626',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
  },

  content: {
    flex: 1,
    padding: '34px 38px',
    boxSizing: 'border-box',
  },

  pageHeading: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '18px',
    marginBottom: '24px',
  },

  eyebrow: {
    color: '#2563eb',
    fontSize: '11px',
    fontWeight: '800',
    letterSpacing: '1.5px',
  },

  title: {
    margin: '7px 0 4px',
    color: '#0f172a',
    fontSize: '30px',
    fontWeight: '800',
    letterSpacing: '-1px',
  },

  subtitle: {
    margin: 0,
    color: '#64748b',
    fontSize: '14px',
  },

  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '9px 12px',
    border: '1px solid #bbf7d0',
    borderRadius: '20px',
    backgroundColor: '#f0fdf4',
    color: '#15803d',
    fontSize: '12px',
    fontWeight: '700',
  },

  statusDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    backgroundColor: '#16a34a',
  },

  message: {
    padding: '13px 16px',
    marginBottom: '20px',
    borderRadius: '9px',
    fontSize: '13px',
  },

  successMessage: {
    color: '#166534',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
  },

  errorMessage: {
    color: '#991b1b',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
  },

  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '17px',
    marginBottom: '22px',
  },

  summaryCard: {
    minHeight: '112px',
    padding: '18px 20px',
    border: '1px solid #e2e8f0',
    borderRadius: '13px',
    backgroundColor: '#ffffff',
    boxShadow: '0 5px 18px rgba(15,23,42,0.04)',
    boxSizing: 'border-box',
  },

  summaryLabel: {
    display: 'block',
    color: '#64748b',
    fontSize: '10px',
    fontWeight: '800',
    letterSpacing: '0.8px',
  },

  summaryValue: {
    display: 'block',
    marginTop: '12px',
    color: '#0f172a',
    fontSize: '24px',
  },

  summaryValueBlue: {
    display: 'block',
    marginTop: '12px',
    color: '#2563eb',
    fontSize: '24px',
  },

  summaryCaption: {
    display: 'block',
    marginTop: '4px',
    color: '#94a3b8',
    fontSize: '11px',
  },

  contentGrid: {
    display: 'grid',
    gridTemplateColumns: '340px minmax(0, 1fr)',
    gap: '22px',
    alignItems: 'stretch',
  },

  selectionCard: {
    padding: '22px',
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    backgroundColor: '#ffffff',
    boxShadow: '0 5px 18px rgba(15,23,42,0.04)',
    boxSizing: 'border-box',
  },

  cartCard: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '480px',
    padding: '22px',
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    backgroundColor: '#ffffff',
    boxShadow: '0 5px 18px rgba(15,23,42,0.04)',
    boxSizing: 'border-box',
  },

  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '22px',
  },

  cardHeaderSmall: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '12px',
  },

  cardTitle: {
    margin: 0,
    color: '#172033',
    fontSize: '16px',
    fontWeight: '800',
  },

  cardSubtitle: {
    margin: '5px 0 0',
    color: '#94a3b8',
    fontSize: '12px',
    lineHeight: 1.4,
  },

  cardIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '30px',
    height: '30px',
    borderRadius: '9px',
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    fontSize: '18px',
    fontWeight: '800',
  },

  paymentIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    backgroundColor: '#ecfdf5',
    color: '#047857',
    fontSize: '14px',
    fontWeight: '800',
  },

  formGroup: {
    marginBottom: '16px',
  },

  label: {
    display: 'block',
    marginBottom: '7px',
    color: '#334155',
    fontSize: '12px',
    fontWeight: '700',
  },

  input: {
    width: '100%',
    padding: '11px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    outline: 'none',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    fontSize: '13px',
    boxSizing: 'border-box',
  },

  addButton: {
    width: '100%',
    padding: '12px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: '800',
    cursor: 'pointer',
  },

  divider: {
    height: '1px',
    margin: '24px 0 20px',
    backgroundColor: '#e2e8f0',
  },

  paymentTitle: {
    margin: 0,
    color: '#172033',
    fontSize: '14px',
    fontWeight: '800',
  },

  itemCounter: {
    padding: '6px 10px',
    borderRadius: '20px',
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    fontSize: '11px',
    fontWeight: '800',
    whiteSpace: 'nowrap',
  },

  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: '250px',
    color: '#94a3b8',
    textAlign: 'center',
    fontSize: '13px',
    gap: '6px',
  },

  emptyIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    marginBottom: '6px',
    borderRadius: '50%',
    backgroundColor: '#f1f5f9',
    fontSize: '22px',
  },

  emptyTitle: {
    color: '#475569',
    fontSize: '14px',
  },

  tableWrapper: {
    flex: 1,
    overflowX: 'auto',
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
  },

  tableHeading: {
    color: '#64748b',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    textAlign: 'left',
    fontSize: '10px',
    letterSpacing: '0.4px',
  },

  tableRow: {
    borderBottom: '1px solid #f1f5f9',
  },

  tableCell: {
    padding: '13px 9px',
    color: '#475569',
    whiteSpace: 'nowrap',
  },

  productName: {
    display: 'block',
    color: '#0f172a',
    fontSize: '13px',
  },

  productCategory: {
    display: 'block',
    marginTop: '3px',
    color: '#94a3b8',
    fontSize: '10px',
  },

  deleteButton: {
    padding: '7px 9px',
    border: '1px solid #fecaca',
    borderRadius: '7px',
    backgroundColor: '#fff1f2',
    color: '#dc2626',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer',
  },

  cartFooter: {
    marginTop: '22px',
    paddingTop: '18px',
    borderTop: '1px solid #e2e8f0',
  },

  totalRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '17px',
  },

  totalLabel: {
    display: 'block',
    color: '#334155',
    fontSize: '15px',
    fontWeight: '800',
  },

  totalCaption: {
    display: 'block',
    marginTop: '4px',
    color: '#94a3b8',
    fontSize: '11px',
  },

  totalValue: {
    color: '#2563eb',
    fontSize: '26px',
    fontWeight: '800',
  },

  finishButton: {
    width: '100%',
    padding: '13px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '800',
    cursor: 'pointer',
  },

  statusBadgeClosed: {
    border: '1px solid #fed7aa',
    backgroundColor: '#fff7ed',
    color: '#c2410c',
  },

  statusDotClosed: {
    backgroundColor: '#f97316',
  },

  cashCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '18px',
    marginBottom: '22px',
    padding: '18px 20px',
    border: '1px solid #e2e8f0',
    borderRadius: '13px',
    boxShadow: '0 5px 18px rgba(15,23,42,0.04)',
    boxSizing: 'border-box',
  },

  cashCardOpen: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },

  cashCardClosed: {
    backgroundColor: '#fffaf5',
    borderColor: '#fed7aa',
  },

  cashCardInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '13px',
    minWidth: 0,
  },

  cashCardIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: '#ffffff',
    color: '#16a34a',
    fontSize: '18px',
    fontWeight: '900',
  },

  cashCardLabel: {
    display: 'block',
    color: '#64748b',
    fontSize: '10px',
    fontWeight: '800',
    letterSpacing: '0.8px',
  },

  cashCardTitle: {
    display: 'block',
    marginTop: '4px',
    color: '#172033',
    fontSize: '16px',
  },

  cashCardCaption: {
    display: 'block',
    marginTop: '4px',
    color: '#64748b',
    fontSize: '12px',
  },

  cashActionButton: {
    flexShrink: 0,
    padding: '11px 16px',
    border: 'none',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: '800',
    cursor: 'pointer',
  },

  cashOpenButton: {
    backgroundColor: '#ea580c',
  },

  cashCloseButton: {
    backgroundColor: '#dc2626',
  },

  modalOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    backgroundColor: 'rgba(15,23,42,0.48)',
    boxSizing: 'border-box',
  },

  modalCard: {
    width: '100%',
    maxWidth: '430px',
    padding: '24px',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    backgroundColor: '#ffffff',
    boxShadow: '0 24px 70px rgba(15,23,42,0.22)',
    boxSizing: 'border-box',
  },

  modalHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '16px',
  },

  modalEyebrow: {
    color: '#2563eb',
    fontSize: '10px',
    fontWeight: '800',
    letterSpacing: '1.2px',
  },

  modalTitle: {
    margin: '7px 0 0',
    color: '#0f172a',
    fontSize: '22px',
  },

  modalClose: {
    width: '30px',
    height: '30px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#f1f5f9',
    color: '#64748b',
    fontSize: '20px',
    lineHeight: 1,
    cursor: 'pointer',
  },

  modalText: {
    margin: '14px 0 20px',
    color: '#64748b',
    fontSize: '13px',
    lineHeight: 1.5,
  },

  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '22px',
  },

  secondaryButton: {
    padding: '11px 15px',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    color: '#475569',
    fontSize: '12px',
    fontWeight: '800',
    cursor: 'pointer',
  },

  primaryModalButton: {
    padding: '11px 15px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: '800',
    cursor: 'pointer',
  },

  closeModalButton: {
    padding: '11px 15px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#dc2626',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: '800',
    cursor: 'pointer',
  },

  cashSummaryMini: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '18px',
    padding: '11px 12px',
    borderRadius: '8px',
    backgroundColor: '#f8fafc',
    color: '#64748b',
    fontSize: '12px',
  },

  disabledButton: {
    backgroundColor: '#94a3b8',
    cursor: 'not-allowed',
  },
};

export default Vendas;
