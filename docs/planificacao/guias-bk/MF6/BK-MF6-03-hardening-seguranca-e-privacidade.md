# BK-MF6-03 - Hardening segurança e privacidade

## Header

- `doc_id`: `GUIA-BK-MF6-03`
- `bk_id`: `BK-MF6-03`
- `macro`: `MF6`
- `owner`: `Matheus`
- `apoio`: `Kaue`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF6-01`
- `rf_rnf`: `RNF14, RNF16, RNF17, RNF18, RNF19, RNF20, RNF37`
- `fase_documental`: `Fase 3`
- `sprint`: `S10`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF6-04`
- `guia_path`: `docs/planificacao/guias-bk/MF6/BK-MF6-03-hardening-seguranca-e-privacidade.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais endurecer a aplicação contra falhas comuns de segurança e privacidade, validando password hashing, validação de input, CSRF/Origin, rate limiting, HTTPS/headers, reset e revogação de sessões, proteção de dados sensíveis, auditoria administrativa, backups e uso consentido dos dados de recomendação.

O resultado final é um script de análise estática em `backend/scripts/check-security-baseline.mjs`, uma checklist manual objetiva e evidence para o gate S12.

#### Importância

Segurança não é um acabamento visual. Num produto com contas, subscrições, histórico, ratings, consentimentos, associações e administração, uma falha de validação ou exposição de dados pode comprometer utilizadores e destruir a credibilidade da PAP.

Este BK não promete segurança absoluta. O objetivo é fechar os controlos mínimos documentados nos RNF e tornar explícito o que foi verificado.

#### Scope-in

- Confirmar hashing de passwords.
- Procurar padrões perigosos em backend e frontend.
- Rever input validation, ownership, roles e auditoria admin.
- Validar CSRF ligado à sessão e allowlist de Origin/Fetch Metadata.
- Validar rate limiting persistido e chaves pseudonimizadas.
- Validar HTTPS fail-closed, cookies e headers defensivos.
- Validar reset atómico com revogação de tokens e sessões.
- Validar que dados de recomendação só são usados com consentimento explícito e controlo parental.
- Definir evidence de backups e recuperação como prova operacional.
- Executar regressão backend depois das verificações.

#### Scope-out

- Implementar fornecedor externo de pagamentos.
- Implementar infraestrutura real de backups.
- Alterar arquitetura de autenticação definida em MF1/MF2.
- Criar sistema avançado de deteção de intrusão.
- Substituir regras de recomendação baseline por modelos externos.

#### Estado antes e depois

Antes deste BK, a aplicação já tem sessão segura, validações por domínio, logs estruturados, exportação/eliminação de dados e integrações admin. Falta uma verificação transversal que procure quebras de segurança antes do gate final.

Depois deste BK, existe uma análise estática simples, uma checklist manual e evidence que demonstra o estado dos controlos de `RNF14`, `RNF16`, `RNF17`, `RNF18`, `RNF19`, `RNF20` e `RNF37`.

### Contrato atual da referência docente (Fase 2 - 2026-07-09)

- O scanner estático é apenas uma camada. RNF16 só fecha com testes comportamentais
  dos controlos HTTP e de concorrência.
- Browsers autenticados enviam Origin permitido e `X-CSRF-Token` ligado à sessão;
  cross-site/same-site inesperado, Origin fora da allowlist ou token inválido
  devolvem `403` com códigos estáveis.
- Os limites distribuídos são fechados e mensuráveis:

  | Scope | Sujeito | Limite e janela |
  | --- | --- | --- |
  | `auth:login:email-failures` | email | 5 falhas / 15 min |
  | `auth:login:ip` | IP | 20 pedidos / 15 min |
  | `auth:register:ip` | IP | 5 pedidos / hora |
  | `auth:forgot:email` | email | 3 pedidos / hora |
  | `auth:forgot:ip` | IP | 10 pedidos / hora |
  | `auth:reset:token` | token | 5 pedidos / 15 min |
  | `auth:reset:ip` | IP | 10 pedidos / hora |
  | `charity-application:ip` | IP | 5 pedidos / hora |
  | `search:ip` | IP | 120 pedidos / minuto |
  | `recommendations:user` | utilizador | 60 pedidos / minuto |

  O primeiro pedido acima do limite devolve `429 RATE_LIMITED` e
  `Retry-After`. `rate_limit_counters` guarda apenas `scope`, `keyHash` HMAC,
  `windowStart`, `count` e `expiresAt`; um índice único fecha a concorrência e
  um índice TTL elimina janelas expiradas. IP, email, token e user id nunca são
  persistidos em claro.
- Produção exige configuração explícita: origins HTTPS, `RATE_LIMIT_PEPPER` forte,
  cookies `Secure` e HTTPS por defeito. `FORCE_HTTPS` recusa HTTP com `426`.
- Headers defensivos são aplicados centralmente; auth/sessão/privacidade não são
  armazenadas por caches partilhadas.
- Reset de password reclama o token e revoga restantes tokens/sessões na mesma
  transação. A mesma regra de atomicidade aplica-se à eliminação de conta.
- O envelope de erro é `{ code, message, requestId, details? }`; `5xx` não expõe
  detalhes internos.
- Backup e restore são CLIs locais fail-closed: DB explícita, opt-in por
  operação, archive/manifest `0600`, checksum SHA-256 e restore apenas para DB
  temporária. Sem `mongodump`/`mongorestore`, o resultado obrigatório é
  `BLOQUEADO_AMBIENTE`, nunca `PASS`.

#### Pré-requisitos

- `BK-MF1-04` criou sessão segura por cookie.
- `BK-MF2-01` criou autenticação e password hashing.
- `BK-MF2-01` criou também o rate limiter MongoDB partilhado; este BK revê e
  testa essa implementação, não cria um segundo limiter.
- `BK-MF3-05` e `BK-MF3-06` criaram recomendação baseline e explicabilidade.
- `BK-MF4` criou subscrições, pagamento simulado, pool solidária e notificações.
- `BK-MF5` criou RGPD, administração, métricas e integrações.
- `BK-MF6-01` validou a regressão backend.

#### Glossário

- Hardening: conjunto de medidas para reduzir superfícies de ataque e erros operacionais.
- Dado sensível: valor que não deve aparecer em código, logs ou respostas públicas.
- Auditoria: registo de ação crítica com ator, alvo, data e contexto seguro.
- Ownership: garantia de que um utilizador só acede aos seus próprios dados.
- Backup: cópia recuperável que permite restaurar dados após falha.

#### Conceitos teóricos essenciais

- `CANONICO`: `RNF14` exige hash seguro de passwords.
- `CANONICO`: `RNF16` exige proteção contra injeção, XSS, CSRF e brute force.
- `CANONICO`: `RNF17` exige dados sensíveis fora do código fonte.
- `CANONICO`: `RNF18` impede guardar dados financeiros sensíveis na base de dados da aplicação.
- `CANONICO`: `RNF19` exige logs de auditoria para operações administrativas críticas.
- `CANONICO`: `RNF20` pede política de cópias de segurança com capacidade de recuperação.
- `CANONICO`: `RNF37` limita dados de recomendação ao fim declarado.
- `DERIVADO`: a verificação automática usa padrões estáticos simples, porque a PAP não documenta uma ferramenta externa obrigatória de security scanning.
- Hardening combina automação e revisão humana. O script encontra sinais fortes; a checklist confirma regras de domínio, permissões e evidências operacionais.

#### Arquitetura do BK

| Camada | Decisão |
| --- | --- |
| Script | `backend/scripts/check-security-baseline.mjs` |
| Alvos | `backend/src` e `frontend/src` |
| Revisão manual | auth, users, privacy, subscriptions, integrations, recommendations |
| Testes comportamentais | `backend/tests/unit/security-controls.test.js` e regressão backend |
| Evidence | `docs/evidence/MF6/BK-MF6-03-hardening-seguranca.md` |
| Handoff | `BK-MF6-04` só mede performance depois de segurança base estar verificada |

#### Ficheiros a criar/editar/rever

- CRIAR: `backend/scripts/check-security-baseline.mjs`
- REVER: `backend/src/modules/auth/auth.password.js`
- REVER: `backend/src/modules/auth/auth.routes.js`, `session.routes.js`, `csrf.service.js`
- REVER: `backend/src/middlewares/csrf.middleware.js`, `rate-limit.middleware.js`, `error.middleware.js`
- CRIAR: `backend/src/middlewares/security.middleware.js`
- REVER: `backend/src/config/cors.js`, `env.js`, `session.js`
- EDITAR: `backend/src/app.js`, `backend/.env.example`
- REVER: `backend/src/modules/users/user.service.js`
- REVER: `backend/src/modules/privacy/privacy.service.js`
- REVER: `backend/src/modules/integrations/integrations.validation.js`
- REVER: `backend/src/modules/recommendations/recommendations.service.js`
- REVER: `backend/src/utils/logger.js`
- REVER: `frontend/src/services/api/apiClient.js`

#### Tutorial técnico linear

### Passo 1 - Criar análise estática de segurança

1. Objetivo funcional do passo no contexto da app.

Detetar padrões perigosos antes de fechar hardening, sem depender de ferramentas externas.

2. Ficheiros envolvidos:
    - CRIAR: `backend/scripts/check-security-baseline.mjs`
    - LOCALIZAÇÃO: ficheiro completo

3. Instruções do que fazer.

Cria o ficheiro abaixo no backend. O script deve ser executado a partir de `backend`.

4. Código completo, correto e integrado com a app final.

```js
// backend/scripts/check-security-baseline.mjs
/**
 * @file Verificação estática de segurança e privacidade da MF6.
 *
 * Procura padrões incompatíveis com os RNF críticos sem adicionar dependências
 * novas ao projeto.
 */

import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { cwd } from "node:process";

const rootDir = cwd();
const scanRoots = [
  join(rootDir, "src"),
  join(rootDir, "..", "frontend", "src"),
];

const textRules = [
  {
    label: "armazenamento persistente do browser para dados de sessão",
    needle: "local" + "Storage",
  },
  {
    label: "armazenamento temporário do browser para dados de sessão",
    needle: "session" + "Storage",
  },
  {
    label: "injeção direta de HTML em React",
    needle: "dangerously" + "SetInnerHTML",
  },
  {
    label: "construtor dinâmico de código",
    needle: "new " + "Function",
  },
];

const sourceRules = [
  {
    label: "execução dinâmica de código",
    test: (line) => /\beval\s*\(/u.test(line),
  },
  {
    label: "remoção MongoDB sem filtro",
    test: (line) => /deleteMany\s*\(\s*\{\s*\}\s*\)/u.test(line),
  },
  {
    label: "connection string MongoDB não local em ficheiro fonte",
    test: hasUnsafeMongoUri,
  },
  {
    label: "segredo literal provável em ficheiro fonte",
    test: hasLiteralSecretAssignment,
  },
];

/**
 * Indica se um URI MongoDB é apenas o fallback local de desenvolvimento.
 *
 * @param {string} uri URI MongoDB encontrado no código.
 * @returns {boolean} `true` quando aponta para localhost/127.0.0.1 sem segredo.
 */
function isAllowedLocalMongoUri(uri) {
  return /^mongodb:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?(?:\/[\w-]+)?$/iu.test(uri);
}

/**
 * Deteta connection strings MongoDB que parecem apontar para infraestrutura real.
 *
 * @param {string} line Linha de código a analisar.
 * @returns {boolean} `true` quando a linha contém URI MongoDB não local.
 */
function hasUnsafeMongoUri(line) {
  const uris = line.match(/mongodb(?:\+srv)?:\/\/[^\s"'`]+/giu) ?? [];
  return uris.some((uri) => !isAllowedLocalMongoUri(uri));
}

/**
 * Deteta segredos escritos como literais, sem confundir variáveis locais legítimas.
 *
 * @param {string} line Linha de código a analisar.
 * @returns {boolean} `true` quando há sinal forte de segredo hardcoded.
 */
function hasLiteralSecretAssignment(line) {
  const match = line.match(/\b(api[_-]?key|apiKey|secret|password)\b\s*[:=]\s*([^,;]+)/iu);

  if (!match) {
    return false;
  }

  const value = match[2].trim();

  if (/^process\.env\./u.test(value)) {
    return false;
  }

  if (/^(String|assertValidPassword|hashPassword|verifyPassword)\s*\(/u.test(value)) {
    return false;
  }

  if (/^input\?\.password/u.test(value)) {
    return false;
  }

  if (/^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*$/u.test(value)) {
    return false;
  }

  return /^["'`][^"'`]+["'`]/u.test(value) || /^[A-Za-z0-9._~+/-]{3,}$/u.test(value);
}

/**
 * Lista ficheiros JavaScript e JSX de forma recursiva.
 *
 * @param {string} directory Diretoria a percorrer.
 * @returns {Promise<string[]>} Ficheiros encontrados.
 */
async function listSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const absolutePath = join(directory, entry.name);

      if (entry.isDirectory()) {
        return listSourceFiles(absolutePath);
      }

      if (/\.(js|jsx|mjs)$/u.test(entry.name)) {
        return [absolutePath];
      }

      return [];
    }),
  );

  return files.flat();
}

/**
 * Analisa um ficheiro e devolve violações encontradas.
 *
 * @param {string} filePath Caminho absoluto do ficheiro.
 * @returns {Promise<string[]>} Lista de mensagens de violação.
 */
async function scanFile(filePath) {
  const source = await readFile(filePath, "utf8");
  const location = relative(rootDir, filePath);
  const lines = source.split(/\r?\n/u);
  const failures = [];

  for (const [index, line] of lines.entries()) {
    for (const rule of textRules) {
      if (line.includes(rule.needle)) {
        // A linha aparece no erro para o aluno corrigir a causa sem procurar no ficheiro inteiro.
        failures.push(`${location}:${index + 1}: ${rule.label}`);
      }
    }

    for (const rule of sourceRules) {
      if (rule.test(line)) {
        failures.push(`${location}:${index + 1}: ${rule.label}`);
      }
    }
  }

  return failures;
}

const files = (await Promise.all(scanRoots.map(listSourceFiles))).flat();
const failures = (await Promise.all(files.map(scanFile))).flat();

if (failures.length > 0) {
  console.error("Hardening MF6: FAIL");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log("Hardening MF6: PASS");
}
```

5. Explicação do código.

O script percorre `backend/src` e `frontend/src`, ignora ficheiros fora do código fonte e procura sinais de risco: armazenamento de sessão no browser, HTML injetado diretamente, execução dinâmica, remoção sem filtro, connection strings MongoDB não locais e segredos literais prováveis. As strings de armazenamento do browser são construídas por concatenação para o próprio guia não ser confundido com uma ocorrência real durante a auditoria textual.

A deteção de segredos é feita linha a linha. Isto evita falsos positivos
importantes no projeto: uma URI local sintética sem credenciais usada em
testes, variáveis chamadas `password` antes de hash/verificação e referências
como `form.password`. A função `hasLiteralSecretAssignment()` tem um único
guard `if (!match)` e continua a falhar perante `password=123` ou
`const secret = "valor-real"`.

O script não prova que toda a aplicação é segura. Ele bloqueia padrões que não devem chegar ao gate final e obriga a equipa a justificar qualquer exceção.

6. Validação do passo.

```bash
cd backend
node scripts/check-security-baseline.mjs
```

Resultado esperado: `Hardening MF6: PASS`.

7. Cenário negativo/erro esperado.

Cria temporariamente uma cópia local de um ficheiro com `password=123` num comentário e executa o script. A verificação deve falhar. Remove a linha antes de fechar o BK.

### Passo 2 - Rever controlos backend críticos

1. Objetivo funcional do passo no contexto da app.

Confirmar que os módulos de maior risco aplicam validação, autorização, auditoria e proteção de dados.

2. Ficheiros envolvidos:
    - EDITAR: `backend/.env.example`
    - EDITAR: `backend/src/config/env.js`
    - CRIAR: `backend/src/middlewares/security.middleware.js`
    - EDITAR: `backend/src/app.js`
    - REVER: `backend/src/modules/auth/auth.password.js`
    - REVER: `backend/src/modules/users/user.service.js`
    - REVER: `backend/src/modules/privacy/privacy.service.js`
    - REVER: `backend/src/modules/integrations/integrations.validation.js`
    - REVER: `backend/src/modules/recommendations/recommendations.service.js`
    - LOCALIZAÇÃO: configuração cumulativa completa, middleware completo e montagem aditiva

3. Instruções do que fazer.

Substitui `env.js` pela composição final abaixo: ela preserva MongoDB explícito,
origins, cookie, pepper, outbox dev-only e a lane `TEST_MONGODB_*` criada em
`BK-MF2-08`. Produção só arranca com HTTPS obrigatório e um número fechado de
proxies confiáveis. Depois cria o middleware e monta-o antes de CORS, sessão e
rotas. Não confies diretamente em `X-Forwarded-Proto`; `req.secure` só é usado
depois de Express receber a configuração explícita de `trust proxy`.

4. Código completo, correto e integrado com a app final.

Acrescenta à configuração de exemplo:

```env
FORCE_HTTPS=false
TRUST_PROXY_HOPS=0
ENABLE_DEV_RESET_TOKEN_OUTBOX=false
```

`backend/src/config/env.js`

```js
import { assertE2eRuntimeEnvironment } from "../../scripts/seed-safety.js";

const DEFAULT_PORT = 3000;
const SUPPORTED_NODE_ENVS = new Set(["development", "test", "production"]);

// Erros de configuração identificam apenas o nome, nunca o valor sensível.
function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} e obrigatoria.`);
  return value;
}

function parsePort(value) {
  const parsed = Number(value ?? DEFAULT_PORT);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    throw new Error("PORT deve ser um inteiro entre 1 e 65535.");
  }
  return parsed;
}

function parseMongoUri(value) {
  if (!/^mongodb(?:\+srv)?:\/\//u.test(value)) {
    throw new Error("MONGODB_URI deve usar mongodb:// ou mongodb+srv://.");
  }
  return value;
}

function parseDatabaseName(value) {
  if (!/^[A-Za-z0-9_-]{1,64}$/u.test(value)) {
    throw new Error("O nome da base MongoDB contem caracteres invalidos.");
  }
  return value;
}

function parseOrigins(value, production) {
  return value.split(",").map((origin) => {
    const exactOrigin = origin.trim();
    const parsed = new URL(exactOrigin);
    if (parsed.origin !== exactOrigin) {
      throw new Error("FRONTEND_ORIGINS exige origins exatas.");
    }
    if (production && parsed.protocol !== "https:") {
      throw new Error("FRONTEND_ORIGINS exige HTTPS em producao.");
    }
    return parsed.origin;
  });
}

function parseRateLimitPepper(value) {
  if (typeof value !== "string" || value.length < 32) {
    throw new Error("RATE_LIMIT_PEPPER deve ter pelo menos 32 caracteres.");
  }
  return value;
}

function parseBoolean(value, name, fallback = false) {
  const normalized = value?.trim() || String(fallback);
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  throw new Error(`${name} deve ser true ou false.`);
}

function parseTrustProxyHops(value) {
  const normalized = value?.trim() || "0";
  if (!/^\d+$/u.test(normalized)) {
    throw new Error("TRUST_PROXY_HOPS deve ser um inteiro entre 0 e 10.");
  }
  const hops = Number(normalized);
  if (!Number.isInteger(hops) || hops < 0 || hops > 10) {
    throw new Error("TRUST_PROXY_HOPS deve ser um inteiro entre 0 e 10.");
  }
  return hops === 0 ? false : hops;
}

const nodeEnv = process.env.NODE_ENV?.trim() || "development";
if (!SUPPORTED_NODE_ENVS.has(nodeEnv)) {
  throw new Error("NODE_ENV invalido.");
}
const production = nodeEnv === "production";
// Em test, qualquer marker E2E ativa o guard completo; não há fallback normal.
const E2E_MARKERS = [
  "ALLOW_E2E_SEED",
  "E2E_SUITE_ID",
  "E2E_RUN_ID",
  "TEST_MONGODB_URI",
  "TEST_MONGODB_DB_NAME",
];
const formalE2eRequested = nodeEnv === "test" && E2E_MARKERS.some(
  (name) => Boolean(process.env[name]),
);

if (
  nodeEnv === "test" &&
  (process.env.MONGODB_URI || process.env.MONGODB_DB_NAME)
) {
  throw new Error(
    "NODE_ENV=test recusa MONGODB_URI e MONGODB_DB_NAME; usa TEST_MONGODB_* ou setDbForTests().",
  );
}

const e2eDatabase = formalE2eRequested
  ? assertE2eRuntimeEnvironment(process.env)
  : null;
const mongodbUri = e2eDatabase?.mongoUri ?? (
  nodeEnv === "test" ? null : parseMongoUri(required("MONGODB_URI"))
);
const mongodbDbName = e2eDatabase?.mongoDbName ?? (
  nodeEnv === "test" ? null : parseDatabaseName(required("MONGODB_DB_NAME"))
);
const forceHttps = parseBoolean(process.env.FORCE_HTTPS, "FORCE_HTTPS");
const trustProxyHops = parseTrustProxyHops(process.env.TRUST_PROXY_HOPS);
const enableDevResetTokenOutbox = parseBoolean(
  process.env.ENABLE_DEV_RESET_TOKEN_OUTBOX,
  "ENABLE_DEV_RESET_TOKEN_OUTBOX",
);

if (production && !forceHttps) {
  throw new Error("Producao exige FORCE_HTTPS=true.");
}
if (production && trustProxyHops === false) {
  throw new Error("Producao exige TRUST_PROXY_HOPS explicito.");
}
if (production && enableDevResetTokenOutbox) {
  throw new Error("A outbox dev-only e proibida em producao.");
}

export const env = Object.freeze({
  nodeEnv,
  port: parsePort(process.env.PORT),
  serviceName: production
    ? required("SERVICE_NAME")
    : process.env.SERVICE_NAME?.trim() || "faithflix-api",
  mongodbUri,
  mongodbDbName,
  frontendOrigins: parseOrigins(required("FRONTEND_ORIGINS"), production),
  sessionCookieName:
    process.env.SESSION_COOKIE_NAME?.trim() || "faithflix_session",
  rateLimitPepper: parseRateLimitPepper(required("RATE_LIMIT_PEPPER")),
  forceHttps,
  trustProxyHops,
  enableDevResetTokenOutbox,
});

export const isProduction = production;
```

Em `backend/src/config/database.js`, conserva `setDbForTests()` e faz a ligação
falhar fechada antes de construir o cliente quando a lane unitária não tem DB
injetada:

```js
export async function getMongoClient() {
  // Unitários sem markers usam apenas setDbForTests; ligação implícita é proibida.
  if (!env.mongodbUri || !env.mongodbDbName) {
    throw new Error(
      "MongoDB indisponivel em test sem TEST_MONGODB_*; injeta um DB double com setDbForTests().",
    );
  }

  if (!clientPromise) {
    const client = new MongoClient(env.mongodbUri);
    clientPromise = client.connect().catch((error) => {
      clientPromise = null;
      throw error;
    });
  }
  return clientPromise;
}
```

`getDb()` continua a devolver primeiro o double instalado por
`setDbForTests()`. Assim, testes unitários sem markers não precisam de MongoDB;
qualquer tentativa de ligação real em `test` sem a configuração E2E completa
falha antes de tocar numa base. `MONGODB_*` fica exclusivamente reservado a
`development` e `production`.

`backend/src/middlewares/security.middleware.js`

```js
import { env, isProduction } from "../config/env.js";
import { HttpError } from "../utils/http-error.js";

const API_CSP = [
  "default-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
].join("; ");
const PRIVATE_API_PREFIXES = ["/api"];

// Estes headers são aplicados antes das rotas para cobrirem também 4xx/5xx.
export function securityHeaders(req, res, next) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  res.setHeader("Content-Security-Policy", API_CSP);

  if (PRIVATE_API_PREFIXES.some((prefix) => req.path.startsWith(prefix))) {
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("Pragma", "no-cache");
  }

  if (isProduction && req.secure) {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains",
    );
  }

  next();
}

export function requireHttps(req, res, next) {
  if (!env.forceHttps || req.secure) return next();

  // `req.secure` já respeita apenas o número explícito de proxies confiáveis.
  res.setHeader("Upgrade", "TLS/1.2, HTTP/1.1");
  const error = new HttpError(426, "HTTPS obrigatorio.");
  error.code = "HTTPS_REQUIRED";
  return next(error);
}
```

O default de `/api` é deliberadamente `private, no-store`: cobre respostas
autenticadas, pessoais, administrativas e também os respetivos erros. Uma rota
realmente pública, como catálogo por allowlist, pode substituir explicitamente
este header no seu controller; só o deve fazer depois de provar que a resposta
não depende de sessão, utilizador ou entitlement. Assets estáticos fora de
`/api` mantêm a política de cache própria.

Em `backend/src/app.js`, acrescenta os imports e as linhas indicadas; não
substituas routers ou middlewares acumulados nos BK anteriores:

```js
import { env } from "./config/env.js";
import {
  requireHttps,
  securityHeaders,
} from "./middlewares/security.middleware.js";

// Dentro de createApp(), imediatamente após `const app = express()`:
app.disable("x-powered-by");
if (env.trustProxyHops !== false) {
  app.set("trust proxy", env.trustProxyHops);
}
app.use(securityHeaders);
app.use(requireHttps);
```

Por fim, revê os módulos de password, utilizadores, privacidade, integrações e
recomendações. Confirma hash, role admin, export sem segredos, consentimento,
parental, transações, revogação de sessões e envelope de erro sanitizado. O rate
limiter continua a ser exatamente a primitive Mongo/HMAC/TTL de `BK-MF2-01`;
não cries outro contador em memória.

5. Explicação do código.

`trust proxy` é configurado antes dos middlewares, portanto `req.secure` só
aceita `X-Forwarded-Proto` através do número de proxies explicitamente confiado.
Produção sem HTTPS ou sem proxy configurado falha no import de env. Headers são
aplicados antes do erro `426`, incluindo respostas negativas; HSTS só é emitido
num pedido já seguro. A CSP é adequada a uma API JSON e não substitui a CSP do
frontend se um deploy futuro servir HTML noutro processo.

Revisão manual continua necessária porque scanners não conseguem provar role,
consentimento, atomicidade ou ausência semântica de dados sensíveis.

6. Validação do passo.

Executa apenas depois de preencher um ambiente local sem segredos na evidence:

```bash
node --check src/config/env.js
node --check src/middlewares/security.middleware.js
node --check src/app.js
```

Nos testes isolados, confirma `X-Powered-By` ausente, headers em sucesso/erro,
HTTP recusado com `426 HTTPS_REQUIRED`, HSTS apenas em HTTPS de produção e
arranque recusado para `FORCE_HTTPS=false` ou proxy ausente em produção.
Regista também uma linha `PASS|FAIL` por módulo revisto, com motivo real.

7. Cenário negativo/erro esperado.

Não leias `X-Forwarded-Proto` manualmente nem uses `app.set("trust proxy", true)`:
ambos permitem que um cliente escolha a origem aparente da ligação. Se uma rota
admin não tiver guard, a exportação incluir um segredo, ou o error handler
apagar `HTTPS_REQUIRED`, o BK permanece bloqueado.

### Passo 3 - Registar evidence de hardening, backups e recuperação

1. Objetivo funcional do passo no contexto da app.

Transformar hardening, revisão manual e `RNF20` numa única evidence operacional consumida pelo gate S12.

2. Ficheiros envolvidos:
    - CRIAR: `docs/evidence/MF6/BK-MF6-03-hardening-seguranca.md`
    - REVER: documentação operacional da equipa
    - LOCALIZAÇÃO: ficheiro completo de evidence

3. Instruções do que fazer.

Cria uma evidence única para este BK. O mesmo ficheiro deve guardar o resultado do script, a revisão manual, a política de backups, a recuperação e os negativos.

Não escrevas `PASS` antes de executar os comandos e rever os módulos. Mantém os campos `PREENCHER_COM_*` até teres output real do terminal, referência da entrega e responsáveis confirmados.

4. Código completo, correto e integrado com a app final.

```md
# Evidence BK-MF6-03 - Hardening segurança e privacidade

- `document_status`: `CURRENT`
- `snapshot_date`: `-`
- `implementation_lane`: `STUDENT`
- `current_authority`: `docs/planificacao/guias-bk/MF6/BK-MF6-03-hardening-seguranca-e-privacidade.md`
- `proof_scope`: hardening estático, revisão e testes dos alunos; não prova infraestrutura, backup/restore ou produção

- Owner: Matheus
- Apoio: Kaue
- Data: PREENCHER_COM_DATA_DA_EXECUCAO
- PR/entrega: PREENCHER_COM_REFERENCIA_DO_PR_OU_ENTREGA_LOCAL
- Requisitos: RNF14, RNF16, RNF17, RNF18, RNF19, RNF20, RNF37

## Proof

| Verificação | Resultado |
| --- | --- |
| `node scripts/check-security-baseline.mjs` | PREENCHER_COM_OUTPUT_REAL_DO_SCRIPT |
| `node --test tests/regression/mf6-backend-regression.test.js` | PREENCHER_COM_OUTPUT_REAL_DA_REGRESSAO |

## Revisão manual

| Módulo | Controlo revisto | Estado | Evidência real |
| --- | --- | --- | --- |
| `auth` | Password hashing e rejeição de credenciais inválidas | PREENCHER_COM_PASS_OU_FAIL | PREENCHER_COM_FICHEIRO_FUNCAO_OU_TESTE_REVISTO |
| `users` | Rotas admin protegidas por role | PREENCHER_COM_PASS_OU_FAIL | PREENCHER_COM_FICHEIRO_FUNCAO_OU_TESTE_REVISTO |
| `privacy` | Exportação sem hashes, tokens ou campos técnicos sensíveis | PREENCHER_COM_PASS_OU_FAIL | PREENCHER_COM_FICHEIRO_FUNCAO_OU_TESTE_REVISTO |
| `integrations` | Configuração pública sem segredos | PREENCHER_COM_PASS_OU_FAIL | PREENCHER_COM_FICHEIRO_FUNCAO_OU_TESTE_REVISTO |
| `recommendations` | Dados usados apenas para recomendação baseline | PREENCHER_COM_PASS_OU_FAIL | PREENCHER_COM_FICHEIRO_FUNCAO_OU_TESTE_REVISTO |
| `csrf/origin` | Mutation autenticada exige Origin permitido e token ligado à sessão | PREENCHER_COM_PASS_OU_FAIL | PREENCHER_COM_TESTE_403_E_CODIGO |
| `rate-limit` | Contadores TTL/HMAC e resposta `429` com `Retry-After` | PREENCHER_COM_PASS_OU_FAIL | PREENCHER_COM_TESTE_COMPORTAMENTAL |
| `transport/headers` | HTTPS fail-closed, cookies e headers defensivos | PREENCHER_COM_PASS_OU_FAIL | PREENCHER_COM_TESTE_426_E_HEADERS |
| `reset/privacy` | Operações destrutivas atómicas e revogação de sessões | PREENCHER_COM_PASS_OU_FAIL | PREENCHER_COM_TESTE_DE_CONCORRENCIA |
| `errors` | Envelope estável sem detalhes internos em `5xx` | PREENCHER_COM_PASS_OU_FAIL | PREENCHER_COM_TESTE_DE_ERRO |

## Política de backups

| Item | Estado | Evidência |
| --- | --- | --- |
| Frequência mínima diária definida | PREENCHER_COM_PASS_OU_FAIL | PREENCHER_COM_DOCUMENTO_OU_REGISTO_OPERACIONAL |
| Responsável por validar cópia | PREENCHER_COM_PASS_OU_FAIL | PREENCHER_COM_RESPONSAVEL_REAL |
| Responsável técnico pelo ensaio | PREENCHER_COM_PASS_OU_FAIL | PREENCHER_COM_RESPONSAVEL_REAL |
| Segredos fora do repositório | PREENCHER_COM_PASS_OU_FAIL | PREENCHER_COM_RESULTADO_DA_REVISAO |
| Ensaio de recuperação planeado | PREENCHER_COM_PASS_OU_FAIL | PREENCHER_COM_COMANDO_OU_PROCEDIMENTO_DE_RECUPERACAO |

## Negativos

| Cenário | Como provocar em cópia local | Resultado esperado | Resultado real |
| --- | --- | --- | --- |
| Credencial literal no código | Adicionar temporariamente uma linha de teste com segredo literal numa cópia local | Script falha e aponta o ficheiro | PREENCHER_COM_RESULTADO_REAL |
| Rota admin sem role | Rever uma rota admin sem `requireRole(["admin"])` numa cópia local ou revisão controlada | Evidence fica `FAIL` com ficheiro indicado | PREENCHER_COM_RESULTADO_REAL |
| Mutation sem CSRF/Origin válido | Pedido autenticado de browser sem token ou com Origin fora da allowlist | `403 CSRF_INVALID` ou `403 ORIGIN_FORBIDDEN` | PREENCHER_COM_RESULTADO_REAL |
| Limite excedido | Repetir pedidos no limite controlado de teste | `429 RATE_LIMITED` e `Retry-After` | PREENCHER_COM_RESULTADO_REAL |
| HTTP com HTTPS obrigatório | Executar pedido inseguro com `FORCE_HTTPS=true` | `426 HTTPS_REQUIRED` | PREENCHER_COM_RESULTADO_REAL |
| Token de reset concorrente | Consumir o mesmo token em dois pedidos concorrentes | Apenas um sucesso; o outro recebe `RESET_TOKEN_INVALID` | PREENCHER_COM_RESULTADO_REAL |
| Política sem frequência ou responsável | Remover temporariamente frequência ou responsável da checklist local | Gate rejeita a proof | PREENCHER_COM_RESULTADO_REAL |
```

5. Explicação do código.

Este ficheiro é evidence operacional. Ele junta a prova automática, a revisão manual e a política de backups num único artefacto, para `BK-MF6-06` conseguir consolidar o gate sem procurar nomes diferentes para a mesma responsabilidade.

O BK não implementa infraestrutura real de backups, mas deixa o contrato mínimo verificável para `RNF20`: frequência, responsável, dados incluídos e ensaio de recuperação.

Os placeholders `PREENCHER_COM_*` evitam sucesso antecipado. Só deves trocar esses campos por `PASS`, `FAIL`, output ou nomes concretos depois de executar cada comando, rever cada módulo e registar a referência real da entrega.

6. Validação do passo.

O orientador consegue ler o ficheiro e perceber que comando foi executado, que módulos foram revistos, quem valida a cópia, o que é guardado e como a recuperação é confirmada. Antes de fechar o BK, confirma que já não existe nenhum `PREENCHER_COM_*`.

7. Cenário negativo/erro esperado.

Se a evidence disser apenas "segurança verificada" ou "fazer backup" sem proof, frequência, responsável e teste de recuperação, não cumpre o BK.

### Passo 4 - Executar hardening e regressão

1. Objetivo funcional do passo no contexto da app.

Fechar segurança com análise estática e garantir que a regressão backend continua verde.

2. Ficheiros envolvidos:
    - REVER: `backend/scripts/check-security-baseline.mjs`
    - REVER: `backend/tests/regression/mf6-backend-regression.test.js`
    - LOCALIZAÇÃO: comandos na raiz `backend`

3. Instruções do que fazer.

Executa os comandos abaixo. Se a análise estática falhar, corrige a causa ou regista ação corretiva com responsável.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

A validação executa o script criado no passo 1 e a regressão criada em `BK-MF6-01`.

Hardening sem regressão pode introduzir quebra funcional. Por isso, a validação combina análise de risco e testes existentes.

6. Validação do passo.

```bash
cd backend
node scripts/check-security-baseline.mjs
node --test tests/unit/security-controls.test.js
node --test tests/regression/mf6-backend-regression.test.js
```

Resultado esperado: os três comandos terminam em `PASS`. O scanner não substitui os testes comportamentais.

7. Cenário negativo/erro esperado.

Se o script encontrar credencial provável em código fonte, a validação deve falhar. A correção é mover o valor para variável de ambiente e remover o valor do ficheiro versionado.

#### Critérios de aceite

- `check-security-baseline.mjs` existe e executa sem dependências novas.
- A revisão manual cobre auth, users, privacy, integrations e recommendations.
- Testes comportamentais cobrem CSRF/Origin, rate limiting, HTTPS/headers, envelope de erro, reset/revogação, consentimentos e parental.
- A evidence `BK-MF6-03-hardening-seguranca.md` existe, inclui `PR/entrega`, output real, política de backups e recuperação.
- A evidence não fica com `PASS` pré-preenchido antes da execução.
- A regressão backend continua verde depois do hardening.
- Existem pelo menos 3 negativos documentados para prioridade `P0`.
- Nenhum `PASS` histórico anterior à Fase 2 é reutilizado como prova de CP2 atual.
- Os dez scopes da tabela têm prova positiva e negativa; alterar ou omitir um
  limite reprova o hardening.
- Produção recusa `FORCE_HTTPS=false`, proxy ausente, outbox dev ativa e origin
  HTTP; erros de env nunca incluem os respetivos valores.
- `X-Powered-By` está desativado; headers defensivos existem em sucesso e erro.
- HTTP com HTTPS obrigatório devolve `426 HTTPS_REQUIRED`; HSTS só aparece em
  pedidos seguros de produção e `req.secure` depende do proxy explicitamente confiado.
- A lane `test` com markers consome o guard completo `TEST_MONGODB_*` de
  MF2-08; sem markers mantém MongoDB indisponível e aceita apenas DB injetada
  por `setDbForTests()`. Nunca seleciona `MONGODB_*`.
- Toda a API começa com `Cache-Control: private, no-store`; apenas controllers
  públicos por allowlist podem declarar outra política sem depender da sessão.
- Backup/restore só fica validado com Database Tools e restore temporário real;
  a ausência das ferramentas é registada como `BLOQUEADO_AMBIENTE`.

#### Validação final

```bash
cd backend
node scripts/check-security-baseline.mjs
node --test tests/unit/security-controls.test.js
node --test tests/regression/mf6-backend-regression.test.js
```

#### Evidence para PR/defesa

- `pr`: referência do PR ou entrega local com script e evidence.
- `proof`: output real do script de hardening, regressão backend, revisão manual e política de backups.
- `proof`: output dos testes comportamentais da Fase 2, registado numa secção nova e datada sem reescrever a evidence histórica.
- `neg`: credencial provável, admin sem role, CSRF/Origin inválido, rate limit, HTTP recusado, reset concorrente e política de backup incompleta.

#### Handoff

`BK-MF6-04` deve medir performance depois de confirmar que os controlos de segurança e privacidade continuam ativos. Otimização não deve remover validações, guards ou auditoria.

#### Changelog

- `2026-07-10`: criada configuração final fail-closed, trusted proxy numérico,
  middleware HTTPS/headers completo, `X-Powered-By` removido e montagem aditiva.
- `2026-04-13`: guia inicial criado em formato genérico.
- `2026-06-18`: guia revisto com análise estática de segurança, checklist RNF e evidence operacional consolidada.
- `2026-06-19`: evidence corrigida para usar placeholders, `PR/entrega`, output real e negativos rastreáveis antes do gate.
- `2026-07-10`: confirmada a sintaxe do scanner, fixada a revisão do limiter
  autoritativo de MF2-01 e acrescentada metadata D0 à evidence embutida.
