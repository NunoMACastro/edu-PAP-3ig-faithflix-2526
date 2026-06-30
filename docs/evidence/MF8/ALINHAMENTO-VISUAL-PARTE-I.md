<<<<<<< HEAD
# MF8 - Alinhamento Visual Parte I
Referência: BK-MF8-01  
Data: 2026-06-29  
Estado global: INCOMPLETO (dependente de execução de inspeção real do frontend + mockups)

---

# Passo 1 - Comparar mockup e frontend real

## Objetivo
Comparar ecrãs do mockup com o frontend real e registar diferenças visuais com prova.

## Tabela de alinhamento

| Ecrã | Mockup | Frontend | Diferença | Decisão | Prioridade | Prova |
|------|--------|-----------|------------|----------|-------------|--------|
| Header | NÃO VERIFICADO | NÃO VERIFICADO | Não inspecionado | NAO_VERIFICADO | Alta | sem screenshot |
| Navegação | NÃO VERIFICADO | NÃO VERIFICADO | Não inspecionado | NAO_VERIFICADO | Alta | sem screenshot |
| Hero | NÃO VERIFICADO | NÃO VERIFICADO | Não inspecionado | NAO_VERIFICADO | Alta | sem screenshot |
| Home | NÃO VERIFICADO | NÃO VERIFICADO | Não inspecionado | NAO_VERIFICADO | Alta | sem screenshot |

## Decisão técnica
Não foi possível executar revisão visual real de:
- mockup/
- frontend/src/
- MF7 evidence

Risco: comparação inválida sem prova visual
Contrato BK protegido: BK-MF8-01 exige prova observável

## Validação
FAIL — ausência total de prova verificável

---

# Passo 2 - Normalizar tokens visuais

## Objetivo
Mapear cores, tipografia, espaçamentos e raios para tokens existentes em frontend/src/styles/.

## Observação
Sem inspeção do código-fonte não é possível validar:
- tokens existentes
- duplicação de valores
- drift visual

## Resultado
NAO_VERIFICADO

## Risco
- drift de design system
- inconsistência entre páginas

## Validação
FAIL — sem verificação de tokens reais

---

# Passo 3 - Alinhar header e navegação

## Objetivo
Validar logo, links, estados autenticado/visitante e acessibilidade de navegação.

## Observação
Sem inspeção de:
- frontend/src/components/layout/
- rotas autenticadas vs públicas

## Estado
NAO_VERIFICADO

## Cenário negativo esperado (não validado)
- links protegidos visíveis para visitantes
- ausência de estados hover/focus consistentes

## Validação
FAIL — sem prova de execução

---

# Passo 4 - Alinhar hero e home

## Objetivo
Validar hierarquia visual do primeiro viewport.

## Observação
Não foi possível verificar:
- hero real
- CTA
- carregamento
- acessibilidade (focus / contraste)

## Estado
NAO_VERIFICADO

## Riscos
- hierarquia visual incorreta
- CTA pouco visível
- problemas de contraste

## Validação
FAIL — sem screenshot ou inspeção

---

# Passo 5 - Registar evidence antes/depois

## Objetivo
Registar evolução visual com prova (antes/depois).

## Estado
Sem dados disponíveis:
- sem screenshots antes
- sem screenshots depois
- sem rota ou viewport

## Resultado
NAO_VERIFICADO

## Validação
FAIL — evidence incompleta

---

# Passo 6 - Validar critérios mensuráveis

## Objetivo
Converter observações em critérios verificáveis (RNF).

## Estado
Não existem critérios derivados de inspeção real.

## RNF

| RNF | Critério | Estado |
|-----|----------|--------|
| RNF-UI-01 Header consistente | não verificado | FAIL |
| RNF-UI-02 Navegação funcional | não verificado | FAIL |
| RNF-UI-03 Hero acessível | não verificado | FAIL |

## Validação
FAIL — critérios sem prova associada

---

# Passo 7 - Preparar handoff para Parte II

## Decisões fechadas
Nenhuma decisão pode ser considerada fechada sem inspeção real.

## Riscos identificados
- ausência de baseline visual validado
- impossibilidade de comparar mockup vs frontend
- drift de design não detetado

## Continuação (Parte II)
A Parte II deve focar:
- revisão visual real com screenshots
- validação de tokens reais em frontend/src/styles/
- validação de navegação autenticada
- validação de hero com acessibilidade

## Owner
Frontend / UX validation pipeline (pendente atribuição real)

## Estado final
BLOQUEADO — depende de execução de inspeção visual real

---

# Validação final

scripts/validate-planificacao.sh: NÃO EXECUTADO  
git diff --check: NÃO EXECUTADO  

---

# Conclusão

Este artefacto está estruturado, mas **não validado**, pois não houve execução de inspeção real do mockup nem do frontend.

Próximo passo obrigatório:
Executar inspeção real (screenshots + análise de código) antes de marcar qualquer PASS.
=======
# Alinhamento visual parte I - MF8

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
- `frontend/src/styles/tokens.css`
- `frontend/src/styles/global.css`
- `frontend/src/components/layout/AppHeader.jsx`
- `frontend/src/pages/DiscoveryHomePage.jsx`
- `frontend/src/layouts/AppLayout.jsx`

## Comparação mockup vs frontend

| Área | Mockup | Frontend final | Decisão | Proof | Negativo |
| --- | --- | --- | --- | --- | --- |
| Paleta | Bege `#F0CD95`, verde `#8DA385`, fundo `#F9F7F3`, texto `#4B4B4B` e alerta `#D16449`. | `tokens.css` declara `--color-bg`, `--color-brand`, `--color-accent`, `--color-text`, `--color-danger` e variantes de contraste. | `PASS` | `mockup/src/app/FAITHFLIX_INTERFACE_SPECS.md`; `frontend/src/styles/tokens.css`. | Se uma página usar cor solta para substituir estes tokens, passa a `DRIFT`. |
| Tipografia | Base 16px, pesos 400/500 e hierarquia simples. | `tokens.css` define stack global e `global.css` centraliza tamanhos de `h1`, `h2`, `h3`, parágrafos e botões. | `PASS_COM_RISCOS` | `frontend/src/styles/tokens.css`; `frontend/src/styles/global.css`. | O hero usa H1 forte, mas a revisão manual final deve confirmar leitura em projetor. |
| Espaçamento e raios | Radius 6/8/10/14px e espaçamento consistente. | `--radius-sm`, `--radius-md`, `--radius-lg`, `--space-page` e `--content-width` controlam layout, header, cards e formulários. | `PASS` | `frontend/src/styles/tokens.css`; `frontend/src/styles/global.css`. | Se um card ou painel criar raio divergente sem motivo, deve ser marcado em `BK-MF8-02`. |
| Header | Logo FaithFlix, navegação principal, ações e CTA. | `AppHeader` mantém marca, links públicos, links autenticados e links admin filtrados por sessão/role. | `PASS` | `docs/evidence/MF7/GATE-UI-NAVEGACAO-SEGURA.md`; `frontend/src/components/layout/AppHeader.jsx`. | Visitante ou user comum não deve ver links admin. |
| Navegação mobile | Mockup oculta elementos em mobile para reduzir ruído. | Header real usa `flex-wrap`, links filtrados por perfil e screenshot 390x844 sem links admin. | `PASS_COM_RISCOS` | `docs/evidence/MF7/browser/mf7-mobile-390-anonymous-home.png`; `docs/evidence/MF7/browser/mf7-browser-validation-results.json`. | Sweep visual completo das restantes rotas mobile continua recomendado. |
| Hero e home | Hero com destaque, título, descrição e CTAs. | `DiscoveryHomePage` usa H1 `FaithFlix`, kicker, copy PT-PT, CTA para catálogo/planos e badge de API. | `PASS_COM_RISCOS` | `frontend/src/pages/DiscoveryHomePage.jsx`; `docs/evidence/MF7/browser/mf7-desktop-1440-admin-home.png`. | A solução não copia a imagem de fundo do mockup; a diferença é aceite porque mantém hierarquia, contraste e CTAs. |
| Acessibilidade inicial | Foco, contraste, headings e navegação clara. | `SkipLink`, `main#conteudo-principal`, `:focus-visible` e navegação com `aria-label` estão presentes. | `PASS` | `docs/evidence/MF7/browser/mf7-keyboard-skip-link.png`; `frontend/src/layouts/AppLayout.jsx`; `frontend/src/styles/global.css`. | Se o foco deixar de ser visível, o gate deve voltar a `FAIL`. |

## Passos do BK

| Passo | pr | proof | neg | fonte | Decisão |
| --- | --- | --- | --- | --- | --- |
| 1. Comparar mockup e frontend real | `NAO_APLICAVEL`; entrega local sem PR. | Matriz "Comparação mockup vs frontend" com mockup, frontend e evidence MF7. | Diferença sem prova ou sem decisão não é aceite. | `BK-MF8-01`; `mockup/src/app/FAITHFLIX_INTERFACE_SPECS.md`; evidence MF7. | `PASS` |
| 2. Normalizar tokens visuais | `NAO_APLICAVEL`; sem alteração de código neste BK. | `tokens.css` concentra paleta, foco, raios, sombras, largura e espaçamento. | Valores soltos para cor/raio/espaço em páginas devem ser tratados como drift visual. | `RNF01`, `RNF02`, `RNF03`, `RNF04`, `RNF28`. | `PASS` |
| 3. Alinhar header e navegação | `NAO_APLICAVEL`; validação por evidence. | `AppHeader` filtra links por `visibility`/`roles`; screenshots MF7 cobrem visitante, user, moderator e admin. | Visitante/user comum com link admin visível volta a bloquear a MF. | `BK-MF7-02`; `BK-MF7-05`; `RNF01`, `RNF38`. | `PASS` |
| 4. Alinhar hero e home | `NAO_APLICAVEL`; validação por evidence. | Home pública mobile e home admin desktop têm screenshots; `DiscoveryHomePage` mantém H1, CTAs e PT-PT. | Hero sem contraste, foco ou CTA claro deve ser classificado como `FAIL`. | `BK-MF7-03`; `RNF01`, `RNF03`, `RNF04`, `RNF38`. | `PASS_COM_RISCOS` |
| 5. Registar evidence antes/depois | `NAO_APLICAVEL`; consolidação documental. | Estado inicial UI-01..UI-20 em `INVENTARIO-UI-MOCKUP.md`; estado pós-correção em gate MF7. | Screenshot sem rota, viewport ou perfil não conta como proof completo. | `docs/evidence/MF7/browser/mf7-browser-validation-results.json`. | `PASS` |
| 6. Validar critérios mensuráveis | `NAO_APLICAVEL`; validações em comandos finais da implementação. | Critérios ligados a RNF e ficheiros: tokens, header, home, skip link, PT-PT e responsividade. | Critério opinativo sem medida deve ser reescrito antes do freeze. | `RNF01`, `RNF02`, `RNF03`, `RNF04`, `RNF28`, `RNF38`. | `PASS_COM_RISCOS` |
| 7. Preparar handoff para parte II | `NAO_APLICAVEL`; esta secção é o handoff. | Lista abaixo separa decisões fechadas, ressalvas e rotas que passam para `BK-MF8-02`. | Handoff genérico sem rotas concretas bloqueia `BK-MF8-02`. | `BK-MF8-02`. | `PASS` |

## Critérios por RNF

| RNF | Critério | Estado | Prova |
| --- | --- | --- | --- |
| `RNF01` | Navegação principal clara entre início, catálogo, pesquisa, associações e planos. | `PASS` | `AppHeader.jsx`; screenshot mobile visitante. |
| `RNF02` | Links e botões têm hover, active, disabled e foco visível. | `PASS` | `global.css`; screenshot de skip link por teclado. |
| `RNF03` | Layout adapta-se a mobile, tablet e desktop sem sobreposição conhecida no gate. | `PASS_COM_RISCOS` | Screenshots 390x844, 768x900, 1366x900 e 1440x900 de MF7. |
| `RNF04` | Contraste, headings, labels e skip link sustentam acessibilidade básica. | `PASS` | `AppLayout.jsx`; `global.css`; `mf7-keyboard-skip-link.png`. |
| `RNF28` | Frontend usa componentes reutilizáveis em layout, header, cards, estados e botões. | `PASS` | `AppHeader.jsx`, `ContentCard.jsx`, `EmptyState.jsx`, `BaseButton.jsx`. |
| `RNF38` | Interface visível está em português de Portugal por defeito. | `PASS_COM_RISCOS` | Evidence MF7 e textos principais em `DiscoveryHomePage.jsx`/`AppHeader.jsx`. |

## Decisões e ressalvas

- Decisão fechada: tokens, header, navegação por perfil, hero/home e foco inicial estão suficientemente consolidados para avançar.
- Ressalva aceite: a home real não replica literalmente a imagem de fundo do mockup; a diferença é aceite porque preserva identidade FaithFlix, contraste, CTAs e leitura.
- Ressalva aceite: a evidence usa screenshots representativos de MF7; a revisão humana final de UX continua recomendada antes da defesa.
- Blockers: nenhum blocker P0/P1 confirmado nesta parte.

## Handoff para BK-MF8-02

- Páginas/áreas a validar na parte II: `/catalogo`, `/pesquisa`, `/para-si`, `/biblioteca`, `/planos`, `/associacoes`, `/conta`.
- Componentes a reutilizar: `ContentCard`, `EmptyState`, `BaseButton`, `SearchFilters`, `DiscoveryCarousel`.
- Estados obrigatórios a confirmar: loading, erro, vazio, sucesso/lista, foco, formato PT-PT e formato europeu.
- Riscos a transportar: revisão humana final de UX e sweep mobile completo das restantes páginas.
- Owner do próximo passo: Matheus, com apoio de Mateus e Davi conforme `BK-MF8-02`.

## Resultado

`BK-MF8-01` fica `PASS_COM_RISCOS`: não há falha visual bloqueante confirmada, mas a decisão mantém a ressalva de revisão humana final antes da defesa.
>>>>>>> b2123e6 (Update: Pré MF9)
