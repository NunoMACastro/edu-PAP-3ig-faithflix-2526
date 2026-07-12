# BK-MF7-02 - Navegação segura por sessão e perfil

## Header

- `doc_id`: `GUIA-BK-MF7-02`
- `bk_id`: `BK-MF7-02`
- `macro`: `MF7`
- `owner`: `Matheus`
- `apoio`: `Mateus, Kaue`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF7-01`
- `rf_rnf`: `RF02, RF04, RNF13, RNF15, RNF16, RNF19`
- `fase_documental`: `Fase 3`
- `sprint`: `S11`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF7-03`
- `guia_path`: `docs/planificacao/guias-bk/MF7/BK-MF7-02-navegacao-segura-por-sessao-e-perfil.md`
- `last_updated`: `2026-07-12`

#### Objetivo

Neste BK vais criar um contexto de sessão no frontend, chamar `authApi.me()`,
distinguir visitante, utilizador autenticado e staff, proteger rotas
administrativas e separar o backoffice da navegação pública.

O resultado observável é `docs/evidence/MF7/NAVEGACAO-SEGURA-POR-PERFIL.md`, com provas de que visitante e utilizador comum não veem nem abrem áreas admin, enquanto o backend continua a devolver `401` e `403` nas operações críticas.

#### Importância

`RF02` exige autenticação e sessão segura. `RF04` exige papéis de utilizador. Na MF7, o frontend deve refletir esses papéis de forma clara, mas sem substituir a autorização backend.

Este BK fecha o risco visual mais crítico da MF7: uma interface que mostra links admin a quem não deve vê-los transmite insegurança, confunde utilizadores e fragiliza a defesa PAP.

#### Scope-in

- Criar `SessionContext` para carregar a sessão atual através de `authApi.me()`.
- Envolver a aplicação com `SessionProvider`.
- Criar `AdminRoute` para bloquear visualmente páginas admin.
- Criar `AdminLayout` e `AdminNavigation` com grupos filtrados por role.
- Manter o `AppHeader` exclusivamente público/pessoal.
- Provar negativos de visitante e utilizador comum.

#### Scope-out

- Alterar a autenticação backend já criada.
- Criar novos papéis de utilizador.
- Guardar tokens no navegador.
- Remover `requireAuth` ou `requireRole` do backend.
- Criar novas áreas administrativas.

#### Estado antes e depois

- Estado antes: `authApi.me()` chama `GET /api/session/me`.
- Estado antes: o backend expõe `req.user`, `requireAuth` e `requireRole`.
- Estado antes: o header pode apresentar links administrativos sem contexto de perfil.
- Estado depois: o frontend conhece `loading`, `anonymous`, `authenticated` e
  `unavailable`; `admin` é uma role derivada do utilizador autenticado.
- Estado depois: rotas admin têm guarda visual, shell próprio e landing por role;
  o backend continua a ser a autoridade final.

#### Pré-requisitos

- `BK-MF7-01` concluído com riscos P0 de navegação identificados.
- `BK-MF1-04` concluído para sessão segura por cookie.
- `BK-MF2-01` concluído para registo/login.
- `backend/src/modules/auth/session.routes.js` expõe `GET /api/session/me`.
- `frontend/src/services/api/apiClient.js` envia cookies com `credentials: "include"`.

#### Glossário

- Sessão: estado que identifica o utilizador autenticado através do cookie seguro.
- Role: papel de utilizador, por exemplo `user` ou `admin`.
- Guarda visual: componente que evita mostrar ecrãs indevidos no frontend.
- Autoridade backend: regra de segurança aplicada no servidor, mesmo que o frontend falhe.
- `401`: utilizador sem autenticação.
- `403`: utilizador autenticado sem permissão.

#### Conceitos teóricos essenciais

- `CANONICO`: `RF02` define autenticação e sessão segura.
- `CANONICO`: `RF04` define papéis de utilizador.
- `CANONICO`: `RNF15` exige sessão autenticada por cookie com flags de segurança.
- `DERIVADO`: o frontend usa `status: "loading" | "anonymous" | "authenticated" | "unavailable"` para apresentar a UI sem adivinhar permissões.
- A guarda visual melhora UX, mas não é uma barreira de segurança suficiente. O backend continua a validar `requireAuth` e `requireRole`.
- Não se deve confiar em `role` escrito manualmente pelo utilizador. O papel vem sempre da resposta de sessão.

##### Contrato de indisponibilidade de sessão

- `GET /api/session/me` com `200 { user: null }` é o único caso que estabelece
  `anonymous`. Uma falha de rede, timeout ou `5xx` estabelece `unavailable` e
  preserva a diferença entre ausência de sessão e estado operacional incerto.
- `unavailable` não redireciona para login nem mostra CTAs de visitante. Rotas e
  ações privadas permanecem bloqueadas, apresentam mensagem segura e permitem
  chamar `refreshSession()` novamente.
- Apenas um `401` recebido numa chamada autenticada limpa a sessão e o token
  CSRF em memória como logout efetivo.
- Páginas públicas que dependem da sessão, como detalhe e home, tratam
  `loading` e `unavailable` explicitamente: não iniciam playback direto nem
  apresentam `Entrar para reproduzir` enquanto o estado for incerto.

O Passo 2 implementa diretamente este contrato. Não existe uma versão alternativa
em que uma falha operacional seja convertida em logout ou em sessão anónima.

#### Arquitetura do BK

| Camada | Artefacto | Responsabilidade |
| --- | --- | --- |
| Backend | `backend/src/modules/auth/session.routes.js` | Devolve `{ user: ... }` ou `{ user: null }`. |
| Backend | `backend/src/middlewares/auth.middleware.js` | Mantém `401` e `403` nas rotas protegidas. |
| Frontend | `frontend/src/context/SessionContext.jsx` | Carrega e partilha sessão atual. |
| Frontend | `frontend/src/components/auth/AdminRoute.jsx` | Bloqueia visualmente páginas admin. |
| Frontend | `frontend/src/layouts/AdminLayout.jsx` | Separa shell, foco, breadcrumb e drawer administrativos. |
| Frontend | `frontend/src/components/admin/AdminNavigation.jsx` | Agrupa e filtra links por role. |
| Frontend | `frontend/src/routes/AppRoutes.jsx` | Compõe layout e guards numa árvore `/admin`. |
| Evidence | `docs/evidence/MF7/NAVEGACAO-SEGURA-POR-PERFIL.md` | Provas positivas e negativas. |

#### Ficheiros a criar/editar/rever

- CRIAR: `frontend/src/context/SessionContext.jsx`
- CRIAR: `frontend/src/components/auth/AdminRoute.jsx`
- EDITAR: `frontend/src/main.jsx`
- CRIAR: `frontend/src/layouts/AdminLayout.jsx`
- CRIAR: `frontend/src/components/admin/AdminNavigation.jsx`
- EDITAR: `frontend/src/routes/AppRoutes.jsx`
- REVER: `frontend/src/services/api/authApi.js`
- REVER: `frontend/src/services/api/apiClient.js`
- REVER: `backend/src/middlewares/auth.middleware.js`
- CRIAR: `docs/evidence/MF7/NAVEGACAO-SEGURA-POR-PERFIL.md`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato de sessão

1. Objetivo funcional do passo no contexto da app.

Confirmar que o frontend já tem uma chamada oficial para ler a sessão atual.

2. Ficheiros envolvidos.
    - REVER: `frontend/src/services/api/authApi.js`
    - REVER: `frontend/src/services/api/apiClient.js`
    - REVER: `backend/src/modules/auth/session.routes.js`
    - LOCALIZAÇÃO: métodos públicos `authApi.me()`, `apiClient.get()` e rota
      montada `GET /api/session/me`.

3. Instruções do que fazer.

Confirma estes pontos:

- `authApi.me()` chama `/api/session/me`.
- `apiClient` usa `credentials: "include"`.
- `GET /api/session/me` devolve `200` com `user` ou `null`.
- Rotas administrativas backend continuam protegidas por `requireAuth` e `requireRole`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

Este passo confirma contratos já criados em BKs anteriores.

5. Explicação do código.

A sessão deve ser lida a partir do backend porque o browser não deve inventar se o utilizador é admin. O frontend só adapta a interface ao estado recebido.

6. Validação do passo.

Resultado esperado: `authApi.me()` existe e o cliente API envia cookies.

7. Cenário negativo/erro esperado.

Se `apiClient` não enviar cookies, `authApi.me()` pode devolver visitante mesmo depois de login. Nesse caso, este BK bloqueia até corrigir o cliente API.

### Passo 2 - Criar o contexto de sessão

1. Objetivo funcional do passo no contexto da app.

Partilhar a sessão atual com header, rotas e páginas sem repetir chamadas HTTP em cada componente.

2. Ficheiros envolvidos.
    - CRIAR: `frontend/src/context/SessionContext.jsx`
    - EDITAR: `frontend/src/main.jsx`
    - LOCALIZAÇÃO: ficheiros completos.

3. Instruções do que fazer.

Cria a pasta `frontend/src/context/`. Depois cria `SessionContext.jsx` e envolve a aplicação com `SessionProvider` em `main.jsx`.

4. Código completo, correto e integrado com a app final.

```jsx
// frontend/src/context/SessionContext.jsx
/**
 * @file Contexto de sessão usado pela navegação segura da MF7.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { authApi } from "../services/api/authApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";
import {
  clearCsrfToken,
  setUnauthorizedHandler,
} from "../services/api/apiClient.js";

const SessionContext = createContext(null);

function isUnauthorizedError(error) {
  return error !== null && typeof error === "object" && error.status === 401;
}

/** Valida a allowlist mínima do utilizador público devolvido por `/session/me`. */
function isPublicUser(value) {
  return value !== null
    && typeof value === "object"
    && typeof value.id === "string"
    && typeof value.email === "string"
    && typeof value.name === "string"
    && typeof value.role === "string";
}

/**
 * Disponibiliza estado de sessão para toda a aplicação.
 *
 * @param {{ children: React.ReactNode }} props Propriedades do provider.
 * @param {React.ReactNode} props.children Árvore React que precisa da sessão.
 * @returns {JSX.Element} Provider com estado `loading`, `anonymous`, `authenticated` ou `unavailable`.
 */
export function SessionProvider({ children }) {
  const [status, setStatus] = useState("loading");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const refreshVersion = useRef(0);

  /**
   * Limpa a sessão apenas quando o backend confirmou logout ou devolveu 401.
   * Incrementar a versão impede que um pedido antigo volte a autenticar a UI.
   */
  const clearSession = useCallback(() => {
    refreshVersion.current += 1;
    clearCsrfToken();
    setUser(null);
    setStatus("anonymous");
    setError("");
  }, []);

  /**
   * Recarrega a sessão a partir do backend.
   *
   * @returns {Promise<void>} Termina depois de atualizar o estado local.
   */
  const refreshSession = useCallback(async () => {
    const currentVersion = refreshVersion.current + 1;
    refreshVersion.current = currentVersion;
    setStatus("loading");
    setError("");

    try {
      const response = await authApi.me();

      if (refreshVersion.current !== currentVersion) {
        return null;
      }

      if (response?.user === null) {
        // Só `200 { user: null }` confirma anonimato; ausência do campo é resposta inválida.
        setUser(null);
        setStatus("anonymous");
        return null;
      }

      if (!isPublicUser(response?.user)) {
        throw new Error("Resposta de sessão inválida.");
      }

      // O perfil validado vem do backend; a UI não aceita permissões inventadas no browser.
      setUser(response.user);
      setStatus("authenticated");
      return response.user;
    } catch (requestError) {
      if (refreshVersion.current !== currentVersion) {
        return null;
      }

      if (isUnauthorizedError(requestError)) {
        clearSession();
        return null;
      }

      // Uma falha operacional não invalida o cookie nem a identidade já confirmada.
      setStatus("unavailable");
      setError(toUserMessage(requestError));
      throw requestError;
    }
  }, [clearSession]);

  /**
   * Só limpa o contexto depois de o backend terminar a sessão. Um erro de rede
   * preserva o estado porque o cookie HttpOnly pode continuar válido.
   */
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (requestError) {
      if (!isUnauthorizedError(requestError)) {
        throw requestError;
      }
    }

    clearSession();
  }, [clearSession]);

  useEffect(() => {
    let active = true;
    const removeUnauthorizedHandler = setUnauthorizedHandler(() => {
      if (active) {
        clearSession();
      }
    });

    // `unavailable` fica no estado do provider; não cria uma rejection global.
    refreshSession().catch(() => {});

    return () => {
      active = false;
      refreshVersion.current += 1;
      removeUnauthorizedHandler();
    };
  }, [clearSession, refreshSession]);

  const value = useMemo(
    () => ({
      status,
      user,
      error,
      isAdmin: user?.role === "admin",
      isModerator: user?.role === "moderator",
      refreshSession,
      logout,
      clearSession,
    }),
    [clearSession, error, logout, refreshSession, status, user],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

/**
 * Lê o contexto de sessão no componente atual.
 *
 * @returns {{ status: "loading" | "anonymous" | "authenticated" | "unavailable", user: unknown, error: string, isAdmin: boolean, isModerator: boolean, refreshSession: () => Promise<unknown>, logout: () => Promise<void>, clearSession: () => void }} Estado de sessão.
 * @throws {Error} Quando usado fora de `SessionProvider`.
 */
export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession deve ser usado dentro de SessionProvider.");
  }

  return context;
}
```

```jsx
// frontend/src/main.jsx
/**
 * @file Entrada React do frontend FaithFlix.
 */

import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App.jsx";
import { SessionProvider } from "./context/SessionContext.jsx";
import "./styles/tokens.css";
import "./styles/global.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* A sessão fica acima das rotas para que header e guards leiam o mesmo estado. */}
      <SessionProvider>
        <App />
      </SessionProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
```

5. Explicação do código.

`SessionProvider` centraliza a leitura de `/api/session/me`. O estado começa em
`loading`, passa para `authenticated` quando existe utilizador e só passa para
`anonymous` perante `200 { user: null }` ou um `401` explícito. Timeout, falha de
rede e `5xx` passam para `unavailable`, mostram uma mensagem segura e permitem
repetir `refreshSession()`. O provider não guarda tokens nem permissões manuais;
o token CSRF fica no cliente API e é limpo apenas com logout confirmado ou `401`.

6. Validação do passo.

Executa o frontend e confirma que a aplicação arranca sem erro de import. Resultado esperado: header e páginas continuam a renderizar.

7. Cenário negativo/erro esperado.

Se o backend ficar indisponível, o estado esperado é `unavailable`, não
`anonymous`; a UI deve bloquear ações privadas e apresentar um botão que chama
`refreshSession()`. Se `useSession` for usado fora de `SessionProvider`, a
mensagem `useSession deve ser usado dentro de SessionProvider.` indica uma
integração incompleta.

### Passo 3 - Criar o shell administrativo e proteger rotas

1. Objetivo funcional do passo no contexto da app.

Separar a experiência administrativa da pública, permitir ao `moderator` apenas
a gestão editorial e manter as restantes áreas exclusivas de `admin`.

2. Ficheiros envolvidos.
    - CRIAR: `frontend/src/components/auth/AuthenticatedRoute.jsx`
    - CRIAR: `frontend/src/components/auth/AdminRoute.jsx`
    - CRIAR: `frontend/src/components/admin/AdminNavigation.jsx`
    - CRIAR: `frontend/src/layouts/AdminLayout.jsx`
    - EDITAR: `frontend/src/routes/AppRoutes.jsx`
    - LOCALIZAÇÃO: criar os dois componentes completos e fazer apenas a composição
      indicada na tabela de rotas já existente.

3. Instruções do que fazer.

Cria `AuthenticatedRoute.jsx` e `AdminRoute.jsx`. Mantém `AppHeader` apenas para
rotas públicas/pessoais e cria `AdminNavigation` com grupos por role. O
`AdminLayout` fornece sidebar desktop, drawer modal móvel, breadcrumb, logout e
um único context switch `Ver site público`. Em `AppRoutes.jsx`, compõe este
layout numa árvore `/admin` sem substituir os imports lazy, `Suspense`,
`ErrorBoundary` ou `RouteLifecycle` construídos em `BK-MF1-02`.

4. Código completo, correto e integrado com a app final.

```jsx
// frontend/src/components/auth/AuthenticatedRoute.jsx
/**
 * @file Guarda de sessão para páginas e pedidos exclusivamente pessoais.
 */
import { Navigate } from "react-router-dom";
import { useSession } from "../../context/SessionContext.jsx";

export function AuthenticatedRoute({ children }) {
  const { status, error, refreshSession } = useSession();

  if (status === "loading") {
    return <p role="status">A confirmar sessão...</p>;
  }
  if (status === "anonymous") {
    // Destino constante: nunca copia uma URL externa para `next`.
    return <Navigate to="/login" replace />;
  }
  if (status === "unavailable") {
    return (
      <section role="alert">
        <p>{error || "Não foi possível confirmar a sessão."}</p>
        <button type="button" onClick={() => refreshSession().catch(() => {})}>
          Tentar novamente
        </button>
      </section>
    );
  }

  return children;
}
```

```jsx
// frontend/src/components/auth/AdminRoute.jsx
/**
 * @file Guarda visual para páginas administrativas.
 */

import { Navigate } from "react-router-dom";
import { useSession } from "../../context/SessionContext.jsx";

/**
 * Impede que um perfil fora da allowlist veja o conteúdo privilegiado.
 *
 * @param {{ children: React.ReactNode, allowedRoles?: string[] }} props Propriedades do componente.
 * @param {React.ReactNode} props.children Página admin protegida visualmente.
 * @returns {JSX.Element} Página protegida, redirecionamento ou aviso de permissão.
 */
export function AdminRoute({ children, allowedRoles = ["admin"] }) {
  const { status, user, error, refreshSession } = useSession();

  if (status === "loading") {
    return <p role="status">A confirmar sessão...</p>;
  }

  if (status === "anonymous") {
    // O visitante deve autenticar-se antes de tentar abrir qualquer área administrativa.
    return <Navigate to="/login" replace />;
  }

  if (status === "unavailable") {
    return (
      <section role="alert">
        <p>{error || "Não foi possível confirmar a sessão."}</p>
        <button type="button" onClick={() => refreshSession().catch(() => {})}>
          Tentar novamente
        </button>
      </section>
    );
  }

  if (!allowedRoles.includes(user?.role)) {
    // Esta guarda melhora a UX; o backend mantém a decisão final com 403.
    return <p role="alert">Não tem permissão para aceder a esta área.</p>;
  }

  return children;
}
```

```jsx
// frontend/src/components/admin/AdminNavigation.jsx
import { NavLink } from "react-router-dom";
import { useSession } from "../../context/SessionContext.jsx";

export const ADMIN_NAVIGATION_GROUPS = [
  // A lista fechada torna a matriz role -> grupo auditável sem espalhar condições pelos links.
  { label: "Visão geral", roles: ["admin"], items: [{ to: "/admin", label: "Dashboard", end: true }] },
  { label: "Conteúdo", roles: ["admin", "moderator"], items: [
    { to: "/admin/catalogo", label: "Catálogo" },
    { to: "/admin/passagens-biblicas", label: "Passagens bíblicas" },
  ] },
  { label: "Utilizadores", roles: ["admin"], items: [
    { to: "/admin/utilizadores", label: "Contas e permissões" },
  ] },
  { label: "Solidariedade", roles: ["admin"], items: [
    { to: "/admin/charity-applications", label: "Candidaturas" },
    { to: "/admin/charity-members", label: "Membros" },
    { to: "/admin/pool/distribution", label: "Distribuição mensal" },
    { to: "/admin/pool/dashboard", label: "Histórico da pool" },
  ] },
  { label: "Operação", roles: ["admin"], items: [
    { to: "/admin/metricas", label: "Métricas" },
    { to: "/admin/integracoes", label: "Integrações" },
  ] },
];

export function AdminNavigation({ onNavigate }) {
  const { user } = useSession();
  // Filtrar o grupo inteiro evita renderizar headings vazios para moderator.
  return (
    <nav aria-label="Navegação administrativa">
      {ADMIN_NAVIGATION_GROUPS.filter((group) => group.roles.includes(user?.role)).map((group) => (
        <section key={group.label}>
          <h2>{group.label}</h2>
          {group.items.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} onClick={onNavigate}>
              {item.label}
            </NavLink>
          ))}
        </section>
      ))}
    </nav>
  );
}
```

```jsx
// frontend/src/components/layout/SessionActionButton.jsx
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../../context/SessionContext.jsx";
import { toUserMessage } from "../../services/api/apiErrors.js";

export function SessionActionButton() {
  const session = useSession();
  const navigate = useNavigate();
  const loggingOutRef = useRef(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  async function handleLogout() {
    if (loggingOutRef.current) return;
    loggingOutRef.current = true;
    setLoggingOut(true);
    setError("");
    try {
      // Só navega depois da revogação remota; uma falha mantém a sessão visível.
      await session.logout();
      navigate("/", { replace: true });
    } catch (requestError) {
      setError(toUserMessage(requestError));
    } finally {
      loggingOutRef.current = false;
      setLoggingOut(false);
    }
  }

  return (
    <div>
      <button type="button" disabled={loggingOut} onClick={handleLogout}>
        {loggingOut ? "A sair..." : "Sair"}
      </button>
      {error ? <p role="alert">{error}</p> : null}
    </div>
  );
}
```

```jsx
// frontend/src/layouts/AdminLayout.jsx
import { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { SkipLink } from "../components/a11y/SkipLink.jsx";
import { AdminNavigation } from "../components/admin/AdminNavigation.jsx";
import { SessionActionButton } from "../components/layout/SessionActionButton.jsx";

export function AdminLayout() {
  const { pathname } = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const dialogRef = useRef(null);
  const menuButtonRef = useRef(null);

  useEffect(() => setDrawerOpen(false), [pathname]);
  useEffect(() => {
    // O dialog nativo oferece Escape e isolamento modal sem uma dependência nova.
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (drawerOpen && !dialog.open) dialog.showModal();
    if (!drawerOpen && dialog.open) dialog.close();
  }, [drawerOpen]);

  return (
    <div className="admin-shell">
      <SkipLink />
      <aside className="admin-sidebar">
        <Link to="/admin">FaithFlix <small>Administração</small></Link>
        <AdminNavigation />
        <a href="/" target="_blank" rel="noreferrer">Ver site público</a>
      </aside>
      <div className="admin-workspace">
        <header className="admin-topbar">
          <button ref={menuButtonRef} type="button" onClick={() => setDrawerOpen(true)}>
            Menu
          </button>
          <p aria-label="Breadcrumb">Administração / {pathname.split("/").filter(Boolean).slice(1).join(" / ")}</p>
          <SessionActionButton />
        </header>
        <main id="conteudo-principal" tabIndex={-1}><Outlet /></main>
      </div>
      <dialog
        ref={dialogRef}
        aria-label="Navegação administrativa"
        onCancel={(event) => { event.preventDefault(); setDrawerOpen(false); }}
        onClose={() => menuButtonRef.current?.focus()}
      >
        <button type="button" onClick={() => setDrawerOpen(false)}>Fechar</button>
        <AdminNavigation onNavigate={() => setDrawerOpen(false)} />
        <a href="/" target="_blank" rel="noreferrer">Ver site público</a>
      </dialog>
    </div>
  );
}
```

5. Explicação do código.

`AdminRoute` distingue loading, visitante, indisponibilidade com retry e sessão
sem permissão. `AdminNavigation` filtra grupos pela role confirmada e
`AdminLayout` impede que o backoffice herde o header/footer público. O `dialog`
trata Escape nativamente, fecha ao navegar e devolve foco ao botão. A barreira
de segurança essencial continua no backend.

6. Validação do passo.

Valida manualmente três perfis e uma falha operacional:

- visitante e user: não montam `AdminLayout`;
- moderator: entra em `/admin/catalogo` e vê apenas o grupo Conteúdo;
- admin: entra em `/admin`, vê os cinco grupos e um único `Ver site público`;
- backend indisponível: não vê links privados/login automático, recebe mensagem
  segura e consegue repetir a leitura da sessão.
- logout com sucesso: mostra `Sair`, termina a sessão e navega para `/`;
- logout com falha de rede: mantém a sessão, não navega e apresenta o erro.

7. Cenário negativo/erro esperado.

Um utilizador comum que escreva `/admin/metricas` no URL deve ver `Não tem permissão para aceder a esta área.` e as chamadas backend protegidas devem continuar a responder `403`.

### Passo 4 - Atualizar rotas e registar evidence

1. Objetivo funcional do passo no contexto da app.

Garantir que todas as rotas admin usam a guarda visual e deixar prova objetiva para o gate da MF7.

2. Ficheiros envolvidos.
    - EDITAR: `frontend/src/routes/AppRoutes.jsx`
    - CRIAR: `docs/evidence/MF7/NAVEGACAO-SEGURA-POR-PERFIL.md`
    - LOCALIZAÇÃO: rotas `/admin/...` e ficheiro de evidence completo.

3. Instruções do que fazer.

Importa `AuthenticatedRoute`, `AdminRoute` e `AdminLayout` em `AppRoutes.jsx`.
Envolve as rotas pessoais e cria uma árvore nested `/admin` guardada para
`admin|moderator`. Mantém sem alterações `lazy`, `Suspense`, `ErrorBoundary`,
`RouteLifecycle`, `AppLayout`, todas as rotas públicas e os componentes já
declarados. Depois cria a evidence com a matriz abaixo.

Antes de editar os `element`, confirma que cada binding já foi declarado por
`lazyNamedPage` no BK proprietário. Não voltes a declarar nenhum destes nomes
em MF7:

| Binding lazy já existente | BK proprietário |
| --- | --- |
| `AdminDashboardPage` | fecho administrativo da referência |
| `AdminCatalogListPage`, `AdminCatalogCreatePage`, `AdminCatalogEditPage`, `AdminTaxonomiesPage` | `BK-MF2-03` + decomposição final |
| `AdminBiblicalPassagesListPage`, `AdminBiblicalPassagesPage` | catálogo/passagens + decomposição final |
| `AdminUsersPage` | `BK-MF2-02` |
| `AdminMetricsPage` | `BK-MF5-05` |
| `AdminIntegrationsPage` | `BK-MF5-06` |
| `AdminCharityApplicationsPage` | `BK-MF4-04` |
| `AdminPoolDistributionPage` | `BK-MF4-05` |
| `AdminPoolDashboardPage` | `BK-MF4-06` |
| `AdminCharityMembersPage` | `BK-MF4-06` |

Se faltar um binding, regressa ao BK indicado e aplica a declaração lazy desse
guia. Não compenses a falta com um `import ...Page from` eager.

4. Código completo, correto e integrado com a app final.

```jsx
// frontend/src/routes/AppRoutes.jsx
// ADICIONAR junto dos imports existentes; não substituir os imports lazy.
import { AdminRoute } from "../components/auth/AdminRoute.jsx";
import { AuthenticatedRoute } from "../components/auth/AuthenticatedRoute.jsx";
import { useSession } from "../context/SessionContext.jsx";
import { AdminLayout } from "../layouts/AdminLayout.jsx";
// ADICIONAR `Navigate` ao import existente de `react-router-dom`.
import { Navigate } from "react-router-dom";

function withAuthenticatedRoute(page) {
  return <AuthenticatedRoute>{page}</AuthenticatedRoute>;
}

/**
 * Compõe uma página lazy já existente com a guarda visual.
 *
 * @param {React.ReactNode} page Página administrativa.
 * @returns {JSX.Element} Rota protegida pela sessão.
 */
function withAdminRoute(page, allowedRoles = ["admin"]) {
  // A composição não altera como a página é importada nem o lifecycle da rota.
  return <AdminRoute allowedRoles={allowedRoles}>{page}</AdminRoute>;
}

function AdminIndexRoute() {
  const { user } = useSession();
  // Moderator não recebe o dashboard reservado ao admin.
  if (user?.role === "moderator") return <Navigate to="/admin/catalogo" replace />;
  return <AdminDashboardPage />;
}
```

```jsx
// frontend/src/routes/AppRoutes.jsx
// MANTER estas rotas pessoais na árvore pública existente.
<>
<Route path="/para-si" element={withAuthenticatedRoute(<ForYouPage />)} />
<Route path="/biblioteca" element={withAuthenticatedRoute(<MyLibraryPage />)} />
<Route path="/notificacoes" element={withAuthenticatedRoute(<NotificationsPage />)} />
<Route path="/conta" element={withAuthenticatedRoute(<AccountPage />)} />
<Route path="/ver/:contentId" element={withAuthenticatedRoute(<PlaybackPage />)} />
<Route
  path="/associacoes/:charityId/historico"
  element={withAuthenticatedRoute(<CharityHistoryPage />)}
/>
</>

// CRIAR uma única árvore administrativa fora de <Route element={<AppLayout />}>.
<Route path="/admin" element={withAdminRoute(<AdminLayout />, ["admin", "moderator"])}>
  <Route index element={<AdminIndexRoute />} />
  <Route path="catalogo" element={<AdminCatalogListPage />} />
  <Route path="catalogo/novo" element={<AdminCatalogCreatePage />} />
  <Route path="catalogo/:contentId/editar" element={<AdminCatalogEditPage />} />
  <Route path="catalogo/taxonomias" element={<AdminTaxonomiesPage />} />
  <Route path="passagens-biblicas" element={<AdminBiblicalPassagesListPage />} />
  <Route path="passagens-biblicas/novo" element={<AdminBiblicalPassagesPage />} />
  <Route path="passagens-biblicas/:passageId/editar" element={<AdminBiblicalPassagesPage />} />
  <Route path="passagens-biblicas/associacoes" element={<AdminBiblicalPassagesPage />} />
  <Route path="utilizadores" element={withAdminRoute(<AdminUsersPage />)} />
  <Route path="metricas" element={withAdminRoute(<AdminMetricsPage />)} />
  <Route path="integracoes" element={withAdminRoute(<AdminIntegrationsPage />)} />
  <Route path="charity-applications" element={withAdminRoute(<AdminCharityApplicationsPage />)} />
  <Route path="pool/distribution" element={withAdminRoute(<AdminPoolDistributionPage />)} />
  <Route path="pool/dashboard" element={withAdminRoute(<AdminPoolDashboardPage />)} />
  <Route path="charity-members" element={withAdminRoute(<AdminCharityMembersPage />)} />
</Route>
```

```md
# Navegação segura por sessão e perfil - MF7

- `document_status`: `CURRENT`
- `snapshot_date`: `-`
- `implementation_lane`: `STUDENT`
- `current_authority`: `docs/planificacao/guias-bk/MF7/BK-MF7-02-navegacao-segura-por-sessao-e-perfil.md`
- `proof_scope`: matriz de sessão/RBAC observada pelos alunos; não prova autorização backend sem os negativos executados

## Metadados

- BK: BK-MF7-02
- Owner: Matheus
- Fonte: RF02, RF04, RNF13, RNF15, RNF16, RNF19
- Decisão: EM_REVISAO

## Verificações

| Perfil | Ação | Resultado esperado | Resultado observado | Estado |
| --- | --- | --- | --- | --- |
| Visitante | Abrir header público | Não vê links admin | A preencher | A preencher |
| Visitante | Abrir /admin/metricas | Redireciona para /login | A preencher | A preencher |
| Utilizador comum | Abrir header público | Não vê links admin | A preencher | A preencher |
| Utilizador comum | Abrir /admin/metricas | Mostra aviso de permissão | A preencher | A preencher |
| Moderador | Login sem `next` | Entra em `/admin/catalogo` | A preencher | A preencher |
| Moderador | Abrir /admin/catalogo | Vê gestão editorial | A preencher | A preencher |
| Moderador | Abrir /admin/metricas | Mostra aviso de permissão | A preencher | A preencher |
| Admin | Login sem `next` | Entra em `/admin` e vê dashboard | A preencher | A preencher |
| Admin | Abrir drawer a 390 px e carregar Escape | Fecha e devolve foco ao botão | A preencher | A preencher |
| Admin | Abrir /admin/metricas | Vê página de métricas | A preencher | A preencher |
| Backend | Chamar rota admin sem sessão | 401 | A preencher | A preencher |
| Backend | Chamar rota admin como user | 403 | A preencher | A preencher |

## Handoff para BK-MF7-03

- AppHeader sem operações administrativas:
- AdminLayout/sidebar/drawer confirmados:
- Links públicos confirmados:
- Links admin confirmados:
- Riscos visuais que passam para tokens/layout:
```

5. Explicação do código.

`withAdminRoute` evita repetir `<AdminRoute>` sem reconstruir o router. A
allowlist `admin | moderator` aplica-se ao shell e o filtro da navegação limita
moderator ao domínio editorial; as rotas operacionais continuam com o default
`admin`. A tabela nested conserva `ErrorBoundary`, `Suspense`,
`RouteLifecycle` e todas as rotas recebidas dos BK anteriores. A evidence
separa visitante, user, admin e backend para provar que a UI não está a esconder
um problema de autorização. O próximo BK pode focar layout e tokens porque este
BK fecha a navegação segura.

6. Validação do passo.

Executa uma build ou arranque local do frontend. Depois preenche a evidence com os resultados observados.

7. Cenário negativo/erro esperado.

Se uma rota `/admin/...` não estiver envolvida por `AdminRoute`, o BK fica incompleto. Corrige antes de avançar para `BK-MF7-03`.

#### Critérios de aceite

- `authApi.me()` é a única fonte de sessão do frontend.
- `SessionProvider` envolve a aplicação.
- `SessionProvider` distingue `200 { user: null }` de falha operacional: apenas o primeiro caso fica `anonymous`; o segundo fica `unavailable`.
- `unavailable` bloqueia conteúdo/CTAs privados e permite retry sem redirecionar para login.
- `AuthenticatedRoute` protege `/para-si`, `/biblioteca`, `/notificacoes`,
  `/conta`, `/ver/:contentId` e o histórico privado de associações: loading não
  monta children, anonymous redireciona para `/login`, unavailable mostra retry
  sem pedidos filhos e authenticated renderiza a página.
- Visitantes não veem links admin.
- Utilizadores comuns não veem links admin.
- Admin entra em `/admin`; moderator entra em `/admin/catalogo`; user entra em `/`.
- Moderadores veem apenas o grupo Conteúdo e entram em `/admin/catalogo`.
- Moderadores não entram nas restantes rotas administrativas.
- Rotas `/admin/...` usam `AdminLayout` dentro de `AdminRoute`.
- O backoffice não renderiza `AppHeader`/`AppFooter`, tem sidebar/drawer,
  breadcrumb e um único `Ver site público`.
- Drawer fecha com Escape/navegação e devolve foco ao botão quando aplicável.
- O ref síncrono de logout impede dois POST mesmo quando há duplo clique antes
  do render que aplica `disabled`.
- `AppRoutes.jsx` mantém imports lazy, `Suspense`, `ErrorBoundary`,
  `RouteLifecycle` e todas as rotas públicas anteriores.
- Backend continua a devolver `401` e `403` nas rotas protegidas.
- Evidence contém pelo menos doze verificações de perfil, permissão, landing e foco.

#### Validação final

- Executar `npm --prefix frontend run build`.
- Executar `bash scripts/validate-planificacao.sh`.
- Executar `git diff --check`.
- Confirmar a evidence `docs/evidence/MF7/NAVEGACAO-SEGURA-POR-PERFIL.md`.
- Testar cada estado de `AuthenticatedRoute` e confirmar zero chamadas de API
  da página filha em `loading|anonymous|unavailable`; testar duplo clique em
  `Sair` e confirmar uma única chamada a `authApi.logout`.

#### Evidence para PR/defesa

- `pr`: referência da entrega deste BK.
- `proof`: `docs/evidence/MF7/NAVEGACAO-SEGURA-POR-PERFIL.md`.
- `neg`: visitante em `/admin/metricas`, user comum em `/admin/metricas`, chamada backend sem sessão e chamada backend sem role admin.
- `neg`: falha de rede/`5xx` em `GET /api/session/me` mantém
  `unavailable`, não apresenta login e permite repetir a confirmação.
- `fonte`: `RF02`, `RF04`, `RNF13`, `RNF15`, `RNF16`, `RNF19`.

#### Handoff

- `BK-MF7-03` recebe `AppLayout` público e `AdminLayout` separados e pode refinar visualmente os dois shells.
- `BK-MF7-05` recebe negativos de perfil para repetir no gate visual.
- Qualquer falha backend `401/403` fica fora deste BK e deve ser tratada como bloqueio antes do gate.

#### Changelog

- `2026-07-12`: substituído o menu admin dentro do header público por
  `AdminLayout`/`AdminNavigation`, árvore nested, landing por role e drawer acessível.

- `2026-07-10`: router corrigido como composição aditiva sobre a tabela lazy;
  preservados ErrorBoundary, lifecycle e rotas anteriores.
- `2026-07-10`: normalizado para tutorial v2 e marker sem código autónomo.
- `2026-06-22`: guia criado/reestruturado na reorganização documental MF7/MF8.
- `2026-06-23`: guia atualizado com contexto de sessão, guarda admin, header filtrado, rotas protegidas e evidence verificável.
- `2026-07-10`: contrato separa `unavailable` de logout/`anonymous`, bloqueia CTAs privados e exige retry de sessão sem redirecionamento indevido.
