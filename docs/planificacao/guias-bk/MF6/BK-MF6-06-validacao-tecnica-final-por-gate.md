# BK-MF6-06 - Validação técnica final por gate

## Header

- `doc_id`: `GUIA-BK-MF6-06`
- `bk_id`: `BK-MF6-06`
- `macro`: `MF6`
- `owner`: `Nuno`
- `apoio`: `Matheus, Mateus, Davi, Kaue`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF6-03,BK-MF6-05`
- `rf_rnf`: `transversal`
- `fase_documental`: `Fase 3`
- `sprint`: `S11`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF7-01`
- `guia_path`: `docs/planificacao/guias-bk/MF6/BK-MF6-06-validacao-tecnica-final-por-gate.md`
- `last_updated`: `2026-06-20`

#### Objetivo

Neste BK vais consolidar o gate técnico final da MF6. O objetivo é juntar provas reais de regressão backend, regressão frontend, segurança, privacidade, performance, acessibilidade e conformidade documental num único pacote de validação para a PAP.

O resultado final é o ficheiro `docs/evidence/MF6/GATE-S12-MF6.md`, preenchido apenas com resultados executados e pronto para entregar a `BK-MF7-01`.

#### Importância

Um gate técnico evita que a equipa avance para evidências e defesa com falhas críticas escondidas. Nesta altura, a aplicação já passou por várias macrofases e muitos owners. Sem gate, cada pessoa pode achar que a sua parte está pronta, mas ninguém confirma o conjunto.

Este BK transforma validações dispersas em decisão objetiva: `GO`, `GO_COM_RESSALVAS` ou `NO_GO`. A decisão só é válida quando existe evidence real, comandos executados no diretório certo, negativos registados e riscos residuais explícitos.

#### Scope-in

- Consolidar outputs dos BKs `BK-MF6-01` a `BK-MF6-05`.
- Confirmar evidence mínima `pr`, `proof` e `neg` em cada BK de MF6.
- Executar validações oficiais de planificação.
- Executar `git diff --check`.
- Registar comandos backend e frontend com diretório explícito.
- Confirmar que os BKs de MF6 preservam dependências com MF5 e MF7.
- Emitir decisão de gate e handoff para matriz RF de `BK-MF7-01`.

#### Scope-out

- Corrigir código de produto fora dos BKs MF6.
- Alterar backlog, matriz ou owners sem decisão do orientador.
- Criar nova macrofase.
- Substituir a avaliação humana do orientador.
- Fechar riscos críticos como se fossem pequenas ressalvas.
- Escrever `PASS`, `GO` ou `GO_COM_RESSALVAS` antes de existir output real.

#### Estado antes e depois

Antes deste BK, cada validação da MF6 existe no seu contexto: regressão backend, regressão frontend, hardening, performance e UX. Falta a visão de conjunto com comandos reproduzíveis e decisão final.

Depois deste BK, existe uma matriz final da MF6 com comandos, estados, responsáveis, riscos, negativos e decisão de gate. O ficheiro final continua com placeholders enquanto a equipa não executar as validações.

#### Pre-requisitos

- `BK-MF6-01` executou regressão backend e criou `docs/evidence/MF6/BK-MF6-01-regressao-backend.md`.
- `BK-MF6-02` executou regressão frontend e criou `docs/evidence/MF6/BK-MF6-02-regressao-frontend.md`.
- `BK-MF6-03` validou segurança, privacidade, backups e criou `docs/evidence/MF6/BK-MF6-03-hardening-seguranca.md`.
- `BK-MF6-04` mediu performance crítica e criou `docs/evidence/MF6/BK-MF6-04-performance.md`.
- `BK-MF6-05` validou acessibilidade/UX e criou `docs/evidence/MF6/BK-MF6-05-acessibilidade-ux.md`.
- `scripts/validate-planificacao.sh` existe na raiz do projeto.
- A equipa sabe distinguir erro bloqueante de ressalva documentada.

#### Glossário

- Gate: ponto formal de decisão antes de avançar.
- GO: segue para a próxima macrofase sem bloqueios críticos.
- GO_COM_RESSALVAS: segue com riscos não críticos registados e aceites pelo orientador.
- NO_GO: não segue por haver falha crítica.
- Evidence pack: conjunto de provas técnicas anexas à entrega.
- Risco residual: risco conhecido que não bloqueia, mas deve ser acompanhado.
- Diretório de execução: pasta onde um comando deve correr para encontrar scripts, dependências e ficheiros esperados.
- Placeholder: campo temporário que obriga a substituir por resultado real antes de fechar o gate.

#### Conceitos teóricos essenciais

- `CANONICO`: `BK-MF6-06` é transversal e entra na matriz como checklist de gate S12.
- `CANONICO`: `PLANO-IMPLEMENTACAO-TOTAL.md` exige gate S12 com cobertura integral, score final e parecer `GO/NO-GO`.
- `CANONICO`: `BACKLOG-MVP.md` exige evidence mínima `pr`, `proof` e `neg` por BK.
- `CANONICO`: `docs/planificacao/README.md` define `bash scripts/validate-planificacao.sh` como comando oficial e exige validação humana no fecho de gate.
- `DERIVADO`: o estado `GO_COM_RESSALVAS` é uma decisão prática para diferenciar falhas não críticas de bloqueios reais.
- Um gate não é só lista de comandos. Ele cruza resultado técnico, risco, responsável e impacto na macrofase seguinte.
- Um comando só é reproduzível quando diz onde deve ser executado. `npm run build` na raiz do repositório não prova o frontend, porque o build Vite pertence a `real_dev/frontend`.
- Um placeholder protege a equipa contra sucesso antecipado. Enquanto existir `PREENCHER_COM_*`, a linha ainda não é evidence final.
- A MF7 depende deste BK para construir matrizes de cobertura RF/RNF com provas reais, não apenas intenção documental.

#### Arquitetura do BK

| Área | Entrada | Saída |
| --- | --- | --- |
| Regressão backend | `docs/evidence/MF6/BK-MF6-01-regressao-backend.md` | Estado backend |
| Regressão frontend | `docs/evidence/MF6/BK-MF6-02-regressao-frontend.md` | Estado frontend |
| Segurança | `docs/evidence/MF6/BK-MF6-03-hardening-seguranca.md` | Estado hardening, privacidade e backups |
| Performance | `docs/evidence/MF6/BK-MF6-04-performance.md` | Estado RNF09..RNF12 |
| Acessibilidade | `docs/evidence/MF6/BK-MF6-05-acessibilidade-ux.md` | Estado RNF01..RNF06 |
| Planificação | `scripts/validate-planificacao.sh` | Conformidade documental |
| Gate final | `docs/evidence/MF6/GATE-S12-MF6.md` | Decisão `GO`, `GO_COM_RESSALVAS` ou `NO_GO` |

#### Ficheiros a criar/editar/rever

- CRIAR: `docs/evidence/MF6/GATE-S12-MF6.md`
- REVER: `docs/evidence/MF6/BK-MF6-01-regressao-backend.md`
- REVER: `docs/evidence/MF6/BK-MF6-02-regressao-frontend.md`
- REVER: `docs/evidence/MF6/BK-MF6-03-hardening-seguranca.md`
- REVER: `docs/evidence/MF6/BK-MF6-04-performance.md`
- REVER: `docs/evidence/MF6/BK-MF6-05-acessibilidade-ux.md`
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- REVER: `docs/planificacao/sprints/PLANO-SPRINTS.md`
- REVER: `real_dev/backend/package.json`
- REVER: `real_dev/frontend/package.json`

#### Tutorial técnico linear

### Passo 1 - Consolidar evidence dos BKs MF6

1. Objetivo funcional do passo no contexto da app.

Confirmar que cada BK da MF6 tem prova mínima antes da decisão de gate.

2. Ficheiros envolvidos:
    - REVER: `docs/evidence/MF6/BK-MF6-01-regressao-backend.md`
    - REVER: `docs/evidence/MF6/BK-MF6-02-regressao-frontend.md`
    - REVER: `docs/evidence/MF6/BK-MF6-03-hardening-seguranca.md`
    - REVER: `docs/evidence/MF6/BK-MF6-04-performance.md`
    - REVER: `docs/evidence/MF6/BK-MF6-05-acessibilidade-ux.md`
    - LOCALIZAÇÃO: secções `Proof`, `Negativos`, `Observações` e referência de entrega.

3. Instruções do que fazer.

Abre cada evidence e confirma que existe `pr`, `proof` e `neg`. Para `BK-MF6-03`, confirma também que o ficheiro agrega o output do scanner, a revisão manual dos módulos críticos e a política de backups. Se faltar uma destas partes, o BK correspondente fica `PENDENTE` ou `FAIL`, nunca `PASS`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é de consolidação documental e validação técnica.

5. Explicação do código.

Não há código porque o gate lê provas produzidas pelos BKs anteriores. O valor deste passo está em não aceitar "feito" sem evidence rastreável.

O dado de entrada é cada ficheiro de evidence. A saída é uma tabela local de decisão por BK. A validação principal é confirmar que cada prova tem comando, resultado real, negativo e referência de entrega.

6. Validação do passo.

Cria uma tabela local com estado por BK: `PASS`, `FAIL` ou `PENDENTE`. Usa `PENDENTE` quando a evidence existe mas ainda tem placeholders. Usa `FAIL` quando existe falha real ou ausência de prova obrigatória.

7. Cenário negativo/erro esperado.

Se `BK-MF6-04` tiver tempos sem comando associado, a linha fica `PENDENTE` e exige correção antes de decisão `GO`.

### Passo 2 - Confirmar comandos por diretório

1. Objetivo funcional do passo no contexto da app.

Garantir que o gate executa cada comando no diretório onde o script e as dependências existem.

2. Ficheiros envolvidos:
    - REVER: `package.json`
    - REVER: `real_dev/backend/package.json`
    - REVER: `real_dev/frontend/package.json`
    - LOCALIZAÇÃO: secção `scripts` de cada ficheiro.

3. Instruções do que fazer.

Confirma que os comandos de backend correm em `real_dev/backend`, os comandos de frontend correm em `real_dev/frontend` e os comandos documentais correm na raiz do repositório.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é de verificação operacional dos scripts existentes.

5. Explicação do código.

O backend e o frontend têm `package.json` próprios. Isto significa que um comando curto como `npm run build` só é correto se for executado dentro de `real_dev/frontend` ou se usar `npm --prefix real_dev/frontend run build`.

Esta distinção evita um erro comum no gate: registar sucesso para um comando que não correu no local certo. O gate deve ser repetível por qualquer colega, por isso cada linha precisa de diretório, comando e resultado real.

6. Validação do passo.

Confirma esta correspondência:

- raiz do repositório: `git diff --check` e `bash scripts/validate-planificacao.sh`;
- `real_dev/backend`: `node --test`, `npm test`, `npm run smoke`, scripts de regressão e scripts de hardening/performance;
- `real_dev/frontend`: `node scripts/check-frontend-regression.mjs` e `npm run build`.

7. Cenário negativo/erro esperado.

Se `npm run build` for executado na raiz, o comando não valida o frontend. O resultado deve ficar `FAIL` ou `PENDENTE`, com nota a indicar que o comando correto é `cd real_dev/frontend && npm run build`.

### Passo 3 - Criar ficheiro do gate S12 da MF6

1. Objetivo funcional do passo no contexto da app.

Criar a matriz final de decisão da macrofase sem sucesso antecipado.

2. Ficheiros envolvidos:
    - CRIAR: `docs/evidence/MF6/GATE-S12-MF6.md`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria o ficheiro abaixo e substitui cada `PREENCHER_COM_*` apenas depois de consultar evidence real, executar o comando indicado ou obter decisão assinável do orientador. Não escrevas `PASS`, `GO` ou `GO_COM_RESSALVAS` por antecipação.

4. Código completo, correto e integrado com a app final.

```md
# Gate S12 - MF6 Hardening técnico

- Data: PREENCHER_COM_DATA_REAL
- Owner do gate: Nuno
- Apoio: Matheus, Mateus, Davi, Kaue
- Branch/entrega: PREENCHER_COM_REFERENCIA_DA_ENTREGA
- Decisão: PREENCHER_COM_GO_OU_GO_COM_RESSALVAS_OU_NO_GO
- Justificação da decisão: PREENCHER_COM_JUSTIFICACAO_OBJETIVA

## Regra de decisão

- `GO`: todos os BKs têm `proof` e `neg` reais, sem falhas críticas abertas.
- `GO_COM_RESSALVAS`: não existem falhas críticas, mas há riscos residuais explícitos aceites pelo orientador.
- `NO_GO`: existe falha crítica, evidence obrigatória em falta ou comando essencial sem resultado real.

## Matriz de validação

| BK | Área | Evidence consultada | Proof | Negativos | Estado | Risco residual | Responsável pela validação |
| --- | --- | --- | --- | --- | --- | --- | --- |
| BK-MF6-01 | Regressão backend | `docs/evidence/MF6/BK-MF6-01-regressao-backend.md` | PREENCHER_COM_PASS_OU_FAIL_OU_PENDENTE | PREENCHER_COM_PASS_OU_FAIL_OU_PENDENTE | PREENCHER_COM_PASS_OU_FAIL_OU_PENDENTE | PREENCHER_COM_RISCO_REAL | PREENCHER_COM_NOME |
| BK-MF6-02 | Regressão frontend | `docs/evidence/MF6/BK-MF6-02-regressao-frontend.md` | PREENCHER_COM_PASS_OU_FAIL_OU_PENDENTE | PREENCHER_COM_PASS_OU_FAIL_OU_PENDENTE | PREENCHER_COM_PASS_OU_FAIL_OU_PENDENTE | PREENCHER_COM_RISCO_REAL | PREENCHER_COM_NOME |
| BK-MF6-03 | Segurança e privacidade | `docs/evidence/MF6/BK-MF6-03-hardening-seguranca.md` | PREENCHER_COM_PASS_OU_FAIL_OU_PENDENTE | PREENCHER_COM_PASS_OU_FAIL_OU_PENDENTE | PREENCHER_COM_PASS_OU_FAIL_OU_PENDENTE | PREENCHER_COM_RISCO_REAL | PREENCHER_COM_NOME |
| BK-MF6-04 | Performance | `docs/evidence/MF6/BK-MF6-04-performance.md` | PREENCHER_COM_PASS_OU_FAIL_OU_PENDENTE | PREENCHER_COM_PASS_OU_FAIL_OU_PENDENTE | PREENCHER_COM_PASS_OU_FAIL_OU_PENDENTE | PREENCHER_COM_RISCO_REAL | PREENCHER_COM_NOME |
| BK-MF6-05 | Acessibilidade e UX | `docs/evidence/MF6/BK-MF6-05-acessibilidade-ux.md` | PREENCHER_COM_PASS_OU_FAIL_OU_PENDENTE | PREENCHER_COM_PASS_OU_FAIL_OU_PENDENTE | PREENCHER_COM_PASS_OU_FAIL_OU_PENDENTE | PREENCHER_COM_RISCO_REAL | PREENCHER_COM_NOME |

## Comandos executados

| Diretório | Comando | Resultado real | Output/resumo anexado |
| --- | --- | --- | --- |
| Raiz do repositório | `git diff --check` | PREENCHER_COM_PASS_OU_FAIL | PREENCHER_COM_OUTPUT_REAL |
| Raiz do repositório | `bash scripts/validate-planificacao.sh` | PREENCHER_COM_PASS_OU_FAIL | PREENCHER_COM_OUTPUT_REAL |
| `real_dev/backend` | `node --test tests/regression/mf6-backend-regression.test.js` | PREENCHER_COM_PASS_OU_FAIL_OU_PENDENTE | PREENCHER_COM_OUTPUT_REAL |
| `real_dev/backend` | `npm test` | PREENCHER_COM_PASS_OU_FAIL_OU_PENDENTE | PREENCHER_COM_OUTPUT_REAL |
| `real_dev/backend` | `npm run smoke` | PREENCHER_COM_PASS_OU_FAIL_OU_PENDENTE | PREENCHER_COM_OUTPUT_REAL |
| `real_dev/backend` | `node scripts/check-security-baseline.mjs` | PREENCHER_COM_PASS_OU_FAIL_OU_PENDENTE | PREENCHER_COM_OUTPUT_REAL |
| `real_dev/backend` | `FAITHFLIX_API_BASE_URL=http://127.0.0.1:3000 FAITHFLIX_SESSION_COOKIE=*** node scripts/measure-performance-baseline.mjs` | PREENCHER_COM_PASS_OU_FAIL_OU_PENDENTE | PREENCHER_COM_OUTPUT_SEM_COOKIE |
| `real_dev/frontend` | `node scripts/check-frontend-regression.mjs` | PREENCHER_COM_PASS_OU_FAIL_OU_PENDENTE | PREENCHER_COM_OUTPUT_REAL |
| `real_dev/frontend` | `npm run build` | PREENCHER_COM_PASS_OU_FAIL_OU_PENDENTE | PREENCHER_COM_OUTPUT_REAL |

## Negativos consolidados

| Área | Negativo obrigatório | Evidence | Estado |
| --- | --- | --- | --- |
| Backend | pedido admin anónimo ou role comum rejeitado | PREENCHER_COM_EVIDENCE | PREENCHER_COM_PASS_OU_FAIL_OU_PENDENTE |
| Frontend | rota ou import inválido falha de forma previsível | PREENCHER_COM_EVIDENCE | PREENCHER_COM_PASS_OU_FAIL_OU_PENDENTE |
| Segurança | segredo literal em cópia local faz o scanner falhar | PREENCHER_COM_EVIDENCE | PREENCHER_COM_PASS_OU_FAIL_OU_PENDENTE |
| Performance | pedido inválido não devolve sucesso | PREENCHER_COM_EVIDENCE | PREENCHER_COM_PASS_OU_FAIL_OU_PENDENTE |
| UX | navegação só com teclado revela foco e falhas reais | PREENCHER_COM_EVIDENCE | PREENCHER_COM_PASS_OU_FAIL_OU_PENDENTE |

## Riscos residuais

| Risco | Severidade | Aceite por | Ação de acompanhamento |
| --- | --- | --- | --- |
| PREENCHER_COM_RISCO_OU_NENHUM | PREENCHER_COM_BAIXA_MEDIA_ALTA | PREENCHER_COM_NOME | PREENCHER_COM_ACAO |

## Handoff para MF7

`BK-MF7-01` deve usar este ficheiro como fonte inicial para ligar RF ativos a evidence. `BK-MF7-02` deve reutilizar os resultados de RNF da MF6 e completar os RNF que pertencem à MF7.
```

5. Explicação do código.

O ficheiro é Markdown, mas funciona como contrato técnico de gate. Ele separa evidence consultada, proof, negativos, estado, risco e responsável. Esta separação impede que uma limitação real fique escondida dentro de um `PASS` genérico.

As entradas são os ficheiros de evidence dos BKs `BK-MF6-01` a `BK-MF6-05` e os comandos executados no diretório correto. A saída é a decisão final da MF6. A validação acontece quando cada placeholder é substituído por output real, nota objetiva ou decisão assinável.

O campo `FAITHFLIX_SESSION_COOKIE=***` mostra que o cookie pode ser usado no terminal local para medir recomendações, mas o valor real nunca deve entrar na evidence. Isto protege a sessão e evita partilhar dados sensíveis.

Podes acrescentar linhas se a equipa executar comandos adicionais. Não apagues as linhas mínimas de regressão, segurança, performance, UX, `git diff --check` e `validate-planificacao.sh`, porque são a base do gate S12.

6. Validação do passo.

O ficheiro só está completo se não existir nenhum `PREENCHER_COM_*`, se cada comando tiver diretório, output real e responsável, e se a decisão final estiver justificada.

7. Cenário negativo/erro esperado.

Se existir uma falha crítica de segurança aberta, a decisão deve ser `NO_GO`, mesmo que performance e UX estejam verdes.

### Passo 4 - Executar validações oficiais e técnicas

1. Objetivo funcional do passo no contexto da app.

Confirmar que a documentação, o diff e os comandos de gate estão limpos antes de avançar para MF7.

2. Ficheiros envolvidos:
    - REVER: `scripts/validate-planificacao.sh`
    - REVER: `real_dev/backend/package.json`
    - REVER: `real_dev/frontend/package.json`
    - REVER: alterações locais da entrega
    - LOCALIZAÇÃO: raiz do repositório, `real_dev/backend` e `real_dev/frontend`.

3. Instruções do que fazer.

Executa os comandos abaixo no diretório indicado. Se um comando não existir porque o BK anterior ainda não foi executado, regista `PENDENTE`, indica o BK que deve criar esse ficheiro e não feches o gate como `GO`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A validação usa scripts oficiais do projeto, Git e comandos criados pelos BKs anteriores de MF6.

5. Explicação do código.

`git diff --check` apanha espaços finais e conflitos de patch. `validate-planificacao.sh` valida consistência canónica entre backlog, matriz e guias. Os comandos de backend validam regressão, smoke e hardening. Os comandos de frontend validam regressão de rotas e build Vite.

O erro que este passo evita é fechar a MF6 com comandos escritos no papel, mas nunca executados no sítio certo.

6. Validação do passo.

```bash
git diff --check
bash scripts/validate-planificacao.sh

cd real_dev/backend
node --test tests/regression/mf6-backend-regression.test.js
npm test
npm run smoke
node scripts/check-security-baseline.mjs
FAITHFLIX_API_BASE_URL=http://127.0.0.1:3000 FAITHFLIX_SESSION_COOKIE="faithflix_session=VALOR_LOCAL" node scripts/measure-performance-baseline.mjs

cd ../frontend
node scripts/check-frontend-regression.mjs
npm run build
```

Resultado esperado: comandos executados no diretório correto, com `PASS`, `FAIL` ou `PENDENTE` registado no gate. `PENDENTE` bloqueia `GO`.

7. Cenário negativo/erro esperado.

Se o medidor de performance precisar de API local ligada e a API estiver desligada, o resultado deve ficar `PENDENTE` ou `FAIL` com erro resumido. Não transformes essa falha em sucesso.

### Passo 5 - Validar coerência MF5 -> MF6 -> MF7

1. Objetivo funcional do passo no contexto da app.

Confirmar que a sequência documental não quebra o plano da PAP.

2. Ficheiros envolvidos:
    - REVER: `docs/planificacao/guias-bk/MF5/BK-MF5-06-configuracao-de-integracoes-admin.md`
    - REVER: `docs/planificacao/guias-bk/MF6/*.md`
    - REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-01-matriz-de-cobertura-rf-evidencia.md`
    - REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-02-matriz-de-cobertura-rnf-validacao.md`
    - LOCALIZAÇÃO: headers e secções de handoff.

3. Instruções do que fazer.

Confirma que `BK-MF5-06` entrega para `BK-MF6-01`, que a MF6 fecha em `BK-MF6-06`, que `BK-MF7-01` depende de `BK-MF6-06` e que `BK-MF7-02` reutiliza os resultados RNF da MF6.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. O passo valida dependências e handoff documental.

5. Explicação do código.

MF6 é ponte entre implementação e evidências PAP. Se o handoff falhar, MF7 vai criar matrizes sem provas técnicas reais.

O dado de entrada é a cadeia de headers e handoffs. A saída é a confiança de que `BK-MF7-01` e `BK-MF7-02` sabem exatamente que evidence devem consumir.

6. Validação do passo.

Os headers devem manter:

- `BK-MF5-06` com `proximo_bk`: `BK-MF6-01`;
- `BK-MF6-06` com `proximo_bk`: `BK-MF7-01`;
- `BK-MF7-01` com `dependencias`: `BK-MF6-06`;
- `BK-MF7-02` com `dependencias`: `BK-MF6-06`.

7. Cenário negativo/erro esperado.

Se algum guia apontar para BK inexistente ou fora de ordem, o gate fica bloqueado por drift documental.

#### Critérios de aceite

- `GATE-S12-MF6.md` existe e consolida os BKs `BK-MF6-01..05`.
- O ficheiro de gate não contém `PASS`, `GO` ou `GO_COM_RESSALVAS` como resultado final antes de output real.
- Cada linha de comando tem diretório explícito.
- `git diff --check` passa.
- `bash scripts/validate-planificacao.sh` passa ou a falha fica registada com erro exato.
- Comandos backend e frontend ficam registados como `PASS`, `FAIL` ou `PENDENTE`, nunca como sucesso assumido.
- Coerência MF5 -> MF6 -> MF7 confirmada.
- Decisão final do gate está explícita: `GO`, `GO_COM_RESSALVAS` ou `NO_GO`, com justificação.

#### Validação final

```bash
git diff --check
bash scripts/validate-planificacao.sh

cd real_dev/backend
node --test tests/regression/mf6-backend-regression.test.js
npm test
npm run smoke
node scripts/check-security-baseline.mjs
FAITHFLIX_API_BASE_URL=http://127.0.0.1:3000 FAITHFLIX_SESSION_COOKIE="faithflix_session=VALOR_LOCAL" node scripts/measure-performance-baseline.mjs

cd ../frontend
node scripts/check-frontend-regression.mjs
npm run build
```

#### Evidence para PR/defesa

- `pr`: referência do PR ou entrega local com gate MF6.
- `proof`: matriz `GATE-S12-MF6.md`, outputs dos comandos oficiais e evidence dos BKs `BK-MF6-01..05`.
- `neg`: evidence incompleta, falha de validador, comando no diretório errado, ausência de output real e drift de dependência.
- `decisão`: `GO`, `GO_COM_RESSALVAS` ou `NO_GO`, com responsável e justificação.

#### Handoff

`BK-MF7-01` deve iniciar a matriz RF a partir das evidências consolidadas neste gate. `BK-MF7-02` deve completar a matriz RNF com os resultados de segurança, performance, UX e operação.

Se alguma linha do gate estiver `PENDENTE` ou `FAIL`, MF7 deve tratar essa linha como risco de cobertura e não como prova fechada.

#### Changelog

- `2026-04-13`: guia inicial criado em formato genérico.
- `2026-06-18`: guia revisto com matriz de gate, comandos oficiais e handoff explícito para MF7.
- `2026-06-20`: gate corrigido para remover sucesso antecipado, usar placeholders seguros e indicar comandos com diretório explícito.
