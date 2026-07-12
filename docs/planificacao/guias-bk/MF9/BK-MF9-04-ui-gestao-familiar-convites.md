# BK-MF9-04 - UI de gestão familiar e convites

## Header

- `doc_id`: `GUIA-BK-MF9-04`
- `bk_id`: `BK-MF9-04`
- `macro`: `MF9`
- `owner`: `Mateus`
- `apoio`: `Davi`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF9-03`
- `rf_rnf`: `RF62, RNF01, RNF05, RNF38, RNF40`
- `fase_documental`: `Fase 3`
- `sprint`: `S13`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF9-05`
- `guia_path`: `docs/planificacao/guias-bk/MF9/BK-MF9-04-ui-gestao-familiar-convites.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais tornar a partilha familiar utilizável no frontend. A página de subscrição passa a mostrar o estado familiar, permitir convite por email, aceitar ou recusar convites pendentes, remover membros e sair da Família.

O resultado observável é uma experiência end-to-end: depois de `BK-MF9-03`, o utilizador não precisa de scripts nem de manipulação manual da base de dados para gerir a Família.

#### Importância

`RF62` só fica defendível quando a funcionalidade é acessível na aplicação. A API prova o contrato técnico, mas a UI prova que o fluxo pode ser usado por um aluno, docente ou avaliador.

Este BK também toca `RNF01`, `RNF05`, `RNF38` e `RNF40`: a interface deve ser clara, responsiva, consistente com a app e escrita em português de Portugal.

#### Scope-in

- Atualizar `subscriptionsApi` com métodos de família.
- Carregar planos, subscrição e estado familiar na mesma página.
- Criar formulário de convite por email.
- Mostrar lugares usados, membros, convites pendentes e membership ativa.
- Tratar erros da API com mensagens visíveis.
- Recarregar estado canónico depois de cada mutation familiar.
- Validar cenários positivos e negativos com resultados esperados.

#### Scope-out

- Painel admin de famílias.
- Envio externo de email.
- Redesign visual completo da aplicação.
- Exportação RGPD e métricas; ficam para `BK-MF9-05`.

#### Estado antes e depois

- Antes: a página de subscrição mostra planos, trial e renovação.
- Depois: a página também gere Família com base no estado devolvido pelo backend.

#### Pré-requisitos

- `BK-MF9-03` completo, com API familiar autenticada.
- `frontend/src/services/api/apiClient.js` já criado e configurado para cookies de sessão.
- `frontend/src/services/api/apiErrors.js` já criado para traduzir erros de API.
- `frontend/src/pages/SubscriptionPage.jsx` já existente.
- Ler `RF62`, `RNF01`, `RNF05`, `RNF38` e `RNF40`.
- Rever o mockup apenas para linguagem visual, hierarquia de página e consistência de navegação.

#### Glossário

- `Estado canónico`: resposta atual do backend depois de uma operação.
- `Mutation`: ação que altera estado, como convidar, aceitar, recusar, remover ou sair.
- `Convite pendente`: convite criado que ainda não dá acesso premium.
- `Família própria`: família gerida pelo owner autenticado.
- `Membership ativa`: partilha aceite em que o utilizador autenticado é membro.

#### Conceitos teóricos essenciais

- `CANONICO`: a UI não decide se o utilizador pode convidar; apenas mostra o estado vindo do backend e envia a ação.
- Estados React (`loading`, `submitting`, `error`, `status`) tornam o fluxo compreensível e evitam cliques repetidos.
- Recarregar o estado depois de cada ação evita divergência entre a página e a base de dados.
- O frontend usa `apiClient` para herdar cookies de sessão. A página não recebe nem guarda tokens.
- Mensagens PT-PT ajudam a defesa e reduzem ambiguidade para alunos do 12.o ano.
- `DERIVADO`: manter tudo na página de subscrição é a solução mínima, porque Família é uma capacidade do plano.
- A evidence deste BK deve mostrar estados observáveis: convite criado, convite aceite, membro removido e erro visível.

#### Arquitetura do BK

| Camada | Artefacto | Responsabilidade |
| --- | --- | --- |
| Cliente API | `frontend/src/services/api/subscriptionsApi.js` | Expõe métodos para listar, convidar, aceitar, recusar, remover e sair. |
| Página | `frontend/src/pages/SubscriptionPage.jsx` | Carrega planos, subscrição e estado familiar; mostra ações e mensagens. |
| Componentes UI | `EmptyState`, cards e formulários existentes | Mostram loading, erro, sucesso, vazio e listas. |
| Backend consumido | `/api/subscriptions/family/*` | Contrato criado em `BK-MF9-03`. |
| Handoff | `BK-MF9-05` | Fornece fluxos visíveis para privacidade, operação e métricas. |

##### Contrato vinculativo de robustez da UI (Fase 5 - 2026-07-10)

- O carregamento de planos/subscrição/família usa `AbortController`, é cancelado
  no unmount/retry/mudança de sessão e ignora `REQUEST_ABORTED` e respostas antigas.
- Os planos continuam públicos em `anonymous`, `loading` e `unavailable`.
  `getMine` e o overview familiar só são pedidos em `authenticated`; falha de
  sessão não apaga a oferta pública nem é apresentada como logout.
- Todas as mutations familiares passam `AbortSignal` e usam uma reserva síncrona
  mais busy state global para impedir operações sobrepostas antes do render.
- Remover membro, recusar convite e sair da família exigem confirmação explícita
  com linguagem PT-PT. Cancelar não envia mutation. Aceitar convite mantém ação
  direta; convidar valida email até 254 caracteres.
- Depois de sucesso, a página recarrega o overview autoritativo; não altera
  `seatsUsed`, memberships ou acesso premium por cálculo local. Em erro usa
  `toUserMessage` e preserva os campos necessários a retry.
- Estados familiares são traduzidos: `pending` -> `Convite pendente`, `active`
  -> `Membro ativo`, `removed` -> `Removido`; fallback
  `Estado indisponível`. Owner/access source/plano também têm rótulos PT-PT.
- O unmount aborta todas as mutações; uma resposta tardia não mostra feedback ou
  substitui dados noutra rota. Os exemplos dos Passos 1 e 2 devem incorporar
  estas guardas e não são finais sem elas.

#### Ficheiros a criar/editar/rever

- EDITAR: `frontend/src/services/api/subscriptionsApi.js`
- EDITAR: `frontend/src/pages/SubscriptionPage.jsx`
- REVER: `frontend/src/services/api/apiClient.js`
- REVER: `frontend/src/services/api/apiErrors.js`
- REVER: `backend/src/modules/subscriptions/subscriptions.routes.js`

#### Tutorial técnico linear

### Passo 1 - Ligar cliente API familiar

1. Objetivo funcional do passo no contexto da app.

Criar métodos pequenos e claros para cada endpoint familiar.

2. Ficheiros envolvidos:
    - EDITAR: `frontend/src/services/api/subscriptionsApi.js`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Reutiliza `apiClient`. Não cries outro cliente HTTP. Cada método deve refletir uma rota do backend criada em `BK-MF9-03`.

4. Código completo, correto e integrado com a app final.

```js
// frontend/src/services/api/subscriptionsApi.js
import { apiClient } from "./apiClient.js";

/**
 * Cliente frontend para rotas de subscrições.
 *
 * Usa o `apiClient` da MF1 para herdar `credentials: "include"` e enviar
 * cookies HttpOnly sem expor tokens no navegador.
 */
export const subscriptionsApi = {
  /** @returns {Promise<object>} Planos ativos públicos. */
  listPlans(options = {}) {
    return apiClient.get("/api/subscriptions/plans", options);
  },

  /** @returns {Promise<object>} Subscrição do utilizador autenticado. */
  getMine(options = {}) {
    return apiClient.get("/api/subscriptions/me", options);
  },

  /** @returns {Promise<object>} Subscrição com renovação cancelada. */
  cancelRenewal(options = {}) {
    return apiClient.post("/api/subscriptions/me/cancel-renewal", undefined, options);
  },

  /** @returns {Promise<object>} Estado familiar do utilizador autenticado. */
  getFamily(options = {}) {
    return apiClient.get("/api/subscriptions/family", options);
  },

  /**
   * Convida uma conta existente para o plano Família.
   *
   * @param {{ email: string }} input Email da conta convidada.
   * @returns {Promise<object>} Convite criado e estado familiar atualizado.
   */
  inviteFamilyMember(input, options = {}) {
    // A sessão segue no cookie HttpOnly configurado no apiClient da MF1.
    return apiClient.post("/api/subscriptions/family/invitations", input, options);
  },

  /**
   * Aceita um convite familiar pendente.
   *
   * @param {string} invitationId Id do convite.
   * @returns {Promise<object>} Estado familiar atualizado.
   */
  acceptFamilyInvitation(invitationId, options = {}) {
    return apiClient.post(
      `/api/subscriptions/family/invitations/${encodeURIComponent(invitationId)}/accept`,
      undefined,
      options,
    );
  },

  /**
   * Recusa um convite familiar pendente.
   *
   * @param {string} invitationId Id do convite.
   * @returns {Promise<object>} Estado familiar atualizado.
   */
  declineFamilyInvitation(invitationId, options = {}) {
    return apiClient.post(
      `/api/subscriptions/family/invitations/${encodeURIComponent(invitationId)}/decline`,
      undefined,
      options,
    );
  },

  /**
   * Remove um membro da família do owner autenticado.
   *
   * @param {string} memberId Id do utilizador membro.
   * @returns {Promise<object>} Estado familiar atualizado.
   */
  removeFamilyMember(memberId, options = {}) {
    return apiClient.del(
      `/api/subscriptions/family/members/${encodeURIComponent(memberId)}`,
      options,
    );
  },

  /** @returns {Promise<object>} Estado familiar depois de sair. */
  leaveFamily(options = {}) {
    return apiClient.post("/api/subscriptions/family/leave", undefined, options);
  },
};
```

5. Explicação do código.

O cliente API transforma rotas em funções com nomes de domínio. O frontend não guarda credenciais nem cria ownership; o cookie de sessão é enviado pelo cliente central. Cada método devolve a resposta do backend para que a página possa recarregar o estado canónico. O aluno pode alterar textos visuais, mas não deve alterar rotas sem atualizar o backend de `BK-MF9-03`.

6. Validação do passo.

Importa `subscriptionsApi` na página e confirma que o build reconhece todos os métodos. Resultado esperado: sem erro de import ou método inexistente.

7. Cenário negativo/erro esperado.

Sem sessão válida, as rotas familiares devem devolver HTTP `401` e a UI deve mostrar uma mensagem clara vinda de `toUserMessage`.

### Passo 2 - Substituir a página de subscrição com estado familiar

1. Objetivo funcional do passo no contexto da app.

Criar uma página completa que mostra planos, subscrição, trial, checkout simulado e gestão familiar no mesmo fluxo.

2. Ficheiros envolvidos:
    - EDITAR: `frontend/src/pages/SubscriptionPage.jsx`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Substitui o ficheiro pelo conteúdo abaixo. Mantém os imports no topo, os helpers antes do componente e as operações familiares dentro da página.

4. Código completo, correto e integrado com a app final.

```jsx
// frontend/src/pages/SubscriptionPage.jsx
/**
 * Página de subscrição, trial, pagamento simulado e família.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { useSession } from "../context/SessionContext.jsx";
import { paymentsApi } from "../services/api/paymentsApi.js";
import { subscriptionsApi } from "../services/api/subscriptionsApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

const moneyFormatter = new Intl.NumberFormat("pt-PT", {
  currency: "EUR",
  style: "currency",
});

const intervalLabels = {
  monthly: "Mensal",
  yearly: "Anual",
};

const tierLabels = {
  pro: "Pro",
  family: "Família",
  trial: "Trial",
  none: "Sem plano",
};

const accessSourceLabels = {
  own: "Subscrição própria",
  family: "Partilha familiar",
  none: "Sem acesso premium",
};

/**
 * Formata uma data para padrão europeu.
 *
 * @param {string | Date} value Valor de data.
 * @returns {string} Data formatada em português de Portugal.
 */
function formatDate(value) {
  return new Date(value).toLocaleDateString("pt-PT");
}

/**
 * Formata preço em cêntimos.
 *
 * @param {number} cents Valor em cêntimos.
 * @returns {string} Valor monetário em euros.
 */
function formatPrice(cents) {
  return moneyFormatter.format(cents / 100);
}

/**
 * Formata a qualidade máxima para UI.
 *
 * @param {string} quality Qualidade técnica.
 * @returns {string} Qualidade legível.
 */
function formatQuality(quality) {
  if (quality === "2160p") return "4K";
  return quality || "Automática";
}

/**
 * Mostra o nome seguro de um utilizador familiar.
 *
 * @param {object | null} user Utilizador reduzido devolvido pela API.
 * @returns {string} Nome ou email visível.
 */
function familyUserLabel(user) {
  return user?.name || user?.email || "Utilizador";
}

function familyStatusLabel(status) {
  if (status === "pending") return "Convite pendente";
  if (status === "active") return "Membro ativo";
  if (status === "removed") return "Removido";
  return "Estado indisponível";
}

/**
 * Mostra planos, subscrição atual, trial e gestão familiar.
 *
 * @returns {JSX.Element} Página de subscrição.
 */
export function SubscriptionPage() {
  const session = useSession();
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [family, setFamily] = useState(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyOperation, setBusyOperation] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [reloadVersion, setReloadVersion] = useState(0);
  const loadVersionRef = useRef(0);
  const loadControllerRef = useRef(null);
  const activeOperationRef = useRef(null);
  const intentionKeysRef = useRef(new Map());
  const mountedRef = useRef(true);
  const submitting = Boolean(busyOperation);

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
    setBusyOperation(name);
    return controller;
  }

  function releaseOperation(controller) {
    if (activeOperationRef.current?.controller !== controller) return;
    activeOperationRef.current = null;
    if (mountedRef.current) setBusyOperation("");
  }

  /**
   * Carrega planos públicos, subscrição autenticada e estado familiar.
   *
   * @param {AbortSignal} signal Cancelamento da leitura atual.
   * @param {{ showLoading?: boolean }} options Opções do reload autoritativo.
   * @returns {Promise<boolean>} `true` quando todas as leituras aplicáveis passaram.
   */
  const loadData = useCallback(async (signal, { showLoading = true } = {}) => {
    const loadVersion = ++loadVersionRef.current;
    if (showLoading) setLoading(true);
    setError("");
    let plansLoaded = false;

    try {
      try {
        const plansResponse = await subscriptionsApi.listPlans({ signal });
        if (signal.aborted || loadVersion !== loadVersionRef.current) return false;
        setPlans(plansResponse.plans);
        plansLoaded = true;
      } catch (apiError) {
        if (signal.aborted || apiError?.code === "REQUEST_ABORTED") return false;
        if (loadVersion !== loadVersionRef.current) return false;
        setError(toUserMessage(apiError));
        return false;
      }

      if (session.status !== "authenticated") {
        // A oferta é pública. Sessão incerta/ausente não dispara a leitura privada
        // nem transforma o utilizador em logout; apenas limpa o snapshot privado.
        setSubscription(null);
        setFamily(null);
        return plansLoaded;
      }

      try {
        const subscriptionResponse = await subscriptionsApi.getMine({ signal });
        if (signal.aborted || loadVersion !== loadVersionRef.current) return false;
        // O backend é a fonte canónica; a página só guarda a última resposta privada.
        setSubscription(subscriptionResponse.subscription);
        setFamily(subscriptionResponse.family);
        return plansLoaded;
      } catch (apiError) {
        if (signal.aborted || apiError?.code === "REQUEST_ABORTED") return false;
        if (loadVersion !== loadVersionRef.current) return false;
        setError(toUserMessage(apiError));
        return false;
      }
    } finally {
      // O finally exterior cobre também anonymous/loading/unavailable e erro público.
      if (!signal.aborted && loadVersion === loadVersionRef.current && showLoading) {
        setLoading(false);
      }
    }
  }, [session.status]);

  useEffect(() => {
    const controller = new AbortController();
    loadControllerRef.current?.abort();
    loadControllerRef.current = controller;
    void loadData(controller.signal);
    return () => {
      controller.abort();
      // Mudança de sessão/retry invalida também qualquer mutação privada ativa.
      activeOperationRef.current?.controller.abort();
    };
  }, [loadData, reloadVersion]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      loadVersionRef.current += 1;
      loadControllerRef.current?.abort();
      activeOperationRef.current?.controller.abort();
      activeOperationRef.current = null;
    };
  }, []);

  /**
   * Executa uma operação e recarrega o estado canónico do backend.
   *
   * @param {string} name Chave observável da operação/linha.
   * @param {(signal: AbortSignal) => Promise<object>} operation Operação assíncrona.
   * @param {string} successMessage Mensagem de sucesso.
   * @param {string} [confirmation] Confirmação para ações destrutivas.
   * @returns {Promise<boolean>} `true` quando a operação foi concluída.
   */
  async function runOperation(name, operation, successMessage, confirmation = "") {
    if (session.status !== "authenticated") return false;
    const controller = reserveOperation(name);
    if (!controller) return false;
    if (confirmation && !window.confirm(confirmation)) {
      releaseOperation(controller);
      return false;
    }
    setStatus("");
    setError("");

    try {
      await operation(controller.signal);
      if (controller.signal.aborted) return false;
      // O reload evita que a UI mantenha convites ou membros já alterados.
      const reloaded = await loadData(controller.signal, { showLoading: false });
      if (!reloaded || controller.signal.aborted) return false;
      setStatus(successMessage);
      return true;
    } catch (apiError) {
      if (controller.signal.aborted || apiError?.code === "REQUEST_ABORTED") return false;
      setError(toUserMessage(apiError));
      return false;
    } finally {
      releaseOperation(controller);
    }
  }

  /**
   * Executa checkout aprovado com método de teste documentado.
   *
   * @param {string} planCode Código do plano escolhido.
   * @returns {Promise<void>} Termina quando o checkout simulado responder.
   */
  async function handleSimulatedCheckout(planCode) {
    const intention = `checkout:${planCode}`;
    const idempotencyKey = idempotencyKeyFor(intention);
    const completed = await runOperation(
      intention,
      (signal) =>
        paymentsApi.simulatedCheckout({
          planCode,
          paymentMethod: "card_test",
          simulateOutcome: "approved",
        }, idempotencyKey, { signal }),
      "Pagamento simulado aprovado.",
    );
    if (completed) intentionKeysRef.current.delete(intention);
  }

  /**
   * Inicia trial gratuito.
   *
   * @returns {Promise<void>} Termina quando o backend confirmar o trial.
   */
  async function handleStartTrial() {
    const idempotencyKey = idempotencyKeyFor("trial");
    const completed = await runOperation(
      "trial",
      (signal) => paymentsApi.startTrial(idempotencyKey, { signal }),
      "Trial iniciado.",
    );
    if (completed) intentionKeysRef.current.delete("trial");
  }

  /**
   * Cancela apenas a renovação futura da subscrição.
   *
   * @returns {Promise<void>} Termina quando a subscrição for atualizada.
   */
  async function handleCancelRenewal() {
    await runOperation(
      "cancel-renewal",
      (signal) => subscriptionsApi.cancelRenewal({ signal }),
      "Renovação cancelada no fim do ciclo atual.",
      "Cancelar a renovação no fim do ciclo atual? O acesso mantém-se até essa data.",
    );
  }

  /**
   * Envia convite familiar a uma conta existente.
   *
   * @param {SubmitEvent} event Evento do formulário.
   * @returns {Promise<void>} Termina quando o convite for criado.
   */
  async function handleInvite(event) {
    event.preventDefault();

    const normalizedEmail = inviteEmail.trim();
    const created = await runOperation(
      "invite",
      (signal) => subscriptionsApi.inviteFamilyMember(
        { email: normalizedEmail },
        { signal },
      ),
      "Convite familiar criado.",
    );

    if (created) {
      setInviteEmail("");
    }
  }

  function handleAcceptInvitation(invitationId) {
    return runOperation(
      `accept:${invitationId}`,
      (signal) => subscriptionsApi.acceptFamilyInvitation(invitationId, { signal }),
      "Convite familiar aceite.",
    );
  }

  function handleDeclineInvitation(invitationId) {
    return runOperation(
      `decline:${invitationId}`,
      (signal) => subscriptionsApi.declineFamilyInvitation(invitationId, { signal }),
      "Convite familiar recusado.",
      "Recusar este convite familiar? O convite deixa de poder ser aceite.",
    );
  }

  function handleRemoveMember(member) {
    return runOperation(
      `remove:${member.memberUserId}`,
      (signal) => subscriptionsApi.removeFamilyMember(member.memberUserId, { signal }),
      "Membro familiar removido.",
      `Remover ${familyUserLabel(member.member)} da família? O acesso partilhado termina.`,
    );
  }

  function handleLeaveFamily() {
    return runOperation(
      "leave-family",
      (signal) => subscriptionsApi.leaveFamily({ signal }),
      "Saíste da partilha familiar.",
      "Sair da família? Perdes o acesso premium partilhado por este owner.",
    );
  }

  if (loading) {
    return (
      <section className="page-section">
        <p role="status">A carregar subscrição...</p>
      </section>
    );
  }

  const entitlements = subscription?.entitlements ?? {};
  const ownedFamily = family?.ownedFamily;
  const pendingInvitations = family?.pendingInvitations ?? [];
  const activeMembership = family?.activeMembership;

  return (
    <section className="page-section">
      <p className="section-kicker">Planos</p>
      <h1>Subscrição</h1>
      {error ? (
        <EmptyState
          title="Não foi possível atualizar a subscrição"
          description={error}
          tone="error"
        >
          <button
            type="button"
            disabled={submitting}
            onClick={() => setReloadVersion((value) => value + 1)}
          >
            Tentar novamente
          </button>
        </EmptyState>
      ) : null}
      {status ? (
        <EmptyState
          title="Operação concluída"
          description={status}
          tone="success"
        />
      ) : null}

      <section>
        <h2>Estado atual</h2>
        {session.status === "authenticated" ? (
          <>
            <p>{accessSourceLabels[subscription?.accessSource] ?? subscription?.status ?? "Sem subscrição ativa."}</p>
            <p>Plano: {tierLabels[entitlements.tier] ?? entitlements.tier ?? "Sem plano"}</p>
            <p>Qualidade máxima: {formatQuality(entitlements.maxQuality)}</p>
          </>
        ) : null}
        {session.status === "anonymous" ? (
          <p>Inicia sessão para consultar ou alterar a tua subscrição.</p>
        ) : null}
        {session.status === "loading" ? <p role="status">A confirmar sessão...</p> : null}
        {session.status === "unavailable" ? (
          <EmptyState
            title="Sessão temporariamente indisponível"
            description={session.error || "Não assumimos que terminaste sessão. Os planos públicos continuam disponíveis."}
            tone="error"
          >
            <button
              type="button"
              disabled={submitting}
              onClick={() => session.refreshSession().catch(() => {})}
            >
              Tentar confirmar sessão
            </button>
          </EmptyState>
        ) : null}
        {session.status === "authenticated" && subscription?.currentPeriodEnd ? (
          <p>Fim do ciclo: {formatDate(subscription.currentPeriodEnd)}</p>
        ) : null}
        {session.status === "authenticated" && activeMembership?.owner ? (
          <p>Owner familiar: {familyUserLabel(activeMembership.owner)}</p>
        ) : null}
        {session.status === "authenticated" && subscription?.hasPremiumAccess && subscription?.accessSource === "own" && !subscription.cancelAtPeriodEnd ? (
          <button type="button" disabled={submitting} onClick={handleCancelRenewal}>
            {busyOperation === "cancel-renewal" ? "A cancelar..." : "Cancelar renovação"}
          </button>
        ) : null}
      </section>

      <section>
        <h2>Trial</h2>
        <button
          type="button"
          disabled={submitting || session.status !== "authenticated"}
          onClick={handleStartTrial}
        >
          {busyOperation === "trial" ? "A iniciar..." : "Iniciar trial"}
        </button>
      </section>

      <section>
        <h2>Planos</h2>
        {plans.length === 0 ? (
          <EmptyState
            title="Sem planos ativos"
            description="Volta a esta página depois de a equipa publicar novos planos."
          />
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
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              ) : null}
              <button
                type="button"
                disabled={submitting || session.status !== "authenticated"}
                onClick={() => handleSimulatedCheckout(plan.code)}
              >
                {busyOperation === `checkout:${plan.code}`
                  ? "A processar..."
                  : "Pagar com método simulado"}
              </button>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2>Família</h2>
        {session.status === "authenticated" && ownedFamily ? (
          <>
            <p>{ownedFamily.seatsUsed}/{ownedFamily.maxFamilyMembers} lugares usados.</p>
            <form onSubmit={handleInvite} aria-busy={busyOperation === "invite"}>
              <label>
                Email da conta
                <input
                  type="email"
                  value={inviteEmail}
                  maxLength={254}
                  disabled={submitting}
                  onChange={(event) => setInviteEmail(event.target.value)}
                  required
                  placeholder="nome@example.com"
                />
              </label>
              <button type="submit" disabled={submitting || ownedFamily.seatsAvailable <= 0}>
                {busyOperation === "invite" ? "A convidar..." : "Convidar"}
              </button>
            </form>
            {ownedFamily.members.length ? (
              <div className="content-grid">
                {ownedFamily.members.map((member) => (
                  <article
                    className="content-card"
                    key={member.id}
                    aria-busy={busyOperation === `remove:${member.memberUserId}`}
                  >
                    <span className="content-card-eyebrow">{familyStatusLabel(member.status)}</span>
                    <h3>{familyUserLabel(member.member)}</h3>
                    <p>{member.invitedEmail}</p>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleRemoveMember(member)}
                    >
                      {busyOperation === `remove:${member.memberUserId}` ? "A remover..." : "Remover"}
                    </button>
                  </article>
                ))}
              </div>
            ) : null}
          </>
        ) : (
          <EmptyState
            title={session.status === "authenticated"
              ? "Sem plano Família ativo"
              : "Gestão familiar requer sessão confirmada"}
            description={session.status === "authenticated"
              ? "A gestão familiar fica disponível quando o plano Família estiver ativo."
              : "Os planos públicos continuam visíveis; inicia sessão ou repete a confirmação para gerir a família."}
          />
        )}

        {session.status === "authenticated" && pendingInvitations.length ? (
          <div className="content-grid">
            {pendingInvitations.map((invitation) => (
              <article
                className="content-card"
                key={invitation.id}
                aria-busy={busyOperation === `accept:${invitation.id}`
                  || busyOperation === `decline:${invitation.id}`}
              >
                <span className="content-card-eyebrow">Convite pendente</span>
                <h3>{familyUserLabel(invitation.owner)}</h3>
                <p>{invitation.owner?.email}</p>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleAcceptInvitation(invitation.id)}
                >
                  {busyOperation === `accept:${invitation.id}` ? "A aceitar..." : "Aceitar"}
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleDeclineInvitation(invitation.id)}
                >
                  {busyOperation === `decline:${invitation.id}` ? "A recusar..." : "Recusar"}
                </button>
              </article>
            ))}
          </div>
        ) : null}

        {session.status === "authenticated" && activeMembership ? (
          <article className="content-card" aria-busy={busyOperation === "leave-family"}>
            <span className="content-card-eyebrow">Membro ativo</span>
            <h3>{familyUserLabel(activeMembership.owner)}</h3>
            <p>{activeMembership.owner?.email}</p>
            <button
              type="button"
              disabled={submitting}
              onClick={handleLeaveFamily}
            >
              {busyOperation === "leave-family" ? "A sair..." : "Sair da família"}
            </button>
          </article>
        ) : null}
      </section>
    </section>
  );
}
```

5. Explicação do código.

Este ficheiro fica completo para o contexto do BK. Os imports reutilizam peças já criadas: `EmptyState`, `paymentsApi`, `subscriptionsApi` e `toUserMessage`. Os helpers formatam datas, dinheiro, qualidade e utilizadores familiares em português de Portugal.

`loadData` carrega sempre os planos públicos e só consulta subscrição/família
quando `SessionContext` confirma `authenticated`. `anonymous` mantém a oferta
com CTAs privados desativados; `unavailable` conserva os planos, mostra retry e
nunca é convertido em logout. Todas as leituras usam `AbortSignal` e uma versão anti-stale.
`runOperation` reserva a operação sincronamente antes do render, passa o signal,
faz reload autoritativo e só depois mostra sucesso. Cancelar confirmação não envia
pedido; falha preserva os campos e o estado canónico anterior. Checkout e trial
guardam uma `crypto.randomUUID()` por intenção e reutilizam-na num retry até
existir sucesso.

A secção Família nasce sempre do estado canónico devolvido pelo backend. IDs são
codificados pelo cliente API; recusar, remover e sair exigem confirmação; cada
card expõe o busy da sua operação e os enums recebem rótulos PT-PT. A UI nunca
envia `ownerUserId`; o backend decide ownership com a sessão.

6. Validação do passo.

Executa `cd frontend && npm run build`. Resultado esperado: build Vite concluído sem erro de import, helper em falta ou JSX inválido.

7. Cenário negativo/erro esperado.

Se removeres `familyUserLabel`, o build deve falhar com referência indefinida. Se a sessão expirar, a página deve mostrar erro em vez de ecrã em branco.

### Passo 3 - Validar owner com plano Família

1. Objetivo funcional do passo no contexto da app.

Confirmar que o owner consegue gerir a Família sem scripts externos.

2. Ficheiros envolvidos:
    - REVER: `frontend/src/pages/SubscriptionPage.jsx`
    - REVER: `backend/src/modules/subscriptions/subscriptions.routes.js`
    - LOCALIZAÇÃO: secção `Família` e rotas `/api/subscriptions/family/*`.

3. Instruções do que fazer.

Entra com um utilizador com plano Família ativo. Abre a página de subscrição, escreve o email de uma conta existente e submete o formulário.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

A implementação ficou completa no Passo 2; este passo valida o comportamento observável.

A página usa `ownedFamily.seatsAvailable` para desativar o botão quando não há lugares, mas essa validação é apenas apoio de UI. O backend continua a validar plano, limite de lugares e conta existente. Isto evita que um utilizador contorne a UI e crie convites inválidos.

6. Validação do passo.

Resultado esperado: a página mostra `Convite familiar criado.`, o input fica limpo e o convite aparece na lista de convites ou membros familiares conforme a resposta da API.

7. Cenário negativo/erro esperado.

Com owner sem plano Família ativo, a API deve devolver erro e a UI deve mostrar mensagem clara. Resultado esperado: o convite não aparece na lista e o input mantém o email para correção.

### Passo 4 - Validar convidado pendente

1. Objetivo funcional do passo no contexto da app.

Confirmar que a conta convidada consegue aceitar ou recusar o convite dentro da aplicação.

2. Ficheiros envolvidos:
    - REVER: `frontend/src/pages/SubscriptionPage.jsx`
    - LOCALIZAÇÃO: renderização de `pendingInvitations`.

3. Instruções do que fazer.

Entra com a conta convidada. Abre a página de subscrição e confirma que o convite aparece com os botões `Aceitar` e `Recusar`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

O trabalho é executar o fluxo criado no Passo 2.

`pendingInvitations` vem do backend e representa convites ainda sem acesso premium. Só quando o utilizador aceita é que a membership passa a poder contribuir para acesso familiar. A UI chama endpoints diferentes para aceitar e recusar, mantendo o ciclo de vida explícito.

6. Validação do passo.

Ao clicar em `Aceitar`, resultado esperado: a página mostra `Convite familiar aceite.`, remove o convite pendente e passa a mostrar `Membro ativo`. Ao clicar em `Recusar`, resultado esperado: a página mostra `Convite familiar recusado.` e remove o convite pendente.

7. Cenário negativo/erro esperado.

Se outro utilizador tentar aceitar um convite que não lhe pertence, o backend deve devolver erro e a UI deve mostrar a mensagem traduzida sem criar membership.

### Passo 5 - Validar remoção e saída da Família

1. Objetivo funcional do passo no contexto da app.

Confirmar que o owner remove membros e que o membro ativo consegue sair da partilha.

2. Ficheiros envolvidos:
    - REVER: `frontend/src/pages/SubscriptionPage.jsx`
    - LOCALIZAÇÃO: botões `Remover` e `Sair da família`.

3. Instruções do que fazer.

Testa os dois lados do fluxo: primeiro como owner, depois como membro. Em ambos os casos, observa a mensagem de sucesso e o estado recarregado.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Os handlers `removeFamilyMember` e `leaveFamily` já estão ligados no Passo 2.

O owner remove membros por `memberUserId`, mas a API valida que esse membro pertence à sua Família. O membro sai usando a própria sessão, sem enviar `ownerUserId`. Isto preserva ownership no backend e impede ações cruzadas feitas pelo browser.

6. Validação do passo.

Como owner, resultado esperado: ao clicar `Remover`, a UI mostra `Membro familiar removido.` e o membro deixa de aparecer. Como membro, resultado esperado: ao clicar `Sair da família`, a UI mostra `Saíste da partilha familiar.` e a secção `Membro ativo` desaparece.

7. Cenário negativo/erro esperado.

Se tentares remover um utilizador que não pertence à Família do owner autenticado, o backend deve devolver erro e a lista não deve ser alterada visualmente.

### Passo 6 - Validar acessibilidade, mensagens e PT-PT

1. Objetivo funcional do passo no contexto da app.

Garantir que a página fica compreensível em loading, erro, sucesso, vazio e estado preenchido.

2. Ficheiros envolvidos:
    - REVER: `frontend/src/pages/SubscriptionPage.jsx`
    - REVER: `frontend/src/components/ui/EmptyState.jsx`
    - LOCALIZAÇÃO: loading inicial, `EmptyState`, botões e mensagens da secção Família.

3. Instruções do que fazer.

Revê textos visíveis, acentuação, botões desativados durante submissão e estados vazios. Usa o mockup apenas para hierarquia visual e consistência de planos/página.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

O trabalho é rever a UI implementada nos passos anteriores.

`role="status"` informa tecnologias de apoio durante carregamento. `EmptyState` reaproveita o padrão visual da app para erro e sucesso. Os botões usam `disabled={submitting}` para evitar duplo clique durante pedidos HTTP. As mensagens estão em português de Portugal para cumprir `RNF05` e `RNF38`.

6. Validação do passo.

Resultado esperado em loading: `A carregar subscrição...`. Resultado esperado em erro: `Não foi possível atualizar a subscrição` com descrição do erro. Resultado esperado em sucesso: `Operação concluída` com a mensagem concreta da ação.

7. Cenário negativo/erro esperado.

Se a API falhar, a página deve mostrar erro e manter a estrutura da página sem ecrã em branco.

### Passo 7 - Fechar evidence para privacidade e métricas

1. Objetivo funcional do passo no contexto da app.

Confirmar que a UI expõe ações suficientes para `BK-MF9-05` validar privacidade, operação e métricas.

2. Ficheiros envolvidos:
    - REVER: `frontend/src/pages/SubscriptionPage.jsx`
    - REVER: `frontend/src/services/api/subscriptionsApi.js`
    - LOCALIZAÇÃO: botões e mensagens de Família.

3. Instruções do que fazer.

Documenta no PR as ações feitas na UI: convidar, aceitar, recusar, remover e sair. Recolhe captura ou log controlado para cada fluxo principal e pelo menos dois negativos.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

O trabalho é validar o fluxo que ficou implementado.

Os passos anteriores criaram cliente, estado e UI. Este fecho garante que a app consegue gerar memberships reais, que depois entram na exportação RGPD e métricas do próximo BK. A evidence deve mostrar comportamento, não apenas dizer que o build passou.

6. Validação do passo.

Executa:

```bash
cd frontend
npm run build
```

Resultado esperado: build concluído sem erro.

7. Cenário negativo/erro esperado.

Se o build falhar por import errado, método API inexistente ou JSX inválido, o BK não pode ser aceite.

#### Critérios de aceite

- `subscriptionsApi` cobre todos os endpoints familiares do backend.
- `SubscriptionPage.jsx` define `familyUserLabel` e mostra a página completa sem helpers em falta.
- A página mostra planos em qualquer estado de sessão; só pede estado atual e
  familiar quando `SessionContext` está `authenticated`.
- `anonymous` desativa trial/checkout e orienta para login; `unavailable`
  mantém os planos públicos, não chama `getMine`, não simula logout e permite
  repetir a confirmação da sessão.
- Owner Família consegue convidar e remover membros pela UI.
- Membro consegue aceitar, recusar e sair pela UI.
- Loading, erro, sucesso e lista vazia ficam visíveis.
- A página usa português de Portugal e não expõe decisões internas ao utilizador.
- Recusar, remover e sair exigem confirmação; duplo clique não duplica operações,
  unmount cancela pedidos e cada sucesso recarrega o estado canónico.
- O frontend não envia `ownerUserId` nem decide permissões familiares no browser.
- O build do frontend passa.

#### Validação final

- `cd frontend && npm run build`
- Fluxo positivo: owner Família convida, membro aceita, owner remove.
- Negativo 1: owner sem Família tenta convidar; resultado esperado: erro visível e convite não criado.
- Negativo 2: email inválido ou conta inexistente; resultado esperado: erro visível e campo preservado.
- Negativo 3: convite duplicado; resultado esperado: erro visível e sem duplicação na lista.
- Negativo 4: visitante abre `/planos`; resultado esperado: planos públicos
  visíveis, zero chamada a `getMine` e trial/checkout desativados.
- Negativo 5: sessão indisponível; resultado esperado: planos públicos mantidos,
  retry de sessão visível, zero chamada privada e nenhuma mutation aplicada.

#### Evidence para PR/defesa

- `pr`: referência do PR ou commit do BK.
- `proof`: captura ou log do fluxo UI de convite, aceitação, remoção e saída.
- `neg`: evidência dos negativos de owner sem Família, email inválido, convite
  duplicado, visitante com planos públicos e sessão indisponível sem leitura privada.
- `fonte`: `RF62`, `RNF01`, `RNF05`, `RNF38`, `RNF40`, `BK-MF9-03`.

#### Handoff

Este BK entrega memberships criadas e geridas por UI. `BK-MF9-05` deve garantir que esses dados entram na exportação RGPD, eliminação de conta e métricas agregadas.

#### Changelog

- `2026-07-01`: guia corrigido para ficar autocontido, com `familyUserLabel`, página React completa, mensagens PT-PT, comentários didáticos e validações negativas objetivas.
- `2026-07-10`: planos públicos separados da leitura privada; sessão anónima ou
  indisponível deixa de disparar `getMine`, e trial/checkout só ficam ativos com
  sessão autenticada confirmada.
- `2026-07-10`: UI sincronizada com abort/anti-stale, busy state, confirmação de
  ações destrutivas, recarga autoritativa e estados familiares em PT-PT.
