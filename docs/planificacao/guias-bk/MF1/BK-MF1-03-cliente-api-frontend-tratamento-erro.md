# BK-MF1-03 - Cliente API frontend com tratamento de erro

## Header

- `doc_id`: `GUIA-BK-MF1-03`
- `bk_id`: `BK-MF1-03`
- `macro`: `MF1`
- `owner`: `Mateus`
- `apoio`: `Matheus`
- `prioridade`: `P0`
- `estado`: `DONE`
- `esforco`: `M`
- `dependencias`: `BK-MF1-02`
- `rf_rnf`: `RNF05, RNF30`
- `fase_documental`: `Fase 1`
- `sprint`: `S02`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF1-04`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-03-cliente-api-frontend-tratamento-erro.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Criar a camada central que permite ao frontend comunicar com o backend, com URL
validada, cookies, timeout, cancelamento, erros seguros e proteção CSRF.

#### Importância

Quando várias páginas chamam a API, não devem repetir a mesma lógica. Uma única
porta de entrada mantém consistentes os erros, cookies, URLs e controlos de
segurança.

#### Scope-in

- Configurar `VITE_API_BASE_URL`.
- Criar `ApiError` e mensagens de erro.
- Criar `apiClient` com `get`, `post`, `put`, `patch` e `del`.
- Normalizar o envelope `{ code, message, requestId, details? }` devolvido pelo backend.
- Preparar o cliente central para obter e renovar o token CSRF apenas em memoria.
- Criar `systemApi` para validar `GET /api`.
- Mostrar estado tecnico da API na home sem transformar a home em dashboard.

#### Scope-out

- Login real.
- Catalogo real.
- Streaming.
- Persistencia de tokens em `localStorage` ou `sessionStorage`.
- Regras financeiras, subscricoes ou pool solidaria.

#### Estado antes e depois

- Antes: componentes podem chamar `fetch` diretamente e tratar falhas de forma
  divergente.
- Depois: todas as chamadas passam por `apiClient`, com contrato previsível e
  integração dev-only para provar a conectividade inicial.

#### Pré-requisitos

- `BK-MF1-02` executado, com `frontend/` criado.
- Backend de `BK-MF1-01` disponível para testar `GET /api`.
- Confirmar `frontend/src/pages/pages.jsx`, `frontend/src/styles/global.css` e
  `frontend/src/services/api/`.
- Confirmar que não existem chamadas `fetch` diretas nas páginas.

#### Glossário

- `API base URL`: origem do backend usada para construir os pedidos.
- `ApiError`: erro normalizado que a UI consegue tratar sem expor detalhes internos.
- `AbortSignal`: sinal usado para cancelar um pedido já iniciado.
- `CSRF`: ataque que tenta executar uma mutação autenticada a partir de outra origem.
- `requestId`: identificador técnico seguro para correlacionar pedido e log.

#### Conceitos teóricos essenciais

Este guia usa `fetch` nativo para reduzir dependências e tornar o fluxo visível.
Uma alternativa futura só é válida se preservar timeout, cancelamento, cookies,
CSRF e o envelope de erro.

Os snippets dos Passos 1 e 2 implementam diretamente os contratos atuais:

- erros HTTP seguem `{ code, message, requestId, details? }`; um erro `5xx` não
  expõe stack trace ou detalhes internos;
- `ApiError` preserva `status`, `code`, `message`, `details` e `requestId`;
- `POST`, `PUT`, `PATCH` e `DELETE` autenticados obtêm
  `GET /api/session/csrf-token` e enviam `X-CSRF-Token`;
- o token CSRF existe apenas em memória, é limpo em logout/`401` e
  `CSRF_INVALID` permite uma única renovação e repetição;
- respostas `204`/`205`, JSON inválido, timeout, cancelamento e falhas de rede
  têm tratamento explícito.

Check de compreensão:

- [ ] Sei explicar porque nao devemos espalhar `fetch` por todas as paginas.
- [ ] Sei explicar porque `credentials: 'include'` e importante para cookies HttpOnly.
- [ ] Sei explicar porque o token CSRF nao fica em `localStorage` nem `sessionStorage`.
- [ ] Sei testar sucesso, 404 e backend offline.

#### Arquitetura do BK

| Origem | Fluxo | Destino |
| --- | --- | --- |
| Página/service | chama método tipado | `apiClient` |
| `apiClient` | valida origem, timeout, CSRF e resposta | API Express |
| API Express | devolve dados ou erro normalizado | UI |

O token CSRF permanece no módulo em memória; nenhum segredo é persistido no
storage do browser.

#### Ficheiros a criar/editar/rever

- Criar `frontend/.env.example` e `frontend/src/config/{apiBaseUrl,env}.js`.
- Criar `frontend/src/services/api/{apiErrors,apiClient,systemApi}.js`.
- Criar `frontend/src/components/system/ApiStatusBadge.jsx`.
- Editar `frontend/src/pages/pages.jsx` e `frontend/src/styles/global.css`.
- Rever `backend/README.md`, `RNF05`, `RNF15`, `RNF25` e `RNF30`.

#### Tutorial técnico linear

### Passo 1 - Configurar a origem da API

1. Objetivo funcional do passo no contexto da app.

Definir onde o frontend encontra o backend, sem escrever URLs fixas dentro dos componentes.

2. Ficheiros envolvidos.
    - CRIAR: `frontend/.env.example`
    - CRIAR: `frontend/src/config/apiBaseUrl.js`
    - CRIAR: `frontend/src/config/env.js`
    - LOCALIZACAO: `frontend/` e `frontend/src/config/`
    - REVER: `backend/README.md`

3. Instruções do que fazer.

Cria a pasta `frontend/src/config/`. O ficheiro `.env.example` mostra a variavel esperada; cada ambiente real pode ter o seu `.env`, sem o colocar no Git.

4. Código completo, correto e integrado com a app final.

**`frontend/.env.example`**

```env
VITE_API_BASE_URL=http://localhost:3000
```

5. Explicação do código.

Em Vite, variaveis expostas ao frontend precisam de comecar por `VITE_`. Aqui guardamos apenas a origem da API. Nao guardamos passwords nem tokens, porque tudo o que vai para o frontend pode ser visto pelo utilizador.

**Código complementar integrado no mesmo passo — `frontend/src/config/apiBaseUrl.js`.**

```js
const LOCAL_MODES = new Set(["development", "test"]);
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

// A allowlist distingue loopback de hosts remotos sem aceitar correspondências parciais inseguras.
function isLocalHost(hostname) {
    const normalized = hostname.toLowerCase();
    return LOCAL_HOSTS.has(normalized) || normalized.endsWith(".localhost");
}

export function resolveApiBaseUrl({ rawValue, mode = "production" } = {}) {
    const localMode = LOCAL_MODES.has(mode);
    const configured = typeof rawValue === "string" ? rawValue.trim() : "";
    const candidate = configured || (localMode ? "http://localhost:3000" : "");

    if (!candidate) {
        throw new Error(
            "VITE_API_BASE_URL é obrigatório fora de development/test.",
        );
    }

    let parsed;
    try {
        parsed = new URL(candidate);
    } catch {
        throw new Error("VITE_API_BASE_URL tem de ser uma URL absoluta válida.");
    }

    const localHost = isLocalHost(parsed.hostname);
    if (parsed.username || parsed.password || parsed.search || parsed.hash) {
        throw new Error(
            "VITE_API_BASE_URL não pode incluir credenciais, query ou fragmento.",
        );
    }

    // HTTP só é tolerado em desenvolvimento/teste e apenas para um host local reconhecido.
    if (parsed.protocol !== "https:") {
        const localHttp = localMode && localHost && parsed.protocol === "http:";
        if (!localHttp) {
            throw new Error(
                "VITE_API_BASE_URL exige HTTPS; HTTP só é aceite localmente em development/test.",
            );
        }
    }

    if (!localMode && localHost) {
        throw new Error(
            "VITE_API_BASE_URL não pode apontar para localhost em produção.",
        );
    }

    return parsed.toString().replace(/\/+$/, "");
}
```

**Código complementar integrado no mesmo passo — `frontend/src/config/env.js`.**

```js
import { resolveApiBaseUrl } from "./apiBaseUrl.js";

export const env = Object.freeze({
    apiBaseUrl: resolveApiBaseUrl({
        rawValue: import.meta.env.VITE_API_BASE_URL,
        mode: import.meta.env.MODE ?? "production",
    }),
});
```

**Explicação complementar.**

O exemplo local pode usar HTTP apenas em loopback. Fora dos modos
`development/test`, a variável é obrigatória, tem de usar HTTPS e não pode
apontar para localhost. Credenciais, query strings e fragmentos são recusados.
A normalização remove a barra final e evita URLs com `//api`.

6. Validação do passo.

Executar dentro de `frontend/`:

```bash
npm run build
```

7. Cenário negativo/erro esperado.

Erro comum: colocar a URL da API diretamente dentro de cada pagina. Quando a API mudar de ambiente, seria preciso editar muitos ficheiros.

### Passo 2 - Criar erros API e cliente HTTP central

1. Objetivo funcional do passo no contexto da app.

Criar um cliente API reutilizavel, com erros normalizados e cookies incluidos em todos os pedidos.

2. Ficheiros envolvidos.
    - CRIAR: `frontend/src/services/api/apiErrors.js`
    - CRIAR: `frontend/src/services/api/apiClient.js`
    - LOCALIZACAO: `frontend/src/services/api/`
    - REVER: `RNF05`, `RNF15`, `RNF25`, `RNF30`

3. Instruções do que fazer.

Substitui o README temporario de `services/api/` por ficheiros reais, mantendo o README se quiseres documentacao extra. Todos os pedidos ao backend devem passar por `apiClient`.

4. Código completo, correto e integrado com a app final.

**`frontend/src/services/api/apiErrors.js`**

```js
// O erro normalizado conserva o requestId para suporte sem expor detalhes internos ao utilizador.
export class ApiError extends Error {
    constructor({
        status,
        code = "REQUEST_FAILED",
        message,
        details = undefined,
        requestId = undefined,
    }) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.code = code;
        this.details = details;
        this.requestId = requestId;
    }
}

export function getDefaultApiErrorMessage(status) {
    // A UI recebe mensagens controladas por classe de estado, nunca texto técnico do transporte.
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

export function getClientApiErrorMessage(code) {
    if (code === "REQUEST_TIMEOUT") {
        return "O servidor demorou demasiado a responder. Tenta novamente.";
    }

    if (code === "REQUEST_ABORTED") {
        return "O pedido foi cancelado.";
    }

    if (code === "INVALID_RESPONSE") {
        return "O servidor devolveu uma resposta invalida. Tenta novamente.";
    }

    if (code === "CSRF_TOKEN_INVALID") {
        return "Nao foi possivel preparar o pedido em seguranca. Atualiza a pagina e tenta novamente.";
    }

    return getDefaultApiErrorMessage(0);
}

export function toUserMessage(error) {
    if (error instanceof ApiError) {
        return error.message;
    }

    return "Ocorreu um erro inesperado. Tenta novamente.";
}
```

5. Explicação do código.

`ApiError` guarda informacao util para a UI: codigo HTTP, mensagem, detalhes e `requestId`. A funcao `getDefaultApiErrorMessage` evita mensagens tecnicas como `Failed to fetch`, que nao ajudam o utilizador. `toUserMessage` garante que a UI tem sempre uma mensagem segura.

**Código complementar integrado no mesmo passo — `frontend/src/services/api/apiClient.js`.**

```js
import { env } from "../../config/env.js";
import {
    ApiError,
    getClientApiErrorMessage,
    getDefaultApiErrorMessage,
} from "./apiErrors.js";

export const API_REQUEST_TIMEOUT_MS = 10_000;

const CSRF_ENDPOINT = "/api/session/csrf-token";
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

let csrfToken = null;
let unauthorizedHandler = null;

/** Limpa o token mantido exclusivamente na memória deste módulo. */
export function clearCsrfToken() {
    csrfToken = null;
}

/** Regista o callback global usado pelo SessionProvider perante HTTP 401. */
export function setUnauthorizedHandler(handler) {
    if (handler !== null && typeof handler !== "function") {
        throw new TypeError("O callback de 401 tem de ser uma função ou null.");
    }

    unauthorizedHandler = handler;
    return () => {
        if (unauthorizedHandler === handler) {
            unauthorizedHandler = null;
        }
    };
}

function buildUrl(path) {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${env.apiBaseUrl}${normalizedPath}`;
}

/** Combina o AbortSignal do chamador com um timeout total. */
function createAbortScope(externalSignal, timeoutMs) {
    const controller = new AbortController();
    let timedOut = false;
    const abortFromCaller = () => controller.abort(externalSignal?.reason);

    if (externalSignal?.aborted) {
        abortFromCaller();
    } else {
        externalSignal?.addEventListener("abort", abortFromCaller, {
            once: true,
        });
    }

    const timeoutId = globalThis.setTimeout(() => {
        timedOut = true;
        controller.abort();
    }, timeoutMs);

    return {
        signal: controller.signal,
        didTimeout: () => timedOut,
        cleanup() {
            globalThis.clearTimeout(timeoutId);
            externalSignal?.removeEventListener("abort", abortFromCaller);
        },
    };
}

async function parseResponseBody(response) {
    if (response.status === 204 || response.status === 205) {
        return null;
    }

    const text = await response.text();
    const contentType =
        response.headers.get("content-type")?.toLowerCase() ?? "";
    const requestId =
        response.headers.get("x-request-id") ?? undefined;

    // Só 204/205 representam sucesso sem representação. Qualquer outro 2xx
    // tem de entregar JSON válido para não transformar um proxy/HTML vazio em sucesso.
    if (response.ok && (!text.trim() || !contentType.includes("json"))) {
        throw new ApiError({
            status: response.status,
            code: "INVALID_RESPONSE",
            message: getClientApiErrorMessage("INVALID_RESPONSE"),
            requestId,
        });
    }

    // Em respostas de erro, um corpo vazio ou não JSON nunca é mostrado ao
    // utilizador; performFetch aplica a mensagem segura do estado HTTP.
    if (!text.trim() || !contentType.includes("json")) {
        return null;
    }

    try {
        return JSON.parse(text);
    } catch {
        if (!response.ok) {
            return null;
        }

        throw new ApiError({
            status: response.status,
            code: "INVALID_RESPONSE",
            message: getClientApiErrorMessage("INVALID_RESPONSE"),
            requestId,
        });
    }
}

function notifyUnauthorized(error) {
    clearCsrfToken();
    try {
        unauthorizedHandler?.(error);
    } catch {
        // O callback da UI não pode substituir o erro HTTP original.
    }
}

/** Executa uma tentativa HTTP já preparada. */
async function performFetch(
    path,
    { method, body, headers, signal, ...options },
) {
    const requestHeaders = new Headers(headers);
    requestHeaders.set("Accept", "application/json");

    const requestOptions = {
        ...options,
        method,
        credentials: "include",
        headers: requestHeaders,
        signal,
    };

    if (body !== undefined) {
        requestHeaders.set("Content-Type", "application/json");
        requestOptions.body = JSON.stringify(body);
    }

    const response = await fetch(buildUrl(path), requestOptions);
    let data;

    try {
        data = await parseResponseBody(response);
    } catch (error) {
        if (response.status === 401 && error instanceof ApiError) {
            notifyUnauthorized(error);
        }
        throw error;
    }

    if (response.ok) {
        return data;
    }

    const responseIsJson =
        response.headers.get("content-type")?.toLowerCase().includes("json") ===
        true;
    const payload =
        data && typeof data === "object" && !Array.isArray(data) ? data : {};
    const error = new ApiError({
        status: response.status,
        code:
            responseIsJson && typeof payload.code === "string"
                ? payload.code
                : "REQUEST_FAILED",
        message:
            responseIsJson && typeof payload.message === "string"
                ? payload.message
                : getDefaultApiErrorMessage(response.status),
        details: response.status >= 500 ? undefined : payload.details,
        requestId:
            response.headers.get("x-request-id") ??
            (typeof payload.requestId === "string"
                ? payload.requestId
                : undefined),
    });

    if (response.status === 401) {
        notifyUnauthorized(error);
    }

    throw error;
}

/** Obtém e valida o token CSRF da sessão atual. */
async function ensureCsrfToken(signal) {
    if (csrfToken) {
        return csrfToken;
    }

    const response = await performFetch(CSRF_ENDPOINT, {
        method: "GET",
        signal,
    });
    const receivedToken =
        response && typeof response === "object"
            ? response.csrfToken
            : undefined;

    if (typeof receivedToken !== "string" || !receivedToken.trim()) {
        throw new ApiError({
            status: 0,
            code: "CSRF_TOKEN_INVALID",
            message: getClientApiErrorMessage("CSRF_TOKEN_INVALID"),
        });
    }

    csrfToken = receivedToken;
    return csrfToken;
}

/** Acrescenta CSRF a métodos inseguros e permite uma única rotação. */
async function performRequest(path, { csrf = true, ...options }) {
    if (SAFE_METHODS.has(options.method) || !csrf) {
        return performFetch(path, options);
    }

    for (let attempt = 0; attempt < 2; attempt += 1) {
        const token = await ensureCsrfToken(options.signal);
        const csrfHeaders = new Headers(options.headers);
        csrfHeaders.set("X-CSRF-Token", token);

        try {
            return await performFetch(path, {
                ...options,
                headers: csrfHeaders,
            });
        } catch (error) {
            const canRenew =
                attempt === 0 &&
                error instanceof ApiError &&
                error.code === "CSRF_INVALID";

            if (!canRenew) {
                throw error;
            }

            clearCsrfToken();
        }
    }

    throw new ApiError({
        status: 0,
        code: "CSRF_TOKEN_INVALID",
        message: getClientApiErrorMessage("CSRF_TOKEN_INVALID"),
    });
}

/** Envia um pedido central com timeout, cancelamento e erro seguro. */
async function request(
    path,
    {
        method = "GET",
        body,
        headers,
        timeoutMs = API_REQUEST_TIMEOUT_MS,
        signal: externalSignal,
        csrf = true,
        ...options
    } = {},
) {
    const normalizedMethod = method.toUpperCase();
    const normalizedTimeout =
        Number.isFinite(timeoutMs) && timeoutMs > 0
            ? timeoutMs
            : API_REQUEST_TIMEOUT_MS;
    const abortScope = createAbortScope(externalSignal, normalizedTimeout);

    try {
        return await performRequest(path, {
            ...options,
            method: normalizedMethod,
            body,
            headers,
            csrf,
            signal: abortScope.signal,
        });
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        const code = abortScope.signal.aborted
            ? abortScope.didTimeout()
                ? "REQUEST_TIMEOUT"
                : "REQUEST_ABORTED"
            : "NETWORK_ERROR";

        throw new ApiError({
            status: 0,
            code,
            message:
                code === "NETWORK_ERROR"
                    ? getDefaultApiErrorMessage(0)
                    : getClientApiErrorMessage(code),
        });
    } finally {
        abortScope.cleanup();
    }
}

export const apiClient = Object.freeze({
    get: (path, options) => request(path, { ...options, method: "GET" }),
    post: (path, body, options) =>
        request(path, { ...options, method: "POST", body }),
    put: (path, body, options) =>
        request(path, { ...options, method: "PUT", body }),
    patch: (path, body, options) =>
        request(path, { ...options, method: "PATCH", body }),
    del: (path, options) => request(path, { ...options, method: "DELETE" }),
});
```

**Explicação complementar.**

O cliente trata apenas `204` e `205` como sucesso sem corpo. Qualquer outro `2xx`
vazio, sem `Content-Type` JSON ou com JSON inválido lança
`ApiError(INVALID_RESPONSE)` e preserva o `requestId`. O cliente aplica ainda um
timeout total de 10 segundos e combina-o com o
`AbortSignal` do chamador. Falhas de rede não expõem a mensagem técnica capturada.
Mutações autenticadas obtêm o token CSRF para memória e repetem no máximo uma
vez perante `CSRF_INVALID`. Um `401` limpa CSRF e notifica o contexto de sessão.

6. Validação do passo.

Executar:

```bash
npm run build
```

7. Cenário negativo/erro esperado.

Erro comum: guardar tokens no browser para "resolver" auth. Este BK prepara cookies seguros; nao deve criar `localStorage.setItem('token', ...)`.

### Passo 3 - Criar service tecnico e componente de estado da API dev-only

1. Objetivo funcional do passo no contexto da app.

Usar o cliente API para verificar se o backend responde, mostrando uma mensagem simples na home inicial da MF1.

Nota de estado final: `ApiStatusBadge` e o texto `Estado API` são artefactos tecnicos/dev-only desta fase. Servem para provar conectividade enquanto a app ainda nao tem discovery real. Nao devem aparecer na experiencia final da home publica.

2. Ficheiros envolvidos.
    - CRIAR: `frontend/src/services/api/systemApi.js`
    - CRIAR: `frontend/src/components/system/ApiStatusBadge.jsx`
    - LOCALIZACAO: `frontend/src/services/api/` e `frontend/src/components/system/`
    - REVER: `BK-MF1-01`, rota `GET /api`

3. Instruções do que fazer.

Cria a pasta `components/system/`. O componente deve ser pequeno e tecnico: ele mostra conectividade, nao conteudo de negocio.

4. Código completo, correto e integrado com a app final.

**`frontend/src/services/api/systemApi.js`**

```js
import { apiClient } from "./apiClient.js";

export function getApiStatus() {
    return apiClient.get("/api");
}
```

5. Explicação do código.

Mesmo sendo uma chamada pequena, criamos um service. Assim, as paginas nao precisam de saber caminhos da API. No futuro podem existir services como `authApi`, `catalogApi` e `subscriptionApi`.

**Código complementar integrado no mesmo passo — `frontend/src/components/system/ApiStatusBadge.jsx`.**

```jsx
import { useEffect, useState } from "react";
import { toUserMessage } from "../../services/api/apiErrors.js";
import { getApiStatus } from "../../services/api/systemApi.js";

export function ApiStatusBadge() {
    // O estado inicial é anunciado como verificação em curso, sem assumir que a API está disponível.
    const [state, setState] = useState({
        status: "checking",
        message: "A verificar ligacao ao backend...",
    });

    useEffect(() => {
        // O sinal local impede que uma resposta tardia atualize um componente já desmontado.
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

**Explicação complementar.**

`useEffect` corre quando o componente aparece no ecra. A variavel `isActive` evita tentar atualizar estado depois de o componente desmontar. `aria-live="polite"` permite que leitores de ecra recebam a atualizacao sem interromper o utilizador.

6. Validação do passo.

Com backend ligado, o componente deve mostrar API online. Com backend desligado, deve mostrar uma mensagem clara de erro.

7. Cenário negativo/erro esperado.

Erro comum: fazer o componente assumir que a resposta existe sempre. O `.catch()` e obrigatorio porque redes falham.

### Passo 4 - Integrar o estado da API na home inicial e no CSS dev-only

1. Objetivo funcional do passo no contexto da app.

Mostrar o estado tecnico na pagina inicial da MF1 sem alterar o escopo funcional da home.

Nota de estado final: esta integracao e historica/dev-only. Quando a home publica passa a usar catalogo real, hero de discovery, `Mais vistos`, `Adicionados recentemente` e atalhos por formato, o `ApiStatusBadge` deve sair da experiencia final.

2. Ficheiros envolvidos.
    - EDITAR: `frontend/src/pages/pages.jsx`
    - EDITAR: `frontend/src/styles/global.css`
    - LOCALIZACAO: substituir o ficheiro `pages.jsx` pelo conteudo abaixo e acrescentar o CSS no fim de `global.css`
    - REVER: `BK-MF1-02`

3. Instruções do que fazer.

Substitui `frontend/src/pages/pages.jsx` pelo ficheiro completo abaixo. Depois acrescenta o bloco CSS no fim de `global.css`.

4. Código completo, correto e integrado com a app final.

**`frontend/src/pages/pages.jsx`**

```jsx
import { Link } from "react-router-dom";
import { ApiStatusBadge } from "../components/system/ApiStatusBadge.jsx";
import { BaseButton } from "../components/ui/BaseButton.jsx";
import { ContentCard } from "../components/ui/ContentCard.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { TextField } from "../components/ui/TextField.jsx";

// Esta home mostra apenas conectividade técnica e continua sem simular catálogo ou sessão reais.
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
    // O formulário permanece explicitamente inativo até o fluxo de identidade ser implementado em MF2.
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

5. Explicação do código.

A unica mudanca funcional face ao BK anterior e a entrada de `ApiStatusBadge` na home inicial da MF1. Isto mostra conectividade tecnica sem criar login, catalogo ou dados falsos. Este badge e legado/dev-only e deve ser removido da home final quando houver discovery real.

**Código complementar integrado no mesmo passo — `frontend/src/styles/global.css`.**

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

**Explicação complementar.**

O CSS diferencia visualmente os estados sem usar texto tecnico complexo. Verde indica ligacao, vermelho indica falha. Mantemos a mesma linguagem visual do frontend base.

6. Validação do passo.

Executar `npm run build`. Depois arrancar backend e frontend e abrir `/`.

7. Cenário negativo/erro esperado.

Erro comum: transformar a home num painel tecnico cheio de detalhes internos. O estado da API deve ser curto e util.

### Passo 5 - Validar sucesso, 404 e backend offline

1. Objetivo funcional do passo no contexto da app.

Garantir que o cliente API se comporta bem quando tudo corre certo e quando algo falha.

2. Ficheiros envolvidos.
    - EDITAR: nenhum, se os passos anteriores estiverem corretos
    - LOCALIZACAO: executar comandos em `backend/` e `frontend/`
    - REVER: `apiClient.js`, `apiErrors.js`, `ApiStatusBadge.jsx`

3. Instruções do que fazer.

Testa os tres cenarios abaixo e guarda outputs/capturas.

4. Código completo, correto e integrado com a app final.

```json
{
    "service": "faithflix-api",
    "name": "FaithFlix API",
    "version": "0.1.0",
    "status": "ok"
}
```

5. Explicação do código.

Este caso prova que o frontend consegue contactar a API base criada no `BK-MF1-01`.

**Resposta complementar esperada em erro 404.**

```json
{
    "code": "REQUEST_FAILED",
    "message": "Recurso nao encontrado.",
    "details": {
        "path": "/api/nao-existe"
    },
    "requestId": "identificador-do-pedido"
}
```

**Explicação complementar do erro 404.**

O cliente API deve transformar esta resposta num `ApiError`, preservando a mensagem e o codigo HTTP.

**Resultado complementar esperado com backend offline.**

```text
Nao foi possivel contactar o servidor. Confirma a ligacao e tenta novamente.
```

**Explicação complementar do cenário offline.**

Quando o servidor esta desligado, nao existe resposta HTTP. Por isso usamos `status: 0` no `ApiError`. A UI continua a mostrar uma mensagem segura e compreensivel.

6. Validação do passo.

- `npm run build` passa.
- Com backend ligado, a home inicial da MF1 mostra API online.
- Com backend desligado, a home inicial da MF1 mostra erro claro.
- Nenhuma pagina usa `fetch` diretamente.
- Nenhum token e guardado em `localStorage` ou `sessionStorage`.

7. Cenário negativo/erro esperado.

Erro comum: mostrar `TypeError: Failed to fetch` ao utilizador. Isso e linguagem tecnica e falha o `RNF05`.

#### Critérios de aceite

- `frontend/.env.example`, `frontend/src/config/apiBaseUrl.js`,
  `frontend/src/config/env.js`, `apiErrors.js`, `apiClient.js`, `systemApi.js` e
  `ApiStatusBadge.jsx` existem.
- Produção sem `VITE_API_BASE_URL`, com HTTP ou localhost falha antes de arrancar;
  HTTP em loopback só é aceite em `development/test`.
- `apiClient` expoe `get`, `post`, `put`, `patch` e `del`.
- Todos os pedidos usam `credentials: 'include'`.
- Erros preservam `code`, `message`, `requestId` e `details` quando estes existem.
- Mutations autenticadas enviam `X-CSRF-Token`, com no máximo uma rotação em `CSRF_INVALID`.
- O token CSRF existe apenas em memória e é limpo em logout ou `401`.
- O timeout por defeito é 10 segundos, respeita `AbortSignal` externo e nunca
  apresenta a causa técnica capturada ao utilizador.
- `204` e `205` devolvem `null`; qualquer outro `2xx` vazio, sem content type
  JSON ou com JSON inválido produz `INVALID_RESPONSE` seguro com `requestId`
  quando disponível.
- `npm run build` passa dentro de `frontend/`.
- A home inicial da MF1 mostra estado online com backend ligado e mensagem clara com backend desligado; a home final de produto nao mostra `Estado API`.
- Nenhum token e guardado em storage do browser.

#### Validação final

Executar:

```bash
npm --prefix frontend run build
npm --prefix backend run dev
npm --prefix frontend run dev
```

Abrir a home, testar backend ligado/desligado e confirmar a ausencia de `fetch` direto nas paginas.

#### Evidence para PR/defesa

- `pr`: referencia do PR/commit com cliente API.
- `proof`: output de `npm run build` e captura da home com API ligada.
- `neg`: captura/log de API offline, 404 e confirmacao de ausencia de tokens no storage.

#### Handoff

- `BK-MF1-04` deve emitir cookies HttpOnly compativeis com `credentials: 'include'`.
- `MF2` deve criar services por dominio, como `authApi` e `catalogApi`, reutilizando `apiClient`.
- `BK-MF1-05` deve fornecer `x-request-id` para enriquecer erros e logs sem expor dados sensiveis.

#### Changelog

- `2026-07-10`: migrado para o contrato tutorial v2, com 16 secções canónicas e
  sete pontos por passo, preservando o cliente API/CSRF atual.
- `2026-05-30`: reestruturado como tutorial linear, com codigo movido para passos executaveis e sem anexo tecnico no fim.
- `2026-05-29`: acrescentada versao detalhada com cliente API, erros normalizados, componente de estado, payloads/respostas esperadas e negativos.
- `2026-05-27`: refinado para guia executavel de cliente API frontend, preservando metadados canonicos e preparando contrato de cookies sem implementar auth funcional.
- `2026-07-09`: alinhado com envelope de erro estruturado e proteção CSRF em memória da referência docente.
