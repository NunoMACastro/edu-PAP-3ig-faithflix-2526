# BK-MF7-01 - Inventário UI vs mockup e plano de refinamento

## Header

- `doc_id`: `GUIA-BK-MF7-01`
- `bk_id`: `BK-MF7-01`
- `macro`: `MF7`
- `owner`: `Mateus`
- `apoio`: `Kaue`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF6-06`
- `rf_rnf`: `transversal`
- `fase_documental`: `Fase 3`
- `sprint`: `S11`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF7-02`
- `guia_path`: `docs/planificacao/guias-bk/MF7/BK-MF7-01-inventario-ui-vs-mockup-plano-refinamento.md`
- `last_updated`: `2026-06-23`

#### Objetivo

Neste BK vais comparar a interface atual do FaithFlix com o mockup e transformar diferenças visuais em critérios objetivos de refinamento.

O resultado observável é o ficheiro `docs/evidence/MF7/INVENTARIO-UI-MOCKUP.md`, com pelo menos 20 verificações de UI, navegação, responsividade, acessibilidade e segurança percebida. Este inventário é a entrada direta de `BK-MF7-02`, `BK-MF7-03` e `BK-MF7-04`.

#### Importância

Antes de alterar componentes, é preciso saber o que está errado, onde está errado e que risco cria na defesa PAP. Este BK evita mudanças por gosto pessoal e força a equipa a separar três categorias: segurança de navegação, coerência visual e melhorias de usabilidade.

Também preserva o gate técnico de `BK-MF6-06`: a MF7 refina a experiência, mas não reescreve backend, autenticação, catálogo, pagamentos simulados ou pool solidária.

#### Scope-in

- Rever a UI pública e autenticada já existente em `frontend/`.
- Consultar o mockup apenas como referência visual e de fluxo.
- Criar uma matriz de discrepâncias com severidade, ficheiro provável, critério de fecho e BK destino.
- Separar problemas de navegação segura de problemas estéticos.
- Registar cenários negativos que bloqueiam o avanço para os BKs seguintes.

#### Scope-out

- Implementar já as correções visuais.
- Alterar código backend.
- Criar requisitos novos de produto.
- Fazer redesenho total da aplicação.
- Tratar a imagem do mockup como regra funcional.

#### Estado antes e depois

- Estado antes: `BK-MF6-06` fechou a validação técnica final da MF6.
- Estado antes: a equipa tem páginas funcionais, mas ainda não tem uma leitura objetiva da distância entre UI atual e mockup.
- Estado depois: existe um inventário priorizado, verificável e ligado aos BKs seguintes.
- Estado depois: `BK-MF7-02` sabe exatamente que problemas de sessão, perfil e links administrativos deve resolver.

#### Pré-requisitos

- Ler `docs/planificacao/guias-bk/REESTRUTURACAO-MF7-MF8.md`.
- Ler `docs/planificacao/backlogs/MF-VIEWS.md`, secção `MF7 - Refinamento de UI e navegacao segura`.
- Ler `docs/planificacao/backlogs/BACKLOG-MVP.md`, linhas da MF7.
- Ler `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, entradas de `BK-MF7-02`, `BK-MF7-03` e `BK-MF7-04`.
- Rever `mockup/src/app/FAITHFLIX_INTERFACE_SPECS.md`.
- Rever `frontend/src/components/layout/AppHeader.jsx`, `frontend/src/routes/AppRoutes.jsx`, `frontend/src/styles/tokens.css`, `frontend/src/styles/global.css` e as páginas principais em `frontend/src/pages/`.

#### Glossário

- Inventário UI: lista verificável de diferenças entre a aplicação e o objetivo visual.
- Discrepância: diferença concreta que afeta clareza, navegação, responsividade, acessibilidade ou confiança.
- Severidade: impacto da discrepância no produto e na defesa.
- Critério de fecho: condição objetiva para dizer que a discrepância ficou resolvida.
- Handoff: informação que o BK seguinte recebe para continuar sem adivinhar.

#### Conceitos teóricos essenciais

- `CANONICO`: a MF7 atual é refinamento de UI e navegação segura, conforme `REESTRUTURACAO-MF7-MF8.md`.
- `CANONICO`: o mockup orienta fluxo, linguagem visual, hierarquia e nomes visíveis, mas não define endpoints nem permissões.
- `DERIVADO`: discrepâncias de navegação administrativa têm prioridade sobre preferências visuais, porque podem expor caminhos que um visitante não deve usar.
- Uma UI defensável é coerente, responsiva, acessível e fácil de explicar na defesa.
- Um inventário útil não diz apenas "melhorar header"; diz qual ficheiro rever, qual comportamento observar e que prova fecha o problema.

#### Arquitetura do BK

| Camada | Artefacto | Responsabilidade |
| --- | --- | --- |
| Mockup | `mockup/src/app/FAITHFLIX_INTERFACE_SPECS.md` | Referência visual, paleta, componentes e fluxo. |
| Frontend | `frontend/src/...` | Páginas, header, layout, tokens, estados e navegação visível. |
| Evidence | `docs/evidence/MF7/INVENTARIO-UI-MOCKUP.md` | Inventário priorizado e auditável. |
| Handoff | `BK-MF7-02` | Lista de riscos ligados a sessão, perfil, roles e links admin. |

#### Ficheiros a criar/editar/rever

- CRIAR: `docs/evidence/MF7/INVENTARIO-UI-MOCKUP.md`
- REVER: `mockup/src/app/FAITHFLIX_INTERFACE_SPECS.md`
- REVER: `frontend/src/components/layout/AppHeader.jsx`
- REVER: `frontend/src/routes/AppRoutes.jsx`
- REVER: `frontend/src/layouts/AppLayout.jsx`
- REVER: `frontend/src/styles/tokens.css`
- REVER: `frontend/src/styles/global.css`
- REVER: `frontend/src/pages/DiscoveryHomePage.jsx`
- REVER: `frontend/src/pages/CatalogPage.jsx`
- REVER: `frontend/src/pages/SearchPage.jsx`
- REVER: `frontend/src/pages/ForYouPage.jsx`
- REVER: `frontend/src/pages/MyLibraryPage.jsx`
- REVER: `frontend/src/pages/SubscriptionPage.jsx`
- REVER: `frontend/src/pages/PublicCharitiesPage.jsx`
- REVER: `frontend/src/pages/AccountPage.jsx`

#### Tutorial técnico linear

### Passo 1 - Confirmar fontes e fronteira do BK

1. Objetivo funcional do passo no contexto da app.

Confirmar que a MF7 vai refinar UI e navegação, sem alterar requisitos funcionais nem reabrir a MF6.

2. Ficheiros envolvidos:
    - REVER: `docs/planificacao/guias-bk/REESTRUTURACAO-MF7-MF8.md`
    - REVER: `docs/planificacao/backlogs/MF-VIEWS.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - REVER: `mockup/src/app/FAITHFLIX_INTERFACE_SPECS.md`
    - LOCALIZAÇÃO: secções MF7, paleta, header, hero, páginas públicas e responsividade.

3. Instruções do que fazer.

Lê as fontes e escreve, no topo da evidence, três decisões:

- `CANONICO`: MF7 é refinamento de UI e navegação segura.
- `CANONICO`: MF8 concentra evidências finais e defesa.
- `DERIVADO`: discrepâncias de links admin e perfil bloqueiam antes de discrepâncias estéticas.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental e prepara a evidence.

5. Explicação do código.

Não existe código porque ainda não há alteração técnica. A decisão importante é impedir que o inventário se transforme em lista subjetiva de preferências. A equipa deve conseguir apontar para documentos e dizer porque cada discrepância existe.

6. Validação do passo.

Confirma que a evidence menciona a cadeia `BK-MF6-06 -> BK-MF7-01 -> BK-MF7-02` e não volta a tratar MF7 como fase principal de defesa.

7. Cenário negativo/erro esperado.

Se alguém classificar "mudar a cor porque fica mais bonito" sem ficheiro, critério de fecho e impacto, a linha deve ficar bloqueada até ter evidência objetiva.

### Passo 2 - Criar a evidence de inventário

1. Objetivo funcional do passo no contexto da app.

Criar o ficheiro que vai guardar a comparação entre app atual, mockup e plano dos BKs seguintes.

2. Ficheiros envolvidos:
    - CRIAR: `docs/evidence/MF7/INVENTARIO-UI-MOCKUP.md`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria o ficheiro abaixo e preenche as linhas enquanto fazes a revisão. Mantém os IDs `UI-01` a `UI-20`, porque os BKs seguintes podem referenciar esses IDs.

4. Código completo, correto e integrado com a app final.

```md
# Inventário UI vs mockup - MF7

## Metadados

- BK: BK-MF7-01
- Owner: Mateus
- Data: 2026-06-23
- Dependência validada: BK-MF6-06
- Decisão: EM_REVISAO

## Decisões de referência

- CANONICO: MF7 foca refinamento de UI e navegação segura.
- CANONICO: o mockup orienta aparência, fluxo e hierarquia visual.
- DERIVADO: problemas que expõem links admin a visitantes ou utilizadores comuns têm prioridade P0.

## Matriz de verificações

| ID | Área | Ficheiro provável | Observado | Esperado | Severidade | BK destino | Critério de fecho |
| --- | --- | --- | --- | --- | --- | --- | --- |
| UI-01 | Header público | frontend/src/components/layout/AppHeader.jsx | A preencher | Links públicos claros e sem ruído admin | P0 | BK-MF7-02 | Visitante não vê links admin |
| UI-02 | Sessão | frontend/src/context/SessionContext.jsx | A preencher | Estado anonymous/user/admin explícito | P0 | BK-MF7-02 | /api/session/me decide o perfil |
| UI-03 | Rotas admin | frontend/src/routes/AppRoutes.jsx | A preencher | Guard visual antes das páginas admin | P0 | BK-MF7-02 | User comum recebe bloqueio visual |
| UI-04 | Tokens | frontend/src/styles/tokens.css | A preencher | Paleta alinhada ao mockup | P1 | BK-MF7-03 | Cores base usam tokens nomeados |
| UI-05 | Header responsivo | frontend/src/styles/global.css | A preencher | Header não sobrepõe conteúdo em mobile | P1 | BK-MF7-03 | Viewport 390px sem overflow horizontal |
| UI-06 | Hero | frontend/src/pages/DiscoveryHomePage.jsx | A preencher | H1, badge, descrição e CTAs claros | P1 | BK-MF7-03 | Primeiro ecrã comunica produto |
| UI-07 | Focus visível | frontend/src/styles/global.css | A preencher | Foco por teclado visível | P1 | BK-MF7-03 | Tab mostra outline claro |
| UI-08 | Catálogo | frontend/src/pages/CatalogPage.jsx | A preencher | Cards com imagem, badge e metadados | P1 | BK-MF7-04 | Lista publicada é legível |
| UI-09 | Pesquisa | frontend/src/pages/SearchPage.jsx | A preencher | Resultados e vazio comunicam ação | P1 | BK-MF7-04 | Pesquisa sem resultados mostra orientação |
| UI-10 | Para si | frontend/src/pages/ForYouPage.jsx | A preencher | Cold start explicado sem prometer IA avançada | P1 | BK-MF7-04 | Estado vazio é honesto |
| UI-11 | Biblioteca | frontend/src/pages/MyLibraryPage.jsx | A preencher | Favoritos/watchlist/histórico usam estados úteis | P1 | BK-MF7-04 | Secções vazias explicam próximo passo |
| UI-12 | Planos | frontend/src/pages/SubscriptionPage.jsx | A preencher | Subscrição usa linguagem de simulação controlada | P1 | BK-MF7-04 | Estado de erro é claro |
| UI-13 | Associações | frontend/src/pages/PublicCharitiesPage.jsx | A preencher | Candidatura e histórico têm rótulos compreensíveis | P1 | BK-MF7-04 | Utilizador entende o fluxo solidário |
| UI-14 | Conta | frontend/src/pages/AccountPage.jsx | A preencher | Dados pessoais e privacidade separados | P1 | BK-MF7-04 | Secções não se confundem |
| UI-15 | PT-PT | frontend/src/pages | A preencher | Texto visível com acentuação correta | P1 | BK-MF7-04 | Não há mensagens sem acentos por descuido |
| UI-16 | Viewport mobile | frontend/src/styles/global.css | A preencher | Sem sobreposição em 390x844 | P0 | BK-MF7-05 | Screenshot ou descrição verificável |
| UI-17 | Viewport tablet | frontend/src/styles/global.css | A preencher | Grelhas mantêm hierarquia | P1 | BK-MF7-05 | Screenshot ou descrição verificável |
| UI-18 | Viewport desktop | frontend/src/styles/global.css | A preencher | Conteúdo não fica disperso | P1 | BK-MF7-05 | Screenshot ou descrição verificável |
| UI-19 | Teclado | frontend/src/components/a11y/SkipLink.jsx | A preencher | Skip link e foco funcionam | P0 | BK-MF7-05 | Tab chega ao conteúdo principal |
| UI-20 | Gate | docs/evidence/MF7/GATE-UI-NAVEGACAO-SEGURA.md | A preencher | Decisão GO/GO_COM_RESSALVAS/NO_GO | P0 | BK-MF7-05 | Gate assinado com negativos |

## Handoff para BK-MF7-02

- Riscos P0 de sessão/perfil:
- Links admin visíveis indevidamente:
- Rotas admin sem guarda visual:
- Negativos obrigatórios:

## Changelog

- 2026-06-23: ficheiro criado para inventário MF7.
```

5. Explicação do código.

Este bloco é o conteúdo completo da evidence inicial. A tabela força cada observação a ter área, ficheiro provável, esperado, severidade, BK destino e critério de fecho. Isto evita uma lista vaga e prepara a sequência da MF7: primeiro navegação segura, depois visual, depois páginas, depois gate.

6. Validação do passo.

Confirma que o ficheiro existe e que tem 20 linhas `UI-`. Resultado esperado:

```bash
rg -n "^\\| UI-" docs/evidence/MF7/INVENTARIO-UI-MOCKUP.md
```

7. Cenário negativo/erro esperado.

Se o ficheiro tiver menos de 20 verificações, o BK não pode fechar porque os BKs seguintes ficam sem base objetiva.

### Passo 3 - Preencher o inventário por ecrã

1. Objetivo funcional do passo no contexto da app.

Transformar observações visuais em trabalho priorizado.

2. Ficheiros envolvidos:
    - REVER: `frontend/src/components/layout/AppHeader.jsx`
    - REVER: `frontend/src/pages/DiscoveryHomePage.jsx`
    - REVER: `frontend/src/pages/CatalogPage.jsx`
    - REVER: `frontend/src/pages/SearchPage.jsx`
    - REVER: `frontend/src/pages/ForYouPage.jsx`
    - REVER: `frontend/src/pages/MyLibraryPage.jsx`
    - REVER: `frontend/src/pages/SubscriptionPage.jsx`
    - REVER: `frontend/src/pages/PublicCharitiesPage.jsx`
    - REVER: `frontend/src/pages/AccountPage.jsx`
    - LOCALIZAÇÃO: navegação, hero, cards, estados de loading/error/empty/success e textos visíveis.

3. Instruções do que fazer.

Percorre cada página e escreve o observado na evidence. Usa estas regras:

- `P0`: expõe área admin, quebra navegação por perfil, impede teclado ou bloqueia mobile.
- `P1`: degrada clareza, responsividade, acessibilidade ou consistência visual.
- `P2`: melhoria visual pequena sem risco funcional.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. O trabalho é análise guiada da interface.

5. Explicação do código.

Não há alteração técnica porque este BK cria o plano. O valor está na rastreabilidade: cada problema passa a ter destino e critério de fecho. Assim, `BK-MF7-02` não mistura sessão com paleta, e `BK-MF7-03` não tenta resolver regras de autorização.

6. Validação do passo.

Cada linha `UI-` deve ter `Observado`, `Esperado`, `Severidade`, `BK destino` e `Critério de fecho` preenchidos.

7. Cenário negativo/erro esperado.

Se uma discrepância de segurança visual for marcada como `P2`, corrige a severidade. Links admin visíveis a visitante são `P0`.

### Passo 4 - Fechar handoff para a MF7

1. Objetivo funcional do passo no contexto da app.

Garantir que o inventário desbloqueia os BKs seguintes sem criar trabalho fora da MF7.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF7/INVENTARIO-UI-MOCKUP.md`
    - REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-02-navegacao-segura-por-sessao-e-perfil.md`
    - REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-03-layout-tokens-header-alinhados-mockup.md`
    - REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-04-refinamento-paginas-principais-estados-ux.md`
    - LOCALIZAÇÃO: secção `Handoff para BK-MF7-02`.

3. Instruções do que fazer.

No final da evidence, escreve:

- problemas P0 que entram em `BK-MF7-02`;
- melhorias visuais que entram em `BK-MF7-03`;
- estados de páginas que entram em `BK-MF7-04`;
- pontos a validar no gate `BK-MF7-05`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo fecha a passagem de trabalho.

5. Explicação do código.

O handoff é uma decisão de arquitetura documental. Ele impede que o próximo BK repita auditoria e ajuda a equipa a defender porque cada alteração foi feita.

6. Validação do passo.

Confirma que a evidence tem uma secção `Handoff para BK-MF7-02` com pelo menos três riscos P0 ou a frase `Sem riscos P0 encontrados` acompanhada de prova.

7. Cenário negativo/erro esperado.

Se o handoff disser apenas "continuar refinamento", o BK fica incompleto porque o próximo aluno não sabe o que fazer.

#### Critérios de aceite

- Existe `docs/evidence/MF7/INVENTARIO-UI-MOCKUP.md`.
- A evidence tem 20 verificações `UI-01` a `UI-20`.
- Cada verificação tem severidade, ficheiro provável, BK destino e critério de fecho.
- Problemas de navegação segura estão separados de preferências visuais.
- O handoff para `BK-MF7-02` está preenchido.

#### Validação final

- Executar `rg -n "^\\| UI-" docs/evidence/MF7/INVENTARIO-UI-MOCKUP.md`.
- Executar `bash scripts/validate-planificacao.sh`.
- Executar `git diff --check`.
- Confirmar que a evidence não contém caminhos de trabalho do docente nem comandos fora das raízes públicas.

#### Evidence para PR/defesa

- `pr`: referência da entrega deste BK.
- `proof`: `docs/evidence/MF7/INVENTARIO-UI-MOCKUP.md`.
- `neg`: inventário com risco P0 tratado como bloqueante.
- `fonte`: `REESTRUTURACAO-MF7-MF8.md`, `MF-VIEWS.md`, `BACKLOG-MVP.md`, mockup e páginas `frontend/`.

#### Handoff

- `BK-MF7-02` recebe a lista de links, rotas e perfis a proteger.
- `BK-MF7-03` recebe a lista de tokens, header e hero a alinhar.
- `BK-MF7-04` recebe a lista de páginas e estados de UX a refinar.
- `BK-MF7-05` recebe os critérios que terá de validar no gate.

#### Changelog

- `2026-06-22`: guia criado/reestruturado na reorganização documental MF7/MF8.
- `2026-06-23`: guia atualizado com evidence completa, critérios objetivos e handoff real para a MF7.
