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
- `last_updated`: `2026-07-01`

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

#### Pre-requisitos

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

  /** @returns {Promise<object>} Estado familiar do utilizador autenticado. */
  getFamily() {
    return apiClient.get("/api/subscriptions/family");
  },

  /**
   * Convida uma conta existente para o plano Família.
   *
   * @param {{ email: string }} input Email da conta convidada.
   * @returns {Promise<object>} Convite criado e estado familiar atualizado.
   */
  inviteFamilyMember(input) {
    // A sessão segue no cookie HttpOnly configurado no apiClient da MF1.
    return apiClient.post("/api/subscriptions/family/invitations", input);
  },

  /**
   * Aceita um convite familiar pendente.
   *
   * @param {string} invitationId Id do convite.
   * @returns {Promise<object>} Estado familiar atualizado.
   */
  acceptFamilyInvitation(invitationId) {
    return apiClient.post(`/api/subscriptions/family/invitations/${invitationId}/accept`);
  },

  /**
   * Recusa um convite familiar pendente.
   *
   * @param {string} invitationId Id do convite.
   * @returns {Promise<object>} Estado familiar atualizado.
   */
  declineFamilyInvitation(invitationId) {
    return apiClient.post(`/api/subscriptions/family/invitations/${invitationId}/decline`);
  },

  /**
   * Remove um membro da família do owner autenticado.
   *
   * @param {string} memberId Id do utilizador membro.
   * @returns {Promise<object>} Estado familiar atualizado.
   */
  removeFamilyMember(memberId) {
    return apiClient.del(`/api/subscriptions/family/members/${memberId}`);
  },

  /** @returns {Promise<object>} Estado familiar depois de sair. */
  leaveFamily() {
    return apiClient.post("/api/subscriptions/family/leave");
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

import { useEffect, useState } from "react";
import { EmptyState } from "../components/ui/EmptyState.jsx";
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

/**
 * Mostra planos, subscrição atual, trial e gestão familiar.
 *
 * @returns {JSX.Element} Página de subscrição.
 */
export function SubscriptionPage() {
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [family, setFamily] = useState(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  /**
   * Carrega planos públicos, subscrição autenticada e estado familiar.
   *
   * @returns {Promise<void>} Termina depois de atualizar a página.
   */
  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [plansResponse, subscriptionResponse] = await Promise.all([
        subscriptionsApi.listPlans(),
        subscriptionsApi.getMine(),
      ]);
      // O backend é a fonte canónica; a página só guarda a última resposta recebida.
      setPlans(plansResponse.plans);
      setSubscription(subscriptionResponse.subscription);
      setFamily(subscriptionResponse.family);
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
   * Executa uma operação e recarrega o estado canónico do backend.
   *
   * @param {() => Promise<object>} operation Operação assíncrona.
   * @param {string} successMessage Mensagem de sucesso.
   * @returns {Promise<boolean>} `true` quando a operação foi concluída.
   */
  async function runOperation(operation, successMessage) {
    setStatus("");
    setError("");
    setSubmitting(true);

    try {
      await operation();
      setStatus(successMessage);
      // O reload evita que a UI mantenha convites ou membros já alterados.
      await loadData();
      return true;
    } catch (apiError) {
      setError(toUserMessage(apiError));
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  /**
   * Executa checkout aprovado com método de teste documentado.
   *
   * @param {string} planCode Código do plano escolhido.
   * @returns {Promise<void>} Termina quando o checkout simulado responder.
   */
  async function handleSimulatedCheckout(planCode) {
    await runOperation(
      () =>
        paymentsApi.simulatedCheckout({
          planCode,
          paymentMethod: "card_test",
          simulateOutcome: "approved",
        }),
      "Pagamento simulado aprovado.",
    );
  }

  /**
   * Inicia trial gratuito.
   *
   * @returns {Promise<void>} Termina quando o backend confirmar o trial.
   */
  async function handleStartTrial() {
    await runOperation(() => paymentsApi.startTrial(), "Trial iniciado.");
  }

  /**
   * Cancela apenas a renovação futura da subscrição.
   *
   * @returns {Promise<void>} Termina quando a subscrição for atualizada.
   */
  async function handleCancelRenewal() {
    await runOperation(
      () => subscriptionsApi.cancelRenewal(),
      "Renovação cancelada no fim do ciclo atual.",
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

    const created = await runOperation(
      () => subscriptionsApi.inviteFamilyMember({ email: inviteEmail }),
      "Convite familiar criado.",
    );

    if (created) {
      setInviteEmail("");
    }
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
        />
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
        <p>{accessSourceLabels[subscription?.accessSource] ?? subscription?.status ?? "Sem subscrição ativa."}</p>
        <p>Plano: {tierLabels[entitlements.tier] ?? entitlements.tier ?? "Sem plano"}</p>
        <p>Qualidade máxima: {formatQuality(entitlements.maxQuality)}</p>
        {subscription?.currentPeriodEnd ? (
          <p>Fim do ciclo: {formatDate(subscription.currentPeriodEnd)}</p>
        ) : null}
        {activeMembership?.owner ? (
          <p>Owner familiar: {familyUserLabel(activeMembership.owner)}</p>
        ) : null}
        {subscription?.hasPremiumAccess && subscription?.accessSource === "own" && !subscription.cancelAtPeriodEnd ? (
          <button type="button" disabled={submitting} onClick={handleCancelRenewal}>
            Cancelar renovação
          </button>
        ) : null}
      </section>

      <section>
        <h2>Trial</h2>
        <button type="button" disabled={submitting} onClick={handleStartTrial}>
          Iniciar trial
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
              <button type="button" disabled={submitting} onClick={() => handleSimulatedCheckout(plan.code)}>
                Pagar com método simulado
              </button>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2>Família</h2>
        {ownedFamily ? (
          <>
            <p>{ownedFamily.seatsUsed}/{ownedFamily.maxFamilyMembers} lugares usados.</p>
            <form onSubmit={handleInvite}>
              <label>
                Email da conta
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                  required
                  placeholder="nome@example.com"
                />
              </label>
              <button type="submit" disabled={submitting || ownedFamily.seatsAvailable <= 0}>
                Convidar
              </button>
            </form>
            {ownedFamily.members.length ? (
              <div className="content-grid">
                {ownedFamily.members.map((member) => (
                  <article className="content-card" key={member.id}>
                    <span className="content-card-eyebrow">{member.status}</span>
                    <h3>{familyUserLabel(member.member)}</h3>
                    <p>{member.invitedEmail}</p>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => runOperation(
                        () => subscriptionsApi.removeFamilyMember(member.memberUserId),
                        "Membro familiar removido.",
                      )}
                    >
                      Remover
                    </button>
                  </article>
                ))}
              </div>
            ) : null}
          </>
        ) : (
          <EmptyState
            title="Sem plano Família ativo"
            description="A gestão familiar fica disponível quando o plano Família estiver ativo."
          />
        )}

        {pendingInvitations.length ? (
          <div className="content-grid">
            {pendingInvitations.map((invitation) => (
              <article className="content-card" key={invitation.id}>
                <span className="content-card-eyebrow">Convite pendente</span>
                <h3>{familyUserLabel(invitation.owner)}</h3>
                <p>{invitation.owner?.email}</p>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => runOperation(
                    () => subscriptionsApi.acceptFamilyInvitation(invitation.id),
                    "Convite familiar aceite.",
                  )}
                >
                  Aceitar
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => runOperation(
                    () => subscriptionsApi.declineFamilyInvitation(invitation.id),
                    "Convite familiar recusado.",
                  )}
                >
                  Recusar
                </button>
              </article>
            ))}
          </div>
        ) : null}

        {activeMembership ? (
          <article className="content-card">
            <span className="content-card-eyebrow">Membro ativo</span>
            <h3>{familyUserLabel(activeMembership.owner)}</h3>
            <p>{activeMembership.owner?.email}</p>
            <button
              type="button"
              disabled={submitting}
              onClick={() => runOperation(
                () => subscriptionsApi.leaveFamily(),
                "Saíste da partilha familiar.",
              )}
            >
              Sair da família
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

`loadData` carrega planos e subscrição em paralelo, porque a resposta de subscrição já inclui `family`. `runOperation` centraliza mutation, loading, sucesso, erro e reload, evitando duplicar lógica em todos os botões. O return boolean permite limpar o email apenas quando o convite foi aceite pela API, sem apagar o input depois de erro.

A secção Família nasce sempre do estado canónico devolvido pelo backend. Se o utilizador for owner com plano Família, vê lugares usados, formulário e membros. Se for convidado, vê convites pendentes. Se for membro ativo, vê de onde vem o acesso e pode sair. A UI nunca envia `ownerUserId`; o backend decide ownership com a sessão.

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

Sem código neste passo. A implementação ficou completa no Passo 2; este passo valida o comportamento observável.

5. Explicação do código.

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

Sem código neste passo. O trabalho é executar o fluxo criado no Passo 2.

5. Explicação do código.

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

Sem código neste passo. Os handlers `removeFamilyMember` e `leaveFamily` já estão ligados no Passo 2.

5. Explicação do código.

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

Sem código neste passo. O trabalho é rever a UI implementada nos passos anteriores.

5. Explicação do código.

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

Sem código neste passo. O trabalho é validar o fluxo que ficou implementado.

5. Explicação do código.

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
- A página mostra planos, estado atual e estado familiar.
- Owner Família consegue convidar e remover membros pela UI.
- Membro consegue aceitar, recusar e sair pela UI.
- Loading, erro, sucesso e lista vazia ficam visíveis.
- A página usa português de Portugal e não expõe decisões internas ao utilizador.
- O frontend não envia `ownerUserId` nem decide permissões familiares no browser.
- O build do frontend passa.

#### Validação final

- `cd frontend && npm run build`
- Fluxo positivo: owner Família convida, membro aceita, owner remove.
- Negativo 1: owner sem Família tenta convidar; resultado esperado: erro visível e convite não criado.
- Negativo 2: email inválido ou conta inexistente; resultado esperado: erro visível e campo preservado.
- Negativo 3: convite duplicado; resultado esperado: erro visível e sem duplicação na lista.
- Negativo 4: sessão expirada; resultado esperado: erro de autenticação e nenhuma mutation aplicada.

#### Evidence para PR/defesa

- `pr`: referência do PR ou commit do BK.
- `proof`: captura ou log do fluxo UI de convite, aceitação, remoção e saída.
- `neg`: evidência dos negativos de owner sem Família, email inválido, convite duplicado e sessão expirada.
- `fonte`: `RF62`, `RNF01`, `RNF05`, `RNF38`, `RNF40`, `BK-MF9-03`.

#### Handoff

Este BK entrega memberships criadas e geridas por UI. `BK-MF9-05` deve garantir que esses dados entram na exportação RGPD, eliminação de conta e métricas agregadas.

#### Changelog

- `2026-07-01`: guia corrigido para ficar autocontido, com `familyUserLabel`, página React completa, mensagens PT-PT, comentários didáticos e validações negativas objetivas.
