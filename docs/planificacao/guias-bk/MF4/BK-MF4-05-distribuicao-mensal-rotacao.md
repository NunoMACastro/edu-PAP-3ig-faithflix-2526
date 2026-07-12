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
- `last_updated`: `2026-07-12`

#### Objetivo

Neste BK vais criar a distribuição mensal da pool solidária. O sistema calcula quanto entra na pool a partir de pagamentos v2 aprovados no mês UTC já fechado, escolhe associações elegíveis por rotação determinística e guarda um snapshot auditável e imutável por mês.


- Implementar um processamento idempotente: o mesmo mês não pode ser distribuído duas vezes.
- Aplicar rotação justa entre associações elegíveis.
- Reconciliar valores para que a soma distribuída bata certo com o total da pool.
- Preparar relatórios do `BK-MF4-06`.

#### Importância

- Este BK implementa o núcleo diferencial do FaithFlix: transformar subscrições em impacto social mensurável.
- A distribuição mensal precisa de ser auditável, repetível e justa para que a defesa PAP seja credível.
- O histórico produzido aqui será lido pelos relatórios e pela página pública no `BK-MF4-06`.

#### Scope-in

- Validar mês no formato `YYYY-MM`.
- Calcular a pool apenas a partir de `payment_attempts` v2 aprovados e não estimados no mês fechado.
- Distribuir em cêntimos para evitar erros de números decimais.
- Aplicar rotação determinística entre associações elegíveis.
- Guardar snapshots financeiros e garantir replay idempotente por mês.
- Executar automaticamente o fecho do mês UTC anterior num worker com lease.

#### Scope-out

- Não fazer transferência bancária real.
- Não incluir trial como receita paga da pool.
- Não incluir documentos legacy, pagamentos falhados ou backfills estimados.
- Não recalcular distribuições antigas com o preço atual de um plano.
- Não criar relatórios públicos ou CSV; isso entra no `BK-MF4-06`.
- Não usar sorteio invisível nem decisão manual sem registo.

### Tempo estimado

- 3 blocos de 90 minutos.
- Se a reconciliação de cêntimos falhar, corrigir antes de criar frontend.

#### Estado antes e depois

- Estado antes: aplicam-se os BKs declarados em `dependencias`, os RF/RNF do Header e os artefactos já entregues pelas fases anteriores.
- Estado depois: ficam implementáveis e verificáveis apenas os resultados listados em `Scope-in`, sem antecipar o `Scope-out`.

#### Pré-requisitos

- `BK-MF4-04` executado com `charities.status` e `charities.poolStatus`.
- `BK-MF4-02` executado com subscrições pagas, trial e dados de pagamento simulado.
- MongoDB ativo.

#### Glossário

- Pool mensal: valor solidário disponível para distribuir num mês.
- Cêntimos: unidade inteira usada para representar dinheiro sem erros de vírgula flutuante.
- Idempotência: repetir o pedido do mesmo mês não cria uma segunda distribuição.
- Rotação determinística: ordem previsível calculada pelo mês, independente da ordem de execução dos jobs.
- Snapshot financeiro: cópia dos valores autoritativos usados no fecho, que permite auditar o resultado sem recalcular o passado.

#### Conceitos teóricos essenciais

- Domínio FaithFlix: parte da receita de pagamentos efetivamente aprovados é distribuída por associações elegíveis.
- Backend: o service calcula, divide, reconcilia e grava a distribuição numa única operação lógica.
- Frontend: o painel admin envia o mês e mostra a distribuição persistida.
- Segurança: apenas admin executa a distribuição, porque o registo tem impacto financeiro e documental.
- Dados: `pool_distributions` guarda total, linhas por associação, mês e admin que executou.
- Contabilidade: a elegibilidade é cumulativa: `schemaVersion: 2`, `status: "approved"`, `accountingEstimate: false` e `approvedAt` dentro do mês UTC.
- `CANONICO`: RF44 exige distribuição mensal de percentagem; RF45 exige rotação automática.
- `DERIVADO`: o MVP distribui por cêntimos inteiros para evitar erros de ponto flutuante.
- `DERIVADO`: apenas pagamentos `schemaVersion: 2`, `approved`, não estimados e
  com `approvedAt` dentro do mês UTC fechado entram no snapshot imutável.
- `DERIVADO`: leitura, cálculo, insert e audit do fecho manual usam a mesma
  transação/sessão; o índice único por mês resolve concorrência e o replay não
  cria novo audit.
- `DERIVADO`: o fecho sem beneficiárias é terminal
  (`deferred_no_eligible_charities`) e a rotação deriva do próprio `YYYY-MM`.

### Erros comuns

- Usar numeros decimais para dinheiro.
- Executar o mesmo mês duas vezes.
- Usar o estado atual de `subscriptions` ou o preço atual do plano para reconstruir receita histórica.
- Incluir backfill estimado como se fosse cobrança comprovada.
- Incluir associações inativas ou pausadas.
- Não guardar detalhe por associação.

### Check de compreensão

- [ ] Sei explicar como a pool mensal e calculada.
- [ ] Sei provar que uma associação inelegivel não recebe valor.
- [ ] Sei demonstrar que a soma final e igual ao total distribuido.

#### Arquitetura do BK

- Backend: validação de mês, service de distribuição, controller e rotas admin.
- Persistência: `pool_distributions` guarda uma execução por mês.
- Worker: o job `pool:YYYY-MM` fecha apenas o mês UTC anterior, com lease exclusivo e retry seguro.
- Frontend: `AdminPoolDistributionPage` permite executar e consultar o mês.
- Segurança: endpoints de distribuição exigem `requireRole(["admin"])`.
- Integração: `BK-MF4-06` lê `pool_distributions` sem recalcular valores.
- Fecho manual: `trigger: "admin"`, ator válido, `requestId` e audit mínimo
  `charity.pool_distribution.created` na transação do ledger.
- Fecho automático: `trigger: "worker"`, `createdBy: null`, sem fabricar ator
  ou audit administrativo; lease `pool:YYYY-MM`, catch-up até 120 meses e estado
  diferido tratado como concluído. Esta baseline local não prova agendamento em
  produção.
- UI: o mês inicial é civil/local (`getFullYear()`/`getMonth()`), o fecho exige
  confirmação e uma reserva síncrona impede pedidos manuais sobrepostos.

#### Ficheiros a criar/editar/rever

- CRIAR: `backend/src/modules/charities/pool-distribution.validation.js`
- CRIAR: `backend/src/modules/charities/pool-distribution.service.js`
- CRIAR: `backend/src/modules/jobs/pool-jobs.service.js`
- CRIAR: `backend/src/modules/charities/pool-distribution.controller.js`
- CRIAR: `frontend/src/pages/AdminPoolDistributionPage.jsx`
- EDITAR: `backend/src/modules/charities/charities.routes.js`
- EDITAR: `backend/src/modules/jobs/billing-jobs.service.js`
- EDITAR: `backend/src/worker.js`
- EDITAR: `backend/src/server.js`
- EDITAR: `frontend/src/services/api/charitiesApi.js`
- EDITAR: `frontend/src/routes/AppRoutes.jsx`
- REVER: `BK-MF4-04`, `BK-MF4-01`, `RF44`, `RF45`, `RNF19`, `RNF29`

#### Tutorial técnico linear

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
  if (typeof month !== "string") {
    throw httpError("Mês de distribuição inválido. Usa YYYY-MM.");
  }
  const match = /^(\d{4})-(\d{2})$/.exec(month);
  if (!match) throw httpError("Mês de distribuição inválido. Usa YYYY-MM.");
  const monthNumber = Number.parseInt(match[2], 10);
  if (monthNumber < 1 || monthNumber > 12) {
    throw httpError("Mês de distribuição inválido.");
  }

  return month;
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

### Passo 2 - Criar distribuição e integrá-la no worker

1. Objetivo do passo.

Calcular a pool, persistir o fecho mensal e integrá-lo cumulativamente no
worker/lease criado em `BK-MF4-01`.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/charities/pool-distribution.service.js`
    - CRIAR: `backend/src/modules/jobs/pool-jobs.service.js`
    - EDITAR: `backend/src/modules/jobs/billing-jobs.service.js`
    - EDITAR: `backend/src/worker.js`
    - LOCALIZACAO: service de distribuição completo, novo service de job completo e substituições cumulativas indicadas

3. Instrucoes concretas.

Cria o service com `runInTransaction`. Não uses a subscrição atual como proxy
de receita; lê exclusivamente tentativas v2 aprovadas no período. Depois cria o
job mensal completo e estende o `runBillingWorkerCycle` existente: conserva
sempre `runDueSubscriptionJobs` e acrescenta a pool, sem criar outro worker.

4. Código completo, transacional e auditável.

```js
/**
 * Módulo de serviço para distribuição mensal da pool solidária.
 *
 * Calcula valores em cêntimos, aplica rotação entre associações elegíveis e
 * grava execuções idempotentes para evitar duplicar distribuições do mesmo mês.
 */
import { ObjectId } from "mongodb";
import { getDb, runInTransaction } from "../../config/database.js";
import { writeAdminAudit } from "../audit/audit.service.js";
import { assertDistributionMonth } from "./pool-distribution.validation.js";

/**
 * Converte uma distribuição mensal para o formato público da API.
 *
 * @param {object} run Documento da colecao `pool_distributions`.
 * @returns {object} Distribuição sem campos internos.
 */
function toPublicRun(run) {
  return {
    id: run._id.toHexString(),
    month: run.month,
    totalPoolCents: run.totalPoolCents,
    status: run.status,
    deferredReason: run.deferredReason ?? null,
    replayed: run.replayed === true,
    financialSnapshot: run.financialSnapshot,
    items: run.items.map((item) => ({
      charityId: item.charityId.toHexString(),
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
  if (
    !Number.isSafeInteger(totalCents) ||
    totalCents < 0 ||
    !Array.isArray(charities) ||
    charities.length === 0
  ) {
    const error = new Error("Total da pool inválido.");
    error.statusCode = 500;
    error.code = "POOL_TOTAL_INVALID";
    throw error;
  }
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
 * Calcula o ponto de arranque determinístico da rotação mensal.
 *
 * @param {string} month Mês `YYYY-MM` já validado.
 * @param {number} count Número de associações elegíveis.
 * @returns {number} Offset usado para rodar a lista.
 */
function rotationOffsetForMonth(month, count) {
  const match = /^(\d{4})-(\d{2})$/.exec(month);
  const year = Number.parseInt(match[1], 10);
  const monthNumber = Number.parseInt(match[2], 10);
  return (year * 12 + monthNumber - 1) % count;
}

function monthPeriod(month) {
  const match = /^(\d{4})-(\d{2})$/.exec(month);
  const year = Number.parseInt(match[1], 10);
  const monthNumber = Number.parseInt(match[2], 10);
  return {
    start: new Date(Date.UTC(year, monthNumber - 1, 1)),
    end: new Date(Date.UTC(year, monthNumber, 1)),
  };
}

function asAdminObjectId(value) {
  if (typeof value !== "string" || !/^[a-f\d]{24}$/i.test(value)) {
    const error = new Error("Administrador inválido.");
    error.statusCode = 400;
    throw error;
  }
  return ObjectId.createFromHexString(value);
}

function addSafeCents(total, value) {
  if (
    !Number.isSafeInteger(total) ||
    !Number.isSafeInteger(value) ||
    value < 0 ||
    total > Number.MAX_SAFE_INTEGER - value
  ) {
    const error = new Error("Total financeiro excede o intervalo seguro.");
    error.statusCode = 500;
    error.code = "PAYMENT_SNAPSHOT_OVERFLOW";
    throw error;
  }
  return total + value;
}

function snapshotPayment(payment) {
  if (
    !Number.isSafeInteger(payment.amountCents) ||
    payment.amountCents < 0 ||
    payment.currency !== "EUR" ||
    !Number.isSafeInteger(payment.solidaritySharePercent) ||
    payment.solidaritySharePercent < 0 ||
    payment.solidaritySharePercent > 100
  ) {
    const error = new Error("Snapshot financeiro de pagamento inválido.");
    error.statusCode = 500;
    error.code = "PAYMENT_SNAPSHOT_INVALID";
    throw error;
  }
  const weightedCents = payment.amountCents * payment.solidaritySharePercent;
  if (!Number.isSafeInteger(weightedCents)) {
    const error = new Error("Cálculo financeiro excede o intervalo seguro.");
    error.statusCode = 500;
    error.code = "PAYMENT_SNAPSHOT_OVERFLOW";
    throw error;
  }
  return {
    paymentAttemptId: payment._id,
    amountCents: payment.amountCents,
    currency: "EUR",
    solidaritySharePercent: payment.solidaritySharePercent,
    poolCents: Math.round(weightedCents / 100),
  };
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
 * @param {string | null} createdByUserId Admin no trigger manual; `null` no worker.
 * @param {{ trigger?: "admin" | "worker", requestId?: string, referenceDate?: Date }} context Origem, correlação e relógio injetável do worker.
 * @returns {Promise<{ distribution: object }>} Distribuição persistida.
 * @throws {Error} Quando o mês ainda não terminou ou o pedido é inválido.
 */
export async function runMonthlyDistribution(
  monthInput,
  createdByUserId,
  context = {},
) {
  const month = assertDistributionMonth(monthInput);
  const now = context.referenceDate instanceof Date
    ? new Date(context.referenceDate)
    : new Date();
  if (Number.isNaN(now.getTime())) {
    const error = new Error("Data de referência inválida.");
    error.statusCode = 400;
    error.code = "WORKER_DATE_INVALID";
    throw error;
  }
  const currentUtcMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  if (month >= currentUtcMonth) {
    const error = new Error("A pool só pode fechar meses UTC já terminados.");
    error.statusCode = 409;
    error.code = "ACCOUNTING_MONTH_NOT_CLOSED";
    throw error;
  }
  const trigger = context.trigger ?? "admin";
  if (!["admin", "worker"].includes(trigger)) {
    const error = new Error("Trigger de distribuição inválido.");
    error.statusCode = 400;
    throw error;
  }
  const actorUserId = trigger === "admin" ? asAdminObjectId(createdByUserId) : null;
  if (trigger === "worker" && createdByUserId !== null) {
    const error = new Error("O worker não pode fabricar um administrador.");
    error.statusCode = 400;
    throw error;
  }
  const { start, end } = monthPeriod(month);

  try {
    return await runInTransaction(async ({ db, session }) => {
      const distributions = db.collection("pool_distributions");
      const existing = await distributions.findOne({ month }, { session });
      if (existing) {
        return { distribution: toPublicRun({ ...existing, replayed: true }) };
      }

      const payments = await db.collection("payment_attempts").find(
        {
          schemaVersion: 2,
          status: "approved",
          accountingEstimate: false,
          approvedAt: { $gte: start, $lt: end },
        },
        { session },
      ).toArray();
      const paymentSnapshots = payments.map(snapshotPayment);
      const totalPoolCents = paymentSnapshots.reduce(
        (total, payment) => addSafeCents(total, payment.poolCents),
        0,
      );

      const charities = await db.collection("charities").find(
        {
          status: "active",
          poolStatus: "eligible",
          approvedAt: { $lt: end },
        },
        { session },
      ).sort({ approvedAt: 1, _id: 1 }).toArray();
      const hasEligibleCharities = charities.length > 0;
      const offset = hasEligibleCharities
        ? rotationOffsetForMonth(month, charities.length)
        : 0;
      const rotated = hasEligibleCharities
        ? [...charities.slice(offset), ...charities.slice(0, offset)]
        : [];
      const items = hasEligibleCharities
        ? splitCents(totalPoolCents, rotated)
        : [];
      const runId = new ObjectId();
      const run = {
        _id: runId,
        month,
        totalPoolCents,
        status: hasEligibleCharities
          ? "completed"
          : "deferred_no_eligible_charities",
        deferredReason: hasEligibleCharities
          ? null
          : "NO_ELIGIBLE_CHARITIES_AT_CLOSE",
        items,
        paymentSnapshots,
        financialSnapshot: {
          source: "payment_attempts_v2",
          currency: "EUR",
          paymentCount: paymentSnapshots.length,
          approvedRevenueCents: paymentSnapshots.reduce(
            (total, payment) => addSafeCents(total, payment.amountCents),
            0,
          ),
          accountingEstimate: false,
          periodStart: start,
          periodEnd: end,
          eligibleCharityCount: charities.length,
        },
        trigger,
        createdBy: actorUserId,
        createdAt: now,
      };
      await distributions.insertOne(run, { session });

      if (trigger === "admin") {
        await writeAdminAudit({
          db,
          session,
          actorUserId,
          action: "charity.pool_distribution.created",
          targetType: "pool_distribution",
          targetId: runId,
          after: {
            month,
            status: run.status,
            totalPoolCents,
            paymentCount: paymentSnapshots.length,
            eligibleCharityCount: charities.length,
          },
          requestId: context.requestId,
        });
      }

      return { distribution: toPublicRun(run) };
    });
  } catch (error) {
    if (error?.code !== 11000) throw error;
    const db = await getDb();
    const existing = await db.collection("pool_distributions").findOne({ month });
    if (!existing) throw error;
    return { distribution: toPublicRun({ ...existing, replayed: true }) };
  }
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

Cria agora `backend/src/modules/jobs/pool-jobs.service.js`. O primeiro dia UTC
abre candidatos novos para o mês anterior e para catch-up; nos restantes dias
o worker só recupera jobs já registados em `failed` ou com lease expirado. Cada
passagem trata no máximo 120 meses.

```js
/**
 * Job mensal idempotente da pool solidária.
 *
 * Reutiliza o ledger/lease de MF4-01. Um fecho concluído ou diferido é terminal;
 * apenas falhas operacionais sem conclusão recebem `retryAt`.
 */
import { getDb } from "../../config/database.js";
import {
  runMonthlyDistribution,
} from "../charities/pool-distribution.service.js";
import {
  assertDistributionMonth,
} from "../charities/pool-distribution.validation.js";
import {
  claimScheduledJob,
  completeScheduledJob,
  failScheduledJob,
  registerScheduledJob,
} from "./scheduled-jobs.service.js";

const MAX_POOL_CATCHUP_MONTHS = 120;
const DEFAULT_LEASE_MS = 5 * 60_000;
const DEFAULT_RETRY_MS = 5 * 60_000;

/**
 * Cria um erro operacional sem dados internos.
 *
 * @param {string} code - Código estável.
 * @param {string} message - Mensagem local segura.
 * @returns {Error} Erro categorizado.
 */
function operationalError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

/**
 * Valida o relógio injetado pelo worker.
 *
 * @param {unknown} value - Data candidata.
 * @returns {Date} Cópia válida.
 */
function requiredDate(value) {
  const date = value === undefined ? new Date() : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw operationalError("WORKER_DATE_INVALID", "Data do worker inválida.");
  }
  return date;
}

/**
 * Valida o retry antes de reclamar jobs.
 *
 * @param {unknown} value - Duração opcional em milissegundos.
 * @returns {number} Duração entre 5 segundos e 15 minutos.
 */
function retryDelayMs(value) {
  const milliseconds = Number(value ?? DEFAULT_RETRY_MS);
  if (
    !Number.isInteger(milliseconds) ||
    milliseconds < 5_000 ||
    milliseconds > 15 * 60_000
  ) {
    throw operationalError("WORKER_RETRY_INVALID", "Retry inválido.");
  }
  return milliseconds;
}

/**
 * Converte uma data UTC na chave mensal `YYYY-MM`.
 *
 * @param {Date} date - Data válida.
 * @returns {string} Chave mensal.
 */
function utcMonthKey(date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

/**
 * Calcula o mês UTC imediatamente anterior.
 *
 * @param {Date} referenceDate - Relógio do worker.
 * @returns {string} Mês fechado anterior.
 */
export function previousUtcMonth(referenceDate) {
  const date = requiredDate(referenceDate);
  return utcMonthKey(
    new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - 1, 1)),
  );
}

/**
 * Avança uma chave mensal validada exatamente um mês.
 *
 * @param {string} month - Mês `YYYY-MM`.
 * @returns {string} Mês seguinte.
 */
function nextUtcMonth(month) {
  const value = assertDistributionMonth(month);
  const [year, monthNumber] = value.split("-").map(Number);
  return utcMonthKey(new Date(Date.UTC(year, monthNumber, 1)));
}

/**
 * Enumera um lote inclusivo e limitado de meses.
 *
 * @param {string} startMonth - Primeiro mês.
 * @param {string} endMonth - Último mês.
 * @returns {string[]} Até 120 chaves mensais.
 */
function enumerateMonths(startMonth, endMonth) {
  const [startYear, startNumber] = assertDistributionMonth(startMonth)
    .split("-")
    .map(Number);
  const [endYear, endNumber] = assertDistributionMonth(endMonth)
    .split("-")
    .map(Number);
  const cursor = new Date(Date.UTC(startYear, startNumber - 1, 1));
  const end = new Date(Date.UTC(endYear, endNumber - 1, 1));
  const months = [];
  while (cursor <= end && months.length < MAX_POOL_CATCHUP_MONTHS) {
    months.push(utcMonthKey(cursor));
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  return months;
}

/**
 * Devolve o primeiro instante UTC depois do mês alvo.
 *
 * @param {string} month - Mês validado.
 * @returns {Date} Primeiro dia do mês seguinte às 00:00 UTC.
 */
function firstDayAfterMonth(month) {
  const [year, monthNumber] = assertDistributionMonth(month)
    .split("-")
    .map(Number);
  return new Date(Date.UTC(year, monthNumber, 1));
}

/**
 * Descobre meses fechados ainda sem ledger, apenas no primeiro dia UTC.
 *
 * Lotes totalmente fechados são atravessados; assim um backlog com mais de 120
 * meses progride em passagens seguintes em vez de ficar preso no lote inicial.
 *
 * @param {{ db?: import("mongodb").Db, referenceDate?: Date }} [input] - Contexto.
 * @returns {Promise<string[]>} Até 120 meses pendentes, por antiguidade.
 */
export async function discoverPendingPoolMonths(input = {}) {
  const db = input.db ?? await getDb();
  const now = requiredDate(input.referenceDate);
  if (now.getUTCDate() !== 1) return [];

  const previousMonth = previousUtcMonth(now);
  const currentMonthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );
  const earliestPayments = await db.collection("payment_attempts")
    .find({
      schemaVersion: 2,
      status: "approved",
      accountingEstimate: false,
      approvedAt: { $lt: currentMonthStart },
    })
    .sort({ approvedAt: 1, _id: 1 })
    .limit(1)
    .toArray();
  const firstMonth = earliestPayments[0]?.approvedAt
    ? utcMonthKey(requiredDate(earliestPayments[0].approvedAt))
    : previousMonth;
  let cursorMonth = firstMonth;

  while (cursorMonth <= previousMonth) {
    const candidates = enumerateMonths(cursorMonth, previousMonth);
    const existing = await db.collection("pool_distributions")
      .find({ month: { $in: candidates } })
      .toArray();
    const closed = new Set(existing.map((distribution) => distribution.month));
    const pending = candidates.filter((month) => !closed.has(month));
    if (pending.length > 0) return pending;
    cursorMonth = nextUtcMonth(candidates.at(-1));
  }
  return [];
}

/**
 * Recupera retries/leases expirados já registados, mesmo fora do primeiro dia.
 *
 * @param {import("mongodb").Db} db - Base operacional.
 * @param {Date} now - Relógio do worker.
 * @returns {Promise<string[]>} Meses registados e prontos.
 */
async function dueRegisteredPoolMonths(db, now) {
  const jobs = await db.collection("scheduled_jobs")
    .find({
      type: "monthly_pool",
      nextRunAt: { $lte: now },
      $or: [
        { status: { $in: ["idle", "failed"] } },
        { status: "running", leaseExpiresAt: { $lte: now } },
      ],
    })
    .sort({ nextRunAt: 1, key: 1 })
    .limit(MAX_POOL_CATCHUP_MONTHS)
    .toArray();
  return jobs
    .map((job) => /^pool:(\d{4}-\d{2})$/u.exec(String(job.key ?? ""))?.[1])
    .filter(Boolean)
    .map(assertDistributionMonth);
}

/**
 * Reclama e fecha um mês; replay/deferred contam como conclusão terminal.
 *
 * @param {{ month: string, ownerId: string, referenceDate?: Date, leaseMs?: number, retryMs?: number, db?: import("mongodb").Db }} input - Contexto.
 * @returns {Promise<object>} Resumo do job.
 */
export async function runMonthlyPoolJob(input) {
  const db = input.db ?? await getDb();
  const now = requiredDate(input.referenceDate);
  const retryMs = retryDelayMs(input.retryMs);
  const month = assertDistributionMonth(input.month);
  const lastClosedMonth = previousUtcMonth(now);
  if (month > lastClosedMonth) {
    throw operationalError(
      "ACCOUNTING_MONTH_NOT_CLOSED",
      "O mês da pool ainda não terminou.",
    );
  }

  const key = `pool:${month}`;
  const existingJob = await db.collection("scheduled_jobs").findOne({ key });
  if (!existingJob && now.getUTCDate() !== 1) {
    return { month, claimed: false, completed: false, skipped: "not_first_utc_day" };
  }
  await registerScheduledJob({
    key,
    type: "monthly_pool",
    nextRunAt: firstDayAfterMonth(month),
    db,
  });
  const claimed = await claimScheduledJob({
    key,
    ownerId: input.ownerId,
    leaseMs: input.leaseMs ?? DEFAULT_LEASE_MS,
    now,
    db,
  });
  if (!claimed) return { month, claimed: false, completed: false };

  try {
    const result = await runMonthlyDistribution(month, null, {
      trigger: "worker",
      referenceDate: now,
    });
    const completed = await completeScheduledJob({
      key,
      ownerId: input.ownerId,
      now,
      db,
    });
    if (!completed) {
      throw operationalError("JOB_LEASE_LOST", "O lease mensal mudou de owner.");
    }
    return {
      month,
      claimed: true,
      completed: true,
      replayed: result.distribution.replayed === true,
      status: result.distribution.status,
    };
  } catch (error) {
    const failedByOwner = await failScheduledJob({
      key,
      ownerId: input.ownerId,
      retryAt: new Date(now.getTime() + retryMs),
      errorCode: error?.code ?? "MONTHLY_POOL_JOB_FAILED",
      now,
      db,
    });
    return {
      month,
      claimed: true,
      completed: false,
      failed: failedByOwner,
      leaseLost: !failedByOwner,
    };
  }
}

/**
 * Executa catch-up no primeiro dia e retries registados em qualquer dia.
 *
 * @param {{ ownerId: string, referenceDate?: Date, leaseMs?: number, retryMs?: number }} input - Contexto do worker.
 * @returns {Promise<{ firstUtcDay: boolean, months: string[], jobs: object[], completed: number, failed: number }>} Resumo.
 */
export async function runPendingMonthlyPoolJobs(input) {
  const db = await getDb();
  const now = requiredDate(input.referenceDate);
  const [newMonths, registeredMonths] = await Promise.all([
    discoverPendingPoolMonths({ db, referenceDate: now }),
    dueRegisteredPoolMonths(db, now),
  ]);
  const months = [...new Set([...registeredMonths, ...newMonths])]
    .sort()
    .slice(0, MAX_POOL_CATCHUP_MONTHS);
  const jobs = [];
  for (const month of months) {
    // A ordem sequencial torna o avanço do catch-up simples de auditar.
    jobs.push(await runMonthlyPoolJob({ ...input, month, referenceDate: now, db }));
  }
  return {
    firstUtcDay: now.getUTCDate() === 1,
    months,
    jobs,
    completed: jobs.filter((job) => job.completed).length,
    failed: jobs.filter((job) => job.failed || job.leaseLost).length,
  };
}
```

Em `backend/src/modules/jobs/billing-jobs.service.js`, acrescenta o import e
substitui **apenas** a função `runBillingWorkerCycle` do BK-MF4-01 pelo bloco
seguinte. `runDueSubscriptionJobs` permanece intacta.

```js
import { runPendingMonthlyPoolJobs } from "./pool-jobs.service.js";

/**
 * Executa os dois domínios do mesmo worker sem apagar jobs de subscrição.
 *
 * @param {{ ownerId: string, referenceDate?: Date }} input - Contexto comum.
 * @returns {Promise<{ subscriptions: object, pool: object }>} Resumo cumulativo.
 */
export async function runBillingWorkerCycle(input) {
  const [subscriptions, pool] = await Promise.all([
    runDueSubscriptionJobs(input),
    runPendingMonthlyPoolJobs(input),
  ]);
  return { subscriptions, pool };
}
```

Em `backend/src/worker.js`, acrescenta o import da pool e substitui apenas
`prepareWorker` por esta versão cumulativa. Os sinais, loop e shutdown do
BK-MF4-01 permanecem iguais.

```js
import { ensurePoolDistributionIndexes } from "./modules/charities/pool-distribution.service.js";

async function prepareWorker() {
  await assertTransactionSupport({ required: true });
  await ensureScheduledJobIndexes();
  await ensureSubscriptionIndexes();
  await ensureBillingJobIndexes();
  // O índice único por mês existe antes de qualquer claim `pool:YYYY-MM`.
  await ensurePoolDistributionIndexes();
}
```

Na função `runWorker` já existente, substitui apenas o contexto do log de ciclo
pela versão abaixo para tornar os dois domínios observáveis, sem alterar o loop:

```js
log.info("worker_cycle_completed", {
  subscriptionJobs: result?.subscriptions,
  poolJob: result?.pool,
});
```

5. Explicação do código ou da decisão.

Todo o dinheiro fica em cêntimos. `splitCents` reparte também os cêntimos
sobrantes, garantindo que a soma dos itens é igual ao total. O offset é função
de `YYYY-MM` e a receita vem dos snapshots de `payment_attempts` v2 elegíveis;
nunca do estado atual de subscrições/planos. No primeiro dia UTC, o job abre o
mês anterior e até 120 meses antigos em falta; fora desse dia apenas recupera
uma key já registada e pronta para retry/takeover. `completed` e
`deferred_no_eligible_charities` são ambos terminais. O worker continua a
executar subscrições e pool no mesmo `runBillingWorkerCycle`.

6. Validação do passo.

```bash
node --check src/modules/charities/pool-distribution.service.js
node --check src/modules/jobs/pool-jobs.service.js
node --check src/modules/jobs/billing-jobs.service.js
node --check src/worker.js
node -e "Promise.all([import('./src/modules/charities/pool-distribution.service.js'), import('./src/modules/jobs/pool-jobs.service.js'), import('./src/modules/jobs/billing-jobs.service.js')]).then(([distribution, poolJobs, billing]) => console.log(typeof distribution.runMonthlyDistribution, typeof poolJobs.runPendingMonthlyPoolJobs, typeof billing.runBillingWorkerCycle))"
```

Depois implementa estes testes com doubles e, para a concorrência
transacional, repete-os num replica set `_e2e` isolado sem os promover a `PASS`
apenas por o snippet existir:

| ID | Preparação | Assert obrigatório |
| --- | --- | --- |
| `POOL-FIRST-DAY-01` | Relógio em `2026-07-01T00:00:00Z` e junho ainda aberto. | Descobre `2026-06`, regista `pool:2026-06` e chama o fecho com `trigger: "worker"`. |
| `POOL-FIRST-DAY-02` | Relógio em 2 de julho sem job registado. | Não cria nem reclama junho; devolve `not_first_utc_day`. |
| `POOL-RETRY-01` | Job de junho falha no dia 1 e `retryAt` vence no dia 2. | O job já registado é reclamado no dia 2; nenhuma key nova é criada. |
| `POOL-CONCURRENT-01` | Owners A/B tentam fechar o mesmo mês no mesmo instante. | Um claim, uma distribuição, owner antigo recusado após takeover e zero duplicados. |
| `POOL-TERMINAL-01` | Não existem associações elegíveis. | Persiste `deferred_no_eligible_charities`, completa o job e uma passagem seguinte não o repete. |
| `POOL-CATCHUP-01` | Existem mais de 120 meses em falta. | Cada passagem trata no máximo 120 e a seguinte atravessa lotes já fechados até progredir. |
| `POOL-CUMULATIVE-01` | Invocar `runBillingWorkerCycle` com doubles dos dois domínios. | Chama uma vez subscriptions e pool e devolve ambas as chaves no resumo. |

7. Caso negativo, erro comum ou risco que este passo evita.

Sem índice único por mês e lease `pool:YYYY-MM`, dois workers podiam duplicar a
distribuição. Não substituas `runBillingWorkerCycle` por uma função que devolve
apenas `pool`: isso apagaria renovação/trial/cancelamento. Não trates
`deferred_no_eligible_charities` como erro de retry; é um snapshot terminal do
mês fechado.

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
  previewMonthlyDistribution,
  runMonthlyDistribution,
} from "./pool-distribution.service.js";
import { assertDistributionPreviewToken } from "./pool-distribution.validation.js";

function assertObjectBody(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    const error = new Error("O corpo do pedido deve ser um objeto JSON.");
    error.statusCode = 400;
    error.code = "INVALID_REQUEST_BODY";
    throw error;
  }
  return body;
}

/**
 * Executa uma nova distribuição mensal por pedido admin.
 *
 * @param {import("express").Request} req Pedido com `body.month` e `user.id`.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<void>}
 */
export async function postMonthlyDistribution(req, res) {
  const body = assertObjectBody(req.body);
  const previewToken = assertDistributionPreviewToken(body.previewToken);
  res.status(201).json(await runMonthlyDistribution(
    body.month,
    req.user.id,
    {
      trigger: "admin",
      requestId: req.id,
      expectedPreviewToken: previewToken,
    },
  ));
}

/**
 * Calcula a preview atual sem escrever distribuição ou audit log.
 */
export async function getMonthlyDistributionPreview(req, res) {
  res.status(200).json(await previewMonthlyDistribution(req.params.month));
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
  "/pool/distributions/:month/preview",
  requireRole(["admin"]),
  asyncHandler(getMonthlyDistributionPreview),
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
curl -i http://localhost:3000/api/charities/pool/distributions/2026-06/preview
curl -i -X POST http://localhost:3000/api/charities/pool/distributions \
  -H "Content-Type: application/json" \
  -d '{"month":"2026-06","previewToken":"<token SHA-256 devolvido pela preview>"}'
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

Preserva o import de `apiClient` e o objeto `charitiesApi` criado nos BKs
anteriores. Acrescenta `previewDistribution`, `runDistribution` e
`getDistribution` sem voltar a
declarar o export nem remover candidatura/review/membership.

4. Código completo.

Adicionar no fim de `charitiesApi.js`, depois da declaração existente:

```js
Object.assign(charitiesApi, {
/**
 * Executa a distribuição mensal no backend.
 *
 * @param {string} month Mês no formato `YYYY-MM`.
 * @returns {Promise<{ distribution: object }>} Distribuição criada.
 */
runDistribution(month, previewToken, options = {}) {
  return apiClient.post(
    "/api/charities/pool/distributions",
    { month, previewToken },
    options,
  );
},
/**
 * Obtém uma preview sem escrita antes do commit financeiro.
 */
previewDistribution(month, options = {}) {
  return apiClient.get(
    `/api/charities/pool/distributions/${encodeURIComponent(month)}/preview`,
    options,
  );
},
/**
 * Consulta uma distribuição mensal já criada.
 *
 * @param {string} month Mês no formato `YYYY-MM`.
 * @returns {Promise<{ distribution: object }>} Distribuição existente.
 */
getDistribution(month, options = {}) {
  return apiClient.get(
    `/api/charities/pool/distributions/${encodeURIComponent(month)}`,
    options,
  );
},
});
```

`frontend/src/pages/AdminPoolDistributionPage.jsx`

```jsx
/**
 * Módulo da página administrativa de distribuição da pool.
 *
 * Permite executar ou consultar uma distribuição mensal e mostra o resultado
 * persistido sem recalcular valores críticos no browser.
 */
import { useEffect, useRef, useState } from "react";
import { ConfirmDialog } from "../components/admin/ConfirmDialog.jsx";
import { charitiesApi } from "../services/api/charitiesApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

/**
 * Formata o mês civil local sem converter a data para UTC.
 *
 * @param {Date} [date=new Date()] Data no fuso do browser.
 * @returns {string} Mês no formato `YYYY-MM`.
 */
export function formatLocalMonth(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

/**
 * Painel administrativo para executar e consultar a distribuição mensal.
 *
 * @returns {JSX.Element} Formulário mensal e resultado persistido.
 */
export function AdminPoolDistributionPage() {
  const [month, setMonth] = useState(() => formatLocalMonth());
  const [preview, setPreview] = useState(null);
  const [distribution, setDistribution] = useState(null);
  const [error, setError] = useState("");
  const [previewing, setPreviewing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const runControllerRef = useRef(null);

  useEffect(() => () => runControllerRef.current?.abort(), []);

  /**
   * Obtém uma preview sem escrita e invalida qualquer preview anterior.
   *
   * @param {React.FormEvent<HTMLFormElement>} event Evento do formulário.
   * @returns {Promise<void>}
   */
  async function handlePreview(event) {
    event.preventDefault();
    if (runControllerRef.current) return;
    const controller = new AbortController();
    runControllerRef.current = controller;
    setError("");
    setPreview(null);
    setDistribution(null);
    setPreviewing(true);
    try {
      const response = await charitiesApi.previewDistribution(month, {
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      setPreview(response.preview);
    } catch (apiError) {
      if (controller.signal.aborted || apiError?.name === "AbortError") return;
      setError(toUserMessage(apiError));
    } finally {
      if (runControllerRef.current === controller) {
        runControllerRef.current = null;
        setPreviewing(false);
      }
    }
  }

  async function handleRun() {
    if (!preview?.previewToken || runControllerRef.current) return;
    const controller = new AbortController();
    runControllerRef.current = controller;
    setSubmitting(true);
    setError("");
    try {
      const response = await charitiesApi.runDistribution(
        preview.month,
        preview.previewToken,
        { signal: controller.signal },
      );
      if (controller.signal.aborted) return;
      setDistribution(response.distribution);
      setConfirmOpen(false);
    } catch (apiError) {
      if (controller.signal.aborted || apiError?.name === "AbortError") return;
      if (apiError?.code === "POOL_PREVIEW_STALE") {
        setPreview(null);
        setConfirmOpen(false);
        setError("Os dados mudaram. Gera uma nova pré-visualização.");
      } else {
        setError(toUserMessage(apiError));
      }
    } finally {
      if (runControllerRef.current === controller) {
        runControllerRef.current = null;
        setSubmitting(false);
      }
    }
  }

  return (
    <main>
      <h1>Distribuição mensal</h1>
      {error && <p role="alert">{error}</p>}
      <form onSubmit={handlePreview}>
        <label>Mês<input type="month" value={month} onChange={(event) => { setMonth(event.target.value); setPreview(null); }} disabled={previewing || submitting} required /></label>
        <button type="submit" disabled={previewing || submitting}>{previewing ? "A calcular..." : "Pré-visualizar"}</button>
      </form>
      {preview ? (
        <section>
          <h2>Pré-visualização de {preview.month}</h2>
          <p>Total: {(preview.totalPoolCents / 100).toFixed(2)} EUR</p>
          <p>Associações: {preview.items.length}</p>
          <button type="button" onClick={() => setConfirmOpen(true)}>Rever e distribuir</button>
        </section>
      ) : null}
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
      <ConfirmDialog
        open={confirmOpen}
        title={`Distribuir a pool de ${preview?.month ?? "mês selecionado"}`}
        confirmLabel="Distribuir agora"
        busy={submitting}
        onCancel={() => !submitting && setConfirmOpen(false)}
        onConfirm={handleRun}
      >
        <p>O commit usa o token da preview; qualquer alteração financeira obriga nova revisão.</p>
      </ConfirmDialog>
    </main>
  );
}
```

Em `frontend/src/routes/AppRoutes.jsx`:

```jsx
// ADICIONAR uma única vez; a guarda visual é composta depois em BK-MF7-02.
const AdminPoolDistributionPage = lazyNamedPage(
  () => import("../pages/AdminPoolDistributionPage.jsx"),
  "AdminPoolDistributionPage",
);

<Route path="/admin/pool/distribution" element={<AdminPoolDistributionPage />} />
```

5. Explicação do código ou da decisão.

A UI não recalcula valores no browser. Mostra a preview autoritativa, pede
confirmação acessível e envia o respetivo token no commit. A rota administrativa
usa uma declaração lazy própria e conserva o router cumulativo.

6. Validação do passo.

Gerar preview, cancelar, gerar de novo, confirmar e repetir o mesmo mês. Alterar
um dado financeiro entre preview e commit deve devolver `POOL_PREVIEW_STALE`.

7. Caso negativo, erro comum ou risco que este passo evita.

Calcular no frontend ou aceitar commit sem token abriria divergência entre o que
o admin reviu e os dados persistidos.

#### Critérios de aceite

- Um mês valido cria uma unica distribuição.
- Segunda execução do mesmo mês devolve o registo original com `replayed: true` e não cria uma segunda distribuição.
- Soma dos `items.amountCents` e igual a `totalPoolCents`.
- Em dois meses consecutivos com as mesmas associações elegíveis, o primeiro `items[0].charityId` muda.
- Associações com `poolStatus` diferente de `eligible` não recebem valor.
- Associações aprovadas depois de `periodEnd` não entram no fecho nem recebem retroativamente esse mês.
- Pagamentos falhados, sem v2, fora do mês ou com `accountingEstimate: true` não entram no total da pool.
- Cada snapshot exige `currency: "EUR"`, `amountCents` inteiro seguro não
  negativo e percentagem inteira segura; USD, montantes inválidos e qualquer
  multiplicação/soma acima de `Number.MAX_SAFE_INTEGER` falham fechados sem
  distribuição parcial nem agregação entre moedas.
- `POST` com body nulo/array devolve `400 INVALID_REQUEST_BODY` pelo envelope,
  antes de ler `month`.
- O mês atual/futuro devolve `409 ACCOUNTING_MONTH_NOT_CLOSED`.
- `financialSnapshot.approvedRevenueCents` é a soma dos
  `paymentSnapshots.amountCents`; `totalPoolCents` é a soma dos respetivos
  `poolCents`.
- Sem associação elegível, o mês fica fechado com `deferred_no_eligible_charities`, motivo estável e zero `items`; replay devolve o mesmo ledger e o worker não o repete indefinidamente.
- Um backlog superior a 120 meses progride em várias passagens; cada passagem executa, no máximo, 120 meses pendentes e não fica bloqueada por lotes anteriores já fechados.
- Só o primeiro dia UTC regista novos jobs mensais e começa pelo mês anterior;
  fora desse dia apenas retries/leases expirados já registados podem executar.
- A key única `pool:YYYY-MM` usa claim/takeover e `complete/fail` com o mesmo
  `leaseOwner`; concorrência deixa uma distribuição e um job terminal.
- `runBillingWorkerCycle` devolve simultaneamente `subscriptions` e `pool`; a
  integração mensal não remove os ciclos horários do `BK-MF4-01`.
- Sem admin, endpoints devolvem `401` ou `403`.
- A UI inicializa o mês civil local sem `toISOString()`, exige confirmação e
  impede uma segunda submissão enquanto o fecho está em curso.
- A preview não escreve `pool_distributions` nem audit log; o commit exige
  `previewToken` e um token stale devolve `409 POOL_PREVIEW_STALE` antes de
  qualquer escrita.

#### Validação final

```bash
cd backend
npm test
node --check src/modules/jobs/pool-jobs.service.js
node --check src/modules/jobs/billing-jobs.service.js
node --check src/worker.js
```

Executar com doubles locais duas distribuições de meses já fechados, repetir uma
delas e validar filtro financeiro, snapshot, reconciliação, replay, primeiro dia
UTC, retry no dia seguinte, concorrência e composição subscriptions+pool. Não
executar migração, seed ou escrita na base normal. Concorrência MongoDB só fecha
com replica set `_e2e` isolado e evidence real.

#### Evidence para PR/defesa

- `pr`: commit/PR com distribuição, `pool-jobs.service.js`, integração cumulativa
  do worker e painel admin.
- `proof`: JSON de duas distribuições, job terminal `pool:YYYY-MM`, soma
  reconciliada e resumo do worker com `subscriptions` e `pool`.
- `neg`: mês aberto, segundo dia sem job novo, corrida de dois owners,
  associação aprovada depois do fecho, backlog superior a 120 e pedido sem admin.

#### Handoff

O `BK-MF4-06` deve ler `pool_distributions` para relatórios, histórico por
associação e página pública agregada. Não volta a calcular a pool nem cria um
segundo scheduler; o worker cumulativo deste BK permanece a autoridade do fecho.

## Snippet técnico aplicável

```js
// A ordem nasce do mês e não da ordem em que os jobs forem executados.
function rotationOffsetForMonth(year, monthNumber, charities) {
  return (year * 12 + monthNumber - 1) % charities.length;
}
```

#### Changelog

- `2026-07-12`: fecho manual alinhado ao contrato preview -> confirmação ->
  commit com `previewToken`; token stale falha antes de distribuição/audit.

- `2026-06-13`: guia reescrito com algoritmo mensal, idempotência, rotação, endpoints admin, UI e negativos.
- `2026-07-10`: fonte da pool corrigida para pagamentos v2 aprovados/não estimados, snapshot imutável, mês UTC fechado, replay e worker com lease.
- `2026-07-10`: fecho sem beneficiárias tornado terminal e imutável, sem retroatividade/retry infinito; catch-up limitado a 120 meses pendentes por passagem.
- `2026-07-10`: seletor financeiro alinhado ao mês civil local e fecho manual
  protegido por confirmação e busy state.
- `2026-07-10`: publicado o job mensal cumulativo com key `pool:YYYY-MM`,
  primeiro dia UTC, retry/takeover, catch-up de 120 meses e composição que
  preserva os jobs de subscrição do worker existente.
