import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJogo } from '../context/JogoContext.jsx';
import Icone from '../components/Icone.jsx';
import ellieJoel from '../assets/img/ellieJoel.svg';
import styles from '../styles/Conclusion.module.css';

export default function Conclusion() {
  const navigate = useNavigate();
  const { estado, despachar } = useJogo();
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisivel(true), 200);
    return () => clearTimeout(t);
  }, []);

  function reiniciarJogo() {
    despachar({ tipo: 'RESETAR_JOGO' });
    navigate('/');
  }

  return (
    <main className={styles.tela} aria-label="Tela de conclusão: aventura finalizada">
      <img className={styles.imagemFundo} src={ellieJoel} alt="Dois sobreviventes caminhando no fim da jornada" />
      <div className={styles.overlay} aria-hidden="true" />

      <article className={`${styles.conteudo} ${visivel ? styles.visivel : ''}`}>
        <Icone nome="trofeu" className={styles.trofeu} />

        <header className={styles.cabecalho}>
          <p className={styles.rotulo}>Missão cumprida</p>
          <h1 className={styles.titulo}>Missão concluída</h1>
          <div className={styles.linha} aria-hidden="true" />
        </header>

        <section className={styles.palavraChave} aria-label="Palavra-chave descoberta">
          <p className={styles.palavraRotulo}>Resposta descoberta</p>
          <div className={styles.palavraTexto} aria-label="ELLIE">
            {'ELLIE'.split('').map((letra, i) => (
              <span key={i} className={styles.letra} style={{ animationDelay: `${0.2 + i * 0.06}s` }}>
                {letra}
              </span>
            ))}
          </div>
        </section>

        <section className={styles.mensagem}>
          <p>
            Você reuniu pistas, venceu os Guardiões e deduziu a resposta final.
          </p>
          <p><strong>A rota foi finalizada com sucesso.</strong></p>
        </section>

        <section className={styles.estatisticas} aria-label="Resumo">
          <h2 className={styles.estatisticasTitulo}>Resumo</h2>
          <div className={styles.statsGrid}>
            <div className={styles.stat}>
              <span className={styles.statNumero}>
                {Object.values(estado.quizzesRespondidos).filter((q) => q.acertou).length}
              </span>
              <span className={styles.statRotulo}>Quizzes acertados</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumero}>{estado.pontosDesbloqueados.length}</span>
              <span className={styles.statRotulo}>Pontos visitados</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumero}>6</span>
              <span className={styles.statRotulo}>Pistas totais</span>
            </div>
          </div>
        </section>

        <footer className={styles.acoes}>
          <button className={styles.botaoReiniciar} onClick={reiniciarJogo}>
            <Icone nome="rota" className={styles.iconeBotao} />
            Jogar novamente
          </button>
        </footer>
      </article>
    </main>
  );
}
