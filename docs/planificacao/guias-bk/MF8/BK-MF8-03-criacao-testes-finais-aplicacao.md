# BK-MF8-03 - Criação de testes finais da aplicação

## Header

- `doc_id`: `GUIA-BK-MF8-03`
- `bk_id`: `BK-MF8-03`
- `macro`: `MF8`
- `owner`: `Matheus`
- `apoio`: `Davi, Kaue`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF8-02`
- `rf_rnf`: `RNF29`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF8-04`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-03-criacao-testes-finais-aplicacao.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais desenhar a bateria final de testes do FaithFlix antes da execução consolidada. O trabalho não é apenas listar comandos: é explicar cada teste individualmente, indicar o que valida, porque é necessário, que risco cobre, que dados usa, quais são as assertions principais e como deve ser criado um teste quando a cobertura ainda não existe.

O resultado observável é `docs/evidence/MF8/TESTES-FINAIS-CRIADOS.md`, que deve funcionar como contrato pedagógico e técnico para `BK-MF8-08`.

#### Importância

Sem uma matriz explícita, a equipa pode executar testes sem saber que requisito está a proteger. Este BK transforma `RNF29` numa suite compreensível: cada teste tem um `id`, uma razão, um expected result e uma decisão quando falha.

Isto reduz três riscos críticos da defesa: testes sem ligação ao produto, lacunas escondidas e falhas registadas sem contexto suficiente para correção.

#### Scope-in

- Inventariar testes e comandos existentes em `backend/`, `frontend/`, `tests/` e `scripts/`.
- Explicar cada teste através de uma matriz obrigatória com `id`, camada, ficheiro, comando, RF/RNF, validação, razão, dados, assertions, negativo, expected result, falha e classificação.
- Definir a cobertura mínima esperada para backend unitário, integração HTTP, smoke backend, regressão/hardening, build/smoke frontend, testes manuais críticos e testes visuais/responsivos.
- Dar instruções claras para criar testes em falta, com localização pública, nome do ficheiro, estrutura base, setup mínimo, assertion positiva, negativo obrigatório e comando de execução.
- Preparar o handoff para `BK-MF8-08`, onde cada execução deve referenciar o `id` definido neste BK.

#### Scope-out

- Executar toda a bateria final de testes; isso pertence a `BK-MF8-08`.
- Corrigir erros encontrados durante execução; isso pertence a `BK-MF8-09`.
- Alterar código funcional da aplicação neste BK.
- Inventar scripts como se já existissem sem os marcar como `NAO_EXISTE`.
- Criar testes sem ligação a RF/RNF, risco de produto ou fluxo crítico.

#### Estado antes e depois

- Antes: `BK-MF8-02` fecha a estabilidade visual final e deixa uma base de riscos visuais a cobrir.
- Depois: existe uma matriz de testes pronta para execução, com testes existentes, testes em falta, instruções de criação e critérios de decisão para `BK-MF8-08`.

#### Pré-requisitos

- Ler `BK-MF8-02` antes de iniciar este BK.
- Confirmar que a MF8 ativa tem exatamente `10` guias formais, de `BK-MF8-01` a `BK-MF8-10`.
- Consultar `BACKLOG-MVP.md`, `MATRIZ-CANONICA-BK.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md` e `PLANO-SPRINTS.md`.
- Criar ou atualizar `docs/evidence/MF8/TESTES-FINAIS-CRIADOS.md` com matriz de testes, lacunas, instruções de criação, negativos e decisão final.
- Executar `bash scripts/validate-planificacao.sh` e `git diff --check` antes de fechar o BK.

#### Glossário

- `Teste unitário`: valida uma regra isolada, como validação de input, cálculo, normalização ou decisão de service.
- `Teste de integração HTTP`: valida que rota, controller, middleware e resposta HTTP funcionam em conjunto.
- `Teste smoke`: verificação curta que confirma que a aplicação arranca e que os fluxos essenciais respondem.
- `Regressão`: teste que impede a reaparição de uma falha já corrigida ou de um contrato já fechado.
- `Hardening`: validação de segurança, permissões, headers, inputs inválidos e comportamento defensivo.
- `Assertion`: verificação objetiva feita pelo teste, por exemplo `status` esperado, campo obrigatório ou erro controlado.
- `Fixture`: dados de teste previsíveis usados para repetir um cenário.
- `Setup`: preparação mínima antes do teste, como arrancar servidor local, criar dados ou configurar headers.
- `Negativo`: cenário que deve falhar de forma controlada e segura.
- `Cobertura mínima`: conjunto obrigatório de testes que protege os riscos principais da aplicação.
- `Teste manual crítico`: verificação humana de um fluxo essencial quando a automatização ainda não cobre o risco.

#### Conceitos teóricos essenciais

- `CANONICO`: `RNF29` exige validação técnica; neste BK entra como matriz de testes e sai como contrato de execução para `BK-MF8-08`.
- `CANONICO`: testes backend protegem validação, autorização, integridade de dados e respostas HTTP; evitam regressões invisíveis no frontend.
- `CANONICO`: build e smoke frontend confirmam que a interface compila e que os fluxos principais continuam acessíveis ao utilizador.
- `DERIVADO`: cada teste precisa de explicar o risco que cobre; caso contrário, um `PASS` técnico não prova qualidade funcional.
- `DERIVADO`: testes negativos mostram que a equipa tentou quebrar o sistema de forma controlada, não apenas confirmar o caminho feliz.
- `DERIVADO`: quando falta um teste, a decisão correta não é esconder a lacuna; é escolher entre teste automático, teste manual, risco aceite ou fora de scope com justificação.

#### Arquitetura do BK

| Camada | Artefacto | Responsabilidade |
| --- | --- | --- |
| Guia | `docs/planificacao/guias-bk/MF8/BK-MF8-03-criacao-testes-finais-aplicacao.md` | Explica o desenho, a criação e os critérios pedagógicos da suite final. |
| Evidence | `docs/evidence/MF8/TESTES-FINAIS-CRIADOS.md` | Guarda matriz por teste, lacunas, instruções de criação e handoff. |
| Backend | `backend/tests/unit/`, `backend/tests/integration/`, `backend/tests/smoke/`, `backend/tests/regression/` | Local público esperado para testes automáticos backend. |
| Frontend | `frontend/`, `frontend/tests/`, `tests/`, `scripts/` | Locais públicos esperados para build, smoke, regressão e validações de UI. |
| Planeamento | `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` | Fontes de owner, dependências, prioridade e RF/RNF. |

#### Ficheiros a criar/editar/rever

- CRIAR/EDITAR: `docs/evidence/MF8/TESTES-FINAIS-CRIADOS.md`
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- REVER: `docs/planificacao/backlogs/MF-VIEWS.md`
- REVER: `docs/planificacao/sprints/PLANO-SPRINTS.md`
- REVER: `backend/package.json`
- REVER: `frontend/package.json`
- REVER: `backend/tests/unit/`
- REVER: `backend/tests/integration/`
- REVER: `backend/tests/smoke/`
- REVER: `backend/tests/regression/`
- REVER: `frontend/`, `tests/` e `scripts/` quando o passo pedir validação técnica.

#### Tutorial técnico linear

### Passo 1 - Inventariar testes existentes e testes mínimos esperados

1. Objetivo funcional do passo no contexto da app.

Listar todos os testes e comandos já existentes e confirmar se cobrem a bateria mínima esperada para a entrega final.

2. Ficheiros envolvidos:
    - CRIAR: `docs/evidence/MF8/TESTES-FINAIS-CRIADOS.md`
    - EDITAR: `docs/evidence/MF8/TESTES-FINAIS-CRIADOS.md`
    - REVER: `backend/package.json`, `frontend/package.json`, `backend/tests/`, `frontend/`, `tests/`, `scripts/`
    - LOCALIZAÇÃO: secção do passo 1 em `docs/evidence/MF8/TESTES-FINAIS-CRIADOS.md`.

3. Instruções do que fazer.

Consulta os `package.json`, as pastas de testes e os scripts técnicos. Para cada item encontrado, regista o comando real, o ficheiro principal, a camada, o requisito associado e o estado `EXISTE` ou `NAO_EXISTE`.

**Testes mínimos esperados:**

A cobertura mínima esperada neste BK é:

| ID mínimo | Camada | Ficheiro ou artefacto público | Comando/procedimento | O que deve existir |
| --- | --- | --- | --- | --- |
| `TST-MF8-BE-UNIT-VALIDACAO` | Backend unitário | `backend/tests/unit/*.test.js` | `npm --prefix backend test` | Testes de validação de input, regras de domínio e negativos sem HTTP. |
| `TST-MF8-BE-INT-HTTP` | Backend integração HTTP | `backend/tests/integration/*.test.js` | `npm --prefix backend test` | Testes de rotas, status codes, payloads, auth e fluxo entre camadas. |
| `TST-MF8-BE-SMOKE-HEALTH` | Backend smoke | `backend/tests/smoke/app.smoke.test.js` | `npm --prefix backend run smoke` | Health-check, rota base da API, sessão anónima e negativos públicos. |
| `TST-MF8-BE-REG-HARDENING` | Backend regressão/hardening | `backend/tests/regression/*.test.js`, `backend/scripts/check-security-baseline.mjs` | `npm --prefix backend test`; scanner executado dentro de `backend` | Proteção contra regressões, autorização indevida, inputs inválidos e contratos de segurança. |
| `TST-MF8-BE-ADMIN-ATOMIC` | Backend unitário/transacional | `backend/tests/unit/f3-admin-transactions.test.js` | `node --test backend/tests/unit/f3-admin-transactions.test.js` | Concorrência, fault injection e rollback total em candidatura/review, membership e gestão de utilizadores. |
| `TST-MF8-FE-BUILD` | Frontend build | `frontend/` | `npm --prefix frontend run build` | A interface compila sem erros e sem dependências quebradas. |
| `TST-MF8-FE-SMOKE` | Frontend smoke | `frontend/`, `tests/` | `npm --prefix frontend run smoke` | Fluxos principais abrem, navegação crítica responde e o estado inicial é utilizável. |
| `TST-MF8-FE-REG` | Frontend regressão | `frontend/scripts/` | scanner executado dentro de `frontend` | Regras visuais, rotas e contratos de UI não regressam. |
| `TST-MF8-MANUAL-CRITICO` | Manual funcional | `docs/evidence/MF8/TESTES-FINAIS-CRIADOS.md` | Procedimento manual controlado | Login, catálogo, detalhe, reprodução, subscrição, admin e privacidade têm prova humana quando necessário. |
| `TST-MF8-VISUAL-RESP` | Visual/responsivo | `test-results/`; publicação revista em `docs/evidence/MF8/screenshots/` | Playwright formal sobre `backend/` e `frontend/` | Layouts principais continuam legíveis em desktop e mobile. |

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Este passo é de inventário e decisão técnica: o resultado é uma matriz documentada, não uma alteração à aplicação.

Como não há código neste passo, a explicação incide sobre a razão de cada camada: unitários apanham regras pequenas, integração HTTP apanha contratos reais, smoke apanha quebras de arranque, build/smoke frontend apanha quebras de UI, manuais e visuais cobrem riscos que ainda não têm automatização suficiente.

6. Validação do passo.

A validação passa quando todos os IDs mínimos aparecem na evidence com estado `EXISTE`, `NAO_EXISTE`, `MANUAL`, `BLOQUEADO` ou `NAO_APLICAVEL`, sempre com justificação.

7. Cenário negativo/erro esperado.

Se um comando for assumido sem existir no `package.json` ou na pasta indicada, marca `NAO_EXISTE` e cria uma instrução de criação no passo 4 ou uma decisão manual no passo 5.

### Passo 2 - Definir a matriz pedagógica obrigatória por teste

1. Objetivo funcional do passo no contexto da app.

Transformar cada teste num item compreensível, rastreável e executável por outra pessoa.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/TESTES-FINAIS-CRIADOS.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 2 em `docs/evidence/MF8/TESTES-FINAIS-CRIADOS.md`.

3. Instruções do que fazer.

Para cada teste existente ou planeado, preenche uma linha com todos estes campos obrigatórios:

| Campo | O que escrever |
| --- | --- |
| `id` | Identificador estável, por exemplo `TST-MF8-BE-SMOKE-HEALTH`. |
| `camada` | Backend unitário, backend HTTP, backend smoke, frontend build, frontend smoke, manual ou visual. |
| `ficheiro` | Caminho público do teste ou artefacto, por exemplo `backend/tests/smoke/app.smoke.test.js`. |
| `comando` | Comando de execução ou procedimento manual. |
| `RF/RNF` | Requisito protegido, como `RNF29`, `RNF21`, `RNF22` ou RF funcional aplicável. |
| `o que valida` | Comportamento objetivo que o teste verifica. |
| `porque é necessário` | Risco concreto que o teste cobre. |
| `dados usados` | Fixture, payload, utilizador, viewport ou estado inicial. |
| `assertions principais` | Verificações essenciais, como status, campo obrigatório, erro controlado ou screenshot aprovado. |
| `cenário negativo` | Caso inválido ou fluxo bloqueado que deve falhar com segurança. |
| `expected result` | Resultado esperado mensurável. |
| `quando falha` | Sinal de falha e impacto provável. |
| `como corrigir ou classificar` | Encaminhamento: corrigir código em BK próprio, classificar como ambiente, documentar limitação ou aceitar risco. |

Modelo de linha preenchida:

| id | camada | ficheiro | comando | RF/RNF | o que valida | porque é necessário | dados usados | assertions principais | cenário negativo | expected result | quando falha | como corrigir ou classificar |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `TST-MF8-BE-SMOKE-HEALTH` | Backend smoke | `backend/tests/smoke/app.smoke.test.js` | `npm --prefix backend run smoke` | `RNF29` | `/health`, `/api`, CORS local, sessão anónima e 404 JSON. | Confirma que a API arranca e responde antes de testes mais longos. | Servidor local de teste, requests HTTP e cookie inválido. | `status 200`, `status ok`, header `x-request-id`, `status 404`, `user null`. | Cookie de sessão inválido e rota inexistente. | API responde sem autenticar utilizador falso e sem crash. | Falha indica arranque quebrado, middleware mal configurado ou contrato HTTP instável. | Corrigir em BK de correção se for bug; classificar como ambiente se o servidor não arrancar por dependência local. |

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

A matriz é a peça técnica principal: ela obriga cada teste a explicar o que faz, porquê existe e como deve ser tratado quando falha.

Como não há código neste passo, a explicação incide sobre rastreabilidade: um teste só conta para a defesa se for possível ligar `id`, RF/RNF, comando, expected result, risco e decisão.

6. Validação do passo.

A validação passa quando não existe nenhum teste com campos vazios na matriz obrigatória.

7. Cenário negativo/erro esperado.

Linha sem `expected result`, sem cenário negativo ou sem explicação de risco fica incompleta e não pode seguir para `BK-MF8-08`.

### Passo 3 - Classificar lacunas de teste

1. Objetivo funcional do passo no contexto da app.

Identificar testes em falta e decidir se cada lacuna exige teste automático, teste manual, risco aceite ou exclusão justificada.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/TESTES-FINAIS-CRIADOS.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 3 em `docs/evidence/MF8/TESTES-FINAIS-CRIADOS.md`.

3. Instruções do que fazer.

Usa esta regra de decisão:

| Situação encontrada | Decisão correta |
| --- | --- |
| Regra determinística, repetível e ligada a risco P0/P1 | Criar teste automático. |
| Endpoint, middleware, autorização ou contrato HTTP crítico | Criar teste de integração HTTP ou smoke. |
| Build, import, rota ou dependência frontend crítica | Criar ou executar build/smoke frontend. |
| Fluxo depende de julgamento visual, usabilidade ou sequência humana complexa | Criar teste manual crítico com expected result e prova. |
| Risco baixo, dependente de serviço externo ou bloqueado por ambiente local | Registar `PASS_COM_RESSALVAS`, `BLOQUEADO` ou risco aceite com owner. |
| Item sem ligação a RF/RNF, defesa ou fluxo da aplicação | Classificar como fora de scope com justificação. |

Cada lacuna deve ter:

- `id` novo ou `id` mínimo afetado.
- Risco que fica descoberto.
- Tipo de teste a criar.
- Ficheiro público recomendado.
- Comando esperado.
- Owner.
- Prioridade.
- Decisão final.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Ainda estás a decidir o que falta; a criação orientada de testes entra no passo 4.

Como não há código neste passo, a explicação incide sobre priorização: automatiza o que é repetível e crítico; documenta manualmente o que exige julgamento visual; bloqueia apenas quando a equipa não consegue recolher prova sem alterar dependências externas.

6. Validação do passo.

A validação passa quando nenhuma lacuna P0/P1 fica sem decisão, ficheiro recomendado e expected result.

7. Cenário negativo/erro esperado.

Se uma lacuna disser apenas "falta teste" sem indicar risco, ficheiro, comando e owner, o BK fica `PASS_COM_RESSALVAS`.

### Passo 4 - Como criar testes em falta

1. Objetivo funcional do passo no contexto da app.

Ensinar como criar testes automáticos quando a matriz mostra que falta cobertura backend ou frontend repetível.

2. Ficheiros envolvidos:
    - CRIAR: apenas se a lacuna exigir, por exemplo `backend/tests/unit/mf8-final-validation.test.js`, `backend/tests/integration/mf8-http-final.test.js` ou `backend/tests/smoke/mf8-critical-smoke.test.js`
    - EDITAR: `docs/evidence/MF8/TESTES-FINAIS-CRIADOS.md`
    - REVER: `backend/tests/`, `backend/package.json`, `frontend/package.json`
    - LOCALIZAÇÃO: secção do passo 4 em `docs/evidence/MF8/TESTES-FINAIS-CRIADOS.md`.

3. Instruções do que fazer.

**Como criar testes em falta:**

Cria teste automático quando o comportamento é repetível, tem expected result claro e pode correr por comando local. Usa `node:test` e `node:assert/strict` no backend. O nome do ficheiro deve indicar a camada e o risco, por exemplo:

- `backend/tests/unit/mf8-final-validation.test.js`
- `backend/tests/unit/f3-admin-transactions.test.js`
- `backend/tests/integration/mf8-http-final.test.js`
- `backend/tests/smoke/mf8-critical-smoke.test.js`
- `backend/tests/regression/mf8-security-regression.test.js`

Estrutura mínima obrigatória:

- Importar `test` de `node:test`.
- Importar `assert` de `node:assert/strict`.
- Preparar setup mínimo, como servidor local ou dados controlados.
- Escrever pelo menos uma assertion positiva.
- Escrever pelo menos um cenário negativo.
- Para operações multi-write, injetar falha depois da primeira escrita e provar
  que estado de domínio, sessões e audit log regressam juntos ao snapshot.
- Para invariantes concorrentes, executar duas operações em paralelo e provar
  que só uma confirma quando ambas não podem ser válidas.
- Fechar servidor, ligação ou recurso aberto no fim do teste.
- Executar com o comando registado na matriz.

4. Código completo, correto e integrado com a app final.

Modelo completo para um smoke backend novo:

```js
// backend/tests/smoke/mf8-critical-smoke.test.js
/**
 * @file Testes smoke finais da MF8 para confirmar que a API arranca,
 * responde a pedidos públicos essenciais e rejeita sessões inválidas.
 */

import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { startTestServer } from "../helpers/test-server.js";

let testServer;

before(async () => {
    // O servidor de teste arranca uma vez para a suite para manter os testes rápidos e repetíveis.
    testServer = await startTestServer();
});

after(async () => {
    if (testServer) {
        // Fechar o servidor evita portas presas e falhas falsas nos testes seguintes.
        await testServer.close();
    }
});

test("TST-MF8-BE-SMOKE-HEALTH confirma health-check operacional", async () => {
    // O health-check é o primeiro sinal de que middleware, logging e resposta JSON estão operacionais.
    const response = await fetch(`${testServer.baseUrl}/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.ok(response.headers.get("x-request-id"));
    assert.equal(body.status, "ok");
});

test("TST-MF8-BE-SMOKE-HEALTH rejeita sessão falsa sem autenticar", async () => {
    // O cookie falso prova que a API não transforma identificadores inventados em sessão válida.
    const response = await fetch(`${testServer.baseUrl}/api/session/me`, {
        headers: {
            Cookie: "faithflix_session=falso",
        },
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.user, null);
});
```

Para criar um teste unitário em falta, segue o mesmo padrão: importa a função real a validar, cria um caso válido, cria um caso inválido e liga o `id` do teste ao comentário ou ao nome do `test`.

Modelo de unidade para validação de dados:

```js
// backend/tests/unit/mf8-final-validation.test.js
/**
 * @file Testes unitários finais para garantir que validações críticas
 * aceitam dados válidos e rejeitam dados inválidos antes de chegar ao HTTP.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
    assertSearchQuery,
    parsePagination,
} from "../../src/modules/search/search.validation.js";

test("TST-MF8-BE-UNIT-VALIDACAO aceita pesquisa com tamanho válido", () => {
    // O caso válido confirma que o teste protege o comportamento esperado antes de testar erros.
    const query = assertSearchQuery("faith");
    // A paginação é validada junto da pesquisa porque ambos chegam normalmente pela query string.
    const pagination = parsePagination({ page: "1", limit: "12" });

    assert.equal(query, "faith");
    assert.deepEqual(pagination, {
        page: 1,
        limit: 12,
    });
});

test("TST-MF8-BE-UNIT-VALIDACAO rejeita pesquisa demasiado curta", () => {
    // O negativo impede que o frontend ou a API aceitem pesquisas sem utilidade para o utilizador.
    assert.throws(() => assertSearchQuery("f"), /pesquisa/);
});
```

Se o módulo público tiver sido renomeado durante o projeto, usa o validador existente no `backend/src/` que cobre o mesmo RF/RNF e atualiza a matriz com o ficheiro correto.

5. Explicação do código.

No smoke, `before` arranca a API uma vez para a suite e `after` fecha o servidor para não deixar portas abertas. O primeiro teste confirma que `/health` responde com `200`, `x-request-id` e estado `ok`. O segundo teste é o negativo obrigatório: envia um cookie falso e confirma que a sessão continua anónima.

No unitário, o primeiro teste confirma o caminho válido e o segundo confirma que input inválido é rejeitado com erro previsível. O objetivo não é testar tudo no mesmo ficheiro; é criar testes pequenos, legíveis e ligados ao `id` da matriz.

6. Validação do passo.

A validação passa quando o teste criado corre pelo comando registado, inclui positivo e negativo, usa assertions explícitas e tem ligação ao `id` na matriz.

7. Cenário negativo/erro esperado.

Se o teste novo só valida o caminho feliz, sem cenário inválido, ainda não cobre o risco completo e deve ficar `PASS_COM_RESSALVAS` até receber negativo obrigatório.

### Passo 5 - Definir testes manuais críticos e visuais

1. Objetivo funcional do passo no contexto da app.

Cobrir fluxos que ainda não tenham automatização suficiente, sem fingir que prova manual é teste automático.

2. Ficheiros envolvidos:
    - GERAR: screenshots normais em `test-results/`
    - PUBLICAR: em `docs/evidence/MF8/screenshots/` apenas após revisão deliberada
    - EDITAR: `docs/evidence/MF8/TESTES-FINAIS-CRIADOS.md`
    - REVER: `frontend/`, `docs/planificacao/backlogs/MF-VIEWS.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - LOCALIZAÇÃO: secção do passo 5 em `docs/evidence/MF8/TESTES-FINAIS-CRIADOS.md`.

3. Instruções do que fazer.

Cria linhas manuais com o mesmo rigor da matriz automática. Cada teste manual deve ter:

- `id`, por exemplo `TST-MF8-MANUAL-CRITICO-LOGIN`.
- Perfil usado: visitante, utilizador autenticado, admin ou conta de teste.
- Rota ou ecrã.
- Ação.
- Expected result.
- Observado.
- Evidence, como screenshot, gravação curta ou checklist.
- Decisão.

Fluxos mínimos a avaliar:

| id | Fluxo | Expected result |
| --- | --- | --- |
| `TST-MF8-MANUAL-CRITICO-LOGIN` | Login/logout e sessão | Utilizador entra, vê estado autenticado e consegue terminar sessão. |
| `TST-MF8-MANUAL-CRITICO-CATALOGO` | Catálogo, pesquisa e detalhe | Conteúdo aparece, pesquisa filtra e detalhe abre sem erro. |
| `TST-MF8-MANUAL-CRITICO-PLAYBACK` | Página de reprodução ou conteúdo | Página crítica abre sem quebrar layout nem permissões. |
| `TST-MF8-MANUAL-CRITICO-SUBSCRICAO` | Fluxo de plano/subscrição | Estado do plano é apresentado de forma coerente. |
| `TST-MF8-MANUAL-CRITICO-ADMIN` | Área administrativa | Utilizador sem permissão não entra; admin vê painel correto. |
| `TST-MF8-VISUAL-RESP-HOME` | Home desktop/mobile | Elementos principais ficam legíveis e sem sobreposição. |
| `TST-MF8-VISUAL-RESP-CATALOGO` | Catálogo desktop/mobile | Cards, filtros e textos continuam usáveis. |
| `TST-MF8-VISUAL-RESP-DETALHE` | Detalhe desktop/mobile | CTA, imagem, metadados e texto não colidem. |

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Testes manuais e visuais são procedimentos documentados com evidence, não ficheiros JavaScript.

Como não há código neste passo, a explicação incide sobre honestidade de cobertura: quando a prova depende do olhar humano, a evidence deve dizer exatamente o perfil, a rota, a viewport e o resultado esperado.

6. Validação do passo.

A validação passa quando cada teste manual ou visual tem expected result, observado, evidence e decisão.

7. Cenário negativo/erro esperado.

Screenshot sem rota, viewport, data e `id` não prova o teste; marca a linha como incompleta.

### Passo 6 - Documentar comandos de preparação e execução segura

1. Objetivo funcional do passo no contexto da app.

Garantir que `BK-MF8-08` consegue executar a matriz sem expor segredos nem depender de instruções ambíguas.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/TESTES-FINAIS-CRIADOS.md`
    - REVER: `backend/package.json`, `frontend/package.json`, `scripts/`
    - LOCALIZAÇÃO: secção do passo 6 em `docs/evidence/MF8/TESTES-FINAIS-CRIADOS.md`.

3. Instruções do que fazer.

Para cada comando, regista:

- Diretório de execução.
- Comando exato.
- Variáveis necessárias apenas pelo nome, sem valores.
- Output esperado em sucesso.
- Output seguro a guardar em falha.
- Critério de decisão.

Exemplo de tabela:

| id | diretório | comando | output seguro | decisão |
| --- | --- | --- | --- | --- |
| `TST-MF8-BE-UNIT-VALIDACAO` | raiz | `npm --prefix backend test` | resumo de testes, falha e primeira stack útil sem dados sensíveis | `PASS`, `PASS_COM_RESSALVAS`, `FAIL` ou `BLOQUEADO` |
| `TST-MF8-BE-ADMIN-ATOMIC` | raiz | `node --test backend/tests/unit/f3-admin-transactions.test.js` | totais, primeiro erro e nome do cenário; nunca snapshots com PII | `PASS` apenas se rollback, concorrência, sessões e audit forem comprovados |
| `TST-MF8-FE-BUILD` | raiz | `npm --prefix frontend run build` | erro de compilação ou resumo de build | `PASS` quando compila; `FAIL` quando quebra código; `BLOQUEADO` se falta dependência local |
| `TST-MF8-VISUAL-RESP` | raiz | `npm --prefix frontend run build && npm exec playwright -- test tests/e2e/mf8-visual-responsiveness.spec.js` | artefactos em `test-results/`, browser, viewport e decisão | `PASS` se não houver sobreposição crítica; publicação em `docs` é separada |

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

O foco é preparar comandos seguros e repetíveis.

Como não há código neste passo, a explicação incide sobre segurança: evidence deve guardar comandos, estados e primeiros erros relevantes, mas nunca tokens, cookies reais, passwords, `.env` ou dados pessoais.

6. Validação do passo.

A validação passa quando cada `id` da matriz tem comando ou procedimento claro e critério de decisão.

7. Cenário negativo/erro esperado.

Se a preparação pedir para colar valores secretos no documento, remove os valores, mantém apenas o nome da variável e marca a execução como dependente de ambiente seguro.

### Passo 7 - Entregar suite pronta para execução

1. Objetivo funcional do passo no contexto da app.

Fechar o handoff para `BK-MF8-08` com todos os IDs, comandos, lacunas e instruções de criação organizados.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/TESTES-FINAIS-CRIADOS.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 7 em `docs/evidence/MF8/TESTES-FINAIS-CRIADOS.md`.

3. Instruções do que fazer.

Antes de fechar, confirma:

- Todos os testes mínimos têm `id`.
- Cada `id` explica o que valida e porquê.
- Cada `id` tem expected result e cenário negativo.
- Cada lacuna tem instrução de criação ou decisão manual.
- `BK-MF8-08` sabe exatamente que IDs deve executar.
- `BK-MF8-09` só receberá erros classificados a partir da execução, não instruções de criação de testes.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

A entrega é documental e serve de mapa de execução.

Como não há código neste passo, a explicação incide sobre handoff: o próximo BK não deve voltar a desenhar testes; deve executar a matriz e reportar resultados por `id`.

6. Validação do passo.

A validação passa quando a matriz tem decisão final `PRONTA` ou `PRONTA_COM_RESSALVAS` e todas as ressalvas têm owner.

7. Cenário negativo/erro esperado.

Se houver `id` crítico sem comando, expected result ou decisão de lacuna, a suite não está pronta para execução.

#### Critérios de aceite

- O artefacto `docs/evidence/MF8/TESTES-FINAIS-CRIADOS.md` existe e referencia `BK-MF8-03`.
- Cada teste individual tem `id`, camada, ficheiro, comando, RF/RNF, validação, razão, dados, assertions, negativo, expected result, falha e classificação.
- A secção de testes mínimos cobre backend unitário, integração HTTP, smoke
  backend, regressão/hardening, atomicidade administrativa, build/smoke
  frontend, testes manuais críticos e testes visuais/responsivos.
- A prova administrativa inclui duplicado `pending`, decisão concorrente,
  membership sem transferência implícita, revogação de sessões, audit com
  `requestId`, fault injection e proteção do último admin ativo.
- Cada lacuna tem instrução clara para criar teste automático, criar teste manual, aceitar risco, marcar bloqueio ou excluir por scope.
- Blocos de código usam apenas caminhos públicos como `backend/`, `frontend/`, `tests/`, `scripts/` e `docs/evidence/`.
- Cada decisão usa `PASS`, `PASS_COM_RESSALVAS`, `FAIL`, `BLOQUEADO` ou `NAO_APLICAVEL` com justificação.
- Os campos `pr`, `proof`, `neg` e `fonte` estão preenchidos ou justificados.
- Erros comuns a evitar: prova sem comando, teste sem `id`, linha sem expected result, negativo ausente, screenshot sem contexto e handoff sem owner.

#### Validação final

- `bash scripts/validate-planificacao.sh` executado na raiz do repositório.
- `git diff --check` sem linhas reportadas.
- Pesquisa sem ocorrências proibidas de caminhos privados ou variáveis internas.
- Pesquisa sem linguagem fraca que adie a criação real do teste.
- Evidence principal preenchida com `pr`, `proof`, `neg`, decisão final e handoff.

Resultado esperado: a validação documental fica em `PASS`; se existir lacuna técnica fora deste BK, ela fica registada com estado, impacto e próximo passo.

#### Evidence para PR/defesa

| Campo | Conteúdo esperado |
| --- | --- |
| `pr` | Link ou identificador da alteração, ou nota `NAO_APLICAVEL` quando for só evidence documental. |
| `proof` | Matriz preenchida, comandos inventariados, bloco de teste criado, screenshot, checklist ou output seguro. |
| `neg` | Cenário negativo por teste, com expected result obrigatório e resultado observado preenchido depois da execução. |
| `fonte` | RF/RNF, BK anterior, documento canónico ou evidence que justifica a decisão. |

#### Handoff

- Entrega principal: `docs/evidence/MF8/TESTES-FINAIS-CRIADOS.md`.
- Próximo BK: `BK-MF8-04`.
- Para `BK-MF8-08`, o handoff deve listar todos os `TST-*`, comandos/procedimentos, lacunas e critérios de decisão.
- Para `BK-MF8-09`, este BK não envia erros diretamente; apenas define como os erros serão classificados depois da execução.
- Se houver `FAIL`, o próximo BK só pode avançar com decisão explícita do orientador ou com correção registada.

##### Adendo do teste de acessibilidade preview-only

Acrescentar `TST-MF8-A11Y-PREVIEW` à matriz dos alunos com estes contratos:

- Axe falha perante qualquer finding `serious` ou `critical` nas rotas
  cobertas; findings de menor impacto permanecem visíveis para triagem.
- A home corre em `390x844`, `768x900`, `1280x720` e `1440x900`; rotas públicas
  e autenticadas representativas correm em mobile.
- O teste confirma overflow da página, menu por `Escape`, restituição de foco,
  header até `72 px` e reflow equivalente a `200%`.
- A API sintética é intercetada localmente, pedidos externos fazem falhar o
  teste e nenhum backend, base de dados ou seed é necessário.
- O build regista JavaScript/CSS inicial, peso do logo e chunks lazy de media.

Este ID não substitui os E2E funcionais, a matriz cross-browser nem testes de
streaming/carga. O guia continua a usar apenas os caminhos públicos
`backend/`, `frontend/`, `tests/` e `scripts/`.

#### Changelog

- `2026-06-27`: guia reforçado para explicar cada teste individualmente, definir cobertura mínima, ensinar criação de testes em falta e preparar execução por `id` em `BK-MF8-08`.
- `2026-07-10`: paths públicos restaurados para `backend/`/`frontend/` e
  atomicidade/concorrência administrativa adicionadas à bateria mínima.
- `2026-07-10`: adicionado o contrato `TST-MF8-A11Y-PREVIEW`, com Axe, reflow,
  rede fail-closed, budgets e limites face ao full E2E.
