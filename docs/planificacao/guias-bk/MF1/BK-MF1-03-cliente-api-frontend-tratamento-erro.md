# BK-MF1-03 - Cliente API frontend com tratamento de erro

## Header

- `doc_id`: `GUIA-BK-MF1-03`
- `bk_id`: `BK-MF1-03`
- `macro`: `MF1`
- `owner`: `Mateus`
- `apoio`: `Matheus`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF1-02`
- `rf_rnf`: `RNF05, RNF30`
- `fase_documental`: `Fase 1`
- `sprint`: `S02`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF1-04`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-03-cliente-api-frontend-tratamento-erro.md`
- `last_updated`: `2026-05-27`

## Bloco pedagogico (obrigatorio)

Este BK ensina a criar uma fronteira limpa entre frontend e backend. Em vez de cada pagina chamar `fetch` diretamente, a app passa a ter um cliente API centralizado, com mensagens de erro em portugues, suporte a cookies HttpOnly futuros e tratamento previsivel de loading/error/success.

O objetivo pedagogico e perceber que erros de rede, respostas 400/401/404/500 e respostas JSON invalidas sao casos normais numa aplicacao real. O frontend deve tratar esses casos de forma controlada, sem crashar e sem expor detalhes tecnicos ao utilizador.

## Bloco operacional (obrigatorio)

O trabalho operacional e criar `frontend/src/services/api/`, implementar um `apiClient`, normalizar erros, preparar mensagens de UI e criar um pequeno componente de estado tecnico que permita validar a ligacao ao backend base quando ele estiver disponivel.

#### BK-MF1-03 - Cliente API frontend com tratamento de erro

##### O que vamos fazer neste BK

Neste BK vamos criar o cliente API do frontend FaithFlix. Ele sera usado por paginas e features futuras para fazer chamadas HTTP ao backend sem repetir configuracao, headers, parsing de JSON, credenciais e tratamento de erros.

O cliente API deve usar `credentials: 'include'` desde ja, porque `BK-MF1-04` vai preparar sessao segura com cookies HttpOnly. Isto nao implementa login nem guarda tokens no frontend; apenas deixa o contrato pronto para cookies seguros.

Tambem vamos preparar mensagens de erro claras em PT-PT, alinhadas com `RNF05`, e contexto minimo para diagnostico, alinhado com `RNF30`. Logs estruturados completos entram no backend em `BK-MF1-05`; aqui o frontend apenas preserva informacao util como status, path e request id quando existir.

##### Porque e que isto e importante

- Evita chamadas API espalhadas por paginas e componentes.
- Prepara autenticação por cookies sem usar `localStorage`.
- Garante mensagens de erro consistentes para o utilizador.
- Facilita testes negativos de backend offline, 401 e 500.
- Dá ao backend um contrato previsivel para respostas de erro.

##### O que entra (scope)

- Criar `apiClient` baseado em `fetch` nativo.
- Criar classe/estrutura `ApiError`.
- Criar mapeamento de mensagens de erro em PT-PT.
- Criar helpers `get`, `post`, `put`, `patch`, `del`.
- Criar configuracao `VITE_API_BASE_URL`.
- Criar componente simples para testar estado da API base.
- Documentar formato esperado de erro.

##### O que nao entra (scope-out)

- Nao entra login, registo, recuperacao de password ou refresh token.
- Nao entra guardar JWT em `localStorage`, `sessionStorage` ou variaveis globais.
- Nao entra criar endpoints de negocio.
- Nao entra substituir a API backend por mocks permanentes.
- Nao entra observabilidade completa; logging backend fica em `BK-MF1-05`.

##### Como saber que isto ficou bem

- O frontend compila sem erros.
- Uma chamada valida a `/api` e tratada como sucesso quando o backend esta ligado.
- Backend offline mostra erro amigavel, sem crash.
- 401, 404 e 500 sao normalizados para mensagens previsiveis.
- O cliente API fica reutilizavel por `MF2` sem reescrita.

#### Metadados do BK (CANONICO/DERIVADO):

- Prioridade: `P0` (CANONICO, `BACKLOG-MVP.md`)
- Estado: `TODO` (CANONICO, `BACKLOG-MVP.md`)
- Esforco: `M` (CANONICO, `BACKLOG-MVP.md`)
- macro: `MF1` (CANONICO, `BACKLOG-MVP.md`)
- Owner: `Mateus` (CANONICO, `BACKLOG-MVP.md`)
- Apoio: `Matheus` (CANONICO, `BACKLOG-MVP.md`)
- Dependencias (BK IDs): `BK-MF1-02` (CANONICO, `BACKLOG-MVP.md`)
- Pre-condicoes: frontend componentizado criado; backend base de `BK-MF1-01` recomendado para smoke, mas nao declarado como dependencia canónica (DERIVADO)
- Ref. Plano: `MF-VIEWS > MF1`, `PLANO-SPRINTS > Sprint 2`, `MATRIZ-CANONICA-BK > RNF05/RNF30` (CANONICO)
- Flow ID: `MF1-frontend-api-client-03` (DERIVADO)
- Fonte de verdade: `docs/RNF.md`
- Fonte de verdade: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- Fonte de verdade: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- Descricao: criar cliente API frontend com tratamento de erro, mensagens claras e preparacao para cookies HttpOnly (DERIVADO)

#### O que vamos fazer neste BK (DERIVADO):

- Criar `frontend/src/services/api/apiClient.js`.
- Criar `frontend/src/services/api/apiErrors.js`.
- Criar `frontend/src/config/env.js` para `VITE_API_BASE_URL`.
- Criar `frontend/src/components/system/ApiStatusBadge.jsx` ou equivalente para smoke.
- Atualizar uma pagina tecnica/placeholder para mostrar estado da API sem prometer funcionalidade.
- Documentar contrato esperado de erro e headers.
- Garantir que todos os pedidos usam `credentials: 'include'`.

#### Estado, ficheiros e impacto (DERIVADO):

- Estado esperado antes do BK: frontend base existe com rotas e componentes, mas sem cliente API central.
- Estado esperado depois do BK: frontend tem cliente API reutilizavel, mensagens de erro normalizadas e smoke de ligacao ao backend base.
- Ficheiros a criar: `frontend/src/services/api/apiClient.js`, `frontend/src/services/api/apiErrors.js`, `frontend/src/config/env.js`, `frontend/src/components/system/ApiStatusBadge.jsx`, `frontend/.env.example`.
- Ficheiros a editar: `frontend/src/pages/HomePage.jsx` ou outra pagina placeholder para incluir o estado tecnico se a equipa decidir mostrar em dev.
- Ficheiros a rever: `frontend/src/routes/AppRoutes.jsx`, `backend/src/modules/system/system.routes.js`, `docs/RNF.md`.
- Dependencias de BK anteriores e uso: depende de `BK-MF1-02` para estrutura frontend; reutiliza a rota `/api` de `BK-MF1-01` apenas como smoke tecnico se existir.
- Impacto na arquitetura da app: cria uma fronteira unica para HTTP no frontend.
- Impacto frontend: centraliza chamadas e estados de erro.
- Impacto backend: estabiliza expectativa de respostas JSON e codigos HTTP.
- Impacto dados: nenhum.
- Impacto seguranca: prepara cookies HttpOnly via `credentials: 'include'` e evita tokens no browser storage.
- Impacto testes: cria cenarios negativos para `BK-MF1-06`.
- Impacto UI: define estados loading/error/success simples e mensagens em PT-PT.
- Handoff para o proximo BK: `BK-MF1-04` deve emitir cookies compativeis com o cliente API; `MF2` deve criar services por dominio reutilizando este cliente.

#### Pre-leitura minima (10-15 min) (DERIVADO):

- `docs/RNF.md`: `RNF05`, `RNF15`, `RNF30`.
- Guia `BK-MF1-02`: estrutura frontend e pasta `services/api`.
- Guia `BK-MF1-01`: endpoint tecnico `GET /api`, se ja executado.
- `mockup/src/app/pages/LoginPage.tsx`: apenas para perceber mensagens e estados visuais, sem implementar login.
- `frontend/src/components/ui/`: componentes de estado criados no BK anterior.

#### Glossario (rapido) (DERIVADO):

- API client: modulo frontend que concentra chamadas HTTP.
- Fetch: API nativa do browser para fazer pedidos HTTP.
- HTTP status: codigo de resposta, como 200, 400, 401, 404 ou 500.
- `credentials: include`: opcao que permite enviar/receber cookies em chamadas cross-origin controladas.
- HttpOnly: cookie inacessivel a JavaScript, mais seguro para sessao.
- Loading state: estado enquanto o pedido ainda nao terminou.
- Error state: estado quando a chamada falha.
- Success state: estado quando a chamada termina bem.
- Request id: identificador opcional para cruzar erro do frontend com log do backend.
- Fallback: comportamento seguro quando algo falha.

#### Conceitos teoricos essenciais (DERIVADO):

**Porque centralizar chamadas API.** Se cada pagina fizer `fetch` manual, cada uma trata erros de forma diferente. Um cliente API cria uma regra unica para base URL, JSON, cookies e mensagens.

**Fetch e JSON.** `fetch` nao lança erro automaticamente para status 400/500. A equipa deve verificar `response.ok` e transformar respostas de erro em `ApiError`.

**Cookies HttpOnly no frontend.** Um cookie HttpOnly nao pode ser lido por JavaScript. Por isso, o frontend nao deve procurar tokens. Deve enviar pedidos com `credentials: 'include'` e deixar o browser gerir cookies.

**Mensagens para utilizador vs detalhes tecnicos.** O utilizador deve ver "Nao foi possivel ligar ao servidor". O developer pode registar status, endpoint e request id. Nao mostrar stack traces nem mensagens internas.

**Logs estruturados.** `RNF30` pede logs com nivel e contexto. O frontend pode preservar contexto de erro, mas os logs estruturados principais entram no backend em `BK-MF1-05`.

**Erros comuns.** Guardar JWT em `localStorage`, assumir que todo erro tem JSON, mostrar `Cannot read properties of undefined`, ou criar clients diferentes para cada feature.

#### Guia de execucao (passo-a-passo) (DERIVADO):

0. **Objetivo (~10 min): Confirmar estrutura frontend existente**
   - Descricao detalhada do objetivo: garantir que `BK-MF1-02` criou `frontend/` e pastas para componentes/paginas.
   - Justificacao: este BK nao deve reorganizar o frontend inteiro.
   - Como fazer (0.1): abrir `frontend/src/` e identificar `pages`, `components`, `layouts`.
   - Como fazer (0.2): confirmar onde fica `services/api/`.
   - Ficheiro a rever: `frontend/src/App.jsx`
   - Ficheiro alvo: nenhum ainda.
   - Snippet de referencia: `frontend/src/services/api/`
   - O que verificar: a estrutura existe e nao precisa de refatoracao ampla.

1. **Objetivo (~15 min): Definir configuracao da API**
   - Descricao detalhada do objetivo: criar uma fonte unica para `VITE_API_BASE_URL`.
   - Justificacao: URLs hardcoded espalhadas dificultam ambiente local/deploy.
   - Como fazer (1.1): criar `frontend/.env.example`.
   - Como fazer (1.2): criar `frontend/src/config/env.js`.
   - Ficheiro a rever: `backend/src/config/env.js`
   - Ficheiro alvo: `frontend/src/config/env.js`
   - Snippet de referencia:
     ```js
     export const env = {
       apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000',
     };
     ```
   - O que verificar: `.env.example` nao contem segredos.

2. **Objetivo (~25 min): Criar `ApiError` e mensagens PT-PT**
   - Descricao detalhada do objetivo: transformar erros tecnicos em objetos previsiveis e mensagens claras.
   - Justificacao: `RNF05` exige feedback claro; o utilizador nao deve ver mensagens internas.
   - Como fazer (2.1): criar `apiErrors.js` com `ApiError`.
   - Como fazer (2.2): criar `getUserFriendlyErrorMessage(error)`.
   - Ficheiro a rever: `docs/RNF.md`
   - Ficheiro alvo: `frontend/src/services/api/apiErrors.js`
   - Snippet de referencia:
     ```js
     export class ApiError extends Error {
       constructor({ status, message, details, requestId }) {
         super(message);
         this.status = status;
         this.details = details;
         this.requestId = requestId;
       }
     }
     ```
   - O que verificar: 401, 404, 500 e erro de rede têm mensagens diferentes.

3. **Objetivo (~35 min): Implementar `apiClient` com fetch**
   - Descricao detalhada do objetivo: criar funcoes HTTP reutilizaveis.
   - Justificacao: as features futuras devem importar o cliente, nao repetir `fetch`.
   - Como fazer (3.1): criar funcao `request(path, options)`.
   - Como fazer (3.2): expor `apiClient.get`, `post`, `put`, `patch`, `del`.
   - Ficheiro a rever: `frontend/src/services/api/README.md`
   - Ficheiro alvo: `frontend/src/services/api/apiClient.js`
   - Snippet de referencia:
     ```js
     const response = await fetch(`${env.apiBaseUrl}${path}`, {
       credentials: 'include',
       headers: { 'Content-Type': 'application/json', ...headers },
       ...options,
     });
     ```
   - O que verificar: todos os pedidos incluem `credentials: 'include'`.

4. **Objetivo (~25 min): Tratar respostas sem body e JSON invalido**
   - Descricao detalhada do objetivo: garantir que o cliente nao crasha quando a API responde 204 ou texto inesperado.
   - Justificacao: APIs reais nem sempre devolvem JSON em todos os cenarios.
   - Como fazer (4.1): criar helper `parseJsonResponse(response)`.
   - Como fazer (4.2): se JSON for invalido, lançar `ApiError` controlado.
   - Ficheiro a rever: `backend/src/middlewares/error.middleware.js`
   - Ficheiro alvo: `frontend/src/services/api/apiClient.js`
   - Snippet de referencia:
     ```js
     if (response.status === 204) return null;
     ```
   - O que verificar: erro de parsing nao aparece como crash visual.

5. **Objetivo (~25 min): Criar service tecnico de sistema**
   - Descricao detalhada do objetivo: criar uma chamada pequena para validar o backend base.
   - Justificacao: permite smoke sem inventar endpoints de negocio.
   - Como fazer (5.1): criar `frontend/src/services/api/systemApi.js`.
   - Como fazer (5.2): implementar `getApiInfo()` chamando `GET /api`.
   - Ficheiro a rever: `backend/src/modules/system/system.routes.js`
   - Ficheiro alvo: `frontend/src/services/api/systemApi.js`
   - Snippet de referencia:
     ```js
     import { apiClient } from './apiClient.js';
     export const systemApi = { getApiInfo: () => apiClient.get('/api') };
     ```
   - O que verificar: nao sao criadas chamadas para login, catalogo ou pagamentos.

6. **Objetivo (~30 min): Criar componente de estado da API**
   - Descricao detalhada do objetivo: mostrar loading, sucesso e erro de forma controlada.
   - Justificacao: os alunos precisam ver como ligar service e UI sem duplicar logica.
   - Como fazer (6.1): criar `ApiStatusBadge.jsx` ou componente equivalente.
   - Como fazer (6.2): usar mensagens de `apiErrors.js` quando a chamada falhar.
   - Ficheiro a rever: `frontend/src/components/ui/EmptyState.jsx`
   - Ficheiro alvo: `frontend/src/components/system/ApiStatusBadge.jsx`
   - Snippet de referencia:
     ```jsx
     if (state.status === 'error') {
       return <p role="status">{getUserFriendlyErrorMessage(state.error)}</p>;
     }
     ```
   - O que verificar: backend offline nao deixa a pagina em branco.

7. **Objetivo (~20 min): Adicionar contexto tecnico sem poluir a UI**
   - Descricao detalhada do objetivo: registar contexto util para debug apenas em desenvolvimento.
   - Justificacao: `RNF30` pede contexto suficiente, mas a UI nao deve expor detalhes internos.
   - Como fazer (7.1): criar helper `reportClientApiError(error, context)`.
   - Como fazer (7.2): em `development`, usar `console.warn(JSON.stringify(...))`; em producao, deixar TODO para observabilidade futura.
   - Ficheiro a rever: `docs/RNF.md`
   - Ficheiro alvo: `frontend/src/services/api/apiErrors.js`
   - Snippet de referencia:
     ```js
     if (import.meta.env.DEV) {
       console.warn(JSON.stringify({ level: 'warn', message: error.message, context }));
     }
     ```
   - O que verificar: dados sensiveis, passwords e cookies nunca sao logados.

8. **Objetivo (~25 min): Validar negativos e handoff**
   - Descricao detalhada do objetivo: testar sucesso, backend offline e respostas de erro.
   - Justificacao: um API client sem negativos costuma falhar logo no primeiro erro real.
   - Como fazer (8.1): correr frontend com backend ligado e testar `GET /api`.
   - Como fazer (8.2): desligar backend e confirmar mensagem amigavel.
   - Ficheiro a rever: `frontend/src/services/api/apiClient.js`
   - Ficheiro alvo: evidence do PR/defesa
   - Snippet de referencia:
     ```bash
     npm run build
     ```
   - O que verificar: build passa, erro offline e controlado, e `BK-MF1-04` recebe contrato de cookies preparado.

#### Checklist de validacao (DERIVADO):

**Smoke**
- [ ] `npm run build` no frontend passa.
- [ ] `apiClient.get('/api')` funciona quando backend esta ligado.
- [ ] Com backend desligado, aparece mensagem amigavel.
- [ ] Todos os pedidos usam `credentials: 'include'`.

**Negativos**
- [ ] Passo: 8; input/acao: desligar backend e recarregar componente; resultado esperado: mensagem "Nao foi possivel ligar ao servidor"; risco que cobre: crash por rede indisponivel.
- [ ] Passo: 8; input/acao: chamar endpoint inexistente; resultado esperado: mensagem 404 controlada; risco que cobre: rota errada sem feedback.
- [ ] Passo: 4; input/acao: simular resposta sem JSON valido; resultado esperado: `ApiError` controlado; risco que cobre: erro de parsing quebrar UI.

**Tecnico**
- [ ] Nao ha `fetch` direto em paginas, salvo exemplos temporarios removidos.
- [ ] Base URL vem de configuracao.
- [ ] Erros têm estrutura consistente.
- [ ] Sem dependencia nova quando `fetch` nativo e suficiente.

**Regressao das fases anteriores**
- [ ] Mantem estrutura criada em `BK-MF1-02`.
- [ ] Nao altera metadados canonicos.
- [ ] Usa DoD/evidence da MF0.

**UI/mockup**
- [ ] Mensagens sao claras e discretas, alinhadas com a linguagem simples do mockup.
- [ ] O componente tecnico nao transforma a home numa pagina de diagnostico.

**Seguranca**
- [ ] Sem tokens em `localStorage` ou `sessionStorage`.
- [ ] Cookies enviados por browser via `credentials: 'include'`.
- [ ] Logs frontend nao incluem passwords, cookies, tokens ou dados sensiveis.

#### Criterios de aceite:

**Outputs:**
- `apiClient.js`, `apiErrors.js`, `env.js` e `.env.example` criados.
- Service tecnico `systemApi.getApiInfo()` criado sem inventar feature.
- Componente de estado API criado ou documentado para smoke.

**Verificacoes:**
- Build frontend executa sem erro.
- Backend offline mostra erro controlado.
- 404 e JSON invalido sao tratados.

**Qualidade:**
- Chamadas HTTP centralizadas.
- Mensagens em PT-PT e adequadas ao utilizador.
- Sem dependencias novas injustificadas.

**Continuidade:**
- `BK-MF1-04` pode usar cookies HttpOnly sem mudar o cliente.
- `MF2` pode criar `authApi`, `catalogApi` e outros services sobre o mesmo cliente.
- `BK-MF1-06` pode testar cenarios de erro com base neste cliente.

**Evidencia:**
- PR/commit com cliente API.
- Output de `npm run build`.
- Captura ou log de sucesso e erro offline.
- Registo dos 3 negativos.

#### Evidence (para o PR/defesa):

- `pr`: `A preencher no fecho do BK`
- `proof`: `A preencher apos validacao`
- `neg`: `A preencher apos testes negativos`
- `files`: `frontend/src/services/api/apiClient.js`, `frontend/src/services/api/apiErrors.js`, `frontend/src/services/api/systemApi.js`, `frontend/src/config/env.js`, `frontend/.env.example`
- `commands`: `npm run build`, `npm run dev`
- `screenshots`: `A preencher com sucesso API e erro offline`
- `notes`: `Fetch nativo escolhido para reduzir dependencias; Axios fica como TODO se orientador exigir`

#### TODOs

- TODO: confirmar se a equipa quer manter `fetch` nativo ou usar Axios conforme sugestao tecnica em `RNF.md`.
- TODO: alinhar formato definitivo de erro backend quando `BK-MF1-05` adicionar request id/logging.
- TODO (BLOCKER): se o frontend ainda nao existir, executar `BK-MF1-02` antes.
- FOLLOW-UP: `BK-MF1-04` deve garantir cookies compativeis com `credentials: 'include'`.
- FOLLOW-UP: `MF2` deve criar services por dominio, nao chamadas API dentro das paginas.
- Assuncao tecnica: cliente API com `fetch` nativo e JavaScript ES Modules.
- Decisoes dependentes de mockup: estilo final de mensagens e badges.
- Decisoes dependentes de app/codigo ainda inexistente: nomes finais das paginas onde o estado tecnico aparecera.

## Snippet tecnico aplicavel

```js
// frontend/src/services/api/apiClient.js
import { env } from '../../config/env.js';
import { ApiError } from './apiErrors.js';

async function request(path, options = {}) {
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
    ...options,
  });

  const data = response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError({
      status: response.status,
      message: data?.message ?? 'Pedido API falhou.',
      details: data?.details,
      requestId: response.headers.get('x-request-id'),
    });
  }

  return data;
}

export const apiClient = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
};
```

## Proximo BK recomendado

`BK-MF1-04`, que deve preparar sessao segura backend com cookies HttpOnly compativeis com este cliente API.

## Changelog

- `2026-05-27`: refinado para guia executavel de cliente API frontend, preservando metadados canonicos e preparando contrato de cookies sem implementar auth funcional.
