# BK-MF9-01 - Planos Pro/Familia e entitlements

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
- `last_updated`: `2026-06-30`

#### Objetivo

Este BK transforma o catalogo real de subscricoes em planos com entitlements. Os codigos existentes `faithflix-monthly` e `faithflix-yearly` continuam validos, mas passam a representar o tier Pro. O tier Familia acrescenta planos mensal/anual com partilha ativa e qualidade maxima superior.

#### Importancia

Sem entitlements, a aplicacao apenas sabe se existe subscricao ativa. A MF9 precisa de distinguir o que cada plano permite antes de implementar partilha familiar e qualidade por plano.

#### Scope-in

- Atualizar seed de planos em `real_dev/backend`.
- Expor `tier`, `maxQuality`, `familySharing`, `maxFamilyMembers` e `features` em `GET /api/subscriptions/plans`.
- Garantir checkout simulado com os novos codigos Familia.
- Atualizar UI da pagina de subscricao para mostrar Pro/Familia.

#### Scope-out

- Pagamentos reais, gateways externos, faturas legais e DRM.
- Convites familiares e enforcement de qualidade, cobertos nos BK seguintes.

#### Estado antes e depois

- Estado antes: planos pagos apenas mensal/anual, sem tier nem entitlements.
- Estado depois: planos Pro/Familia ficam publicos, testaveis e compativeis com os fluxos MF4.

#### Pre-requisitos

- Rever `BK-MF4-01`, `BK-MF4-02`, `RF35`, `RF38`, `RF61` e `RNF40`.
- Confirmar que `real_dev/backend/src/modules/subscriptions/subscriptions.service.js` e a fonte real.

#### Glossario

- Entitlement: permissao funcional derivada do plano.
- Tier: nivel comercial do plano, como Pro ou Familia.

#### Conceitos teoricos essenciais

O plano nao deve ser apenas texto de UI. O backend precisa de guardar capacidades concretas para que outros modulos possam decidir acesso, qualidade e familia sem confiar no frontend.

#### Arquitetura do BK

- Endpoint(s): `GET /api/subscriptions/plans`, checkout simulado existente.
- Modelo/schema: `subscription_plans` com campos de entitlement.
- Service(s): `subscriptions.service.js`, `payments.service.js`.
- Controller/route: rotas existentes de subscricoes e pagamentos.
- Guard/middleware: nao aplicavel neste BK.
- Cliente API: `subscriptionsApi`, `paymentsApi`.
- Pagina/componente: `SubscriptionPage`.
- Testes: unitarios de planos e checkout.
- Handoff para o proximo BK: `BK-MF9-02` usa `maxQuality`.

#### Ficheiros a criar/editar/rever

- EDITAR: `real_dev/backend/src/modules/subscriptions/subscriptions.service.js`
- EDITAR: `real_dev/frontend/src/pages/SubscriptionPage.jsx`
- TESTAR: `real_dev/backend/tests/unit/mf9-subscriptions.test.js`

#### Tutorial tecnico linear

### Passo 1 - Atualizar contrato de planos

1. Acrescentar campos de entitlement aos planos reais.
2. Preservar codigos existentes para compatibilidade.
3. Validar que a resposta publica nao expoe campos internos.

```js
// Sem codigo neste guia generico; implementar no service real_dev conforme contrato MF9.
```

### Passo 2 - Mostrar planos na UI

1. Ler os novos campos pelo cliente API.
2. Mostrar Pro/Familia, qualidade maxima e lugares familiares.
3. Manter checkout simulado sem recolha de dados financeiros reais.

```jsx
// Sem codigo neste guia generico; a UI deve consumir apenas campos vindos da API.
```

#### Criterios de aceite

- `GET /api/subscriptions/plans` devolve Pro e Familia com entitlements.
- Checkout simulado aceita os codigos Familia.
- Pro preserva os codigos historicos mensal/anual.
- Valores monetarios usam EUR e formato PT-PT.

#### Validacao final

- `npm --prefix real_dev/backend test`
- `npm --prefix real_dev/frontend run build`
- Negativos: plano inexistente, checkout recusado, payload invalido.

#### Evidence para PR/defesa

- `pr`: commit ou PR da MF9.
- `proof`: resposta de `GET /api/subscriptions/plans`.
- `neg`: plano inexistente e pagamento recusado.
- `fonte`: `RF35`, `RF38`, `RF61`, `RNF40`.

#### Handoff

Entrega `tier` e `maxQuality` para `BK-MF9-02` e `familySharing/maxFamilyMembers` para `BK-MF9-03`.

#### Changelog

- `2026-06-30`: guia generico criado para MF9.
