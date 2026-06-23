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
- `last_updated`: `2026-06-23`

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
    - EDITAR: `frontend/src/styles/global.css`
    - LOCALIZAÇÃO: regras globais, `.app-header`, `.main-nav`, `.nav-link`, `.button-link`, `.hero-section` e media query.

3. Instruções do que fazer.

Mantém as regras já existentes e substitui as zonas equivalentes pelas regras abaixo. Se uma classe já existir, atualiza a regra em vez de duplicar.

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
  /* O wrap impede scroll horizontal quando há muitos links visíveis no perfil admin. */
  gap: 0.4rem;
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
    /* Em mobile, a coluna evita sobreposição entre marca e navegação. */
    align-items: flex-start;
    flex-direction: column;
  }

  .main-nav {
    justify-content: flex-start;
  }

  .hero-section {
    min-height: 340px;
  }
}
```

5. Explicação do código.

Estas regras dão estabilidade visual à aplicação. O header fica fixo e legível, o foco por teclado fica visível, os botões têm feedback e o hero ganha presença sem depender de imagens externas. A media query evita sobreposição em ecrãs estreitos.

6. Validação do passo.

Testa 390px, 768px e desktop. Resultado esperado: header não tapa conteúdo, navegação quebra linha sem overflow e foco é visível com Tab.

7. Cenário negativo/erro esperado.

Se a navegação criar scroll horizontal em mobile, a regra `.main-nav` ou o espaçamento dos links deve ser ajustado antes de fechar o BK.

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

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DiscoveryCarousel } from "../components/discovery/DiscoveryCarousel.jsx";
import { ApiStatusBadge } from "../components/system/ApiStatusBadge.jsx";
import { discoveryApi } from "../services/api/discoveryApi.js";

/**
 * Mostra a entrada principal da plataforma e os carrosséis de descoberta.
 *
 * @returns {JSX.Element} Página inicial da aplicação.
 */
export function DiscoveryHomePage() {
  const [carousels, setCarousels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadDiscovery() {
      try {
        const response = await discoveryApi.home();

        if (!ignore) {
          setCarousels(response.carousels);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message);
        }
      } finally {
        // A flag evita atualizar estado se o componente sair do ecrã durante o pedido.
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadDiscovery();

    return () => {
      ignore = true;
    };
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
            <Link className="button-link" to="/planos">Ver planos</Link>
          </div>
        </div>
        {/* O badge confirma saúde da API sem interromper o fluxo visual do hero. */}
        <ApiStatusBadge />
      </section>

      {loading ? <p role="status">A carregar descoberta...</p> : null}
      {error ? <p role="alert">{error}</p> : null}

      {carousels.map((carousel) => (
        <DiscoveryCarousel
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

O componente continua a consumir `discoveryApi.home()`, por isso não altera o contrato backend. A chamada assíncrona usa `async/await` dentro do `useEffect`, mantendo o padrão didático da PAP e evitando promise chains. A flag `ignore` evita atualizar estado se a página desmontar durante o pedido. A mudança visual apresenta a marca, CTAs claros e uma descrição honesta do produto. `role="status"` e `role="alert"` ajudam acessibilidade e feedback.

6. Validação do passo.

Abre a home e confirma que aparecem badge, H1, descrição, dois CTAs, loading e erro controlado.

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
- Estados de foco, hover, active e disabled são visíveis.
- Mobile não tem sobreposição nem overflow horizontal.
- Evidence visual preenchida.

#### Validação final

- Executar `npm --prefix frontend run build`.
- Executar `bash scripts/validate-planificacao.sh`.
- Executar `git diff --check`.
- Confirmar `docs/evidence/MF7/REFINAMENTO-VISUAL-MOCKUP.md`.

#### Evidence para PR/defesa

- `pr`: referência da entrega deste BK.
- `proof`: `docs/evidence/MF7/REFINAMENTO-VISUAL-MOCKUP.md`.
- `neg`: mobile com navegação longa, foco por teclado, erro da API na home.
- `fonte`: `RNF01`, `RNF02`, `RNF03`, `RNF04`, `RNF28`, `RNF38`.

#### Handoff

- `BK-MF7-04` deve reutilizar tokens, `.content-grid`, `.content-card`, `.empty-state`, `.button-row` e estados de feedback.
- Qualquer problema de links admin volta para `BK-MF7-02` antes do gate.

#### Changelog

- `2026-06-22`: guia criado/reestruturado na reorganização documental MF7/MF8.
- `2026-06-23`: guia atualizado com tokens, CSS, hero, evidence e validações visuais.
- `2026-06-23`: tokens preservados para impedir variáveis CSS em falta entre `tokens.css` e `global.css`.
