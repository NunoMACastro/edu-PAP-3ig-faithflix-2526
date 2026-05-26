# BK-MF0-03 - Publicar backlog atomico inicial

## Header

- `doc_id`: `GUIA-BK-MF0-03`
- `bk_id`: `BK-MF0-03`
- `macro`: `MF0`
- `owner`: `Nuno`
- `apoio`: `Matheus, Mateus, Davi, Kaue`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF0-01`
- `rf_rnf`: `transversal`
- `fase_documental`: `Fase 1`
- `sprint`: `S01`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF0-04`
- `guia_path`: `docs/planificacao/guias-bk/MF0/BK-MF0-03-publicar-backlog-atomico-inicial.md`
- `last_updated`: `2026-05-25`

## Bloco pedagogico (obrigatorio)

Este BK ensina a transformar um projeto grande numa lista de entregas pequenas, rastreáveis e validáveis. O foco é backlog de execução, não uma lista genérica de ideias.

## Bloco operacional (obrigatorio)

O trabalho operacional é validar `docs/planificacao/backlogs/BACKLOG-MVP.md` como backlog atómico oficial, cruzando-o com a matriz canónica, as MF views e o plano de sprints.

#### Nota anti-drift MF0

`MF0` fecha apenas governance/kickoff: plano, responsabilidades, backlog, DoD, calendário e reunião de alinhamento. Este BK não cria backend, frontend, base de dados, streaming, catálogo, endpoints, componentes ou funcionalidade real. O backlog pode referir BKs técnicos futuros, mas a implementação desses BKs começa apenas em `MF1` e fases seguintes.

#### BK-MF0-03 - Publicar backlog atomico inicial

##### O que vamos fazer neste BK

Neste BK vamos publicar o backlog atómico inicial do FaithFlix. "Atómico" significa que cada BK deve ser suficientemente pequeno para ser executado, validado e defendido, mas suficientemente completo para entregar valor ou preparar uma entrega seguinte. Na MF0, o valor é organizacional: a equipa passa a saber exatamente que BKs existem, quem é owner, que dependências há e que evidência mínima será exigida.

O backlog oficial tem 55 BK ativos, distribuídos por `MF0..MF8`. Este BK não altera o escopo funcional; confirma que o backlog representa o MVP descrito no README/RF/RNF e que cada linha tem os campos obrigatórios: `bk_id`, `titulo`, `owner`, `apoio`, `prioridade`, `estado`, `esforco`, `dependencias` e `rf_rnf`.

A fase foi detalhada sem mockup e sem código da app. Isto é esperado: antes de criar ecrãs, rotas ou modelos, a equipa precisa de uma lista de trabalho estável.

##### Porque e que isto e importante

- Evita que funcionalidades sejam implementadas fora do backlog oficial.
- Dá aos alunos uma unidade clara de trabalho para cada entrega.
- Cria a base para DoD/evidence em `BK-MF0-04`.
- Garante continuidade: `MF1` só começa depois de existir backlog com dependências fechadas.
- Ajuda a defesa da PAP, porque cada requisito passa a ter caminho para BK e evidência.

##### O que entra (scope)

- Validar os 55 BK ativos do MVP.
- Confirmar campos obrigatórios e valores permitidos.
- Confirmar sequência e dependências da `MF0` e transição para `MF1`.
- Confirmar ligação entre backlog, matriz canónica, MF views e plano de sprints.
- Preparar um resumo dos contratos que o DoD deve exigir.

##### O que nao entra (scope-out)

- Criar novos BKs.
- Remover BKs ativos.
- Alterar RF/RNF ou criar requisitos novos.
- Repriorizar owners, dependências ou esforços sem decisão formal.
- Implementar código ou criar estrutura de app.

##### Como saber que isto ficou bem

- O backlog mantém `55 BK` e todos têm campos obrigatórios.
- A `MF0` tem 6 BK em sequência coerente.
- `BK-MF1-01` e `BK-MF1-02` dependem de `BK-MF0-06`, garantindo handoff de governance para fundação técnica.
- A matriz canónica reconhece os BK transversais da MF0.
- O próximo BK consegue definir DoD e evidence sobre uma lista estável.

#### Metadados do BK (CANONICO/DERIVADO):

- Prioridade: `P0` (CANONICO, `BACKLOG-MVP.md`)
- Estado: `TODO` (CANONICO, `BACKLOG-MVP.md`)
- Esforco: `M` (CANONICO, `BACKLOG-MVP.md`)
- macro: `MF0` (CANONICO, `BACKLOG-MVP.md`)
- Owner: `Nuno` (CANONICO, `BACKLOG-MVP.md`)
- Apoio: `Matheus, Mateus, Davi, Kaue` (CANONICO, `BACKLOG-MVP.md`)
- Dependencias (BK IDs): `BK-MF0-01` (CANONICO, `BACKLOG-MVP.md`)
- Pre-condicoes: plano total publicado; distribuição pode ser usada como apoio de validação, mas não é dependência canónica (DERIVADO)
- Ref. Plano: `BACKLOG-MVP > Contrato canonico de campos BK` e `PLANO-SPRINTS > Sprint 1` (CANONICO)
- Flow ID: `MF0-governance-kickoff-03` (DERIVADO)
- Fonte de verdade: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- Fonte de verdade: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- Fonte de verdade: `docs/planificacao/backlogs/MF-VIEWS.md`
- Descricao: publicar backlog atómico oficial, com campos, dependências e rastreabilidade preparados para DoD e execução (DERIVADO)

#### O que vamos fazer neste BK (DERIVADO):

- Confirmar que o backlog tem 55 BK ativos e não contém itens fora de escopo.
- Confirmar que cada BK usa o formato `BK-MF[0-8]-NN`.
- Confirmar que prioridade, estado, esforço e dependências seguem os valores permitidos.
- Confirmar que a sequência MF0 do backlog coincide com `MF-VIEWS.md`.
- Criar handoff para `BK-MF0-04` com as regras que entram na Definition of Done.

#### Estado, ficheiros e impacto (DERIVADO):

- Estado esperado antes do BK: plano total existe e a equipa tem distribuição de responsabilidades; backlog ainda precisa de validação atómica.
- Estado esperado depois do BK: backlog de 55 BK validado como fonte operacional e pronto para alimentar DoD/evidence.
- Ficheiros a criar: nenhum.
- Ficheiros a editar: apenas este guia se forem registados ajustes/evidence do BK.
- Ficheiros a rever: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/backlogs/MF-VIEWS.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`.
- Dependencias de BK anteriores e uso: depende de `BK-MF0-01`; reutiliza a distribuição de `BK-MF0-02` como contexto de sequência, sem alterar dependência canónica.
- Impacto na arquitetura da app: fixa a ordem de construção que impede funcionalidades antes da fundação técnica.
- Impacto em frontend/backend/dados: nenhum código é criado; o backlog reserva BKs específicos para cada camada.
- Impacto em segurança/testes/UI: preserva BKs futuros de sessão segura, smoke tests, hardening e UX.
- Handoff para o próximo BK: entregar a `BK-MF0-04` campos obrigatórios, política de prioridades e dependências validadas.

#### Pre-leitura minima (10-15 min) (DERIVADO):

- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`: limites estruturais `12 sprints`, `55 BK`.
- `docs/planificacao/backlogs/BACKLOG-MVP.md`: documento alvo.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`: rastreabilidade e cobertura.
- `docs/planificacao/backlogs/MF-VIEWS.md`: sequência por macro fase.
- `docs/planificacao/sprints/PLANO-SPRINTS.md`: distribuição dos BK por sprint.
- `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`: owners e apoios por área.
- Mockup: não existe; sem impacto neste BK.
- Código: não existe app detetável; sem impacto neste BK.

#### Glossario (rapido) (DERIVADO):

- Backlog: lista priorizada de trabalho a executar.
- BK: unidade de entrega da PAP, com owner, prioridade, dependências e evidência.
- Atómico: pequeno o suficiente para ser executado e validado sem ambiguidade.
- Dependência: BK que deve estar pronto antes de outro começar.
- Prioridade P0/P1/P2: criticidade relativa de execução e validação.
- Esforço S/M/L: estimativa simples de tamanho.
- Rastreabilidade: ligação entre requisito, BK e evidência.
- Estado: situação atual do BK, como `TODO`, `IN_PROGRESS`, `BLOCKED` ou `DONE`.

#### Conceitos teoricos essenciais (DERIVADO):

**Backlog executável.** Um backlog executável diz o que se constrói, por quem, com que dependências e como se valida. Uma lista como "fazer login" é insuficiente; um BK deve indicar requisitos, owner e evidence.

**Atomicidade.** Um item atómico evita duas falhas: ser tão grande que ninguém consegue fechar, ou tão pequeno que não entrega nada validável. No FaithFlix, `BK-MF2-01` agrupa registo, login e recuperação porque pertencem ao mesmo domínio de identidade.

**Dependências.** Dependências protegem ordem técnica. Por exemplo, `BK-MF1-04` depende de `BK-MF1-01` porque sessão segura precisa de backend base. Na MF0, `BK-MF0-04` depende do backlog porque o DoD precisa saber que itens vai avaliar.

**Campos canónicos.** Campos como `owner`, `prioridade` e `dependencias` não são decoração: são contratos usados por guias, sprints e gates. Alterá-los num sítio e não noutro cria drift.

**Negativos documentais.** Em BKs de governance, testar negativos significa procurar inconsistências: BK duplicado, dependência inexistente, prioridade inválida ou owner ausente.

#### Guia de execucao (passo-a-passo) (DERIVADO):

0. **Objetivo (~10 min): Confirmar baseline do backlog**
   - Descricao detalhada do objetivo: validar que o backlog ativo é o documento certo e está alinhado ao plano total.
   - Justificacao: o backlog é a base operacional dos BK seguintes.
   - Como fazer (0.1): rever header e baseline do `BACKLOG-MVP.md`.
   - Como fazer (0.2): confirmar referência a `55 BK`.
   - Ficheiro a rever: `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
   - Ficheiro alvo: `docs/planificacao/backlogs/BACKLOG-MVP.md`
   - Snippet de referencia: `Universo final de backlog ativo: 55 BK`
   - O que verificar: não há contagem divergente entre plano e backlog.

1. **Objetivo (~15 min): Validar contrato de campos**
   - Descricao detalhada do objetivo: confirmar que o backlog define campos obrigatórios e valores permitidos.
   - Justificacao: os guias BK dependem destes campos para metadados.
   - Como fazer (1.1): rever `Contrato canonico de campos BK`.
   - Como fazer (1.2): confirmar que `prioridade`, `estado` e `esforco` têm enumerações.
   - Ficheiro a rever: `docs/planificacao/backlogs/BACKLOG-MVP.md`
   - Ficheiro alvo: `docs/planificacao/backlogs/BACKLOG-MVP.md`
   - Snippet de referencia: `prioridade so permite P0|P1|P2`
   - O que verificar: os campos são claros para validação.

2. **Objetivo (~15 min): Rever a tabela da MF0**
   - Descricao detalhada do objetivo: confirmar os 6 BK da MF0, owners, apoios, prioridade, esforço e dependências.
   - Justificacao: esta fase desbloqueia todas as restantes.
   - Como fazer (2.1): rever a secção `MF0 - Kickoff e governance`.
   - Como fazer (2.2): comparar com os seis guias existentes em `guias-bk/MF0`.
   - Ficheiro a rever: `docs/planificacao/guias-bk/MF0/`
   - Ficheiro alvo: `docs/planificacao/backlogs/BACKLOG-MVP.md`
   - Snippet de referencia: `BK-MF0-06 | dependencias | BK-MF0-02,BK-MF0-05`
   - O que verificar: a ordem é coerente e não há dependência inexistente.

3. **Objetivo (~15 min): Cruzar backlog com MF views**
   - Descricao detalhada do objetivo: garantir que a sequência da MF0 é igual em `BACKLOG-MVP.md` e `MF-VIEWS.md`.
   - Justificacao: os alunos usam views para executar; não podem divergir do backlog.
   - Como fazer (3.1): rever sequência da MF0 em `MF-VIEWS.md`.
   - Como fazer (3.2): comparar com a tabela MF0 do backlog.
   - Ficheiro a rever: `docs/planificacao/backlogs/MF-VIEWS.md`
   - Ficheiro alvo: `docs/planificacao/backlogs/BACKLOG-MVP.md`
   - Snippet de referencia: `BK-MF0-01 -> BK-MF0-02 -> BK-MF0-03`
   - O que verificar: a ordem é igual nos dois documentos.

4. **Objetivo (~15 min): Cruzar backlog com matriz canónica**
   - Descricao detalhada do objetivo: confirmar que os BK transversais da MF0 aparecem na matriz de cobertura.
   - Justificacao: mesmo sem RF direto, MF0 precisa de validação em gate.
   - Como fazer (4.1): rever `Cobertura de BKs transversais`.
   - Como fazer (4.2): confirmar que todos os `BK-MF0-01..06` aparecem.
   - Ficheiro a rever: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
   - Ficheiro alvo: `docs/planificacao/backlogs/BACKLOG-MVP.md`
   - Snippet de referencia: `Checklist de gate S4/S8/S12 + evidence pr/proof/neg`
   - O que verificar: os seis BK da MF0 têm cobertura transversal.

5. **Objetivo (~15 min): Validar ligação ao plano de sprints**
   - Descricao detalhada do objetivo: confirmar que a Sprint 1 inclui `BK-MF0-01..06`, `BK-MF1-01` e `BK-MF1-02`.
   - Justificacao: a carga e ordem semanal devem ser realistas.
   - Como fazer (5.1): rever calendário de 12 sprints.
   - Como fazer (5.2): confirmar carga alvo de Sprint 1.
   - Ficheiro a rever: `docs/planificacao/sprints/PLANO-SPRINTS.md`
   - Ficheiro alvo: `docs/planificacao/backlogs/BACKLOG-MVP.md`
   - Snippet de referencia: `Sprint 1 | Governance e arranque | BK-MF0-01..06, BK-MF1-01, BK-MF1-02 | 11`
   - O que verificar: a soma planeada não ultrapassa 11 pontos.

6. **Objetivo (~15 min): Confirmar handoff para MF1**
   - Descricao detalhada do objetivo: garantir que os primeiros BK técnicos dependem do fecho de MF0.
   - Justificacao: evita começar backend/frontend antes do alinhamento inicial.
   - Como fazer (6.1): rever linhas `BK-MF1-01` e `BK-MF1-02`.
   - Como fazer (6.2): confirmar dependência `BK-MF0-06`.
   - Ficheiro a rever: `docs/planificacao/backlogs/BACKLOG-MVP.md`
   - Ficheiro alvo: `docs/planificacao/backlogs/BACKLOG-MVP.md`
   - Snippet de referencia: `BK-MF1-01 | dependencias | BK-MF0-06`
   - O que verificar: MF1 só começa depois da reunião de alinhamento.

7. **Objetivo (~20 min): Executar negativos documentais**
   - Descricao detalhada do objetivo: procurar falhas que impediriam o backlog de ser executável.
   - Justificacao: backlog com erro propaga erro para todos os guias.
   - Como fazer (7.1): procurar IDs duplicados ou fora do formato `BK-MF*-NN`.
   - Como fazer (7.2): procurar dependências para BK inexistente.
   - Ficheiro a rever: `docs/planificacao/backlogs/BACKLOG-MVP.md`
   - Ficheiro alvo: `docs/planificacao/backlogs/BACKLOG-MVP.md`
   - Snippet de referencia: `dependencias aceita - ou lista de BK-* existentes`
   - O que verificar: pelo menos 3 negativos P0 documentados.

8. **Objetivo (~10 min): Fechar evidence e handoff**
   - Descricao detalhada do objetivo: preparar prova de validação e entregar contrato de backlog ao DoD.
   - Justificacao: `BK-MF0-04` precisa saber que campos e evidências deve exigir.
   - Como fazer (8.1): preencher `pr`, `proof` e `neg`.
   - Como fazer (8.2): resumir regras de campos e negativos mínimos para `BK-MF0-04`.
   - Ficheiro a rever: `docs/planificacao/backlogs/BACKLOG-MVP.md`
   - Ficheiro alvo: `docs/planificacao/guias-bk/MF0/BK-MF0-03-publicar-backlog-atomico-inicial.md`
   - Snippet de referencia: `proximo_bk: BK-MF0-04`
   - O que verificar: o próximo BK consegue definir DoD sem redefinir backlog.

#### Checklist de validacao (DERIVADO):

**Smoke**
- [ ] Backlog tem header ativo.
- [ ] Backlog declara `55 BK`.
- [ ] Secção MF0 contém 6 BK.
- [ ] Ligações para guias da MF0 existem.

**Negativos**
- [ ] Passo: 7; input/acao: procurar dependência inexistente; resultado esperado: nenhuma dependência inválida; risco que cobre: execução bloqueada por BK fantasma.
- [ ] Passo: 7; input/acao: procurar prioridade fora de `P0|P1|P2`; resultado esperado: nenhuma prioridade inválida; risco que cobre: política de negativos errada.
- [ ] Passo: 7; input/acao: procurar BK sem owner; resultado esperado: todos têm owner; risco que cobre: entrega sem responsável.

**Tecnico**
- [ ] `BACKLOG-MVP.md`, `MATRIZ-CANONICA-BK.md`, `MF-VIEWS.md` e `PLANO-SPRINTS.md` estão alinhados.
- [ ] `rf_rnf` transversal da MF0 não foi trocado por RF/RNF inventado.
- [ ] O próximo BK recomendado é `BK-MF0-04`.

**Regressao das fases anteriores**
- [ ] `BK-MF0-01` mantém-se como dependência canónica.
- [ ] A saída de `BK-MF0-02` é reutilizável, mas sem alterar dependência oficial.

**UI/mockup**
- [ ] Sem mockup; este BK não define ecrãs.

**Seguranca**
- [ ] O backlog preserva BKs de sessão segura, hardening e RGPD.
- [ ] Não são adicionados dados reais, contas, passwords ou chaves.

#### Criterios de aceite:

**Outputs:**
- Backlog atómico revisto como fonte operacional.
- Lista de regras de campos preparada para DoD.

**Verificacoes:**
- 55 BK ativos.
- 6 BK na MF0.
- Todos os BK da MF0 aparecem na matriz como transversais.

**Qualidade:**
- Sem alteração de escopo funcional.
- Sem novos BK ou RF/RNF.
- Dependências legíveis e existentes.

**Continuidade:**
- `BK-MF0-04` recebe backlog estável para definir DoD.
- `MF1` continua dependente de `BK-MF0-06`.

**Evidencia:**
- `pr`, `proof` e `neg` preenchidos antes de marcar `DONE`.

#### Evidence (para o PR/defesa):

- `pr`: `A preencher no fecho do BK`
- `proof`: `A preencher apos validacao`
- `neg`: `A preencher apos testes negativos`
- `files`: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/backlogs/MF-VIEWS.md`
- `commands`: `bash scripts/validate-planificacao.sh`
- `screenshots`: `Nao aplicavel; BK documental sem UI`
- `notes`: `Fase detalhada sem mockup e sem codigo de app existente`

#### TODOs

- TODO: preencher evidence real no fecho do BK.
- TODO: confirmar manualmente com a equipa se a atomicidade dos BK é compreendida.
- TODO (BLOCKER): se houver BK duplicado, dependência inexistente ou owner ausente, bloquear `BK-MF0-04`.
- FOLLOW-UP: usar contrato de campos e política de negativos em `BK-MF0-04`.
- Assuncao a validar com o orientador: `rf_rnf` transversal continua adequado para todos os BK da MF0.
- Decisao dependente de mockup: nenhuma nesta fase.
- Decisao dependente de app/codigo ainda inexistente: caminhos de implementação só serão definidos a partir de `MF1`.

## Snippet tecnico aplicavel

```text
CHECK BK-MF0-03
1. backlog.total_bk == 55
2. all(bk.id.match("BK-MF[0-8]-[0-9][0-9]"))
3. all(bk.owner != "")
4. all(bk.prioridade in ["P0", "P1", "P2"])
5. all(bk.dependencias == "-" or dependencias_existem(bk))
```

## Proximo BK recomendado

`BK-MF0-04`

## Changelog

- `2026-04-13`: retrofit para contrato pedagogico v3 (objetivo especifico, pre-condicoes, outputs, snippet e proximo BK real).
- `2026-05-25`: refinado para guia executável de backlog atómico, rastreabilidade e negativos documentais.
