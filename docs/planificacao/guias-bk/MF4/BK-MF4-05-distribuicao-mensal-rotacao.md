# BK-MF4-05 - Distribuição mensal e rotação

## Header

- `doc_id`: `GUIA-BK-MF4-05`
- `bk_id`: `BK-MF4-05`
- `macro`: `MF4`
- `owner`: `Davi`
- `apoio`: `Matheus`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `L`
- `dependencias`: `BK-MF4-04,BK-MF4-02`
- `rf_rnf`: `RF44, RF45`
- `fase_documental`: `Fase 1`
- `sprint`: `S08`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF4-06`
- `guia_path`: `docs/planificacao/guias-bk/MF4/BK-MF4-05-distribuicao-mensal-rotacao.md`
- `last_updated`: `2026-06-13`

## Bloco pedagógico (obrigatório)

Neste BK vais criar a distribuição mensal da pool solidária. O sistema calcula quanto entra na pool a partir de subscrições ativas, escolhe associações elegíveis por rotação determinística e guarda um registo auditável por mês.

### Objetivo pedagógico

- Implementar um processamento idempotente: o mesmo mês não pode ser distribuído duas vezes.
- Aplicar rotação justa entre associações elegíveis.
- Reconciliar valores para que a soma distribuída bata certo com o total da pool.
- Preparar relatórios do `BK-MF4-06`.

### Importância funcional

- Este BK implementa o núcleo diferencial do FaithFlix: transformar subscrições em impacto social mensurável.
- A distribuição mensal precisa de ser auditável, repetível e justa para que a defesa PAP seja credível.
- O histórico produzido aqui será lido pelos relatórios e pela página pública no `BK-MF4-06`.

### Scope-in

- Validar mês no formato `YYYY-MM`.
- Calcular a pool a partir de subscrições pagas ativas.
- Distribuir em cêntimos para evitar erros de números decimais.
- Aplicar rotação determinística entre associações elegíveis.
- Garantir idempotência mensal e endpoint admin de execução/consulta.

### Scope-out

- Não fazer transferência bancária real.
- Não incluir trial como receita paga da pool.
- Não criar relatórios públicos ou CSV; isso entra no `BK-MF4-06`.
- Não usar sorteio invisível nem decisão manual sem registo.

### Tempo estimado

- 3 blocos de 90 minutos.
- Se a reconciliação de cêntimos falhar, corrigir antes de criar frontend.

### Glossário rápido

- Pool mensal: valor solidário disponível para distribuir num mês.
- Cêntimos: unidade inteira usada para representar dinheiro sem erros de vírgula flutuante.
- Idempotência: repetir o pedido do mesmo mês não cria uma segunda distribuição.
- Rotação determinística: ordem previsível calculada a partir do histórico guardado.

### Conceitos teóricos essenciais

- Domínio FaithFlix: parte da receita das subscrições pagas é distribuída por associações elegíveis.
- Backend: o service calcula, divide, reconcilia e grava a distribuição numa única operação lógica.
- Frontend: o painel admin envia o mês e mostra a distribuição persistida.
- Segurança: apenas admin executa a distribuição, porque o registo tem impacto financeiro e documental.
- Dados: `pool_distributions` guarda total, linhas por associação, mês e admin que executou.
- `CANONICO`: RF44 exige distribuição mensal de percentagem; RF45 exige rotação automática.
- `DERIVADO`: o MVP distribui por cêntimos inteiros para evitar erros de ponto flutuante.

### Erros comuns

- Usar numeros decimais para dinheiro.
- Executar o mesmo mês duas vezes.
- Incluir associações inativas ou pausadas.
- Não guardar detalhe por associação.

### Check de compreensão

- [ ] Sei explicar como a pool mensal e calculada.
- [ ] Sei provar que uma associação inelegivel não recebe valor.
- [ ] Sei demonstrar que a soma final e igual ao total distribuido.

## Bloco operacional (obrigatório)

### Pré-condições

- `BK-MF4-04` executado com `charities.status` e `charities.poolStatus`.
- `BK-MF4-02` executado com subscrições pagas, trial e dados de pagamento simulado.
- MongoDB ativo.

### Arquitetura do BK

- Backend: validação de mês, service de distribuição, controller e rotas admin.
- Persistência: `pool_distributions` guarda uma execução por mês.
- Frontend: `AdminPoolDistributionPage` permite executar e consultar o mês.
- Segurança: endpoints de distribuição exigem `requireRole(["admin"])`.
- Integração: `BK-MF4-06` lê `pool_distributions` sem recalcular valores.

### Ficheiros a criar, editar e rever

- CRIAR: `backend/src/modules/charities/pool-distribution.validation.js`
- CRIAR: `backend/src/modules/charities/pool-distribution.service.js`
- CRIAR: `backend/src/modules/charities/pool-distribution.controller.js`
- CRIAR: `frontend/src/pages/AdminPoolDistributionPage.jsx`
- EDITAR: `backend/src/modules/charities/charities.routes.js`
- EDITAR: `backend/src/server.js`
- EDITAR: `frontend/src/services/api/charitiesApi.js`
- EDITAR: `frontend/src/routes/AppRoutes.jsx`
- REVER: `BK-MF4-04`, `BK-MF4-01`, `RF44`, `RF45`, `RNF19`, `RNF29`

### Guia de execução (passo-a-passo)

### Passo 1 - Criar validação de mês de distribuição

1. Objetivo do passo.

Normalizar o mês no formato `YYYY-MM`.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/charities/pool-distribution.validation.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Cria o ficheiro no módulo `charities`.

4. Código completo.

```js
/**
 * Cria um erro HTTP previsivel para validação do mês de distribuição.
 *
 * @param {string} message Mensagem segura para devolver ao cliente.
 * @param {number} [statusCode=400] Código HTTP associado.
 * @returns {Error} Erro com `statusCode`.
 */
function httpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

/**
 * Valida o mês operacional da distribuição no formato `YYYY-MM`.
 *
 * @param {string} month Valor recebido da API ou da UI.
 * @returns {string} Mês normalizado.
 * @throws {Error} Quando o formato ou o número do mês e inválido.
 */
export function assertDistributionMonth(month) {
  const value = String(month ?? "").trim();
  if (!/^\d{4}-\d{2}$/.test(value)) {
    throw httpError("Mês de distribuição inválido. Usa YYYY-MM.");
  }

  const monthNumber = Number(value.slice(5, 7));
  if (monthNumber < 1 || monthNumber > 12) {
    throw httpError("Mês de distribuição inválido.");
  }

  return value;
}
```

5. Explicação do código ou da decisão.

Um formato único permite criar indice único por mês e evita ambiguidades como `06/2026`.

6. Validação do passo.

```bash
node -e "import('./src/modules/charities/pool-distribution.validation.js').then(({ assertDistributionMonth }) => console.log(assertDistributionMonth('2026-06')))"
```

7. Caso negativo, erro comum ou risco que este passo evita.

Sem normalizacao, o mesmo mês podia aparecer como `2026-06` e `06/2026`.

### Passo 2 - Criar service de distribuição

1. Objetivo do passo.

Calcular pool, selecionar associações por rotação e persistir run mensal.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/charities/pool-distribution.service.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Cria o service abaixo.

4. Código completo.

```js
/**
 * Módulo de serviço para distribuição mensal da pool solidária.
 *
 * Calcula valores em cêntimos, aplica rotação entre associações elegíveis e
 * grava execuções idempotentes para evitar duplicar distribuições do mesmo mês.
 */
import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import { assertDistributionMonth } from "./pool-distribution.validation.js";

/**
 * Converte uma distribuição mensal para o formato público da API.
 *
 * @param {object} run Documento da colecao `pool_distributions`.
 * @returns {object} Distribuição sem campos internos.
 */
function toPublicRun(run) {
  return {
    id: String(run._id),
    month: run.month,
    totalPoolCents: run.totalPoolCents,
    status: run.status,
    items: run.items.map((item) => ({
      charityId: String(item.charityId),
      charityName: item.charityName,
      amountCents: item.amountCents,
      rotationPosition: item.rotationPosition,
    })),
    createdAt: run.createdAt,
  };
}

/**
 * Divide um total em cêntimos por associações, preservando a soma exata.
 *
 * @param {number} totalCents Valor total da pool em cêntimos.
 * @param {object[]} charities Associações já ordenadas pela rotação deste mês.
 * @returns {object[]} Itens de distribuição.
 */
function splitCents(totalCents, charities) {
  const base = Math.floor(totalCents / charities.length);
  let remainder = totalCents - base * charities.length;

  return charities.map((charity, index) => {
    // Os cêntimos sobrantes sao atribuidos aos primeiros itens da rotação atual.
    const extra = remainder > 0 ? 1 : 0;
    remainder -= extra;
    return {
      charityId: charity._id,
      charityName: charity.name,
      amountCents: base + extra,
      rotationPosition: index + 1,
    };
  });
}

/**
 * Calcula o ponto de arranque da proxima rotação.
 *
 * @param {object[]} charities Associações elegíveis ordenadas por aprovação.
 * @param {object | null} lastRun Ultima distribuição gravada.
 * @returns {number} Offset usado para rodar a lista.
 */
function nextRotationOffset(charities, lastRun) {
  if (!lastRun?.items?.length) {
    return 0;
  }

  const previousFirstCharityId = String(lastRun.items[0].charityId);
  const previousIndex = charities.findIndex((charity) => String(charity._id) === previousFirstCharityId);

  if (previousIndex === -1) {
    return 0;
  }

  return (previousIndex + 1) % charities.length;
}

/**
 * Cria indices para idempotência mensal e consultas por associação.
 *
 * @returns {Promise<void>}
 */
export async function ensurePoolDistributionIndexes() {
  const db = await getDb();
  await db.collection("pool_distributions").createIndex({ month: 1 }, { unique: true });
  await db.collection("pool_distributions").createIndex({ "items.charityId": 1, month: -1 });
}

/**
 * Executa a distribuição mensal da pool solidária.
 *
 * @param {string} monthInput Mês no formato `YYYY-MM`.
 * @param {string} createdByUserId Identificador do admin que executa a distribuição.
 * @returns {Promise<{ distribution: object }>} Distribuição persistida.
 * @throws {Error} Quando o mês já existe ou não há associações elegíveis.
 */
export async function runMonthlyDistribution(monthInput, createdByUserId) {
  const db = await getDb();
  const month = assertDistributionMonth(monthInput);
  const now = new Date();
  const existing = await db.collection("pool_distributions").findOne({ month });
  if (existing) {
    const error = new Error("Distribuição deste mês já existe.");
    error.statusCode = 409;
    throw error;
  }

  // Apenas subscrições pagas ativas contribuem para receita; trials não entram na pool.
  const subscriptions = await db.collection("subscriptions").find({
    status: "active",
    currentPeriodEnd: { $gt: now },
  }).toArray();
  const plans = await db.collection("subscription_plans").find({ active: true }).toArray();
  const planByCode = new Map(plans.map((plan) => [plan.code, plan]));

  // O calculo e sempre feito em cêntimos para evitar erros de ponto flutuante.
  const totalPoolCents = subscriptions.reduce((total, subscription) => {
    const plan = planByCode.get(subscription.planCode);
    if (!plan) return total;
    return total + Math.round((plan.priceCents * plan.solidaritySharePercent) / 100);
  }, 0);

  const charities = await db.collection("charities").find({
    status: "active",
    poolStatus: "eligible",
  }).sort({ approvedAt: 1 }).toArray();

  if (charities.length === 0) {
    const error = new Error("Não existem associações elegíveis.");
    error.statusCode = 409;
    throw error;
  }

  const lastRun = await db.collection("pool_distributions").findOne({}, { sort: { month: -1 } });
  const offset = nextRotationOffset(charities, lastRun);
  // A lista rodada torna visível que a prioridade muda entre meses.
  const rotated = [...charities.slice(offset), ...charities.slice(0, offset)];
  const items = splitCents(totalPoolCents, rotated);

  const run = {
    month,
    totalPoolCents,
    status: "completed",
    items,
    createdBy: ObjectId.isValid(createdByUserId) ? new ObjectId(createdByUserId) : null,
    createdAt: now,
  };

  const result = await db.collection("pool_distributions").insertOne(run);
  return { distribution: toPublicRun({ ...run, _id: result.insertedId }) };
}

/**
 * Consulta uma distribuição mensal já persistida.
 *
 * @param {string} monthInput Mês no formato `YYYY-MM`.
 * @returns {Promise<{ distribution: object }>} Distribuição encontrada.
 * @throws {Error} Quando o mês não existe.
 */
export async function getDistributionByMonth(monthInput) {
  const db = await getDb();
  const month = assertDistributionMonth(monthInput);
  const run = await db.collection("pool_distributions").findOne({ month });
  if (!run) {
    const error = new Error("Distribuição não encontrada.");
    error.statusCode = 404;
    throw error;
  }
  return { distribution: toPublicRun(run) };
}
```

5. Explicação do código ou da decisão.

Todo o dinheiro fica em cêntimos. A função `splitCents` reparte também os cêntimos sobrantes, garantindo que a soma dos itens e igual ao total da pool. A função `nextRotationOffset` olha para a primeira associação do ultimo mês e comeca o mês seguinte na associação seguinte. Assim, se houver cêntimos sobrantes, o extra não vai sempre para a mesma entidade. O filtro de subscrições usa apenas `status: "active"` e `currentPeriodEnd` futuro, porque trials gratuitos não entram na receita da pool.

6. Validação do passo.

```bash
node -e "import('./src/modules/charities/pool-distribution.service.js').then((m) => console.log(typeof m.runMonthlyDistribution, typeof m.getDistributionByMonth))"
```

Depois de existirem pelo menos duas associações elegíveis, executa dois meses diferentes e confirma que `items[0].charityId` muda de um mês para o outro.

7. Caso negativo, erro comum ou risco que este passo evita.

Sem indice único por mês, um clique repetido podia duplicar a distribuição.

### Passo 3 - Criar endpoints admin de distribuição

1. Objetivo do passo.

Permitir ao admin executar e consultar distribuição mensal.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/charities/pool-distribution.controller.js`
    - EDITAR: `backend/src/modules/charities/charities.routes.js`
    - EDITAR: `backend/src/server.js`

3. Instrucoes concretas.

Acrescenta rotas admin ao router existente.

4. Código completo.

`backend/src/modules/charities/pool-distribution.controller.js`

```js
/**
 * Módulo de controllers HTTP para a distribuição mensal da pool.
 *
 * Expõe comandos administrativos para executar e consultar distribuições,
 * mantendo cálculo e persistência concentrados no service.
 */
import {
  getDistributionByMonth,
  runMonthlyDistribution,
} from "./pool-distribution.service.js";

/**
 * Executa uma nova distribuição mensal por pedido admin.
 *
 * @param {import("express").Request} req Pedido com `body.month` e `user.id`.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<void>}
 */
export async function postMonthlyDistribution(req, res) {
  res.status(201).json(await runMonthlyDistribution(req.body.month, req.user.id));
}

/**
 * Devolve uma distribuição mensal existente.
 *
 * @param {import("express").Request} req Pedido com `params.month`.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<void>}
 */
export async function getMonthlyDistribution(req, res) {
  res.status(200).json(await getDistributionByMonth(req.params.month));
}
```

Rotas a adicionar:

```js
// Executar distribuicoes altera registos financeiros, por isso fica reservado a administradores.
charitiesRouter.post(
  "/pool/distributions",
  requireRole(["admin"]),
  asyncHandler(postMonthlyDistribution),
);

charitiesRouter.get(
  "/pool/distributions/:month",
  requireRole(["admin"]),
  asyncHandler(getMonthlyDistribution),
);
```

Trecho esperado em `backend/src/server.js`:

```js
import { ensurePoolDistributionIndexes } from "./modules/charities/pool-distribution.service.js";

await ensurePoolDistributionIndexes();
```

5. Explicação do código ou da decisão.

A execução e admin porque mexe em valores de distribuição. A consulta fica admin neste BK; a visao por associação entra no `BK-MF4-06`.

6. Validação do passo.

```bash
curl -i -X POST http://localhost:3000/api/charities/pool/distributions \
  -H "Content-Type: application/json" \
  -d '{"month":"2026-06"}'
```

Sem admin deve devolver `401` ou `403`.

7. Caso negativo, erro comum ou risco que este passo evita.

Execução aberta permitiria qualquer utilizador gerar registos financeiros.

### Passo 4 - Criar painel admin de distribuição

1. Objetivo do passo.

Dar ao admin uma UI mínima para executar o mês e ver resultado.

2. Ficheiros envolvidos.
    - EDITAR: `frontend/src/services/api/charitiesApi.js`
    - CRIAR: `frontend/src/pages/AdminPoolDistributionPage.jsx`
    - EDITAR: `frontend/src/routes/AppRoutes.jsx`

3. Instrucoes concretas.

Acrescenta `runDistribution` e `getDistribution`.

4. Código completo.

Adicionar a `charitiesApi`:

```js
/**
 * Executa a distribuição mensal no backend.
 *
 * @param {string} month Mês no formato `YYYY-MM`.
 * @returns {Promise<{ distribution: object }>} Distribuição criada.
 */
runDistribution(month) {
  return apiClient.post("/api/charities/pool/distributions", { month });
},
/**
 * Consulta uma distribuição mensal já criada.
 *
 * @param {string} month Mês no formato `YYYY-MM`.
 * @returns {Promise<{ distribution: object }>} Distribuição existente.
 */
getDistribution(month) {
  return apiClient.get(`/api/charities/pool/distributions/${encodeURIComponent(month)}`);
}
```

`frontend/src/pages/AdminPoolDistributionPage.jsx`

```jsx
/**
 * Módulo da página administrativa de distribuição da pool.
 *
 * Permite executar ou consultar uma distribuição mensal e mostra o resultado
 * persistido sem recalcular valores críticos no browser.
 */
import { useState } from "react";
import { charitiesApi } from "../services/api/charitiesApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

/**
 * Painel administrativo para executar e consultar a distribuição mensal.
 *
 * @returns {JSX.Element} Formulário mensal e resultado persistido.
 */
export function AdminPoolDistributionPage() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [distribution, setDistribution] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /**
   * Executa a distribuição no backend e mostra o resultado gravado.
   *
   * @param {React.FormEvent<HTMLFormElement>} event Evento do formulário.
   * @returns {Promise<void>}
   */
  async function handleRun(event) {
    event.preventDefault();
    setError("");
    setDistribution(null);
    setSubmitting(true);
    try {
      const response = await charitiesApi.runDistribution(month);
      setDistribution(response.distribution);
    } catch (apiError) {
      setError(toUserMessage(apiError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      <h1>Distribuição mensal</h1>
      {error && <p role="alert">{error}</p>}
      <form onSubmit={handleRun}>
        <label>Mês<input type="month" value={month} onChange={(event) => setMonth(event.target.value)} required /></label>
        <button type="submit" disabled={submitting}>{submitting ? "A executar..." : "Executar distribuição"}</button>
      </form>
      {distribution && (
        <section>
          <h2>{distribution.month}</h2>
          <p>Total: {(distribution.totalPoolCents / 100).toFixed(2)} EUR</p>
          {distribution.items.map((item) => (
            <article key={item.charityId}>
              <h3>{item.charityName}</h3>
              <p>{(item.amountCents / 100).toFixed(2)} EUR</p>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
```

5. Explicação do código ou da decisão.

A UI não recalcula valores no browser. Mostra apenas o resultado produzido pelo backend.

6. Validação do passo.

Executar um mês e repetir o mesmo mês.

7. Caso negativo, erro comum ou risco que este passo evita.

Calcular no frontend abriria divergencia entre interface e dados persistidos.

## Critérios de aceite (mensuráveis)

- Um mês valido cria uma unica distribuição.
- Segunda execução do mesmo mês devolve `409`.
- Soma dos `items.amountCents` e igual a `totalPoolCents`.
- Em dois meses consecutivos com as mesmas associações elegíveis, o primeiro `items[0].charityId` muda.
- Associações com `poolStatus` diferente de `eligible` não recebem valor.
- Subscrições expiradas, canceladas, `past_due` ou `trialing` não entram no total da pool.
- Sem admin, endpoints devolvem `401` ou `403`.

## Validação final

```bash
cd backend
npm test
```

Executar distribuição com associações elegíveis, repetir o mesmo mês, executar o mês seguinte e validar reconciliação e rotação.

## Evidence para PR/defesa

- `pr`: commit/PR com service e painel admin de distribuição.
- `proof`: JSON de duas distribuicoes mensais com soma reconciliada e primeiro beneficiario diferente.
- `neg`: duplicação do mês, sem associações elegíveis e pedido sem admin.

## Handoff

O `BK-MF4-06` deve ler `pool_distributions` para relatórios, histórico por associação e página pública agregada.

## Snippet técnico aplicável

```js
// A primeira associação do mês seguinte avança uma posicao para tornar a rotação verificavel.
return (previousIndex + 1) % charities.length;
```

## Changelog

- `2026-06-13`: guia reescrito com algoritmo mensal, idempotência, rotação, endpoints admin, UI e negativos.
