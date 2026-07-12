# BK-MF4-08 - Notificações transacionais e preferências

## Header

- `doc_id`: `GUIA-BK-MF4-08`
- `bk_id`: `BK-MF4-08`
- `macro`: `MF4`
- `owner`: `Mateus`
- `apoio`: `Davi`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF4-02,BK-MF2-05`
- `rf_rnf`: `RF52, RF53, RF54`
- `fase_documental`: `Fase 2`
- `sprint`: `S07`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF4-03`
- `guia_path`: `docs/planificacao/guias-bk/MF4/BK-MF4-08-notificacoes-transacionais-e-preferencias.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais criar notificações internas para eventos de subscrição, trial e continuidade, com preferências por utilizador. O MVP guarda notificações na base de dados e mostra-as no frontend; envio real de email fica fora deste BK.


- Criar notificações transacionais auditáveis.
- Permitir que o utilizador configure preferências.
- Evitar criação de notificações sensíveis para canais desligados.
- Preparar operação futura sem depender de fornecedor externo.

#### Importância

- Notificações ajudam o utilizador a perceber eventos importantes sem consultar manualmente todas as páginas.
- Preferências reduzem ruído e respeitam escolhas individuais.
- Este BK integra eventos de subscrição, trial e continuidade sem criar fornecedor externo de email.

#### Scope-in

- Criar notificações internas `in_app`.
- Criar preferências por utilizador.
- Marcar notificações como lidas com ownership.
- Criar alerta de continuidade a partir do progresso de reprodução.
- Integrar eventos de subscrição e trial com o módulo de notificações.

#### Scope-out

- Não enviar email real, SMS, push notifications ou mensagens externas.
- Não guardar tokens, dados de pagamento ou cookies em notificações.
- Não notificar administradores sobre candidaturas, salvo evolução futura com contrato próprio.
- Não alterar a lógica de recomendação.

### Tempo estimado

- 2 blocos de 90 minutos.
- Se a equipa quiser email real, registar como evolução posterior e manter este BK interno.

#### Estado antes e depois

- Estado antes: aplicam-se os BKs declarados em `dependencias`, os RF/RNF do Header e os artefactos já entregues pelas fases anteriores.
- Estado depois: ficam implementáveis e verificáveis apenas os resultados listados em `Scope-in`, sem antecipar o `Scope-out`.

#### Pré-requisitos

- `BK-MF4-01` executado com subscrições.
- `BK-MF4-02` executado com checkout simulado, trial e `grantTrialSubscription`.
- `BK-MF2-05` executado com `savePlaybackProgress`.
- `BK-MF2-01` executado com `req.user`.
- `apiClient` disponível.

#### Glossário

- Notificação transacional: mensagem causada por evento concreto do sistema.
- Preferência: escolha do utilizador sobre que tipos de alerta quer receber.
- Deduplicação: regra que evita criar alertas repetidos para o mesmo evento.
- Ownership: garantia de que uma notificação só é lida pelo respetivo utilizador.

#### Conceitos teóricos essenciais

- Domínio FaithFlix: notificações explicam eventos de subscrição, trial e continuidade sem expor dados sensíveis.
- Backend: o service verifica preferências, aplica deduplicação e grava a notificação.
- Frontend: a página lista notificações, mostra estados e permite alterar preferências.
- Segurança: todas as operações usam `req.user.id`; marcar notificação de outro utilizador devolve erro.
- Dados: `notifications` guarda mensagens; `notification_preferences` guarda escolhas por utilizador.
- `CANONICO`: RF52 exige notificações transacionais; RF53 preferências; RF54 alertas de continuidade.
- `DERIVADO`: `email` pode ficar como preferência futura, mas não há envio externo neste BK.
- `DERIVADO`: preferências de canal e consentimentos são cumulativos;
  `continue_watching` exige `inApp`, `continueWatching` e consentimento
  operacional, enquanto eventos essenciais ignoram apenas o consentimento
  operacional e continuam a respeitar `inApp`/deduplicação.
- `DERIVADO`: o service lê preferências/consentimentos no momento do evento; o
  frontend nunca decide se a notificação é criada.
- `DERIVADO`: a listagem usa `page >= 1`, `1 <= limit <= 50`, total real e
  ordenação estável `createdAt: -1, _id: 1`.
- `DERIVADO`: a UI partilha um `AbortSignal` nas leituras, recusa respostas
  tardias, reverte preferência falhada e mantém busy state por notificação.

### Erros comuns

- Prometer email real sem fornecedor configurado.
- Guardar tokens ou dados de pagamento dentro da notificação.
- Ignorar preferências do utilizador.
- Criar notificações sem ownership.

### Check de compreensão

- [ ] Sei explicar o que torna uma notificação transacional.
- [ ] Sei provar que cada notificação pertence a um utilizador.
- [ ] Sei alterar preferências e ver o efeito em novas notificações.

#### Arquitetura do BK

- Backend: módulo `notifications` com validação, service, controller e router.
- Persistência: `notifications` e `notification_preferences` guardam mensagens e escolhas.
- Frontend: `notificationsApi` e `NotificationsPage` mostram lista, leitura e preferências.
- Segurança: endpoints exigem login e aplicam ownership no filtro de base de dados.
- Integração: services de pagamentos, subscrições e playback chamam `createNotification` ou `createContinueWatchingNotification`.
- `subscription_activated` nasce no mesmo commit do checkout aprovado, depois
  de `activateSubscription`, através do helper transacional criado em
  `BK-MF4-02`; não se cria uma rota de ativação direta.
- Envelope de listagem:
  `{ notifications, page, limit, total, totalPages }`.
- Textos da UI: `Notificações internas`, `Notificações por email`, `Alertas de
  continuidade`, `A guardar preferências...` e `Marcar como lida`.

#### Ficheiros a criar/editar/rever

- CRIAR: `backend/src/modules/notifications/notifications.validation.js`
- EDITAR: `backend/src/modules/notifications/notifications.service.js`
- CRIAR: `backend/src/modules/notifications/notifications.controller.js`
- CRIAR: `backend/src/modules/notifications/notifications.routes.js`
- CRIAR: `frontend/src/services/api/notificationsApi.js`
- CRIAR: `frontend/src/pages/NotificationsPage.jsx`
- EDITAR: `backend/src/app.js`
- EDITAR: `backend/src/server.js`
- EDITAR: `backend/src/modules/payments/payments.service.js`
- EDITAR: `backend/src/modules/subscriptions/subscriptions.service.js`
- EDITAR: `backend/src/modules/playback/playback.service.js`
- EDITAR: `frontend/src/routes/AppRoutes.jsx`
- REVER: `BK-MF4-01`, `BK-MF4-02`, `BK-MF2-05`, `RF52`, `RF53`, `RF54`, `RNF19`

#### Tutorial técnico linear

### Passo 1 - Criar validação de preferências e tipos

1. Objetivo do passo.

Definir tipos de notificação e canais aceites.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/notifications/notifications.validation.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Cria o módulo `notifications`.

4. Código completo.

```js
/**
 * Tipos de notificação gerados pelo backend.
 * A lista fechada evita grafias diferentes para o mesmo evento de negócio.
 */
export const NOTIFICATION_TYPES = [
  "subscription_activated",
  "payment_failed",
  "trial_started",
  "continue_watching",
];

/**
 * Cria um erro HTTP previsivel para validação de notificações.
 *
 * @param {string} message Mensagem segura para o cliente.
 * @param {number} [statusCode=400] Código HTTP de validação.
 * @returns {Error} Erro com `statusCode`.
 */
function httpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

/**
 * Garante que o tipo recebido pertence ao contrato público do módulo.
 *
 * @param {string} type Tipo recebido no evento.
 * @returns {string} Tipo normalizado.
 * @throws {Error} Quando o tipo não existe na lista fechada.
 */
export function assertNotificationType(type) {
  if (typeof type !== "string" || !NOTIFICATION_TYPES.includes(type)) {
    throw httpError("Tipo de notificação inválido.");
  }
  return type;
}

/**
 * Valida texto obrigatório usado em titulo e mensagem.
 *
 * @param {string} value Valor recebido.
 * @param {string} field Nome do campo para mensagem de erro.
 * @param {number} min Tamanho mínimo.
 * @param {number} max Tamanho maximo.
 * @returns {string} Texto normalizado.
 */
function requiredNotificationText(value, field, min, max) {
  if (typeof value !== "string") throw httpError(`${field} deve ser texto.`);
  const text = value.trim();
  if (text.length < min || text.length > max) {
    throw httpError(`${field} deve ter entre ${min} e ${max} caracteres.`);
  }
  return text;
}

/**
 * Valida o conteúdo visível de uma notificação.
 *
 * @param {object} input Dados recebidos pelo service.
 * @returns {{ title: string, message: string }} Conteúdo seguro para persistir.
 */
export function assertNotificationContent(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw httpError("A notificação deve ser um objeto.");
  }
  return {
    title: requiredNotificationText(input.title, "Titulo", 3, 120),
    message: requiredNotificationText(input.message, "Mensagem", 3, 240),
  };
}

export function assertNotificationDedupeKey(value) {
  if (value === undefined || value === null) return null;
  if (
    typeof value !== "string" ||
    value.length < 1 ||
    value.length > 160 ||
    !/^[A-Za-z0-9:._-]+$/.test(value)
  ) {
    throw httpError("Chave de deduplicação inválida.");
  }
  return value;
}

/**
 * Normaliza preferências de notificação guardadas por utilizador.
 *
 * @param {object} input Preferências recebidas da UI.
 * @returns {{ inApp: boolean, email: boolean, continueWatching: boolean }} Preferências persistiveis.
 */
export function assertPreferencePayload(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw httpError("As preferências devem ser um objeto JSON.");
  }
  const allowedFields = ["inApp", "email", "continueWatching"];
  if (Object.keys(input).some((key) => !allowedFields.includes(key))) {
    throw httpError("As preferências contêm campos não permitidos.");
  }
  if (allowedFields.some((key) => typeof input[key] !== "boolean")) {
    throw httpError("As preferências devem usar booleanos JSON.");
  }
  return {
    inApp: input.inApp,
    email: input.email,
    continueWatching: input.continueWatching,
  };
}

export function assertNotificationListQuery(query) {
  if (!query || typeof query !== "object" || Array.isArray(query)) {
    throw httpError("Query de notificações inválida.");
  }
  if (Object.keys(query).some((key) => !["page", "limit"].includes(key))) {
    throw httpError("Query de notificações contém campos não permitidos.");
  }

  function parse(value, field, defaultValue, maximum) {
    if (value === undefined) return defaultValue;
    if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
      throw httpError(`${field} inválido.`);
    }
    const parsed = Number.parseInt(value, 10);
    if (!Number.isSafeInteger(parsed) || parsed > maximum) {
      throw httpError(`${field} inválido.`);
    }
    return parsed;
  }

  return {
    page: parse(query.page, "Página", 1, 1_000_000),
    limit: parse(query.limit, "Limite", 20, 50),
  };
}
```

5. Explicação do código ou da decisão.

Tipos fechados evitam nomes diferentes para o mesmo evento. A validação de titulo e mensagem impede notificações vazias, demasiado longas ou pouco claras. `email` fica como preferência guardada, mas sem envio real.

6. Validação do passo.

```bash
node -e "import('./src/modules/notifications/notifications.validation.js').then(({ assertNotificationType }) => console.log(assertNotificationType('trial_started')))"
```

7. Caso negativo, erro comum ou risco que este passo evita.

Sem tipos fechados, um evento podia ficar como `trial`, outro como `trialStart` e outro como `trial_started`.

### Passo 2 - Criar service de notificações

1. Objetivo do passo.

Guardar preferências, criar notificações e listar notificações do utilizador autenticado.

2. Ficheiros envolvidos.
    - EDITAR: `backend/src/modules/notifications/notifications.service.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Estende o `notifications.service.js` criado em `BK-MF4-02`. Substitui o
conteúdo pela versão completa abaixo, preservando a assinatura
`createNotification(userId, input, options)` e os três eventos essenciais; o
mesmo módulo passa também a suportar preferências, paginação, deduplicação e
`continue_watching`.

4. Código completo com paginação estável e contexto `db/session` injetável.

```js
/**
 * Módulo de serviço para notificações internas e preferências do utilizador.
 *
 * Centraliza ownership, deduplicação e validação de tipos para garantir que cada
 * utilizador só lê e altera notificações pertencentes à sua própria sessão.
 */
import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import {
  assertNotificationContent,
  assertNotificationDedupeKey,
  assertNotificationType,
  assertPreferencePayload,
} from "./notifications.validation.js";

/**
 * Converte o utilizador autenticado para `ObjectId`.
 *
 * @param {string} userId Identificador vindo da sessão.
 * @returns {ObjectId} Identificador MongoDB.
 * @throws {Error} Quando o identificador e inválido.
 */
function asUserObjectId(userId) {
  if (typeof userId !== "string" || !/^[a-f\d]{24}$/i.test(userId)) {
    const error = new Error("Utilizador inválido.");
    error.statusCode = 400;
    throw error;
  }
  return ObjectId.createFromHexString(userId);
}

/**
 * Converte o identificador da notificação para `ObjectId`.
 *
 * @param {string} notificationId Identificador recebido na rota.
 * @returns {ObjectId} Identificador MongoDB.
 * @throws {Error} Quando o identificador e inválido.
 */
function asNotificationObjectId(notificationId) {
  if (typeof notificationId !== "string" || !/^[a-f\d]{24}$/i.test(notificationId)) {
    const error = new Error("Notificação inválida.");
    error.statusCode = 400;
    throw error;
  }
  return ObjectId.createFromHexString(notificationId);
}

/**
 * Remove campos internos antes de devolver uma notificação ao frontend.
 *
 * @param {object} notification Documento MongoDB.
 * @returns {object} Notificação pública.
 */
function publicNotification(notification) {
  return {
    id: notification._id.toHexString(),
    type: notification.type,
    title: notification.title,
    message: notification.message,
    readAt: notification.readAt ?? null,
    createdAt: notification.createdAt,
  };
}

/**
 * Cria indices para preferências, listagem e deduplicacao de eventos.
 *
 * @returns {Promise<void>}
 */
export async function ensureNotificationIndexes() {
  const db = await getDb();
  await db.collection("notification_preferences").createIndex({ userId: 1 }, { unique: true });
  await db.collection("notifications").createIndex({ userId: 1, createdAt: -1, _id: 1 });
  await db.collection("notifications").createIndex(
    { userId: 1, type: 1, dedupeKey: 1 },
    { unique: true, partialFilterExpression: { dedupeKey: { $exists: true } } },
  );
}

/**
 * Obtem preferências do utilizador autenticado com valores por defeito.
 *
 * @param {string} userId Identificador do utilizador.
 * @returns {Promise<{ preferences: object }>} Preferências atuais.
 */
export async function getPreferences(userId, options = {}) {
  const db = options.db ?? await getDb();
  const userObjectId = asUserObjectId(userId);
  const preferences = await db.collection("notification_preferences").findOne(
    { userId: userObjectId },
    options.session ? { session: options.session } : {},
  );
  return {
    preferences: preferences?.settings ?? { inApp: true, email: false, continueWatching: true },
  };
}

/**
 * Atualiza preferências de notificação do utilizador autenticado.
 *
 * @param {string} userId Identificador do utilizador.
 * @param {object} input Preferências recebidas da UI.
 * @returns {Promise<{ preferences: object }>} Preferências guardadas.
 */
export async function updatePreferences(userId, input, options = {}) {
  const db = options.db ?? await getDb();
  const userObjectId = asUserObjectId(userId);
  const settings = assertPreferencePayload(input);
  // `upsert` cria preferências na primeira visita sem exigir passo de inicializacao.
  await db.collection("notification_preferences").updateOne(
    { userId: userObjectId },
    { $set: { settings, updatedAt: new Date() }, $setOnInsert: { userId: userObjectId, createdAt: new Date() } },
    { upsert: true, ...(options.session ? { session: options.session } : {}) },
  );
  return { preferences: settings };
}

/**
 * Cria uma notificação interna respeitando preferências e deduplicacao.
 *
 * @param {string} userId Identificador do utilizador destinatario.
 * @param {object} input Evento e conteúdo da notificação.
 * @returns {Promise<{ notification: object | null, skipped: boolean }>} Notificação criada ou motivo de omissao.
 */
export async function createNotification(userId, input, options = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    const error = new Error("Notificação inválida.");
    error.statusCode = 400;
    throw error;
  }
  const db = options.db ?? await getDb();
  const mongoOptions = options.session ? { session: options.session } : {};
  const userObjectId = asUserObjectId(userId);
  const type = assertNotificationType(input.type);
  const content = assertNotificationContent(input);
  const dedupeKey = assertNotificationDedupeKey(input.dedupeKey);
  const { preferences } = await getPreferences(userId, {
    db,
    session: options.session,
  });
  const privacyConsent = await db.collection("user_consents").findOne(
    { userId: userObjectId },
    mongoOptions,
  );

  // Se o utilizador desligou notificações internas, o evento fica sem entrega in-app.
  if (!preferences.inApp) {
    return { notification: null, skipped: true };
  }

  // A preferência granular só bloqueia alertas de continuidade, não eventos transacionais.
  if (
    type === "continue_watching" &&
    (!preferences.continueWatching ||
      privacyConsent?.consents?.operationalNotifications === false)
  ) {
    return { notification: null, skipped: true };
  }

  if (dedupeKey) {
    // A deduplicacao evita repetir alertas para o mesmo conteúdo ou evento.
    const existing = await db.collection("notifications").findOne(
      { userId: userObjectId, type, dedupeKey },
      mongoOptions,
    );

    if (existing) {
      return { notification: publicNotification(existing), skipped: true };
    }
  }

  const notification = {
    userId: userObjectId,
    type,
    title: content.title,
    message: content.message,
    ...(dedupeKey ? { dedupeKey } : {}),
    readAt: null,
    createdAt: new Date(),
  };

  try {
    const result = await db.collection("notifications").insertOne(
      notification,
      mongoOptions,
    );
    return {
      notification: publicNotification({ ...notification, _id: result.insertedId }),
      skipped: false,
    };
  } catch (error) {
    if (error?.code !== 11000 || !dedupeKey) throw error;
    // Numa transação, o conflito aborta a tentativa e deve subir para o retry
    // de `runInTransaction`; não se continua a usar uma sessão abortada.
    if (options.session) throw error;
    const existing = await db.collection("notifications").findOne(
      { userId: userObjectId, type, dedupeKey },
      mongoOptions,
    );
    if (!existing) throw error;
    return { notification: publicNotification(existing), skipped: true };
  }
}

/**
 * Cria alerta para conteúdo iniciado e ainda não terminado.
 *
 * @param {string} userId Identificador do utilizador.
 * @param {object} input Dados minimos do conteúdo.
 * @returns {Promise<{ notification: object | null, skipped: boolean }>} Resultado da criacao.
 */
export async function createContinueWatchingNotification(userId, input, options = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    const error = new Error("Conteúdo inválido para alerta de continuidade.");
    error.statusCode = 400;
    throw error;
  }
  const { contentId, contentTitle } = input;
  if (typeof contentId !== "string" || !/^[a-f\d]{24}$/i.test(contentId)) {
    const error = new Error("Conteúdo inválido para alerta de continuidade.");
    error.statusCode = 400;
    throw error;
  }
  if (typeof contentTitle !== "string" || contentTitle.trim().length < 1 || contentTitle.trim().length > 120) {
    const error = new Error("Título de conteúdo inválido.");
    error.statusCode = 400;
    throw error;
  }

  return createNotification(
    userId,
    {
      type: "continue_watching",
      title: "Continua a ver",
      message: `Tens "${contentTitle.trim()}" por terminar.`,
      dedupeKey: `continue:${contentId}`,
    },
    options,
  );
}

/**
 * Lista as notificações recentes do utilizador autenticado.
 *
 * @param {string} userId Identificador do utilizador.
 * @returns {Promise<{ notifications: object[] }>} Lista ordenada da mais recente para a mais antiga.
 */
export async function listMyNotifications(userId, { page, limit }) {
  const db = await getDb();
  const filter = { userId: asUserObjectId(userId) };
  const collection = db.collection("notifications");
  const total = await collection.countDocuments(filter);
  const notifications = await collection
    .find(filter)
    .sort({ createdAt: -1, _id: 1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .toArray();
  return {
    notifications: notifications.map(publicNotification),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Marca uma notificação como lida, aplicando ownership no filtro.
 *
 * @param {string} userId Identificador do utilizador autenticado.
 * @param {string} notificationId Identificador da notificação.
 * @returns {Promise<{ notification: object }>} Notificação atualizada.
 */
export async function markNotificationAsRead(userId, notificationId) {
  const db = await getDb();
  // O filtro por `userId` impede marcar notificações pertencentes a outro utilizador.
  const notification = await db.collection("notifications").findOneAndUpdate(
    { _id: asNotificationObjectId(notificationId), userId: asUserObjectId(userId) },
    { $set: { readAt: new Date() } },
    { returnDocument: "after" },
  );
  if (!notification) {
    const error = new Error("Notificação não encontrada.");
    error.statusCode = 404;
    throw error;
  }
  return { notification: publicNotification(notification) };
}
```

5. Explicação do código ou da decisão.

O service aplica ownership em todos os acessos. Notificações não incluem dados sensíveis: apenas titulo, mensagem e tipo. `dedupeKey` evita repetir alertas de continuidade para o mesmo conteúdo.

`findOneAndUpdate` devolve o documento atualizado ou `null` na versão atual do driver MongoDB usada pelo projeto. Por isso, `markNotificationAsRead` valida diretamente `notification` e não acede a `.value`.

6. Validação do passo.

```bash
node -e "import('./src/modules/notifications/notifications.service.js').then((m) => console.log(typeof m.createNotification, typeof m.createContinueWatchingNotification, typeof m.updatePreferences))"
```

7. Caso negativo, erro comum ou risco que este passo evita.

Sem filtro por `userId`, um utilizador podia marcar notificações de outro como lidas. Sem validação de `notificationId`, um ID inválido podia rebentar como erro técnico em vez de devolver `400`.

### Passo 3 - Criar endpoints

1. Objetivo do passo.

Expor preferências e notificações do utilizador autenticado.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/notifications/notifications.controller.js`
    - CRIAR: `backend/src/modules/notifications/notifications.routes.js`
    - EDITAR: `backend/src/app.js`
    - EDITAR: `backend/src/server.js`

3. Instrucoes concretas.

Monta router em `/api/notifications`.

4. Código completo.

`backend/src/modules/notifications/notifications.controller.js`

```js
/**
 * Módulo de controllers HTTP para notificações internas.
 *
 * Recebe pedidos autenticados e delega no service a validação de ownership,
 * leitura, marcação como lida e atualização de preferências.
 */
import {
  getPreferences,
  listMyNotifications,
  markNotificationAsRead,
  updatePreferences,
} from "./notifications.service.js";
import { assertNotificationListQuery } from "./notifications.validation.js";

/**
 * Lista notificações do utilizador autenticado.
 *
 * @param {import("express").Request} req Pedido autenticado.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<void>}
 */
export async function getMyNotifications(req, res) {
  const query = assertNotificationListQuery(req.query);
  res.status(200).json(await listMyNotifications(req.user.id, query));
}

/**
 * Marca uma notificação do proprio utilizador como lida.
 *
 * @param {import("express").Request} req Pedido com `params.id`.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<void>}
 */
export async function patchReadNotification(req, res) {
  res.status(200).json(await markNotificationAsRead(req.user.id, req.params.id));
}

/**
 * Devolve preferências atuais do utilizador autenticado.
 *
 * @param {import("express").Request} req Pedido autenticado.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<void>}
 */
export async function getMyPreferences(req, res) {
  res.status(200).json(await getPreferences(req.user.id));
}

/**
 * Atualiza preferências atuais do utilizador autenticado.
 *
 * @param {import("express").Request} req Pedido com corpo de preferências.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<void>}
 */
export async function putMyPreferences(req, res) {
  res.status(200).json(await updatePreferences(req.user.id, req.body));
}
```

`backend/src/modules/notifications/notifications.routes.js`

```js
/**
 * Módulo de rotas de notificações.
 *
 * Protege todos os endpoints com autenticação porque notificações e preferências
 * são dados privados associados ao utilizador da sessão.
 */
import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import {
  getMyNotifications,
  getMyPreferences,
  patchReadNotification,
  putMyPreferences,
} from "./notifications.controller.js";

/**
 * Router de notificações internas.
 * Todas as rotas usam `requireAuth` porque preferências e mensagens pertencem a um utilizador.
 */
export const notificationsRouter = Router();

notificationsRouter.get("/", requireAuth, asyncHandler(getMyNotifications));
notificationsRouter.patch("/:id/read", requireAuth, asyncHandler(patchReadNotification));
notificationsRouter.get("/preferences/me", requireAuth, asyncHandler(getMyPreferences));
notificationsRouter.put("/preferences/me", requireAuth, asyncHandler(putMyPreferences));
```

Trecho esperado em `backend/src/app.js`:

```js
import { notificationsRouter } from "./modules/notifications/notifications.routes.js";

app.use("/api/notifications", notificationsRouter);
```

Trecho esperado em `backend/src/server.js`:

```js
import { ensureNotificationIndexes } from "./modules/notifications/notifications.service.js";

await ensureNotificationIndexes();
```

5. Explicação do código ou da decisão.

Todas as rotas exigem login porque notificações e preferências pertencem ao utilizador.

6. Validação do passo.

```bash
curl -i http://localhost:3000/api/notifications
```

Sem cookie deve devolver `401`.

7. Caso negativo, erro comum ou risco que este passo evita.

Rota pública de notificações exporia mensagens privadas.

### Passo 4 - Criar frontend de notificações e preferências

1. Objetivo do passo.

Mostrar notificações e permitir editar preferências.

2. Ficheiros envolvidos.
    - CRIAR: `frontend/src/services/api/notificationsApi.js`
    - CRIAR: `frontend/src/pages/NotificationsPage.jsx`
    - EDITAR: `frontend/src/routes/AppRoutes.jsx`

3. Instrucoes concretas.

Substitui a página placeholder da rota `/notificacoes` criada em `BK-MF1-02`.
Não cries uma rota inglesa concorrente nem substituas o router cumulativo.

4. Código completo com cancelamento, proteção anti-stale, rollback e busy state
   localizado.

`frontend/src/services/api/notificationsApi.js`

```js
/**
 * Módulo cliente para a API de notificações.
 *
 * Agrupa chamadas HTTP de leitura, marcação como lida e preferências, usando o
 * `apiClient` para preservar cookies HttpOnly sem expor tokens no frontend.
 */
import { apiClient } from "./apiClient.js";

export const notificationsApi = {
  /**
   * Lista notificações do utilizador autenticado.
   *
   * @returns {Promise<{ notifications: object[] }>} Notificações recentes.
   */
  list({ page = 1, limit = 20 } = {}, options = {}) {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    return apiClient.get(`/api/notifications?${params.toString()}`, options);
  },
  /**
   * Marca uma notificação como lida.
   *
   * @param {string} id Identificador da notificação.
   * @returns {Promise<object>} Notificação atualizada.
   */
  markAsRead(id, options = {}) {
    return apiClient.patch(
      `/api/notifications/${encodeURIComponent(id)}/read`,
      undefined,
      options,
    );
  },
  /**
   * Obtem preferências de notificação.
   *
   * @returns {Promise<{ preferences: object }>} Preferências atuais.
   */
  getPreferences(options = {}) {
    return apiClient.get("/api/notifications/preferences/me", options);
  },
  /**
   * Atualiza preferências de notificação no backend.
   *
   * @param {object} input Preferências escolhidas pelo utilizador.
   * @returns {Promise<{ preferences: object }>} Preferências guardadas.
   */
  updatePreferences(input, options = {}) {
    return apiClient.put("/api/notifications/preferences/me", input, options);
  },
};
```

`frontend/src/pages/NotificationsPage.jsx`

```jsx
/**
 * Módulo da página de notificações e preferências.
 *
 * Carrega mensagens e preferências do utilizador autenticado, permitindo alterar
 * opções sem expor dados de outros utilizadores ou depender de estado local como fonte de verdade.
 */
import { useEffect, useRef, useState } from "react";
import { useSession } from "../context/SessionContext.jsx";
import { notificationsApi } from "../services/api/notificationsApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

/**
 * Página de notificações e preferências do utilizador autenticado.
 *
 * @returns {JSX.Element} Interface de leitura e configuracao de notificações.
 */
export function NotificationsPage() {
  const { status: sessionStatus, user } = useSession();
  const [notifications, setNotifications] = useState([]);
  const [preferences, setPreferences] = useState({ inApp: true, email: false, continueWatching: true });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [readingIds, setReadingIds] = useState(() => new Set());
  const contextVersionRef = useRef(0);
  const preferenceControllerRef = useRef(null);
  const readControllersRef = useRef(new Map());
  const sessionKey = `${sessionStatus}:${user?.id ?? ""}`;

  useEffect(() => {
    const version = ++contextVersionRef.current;
    const controller = new AbortController();
    preferenceControllerRef.current?.abort();
    preferenceControllerRef.current = null;
    for (const current of readControllersRef.current.values()) current.abort();
    readControllersRef.current.clear();
    setReadingIds(new Set());
    setSavingPreferences(false);
    setError("");

    function abortContextRequests() {
      controller.abort();
      preferenceControllerRef.current?.abort();
      for (const current of readControllersRef.current.values()) current.abort();
      readControllersRef.current.clear();
    }

    if (sessionStatus !== "authenticated") {
      setLoading(false);
      if (sessionStatus === "unavailable") {
        setError("Não foi possível confirmar a sessão. Tenta novamente.");
      }
      return abortContextRequests;
    }

    setLoading(true);
    Promise.all([
      notificationsApi.list({ page: 1, limit: 20 }, { signal: controller.signal }),
      notificationsApi.getPreferences({ signal: controller.signal }),
    ])
      .then(([notificationsResponse, preferencesResponse]) => {
        if (controller.signal.aborted || version !== contextVersionRef.current) return;
        setNotifications(notificationsResponse.notifications);
        setPagination({
          page: notificationsResponse.page,
          limit: notificationsResponse.limit,
          total: notificationsResponse.total,
          totalPages: notificationsResponse.totalPages,
        });
        setPreferences(preferencesResponse.preferences);
        setLoading(false);
      })
      .catch((apiError) => {
        if (controller.signal.aborted || apiError?.name === "AbortError") return;
        if (version !== contextVersionRef.current) return;
        setError(toUserMessage(apiError));
        setLoading(false);
      });

    return abortContextRequests;
  }, [sessionKey]);

  /**
   * Atualiza uma preferência e guarda a alteracao no backend.
   *
   * @param {"inApp" | "email" | "continueWatching"} field Preferência alterada.
   * @param {boolean} value Novo valor.
   * @returns {Promise<void>}
   */
  async function updatePreference(field, value) {
    // O ref é a reserva síncrona. Ao contrário do state React, fica preenchido
    // antes do próximo evento e impede duas escritas no mesmo tick.
    if (preferenceControllerRef.current) return;
    const version = contextVersionRef.current;
    const controller = new AbortController();
    preferenceControllerRef.current = controller;
    const previous = preferences;
    const next = { ...preferences, [field]: value };
    setPreferences(next);
    setSavingPreferences(true);
    setError("");
    try {
      const response = await notificationsApi.updatePreferences(next, {
        signal: controller.signal,
      });
      if (
        controller.signal.aborted ||
        version !== contextVersionRef.current ||
        preferenceControllerRef.current !== controller
      ) return;
      setPreferences(response.preferences);
    } catch (apiError) {
      if (controller.signal.aborted || apiError?.name === "AbortError") return;
      if (
        version !== contextVersionRef.current ||
        preferenceControllerRef.current !== controller
      ) return;
      setPreferences(previous);
      setError(toUserMessage(apiError));
    } finally {
      if (preferenceControllerRef.current === controller) {
        preferenceControllerRef.current = null;
        if (version === contextVersionRef.current) setSavingPreferences(false);
      }
    }
  }

  /**
   * Marca uma notificação como lida e recarrega a lista.
   *
   * @param {string} id Identificador da notificação.
   * @returns {Promise<void>}
   */
  async function markAsRead(id) {
    if (readControllersRef.current.has(id)) return;
    const version = contextVersionRef.current;
    const controller = new AbortController();
    readControllersRef.current.set(id, controller);
    setReadingIds((current) => new Set(current).add(id));
    setError("");
    try {
      const response = await notificationsApi.markAsRead(id, {
        signal: controller.signal,
      });
      if (controller.signal.aborted || version !== contextVersionRef.current) return;
      setNotifications((current) => current.map((notification) => (
        notification.id === id ? response.notification : notification
      )));
    } catch (apiError) {
      if (controller.signal.aborted || apiError?.name === "AbortError") return;
      if (version !== contextVersionRef.current) return;
      setError(toUserMessage(apiError));
    } finally {
      if (readControllersRef.current.get(id) === controller) {
        readControllersRef.current.delete(id);
      }
      if (version === contextVersionRef.current) {
        setReadingIds((current) => {
          const next = new Set(current);
          next.delete(id);
          return next;
        });
      }
    }
  }

  return (
    <main>
      <h1>Notificações</h1>
      {error && <p role="alert">{error}</p>}
      <section>
        <h2>Preferências</h2>
        <label><input type="checkbox" checked={preferences.inApp} disabled={savingPreferences} onChange={(e) => updatePreference("inApp", e.target.checked)} /> Notificações internas</label>
        <label><input type="checkbox" checked={preferences.email} disabled={savingPreferences} onChange={(e) => updatePreference("email", e.target.checked)} /> Notificações por email</label>
        <label><input type="checkbox" checked={preferences.continueWatching} disabled={savingPreferences} onChange={(e) => updatePreference("continueWatching", e.target.checked)} /> Alertas de continuidade</label>
        {savingPreferences && <p role="status">A guardar preferências...</p>}
      </section>
      <section>
        <h2>Recentes</h2>
        {loading && <p>A carregar notificações...</p>}
        {!loading && notifications.length === 0 && !error && <p>Sem notificações.</p>}
        {!loading && pagination.total > 0 && <p>{pagination.total} notificação(ões).</p>}
        {notifications.map((notification) => (
          <article key={notification.id}>
            <h3>{notification.title}</h3>
            <p>{notification.message}</p>
            {!notification.readAt && (
              <button
                type="button"
                aria-busy={readingIds.has(notification.id)}
                disabled={readingIds.has(notification.id)}
                onClick={() => markAsRead(notification.id)}
              >
                {readingIds.has(notification.id) ? "A marcar..." : "Marcar como lida"}
              </button>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}
```

Em `frontend/src/routes/AppRoutes.jsx`, substitui a declaração lazy original de
`NotificationsPage`; não acrescentes um segundo binding com o mesmo nome:

```jsx
// SUBSTITUIR a declaração lazy criada em BK-MF1-02.
const NotificationsPage = lazyNamedPage(
  () => import("../pages/NotificationsPage.jsx"),
  "NotificationsPage",
);

<Route path="/notificacoes" element={<NotificationsPage />} />
```

5. Explicação do código ou da decisão.

A página mostra estado vazio, erro e preferências. Não usa `localStorage`; tudo fica no backend por utilizador. `preferenceControllerRef` é preenchido antes de qualquer `setState`, por isso reserva a escrita no mesmo tick; a resposta e o rollback só podem alterar a UI enquanto esse controller continuar a ser a operação corrente e a versão de sessão não tiver mudado. A substituição pontual do binding conserva lazy loading, lifecycle e todas as rotas anteriores.

6. Validação do passo.

Entrar, abrir `/notificacoes`, alterar preferências e marcar uma notificação como lida.

7. Caso negativo, erro comum ou risco que este passo evita.

Guardar preferências no browser perderia sincronizacao entre dispositivos e não serviria para o backend decidir se cria notificação.

### Passo 5 - Integrar eventos de subscrição e trial

1. Objetivo do passo.

Mostrar onde os BKs anteriores devem chamar o service de notificações.

2. Ficheiros envolvidos.
    - EDITAR: `backend/src/modules/payments/payments.service.js`
    - EDITAR: `backend/src/modules/subscriptions/subscriptions.service.js`
    - EDITAR: `backend/src/modules/playback/playback.service.js`

3. Instrucoes concretas.

Não reescrevas neste BK `createSimulatedCheckout`, `startTrial`,
`activateSubscription` ou `grantTrialSubscription`. O código financeiro
autoritativo é o Passo 2 de `BK-MF4-02`: exige `Idempotency-Key`, calcula
`requestHash`, persiste o ledger v2 e executa tentativa, subscrição, trial,
notificação e audit dentro da mesma chamada a `runInTransaction`.

Primeiro conclui esse contrato. Este BK acrescenta apenas os eventos de
notificação nos pontos transacionais já existentes:

- checkout recusado cria `payment_failed` antes do retorno da callback;
- checkout aprovado chama `activateSubscription` e, logo depois, o helper
  `createNotification` com a mesma `{ db, session }` para criar uma única
  `subscription_activated`;
- trial cria `trial_started` depois de persistir trial e subscrição, mas ainda
  antes do commit;
- todas as leituras/escritas de preferências, consentimentos, deduplicação e
  notificação recebem a mesma `{ db, session }` e são sequenciais dentro da
  transação.

4. Código de integração de notificações.

Em `backend/src/modules/payments/payments.service.js`, confirma o import já
previsto no `BK-MF4-02`:

```js
// Reutiliza o helper criado em MF4-02; este BK estende o módulo, não cria um segundo service financeiro.
import { createNotification } from "../notifications/notifications.service.js";
```

No ramo recusado de `createSimulatedCheckout`, dentro da callback
`runInTransaction(async ({ db, session }) => { ... })`, mantém apenas a
integração seguinte. Não cries uma função alternativa com dois argumentos:

```js
// O evento recusado permanece dentro da mesma transação e recebe a mesma db/session do checkout.
await createNotification(
  userId,
  {
    type: "payment_failed",
    title: "Pagamento recusado",
    message:
      "O pagamento simulado foi recusado. Podes tentar novamente com outro método de teste.",
  },
  { db, session },
);
```

No ramo aprovado, preserva a sequência já criada no `BK-MF4-02`; este BK apenas
estende o helper chamado por essa sequência:

```js
// A notificação só é criada depois da subscrição e antes do commit conjunto.
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
```

Dentro da callback transacional de `startTrial` definida no `BK-MF4-02`,
preserva a chamada que já existe após `trials.insertOne` e
`grantTrialSubscription`; não acrescentes uma segunda:

```js
// O trial reutiliza o evento já previsto em MF4-02 e não duplica a notificação no replay idempotente.
await createNotification(
  userId,
  {
    type: "trial_started",
    title: "Trial iniciado",
    message: "O teu trial FaithFlix ficou ativo durante 14 dias.",
  },
  { db, session },
);
```

O service de notificações do Passo 2 deve, por isso, terminar com a assinatura
`createNotification(userId, input, options = {})`. Quando `options.db` e
`options.session` existem, não abre outra ligação e passa `{ session }` a cada
operação MongoDB. Não uses `Promise.all` dentro da transação.

No topo de `backend/src/modules/playback/playback.service.js`, acrescenta estes
imports mantendo os imports existentes:

```js
import { runInTransaction } from "../../config/database.js";
import { writeAdminAudit } from "../audit/audit.service.js";
import { createContinueWatchingNotification } from "../notifications/notifications.service.js";
```

Não substituas o `savePlaybackProgress` seguro de `BK-MF2-05` por uma versão
simplificada. Faz uma composição cumulativa no mesmo
`backend/src/modules/playback/playback.service.js`: preserva `asObjectId`,
`assertProgressPayload`, `publicProgress`, `publicPlaybackContent` e o
`assertParentalAccess` consolidado em `BK-MF2-06`. Edita apenas
`loadEligibleContent` para aceitar a sessão e mantém as leituras sequenciais
dentro da transação:

```js
/**
 * Carrega conteúdo publicado e utilizador, aplicando parental e media-ready.
 *
 * @param {import("mongodb").Db} db Base MongoDB já selecionada.
 * @param {import("mongodb").ObjectId} contentObjectId Conteúdo pedido.
 * @param {import("mongodb").ObjectId} userObjectId Utilizador autenticado.
 * @param {{ session?: import("mongodb").ClientSession }} options Contexto MongoDB.
 * @returns {Promise<{ content: object, user: object }>} Entidades autorizadas.
 */
async function loadEligibleContent(
  db,
  contentObjectId,
  userObjectId,
  options = {},
) {
  const mongoOptions = options.session ? { session: options.session } : {};
  const content = await db.collection("contents").findOne(
    { _id: contentObjectId, status: "published" },
    mongoOptions,
  );
  if (!content) throw new HttpError(404, "Conteudo nao encontrado.");

  const user = await db.collection("users").findOne(
    { _id: userObjectId },
    mongoOptions,
  );
  if (!user) throw new HttpError(401, "Autenticacao obrigatoria.");

  assertParentalAccess(user, content);
  // O serializer valida também a fonte canónica e lança MEDIA_NOT_READY.
  publicPlaybackContent(content);
  return { content, user };
}
```

Depois edita cumulativamente a função existente para que progresso,
notificação nova e respetivo audit façam commit ou rollback em conjunto:

```js
/**
 * Guarda progresso de visualizacao e cria alerta de continuidade quando faz sentido.
 *
 * @param {string} contentId Identificador do conteúdo.
 * @param {string} userId Identificador do utilizador autenticado.
 * @param {object} input Progresso recebido da UI.
 * @returns {Promise<object>} Progresso público atualizado.
 */
export async function savePlaybackProgress(contentId, userId, input) {
  const contentObjectId = asObjectId(contentId, "Conteúdo");
  const userObjectId = asObjectId(userId, "Utilizador");

  return runInTransaction(async ({ db, session }) => {
    // Publicação, parental e media-ready são validados antes da primeira escrita.
    const { content } = await loadEligibleContent(
      db,
      contentObjectId,
      userObjectId,
      { session },
    );
    const progress = assertProgressPayload(input, content.durationSeconds);
    const now = new Date();

    await db.collection("playback_progress").updateOne(
      { userId: userObjectId, contentId: contentObjectId },
      {
        $set: { ...progress, lastWatchedAt: now, updatedAt: now },
        $setOnInsert: {
          userId: userObjectId,
          contentId: contentObjectId,
          createdAt: now,
        },
      },
      { upsert: true, session },
    );

    if (!progress.completed && progress.currentTimeSeconds >= 60) {
      // O mesmo contexto torna progresso, evento deduplicado e audit atómicos.
      const notificationResult = await createContinueWatchingNotification(
        userId,
        { contentId, contentTitle: content.title },
        { db, session },
      );

      if (!notificationResult.skipped && notificationResult.notification) {
        await writeAdminAudit({
          db,
          session,
          actorUserId: userObjectId,
          action: "playback.continue_watching_created",
          targetType: "content",
          targetId: contentObjectId,
          after: {
            currentTimeSeconds: progress.currentTimeSeconds,
            completed: progress.completed,
          },
        });
      }
    }

    return publicProgress(
      { ...progress, lastWatchedAt: now },
      content.durationSeconds,
    );
  });
}
```

5. Explicação do código ou da decisão.

A notificação nasce no backend, perto da regra de negócio. Assim, se no futuro
existir app mobile, a regra continua central. O checkout aprovado mantém um
único ponto de criação de `subscription_activated` imediatamente após a
ativação transacional; checkout falhado e trial usam os eventos já definidos em
`BK-MF4-02`. O alerta opcional `continue_watching` nasce em
`savePlaybackProgress`, mas só é persistido quando preferências e consentimento
operacional o permitem; `dedupeKey` e o índice único evitam duplicados. A fila
serializada do `BK-MF2-05` continua a coalescer gravações no frontend; a
transação acrescentada aqui garante que uma falha na notificação ou no audit
também reverte o progresso. Um conflito concorrente de deduplicação aborta a
tentativa transacional; a repetição serializada encontra o evento já existente,
sem criar uma segunda notificação.

A validação do plano no checkout preserva a regra do `BK-MF4-02`: um `planCode` inválido falha antes de gravar a tentativa, evitando uma tentativa aprovada sem subscrição associada.

6. Validação do passo.

Executar checkout simulado aprovado e confirmar uma notificação `subscription_activated` em `/api/notifications`. Depois executar checkout simulado falhado e confirmar `payment_failed`. Por fim, iniciar trial e confirmar `trial_started` e `subscription.status: "trialing"`. Guardar progresso com `currentTimeSeconds >= 60` e `completed: false` deve criar uma notificação `continue_watching`. Faz fault injection no update de progresso, na criação da notificação e no audit: em cada falha, nenhuma das três coleções pode ficar parcialmente alterada. Confirma ainda que conteúdo bloqueado pelo parental ou com `MEDIA_NOT_READY` produz zero escritas.

7. Caso negativo, erro comum ou risco que este passo evita.

Criar notificação apenas no frontend faria desaparecer o evento se o utilizador
fechasse a página. Repetir neste BK as chamadas essenciais já presentes em
`payments.service.js`, ou movê-las também para `activateSubscription`,
duplicaria a mensagem.

#### Critérios de aceite

- `GET /api/notifications` exige login e devolve apenas notificações do utilizador.
- `PUT /api/notifications/preferences/me` guarda preferências por utilizador.
- Checkout/trial cria notificação interna quando `inApp` esta ativo.
- Trial devolve também `subscription.status: "trialing"` e reutiliza o acesso premium do `BK-MF4-01`.
- `PUT /api/playback/:contentId/progress` com progresso incompleto acima de 60 segundos cria uma notificação `continue_watching`.
- Preferência `continueWatching: false` bloqueia notificações desse tipo.
- Consentimento `operationalNotifications: false` bloqueia `continue_watching`, mas não elimina eventos transacionais essenciais.
- Repetir progresso no mesmo conteúdo não duplica alerta `continue_watching`.
- Progresso, notificação nova e audit fazem commit/rollback na mesma transação;
  parental e media-ready são validados antes da primeira escrita.
- Marcar notificação de outro utilizador devolve `404` ou `403`; ID inválido devolve `400`.
- `limit > 50`, página inválida e booleanos não reais nas preferências devolvem
  `400`; a listagem inclui metadata total e ordenação estável.
- Falha ao guardar preferências repõe o estado anterior; abort/unmount não mostra
  erro nem aplica estado tardio; marcação de leitura bloqueia apenas a linha ativa.

#### Validação final

```bash
cd backend
npm test
```

Testar listagem, preferências, criação por evento, trial com subscrição `trialing`, progresso a gerar `continue_watching`, consentimento operacional desligado, deduplicação e ownership.

#### Evidence para PR/defesa

- `pr`: commit/PR com módulo `notifications`.
- `proof`: captura da página de notificações, JSON de preferências e eventos `subscription_activated`, `trial_started` e `continue_watching`.
- `neg`: sem login, notificação de outro utilizador, ID inválido, preferência ou consentimento a bloquear `continue_watching`, evento transacional preservado e tentativa repetida sem duplicação.

#### Handoff

O `BK-MF4-03` continua a pool de associações. Se a equipa quiser notificar admins sobre nova candidatura, deve chamar `createNotification` apenas para utilizadores admin existentes, sem criar canal externo. Manter `grantTrialSubscription` do `BK-MF4-02` quando este BK for implementado para não perder o acesso premium do trial.

## Snippet técnico aplicável

```js
// Dentro da callback de runInTransaction e com a mesma db/session:
await createContinueWatchingNotification(
  userId,
  { contentId, contentTitle: content.title },
  { db, session },
);
```

#### Changelog

- `2026-06-13`: guia reescrito com notificações internas, preferências, ownership, frontend e integração com eventos.
- `2026-07-10`: API/listagem sincronizada com paginação estável e `limit <= 50`;
  frontend com abort/anti-stale, rollback autoritativo e busy state localizado.
- `2026-07-10`: validações copiáveis consolidadas com tipos, enums e limites
  estritos; criação transacional reutiliza `db/session` sem leituras paralelas.
- `2026-07-10`: integração de progresso recomposta sobre os guards de
  publicação, parental e media-ready; progresso, alerta e audit são atómicos.
