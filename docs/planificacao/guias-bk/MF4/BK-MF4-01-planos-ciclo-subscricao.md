# BK-MF4-01 - Planos e ciclo de subscrição

## Header

- `doc_id`: `GUIA-BK-MF4-01`
- `bk_id`: `BK-MF4-01`
- `macro`: `MF4`
- `owner`: `Matheus`
- `apoio`: `Davi`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `L`
- `dependencias`: `BK-MF2-01,BK-MF2-05`
- `rf_rnf`: `RF35, RF36, RF38, RF39`
- `fase_documental`: `Fase 1`
- `sprint`: `S07`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF4-02`
- `guia_path`: `docs/planificacao/guias-bk/MF4/BK-MF4-01-planos-ciclo-subscricao.md`
- `last_updated`: `2026-06-13`

## Bloco pedagógico (obrigatório)

Neste BK vais implementar a base real de planos e subscrições do FaithFlix. A partir daqui, um utilizador autenticado consegue escolher um plano mensal ou anual, consultar o estado da sua subscrição, cancelar a renovação e ficar bloqueado quando a subscrição estiver expirada.

### Objetivo pedagógico

- Perceber a diferença entre plano, subscrição, ciclo de renovação e bloqueio por expiração.
- Aplicar ownership: o frontend nunca envia `userId`; o backend usa `req.user.id`.
- Preparar o `BK-MF4-02`, que acrescenta método de pagamento simulado e trial.

### Importância funcional

- Sem subscrições, o FaithFlix não consegue ligar o acesso premium ao ciclo solidário da aplicação.
- Este BK cria a ponte entre identidade (`BK-MF2-01`), reprodução (`BK-MF2-05`) e monetização solidária (`MF4`).
- A percentagem solidária guardada em cada plano será usada no `BK-MF4-05` para calcular a pool mensal.

### Scope-in

- Criar planos mensais e anuais com preço, moeda, ciclo e percentagem solidária.
- Criar, consultar, renovar e cancelar a renovação de subscrições do utilizador autenticado.
- Proteger endpoints pessoais com `requireAuth` e ownership por `req.user.id`.
- Bloquear reprodução premium quando a subscrição está expirada, cancelada, em dívida ou fora do período ativo.
- Criar cliente API e página frontend de gestão de subscrição.

### Scope-out

- Não implementar pagamento real, Stripe, PayPal, MB Way, webhooks ou dados de cartão.
- Não criar trial; o trial entra no `BK-MF4-02`.
- Não criar relatórios financeiros nem distribuição da pool; isso entra em `BK-MF4-05` e `BK-MF4-06`.
- Não alterar o domínio de identidade nem guardar tokens no browser.

### Tempo estimado

- 3 blocos de 90 minutos.
- Se o modelo de dados ou os estados ficarem confusos, parar e desenhar primeiro a máquina de estados.

### Glossário rápido

- Plano: oferta comercial disponível para escolha, por exemplo mensal ou anual.
- Subscrição: ligação entre um utilizador autenticado e um plano.
- Ciclo de faturação: intervalo de datas em que a subscrição dá acesso premium.
- Renovação: avanço controlado do ciclo quando a subscrição continua válida.
- Guard premium: middleware que protege reprodução premium no backend.

### Conceitos teóricos essenciais

- Domínio FaithFlix: um plano define a oferta; a subscrição define se aquele utilizador pode ver conteúdo premium naquele período.
- Backend: o controller recebe o pedido HTTP, o service aplica regras de negócio e a route liga tudo ao Express.
- Frontend: a página usa `apiClient` para enviar cookies com `credentials: "include"` e mostrar loading, erro, vazio e sucesso.
- Segurança: o frontend nunca envia `userId`; o backend usa a sessão segura criada nos BKs anteriores.
- Dados: MongoDB guarda planos e subscrições em coleções separadas para evitar misturar oferta comercial com estado do utilizador.
- `CANONICO`: RF35, RF36, RF38 e RF39 exigem subscrição mensal/anual, renovação, gestão e bloqueio.
- `DERIVADO`: os estados fechados são `active`, `past_due`, `expired` e `canceled` para evitar valores ambíguos.
- `DERIVADO`: no MVP, o playback autenticado passa a ser o ponto premium protegido por subscrição ativa.

### Erros comuns

- Guardar dados de cartão neste BK.
- Aceitar `userId` vindo do frontend.
- Misturar plano com pagamento; pagamento simulado entra no `BK-MF4-02`.
- Esquecer que `past_due` e `expired` não podem aceder a conteúdo premium.

### Check de compreensão

- [ ] Sei explicar o que e um plano e o que e uma subscrição.
- [ ] Sei indicar que estados bloqueiam acesso premium.
- [ ] Sei provar que uma subscrição pertence ao utilizador autenticado.

## Bloco operacional (obrigatório)

### Pré-condições

- `BK-MF2-01` executado, com login real, cookie HttpOnly e `req.user`.
- `BK-MF2-02` executado, com `requireAuth`.
- `BK-MF2-05` executado, com `playbackRouter` e endpoint `GET /api/playback/:contentId`.
- `backend/src/config/database.js` existe.
- `frontend/src/services/api/apiClient.js` existe e envia cookies com `credentials: "include"`.
- Confirmar no backlog que este BK mantém owner `Matheus`, apoio `Davi`, prioridade `P0` e dependências `BK-MF2-01,BK-MF2-05`.

### Arquitetura do BK

- Backend: módulo `subscriptions` com validação, service, controller, router e middleware de acesso premium.
- Frontend: `subscriptionsApi` centraliza chamadas HTTP e `SubscriptionPage` mostra planos e estado atual.
- Persistência: `subscription_plans` guarda ofertas; `subscriptions` guarda o estado por utilizador.
- Segurança: `GET /plans` é público; endpoints `/me` exigem login e usam ownership por sessão.
- Integração: o middleware `requireActiveSubscription` é aplicado no router de playback criado no `BK-MF2-05`.

### Ficheiros a criar, editar e rever

- CRIAR: `backend/src/modules/subscriptions/subscriptions.validation.js`
- CRIAR: `backend/src/modules/subscriptions/subscriptions.service.js`
- CRIAR: `backend/src/modules/subscriptions/subscriptions.controller.js`
- CRIAR: `backend/src/modules/subscriptions/subscriptions.routes.js`
- CRIAR: `backend/src/modules/subscriptions/subscription-access.middleware.js`
- CRIAR: `frontend/src/services/api/subscriptionsApi.js`
- CRIAR: `frontend/src/pages/SubscriptionPage.jsx`
- EDITAR: `backend/src/app.js`
- EDITAR: `backend/src/server.js`
- EDITAR: `backend/src/modules/playback/playback.routes.js`
- EDITAR: `frontend/src/routes/AppRoutes.jsx`
- REVER: `BK-MF2-01`, `BK-MF2-05`, `RF35`, `RF36`, `RF38`, `RF39`, `RNF15`, `RNF18`

### Guia de execução (passo-a-passo)

### Passo 1 - Criar validação de planos e subscrições

1. Objetivo do passo.

Validar ciclos, estados e datas antes de gravar qualquer subscrição.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/subscriptions/subscriptions.validation.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Cria a pasta `backend/src/modules/subscriptions/` e adiciona o ficheiro abaixo.

4. Código completo.

```js
/**
 * Valida os valores aceites para planos e subscrições da MF4.
 *
 * Este ficheiro existe para impedir que cada aluno invente nomes diferentes
 * para ciclos e estados. Os services e controllers devem usar estes helpers
 * antes de persistir dados de subscrição.
 */
export const PLAN_INTERVALS = ["monthly", "yearly"];
export const SUBSCRIPTION_STATUS = ["active", "past_due", "expired", "canceled"];

/**
 * Cria um erro HTTP simples para validacoes de subscrição.
 *
 * @param {string} message - Mensagem segura para devolver ao frontend.
 * @param {number} statusCode - Código HTTP que o error handler deve usar.
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
 * @throws {Error} Quando o ciclo não pertence ao contrato da MF4.
 */
export function assertPlanInterval(interval) {
  const value = String(interval ?? "").trim();
  if (!PLAN_INTERVALS.includes(value)) {
    throw httpError("Ciclo de plano inválido.");
  }
  return value;
}

/**
 * Confirma que o estado de subscrição existe no contrato da MF4.
 *
 * @param {unknown} status - Estado recebido de input ou da base de dados.
 * @returns {string} Estado normalizado.
 * @throws {Error} Quando o estado não e reconhecido.
 */
export function assertSubscriptionStatus(status) {
  const value = String(status ?? "").trim();
  if (!SUBSCRIPTION_STATUS.includes(value)) {
    throw httpError("Estado de subscrição inválido.");
  }
  return value;
}

/**
 * Calcula a data final do ciclo de billing.
 *
 * @param {Date|string|number} date - Data inicial do ciclo.
 * @param {"monthly"|"yearly"} interval - Ciclo validado do plano.
 * @returns {Date} Data de fim do ciclo seguinte.
 * @throws {Error} Quando a data inicial e inválida.
 */
export function addBillingCycle(date, interval) {
  const source = new Date(date);
  if (Number.isNaN(source.getTime())) {
    throw httpError("Data de início inválida.");
  }

  const next = new Date(source);
  // Usamos métodos de Date para preservar meses/anos reais em vez de assumir sempre 30 dias.
  if (interval === "monthly") next.setMonth(next.getMonth() + 1);
  if (interval === "yearly") next.setFullYear(next.getFullYear() + 1);
  return next;
}

/**
 * Indica se um estado deve bloquear acesso premium.
 *
 * @param {string} status - Estado da subscrição.
 * @returns {boolean} `true` quando playback premium deve ser recusado.
 */
export function isBlockingStatus(status) {
  return ["past_due", "expired", "canceled"].includes(status);
}
```

5. Explicação do código ou da decisão.

Este ficheiro fecha os valores aceites. Assim, a equipa não cria uma subscrição com `mensal`, `paga`, `ativa` ou outro valor que o frontend não reconhece.

6. Validação do passo.

```bash
node -e "import('./src/modules/subscriptions/subscriptions.validation.js').then(({ addBillingCycle }) => console.log(addBillingCycle('2026-06-01','monthly').toISOString().startsWith('2026-07')))"
```

7. Caso negativo, erro comum ou risco que este passo evita.

Se a validação aceitar qualquer estado, o bloqueio de conteúdo premium fica inseguro.

### Passo 2 - Criar service de planos e subscrições

1. Objetivo do passo.

Criar planos base, ativar subscrição do utilizador autenticado, consultar estado e cancelar renovação.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/subscriptions/subscriptions.service.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Cria o service abaixo. Ele usa MongoDB, `req.user.id` recebido pelo controller e não guarda dados financeiros.

4. Código completo.

```js
/**
 * Gere planos, subscrições e acesso premium da MF4.
 *
 * O service usa sempre `userId` vindo da sessão segura e nunca aceita
 * ownership vindo do frontend. Também centraliza datas de ciclo para que
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
 * @throws {Error} Quando o identificador não tem formato de ObjectId.
 */
function userObjectId(userId) {
  if (!ObjectId.isValid(userId)) {
    const error = new Error("Utilizador inválido.");
    error.statusCode = 400;
    throw error;
  }
  return new ObjectId(userId);
}

/**
 * Remove campos internos de um plano antes de o expor ao frontend.
 *
 * @param {object} plan - Documento MongoDB de `subscription_plans`.
 * @returns {object} Plano público sem `_id` bruto nem campos internos.
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
 * Converte uma subscrição em payload seguro para UI/API.
 *
 * @param {object|null} subscription - Documento MongoDB de `subscriptions`.
 * @param {object|undefined} plan - Plano associado, quando existir.
 * @returns {object} Estado público da subscrição e acesso premium.
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
 * Calcula se uma subscrição ainda autoriza acesso premium.
 *
 * @param {object|null} subscription - Documento de subscrição.
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
    // O upsert torna o seed idempotente: correr o servidor duas vezes não duplica planos.
    await db.collection("subscription_plans").updateOne(
      { code: plan.code },
      { $set: { ...plan, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true },
    );
  }
}

/**
 * Lista planos ativos disponíveis para escolha.
 *
 * @returns {Promise<{plans: object[]}>} Planos públicos ordenados por preço.
 */
export async function listPlans() {
  const db = await getDb();
  const plans = await db.collection("subscription_plans").find({ active: true }).sort({ priceCents: 1 }).toArray();
  return { plans: plans.map(publicPlan) };
}

/**
 * Ativa ou substitui a subscrição paga do utilizador autenticado.
 *
 * @param {string} userId - Identificador vindo da sessão segura.
 * @param {string} planCode - Código do plano escolhido.
 * @returns {Promise<{subscription: object}>} Subscrição pública criada/atualizada.
 * @throws {Error} Quando o plano não existe ou esta inativo.
 */
export async function activateSubscription(userId, planCode) {
  const db = await getDb();
  const plan = await db.collection("subscription_plans").findOne({ code: String(planCode), active: true });
  if (!plan) {
    const error = new Error("Plano não encontrado.");
    error.statusCode = 404;
    throw error;
  }

  const now = new Date();
  const interval = assertPlanInterval(plan.interval);
  const subscription = {
    // O userId vem da sessão para impedir subscrições em nome de outra pessoa.
    userId: userObjectId(userId),
    planCode: plan.code,
    status: "active",
    currentPeriodStart: now,
    currentPeriodEnd: addBillingCycle(now, interval),
    cancelAtPeriodEnd: false,
    createdAt: now,
    updatedAt: now,
  };

  // Existe uma unica subscrição por utilizador; isto simplifica guards e relatórios.
  await db.collection("subscriptions").updateOne(
    { userId: subscription.userId },
    { $set: subscription },
    { upsert: true },
  );

  return { subscription: publicSubscription(subscription, plan) };
}

/**
 * Devolve a subscrição do utilizador autenticado.
 *
 * @param {string} userId - Identificador vindo da sessão segura.
 * @returns {Promise<{subscription: object}>} Estado público da subscrição.
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
 * Verifica se o utilizador pode aceder a conteúdo premium.
 *
 * @param {string} userId - Identificador vindo de `req.user.id`.
 * @param {Date} referenceDate - Data opcional para testes de expiração.
 * @returns {Promise<boolean>} Resultado usado pelo middleware de playback.
 */
export async function hasActiveSubscriptionAccess(userId, referenceDate = new Date()) {
  const db = await getDb();
  const subscription = await db.collection("subscriptions").findOne({ userId: userObjectId(userId) });
  return hasSubscriptionAccess(subscription, referenceDate);
}

/**
 * Cancela a renovação futura mantendo acesso até ao fim do ciclo atual.
 *
 * @param {string} userId - Identificador vindo da sessão segura.
 * @returns {Promise<{subscription: object}>} Subscrição atualizada.
 * @throws {Error} Quando não existe subscrição ativa para cancelar.
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
    const error = new Error("Subscrição ativa não encontrada.");
    error.statusCode = 404;
    throw error;
  }

  return { subscription: publicSubscription(subscription) };
}

/**
 * Renova uma subscrição ativa quando o pagamento simulado do novo ciclo e aceite.
 *
 * @param {string} userId - Identificador vindo da sessão segura.
 * @returns {Promise<{subscription: object}>} Subscrição com novo ciclo.
 * @throws {Error} Quando não existe subscrição ativa renovavel.
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
    const error = new Error("Subscrição ativa renovavel não encontrada.");
    error.statusCode = 404;
    throw error;
  }

  const plan = await db.collection("subscription_plans").findOne({ code: subscription.planCode, active: true });
  if (!plan) {
    const error = new Error("Plano da subscrição não encontrado.");
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

  // A renovação positiva avança datas sem criar uma segunda subscrição para o mesmo utilizador.
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
 * Marca subscrições vencidas quando a renovação simulada não ocorreu.
 *
 * @param {Date} referenceDate - Data usada para decidir vencimento.
 * @returns {Promise<void>} Termina depois de atualizar estados vencidos.
 */
export async function expireOverdueSubscriptions(referenceDate = new Date()) {
  const db = await getDb();
  // Se o utilizador cancelou renovação, o fim do ciclo transforma o estado em canceled.
  await db.collection("subscriptions").updateMany(
    { status: "active", currentPeriodEnd: { $lte: referenceDate }, cancelAtPeriodEnd: true },
    { $set: { status: "canceled", updatedAt: referenceDate } },
  );
  // Sem pagamento de renovação, a subscrição entra em past_due e o guard premium bloqueia playback.
  await db.collection("subscriptions").updateMany(
    { status: "active", currentPeriodEnd: { $lte: referenceDate }, cancelAtPeriodEnd: false },
    { $set: { status: "past_due", updatedAt: referenceDate } },
  );
}
```

5. Explicação do código ou da decisão.

O service cria os planos base com `ensureSubscriptionIndexes`, impede duplicação por utilizador e calcula o fim do ciclo a partir do plano. A percentagem solidária fica guardada no plano para o `BK-MF4-05` calcular a pool mensal. `renewActiveSubscription` mostra o caminho positivo de renovação simulada: quando o novo ciclo e aceite, as datas avançam sem criar outra subscrição. `expireOverdueSubscriptions` cobre o caminho negativo: se a renovação não acontecer, a subscrição fica `past_due` ou `canceled`. `findOneAndUpdate` devolve o documento atualizado ou `null` na versão atual do driver MongoDB usada pelo projeto, por isso `cancelRenewal` valida diretamente `subscription` e não acede a `.value`.

6. Validação do passo.

```bash
node -e "import('./src/modules/subscriptions/subscriptions.service.js').then((m) => console.log(typeof m.activateSubscription, typeof m.getMySubscription, typeof m.renewActiveSubscription))"
```

7. Caso negativo, erro comum ou risco que este passo evita.

Se cada ativação criasse uma subscrição nova, o utilizador podia ter dois estados ao mesmo tempo.

Confirma também que o service já expoe a função usada pelo guard premium:

```bash
node -e "import('./src/modules/subscriptions/subscriptions.service.js').then((m) => console.log(typeof m.hasActiveSubscriptionAccess))"
```

### Passo 3 - Criar controller, rotas e montagem no backend

1. Objetivo do passo.

Expor endpoints REST protegidos por sessão.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/subscriptions/subscriptions.controller.js`
    - CRIAR: `backend/src/modules/subscriptions/subscriptions.routes.js`
    - EDITAR: `backend/src/app.js`
    - EDITAR: `backend/src/server.js`
    - LOCALIZACAO: módulo `subscriptions` completo e imports aditivos em `app.js` e `server.js`

3. Instrucoes concretas.

Cria controller e router. Depois monta `subscriptionsRouter` em `/api/subscriptions` depois de `attachSession`.

4. Código completo.

`backend/src/modules/subscriptions/subscriptions.controller.js`

```js
/**
 * Controllers HTTP do módulo de subscrições.
 *
 * Cada controller delega regras de negócio para o service e usa `req.user.id`
 * nos endpoints privados para preservar ownership.
 */
import {
  activateSubscription,
  cancelRenewal,
  getMySubscription,
  listPlans,
} from "./subscriptions.service.js";

/**
 * Devolve planos ativos públicos.
 *
 * @param {object} _req - Pedido Express não usado.
 * @param {object} res - Resposta Express.
 * @returns {Promise<void>} Envia `200` com planos.
 */
export async function getPlans(_req, res) {
  res.status(200).json(await listPlans());
}

/**
 * Devolve a subscrição do utilizador autenticado.
 *
 * @param {object} req - Pedido Express com `req.user.id`.
 * @param {object} res - Resposta Express.
 * @returns {Promise<void>} Envia `200` com estado da subscrição.
 */
export async function getMySubscriptionController(req, res) {
  res.status(200).json(await getMySubscription(req.user.id));
}

/**
 * Cria ou atualiza a subscrição do utilizador autenticado.
 *
 * @param {object} req - Pedido Express com `planCode` no body.
 * @param {object} res - Resposta Express.
 * @returns {Promise<void>} Envia `201` com a subscrição ativa.
 */
export async function postMySubscription(req, res) {
  // O frontend envia o plano; o dono da subscrição vem sempre da sessão.
  res.status(201).json(await activateSubscription(req.user.id, req.body.planCode));
}

/**
 * Cancela a renovação futura da subscrição do utilizador autenticado.
 *
 * @param {object} req - Pedido Express com `req.user.id`.
 * @param {object} res - Resposta Express.
 * @returns {Promise<void>} Envia `200` com a subscrição atualizada.
 */
export async function postCancelRenewal(req, res) {
  res.status(200).json(await cancelRenewal(req.user.id));
}
```

`backend/src/modules/subscriptions/subscriptions.routes.js`

```js
/**
 * Rotas REST de subscrições.
 *
 * As rotas `/me` ficam protegidas porque expoem dados do utilizador
 * autenticado. A listagem de planos e pública.
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
// A ordem mantém `/plans` público e coloca ownership apenas nos endpoints pessoais.
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

5. Explicação do código ou da decisão.

`GET /plans` e público porque qualquer visitante pode ver ofertas. As rotas `/me` exigem login e usam ownership por sessão.

6. Validação do passo.

```bash
curl -i http://localhost:3000/api/subscriptions/plans
curl -i http://localhost:3000/api/subscriptions/me
```

Resultado esperado: planos devolvem `200`; sem login, `/me` devolve `401`.

7. Caso negativo, erro comum ou risco que este passo evita.

Montar a rota antes da sessão faz `requireAuth` falhar sempre ou aceitar pedidos sem utilizador.

### Passo 4 - Criar cliente API e página de gestão

1. Objetivo do passo.

Permitir ao utilizador ver planos, ativar subscrição e cancelar renovação.

2. Ficheiros envolvidos.
    - CRIAR: `frontend/src/services/api/subscriptionsApi.js`
    - CRIAR: `frontend/src/pages/SubscriptionPage.jsx`
    - EDITAR: `frontend/src/routes/AppRoutes.jsx`
    - LOCALIZACAO: ficheiros completos novos e rota `/subscription`

3. Instrucoes concretas.

Usa `apiClient`. A página deve ter loading, erro, estado vazio e sucesso.

4. Código completo.

`frontend/src/services/api/subscriptionsApi.js`

```js
/**
 * Cliente frontend para endpoints de subscrições.
 *
 * Usa o `apiClient` da MF1 para herdar `credentials: "include"` e enviar
 * cookies HttpOnly sem expor tokens no browser.
 */
import { apiClient } from "./apiClient.js";

export const subscriptionsApi = {
  /** @returns {Promise<object>} Planos ativos públicos. */
  listPlans() {
    return apiClient.get("/api/subscriptions/plans");
  },
  /** @returns {Promise<object>} Subscrição do utilizador autenticado. */
  getMine() {
    return apiClient.get("/api/subscriptions/me");
  },
  /**
   * @param {string} planCode - Código do plano escolhido.
   * @returns {Promise<object>} Subscrição ativa criada/atualizada.
   */
  activate(planCode) {
    return apiClient.post("/api/subscriptions/me", { planCode });
  },
  /** @returns {Promise<object>} Subscrição com renovação cancelada. */
  cancelRenewal() {
    return apiClient.post("/api/subscriptions/me/cancel-renewal");
  },
};
```

`frontend/src/pages/SubscriptionPage.jsx`

```jsx
/**
 * Módulo da página de gestão de subscrição do FaithFlix.
 *
 * Integra o cliente de API de subscrições com estado local, carregamento, erro
 * e ações do utilizador autenticado. O ficheiro não envia `userId`, porque o
 * backend aplica ownership através da sessão HttpOnly.
 */
import { useEffect, useState } from "react";
import { subscriptionsApi } from "../services/api/subscriptionsApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

/**
 * Página de gestão de subscrição do utilizador autenticado.
 *
 * Mostra planos, estado atual, mensagens de erro e acao de cancelamento.
 * O componente nunca envia `userId`; o backend associa tudo pela sessão.
 *
 * @returns {JSX.Element} Interface de subscrição.
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
      // Carregamos planos e subscrição em paralelo porque sao leituras independentes.
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
      setStatus("Subscrição ativa.");
    } catch (apiError) {
      setError(toUserMessage(apiError));
    }
  }

  async function handleCancelRenewal() {
    setStatus("");
    setError("");
    try {
      // Cancelar renovação não apaga o ciclo atual, apenas muda a regra futura.
      const response = await subscriptionsApi.cancelRenewal();
      setSubscription(response.subscription);
      setStatus("Renovação cancelada no fim do ciclo atual.");
    } catch (apiError) {
      setError(toUserMessage(apiError));
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
          <button type="button" onClick={handleCancelRenewal}>Cancelar renovação</button>
        )}
      </section>
      <section>
        <h2>Planos</h2>
        {plans.map((plan) => (
          <article key={plan.code}>
            <h3>{plan.name}</h3>
            <p>{(plan.priceCents / 100).toFixed(2)} {plan.currency}</p>
            <p>{plan.solidaritySharePercent}% para a pool solidária.</p>
            <button type="button" onClick={() => handleActivate(plan.code)}>Escolher plano</button>
          </article>
        ))}
      </section>
    </main>
  );
}
```

5. Explicação do código ou da decisão.

O cliente API centraliza as chamadas. A página não envia `userId`, mostra mensagens claras e deixa visível a parte solidária do plano.

6. Validação do passo.

Abrir `/subscription`, confirmar planos e ativar uma subscrição com utilizador autenticado.

7. Caso negativo, erro comum ou risco que este passo evita.

Usar `fetch` direto aqui podia esquecer `credentials: "include"` e quebrar a sessão.

### Passo 5 - Proteger playback com subscrição ativa

1. Objetivo do passo.

Aplicar o bloqueio de acesso premium exigido por RF39 no backend, antes de devolver dados de playback.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/subscriptions/subscription-access.middleware.js`
    - EDITAR: `backend/src/modules/playback/playback.routes.js`
    - LOCALIZACAO: ficheiro completo do middleware e rota `GET /:contentId` do router de playback

3. Instrucoes concretas.

Cria um middleware que usa a subscrição do utilizador autenticado. Depois adiciona esse middleware a rota de playback criada no `BK-MF2-05`, mantendo `requireAuth` antes dele.

4. Código completo.

`backend/src/modules/subscriptions/subscription-access.middleware.js`

```js
/**
 * Middleware de autorização premium por subscrição.
 *
 * Deve correr depois de `requireAuth`, porque precisa de `req.user.id`.
 * Se a subscrição estiver vencida, cancelada ou inexistente, devolve `403`.
 */
import { hasActiveSubscriptionAccess } from "./subscriptions.service.js";

/**
 * Bloqueia playback premium sem subscrição ativa.
 *
 * @param {object} req - Pedido Express com `req.user.id`.
 * @param {object} _res - Resposta Express não usada.
 * @param {Function} next - Callback Express.
 * @returns {Promise<void>} Continua ou encaminha erro `403`.
 */
export async function requireActiveSubscription(req, _res, next) {
  const hasAccess = await hasActiveSubscriptionAccess(req.user.id);

  if (!hasAccess) {
    const error = new Error("Subscrição ativa obrigatória para reproduzir este conteúdo.");
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
 * progresso passam a exigir subscrição ativa.
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

5. Explicação do código ou da decisão.

O `requireAuth` confirma quem e o utilizador. O `requireActiveSubscription` confirma se esse utilizador pode ver conteúdo premium. Esta separacao evita misturar autenticação com autorização de subscrição. A rota `continue-watching` continua autenticada, porque lista dados pessoais, mas o playback e a escrita de progresso passam a exigir acesso premium.

6. Validação do passo.

```bash
curl -i -b /tmp/faithflix.cookies http://localhost:3000/api/playback/CONTENT_ID
```

Resultado esperado: utilizador autenticado sem subscrição ativa recebe `403`; utilizador com subscrição ativa recebe `200`.

7. Caso negativo, erro comum ou risco que este passo evita.

Sem este middleware, `hasPremiumAccess` seria apenas um valor mostrado na UI e não uma regra de seguranca aplicada pelo backend.

## Critérios de aceite (mensuráveis)

- `GET /api/subscriptions/plans` devolve `200` e pelo menos dois planos ativos.
- `POST /api/subscriptions/me` cria ou atualiza uma subscrição para o utilizador autenticado.
- `renewActiveSubscription(userId)` avança `currentPeriodStart` e `currentPeriodEnd` quando a subscrição ativa deve renovar.
- `GET /api/subscriptions/me` devolve `hasPremiumAccess: true` apenas para estado `active`.
- Sem login, endpoints `/me` devolvem `401`.
- `GET /api/playback/:contentId` devolve `403` quando a subscrição esta `past_due`, `expired`, `canceled` ou fora do período.
- Pelo menos 3 negativos documentados: plano inexistente, utilizador sem login e acesso premium com subscrição bloqueada.

## Validação final

```bash
cd backend
npm test
curl -i http://localhost:3000/api/subscriptions/plans
curl -i -b /tmp/faithflix.cookies http://localhost:3000/api/playback/CONTENT_ID
```

Resultado esperado: testes passam, planos respondem `200`, pedidos privados sem cookie respondem `401` e playback sem subscrição ativa responde `403`.

## Evidence para PR/defesa

- `pr`: commit/PR com módulo `subscriptions` e página `/subscription`.
- `proof`: captura da página de planos, resposta JSON de `/api/subscriptions/me` e playback autorizado com subscrição ativa.
- `neg`: respostas `401` sem login, `404` para plano inválido e bloqueio premium para estado não ativo.

## Handoff

O `BK-MF4-02` deve reutilizar `subscription_plans`, `subscriptions`, `activateSubscription`, `getMySubscription` e `hasActiveSubscriptionAccess`. O trial deve encaixar neste mesmo contrato de acesso premium. Não deve criar outro modelo de subscrição nem guardar dados reais de cartão.

## Snippet técnico aplicável

```js
// O userId vem sempre da sessão para impedir que o frontend crie subscrições em nome de outra pessoa.
res.status(201).json(await activateSubscription(req.user.id, req.body.planCode));
```

## Changelog

- `2026-06-13`: guia reescrito com contratos de planos, subscrições, endpoints, frontend, ownership e validação.
