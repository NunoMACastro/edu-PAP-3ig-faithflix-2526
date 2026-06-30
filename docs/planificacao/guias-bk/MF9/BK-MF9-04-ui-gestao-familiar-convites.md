# BK-MF9-04 - UI de gestao familiar e convites

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
- `last_updated`: `2026-06-30`

#### Objetivo

Este BK torna a partilha familiar utilizavel no frontend real. A pagina de subscricao mostra o estado familiar, permite convidar por email, aceitar/recusar convites, remover membros e sair da familia.

#### Importancia

Depois de existir API real, o utilizador precisa de gerir a familia sem recorrer a scripts ou dados manuais.

#### Scope-in

- Atualizar `subscriptionsApi`.
- Atualizar `SubscriptionPage`.
- Mostrar lugares usados, convites pendentes e membership ativa.
- Tratar erros de API com mensagens PT-PT.

#### Scope-out

- Design de landing page, email real e painel admin de familias.

#### Estado antes e depois

- Estado antes: pagina de subscricao mostra apenas planos, trial e cancelamento.
- Estado depois: pagina gere familia end-to-end.

#### Pre-requisitos

- Rever `BK-MF9-03`, `RF62`, `RNF01`, `RNF05`, `RNF38` e `RNF40`.

#### Glossario

- Convite pendente: membership criada e ainda nao aceite.
- Lugar familiar: capacidade ocupada pelo owner ou membro.

#### Conceitos teoricos essenciais

A UI deve refletir o estado vindo do backend. Nao deve decidir se um utilizador pode convidar ou aceitar; deve chamar a API e apresentar o resultado.

#### Arquitetura do BK

- Endpoint(s): rotas `/api/subscriptions/family`.
- Modelo/schema: memberships familiares.
- Service(s): API client frontend.
- Controller/route: backend ja preparado.
- Guard/middleware: sessao obrigatoria.
- Cliente API: `subscriptionsApi`.
- Pagina/componente: `SubscriptionPage`.
- Testes: build frontend e E2E MF9.
- Handoff para o proximo BK: RGPD/metrica operacional.

#### Ficheiros a criar/editar/rever

- EDITAR: `real_dev/frontend/src/services/api/subscriptionsApi.js`
- EDITAR: `real_dev/frontend/src/pages/SubscriptionPage.jsx`
- TESTAR: `tests/e2e/mf9-family-subscription.spec.js`

#### Tutorial tecnico linear

### Passo 1 - Ligar API familiar no frontend

1. Criar metodos para listar, convidar, aceitar, recusar, remover e sair.
2. Reutilizar `apiClient` com cookies.
3. Nao guardar tokens no browser.

```js
// Sem codigo neste guia generico; reutilizar o cliente API central.
```

### Passo 2 - Criar UI de gestao familiar

1. Mostrar estado do owner e do membro.
2. Criar formulario de convite por email.
3. Atualizar estado apos cada acao.

```jsx
// Sem codigo neste guia generico; a pagina deve recarregar estado canonico apos mutacoes.
```

#### Criterios de aceite

- Owner Familia consegue convidar e remover membros.
- Membro ve convite pendente e consegue aceitar/recusar.
- Membro ativo consegue sair.
- Interface usa PT-PT e datas/formato europeu.

#### Validacao final

- `npm --prefix real_dev/frontend run build`
- E2E MF9 com owner e membro.
- Negativos: owner sem Familia, email invalido, convite duplicado.

#### Evidence para PR/defesa

- `pr`: commit ou PR da MF9.
- `proof`: captura ou log do fluxo UI.
- `neg`: erro de convite invalido.
- `fonte`: `RF62`, `RNF01`, `RNF05`, `RNF38`, `RNF40`.

#### Handoff

Entrega fluxo UI para validacao de privacidade e metricas no `BK-MF9-05`.

#### Changelog

- `2026-06-30`: guia generico criado para MF9.
