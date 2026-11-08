import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

interface Movimentacao {
  id?: number;
  produto?: {
    id?: number;
    nome?: string;
    name_produtos?: string;
  };
  produtoNome?: string;
  nomeProduto?: string;
  usuario?: string | { name?: string; nome?: string; userName?: string };
  tipo?: string;
  movimentacao?: string;
  quantidade?: number;
  estoqueAnterior?: number;
  estoquePosterior?: number;
  dataHora?: string;
}

interface MovimentacoesProps {
  onNavegar?: (
    tela: 'dashboard' | 'produtos' | 'vendas' | 'movimentacoes'
  ) => void;
}

const tipoLabel: Record<string, string> = {
  CADASTRO: 'Cadastro',
  ENTRADA: 'Entrada',
  SAIDA_VENDA: 'Saída por venda',
  CANCELAMENTO: 'Cancelamento',
  PERDA: 'Perda',
  DEVOLUCAO: 'Devolução',
};

const tipoCor: Record<
  string,
  { background: string; color: string }
> = {
  CADASTRO: { background: '#eff6ff', color: '#1d4ed8' },
  ENTRADA: { background: '#ecfdf5', color: '#047857' },
  SAIDA_VENDA: { background: '#fff7ed', color: '#c2410c' },
  CANCELAMENTO: { background: '#fefce8', color: '#a16207' },
  PERDA: { background: '#fef2f2', color: '#b91c1c' },
  DEVOLUCAO: { background: '#f5f3ff', color: '#6d28d9' },
};

function obterLista(resposta: any): Movimentacao[] {
  if (Array.isArray(resposta)) return resposta;
  if (Array.isArray(resposta?.content)) return resposta.content;
  if (Array.isArray(resposta?.data)) return resposta.data;
  return [];
}

function obterNomeProduto(item: Movimentacao): string {
  return (
    item.produto?.nome ||
    item.produto?.name_produtos ||
    item.produtoNome ||
    item.nomeProduto ||
    'Produto não informado'
  );
}

function obterNomeUsuario(usuario: Movimentacao['usuario']): string {
  if (typeof usuario === 'string') return usuario;

  if (usuario) {
    return (
      usuario.name ||
      usuario.nome ||
      usuario.userName ||
      'Usuário'
    );
  }

  return 'Usuário não informado';
}

function formatarData(data?: string): string {
  if (!data) return '—';

  const valor = new Date(data);
  if (Number.isNaN(valor.getTime())) return data;

  return valor.toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export function Movimentacoes({
  onNavegar,
}: MovimentacoesProps) {
  const userId = localStorage.getItem('userId');

  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('TODOS');
  const [carregando, setCarregando] = useState(true);
  const [mensagem, setMensagem] = useState<{
    texto: string;
    erro: boolean;
  } | null>(null);

  const exibirMensagem = (texto: string, erro = false) => {
    setMensagem({ texto, erro });
    window.setTimeout(() => setMensagem(null), 4500);
  };

  const carregarMovimentacoes = async () => {
    if (!userId) return;

    setCarregando(true);

    try {
      const resposta = await api.get<Movimentacao[]>(
        `/movimentacoes?userId=${encodeURIComponent(userId)}`
      );

      setMovimentacoes(obterLista(resposta));
    } catch (error) {
      console.error('Erro ao carregar movimentações:', error);
      setMovimentacoes([]);
      exibirMensagem(
        'Não foi possível carregar o histórico. Confirme se o endpoint GET /movimentacoes está disponível.',
        true
      );
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      localStorage.clear();
      window.location.reload();
      return;
    }

    carregarMovimentacoes();
  }, [userId]);

  const movimentacoesFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return movimentacoes.filter((item) => {
      const tipo = item.tipo || item.movimentacao || '';
      const correspondeTipo =
        filtroTipo === 'TODOS' || tipo === filtroTipo;

      const texto = `${obterNomeProduto(item)} ${obterNomeUsuario(
        item.usuario
      )} ${tipo}`.toLowerCase();

      return correspondeTipo && (!termo || texto.includes(termo));
    });
  }, [busca, filtroTipo, movimentacoes]);

  const totais = useMemo(
    () => ({
      entradas: movimentacoes.filter((item) =>
        ['CADASTRO', 'ENTRADA', 'DEVOLUCAO'].includes(
          item.tipo || item.movimentacao || ''
        )
      ).length,
      saidas: movimentacoes.filter((item) =>
        ['SAIDA_VENDA', 'PERDA'].includes(
          item.tipo || item.movimentacao || ''
        )
      ).length,
      ajustes: movimentacoes.filter((item) =>
        ['CANCELAMENTO'].includes(
          item.tipo || item.movimentacao || ''
        )
      ).length,
    }),
    [movimentacoes]
  );

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

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
              onClick={() => onNavegar?.('dashboard')}
              style={styles.navButton}
            >
              <span>▦</span> Dashboard
            </button>

            <button
              type="button"
              onClick={() => onNavegar?.('produtos')}
              style={styles.navButton}
            >
              <span>📦</span> Produtos
            </button>

            <button
              type="button"
              onClick={() => onNavegar?.('vendas')}
              style={styles.navButton}
            >
              <span>🛒</span> Caixa / Vendas
            </button>

            <button
              type="button"
              onClick={() => onNavegar?.('movimentacoes')}
              style={{
                ...styles.navButton,
                ...styles.navButtonActive,
              }}
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
              Controle de estoque · ID {userId}
            </span>
          </div>
        </div>
      </aside>

      <div style={styles.mainArea}>
        <header style={styles.header}>
          <div>
            <span style={styles.headerEyebrow}>AUDITORIA</span>
            <strong style={styles.headerTitle}>
              Histórico de estoque
            </strong>
          </div>

          <div style={styles.headerActions}>
            <button
              type="button"
              onClick={carregarMovimentacoes}
              disabled={carregando}
              style={styles.refreshButton}
            >
              {carregando ? 'Atualizando...' : 'Atualizar'}
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
              <span style={styles.eyebrow}>CONTROLE OPERACIONAL</span>
              <h1 style={styles.title}>Movimentações</h1>
              <p style={styles.subtitle}>
                Acompanhe todas as alterações realizadas no estoque.
              </p>
            </div>

            <div style={styles.statusBadge}>
              <span style={styles.statusDot} />
              Histórico atualizado
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

          <section style={styles.summaryGrid}>
            <ResumoCard
              titulo="MOVIMENTAÇÕES DE ENTRADA"
              valor={totais.entradas}
              cor="#047857"
              icone="↗"
              legenda="Cadastro, entrada e devolução"
            />
            <ResumoCard
              titulo="MOVIMENTAÇÕES DE SAÍDA"
              valor={totais.saidas}
              cor="#c2410c"
              icone="↘"
              legenda="Vendas e perdas registradas"
            />
            <ResumoCard
              titulo="AJUSTES E CANCELAMENTOS"
              valor={totais.ajustes}
              cor="#a16207"
              icone="↔"
              legenda="Ajustes no histórico"
            />
          </section>

          <section style={styles.tableCard}>
            <div style={styles.tableHeader}>
              <div>
                <h2 style={styles.cardTitle}>
                  Registros de movimentação
                </h2>
                <p style={styles.cardSubtitle}>
                  {movimentacoesFiltradas.length} registro(s) encontrado(s)
                </p>
              </div>

              <div style={styles.filters}>
                <div style={styles.filterInputWrapper}>
                  <span style={styles.searchIcon}>⌕</span>
                  <input
                    value={busca}
                    onChange={(event) => setBusca(event.target.value)}
                    placeholder="Buscar produto ou usuário..."
                    style={styles.filterInput}
                  />
                </div>

                <select
                  value={filtroTipo}
                  onChange={(event) => setFiltroTipo(event.target.value)}
                  style={styles.filterSelect}
                >
                  <option value="TODOS">Todos os tipos</option>
                  {Object.entries(tipoLabel).map(([valor, label]) => (
                    <option key={valor} value={valor}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {carregando ? (
              <div style={styles.emptyState}>
                Carregando histórico...
              </div>
            ) : movimentacoesFiltradas.length === 0 ? (
              <div style={styles.emptyState}>
                <span style={styles.emptyIcon}>◌</span>
                <strong style={styles.emptyTitle}>
                  Nenhuma movimentação encontrada
                </strong>
                <span>
                  Tente ajustar os filtros ou aguarde novos registros.
                </span>
              </div>
            ) : (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeading}>
                      <th style={styles.tableCell}>DATA / HORA</th>
                      <th style={styles.tableCell}>PRODUTO</th>
                      <th style={styles.tableCell}>TIPO</th>
                      <th style={styles.tableCell}>QUANTIDADE</th>
                      <th style={styles.tableCell}>ESTOQUE</th>
                      <th style={styles.tableCell}>RESPONSÁVEL</th>
                    </tr>
                  </thead>

                  <tbody>
                    {movimentacoesFiltradas.map((item, index) => {
                      const tipo =
                        item.tipo || item.movimentacao || 'OUTRO';
                      const cores = tipoCor[tipo] || {
                        background: '#f1f5f9',
                        color: '#475569',
                      };

                      return (
                        <tr
                          key={item.id ?? `${tipo}-${index}`}
                          style={styles.tableRow}
                        >
                          <td style={styles.tableCell}>
                            <span style={styles.dateText}>
                              {formatarData(item.dataHora)}
                            </span>
                          </td>

                          <td style={styles.tableCell}>
                            <strong style={styles.productName}>
                              {obterNomeProduto(item)}
                            </strong>
                          </td>

                          <td style={styles.tableCell}>
                            <span
                              style={{
                                ...styles.typeBadge,
                                backgroundColor: cores.background,
                                color: cores.color,
                              }}
                            >
                              {tipoLabel[tipo] || tipo}
                            </span>
                          </td>

                          <td
                            style={{
                              ...styles.tableCell,
                              fontWeight: '700',
                              color: '#334155',
                            }}
                          >
                            {item.quantidade ?? '—'} un
                          </td>

                          <td style={styles.tableCell}>
                            <span style={styles.stockChange}>
                              {item.estoqueAnterior ?? '—'}
                              <span style={styles.arrow}>→</span>
                              <strong>
                                {item.estoquePosterior ?? '—'}
                              </strong>
                            </span>
                          </td>

                          <td style={styles.tableCell}>
                            {obterNomeUsuario(item.usuario)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

function ResumoCard({
  titulo,
  valor,
  cor,
  icone,
  legenda,
}: {
  titulo: string;
  valor: number;
  cor: string;
  icone: string;
  legenda: string;
}) {
  return (
    <div style={styles.summaryCard}>
      <div style={styles.summaryTop}>
        <span style={styles.summaryLabel}>{titulo}</span>
        <span
          style={{
            ...styles.summaryIcon,
            backgroundColor: `${cor}18`,
            color: cor,
          }}
        >
          {icone}
        </span>
      </div>
      <strong style={styles.summaryValue}>{valor}</strong>
      <span style={styles.summaryCaption}>{legenda}</span>
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

  headerActions: {
    display: 'flex',
    gap: '10px',
  },

  refreshButton: {
    padding: '10px 15px',
    border: '1px solid #dbe3ef',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    color: '#334155',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
  },

  logoutButton: {
    padding: '10px 15px',
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
    minHeight: '126px',
    padding: '18px 20px',
    border: '1px solid #e2e8f0',
    borderRadius: '13px',
    backgroundColor: '#ffffff',
    boxShadow: '0 5px 18px rgba(15,23,42,0.04)',
    boxSizing: 'border-box',
  },

  summaryTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
  },

  summaryLabel: {
    color: '#64748b',
    fontSize: '10px',
    fontWeight: '800',
    letterSpacing: '0.7px',
  },

  summaryIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '29px',
    height: '29px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '800',
  },

  summaryValue: {
    display: 'block',
    marginTop: '14px',
    color: '#0f172a',
    fontSize: '25px',
  },

  summaryCaption: {
    display: 'block',
    marginTop: '5px',
    color: '#94a3b8',
    fontSize: '11px',
  },

  tableCard: {
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    backgroundColor: '#ffffff',
    boxShadow: '0 5px 18px rgba(15,23,42,0.04)',
  },

  tableHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '18px',
    padding: '22px',
    borderBottom: '1px solid #f1f5f9',
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
  },

  filters: {
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
  },

  filterInputWrapper: {
    position: 'relative',
    width: '245px',
  },

  searchIcon: {
    position: 'absolute',
    top: '7px',
    left: '10px',
    color: '#64748b',
    fontSize: '19px',
    lineHeight: 1,
  },

  filterInput: {
    width: '100%',
    padding: '10px 10px 10px 31px',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    outline: 'none',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    fontSize: '12px',
    boxSizing: 'border-box',
  },

  filterSelect: {
    padding: '10px',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    outline: 'none',
    backgroundColor: '#ffffff',
    color: '#334155',
    fontSize: '12px',
  },

  tableWrapper: {
    overflowX: 'auto',
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
  },

  tableHeading: {
    backgroundColor: '#f8fafc',
    color: '#64748b',
    borderBottom: '1px solid #e2e8f0',
    textAlign: 'left',
    fontSize: '10px',
    letterSpacing: '0.4px',
  },

  tableRow: {
    borderBottom: '1px solid #f1f5f9',
  },

  tableCell: {
    padding: '14px 16px',
    color: '#475569',
    whiteSpace: 'nowrap',
  },

  dateText: {
    color: '#64748b',
    fontSize: '12px',
  },

  productName: {
    color: '#0f172a',
    fontSize: '13px',
  },

  typeBadge: {
    display: 'inline-block',
    padding: '5px 9px',
    borderRadius: '20px',
    fontSize: '10px',
    fontWeight: '800',
  },

  stockChange: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    color: '#64748b',
  },

  arrow: {
    color: '#94a3b8',
  },

  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '260px',
    padding: '50px 20px',
    color: '#94a3b8',
    textAlign: 'center',
    fontSize: '13px',
    gap: '6px',
  },

  emptyIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '42px',
    height: '42px',
    marginBottom: '4px',
    borderRadius: '50%',
    backgroundColor: '#f1f5f9',
    color: '#64748b',
    fontSize: '22px',
  },

  emptyTitle: {
    color: '#475569',
    fontSize: '14px',
  },
};

export default Movimentacoes;
