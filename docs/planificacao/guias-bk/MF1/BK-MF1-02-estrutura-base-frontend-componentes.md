# BK-MF1-02 - Estrutura base frontend por componentes

## Header

- `doc_id`: `GUIA-BK-MF1-02`
- `bk_id`: `BK-MF1-02`
- `macro`: `MF1`
- `owner`: `Mateus`
- `apoio`: `Kaue`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF0-06`
- `rf_rnf`: `RNF28`
- `fase_documental`: `Fase 1`
- `sprint`: `S01`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF1-03`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-02-estrutura-base-frontend-componentes.md`
- `last_updated`: `2026-05-27`

## Bloco pedagogico (obrigatorio)

Este BK ensina a construir a primeira fundacao tecnica real do frontend FaithFlix. A equipa vai criar uma aplicacao React organizada por componentes, paginas, layout, estilos base e rotas, usando o mockup apenas como referencia de fluxo e linguagem visual.

O objetivo pedagogico e perceber a diferenca entre pagina, layout, componente, props e estado. A app ainda nao tera catalogo real, login funcional, streaming ou dados vindos da API. Vai ter placeholders controlados, para que os BKs seguintes possam ligar backend, auth e catalogo sem refazer a estrutura.

## Bloco operacional (obrigatorio)

O trabalho operacional e criar a pasta `frontend/`, configurar React, definir rotas principais inspiradas no mockup, criar componentes reutilizaveis e uma base visual simples. Nao se deve copiar a pilha pesada do mockup; ele serve para orientar navegacao, hierarquia de ecras e nomes visiveis.

#### BK-MF1-02 - Estrutura base frontend por componentes

##### O que vamos fazer neste BK

Neste BK vamos criar o frontend inicial da FaithFlix com React. A estrutura vai separar `pages`, `components`, `layouts`, `styles` e `services`, deixando espaco para o cliente API de `BK-MF1-03`.

O mockup existente em `mockup/` indica rotas e ecras esperados: home, login, catalogo, instituicoes, planos, minha conta, notificacoes e busca. Neste BK essas rotas podem existir como paginas placeholder, sem regras de negocio reais. O objetivo e criar navegação e estrutura, nao finalizar UI nem implementar features.

Como a stack nao esta fechada num contrato unico, a opcao mais simples para alunos de 12.º ano e usar React com Vite e JavaScript moderno. Isto e uma assuncao tecnica derivada do mockup e dos RNF; se o orientador exigir Next.js como sugerido em `RNF.md`, a equipa deve adaptar a estrutura antes de executar.

##### Porque e que isto e importante

- Cria uma base visual e estrutural para todo o produto FaithFlix.
- Evita paginas duplicadas e componentes criados ao acaso em BKs futuros.
- Prepara `BK-MF1-03`, que vai ligar o frontend ao backend com tratamento de erro.
- Permite testar cedo navegacao, responsividade minima e consistencia visual.
- Ensina a construir UI de forma modular, sem ficar preso ao mockup como pixel-perfect.

##### O que entra (scope)

- Criar `frontend/` com React e Vite.
- Definir rotas base da app.
- Criar layout principal com header, main e footer.
- Criar componentes base: botao, campo de formulario, card e estado vazio.
- Criar tokens simples de cor, espacamento e tipografia derivados do mockup.
- Criar paginas placeholder para os fluxos principais.
- Garantir build local sem erros.

##### O que nao entra (scope-out)

- Nao entra login funcional, registo, recuperacao de password ou sessao.
- Nao entra catalogo real, favoritos, historico, streaming ou player.
- Nao entra subscricoes funcionais, pagamentos ou pool solidaria.
- Nao entra copiar dependencias do mockup como MUI, Radix, shadcn ou bibliotecas de icones sem decisao.
- Nao entra identidade visual definitiva nem pixel-perfect.

##### Como saber que isto ficou bem

- `npm run dev` abre a app frontend.
- `npm run build` termina sem erros.
- As rotas principais mostram paginas placeholder claras e coerentes.
- Header e footer aparecem de forma consistente.
- Os componentes base sao reutilizados, nao duplicados.

#### Metadados do BK (CANONICO/DERIVADO):

- Prioridade: `P0` (CANONICO, `BACKLOG-MVP.md`)
- Estado: `TODO` (CANONICO, `BACKLOG-MVP.md`)
- Esforco: `M` (CANONICO, `BACKLOG-MVP.md`)
- macro: `MF1` (CANONICO, `BACKLOG-MVP.md`)
- Owner: `Mateus` (CANONICO, `BACKLOG-MVP.md`)
- Apoio: `Kaue` (CANONICO, `BACKLOG-MVP.md`)
- Dependencias (BK IDs): `BK-MF0-06` (CANONICO, `BACKLOG-MVP.md`)
- Pre-condicoes: MF0 encerrada, mockup inspecionado e decisao de criar fundacao tecnica frontend sem UI final (DERIVADO)
- Ref. Plano: `PLANO-IMPLEMENTACAO-TOTAL > MF1`, `MF-VIEWS > MF1`, `PLANO-SPRINTS > Sprint 1` (CANONICO)
- Flow ID: `MF1-foundation-frontend-02` (DERIVADO)
- Fonte de verdade: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- Fonte de verdade: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- Fonte de verdade: `mockup/src/app/FAITHFLIX_INTERFACE_SPECS.md`
- Descricao: criar a estrutura base do frontend por componentes, alinhada com `RNF28`, usando o mockup como referencia nao final (DERIVADO)

#### O que vamos fazer neste BK (DERIVADO):

- Criar app React em `frontend/`.
- Definir rotas principais da experiencia FaithFlix.
- Criar layout reutilizavel com header e footer.
- Criar componentes atomicos simples e sem dependencias pesadas.
- Criar paginas placeholder com estados controlados.
- Aplicar tokens visuais simples derivados do mockup.
- Preparar pasta `services/api/` para `BK-MF1-03`.

#### Estado, ficheiros e impacto (DERIVADO):

- Estado esperado antes do BK: existe mockup, mas nao existe frontend real da app.
- Estado esperado depois do BK: existe frontend React executavel com rotas, layout e componentes base.
- Ficheiros a criar: `frontend/package.json`, `frontend/index.html`, `frontend/src/main.jsx`, `frontend/src/App.jsx`, `frontend/src/routes/AppRoutes.jsx`, `frontend/src/layouts/AppLayout.jsx`, `frontend/src/components/ui/`, `frontend/src/pages/`, `frontend/src/styles/tokens.css`, `frontend/src/styles/global.css`.
- Ficheiros a editar: nenhum ficheiro canónico de planificacao, salvo evidence.
- Ficheiros a rever: `mockup/src/app/App.tsx`, `mockup/src/app/components/Header.tsx`, `mockup/src/app/FAITHFLIX_INTERFACE_SPECS.md`, `docs/RNF.md`.
- Dependencias de BK anteriores e uso: reutiliza `BK-MF0-06` para confirmar que MF1 e a primeira fase tecnica real e que este BK nao deve fechar UI final.
- Impacto na arquitetura da app: define convencao frontend componentizada para todos os BKs de UI.
- Impacto frontend: cria base real da aplicacao.
- Impacto backend: nenhum direto; a ligacao vem em `BK-MF1-03`.
- Impacto dados: apenas placeholders; sem dados persistentes.
- Impacto seguranca: nao guardar tokens no frontend; sem localStorage para sessao.
- Impacto testes: `npm run build` fica como smoke inicial.
- Impacto UI: cria linguagem visual inicial, nao definitiva.
- Handoff para o proximo BK: `BK-MF1-03` deve reutilizar `services/api/`, estados de UI e mensagens PT-PT.

#### Pre-leitura minima (10-15 min) (DERIVADO):

- `docs/RNF.md`: `RNF28`, `RNF05` como contexto futuro de mensagens.
- `docs/planificacao/guias-bk/MF0/BK-MF0-06-reuniao-alinhamento-inicial.md`: handoff para frontend.
- `docs/planificacao/backlogs/BACKLOG-MVP.md`: linha `BK-MF1-02`.
- `mockup/src/app/App.tsx`: rotas e paginas propostas.
- `mockup/src/app/components/Header.tsx`: navegacao principal.
- `mockup/src/app/FAITHFLIX_INTERFACE_SPECS.md`: cores, componentes e notas de responsividade.
- Codigo: confirmar que nao existe `frontend/` real antes de criar a app.

#### Glossario (rapido) (DERIVADO):

- Frontend: parte da app que o utilizador ve e usa no browser.
- React: biblioteca para criar UI com componentes.
- Vite: ferramenta simples para criar e correr apps frontend modernas.
- Componente: bloco reutilizavel de UI, como botao ou card.
- Props: dados que um componente recebe de fora.
- State: dados internos que mudam durante a interacao.
- Page: componente que representa um ecra/rota.
- Layout: estrutura comum a varias paginas.
- Router: sistema que decide que pagina aparece para cada URL.
- Placeholder: versao temporaria controlada de um ecra ainda sem funcionalidade.
- Token visual: valor reutilizavel de cor, tamanho ou espacamento.

#### Conceitos teoricos essenciais (DERIVADO):

**React components.** Em React, a interface e composta por funcoes que devolvem UI. Um `BaseButton` pode ser usado em varias paginas sem copiar CSS e markup.

**Props vs state.** Props entram no componente a partir do pai. State vive dentro do componente e muda com interacoes. Neste BK quase tudo deve ser estatico; estados mais ricos aparecem quando o cliente API for ligado.

**Rotas frontend.** Rotas como `/catalogo` e `/login` permitem mapear URLs para paginas. Neste BK as paginas sao placeholders porque as funcionalidades chegam em `MF2+`.

**Mockup como referencia.** O mockup ajuda a perceber fluxo, labels e hierarquia, mas nao e contrato pixel-perfect. Nao se copiam bibliotecas pesadas so porque aparecem no mockup.

**Acessibilidade basica.** Links e botoes devem ter texto claro; formularios placeholder devem ter `label`; o foco de teclado nao deve desaparecer. Isto evita uma UI bonita mas dificil de usar.

**Erros comuns.** Criar um componente para cada pagina sem reutilizacao, misturar CSS global com estilos aleatorios, implementar login falso e guardar tokens em `localStorage` antes de existir sessao segura.

#### Guia de execucao (passo-a-passo) (DERIVADO):

0. **Objetivo (~15 min): Inspecionar mockup e limitar scope**
   - Descricao detalhada do objetivo: identificar rotas, layout e componentes principais sem transformar o mockup em UI final.
   - Justificacao: o mockup orienta, mas a fundacao tecnica deve ser simples e extensivel.
   - Como fazer (0.1): rever `mockup/src/app/App.tsx` para listar rotas.
   - Como fazer (0.2): rever `FAITHFLIX_INTERFACE_SPECS.md` para extrair cores e componentes, sem copiar dependencias.
   - Ficheiro a rever: `mockup/src/app/FAITHFLIX_INTERFACE_SPECS.md`
   - Ficheiro alvo: notas de implementacao do PR
   - Snippet de referencia: rotas `/`, `/login`, `/catalogo`, `/instituicoes`, `/planos`, `/minha-conta`, `/notificacoes`, `/busca`
   - O que verificar: equipa sabe que catalogo/login sao placeholders nesta fase.

1. **Objetivo (~20 min): Criar aplicacao React**
   - Descricao detalhada do objetivo: criar `frontend/` com React e scripts de desenvolvimento.
   - Justificacao: o frontend precisa de uma base propria para evoluir sem depender do mockup.
   - Como fazer (1.1): executar `npm create vite@latest frontend -- --template react`.
   - Como fazer (1.2): entrar em `frontend/`, executar `npm install` e confirmar scripts `dev`, `build`, `preview`.
   - Ficheiro a rever: `frontend/package.json`
   - Ficheiro alvo: `frontend/package.json`
   - Snippet de referencia:
     ```json
     {
       "scripts": {
         "dev": "vite",
         "build": "vite build",
         "preview": "vite preview"
       }
     }
     ```
   - O que verificar: nao foram copiadas dependencias pesadas do mockup.

2. **Objetivo (~15 min): Adicionar routing minimo**
   - Descricao detalhada do objetivo: instalar e configurar o router para as paginas principais.
   - Justificacao: a app tem varios ecras previstos; o router evita navegação manual por estado global improvisado.
   - Como fazer (2.1): instalar `react-router-dom`.
   - Como fazer (2.2): criar `src/routes/AppRoutes.jsx` e montar no `App.jsx`.
   - Ficheiro a rever: `mockup/src/app/App.tsx`
   - Ficheiro alvo: `frontend/src/routes/AppRoutes.jsx`
   - Snippet de referencia:
     ```jsx
     <Route path="/catalogo" element={<CatalogPage />} />
     <Route path="*" element={<NotFoundPage />} />
     ```
   - O que verificar: cada rota abre uma pagina placeholder sem erro.

3. **Objetivo (~25 min): Criar layout principal**
   - Descricao detalhada do objetivo: criar header, area principal e footer reutilizaveis.
   - Justificacao: layout comum evita repetir navegacao em todas as paginas.
   - Como fazer (3.1): criar `src/layouts/AppLayout.jsx`.
   - Como fazer (3.2): criar `src/components/layout/AppHeader.jsx` e `AppFooter.jsx`.
   - Ficheiro a rever: `mockup/src/app/components/Header.tsx`
   - Ficheiro alvo: `frontend/src/layouts/AppLayout.jsx`
   - Snippet de referencia:
     ```jsx
     export function AppLayout({ children }) {
       return (
         <>
           <AppHeader />
           <main>{children}</main>
           <AppFooter />
         </>
       );
     }
     ```
   - O que verificar: header aparece em todas as paginas e links usam `NavLink`.

4. **Objetivo (~25 min): Criar tokens e estilos base**
   - Descricao detalhada do objetivo: definir cores, tipografia, spacing e estados de foco em CSS.
   - Justificacao: tokens mantem consistencia e facilitam ajustes futuros de design.
   - Como fazer (4.1): criar `src/styles/tokens.css` com variaveis CSS.
   - Como fazer (4.2): importar `tokens.css` e `global.css` em `main.jsx`.
   - Ficheiro a rever: `mockup/src/app/FAITHFLIX_INTERFACE_SPECS.md`
   - Ficheiro alvo: `frontend/src/styles/tokens.css`
   - Snippet de referencia:
     ```css
     :root {
       --color-bg: #F9F7F3;
       --color-primary: #8DA385;
       --color-accent: #F0CD95;
       --color-text: #4B4B4B;
     }
     ```
   - O que verificar: UI nao fica presa a uma paleta de mockup impossivel de alterar.

5. **Objetivo (~35 min): Criar paginas placeholder controladas**
   - Descricao detalhada do objetivo: criar paginas para as rotas principais, com texto curto e sem funcionalidade falsa.
   - Justificacao: rotas precisam existir para a equipa validar navegacao, mas nao devem prometer features ainda nao feitas.
   - Como fazer (5.1): criar `HomePage`, `LoginPage`, `CatalogPage`, `PlansPage`, `InstitutionsPage`, `AccountPage`, `NotificationsPage`, `SearchPage`, `NotFoundPage`.
   - Como fazer (5.2): usar um componente comum `PageShell` ou `EmptyState` para reduzir duplicacao.
   - Ficheiro a rever: `mockup/src/app/pages/`
   - Ficheiro alvo: `frontend/src/pages/CatalogPage.jsx`
   - Snippet de referencia:
     ```jsx
     export function CatalogPage() {
       return <EmptyState title="Catalogo" description="Conteudos reais entram na MF2." />;
     }
     ```
   - O que verificar: nenhum placeholder cria dados falsos de filmes, pagamentos ou utilizadores.

6. **Objetivo (~30 min): Criar componentes UI base**
   - Descricao detalhada do objetivo: criar componentes pequenos e reutilizaveis para botoes, campos e cards.
   - Justificacao: `RNF28` exige frontend componentizado, nao paginas com HTML duplicado.
   - Como fazer (6.1): criar `src/components/ui/BaseButton.jsx`, `TextField.jsx`, `ContentCard.jsx`, `EmptyState.jsx`.
   - Como fazer (6.2): usar pelo menos dois componentes em paginas diferentes.
   - Ficheiro a rever: `mockup/src/app/components/`
   - Ficheiro alvo: `frontend/src/components/ui/BaseButton.jsx`
   - Snippet de referencia:
     ```jsx
     export function BaseButton({ children, type = 'button', ...props }) {
       return <button type={type} className="base-button" {...props}>{children}</button>;
     }
     ```
   - O que verificar: componentes nao fazem chamadas API nem guardam sessao.

7. **Objetivo (~25 min): Validar responsividade e acessibilidade minima**
   - Descricao detalhada do objetivo: garantir que a app e usavel em mobile/desktop e por teclado.
   - Justificacao: problemas de layout cedo ficam caros quando as paginas ficarem funcionais.
   - Como fazer (7.1): testar largura pequena no browser e verificar quebra do header.
   - Como fazer (7.2): navegar com teclado pelos links e botoes.
   - Ficheiro a rever: `frontend/src/styles/global.css`
   - Ficheiro alvo: `frontend/src/styles/global.css`
   - Snippet de referencia:
     ```css
     :focus-visible {
       outline: 3px solid var(--color-accent);
       outline-offset: 2px;
     }
     ```
   - O que verificar: texto nao sobrepoe, links sao clicaveis e foco e visivel.

8. **Objetivo (~20 min): Validar build e handoff para API client**
   - Descricao detalhada do objetivo: confirmar que o frontend compila e que `BK-MF1-03` tem uma pasta clara para cliente API.
   - Justificacao: o proximo BK precisa ligar chamadas HTTP sem reorganizar o frontend.
   - Como fazer (8.1): executar `npm run build` em `frontend/`.
   - Como fazer (8.2): criar `src/services/api/README.md` com nota de que o cliente API sera implementado no BK seguinte.
   - Ficheiro a rever: `frontend/package.json`
   - Ficheiro alvo: `frontend/src/services/api/README.md`
   - Snippet de referencia:
     ```md
     # API client
     Implementado em BK-MF1-03. Nao guardar tokens em localStorage.
     ```
   - O que verificar: build passa e o handoff para `BK-MF1-03` esta explicito.

#### Checklist de validacao (DERIVADO):

**Smoke**
- [ ] `npm run dev` abre o frontend.
- [ ] `npm run build` termina sem erros.
- [ ] Rotas principais renderizam placeholders.
- [ ] Header e footer aparecem nas paginas.

**Negativos**
- [ ] Passo: 2; input/acao: abrir rota inexistente `/rota-errada`; resultado esperado: pagina 404 controlada; risco que cobre: experiencia quebrada.
- [ ] Passo: 5; input/acao: procurar dados reais de catalogo nos placeholders; resultado esperado: nao existem dados inventados; risco que cobre: requisitos falsos.
- [ ] Passo: 7; input/acao: navegar so com teclado; resultado esperado: foco visivel e links acessiveis; risco que cobre: UI inacessivel.

**Tecnico**
- [ ] Estrutura separa `pages`, `components`, `layouts`, `styles` e `services`.
- [ ] Componentes base sao reutilizados.
- [ ] Mockup nao foi copiado como dependencia pesada.

**Regressao das fases anteriores**
- [ ] Mantem a decisao de que MF0 nao implementou UI.
- [ ] Respeita owner, apoio, prioridade, dependencias e `RNF28`.
- [ ] Evidence segue DoD definido em MF0.

**UI/mockup**
- [ ] Rotas refletem o mockup como referencia.
- [ ] Cores/tokens sao derivados, nao identidade final.
- [ ] Sem pixel-perfect obrigatório.

**Seguranca**
- [ ] Nao ha tokens em `localStorage`.
- [ ] Login e conta sao placeholders, sem autenticacao falsa.
- [ ] Nenhum segredo foi colocado no frontend.

#### Criterios de aceite:

**Outputs:**
- `frontend/` criado com React, routing, layout, paginas e componentes base.
- Rotas principais existem como placeholders controlados.
- Tokens visuais base estao definidos.

**Verificacoes:**
- `npm run dev` executa.
- `npm run build` executa sem erro.
- Rota inexistente mostra 404 controlado.

**Qualidade:**
- UI organizada por componentes.
- Mockup usado como referencia, nao como copia cega.
- Sem funcionalidades falsas ou dados inventados.

**Continuidade:**
- `BK-MF1-03` consegue criar API client em `src/services/api/`.
- `MF2` consegue substituir placeholders por paginas funcionais sem mudar o router todo.
- Componentes base podem ser reutilizados em auth, catalogo e planos.

**Evidencia:**
- PR/commit com ficheiros frontend.
- Screenshot ou captura curta das rotas principais.
- Output de `npm run build`.

#### Evidence (para o PR/defesa):

- `pr`: `A preencher no fecho do BK`
- `proof`: `A preencher apos validacao`
- `neg`: `A preencher apos testes negativos`
- `files`: `frontend/package.json`, `frontend/src/App.jsx`, `frontend/src/routes/`, `frontend/src/layouts/`, `frontend/src/components/`, `frontend/src/pages/`, `frontend/src/styles/`
- `commands`: `npm install`, `npm run dev`, `npm run build`
- `screenshots`: `A preencher com home, catalogo placeholder, login placeholder e 404`
- `notes`: `Mockup usado como referencia de fluxo; UI final fica para evolucao posterior`

#### TODOs

- TODO: confirmar com o orientador se o frontend final deve manter Vite/React ou migrar para Next.js conforme sugestao em `RNF.md`.
- TODO: decidir se o logo do mockup pode ser reutilizado como asset oficial ou se deve ficar apenas como referencia visual.
- TODO (BLOCKER): se ja existir frontend real, parar e adaptar sem sobrescrever.
- FOLLOW-UP: `BK-MF1-03` deve implementar o cliente API usando `fetch` ou Axios conforme decisao final.
- FOLLOW-UP: `MF2` deve substituir placeholders por fluxos reais de auth, catalogo e reproducao.
- Assuncao tecnica: usar React + Vite para simplicidade pedagogica e alinhamento com mockup.
- Decisoes dependentes de mockup: identidade visual final, iconografia e detalhe de layout.
- Decisoes dependentes de app/codigo ainda inexistente: estrutura pode ajustar se a equipa criar base antes deste BK.

## Snippet tecnico aplicavel

```jsx
// frontend/src/routes/AppRoutes.jsx
import { Route, Routes } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout.jsx';
import { HomePage } from '../pages/HomePage.jsx';
import { CatalogPage } from '../pages/CatalogPage.jsx';
import { LoginPage } from '../pages/LoginPage.jsx';
import { NotFoundPage } from '../pages/NotFoundPage.jsx';

export function AppRoutes() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalogo" element={<CatalogPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppLayout>
  );
}
```

## Proximo BK recomendado

`BK-MF1-03`, que deve ligar esta estrutura frontend a um cliente API com tratamento de erros e mensagens em PT-PT.

## Changelog

- `2026-05-27`: refinado para guia executavel de fundacao frontend, usando mockup como referencia nao final e mantendo metadados canonicos.
