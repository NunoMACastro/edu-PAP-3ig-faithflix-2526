# BK-MF4-05 - Distribuicao mensal e rotacao

## Header

- `doc_id`: `GUIA-BK-MF4-05`
- `bk_id`: `BK-MF4-05`
- `macro`: `MF4`
- `owner`: `Davi`
- `apoio`: `Matheus`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `L`
- `dependencias`: `BK-MF4-04`
- `rf_rnf`: `RF44, RF45`
- `fase_documental`: `Fase 1`
- `sprint`: `S08`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF4-06`
- `guia_path`: `docs/planificacao/guias-bk/MF4/BK-MF4-05-distribuicao-mensal-rotacao.md`
- `last_updated`: `2026-06-13`

## Bloco pedagogico (obrigatorio)

Neste BK vais criar a distribuicao mensal da pool solidaria. O sistema calcula quanto entra na pool a partir de subscricoes ativas, escolhe associacoes elegiveis por rotacao deterministica e guarda um registo auditavel por mes.

### Objetivo pedagogico

- Implementar um processamento idempotente: o mesmo mes nao pode ser distribuido duas vezes.
- Aplicar rotacao justa entre associacoes elegiveis.
- Reconciliar valores para que a soma distribuida bata certo com o total da pool.
- Preparar relatorios do `BK-MF4-06`.

### Tempo estimado

- 3 blocos de 90 minutos.
- Se a reconciliacao de centimos falhar, corrigir antes de criar frontend.

### Conceitos essenciais

- Pool mensal e o total solidario calculado a partir de subscricoes ativas.
- Rotacao deterministica usa dados persistidos, nao sorteio invisivel.
- Idempotencia significa que repetir o comando do mesmo mes nao cria duplicados.
- `CANONICO`: RF44 exige distribuicao mensal de percentagem; RF45 exige rotacao automatica.
- `DERIVADO`: o MVP distribui por centimos inteiros para evitar erros de ponto flutuante.

### Erros comuns

- Usar numeros decimais para dinheiro.
- Executar o mesmo mes duas vezes.
- Incluir associacoes inativas ou pausadas.
- Nao guardar detalhe por associacao.

### Check de compreensao

- [ ] Sei explicar como a pool mensal e calculada.
- [ ] Sei provar que uma associacao inelegivel nao recebe valor.
- [ ] Sei demonstrar que a soma final e igual ao total distribuido.

## Bloco operacional (obrigatorio)

### Pre-condicoes

- `BK-MF4-04` executado com `charities.status` e `charities.poolStatus`.
- `BK-MF4-01` executado com `subscriptions` e `subscription_plans`.
- MongoDB ativo.

### Guia de execucao (passo-a-passo)

### Passo 1 - Criar validacao de mes de distribuicao

1. Objetivo do passo.

Normalizar o mes no formato `YYYY-MM`.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/charities/pool-distribution.validation.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Cria o ficheiro no modulo `charities`.

4. Codigo completo.

```js
/**
 * Cria um erro HTTP previsivel para validacao do mes de distribuicao.
 *
 * @param {string} message Mensagem segura para devolver ao cliente.
 * @param {number} [statusCode=400] Codigo HTTP associado.
 * @returns {Error} Erro com `statusCode`.
 */
function httpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

/**
 * Valida o mes operacional da distribuicao no formato `YYYY-MM`.
 *
 * @param {string} month Valor recebido da API ou da UI.
 * @returns {string} Mes normalizado.
 * @throws {Error} Quando o formato ou o numero do mes e invalido.
 */
export function assertDistributionMonth(month) {
  const value = String(month ?? "").trim();
  if (!/^\d{4}-\d{2}$/.test(value)) {
    throw httpError("Mes de distribuicao invalido. Usa YYYY-MM.");
  }

  const monthNumber = Number(value.slice(5, 7));
  if (monthNumber < 1 || monthNumber > 12) {
    throw httpError("Mes de distribuicao invalido.");
  }

  return value;
}
```

5. Explicacao do codigo ou da decisao.

Um formato unico permite criar indice unico por mes e evita ambiguidades como `06/2026`.

6. Validacao do passo.

```bash
node -e "import('./src/modules/charities/pool-distribution.validation.js').then(({ assertDistributionMonth }) => console.log(assertDistributionMonth('2026-06')))"
```

7. Caso negativo, erro comum ou risco que este passo evita.

Sem normalizacao, o mesmo mes podia aparecer como `2026-06` e `06/2026`.

### Passo 2 - Criar service de distribuicao

1. Objetivo do passo.

Calcular pool, selecionar associacoes por rotacao e persistir run mensal.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/charities/pool-distribution.service.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Cria o service abaixo.

4. Codigo completo.

```js
import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import { assertDistributionMonth } from "./pool-distribution.validation.js";

/**
 * Converte uma distribuicao mensal para o formato publico da API.
 *
 * @param {object} run Documento da colecao `pool_distributions`.
 * @returns {object} Distribuicao sem campos internos.
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
 * Divide um total em centimos por associacoes, preservando a soma exata.
 *
 * @param {number} totalCents Valor total da pool em centimos.
 * @param {object[]} charities Associacoes ja ordenadas pela rotacao deste mes.
 * @returns {object[]} Itens de distribuicao.
 */
function splitCents(totalCents, charities) {
  const base = Math.floor(totalCents / charities.length);
  let remainder = totalCents - base * charities.length;

  return charities.map((charity, index) => {
    // Os centimos sobrantes sao atribuidos aos primeiros itens da rotacao atual.
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
 * Calcula o ponto de arranque da proxima rotacao.
 *
 * @param {object[]} charities Associacoes elegiveis ordenadas por aprovacao.
 * @param {object | null} lastRun Ultima distribuicao gravada.
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
 * Cria indices para idempotencia mensal e consultas por associacao.
 *
 * @returns {Promise<void>}
 */
export async function ensurePoolDistributionIndexes() {
  const db = await getDb();
  await db.collection("pool_distributions").createIndex({ month: 1 }, { unique: true });
  await db.collection("pool_distributions").createIndex({ "items.charityId": 1, month: -1 });
}

/**
 * Executa a distribuicao mensal da pool solidaria.
 *
 * @param {string} monthInput Mes no formato `YYYY-MM`.
 * @param {string} createdByUserId Identificador do admin que executa a distribuicao.
 * @returns {Promise<{ distribution: object }>} Distribuicao persistida.
 * @throws {Error} Quando o mes ja existe ou nao ha associacoes elegiveis.
 */
export async function runMonthlyDistribution(monthInput, createdByUserId) {
  const db = await getDb();
  const month = assertDistributionMonth(monthInput);
  const now = new Date();
  const existing = await db.collection("pool_distributions").findOne({ month });
  if (existing) {
    const error = new Error("Distribuicao deste mes ja existe.");
    error.statusCode = 409;
    throw error;
  }

  // Apenas subscricoes pagas ativas contribuem para receita; trials nao entram na pool.
  const subscriptions = await db.collection("subscriptions").find({
    status: "active",
    currentPeriodEnd: { $gt: now },
  }).toArray();
  const plans = await db.collection("subscription_plans").find({ active: true }).toArray();
  const planByCode = new Map(plans.map((plan) => [plan.code, plan]));

  // O calculo e sempre feito em centimos para evitar erros de ponto flutuante.
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
    const error = new Error("Nao existem associacoes elegiveis.");
    error.statusCode = 409;
    throw error;
  }

  const lastRun = await db.collection("pool_distributions").findOne({}, { sort: { month: -1 } });
  const offset = nextRotationOffset(charities, lastRun);
  // A lista rodada torna visivel que a prioridade muda entre meses.
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
 * Consulta uma distribuicao mensal ja persistida.
 *
 * @param {string} monthInput Mes no formato `YYYY-MM`.
 * @returns {Promise<{ distribution: object }>} Distribuicao encontrada.
 * @throws {Error} Quando o mes nao existe.
 */
export async function getDistributionByMonth(monthInput) {
  const db = await getDb();
  const month = assertDistributionMonth(monthInput);
  const run = await db.collection("pool_distributions").findOne({ month });
  if (!run) {
    const error = new Error("Distribuicao nao encontrada.");
    error.statusCode = 404;
    throw error;
  }
  return { distribution: toPublicRun(run) };
}
```

5. Explicacao do codigo ou da decisao.

Todo o dinheiro fica em centimos. A funcao `splitCents` reparte tambem os centimos sobrantes, garantindo que a soma dos itens e igual ao total da pool. A funcao `nextRotationOffset` olha para a primeira associacao do ultimo mes e comeca o mes seguinte na associacao seguinte. Assim, se houver centimos sobrantes, o extra nao vai sempre para a mesma entidade. O filtro de subscricoes usa apenas `status: "active"` e `currentPeriodEnd` futuro, porque trials gratuitos nao entram na receita da pool.

6. Validacao do passo.

```bash
node -e "import('./src/modules/charities/pool-distribution.service.js').then((m) => console.log(typeof m.runMonthlyDistribution, typeof m.getDistributionByMonth))"
```

Depois de existirem pelo menos duas associacoes elegiveis, executa dois meses diferentes e confirma que `items[0].charityId` muda de um mes para o outro.

7. Caso negativo, erro comum ou risco que este passo evita.

Sem indice unico por mes, um clique repetido podia duplicar a distribuicao.

### Passo 3 - Criar endpoints admin de distribuicao

1. Objetivo do passo.

Permitir ao admin executar e consultar distribuicao mensal.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/charities/pool-distribution.controller.js`
    - EDITAR: `backend/src/modules/charities/charities.routes.js`
    - EDITAR: `backend/src/server.js`

3. Instrucoes concretas.

Acrescenta rotas admin ao router existente.

4. Codigo completo.

`backend/src/modules/charities/pool-distribution.controller.js`

```js
import {
  getDistributionByMonth,
  runMonthlyDistribution,
} from "./pool-distribution.service.js";

/**
 * Executa uma nova distribuicao mensal por pedido admin.
 *
 * @param {import("express").Request} req Pedido com `body.month` e `user.id`.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<void>}
 */
export async function postMonthlyDistribution(req, res) {
  res.status(201).json(await runMonthlyDistribution(req.body.month, req.user.id));
}

/**
 * Devolve uma distribuicao mensal existente.
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

5. Explicacao do codigo ou da decisao.

A execucao e admin porque mexe em valores de distribuicao. A consulta fica admin neste BK; a visao por associacao entra no `BK-MF4-06`.

6. Validacao do passo.

```bash
curl -i -X POST http://localhost:3000/api/charities/pool/distributions \
  -H "Content-Type: application/json" \
  -d '{"month":"2026-06"}'
```

Sem admin deve devolver `401` ou `403`.

7. Caso negativo, erro comum ou risco que este passo evita.

Execucao aberta permitiria qualquer utilizador gerar registos financeiros.

### Passo 4 - Criar painel admin de distribuicao

1. Objetivo do passo.

Dar ao admin uma UI minima para executar o mes e ver resultado.

2. Ficheiros envolvidos.
    - EDITAR: `frontend/src/services/api/charitiesApi.js`
    - CRIAR: `frontend/src/pages/AdminPoolDistributionPage.jsx`
    - EDITAR: `frontend/src/routes/AppRoutes.jsx`

3. Instrucoes concretas.

Acrescenta `runDistribution` e `getDistribution`.

4. Codigo completo.

Adicionar a `charitiesApi`:

```js
/**
 * Executa a distribuicao mensal no backend.
 *
 * @param {string} month Mes no formato `YYYY-MM`.
 * @returns {Promise<{ distribution: object }>} Distribuicao criada.
 */
runDistribution(month) {
  return apiClient.post("/api/charities/pool/distributions", { month });
},
/**
 * Consulta uma distribuicao mensal ja criada.
 *
 * @param {string} month Mes no formato `YYYY-MM`.
 * @returns {Promise<{ distribution: object }>} Distribuicao existente.
 */
getDistribution(month) {
  return apiClient.get(`/api/charities/pool/distributions/${encodeURIComponent(month)}`);
}
```

`frontend/src/pages/AdminPoolDistributionPage.jsx`

```jsx
import { useState } from "react";
import { charitiesApi } from "../services/api/charitiesApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

/**
 * Painel administrativo para executar e consultar a distribuicao mensal.
 *
 * @returns {JSX.Element} Formulario mensal e resultado persistido.
 */
export function AdminPoolDistributionPage() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [distribution, setDistribution] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /**
   * Executa a distribuicao no backend e mostra o resultado gravado.
   *
   * @param {React.FormEvent<HTMLFormElement>} event Evento do formulario.
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
      <h1>Distribuicao mensal</h1>
      {error && <p role="alert">{error}</p>}
      <form onSubmit={handleRun}>
        <label>Mes<input type="month" value={month} onChange={(event) => setMonth(event.target.value)} required /></label>
        <button type="submit" disabled={submitting}>{submitting ? "A executar..." : "Executar distribuicao"}</button>
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

5. Explicacao do codigo ou da decisao.

A UI nao recalcula valores no browser. Mostra apenas o resultado produzido pelo backend.

6. Validacao do passo.

Executar um mes e repetir o mesmo mes.

7. Caso negativo, erro comum ou risco que este passo evita.

Calcular no frontend abriria divergencia entre interface e dados persistidos.

## Criterios de aceite (mensuraveis)

- Um mes valido cria uma unica distribuicao.
- Segunda execucao do mesmo mes devolve `409`.
- Soma dos `items.amountCents` e igual a `totalPoolCents`.
- Em dois meses consecutivos com as mesmas associacoes elegiveis, o primeiro `items[0].charityId` muda.
- Associacoes com `poolStatus` diferente de `eligible` nao recebem valor.
- Subscricoes expiradas, canceladas, `past_due` ou `trialing` nao entram no total da pool.
- Sem admin, endpoints devolvem `401` ou `403`.

## Validacao final

```bash
cd backend
npm test
```

Executar distribuicao com associacoes elegiveis, repetir o mesmo mes, executar o mes seguinte e validar reconciliacao e rotacao.

## Evidence para PR/defesa

- `pr`: commit/PR com service e painel admin de distribuicao.
- `proof`: JSON de duas distribuicoes mensais com soma reconciliada e primeiro beneficiario diferente.
- `neg`: duplicacao do mes, sem associacoes elegiveis e pedido sem admin.

## Handoff

O `BK-MF4-06` deve ler `pool_distributions` para relatorios, historico por associacao e pagina publica agregada.

## Snippet tecnico aplicavel

```js
// A primeira associacao do mes seguinte avanca uma posicao para tornar a rotacao verificavel.
return (previousIndex + 1) % charities.length;
```

## Changelog

- `2026-06-13`: guia reescrito com algoritmo mensal, idempotencia, rotacao, endpoints admin, UI e negativos.
