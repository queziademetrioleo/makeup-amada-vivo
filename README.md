# MakeUp Farmácia Amada Vivo — Virtual Try-On

Demo premium de maquiagem virtual em tempo real no browser.
Detecção facial via **MediaPipe Face Mesh**, renderização em **Canvas 2D**, backend em **Firebase**.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 19 + Vite + TypeScript |
| Estilização | TailwindCSS 3 |
| Estado global | Zustand 5 |
| Visão computacional | MediaPipe Face Mesh |
| Renderização | Canvas 2D (preparado para WebGL) |
| Auth | Firebase Auth (email + Google) |
| Banco | Firestore |
| Storage | Firebase Storage |
| Backend serverless | Firebase Functions v2 |
| Hosting | Firebase Hosting |

---

## Estrutura de pastas

```
makeup-tryon/
├── frontend/
│   └── src/
│       ├── app/             # App.tsx + roteamento
│       ├── components/      # UI primitivos + layout
│       ├── data/            # Presets e produtos mock
│       ├── features/
│       │   ├── landing/     # Página inicial
│       │   ├── tryon/       # Estúdio virtual
│       │   ├── camera/      # Webcam + overlays
│       │   ├── makeup/      # Controles por camada
│       │   ├── presets/     # Seleção de looks
│       │   └── auth/        # Login + cadastro
│       ├── hooks/           # useWebcam, useFaceMesh
│       ├── lib/             # Firebase wrappers
│       ├── store/           # Zustand stores
│       ├── types/           # Tipos TypeScript
│       └── utils/
│           └── makeup/      # Engine: lipstick, blush, contour, foundation, brows
├── backend/
│   └── functions/src/       # Firebase Functions v2
└── shared/types/            # Tipos compartilhados
```

---

## Setup rápido

### Pré-requisitos

- Node.js 20+
- npm
- Firebase CLI: `npm install -g firebase-tools`
- Conta no [Firebase Console](https://console.firebase.google.com)

### 1. Clone e instale

```bash
git clone <repo>
cd makeup-tryon/frontend
npm install
```

### 2. Configure o Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com)
2. Ative: **Authentication** (Email/senha + Google), **Firestore**, **Storage**, **Functions**
3. Copie as credenciais do SDK Web

### 3. Variáveis de ambiente

```bash
cp frontend/.env.example frontend/.env.local
```

Edite `.env.local` com suas credenciais:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc
```

### 4. Configure o projeto Firebase

```bash
# Na raiz do projeto
firebase login
firebase use --add    # selecione seu projeto e salve como "default"
```

### 5. Rode localmente

```bash
# Frontend
cd frontend
npm run dev

# (opcional) Emuladores Firebase em outro terminal
cd ..
firebase emulators:start
```

Acesse: `http://localhost:5173`

---

## Scripts

### Frontend

| Script | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build |
| `npm run deploy` | Build + deploy no Firebase Hosting |

### Functions

```bash
cd backend/functions
npm run build       # compila TypeScript
npm run serve       # emula localmente
npm run deploy      # deploy no Firebase
```

### Deploy completo

```bash
# Na raiz
cd frontend && npm run build && cd ..
firebase deploy     # hosting + functions + rules
```

---

## Como funciona o try-on

```
Webcam → VideoElement (oculto)
         ↓
    requestAnimationFrame loop
         ↓
    Canvas: drawImage(video)     ← frame bruto espelhado
         ↓
    MediaPipe FaceMesh callback
         ↓
    landmarksRef (468 pontos)
         ↓
    Makeup Engine
      ├── drawFoundation()       ← oval face, baixa opacidade
      ├── drawContour()          ← bochechas + nariz
      ├── drawBlush()            ← gradiente radial elíptico
      ├── drawBrows()            ← reforço discreto
      └── drawLipstick()         ← máscara poligonal + gloss
```

**Suavização temporal:** cada frame de landmarks é interpolado com o anterior (ALPHA=0.6) para eliminar tremor.

**Antes/Depois:** ao ativar, o canvas é clipado na metade — esquerda sem maquiagem, direita com.

---

## Makeup Engine — índices de landmarks

Utiliza os 468 landmarks do MediaPipe Face Mesh:

| Efeito | Região | Abordagem |
|---|---|---|
| Batom | `lipsOuterUpper/Lower` | Polígono + blur 4px + highlight radial |
| Blush | `leftCheek / rightCheek` | Gradiente radial elíptico + blur 18px |
| Contorno | `leftContour / rightContour` | Polígono suave + blur 12px |
| Base | `faceOval` (- olhos - lábios) | Máscara even-odd + blur 6px |
| Sobrancelha | `leftBrow / rightBrow` | Polígono espessado + blur 2px |

---

## Coleções do Firestore

```
looks/
  {lookId}
    userId: string
    name: string
    snapshotUrl: string
    makeupConfig: MakeupConfig
    createdAt: Timestamp

presets/
  {presetId}
    name: string
    description: string
    config: MakeupConfig
    tags: string[]
    isPremium: boolean
    usageCount: number
    createdAt: Timestamp
```

---

## O que está pronto ✅

- [x] Landing page premium (hero, benefícios, categorias, presets, CTA)
- [x] Try-On Studio com webcam real
- [x] Integração MediaPipe Face Mesh com suavização temporal
- [x] Makeup Engine: lipstick, blush, contorno, base, sobrancelha
- [x] Controles por camada (cor, intensidade, toggle)
- [x] 6 presets curados com 1 clique
- [x] Modo Antes/Depois
- [x] Modo Debug (landmarks visíveis)
- [x] Captura de snapshot com download
- [x] Auth Firebase (email + Google)
- [x] Salvar look no Firestore + Storage
- [x] Firebase Functions para persistência segura
- [x] Regras de segurança Firestore + Storage

## Próximos passos 🚀

- [ ] **WebGL / Three.js:** migrar rendering para shaders GLSL para efeitos como sombra, shimmer metálico e iluminação especular realista
- [ ] **Eyeshadow:** adicionar zona dos olhos com suporte a gradiente multi-cor
- [ ] **Lipliner:** traçado de contorno separado do preenchimento
- [ ] **Filtro de pele:** suavização e uniformização de tons com WebGL
- [ ] **ARKit / ARCore via WebXR:** rastreamento 3D mais robusto em mobile
- [ ] **Catálogo linkado:** ao selecionar cor no try-on, abrir produto correspondente
- [ ] **Compartilhamento:** link direto para look salvo
- [ ] **A/B Testing:** presets com tracking de conversão
- [ ] **Modo offline:** PWA com service worker
- [ ] **Acessibilidade:** suporte completo a screen readers no painel lateral

---

## Notas técnicas

- O WASM do MediaPipe é carregado via CDN (`cdn.jsdelivr.net`) na primeira abertura do Try-On. Demora ~2-3s no primeiro acesso.
- O cabeçalho `Cross-Origin-Embedder-Policy: require-corp` é obrigatório para `SharedArrayBuffer` (usado internamente pelo MediaPipe WASM). Já configurado no `vite.config.ts` e `firebase.json`.
- Todos os frames de vídeo ficam **100% no dispositivo do usuário**. Nenhuma imagem é transmitida em tempo real para o servidor.

---

*Desenvolvido com MediaPipe + Firebase + React · 2026*
