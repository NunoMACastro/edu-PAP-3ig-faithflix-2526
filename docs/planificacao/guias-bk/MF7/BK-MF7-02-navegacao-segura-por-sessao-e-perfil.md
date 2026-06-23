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
- `last_updated`: `2026-06-23`

#### Objetivo

Neste BK vais criar um contexto de sessão no frontend, chamar `authApi.me()`, distinguir visitante, utilizador autenticado e administrador, esconder links administrativos indevidos e proteger rotas administrativas com uma guarda visual.

O resultado observável é `docs/evidence/MF7/NAVEGACAO-SEGURA-POR-PERFIL.md`, com provas de que visitante e utilizador comum não veem nem abrem áreas admin, enquanto o backend continua a devolver `401` e `403` nas operações críticas.

#### Importância

`RF02` exige autenticação e sessão segura. `RF04` exige papéis de utilizador. Na MF7, o frontend deve refletir esses papéis de forma clara, mas sem substituir a autorização backend.

Este BK fecha o risco visual mais crítico da MF7: uma interface que mostra links admin a quem não deve vê-los transmite insegurança, confunde utilizadores e fragiliza a defesa PAP.

#### Scope-in

- Criar `SessionContext` para carregar a sessão atual através de `authApi.me()`.
- Envolver a aplicação com `SessionProvider`.
- Criar `AdminRoute` para bloquear visualmente páginas admin.
- Filtrar links do header conforme o perfil.
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
- Estado depois: o frontend conhece `anonymous`, `authenticated` e `admin`.
- Estado depois: rotas admin têm guarda visual e o backend continua a ser a autoridade final.

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
- `DERIVADO`: o frontend usa `status: "anonymous" | "authenticated" | "loading"` para apresentar a UI sem adivinhar permissões.
- A guarda visual melhora UX, mas não é uma barreira de segurança suficiente. O backend continua a validar `requireAuth` e `requireRole`.
- Não se deve confiar em `role` escrito manualmente pelo utilizador. O papel vem sempre da resposta de sessão.

#### Arquitetura do BK

| Camada | Artefacto | Responsabilidade |
| --- | --- | --- |
| Backend | `backend/src/modules/auth/session.routes.js` | Devolve `{ user: ... }` ou `{ user: null }`. |
| Backend | `backend/src/modules/auth/auth.middleware.js` | Mantém `401` e `403` nas rotas protegidas. |
| Frontend | `frontend/src/context/SessionContext.jsx` | Carrega e partilha sessão atual. |
| Frontend | `frontend/src/components/auth/AdminRoute.jsx` | Bloqueia visualmente páginas admin. |
| Frontend | `frontend/src/components/layout/AppHeader.jsx` | Filtra links por perfil. |
| Frontend | `frontend/src/routes/AppRoutes.jsx` | Envolve rotas admin com guarda visual. |
| Evidence | `docs/evidence/MF7/NAVEGACAO-SEGURA-POR-PERFIL.md` | Provas positivas e negativas. |

#### Ficheiros a criar/editar/rever

- CRIAR: `frontend/src/context/SessionContext.jsx`
- CRIAR: `frontend/src/components/auth/AdminRoute.jsx`
- EDITAR: `frontend/src/main.jsx`
- EDITAR: `frontend/src/components/layout/AppHeader.jsx`
- EDITAR: `frontend/src/routes/AppRoutes.jsx`
- REVER: `frontend/src/services/api/authApi.js`
- REVER: `frontend/src/services/api/apiClient.js`
- REVER: `backend/src/modules/auth/auth.middleware.js`
- CRIAR: `docs/evidence/MF7/NAVEGACAO-SEGURA-POR-PERFIL.md`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato de sessão

1. Objetivo funcional do passo no contexto da app.

Confirmar que o frontend já tem uma chamada oficial para ler a sessão atual.

2. Ficheiros envolvidos:
    - REVER: `frontend/src/services/api/authApi.js`
    - REVER: `frontend/src/services/api/apiClient.js`
    - REVER: `backend/src/modules/auth/session.routes.js`
    - LOCALIZAÇÃO: métodos `authApi.me()`, `apiClient.request()` e rota `GET /me`.

3. Instruções do que fazer.

Confirma estes pontos:

- `authApi.me()` chama `/api/session/me`.
- `apiClient` usa `credentials: "include"`.
- `GET /api/session/me` devolve `200` com `user` ou `null`.
- Rotas administrativas backend continuam protegidas por `requireAuth` e `requireRole`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo confirma contratos já criados em BKs anteriores.

5. Explicação do código.

A sessão deve ser lida a partir do backend porque o browser não deve inventar se o utilizador é admin. O frontend só adapta a interface ao estado recebido.

6. Validação do passo.

Resultado esperado: `authApi.me()` existe e o cliente API envia cookies.

7. Cenário negativo/erro esperado.

Se `apiClient` não enviar cookies, `authApi.me()` pode devolver visitante mesmo depois de login. Nesse caso, este BK bloqueia até corrigir o cliente API.

### Passo 2 - Criar o contexto de sessão

1. Objetivo funcional do passo no contexto da app.

Partilhar a sessão atual com header, rotas e páginas sem repetir chamadas HTTP em cada componente.

2. Ficheiros envolvidos:
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

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../services/api/authApi.js";

const SessionContext = createContext(null);

/**
 * Disponibiliza estado de sessão para toda a aplicação.
 *
 * @param {{ children: React.ReactNode }} props Propriedades do provider.
 * @param {React.ReactNode} props.children Árvore React que precisa da sessão.
 * @returns {JSX.Element} Provider com estado `loading`, `anonymous` ou `authenticated`.
 */
export function SessionProvider({ children }) {
  const [status, setStatus] = useState("loading");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  /**
   * Recarrega a sessão a partir do backend.
   *
   * @returns {Promise<void>} Termina depois de atualizar o estado local.
   */
  const refreshSession = useCallback(async () => {
    setStatus("loading");
    setError("");

    try {
      const response = await authApi.me();
      const currentUser = response?.user ?? null;

      // O perfil vem do backend para evitar que a UI aceite permissões inventadas no browser.
      setUser(currentUser);
      setStatus(currentUser ? "authenticated" : "anonymous");
    } catch (requestError) {
      setUser(null);
      setStatus("anonymous");
      setError(requestError.message);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const value = useMemo(
    () => ({
      status,
      user,
      error,
      isAdmin: user?.role === "admin",
      refreshSession,
    }),
    [error, refreshSession, status, user],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

/**
 * Lê o contexto de sessão no componente atual.
 *
 * @returns {{ status: string, user: unknown, error: string, isAdmin: boolean, refreshSession: () => Promise<void> }} Estado de sessão.
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

`SessionProvider` centraliza a leitura de `/api/session/me`. O estado começa em `loading`, passa para `authenticated` se o backend devolver `user` e passa para `anonymous` se não houver sessão. A propriedade `isAdmin` deriva de `user.role` para o header e para as rotas admin. O provider não guarda tokens nem permissões manuais; apenas reflete a sessão do servidor.

6. Validação do passo.

Executa o frontend e confirma que a aplicação arranca sem erro de import. Resultado esperado: header e páginas continuam a renderizar.

7. Cenário negativo/erro esperado.

Se `useSession` for usado fora de `SessionProvider`, a mensagem `useSession deve ser usado dentro de SessionProvider.` indica uma integração incompleta.

### Passo 3 - Filtrar header e proteger rotas admin

1. Objetivo funcional do passo no contexto da app.

Esconder links admin para visitantes e utilizadores comuns, e bloquear visualmente as rotas admin.

2. Ficheiros envolvidos:
    - CRIAR: `frontend/src/components/auth/AdminRoute.jsx`
    - EDITAR: `frontend/src/components/layout/AppHeader.jsx`
    - EDITAR: `frontend/src/routes/AppRoutes.jsx`
    - LOCALIZAÇÃO: ficheiros completos ou substituição completa das funções exportadas.

3. Instruções do que fazer.

Cria `AdminRoute.jsx`, substitui a lista de links do header por links com `roles` e envolve todas as páginas `/admin/...` com `<AdminRoute>`.

4. Código completo, correto e integrado com a app final.

```jsx
// frontend/src/components/auth/AdminRoute.jsx
/**
 * @file Guarda visual para páginas administrativas.
 */

import { Navigate } from "react-router-dom";
import { useSession } from "../../context/SessionContext.jsx";

/**
 * Impede que visitantes e utilizadores comuns vejam o conteúdo admin no frontend.
 *
 * @param {{ children: React.ReactNode }} props Propriedades do componente.
 * @param {React.ReactNode} props.children Página admin protegida visualmente.
 * @returns {JSX.Element} Página protegida, redirecionamento ou aviso de permissão.
 */
export function AdminRoute({ children }) {
  const { status, isAdmin } = useSession();

  if (status === "loading") {
    return <p role="status">A confirmar sessão...</p>;
  }

  if (status === "anonymous") {
    // O visitante deve autenticar-se antes de tentar abrir qualquer área administrativa.
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    // Esta guarda melhora a UX; o backend mantém a decisão final com 403.
    return <p role="alert">Não tem permissão para aceder a esta área.</p>;
  }

  return children;
}
```

```jsx
// frontend/src/components/layout/AppHeader.jsx
/**
 * @file Cabeçalho principal com navegação FaithFlix filtrada por sessão.
 */

import { NavLink } from "react-router-dom";
import { useSession } from "../../context/SessionContext.jsx";

const navItems = [
  { to: "/", label: "Início", visibility: "public" },
  { to: "/catalogo", label: "Catálogo", visibility: "public" },
  { to: "/pesquisa", label: "Pesquisa", visibility: "public" },
  { to: "/para-si", label: "Para si", visibility: "authenticated" },
  { to: "/biblioteca", label: "Biblioteca", visibility: "authenticated" },
  { to: "/associacoes", label: "Associações", visibility: "public" },
  { to: "/planos", label: "Planos", visibility: "public" },
  { to: "/conta", label: "Conta", visibility: "authenticated" },
  { to: "/admin/catalogo", label: "Admin catálogo", visibility: "admin" },
  { to: "/admin/utilizadores", label: "Admin utilizadores", visibility: "admin" },
  { to: "/admin/metricas", label: "Métricas", visibility: "admin" },
  { to: "/admin/integracoes", label: "Integrações", visibility: "admin" },
];

/**
 * Devolve a classe CSS de um item de navegação conforme o estado da rota.
 *
 * @param {{ isActive: boolean }} routeState Estado passado pelo React Router.
 * @returns {string} Classes CSS da ligação.
 */
function getNavLinkClassName({ isActive }) {
  return isActive ? "nav-link nav-link-active" : "nav-link";
}

/**
 * Decide se um item pode aparecer para o perfil atual.
 *
 * @param {{ visibility: string }} item Item de navegação.
 * @param {{ status: string, isAdmin: boolean }} session Estado de sessão.
 * @returns {boolean} Verdadeiro quando o link deve ser visível.
 */
function canShowNavItem(item, session) {
  if (item.visibility === "public") return true;
  if (item.visibility === "authenticated") return session.status === "authenticated";
  if (item.visibility === "admin") return session.isAdmin;
  return false;
}

/**
 * Renderiza o cabeçalho visível em todas as páginas.
 *
 * @returns {JSX.Element} Cabeçalho com marca e navegação filtrada.
 */
export function AppHeader() {
  const session = useSession();
  const visibleItems = navItems.filter((item) => canShowNavItem(item, session));

  return (
    <header className="app-header">
      <NavLink className="brand-link" to="/" aria-label="FaithFlix - início">
        <span className="brand-mark" aria-hidden="true">F</span>
        <span className="brand-name">FaithFlix</span>
      </NavLink>

      <nav className="main-nav" aria-label="Navegação principal">
        {visibleItems.map((item) => (
          <NavLink key={item.to} className={getNavLinkClassName} to={item.to}>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
```

5. Explicação do código.

`AdminRoute` dá feedback claro nos três estados: carregamento, visitante e utilizador sem permissão. `AppHeader` passa a ter `visibility` por link, por isso a UI não mostra opções admin a quem não é admin. A regra de segurança essencial mantém-se no backend; este BK apenas impede que a navegação induza o utilizador em erro.

6. Validação do passo.

Valida manualmente três perfis:

- visitante: não vê links de conta privada nem admin;
- utilizador comum: vê áreas autenticadas, mas não vê admin;
- admin: vê os links admin.

7. Cenário negativo/erro esperado.

Um utilizador comum que escreva `/admin/metricas` no URL deve ver `Não tem permissão para aceder a esta área.` e as chamadas backend protegidas devem continuar a responder `403`.

### Passo 4 - Atualizar rotas e registar evidence

1. Objetivo funcional do passo no contexto da app.

Garantir que todas as rotas admin usam a guarda visual e deixar prova objetiva para o gate da MF7.

2. Ficheiros envolvidos:
    - EDITAR: `frontend/src/routes/AppRoutes.jsx`
    - CRIAR: `docs/evidence/MF7/NAVEGACAO-SEGURA-POR-PERFIL.md`
    - LOCALIZAÇÃO: rotas `/admin/...` e ficheiro de evidence completo.

3. Instruções do que fazer.

Importa `AdminRoute` em `AppRoutes.jsx` e envolve todas as rotas administrativas. Depois cria a evidence com a matriz abaixo.

4. Código completo, correto e integrado com a app final.

```jsx
// frontend/src/routes/AppRoutes.jsx
/**
 * @file Tabela de rotas do frontend FaithFlix.
 */

import { Route, Routes } from "react-router-dom";
import { AdminRoute } from "../components/auth/AdminRoute.jsx";
import { AppLayout } from "../layouts/AppLayout.jsx";
import { AccountPage } from "../pages/AccountPage.jsx";
import { AdminCatalogPage } from "../pages/AdminCatalogPage.jsx";
import { AdminCharityApplicationsPage } from "../pages/AdminCharityApplicationsPage.jsx";
import { AdminCharityMembersPage } from "../pages/AdminCharityMembersPage.jsx";
import { AdminIntegrationsPage } from "../pages/AdminIntegrationsPage.jsx";
import { AdminMetricsPage } from "../pages/AdminMetricsPage.jsx";
import { AdminPoolDashboardPage } from "../pages/AdminPoolDashboardPage.jsx";
import { AdminPoolDistributionPage } from "../pages/AdminPoolDistributionPage.jsx";
import { AdminUsersPage } from "../pages/AdminUsersPage.jsx";
import { CatalogPage } from "../pages/CatalogPage.jsx";
import { CharityApplicationPage } from "../pages/CharityApplicationPage.jsx";
import { CharityHistoryPage } from "../pages/CharityHistoryPage.jsx";
import { ContentDetailPage } from "../pages/ContentDetailPage.jsx";
import { DiscoveryHomePage } from "../pages/DiscoveryHomePage.jsx";
import { ForYouPage } from "../pages/ForYouPage.jsx";
import { LoginPage } from "../pages/LoginPage.jsx";
import { MyLibraryPage } from "../pages/MyLibraryPage.jsx";
import { NotificationsPage } from "../pages/NotificationsPage.jsx";
import { PlaybackPage } from "../pages/PlaybackPage.jsx";
import { PublicCharitiesPage } from "../pages/PublicCharitiesPage.jsx";
import { SearchPage } from "../pages/SearchPage.jsx";
import { SubscriptionPage } from "../pages/SubscriptionPage.jsx";
import { NotFoundPage } from "../pages/pages.jsx";

/**
 * Envolve páginas administrativas na guarda visual.
 *
 * @param {React.ReactNode} page Página administrativa.
 * @returns {JSX.Element} Rota protegida pela sessão.
 */
function withAdminRoute(page) {
  return <AdminRoute>{page}</AdminRoute>;
}

/**
 * Declara a árvore de rotas renderizada dentro do layout partilhado.
 *
 * @returns {JSX.Element} Rotas da aplicação.
 */
export function AppRoutes() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<DiscoveryHomePage />} />
        <Route path="/catalogo" element={<CatalogPage />} />
        <Route path="/catalogo/:idOrSlug" element={<ContentDetailPage />} />
        <Route path="/ver/:contentId" element={<PlaybackPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/para-si" element={<ForYouPage />} />
        <Route path="/associacoes" element={<PublicCharitiesPage />} />
        <Route path="/associacoes/candidatura" element={<CharityApplicationPage />} />
        <Route path="/associacoes/:charityId/historico" element={<CharityHistoryPage />} />
        <Route path="/planos" element={<SubscriptionPage />} />
        <Route path="/conta" element={<AccountPage />} />
        <Route path="/biblioteca" element={<MyLibraryPage />} />
        <Route path="/notificacoes" element={<NotificationsPage />} />
        <Route path="/pesquisa" element={<SearchPage />} />
        <Route path="/admin/catalogo" element={withAdminRoute(<AdminCatalogPage />)} />
        <Route path="/admin/utilizadores" element={withAdminRoute(<AdminUsersPage />)} />
        <Route path="/admin/metricas" element={withAdminRoute(<AdminMetricsPage />)} />
        <Route path="/admin/integracoes" element={withAdminRoute(<AdminIntegrationsPage />)} />
        <Route path="/admin/charity-applications" element={withAdminRoute(<AdminCharityApplicationsPage />)} />
        <Route path="/admin/pool/distribution" element={withAdminRoute(<AdminPoolDistributionPage />)} />
        <Route path="/admin/pool/dashboard" element={withAdminRoute(<AdminPoolDashboardPage />)} />
        <Route path="/admin/charity-members" element={withAdminRoute(<AdminCharityMembersPage />)} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppLayout>
  );
}
```

```md
# Navegação segura por sessão e perfil - MF7

## Metadados

- BK: BK-MF7-02
- Owner: Matheus
- Fonte: RF02, RF04, RNF13, RNF15, RNF16, RNF19
- Decisão: EM_REVISAO

## Verificações

| Perfil | Ação | Resultado esperado | Resultado observado | Estado |
| --- | --- | --- | --- | --- |
| Visitante | Abrir header | Não vê links admin | A preencher | A preencher |
| Visitante | Abrir /admin/metricas | Redireciona para /login | A preencher | A preencher |
| Utilizador comum | Abrir header | Não vê links admin | A preencher | A preencher |
| Utilizador comum | Abrir /admin/metricas | Mostra aviso de permissão | A preencher | A preencher |
| Admin | Abrir header | Vê links admin | A preencher | A preencher |
| Admin | Abrir /admin/metricas | Vê página de métricas | A preencher | A preencher |
| Backend | Chamar rota admin sem sessão | 401 | A preencher | A preencher |
| Backend | Chamar rota admin como user | 403 | A preencher | A preencher |

## Handoff para BK-MF7-03

- Header filtrado por sessão:
- Links públicos confirmados:
- Links admin confirmados:
- Riscos visuais que passam para tokens/layout:
```

5. Explicação do código.

`withAdminRoute` evita repetir `<AdminRoute>` em cada rota. A evidence separa visitante, user, admin e backend para provar que a UI não está a esconder um problema de autorização. O próximo BK pode focar layout e tokens porque este BK fecha a navegação segura.

6. Validação do passo.

Executa uma build ou arranque local do frontend. Depois preenche a evidence com os resultados observados.

7. Cenário negativo/erro esperado.

Se uma rota `/admin/...` não estiver envolvida por `AdminRoute`, o BK fica incompleto. Corrige antes de avançar para `BK-MF7-03`.

#### Critérios de aceite

- `authApi.me()` é a única fonte de sessão do frontend.
- `SessionProvider` envolve a aplicação.
- Visitantes não veem links admin.
- Utilizadores comuns não veem links admin.
- Rotas `/admin/...` usam `AdminRoute`.
- Backend continua a devolver `401` e `403` nas rotas protegidas.
- Evidence contém pelo menos oito verificações de perfil e permissão.

#### Validação final

- Executar `npm --prefix frontend run build`.
- Executar `bash scripts/validate-planificacao.sh`.
- Executar `git diff --check`.
- Confirmar a evidence `docs/evidence/MF7/NAVEGACAO-SEGURA-POR-PERFIL.md`.

#### Evidence para PR/defesa

- `pr`: referência da entrega deste BK.
- `proof`: `docs/evidence/MF7/NAVEGACAO-SEGURA-POR-PERFIL.md`.
- `neg`: visitante em `/admin/metricas`, user comum em `/admin/metricas`, chamada backend sem sessão e chamada backend sem role admin.
- `fonte`: `RF02`, `RF04`, `RNF13`, `RNF15`, `RNF16`, `RNF19`.

#### Handoff

- `BK-MF7-03` recebe header filtrado por sessão e pode refinar visualmente a navegação.
- `BK-MF7-05` recebe negativos de perfil para repetir no gate visual.
- Qualquer falha backend `401/403` fica fora deste BK e deve ser tratada como bloqueio antes do gate.

#### Changelog

- `2026-06-22`: guia criado/reestruturado na reorganização documental MF7/MF8.
- `2026-06-23`: guia atualizado com contexto de sessão, guarda admin, header filtrado, rotas protegidas e evidence verificável.
