import React, { useEffect, useState } from 'react';

import { Login } from './pages/Login';
import Dashboard from './pages/Dashboard';
import { Produtos } from './pages/Produtos';
import { Vendas } from './pages/Vendas';
import { Movimentacoes } from './pages/Movimentacoes';

export type Tela =
  | 'dashboard'
  | 'produtos'
  | 'vendas'
  | 'movimentacoes';

interface UsuarioLogado {
  id: number;
  userName?: string;
  tipoUsuario?: string;
}

function obterUsuarioLogado(): UsuarioLogado | null {
  const userIdSalvo = localStorage.getItem('userId');
  const usuarioSalvo = localStorage.getItem('usuarioLogado');

  if (!userIdSalvo || !usuarioSalvo) {
    return null;
  }

  const userId = Number(userIdSalvo);

  if (!Number.isInteger(userId) || userId <= 0) {
    localStorage.removeItem('userId');
    localStorage.removeItem('usuarioLogado');

    return null;
  }

  try {
    const usuario = JSON.parse(usuarioSalvo);

    if (!usuario || Number(usuario.id) !== userId) {
      localStorage.removeItem('userId');
      localStorage.removeItem('usuarioLogado');

      return null;
    }

    return {
      ...usuario,
      id: userId,
    };
  } catch {
    localStorage.removeItem('userId');
    localStorage.removeItem('usuarioLogado');

    return null;
  }
}

export const App: React.FC = () => {
  const [usuario, setUsuario] =
    useState<UsuarioLogado | null>(null);

  const [telaAtual, setTelaAtual] =
    useState<Tela>('dashboard');

  const [carregando, setCarregando] =
    useState<boolean>(true);

  useEffect(() => {
    const usuarioSalvo = obterUsuarioLogado();

    setUsuario(usuarioSalvo);
    setCarregando(false);
  }, []);

  if (carregando) {
    return (
      <div style={styles.loadingContainer}>
        Verificando sessão...
      </div>
    );
  }

  if (!usuario) {
    return (
      <div style={styles.appContainer}>
        <Login />
      </div>
    );
  }

  return (
    <div style={styles.appContainer}>
      {telaAtual === 'dashboard' ? (
        <Dashboard
          onNavegar={(tela: Tela) => {
            setTelaAtual(tela);
          }}
        />
      ) : telaAtual === 'produtos' ? (
        <Produtos
          onNavegar={(tela: Tela) => {
            setTelaAtual(tela);
          }}
        />
      ) : telaAtual === 'vendas' ? (
        <Vendas
          onNavegar={(tela: Tela) => {
            setTelaAtual(tela);
          }}
        />
      ) : (
        <Movimentacoes
          onNavegar={(tela: Tela) => {
            setTelaAtual(tela);
          }}
        />
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  appContainer: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
  },

  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    color: '#475569',
    backgroundColor: '#f8fafc',
    fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
  },
};

export default App;
