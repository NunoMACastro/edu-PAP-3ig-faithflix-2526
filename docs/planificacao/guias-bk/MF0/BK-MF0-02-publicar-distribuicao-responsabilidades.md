# BK-MF0-02 - Publicar distribuicao de responsabilidades

## Header

- `doc_id`: `GUIA-BK-MF0-02`
- `bk_id`: `BK-MF0-02`
- `macro`: `MF0`
- `owner`: `Nuno`
- `apoio`: `-`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF0-01`
- `rf_rnf`: `transversal`
- `fase_documental`: `Fase 1`
- `sprint`: `S01`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF0-03`
- `guia_path`: `docs/planificacao/guias-bk/MF0/BK-MF0-02-publicar-distribuicao-responsabilidades.md`
- `last_updated`: `2026-05-25`

## Bloco pedagogico (obrigatorio)

Este BK ensina a equipa a separar ownership, apoio e validação. Para alunos de 12.º ano, isto evita uma confusão comum: "todos fazem tudo" parece colaborativo, mas em projeto real costuma gerar buracos de responsabilidade.

## Bloco operacional (obrigatorio)

O trabalho operacional é publicar e validar `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`, reutilizando o plano total fechado em `BK-MF0-01` e preparando o backlog atómico de `BK-MF0-03`.

#### BK-MF0-02 - Publicar distribuicao de responsabilidades

##### O que vamos fazer neste BK

Neste BK vamos transformar o plano total numa distribuição concreta de responsabilidades. A equipa do FaithFlix tem quatro alunos com papéis técnicos diferentes: Matheus em backend/segurança, Mateus em frontend/UX, Davi em dados/pesquisa/recomendações/métricas e Kaue em QA/operação/evidências. O papel do Nuno fica separado como orientação, governance, avaliação e gates.

O resultado esperado é um documento que diga quem decide, quem implementa, quem apoia e quem valida cada área. Isto é fundamental porque as fases seguintes vão cruzar frontend, backend, dados, segurança e evidências. Sem ownership claro, `MF1` pode começar com estrutura técnica fragmentada.

A fase foi detalhada sem mockup. Como este BK não define UI, a ausência de mockup não bloqueia a distribuição de responsabilidades.

##### Porque e que isto e importante

- Evita que BKs críticos fiquem sem dono real.
- Ajuda os alunos a perceber que "owner" não significa trabalhar sozinho; significa responder pelo fecho do BK.
- Prepara pairing e handoff semanal, que são mecanismos pedagógicos obrigatórios.
- Desbloqueia `BK-MF0-03`, porque o backlog atómico precisa de owner e apoio por BK.
- Protege a arquitetura futura: backend, frontend, dados e QA ficam com responsabilidades explícitas.

##### O que entra (scope)

- Rever `DISTRIBUICAO-RESPONSABILIDADES.md`.
- Confirmar equipa, áreas funcionais, matriz por artefacto e cerimónias.
- Confirmar que Nuno não fica como owner de implementação core recorrente.
- Confirmar que cada BK do backlog tem owner único.
- Preparar evidência de que a distribuição bate certo com o plano total e o backlog.

##### O que nao entra (scope-out)

- Trocar owners do backlog sem decisão explícita do orientador.
- Mudar prioridades, dependências ou RF/RNF.
- Criar subtarefas pessoais fora do backlog canónico.
- Definir horários finais de reuniões além das cerimónias e regras já documentadas.
- Criar regras de negócio do produto.

##### Como saber que isto ficou bem

- Cada área técnica tem owner principal, apoio e revisor/gate.
- Cada artefacto técnico tem dono claro.
- A equipa consegue explicar a diferença entre owner, apoio e revisor.
- A distribuição não contradiz `BACKLOG-MVP.md`.
- O próximo BK consegue usar esta distribuição para confirmar ownership do backlog.

#### Metadados do BK (CANONICO/DERIVADO):

- Prioridade: `P0` (CANONICO, `BACKLOG-MVP.md`)
- Estado: `TODO` (CANONICO, `BACKLOG-MVP.md`)
- Esforco: `S` (CANONICO, `BACKLOG-MVP.md`)
- macro: `MF0` (CANONICO, `BACKLOG-MVP.md`)
- Owner: `Nuno` (CANONICO, `BACKLOG-MVP.md`)
- Apoio: `-` (CANONICO, `BACKLOG-MVP.md`)
- Dependencias (BK IDs): `BK-MF0-01` (CANONICO, `BACKLOG-MVP.md`)
- Pre-condicoes: plano total publicado/validado em `BK-MF0-01` (DERIVADO)
- Ref. Plano: `PLANO-IMPLEMENTACAO-TOTAL > Assuncoes de execucao` e `DISTRIBUICAO-RESPONSABILIDADES` (CANONICO)
- Flow ID: `MF0-governance-kickoff-02` (DERIVADO)
- Fonte de verdade: `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- Fonte de verdade: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- Fonte de verdade: `docs/planificacao/sprints/PLANO-SPRINTS.md`
- Descricao: publicar responsabilidade por aluno, área, artefacto e cerimónia para sustentar execução dos BKs seguintes (DERIVADO)

#### O que vamos fazer neste BK (DERIVADO):

- Confirmar a equipa: `Matheus`, `Mateus`, `Davi`, `Kaue` e `Nuno`.
- Confirmar responsabilidades por área funcional e por artefacto técnico.
- Garantir que `owner`, `apoio` e `revisor/gate` não são usados como sinónimos.
- Confirmar que handoff semanal P0 e pairing semanal estão definidos.
- Preparar uma checklist que `BK-MF0-03` usa para validar owners do backlog.

#### Estado, ficheiros e impacto (DERIVADO):

- Estado esperado antes do BK: plano total validado em `BK-MF0-01`; responsabilidades ainda podem estar dispersas.
- Estado esperado depois do BK: owners, apoios, cerimónias, pairing e handoff P0 publicados.
- Ficheiros a criar: nenhum.
- Ficheiros a editar: apenas este guia se forem registados ajustes/evidence do BK.
- Ficheiros a rever: `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`, `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`, `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`.
- Dependencias de BK anteriores e uso: reutiliza `BK-MF0-01` para garantir que responsabilidades derivam do plano total.
- Impacto na arquitetura da app: separa liderança de backend, frontend, dados, QA, operação e gates antes de existir código.
- Impacto em frontend/backend/dados: define owners por área, mas não cria componentes, rotas, modelos ou endpoints.
- Impacto em segurança/testes/UI: atribui segurança/RGPD a Matheus/Kaue, QA/evidências a Kaue e UI/UX a Mateus.
- Handoff para o próximo BK: entregar a `BK-MF0-03` a matriz de owners/apoios para validar backlog atómico.

#### Pre-leitura minima (10-15 min) (DERIVADO):

- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`: equipa, limites e regras transversais.
- `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`: documento alvo.
- `docs/planificacao/backlogs/BACKLOG-MVP.md`: owners e apoios por BK.
- `docs/planificacao/sprints/PLANO-SPRINTS.md`: capacidade recomendada por aluno.
- `docs/planificacao/backlogs/MF-VIEWS.md`: sequência da MF0.
- Mockup: não existe; sem impacto neste BK.
- Código: não existe app detetável; sem ficheiros técnicos a rever.

#### Glossario (rapido) (DERIVADO):

- Owner: pessoa responsável por fechar o BK com evidência.
- Apoio: pessoa que ajuda, revê ou desbloqueia partes do BK.
- Revisor/gate: pessoa que valida se pode avançar.
- Handoff: passagem curta e objetiva de contexto para a equipa.
- Pairing: sessão em dupla para resolver bloqueios e transferir aprendizagem.
- Cerimónia: reunião curta com objetivo definido.
- Capacidade: quantidade realista de trabalho por sprint.
- RACI: modelo de responsabilidades; aqui usamos uma versão simples por owner/apoio/gate.

#### Conceitos teoricos essenciais (DERIVADO):

**Ownership.** Em engenharia de software, ownership significa que existe uma pessoa responsável por garantir que uma entrega fica completa, validada e documentada. Não significa que a pessoa faça tudo sozinha.

**Separação entre implementação e avaliação.** O Nuno aparece como orientador e gate, não como implementador core. Isto protege a avaliação e obriga os alunos a assumir responsabilidade técnica real.

**Pairing pedagógico.** Pairing não é dividir tarefas ao meio. É uma sessão com objetivo técnico claro, por exemplo ajudar a montar um middleware ou rever um teste. Na MF0 fica definido o mecanismo; em MF1 e seguintes será usado sobre código real.

**Handoff.** Handoff é a transferência de contexto: o que foi feito, o que falta, que riscos existem e que dependências continuam abertas. É obrigatório em BK P0 porque P0 impacta fases seguintes.

**Risco de responsabilidade difusa.** Quando todos são responsáveis, na prática ninguém é. Este BK reduz esse risco ao ligar cada área e artefacto a um owner principal.

#### Guia de execucao (passo-a-passo) (DERIVADO):

0. **Objetivo (~10 min): Confirmar dependência do plano total**
   - Descricao detalhada do objetivo: verificar que `BK-MF0-01` foi revisto antes de publicar responsabilidades.
   - Justificacao: responsabilidades derivam do plano, não de preferências soltas.
   - Como fazer (0.1): rever macro fases e equipa no plano total.
   - Como fazer (0.2): confirmar que `BK-MF0-02` depende de `BK-MF0-01`.
   - Ficheiro a rever: `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
   - Ficheiro alvo: `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
   - Snippet de referencia: `Equipa tecnica: Matheus, Mateus, Davi, Kaue`
   - O que verificar: a distribuição usa a mesma equipa do plano.

1. **Objetivo (~10 min): Validar equipa e carga alvo**
   - Descricao detalhada do objetivo: confirmar nomes, papéis gerais e percentagens de carga.
   - Justificacao: erros de nomes ou carga afetam toda a planificação.
   - Como fazer (1.1): comparar secção `Equipa` com `Capacidade recomendada` no plano de sprints.
   - Como fazer (1.2): confirmar que Nuno tem papel de orientação e não de implementação core.
   - Ficheiro a rever: `docs/planificacao/sprints/PLANO-SPRINTS.md`
   - Ficheiro alvo: `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
   - Snippet de referencia: `Nuno: governance, gate e avaliacao`
   - O que verificar: os nomes estão consistentes.

2. **Objetivo (~15 min): Validar matriz por área funcional**
   - Descricao detalhada do objetivo: confirmar que cada domínio do FaithFlix tem owner principal, apoio e revisor.
   - Justificacao: áreas como autenticação, catálogo, streaming e pool solidária cruzam vários BKs.
   - Como fazer (2.1): rever a tabela `Matriz por area funcional`.
   - Como fazer (2.2): comparar com os domínios do README e RF.
   - Ficheiro a rever: `docs/RF.md`
   - Ficheiro alvo: `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
   - Snippet de referencia: `Pool de associacoes | Davi | Kaue | Nuno`
   - O que verificar: nenhum domínio principal do MVP fica sem owner.

3. **Objetivo (~15 min): Validar matriz por artefacto**
   - Descricao detalhada do objetivo: confirmar quem responde por rotas, modelos, páginas, testes, métricas e evidências.
   - Justificacao: os BKs futuros vão pedir ficheiros concretos; a equipa deve saber quem lidera cada tipo de artefacto.
   - Como fazer (3.1): rever a tabela `Matriz por artefacto`.
   - Como fazer (3.2): cruzar com RNF27, RNF28, RNF29 e RNF30.
   - Ficheiro a rever: `docs/RNF.md`
   - Ficheiro alvo: `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
   - Snippet de referencia: `Testes E2E/integração | Kaue | Mateus`
   - O que verificar: QA/evidências têm dono claro.

4. **Objetivo (~15 min): Cruzar owners com backlog**
   - Descricao detalhada do objetivo: confirmar que cada BK em `BACKLOG-MVP.md` tem owner único e apoio coerente.
   - Justificacao: a distribuição só é útil se bater certo com o backlog operacional.
   - Como fazer (4.1): rever a tabela da `MF1` e confirmar owners técnicos.
   - Como fazer (4.2): rever uma amostra de `MF2..MF6` para validar áreas funcionais.
   - Ficheiro a rever: `docs/planificacao/backlogs/BACKLOG-MVP.md`
   - Ficheiro alvo: `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
   - Snippet de referencia: `BK-MF1-01 | Matheus | Davi`
   - O que verificar: não há BK sem owner.

5. **Objetivo (~10 min): Validar cerimónias**
   - Descricao detalhada do objetivo: confirmar que planning, sync, review, retro, gate, handoff e pairing têm frequência e resultado.
   - Justificacao: cerimónias sem output viram reuniões sem valor.
   - Como fazer (5.1): rever a tabela `Cerimonias`.
   - Como fazer (5.2): confirmar que cada cerimónia tem owner e resultado.
   - Ficheiro a rever: `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
   - Ficheiro alvo: `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
   - Snippet de referencia: `Handoff BK P0 | semanal | Owner do BK P0`
   - O que verificar: todas as cerimónias têm propósito verificável.

6. **Objetivo (~10 min): Confirmar mecanismos pedagógicos**
   - Descricao detalhada do objetivo: garantir que handoff P0 e pairing semanal estão escritos como ações concretas.
   - Justificacao: a PAP avalia produto e processo; aprendizagem transferida precisa de registo.
   - Como fazer (6.1): rever `Handoff semanal de BK P0`.
   - Como fazer (6.2): rever `Pairing semanal (60-90 min)`.
   - Ficheiro a rever: `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
   - Ficheiro alvo: `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
   - Snippet de referencia: `1 aprendizagem transferida registada`
   - O que verificar: o mecanismo é executável por alunos.

7. **Objetivo (~10 min): Executar negativos documentais**
   - Descricao detalhada do objetivo: procurar falhas típicas na distribuição.
   - Justificacao: um erro de ownership propaga-se para todos os BKs.
   - Como fazer (7.1): procurar BK sem owner no backlog.
   - Como fazer (7.2): procurar área funcional sem owner principal.
   - Ficheiro a rever: `docs/planificacao/backlogs/BACKLOG-MVP.md`
   - Ficheiro alvo: `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
   - Snippet de referencia: `Cada BK tem owner unico`
   - O que verificar: pelo menos 3 negativos P0 ficam registados.

8. **Objetivo (~10 min): Fechar evidence e handoff**
   - Descricao detalhada do objetivo: preparar evidência e entregar a `BK-MF0-03` a distribuição validada.
   - Justificacao: o backlog atómico precisa desta distribuição para confirmar owners/apoios por BK.
   - Como fazer (8.1): preencher `pr`, `proof` e `neg`.
   - Como fazer (8.2): entregar resumo de owners por área a quem vai validar backlog.
   - Ficheiro a rever: `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
   - Ficheiro alvo: `docs/planificacao/guias-bk/MF0/BK-MF0-02-publicar-distribuicao-responsabilidades.md`
   - Snippet de referencia: `proximo_bk: BK-MF0-03`
   - O que verificar: `BK-MF0-03` consegue reutilizar owners sem decidir tudo outra vez.

#### Checklist de validacao (DERIVADO):

**Smoke**
- [ ] `DISTRIBUICAO-RESPONSABILIDADES.md` existe e está ativo.
- [ ] Equipa e papéis gerais coincidem com o plano total.
- [ ] Cada área funcional tem owner, apoio e revisor/gate.

**Negativos**
- [ ] Passo: 4; input/acao: procurar BK sem owner; resultado esperado: nenhum BK sem owner; risco que cobre: trabalho sem responsável.
- [ ] Passo: 2; input/acao: procurar área funcional sem owner principal; resultado esperado: nenhuma área sem owner; risco que cobre: domínio crítico abandonado.
- [ ] Passo: 1; input/acao: verificar se Nuno aparece como implementador core recorrente; resultado esperado: Nuno fica em governance/gate; risco que cobre: avaliação misturada com implementação.

**Tecnico**
- [ ] Owners do backlog não foram alterados.
- [ ] A distribuição reforça RNF27, RNF28, RNF29 e RNF30 sem criar novas dependências.
- [ ] O próximo BK recomendado é `BK-MF0-03`.

**Regressao das fases anteriores**
- [ ] `BK-MF0-01` continua como dependência e fonte do plano.

**UI/mockup**
- [ ] Sem mockup; este BK não define navegação, layout ou componentes.

**Seguranca**
- [ ] Áreas de autenticação, sessão, RGPD e segurança têm owners claros.
- [ ] Nenhuma credencial, segredo ou conta real é registada no documento.

#### Criterios de aceite:

**Outputs:**
- Documento de distribuição revisto e publicável.
- Resumo de owner/apoio por área pronto para usar no backlog.

**Verificacoes:**
- 100% dos BKs do backlog têm owner.
- Nuno aparece como orientação/gate, não como owner core recorrente.
- Handoff P0 e pairing semanal estão documentados.

**Qualidade:**
- Responsabilidades escritas de forma clara para alunos.
- Sem drift em owner, prioridade ou dependências.

**Continuidade:**
- `BK-MF0-03` usa esta distribuição para validar o backlog atómico.
- `MF1` fica com Matheus/Mateus/Davi/Kaue preparados para áreas técnicas.

**Evidencia:**
- `pr`, `proof` e `neg` preenchidos antes de marcar `DONE`.

#### Evidence (para o PR/defesa):

- `pr`: `A preencher no fecho do BK`
- `proof`: `A preencher apos validacao`
- `neg`: `A preencher apos testes negativos`
- `files`: `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`, `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `commands`: `bash scripts/validate-planificacao.sh`
- `screenshots`: `Nao aplicavel; BK documental sem UI`
- `notes`: `Fase detalhada sem mockup e sem codigo de app existente`

#### TODOs

- TODO: preencher evidence real quando a equipa executar a validação.
- TODO: confirmar em reunião se todos os alunos aceitam owner/apoio atribuídos.
- TODO (BLOCKER): se algum aluno mudar de disponibilidade, atualizar distribuição e backlog no mesmo ciclo.
- FOLLOW-UP: usar owners validados em `BK-MF0-03`.
- Assuncao a validar com o orientador: a distribuição por áreas continua adequada antes de arrancar `MF1`.
- Decisao dependente de mockup: nenhuma nesta fase.
- Decisao dependente de app/codigo ainda inexistente: responsabilidades por ficheiros concretos só serão fechadas em `MF1`.

## Snippet tecnico aplicavel

```text
CHECK BK-MF0-02
1. plano_total.aprovado == true
2. todos_bk.tem_owner_unico == true
3. areas_funcionais.tem_owner_e_apoio == true
4. nuno.papel in ["governance", "gate", "avaliacao"]
5. pairing_e_handoff.documentados == true
```

## Proximo BK recomendado

`BK-MF0-03`

## Changelog

- `2026-04-13`: retrofit para contrato pedagogico v3 (objetivo especifico, pre-condicoes, outputs, snippet e proximo BK real).
- `2026-05-25`: refinado para guia executável de ownership, pairing e handoff da MF0.
