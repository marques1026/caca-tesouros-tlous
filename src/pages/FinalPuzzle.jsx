import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJogo } from '../context/JogoContext.jsx';
import { PONTOS, PALAVRA_CHAVE_FINAL } from '../data/pontos.js';
import Icone from '../components/Icone.jsx';
import ellie from '../assets/img/ellie.svg';
import styles from '../styles/FinalPuzzle.module.css';

export default function FinalPuzzle() {
  const navigate = useNavigate();
  const { estado, despachar } = useJogo();

  const [entrada, setEntrada] = useState('');
  const [tentativas, setTentativas] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [animarErro, setAnimarErro] = useState(false);

  const pistasCompletas = estado.ordemInventario
    .map((id) => {
      const ponto = PONTOS.find((p) => p.id === id);
      const pista = estado.pistasColetadas[id];
      return ponto && pista?.estado === 'completa' ? { id, nome: ponto.nome, texto: pista.texto } : null;
    })
    .filter(Boolean);

  const todasCompletas = PONTOS.every((ponto) => estado.quizzesRespondidos[ponto.id]?.acertou);

  function aoSubmeter(e) {
    e.preventDefault();
    if (!todasCompletas) return;

    const resposta = entrada.trim().toUpperCase();

    if (resposta === PALAVRA_CHAVE_FINAL) {
      setFeedback('correto');
      despachar({ tipo: 'FINALIZAR_JOGO' });
      setTimeout(() => navigate('/conclusao'), 1200);
    } else {
      setFeedback('errado');
      setAnimarErro(true);
      setTentativas((t) => t + 1);
      setTimeout(() => {
        setAnimarErro(false);
        setFeedback(null);
      }, 1200);
    }
  }

  return (
    <main className={styles.tela} aria-label="Enigma final">
      <article className={`${styles.card} ${animarErro ? styles.tremer : ''}`}>
        <aside className={styles.imagemLateral}>
          <img src={ellie} alt="Ellie em destaque" />
        </aside>

        <section className={styles.conteudo}>
          <header className={styles.cabecalho}>
            <Icone nome="chave" className={styles.simbolo} />
            <div>
              <p className={styles.rotulo}>Enigma final</p>
              <h1 className={styles.titulo}>Quem sou eu?</h1>
            </div>
          </header>

          <p className={styles.fraseCurta}>
            Use as pistas do dossiê. A resposta é o nome de uma personagem.
          </p>

          <section className={styles.secaoPistas} aria-label="Pistas completas coletadas">
            <div className={styles.linhaSecao}>
              <p className={styles.secaoRotulo}>Pistas</p>
              <span>{pistasCompletas.length}/{PONTOS.length}</span>
            </div>

            <div className={styles.pistas} aria-live="polite">
              {pistasCompletas.map((pista) => (
                <span key={pista.id} className={styles.pista} title={pista.nome}>
                  {pista.texto}
                </span>
              ))}

              {pistasCompletas.length === 0 && (
                <span className={styles.pistaVazia}>Nenhuma pista completa.</span>
              )}
            </div>
          </section>

          {!todasCompletas && (
            <div className={styles.bloqueio} role="status">
              <Icone nome="cadeado" className={styles.bloqueioIcone} />
              Complete todos os quizzes para responder.
            </div>
          )}

          <form className={styles.formulario} onSubmit={aoSubmeter} noValidate>
            <label htmlFor="resposta-final" className={styles.labelResposta}>
              Nome da personagem
            </label>
            <div className={styles.campoWrapper}>
              <input
                id="resposta-final"
                type="text"
                className={styles.campoResposta}
                value={entrada}
                onChange={(e) => setEntrada(e.target.value)}
                placeholder="Digite o nome"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                aria-describedby="dica-enigma"
                aria-invalid={feedback === 'errado'}
                maxLength={20}
                disabled={feedback === 'correto' || !todasCompletas}
              />
              {feedback === 'correto' && <Icone nome="check" className={styles.inputIcone} />}
              {feedback === 'errado' && <Icone nome="x" className={styles.inputIcone} />}
            </div>

            <p id="dica-enigma" className={styles.dicaEnigma}>
              {tentativas > 0 && feedback !== 'correto'
                ? 'Dica: ela é imune e viajou com Joel.'
                : 'Não é uma palavra montada; é uma dedução.'}
            </p>

            <button
              type="submit"
              className={`botao-primario ${styles.botaoConfirmar}`}
              disabled={!entrada.trim() || feedback === 'correto' || !todasCompletas}
              aria-disabled={!entrada.trim() || feedback === 'correto' || !todasCompletas}
            >
              <Icone nome={feedback === 'correto' ? 'check' : 'cadeado'} className={styles.iconeBotao} />
              {feedback === 'correto' ? 'Correto' : 'Responder'}
            </button>
          </form>

          {feedback === 'errado' && (
            <div className={styles.feedbackErro} role="alert" aria-live="assertive">
              <Icone nome="aviso" className={styles.feedbackIcone} />
              Ainda não. Leia as pistas como um perfil.
            </div>
          )}

          <button className="botao-secundario" onClick={() => navigate('/inventario')}>
            Voltar ao inventário
          </button>
        </section>
      </article>
    </main>
  );
}
