# Auditoria de hidratacao BK - MF0

## Header

- `doc_id`: `AUDITORIA-HIDRATACAO-MF0`
- `path`: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF0.md`
- `macro_fase_auditada`: `MF0`
- `data`: `2026-05-29`
- `status`: `hidratacao_executada`

## Objetivo

Auditar e acompanhar a hidratacao dos guias BK da `MF0` quanto a clareza pedagogica e tecnica, com foco na capacidade de alunos do 12.º ano seguirem os guias sem ambiguidade. A auditoria nao altera backlog, matriz, RF, RNF, owners, prioridades, dependencias ou escopo.

Em FaithFlix, `MF0` e uma macrofase de governance/kickoff. Por isso, os guias desta fase devem orientar revisao, publicacao, validacao, evidencias e handoff documental, sem prometer implementacao funcional de backend, frontend, base de dados, catalogo, streaming, autenticacao, endpoints ou componentes.

## Estado pos-hidratacao

Em `2026-05-29`, os guias anteriormente classificados como `PARCIAL` foram hidratados:

- `BK-MF0-01`: removida a promessa indevida de scaffold tecnico em `MF0`; acrescentada verificacao explicita de ausencia de scaffold real e negativo contra criacao de `apps/api`, `apps/web`, `backend/`, `frontend/`, `server/` ou `client/`.
- `BK-MF0-04`: clarificado que a DoD/evidence operacional fica registada no proprio guia enquanto nao houver decisao formal para artefacto canonico separado; acrescentados mapa de ficheiros, localizacao das seccoes e bloqueio/decisao necessaria.
- `BK-MF0-06`: definido caminho previsivel para a ata/registo (`docs/planificacao/sprints/ATA-ALINHAMENTO-INICIAL-MF0.md`), com template minimo, validacoes, cuidados de privacidade e handoff para `MF1`.

Nao foram feitas alteracoes a RF, RNF, IDs BK, owners, prioridades, dependencias, sequencia canonica ou escopo funcional.

## Fontes consultadas

- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- `docs/planificacao/guias-bk/MF0/BK-MF0-01-publicar-plano-total.md`
- `docs/planificacao/guias-bk/MF0/BK-MF0-02-publicar-distribuicao-responsabilidades.md`
- `docs/planificacao/guias-bk/MF0/BK-MF0-03-publicar-backlog-atomico-inicial.md`
- `docs/planificacao/guias-bk/MF0/BK-MF0-04-definir-dod-e-formato-evidencia.md`
- `docs/planificacao/guias-bk/MF0/BK-MF0-05-definir-calendario-sprints.md`
- `docs/planificacao/guias-bk/MF0/BK-MF0-06-reuniao-alinhamento-inicial.md`
- `docs/planificacao/PLANO-SPRINTS.md`
- `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- `docs/planificacao/guias-bk/MF1/BK-MF1-01-criar-repositorio-e-estrutura-base.md`
- `docs/planificacao/guias-bk/MF1/BK-MF1-02-configurar-ambiente-local.md`

Tambem foi verificado o scaffold real do repositorio. Existe `mockup/`, mas nao foi encontrado scaffold de app final em `backend/`, `frontend/`, `apps/api`, `apps/web`, `server/` ou `client/`.

## Resultado global

| Metricas | Total |
| --- | ---: |
| BK analisados | 6 |
| `OK` | 6 |
| `PARCIAL` | 0 |
| `CRITICO` | 0 |

## Classificacao por BK

| BK | Guia | Classificacao | Sintese |
| --- | --- | --- | --- |
| `BK-MF0-01` | `docs/planificacao/guias-bk/MF0/BK-MF0-01-publicar-plano-total.md` | `OK` | Drift pontual corrigido: o guia ja explicita que `MF0` nao cria scaffold tecnico e que a estrutura real fica para `BK-MF1-01`/`BK-MF1-02`. |
| `BK-MF0-02` | `docs/planificacao/guias-bk/MF0/BK-MF0-02-publicar-distribuicao-responsabilidades.md` | `OK` | Documento alvo, checklist, negativos, criterios e handoff estao claros para governance. |
| `BK-MF0-03` | `docs/planificacao/guias-bk/MF0/BK-MF0-03-publicar-backlog-atomico-inicial.md` | `OK` | Guia bem hidratado para validacao documental do backlog atomico, sem promessa funcional indevida. |
| `BK-MF0-04` | `docs/planificacao/guias-bk/MF0/BK-MF0-04-definir-dod-e-formato-evidencia.md` | `OK` | DoD/evidence operacional passou a ter local explicito no proprio guia, com decisao necessaria caso se queira promover para artefacto canonico separado. |
| `BK-MF0-05` | `docs/planificacao/guias-bk/MF0/BK-MF0-05-definir-calendario-sprints.md` | `OK` | Guia claro para validar `PLANO-SPRINTS.md`, cargas, gates e handoff, mantendo a `MF0` como planeamento. |
| `BK-MF0-06` | `docs/planificacao/guias-bk/MF0/BK-MF0-06-reuniao-alinhamento-inicial.md` | `OK` | Ata/registo passou a ter caminho, template, validacoes, cuidados de privacidade e handoff mensuravel para `MF1`. |

## BKs `PARCIAL` ou `CRITICO`

Nao existem BKs `PARCIAL` ou `CRITICO` ativos apos a hidratacao de `2026-05-29`.

As observacoes abaixo ficam como historico dos problemas encontrados na auditoria inicial e da respetiva resolucao.

### `BK-MF0-01` - historico resolvido

- Guia afetado: `docs/planificacao/guias-bk/MF0/BK-MF0-01-publicar-plano-total.md`
- Secoes vagas ou problematicas:
  - `Guia de execucao`, passo `0`, instrucao `0.0`: manda "criar a estrutura inicial do projeto" com `apps/api` e `apps/web`.
  - Isto contradiz a nota anti-drift do proprio guia, que afirma que `MF0` nao cria backend, frontend, base de dados, endpoints, componentes ou funcionalidade real.
- Codigo em falta, se aplicavel: nao aplicavel; o BK e documental.
- Instrucoes de ficheiro/localizacao em falta:
  - O ficheiro alvo principal esta claro: `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`.
  - O problema nao e falta de localizacao, mas instrucao de implementacao funcional fora de escopo.
- Validacoes em falta:
  - A checklist deveria incluir um negativo explicito para garantir que nenhum passo da `MF0` cria pastas, ficheiros tecnicos, comandos de scaffold ou estrutura de app.
- Risco para alunos:
  - Alunos podem iniciar scaffold tecnico em `MF0`, antes do handoff de `BK-MF0-06` e antes dos BKs tecnicos `BK-MF1-01`/`BK-MF1-02`.
  - Isto cria drift pedagogico e pode levar a ficheiros tecnicos sem DoD, sem owner tecnico da `MF1` e sem validacao propria.
- Recomendacao de hidratacao:
  - Substituir a instrucao de criacao por uma validacao documental, por exemplo: confirmar que a criacao da estrutura real fica reservada para `BK-MF1-01` e `BK-MF1-02`.
  - Acrescentar negativo: tentar encontrar no guia comandos, pastas ou ficheiros tecnicos a criar em `MF0`; resultado esperado: nenhum.
- Resolucao aplicada:
  - Instrucao indevida substituida por validacao documental.
  - Acrescentada secao de verificacao de scaffold/codigo real.
  - Acrescentado negativo e criterio de aceite para garantir que `MF0` nao cria scaffold tecnico.

### `BK-MF0-04` - historico resolvido

- Guia afetado: `docs/planificacao/guias-bk/MF0/BK-MF0-04-definir-dod-e-formato-evidencia.md`
- Secoes vagas ou problematicas:
  - `Bloco operacional`: define a intencao de criar uma Definition of Done comum, mas nao fixa o documento canonico onde essa DoD deve ficar.
  - `Estado, ficheiros e impacto`: indica "Ficheiros a criar: nenhum" e "Ficheiros a editar: apenas este guia", embora o output esperado seja uma DoD reutilizavel por todos os BKs.
  - Passos de execucao usam alvos genericos como "guia do BK em execucao", "guias BK" e "guias BK tecnicos futuros".
- Codigo em falta, se aplicavel: nao aplicavel; o BK e documental.
- Instrucoes de ficheiro/localizacao em falta:
  - Falta indicar explicitamente se a DoD final deve ser registada em `_TEMPLATE-BK.md`, `BACKLOG-MVP.md`, `PLANO-SPRINTS.md`, `SCORECARD-SPRINTS.md`, num novo documento de DoD/evidence, ou apenas no proprio guia.
  - Falta indicar se a alteracao e criacao ou edicao e em que secao inserir o contrato final.
- Validacoes em falta:
  - Falta checklist que confirme que a DoD ficou persistida num artefacto canonico identificavel, e nao apenas explicada no guia.
  - Falta validacao de que todos os guias futuros conseguem apontar para esse artefacto de DoD.
- Risco para alunos:
  - Alunos podem compreender o conceito de DoD, mas nao saber onde consultar ou atualizar a regra oficial.
  - O contrato de evidence pode ficar disperso por guia, template, backlog e scorecard, gerando interpretacoes diferentes nas fases tecnicas.
- Recomendacao de hidratacao:
  - Definir um alvo canonico unico para DoD/evidence, sem alterar escopo do backlog.
  - Escrever no guia exatamente: ficheiro a criar/editar, secao de insercao, campos obrigatorios e checklist de validacao.
  - Manter a linguagem como contrato de governance da `MF0`, sem adicionar comandos tecnicos ainda nao definidos em `MF1`.
- Resolucao aplicada:
  - Definido que o contrato operacional de DoD/evidence fica no proprio guia, nas seccoes de checklist, criterios de aceite, evidence e snippet tecnico aplicavel.
  - Acrescentado mapa de ficheiros e localizacao.
  - Acrescentada secao `Bloqueio / decisao necessaria` para a eventual promocao para artefacto canonico separado, evitando inventar novo contrato sem confirmacao.

### `BK-MF0-06` - historico resolvido

- Guia afetado: `docs/planificacao/guias-bk/MF0/BK-MF0-06-reuniao-alinhamento-inicial.md`
- Secoes vagas ou problematicas:
  - `Estado, ficheiros e impacto`: "Ficheiros a criar: ata/registo da reuniao se a equipa ainda nao tiver local oficial para isso" nao indica caminho ou nome.
  - Varios passos usam "registo/ata da reuniao" como ficheiro alvo, mas sem localizacao canonica.
- Codigo em falta, se aplicavel: nao aplicavel; o BK e documental.
- Instrucoes de ficheiro/localizacao em falta:
  - Falta caminho exato para a ata/registo, por exemplo um documento dentro de `docs/planificacao/` ou `docs/planificacao/sprints/`.
  - Falta indicar se o registo e novo ficheiro, edicao de documento existente ou anexo de PR.
  - Falta mini-template da ata com campos obrigatorios: data, participantes, decisoes, blockers, owners, prazos, handoff para `BK-MF1-01` e `BK-MF1-02`, evidence `pr/proof/neg`.
- Validacoes em falta:
  - A checklist valida que houve ata, mas nao valida que ela ficou no local canonico, com nome previsivel e campos minimos.
- Risco para alunos:
  - A reuniao pode acontecer, mas a evidence ficar dispersa ou incompleta.
  - O handoff para `MF1` pode depender de memoria oral, fragilizando a defesa e a execucao tecnica seguinte.
- Recomendacao de hidratacao:
  - Definir um caminho canonico para a ata/registo antes da execucao do BK.
  - Acrescentar template curto no guia e criterios mensuraveis para a ata.
  - Garantir que a ata nao inclui segredos, credenciais, contas reais nem decisoes funcionais fora de escopo.
- Resolucao aplicada:
  - Definido o caminho `docs/planificacao/sprints/ATA-ALINHAMENTO-INICIAL-MF0.md` como artefacto de reuniao.
  - Acrescentado template completo da ata/registo.
  - Acrescentadas validacoes de blockers, owners, prazos, evidence e ausencia de segredos/dados sensiveis.

## Top BKs que precisam de hidratacao

Nao existem BKs ativos a precisar de hidratacao apos a execucao desta tarefa.

Historicamente, os tres BKs que precisavam de hidratacao eram:

1. `BK-MF0-04` - maior impacto transversal: DoD/evidence para todos os BKs seguintes.
2. `BK-MF0-06` - impacto direto no handoff para `MF1`.
3. `BK-MF0-01` - drift pontual de implementacao funcional em `MF0`.

Nao foram identificados 5 BKs com necessidade real de hidratacao. Os restantes guias da `MF0` ja estavam suficientemente claros para o tipo documental/governance desta macrofase.

## Drift encontrado

### Drift corrigido

- `BK-MF0-01` continha uma instrucao para criar estrutura tecnica `apps/api` e `apps/web`, apesar de a `MF0` estar definida no plano, backlog e MF views como governance/kickoff.
- Esse drift foi corrigido em `2026-05-29`: o guia agora manda validar documentalmente que a criacao da estrutura real fica reservada para `BK-MF1-01`/`BK-MF1-02`.

### Sem drift estrutural ativo identificado

- `bk_id`, `macro`, `owner`, `apoio`, `prioridade`, `estado`, `esforco`, `dependencias`, `rf_rnf`, `proximo_bk` e `guia_path` dos guias `MF0` estao coerentes com `BACKLOG-MVP.md`, `CONTRATO-CAMPOS-BK.md` e `MF-VIEWS.md`.
- A sequencia `BK-MF0-01 -> BK-MF0-02 -> BK-MF0-03 -> BK-MF0-04 -> BK-MF0-05 -> BK-MF0-06 -> BK-MF1-01` esta coerente com a view da macrofase.
- Nao foi detetada tentativa ativa de transformar `MF0` em implementacao funcional apos a hidratacao.
- A referencia a `mockup/` foi tratada como material de apoio visual, nao como scaffold da app final.

## Validacao automatica

Comando executado:

```bash
bash scripts/validate-planificacao.sh
```

Resultado:

- `FAIL` tecnico antes da validacao documental.
- Motivo: `scripts/validate-planificacao.sh` tenta executar `../scripts/validate_planificacao_canonica.py`, mas esse ficheiro nao existe no caminho esperado.
- Impacto: a hidratacao foi aplicada e documentada, mas o estado global da planificacao nao ficou automaticamente validado por script nesta execucao.
- Nota: esta falha nao resulta de incoerencia detetada nos guias; o script termina antes de conseguir validar os documentos.

## Conclusao

A `MF0` fica hidratada para uma fase de governance/kickoff. Os seis guias explicam objetivo, contexto, negativos, criterios de aceite, evidence e handoff para alunos do 12.º ano, sem prometer implementacao funcional indevida. Os tres pontos inicialmente parciais foram resolvidos sem alterar RF, RNF, IDs BK, owners, prioridades, dependencias ou escopo.
