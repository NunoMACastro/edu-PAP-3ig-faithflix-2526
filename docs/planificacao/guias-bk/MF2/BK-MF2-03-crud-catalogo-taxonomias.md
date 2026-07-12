# BK-MF2-03 - CRUD de catalogo e taxonomias

## Header

- `doc_id`: `GUIA-BK-MF2-03`
- `bk_id`: `BK-MF2-03`
- `macro`: `MF2`
- `owner`: `Davi`
- `apoio`: `Matheus`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `L`
- `dependencias`: `BK-MF2-02`
- `rf_rnf`: `RF06, RF07, RF09, RF10`
- `fase_documental`: `Fase 1`
- `sprint`: `S03`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF2-04`
- `guia_path`: `docs/planificacao/guias-bk/MF2/BK-MF2-03-crud-catalogo-taxonomias.md`
- `last_updated`: `2026-07-12`

#### Objetivo

Neste BK vais criar o catalogo base da FaithFlix: conteudos, taxonomias, estados de publicacao e revisoes. A entrega cobre `RF06`, `RF07`, `RF09` e `RF10`.

No fim, deves conseguir explicar como um conteudo passa de `draft` para `published`, porque utilizadores comuns so veem conteudo publicado e como uma revisao preserva o estado anterior antes de uma alteracao relevante.

#### Importância

O catalogo e o contrato central da experiencia de streaming. A página de detalhe, favoritos, watchlist, histórico, pesquisa e recomendações dependem dos metadados públicos; as fontes de media pertencem ao documento editorial interno e ao endpoint autenticado de playback.

#### Scope-in

- Criar colecoes `contents`, `taxonomies` e `content_revisions`.
- Criar validação para tipos, estados, metadados, assets editoriais e taxonomias.
- Listar apenas conteudos publicados no catalogo publico.
- Construir o DTO público por allowlist explícita; não copiar `media`, `source`,
  `url`, `tracks`, `qualityOptions`, `playbackUrl` ou `src`.
- Expor apenas `mediaStatus` e `isPlayable` como disponibilidade de reprodução.
- Permitir criar, editar, publicar e arquivar conteúdos a `admin` e `moderator`, sem upload nem edição de media nesta fase.
- Criar sempre com media vazia e `mediaStatus: "pending"`; no admin, `mediaStatus` é apenas informativo.
- Rejeitar campos de media em `PATCH /api/catalog/:id` com `400 CATALOG_MEDIA_MUTATION_FORBIDDEN`, preservando a media já persistida.
- Paginar catálogo admin e revisões com `{ items, page, limit, total, totalPages }`, `limit <= 50` e desempate estável por `_id`.
- Iniciar cada conteúdo com `version: 1` e exigir `expectedVersion` nas mutações de edição, estado e reversão.
- Guardar revisão, mutação e audit log na mesma transação, sem estados parciais.
- Tratar a repetição do mesmo estado, incluindo `published`, como operação idempotente.
- Criar taxonomias reutilizaveis.
- Validar `taxonomyIds` contra taxonomias existentes.
- Listar historico de revisoes e permitir reverter conteudo a uma revisao anterior.
- Criar cliente frontend de catalogo e uma pagina admin minima.

#### Scope-out

- Pesquisa full-text avancada.
- Recomendacoes personalizadas.
- Upload real de ficheiros de video.
- Series com temporadas e episodios encadeados.
- Workflow editorial com aprovacao multipla.

#### Estado antes e depois

- Antes: não existe contrato editorial persistente e as páginas não têm uma
  fonte segura de metadados publicados.
- Depois: catálogo, taxonomias, revisões e administração metadata-only usam
  DTOs por allowlist, concorrência otimista e transações.

#### Pré-requisitos

- `BK-MF2-02` concluído.
- A cadeia anterior entregou backend modular, autenticação e roles.
- MongoDB transacional configurado.
- `requireRole(["admin", "moderator"])` disponível.
- Frontend preparado para chamar a API com cookie.

#### Glossário

- `Content`: item reproduzivel ou apresentavel no catalogo.
- `Taxonomy`: classificacao reutilizavel para organizar conteudos.
- `draft`: conteudo ainda nao visivel ao publico.
- `published`: conteudo visivel no catalogo publico.
- `archived`: conteudo removido da experiencia publica sem apagar historico.
- `Revision`: registo do estado anterior antes de uma alteracao.
- `version`: número inteiro que identifica a versão editorial atual.
- `expectedVersion`: versão que o cliente leu e envia para impedir que uma edição concorrente seja perdida.
- `CAS` (`compare-and-swap`): escrita que só acontece se a versão persistida continuar igual à esperada.

#### Conceitos teóricos essenciais

- O header canonico deste BK mantem a dependencia documental existente. Na sequencia de execucao da MF2, os BKs 01 e 02 ja entregam `req.user`, `requireAuth` e `requireRole`, que sao usados aqui.
- A listagem publica filtra sempre `status: "published"`.
- Criar ou alterar catalogo e uma acao protegida por role.
- O `slug` deve ser unico para permitir URLs estaveis.
- `media.playbackUrl` pode existir no documento interno por ingestão externa a este BK, mas o formulário editorial não o cria nem altera. O admin lê apenas `mediaStatus` como informação; o `BK-MF2-05` obtém a fonte pelo endpoint autenticado de playback.
- `RF10` fica demonstravel quando o admin consegue consultar revisoes e repor um snapshot anterior.
- A resposta administrativa inclui `version`; edição, mudança de estado e reversão exigem `expectedVersion`.
- Um cliente desatualizado recebe `409` com `code: "CONTENT_VERSION_CONFLICT"`, recarrega o conteúdo e não cria uma revisão órfã.
- Repetir `published` sobre conteúdo já publicado não cria revisão, não incrementa `version` e não altera `publishedAt`.

##### Catálogo público paginado e cancelável

- `GET /api/catalog` recebe `type`, `page` e `limit`; o limite público máximo é
  24 e a resposta é `{ items, page, limit, total }`.
- `catalogApi.listPublished(params, { signal })` propaga o `AbortSignal`. A
  página aborta o pedido quando muda filtro/página ou é desmontada e a flag
  anti-stale impede uma resposta antiga de substituir a vista atual.
- Uma falha do catálogo mostra uma mensagem segura e `Tentar novamente`,
  repetindo exatamente a página e o filtro atuais.
- A discovery editorial é uma leitura independente: também é cancelada no
  unmount e uma falha sua não apaga nem bloqueia a listagem principal.
- Slug ou ID vindo da API é codificado com `encodeURIComponent` ao construir
  `/catalogo/:idOrSlug`; um valor com `/`, espaços ou `?` não pode alterar a
  estrutura da rota.

O Passo 6 implementa diretamente este contrato; não existe uma versão alternativa
ou simplificada do cliente público.

##### Tempo estimado

- Rever contratos e campos do catalogo: 25 min.
- Backend de conteudos: 90 min.
- Backend de taxonomias: 45 min.
- Frontend publico e admin minimo: 70 min.
- Validacao, negativos e evidence: 45 min.

##### Erros comuns

- Mostrar `draft` no catalogo publico.
- Aceitar estados fora de `draft`, `published`, `archived`.
- Deixar um utilizador comum criar conteudos.
- Criar um campo diferente para URL de reproducao.
- Editar conteudo sem guardar revisao.
- Ler e escrever em operações separadas sem `runInTransaction`.
- Aceitar uma mutação sem `expectedVersion` ou sobrescrever uma edição concorrente.
- Atualizar novamente `publishedAt` quando o mesmo pedido de publicação é repetido.
- Enviar `media`, `mediaStatus`, `tracks`, `qualityOptions`, `playbackUrl` ou `src` numa edição editorial.
- Carregar catálogo admin ou revisões completos sem `page`/`limit`.

##### Check de compreensão

- [ ] Sei listar os campos obrigatorios de `Content`.
- [ ] Sei explicar a diferenca entre `draft`, `published` e `archived`.
- [ ] Sei porque `admin` e `moderator` podem gerir catalogo.
- [ ] Sei explicar como `version`/`expectedVersion` impedem lost updates.
- [ ] Sei porque revisão, mutação e audit log têm de fazer commit ou rollback em conjunto.
- [ ] Sei que o detalhe do `BK-MF2-04` usa este mesmo modelo.

#### Arquitetura do BK

| Area | Contrato |
| --- | --- |
| Colecoes | `contents`, `taxonomies`, `content_revisions` |
| Estados | `draft`, `published`, `archived` |
| Tipos | `movie`, `series`, `episode`, `documentary` |
| Catalogo publico | `GET /api/catalog?type=movie&page=1&limit=24`; apenas `published`; `{ items, page, limit, total }` |
| Limite público de media | allowlist de metadata/assets/disponibilidade; sem `media`, `source`, `url`, `tracks`, `qualityOptions`, `playbackUrl` ou `src` |
| Admin catalogo | `POST /api/catalog`, `PATCH /api/catalog/:id`, `PATCH /api/catalog/:id/status` |
| Fronteira editorial/media | create força media vazia/`pending`; update aceita apenas metadata/assets/taxonomias; `mediaStatus` é read-only no admin |
| Mutação media recusada | `400 { code: "CATALOG_MEDIA_MUTATION_FORBIDDEN", details: { field } }` |
| Paginação admin/revisões | `{ items, page, limit, total, totalPages }`; default `20`, máximo `50`, sort temporal com `_id` como desempate |
| Concorrencia admin | respostas incluem `version`; editar/estado/reverter exigem `expectedVersion` numérico |
| Conflito | `409 { code: "CONTENT_VERSION_CONFLICT", ... }`; zero escrita/revisão/audit parcial |
| Taxonomias | `GET /api/catalog/taxonomies`, `POST /api/catalog/taxonomies` |
| Robustez pública | abort/anti-stale, retry da página/filtro e slug/ID codificado no link de detalhe |
| Revisoes | `GET /api/catalog/:id/revisions`, `POST /api/catalog/:id/revisions/:revisionId/revert` |
| Publicacao repetida | no-op idempotente: preserva `version`, `publishedAt` e contagem de revisões |
| Guards | `admin` e `moderator` gerem catalogo; `user` consulta apenas publicado |
| UI final | `/admin/catalogo` é list-first; criação, edição e taxonomias usam `/novo`, `/:contentId/editar` e `/taxonomias` dentro de `AdminLayout` |
| Handoff | `BK-MF2-04` recebe metadados públicos, `mediaStatus` e `isPlayable`; não recebe fontes |

##### Modelo `Content` no storage interno

Este documento não é um DTO público nem administrativo. Fontes internas são
criadas por um fluxo de ingestão separado e nunca são copiadas pelas respostas
deste BK.

```js
const internalContentDocument = {
  _id,
  title,
  slug,
  synopsis,
  type,
  durationSeconds,
  ageRating,
  status,
  version,
  taxonomyIds,
  assets: {
    posterUrl,
    backdropUrl
  },
  // A fonte existe apenas no documento interno e nunca integra DTOs públicos ou administrativos.
  media: {
    playbackUrl
  },
  // O valor persistido pertence ao enum pending | ready | failed.
  mediaStatus: "pending",
  createdBy,
  updatedBy,
  publishedAt,
  createdAt,
  updatedAt
};
```

##### Decisões técnicas

- `CANONICO`: a base do catalogo usa MongoDB.
- `CANONICO`: conteudo publico e apenas `published`.
- `CANONICO`: catálogo e detalhe públicos nunca transportam fontes de reprodução.
- `DERIVADO`: `slug` unico permite rotas legiveis no frontend.
- `DERIVADO`: revisoes guardam snapshots para diagnosticar alteracoes.
- `CANONICO`: `version` começa em `1`; documentos legados sem esse campo são tratados como versão `1` apenas na primeira mutação CAS.
- `CANONICO`: revisão, mutação e audit log administrativo usam a mesma sessão de `runInTransaction`.
- `CANONICO`: o mesmo estado editorial repetido é idempotente; uma versão obsoleta continua a produzir conflito.
- `CANONICO`: a administração deste BK altera apenas metadados, assets e taxonomias; media é preservada em update/revert e o seu estado é apenas informativo.
- `CANONICO`: as listagens administrativas são paginadas, têm limite máximo de 50 e ordenação estável por `_id`.

##### Serializer público e disponibilidade

O documento MongoDB pode manter fontes criadas por um fluxo de ingestão separado;
a administração deste BK mostra apenas a disponibilidade e não as edita. Já
`GET /api/catalog` e `GET /api/catalog/:idOrSlug` usam um serializer público
por allowlist, que constrói um novo objeto apenas com metadata, assets e
disponibilidade. Não existe sanitização por denylist. Documentos sem
`mediaStatus` explícito são tratados como `pending` para falhar de forma segura.
`isPlayable` só é verdadeiro quando o estado é `ready` e existe pelo menos uma
fonte interna canónica. Catálogo e playback usam o mesmo helper: localização
root-relative ou HTTP(S) sem credenciais, protocolo `progressive|hls|dash`, MIME
compatível e qualidade fechada. Um alias textual com esquema ativo, URL
protocol-relative, protocolo/MIME incoerentes ou containers malformados nunca
ativa o CTA. Publicar metadados sem media pronta continua permitido.

##### Concorrência e transações

O endurecimento de concorrência acrescenta `version` às respostas administrativas.
`PATCH /api/catalog/:id`, `PATCH /api/catalog/:id/status` e
`POST /api/catalog/:id/revisions/:revisionId/revert` exigem a versão observada
em `expectedVersion`. A API não coage strings: o valor tem de ser um número JSON
inteiro positivo. Se outro editor já tiver alterado o conteúdo, a mutação devolve
`409` com `code: "CONTENT_VERSION_CONFLICT"`.

A revisão do estado anterior, a escrita CAS e o audit log administrativo fazem
parte da mesma transação. Falhar qualquer uma dessas escritas deixa o conteúdo,
as revisões e o audit log no estado anterior. Repetir a publicação de um conteúdo
que já está `published`, usando a versão atual, devolve o estado existente sem
nova revisão, sem incremento de versão e sem alterar `publishedAt`.

##### Administração metadata-only

O catálogo administrativo deixa de ser um editor de media. `POST /api/catalog`
aceita apenas dados editoriais e força `media.playbackUrl: ""`,
`mediaStatus: "pending"`, tracks vazias e zero opções de qualidade, mesmo que o
cliente envie esses campos. `PATCH /api/catalog/:id` aceita metadata, assets e
`taxonomyIds`; a presença de `media`, `mediaStatus`, `tracks`, `qualityOptions`,
`playbackUrl` ou `src` devolve `400` com
`code: "CATALOG_MEDIA_MUTATION_FORBIDDEN"` e `details.field`. Nenhuma revisão,
audit ou escrita parcial é criada. Update e reversão preservam a media existente.

`GET /api/catalog/admin` e `GET /api/catalog/:id/revisions` recebem `page` e
`limit`, com default 20 e máximo 50, e devolvem
`{ items, page, limit, total, totalPages }`. O sort usa o campo temporal
descendente e `_id: 1` como desempate estável. Estes ajustes não removem
`version`, `expectedVersion`, CAS, revisão transacional ou audit log da Fase 3.

#### Ficheiros a criar/editar/rever

- Criar/rever `backend/src/modules/catalog/` para validação, services,
  serializers, controllers e rotas.
- Criar índices, revisões e audit logs transacionais no backend.
- Criar `frontend/src/services/api/catalogApi.js` e páginas pública/admin.
- Editar a montagem Express e as rotas React.
- Criar testes backend para autorização, DTOs, paginação, CAS e rollback.

#### Tutorial técnico linear

### Passo 1 - Criar validacao de catalogo

1. Objetivo funcional do passo no contexto da app.

Garantir que conteudos entram no sistema com campos coerentes e estados controlados.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/catalog/catalog.validation.js`
    - CRIAR: `backend/tests/unit/mf2-catalog-body.validation.test.js`
    - LOCALIZACAO: ficheiro completo

3. Instruções do que fazer.

Cria o ficheiro abaixo. Usa `assertCatalogPayload` apenas na criação e
`assertCatalogUpdatePayload` na edição.

4. Código completo, correto e integrado com a app final.

```js
import { ObjectId } from "mongodb";

export const CONTENT_TYPES = ["movie", "series", "episode", "documentary"];
export const CONTENT_STATUS = ["draft", "published", "archived"];
// A allowlist bloqueia qualquer tentativa editorial de escrever fontes ou variantes de reprodução.
const CATALOG_MEDIA_MUTATION_FIELDS = [
  "media",
  "mediaStatus",
  "tracks",
  "qualityOptions",
  "source",
  "url",
  "playbackUrl",
  "src",
];

/**
 * Garante que um body JSON é um objeto simples antes de qualquer leitura.
 *
 * @param {unknown} input Valor recebido do parser JSON.
 * @returns {Record<string, unknown>} Objeto validado.
 */
export function assertJsonObjectBody(input) {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    const error = new Error("Body JSON tem de ser um objeto.");
    error.statusCode = 400;
    error.code = "INVALID_JSON_BODY";
    throw error;
  }

  return input;
}

// A versão é obrigatória e tipada para que conflitos concorrentes resultem em 409, não em overwrite.
export function assertExpectedVersion(value) {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 1) {
    const error = new Error("expectedVersion deve ser um inteiro positivo.");
    error.statusCode = 400;
    error.code = "EXPECTED_VERSION_REQUIRED";
    throw error;
  }

  return value;
}

function requiredText(value, field, min = 2, max = 160) {
  const text = typeof value === "string" ? value.trim() : "";

  if (text.length < min || text.length > max) {
    const error = new Error(`${field} invalido.`);
    error.statusCode = 400;
    throw error;
  }

  return text;
}

function positiveInteger(value, field) {
  if (!Number.isInteger(value) || value <= 0) {
    const error = new Error(`${field} deve ser um inteiro positivo.`);
    error.statusCode = 400;
    throw error;
  }

  return value;
}

function optionalText(value, max = 500) {
  if (value === undefined || value === null || value === "") return "";
  if (typeof value !== "string" || value.trim().length > max) {
    const error = new Error("Texto opcional invalido.");
    error.statusCode = 400;
    throw error;
  }
  return value.trim();
}

function ageRating(value) {
  if (!Number.isInteger(value) || value < 0 || value > 18) {
    const error = new Error("Classificacao etaria invalida.");
    error.statusCode = 400;
    throw error;
  }

  return value;
}

function taxonomyObjectIds(value) {
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    const error = new Error("Taxonomias invalidas.");
    error.statusCode = 400;
    throw error;
  }

  return value.map((id) => {
    if (!ObjectId.isValid(id)) {
      const error = new Error("Taxonomia invalida.");
      error.statusCode = 400;
      throw error;
    }

    return new ObjectId(id);
  });
}

export function slugify(value) {
  return (typeof value === "string" ? value : "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function assertCatalogEditorialPayload(input) {
  const body = assertJsonObjectBody(input);

  const title = requiredText(body.title, "title");
  const type = typeof body.type === "string" ? body.type.trim() : "";

  if (!CONTENT_TYPES.includes(type)) {
    const error = new Error("Tipo de conteudo invalido.");
    error.statusCode = 400;
    throw error;
  }

  const slug = body.slug ? slugify(body.slug) : slugify(title);

  if (!slug) {
    const error = new Error("Slug invalido.");
    error.statusCode = 400;
    throw error;
  }

  return {
    title,
    slug,
    synopsis: requiredText(body.synopsis, "synopsis", 20, 1000),
    type,
    durationSeconds: positiveInteger(body.durationSeconds, "durationSeconds"),
    ageRating: ageRating(body.ageRating ?? 0),
    taxonomyIds: taxonomyObjectIds(body.taxonomyIds),
    assets: {
      posterUrl: optionalText(body.assets?.posterUrl),
      backdropUrl: optionalText(body.assets?.backdropUrl),
    },
  };
}

export function assertCatalogPayload(input) {
  return {
    ...assertCatalogEditorialPayload(input),
    media: { playbackUrl: "" },
    mediaStatus: "pending",
    tracks: { subtitles: [], audio: [] },
    qualityOptions: [],
  };
}

export function assertCatalogUpdatePayload(input) {
  const body = assertJsonObjectBody(input);
  const field = CATALOG_MEDIA_MUTATION_FIELDS.find((key) =>
    Object.prototype.hasOwnProperty.call(body, key),
  );

  if (field) {
    const error = new Error(
      "A media nao pode ser alterada pela mutacao editorial do catalogo.",
    );
    error.statusCode = 400;
    error.code = "CATALOG_MEDIA_MUTATION_FORBIDDEN";
    error.details = { field };
    throw error;
  }

  return assertCatalogEditorialPayload(body);
}

export function parseAdminCatalogPagination(input = {}) {
  const parseQueryInteger = (value, fallback) => {
    const text = value === undefined ? fallback : value;
    if (typeof text !== "string" || !/^\d+$/.test(text)) return NaN;
    return Number.parseInt(text, 10);
  };
  const page = parseQueryInteger(input.page, "1");
  const limit = parseQueryInteger(input.limit, "20");

  if (!Number.isInteger(page) || page < 1) {
    const error = new Error("Pagina invalida.");
    error.statusCode = 400;
    throw error;
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
    const error = new Error("Limite invalido.");
    error.statusCode = 400;
    throw error;
  }

  return { page, limit };
}

export function parsePublicCatalogFilters(input = {}) {
  const parseInteger = (value, fallback) => {
    const candidate = value === undefined ? fallback : value;
    if (typeof candidate !== "string" || !/^\d+$/.test(candidate)) return NaN;
    return Number.parseInt(candidate, 10);
  };
  const page = parseInteger(input.page, "1");
  const limit = parseInteger(input.limit, "24");
  const type = input.type === undefined ? "" : input.type;

  if (!Number.isInteger(page) || page < 1) {
    throw Object.assign(new Error("Pagina invalida."), { statusCode: 400 });
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
    throw Object.assign(new Error("Limite invalido."), { statusCode: 400 });
  }
  if (typeof type !== "string" || (type && !CONTENT_TYPES.includes(type))) {
    throw Object.assign(new Error("Tipo de conteudo invalido."), { statusCode: 400 });
  }

  return { page, limit, type };
}

export function assertStatus(status) {
  const normalized = typeof status === "string" ? status.trim() : "";

  if (!CONTENT_STATUS.includes(normalized)) {
    const error = new Error("Estado de conteudo invalido.");
    error.statusCode = 400;
    throw error;
  }

  return normalized;
}

export function assertTaxonomyPayload(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    const error = new Error("Taxonomia invalida.");
    error.statusCode = 400;
    throw error;
  }
  const name = requiredText(input.name, "name", 2, 80);

  return {
    name,
    slug: input.slug ? slugify(input.slug) : slugify(name),
    description: optionalText(input.description),
  };
}
```

`backend/tests/unit/mf2-catalog-body.validation.test.js`

```js
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  assertCatalogPayload,
  assertCatalogUpdatePayload,
  assertJsonObjectBody,
} from "../../src/modules/catalog/catalog.validation.js";

test("MF2 recusa body ausente, null e array antes de ler propriedades", () => {
  // O mesmo guard protege create, edit, status e revert.
  for (const value of [undefined, null, []]) {
    assert.throws(
      () => assertJsonObjectBody(value),
      (error) =>
        error.statusCode === 400 && error.code === "INVALID_JSON_BODY",
    );
    assert.throws(() => assertCatalogPayload(value), /Body JSON/);
    assert.throws(() => assertCatalogUpdatePayload(value), /Body JSON/);
  }
});
```

5. Explicação do código.

O validador centraliza nomes de campos e impede que cada controller aceite formatos diferentes. `pending` não exige uma fonte; `ready` exige-a. `assertExpectedVersion` aceita apenas um número JSON inteiro positivo e nunca converte `"1"` para `1`.

6. Validação do passo.

```bash
node -e "import('./src/modules/catalog/catalog.validation.js').then(({ slugify }) => console.log(slugify('Piloto FaithFlix')))"
```

Resultado esperado: `piloto-faithflix`.

7. Cenário negativo/erro esperado.

Sem estados fechados, um conteudo com `status: "publicado"` poderia ficar invisivel para um endpoint que espera `published`.

### Passo 2 - Criar servico de catalogo

1. Objetivo funcional do passo no contexto da app.

Implementar criacao, edicao, publicacao, arquivo, listagem publica, historico de revisoes e reversao.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/catalog/catalog-media.js`
    - CRIAR: `backend/src/modules/catalog/catalog.service.js`
    - REUTILIZAR: `backend/src/config/database.js` (`runInTransaction` sem fallback não transacional em runtime)
    - REUTILIZAR: `backend/src/modules/audit/audit.service.js` (`writeAdminAudit` com a mesma sessão)
    - LOCALIZACAO: ficheiro completo

3. Instruções do que fazer.

Cria primeiro o helper de media e depois o service. O helper é interno: serve
apenas para decidir `isPlayable` e para o playback autenticado; nunca devolve a
fonte no catálogo. Garante índice único por `slug`. A baseline final exige uma
topologia MongoDB com transações; se o ambiente não as suportar, marca o
checkpoint como bloqueado em vez de executar revisão e mutação separadamente.

4. Código completo, correto e integrado com a app final.

`backend/src/modules/catalog/catalog-media.js`

```js
const PROTOCOLS = Object.freeze({
  progressive: ["video/mp4"],
  hls: ["application/vnd.apple.mpegurl", "application/x-mpegurl"],
  dash: ["application/dash+xml"],
});
const PROTOCOL_BY_EXTENSION = Object.freeze({
  ".mp4": "progressive",
  ".m3u8": "hls",
  ".mpd": "dash",
});
const PLAYABLE_QUALITY_VALUES = new Set([
  "480p",
  "720p",
  "1080p",
  "2160p",
  "4k",
]);

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

// Rejeitar credenciais, control characters e caminhos protocol-relative evita fontes ambíguas.
function safeLocation(value) {
  if (!value || value.length > 2_048 || value.includes("\\")) return false;
  if ([...value].some((character) => character.codePointAt(0) <= 31)) return false;
  if (value.startsWith("/")) return !value.startsWith("//");

  try {
    const parsed = new URL(value);
    return ["http:", "https:"].includes(parsed.protocol)
      && !parsed.username
      && !parsed.password;
  } catch {
    return false;
  }
}

function inferProtocol(location) {
  try {
    const pathname = new URL(location, "https://faithflix.invalid")
      .pathname
      .toLowerCase();
    return Object.entries(PROTOCOL_BY_EXTENSION)
      .find(([extension]) => pathname.endsWith(extension))?.[1] ?? "";
  } catch {
    return "";
  }
}

/** Converte uma variante interna numa fonte canónica ou devolve null. */
export function canonicalMediaSource(candidate) {
  const nested = candidate?.source && typeof candidate.source === "object"
    ? candidate.source
    : {};
  const location = text(
    nested.url
      ?? nested.playbackUrl
      ?? nested.src
      ?? candidate?.url
      ?? candidate?.playbackUrl
      ?? candidate?.src,
  );
  const declaredQuality = text(
    candidate?.quality
      ?? candidate?.qualityValue
      ?? (candidate?.language ? "" : candidate?.value),
  ).toLowerCase();

  if (!safeLocation(location)) return null;
  // Uma qualidade declarada fora da enum fecha o CTA e o playback da mesma forma.
  if (declaredQuality && !PLAYABLE_QUALITY_VALUES.has(declaredQuality)) return null;

  const protocol = text(nested.protocol ?? candidate?.protocol).toLowerCase();
  const mimeType = text(nested.mimeType ?? candidate?.mimeType).toLowerCase();
  const protocolFromMime = mimeType
    ? Object.entries(PROTOCOLS)
      .find(([, mimeTypes]) => mimeTypes.includes(mimeType))?.[0] ?? ""
    : "";
  const inferred = inferProtocol(location);
  const resolvedProtocol = protocol || protocolFromMime || inferred;

  if (!PROTOCOLS[resolvedProtocol]) return null;
  if (mimeType && !PROTOCOLS[resolvedProtocol].includes(mimeType)) return null;
  if (protocol && protocolFromMime && protocol !== protocolFromMime) return null;

  return {
    url: location,
    protocol: resolvedProtocol,
    mimeType: PROTOCOLS[resolvedProtocol][0],
  };
}

export function hasPlayableMediaSource(content = {}) {
  const audio = Array.isArray(content.tracks?.audio)
    ? content.tracks.audio
    : [];
  const qualities = Array.isArray(content.qualityOptions)
    ? content.qualityOptions
    : [];
  return [content.media, ...audio, ...qualities]
    .some((candidate) => canonicalMediaSource(candidate));
}

export function getMediaAvailability(content = {}) {
  const mediaStatus = ["pending", "ready", "failed"].includes(content.mediaStatus)
    ? content.mediaStatus
    : "pending";

  return {
    mediaStatus,
    isPlayable: mediaStatus === "ready" && hasPlayableMediaSource(content),
  };
}
```

Este helper não é um serializer. O único local onde devolve `url` é a função
interna `canonicalMediaSource`, reutilizada mais tarde pelo endpoint autenticado
de playback. Localização, protocolo, MIME e qualquer qualidade declarada usam a
mesma decisão fail-closed nas duas superfícies. O catálogo usa apenas o booleano
e o estado de disponibilidade.

`backend/src/modules/catalog/catalog.service.js`

```js
import { ObjectId } from "mongodb";
import { getDb, runInTransaction } from "../../config/database.js";
import { writeAdminAudit } from "../audit/audit.service.js";
import {
  assertCatalogPayload,
  assertCatalogUpdatePayload,
  assertExpectedVersion,
  assertJsonObjectBody,
  assertStatus,
  parseAdminCatalogPagination,
  parsePublicCatalogFilters,
} from "./catalog.validation.js";
import { getMediaAvailability } from "./catalog-media.js";

const INITIAL_CONTENT_VERSION = 1;

function contentVersion(content) {
  return Number.isSafeInteger(content?.version) && content.version >= 1
    ? content.version
    : INITIAL_CONTENT_VERSION;
}

function contentVersionFilter(contentId, expectedVersion) {
  if (expectedVersion === INITIAL_CONTENT_VERSION) {
    return {
      _id: contentId,
      $or: [
        { version: INITIAL_CONTENT_VERSION },
        { version: { $exists: false } },
      ],
    };
  }

  return { _id: contentId, version: expectedVersion };
}

function contentVersionConflict() {
  const error = new Error(
    "O conteudo foi alterado por outro utilizador. Recarregue e tente novamente.",
  );
  error.statusCode = 409;
  error.code = "CONTENT_VERSION_CONFLICT";
  return error;
}

function assertCurrentContentVersion(content, expectedVersion) {
  const currentVersion = contentVersion(content);

  if (currentVersion !== expectedVersion) {
    throw contentVersionConflict();
  }

  return currentVersion;
}

function asContentObjectId(id) {
  if (!ObjectId.isValid(id)) {
    const error = new Error("Conteudo invalido.");
    error.statusCode = 400;
    throw error;
  }

  return new ObjectId(id);
}

function asRevisionObjectId(id) {
  if (!ObjectId.isValid(id)) {
    const error = new Error("Revisao invalida.");
    error.statusCode = 400;
    throw error;
  }

  return new ObjectId(id);
}

function publicEditorialAssets(content) {
  return {
    posterUrl: typeof content.assets?.posterUrl === "string"
      ? content.assets.posterUrl
      : "",
    backdropUrl: typeof content.assets?.backdropUrl === "string"
      ? content.assets.backdropUrl
      : "",
  };
}

function publicContent(content) {
  // Allowlist: nenhum container ou alias de fonte é copiado do documento.
  return {
    id: String(content._id),
    title: content.title,
    slug: content.slug,
    synopsis: content.synopsis,
    type: content.type,
    durationSeconds: content.durationSeconds,
    ageRating: content.ageRating,
    taxonomyIds: (content.taxonomyIds ?? []).map(String),
    assets: publicEditorialAssets(content),
    ...getMediaAvailability(content),
    publishedAt: content.publishedAt ?? null,
  };
}

function adminContent(content) {
  return {
    id: String(content._id),
    version: contentVersion(content),
    title: content.title,
    slug: content.slug,
    synopsis: content.synopsis,
    type: content.type,
    durationSeconds: content.durationSeconds,
    ageRating: content.ageRating,
    taxonomyIds: (content.taxonomyIds ?? []).map(String),
    // O DTO admin também é metadata-only; não copia chaves extra de `assets`.
    assets: publicEditorialAssets(content),
    ...getMediaAvailability(content),
    publishedAt: content.publishedAt ?? null,
  };
}

function publicRevision(revision) {
  return {
    id: String(revision._id),
    contentId: String(revision.contentId),
    action: revision.action,
    snapshot: {
      ...adminContent(revision.snapshot),
      status: revision.snapshot.status,
    },
    changedBy: String(revision.changedBy),
    createdAt: revision.createdAt,
  };
}

async function saveRevision(db, content, userId, action, session) {
  await db.collection("content_revisions").insertOne(
    {
      contentId: content._id,
      action,
      snapshot: content,
      changedBy: new ObjectId(userId),
      createdAt: new Date(),
    },
    { session },
  );
}

async function assertExistingTaxonomies(db, taxonomyIds, session) {
  if (taxonomyIds.length === 0) {
    return;
  }

  const existing = await db
    .collection("taxonomies")
    .find(
      { _id: { $in: taxonomyIds } },
      { projection: { _id: 1 }, session },
    )
    .toArray();

  if (existing.length !== taxonomyIds.length) {
    const error = new Error("Uma ou mais taxonomias nao existem.");
    error.statusCode = 400;
    throw error;
  }
}

export async function ensureCatalogIndexes() {
  const db = await getDb();
  await db.collection("contents").createIndex({ slug: 1 }, { unique: true });
  await db.collection("contents").createIndex({ status: 1, publishedAt: -1 });
  await db.collection("contents").createIndex({ updatedAt: -1, _id: 1 });
  await db.collection("content_revisions").createIndex({ contentId: 1, createdAt: -1, _id: 1 });
  await db.collection("taxonomies").createIndex({ slug: 1 }, { unique: true });
}

export async function listPublishedCatalog(query = {}) {
  const { page, limit, type } = parsePublicCatalogFilters(query);
  const db = await getDb();
  const filter = {
    status: "published",
    ...(type ? { type } : {}),
  };
  const [contents, total] = await Promise.all([
    db.collection("contents")
      .find(filter)
      // `_id` torna a ordem determinística quando publishedAt coincide.
      .sort({ publishedAt: -1, _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray(),
    db.collection("contents").countDocuments(filter),
  ]);

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    items: contents.map(publicContent),
  };
}

export async function listAdminCatalog(query = {}) {
  const { page, limit } = parseAdminCatalogPagination(query);
  const db = await getDb();
  const filter = {};
  const [contents, total] = await Promise.all([
    db.collection("contents")
      .find(filter)
      .sort({ updatedAt: -1, _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray(),
    db.collection("contents").countDocuments(filter),
  ]);

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    items: contents.map((content) => ({
      ...adminContent(content),
      status: content.status,
    })),
  };
}

export async function createContent(
  input,
  userId,
  {
    requestId = null,
    auditWriter = writeAdminAudit,
  } = {},
) {
  const payload = assertCatalogPayload(input);
  const actorObjectId = new ObjectId(userId);
  if (typeof auditWriter !== "function") {
    throw new TypeError("auditWriter tem de ser uma função.");
  }

  return runInTransaction(async ({ db, session }) => {
    const now = new Date();
    await assertExistingTaxonomies(db, payload.taxonomyIds, session);

    const document = {
      ...payload,
      version: INITIAL_CONTENT_VERSION,
      status: "draft",
      createdBy: actorObjectId,
      updatedBy: actorObjectId,
      publishedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    const result = await db.collection("contents").insertOne(
      document,
      { session },
    );
    const created = { ...document, _id: result.insertedId };
    const response = { ...adminContent(created), status: created.status };

    // A criação e o audit partilham a sessão; uma falha tardia remove ambos.
    await auditWriter({
      db,
      session,
      actorUserId: actorObjectId,
      action: "catalog.content.created",
      targetType: "content",
      targetId: result.insertedId,
      before: null,
      after: response,
      requestId,
    });

    return response;
  });
}

export async function updateContent(contentId, input, userId) {
  const _id = asContentObjectId(contentId);
  // O guard precede rigorosamente qualquer `input.*`.
  const body = assertJsonObjectBody(input);
  const expectedVersion = assertExpectedVersion(body.expectedVersion);
  const payload = assertCatalogUpdatePayload(body);

  return runInTransaction(async ({ db, session }) => {
    const existing = await db.collection("contents").findOne({ _id }, { session });

    if (!existing) {
      const error = new Error("Conteudo nao encontrado.");
      error.statusCode = 404;
      throw error;
    }

    const currentVersion = assertCurrentContentVersion(existing, expectedVersion);
    await assertExistingTaxonomies(db, payload.taxonomyIds, session);
    await saveRevision(db, existing, userId, "update", session);

    const updated = await db.collection("contents").findOneAndUpdate(
      contentVersionFilter(_id, expectedVersion),
      {
        $set: {
          ...payload,
          version: currentVersion + 1,
          updatedBy: new ObjectId(userId),
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after", session },
    );

    if (!updated) {
      throw contentVersionConflict();
    }

    await writeAdminAudit({
      db,
      session,
      actorUserId: userId,
      action: "catalog.content.updated",
      targetType: "content",
      targetId: _id,
      before: existing,
      after: updated,
    });

    return { ...adminContent(updated), status: updated.status };
  });
}

export async function changeContentStatus(contentId, status, userId, expectedVersionInput) {
  const _id = asContentObjectId(contentId);
  const nextStatus = assertStatus(status);
  const expectedVersion = assertExpectedVersion(expectedVersionInput);

  return runInTransaction(async ({ db, session }) => {
    const existing = await db.collection("contents").findOne({ _id }, { session });

    if (!existing) {
      const error = new Error("Conteudo nao encontrado.");
      error.statusCode = 404;
      throw error;
    }

    const currentVersion = assertCurrentContentVersion(existing, expectedVersion);

    if (existing.status === nextStatus) {
      return { ...adminContent(existing), status: existing.status };
    }

    const now = new Date();
    await saveRevision(db, existing, userId, nextStatus, session);

    const updated = await db.collection("contents").findOneAndUpdate(
      contentVersionFilter(_id, expectedVersion),
      {
        $set: {
          status: nextStatus,
          version: currentVersion + 1,
          updatedBy: new ObjectId(userId),
          updatedAt: now,
          publishedAt: nextStatus === "published" ? now : existing.publishedAt ?? null,
        },
      },
      { returnDocument: "after", session },
    );

    if (!updated) {
      throw contentVersionConflict();
    }

    await writeAdminAudit({
      db,
      session,
      actorUserId: userId,
      action: "catalog.content.status_changed",
      targetType: "content",
      targetId: _id,
      before: existing,
      after: updated,
    });

    return { ...adminContent(updated), status: updated.status };
  });
}

export async function listContentRevisions(contentId, query = {}) {
  const { page, limit } = parseAdminCatalogPagination(query);
  const db = await getDb();
  const contentObjectId = asContentObjectId(contentId);
  const filter = { contentId: contentObjectId };
  const [revisions, total] = await Promise.all([
    db.collection("content_revisions")
      .find(filter)
      .sort({ createdAt: -1, _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray(),
    db.collection("content_revisions").countDocuments(filter),
  ]);

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    items: revisions.map(publicRevision),
  };
}

export async function revertContentRevision(
  contentId,
  revisionId,
  userId,
  expectedVersionInput,
) {
  const contentObjectId = asContentObjectId(contentId);
  const revisionObjectId = asRevisionObjectId(revisionId);
  const expectedVersion = assertExpectedVersion(expectedVersionInput);

  return runInTransaction(async ({ db, session }) => {
    const existing = await db
      .collection("contents")
      .findOne({ _id: contentObjectId }, { session });

    if (!existing) {
      const error = new Error("Conteudo nao encontrado.");
      error.statusCode = 404;
      throw error;
    }

    const currentVersion = assertCurrentContentVersion(existing, expectedVersion);
    const revision = await db.collection("content_revisions").findOne(
      { _id: revisionObjectId, contentId: contentObjectId },
      { session },
    );

    if (!revision) {
      const error = new Error("Revisao nao encontrada.");
      error.statusCode = 404;
      throw error;
    }

    await saveRevision(db, existing, userId, "revert", session);

    const snapshot = revision.snapshot;
    const updated = await db.collection("contents").findOneAndUpdate(
      contentVersionFilter(contentObjectId, expectedVersion),
      {
        $set: {
          title: snapshot.title,
          slug: snapshot.slug,
          synopsis: snapshot.synopsis,
          type: snapshot.type,
          durationSeconds: snapshot.durationSeconds,
          ageRating: snapshot.ageRating,
          status: snapshot.status,
          taxonomyIds: snapshot.taxonomyIds ?? [],
          assets: snapshot.assets,
          publishedAt: snapshot.publishedAt ?? null,
          version: currentVersion + 1,
          updatedBy: new ObjectId(userId),
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after", session },
    );

    if (!updated) {
      throw contentVersionConflict();
    }

    await writeAdminAudit({
      db,
      session,
      actorUserId: userId,
      action: "catalog.content.reverted",
      targetType: "content",
      targetId: contentObjectId,
      before: existing,
      after: updated,
      metadata: { revisionId: String(revisionObjectId) },
    });

    return { ...adminContent(updated), status: updated.status };
  });
}
```

5. Explicação do código.

O serviço público e o administrativo constroem respostas por allowlist. Ambos
expõem metadata, assets e disponibilidade, mas nunca containers ou aliases de
fonte. A administração edita apenas metadata/assets/taxonomias e apresenta
`mediaStatus`/`isPlayable` como informação read-only. As revisões guardam o
snapshot interno, mas o DTO da revisão também passa pelo serializer
administrativo e não o expõe. `runInTransaction` garante commit/rollback conjunto
de revisão, CAS e audit. Catálogo admin e revisões são paginados e usam `_id`
como desempate estável. A listagem pública aplica `type`, `page` e `limit` no
MongoDB e devolve sempre `{ items, page, limit, total, totalPages }`.

6. Validação do passo.

```bash
node -e "import('./src/modules/catalog/catalog.service.js').then((m) => console.log(typeof m.createContent, typeof m.listContentRevisions, typeof m.revertContentRevision))"
```

Resultado esperado: `function function function`.

7. Cenário negativo/erro esperado.

Sem validacao de taxonomias, um conteudo pode guardar IDs inexistentes e quebrar filtros ou recomendacoes futuras. Sem CAS, dois editores podem guardar a partir da mesma versão e o último pedido apaga silenciosamente o trabalho anterior.

### Passo 3 - Criar servico de taxonomias

1. Objetivo funcional do passo no contexto da app.

Permitir criar e listar classificacoes reutilizaveis para o catalogo.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/catalog/taxonomy.service.js`
    - LOCALIZACAO: ficheiro completo

3. Instruções do que fazer.

Cria o servico abaixo e usa a validacao criada no passo 1.

4. Código completo, correto e integrado com a app final.

```js
import { getDb, runInTransaction } from "../../config/database.js";
import { writeAdminAudit } from "../audit/audit.service.js";
import { assertTaxonomyPayload } from "./catalog.validation.js";

// A resposta usa uma allowlist para não acoplar a API ao documento MongoDB completo.
function publicTaxonomy(taxonomy) {
  return {
    id: String(taxonomy._id),
    name: taxonomy.name,
    slug: taxonomy.slug,
    description: taxonomy.description,
  };
}

export async function listTaxonomies() {
  const db = await getDb();
  const taxonomies = await db.collection("taxonomies").find({}).sort({ name: 1 }).toArray();
  return taxonomies.map(publicTaxonomy);
}

// A validação gera um slug canónico antes da escrita para manter filtros consistentes.
export async function createTaxonomy(
  input,
  actorUserId,
  {
    requestId = null,
    auditWriter = writeAdminAudit,
  } = {},
) {
  const payload = assertTaxonomyPayload(input);
  if (typeof auditWriter !== "function") {
    throw new TypeError("auditWriter tem de ser uma função.");
  }

  return runInTransaction(async ({ db, session }) => {
    const now = new Date();
    const document = {
      ...payload,
      createdAt: now,
      updatedAt: now,
    };
    const result = await db.collection("taxonomies").insertOne(
      document,
      { session },
    );
    const created = { ...document, _id: result.insertedId };
    const response = publicTaxonomy(created);

    await auditWriter({
      db,
      session,
      actorUserId,
      action: "catalog.taxonomy.created",
      targetType: "taxonomy",
      targetId: result.insertedId,
      before: null,
      after: response,
      requestId,
    });

    return response;
  });
}
```

5. Explicação do código.

Taxonomias ficam independentes de conteúdos para serem reutilizadas por vários
itens. A criação e o respetivo audit usam a mesma transação; `auditWriter`
existe apenas como seam interno de fault injection e o controller nunca o lê do
pedido HTTP.

6. Validação do passo.

```bash
node -e "import('./src/modules/catalog/taxonomy.service.js').then(({ listTaxonomies }) => console.log(typeof listTaxonomies))"
```

Resultado esperado: `function`.

7. Cenário negativo/erro esperado.

Se cada conteudo guardar nomes livres, filtros e recomendacoes futuras ficam inconsistentes.

### Passo 4 - Criar controller e rotas

1. Objetivo funcional do passo no contexto da app.

Expor catalogo publico e operacoes protegidas de gestao.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/catalog/catalog.controller.js`
    - CRIAR: `backend/src/modules/catalog/catalog.routes.js`
    - LOCALIZACAO: ficheiros completos

3. Instruções do que fazer.

Cria controller e rotas. Mantem rotas fixas antes de rotas dinamicas que serao adicionadas no `BK-MF2-04`.

4. Código completo, correto e integrado com a app final.

`backend/src/modules/catalog/catalog.controller.js`

```js
import {
  changeContentStatus,
  createContent,
  listAdminCatalog,
  listContentRevisions,
  listPublishedCatalog,
  revertContentRevision,
  updateContent,
} from "./catalog.service.js";
import { createTaxonomy, listTaxonomies } from "./taxonomy.service.js";
import { assertJsonObjectBody } from "./catalog.validation.js";

// Os controllers preservam os envelopes paginados produzidos pelos serviços sem reconstruí-los.
export async function getCatalog(req, res) {
  res.status(200).json(await listPublishedCatalog(req.query));
}

export async function getAdminCatalog(req, res) {
  res.status(200).json(await listAdminCatalog(req.query));
}

export async function postContent(req, res) {
  const body = assertJsonObjectBody(req.body);
  res.status(201).json({
    content: await createContent(body, req.user.id, {
      requestId: req.id,
    }),
  });
}

export async function patchContent(req, res) {
  const body = assertJsonObjectBody(req.body);
  res.status(200).json({ content: await updateContent(req.params.id, body, req.user.id) });
}

// Encaminhar `expectedVersion` ativa o controlo de concorrência da mutação de estado.
export async function patchContentStatus(req, res) {
  const body = assertJsonObjectBody(req.body);
  res.status(200).json({
    content: await changeContentStatus(
      req.params.id,
      body.status,
      req.user.id,
      body.expectedVersion,
    ),
  });
}

export async function getContentRevisions(req, res) {
  res.status(200).json(await listContentRevisions(req.params.id, req.query));
}

export async function postContentRevisionRevert(req, res) {
  const body = assertJsonObjectBody(req.body);
  res.status(200).json({
    content: await revertContentRevision(
      req.params.id,
      req.params.revisionId,
      req.user.id,
      body.expectedVersion,
    ),
  });
}

export async function getTaxonomies(req, res) {
  res.status(200).json({ items: await listTaxonomies() });
}

export async function postTaxonomy(req, res) {
  res.status(201).json({
    taxonomy: await createTaxonomy(req.body, req.user.id, {
      requestId: req.id,
    }),
  });
}
```

`backend/src/modules/catalog/catalog.routes.js`

```js
import { Router } from "express";
import { requireRole } from "../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import {
  getAdminCatalog,
  getCatalog,
  getContentRevisions,
  getTaxonomies,
  patchContent,
  patchContentStatus,
  postContentRevisionRevert,
  postContent,
  postTaxonomy,
} from "./catalog.controller.js";

export const catalogRouter = Router();

// Uma única política protege todas as escritas e leituras do histórico editorial.
const canManageCatalog = requireRole(["admin", "moderator"]);

// Rotas literais ficam antes das dinâmicas para `admin` e `taxonomies` não serem tratados como IDs.
catalogRouter.get("/", asyncHandler(getCatalog));
catalogRouter.get("/admin", canManageCatalog, asyncHandler(getAdminCatalog));
catalogRouter.get("/taxonomies", asyncHandler(getTaxonomies));
catalogRouter.post("/taxonomies", canManageCatalog, asyncHandler(postTaxonomy));
catalogRouter.post("/", canManageCatalog, asyncHandler(postContent));
catalogRouter.get("/:id/revisions", canManageCatalog, asyncHandler(getContentRevisions));
catalogRouter.post("/:id/revisions/:revisionId/revert", canManageCatalog, asyncHandler(postContentRevisionRevert));
catalogRouter.patch("/:id", canManageCatalog, asyncHandler(patchContent));
catalogRouter.patch("/:id/status", canManageCatalog, asyncHandler(patchContentStatus));
```

5. Explicação do código.

`GET /api/catalog` e publico e conserva o envelope paginado produzido pelo service; não volta a embrulhar `items` nem perde `total`. Qualquer escrita e qualquer consulta de revisoes passa por `canManageCatalog`. As rotas de revisoes ficam antes de `/:id` para nao colidirem com a rota dinamica do detalhe no BK seguinte. `patchContent` recebe `expectedVersion` no payload editorial; estado e reversão encaminham explicitamente esse campo para o serviço.

6. Validação do passo.

Sem admin:

```bash
curl -i -X POST http://localhost:3000/api/catalog
```

Resultado esperado: `401`.

Com admin:

```bash
curl -i -b /tmp/faithflix.cookies http://localhost:3000/api/catalog/CONTENT_ID/revisions
```

Resultado esperado: `200`.

7. Cenário negativo/erro esperado.

Se `POST /api/catalog` ou as rotas de revisao ficarem publicas, qualquer visitante pode criar conteudo ou ler historico editorial.

### Passo 5 - Montar catalogo na app

1. Objetivo funcional do passo no contexto da app.

Ligar as rotas de catalogo e criar indices antes de aceitar pedidos.

2. Ficheiros envolvidos.
    - EDITAR: `backend/src/app.js`
    - EDITAR: `backend/src/server.js`
    - LOCALIZACAO: trechos de integracao

3. Instruções do que fazer.

Acrescenta o import e a montagem de `catalogRouter` depois de `attachSession` e
de `csrfProtection`, sem remover CORS, health, sessão, rotas existentes ou
handlers finais. No arranque, acrescenta `ensureCatalogIndexes()` antes de
aceitar pedidos, preservando o graceful shutdown criado na `MF1`.

4. Código completo, correto e integrado com a app final.

Trecho esperado em `backend/src/app.js`:

```js
import { catalogRouter } from "./modules/catalog/catalog.routes.js";

// Inserir esta linha depois dos `app.use(attachSession)` e
// `app.use(csrfProtection)` já existentes; não os dupliques.
app.use("/api/catalog", catalogRouter);
```

Trecho esperado em `backend/src/server.js`:

```js
import { ensureCatalogIndexes } from "./modules/catalog/catalog.service.js";

await ensureCatalogIndexes();
```

5. Explicação do código.

As rotas admin precisam de sessao e as mutações autenticadas precisam de CSRF,
por isso o router vem depois de ambos. Estes três trechos são adições na app
cumulativa, não um novo `app.js`. Os indices reduzem conflitos de `slug` e
aceleram listagens.

6. Validação do passo.

Arranca o backend:

```bash
npm --prefix backend run dev
```

Resultado esperado: o servidor arranca sem erro de import.

7. Cenário negativo/erro esperado.

Se o router vier antes da sessao, `requireRole` nao encontra `req.user`.

### Passo 6 - Criar cliente frontend e pagina publica

1. Objetivo funcional do passo no contexto da app.

Permitir ao frontend listar catalogo publicado e preparar links para o detalhe.

2. Ficheiros envolvidos.
    - CRIAR: `frontend/src/services/api/catalogApi.js`
    - CRIAR ou EDITAR: `frontend/src/pages/CatalogPage.jsx`
    - EDITAR: `frontend/src/routes/AppRoutes.jsx`
    - LOCALIZACAO: ficheiros completos para API e pagina; trecho de rotas

3. Instruções do que fazer.

Cria `catalogApi` com paginação pública, propagação de `AbortSignal` e os métodos
administrativos. A página guarda filtro e página na URL, cancela o pedido
anterior e repete exatamente os parâmetros atuais quando o utilizador escolhe
`Tentar novamente`.

4. Código completo, correto e integrado com a app final.

`frontend/src/services/api/catalogApi.js`

```js
import { apiClient } from "./apiClient.js";

// A listagem pública propaga o AbortSignal para permitir cancelar respostas que ficaram obsoletas.
export const catalogApi = {
  listPublished({ type = "", page = 1, limit = 24 } = {}, { signal } = {}) {
    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (type) query.set("type", type);
    return apiClient.get(`/api/catalog?${query}`, { signal });
  },
  listAdmin(params = {}, options = {}) {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.set("page", String(params.page));
    if (params.limit !== undefined) query.set("limit", String(params.limit));
    const suffix = query.toString() ? `?${query}` : "";
    return apiClient.get(`/api/catalog/admin${suffix}`, options);
  },
  createContent(input, options = {}) {
    return apiClient.post("/api/catalog", input, options);
  },
  // Codificar IDs mantém cada identificador confinado a um único segmento da rota.
  updateContent(contentId, input, options = {}) {
    return apiClient.patch(
      `/api/catalog/${encodeURIComponent(contentId)}`,
      input,
      options,
    );
  },
  updateStatus(contentId, status, expectedVersion, options = {}) {
    return apiClient.patch(
      `/api/catalog/${encodeURIComponent(contentId)}/status`,
      { status, expectedVersion },
      options,
    );
  },
  listRevisions(contentId, params = {}, options = {}) {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.set("page", String(params.page));
    if (params.limit !== undefined) query.set("limit", String(params.limit));
    const suffix = query.toString() ? `?${query}` : "";
    return apiClient.get(
      `/api/catalog/${encodeURIComponent(contentId)}/revisions${suffix}`,
      options,
    );
  },
  revertRevision(contentId, revisionId, expectedVersion, options = {}) {
    return apiClient.post(
      `/api/catalog/${encodeURIComponent(contentId)}/revisions/${encodeURIComponent(revisionId)}/revert`,
      { expectedVersion },
      options,
    );
  },
  listTaxonomies(options = {}) {
    return apiClient.get("/api/catalog/taxonomies", options);
  },
  createTaxonomy(input, options = {}) {
    return apiClient.post("/api/catalog/taxonomies", input, options);
  },
};
```

`frontend/src/pages/CatalogPage.jsx`

```jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toUserMessage } from "../services/api/apiErrors.js";
import { catalogApi } from "../services/api/catalogApi.js";

const PAGE_LIMIT = 24;
const CONTENT_TYPES = ["movie", "series", "episode", "documentary"];

// Parâmetros inválidos regressam à primeira página, sem coerções negativas ou fracionárias.
function parsePage(value) {
  return /^\d+$/.test(value ?? "") && Number(value) > 0 ? Number(value) : 1;
}

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState({
    status: "loading",
    items: [],
    total: 0,
    error: "",
  });

  const type = CONTENT_TYPES.includes(searchParams.get("type"))
    ? searchParams.get("type")
    : "";
  const page = parsePage(searchParams.get("page"));

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    // O cleanup aborta a leitura anterior e `active` protege contra respostas resolvidas fora de ordem.
    setState((current) => ({ ...current, status: "loading", error: "" }));
    catalogApi
      .listPublished(
        { type, page, limit: PAGE_LIMIT },
        { signal: controller.signal },
      )
      .then((response) => {
        if (!active) return;
        setState({
          status: "ready",
          items: response.items,
          total: response.total,
          error: "",
        });
      })
      .catch((error) => {
        if (!active || controller.signal.aborted) return;
        setState((current) => ({
          ...current,
          status: "error",
          error: toUserMessage(error),
        }));
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [page, reloadKey, type]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(state.total / PAGE_LIMIT)),
    [state.total],
  );

  function updateLocation({ nextType = type, nextPage = page }) {
    const next = new URLSearchParams();
    if (nextType) next.set("type", nextType);
    if (nextPage > 1) next.set("page", String(nextPage));
    setSearchParams(next);
  }

  return (
    <main className="page-shell">
      <h1>Catalogo</h1>

      <label htmlFor="catalog-type">Tipo</label>
      <select
        id="catalog-type"
        value={type}
        onChange={(event) =>
          updateLocation({ nextType: event.target.value, nextPage: 1 })
        }
      >
        <option value="">Todos</option>
        {CONTENT_TYPES.map((value) => (
          <option key={value} value={value}>{value}</option>
        ))}
      </select>

      {state.status === "loading" && <p>A carregar...</p>}
      {state.status === "error" && (
        <div role="alert">
          <p>{state.error}</p>
          <button type="button" onClick={() => setReloadKey((key) => key + 1)}>
            Tentar novamente
          </button>
        </div>
      )}
      {state.status === "ready" && state.items.length === 0 && (
        <p>Não existem conteúdos para este filtro.</p>
      )}

      <section className="content-grid" aria-label="Conteudos publicados">
        {state.items.map((content) => (
          <article key={content.id}>
            <img src={content.assets.posterUrl} alt={`Poster de ${content.title}`} />
            <h2>{content.title}</h2>
            <p>{content.synopsis}</p>
            <Link
              to={`/catalogo/${encodeURIComponent(content.slug ?? content.id)}`}
            >
              Ver detalhe
            </Link>
          </article>
        ))}
      </section>

      <nav aria-label="Paginação do catálogo">
        <button
          type="button"
          disabled={page <= 1 || state.status === "loading"}
          onClick={() => updateLocation({ nextPage: page - 1 })}
        >
          Anterior
        </button>
        <span>Página {page} de {totalPages}</span>
        <button
          type="button"
          disabled={page >= totalPages || state.status === "loading"}
          onClick={() => updateLocation({ nextPage: page + 1 })}
        >
          Seguinte
        </button>
      </nav>
    </main>
  );
}
```

Trecho esperado em `frontend/src/routes/AppRoutes.jsx`:

```jsx
// SUBSTITUIR a declaração lazy de CatalogPage criada em BK-MF1-02.
const CatalogPage = lazyNamedPage(() => import("../pages/CatalogPage.jsx"), "CatalogPage");

<Route path="/catalogo" element={<CatalogPage />} />
```

5. Explicação do código.

A página pública não recebe drafts porque o filtro está no backend. Filtro e
página ficam na URL. Cada alteração desmonta a leitura anterior, aborta o pedido
e a flag `active` impede respostas antigas de substituir o estado recente. O
retry mantém o mesmo filtro/página. `encodeURIComponent` garante que o slug ou
ID ocupa um único segmento da rota. Uma futura leitura editorial de discovery
deve ter estado e `AbortController` próprios, para a sua falha não apagar esta
listagem.

6. Validação do passo.

Abre `/catalogo?type=movie&page=2` com mais de 24 conteúdos. Confirma paginação,
retry, cancelamento ao trocar filtro e um link com slug que contenha espaço,
`/` ou `?` codificado num único segmento.

7. Cenário negativo/erro esperado.

Se a página filtrar drafts apenas no browser, a API continua a expor conteúdo
indevido. Se não abortar pedidos antigos, uma resposta lenta pode substituir o
filtro ou página atual.

### Passo 7 - Criar gestão admin metadata-only e preparar decomposição list-first

1. Objetivo funcional do passo no contexto da app.

Permitir a `admin` e `moderator` listar, criar, carregar uma linha para edição,
atualizar e arquivar conteúdos, incluindo assets editoriais e taxonomias.

2. Ficheiros envolvidos.
    - CRIAR: `frontend/src/pages/AdminCatalogPage.jsx` como checkpoint funcional MF2
    - EDITAR: `frontend/src/routes/AppRoutes.jsx`
    - LOCALIZACAO: ficheiro completo para pagina; trecho de rotas

3. Instruções do que fazer.

Cria a página completa abaixo como checkpoint desta macrofase. O formulário usa apenas a allowlist editorial
do backend, carrega taxonomias existentes, permite criar uma nova taxonomia e
aplica as seleções ao conteúdo. Arquivo, despublicação e reversão exigem
confirmação; cada linha fica ocupada apenas durante a sua própria operação. Na
composição final, este checkpoint não fica como página monolítica: a tabela,
criação, edição e taxonomias são separadas nas rotas indicadas depois do snippet.

4. Código completo para o checkpoint MF2 e contrato obrigatório da app final.

```jsx
import { useCallback, useEffect, useRef, useState } from "react";
import { toUserMessage } from "../services/api/apiErrors.js";
import { catalogApi } from "../services/api/catalogApi.js";

const PAGE_LIMIT = 12;
const CONTENT_TYPES = [
  { value: "movie", label: "Filme" },
  { value: "series", label: "Série" },
  { value: "episode", label: "Episódio" },
  { value: "documentary", label: "Documentário" },
];
const STATUS_LABELS = {
  draft: "Rascunho",
  published: "Publicado",
  archived: "Arquivado",
};
const REVISION_LABELS = {
  create: "Conteúdo criado",
  update: "Conteúdo editado",
  published: "Conteúdo publicado",
  draft: "Conteúdo movido para rascunho",
  archived: "Conteúdo arquivado",
  revert: "Revisão reposta",
};
const EMPTY_FORM = {
  id: "",
  version: null,
  title: "",
  slug: "",
  synopsis: "",
  type: "movie",
  durationSeconds: "120",
  ageRating: "6",
  taxonomyIds: [],
  assets: { posterUrl: "", backdropUrl: "" },
};
const EMPTY_TAXONOMY_FORM = { name: "", slug: "", description: "" };

/** Cria uma cópia independente para não reutilizar arrays/objetos mutáveis. */
function emptyContentForm() {
  return {
    ...EMPTY_FORM,
    taxonomyIds: [],
    assets: { ...EMPTY_FORM.assets },
  };
}

/** Copia exclusivamente os campos editoriais permitidos para o formulário. */
function contentToForm(content) {
  return {
    id: content.id,
    version: content.version,
    title: content.title ?? "",
    slug: content.slug ?? "",
    synopsis: content.synopsis ?? "",
    type: content.type ?? "movie",
    durationSeconds: String(content.durationSeconds ?? 120),
    ageRating: String(content.ageRating ?? 0),
    taxonomyIds: Array.isArray(content.taxonomyIds) ? [...content.taxonomyIds] : [],
    assets: {
      posterUrl: content.assets?.posterUrl ?? "",
      backdropUrl: content.assets?.backdropUrl ?? "",
    },
  };
}

/** Valida números da UI e produz apenas metadata, assets editoriais e taxonomias. */
function buildEditorialPayload(form) {
  const durationSeconds = Number(form.durationSeconds);
  const ageRating = Number(form.ageRating);

  if (!Number.isInteger(durationSeconds) || durationSeconds < 1) {
    return { error: "A duração deve ser um inteiro positivo.", payload: null };
  }
  if (!Number.isInteger(ageRating) || ageRating < 0 || ageRating > 18) {
    return { error: "A classificação etária deve estar entre 0 e 18.", payload: null };
  }

  return {
    error: "",
    payload: {
      title: form.title.trim(),
      slug: form.slug.trim(),
      synopsis: form.synopsis.trim(),
      type: form.type,
      durationSeconds,
      ageRating,
      taxonomyIds: [...form.taxonomyIds],
      assets: {
        posterUrl: form.assets.posterUrl.trim(),
        backdropUrl: form.assets.backdropUrl.trim(),
      },
      ...(form.id ? { expectedVersion: form.version } : {}),
    },
  };
}

function statusLabel(status) {
  return STATUS_LABELS[status] ?? "Estado desconhecido";
}

function revisionLabel(action) {
  return REVISION_LABELS[action] ?? "Alteração editorial";
}

/** Página administrativa metadata-only, paginada e resistente a duplo clique. */
export function AdminCatalogPage() {
  const [items, setItems] = useState([]);
  const [taxonomies, setTaxonomies] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_LIMIT,
    total: 0,
    totalPages: 1,
  });
  const [form, setForm] = useState(emptyContentForm);
  const [taxonomyForm, setTaxonomyForm] = useState(EMPTY_TAXONOMY_FORM);
  const [revisionsByContent, setRevisionsByContent] = useState({});
  const [rowActions, setRowActions] = useState({});
  const [loading, setLoading] = useState(true);
  const [formBusy, setFormBusy] = useState(false);
  const [taxonomyBusy, setTaxonomyBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const mountedRef = useRef(true);
  const formBusyRef = useRef(false);
  const taxonomyBusyRef = useRef(false);
  const rowActionsRef = useRef(new Map());
  const requestControllersRef = useRef(new Set());
  const listControllerRef = useRef(null);
  const taxonomiesControllerRef = useRef(null);

  function publishRowActions() {
    if (mountedRef.current) {
      setRowActions(Object.fromEntries(rowActionsRef.current));
    }
  }

  // A reserva síncrona impede dois handlers da mesma linha antes do render seguinte.
  function reserveRow(contentId, action) {
    if (rowActionsRef.current.has(contentId)) return false;
    rowActionsRef.current.set(contentId, action);
    publishRowActions();
    return true;
  }

  function releaseRow(contentId, action) {
    if (rowActionsRef.current.get(contentId) === action) {
      rowActionsRef.current.delete(contentId);
      publishRowActions();
    }
  }

  function trackedController() {
    const controller = new AbortController();
    requestControllersRef.current.add(controller);
    return controller;
  }

  function releaseController(controller) {
    requestControllersRef.current.delete(controller);
  }

  const loadItems = useCallback(async (page = 1) => {
    listControllerRef.current?.abort();
    const controller = new AbortController();
    listControllerRef.current = controller;
    if (mountedRef.current) setLoading(true);

    try {
      const response = await catalogApi.listAdmin(
        { page, limit: PAGE_LIMIT },
        { signal: controller.signal },
      );
      if (!mountedRef.current || listControllerRef.current !== controller) return;
      setItems(response.items ?? []);
      setPagination({
        page: response.page ?? page,
        limit: response.limit ?? PAGE_LIMIT,
        total: response.total ?? 0,
        totalPages: Math.max(response.totalPages ?? 1, 1),
      });
    } catch (requestError) {
      if (
        mountedRef.current &&
        !controller.signal.aborted &&
        requestError?.code !== "REQUEST_ABORTED"
      ) {
        setError(toUserMessage(requestError));
      }
    } finally {
      if (listControllerRef.current === controller) {
        listControllerRef.current = null;
        if (mountedRef.current) setLoading(false);
      }
    }
  }, []);

  const loadTaxonomies = useCallback(async () => {
    taxonomiesControllerRef.current?.abort();
    const controller = new AbortController();
    taxonomiesControllerRef.current = controller;

    try {
      const response = await catalogApi.listTaxonomies({ signal: controller.signal });
      if (!mountedRef.current || taxonomiesControllerRef.current !== controller) return;
      setTaxonomies(response.items ?? []);
    } catch (requestError) {
      if (
        mountedRef.current &&
        !controller.signal.aborted &&
        requestError?.code !== "REQUEST_ABORTED"
      ) {
        setError(toUserMessage(requestError));
      }
    } finally {
      if (taxonomiesControllerRef.current === controller) {
        taxonomiesControllerRef.current = null;
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    setError("");
    void loadItems(1);
    void loadTaxonomies();

    return () => {
      mountedRef.current = false;
      listControllerRef.current?.abort();
      taxonomiesControllerRef.current?.abort();
      for (const controller of requestControllersRef.current) controller.abort();
      requestControllersRef.current.clear();
      rowActionsRef.current.clear();
      formBusyRef.current = false;
      taxonomyBusyRef.current = false;
    };
  }, [loadItems, loadTaxonomies]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateAsset(field, value) {
    setForm((current) => ({
      ...current,
      assets: { ...current.assets, [field]: value },
    }));
  }

  function selectContentForEditing(content) {
    setError("");
    setStatus(`A editar «${content.title}».`);
    setForm(contentToForm(content));
    globalThis.requestAnimationFrame?.(() => {
      document.getElementById("catalog-title")?.focus();
    });
  }

  async function handleApiError(requestError, contentId = "") {
    if (!mountedRef.current || requestError?.code === "REQUEST_ABORTED") return;

    if (requestError?.code === "CONTENT_VERSION_CONFLICT") {
      setError(
        "Outro editor alterou este conteúdo. A lista foi atualizada; revê os dados antes de repetir.",
      );
      if (form.id === contentId) setForm(emptyContentForm());
      await loadItems(pagination.page);
      return;
    }

    // Nunca apresentar stack, payload interno ou mensagem crua do servidor.
    setError(toUserMessage(requestError));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (formBusyRef.current) return;
    const result = buildEditorialPayload(form);
    if (result.error) {
      setError(result.error);
      return;
    }

    const contentId = form.id;
    const action = "save";
    if (contentId && !reserveRow(contentId, action)) return;
    const controller = trackedController();
    formBusyRef.current = true;
    setFormBusy(true);
    setError("");
    setStatus("");

    try {
      if (contentId) {
        await catalogApi.updateContent(contentId, result.payload, {
          signal: controller.signal,
        });
      } else {
        await catalogApi.createContent(result.payload, { signal: controller.signal });
      }
      if (!mountedRef.current) return;
      setStatus(contentId ? "Conteúdo atualizado." : "Conteúdo criado como rascunho.");
      setForm(emptyContentForm());
      await loadItems(pagination.page);
    } catch (requestError) {
      await handleApiError(requestError, contentId);
    } finally {
      releaseController(controller);
      if (contentId) releaseRow(contentId, action);
      formBusyRef.current = false;
      if (mountedRef.current) setFormBusy(false);
    }
  }

  async function changeStatus(content, nextStatus) {
    const removesFromPublicCatalog =
      nextStatus === "archived" ||
      (content.status === "published" && nextStatus === "draft");
    if (
      removesFromPublicCatalog &&
      !globalThis.confirm(
        `Alterar «${content.title}» para ${statusLabel(nextStatus).toLowerCase()}?`,
      )
    ) {
      return;
    }

    const action = `status:${nextStatus}`;
    if (!reserveRow(content.id, action)) return;
    const controller = trackedController();
    setError("");
    setStatus("");

    try {
      await catalogApi.updateStatus(
        content.id,
        nextStatus,
        content.version,
        { signal: controller.signal },
      );
      if (!mountedRef.current) return;
      setStatus(`Estado alterado para ${statusLabel(nextStatus).toLowerCase()}.`);
      if (form.id === content.id) setForm(emptyContentForm());
      setRevisionsByContent((current) => {
        const next = { ...current };
        delete next[content.id];
        return next;
      });
      await loadItems(pagination.page);
    } catch (requestError) {
      await handleApiError(requestError, content.id);
    } finally {
      releaseController(controller);
      releaseRow(content.id, action);
    }
  }

  async function loadRevisions(content) {
    const action = "revisions";
    if (!reserveRow(content.id, action)) return;
    const controller = trackedController();
    setError("");

    try {
      const response = await catalogApi.listRevisions(
        content.id,
        { page: 1, limit: 50 },
        { signal: controller.signal },
      );
      if (!mountedRef.current) return;
      setRevisionsByContent((current) => ({
        ...current,
        [content.id]: response.items ?? [],
      }));
    } catch (requestError) {
      await handleApiError(requestError, content.id);
    } finally {
      releaseController(controller);
      releaseRow(content.id, action);
    }
  }

  async function revertRevision(content, revisionId) {
    if (
      !globalThis.confirm(
        `Reverter «${content.title}» para esta revisão? As alterações posteriores serão substituídas.`,
      )
    ) {
      return;
    }

    const action = `revert:${revisionId}`;
    if (!reserveRow(content.id, action)) return;
    const controller = trackedController();
    setError("");
    setStatus("");

    try {
      await catalogApi.revertRevision(
        content.id,
        revisionId,
        content.version,
        { signal: controller.signal },
      );
      if (!mountedRef.current) return;
      setStatus("Revisão reposta.");
      if (form.id === content.id) setForm(emptyContentForm());
      setRevisionsByContent((current) => {
        const next = { ...current };
        delete next[content.id];
        return next;
      });
      await loadItems(pagination.page);
    } catch (requestError) {
      await handleApiError(requestError, content.id);
    } finally {
      releaseController(controller);
      releaseRow(content.id, action);
    }
  }

  async function handleTaxonomySubmit(event) {
    event.preventDefault();
    if (taxonomyBusyRef.current) return;
    const controller = trackedController();
    taxonomyBusyRef.current = true;
    setTaxonomyBusy(true);
    setError("");
    setStatus("");

    try {
      await catalogApi.createTaxonomy(
        {
          name: taxonomyForm.name.trim(),
          slug: taxonomyForm.slug.trim(),
          description: taxonomyForm.description.trim(),
        },
        { signal: controller.signal },
      );
      if (!mountedRef.current) return;
      setTaxonomyForm(EMPTY_TAXONOMY_FORM);
      setStatus("Taxonomia criada.");
      await loadTaxonomies();
    } catch (requestError) {
      await handleApiError(requestError);
    } finally {
      releaseController(controller);
      taxonomyBusyRef.current = false;
      if (mountedRef.current) setTaxonomyBusy(false);
    }
  }

  const hasBusyRows = Object.keys(rowActions).length > 0;

  return (
    <main className="page-shell">
      <h1>Gestão de catálogo</h1>
      {error ? <p role="alert">{error}</p> : null}
      {status ? <p role="status">{status}</p> : null}

      <form aria-busy={formBusy} onSubmit={handleSubmit}>
        <h2>{form.id ? "Editar conteúdo" : "Criar conteúdo"}</h2>
        <fieldset disabled={formBusy}>
          <label>
            Título
            <input
              id="catalog-title"
              required
              minLength={2}
              maxLength={160}
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
            />
          </label>
          <label>
            Slug
            <input
              maxLength={160}
              value={form.slug}
              onChange={(event) => updateField("slug", event.target.value)}
            />
          </label>
          <label>
            Sinopse
            <textarea
              required
              minLength={20}
              maxLength={1000}
              value={form.synopsis}
              onChange={(event) => updateField("synopsis", event.target.value)}
            />
          </label>
          <label>
            Tipo
            <select value={form.type} onChange={(event) => updateField("type", event.target.value)}>
              {CONTENT_TYPES.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label>
            Duração em segundos
            <input
              required
              min="1"
              step="1"
              type="number"
              value={form.durationSeconds}
              onChange={(event) => updateField("durationSeconds", event.target.value)}
            />
          </label>
          <label>
            Classificação etária
            <input
              required
              min="0"
              max="18"
              step="1"
              type="number"
              value={form.ageRating}
              onChange={(event) => updateField("ageRating", event.target.value)}
            />
          </label>
          <label>
            Endereço do cartaz editorial
            <input
              type="text"
              value={form.assets.posterUrl}
              onChange={(event) => updateAsset("posterUrl", event.target.value)}
            />
          </label>
          <label>
            Endereço da imagem de fundo editorial
            <input
              type="text"
              value={form.assets.backdropUrl}
              onChange={(event) => updateAsset("backdropUrl", event.target.value)}
            />
          </label>
          <label>
            Taxonomias
            <select
              multiple
              value={form.taxonomyIds}
              onChange={(event) => updateField(
                "taxonomyIds",
                Array.from(event.target.selectedOptions, (option) => option.value),
              )}
            >
              {taxonomies.map((taxonomy) => (
                <option key={taxonomy.id} value={taxonomy.id}>{taxonomy.name}</option>
              ))}
            </select>
          </label>
          <button type="submit">
            {formBusy ? "A guardar..." : form.id ? "Guardar alterações" : "Criar conteúdo"}
          </button>
          {form.id ? (
            <button type="button" onClick={() => setForm(emptyContentForm())}>
              Cancelar edição
            </button>
          ) : null}
        </fieldset>
      </form>

      <form aria-busy={taxonomyBusy} onSubmit={handleTaxonomySubmit}>
        <h2>Nova taxonomia</h2>
        <fieldset disabled={taxonomyBusy}>
          <label>
            Nome
            <input
              required
              minLength={2}
              maxLength={80}
              value={taxonomyForm.name}
              onChange={(event) => setTaxonomyForm((current) => ({
                ...current,
                name: event.target.value,
              }))}
            />
          </label>
          <label>
            Slug opcional
            <input
              value={taxonomyForm.slug}
              onChange={(event) => setTaxonomyForm((current) => ({
                ...current,
                slug: event.target.value,
              }))}
            />
          </label>
          <label>
            Descrição
            <textarea
              maxLength={500}
              value={taxonomyForm.description}
              onChange={(event) => setTaxonomyForm((current) => ({
                ...current,
                description: event.target.value,
              }))}
            />
          </label>
          <button type="submit">{taxonomyBusy ? "A criar..." : "Criar taxonomia"}</button>
        </fieldset>
      </form>

      {loading ? <p role="status">A carregar catálogo...</p> : null}
      {!loading && items.length === 0 ? <p>Ainda não existem conteúdos.</p> : null}
      <section aria-label="Conteúdos em gestão">
        {items.map((content) => {
          const action = rowActions[content.id] ?? "";
          const rowBusy = action !== "";
          const revisions = revisionsByContent[content.id];

          return (
            <article aria-busy={rowBusy} key={content.id}>
              <h2>{content.title}</h2>
              <p>Estado: {statusLabel(content.status)}</p>
              <p>Versão: {content.version}</p>
              <button
                type="button"
                disabled={rowBusy || formBusy}
                onClick={() => selectContentForEditing(content)}
              >
                {action === "save" ? "A guardar..." : "Editar"}
              </button>
              <button
                type="button"
                disabled={rowBusy || content.status === "published"}
                onClick={() => changeStatus(content, "published")}
              >
                {action === "status:published" ? "A publicar..." : "Publicar"}
              </button>
              <button
                type="button"
                disabled={rowBusy || content.status === "draft"}
                onClick={() => changeStatus(content, "draft")}
              >
                {action === "status:draft" ? "A mover..." : "Mover para rascunho"}
              </button>
              <button
                type="button"
                disabled={rowBusy || content.status === "archived"}
                onClick={() => changeStatus(content, "archived")}
              >
                {action === "status:archived" ? "A arquivar..." : "Arquivar"}
              </button>
              <button
                type="button"
                disabled={rowBusy}
                onClick={() => {
                  if (revisions) {
                    setRevisionsByContent((current) => {
                      const next = { ...current };
                      delete next[content.id];
                      return next;
                    });
                  } else {
                    void loadRevisions(content);
                  }
                }}
              >
                {action === "revisions"
                  ? "A carregar revisões..."
                  : revisions
                    ? "Ocultar revisões"
                    : "Ver revisões"}
              </button>

              {revisions ? (
                revisions.length > 0 ? (
                  <ul aria-label={`Revisões de ${content.title}`}>
                    {revisions.map((revision) => (
                      <li key={revision.id}>
                        <span>
                          {revisionLabel(revision.action)} - {new Date(
                            revision.createdAt,
                          ).toLocaleString("pt-PT")}
                        </span>
                        <button
                          type="button"
                          disabled={rowBusy}
                          onClick={() => revertRevision(content, revision.id)}
                        >
                          {action === `revert:${revision.id}` ? "A reverter..." : "Reverter"}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Sem revisões anteriores.</p>
                )
              ) : null}
            </article>
          );
        })}
      </section>

      <nav aria-label="Paginação do catálogo administrativo">
        <button
          type="button"
          disabled={loading || formBusy || hasBusyRows || pagination.page <= 1}
          onClick={() => {
            setForm(emptyContentForm());
            void loadItems(pagination.page - 1);
          }}
        >
          Anterior
        </button>
        <span>Página {pagination.page} de {pagination.totalPages}</span>
        <button
          type="button"
          disabled={
            loading ||
            formBusy ||
            hasBusyRows ||
            pagination.page >= pagination.totalPages
          }
          onClick={() => {
            setForm(emptyContentForm());
            void loadItems(pagination.page + 1);
          }}
        >
          Seguinte
        </button>
      </nav>
    </main>
  );
}
```

Trecho esperado em `frontend/src/routes/AppRoutes.jsx`:

```jsx
// ADICIONAR uma única vez, junto das restantes declarações lazy.
const AdminCatalogPage = lazyNamedPage(() => import("../pages/AdminCatalogPage.jsx"), "AdminCatalogPage");

<Route path="/admin/catalogo" element={<AdminCatalogPage />} />
```

O fragmento anterior fecha o comportamento MF2, mas é substituído na composição
final por bindings lazy separados, sem duplicar os services/validators:

```jsx
// Cada binding mantém uma responsabilidade visual e reutiliza o mesmo contrato editorial.
const AdminCatalogListPage = lazyNamedPage(() => import("../pages/AdminCatalogListPage.jsx"), "AdminCatalogListPage");
const AdminCatalogCreatePage = lazyNamedPage(() => import("../pages/AdminCatalogCreatePage.jsx"), "AdminCatalogCreatePage");
const AdminCatalogEditPage = lazyNamedPage(() => import("../pages/AdminCatalogEditPage.jsx"), "AdminCatalogEditPage");
const AdminTaxonomiesPage = lazyNamedPage(() => import("../pages/AdminTaxonomiesPage.jsx"), "AdminTaxonomiesPage");

<Route path="catalogo" element={<AdminCatalogListPage />} />
<Route path="catalogo/novo" element={<AdminCatalogCreatePage />} />
<Route path="catalogo/:contentId/editar" element={<AdminCatalogEditPage />} />
<Route path="catalogo/taxonomias" element={<AdminTaxonomiesPage />} />
```

Estas quatro rotas são filhas de `/admin`/`AdminLayout` no `BK-MF7-02`.
`/admin/catalogo` começa pela pesquisa/listagem; criar e editar nunca obrigam a
percorrer um formulário longo antes da tabela.

5. Explicação do código.

A UI usa os endpoints existentes e paginados para ler/criar/editar/arquivar
conteúdos, gerir os dois assets editoriais, criar/selecionar taxonomias, mudar
estado e reverter. `contentToForm` e `buildEditorialPayload` são allowlists: a
linha selecionada nunca é copiada integralmente para o payload. Cada mutação
envia a `version` observada como `expectedVersion`; perante
`CONTENT_VERSION_CONFLICT`, o formulário obsoleto é descartado e a lista é
recarregada. Erros remotos passam sempre por `toUserMessage`.

Neste contrato, a operação de remoção do CRUD é o arquivo lógico, porque não
existe `DELETE /api/catalog/:id`. Para taxonomias, a API deste BK permite
listar/criar e editar a associação no conteúdo; o tutorial não inventa
operações de alteração ou eliminação de taxonomias que o backend não expõe.

6. Validação do passo.

Com `admin` ou `moderator`, cria uma taxonomia e um conteúdo com cartaz, imagem
de fundo e essa taxonomia. Clica `Editar` noutra linha e confirma que todos os
campos ficam preenchidos; altera-os e guarda. Cancela uma confirmação de arquivo
e confirma que não existe pedido; aceita-a e verifica busy state apenas nessa
linha. Abre revisões, cancela e depois confirma uma reversão.

7. Cenário negativo/erro esperado.

Se a UI usar `requestError.message`, copiar a resposta administrativa inteira
para o payload, permitir duplo clique ou arquivar/reverter sem confirmação, o
BK continua incompleto. A administração editorial não recebe nem constrói
qualquer fonte de reprodução.

### Passo 8 - Validar endpoints principais

1. Objetivo funcional do passo no contexto da app.

Confirmar que publico, admin e estados se comportam como esperado.

2. Ficheiros envolvidos.
    - EXECUTAR: backend e frontend
    - VALIDAR: API e UI

3. Instruções do que fazer.

Usa um cookie de admin gerado nos BKs anteriores.

4. Código completo, correto e integrado com a app final.

```bash
curl -i http://localhost:3000/api/catalog

curl -i -b /tmp/faithflix.cookies \
  -H "Content-Type: application/json" \
  -d '{"title":"Piloto FaithFlix","synopsis":"Conteudo curto para validar o catalogo da FaithFlix.","type":"movie","durationSeconds":120,"ageRating":6,"taxonomyIds":[],"assets":{"posterUrl":"","backdropUrl":""}}' \
  http://localhost:3000/api/catalog

curl -i -b /tmp/faithflix.cookies "http://localhost:3000/api/catalog/admin?page=1&limit=20"

# A rota editorial recusa qualquer tentativa de editar media.
curl -i -b /tmp/faithflix.cookies \
  -X PATCH \
  -H "Content-Type: application/json" \
  -d '{"title":"Piloto FaithFlix","synopsis":"Conteudo curto para validar o catalogo da FaithFlix.","type":"movie","durationSeconds":120,"ageRating":6,"taxonomyIds":[],"assets":{"posterUrl":"","backdropUrl":""},"mediaStatus":"ready","expectedVersion":1}' \
  http://localhost:3000/api/catalog/CONTENT_ID

# Usa a version devolvida pela listagem administrativa.
curl -i -b /tmp/faithflix.cookies \
  -X PATCH \
  -H "Content-Type: application/json" \
  -d '{"status":"published","expectedVersion":1}' \
  http://localhost:3000/api/catalog/CONTENT_ID/status

# Repete com a version atual: deve ser no-op, sem nova revisão/publishedAt.
curl -i -b /tmp/faithflix.cookies \
  -X PATCH \
  -H "Content-Type: application/json" \
  -d '{"status":"published","expectedVersion":2}' \
  http://localhost:3000/api/catalog/CONTENT_ID/status

# Uma version antiga tem de falhar com CONTENT_VERSION_CONFLICT.
curl -i -b /tmp/faithflix.cookies \
  -X PATCH \
  -H "Content-Type: application/json" \
  -d '{"status":"archived","expectedVersion":1}' \
  http://localhost:3000/api/catalog/CONTENT_ID/status

curl -i -b /tmp/faithflix.cookies "http://localhost:3000/api/catalog/CONTENT_ID/revisions?page=1&limit=20"

curl -i -b /tmp/faithflix.cookies \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"expectedVersion":2}' \
  http://localhost:3000/api/catalog/CONTENT_ID/revisions/REVISION_ID/revert
```

5. Explicação do código.

A primeira chamada publica deve funcionar sem login. As chamadas de escrita e admin precisam do cookie.

6. Validação do passo.

Resultados esperados:

- `GET /api/catalog` devolve `200`.
- Nenhum item público ou administrativo contém `media`, `source`, `url`,
  `tracks`, `qualityOptions`, `playbackUrl` ou `src` em qualquer nível; testes
  incluem aliases aninhados e valores sentinela.
- Cada item público contém `mediaStatus` e `isPlayable`; conteúdo legado sem estado fica `pending`/`false`.
- `POST /api/catalog` sem cookie devolve `401`.
- `POST /api/catalog` com admin devolve `201`.
- Create, edit, status e revert com body ausente, `null` ou array devolvem
  `400 { code: "INVALID_JSON_BODY", message, requestId }`; nenhum controller
  lê `status`/`expectedVersion` antes do guard e nenhuma escrita é iniciada.
- O conteúdo criado devolve `version: 1`, media vazia, `mediaStatus: "pending"`, tracks vazias e zero quality options, mesmo se o cliente tentar enviar media.
- Create de conteúdo e taxonomia recebem ator/requestId do controller e gravam
  domínio + audit na mesma transação; falha injetada no `auditWriter` deixa
  zero documentos novos em ambas as coleções.
- Catálogo admin e revisões devolvem `{ items, page, limit, total, totalPages }`; `limit > 50` devolve `400`.
- A listagem administrativa devolve sempre uma versão positiva e uma ordem estável para empates através de `_id`.
- Conteudo `draft` nao aparece em `/api/catalog` antes de publicar.
- `PATCH /api/catalog/:id` com qualquer campo de media devolve `400 CATALOG_MEDIA_MUTATION_FORBIDDEN`, indica `details.field` e não cria revisão/audit/escrita.
- Atualizar metadata/assets/taxonomias e reverter uma revisão preservam a media corrente.
- Edição, estado e reversão sem `expectedVersion` numérico devolvem `400` com `EXPECTED_VERSION_REQUIRED`.
- Uma versão obsoleta devolve `409` com `CONTENT_VERSION_CONFLICT` e não cria revisão/audit parcial.
- Repetir `published` com a versão atual preserva `version`, `publishedAt` e a contagem de revisões.
- Conteúdo `published` com `mediaStatus: "pending"` aparece no catálogo com `isPlayable: false`.
- Taxonomia inexistente em `taxonomyIds` devolve `400`.
- Reversao de revisao com admin devolve `200`, repõe o snapshot editorial escolhido e preserva a media corrente.
- O formulário administrativo usa apenas a allowlist editorial; não apresenta
  nem envia campos de reprodução.

7. Cenário negativo/erro esperado.

Se um `draft` aparecer na listagem publica, corrige primeiro o filtro do backend.

##### Snippet técnico aplicável

```js
catalogRouter.get("/", asyncHandler(getCatalog));
catalogRouter.post("/", requireRole(["admin", "moderator"]), asyncHandler(postContent));
```

#### Critérios de aceite

- [ ] `GET /api/catalog` devolve apenas conteudos `published`.
- [ ] Serializers público/admin são allowlists e não transportam containers,
  aliases ou valores sentinela de fontes internas.
- [ ] `POST /api/catalog` exige `admin` ou `moderator`.
- [ ] Create/edit/status/revert validam primeiro um objeto JSON não-null e
  não-array; body ausente/`null` devolve o envelope `400 INVALID_JSON_BODY`.
- [ ] Create força media vazia e `mediaStatus: "pending"`, sem aceitar upload/URL nesta fase.
- [ ] Create de conteúdo e taxonomia propagam `req.user.id`/`req.id` e fazem
  escrita + audit na mesma `session`; falha do audit reverte a criação.
- [ ] Update aceita apenas metadata, assets e taxonomias; campos de media devolvem `400 CATALOG_MEDIA_MUTATION_FORBIDDEN`.
- [ ] Update e revert preservam os dados de reprodução já persistidos; o
  formulário admin não os apresenta nem os envia.
- [ ] Catálogo admin e revisões devolvem `{ items, page, limit, total, totalPages }`, com `limit <= 50` e sort estável por `_id`.
- [ ] `PATCH /api/catalog/:id/status` aceita apenas `draft`, `published` e `archived`.
- [ ] A resposta administrativa inclui `version` e as mutações edit/status/revert exigem `expectedVersion` numérico.
- [ ] Lost update devolve `409 CONTENT_VERSION_CONFLICT` sem revisão, conteúdo ou audit parcial.
- [ ] Publicar novamente o mesmo conteúdo é idempotente e não altera `publishedAt`.
- [ ] `slug` e unico.
- [ ] `taxonomyIds` aceita apenas ObjectIds existentes em `taxonomies`.
- [ ] Alteracoes relevantes geram documento em `content_revisions`.
- [ ] Create de conteúdo/taxonomia, revisão, escrita CAS e audit log fazem
  commit/rollback na respetiva transação.
- [ ] `GET /api/catalog/:id/revisions` lista historico apenas para `admin` ou `moderator`.
- [ ] `POST /api/catalog/:id/revisions/:revisionId/revert` reverte para o snapshot escolhido.
- [ ] `/catalogo` mostra conteudos publicados.
- [ ] `/catalogo` pagina até 24 itens, preserva o filtro e permite repetir uma falha.
- [ ] Trocar página/filtro ou desmontar a rota aborta/ignora a leitura anterior.
- [ ] Slug/ID com `/`, espaço ou `?` gera um único segmento codificado no link de detalhe.
- [ ] `/admin/catalogo` apresenta pesquisa, filtros, estados e paginação antes
  de qualquer formulário; `/novo`, `/:contentId/editar` e `/taxonomias` isolam
  as respetivas tarefas e permitem guardar/cancelar.
- [ ] Arquivo, despublicação e reversão exigem confirmação; cancelar não envia
  pedido e cada ação aplica busy state apenas à linha afetada.
- [ ] Falhas remotas usam mensagens seguras, e conflito de versão recarrega a
  lista sem conservar o formulário obsoleto.

#### Validação final

```bash
npm --prefix backend test
node --test backend/tests/unit/mf2-catalog-body.validation.test.js
npm --prefix frontend run build
```

Regista evidence com respostas de `curl`, screenshot de `/catalogo`, screenshot de `/admin/catalogo` e prova de reversao.

#### Evidence para PR/defesa

- Output de `npm --prefix backend test`.
- Output de `npm --prefix frontend run build`.
- Resposta `curl` de `GET /api/catalog` com apenas conteudos `published`.
- Resposta `curl` de `POST /api/catalog` sem cookie a devolver `401`.
- Resposta `curl` de `POST /api/catalog` com admin a devolver `201`.
- Respostas de create/edit/status/revert com body ausente e `null` a devolver
  `400 INVALID_JSON_BODY` com `requestId`, sem `TypeError` nem escrita.
- Resposta `curl` de taxonomia inexistente a devolver `400`.
- Resposta `curl` de `GET /api/catalog/:id/revisions` com lista de revisoes.
- Resposta `curl` de reversao a devolver `200` e conteudo reposto.
- Resposta `curl` de versão obsoleta a devolver `409 CONTENT_VERSION_CONFLICT`.
- Comparação antes/depois que prove publicação repetida sem nova revisão nem alteração de `publishedAt`.
- Fault injection local num replica set isolado: `auditWriter` lança depois do
  insert de `createContent` e `createTaxonomy`; ambas as contagens permanecem
  inalteradas. Update/revert continuam a provar zero revisão órfã quando o
  domínio ou audit falham.
- Screenshot de `/catalogo` com conteudos publicados.
- Teste comportamental de retry, cancelamento de catálogo/discovery e link de
  detalhe com slug codificado.
- Screenshots de `/admin/catalogo`, `/admin/catalogo/novo`, edição e taxonomias
  para roles autorizadas, provando que a landing é list-first.

#### Handoff

O `BK-MF2-04` deve usar `GET /api/catalog/:idOrSlug` sobre a colecao `contents`, devolvendo apenas conteudos `published` com os campos definidos neste BK. Ao montar a rota de detalhe, mantem `/taxonomies`, `/admin` e `/:id/revisions` antes de `/:idOrSlug`.

##### Próximo BK recomendado

`BK-MF2-04` - Pagina de detalhe de conteudo.

##### Inputs estritos

- Create/update/status/revert recebem objetos JSON. Campos numéricos como
  `durationSeconds`, `ageRating` e `expectedVersion` exigem números JSON reais;
  strings numéricas devolvem `400`. `taxonomyIds` só é array quando o contrato
  desse campo o exige e cada elemento tem de ser uma string válida.
- Filtros e IDs de path são strings escalares; arrays/objetos são recusados.
  `page`/`limit` permanecem strings HTTP de dígitos canónicos e só são
  convertidos depois da validação.
- Títulos, slugs, sinopses e assets acima dos limites devolvem `400`; a API não
  usa truncagem para transformar input inválido em válido.
- As funções de validação dos Passos 1 e 2 implementam estas regras antes de
  qualquer escrita. As conversões `Number(...)` no formulário admin transformam
  inputs controlados do browser em números JSON; o backend volta a validar tipo,
  intervalo e versão sem coagir o payload recebido.

#### Changelog

- `2026-07-12`: checkpoint MF2 distinguido da composição final list-first;
  catálogo admin separado em listagem, criação, edição e taxonomias dentro do shell admin.

- `2026-07-10`: migrado para tutorial v2; o Passo 6 passou a conter a única
  implementação pública paginada, cancelável, repetível e com links codificados.
- 2026-05-31: Alinhados criterios, evidence, handoff e changelog com o contrato do guia.
- 2026-05-31: Completado `RF10` com validacao de taxonomias, listagem de revisoes e reversao por roles autorizadas.
- 2026-07-09: Catálogo público alinhado com `mediaStatus`/`isPlayable` e zero fontes de reprodução.
- 2026-07-10: Contrato admin endurecido com `version`/`expectedVersion`, CAS, `409 CONTENT_VERSION_CONFLICT`, transações e publicação idempotente.
- 2026-07-10: Mutações admin limitadas a metadata/assets/taxonomias, media read-only, create `pending`, rejeição estável de campos media e paginação admin/revisões até 50 itens.
- 2026-07-10: Catálogo público alinhado com paginação até 24, cancelamento/anti-stale, retry independente de discovery e links com slug/ID codificado.
- 2026-07-10: create de conteúdo/taxonomia passou a propagar ator/requestId e
  a persistir domínio + audit na mesma transação, com seam e casos de fault
  injection para provar rollback total.
