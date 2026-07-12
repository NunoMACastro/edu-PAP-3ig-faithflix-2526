# Evidence BK-MF6-05 - Acessibilidade e UX final

- `document_status`: `HISTORICAL_SNAPSHOT`
- `snapshot_date`: `2026-06-22`
- `implementation_lane`: `REFERENCE`
- `current_authority`: `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-END-TO-END-real_dev.md`
- `proof_scope`: validação local de 2026-06-22; browsers branded e Safari real não executados

- Owner: Mateus
- Apoio: Kaue
- Data: 2026-06-22
- Requisitos: RNF01, RNF02, RNF03, RNF04, RNF06
- Referência de entrega: execução local em `real_dev/frontend`, sem commit por `PERMITIR_COMMITS: nao`

> **Snapshot histórico de 2026-06-22:** resultados preservados sem
> reexecução. A matriz manual branded/Safari atual continua pendente.

## Comandos executados

| Comando | Resultado real | Evidence anexada |
| --- | --- | --- |
| `npm run build` em `real_dev/frontend` | PASS | Vite transformou 101 módulos e concluiu build em 537ms. |
| `node scripts/check-frontend-regression.mjs` em `real_dev/frontend` | PASS | `Regressao frontend MF6: PASS`, incluindo contratos de `SkipLink`, `main`, navegação e player. |
| `node /private/tmp/faithflix-verify-mf6-a11y.mjs` na raiz do projeto | PASS | Playwright externo validou foco, skip link, responsividade, formulário obrigatório, semântica de `main` e labels do player. |
| `rg -n "<main\|</main>" real_dev/frontend/src/pages real_dev/frontend/src/components real_dev/frontend/src/layouts` | PASS | Apenas `real_dev/frontend/src/layouts/AppLayout.jsx` contém o `main#conteudo-principal`. |

## Proof

| Verificação | Resultado real | Evidence anexada |
| --- | --- | --- |
| Skip link visível ao primeiro foco por teclado | PASS | Playwright: `skip link recebe primeiro foco`. |
| `Enter` no skip link move o foco para `#conteudo-principal` | PASS | Playwright: `skip link salta para conteudo principal`. |
| Navegação principal clara em `/`, `/catalogo`, `/pesquisa`, `/planos`, `/associacoes` e `/conta` | PASS | Header revisto com `Início`, `Catálogo`, `Associações`, `Métricas`, `Integrações` e `aria-label="Navegação principal"`; rotas preservadas. |
| Layout mantém hierarquia a 390px | PASS | Playwright: `layout renderiza em 390px`, sem overflow horizontal observado. |
| Layout mantém hierarquia a 768px | PASS | Playwright: `layout renderiza em 768px`, sem overflow horizontal observado. |
| Layout mantém hierarquia a 1280px | PASS | Playwright: `layout renderiza em 1280px`, sem overflow horizontal observado. |
| Botões, links e selects têm foco visível | PASS | CSS global mantém `:focus-visible`; `SkipLink`, `NavLink`, botões nativos e selects continuam no fluxo de teclado. |
| Player em `/ver/:contentId` mantém controlos acessíveis por teclado | PASS | Componente preserva `controls`, `data-testid="faithflix-player"`, `role="group"` nos controlos e labels `Áudio`, `Automática`, `Opções de média`. |
| Semântica do conteúdo principal | PASS | Só existe um `main` no layout; páginas antigas com `<main>` foram convertidas para `section.page-section`. |

## Negativos

| Cenário | Resultado esperado | Resultado real |
| --- | --- | --- |
| Usar só teclado desde o início da página | Todos os controlos principais recebem foco visível | PASS: primeiro foco chega ao skip link e `Enter` move o foco para `#conteudo-principal`. |
| Campo obrigatório vazio num formulário existente | Mensagem/validação clara sem bloquear a página | PASS: formulário de candidatura de associação tem 4+ campos `required` e `form.checkValidity()` devolveu `false` antes de submissão. |
| Player sem interação de rato | Play/pause, progresso e seletores continuam alcançáveis | PASS: `<video controls>` foi preservado e os seletores de legendas, áudio e qualidade continuam em `<label><select>`. |

## Observações

- A primeira tentativa de servidor Vite dentro da sandbox falhou com `listen EPERM` em `127.0.0.1:4175`; a validação visual foi repetida fora da sandbox.
- A verificação Playwright foi executada sem API backend local; por isso a página `/ver/demo-content` pode mostrar erro de dados, mas o contrato do player foi validado no componente fonte e no build.
- Nenhuma screenshot, log ou output inclui cookies, tokens, passwords ou dados pessoais.
- Não foram adicionadas dependências novas.

## Handoff para BK-MF6-06

- `pr`: entrega local com `SkipLink`, layout, CSS, navegação, player e wrappers semânticos revistos.
- `proof`: build Vite, regressão frontend, Playwright em 390px/768px/1280px e pesquisa de `main`.
- `neg`: teclado apenas, formulário obrigatório vazio e player sem rato.
- `risco residual`: validação visual manual foi automatizada por Playwright local; uma revisão humana com screenshots reais ainda pode complementar a defesa.
