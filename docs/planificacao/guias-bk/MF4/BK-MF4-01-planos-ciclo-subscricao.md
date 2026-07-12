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
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais implementar a base real de planos e subscrições do FaithFlix. A partir daqui, um utilizador autenticado consegue escolher um plano mensal ou anual, consultar o estado da sua subscrição, cancelar a renovação e ficar bloqueado quando a subscrição estiver expirada.


- Perceber a diferença entre plano, subscrição, ciclo de renovação e bloqueio por expiração.
- Aplicar ownership: o frontend nunca envia `userId`; o backend usa `req.user.id`.
- Preparar o `BK-MF4-02`, que acrescenta método de pagamento simulado e trial.

#### Importância

- Sem subscrições, o FaithFlix não consegue ligar o acesso premium ao ciclo solidário da aplicação.
- Este BK cria a ponte entre identidade (`BK-MF2-01`), reprodução (`BK-MF2-05`) e monetização solidária (`MF4`).
- A percentagem solidária guardada em cada plano será usada no `BK-MF4-05` para calcular a pool mensal.

#### Scope-in

- Criar planos mensais e anuais com preço, moeda, ciclo e percentagem solidária.
- Criar subscrições apenas através do checkout/trial do `BK-MF4-02`, consultar o estado e cancelar a renovação futura.
- Processar ciclos vencidos num worker separado, com lease por subscrição/ciclo e sem renovação antecipada.
- Proteger endpoints pessoais com `requireAuth` e ownership por `req.user.id`.
- Bloquear reprodução premium quando a subscrição está expirada, cancelada, em dívida ou fora do período ativo.
- Criar cliente API e página frontend de gestão de subscrição.

#### Scope-out

- Não implementar pagamento real, Stripe, PayPal, MB Way, webhooks ou dados de cartão.
- Não criar trial; o trial entra no `BK-MF4-02`.
- Não criar relatórios financeiros nem distribuição da pool; isso entra em `BK-MF4-05` e `BK-MF4-06`.
- Não alterar o domínio de identidade nem guardar tokens no browser.

### Tempo estimado

- 3 blocos de 90 minutos.
- Se o modelo de dados ou os estados ficarem confusos, parar e desenhar primeiro a máquina de estados.

#### Estado antes e depois

- Estado antes: aplicam-se os BKs declarados em `dependencias`, os RF/RNF do Header e os artefactos já entregues pelas fases anteriores.
- Estado depois: ficam implementáveis e verificáveis apenas os resultados listados em `Scope-in`, sem antecipar o `Scope-out`.

#### Pré-requisitos

- `BK-MF2-01` executado, com login real, cookie HttpOnly e `req.user`.
- `BK-MF2-02` executado, com `requireAuth`.
- `BK-MF2-05` executado, com `playbackRouter` e endpoint `GET /api/playback/:contentId`.
- `backend/src/config/database.js` existe.
- `frontend/src/services/api/apiClient.js` existe e envia cookies com `credentials: "include"`.
- Confirmar no backlog que este BK mantém owner `Matheus`, apoio `Davi`, prioridade `P0` e dependências `BK-MF2-01,BK-MF2-05`.

#### Glossário

- Plano: oferta comercial disponível para escolha, por exemplo mensal ou anual.
- Subscrição: ligação entre um utilizador autenticado e um plano.
- Ciclo de faturação: intervalo de datas em que a subscrição dá acesso premium.
- Renovação: avanço controlado do ciclo quando a subscrição continua válida.
- Guard premium: middleware que protege reprodução premium no backend.

#### Conceitos teóricos essenciais

- Domínio FaithFlix: um plano define a oferta; a subscrição define se aquele utilizador pode ver conteúdo premium naquele período.
- Backend: o controller recebe o pedido HTTP, o service aplica regras de negócio e a route liga tudo ao Express.
- Frontend: a página usa `apiClient` para enviar cookies com `credentials: "include"` e mostrar loading, erro, vazio e sucesso.
- Segurança: o frontend nunca envia `userId`; o backend usa a sessão segura criada nos BKs anteriores.
- Dados: MongoDB guarda planos e subscrições em coleções separadas para evitar misturar oferta comercial com estado do utilizador.
- `CANONICO`: RF35, RF36, RF38 e RF39 exigem subscrição mensal/anual, renovação, gestão e bloqueio.
- `DERIVADO`: os estados fechados são `active`, `trialing`, `past_due`, `expired` e `canceled` para evitar valores ambíguos.
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

#### Arquitetura do BK

- Backend: módulo `subscriptions` com validação, service, controller, router e middleware de acesso premium.
- Worker: processo separado reclama leases MongoDB, trata ciclos vencidos e nunca avança uma subscrição antes de `currentPeriodEnd`.
- Frontend: `subscriptionsApi` centraliza chamadas HTTP e `SubscriptionPage` mostra planos e estado atual.
- Persistência: `subscription_plans` guarda ofertas; `subscriptions` guarda o estado por utilizador.
- Scheduling: `scheduled_jobs` guarda `key`, `type`,
  `status: idle|running|failed|completed`, `nextRunAt`, `attempts`,
  `leaseOwner`, `leaseExpiresAt` e timestamps de início/conclusão/falha. A chave
  é única; existem índices por `status + nextRunAt` e `leaseExpiresAt`.
- Segurança: `GET /plans` é público; endpoints `/me` exigem login e usam ownership por sessão.
- Integração: o middleware `requireActiveSubscription` é aplicado no router de playback criado no `BK-MF2-05`.
- Um claim é CAS atómico: apenas `idle|failed` pronto ou `running` com lease
  expirado transita para `running`. Só o mesmo `leaseOwner` pode concluir ou
  falhar o job; falha liberta o lease e agenda retry, conclusão terminal remove
  `nextRunAt`. Não existe fallback por scripts paralelos.

### Contrato vinculativo da página de subscrição (Fase 5 - 2026-07-10)

- A carga de planos e, quando autenticado, da subscrição/família usa o mesmo
  `AbortController`. Alterar sessão/retry ou sair da rota cancela a leitura;
  `REQUEST_ABORTED` e respostas antigas não alteram a página.
- Todas as mutações passam por uma reserva síncrona anterior ao render, busy
  state e `AbortSignal`. O unmount cancela operações pendentes e uma resposta
  tardia não mostra sucesso/erro noutra rota.
- Cancelar renovação exige confirmação explícita:
  `Confirmas o cancelamento da renovação no fim do ciclo atual?`. Cancelar o
  diálogo não envia pedido nem remove o acesso atual.
- Depois de uma mutação concluída, a UI recarrega `/api/subscriptions/me` e usa o
  estado canónico do backend; não inventa localmente ciclo, acesso ou família.
- Estados visíveis usam PT-PT e valores seguros: `Mensal`, `Anual`, `Família`,
  `Subscrição própria`, `Partilha familiar`, `Sem acesso premium`,
  `Renovação cancelada no fim do ciclo atual`.
- O exemplo linear do Passo 4 deve incorporar abort/anti-stale, confirmação,
  busy state e mensagens seguras; não é uma implementação final sem essas guardas.

#### Ficheiros a criar/editar/rever

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
- CRIAR: `backend/src/modules/jobs/scheduled-jobs.service.js`
- CRIAR: `backend/src/modules/jobs/billing-jobs.service.js`
- CRIAR: `backend/src/modules/jobs/renewal-adapter.js`
- CRIAR: `backend/src/worker.js`
- EDITAR: `frontend/src/routes/AppRoutes.jsx`
- REVER: `BK-MF2-01`, `BK-MF2-05`, `RF35`, `RF36`, `RF38`, `RF39`, `RNF15`, `RNF18`

#### Tutorial técnico linear

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
export const SUBSCRIPTION_STATUS = ["active", "trialing", "past_due", "expired", "canceled"];

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
 * @param {{ anchorDay: number, anchorEndOfMonth: boolean }} [anchor] - Âncora persistida da subscrição.
 * @returns {Date} Data de fim do ciclo seguinte.
 * @throws {Error} Quando a data inicial e inválida.
 */
export function addBillingCycle(date, interval, anchor = undefined) {
  const source = new Date(date);
  if (Number.isNaN(source.getTime())) {
    throw httpError("Data de início inválida.");
  }

  const normalizedInterval = assertPlanInterval(interval);
  const sourceLastDay = new Date(
    Date.UTC(source.getUTCFullYear(), source.getUTCMonth() + 1, 0),
  ).getUTCDate();
  const anchorDay = anchor?.anchorDay ?? source.getUTCDate();
  const anchorEndOfMonth =
    anchor?.anchorEndOfMonth ?? source.getUTCDate() === sourceLastDay;
  if (
    !Number.isInteger(anchorDay) ||
    anchorDay < 1 ||
    anchorDay > 31 ||
    typeof anchorEndOfMonth !== "boolean"
  ) {
    throw httpError("Âncora de faturação inválida.");
  }
  const next = new Date(source);

  // Mudar primeiro para o dia 1 evita o overflow de 31 de janeiro para março.
  next.setUTCDate(1);
  if (normalizedInterval === "monthly") next.setUTCMonth(next.getUTCMonth() + 1);
  if (normalizedInterval === "yearly") next.setUTCFullYear(next.getUTCFullYear() + 1);

  const lastDay = new Date(
    Date.UTC(next.getUTCFullYear(), next.getUTCMonth() + 1, 0),
  ).getUTCDate();
  next.setUTCDate(anchorEndOfMonth ? lastDay : Math.min(anchorDay, lastDay));
  return next;
}

/**
 * Captura a âncora original para não transformar dia 30 em dia 31 depois de fevereiro.
 *
 * @param {Date|string|number} date - Início original da subscrição.
 * @returns {{ anchorDay: number, anchorEndOfMonth: boolean }} Âncora imutável do ciclo.
 */
export function billingAnchorForDate(date) {
  const source = new Date(date);
  if (Number.isNaN(source.getTime())) {
    throw httpError("Data de início inválida.");
  }
  const lastDay = new Date(
    Date.UTC(source.getUTCFullYear(), source.getUTCMonth() + 1, 0),
  ).getUTCDate();
  return {
    anchorDay: source.getUTCDate(),
    anchorEndOfMonth: source.getUTCDate() === lastDay,
  };
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

### Passo 2 - Criar service, jobs de ciclo e worker

1. Objetivo do passo.

Criar planos base, disponibilizar o helper interno consumido pelo checkout,
consultar estado, cancelar renovação e processar cada ciclo vencido uma única
vez através de um worker separado. Não existe endpoint de ativação direta.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/subscriptions/subscriptions.service.js`
    - CRIAR: `backend/src/modules/jobs/scheduled-jobs.service.js`
    - CRIAR: `backend/src/modules/jobs/renewal-adapter.js`
    - CRIAR: `backend/src/modules/jobs/billing-jobs.service.js`
    - CRIAR: `backend/src/worker.js`
    - LOCALIZACAO: ficheiros completos

3. Instrucoes concretas.

Cria os cinco ficheiros abaixo. O service usa MongoDB e o `userId` recebido do
controller; `activateSubscription` e `grantTrialSubscription` são helpers
internos consumidos pelo módulo `payments` e nunca são montados como endpoints
de ativação direta. Os jobs reutilizam `getDb`, `runInTransaction`,
`assertTransactionSupport`, `closeDatabase` e `logger`, todos ensinados em MF1.
Não instales cron, filas ou outra dependência: o lease distribuído fica na
coleção `scheduled_jobs`. Neste BK o worker trata apenas ciclos de subscrição;
o fecho mensal da pool será acrescentado ao mesmo ciclo em `BK-MF4-05`.

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
  billingAnchorForDate,
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
  if (
    !subscription ||
    !["active", "trialing"].includes(subscription.status)
  ) {
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
 * @param {{ db?: import("mongodb").Db, session?: import("mongodb").ClientSession, plan?: object, now?: Date }} [options] Contexto partilhado pelo checkout.
 * @returns {Promise<{subscription: object}>} Subscrição pública criada/atualizada.
 * @throws {Error} Quando o plano não existe ou esta inativo.
 */
export async function activateSubscription(userId, planCode, options = {}) {
  const db = options.db ?? await getDb();
  const { session } = options;
  const plan = options.plan ?? await db.collection("subscription_plans").findOne(
    { code: String(planCode), active: true },
    { session },
  );
  if (!plan) {
    const error = new Error("Plano não encontrado.");
    error.statusCode = 404;
    throw error;
  }

  const now = options.now ? new Date(options.now) : new Date();
  const interval = assertPlanInterval(plan.interval);
  const billingAnchor = billingAnchorForDate(now);
  const subscription = {
    // O userId vem da sessão para impedir subscrições em nome de outra pessoa.
    userId: userObjectId(userId),
    planCode: plan.code,
    status: "active",
    currentPeriodStart: now,
    currentPeriodEnd: addBillingCycle(now, interval, billingAnchor),
    billingAnchorDay: billingAnchor.anchorDay,
    billingAnchorEndOfMonth: billingAnchor.anchorEndOfMonth,
    cancelAtPeriodEnd: false,
    updatedAt: now,
  };

  // Existe uma unica subscrição por utilizador; isto simplifica guards e relatórios.
  await db.collection("subscriptions").updateOne(
    { userId: subscription.userId },
    { $set: subscription, $setOnInsert: { createdAt: now } },
    { upsert: true, session },
  );

  const stored = await db.collection("subscriptions").findOne(
    { userId: subscription.userId },
    { session },
  );
  return { subscription: publicSubscription(stored, plan) };
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

  const { processSubscriptionCycle } = await import("../jobs/billing-jobs.service.js");
  const result = await processSubscriptionCycle(
    subscription._id,
    subscription.currentPeriodEnd,
    { referenceDate: now },
  );

  if (result.outcome === "not_due") {
    const error = new Error("A subscrição ainda não atingiu o fim do ciclo.");
    error.statusCode = 409;
    error.code = "SUBSCRIPTION_NOT_DUE";
    throw error;
  }

  return getMySubscription(userId);
}

/**
 * Marca subscrições vencidas quando a renovação simulada não ocorreu.
 *
 * @param {Date} referenceDate - Data usada para decidir vencimento.
 * @returns {Promise<void>} Termina depois de atualizar estados vencidos.
 */
export async function expireOverdueSubscriptions(referenceDate = new Date()) {
  const { runDueSubscriptionJobs } = await import("../jobs/billing-jobs.service.js");
  return runDueSubscriptionJobs({
    ownerId: `compat-expiry:${process.pid}`,
    referenceDate,
  });
}
```

Cria `backend/src/modules/jobs/scheduled-jobs.service.js` com o ledger de
leases. A `key` única representa uma unidade lógica de trabalho; repetir o
registo não antecipa um retry nem duplica o job.

```js
/**
 * Ledger MongoDB de jobs com lease distribuído e recuperação após timeout.
 *
 * A coleção guarda apenas chaves operacionais e códigos de erro seguros. Um
 * worker nunca pode concluir ou falhar um lease pertencente a outro owner.
 */
import { getDb } from "../../config/database.js";

const JOB_KEY_PATTERN = /^[a-z0-9:_-]{1,160}$/u;
const MIN_LEASE_MS = 5_000;
const MAX_LEASE_MS = 15 * 60_000;

/**
 * Valida a chave determinística usada pelo índice único.
 *
 * @param {unknown} value - Chave recebida pelo service.
 * @returns {string} Chave normalizada.
 */
function assertJobKey(value) {
  const key = String(value ?? "").trim().toLowerCase();
  if (!JOB_KEY_PATTERN.test(key)) {
    throw new TypeError("Chave de job inválida.");
  }
  return key;
}

/**
 * Valida o owner sem persistir hostname, argumentos ou segredos arbitrários.
 *
 * @param {unknown} value - Identificador interno do worker.
 * @returns {string} Owner limitado.
 */
function assertOwnerId(value) {
  const ownerId = String(value ?? "").trim();
  if (!ownerId || ownerId.length > 128) {
    throw new TypeError("Owner do lease inválido.");
  }
  return ownerId;
}

/**
 * Valida a duração do lease para impedir locks permanentes ou busy loops.
 *
 * @param {unknown} value - Duração em milissegundos.
 * @returns {number} Duração segura.
 */
function assertLeaseMs(value) {
  const leaseMs = Number(value);
  if (
    !Number.isInteger(leaseMs) ||
    leaseMs < MIN_LEASE_MS ||
    leaseMs > MAX_LEASE_MS
  ) {
    throw new TypeError("Duração de lease inválida.");
  }
  return leaseMs;
}

/**
 * Exige uma data real, preservando um relógio injetável nos testes.
 *
 * @param {unknown} value - Data candidata.
 * @param {string} message - Mensagem segura.
 * @returns {Date} Cópia válida da data.
 */
function assertDate(value, message) {
  const date = value instanceof Date ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) {
    throw new TypeError(message);
  }
  return date;
}

/**
 * Reduz qualquer erro a um código operacional fechado.
 *
 * @param {unknown} value - Código fornecido pelo domínio/driver.
 * @returns {string} Código sem espaços, mensagens ou dados arbitrários.
 */
function safeErrorCode(value) {
  const code = String(value ?? "JOB_FAILED").trim().toUpperCase();
  return /^[A-Z0-9_:-]{1,80}$/.test(code) ? code : "JOB_FAILED";
}

/**
 * Cria os índices que tornam o claim seguro e pesquisável.
 *
 * @returns {Promise<void>} Termina quando os índices existem.
 */
export async function ensureScheduledJobIndexes() {
  const db = await getDb();
  const jobs = db.collection("scheduled_jobs");
  await jobs.createIndex({ key: 1 }, { unique: true });
  await jobs.createIndex({ status: 1, nextRunAt: 1 });
  await jobs.createIndex({ leaseExpiresAt: 1 });
}

/**
 * Regista uma unidade lógica sem alterar o `nextRunAt` de um retry existente.
 *
 * @param {{ key: string, type: string, nextRunAt: Date, db?: import("mongodb").Db }} input - Definição do job.
 * @returns {Promise<void>} Termina quando o job existe uma única vez.
 */
export async function registerScheduledJob(input) {
  const db = input.db ?? await getDb();
  const key = assertJobKey(input.key);
  const type = String(input.type ?? "").trim();
  const nextRunAt = assertDate(input.nextRunAt, "Data inicial do job inválida.");
  if (!type || type.length > 80) {
    throw new TypeError("Tipo de job inválido.");
  }

  const now = new Date();
  try {
    await db.collection("scheduled_jobs").updateOne(
      { key },
      {
        $set: { type, updatedAt: now },
        $setOnInsert: {
          key,
          status: "idle",
          nextRunAt,
          attempts: 0,
          createdAt: now,
        },
      },
      { upsert: true },
    );
  } catch (error) {
    // Em dois upserts simultâneos, E11000 significa que o outro worker venceu.
    if (Number(error?.code) !== 11000) throw error;
  }
}

/**
 * Reclama atomicamente um job pronto ou um lease expirado.
 *
 * @param {{ key: string, ownerId: string, leaseMs: number, now?: Date, db?: import("mongodb").Db }} input - Pedido de claim.
 * @returns {Promise<object|null>} Documento reclamado ou `null`.
 */
export async function claimScheduledJob(input) {
  const db = input.db ?? await getDb();
  const key = assertJobKey(input.key);
  const ownerId = assertOwnerId(input.ownerId);
  const leaseMs = assertLeaseMs(input.leaseMs);
  const now = input.now
    ? assertDate(input.now, "Data de claim inválida.")
    : new Date();

  const result = await db.collection("scheduled_jobs").findOneAndUpdate(
    {
      key,
      nextRunAt: { $lte: now },
      $or: [
        { status: { $in: ["idle", "failed"] } },
        { status: "running", leaseExpiresAt: { $lte: now } },
      ],
    },
    {
      $set: {
        status: "running",
        leaseOwner: ownerId,
        leaseExpiresAt: new Date(now.getTime() + leaseMs),
        lastStartedAt: now,
        updatedAt: now,
      },
      $inc: { attempts: 1 },
      $unset: { lastErrorCode: "" },
    },
    { returnDocument: "after" },
  );

  // MongoDB Driver 6 devolve o documento; versões anteriores usavam `{ value }`.
  if (result && Object.prototype.hasOwnProperty.call(result, "value")) {
    return result.value ?? null;
  }
  return result ?? null;
}

/**
 * Marca um job terminal apenas quando o owner ainda possui o lease.
 *
 * @param {{ key: string, ownerId: string, now?: Date, db?: import("mongodb").Db }} input - Resultado do job.
 * @returns {Promise<boolean>} `true` se este owner fechou o lease.
 */
export async function completeScheduledJob(input) {
  const db = input.db ?? await getDb();
  const now = input.now
    ? assertDate(input.now, "Data de conclusão inválida.")
    : new Date();
  const result = await db.collection("scheduled_jobs").updateOne(
    {
      key: assertJobKey(input.key),
      status: "running",
      leaseOwner: assertOwnerId(input.ownerId),
      leaseExpiresAt: { $gt: now },
    },
    {
      $set: { status: "completed", lastCompletedAt: now, updatedAt: now },
      $unset: {
        leaseOwner: "",
        leaseExpiresAt: "",
        nextRunAt: "",
        lastErrorCode: "",
      },
    },
  );
  return result.modifiedCount === 1;
}

/**
 * Agenda retry sem guardar stack, mensagem interna ou dados do pedido.
 *
 * @param {{ key: string, ownerId: string, retryAt: Date, errorCode?: string, now?: Date, db?: import("mongodb").Db }} input - Falha segura.
 * @returns {Promise<boolean>} `true` se este owner libertou o lease.
 */
export async function failScheduledJob(input) {
  const db = input.db ?? await getDb();
  const now = input.now
    ? assertDate(input.now, "Data de falha inválida.")
    : new Date();
  const retryAt = assertDate(input.retryAt, "Data de retry inválida.");
  if (retryAt <= now) {
    throw new TypeError("O retry deve ficar no futuro.");
  }

  const result = await db.collection("scheduled_jobs").updateOne(
    {
      key: assertJobKey(input.key),
      status: "running",
      leaseOwner: assertOwnerId(input.ownerId),
      leaseExpiresAt: { $gt: now },
    },
    {
      $set: {
        status: "failed",
        nextRunAt: retryAt,
        lastFailedAt: now,
        lastErrorCode: safeErrorCode(input.errorCode),
        updatedAt: now,
      },
      $unset: { leaseOwner: "", leaseExpiresAt: "" },
    },
  );
  return result.modifiedCount === 1;
}
```

Cria `backend/src/modules/jobs/renewal-adapter.js`. É um adapter local
determinístico: serve para ensinar o lifecycle e testes, não representa gateway
de pagamento nem deve ser apresentado como `RNF24` validado.

```js
/**
 * Decide renovações simuladas sem rede, aleatoriedade ou dados de cartão.
 */
const ALLOWED_OUTCOMES = new Set(["approved", "failed"]);

/**
 * Resolve o resultado persistido no plano/subscrição ou aprova por defeito.
 *
 * @param {{ subscription: object, plan: object }} input - Contexto autoritativo.
 * @returns {{ status: "approved"|"failed", provider: "faithflix-simulated", failureReason: string|null }} Decisão simulada.
 */
export function decideSimulatedRenewal(input) {
  const status = String(
    input.subscription?.simulatedRenewalOutcome ??
      input.plan?.simulatedRenewalOutcome ??
      "approved",
  ).trim();

  if (!ALLOWED_OUTCOMES.has(status)) {
    const error = new Error("Resultado simulado de renovação inválido.");
    error.code = "RENEWAL_SIMULATION_INVALID";
    throw error;
  }

  return {
    status,
    provider: "faithflix-simulated",
    failureReason: status === "failed" ? "Renovação simulada recusada." : null,
  };
}
```

Cria `backend/src/modules/jobs/billing-jobs.service.js`. O job usa a chave
`subscription-cycle:<subscriptionId>:<periodEndMs>`, volta a confirmar o ciclo
dentro da transação e persiste a renovação simulada no ledger financeiro v2.
O mesmo ciclo repetido devolve `already_processed`; nunca cria uma segunda
tentativa nem avança outra vez a data.

```js
/**
 * Processa ciclos vencidos de subscrição com lease e transação idempotente.
 *
 * Este módulo trata trial, cancelamento agendado e renovação simulada. O job
 * mensal da pool não pertence a este BK e será integrado em `BK-MF4-05`.
 */
import { createHash } from "node:crypto";
import { ObjectId } from "mongodb";
import { getDb, runInTransaction } from "../../config/database.js";
import {
  addBillingCycle,
  assertPlanInterval,
  billingAnchorForDate,
} from "../subscriptions/subscriptions.validation.js";
import { decideSimulatedRenewal } from "./renewal-adapter.js";
import {
  claimScheduledJob,
  completeScheduledJob,
  failScheduledJob,
  registerScheduledJob,
} from "./scheduled-jobs.service.js";

const DEFAULT_LEASE_MS = 5 * 60_000;
const DEFAULT_RETRY_MS = 5 * 60_000;
const MAX_SUBSCRIPTIONS_PER_CYCLE = 100;

/**
 * Cria um erro operacional com código estável e sem detalhes de infraestrutura.
 *
 * @param {string} code - Código seguro para logs/testes.
 * @param {string} message - Mensagem local sem segredos.
 * @returns {Error} Erro categorizado.
 */
function operationalError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

/**
 * Converte uma data de domínio e recusa valores inválidos.
 *
 * @param {unknown} value - Data persistida ou injetada.
 * @param {string} code - Código de erro.
 * @returns {Date} Cópia válida.
 */
function requiredDate(value, code) {
  const date = value instanceof Date ? new Date(value) : new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    throw operationalError(code, "Data de ciclo inválida.");
  }
  return date;
}

/**
 * Valida o atraso de retry antes de reclamar qualquer job da passagem.
 *
 * @param {unknown} value - Duração opcional.
 * @returns {number} Retry entre 5 segundos e 15 minutos.
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
 * Produz a chave única de uma subscrição e do fim de ciclo observado.
 *
 * @param {{ _id: ObjectId, currentPeriodEnd: Date|string }} subscription - Documento mínimo.
 * @returns {string} Chave determinística aceite pelo ledger.
 */
export function subscriptionCycleJobKey(subscription) {
  const id = String(subscription?._id ?? "");
  if (!ObjectId.isValid(id)) {
    throw operationalError("SUBSCRIPTION_ID_INVALID", "Subscrição inválida.");
  }
  const periodEnd = requiredDate(
    subscription.currentPeriodEnd,
    "SUBSCRIPTION_PERIOD_INVALID",
  );
  return `subscription-cycle:${id}:${periodEnd.getTime()}`;
}

/**
 * Captura os valores financeiros do plano no momento da renovação.
 *
 * @param {object} plan - Plano persistido e ativo.
 * @returns {{ amountCents: number, currency: string, solidaritySharePercent: number, interval: "monthly"|"yearly" }} Snapshot v2.
 */
function financialSnapshot(plan) {
  const snapshot = {
    amountCents: Number(plan?.priceCents),
    currency: String(plan?.currency ?? "").trim().toUpperCase(),
    solidaritySharePercent: Number(plan?.solidaritySharePercent),
    interval: assertPlanInterval(plan?.interval),
  };
  if (
    !Number.isInteger(snapshot.amountCents) ||
    snapshot.amountCents < 0 ||
    !/^[A-Z]{3}$/.test(snapshot.currency) ||
    !Number.isFinite(snapshot.solidaritySharePercent) ||
    snapshot.solidaritySharePercent < 0 ||
    snapshot.solidaritySharePercent > 100
  ) {
    throw operationalError("BILLING_PLAN_INVALID", "Plano financeiro inválido.");
  }
  return snapshot;
}

/**
 * Recupera a âncora persistida ou deriva-a do primeiro início conhecido.
 *
 * @param {object} subscription - Subscrição dentro da transação.
 * @returns {{ anchorDay: number, anchorEndOfMonth: boolean }} Âncora estável.
 */
function billingAnchorForSubscription(subscription) {
  if (
    Number.isInteger(subscription.billingAnchorDay) &&
    subscription.billingAnchorDay >= 1 &&
    subscription.billingAnchorDay <= 31 &&
    typeof subscription.billingAnchorEndOfMonth === "boolean"
  ) {
    return {
      anchorDay: subscription.billingAnchorDay,
      anchorEndOfMonth: subscription.billingAnchorEndOfMonth,
    };
  }
  return billingAnchorForDate(subscription.currentPeriodStart);
}

/**
 * Cria o hash estável que protege a reutilização da chave financeira.
 *
 * @param {object} input - Campos canónicos do ciclo.
 * @returns {string} SHA-256 hexadecimal.
 */
function renewalRequestHash(input) {
  return createHash("sha256").update(JSON.stringify(input)).digest("hex");
}

/**
 * Falha se uma escrita perdeu a corrida do ciclo exato.
 *
 * @param {{ matchedCount?: number }} result - Resultado do update MongoDB.
 * @returns {void}
 */
function assertCycleWrite(result) {
  if (result?.matchedCount !== undefined && result.matchedCount !== 1) {
    throw operationalError(
      "SUBSCRIPTION_CYCLE_CONFLICT",
      "O ciclo mudou durante o processamento.",
    );
  }
}

/**
 * Cria o índice idempotente partilhado depois com checkout/trial em MF4-02.
 *
 * @returns {Promise<void>} Termina quando o índice existe.
 */
export async function ensureBillingJobIndexes() {
  const db = await getDb();
  await db.collection("payment_attempts").createIndex(
    { userId: 1, idempotencyKey: 1 },
    {
      unique: true,
      partialFilterExpression: { idempotencyKey: { $type: "string" } },
    },
  );
}

/**
 * Processa exatamente o fim de ciclo indicado dentro de uma transação.
 *
 * @param {string|ObjectId} subscriptionId - ID persistido.
 * @param {Date|string} expectedPeriodEnd - Fim que integra a key do job.
 * @param {{ referenceDate?: Date }} [options] - Relógio injetável.
 * @returns {Promise<{ outcome: string, paymentAttemptId?: string, nextPeriodEnd?: Date }>} Resultado seguro.
 */
export async function processSubscriptionCycle(
  subscriptionId,
  expectedPeriodEnd,
  options = {},
) {
  const id = String(subscriptionId ?? "");
  if (!ObjectId.isValid(id)) {
    throw operationalError("SUBSCRIPTION_ID_INVALID", "Subscrição inválida.");
  }
  const subscriptionObjectId = new ObjectId(id);
  const periodEnd = requiredDate(
    expectedPeriodEnd,
    "SUBSCRIPTION_PERIOD_INVALID",
  );
  const now = options.referenceDate
    ? requiredDate(options.referenceDate, "WORKER_DATE_INVALID")
    : new Date();

  if (periodEnd > now) return { outcome: "not_due" };

  return runInTransaction(async ({ db, session }) => {
    const subscriptions = db.collection("subscriptions");
    const subscription = await subscriptions.findOne(
      { _id: subscriptionObjectId },
      { session },
    );

    const storedPeriodEnd = subscription
      ? requiredDate(subscription.currentPeriodEnd, "SUBSCRIPTION_PERIOD_INVALID")
      : null;
    if (
      !subscription ||
      !["active", "trialing"].includes(subscription.status) ||
      storedPeriodEnd.getTime() !== periodEnd.getTime()
    ) {
      // Outro worker já fechou este ciclo; repetir é um replay seguro.
      return { outcome: "already_processed" };
    }

    const userIdValue = String(subscription.userId ?? "");
    if (!ObjectId.isValid(userIdValue)) {
      throw operationalError("SUBSCRIPTION_USER_INVALID", "Owner inválido.");
    }
    const userId = new ObjectId(userIdValue);
    const exactCycle = {
      _id: subscriptionObjectId,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd,
    };

    if (subscription.status === "trialing" || subscription.planCode === "trial") {
      const result = await subscriptions.updateOne(
        exactCycle,
        { $set: { status: "expired", updatedAt: now } },
        { session },
      );
      assertCycleWrite(result);
      await db.collection("trials").updateMany(
        { userId, status: "active", endsAt: { $lte: now } },
        { $set: { status: "expired", updatedAt: now } },
        { session },
      );
      return { outcome: "trial_expired" };
    }

    if (subscription.cancelAtPeriodEnd === true) {
      const result = await subscriptions.updateOne(
        exactCycle,
        { $set: { status: "canceled", updatedAt: now } },
        { session },
      );
      assertCycleWrite(result);
      return { outcome: "subscription_canceled" };
    }

    const plan = await db.collection("subscription_plans").findOne(
      { code: subscription.planCode, active: true },
      { session },
    );
    if (!plan) {
      throw operationalError("RENEWAL_PLAN_INVALID", "Plano não encontrado.");
    }

    const snapshot = financialSnapshot(plan);
    const decision = decideSimulatedRenewal({ subscription, plan });
    const anchor = billingAnchorForSubscription(subscription);
    const idempotencyKey = `renewal:${id}:${periodEnd.getTime()}`;
    const requestHash = renewalRequestHash({
      operation: "simulated-renewal",
      subscriptionId: id,
      planCode: plan.code,
      periodEnd: periodEnd.toISOString(),
    });
    const attempts = db.collection("payment_attempts");
    const existingAttempt = await attempts.findOne(
      { userId, idempotencyKey },
      { session },
    );
    if (existingAttempt) {
      if (existingAttempt.requestHash !== requestHash) {
        throw operationalError(
          "RENEWAL_IDEMPOTENCY_CONFLICT",
          "A key do ciclo foi usada com outro pedido.",
        );
      }
      // Com transação, ledger existente + ciclo ainda aberto é estado impossível.
      throw operationalError(
        "RENEWAL_PARTIAL_STATE_DETECTED",
        "Foi detetado um estado financeiro parcial.",
      );
    }

    const nextPeriodEnd = decision.status === "approved"
      ? addBillingCycle(periodEnd, snapshot.interval, anchor)
      : null;
    const attemptId = new ObjectId();
    const response = decision.status === "approved"
      ? {
          status: "approved",
          renewal: {
            subscriptionId: id,
            currentPeriodStart: periodEnd,
            currentPeriodEnd: nextPeriodEnd,
          },
        }
      : { status: "failed", message: decision.failureReason };

    await attempts.insertOne(
      {
        _id: attemptId,
        schemaVersion: 2,
        operation: "simulated-renewal",
        userId,
        planCode: plan.code,
        paymentMethod: "renewal_simulated",
        provider: decision.provider,
        status: decision.status,
        failureReason: decision.failureReason,
        ...snapshot,
        approvedAt: decision.status === "approved" ? now : null,
        cycle: { startsAt: periodEnd, endsAt: nextPeriodEnd },
        accountingEstimate: false,
        idempotencyKey,
        requestHash,
        response,
        createdAt: now,
        updatedAt: now,
      },
      { session },
    );

    if (decision.status === "failed") {
      const result = await subscriptions.updateOne(
        exactCycle,
        { $set: { status: "past_due", updatedAt: now } },
        { session },
      );
      assertCycleWrite(result);
      return { outcome: "renewal_failed", paymentAttemptId: String(attemptId) };
    }

    const result = await subscriptions.updateOne(
      exactCycle,
      {
        $set: {
          status: "active",
          currentPeriodStart: periodEnd,
          currentPeriodEnd: nextPeriodEnd,
          billingAnchorDay: anchor.anchorDay,
          billingAnchorEndOfMonth: anchor.anchorEndOfMonth,
          updatedAt: now,
        },
      },
      { session },
    );
    assertCycleWrite(result);
    return {
      outcome: "renewed",
      paymentAttemptId: String(attemptId),
      nextPeriodEnd,
    };
  });
}

/**
 * Descobre ciclos vencidos e reclama no máximo 100 jobs por passagem.
 *
 * @param {{ ownerId: string, referenceDate?: Date, leaseMs?: number, retryMs?: number, limit?: number }} input - Contexto do worker.
 * @returns {Promise<{ discovered: number, claimed: number, completed: number, failed: number, leaseLost: number, outcomes: string[] }>} Resumo observável.
 */
export async function runDueSubscriptionJobs(input) {
  const db = await getDb();
  const now = input.referenceDate
    ? requiredDate(input.referenceDate, "WORKER_DATE_INVALID")
    : new Date();
  const requestedLimit = Number(input.limit ?? MAX_SUBSCRIPTIONS_PER_CYCLE);
  if (!Number.isInteger(requestedLimit) || requestedLimit < 1) {
    throw operationalError("WORKER_LIMIT_INVALID", "Limite do worker inválido.");
  }
  const limit = Math.min(requestedLimit, MAX_SUBSCRIPTIONS_PER_CYCLE);
  const retryMs = retryDelayMs(input.retryMs);
  const dueSubscriptions = await db.collection("subscriptions")
    .find({
      status: { $in: ["active", "trialing"] },
      currentPeriodEnd: { $lte: now },
    })
    .sort({ currentPeriodEnd: 1, _id: 1 })
    .limit(limit)
    .toArray();
  const summary = {
    discovered: dueSubscriptions.length,
    claimed: 0,
    completed: 0,
    failed: 0,
    leaseLost: 0,
    outcomes: [],
  };

  for (const subscription of dueSubscriptions) {
    let key;
    let claimed;
    try {
      key = subscriptionCycleJobKey(subscription);
      await registerScheduledJob({
        key,
        type: "subscription_cycle",
        nextRunAt: requiredDate(
          subscription.currentPeriodEnd,
          "SUBSCRIPTION_PERIOD_INVALID",
        ),
        db,
      });
      claimed = await claimScheduledJob({
        key,
        ownerId: input.ownerId,
        leaseMs: input.leaseMs ?? DEFAULT_LEASE_MS,
        now,
        db,
      });
    } catch {
      // Um documento malformado não impede o processamento dos restantes.
      summary.failed += 1;
      summary.outcomes.push("discovery_failed");
      continue;
    }
    if (!claimed) continue;
    summary.claimed += 1;

    try {
      const cycle = await processSubscriptionCycle(
        subscription._id,
        subscription.currentPeriodEnd,
        { referenceDate: now },
      );
      const completed = await completeScheduledJob({
        key,
        ownerId: input.ownerId,
        now,
        db,
      });
      if (!completed) {
        throw operationalError("JOB_LEASE_LOST", "O lease mudou de owner.");
      }
      summary.completed += 1;
      summary.outcomes.push(cycle.outcome);
    } catch (error) {
      summary.failed += 1;
      const failedByOwner = await failScheduledJob({
        key,
        ownerId: input.ownerId,
        retryAt: new Date(now.getTime() + retryMs),
        errorCode: error?.code ?? "SUBSCRIPTION_JOB_FAILED",
        now,
        db,
      });
      if (!failedByOwner) summary.leaseLost += 1;
    }
  }

  return summary;
}

/**
 * Executa uma passagem extensível; MF4-05 acrescentará aqui a pool mensal.
 *
 * @param {{ ownerId: string, referenceDate?: Date }} input - Contexto do worker.
 * @returns {Promise<{ subscriptions: object }>} Resultado desta baseline.
 */
export async function runBillingWorkerCycle(input) {
  return { subscriptions: await runDueSubscriptionJobs(input) };
}
```

Por fim, cria `backend/src/worker.js`. O sinal de shutdown cancela apenas a
próxima espera: um ciclo já iniciado termina, os listeners são removidos e a
ligação MongoDB fecha uma única vez.

```js
/**
 * Processo separado para os jobs financeiros locais da FaithFlix.
 */
import { randomUUID } from "node:crypto";
import { hostname } from "node:os";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
  assertTransactionSupport,
  closeDatabase,
} from "./config/database.js";
import {
  ensureBillingJobIndexes,
  runBillingWorkerCycle,
} from "./modules/jobs/billing-jobs.service.js";
import { ensureScheduledJobIndexes } from "./modules/jobs/scheduled-jobs.service.js";
import { ensureSubscriptionIndexes } from "./modules/subscriptions/subscriptions.service.js";
import { logger } from "./utils/logger.js";

const DEFAULT_POLL_MS = 60_000;
const MIN_POLL_MS = 10_000;
const MAX_POLL_MS = 60 * 60_000;

/**
 * Lê o intervalo sem permitir busy loop ou uma pausa operacional oculta.
 *
 * @param {unknown} value - `WORKER_POLL_MS` opcional.
 * @returns {number} Intervalo validado.
 */
export function workerPollMs(value) {
  if (value === undefined || value === "") return DEFAULT_POLL_MS;
  const parsed = Number(value);
  if (
    !Number.isInteger(parsed) ||
    parsed < MIN_POLL_MS ||
    parsed > MAX_POLL_MS
  ) {
    const error = new Error("WORKER_POLL_MS inválido.");
    error.code = "WORKER_POLL_INVALID";
    throw error;
  }
  return parsed;
}

/**
 * Espera pelo próximo ciclo e liberta imediatamente no shutdown.
 *
 * @param {number} milliseconds - Duração da espera.
 * @param {AbortSignal} signal - Sinal do worker.
 * @returns {Promise<void>} Espera concluída ou cancelada.
 */
export function waitForNextCycle(milliseconds, signal) {
  return new Promise((resolveWait) => {
    if (signal.aborted) return resolveWait();
    let settled = false;
    let timeout;
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      signal.removeEventListener("abort", finish);
      resolveWait();
    };
    timeout = setTimeout(finish, milliseconds);
    timeout.unref?.();
    signal.addEventListener("abort", finish, { once: true });
  });
}

/**
 * Exige topologia transacional e todos os índices antes do primeiro claim.
 *
 * @returns {Promise<void>} Worker pronto.
 */
async function prepareWorker() {
  // Jobs financeiros nunca degradam silenciosamente para MongoDB standalone.
  await assertTransactionSupport({ required: true });
  await ensureScheduledJobIndexes();
  await ensureSubscriptionIndexes();
  await ensureBillingJobIndexes();
}

/**
 * Arranca o loop e só resolve depois de shutdown e fecho da base de dados.
 *
 * @param {{ processTarget?: NodeJS.Process, log?: typeof logger, prepare?: () => Promise<void>, runCycle?: (input: { ownerId: string }) => Promise<object>, closeDb?: () => Promise<void>, ownerId?: string, pollMs?: number }} [options] - Dependências injetáveis para unitários.
 * @returns {Promise<void>} Termina no shutdown.
 */
export async function runWorker(options = {}) {
  const processTarget = options.processTarget ?? process;
  const log = options.log ?? logger;
  const prepare = options.prepare ?? prepareWorker;
  const runCycle = options.runCycle ?? runBillingWorkerCycle;
  const closeDb = options.closeDb ?? closeDatabase;
  const ownerId = options.ownerId ??
    `${hostname()}:${process.pid}:${randomUUID()}`.slice(0, 128);
  const pollMs = options.pollMs ?? workerPollMs(process.env.WORKER_POLL_MS);
  const controller = new AbortController();
  let shutdownRequested = false;

  const requestShutdown = (signal) => {
    if (shutdownRequested) return;
    shutdownRequested = true;
    log.info("worker_shutdown_requested", { signal });
    controller.abort();
  };
  const signalHandlers = new Map(
    ["SIGTERM", "SIGINT"].map((signal) => [
      signal,
      () => requestShutdown(signal),
    ]),
  );
  for (const [signal, handler] of signalHandlers) {
    processTarget.on(signal, handler);
  }

  try {
    await prepare();
    log.info("worker_started", { pollMs });
    while (!controller.signal.aborted) {
      try {
        const result = await runCycle({ ownerId });
        log.info("worker_cycle_completed", {
          subscriptionJobs: result?.subscriptions,
        });
      } catch (error) {
        // Logs operacionais recebem apenas um código, nunca stack ou URI MongoDB.
        log.error("worker_cycle_failed", {
          code: error?.code ?? "WORKER_CYCLE_FAILED",
        });
      }
      await waitForNextCycle(pollMs, controller.signal);
    }
  } finally {
    for (const [signal, handler] of signalHandlers) {
      processTarget.off(signal, handler);
    }
    await closeDb();
    log.info("worker_stopped");
  }
}

/**
 * Impede que importar o módulo num teste arranque o loop.
 *
 * @returns {boolean} `true` apenas em `node src/worker.js`.
 */
function isMainModule() {
  if (!process.argv[1]) return false;
  return import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
}

if (isMainModule()) {
  runWorker().catch((error) => {
    logger.error("worker_startup_failed", {
      code: error?.code ?? "WORKER_STARTUP_FAILED",
    });
    process.exitCode = 1;
  });
}
```

5. Explicação do código ou da decisão.

O service cria os planos base, impede duplicação por utilizador e persiste a
âncora que distingue “dia 30” de “último dia do mês”. `scheduled_jobs.key` e o
índice financeiro por `userId + idempotencyKey` tornam cada ciclo uma unidade
única. O claim é um compare-and-set: antes do timeout só existe um owner; depois
do timeout outro worker pode fazer lease takeover, e o owner antigo deixa de
conseguir executar `complete` ou `fail`. Mesmo sem takeover, um owner com
`leaseExpiresAt <= now` já não pode fechar nem reagendar o job; `now` continua
injetável para tornar a fronteira temporal determinística nos testes.

Trial, cancelamento, tentativa financeira e mudança de período partilham a
mesma `runInTransaction`. A percentagem solidária fica congelada no ledger v2;
a pool de `BK-MF4-05` consumirá esse snapshot e não o preço futuro do plano.
Uma renovação simulada recusada é um resultado de domínio concluído: bloqueia
acesso em `past_due`, persiste uma única tentativa v2 e completa a key da
renovação. `past_due` permanece suspenso; não existe transição automática para
`expired` sem uma regra futura explícita em RF. Um erro operacional sem commit,
pelo contrário, mantém o job `failed` e usa `retryAt` na mesma key.
`renewActiveSubscription` é apenas um wrapper transacional/idempotente para
testes internos e nunca é endpoint; o caminho operacional automático é
exclusivamente `runDueSubscriptionJobs`, com lease. `expireOverdueSubscriptions`
delega nesse caminho operacional. O adapter é deliberadamente simulado,
determinístico e local: não prova gateway, webhook ou `RNF24`.

6. Validação do passo.

Primeiro valida apenas sintaxe/imports, sem arrancar o loop nem ligar à base:

```bash
node --check src/modules/subscriptions/subscriptions.service.js
node --check src/modules/jobs/scheduled-jobs.service.js
node --check src/modules/jobs/renewal-adapter.js
node --check src/modules/jobs/billing-jobs.service.js
node --check src/worker.js
node -e "Promise.all([import('./src/modules/jobs/scheduled-jobs.service.js'), import('./src/modules/jobs/billing-jobs.service.js'), import('./src/worker.js')]).then(([leases, billing, worker]) => console.log(typeof leases.claimScheduledJob, typeof billing.processSubscriptionCycle, typeof worker.runWorker))"
```

Depois cria testes `node:test` com doubles locais e uma integração separada num
replica set dedicado. A integração usa exclusivamente uma DB nova terminada em
`_e2e`; não reutiliza a DB normal nem executa `deleteMany` sem um marker próprio.
Estes casos são obrigatórios e não podem ser marcados `PASS` apenas por existir
o snippet:

| ID | Preparação | Assert obrigatório |
| --- | --- | --- |
| `WORKER-DUPLICATE-01` | Dois `registerScheduledJob` simultâneos com a mesma key. | Existe um único documento; o perdedor aceita apenas `E11000` e não altera `nextRunAt`. |
| `WORKER-TAKEOVER-01` | Owner A reclama em `T0`; owner B tenta antes e depois de `leaseExpiresAt`. | B recebe `null` antes do prazo, reclama depois; `complete/fail` de A devolvem `false` e apenas B conclui. |
| `WORKER-EXPIRED-OWNER-01` | Owner A reclama em `T0`; o relógio injetado avança para `leaseExpiresAt` sem owner B fazer takeover. | `complete/fail` de A devolvem `false`; o job permanece `running` com lease expirado e pode ser reclamado por outro owner. |
| `WORKER-RETRY-01` | `processSubscriptionCycle` falha com código controlado. | Job fica `failed`, sem stack/mensagem interna, não é reclamado antes de `retryAt` e pode ser reclamado no instante do retry. |
| `WORKER-CYCLE-01` | Dois workers observam a mesma subscrição ativa vencida e renovação `approved`. | Um único ledger v2, um único avanço de ciclo e replay `already_processed`/claim recusado no concorrente. |
| `WORKER-CYCLE-02` | Trial vencido e respetivo documento `trials` ativo. | Ambos passam a `expired` na mesma transação; repetir não produz nova escrita financeira. |
| `WORKER-CYCLE-03` | Cancelamento agendado e renovação simulada `failed`, em subscrições diferentes. | Cancelamento termina em `canceled` sem pagamento; falha termina em `past_due` com uma tentativa v2. |
| `WORKER-EOM-01` | Âncoras 30 e fim de mês em janeiro de 2024. | Dia 30 percorre `30/01 -> 29/02 -> 30/03`; EOM percorre `31/01 -> 29/02 -> 31/03`. |
| `WORKER-SHUTDOWN-01` | Emitir `SIGTERM` durante uma Promise de ciclo ainda pendente. | O ciclo termina, a espera seguinte é cancelada, listeners saem e `closeDatabase` ocorre uma única vez. |

7. Caso negativo, erro comum ou risco que este passo evita.

Nunca faças `findOne()` seguido de `updateOne()` sem o filtro de lease: dois
workers poderiam cobrar ou avançar o mesmo ciclo. Nunca completes um job apenas
por `key`; exige `status: "running"` e o mesmo `leaseOwner`. Não guardes
`error.message`, stack, URI ou argumentos do processo em `lastErrorCode`.
Não uses `failScheduledJob` para uma renovação simulada recusada: essa recusa é
um resultado financeiro persistido que deixa a subscrição em `past_due`; retry
serve apenas para falha operacional sem commit de domínio.
Finalmente, não acrescentes aqui o job mensal da pool: isso duplicaria o
contrato autoritativo de `BK-MF4-05`.

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
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import {
  getMySubscriptionController,
  getPlans,
  postCancelRenewal,
} from "./subscriptions.controller.js";

export const subscriptionsRouter = Router();

subscriptionsRouter.get("/plans", asyncHandler(getPlans));
// A ordem mantém `/plans` público e coloca ownership apenas nos endpoints pessoais.
subscriptionsRouter.get("/me", requireAuth, asyncHandler(getMySubscriptionController));
subscriptionsRouter.post("/me/cancel-renewal", requireAuth, asyncHandler(postCancelRenewal));
```

Trecho esperado em `backend/src/app.js`:

```js
import { subscriptionsRouter } from "./modules/subscriptions/subscriptions.routes.js";

app.use("/api/subscriptions", subscriptionsRouter);
```

Trecho esperado em `backend/src/server.js`:

```js
import { ensureBillingJobIndexes } from "./modules/jobs/billing-jobs.service.js";
import { ensureScheduledJobIndexes } from "./modules/jobs/scheduled-jobs.service.js";
import { ensureSubscriptionIndexes } from "./modules/subscriptions/subscriptions.service.js";

// A API e o worker convergem nos mesmos índices; criar um deles não substitui os restantes.
await ensureScheduledJobIndexes();
await ensureSubscriptionIndexes();
await ensureBillingJobIndexes();
```

5. Explicação do código ou da decisão.

`GET /plans` é público porque qualquer visitante pode ver ofertas. As rotas `/me`
exigem login e usam ownership por sessão. API e worker garantem os mesmos
índices idempotentes antes de processar ciclos. Não montes
`POST /api/subscriptions/me`: a ativação paga só pode acontecer depois de
checkout simulado aprovado em `BK-MF4-02`.

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

Permitir ao utilizador ver planos e cancelar renovação. A ação de compra é acrescentada no `BK-MF4-02`, já com checkout idempotente.

2. Ficheiros envolvidos.
    - CRIAR: `frontend/src/services/api/subscriptionsApi.js`
    - CRIAR: `frontend/src/pages/SubscriptionPage.jsx`
    - EDITAR: `frontend/src/routes/AppRoutes.jsx`
    - LOCALIZACAO: ficheiros completos novos, declaração lazy e rota `/planos`

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
            <p>A compra segura deste plano é acrescentada no BK-MF4-02.</p>
          </article>
        ))}
      </section>
    </main>
  );
}
```

Em `frontend/src/routes/AppRoutes.jsx`, acrescenta a declaração lazy uma única
vez e substitui apenas o elemento da rota `/planos` criada em `BK-MF1-02`:

```jsx
// ADICIONAR junto das restantes declarações lazy de páginas.
const SubscriptionPage = lazyNamedPage(
  () => import("../pages/SubscriptionPage.jsx"),
  "SubscriptionPage",
);

// SUBSTITUIR apenas o element de /planos; manter o router e as restantes rotas.
<Route path="/planos" element={<SubscriptionPage />} />
```

5. Explicação do código ou da decisão.

O cliente API centraliza as chamadas. A página não envia `userId`, mostra mensagens claras e deixa visível a parte solidária do plano. A composição preserva o URL público `/planos`, acrescenta uma única declaração lazy e não reconstrói `AppRoutes`.

6. Validação do passo.

Abrir `/planos`, confirmar planos, consultar o estado autenticado e cancelar a renovação de uma subscrição preparada por fixture segura.

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
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireActiveSubscription } from "../subscriptions/subscription-access.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import {
  getContinueWatching,
  getPlaybackByContent,
  getPlaybackPreferences,
  putPlaybackProgress,
  putPlaybackPreferences,
} from "./playback.controller.js";

export const playbackRouter = Router();

// As rotas fixas herdadas da MF2 ficam antes de `/:contentId`; preferências não exigem entitlement premium.
playbackRouter.use(requireAuth);
playbackRouter.get("/preferences", asyncHandler(getPlaybackPreferences));
playbackRouter.put("/preferences", asyncHandler(putPlaybackPreferences));
playbackRouter.get("/me/continue-watching", asyncHandler(getContinueWatching));
playbackRouter.get("/:contentId", requireActiveSubscription, asyncHandler(getPlaybackByContent));
playbackRouter.put("/:contentId/progress", requireActiveSubscription, asyncHandler(putPlaybackProgress));
```

5. Explicação do código ou da decisão.

O `requireAuth` confirma quem e o utilizador. O `requireActiveSubscription` confirma se esse utilizador pode ver conteúdo premium. Esta separacao evita misturar autenticação com autorização de subscrição. As rotas fixas `/preferences` e `/me/continue-watching` permanecem autenticadas e aparecem antes de `/:contentId`; playback e escrita de progresso passam a exigir acesso premium.

6. Validação do passo.

```bash
curl -i -b /tmp/faithflix.cookies http://localhost:3000/api/playback/CONTENT_ID
```

Resultado esperado: utilizador autenticado sem subscrição ativa recebe `403`; utilizador com subscrição ativa recebe `200`.

7. Caso negativo, erro comum ou risco que este passo evita.

Sem este middleware, `hasPremiumAccess` seria apenas um valor mostrado na UI e não uma regra de seguranca aplicada pelo backend.

#### Critérios de aceite

- `GET /api/subscriptions/plans` devolve `200` e pelo menos dois planos ativos.
- `POST /api/subscriptions/me` não existe; subscrição paga nasce apenas em checkout aprovado do `BK-MF4-02`.
- O worker só processa `currentPeriodEnd <= now`, usa uma chave por subscrição/ciclo e nunca renova antecipadamente.
- `scheduled_jobs.key` é única; claim/takeover são atómicos e `complete`/`fail`
  exigem o mesmo `leaseOwner` que detém o estado `running`.
- Falhas libertam o lease para um `retryAt` futuro e guardam apenas um código
  sanitizado; repetir registo, claim ou ciclo não duplica trabalho.
- Renovação aprovada avança o ciclo; falha passa a `past_due`; cancelamento agendado passa a `canceled`; trial vencido passa a `expired`.
- `past_due` bloqueia acesso e permanece suspenso; o worker não inventa uma
  expiração automática que não esteja definida em RF.
- Renovação aprovada ou falhada grava exatamente uma tentativa financeira v2
  por `userId + idempotencyKey`, na mesma transação da subscrição.
- `addBillingCycle` preserva a âncora UTC, distinguindo dia 30 de fim de mês e
  cobrindo 31 de janeiro e anos bissextos.
- `GET /api/subscriptions/me` devolve `hasPremiumAccess: true` apenas para
  `active` ou `trialing` ainda dentro do período.
- Sem login, endpoints `/me` devolvem `401`.
- `GET /api/playback/:contentId` devolve `403` quando a subscrição esta `past_due`, `expired`, `canceled` ou fora do período.
- Pelo menos 3 negativos documentados: plano inexistente, utilizador sem login e acesso premium com subscrição bloqueada.
- A UI cancela leituras/mutações no unmount, confirma o cancelamento da renovação
  e só apresenta o estado devolvido pelo backend.

#### Validação final

```bash
cd backend
npm test
node --check src/modules/jobs/scheduled-jobs.service.js
node --check src/modules/jobs/billing-jobs.service.js
node --check src/worker.js
curl -i http://localhost:3000/api/subscriptions/plans
curl -i -b /tmp/faithflix.cookies http://localhost:3000/api/playback/CONTENT_ID
```

Resultado esperado: testes unitários e os negativos `WORKER-*` passam; os três
ficheiros têm sintaxe válida; planos respondem `200`, pedidos privados sem
cookie respondem `401` e playback sem subscrição ativa responde `403`. A prova
de concorrência transacional só pode ser promovida depois de correr num replica
set isolado; doubles locais não fecham esse risco.

#### Evidence para PR/defesa

- `pr`: commit/PR com `subscriptions`, os três services de jobs, `worker.js` e página `/planos`.
- `proof`: captura da página, resposta de `/api/subscriptions/me`, um ciclo
  renovado com uma única tentativa v2 e shutdown limpo do worker.
- `neg`: `401` sem login, plano inválido, subscrição bloqueada, duplicate key,
  lease takeover com owner antigo recusado, retry e replay do mesmo ciclo sem
  segundo pagamento.

#### Handoff

O `BK-MF4-02` deve reutilizar internamente `subscription_plans`, `subscriptions`,
`activateSubscription`, `getMySubscription`, `hasActiveSubscriptionAccess` e o
índice idempotente do ledger v2. O trial encaixa no mesmo contrato e o worker
fecha-o como `expired`; não existe ativação direta nem armazenamento de cartão.
O `BK-MF4-05` edita `runBillingWorkerCycle` para acrescentar o job mensal da
pool sobre snapshots aprovados, sem criar outro worker, outro lease service ou
um segundo caminho de renovação.

## Snippet técnico aplicável

```js
// A listagem é pública; a subscrição paga só nasce no checkout autenticado do BK-MF4-02.
subscriptionsRouter.get("/plans", asyncHandler(getPlans));
```

#### Changelog

- `2026-06-13`: guia reescrito com contratos de planos, subscrições, endpoints, frontend, ownership e validação.
- `2026-07-10`: removida a ativação HTTP direta; ciclos EOM, worker com lease e estados de renovação/expiração foram alinhados com a correção end-to-end.
- `2026-07-10`: `SubscriptionPage` sincronizada com abort/anti-stale, busy state,
  confirmação da renovação e rótulos PT-PT.
- `2026-07-10`: publicados os quatro ficheiros completos de jobs/worker, índices,
  lease takeover, retry, idempotência por ciclo, adapter simulado, shutdown e
  matriz negativa; a pool mensal permanece exclusivamente em `BK-MF4-05`.
