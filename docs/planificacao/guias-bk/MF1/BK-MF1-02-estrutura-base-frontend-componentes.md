# BK-MF1-02 - Estrutura base frontend por componentes

## Header

- `doc_id`: `GUIA-BK-MF1-02`
- `bk_id`: `BK-MF1-02`
- `macro`: `MF1`
- `owner`: `Mateus`
- `apoio`: `Kaue`
- `prioridade`: `P0`
- `estado`: `DONE`
- `esforco`: `M`
- `dependencias`: `BK-MF0-06`
- `rf_rnf`: `RNF28`
- `fase_documental`: `Fase 1`
- `sprint`: `S01`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF1-03`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-02-estrutura-base-frontend-componentes.md`
- `last_updated`: `2026-07-12`

#### Objetivo

Este BK cria a primeira base real do frontend FaithFlix. O objetivo e montar uma app React organizada por componentes, rotas, layout, paginas e estilos globais. Esta base sera usada por login, catalogo, detalhe de conteudo, streaming, favoritos, subscricoes, associacoes e privacidade nas macrofases seguintes.

Para alunos do 12.º ano, a ideia principal e aprender a separar responsabilidades: uma pagina representa uma rota, um layout organiza a estrutura comum, um componente reutilizavel evita repeticao e os estilos globais dao consistencia visual.

### Decisao tecnica deste guia

Este guia usa a baseline atual `React + Vite` e o cliente HTTP nativo
`fetch`/`AbortController`. `RNF.md` classifica Next.js/Axios apenas como opção
futura, dependente de uma decisão arquitetural e nova validação; não é uma
alternativa concorrente durante este tutorial.

#### Importância

Este BK materializa os RF/RNF indicados no Header e entrega ao próximo BK uma base verificável. Sem esta etapa, os passos seguintes não têm um contrato técnico estável para reutilizar.

#### Scope-in

- Criar a pasta `frontend/`.
- Criar app React com Vite.
- Criar router, layout, componentes reutilizaveis, paginas base e estilos.
- Criar paginas controladas para rotas do produto, sem fingir dados reais.

#### Scope-out

- Login funcional.
- Catalogo real.
- Streaming ou player real.
- Integração API.
- Subscricoes, pagamentos, pool solidaria ou recomendacoes.

### Check de compreensao

- [ ] Sei distinguir pagina, layout e componente.
- [ ] Sei explicar porque a UI desta fase ainda nao tem dados reais.
- [ ] Sei abrir as rotas principais e confirmar que nao ha erros de render.

#### Estado antes e depois

- Estado antes: aplicam-se as dependências e os RF/RNF declarados no Header; não se assume funcionalidade além dos BKs anteriores.
- Estado depois: ficam implementáveis e verificáveis apenas os resultados do `Scope-in`, mantendo integralmente o `Scope-out`.

#### Pré-requisitos

- `BK-MF0-06` concluido ou com handoff registado.
- Confirmar em `BACKLOG-MVP.md` que este BK continua com owner `Mateus`, apoio `Kaue`, prioridade `P0`, dependencia `BK-MF0-06` e `rf_rnf` `RNF28`.
- Rever `mockup/` apenas como referencia visual e de rotas, nao como codigo final obrigatorio.
- Confirmar que ainda nao existe pasta real `frontend/`. Se existir, adaptar os passos sem apagar trabalho existente.

#### Glossário

- `componente`: unidade reutilizável de interface.
- `página`: componente associado a uma rota.
- `layout`: estrutura visual partilhada entre páginas.
- `lazy route`: página carregada apenas quando a rota é visitada.

#### Conceitos teóricos essenciais

A arquitetura frontend separa páginas, layout, componentes, serviços e estilos. Rotas lazy reduzem o bundle inicial; metadata por rota, ErrorBoundary e controlo de foco/scroll tornam a navegação previsível sem alterar permissões de sessão.

#### Arquitetura do BK

- Endpoint(s)/modelo: não aplicável; este BK cria a fundação frontend.
- Cliente API: fica reservado para `BK-MF1-03`.
- Página/componente: router, layout, páginas base e componentes reutilizáveis.
- Guard: rotas ainda sem autenticação funcional.
- Testes: build e verificações de render/navegação dos passos.
- Handoff: estrutura consumida pelo cliente API e pelas páginas funcionais seguintes.

#### Ficheiros a criar/editar/rever

- CRIAR: `frontend/package.json`
- CRIAR: `frontend/vite.config.js`
- CRIAR: `frontend/index.html`
- REVER: `mockup/package.json` e `mockup/vite.config.ts`
- CRIAR: `frontend/src/main.jsx`
- CRIAR: `frontend/src/App.jsx`
- CRIAR: `frontend/src/routes/AppRoutes.jsx`
- CRIAR: `frontend/src/routes/RouteLifecycle.jsx`
- CRIAR: `frontend/src/routes/routeMetadata.js`
- CRIAR: `frontend/src/components/errors/ErrorBoundary.jsx`
- REVER: `MF-VIEWS.md`, para confirmar que esta e apenas fundacao tecnica
- CRIAR: `frontend/src/layouts/AppLayout.jsx`
- CRIAR: `frontend/src/components/layout/AppHeader.jsx`
- CRIAR: `frontend/src/components/layout/AppFooter.jsx`
- REVER: `RNF01`, `RNF02`, `RNF04` e `RNF38`
- CRIAR: `frontend/src/components/ui/BaseButton.jsx`
- CRIAR: `frontend/src/components/ui/TextField.jsx`
- CRIAR: `frontend/src/components/ui/ContentCard.jsx`
- CRIAR: `frontend/src/components/ui/EmptyState.jsx`
- REVER: `RNF02`, `RNF04`, `RNF05`
- CRIAR: `frontend/src/pages/pages.jsx`
- REVER: `docs/RF.md`, dominios de identidade, catalogo, pesquisa, subscricoes, associacoes e notificacoes
- CRIAR: `frontend/src/styles/tokens.css`
- CRIAR: `frontend/src/styles/global.css`
- CRIAR: `frontend/src/services/api/README.md`
- REVER: `RNF01`, `RNF02`, `RNF03`, `RNF04`, `RNF05`, `RNF28`, `RNF38`

#### Tutorial técnico linear

### Passo 1 - Criar o pacote frontend e a configuracao Vite

1. Objetivo do passo.

Criar a app frontend como projeto independente, com React, Vite e React Router.

2. Ficheiros envolvidos:
    - CRIAR: `frontend/package.json`
    - CRIAR: `frontend/vite.config.js`
    - CRIAR: `frontend/index.html`
    - LOCALIZACAO: nova pasta `frontend/` na raiz do repositorio
    - REVER: `mockup/package.json` e `mockup/vite.config.ts`

3. Instrucoes concretas.

Cria a pasta `frontend/` e adiciona os tres ficheiros seguintes. Estes ficheiros ainda nao criam ecras; apenas preparam a app para arrancar.

4. Código completo, correto e integrado com a app final.

**Ficheiro `frontend/package.json`.**

```json
{
    "name": "faithflix-frontend",
    "version": "0.1.0",
    "private": true,
    "type": "module",
    "scripts": {
        "dev": "vite",
        "build": "vite build",
        "preview": "vite preview"
    },
    "dependencies": {
        "@vitejs/plugin-react": "^4.3.1",
        "vite": "^5.4.2",
        "react": "^18.3.1",
        "react-dom": "^18.3.1",
        "react-router-dom": "^6.26.1"
    },
    "devDependencies": {}
}
```

**Explicação de `frontend/package.json`.**

`vite` e a ferramenta que arranca e compila o frontend. `react` e `react-dom` permitem construir a interface. `react-router-dom` permite ter URLs como `/catalogo`, `/login` e `/planos` sem criar paginas HTML separadas. `private: true` evita publicacao acidental.

**Ficheiro `frontend/vite.config.js`.**

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
});
```

**Explicação de `frontend/vite.config.js`.**

Este ficheiro diz ao Vite que a app usa React. Sem este plugin, JSX como `<App />` nao seria transformado corretamente durante o desenvolvimento e o build.

**Ficheiro `frontend/index.html`.**

```html
<!doctype html>
<html lang="pt-PT">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>FaithFlix</title>
    </head>
    <body>
        <div id="root"></div>
        <script type="module" src="/src/main.jsx"></script>
    </body>
</html>
```

5. Explicação do código.

O HTML tem apenas o ponto de montagem `root`. A interface React e criada dentro desse elemento. O atributo `lang="pt-PT"` ajuda acessibilidade e leitores de ecra, porque a app esta em portugues de Portugal.

6. Validação do passo.

Executar dentro de `frontend/`:

```bash
npm install
npm run dev
```

Ainda podem aparecer erros enquanto os ficheiros React nao existirem. Isso e esperado ate concluir os passos seguintes.

7. Cenário negativo/erro esperado.

Erro comum: copiar diretamente o `mockup/` para `frontend/`. O mockup e referencia; a app final precisa de estrutura propria e evolutiva.

### Passo 2 - Criar o ponto de entrada React e o router

1. Objetivo do passo.

Montar a aplicacao React no browser e definir as rotas principais do FaithFlix.

2. Ficheiros envolvidos:
    - CRIAR: `frontend/src/main.jsx`
    - CRIAR: `frontend/src/App.jsx`
    - CRIAR: `frontend/src/routes/AppRoutes.jsx`
    - CRIAR: `frontend/src/routes/RouteLifecycle.jsx`
    - CRIAR: `frontend/src/routes/routeMetadata.js`
    - CRIAR: `frontend/src/components/errors/ErrorBoundary.jsx`
    - LOCALIZACAO: `frontend/src/`, `frontend/src/routes/` e `frontend/src/components/errors/`
    - REVER: `MF-VIEWS.md`, para confirmar que esta e apenas fundacao tecnica

3. Instrucoes concretas.

Cria a pasta `src/`, depois `src/routes/`. O router inclui rotas que serao preenchidas em BKs futuros, mas nesta fase mostram paginas controladas.

4. Código completo, correto e integrado com a app final.

**Ficheiro `frontend/src/main.jsx`.**

```jsx
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App.jsx";
import "./styles/tokens.css";
import "./styles/global.css";

// StrictMode mantém verificações de desenvolvimento sem alterar a árvore usada em produção.
createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>,
);
```

**Explicação de `frontend/src/main.jsx`.**

`createRoot` liga React ao `div#root` do HTML. `BrowserRouter` ativa navegação por URLs. Os ficheiros CSS entram aqui porque devem afetar a app toda. `React.StrictMode` ajuda a detetar problemas durante desenvolvimento.

**Ficheiro `frontend/src/App.jsx`.**

```jsx
import { AppRoutes } from "./routes/AppRoutes.jsx";

export function App() {
    return <AppRoutes />;
}
```

**Explicação de `frontend/src/App.jsx`.**

`App` fica pequeno de proposito. A sua responsabilidade e apontar para o sistema de rotas. Isto evita misturar layout, paginas e configuracao num unico ficheiro.

**Ficheiro `frontend/src/routes/AppRoutes.jsx`.**

```jsx
import { lazy, Suspense } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { ErrorBoundary } from "../components/errors/ErrorBoundary.jsx";
import { AppLayout } from "../layouts/AppLayout.jsx";
import { RouteLifecycle } from "./RouteLifecycle.jsx";

// O helper converte exports nomeados em módulos lazy sem duplicar a mesma adaptação por rota.
function lazyNamedPage(loader, exportName) {
    return lazy(async () => {
        const pageModule = await loader();
        const Page = pageModule[exportName];
        if (!Page) throw new Error("ROUTE_COMPONENT_UNAVAILABLE");
        return { default: Page };
    });
}

const HomePage = lazyNamedPage(() => import("../pages/pages.jsx"), "HomePage");
const CatalogPage = lazyNamedPage(() => import("../pages/pages.jsx"), "CatalogPage");
const LoginPage = lazyNamedPage(() => import("../pages/pages.jsx"), "LoginPage");
const AssociationsPage = lazyNamedPage(() => import("../pages/pages.jsx"), "AssociationsPage");
const PlansPage = lazyNamedPage(() => import("../pages/pages.jsx"), "PlansPage");
const AccountPage = lazyNamedPage(() => import("../pages/pages.jsx"), "AccountPage");
const NotificationsPage = lazyNamedPage(() => import("../pages/pages.jsx"), "NotificationsPage");
const SearchPage = lazyNamedPage(() => import("../pages/pages.jsx"), "SearchPage");
const NotFoundPage = lazyNamedPage(() => import("../pages/pages.jsx"), "NotFoundPage");

export function AppRoutes() {
    const location = useLocation();

    // A key da localização permite ao boundary recuperar quando o utilizador muda de rota.
    return (
        <AppLayout>
            <RouteLifecycle />
            <ErrorBoundary resetKey={location.key} onRetry={() => window.location.reload()}>
                <Suspense fallback={<p role="status">A carregar página...</p>}>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/catalogo" element={<CatalogPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/associacoes" element={<AssociationsPage />} />
                        <Route path="/planos" element={<PlansPage />} />
                        <Route path="/conta" element={<AccountPage />} />
                        <Route path="/notificacoes" element={<NotificationsPage />} />
                        <Route path="/pesquisa" element={<SearchPage />} />
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </Suspense>
            </ErrorBoundary>
        </AppLayout>
    );
}
```

**Ficheiros `routeMetadata.js`, `RouteLifecycle.jsx` e `ErrorBoundary.jsx`.**

```jsx
// frontend/src/routes/routeMetadata.js
import { matchPath } from "react-router-dom";

// A lista cobre a baseline final para nenhuma rota funcional herdar o título de 404.
const TITLES = [
    { path: "/", title: "Início" },
    { path: "/catalogo", title: "Catálogo" },
    { path: "/catalogo/:idOrSlug", title: "Detalhe do conteúdo" },
    { path: "/catalogo/:seriesSlug/episodios/:episodeSlug", title: "Detalhe do episódio" },
    { path: "/ver/:contentId", title: "Reprodução" },
    { path: "/login", title: "Entrar" },
    { path: "/associacoes", title: "Associações" },
    { path: "/associacoes/candidatura", title: "Candidatura de associação" },
    { path: "/associacoes/:charityId/historico", title: "Histórico da associação" },
    { path: "/planos", title: "Planos" },
    { path: "/conta", title: "Conta" },
    { path: "/notificacoes", title: "Notificações" },
    { path: "/pesquisa", title: "Pesquisa" },
    { path: "/para-si", title: "Para si" },
    { path: "/biblioteca", title: "Biblioteca" },
    { path: "/admin", title: "Dashboard administrativo" },
    { path: "/admin/catalogo", title: "Administração do catálogo" },
    { path: "/admin/catalogo/novo", title: "Novo conteúdo" },
    { path: "/admin/catalogo/:contentId/editar", title: "Editar conteúdo" },
    { path: "/admin/catalogo/taxonomias", title: "Taxonomias do catálogo" },
    { path: "/admin/passagens-biblicas", title: "Administração de passagens bíblicas" },
    { path: "/admin/passagens-biblicas/novo", title: "Nova passagem bíblica" },
    { path: "/admin/passagens-biblicas/:passageId/editar", title: "Editar passagem bíblica" },
    { path: "/admin/passagens-biblicas/associacoes", title: "Associações de passagens bíblicas" },
    { path: "/admin/utilizadores", title: "Administração de utilizadores" },
    { path: "/admin/charity-applications", title: "Candidaturas" },
    { path: "/admin/pool/distribution", title: "Distribuição da pool" },
    { path: "/admin/pool/dashboard", title: "Pool solidária" },
    { path: "/admin/charity-members", title: "Membros das associações" },
    { path: "/admin/metricas", title: "Métricas" },
    { path: "/admin/integracoes", title: "Integrações" },
];

export function resolveRouteTitle(pathname) {
    // `matchPath` resolve segmentos dinâmicos sem depender de IDs concretos.
    const route = TITLES.find(({ path }) => matchPath({ path, end: true }, pathname));
    return `${route?.title ?? "Página não encontrada"} | FaithFlix`;
}
```

```jsx
// frontend/src/routes/RouteLifecycle.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { resolveRouteTitle } from "./routeMetadata.js";

export function RouteLifecycle() {
    const { pathname } = useLocation();

    useEffect(() => {
        document.title = resolveRouteTitle(pathname);
        document.getElementById("conteudo-principal")?.focus({ preventScroll: true });
        window.scrollTo?.({ top: 0, left: 0, behavior: "auto" });
    }, [pathname]);

    return null;
}
```

```jsx
// frontend/src/components/errors/ErrorBoundary.jsx
import { Component } from "react";

export class ErrorBoundary extends Component {
    state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidUpdate(previousProps) {
        // Uma navegação posterior limpa apenas o erro de render da localização anterior.
        if (this.state.hasError && previousProps.resetKey !== this.props.resetKey) {
            this.setState({ hasError: false });
        }
    }

    handleRetry = () => {
        this.props.onRetry?.();
        this.setState({ hasError: false });
    };

    render() {
        if (this.state.hasError) {
            return (
                <section role="alert">
                    <h1>Não foi possível apresentar esta página</h1>
                    <p>Ocorreu um erro inesperado. Tenta novamente.</p>
                    <button type="button" onClick={this.handleRetry}>Tentar novamente</button>
                </section>
            );
        }
        return this.props.children;
    }
}
```

5. Explicação do código.

Cada `Route` associa uma URL a uma pagina. `lazy` mantém as páginas fora do
chunk inicial, `Suspense` apresenta loading sem ecrã vazio e `ErrorBoundary`
impede que uma falha de render derrube o shell. `routeMetadata.js` inclui todas
as rotas da baseline final; as entradas antecipadas não tornam uma página
alcançável antes do respetivo BK criar a rota. `RouteLifecycle` atualiza apenas
quando muda o `pathname`; filtros na query não roubam o foco nem alteram o scroll.

6. Validação do passo.

Depois de criares layout e paginas nos passos seguintes, abrir `/`, `/catalogo`, `/login` e `/rota-errada`.

7. Cenário negativo/erro esperado.

Erro comum: criar rotas que parecem funcionalidades completas, como `/checkout-real` ou `/streaming-drm`. Isso inventaria escopo fora dos RF e RNF.

### Passo 3 - Criar layout e navegacao principal

1. Objetivo do passo.

Criar uma moldura comum para todas as paginas, com header, navegacao e footer.

2. Ficheiros envolvidos:
    - CRIAR: `frontend/src/layouts/AppLayout.jsx`
    - CRIAR: `frontend/src/components/layout/AppHeader.jsx`
    - CRIAR: `frontend/src/components/layout/AppFooter.jsx`
    - LOCALIZACAO: `frontend/src/layouts/` e `frontend/src/components/layout/`
    - REVER: `RNF01`, `RNF02`, `RNF04` e `RNF38`

3. Instrucoes concretas.

Cria as pastas `layouts/` e `components/layout/`. O layout deve ser comum a todas as rotas para manter consistencia.

4. Código completo, correto e integrado com a app final.

**Ficheiro `frontend/src/layouts/AppLayout.jsx`.**

```jsx
import { AppFooter } from "../components/layout/AppFooter.jsx";
import { AppHeader } from "../components/layout/AppHeader.jsx";

export function AppLayout({ children }) {
    // O main focável é o destino usado pelo lifecycle após cada mudança real de pathname.
    return (
        <div className="app-shell">
            <AppHeader />
            <main id="conteudo-principal" className="app-main" tabIndex={-1}>
                {children}
            </main>
            <AppFooter />
        </div>
    );
}
```

**Explicação de `frontend/src/layouts/AppLayout.jsx`.**

`children` representa a pagina atual. Assim, o header e o footer aparecem sempre, e o conteudo muda conforme a rota. Isto evita repetir header e footer em todas as paginas.

**Ficheiro `frontend/src/components/layout/AppHeader.jsx`.**

```jsx
import { NavLink } from "react-router-dom";

// Uma fonte única mantém rótulos e destinos coerentes na navegação principal.
const navItems = [
    { to: "/", label: "Inicio" },
    { to: "/catalogo", label: "Catalogo" },
    { to: "/pesquisa", label: "Pesquisa" },
    { to: "/associacoes", label: "Associacoes" },
    { to: "/planos", label: "Planos" },
    { to: "/conta", label: "Conta" },
];

export function AppHeader() {
    // NavLink fornece o estado ativo sem comparar manualmente o URL atual.
    return (
        <header className="app-header">
            <NavLink
                className="brand-link"
                to="/"
                aria-label="FaithFlix - inicio"
            >
                <span className="brand-mark" aria-hidden="true">
                    F
                </span>
                <span className="brand-name">FaithFlix</span>
            </NavLink>

            <nav className="main-nav" aria-label="Navegacao principal">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        className={({ isActive }) =>
                            isActive ? "nav-link nav-link-active" : "nav-link"
                        }
                        to={item.to}
                    >
                        {item.label}
                    </NavLink>
                ))}
            </nav>
        </header>
    );
}
```

**Explicação de `frontend/src/components/layout/AppHeader.jsx`.**

`navItems` e um array para evitar repetir codigo. `NavLink` sabe quando uma rota esta ativa, permitindo aplicar uma classe visual. Isto melhora orientacao do utilizador e cumpre a ideia de navegacao clara do `RNF01`.

**Ficheiro `frontend/src/components/layout/AppFooter.jsx`.**

```jsx
export function AppFooter() {
    // O rodapé permanece informativo e não simula links ou serviços ainda inexistentes.
    return (
        <footer className="app-footer">
            <span>FaithFlix PAP 2025/2026</span>
            <span>Conteudo, comunidade e impacto solidario.</span>
        </footer>
    );
}
```

5. Explicação do código.

O footer e simples porque a app ainda esta na fundacao. Ele identifica o projeto e reforca o dominio, sem acrescentar funcionalidades falsas.

6. Validação do passo.

Ao abrir qualquer rota, header e footer devem aparecer uma unica vez. A rota ativa deve ter destaque visual depois de criares o CSS.

7. Cenário negativo/erro esperado.

Erro comum: usar `<a href>` para navegacao interna principal. Isso recarrega a pagina inteira. Com React Router, usamos `NavLink` ou `Link`.

### Passo 4 - Criar componentes reutilizaveis

1. Objetivo do passo.

Criar pequenos blocos de UI para botoes, campos, cards e estados vazios, que serao reutilizados em MF2+.

2. Ficheiros envolvidos:
    - CRIAR: `frontend/src/components/ui/BaseButton.jsx`
    - CRIAR: `frontend/src/components/ui/TextField.jsx`
    - CRIAR: `frontend/src/components/ui/ContentCard.jsx`
    - CRIAR: `frontend/src/components/ui/EmptyState.jsx`
    - LOCALIZACAO: `frontend/src/components/ui/`
    - REVER: `RNF02`, `RNF04`, `RNF05`

3. Instrucoes concretas.

Cria a pasta `components/ui/` e adiciona os componentes. Eles devem ser genericos: nao devem saber ainda sobre base de dados, auth, streaming ou subscricoes.

4. Código completo, correto e integrado com a app final.

**Ficheiro `frontend/src/components/ui/BaseButton.jsx`.**

```jsx
export function BaseButton({
    children,
    type = "button",
    variant = "primary",
    disabled = false,
    onClick,
}) {
    // O tipo seguro por defeito evita submeter formulários quando o botão só executa uma ação local.
    return (
        <button
            className={`base-button base-button-${variant}`}
            disabled={disabled}
            onClick={onClick}
            type={type}
        >
            {children}
        </button>
    );
}
```

**Explicação de `BaseButton.jsx`.**

Este componente evita repetir classes e propriedades em todos os botoes. `type="button"` por defeito previne submissao acidental em formularios. `disabled` permite mostrar acoes ainda indisponiveis sem as tornar clicaveis.

**Ficheiro `frontend/src/components/ui/TextField.jsx`.**

```jsx
export function TextField({
    id,
    label,
    type = "text",
    value = "",
    placeholder = "",
    disabled = false,
}) {
    // O id recebido liga explicitamente o label ao controlo para leitores de ecrã.
    // O campo fica read-only nesta fundação para não sugerir uma submissão ainda inexistente.
    return (
        <label className="text-field" htmlFor={id}>
            <span>{label}</span>
            <input
                disabled={disabled}
                id={id}
                placeholder={placeholder}
                type={type}
                value={value}
                readOnly
            />
        </label>
    );
}
```

**Explicação de `TextField.jsx`.**

O `label` ligado ao `input` melhora acessibilidade. O campo esta `readOnly` porque, nesta fase, nao vamos submeter formularios reais. Em `MF2`, os formularios funcionais podem evoluir este componente.

**Ficheiro `frontend/src/components/ui/ContentCard.jsx`.**

```jsx
export function ContentCard({ eyebrow, title, description }) {
    // O eyebrow é opcional, mas o título mantém sempre a hierarquia semântica do card.
    return (
        <article className="content-card">
            {eyebrow ? (
                <span className="content-card-eyebrow">{eyebrow}</span>
            ) : null}
            <h3>{title}</h3>
            <p>{description}</p>
        </article>
    );
}
```

**Explicação de `ContentCard.jsx`.**

`ContentCard` mostra informacao textual curta. Ainda nao representa um filme real vindo da base de dados. Serve para validar estrutura visual sem inventar catalogo.

**Ficheiro `frontend/src/components/ui/EmptyState.jsx`.**

```jsx
import { useId } from "react";

export function EmptyState({ title, description, children }) {
    const headingId = useId();

    // O identificador estável associa a secção ao título sem exigir ids definidos manualmente.
    return (
        <section className="empty-state" aria-labelledby={headingId}>
            <h2 id={headingId}>{title}</h2>
            <p>{description}</p>
            {children ? (
                <div className="empty-state-actions">{children}</div>
            ) : null}
        </section>
    );
}
```

5. Explicação do código.

Um estado vazio explica ao utilizador porque uma pagina ainda nao tem conteudo. `useId()` cria um identificador unico para ligar a seccao ao seu titulo, ajudando leitores de ecra.

6. Validação do passo.

Confirmar que cada componente e importado por pelo menos uma pagina no passo seguinte.

7. Cenário negativo/erro esperado.

Erro comum: componentes com nomes vagos como `Thing` ou `Box`. Nomes claros ajudam colegas a perceber onde reutilizar cada parte.

### Passo 5 - Criar paginas base sem funcionalidades falsas

1. Objetivo do passo.

Criar paginas para as rotas principais, deixando claro o que cada pagina vai receber nas fases futuras.

2. Ficheiros envolvidos:
    - CRIAR: `frontend/src/pages/pages.jsx`
    - LOCALIZACAO: `frontend/src/pages/`
    - REVER: `docs/RF.md`, dominios de identidade, catalogo, pesquisa, subscricoes, associacoes e notificacoes

3. Instrucoes concretas.

Cria a pasta `pages/` e adiciona o ficheiro abaixo. As paginas devem ser honestas: mostram estrutura e intencao, mas nao apresentam dados reais inventados.

4. Codigo do ficheiro `frontend/src/pages/pages.jsx`.

```jsx
import { Link } from "react-router-dom";
import { BaseButton } from "../components/ui/BaseButton.jsx";
import { ContentCard } from "../components/ui/ContentCard.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { TextField } from "../components/ui/TextField.jsx";

// As páginas desta fundação comunicam estado e navegação sem inventar dados persistidos.
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
    // Os controlos desativados tornam explícito que a autenticação só será ativada em MF2.
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

As paginas usam os componentes criados antes. `HomePage` apresenta o produto, mas nao promete funcionalidades prontas. `CatalogPage` prepara espaco para metadados e detalhe. `LoginPage` mostra campos desativados para evitar login falso. As outras paginas usam `EmptyState` para explicar o estado atual de forma clara.

6. Validacao do passo.

Abrir as rotas:

- `/`
- `/catalogo`
- `/login`
- `/associacoes`
- `/planos`
- `/conta`
- `/notificacoes`
- `/pesquisa`
- `/rota-errada`

7. Caso negativo ou erro comum.

Erro comum: preencher cards com filmes inventados como se fossem catalogo real. Isso pode contaminar os BKs de catalogo e streaming com dados sem origem.

### Passo 6 - Criar estilos globais e validar a UI base

1. Objetivo do passo.

Dar uma base visual consistente, responsiva e acessivel ao frontend.

2. Ficheiros envolvidos:
    - CRIAR: `frontend/src/styles/tokens.css`
    - CRIAR: `frontend/src/styles/global.css`
    - CRIAR: `frontend/src/services/api/README.md`
    - LOCALIZACAO: `frontend/src/styles/` e `frontend/src/services/api/`
    - REVER: `RNF01`, `RNF02`, `RNF03`, `RNF04`, `RNF05`, `RNF28`, `RNF38`

3. Instrucoes concretas.

Cria as pastas `styles/` e `services/api/`. A pasta `services/api/` ainda so recebe README, porque o cliente API entra no proximo BK.

4. Código completo, correto e integrado com a app final.

**Ficheiro `frontend/src/styles/tokens.css`.**

```css
:root {
    color-scheme: light;
    --color-bg: #f7f8fa;
    --color-surface: #ffffff;
    --color-text: #18202b;
    --color-muted: #5f6b7a;
    --color-brand: #1f7a5f;
    --color-brand-strong: #13513f;
    --color-border: #d8dee8;
    --color-focus: #0b5fff;
    --shadow-soft: 0 12px 30px rgba(24, 32, 43, 0.08);
    --radius-md: 8px;
    --space-page: clamp(1rem, 4vw, 3rem);
    font-family:
        Inter,
        ui-sans-serif,
        system-ui,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        sans-serif;
}
```

**Explicação de `frontend/src/styles/tokens.css`.**

Tokens sao variaveis CSS usadas para cores, espacamentos e raios. Isto evita espalhar cores soltas por muitos ficheiros. A paleta usa verde como acento, mas mantem fundo claro e texto escuro para legibilidade.

**Ficheiro `frontend/src/styles/global.css`.**

```css
* {
    box-sizing: border-box;
}

body {
    margin: 0;
    background: var(--color-bg);
    color: var(--color-text);
}

a {
    color: inherit;
}

button,
input {
    font: inherit;
}

:focus-visible {
    outline: 3px solid var(--color-focus);
    outline-offset: 3px;
}

.app-shell {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.app-header,
.app-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem var(--space-page);
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
}

.app-footer {
    margin-top: auto;
    border-top: 1px solid var(--color-border);
    border-bottom: 0;
    color: var(--color-muted);
    flex-wrap: wrap;
}

.brand-link {
    display: inline-flex;
    align-items: center;
    gap: 0.65rem;
    text-decoration: none;
    font-weight: 800;
}

.brand-mark {
    display: grid;
    width: 2rem;
    height: 2rem;
    place-items: center;
    border-radius: var(--radius-md);
    background: var(--color-brand);
    color: white;
}

.main-nav {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: flex-end;
}

.nav-link,
.button-link,
.base-button {
    min-height: 2.5rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-md);
    text-decoration: none;
    font-weight: 700;
}

.nav-link {
    padding: 0.45rem 0.7rem;
    color: var(--color-muted);
}

.nav-link-active {
    background: #e7f3ee;
    color: var(--color-brand-strong);
}

.app-main {
    width: min(1120px, 100%);
    margin: 0 auto;
    padding: 2rem var(--space-page);
}

.page-section,
.empty-state {
    display: grid;
    gap: 1rem;
}

.hero-section {
    min-height: 360px;
    align-items: center;
}

.hero-copy {
    max-width: 720px;
}

.section-kicker,
.content-card-eyebrow {
    margin: 0;
    color: var(--color-brand-strong);
    font-weight: 800;
    text-transform: uppercase;
}

h1,
h2,
h3,
p {
    margin-top: 0;
}

h1 {
    font-size: 2.5rem;
    line-height: 1.1;
}

.card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1rem;
}

.content-card,
.empty-state,
.form-preview {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    box-shadow: var(--shadow-soft);
    padding: 1rem;
}

.narrow-section {
    max-width: 520px;
}

.form-preview,
.text-field {
    display: grid;
    gap: 0.5rem;
}

.text-field input {
    min-height: 2.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 0 0.75rem;
}

.base-button,
.button-link {
    border: 0;
    padding: 0.7rem 1rem;
    background: var(--color-brand);
    color: white;
    cursor: pointer;
}

.base-button:disabled {
    cursor: not-allowed;
    opacity: 0.65;
}

.empty-state-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
}

@media (max-width: 720px) {
    .app-header {
        align-items: flex-start;
        flex-direction: column;
    }

    .main-nav {
        justify-content: flex-start;
    }

    h1 {
        font-size: 2rem;
    }
}
```

**Explicação de `frontend/src/styles/global.css`.**

O CSS cria uma base simples, responsiva e legivel. `box-sizing: border-box` torna tamanhos mais previsiveis. `:focus-visible` ajuda quem navega por teclado. `.card-grid` adapta o numero de colunas ao espaco disponivel. As classes de botao e link partilham dimensoes para evitar saltos visuais.

**Ficheiro `frontend/src/services/api/README.md`.**

```md
# Cliente API FaithFlix

Esta pasta fica reservada para o BK-MF1-03.

Neste BK ainda nao existe integracao com backend. Nao colocar fetch direto nas paginas antes do cliente API central estar criado.
```

5. Explicação do código.

O README impede um erro comum: cada pagina chamar `fetch` diretamente. O proximo BK vai criar um cliente API centralizado para manter erros, cookies e mensagens consistentes.

6. Validação do passo.

Executar dentro de `frontend/`:

```bash
npm run build
```

Resultado esperado: build Vite concluido sem erros.

7. Cenário negativo/erro esperado.

Erro comum: guardar tokens em `localStorage` ou `sessionStorage` nesta fase. A sessao segura sera tratada com cookies HttpOnly no backend.

#### Critérios de aceite

- `frontend/` existe com `package.json`, `vite.config.js`, `index.html` e `src/`.
- `npm install` e `npm run build` terminam sem erro dentro de `frontend/`.
- As rotas `/`, `/catalogo`, `/login`, `/associacoes`, `/planos`, `/conta`, `/notificacoes`, `/pesquisa` e rota inexistente renderizam sem crash.
- Header, footer, layout, componentes UI e estilos globais existem e sao reutilizados.
- Login e catalogo aparecem como estados controlados, sem autenticacao falsa nem dados reais inventados.
- Uma falha de render mostra fallback PT-PT e retry sem expor stack/mensagem técnica.
- Cada rota conhecida e a rota inexistente têm título seguro terminado em `| FaithFlix`.
- Mudar o `pathname` foca `#conteudo-principal` e repõe o scroll; alterar apenas
  a query não muda foco nem scroll.
- As páginas são carregadas por `lazy`/`Suspense` e ficam fora do chunk inicial.

#### Validação final

Executar dentro de `frontend/`:

```bash
npm install
npm run dev
npm run build
```

Abrir no browser as rotas principais e confirmar que nao ha erros na consola.

#### Evidence para PR/defesa

- `pr`: referencia do PR/commit com `frontend/`.
- `proof`: output de `npm run build` e capturas das rotas `/`, `/catalogo`, `/login` e `/rota-errada`.
- `neg`: rota inexistente, login desativado e ausencia de tokens no storage.

#### Handoff

- `BK-MF1-03` deve criar o cliente API em `frontend/src/services/api/` sem espalhar `fetch` pelas paginas.
- `BK-MF2-01` pode substituir o login desativado por fluxo real quando a autenticacao existir.
- `BK-MF2-03` e `BK-MF2-04` podem substituir o catalogo controlado por dados reais, mantendo rotas e layout.

#### Changelog

- `2026-07-12`: registry final de títulos alinhado ao episódio canónico e ao backoffice com dashboard e rotas editoriais list-first.

- `2026-07-10`: router final consolidado com páginas lazy, ErrorBoundary,
  títulos por rota e lifecycle acessível dependente apenas do pathname.
- `2026-05-30`: reestruturado como tutorial linear, com codigo movido para passos executaveis e sem anexo tecnico no fim.
- `2026-05-29`: acrescentada versao detalhada para frontend React/Vite, rotas, layout, componentes, estilos, validacao e evidence.
