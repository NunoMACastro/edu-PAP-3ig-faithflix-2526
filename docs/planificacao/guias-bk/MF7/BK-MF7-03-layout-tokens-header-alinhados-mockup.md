# BK-MF7-03 - Layout, tokens e header alinhados ao mockup

## Header

- `doc_id`: `GUIA-BK-MF7-03`
- `bk_id`: `BK-MF7-03`
- `macro`: `MF7`
- `owner`: `Mateus`
- `apoio`: `Kaue`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF7-02`
- `rf_rnf`: `RNF01, RNF02, RNF03, RNF04, RNF28, RNF38`
- `fase_documental`: `Fase 3`
- `sprint`: `S11`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF7-04`
- `guia_path`: `docs/planificacao/guias-bk/MF7/BK-MF7-03-layout-tokens-header-alinhados-mockup.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais alinhar tokens CSS, header, layout base, hero e estados de interação com a identidade visual do mockup FaithFlix.

O resultado observável é `docs/evidence/MF7/REFINAMENTO-VISUAL-MOCKUP.md`, com provas de que header, hero, foco, hover, mobile e desktop ficaram coerentes e continuam compatíveis com a navegação segura criada em `BK-MF7-02`.

#### Importância

`RNF01`, `RNF02`, `RNF03` e `RNF04` exigem uma interface clara, responsiva e acessível. `RNF28` exige componentes reutilizáveis. `RNF38` exige português de Portugal por defeito.

Este BK não muda regras de negócio. Ele torna a interface mais defensável, consistente e preparada para os refinamentos de páginas em `BK-MF7-04`.

#### Scope-in

- Atualizar tokens CSS de cor, raio, sombra, espaçamento e largura.
- Refinar header público e autenticado sem reabrir regras de permissão.
- Melhorar hero da página inicial.
- Garantir foco por teclado, hover, active e disabled visíveis.
- Registar evidence visual por viewport.

#### Scope-out

- Criar componentes de página que pertencem a `BK-MF7-04`.
- Alterar endpoints backend.
- Criar novos fluxos de autenticação.
- Fazer desenho pixel-perfect.
- Adicionar dependências de UI.

#### Estado antes e depois

- Estado antes: `BK-MF7-02` filtra links conforme sessão e role.
- Estado antes: `tokens.css` e `global.css` existem, mas ainda não estão totalmente alinhados com a paleta do mockup.
- Estado depois: tokens, header, hero e interações têm base visual coerente.
- Estado depois: `BK-MF7-04` pode reutilizar a mesma linguagem visual nas páginas principais.

#### Pré-requisitos

- `BK-MF7-02` concluído ou validado.
- Ler `mockup/src/app/FAITHFLIX_INTERFACE_SPECS.md`, secções de paleta, header e hero.
- Rever `frontend/src/styles/tokens.css`.
- Rever `frontend/src/styles/global.css`.
- Rever `frontend/src/components/layout/AppHeader.jsx`.
- Rever `frontend/src/pages/DiscoveryHomePage.jsx`.

#### Glossário

- Design token: variável CSS que evita repetir valores visuais soltos.
- Hierarquia visual: ordem de importância percebida pelo utilizador.
- Estado de interação: aparência de hover, active, disabled e foco.
- Hero: primeira área forte da página inicial.
- Responsividade: adaptação do layout a telemóvel, tablet e desktop.

#### Conceitos teóricos essenciais

- `CANONICO`: o mockup define paleta, sensação visual, header e hero como referência.
- `CANONICO`: `RNF01..RNF04` cobrem navegação clara, feedback, responsividade e acessibilidade.
- `DERIVADO`: os tokens usam nomes próprios da app (`--color-brand`, `--color-accent`) para manter o código simples para alunos.
- Tokens reduzem drift visual: se a cor principal muda, altera-se uma variável em vez de dezenas de regras.
- O header deve continuar a respeitar sessão e role. Refinamento visual não pode voltar a mostrar links admin a perfis indevidos.

#### Arquitetura do BK

| Camada | Artefacto | Responsabilidade |
| --- | --- | --- |
| Tokens | `frontend/src/styles/tokens.css` | Paleta, espaçamento, sombras, raio e tipografia. |
| CSS global | `frontend/src/styles/global.css` | Layout, header, hero, grelhas e estados de interação. |
| Componente | `frontend/src/components/layout/AppHeader.jsx` | Navegação filtrada e visualmente limpa. |
| Página | `frontend/src/pages/DiscoveryHomePage.jsx` | Hero e CTAs principais. |
| Evidence | `docs/evidence/MF7/REFINAMENTO-VISUAL-MOCKUP.md` | Provas por viewport e interação. |

#### Ficheiros a criar/editar/rever

- EDITAR: `frontend/src/styles/tokens.css`
- EDITAR: `frontend/src/styles/global.css`
- EDITAR: `frontend/src/pages/DiscoveryHomePage.jsx`
- REVER: `frontend/src/components/layout/AppHeader.jsx`
- REVER: `frontend/src/components/layout/AppFooter.jsx`
- CRIAR/EDITAR: `docs/evidence/MF7/REFINAMENTO-VISUAL-MOCKUP.md`

#### Tutorial técnico linear

### Passo 1 - Mapear tokens do mockup para a app

1. Objetivo funcional do passo no contexto da app.

Traduzir a paleta e o ritmo visual do mockup para variáveis CSS da aplicação.

2. Ficheiros envolvidos:
    - REVER: `mockup/src/app/FAITHFLIX_INTERFACE_SPECS.md`
    - EDITAR: `frontend/src/styles/tokens.css`
    - LOCALIZAÇÃO: bloco `:root`.

3. Instruções do que fazer.

Substitui o bloco `:root` por tokens nomeados, mas preserva todos os nomes que já são usados por `global.css`. Mantém nomes simples e não uses valores soltos nas páginas.

4. Código completo, correto e integrado com a app final.

```css
/* frontend/src/styles/tokens.css */
:root {
  color-scheme: light;
  --color-bg: #f9f7f3;
  /* Estes tokens mantêm nomes já consumidos por footer, cards, hover e media. */
  --color-bg-deep: #4b4b4b;
  --color-surface: #ffffff;
  --color-surface-soft: #f4efe6;
  --color-surface-raised: #ffffff;
  --color-text: #3f3f3f;
  --color-text-soft: #4b4b4b;
  --color-muted: #676767;
  --color-brand: #8da385;
  --color-brand-strong: #667a60;
  --color-brand-hover: #7a8f74;
  --color-accent: #f0cd95;
  --color-danger: #d16449;
  --color-border: rgba(75, 75, 75, 0.16);
  /* A cor de foco fica separada da marca para manter contraste claro no uso por teclado. */
  --color-focus: #4f6fbd;
  --shadow-soft: 0 14px 32px rgba(63, 63, 63, 0.1);
  --shadow-card: 0 8px 24px rgba(63, 63, 63, 0.08);
  --shadow-raised: 0 18px 42px rgba(63, 63, 63, 0.14);
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 10px;
  --space-page: clamp(1rem, 4vw, 3rem);
  /* A largura máxima evita linhas demasiado longas e grelhas dispersas em ecrãs grandes. */
  --content-width: 1160px;
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

5. Explicação do código.

O bloco concentra a identidade visual do FaithFlix. `--color-brand` e `--color-accent` vêm do mockup. `--color-focus` existe para teclado e acessibilidade. `--content-width` evita layouts demasiado largos. Os tokens `--color-bg-deep`, `--color-surface-raised`, `--color-text-soft`, `--color-brand-hover` e `--shadow-raised` ficam preservados porque já são usados por regras globais de footer, cards, hover e media. Assim, `global.css`, header, hero e páginas do próximo BK não ficam com variáveis CSS em falta.

6. Validação do passo.

Pesquisa valores hex duplicados fora de `tokens.css` e confirma que todos os `var(...)` usados em `global.css` têm variável definida em `tokens.css`. Resultado esperado: as novas cores aparecem sobretudo como variáveis e não existem tokens em falta.

7. Cenário negativo/erro esperado.

Se uma página usar muitas cores diretas em vez de tokens, a UI volta a ficar difícil de manter. Se `global.css` chamar um token inexistente, o browser ignora essa propriedade e a interface pode perder background, sombra ou feedback visual sem mostrar erro de build.

### Passo 2 - Refinar base visual, header e interações

1. Objetivo funcional do passo no contexto da app.

Aplicar tokens ao layout, header, navegação, botões, foco e responsividade.

2. Ficheiros envolvidos:
    - REVER: `frontend/src/components/layout/AppHeader.jsx`
    - EDITAR: `frontend/src/styles/global.css`
    - LOCALIZAÇÃO: preservar o botão/menu semântico de `BK-MF7-02`; regras globais,
      `.app-header`, `.menu-toggle`, `.main-nav`, `.nav-link`, `.button-link`,
      `.hero-section` e media queries.

3. Instruções do que fazer.

Mantém as regras já existentes e substitui as zonas equivalentes pelas regras
abaixo. Se uma classe já existir, atualiza a regra em vez de duplicar. Não
removas do `AppHeader` o botão com `aria-expanded`/`aria-controls`, o fecho por
`Escape`, o fecho por mudança de `pathname` ou a restituição de foco.

4. Código completo, correto e integrado com a app final.

```css
/* frontend/src/styles/global.css */
body {
  margin: 0;
  background: var(--color-bg);
  color: var(--color-text);
}

/* O foco visível é global para que links, botões e controlos mantenham acessibilidade. */
:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 3px;
}

.app-header {
  /* O header fixo ajuda orientação, mas mantém fundo sólido para não tapar conteúdo legível. */
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem var(--space-page);
  background: rgba(255, 255, 255, 0.94);
  border-bottom: 1px solid var(--color-border);
  backdrop-filter: blur(14px);
}

.brand-link {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  color: var(--color-text);
  font-weight: 800;
  text-decoration: none;
}

.brand-mark {
  display: grid;
  width: 2.25rem;
  height: 2.25rem;
  place-items: center;
  border-radius: var(--radius-lg);
  background: var(--color-brand);
  color: white;
}

.main-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  justify-content: flex-end;
}

.menu-toggle {
  display: none;
}

.nav-link,
.button-link,
.base-button,
.menu-toggle,
.main-nav button {
  min-inline-size: 44px;
  min-block-size: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  font-weight: 700;
  text-decoration: none;
  transition:
    background 140ms ease,
    color 140ms ease,
    transform 140ms ease;
}

.nav-link {
  padding: 0.45rem 0.7rem;
  color: var(--color-muted);
}

.nav-link:hover,
.nav-link-active {
  background: var(--color-surface-soft);
  color: var(--color-brand-strong);
}

.button-link,
.base-button {
  border: 0;
  padding: 0.72rem 1rem;
  background: var(--color-brand);
  color: white;
  cursor: pointer;
}

.button-link:hover,
.base-button:hover {
  transform: translateY(-1px);
  background: var(--color-brand-strong);
}

.base-button:disabled,
button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
  transform: none;
}

.app-main {
  width: min(var(--content-width), 100%);
  margin: 0 auto;
  padding: 2rem var(--space-page);
}

.hero-section {
  display: grid;
  min-height: 420px;
  align-items: center;
  border-radius: var(--radius-lg);
  background:
    linear-gradient(90deg, rgba(63, 63, 63, 0.82), rgba(63, 63, 63, 0.24)),
    var(--color-brand);
  box-shadow: var(--shadow-soft);
  color: white;
  padding: clamp(2rem, 6vw, 4rem);
}

.section-kicker,
.content-card-eyebrow {
  margin: 0;
  color: var(--color-brand-strong);
  font-weight: 800;
  text-transform: uppercase;
}

.hero-section .section-kicker {
  width: fit-content;
  border-radius: var(--radius-sm);
  background: var(--color-accent);
  color: var(--color-text);
  padding: 0.35rem 0.65rem;
}

@media (max-width: 720px) {
  .app-header {
    block-size: 72px;
    max-block-size: 72px;
    padding-block: 0.5rem;
  }

  .menu-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .main-nav {
    position: absolute;
    top: 100%;
    right: 0;
    left: 0;
    display: none;
    max-height: calc(100vh - 4.5rem);
    overflow-y: auto;
    flex-direction: column;
    align-items: stretch;
    padding: 0.75rem var(--space-page) 1rem;
    border-bottom: 1px solid var(--color-border);
    background: var(--color-surface);
    box-shadow: var(--shadow-soft);
  }

  .main-nav[data-open="true"] {
    display: flex;
  }

  .main-nav .nav-link,
  .main-nav button {
    width: 100%;
    justify-content: flex-start;
  }

  .hero-section {
    min-height: 340px;
  }
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  *,
  *::before,
  *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

5. Explicação do código.

Estas regras dão estabilidade visual à aplicação. O header fica fixo e legível,
o foco por teclado fica visível e todos os alvos interativos têm pelo menos
44x44 px. Em mobile, a navegação fica fechada fora do layout até o botão
semântico a abrir; não depende de dezenas de links em wrap. A media query de
movimento reduzido neutraliza animações não essenciais.

6. Validação do passo.

Testa 390px, 768px e desktop. Resultado esperado: o header fechado mede no
máximo 72 px, o menu abre por botão, fecha com `Escape`, restitui foco, não cria
overflow e todos os controlos têm alvo mínimo 44x44 px.

7. Cenário negativo/erro esperado.

Se a navegação ficar focável quando fechada, não devolver foco após `Escape` ou
criar scroll horizontal em mobile, o BK não pode fechar.

### Passo 3 - Refinar hero da página inicial

1. Objetivo funcional do passo no contexto da app.

Dar à página inicial uma primeira leitura forte, coerente e em português de Portugal.

2. Ficheiros envolvidos:
    - EDITAR: `frontend/src/pages/DiscoveryHomePage.jsx`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Mantém a chamada a `discoveryApi.home()`, mas melhora a copy, CTAs e estados de carregamento/erro.

4. Código completo, correto e integrado com a app final.

```jsx
// frontend/src/pages/DiscoveryHomePage.jsx
/**
 * @file Página inicial de descoberta FaithFlix.
 */

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ContentCarousel } from "../components/discovery/ContentCarousel.jsx";
import { useSession } from "../context/SessionContext.jsx";
import { toUserMessage } from "../services/api/apiErrors.js";
import { discoveryApi } from "../services/api/discoveryApi.js";

/**
 * Mostra a entrada principal da plataforma e os carrosséis de descoberta.
 *
 * @returns {JSX.Element} Página inicial da aplicação.
 */
export function DiscoveryHomePage() {
  const session = useSession();
  const [carousels, setCarousels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const requestEpochRef = useRef(0);

  useEffect(() => {
    const controller = new AbortController();
    const requestEpoch = requestEpochRef.current + 1;
    requestEpochRef.current = requestEpoch;

    async function loadDiscovery() {
      try {
        const response = await discoveryApi.home({ signal: controller.signal });

        if (!controller.signal.aborted && requestEpochRef.current === requestEpoch) {
          setCarousels(response.carousels);
        }
      } catch (requestError) {
        if (
          !controller.signal.aborted &&
          requestEpochRef.current === requestEpoch &&
          requestError?.code !== "REQUEST_ABORTED"
        ) {
          setError(toUserMessage(requestError));
        }
      } finally {
        // Epoch + abort impedem que uma resposta antiga vença uma rota nova.
        if (!controller.signal.aborted && requestEpochRef.current === requestEpoch) {
          setLoading(false);
        }
      }
    }

    void loadDiscovery();

    return () => controller.abort();
  }, []);

  return (
    <section className="page-section">
      <section className="hero-section" aria-labelledby="home-title">
        <div className="hero-copy">
          <p className="section-kicker">Streaming cristão curado</p>
          <h1 id="home-title">FaithFlix</h1>
          <p>
            Conteúdos, pesquisa, recomendações simples e impacto solidário numa
            experiência preparada para desktop, tablet e telemóvel.
          </p>
          <div className="button-row">
            <Link className="button-link" to="/catalogo">Explorar catálogo</Link>
            {session.status === "anonymous" ? (
              <>
                <Link className="button-link" to="/login">Entrar</Link>
                <Link className="button-link" to="/planos">Ver planos</Link>
              </>
            ) : null}
            {session.status === "authenticated" ? (
              <Link className="button-link" to="/para-si">Ver recomendações</Link>
            ) : null}
          </div>
        </div>
      </section>

      {loading ? <p role="status">A carregar descoberta...</p> : null}
      {error ? <p role="alert">{error}</p> : null}
      {session.status === "loading" ? <p role="status">A confirmar sessão...</p> : null}
      {session.status === "unavailable" ? (
        <section role="alert">
          <p>{session.error || "Não foi possível confirmar a sessão."}</p>
          <button type="button" onClick={() => session.refreshSession().catch(() => {})}>
            Tentar novamente
          </button>
        </section>
      ) : null}

      {carousels.map((carousel) => (
        <ContentCarousel
          key={carousel.id}
          title={carousel.title}
          items={carousel.items}
        />
      ))}
    </section>
  );
}
```

5. Explicação do código.

O componente continua a consumir `discoveryApi.home()`, por isso não altera o
contrato backend. Reutiliza `ContentCarousel`, criado e exportado em
`BK-MF3-04`, em vez de inventar um segundo componente com API desconhecida. A
chamada assíncrona usa `async/await` dentro do `useEffect`, mantendo o padrão
didático da PAP e evitando promise chains. A flag `ignore` evita atualizar
estado se a página desmontar durante o pedido. A mudança visual apresenta a
marca, CTAs claros e uma descrição honesta do produto. `role="status"` e
`role="alert"` ajudam acessibilidade e feedback.

Nota de alinhamento final: a home de produto não deve renderizar `ApiStatusBadge` nem o texto "Estado API". Esse badge foi útil na MF1 como prova técnica/dev-only, mas não pertence à experiência final. Na home atual, os CTAs dependem da sessão: anónimo vê `Ver detalhe`, `Entrar para reproduzir` e `Ver planos`; autenticado vê `Ver detalhe` e `Reproduzir`; enquanto a sessão está em loading, a UI mantém CTA seguro sem expor reprodução direta.

6. Validação do passo.

Abre a home e confirma que aparecem hero com H1, descrição, discovery curta, CTAs seguros por sessão, loading e erro controlado, sem `Estado API`.

7. Cenário negativo/erro esperado.

Se a API falhar, a página deve mostrar mensagem de erro sem quebrar o layout.

### Passo 4 - Registar evidence visual e handoff

1. Objetivo funcional do passo no contexto da app.

Guardar prova de que tokens, header, hero e interações estão prontos para o refinamento das páginas.

2. Ficheiros envolvidos:
    - CRIAR/EDITAR: `docs/evidence/MF7/REFINAMENTO-VISUAL-MOCKUP.md`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria a evidence abaixo e preenche resultados observados.

4. Código completo, correto e integrado com a app final.

```md
# Refinamento visual e mockup - MF7

- `document_status`: `CURRENT`
- `snapshot_date`: `-`
- `implementation_lane`: `STUDENT`
- `current_authority`: `docs/planificacao/guias-bk/MF7/BK-MF7-03-layout-tokens-header-alinhados-mockup.md`
- `proof_scope`: comparação visual observada pelos alunos; não prova todos os browsers, viewports ou produção

## Metadados

- BK: BK-MF7-03
- Owner: Mateus
- Fonte: RNF01, RNF02, RNF03, RNF04, RNF28, RNF38
- Decisão: EM_REVISAO

## Verificações

| Área | Resultado esperado | Resultado observado | Estado |
| --- | --- | --- | --- |
| Tokens | Paleta base usa variáveis CSS | A preencher | A preencher |
| Header desktop | Links legíveis e filtrados por perfil | A preencher | A preencher |
| Header mobile | Sem sobreposição nem scroll horizontal | A preencher | A preencher |
| Hero | Marca, descrição e CTAs claros | A preencher | A preencher |
| Foco teclado | Outline visível em links e botões | A preencher | A preencher |
| Hover/active | Feedback visual sem deslocar layout | A preencher | A preencher |
| Disabled | Botões bloqueados ficam reconhecíveis | A preencher | A preencher |
| PT-PT | Texto visível com acentuação correta | A preencher | A preencher |

## Handoff para BK-MF7-04

- Tokens prontos:
- Classes reutilizáveis:
- Páginas com maior risco visual:
- Estados de UI a uniformizar:
```

5. Explicação do código.

Esta evidence cria um contrato visual objetivo para o gate. O próximo BK deixa de discutir paleta e passa a aplicar os padrões nas páginas principais.

6. Validação do passo.

Confirma que a evidence tem todas as linhas preenchidas antes de avançar.

7. Cenário negativo/erro esperado.

Se o header mobile ainda tiver overflow horizontal, a decisão da evidence deve ficar `NO_GO` para este BK.

#### Critérios de aceite

- Tokens CSS refletem a paleta do mockup.
- Header mantém filtro por perfil criado em `BK-MF7-02`.
- Hero tem marca, descrição e CTAs claros.
- A leitura da home usa `AbortController` e epoch; unmount/resposta antiga não
  atualiza estado e erros passam por `toUserMessage`, nunca por `.message` cru.
- Loading/unavailable não mostram CTAs privados; anonymous vê login/planos e
  authenticated vê a ação privada `Ver recomendações`.
- Estados de foco, hover, active e disabled são visíveis.
- Mobile não tem sobreposição nem overflow horizontal.
- Evidence visual preenchida.

#### Validação final

- Executar `npm --prefix frontend run build`.
- Executar `bash scripts/validate-planificacao.sh`.
- Executar `git diff --check`.
- Confirmar `docs/evidence/MF7/REFINAMENTO-VISUAL-MOCKUP.md`.
- Testar unmount/rota rápida com pedido pendente, erro técnico sanitizado e os
  quatro estados da sessão na matriz de CTAs.

#### Evidence para PR/defesa

- `pr`: referência da entrega deste BK.
- `proof`: `docs/evidence/MF7/REFINAMENTO-VISUAL-MOCKUP.md`.
- `neg`: mobile com navegação longa, foco por teclado, erro da API na home.
- `fonte`: `RNF01`, `RNF02`, `RNF03`, `RNF04`, `RNF28`, `RNF38`.

#### Handoff

- `BK-MF7-04` deve reutilizar tokens, `.content-grid`, `.content-card`, `.empty-state`, `.button-row` e estados de feedback.
- Qualquer problema de links admin volta para `BK-MF7-02` antes do gate.

##### Critérios mensuráveis complementares de UI

Este adendo torna os critérios visuais reproduzíveis; não altera o estado
`TODO` deste BK nem constitui prova de execução dos alunos.

- Cada botão, link com aparência de botão e controlo móvel deve ter área
  interativa mínima de `44x44 px`.
- Texto e componentes devem cumprir contraste WCAG AA; o estado de foco tem de
  permanecer visível em navegação por teclado.
- Animações não essenciais devem ser removidas ou reduzidas em
  `prefers-reduced-motion: reduce`.
- O header móvel fechado deve medir no máximo `72 px`; o menu abre por botão
  semântico, fecha com `Escape` e restitui foco ao botão que o abriu.
- A página não pode criar overflow horizontal em `390x844`, `768x900`,
  `1280x720` ou `1440x900`.
- Orçamento local de referência: JavaScript inicial até `90 kB` gzip, CSS até
  `25 kB` gzip e logo até `30 kB`. Adapters HLS/DASH devem permanecer fora do
  chunk inicial por carregamento lazy.

#### Changelog

- `2026-07-10`: reutilizado `ContentCarousel` de `BK-MF3-04`; removido o import
  de um componente paralelo inexistente e integrado o bloco complementar no
  contrato tutorial.
- `2026-06-22`: guia criado/reestruturado na reorganização documental MF7/MF8.
- `2026-06-23`: guia atualizado com tokens, CSS, hero, evidence e validações visuais.
- `2026-06-23`: tokens preservados para impedir variáveis CSS em falta entre `tokens.css` e `global.css`.
- `2026-07-10`: critérios de contraste, foco, movimento reduzido, targets,
  header móvel, viewports e orçamento inicial tornados mensuráveis.
