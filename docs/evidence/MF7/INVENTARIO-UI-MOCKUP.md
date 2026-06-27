<<<<<<< HEAD
# Inventário UI vs mockup - MF7
=======
# Inventario UI vs mockup - MF7
>>>>>>> dc94538 (Update: MF8)

## Metadados

- BK: BK-MF7-01
- Owner: Mateus
<<<<<<< HEAD
- Data: 2026-06-23
- Dependência validada: BK-MF6-06
- Decisão: EM_REVISAO

## Decisões de referência

- CANONICO: MF7 foca refinamento de UI e navegação segura.
- CANONICO: o mockup orienta aparência, fluxo e hierarquia visual.
- DERIVADO: problemas que expõem links admin a visitantes ou utilizadores comuns têm prioridade P0.

## Matriz de verificações

| ID | Área | Ficheiro provável | Observado | Esperado | Severidade | BK destino | Critério de fecho |
| --- | --- | --- | --- | --- | --- | --- | --- |
| UI-01 | Header público | frontend/src/components/layout/AppHeader.jsx | A preencher | Links públicos claros e sem ruído admin | P0 | BK-MF7-02 | Visitante não vê links admin |
| UI-02 | Sessão | frontend/src/context/SessionContext.jsx | A preencher | Estado anonymous/user/admin explícito | P0 | BK-MF7-02 | /api/session/me decide o perfil |
| UI-03 | Rotas admin | frontend/src/routes/AppRoutes.jsx | A preencher | Guard visual antes das páginas admin | P0 | BK-MF7-02 | User comum recebe bloqueio visual |
| UI-04 | Tokens | frontend/src/styles/tokens.css | A preencher | Paleta alinhada ao mockup | P1 | BK-MF7-03 | Cores base usam tokens nomeados |
| UI-05 | Header responsivo | frontend/src/styles/global.css | A preencher | Header não sobrepõe conteúdo em mobile | P1 | BK-MF7-03 | Viewport 390px sem overflow horizontal |
| UI-06 | Hero | frontend/src/pages/DiscoveryHomePage.jsx | A preencher | H1, badge, descrição e CTAs claros | P1 | BK-MF7-03 | Primeiro ecrã comunica produto |
| UI-07 | Focus visível | frontend/src/styles/global.css | A preencher | Foco por teclado visível | P1 | BK-MF7-03 | Tab mostra outline claro |
| UI-08 | Catálogo | frontend/src/pages/CatalogPage.jsx | A preencher | Cards com imagem, badge e metadados | P1 | BK-MF7-04 | Lista publicada é legível |
| UI-09 | Pesquisa | frontend/src/pages/SearchPage.jsx | A preencher | Resultados e vazio comunicam ação | P1 | BK-MF7-04 | Pesquisa sem resultados mostra orientação |
| UI-10 | Para si | frontend/src/pages/ForYouPage.jsx | A preencher | Cold start explicado sem prometer IA avançada | P1 | BK-MF7-04 | Estado vazio é honesto |
| UI-11 | Biblioteca | frontend/src/pages/MyLibraryPage.jsx | A preencher | Favoritos/watchlist/histórico usam estados úteis | P1 | BK-MF7-04 | Secções vazias explicam próximo passo |
| UI-12 | Planos | frontend/src/pages/SubscriptionPage.jsx | A preencher | Subscrição usa linguagem de simulação controlada | P1 | BK-MF7-04 | Estado de erro é claro |
| UI-13 | Associações | frontend/src/pages/PublicCharitiesPage.jsx | A preencher | Candidatura e histórico têm rótulos compreensíveis | P1 | BK-MF7-04 | Utilizador entende o fluxo solidário |
| UI-14 | Conta | frontend/src/pages/AccountPage.jsx | A preencher | Dados pessoais e privacidade separados | P1 | BK-MF7-04 | Secções não se confundem |
| UI-15 | PT-PT | frontend/src/pages | A preencher | Texto visível com acentuação correta | P1 | BK-MF7-04 | Não há mensagens sem acentos por descuido |
| UI-16 | Viewport mobile | frontend/src/styles/global.css | A preencher | Sem sobreposição em 390x844 | P0 | BK-MF7-05 | Screenshot ou descrição verificável |
| UI-17 | Viewport tablet | frontend/src/styles/global.css | A preencher | Grelhas mantêm hierarquia | P1 | BK-MF7-05 | Screenshot ou descrição verificável |
| UI-18 | Viewport desktop | frontend/src/styles/global.css | A preencher | Conteúdo não fica disperso | P1 | BK-MF7-05 | Screenshot ou descrição verificável |
| UI-19 | Teclado | frontend/src/components/a11y/SkipLink.jsx | A preencher | Skip link e foco funcionam | P0 | BK-MF7-05 | Tab chega ao conteúdo principal |
| UI-20 | Gate | docs/evidence/MF7/GATE-UI-NAVEGACAO-SEGURA.md | A preencher | Decisão GO/GO_COM_RESSALVAS/NO_GO | P0 | BK-MF7-05 | Gate assinado com negativos |

## Handoff para BK-MF7-02

- Riscos P0 de sessão/perfil:
- Links admin visíveis indevidamente:
- Rotas admin sem guarda visual:
- Negativos obrigatórios:

## Changelog

- 2026-06-23: ficheiro criado para inventário MF7.
=======
- Data: 2026-06-25
- Dependencia validada: BK-MF6-06
- Decisao: IMPLEMENTADO_SEM_VALIDACAO_TOTAL

## Decisoes de referencia

- CANONICO: MF7 foca refinamento de UI e navegacao segura.
- CANONICO: MF8 concentra evidencia final, defesa, buffer e fecho.
- CANONICO: o mockup orienta aparencia, fluxo, hierarquia e nomes visiveis; nao define endpoints, permissoes ou regras de negocio.
- DERIVADO: problemas que expõem links admin a visitantes ou utilizadores comuns têm prioridade P0 e entram primeiro em BK-MF7-02.
- DERIVADO: esta evidence usa caminhos publicados de aluno (`frontend/...`, `backend/...`, `docs/...`) para poder ser reutilizada na defesa PAP.

## Fontes revistas

- `docs/evidence/MF6/GATE-S12-MF6.md`
- `docs/planificacao/guias-bk/REESTRUTURACAO-MF7-MF8.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-01-inventario-ui-vs-mockup-plano-refinamento.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-02-navegacao-segura-por-sessao-e-perfil.md`
- `mockup/src/app/FAITHFLIX_INTERFACE_SPECS.md`
- `frontend/src/components/layout/AppHeader.jsx`
- `frontend/src/routes/AppRoutes.jsx`
- `frontend/src/layouts/AppLayout.jsx`
- `frontend/src/styles/tokens.css`
- `frontend/src/styles/global.css`
- `frontend/src/pages/DiscoveryHomePage.jsx`
- `frontend/src/pages/CatalogPage.jsx`
- `frontend/src/pages/SearchPage.jsx`
- `frontend/src/pages/ForYouPage.jsx`
- `frontend/src/pages/MyLibraryPage.jsx`
- `frontend/src/pages/SubscriptionPage.jsx`
- `frontend/src/pages/PublicCharitiesPage.jsx`
- `frontend/src/pages/AccountPage.jsx`
- `frontend/src/components/a11y/SkipLink.jsx`

## Matriz de verificacoes

Nota de leitura: a matriz abaixo e o snapshot inicial usado para orientar `BK-MF7-02` a `BK-MF7-05`. As linhas nao devem ser lidas como estado final da MF7 sem consultar a seccao `Estado pos-correcao` e o gate `docs/evidence/MF7/GATE-UI-NAVEGACAO-SEGURA.md`.

| ID | Area | Ficheiro provavel | Observado | Esperado | Severidade | BK destino | Criterio de fecho |
| --- | --- | --- | --- | --- | --- | --- | --- |
| UI-01 | Header publico | `frontend/src/components/layout/AppHeader.jsx` | A lista principal inclui `Admin catalogo`, `Admin utilizadores`, `Metricas` e `Integracoes` para qualquer estado de sessao. | Links publicos claros e sem ruido admin para visitantes e utilizadores comuns. | P0 | BK-MF7-02 | Visitante e utilizador comum nao veem links admin; admin autenticado ve apenas os links que lhe pertencem. |
| UI-02 | Sessao | `frontend/src/context/SessionContext.jsx` | Nao existe contexto partilhado de sessao no frontend; `authApi.me()` existe, mas nao alimenta header e rotas. | Estado `loading`, `anonymous` e `authenticated/admin` explicito a partir de `GET /api/session/me`. | P0 | BK-MF7-02 | `SessionProvider` envolve a app e nenhum componente inventa role no browser. |
| UI-03 | Rotas admin | `frontend/src/routes/AppRoutes.jsx` | Rotas `/admin/*` apontam diretamente para paginas admin, sem guarda visual. | Guarda visual antes das paginas admin, mantendo o backend como autoridade final. | P0 | BK-MF7-02 | Utilizador sem role admin recebe bloqueio visual antes de qualquer ecrã admin. |
| UI-04 | Tokens | `frontend/src/styles/tokens.css` | A paleta usa verde, bege e laranja do mockup, mas a base atual e dark-first e nao declara nomes equivalentes aos tokens do mockup. | Tokens nomeados e documentados para paleta, texto, superficies, foco e estados. | P1 | BK-MF7-03 | Tokens MF7 cobrem cores do mockup sem quebrar contraste nem regressar a valores soltos. |
| UI-05 | Header responsivo | `frontend/src/styles/global.css` | O header envolve em mobile e a nav faz scroll horizontal; o excesso de links admin aumenta ruido e carga visual. | Header responsivo sem sobreposicao e com navegacao reduzida ao perfil atual. | P1 | BK-MF7-03 | Viewport 390px nao tem overflow horizontal na pagina e mostra apenas links relevantes. |
| UI-06 | Hero | `frontend/src/pages/DiscoveryHomePage.jsx` | O primeiro ecrã usa H1 `FaithFlix` e CTAs simples, mas nao tem imagem/ambiente do mockup e contem texto sem acentos. | Primeiro ecrã comunica produto, proposta de valor, CTAs e linguagem PT-PT cuidada. | P1 | BK-MF7-03 | Hero tem hierarquia clara, texto PT-PT e CTAs alinhados ao objetivo visual. |
| UI-07 | Focus visivel | `frontend/src/styles/global.css` | Existe `:focus-visible` com outline forte e `SkipLink` fica visivel ao foco. | Foco por teclado visivel em links, botoes e salto para conteudo. | P1 | BK-MF7-05 | Validacao por teclado confirma foco visivel sem prender o utilizador. |
| UI-08 | Catalogo | `frontend/src/pages/CatalogPage.jsx` | Cards apresentam imagem, tipo, titulo, sinopse e CTA; faltam metadados visuais como rating/ano/duracao do mockup. | Cards com imagem, badge e metadados suficientes para escolha rapida. | P1 | BK-MF7-04 | Catalogo publicado fica legivel e aproxima-se da hierarquia de card definida no mockup. |
| UI-09 | Pesquisa | `frontend/src/pages/SearchPage.jsx` | Pesquisa tem filtros, loading, erro, total e vazio; o vazio nao sugere acao seguinte ou limpeza de filtros. | Resultados e vazio devem orientar a acao seguinte. | P1 | BK-MF7-04 | Pesquisa sem resultados mostra orientacao clara para ajustar termos/filtros. |
| UI-10 | Para si | `frontend/src/pages/ForYouPage.jsx` | Cold start explica que usa sugestoes gerais e nao promete IA avancada. | Recomendaçao baseline honesta, explicavel e sem claims opacos. | P1 | BK-MF7-04 | Estado cold start preserva explicabilidade e nao menciona IA generativa/RAG/embeddings. |
| UI-11 | Biblioteca | `frontend/src/pages/MyLibraryPage.jsx` | Favoritos, watchlist e historico existem, mas o vazio usa apenas `Sem itens.` e ha texto sem acento em `Historico`. | Estados vazios especificos por secção e texto PT-PT cuidado. | P1 | BK-MF7-04 | Cada secção explica o proximo passo, por exemplo procurar catalogo ou adicionar a watchlist. |
| UI-12 | Planos | `frontend/src/pages/SubscriptionPage.jsx` | Fluxo deixa claro que o pagamento e simulado, mas o preço usa ponto decimal por `toFixed(2)`. | Linguagem de simulaçao controlada e formatos europeus quando visiveis. | P1 | BK-MF7-04 | Preços usam `pt-PT`/EUR ou formato europeu equivalente e mantêm a nota de simulacao. |
| UI-13 | Associacoes | `frontend/src/pages/PublicCharitiesPage.jsx` | Pagina publica mostra candidatura e lista associaçoes, mas expõe link `Historico privado` em cards publicos. | Fluxo solidario compreensivel sem sugerir acesso privado a visitantes. | P1 | BK-MF7-04 | Link privado fica condicionado a sessao/perfil ou explicado com bloqueio claro. |
| UI-14 | Conta | `frontend/src/pages/AccountPage.jsx` | Conta separa perfil, parental e privacidade; mostra `Role` cru e tem texto sem acento em `indisponivel`. | Dados pessoais e privacidade separados, com linguagem acessivel ao utilizador final. | P1 | BK-MF7-04 | Role tecnica deixa de ser exposta como detalhe bruto ou fica traduzida para PT-PT. |
| UI-15 | PT-PT | `frontend/src/pages` | Ha varias strings sem acentos: `cristao`, `Catalogo`, `comentarios`, `recomendacao`, `Historico`, `indisponivel`. | Interface totalmente em portugues de Portugal por defeito. | P1 | BK-MF7-04 | Pesquisa textual nao encontra strings visiveis sem acentos por descuido. |
| UI-16 | Viewport mobile | `frontend/src/styles/global.css` | CSS tem media queries e scroll horizontal na nav; sem screenshot nesta execucao. | Sem sobreposicao em 390x844 e sem esconder conteudo essencial. | P0 | BK-MF7-05 | Gate MF7 inclui screenshot ou verificacao objetiva a 390x844. |
| UI-17 | Viewport tablet | `frontend/src/styles/global.css` | Grelhas usam `auto-fit` e hero passa para uma coluna abaixo de 860px. | Tablet mantem hierarquia e leitura sem quebras grandes. | P1 | BK-MF7-05 | Gate MF7 inclui verificacao tablet com header, hero e cards visiveis. |
| UI-18 | Viewport desktop | `frontend/src/styles/global.css` | Conteudo esta limitado a `1180px`; hero e cards ficam organizados, mas o hero nao usa imagem de fundo como o mockup. | Desktop deve parecer produto de streaming e nao apenas dashboard tecnico. | P1 | BK-MF7-03 | Hero/header desktop comunicam identidade visual FaithFlix e deixam a pagina respiravel. |
| UI-19 | Teclado | `frontend/src/components/a11y/SkipLink.jsx` | `SkipLink` aponta para `#conteudo-principal` e o `main` tem `tabIndex={-1}`. | Tab chega ao link de salto e Enter move foco para o conteudo principal. | P0 | BK-MF7-05 | Teste manual ou automatizado confirma fluxo de teclado. |
| UI-20 | Gate | `docs/evidence/MF7/GATE-UI-NAVEGACAO-SEGURA.md` | Gate MF7 ainda nao existe, como esperado antes dos BK-MF7-02..05. | Decisao GO/GO_COM_RESSALVAS/NO_GO apos navegacao segura, visual, paginas e responsividade. | P0 | BK-MF7-05 | Gate criado com negativos de visitante, utilizador comum, mobile e teclado. |

## Estado pos-correcao

Este bloco fecha a leitura do inventario inicial apos a implementacao/correcao da MF7. A fonte final do estado de gate e `docs/evidence/MF7/GATE-UI-NAVEGACAO-SEGURA.md`.

| Referencia | Estado pos-correcao | Prova |
| --- | --- | --- |
| `UI-01` | Fechado: visitante e user comum nao veem links admin; admin ve links esperados. | `docs/evidence/MF7/NAVEGACAO-SEGURA-POR-PERFIL.md`; `docs/evidence/MF7/browser/mf7-mobile-390-anonymous-home.png`; `docs/evidence/MF7/browser/mf7-desktop-1440-admin-home.png` |
| `UI-02` | Fechado: `SessionProvider` centraliza `authApi.me()` e expõe estado de sessao/role. | `docs/evidence/MF7/NAVEGACAO-SEGURA-POR-PERFIL.md`; `frontend/src/context/SessionContext.jsx` auditado no relatorio tecnico. |
| `UI-03` | Fechado: todas as rotas `/admin/*` passam por `AdminRoute`. | `docs/evidence/MF7/NAVEGACAO-SEGURA-POR-PERFIL.md`; `docs/evidence/MF7/browser/mf7-tablet-768-user-admin-denied.png` |
| `UI-16` | Fechado com prova representativa: viewport 390x844 validado em browser com visitante. | `docs/evidence/MF7/browser/mf7-mobile-390-anonymous-home.png`; `docs/evidence/MF7/browser/mf7-browser-validation-results.json` |
| `UI-17` | Fechado com prova representativa: viewport 768x900 validado em browser com user comum em rota admin bloqueada. | `docs/evidence/MF7/browser/mf7-tablet-768-user-admin-denied.png`; `docs/evidence/MF7/browser/mf7-browser-validation-results.json` |
| `UI-18` | Fechado com prova representativa: desktop 1366x900 e 1440x900 validado com moderator/admin. | `docs/evidence/MF7/browser/mf7-desktop-1366-moderator-catalog.png`; `docs/evidence/MF7/browser/mf7-desktop-1440-admin-home.png` |
| `UI-19` | Fechado com prova automatizada: `Tab` foca o `SkipLink` e `Enter` move foco para `main#conteudo-principal`. | `docs/evidence/MF7/browser/mf7-keyboard-skip-link.png`; `docs/evidence/MF7/browser/mf7-browser-validation-results.json` |
| `UI-20` | Fechado: gate criado com decisao `GO_COM_RESSALVAS`. | `docs/evidence/MF7/GATE-UI-NAVEGACAO-SEGURA.md` |

Decisao operacional apos correcao: `PASS_COM_RISCOS`. Nao existem P0/P1/P2 abertos; a ressalva restante e revisao humana final de UX antes da defesa.

## Handoff para BK-MF7-02

### Riscos P0 de sessao/perfil

- UI-01: links admin aparecem no header sem depender de sessao.
- UI-02: falta um `SessionContext` partilhado, apesar de existir `authApi.me()`.
- UI-03: rotas `/admin/*` ainda nao passam por guarda visual.
- UI-16: no mobile, a nav horizontal expõe ainda mais ruido quando os links admin aparecem a todos.

### Links admin visiveis indevidamente

- `/admin/catalogo`
- `/admin/utilizadores`
- `/admin/metricas`
- `/admin/integracoes`

### Rotas admin sem guarda visual

- `/admin/catalogo`
- `/admin/utilizadores`
- `/admin/metricas`
- `/admin/integracoes`
- `/admin/charity-applications`
- `/admin/pool/distribution`
- `/admin/pool/dashboard`
- `/admin/charity-members`

### Negativos obrigatorios para BK-MF7-02

- Visitante nao autenticado nao deve ver links admin no header.
- Visitante que abre `/admin/metricas` deve receber bloqueio visual e o backend deve continuar a devolver `401` em chamadas protegidas.
- Utilizador autenticado comum nao deve ver links admin e deve receber bloqueio visual ao tentar rota admin direta.
- Admin autenticado deve continuar a conseguir navegar para areas admin permitidas.

## Handoff para BK-MF7-03

- UI-04: alinhar tokens com a paleta do mockup sem sacrificar contraste.
- UI-05: reduzir ruido do header depois de aplicada a filtragem por perfil.
- UI-06 e UI-18: melhorar hero, linguagem, CTAs e identidade visual.

## Handoff para BK-MF7-04

- UI-08: enriquecer cards do catalogo com metadados uteis.
- UI-09: orientar melhor pesquisa sem resultados.
- UI-11: trocar `Sem itens.` por vazios especificos.
- UI-12: formatar preços em PT-PT.
- UI-13: rever link `Historico privado` em pagina publica.
- UI-14 e UI-15: limpar texto técnico e strings sem acentos.

## Handoff para BK-MF7-05

- Validar 390x844, tablet e desktop com evidência objetiva.
- Confirmar fluxo de teclado com `SkipLink`.
- Criar `docs/evidence/MF7/GATE-UI-NAVEGACAO-SEGURA.md`.
- A decisão do gate deve ficar `NO_GO` se UI-01, UI-02 ou UI-03 não forem corrigidos.

## Provas e negativos desta evidence

- `pr`: entrega local sem commit/PR, conforme execução sem commits.
- `proof`: matriz `UI-01..UI-20` preenchida com fonte, observado, esperado, severidade, BK destino e criterio de fecho.
- `neg`: riscos P0 de visitante/utilizador comum com admin visivel foram separados e encaminhados para BK-MF7-02.
- `fonte`: reestruturaçao MF7/MF8, BK-MF7-01, BK-MF7-02, mockup e componentes/paginas frontend.

## Changelog

- 2026-06-25: inventario preenchido para BK-MF7-01 com 20 verificacoes e handoff para BK-MF7-02..05.
- 2026-06-25: acrescentado `Estado pos-correcao` para distinguir snapshot inicial do estado usado pelo gate MF7.
>>>>>>> dc94538 (Update: MF8)
