# Alinhamento visual parte II - MF8

- `document_status`: `CURRENT`
- `snapshot_date`: `-`
- `implementation_lane`: `REFERENCE`
- `current_authority`: `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-END-TO-END-real_dev.md`
- `proof_scope`: matriz responsiva local atual e snapshot histórico delimitado; Safari/Chrome/Edge reais não executados

## Adendo de produto - login e registo (2026-07-11)

`/login` passou a usar uma composição editorial e funcional própria, limitada
por `--content-width`: duas colunas em desktop/tablet e reflow vertical abaixo
de `720 px`. Login e registo são os únicos modos principais; pedido e reset de
password aparecem progressivamente, preservando os endpoints, a resposta
indistinguível e a fronteira dev-only do token.

A prova detalhada está em `docs/evidence/MF8/PAGINA-LOGIN-REGISTO.md`. O
frontend passou lint, `252` testes e build; backend passou `287` testes, `15`
contratos e `11` testes de segurança; a rota passou Axe isolado e a matriz
`2048/1366/768/390`. O E2E MF2 foi expandido, mas permanece não executado sem
MongoDB `_e2e` formal. Este adendo não reclassifica o snapshot histórico nem
altera RF, guias BK ou `SCOPE-FREEZE.md`.

## Adendo de produto - associações públicas (2026-07-11)

`/associacoes` deixou de reutilizar os cards genéricos de conteúdo e passou a
ter hero editorial, métricas agregadas, explicação da pool, cards próprios e
CTA de candidatura. `/associacoes/candidatura` usa uma composição contextual de
duas colunas com reflow mobile. A grelha e o alinhamento continuam a usar
`--content-width`, tokens FaithFlix e o header global.

A prova detalhada, incluindo os limites público/privado, contratos API,
viewports e resultados realmente executados, está em
`docs/evidence/MF8/PAGINA-PUBLICA-ASSOCIACOES.md`. Este adendo atualiza apenas a
lane `REFERENCE`; não reclassifica retroativamente o snapshot MF8 nem o trabalho
dos alunos.

## Adendo docente Fase 5 - matriz responsiva atual (2026-07-10)

Este adendo prevalece apenas para a prova visual local atual. Os adendos e o
snapshot histórico seguintes permanecem preservados e não são reclassificados.

- `npm run test:a11y`: `14/14` em Chromium, preview-only, incluindo catálogo administrativo.
- Quatro cenários de home: `390x844`, `768x900`, `1280x720` e `1440x900`, sem
  overflow horizontal e sem violações Axe `serious`/`critical`.
- Rotas públicas cobertas em mobile: `/catalogo`, `/pesquisa?q=esperanca` e
  `/login`.
- Rotas autenticadas cobertas em mobile: `/conta`, `/biblioteca`,
  `/notificacoes`, `/admin/utilizadores` e `/admin/catalogo`, com sessão
  sintética local.
- Cenários adicionais: menu móvel fecha com `Escape`, devolve foco e mantém o
  header fechado em `68 px`; reflow equivalente a `200%` continua utilizável.
- O catálogo sintético mantém conteúdo publicado com `mediaStatus: pending`,
  CTA não reproduzível e mensagem “Vídeo ainda não disponível”.

As quatro screenshots full-page atuais foram geradas em `/tmp` e inspecionadas
visualmente: header fechado, grelhas, CTA e footer ficaram legíveis, sem corte
ou overflow. Não são artefactos históricos publicados em `docs/evidence` e não
substituem uma ronda humana completa. O harness usa apenas loopback, API/media
intercetadas, zero backend/DB/seed e zero pedidos externos; por isso não conta
como full E2E, streaming ou browser matrix completa.

## Adendo docente pós-correção - admin e pesquisa Fase 4 (2026-07-10)

O corpo abaixo continua a ser o snapshot visual de 2026-06-29. Este adendo
descreve apenas o código atual da referência privada; não altera o estado dos
alunos, não reutiliza screenshots antigas como prova nova e não promove a
decisão histórica sem uma ronda browser/visual atual.

| Área atual | Contrato observado no código | Limite da prova |
| --- | --- | --- |
| Catálogo admin | `AdminCatalogPage` edita apenas metadata, assets e taxonomias; create informa que nasce com media pendente e `mediaStatus` aparece como texto read-only. A tabela consome o envelope paginado, apresenta anterior/seguinte e mantém `expectedVersion` nas mutações CAS. | Leitura de `real_dev/frontend/src/pages/AdminCatalogPage.jsx` e `catalogApi.js`; sem nova captura browser. |
| Cancelamento admin | O carregamento inicial conjunto de catálogo/taxonomias usa `AbortController`, ignora `REQUEST_ABORTED` e cancela no cleanup. Arquivar e reverter exigem confirmação, e busy state impede ações concorrentes na linha. | Prova de código; não é medição de rede real. |
| Pesquisa partilhável | `SearchPage` deriva `q`, `type`, `taxonomyId`, `sort` e `page` de `useSearchParams`; submissão e paginação atualizam o URL, preservando filtros e permitindo back/forward/link partilhável. O total backend determina anterior/seguinte. | Leitura de `real_dev/frontend/src/pages/SearchPage.jsx`; sem novo E2E multi-browser. |
| Cancelamento da pesquisa | Cada mudança de URL cria um novo `AbortController`; cleanup aborta o pedido anterior e o estado só é atualizado enquanto a execução permanece ativa. `REQUEST_ABORTED` não aparece como erro ao utilizador. | Prova de código; latência/race em browser real ainda não revalidada. |

Os paths publicados nos guias dos alunos permanecem `backend/` e `frontend/`;
os paths `real_dev` deste adendo identificam apenas a fonte privada da evidence docente.

## Snapshot histórico — matriz visual observada em 2026-06-29

A partir desta fronteira, o conteúdo conserva exclusivamente a observação
histórica dessa data e não revalida a baseline atual.

## Metadados

- BK: `BK-MF8-02`
- Data: 2026-06-29
- Dependência consumida: `BK-MF8-01`
- Fonte principal: `RNF01`, `RNF02`, `RNF03`, `RNF05`, `RNF21`, `RNF22`, `RNF38`, `RNF40`
- Escopo: catálogo, cards, planos, formulários, estados UI, responsividade, acessibilidade visual e handoff para testes finais
- Decisão final: `PASS_COM_RISCOS`

## Fontes revistas

- `docs/evidence/MF8/ALINHAMENTO-VISUAL-PARTE-I.md`
- `docs/evidence/MF7/USABILIDADE-UX.md`
- `docs/evidence/MF7/GATE-UI-NAVEGACAO-SEGURA.md`
- `docs/evidence/MF7/browser/mf7-browser-validation-results.json`
- `mockup/src/app/FAITHFLIX_INTERFACE_SPECS.md`
- `mockup/src/app/components/ContentCard.tsx`
- `mockup/src/app/components/SubscriptionPlans.tsx`
- `real_dev/frontend/src/components/ui/ContentCard.jsx`
- `real_dev/frontend/src/components/ui/EmptyState.jsx`
- `real_dev/frontend/src/pages/CatalogPage.jsx`
- `real_dev/frontend/src/pages/SearchPage.jsx`
- `real_dev/frontend/src/pages/ForYouPage.jsx`
- `real_dev/frontend/src/pages/MyLibraryPage.jsx`
- `real_dev/frontend/src/pages/SubscriptionPage.jsx`
- `real_dev/frontend/src/pages/PublicCharitiesPage.jsx`
- `real_dev/frontend/src/pages/AccountPage.jsx`
- `real_dev/frontend/src/styles/global.css`

## Matriz visual final

| Área | Estado principal | Estados negativos | Responsividade | Decisão | Proof |
| --- | --- | --- | --- | --- | --- |
| Catálogo | `CatalogPage` organiza conteúdos publicados com hero compacto, continuação, filtros por formato, destaques editoriais opcionais, contagem e grelha paginada via `page`/`limit`; deixou de carregar o catálogo completo em loop. | Loading com `role="status"`, erro com `EmptyState tone="error"`, vazio geral, vazio filtrado com ação de limpeza e página fora de intervalo com regresso ao catálogo completo. | `.content-grid`, `.content-row`, `.catalog-hero`, `.catalog-filters`, `.catalog-section-header` e `.catalog-pagination` mantêm grelha fluida e sem overflow esperado. | `PASS_COM_RISCOS` | `real_dev/frontend/src/pages/CatalogPage.jsx`; `real_dev/frontend/src/styles/global.css`; `real_dev/backend/src/modules/catalog/catalog.service.js`; `npm --prefix real_dev/frontend run build`; screenshots `catalogo-desktop.png` e `catalogo-mobile.png`. |
| Pesquisa | Filtros, total de resultados, cards e metadados de taxonomia. | Erro normalizado e vazio com sugestão para retirar filtros ou pesquisar outro termo. | Filtros usam `flex-wrap` e grelha fluida. | `PASS` | `real_dev/frontend/src/pages/SearchPage.jsx`; `real_dev/frontend/src/components/search/SearchFilters.jsx`. |
| Para si | Recomendações baseline e carrosséis sem prometer IA avançada. | Loading/erro com `EmptyState`; cold start explicado. | Carrosséis e cards usam classes partilhadas. | `PASS_COM_RISCOS` | `docs/evidence/MF7/USABILIDADE-UX.md`; `real_dev/frontend/src/pages/ForYouPage.jsx`. |
| Biblioteca | Favoritos, watchlist e histórico usam secções separadas. | Vazio por secção orienta o utilizador para o catálogo; erro usa mensagem segura. | Grelha fluida nos cards da biblioteca. | `PASS` | `real_dev/frontend/src/pages/MyLibraryPage.jsx`. |
| Planos | Estado atual, trial, planos e pagamento simulado com valores em EUR. | Loading, erro, status de sucesso e vazio `Sem planos ativos`. | Planos usam `content-grid` e cards. | `PASS` | `real_dev/frontend/src/pages/SubscriptionPage.jsx`. |
| Associações | Lista pública e candidatura solidária preservam fluxo visual. | Estados documentados em MF7; histórico privado condicionado pela sessão. | Cards e ações usam componentes reutilizáveis. | `PASS_COM_RISCOS` | `docs/evidence/MF7/USABILIDADE-UX.md`; `real_dev/frontend/src/pages/PublicCharitiesPage.jsx`. |
| Conta | Painéis de perfil, parental e privacidade separados. | Loading/erro/vazio com `EmptyState`. | `narrow-section` limita leitura do formulário. | `PASS_COM_RISCOS` | `docs/evidence/MF7/USABILIDADE-UX.md`; `real_dev/frontend/src/pages/AccountPage.jsx`. |

## Passos do BK

| Passo | pr | proof | neg | fonte | Decisão |
| --- | --- | --- | --- | --- | --- |
| 1. Rever catálogo e cards | `NAO_APLICAVEL`; entrega local sem PR. | `CatalogPage` usa `ContentCard`, filtros backend, destaques editoriais, grelha fluida, metadados de duração/classificação/data e estados loading/error/empty/filtered-empty/out-of-range. | Card que corta título sem ação, filtro que só atua localmente sem chamar backend, carregamento total do catálogo em loop ou quebra de alinhamento deve entrar em report visual. | `BK-MF8-02`; `RNF01`, `RNF02`, `RNF03`, `RNF09`. | `PASS_COM_RISCOS` |
| 2. Rever planos e subscrição | `NAO_APLICAVEL`; sem alteração de pagamento. | `SubscriptionPage` usa `Intl.NumberFormat("pt-PT", { currency: "EUR" })` e `paymentsApi.simulatedCheckout()`. | UI não pode prometer Stripe, PayPal, MB Way ou gateway real. | `BK-MF4-01`, `BK-MF4-02`, `RNF40`. | `PASS` |
| 3. Fechar estados vazio, erro e carregamento | `NAO_APLICAVEL`; validação por leitura e regressão. | Páginas principais usam `role="status"`, `EmptyState tone="error"` e mensagens vazias orientadas. | Erro técnico cru ou página em branco volta a `FAIL`. | `RNF05`, `RNF38`; `docs/evidence/MF7/USABILIDADE-UX.md`. | `PASS` |
| 4. Validar responsividade | `NAO_APLICAVEL`; evidence representativa. | CSS usa grid fluida, header com wrap, largura máxima e screenshots MF7 em 390, 768, 1366 e 1440px. | Botão inacessível, texto sobreposto ou scroll horizontal inesperado deve abrir report. | `RNF03`, `RNF21`, `RNF22`. | `PASS_COM_RISCOS` |
| 5. Validar acessibilidade visual | `NAO_APLICAVEL`; evidence e código. | `:focus-visible`, `SkipLink`, `main#conteudo-principal`, `aria-label` de navegação e `EmptyState` semântico. | Sem foco visível por teclado, a página não passa. | `RNF02`, `RNF04`, `RNF21`, `RNF22`. | `PASS` |
| 6. Comparar mockup vs frontend final | `NAO_APLICAVEL`; consolidação documental. | Tabela "Matriz visual final" classifica diferenças por área com estado e prova. | Diferença sem owner, decisão ou impacto não pode seguir para freeze. | `BK-MF8-01`, `BK-MF8-02`. | `PASS_COM_RISCOS` |
| 7. Entregar entrada aos testes finais | `NAO_APLICAVEL`; esta secção é o handoff. | Lista de rotas/estados abaixo alimenta `BK-MF8-03`. | Handoff sem rotas concretas bloqueia a matriz de testes finais. | `BK-MF8-03`, `RNF29`. | `PASS` |

## Critérios por RNF

| RNF | Critério | Estado | Prova |
| --- | --- | --- | --- |
| `RNF01` | Fluxos principais têm navegação clara e cards compreensíveis. | `PASS_COM_RISCOS` | Catálogo, pesquisa, biblioteca, planos e associações revistos. |
| `RNF02` | Elementos interativos têm hover/foco/disabled e feedback de operação. | `PASS` | `global.css`; `SubscriptionPage.jsx`; `EmptyState.jsx`. |
| `RNF03` | Layout mantém hierarquia em desktop, tablet e telemóvel. | `PASS_COM_RISCOS` | Grelhas fluidas, classes responsivas do catálogo e screenshots representativos MF7/MF8. |
| `RNF05` | Mensagens de erro e informação são claras em PT-PT. | `PASS` | `toUserMessage`, `EmptyState`, páginas principais. |
| `RNF21` | Não há contrato de browser específico que quebre Chrome/Edge/Firefox/Safari modernos. | `PASS_COM_RISCOS` | Uso de React/Vite, CSS padrão e build frontend. |
| `RNF22` | Viewports representativos foram cobertos por gate visual. | `PASS_COM_RISCOS` | 390x844, 768x900, 1366x900 e 1440x900 em evidence MF7/MF8; catálogo regenerado em desktop e mobile após reorganização `real_dev`. |
| `RNF38` | Texto visível está em português de Portugal por defeito. | `PASS_COM_RISCOS` | Evidence MF7 e páginas principais. |
| `RNF40` | Valores e datas usam formato europeu quando aplicável. | `PASS` | `SubscriptionPage.jsx`; evidence MF7 de formatos europeus. |

## Negativos finais

| Negativo | Expected | Observed | Estado |
| --- | --- | --- | --- |
| Erro de API | Mostra mensagem amigável, sem stack trace ou detalhe sensível. | Páginas principais usam `toUserMessage()` e `EmptyState tone="error"`. | `PASS` |
| Lista vazia | Explica a ausência de dados e sugere ação segura. | Catálogo, pesquisa, biblioteca e planos têm textos vazios específicos. | `PASS` |
| Pagamento | Deve estar claramente identificado como simulado. | Botão `Pagar com método simulado` e função `simulatedCheckout`. | `PASS` |
| Responsividade | Sem sobreposição conhecida em viewports representativos. | Gate MF7 validou home, admin bloqueado, admin home, catálogo admin e skip link; screenshots MF8 do catálogo público foram regenerados em desktop e mobile. | `PASS_COM_RISCOS` |
| Acessibilidade | Foco deve ser visível e navegável por teclado. | `SkipLink` validado por browser; `:focus-visible` presente. | `PASS` |

## Handoff para BK-MF8-03

Rotas mínimas para a matriz de testes finais:

- `/`: hero, header público, CTA catálogo/planos e estado de descoberta.
- `/catalogo`: hero compacto, filtros por formato, loading, erro, vazio geral, vazio filtrado, página fora de intervalo, lista paginada e card de conteúdo com metadados.
- `/pesquisa`: filtros, loading, erro, vazio e resultados.
- `/para-si`: recomendações baseline, cold start e erro.
- `/biblioteca`: secções vazias, lista e erro autenticado.
- `/planos`: planos, trial, pagamento simulado, erro e sucesso.
- `/associacoes`: lista pública e candidatura.
- `/conta`: conta, parental, privacidade e erro.
- `/admin/catalogo`: acesso moderator/admin.
- `/admin/metricas`: bloqueio visual para user comum.

Estados a transformar em testes:

- `loading`: textos com `role="status"`.
- `error`: `EmptyState tone="error"` e mensagem PT-PT.
- `empty`: mensagem orientada por página.
- `success/list`: cards, grelhas, CTA e metadados.
- `auth/role`: visitante, user, moderator e admin.
- `responsive`: pelo menos 390px, 768px, 1366px e 1440px.
- `keyboard`: skip link e foco visível.

Riscos a transportar:

- A revisão humana final de UX continua recomendada antes da defesa.
- As screenshots atuais são representativas; o sweep visual completo deve acontecer no ciclo de testes finais.
- Se `BK-MF8-03` introduzir testes browser novos, deve preservar as fixtures seguras usadas para perfis e não criar dados destrutivos.

## Resultado

`BK-MF8-02` fica `PASS_COM_RISCOS`: os ecrãs principais têm decisão visual final suficiente para preparar os testes, mantendo apenas ressalvas controladas de revisão humana e sweep visual completo.
