# Alinhamento visual parte II - MF8

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
- `frontend/src/components/ui/ContentCard.jsx`
- `frontend/src/components/ui/EmptyState.jsx`
- `frontend/src/pages/CatalogPage.jsx`
- `frontend/src/pages/SearchPage.jsx`
- `frontend/src/pages/ForYouPage.jsx`
- `frontend/src/pages/MyLibraryPage.jsx`
- `frontend/src/pages/SubscriptionPage.jsx`
- `frontend/src/pages/PublicCharitiesPage.jsx`
- `frontend/src/pages/AccountPage.jsx`
- `frontend/src/styles/global.css`

## Matriz visual final

| Área | Estado principal | Estados negativos | Responsividade | Decisão | Proof |
| --- | --- | --- | --- | --- | --- |
| Catálogo | `CatalogPage` lista conteúdos publicados com `ContentCard`, imagem, tipo, título e detalhe. | Loading com `role="status"`, erro com `EmptyState tone="error"` e vazio com mensagem orientada. | `.content-grid` usa `repeat(auto-fit, minmax(180px, 1fr))`. | `PASS_COM_RISCOS` | `frontend/src/pages/CatalogPage.jsx`; `frontend/src/styles/global.css`. |
| Pesquisa | Filtros, total de resultados, cards e metadados de taxonomia. | Erro normalizado e vazio com sugestão para retirar filtros ou pesquisar outro termo. | Filtros usam `flex-wrap` e grelha fluida. | `PASS` | `frontend/src/pages/SearchPage.jsx`; `frontend/src/components/search/SearchFilters.jsx`. |
| Para si | Recomendações baseline e carrosséis sem prometer IA avançada. | Loading/erro com `EmptyState`; cold start explicado. | Carrosséis e cards usam classes partilhadas. | `PASS_COM_RISCOS` | `docs/evidence/MF7/USABILIDADE-UX.md`; `frontend/src/pages/ForYouPage.jsx`. |
| Biblioteca | Favoritos, watchlist e histórico usam secções separadas. | Vazio por secção orienta o utilizador para o catálogo; erro usa mensagem segura. | Grelha fluida nos cards da biblioteca. | `PASS` | `frontend/src/pages/MyLibraryPage.jsx`. |
| Planos | Estado atual, trial, planos e pagamento simulado com valores em EUR. | Loading, erro, status de sucesso e vazio `Sem planos ativos`. | Planos usam `content-grid` e cards. | `PASS` | `frontend/src/pages/SubscriptionPage.jsx`. |
| Associações | Lista pública e candidatura solidária preservam fluxo visual. | Estados documentados em MF7; histórico privado condicionado pela sessão. | Cards e ações usam componentes reutilizáveis. | `PASS_COM_RISCOS` | `docs/evidence/MF7/USABILIDADE-UX.md`; `frontend/src/pages/PublicCharitiesPage.jsx`. |
| Conta | Painéis de perfil, parental e privacidade separados. | Loading/erro/vazio com `EmptyState`. | `narrow-section` limita leitura do formulário. | `PASS_COM_RISCOS` | `docs/evidence/MF7/USABILIDADE-UX.md`; `frontend/src/pages/AccountPage.jsx`. |

## Passos do BK

| Passo | pr | proof | neg | fonte | Decisão |
| --- | --- | --- | --- | --- | --- |
| 1. Rever catálogo e cards | `NAO_APLICAVEL`; entrega local sem PR. | `CatalogPage` usa `ContentCard`; grelha fluida; estados loading/error/empty. | Card que corta título sem ação ou quebra alinhamento deve entrar em report visual. | `BK-MF8-02`; `RNF01`, `RNF02`, `RNF03`. | `PASS_COM_RISCOS` |
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
| `RNF03` | Layout mantém hierarquia em desktop, tablet e telemóvel. | `PASS_COM_RISCOS` | Grelhas fluidas e screenshots representativos MF7. |
| `RNF05` | Mensagens de erro e informação são claras em PT-PT. | `PASS` | `toUserMessage`, `EmptyState`, páginas principais. |
| `RNF21` | Não há contrato de browser específico que quebre Chrome/Edge/Firefox/Safari modernos. | `PASS_COM_RISCOS` | Uso de React/Vite, CSS padrão e build frontend. |
| `RNF22` | Viewports representativos foram cobertos por gate visual. | `PASS_COM_RISCOS` | 390x844, 768x900, 1366x900 e 1440x900 em evidence MF7. |
| `RNF38` | Texto visível está em português de Portugal por defeito. | `PASS_COM_RISCOS` | Evidence MF7 e páginas principais. |
| `RNF40` | Valores e datas usam formato europeu quando aplicável. | `PASS` | `SubscriptionPage.jsx`; evidence MF7 de formatos europeus. |

## Negativos finais

| Negativo | Expected | Observed | Estado |
| --- | --- | --- | --- |
| Erro de API | Mostra mensagem amigável, sem stack trace ou detalhe sensível. | Páginas principais usam `toUserMessage()` e `EmptyState tone="error"`. | `PASS` |
| Lista vazia | Explica a ausência de dados e sugere ação segura. | Catálogo, pesquisa, biblioteca e planos têm textos vazios específicos. | `PASS` |
| Pagamento | Deve estar claramente identificado como simulado. | Botão `Pagar com método simulado` e função `simulatedCheckout`. | `PASS` |
| Responsividade | Sem sobreposição conhecida em viewports representativos. | Gate MF7 validou home, admin bloqueado, admin home, catálogo admin e skip link. | `PASS_COM_RISCOS` |
| Acessibilidade | Foco deve ser visível e navegável por teclado. | `SkipLink` validado por browser; `:focus-visible` presente. | `PASS` |

## Handoff para BK-MF8-03

Rotas mínimas para a matriz de testes finais:

- `/`: hero, header público, CTA catálogo/planos e estado de descoberta.
- `/catalogo`: loading, erro, vazio, lista e card de conteúdo.
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
