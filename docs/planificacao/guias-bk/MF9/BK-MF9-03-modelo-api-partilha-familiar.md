# BK-MF9-03 - Modelo e API de partilha familiar

## Header

- `doc_id`: `GUIA-BK-MF9-03`
- `bk_id`: `BK-MF9-03`
- `macro`: `MF9`
- `owner`: `Matheus`
- `apoio`: `Kaue`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `L`
- `dependencias`: `BK-MF9-01,BK-MF2-01`
- `rf_rnf`: `RF62, RNF13, RNF15, RNF16, RNF19`
- `fase_documental`: `Fase 3`
- `sprint`: `S13`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF9-04`
- `guia_path`: `docs/planificacao/guias-bk/MF9/BK-MF9-03-modelo-api-partilha-familiar.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais criar a partilha familiar real entre contas existentes. Um owner com plano Família ativo convida uma conta FaithFlix, o membro aceita dentro da app e ganha acesso premium enquanto o owner mantiver o plano Família ativo.

O resultado observável é uma API autenticada em `/api/subscriptions/family/*`, uma coleção `subscription_family_memberships` e uma função de acesso efetivo que distingue acesso próprio, acesso familiar e ausência de acesso.

#### Importância

`RF62` mexe em autorização, ownership, privacidade e ciclo de vida de subscrições. Não basta escrever "partilha familiar" na UI: o backend tem de provar quem é o owner, quem é o membro, se o plano ainda permite Família e se o membro não está em duas famílias abertas ao mesmo tempo.

Este BK também protege `RNF15` e `RNF16`: todas as ações usam sessão autenticada e validação no backend. O frontend nunca envia `ownerUserId` como autoridade; o owner vem de `req.user.id`.

#### Scope-in

- Criar índices para `subscription_family_memberships`.
- Criar overview familiar do utilizador autenticado.
- Criar convite por email de conta existente.
- Aceitar, recusar, remover e sair da partilha.
- Bloquear owner sem plano Família, convite para a própria conta, membro com subscrição paga ativa e membership duplicada.
- Contar o owner no limite e serializar convites/aceites concorrentes antes de recontar lugares.
- Executar convite, aceite, recusa, remoção/saída e notificações aplicáveis em transações.
- Integrar partilha familiar em `getEffectiveSubscriptionAccess` e `hasActiveSubscriptionAccess`.
- Criar testes unitários de fluxo positivo e negativos principais.

#### Scope-out

- Envio externo de email.
- Links públicos de convite.
- Perfis infantis e regras parentais avançadas.
- UI de gestão familiar; fica para `BK-MF9-04`.
- Relatórios de privacidade e métricas; ficam para `BK-MF9-05`.

#### Estado antes e depois

- Antes: o acesso premium depende apenas da subscrição própria do utilizador.
- Depois: o acesso premium pode vir de subscrição própria ou de membership familiar ativa cujo owner tem plano Família ativo.

#### Pré-requisitos

- `BK-MF9-01` completo, com planos Família, `familySharing` e `maxFamilyMembers`.
- `BK-MF2-01` completo, com utilizadores, sessão segura e `requireAuth`.
- `BK-MF9-02` completo, porque o player já consome `getEffectiveSubscriptionAccess`.
- `runInTransaction` configurado sobre MongoDB com suporte transacional
  (`replica set`, Atlas ou cluster `sharded` compatível); `standalone` não prova
  a atomicidade deste BK.
- Ler `RF62`, `RNF13`, `RNF15`, `RNF16` e `RNF19`.
- Rever `backend/src/modules/subscriptions/subscriptions.service.js`.
- Rever `backend/src/modules/subscriptions/subscriptions.controller.js`.
- Rever `backend/src/modules/subscriptions/subscriptions.routes.js`.
- Rever `backend/src/middlewares/auth.middleware.js`.
- Rever `backend/src/modules/notifications/notifications.service.js`.

#### Glossário

- `Owner`: utilizador que tem a subscrição Família paga.
- `Member`: conta convidada para usar a partilha.
- `Membership`: documento que liga owner, membro, subscrição e estado.
- `Pending`: convite criado e ainda não aceite.
- `Active`: membership aceite e válida.
- `Acesso efetivo`: resultado final que diz se o utilizador tem acesso premium por conta própria, por Família ou se não tem acesso.

#### Conceitos teóricos essenciais

- `CANONICO`: `RF62` exige contas reais existentes, owner com plano Família ativo e bloqueio de múltiplas famílias ativas por membro.
- Ownership significa que o backend usa a sessão para decidir quem atua. O frontend não envia `ownerUserId` para se tornar owner.
- Uma membership pendente ainda não dá acesso premium. Só `active` pode contribuir para acesso.
- Um membro com subscrição paga ativa não deve aceitar partilha, porque isso mistura ciclos de pagamento e origem de acesso.
- `DERIVADO`: os estados `pending`, `active`, `declined`, `removed` e `left` cobrem o ciclo mínimo sem apagar histórico.
- Acesso efetivo deve ser centralizado para que playback, subscrição, privacidade e gate usem a mesma resposta.
- Um índice único parcial é uma proteção de dados: mesmo que duas requests cheguem ao mesmo tempo, a base de dados impede que o mesmo membro fique em duas famílias abertas.
- O índice por membro não resolve sozinho o limite por owner. Convite e aceite escrevem a subscrição do owner (`familyVersion`) antes da recontagem; um write conflict faz retry da transação completa.
- `maxFamilyMembers` inclui o owner. Estados `pending` e `active` ocupam lugar; `seatsUsed = 1 + memberships abertas`.
- Testes negativos são parte da funcionalidade. Neste BK, provar que o owner Pro falha é tão importante como provar que o owner Família consegue convidar.

#### Arquitetura do BK

| Camada | Artefacto | Responsabilidade |
| --- | --- | --- |
| Dados | `subscription_family_memberships` | Guarda owner, membro, estado, datas e subscrição associada. |
| Service | `backend/src/modules/subscriptions/subscriptions.service.js` | Implementa overview, convite, aceitação, recusa, remoção, saída e acesso efetivo. |
| Controller | `backend/src/modules/subscriptions/subscriptions.controller.js` | Traduz pedidos HTTP para chamadas autenticadas ao service. |
| Rotas | `backend/src/modules/subscriptions/subscriptions.routes.js` | Expõe rotas `/family` protegidas por `requireAuth`, preservando `/plans`, `/me` e `/me/cancel-renewal`. |
| Notificações | `backend/src/modules/notifications/notifications.service.js` | Regista notificações internas de convite, aceite e remoção. |
| Lock partilhado | `backend/src/modules/subscriptions/billing-customer-lock.service.js` | Serializa checkout/trial e mutações Família sobre as mesmas contas. |
| Testes | `backend/tests/unit/mf9-subscriptions.test.js` | Prova fluxo positivo e negativos de segurança. |
| Handoff | `BK-MF9-04` | Usa a API familiar para construir UI. |

##### Contrato vinculativo de concorrência e atomicidade (2026-07-10)

- `inviteFamilyMember` e `acceptFamilyInvitation` executam em `runInTransaction`, reclamam a subscrição ativa do owner antes da contagem e repetem a unidade completa em erro transiente.
- A validação do limite usa `1 + openMembershipCount`; o `1` é o owner. Um convite `pending` já reserva lugar.
- O índice parcial único por `memberUserId` nos estados `pending|active` continua obrigatório e converte corridas duplicadas num `409` seguro.
- Convite/membership e notificação usam o mesmo `{ db, session }`; fault injection depois de uma escrita não pode deixar efeitos parciais.
- O overview devolvido por convidar/aceitar/recusar/remover/sair é construído
  dentro da mesma callback transacional, com `buildFamilyOverview(db, userId,
  session)`. Nunca se confirma a mutação e só depois se chama
  `getFamilyOverview`, porque uma falha dessa leitura criaria sucesso ambíguo.
- Aceitar revalida owner, subscrição paga do membro, duplicação e limite dentro da mesma transação. Recusar, remover e sair também usam transação e filtros de estado esperados.
- Quando a subscrição do owner passa a `past_due` ou `canceled`, as memberships `pending|active` são fechadas na mesma transação do ciclo.
- O acesso familiar revalida também a conta do owner. Apenas `active` ou legacy
  sem `accountStatus` mantém acesso; bloqueio, eliminação, inatividade ou estado
  desconhecido falham fechado mesmo que a subscrição ainda tenha data futura.
- Os blocos de service dos Passos 3 a 5 abaixo já seguem o contrato transacional
  canónico. Não os substituas por variantes com `getDb()` dentro da mutação,
  `session` indefinida, overview depois do commit ou `Promise.all` na transação.
- A prova atual é local com doubles/fault injection; não constitui execução num replica set MongoDB real.
- O cliente frontend passa `AbortSignal` em listar/convidar/aceitar/recusar/
  remover/sair. A UI recarrega o overview canónico depois de cada resposta e
  nunca aplica permissões familiares por cálculo local.
- Recusar convite, remover membro e sair da família exigem confirmação explícita;
  cancelar não chama a API. Aceitar continua uma ação positiva direta.
- Uma reserva síncrona e busy state impedem mutações familiares sobrepostas;
  unmount cancela pedidos e respostas antigas não alteram a página.
- Estados técnicos `pending`, `active` e `removed` são apresentados como
  `Convite pendente`, `Membro ativo` e `Removido`; estado desconhecido usa
  `Estado indisponível`.

#### Ficheiros a criar/editar/rever

- EDITAR: `backend/src/modules/subscriptions/subscriptions.service.js`
- CRIAR: `backend/src/modules/subscriptions/billing-customer-lock.service.js`
- EDITAR: `backend/src/modules/payments/payments.service.js`
- EDITAR: `backend/src/modules/jobs/billing-jobs.service.js`
- EDITAR: `backend/src/modules/subscriptions/subscriptions.controller.js`
- EDITAR: `backend/src/modules/subscriptions/subscriptions.routes.js`
- REVER: `backend/src/middlewares/auth.middleware.js`
- REVER: `backend/src/modules/notifications/notifications.service.js`
- CRIAR/EDITAR: `backend/tests/unit/mf9-subscriptions.test.js`

#### Tutorial técnico linear

### Passo 1 - Criar índices e contrato da membership

1. Objetivo funcional do passo no contexto da app.

Preparar a coleção que impede duplicação de memberships abertas para o mesmo membro.

2. Ficheiros envolvidos:
    - EDITAR: `backend/src/modules/subscriptions/subscriptions.service.js`
    - CRIAR: `backend/src/modules/subscriptions/billing-customer-lock.service.js`
    - EDITAR: `backend/src/modules/payments/payments.service.js`
    - LOCALIZAÇÃO: foundation do service, lock partilhado e função completa `ensureSubscriptionIndexes`.

3. Instruções do que fazer.

Começa pela foundation completa abaixo, antes de qualquer uso nos passos
seguintes. Reutiliza `ENTITLEMENTS`, `DEFAULT_PLANS` e `entitlementsForPlan` do
`BK-MF9-01`; não os voltes a declarar. Importa `getDb`/`runInTransaction` da
foundation MF1, `ObjectId` do driver oficial, `assertValidEmail` do MF2 e
`createNotification` do MF4.

Cria também o lock de cliente partilhado. As funções completas de checkout e
trial continuam a ser as do `BK-MF4-02`: apenas importam
`serializeBillingCustomer` e chamam-no dentro da sua callback
`runInTransaction`. No checkout, a chamada fica depois do replay idempotente e
da validação do plano, mas antes da primeira escrita; no trial, antes de ler ou
criar o trial. Mantém `Idempotency-Key`, `requestHash` e o resultado de replay
sem qualquer alteração.

Por fim, cria índices por owner, member e member aberto. O índice parcial por
`memberUserId` protege `pending` e `active`; os índices do `BK-MF9-01` continuam
presentes.

Antes de usar notificações Family, estende cumulativamente a allowlist de MF4
em `backend/src/modules/notifications/notifications.validation.js`. Substitui
apenas a constante anterior por esta lista completa; conserva o mesmo
`assertNotificationType`, que rejeita tudo o que não pertença exatamente à
allowlist:

```js
export const NOTIFICATION_TYPES = Object.freeze([
  // Preserva os eventos MF4 e acrescenta apenas o vocabulário Family fechado.
  "subscription_activated",
  "payment_failed",
  "trial_started",
  "continue_watching",
  "family_invitation",
  "family_invitation_accepted",
  "family_member_removed",
]);
```

4. Código completo da foundation e dos índices deste passo.

Cria primeiro o ponto de serialização que billing e Família passam a partilhar:

```js
// backend/src/modules/subscriptions/billing-customer-lock.service.js
/**
 * Cria um erro público e estável para contas indisponíveis.
 *
 * @returns {Error} Erro HTTP sem dados pessoais.
 */
function accountUnavailableError() {
  const error = new Error("Conta indisponível para operações de billing.");
  error.statusCode = 409;
  error.code = "ACCOUNT_NOT_AVAILABLE";
  return error;
}

/**
 * Serializa operações de billing e Família sobre as mesmas contas.
 *
 * @param {{
 *   db: import("mongodb").Db,
 *   userIds: import("mongodb").ObjectId[],
 *   now: Date,
 *   session: import("mongodb").ClientSession
 * }} input Contexto recebido de `runInTransaction`.
 * @returns {Promise<void>} Termina depois de reclamar todas as contas.
 */
export async function serializeBillingCustomers({ db, userIds, now, session }) {
  if (
    !db
    || !session
    || !Array.isArray(userIds)
    || userIds.length === 0
    || !(now instanceof Date)
    || Number.isNaN(now.getTime())
  ) {
    throw accountUnavailableError();
  }

  const orderedUserIds = [...new Map(
    userIds.map((userId) => [String(userId), userId]),
  ).entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([, userId]) => userId);

  for (const userId of orderedUserIds) {
    const user = await db.collection("users").findOne(
      { _id: userId },
      { session },
    );
    const accountStatusAllowsBilling = user && (
      user.accountStatus === undefined || user.accountStatus === "active"
    );
    const legacyStatusAllowsBilling = user && (
      user.status === undefined || user.status === "active"
    );
    if (!accountStatusAllowsBilling || !legacyStatusAllowsBilling) {
      throw accountUnavailableError();
    }

    // A escrita comum cria write conflict com billing, RGPD e alterações admin.
    const userWrite = await db.collection("users").updateOne(
      {
        _id: userId,
        accountStatus: user.accountStatus === undefined
          ? { $exists: false }
          : "active",
        status: user.status === undefined
          ? { $exists: false }
          : "active",
      },
      {
        $inc: { billingVersion: 1 },
        $set: { billingUpdatedAt: now },
      },
      { session },
    );
    if (userWrite.matchedCount !== 1) {
      throw accountUnavailableError();
    }
  }

  // A ordem determinística evita locks cruzados owner/membro em ordem inversa.
  for (const userId of orderedUserIds) {
    await db.collection("billing_customer_locks").updateOne(
      { _id: userId },
      {
        $inc: { revision: 1 },
        $set: { updatedAt: now },
        $setOnInsert: { userId, createdAt: now },
      },
      { upsert: true, session },
    );
  }
}

/**
 * Atalho usado pelo checkout e trial autoritativos do BK-MF4-02.
 *
 * @param {{
 *   db: import("mongodb").Db,
 *   userId: import("mongodb").ObjectId,
 *   now: Date,
 *   session: import("mongodb").ClientSession
 * }} input Contexto de uma conta.
 * @returns {Promise<void>} Resultado do lock partilhado.
 */
export async function serializeBillingCustomer(input) {
  return serializeBillingCustomers({
    ...input,
    userIds: [input.userId],
  });
}
```

No topo de `subscriptions.service.js`, mantém as constantes e funções completas
do `BK-MF9-01` e acrescenta os imports e helpers seguintes, por esta ordem:

```js
// backend/src/modules/subscriptions/subscriptions.service.js
import { ObjectId } from "mongodb";
import { getDb, runInTransaction } from "../../config/database.js";
import { assertValidEmail } from "../auth/auth.validation.js";
import { createNotification } from "../notifications/notifications.service.js";
import { serializeBillingCustomers } from "./billing-customer-lock.service.js";

const FAMILY_ACTIVE_STATUSES = ["pending", "active"];

/**
 * Cria um erro de domínio com envelope HTTP estável.
 *
 * @param {string} message Mensagem pública segura.
 * @param {number} statusCode Estado HTTP.
 * @param {string} code Código estável consumido por testes/UI.
 * @returns {Error} Erro pronto para o middleware global.
 */
function httpError(message, statusCode = 400, code = "SUBSCRIPTION_INVALID") {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

/**
 * Converte ids externos para `ObjectId` sem coerções ambíguas.
 *
 * @param {unknown} value Id vindo da sessão ou URL.
 * @param {string} label Nome público do campo.
 * @param {string} code Código de erro estável.
 * @returns {ObjectId} Id validado.
 */
function asObjectId(value, label, code = "INVALID_IDENTIFIER") {
  if (value instanceof ObjectId) return value;
  if (typeof value !== "string" || !/^[a-f\d]{24}$/i.test(value)) {
    throw httpError(`${label} inválido.`, 400, code);
  }
  return ObjectId.createFromHexString(value);
}

/**
 * Valida o identificador autenticado.
 *
 * @param {unknown} userId Id vindo de `req.user.id`.
 * @returns {ObjectId} Utilizador validado.
 */
function userObjectId(userId) {
  return asObjectId(userId, "Utilizador", "INVALID_USER_ID");
}

/**
 * Mantém compatibilidade com contas legacy sem aceitar estados desconhecidos.
 *
 * @param {object | null} user Documento `users`.
 * @returns {boolean} Verdadeiro apenas para conta ativa ou legacy sem estado.
 */
function isActiveAccount(user) {
  return Boolean(user)
    && (user.accountStatus === undefined || user.accountStatus === "active")
    && (user.status === undefined || user.status === "active");
}

/**
 * Resolve entitlements de uma subscrição concreta.
 *
 * @param {object | null} subscription Documento da subscrição.
 * @param {object | null} plan Plano persistido associado.
 * @returns {object} Entitlements fechados do BK-MF9-01.
 */
function entitlementsForSubscription(subscription, plan) {
  if (
    subscription?.status === "trialing"
    && subscription.planCode === "trial"
  ) {
    return { ...ENTITLEMENTS.trial };
  }
  return subscription?.status === "active"
    ? entitlementsForPlan(plan)
    : { ...ENTITLEMENTS.none };
}

/**
 * Decide acesso próprio sem completar plano, estado ou datas inválidas.
 *
 * @param {object | null} subscription Documento da subscrição.
 * @param {Date} referenceDate Instante da autorização.
 * @param {object | null} plan Plano persistido associado.
 * @returns {boolean} Acesso próprio explícito.
 */
function hasSubscriptionAccess(subscription, referenceDate = new Date(), plan = null) {
  if (!subscription || !(referenceDate instanceof Date) || Number.isNaN(referenceDate.getTime())) {
    return false;
  }
  if (!["active", "trialing"].includes(subscription.status)) return false;

  const periodEnd = new Date(subscription.currentPeriodEnd);
  const entitlements = entitlementsForSubscription(subscription, plan);
  return !Number.isNaN(periodEnd.getTime())
    && periodEnd > referenceDate
    && entitlements.tier !== "none";
}

/**
 * Serializa os dados mínimos de uma conta numa resposta familiar.
 *
 * @param {object | null} user Documento `users`.
 * @returns {object | null} DTO reduzido.
 */
function publicFamilyUser(user) {
  if (!user) return null;
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    accountStatus: user.accountStatus === undefined ? "active" : user.accountStatus,
  };
}

/**
 * Serializa uma membership por allowlist.
 *
 * @param {object} membership Documento familiar.
 * @param {{ owner?: object | null, member?: object | null }} users Contas relacionadas.
 * @returns {object} DTO familiar estável.
 */
function publicFamilyMembership(membership, users = {}) {
  return {
    id: String(membership._id),
    ownerUserId: String(membership.ownerUserId),
    memberUserId: String(membership.memberUserId),
    invitedEmail: membership.invitedEmail,
    status: membership.status,
    invitedAt: membership.invitedAt,
    acceptedAt: membership.acceptedAt,
    declinedAt: membership.declinedAt,
    removedAt: membership.removedAt,
    leftAt: membership.leftAt,
    owner: publicFamilyUser(users.owner),
    member: publicFamilyUser(users.member),
  };
}

/**
 * Lista `pending|active` de um owner no mesmo snapshot transacional.
 *
 * @param {import("mongodb").Db} db Ligação MongoDB já aberta.
 * @param {ObjectId} ownerUserId Owner da família.
 * @param {import("mongodb").ClientSession | undefined} session Sessão opcional.
 * @returns {Promise<object[]>} Memberships que ocupam lugar.
 */
async function listOpenFamilyMemberships(db, ownerUserId, session = undefined) {
  return db.collection("subscription_family_memberships")
    .find(
      { ownerUserId, status: { $in: FAMILY_ACTIVE_STATUSES } },
      { session },
    )
    .sort({ createdAt: 1 })
    .toArray();
}

/**
 * Conta convites pendentes e memberships ativas que reservam lugares.
 *
 * @param {import("mongodb").Db} db Ligação MongoDB já aberta.
 * @param {ObjectId} ownerUserId Owner da família.
 * @param {import("mongodb").ClientSession | undefined} session Sessão opcional.
 * @returns {Promise<number>} Número de lugares além do owner.
 */
async function countOpenFamilyMemberships(db, ownerUserId, session = undefined) {
  return db.collection("subscription_family_memberships").countDocuments(
    { ownerUserId, status: { $in: FAMILY_ACTIVE_STATUSES } },
    { session },
  );
}

/**
 * Procura uma subscrição paga ativa do potencial membro.
 *
 * @param {import("mongodb").Db} db Ligação MongoDB já aberta.
 * @param {ObjectId} userId Potencial membro.
 * @param {Date} referenceDate Instante da mutação.
 * @param {import("mongodb").ClientSession | undefined} session Sessão opcional.
 * @returns {Promise<object | null>} Subscrição paga ativa, quando existe.
 */
async function findActivePaidSubscription(
  db,
  userId,
  referenceDate = new Date(),
  session = undefined,
) {
  return db.collection("subscriptions").findOne(
    {
      userId,
      status: "active",
      planCode: { $ne: "trial" },
      currentPeriodEnd: { $gt: referenceDate },
    },
    { session },
  );
}

/**
 * Carrega subscrição e plano sequencialmente no contexto recebido.
 *
 * @param {import("mongodb").Db} db Ligação MongoDB já aberta.
 * @param {ObjectId} userId Utilizador alvo.
 * @param {import("mongodb").ClientSession | undefined} session Sessão opcional.
 * @returns {Promise<{ subscription: object | null, plan: object | null }>} Estado próprio.
 */
async function loadOwnSubscription(db, userId, session = undefined) {
  const subscription = await db.collection("subscriptions").findOne(
    { userId },
    { session },
  );
  const plan = subscription?.planCode && subscription.planCode !== "trial"
    ? await db.collection("subscription_plans").findOne(
      { code: subscription.planCode, active: true },
      { session },
    )
    : null;
  return { subscription, plan };
}

/**
 * Confirma todos os campos obrigatórios do tier Família.
 *
 * @param {object} entitlements Capacidades normalizadas pelo BK-MF9-01.
 * @returns {boolean} Verdadeiro apenas para Família completa.
 */
function hasCompleteFamilyEntitlements(entitlements) {
  return entitlements?.tier === "family"
    && entitlements.familySharing === true
    && Number.isInteger(entitlements.maxFamilyMembers)
    && entitlements.maxFamilyMembers >= 2;
}

/**
 * Exige owner ativo com subscrição e plano Família completos.
 *
 * @param {import("mongodb").Db} db Ligação MongoDB já aberta.
 * @param {ObjectId} ownerUserId Owner da família.
 * @param {Date} referenceDate Instante da autorização.
 * @param {import("mongodb").ClientSession | undefined} session Sessão opcional.
 * @returns {Promise<object>} Owner, subscrição, plano e entitlements válidos.
 */
async function requireShareableFamilyPlan(
  db,
  ownerUserId,
  referenceDate = new Date(),
  session = undefined,
) {
  const owner = await db.collection("users").findOne(
    { _id: ownerUserId },
    { session },
  );
  const { subscription, plan } = await loadOwnSubscription(db, ownerUserId, session);
  const entitlements = entitlementsForSubscription(subscription, plan);
  const hasPremiumAccess = hasSubscriptionAccess(subscription, referenceDate, plan);

  if (!isActiveAccount(owner) || !hasPremiumAccess || !hasCompleteFamilyEntitlements(entitlements)) {
    throw httpError(
      "Plano Família ativo obrigatório para gerir partilha familiar.",
      403,
      "FAMILY_PLAN_REQUIRED",
    );
  }
  return { owner, subscription, plan, entitlements, hasPremiumAccess: true };
}

/**
 * Escreve a subscrição do owner para provocar write conflict e retry integral.
 *
 * @param {import("mongodb").Db} db Ligação MongoDB já aberta.
 * @param {ObjectId} ownerUserId Owner da família.
 * @param {Date} now Instante da mutação.
 * @param {import("mongodb").ClientSession | undefined} session Sessão transacional.
 * @returns {Promise<object>} Estado Família reclamado.
 */
async function serializeFamilyOwner(db, ownerUserId, now, session = undefined) {
  const familyState = await requireShareableFamilyPlan(db, ownerUserId, now, session);
  const lock = await db.collection("subscriptions").updateOne(
    {
      _id: familyState.subscription._id,
      userId: ownerUserId,
      status: "active",
      currentPeriodEnd: { $gt: now },
    },
    {
      $inc: { familyVersion: 1 },
      $set: { familyUpdatedAt: now },
    },
    { session },
  );
  if (lock.matchedCount !== 1) {
    throw httpError(
      "Plano Família ativo obrigatório para gerir partilha familiar.",
      403,
      "FAMILY_PLAN_REQUIRED",
    );
  }
  return familyState;
}

/**
 * Reconhece a violação do índice parcial único por membro.
 *
 * @param {unknown} error Erro do driver MongoDB.
 * @returns {boolean} Verdadeiro para `E11000`.
 */
function isDuplicateFamilyMembership(error) {
  return Number(error?.code) === 11000;
}

/**
 * Enriquece memberships sequencialmente; o driver não paraleliza transações.
 *
 * @param {import("mongodb").Db} db Ligação MongoDB já aberta.
 * @param {object[]} memberships Memberships internas.
 * @param {import("mongodb").ClientSession | undefined} session Sessão opcional.
 * @returns {Promise<object[]>} DTOs familiares.
 */
async function publicMembershipsWithUsers(db, memberships, session = undefined) {
  const result = [];
  for (const membership of memberships) {
    const owner = await db.collection("users").findOne(
      { _id: membership.ownerUserId },
      { session },
    );
    const member = await db.collection("users").findOne(
      { _id: membership.memberUserId },
      { session },
    );
    result.push(publicFamilyMembership(membership, { owner, member }));
  }
  return result;
}

/**
 * Cria índices e planos base usados por subscrições e Família.
 *
 * @returns {Promise<void>} Termina quando índices e seed ficam prontos.
 */
export async function ensureSubscriptionIndexes() {
  const db = await getDb();
  await db.collection("subscription_plans").createIndex({ code: 1 }, { unique: true });
  await db.collection("subscriptions").createIndex({ userId: 1 }, { unique: true });
  await db.collection("subscriptions").createIndex({ status: 1, currentPeriodEnd: 1 });
  await db.collection("subscription_family_memberships").createIndex({ ownerUserId: 1, status: 1 });
  await db.collection("subscription_family_memberships").createIndex({ memberUserId: 1, status: 1 });
  await db.collection("subscription_family_memberships").createIndex(
    { memberUserId: 1 },
    {
      // A base de dados também defende a regra de negócio, não apenas o service.
      unique: true,
      partialFilterExpression: { status: { $in: FAMILY_ACTIVE_STATUSES } },
    },
  );

  for (const plan of DEFAULT_PLANS) {
    await db.collection("subscription_plans").updateOne(
      { code: plan.code },
      // O upsert preserva códigos antigos e acrescenta os campos Família do BK-MF9-01.
      { $set: { ...plan, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true },
    );
  }
}
```

Em `payments.service.js`, importa `serializeBillingCustomer` do ficheiro acima
e chama-o nas callbacks transacionais completas de `createSimulatedCheckout` e
`startTrial` nos pontos descritos. Não copies nem substituas essas funções: o
`BK-MF4-02` continua autoritativo para replay idempotente, ledger v2,
notificação e audit.

5. Explicação do código.

O lock partilhado faz billing e Família escreverem as mesmas contas em ordem
determinística; uma corrida força retry da unidade completa sem remover a
idempotência financeira. Os helpers centralizam ids, DTOs, acesso, leituras com
sessão e erros estáveis antes do primeiro uso. `FAMILY_ACTIVE_STATUSES`
identifica tudo o que ocupa lugar. Os índices aceleram consultas e o índice
único parcial impede duas famílias abertas para a mesma conta. O loop de
`DEFAULT_PLANS` preserva os códigos e entitlements do `BK-MF9-01`.

6. Validação do passo.

Executa o backend uma vez para garantir que a criação de índices não falha. Depois tenta criar dois convites pendentes para o mesmo membro nos testes.

7. Cenário negativo/erro esperado.

Tentar criar dois convites pendentes para o mesmo membro deve resultar em conflito, mesmo se duas requests chegarem quase ao mesmo tempo.

### Passo 2 - Expor rotas e controllers familiares autenticados

1. Objetivo funcional do passo no contexto da app.

Criar a superfície HTTP que a UI vai consumir sem aceitar ownership vindo do frontend.

2. Ficheiros envolvidos:
    - EDITAR: `backend/src/modules/subscriptions/subscriptions.controller.js`
    - EDITAR: `backend/src/modules/subscriptions/subscriptions.routes.js`
    - LOCALIZAÇÃO: ficheiros completos `subscriptions.controller.js` e `subscriptions.routes.js`.

3. Instruções do que fazer.

Substitui os ficheiros pelo conteúdo abaixo, preservando as rotas já existentes de planos e subscrição própria. Cada controller usa `req.user.id`. Todas as operações familiares usam `requireAuth`.

4. Código aplicável às rotas e controllers deste passo.

```js
// backend/src/modules/subscriptions/subscriptions.routes.js
/**
 * Rotas REST de subscrições.
 *
 * A listagem de planos é pública. As rotas `/me` e `/family`
 * dependem da sessão segura criada nos BKs de identidade.
 */
import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import {
  deleteFamilyMember,
  getMyFamilyController,
  getMySubscriptionController,
  getPlans,
  postAcceptFamilyInvitation,
  postCancelRenewal,
  postDeclineFamilyInvitation,
  postFamilyInvitation,
  postLeaveFamily,
} from "./subscriptions.controller.js";

export const subscriptionsRouter = Router();

subscriptionsRouter.get("/plans", asyncHandler(getPlans));
// As rotas privadas ficam abaixo das públicas para manter `/plans` acessível.
subscriptionsRouter.get("/me", requireAuth, asyncHandler(getMySubscriptionController));
subscriptionsRouter.post("/me/cancel-renewal", requireAuth, asyncHandler(postCancelRenewal));
// As ações familiares usam sempre sessão para impedir ownership vindo do body.
subscriptionsRouter.get("/family", requireAuth, asyncHandler(getMyFamilyController));
subscriptionsRouter.post("/family/invitations", requireAuth, asyncHandler(postFamilyInvitation));
subscriptionsRouter.post("/family/invitations/:id/accept", requireAuth, asyncHandler(postAcceptFamilyInvitation));
subscriptionsRouter.post("/family/invitations/:id/decline", requireAuth, asyncHandler(postDeclineFamilyInvitation));
subscriptionsRouter.delete("/family/members/:memberId", requireAuth, asyncHandler(deleteFamilyMember));
subscriptionsRouter.post("/family/leave", requireAuth, asyncHandler(postLeaveFamily));
```

```js
// backend/src/modules/subscriptions/subscriptions.controller.js
/**
 * Controllers HTTP do módulo de subscrições.
 *
 * Cada controller delega regras de negócio para o service e usa `req.user.id`
 * nas rotas privadas para preservar ownership.
 */
import {
  acceptFamilyInvitation,
  cancelRenewal,
  declineFamilyInvitation,
  getFamilyOverview,
  getMySubscription,
  inviteFamilyMember,
  listPlans,
  leaveFamily,
  removeFamilyMember,
} from "./subscriptions.service.js";

/**
 * Devolve planos ativos públicos.
 *
 * @param {object} _req Pedido Express não usado.
 * @param {object} res Resposta Express.
 * @returns {Promise<void>} Envia `200` com planos.
 */
export async function getPlans(_req, res) {
  res.status(200).json(await listPlans());
}

/**
 * Devolve a subscrição do utilizador autenticado.
 *
 * @param {object} req Pedido Express com `req.user.id`.
 * @param {object} res Resposta Express.
 * @returns {Promise<void>} Envia `200` com estado da subscrição.
 */
export async function getMySubscriptionController(req, res) {
  res.status(200).json(await getMySubscription(req.user.id));
}

/**
 * Cancela a renovação futura da subscrição do utilizador autenticado.
 *
 * @param {object} req Pedido Express com `req.user.id`.
 * @param {object} res Resposta Express.
 * @returns {Promise<void>} Envia `200` com a subscrição atualizada.
 */
export async function postCancelRenewal(req, res) {
  res.status(200).json(await cancelRenewal(req.user.id));
}

/**
 * Devolve o estado da partilha familiar do utilizador autenticado.
 *
 * @param {object} req Pedido Express com `req.user.id`.
 * @param {object} res Resposta Express.
 * @returns {Promise<void>} Envia `200` com a família.
 */
export async function getMyFamilyController(req, res) {
  // O userId vem da sessão para impedir leitura de famílias de outros utilizadores.
  res.status(200).json({ family: await getFamilyOverview(req.user.id) });
}

/**
 * Cria convite familiar para uma conta existente.
 *
 * @param {object} req Pedido Express com `req.user.id` e `body.email`.
 * @param {object} res Resposta Express.
 * @returns {Promise<void>} Envia `201` com o convite.
 */
export async function postFamilyInvitation(req, res) {
  // O owner vem sempre da sessão autenticada, nunca de um campo enviado pelo browser.
  res.status(201).json(await inviteFamilyMember(req.user.id, req.body));
}

/**
 * Aceita convite familiar pendente.
 *
 * @param {object} req Pedido Express com `req.user.id` e `params.id`.
 * @param {object} res Resposta Express.
 * @returns {Promise<void>} Envia `200` com a família atualizada.
 */
export async function postAcceptFamilyInvitation(req, res) {
  res.status(200).json(await acceptFamilyInvitation(req.user.id, req.params.id));
}

/**
 * Recusa convite familiar pendente.
 *
 * @param {object} req Pedido Express com `req.user.id` e `params.id`.
 * @param {object} res Resposta Express.
 * @returns {Promise<void>} Envia `200` com a família atualizada.
 */
export async function postDeclineFamilyInvitation(req, res) {
  res.status(200).json(await declineFamilyInvitation(req.user.id, req.params.id));
}

/**
 * Remove membro da família do owner autenticado.
 *
 * @param {object} req Pedido Express com `req.user.id` e `params.memberId`.
 * @param {object} res Resposta Express.
 * @returns {Promise<void>} Envia `200` com a família atualizada.
 */
export async function deleteFamilyMember(req, res) {
  res.status(200).json(await removeFamilyMember(req.user.id, req.params.memberId));
}

/**
 * Permite ao membro sair da família ativa.
 *
 * @param {object} req Pedido Express com `req.user.id`.
 * @param {object} res Resposta Express.
 * @returns {Promise<void>} Envia `200` com a família atualizada.
 */
export async function postLeaveFamily(req, res) {
  res.status(200).json(await leaveFamily(req.user.id));
}
```

5. Explicação do código.

As rotas ficam dentro do módulo de subscrições porque a Família é uma capacidade do plano. O ficheiro preserva `/plans`, `/me` e `/me/cancel-renewal`, evitando quebrar `BK-MF9-01`. `requireAuth` garante sessão em todas as operações familiares. O controller delega regras ao service, mas fixa a origem do owner ou membro em `req.user.id`. Isto evita que um pedido malicioso envie outro owner no body.

6. Validação do passo.

Um pedido sem sessão para `/api/subscriptions/family` deve devolver HTTP `401`. Um pedido autenticado deve devolver `family` com `ownedFamily`, `pendingInvitations` e `activeMembership`.

7. Cenário negativo/erro esperado.

Se uma rota familiar ficar sem `requireAuth`, o BK deve ser bloqueado porque viola `RNF15` e ownership.

### Passo 3 - Construir overview e acesso efetivo

1. Objetivo funcional do passo no contexto da app.

Devolver ao utilizador o estado familiar e permitir que outros módulos saibam se existe acesso premium por conta própria ou por Família.

2. Ficheiros envolvidos:
    - EDITAR: `backend/src/modules/subscriptions/subscriptions.service.js`
    - LOCALIZAÇÃO: funções completas `getFamilyOverview`, `getEffectiveSubscriptionAccess` e `hasActiveSubscriptionAccess`.

3. Instruções do que fazer.

Reutiliza a foundation completa do Passo 1. Substitui a versão apenas individual
de `getEffectiveSubscriptionAccess` criada no `BK-MF9-02` pela extensão abaixo;
mantém o mesmo nome, argumentos e campo canónico `source`. Não cries uma segunda
função nem um alias concorrente.

4. Implementação canónica do overview.

```js
// backend/src/modules/subscriptions/subscriptions.service.js
/**
 * Devolve o estado familiar do utilizador autenticado.
 *
 * @param {import("mongodb").Db} db Ligação MongoDB já aberta.
 * @param {ObjectId} userIdObject Identificador da sessão já validado.
 * @param {import("mongodb").ClientSession | undefined} session Sessão opcional.
 * @returns {Promise<object>} Overview familiar.
 */
async function buildFamilyOverview(db, userIdObject, session = undefined) {
  const { subscription, plan } = await loadOwnSubscription(
    db,
    userIdObject,
    session,
  );
  const ownEntitlements = entitlementsForSubscription(subscription, plan);
  const now = new Date();
  const canOwnFamily = hasSubscriptionAccess(subscription, now, plan)
    && hasCompleteFamilyEntitlements(ownEntitlements);

  // O driver MongoDB não suporta operações paralelas na mesma transação.
  const ownedRows = canOwnFamily
    ? await listOpenFamilyMemberships(db, userIdObject, session)
    : [];
  const pendingRows = await db.collection("subscription_family_memberships")
    .find(
      { memberUserId: userIdObject, status: "pending" },
      { session },
    )
    .sort({ createdAt: -1 })
    .toArray();
  const activeMembership = await db.collection("subscription_family_memberships").findOne(
    { memberUserId: userIdObject, status: "active" },
    { sort: { acceptedAt: -1, createdAt: -1 }, session },
  );

  // A resposta já vem pronta para a UI do BK-MF9-04, sem expor documentos internos.
  const ownedMembers = await publicMembershipsWithUsers(db, ownedRows, session);
  const pendingInvitations = await publicMembershipsWithUsers(
    db,
    pendingRows,
    session,
  );
  const [publicActiveMembership] = activeMembership
    ? await publicMembershipsWithUsers(db, [activeMembership], session)
    : [null];

  return {
    ownedFamily: canOwnFamily
      ? {
        maxFamilyMembers: ownEntitlements.maxFamilyMembers,
        seatsUsed: 1 + ownedRows.length,
        seatsAvailable: Math.max(ownEntitlements.maxFamilyMembers - 1 - ownedRows.length, 0),
        members: ownedMembers,
      }
      : null,
    pendingInvitations,
    activeMembership: publicActiveMembership,
  };
}

/**
 * Abre o overview fora de uma mutação. As mutações chamam diretamente o helper
 * acima, passando a `session` recebida de `runInTransaction`.
 */
export async function getFamilyOverview(userId) {
  const db = await getDb();
  return buildFamilyOverview(db, userObjectId(userId));
}

/**
 * Constrói sempre a mesma resposta fail-closed quando não existe acesso.
 *
 * @param {object | null} subscription Subscrição própria observada.
 * @param {object | null} plan Plano próprio observado.
 * @param {object | null} familyMembership Membership observada, se existir.
 * @returns {object} Contrato estável sem acesso premium.
 */
function noEffectiveSubscriptionAccess(subscription, plan, familyMembership = null) {
  return {
    source: "none",
    hasPremiumAccess: false,
    subscription,
    plan,
    entitlements: { ...ENTITLEMENTS.none },
    familyMembership,
  };
}

/**
 * Estende o acesso efetivo do BK-MF9-02 com membership familiar.
 *
 * @param {string} userId Identificador autenticado.
 * @param {Date} referenceDate Data opcional para testes de expiração.
 * @returns {Promise<{
 *   source: "own" | "family" | "none",
 *   hasPremiumAccess: boolean,
 *   subscription: object | null,
 *   plan: object | null,
 *   entitlements: object,
 *   familyMembership: object | null
 * }>} Estado efetivo de acesso.
 */
export async function getEffectiveSubscriptionAccess(userId, referenceDate = new Date()) {
  const db = await getDb();
  const userIdObject = userObjectId(userId);
  const { subscription, plan } = await loadOwnSubscription(db, userIdObject);
  const ownEntitlements = entitlementsForSubscription(subscription, plan);
  const ownHasPremiumAccess = hasSubscriptionAccess(subscription, referenceDate, plan)
    && ownEntitlements.tier !== "none";

  if (ownHasPremiumAccess) {
    return {
      source: "own",
      hasPremiumAccess: true,
      subscription,
      plan,
      entitlements: ownEntitlements,
      familyMembership: null,
    };
  }

  const membership = await db.collection("subscription_family_memberships").findOne(
    { memberUserId: userIdObject, status: "active" },
    { sort: { acceptedAt: -1, createdAt: -1 } },
  );

  if (!membership) {
    return noEffectiveSubscriptionAccess(subscription, plan);
  }

  const ownerUser = await db.collection("users").findOne({
    _id: membership.ownerUserId,
  });
  const ownerState = await loadOwnSubscription(db, membership.ownerUserId);
  const ownerEntitlements = entitlementsForSubscription(ownerState.subscription, ownerState.plan);
  const ownerHasPremiumAccess = isActiveAccount(ownerUser)
    && hasSubscriptionAccess(
      ownerState.subscription,
      referenceDate,
      ownerState.plan,
    )
    && hasCompleteFamilyEntitlements(ownerEntitlements);

  // O booleano explícito impede acesso por truthiness de plano/membership.
  if (ownerHasPremiumAccess === true) {
    return {
      source: "family",
      hasPremiumAccess: true,
      subscription: ownerState.subscription,
      plan: ownerState.plan,
      entitlements: ownerEntitlements,
      familyMembership: membership,
    };
  }

  return noEffectiveSubscriptionAccess(subscription, plan, membership);
}

/**
 * Verifica se o utilizador pode aceder a conteúdo premium.
 *
 * @param {string} userId Identificador vindo de `req.user.id`.
 * @param {Date} referenceDate Data opcional para testes de expiração.
 * @returns {Promise<boolean>} Resultado usado pelo middleware de playback.
 */
export async function hasActiveSubscriptionAccess(userId, referenceDate = new Date()) {
  const effective = await getEffectiveSubscriptionAccess(userId, referenceDate);
  return effective.hasPremiumAccess;
}
```

5. Explicação do código.

`getFamilyOverview` entrega o contrato que o `BK-MF9-04` consome: família do
owner, convites pendentes e membership ativa do membro, sempre com leituras
sequenciais. `getEffectiveSubscriptionAccess` preserva o contrato do MF9-02:
primeiro calcula acesso próprio explícito; depois exige membership `active`,
owner operacional, subscrição válida e entitlements Família completos. Qualquer
campo ausente ou incoerente devolve `source: "none"` e
`hasPremiumAccess: false`. `hasActiveSubscriptionAccess` é apenas o wrapper do
mesmo booleano canónico.

6. Validação do passo.

Cria membership ativa com owner Família e confirma que `hasActiveSubscriptionAccess(memberId)` devolve `true`. Depois altera o owner para plano Pro e confirma que o membro perde acesso. Repete com o owner `blocked`, `inactive`, `deleted` e com um estado desconhecido: todos devem falhar fechados.

7. Cenário negativo/erro esperado.

Membership `pending` não pode dar acesso premium. Se `source` aparecer como
`family` antes da aceitação, a regra de acesso está errada.

### Passo 4 - Criar convite familiar

1. Objetivo funcional do passo no contexto da app.

Permitir que o owner Família convide uma conta existente por email.

2. Ficheiros envolvidos:
    - EDITAR: `backend/src/modules/subscriptions/subscriptions.service.js`
    - REVER: `backend/src/modules/auth/auth.validation.js`
    - LOCALIZAÇÃO: função completa `inviteFamilyMember`.

3. Instruções do que fazer.

Valida email e, dentro de `runInTransaction`, procura o utilizador, bloqueia auto-convite, serializa pela subscrição do owner, reconta lugares incluindo o owner e impede membro pago ou duplicado.

4. Implementação canónica da mutação.

O trecho reutiliza os helpers completos definidos no Passo 1 e
`buildFamilyOverview`, definido no Passo 3. A função abaixo não abre uma segunda
ligação à DB e nunca usa uma `session` indefinida.

```js
// backend/src/modules/subscriptions/subscriptions.service.js
/**
 * Convida uma conta existente para a Família do owner.
 *
 * @param {string} ownerUserId Identificador do owner autenticado.
 * @param {{ email?: unknown }} input Payload do frontend.
 * @returns {Promise<{ invitation: object, family: object }>} Convite e overview.
 */
export async function inviteFamilyMember(ownerUserId, input) {
  const now = new Date();
  const ownerObjectId = userObjectId(ownerUserId);
  const email = assertValidEmail(input?.email);

  try {
    return await runInTransaction(async ({ db, session }) => {
      const targetUser = await db.collection("users").findOne(
        { email },
        { session },
      );

      if (!targetUser || !isActiveAccount(targetUser)) {
        throw httpError("Utilizador convidado não encontrado.", 404, "FAMILY_USER_NOT_FOUND");
      }

      if (String(targetUser._id) === String(ownerObjectId)) {
        throw httpError("Não podes convidar a tua própria conta.", 400, "FAMILY_SELF_INVITE");
      }

      await serializeBillingCustomers({
        db,
        userIds: [ownerObjectId, targetUser._id],
        now,
        session,
      });
      const { subscription, entitlements } = await serializeFamilyOwner(
        db,
        ownerObjectId,
        now,
        session,
      );
      const openMembershipCount = await countOpenFamilyMemberships(
        db,
        ownerObjectId,
        session,
      );

      // O owner e o novo convite ocupam ambos lugar.
      if (1 + openMembershipCount + 1 > entitlements.maxFamilyMembers) {
        throw httpError(
          "Limite de utilizadores do plano Família atingido.",
          409,
          "FAMILY_CAPACITY_REACHED",
        );
      }

      if (await findActivePaidSubscription(db, targetUser._id, now, session)) {
        throw httpError(
          "Este utilizador já tem uma subscrição paga ativa.",
          409,
          "PAID_SUBSCRIPTION_CONFLICT",
        );
      }

      const existingMembership = await db.collection("subscription_family_memberships").findOne(
        {
          memberUserId: targetUser._id,
          status: { $in: FAMILY_ACTIVE_STATUSES },
        },
        { session },
      );

      if (existingMembership) {
        throw httpError(
          "Este utilizador já tem uma partilha familiar ativa ou pendente.",
          409,
          "FAMILY_MEMBERSHIP_CONFLICT",
        );
      }

      const membership = {
        ownerUserId: ownerObjectId,
        memberUserId: targetUser._id,
        subscriptionId: subscription._id,
        invitedEmail: email,
        status: "pending",
        invitedAt: now,
        createdAt: now,
        updatedAt: now,
      };
      const result = await db.collection("subscription_family_memberships").insertOne(
        membership,
        { session },
      );
      const storedMembership = { ...membership, _id: result.insertedId };

      await createNotification(String(targetUser._id), {
        type: "family_invitation",
        title: "Convite familiar recebido",
        message: "Recebeste um convite para partilhar uma subscrição FaithFlix Família.",
      }, { db, session });

      return {
        invitation: publicFamilyMembership(storedMembership, { member: targetUser }),
        family: await buildFamilyOverview(db, ownerObjectId, session),
      };
    });
  } catch (error) {
    if (isDuplicateFamilyMembership(error)) {
      throw httpError(
        "Este utilizador já tem uma partilha familiar ativa ou pendente.",
        409,
        "FAMILY_MEMBERSHIP_CONFLICT",
      );
    }
    throw error;
  }
}
```

5. Explicação do código.

O email entra pelo frontend e é validado antes de consultar a base de dados. O owner vem da sessão. `requireShareableFamilyPlan` confirma plano Família ativo. Os bloqueios evitam auto-convite, conta eliminada, membro já pago, limite de lugares e duplicação. A membership fica `pending`, por isso ainda não dá acesso premium. A notificação interna torna o convite visível sem depender de serviços externos.

6. Validação do passo.

Owner Família convida uma conta existente sem subscrição paga. O resultado esperado é HTTP `201`, `status: "pending"` e uma notificação interna.

7. Cenário negativo/erro esperado.

Owner Pro deve receber HTTP `403` com mensagem de plano Família obrigatório.

### Passo 5 - Aceitar, recusar, remover e sair

1. Objetivo funcional do passo no contexto da app.

Fechar o ciclo de vida da membership sem apagar histórico.

2. Ficheiros envolvidos:
    - EDITAR: `backend/src/modules/subscriptions/subscriptions.service.js`
    - EDITAR: `backend/src/modules/jobs/billing-jobs.service.js`
    - LOCALIZAÇÃO: quatro mutações familiares completas e extensão cumulativa dos ramos `canceled`/`renewal_failed`.

3. Instruções do que fazer.

Cada operação deve filtrar por utilizador autenticado e estado esperado e correr
em `runInTransaction`. Aceitar serializa o owner antes de recontar lugares e
exige que o plano Família continue ativo. Recusar, remover e sair mudam estado
sem apagar a row; notificações aplicáveis partilham a sessão. No fim deste
passo, estende o `processSubscriptionCycle` já implementado em MF4: os ramos
`canceled` e `renewal_failed` fecham memberships abertas com a mesma `session`.
Não alteres o worker, a pool, o ledger v2 nem inventes expiração de `past_due`.

4. Implementação canónica das quatro mutações.

Tal como no convite, estas funções reutilizam a foundation completa do Passo 1.
Cada uma abre exatamente uma `runInTransaction`, propaga o mesmo contexto
`{ db, session }` a todas as leituras/escritas e constrói o overview
sequencialmente antes do commit.

```js
// backend/src/modules/subscriptions/subscriptions.service.js
/**
 * Aceita um convite familiar pendente.
 *
 * @param {string} memberUserId Utilizador autenticado.
 * @param {string} invitationId Id do convite.
 * @returns {Promise<{ family: object }>} Overview familiar atualizado.
 */
export async function acceptFamilyInvitation(memberUserId, invitationId) {
  const now = new Date();
  const memberObjectId = userObjectId(memberUserId);
  const invitationObjectId = asObjectId(
    invitationId,
    "Convite",
    "INVALID_FAMILY_INVITATION_ID",
  );

  return runInTransaction(async ({ db, session }) => {
    const invitation = await db.collection("subscription_family_memberships").findOne(
      {
        _id: invitationObjectId,
        memberUserId: memberObjectId,
        status: "pending",
      },
      { session },
    );

    if (!invitation) {
      throw httpError(
        "Convite familiar não encontrado.",
        404,
        "FAMILY_INVITATION_NOT_FOUND",
      );
    }

    await serializeBillingCustomers({
      db,
      userIds: [invitation.ownerUserId, memberObjectId],
      now,
      session,
    });
    const { entitlements } = await serializeFamilyOwner(
      db,
      invitation.ownerUserId,
      now,
      session,
    );

    if (await findActivePaidSubscription(db, memberObjectId, now, session)) {
      throw httpError(
        "Não podes aceitar Família com subscrição paga ativa.",
        409,
        "PAID_SUBSCRIPTION_CONFLICT",
      );
    }

    const existingMembership = await db.collection("subscription_family_memberships").findOne(
      {
        _id: { $ne: invitationObjectId },
        memberUserId: memberObjectId,
        status: { $in: FAMILY_ACTIVE_STATUSES },
      },
      { session },
    );

    if (existingMembership) {
      throw httpError(
        "Já existe uma partilha familiar ativa ou pendente.",
        409,
        "FAMILY_MEMBERSHIP_CONFLICT",
      );
    }

    const openMembershipCount = await countOpenFamilyMemberships(
      db,
      invitation.ownerUserId,
      session,
    );

    if (1 + openMembershipCount > entitlements.maxFamilyMembers) {
      throw httpError(
        "Limite de utilizadores do plano Família atingido.",
        409,
        "FAMILY_CAPACITY_REACHED",
      );
    }

    const result = await db.collection("subscription_family_memberships").updateOne(
      {
        _id: invitationObjectId,
        memberUserId: memberObjectId,
        status: "pending",
      },
      { $set: { status: "active", acceptedAt: now, updatedAt: now } },
      { session },
    );

    if (!result.matchedCount) {
      throw httpError(
        "Convite familiar não encontrado.",
        404,
        "FAMILY_INVITATION_NOT_FOUND",
      );
    }

    await createNotification(String(invitation.ownerUserId), {
      type: "family_invitation_accepted",
      title: "Convite familiar aceite",
      message: "Um membro aceitou o teu convite FaithFlix Família.",
    }, { db, session });

    return { family: await buildFamilyOverview(db, memberObjectId, session) };
  });
}

/**
 * Recusa um convite familiar pendente.
 *
 * @param {string} memberUserId Utilizador autenticado.
 * @param {string} invitationId Id do convite.
 * @returns {Promise<{ family: object }>} Overview familiar atualizado.
 */
export async function declineFamilyInvitation(memberUserId, invitationId) {
  const now = new Date();
  const memberObjectId = userObjectId(memberUserId);
  const invitationObjectId = asObjectId(
    invitationId,
    "Convite",
    "INVALID_FAMILY_INVITATION_ID",
  );

  return runInTransaction(async ({ db, session }) => {
    const result = await db.collection("subscription_family_memberships").updateOne(
      { _id: invitationObjectId, memberUserId: memberObjectId, status: "pending" },
      { $set: { status: "declined", declinedAt: now, updatedAt: now } },
      { session },
    );

    if (!result.matchedCount) {
      throw httpError(
        "Convite familiar não encontrado.",
        404,
        "FAMILY_INVITATION_NOT_FOUND",
      );
    }

    return { family: await buildFamilyOverview(db, memberObjectId, session) };
  });
}

/**
 * Remove um membro da Família do owner.
 *
 * @param {string} ownerUserId Owner autenticado.
 * @param {string} memberUserId Membro alvo.
 * @returns {Promise<{ family: object }>} Overview familiar atualizado.
 */
export async function removeFamilyMember(ownerUserId, memberUserId) {
  const now = new Date();
  const ownerObjectId = userObjectId(ownerUserId);
  const memberObjectId = asObjectId(memberUserId, "Membro", "INVALID_FAMILY_MEMBER_ID");

  return runInTransaction(async ({ db, session }) => {
    // Remover também escreve o owner para não decidir sobre um plano stale.
    await serializeFamilyOwner(db, ownerObjectId, now, session);

    const result = await db.collection("subscription_family_memberships").updateOne(
      {
        ownerUserId: ownerObjectId,
        memberUserId: memberObjectId,
        status: { $in: FAMILY_ACTIVE_STATUSES },
      },
      { $set: { status: "removed", removedAt: now, updatedAt: now } },
      { session },
    );

    if (!result.matchedCount) {
      throw httpError(
        "Membro familiar não encontrado.",
        404,
        "FAMILY_MEMBER_NOT_FOUND",
      );
    }

    await createNotification(String(memberObjectId), {
      type: "family_member_removed",
      title: "Partilha familiar removida",
      message: "A tua partilha da subscrição FaithFlix Família foi removida.",
    }, { db, session });

    return { family: await buildFamilyOverview(db, ownerObjectId, session) };
  });
}

/**
 * Permite ao membro sair da Família ativa.
 *
 * @param {string} memberUserId Utilizador autenticado.
 * @returns {Promise<{ family: object }>} Overview familiar atualizado.
 */
export async function leaveFamily(memberUserId) {
  const now = new Date();
  const memberObjectId = userObjectId(memberUserId);

  return runInTransaction(async ({ db, session }) => {
    const result = await db.collection("subscription_family_memberships").updateOne(
      { memberUserId: memberObjectId, status: "active" },
      { $set: { status: "left", leftAt: now, updatedAt: now } },
      { session },
    );

    if (!result.matchedCount) {
      throw httpError(
        "Partilha familiar ativa não encontrada.",
        404,
        "FAMILY_ACTIVE_MEMBERSHIP_NOT_FOUND",
      );
    }

    return { family: await buildFamilyOverview(db, memberObjectId, session) };
  });
}
```

Aplica agora a extensão cumulativa em
`backend/src/modules/jobs/billing-jobs.service.js`. Substitui o import existente
da base de dados pela versão abaixo; `getDb` e `runInTransaction` permanecem:

```js
import {
  assertActiveTransaction,
  getDb,
  runInTransaction,
} from "../../config/database.js";
```

Acrescenta o contrato fechado e o helper seguinte antes de
`processSubscriptionCycle`. O helper não abre uma transação nova: exige a
`session` da callback já ativa.

```js
const FAMILY_CLOSURE = Object.freeze({
  canceled: "owner_subscription_canceled",
  past_due: "owner_subscription_past_due",
});

/**
 * Fecha memberships abertas do owner dentro da transação do ciclo.
 *
 * @param {import("mongodb").Db} db - DB recebida de `runInTransaction`.
 * @param {ObjectId|string} ownerUserId - Owner cuja subscrição perdeu acesso.
 * @param {Date} now - Instante autoritativo do ciclo.
 * @param {"owner_subscription_canceled"|"owner_subscription_past_due"} reason - Motivo fechado.
 * @param {import("mongodb").ClientSession} session - Sessão transacional ativa.
 * @returns {Promise<number>} Número de memberships fechadas.
 */
async function closeOwnedFamily(db, ownerUserId, now, reason, session) {
  // A escrita familiar nunca pode degradar para uma operação fora da transação do ciclo.
  assertActiveTransaction(session);
  const ownerIdValue = String(ownerUserId ?? "");
  if (!ObjectId.isValid(ownerIdValue)) {
    throw operationalError("SUBSCRIPTION_USER_INVALID", "Owner inválido.");
  }
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
    throw operationalError("WORKER_DATE_INVALID", "Data do worker inválida.");
  }
  if (!Object.values(FAMILY_CLOSURE).includes(reason)) {
    throw operationalError("FAMILY_CLOSURE_REASON_INVALID", "Motivo inválido.");
  }

  // O filtro fechado preserva histórico e não volta a remover rows já terminais.
  const result = await db.collection("subscription_family_memberships").updateMany(
    {
      ownerUserId: new ObjectId(ownerIdValue),
      status: { $in: ["pending", "active"] },
    },
    {
      $set: {
        status: "removed",
        removedAt: now,
        removedReason: reason,
        updatedAt: now,
      },
    },
    { session },
  );
  return result.modifiedCount ?? 0;
}

```

Dentro do `processSubscriptionCycle` do mesmo ficheiro, substitui os dois
updates diretos pelos blocos abaixo. São inseridos nas posições já existentes;
todo o cálculo de trial, plano, `payment_attempts`, idempotency key, lease e pool
permanece intacto.

```text
if (subscription.cancelAtPeriodEnd === true) {
  const result = await subscriptions.updateOne(
    exactCycle,
    { $set: { status: "canceled", updatedAt: now } },
    { session },
  );
  assertCycleWrite(result);
  await closeOwnedFamily(
    db,
    userId,
    now,
    "owner_subscription_canceled",
    session,
  );
  return { outcome: "subscription_canceled" };
}

// Este bloco substitui apenas o update do ramo `decision.status === "failed"`,
// depois de a tentativa v2 ter sido inserida na mesma transação.
if (decision.status === "failed") {
  const result = await subscriptions.updateOne(
    exactCycle,
    { $set: { status: "past_due", updatedAt: now } },
    { session },
  );
  assertCycleWrite(result);
  await closeOwnedFamily(
    db,
    userId,
    now,
    "owner_subscription_past_due",
    session,
  );
  return { outcome: "renewal_failed", paymentAttemptId: String(attemptId) };
}
```

5. Explicação do código.

`acceptFamilyInvitation` só aceita convites do próprio membro autenticado.
Revalida subscrição paga, duplicação e plano Família antes de ativar.
`declineFamilyInvitation`, `removeFamilyMember` e `leaveFamily` preservam o
histórico por mudança de estado. A extensão do worker aplica a mesma regra
quando o owner perde acesso: `canceled` e `past_due` fecham `pending|active`
como `removed` dentro da transação do ciclo. `past_due` continua suspenso; este
BK não inventa grace period nem transição automática para `expired`.

6. Validação do passo.

Aceitar convite deve mudar `pending` para `active`. Recusar deve mudar `pending`
para `declined`. Remover deve mudar `active|pending` para `removed` e sair muda
`active` para `left`. Acrescenta ainda a matriz de ciclo abaixo; os testes com
doubles não substituem a repetição concorrente num replica set `_e2e` isolado.

| ID | Fault/preparação | Assert obrigatório |
| --- | --- | --- |
| `FAMILY-CYCLE-CANCELED-01` | Owner Família chega ao fim do ciclo com `cancelAtPeriodEnd: true`, uma membership ativa e uma pendente. | Commit deixa subscrição `canceled`, zero memberships `pending|active`, `removedAt` preenchido e `removedReason: "owner_subscription_canceled"`. |
| `FAMILY-CYCLE-PAST-DUE-01` | Renovação simulada é recusada com memberships abertas. | Commit deixa uma tentativa v2, subscrição `past_due`, zero memberships abertas e reason `owner_subscription_past_due`; não cria deadline/job de expiração. |
| `FAMILY-CYCLE-FAULT-01` | O double de `updateMany` familiar lança erro depois de a subscrição/ledger terem sido staged. | A `runInTransaction` rejeita e, após rollback, subscrição continua `active`, memberships continuam abertas e não existe `payment_attempt` novo. |
| `FAMILY-CYCLE-FAULT-02` | O commit transacional recebe erro transiente depois do fecho staged e a unidade é repetida. | Retry termina com um ledger/ciclo, todas as memberships removidas uma vez e nenhuma row parcial/duplicada. |
| `FAMILY-CYCLE-CONCURRENT-01` | Dois workers processam a mesma key/ciclo. | Só um commit vence; o replay não duplica pagamento e a contagem final de memberships `pending|active` do owner é zero. |

7. Cenário negativo/erro esperado.

Um utilizador diferente do membro convidado deve receber HTTP `404` ao tentar
aceitar ou recusar o convite. Se o fecho familiar usar outro `getDb()` ou omitir
`{ session }`, o fault `FAMILY-CYCLE-FAULT-01` deve falhar porque surgiria
subscrição `past_due|canceled` com membership ainda ativa.

### Passo 6 - Testar fluxo positivo e negativos

1. Objetivo funcional do passo no contexto da app.

Provar que a API familiar funciona e bloqueia abusos principais.

2. Ficheiros envolvidos:
    - CRIAR/EDITAR: `backend/tests/unit/mf9-subscriptions.test.js`
    - LOCALIZAÇÃO: suite MF9 de Família.

3. Instruções do que fazer.

Mantém os helpers de teste existentes no ficheiro (`collection`,
`setCollectionsForTests` e `planRows`). Acrescenta ou confirma os testes abaixo
para convite, aceitação, acesso efetivo, remoção, owner sem Família, membro
pago, duplicado e convite de outro utilizador. Importa também
`processSubscriptionCycle` de
`../../src/modules/jobs/billing-jobs.service.js` e implementa os cinco casos
`FAMILY-CYCLE-*` definidos no Passo 5; não os substituas por asserts apenas
textuais sobre o helper.

4. Excertos de testes de domínio.

Estes três testes reutilizam helpers já existentes no ficheiro e cobrem o fluxo
funcional. Não constituem a suite transacional completa: acrescenta ainda
fault injection em convite/aceite/recusa/remoção/saída, confirma que domínio e
notificação fazem rollback e força falha durante `buildFamilyOverview` para
provar que a resposta não é construída depois do commit.

```js
// backend/tests/unit/mf9-subscriptions.test.js
import assert from "node:assert/strict";
import { test } from "node:test";
import { ObjectId } from "mongodb";
import { runInTransaction } from "../../src/config/database.js";
import { createNotification } from "../../src/modules/notifications/notifications.service.js";
import { assertNotificationType } from "../../src/modules/notifications/notifications.validation.js";
import {
  acceptFamilyInvitation,
  getEffectiveSubscriptionAccess,
  hasActiveSubscriptionAccess,
  inviteFamilyMember,
  removeFamilyMember,
} from "../../src/modules/subscriptions/subscriptions.service.js";

test("MF9 partilha familiar cria convite, aceita e remove acesso efetivo", async () => {
  const ownerId = new ObjectId();
  const memberId = new ObjectId();
  const future = new Date("2999-01-01T00:00:00.000Z");
  const collections = setCollectionsForTests({
    users: collection([
      { _id: ownerId, name: "Owner", email: "owner@example.test", role: "user" },
      { _id: memberId, name: "Membro", email: "membro@example.test", role: "user" },
    ]),
    subscriptions: collection([
      {
        _id: new ObjectId(),
        userId: ownerId,
        status: "active",
        planCode: "faithflix-family-monthly",
        currentPeriodEnd: future,
        cancelAtPeriodEnd: false,
      },
    ]),
    subscription_plans: collection(planRows()),
    subscription_family_memberships: collection([]),
    notification_preferences: collection([]),
    user_consents: collection([]),
    notifications: collection([]),
  });

  const invite = await inviteFamilyMember(String(ownerId), {
    email: "membro@example.test",
  });
  assert.equal(invite.invitation.status, "pending");
  assert.equal(collections.notifications.rows.at(-1).type, "family_invitation");

  await acceptFamilyInvitation(String(memberId), invite.invitation.id);
  assert.equal(
    collections.notifications.rows.at(-1).type,
    "family_invitation_accepted",
  );
  assert.equal(await hasActiveSubscriptionAccess(String(memberId)), true);

  // O membro ganha acesso por Família, não por subscrição própria.
  const effective = await getEffectiveSubscriptionAccess(String(memberId));
  assert.equal(effective.source, "family");
  assert.equal(effective.hasPremiumAccess, true);
  assert.equal(effective.entitlements.maxQuality, "2160p");

  await removeFamilyMember(String(ownerId), String(memberId));
  assert.equal(collections.subscription_family_memberships.rows[0].status, "removed");
  assert.equal(collections.notifications.rows.at(-1).type, "family_member_removed");
  assert.equal(await hasActiveSubscriptionAccess(String(memberId)), false);
});

test("MF9 tipo Family desconhecido reverte domínio e notificação", async () => {
  const ownerId = new ObjectId();
  const memberId = new ObjectId();
  const collections = setCollectionsForTests({
    subscription_family_memberships: collection([]),
    notification_preferences: collection([]),
    user_consents: collection([]),
    notifications: collection([]),
  });

  assert.throws(
    () => assertNotificationType("family_unknown"),
    /Tipo de notificação inválido/,
  );

  await assert.rejects(
    () => runInTransaction(async ({ db, session }) => {
      await db.collection("subscription_family_memberships").insertOne(
        {
          ownerUserId: ownerId,
          memberUserId: memberId,
          status: "pending",
        },
        { session },
      );
      await createNotification(
        String(memberId),
        {
          type: "family_unknown",
          title: "Tipo inválido",
          message: "Este evento não pode ser persistido.",
        },
        { db, session },
      );
    }),
    /Tipo de notificação inválido/,
  );

  assert.equal(collections.subscription_family_memberships.rows.length, 0);
  assert.equal(collections.notifications.rows.length, 0);
});

test("MF9 bloqueia owner sem Família, membro pago e duplicação familiar", async () => {
  const proOwnerId = new ObjectId();
  const familyOwnerId = new ObjectId();
  const paidMemberId = new ObjectId();
  const invitedMemberId = new ObjectId();
  const future = new Date("2999-01-01T00:00:00.000Z");

  setCollectionsForTests({
    users: collection([
      { _id: proOwnerId, name: "Owner Pro", email: "owner-pro@example.test", role: "user" },
      { _id: familyOwnerId, name: "Owner Família", email: "owner-family@example.test", role: "user" },
      { _id: paidMemberId, name: "Pago", email: "pago@example.test", role: "user" },
      { _id: invitedMemberId, name: "Convidado", email: "convidado@example.test", role: "user" },
    ]),
    subscriptions: collection([
      {
        _id: new ObjectId(),
        userId: proOwnerId,
        status: "active",
        planCode: "faithflix-monthly",
        currentPeriodEnd: future,
      },
      {
        _id: new ObjectId(),
        userId: familyOwnerId,
        status: "active",
        planCode: "faithflix-family-monthly",
        currentPeriodEnd: future,
      },
      {
        _id: new ObjectId(),
        userId: paidMemberId,
        status: "active",
        planCode: "faithflix-monthly",
        currentPeriodEnd: future,
      },
    ]),
    subscription_plans: collection(planRows()),
    subscription_family_memberships: collection([
      {
        _id: new ObjectId(),
        ownerUserId: familyOwnerId,
        memberUserId: invitedMemberId,
        status: "pending",
        invitedEmail: "convidado@example.test",
      },
    ]),
    notification_preferences: collection([]),
    user_consents: collection([]),
    notifications: collection([]),
  });

  await assert.rejects(
    () => inviteFamilyMember(String(proOwnerId), { email: "pago@example.test" }),
    /Plano Família ativo/,
  );

  await assert.rejects(
    () => inviteFamilyMember(String(familyOwnerId), { email: "pago@example.test" }),
    /subscrição paga ativa/,
  );

  // O duplicado prova que a regra de uma Família aberta por membro não fica só na UI.
  await assert.rejects(
    () => inviteFamilyMember(String(familyOwnerId), { email: "convidado@example.test" }),
    /partilha familiar ativa ou pendente/,
  );
});

test("MF9 rejeita aceite de convite por outro utilizador", async () => {
  const ownerId = new ObjectId();
  const memberId = new ObjectId();
  const otherUserId = new ObjectId();
  const invitationId = new ObjectId();
  const future = new Date("2999-01-01T00:00:00.000Z");

  setCollectionsForTests({
    users: collection([
      { _id: ownerId, name: "Owner", email: "owner@example.test", role: "user" },
      { _id: memberId, name: "Membro", email: "membro@example.test", role: "user" },
      { _id: otherUserId, name: "Outro", email: "outro@example.test", role: "user" },
    ]),
    subscriptions: collection([
      {
        _id: new ObjectId(),
        userId: ownerId,
        status: "active",
        planCode: "faithflix-family-monthly",
        currentPeriodEnd: future,
      },
    ]),
    subscription_plans: collection(planRows()),
    subscription_family_memberships: collection([
      {
        _id: invitationId,
        ownerUserId: ownerId,
        memberUserId: memberId,
        status: "pending",
        invitedEmail: "membro@example.test",
      },
    ]),
    notifications: collection([]),
  });

  await assert.rejects(
    () => acceptFamilyInvitation(String(otherUserId), String(invitationId)),
    /Convite familiar não encontrado/,
  );
});

test("MF9 owner com legacy status não ativo não concede Família", async () => {
  const future = new Date("2999-01-01T00:00:00.000Z");

  for (const status of ["blocked", "inactive", "deleted", "unknown"]) {
    const ownerId = new ObjectId();
    const memberId = new ObjectId();
    setCollectionsForTests({
      users: collection([
        {
          _id: ownerId,
          name: "Owner",
          email: "owner@example.test",
          role: "user",
          // Sem accountStatus: o campo legacy continua a ter de estar ativo.
          status,
        },
        { _id: memberId, status: "active" },
      ]),
      subscriptions: collection([
        {
          _id: new ObjectId(),
          userId: ownerId,
          status: "active",
          planCode: "faithflix-family-monthly",
          currentPeriodEnd: future,
        },
      ]),
      subscription_plans: collection(planRows()),
      subscription_family_memberships: collection([
        {
          _id: new ObjectId(),
          ownerUserId: ownerId,
          memberUserId: memberId,
          status: "active",
        },
      ]),
    });

    const access = await getEffectiveSubscriptionAccess(String(memberId));
    assert.equal(access.hasPremiumAccess, false, status);
  }

  const legacyOwnerId = new ObjectId();
  const legacyMemberId = new ObjectId();
  setCollectionsForTests({
    users: collection([
      { _id: legacyOwnerId, role: "user" },
      { _id: legacyMemberId, role: "user" },
    ]),
    subscriptions: collection([
      {
        _id: new ObjectId(),
        userId: legacyOwnerId,
        status: "active",
        planCode: "faithflix-family-monthly",
        currentPeriodEnd: future,
      },
    ]),
    subscription_plans: collection(planRows()),
    subscription_family_memberships: collection([
      {
        _id: new ObjectId(),
        ownerUserId: legacyOwnerId,
        memberUserId: legacyMemberId,
        status: "active",
      },
    ]),
  });

  const legacyAccess = await getEffectiveSubscriptionAccess(
    String(legacyMemberId),
  );
  assert.equal(legacyAccess.hasPremiumAccess, true);
});
```

5. Explicação do código.

O primeiro teste cobre o percurso principal de `RF62`: convite, aceitação,
acesso premium e remoção. As asserts de `source` e `hasPremiumAccess` confirmam
explicitamente a origem Família. O segundo teste prova bloqueios centrais:
owner Pro não convida, membro pago não entra e membro já pendente não recebe
outro convite. O terceiro teste prova ownership: só o membro convidado consegue
aceitar.

6. Validação do passo.

Executa:

```bash
cd backend
npm test -- --test-name-pattern=MF9
```

7. Cenário negativo/erro esperado.

Se `acceptFamilyInvitation` não filtrar por `memberUserId`, o terceiro teste falha porque outro utilizador conseguiria aceitar convite alheio.

### Passo 7 - Fechar API para a UI

1. Objetivo funcional do passo no contexto da app.

Deixar um contrato claro para `BK-MF9-04`.

2. Ficheiros envolvidos:
    - REVER: `backend/src/modules/subscriptions/subscriptions.routes.js`
    - REVER: `backend/src/modules/subscriptions/subscriptions.controller.js`
    - REVER: `backend/src/modules/subscriptions/subscriptions.service.js`
    - LOCALIZAÇÃO: endpoints `/api/subscriptions/family`.

3. Instruções do que fazer.

Documenta no PR os endpoints, payloads, respostas e negativos. Confirma que nenhum endpoint aceita `ownerUserId` no body.

4. Sem código novo neste passo.

Sem código neste passo.

5. Explicação do código.

Este passo é de validação e handoff: os passos anteriores já entregaram o código da API.

Como não há código neste passo, a explicação incide no contrato criado: a UI do próximo BK deve chamar a API, apresentar mensagens e recarregar estado canónico. O browser nunca recria regras de autorização, nunca decide se o owner pode convidar e nunca envia `ownerUserId`.

6. Validação do passo.

Executa:

```bash
cd backend
npm test -- --test-name-pattern=MF9
```

7. Cenário negativo/erro esperado.

Se a documentação do PR mostrar `ownerUserId` vindo do frontend, o contrato deve ser corrigido antes de abrir a UI.

#### Critérios de aceite

- Todas as rotas `/api/subscriptions/family/*` exigem sessão autenticada.
- `GET /api/subscriptions/family` devolve `ownedFamily`, `pendingInvitations` e `activeMembership`.
- Owner Família consegue convidar uma conta existente.
- Owner Pro, trial ou sem plano não consegue convidar.
- Membro com subscrição paga ativa não consegue aceitar Família.
- O mesmo membro não pode ter duas memberships `pending` ou `active`.
- `maxFamilyMembers` inclui o owner; convites `pending` e membros `active` ocupam lugar.
- Dois convites concorrentes para o último lugar não podem produzir overbooking.
- Fault injection depois da membership ou notificação deixa zero efeitos parciais.
- A allowlist de notificações inclui exatamente os tipos MF4 mais
  `family_invitation`, `family_invitation_accepted` e
  `family_member_removed`; tipo desconhecido aborta domínio e notificação.
- Aceitar, recusar, remover e sair alteram `status` sem apagar histórico.
- Quando o ciclo do owner termina em `canceled` ou `past_due`, a mesma
  `runInTransaction` muda todas as memberships `pending|active` para `removed`,
  com `removedAt`, `removedReason` e `{ session }` em cada escrita.
- Depois do commit de perda de acesso, a contagem de memberships abertas do
  owner é zero; fault no fecho familiar reverte subscrição, ledger e memberships.
- Renovação recusada permanece `past_due`; não existe grace/deadline nem job de
  expiração adicional fora do contrato RF.
- `hasActiveSubscriptionAccess` reconhece acesso familiar apenas enquanto o
  owner Família tiver simultaneamente `accountStatus` ausente/`active` e
  `status` ausente/`active`. Estado bloqueado, inativo, eliminado, desconhecido
  ou `null` em qualquer campo falha fechado; legacy sem ambos mantém acesso.
- Nenhum endpoint aceita `ownerUserId` ou `memberUserId` arbitrário como autoridade de sessão.
- Na UI, recusar/remover/sair exige confirmação, pedidos são canceláveis e o
  overview é recarregado após sucesso com rótulos familiares PT-PT.

#### Validação final

- `cd backend && npm test -- --test-name-pattern=MF9`
- Testes focados de concorrência/fault injection com doubles locais; para validar transações reais é necessário um MongoDB replica set dedicado.
- Casos `FAMILY-CYCLE-CANCELED-01`, `FAMILY-CYCLE-PAST-DUE-01`,
  `FAMILY-CYCLE-FAULT-01/02` e `FAMILY-CYCLE-CONCURRENT-01` verdes.
- Pedidos manuais ou automatizados para listar família, convidar, aceitar, recusar, remover e sair.
- Negativos: sem sessão, owner sem Família, auto-convite, email inexistente, membro pago, duplicado e convite de outro utilizador.

#### Evidence para PR/defesa

- `pr`: referência do PR ou commit do BK.
- `proof`: fluxo convite -> aceitar -> acesso premium -> ciclo owner
  `canceled|past_due` -> zero memberships abertas, com reason persistido.
- `neg`: owner Pro/membro pago/duplicado bloqueados, outro utilizador impedido
  de aceitar e fault do fecho familiar com rollback integral.
- `fonte`: `RF62`, `RNF13`, `RNF15`, `RNF16`, `RNF19`, `BK-MF9-01`, `BK-MF2-01`, `BK-MF9-02`.

#### Handoff

Este BK entrega API e estado familiar para `BK-MF9-04`: `ownedFamily`,
`pendingInvitations`, `activeMembership`, endpoints e fecho transacional quando
o owner perde acesso. `BK-MF9-05` usa a mesma coleção para exportação RGPD,
eliminação e métricas; não recria o lifecycle do worker.

#### Changelog

- `2026-06-30`: guia revisto com modelo de membership, API autenticada, ownership, acesso efetivo, testes e negativos de segurança.
- `2026-07-01`: guia corrigido para incluir rotas/controllers completos, overview familiar, aceitar/recusar/remover/sair, testes negativos e texto pedagógico em português de Portugal.
- `2026-07-10`: acrescentadas serialização pelo owner, contagem que inclui owner, transações/notificações atómicas e negativos de overbooking/fault injection.
- `2026-07-10`: contrato consumidor sincronizado com confirmação de ações
  destrutivas, abort/anti-stale, busy state e rótulos familiares PT-PT.
- `2026-07-10`: extensão cumulativa do billing worker fecha memberships abertas
  nos ramos `canceled`/`renewal_failed`, com a mesma sessão, reason auditável e
  matriz de rollback/concorrência; `past_due` permanece suspenso conforme RF.
