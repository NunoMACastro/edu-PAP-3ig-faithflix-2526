# Validação de usabilidade responsiva - MF7

## Metadados

- BK: BK-MF7-04
- Owner: Davi
<<<<<<< HEAD
- Fonte: RNF01, RNF02, RNF03, RNF05, RNF38, RNF40
- Decisão: EM_REVISAO
=======
- Data: 2026-06-25
- Fonte: RNF01, RNF02, RNF03, RNF05, RNF38, RNF40
- Decisão: PASS_COM_RISCOS
>>>>>>> dc94538 (Update: MF8)

## Matriz por página

| Página | Loading | Erro | Vazio | Lista/sucesso | Mobile 390px | Tablet 768px | Desktop | Estado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
<<<<<<< HEAD
| Catálogo | A preencher | A preencher | A preencher | A preencher | A preencher | A preencher | A preencher | A preencher |
| Pesquisa | A preencher | A preencher | A preencher | A preencher | A preencher | A preencher | A preencher | A preencher |
| Para si | A preencher | A preencher | A preencher | A preencher | A preencher | A preencher | A preencher | A preencher |
| Biblioteca | A preencher | A preencher | A preencher | A preencher | A preencher | A preencher | A preencher | A preencher |
| Planos | A preencher | A preencher | A preencher | A preencher | A preencher | A preencher | A preencher | A preencher |
| Associações | A preencher | A preencher | A preencher | A preencher | A preencher | A preencher | A preencher | A preencher |
| Conta | A preencher | A preencher | A preencher | A preencher | A preencher | A preencher | A preencher | A preencher |

## Negativos

- Erro da API não expõe detalhe técnico sensível:
- Lista vazia não aparece sem explicação:
- Mobile não cria scroll horizontal:
- Mensagens estão em português de Portugal:
- Datas e valores usam formato europeu:
- Pagamento continua identificado como simulado:

## Handoff para BK-MF7-05

- Páginas prontas para gate:
- Páginas com ressalvas:
- Riscos bloqueantes:
- Evidência reutilizável no gate:
=======
| Catálogo | `role="status"` | `EmptyState tone="error"` | `Ainda não existem conteúdos publicados` | `ContentCard` com imagem, tipo, título e detalhe | CSS usa grid fluida | CSS usa grid fluida | Largura `--content-width` | PASS_COM_RISCOS |
| Pesquisa | `role="status"` | `EmptyState tone="error"` | Sugere retirar filtros ou procurar outro termo | `ContentCard` com metadados de taxonomia | CSS usa grid fluida | CSS usa grid fluida | Largura controlada | PASS_COM_RISCOS |
| Para si | `role="status"` | `EmptyState tone="error"` | Cold start explicado sem IA opaca | Carrosséis com explicação baseline | CSS herdado dos carrosséis | CSS herdado dos carrosséis | Largura controlada | PASS_COM_RISCOS |
| Biblioteca | `role="status"` | `EmptyState tone="error"` | Vazio por secção com ação para catálogo | Favoritos, watchlist e histórico em paralelo | CSS usa grid fluida | CSS usa grid fluida | Largura controlada | PASS_COM_RISCOS |
| Planos | `role="status"` | `EmptyState tone="error"` | `Sem planos ativos` | Sucesso com `EmptyState tone="success"` | Cards em grid fluida | Cards em grid fluida | Largura controlada | PASS_COM_RISCOS |
| Associações | `role="status"` | `EmptyState tone="error"` | Lista pública vazia explicada | `ContentCard` e histórico condicionado a sessão | Cards em grid fluida | Cards em grid fluida | Largura controlada | PASS_COM_RISCOS |
| Conta | `role="status"` | `EmptyState tone="error"` | Conta indisponível com mensagem segura | Sucesso com `EmptyState tone="success"` | `narrow-section` limita formulário | `narrow-section` mantém leitura | Largura curta | PASS_COM_RISCOS |

## Negativos

- Erro da API não expõe detalhe técnico sensível: páginas principais usam `toUserMessage()` ou erro seguro normalizado.
- Lista vazia não aparece sem explicação: catálogo, pesquisa, recomendações, biblioteca, planos e associações têm texto orientado.
- Mobile não cria scroll horizontal conhecido: header usa `flex-wrap`; cards usam `repeat(auto-fit, minmax(180px, 1fr))`.
- Mensagens estão em português de Portugal: principais textos visíveis corrigidos para acentuação PT-PT, incluindo filtros de pesquisa (`Séries`, `Episódios`, `Documentários`, `Título`, `fé`, `família`, `documentário`).
- Datas e valores usam formato europeu: planos e histórico usam `Intl.NumberFormat("pt-PT")` ou `toLocaleDateString("pt-PT")`.
- Pagamento continua identificado como simulado: `SubscriptionPage` usa `paymentsApi.simulatedCheckout()` e botão `Pagar com método simulado`.

## Handoff para BK-MF7-05

- Páginas prontas para gate: catálogo, pesquisa, Para si, biblioteca, planos, associações e conta.
- Páginas com ressalvas: existem screenshots browser representativos para home, rota admin bloqueada, catálogo admin, home admin e skip link por teclado; a revisão humana completa das restantes páginas continua recomendada antes da defesa final.
- Riscos bloqueantes: nenhum P0 confirmado após build/regressão.
- Evidência reutilizável no gate: este ficheiro, `NAVEGACAO-SEGURA-POR-PERFIL.md` e `REFINAMENTO-VISUAL-MOCKUP.md`.

## Evidência browser acrescentada

| Cenário | Cobertura UX | Resultado | Artefacto |
| --- | --- | --- | --- |
| Home pública mobile 390x844 | Hero, nav pública, cards de descoberta e footer em ecrã estreito. | `PASS` | `browser/mf7-mobile-390-anonymous-home.png` |
| User comum em rota admin 768x900 | Estado de permissão insuficiente sem renderizar página admin. | `PASS` | `browser/mf7-tablet-768-user-admin-denied.png` |
| Moderator em catálogo admin 1366x900 | Página admin permitida ao moderator, sem expor áreas exclusivas de admin. | `PASS` | `browser/mf7-desktop-1366-moderator-catalog.png` |
| Admin em home 1440x900 | Hero desktop e links admin esperados no header. | `PASS` | `browser/mf7-desktop-1440-admin-home.png` |
| Skip link por teclado 1280x820 | `Tab` foca o link de salto e `Enter` move foco para o conteúdo principal. | `PASS` | `browser/mf7-keyboard-skip-link.png` |

Resumo estruturado: `browser/mf7-browser-validation-results.json`.

Validação de teclado: o fluxo `Tab` -> skip link -> `Enter` -> `main#conteudo-principal` ficou fechado por Playwright; a decisão mantém `PASS_COM_RISCOS` apenas pela revisão humana final de UX antes da defesa.

## Comandos

| Comando | Resultado |
| --- | --- |
| `npm run build` no package frontend | PASS, 104 módulos transformados. |
| `node scripts/check-frontend-regression.mjs` no package frontend | PASS. |

## Correção de auditoria - BK-MF7-04

- Data: 2026-06-25
- Finding: `AUD-MF7-BK04-P3-01`
- Resultado: `CORRIGIDO`
- Evidência: `frontend/src/components/search/SearchFilters.jsx` corrigido para PT-PT nos filtros de pesquisa.
- Validação: build no package frontend, pesquisa textual do finding e `git diff --check`.
>>>>>>> dc94538 (Update: MF8)
