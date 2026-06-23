# Inventário UI vs mockup - MF7

## Metadados

- BK: BK-MF7-01
- Owner: Mateus
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