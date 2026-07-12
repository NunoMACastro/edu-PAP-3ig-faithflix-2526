# Alinhamento visual parte I - MF8

- `document_status`: `CURRENT`
- `snapshot_date`: `-`
- `implementation_lane`: `REFERENCE`
- `current_authority`: `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-END-TO-END-real_dev.md`
- `proof_scope`: adendo local F5 e snapshot visual histórico delimitado; não prova browsers reais ou streaming

## Adendo docente Fase 5 - acessibilidade, header e performance (2026-07-10)

O corpo datado de 2026-06-29 permanece um snapshot histórico. Este adendo
regista apenas a validação atual da referência privada e não promove o estado
dos BK dos alunos.

| Área atual | Prova observada | Resultado | Limite |
| --- | --- | --- | --- |
| Tokens e interação | Contratos CSS e testes verificam contraste WCAG AA, foco visível, targets mínimos `44x44 px` e `prefers-reduced-motion: reduce`. | `VALIDADO_LOCAL` | Axe bloqueia apenas impactos `serious`/`critical`; findings inferiores continuam sujeitos a triagem. |
| Header móvel | O header fechado mede `68 px` e cumpre o teto de `72 px`; o menu usa botão semântico, fecha com `Escape` e restitui foco. | `VALIDADO_LOCAL` | Validado no preview Chromium com sessão/API sintéticas. |
| Responsividade | Home sem overflow em `390x844`, `768x900`, `1280x720` e `1440x900`; reflow equivalente a `200%` validado em `720x450`. | `VALIDADO_LOCAL` | Não representa todas as combinações de conteúdo real, idioma ou browser. |
| Performance inicial | Build final: JavaScript inicial `61,90 kB` gzip, CSS `5,38 kB` gzip e logo `19,91 kB`; abaixo dos budgets `90/25/30 kB`. | `VALIDADO_LOCAL` | HLS/DASH permanecem lazy, mas os respetivos chunks e warnings ESM/bundle continuam registados e não são apagados por este resultado. |

O comando docente canónico foi `npm run test:a11y`, executado na raiz: `14/14`
em Chromium. API e media foram intercetadas em loopback, pedidos externos foram
zero e não arrancaram backend, base de dados ou seeds. Esta prova é
preview-only: não fecha full E2E, streaming real ou compatibilidade cross-browser.

## Snapshot histórico — alinhamento visual observado em 2026-06-29

A partir desta fronteira, o conteúdo conserva exclusivamente a observação
histórica dessa data e não revalida a baseline atual.

## Metadados

- BK: `BK-MF8-01`
- Data: 2026-06-29
- Fonte principal: `BK-MF7-05`, `RNF01`, `RNF02`, `RNF03`, `RNF04`, `RNF28`, `RNF38`
- Escopo: tokens, cores, tipografia, espaçamentos, header, navegação, hero e home
- Decisão final: `PASS_COM_RISCOS`

## Fontes revistas

- `docs/evidence/MF7/INVENTARIO-UI-MOCKUP.md`
- `docs/evidence/MF7/REFINAMENTO-VISUAL-MOCKUP.md`
- `docs/evidence/MF7/NAVEGACAO-SEGURA-POR-PERFIL.md`
- `docs/evidence/MF7/GATE-UI-NAVEGACAO-SEGURA.md`
- `docs/evidence/MF7/browser/mf7-browser-validation-results.json`
- `mockup/src/app/FAITHFLIX_INTERFACE_SPECS.md`
- `mockup/src/app/components/Header.tsx`
- `mockup/src/app/components/HeroSection.tsx`
- `real_dev/frontend/src/styles/tokens.css`
- `real_dev/frontend/src/styles/global.css`
- `real_dev/frontend/src/components/layout/AppHeader.jsx`
- `real_dev/frontend/src/pages/DiscoveryHomePage.jsx`
- `real_dev/frontend/src/layouts/AppLayout.jsx`

## Comparação mockup vs frontend

| Área | Mockup | Frontend final | Decisão | Proof | Negativo |
| --- | --- | --- | --- | --- | --- |
| Paleta | Bege `#F0CD95`, verde `#8DA385`, fundo `#F9F7F3`, texto `#4B4B4B` e alerta `#D16449`. | `tokens.css` declara `--color-bg`, `--color-brand`, `--color-accent`, `--color-text`, `--color-danger` e variantes de contraste. | `PASS` | `mockup/src/app/FAITHFLIX_INTERFACE_SPECS.md`; `real_dev/frontend/src/styles/tokens.css`. | Se uma página usar cor solta para substituir estes tokens, passa a `DRIFT`. |
| Tipografia | Base 16px, pesos 400/500 e hierarquia simples. | `tokens.css` define stack global e `global.css` centraliza tamanhos de `h1`, `h2`, `h3`, parágrafos e botões. | `PASS_COM_RISCOS` | `real_dev/frontend/src/styles/tokens.css`; `real_dev/frontend/src/styles/global.css`. | O hero usa H1 forte, mas a revisão manual final deve confirmar leitura em projetor. |
| Espaçamento e raios | Radius 6/8/10/14px e espaçamento consistente. | `--radius-sm`, `--radius-md`, `--radius-lg`, `--space-page` e `--content-width` controlam layout, header, cards e formulários. | `PASS` | `real_dev/frontend/src/styles/tokens.css`; `real_dev/frontend/src/styles/global.css`. | Se um card ou painel criar raio divergente sem motivo, deve ser marcado em `BK-MF8-02`. |
| Header | Logo FaithFlix, navegação principal, ações e CTA. | `AppHeader` mantém marca, links públicos, links autenticados e links admin filtrados por sessão/role. | `PASS` | `docs/evidence/MF7/GATE-UI-NAVEGACAO-SEGURA.md`; `real_dev/frontend/src/components/layout/AppHeader.jsx`. | Visitante ou user comum não deve ver links admin. |
| Navegação mobile | Mockup oculta elementos em mobile para reduzir ruído. | Header real usa `flex-wrap`, links filtrados por perfil e screenshot 390x844 sem links admin. | `PASS_COM_RISCOS` | `docs/evidence/MF7/browser/mf7-mobile-390-anonymous-home.png`; `docs/evidence/MF7/browser/mf7-browser-validation-results.json`. | Sweep visual completo das restantes rotas mobile continua recomendado. |
| Hero e home | Hero com destaque, título, descrição e CTAs. | `DiscoveryHomePage` usa hero com catálogo real, `Mais vistos`, `Adicionados recentemente` e atalhos para `Filmes`, `Séries` e `Documentários`, sem badge técnico de API na experiência final. | `PASS_COM_RISCOS` | `real_dev/frontend/src/pages/DiscoveryHomePage.jsx`; `docs/evidence/MF8/screenshots/home-desktop.png`; `docs/evidence/MF8/screenshots/home-mobile.png`. | A solução não copia literalmente o mockup; a diferença é aceite porque mantém hierarquia, contraste, CTAs e navegação pública curta. |
| Acessibilidade inicial | Foco, contraste, headings e navegação clara. | `SkipLink`, `main#conteudo-principal`, `:focus-visible` e navegação com `aria-label` estão presentes. | `PASS` | `docs/evidence/MF7/browser/mf7-keyboard-skip-link.png`; `real_dev/frontend/src/layouts/AppLayout.jsx`; `real_dev/frontend/src/styles/global.css`. | Se o foco deixar de ser visível, o gate deve voltar a `FAIL`. |

## Passos do BK

| Passo | pr | proof | neg | fonte | Decisão |
| --- | --- | --- | --- | --- | --- |
| 1. Comparar mockup e frontend real | `NAO_APLICAVEL`; entrega local sem PR. | Matriz "Comparação mockup vs frontend" com mockup, frontend e evidence MF7. | Diferença sem prova ou sem decisão não é aceite. | `BK-MF8-01`; `mockup/src/app/FAITHFLIX_INTERFACE_SPECS.md`; evidence MF7. | `PASS` |
| 2. Normalizar tokens visuais | `NAO_APLICAVEL`; sem alteração de código neste BK. | `tokens.css` concentra paleta, foco, raios, sombras, largura e espaçamento. | Valores soltos para cor/raio/espaço em páginas devem ser tratados como drift visual. | `RNF01`, `RNF02`, `RNF03`, `RNF04`, `RNF28`. | `PASS` |
| 3. Alinhar header e navegação | `NAO_APLICAVEL`; validação por evidence. | `AppHeader` filtra links por `visibility`/`roles`; screenshots MF7 cobrem visitante, user, moderator e admin. | Visitante/user comum com link admin visível volta a bloquear a MF. | `BK-MF7-02`; `BK-MF7-05`; `RNF01`, `RNF38`. | `PASS` |
| 4. Alinhar hero e home | `NAO_APLICAVEL`; validação por evidence. | Home pública desktop/mobile tem screenshots MF8 atualizados; `DiscoveryHomePage` mantém H1, CTAs, PT-PT, discovery curta e atalhos por formato. | Hero sem contraste, foco, CTA claro, com badge técnico de API ou com secções redundantes deve ser classificado como `FAIL`. | `BK-MF7-03`; `RNF01`, `RNF03`, `RNF04`, `RNF38`; `docs/evidence/MF8/screenshots/home-desktop.png`; `docs/evidence/MF8/screenshots/home-mobile.png`. | `PASS_COM_RISCOS` |
| 5. Registar evidence antes/depois | `NAO_APLICAVEL`; consolidação documental. | Estado inicial UI-01..UI-20 em `INVENTARIO-UI-MOCKUP.md`; estado pós-correção em gate MF7. | Screenshot sem rota, viewport ou perfil não conta como proof completo. | `docs/evidence/MF7/browser/mf7-browser-validation-results.json`. | `PASS` |
| 6. Validar critérios mensuráveis | `NAO_APLICAVEL`; validações em comandos finais da implementação. | Critérios ligados a RNF e ficheiros: tokens, header, home, skip link, PT-PT e responsividade. | Critério opinativo sem medida deve ser reescrito antes do freeze. | `RNF01`, `RNF02`, `RNF03`, `RNF04`, `RNF28`, `RNF38`. | `PASS_COM_RISCOS` |
| 7. Preparar handoff para parte II | `NAO_APLICAVEL`; esta secção é o handoff. | Lista abaixo separa decisões fechadas, ressalvas e rotas que passam para `BK-MF8-02`. | Handoff genérico sem rotas concretas bloqueia `BK-MF8-02`. | `BK-MF8-02`. | `PASS` |

## Critérios por RNF

| RNF | Critério | Estado | Prova |
| --- | --- | --- | --- |
| `RNF01` | Navegação principal clara entre início, catálogo, pesquisa, associações e planos. | `PASS` | `AppHeader.jsx`; screenshot mobile visitante. |
| `RNF02` | Links e botões têm hover, active, disabled e foco visível. | `PASS` | `global.css`; screenshot de skip link por teclado. |
| `RNF03` | Layout adapta-se a mobile, tablet e desktop sem sobreposição conhecida no gate. | `PASS_COM_RISCOS` | Screenshots MF8 da home desktop/mobile e screenshots representativos MF7 para perfis/rotas complementares. |
| `RNF04` | Contraste, headings, labels e skip link sustentam acessibilidade básica. | `PASS` | `AppLayout.jsx`; `global.css`; `mf7-keyboard-skip-link.png`. |
| `RNF28` | Frontend usa componentes reutilizáveis em layout, header, cards, estados e botões. | `PASS` | `AppHeader.jsx`, `ContentCard.jsx`, `EmptyState.jsx`, `BaseButton.jsx`. |
| `RNF38` | Interface visível está em português de Portugal por defeito. | `PASS_COM_RISCOS` | Evidence MF7 e textos principais em `DiscoveryHomePage.jsx`/`AppHeader.jsx`. |

## Decisões e ressalvas

- Decisão fechada: tokens, header, navegação por perfil, hero/home e foco inicial estão suficientemente consolidados para avançar.
- Ressalva aceite: a home real não replica literalmente a imagem de fundo do mockup; a diferença é aceite porque preserva identidade FaithFlix, contraste, CTAs e leitura.
- Atualização UX em 2026-07-08: a home pública foi encurtada para evitar duplicar o catálogo, mantendo hero, mais vistos, recentes e exploração por formato.
- Ressalva aceite: a home tem screenshots MF8 atualizados; screenshots MF7 continuam apenas como evidence representativa de navegação por perfil. A revisão humana final de UX continua recomendada antes da defesa.
- Blockers: nenhum blocker P0/P1 confirmado nesta parte.

## Handoff para BK-MF8-02

- Páginas/áreas a validar na parte II: `/catalogo`, `/pesquisa`, `/para-si`, `/biblioteca`, `/planos`, `/associacoes`, `/conta`.
- Componentes a reutilizar: `ContentCard`, `EmptyState`, `BaseButton`, `SearchFilters`, `DiscoveryCarousel`.
- Estados obrigatórios a confirmar: loading, erro, vazio, sucesso/lista, foco, formato PT-PT e formato europeu.
- Riscos a transportar: revisão humana final de UX e sweep mobile completo das restantes páginas.
- Owner do próximo passo: Matheus, com apoio de Mateus e Davi conforme `BK-MF8-02`.

## Resultado

`BK-MF8-01` fica `PASS_COM_RISCOS`: não há falha visual bloqueante confirmada, mas a decisão mantém a ressalva de revisão humana final antes da defesa.
