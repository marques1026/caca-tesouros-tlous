import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJogo } from '../context/JogoContext.jsx';
import { PONTOS } from '../data/pontos.js';
import Icone from '../components/Icone.jsx';
import ellieJoel from '../assets/img/ellieJoel.svg';
import styles from '../styles/Inventory.module.css';

export default function Inventory() {
  const navigate = useNavigate();
  const { estado, despachar } = useJogo();

  const [arrastando, setArrastando] = useState(null);
  const [sobreIndice, setSobreIndice] = useState(null);
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [anuncio, setAnuncio] = useState('');

  const listaRef = useRef(null);

  const pistasOrdenadas = estado.ordemInventario
    .map((id) => {
      const ponto = PONTOS.find((p) => p.id === id);
      const pista = estado.pistasColetadas[id];
      return ponto && pista ? { ...ponto, ...pista, id } : null;
    })
    .filter(Boolean);

  const totalCompletas = pistasOrdenadas.filter((p) => p.estado === 'completa').length;
  const totalPontos = PONTOS.length;

  function reordenar(indiceOrigem, indiceDestino) {
    if (indiceOrigem === indiceDestino) return;
    const novaOrdem = [...estado.ordemInventario];
    const [movido] = novaOrdem.splice(indiceOrigem, 1);
    novaOrdem.splice(indiceDestino, 0, movido);
    despachar({ tipo: 'REORDENAR_INVENTARIO', novaOrdem });
  }

  function aoIniciarArrasto(e, indice) {
    setArrastando(indice);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(indice));
    requestAnimationFrame(() => {
      if (e.target) e.target.style.opacity = '0.45';
    });
  }

  function aoEncerrarArrasto(e) {
    setArrastando(null);
    setSobreIndice(null);
    e.target.style.opacity = '';
  }

  function aoPassarSobre(e, indice) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setSobreIndice(indice);
  }

  function aoSoltar(e, indiceDestino) {
    e.preventDefault();
    const indiceOrigem = Number(e.dataTransfer.getData('text/plain'));
    reordenar(indiceOrigem, indiceDestino);
    setArrastando(null);
    setSobreIndice(null);
  }

  function aoTeclar(e, indice) {
    switch (e.key) {
      case ' ':
      case 'Enter': {
        e.preventDefault();
        if (itemSelecionado === null) {
          setItemSelecionado(indice);
          const nome = pistasOrdenadas[indice]?.nome ?? 'pista';
          setAnuncio(`Pista ${nome} selecionada. Use as setas para mover e depois Espaço ou Enter para soltar.`);
        } else if (itemSelecionado === indice) {
          setAnuncio('Movimento cancelado.');
          setItemSelecionado(null);
        } else {
          reordenar(itemSelecionado, indice);
          const nomeOrigem = pistasOrdenadas[itemSelecionado]?.nome ?? 'pista';
          setAnuncio(`Pista ${nomeOrigem} movida para a posição ${indice + 1}.`);
          setItemSelecionado(null);
        }
        break;
      }

      case 'ArrowUp':
      case 'k': {
        e.preventDefault();
        if (itemSelecionado !== null && itemSelecionado > 0) {
          const novoIndice = itemSelecionado - 1;
          reordenar(itemSelecionado, novoIndice);
          setItemSelecionado(novoIndice);
          const nome = pistasOrdenadas[itemSelecionado]?.nome ?? 'pista';
          setAnuncio(`Pista ${nome} movida para a posição ${novoIndice + 1}.`);
          requestAnimationFrame(() => {
            listaRef.current?.querySelectorAll('[role="listitem"]')[novoIndice]?.focus();
          });
        }
        break;
      }

      case 'ArrowDown':
      case 'j': {
        e.preventDefault();
        if (itemSelecionado !== null && itemSelecionado < pistasOrdenadas.length - 1) {
          const novoIndice = itemSelecionado + 1;
          reordenar(itemSelecionado, novoIndice);
          setItemSelecionado(novoIndice);
          const nome = pistasOrdenadas[itemSelecionado]?.nome ?? 'pista';
          setAnuncio(`Pista ${nome} movida para a posição ${novoIndice + 1}.`);
          requestAnimationFrame(() => {
            listaRef.current?.querySelectorAll('[role="listitem"]')[novoIndice]?.focus();
          });
        }
        break;
      }

      case 'Escape': {
        setItemSelecionado(null);
        setAnuncio('Movimento cancelado.');
        break;
      }

      default:
        break;
    }
  }

  const podeFinalizar = totalCompletas === totalPontos;
  const temAlgumaIncompleta = pistasOrdenadas.some((p) => p.estado === 'incompleta');

  return (
    <main className={styles.tela} aria-label="Inventário de pistas coletadas">
      <div aria-live="assertive" aria-atomic="true" className="sr-only">
        {anuncio}
      </div>

      <div className={styles.overlay} aria-hidden="true" />

      <div className={styles.conteudo}>
        <header className={styles.cabecalho}>
          <div>
            <p className={styles.subtitulo}>Mochila digital</p>
            <h1 className={styles.titulo}>Inventário</h1>
          </div>
          <img className={styles.imagemCabecalho} src={ellieJoel} alt="Ellie e Joel" />
          <span className={styles.contador} aria-label={`${totalCompletas} pistas completas de ${totalPontos}`}>
            {totalCompletas}/{totalPontos}
          </span>
        </header>

        <section className={styles.instrucoes} aria-label="Como usar o inventário">
          <Icone nome="mouse" className={styles.instrucoesIcone} />
          <p>
            Arraste para ordenar. No teclado: <kbd>Tab</kbd>, <kbd>Enter</kbd> e setas.
          </p>
        </section>

        {pistasOrdenadas.length === 0 ? (
          <section className={styles.vazio} aria-label="Inventário vazio">
            <Icone nome="mochila" className={styles.vazioIcone} />
            <p>Mochila vazia.</p>
            <p>Explore o mapa para coletar pistas.</p>
            <button className="botao-secundario" onClick={() => navigate('/mapa')}>
              Ir ao mapa
            </button>
          </section>
        ) : (
          <section aria-label="Lista de pistas para reorganizar">
            <ul
              ref={listaRef}
              className={styles.listaPistas}
              role="list"
              aria-label="Pistas coletadas: reorganize arrastando ou com o teclado"
              aria-dropeffect={arrastando !== null ? 'move' : 'none'}
            >
              {pistasOrdenadas.map((pista, indice) => {
                const eArrastado = arrastando === indice;
                const eAlvo = sobreIndice === indice && arrastando !== null;
                const eSelecionado = itemSelecionado === indice;
                const eCompleta = pista.estado === 'completa';

                return (
                  <li
                    key={pista.id}
                    role="listitem"
                    className={styles.pista}
                    data-estado={pista.estado}
                    data-arrastado={eArrastado}
                    data-alvo={eAlvo}
                    data-selecionado={eSelecionado}
                    tabIndex={0}
                    draggable
                    aria-grabbed={eArrastado || eSelecionado}
                    aria-label={`Posição ${indice + 1}: ${pista.nome}; pista ${pista.estado}; fragmento ${pista.texto}${
                      eSelecionado ? '; selecionada para mover' : ''
                    }`}
                    onDragStart={(e) => aoIniciarArrasto(e, indice)}
                    onDragEnd={aoEncerrarArrasto}
                    onDragOver={(e) => aoPassarSobre(e, indice)}
                    onDrop={(e) => aoSoltar(e, indice)}
                    onKeyDown={(e) => aoTeclar(e, indice)}
                  >
                    <span className={styles.alca} aria-hidden="true">::</span>
                    <span className={styles.posicao} aria-hidden="true">{indice + 1}</span>
                    <Icone nome={pista.icone} className={styles.pistaIcone} />

                    <div className={styles.pistaInfo}>
                      <p className={styles.pistaNome}>{pista.nome}</p>
                      <p className={styles.pistaTexto} aria-label={`Fragmento: ${pista.texto}`}>
                        {pista.texto}
                      </p>
                    </div>

                    <span className={styles.badge} data-estado={pista.estado} aria-label={`Estado: ${pista.estado}`}>
                      <Icone nome={eCompleta ? 'check' : 'aviso'} className={styles.badgeIcone} />
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {pistasOrdenadas.length > 0 && (
          <section className={styles.previa} aria-label="Dossiê de pistas coletadas">
            <p className={styles.previaRotulo}>Dossiê coletado</p>
            <div className={styles.previaFragmentos} aria-live="polite">
              {pistasOrdenadas.map((pista, i) => (
                <span
                  key={pista.id}
                  className={styles.previaFragmento}
                  data-estado={pista.estado}
                  aria-label={`Pista ${i + 1}: ${pista.texto}`}
                >
                  {pista.texto}
                </span>
              ))}
            </div>
          </section>
        )}

        {temAlgumaIncompleta && (
          <p className={styles.avisoIncompleto} role="note">
            <Icone nome="aviso" className={styles.avisoIcone} />
            Complete os quizzes para liberar o enigma final.
          </p>
        )}

        <footer className={styles.acoes}>
          <button
            className={`botao-primario ${styles.botaoEnigma}`}
            onClick={() => navigate('/enigma-final')}
            disabled={!podeFinalizar}
            aria-disabled={!podeFinalizar}
          >
            <Icone nome={podeFinalizar ? 'cadeado' : 'lupa'} className={styles.iconeBotao} />
            {podeFinalizar ? 'Resolver enigma' : 'Complete as pistas'}
          </button>
          <button className="botao-secundario" onClick={() => navigate('/mapa')}>
            Voltar ao mapa
          </button>
        </footer>
      </div>
    </main>
  );
}
