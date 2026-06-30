# BK-MF9-02 - Qualidade de streaming por plano

## Header

- `doc_id`: `GUIA-BK-MF9-02`
- `bk_id`: `BK-MF9-02`
- `macro`: `MF9`
- `owner`: `Mateus`
- `apoio`: `Matheus`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF9-01,BK-MF2-06`
- `rf_rnf`: `RF15, RF63, RNF29`
- `fase_documental`: `Fase 3`
- `sprint`: `S13`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF9-03`
- `guia_path`: `docs/planificacao/guias-bk/MF9/BK-MF9-02-qualidade-streaming-por-plano.md`
- `last_updated`: `2026-06-30`

#### Objetivo

Este BK aplica os entitlements ao playback real. Pro e trial ficam limitados a `1080p`; Familia pode usar `2160p/4K` quando o conteudo tiver essa opcao.

#### Importancia

A qualidade nao pode ser apenas uma escolha visual. O backend deve impedir que URLs de qualidade acima do plano sejam enviados ao browser.

#### Scope-in

- Resolver entitlements efetivos antes de devolver playback.
- Filtrar `qualityOptions` e remover `playbackUrl` de opcoes bloqueadas.
- Fazer fallback para a melhor qualidade permitida.
- Atualizar seletor de qualidade no frontend.

#### Scope-out

- CDN adaptativa real, HLS/DASH, DRM e bitrate dinamico.

#### Estado antes e depois

- Estado antes: qualidade vem de preferencias e `qualityOptions`, sem plano.
- Estado depois: qualidade e imposta por plano no backend.

#### Pre-requisitos

- Rever `BK-MF2-06`, `BK-MF9-01`, `RF15`, `RF63` e `RNF29`.

#### Glossario

- Fallback: escolha segura quando a preferencia nao e permitida.
- Locked option: qualidade visivel mas sem URL reproduzivel.

#### Conceitos teoricos essenciais

Qualquer regra de entitlement deve viver no servidor. A UI pode mostrar estados bloqueados, mas nao deve ser a barreira de seguranca.

#### Arquitetura do BK

- Endpoint(s): `GET /api/playback/:contentId`.
- Modelo/schema: `contents.qualityOptions`.
- Service(s): `playback.service.js`, `subscriptions.service.js`.
- Controller/route: playback existente.
- Guard/middleware: `requireActiveSubscription`.
- Cliente API: `playbackApi`.
- Pagina/componente: `PlaybackPage`.
- Testes: fallback Pro, 4K Familia e URL bloqueado.
- Handoff para o proximo BK: acesso efetivo por familia.

#### Ficheiros a criar/editar/rever

- EDITAR: `real_dev/backend/src/modules/playback/playback.service.js`
- EDITAR: `real_dev/frontend/src/pages/PlaybackPage.jsx`
- TESTAR: `real_dev/backend/tests/unit/mf9-subscriptions.test.js`

#### Tutorial tecnico linear

### Passo 1 - Filtrar qualidades no backend

1. Obter entitlements efetivos.
2. Calcular ranking da qualidade.
3. Remover URLs bloqueados da resposta publica.

```js
// Sem codigo neste guia generico; usar helper central de entitlements.
```

### Passo 2 - Atualizar o seletor de qualidade

1. Ignorar opcoes bloqueadas ao resolver source.
2. Mostrar opcoes bloqueadas sem permitir selecao.
3. Preservar progresso e preferencias existentes.

```jsx
// Sem codigo neste guia generico; a UI nunca deve reconstruir URLs de media.
```

#### Criterios de aceite

- Pro/trial nao recebem URL 4K.
- Familia recebe 4K quando disponivel.
- Preferencia 4K em Pro faz fallback para 1080p.
- Testes automatizados cobrem positivo e negativos.

#### Validacao final

- `npm --prefix real_dev/backend test`
- Negativos: preferencia acima do plano, conteudo sem qualidade permitida, subscricao expirada.

#### Evidence para PR/defesa

- `pr`: commit ou PR da MF9.
- `proof`: resposta playback com `locked: true` sem `playbackUrl`.
- `neg`: tentativa Pro em 4K.
- `fonte`: `RF15`, `RF63`, `RNF29`.

#### Handoff

Entrega enforcement de qualidade para membros familiares no `BK-MF9-03`.

#### Changelog

- `2026-06-30`: guia generico criado para MF9.
