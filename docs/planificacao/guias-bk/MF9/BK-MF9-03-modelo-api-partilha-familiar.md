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
- `last_updated`: `2026-07-01`

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

#### Pre-requisitos

- `BK-MF9-01` completo, com planos Família, `familySharing` e `maxFamilyMembers`.
- `BK-MF2-01` completo, com utilizadores, sessão segura e `requireAuth`.
- `BK-MF9-02` completo, porque o player já consome `getEffectiveSubscriptionAccess`.
- Ler `RF62`, `RNF13`, `RNF15`, `RNF16` e `RNF19`.
- Rever `backend/src/modules/subscriptions/subscriptions.service.js`.
- Rever `backend/src/modules/subscriptions/subscriptions.controller.js`.
- Rever `backend/src/modules/subscriptions/subscriptions.routes.js`.
- Rever `backend/src/modules/auth/auth.middleware.js`.
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
- Testes negativos são parte da funcionalidade. Neste BK, provar que o owner Pro falha é tão importante como provar que o owner Família consegue convidar.

#### Arquitetura do BK

| Camada | Artefacto | Responsabilidade |
| --- | --- | --- |
| Dados | `subscription_family_memberships` | Guarda owner, membro, estado, datas e subscrição associada. |
| Service | `backend/src/modules/subscriptions/subscriptions.service.js` | Implementa overview, convite, aceitação, recusa, remoção, saída e acesso efetivo. |
| Controller | `backend/src/modules/subscriptions/subscriptions.controller.js` | Traduz pedidos HTTP para chamadas autenticadas ao service. |
| Rotas | `backend/src/modules/subscriptions/subscriptions.routes.js` | Expõe rotas `/family` protegidas por `requireAuth`, preservando `/plans`, `/me` e `/me/cancel-renewal`. |
| Notificações | `backend/src/modules/notifications/notifications.service.js` | Regista notificações internas de convite, aceite e remoção. |
| Testes | `backend/tests/unit/mf9-subscriptions.test.js` | Prova fluxo positivo e negativos de segurança. |
| Handoff | `BK-MF9-04` | Usa a API familiar para construir UI. |

#### Ficheiros a criar/editar/rever

- EDITAR: `backend/src/modules/subscriptions/subscriptions.service.js`
- EDITAR: `backend/src/modules/subscriptions/subscriptions.controller.js`
- EDITAR: `backend/src/modules/subscriptions/subscriptions.routes.js`
- REVER: `backend/src/modules/auth/auth.middleware.js`
- REVER: `backend/src/modules/notifications/notifications.service.js`
- CRIAR/EDITAR: `backend/tests/unit/mf9-subscriptions.test.js`

#### Tutorial técnico linear

### Passo 1 - Criar índices e contrato da membership

1. Objetivo funcional do passo no contexto da app.

Preparar a coleção que impede duplicação de memberships abertas para o mesmo membro.

2. Ficheiros envolvidos:
    - EDITAR: `backend/src/modules/subscriptions/subscriptions.service.js`
    - LOCALIZAÇÃO: constantes e função completa `ensureSubscriptionIndexes`.

3. Instruções do que fazer.

Define estados abertos e cria índices por owner, member e member aberto. O índice parcial por `memberUserId` deve proteger `pending` e `active`. Mantém os índices de `subscription_plans` e `subscriptions` criados no `BK-MF9-01`.

4. Código completo, correto e integrado com a app final.

```js
// backend/src/modules/subscriptions/subscriptions.service.js
const FAMILY_ACTIVE_STATUSES = ["pending", "active"];

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

5. Explicação do código.

`FAMILY_ACTIVE_STATUSES` identifica estados que ocupam um lugar familiar. Os índices aceleram consultas por owner e membro. O índice único parcial impede que a mesma conta esteja em duas famílias abertas ao mesmo tempo. Isto reforça `RF62` ao nível de dados, não apenas no service. O loop de `DEFAULT_PLANS` continua a respeitar o trabalho de `BK-MF9-01`: os planos Pro/Família continuam a existir e os códigos públicos não mudam.

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

4. Código completo, correto e integrado com a app final.

```js
// backend/src/modules/subscriptions/subscriptions.routes.js
/**
 * Rotas REST de subscrições.
 *
 * A listagem de planos é pública. As rotas `/me` e `/family`
 * dependem da sessão segura criada nos BKs de identidade.
 */
import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
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

Mantém os helpers de subscrição criados nos BKs anteriores: `loadOwnSubscription`, `entitlementsForSubscription`, `hasSubscriptionAccess`, `publicFamilyMembership`, `publicMembershipsWithUsers`, `userObjectId` e `ENTITLEMENTS`. Depois adiciona as funções abaixo.

4. Código completo, correto e integrado com a app final.

```js
// backend/src/modules/subscriptions/subscriptions.service.js
/**
 * Devolve o estado familiar do utilizador autenticado.
 *
 * @param {string} userId Identificador da sessão.
 * @returns {Promise<object>} Overview familiar.
 */
export async function getFamilyOverview(userId) {
  const db = await getDb();
  const userIdObject = userObjectId(userId);
  const { subscription, plan } = await loadOwnSubscription(db, userIdObject);
  const ownEntitlements = entitlementsForSubscription(subscription, plan);
  const now = new Date();
  const canOwnFamily = hasSubscriptionAccess(subscription, now) && ownEntitlements.familySharing;

  const [ownedRows, pendingRows, activeMembership] = await Promise.all([
    canOwnFamily ? listOpenFamilyMemberships(db, userIdObject) : [],
    db.collection("subscription_family_memberships")
      .find({ memberUserId: userIdObject, status: "pending" })
      .sort({ createdAt: -1 })
      .toArray(),
    db.collection("subscription_family_memberships").findOne(
      { memberUserId: userIdObject, status: "active" },
      { sort: { acceptedAt: -1, createdAt: -1 } },
    ),
  ]);

  // A resposta já vem pronta para a UI do BK-MF9-04, sem expor documentos internos.
  const ownedMembers = await publicMembershipsWithUsers(db, ownedRows);
  const pendingInvitations = await publicMembershipsWithUsers(db, pendingRows);
  const [publicActiveMembership] = activeMembership
    ? await publicMembershipsWithUsers(db, [activeMembership])
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
 * Resolve acesso efetivo a partir de subscrição própria ou Família.
 *
 * @param {string} userId Identificador autenticado.
 * @param {Date} referenceDate Data opcional para testes de expiração.
 * @returns {Promise<object>} Estado efetivo de acesso.
 */
export async function getEffectiveSubscriptionAccess(userId, referenceDate = new Date()) {
  const db = await getDb();
  const userIdObject = userObjectId(userId);
  const { subscription, plan } = await loadOwnSubscription(db, userIdObject);

  if (hasSubscriptionAccess(subscription, referenceDate)) {
    return {
      hasPremiumAccess: true,
      accessSource: "own",
      subscription,
      plan,
      entitlements: entitlementsForSubscription(subscription, plan),
      familyMembership: null,
    };
  }

  const membership = await db.collection("subscription_family_memberships").findOne(
    { memberUserId: userIdObject, status: "active" },
    { sort: { acceptedAt: -1, createdAt: -1 } },
  );

  if (!membership) {
    return {
      hasPremiumAccess: false,
      accessSource: "none",
      subscription,
      plan,
      entitlements: { ...ENTITLEMENTS.none },
      familyMembership: null,
    };
  }

  const ownerState = await loadOwnSubscription(db, membership.ownerUserId);
  const ownerEntitlements = entitlementsForSubscription(ownerState.subscription, ownerState.plan);

  // O membro só herda acesso enquanto o owner continua com plano Família ativo.
  if (
    hasSubscriptionAccess(ownerState.subscription, referenceDate) &&
    ownerEntitlements.familySharing
  ) {
    return {
      hasPremiumAccess: true,
      accessSource: "family",
      subscription: ownerState.subscription,
      plan: ownerState.plan,
      entitlements: ownerEntitlements,
      familyMembership: membership,
    };
  }

  return {
    hasPremiumAccess: false,
    accessSource: "none",
    subscription,
    plan,
    entitlements: { ...ENTITLEMENTS.none },
    familyMembership: membership,
  };
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

`getFamilyOverview` entrega o contrato que o `BK-MF9-04` vai consumir: família gerida pelo owner, convites pendentes e membership ativa do membro. `getEffectiveSubscriptionAccess` tenta primeiro a subscrição própria. Se não existir, procura membership ativa e revalida o owner. Isto é essencial: o membro só tem acesso enquanto o owner continua com plano Família ativo. `hasActiveSubscriptionAccess` fica como wrapper simples para middleware e playback.

6. Validação do passo.

Cria membership ativa com owner Família e confirma que `hasActiveSubscriptionAccess(memberId)` devolve `true`. Depois altera o owner para plano Pro e confirma que o membro perde acesso.

7. Cenário negativo/erro esperado.

Membership `pending` não pode dar acesso premium. Se `accessSource` aparecer como `family` antes da aceitação, a regra de acesso está errada.

### Passo 4 - Criar convite familiar

1. Objetivo funcional do passo no contexto da app.

Permitir que o owner Família convide uma conta existente por email.

2. Ficheiros envolvidos:
    - EDITAR: `backend/src/modules/subscriptions/subscriptions.service.js`
    - REVER: `backend/src/modules/auth/auth.validation.js`
    - LOCALIZAÇÃO: função completa `inviteFamilyMember`.

3. Instruções do que fazer.

Valida email, procura utilizador existente, bloqueia auto-convite, exige plano Família ativo, verifica limite de lugares e impede membro pago ou duplicado.

4. Código completo, correto e integrado com a app final.

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
  const db = await getDb();
  const now = new Date();
  const ownerObjectId = userObjectId(ownerUserId);
  const email = assertValidEmail(input?.email);
  const targetUser = await db.collection("users").findOne({ email });

  if (!targetUser || targetUser.accountStatus === "deleted") {
    throw httpError("Utilizador convidado não encontrado.", 404);
  }

  if (String(targetUser._id) === String(ownerObjectId)) {
    throw httpError("Não podes convidar a tua própria conta.", 400);
  }

  // A autorização do owner é revalidada no backend antes de criar qualquer convite.
  const { subscription, entitlements } = await requireShareableFamilyPlan(db, ownerObjectId, now);
  const openRows = await listOpenFamilyMemberships(db, ownerObjectId);

  if (openRows.length + 1 >= entitlements.maxFamilyMembers) {
    throw httpError("Limite de utilizadores do plano Família atingido.", 409);
  }

  if (await findActivePaidSubscription(db, targetUser._id, now)) {
    throw httpError("Este utilizador já tem uma subscrição paga ativa.", 409);
  }

  const existingMembership = await db.collection("subscription_family_memberships").findOne({
    memberUserId: targetUser._id,
    status: { $in: FAMILY_ACTIVE_STATUSES },
  });

  if (existingMembership) {
    throw httpError("Este utilizador já tem uma partilha familiar ativa ou pendente.", 409);
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
  const result = await db.collection("subscription_family_memberships").insertOne(membership);
  const storedMembership = { ...membership, _id: result.insertedId };

  // A notificação interna substitui envio externo e deixa prova observável na app.
  await createNotification(String(targetUser._id), {
    type: "family_invitation",
    title: "Convite familiar recebido",
    message: "Recebeste um convite para partilhar uma subscrição FaithFlix Família.",
  });

  return {
    invitation: publicFamilyMembership(storedMembership, { member: targetUser }),
    family: await getFamilyOverview(ownerUserId),
  };
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
    - LOCALIZAÇÃO: funções completas `acceptFamilyInvitation`, `declineFamilyInvitation`, `removeFamilyMember` e `leaveFamily`.

3. Instruções do que fazer.

Cada operação deve filtrar por utilizador autenticado e estado esperado. Aceitar exige que o owner ainda tenha plano Família ativo. Recusar e sair mudam estado sem apagar a row.

4. Código completo, correto e integrado com a app final.

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
  const db = await getDb();
  const now = new Date();
  const memberObjectId = userObjectId(memberUserId);
  const invitationObjectId = asObjectId(invitationId, "Convite");
  const invitation = await db.collection("subscription_family_memberships").findOne({
    _id: invitationObjectId,
    memberUserId: memberObjectId,
    status: "pending",
  });

  if (!invitation) {
    throw httpError("Convite familiar não encontrado.", 404);
  }

  if (await findActivePaidSubscription(db, memberObjectId, now)) {
    throw httpError("Não podes aceitar Família com subscrição paga ativa.", 409);
  }

  const existingMembership = await db.collection("subscription_family_memberships").findOne({
    _id: { $ne: invitationObjectId },
    memberUserId: memberObjectId,
    status: { $in: FAMILY_ACTIVE_STATUSES },
  });

  if (existingMembership) {
    throw httpError("Já existe uma partilha familiar ativa ou pendente.", 409);
  }

  // O owner é revalidado no momento do aceite para impedir acesso após downgrade.
  const { entitlements } = await requireShareableFamilyPlan(db, invitation.ownerUserId, now);
  const openRows = await listOpenFamilyMemberships(db, invitation.ownerUserId);

  if (openRows.length + 1 > entitlements.maxFamilyMembers) {
    throw httpError("Limite de utilizadores do plano Família atingido.", 409);
  }

  await db.collection("subscription_family_memberships").updateOne(
    { _id: invitationObjectId },
    { $set: { status: "active", acceptedAt: now, updatedAt: now } },
  );

  await createNotification(String(invitation.ownerUserId), {
    type: "family_invitation_accepted",
    title: "Convite familiar aceite",
    message: "Um membro aceitou o teu convite FaithFlix Família.",
  });

  return { family: await getFamilyOverview(memberUserId) };
}

/**
 * Recusa um convite familiar pendente.
 *
 * @param {string} memberUserId Utilizador autenticado.
 * @param {string} invitationId Id do convite.
 * @returns {Promise<{ family: object }>} Overview familiar atualizado.
 */
export async function declineFamilyInvitation(memberUserId, invitationId) {
  const db = await getDb();
  const now = new Date();
  const memberObjectId = userObjectId(memberUserId);
  const invitationObjectId = asObjectId(invitationId, "Convite");
  const result = await db.collection("subscription_family_memberships").updateOne(
    { _id: invitationObjectId, memberUserId: memberObjectId, status: "pending" },
    { $set: { status: "declined", declinedAt: now, updatedAt: now } },
  );

  if (!result.matchedCount) {
    throw httpError("Convite familiar não encontrado.", 404);
  }

  return { family: await getFamilyOverview(memberUserId) };
}

/**
 * Remove um membro da Família do owner.
 *
 * @param {string} ownerUserId Owner autenticado.
 * @param {string} memberUserId Membro alvo.
 * @returns {Promise<{ family: object }>} Overview familiar atualizado.
 */
export async function removeFamilyMember(ownerUserId, memberUserId) {
  const db = await getDb();
  const now = new Date();
  const ownerObjectId = userObjectId(ownerUserId);
  const memberObjectId = asObjectId(memberUserId, "Membro");
  await requireShareableFamilyPlan(db, ownerObjectId, now);

  const result = await db.collection("subscription_family_memberships").updateOne(
    { ownerUserId: ownerObjectId, memberUserId: memberObjectId, status: { $in: FAMILY_ACTIVE_STATUSES } },
    { $set: { status: "removed", removedAt: now, updatedAt: now } },
  );

  if (!result.matchedCount) {
    throw httpError("Membro familiar não encontrado.", 404);
  }

  // O membro recebe uma notificação interna e perde o acesso derivado no próximo acesso efetivo.
  await createNotification(String(memberObjectId), {
    type: "family_member_removed",
    title: "Partilha familiar removida",
    message: "A tua partilha da subscrição FaithFlix Família foi removida.",
  });

  return { family: await getFamilyOverview(ownerUserId) };
}

/**
 * Permite ao membro sair da Família ativa.
 *
 * @param {string} memberUserId Utilizador autenticado.
 * @returns {Promise<{ family: object }>} Overview familiar atualizado.
 */
export async function leaveFamily(memberUserId) {
  const db = await getDb();
  const now = new Date();
  const memberObjectId = userObjectId(memberUserId);
  const result = await db.collection("subscription_family_memberships").updateOne(
    { memberUserId: memberObjectId, status: "active" },
    { $set: { status: "left", leftAt: now, updatedAt: now } },
  );

  if (!result.matchedCount) {
    throw httpError("Partilha familiar ativa não encontrada.", 404);
  }

  return { family: await getFamilyOverview(memberUserId) };
}
```

5. Explicação do código.

`acceptFamilyInvitation` só aceita convites do próprio membro autenticado. Revalida subscrição paga do membro, duplicação de membership e plano Família do owner antes de ativar. `declineFamilyInvitation` só recusa convites pendentes do próprio membro. `removeFamilyMember` só remove memberships pertencentes ao owner autenticado. `leaveFamily` só permite ao membro sair da sua própria Família ativa. O histórico fica preservado por mudança de `status`, em vez de apagar a row.

6. Validação do passo.

Aceitar convite deve mudar `pending` para `active`. Recusar deve mudar `pending` para `declined`. Remover deve mudar `active` ou `pending` para `removed`. Sair deve mudar `active` para `left`.

7. Cenário negativo/erro esperado.

Um utilizador diferente do membro convidado deve receber HTTP `404` ao tentar aceitar ou recusar o convite.

### Passo 6 - Testar fluxo positivo e negativos

1. Objetivo funcional do passo no contexto da app.

Provar que a API familiar funciona e bloqueia abusos principais.

2. Ficheiros envolvidos:
    - CRIAR/EDITAR: `backend/tests/unit/mf9-subscriptions.test.js`
    - LOCALIZAÇÃO: suite MF9 de Família.

3. Instruções do que fazer.

Mantém os helpers de teste existentes no ficheiro (`collection`, `setCollectionsForTests` e `planRows`). Acrescenta ou confirma os testes abaixo para convite, aceitação, acesso efetivo, remoção, owner sem Família, membro pago, duplicado e convite de outro utilizador.

4. Código completo, correto e integrado com a app final.

```js
// backend/tests/unit/mf9-subscriptions.test.js
import assert from "node:assert/strict";
import { test } from "node:test";
import { ObjectId } from "mongodb";
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
    notifications: collection([]),
  });

  const invite = await inviteFamilyMember(String(ownerId), {
    email: "membro@example.test",
  });
  assert.equal(invite.invitation.status, "pending");

  await acceptFamilyInvitation(String(memberId), invite.invitation.id);
  assert.equal(await hasActiveSubscriptionAccess(String(memberId)), true);

  // O membro ganha acesso por Família, não por subscrição própria.
  const effective = await getEffectiveSubscriptionAccess(String(memberId));
  assert.equal(effective.accessSource, "family");
  assert.equal(effective.entitlements.maxQuality, "2160p");

  await removeFamilyMember(String(ownerId), String(memberId));
  assert.equal(collections.subscription_family_memberships.rows[0].status, "removed");
  assert.equal(await hasActiveSubscriptionAccess(String(memberId)), false);
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
```

5. Explicação do código.

O primeiro teste cobre o percurso principal de `RF62`: convite, aceitação, acesso premium e remoção. A assert de `accessSource` garante que o acesso vem da Família. O segundo teste prova bloqueios centrais: owner Pro não convida, membro pago não entra e membro já pendente não recebe outro convite. O terceiro teste prova ownership: só o membro convidado consegue aceitar.

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

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é de validação e handoff: os passos anteriores já entregaram o código da API.

5. Explicação do código.

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
- Aceitar, recusar, remover e sair alteram `status` sem apagar histórico.
- `hasActiveSubscriptionAccess` reconhece acesso familiar apenas enquanto o owner Família estiver ativo.
- Nenhum endpoint aceita `ownerUserId` ou `memberUserId` arbitrário como autoridade de sessão.

#### Validação final

- `cd backend && npm test -- --test-name-pattern=MF9`
- Pedidos manuais ou automatizados para listar família, convidar, aceitar, recusar, remover e sair.
- Negativos: sem sessão, owner sem Família, auto-convite, email inexistente, membro pago, duplicado e convite de outro utilizador.

#### Evidence para PR/defesa

- `pr`: referência do PR ou commit do BK.
- `proof`: fluxo convite -> aceitar -> acesso premium por Família -> remover -> acesso removido.
- `neg`: owner Pro bloqueado, membro pago bloqueado, membro duplicado bloqueado e outro utilizador impedido de aceitar convite.
- `fonte`: `RF62`, `RNF13`, `RNF15`, `RNF16`, `RNF19`, `BK-MF9-01`, `BK-MF2-01`, `BK-MF9-02`.

#### Handoff

Este BK entrega API e estado familiar para `BK-MF9-04`: `ownedFamily`, `pendingInvitations`, `activeMembership`, endpoints de convite, aceitar, recusar, remover e sair. `BK-MF9-05` deve usar a mesma coleção para exportação RGPD, eliminação de conta e métricas agregadas sem expor dados sensíveis.

#### Changelog

- `2026-06-30`: guia revisto com modelo de membership, API autenticada, ownership, acesso efetivo, testes e negativos de segurança.
- `2026-07-01`: guia corrigido para incluir rotas/controllers completos, overview familiar, aceitar/recusar/remover/sair, testes negativos e texto pedagógico em português de Portugal.
