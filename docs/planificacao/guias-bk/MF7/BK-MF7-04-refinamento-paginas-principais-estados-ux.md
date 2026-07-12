# BK-MF7-04 - Refinamento das páginas principais e estados de UX

## Header

- `doc_id`: `GUIA-BK-MF7-04`
- `bk_id`: `BK-MF7-04`
- `macro`: `MF7`
- `owner`: `Davi`
- `apoio`: `Mateus`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF7-03`
- `rf_rnf`: `RNF01, RNF02, RNF03, RNF05, RNF38, RNF40`
- `fase_documental`: `Fase 3`
- `sprint`: `S11`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF7-05`
- `guia_path`: `docs/planificacao/guias-bk/MF7/BK-MF7-04-refinamento-paginas-principais-estados-ux.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais uniformizar os cards, estados vazios, mensagens de erro e estados de sucesso das páginas principais do FaithFlix.

O resultado observável é `docs/evidence/MF7/USABILIDADE-UX.md`, com provas de catálogo, pesquisa, recomendações, biblioteca, planos, associações e conta em mobile, tablet e desktop.

#### Importância

Uma aplicação pode estar funcional e mesmo assim parecer frágil numa defesa se cada página comunicar erros, listas vazias e ações de forma diferente. Este BK aplica os padrões visuais criados em `BK-MF7-03` às páginas que a banca vai percorrer.

`RNF01`, `RNF02`, `RNF03`, `RNF05`, `RNF38` e `RNF40` exigem navegação clara, feedback visual, responsividade, mensagens em português de Portugal e formatos europeus. Este BK não muda regras de negócio; melhora a apresentação e a evidência dos fluxos já construídos.

#### Scope-in

- Refinar `ContentCard` para imagem, badge, descrição, metadados e ação.
- Refinar `EmptyState` para vazio, erro e sucesso com tom visual explícito.
- Adicionar CSS para as classes usadas pelos componentes.
- Aplicar loading, error, empty e success em catálogo, pesquisa, recomendações, biblioteca, planos, associações e conta.
- Corrigir mensagens visíveis para português de Portugal.
- Usar `toLocaleDateString("pt-PT")`, `toLocaleString("pt-PT")` e `Intl.NumberFormat("pt-PT")` nos formatos apresentados.
- Criar `docs/evidence/MF7/USABILIDADE-UX.md`.

#### Scope-out

- Criar novos endpoints.
- Alterar regras de catálogo, biblioteca, subscrições, pagamentos simulados, pool solidária ou privacidade.
- Mudar lógica de recomendação.
- Reescrever backend, middlewares, schemas ou permissões.
- Introduzir dependências visuais.
- Transformar pagamento simulado em gateway real.

#### Estado antes e depois

- Estado antes: `BK-MF7-03` definiu tokens, header, hero e interações.
- Estado antes: as páginas principais existem, mas ainda usam cards, estados e mensagens com estilos diferentes.
- Estado depois: páginas principais partilham componentes, estados e linguagem visual.
- Estado depois: `BK-MF7-05` pode validar a UI por viewport, perfil, teclado e idioma.

#### Pré-requisitos

- `BK-MF7-03` concluído.
- `BK-MF1-02` concluído para estrutura base de componentes frontend.
- `BK-MF1-03` concluído para cliente API e tratamento de erro.
- `BK-MF2-03` concluído para catálogo público.
- `BK-MF2-07` concluído para biblioteca do utilizador.
- `BK-MF3-03` concluído para pesquisa.
- `BK-MF3-05` e `BK-MF3-06` concluídos para recomendação baseline e explicabilidade.
- `BK-MF4-01`, `BK-MF4-02` e `BK-MF4-06` concluídos para planos, pagamento simulado e associações.
- `BK-MF5-01`, `BK-MF5-02` e `BK-MF5-03` concluídos para privacidade na conta.
- Rever `RNF01`, `RNF02`, `RNF03`, `RNF05`, `RNF38` e `RNF40`.

#### Glossário

- Estado vazio: mensagem mostrada quando não há dados para listar.
- Estado de erro: feedback claro quando uma chamada à API falha.
- Estado de sucesso: mensagem curta que confirma que uma ação terminou bem.
- Card de conteúdo: componente reutilizável para apresentar título, imagem, badge, metadados e ação.
- CTA: ação principal visível, como "Ver detalhe".
- Formato europeu: datas, horas e valores apresentados com convenção `pt-PT`.
- Recomendação baseline: sugestão por regras simples e sinais claros, sem modelo avançado.

#### Conceitos teóricos essenciais

- `CANONICO`: `RNF01` pede navegação clara entre catálogo, pesquisa, perfil, subscrição e associações.
- `CANONICO`: `RNF02` pede estados visuais claros para elementos interativos.
- `CANONICO`: `RNF03` pede layout responsivo em desktop, tablet e smartphone.
- `CANONICO`: `RNF05` exige mensagens claras, em português de Portugal, indicando o que fazer a seguir.
- `CANONICO`: `RNF38` exige interface em português de Portugal por defeito.
- `CANONICO`: `RNF40` exige formatos europeus para datas, horas e números na interface.
- `DERIVADO`: `ContentCard` recebe dados já filtrados pelos endpoints existentes; ele não decide permissões nem publica conteúdos.
- `DERIVADO`: `EmptyState` usa `tone` para distinguir vazio, erro e sucesso sem criar três componentes diferentes.
- Estado vazio não é erro. Ele explica uma ausência legítima de dados e ajuda o utilizador a perceber o próximo passo.
- Estado de erro deve ser curto, visível e seguro. Não deve expor detalhes técnicos, stack traces, cookies, tokens ou dados pessoais.
- Loading comunica que a app ainda está a trabalhar. Sem loading, o utilizador pode interpretar atraso como falha.
- Success confirma ações como pagamento simulado, trial ou atualização de perfil sem obrigar o utilizador a adivinhar se o pedido funcionou.
- No frontend, `useEffect` carrega dados quando a página abre; `useState` guarda loading, erro, dados e mensagens visíveis.
- O frontend melhora UX, mas não substitui segurança backend. Dados de conta, biblioteca, subscrição e histórico continuam dependentes da sessão autenticada.

#### Arquitetura do BK

| Camada | Artefacto | Responsabilidade |
| --- | --- | --- |
| UI | `frontend/src/components/ui/ContentCard.jsx` | Card reutilizável para conteúdo e entidades públicas. |
| UI | `frontend/src/components/ui/EmptyState.jsx` | Estado vazio, erro ou sucesso com título, descrição e ação opcional. |
| CSS | `frontend/src/styles/global.css` | Classes dos cards, imagens, metadados e tons de estado. |
| Catálogo | `frontend/src/pages/CatalogPage.jsx` | Lista conteúdos publicados com loading, erro, vazio e success. |
| Pesquisa | `frontend/src/pages/SearchPage.jsx` | Mostra resultados, ausência de resultados e erro de pesquisa. |
| Recomendação | `frontend/src/pages/ForYouPage.jsx` | Mostra cold start e recomendações baseline sem prometer IA avançada. |
| Biblioteca | `frontend/src/pages/MyLibraryPage.jsx` | Mostra favoritos, watchlist e histórico autenticados. |
| Subscrição | `frontend/src/pages/SubscriptionPage.jsx` | Mostra planos, trial e pagamento simulado com formato europeu. |
| Associações | `frontend/src/pages/PublicCharitiesPage.jsx` | Lista associações públicas e acesso ao fluxo solidário. |
| Conta | `frontend/src/pages/AccountPage.jsx` | Mostra perfil, controlo parental e painéis de privacidade. |
| Evidence | `docs/evidence/MF7/USABILIDADE-UX.md` | Validação por página, estado e viewport. |

#### Ficheiros a criar/editar/rever

- EDITAR: `frontend/src/components/ui/ContentCard.jsx`
- EDITAR: `frontend/src/components/ui/EmptyState.jsx`
- EDITAR: `frontend/src/styles/global.css`
- EDITAR: `frontend/src/pages/CatalogPage.jsx`
- EDITAR: `frontend/src/pages/SearchPage.jsx`
- EDITAR: `frontend/src/pages/ForYouPage.jsx`
- EDITAR: `frontend/src/pages/MyLibraryPage.jsx`
- EDITAR: `frontend/src/pages/SubscriptionPage.jsx`
- EDITAR: `frontend/src/pages/PublicCharitiesPage.jsx`
- EDITAR: `frontend/src/pages/AccountPage.jsx`
- CRIAR/EDITAR: `docs/evidence/MF7/USABILIDADE-UX.md`

#### Tutorial técnico linear

### Passo 1 - Refinar componentes e CSS dos estados

1. Objetivo funcional do passo no contexto da app.

Criar a base visual reutilizável para cards, estados vazios, estados de erro e estados de sucesso.

2. Ficheiros envolvidos:
    - EDITAR: `frontend/src/components/ui/ContentCard.jsx`
    - EDITAR: `frontend/src/components/ui/EmptyState.jsx`
    - EDITAR: `frontend/src/styles/global.css`
    - LOCALIZAÇÃO: ficheiros completos dos componentes; bloco de cards/empty states em `global.css`.

3. Instruções do que fazer.

Substitui `ContentCard.jsx` e `EmptyState.jsx` pelas versões completas abaixo. Depois acrescenta o bloco CSS no fim da zona de cards e estados em `global.css`, mantendo as regras criadas em `BK-MF7-03`.

4. Código completo, correto e integrado com a app final.

```jsx
// frontend/src/components/ui/ContentCard.jsx
/**
 * @file Card reutilizável para listas de conteúdo e entidades públicas.
 */

import { Link } from "react-router-dom";

/**
 * Mostra um card com imagem opcional, badge, título, descrição, metadados e ação.
 *
 * @param {{ eyebrow?: string, title: string, description?: string, imageUrl?: string, imageAlt?: string, meta?: string, to?: string, actionLabel?: string }} props Propriedades do card.
 * @param {string} [props.eyebrow] Etiqueta curta apresentada antes do título.
 * @param {string} props.title Título principal visível no card.
 * @param {string} [props.description] Texto descritivo curto.
 * @param {string} [props.imageUrl] URL da imagem do card.
 * @param {string} [props.imageAlt] Texto alternativo da imagem.
 * @param {string} [props.meta] Informação complementar, como categoria, preço ou data.
 * @param {string} [props.to] Rota interna usada pela ação.
 * @param {string} [props.actionLabel="Ver detalhe"] Texto da ação.
 * @returns {JSX.Element} Card acessível e reutilizável.
 */
export function ContentCard({
  eyebrow,
  title,
  description,
  imageUrl,
  imageAlt = "",
  meta,
  to,
  actionLabel = "Ver detalhe",
}) {
  return (
    <article className="content-card">
      {imageUrl ? (
        // O alt fica contextual quando a imagem acrescenta informação; vazio quando for decorativa.
        <img className="content-card-image" src={imageUrl} alt={imageAlt} />
      ) : null}
      {eyebrow ? <span className="content-card-eyebrow">{eyebrow}</span> : null}
      <h3>{title}</h3>
      {description ? <p>{description}</p> : null}
      {meta ? <p className="content-card-meta">{meta}</p> : null}
      {to ? (
        // Link preserva o routing SPA e evita recarregar sessão, contexto e estado global.
        <Link className="button-link" to={to}>
          {actionLabel}
        </Link>
      ) : null}
    </article>
  );
}
```

```jsx
// frontend/src/components/ui/EmptyState.jsx
/**
 * @file Estado vazio reutilizável para listas, erros, sucessos e permissões.
 */

import { useId } from "react";

/**
 * Mostra uma mensagem clara quando a página não tem dados úteis para listar.
 *
 * @param {{ title: string, description: string, children?: React.ReactNode, tone?: "neutral" | "error" | "success" }} props Propriedades do estado.
 * @param {string} props.title Título curto do estado.
 * @param {string} props.description Explicação orientada para o utilizador.
 * @param {React.ReactNode} [props.children] Ações opcionais, como links ou botões.
 * @param {"neutral" | "error" | "success"} [props.tone="neutral"] Tom visual do estado.
 * @returns {JSX.Element} Secção acessível de estado.
 */
export function EmptyState({ title, description, children, tone = "neutral" }) {
  const headingId = useId();

  return (
    // O ID liga o título à secção para leitores de ecrã identificarem o estado.
    <section className={`empty-state empty-state-${tone}`} aria-labelledby={headingId}>
      <h2 id={headingId}>{title}</h2>
      <p>{description}</p>
      {children ? <div className="empty-state-actions">{children}</div> : null}
    </section>
  );
}
```

```css
/* frontend/src/styles/global.css */
.content-card {
  display: grid;
  gap: 0.75rem;
}

.content-card-image {
  width: 100%;
  aspect-ratio: 2 / 3;
  border-radius: var(--radius-md);
  background: var(--color-surface-raised);
  object-fit: cover;
}

.content-card-meta,
.muted-text {
  color: var(--color-muted);
  font-size: 0.92rem;
}

/* Os tons tornam erro e sucesso distinguíveis sem criar componentes duplicados. */
.empty-state-neutral {
  border-color: var(--color-border);
}

.empty-state-error {
  border-color: rgba(209, 100, 73, 0.72);
  background: rgba(209, 100, 73, 0.08);
}

.empty-state-success {
  border-color: rgba(141, 163, 133, 0.72);
  background: rgba(141, 163, 133, 0.1);
}

.status-message {
  border-left: 4px solid var(--color-brand);
  border-radius: var(--radius-sm);
  background: var(--color-surface-soft);
  padding: 0.75rem 1rem;
}
```

5. Explicação do código.

`ContentCard` centraliza o padrão visual usado por catálogo, pesquisa, biblioteca e associações. Os dados entram por props e já vêm das APIs existentes; o componente não filtra permissões, não decide publicação e não inventa dados. `Link` é usado porque estas ações navegam dentro da aplicação React e devem preservar sessão e estado.

`EmptyState` separa ausência de dados, erro e sucesso através da prop `tone`. Isto evita mensagens soltas em parágrafos diferentes e torna os estados mais fáceis de validar em `BK-MF7-05`. `useId` garante uma ligação acessível entre a secção e o título, sem o aluno criar IDs repetidos.

O CSS fecha o contrato visual das classes usadas pelos componentes. Sem este bloco, `content-card-image`, `content-card-meta` e `empty-state-error` existiriam no JSX, mas não teriam efeito visual garantido. O aluno pode ajustar cores dentro dos tokens criados em `BK-MF7-03`, mas não deve remover os tons de erro e sucesso porque eles suportam `RNF02` e `RNF05`.

6. Validação do passo.

Executa `npm --prefix frontend run build`. Resultado esperado: a build termina sem erros de import. Abre uma página que use `EmptyState` com `tone="error"` e confirma que o erro tem destaque visual diferente de um estado neutro.

7. Cenário negativo/erro esperado.

Remove temporariamente a regra `.empty-state-error` no CSS e observa a página de erro. Resultado esperado: o erro continua compilável, mas perde diferença visual; repõe a regra antes de fechar o BK.

### Passo 2 - Aplicar o padrão ao catálogo e à pesquisa

1. Objetivo funcional do passo no contexto da app.

Transformar catálogo e pesquisa em páginas consistentes, com loading, erro, vazio e lista de resultados.

2. Ficheiros envolvidos:
    - EDITAR: `frontend/src/pages/CatalogPage.jsx`
    - EDITAR: `frontend/src/pages/SearchPage.jsx`
    - LOCALIZAÇÃO: ficheiros completos.

3. Instruções do que fazer.

Substitui os dois ficheiros pelas versões completas abaixo. Mantém `catalogApi.listPublished()` e `searchApi.search()` porque esses clientes já foram criados em BKs anteriores.

4. Código completo, correto e integrado com a app final.

```jsx
// frontend/src/pages/CatalogPage.jsx
/**
 * @file Página pública de catálogo FaithFlix.
 */

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ContinueWatchingStrip } from "../components/playback/ContinueWatchingStrip.jsx";
import { ContentCard } from "../components/ui/ContentCard.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { catalogApi } from "../services/api/catalogApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

const PAGE_LIMIT = 24;
const CONTENT_TYPES = ["movie", "series", "episode", "documentary"];

function parsePositivePage(value) {
  return /^\d+$/.test(value ?? "") && Number(value) > 0 ? Number(value) : 1;
}

/**
 * Mostra todos os conteúdos publicados através de paginação navegável.
 *
 * @returns {JSX.Element} Página de catálogo.
 */
export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [reloadVersion, setReloadVersion] = useState(0);
  const [state, setState] = useState({
    status: "loading",
    items: [],
    total: 0,
    error: "",
  });
  const requestedType = searchParams.get("type") ?? "";
  const type = CONTENT_TYPES.includes(requestedType) ? requestedType : "";
  const page = parsePositivePage(searchParams.get("page"));

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setState((current) => ({ ...current, status: "loading", error: "" }));

    catalogApi.listPublished(
      { type, page, limit: PAGE_LIMIT },
      { signal: controller.signal },
    ).then((response) => {
      if (!active || controller.signal.aborted) return;
      setState({
        status: "ready",
        items: Array.isArray(response.items) ? response.items : [],
        total: Number.isSafeInteger(response.total) ? response.total : 0,
        error: "",
      });
    }).catch((requestError) => {
      if (!active || requestError?.code === "REQUEST_ABORTED") return;
      setState((current) => ({
        ...current,
        status: "error",
        error: toUserMessage(requestError),
      }));
    });

    return () => {
      active = false;
      controller.abort();
    };
  }, [page, reloadVersion, type]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(state.total / PAGE_LIMIT)),
    [state.total],
  );

  function updateLocation(nextType, nextPage) {
    const next = new URLSearchParams();
    if (nextType) next.set("type", nextType);
    if (nextPage > 1) next.set("page", String(nextPage));
    setSearchParams(next);
  }

  return (
    <section className="page-section">
      <p className="section-kicker">Catálogo</p>
      <h1>Catálogo FaithFlix</h1>
      <ContinueWatchingStrip />

      <label htmlFor="catalog-type">Tipo</label>
      <select
        id="catalog-type"
        value={type}
        onChange={(event) => updateLocation(event.target.value, 1)}
      >
        <option value="">Todos</option>
        {CONTENT_TYPES.map((value) => (
          <option key={value} value={value}>{value}</option>
        ))}
      </select>

      {state.status === "loading" ? <p role="status">A carregar catálogo...</p> : null}
      {state.status === "error" ? (
        <EmptyState
          title="Não foi possível carregar o catálogo"
          description={state.error}
          tone="error"
        >
          <button type="button" onClick={() => setReloadVersion((value) => value + 1)}>
            Tentar novamente
          </button>
        </EmptyState>
      ) : null}
      {state.status === "ready" && state.items.length === 0 ? (
        <EmptyState
          title="Ainda não existem conteúdos publicados"
          description="Volta a esta página depois de o catálogo público ser atualizado."
        />
      ) : null}

      <section className="content-grid" aria-label="Conteúdos publicados">
        {state.items.map((content) => (
          <ContentCard
            key={content.id}
            eyebrow={content.type}
            title={content.title}
            description={content.synopsis}
            imageUrl={content.assets?.posterUrl}
            imageAlt={`Cartaz de ${content.title}`}
            to={`/catalogo/${encodeURIComponent(content.slug ?? content.id)}`}
          />
        ))}
      </section>

      {state.status === "ready" ? (
        <nav aria-label="Paginação do catálogo">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => updateLocation(type, page - 1)}
          >
            Anterior
          </button>
          <span>Página {page} de {totalPages} ({state.total})</span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => updateLocation(type, page + 1)}
          >
            Seguinte
          </button>
        </nav>
      ) : null}
    </section>
  );
}
```

```jsx
// frontend/src/pages/SearchPage.jsx
/**
 * @file Página de pesquisa unificada do FaithFlix.
 */

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SearchFilters } from "../components/search/SearchFilters.jsx";
import { ContentCard } from "../components/ui/ContentCard.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { searchApi } from "../services/api/searchApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

const PAGE_LIMIT = 12;
const INITIAL_FORM = {
  q: "",
  type: "",
  taxonomyId: "",
  sort: "title",
};

function parsePositivePage(value) {
  return /^\d+$/.test(value ?? "") && Number(value) > 0 ? Number(value) : 1;
}

/**
 * Mantém query, filtros e página na URL e cancela respostas obsoletas.
 *
 * @returns {JSX.Element} Página de pesquisa.
 */
export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [form, setForm] = useState(INITIAL_FORM);
  const [result, setResult] = useState(null);
  const [requestStatus, setRequestStatus] = useState("idle");
  const [error, setError] = useState("");
  const [reloadVersion, setReloadVersion] = useState(0);
  const requestVersionRef = useRef(0);
  const urlState = searchParams.toString();
  const query = searchParams.get("q") ?? "";
  const type = searchParams.get("type") ?? "";
  const taxonomyId = searchParams.get("taxonomyId") ?? "";
  const sort = searchParams.get("sort") ?? "title";
  const page = parsePositivePage(searchParams.get("page"));

  useEffect(() => {
    setForm({
      q: query,
      type,
      taxonomyId,
      sort,
    });
  }, [query, sort, taxonomyId, type]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResult(null);
      setRequestStatus("idle");
      setError("");
      return undefined;
    }

    const version = ++requestVersionRef.current;
    const controller = new AbortController();
    setRequestStatus("loading");
    setError("");
    setResult(null);

    searchApi.search({
      q: query,
      type,
      taxonomyId,
      sort,
      page,
      limit: PAGE_LIMIT,
    }, { signal: controller.signal }).then((response) => {
      if (controller.signal.aborted || version !== requestVersionRef.current) return;
      setResult(response);
      setRequestStatus("ready");
    }).catch((requestError) => {
      if (requestError?.code === "REQUEST_ABORTED") return;
      if (version !== requestVersionRef.current) return;
      setResult(null);
      setError(toUserMessage(requestError));
      setRequestStatus("error");
    });

    return () => controller.abort();
  }, [page, query, reloadVersion, sort, taxonomyId, type, urlState]);

  /**
   * Publica a intenção atual na URL e regressa à primeira página.
   *
   * @param {React.FormEvent<HTMLFormElement>} event Evento do formulário.
   * @returns {void}
   */
  function submitSearch(event) {
    event.preventDefault();
    const q = form.q.trim();
    if (q.length < 2) return;
    const next = new URLSearchParams({ q, sort: form.sort, page: "1" });
    if (form.type) next.set("type", form.type);
    if (form.taxonomyId) next.set("taxonomyId", form.taxonomyId);
    setSearchParams(next);
  }

  function moveToPage(page) {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(page));
    setSearchParams(next);
  }

  const items = result?.items ?? [];
  const totalPages = result ? Math.max(1, Math.ceil(result.total / result.limit)) : 1;

  return (
    <section className="page-section">
      <p className="section-kicker">Descoberta</p>
      <h1>Pesquisa</h1>
      <form onSubmit={submitSearch} role="search">
        <label htmlFor="search-query">Pesquisar conteúdos e temas</label>
        <input
          id="search-query"
          value={form.q}
          minLength={2}
          maxLength={80}
          onChange={(event) => setForm((current) => ({ ...current, q: event.target.value }))}
        />
        <SearchFilters value={form} onChange={setForm} />
        <button type="submit">Pesquisar</button>
      </form>

      {requestStatus === "idle" ? <p>Escreve pelo menos 2 caracteres para pesquisar.</p> : null}
      {requestStatus === "loading" ? <p role="status">A pesquisar...</p> : null}
      {requestStatus === "error" ? (
        <EmptyState title="Não foi possível pesquisar" description={error} tone="error">
          <button type="button" onClick={() => setReloadVersion((value) => value + 1)}>
            Tentar novamente
          </button>
        </EmptyState>
      ) : null}
      {result ? (
        <p className="status-message">
          {result.total} resultado{result.total === 1 ? "" : "s"} para "{result.query}".
        </p>
      ) : null}
      {result && items.length === 0 ? (
        <EmptyState
          title="Sem resultados para a pesquisa"
          description="Experimenta retirar filtros ou pesquisar por outro título, tema ou categoria."
        />
      ) : null}

      <section className="content-grid" aria-label="Resultados da pesquisa">
        {items.map((content) => (
          <ContentCard
            key={content.id}
            eyebrow={content.type}
            title={content.title}
            description={content.synopsis}
            imageUrl={content.posterUrl}
            imageAlt={`Cartaz de ${content.title}`}
            meta={content.taxonomyNames?.join(", ")}
            to={`/catalogo/${encodeURIComponent(content.slug ?? content.id)}`}
          />
        ))}
      </section>

      {result && result.total > 0 ? (
        <nav aria-label="Páginas dos resultados">
          <button
            type="button"
            disabled={result.page <= 1 || requestStatus === "loading"}
            onClick={() => moveToPage(result.page - 1)}
          >
            Anterior
          </button>
          <span>Página {result.page} de {totalPages}</span>
          <button
            type="button"
            disabled={result.page >= totalPages || requestStatus === "loading"}
            onClick={() => moveToPage(result.page + 1)}
          >
            Seguinte
          </button>
        </nav>
      ) : null}
    </section>
  );
}
```

5. Explicação do código.

`CatalogPage` preserva integralmente o contrato de `BK-MF2-03`: filtro e página
ficam na URL, o total vem do backend, `Anterior`/`Seguinte` alcançam todas as
páginas e cada mudança aborta a leitura anterior. `ContentCard` altera apenas a
apresentação; não reduz a listagem aos primeiros 24 resultados. O retry repete a
mesma página/filtro e o link codifica o identificador num único segmento.

`SearchPage` preserva o contrato de `BK-MF3-03`: query, filtros e página ficam na
URL, `total` determina a paginação e `AbortController` mais uma versão impedem
respostas antigas. `SearchFilters` recebe as props que realmente exporta
(`value`/`onChange`); a pesquisa envia `q`, não um alias `query`. A UI não inventa
motor de pesquisa nem expõe detalhe técnico do erro.

6. Validação do passo.

Executa `npm --prefix frontend run build`. Depois valida três situações: catálogo com itens, catálogo vazio e erro simulado; pesquisa com resultados, pesquisa sem resultados e erro simulado. Resultado esperado: todas as mensagens aparecem em português de Portugal.

7. Cenário negativo/erro esperado.

Simula uma falha de API. Resultado esperado: a página mostra `Não foi possível carregar o catálogo` ou `Não foi possível pesquisar`, sem stack trace nem detalhe técnico sensível.

### Passo 3 - Aplicar o padrão a recomendações e biblioteca

1. Objetivo funcional do passo no contexto da app.

Uniformizar a página "Para si" e a biblioteca pessoal sem alterar recomendação baseline, favoritos, watchlist ou histórico.

2. Ficheiros envolvidos:
    - EDITAR: `frontend/src/services/api/recommendationsApi.js`
    - EDITAR: `frontend/src/pages/ForYouPage.jsx`
    - EDITAR: `frontend/src/pages/MyLibraryPage.jsx`
    - LOCALIZAÇÃO: ficheiros completos.

3. Instruções do que fazer.

Atualiza `recommendationsApi` para propagar cancelamento e substitui os ficheiros
pelas versões completas abaixo. Mantém `recommendationsApi.getMine()`,
`libraryApi.listFavorites()`,
`libraryApi.listWatchlist()` e `libraryApi.listHistory()`.

4. Código completo, correto e integrado com a app final.

```js
// frontend/src/services/api/recommendationsApi.js
import { apiClient } from "./apiClient.js";

export const recommendationsApi = {
  getMine(options = {}) {
    return apiClient.get("/api/recommendations/me", options);
  },
};
```

```jsx
// frontend/src/pages/ForYouPage.jsx
/**
 * @file Página de recomendações pessoais baseline.
 */

import { useEffect, useState } from "react";
import { ContentCarousel } from "../components/discovery/ContentCarousel.jsx";
import { RecommendationExplanation } from "../components/recommendations/RecommendationExplanation.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { recommendationsApi } from "../services/api/recommendationsApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

/**
 * Mostra recomendações baseline para o utilizador autenticado.
 *
 * @returns {JSX.Element} Página de recomendações pessoais.
 */
export function ForYouPage() {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadVersion, setReloadVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setError("");
    setRecommendations(null);

    /**
     * Carrega recomendações mantendo a explicabilidade definida em MF3.
     *
     * @returns {Promise<void>} Termina depois de atualizar a página.
     */
    async function loadRecommendations() {
      try {
        const response = await recommendationsApi.getMine({
          signal: controller.signal,
        });

        if (active && !controller.signal.aborted) {
          setRecommendations(response);
        }
      } catch (requestError) {
        if (active && requestError?.code !== "REQUEST_ABORTED") {
          setError(toUserMessage(requestError));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadRecommendations();

    return () => {
      active = false;
      controller.abort();
    };
  }, [reloadVersion]);

  const groups = Array.isArray(recommendations?.groups)
    ? recommendations.groups.filter(
        (group) => Array.isArray(group?.items) && group.items.length > 0,
      )
    : [];

  return (
    <section className="page-section">
      <p className="section-kicker">Recomendação baseline</p>
      <h1>Para si</h1>

      {loading ? <p role="status">A preparar recomendações...</p> : null}
      {error ? (
        <EmptyState title="Não foi possível carregar recomendações" description={error} tone="error">
          <button type="button" onClick={() => setReloadVersion((value) => value + 1)}>
            Tentar novamente
          </button>
        </EmptyState>
      ) : null}
      {recommendations ? (
        <p className="status-message">
          {recommendations.coldStart
            ? "Ainda há poucos sinais teus, por isso mostramos sugestões gerais e explicáveis."
            : "As sugestões usam sinais agregados da tua atividade na FaithFlix."}
        </p>
      ) : null}
      {!loading && !error && groups.length === 0 ? (
        <EmptyState
          title="Ainda sem sinais suficientes"
          description="Quando existirem conteúdos elegíveis ou atividade suficiente, as sugestões aparecem aqui."
        />
      ) : null}

      {groups.map((group) => (
        <section className="recommendation-group" key={group.id}>
          <RecommendationExplanation explanation={group.explanation} />
          <ContentCarousel title={group.title} items={group.items} />
        </section>
      ))}
    </section>
  );
}
```

```jsx
// frontend/src/pages/MyLibraryPage.jsx
/**
 * @file Página da biblioteca pessoal do utilizador autenticado.
 */

import { useEffect, useState } from "react";
import { ContentCard } from "../components/ui/ContentCard.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { libraryApi } from "../services/api/libraryApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

const LIBRARY_PAGE_LIMIT = 12;

/**
 * Mostra uma lista paginada da biblioteca sem bloquear as restantes secções.
 *
 * @param {{ id: string, title: string, loadItems: Function }} props Propriedades da lista.
 * @returns {JSX.Element} Secção de biblioteca.
 */
function PaginatedLibrarySection({ id, title, loadItems }) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadVersion, setReloadVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setError("");

    loadItems(
      { page, limit: LIBRARY_PAGE_LIMIT },
      { signal: controller.signal },
    ).then((response) => {
      if (!active || controller.signal.aborted) return;
      setItems(Array.isArray(response.items) ? response.items : []);
      setPagination({
        page: Number.isSafeInteger(response.page) ? response.page : page,
        total: Number.isSafeInteger(response.total) ? response.total : 0,
        totalPages: Number.isSafeInteger(response.totalPages) ? response.totalPages : 0,
      });
    }).catch((requestError) => {
      if (!active || requestError?.code === "REQUEST_ABORTED") return;
      setError(toUserMessage(requestError));
    }).finally(() => {
      if (active) setLoading(false);
    });

    return () => {
      active = false;
      controller.abort();
    };
  }, [loadItems, page, reloadVersion]);

  return (
    <section aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`}>{title}</h2>
      {loading ? <p role="status">A carregar {title.toLowerCase()}...</p> : null}
      {error ? (
        <EmptyState title={`Não foi possível carregar ${title.toLowerCase()}`} description={error} tone="error">
          <button type="button" onClick={() => setReloadVersion((value) => value + 1)}>
            Tentar novamente
          </button>
        </EmptyState>
      ) : null}
      {!loading && !error && items.length === 0 ? (
        <EmptyState
          title={`${title} sem conteúdos`}
          description="Usa o catálogo para adicionar conteúdos a esta secção."
        />
      ) : null}
      {!loading && !error && items.length > 0 ? (
        <div className="content-grid">
          {items.map((item) => (
            <ContentCard
              key={`${id}-${item.id}`}
              title={item.title}
              imageUrl={item.posterUrl}
              imageAlt={`Cartaz de ${item.title}`}
              to={`/catalogo/${encodeURIComponent(item.slug ?? item.id)}`}
            />
          ))}
        </div>
      ) : null}
      {!loading && !error && pagination.totalPages > 1 ? (
        <nav aria-label={`Paginação de ${title}`}>
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >
            Anterior
          </button>
          <span>Página {pagination.page} de {pagination.totalPages} ({pagination.total})</span>
          <button
            type="button"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((value) => Math.min(pagination.totalPages, value + 1))}
          >
            Seguinte
          </button>
        </nav>
      ) : null}
    </section>
  );
}

/**
 * Mostra favoritos, watchlist e histórico do utilizador autenticado.
 *
 * @returns {JSX.Element} Página da minha biblioteca.
 */
export function MyLibraryPage() {
  return (
    <section className="page-section" data-testid="my-library">
      <p className="section-kicker">Biblioteca</p>
      <h1>Biblioteca</h1>
      <PaginatedLibrarySection
        id="favorites"
        title="Favoritos"
        loadItems={libraryApi.listFavorites}
      />
      <PaginatedLibrarySection
        id="watchlist"
        title="Para ver mais tarde"
        loadItems={libraryApi.listWatchlist}
      />
      <PaginatedLibrarySection
        id="history"
        title="Histórico"
        loadItems={libraryApi.listHistory}
      />
    </section>
  );
}
```

5. Explicação do código.

`ForYouPage` mantém a recomendação baseline criada na MF3. O texto de cold
start é honesto: não promete modelo avançado nem personalização opaca. Os dados
entram por `recommendationsApi.getMine()` e saem como grupos com explicação e com
o `ContentCarousel` já criado em `BK-MF3-04`; não existe um helper paralelo por
adivinhar. A regra de segurança continua no backend e na sessão; a página apenas
mostra a resposta.

`MyLibraryPage` mantém paginação independente para favoritos, watchlist e
histórico. Cada `PaginatedLibrarySection` usa o envelope
`{ items, page, limit, total, totalPages }`, cancela a leitura anterior e oferece
retry sem bloquear as outras secções. Estes endpoints pertencem ao utilizador
autenticado e nunca recebem `userId` do browser.

6. Validação do passo.

Valida recomendações com grupos, recomendações vazias e erro. Valida biblioteca com listas preenchidas, listas vazias e erro de sessão. Resultado esperado: vazio e erro são visualmente diferentes e todas as mensagens têm acentuação correta.

7. Cenário negativo/erro esperado.

Entra sem sessão e abre a biblioteca. Resultado esperado: a API devolve erro autenticado e a página mostra uma mensagem segura, sem tentar consultar dados de outro utilizador.

### Passo 4 - Aplicar o padrão a planos e associações

1. Objetivo funcional do passo no contexto da app.

Uniformizar subscrição, trial, pagamento simulado e associações públicas sem criar gateway real nem novas regras da pool solidária.

2. Ficheiros envolvidos:
    - EDITAR: `frontend/src/services/api/subscriptionsApi.js`
    - EDITAR: `frontend/src/pages/SubscriptionPage.jsx`
    - EDITAR: `frontend/src/pages/PublicCharitiesPage.jsx`
    - LOCALIZAÇÃO: ficheiros completos.

3. Instruções do que fazer.

Atualiza primeiro o cliente de subscrições para propagar `AbortSignal` sem perder
métodos. Depois substitui as páginas pelas versões completas abaixo. Mantém
`paymentsApi` e `charitiesApi` como clientes existentes.

4. Código completo, correto e integrado com a app final.

```js
// frontend/src/services/api/subscriptionsApi.js
import { apiClient } from "./apiClient.js";

export const subscriptionsApi = {
  listPlans(options = {}) {
    return apiClient.get("/api/subscriptions/plans", options);
  },
  getMine(options = {}) {
    return apiClient.get("/api/subscriptions/me", options);
  },
  cancelRenewal(options = {}) {
    return apiClient.post("/api/subscriptions/me/cancel-renewal", undefined, options);
  },
};
```

```jsx
// frontend/src/pages/SubscriptionPage.jsx
/**
 * @file Página de subscrição, trial e pagamento simulado.
 */

import { useEffect, useRef, useState } from "react";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { useSession } from "../context/SessionContext.jsx";
import { paymentsApi } from "../services/api/paymentsApi.js";
import { subscriptionsApi } from "../services/api/subscriptionsApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

const moneyFormatter = new Intl.NumberFormat("pt-PT", {
  currency: "EUR",
  style: "currency",
});

/**
 * Formata uma data para padrão europeu.
 *
 * @param {string | Date} value Valor de data.
 * @returns {string} Data formatada em português de Portugal.
 */
function formatDate(value) {
  return new Date(value).toLocaleDateString("pt-PT");
}

/**
 * Formata preço em cêntimos.
 *
 * @param {number} cents Valor em cêntimos.
 * @returns {string} Valor monetário em euros.
 */
function formatPrice(cents) {
  return moneyFormatter.format(cents / 100);
}

/**
 * Mostra planos, subscrição atual, trial e checkout simulado.
 *
 * @returns {JSX.Element} Página de subscrição.
 */
export function SubscriptionPage() {
  const session = useSession();
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [subscriptionError, setSubscriptionError] = useState("");
  const [status, setStatus] = useState("");
  const activeOperationRef = useRef(null);
  const intentionKeysRef = useRef(new Map());
  const mountedRef = useRef(true);

  function idempotencyKeyFor(intention) {
    if (!intentionKeysRef.current.has(intention)) {
      intentionKeysRef.current.set(intention, crypto.randomUUID());
    }
    return intentionKeysRef.current.get(intention);
  }

  function reserveOperation(name) {
    if (activeOperationRef.current) return null;
    const controller = new AbortController();
    activeOperationRef.current = { name, controller };
    setSubmitting(true);
    return controller;
  }

  function releaseOperation(controller) {
    if (activeOperationRef.current?.controller !== controller) return;
    activeOperationRef.current = null;
    if (mountedRef.current) setSubmitting(false);
  }

  /**
   * Carrega planos públicos e subscrição autenticada.
   *
   * @returns {Promise<void>} Termina depois de atualizar a página.
   */
  async function loadData(signal, sessionStatus) {
    setLoading(true);
    setError("");
    setSubscriptionError("");

    try {
      const plansResponse = await subscriptionsApi.listPlans({ signal });
      if (signal.aborted) return;
      setPlans(plansResponse.plans);
    } catch (apiError) {
      if (signal.aborted || apiError?.code === "REQUEST_ABORTED") return;
      setError(toUserMessage(apiError));
      if (!signal.aborted) setLoading(false);
      return;
    }

    if (sessionStatus === "authenticated") {
      try {
        const subscriptionResponse = await subscriptionsApi.getMine({ signal });
        if (signal.aborted) return;
        setSubscription(subscriptionResponse.subscription);
      } catch (apiError) {
        if (signal.aborted || apiError?.code === "REQUEST_ABORTED") return;
        setSubscriptionError(toUserMessage(apiError));
      }
    } else {
      // Anonymous/unavailable não dispara leitura privada nem é convertido em logout.
      setSubscription(null);
    }

    if (!signal.aborted) setLoading(false);
  }

  useEffect(() => {
    const controller = new AbortController();
    mountedRef.current = true;
    void loadData(controller.signal, session.status);
    return () => {
      mountedRef.current = false;
      controller.abort();
      activeOperationRef.current?.controller.abort();
      activeOperationRef.current = null;
    };
  }, [session.status]);

  /**
   * Executa checkout aprovado com método de teste documentado.
   *
   * @param {string} planCode Código do plano escolhido.
   * @returns {Promise<void>} Termina quando o checkout simulado responder.
   */
  async function handleSimulatedCheckout(planCode) {
    const intention = `checkout:${planCode}`;
    const controller = reserveOperation(intention);
    if (!controller) return;
    const idempotencyKey = idempotencyKeyFor(intention);
    setStatus("");
    setError("");

    try {
      // O pagamento é simulado; não recolhe cartão nem chama gateway externo.
      const response = await paymentsApi.simulatedCheckout({
        planCode,
        paymentMethod: "card_test",
        simulateOutcome: "approved",
      }, idempotencyKey, { signal: controller.signal });
      if (controller.signal.aborted) return;
      setSubscription(response.subscription);
      setStatus("Pagamento simulado aprovado.");
      intentionKeysRef.current.delete(intention);
    } catch (apiError) {
      if (controller.signal.aborted || apiError?.code === "REQUEST_ABORTED") return;
      setError(toUserMessage(apiError));
    } finally {
      releaseOperation(controller);
    }
  }

  /**
   * Inicia trial gratuito.
   *
   * @returns {Promise<void>} Termina quando o backend confirmar o trial.
   */
  async function handleStartTrial() {
    const controller = reserveOperation("trial");
    if (!controller) return;
    const idempotencyKey = idempotencyKeyFor("trial");
    setStatus("");
    setError("");

    try {
      const response = await paymentsApi.startTrial(idempotencyKey, {
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      setSubscription(response.subscription);
      setStatus(`Trial ativo até ${formatDate(response.trial.endsAt)}.`);
      intentionKeysRef.current.delete("trial");
    } catch (apiError) {
      if (controller.signal.aborted || apiError?.code === "REQUEST_ABORTED") return;
      setError(toUserMessage(apiError));
    } finally {
      releaseOperation(controller);
    }
  }

  /**
   * Cancela apenas a renovação futura da subscrição.
   *
   * @returns {Promise<void>} Termina quando a subscrição for atualizada.
   */
  async function handleCancelRenewal() {
    const controller = reserveOperation("cancel-renewal");
    if (!controller) return;
    if (!window.confirm("Cancelar a renovação no fim do ciclo atual?")) {
      releaseOperation(controller);
      return;
    }
    setStatus("");
    setError("");

    try {
      const response = await subscriptionsApi.cancelRenewal({
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      setSubscription(response.subscription);
      setStatus("Renovação cancelada no fim do ciclo atual.");
    } catch (apiError) {
      if (controller.signal.aborted || apiError?.code === "REQUEST_ABORTED") return;
      setError(toUserMessage(apiError));
    } finally {
      releaseOperation(controller);
    }
  }

  if (loading) {
    return (
      <section className="page-section">
        <p role="status">A carregar subscrição...</p>
      </section>
    );
  }

  return (
    <section className="page-section">
      <p className="section-kicker">Planos</p>
      <h1>Subscrição</h1>
      {error ? <EmptyState title="Não foi possível atualizar a subscrição" description={error} tone="error" /> : null}
      {subscriptionError ? (
        <EmptyState
          title="Não foi possível consultar a subscrição"
          description={subscriptionError}
          tone="error"
        />
      ) : null}
      {status ? <EmptyState title="Operação concluída" description={status} tone="success" /> : null}

      <section>
        <h2>Estado atual</h2>
        {session.status === "loading" ? <p role="status">A confirmar sessão...</p> : null}
        {session.status === "anonymous" ? <p>Inicia sessão para consultar ou alterar a tua subscrição.</p> : null}
        {session.status === "unavailable" ? (
          <EmptyState
            title="Sessão temporariamente indisponível"
            description="Não assumimos que terminaste sessão. Tenta novamente antes de alterar o plano."
            tone="error"
          >
            <button type="button" onClick={() => session.refreshSession()}>
              Tentar novamente
            </button>
          </EmptyState>
        ) : null}
        {session.status === "authenticated" ? (
          <p>{subscription?.status === "none" ? "Sem subscrição ativa." : subscription?.status}</p>
        ) : null}
        {session.status === "authenticated" && subscription?.currentPeriodEnd ? <p>Fim do ciclo: {formatDate(subscription.currentPeriodEnd)}</p> : null}
        {session.status === "authenticated" && subscription?.hasPremiumAccess && !subscription.cancelAtPeriodEnd ? (
          <button type="button" disabled={submitting} onClick={handleCancelRenewal}>
            Cancelar renovação
          </button>
        ) : null}
      </section>

      <section>
        <h2>Trial</h2>
        <p>Experimenta o FaithFlix durante 14 dias sem dados de cartão.</p>
        <button type="button" disabled={submitting || session.status !== "authenticated"} onClick={handleStartTrial}>
          Iniciar trial
        </button>
      </section>

      <section>
        <h2>Planos</h2>
        {plans.length === 0 ? (
          <EmptyState title="Sem planos ativos" description="Volta a esta página depois de a equipa publicar novos planos." />
        ) : null}
        <div className="content-grid">
          {plans.map((plan) => (
            <article className="content-card" key={plan.code}>
              <span className="content-card-eyebrow">{plan.interval}</span>
              <h3>{plan.name}</h3>
              <p className="content-card-meta">{formatPrice(plan.priceCents)}</p>
              <p>{plan.solidaritySharePercent}% para a pool solidária.</p>
              <button type="button" disabled={submitting || session.status !== "authenticated"} onClick={() => handleSimulatedCheckout(plan.code)}>
                Pagar com método simulado
              </button>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
```

```jsx
// frontend/src/pages/PublicCharitiesPage.jsx
/**
 * @file Página pública de associações apoiadas.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ContentCard } from "../components/ui/ContentCard.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { charitiesApi } from "../services/api/charitiesApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

/**
 * Lista associações públicas e dá acesso ao formulário de candidatura.
 *
 * @returns {JSX.Element} Página pública de associações.
 */
export function PublicCharitiesPage() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadVersion, setReloadVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setError("");

    /**
     * Carrega apenas associações públicas elegíveis.
     *
     * @returns {Promise<void>} Termina depois de atualizar a lista.
     */
    async function loadCharities() {
      try {
        const response = await charitiesApi.listPublicCharities({
          signal: controller.signal,
        });

        if (active && !controller.signal.aborted) {
          setCharities(response.charities);
        }
      } catch (requestError) {
        if (active && requestError?.code !== "REQUEST_ABORTED") {
          setError(toUserMessage(requestError));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadCharities();

    return () => {
      active = false;
      controller.abort();
    };
  }, [reloadVersion]);

  return (
    <section className="page-section">
      <p className="section-kicker">Pool solidária</p>
      <h1>Associações apoiadas</h1>
      <div className="button-row">
        <Link className="button-link" to="/associacoes/candidatura">
          Candidatar associação
        </Link>
      </div>

      {loading ? <p role="status">A carregar associações...</p> : null}
      {error ? (
        <EmptyState title="Não foi possível carregar associações" description={error} tone="error">
          <button type="button" onClick={() => setReloadVersion((value) => value + 1)}>
            Tentar novamente
          </button>
        </EmptyState>
      ) : null}
      {!loading && !error && charities.length === 0 ? (
        <EmptyState
          title="Ainda não existem associações públicas"
          description="Quando existirem associações aprovadas e públicas, aparecem nesta lista."
        />
      ) : null}

      <section className="content-grid" aria-label="Associações públicas">
        {charities.map((charity) => (
          <ContentCard
            key={charity.id}
            eyebrow="Associação"
            title={charity.name}
            description={charity.mission}
            meta={charity.websiteUrl}
            to={`/associacoes/${encodeURIComponent(charity.id)}/historico`}
            actionLabel="Ver histórico"
          />
        ))}
      </section>
    </section>
  );
}
```

5. Explicação do código.

`SubscriptionPage` preserva a implementação autoritativa de `BK-MF4-02`: cada
intenção de checkout/trial recebe uma `crypto.randomUUID()` guardada em `ref` e
reutilizada num retry da mesma intenção. A chave só é removida depois de sucesso;
nunca é `undefined` nem constante. As APIs canónicas recebem a chave e o
`AbortSignal`, sem recolher cartões ou prometer gateway real.

`PublicCharitiesPage` mostra apenas associações públicas devolvidas pela API,
cancela a leitura no unmount, permite retry e codifica o ID no link. A
candidatura continua no fluxo já criado e a página não assume acesso
administrativo; o backend continua a proteger o histórico privado.

6. Validação do passo.

Valida planos com lista, sem planos e erro. Valida trial com sucesso e erro. Valida associações com lista, lista vazia e erro. Resultado esperado: valores monetários aparecem em formato europeu e o pagamento é sempre descrito como simulado.

7. Cenário negativo/erro esperado.

Força uma falha de pagamento simulado. Resultado esperado: a página mostra `Não foi possível atualizar a subscrição` com mensagem segura e não apresenta gateways, cartões reais ou promessas externas.

### Passo 5 - Aplicar o padrão à conta e privacidade

1. Objetivo funcional do passo no contexto da app.

Uniformizar a página de conta sem alterar regras de perfil, controlo parental, exportação, consentimentos ou eliminação de conta.

2. Ficheiros envolvidos:
    - EDITAR: `frontend/src/pages/AccountPage.jsx`
    - REVER: `frontend/src/components/privacy/PrivacyExportPanel.jsx`
    - REVER: `frontend/src/components/privacy/PrivacyConsentsPanel.jsx`
    - REVER: `frontend/src/components/privacy/PrivacyDangerZone.jsx`
    - LOCALIZAÇÃO: `AccountPage.jsx` completo e mensagens visíveis nos painéis de privacidade.

3. Instruções do que fazer.

Substitui `AccountPage.jsx` pela versão completa abaixo. Revê os três painéis de privacidade e corrige mensagens sem acentos se existirem na tua versão local, mantendo as chamadas API já criadas em MF5.

4. Código completo, correto e integrado com a app final.

```jsx
// frontend/src/pages/AccountPage.jsx
/**
 * @file Página de conta autenticada com perfil, controlo parental e privacidade.
 */

import { useEffect, useRef, useState } from "react";
import { PrivacyConsentsPanel } from "../components/privacy/PrivacyConsentsPanel.jsx";
import { PrivacyDangerZone } from "../components/privacy/PrivacyDangerZone.jsx";
import { PrivacyExportPanel } from "../components/privacy/PrivacyExportPanel.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { userApi } from "../services/api/userApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

const ROLE_LABELS = {
  user: "Utilizador",
  moderator: "Moderador",
  admin: "Administrador",
};

function parseParentalInput(value) {
  if (typeof value !== "string" || !/^(?:[0-9]|1[0-8])$/.test(value)) {
    return null;
  }
  return Number(value);
}

/**
 * Mostra e atualiza dados da conta autenticada.
 *
 * @returns {JSX.Element} Página de conta.
 */
export function AccountPage() {
  const [name, setName] = useState("");
  const [parentalInput, setParentalInput] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [reloadVersion, setReloadVersion] = useState(0);
  const mutationRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setError("");

    userApi.getMe({ signal: controller.signal }).then((response) => {
      if (!active || controller.signal.aborted) return;
      setUser(response.user);
      setName(response.user.name);
      setParentalInput(`${response.user.parentalMaxAgeRating}`);
    }).catch((requestError) => {
      if (active && requestError?.code !== "REQUEST_ABORTED") {
        setError(toUserMessage(requestError));
      }
    }).finally(() => {
      if (active) setLoading(false);
    });

    return () => {
      active = false;
      controller.abort();
    };
  }, [reloadVersion]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      mutationRef.current?.abort();
      mutationRef.current = null;
    };
  }, []);

  function applyConfirmedUser(confirmedUser) {
    setUser(confirmedUser);
    setName(confirmedUser.name);
    setParentalInput(`${confirmedUser.parentalMaxAgeRating}`);
  }

  async function runMutation(request, successMessage) {
    if (mutationRef.current) return;
    const controller = new AbortController();
    mutationRef.current = controller;
    setMutating(true);
    setStatus("");
    setError("");

    try {
      const response = await request(controller.signal);
      if (controller.signal.aborted || !mountedRef.current) return;
      applyConfirmedUser(response.user);
      setStatus(successMessage);
    } catch (requestError) {
      if (controller.signal.aborted || requestError?.code === "REQUEST_ABORTED") return;
      if (mountedRef.current) setError(toUserMessage(requestError));
    } finally {
      if (mutationRef.current === controller) mutationRef.current = null;
      if (mountedRef.current) setMutating(false);
    }
  }

  /**
   * Guarda nome público do utilizador autenticado.
   *
   * @param {React.FormEvent<HTMLFormElement>} event Evento do formulário.
   * @returns {void} Agenda a mutation protegida.
   */
  function handleProfileSubmit(event) {
    event.preventDefault();
    void runMutation(
      (signal) => userApi.updateMe({ name }, { signal }),
      "Perfil atualizado.",
    );
  }

  /**
   * Guarda limite parental da conta autenticada.
   *
   * @param {React.FormEvent<HTMLFormElement>} event Evento do formulário.
   * @returns {void} Valida e agenda a mutation protegida.
   */
  function handleParentalSubmit(event) {
    event.preventDefault();
    const parentalMaxAgeRating = parseParentalInput(parentalInput);
    if (parentalMaxAgeRating === null) {
      setError("Escolhe um limite parental inteiro entre 0 e 18.");
      return;
    }
    void runMutation(
      (signal) => userApi.updateParental(parentalMaxAgeRating, { signal }),
      "Controlo parental atualizado.",
    );
  }

  if (loading) {
    return (
      <section className="page-section narrow-section">
        <p role="status">A carregar conta...</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="page-section narrow-section">
        <p className="section-kicker">Conta</p>
        <h1>A minha conta</h1>
        {error ? (
          <EmptyState title="Conta indisponível" description={error} tone="error">
            <button type="button" onClick={() => setReloadVersion((value) => value + 1)}>
              Tentar novamente
            </button>
          </EmptyState>
        ) : null}
      </section>
    );
  }

  return (
    <section className="page-section narrow-section">
      <p className="section-kicker">Conta</p>
      <h1>A minha conta</h1>
      {error ? <EmptyState title="Não foi possível atualizar a conta" description={error} tone="error" /> : null}
      {status ? <EmptyState title="Alteração guardada" description={status} tone="success" /> : null}

      <form className="form-panel" onSubmit={handleProfileSubmit} aria-busy={mutating}>
        <h2>Perfil</h2>
        <label>
          Nome
          <input value={name} disabled={mutating} onChange={(event) => setName(event.target.value)} />
        </label>
        <button type="submit" disabled={mutating}>Guardar perfil</button>
      </form>

      <form className="form-panel" onSubmit={handleParentalSubmit} aria-busy={mutating}>
        <h2>Controlo parental</h2>
        <label>
          Limite parental
          <input
            inputMode="numeric"
            value={parentalInput}
            disabled={mutating}
            onChange={(event) => setParentalInput(event.target.value)}
          />
        </label>
        <button type="submit" disabled={mutating}>Guardar limite</button>
      </form>

      <dl className="meta-list">
        <dt>Email</dt>
        <dd>{user.email}</dd>
        <dt>Papel</dt>
        <dd>{ROLE_LABELS[user.role] ?? "Utilizador"}</dd>
      </dl>

      <PrivacyExportPanel />
      <PrivacyConsentsPanel />
      <PrivacyDangerZone />
    </section>
  );
}
```

5. Explicação do código.

`AccountPage` mantém a conta ligada à sessão autenticada. Leitura e mutations
propagam `AbortSignal`; `mutationRef` bloqueia submissões sobrepostas antes do
render e a resposta do backend repõe o formulário canónico. O limite parental
permanece string até `parseParentalInput` aceitar um inteiro `0..18`, por isso o
input vazio nunca vira `0`. A página não envia `userId` e traduz o papel para
PT-PT.

Os painéis `PrivacyExportPanel`, `PrivacyConsentsPanel` e `PrivacyDangerZone` continuam a existir porque foram criados na MF5. Este BK apenas garante que a página os integra numa UI coerente. O aluno pode ajustar textos visíveis para português de Portugal, mas não deve alterar a lógica de exportação, consentimentos ou eliminação sem voltar aos BKs de privacidade.

6. Validação do passo.

Valida conta autenticada, erro de sessão e atualização de nome. Resultado esperado: sucesso aparece com tom `success`, erro aparece com tom `error`, e a página não mostra identificadores técnicos nem dados de outros utilizadores.

7. Cenário negativo/erro esperado.

Abre `/conta` sem sessão válida. Resultado esperado: a página mostra `Conta
indisponível` ou mensagem de sessão segura, sem crash e sem expor dados pessoais.
Apaga o limite parental e submete: a UI deve recusar o valor vazio, nunca enviá-lo
como zero.

### Passo 6 - Criar evidence de usabilidade responsiva

1. Objetivo funcional do passo no contexto da app.

Guardar a prova de que as páginas principais têm estados consistentes, responsivos e em português de Portugal.

2. Ficheiros envolvidos:
    - CRIAR/EDITAR: `docs/evidence/MF7/USABILIDADE-UX.md`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria a evidence abaixo e preenche resultados observados depois de executar a build e rever as páginas.

4. Código completo, correto e integrado com a app final.

```md
# Validação de usabilidade responsiva - MF7

- `document_status`: `CURRENT`
- `snapshot_date`: `-`
- `implementation_lane`: `STUDENT`
- `current_authority`: `docs/planificacao/guias-bk/MF7/BK-MF7-04-refinamento-paginas-principais-estados-ux.md`
- `proof_scope`: estados e viewports observados pelos alunos; não prova compatibilidade integral em browsers/dispositivos reais

## Metadados

- BK: BK-MF7-04
- Owner: Davi
- Fonte: RNF01, RNF02, RNF03, RNF05, RNF38, RNF40
- Decisão: EM_REVISAO

## Matriz por página

| Página | Loading | Erro | Vazio | Lista/sucesso | Mobile 390px | Tablet 768px | Desktop | Estado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Catálogo | A preencher | A preencher | A preencher | A preencher | A preencher | A preencher | A preencher | A preencher |
| Pesquisa | A preencher | A preencher | A preencher | A preencher | A preencher | A preencher | A preencher | A preencher |
| Para si | A preencher | A preencher | A preencher | A preencher | A preencher | A preencher | A preencher | A preencher |
| Biblioteca | A preencher | A preencher | A preencher | A preencher | A preencher | A preencher | A preencher | A preencher |
| Planos | A preencher | A preencher | A preencher | A preencher | A preencher | A preencher | A preencher | A preencher |
| Associações | A preencher | A preencher | A preencher | A preencher | A preencher | A preencher | A preencher | A preencher |
| Conta | A preencher | A preencher | A preencher | A preencher | A preencher | A preencher | A preencher | A preencher |

## Negativos

- Erro da API não expõe detalhe técnico sensível:
- Lista vazia não aparece sem explicação:
- Mobile não cria scroll horizontal:
- Mensagens estão em português de Portugal:
- Datas e valores usam formato europeu:
- Pagamento continua identificado como simulado:

## Handoff para BK-MF7-05

- Páginas prontas para gate:
- Páginas com ressalvas:
- Riscos bloqueantes:
- Evidência reutilizável no gate:
```

5. Explicação do código.

Este ficheiro transforma UI em prova objetiva. A matriz obriga a validar sete páginas, quatro estados e três larguras. Os negativos fecham os riscos principais do BK: erro inseguro, lista vazia sem orientação, mobile com scroll horizontal, texto sem acentuação, formato não europeu e pagamento apresentado como real.

6. Validação do passo.

Confirma que cada página tem pelo menos uma prova em mobile, tablet e desktop. Resultado esperado: nenhuma linha fica sem estado e todas as ressalvas entram no handoff para `BK-MF7-05`.

7. Cenário negativo/erro esperado.

Se uma página só for validada no desktop, a MF7 não deve seguir para gate limpo. Regista a ressalva para `BK-MF7-05`.

#### Critérios de aceite

- `ContentCard` e `EmptyState` existem, têm JSDoc e comentários didáticos.
- `global.css` contém estilos para imagem do card, metadados, tons de empty state e mensagem de estado.
- Catálogo usa componentes comuns e estados claros.
- Pesquisa mostra resultados, ausência de resultados e erro com mensagens em português de Portugal.
- Recomendações mantêm cold start honesto e explicabilidade baseline; grupos
  sem `items` ou com array vazio não renderizam heading, explicação ou carousel.
- Biblioteca mostra favoritos, watchlist e histórico sem aceitar `userId` do frontend.
- Planos mostram valores em formato europeu e pagamento sempre como simulado.
- A lista pública de planos carrega independentemente da sessão. `getMine` só é
  chamado em `authenticated`; `anonymous` continua a ver planos e
  `unavailable` mantém retry sem ser convertido em logout.
- Associações públicas usam card comum sem alterar regras da pool solidária.
- Conta preserva perfil, controlo parental e painéis de privacidade.
- Conta cancela/serializa mutações e rejeita limite parental vazio sem o transformar em zero.
- Catálogo, pesquisa, detalhe e passagens têm cancelamento, anti-stale, retry e segmentos internos codificados.
- Sessão indisponível não é apresentada como logout nem como convite para login.
- Evidence tem validação por página, estado e viewport.

#### Validação final

- Executar `npm --prefix frontend run build`.
- Executar `bash scripts/validate-planificacao.sh`.
- Executar `git diff --check`.
- Confirmar `docs/evidence/MF7/USABILIDADE-UX.md`.
- Pesquisar termos internos, storage de sessão, casts inseguros e claims indevidos nos BKs MF7.
- Testar grupo de recomendações vazio: o respetivo heading não existe no DOM.
- Testar planos anónimos com `getMine` a devolver `401`: `listPlans` continua
  visível e a leitura privada nem chega a ser chamada.

#### Evidence para PR/defesa

- `pr`: referência da entrega deste BK.
- `proof`: `docs/evidence/MF7/USABILIDADE-UX.md`.
- `neg`: erro de API, lista vazia, mobile estreito, texto sem acentuação, formato europeu e pagamento simulado.
- `fonte`: `RNF01`, `RNF02`, `RNF03`, `RNF05`, `RNF38`, `RNF40`.

#### Handoff

- `BK-MF7-05` recebe páginas principais com estados validados.
- `BK-MF7-05` deve bloquear gate se existir link indevido, erro sem mensagem segura, mobile com sobreposição ou evidence incompleta.
- Se alguma página ficar com ressalva visual, o gate deve decidir `GO_COM_RESSALVAS` ou `NO_GO`.

##### Critérios complementares de responsividade e estados robustos

Este contrato complementa a matriz pedagógica sem promover o BK dos alunos:

- Testar cada página nos viewports `390x844`, `768x900`, `1280x720` e
  `1440x900`, sempre sem overflow horizontal da página.
- Validar reflow equivalente a zoom de `200%` com viewport `720x450`, mantendo
  título, navegação e ação principal alcançáveis.
- Uniformizar `loading`, `error`, `empty` e `retry`; erros devem ser seguros e
  as ações em curso devem expor busy state sem permitir duplo submit.
- Catálogo, pesquisa, detalhe, passagens e conta devem abortar leituras no
  unmount/mudança de contexto e ignorar respostas antigas; cada falha
  recuperável tem retry que preserva o filtro ou conteúdo atual.
- Segmentos construídos com IDs/slugs vindos da API usam
  `encodeURIComponent`; uma `/`, espaço ou `?` nunca cria outra rota.
- `sessionStatus="unavailable"` é um estado operacional próprio: bloqueia CTAs
  privados, permite voltar a confirmar a sessão e nunca mostra login como se
  tivesse ocorrido logout.
- Perfil e controlo parental partilham busy state e não são enviados em
  paralelo. O valor parental vazio é inválido antes de qualquer conversão para
  número; a resposta da API volta a ser a fonte autoritativa do formulário.
- Imagens abaixo da dobra devem usar lazy loading, mantendo dimensões ou
  contentor estável para evitar saltos de layout.
- Conteúdo publicado com media pendente continua visível, mas o CTA de
  reprodução fica desativado e explica “Vídeo ainda não disponível”.
- A prova deve registar rota, viewport, perfil, estado observado e negativo;
  uma captura isolada sem estes campos não fecha o critério.

#### Changelog

- `2026-07-10`: reutilizado `ContentCarousel` de `BK-MF3-04`; removido o import
  do componente inexistente e integrado o bloco complementar no contrato
  tutorial.
- `2026-06-22`: guia criado/reestruturado na reorganização documental MF7/MF8.
- `2026-06-23`: guia atualizado com componentes reutilizáveis, página exemplo, matriz de páginas e evidence responsiva.
- `2026-06-23`: guia corrigido com código completo para as páginas principais, CSS dos estados, comentários didáticos e validação de usabilidade.
- `2026-07-10`: matriz responsiva fechada em quatro viewports, reflow a 200%,
  estados com retry, lazy images e media pendente documentados.
- `2026-07-10`: adendo F5 sincroniza cancelamento/anti-stale, retry, encoding de rotas, sessão indisponível e conta sem coerção de vazio.
