# BK-MF9-01 - Planos Pro/Família e entitlements

## Header

- `doc_id`: `GUIA-BK-MF9-01`
- `bk_id`: `BK-MF9-01`
- `macro`: `MF9`
- `owner`: `Matheus`
- `apoio`: `Davi`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `L`
- `dependencias`: `BK-MF4-01,BK-MF4-02`
- `rf_rnf`: `RF35, RF38, RF61, RNF40`
- `fase_documental`: `Fase 3`
- `sprint`: `S13`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF9-02`
- `guia_path`: `docs/planificacao/guias-bk/MF9/BK-MF9-01-planos-pro-familia-entitlements.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais transformar os planos de subscrição do FaithFlix num contrato de entitlements. O backend deixa de devolver apenas preço, ciclo e nome do plano; passa também a publicar capacidades que outros módulos podem usar com segurança: `tier`, `maxQuality`, `qualityRank`, `familySharing`, `maxFamilyMembers` e `features`.

O resultado observável é simples: `GET /api/subscriptions/plans` continua a devolver os planos históricos `faithflix-monthly` e `faithflix-yearly`, agora classificados como Pro, e acrescenta os planos Família. A página de subscrição passa a mostrar essa diferença sem inventar permissões no frontend.

#### Importância

`RF61` exige planos Pro/Família e entitlements. Sem este BK, os BKs seguintes teriam de adivinhar se um utilizador pode ver 4K, convidar familiares ou usar partilha. Essa decisão tem de nascer no backend, porque é uma regra de acesso e não apenas texto visual.

Este BK também preserva `RF35` e `RF38`: os fluxos de subscrição e checkout simulado da MF4 continuam válidos, sem pagamento real e sem quebrar os códigos de planos já usados pelos testes e pela UI. A alteração é incremental: melhora o contrato de planos e prepara `BK-MF9-02` e `BK-MF9-03`, sem implementar ainda qualidade por plano nem partilha familiar real.

#### Scope-in

- Atualizar o seed interno de planos para incluir Pro mensal, Pro anual, Família mensal e Família anual.
- Expor entitlements públicos em `GET /api/subscriptions/plans`.
- Garantir que o checkout simulado aceita os novos códigos Família quando o plano está ativo.
- Preservar o contrato transacional/idempotente de checkout ao acrescentar os planos Família.
- Atualizar a zona de planos da página de subscrição para mostrar tier, qualidade máxima, lugares familiares e funcionalidades.
- Criar testes unitários para planos Pro/Família, compatibilidade e negativo de plano inexistente.

#### Scope-out

- Gateway externo de pagamentos.
- Faturação legal.
- Partilha familiar, convites e memberships; ficam para `BK-MF9-03`.
- Enforcement de qualidade no playback; fica para `BK-MF9-02`.
- Limites de dispositivos, perfis infantis e regras familiares avançadas.
- Alteração dos códigos históricos `faithflix-monthly` e `faithflix-yearly`.

#### Estado antes e depois

- Antes: `BK-MF4-01` e `BK-MF4-02` entregam planos pagos e checkout simulado, mas a app só sabe se existe subscrição ativa.
- Depois: a app passa a conhecer capacidades do plano, sem alterar a semântica dos códigos Pro históricos.

#### Pré-requisitos

- Ler `BK-MF4-01` e `BK-MF4-02` antes de editar subscrições ou pagamentos.
- Confirmar em `docs/RF.md` os critérios de `RF61`.
- Rever `BACKLOG-MVP.md`, `MATRIZ-CANONICA-BK.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md` e `PLANO-SPRINTS.md` para owner, dependências e sprint.
- Ter a base `backend/` com Express, MongoDB e módulo de subscrições já criada pelas MFs anteriores.
- Ter a base `frontend/` com React, `apiClient`, `paymentsApi` e página de subscrição já criada.

#### Glossário

- `Entitlement`: capacidade técnica derivada do plano, por exemplo qualidade máxima ou partilha familiar.
- `Tier`: nível do plano, como `pro`, `family`, `trial` ou `none`.
- `Plano público`: objeto que pode sair pela API sem campos internos de base de dados.
- `Checkout simulado`: fluxo pedagógico de pagamento de teste, sem dados financeiros reais.
- `Compatibilidade`: manter os códigos antigos para não quebrar utilizadores, testes ou BKs anteriores.
- `Quality rank`: número que permite comparar `720p`, `1080p` e `2160p` sem comparar texto manualmente.

#### Conceitos teóricos essenciais

- `CANONICO`: `RF61` define que Pro/Família devem expor entitlements sem quebrar `faithflix-monthly` e `faithflix-yearly`.
- Um plano comercial não deve ser apenas uma label. O backend precisa de guardar dados que outros services possam usar para decidir acesso.
- Entitlements reduzem duplicação: o playback, a família e a UI passam a consultar o mesmo contrato em vez de criarem regras diferentes.
- O frontend pode apresentar capacidades, mas não pode ser a fonte de permissão. Se a UI mentir ou for manipulada, o backend continua a decidir.
- `DERIVADO`: os códigos Família `faithflix-family-monthly` e `faithflix-family-yearly` são a extensão mínima coerente com os códigos mensais/anuais existentes.
- Testes de planos devem validar positivos e negativos, porque uma falha nesta camada afeta toda a MF9.
- Erro comum a evitar: trocar `familySharing` ou `maxFamilyMembers` no frontend. Estes campos são dados vindos do backend e não uma decisão local da interface.

#### Arquitetura do BK

| Camada | Artefacto | Responsabilidade |
| --- | --- | --- |
| Backend service | `backend/src/modules/subscriptions/subscriptions.service.js` | Define planos, normaliza entitlements e devolve planos públicos. |
| Backend pagamentos | `backend/src/modules/payments/payments.service.js` | Usa `planCode` ativo para aceitar ou recusar checkout simulado. |
| Frontend API | `frontend/src/services/api/subscriptionsApi.js`, `frontend/src/services/api/paymentsApi.js` | Consome planos e executa checkout sem guardar dados sensíveis no browser. |
| Frontend página | `frontend/src/pages/SubscriptionPage.jsx` | Mostra Pro/Família, preço, qualidade, partilha e funcionalidades. |
| Testes | `backend/tests/unit/mf9-subscriptions.test.js` | Prova plano público, compatibilidade e negativos. |
| Handoff | `BK-MF9-02`, `BK-MF9-03` | Usam `maxQuality`, `qualityRank`, `familySharing` e `maxFamilyMembers`. |

##### Contrato vinculativo de checkout após a auditoria (2026-07-10)

- Os planos Família entram no mesmo checkout simulado seguro; não criam uma rota alternativa de ativação.
- `POST /api/payments/simulated-checkout` exige `Idempotency-Key` e calcula `requestHash` sobre operação/payload normalizados.
- Replay da mesma chave/hash devolve a resposta original; a mesma chave com payload diferente devolve `409 IDEMPOTENCY_KEY_REUSED`.
- Tentativa v2, subscrição, notificação e resposta fazem commit/rollback na mesma transação e capturam o snapshot do plano no momento da compra.
- `paymentsApi` envia a chave no header `Idempotency-Key`, nunca no payload.
  `SubscriptionPage` gera uma chave por `checkout:<planCode>`, preserva-a após
  timeout/abort/falha ambígua da mesma intenção e só a elimina depois de sucesso.
- Leituras e checkout usam `AbortSignal`; o unmount cancela pedidos, duplo clique
  fica bloqueado antes do render e `REQUEST_ABORTED` não é apresentado como erro.
- `maxFamilyMembers` inclui o owner; um plano com valor `5` disponibiliza quatro lugares além do owner.
- Entitlements são fail-closed: subscrição `active` exige plano existente,
  `active:true`, tier `pro|family` e qualidade suportada dentro do máximo do
  tier. `trialing` só vale com `planCode: "trial"`; qualquer incoerência devolve
  tier `none` e zero acesso premium.
- `maxQuality` é uma string obrigatória e fechada. Um plano Família exige ainda
  `familySharing: true` e `maxFamilyMembers` numérico inteiro entre 2 e 5; campos
  ausentes, strings numéricas ou valores fora do limite nunca recebem defaults.
- Planos ativos incompletos são omitidos de `GET /api/subscriptions/plans` e
  recusados antes de checkout ou renovação, sem criar tentativa financeira.
- O Passo 4 não redefine pagamentos: reutiliza integralmente o checkout/trial
  transacional e idempotente do `BK-MF4-02` e acrescenta apenas os cenários
  Família. Uma segunda implementação neste guia é proibida.
- O provider permanece `faithflix-simulated`; não existe gateway real, webhook ou prova de faturação externa.

#### Ficheiros a criar/editar/rever

- EDITAR: `backend/src/modules/subscriptions/subscriptions.service.js`
- REVER: `backend/src/modules/subscriptions/subscriptions.controller.js`
- EDITAR: `backend/src/modules/payments/payments.service.js`
- EDITAR: `frontend/src/pages/SubscriptionPage.jsx`
- REVER: `frontend/src/services/api/subscriptionsApi.js`
- REVER: `frontend/src/services/api/paymentsApi.js`
- CRIAR/EDITAR: `backend/tests/unit/mf9-subscriptions.test.js`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato dos planos MF9

1. Objetivo funcional do passo no contexto da app.

Confirmar o contrato antes de escrever código, para não criar planos ou campos que não existem na planificação.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro neste passo.
    - EDITAR: nenhum ficheiro neste passo.
    - REVER: `docs/RF.md`, `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`, `docs/planificacao/backlogs/MF-VIEWS.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: linhas de `RF61`, `BK-MF9-01` e `Sprint 13`.

3. Instruções do que fazer.

Regista numa nota de trabalho que `faithflix-monthly` e `faithflix-yearly` ficam Pro, que Família precisa de partilha ativa e que a qualidade máxima por plano será usada no BK seguinte. Confirma também que o plano Família não cria ainda convites nem memberships; isso fica para `BK-MF9-03`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Este passo é de leitura técnica e evita que o aluno comece por inventar campos sem fonte documental.

Não há código porque o objetivo é alinhar requisitos. A decisão importante é perceber que `tier`, `maxQuality`, `qualityRank`, `familySharing` e `maxFamilyMembers` não são texto livre: são o contrato que os próximos services vão consumir. Este passo protege compatibilidade com MF4 e impede que o BK avance com nomes de planos incoerentes.

6. Validação do passo.

A validação passa quando consegues explicar, por escrito, que `RF61` depende de `RF35` e `RF38`, e que `BK-MF9-02` depende de `maxQuality`.

7. Cenário negativo/erro esperado.

Se alguém propuser remover `faithflix-monthly` ou `faithflix-yearly`, o resultado esperado é bloquear a alteração porque quebraria compatibilidade com MF4.

### Passo 2 - Definir entitlements e seed de planos

1. Objetivo funcional do passo no contexto da app.

Criar a fonte única de capacidades dos planos no service de subscrições.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `backend/src/modules/subscriptions/subscriptions.service.js`
    - REVER: `backend/src/modules/subscriptions/subscriptions.validation.js`
    - LOCALIZAÇÃO: topo do service, junto das constantes de planos e helpers de subscrição.

3. Instruções do que fazer.

Substitui a zona dos planos base por constantes que distinguem `pro`, `family`, `trial` e `none`. Mantém preços em cêntimos e moeda `EUR`. Não alteres os códigos antigos, porque eles continuam a ser usados por MF4.

4. Código completo, correto e integrado com a app final.

```js
// backend/src/modules/subscriptions/subscriptions.service.js
const QUALITY_RANKS = {
  "480p": 480,
  "720p": 720,
  "1080p": 1080,
  "2160p": 2160,
  "4k": 2160,
};

const ENTITLEMENTS = {
  none: {
    tier: "none",
    maxQuality: "720p",
    qualityRank: 720,
    familySharing: false,
    maxFamilyMembers: 1,
  },
  trial: {
    tier: "trial",
    maxQuality: "1080p",
    qualityRank: 1080,
    familySharing: false,
    maxFamilyMembers: 1,
  },
  pro: {
    tier: "pro",
    maxQuality: "1080p",
    qualityRank: 1080,
    familySharing: false,
    maxFamilyMembers: 1,
  },
  family: {
    tier: "family",
    maxQuality: "2160p",
    qualityRank: 2160,
    familySharing: true,
    maxFamilyMembers: 5,
  },
};

const DEFAULT_PLANS = [
  {
    code: "faithflix-monthly",
    name: "FaithFlix Pro Mensal",
    interval: "monthly",
    priceCents: 799,
    currency: "EUR",
    solidaritySharePercent: 20,
    // Os códigos históricos continuam ativos e passam apenas a declarar o tier Pro.
    tier: "pro",
    maxQuality: "1080p",
    familySharing: false,
    maxFamilyMembers: 1,
    features: ["Streaming até Full HD", "Acesso premium individual", "Pool solidária incluída"],
    active: true,
  },
  {
    code: "faithflix-yearly",
    name: "FaithFlix Pro Anual",
    interval: "yearly",
    priceCents: 7990,
    currency: "EUR",
    solidaritySharePercent: 20,
    tier: "pro",
    maxQuality: "1080p",
    familySharing: false,
    maxFamilyMembers: 1,
    features: ["Streaming até Full HD", "Acesso premium individual", "Pool solidária incluída"],
    active: true,
  },
  {
    code: "faithflix-family-monthly",
    name: "FaithFlix Família Mensal",
    interval: "monthly",
    priceCents: 1299,
    currency: "EUR",
    solidaritySharePercent: 20,
    // Família desbloqueia partilha e 4K sem alterar o fluxo de pagamento simulado.
    tier: "family",
    maxQuality: "2160p",
    familySharing: true,
    maxFamilyMembers: 5,
    features: ["Streaming até 4K", "Partilha com até 5 utilizadores", "Gestão familiar na app"],
    active: true,
  },
  {
    code: "faithflix-family-yearly",
    name: "FaithFlix Família Anual",
    interval: "yearly",
    priceCents: 12990,
    currency: "EUR",
    solidaritySharePercent: 20,
    tier: "family",
    maxQuality: "2160p",
    familySharing: true,
    maxFamilyMembers: 5,
    features: ["Streaming até 4K", "Partilha com até 5 utilizadores", "Gestão familiar na app"],
    active: true,
  },
];
```

5. Explicação do código.

Este bloco cria o contrato central de planos. `QUALITY_RANKS` prepara a comparação técnica que `BK-MF9-02` vai usar. `ENTITLEMENTS` define capacidades por tier e impede que cada módulo invente a sua própria regra. `DEFAULT_PLANS` preserva os códigos Pro existentes e acrescenta Família com partilha e 4K. Os dados entram como seed de planos e saem depois como documentos públicos. O aluno pode adaptar preço e texto de funcionalidades, mas não deve trocar códigos, tier ou campos de entitlement sem atualizar os testes e os BKs dependentes.

6. Validação do passo.

Confirma que existem exatamente quatro planos ativos e que os dois planos antigos continuam com os mesmos `code`.

7. Cenário negativo/erro esperado.

Se `faithflix-monthly` desaparecer ou mudar de código, o teste de compatibilidade deve falhar antes do merge.

### Passo 3 - Publicar planos sem campos internos

1. Objetivo funcional do passo no contexto da app.

Garantir que a API publica entitlements úteis sem expor objetos internos da base de dados.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `backend/src/modules/subscriptions/subscriptions.service.js`
    - REVER: `backend/src/modules/subscriptions/subscriptions.controller.js`
    - LOCALIZAÇÃO: helpers de plano público, criação de índices e função `listPlans`.

3. Instruções do que fazer.

Adiciona `qualityRankForValue`, `entitlementsForPlan`, `publicPlan`, `ensureSubscriptionIndexes` e `listPlans`. O controller `getPlans` deve continuar a chamar `listPlans()`.

4. Código completo, correto e integrado com a app final.

```js
// backend/src/modules/subscriptions/subscriptions.service.js
/**
 * Calcula o ranking numérico de uma qualidade de vídeo.
 *
 * @param {unknown} value Valor como `1080p`, `2160p` ou `4K`.
 * @returns {number} Ranking usado para comparação segura.
 */
export function qualityRankForValue(value) {
  const normalized = String(value ?? "").trim().toLowerCase();
  return Object.hasOwn(QUALITY_RANKS, normalized)
    ? QUALITY_RANKS[normalized]
    : 0;
}

export function isSupportedQualityValue(value) {
  const normalized = String(value ?? "").trim().toLowerCase();
  return Object.hasOwn(QUALITY_RANKS, normalized);
}

/**
 * Resolve entitlements de um plano persistido.
 *
 * @param {object | null | undefined} plan Plano MongoDB.
 * @returns {object} Entitlements normalizados.
 */
export function entitlementsForPlan(plan) {
  const tier = String(plan?.tier ?? "").trim().toLowerCase();

  if (!plan || plan.active !== true || !["pro", "family"].includes(tier)) {
    return { ...ENTITLEMENTS.none };
  }

  const defaults = ENTITLEMENTS[tier];
  const maxQuality = typeof plan.maxQuality === "string"
    ? plan.maxQuality.trim().toLowerCase()
    : "";

  if (
    !isSupportedQualityValue(maxQuality) ||
    qualityRankForValue(maxQuality) > defaults.qualityRank
  ) {
    return { ...ENTITLEMENTS.none };
  }

  const familySharing = tier === "family";
  const configuredFamilyMembers = plan.maxFamilyMembers;

  if (
    familySharing &&
    (plan.familySharing !== true ||
      !Number.isInteger(configuredFamilyMembers) ||
      configuredFamilyMembers < 2 ||
      configuredFamilyMembers > defaults.maxFamilyMembers)
  ) {
    return { ...ENTITLEMENTS.none };
  }

  return {
    ...defaults,
    tier: defaults.tier,
    maxQuality,
    qualityRank: qualityRankForValue(maxQuality),
    familySharing,
    maxFamilyMembers: familySharing ? configuredFamilyMembers : 1,
  };
}

/**
 * Falha antes de billing quando o plano não produz entitlements válidos.
 *
 * @param {object | null | undefined} plan Plano lido na mesma transação.
 * @returns {object} O mesmo plano, já validado para compra/ativação/renovação.
 */
export function assertPurchasablePlan(plan) {
  if (entitlementsForPlan(plan).tier === "none") {
    const error = new Error("Plano não encontrado.");
    error.statusCode = 404;
    error.code = "PLAN_NOT_FOUND";
    throw error;
  }

  return plan;
}

export async function findPurchasablePlan(db, planCode, { session = null } = {}) {
  const plan = await db.collection("subscription_plans").findOne(
    { code: planCode, active: true },
    { session },
  );

  // A validação ocorre antes de qualquer payment_attempt ou subscrição.
  return assertPurchasablePlan(plan);
}

/**
 * Remove campos internos de um plano antes de o expor ao frontend.
 *
 * @param {object} plan Documento MongoDB de `subscription_plans`.
 * @returns {object} Plano público consumido pela UI.
 */
function publicPlan(plan) {
  const entitlements = entitlementsForPlan(plan);

  return {
    id: String(plan._id),
    code: plan.code,
    name: plan.name,
    interval: plan.interval,
    priceCents: plan.priceCents,
    currency: plan.currency,
    solidaritySharePercent: plan.solidaritySharePercent,
    // A resposta pública entrega capacidades, não regras secretas nem campos internos.
    tier: entitlements.tier,
    maxQuality: entitlements.maxQuality,
    familySharing: entitlements.familySharing,
    maxFamilyMembers: entitlements.maxFamilyMembers,
    features: Array.isArray(plan.features) ? plan.features : [],
  };
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

  for (const plan of DEFAULT_PLANS) {
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
 * @returns {Promise<{ plans: object[] }>} Planos públicos ordenados por preço.
 */
export async function listPlans() {
  const db = await getDb();
  const plans = await db.collection("subscription_plans")
    .find({ active: true })
    .sort({ priceCents: 1 })
    .toArray();

  return {
    plans: plans
      .filter((plan) => entitlementsForPlan(plan).tier !== "none")
      .map(publicPlan),
  };
}
```

5. Explicação do código.

`qualityRankForValue` converte texto de qualidade num número comparável e `isSupportedQualityValue` fecha o vocabulário. `entitlementsForPlan` não completa dados em falta: qualquer plano incompleto recebe `none`. `publicPlan` remove detalhes de persistência e `listPlans` exclui planos inelegíveis. `ensureSubscriptionIndexes` garante unicidade por `code` e cria os planos base sem duplicar documentos. O mesmo helper é aplicado antes de checkout, ativação e renovação, impedindo cobrar um plano que depois não concederia acesso.

6. Validação do passo.

Arranca o backend e executa `GET /api/subscriptions/plans`. A resposta deve conter `tier`, `maxQuality`, `familySharing`, `maxFamilyMembers` e `features` em cada plano.

7. Cenário negativo/erro esperado.

Se um plano ativo não tiver `tier`, `maxQuality` ou, no tier Família,
`familySharing: true` e `maxFamilyMembers` inteiro, fica fora da resposta pública.
Checkout e renovação desse código falham antes de qualquer ledger; nunca se faz
fallback para Pro, 4K ou cinco lugares.

### Passo 4 - Manter checkout simulado compatível

1. Objetivo funcional do passo no contexto da app.

Permitir que qualquer plano ativo, incluindo Família, possa ser comprado no fluxo simulado já existente.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `backend/src/modules/payments/payments.service.js`
    - REVER: `backend/src/modules/payments/payments.validation.js`
    - LOCALIZAÇÃO: função completa `createSimulatedCheckout`.

3. Instruções do que fazer.

Mantém a validação do payload e a chave idempotente. Importa
`findPurchasablePlan` do service de subscrições e usa-o dentro da transação,
antes de criar `payment_attempts`. `activateSubscription` recebe
`{ db, session, plan, now }` e chama também `assertPurchasablePlan(plan)` como
defesa em profundidade. O worker de renovação aplica o mesmo assert ao plano
antes de criar a tentativa do novo ciclo.

4. Código completo, correto e integrado com a app final.

```js
// backend/src/modules/payments/payments.service.js
import {
  activateSubscription,
  findPurchasablePlan,
} from "../subscriptions/subscriptions.service.js";

async function loadCheckoutPlan(db, planCode, session) {
  // A leitura usa a mesma sessão e falha antes da criação do ledger v2.
  return findPurchasablePlan(db, planCode, { session });
}
```

No início da callback transacional de `createSimulatedCheckout`, depois do
replay idempotente e antes de calcular `now`, `attemptId` ou `status`, substitui
a query direta por:

```js
const plan = await loadCheckoutPlan(db, payload.planCode, session);
```

Em `activateSubscription` e no caminho de renovação que já leu o plano, aplica
o mesmo contrato antes da primeira escrita:

```js
assertPurchasablePlan(plan);
```

5. Explicação do código.

O checkout e o trial são implementados uma única
vez no `BK-MF4-02`. Este BK reutiliza obrigatoriamente
`createSimulatedCheckout(userId, input, idempotencyKey, context)` e limita-se a
garantir que os planos Família completos passam pela mesma validação de
entitlements, transação, ledger v2, notificação e audit. Não copies nem redefinas
o service de pagamentos neste guia.

O input vem do frontend, mas a decisão continua no service autoritativo do
`BK-MF4-02`: só planos ativos e semanticamente completos chegam à criação do
ledger, o `userId` vem da sessão e a chave vem do header. Família entra no fluxo
sem uma segunda implementação de pagamentos e sem criar um percurso não
transacional.

6. Validação do passo.

Executa checkout simulado com `faithflix-family-monthly` e `simulateOutcome: "approved"`. O resultado esperado é HTTP `201`, subscrição ativa e `planCode` Família.

7. Cenário negativo/erro esperado.

Com `planCode: "faithflix-family-inexistente"`, o backend deve devolver HTTP
`404` com mensagem de plano não encontrado. Repete o negativo com um plano
`active: true` e finanças válidas, mas sem `tier`/`maxQuality` ou com campos
Família incoerentes: deve devolver `404 PLAN_NOT_FOUND` e persistir zero
`payment_attempts`, subscrições, notificações e audit logs.

### Passo 5 - Mostrar Pro/Família na página de subscrição

1. Objetivo funcional do passo no contexto da app.

Apresentar os novos entitlements ao utilizador sem transformar a UI em fonte de autorização.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `frontend/src/pages/SubscriptionPage.jsx`
    - REVER: `frontend/src/services/api/subscriptionsApi.js`
    - REVER: `frontend/src/services/api/paymentsApi.js`
    - LOCALIZAÇÃO: helpers de formatação e componente local de listagem dos planos.

3. Instruções do que fazer.

Adiciona os helpers `formatPrice`, `formatQuality` e `intervalLabels` se ainda não existirem. Depois substitui a zona de renderização de planos por `PlansSection`. O botão continua a chamar o checkout simulado com o `plan.code` vindo da API.

4. Código completo, correto e integrado com a app final.

```jsx
// frontend/src/pages/SubscriptionPage.jsx
import { EmptyState } from "../components/ui/EmptyState.jsx";

const moneyFormatter = new Intl.NumberFormat("pt-PT", {
  currency: "EUR",
  style: "currency",
});

const intervalLabels = {
  monthly: "Mensal",
  yearly: "Anual",
};

/**
 * Formata preço em cêntimos para euros no padrão português.
 *
 * @param {number} cents Valor monetário guardado em cêntimos.
 * @returns {string} Valor formatado para a UI.
 */
function formatPrice(cents) {
  return moneyFormatter.format(Number(cents ?? 0) / 100);
}

/**
 * Converte a qualidade técnica em texto compreensível para o utilizador.
 *
 * @param {string} quality Qualidade máxima recebida da API.
 * @returns {string} Qualidade apresentada na página.
 */
function formatQuality(quality) {
  if (quality === "2160p") return "4K";
  return quality || "Automática";
}

/**
 * Renderiza os planos públicos devolvidos pelo backend.
 *
 * @param {object} props Propriedades do componente.
 * @param {object[]} props.plans Planos vindos de `subscriptionsApi.listPlans()`.
 * @param {boolean} props.submitting Indica se existe uma operação em curso.
 * @param {(planCode: string) => Promise<void>} props.onCheckout Handler do checkout simulado.
 * @returns {JSX.Element} Secção de planos.
 */
function PlansSection({ plans, submitting, onCheckout }) {
  return (
    <section>
      <h2>Planos</h2>
      {plans.length === 0 ? (
        <EmptyState title="Sem planos ativos" description="Volta a esta página depois de a equipa publicar novos planos." />
      ) : null}
      <div className="content-grid">
        {plans.map((plan) => (
          <article className="content-card" key={plan.code}>
            <span className="content-card-eyebrow">{intervalLabels[plan.interval] ?? plan.interval}</span>
            <h3>{plan.name}</h3>
            <p className="content-card-meta">{formatPrice(plan.priceCents)}</p>
            <p>Qualidade até {formatQuality(plan.maxQuality)}.</p>
            <p>{plan.familySharing ? `${plan.maxFamilyMembers} utilizadores incluídos.` : "Acesso individual."}</p>
            <p>{plan.solidaritySharePercent}% para a pool solidária.</p>
            {plan.features?.length ? (
              <ul>
                {plan.features.map((feature) => (
                  // Cada feature vem do backend para a UI não inventar benefícios do plano.
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            ) : null}
            <button type="button" disabled={submitting} onClick={() => onCheckout(plan.code)}>
              Pagar com método simulado
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
```

Depois, dentro do `return` de `SubscriptionPage`, usa:

```jsx
<PlansSection plans={plans} submitting={submitting} onCheckout={handleSimulatedCheckout} />
```

5. Explicação do código.

`formatPrice` usa `Intl.NumberFormat` para cumprir `RNF40` e evitar valores monetários soltos. `formatQuality` traduz `2160p` para 4K sem mudar o contrato técnico que vem da API. `PlansSection` recebe `plans`, `submitting` e `onCheckout` por props, por isso não depende de variáveis escondidas. O botão envia sempre `plan.code`, vindo do backend, e a UI só apresenta capacidades; não calcula permissões de Família nem qualidade por conta própria. O aluno pode alterar classes CSS e texto visual, mas não deve criar códigos de plano hardcoded fora da resposta da API.

6. Validação do passo.

No browser, a página deve mostrar quatro planos, dois Pro e dois Família, com valores em euros, qualidade máxima, lugares familiares e botão de pagamento simulado.

7. Cenário negativo/erro esperado.

Se o backend devolver lista vazia, a UI deve apresentar o estado "Sem planos ativos" em vez de rebentar com erro.

### Passo 6 - Criar testes unitários MF9 para planos

1. Objetivo funcional do passo no contexto da app.

Provar que o contrato de planos ficou estável e que Família não quebrou Pro.

2. Ficheiros envolvidos:
    - CRIAR: `backend/tests/unit/mf9-subscriptions.test.js`
    - EDITAR: `backend/tests/unit/mf9-subscriptions.test.js`, se o ficheiro já existir
    - REVER: `backend/src/config/database.js`
    - LOCALIZAÇÃO: suite MF9 de subscrições.

3. Instruções do que fazer.

Cria fixtures de planos e testa `listPlans()`. O teste deve procurar planos por `code`, não por posição no array. Este ficheiro começa pequeno neste BK e será alargado nos BKs seguintes da MF9.

4. Código completo, correto e integrado com a app final.

```js
// backend/tests/unit/mf9-subscriptions.test.js
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { ObjectId } from "mongodb";
import { setDbForTests } from "../../src/config/database.js";
import { listPlans } from "../../src/modules/subscriptions/subscriptions.service.js";

/**
 * Cria uma coleção em memória com o mínimo necessário para `listPlans()`.
 *
 * @param {object[]} rows Documentos iniciais.
 * @returns {object} Coleção fake compatível com o subset usado no teste.
 */
function collection(rows = []) {
  return {
    find(query = {}) {
      let result = rows.filter((row) =>
        Object.entries(query).every(([key, value]) => row[key] === value),
      );

      return {
        sort(sortSpec = {}) {
          const [[key, direction] = []] = Object.entries(sortSpec);
          if (key) {
            // Ordenar no teste evita depender da ordem em que os planos foram criados.
            result = result.toSorted((left, right) => (left[key] - right[key]) * direction);
          }
          return this;
        },
        async toArray() {
          return result;
        },
      };
    },
  };
}

/**
 * Instala coleções fake na ligação usada pelos services.
 *
 * @param {Record<string, object>} collections Coleções disponíveis por nome.
 * @returns {void}
 */
function setCollectionsForTests(collections) {
  setDbForTests({
    collection(name) {
      return collections[name] ?? collection([]);
    },
  });
}

/**
 * Cria planos Pro/Família usados pela suite MF9.
 *
 * @returns {object[]} Planos persistidos em memória.
 */
function planRows() {
  return [
    {
      _id: new ObjectId(),
      code: "faithflix-monthly",
      name: "FaithFlix Pro Mensal",
      interval: "monthly",
      priceCents: 799,
      currency: "EUR",
      solidaritySharePercent: 20,
      tier: "pro",
      maxQuality: "1080p",
      familySharing: false,
      maxFamilyMembers: 1,
      features: ["Streaming até Full HD"],
      active: true,
    },
    {
      _id: new ObjectId(),
      code: "faithflix-family-monthly",
      name: "FaithFlix Família Mensal",
      interval: "monthly",
      priceCents: 1299,
      currency: "EUR",
      solidaritySharePercent: 20,
      tier: "family",
      maxQuality: "2160p",
      familySharing: true,
      maxFamilyMembers: 5,
      features: ["Streaming até 4K", "Partilha familiar"],
      active: true,
    },
  ];
}

afterEach(() => {
  setDbForTests(null);
});

test("MF9 publica planos Pro/Família com entitlements", async () => {
  setCollectionsForTests({
    subscription_plans: collection(planRows()),
  });

  const response = await listPlans();
  const pro = response.plans.find((plan) => plan.code === "faithflix-monthly");
  const family = response.plans.find((plan) => plan.code === "faithflix-family-monthly");

  // Procurar por código torna o teste resistente a reordenação por preço.
  assert.equal(pro.tier, "pro");
  assert.equal(pro.maxQuality, "1080p");
  assert.equal(pro.familySharing, false);
  assert.equal(family.tier, "family");
  assert.equal(family.maxQuality, "2160p");
  assert.equal(family.familySharing, true);
  assert.equal(family.maxFamilyMembers, 5);
});
```

5. Explicação do código.

O teste usa uma coleção em memória para simular `subscription_plans`, mas chama a função real `listPlans()`, a mesma usada pelo controller. `collection()` implementa apenas `find().sort().toArray()`, porque este BK só precisa de validar a listagem pública. `planRows()` cria um Pro e um Família com os campos essenciais. As asserts verificam compatibilidade Pro e novo contrato Família. Este teste evita que alguém mude `tier`, remova `maxQuality` ou quebre `familySharing` sem perceber o impacto em `BK-MF9-02` e `BK-MF9-03`.

6. Validação do passo.

Executa, dentro de `backend/`, `npm test -- --test-name-pattern=MF9` se o runner suportar filtro; caso contrário, executa a suite completa.

7. Cenário negativo/erro esperado.

Se o plano Família não tiver `maxFamilyMembers: 5`, o teste deve falhar.

### Passo 7 - Validar handoff para qualidade e família

1. Objetivo funcional do passo no contexto da app.

Fechar o BK com prova técnica e deixar campos claros para os BKs seguintes.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro neste passo.
    - EDITAR: nenhum ficheiro neste passo.
    - REVER: `backend/src/modules/subscriptions/subscriptions.service.js`
    - REVER: `frontend/src/pages/SubscriptionPage.jsx`
    - REVER: `backend/tests/unit/mf9-subscriptions.test.js`
    - LOCALIZAÇÃO: output dos testes e resposta de `GET /api/subscriptions/plans`.

3. Instruções do que fazer.

Regista no PR a resposta de planos, um checkout aprovado com Família e um negativo de plano inexistente.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

O trabalho aqui é validar e documentar a prova da entrega.

O código dos passos anteriores já criou o contrato. Este passo confirma que `maxQuality` existe para `BK-MF9-02` e que `familySharing` e `maxFamilyMembers` existem para `BK-MF9-03`. Se esta prova falhar, a MF9 não deve avançar, porque os BKs seguintes ficariam dependentes de campos inexistentes.

6. Validação do passo.

Executa:

```bash
cd backend
npm test
```

E depois:

```bash
cd frontend
npm run build
```

7. Cenário negativo/erro esperado.

Se a resposta de planos não tiver `faithflix-family-monthly`, a MF9 não pode avançar para `BK-MF9-02`.

#### Critérios de aceite

- `GET /api/subscriptions/plans` devolve Pro mensal, Pro anual, Família mensal e Família anual.
- `faithflix-monthly` e `faithflix-yearly` continuam ativos.
- Cada plano público inclui `tier`, `maxQuality`, `qualityRank`, `familySharing`, `maxFamilyMembers` e `features`.
- Checkout simulado aceita `faithflix-family-monthly` e `faithflix-family-yearly`.
- Checkout sem `Idempotency-Key` devolve `400 IDEMPOTENCY_KEY_REQUIRED`; replay não duplica tentativas, subscrições ou notificações.
- Reutilização da mesma chave com outro plano/payload devolve `409 IDEMPOTENCY_KEY_REUSED`.
- Plano inexistente devolve erro controlado e não cria subscrição.
- Plano ativo com `maxQuality` ausente/inválido ou Família sem
  `familySharing: true`/`maxFamilyMembers` inteiro fica fora da listagem e é
  recusado em checkout e renovação sem criar ledger.
- `qualityRankForValue` aceita apenas a allowlist `480p|720p|1080p|2160p|4k`;
  `999p` e qualquer valor desconhecido devolvem rank `0`.
- A página de subscrição mostra preço em EUR, qualidade máxima e lugares familiares.
- Checkout Família envia a chave idempotente, reutiliza-a num retry ambíguo da
  mesma intenção/payload e cancela pedidos no unmount.
- Teste MF9 cobre Pro e Família.

#### Validação final

- `cd backend && npm test`
- `cd frontend && npm run build`
- `bash scripts/validate-planificacao.sh`
- Pedido manual ou automatizado: `GET /api/subscriptions/plans`
- Negativos: plano inexistente/incompleto, pagamento simulado recusado, payload inválido, chave ausente e chave reutilizada com outro payload.

#### Evidence para PR/defesa

- `pr`: referência do PR ou commit do BK.
- `proof`: resposta de `GET /api/subscriptions/plans` com Pro e Família.
- `neg`: plano inexistente com HTTP `404` e pagamento recusado com HTTP `402`.
- `fonte`: `RF35`, `RF38`, `RF61`, `RNF40`, `BK-MF4-01`, `BK-MF4-02`.

#### Handoff

Este BK entrega `tier`, `maxQuality`, `qualityRank`, `familySharing` e `maxFamilyMembers`. `BK-MF9-02` usa `maxQuality` e `qualityRank` para filtrar qualidade no backend. `BK-MF9-03` usa `familySharing` e `maxFamilyMembers` para criar partilha familiar real.

#### Changelog

- `2026-06-30`: guia corrigido em modo `corrigir_apenas`, com texto PT-PT acentuado, componente de planos autocontido, teste MF9 completo para o contexto do BK e validações/negativos de `RF61`.
- `2026-07-10`: checkout Família alinhado com `Idempotency-Key`, `requestHash`, ledger v2, transação única e limite familiar que inclui o owner.
- `2026-07-10`: cliente/UI alinhados com header idempotente por plano,
  reutilização em falha ambígua, abort/anti-stale e busy state.
- `2026-07-10`: entitlements passam a exigir campos completos e tipos reais;
  planos malformados deixam de receber defaults e são recusados antes de
  listagem, checkout ou renovação.
