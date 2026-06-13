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
- `last_updated`: `2026-06-13`

## Bloco pedagógico (obrigatório)

Neste BK vais acrescentar pagamentos simulados e trial único por utilizador. O MVP não integra Stripe, PayPal, MB Way nem webhooks reais. O objetivo é treinar o fluxo de negócio sem guardar dados financeiros sensíveis.

### Objetivo pedagógico

- Distinguir pagamento simulado de gateway real.
- Implementar trial apenas uma vez por utilizador.
- Registar tentativas de pagamento com estado auditável.
- Preparar notificações transacionais para o `BK-MF4-08`.

### Importância funcional

- Este BK permite demonstrar o ciclo de subscrição sem depender de bancos, cartões ou fornecedores externos.
- O trial dá acesso temporário e controlado a novos utilizadores, mantendo a regra de uso único.
- As tentativas de pagamento criam evidência objetiva para a defesa PAP: aprovado, recusado, sem login e segunda tentativa de trial.

### Scope-in

- Criar métodos de pagamento simulados e resultado controlado `approved`/`failed`.
- Guardar tentativas de pagamento sem dados financeiros reais.
- Ativar subscrição paga apenas quando o resultado simulado é aprovado.
- Criar trial único por utilizador e integrá-lo com o guard premium.
- Atualizar a página de subscrição com ações de checkout simulado e trial.

### Scope-out

- Não integrar Stripe, PayPal, MB Way, webhooks, IBAN, cartão real, CVV ou token financeiro.
- Não alterar o cálculo da pool solidária; este BK apenas prepara subscrições pagas/trial.
- Não criar emails reais nem notificações externas; notificações internas entram no `BK-MF4-08`.

### Tempo estimado

- 2 blocos de 90 minutos.
- Se houver dúvidas sobre dados financeiros, consultar `RNF18` antes de escrever código.

### Glossário rápido

- Pagamento simulado: fluxo de demonstração que imita sucesso ou falha sem contactar um gateway real.
- Trial: período gratuito com acesso premium temporário.
- Tentativa de pagamento: registo auditável do pedido, do valor e do resultado.
- Resultado simulado: valor controlado usado para testar caminho positivo e negativo.

### Conceitos teóricos essenciais

- Domínio FaithFlix: pagamento aceite mantém a subscrição ativa; pagamento recusado bloqueia acesso premium.
- Backend: o service valida o plano antes de gravar tentativa, para não criar pagamentos sem subscrição associada.
- Frontend: a UI chama `paymentsApi` e mostra mensagens observáveis para sucesso, erro e trial já usado.
- Segurança: nenhum dado financeiro real entra no payload, nos logs ou na base de dados.
- Dados: `payment_attempts` guarda a tentativa; `trials` impede segundo trial do mesmo utilizador.
- `CANONICO`: RF37 exige métodos de pagamento; RF40 permite trial.
- `CANONICO`: RNF18 proíbe guardar dados de cartão na base de dados da aplicação.
- `DERIVADO`: `simulateOutcome` aceita `approved` ou `failed` para testar caminhos positivos e negativos.
- `DERIVADO`: o trial usa `subscriptions.status: "trialing"` para reutilizar o guard premium criado no `BK-MF4-01`.

### Erros comuns

- Guardar número de cartão, CVV ou token financeiro.
- Permitir segundo trial ao mesmo utilizador.
- Ativar subscrição quando o pagamento simulado falhou.
- Criar outra colecao de subscrições em vez de usar a do `BK-MF4-01`.

### Check de compreensão

- [ ] Sei explicar porque o pagamento e simulado no MVP.
- [ ] Sei provar que trial só pode ser usado uma vez.
- [ ] Sei listar que dados financeiros não entram na base de dados.

## Bloco operacional (obrigatório)

### Pré-condições

- `BK-MF4-01` executado com planos e subscrições.
- `requireAuth` disponível.
- `subscriptions.service.js` exporta `activateSubscription` e `hasActiveSubscriptionAccess`.
- `apiClient` existe no frontend.

### Arquitetura do BK

- Backend: módulo `payments` com validação, service, controller e router.
- Persistência: `payment_attempts` regista tentativas e `trials` garante trial único.
- Integração: pagamento aprovado chama `activateSubscription`; trial chama `grantTrialSubscription`.
- Frontend: `paymentsApi` é consumido pela `SubscriptionPage` criada no `BK-MF4-01`.
- Segurança: endpoints exigem `requireAuth`; o `userId` vem sempre de `req.user.id`.

### Ficheiros a criar, editar e rever

- CRIAR: `backend/src/modules/payments/payments.validation.js`
- CRIAR: `backend/src/modules/payments/payments.service.js`
- CRIAR: `backend/src/modules/payments/payments.controller.js`
- CRIAR: `backend/src/modules/payments/payments.routes.js`
- CRIAR: `frontend/src/services/api/paymentsApi.js`
- EDITAR: `backend/src/modules/subscriptions/subscriptions.validation.js`
- EDITAR: `backend/src/modules/subscriptions/subscriptions.service.js`
- EDITAR: `backend/src/app.js`
- EDITAR: `backend/src/server.js`
- EDITAR: `frontend/src/pages/SubscriptionPage.jsx`
- REVER: `BK-MF4-01`, `RF37`, `RF40`, `RNF17`, `RNF18`, `RNF24`

### Guia de execução (passo-a-passo)

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
  const planCode = String(input.planCode ?? "").trim();
  const paymentMethod = String(input.paymentMethod ?? "").trim();
  const simulateOutcome = String(input.simulateOutcome ?? "approved").trim();

  // O backend aceita apenas identificadores de teste; nunca recebe número de cartão ou token financeiro.
  if (!planCode) throw httpError("Plano obrigatório.");
  if (!PAYMENT_METHODS.includes(paymentMethod)) throw httpError("Método de pagamento inválido.");
  if (!SIMULATED_OUTCOMES.includes(simulateOutcome)) throw httpError("Resultado simulado inválido.");

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

Usa `activateSubscription` do `BK-MF4-01`. Antes de criares o service de pagamentos, acrescenta o estado `trialing` ao contrato de subscrição e adiciona uma função para criar acesso premium temporário.

4. Código completo.

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
 * @returns {Promise<{ subscription: object }>} Subscrição pública no formato do módulo de subscrições.
 * @throws {Error} Quando a data e inválida ou o utilizador já tem subscrição paga ativa.
 */
export async function grantTrialSubscription(userId, endsAt) {
  const db = await getDb();
  const now = new Date();
  const periodEnd = new Date(endsAt);

  if (Number.isNaN(periodEnd.getTime()) || periodEnd <= now) {
    const error = new Error("Data de fim de trial inválida.");
    error.statusCode = 400;
    throw error;
  }

  const userIdObject = userObjectId(userId);
  // Trial não deve substituir uma subscrição paga em vigor.
  const activePaidSubscription = await db.collection("subscriptions").findOne({
    userId: userIdObject,
    status: "active",
    currentPeriodEnd: { $gt: now },
  });

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
    createdAt: now,
    updatedAt: now,
  };

  // Mantém uma unica subscrição por utilizador, tal como o fluxo pago do BK anterior.
  await db.collection("subscriptions").updateOne(
    { userId: userIdObject },
    { $set: subscription },
    { upsert: true },
  );

  return { subscription: publicSubscription(subscription) };
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
import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import {
  activateSubscription,
  grantTrialSubscription,
} from "../subscriptions/subscriptions.service.js";
import { assertCheckoutPayload } from "./payments.validation.js";

/**
 * Converte o identificador de utilizador autenticado para `ObjectId`.
 *
 * @param {string} userId Identificador vindo da sessão.
 * @returns {ObjectId} Identificador pronto para filtros MongoDB.
 * @throws {Error} Quando o identificador não e valido.
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
 * Soma dias a uma data sem alterar a instancia original.
 *
 * @param {Date} date Data base.
 * @param {number} days Número de dias a acrescentar.
 * @returns {Date} Nova data calculada.
 */
function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/**
 * Cria indices usados por tentativas de pagamento e trials.
 *
 * @returns {Promise<void>}
 */
export async function ensurePaymentIndexes() {
  const db = await getDb();
  await db.collection("payment_attempts").createIndex({ userId: 1, createdAt: -1 });
  await db.collection("trials").createIndex({ userId: 1 }, { unique: true });
}

/**
 * Regista uma tentativa de pagamento simulada e ativa a subscrição quando aprovada.
 *
 * @param {string} userId Identificador do utilizador autenticado.
 * @param {object} input Payload do checkout simulado.
 * @returns {Promise<object>} Resultado da tentativa e, quando aprovado, subscrição pública.
 * @throws {Error} Quando o plano não existe ou o payload e inválido.
 */
export async function createSimulatedCheckout(userId, input) {
  const db = await getDb();
  const payload = assertCheckoutPayload(input);
  const now = new Date();
  // A tentativa só e gravada depois de confirmar que o plano existe e esta ativo.
  const plan = await db.collection("subscription_plans").findOne({
    code: payload.planCode,
    active: true,
  });

  if (!plan) {
    const error = new Error("Plano não encontrado.");
    error.statusCode = 404;
    throw error;
  }

  const attempt = {
    userId: userObjectId(userId),
    planCode: payload.planCode,
    paymentMethod: payload.paymentMethod,
    provider: "faithflix-simulated",
    status: payload.simulateOutcome === "approved" ? "approved" : "failed",
    failureReason: payload.simulateOutcome === "failed" ? "Pagamento simulado recusado." : null,
    createdAt: now,
  };

  const result = await db.collection("payment_attempts").insertOne(attempt);
  if (attempt.status === "failed") {
    // O caminho negativo fica auditável sem criar subscrição nem guardar dados financeiros.
    return { paymentAttemptId: String(result.insertedId), status: "failed", message: attempt.failureReason };
  }

  const subscription = await activateSubscription(userId, payload.planCode);
  return { paymentAttemptId: String(result.insertedId), status: "approved", ...subscription };
}

/**
 * Inicia o trial único de 14 dias para um utilizador elegível.
 *
 * @param {string} userId Identificador do utilizador autenticado.
 * @returns {Promise<object>} Dados do trial e subscrição temporária.
 * @throws {Error} Quando já existe subscrição paga ativa ou trial utilizado.
 */
export async function startTrial(userId) {
  const db = await getDb();
  const now = new Date();
  const userIdObject = userObjectId(userId);

  // Utilizadores que já pagam não precisam de consumir trial.
  const activePaidSubscription = await db.collection("subscriptions").findOne({
    userId: userIdObject,
    status: "active",
    currentPeriodEnd: { $gt: now },
  });

  if (activePaidSubscription) {
    const error = new Error("Utilizador já tem uma subscrição ativa.");
    error.statusCode = 409;
    throw error;
  }

  const trial = {
    userId: userIdObject,
    status: "active",
    startedAt: now,
    endsAt: addDays(now, 14),
    createdAt: now,
  };

  try {
    // O indice único em `trials.userId` e a garantia contra repeticao do período gratuito.
    await db.collection("trials").insertOne(trial);
  } catch (error) {
    if (error.code === 11000) {
      const alreadyUsed = new Error("Trial já utilizado por este utilizador.");
      alreadyUsed.statusCode = 409;
      throw alreadyUsed;
    }
    throw error;
  }

  const subscription = await grantTrialSubscription(userId, trial.endsAt);

  return {
    trial: { status: trial.status, startedAt: trial.startedAt, endsAt: trial.endsAt },
    ...subscription,
  };
}
```

5. Explicação do código ou da decisão.

`payment_attempts` e auditável e não guarda cartão. `trials.userId` único impede repetir trial. `grantTrialSubscription` grava uma subscrição `trialing` com `currentPeriodEnd`, por isso o guard premium do `BK-MF4-01` consegue autorizar o playback durante o período gratuito e bloquear quando a data terminar. Um utilizador com subscrição paga ativa não deve iniciar trial, porque o trial existe para experimentar antes de pagar.

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
  const result = await createSimulatedCheckout(req.user.id, req.body);
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
  res.status(201).json(await startTrial(req.user.id));
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
import { requireAuth } from "../auth/auth.middleware.js";
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

export const paymentsApi = {
  /**
   * Pede ao backend para executar um checkout com método de teste.
   *
   * @param {object} input Plano, método de teste e resultado simulado.
   * @returns {Promise<object>} Resultado devolvido pela API.
   */
  simulatedCheckout(input) {
    return apiClient.post("/api/payments/simulated-checkout", input);
  },
  /**
   * Inicia trial gratuito do utilizador autenticado.
   *
   * @returns {Promise<object>} Trial e subscrição temporária.
   */
  startTrial() {
    return apiClient.post("/api/payments/trial");
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
import { useEffect, useState } from "react";
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

  /**
   * Carrega planos ativos e subscrição atual em paralelo.
   *
   * @returns {Promise<void>}
   */
  async function loadData() {
    setLoading(true);
    setError("");
    try {
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

  /**
   * Executa checkout aprovado usando apenas dados de teste.
   *
   * @param {string} planCode Código do plano escolhido pelo utilizador.
   * @returns {Promise<void>}
   */
  async function handleSimulatedCheckout(planCode) {
    setStatus("");
    setError("");
    setSubmitting(true);
    try {
      const response = await paymentsApi.simulatedCheckout({
        planCode,
        paymentMethod: "card_test",
        // A versão final da demo usa o caminho positivo; o caminho negativo e testado separadamente.
        simulateOutcome: "approved",
      });
      setSubscription(response.subscription);
      setStatus("Pagamento simulado aprovado.");
    } catch (apiError) {
      setError(toUserMessage(apiError));
    } finally {
      setSubmitting(false);
    }
  }

  /**
   * Inicia o trial e mostra a data de fim ao utilizador.
   *
   * @returns {Promise<void>}
   */
  async function handleStartTrial() {
    setStatus("");
    setError("");
    setSubmitting(true);
    try {
      const response = await paymentsApi.startTrial();
      setSubscription(response.subscription);
      setStatus(`Trial ativo até ${new Date(response.trial.endsAt).toLocaleDateString("pt-PT")}.`);
    } catch (apiError) {
      setError(toUserMessage(apiError));
    } finally {
      setSubmitting(false);
    }
  }

  /**
   * Cancela apenas a renovação futura, preservando acesso até ao fim do ciclo.
   *
   * @returns {Promise<void>}
   */
  async function handleCancelRenewal() {
    setStatus("");
    setError("");
    setSubmitting(true);
    try {
      const response = await subscriptionsApi.cancelRenewal();
      setSubscription(response.subscription);
      setStatus("Renovação cancelada no fim do ciclo atual.");
    } catch (apiError) {
      setError(toUserMessage(apiError));
    } finally {
      setSubmitting(false);
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

Se precisares de testar o caminho negativo de pagamento recusado durante a defesa, altera temporariamente `simulateOutcome: "approved"` para `simulateOutcome: "failed"` e repoe `approved` antes de fechar o PR.

```jsx
const response = await paymentsApi.simulatedCheckout({
  planCode,
  paymentMethod: "card_test",
  // Este valor forca o caminho negativo controlado sem criar dados reais de pagamento.
  simulateOutcome: "failed",
});
```

Depois desse teste, a versão final deve voltar a usar `approved` no botao principal para deixar a demo num caminho feliz.

5. Explicação do código ou da decisão.

O frontend envia apenas escolhas simuladas e nunca pede número de cartão, CVV ou token financeiro. `paymentsApi.simulatedCheckout` chama o endpoint real de checkout do backend; `paymentsApi.startTrial` chama o endpoint real de trial; `subscriptionsApi.cancelRenewal` continua a reutilizar o contrato do `BK-MF4-01`. O estado `submitting` evita duplos cliques enquanto o pedido esta em curso. O estado vazio em `plans.length === 0` evita uma página silenciosa quando ainda não existem planos ativos.

6. Validação do passo.

Ativar plano por checkout simulado e testar trial duas vezes.

7. Caso negativo, erro comum ou risco que este passo evita.

Se o aluno colocar inputs de cartão, a UI passa a sugerir uma integração que o backend não implementa.

## Critérios de aceite (mensuráveis)

- `POST /api/payments/simulated-checkout` com `approved` devolve `201` e subscrição ativa.
- `POST /api/payments/simulated-checkout` com `failed` devolve `402` sem ativar subscrição.
- `POST /api/payments/trial` funciona uma vez por utilizador, devolve `subscription.status: "trialing"` e a segunda tentativa devolve `409`.
- Durante o trial, `GET /api/playback/:contentId` passa no guard premium; depois de `endsAt`, deve devolver `403`.
- Utilizador com subscrição paga ativa recebe `409` ao tentar iniciar trial.
- Nenhuma colecao guarda número de cartão, CVV ou token financeiro.

## Validação final

```bash
cd backend
npm test
```

Executar também requests de checkout aprovado, checkout falhado, trial repetido, trial com subscrição paga ativa e playback durante trial.

## Evidence para PR/defesa

- `pr`: commit/PR com módulo `payments`.
- `proof`: JSON de checkout aprovado, trial ativo com `subscription.status: "trialing"` e playback autorizado durante trial.
- `neg`: checkout falhado `402`, segundo trial `409`, trial com subscrição paga ativa `409`, pedido sem cookie `401`.

## Handoff

O `BK-MF4-08` deve usar `payment_attempts`, `trials` e eventos de checkout/trial para criar notificações transacionais. Não deve introduzir fornecedor externo de email como requisito obrigatório.

## Snippet técnico aplicável

```js
// O MVP regista apenas o método simulado; dados reais de cartão ficam fora da aplicação.
paymentMethod: payload.paymentMethod,
provider: "faithflix-simulated",
```

## Changelog

- `2026-06-13`: guia reescrito com pagamento simulado, trial único, endpoints, frontend e negativos.
