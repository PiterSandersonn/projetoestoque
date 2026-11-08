import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

type Tela =
  | 'dashboard'
  | 'produtos'
  | 'vendas'
  | 'movimentacoes';

interface DashboardProps {
  onNavegar: (tela: Tela) => void;
}

interface EstoqueBaixoDTO {
  nome: string;
  quantidade: number;
}

interface CategoriasMaisVendidaDTO {
  categoria: string;
  quantidadeVendida: number;
  total: number;
}

const formatarMoeda = (valor: number): string => {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

const formatarCategoria = (categoria: string): string => {
  return String(categoria || '')
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letra) => letra.toUpperCase());
};

const Dashboard: React.FC<DashboardProps> = ({
  onNavegar,
}) => {
  const [totalVendaDia, setTotalVendaDia] =
    useState<number>(0);

  const [quantidadeVendasDia, setQuantidadeVendasDia] =
    useState<number>(0);

  const [totalVendasMes, setTotalVendasMes] =
    useState<number>(0);

  const [estoqueBaixo, setEstoqueBaixo] =
    useState<EstoqueBaixoDTO[]>([]);

  const [estoqueZerado, setEstoqueZerado] =
    useState<EstoqueBaixoDTO[]>([]);

  const [categoriasMaisVendidas, setCategoriasMaisVendidas] =
    useState<CategoriasMaisVendidaDTO[]>([]);

  const [carregando, setCarregando] =
    useState<boolean>(true);

  const [erro, setErro] =
    useState<string>('');

  const userId = localStorage.getItem('userId');

  const carregarDashboard = async () => {
    if (!userId) {
      setErro('Usuário não encontrado.');
      setCarregando(false);
      return;
    }

    setCarregando(true);
    setErro('');

    const resultados = await Promise.allSettled([
      api.get<number>(`/totalVendaDia/${userId}`),

      api.get<number>(
        `/quantidadeVendasDia/${userId}`
      ),

      api.get<number>(
        `/totalVendasMes/${userId}`
      ),

      api.get<EstoqueBaixoDTO[]>(
        `/estoqueBaixo/${userId}`
      ),

      api.get<EstoqueBaixoDTO[]>(
        `/produtosEstoqueVazio/${userId}`
      ),

      api.get<CategoriasMaisVendidaDTO[]>(
        `/categoriaMaisVendida/${userId}`
      ),
    ]);

    const [
      resultadoTotalDia,
      resultadoQuantidadeDia,
      resultadoTotalMes,
      resultadoEstoqueBaixo,
      resultadoEstoqueZerado,
      resultadoCategorias,
    ] = resultados;

    if (resultadoTotalDia.status === 'fulfilled') {
      setTotalVendaDia(
        Number(resultadoTotalDia.value || 0)
      );
    }

    if (
      resultadoQuantidadeDia.status === 'fulfilled'
    ) {
      setQuantidadeVendasDia(
        Number(resultadoQuantidadeDia.value || 0)
      );
    }

    if (resultadoTotalMes.status === 'fulfilled') {
      setTotalVendasMes(
        Number(resultadoTotalMes.value || 0)
      );
    }

    if (
      resultadoEstoqueBaixo.status === 'fulfilled'
    ) {
      setEstoqueBaixo(
        resultadoEstoqueBaixo.value || []
      );
    }

    if (
      resultadoEstoqueZerado.status === 'fulfilled'
    ) {
      setEstoqueZerado(
        resultadoEstoqueZerado.value || []
      );
    }

    if (
      resultadoCategorias.status === 'fulfilled'
    ) {
      setCategoriasMaisVendidas(
        resultadoCategorias.value || []
      );
    }

    const algumaFalha =
      resultados.some(
        (resultado) => resultado.status === 'rejected'
      );

    if (algumaFalha) {
      setErro(
        'Algumas informações não puderam ser carregadas.'
      );
    }

    setCarregando(false);
  };

  useEffect(() => {
    carregarDashboard();
  }, []);

  const categoriaPrincipal =
    categoriasMaisVendidas.length > 0
      ? categoriasMaisVendidas[0]
      : null;

  return (
    <div style={styles.layout}>
      <aside style={styles.sidebar}>
        <div style={styles.logoArea}>
          <div style={styles.logoIcon}>📦</div>

          <div>
            <strong style={styles.logoTitle}>
              Sistema de Estoque
            </strong>

            <span style={styles.logoSubtitle}>
              Gestão comercial
            </span>
          </div>
        </div>

        <nav style={styles.menu}>
          <button
            type="button"
            style={{
              ...styles.menuButton,
              ...styles.menuButtonAtivo,
            }}
            onClick={() => onNavegar('dashboard')}
          >
            <span>▦</span>
            Dashboard
          </button>

          <button
            type="button"
            style={styles.menuButton}
            onClick={() => onNavegar('produtos')}
          >
            <span>📦</span>
            Produtos
          </button>

          <button
            type="button"
            style={styles.menuButton}
            onClick={() => onNavegar('vendas')}
          >
            <span>🛒</span>
            Caixa / Vendas
          </button>

          <button
            type="button"
            style={styles.menuButton}
            onClick={() =>
              onNavegar('movimentacoes')
            }
          >
            <span>↕</span>
            Movimentações
          </button>
        </nav>

        <div style={styles.userArea}>
          <div style={styles.userAvatar}>U</div>

          <div>
            <span style={styles.userLabel}>
              Usuário conectado
            </span>

            <strong style={styles.userId}>
              ID: {userId || '-'}
            </strong>
          </div>
        </div>
      </aside>

      <main style={styles.content}>
        <header style={styles.header}>
          <div>
            <span style={styles.eyebrow}>
              VISÃO GERAL
            </span>

            <h1 style={styles.title}>
              Dashboard
            </h1>

            <p style={styles.subtitle}>
              Acompanhe o desempenho do seu negócio.
            </p>
          </div>

          <button
            type="button"
            style={styles.refreshButton}
            onClick={carregarDashboard}
            disabled={carregando}
          >
            ↻ {carregando ? 'Atualizando...' : 'Atualizar'}
          </button>
        </header>

        {erro && (
          <div style={styles.warning}>
            <strong>Atenção:</strong> {erro}
          </div>
        )}

        {carregando ? (
          <div style={styles.loadingCard}>
            <div style={styles.spinner}>⟳</div>
            <p>Carregando informações do dashboard...</p>
          </div>
        ) : (
          <>
            <section style={styles.cardsGrid}>
              <div
                style={{
                  ...styles.card,
                  ...styles.cardBlue,
                }}
              >
                <div style={styles.cardTop}>
                  <span style={styles.cardLabel}>
                    VENDAS DE HOJE
                  </span>

                  <span style={styles.cardIcon}>
                    $
                  </span>
                </div>

                <strong style={styles.cardValue}>
                  {formatarMoeda(totalVendaDia)}
                </strong>

                <span style={styles.cardDescription}>
                  Total recebido em vendas pagas
                </span>
              </div>

              <div
                style={{
                  ...styles.card,
                  ...styles.cardGreen,
                }}
              >
                <div style={styles.cardTop}>
                  <span style={styles.cardLabel}>
                    VENDAS DO MÊS
                  </span>

                  <span style={styles.cardIcon}>
                    ◉
                  </span>
                </div>

                <strong style={styles.cardValue}>
                  {formatarMoeda(totalVendasMes)}
                </strong>

                <span style={styles.cardDescription}>
                  Faturamento do mês atual
                </span>
              </div>

              <div
                style={{
                  ...styles.card,
                  ...styles.cardPurple,
                }}
              >
                <div style={styles.cardTop}>
                  <span style={styles.cardLabel}>
                    VENDAS REALIZADAS
                  </span>

                  <span style={styles.cardIcon}>
                    #
                  </span>
                </div>

                <strong style={styles.cardValue}>
                  {quantidadeVendasDia}
                </strong>

                <span style={styles.cardDescription}>
                  Vendas concluídas hoje
                </span>
              </div>

              <div
                style={{
                  ...styles.card,
                  ...styles.cardOrange,
                }}
              >
                <div style={styles.cardTop}>
                  <span style={styles.cardLabel}>
                    ESTOQUE BAIXO
                  </span>

                  <span style={styles.cardIcon}>
                    !
                  </span>
                </div>

                <strong style={styles.cardValue}>
                  {estoqueBaixo.length}
                </strong>

                <span style={styles.cardDescription}>
                  Produtos com quantidade até 5
                </span>
              </div>
            </section>

            <section style={styles.columns}>
              <div style={styles.panel}>
                <div style={styles.panelHeader}>
                  <div>
                    <h2 style={styles.panelTitle}>
                      Categorias mais vendidas
                    </h2>

                    <p style={styles.panelSubtitle}>
                      Ranking por quantidade de itens
                    </p>
                  </div>

                  <span style={styles.panelBadge}>
                    {categoriasMaisVendidas.length}
                  </span>
                </div>

                {categoriasMaisVendidas.length === 0 ? (
                  <div style={styles.emptyState}>
                    <span style={styles.emptyIcon}>
                      ◌
                    </span>

                    <p>
                      Nenhuma venda paga encontrada.
                    </p>
                  </div>
                ) : (
                  <div style={styles.categoryList}>
                    {categoriasMaisVendidas
                      .slice(0, 5)
                      .map((categoria, index) => (
                        <div
                          key={`${categoria.categoria}-${index}`}
                          style={styles.categoryRow}
                        >
                          <div style={styles.rank}>
                            {index + 1}
                          </div>

                          <div style={styles.categoryInfo}>
                            <strong>
                              {formatarCategoria(
                                categoria.categoria
                              )}
                            </strong>

                            <div
                              style={
                                styles.progressBackground
                              }
                            >
                              <div
                                style={{
                                  ...styles.progress,
                                  width: `${Math.max(
                                    8,
                                    Math.min(
                                      100,
                                      (Number(
                                        categoria.quantidadeVendida
                                      ) /
                                        Number(
                                          categoriaPrincipal
                                            ?.quantidadeVendida ||
                                            1
                                        )) *
                                        100
                                    )
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>

                          <strong
                            style={styles.categoryQuantity}
                          >
                            {categoria.quantidadeVendida}
                          </strong>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              <div style={styles.panel}>
                <div style={styles.panelHeader}>
                  <div>
                    <h2 style={styles.panelTitle}>
                      Produtos sem estoque
                    </h2>

                    <p style={styles.panelSubtitle}>
                      Reposição necessária
                    </p>
                  </div>

                  <span
                    style={{
                      ...styles.panelBadge,
                      ...styles.badgeRed,
                    }}
                  >
                    {estoqueZerado.length}
                  </span>
                </div>

                {estoqueZerado.length === 0 ? (
                  <div style={styles.emptyState}>
                    <span style={styles.emptyIcon}>
                      ✓
                    </span>

                    <p>
                      Nenhum produto está sem estoque.
                    </p>
                  </div>
                ) : (
                  <div style={styles.productList}>
                    {estoqueZerado
                      .slice(0, 5)
                      .map((produto, index) => (
                        <div
                          key={`${produto.nome}-${index}`}
                          style={styles.productRow}
                        >
                          <div
                            style={{
                              ...styles.productIcon,
                              ...styles.productIconRed,
                            }}
                          >
                            !
                          </div>

                          <div style={styles.productInfo}>
                            <strong>
                              {produto.nome}
                            </strong>

                            <span>
                              Quantidade: 0
                            </span>
                          </div>

                          <span
                            style={styles.statusDanger}
                          >
                            Repor
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </section>

            <section style={styles.panel}>
              <div style={styles.panelHeader}>
                <div>
                  <h2 style={styles.panelTitle}>
                    Produtos com estoque baixo
                  </h2>

                  <p style={styles.panelSubtitle}>
                    Acompanhe os produtos que precisam de atenção
                  </p>
                </div>

                <span
                  style={{
                    ...styles.panelBadge,
                    ...styles.badgeOrange,
                  }}
                >
                  {estoqueBaixo.length}
                </span>
              </div>

              {estoqueBaixo.length === 0 ? (
                <div style={styles.emptyState}>
                  <span style={styles.emptyIcon}>
                    ✓
                  </span>

                  <p>
                    Nenhum produto com estoque baixo.
                  </p>
                </div>
              ) : (
                <div style={styles.lowStockGrid}>
                  {estoqueBaixo
                    .slice(0, 8)
                    .map((produto, index) => (
                      <div
                        key={`${produto.nome}-${index}`}
                        style={styles.lowStockItem}
                      >
                        <div>
                          <strong>
                            {produto.nome}
                          </strong>

                          <span>
                            Estoque atual
                          </span>
                        </div>

                        <strong
                          style={styles.lowStockQuantity}
                        >
                          {produto.quantidade}
                        </strong>
                      </div>
                    ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
};

const styles: Record<
  string,
  React.CSSProperties
> = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f1f5f9',
  },

  sidebar: {
    width: '246px',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#0b122b',
    color: '#ffffff',
  },

  logoArea: {
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

  logoTitle: {
    display: 'block',
    fontSize: '14px',
    letterSpacing: '-0.2px',
  },

  logoSubtitle: {
    display: 'block',
    marginTop: '3px',
    color: '#94a3b8',
    fontSize: '11px',
  },

  menu: {
    display: 'flex',
    flexDirection: 'column',
    gap: '7px',
    padding: '24px 12px',
  },

  menuButton: {
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
    fontWeight: 600,
    textAlign: 'left',
    cursor: 'pointer',
  },

  menuButtonAtivo: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    boxShadow: '0 8px 20px rgba(37,99,235,0.25)',
  },

  userArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: 'auto',
    padding: '18px',
    borderTop: '1px solid rgba(255,255,255,0.08)',
  },

  userAvatar: {
    width: '34px',
    height: '34px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: 700,
  },

  userLabel: {
    display: 'block',
    color: '#94a3b8',
    fontSize: '10px',
  },

  userId: {
    display: 'block',
    marginTop: '3px',
    color: '#e2e8f0',
    fontSize: '12px',
  },

  content: {
    flex: 1,
    minWidth: 0,
    padding: '34px 38px',
  },

  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '20px',
    marginBottom: '28px',
  },

  eyebrow: {
    color: '#2563eb',
    fontSize: '11px',
    fontWeight: 800,
    letterSpacing: '1.5px',
  },

  title: {
    margin: '7px 0 4px',
    color: '#0f172a',
    fontSize: '30px',
    fontWeight: 800,
    letterSpacing: '-1px',
  },

  subtitle: {
    margin: 0,
    color: '#64748b',
    fontSize: '14px',
  },

  refreshButton: {
    padding: '11px 17px',
    border: '1px solid #dbe3ef',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    color: '#334155',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
  },

  warning: {
    marginBottom: '20px',
    padding: '13px 16px',
    border: '1px solid #fed7aa',
    borderRadius: '9px',
    backgroundColor: '#fff7ed',
    color: '#9a3412',
    fontSize: '13px',
  },

  loadingCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '300px',
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    backgroundColor: '#ffffff',
    color: '#64748b',
  },

  spinner: {
    marginBottom: '10px',
    color: '#2563eb',
    fontSize: '28px',
  },

  cardsGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(210px, 1fr))',
    gap: '17px',
    marginBottom: '22px',
  },

  card: {
    minHeight: '144px',
    padding: '20px',
    borderRadius: '13px',
    color: '#ffffff',
    boxShadow: '0 8px 20px rgba(15,23,42,0.08)',
  },

  cardBlue: {
    background:
      'linear-gradient(135deg, #2563eb, #1d4ed8)',
  },

  cardGreen: {
    background:
      'linear-gradient(135deg, #059669, #047857)',
  },

  cardPurple: {
    background:
      'linear-gradient(135deg, #7c3aed, #6d28d9)',
  },

  cardOrange: {
    background:
      'linear-gradient(135deg, #ea580c, #c2410c)',
  },

  cardTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  cardLabel: {
    opacity: 0.82,
    fontSize: '10px',
    fontWeight: 800,
    letterSpacing: '0.8px',
  },

  cardIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '27px',
    height: '27px',
    borderRadius: '8px',
    backgroundColor: 'rgba(255,255,255,0.18)',
    fontSize: '14px',
    fontWeight: 800,
  },

  cardValue: {
    display: 'block',
    marginTop: '19px',
    fontSize: '25px',
    letterSpacing: '-0.5px',
  },

  cardDescription: {
    display: 'block',
    marginTop: '7px',
    opacity: 0.78,
    fontSize: '11px',
  },

  columns: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '22px',
    marginBottom: '22px',
  },

  panel: {
    marginBottom: '22px',
    padding: '22px',
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    backgroundColor: '#ffffff',
    boxShadow: '0 5px 18px rgba(15,23,42,0.04)',
  },

  panelHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '21px',
  },

  panelTitle: {
    margin: 0,
    color: '#172033',
    fontSize: '16px',
    fontWeight: 800,
  },

  panelSubtitle: {
    margin: '5px 0 0',
    color: '#94a3b8',
    fontSize: '12px',
  },

  panelBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '28px',
    height: '25px',
    padding: '0 8px',
    borderRadius: '20px',
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
    fontSize: '12px',
    fontWeight: 800,
  },

  badgeRed: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
  },

  badgeOrange: {
    backgroundColor: '#ffedd5',
    color: '#c2410c',
  },

  categoryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '17px',
  },

  categoryRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  rank: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '27px',
    height: '27px',
    flexShrink: 0,
    borderRadius: '8px',
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    fontSize: '12px',
    fontWeight: 800,
  },

  categoryInfo: {
    flex: 1,
    minWidth: 0,
    color: '#334155',
    fontSize: '13px',
  },

  progressBackground: {
    width: '100%',
    height: '5px',
    marginTop: '7px',
    overflow: 'hidden',
    borderRadius: '10px',
    backgroundColor: '#e2e8f0',
  },

  progress: {
    height: '100%',
    borderRadius: '10px',
    backgroundColor: '#2563eb',
  },

  categoryQuantity: {
    color: '#0f172a',
    fontSize: '13px',
  },

  productList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },

  productRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '11px',
  },

  productIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '31px',
    height: '31px',
    flexShrink: 0,
    borderRadius: '9px',
    fontWeight: 800,
  },

  productIconRed: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
  },

  productInfo: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    gap: '3px',
    minWidth: 0,
    color: '#334155',
    fontSize: '13px',
  },

  statusDanger: {
    padding: '5px 8px',
    borderRadius: '6px',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    fontSize: '10px',
    fontWeight: 800,
  },

  lowStockGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '12px',
  },

  lowStockItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    padding: '14px',
    border: '1px solid #fed7aa',
    borderRadius: '10px',
    backgroundColor: '#fffaf5',
    color: '#334155',
    fontSize: '13px',
  },

  lowStockQuantity: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '32px',
    height: '30px',
    borderRadius: '8px',
    backgroundColor: '#ffedd5',
    color: '#c2410c',
    fontSize: '13px',
  },

  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '135px',
    color: '#94a3b8',
    textAlign: 'center',
    fontSize: '13px',
  },

  emptyIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '34px',
    height: '34px',
    marginBottom: '8px',
    borderRadius: '50%',
    backgroundColor: '#f1f5f9',
    color: '#64748b',
    fontSize: '18px',
    fontWeight: 800,
  },
};

export default Dashboard;
