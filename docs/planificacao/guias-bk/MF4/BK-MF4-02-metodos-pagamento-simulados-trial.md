# BK-MF4-02 - Métodos de pagamento simulados e trial

## Header

- `doc_id`: `GUIA-BK-MF4-02`
- `bk_id`: `BK-MF4-02`
- `macro`: `MF4`
- `owner`: `Davi`
- `apoio`: `Matheus`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF4-01`
- `rf_rnf`: `RF37, RF40`
- `fase_documental`: `Fase 1`
- `sprint`: `S07`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF4-08`
- `guia_path`: `docs/planificacao/guias-bk/MF4/BK-MF4-02-metodos-pagamento-simulados-trial.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais acrescentar pagamentos simulados e trial único por utilizador. O MVP não integra Stripe, PayPal, MB Way nem webhooks reais. O objetivo é treinar o fluxo de negócio sem guardar dados financeiros sensíveis.


- Distinguir pagamento simulado de gateway real.
- Implementar trial apenas uma vez por utilizador.
- Registar tentativas de pagamento com estado auditável.
- Preparar notificações transacionais para o `BK-MF4-08`.

#### Importância

- Este BK permite demonstrar o ciclo de subscrição sem depender de bancos, cartões ou fornecedores externos.
- O trial dá acesso temporário e controlado a novos utilizadores, mantendo a regra de uso único.
- As tentativas de pagamento criam evidência objetiva para a defesa PAP: aprovado, recusado, sem login e segunda tentativa de trial.

#### Scope-in

- Criar métodos de pagamento simulados e resultado controlado `approved`/`failed`.
- Guardar tentativas de pagamento sem dados financeiros reais.
- Fazer o checkout aprovado criar ou atualizar a subscrição paga dentro da
  mesma transação.
- Criar trial único por utilizador e integrá-lo com o guard premium.
- Exigir `Idempotency-Key` e garantir replay seguro sem duplicar efeitos.
- Persistir ledger financeiro v2, subscrição/trial e notificação na mesma transação.
- Atualizar a página de subscrição com ações de checkout simulado e trial.

#### Scope-out

- Não integrar Stripe, PayPal, MB Way, webhooks, IBAN, cartão real, CVV ou token financeiro.
- Não alterar o cálculo da pool solidária; este BK apenas prepara subscrições pagas/trial.
- Não criar emails reais nem notificações externas; notificações internas entram no `BK-MF4-08`.

### Tempo estimado

- 2 blocos de 90 minutos.
- Se houver dúvidas sobre dados financeiros, consultar `RNF18` antes de escrever código.

#### Estado antes e depois

- Estado antes: aplicam-se os BKs declarados em `dependencias`, os RF/RNF do Header e os artefactos já entregues pelas fases anteriores.
- Estado depois: ficam implementáveis e verificáveis apenas os resultados listados em `Scope-in`, sem antecipar o `Scope-out`.

#### Pré-requisitos

- `BK-MF4-01` executado com planos e subscrições.
- `requireAuth` disponível.
- `subscriptions.service.js` disponibiliza internamente o helper de subscrição
  consumido pelo checkout e exporta `hasActiveSubscriptionAccess`; nenhum
  controller ou router expõe ativação direta.
- `apiClient` existe no frontend.

#### Glossário

- Pagamento simulado: fluxo de demonstração que imita sucesso ou falha sem contactar um gateway real.
- Trial: período gratuito com acesso premium temporário.
- Tentativa de pagamento: registo auditável do pedido, do valor e do resultado.
- Resultado simulado: valor controlado usado para testar caminho positivo e negativo.
- Chave idempotente: identificador do pedido que permite repetir uma tentativa de rede sem criar uma segunda compra ou trial.
- `requestHash`: hash SHA-256 da operação e payload normalizado, usado para detetar reutilização da chave com dados diferentes.

#### Conceitos teóricos essenciais

- Domínio FaithFlix: pagamento aceite mantém a subscrição ativa; pagamento recusado bloqueia acesso premium.
- Backend: o service valida o plano antes de gravar tentativa, para não criar pagamentos sem subscrição associada.
- Frontend: a UI chama `paymentsApi` e mostra mensagens observáveis para sucesso, erro e trial já usado.
- Segurança: nenhum dado financeiro real entra no payload, nos logs ou na base de dados.
- Dados: `payment_attempts` guarda a tentativa; `trials` impede segundo trial do mesmo utilizador.
- Atomicidade: tentativa, subscrição, notificação e resposta idempotente fazem commit ou rollback na mesma transação MongoDB.
- O lock de billing lê e volta a escrever a conta na mesma sessão. Só estado
  `active` ou documento legacy sem `accountStatus` pode avançar; `inactive`,
  `blocked`, `deleted` ou valor desconhecido devolve `ACCOUNT_NOT_AVAILABLE`
  antes de criar tentativa, trial ou subscrição.
- `CANONICO`: RF37 exige métodos de pagamento; RF40 permite trial.
- `CANONICO`: RNF18 proíbe guardar dados de cartão na base de dados da aplicação.
- `DERIVADO`: `simulateOutcome` aceita `approved` ou `failed` para testar caminhos positivos e negativos.
- `DERIVADO`: o trial usa `subscriptions.status: "trialing"` para reutilizar o guard premium criado no `BK-MF4-01`.
- `DERIVADO`: checkout e trial exigem `Idempotency-Key`; a combinação da chave
  com `requestHash` permite replay do mesmo pedido e recusa payload diferente.
- `DERIVADO`: tentativa, subscrição/trial, notificação, resposta e audit fazem
  commit ou rollback na mesma chamada a `runInTransaction` e na mesma sessão.
- `DERIVADO`: `payment_attempts` usa `schemaVersion: 2` e guarda o snapshot
  financeiro autoritativo, nunca cartão, CVV ou token financeiro.
- `DERIVADO`: a UI mantém uma chave por intenção estável, reutiliza-a após falha
  ambígua, impede mutações sobrepostas e cancela pedidos no unmount.

### Erros comuns

- Guardar número de cartão, CVV ou token financeiro.
- Permitir segundo trial ao mesmo utilizador.
- Ativar subscrição quando o pagamento simulado falhou.
- Criar outra colecao de subscrições em vez de usar a do `BK-MF4-01`.
- Gerar uma nova chave em cada retry automático; o retry do mesmo gesto tem de reutilizar a chave original.
- Atualizar primeiro `payment_attempts` e só depois a subscrição fora de transação, deixando estado parcial quando a segunda escrita falha.

### Check de compreensão

- [ ] Sei explicar porque o pagamento e simulado no MVP.
- [ ] Sei provar que trial só pode ser usado uma vez.
- [ ] Sei listar que dados financeiros não entram na base de dados.

#### Arquitetura do BK

- Backend: módulo `payments` com validação, service, controller e router.
- Persistência: `payment_attempts` v2 regista snapshot financeiro e idempotência; `trials` garante trial único.
- Integração: pagamento aprovado chama `activateSubscription`; trial chama `grantTrialSubscription`.
- Frontend: `paymentsApi` é consumido pela `SubscriptionPage` criada no `BK-MF4-01`.
- Segurança: endpoints exigem `requireAuth`; o `userId` vem sempre de `req.user.id`.
- Transação: os helpers de subscrição/notificação recebem `{ db, session }`; não iniciam uma segunda transação.

`activateSubscription` é apenas um helper interno do
módulo de pagamentos. Não criar `POST /api/subscriptions/me`, cliente API ou
atalho de teste que ative uma subscrição paga sem checkout aprovado. Todos os
helpers chamados pelo service recebem `{ db, session }`. O provider permanece
`faithflix-simulated`; este BK não implementa nem prova um gateway real.

#### Ficheiros a criar/editar/rever

- CRIAR: `backend/src/modules/payments/payments.validation.js`
- CRIAR: `backend/src/modules/payments/payments.service.js`
- CRIAR: `backend/src/modules/payments/payments.controller.js`
- CRIAR: `backend/src/modules/payments/payments.routes.js`
- CRIAR: `backend/src/modules/notifications/notifications.service.js`
- CRIAR: `frontend/src/services/api/paymentsApi.js`
- EDITAR: `backend/src/modules/subscriptions/subscriptions.validation.js`
- EDITAR: `backend/src/modules/subscriptions/subscriptions.service.js`
- EDITAR: `backend/src/app.js`
- EDITAR: `backend/src/server.js`
- EDITAR: `frontend/src/pages/SubscriptionPage.jsx`
- REVER: `BK-MF4-01`, `RF37`, `RF40`, `RNF17`, `RNF18`, `RNF24`

#### Tutorial técnico linear

### Passo 1 - Criar validação de pagamento simulado

1. Objetivo do passo.

Validar método, plano e resultado simulado.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/payments/payments.validation.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Cria o módulo `payments`.

4. Código completo.

```js
/**
 * Métodos e resultados aceites pelo checkout de demonstração.
 * A lista fechada impede que a UI ou a API sugiram recolha de dados financeiros reais.
 */
export const PAYMENT_METHODS = ["card_test", "mbway_test", "transfer_test"];
export const SIMULATED_OUTCOMES = ["approved", "failed"];
const IDEMPOTENCY_KEY_PATTERN = /^[A-Za-z0-9._:-]+$/;

/**
 * Cria um erro HTTP previsivel para o middleware global de erros.
 *
 * @param {string} message Mensagem segura para devolver ao cliente.
 * @param {number} [statusCode=400] Código HTTP associado a erros de validação.
 * @returns {Error} Erro com `statusCode`.
 */
function httpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

/**
 * Valida a chave usada por checkout e trial para deduplicar retries.
 *
 * @param {unknown} value Valor do header `Idempotency-Key`.
 * @returns {string} Chave normalizada.
 */
export function assertIdempotencyKey(value) {
  if (typeof value !== "string" || value.length === 0) {
    const error = httpError("Idempotency-Key obrigatório.");
    error.code = "IDEMPOTENCY_KEY_REQUIRED";
    throw error;
  }
  const normalized = value.trim();
  const forbiddenSentinels = new Set(["undefined", "null"]);
  if (
    normalized.length === 0
    || normalized.length > 128
    || forbiddenSentinels.has(normalized.toLowerCase())
    || !IDEMPOTENCY_KEY_PATTERN.test(normalized)
  ) {
    const error = httpError("Idempotency-Key inválido.");
    error.code = "IDEMPOTENCY_KEY_INVALID";
    throw error;
  }
  return normalized;
}

/**
 * Valida e normaliza o pedido de checkout simulado.
 *
 * @param {object} input Corpo recebido no endpoint de checkout.
 * @param {string} input.planCode Código do plano escolhido.
 * @param {string} input.paymentMethod Método de pagamento de teste.
 * @param {string} [input.simulateOutcome="approved"] Resultado controlado para a demo.
 * @returns {{ planCode: string, paymentMethod: string, simulateOutcome: string }} Payload seguro.
 * @throws {Error} Quando o plano, método ou resultado não respeitam o contrato.
 */
export function assertCheckoutPayload(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw httpError("O pedido de checkout deve ser um objeto JSON.");
  }

  const allowedFields = new Set(["planCode", "paymentMethod", "simulateOutcome"]);
  if (Object.keys(input).some((key) => !allowedFields.has(key))) {
    throw httpError("O pedido contém campos não permitidos.");
  }

  const { planCode, paymentMethod } = input;
  const simulateOutcome = input.simulateOutcome === undefined
    ? "approved"
    : input.simulateOutcome;

  // O backend aceita apenas identificadores de teste; nunca recebe número de cartão ou token financeiro.
  if (typeof planCode !== "string" || !/^[a-z0-9][a-z0-9-]{0,63}$/.test(planCode)) {
    throw httpError("Plano inválido.");
  }
  if (typeof paymentMethod !== "string" || !PAYMENT_METHODS.includes(paymentMethod)) {
    throw httpError("Método de pagamento inválido.");
  }
  if (typeof simulateOutcome !== "string" || !SIMULATED_OUTCOMES.includes(simulateOutcome)) {
    throw httpError("Resultado simulado inválido.");
  }

  return { planCode, paymentMethod, simulateOutcome };
}
```

5. Explicação do código ou da decisão.

A lista fechada deixa claro que o MVP não recolhe dados reais de pagamento.

6. Validação do passo.

```bash
node -e "import('./src/modules/payments/payments.validation.js').then(({ assertCheckoutPayload }) => console.log(assertCheckoutPayload({ planCode: 'faithflix-monthly', paymentMethod: 'card_test' }).paymentMethod))"
```

7. Caso negativo, erro comum ou risco que este passo evita.

Um campo livre para método podia levar alunos a guardar dados reais sem necessidade.

### Passo 2 - Criar service de checkout e trial

1. Objetivo do passo.

Registar tentativa de pagamento, ativar subscrição quando aprovado e criar trial único.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/payments/payments.service.js`
    - EDITAR: `backend/src/modules/subscriptions/subscriptions.validation.js`
    - EDITAR: `backend/src/modules/subscriptions/subscriptions.service.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Usa `activateSubscription` do `BK-MF4-01` apenas dentro da transação iniciada pelo módulo de pagamentos. Antes de criares o service, acrescenta `trialing` ao contrato e torna `activateSubscription`, `grantTrialSubscription` e `createNotification` capazes de reutilizar `{ db, session }`. Gera `requestHash` sobre o payload validado, consulta a chave dentro da transação e não persistas qualquer estado parcial.

4. Código completo, correto e integrado com a app final.

Em `backend/src/modules/subscriptions/subscriptions.validation.js`, atualiza a lista de estados:

```js
/**
 * Estados persistidos para a subscrição do utilizador.
 * `trialing` reutiliza o guard premium sem misturar trial gratuito com receita paga.
 */
export const SUBSCRIPTION_STATUS = ["active", "trialing", "past_due", "expired", "canceled"];
```

Em `backend/src/modules/subscriptions/subscriptions.service.js`, adiciona esta função completa depois de `activateSubscription`:

```js
/**
 * Cria uma subscrição temporária de trial para um utilizador sem subscrição paga ativa.
 *
 * @param {string} userId Identificador do utilizador autenticado.
 * @param {Date | string} endsAt Data em que o acesso gratuito termina.
 * @param {{ db: import("mongodb").Db, session: import("mongodb").ClientSession, now: Date }} options Contexto da transação iniciada pelo pagamento.
 * @returns {Promise<{ subscription: object }>} Subscrição pública no formato do módulo de subscrições.
 * @throws {Error} Quando a data é inválida ou o utilizador já tem subscrição paga ativa.
 */
export async function grantTrialSubscription(userId, endsAt, options) {
  const { db, session, now } = options;
  const periodEnd = new Date(endsAt);

  if (Number.isNaN(periodEnd.getTime()) || periodEnd <= now) {
    const error = new Error("Data de fim de trial inválida.");
    error.statusCode = 400;
    throw error;
  }

  const userIdObject = userObjectId(userId);
  // Trial não deve substituir uma subscrição paga em vigor.
  const activePaidSubscription = await db.collection("subscriptions").findOne(
    {
      userId: userIdObject,
      status: "active",
      planCode: { $ne: "trial" },
      currentPeriodEnd: { $gt: now },
    },
    { session },
  );

  if (activePaidSubscription) {
    const error = new Error("Utilizador já tem uma subscrição ativa.");
    error.statusCode = 409;
    throw error;
  }

  const subscription = {
    userId: userIdObject,
    planCode: "trial",
    status: "trialing",
    currentPeriodStart: now,
    currentPeriodEnd: periodEnd,
    cancelAtPeriodEnd: true,
    updatedAt: now,
  };

  // Mantém uma unica subscrição por utilizador, tal como o fluxo pago do BK anterior.
  await db.collection("subscriptions").updateOne(
    { userId: userIdObject },
    { $set: subscription, $setOnInsert: { createdAt: now } },
    { upsert: true, session },
  );

  const stored = await db.collection("subscriptions").findOne(
    { userId: userIdObject },
    { session },
  );
  return { subscription: publicSubscription(stored) };
}
```

Cria agora a primeira versão de
`backend/src/modules/notifications/notifications.service.js`. O `BK-MF4-08`
vai estender este mesmo módulo com preferências, paginação e alertas de
continuidade; não cria um segundo helper.

```js
import { ObjectId } from "mongodb";

const ESSENTIAL_NOTIFICATION_TYPES = new Set([
  "subscription_activated",
  "payment_failed",
  "trial_started",
]);

function httpError(message, statusCode = 400, code) {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (code) error.code = code;
  return error;
}

function asUserObjectId(userId) {
  if (typeof userId !== "string" || !/^[a-f\d]{24}$/i.test(userId)) {
    throw httpError("Utilizador inválido.");
  }
  return ObjectId.createFromHexString(userId);
}

function requiredText(value, field, maximum) {
  if (typeof value !== "string") throw httpError(`${field} deve ser texto.`);
  const text = value.trim();
  if (text.length < 3 || text.length > maximum) {
    throw httpError(`${field} inválido.`);
  }
  return text;
}

/**
 * Cria um evento essencial dentro da transação financeira que o originou.
 */
export async function createNotification(userId, input, options = {}) {
  const { db, session } = options;
  // A notificação partilha obrigatoriamente o commit financeiro; nunca abre uma transação paralela.
  if (!db || !session || !session.inTransaction()) {
    throw httpError(
      "Contexto transacional de notificação em falta.",
      500,
      "NOTIFICATION_TRANSACTION_REQUIRED",
    );
  }
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw httpError("Notificação inválida.");
  }
  if (
    typeof input.type !== "string" ||
    !ESSENTIAL_NOTIFICATION_TYPES.has(input.type)
  ) {
    throw httpError("Tipo de notificação inválido.");
  }

  const userObjectId = asUserObjectId(userId);
  const preferences = await db.collection("notification_preferences").findOne(
    { userId: userObjectId },
    { session },
  );
  if (preferences?.settings?.inApp === false) {
    return { notification: null, skipped: true };
  }

  const now = new Date();
  const notification = {
    userId: userObjectId,
    type: input.type,
    title: requiredText(input.title, "Título", 120),
    message: requiredText(input.message, "Mensagem", 240),
    readAt: null,
    createdAt: now,
  };
  const result = await db.collection("notifications").insertOne(
    notification,
    { session },
  );
  return {
    notification: {
      id: result.insertedId.toHexString(),
      type: notification.type,
      title: notification.title,
      message: notification.message,
      readAt: null,
      createdAt: now,
    },
    skipped: false,
  };
}
```

Depois cria `backend/src/modules/payments/payments.service.js`:

```js
/**
 * Módulo de serviço para pagamentos simulados e trial gratuito.
 *
 * Centraliza validação, persistência e regras de segurança do checkout de teste.
 * Nunca recebe dados financeiros reais e usa sempre o `userId` autenticado para
 * impedir operações em nome de outro utilizador.
 */
import { createHash } from "node:crypto";
import { ObjectId } from "mongodb";
import { getDb, runInTransaction } from "../../config/database.js";
import { writeAdminAudit } from "../audit/audit.service.js";
import { createNotification } from "../notifications/notifications.service.js";
import {
  activateSubscription,
  grantTrialSubscription,
} from "../subscriptions/subscriptions.service.js";
import {
  assertCheckoutPayload,
  assertIdempotencyKey,
} from "./payments.validation.js";

/**
 * Converte o identificador de utilizador autenticado para `ObjectId`.
 *
 * @param {string} userId Identificador vindo da sessão.
 * @returns {ObjectId} Identificador pronto para filtros MongoDB.
 * @throws {Error} Quando o identificador não e valido.
 */
function userObjectId(userId) {
  if (typeof userId !== "string" || !/^[a-f\d]{24}$/i.test(userId)) {
    const error = new Error("Utilizador inválido.");
    error.statusCode = 400;
    throw error;
  }
  return ObjectId.createFromHexString(userId);
}

/**
 * Soma dias a uma data sem alterar a instancia original.
 *
 * @param {Date} date Data base.
 * @param {number} days Número de dias a acrescentar.
 * @returns {Date} Nova data calculada.
 */
function addDays(date, days) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

/**
 * Produz o hash estável do pedido normalizado sem guardar o payload no ledger.
 */
function hashRequest(operation, payload) {
  return createHash("sha256")
    .update(JSON.stringify({ operation, payload }))
    .digest("hex");
}

/**
 * Devolve a resposta original ou recusa a reutilização da chave.
 */
function replayExisting(existing, requestHash) {
  if (existing.requestHash !== requestHash) {
    const error = new Error("Idempotency-Key já utilizada com outro pedido.");
    error.statusCode = 409;
    error.code = "IDEMPOTENCY_KEY_REUSED";
    throw error;
  }
  if (!existing.response) {
    const error = new Error("Pedido idempotente ainda não concluído.");
    error.statusCode = 409;
    error.code = "IDEMPOTENCY_REQUEST_IN_PROGRESS";
    throw error;
  }
  return existing.response;
}

/**
 * Captura e valida os valores financeiros autoritativos do plano.
 */
function financialSnapshotForPlan(plan) {
  const snapshot = {
    amountCents: plan.priceCents,
    currency: plan.currency,
    solidaritySharePercent: plan.solidaritySharePercent,
    interval: plan.interval,
  };
  if (
    !Number.isInteger(snapshot.amountCents) ||
    snapshot.amountCents < 0 ||
    typeof snapshot.currency !== "string" ||
    !/^[A-Z]{3}$/.test(snapshot.currency) ||
    !Number.isFinite(snapshot.solidaritySharePercent) ||
    snapshot.solidaritySharePercent < 0 ||
    snapshot.solidaritySharePercent > 100 ||
    !["monthly", "yearly"].includes(snapshot.interval)
  ) {
    const error = new Error("Configuração financeira do plano inválida.");
    error.statusCode = 500;
    error.code = "BILLING_PLAN_INVALID";
    throw error;
  }
  return snapshot;
}

/**
 * Cria indices usados por tentativas de pagamento e trials.
 *
 * @returns {Promise<void>}
 */
export async function ensurePaymentIndexes() {
  const db = await getDb();
  await db.collection("payment_attempts").createIndex({ userId: 1, createdAt: -1 });
  await db.collection("payment_attempts").createIndex(
    { userId: 1, idempotencyKey: 1 },
    {
      unique: true,
      partialFilterExpression: { idempotencyKey: { $type: "string" } },
    },
  );
  await db.collection("trials").createIndex({ userId: 1 }, { unique: true });
}

/**
 * Regista uma tentativa de pagamento simulada e ativa a subscrição quando aprovada.
 *
 * @param {string} userId Identificador do utilizador autenticado.
 * @param {object} input Payload do checkout simulado.
 * @param {unknown} idempotencyKeyValue Header `Idempotency-Key`.
 * @param {{ requestId?: string }} context Contexto seguro para auditoria.
 * @returns {Promise<object>} Resultado original ou replay idempotente.
 */
export async function createSimulatedCheckout(
  userId,
  input,
  idempotencyKeyValue,
  context = {},
) {
  const payload = assertCheckoutPayload(input);
  const idempotencyKey = assertIdempotencyKey(idempotencyKeyValue);
  const userIdObject = userObjectId(userId);
  const requestHash = hashRequest("simulated-checkout", payload);

  try {
    return await runInTransaction(async ({ db, session }) => {
    const attempts = db.collection("payment_attempts");
    const existing = await attempts.findOne(
      { userId: userIdObject, idempotencyKey },
      { session },
    );
    if (existing) return replayExisting(existing, requestHash);

    const plan = await db.collection("subscription_plans").findOne(
      { code: payload.planCode, active: true },
      { session },
    );
    if (!plan) {
      const error = new Error("Plano não encontrado.");
      error.statusCode = 404;
      error.code = "PLAN_NOT_FOUND";
      throw error;
    }

    const now = new Date();
    const attemptId = new ObjectId();
    const status = payload.simulateOutcome === "approved" ? "approved" : "failed";
    const failureReason = status === "failed" ? "Pagamento simulado recusado." : null;
    const attempt = {
      _id: attemptId,
      schemaVersion: 2,
      operation: "simulated-checkout",
      userId: userIdObject,
      planCode: plan.code,
      paymentMethod: payload.paymentMethod,
      provider: "faithflix-simulated",
      status,
      failureReason,
      ...financialSnapshotForPlan(plan),
      approvedAt: status === "approved" ? now : null,
      cycle: null,
      accountingEstimate: false,
      idempotencyKey,
      requestHash,
      createdAt: now,
      updatedAt: now,
    };
    await attempts.insertOne(attempt, { session });

    let response;
    if (status === "failed") {
      await createNotification(
        userId,
        {
          type: "payment_failed",
          title: "Pagamento recusado",
          message: "O pagamento simulado foi recusado.",
        },
        { db, session },
      );
      response = {
        paymentAttemptId: attemptId.toHexString(),
        status,
        message: failureReason,
      };
    } else {
      const subscription = await activateSubscription(userId, plan.code, {
        db,
        session,
        plan,
        now,
      });
      await createNotification(
        userId,
        {
          type: "subscription_activated",
          title: "Subscrição ativa",
          message: "A tua subscrição FaithFlix ficou ativa.",
        },
        { db, session },
      );
      response = {
        paymentAttemptId: attemptId.toHexString(),
        status,
        ...subscription,
      };
    }

    await attempts.updateOne(
      { _id: attemptId },
      { $set: { response, updatedAt: new Date() } },
      { session },
    );
    await writeAdminAudit({
      db,
      session,
      actorUserId: userIdObject,
      action: "payment.simulated_checkout",
      targetType: "payment_attempt",
      targetId: attemptId,
      after: { status, planCode: plan.code },
      requestId: context.requestId,
    });
      return response;
    });
  } catch (error) {
    if (error?.code !== 11000) throw error;
    // Numa corrida de chave idempotente, lê o vencedor e aplica a mesma regra de hash.
    const db = await getDb();
    const existing = await db.collection("payment_attempts").findOne({
      userId: userIdObject,
      idempotencyKey,
    });
    if (existing) return replayExisting(existing, requestHash);
    throw error;
  }
}

/**
 * Inicia o trial único de 14 dias para um utilizador elegível.
 *
 * @param {string} userId Identificador do utilizador autenticado.
 * @param {unknown} idempotencyKeyValue Header `Idempotency-Key`.
 * @param {{ requestId?: string }} context Contexto seguro para auditoria.
 * @returns {Promise<object>} Resultado original ou replay idempotente.
 */
export async function startTrial(userId, idempotencyKeyValue, context = {}) {
  const idempotencyKey = assertIdempotencyKey(idempotencyKeyValue);
  const userIdObject = userObjectId(userId);
  const requestHash = hashRequest("trial", {});

  try {
    return await runInTransaction(async ({ db, session }) => {
      const trials = db.collection("trials");
      const existing = await trials.findOne({ userId: userIdObject }, { session });
      if (existing) {
        if (existing.idempotencyKey === idempotencyKey) {
          return replayExisting(existing, requestHash);
        }
        const error = new Error("Trial já utilizado por este utilizador.");
        error.statusCode = 409;
        error.code = "TRIAL_ALREADY_USED";
        throw error;
      }

      const now = new Date();
      const activePaid = await db.collection("subscriptions").findOne(
        {
          userId: userIdObject,
          status: "active",
          planCode: { $ne: "trial" },
          currentPeriodEnd: { $gt: now },
        },
        { session },
      );
      if (activePaid) {
        const error = new Error("Utilizador já tem uma subscrição ativa.");
        error.statusCode = 409;
        error.code = "SUBSCRIPTION_ALREADY_ACTIVE";
        throw error;
      }

      const trialId = new ObjectId();
      const endsAt = addDays(now, 14);
      const trial = {
        _id: trialId,
        userId: userIdObject,
        operation: "trial",
        status: "active",
        startedAt: now,
        endsAt,
        idempotencyKey,
        requestHash,
        createdAt: now,
        updatedAt: now,
      };
      await trials.insertOne(trial, { session });
      const subscription = await grantTrialSubscription(userId, endsAt, {
        db,
        session,
        now,
      });
      await createNotification(
        userId,
        {
          type: "trial_started",
          title: "Trial iniciado",
          message: "O teu trial FaithFlix ficou ativo durante 14 dias.",
        },
        { db, session },
      );

      const response = {
        trial: { status: trial.status, startedAt: now, endsAt },
        ...subscription,
      };
      await trials.updateOne(
        { _id: trialId },
        { $set: { response, updatedAt: new Date() } },
        { session },
      );
      await writeAdminAudit({
        db,
        session,
        actorUserId: userIdObject,
        action: "payment.trial_started",
        targetType: "trial",
        targetId: trialId,
        after: { status: trial.status, startedAt: now, endsAt },
        requestId: context.requestId,
      });
      return response;
    });
  } catch (error) {
    if (error?.code !== 11000) throw error;
    const db = await getDb();
    const existing = await db.collection("trials").findOne({ userId: userIdObject });
    if (existing?.idempotencyKey === idempotencyKey) {
      return replayExisting(existing, requestHash);
    }
    const alreadyUsed = new Error("Trial já utilizado por este utilizador.");
    alreadyUsed.statusCode = 409;
    alreadyUsed.code = "TRIAL_ALREADY_USED";
    throw alreadyUsed;
  }
}
```

5. Explicação do código ou da decisão.

`payment_attempts` é auditável e não guarda cartão. O documento v2 captura o
snapshot financeiro do plano no momento da operação; não consulta preços atuais
para reconstruir o passado. Chave, hash, tentativa/trial, subscrição,
notificação, resposta persistida e audit partilham a mesma transação. O replay
devolve exatamente a resposta original e uma chave reutilizada com payload
diferente devolve `409`.

O plano e validado antes de gravar a tentativa de pagamento. Assim, um checkout com `planCode` inválido devolve `404` e não deixa uma tentativa aprovada sem subscrição associada.

6. Validação do passo.

```bash
node -e "import('./src/modules/payments/payments.service.js').then((m) => console.log(typeof m.createSimulatedCheckout, typeof m.startTrial))"
```

Confirma também o novo export de subscrição:

```bash
node -e "import('./src/modules/subscriptions/subscriptions.service.js').then((m) => console.log(typeof m.grantTrialSubscription))"
```

7. Caso negativo, erro comum ou risco que este passo evita.

Sem indice único, um utilizador podia criar varios trials e contornar a subscrição.

### Passo 3 - Criar endpoints backend

1. Objetivo do passo.

Expor checkout simulado e início de trial.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/payments/payments.controller.js`
    - CRIAR: `backend/src/modules/payments/payments.routes.js`
    - EDITAR: `backend/src/app.js`
    - EDITAR: `backend/src/server.js`

3. Instrucoes concretas.

Monta o router em `/api/payments`.

4. Código completo.

`backend/src/modules/payments/payments.controller.js`

```js
/**
 * Módulo de controllers HTTP para pagamentos simulados.
 *
 * Traduz pedidos Express autenticados em chamadas ao service e escolhe códigos
 * HTTP observáveis para sucesso, trial criado e pagamento recusado.
 */
import { createSimulatedCheckout, startTrial } from "./payments.service.js";

/**
 * Executa checkout simulado para o utilizador autenticado.
 *
 * @param {import("express").Request} req Pedido com `req.user.id` e corpo validavel.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<void>}
 */
export async function postSimulatedCheckout(req, res) {
  const result = await createSimulatedCheckout(
    req.user.id,
    req.body,
    req.get("Idempotency-Key"),
    { requestId: req.id },
  );
  // `402` comunica recusa de pagamento no domínio, não falha tecnica do servidor.
  res.status(result.status === "approved" ? 201 : 402).json(result);
}

/**
 * Inicia o trial gratuito para o utilizador autenticado.
 *
 * @param {import("express").Request} req Pedido autenticado.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<void>}
 */
export async function postTrial(req, res) {
  res.status(201).json(
    await startTrial(
      req.user.id,
      req.get("Idempotency-Key"),
      { requestId: req.id },
    ),
  );
}
```

`backend/src/modules/payments/payments.routes.js`

```js
/**
 * Módulo de rotas dos pagamentos simulados.
 *
 * Liga os endpoints `/api/payments` ao middleware de autenticação para garantir
 * que tentativas de pagamento e trials pertencem sempre ao utilizador da sessão.
 */
import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { postSimulatedCheckout, postTrial } from "./payments.controller.js";

/**
 * Router de pagamentos simulados.
 * Todas as rotas exigem login para associar tentativas, trials e subscrições ao dono correto.
 */
export const paymentsRouter = Router();

paymentsRouter.post("/simulated-checkout", requireAuth, asyncHandler(postSimulatedCheckout));
paymentsRouter.post("/trial", requireAuth, asyncHandler(postTrial));
```

Trecho esperado em `backend/src/app.js`:

```js
import { paymentsRouter } from "./modules/payments/payments.routes.js";

app.use("/api/payments", paymentsRouter);
```

Trecho esperado em `backend/src/server.js`:

```js
import { ensurePaymentIndexes } from "./modules/payments/payments.service.js";

await ensurePaymentIndexes();
```

5. Explicação do código ou da decisão.

`402` e usado no pagamento simulado falhado para representar pagamento recusado no fluxo de negócio.

6. Validação do passo.

```bash
curl -i -X POST http://localhost:3000/api/payments/simulated-checkout
```

Sem cookie deve devolver `401`.

7. Caso negativo, erro comum ou risco que este passo evita.

Checkout sem `requireAuth` permitiria pagamentos sem dono.

### Passo 4 - Ligar ao frontend

1. Objetivo do passo.

Adicionar chamadas API e botao de trial/checkout na página de subscrição.

2. Ficheiros envolvidos.
    - CRIAR: `frontend/src/services/api/paymentsApi.js`
    - EDITAR: `frontend/src/pages/SubscriptionPage.jsx`

3. Instrucoes concretas.

Acrescenta botoes para `card_test` e trial, preservando a listagem de planos do BK anterior.

4. Código completo.

`frontend/src/services/api/paymentsApi.js`

```js
/**
 * Módulo cliente para a API de pagamentos simulados.
 *
 * Isola chamadas HTTP do frontend e reutiliza `apiClient`, mantendo cookies de
 * sessão incluídas sem expor tokens ou dados financeiros no browser.
 */
import { apiClient } from "./apiClient.js";

/** Constrói headers apenas depois de validar uma chave explícita da intenção. */
function headersWithIdempotencyKey(idempotencyKey, existingHeaders) {
  if (
    typeof idempotencyKey !== "string"
    || idempotencyKey.length === 0
    || idempotencyKey === "undefined"
    || idempotencyKey === "null"
  ) {
    throw new TypeError("Idempotency-Key explícita é obrigatória.");
  }

  const headers = new Headers(existingHeaders);
  headers.set("Idempotency-Key", idempotencyKey);
  return headers;
}

export const paymentsApi = {
  /**
   * Pede ao backend para executar um checkout com método de teste.
   *
   * @param {object} input Plano, método de teste e resultado simulado.
   * @returns {Promise<object>} Resultado devolvido pela API.
   */
  simulatedCheckout(input, idempotencyKey, options = {}) {
    return apiClient.post("/api/payments/simulated-checkout", input, {
      ...options,
      headers: headersWithIdempotencyKey(idempotencyKey, options.headers),
    });
  },
  /**
   * Inicia trial gratuito do utilizador autenticado.
   *
   * @returns {Promise<object>} Trial e subscrição temporária.
   */
  startTrial(idempotencyKey, options = {}) {
    return apiClient.post("/api/payments/trial", undefined, {
      ...options,
      headers: headersWithIdempotencyKey(idempotencyKey, options.headers),
    });
  },
};
```

Substitui `frontend/src/pages/SubscriptionPage.jsx` pela versão completa abaixo. Esta versão preserva a listagem e o cancelamento criados no `BK-MF4-01`, mas muda a ativação direta para checkout simulado e acrescenta o botao de trial.

```jsx
/**
 * Módulo da página de subscrição com checkout simulado e trial.
 *
 * Combina planos, subscrição atual, tentativa de pagamento e trial numa única
 * interface, mantendo o ownership no backend através da sessão autenticada.
 */
import { useEffect, useRef, useState } from "react";
import { paymentsApi } from "../services/api/paymentsApi.js";
import { subscriptionsApi } from "../services/api/subscriptionsApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

/**
 * Página de subscrição com checkout simulado, trial e cancelamento de renovação.
 *
 * @returns {JSX.Element} Interface de gestão da subscrição do utilizador.
 */
export function SubscriptionPage() {
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const activeOperationRef = useRef(null);
  const intentionKeysRef = useRef(new Map());

  function idempotencyKeyFor(intention) {
    if (!intentionKeysRef.current.has(intention)) {
      intentionKeysRef.current.set(intention, crypto.randomUUID());
    }
    return intentionKeysRef.current.get(intention);
  }

  function reserveOperation(name) {
    if (activeOperationRef.current) return null;
    const controller = new AbortController();
    activeOperationRef.current = { name, controller };
    setSubmitting(true);
    return controller;
  }

  function releaseOperation(controller) {
    if (activeOperationRef.current?.controller !== controller) return;
    activeOperationRef.current = null;
    setSubmitting(false);
  }

  /**
   * Carrega planos ativos e subscrição atual em paralelo.
   *
   * @returns {Promise<void>}
   */
  async function loadData(signal) {
    setLoading(true);
    setError("");
    try {
      const [plansResponse, subscriptionResponse] = await Promise.all([
        subscriptionsApi.listPlans({ signal }),
        subscriptionsApi.getMine({ signal }),
      ]);
      if (signal.aborted) return;
      setPlans(plansResponse.plans);
      setSubscription(subscriptionResponse.subscription);
    } catch (apiError) {
      if (signal.aborted || apiError?.name === "AbortError") return;
      setError(toUserMessage(apiError));
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    void loadData(controller.signal);
    return () => {
      controller.abort();
      activeOperationRef.current?.controller.abort();
      activeOperationRef.current = null;
    };
  }, []);

  /**
   * Executa checkout aprovado usando apenas dados de teste.
   *
   * @param {string} planCode Código do plano escolhido pelo utilizador.
   * @returns {Promise<void>}
   */
  async function handleSimulatedCheckout(planCode) {
    const controller = reserveOperation(`checkout:${planCode}`);
    if (!controller) return;
    const intention = `checkout:${planCode}`;
    const idempotencyKey = idempotencyKeyFor(intention);
    setStatus("");
    setError("");
    try {
      const response = await paymentsApi.simulatedCheckout({
        planCode,
        paymentMethod: "card_test",
        // A versão final da demo usa o caminho positivo; o caminho negativo e testado separadamente.
        simulateOutcome: "approved",
      }, idempotencyKey, { signal: controller.signal });
      if (controller.signal.aborted) return;
      setSubscription(response.subscription);
      setStatus("Pagamento simulado aprovado.");
      intentionKeysRef.current.delete(intention);
    } catch (apiError) {
      if (controller.signal.aborted || apiError?.name === "AbortError") return;
      setError(toUserMessage(apiError));
    } finally {
      releaseOperation(controller);
    }
  }

  /**
   * Inicia o trial e mostra a data de fim ao utilizador.
   *
   * @returns {Promise<void>}
   */
  async function handleStartTrial() {
    const controller = reserveOperation("trial");
    if (!controller) return;
    const idempotencyKey = idempotencyKeyFor("trial");
    setStatus("");
    setError("");
    try {
      const response = await paymentsApi.startTrial(idempotencyKey, {
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      setSubscription(response.subscription);
      setStatus(`Trial ativo até ${new Date(response.trial.endsAt).toLocaleDateString("pt-PT")}.`);
      intentionKeysRef.current.delete("trial");
    } catch (apiError) {
      if (controller.signal.aborted || apiError?.name === "AbortError") return;
      setError(toUserMessage(apiError));
    } finally {
      releaseOperation(controller);
    }
  }

  /**
   * Cancela apenas a renovação futura, preservando acesso até ao fim do ciclo.
   *
   * @returns {Promise<void>}
   */
  async function handleCancelRenewal() {
    const controller = reserveOperation("cancel-renewal");
    if (!controller) return;
    setStatus("");
    setError("");
    try {
      const response = await subscriptionsApi.cancelRenewal({
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      setSubscription(response.subscription);
      setStatus("Renovação cancelada no fim do ciclo atual.");
    } catch (apiError) {
      if (controller.signal.aborted || apiError?.name === "AbortError") return;
      setError(toUserMessage(apiError));
    } finally {
      releaseOperation(controller);
    }
  }

  if (loading) return <main><p>A carregar subscrição...</p></main>;

  return (
    <main>
      <h1>Subscrição</h1>
      {error && <p role="alert">{error}</p>}
      {status && <p role="status">{status}</p>}

      <section>
        <h2>Estado atual</h2>
        <p>{subscription?.status === "none" ? "Sem subscrição ativa." : subscription?.status}</p>
        {subscription?.currentPeriodEnd && <p>Fim do ciclo: {new Date(subscription.currentPeriodEnd).toLocaleDateString("pt-PT")}</p>}
        {subscription?.hasPremiumAccess && !subscription.cancelAtPeriodEnd && (
          <button type="button" disabled={submitting} onClick={handleCancelRenewal}>Cancelar renovação</button>
        )}
      </section>

      <section>
        <h2>Trial</h2>
        <p>Experimenta o FaithFlix durante 14 dias sem dados de cartão.</p>
        <button type="button" disabled={submitting} onClick={handleStartTrial}>Iniciar trial</button>
      </section>

      <section>
        <h2>Planos</h2>
        {plans.length === 0 && <p>Não existem planos ativos.</p>}
        {plans.map((plan) => (
          <article key={plan.code}>
            <h3>{plan.name}</h3>
            <p>{(plan.priceCents / 100).toFixed(2)} {plan.currency}</p>
            <p>{plan.solidaritySharePercent}% para a pool solidária.</p>
            <button type="button" disabled={submitting} onClick={() => handleSimulatedCheckout(plan.code)}>
              Pagar com método simulado
            </button>
          </article>
        ))}
      </section>
    </main>
  );
}
```

O caminho recusado é validado num teste de API com `simulateOutcome: "failed"`
e uma `Idempotency-Key` própria; não se altera temporariamente o componente de
produção para realizar esse teste.

5. Explicação do código ou da decisão.

O frontend envia apenas escolhas simuladas e nunca pede número de cartão, CVV ou token financeiro. `paymentsApi.simulatedCheckout` chama o endpoint real de checkout do backend; `paymentsApi.startTrial` chama o endpoint real de trial; `subscriptionsApi.cancelRenewal` continua a reutilizar o contrato do `BK-MF4-01`. O estado `submitting` evita duplos cliques enquanto o pedido esta em curso. O estado vazio em `plans.length === 0` evita uma página silenciosa quando ainda não existem planos ativos.

6. Validação do passo.

Ativar plano por checkout simulado e testar trial duas vezes.

7. Caso negativo, erro comum ou risco que este passo evita.

Se o aluno colocar inputs de cartão, a UI passa a sugerir uma integração que o backend não implementa.

#### Critérios de aceite

- `POST /api/payments/simulated-checkout` com `approved` devolve `201` e subscrição ativa.
- `POST /api/payments/simulated-checkout` com `failed` devolve `402` sem ativar subscrição.
- Checkout e trial sem `Idempotency-Key` devolvem `400 IDEMPOTENCY_KEY_REQUIRED` sem escrita.
- Repetir a mesma chave/payload devolve o resultado original; reutilizar a chave com outro payload devolve `409 IDEMPOTENCY_KEY_REUSED`.
- Fault injection depois de criar tentativa/trial deixa zero subscrição, notificação ou ledger parcial.
- Tentativas novas têm `schemaVersion: 2`, snapshot financeiro e `accountingEstimate: false`.
- `POST /api/payments/trial` funciona uma vez por utilizador, devolve `subscription.status: "trialing"` e a segunda tentativa devolve `409`.
- Durante o trial, `GET /api/playback/:contentId` passa no guard premium; depois de `endsAt`, deve devolver `403`.
- Utilizador com subscrição paga ativa recebe `409` ao tentar iniciar trial.
- Nenhuma colecao guarda número de cartão, CVV ou token financeiro.
- Checkout/trial enviam sempre o header; retry da mesma intenção após falha
  ambígua reutiliza a chave e duplo clique não cria pedidos sobrepostos.

#### Validação final

```bash
cd backend
npm test
```

Executar também requests de checkout aprovado/falhado, replay idempotente, conflito de hash, trial repetido, trial com subscrição paga ativa e playback durante trial. Estes testes devem usar doubles ou uma base de integração isolada com transações; não usar a base normal.

#### Evidence para PR/defesa

- `pr`: commit/PR com módulo `payments`.
- `proof`: JSON de checkout aprovado, trial ativo com `subscription.status: "trialing"` e playback autorizado durante trial.
- `neg`: checkout falhado `402`, segundo trial `409`, trial com subscrição paga ativa `409`, pedido sem cookie `401`.

#### Handoff

O `BK-MF4-08` deve estender o módulo `notifications.service.js` criado neste BK
e reutilizar os eventos já transacionais de checkout/trial. Não deve duplicar
esses eventos nem introduzir fornecedor externo de email como requisito.

Uma migração de documentos legacy para v2 é uma tarefa operacional separada: dry-run por defeito; escrita exige simultaneamente `--apply`, `ALLOW_DATA_MIGRATION=true` e `MONGODB_DB_NAME` explícita. Não executar a migração contra a base atual durante este BK e nunca apresentar os campos estimados como contabilidade histórica exata.

## Snippet técnico aplicável

```js
// O MVP regista apenas o método simulado; dados reais de cartão ficam fora da aplicação.
const attempt = {
  paymentMethod: payload.paymentMethod,
  provider: "faithflix-simulated",
};
```

#### Changelog

- `2026-06-13`: guia reescrito com pagamento simulado, trial único, endpoints, frontend e negativos.
- `2026-07-10`: acrescentados `Idempotency-Key`, `requestHash`, ledger v2, transação única, fault injection e política segura da migração histórica.
- `2026-07-10`: cliente/UI sincronizados para header idempotente por intenção,
  reutilização em falha ambígua, abort/anti-stale e busy state.
