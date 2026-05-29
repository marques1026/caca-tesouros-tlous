import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJogo } from '../context/JogoContext.jsx';
import Icone from '../components/Icone.jsx';
import capaEllie from '../assets/img/capaEllie.svg';
import ellie from '../assets/img/ellie.svg';
import Seattle from '../assets/img/Seattle.svg';
import ellieJoel from '../assets/img/ellieJoel.svg';
import styles from '../styles/Opening.module.css';

const missoes = [
  { icone: 'mapa', titulo: 'Explore', descricao: 'Encontre os pontos.' },
  { icone: 'escudo', titulo: 'Responda', descricao: 'Vença os Guardiões.' },
  { icone: 'mochila', titulo: 'Organize', descricao: 'Monte seu dossiê.' },
  { icone: 'chave', titulo: 'Descubra', descricao: 'Resolva o nome final.' },
];

const frames = [
  { src: ellie, alt: 'Ellie em destaque', legenda: 'Personagem' },
  { src: Seattle, alt: 'Cenário de Seattle', legenda: 'Mapa' },
  { src: ellieJoel, alt: 'Ellie e Joel', legenda: 'Final' },
];

const passosTutorial = [
  {
    icone: 'mapa',
    titulo: 'O mapa',
    texto: 'Você começa vendo só o ponto mais próximo desbloqueado. Se tiver GPS, chegue perto dele pra liberar. Sem GPS, é só acertar o quiz do ponto anterior.',
  },
  {
    icone: 'escudo',
    titulo: 'Quiz dos Guardiões',
    texto: 'Cada ponto tem uma pergunta sobre The Last of Us. Acertou? Pista completa. Errou? Pista incompleta — mas dá pra tentar de novo depois.',
  },
  {
    icone: 'mochila',
    titulo: 'Inventário',
    texto: 'As pistas vão pro seu inventário. Você pode arrastar e reorganizar elas pra tentar montar o dossiê na ordem certa. No celular funciona no toque mesmo.',
  },
  {
    icone: 'chave',
    titulo: 'Enigma final',
    texto: 'Com todas as pistas completas, o enigma final libera. Leia tudo com calma e descubra o nome escondido. Boa sorte.',
  },
];

export default function Opening() {
  const navigate = useNavigate();
  const { despachar } = useJogo();
  const [visivel, setVisivel] = useState(false);
  const [tutorial, setTutorial] = useState(false);
  const [passo, setPasso] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setVisivel(true), 100);
    return () => clearTimeout(timer);
  }, []);

  function abrirTutorial() {
    setPasso(0);
    setTutorial(true);
  }

  function avancarPasso() {
    if (passo < passosTutorial.length - 1) {
      setPasso(passo + 1);
    } else {
      despachar({ tipo: 'INICIAR_JOGO' });
      navigate('/mapa');
    }
  }

  function voltarPasso() {
    if (passo > 0) setPasso(passo - 1);
  }

  function pularTutorial() {
    despachar({ tipo: 'INICIAR_JOGO' });
    navigate('/mapa');
  }

  if (tutorial) {
    const atual = passosTutorial[passo];
    const ultimo = passo === passosTutorial.length - 1;

    return (
      <main className={styles.telaTutorial} aria-label="Tutorial do jogo">
        <div className={styles.tutorialCard}>
          <header className={styles.tutorialCabecalho}>
            <div className={styles.tutorialIcone}>
              <Icone nome={atual.icone} />
            </div>
            <span className={styles.tutorialPasso}>{passo + 1} / {passosTutorial.length}</span>
          </header>

          <div className={styles.tutorialPassadores}>
            {passosTutorial.map((_, i) => (
              <span
                key={i}
                className={styles.passador}
                data-ativo={i === passo}
                aria-hidden="true"
              />
            ))}
          </div>

          <h1 className={styles.tutorialTitulo}>{atual.titulo}</h1>
          <p className={styles.tutorialTexto}>{atual.texto}</p>

          <footer className={styles.tutorialAcoes}>
            {passo > 0 && (
              <button className="botao-secundario" onClick={voltarPasso}>
                Voltar
              </button>
            )}
            <button
              className={`botao-primario ${styles.botaoAvancar}`}
              onClick={avancarPasso}
              autoFocus
            >
              <Icone nome={ultimo ? 'rota' : 'setaDireita'} className={styles.botaoIcone} />
              {ultimo ? 'Começar' : 'Próximo'}
            </button>
          </footer>

          <button className={styles.pularBtn} onClick={pularTutorial}>
            Pular tutorial
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.tela} aria-label="Tela de abertura do Caça-Tesouros The Last of Us">
      <section className={`${styles.hero} ${visivel ? styles.visivel : ''}`}>
        <div className={styles.imagemHero}>
          <img src={capaEllie} alt="Capa inspirada em The Last of Us" />
          <div className={styles.gradienteImagem} aria-hidden="true" />
        </div>

        <div className={styles.conteudoHero}>
          <p className={styles.selo}>SENAI · SeaWeb Challenge</p>
          <h1>Caça-Tesouros</h1>
          <p className={styles.tagline}>The Last of Us Experience</p>
          <p className={styles.descricao}>Explore, responda e descubra o nome escondido.</p>

          <button
            className={styles.botaoIniciar}
            onClick={abrirTutorial}
            autoFocus
            aria-label="Ver tutorial e iniciar jornada"
          >
            <Icone nome="rota" className={styles.botaoIcone} />
            Iniciar
          </button>
        </div>
      </section>

      <section className={styles.cards} aria-label="Resumo da missão">
        {missoes.map((missao) => (
          <article className={styles.cardMissao} key={missao.titulo}>
            <Icone nome={missao.icone} className={styles.iconeMissao} />
            <div>
              <h2>{missao.titulo}</h2>
              <p>{missao.descricao}</p>
            </div>
          </article>
        ))}
      </section>

      <section className={styles.galeria} aria-label="Imagens da aventura">
        {frames.map((frame) => (
          <figure className={styles.frame} key={frame.legenda}>
            <img src={frame.src} alt={frame.alt} />
            <figcaption>{frame.legenda}</figcaption>
          </figure>
        ))}
      </section>
    </main>
  );
}
