# Auditoria UI/UX da área administrativa — FaithFlix

- `document_status`: `CURRENT`
- `snapshot_date`: `-`
- `implementation_lane`: `REFERENCE`
- `current_authority`: `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-END-TO-END-real_dev.md`
- `proof_scope`: remediação e revalidação local do backoffice em `real_dev`; não prova produção, DB externa, browsers branded ou dispositivos físicos

- Data: 2026-07-12
- Implementação auditada: `real_dev/frontend` e contratos de autorização em `real_dev/backend`
- Âmbito: auditoria, remediação integral e revalidação
- Evidência de partida: screenshot fornecido pelo utilizador e validação local autenticada
- Decisão UX após remediação: `APROVADO_PARA_UTILIZACAO_ADMIN_REGULAR`
- Segurança funcional observada: `APROVADO_SEM_ALARGAR_PRIVILEGIOS`

## 0. Fecho da remediação — 2026-07-12

Os findings desta auditoria foram corrigidos em `real_dev` e revalidados. As
secções 1–10 permanecem abaixo como baseline histórica do estado anterior à
correção; esta secção é a decisão operacional atual e substitui a decisão final
original.

### Resultado por finding

| Finding | Estado | Evidência de correção |
| --- | --- | --- |
| `ADM-UX-001` | Fechado | `AppLayout` e `AdminLayout` separados; rotas admin sem header/footer públicos. |
| `ADM-UX-002` | Fechado | Landing centralizada: admin em `/admin`, moderator em `/admin/catalogo`, com precedência de `next` interno seguro. |
| `ADM-UX-003` | Fechado | Sidebar desktop e drawer a `<=1024px`; nenhum controlo fora do viewport na matriz 320–2048 px. |
| `ADM-UX-004` | Fechado | Drawer modal com scroll próprio; topbar manteve 68 px em todos os breakpoints medidos. |
| `ADM-A11Y-001` | Fechado | Componente de sessão próprio, contraste AA, foco, loading e erro. |
| `ADM-UX-005` | Fechado | Dashboard `/admin` com oito KPIs, bloco “Requer atenção”, atalhos, período e geração. |
| `ADM-UX-006` | Fechado | Revisão detalhada de candidatura, filtros por estado e motivo de rejeição editável de 10–500 caracteres. |
| `ADM-UX-007` | Fechado | Preview financeira sem escrita, token SHA-256 e commit com `409 POOL_PREVIEW_STALE`. |
| `ADM-UX-008` | Fechado | Navegação agrupada por Visão geral, Conteúdo, Utilizadores, Solidariedade e Operação, com breadcrumb. |
| `ADM-UX-009` | Fechado | Catálogo e passagens têm entradas list-first, pesquisa, filtros, paginação e rotas dedicadas de criação/edição. |
| `ADM-UX-010` | Fechado | Membership usa autocompletes canceláveis por nome/email; o comando continua a enviar apenas IDs. |
| `ADM-UX-011` | Fechado | Componentes administrativos comuns, badges, estados, diálogos nativos e linguagem PT-PT normalizada. |
| `ADM-UX-012` | Fechado | Métricas detalhadas agrupadas por domínio, incluindo família, período, geração e CSV. |
| `ADM-UX-013` | Fechado | Cada integração usa draft local, “Alterações por guardar”, Guardar/Cancelar e diálogo de diff. |
| `ADM-QA-001` | Fechado | Matriz por role, testes de drawer/diálogos, Axe admin e medições 320–2048 px. |
| `ADM-QA-002` | Fechado | Esta revalidação cobre arquitetura de informação e UX humana, além das guardas de segurança anteriores. |

### Contratos backend entregues

- métricas agregadas retrocompatíveis para catálogo, solidariedade, integrações e família;
- filtros literais, paginados e validados em catálogo e passagens;
- lookup de associações limitado a `{id, name}` e a entidades ativas/elegíveis;
- memberships enriquecidas apenas com resumos seguros de utilizador e associação;
- preview da pool sem escrita/audit, token canónico SHA-256 e commit HTTP obrigado
  a apresentar token atual;
- worker e chamadas internas preservados sem obrigação de token;
- audit log criado apenas no commit efetivo.

### Validação executada

| Gate | Resultado |
| --- | --- |
| Backend unitário | `310/310` testes passaram. |
| Backend integração HTTP | `33/33` testes passaram fora do sandbox restritivo. |
| Backend completo | `362/362` testes unitários, integração, regressão e smoke passaram. |
| Frontend unitário | `61` ficheiros, `286/286` testes passaram. |
| Lint frontend | Passou com zero warnings. |
| Build frontend | Passou. Permanecem apenas warnings preexistentes de chunks `dashjs`/`hls`. |
| Contratos | `6` root + `15` backend + `31` frontend passaram. |
| Segurança | `12/12` testes e baseline MF6 passaram. |
| Axe/reflow | `28/28` cenários passaram, incluindo dashboard desktop/mobile, drawer aberto e catálogo a 320 px. |
| E2E demo read-only | `4/4` cenários passaram, incluindo todas as rotas administrativas. |
| Browser manual | Sem overflow, coordenadas negativas ou recorte em `2048`, `1440`, `1280`, `1025`, `1024`, `901`, `900`, `768`, `390` e `320` px. |

### Decisão atual

`APROVADO`. O backoffice está separado da experiência pública, as ações críticas
usam confirmação acessível e a distribuição financeira exige uma preview válida.
A política escolhida mantém o acesso técnico da staff às páginas públicas através
de um único context switch, sem criar restrições artificiais no backend.

## 1. Resumo executivo

A reação ao primeiro acesso é justificada. O problema não é apenas o tamanho do
menu: a aplicação usa o mesmo shell para visitantes, consumidores, moderadores e
administradores. Uma sessão `admin` recebe 19 controlos na navegação principal:
cinco páginas públicas, quatro páginas pessoais, nove páginas administrativas e
logout.

O efeito atual é simultaneamente visual, cognitivo, operacional e acessível:

- o login administrativo termina na home pública;
- não existe uma rota `/admin` nem um dashboard global;
- o logo administrativo aponta para a home pública;
- as nove áreas internas aparecem numa lista plana, misturadas com catálogo,
  planos, biblioteca, notificações e conta;
- o footer público também aparece em todas as páginas administrativas;
- em desktop existem opções recortadas e inacessíveis visualmente;
- em mobile/tablet o menu aberto ocupa praticamente o viewport inteiro;
- o botão `Sair` tem contraste medido de apenas `1.08:1`.

A recomendação é criar uma experiência administrativa própria, com `AdminLayout`,
rota `/admin`, landing por role, sidebar agrupada e um único atalho explícito
`Ver site público`. Não se recomenda tentar acomodar mais itens na barra atual.

## 2. O que está bem construído

A auditoria não conclui que toda a área admin deva ser reescrita. A base funcional
tem vários pontos positivos que devem ser preservados:

- as rotas administrativas no frontend usam `AdminRoute`;
- o backend usa `requireRole`, mantendo a autorização fora do browser;
- catálogo e passagens bíblicas distinguem `admin`/`moderator` das restantes
  operações exclusivas de `admin`;
- o redirect de autenticação valida destinos internos e evita open redirect;
- existem skip link, foco no `main` ao mudar de página e títulos de documento;
- várias leituras são canceláveis e distinguem loading, erro, empty state e retry;
- mutações sensíveis têm busy state e confirmação;
- utilizadores, candidaturas e catálogo têm paginação;
- valores monetários usam EUR e formatação `pt-PT`;
- o backend possui audit log administrativo e protege o último admin ativo.

O maior défice está na arquitetura de informação e na camada de apresentação, não
na existência das operações nem na fronteira base de RBAC.

## 3. Evidência objetiva recolhida

### 3.1 Navegação e landing

- `AppHeader.jsx` declara 5 links públicos, 4 autenticados e 9 administrativos.
- `canShowNavItem()` torna os links `public` visíveis para qualquer sessão.
- `AuthForms.jsx` usa `/` como destino por omissão após login ou registo.
- `AnonymousRoute.jsx` também redireciona qualquer sessão autenticada para `/`.
- `AppRoutes.jsx` não declara `/admin`; só existem subrotas administrativas.
- `AppLayout.jsx` aplica o mesmo header e footer a todas as rotas.

### 3.2 Medições no browser

| Cenário | Resultado observado |
| --- | --- |
| Login com admin, sem `next` | Terminou em `/`, na home pública. |
| Admin autenticado | 19 itens/controlos na navegação principal. |
| Viewport `2048x900` | Header com ~121 px; `Início` e `Catálogo` ficaram recortados à esquerda. |
| Viewport `901x720` | Botão de menu ainda oculto; 12 opções ficaram recortadas à esquerda. |
| Viewport `900x720` | Menu vertical ativo; header com 704 px, nav visível com 636 px e conteúdo interno com 924 px de altura. |
| Logout em desktop | Texto `rgb(103,103,103)` sobre fundo `rgb(94,114,89)`: contraste `1.08:1`. |

O recorte não é detetado por um teste que compare apenas
`document.scrollWidth <= viewportWidth`: o conteúdo é empurrado para coordenadas
negativas por `justify-content: flex-end`, enquanto o contentor continua a reportar
largura normal.

### 3.3 Densidade das páginas

Com os dados demo carregados:

| Página | Estrutura observada |
| --- | --- |
| Catálogo | 2 formulários, 12 artigos e 67 botões; o formulário de criação aparece antes da listagem. |
| Passagens bíblicas | 2 formulários, 16 artigos e 68 botões. |
| Utilizadores | Filtros, tabela e paginação; estrutura mais adequada ao tipo de tarefa. |
| Métricas | 12 cartões agregados e filtro temporal; é uma página analítica, não um dashboard global. |
| Integrações | 3 cartões com alteração imediata por switch/select. |
| Candidaturas | 20 cartões e 42 botões; apresenta apenas nome e missão antes da decisão. |
| Distribuição | Formulário de mês e comando de execução, sem pré-visualização anterior ao fecho. |
| Painel da pool | 12 cartões mensais em lista, sem resumo global ou tendência. |
| Membros de associações | Formulário baseado em IDs técnicos de utilizador e associação. |

## 4. Findings priorizados

### P1 — alto impacto

#### ADM-UX-001 — Experiência pública e administrativa estão fundidas

O admin é tratado simultaneamente como consumidor e operador. Não existe uma
fronteira visual clara entre “usar a FaithFlix” e “administrar a FaithFlix”. Isto
explica o menu gigante, reduz confiança e aumenta o risco de escolher a ação
errada.

Recomendação: criar `AdminLayout` e navegação administrativa dedicada. O acesso ao
site público deve existir apenas como ação explícita, preferencialmente
`Ver site público`, separada da navegação operacional.

#### ADM-UX-002 — Pós-login e logo levam o admin para o contexto errado

O destino por omissão é sempre `/`; o logo também aponta para `/`. Um admin entra
ou tenta regressar ao início e recebe a experiência de streaming.

Recomendação:

- `admin` -> `/admin`;
- `moderator` -> `/admin` ou `/admin/catalogo`, conforme a composição final do dashboard;
- utilizador comum -> destino pessoal definido pelo produto;
- preservar um `next` seguro e autorizado quando o login foi provocado por uma
  rota concreta.

#### ADM-UX-003 — A navegação perde itens em desktop/tablet

Há opções recortadas até em `2048px`. A `901px`, doze opções ficam fora do ecrã e
o menu colapsado ainda não está disponível. O problema é agravado por
`justify-content: flex-end` num contentor com muitos itens e overflow horizontal.

Recomendação: não corrigir apenas com outro breakpoint. A lista plana deve ser
substituída por grupos numa sidebar/drawer. Como hotfix, nenhum item pode ocupar
coordenadas negativas e o overflow deve ser realmente navegável.

#### ADM-UX-004 — Menu móvel ocupa quase todo o viewport

A `900x720`, o menu aberto faz o header crescer para 704 px e ainda exige scroll
interno. O conteúdo da página fica praticamente invisível.

Recomendação: drawer/overlay administrativo com grupos colapsáveis, scroll próprio
e header fixo compacto; fechar após navegação, com Escape e restituição do foco.

#### ADM-A11Y-001 — Logout visualmente ilegível

O botão herda simultaneamente o fundo global de `button` e a cor muted de
`.nav-link`. O contraste medido é `1.08:1`, muito abaixo de `4.5:1` para texto
normal.

Recomendação: componente de ação de sessão específico, com contraste AA, estados
hover/focus/disabled e texto sempre visível.

#### ADM-UX-005 — Não existe dashboard administrativo global

`/admin/pool/dashboard` é apenas o histórico da pool. `/admin/metricas` mostra
agregados úteis, mas não reúne prioridades, tarefas pendentes, saúde operacional e
atalhos.

Recomendação: criar `/admin` como overview operacional. Reutilizar primeiro os
agregados já existentes e acrescentar apenas endpoints agregados mínimos para
filas que ainda não têm contagem segura.

#### ADM-UX-006 — Decisão de candidaturas é insuficientemente informada

A candidatura pública recolhe contacto, email, telefone, missão e website, mas o
admin vê apenas nome e missão. A rejeição aplica sempre a razão fixa
`Não cumpre os critérios mínimos da pool.` sem permitir justificá-la.

Impacto: decisão irreversível com contexto insuficiente e registo potencialmente
impreciso.

Recomendação: detalhe completo da candidatura, resumo de critérios, modal de
decisão com consequência explícita e razão obrigatória/configurável para rejeição.

#### ADM-UX-007 — Distribuição financeira sem passo de revisão

O fecho mensal é iniciado por mês e uma confirmação nativa. Não existe um passo de
pré-visualização com total, associações elegíveis, distribuição esperada e
eventuais avisos antes do commit.

Recomendação: fluxo em dois passos `Pré-visualizar` -> `Confirmar distribuição`,
mantendo o backend como autoridade e a operação auditável.

### P2 — impacto médio

#### ADM-UX-008 — Arquitetura de informação plana e sem localização interna

As nove operações aparecem ao mesmo nível. Não existem grupos, breadcrumbs ou
navegação local consistente. `Painel da pool` e `Distribuir pool` estão separados
de candidaturas e membros, apesar de pertencerem ao mesmo domínio.

Recomendação: agrupar por tarefa/domínio, não por ordem de implementação.

#### ADM-UX-009 — Catálogo e passagens priorizam criação em vez de gestão

O catálogo abre com um formulário muito longo. A listagem, que tende a ser a
tarefa recorrente, surge depois de criação e taxonomias. Não existe pesquisa ou
filtro visível na gestão de catálogo, apesar das várias páginas de resultados.

Recomendação: landing com pesquisa, filtros, estados editoriais, tabela/lista e
ação primária `Novo conteúdo`. A criação/edição deve ter página ou painel próprio.
Aplicar o mesmo padrão às passagens bíblicas.

#### ADM-UX-010 — Membership exige IDs internos

O formulário pede `ID da associação` e `ID do utilizador`. Isto obriga o operador
a procurar/copiar identificadores técnicos e facilita erros.

Recomendação: pesquisa/autocomplete por nome e email, mostrando o ID apenas como
metadata secundária; confirmação final com nomes humanos.

#### ADM-UX-011 — Componentes e linguagem administrativa são inconsistentes

Algumas páginas têm kicker `Administração`; as duas páginas da pool não. Há
mistura de cartões, tabelas, formulários soltos, confirmações nativas e termos como
`metadata`, `progressive`, `legacy` e meses `YYYY-MM` sem apresentação humana.

Recomendação: sistema mínimo de componentes administrativos: `AdminPageHeader`,
`DataTable`, `FilterBar`, `StatusBadge`, `ConfirmDialog`, `EmptyState`,
`Pagination` e `FormSection`, com linguagem PT-PT orientada à tarefa.

#### ADM-UX-012 — Métricas não destacam significado ou prioridade

Os cartões mostram totais, mas não o intervalo efetivamente aplicado, momento de
geração, comparação ou ação associada. Métricas de família que já existem no
backend não são apresentadas.

Recomendação: manter `/admin/metricas` como exploração detalhada e usar no
dashboard apenas 6–8 sinais acionáveis, com rótulo de período e links para a área
relevante.

#### ADM-UX-013 — Alterações de integrações são imediatas e pouco explícitas

Switch e select persistem logo após cada mudança, mediante `confirm()`. Não há
modo de rever um conjunto de alterações nem um resumo claro do impacto.

Recomendação: ou assumir explicitamente o padrão “alteração imediata” com estado
e feedback fortes, ou usar edição + guardar. Evitar um meio-termo dependente de
confirmações nativas.

### P3 — melhoria e cobertura

#### ADM-QA-001 — Testes atuais não representam a UX de admin

Os 13 testes focados de header/auth/router passaram, mas:

- `AppHeader.test.jsx` usa uma sessão autenticada sem roles administrativas;
- não valida quantidade, agrupamento, recorte ou contraste;
- `AuthForms.test.jsx` confirma explicitamente `/` como default;
- a matriz Axe cobre apenas `/admin/utilizadores` e `/admin/catalogo` a `390px`;
- os testes visuais MF8 cobrem páginas públicas, não o shell admin;
- o teste de overflow ao nível do documento não deteta elementos em coordenadas
  negativas dentro do header.

Recomendação: matriz administrativa em `2048`, `1440`, `1280`, `901`, `900`,
`768`, `390` e reflow equivalente a 200%, incluindo itens totalmente visíveis,
contraste, foco, drawer e landing por role.

#### ADM-QA-002 — Relatórios anteriores fecharam segurança de navegação, não a IA

Evidence anterior confirma guardas, skip link, PT-PT e ausência de overflow global,
mas não estabelece que o modelo de navegação seja adequado a 19 opções nem que os
itens estejam visíveis. Esta auditoria deve ser tratada como uma camada nova de
UX humana e arquitetura de informação.

## 5. Arquitetura recomendada

```text
Administração
├── Visão geral
├── Conteúdo
│   ├── Catálogo
│   └── Passagens bíblicas
├── Utilizadores
├── Solidariedade
│   ├── Candidaturas
│   ├── Membros de associações
│   ├── Distribuição mensal
│   └── Histórico da pool
└── Operação
    ├── Métricas
    └── Integrações

Rodapé da sidebar
├── Ver site público
├── Conta administrativa
└── Sair
```

### Comportamento por role

| Role | Landing | Navegação interna |
| --- | --- | --- |
| `admin` | `/admin` | Todas as áreas administrativas. |
| `moderator` | `/admin` ou `/admin/catalogo` | Conteúdo e passagens bíblicas. |
| utilizador comum | área pessoal definida pelo produto | Sem navegação admin. |
| anónimo | `/` | Navegação pública. |

### Shell

- Desktop: sidebar persistente, topbar compacta, título/breadcrumb e área de conta.
- Mobile/tablet: drawer sobreposto; não empurrar o conteúdo para baixo.
- Sem footer de marketing nas rotas `/admin/*`.
- Logo administrativo aponta para `/admin`.
- `Ver site público` é um context switch explícito, não nove links públicos.

## 6. Conteúdo recomendado para `/admin`

### Primeira versão, reutilizando contratos atuais

- utilizadores ativos e bloqueados;
- conteúdos publicados;
- subscrições ativas/trial;
- pedidos de eliminação;
- associações elegíveis;
- valor distribuído no período;
- estado das integrações;
- atalhos para catálogo, utilizadores, candidaturas e distribuição.

### Segunda versão, com agregados mínimos adicionais

- candidaturas pendentes;
- conteúdos em rascunho ou com media pendente;
- convites familiares pendentes, se operacionalmente relevante;
- integrações inválidas/desativadas;
- atividade administrativa recente, apenas se for criado um endpoint de leitura
  sanitizado sobre o audit log.

Não se deve carregar listas completas apenas para obter contagens do dashboard.

## 7. Separação visual versus autorização real

Ocultar o catálogo público do menu do admin resolve UX, não segurança. As páginas
públicas continuarão naturalmente acessíveis por URL. Além disso, os endpoints de
biblioteca, playback, ratings, subscrições, notificações e privacidade usam
`requireAuth`, pelo que hoje também aceitam uma sessão `admin`.

Existem duas políticas possíveis:

1. **Admin como operador com capacidade de preview** — recomendada para este
   produto: shell administrativo por omissão, um único `Ver site público` e
   acesso técnico às páginas públicas quando necessário.
2. **Conta staff estritamente não consumidora** — exige política de backend e
   modelo de permissões/capabilities; não pode ser implementada apenas escondendo
   links ou bloqueando rotas React.

Pelo pedido atual, recomenda-se a primeira política, com a experiência pública
fora da navegação principal do admin.

## 8. Plano de correção recomendado

### Fase A — correções imediatas

1. Corrigir contraste de `Sair`.
2. Remover o recorte desktop e cobrir o breakpoint `901px`.
3. Tornar o destino pós-login dependente da role.
4. Introduzir `/admin`, mesmo que inicialmente encaminhe para uma overview simples.
5. Adicionar testes de sessão admin ao header e ao redirect.

### Fase B — fundação administrativa

1. Criar `AdminLayout` separado de `AppLayout`.
2. Implementar sidebar/drawer agrupada por domínio.
3. Criar dashboard com métricas atuais e atalhos.
4. Manter `AdminRoute` e RBAC backend como autoridade.
5. Remover header/footer públicos das rotas admin.

### Fase C — fluxos operacionais

1. Reestruturar catálogo e passagens para list-first.
2. Melhorar detalhe/decisão de candidaturas.
3. Introduzir preview da distribuição.
4. Substituir IDs de membership por pesquisa humana.
5. Normalizar componentes, confirmação e linguagem.

### Fase D — validação

1. Testes unitários de matriz role -> landing -> navegação.
2. Testes responsivos nos breakpoints administrativos.
3. Axe com menu aberto e ações visíveis.
4. Teste de teclado completo: skip link, sidebar/drawer, Escape e foco.
5. E2E read-only de todas as rotas admin e E2E controlado das mutações críticas.

## 9. Critérios de aceitação

- Admin sem `next` entra em `/admin`.
- Moderator entra na área editorial permitida.
- Nenhuma rota admin apresenta a navegação pública completa.
- Existe apenas um context switch claro para o site público.
- Todas as opções de navegação ficam visíveis e alcançáveis entre 320 e 2048 px.
- O menu móvel não aumenta o header até ocupar praticamente o viewport.
- Contraste de texto normal cumpre pelo menos `4.5:1`.
- `Sair` é visível, focável e tem feedback de loading/erro.
- O logo admin regressa ao dashboard admin.
- A sidebar mostra apenas áreas autorizadas pela role.
- Candidaturas mostram os dados necessários e uma razão real de rejeição.
- A distribuição apresenta pré-visualização antes do commit.
- Membership é selecionável por entidades humanas, não apenas IDs.
- Não existe regressão nas guardas frontend nem no `requireRole` backend.
- A matriz automatizada cobre admin em desktop, tablet, mobile e reflow.

## 10. Decisão final

A área administrativa está funcional e protegida em vários contratos importantes,
mas não oferece ainda uma experiência administrativa coerente. O estado atual é
adequado como conjunto de páginas técnicas de referência, não como backoffice de
utilização regular.

Prioridade recomendada: separar o shell e o landing antes de polir páginas
individuais. Isso resolve a causa do “menu gigante”, cria orientação por role e
permite melhorar cada domínio sem continuar a aumentar uma barra global já
saturada.
