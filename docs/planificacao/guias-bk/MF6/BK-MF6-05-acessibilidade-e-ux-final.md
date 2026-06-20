# BK-MF6-05 - Acessibilidade e UX final

## Header

- `doc_id`: `GUIA-BK-MF6-05`
- `bk_id`: `BK-MF6-05`
- `macro`: `MF6`
- `owner`: `Mateus`
- `apoio`: `Kaue`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF6-02`
- `rf_rnf`: `RNF01, RNF02, RNF03, RNF04, RNF06`
- `fase_documental`: `Fase 3`
- `sprint`: `S11`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF6-06`
- `guia_path`: `docs/planificacao/guias-bk/MF6/BK-MF6-05-acessibilidade-e-ux-final.md`
- `last_updated`: `2026-06-20`

#### Objetivo

Neste BK vais fechar a acessibilidade e a UX final do frontend FaithFlix, garantindo navegação clara, estados visuais, responsividade, foco por teclado, estrutura semântica e controlos simples no player.

O resultado final é a criação do componente `SkipLink`, a ligação desse componente ao `AppLayout`, o reforço dos estilos globais de foco, a normalização de textos visíveis críticos e a criação de uma evidence manual sem sucesso antecipado para `RNF01`, `RNF02`, `RNF03`, `RNF04` e `RNF06`.

Este BK não altera regras de negócio. Ele melhora a forma como o utilizador chega ao catálogo, pesquisa, player, perfil, subscrição e associações, preservando a stack React + Vite já estabilizada nos BKs anteriores.

#### Importância

Acessibilidade não é apenas requisito formal. Ela permite que pessoas com diferentes dispositivos, tamanhos de ecrã, preferências e limitações consigam usar o FaithFlix. Uma plataforma de streaming com propósito comunitário deve ser clara, navegável e previsível.

`RNF01` a `RNF06` fecham a parte visível da experiência antes do gate técnico final. Se o utilizador não consegue chegar ao conteúdo, perceber botões, ler mensagens, usar teclado ou controlar o player sem rato, a aplicação não está pronta para defesa.

Este BK também prepara `BK-MF6-06`: o gate técnico só deve aceitar evidence real. Por isso, a checklist deste BK usa placeholders seguros e obriga a equipa a registar resultados observados, páginas testadas e negativos executados.

#### Scope-in

- Criar link de salto para o conteúdo principal.
- Garantir `main` identificável e focável.
- Reforçar CSS de foco do skip link.
- Normalizar textos visíveis e `aria-labels` críticos em navegação e player.
- Rever botões, formulários, estados vazios e player com critérios concretos.
- Validar responsividade em mobile, tablet e desktop.
- Registar evidence com proof visual/manual, build e negativos.

#### Scope-out

- Redesenhar identidade visual completa.
- Fazer pixel-perfect do mockup.
- Criar novo design system.
- Alterar regras de negócio, endpoints, coleções, modelos ou permissões.
- Instalar ferramentas externas de auditoria visual.
- Introduzir CDN, DRM, streaming adaptativo real, gateways de pagamento ou IA generativa.

#### Estado antes e depois

Antes deste BK, o frontend já tem layout, header, footer, foco visível global e páginas principais. `BK-MF6-02` validou rotas e build frontend, mas ainda falta uma forma explícita de saltar navegação repetida, falta evidence manual guiada por RNF e alguns textos visíveis do frontend real ainda precisam de revisão de português e clareza.

Depois deste BK, a aplicação tem um `SkipLink`, um `main` semântico com destino de foco, estilos acessíveis para o link de salto, textos críticos revistos e uma evidence de UX que só pode ser preenchida depois de validação real.

#### Pre-requisitos

- `BK-MF1-02` criou frontend React + Vite.
- `BK-MF1-03` criou cliente API e mensagens de erro.
- `BK-MF2-05` criou player.
- `BK-MF4` criou planos, associações e notificações.
- `BK-MF5` criou conta, privacidade e administração.
- `BK-MF6-02` validou rotas e build frontend.
- `BK-MF6-04` entregou resultados de performance para confirmar que UX final não degrada páginas críticas.
- O mockup foi consultado apenas para fluxo, hierarquia visual e nomes visíveis, nunca como contrato técnico.

#### Glossário

- Acessibilidade: capacidade de usar a app com teclado, leitores de ecrã e diferentes condições visuais.
- UX: experiência de uso; mede se a app é clara, previsível e confortável para cumprir uma tarefa.
- Skip link: link visível ao foco que permite saltar navegação repetida.
- Foco visível: indicação visual do elemento ativo ao navegar por teclado.
- Semântica: uso correto de elementos como `main`, `button`, `label`, `nav`, `header`, `footer` e headings.
- Estado disabled: estado em que um controlo não pode ser usado e deve comunicar isso visualmente.
- Evidence manual: prova feita por observação humana, mas registada com páginas, larguras, comando, resultado e negativos.

#### Conceitos teóricos essenciais

- `CANONICO`: `RNF01` pede navegação clara entre catálogo, pesquisa, player, perfil, subscrição e associações. Isto significa que o utilizador deve conseguir perceber onde está, para onde pode ir e como regressar a uma área principal.
- `CANONICO`: `RNF02` pede estados visuais claros para botões, cards e links. Um estado visual evita que o utilizador fique sem feedback depois de clicar, tabular ou tentar usar um controlo desativado.
- `CANONICO`: `RNF03` pede layout responsivo em desktop, tablet e smartphone. A hierarquia visual deve manter-se, mesmo quando o header quebra linha ou os cards passam para uma coluna.
- `CANONICO`: `RNF04` pede contraste adequado, tamanho mínimo de fonte, headings e labels semânticos. O HTML correto ajuda utilizadores, leitores de ecrã e manutenção futura.
- `CANONICO`: `RNF06` pede player simples, com controlos sempre visíveis ou facilmente acessíveis. O player não deve depender exclusivamente do rato.
- `DERIVADO`: o skip link é uma solução mínima e standard para evitar que utilizadores de teclado atravessem toda a navegação em cada página.
- `DERIVADO`: as larguras `390px`, `768px` e `1280px` representam smartphone, tablet e desktop no contexto PAP; não substituem testes reais em todos os dispositivos.
- Foco por teclado entra no fluxo quando o utilizador carrega em `Tab`; vai para o próximo controlo interativo e deve ser visível. O erro que evita é uma interface navegável visualmente, mas inacessível sem rato.
- Labels e mensagens em português de Portugal entram no fluxo quando o utilizador lê navegação, formulários e player. Vão para a evidence como proof de clareza. O erro que evitam é uma interface tecnicamente funcional mas pouco profissional na defesa.

#### Arquitetura do BK

| Camada | Decisão |
| --- | --- |
| Novo componente | `real_dev/frontend/src/components/a11y/SkipLink.jsx` |
| Layout editado | `real_dev/frontend/src/layouts/AppLayout.jsx` |
| CSS editado | `real_dev/frontend/src/styles/global.css` |
| Navegação revista | `real_dev/frontend/src/components/layout/AppHeader.jsx` |
| Player revisto | `real_dev/frontend/src/pages/PlaybackPage.jsx` |
| Componentes a rever | `real_dev/frontend/src/components/ui/BaseButton.jsx` e formulários visíveis |
| Validação | teclado, responsividade, build Vite e checklist manual |
| Evidence | `docs/evidence/MF6/BK-MF6-05-acessibilidade-ux.md` |
| Handoff | `BK-MF6-06` consome esta evidence no gate final |

#### Ficheiros a criar/editar/rever

- CRIAR: `real_dev/frontend/src/components/a11y/SkipLink.jsx`
- EDITAR: `real_dev/frontend/src/layouts/AppLayout.jsx`
- EDITAR: `real_dev/frontend/src/styles/global.css`
- EDITAR: `real_dev/frontend/src/components/layout/AppHeader.jsx`
- EDITAR: `real_dev/frontend/src/pages/PlaybackPage.jsx`
- REVER: `real_dev/frontend/src/components/ui/BaseButton.jsx`
- REVER: páginas com formulários, estados vazios, loading, erro e sucesso.
- CRIAR: `docs/evidence/MF6/BK-MF6-05-acessibilidade-ux.md`

#### Tutorial técnico linear

### Passo 1 - Criar o componente SkipLink

1. Objetivo funcional do passo no contexto da app.

Permitir que utilizadores de teclado saltem diretamente para o conteúdo principal sem atravessar todos os links do header em cada página.

2. Ficheiros envolvidos:
    - CRIAR: `real_dev/frontend/src/components/a11y/SkipLink.jsx`
    - LOCALIZAÇÃO: ficheiro completo

3. Instruções do que fazer.

Cria a pasta `real_dev/frontend/src/components/a11y/` e adiciona o componente abaixo. Mantém o `targetId` igual ao `id` que será usado no `main` no Passo 2.

4. Código completo, correto e integrado com a app final.

```jsx
// real_dev/frontend/src/components/a11y/SkipLink.jsx
/**
 * @file Link de salto acessível para navegação por teclado.
 */

/**
 * Renderiza um link que fica visível quando recebe foco.
 *
 * @param {{ targetId?: string }} props Propriedades do componente.
 * @param {string} [props.targetId="conteudo-principal"] Identificador do elemento principal.
 * @returns {JSX.Element} Link de salto para o conteúdo.
 */
export function SkipLink({ targetId = "conteudo-principal" }) {
  return (
    <a className="skip-link" href={`#${targetId}`}>
      {/* O texto é curto e explícito para ser útil tanto visualmente como em leitores de ecrã. */}
      Saltar para o conteúdo principal
    </a>
  );
}
```

5. Explicação do código.

Este componente cria uma ligação normal de HTML para `#conteudo-principal`. O destino ainda não existe neste passo; será criado no `AppLayout` no Passo 2. O contrato técnico é simples: o valor de `href` tem de corresponder ao `id` do `main`.

O componente existe neste BK porque `RNF01` exige navegação clara e `RNF04` exige boas práticas de acessibilidade. Ele prepara `BK-MF6-06`, porque o gate final poderá verificar se existe uma forma objetiva de saltar navegação repetida.

Os dados de entrada são apenas `targetId`; quando não é passado, usa `"conteudo-principal"`. A saída é um link React. Não existe chamada HTTP, estado React, autenticação ou dados pessoais. O erro comum que este código evita é obrigar uma pessoa que usa teclado a passar por todo o menu em todas as páginas.

Podes adaptar o texto visível se a equipa escolher outra formulação em português, mas não alteres o destino sem alterar também o `id` do `main`. Para testar, usa `Tab` no início da página e confirma que o primeiro foco mostra este link.

6. Validação do passo.

Executa o frontend e carrega em `Tab` logo ao abrir a página. O primeiro foco deve mostrar "Saltar para o conteúdo principal".

7. Cenário negativo/erro esperado.

Se o link aparecer sempre no topo sem foco, a página ganha ruído visual. Se nunca aparecer com `Tab`, falha o objetivo de acessibilidade.

### Passo 2 - Ligar SkipLink ao layout principal

1. Objetivo funcional do passo no contexto da app.

Garantir que o link aponta para um `main` real, semântico e focável.

2. Ficheiros envolvidos:
    - EDITAR: `real_dev/frontend/src/layouts/AppLayout.jsx`
    - LOCALIZAÇÃO: ficheiro completo

3. Instruções do que fazer.

Substitui o ficheiro por esta versão. Preserva `AppHeader`, `AppFooter` e o conteúdo recebido por `children`.

4. Código completo, correto e integrado com a app final.

```jsx
// real_dev/frontend/src/layouts/AppLayout.jsx
/**
 * @file Layout principal partilhado pelas páginas FaithFlix.
 */

import { SkipLink } from "../components/a11y/SkipLink.jsx";
import { AppFooter } from "../components/layout/AppFooter.jsx";
import { AppHeader } from "../components/layout/AppHeader.jsx";

/**
 * Estrutura de página partilhada por todas as rotas do frontend.
 *
 * @param {{ children: React.ReactNode }} props Propriedades do layout.
 * @param {React.ReactNode} props.children Conteúdo de página selecionado pelo React Router.
 * @returns {JSX.Element} Estrutura da aplicação com salto acessível, cabeçalho, conteúdo principal e rodapé.
 */
export function AppLayout({ children }) {
  return (
    <div className="app-shell">
      {/* O skip link vem antes do header para ser o primeiro destino quando o utilizador carrega em Tab. */}
      <SkipLink />
      <AppHeader />

      {/* O id liga o link ao conteúdo e o tabIndex permite foco sem entrar na tabulação normal. */}
      <main id="conteudo-principal" className="app-main" tabIndex={-1}>
        {children}
      </main>

      <AppFooter />
    </div>
  );
}
```

5. Explicação do código.

O layout passa a renderizar `SkipLink` antes do header. Isto é importante porque o primeiro elemento focável deve ser a ajuda de salto, não o logótipo nem a primeira ligação da navegação.

O `main` recebe `id="conteudo-principal"`, que corresponde ao `href` criado no Passo 1. Recebe também `tabIndex={-1}` para poder receber foco quando o browser salta para a âncora, sem passar a ser mais uma paragem normal no ciclo de `Tab`.

Este ficheiro usa componentes criados em BKs anteriores: `AppHeader`, `AppFooter` e o layout React da MF1. Não cria regras de negócio, endpoints nem permissões. A entrada é `children`; a saída é a moldura visual de todas as páginas. A validação principal é abrir uma rota, ativar o skip link com `Enter` e confirmar que o foco chega à área principal.

Podes adaptar o nome da classe CSS se o design system mudar, mas não mudes o `id` sem alterar o componente `SkipLink` e a evidence. Esse contrato é o que permite ao `BK-MF6-06` validar a acessibilidade de forma objetiva.

6. Validação do passo.

Abre `/catalogo`, carrega em `Tab`, ativa o skip link com `Enter` e confirma que o foco salta para o conteúdo principal.

7. Cenário negativo/erro esperado.

Se o `id` do `main` não corresponder ao `href` do link, o browser não consegue saltar para o conteúdo. Se removeres `AppHeader` ou `AppFooter`, quebras navegação e layout criados em BKs anteriores.

### Passo 3 - Adicionar estilos do skip link

1. Objetivo funcional do passo no contexto da app.

Fazer o skip link ficar fora do fluxo visual em repouso e ficar legível quando recebe foco por teclado.

2. Ficheiros envolvidos:
    - EDITAR: `real_dev/frontend/src/styles/global.css`
    - LOCALIZAÇÃO: adicionar bloco depois da regra `a { color: inherit; }`

3. Instruções do que fazer.

Adiciona este bloco ao CSS global. Não removas a regra global `:focus-visible`, porque ela continua a ser usada por botões, links e campos de formulário.

4. Código completo, correto e integrado com a app final.

```css
/* real_dev/frontend/src/styles/global.css */
.skip-link {
    position: absolute;
    left: var(--space-page);
    top: 0.75rem;
    z-index: 1000;
    /* O link fica fora do ecrã em repouso, mas continua acessível para leitores de ecrã e teclado. */
    transform: translateY(-150%);
    border-radius: var(--radius-md);
    background: var(--color-brand);
    color: white;
    padding: 0.75rem 1rem;
    font-weight: 800;
    text-decoration: none;
    transition: transform 120ms ease;
}

.skip-link:focus-visible {
    /* Ao receber foco, o link entra no ecrã para a pessoa perceber a ação disponível. */
    transform: translateY(0);
}
```

5. Explicação do código.

O bloco usa `position: absolute` e `transform` para esconder o link fora da área visível sem o remover da página. Isto é diferente de `display: none`, que impediria o foco por teclado e quebraria a função do componente.

`z-index: 1000` garante que o link aparece acima do header quando recebe foco. `background`, `color`, `padding` e `font-weight` tornam o texto legível e coerente com tokens existentes da interface. A transição é curta para não atrasar a navegação.

O contrato que este CSS cumpre vem de `RNF02` e `RNF04`: estados visuais claros e foco acessível. Não há dados de entrada nem saída; a validação é visual e manual. O erro comum que evita é criar um skip link semanticamente correto, mas invisível para quem precisa dele.

Podes ajustar cores se o contraste for medido e falhar, mas não uses cores que escondam o texto nem removas `:focus-visible`.

6. Validação do passo.

Com teclado, confirma que o link tem contraste legível, aparece acima do header e não fica escondido quando recebe foco.

7. Cenário negativo/erro esperado.

Se o link receber foco mas não se mover para dentro do ecrã, uma pessoa que usa teclado não percebe que a ação existe.

### Passo 4 - Normalizar navegação, textos visíveis e player

1. Objetivo funcional do passo no contexto da app.

Transformar a revisão UX final em alterações concretas nos componentes onde o utilizador lê navegação e controla o player.

2. Ficheiros envolvidos:
    - EDITAR: `real_dev/frontend/src/components/layout/AppHeader.jsx`
    - EDITAR: `real_dev/frontend/src/pages/PlaybackPage.jsx`
    - REVER: `real_dev/frontend/src/components/ui/BaseButton.jsx`
    - LOCALIZAÇÃO: ficheiro completo `AppHeader.jsx`; zona exata `div.player-controls` e elemento `<video>` em `PlaybackPage.jsx`; componente completo `BaseButton`

3. Instruções do que fazer.

Atualiza a navegação para português de Portugal com acentuação, `aria-label` claro e nomes consistentes com o mockup quando este for apenas visual. Depois, no player, corrige labels visíveis e `aria-label`. Por fim, revê `BaseButton`: confirma que usa `<button>`, respeita `disabled`, mantém foco visível global e não substitui botões por `div`.

4. Código completo, correto e integrado com a app final.

```jsx
// real_dev/frontend/src/components/layout/AppHeader.jsx
/**
 * @file Cabeçalho principal com navegação FaithFlix.
 */

import { NavLink } from "react-router-dom";

const navItems = [
    { to: "/", label: "Início" },
    { to: "/catalogo", label: "Catálogo" },
    { to: "/biblioteca", label: "Biblioteca" },
    { to: "/pesquisa", label: "Pesquisa" },
    { to: "/para-si", label: "Para si" },
    { to: "/associacoes", label: "Associações" },
    { to: "/planos", label: "Planos" },
    { to: "/conta", label: "Conta" },
    { to: "/admin/catalogo", label: "Admin catálogo" },
    { to: "/admin/utilizadores", label: "Admin utilizadores" },
    { to: "/admin/metricas", label: "Métricas" },
    { to: "/admin/integracoes", label: "Integrações" },
];

/**
 * Devolve a classe CSS de um item de navegação conforme o estado da rota.
 *
 * @param {{ isActive: boolean }} routeState Estado passado pelo React Router.
 * @returns {string} Lista de classes CSS da ligação de navegação.
 */
function getNavLinkClassName({ isActive }) {
    return isActive ? "nav-link nav-link-active" : "nav-link";
}

/**
 * Renderiza uma ligação de navegação a partir da lista de rotas.
 *
 * @param {{ to: string, label: string }} item Item de navegação com rota e texto visível.
 * @returns {JSX.Element} Ligação de navegação do React Router.
 */
function renderNavItem(item) {
    return (
        <NavLink
            key={item.to}
            className={getNavLinkClassName}
            to={item.to}
        >
            {/* O texto visível fica em português de Portugal para cumprir clareza e localização da interface. */}
            {item.label}
        </NavLink>
    );
}

/**
 * Renderiza o cabeçalho visível em todas as páginas.
 *
 * @returns {JSX.Element} Cabeçalho com marca e navegação principal.
 */
export function AppHeader() {
    return (
        <header className="app-header">
            <NavLink
                className="brand-link"
                to="/"
                aria-label="FaithFlix - início"
            >
                <span className="brand-mark" aria-hidden="true">
                    F
                </span>
                <span className="brand-name">FaithFlix</span>
            </NavLink>

            {/* A label do nav descreve a região para quem navega por leitor de ecrã. */}
            <nav className="main-nav" aria-label="Navegação principal">
                {navItems.map(renderNavItem)}
            </nav>
        </header>
    );
}
```

```jsx
// real_dev/frontend/src/pages/PlaybackPage.jsx
// Substitui a zona que começa em <div className="player-controls"...> e termina no </video>.
<div className="player-controls" aria-label="Opções de média">
    <label>
        Legendas
        <select
            value={preferences.subtitleLanguage}
            onChange={(event) =>
                updatePreference(
                    "subtitleLanguage",
                    event.target.value,
                )
            }
        >
            <option value="">Sem legendas</option>
            {playback.content.tracks.subtitles.map((track) => (
                <option key={track.language} value={track.language}>
                    {track.label}
                </option>
            ))}
        </select>
    </label>
    <label>
        Áudio
        <select
            value={audioValue}
            onChange={(event) =>
                updatePreference("audioLanguage", event.target.value)
            }
        >
            <option value="">Original</option>
            {playback.content.tracks.audio.map((track) => (
                <option key={track.language} value={track.language}>
                    {track.label}
                </option>
            ))}
        </select>
    </label>
    <label>
        Qualidade
        <select
            value={qualityValue}
            onChange={(event) =>
                updatePreference("quality", event.target.value)
            }
        >
            <option value="">Automática</option>
            {playback.content.qualityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    </label>
</div>
<video
    ref={videoRef}
    controls
    data-testid="faithflix-player"
    src={videoSrc}
    onLoadedMetadata={handleLoadedMetadata}
    onTimeUpdate={handleTimeUpdate}
    onPause={handlePause}
>
    {/* As tracks continuam no video para preservar legendas criadas nos BKs de streaming. */}
    {playback.content.tracks.subtitles.map((track) => (
        <track
            key={track.language}
            kind="subtitles"
            srcLang={track.language}
            label={track.label}
            src={track.src}
        />
    ))}
    O teu browser não suporta vídeo HTML5.
</video>
```

5. Explicação do código.

No `AppHeader`, os textos visíveis passam a usar português de Portugal com acentuação: `Início`, `Catálogo`, `Associações`, `Métricas` e `Integrações`. Isto cumpre `RNF01` porque a navegação fica mais clara, e ajuda `RNF04` porque o `nav` tem uma descrição acessível: `aria-label="Navegação principal"`.

O array `navItems` continua a usar as mesmas rotas. Isto preserva os contratos validados em `BK-MF6-02` e evita quebrar React Router. A entrada de cada item é `{ to, label }`; a saída é uma ligação `NavLink`. Não há dados pessoais, autenticação ou chamadas HTTP neste componente.

No `PlaybackPage`, a revisão corrige textos que o utilizador lê diretamente: `Áudio`, `Automática`, `Opções de média` e a mensagem de fallback do vídeo. O bloco preserva `controls`, `data-testid="faithflix-player"`, handlers de progresso e tracks de legendas criados nos BKs de streaming. Isto cumpre `RNF06` sem reinventar o player.

O erro comum que este passo evita é tratar UX como opinião vaga. Aqui tens alterações objetivas: navegação com textos claros, região `nav` descrita, player com labels em português correto e fallback legível. Podes adaptar labels se a equipa alterar nomes no mockup, mas não alteres rotas, handlers do player, `data-testid` ou estrutura de `<label><select>` sem repetir a regressão frontend.

6. Validação do passo.

Valida visualmente:

- header mostra `Início`, `Catálogo`, `Associações`, `Métricas` e `Integrações`;
- leitor de ecrã ou inspeção DOM mostra `aria-label="Navegação principal"`;
- player mostra `Áudio`, `Automática` e `Opções de média`;
- `data-testid="faithflix-player"` continua presente para regressão.

7. Cenário negativo/erro esperado.

Se trocares `to="/catalogo"` por outro caminho, a navegação pode deixar de bater certo com `AppRoutes.jsx`. Se removeres `controls` do `<video>`, quebras `RNF06`.

### Passo 5 - Registar evidence sem sucesso antecipado

1. Objetivo funcional do passo no contexto da app.

Confirmar que navegação, responsividade, botões, formulários e player cumprem os RNF de UX com resultados reais e sem `PASS` preenchido antes da execução.

2. Ficheiros envolvidos:
    - CRIAR: `docs/evidence/MF6/BK-MF6-05-acessibilidade-ux.md`
    - REVER: `/`, `/catalogo`, `/pesquisa`, `/ver/:contentId`, `/planos`, `/associacoes`, `/conta`
    - LOCALIZAÇÃO: ficheiro completo de evidence

3. Instruções do que fazer.

Executa build e valida manualmente três larguras: `390px`, `768px` e `1280px`. Testa teclado nas páginas principais. Só substitui `PREENCHER_COM_*` depois de observares o resultado real. Se uma linha falhar, escreve `FAIL`, descreve a falha e não marques o BK como fechado.

4. Código completo, correto e integrado com a app final.

```md
# Evidence BK-MF6-05 - Acessibilidade e UX final

- Owner: Mateus
- Apoio: Kaue
- Data: PREENCHER_COM_DATA_REAL
- Requisitos: RNF01, RNF02, RNF03, RNF04, RNF06

## Comandos executados

| Comando | Resultado real | Evidence anexada |
| --- | --- | --- |
| `cd real_dev/frontend && npm run build` | PREENCHER_COM_PASS_OU_FAIL | PREENCHER_COM_OUTPUT_RESUMIDO |

## Proof

| Verificação | Resultado real | Evidence anexada |
| --- | --- | --- |
| Skip link visível ao primeiro foco por teclado | PREENCHER_COM_PASS_OU_FAIL | PREENCHER_COM_SCREENSHOT_OU_NOTA |
| `Enter` no skip link move o foco para `#conteudo-principal` | PREENCHER_COM_PASS_OU_FAIL | PREENCHER_COM_SCREENSHOT_OU_NOTA |
| Navegação principal clara em `/`, `/catalogo`, `/pesquisa`, `/planos`, `/associacoes` e `/conta` | PREENCHER_COM_PASS_OU_FAIL | PREENCHER_COM_PAGINAS_TESTADAS |
| Layout mantém hierarquia a 390px | PREENCHER_COM_PASS_OU_FAIL | PREENCHER_COM_SCREENSHOT_OU_NOTA |
| Layout mantém hierarquia a 768px | PREENCHER_COM_PASS_OU_FAIL | PREENCHER_COM_SCREENSHOT_OU_NOTA |
| Layout mantém hierarquia a 1280px | PREENCHER_COM_PASS_OU_FAIL | PREENCHER_COM_SCREENSHOT_OU_NOTA |
| Botões, links e selects têm foco visível | PREENCHER_COM_PASS_OU_FAIL | PREENCHER_COM_COMPONENTES_TESTADOS |
| Player em `/ver/:contentId` mantém controlos acessíveis por teclado | PREENCHER_COM_PASS_OU_FAIL | PREENCHER_COM_SCREENSHOT_OU_NOTA |

## Negativos

| Cenário | Resultado esperado | Resultado real |
| --- | --- | --- |
| Usar só teclado desde o início da página | Todos os controlos principais recebem foco visível | PREENCHER_COM_RESULTADO_REAL |
| Campo obrigatório vazio num formulário existente | Mensagem clara em português, sem bloquear a página | PREENCHER_COM_RESULTADO_REAL |
| Player sem interação de rato | Play/pause, progresso e seletores continuam alcançáveis | PREENCHER_COM_RESULTADO_REAL |

## Observações

- Não substituir placeholders por `PASS` sem execução real.
- Se a validação manual falhar, registar `FAIL`, página, largura e componente afetado.
- Não anexar cookies, tokens, passwords ou dados pessoais em screenshots ou logs.
```

5. Explicação do código.

Este ficheiro é Markdown, mas é um artefacto técnico de gate. Ele transforma validação visual/manual em prova rastreável, com comando, resultado real e evidence anexada.

Os placeholders `PREENCHER_COM_*` existem para evitar sucesso antecipado. Enquanto não houver execução real, o ficheiro não afirma `PASS`. Isto fecha o risco identificado no relatório de auditoria e protege `BK-MF6-06`, que vai consumir esta evidence.

A evidence cobre entradas do fluxo real: teclado, larguras de ecrã, páginas principais, formulários e player. A saída é uma matriz de proof/negativos. Não há dados pessoais a recolher; screenshots ou notas não devem incluir cookies, tokens ou informação sensível.

Podes acrescentar linhas se a equipa testar mais páginas, mas não apagues os negativos mínimos. Se uma linha falhar, o correto é escrever `FAIL` e abrir correção, não esconder o problema.

6. Validação do passo.

```bash
cd real_dev/frontend
npm run build
```

Resultado esperado: build sem erro e checklist manual preenchida com resultados reais.

7. Cenário negativo/erro esperado.

Se algum botão não tiver foco visível, se uma mensagem de erro não explicar o próximo passo, ou se o player não for alcançável por teclado, a linha correspondente deve ficar `FAIL` e o BK não deve entrar como fechado no gate.

#### Critérios de aceite

- `SkipLink` existe e funciona com teclado.
- `AppLayout` tem `main` com `id="conteudo-principal"` e `tabIndex={-1}`.
- O CSS do skip link é legível, aparece ao foco e não usa `display: none`.
- `AppHeader` mantém as rotas reais e usa textos visíveis em português de Portugal.
- O player mantém `controls`, `data-testid="faithflix-player"` e labels claras.
- Build frontend termina sem erro.
- A evidence cobre responsividade, teclado, botões, formulários e player.
- A evidence não contém `PASS` pré-preenchido antes da execução real.
- Não foram adicionadas dependências novas.
- Nenhuma regra de negócio, endpoint, cookie de sessão ou permissão foi alterada neste BK.

#### Validação final

```bash
cd real_dev/frontend
npm run build
```

Validação manual obrigatória:

- `Tab` mostra skip link no primeiro foco.
- `Enter` no skip link salta para o conteúdo principal.
- Navegação principal funciona a `390px`, `768px` e `1280px`.
- Header mostra textos claros e acentuados.
- Botões, links e selects têm foco visível.
- Player mantém controlos visíveis ou facilmente alcançáveis.
- Evidence usa resultados reais em vez de `PASS` antecipado.

#### Evidence para PR/defesa

- `pr`: referência do PR ou entrega local com `SkipLink`, layout, CSS, navegação e player revistos.
- `proof`: output do build, screenshots/notas por largura e checklist manual preenchida.
- `neg`: teclado apenas, campo obrigatório vazio e player sem rato.
- `fonte`: `RNF01`, `RNF02`, `RNF03`, `RNF04`, `RNF06`, `BK-MF6-02`, `BK-MF6-04`.

#### Handoff

`BK-MF6-06` deve receber `docs/evidence/MF6/BK-MF6-05-acessibilidade-ux.md` como uma das provas para o gate técnico final. O gate só deve marcar acessibilidade/UX como `PASS` quando a evidence tiver build real, validação manual real e negativos executados.

`BK-MF7-02` deve reutilizar estes resultados para a matriz RNF, distinguindo o que foi validado manualmente do que ficou como risco residual.

#### Changelog

- `2026-04-13`: guia inicial criado em formato genérico.
- `2026-06-18`: guia revisto com skip link, layout acessível, CSS e evidence final de UX.
- `2026-06-20`: corrigidos findings de evidence antecipada, revisão UX genérica e explicações/comentários didáticos insuficientes.
