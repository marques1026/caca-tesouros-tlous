import { createContext, useContext, useReducer, useEffect } from 'react';

const CHAVE_STORAGE = 'caca-tesouros-tlou-v1';

const estadoInicial = {
  pistasColetadas: {},
  pontosDesbloqueados: [],
  quizzesRespondidos: {},
  ordemInventario: [],
  jogoIniciado: false,
  jogoFinalizado: false,
};

function carregarDoStorage() {
  try {
    const salvo = localStorage.getItem(CHAVE_STORAGE);
    if (!salvo) return estadoInicial;
    return { ...estadoInicial, ...JSON.parse(salvo) };
  } catch {
    return estadoInicial;
  }
}

function salvarNoStorage(estado) {
  try {
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(estado));
  } catch (e) {
    console.warn('Falha ao salvar:', e);
  }
}

function jogoReducer(estado, acao) {
  switch (acao.tipo) {
    case 'INICIAR_JOGO':
      return { ...estado, jogoIniciado: true };

    case 'DESBLOQUEAR_PONTO': {
      if (estado.pontosDesbloqueados.includes(acao.idPonto)) return estado;
      return {
        ...estado,
        pontosDesbloqueados: [...estado.pontosDesbloqueados, acao.idPonto],
      };
    }

    case 'RESPONDER_QUIZ': {
      const { idPonto, acertou, textoCompleto, textoIncompleto } = acao;

      // se já acertou antes, não regride
      if (estado.quizzesRespondidos[idPonto]?.acertou && !acertou) return estado;

      const novaOrdem = estado.ordemInventario.includes(idPonto)
        ? estado.ordemInventario
        : [...estado.ordemInventario, idPonto];

      return {
        ...estado,
        quizzesRespondidos: {
          ...estado.quizzesRespondidos,
          [idPonto]: { respondido: true, acertou },
        },
        pistasColetadas: {
          ...estado.pistasColetadas,
          [idPonto]: {
            estado: acertou ? 'completa' : 'incompleta',
            texto: acertou ? textoCompleto : textoIncompleto,
          },
        },
        ordemInventario: novaOrdem,
      };
    }

    case 'REORDENAR_INVENTARIO':
      return { ...estado, ordemInventario: acao.novaOrdem };

    case 'FINALIZAR_JOGO':
      return { ...estado, jogoFinalizado: true };

    case 'RESETAR_JOGO':
      localStorage.removeItem(CHAVE_STORAGE);
      return { ...estadoInicial };

    default:
      return estado;
  }
}

const JogoContext = createContext(null);

export function JogoProvider({ children }) {
  const [estado, despachar] = useReducer(jogoReducer, null, carregarDoStorage);

  useEffect(() => {
    salvarNoStorage(estado);
  }, [estado]);

  return (
    <JogoContext.Provider value={{ estado, despachar }}>
      {children}
    </JogoContext.Provider>
  );
}

export function useJogo() {
  const ctx = useContext(JogoContext);
  if (!ctx) throw new Error('useJogo deve ser usado dentro de JogoProvider');
  return ctx;
}
