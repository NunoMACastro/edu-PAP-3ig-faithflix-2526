# BK-MF3-06 - Explicabilidade de recomendacao

## Header

- `doc_id`: `GUIA-BK-MF3-06`
- `bk_id`: `BK-MF3-06`
- `macro`: `MF3`
- `owner`: `Mateus`
- `apoio`: `Davi`
- `prioridade`: `P2`
- `estado`: `DONE`
- `esforco`: `S`
- `dependencias`: `BK-MF3-05`
- `rf_rnf`: `RF28, RNF34`
- `fase_documental`: `Fase 2`
- `sprint`: `S06`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF4-01`
- `guia_path`: `docs/planificacao/guias-bk/MF3/BK-MF3-06-explicabilidade-de-recomendacao.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais acrescentar explicabilidade a recomendacao baseline (`RF28`, `RNF34`).

No fim, deves conseguir explicar ao utilizador porque um grupo foi sugerido, sem revelar dados pessoais detalhados, sem prometer inteligencia avancada e sem esconder que a recomendacao e feita por regras simples.

#### Importância

Uma recomendacao sem explicacao pode parecer arbitraria. A explicabilidade aumenta confianca, ajuda o aluno a defender a solucao e cumpre o contrato de recomendacao etica do MVP.

#### Scope-in

- Criar mapa de explicacoes para `reasonCode`.
- Acrescentar `explanation` aos grupos de `GET /api/recommendations/me`.
- Mostrar "Porque recomendamos" na pagina `/para-si`.
- Explicar cold start de forma honesta.
- Garantir que a explicacao nao revela IDs internos nem historico detalhado.

#### Scope-out

- Novo algoritmo de recomendacao.
- Dashboard admin de ajustes.
- Explicacoes por modelo generativo.
- Exportacao de dados pessoais.
- Alteracao dos sinais permitidos.
- Expor pesos internos, scores por utilizador ou historico detalhado na UI.

#### Estado antes e depois

- Estado antes: aplicam-se os BKs declarados em `dependencias`, os RF/RNF do Header e os artefactos já entregues pelas fases anteriores.
- Estado depois: ficam implementáveis e verificáveis apenas os resultados listados em `Scope-in`, sem antecipar o `Scope-out`.

#### Pré-requisitos

- `BK-MF3-05` concluido.
- `GET /api/recommendations/me` devolve `groups` com `reasonCode`.
- Frontend `/para-si` apresenta grupos.
- A equipa confirma que recomendacao continua baseline.

#### Glossário

- `Explicabilidade`: capacidade de explicar uma sugestao de forma simples.
- `reasonCode`: codigo interno usado para escolher a mensagem.
- `Sinal agregado`: indicacao geral, como "temas vistos", sem listar todo o historico.
- `Privacidade`: proteger detalhes pessoais que nao precisam de aparecer na UI.

#### Conceitos teóricos essenciais

- `CANONICO`: `RF28` pede explicabilidade.
- `CANONICO`: `RNF34` pede explicacao simples para grupos sugeridos.
- `CANONICO`: `RNF37` impede usar dados de recomendacao para outro fim.
- `DERIVADO`: a explicacao fica ao nivel do grupo, porque o BK anterior devolve grupos.
- `DERIVADO`: `reasonCode` desconhecido recebe uma mensagem neutra, para evitar quebrar a UI.
- `DERIVADO`: feedback `not_interested` altera exclusões, mas a explicação
  pública continua agregada por grupo e não revela essa escolha.

### Tempo estimado

- Rever `BK-MF3-05`: 15 min.
- Backend de explicacoes: 35 min.
- Frontend de explicacoes: 35 min.
- Validacao e evidence: 25 min.

### Erros comuns

- Mostrar IDs internos do historico.
- Dizer que a sugestao foi feita por um modelo avancado.
- Criar outro endpoint de recomendacao.
- Repetir explicacoes vazias ou tecnicas demais.

### Check de compreensao

- [ ] Sei explicar a diferenca entre recomendacao e explicabilidade.
- [ ] Sei porque a explicacao nao deve revelar historico detalhado.
- [ ] Sei testar cold start e `reasonCode` desconhecido.

#### Arquitetura do BK

| Area | Contrato |
| --- | --- |
| Endpoint mantido | `GET /api/recommendations/me` |
| Novo campo por grupo | `explanation` |
| Explicacao | mensagem simples em portugues de Portugal |
| Privacidade | sem IDs internos, sem lista detalhada de historico |
| Frontend | `RecommendationExplanation`, `ForYouPage` atualizado com feedback explicito |
| Handoff | `BK-MF4-01` pode iniciar monetizacao sem alterar descoberta |

### Formato final do grupo

Schema conceptual de um grupo. Os identificadores representam campos do DTO;
este bloco não é JavaScript copiável nem output de uma execução.

```text
// A explicação usa categorias editoriais e não revela eventos individuais do utilizador.
{
  id,
  title,
  reasonCode,
  explanation: {
    title,
    message,
    signals,
    confidence
  },
  items
}
```

#### Ficheiros a criar/editar/rever

- CRIAR: `backend/src/modules/recommendations/recommendation-explanations.js`
- EDITAR: `backend/src/modules/recommendations/recommendations.service.js`
- CRIAR: `frontend/src/components/recommendations/RecommendationExplanation.jsx`
- EDITAR: `frontend/src/pages/ForYouPage.jsx`

#### Tutorial técnico linear

### Passo 1 - Criar mapa de explicacoes

1. Objetivo do passo.

Traduzir `reasonCode` tecnico para uma explicacao clara.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/recommendations/recommendation-explanations.js`
    - CRIAR: `backend/tests/unit/mf3-recommendation-explanations.test.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Cria o ficheiro abaixo no modulo `recommendations`.

4. Codigo completo.

```js
// O mapa fechado mantém mensagens previsíveis e auditáveis para cada reasonCode.
export const RECOMMENDATION_REASON_CODES = Object.freeze([
  "themes-from-user-signals",
  "activity-types",
  "popular-fallback",
  "cold-start-popular",
  "cold-start-recent",
  "cold-start-catalog",
]);

const EXPLANATIONS = {
  "themes-from-user-signals": {
    title: "Porque recomendamos",
    message: "Este grupo usa temas associados aos teus favoritos, historico, watchlist ou ratings positivos.",
    signals: ["temas", "atividade"],
    confidence: "baseline",
  },
  "activity-types": {
    title: "Porque recomendamos",
    message: "Este grupo usa tipos de conteudo que aparecem na tua atividade recente.",
    signals: ["tipo de conteudo", "atividade"],
    confidence: "baseline",
  },
  "popular-fallback": {
    title: "Porque recomendamos",
    message: "Este grupo completa as sugestoes com conteudos publicados bem avaliados.",
    signals: ["ratings agregados", "catalogo publicado"],
    confidence: "baseline",
  },
  "cold-start-popular": {
    title: "Porque recomendamos",
    message: "Como ainda ha poucos sinais teus, este grupo mostra conteudos populares do catalogo.",
    signals: ["ratings agregados", "catalogo publicado"],
    confidence: "cold-start",
  },
  "cold-start-recent": {
    title: "Porque recomendamos",
    message: "Como ainda ha poucos sinais teus, este grupo mostra conteudos adicionados recentemente.",
    signals: ["catalogo publicado"],
    confidence: "cold-start",
  },
  "cold-start-catalog": {
    title: "Porque recomendamos",
    message: "Como ainda ha poucos sinais teus, este grupo mostra uma selecao geral do catalogo.",
    signals: ["catalogo publicado"],
    confidence: "cold-start",
  },
};

export function buildRecommendationExplanation(reasonCode) {
  // O fallback cobre apenas um código realmente desconhecido; os seis códigos
  // produzidos pela baseline têm entradas explícitas e são testados abaixo.
  return EXPLANATIONS[reasonCode] ?? {
    title: "Porque recomendamos",
    message: "Este grupo foi gerado por regras simples da recomendacao baseline.",
    signals: ["catalogo publicado"],
    confidence: "baseline",
  };
}
```

`backend/tests/unit/mf3-recommendation-explanations.test.js`

```js
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildRecommendationExplanation,
  RECOMMENDATION_REASON_CODES,
} from "../../src/modules/recommendations/recommendation-explanations.js";

const EXPECTED_MESSAGES = {
  // O texto esperado distingue cada regra realmente emitida pelo service.
  "themes-from-user-signals": /temas associados/i,
  "activity-types": /tipos de conteudo/i,
  "popular-fallback": /bem avaliados/i,
  "cold-start-popular": /conteudos populares/i,
  "cold-start-recent": /adicionados recentemente/i,
  "cold-start-catalog": /selecao geral/i,
};

for (const reasonCode of RECOMMENDATION_REASON_CODES) {
  test(`MF3 explica ${reasonCode}`, () => {
    const explanation = buildRecommendationExplanation(reasonCode);
    // Cada código produzido tem label e mensagem próprios; não usa fallback.
    assert.equal(explanation.title, "Porque recomendamos");
    assert.match(explanation.message, EXPECTED_MESSAGES[reasonCode]);
  });
}

test("MF3 usa fallback apenas para reasonCode desconhecido", () => {
  // Este caso futuro não substitui a cobertura explícita dos seis códigos.
  const explanation = buildRecommendationExplanation("future-unknown-code");
  assert.match(explanation.message, /regras simples/i);
});
```

5. Explicacao do codigo ou da decisao.

O mapa usa mensagens fechadas e auditaveis para os seis `reasonCode` realmente
produzidos pelo `BK-MF3-05`. A app nao inventa uma explicacao nova em runtime;
escolhe uma explicacao aprovada para cada regra. O fallback não mascara um
código da baseline em falta: os testes falham se um dos seis deixar de ter
label/mensagem próprios.

6. Validacao do passo.

```bash
node -e "import('./src/modules/recommendations/recommendation-explanations.js').then(({ buildRecommendationExplanation }) => console.log(buildRecommendationExplanation('cold-start-popular').confidence))"
node --test tests/unit/mf3-recommendation-explanations.test.js
```

Resultado esperado: `cold-start`.

7. Caso negativo, erro comum ou risco que este passo evita.

Sem fallback para `reasonCode` desconhecido, uma alteracao futura pode deixar a UI sem explicacao.

### Passo 2 - Acrescentar explicacao ao service

1. Objetivo do passo.

Atualizar o service do `BK-MF3-05` para devolver `explanation` em cada grupo.

2. Ficheiros envolvidos.
    - EDITAR: `backend/src/modules/recommendations/recommendations.service.js`
    - LOCALIZACAO: import e funcao `group`

3. Instrucoes concretas.

Adiciona o import e substitui a funcao `group` pela versao abaixo.

4. Codigo completo.

```js
import { buildRecommendationExplanation } from "./recommendation-explanations.js";

function group(id, title, reasonCode, items) {
  // A explicação é derivada do reasonCode controlado pelo servidor, não de texto livre.
  return {
    id,
    title,
    reasonCode,
    explanation: buildRecommendationExplanation(reasonCode),
    items: items.map(publicCard),
  };
}
```

5. Explicacao do codigo ou da decisao.

O algoritmo nao muda. Apenas acrescentamos uma explicacao ao contrato de resposta. Isto evita reescrever recomendacao no BK errado.

6. Validacao do passo.

```bash
curl -i http://localhost:3000/api/recommendations/me
```

Resultado esperado com sessao: cada grupo contem `explanation.title`, `explanation.message`, `signals` e `confidence`.

7. Caso negativo, erro comum ou risco que este passo evita.

Criar outro endpoint, como `/api/recommendations/explain`, dividiria a fonte de verdade e podia deixar recomendacoes e explicacoes desalinhadas.

### Passo 3 - Criar componente de explicacao

1. Objetivo do passo.

Mostrar a explicacao ao utilizador de forma curta e clara.

2. Ficheiros envolvidos.
    - CRIAR: `frontend/src/components/recommendations/RecommendationExplanation.jsx`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Cria o componente abaixo.

4. Codigo completo.

```jsx
export function RecommendationExplanation({ explanation }) {
  // Sem contrato de explicação válido não se apresenta uma caixa vazia.
  if (!explanation) return null;

  return (
    <aside className="recommendation-explanation">
      <h3>{explanation.title}</h3>
      <p>{explanation.message}</p>
      <ul aria-label="Sinais usados">
        {explanation.signals.map((signal) => (
          <li key={signal}>{signal}</li>
        ))}
      </ul>
    </aside>
  );
}
```

5. Explicacao do codigo ou da decisao.

O componente mostra sinais agregados, como "catalogo publicado", mas nao mostra IDs, listas completas ou historico detalhado.

6. Validacao do passo.

```bash
npm --prefix frontend run build
```

Resultado esperado: build sem erros.

7. Caso negativo, erro comum ou risco que este passo evita.

Mostrar dados detalhados do historico dentro da explicacao seria excesso de exposicao de dados pessoais.

### Passo 4 - Atualizar pagina `/para-si`

1. Objetivo do passo.

Integrar explicabilidade nos grupos existentes.

2. Ficheiros envolvidos.
    - EDITAR: `frontend/src/pages/ForYouPage.jsx`
    - LOCALIZACAO: imports e componente `RecommendationGroup`

3. Instrucoes concretas.

Importa `RecommendationExplanation` e coloca-o dentro de cada grupo, antes da lista de cards.

4. Codigo completo.

Trecho final esperado:

```jsx
import { Link } from "react-router-dom";
import { RecommendationExplanation } from "../components/recommendations/RecommendationExplanation.jsx";

function RecommendationGroup({ group }) {
  // Não cria uma secção sem candidatos, reduzindo ruído para tecnologias de apoio.
  if (group.items.length === 0) return null;

  return (
    <section className="recommendation-group" aria-label={group.title}>
      <h2>{group.title}</h2>
      {/* A justificação aparece antes dos cards para contextualizar a lista. */}
      <RecommendationExplanation explanation={group.explanation} />
      <ul className="content-grid">
        {group.items.map((item) => (
          <li key={item.id}>
            <article className="content-card">
              {item.posterUrl && <img src={item.posterUrl} alt="" />}
              <h3>{item.title}</h3>
              <p>{item.type}</p>
              <Link to={`/catalogo/${item.slug}`}>Ver detalhe</Link>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

5. Explicacao do codigo ou da decisao.

A explicacao fica junto do grupo que explica. O utilizador nao precisa procurar uma pagina separada para perceber a sugestao.

6. Validacao do passo.

Abre `/para-si` com sessao iniciada e confirma que cada grupo visivel mostra "Porque recomendamos".

7. Caso negativo, erro comum ou risco que este passo evita.

Se a explicacao ficar fora do grupo, o utilizador pode nao perceber a que sugestao ela pertence.

#### Critérios de aceite

- `GET /api/recommendations/me` devolve `explanation` em todos os grupos.
- Os seis códigos da baseline (`themes-from-user-signals`, `activity-types`,
  `popular-fallback`, `cold-start-popular`, `cold-start-recent` e
  `cold-start-catalog`) têm label/mensagem explícitos e um teste dedicado.
- Cada `explanation` contem `title`, `message`, `signals` e `confidence`.
- Cold start mostra mensagem clara de poucos sinais.
- A UI `/para-si` mostra "Porque recomendamos" por grupo visivel.
- A explicacao nao contem `userId`, `contentId` de historico, emails ou tokens.
- A UI pode mostrar feedback operacional, mas nao mostra score interno nem pesos individuais.
- Apenas um `reasonCode` realmente desconhecido recebe mensagem fallback; não
  há promessa de scoring ponderado, embeddings ou similaridade semântica.

#### Validação final

```bash
npm --prefix backend test
npm --prefix frontend run build
curl -i http://localhost:3000/api/recommendations/me
```

Resultado esperado: build e testes passam; resposta autenticada inclui `explanation`.

#### Evidence para PR/defesa

- `pr`: referencia do PR/commit com explicabilidade.
- `proof`: resposta JSON com `explanation`.
- `proof`: captura de `/para-si` com "Porque recomendamos".
- `neg`: `reasonCode` desconhecido tem fallback, sem dados pessoais expostos.

#### Handoff

A `MF3` fica fechada com ratings, comentarios, pesquisa, filtros, discovery, recomendacao baseline e explicabilidade. O `BK-MF4-01` pode iniciar monetizacao solidaria sem alterar os contratos de descoberta.

## Snippet tecnico aplicavel

O código aplicável está nos passos 1 a 4. O recorte seguinte identifica a
propriedade a integrar no DTO já construído; não é uma expressão autónoma nem
deve ser copiado isoladamente:

```text
explanation: buildRecommendationExplanation(reasonCode),
```

Este trecho liga cada regra baseline a uma mensagem compreensivel.

#### Changelog

- `2026-04-13`: retrofit para contrato pedagogico v3.
- `2026-06-07`: guia reescrito com explicabilidade, privacidade, frontend e validacao mensuravel.
