import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useJogo } from '../context/JogoContext.jsx';
import { PONTOS, RAIO_DESBLOQUEIO_METROS } from '../data/pontos.js';
import { renderToStaticMarkup } from 'react-dom/server';
import Icone from '../components/Icone.jsx';
import { Lock, BookOpen, Building2, Dumbbell, Hospital, Theater, Clapperboard, LockOpen } from 'lucide-react';
import Seattle from '../assets/img/Seattle.svg';
import styles from '../styles/Map.module.css';

function calcularDistancia(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function criarIcone(ponto, statusVisual) {
  const cores = {
    bloqueado: { fundo: '#eef1ea', borda: '#b8c3b9', texto: '#6c786d' },
    liberado: { fundo: '#fff5e6', borda: '#d68145', texto: '#85512f' },
    atual: { fundo: '#dcfae8', borda: '#35b876', texto: '#225d3f' },
    concluido: { fundo: '#e3f7eb', borda: '#2f8f5c', texto: '#226445' },
    incompleto: { fundo: '#fff0df', borda: '#d68145', texto: '#865431' },
  };

  const cor = cores[statusVisual] || cores.bloqueado;
  const mapaIcones = { livro: BookOpen, predio: Building2, halter: Dumbbell, hospital: Hospital, teatro: Theater, filme: Clapperboard };
  const Comp = statusVisual === 'bloqueado' ? Lock : (mapaIcones[ponto.icone] ?? LockOpen);
  const icone = renderToStaticMarkup(<Comp size={18} aria-hidden="true" />);

  return L.divIcon({
    className: '',
    html: `
      <div class="marcador-tlou marcador-${statusVisual}">
        <div class="marcador-tlou__pino" style="background:${cor.fundo};border-color:${cor.borda};color:${cor.texto};">
          ${icone}
        </div>
        <span class="marcador-tlou__rotulo" style="color:${cor.texto};">
          ${statusVisual === 'bloqueado' ? 'bloqueado' : ponto.nome}
        </span>
      </div>
    `,
    iconSize: [72, 70],
    iconAnchor: [36, 62],
    popupAnchor: [0, -62],
  });
}

function CentralizarNaPos({ posicao, primeiraVez, setPrimeiraVez }) {
  const mapa = useMap();

  useEffect(() => {
    if (posicao && primeiraVez) {
      mapa.setView([posicao.lat, posicao.lng], 18, { animate: true });
      setPrimeiraVez(false);
    }
  }, [posicao, primeiraVez, mapa, setPrimeiraVez]);

  return null;
}

const iconeJogador = L.divIcon({
  className: '',
  html: '<div class="marcador-jogador" aria-hidden="true"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

export default function Map({ gpsAtivo, posicaoJogador }) {
  const navigate = useNavigate();
  const { estado, despachar } = useJogo();
  const [primeiraVez, setPrimeiraVez] = useState(true);
  const [pontoAnimado, setPontoAnimado] = useState(null);
  const pontosPrevios = useRef(new Set(estado.pontosDesbloqueados));

  const centroPadrao = [-22.905600, -47.060800];

  function obterEstadoPonto(ponto) {
    const desbloqueado = estado.pontosDesbloqueados.includes(ponto.id);
    const quiz = estado.quizzesRespondidos[ponto.id];

    if (!desbloqueado) return 'bloqueado';
    if (!quiz?.respondido) return 'liberado';
    if (quiz.acertou) return 'concluido';
    return 'incompleto';
  }

  const primeiroLiberado = PONTOS.find((ponto) => obterEstadoPonto(ponto) === 'liberado')?.id;

  function obterStatusVisual(ponto) {
    const estadoPonto = obterEstadoPonto(ponto);
    if (estadoPonto === 'liberado' && ponto.id === primeiroLiberado) return 'atual';
    return estadoPonto;
  }

  useEffect(() => {
    if (!gpsAtivo || !posicaoJogador) return;

    PONTOS.forEach((ponto) => {
      if (estado.pontosDesbloqueados.includes(ponto.id)) return;

      const distancia = calcularDistancia(
        posicaoJogador.lat,
        posicaoJogador.lng,
        ponto.lat,
        ponto.lng
      );

      if (distancia <= ponto.raio) {
        despachar({ tipo: 'DESBLOQUEAR_PONTO', idPonto: ponto.id });
        setPontoAnimado(ponto.id);
        setTimeout(() => setPontoAnimado(null), 3000);
      }
    });
  }, [posicaoJogador, gpsAtivo, estado.pontosDesbloqueados, despachar]);

  const proximoPontoSequencial = useCallback(() => {
    for (const ponto of PONTOS) {
      if (!estado.pontosDesbloqueados.includes(ponto.id)) {
        if (ponto.ordem === 1) return ponto;

        const anterior = PONTOS.find((p) => p.ordem === ponto.ordem - 1);
        if (anterior && estado.quizzesRespondidos[anterior.id]?.acertou) {
          return ponto;
        }
        return null;
      }
    }
    return null;
  }, [estado]);

  useEffect(() => {
    if (gpsAtivo) return;

    const proximo = proximoPontoSequencial();
    if (proximo && !estado.pontosDesbloqueados.includes(proximo.id)) {
      despachar({ tipo: 'DESBLOQUEAR_PONTO', idPonto: proximo.id });
      setPontoAnimado(proximo.id);
      setTimeout(() => setPontoAnimado(null), 3000);
    }
  }, [gpsAtivo, proximoPontoSequencial, estado, despachar]);

  useEffect(() => {
    const atuais = new Set(estado.pontosDesbloqueados);
    estado.pontosDesbloqueados.forEach((id) => {
      if (!pontosPrevios.current.has(id)) {
        setPontoAnimado(id);
        setTimeout(() => setPontoAnimado(null), 3000);
      }
    });
    pontosPrevios.current = atuais;
  }, [estado.pontosDesbloqueados]);

  function aoClicarNoPino(ponto) {
    const estadoPonto = obterEstadoPonto(ponto);
    if (estadoPonto === 'bloqueado') return;
    navigate(`/quiz/${ponto.id}`);
  }

  const totalPontos = PONTOS.length;
  const pontosFeitos = PONTOS.filter((p) => estado.quizzesRespondidos[p.id]?.acertou).length;
  const pontoAtual = PONTOS.find((p) => obterStatusVisual(p) === 'atual') ?? PONTOS.find((p) => obterEstadoPonto(p) === 'liberado');

  return (
    <main className={styles.tela} aria-label="Mapa interativo do caça-tesouros">
      <section className={styles.heroMapa} aria-label="Painel do mapa de exploração">
        <div className={styles.textoHero}>
          <p className={styles.rotulo}>Mapa de exploração</p>
          <h1>Mapa vivo</h1>
          <p>Libere pontos, vença quizzes e avance pela rota.</p>
        </div>
        <div className={styles.cartaoSeattle}>
          <img src={Seattle} alt="Ilustração de Seattle pós-apocalíptica" />
          <span>Seattle</span>
        </div>
      </section>

      <header className={styles.painelStatus}>
        <div className={styles.progresso}>
          <span className={styles.progressoTexto}>{pontosFeitos}/{totalPontos} concluídos</span>
          <div
            className={styles.barraProgresso}
            role="progressbar"
            aria-valuenow={pontosFeitos}
            aria-valuemin={0}
            aria-valuemax={totalPontos}
            aria-label={`${pontosFeitos} de ${totalPontos} tesouros encontrados`}
          >
            <div
              className={styles.barraPreenchimento}
              style={{ width: `${(pontosFeitos / totalPontos) * 100}%` }}
            />
          </div>
        </div>

        <div className={styles.resumoMapa}>
          <span><Icone nome="localizacao" className={styles.iconeLinha} /> Rota: {pontoAtual?.nome ?? 'aguardando'}</span>
          <span><Icone nome={gpsAtivo ? 'sinal' : 'bussola'} className={styles.iconeLinha} /> {gpsAtivo ? 'GPS ativo' : 'Modo sequencial'}</span>
        </div>
      </header>

      {pontoAnimado && (
        <div className={styles.notificacaoDesbloqueio} role="alert" aria-live="assertive">
          <Icone nome="destravado" className={styles.notificacaoIcone} />
          {PONTOS.find((p) => p.id === pontoAnimado)?.nome} liberado.
        </div>
      )}

      <div className={styles.containerMapa}>
        <MapContainer
          center={posicaoJogador ? [posicaoJogador.lat, posicaoJogador.lng] : centroPadrao}
          zoom={18}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
          attributionControl={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          {posicaoJogador && (
            <CentralizarNaPos
              posicao={posicaoJogador}
              primeiraVez={primeiraVez}
              setPrimeiraVez={setPrimeiraVez}
            />
          )}

          {posicaoJogador && (
            <>
              <Marker
                position={[posicaoJogador.lat, posicaoJogador.lng]}
                icon={iconeJogador}
                zIndexOffset={1000}
                alt="Sua posição atual"
              />
              <Circle
                center={[posicaoJogador.lat, posicaoJogador.lng]}
                radius={RAIO_DESBLOQUEIO_METROS}
                pathOptions={{
                  color: '#56d18d',
                  fillColor: '#56d18d',
                  fillOpacity: 0.12,
                  weight: 1,
                  dashArray: '4 4',
                }}
              />
            </>
          )}

          {PONTOS.map((ponto) => {
            const estadoPonto = obterEstadoPonto(ponto);
            const statusVisual = obterStatusVisual(ponto);
            const esBloqueado = estadoPonto === 'bloqueado';

            return (
              <Marker
                key={ponto.id}
                position={[ponto.lat, ponto.lng]}
                icon={criarIcone(ponto, statusVisual)}
                zIndexOffset={esBloqueado ? 0 : 100}
                alt={esBloqueado ? 'Ponto bloqueado' : `${ponto.nome} - ${statusVisual}`}
                eventHandlers={{
                  click: () => aoClicarNoPino(ponto),
                  keypress: (e) => {
                    if (e.originalEvent.key === 'Enter') aoClicarNoPino(ponto);
                  },
                }}
              >
                <Popup>
                  <div className={styles.popup}>
                    <h3 className={styles.popupTitulo}>
                      {esBloqueado ? 'Ponto bloqueado' : ponto.nome}
                    </h3>
                    <p className={styles.popupDesc}>
                      {esBloqueado
                        ? gpsAtivo
                          ? 'Aproxime-se para liberar.'
                          : 'Complete o ponto anterior.'
                        : ponto.descricao}
                    </p>
                    {!esBloqueado && (
                      <button
                        className={styles.popupBotao}
                        onClick={() => navigate(`/quiz/${ponto.id}`)}
                      >
                        {estado.quizzesRespondidos[ponto.id]?.respondido ? 'Rever quiz' : 'Iniciar'}
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      <section className={styles.listaPontos} aria-label="Status dos pontos do mapa">
        {PONTOS.map((ponto) => {
          const status = obterStatusVisual(ponto);
          const labels = {
            bloqueado: 'Bloqueado',
            liberado: 'Liberado',
            atual: 'Atual',
            concluido: 'Concluído',
            incompleto: 'Incompleto',
          };

          return (
            <article key={ponto.id} className={styles.cartaoPonto} data-status={status}>
              <Icone nome={status === 'bloqueado' ? 'cadeado' : ponto.icone} className={styles.cartaoIcone} />
              <div>
                <h2>{ponto.nome}</h2>
                <p>{labels[status]}</p>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
