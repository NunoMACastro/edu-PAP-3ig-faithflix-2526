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
- `last_updated`: `2026-06-23`

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

import { useEffect, useState } from "react";
import { ContinueWatchingStrip } from "../components/playback/ContinueWatchingStrip.jsx";
import { ContentCard } from "../components/ui/ContentCard.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { catalogApi } from "../services/api/catalogApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

/**
 * Mostra conteúdos publicados e o bloco "continuar a ver".
 *
 * @returns {JSX.Element} Página de catálogo.
 */
export function CatalogPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    /**
     * Carrega o catálogo público sem alterar a regra backend de publicação.
     *
     * @returns {Promise<void>} Termina depois de atualizar o estado visual.
     */
    async function loadCatalog() {
      try {
        const response = await catalogApi.listPublished();

        if (active) {
          setItems(response.items);
        }
      } catch (requestError) {
        if (active) {
          setError(toUserMessage(requestError));
        }
      } finally {
        // A flag evita atualizar estado se o utilizador sair da página durante o pedido.
        if (active) {
          setLoading(false);
        }
      }
    }

    loadCatalog();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="page-section">
      <p className="section-kicker">Catálogo</p>
      <h1>Catálogo FaithFlix</h1>
      <ContinueWatchingStrip />

      {loading ? <p role="status">A carregar catálogo...</p> : null}
      {error ? (
        <EmptyState title="Não foi possível carregar o catálogo" description={error} tone="error" />
      ) : null}
      {!loading && !error && items.length === 0 ? (
        <EmptyState
          title="Ainda não existem conteúdos publicados"
          description="Volta a esta página depois de o catálogo público ser atualizado."
        />
      ) : null}

      <section className="content-grid" aria-label="Conteúdos publicados">
        {items.map((content) => (
          <ContentCard
            key={content.id}
            eyebrow={content.type}
            title={content.title}
            description={content.synopsis}
            imageUrl={content.assets?.posterUrl}
            imageAlt={`Cartaz de ${content.title}`}
            to={`/catalogo/${content.slug}`}
          />
        ))}
      </section>
    </section>
  );
}
```

```jsx
// frontend/src/pages/SearchPage.jsx
/**
 * @file Página de pesquisa unificada do FaithFlix.
 */

import { useState } from "react";
import { SearchFilters } from "../components/search/SearchFilters.jsx";
import { ContentCard } from "../components/ui/ContentCard.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { searchApi } from "../services/api/searchApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

const INITIAL_FILTERS = {
  query: "",
  type: "",
  taxonomyId: "",
  sort: "title",
};

/**
 * Permite pesquisar conteúdos publicados por texto, tipo e taxonomia.
 *
 * @returns {JSX.Element} Página de pesquisa.
 */
export function SearchPage() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /**
   * Executa a pesquisa com os filtros atuais.
   *
   * @param {React.FormEvent<HTMLFormElement>} event Evento do formulário.
   * @returns {Promise<void>} Termina quando a API responde ou falha.
   */
  async function submitSearch(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      // A API de pesquisa continua a aplicar publicação e filtros; a UI só apresenta o resultado.
      const response = await searchApi.search({
        ...filters,
        page: 1,
        limit: 12,
      });
      setResult(response);
    } catch (requestError) {
      setResult(null);
      setError(toUserMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  const items = result?.items ?? [];

  return (
    <section className="page-section">
      <p className="section-kicker">Descoberta</p>
      <h1>Pesquisa</h1>
      <SearchFilters filters={filters} onChange={setFilters} onSubmit={submitSearch} />

      {loading ? <p role="status">A pesquisar...</p> : null}
      {error ? <EmptyState title="Não foi possível pesquisar" description={error} tone="error" /> : null}
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
            to={`/catalogo/${content.slug}`}
          />
        ))}
      </section>
    </section>
  );
}
```

5. Explicação do código.

`CatalogPage` preserva o contrato de `BK-MF2-03`: o backend decide que conteúdos estão publicados e o frontend mostra apenas o que `catalogApi.listPublished()` devolve. O loading usa `role="status"`, o erro usa `EmptyState` com tom de erro e a lista usa `ContentCard`. O dado de entrada é a resposta da API; o dado de saída é a grelha visível com imagem, tipo, título, descrição e ação. A flag `active` evita atualização de estado depois de sair da página, um erro comum em páginas React com pedidos assíncronos.

`SearchPage` preserva o contrato de `BK-MF3-03`: o formulário continua em `SearchFilters` e a pesquisa continua em `searchApi.search()`. A UI não inventa motor de pesquisa nem expõe detalhe técnico do erro. O aluno pode alterar textos de orientação, mas não deve remover o envio dos filtros nem o limite de resultados sem atualizar a evidência.

6. Validação do passo.

Executa `npm --prefix frontend run build`. Depois valida três situações: catálogo com itens, catálogo vazio e erro simulado; pesquisa com resultados, pesquisa sem resultados e erro simulado. Resultado esperado: todas as mensagens aparecem em português de Portugal.

7. Cenário negativo/erro esperado.

Simula uma falha de API. Resultado esperado: a página mostra `Não foi possível carregar o catálogo` ou `Não foi possível pesquisar`, sem stack trace nem detalhe técnico sensível.

### Passo 3 - Aplicar o padrão a recomendações e biblioteca

1. Objetivo funcional do passo no contexto da app.

Uniformizar a página "Para si" e a biblioteca pessoal sem alterar recomendação baseline, favoritos, watchlist ou histórico.

2. Ficheiros envolvidos:
    - EDITAR: `frontend/src/pages/ForYouPage.jsx`
    - EDITAR: `frontend/src/pages/MyLibraryPage.jsx`
    - LOCALIZAÇÃO: ficheiros completos.

3. Instruções do que fazer.

Substitui os ficheiros pelas versões completas abaixo. Mantém `recommendationsApi.mine()`, `libraryApi.listFavorites()`, `libraryApi.listWatchlist()` e `libraryApi.listHistory()`.

4. Código completo, correto e integrado com a app final.

```jsx
// frontend/src/pages/ForYouPage.jsx
/**
 * @file Página de recomendações pessoais baseline.
 */

import { useEffect, useState } from "react";
import { DiscoveryCarousel } from "../components/discovery/DiscoveryCarousel.jsx";
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

  useEffect(() => {
    let active = true;

    /**
     * Carrega recomendações mantendo a explicabilidade definida em MF3.
     *
     * @returns {Promise<void>} Termina depois de atualizar a página.
     */
    async function loadRecommendations() {
      try {
        const response = await recommendationsApi.mine();

        if (active) {
          setRecommendations(response);
        }
      } catch (requestError) {
        if (active) {
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
    };
  }, []);

  const groups = recommendations?.groups ?? [];

  return (
    <section className="page-section">
      <p className="section-kicker">Recomendação baseline</p>
      <h1>Para si</h1>

      {loading ? <p role="status">A preparar recomendações...</p> : null}
      {error ? <EmptyState title="Não foi possível carregar recomendações" description={error} tone="error" /> : null}
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
          <DiscoveryCarousel title={group.title} items={group.items} />
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

/**
 * Mostra uma lista de conteúdos da biblioteca pessoal.
 *
 * @param {{ title: string, items: Array<{ id: string, title: string, slug: string, posterUrl?: string }> }} props Propriedades da lista.
 * @returns {JSX.Element} Secção de biblioteca.
 */
function LibrarySection({ title, items }) {
  return (
    <section>
      <h2>{title}</h2>
      {items.length === 0 ? (
        <EmptyState
          title={`${title} sem conteúdos`}
          description="Usa o catálogo para adicionar conteúdos a esta secção."
        />
      ) : (
        // Cada item vem das rotas autenticadas da biblioteca; a UI não aceita userId vindo do browser.
        <div className="content-grid">
          {items.map((item) => (
            <ContentCard
              key={`${title}-${item.id}`}
              title={item.title}
              imageUrl={item.posterUrl}
              imageAlt={`Cartaz de ${item.title}`}
              to={`/catalogo/${item.slug}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/**
 * Mostra favoritos, watchlist e histórico do utilizador autenticado.
 *
 * @returns {JSX.Element} Página da minha biblioteca.
 */
export function MyLibraryPage() {
  const [favorites, setFavorites] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    /**
     * Carrega as três listas autenticadas da biblioteca pessoal.
     *
     * @returns {Promise<void>} Termina quando todos os pedidos terminarem.
     */
    async function loadLibrary() {
      try {
        const [favoriteResponse, watchlistResponse, historyResponse] = await Promise.all([
          libraryApi.listFavorites(),
          libraryApi.listWatchlist(),
          libraryApi.listHistory(),
        ]);

        if (active) {
          setFavorites(favoriteResponse.items);
          setWatchlist(watchlistResponse.items);
          setHistory(historyResponse.items);
        }
      } catch (requestError) {
        if (active) {
          setError(toUserMessage(requestError));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadLibrary();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="page-section" data-testid="my-library">
      <p className="section-kicker">Biblioteca</p>
      <h1>Biblioteca</h1>

      {loading ? <p role="status">A carregar biblioteca...</p> : null}
      {error ? <EmptyState title="Não foi possível carregar a biblioteca" description={error} tone="error" /> : null}

      {!loading && !error ? (
        <>
          <LibrarySection title="Favoritos" items={favorites} />
          <LibrarySection title="Watchlist" items={watchlist} />
          <LibrarySection title="Histórico" items={history} />
        </>
      ) : null}
    </section>
  );
}
```

5. Explicação do código.

`ForYouPage` mantém a recomendação baseline criada na MF3. O texto de cold start é honesto: não promete modelo avançado nem personalização opaca. Os dados entram por `recommendationsApi.mine()` e saem como grupos com explicação e carrossel. A regra de segurança continua no backend e na sessão; a página apenas mostra a resposta.

`MyLibraryPage` usa `Promise.all` para carregar favoritos, watchlist e histórico em paralelo. Estes endpoints pertencem ao utilizador autenticado e não recebem `userId` no frontend. `LibrarySection` evita repetir marcação e deixa vazios claros em cada lista. O aluno pode adaptar títulos e descrições, mas não deve transformar estas listas em dados públicos.

6. Validação do passo.

Valida recomendações com grupos, recomendações vazias e erro. Valida biblioteca com listas preenchidas, listas vazias e erro de sessão. Resultado esperado: vazio e erro são visualmente diferentes e todas as mensagens têm acentuação correta.

7. Cenário negativo/erro esperado.

Entra sem sessão e abre a biblioteca. Resultado esperado: a API devolve erro autenticado e a página mostra uma mensagem segura, sem tentar consultar dados de outro utilizador.

### Passo 4 - Aplicar o padrão a planos e associações

1. Objetivo funcional do passo no contexto da app.

Uniformizar subscrição, trial, pagamento simulado e associações públicas sem criar gateway real nem novas regras da pool solidária.

2. Ficheiros envolvidos:
    - EDITAR: `frontend/src/pages/SubscriptionPage.jsx`
    - EDITAR: `frontend/src/pages/PublicCharitiesPage.jsx`
    - LOCALIZAÇÃO: ficheiros completos.

3. Instruções do que fazer.

Substitui as páginas pelas versões completas abaixo. Mantém `paymentsApi`, `subscriptionsApi` e `charitiesApi` como clientes existentes.

4. Código completo, correto e integrado com a app final.

```jsx
// frontend/src/pages/SubscriptionPage.jsx
/**
 * @file Página de subscrição, trial e pagamento simulado.
 */

import { useEffect, useState } from "react";
import { EmptyState } from "../components/ui/EmptyState.jsx";
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
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  /**
   * Carrega planos públicos e subscrição autenticada.
   *
   * @returns {Promise<void>} Termina depois de atualizar a página.
   */
  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [plansResponse, subscriptionResponse] = await Promise.all([
        subscriptionsApi.listPlans(),
        subscriptionsApi.getMine(),
      ]);
      setPlans(plansResponse.plans);
      setSubscription(subscriptionResponse.subscription);
    } catch (apiError) {
      setError(toUserMessage(apiError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  /**
   * Executa checkout aprovado com método de teste documentado.
   *
   * @param {string} planCode Código do plano escolhido.
   * @returns {Promise<void>} Termina quando o checkout simulado responder.
   */
  async function handleSimulatedCheckout(planCode) {
    setStatus("");
    setError("");
    setSubmitting(true);

    try {
      // O pagamento é simulado; não recolhe cartão nem chama gateway externo.
      const response = await paymentsApi.simulatedCheckout({
        planCode,
        paymentMethod: "card_test",
        simulateOutcome: "approved",
      });
      setSubscription(response.subscription);
      setStatus("Pagamento simulado aprovado.");
    } catch (apiError) {
      setError(toUserMessage(apiError));
    } finally {
      setSubmitting(false);
    }
  }

  /**
   * Inicia trial gratuito.
   *
   * @returns {Promise<void>} Termina quando o backend confirmar o trial.
   */
  async function handleStartTrial() {
    setStatus("");
    setError("");
    setSubmitting(true);

    try {
      const response = await paymentsApi.startTrial();
      setSubscription(response.subscription);
      setStatus(`Trial ativo até ${formatDate(response.trial.endsAt)}.`);
    } catch (apiError) {
      setError(toUserMessage(apiError));
    } finally {
      setSubmitting(false);
    }
  }

  /**
   * Cancela apenas a renovação futura da subscrição.
   *
   * @returns {Promise<void>} Termina quando a subscrição for atualizada.
   */
  async function handleCancelRenewal() {
    setStatus("");
    setError("");
    setSubmitting(true);

    try {
      const response = await subscriptionsApi.cancelRenewal();
      setSubscription(response.subscription);
      setStatus("Renovação cancelada no fim do ciclo atual.");
    } catch (apiError) {
      setError(toUserMessage(apiError));
    } finally {
      setSubmitting(false);
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
      {status ? <EmptyState title="Operação concluída" description={status} tone="success" /> : null}

      <section>
        <h2>Estado atual</h2>
        <p>{subscription?.status === "none" ? "Sem subscrição ativa." : subscription?.status}</p>
        {subscription?.currentPeriodEnd ? <p>Fim do ciclo: {formatDate(subscription.currentPeriodEnd)}</p> : null}
        {subscription?.hasPremiumAccess && !subscription.cancelAtPeriodEnd ? (
          <button type="button" disabled={submitting} onClick={handleCancelRenewal}>
            Cancelar renovação
          </button>
        ) : null}
      </section>

      <section>
        <h2>Trial</h2>
        <p>Experimenta o FaithFlix durante 14 dias sem dados de cartão.</p>
        <button type="button" disabled={submitting} onClick={handleStartTrial}>
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
              <button type="button" disabled={submitting} onClick={() => handleSimulatedCheckout(plan.code)}>
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

  useEffect(() => {
    let active = true;

    /**
     * Carrega apenas associações públicas elegíveis.
     *
     * @returns {Promise<void>} Termina depois de atualizar a lista.
     */
    async function loadCharities() {
      try {
        const response = await charitiesApi.listPublicCharities();

        if (active) {
          setCharities(response.charities);
        }
      } catch (requestError) {
        if (active) {
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
    };
  }, []);

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
      {error ? <EmptyState title="Não foi possível carregar associações" description={error} tone="error" /> : null}
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
            to={`/associacoes/${charity.id}/historico`}
            actionLabel="Ver histórico"
          />
        ))}
      </section>
    </section>
  );
}
```

5. Explicação do código.

`SubscriptionPage` preserva a simulação criada em MF4: usa `paymentsApi.simulatedCheckout()` e `paymentsApi.startTrial()`, mas não recolhe cartões nem promete gateways reais. `Intl.NumberFormat("pt-PT")` e `toLocaleDateString("pt-PT")` fecham `RNF40`. Os dados entram por planos e subscrição autenticada; saem como estado atual, trial, planos e mensagens de sucesso ou erro.

`PublicCharitiesPage` mostra apenas associações públicas devolvidas pela API. A candidatura continua no fluxo já criado e a página não assume acesso administrativo. O link de histórico depende da rota e das permissões definidas em BKs anteriores; o backend continua a proteger dados privados de cada associação.

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

import { useEffect, useState } from "react";
import { PrivacyConsentsPanel } from "../components/privacy/PrivacyConsentsPanel.jsx";
import { PrivacyDangerZone } from "../components/privacy/PrivacyDangerZone.jsx";
import { PrivacyExportPanel } from "../components/privacy/PrivacyExportPanel.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { userApi } from "../services/api/userApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

/**
 * Mostra e atualiza dados da conta autenticada.
 *
 * @returns {JSX.Element} Página de conta.
 */
export function AccountPage() {
  const [name, setName] = useState("");
  const [parentalMaxAgeRating, setParentalMaxAgeRating] = useState(18);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    /**
     * Carrega a conta do utilizador autenticado.
     *
     * @returns {Promise<void>} Termina depois de preencher formulário e resumo.
     */
    async function loadAccount() {
      try {
        const response = await userApi.getMe();

        if (active) {
          setUser(response.user);
          setName(response.user.name);
          setParentalMaxAgeRating(response.user.parentalMaxAgeRating);
        }
      } catch (requestError) {
        if (active) {
          setError(toUserMessage(requestError));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadAccount();

    return () => {
      active = false;
    };
  }, []);

  /**
   * Guarda nome público do utilizador autenticado.
   *
   * @param {React.FormEvent<HTMLFormElement>} event Evento do formulário.
   * @returns {Promise<void>} Termina quando a API responde.
   */
  async function handleProfileSubmit(event) {
    event.preventDefault();
    setStatus("");
    setError("");

    try {
      // A rota usa a sessão atual; a UI não envia userId nem tenta alterar outra conta.
      const response = await userApi.updateMe({ name });
      setUser(response.user);
      setStatus("Perfil atualizado.");
    } catch (requestError) {
      setError(toUserMessage(requestError));
    }
  }

  /**
   * Guarda limite parental da conta autenticada.
   *
   * @param {React.FormEvent<HTMLFormElement>} event Evento do formulário.
   * @returns {Promise<void>} Termina quando a API responde.
   */
  async function handleParentalSubmit(event) {
    event.preventDefault();
    setStatus("");
    setError("");

    try {
      const response = await userApi.updateParental(Number(parentalMaxAgeRating));
      setUser(response.user);
      setStatus("Controlo parental atualizado.");
    } catch (requestError) {
      setError(toUserMessage(requestError));
    }
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
        {error ? <EmptyState title="Conta indisponível" description={error} tone="error" /> : null}
      </section>
    );
  }

  return (
    <section className="page-section narrow-section">
      <p className="section-kicker">Conta</p>
      <h1>A minha conta</h1>
      {error ? <EmptyState title="Não foi possível atualizar a conta" description={error} tone="error" /> : null}
      {status ? <EmptyState title="Alteração guardada" description={status} tone="success" /> : null}

      <form className="form-panel" onSubmit={handleProfileSubmit}>
        <h2>Perfil</h2>
        <label>
          Nome
          <input value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <button type="submit">Guardar perfil</button>
      </form>

      <form className="form-panel" onSubmit={handleParentalSubmit}>
        <h2>Controlo parental</h2>
        <label>
          Limite parental
          <input
            min="0"
            max="18"
            type="number"
            value={parentalMaxAgeRating}
            onChange={(event) => setParentalMaxAgeRating(event.target.value)}
          />
        </label>
        <button type="submit">Guardar limite</button>
      </form>

      <dl className="meta-list">
        <dt>Email</dt>
        <dd>{user.email}</dd>
        <dt>Papel</dt>
        <dd>{user.role}</dd>
      </dl>

      <PrivacyExportPanel />
      <PrivacyConsentsPanel />
      <PrivacyDangerZone />
    </section>
  );
}
```

5. Explicação do código.

`AccountPage` mantém a conta ligada à sessão autenticada. A página nunca envia `userId`; chama `userApi.getMe()`, `userApi.updateMe()` e `userApi.updateParental()`, que pertencem ao próprio utilizador. Isto preserva ownership e evita acesso cruzado. `EmptyState` torna conta indisponível, erro e sucesso visualmente consistentes.

Os painéis `PrivacyExportPanel`, `PrivacyConsentsPanel` e `PrivacyDangerZone` continuam a existir porque foram criados na MF5. Este BK apenas garante que a página os integra numa UI coerente. O aluno pode ajustar textos visíveis para português de Portugal, mas não deve alterar a lógica de exportação, consentimentos ou eliminação sem voltar aos BKs de privacidade.

6. Validação do passo.

Valida conta autenticada, erro de sessão e atualização de nome. Resultado esperado: sucesso aparece com tom `success`, erro aparece com tom `error`, e a página não mostra identificadores técnicos nem dados de outros utilizadores.

7. Cenário negativo/erro esperado.

Abre `/conta` sem sessão válida. Resultado esperado: a página mostra `Conta indisponível` ou mensagem de sessão segura, sem crash e sem expor dados pessoais.

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
- Recomendações mantêm cold start honesto e explicabilidade baseline.
- Biblioteca mostra favoritos, watchlist e histórico sem aceitar `userId` do frontend.
- Planos mostram valores em formato europeu e pagamento sempre como simulado.
- Associações públicas usam card comum sem alterar regras da pool solidária.
- Conta preserva perfil, controlo parental e painéis de privacidade.
- Evidence tem validação por página, estado e viewport.

#### Validação final

- Executar `npm --prefix frontend run build`.
- Executar `bash scripts/validate-planificacao.sh`.
- Executar `git diff --check`.
- Confirmar `docs/evidence/MF7/USABILIDADE-UX.md`.
- Pesquisar termos internos, storage de sessão, casts inseguros e claims indevidos nos BKs MF7.

#### Evidence para PR/defesa

- `pr`: referência da entrega deste BK.
- `proof`: `docs/evidence/MF7/USABILIDADE-UX.md`.
- `neg`: erro de API, lista vazia, mobile estreito, texto sem acentuação, formato europeu e pagamento simulado.
- `fonte`: `RNF01`, `RNF02`, `RNF03`, `RNF05`, `RNF38`, `RNF40`.

#### Handoff

- `BK-MF7-05` recebe páginas principais com estados validados.
- `BK-MF7-05` deve bloquear gate se existir link indevido, erro sem mensagem segura, mobile com sobreposição ou evidence incompleta.
- Se alguma página ficar com ressalva visual, o gate deve decidir `GO_COM_RESSALVAS` ou `NO_GO`.

#### Changelog

- `2026-06-22`: guia criado/reestruturado na reorganização documental MF7/MF8.
- `2026-06-23`: guia atualizado com componentes reutilizáveis, página exemplo, matriz de páginas e evidence responsiva.
- `2026-06-23`: guia corrigido com código completo para as páginas principais, CSS dos estados, comentários didáticos e validação de usabilidade.
