# BK-MF4-01 - Planos e ciclo de subscricao

## Header

- `doc_id`: `GUIA-BK-MF4-01`
- `bk_id`: `BK-MF4-01`
- `macro`: `MF4`
- `owner`: `Matheus`
- `apoio`: `Davi`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `L`
- `dependencias`: `BK-MF2-01`
- `rf_rnf`: `RF35, RF36, RF38, RF39`
- `fase_documental`: `Fase 1`
- `sprint`: `S07`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF4-02`
- `guia_path`: `docs/planificacao/guias-bk/MF4/BK-MF4-01-planos-ciclo-subscricao.md`
- `last_updated`: `2026-06-13`

## Bloco pedagogico (obrigatorio)

Neste BK vais implementar a base real de planos e subscricoes do FaithFlix. A partir daqui, um utilizador autenticado consegue escolher plano mensal ou anual, consultar o estado da sua subscricao, cancelar renovacao e ficar bloqueado quando a subscricao estiver expirada.

### Objetivo pedagogico

- Perceber a diferenca entre plano, subscricao, ciclo de renovacao e bloqueio por expiracao.
- Aplicar ownership: o frontend nunca envia `userId`; o backend usa `req.user.id`.
- Preparar o `BK-MF4-02`, que acrescenta metodo de pagamento simulado e trial.

### Tempo estimado

- 3 blocos de 90 minutos.
- Se o modelo de dados ou os estados ficarem confusos, parar e desenhar primeiro a maquina de estados.

### Conceitos essenciais

- Plano e a oferta comercial: nome, ciclo, preco e percentagem solidaria.
- Subscricao e o contrato entre utilizador e plano: estado, inicio, fim do ciclo e renovacao.
- Renovacao automatica, neste MVP, e uma regra de datas executada pela API, nao uma integracao bancaria.
- Bloqueio por expiracao protege conteudo premium quando `status` e `expired` ou `past_due`.
- Guard de subscricao e o middleware backend que confirma acesso antes de entregar playback premium.
- `CANONICO`: RF35, RF36, RF38 e RF39 exigem subscricao mensal/anual, renovacao, gestao e bloqueio.
- `DERIVADO`: os estados fechados sao `active`, `past_due`, `expired` e `canceled` para evitar valores ambiguos.
- `DERIVADO`: no MVP, o playback autenticado passa a ser o ponto premium protegido por subscricao ativa.

### Erros comuns

- Guardar dados de cartao neste BK.
- Aceitar `userId` vindo do frontend.
- Misturar plano com pagamento; pagamento simulado entra no `BK-MF4-02`.
- Esquecer que `past_due` e `expired` nao podem aceder a conteudo premium.

### Check de compreensao

- [ ] Sei explicar o que e um plano e o que e uma subscricao.
- [ ] Sei indicar que estados bloqueiam acesso premium.
- [ ] Sei provar que uma subscricao pertence ao utilizador autenticado.

## Bloco operacional (obrigatorio)

### Pre-condicoes

- `BK-MF2-01` executado, com login real, cookie HttpOnly e `req.user`.
- `BK-MF2-02` executado, com `requireAuth`.
- `BK-MF2-05` executado, com `playbackRouter` e endpoint `GET /api/playback/:contentId`.
- `backend/src/config/database.js` existe.
- `frontend/src/services/api/apiClient.js` existe e envia cookies com `credentials: "include"`.
- Confirmar no backlog que este BK mantem owner `Matheus`, apoio `Davi`, prioridade `P0` e dependencias `BK-MF2-01`.

### Guia de execucao (passo-a-passo)

### Passo 1 - Criar validacao de planos e subscricoes

1. Objetivo do passo.

Validar ciclos, estados e datas antes de gravar qualquer subscricao.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/subscriptions/subscriptions.validation.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Cria a pasta `backend/src/modules/subscriptions/` e adiciona o ficheiro abaixo.

4. Codigo completo.

```js
/**
 * Valida os valores aceites para planos e subscricoes da MF4.
 *
 * Este ficheiro existe para impedir que cada aluno invente nomes diferentes
 * para ciclos e estados. Os services e controllers devem usar estes helpers
 * antes de persistir dados de subscricao.
 */
export const PLAN_INTERVALS = ["monthly", "yearly"];
export const SUBSCRIPTION_STATUS = ["active", "past_due", "expired", "canceled"];

/**
 * Cria um erro HTTP simples para validacoes de subscricao.
 *
 * @param {string} message - Mensagem segura para devolver ao frontend.
 * @param {number} statusCode - Codigo HTTP que o error handler deve usar.
 * @returns {Error} Erro com `statusCode` preenchido.
 */
function httpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

/**
 * Confirma que o ciclo do plano e um dos ciclos aceites.
 *
 * @param {unknown} interval - Valor recebido do plano persistido ou de seed.
 * @returns {"monthly"|"yearly"} Ciclo normalizado.
 * @throws {Error} Quando o ciclo nao pertence ao contrato da MF4.
 */
export function assertPlanInterval(interval) {
  const value = String(interval ?? "").trim();
  if (!PLAN_INTERVALS.includes(value)) {
    throw httpError("Ciclo de plano invalido.");
  }
  return value;
}

/**
 * Confirma que o estado de subscricao existe no contrato da MF4.
 *
 * @param {unknown} status - Estado recebido de input ou da base de dados.
 * @returns {string} Estado normalizado.
 * @throws {Error} Quando o estado nao e reconhecido.
 */
export function assertSubscriptionStatus(status) {
  const value = String(status ?? "").trim();
  if (!SUBSCRIPTION_STATUS.includes(value)) {
    throw httpError("Estado de subscricao invalido.");
  }
  return value;
}

/**
 * Calcula a data final do ciclo de billing.
 *
 * @param {Date|string|number} date - Data inicial do ciclo.
 * @param {"monthly"|"yearly"} interval - Ciclo validado do plano.
 * @returns {Date} Data de fim do ciclo seguinte.
 * @throws {Error} Quando a data inicial e invalida.
 */
export function addBillingCycle(date, interval) {
  const source = new Date(date);
  if (Number.isNaN(source.getTime())) {
    throw httpError("Data de inicio invalida.");
  }

  const next = new Date(source);
  // Usamos metodos de Date para preservar meses/anos reais em vez de assumir sempre 30 dias.
  if (interval === "monthly") next.setMonth(next.getMonth() + 1);
  if (interval === "yearly") next.setFullYear(next.getFullYear() + 1);
  return next;
}

/**
 * Indica se um estado deve bloquear acesso premium.
 *
 * @param {string} status - Estado da subscricao.
 * @returns {boolean} `true` quando playback premium deve ser recusado.
 */
export function isBlockingStatus(status) {
  return ["past_due", "expired", "canceled"].includes(status);
}
```

5. Explicacao do codigo ou da decisao.

Este ficheiro fecha os valores aceites. Assim, a equipa nao cria uma subscricao com `mensal`, `paga`, `ativa` ou outro valor que o frontend nao reconhece.

6. Validacao do passo.

```bash
node -e "import('./src/modules/subscriptions/subscriptions.validation.js').then(({ addBillingCycle }) => console.log(addBillingCycle('2026-06-01','monthly').toISOString().startsWith('2026-07')))"
```

7. Caso negativo, erro comum ou risco que este passo evita.

Se a validacao aceitar qualquer estado, o bloqueio de conteudo premium fica inseguro.

### Passo 2 - Criar service de planos e subscricoes

1. Objetivo do passo.

Criar planos base, ativar subscricao do utilizador autenticado, consultar estado e cancelar renovacao.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/subscriptions/subscriptions.service.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Cria o service abaixo. Ele usa MongoDB, `req.user.id` recebido pelo controller e nao guarda dados financeiros.

4. Codigo completo.

```js
/**
 * Gere planos, subscricoes e acesso premium da MF4.
 *
 * O service usa sempre `userId` vindo da sessao segura e nunca aceita
 * ownership vindo do frontend. Tambem centraliza datas de ciclo para que
 * pagamentos simulados e guards de playback usem a mesma regra.
 */
import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import {
  addBillingCycle,
  assertPlanInterval,
  isBlockingStatus,
} from "./subscriptions.validation.js";

const DEFAULT_PLANS = [
  {
    code: "faithflix-monthly",
    name: "FaithFlix Mensal",
    interval: "monthly",
    priceCents: 799,
    currency: "EUR",
    solidaritySharePercent: 20,
    active: true,
  },
  {
    code: "faithflix-yearly",
    name: "FaithFlix Anual",
    interval: "yearly",
    priceCents: 7990,
    currency: "EUR",
    solidaritySharePercent: 20,
    active: true,
  },
];

/**
 * Converte um identificador de utilizador em ObjectId seguro.
 *
 * @param {string} userId - Identificador vindo de `req.user.id`.
 * @returns {ObjectId} ObjectId usado nas queries MongoDB.
 * @throws {Error} Quando o identificador nao tem formato de ObjectId.
 */
function userObjectId(userId) {
  if (!ObjectId.isValid(userId)) {
    const error = new Error("Utilizador invalido.");
    error.statusCode = 400;
    throw error;
  }
  return new ObjectId(userId);
}

/**
 * Remove campos internos de um plano antes de o expor ao frontend.
 *
 * @param {object} plan - Documento MongoDB de `subscription_plans`.
 * @returns {object} Plano publico sem `_id` bruto nem campos internos.
 */
function publicPlan(plan) {
  return {
    id: String(plan._id),
    code: plan.code,
    name: plan.name,
    interval: plan.interval,
    priceCents: plan.priceCents,
    currency: plan.currency,
    solidaritySharePercent: plan.solidaritySharePercent,
  };
}

/**
 * Converte uma subscricao em payload seguro para UI/API.
 *
 * @param {object|null} subscription - Documento MongoDB de `subscriptions`.
 * @param {object|undefined} plan - Plano associado, quando existir.
 * @returns {object} Estado publico da subscricao e acesso premium.
 */
function publicSubscription(subscription, plan = undefined) {
  if (!subscription) {
    return { status: "none", hasPremiumAccess: false };
  }

  return {
    id: String(subscription._id),
    status: subscription.status,
    planCode: subscription.planCode,
    currentPeriodStart: subscription.currentPeriodStart,
    currentPeriodEnd: subscription.currentPeriodEnd,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    hasPremiumAccess: hasSubscriptionAccess(subscription),
    plan: plan ? publicPlan(plan) : undefined,
  };
}

/**
 * Calcula se uma subscricao ainda autoriza acesso premium.
 *
 * @param {object|null} subscription - Documento de subscricao.
 * @param {Date} referenceDate - Data usada para testes e verificacao real.
 * @returns {boolean} `true` apenas quando o estado e a data permitem acesso.
 */
function hasSubscriptionAccess(subscription, referenceDate = new Date()) {
  if (!subscription || isBlockingStatus(subscription.status)) {
    return false;
  }

  const periodEnd = new Date(subscription.currentPeriodEnd);
  if (Number.isNaN(periodEnd.getTime())) {
    return false;
  }

  return periodEnd > referenceDate;
}

/**
 * Cria indices e planos base usados pela MF4.
 *
 * @returns {Promise<void>} Termina quando indices e seed de planos ficam prontos.
 */
export async function ensureSubscriptionIndexes() {
  const db = await getDb();
  await db.collection("subscription_plans").createIndex({ code: 1 }, { unique: true });
  await db.collection("subscriptions").createIndex({ userId: 1 }, { unique: true });
  await db.collection("subscriptions").createIndex({ status: 1, currentPeriodEnd: 1 });

  for (const plan of DEFAULT_PLANS) {
    // O upsert torna o seed idempotente: correr o servidor duas vezes nao duplica planos.
    await db.collection("subscription_plans").updateOne(
      { code: plan.code },
      { $set: { ...plan, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true },
    );
  }
}

/**
 * Lista planos ativos disponiveis para escolha.
 *
 * @returns {Promise<{plans: object[]}>} Planos publicos ordenados por preco.
 */
export async function listPlans() {
  const db = await getDb();
  const plans = await db.collection("subscription_plans").find({ active: true }).sort({ priceCents: 1 }).toArray();
  return { plans: plans.map(publicPlan) };
}

/**
 * Ativa ou substitui a subscricao paga do utilizador autenticado.
 *
 * @param {string} userId - Identificador vindo da sessao segura.
 * @param {string} planCode - Codigo do plano escolhido.
 * @returns {Promise<{subscription: object}>} Subscricao publica criada/atualizada.
 * @throws {Error} Quando o plano nao existe ou esta inativo.
 */
export async function activateSubscription(userId, planCode) {
  const db = await getDb();
  const plan = await db.collection("subscription_plans").findOne({ code: String(planCode), active: true });
  if (!plan) {
    const error = new Error("Plano nao encontrado.");
    error.statusCode = 404;
    throw error;
  }

  const now = new Date();
  const interval = assertPlanInterval(plan.interval);
  const subscription = {
    // O userId vem da sessao para impedir subscricoes em nome de outra pessoa.
    userId: userObjectId(userId),
    planCode: plan.code,
    status: "active",
    currentPeriodStart: now,
    currentPeriodEnd: addBillingCycle(now, interval),
    cancelAtPeriodEnd: false,
    createdAt: now,
    updatedAt: now,
  };

  // Existe uma unica subscricao por utilizador; isto simplifica guards e relatorios.
  await db.collection("subscriptions").updateOne(
    { userId: subscription.userId },
    { $set: subscription },
    { upsert: true },
  );

  return { subscription: publicSubscription(subscription, plan) };
}

/**
 * Devolve a subscricao do utilizador autenticado.
 *
 * @param {string} userId - Identificador vindo da sessao segura.
 * @returns {Promise<{subscription: object}>} Estado publico da subscricao.
 */
export async function getMySubscription(userId) {
  const db = await getDb();
  const subscription = await db.collection("subscriptions").findOne({ userId: userObjectId(userId) });
  const plan = subscription
    ? await db.collection("subscription_plans").findOne({ code: subscription.planCode })
    : undefined;

  return { subscription: publicSubscription(subscription, plan) };
}

/**
 * Verifica se o utilizador pode aceder a conteudo premium.
 *
 * @param {string} userId - Identificador vindo de `req.user.id`.
 * @param {Date} referenceDate - Data opcional para testes de expiracao.
 * @returns {Promise<boolean>} Resultado usado pelo middleware de playback.
 */
export async function hasActiveSubscriptionAccess(userId, referenceDate = new Date()) {
  const db = await getDb();
  const subscription = await db.collection("subscriptions").findOne({ userId: userObjectId(userId) });
  return hasSubscriptionAccess(subscription, referenceDate);
}

/**
 * Cancela a renovacao futura mantendo acesso ate ao fim do ciclo atual.
 *
 * @param {string} userId - Identificador vindo da sessao segura.
 * @returns {Promise<{subscription: object}>} Subscricao atualizada.
 * @throws {Error} Quando nao existe subscricao ativa para cancelar.
 */
export async function cancelRenewal(userId) {
  const db = await getDb();
  const now = new Date();
  const subscription = await db.collection("subscriptions").findOneAndUpdate(
    { userId: userObjectId(userId), status: "active" },
    { $set: { cancelAtPeriodEnd: true, updatedAt: now } },
    { returnDocument: "after" },
  );

  if (!subscription) {
    const error = new Error("Subscricao ativa nao encontrada.");
    error.statusCode = 404;
    throw error;
  }

  return { subscription: publicSubscription(subscription) };
}

/**
 * Renova uma subscricao ativa quando o pagamento simulado do novo ciclo e aceite.
 *
 * @param {string} userId - Identificador vindo da sessao segura.
 * @returns {Promise<{subscription: object}>} Subscricao com novo ciclo.
 * @throws {Error} Quando nao existe subscricao ativa renovavel.
 */
export async function renewActiveSubscription(userId) {
  const db = await getDb();
  const now = new Date();
  const subscription = await db.collection("subscriptions").findOne({
    userId: userObjectId(userId),
    status: "active",
    cancelAtPeriodEnd: false,
  });

  if (!subscription) {
    const error = new Error("Subscricao ativa renovavel nao encontrada.");
    error.statusCode = 404;
    throw error;
  }

  const plan = await db.collection("subscription_plans").findOne({ code: subscription.planCode, active: true });
  if (!plan) {
    const error = new Error("Plano da subscricao nao encontrado.");
    error.statusCode = 404;
    throw error;
  }

  const nextPeriodStart = new Date(Math.max(new Date(subscription.currentPeriodEnd).getTime(), now.getTime()));
  const nextPeriodEnd = addBillingCycle(nextPeriodStart, assertPlanInterval(plan.interval));

  await db.collection("subscriptions").updateOne(
    { _id: subscription._id },
    {
      $set: {
        currentPeriodStart: nextPeriodStart,
        currentPeriodEnd: nextPeriodEnd,
        updatedAt: now,
      },
    },
  );

  // A renovacao positiva avanca datas sem criar uma segunda subscricao para o mesmo utilizador.
  return {
    subscription: publicSubscription({
      ...subscription,
      currentPeriodStart: nextPeriodStart,
      currentPeriodEnd: nextPeriodEnd,
      updatedAt: now,
    }, plan),
  };
}

/**
 * Marca subscricoes vencidas quando a renovacao simulada nao ocorreu.
 *
 * @param {Date} referenceDate - Data usada para decidir vencimento.
 * @returns {Promise<void>} Termina depois de atualizar estados vencidos.
 */
export async function expireOverdueSubscriptions(referenceDate = new Date()) {
  const db = await getDb();
  // Se o utilizador cancelou renovacao, o fim do ciclo transforma o estado em canceled.
  await db.collection("subscriptions").updateMany(
    { status: "active", currentPeriodEnd: { $lte: referenceDate }, cancelAtPeriodEnd: true },
    { $set: { status: "canceled", updatedAt: referenceDate } },
  );
  // Sem pagamento de renovacao, a subscricao entra em past_due e o guard premium bloqueia playback.
  await db.collection("subscriptions").updateMany(
    { status: "active", currentPeriodEnd: { $lte: referenceDate }, cancelAtPeriodEnd: false },
    { $set: { status: "past_due", updatedAt: referenceDate } },
  );
}
```

5. Explicacao do codigo ou da decisao.

O service cria os planos base com `ensureSubscriptionIndexes`, impede duplicacao por utilizador e calcula o fim do ciclo a partir do plano. A percentagem solidaria fica guardada no plano para o `BK-MF4-05` calcular a pool mensal. `renewActiveSubscription` mostra o caminho positivo de renovacao simulada: quando o novo ciclo e aceite, as datas avancam sem criar outra subscricao. `expireOverdueSubscriptions` cobre o caminho negativo: se a renovacao nao acontecer, a subscricao fica `past_due` ou `canceled`. `findOneAndUpdate` devolve o documento atualizado ou `null` na versao atual do driver MongoDB usada pelo projeto, por isso `cancelRenewal` valida diretamente `subscription` e nao acede a `.value`.

6. Validacao do passo.

```bash
node -e "import('./src/modules/subscriptions/subscriptions.service.js').then((m) => console.log(typeof m.activateSubscription, typeof m.getMySubscription, typeof m.renewActiveSubscription))"
```

7. Caso negativo, erro comum ou risco que este passo evita.

Se cada ativacao criasse uma subscricao nova, o utilizador podia ter dois estados ao mesmo tempo.

Confirma tambem que o service ja expoe a funcao usada pelo guard premium:

```bash
node -e "import('./src/modules/subscriptions/subscriptions.service.js').then((m) => console.log(typeof m.hasActiveSubscriptionAccess))"
```

### Passo 3 - Criar controller, rotas e montagem no backend

1. Objetivo do passo.

Expor endpoints REST protegidos por sessao.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/subscriptions/subscriptions.controller.js`
    - CRIAR: `backend/src/modules/subscriptions/subscriptions.routes.js`
    - EDITAR: `backend/src/app.js`
    - EDITAR: `backend/src/server.js`
    - LOCALIZACAO: modulo `subscriptions` completo e imports aditivos em `app.js` e `server.js`

3. Instrucoes concretas.

Cria controller e router. Depois monta `subscriptionsRouter` em `/api/subscriptions` depois de `attachSession`.

4. Codigo completo.

`backend/src/modules/subscriptions/subscriptions.controller.js`

```js
/**
 * Controllers HTTP do modulo de subscricoes.
 *
 * Cada controller delega regras de negocio para o service e usa `req.user.id`
 * nos endpoints privados para preservar ownership.
 */
import {
  activateSubscription,
  cancelRenewal,
  getMySubscription,
  listPlans,
} from "./subscriptions.service.js";

/**
 * Devolve planos ativos publicos.
 *
 * @param {object} _req - Pedido Express nao usado.
 * @param {object} res - Resposta Express.
 * @returns {Promise<void>} Envia `200` com planos.
 */
export async function getPlans(_req, res) {
  res.status(200).json(await listPlans());
}

/**
 * Devolve a subscricao do utilizador autenticado.
 *
 * @param {object} req - Pedido Express com `req.user.id`.
 * @param {object} res - Resposta Express.
 * @returns {Promise<void>} Envia `200` com estado da subscricao.
 */
export async function getMySubscriptionController(req, res) {
  res.status(200).json(await getMySubscription(req.user.id));
}

/**
 * Cria ou atualiza a subscricao do utilizador autenticado.
 *
 * @param {object} req - Pedido Express com `planCode` no body.
 * @param {object} res - Resposta Express.
 * @returns {Promise<void>} Envia `201` com a subscricao ativa.
 */
export async function postMySubscription(req, res) {
  // O frontend envia o plano; o dono da subscricao vem sempre da sessao.
  res.status(201).json(await activateSubscription(req.user.id, req.body.planCode));
}

/**
 * Cancela a renovacao futura da subscricao do utilizador autenticado.
 *
 * @param {object} req - Pedido Express com `req.user.id`.
 * @param {object} res - Resposta Express.
 * @returns {Promise<void>} Envia `200` com a subscricao atualizada.
 */
export async function postCancelRenewal(req, res) {
  res.status(200).json(await cancelRenewal(req.user.id));
}
```

`backend/src/modules/subscriptions/subscriptions.routes.js`

```js
/**
 * Rotas REST de subscricoes.
 *
 * As rotas `/me` ficam protegidas porque expoem dados do utilizador
 * autenticado. A listagem de planos e publica.
 */
import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import {
  getMySubscriptionController,
  getPlans,
  postCancelRenewal,
  postMySubscription,
} from "./subscriptions.controller.js";

export const subscriptionsRouter = Router();

subscriptionsRouter.get("/plans", asyncHandler(getPlans));
// A ordem mantem `/plans` publico e coloca ownership apenas nos endpoints pessoais.
subscriptionsRouter.get("/me", requireAuth, asyncHandler(getMySubscriptionController));
subscriptionsRouter.post("/me", requireAuth, asyncHandler(postMySubscription));
subscriptionsRouter.post("/me/cancel-renewal", requireAuth, asyncHandler(postCancelRenewal));
```

Trecho esperado em `backend/src/app.js`:

```js
import { subscriptionsRouter } from "./modules/subscriptions/subscriptions.routes.js";

app.use("/api/subscriptions", subscriptionsRouter);
```

Trecho esperado em `backend/src/server.js`:

```js
import { ensureSubscriptionIndexes } from "./modules/subscriptions/subscriptions.service.js";

await ensureSubscriptionIndexes();
```

5. Explicacao do codigo ou da decisao.

`GET /plans` e publico porque qualquer visitante pode ver ofertas. As rotas `/me` exigem login e usam ownership por sessao.

6. Validacao do passo.

```bash
curl -i http://localhost:3000/api/subscriptions/plans
curl -i http://localhost:3000/api/subscriptions/me
```

Resultado esperado: planos devolvem `200`; sem login, `/me` devolve `401`.

7. Caso negativo, erro comum ou risco que este passo evita.

Montar a rota antes da sessao faz `requireAuth` falhar sempre ou aceitar pedidos sem utilizador.

### Passo 4 - Criar cliente API e pagina de gestao

1. Objetivo do passo.

Permitir ao utilizador ver planos, ativar subscricao e cancelar renovacao.

2. Ficheiros envolvidos.
    - CRIAR: `frontend/src/services/api/subscriptionsApi.js`
    - CRIAR: `frontend/src/pages/SubscriptionPage.jsx`
    - EDITAR: `frontend/src/routes/AppRoutes.jsx`
    - LOCALIZACAO: ficheiros completos novos e rota `/subscription`

3. Instrucoes concretas.

Usa `apiClient`. A pagina deve ter loading, erro, estado vazio e sucesso.

4. Codigo completo.

`frontend/src/services/api/subscriptionsApi.js`

```js
/**
 * Cliente frontend para endpoints de subscricoes.
 *
 * Usa o `apiClient` da MF1 para herdar `credentials: "include"` e enviar
 * cookies HttpOnly sem expor tokens no browser.
 */
import { apiClient } from "./apiClient.js";

export const subscriptionsApi = {
  /** @returns {Promise<object>} Planos ativos publicos. */
  listPlans() {
    return apiClient.get("/api/subscriptions/plans");
  },
  /** @returns {Promise<object>} Subscricao do utilizador autenticado. */
  getMine() {
    return apiClient.get("/api/subscriptions/me");
  },
  /**
   * @param {string} planCode - Codigo do plano escolhido.
   * @returns {Promise<object>} Subscricao ativa criada/atualizada.
   */
  activate(planCode) {
    return apiClient.post("/api/subscriptions/me", { planCode });
  },
  /** @returns {Promise<object>} Subscricao com renovacao cancelada. */
  cancelRenewal() {
    return apiClient.post("/api/subscriptions/me/cancel-renewal");
  },
};
```

`frontend/src/pages/SubscriptionPage.jsx`

```jsx
import { useEffect, useState } from "react";
import { subscriptionsApi } from "../services/api/subscriptionsApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

/**
 * Pagina de gestao de subscricao do utilizador autenticado.
 *
 * Mostra planos, estado atual, mensagens de erro e acao de cancelamento.
 * O componente nunca envia `userId`; o backend associa tudo pela sessao.
 *
 * @returns {JSX.Element} Interface de subscricao.
 */
export function SubscriptionPage() {
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      // Carregamos planos e subscricao em paralelo porque sao leituras independentes.
      const [plansResponse, subscriptionResponse] = await Promise.all([
        subscriptionsApi.listPlans(),
        subscriptionsApi.getMine(),
      ]);
      setPlans(plansResponse.plans);
      setSubscription(subscriptionResponse.subscription);
    } catch (apiError) {
      setError(toUserMessage(apiError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleActivate(planCode) {
    setStatus("");
    setError("");
    try {
      // Apenas o plano sai da UI; o ownership fica protegido no backend.
      const response = await subscriptionsApi.activate(planCode);
      setSubscription(response.subscription);
      setStatus("Subscricao ativa.");
    } catch (apiError) {
      setError(toUserMessage(apiError));
    }
  }

  async function handleCancelRenewal() {
    setStatus("");
    setError("");
    try {
      // Cancelar renovacao nao apaga o ciclo atual, apenas muda a regra futura.
      const response = await subscriptionsApi.cancelRenewal();
      setSubscription(response.subscription);
      setStatus("Renovacao cancelada no fim do ciclo atual.");
    } catch (apiError) {
      setError(toUserMessage(apiError));
    }
  }

  if (loading) return <main><p>A carregar subscricao...</p></main>;

  return (
    <main>
      <h1>Subscricao</h1>
      {error && <p role="alert">{error}</p>}
      {status && <p role="status">{status}</p>}
      <section>
        <h2>Estado atual</h2>
        <p>{subscription?.status === "none" ? "Sem subscricao ativa." : subscription?.status}</p>
        {subscription?.currentPeriodEnd && <p>Fim do ciclo: {new Date(subscription.currentPeriodEnd).toLocaleDateString("pt-PT")}</p>}
        {subscription?.hasPremiumAccess && !subscription.cancelAtPeriodEnd && (
          <button type="button" onClick={handleCancelRenewal}>Cancelar renovacao</button>
        )}
      </section>
      <section>
        <h2>Planos</h2>
        {plans.map((plan) => (
          <article key={plan.code}>
            <h3>{plan.name}</h3>
            <p>{(plan.priceCents / 100).toFixed(2)} {plan.currency}</p>
            <p>{plan.solidaritySharePercent}% para a pool solidaria.</p>
            <button type="button" onClick={() => handleActivate(plan.code)}>Escolher plano</button>
          </article>
        ))}
      </section>
    </main>
  );
}
```

5. Explicacao do codigo ou da decisao.

O cliente API centraliza as chamadas. A pagina nao envia `userId`, mostra mensagens claras e deixa visivel a parte solidaria do plano.

6. Validacao do passo.

Abrir `/subscription`, confirmar planos e ativar uma subscricao com utilizador autenticado.

7. Caso negativo, erro comum ou risco que este passo evita.

Usar `fetch` direto aqui podia esquecer `credentials: "include"` e quebrar a sessao.

### Passo 5 - Proteger playback com subscricao ativa

1. Objetivo do passo.

Aplicar o bloqueio de acesso premium exigido por RF39 no backend, antes de devolver dados de playback.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/subscriptions/subscription-access.middleware.js`
    - EDITAR: `backend/src/modules/playback/playback.routes.js`
    - LOCALIZACAO: ficheiro completo do middleware e rota `GET /:contentId` do router de playback

3. Instrucoes concretas.

Cria um middleware que usa a subscricao do utilizador autenticado. Depois adiciona esse middleware a rota de playback criada no `BK-MF2-05`, mantendo `requireAuth` antes dele.

4. Codigo completo.

`backend/src/modules/subscriptions/subscription-access.middleware.js`

```js
/**
 * Middleware de autorizacao premium por subscricao.
 *
 * Deve correr depois de `requireAuth`, porque precisa de `req.user.id`.
 * Se a subscricao estiver vencida, cancelada ou inexistente, devolve `403`.
 */
import { hasActiveSubscriptionAccess } from "./subscriptions.service.js";

/**
 * Bloqueia playback premium sem subscricao ativa.
 *
 * @param {object} req - Pedido Express com `req.user.id`.
 * @param {object} _res - Resposta Express nao usada.
 * @param {Function} next - Callback Express.
 * @returns {Promise<void>} Continua ou encaminha erro `403`.
 */
export async function requireActiveSubscription(req, _res, next) {
  const hasAccess = await hasActiveSubscriptionAccess(req.user.id);

  if (!hasAccess) {
    const error = new Error("Subscricao ativa obrigatoria para reproduzir este conteudo.");
    error.statusCode = 403;
    return next(error);
  }

  return next();
}
```

Trecho final esperado em `backend/src/modules/playback/playback.routes.js`:

```js
/**
 * Router de playback depois de aplicar o guard premium da MF4.
 *
 * A rota de continuar a ver continua apenas autenticada; reproduzir e gravar
 * progresso passam a exigir subscricao ativa.
 */
import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { requireActiveSubscription } from "../subscriptions/subscription-access.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import {
  getContinueWatching,
  getPlaybackByContent,
  putPlaybackProgress,
} from "./playback.controller.js";

export const playbackRouter = Router();

playbackRouter.use(requireAuth);
playbackRouter.get("/me/continue-watching", asyncHandler(getContinueWatching));
playbackRouter.get("/:contentId", requireActiveSubscription, asyncHandler(getPlaybackByContent));
playbackRouter.put("/:contentId/progress", requireActiveSubscription, asyncHandler(putPlaybackProgress));
```

5. Explicacao do codigo ou da decisao.

O `requireAuth` confirma quem e o utilizador. O `requireActiveSubscription` confirma se esse utilizador pode ver conteudo premium. Esta separacao evita misturar autenticacao com autorizacao de subscricao. A rota `continue-watching` continua autenticada, porque lista dados pessoais, mas o playback e a escrita de progresso passam a exigir acesso premium.

6. Validacao do passo.

```bash
curl -i -b /tmp/faithflix.cookies http://localhost:3000/api/playback/CONTENT_ID
```

Resultado esperado: utilizador autenticado sem subscricao ativa recebe `403`; utilizador com subscricao ativa recebe `200`.

7. Caso negativo, erro comum ou risco que este passo evita.

Sem este middleware, `hasPremiumAccess` seria apenas um valor mostrado na UI e nao uma regra de seguranca aplicada pelo backend.

## Criterios de aceite (mensuraveis)

- `GET /api/subscriptions/plans` devolve `200` e pelo menos dois planos ativos.
- `POST /api/subscriptions/me` cria ou atualiza uma subscricao para o utilizador autenticado.
- `renewActiveSubscription(userId)` avanca `currentPeriodStart` e `currentPeriodEnd` quando a subscricao ativa deve renovar.
- `GET /api/subscriptions/me` devolve `hasPremiumAccess: true` apenas para estado `active`.
- Sem login, endpoints `/me` devolvem `401`.
- `GET /api/playback/:contentId` devolve `403` quando a subscricao esta `past_due`, `expired`, `canceled` ou fora do periodo.
- Pelo menos 3 negativos documentados: plano inexistente, utilizador sem login e acesso premium com subscricao bloqueada.

## Validacao final

```bash
cd backend
npm test
curl -i http://localhost:3000/api/subscriptions/plans
curl -i -b /tmp/faithflix.cookies http://localhost:3000/api/playback/CONTENT_ID
```

Resultado esperado: testes passam, planos respondem `200`, pedidos privados sem cookie respondem `401` e playback sem subscricao ativa responde `403`.

## Evidence para PR/defesa

- `pr`: commit/PR com modulo `subscriptions` e pagina `/subscription`.
- `proof`: captura da pagina de planos, resposta JSON de `/api/subscriptions/me` e playback autorizado com subscricao ativa.
- `neg`: respostas `401` sem login, `404` para plano invalido e bloqueio premium para estado nao ativo.

## Handoff

O `BK-MF4-02` deve reutilizar `subscription_plans`, `subscriptions`, `activateSubscription`, `getMySubscription` e `hasActiveSubscriptionAccess`. O trial deve encaixar neste mesmo contrato de acesso premium. Nao deve criar outro modelo de subscricao nem guardar dados reais de cartao.

## Snippet tecnico aplicavel

```js
// O userId vem sempre da sessao para impedir que o frontend crie subscricoes em nome de outra pessoa.
res.status(201).json(await activateSubscription(req.user.id, req.body.planCode));
```

## Changelog

- `2026-06-13`: guia reescrito com contratos de planos, subscricoes, endpoints, frontend, ownership e validacao.
