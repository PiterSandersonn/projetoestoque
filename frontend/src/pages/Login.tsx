import React, { useState } from 'react';
import { api } from '../services/api';

interface UserResponse {
  id: number;
  userName: string;
  name?: string;
  tipoUsuario?: 'ADMIN' | 'FUNCIONARIO';
}

export const Login: React.FC = () => {
  const [isCadastro, setIsCadastro] = useState(false);
  const [nome, setNome] = useState('');
  const [userName, setUserName] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [isError, setIsError] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const limparMensagem = () => {
    setMensagem('');
    setIsError(false);
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const nomeCompletoLimpo = nome.trim();
    const userNameLimpo = userName.trim();

    if (isCadastro && nomeCompletoLimpo.length < 2) {
      setIsError(true);
      setMensagem('Informe seu nome completo.');
      return;
    }

    if (userNameLimpo.length < 8) {
      setIsError(true);
      setMensagem(
        'O nome de usuário deve ter pelo menos 8 caracteres.'
      );
      return;
    }

    if (senha.length < 8) {
      setIsError(true);
      setMensagem('A senha deve ter pelo menos 8 caracteres.');
      return;
    }

    setCarregando(true);
    limparMensagem();

    try {
      if (isCadastro) {
        await api.post('/user/create', {
          name: nomeCompletoLimpo,
          userName: userNameLimpo,
          password: senha,
        });

        setIsError(false);
        setMensagem(
          'Usuário cadastrado com sucesso! Agora faça login.'
        );
        setIsCadastro(false);
        setNome('');
        setUserName('');
        setSenha('');
      } else {
        const data = await api.post<UserResponse>('/loginUser', {
          userName: userNameLimpo,
          password: senha,
        });

        if (!data || !data.id || !Number.isInteger(Number(data.id))) {
          throw new Error(
            'O login foi realizado, mas o ID do usuário não foi recebido.'
          );
        }

        localStorage.setItem('userId', String(data.id));
        localStorage.setItem('usuarioLogado', JSON.stringify(data));

        setIsError(false);
        setMensagem('Login realizado com sucesso! Entrando...');

        // O App valida novamente o usuário no backend antes de abrir o sistema.
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    } catch (error) {
      console.error('Erro no login ou cadastro:', error);
      setIsError(true);

      if (error instanceof Error && error.message) {
        setMensagem(error.message);
      } else {
        setMensagem(
          isCadastro
            ? 'Não foi possível cadastrar o usuário.'
            : 'Usuário ou senha incorretos.'
        );
      }
    } finally {
      setCarregando(false);
    }
  };

  const alternarModo = () => {
    setIsCadastro(!isCadastro);
    setNome('');
    setUserName('');
    setSenha('');
    limparMensagem();
  };

  return (
    <div style={styles.container}>
      <section style={styles.brandPanel}>
        <div style={styles.brandContent}>
          <div style={styles.logoIcon}>📦</div>
          <span style={styles.brandEyebrow}>GESTÃO COMERCIAL</span>
          <h1 style={styles.brandTitle}>Sistema de Estoque</h1>
          <p style={styles.brandDescription}>
            Controle produtos, vendas e movimentações do seu negócio
            em um só lugar.
          </p>

          <div style={styles.featureList}>
            <div style={styles.featureItem}>
              <span style={styles.featureIcon}>✓</span>
              <span>Estoque organizado e atualizado</span>
            </div>
            <div style={styles.featureItem}>
              <span style={styles.featureIcon}>✓</span>
              <span>Vendas com controle de caixa</span>
            </div>
            <div style={styles.featureItem}>
              <span style={styles.featureIcon}>✓</span>
              <span>Relatórios para acompanhar seu negócio</span>
            </div>
          </div>
        </div>

        <span style={styles.brandFooter}>
          Gestão simples para decisões melhores.
        </span>
      </section>

      <main style={styles.formArea}>
        <div style={styles.card}>
          <div style={styles.mobileBrand}>
            <div style={styles.mobileLogoIcon}>📦</div>
            <strong>Sistema de Estoque</strong>
          </div>

          <div style={styles.heading}>
            <span style={styles.eyebrow}>
              {isCadastro ? 'NOVO ACESSO' : 'ÁREA RESTRITA'}
            </span>
            <h2 style={styles.title}>
              {isCadastro ? 'Crie sua conta' : 'Bem-vindo de volta'}
            </h2>
            <p style={styles.subtitle}>
              {isCadastro
                ? 'Preencha seus dados para começar a usar o sistema.'
                : 'Entre com suas credenciais para acessar o sistema.'}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {isCadastro && (
              <div style={styles.inputGroup}>
                <label style={styles.label} htmlFor="nome">
                  Nome completo
                </label>
                <input
                  id="nome"
                  type="text"
                  value={nome}
                  onChange={(event) => setNome(event.target.value)}
                  required
                  disabled={carregando}
                  style={styles.input}
                  placeholder="Como deseja ser chamado"
                  autoComplete="name"
                />
              </div>
            )}

            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="userName">
                Nome de usuário
              </label>
              <input
                id="userName"
                type="text"
                value={userName}
                onChange={(event) => setUserName(event.target.value)}
                required
                minLength={8}
                maxLength={60}
                disabled={carregando}
                style={styles.input}
                placeholder="Digite seu nome de usuário"
                autoComplete="username"
              />
              <small style={styles.helpText}>
                Mínimo de 8 caracteres
              </small>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="senha">
                Senha
              </label>
              <input
                id="senha"
                type="password"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                required
                minLength={8}
                maxLength={100}
                disabled={carregando}
                style={styles.input}
                placeholder="Digite sua senha"
                autoComplete={
                  isCadastro ? 'new-password' : 'current-password'
                }
              />
              <small style={styles.helpText}>
                Mínimo de 8 caracteres
              </small>
            </div>

            <button
              type="submit"
              disabled={carregando}
              style={{
                ...styles.button,
                ...(carregando ? styles.buttonDisabled : {}),
              }}
            >
              {carregando
                ? 'Aguarde...'
                : isCadastro
                  ? 'Criar minha conta'
                  : 'Entrar no sistema'}
            </button>
          </form>

          {mensagem && (
            <div
              role="alert"
              style={{
                ...styles.message,
                ...(isError
                  ? styles.errorMessage
                  : styles.successMessage),
              }}
            >
              <span style={styles.messageIcon}>
                {isError ? '!' : '✓'}
              </span>
              <span>{mensagem}</span>
            </div>
          )}

          <div style={styles.divider}>
            <span style={styles.dividerLine} />
            <span>ou</span>
            <span style={styles.dividerLine} />
          </div>

          <div style={styles.toggleContainer}>
            <span style={styles.toggleText}>
              {isCadastro
                ? 'Já possui uma conta?'
                : 'Ainda não possui uma conta?'}
            </span>
            <button
              type="button"
              onClick={alternarModo}
              disabled={carregando}
              style={styles.toggleButton}
            >
              {isCadastro ? 'Fazer login' : 'Cadastre-se agora'}
            </button>
          </div>
        </div>

        <p style={styles.securityText}>
          Seus dados são utilizados somente para autenticação e controle
          de acesso.
        </p>
      </main>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f1f5f9',
    fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
  },

  brandPanel: {
    position: 'relative',
    display: 'flex',
    flex: '0 0 38%',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '100vh',
    padding: '56px 7%',
    overflow: 'hidden',
    backgroundColor: '#0b122b',
    color: '#ffffff',
    boxSizing: 'border-box',
  },

  brandContent: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '410px',
  },

  logoIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '52px',
    height: '52px',
    marginBottom: '32px',
    borderRadius: '14px',
    backgroundColor: '#2563eb',
    boxShadow: '0 12px 28px rgba(37,99,235,0.35)',
    fontSize: '25px',
  },

  brandEyebrow: {
    color: '#60a5fa',
    fontSize: '11px',
    fontWeight: '800',
    letterSpacing: '1.8px',
  },

  brandTitle: {
    margin: '12px 0 16px',
    color: '#ffffff',
    fontSize: '34px',
    fontWeight: '800',
    letterSpacing: '-1px',
    lineHeight: 1.1,
  },

  brandDescription: {
    maxWidth: '390px',
    margin: 0,
    color: '#aab5ce',
    fontSize: '15px',
    lineHeight: 1.7,
  },

  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '17px',
    marginTop: '38px',
  },

  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#dbeafe',
    fontSize: '13px',
  },

  featureIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '23px',
    height: '23px',
    borderRadius: '50%',
    backgroundColor: 'rgba(37,99,235,0.35)',
    color: '#93c5fd',
    fontSize: '12px',
    fontWeight: '800',
  },

  brandFooter: {
    position: 'relative',
    zIndex: 1,
    color: '#64748b',
    fontSize: '12px',
  },

  formArea: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 48px',
    boxSizing: 'border-box',
  },

  card: {
    width: '100%',
    maxWidth: '460px',
    padding: '42px',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    backgroundColor: '#ffffff',
    boxShadow: '0 16px 40px rgba(15,23,42,0.08)',
    boxSizing: 'border-box',
  },

  mobileBrand: {
    display: 'none',
    alignItems: 'center',
    gap: '9px',
    marginBottom: '28px',
    color: '#172033',
    fontSize: '15px',
  },

  mobileLogoIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '9px',
    backgroundColor: '#2563eb',
    fontSize: '16px',
  },

  heading: {
    marginBottom: '28px',
  },

  eyebrow: {
    color: '#2563eb',
    fontSize: '10px',
    fontWeight: '800',
    letterSpacing: '1.5px',
  },

  title: {
    margin: '9px 0 6px',
    color: '#0f172a',
    fontSize: '28px',
    fontWeight: '800',
    letterSpacing: '-0.7px',
  },

  subtitle: {
    margin: 0,
    color: '#64748b',
    fontSize: '13px',
    lineHeight: 1.5,
  },

  inputGroup: {
    marginBottom: '19px',
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
    padding: '12px 13px',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    outline: 'none',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    fontSize: '13px',
    boxSizing: 'border-box',
  },

  helpText: {
    display: 'block',
    marginTop: '6px',
    color: '#94a3b8',
    fontSize: '10px',
  },

  button: {
    width: '100%',
    padding: '13px',
    marginTop: '3px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: '800',
    cursor: 'pointer',
    boxShadow: '0 8px 16px rgba(37,99,235,0.18)',
  },

  buttonDisabled: {
    backgroundColor: '#93c5fd',
    cursor: 'not-allowed',
    boxShadow: 'none',
  },

  message: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '9px',
    padding: '11px 13px',
    marginTop: '18px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '600',
    lineHeight: 1.4,
  },

  messageIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '18px',
    height: '18px',
    flexShrink: 0,
    borderRadius: '50%',
    backgroundColor: 'currentColor',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: '800',
  },

  successMessage: {
    border: '1px solid #bbf7d0',
    color: '#166534',
    backgroundColor: '#f0fdf4',
  },

  errorMessage: {
    border: '1px solid #fecaca',
    color: '#991b1b',
    backgroundColor: '#fef2f2',
  },

  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    margin: '26px 0 20px',
    color: '#94a3b8',
    fontSize: '11px',
  },

  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: '#e2e8f0',
  },

  toggleContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '7px',
  },

  toggleText: {
    color: '#64748b',
    fontSize: '12px',
  },

  toggleButton: {
    padding: 0,
    border: 'none',
    backgroundColor: 'transparent',
    color: '#2563eb',
    fontSize: '13px',
    fontWeight: '800',
    cursor: 'pointer',
  },

  securityText: {
    maxWidth: '440px',
    margin: '18px 0 0',
    color: '#94a3b8',
    textAlign: 'center',
    fontSize: '10px',
    lineHeight: 1.5,
  },
};

export default Login;
