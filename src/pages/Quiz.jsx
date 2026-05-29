import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJogo } from '../context/JogoContext.jsx';
import { PONTOS } from '../data/pontos.js';
import Icone from '../components/Icone.jsx';
import ellie from '../assets/img/ellie.svg';
import styles from '../styles/Quiz.module.css';

export default function Quiz() {
  const { idPonto } = useParams();
  const navigate = useNavigate();
  const { estado, despachar } = useJogo();

  const ponto = PONTOS.find((p) => p.id === idPonto);
  const [opcaoSelecionada, setOpcaoSelecionada] = useState(null);
  const [respondeu, setRespondeu] = useState(false);
  const [acertou, setAcertou] = useState(false);

  if (!ponto) {
    return (
      <main className={styles.tela}>
        <section className={styles.bloqueado}>
          <Icone nome="aviso" className={styles.bloqueadoIcone} />
          <h2>Ponto não encontrado</h2>
          <p>Escolha outro ponto no mapa.</p>
          <button className="botao-secundario" onClick={() => navigate('/mapa')}>
            Voltar ao mapa
          </button>
        </section>
      </main>
    );
  }

  if (!estado.pontosDesbloqueados.includes(ponto.id)) {
    return (
      <main className={styles.tela} aria-label="Ponto bloqueado">
        <section className={styles.bloqueado}>
          <Icone nome="cadeado" className={styles.bloqueadoIcone} />
          <h2>Ponto bloqueado</h2>
          <p>
            Ponto bloqueado. Aproxime-se ou conclua a rota anterior.
          </p>
          <button className="botao-secundario" onClick={() => navigate('/mapa')}>
            Voltar ao mapa
          </button>
        </section>
      </main>
    );
  }

  const jaAcertou = estado.quizzesRespondidos[ponto.id]?.acertou;

  if (jaAcertou && !respondeu) {
    return (
      <main className={styles.tela} aria-label={`Quiz de ${ponto.nome} já resolvido`}>
        <QuizJaResolvido ponto={ponto} navigate={navigate} />
      </main>
    );
  }

  function aoSelecionarOpcao(idOpcao) {
    if (respondeu) return;
    setOpcaoSelecionada(idOpcao);
  }

  function aoResponder() {
    if (!opcaoSelecionada || respondeu) return;

    const correto = opcaoSelecionada === ponto.quiz.correta;
    setAcertou(correto);
    setRespondeu(true);

    despachar({
      tipo: 'RESPONDER_QUIZ',
      idPonto: ponto.id,
      acertou: correto,
      textoCompleto: ponto.pista.textoCompleto,
      textoIncompleto: ponto.pista.textoIncompleto,
    });
  }

  function aoAvancar() {
    navigate('/inventario');
  }

  return (
    <main
      className={styles.tela}
      aria-label={`Quiz - ${ponto.nome}`}
      data-respondeu={respondeu}
      data-acertou={acertou}
    >
      <div className={styles.overlay} aria-hidden="true" />

      <article className={styles.card}>
        <aside className={styles.lateral} aria-label="Dossiê visual dos Guardiões">
          <img src={ellie} alt="Sobrevivente jovem em clima pós-apocalíptico" />
          <div>
            <span>Dossiê visual</span>
            <strong>Acerte para liberar a pista.</strong>
          </div>
        </aside>

        <div className={styles.conteudoQuiz}>
          <header className={styles.cabecalho}>
            <Icone nome={ponto.icone} className={styles.icone} />
            <div>
              <p className={styles.rotulo}>Guardião</p>
              <h1 className={styles.nomeLocal}>{ponto.nome}</h1>
            </div>
            <span className={styles.numeroPonto} aria-label={`Ponto ${ponto.ordem} de ${PONTOS.length}`}>
              {ponto.ordem}/{PONTOS.length}
            </span>
          </header>

          <section className={styles.blocoPergunta} aria-label="Pergunta do quiz">
            <p className={styles.pergunta} id="pergunta-quiz">
              {ponto.quiz.pergunta}
            </p>
          </section>

          <section className={styles.opcoes} role="group" aria-labelledby="pergunta-quiz">
            {ponto.quiz.opcoes.map((opcao) => {
              const eCorreta = opcao.id === ponto.quiz.correta;
              const eSelecionada = opcaoSelecionada === opcao.id;

              let estadoOpcao = 'normal';
              if (respondeu) {
                if (eCorreta) estadoOpcao = 'correta';
                else if (eSelecionada && !eCorreta) estadoOpcao = 'errada';
                else estadoOpcao = 'inativa';
              } else if (eSelecionada) {
                estadoOpcao = 'selecionada';
              }

              return (
                <button
                  key={opcao.id}
                  className={styles.opcao}
                  data-estado={estadoOpcao}
                  onClick={() => aoSelecionarOpcao(opcao.id)}
                  disabled={respondeu}
                  aria-pressed={eSelecionada}
                  aria-disabled={respondeu}
                  aria-label={`Opção ${opcao.id.toUpperCase()}: ${opcao.texto}${
                    respondeu && eCorreta ? ' - correta' : ''
                  }${respondeu && eSelecionada && !eCorreta ? ' - errada' : ''}`}
                >
                  <span className={styles.opcaoLetra} aria-hidden="true">
                    {opcao.id.toUpperCase()}
                  </span>
                  <span className={styles.opcaoTexto}>{opcao.texto}</span>
                  {respondeu && eCorreta && <Icone nome="check" className={styles.feedback} />}
                  {respondeu && eSelecionada && !eCorreta && <Icone nome="x" className={styles.feedback} />}
                </button>
              );
            })}
          </section>

          <footer className={styles.acoes}>
            {!respondeu ? (
              <>
                <button
                  className={`botao-primario ${styles.botaoResponder}`}
                  onClick={aoResponder}
                  disabled={!opcaoSelecionada}
                  aria-disabled={!opcaoSelecionada}
                >
                  <Icone nome="escudo" className={styles.iconeBotao} />
                  Confirmar resposta
                </button>
                <button className="botao-secundario" onClick={() => navigate('/mapa')}>
                  Voltar
                </button>
              </>
            ) : (
              <div className={styles.resultado} data-tipo={acertou ? 'acerto' : 'erro'} role="status" aria-live="polite">
                <div className={styles.resultadoCabecalho}>
                  <Icone nome={acertou ? 'check' : 'x'} className={styles.resultadoIcone} />
                  <h2>{acertou ? 'Pista liberada' : 'Pista incompleta'}</h2>
                </div>
                <p>
                  {acertou
                    ? 'Pista enviada para o inventário.'
                    : 'Tente de novo para completar.'}
                </p>
                <div className={styles.pistaRevelada}>
                  <span className={styles.pistaTexto}>
                    {acertou ? ponto.pista.textoCompleto : ponto.pista.textoIncompleto}
                  </span>
                  <p className={styles.pistaDica}>{ponto.pista.dica}</p>
                </div>
                <div className={styles.resultadoAcoes}>
                  <button className="botao-primario" onClick={aoAvancar}>
                    Ver inventário
                  </button>
                  {!acertou && (
                    <button
                      className="botao-secundario"
                      onClick={() => {
                        setOpcaoSelecionada(null);
                        setRespondeu(false);
                        setAcertou(false);
                      }}
                    >
                      Tentar novamente
                    </button>
                  )}
                  <button className="botao-secundario" onClick={() => navigate('/mapa')}>
                    Voltar ao mapa
                  </button>
                </div>
              </div>
            )}
          </footer>
        </div>
      </article>
    </main>
  );
}

function QuizJaResolvido({ ponto, navigate }) {
  return (
    <article className={styles.card} aria-label="Quiz já resolvido">
      <aside className={styles.lateral} aria-label="Arquivo de pista concluída">
        <img src={ellie} alt="Sobrevivente jovem em clima pós-apocalíptico" />
        <div>
          <span>Registro salvo</span>
          <strong>Pista segura no inventário.</strong>
        </div>
      </aside>

      <div className={styles.conteudoQuiz}>
        <header className={styles.cabecalho}>
          <Icone nome={ponto.icone} className={styles.icone} />
          <div>
            <p className={styles.rotulo}>Quiz resolvido</p>
            <h1 className={styles.nomeLocal}>{ponto.nome}</h1>
          </div>
        </header>

        <section className={styles.jaResolvido}>
          <Icone nome="check" className={styles.jaResolvidoIcone} />
          <p>Quiz já concluído.</p>
          <div className={styles.pistaRevelada}>
            <span className={styles.pistaTexto}>{ponto.pista.textoCompleto}</span>
            <p className={styles.pistaDica}>{ponto.pista.dica}</p>
          </div>
        </section>

        <footer className={styles.acoes}>
          <button className="botao-primario" onClick={() => navigate('/inventario')}>
            Ver inventário
          </button>
          <button className="botao-secundario" onClick={() => navigate('/mapa')}>
            Voltar ao mapa
          </button>
        </footer>
      </div>
    </article>
  );
}
