# BK-MF4-02 - Metodos de pagamento simulados e trial

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

## Bloco pedagogico (obrigatorio)

Neste BK vais acrescentar pagamentos simulados e trial unico por utilizador. O MVP nao integra Stripe, PayPal, MB Way nem webhooks reais. O objetivo e treinar o fluxo de negocio sem guardar dados financeiros sensiveis.

### Objetivo pedagogico

- Distinguir pagamento simulado de gateway real.
- Implementar trial apenas uma vez por utilizador.
- Registar tentativas de pagamento com estado auditavel.
- Preparar notificacoes transacionais para o `BK-MF4-08`.

### Tempo estimado

- 2 blocos de 90 minutos.
- Se houver duvidas sobre dados financeiros, consultar `RNF18` antes de escrever codigo.

### Conceitos essenciais

- Metodo de pagamento simulado e apenas uma escolha controlada para demonstracao: `card_test`, `mbway_test` ou `transfer_test`.
- Trial e um periodo gratuito com data de fim, regra de uso unico e acesso premium temporario.
- Uma tentativa de pagamento guarda estado, valor e motivo de falha, mas nunca numero de cartao.
- `CANONICO`: RF37 exige metodos de pagamento; RF40 permite trial.
- `CANONICO`: RNF18 proibe guardar dados de cartao na base de dados da aplicacao.
- `DERIVADO`: `simulateOutcome` aceita `approved` ou `failed` para testar caminhos positivos e negativos.
- `DERIVADO`: o trial usa `subscriptions.status: "trialing"` para reutilizar o guard premium criado no `BK-MF4-01`.

### Erros comuns

- Guardar numero de cartao, CVV ou token financeiro.
- Permitir segundo trial ao mesmo utilizador.
- Ativar subscricao quando o pagamento simulado falhou.
- Criar outra colecao de subscricoes em vez de usar a do `BK-MF4-01`.

### Check de compreensao

- [ ] Sei explicar porque o pagamento e simulado no MVP.
- [ ] Sei provar que trial so pode ser usado uma vez.
- [ ] Sei listar que dados financeiros nao entram na base de dados.

## Bloco operacional (obrigatorio)

### Pre-condicoes

- `BK-MF4-01` executado com planos e subscricoes.
- `requireAuth` disponivel.
- `subscriptions.service.js` exporta `activateSubscription` e `hasActiveSubscriptionAccess`.
- `apiClient` existe no frontend.

### Guia de execucao (passo-a-passo)

### Passo 1 - Criar validacao de pagamento simulado

1. Objetivo do passo.

Validar metodo, plano e resultado simulado.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/payments/payments.validation.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Cria o modulo `payments`.

4. Codigo completo.

```js
/**
 * Metodos e resultados aceites pelo checkout de demonstracao.
 * A lista fechada impede que a UI ou a API sugiram recolha de dados financeiros reais.
 */
export const PAYMENT_METHODS = ["card_test", "mbway_test", "transfer_test"];
export const SIMULATED_OUTCOMES = ["approved", "failed"];

/**
 * Cria um erro HTTP previsivel para o middleware global de erros.
 *
 * @param {string} message Mensagem segura para devolver ao cliente.
 * @param {number} [statusCode=400] Codigo HTTP associado a erros de validacao.
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
 * @param {string} input.planCode Codigo do plano escolhido.
 * @param {string} input.paymentMethod Metodo de pagamento de teste.
 * @param {string} [input.simulateOutcome="approved"] Resultado controlado para a demo.
 * @returns {{ planCode: string, paymentMethod: string, simulateOutcome: string }} Payload seguro.
 * @throws {Error} Quando o plano, metodo ou resultado nao respeitam o contrato.
 */
export function assertCheckoutPayload(input) {
  const planCode = String(input.planCode ?? "").trim();
  const paymentMethod = String(input.paymentMethod ?? "").trim();
  const simulateOutcome = String(input.simulateOutcome ?? "approved").trim();

  // O backend aceita apenas identificadores de teste; nunca recebe numero de cartao ou token financeiro.
  if (!planCode) throw httpError("Plano obrigatorio.");
  if (!PAYMENT_METHODS.includes(paymentMethod)) throw httpError("Metodo de pagamento invalido.");
  if (!SIMULATED_OUTCOMES.includes(simulateOutcome)) throw httpError("Resultado simulado invalido.");

  return { planCode, paymentMethod, simulateOutcome };
}
```

5. Explicacao do codigo ou da decisao.

A lista fechada deixa claro que o MVP nao recolhe dados reais de pagamento.

6. Validacao do passo.

```bash
node -e "import('./src/modules/payments/payments.validation.js').then(({ assertCheckoutPayload }) => console.log(assertCheckoutPayload({ planCode: 'faithflix-monthly', paymentMethod: 'card_test' }).paymentMethod))"
```

7. Caso negativo, erro comum ou risco que este passo evita.

Um campo livre para metodo podia levar alunos a guardar dados reais sem necessidade.

### Passo 2 - Criar service de checkout e trial

1. Objetivo do passo.

Registar tentativa de pagamento, ativar subscricao quando aprovado e criar trial unico.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/payments/payments.service.js`
    - EDITAR: `backend/src/modules/subscriptions/subscriptions.validation.js`
    - EDITAR: `backend/src/modules/subscriptions/subscriptions.service.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Usa `activateSubscription` do `BK-MF4-01`. Antes de criares o service de pagamentos, acrescenta o estado `trialing` ao contrato de subscricao e adiciona uma funcao para criar acesso premium temporario.

4. Codigo completo.

Em `backend/src/modules/subscriptions/subscriptions.validation.js`, atualiza a lista de estados:

```js
/**
 * Estados persistidos para a subscricao do utilizador.
 * `trialing` reutiliza o guard premium sem misturar trial gratuito com receita paga.
 */
export const SUBSCRIPTION_STATUS = ["active", "trialing", "past_due", "expired", "canceled"];
```

Em `backend/src/modules/subscriptions/subscriptions.service.js`, adiciona esta funcao completa depois de `activateSubscription`:

```js
/**
 * Cria uma subscricao temporaria de trial para um utilizador sem subscricao paga ativa.
 *
 * @param {string} userId Identificador do utilizador autenticado.
 * @param {Date | string} endsAt Data em que o acesso gratuito termina.
 * @returns {Promise<{ subscription: object }>} Subscricao publica no formato do modulo de subscricoes.
 * @throws {Error} Quando a data e invalida ou o utilizador ja tem subscricao paga ativa.
 */
export async function grantTrialSubscription(userId, endsAt) {
  const db = await getDb();
  const now = new Date();
  const periodEnd = new Date(endsAt);

  if (Number.isNaN(periodEnd.getTime()) || periodEnd <= now) {
    const error = new Error("Data de fim de trial invalida.");
    error.statusCode = 400;
    throw error;
  }

  const userIdObject = userObjectId(userId);
  // Trial nao deve substituir uma subscricao paga em vigor.
  const activePaidSubscription = await db.collection("subscriptions").findOne({
    userId: userIdObject,
    status: "active",
    currentPeriodEnd: { $gt: now },
  });

  if (activePaidSubscription) {
    const error = new Error("Utilizador ja tem uma subscricao ativa.");
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

  // Mantem uma unica subscricao por utilizador, tal como o fluxo pago do BK anterior.
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
 * @param {string} userId Identificador vindo da sessao.
 * @returns {ObjectId} Identificador pronto para filtros MongoDB.
 * @throws {Error} Quando o identificador nao e valido.
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
 * Soma dias a uma data sem alterar a instancia original.
 *
 * @param {Date} date Data base.
 * @param {number} days Numero de dias a acrescentar.
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
 * Regista uma tentativa de pagamento simulada e ativa a subscricao quando aprovada.
 *
 * @param {string} userId Identificador do utilizador autenticado.
 * @param {object} input Payload do checkout simulado.
 * @returns {Promise<object>} Resultado da tentativa e, quando aprovado, subscricao publica.
 * @throws {Error} Quando o plano nao existe ou o payload e invalido.
 */
export async function createSimulatedCheckout(userId, input) {
  const db = await getDb();
  const payload = assertCheckoutPayload(input);
  const now = new Date();
  // A tentativa so e gravada depois de confirmar que o plano existe e esta ativo.
  const plan = await db.collection("subscription_plans").findOne({
    code: payload.planCode,
    active: true,
  });

  if (!plan) {
    const error = new Error("Plano nao encontrado.");
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
    // O caminho negativo fica auditavel sem criar subscricao nem guardar dados financeiros.
    return { paymentAttemptId: String(result.insertedId), status: "failed", message: attempt.failureReason };
  }

  const subscription = await activateSubscription(userId, payload.planCode);
  return { paymentAttemptId: String(result.insertedId), status: "approved", ...subscription };
}

/**
 * Inicia o trial unico de 14 dias para um utilizador elegivel.
 *
 * @param {string} userId Identificador do utilizador autenticado.
 * @returns {Promise<object>} Dados do trial e subscricao temporaria.
 * @throws {Error} Quando ja existe subscricao paga ativa ou trial utilizado.
 */
export async function startTrial(userId) {
  const db = await getDb();
  const now = new Date();
  const userIdObject = userObjectId(userId);

  // Utilizadores que ja pagam nao precisam de consumir trial.
  const activePaidSubscription = await db.collection("subscriptions").findOne({
    userId: userIdObject,
    status: "active",
    currentPeriodEnd: { $gt: now },
  });

  if (activePaidSubscription) {
    const error = new Error("Utilizador ja tem uma subscricao ativa.");
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
    // O indice unico em `trials.userId` e a garantia contra repeticao do periodo gratuito.
    await db.collection("trials").insertOne(trial);
  } catch (error) {
    if (error.code === 11000) {
      const alreadyUsed = new Error("Trial ja utilizado por este utilizador.");
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

5. Explicacao do codigo ou da decisao.

`payment_attempts` e auditavel e nao guarda cartao. `trials.userId` unico impede repetir trial. `grantTrialSubscription` grava uma subscricao `trialing` com `currentPeriodEnd`, por isso o guard premium do `BK-MF4-01` consegue autorizar o playback durante o periodo gratuito e bloquear quando a data terminar. Um utilizador com subscricao paga ativa nao deve iniciar trial, porque o trial existe para experimentar antes de pagar.

O plano e validado antes de gravar a tentativa de pagamento. Assim, um checkout com `planCode` invalido devolve `404` e nao deixa uma tentativa aprovada sem subscricao associada.

6. Validacao do passo.

```bash
node -e "import('./src/modules/payments/payments.service.js').then((m) => console.log(typeof m.createSimulatedCheckout, typeof m.startTrial))"
```

Confirma tambem o novo export de subscricao:

```bash
node -e "import('./src/modules/subscriptions/subscriptions.service.js').then((m) => console.log(typeof m.grantTrialSubscription))"
```

7. Caso negativo, erro comum ou risco que este passo evita.

Sem indice unico, um utilizador podia criar varios trials e contornar a subscricao.

### Passo 3 - Criar endpoints backend

1. Objetivo do passo.

Expor checkout simulado e inicio de trial.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/payments/payments.controller.js`
    - CRIAR: `backend/src/modules/payments/payments.routes.js`
    - EDITAR: `backend/src/app.js`
    - EDITAR: `backend/src/server.js`

3. Instrucoes concretas.

Monta o router em `/api/payments`.

4. Codigo completo.

`backend/src/modules/payments/payments.controller.js`

```js
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
  // `402` comunica recusa de pagamento no dominio, nao falha tecnica do servidor.
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
import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { postSimulatedCheckout, postTrial } from "./payments.controller.js";

/**
 * Router de pagamentos simulados.
 * Todas as rotas exigem login para associar tentativas, trials e subscricoes ao dono correto.
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

5. Explicacao do codigo ou da decisao.

`402` e usado no pagamento simulado falhado para representar pagamento recusado no fluxo de negocio.

6. Validacao do passo.

```bash
curl -i -X POST http://localhost:3000/api/payments/simulated-checkout
```

Sem cookie deve devolver `401`.

7. Caso negativo, erro comum ou risco que este passo evita.

Checkout sem `requireAuth` permitiria pagamentos sem dono.

### Passo 4 - Ligar ao frontend

1. Objetivo do passo.

Adicionar chamadas API e botao de trial/checkout na pagina de subscricao.

2. Ficheiros envolvidos.
    - CRIAR: `frontend/src/services/api/paymentsApi.js`
    - EDITAR: `frontend/src/pages/SubscriptionPage.jsx`

3. Instrucoes concretas.

Acrescenta botoes para `card_test` e trial, preservando a listagem de planos do BK anterior.

4. Codigo completo.

`frontend/src/services/api/paymentsApi.js`

```js
import { apiClient } from "./apiClient.js";

export const paymentsApi = {
  /**
   * Pede ao backend para executar um checkout com metodo de teste.
   *
   * @param {object} input Plano, metodo de teste e resultado simulado.
   * @returns {Promise<object>} Resultado devolvido pela API.
   */
  simulatedCheckout(input) {
    return apiClient.post("/api/payments/simulated-checkout", input);
  },
  /**
   * Inicia trial gratuito do utilizador autenticado.
   *
   * @returns {Promise<object>} Trial e subscricao temporaria.
   */
  startTrial() {
    return apiClient.post("/api/payments/trial");
  },
};
```

Substitui `frontend/src/pages/SubscriptionPage.jsx` pela versao completa abaixo. Esta versao preserva a listagem e o cancelamento criados no `BK-MF4-01`, mas muda a ativacao direta para checkout simulado e acrescenta o botao de trial.

```jsx
import { useEffect, useState } from "react";
import { paymentsApi } from "../services/api/paymentsApi.js";
import { subscriptionsApi } from "../services/api/subscriptionsApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

/**
 * Pagina de subscricao com checkout simulado, trial e cancelamento de renovacao.
 *
 * @returns {JSX.Element} Interface de gestao da subscricao do utilizador.
 */
export function SubscriptionPage() {
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  /**
   * Carrega planos ativos e subscricao atual em paralelo.
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
   * @param {string} planCode Codigo do plano escolhido pelo utilizador.
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
        // A versao final da demo usa o caminho positivo; o caminho negativo e testado separadamente.
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
      setStatus(`Trial ativo ate ${new Date(response.trial.endsAt).toLocaleDateString("pt-PT")}.`);
    } catch (apiError) {
      setError(toUserMessage(apiError));
    } finally {
      setSubmitting(false);
    }
  }

  /**
   * Cancela apenas a renovacao futura, preservando acesso ate ao fim do ciclo.
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
      setStatus("Renovacao cancelada no fim do ciclo atual.");
    } catch (apiError) {
      setError(toUserMessage(apiError));
    } finally {
      setSubmitting(false);
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
          <button type="button" disabled={submitting} onClick={handleCancelRenewal}>Cancelar renovacao</button>
        )}
      </section>

      <section>
        <h2>Trial</h2>
        <p>Experimenta o FaithFlix durante 14 dias sem dados de cartao.</p>
        <button type="button" disabled={submitting} onClick={handleStartTrial}>Iniciar trial</button>
      </section>

      <section>
        <h2>Planos</h2>
        {plans.length === 0 && <p>Nao existem planos ativos.</p>}
        {plans.map((plan) => (
          <article key={plan.code}>
            <h3>{plan.name}</h3>
            <p>{(plan.priceCents / 100).toFixed(2)} {plan.currency}</p>
            <p>{plan.solidaritySharePercent}% para a pool solidaria.</p>
            <button type="button" disabled={submitting} onClick={() => handleSimulatedCheckout(plan.code)}>
              Pagar com metodo simulado
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

Depois desse teste, a versao final deve voltar a usar `approved` no botao principal para deixar a demo num caminho feliz.

5. Explicacao do codigo ou da decisao.

O frontend envia apenas escolhas simuladas e nunca pede numero de cartao, CVV ou token financeiro. `paymentsApi.simulatedCheckout` chama o endpoint real de checkout do backend; `paymentsApi.startTrial` chama o endpoint real de trial; `subscriptionsApi.cancelRenewal` continua a reutilizar o contrato do `BK-MF4-01`. O estado `submitting` evita duplos cliques enquanto o pedido esta em curso. O estado vazio em `plans.length === 0` evita uma pagina silenciosa quando ainda nao existem planos ativos.

6. Validacao do passo.

Ativar plano por checkout simulado e testar trial duas vezes.

7. Caso negativo, erro comum ou risco que este passo evita.

Se o aluno colocar inputs de cartao, a UI passa a sugerir uma integracao que o backend nao implementa.

## Criterios de aceite (mensuraveis)

- `POST /api/payments/simulated-checkout` com `approved` devolve `201` e subscricao ativa.
- `POST /api/payments/simulated-checkout` com `failed` devolve `402` sem ativar subscricao.
- `POST /api/payments/trial` funciona uma vez por utilizador, devolve `subscription.status: "trialing"` e a segunda tentativa devolve `409`.
- Durante o trial, `GET /api/playback/:contentId` passa no guard premium; depois de `endsAt`, deve devolver `403`.
- Utilizador com subscricao paga ativa recebe `409` ao tentar iniciar trial.
- Nenhuma colecao guarda numero de cartao, CVV ou token financeiro.

## Validacao final

```bash
cd backend
npm test
```

Executar tambem requests de checkout aprovado, checkout falhado, trial repetido, trial com subscricao paga ativa e playback durante trial.

## Evidence para PR/defesa

- `pr`: commit/PR com modulo `payments`.
- `proof`: JSON de checkout aprovado, trial ativo com `subscription.status: "trialing"` e playback autorizado durante trial.
- `neg`: checkout falhado `402`, segundo trial `409`, trial com subscricao paga ativa `409`, pedido sem cookie `401`.

## Handoff

O `BK-MF4-08` deve usar `payment_attempts`, `trials` e eventos de checkout/trial para criar notificacoes transacionais. Nao deve introduzir fornecedor externo de email como requisito obrigatorio.

## Snippet tecnico aplicavel

```js
// O MVP regista apenas o metodo simulado; dados reais de cartao ficam fora da aplicacao.
paymentMethod: payload.paymentMethod,
provider: "faithflix-simulated",
```

## Changelog

- `2026-06-13`: guia reescrito com pagamento simulado, trial unico, endpoints, frontend e negativos.
