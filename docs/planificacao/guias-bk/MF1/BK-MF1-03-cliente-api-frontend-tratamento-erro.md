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
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF1-04`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-03-cliente-api-frontend-tratamento-erro.md`
- `last_updated`: `2026-05-30`

## Bloco pedagogico (obrigatorio)

Este BK cria a camada que permite ao frontend falar com o backend de forma organizada. Em vez de cada pagina usar `fetch` diretamente, a app passa a ter um cliente API central, com mensagens de erro em portugues de Portugal, envio de cookies e formato previsivel para erros.

Para alunos do 12.º ano, a ideia principal e simples: quando muitas paginas precisam de chamar a API, nao queremos repetir a mesma logica em todas. Criamos uma "porta de entrada" para pedidos HTTP. Assim, erros, cookies e URLs ficam num unico sitio.

### Decisao tecnica deste guia

Este guia usa `fetch` nativo para reduzir dependencias e manter o codigo transparente para aprendizagem. O `RNF.md` sugere Axios, mas nao obriga a sua utilizacao. Se a equipa decidir usar Axios, deve substituir este cliente de forma coordenada, sem alterar contratos de erro, cookies ou mensagens.

### O que entra

- Configurar `VITE_API_BASE_URL`.
- Criar `ApiError` e mensagens de erro.
- Criar `apiClient` com `get`, `post`, `put`, `patch` e `del`.
- Criar `systemApi` para validar `GET /api`.
- Mostrar estado tecnico da API na home sem transformar a home em dashboard.

### O que nao entra

- Login real.
- Catalogo real.
- Streaming.
- Persistencia de tokens em `localStorage` ou `sessionStorage`.
- Regras financeiras, subscricoes ou pool solidaria.

### Check de compreensao

- [ ] Sei explicar porque nao devemos espalhar `fetch` por todas as paginas.
- [ ] Sei explicar porque `credentials: 'include'` e importante para cookies HttpOnly.
- [ ] Sei testar sucesso, 404 e backend offline.

## Bloco operacional (obrigatorio)

### Pre-condicoes

- `BK-MF1-02` executado, com `frontend/` criado.
- Backend de `BK-MF1-01` disponivel para testar `GET /api`.
- Confirmar que a app frontend usa `frontend/src/pages/pages.jsx`, `frontend/src/styles/global.css` e `frontend/src/services/api/`.
- Confirmar que nao existem chamadas `fetch` diretas em paginas.

### Guia de execucao (passo-a-passo)

### Passo 1 - Configurar a origem da API

1. Objetivo do passo.

Definir onde o frontend encontra o backend, sem escrever URLs fixas dentro dos componentes.

2. Ficheiros envolvidos:
    - CRIAR: `frontend/.env.example`
    - CRIAR: `frontend/src/config/env.js`
    - LOCALIZACAO: `frontend/` e `frontend/src/config/`
    - REVER: `backend/README.md`

3. Instrucoes concretas.

Cria a pasta `frontend/src/config/`. O ficheiro `.env.example` mostra a variavel esperada; cada ambiente real pode ter o seu `.env`, sem o colocar no Git.

4. Codigo do ficheiro `frontend/.env.example`.

```env
VITE_API_BASE_URL=http://localhost:3000
```

5. Explicacao do codigo.

Em Vite, variaveis expostas ao frontend precisam de comecar por `VITE_`. Aqui guardamos apenas a origem da API. Nao guardamos passwords nem tokens, porque tudo o que vai para o frontend pode ser visto pelo utilizador.

6. Codigo do ficheiro `frontend/src/config/env.js`.

```js
const rawApiBaseUrl =
    import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

export const env = {
    apiBaseUrl: rawApiBaseUrl.replace(/\/$/, ""),
};
```

7. Explicacao do codigo.

`apiBaseUrl` remove a barra final, se existir. Assim, `http://localhost:3000/` e `http://localhost:3000` funcionam da mesma forma. Isto evita URLs duplicadas como `http://localhost:3000//api`.

8. Validacao do passo.

Executar dentro de `frontend/`:

```bash
npm run build
```

9. Caso negativo ou erro comum.

Erro comum: colocar a URL da API diretamente dentro de cada pagina. Quando a API mudar de ambiente, seria preciso editar muitos ficheiros.

### Passo 2 - Criar erros API e cliente HTTP central

1. Objetivo do passo.

Criar um cliente API reutilizavel, com erros normalizados e cookies incluidos em todos os pedidos.

2. Ficheiros envolvidos:
    - CRIAR: `frontend/src/services/api/apiErrors.js`
    - CRIAR: `frontend/src/services/api/apiClient.js`
    - LOCALIZACAO: `frontend/src/services/api/`
    - REVER: `RNF05`, `RNF15`, `RNF25`, `RNF30`

3. Instrucoes concretas.

Substitui o README temporario de `services/api/` por ficheiros reais, mantendo o README se quiseres documentacao extra. Todos os pedidos ao backend devem passar por `apiClient`.

4. Codigo do ficheiro `frontend/src/services/api/apiErrors.js`.

```js
export class ApiError extends Error {
    constructor({
        status,
        message,
        details = undefined,
        requestId = undefined,
    }) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.details = details;
        this.requestId = requestId;
    }
}

export function getDefaultApiErrorMessage(status) {
    if (status === 0) {
        return "Nao foi possivel contactar o servidor. Confirma a ligacao e tenta novamente.";
    }

    if (status === 401) {
        return "Sessao nao autenticada. Entra novamente na tua conta.";
    }

    if (status === 403) {
        return "Nao tens permissao para executar esta acao.";
    }

    if (status === 404) {
        return "O recurso pedido nao foi encontrado.";
    }

    if (status >= 500) {
        return "O servidor teve um problema. Tenta novamente dentro de momentos.";
    }

    return "O pedido nao foi concluido. Verifica os dados e tenta novamente.";
}

export function toUserMessage(error) {
    if (error instanceof ApiError) {
        return error.message;
    }

    return "Ocorreu um erro inesperado. Tenta novamente.";
}
```

5. Explicacao do codigo.

`ApiError` guarda informacao util para a UI: codigo HTTP, mensagem, detalhes e `requestId`. A funcao `getDefaultApiErrorMessage` evita mensagens tecnicas como `Failed to fetch`, que nao ajudam o utilizador. `toUserMessage` garante que a UI tem sempre uma mensagem segura.

6. Codigo do ficheiro `frontend/src/services/api/apiClient.js`.

```js
import { env } from "../../config/env.js";
import { ApiError, getDefaultApiErrorMessage } from "./apiErrors.js";

function buildUrl(path) {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${env.apiBaseUrl}${normalizedPath}`;
}

async function parseResponseBody(response) {
    if (response.status === 204) {
        return null;
    }

    const contentType = response.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
        return response.json();
    }

    const text = await response.text();
    return text ? { message: text } : null;
}

async function request(
    path,
    { method = "GET", body, headers = {}, ...options } = {},
) {
    const requestHeaders = {
        Accept: "application/json",
        ...headers,
    };

    const requestOptions = {
        method,
        credentials: "include",
        headers: requestHeaders,
        ...options,
    };

    if (body !== undefined) {
        requestHeaders["Content-Type"] = "application/json";
        requestOptions.body = JSON.stringify(body);
    }

    let response;

    try {
        response = await fetch(buildUrl(path), requestOptions);
    } catch (error) {
        throw new ApiError({
            status: 0,
            message: getDefaultApiErrorMessage(0),
            details: { cause: error.message },
        });
    }

    const data = await parseResponseBody(response);

    if (!response.ok) {
        throw new ApiError({
            status: response.status,
            message:
                data?.message ?? getDefaultApiErrorMessage(response.status),
            details: data?.details,
            requestId: response.headers.get("x-request-id") ?? undefined,
        });
    }

    return data;
}

export const apiClient = {
    get: (path, options) => request(path, { ...options, method: "GET" }),
    post: (path, body, options) =>
        request(path, { ...options, method: "POST", body }),
    put: (path, body, options) =>
        request(path, { ...options, method: "PUT", body }),
    patch: (path, body, options) =>
        request(path, { ...options, method: "PATCH", body }),
    del: (path, options) => request(path, { ...options, method: "DELETE" }),
};
```

7. Explicacao do codigo.

`buildUrl` junta a origem da API ao caminho. `parseResponseBody` lida com respostas JSON, respostas vazias e respostas de texto. `credentials: 'include'` e essencial para o futuro login: permite que cookies HttpOnly enviados pelo backend sejam incluidos nos pedidos. O `try/catch` transforma falhas de rede num `ApiError` com `status: 0`, mais facil de mostrar na UI.

8. Validacao do passo.

Executar:

```bash
npm run build
```

9. Caso negativo ou erro comum.

Erro comum: guardar tokens no browser para "resolver" auth. Este BK prepara cookies seguros; nao deve criar `localStorage.setItem('token', ...)`.

### Passo 3 - Criar service tecnico e componente de estado da API

1. Objetivo do passo.

Usar o cliente API para verificar se o backend responde, mostrando uma mensagem simples na home.

2. Ficheiros envolvidos:
    - CRIAR: `frontend/src/services/api/systemApi.js`
    - CRIAR: `frontend/src/components/system/ApiStatusBadge.jsx`
    - LOCALIZACAO: `frontend/src/services/api/` e `frontend/src/components/system/`
    - REVER: `BK-MF1-01`, rota `GET /api`

3. Instrucoes concretas.

Cria a pasta `components/system/`. O componente deve ser pequeno e tecnico: ele mostra conectividade, nao conteudo de negocio.

4. Codigo do ficheiro `frontend/src/services/api/systemApi.js`.

```js
import { apiClient } from "./apiClient.js";

export function getApiStatus() {
    return apiClient.get("/api");
}
```

5. Explicacao do codigo.

Mesmo sendo uma chamada pequena, criamos um service. Assim, as paginas nao precisam de saber caminhos da API. No futuro podem existir services como `authApi`, `catalogApi` e `subscriptionApi`.

6. Codigo do ficheiro `frontend/src/components/system/ApiStatusBadge.jsx`.

```jsx
import { useEffect, useState } from "react";
import { toUserMessage } from "../../services/api/apiErrors.js";
import { getApiStatus } from "../../services/api/systemApi.js";

export function ApiStatusBadge() {
    const [state, setState] = useState({
        status: "checking",
        message: "A verificar ligacao ao backend...",
    });

    useEffect(() => {
        let isActive = true;

        getApiStatus()
            .then((data) => {
                if (!isActive) {
                    return;
                }

                setState({
                    status: "online",
                    message: `${data.name} ligada (${data.status}).`,
                });
            })
            .catch((error) => {
                if (!isActive) {
                    return;
                }

                setState({
                    status: "offline",
                    message: toUserMessage(error),
                });
            });

        return () => {
            isActive = false;
        };
    }, []);

    return (
        <aside
            className={`api-status api-status-${state.status}`}
            aria-live="polite"
        >
            <strong>Estado API</strong>
            <span>{state.message}</span>
        </aside>
    );
}
```

7. Explicacao do codigo.

`useEffect` corre quando o componente aparece no ecra. A variavel `isActive` evita tentar atualizar estado depois de o componente desmontar. `aria-live="polite"` permite que leitores de ecra recebam a atualizacao sem interromper o utilizador.

8. Validacao do passo.

Com backend ligado, o componente deve mostrar API online. Com backend desligado, deve mostrar uma mensagem clara de erro.

9. Caso negativo ou erro comum.

Erro comum: fazer o componente assumir que a resposta existe sempre. O `.catch()` e obrigatorio porque redes falham.

### Passo 4 - Integrar o estado da API na home e no CSS

1. Objetivo do passo.

Mostrar o estado tecnico na pagina inicial sem alterar o escopo funcional da home.

2. Ficheiros envolvidos:
    - EDITAR: `frontend/src/pages/pages.jsx`
    - EDITAR: `frontend/src/styles/global.css`
    - LOCALIZACAO: substituir o ficheiro `pages.jsx` pelo conteudo abaixo e acrescentar o CSS no fim de `global.css`
    - REVER: `BK-MF1-02`

3. Instrucoes concretas.

Substitui `frontend/src/pages/pages.jsx` pelo ficheiro completo abaixo. Depois acrescenta o bloco CSS no fim de `global.css`.

4. Codigo do ficheiro `frontend/src/pages/pages.jsx`.

```jsx
import { Link } from "react-router-dom";
import { ApiStatusBadge } from "../components/system/ApiStatusBadge.jsx";
import { BaseButton } from "../components/ui/BaseButton.jsx";
import { ContentCard } from "../components/ui/ContentCard.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { TextField } from "../components/ui/TextField.jsx";

export function HomePage() {
    return (
        <section className="page-section hero-section">
            <div className="hero-copy">
                <p className="section-kicker">
                    Streaming cristao com impacto social
                </p>
                <h1>FaithFlix</h1>
                <p>
                    Base inicial da experiencia web. Catalogo, streaming,
                    perfis, subscricoes e pool solidaria entram nos BKs
                    seguintes.
                </p>
                <Link className="button-link" to="/catalogo">
                    Ver estrutura do catalogo
                </Link>
            </div>
            <ApiStatusBadge />
        </section>
    );
}

export function CatalogPage() {
    return (
        <section className="page-section">
            <p className="section-kicker">Catalogo</p>
            <h1>Catalogo FaithFlix</h1>
            <div className="card-grid">
                <ContentCard
                    eyebrow="MF2"
                    title="Metadados de conteudo"
                    description="O CRUD de catalogo e taxonomias sera implementado nos BKs de core streaming."
                />
                <ContentCard
                    eyebrow="MF2"
                    title="Detalhe e reproducao"
                    description="A separacao entre metadados e reproducao sera tratada antes do player."
                />
            </div>
        </section>
    );
}

export function LoginPage() {
    return (
        <section className="page-section narrow-section">
            <p className="section-kicker">Identidade</p>
            <h1>Entrada na conta</h1>
            <form
                className="form-preview"
                aria-label="Formulario de login ainda inativo"
            >
                <TextField
                    id="email-preview"
                    label="Email"
                    type="email"
                    disabled
                    placeholder="Ativado em MF2"
                />
                <TextField
                    id="password-preview"
                    label="Password"
                    type="password"
                    disabled
                    placeholder="Ativado em MF2"
                />
                <BaseButton disabled>Login disponivel em MF2</BaseButton>
            </form>
        </section>
    );
}

export function AssociationsPage() {
    return (
        <EmptyState
            title="Associacoes"
            description="A candidatura e a pool solidaria entram na macrofase de monetizacao solidaria."
        />
    );
}

export function PlansPage() {
    return (
        <EmptyState
            title="Planos"
            description="Os planos e a subscricao serao definidos sem inventar pagamentos reais nesta fase."
        />
    );
}

export function AccountPage() {
    return (
        <EmptyState
            title="Conta"
            description="Perfil, consentimentos e dados pessoais dependem de autenticacao segura."
        />
    );
}

export function NotificationsPage() {
    return (
        <EmptyState
            title="Notificacoes"
            description="As notificacoes transacionais entram depois dos fluxos principais estarem definidos."
        />
    );
}

export function SearchPage() {
    return (
        <EmptyState
            title="Pesquisa"
            description="A pesquisa unificada sera ligada ao catalogo quando existirem conteudos persistidos."
        />
    );
}

export function NotFoundPage() {
    return (
        <EmptyState
            title="Pagina nao encontrada"
            description="Confirma o endereco ou volta ao inicio."
        >
            <Link className="button-link" to="/">
                Voltar ao inicio
            </Link>
        </EmptyState>
    );
}
```

5. Explicacao do codigo.

A unica mudanca funcional face ao BK anterior e a entrada de `ApiStatusBadge` na home. Isto mostra conectividade tecnica sem criar login, catalogo ou dados falsos. O resto das paginas mantem o mesmo contrato para os BKs futuros.

6. Codigo a acrescentar no fim de `frontend/src/styles/global.css`.

```css
.api-status {
    display: grid;
    gap: 0.25rem;
    max-width: 420px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    padding: 1rem;
    box-shadow: var(--shadow-soft);
}

.api-status strong {
    color: var(--color-brand-strong);
}

.api-status-checking {
    border-color: var(--color-border);
}

.api-status-online {
    border-color: #66a88f;
}

.api-status-offline {
    border-color: #c85d5d;
}
```

7. Explicacao do codigo.

O CSS diferencia visualmente os estados sem usar texto tecnico complexo. Verde indica ligacao, vermelho indica falha. Mantemos a mesma linguagem visual do frontend base.

8. Validacao do passo.

Executar `npm run build`. Depois arrancar backend e frontend e abrir `/`.

9. Caso negativo ou erro comum.

Erro comum: transformar a home num painel tecnico cheio de detalhes internos. O estado da API deve ser curto e util.

### Passo 5 - Validar sucesso, 404 e backend offline

1. Objetivo do passo.

Garantir que o cliente API se comporta bem quando tudo corre certo e quando algo falha.

2. Ficheiros envolvidos:
    - EDITAR: nenhum, se os passos anteriores estiverem corretos
    - LOCALIZACAO: executar comandos em `backend/` e `frontend/`
    - REVER: `apiClient.js`, `apiErrors.js`, `ApiStatusBadge.jsx`

3. Instrucoes concretas.

Testa os tres cenarios abaixo e guarda outputs/capturas.

4. Resposta esperada em sucesso `GET /api`.

```json
{
    "service": "faithflix-api",
    "name": "FaithFlix API",
    "version": "0.1.0",
    "status": "ok"
}
```

5. Explicacao didatica.

Este caso prova que o frontend consegue contactar a API base criada no `BK-MF1-01`.

6. Resposta esperada em erro 404.

```json
{
    "message": "Recurso nao encontrado.",
    "details": {
        "path": "/api/nao-existe"
    }
}
```

7. Explicacao didatica.

O cliente API deve transformar esta resposta num `ApiError`, preservando a mensagem e o codigo HTTP.

8. Resultado esperado com backend offline.

```text
Nao foi possivel contactar o servidor. Confirma a ligacao e tenta novamente.
```

9. Explicacao didatica.

Quando o servidor esta desligado, nao existe resposta HTTP. Por isso usamos `status: 0` no `ApiError`. A UI continua a mostrar uma mensagem segura e compreensivel.

10. Validacao do passo.

- `npm run build` passa.
- Com backend ligado, a home mostra API online.
- Com backend desligado, a home mostra erro claro.
- Nenhuma pagina usa `fetch` diretamente.
- Nenhum token e guardado em `localStorage` ou `sessionStorage`.

11. Caso negativo ou erro comum.

Erro comum: mostrar `TypeError: Failed to fetch` ao utilizador. Isso e linguagem tecnica e falha o `RNF05`.

## Criterios de aceite (mensuraveis)

- `frontend/.env.example`, `frontend/src/config/env.js`, `apiErrors.js`, `apiClient.js`, `systemApi.js` e `ApiStatusBadge.jsx` existem.
- `apiClient` expoe `get`, `post`, `put`, `patch` e `del`.
- Todos os pedidos usam `credentials: 'include'`.
- `npm run build` passa dentro de `frontend/`.
- A home mostra estado online com backend ligado e mensagem clara com backend desligado.
- Nenhum token e guardado em storage do browser.

## Validacao final

Executar:

```bash
npm --prefix frontend run build
npm --prefix backend run dev
npm --prefix frontend run dev
```

Abrir a home, testar backend ligado/desligado e confirmar a ausencia de `fetch` direto nas paginas.

## Evidence para PR/defesa

- `pr`: referencia do PR/commit com cliente API.
- `proof`: output de `npm run build` e captura da home com API ligada.
- `neg`: captura/log de API offline, 404 e confirmacao de ausencia de tokens no storage.

## Handoff

- `BK-MF1-04` deve emitir cookies HttpOnly compativeis com `credentials: 'include'`.
- `MF2` deve criar services por dominio, como `authApi` e `catalogApi`, reutilizando `apiClient`.
- `BK-MF1-05` deve fornecer `x-request-id` para enriquecer erros e logs sem expor dados sensiveis.

## Changelog

- `2026-05-30`: reestruturado como tutorial linear, com codigo movido para passos executaveis e sem anexo tecnico no fim.
- `2026-05-29`: acrescentada versao detalhada com cliente API, erros normalizados, componente de estado, payloads/respostas esperadas e negativos.
- `2026-05-27`: refinado para guia executavel de cliente API frontend, preservando metadados canonicos e preparando contrato de cookies sem implementar auth funcional.
