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
- `last_updated`: `2026-06-30`

#### Objetivo

Este BK cria a partilha familiar real entre contas existentes. O owner com plano Familia convida outra conta, o membro aceita dentro da app e passa a ter acesso premium enquanto a subscricao do owner continuar ativa.

#### Importancia

Partilha familiar mexe em ownership, autorizacao, ciclo de vida de dados e acesso premium. Precisa de modelo proprio e nao pode ser simulada apenas por texto de UI.

#### Scope-in

- Criar colecao `subscription_family_memberships`.
- Implementar convites, aceitar, recusar, remover e sair.
- Bloquear multiplas familias ativas por membro.
- Bloquear aceitacao por utilizador com subscricao paga ativa.
- Integrar familia em `hasActiveSubscriptionAccess`.

#### Scope-out

- Envio real de email, links publicos de convite e perfis infantis.

#### Estado antes e depois

- Estado antes: acesso premium depende apenas da subscricao propria.
- Estado depois: acesso efetivo pode vir de subscricao propria ou membership familiar ativa.

#### Pre-requisitos

- Rever `BK-MF2-01`, `BK-MF9-01`, `RF62`, `RNF13`, `RNF15`, `RNF16` e `RNF19`.

#### Glossario

- Owner: utilizador que paga o plano Familia.
- Member: conta convidada que usa a partilha.
- Membership: relacao persistida entre owner e member.

#### Conceitos teoricos essenciais

Autorizacao familiar exige validar os dois lados: o membro deve ter convite valido e o owner deve continuar com plano Familia ativo.

#### Arquitetura do BK

- Endpoint(s): `/api/subscriptions/family/*`.
- Modelo/schema: `subscription_family_memberships`.
- Service(s): `subscriptions.service.js`.
- Controller/route: `subscriptions.controller.js`, `subscriptions.routes.js`.
- Guard/middleware: `requireAuth`, `requireActiveSubscription`.
- Cliente API: `subscriptionsApi`.
- Pagina/componente: preparada para `BK-MF9-04`.
- Testes: convites, aceitar, remover, bloqueios.
- Handoff para o proximo BK: UI de familia.

#### Ficheiros a criar/editar/rever

- EDITAR: `real_dev/backend/src/modules/subscriptions/subscriptions.service.js`
- EDITAR: `real_dev/backend/src/modules/subscriptions/subscriptions.routes.js`
- TESTAR: `real_dev/backend/tests/unit/mf9-subscriptions.test.js`

#### Tutorial tecnico linear

### Passo 1 - Criar modelo de membership

1. Criar indices por owner, member e status.
2. Persistir `pending`, `active`, `declined`, `removed` e `left`.
3. Guardar timestamps de convite e aceitacao.

```js
// Sem codigo neste guia generico; a colecao deve ser criada pelo seed de indices.
```

### Passo 2 - Resolver acesso efetivo

1. Testar primeiro subscricao propria.
2. Se nao houver acesso proprio, procurar membership ativa.
3. Confirmar que o owner tem Familia ativo antes de permitir playback.

```js
// Sem codigo neste guia generico; o middleware deve usar acesso efetivo.
```

#### Criterios de aceite

- Owner Pro/trial nao consegue convidar.
- Owner Familia convida conta existente.
- Membro aceita e ganha acesso premium.
- Remocao, saida, expiracao ou downgrade do owner bloqueiam acesso.

#### Validacao final

- `npm --prefix real_dev/backend test`
- Negativos: email inexistente, convidar a propria conta, membro pago, duplicado, owner sem Familia.

#### Evidence para PR/defesa

- `pr`: commit ou PR da MF9.
- `proof`: fluxo convite -> aceitar -> playback permitido.
- `neg`: owner Pro e membro duplicado.
- `fonte`: `RF62`, `RNF13`, `RNF15`, `RNF16`, `RNF19`.

#### Handoff

Entrega API e estado familiar para a UI do `BK-MF9-04`.

#### Changelog

- `2026-06-30`: guia generico criado para MF9.
