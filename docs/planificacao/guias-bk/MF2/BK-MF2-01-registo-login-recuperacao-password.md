# BK-MF2-01 - Registo, login e recuperacao de password

## Header

- `doc_id`: `GUIA-BK-MF2-01`
- `bk_id`: `BK-MF2-01`
- `macro`: `MF2`
- `owner`: `Matheus`
- `apoio`: `Mateus`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `L`
- `dependencias`: `BK-MF1-06`
- `rf_rnf`: `RF01, RF02, RF05`
- `fase_documental`: `Fase 1`
- `sprint`: `S02`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF2-02`
- `guia_path`: `docs/planificacao/guias-bk/MF2/BK-MF2-01-registo-login-recuperacao-password.md`
- `last_updated`: `2026-07-12`

#### Objetivo

Neste BK vais implementar a identidade base da FaithFlix: registo de utilizador (`RF01`), login com sessao segura (`RF02`) e recuperacao de password (`RF05`).

No fim, deves conseguir explicar como um visitante passa a utilizador autenticado, como o backend reconhece esse utilizador nos pedidos seguintes e porque a aplicacao nao guarda passwords nem tokens sensiveis no browser.

#### Importância

Identidade e a porta de entrada da aplicacao. Sem esta entrega, os BKs de perfil, roles, playback, favoritos, historico, subscricoes e privacidade nao conseguem aplicar ownership nem autorizacao.

#### Scope-in

- Acrescentar `users`, `password_reset_tokens` e a outbox PAP dev-only com TTL à
  persistência MongoDB, estendendo sem substituir `sessions` criada na `MF1`.
- Guardar passwords com hash seguro usando `node:crypto`.
- Criar sessoes com token opaco em cookie `HttpOnly`.
- Reutilizar o middleware de sessão da `MF1`, que já preenche `req.user`, limpa
  cookies inválidos e conserva o token bruto apenas em `req.session.rawToken`.
- Criar endpoints de registo, login, sessao atual, logout, pedido de recuperacao e reset de password.
- Criar o cliente frontend de auth e a pagina de login/registo.
- Criar um contexto de sessão que distingue ausência de sessão de indisponibilidade da API e valida qualquer destino `next` antes de navegar.

#### Scope-out

- Login social.
- Envio real de email.
- Subscricoes e pagamentos.
- Perfis familiares avancados.
- Area admin.
- Autenticacao multifator.

#### Estado antes e depois

- Antes: o frontend não dispõe de identidade persistente nem de uma fonte única
  para saber quem está autenticado.
- Depois: registo, login, sessão, logout e recuperação usam cookies HttpOnly,
  persistência server-side, limites de abuso e estados frontend explícitos.

#### Pré-requisitos

- `BK-MF1-06` concluído, com smoke tests da MF1 verdes ou bloqueios registados.
- `BK-MF1-04` entregou `sessionConfig`, opções/limpeza de cookie, `readCookie` e
  `attachSession`.
- `BK-MF1-03` entregou `apiClient` com `credentials: "include"`.
- Backend Express em `backend/` e frontend React/Vite em `frontend/`.
- MongoDB acessível numa topologia transacional (`replica set`, Atlas ou cluster
  `sharded` compatível); um `standalone` não satisfaz o registo/reset atómicos.

#### Glossário

- `Utilizador`: pessoa registada na FaithFlix.
- `Sessao`: ligacao segura entre browser e backend depois do login.
- `Cookie HttpOnly`: cookie que o JavaScript do browser nao consegue ler.
- `Token opaco`: string aleatoria sem dados pessoais dentro.
- `Hash`: valor derivado de um segredo que permite verificar sem guardar o segredo original.
- `Reset token`: token temporario usado para trocar a password.

#### Conceitos teóricos essenciais

- Autenticacao responde a pergunta "quem e este utilizador?".
- A password entra no backend apenas para ser validada; depois disso fica guardado apenas `passwordHash`.
- O browser guarda apenas o cookie de sessao. A sessao real fica no servidor, na colecao `sessions`.
- `req.user` passa a ser a fonte tecnica usada pelos BKs seguintes para ownership e roles.
- O pedido de recuperacao devolve uma mensagem generica para nao revelar se um email existe.

##### Contrato backend e segurança

- Sessões e cookie expiram ao fim de `24 h`, a partir da mesma constante.
- Resolver uma sessão aceita apenas `accountStatus: "active"` ou documento legacy
  sem o campo. `inactive`, `blocked`, `deleted` e qualquer estado desconhecido
  apagam a sessão e devolvem utilizador nulo.
- Registo e sessão inicial fazem commit juntos. Se o driver terminar com
  `UnknownTransactionCommitResult`, o service só devolve sucesso depois de
  reencontrar exatamente o `_id` e o hash do token criados nessa tentativa;
  nunca confunde uma conta anterior com a reconciliação.
- Registo, login, pedido de reset e consumo do token têm rate limiting persistido
  em MongoDB. As chaves de IP, email ou token são pseudonimizadas com HMAC e os
  contadores expiram por TTL.
- O registo aceita, no máximo, 5 pedidos por IP em uma hora. O reset aceita 10
  pedidos por IP em uma hora e 5 tentativas por token em 15 minutos.
- O login aplica dois limites complementares: por IP e por email. Respostas `429`
  usam `code: "RATE_LIMITED"`, `Retry-After` e não revelam o identificador usado.
- O login limita 5 falhas por email e 20 pedidos por IP em 15 minutos. Cada
  tentativa que atravessa os limites executa uma verificação `scrypt`, mesmo se
  o utilizador não existir ou estiver indisponível, para reduzir enumeração por
  diferença temporal sem permitir autenticação contra o hash dummy.
- A recuperação aplica cumulativamente 10 pedidos por IP e 3 por email em uma
  hora; o limite por IP é verificado primeiro e a resposta funcional continua
  genérica.
- Tanto email existente como inexistente cria uma entrada TTL em
  `password_reset_tokens`. A entrada inexistente fica `dummy:true`, sem
  `userId`, email ou PII; nunca passa no consumo nem entra na outbox dev-only.
  Isto uniformiza o custo de persistência sem criar uma conta ou token útil.
- O reset reclama o token de forma atómica dentro de uma transação. Depois de
  atualizar a password, revoga todos os restantes tokens de reset e todas as
  sessões do utilizador.
- Um token consumido ou uma corrida concorrente devolve
  `RESET_TOKEN_INVALID`; nunca existem dois resets bem-sucedidos para o mesmo token.
- O endpoint público de recuperação continua genérico e o canal PAP de consulta
  do token continua estritamente dev-only, desligado por defeito e proibido em produção.

##### Contrato frontend e sessão

- `GET /api/session/me` sem sessão responde `200 { "user": null }`; não é um erro.
- O contexto usa quatro estados fechados: `loading`, `authenticated`, `anonymous`
  e `unavailable`. Rede indisponível ou `5xx` não significa logout e não autoriza
  mostrar áreas públicas como se o cookie tivesse sido revogado.
- Um `401` limpa a sessão e o token CSRF em memória. `POST /api/session/logout`
  devolve `204`; depois do sucesso, a UI limpa o contexto e navega para `/`.
- Registo e login chamam `refreshSession()` antes de navegar. Um `next` interno
  seguro tem precedência; sem ele, `admin` entra em `/admin`, `moderator` em
  `/admin/catalogo` e as restantes contas em `/`. `//`, backslash, protocolo,
  input malformado e caracteres de controlo são sempre recusados.
- O destino validado fica apenas em memória/URL. Tokens de sessão e CSRF nunca
  são guardados em `localStorage` ou `sessionStorage`.

##### Tempo estimado

- Leitura das dependencias e contratos: 20 min.
- Backend de auth e sessao: 110 min.
- Frontend de auth: 60 min.
- Validacao, negativos e evidence: 45 min.
- Remediacao: se o fluxo completo bloquear, fechar primeiro `register`, `login`, `me` e `logout`; depois terminar recuperacao de password.

##### Erros comuns

- Guardar a password em texto claro.
- Guardar token em `localStorage`.
- Criar cookie sem `HttpOnly`.
- Devolver `passwordHash`, `tokenHash` ou `resetTokenHash` nas respostas.
- Usar `req.session.user` num BK e `req.user` noutro sem os alinhar.
- Tratar falha de rede em `/api/session/me` como visitante anónimo.
- Navegar diretamente para o valor bruto de `next` e permitir open redirect.

##### Check de compreensão

- [ ] Sei explicar o fluxo `register -> cookie -> me -> logout`.
- [ ] Sei porque a password precisa de hash.
- [ ] Sei porque `req.user` deve vir da sessao e nao de um ID enviado pelo frontend.
- [ ] Sei testar reset de password sem revelar se o email existe.

#### Arquitetura do BK

| Area | Contrato |
| --- | --- |
| Persistencia | MongoDB com `users`, `sessions`, `password_reset_tokens`; `password_reset_dev_outbox` existe apenas como canal PAP opt-in e TTL |
| Password | `scrypt` com salt aleatorio |
| Sessao | token opaco em cookie `HttpOnly`; no MongoDB fica apenas `tokenHash` |
| User publico | `id`, `name`, `email`, `role` |
| Registo | `POST /api/auth/register` |
| Login | `POST /api/auth/login` |
| Sessao atual | `GET /api/session/me` |
| Logout | `POST /api/session/logout` |
| Recuperacao | `POST /api/auth/forgot-password`, `POST /api/auth/reset-password` |
| Frontend | `SessionContext`, `authApi`, `AuthForms`, `authRedirect`, rota `/login` |
| Estado de sessão | `loading|authenticated|anonymous|unavailable`; `401` limpa, rede/`5xx` preserva estado indisponível |
| Navegação após auth | `next` interno seguro; sem ele, landing por role através de `resolveAuthenticatedPath(...)` |

##### Decisões técnicas

- `CANONICO`: a sessao autenticada usa cookie `HttpOnly`, alinhado com `RNF15`.
- `CANONICO`: a base de dados principal do MVP e MongoDB.
- `DERIVADO`: usa-se token opaco em vez de JWT para manter dados de sessao no servidor e reduzir exposicao no browser.
- `DERIVADO`: o endpoint publico de recuperacao devolve sempre uma mensagem generica. O token bruto de reset nunca deve ser exposto na resposta publica nem apresentado pelo frontend; se for preciso demonstra-lo em contexto PAP, usa um canal dev-only separado e controlado.
- `DERIVADO`: a outbox PAP é desligada por defeito e proibida em produção;
  recebe apenas tokens de contas reais, nunca documentos dummy, e é consultada
  por uma CLI explícita que não pertence à API HTTP.

#### Ficheiros a criar/editar/rever

- Criar/rever configuração MongoDB, ambiente e índices em `backend/src/config/`.
- Acrescentar os ficheiros de autenticação em `backend/src/modules/auth/`.
- Criar `backend/scripts/show-dev-reset-token.js` e acrescentar apenas o script
  npm `dev:reset-token`, sem alterar os restantes scripts.
- Estender o service de sessão e a montagem Express sem substituir middleware,
  controller, router ou CSRF da `MF1`.
- Criar `frontend/src/services/api/authApi.js`, contexto de sessão, formulários,
  helper de redirecionamento seguro e rota `/login`.
- Criar testes backend para fluxos, rate limiting, reset atómico e negativos.

#### Tutorial técnico linear

### Passo 1 - Acrescentar rate limiter e canal PAP dev-only à configuração

1. Objetivo funcional do passo no contexto da app.

Acrescentar o segredo HMAC dos contadores e o opt-in estrito da outbox PAP sem
substituir a configuração fail-closed criada nos `BK-MF1-04` e `BK-MF1-05`.

2. Ficheiros envolvidos.
    - EDITAR: `backend/.env.example`
    - EDITAR: `backend/src/config/env.js`
    - REVER: `backend/package.json`
    - LOCALIZACAO: acrescentar duas variáveis e parsers; não substituir os ficheiros cumulativos da `MF1`

3. Instruções do que fazer.

`mongodb` já foi acrescentado no `BK-MF1-04`; não voltes a declarar nem
reescrever `package.json`. Acrescenta `RATE_LIMIT_PEPPER` e a flag desligada ao
exemplo de ambiente. Em `env.js`, mantém `mongodbUri`, `mongodbDbName`, `frontendOrigins`,
`sessionCookieName`, as opções de HTTPS/trusted proxy introduzidas na fundação e
a ausência de fallbacks para MongoDB. Acrescenta o parser e a propriedade
abaixo ao ficheiro existente. A aplicação deve falhar no arranque se o segredo
estiver ausente ou tiver menos de 32 caracteres. A flag só aceita `true|false`,
usa `false` por defeito e deve impedir o arranque se for ativada em produção.

4. Código completo, correto e integrado com a app final.

`backend/.env.example`

```env
# Acrescentar à configuração cumulativa; nunca preencher este segredo no repositório.
RATE_LIMIT_PEPPER=
ENABLE_DEV_RESET_TOKEN_OUTBOX=false
```

Adição em `backend/src/config/env.js`, junto dos restantes parsers:

```js
function parseRateLimitPepper(value) {
  // O pepper é independente de passwords, tokens e nomes de bases de dados.
  if (typeof value !== "string" || value.length < 32) {
    throw new Error("RATE_LIMIT_PEPPER deve ter pelo menos 32 caracteres.");
  }

  return value;
}

function parseDevResetOutbox(value, nodeEnv) {
  const normalized = value?.trim() || "false";

  if (!new Set(["true", "false"]).has(normalized)) {
    throw new Error("ENABLE_DEV_RESET_TOKEN_OUTBOX deve ser true ou false.");
  }

  const enabled = normalized === "true";
  if (enabled && nodeEnv === "production") {
    throw new Error("ENABLE_DEV_RESET_TOKEN_OUTBOX e proibida em producao.");
  }

  return enabled;
}
```

Antes do `Object.freeze` já exportado como `env`, calcula o valor uma vez:

```js
// `required` já existe no ficheiro e impede um fallback partilhado.
const rateLimitPepper = parseRateLimitPepper(required("RATE_LIMIT_PEPPER"));
const enableDevResetTokenOutbox = parseDevResetOutbox(
  process.env.ENABLE_DEV_RESET_TOKEN_OUTBOX,
  process.env.NODE_ENV ?? "development",
);
```

Depois acrescenta as propriedades shorthand `rateLimitPepper,` e
`enableDevResetTokenOutbox,` dentro do objeto `env`, sem remover ou renomear
qualquer propriedade existente.

5. Explicação do código.

`RATE_LIMIT_PEPPER` serve apenas para pseudonimizar IP, email e token antes de
estes entrarem nos contadores. A alteração é deliberadamente aditiva: mantém a
URI e o nome explícitos da base, as origins validadas, o cookie, HTTPS, trusted
proxy, scripts e versões já definidos na `MF1`. A flag de outbox não contém o
token; apenas decide se a ferramenta PAP local pode persistir uma cópia TTL.

6. Validação do passo.

Dentro de `backend/`, com a configuração cumulativa preenchida, executa:

```bash
node --check src/config/env.js
node --env-file=.env -e "import('./src/config/env.js').then(({ env }) => console.log(Boolean(env.rateLimitPepper), env.enableDevResetTokenOutbox === false))"
```

Resultado esperado com a flag desligada: sintaxe válida e `true true`, sem
imprimir o segredo ou qualquer token.

7. Cenário negativo/erro esperado.

Sem `RATE_LIMIT_PEPPER`, ou com menos de 32 caracteres, importar `env.js` deve
falhar. Uma flag diferente de `true|false`, ou `true` em produção, também deve
falhar. Nunca resolvas estes erros com valores permissivos no código.

### Passo 2 - Reutilizar a ligacao MongoDB e criar indices de auth

1. Objetivo funcional do passo no contexto da app.

Reutilizar a ligação, os índices de sessão e o helper transacional criados no
`BK-MF1-04`, acrescentando apenas índices para email, reset e outbox PAP TTL.

2. Ficheiros envolvidos.
    - REVER: `backend/src/config/database.js`
    - CRIAR: `backend/src/modules/auth/auth.indexes.js`
    - LOCALIZACAO: preservar integralmente `getDb`, `runInTransaction`, `pingDatabase` e `closeDatabase`; criar apenas o ficheiro de índices

3. Instruções do que fazer.

Não substituas `database.js`: a versão cumulativa do `BK-MF1-04` já exporta
`getMongoClient`, `getDb`, `runInTransaction`, `pingDatabase` e
`closeDatabase`. `ensureSessionIndexes()` continua autoritativo para
`sessions`. Cria apenas o service de índices de utilizador e reset, chamado
antes das operações de autenticação.

4. Código completo, correto e integrado com a app final.

`backend/src/modules/auth/auth.indexes.js`

```js
import { getDb } from "../../config/database.js";

/** Garante os índices de identidade, reset e expiração antes de autenticar. */
export async function ensureAuthIndexes() {
  const db = await getDb();

  // Os índices únicos fecham corridas de registo e impedem reutilizar tokens de reset.

  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("password_reset_tokens").createIndex({ tokenHash: 1 }, { unique: true });
  await db.collection("password_reset_tokens").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await db.collection("password_reset_tokens").createIndex({ userId: 1 });
  await db.collection("password_reset_dev_outbox").createIndex(
    { userId: 1, createdAt: -1 },
  );
  await db.collection("password_reset_dev_outbox").createIndex(
    { resetTokenId: 1 },
    { unique: true },
  );
  await db.collection("password_reset_dev_outbox").createIndex(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 },
  );
}
```

5. Explicação do código.

`getDb()` continua a vir da fundação cumulativa, sem apagar o helper
transacional nem os hooks de health/shutdown. Os índices garantem que dois
utilizadores não partilham o mesmo email, que um token não tem dois documentos
e que os resets expirados podem ser limpos pelo MongoDB. Os índices de sessão
continuam no service criado na `MF1`. A outbox não indexa email: resolve a conta
primeiro e consulta por `userId`; `resetTokenId` liga a cópia temporária ao
pedido e o TTL limita a exposição do token bruto ao mesmo prazo do reset.

6. Validação do passo.

Com MongoDB ativo, executa:

```bash
node --env-file=.env -e "import('./src/modules/auth/auth.indexes.js').then((m) => m.ensureAuthIndexes())"
```

Resultado esperado: o comando termina sem erro.

7. Cenário negativo/erro esperado.

Sem indice unico em `users.email`, dois registos com o mesmo email poderiam criar logins ambiguos.

### Passo 3 - Criar validação e passwords e estender o token canónico

1. Objetivo funcional do passo no contexto da app.

Validar input de auth, criar hashes de password e reutilizar o serviço de token
opaco entregue pela `MF1` para sessões, CSRF e reset.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/auth/auth.validation.js`
    - CRIAR: `backend/src/modules/auth/auth.password.js`
    - EDITAR: `backend/src/modules/auth/token.service.js`
    - LOCALIZACAO: criar os dois primeiros ficheiros e acrescentar apenas `isOpaqueToken` ao serviço canónico

3. Instruções do que fazer.

Cria validação e passwords. Não cries `token.js`: `token.service.js` já contém
`createOpaqueToken`, `hashOpaqueToken` e `safeHashEquals`. Acrescenta-lhe apenas
o validador de formato usado no reset, mantendo base64url e o mesmo hash das
sessões/CSRF.

4. Código completo, correto e integrado com a app final.

`backend/src/modules/auth/auth.validation.js`

```js
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Centralizar erros de validação mantém o mesmo contrato HTTP em todos os fluxos de autenticação.

function httpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

export function assertAuthPayload(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw httpError("O body deve ser um objeto JSON.");
  }

  return input;
}

export function normalizeEmail(email) {
  // A normalização antecede validação e persistência para a unicidade não depender de maiúsculas.
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

export function assertValidName(name) {
  const value = typeof name === "string" ? name.trim() : "";
  if (value.length < 2 || value.length > 80) {
    throw httpError("O nome deve ter entre 2 e 80 caracteres.");
  }
  return value;
}

export function assertValidEmail(email) {
  const value = normalizeEmail(email);
  if (value.length > 254 || !EMAIL_PATTERN.test(value)) {
    throw httpError("Email invalido.");
  }
  return value;
}

export function assertValidPassword(password) {
  if (typeof password !== "string") {
    throw httpError("A password deve ter entre 10 e 128 caracteres.");
  }

  if (password.length < 10 || password.length > 128) {
    throw httpError("A password deve ter entre 10 e 128 caracteres.");
  }
  return password;
}
```

`backend/src/modules/auth/auth.password.js`

```js
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;

// Cada password recebe um salt aleatório; apenas o derivado é persistido.

export async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = await scrypt(password, salt, KEY_LENGTH);
  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password, storedHash) {
  const [salt, storedKey] = String(storedHash ?? "").split(":");
  if (!salt || !storedKey) return false;

  const derivedKey = await scrypt(password, salt, KEY_LENGTH);
  const storedBuffer = Buffer.from(storedKey, "hex");

  if (storedBuffer.length !== derivedKey.length) return false;
  return timingSafeEqual(storedBuffer, derivedKey);
}
```

Adição em `backend/src/modules/auth/token.service.js`:

```js
export function isOpaqueToken(token) {
  // Trinta e dois bytes em base64url produzem exatamente 43 caracteres sem padding.
  return typeof token === "string" && /^[A-Za-z0-9_-]{43}$/u.test(token);
}
```

5. Explicação do código.

A validação aceita apenas strings reais, limita o email normalizado a 254
caracteres e a password a 10-128 caracteres. Não usa coerções para transformar
arrays, objetos ou números em credenciais. `hashPassword` guarda `salt:hash`,
não a password original. `timingSafeEqual` reduz risco de ataques por tempo de
comparação. Sessões, CSRF e reset partilham `createOpaqueToken()` e
`hashOpaqueToken()`; não existem dois formatos ou funções de hash paralelos.

6. Validação do passo.

Executa:

```bash
node --check src/modules/auth/auth.validation.js
node --check src/modules/auth/auth.password.js
node --check src/modules/auth/token.service.js
```

Resultado esperado: os três comandos terminam com exit code `0`.

7. Cenário negativo/erro esperado.

Se criares um segundo `token.js` ou guardares o token de reset em texto claro,
o reset deixa de partilhar o contrato de sessão e uma fuga da base permite usar
credenciais ainda válidas.

### Passo 4 - Estender a sessão cumulativa sem substituir CSRF ou middleware

1. Objetivo funcional do passo no contexto da app.

Permitir que o registo crie utilizador e sessão na mesma transação e exportar o
DTO público, mantendo todo o ciclo de sessão entregue na `MF1`.

2. Ficheiros envolvidos.
    - EDITAR: `backend/src/modules/auth/session.service.js`
    - REVER SEM ALTERAR: `backend/src/middlewares/session.middleware.js`
    - REVER SEM ALTERAR: `backend/src/modules/auth/csrf.service.js`
    - REVER SEM ALTERAR: `backend/src/modules/auth/session.routes.js`
    - LOCALIZACAO: substituir apenas as funções explicitamente indicadas no service

3. Instruções do que fazer.

Não substituas o service nem o middleware. No service existente, torna
`collections` capaz de usar a `db` da transação, exporta a allowlist como
`toPublicUser`, atualiza a sua chamada em `resolveSession` e permite
`createSession(userId, { db, session })`. Conserva `SESSION_TTL_MS`, campos
CSRF, índices, `deleteSession`, `deleteUserSessions` e todas as opções
`{ session }`. O middleware mantém `req.session.rawToken`, limpa cookie inválido
e continua a preencher `req.user`. O router mantém `/me`, `/csrf-token` e
logout protegido.

4. Código completo, correto e integrado com a app final.

Substitui apenas `collections`, o antigo `publicUser`, `createSession` e
`resolveSession` em `backend/src/modules/auth/session.service.js` por estas
versões completas; mantém os imports e restantes exports da `MF1`:

```js
async function collections(db = null) {
  // A DB injetada garante que a sessão é escrita pela mesma ClientSession do utilizador.
  const selectedDb = db ?? await getDb();
  return {
    sessions: selectedDb.collection("sessions"),
    users: selectedDb.collection("users"),
  };
}

export function toPublicUser(user) {
  // A allowlist nunca devolve hashes, tokens, estados internos ou dados de cobrança.
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

function canAuthenticate(user) {
  if (!user) return false;
  return (user.accountStatus ?? "active") === "active"
    && (user.status ?? "active") === "active";
}

export async function createSession(
  userId,
  { db = null, session = null } = {},
) {
  const { sessions } = await collections(db);
  const rawToken = createOpaqueToken();
  const now = new Date();

  await sessions.insertOne(
    {
      tokenHash: hashOpaqueToken(rawToken),
      userId,
      createdAt: now,
      expiresAt: new Date(now.getTime() + SESSION_TTL_MS),
      csrfTokenHash: null,
      csrfTokenHashes: [],
      csrfRotatedAt: null,
    },
    { session },
  );

  return rawToken;
}

export async function resolveSession(rawToken) {
  // A leitura continua a validar a expiração porque o monitor TTL não é imediato.
  if (!rawToken) return null;

  const { sessions, users } = await collections();
  const sessionDocument = await sessions.findOne({
    tokenHash: hashOpaqueToken(rawToken),
    expiresAt: { $gt: new Date() },
  });

  if (!sessionDocument) return null;

  const user = await users.findOne({ _id: sessionDocument.userId });

  if (!canAuthenticate(user)) {
    // Revogar o documento impede que uma conta bloqueada volte a ser resolvida.
    await sessions.deleteOne({ _id: sessionDocument._id });
    return null;
  }

  return {
    id: sessionDocument._id.toString(),
    user: toPublicUser(user),
  };
}
```

Confirma que `backend/src/middlewares/session.middleware.js` permanece com as
invariantes cumulativas abaixo; não cries outro middleware:

```js
// Acrescenta `hasCookie` ao import cumulativo de `../utils/cookies.js`.
const cookieWasPresented = hasCookie(req, sessionConfig.cookieName);
const rawToken = readCookie(req, sessionConfig.cookieName);
const resolved = await resolveSession(rawToken);

// O token bruto existe apenas durante o pedido e só quando a sessão foi resolvida.
req.session = {
  isAuthenticated: Boolean(resolved),
  id: resolved?.id ?? null,
  rawToken: resolved ? rawToken : null,
};
req.user = resolved?.user ?? null;

if (cookieWasPresented && !resolved) {
  clearSessionCookie(res, sessionConfig.cookieName, sessionConfig.cookie);
}
```

Confirma também que `backend/src/modules/auth/session.routes.js` conserva as
três rotas da fundação:

```js
// A identidade é pública; emissão de CSRF e logout exigem uma sessão válida.
sessionRouter.get("/me", getCurrentSession);
sessionRouter.get("/csrf-token", requireAuth, asyncHandler(getCsrfToken));
sessionRouter.post("/logout", requireAuth, asyncHandler(logout));
```

5. Explicação do código.

A única capacidade nova é injetar a `db` e a `ClientSession` já ativas durante
o registo. O documento continua a guardar apenas `tokenHash`, conserva o TTL
absoluto de 24 horas e nasce com o estado CSRF canónico. O middleware e o router
não são reimplementados, logo a limpeza de cookies inválidos, o histórico CSRF
limitado a quatro hashes e `GET /api/session/csrf-token` permanecem funcionais.

6. Validação do passo.

Executa `node --check src/modules/auth/session.service.js` e revê estaticamente
que `createSession` recebe `userId`, `{ db, session }`, mantém os três campos
CSRF e passa `{ session }` a `insertOne`.

7. Cenário negativo/erro esperado.

Se substituíres o middleware ou o service por uma versão simplificada, podes
perder `rawToken`, rotação CSRF, limpeza de cookie, TTL ou participação na
transação. Qualquer uma dessas perdas bloqueia este BK.

### Passo 5 - Criar o service de autenticacao

1. Objetivo funcional do passo no contexto da app.

Implementar regras de negocio para registo, login e recuperacao de password.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/auth/auth.service.js`
    - CRIAR: `backend/scripts/show-dev-reset-token.js`
    - EDITAR: `backend/package.json`
    - LOCALIZACAO: service/CLI completos e uma entrada aditiva em `scripts`

3. Instruções do que fazer.

Cria o service e a CLI abaixo. O service usa os utilitários anteriores; a CLI
é o único consumidor dev-only da função de consulta e nunca é montada na API.

4. Código completo, correto e integrado com a app final.

```js
import { getDb, runInTransaction } from "../../config/database.js";
import { env } from "../../config/env.js";
import { hashPassword, verifyPassword } from "./auth.password.js";
import { ensureAuthIndexes } from "./auth.indexes.js";
import {
  assertAuthPayload,
  assertValidEmail,
  assertValidName,
  assertValidPassword,
} from "./auth.validation.js";
import { createSession, toPublicUser } from "./session.service.js";
import {
  createOpaqueToken,
  hashOpaqueToken,
  isOpaqueToken,
} from "./token.service.js";

const RESET_TTL_MS = 1000 * 60 * 30;
const PASSWORD_HASH_PATTERN = /^[a-f0-9]{32}:[a-f0-9]{128}$/i;
const DUMMY_LOGIN_PASSWORD = "faithflix-login-dummy-not-a-credential";
const DUMMY_LOGIN_PASSWORD_HASH =
  "6661697468666c69782d617574682d31:c1b23e369fa188e56b73762de813e69fd650766ad66d10809525c0b9726e2d64c53464bca9af1c24153dd7217edf26cbb3b960836fe8c11b7864455ee338d691";
const PASSWORD_RESET_RESPONSE = Object.freeze({
  message: "Se o email existir, foi criado um pedido de recuperacao.",
});

function canLogin(user) {
  if (!user) return false;

  // Durante a transição de schema, qualquer estado explícito não ativo falha fechado.
  return (user.accountStatus ?? "active") === "active"
    && (user.status ?? "active") === "active";
}

function hasSupportedPasswordHash(passwordHash) {
  return typeof passwordHash === "string" && PASSWORD_HASH_PATTERN.test(passwordHash);
}

function httpError(message, statusCode, code = undefined) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

function isUnknownTransactionCommitResult(error) {
  return typeof error?.hasErrorLabel === "function"
    && error.hasErrorLabel("UnknownTransactionCommitResult");
}

/**
 * Reconcilia exclusivamente o utilizador e a sessão criados por esta tentativa.
 * Uma conta anterior com o mesmo email não satisfaz `_id` e `tokenHash`.
 */
async function reconcileUnknownRegistration(email, attempted) {
  if (!attempted) return null;

  const db = await getDb();
  const user = await db.collection("users").findOne({ email });

  if (!user || String(user._id) !== String(attempted.user._id)) {
    return null;
  }

  const storedSession = await db.collection("sessions").findOne({
    userId: user._id,
    tokenHash: hashOpaqueToken(attempted.token),
    expiresAt: { $gt: new Date() },
  });

  return storedSession
    ? { user: toPublicUser(user), token: attempted.token }
    : null;
}

async function writeDevResetOutbox(
  db,
  { userId, resetTokenId, resetToken, createdAt, expiresAt },
) {
  // Defesa em profundidade: o parser de env já impede esta combinação.
  if (!env.enableDevResetTokenOutbox || env.nodeEnv === "production") return;

  await db.collection("password_reset_dev_outbox").insertOne({
    userId,
    resetTokenId,
    resetToken,
    createdAt,
    expiresAt,
  });
}

/**
 * Consulta controlada para a CLI PAP; nunca é montada numa rota HTTP.
 */
export async function getLatestDevPasswordResetToken(emailInput) {
  if (!env.enableDevResetTokenOutbox || env.nodeEnv === "production") {
    throw httpError("Canal dev-only de reset desativado.", 404, "NOT_FOUND");
  }

  const email = assertValidEmail(emailInput);
  const db = await getDb();
  const user = await db.collection("users").findOne(
    { email },
    { projection: { _id: 1 } },
  );

  if (!user) {
    throw httpError("Token dev-only nao encontrado.", 404, "NOT_FOUND");
  }

  const entry = await db.collection("password_reset_dev_outbox").findOne(
    { userId: user._id, expiresAt: { $gt: new Date() } },
    {
      sort: { createdAt: -1 },
      projection: { _id: 0, resetToken: 1, expiresAt: 1 },
    },
  );

  if (!entry) {
    throw httpError("Token dev-only nao encontrado.", 404, "NOT_FOUND");
  }

  return { resetToken: entry.resetToken, expiresAt: entry.expiresAt };
}

export async function registerUser(input) {
  await ensureAuthIndexes();

  const payload = assertAuthPayload(input);
  const name = assertValidName(payload.name);
  const email = assertValidEmail(payload.email);
  const password = assertValidPassword(payload.password);
  // Calcula scrypt antes da transação para não prolongar locks nem repetir a
  // derivação se o driver repetir uma tentativa transiente.
  const passwordHash = await hashPassword(password);
  let attemptedRegistration = null;

  try {
    return await runInTransaction(async ({ db, session }) => {
      const now = new Date();
      const document = {
        name,
        email,
        passwordHash,
        role: "user",
        accountStatus: "active",
        parentalMaxAgeRating: 18,
        createdAt: now,
        updatedAt: now,
      };
      const result = await db.collection("users").insertOne(document, { session });
      const user = { ...document, _id: result.insertedId };
      const token = await createSession(user._id, {
        db,
        session,
      });
      attemptedRegistration = { user, token };

      return {
        user: toPublicUser(user),
        token,
      };
    });
  } catch (error) {
    if (isUnknownTransactionCommitResult(error)) {
      const reconciled = await reconcileUnknownRegistration(
        email,
        attemptedRegistration,
      );
      if (reconciled) return reconciled;
    }

    if (error.code === 11000) {
      throw httpError("Este email ja esta registado.", 409);
    }
    throw error;
  }
}

export async function loginUser(input, options = {}) {
  const payload = assertAuthPayload(input);
  const email = assertValidEmail(payload.email);
  const passwordIsString = typeof payload.password === "string";
  const password = passwordIsString ? payload.password : "";
  const db = await getDb();
  const user = await db.collection("users").findOne({ email });
  const passwordHasSafeLength = passwordIsString
    && password.length >= 10
    && password.length <= 128;
  const accountCanLogin = canLogin(user);
  const realHashIsUsable =
    accountCanLogin && hasSupportedPasswordHash(user.passwordHash);

  // Executa exatamente uma derivação scrypt também quando a conta não existe
  // ou não pode autenticar. Os gates abaixo impedem login contra o hash dummy.
  const passwordMatches = await verifyPassword(
    passwordHasSafeLength ? password : DUMMY_LOGIN_PASSWORD,
    realHashIsUsable ? user.passwordHash : DUMMY_LOGIN_PASSWORD_HASH,
  );

  if (!passwordHasSafeLength) {
    throw httpError("A password deve ter entre 10 e 128 caracteres.", 400);
  }

  if (
    !accountCanLogin ||
    !realHashIsUsable ||
    !passwordMatches
  ) {
    throw httpError("Credenciais invalidas.", 401);
  }

  // Um sucesso liberta a reserva de falhas antes de criar a nova sessão.
  await options.onAuthenticated?.();
  return {
    user: toPublicUser(user),
    token: await createSession(user._id),
  };
}

export async function requestPasswordReset(input) {
  await ensureAuthIndexes();
  const payload = assertAuthPayload(input);
  const email = assertValidEmail(payload.email);
  const db = await getDb();
  const user = await db.collection("users").findOne({ email });
  const resetToken = createOpaqueToken();
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + RESET_TTL_MS);
  const result = await db.collection("password_reset_tokens").insertOne({
    ...(user ? { userId: user._id } : {}),
    dummy: !user,
    tokenHash: hashOpaqueToken(resetToken),
    usedAt: null,
    createdAt,
    expiresAt,
  });

  // A resposta, os logs e os documentos dummy nunca recebem o token bruto.
  if (user) {
    await writeDevResetOutbox(db, {
      userId: user._id,
      resetTokenId: result.insertedId,
      resetToken,
      createdAt,
      expiresAt,
    });
  }

  return { ...PASSWORD_RESET_RESPONSE };
}

export async function resetPassword(input) {
  const payload = assertAuthPayload(input);
  const token = typeof payload.token === "string" ? payload.token.trim() : "";
  const password = assertValidPassword(payload.password);

  if (!isOpaqueToken(token)) {
    throw httpError(
      "Token de recuperacao invalido ou expirado.",
      400,
      "RESET_TOKEN_INVALID",
    );
  }

  const tokenHash = hashOpaqueToken(token);
  const lookupDb = await getDb();
  const availableReset = await lookupDb.collection("password_reset_tokens").findOne(
    {
      tokenHash,
      dummy: { $ne: true },
      usedAt: null,
      expiresAt: { $gt: new Date() },
    },
    { projection: { _id: 1 } },
  );

  if (!availableReset) {
    throw httpError(
      "Token de recuperacao invalido ou expirado.",
      400,
      "RESET_TOKEN_INVALID",
    );
  }

  // O custo de scrypt fica fora da callback, depois de provar que o token existe.
  const passwordHash = await hashPassword(password);

  await runInTransaction(async ({ db, session }) => {
    const now = new Date();
    const resetTokens = db.collection("password_reset_tokens");
    const claimedResult = await resetTokens.findOneAndUpdate(
      {
        tokenHash,
        dummy: { $ne: true },
        usedAt: null,
        expiresAt: { $gt: now },
      },
      { $set: { usedAt: now } },
      { session, returnDocument: "before" },
    );
    const reset = claimedResult?.value ?? claimedResult;

    if (!reset) {
      throw httpError(
        "Token de recuperacao invalido ou expirado.",
        400,
        "RESET_TOKEN_INVALID",
      );
    }

    const updatedUser = await db.collection("users").updateOne(
      { _id: reset.userId },
      { $set: { passwordHash, updatedAt: now } },
      { session },
    );

    if (updatedUser.matchedCount !== 1) {
      throw httpError(
        "Token de recuperacao invalido ou expirado.",
        400,
        "RESET_TOKEN_INVALID",
      );
    }

    // Revoga os restantes resets e todas as sessões no mesmo commit.
    await resetTokens.updateMany(
      { userId: reset.userId, usedAt: null },
      { $set: { usedAt: now, revokedAt: now } },
      { session },
    );
    await db.collection("sessions").deleteMany(
      { userId: reset.userId },
      { session },
    );
    await db.collection("password_reset_dev_outbox").deleteMany(
      { userId: reset.userId },
      { session },
    );
  });

  return { message: "Password atualizada com sucesso." };
}
```

`backend/scripts/show-dev-reset-token.js`

```js
import { closeDatabase } from "../src/config/database.js";
import { getLatestDevPasswordResetToken } from "../src/modules/auth/auth.service.js";

// O email é apenas critério local de consulta e nunca é repetido no output.
const email = process.argv[2]?.trim();

if (!email) {
  console.error(
    "Uso: ENABLE_DEV_RESET_TOKEN_OUTBOX=true npm run dev:reset-token -- email@exemplo.test",
  );
  process.exitCode = 1;
} else {
  try {
    const token = await getLatestDevPasswordResetToken(email);
    // Esta saída deliberada é o canal de entrega PAP. Não a copies para logs/evidence.
    console.log(JSON.stringify(token, null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await closeDatabase();
  }
}
```

Acrescenta apenas esta entrada ao objeto `scripts` já existente em
`backend/package.json`; não substituas o manifesto:

```json
{
  "scripts": {
    "dev:reset-token": "node scripts/show-dev-reset-token.js"
  }
}
```

5. Explicação do código.

O service concentra as regras de auth. O registo cria utilizador com `role: "user"`
e a sessão inicial na mesma transação/sessão; se a segunda escrita falhar, a
conta também é revertida e o retry não encontra um utilizador órfão.
O login compara a password sem expor o hash e executa uma derivação `scrypt`
limitada mesmo nos caminhos inexistente/inativo, reduzindo enumeração temporal;
os gates de conta/hash/comprimento impedem que o hash dummy autentique. A
recuperacao usa resposta generica.

Para uma conta real e apenas com a flag dev ativa, a mesma criação guarda uma
cópia TTL numa coleção separada, sem email. Uma conta inexistente mantém o
documento dummy e a mesma resposta pública, mas nunca entra na outbox. A API,
o logger e o frontend nunca recebem o token bruto. A CLI resolve primeiro o
email para `userId`, devolve apenas `resetToken`/`expiresAt` no terminal
solicitado e fecha a ligação; um reset bem-sucedido apaga todas as entradas da
conta na mesma transação que revoga sessões e resets.

O registo guarda a identidade exata da tentativa para reconciliar apenas o seu
próprio utilizador e token quando o resultado do commit fica desconhecido. O
reset faz uma pré-validação barata, calcula `scrypt` fora da callback e, dentro
de uma única transação, reclama o token, atualiza a password, revoga os restantes
resets e remove todas as sessões. Uma segunda request concorrente já não consegue
reclamar o mesmo token e recebe `RESET_TOKEN_INVALID`.

6. Validação do passo.

Depois de criares as rotas, regista um utilizador, faz login e confirma que a colecao `users` contem `passwordHash`, mas nao contem a password original.

Com uma conta local de teste e a flag explicitamente ativa, pede recuperação e
consulta o token apenas no terminal local:

```bash
ENABLE_DEV_RESET_TOKEN_OUTBOX=true npm run dev:reset-token -- aluno@example.com
```

Não coloques a saída em evidence, histórico de shell partilhado ou logs. Com a
flag desligada, ou em produção, a CLI deve terminar com erro seguro.

7. Cenário negativo/erro esperado.

Se o reset token puder ser reutilizado, uma pessoa com token antigo poderia
voltar a mudar a password. Se uma conta inexistente produzir uma entrada na
outbox, ou se a API devolver/logar o token, o BK também fica bloqueado.

### Passo 6 - Criar controllers, rotas e montagem Express

1. Objetivo funcional do passo no contexto da app.

Expor endpoints HTTP reais para o frontend e manter `GET /api/session/me` alinhado com `req.user`.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/middlewares/rate-limit.middleware.js`
    - CRIAR: `backend/src/modules/auth/auth.controller.js`
    - CRIAR: `backend/src/modules/auth/auth.routes.js`
    - REVER SEM ALTERAR: `backend/src/modules/auth/session.controller.js`
    - REVER SEM ALTERAR: `backend/src/modules/auth/session.routes.js`
    - EDITAR: `backend/src/app.js`
    - LOCALIZACAO: ficheiros completos novos; uma importação e uma montagem aditivas em `app.js`

3. Instruções do que fazer.

Cria primeiro o rate limiter distribuído e depois os novos ficheiros de auth.
Reutiliza `asyncHandler`, os helpers de cookie, o controller e o router de
sessão já existentes. Em `app.js`, acrescenta apenas o import de `authRouter` e
a montagem `/api/auth`, preservando `requestLogger`, `corsMiddleware`, health,
parsing JSON, `attachSession`, `csrfProtection`, `/api`, `/api/session`, 404 e
error handler.

4. Código completo, correto e integrado com a app final.

`backend/src/middlewares/rate-limit.middleware.js`

```js
import { createHmac } from "node:crypto";
import { getDb } from "../config/database.js";
import { env } from "../config/env.js";

let indexesPromise;

function rateLimitError(message, details = undefined) {
  const error = new Error(message);
  error.statusCode = 429;
  error.code = "RATE_LIMITED";
  error.details = details;
  return error;
}

function hashRateLimitKey(value) {
  return createHmac("sha256", env.rateLimitPepper)
    .update(String(value ?? "missing").trim().toLowerCase())
    .digest("hex");
}

export function ensureRateLimitIndexes() {
  if (!indexesPromise) {
    indexesPromise = getDb().then(async (db) => {
      // A chave composta isola scopes e janelas; o TTL remove apenas expirados.
      await db.collection("rate_limit_counters").createIndex(
        { scope: 1, keyHash: 1, windowStart: 1 },
        { unique: true },
      );
      await db.collection("rate_limit_counters").createIndex(
        { expiresAt: 1 },
        { expireAfterSeconds: 0 },
      );
    });
  }

  return indexesPromise;
}

export async function reserveRateLimit({ scope, subject, limit, windowMs }) {
  if (!scope || !Number.isSafeInteger(limit) || limit < 1 || windowMs < 1) {
    throw new Error("Configuracao de rate limit invalida.");
  }

  await ensureRateLimitIndexes();
  const nowMs = Date.now();
  const windowStartMs = Math.floor(nowMs / windowMs) * windowMs;
  const filter = {
    scope,
    keyHash: hashRateLimitKey(subject),
    windowStart: new Date(windowStartMs),
  };
  const db = await getDb();
  const updated = await db.collection("rate_limit_counters").findOneAndUpdate(
    filter,
    {
      $inc: { count: 1 },
      $setOnInsert: {
        scope,
        windowStart: new Date(windowStartMs),
        expiresAt: new Date(windowStartMs + windowMs * 2),
      },
    },
    { upsert: true, returnDocument: "after" },
  );

  return {
    count: updated?.count ?? updated?.value?.count ?? 1,
    limit,
    retryAfterSeconds: Math.max(
      1,
      Math.ceil((windowStartMs + windowMs - nowMs) / 1_000),
    ),
    filter,
  };
}

export async function releaseRateLimit(reservation) {
  const db = await getDb();
  // Uma condição defensiva impede um contador negativo em caso de double-callback.
  await db.collection("rate_limit_counters").updateOne(
    { ...reservation.filter, count: { $gt: 0 } },
    { $inc: { count: -1 } },
  );
}

export function rateLimitExceededError(reservation) {
  return rateLimitError(
    "Demasiados pedidos. Tenta novamente mais tarde.",
    { retryAfterSeconds: reservation.retryAfterSeconds },
  );
}

export function rateLimit({ scope, limit, windowMs, key }) {
  return async (req, res, next) => {
    try {
      const reservation = await reserveRateLimit({
        scope,
        subject: key(req),
        limit,
        windowMs,
      });

      res.setHeader("RateLimit-Policy", `${limit};w=${Math.ceil(windowMs / 1_000)}`);
      res.setHeader("RateLimit-Remaining", String(Math.max(0, limit - reservation.count)));

      if (reservation.count > limit) {
        res.setHeader("Retry-After", String(reservation.retryAfterSeconds));
        next(rateLimitExceededError(reservation));
        return;
      }

      next();
    } catch (error) {
      // Falhar fechado evita que uma indisponibilidade desative a proteção.
      next(error);
    }
  };
}

export const rateLimitKeys = Object.freeze({
  ip: (req) => req.ip ?? req.socket?.remoteAddress ?? "unknown",
  email: (req) => req.body?.email ?? "missing",
  user: (req) => req.user?.id ?? req.ip ?? "anonymous",
  token: (req) => req.body?.token ?? "missing",
});
```

`backend/src/modules/auth/auth.controller.js`

```js
import { sessionConfig } from "../../config/session.js";
import {
  rateLimitExceededError,
  releaseRateLimit,
  reserveRateLimit,
} from "../../middlewares/rate-limit.middleware.js";
import { setSessionCookie } from "../../utils/cookies.js";
import { loginUser, registerUser, requestPasswordReset, resetPassword } from "./auth.service.js";

function persistSessionCookie(res, token) {
  // Nome, duração e flags vêm da única configuração de sessão criada na MF1.
  setSessionCookie(
    res,
    sessionConfig.cookieName,
    token,
    sessionConfig.cookie,
  );
}

export async function register(req, res) {
  const result = await registerUser(req.body);
  persistSessionCookie(res, result.token);
  res.status(201).json({ user: result.user });
}

export async function login(req, res) {
  // A reserva por email só é libertada após sucesso; falhas alimentam o limite contra brute-force.
  const reservation = await reserveRateLimit({
    scope: "auth:login:email-failures",
    subject: req.body?.email,
    limit: 5,
    windowMs: 15 * 60_000,
  });

  if (reservation.count > reservation.limit) {
    res.setHeader("Retry-After", String(reservation.retryAfterSeconds));
    throw rateLimitExceededError(reservation);
  }

  const result = await loginUser(req.body, {
    onAuthenticated: () => releaseRateLimit(reservation),
  });
  persistSessionCookie(res, result.token);
  res.status(200).json({ user: result.user });
}

export async function forgotPassword(req, res) {
  res.status(200).json(await requestPasswordReset(req.body));
}

export async function resetPasswordController(req, res) {
  res.status(200).json(await resetPassword(req.body));
}
```

Não movas o ciclo de sessão para esse controller. O
`backend/src/modules/auth/session.controller.js` da `MF1` continua autoritativo
e deve conservar esta implementação cumulativa:

```js
import { sessionConfig } from "../../config/session.js";
import { clearSessionCookie } from "../../utils/cookies.js";
import { rotateCsrfToken } from "./csrf.service.js";
import { deleteSession } from "./session.service.js";

function disableSessionCaching(res) {
  res.set("Cache-Control", "private, no-store");
  res.set("Pragma", "no-cache");
}

export function getCurrentSession(req, res) {
  // Apenas este `user: null` confirmado pelo backend representa anonimato.
  disableSessionCaching(res);
  return res.status(200).json({ user: req.user ?? null });
}

export async function getCsrfToken(req, res) {
  const csrfToken = await rotateCsrfToken(req.session.rawToken);
  disableSessionCaching(res);
  return res.status(200).json({ csrfToken });
}

export async function logout(req, res) {
  // A sessão server-side é eliminada antes de limpar o cookie com as mesmas opções.
  await deleteSession(req.session.rawToken);
  clearSessionCookie(
    res,
    sessionConfig.cookieName,
    sessionConfig.cookie,
  );
  return res.status(204).end();
}
```

`backend/src/modules/auth/auth.routes.js`

Este é o contrato completo dos limites de auth. O contador por email do login
fica no controller porque um sucesso liberta a reserva; os restantes limites
contam pedidos aceites pela respetiva janela.

```js
import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import {
  rateLimit,
  rateLimitKeys,
} from "../../middlewares/rate-limit.middleware.js";
import { forgotPassword, login, register, resetPasswordController } from "./auth.controller.js";

export const authRouter = Router();

const MINUTE = 60_000;
// O registo é limitado por IP porque ainda não existe uma identidade autenticada fiável.
const registrationLimit = rateLimit({
  scope: "auth:register:ip",
  limit: 5,
  windowMs: 60 * MINUTE,
  key: rateLimitKeys.ip,
});
const loginIpLimit = rateLimit({
  scope: "auth:login:ip",
  limit: 20,
  windowMs: 15 * MINUTE,
  key: rateLimitKeys.ip,
});
const forgotIpLimit = rateLimit({
  scope: "auth:forgot:ip",
  limit: 10,
  windowMs: 60 * MINUTE,
  key: rateLimitKeys.ip,
});
const forgotEmailLimit = rateLimit({
  scope: "auth:forgot:email",
  limit: 3,
  windowMs: 60 * MINUTE,
  key: rateLimitKeys.email,
});
const resetIpLimit = rateLimit({
  scope: "auth:reset:ip",
  limit: 10,
  windowMs: 60 * MINUTE,
  key: rateLimitKeys.ip,
});
const resetTokenLimit = rateLimit({
  // O token tem uma janela própria para conter tentativas distribuídas por vários endereços IP.
  scope: "auth:reset:token",
  limit: 5,
  windowMs: 15 * MINUTE,
  key: rateLimitKeys.token,
});

authRouter.post("/register", registrationLimit, asyncHandler(register));
authRouter.post("/login", loginIpLimit, asyncHandler(login));
authRouter.post(
  "/forgot-password",
  forgotIpLimit,
  forgotEmailLimit,
  asyncHandler(forgotPassword),
);
authRouter.post(
  "/reset-password",
  resetIpLimit,
  resetTokenLimit,
  asyncHandler(resetPasswordController),
);
```

Confirma, sem substituir, o
`backend/src/modules/auth/session.routes.js` criado na `MF1`:

```js
import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import {
  getCsrfToken,
  getCurrentSession,
  logout,
} from "./session.controller.js";

export const sessionRouter = Router();

// O contrato de sessão permanece completo quando as rotas novas de auth são montadas.
sessionRouter.get("/me", getCurrentSession);
sessionRouter.get("/csrf-token", requireAuth, asyncHandler(getCsrfToken));
sessionRouter.post("/logout", requireAuth, asyncHandler(logout));
```

`backend/src/app.js`

```js
import express from "express";
import { asyncHandler } from "./utils/async-handler.js";
import { corsMiddleware } from "./middlewares/cors.middleware.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";
import { csrfProtection } from "./middlewares/csrf.middleware.js";
import { requestLogger } from "./middlewares/request-logger.middleware.js";
import { attachSession } from "./middlewares/session.middleware.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { sessionRouter } from "./modules/auth/session.routes.js";
import { healthRouter } from "./modules/system/health.routes.js";
import { systemRouter } from "./modules/system/system.routes.js";

export function createApp() {
  const app = express();

  // A ordem é deliberada: logging e CORS precedem as rotas, enquanto CSRF só protege mutações com sessão.
  app.use(requestLogger);
  app.use(corsMiddleware);
  // Liveness/readiness ficam antes de body, sessão e CSRF.
  app.use("/health", healthRouter);

  app.use(express.json({ limit: "1mb" }));
  app.use(asyncHandler(attachSession));
  app.use(asyncHandler(csrfProtection));

  app.use("/api", systemRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/session", sessionRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
```

5. Explicação do código.

O contador usa `findOneAndUpdate` atómico, índice único e TTL. Apenas o HMAC de
IP/email/token é persistido; o segredo fica no ambiente. O primeiro pedido
recusado é `limit + 1`, recebe `429 RATE_LIMITED` e `Retry-After`. O controller
de auth nunca devolve campos internos e escreve o cookie apenas através de
`sessionConfig` e `setSessionCookie(res, name, token, options)`. O controller de
sessão continua a usar `req.session.rawToken` e
`clearSessionCookie(res, name, options)`. Não existe um helper paralelo de
opções de cookie, um segundo logout nem um segundo router de sessão.
`GET /api/session/me` continua a devolver `user: null` sem sessão. A montagem
preserva CORS, health, logging, sessão, CSRF e todas as rotas da fundação.

6. Validação do passo.

Executa o backend e usa cookies num ficheiro temporario:

```bash
curl -i -c /tmp/faithflix-cookies.txt -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Aluno Teste","email":"aluno@example.com","password":"password-segura-123"}'

curl -i -b /tmp/faithflix-cookies.txt http://localhost:3000/api/session/me
curl -i -b /tmp/faithflix-cookies.txt http://localhost:3000/api/session/csrf-token

# Guarda em CSRF_TOKEN apenas o token devolvido pelo pedido anterior.
curl -i -b /tmp/faithflix-cookies.txt -X POST \
  -H "Origin: http://localhost:5173" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  http://localhost:3000/api/session/logout
```

Resultados esperados: `201`, depois `200` com utilizador, `200` com o token CSRF
e, por fim, `204` no logout protegido.

7. Cenário negativo/erro esperado.

Se testares endpoints protegidos sem enviar cookie, vais receber respostas erradas para o objetivo do teste. Usa sempre `-c` e `-b` no `curl` quando validas sessao.

### Passo 7 - Criar cliente frontend e pagina de autenticacao

1. Objetivo funcional do passo no contexto da app.

Ligar a UI aos endpoints de auth usando o `apiClient` da `MF1`.

2. Ficheiros envolvidos.
    - CRIAR: `frontend/src/services/api/authApi.js`
    - CRIAR: `frontend/src/components/auth/AuthForms.jsx`
    - CRIAR: `frontend/src/context/SessionContext.jsx`
    - CRIAR: `frontend/src/utils/authRedirect.js`
    - EDITAR: `frontend/src/pages/LoginPage.jsx`
    - EDITAR: `frontend/src/routes/AppRoutes.jsx`
    - EDITAR: `frontend/src/components/layout/AppHeader.jsx`
    - LOCALIZACAO: ficheiros completos e substituição pontual da declaração lazy; manter paths públicos em `frontend/`

3. Instruções do que fazer.

Cria `authApi.js`, o contexto e o validador de destino. `LoginPage` lê `next`,
valida-o e passa apenas o resultado seguro a `AuthForms`. Depois de registo/login,
o formulário atualiza a sessão autoritativa e navega para esse destino ou para a
landing da role confirmada (`admin`, `moderator` ou utilizador comum).
Em `AppRoutes`, não importes a página de forma eager nem substituas o router:
troca apenas a declaração lazy de `LoginPage` pela versão indicada, mantendo
`RouteLifecycle`, `ErrorBoundary`, `Suspense` e todas as restantes rotas.

4. Código completo, correto e integrado com a app final.

`frontend/src/services/api/authApi.js`

```js
import { apiClient, clearCsrfToken } from "./apiClient.js";

// A exceção backend é exata para estes quatro POST públicos: o browser continua
// a enviar Origin automaticamente, mesmo quando ainda transporta um cookie.
// Apenas logout e o handler global de 401 limpam o token CSRF em memória.
export const authApi = {
  register(data) {
    return apiClient.post("/api/auth/register", data, {
      csrf: false,
    });
  },
  login(data) {
    return apiClient.post("/api/auth/login", data, {
      csrf: false,
    });
  },
  forgotPassword(data) {
    return apiClient.post("/api/auth/forgot-password", data, { csrf: false });
  },
  resetPassword(data) {
    return apiClient.post("/api/auth/reset-password", data, { csrf: false });
  },
  me() {
    return apiClient.get("/api/session/me");
  },
  async logout() {
    // O 204 confirma revogação remota antes de apagar o token mantido em memória.
    const response = await apiClient.post("/api/session/logout");
    clearCsrfToken();
    return response;
  },
};
```

`frontend/src/utils/authRedirect.js`

```js
function containsControlCharacters(value) {
  return Array.from(value).some((character) => {
    const codePoint = character.codePointAt(0);
    return codePoint <= 31 || codePoint === 127;
  });
}

export function isSafeInternalPath(value) {
  if (typeof value !== "string" || value !== value.trim() || !value.startsWith("/")) {
    return false;
  }

  let decodedCandidate = value;

  // Validar também até duas camadas codificadas impede `//` e `\\` escondidos.
  for (let pass = 0; pass < 2; pass += 1) {
    if (
      decodedCandidate.startsWith("//") ||
      decodedCandidate.includes("\\") ||
      containsControlCharacters(decodedCandidate)
    ) {
      return false;
    }

    try {
      const decodedValue = decodeURIComponent(decodedCandidate);
      if (decodedValue === decodedCandidate) break;
      decodedCandidate = decodedValue;
    } catch {
      return false;
    }
  }

  if (
    decodedCandidate.startsWith("//") ||
    decodedCandidate.includes("\\") ||
    containsControlCharacters(decodedCandidate)
  ) {
    return false;
  }

  try {
    const internalOrigin = "https://faithflix.invalid";
    return new URL(value, internalOrigin).origin === internalOrigin;
  } catch {
    return false;
  }
}

export function getSafeRedirectPath(value) {
  if (!isSafeInternalPath(value)) return null;
  const parsed = new URL(value, "https://faithflix.invalid");
  return `${parsed.pathname}${parsed.search}${parsed.hash}`;
}

export function getDefaultAuthenticatedPath(user) {
  if (user?.role === "admin") return "/admin";
  if (user?.role === "moderator") return "/admin/catalogo";
  return "/";
}

export function resolveAuthenticatedPath(user, requestedPath = null) {
  return getSafeRedirectPath(requestedPath) ?? getDefaultAuthenticatedPath(user);
}

export function buildLoginRedirectPath(returnTo) {
  const safeReturnTo = getSafeRedirectPath(returnTo);
  if (!safeReturnTo) return "/login";

  // O path seguro é ainda codificado para ocupar apenas o parâmetro `next`.
  return `/login?next=${encodeURIComponent(safeReturnTo)}`;
}
```

`frontend/src/context/SessionContext.jsx`

```jsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { authApi } from "../services/api/authApi.js";
import { clearCsrfToken, setUnauthorizedHandler } from "../services/api/apiClient.js";
import { toUserMessage } from "../services/api/apiErrors.js";

const SessionContext = createContext(null);

// Um 401 representa sessão inválida; indisponibilidade de rede mantém um estado distinto de logout.
function isUnauthorizedError(error) {
  return error && typeof error === "object" && error.status === 401;
}

function isPublicUser(value) {
  return value !== null
    && typeof value === "object"
    && typeof value.id === "string"
    && typeof value.email === "string"
    && typeof value.name === "string"
    && typeof value.role === "string";
}

export function SessionProvider({ children }) {
  const [status, setStatus] = useState("loading");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const refreshVersion = useRef(0);

  const clearSession = useCallback(() => {
    refreshVersion.current += 1;
    clearCsrfToken();
    setUser(null);
    setStatus("anonymous");
    setError("");
  }, []);

  const refreshSession = useCallback(async () => {
    const version = refreshVersion.current + 1;
    refreshVersion.current = version;
    setStatus("loading");
    setError("");

    try {
      const response = await authApi.me();
      if (refreshVersion.current !== version) return null;

      if (response?.user === null) {
        // Só o contrato explícito `200 { user: null }` confirma anonimato.
        setUser(null);
        setStatus("anonymous");
        return null;
      }

      if (!isPublicUser(response?.user)) {
        throw new Error("Resposta de sessao invalida.");
      }

      setUser(response.user);
      setStatus("authenticated");
      return response.user;
    } catch (requestError) {
      if (refreshVersion.current !== version) return null;
      if (isUnauthorizedError(requestError)) {
        clearSession();
        return null;
      }

      // Rede, timeout, 5xx ou payload inválido preservam o último user conhecido.
      setStatus("unavailable");
      setError(toUserMessage(requestError));
      throw requestError;
    }
  }, [clearSession]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (requestError) {
      if (!isUnauthorizedError(requestError)) throw requestError;
    }
    clearSession();
  }, [clearSession]);

  useEffect(() => {
    const removeUnauthorizedHandler = setUnauthorizedHandler(clearSession);
    refreshSession().catch(() => {});
    return () => {
      refreshVersion.current += 1;
      removeUnauthorizedHandler();
    };
  }, [clearSession, refreshSession]);

  const value = useMemo(
    () => ({ status, user, error, refreshSession, logout }),
    [error, logout, refreshSession, status, user],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession exige SessionProvider.");
  return context;
}
```

`frontend/src/components/auth/AuthForms.jsx`

```jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../../context/SessionContext.jsx";
import { authApi } from "../../services/api/authApi.js";
import { toUserMessage } from "../../services/api/apiErrors.js";
import { resolveAuthenticatedPath } from "../../utils/authRedirect.js";

const INITIAL_FORM = { name: "", email: "", password: "", token: "" };

// O destino é validado antes da submissão para impedir open redirects através do parâmetro `next`.
export function AuthForms({ redirectTo = null }) {
  const navigate = useNavigate();
  const { refreshSession } = useSession();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    // O busy state bloqueia submissões concorrentes e evita duplicar operações de autenticação.
    event.preventDefault();
    setLoading(true);
    setError("");
    setStatus("");

    try {
      if (mode === "register") {
        await authApi.register({ name: form.name, email: form.email, password: form.password });
        const currentUser = await refreshSession();
        setStatus("Conta criada e sessao iniciada.");
        navigate(resolveAuthenticatedPath(currentUser, redirectTo), { replace: true });
      }

      if (mode === "login") {
        await authApi.login({ email: form.email, password: form.password });
        const currentUser = await refreshSession();
        setStatus("Sessao iniciada.");
        navigate(resolveAuthenticatedPath(currentUser, redirectTo), { replace: true });
      }

      if (mode === "forgot") {
        const response = await authApi.forgotPassword({ email: form.email });
        setStatus(response.message);
      }

      if (mode === "reset") {
        await authApi.resetPassword({ token: form.token, password: form.password });
        setStatus("Password atualizada. Ja podes iniciar sessao.");
      }
    } catch (requestError) {
      setError(toUserMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-panel" data-testid="auth-form">
      <div className="auth-tabs" aria-label="Autenticacao">
        {["login", "register", "forgot", "reset"].map((item) => (
          <button key={item} type="button" className={mode === item ? "active" : ""} onClick={() => setMode(item)}>
            {item}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="auth-form">
        {mode === "register" ? (
          <label>
            Nome
            <input name="name" value={form.name} onChange={updateField} autoComplete="name" />
          </label>
        ) : null}

        {mode !== "reset" ? (
          <label>
            Email
            <input name="email" type="email" value={form.email} onChange={updateField} autoComplete="email" />
          </label>
        ) : null}

        {mode === "reset" ? (
          <label>
            Token
            <input name="token" value={form.token} onChange={updateField} />
          </label>
        ) : null}

        {mode !== "forgot" ? (
          <label>
            Password
            <input name="password" type="password" value={form.password} onChange={updateField} autoComplete="current-password" />
          </label>
        ) : null}

        <button type="submit" disabled={loading}>{loading ? "A validar..." : "Confirmar"}</button>
      </form>

      {status ? <p className="form-status">{status}</p> : null}
      {error ? <p className="form-error">{error}</p> : null}
    </section>
  );
}
```

`frontend/src/pages/LoginPage.jsx`

```jsx
import { AuthForms } from "../components/auth/AuthForms.jsx";
import { useSearchParams } from "react-router-dom";
import { getSafeRedirectPath } from "../utils/authRedirect.js";

export function LoginPage() {
  // Valores externos só chegam ao formulário depois de resolvidos para um caminho local seguro.
  const [searchParams] = useSearchParams();
  const redirectTo = getSafeRedirectPath(searchParams.get("next"));

  return (
    <main className="page-shell">
      <h1>Entrar no FaithFlix</h1>
      <p>Cria conta, inicia sessao ou recupera o acesso com seguranca.</p>
      <AuthForms redirectTo={redirectTo} />
    </main>
  );
}
```

Substituição pontual em `frontend/src/routes/AppRoutes.jsx`, reutilizando o
`lazyNamedPage(loader, exportName)` criado no guia base da `MF1`:

```jsx
// SUBSTITUIR a declaração lazy de LoginPage criada em BK-MF1-02.
const LoginPage = lazyNamedPage(() => import("../pages/LoginPage.jsx"), "LoginPage");
```

Trecho de `frontend/src/components/layout/AppHeader.jsx`:

```jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../../context/SessionContext.jsx";
import { toUserMessage } from "../../services/api/apiErrors.js";

const session = useSession();
const navigate = useNavigate();
const [loggingOut, setLoggingOut] = useState(false);
const [logoutError, setLogoutError] = useState("");

// O busy state impede múltiplos pedidos de logout enquanto a sessão é revogada no servidor.
async function handleLogout() {
  setLoggingOut(true);
  setLogoutError("");

  try {
    await session.logout();
    // `replace` remove a página autenticada do histórico depois de a sessão ser terminada.
    navigate("/", { replace: true });
  } catch (requestError) {
    setLogoutError(toUserMessage(requestError));
  } finally {
    setLoggingOut(false);
  }
}

{session.status === "authenticated" ? (
  <button type="button" disabled={loggingOut} onClick={handleLogout}>
    {loggingOut ? "A sair..." : "Sair"}
  </button>
) : null}
{logoutError ? <p role="alert">{logoutError}</p> : null}
```

5. Explicação do código.

O frontend nunca lê o cookie. O browser envia-o automaticamente porque o
`apiClient` usa `credentials: "include"`. `refreshSession()` confirma no backend
o utilizador acabado de autenticar. `getSafeRedirectPath()` recusa destinos
externos ou ambíguos; sem destino válido, `resolveAuthenticatedPath()` escolhe
`/admin`, `/admin/catalogo` ou `/` a partir da role devolvida pela sessão.
`buildLoginRedirectPath()` reutiliza a mesma decisão para os links protegidos
dos BKs seguintes e codifica `next`, em vez de concatenar um destino bruto. O token de
recuperação nunca é apresentado pela UI pública. O botão `Sair` só limpa/navega
depois de a operação remota terminar (ou responder `401`); uma falha de rede
mantém o estado e mostra o erro.

6. Validação do passo.

Arranca backend e frontend. Abre `/login` e confirma as landings sem `next`:
utilizador em `/`, moderator em `/admin/catalogo` e admin em `/admin`. Repete com
`/login?next=%2Fconta` e confirma `/conta`, independentemente da role. Testa
também `next=//evil.example`, backslashes e valores codificados: todos devem usar
a landing segura da role. Simula falha de rede em `/api/session/me` e confirma estado
`unavailable`, sem apresentar o utilizador como anónimo.

7. Cenário negativo/erro esperado.

Nao uses `localStorage.setItem("token", ...)`. Isso quebraria a decisao de seguranca da `MF1`.

### Passo 8 - Validar fluxo completo e negativos

1. Objetivo funcional do passo no contexto da app.

Provar que identidade, sessao e recuperacao funcionam e falham de forma controlada.

2. Ficheiros envolvidos.
    - REVER: `backend/src/modules/auth/*`
    - REVER: `frontend/src/components/auth/AuthForms.jsx`
    - REVER: `frontend/src/services/api/authApi.js`
    - LOCALIZACAO: validacao funcional

3. Instruções do que fazer.

Executa os comandos abaixo e guarda outputs para evidence. Mantém o script `smoke` da `MF1` e o contrato atual de `GET /api/session/me`: sem cookie ou com cookie falso responde `200 { user: null }`; endpoints que exigem autenticação continuam a devolver `401`.

4. Código completo, correto e integrado com a app final.

```bash
curl -i -c /tmp/faithflix-cookies.txt -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Aluno Teste","email":"aluno@example.com","password":"password-segura-123"}'

curl -i -b /tmp/faithflix-cookies.txt http://localhost:3000/api/session/me

curl -i -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"aluno@example.com","password":"errada"}'

curl -i -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"aluno@example.com"}'
```

5. Explicação do código.

`-c` guarda cookies recebidos e `-b` envia esses cookies. O teste com password errada valida que o backend nao inicia sessao indevida. O pedido de recuperacao valida a resposta generica.

6. Validação do passo.

Resultados esperados:

- registo devolve `201` e `Set-Cookie` com `HttpOnly`;
- `GET /api/session/me` devolve `200` com `user.id`, `user.name`, `user.email`, `user.role`;
- login errado devolve `401`;
- recuperacao devolve `200` com mensagem generica.
- `npm run smoke` continua executavel e ajustado a nova sessao real.

7. Cenário negativo/erro esperado.

Se a resposta de `me` mostrar `passwordHash`, `tokenHash` ou `resetTokenHash`, para e corrige antes de avanar.

##### Snippet técnico aplicável

O centro tecnico deste BK e a passagem de sessao resolvida para `req.user`. O codigo completo esta no Passo 4.

```js
req.session = {
  isAuthenticated: Boolean(resolved),
  id: resolved?.id ?? null,
  rawToken: resolved ? rawToken : null,
};
req.user = resolved?.user ?? null;
```

#### Critérios de aceite

- `POST /api/auth/register` cria utilizador com password em hash e inicia sessao.
- Registo e sessão inicial partilham a mesma transação; fault injection na sessão
  deixa zero utilizador persistido.
- Um resultado de commit desconhecido só é reconciliado se o utilizador e a
  sessão tiverem o `_id`/token desta tentativa; caso contrário o erro mantém-se.
- Sessão existente de conta inativa, bloqueada, eliminada ou com estado
  desconhecido é apagada e não autentica.
- `POST /api/auth/login` inicia sessao apenas com credenciais validas.
- `GET /api/session/me` devolve o utilizador autenticado quando o cookie e valido.
- `GET /api/session/me` sem cookie devolve `200 { "user": null }`.
- `GET /api/session/me` autenticado ou anónimo devolve
  `Cache-Control: private, no-store` e `Pragma: no-cache`.
- Cookie com `%`/percent-encoding inválido não produz `500`; `/me` devolve
  `{ user: null }` e envia limpeza do cookie apresentado.
- `POST /api/session/logout` apaga a sessao e limpa o cookie.
- `POST /api/auth/forgot-password` nao revela se o email existe.
- `POST /api/auth/reset-password` aceita apenas token valido, nao expirado e nao usado.
- Sessao e cookie usam TTL de `24 h`.
- Reset bem-sucedido revoga os outros tokens de recuperação e todas as sessões do utilizador.
- A outbox PAP fica desligada por defeito e não pode arrancar ativa em produção.
- Apenas uma conta real pode criar outbox; documentos dummy, resposta HTTP,
  frontend e logs nunca recebem o token bruto ou PII dummy.
- A CLI dev-only consulta por email, mas a outbox indexa `userId`, devolve apenas
  token/prazo no terminal solicitado e as entradas expiram por TTL ou reset.
- Dois pedidos concorrentes com o mesmo token não podem ambos ter sucesso.
- Email de autenticação aceita apenas string válida com, no máximo, 254
  caracteres; password aceita apenas string com 10-128 caracteres.
- Os limites de auth devolvem `429 RATE_LIMITED` e `Retry-After` quando excedidos.
- Registo limita 5 pedidos/IP/h; reset limita 10 pedidos/IP/h e 5/token/15 min.
- Login limita 20 pedidos/IP/15 min e 5 falhas/email/15 min; um sucesso liberta
  a reserva de falha desse email.
- Login executa uma verificação `scrypt` por tentativa autorizada pelos limites,
  incluindo utilizador inexistente/inativo, e nunca autentica com o hash dummy.
- Recuperação limita 10 pedidos por IP e 3 por email em uma hora, sem revelar se
  a conta existe.
- O frontend permite registar, iniciar sessao, pedir recuperacao e repor password.
- Os quatro POST públicos de auth dispensam apenas o token CSRF; em contexto
  browser continuam a exigir Origin permitido, inclusive com sessão válida.
- Qualquer outra mutation autenticada exige Origin e `X-CSRF-Token` válidos.
- O frontend distingue `loading|authenticated|anonymous|unavailable`; falha de rede não é logout.
- Login/registo dão precedência a um `next` interno validado; sem ele, admin
  entra em `/admin`, moderator em `/admin/catalogo` e user em `/`. Destinos
  externos, backslashes e caracteres de controlo são recusados.
- Logout visível limpa o contexto apenas depois do backend responder e navega para `/`.
- Pelo menos cinco negativos ficam registados.

#### Validação final

- Executar `npm test` dentro de `backend`, se existir suite ativa.
- Executar `npm run smoke` dentro de `backend`, preservando os testes da `MF1` ajustados ao novo contrato de sessao real.
- Executar backend e frontend em modo desenvolvimento.
- Validar comandos `curl` do Passo 8.
- Confirmar que o cookie tem `HttpOnly`.
- Confirmar que cookie e documento de sessão expiram ao fim de `24 h`.
- Testar rate limiting e a corrida de dois resets com o mesmo token.
- Testar com doubles que flag desligada, produção e email inexistente deixam a
  outbox vazia; reset bem-sucedido elimina as entradas na mesma transação.
- Confirmar no MongoDB que a password original nao esta guardada.

#### Evidence para PR/defesa

- Output de registo com `201`.
- Output de `GET /api/session/me` autenticado.
- Output de `GET /api/session/me` anónimo com `200 { "user": null }`.
- Output de logout com `204`.
- Output de login errado com `401`.
- Output de recuperacao com resposta generica.
- Assert de outbox dev-only sem copiar token, email, cookie ou password para a
  evidence; registar apenas contagens/estados e TTL.
- Captura da pagina `/login` com estado de sucesso ou erro.
- Testes comportamentais de `SessionContext`, `AuthForms`, `AppHeader`, guards e `authRedirect`, incluindo rede indisponível, logout visível e safe-next malicioso.

#### Handoff

Para `BK-MF2-02`, entregar:

- `req.user` preenchido com `id`, `name`, `email` e `role`.
- Colecao `users` com `role: "user"` por defeito.
- Endpoints `/api/auth/*` e `/api/session/*`.
- Garantia de que o frontend nao guarda token em storage local.

##### Próximo BK recomendado

`BK-MF2-02 - Edicao de perfil e papeis base`

##### Inputs estritos

- Registo, login, recuperação e reset recebem um objeto JSON; `name`, `email`,
  `password` e `token` só são aceites como strings reais. Booleanos, números,
  objetos ou arrays num campo escalar devolvem `400`.
- Valores de query/path, quando existirem, são strings escalares da fronteira
  HTTP; arrays/objetos são recusados antes da lógica de domínio.
- Ultrapassar o limite de nome, email, password ou token devolve `400`; a API
  não corta texto para o fazer caber.
- Os snippets executáveis aplicam este contrato em `assertValidName`,
  `assertValidEmail`, `assertValidPassword` e `isOpaqueToken`: validam o tipo
  antes de normalizar e rejeitam imediatamente input não escalar ou acima do
  limite. Conversões de `ObjectId`, hashes persistidos e `Retry-After` operam
  apenas sobre valores internos já validados e não coagem payloads do cliente.

#### Changelog

- `2026-07-10`: criado o canal PAP de reset dev-only, opt-in, proibido em
  produção, sem outbox dummy/PII e removido transacionalmente após o reset.
- `2026-07-10`: alinhada a exceção CSRF fechada dos quatro POST públicos de
  autenticação; Origin permanece obrigatório mesmo com cookie anterior.
- `2026-07-10`: recomposto cumulativamente sobre `BK-MF1-04/05`, sem substituir
  env, sessão, CSRF, health ou router; unificados token/cookies, transação de
  registo/reset, rate limits e estado frontend `unavailable`.
- `2026-07-10`: migrado para o contrato tutorial v2 e integrada a validação
  estrita diretamente nos snippets executáveis.
- 2026-07-10: alinhado o contrato frontend de sessão, `200 {user:null}`, logout `204`, estados fechados e safe-next same-origin com fallback `/`.
- 2026-07-12: fallback de autenticação alinhado à role confirmada, preservando precedência de `next` interno seguro.

- `2026-05-31`: Corrigido o guia para fechar sessao real com MongoDB, cookie HttpOnly, `req.user`, recuperacao de password, frontend e negativos.
