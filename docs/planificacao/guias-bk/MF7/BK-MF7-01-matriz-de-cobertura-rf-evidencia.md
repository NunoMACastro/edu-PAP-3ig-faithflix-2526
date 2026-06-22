# BK-MF7-01 - Matriz de cobertura RF -> evidência

## Header

- `doc_id`: `GUIA-BK-MF7-01`
- `bk_id`: `BK-MF7-01`
- `macro`: `MF7`
- `owner`: `Kaue`
- `apoio`: `Matheus, Mateus, Davi`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF6-06`
- `rf_rnf`: `RF_ATIVOS_MVP`
- `fase_documental`: `Fase 3`
- `sprint`: `S11`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF7-02`
- `guia_path`: `docs/planificacao/guias-bk/MF7/BK-MF7-01-matriz-de-cobertura-rf-evidencia.md`
- `last_updated`: `2026-06-22`

#### Objetivo

Neste BK vais construir a matriz final que liga cada requisito funcional ativo do MVP FaithFlix à evidência que prova a sua existência, validação e preparação para defesa.

O resultado observável é o ficheiro `docs/evidence/MF7/MATRIZ-RF-EVIDENCIA.md`, com uma linha por RF ativo, o BK que o implementou ou validou, a prova consultada, os negativos mínimos e o estado de cobertura.

Esta matriz não implementa nova funcionalidade. Ela transforma a aplicação construída nas macrofases anteriores numa prova organizada para o gate S12 e para a defesa PAP.

#### Importância

Uma PAP técnica não é defendida apenas com código existente. A equipa precisa de mostrar que cada requisito funcional documentado tem origem, execução, prova e limitação conhecida.

Este BK fecha a cadeia `RF -> BK -> evidence -> defesa`. Sem esta matriz, o roteiro de demo pode mostrar ecrãs interessantes, mas não prova que o MVP cobre os requisitos oficiais.

O próximo BK usa este método para fazer o mesmo com requisitos não funcionais. Por isso, a matriz RF deve ficar clara, auditável e sem claims que não tenham prova.

#### Scope-in

- Levantar todos os RF ativos em `docs/RF.md`.
- Confirmar o BK responsável por cada RF em `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`.
- Ligar cada RF à evidence existente ou ao campo pendente a preencher pela equipa.
- Criar a estrutura final de `docs/evidence/MF7/MATRIZ-RF-EVIDENCIA.md`.
- Registar pelo menos 3 negativos para este BK P0.
- Preparar handoff direto para `BK-MF7-02`.

#### Scope-out

- Alterar IDs, owners, prioridades, estados ou dependências dos BKs.
- Reescrever requisitos funcionais.
- Corrigir código de backend ou frontend.
- Marcar RF como validado sem evidence objetiva.
- Criar novos RF fora de `docs/RF.md`.
- Substituir a revisão do orientador.

#### Estado antes e depois

- Estado antes: `BK-MF6-06` consolidou o gate técnico da MF6 e deixou a MF7 pronta para organizar evidências de defesa.
- Estado antes: os RF ativos existem em `docs/RF.md`, mas ainda não há matriz final RF -> evidence da MF7.
- Estado depois: `docs/evidence/MF7/MATRIZ-RF-EVIDENCIA.md` mostra todos os RF ativos do MVP com fonte, BK, proof, negativos, estado e lacunas.
- Estado depois: `BK-MF7-02` pode validar RNF sem repetir o levantamento funcional.

#### Pre-requisitos

- `BK-MF6-06` concluído ou revisto pela equipa.
- `docs/RF.md` consultado para a lista de RF ativos.
- `docs/planificacao/backlogs/BACKLOG-MVP.md` consultado para macrofases, owners e dependências.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` consultado para o mapeamento requisito -> BK.
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md` consultado para confirmar metadata de `BK-MF7-01`.
- `docs/evidence/MF6/GATE-S12-MF6.md` revisto como evidence de entrada, se já estiver preenchido pela equipa.

#### Glossário

- RF ativo: requisito funcional que continua dentro do escopo PAP após o rebaseline do MVP.
- Evidence: prova objetiva, como output de teste, captura, log controlado, matriz assinada ou ficheiro revisto.
- Proof: prova principal de que o fluxo esperado funciona.
- Negativo: cenário de erro, falta de permissões, dados incompletos ou ausência de prova que deve falhar de forma controlada.
- Gate S12: validação final antes da defesa e do buffer de fecho.
- Estado de cobertura: classificação `VALIDADO`, `VALIDADO_COM_RESSALVA`, `PENDENTE` ou `FALHA`.

#### Conceitos teóricos essenciais

- `CANONICO`: `RF_ATIVOS_MVP` representa os requisitos funcionais que permanecem no escopo PAP em `docs/RF.md`.
- `CANONICO`: `MATRIZ-CANONICA-BK.md` mantém `91/91` requisitos mapeados, somando RF e RNF.
- `CANONICO`: `BACKLOG-MVP.md` exige evidence mínima `pr`, `proof` e `neg` por BK.
- `DERIVADO`: a matriz RF final usa estados explícitos para impedir que um requisito sem prova seja apresentado como concluído.
- Um RF é uma capacidade de produto, não apenas uma linha documental. Exemplo: `RF16` só fica coberto se houver prova de favoritos, ownership e comportamento esperado.
- Evidence precisa de fonte. Uma frase como "funciona" não chega; a linha deve indicar ficheiro, comando, captura, output ou decisão assinável.
- Negativos são parte da defesa. Eles mostram que a equipa sabe explicar limites, permissões, sessão, validação e falhas esperadas.
- Uma ressalva não é fracasso automático. Se o MVP usa uma versão simplificada documentada, a matriz pode marcar `VALIDADO_COM_RESSALVA`, desde que a limitação esteja clara.

#### Arquitetura do BK

| Área | Entrada | Saída |
| --- | --- | --- |
| RF | `docs/RF.md` | Lista de RF ativos |
| Mapeamento | `MATRIZ-CANONICA-BK.md` e `BACKLOG-MVP.md` | BK responsável por RF |
| Evidence | `docs/evidence/` e BKs das MF anteriores | Proof e negativos por requisito |
| Matriz final | `docs/evidence/MF7/MATRIZ-RF-EVIDENCIA.md` | Cobertura RF auditável |
| Handoff | matriz RF validada | Base funcional para demo final |

#### Ficheiros a criar/editar/rever

- CRIAR: `docs/evidence/MF7/MATRIZ-RF-EVIDENCIA.md`
- REVER: `docs/RF.md`
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- REVER: `docs/planificacao/guias-bk/MF0/`
- REVER: `docs/planificacao/guias-bk/MF1/`
- REVER: `docs/planificacao/guias-bk/MF2/`
- REVER: `docs/planificacao/guias-bk/MF3/`
- REVER: `docs/planificacao/guias-bk/MF4/`
- REVER: `docs/planificacao/guias-bk/MF5/`
- REVER: `docs/planificacao/guias-bk/MF6/`
- REVER: `docs/evidence/MF6/GATE-S12-MF6.md`

#### Tutorial técnico linear

### Passo 1 - Levantar todos os RF ativos

1. Objetivo funcional do passo no contexto da app.

Construir a lista fechada de requisitos funcionais que a matriz deve cobrir, sem inventar novos requisitos e sem recuperar RF removidos do escopo PAP.

2. Ficheiros envolvidos:
    - REVER: `docs/RF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - LOCALIZAÇÃO: tabelas de requisitos funcionais e secção de validações estruturais.

3. Instruções do que fazer.

Lê `docs/RF.md` e copia apenas os RF existentes nas tabelas ativas: `RF01..RF28`, `RF35..RF48`, `RF52..RF60`. Confirma depois em `MATRIZ-CANONICA-BK.md` que estes RF entram na cobertura total.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. O trabalho é documental e cria a base da matriz.

5. Explicação do código.

Não há código porque a tarefa é de rastreabilidade. A entrada é a lista oficial de RF; a saída é uma lista controlada para o ficheiro de evidence.

Este passo evita dois erros graves: deixar RF ativo sem linha de cobertura ou trazer de volta requisitos removidos do MVP. O aluno pode adaptar a descrição curta de cada RF, mas não pode alterar o ID nem o escopo sem decisão do orientador.

6. Validação do passo.

Conta os RF levantados e confirma que a soma bate certo com a cobertura funcional esperada da PAP. Se um RF não aparecer em `docs/RF.md`, não entra na matriz.

7. Cenário negativo/erro esperado.

Se alguém acrescentar um RF novo diretamente na matriz, a revisão deve marcar `FALHA`: requisito sem fonte oficial.

### Passo 2 - Ligar cada RF ao BK responsável

1. Objetivo funcional do passo no contexto da app.

Garantir que cada requisito funcional aponta para o BK que o implementou, validou ou consolidou.

2. Ficheiros envolvidos:
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
    - LOCALIZAÇÃO: linhas de RF e linhas dos BKs das MF0 a MF6.

3. Instruções do que fazer.

Para cada RF, encontra o BK primário na matriz canónica. Quando a capacidade depende de mais do que uma macrofase, mantém o BK primário e acrescenta uma nota curta com dependências reais.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. O resultado é uma relação documental requisito -> BK.

5. Explicação do código.

O BK responsável é a ponte entre planeamento e execução. Sem esta ponte, a defesa fica vulnerável a perguntas simples como "onde foi implementado este requisito?".

O aluno pode acrescentar uma nota de dependência, por exemplo "usa sessão segura da MF1", mas não deve trocar o BK primário sem atualizar documentação canónica.

6. Validação do passo.

Escolhe 5 RF de domínios diferentes, por exemplo identidade, catálogo, streaming, subscrições e privacidade, e confirma que cada um aponta para um BK existente.

7. Cenário negativo/erro esperado.

Se `RF55` apontar apenas para um BK de catálogo, a linha fica `FALHA`, porque exportação de dados pertence ao domínio de privacidade/RGPD.

### Passo 3 - Criar a matriz RF -> evidence

1. Objetivo funcional do passo no contexto da app.

Criar o ficheiro final onde cada RF fica ligado a proof, negativos e estado de cobertura.

2. Ficheiros envolvidos:
    - CRIAR: `docs/evidence/MF7/MATRIZ-RF-EVIDENCIA.md`
    - REVER: `docs/evidence/MF6/GATE-S12-MF6.md`
    - LOCALIZAÇÃO: ficheiro completo da matriz RF.

3. Instruções do que fazer.

Cria a pasta `docs/evidence/MF7/` se ainda não existir. No ficheiro da matriz, usa estas colunas obrigatórias:

| Coluna | Conteúdo esperado |
| --- | --- |
| RF | ID do requisito funcional |
| Domínio | identidade, catálogo, streaming, biblioteca, descoberta, monetização, pool, notificações, privacidade ou admin |
| BK responsável | BK primário confirmado na matriz canónica |
| Evidence consultada | caminho do ficheiro, comando, captura ou decisão |
| Proof | prova principal do fluxo positivo |
| Negativos | cenários negativos executados ou pendentes |
| Estado | `VALIDADO`, `VALIDADO_COM_RESSALVA`, `PENDENTE` ou `FALHA` |
| Observação | limitação curta, se existir |

4. Código completo, correto e integrado com a app final.

Sem código neste passo. O artefacto é uma matriz Markdown de evidence.

5. Explicação do código.

A matriz é um documento técnico, mas funciona como contrato de defesa. Cada coluna responde a uma pergunta do júri: o que foi pedido, onde foi feito, como se prova, o que falha de forma previsível e que risco fica.

O estado `VALIDADO_COM_RESSALVA` deve ser usado com honestidade: serve para capacidades demonstradas com limitação aceite, não para esconder falta de prova.

6. Validação do passo.

Confirma que nenhum RF ativo ficou sem linha. Depois confirma que nenhuma linha tem proof vazio com estado `VALIDADO`.

7. Cenário negativo/erro esperado.

Se uma linha tiver `VALIDADO` e a coluna `Evidence consultada` estiver vazia, a revisão deve alterar para `PENDENTE`.

### Passo 4 - Fechar negativos e handoff para RNF

1. Objetivo funcional do passo no contexto da app.

Preparar a matriz RF para ser usada no BK seguinte sem repetir levantamento nem transportar lacunas escondidas.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF7/MATRIZ-RF-EVIDENCIA.md`
    - REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-02-matriz-de-cobertura-rnf-validacao.md`
    - LOCALIZAÇÃO: secções finais `Negativos consolidados`, `Riscos` e `Handoff`.

3. Instruções do que fazer.

Regista no final da matriz três negativos mínimos: RF sem BK, RF com BK inexistente e RF marcado como validado sem proof. Fecha também uma lista curta de riscos que o BK de RNF deve considerar.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. O output é a secção final da matriz.

5. Explicação do código.

Os negativos da matriz são testes de qualidade documental. Eles impedem que a equipa use a matriz como decoração e obrigam a tratar cobertura como prova.

O handoff para RNF deve separar capacidade funcional de qualidade não funcional. Um RF pode estar coberto e, ainda assim, um RNF de compatibilidade, performance ou localização ficar pendente.

6. Validação do passo.

Pede a outro elemento da equipa para escolher 3 RF aleatórios e seguir a cadeia completa até à evidence. O resultado esperado é encontrar fonte, BK, proof e negativo sem pedir explicações fora da matriz.

7. Cenário negativo/erro esperado.

Se o colega não conseguir reproduzir a cadeia de uma linha, essa linha fica `PENDENTE` até ter fonte e proof claros.

#### Critérios de aceite

- Todos os RF ativos em `docs/RF.md` têm uma linha na matriz.
- Cada linha tem BK responsável existente.
- Cada linha tem estado explícito e não usa `VALIDADO` sem proof.
- Existem pelo menos 3 negativos documentais para este BK P0.
- A matriz distingue prova real, ressalva e pendência.
- O handoff para `BK-MF7-02` identifica riscos de qualidade não funcional.

#### Validação final

- Executar `bash scripts/validate-planificacao.sh` na raiz do projeto.
- Executar `git diff --check` na raiz do projeto.
- Rever manualmente a matriz e confirmar que nenhum RF ativo ficou sem linha.
- Confirmar que a matriz não altera requisitos oficiais nem metadata dos BKs.

#### Evidence para PR/defesa

- `pr`: referência da entrega onde `docs/evidence/MF7/MATRIZ-RF-EVIDENCIA.md` foi criado.
- `proof`: matriz RF completa com fonte, BK, evidence e estado por RF.
- `neg`: RF sem fonte oficial rejeitado; RF com BK inexistente rejeitado; RF validado sem proof reclassificado para `PENDENTE`.
- `fonte`: `docs/RF.md`, `BACKLOG-MVP.md`, `MATRIZ-CANONICA-BK.md` e `BK-MF6-06`.

#### Handoff

Este BK entrega a cobertura funcional consolidada. `BK-MF7-02` deve usar a mesma lógica para RNF e cruzar qualidade, compatibilidade, manutenção, ética e localização com evidence real.

#### Changelog

- `2026-06-22`: guia reescrito para matriz RF auditável, com estrutura completa, passos lineares, negativos e handoff para RNF.
