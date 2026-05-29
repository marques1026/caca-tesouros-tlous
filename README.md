# Caça-Tesouros: The Last of Us

## Tecnologias

- React 18 + Vite
- React Router DOM v6
- React-Leaflet (mapa interativo)
- vite-plugin-pwa (Service Worker + manifest)
- CSS Modules
- LocalStorage (persistência do progresso)
- HTML5 Drag and Drop API

## Como rodar

Precisa ter Node.js 18+ instalado

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`

Para gerar o build de produção:

```bash
npm run build
npm run preview
```

## Funcionalidades

**Mapa**
- Usa `navigator.geolocation.watchPosition` pra rastrear o jogador em tempo real
- Desbloqueia pontos quando o jogador entra no raio de 5 metros
- Sem GPS: desbloqueio sequencial (próximo ponto libera ao acertar o quiz atual)

**Quiz**
- Pergunta única por ponto, tema TLOUS
- Acerto → pista completa no inventário
- Erro → pista incompleta, pode tentar de novo depois

**Inventário**
- Drag and drop com mouse/toque
- Suporte a teclado: Tab pra navegar, Enter/Espaço pra pegar e soltar, setas pra mover
- ARIA completo pra acessibilidade

**Enigma final**
- Libera só quando todas as pistas estão completas
- Input de texto com validação e dicas por tentativa

**Persistência**
- Tudo salvo no localStorage: pistas, pontos, quizzes respondidos e ordem do inventário

**PWA / Offline**
- Service Worker com cache de assets e tiles do mapa
- Funciona sem internet depois do primeiro acesso

## Pontos no mapa

Os 6 pontos ficam em locais reais do senai;

| # | Local | Coordenadas |
|---|---|---|
| 1 | Biblioteca | -22.9056, -47.0608 |
| 2 | Quadra SESI | -22.9058, -47.0610 |
| 3 | Academia SESI | -22.9060, -47.0612 |
| 4 | Cantina | -22.9062, -47.0614 |
| 5 | Auditório | -22.9064, -47.0616 |
| 6 | Sala do Lucas | -22.9067, -47.0619 |

Pra testar sem sair do lugar desativa o GPS e o modo sequencial entra automaticamente


## Estados tratados

- GPS desligado → banner de aviso + desbloqueio sequencial
- Sem internet → banner "modo offline" + cache ativo
- Pista já coletada → tela "quiz já resolvido"
- Ponto bloqueado → popup informativo no mapa + tela de bloqueio no quiz
- Quiz já acertado → não deixa regredir o estado da pista
