# BK-MF9-05 - Privacidade, operacao e metricas com familia

## Header

- `doc_id`: `GUIA-BK-MF9-05`
- `bk_id`: `BK-MF9-05`
- `macro`: `MF9`
- `owner`: `Davi`
- `apoio`: `Kaue`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF9-03,BK-MF9-04`
- `rf_rnf`: `RF55, RF56, RF59, RF62, RNF17, RNF19, RNF30`
- `fase_documental`: `Fase 3`
- `sprint`: `S13`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF9-06`
- `guia_path`: `docs/planificacao/guias-bk/MF9/BK-MF9-05-privacidade-operacao-metricas-familia.md`
- `last_updated`: `2026-06-30`

#### Objetivo

Este BK fecha o impacto operacional da familia: exportacao RGPD inclui memberships, eliminacao de conta invalida partilhas e metricas admin contam familia sem expor dados pessoais.

#### Importancia

Partilha familiar cria dados pessoais novos. Esses dados precisam de entrar no ciclo de privacidade e observabilidade da aplicacao.

#### Scope-in

- Exportar memberships por owner ou membro.
- Invalidar memberships quando uma conta e eliminada.
- Contar memberships ativas e convites pendentes em metricas agregadas.
- Garantir que membros familiares nao contam como subscricoes pagas na pool.

#### Scope-out

- Relatorios financeiros legais, auditoria externa e retencao avancada.

#### Estado antes e depois

- Estado antes: RGPD e metricas desconhecem familia.
- Estado depois: dados familiares entram na exportacao, limpeza e metricas agregadas.

#### Pre-requisitos

- Rever `BK-MF5-01`, `BK-MF5-02`, `BK-MF5-05`, `BK-MF9-03`, `BK-MF9-04`.

#### Glossario

- Dados familiares: owner, membro, email convidado, estado e timestamps da membership.
- Metrica agregada: contagem sem dados pessoais.

#### Conceitos teoricos essenciais

RGPD exige que dados pessoais criados por uma funcionalidade sejam exportaveis e tratados na eliminacao de conta. A metricas devem contar sem identificar pessoas.

#### Arquitetura do BK

- Endpoint(s): `/api/privacy/export`, `/api/privacy/me`, `/api/admin/metrics`.
- Modelo/schema: `subscription_family_memberships`.
- Service(s): `privacy.service.js`, `admin-metrics.service.js`.
- Controller/route: rotas existentes.
- Guard/middleware: auth e role admin.
- Cliente API: existente.
- Pagina/componente: Account/admin existentes.
- Testes: exportacao, eliminacao, metricas.
- Handoff para o proximo BK: gate MF9.

#### Ficheiros a criar/editar/rever

- EDITAR: `real_dev/backend/src/modules/privacy/privacy.service.js`
- EDITAR: `real_dev/backend/src/modules/admin-metrics/admin-metrics.service.js`
- TESTAR: `real_dev/backend/tests/unit/mf9-subscriptions.test.js`

#### Tutorial tecnico linear

### Passo 1 - Integrar familia no RGPD

1. Exportar memberships onde o utilizador e owner ou membro.
2. Inativar memberships em eliminacao de conta.
3. Nao apagar historico financeiro agregado.

```js
// Sem codigo neste guia generico; filtrar sempre por ownerUserId/memberUserId.
```

### Passo 2 - Integrar metricas

1. Contar membros familiares ativos.
2. Contar convites pendentes.
3. Nao expor emails nem nomes.

```js
// Sem codigo neste guia generico; metricas devem ser agregadas.
```

#### Criterios de aceite

- Exportacao mostra memberships do utilizador autenticado.
- Eliminacao invalida convites e memberships ativas.
- Metricas admin incluem contagens familiares agregadas.
- Pool solidaria continua baseada em subscricoes pagas do owner.

#### Validacao final

- `npm --prefix real_dev/backend test`
- Negativos: exportar outro utilizador, eliminar conta sem confirmacao, user comum em metricas admin.

#### Evidence para PR/defesa

- `pr`: commit ou PR da MF9.
- `proof`: exportacao RGPD com `subscription_family_memberships`.
- `neg`: tentativa sem confirmacao.
- `fonte`: `RF55`, `RF56`, `RF59`, `RF62`, `RNF17`, `RNF19`, `RNF30`.

#### Handoff

Entrega condicoes para regressao final no `BK-MF9-06`.

#### Changelog

- `2026-06-30`: guia generico criado para MF9.
