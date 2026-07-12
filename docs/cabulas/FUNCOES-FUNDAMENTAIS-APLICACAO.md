# Funções Fundamentais Da Aplicação - FaithFlix

Data do levantamento: 2026-07-12
Base do levantamento: `real_dev/backend/src` e `real_dev/frontend/src`
Estado documental: `CURRENT`

## Critérios

- A lista foi regenerada por AST a partir do código atual em `real_dev`.
- Inclui funções e métodos nomeados de runtime com JSDoc: controllers, services, componentes React, páginas, clientes HTTP, middlewares, validators e helpers nomeados.
- Inclui helpers privados quando fazem validação, autorização, transformação de dados, segurança, persistência ou suporte operacional relevante.
- Exclui testes, callbacks anónimos inline, artefactos gerados, `node_modules`, `dist`, reports e construtores.
- Cada entrada mostra a assinatura curta, o tipo de símbolo, a descrição principal, as entradas documentadas e o valor devolvido.
- Este inventário prova a presença estática dos símbolos; não substitui testes runtime, validação de transações, migrações ou serviços externos.

## Resumo

- Backend: 717 funções/métodos em 120 ficheiros.
- Frontend: 393 funções/métodos em 103 ficheiros.
- Total: 1110 funções/métodos fundamentais listados em 223 ficheiros.

## Backend

### `real_dev/backend/src/app.js`

- `createApp()` (exportada; função) - Cria a aplicação Express com middlewares e routers principais. Entradas: sem entradas explícitas. Devolve: Aplicação configurada.

### `real_dev/backend/src/bootstrap/ensure-application-indexes.js`

- `ensureApplicationIndexes()` (exportada; função) - Cria todos os índices usados pela aplicação e pelos datasets de demo. Entradas: sem entradas explícitas. Devolve: Termina quando todas as constraints existem.

### `real_dev/backend/src/config/cors.js`

- `parseAllowedOrigins(value, [options={}])` (exportada; função) - Interpreta uma lista de origens separadas por vírgulas a partir de uma variável de ambiente. Entradas: value: Valor bruto de `process.env.FRONTEND_ORIGIN`; [options]: Override puro usado por testes. Devolve: Lista de origens de navegador permitidas.

### `real_dev/backend/src/config/database.js`

- `getMongoClient()` (exportada; função) - Abre e memoriza o cliente MongoDB, limpando a cache quando a ligação falha. Entradas: sem entradas explícitas. Devolve: Cliente ligado.
- `isTransientTransactionError(error)` (top-level; função) - Identifica erros que justificam repetir toda a unidade transacional. `UnknownTransactionCommitResult` nunca repete a callback: o estado do commit é incerto e o driver já trata retries de commit dentro de `withTransaction`. Reexecutar todo o domínio nesse caso poderia duplicar efeitos. Entradas: error: Erro devolvido pelo driver ou por um double. Devolve: Verdadeiro apenas para labels transientes MongoDB.
- `executeTransactionAttempt(work, transactionOptions)` (top-level; função) - Executa uma única tentativa com sessão MongoDB real ou double injetado. Entradas: work: Trabalho; transactionOptions: Opções do driver. Devolve: Resultado da tentativa.
- `getDb()` (exportada; função) - Devolve a base de dados MongoDB configurada, reutilizando uma ligação de cliente. Entradas: sem entradas explícitas. Devolve: Base de dados MongoDB usada pelo backend FaithFlix.
- `assertActiveTransaction()` (exportada; função) - Exige que a chamada atual pertença a uma unidade aberta por `runInTransaction`. A verificação usa o contexto assíncrono em vez de depender da presença de um `ClientSession`: doubles locais podem não fornecer uma sessão MongoDB, mas continuam a atravessar `runInTransaction` e, por isso, preservam o mesmo contrato fail-closed dos caminhos reais. Entradas: sem entradas explícitas. Devolve: Sem valor devolvido.
- `runInTransaction(work, [options={}])` (exportada; função) - Executa uma unidade de trabalho numa transação MongoDB real. Doubles de teste podem fornecer `runInTransaction`; quando não fornecem, a callback recebe a DB injetada sem sessão para manter os unitários isolados. A aplicação real nunca faz fallback não transacional. Entradas: work: Trabalho atómico; [options]: Opções do driver e máximo de tentativas externas. Devolve: Resultado devolvido pela callback depois do commit.
- `assertTransactionSupport([maxTimeMS=1000])` (exportada; função) - Confirma que a topologia suporta transações multi-documento. Produção chama este guard antes de criar índices ou aceitar tráfego. O método não revela URI, hostname ou credenciais nas mensagens de erro. Entradas: [maxTimeMS=1000]: Budget do comando `hello`. Devolve: Valor documentado como `Promise<void>`.
- `pingDatabase([maxTimeMS=500])` (exportada; função) - Verifica a dependência MongoDB com um budget curto. Entradas: [maxTimeMS=500]: Tempo máximo do ping. Devolve: Valor documentado como `Promise<void>`.
- `closeDatabase()` (exportada; função) - Fecha a ligação real do processo; doubles de teste não são afetados. Entradas: sem entradas explícitas. Devolve: Valor documentado como `Promise<void>`.
- `setDbForTests(db)` (exportada; função) - Substitui a base de dados usada pelos serviços durante suites node:test. Entradas: db: Duplo de teste, ou null para restaurar MongoDB. Devolve: Sem valor devolvido.

### `real_dev/backend/src/config/env.js`

- `loadLocalEnvFile()` (top-level; função) - Carrega o `.env` local antes de construir a configuração efetiva. `process.loadEnvFile` preserva variáveis já exportadas pelo processo. O conteúdo do ficheiro nunca é escrito em logs ou mensagens de erro. Entradas: sem entradas explícitas. Devolve: Sem valor devolvido.
- `createEnvironmentError(names)` (top-level; função) - Cria um erro sanitizado com apenas os nomes das variáveis inválidas. Entradas: names: Nomes das variáveis inválidas. Devolve: Erro seguro.
- `isNonEmptyString(value)` (top-level; função) - Indica se um valor de ambiente é uma string não vazia. Entradas: value: Valor bruto. Devolve: Verdadeiro quando existe conteúdo útil.
- `parsePort(value, invalidNames)` (top-level; função) - Converte `PORT` num número TCP válido, registando apenas o nome em erro. Entradas: value: Valor bruto; invalidNames: Acumulador de variáveis inválidas. Devolve: Porta normalizada.
- `parseBoolean(value, fallback, name, invalidNames)` (top-level; função) - Interpreta uma flag booleana estrita. Entradas: value: Valor bruto; fallback: Valor usado quando a variável está ausente; name: Nome da variável; invalidNames: Acumulador de variáveis inválidas. Devolve: Flag normalizada.
- `parseTrustProxy(value, invalidNames)` (top-level; função) - Interpreta a confiança no reverse proxy sem aceitar confiança global. Entradas: value: Valor bruto; invalidNames: Acumulador de variáveis inválidas. Devolve: Número explícito de proxies ou `false`.
- `buildEnv([source={}])` (exportada; função) - Constrói a configuração do backend sem consultar ou alterar estado global. Produção exige identidade de serviço, alvo MongoDB, pepper forte, HTTPS explicitamente ativo e um número fechado de proxies confiáveis. Esta identidade explícita é necessária para distinguir logs e health checks de processos diferentes durante operação e diagnóstico. Entradas: [source={}]: Mapa equivalente a `process.env`. Devolve: Configuração validada.

### `real_dev/backend/src/config/session.js`

- `getSessionCookieOptions([overrides={}])` (exportada; função) - Constrói opções seguras para o cookie de sessão FaithFlix. Entradas: [overrides={}]: Options that intentionally override the defaults. Devolve: Opções de cookie usadas ao definir ou limpar o cookie de sessão.

### `real_dev/backend/src/middlewares/cors.middleware.js`

- `corsMiddleware(req, res, next)` (exportada; função) - Adiciona cabeçalhos CORS para as origens frontend configuradas. Entradas: req: Pedido HTTP atual; res: Resposta HTTP onde os cabeçalhos CORS podem ser definidos; next: Callback Express usado para continuar a pipeline. Devolve: Termina pedidos preflight ou continua pedidos normais.

### `real_dev/backend/src/middlewares/csrf.middleware.js`

- `csrfProtection(req, _res, next)` (exportada; função) - Valida pedidos mutáveis iniciados por browsers. Clientes server-to-server sem `Origin` nem Fetch Metadata continuam aceites; browsers autenticados têm de apresentar origin allowlisted e token CSRF. Entradas: req: Pedido; _res: Resposta não usada; next: Continuação Express. Devolve: Valor documentado como `Promise<void>`.

### `real_dev/backend/src/middlewares/error.middleware.js`

- `notFoundHandler(req, _res, next)` (exportada; função) - Converte pedidos sem rota correspondente num erro JSON 404. Entradas: req: Pedido HTTP atual; _res: Objeto de resposta não usado; next: Express callback used to forward the generated error. Devolve: Sem valor devolvido.
- `errorHandler(error, req, res, _next)` (exportada; função) - Converte erros lançados em respostas JSON seguras e logs estruturados. Entradas: error: Erro recebido de rotas ou middlewares; req: Pedido HTTP atual; res: Resposta HTTP usada para devolver o erro JSON; _next: Unused Express callback required by the error middleware signature. Devolve: Resposta Express com erro normalizado.

### `real_dev/backend/src/middlewares/rate-limit.middleware.js`

- `ensureRateLimitIndexes()` (exportada; função) - Cria os índices dos contadores com expiração automática. Entradas: sem entradas explícitas. Devolve: Valor documentado como `Promise<void>`.
- `hashRateLimitKey(value)` (top-level; função) - Pseudonimiza IP, email ou user id antes de persistir o contador. Entradas: value: Identificador bruto. Devolve: HMAC SHA-256.
- `reserveRateLimit({...})` (exportada; função) - Reserva atomicamente uma tentativa numa janela fixa. O chamador pode libertar a reserva depois de um sucesso. Assim, o contador persistente representa apenas falhas sem perder a serialização distribuída. Entradas: options: Configuração. Devolve: Reserva criada.
- `releaseRateLimit(reservation)` (exportada; função) - Remove a tentativa reservada quando a operação terminou com sucesso. Entradas: reservation: Reserva anterior. Devolve: Valor documentado como `Promise<void>`.
- `rateLimitExceededError(reservation)` (exportada; função) - Constrói o erro público para uma reserva que ultrapassou o limite. Entradas: reservation: Reserva excedida. Devolve: Valor documentado como `HttpError`.
- `rateLimit({...})` (exportada; função) - Cria middleware configurável de rate limit. Entradas: options: Configuração. Devolve: Middleware assíncrono.

### `real_dev/backend/src/middlewares/request-logger.middleware.js`

- `safeRequestId(value)` (exportada; função) - Aceita apenas identificadores curtos, visíveis e sem whitespace/controlos. Entradas: value: Header recebido. Devolve: Identificador normalizado ou `null`.
- `requestLogger(req, res, next)` (exportada; função) - Adiciona um id de pedido, expõe-no na resposta e regista a conclusão do pedido. Entradas: req: Pedido HTTP atual; res: Resposta HTTP onde `x-request-id` é definido; next: Callback Express usado para continuar a pipeline. Devolve: Sem valor devolvido.

### `real_dev/backend/src/middlewares/security.middleware.js`

- `securityHeaders(req, res, next)` (exportada; função) - Aplica headers defensivos a todas as respostas da API. Entradas: req: Pedido atual; res: Resposta atual; next: Continuação Express. Devolve: Sem valor devolvido.
- `requireHttps(req, _res, next)` (exportada; função) - Rejeita transporte HTTP quando o deployment declarou HTTPS obrigatório. Entradas: req: Pedido atual; _res: Resposta não usada; next: Continuação Express. Devolve: Sem valor devolvido.

### `real_dev/backend/src/middlewares/session.middleware.js`

- `attachSession(req, _res, next)` (exportada; função) - Associa o estado atual da sessão ao pedido Express. Entradas: req: Pedido HTTP atual; _res: Objeto de resposta não usado; next: Callback Express usado para continuar ou encaminhar erros. Devolve: Termina depois de associar o estado da sessão.

### `real_dev/backend/src/modules/admin-metrics/admin-metrics.controller.js`

- `getMetrics(req, res)` (exportada; função) - Devolve metricas administrativas agregadas. Entradas: req: Pedido HTTP; res: Resposta HTTP. Devolve: Resposta com metricas.
- `exportMetricsCsv(req, res)` (exportada; função) - Descarrega apenas os totais agregados num ficheiro CSV privado. Entradas: req: Pedido admin autenticado; res: Resposta de ficheiro. Devolve: CSV com headers seguros.

### `real_dev/backend/src/modules/admin-metrics/admin-metrics.service.js`

- `count(db, collectionName, [query={}])` (top-level; função) - Conta documentos sem devolver detalhes individuais. Entradas: db: Ligacao MongoDB; collectionName: Nome da colecao; [query={}]: Filtro MongoDB. Devolve: Total encontrado.
- `sumCents(db, collectionName, match, field)` (top-level; função) - Soma um campo em centimos mantendo resposta agregada. Entradas: db: Ligacao MongoDB; collectionName: Nome da colecao; match: Filtro MongoDB; field: Campo numerico. Devolve: Soma em centimos.
- `getAdminMetrics([query={}])` (exportada; função) - Calcula metricas administrativas de operacao sem expor dados pessoais. Entradas: query: Query string validavel. Devolve: Metricas agregadas.
- `exportAdminMetricsCsv([query={}])` (exportada; função) - Converte apenas totais agregados para CSV, sem linhas individuais ou PII. Entradas: query: Intervalo civil UTC. Devolve: CSV UTF-8 com cabeçalho estável.

### `real_dev/backend/src/modules/admin-metrics/admin-metrics.validation.js`

- `optionalDate(value, field)` (top-level; função) - Converte uma data opcional da query string. Entradas: value: Valor recebido; field: Nome do campo. Devolve: Início UTC do dia validado.
- `assertMetricsRange([query={}])` (exportada; função) - Valida intervalo temporal de metricas admin. Entradas: query: Query string recebida. Devolve: Intervalo UTC semiaberto.

### `real_dev/backend/src/modules/analytics/analytics.controller.js`

- `postAnonymousMetric(req, res)` (exportada; função) - Aceita um evento sem revelar ao browser o estado do consentimento. Entradas: req: Pedido autenticado; res: Resposta vazia. Devolve: HTTP 204 tanto em opt-in como opt-out.

### `real_dev/backend/src/modules/analytics/analytics.service.js`

- `userObjectId(userId)` (top-level; função) - Converte o utilizador autenticado apenas para consultar consentimento. Este identificador nunca é copiado para o documento analítico. Entradas: userId: Id da sessão. Devolve: Id MongoDB.
- `utcDay(date)` (top-level; função) - Cria o início UTC do dia sem preservar hora ou timezone do cliente. Entradas: date: Instante válido. Devolve: Meia-noite UTC.
- `ensureAnonymousMetricIndexes()` (exportada; função) - Garante os índices de retenção e agregação anónima. Entradas: sem entradas explícitas. Devolve: Termina quando os índices existem.
- `recordAnonymousMetric(userId, input, [options={}])` (exportada; função) - Regista uma métrica apenas quando o consentimento atual está ativo. O documento persistido contém exclusivamente tipo, categoria opcional, dia UTC e expiração. O id usado na leitura de consentimento nunca é persistido. Entradas: userId: Id autenticado; input: Evento fechado; [options]: Dependências para testes. Devolve: Verdadeiro quando existiu escrita.

### `real_dev/backend/src/modules/analytics/analytics.validation.js`

- `assertAnonymousMetricEvent(input)` (exportada; função) - Valida um evento sem aceitar metadados livres. Entradas: input: Corpo recebido. Devolve: Evento normalizado.

### `real_dev/backend/src/modules/audit/audit.service.js`

- `sanitizeAuditValue(value)` (top-level; função) - Remove segredos de snapshots antes de os guardar no audit log. Entradas: value: Valor de domínio. Devolve: Cópia serializável sem campos sensíveis.
- `ensureAuditIndexes()` (exportada; função) - Garante índices de consulta e deduplicação do audit administrativo. Entradas: sem entradas explícitas. Devolve: Valor documentado como `Promise<void>`.
- `writeAdminAudit(input)` (exportada; função) - Persiste um evento no mesmo contexto transacional da alteração auditada. Entradas: input: Evento e contexto. Devolve: Id público do evento.

### `real_dev/backend/src/modules/auth/auth.controller.js`

- `setSessionCookie(res, token)` (top-level; função) - Writes the session cookie using the secure defaults from MF1. Entradas: res: Resposta HTTP; token: Token opaco de sessão. Devolve: Sem valor devolvido.
- `register(req, res)` (exportada; função) - Regista um utilizador e inicia uma sessão. Entradas: req: Pedido com dados de registo; res: Resposta usada para definir o cookie. Devolve: Resposta de utilizador criado.
- `login(req, res)` (exportada; função) - Autentica um utilizador e inicia uma sessão. Entradas: req: Pedido com dados de login; res: Resposta usada para definir o cookie. Devolve: Resposta de utilizador autenticado.
- `forgotPassword(req, res)` (exportada; função) - Cria um pedido de recuperação de password. Entradas: req: Pedido com dados de email; res: Resposta HTTP. Devolve: Resposta genérica de recuperação.
- `resetPasswordController(req, res)` (exportada; função) - Resets a password using a valid reset token. Entradas: req: Pedido com token e password; res: Resposta HTTP. Devolve: Resposta de sucesso.

### `real_dev/backend/src/modules/auth/auth.indexes.js`

- `ensureAuthIndexes()` (exportada; função) - Garante que existem os índices exigidos pelos fluxos de autenticação. Entradas: sem entradas explícitas. Devolve: Termina depois de o MongoDB criar ou confirmar índices.

### `real_dev/backend/src/modules/auth/auth.middleware.js`

- `markPrivateResponse(res)` (exportada; função) - Marca respostas associadas a sessão como privadas e não reutilizáveis. A função é chamada antes de validar autenticação para que respostas `401` e `403` também não possam ser guardadas por proxies partilhados. Entradas: res: Resposta HTTP atual. Devolve: Sem valor devolvido.
- `requireAuth(req, res, next)` (exportada; função) - Exige um utilizador autenticado válido no pedido atual. Entradas: req: Pedido atual; res: Resposta HTTP marcada como privada; next: Next middleware callback. Devolve: Continua ou devolve 401.
- `requireRole(allowedRoles)` (exportada; função) - Exige que o utilizador autenticado tenha uma das roles permitidas. Entradas: allowedRoles: Roles aceites pela rota protegida. Devolve: Middleware Express.

### `real_dev/backend/src/modules/auth/auth.password.js`

- `hashPassword(password)` (exportada; função) - Hashes a password with a random salt using Node's scrypt implementation. Entradas: password: Plain password received during register/reset. Devolve: Representação guardada no formato `salt:hash`.
- `verifyPassword(password, storedHash)` (exportada; função) - Verifies a password against a stored `salt:hash` value. Entradas: password: Plain password to verify; storedHash: Stored `salt:hash` value. Devolve: Verdadeiro quando a password corresponde.

### `real_dev/backend/src/modules/auth/auth.service.js`

- `canLogin(user)` (top-level; função) - Confirma se um documento representa uma conta que pode iniciar sessão. Estados desconhecidos falham fechados; documentos legacy sem estado mantêm a compatibilidade histórica como contas ativas. Entradas: user: Documento de utilizador encontrado. Devolve: Verdadeiro apenas para uma conta operacional.
- `hasSupportedPasswordHash(passwordHash)` (top-level; função) - Confirma o formato produzido por `hashPassword`, antes de permitir que esse valor substitua o hash dummy usado para equalizar o trabalho criptográfico. Entradas: passwordHash: Hash persistido no documento de utilizador. Devolve: Verdadeiro quando o formato `salt:key` é suportado.
- `isUnknownTransactionCommitResult(error)` (top-level; função) - Identifica um commit cujo resultado final permaneceu desconhecido depois dos retries internos do driver. Entradas: error: Erro MongoDB ou double fiel. Devolve: Verdadeiro apenas para `UnknownTransactionCommitResult`.
- `reconcileUnknownRegistration(email, attempted)` (top-level; função) - Reconcilia um registo depois de um resultado de commit desconhecido. Só devolve sucesso quando encontra exatamente o utilizador e a sessão/token criados pela callback desta tentativa. Um utilizador anterior com o mesmo email nunca satisfaz a comparação de `_id` e `tokenHash`. Entradas: email: Email normalizado; attempted: Resultado construído antes do commit. Devolve: Resultado reconciliado ou null.
- `isDevResetOutboxEnabled()` (top-level; função) - Verifica se a outbox dev-only separada de tokens de recuperação está ativa. Entradas: sem entradas explícitas. Devolve: Verdadeiro apenas em ambientes não produtivos com a flag explícita ativa.
- `writeDevResetOutbox(db, {...})` (top-level; função) - Guarda o token de recuperação original numa outbox dev-only separada para evidência PAP. Entradas: db: Base de dados MongoDB; tokenData: Dados de evidência do token de recuperação. Devolve: Termina depois de escrever opcionalmente a entrada da outbox.
- `registerUser(input)` (exportada; função) - Regista um utilizador e cria a sessão autenticada inicial. Entradas: input: Dados de registo. Devolve: Utilizador público e token de sessão.
- `loginUser(input, [options={}])` (exportada; função) - Autentica um utilizador com email e password. Entradas: input: Dados de login; [options]: Hooks internos; o verifier injetável permite observar o contrato criptográfico em testes isolados. Devolve: Utilizador público e token de sessão.
- `requestPasswordReset(input, [options={}])` (exportada; função) - Cria um token de recuperação de password quando o email existe. Entradas: input: Dados de recuperação de password; [options]: Dependências opcionais para testes. Devolve: Resposta pública genérica.
- `getLatestDevPasswordResetToken(emailInput, [options={}])` (exportada; função) - Lê o token de recuperação mais recente da outbox dev-only separada. Entradas: emailInput: Email cujo token dev de recuperação mais recente deve ser lido; [options]: Dependências opcionais para testes. Devolve: Registo dev-only mais recente do token.
- `resetPassword(input)` (exportada; função) - Substitui uma password usando um token válido ainda não usado. Entradas: input: Dados de reset. Devolve: Success message.

### `real_dev/backend/src/modules/auth/auth.validation.js`

- `normalizeEmail(email)` (exportada; função) - Normalizes an email before validation or lookup. Entradas: email: Valor bruto de email recebido no pedido. Devolve: Trimmed lowercase email.
- `assertValidName(name)` (exportada; função) - Valida e devolve o nome público do utilizador. Entradas: name: Valor bruto do nome. Devolve: Valid trimmed name.
- `assertValidEmail(email)` (exportada; função) - Valida e devolve um email normalizado. Entradas: email: Valor bruto do email. Devolve: Valid normalized email.
- `assertValidPassword(password)` (exportada; função) - Valida e devolve uma password. Entradas: password: Valor bruto da password. Devolve: Valid password.

### `real_dev/backend/src/modules/auth/csrf.service.js`

- `rotateCsrfToken(sessionToken)` (exportada; função) - Roda o token CSRF da sessão autenticada. Entradas: sessionToken: Token do cookie HttpOnly. Devolve: Token bruto entregue apenas ao cliente atual.
- `verifyCsrfToken(sessionToken, csrfToken)` (exportada; função) - Confirma que o token recebido pertence à sessão atual. Entradas: sessionToken: Token de sessão; csrfToken: Token recebido no header. Devolve: Resultado em tempo constante para hashes válidos.

### `real_dev/backend/src/modules/auth/session.controller.js`

- `getCurrentSession(req, res)` (exportada; função) - Devolve a sessão atualmente autenticada, quando existe. Entradas: req: Pedido HTTP atual; res: Resposta HTTP usada para devolver dados da sessão. Devolve: Resposta JSON que descreve o estado da sessão.
- `getCsrfToken(req, res)` (exportada; função) - Roda e devolve o token CSRF da sessão atual sem o persistir no frontend. Entradas: req: Pedido atual; res: Resposta HTTP. Devolve: Token CSRF com cache desativada.
- `logout(req, res)` (exportada; função) - Limpa o cookie de sessão e devolve resposta de logout com sucesso. Entradas: req: Pedido HTTP atual; res: Resposta HTTP onde o cookie expirado é escrito. Devolve: Resposta vazia que confirma logout.

### `real_dev/backend/src/modules/auth/session.service.js`

- `toPublicUser(user)` (exportada; função) - Converte um documento interno de utilizador para o formato público de sessão. Entradas: user: MongoDB user document. Devolve: Dados públicos do utilizador.
- `canAuthenticate(user)` (top-level; função) - Verifica se uma conta pode manter uma sessao autenticada. Entradas: user: Documento de utilizador. Devolve: Verdadeiro apenas para contas operacionais.
- `createSession(user, [options={}])` (exportada; função) - Cria uma sessão no servidor e devolve o token opaco do cookie. Entradas: user: Documento de utilizador que recebe a nova sessão; [options]: Contexto transacional opcional; `ensureIndexes:false` só é usado quando o caller já garantiu os índices antes da transação. Devolve: Token opaco de sessão para guardar no cookie HttpOnly.
- `resolveSession(sessionToken)` (exportada; função) - Resolve um token de sessão para o utilizador público autenticado. Entradas: sessionToken: Token read from the session cookie. Devolve: Sessão resolvida ou null.
- `deleteSession(sessionToken)` (exportada; função) - Apaga uma sessão no servidor pelo token do cookie. Entradas: sessionToken: Token lido do pedido atual. Devolve: Termina depois de apagar ou ignorar a sessão.

### `real_dev/backend/src/modules/auth/token.js`

- `createOpaqueToken()` (exportada; função) - Cria um token opaco sem dados de utilizador embutidos. Entradas: sem entradas explícitas. Devolve: Random token suitable for session or reset flows.
- `isOpaqueToken(token)` (exportada; função) - Verifica se um valor parece um token opaco FaithFlix. Entradas: token: Valor bruto do token. Devolve: Verdadeiro for 64-character hexadecimal tokens.
- `hashToken(token)` (exportada; função) - Hashes a token before storing or querying it. Entradas: token: Valor do token opaco. Devolve: SHA-256 token hash.

### `real_dev/backend/src/modules/biblical-passages/biblical-passages.controller.js`

- `getBiblicalPassages(req, res)` (exportada; função) - Lista passagens bíblicas publicadas. Entradas: req: Pedido HTTP; res: Resposta HTTP. Devolve: Resposta JSON.
- `getBiblicalPassage(req, res)` (exportada; função) - Obtém uma passagem bíblica publicada. Entradas: req: Pedido HTTP; res: Resposta HTTP. Devolve: Resposta JSON.
- `getAdminBiblicalPassages(req, res)` (exportada; função) - Lista passagens bíblicas para gestão editorial. Entradas: req: Pedido HTTP; res: Resposta HTTP. Devolve: Resposta JSON.
- `postBiblicalPassage(req, res)` (exportada; função) - Cria uma passagem bíblica como rascunho. Entradas: req: Pedido HTTP; res: Resposta HTTP. Devolve: Resposta JSON.
- `patchBiblicalPassage(req, res)` (exportada; função) - Atualiza uma passagem bíblica existente. Entradas: req: Pedido HTTP; res: Resposta HTTP. Devolve: Resposta JSON.
- `patchBiblicalPassageStatus(req, res)` (exportada; função) - Altera o estado editorial de uma passagem bíblica. Entradas: req: Pedido HTTP; res: Resposta HTTP. Devolve: Resposta JSON.
- `getCatalogBiblicalPassages(req, res)` (exportada; função) - Lista passagens bíblicas publicadas associadas a um conteúdo publicado. Entradas: req: Pedido HTTP; res: Resposta HTTP. Devolve: Resposta JSON.
- `getAdminCatalogBiblicalPassages(req, res)` (exportada; função) - Lista associações bíblicas de um conteúdo para gestão editorial. Entradas: req: Pedido HTTP; res: Resposta HTTP. Devolve: Resposta JSON.
- `postCatalogBiblicalPassage(req, res)` (exportada; função) - Associa uma passagem bíblica a um conteúdo. Entradas: req: Pedido HTTP; res: Resposta HTTP. Devolve: Resposta JSON.
- `deleteCatalogBiblicalPassage(req, res)` (exportada; função) - Remove a associação entre passagem bíblica e conteúdo. Entradas: req: Pedido HTTP; res: Resposta HTTP. Devolve: Resposta JSON.

### `real_dev/backend/src/modules/biblical-passages/biblical-passages.service.js`

- `escapeRegex(value)` (top-level; função) - Escapa uma pesquisa literal antes de a usar no MongoDB. Entradas: value: Texto normalizado. Devolve: Texto seguro para `RegExp`.
- `ensureBiblicalPassageIndexes()` (exportada; função) - Cria os índices usados pelo módulo de passagens. Entradas: sem entradas explícitas. Devolve: Termina depois da criação de índices.
- `formatBiblicalReference(passage)` (exportada; função) - Formata uma referência bíblica curta para a API pública. Entradas: passage: Documento da passagem. Devolve: Referência legível.
- `publicBiblicalPassage(passage, [association={}])` (exportada; função) - Converte uma passagem interna numa resposta pública sem metadados editoriais. Entradas: passage: Documento interno; [association={}]: Associação opcional. Devolve: Passagem pública.
- `adminBiblicalPassage(passage)` (top-level; função) - Converte uma passagem para resposta administrativa. Entradas: passage: Documento interno. Devolve: Passagem admin.
- `adminBiblicalPassageAssociation(passage, association, contentId)` (top-level; função) - Converte uma associação para gestão editorial. Entradas: passage: Passagem associada; association: Documento de associação; contentId: Conteúdo consultado. Devolve: Associação admin.
- `biblicalPassageAuditSnapshot(passage)` (top-level; função) - Reduz uma passagem ao mínimo necessário para auditoria editorial. O texto bíblico e a reflexão nunca são copiados para o ledger. Os respetivos comprimentos permitem observar uma alteração sem duplicar conteúdo integral. Entradas: passage: Documento interno. Devolve: Snapshot seguro para auditoria.
- `biblicalAssociationAuditSnapshot(association)` (top-level; função) - Reduz uma associação ao estado operacional necessário para auditoria. A nota editorial pode conter texto livre e, por isso, apenas se regista se está preenchida. Não são copiados texto bíblico, nota, nomes ou outros PII. Entradas: association: Associação interna. Devolve: Snapshot seguro para auditoria.
- `biblicalAssociationTargetId(contentId, passageId)` (top-level; função) - Cria a chave estável usada como alvo de auditoria de uma associação. Entradas: contentId: Conteúdo associado; passageId: Passagem associada. Devolve: Identificador composto sem PII.
- `publishedContentQuery(idOrSlug)` (top-level; função) - Constrói uma query pública por ObjectId ou slug de conteúdo. Entradas: idOrSlug: Identificador de conteúdo. Devolve: Query MongoDB.
- `listPublishedBiblicalPassages([queryParams={}])` (exportada; função) - Lista passagens bíblicas já publicadas para consumo público. A função aplica paginação, ordena as passagens pela posição bíblica e converte cada documento MongoDB para o formato seguro exposto ao frontend, sem campos editoriais internos. Entradas: queryParams: Parâmetros opcionais de paginação recebidos da camada HTTP. Devolve: Página de passagens públicas.
- `getPublishedBiblicalPassage(passageId)` (exportada; função) - Obtém uma passagem publicada por id. Entradas: passageId: Id público. Devolve: Passagem pública.
- `listAdminBiblicalPassages([queryParams={}])` (exportada; função) - Lista passagens bíblicas para a área administrativa. Ao contrário da listagem pública, inclui todos os estados editoriais e devolve dados preparados para revisão, edição e publicação pela equipa de gestão. Entradas: queryParams: Parâmetros opcionais de paginação recebidos da camada HTTP. Devolve: Página de passagens administrativas.
- `createBiblicalPassage(input, userId, [context={}])` (exportada; função) - Cria uma passagem bíblica como rascunho editorial. Entradas: input: Payload recebido; userId: Editor autenticado; [context]: Metadados seguros do pedido. Devolve: Passagem criada.
- `updateBiblicalPassage(passageId, input, userId, [context={}])` (exportada; função) - Atualiza os campos editoriais de uma passagem existente. Entradas: passageId: Id da passagem; input: Payload recebido; userId: Editor autenticado; [context]: Metadados seguros do pedido. Devolve: Passagem atualizada.
- `changeBiblicalPassageStatus(passageId, status, userId, [context={}])` (exportada; função) - Altera o estado editorial de uma passagem. Entradas: passageId: Id da passagem; status: Estado recebido; userId: Editor autenticado; [context]: Metadados seguros do pedido. Devolve: Passagem atualizada.
- `listBiblicalPassagesForPublishedContent(idOrSlug)` (exportada; função) - Lista passagens publicadas associadas a um conteúdo publicado. Entradas: idOrSlug: Id ou slug público do conteúdo. Devolve: Passagens associadas.
- `listAdminBiblicalPassagesForContent(contentId)` (exportada; função) - Lista todas as associações de passagens de um conteúdo para administração. Entradas: contentId: Id do conteúdo. Devolve: Associações admin.
- `linkBiblicalPassageToContent(contentId, input, userId, [context={}])` (exportada; função) - Associa uma passagem a um conteúdo existente de forma idempotente. Entradas: contentId: Id do conteúdo; input: Payload recebido; userId: Editor autenticado; [context]: Metadados seguros do pedido. Devolve: Associação pública.
- `unlinkBiblicalPassageFromContent(contentId, passageId, userId, [context={}])` (exportada; função) - Remove uma associação entre conteúdo e passagem. Entradas: contentId: Id do conteúdo; passageId: Id da passagem; userId: Editor autenticado; [context]: Metadados seguros do pedido. Devolve: Resultado.

### `real_dev/backend/src/modules/biblical-passages/biblical-passages.validation.js`

- `requiredText(value, field, min, max)` (top-level; função) - Normaliza texto obrigatório com limites explícitos. Entradas: value: Valor bruto; field: Nome do campo para mensagens de erro; min: Tamanho mínimo; max: Tamanho máximo. Devolve: Texto seguro.
- `optionalText(value, max, field)` (top-level; função) - Normaliza texto opcional sem guardar strings gigantes. Entradas: value: Valor bruto; max: Tamanho máximo. Devolve: Texto normalizado.
- `positiveInteger(value, field)` (top-level; função) - Valida inteiros positivos usados em capítulos e versículos. Entradas: value: Valor bruto; field: Nome do campo. Devolve: Inteiro positivo.
- `asObjectId(value, field)` (exportada; função) - Converte um id público em ObjectId com erro de domínio. Entradas: value: Valor bruto; field: Nome de domínio. Devolve: ObjectId MongoDB.
- `assertBiblicalPassageStatus(status)` (exportada; função) - Valida o estado editorial fechado de uma passagem. Entradas: status: Estado bruto. Devolve: Estado seguro.
- `assertReferenceRange(range)` (top-level; função) - Valida o intervalo bíblico para impedir referências invertidas. Entradas: range: Intervalo normalizado. Devolve: Sem valor devolvido.
- `assertBiblicalPassagePayload([input={}])` (exportada; função) - Valida payload de criação/atualização de passagens bíblicas. Entradas: input: Dados recebidos. Devolve: Payload seguro para persistência.
- `assertBiblicalPassageAssociationPayload([input={}])` (exportada; função) - Valida payload de associação entre conteúdo e passagem. Entradas: input: Dados recebidos. Devolve: Payload seguro.
- `parseBiblicalPassagePagination([input={}])` (exportada; função) - Valida paginação das listas de passagens. Entradas: input: Query params recebidos. Devolve: Paginação segura.
- `parseAdminBiblicalPassageFilters([input={}])` (exportada; função) - Valida filtros administrativos de passagens bíblicas. Entradas: input: Query params recebidos. Devolve: Filtros seguros.

### `real_dev/backend/src/modules/catalog/catalog-hierarchy.js`

- `isPublicCatalogContent(content)` (exportada; função) - Indica se um conteúdo deve surgir autonomamente no catálogo público. Entradas: content: Documento de conteúdo. Devolve: Verdadeiro para filmes, séries e documentários.
- `assertEngageableContent(content)` (exportada; função) - Impede engagement diretamente em episódios; esse estado pertence à série. Entradas: content: Documento validado. Devolve: Sem valor devolvido.
- `getEpisodeSeries(db, seriesId, [{...}={}])` (exportada; função) - Carrega e valida a série referenciada por um episódio. Entradas: db: Base de dados MongoDB; seriesId: Identificador da série; [options]: Requisitos de leitura. Devolve: Documento da série.
- `publicSeriesSummary(series)` (exportada; função) - Produz o resumo público de uma série sem dados de media. Entradas: series: Documento da série. Devolve: Resumo público.
- `episodeCanonicalPath(series, episode)` (exportada; função) - Constrói a rota frontend canónica de um episódio. Entradas: series: Série publicada; episode: Episódio publicado. Devolve: Caminho interno codificado.

### `real_dev/backend/src/modules/catalog/catalog-media.js`

- `mediaText(value)` (top-level; função) - Normaliza texto interno sem converter números, objetos ou arrays. Entradas: value: Valor candidato vindo do documento de conteudo. Devolve: Texto sem espaços exteriores ou vazio.
- `isSafeSourceLocation(url)` (top-level; função) - Confirma que uma localização de media é transportável e não ambígua. Entradas: url: Localização candidata. Devolve: Verdadeiro apenas para path root-relative ou HTTP(S) sem credenciais.
- `protocolForMimeType(mimeType)` (top-level; função) - Resolve o protocolo correspondente a um MIME type fechado. Entradas: mimeType: MIME normalizado. Devolve: Protocolo reconhecido.
- `inferLegacyProtocol(url)` (top-level; função) - Infere apenas protocolos legacy inequívocos pela extensão do pathname. Entradas: url: Localização já validada. Devolve: Protocolo inferido.
- `canonicalMediaSource(candidate)` (exportada; função) - Converte uma variante interna numa fonte canónica segura. Protocolo e MIME explícitos têm de ser coerentes. Sem ambos, apenas extensões MP4/HLS/DASH inequívocas são aceites. Este helper é partilhado pelo catálogo e playback para impedir CTAs públicos falso-positivos. Entradas: candidate: Variante interna. Devolve: Fonte canónica ou `null`.
- `mediaCandidateQuality(candidate)` (exportada; função) - Lê a qualidade fechada declarada por uma variante interna. Entradas: candidate: Variante de media. Devolve: Qualidade normalizada ou vazio.
- `isSupportedMediaQuality(value)` (top-level; função) - Confirma que uma qualidade pertence ao contrato suportado. Entradas: value: Qualidade candidata. Devolve: Verdadeiro apenas para uma qualidade fechada.
- `hasPlayableMediaSource([content={}])` (exportada; função) - Indica se um documento tem pelo menos uma fonte que o playback consegue usar. Legendas nao contam como fonte de video. O contrato atual aceita a fonte base, uma faixa de audio/video ou uma variante de qualidade. Entradas: content: Documento interno de conteudo. Devolve: `true` quando existe uma fonte de reproducao configurada.
- `resolveMediaStatus([content={}])` (exportada; função) - Normaliza o estado persistido sem promover automaticamente documentos legados. Entradas: content: Documento interno de conteudo. Devolve: Estado efetivo fail-closed.
- `getMediaAvailability([content={}])` (exportada; função) - Calcula os campos publicos usados pela UI para decidir se mostra o CTA. Entradas: content: Documento interno de conteudo. Devolve: Disponibilidade segura.

### `real_dev/backend/src/modules/catalog/catalog.controller.js`

- `getCatalog(req, res)` (exportada; função) - Devolve conteudo publicado com paginacao publica segura. Entradas: req: Pedido HTTP com query params de paginacao; res: Resposta HTTP enviada ao frontend. Devolve: Resposta com `items`, `page`, `limit` e `total`.
- `getAdminCatalog(req, res)` (exportada; função) - Lista o catálogo completo para administração. Ao contrário da rota pública, devolve itens independentemente do estado editorial para permitir revisão e manutenção interna. Entradas: req: Pedido Express com paginação opcional; res: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com itens administrativos.
- `getAdminCatalogDetail(req, res)` (exportada; função) - Função documentada na implementação atual. Entradas: sem entradas explícitas. Devolve: Detalhe editorial protegido por identificador.
- `getAdminCatalogEditorOptions(_req, res)` (exportada; função) - Função documentada na implementação atual. Entradas: sem entradas explícitas. Devolve: Opções mínimas usadas pelos formulários editoriais.
- `postContent(req, res)` (exportada; função) - Cria um novo conteúdo editorial. O body traz os campos do formulário e o `user.id` identifica quem criou a entrada para efeitos de auditoria e revisões. Entradas: req: Pedido Express com body editorial e `user.id`; res: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com o conteúdo criado.
- `patchContent(req, res)` (exportada; função) - Atualiza campos de um conteúdo existente. A função combina o identificador da rota, os campos recebidos no body e o autor autenticado antes de delegar a alteração no serviço. Entradas: req: Pedido Express com `params.id`, body e `user.id`; res: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com o conteúdo atualizado.
- `patchContentStatus(req, res)` (exportada; função) - Altera o estado editorial de um conteúdo. O controller extrai o novo estado do body e mantém a validação da transição no serviço de catálogo. Entradas: req: Pedido Express com `params.id`, `body.status` e `user.id`; res: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com o conteúdo atualizado.
- `getContentRevisions(req, res)` (exportada; função) - Lista revisões históricas de um conteúdo. A rota permite à administração consultar versões anteriores antes de escolher uma reversão. Entradas: req: Pedido Express com `params.id`; res: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com revisões do conteúdo.
- `postContentRevisionRevert(req, res)` (exportada; função) - Reverte um conteúdo para uma revisão anterior. O controller passa conteúdo, revisão e utilizador ao serviço para que a reversão fique validada e auditável. Entradas: req: Pedido Express com `params.id`, `params.revisionId` e `user.id`; res: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com o conteúdo restaurado.
- `getTaxonomies(_req, res)` (exportada; função) - Lista taxonomias disponíveis no catálogo. A rota serve tanto filtros como formulários editoriais, devolvendo a coleção normalizada pelo serviço de taxonomia. Entradas: _req: Pedido Express não usado por esta rota; res: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com taxonomias.
- `getAdminTaxonomies(req, res)` (exportada; função) - Função documentada na implementação atual. Entradas: sem entradas explícitas. Devolve: Página protegida de taxonomias administrativas.
- `postTaxonomy(req, res)` (exportada; função) - Cria uma nova taxonomia editorial. O body contém os campos submetidos pela administração e o serviço valida unicidade e formato antes da persistência. Entradas: req: Pedido Express com dados da taxonomia no body; res: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com a taxonomia criada.
- `patchTaxonomy(req, res)` (exportada; função) - Função documentada na implementação atual. Entradas: sem entradas explícitas. Devolve: Taxonomia atualizada com controlo concorrente.
- `patchTaxonomyStatus(req, res)` (exportada; função) - Função documentada na implementação atual. Entradas: sem entradas explícitas. Devolve: Taxonomia arquivada ou reativada sem eliminação.
- `getCatalogDetail(req, res)` (exportada; função) - Devolve o detalhe público de um conteúdo publicado. O identificador pode ser id ou slug e o serviço garante que apenas conteúdos publicados são expostos nesta rota pública. Entradas: req: Pedido Express com `params.idOrSlug`; res: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com o detalhe público.

### `real_dev/backend/src/modules/catalog/catalog.service.js`

- `escapeRegex(value)` (top-level; função) - Escapa metacaracteres antes de construir uma pesquisa literal MongoDB. Entradas: value: Texto já limitado e normalizado. Devolve: Texto seguro para `RegExp`.
- `contentVersion(content)` (top-level; função) - Normaliza documentos legados sem versao para a primeira versao editorial. Entradas: content: Documento de conteudo. Devolve: Versao editorial positiva.
- `contentVersionFilter(contentId, expectedVersion)` (top-level; função) - Constroi o filtro CAS, incluindo compatibilidade controlada com legado. Documentos anteriores ao schema de concorrencia nao têm `version` e sao tratados como versao 1 apenas na primeira mutacao protegida. Entradas: contentId: Id MongoDB do conteudo; expectedVersion: Versao observada pelo cliente. Devolve: Filtro atomico para a escrita.
- `contentVersionConflict()` (top-level; função) - Cria o erro estavel usado por clientes para recarregar dados concorrentes. Entradas: sem entradas explícitas. Devolve: Conflito editorial seguro.
- `assertCurrentContentVersion(content, expectedVersion)` (top-level; função) - Confirma que a versao lida ainda corresponde ao contrato do cliente. Entradas: content: Documento corrente; expectedVersion: Versao observada pelo cliente. Devolve: Versao corrente normalizada.
- `asContentObjectId(id)` (top-level; função) - Converte um id de conteúdo num ObjectId MongoDB. Entradas: id: Id do conteúdo. Devolve: ObjectId MongoDB.
- `asRevisionObjectId(id)` (top-level; função) - Converte um id de revisão num ObjectId MongoDB. Entradas: id: Revision id. Devolve: ObjectId MongoDB.
- `publicCredits(credits)` (top-level; função) - Normaliza créditos opcionais de documentos legados para o contrato público. Entradas: credits: Créditos persistidos. Devolve: Créditos públicos seguros.
- `toPublicCatalogContent(content)` (exportada; função) - Converte um documento interno de conteúdo para o formato público da API. Entradas: content: Documento de conteúdo MongoDB. Devolve: Conteúdo público.
- `toAdminCatalogContent(content)` (exportada; função) - Converte um documento interno para a resposta editorial completa. Esta representacao e usada apenas por rotas protegidas de administracao e preserva as fontes necessarias para editar e auditar o conteudo. Entradas: content: Documento MongoDB. Devolve: Conteudo administrativo completo.
- `publicEpisodeSummary(episode)` (top-level; função) - Converte um episódio num resumo seguro para a árvore pública da série. Entradas: episode: Documento MongoDB publicado. Devolve: Episódio sem fontes internas de media.
- `adminRevision(revision)` (top-level; função) - Converte um documento interno de revisão para uma resposta segura da API. Entradas: revision: Revision document. Devolve: Revisão pública.
- `saveRevision(db, content, userId, action, session)` (top-level; função) - Guarda o estado anterior do conteúdo antes de uma alteração editorial. Entradas: db: Base de dados MongoDB; content: Documento de conteúdo existente; userId: Authenticated editor id; action: Revision action label; session: Sessao transacional. Devolve: Termina depois de inserir a revisão.
- `assertExistingTaxonomies(db, taxonomyIds, session)` (top-level; função) - Confirms all referenced taxonomies exist. Entradas: db: Base de dados MongoDB; taxonomyIds: Ids de taxonomias referenciadas; session: Sessao transacional. Devolve: Termina quando todas as taxonomias existem.
- `assertCatalogHierarchyReady(db)` (exportada; função) - Bloqueia o arranque quando a hierarquia persistida não permite criar o índice único com segurança ou exporia episódios publicados órfãos. Entradas: db: Base de dados MongoDB. Devolve: Termina apenas para uma hierarquia coerente.
- `assertCatalogHierarchy(db, payload, session)` (top-level; função) - Valida referências condicionais depois da normalização do payload. Entradas: db: Base de dados MongoDB; payload: Payload editorial seguro; session: Sessão ativa. Devolve: Termina quando a série referenciada existe.
- `throwCatalogWriteError(error)` (top-level; função) - Traduz colisões de índices para códigos de domínio estáveis. Entradas: error: Erro MongoDB ou de domínio. Devolve: Relança sempre.
- `ensureCatalogIndexes()` (exportada; função) - Garante que existem os índices usados por catálogo e revisões. Entradas: sem entradas explícitas. Devolve: Termina depois da criação de índices.
- `listPublishedCatalog([queryParams={}])` (exportada; função) - Lista conteudo publico publicado com paginacao segura. Entradas: [queryParams={}]: Query params recebidos pela rota publica. Devolve: Pagina publica do catalogo.
- `listAdminCatalog([queryParams={}])` (exportada; função) - Lista itens de catálogo para roles editoriais. Entradas: [queryParams={}]: Query params de paginação. Devolve: Página administrativa.
- `getAdminCatalogContent(contentId)` (exportada; função) - Obtém diretamente um conteúdo administrativo por identificador. Entradas: contentId: Identificador MongoDB recebido pela rota protegida. Devolve: Conteúdo editorial completo e seguro.
- `getAdminCatalogOptions()` (exportada; função) - Lista apenas as opções de séries necessárias ao editor de episódios. Entradas: sem entradas explícitas. Devolve: Opções editoriais mínimas.
- `createContent(input, userId, [context={}])` (exportada; função) - Cria um conteúdo em rascunho. Entradas: input: Catalog dados; userId: Authenticated editor id; [context]: Metadados seguros do pedido. Devolve: Conteúdo criado.
- `updateContent(contentId, input, userId, [context={}])` (exportada; função) - Atualiza um conteúdo e guarda uma revisão do estado anterior. Entradas: contentId: Id do conteúdo; input: Catalog dados; userId: Authenticated editor id; [context]: Metadados seguros do pedido. Devolve: Conteúdo atualizado.
- `changeContentStatus(contentId, status, userId, expectedVersionInput, [context={}])` (exportada; função) - Altera o estado de publicação de um conteúdo. Entradas: contentId: Id do conteúdo; estado: Novo estado; userId: Authenticated editor id; expectedVersionInput: Versao observada pelo cliente; [context]: Metadados seguros do pedido. Devolve: Conteúdo atualizado.
- `listContentRevisions(contentId, [queryParams={}])` (exportada; função) - Lista revisões de conteúdo. Entradas: contentId: Id do conteúdo; [queryParams={}]: Query params de paginação. Devolve: Página de revisões.
- `revertContentRevision(contentId, revisionId, userId, expectedVersionInput, [context={}])` (exportada; função) - Repõe conteúdo a partir de uma revisão anterior. Entradas: contentId: Id do conteúdo; revisionId: Revision id; userId: Authenticated editor id; expectedVersionInput: Versao observada pelo cliente; [context]: Metadados seguros do pedido. Devolve: Conteúdo atualizado.
- `buildPublishedDetailQuery(idOrSlug)` (top-level; função) - Constrói uma query de detalhe público para ObjectId ou slug. Entradas: idOrSlug: Identificador público. Devolve: Query MongoDB.
- `getPublishedContentDetail(idOrSlug)` (exportada; função) - Obtém o detalhe de um conteúdo publicado por id ou slug. Entradas: idOrSlug: Content id or slug. Devolve: Detalhe público.

### `real_dev/backend/src/modules/catalog/catalog.validation.js`

- `assertExpectedVersion(value)` (exportada; função) - Valida a versao editorial usada no compare-and-swap das mutacoes admin. A API exige um numero JSON inteiro, em vez de coagir strings, para que um cliente desatualizado nunca contorne acidentalmente o controlo concorrente. Entradas: value: Versao que o cliente observou antes de editar. Devolve: Versao positiva e segura.
- `requiredText(value, field, [min=2], [max=160])` (top-level; função) - Valida campos de texto obrigatórios. Entradas: value: Valor bruto; field: Field name used in the error message; [min=2]: Minimum length; [max=160]: Maximum length. Devolve: Texto sem espaços externos.
- `optionalText(value, [max=500], [field="Campo"])` (top-level; função) - Normaliza texto opcional com tamanho máximo seguro. Entradas: value: Valor bruto; [max=500]: Maximum length; [field="Campo"]: Nome usado na mensagem segura. Devolve: Texto opcional sem espaços externos.
- `positiveInteger(value, field)` (top-level; função) - Valida um campo inteiro positivo. Entradas: value: Valor bruto; field: Field name. Devolve: Inteiro válido.
- `assertAgeRating(value)` (top-level; função) - Valida classificação etária entre 0 e 18. Entradas: value: Classificação etária bruta. Devolve: Classificação etária segura.
- `assertReleaseYear(value)` (top-level; função) - Valida o ano editorial sem obrigar documentos antigos a inventar um valor. Entradas: value: Ano bruto ou vazio. Devolve: Ano válido ou ausência explícita.
- `optionalPublicAssetUrl(value)` (top-level; função) - Valida uma URL promocional pública sem aceitar protocolos executáveis. Entradas: value: URL bruta. Devolve: URL HTTPS/root-relative ou vazio.
- `creditNames(value, field)` (top-level; função) - Valida uma lista curta de nomes editoriais. Entradas: value: Lista bruta; field: Nome do campo. Devolve: Nomes normalizados.
- `editorialCredits(value)` (top-level; função) - Valida o bloco editorial de créditos incorporado no conteúdo. Entradas: value: Créditos brutos. Devolve: Créditos seguros.
- `taxonomyObjectIds(value)` (top-level; função) - Converte ids de taxonomias para ObjectIds. Entradas: value: Lista bruta de ids de taxonomias. Devolve: Lista de ObjectId.
- `mediaTrack(track)` (top-level; função) - Valida uma faixa de legendas ou áudio. Entradas: track: Faixa bruta. Devolve: Faixa segura.
- `qualityOption(option)` (top-level; função) - Valida uma opção de qualidade. Entradas: option: Opção de qualidade bruta. Devolve: Opção de qualidade segura.
- `slugify(value)` (exportada; função) - Constrói um slug estável a partir de texto. Entradas: value: Texto bruto. Devolve: Slug seguro para URL.
- `assertMediaOptions([input={}])` (exportada; função) - Valida faixas media e opções de qualidade. Entradas: input: Opções media brutas. Devolve: Opções media seguras.
- `assertCatalogEditorialPayload([input={}])` (top-level; função) - Valida apenas os campos editoriais de um conteúdo. Entradas: input: Dados brutos de catálogo. Devolve: Metadados, assets e taxonomias seguros.
- `assertCatalogPayload([input={}])` (exportada; função) - Cria o contrato inicial de media sem aceitar fontes do formulário editorial. O catálogo administrativo cria metadados; o carregamento/ingestão de media pertence a um fluxo separado que ainda não existe nesta baseline. Entradas: input: Dados brutos de criação. Devolve: Conteúdo editorial com media vazia/pending.
- `assertCatalogUpdatePayload([input={}], [currentContent={}])` (exportada; função) - Recusa alterações de media na rota editorial de atualização. A presença do campo é suficiente para falhar, mesmo com `null` ou vazio, para que clientes não interpretem um payload ignorado como uma alteração aplicada. Entradas: input: Dados brutos de atualização. Devolve: Metadados editoriais seguros.
- `assertStatus(status)` (exportada; função) - Valida estado de publicação de conteúdo. Entradas: estado: Estado bruto. Devolve: Estado seguro.
- `parseCatalogPagination([input={}])` (exportada; função) - Valida parametros publicos de paginacao do catalogo. Entradas: input: Query params brutos recebidos pela rota publica. Devolve: Pagina e limite normalizados.
- `parseAdminCatalogPagination([input={}])` (exportada; função) - Valida paginação das listagens administrativas de catálogo e revisões. Entradas: input: Query params administrativos. Devolve: Página e limite seguros.
- `parseAdminCatalogFilters([input={}])` (exportada; função) - Valida filtros opcionais da listagem administrativa do catálogo. A pesquisa fica limitada e continua a ser escapada no service antes de ser usada numa expressão regular MongoDB. Entradas: input: Query params administrativos. Devolve: Filtros normalizados.
- `parseAdminCatalogSort([input={}])` (exportada; função) - Valida a ordenação da listagem administrativa do catálogo. Entradas: input: Query params administrativos. Devolve: Ordenação segura.
- `parseCatalogFilters([input={}])` (exportada; função) - Valida filtros públicos opcionais do catálogo. Entradas: input: Query params brutos recebidos pela rota pública. Devolve: Filtros normalizados.
- `assertTaxonomyPayload([input={}], [options={}])` (exportada; função) - Valida dados de taxonomia. Entradas: input: Dados brutos de taxonomia; options: Opções do comando. Devolve: Dados seguros de taxonomia.
- `parseAdminTaxonomyQuery([input={}])` (exportada; função) - Valida paginação e filtros da gestão administrativa de taxonomias. Entradas: input: Query params recebidos por HTTP. Devolve: Filtros seguros.
- `assertTaxonomyStatus(value)` (exportada; função) - Valida a mudança de estado não destrutiva de uma taxonomia. Entradas: value: Estado bruto. Devolve: Estado seguro.
- `assertTaxonomyStatusPayload(input)` (exportada; função) - Valida o shape fechado da alteração de estado de taxonomia. Entradas: input: Payload bruto. Devolve: Comando seguro.

### `real_dev/backend/src/modules/catalog/series-episodes-migration.js`

- `assertAllowedFields(value, allowed, label)` (top-level; função) - Função documentada na implementação atual. Entradas: value: Objeto; allowed: Allowlist; label: Contexto. Devolve: Sem valor devolvido.
- `objectId(value, field)` (top-level; função) - Função documentada na implementação atual. Entradas: value: Valor candidato; field: Campo. Devolve: Id seguro.
- `positiveInteger(value, field)` (top-level; função) - Função documentada na implementação atual. Entradas: value: Valor candidato; field: Campo. Devolve: Inteiro positivo.
- `assertReviewedSeriesEpisodeMapping(input)` (exportada; função) - Valida a declaração humana de revisão e normaliza todas as entradas. Entradas: input: JSON lido do ficheiro. Devolve: Mapping seguro.
- `inspectSeriesEpisodeMigration(db, [options={}])` (exportada; função) - Produz um relatório estritamente read-only do estado atual. Entradas: db: Base de dados; [options]: Sessão opcional. Devolve: Diagnóstico serializável.
- `preflightSeriesEpisodeMigration(db, mapping, [options={}])` (exportada; função) - Executa todo o preflight sobre o estado final projetado, antes de uma escrita. Entradas: db: Base de dados; mapping: Mapping normalizado; [options]: Sessão. Devolve: Plano validado para aplicação.
- `timestamp(value)` (top-level; função) - Função documentada na implementação atual. Entradas: value: Data. Devolve: Timestamp seguro.
- `migrateListRow(db, row, seriesId, options)` (top-level; função) - Migra listas deduplicando a chave única por utilizador/tipo. Entradas: db: Base de dados; row: Linha; seriesId: Destino; options: Opções Mongo. Devolve: Valor documentado como `Promise<void>`.
- `migrateRatingRow(db, row, seriesId, options)` (top-level; função) - Função documentada na implementação atual. Entradas: sem entradas explícitas. Devolve: Migra uma classificação, conservando a mais recente.
- `applySeriesEpisodeMigration(db, mapping, [options={}])` (exportada; função) - Aplica o plano já revisto. Deve ser chamado dentro de `runInTransaction`. Entradas: db: Base de dados; mapping: Mapping; [options]: Sessão. Devolve: Relatório pós-aplicação.

### `real_dev/backend/src/modules/catalog/taxonomy.service.js`

- `escapeRegex(value)` (top-level; função) - Função documentada na implementação atual. Entradas: value: Texto de pesquisa literal. Devolve: Regex escapada.
- `taxonomyVersion(taxonomy)` (top-level; função) - Função documentada na implementação atual. Entradas: taxonomy: Documento persistido. Devolve: Versão normalizada.
- `taxonomyStatus(taxonomy)` (top-level; função) - Função documentada na implementação atual. Entradas: taxonomy: Documento persistido. Devolve: Estado normalizado.
- `asTaxonomyObjectId(id)` (top-level; função) - Função documentada na implementação atual. Entradas: id: Identificador recebido por HTTP. Devolve: Identificador MongoDB seguro.
- `taxonomyVersionConflict()` (top-level; função) - Função documentada na implementação atual. Entradas: sem entradas explícitas. Devolve: Conflito de concorrência editorial.
- `taxonomyVersionFilter(id, expectedVersion)` (top-level; função) - Constrói o filtro CAS, incluindo documentos legados sem versão. Entradas: id: Identificador persistido; expectedVersion: Versão observada pelo cliente. Devolve: Filtro atómico.
- `publicTaxonomy(taxonomy)` (top-level; função) - Converte um documento de taxonomia para o formato público. Entradas: taxonomy: Documento de taxonomia. Devolve: Taxonomia pública.
- `adminTaxonomy(taxonomy, [usageCount=0])` (top-level; função) - Converte uma taxonomia para o contrato protegido de administração. Entradas: taxonomy: Documento persistido; usageCount: Número de conteúdos associados. Devolve: Resumo administrativo seguro.
- `ensureTaxonomyIndexes()` (exportada; função) - Garante que existem os índices de taxonomias. Entradas: sem entradas explícitas. Devolve: Termina depois da criação de índices.
- `listTaxonomies()` (exportada; função) - Lista taxonomias alfabeticamente. Entradas: sem entradas explícitas. Devolve: Lista pública de taxonomias.
- `listAdminTaxonomies([queryParams={}])` (exportada; função) - Lista taxonomias para administração com pesquisa, estado e utilização. Entradas: queryParams: Query params HTTP. Devolve: Página administrativa.
- `createTaxonomy(input, userId, [context={}])` (exportada; função) - Cria uma taxonomia editorial no catálogo. A função valida o payload recebido, garante que os índices únicos existem, persiste o documento com metadados temporais e devolve apenas o formato público usado pelas restantes camadas da aplicação. Entradas: input: Dados brutos da taxonomia recebidos da camada HTTP; userId: Editor autenticado; [context]: Metadados seguros do pedido. Devolve: Taxonomia criada.
- `updateTaxonomy(taxonomyId, input, userId, [context={}])` (exportada; função) - Atualiza metadados de uma taxonomia com CAS e audit log transacional. Entradas: taxonomyId: Identificador da taxonomia; input: Payload administrativo; userId: Utilizador autenticado; context: Contexto seguro do pedido. Devolve: Taxonomia atualizada.
- `changeTaxonomyStatus(taxonomyId, input, userId, [context={}])` (exportada; função) - Arquiva ou reativa uma taxonomia sem remover ligações existentes. Entradas: taxonomyId: Identificador da taxonomia; input: Estado e versão observada; userId: Utilizador autenticado; context: Contexto seguro do pedido. Devolve: Taxonomia atualizada.

### `real_dev/backend/src/modules/charities/charity-admin.validation.js`

- `assertAdminCharityLookupQuery([input={}])` (exportada; função) - Valida a pesquisa paginada usada por seletores administrativos. Entradas: input: Query params recebidos. Devolve: Pesquisa segura.

### `real_dev/backend/src/modules/charities/charity-applications.controller.js`

- `postCharityApplication(req, res)` (exportada; função) - Recebe uma candidatura pública de associação. Entradas: req: Pedido com corpo da candidatura; res: Resposta HTTP. Devolve: Valor documentado como `Promise<void>`.
- `getCharityApplications(req, res)` (exportada; função) - Lista candidaturas para administradores. Entradas: req: Pedido com filtro opcional `estado`; res: Resposta HTTP. Devolve: Valor documentado como `Promise<void>`.
- `patchCharityApplicationReview(req, res)` (exportada; função) - Aplica uma decisão administrativa a uma candidatura pendente. Entradas: req: Pedido com `params.id`, `body` e `user.id`; res: Resposta HTTP. Devolve: Valor documentado como `Promise<void>`.

### `real_dev/backend/src/modules/charities/charity-applications.service.js`

- `isDuplicateKeyError(error)` (top-level; função) - Identifica a violacao do indice unico de candidaturas pendentes. Entradas: error: Erro devolvido pelo driver MongoDB. Devolve: Verdadeiro quando o erro representa uma chave duplicada.
- `publicApplication(application)` (top-level; função) - Remove campos internos antes de devolver uma candidatura. Entradas: application: Documento da coleção `charity_applications`. Devolve: Candidatura pública para API/admin.
- `ensureCharityApplicationIndexes()` (exportada; função) - Cria índices necessários para listagem e controlo de duplicados pendentes. Entradas: sem entradas explícitas. Devolve: Valor documentado como `Promise<void>`.
- `submitCharityApplication(input)` (exportada; função) - Submete uma candidatura pública com estado inicial controlado. Entradas: input: Dados enviados pela associação. Devolve: Candidatura criada.
- `listCharityApplications([query={}])` (exportada; função) - Lista candidaturas para administradores, com filtro por estado. Entradas: [query={}]: Filtro e paginacao. Devolve: Página de candidaturas ordenada por submissão.

### `real_dev/backend/src/modules/charities/charity-applications.validation.js`

- `httpError(message, [statusCode=400])` (top-level; função) - Cria um erro HTTP controlado para validações da candidatura. Entradas: message: Mensagem segura para devolver ao cliente; [statusCode=400]: Código HTTP associado. Devolve: Erro com `statusCode`.
- `requiredText(value, field, min, max)` (top-level; função) - Valida texto obrigatório com limites de tamanho. Entradas: value: Valor recebido no corpo do pedido; field: Nome do campo para mensagem de erro; min: Tamanho mínimo; max: Tamanho máximo. Devolve: Texto normalizado.
- `optionalPublicUrl(value)` (top-level; função) - Normaliza website público opcional. Entradas: value: URL recebida no formulário. Devolve: URL normalizada ou string vazia.
- `assertCharityApplicationPayload(input)` (exportada; função) - Valida e filtra os campos aceites numa candidatura pública. Entradas: input: Corpo recebido em `POST /api/charities/applications`. Devolve: Dados seguros para persistir.
- `assertCharityApplicationListQuery([query={}])` (exportada; função) - Valida filtro e paginacao da listagem administrativa de candidaturas. Entradas: query: Query string recebida. Devolve: Filtros seguros.

### `real_dev/backend/src/modules/charities/charity-reports.controller.js`

- `assertCanReadCharity(req, charityId)` (top-level; função) - Confirma se o utilizador pode ler o histórico de uma associação. Entradas: req: Pedido autenticado; charityId: Identificador da associação consultada. Devolve: Valor documentado como `Promise<void>`.
- `getPoolDashboardController(_req, res)` (exportada; função) - Devolve painel agregado da pool para administradores. Entradas: _req: Pedido autenticado como admin; res: Resposta HTTP. Devolve: Valor documentado como `Promise<void>`.
- `getAdminCharityLookup(req, res)` (exportada; função) - Devolve uma página mínima de associações para seletores administrativos. Entradas: req: Pedido com pesquisa e paginação; res: Resposta HTTP. Devolve: Valor documentado como `Promise<void>`.
- `postCharityMember(req, res)` (exportada; função) - Liga um utilizador a uma associação por ação administrativa. Entradas: req: Pedido com `params.id`, `body.userId` e `user.id`; res: Resposta HTTP. Devolve: Valor documentado como `Promise<void>`.
- `getCharityHistoryController(req, res)` (exportada; função) - Devolve histórico privado de uma associação depois de validar permissão. Entradas: req: Pedido com `params.id`; res: Resposta HTTP. Devolve: Valor documentado como `Promise<void>`.
- `getCharityHistoryCsv(req, res)` (exportada; função) - Exporta histórico privado em CSV depois de validar permissão. Entradas: req: Pedido com `params.id`; res: Resposta HTTP. Devolve: Valor documentado como `Promise<void>`.
- `getPublicCharities(_req, res)` (exportada; função) - Devolve associações públicas sem dados de contacto internos. Entradas: _req: Pedido público; res: Resposta HTTP. Devolve: Valor documentado como `Promise<void>`.
- `getMyCharity(req, res)` (exportada; função) - Devolve apenas a associação ligada à sessão atual, quando existir. Entradas: req: Pedido autenticado; res: Resposta HTTP. Devolve: Valor documentado como `Promise<void>`.

### `real_dev/backend/src/modules/charities/charity-reports.service.js`

- `asObjectId(id, label)` (top-level; função) - Converte identificadores recebidos em `ObjectId` com erro de domínio. Entradas: id: Identificador recebido da rota, sessão ou corpo; label: Nome usado na mensagem de erro. Devolve: Identificador MongoDB.
- `publicCharity(charity)` (top-level; função) - Remove contactos internos antes de expor uma associação publicamente. Entradas: charity: Documento da coleção `charities`. Devolve: Associação pública.
- `publicOwnCharity(charity)` (top-level; função) - Reduz a associação ligada à sessão aos únicos campos necessários para abrir a respetiva área privada. Entradas: charity: Documento interno da associação. Devolve: Resumo seguro da própria associação.
- `publicMembership(membership)` (top-level; função) - Normaliza uma ligação utilizador-associação para resposta da API. Entradas: membership: Documento da coleção `charity_memberships`. Devolve: Ligação pública.
- `membershipResponse(membership, user, charity)` (top-level; função) - Constrói a resposta administrativa sem expor campos internos. Entradas: membership: Ligação persistida; user: Utilizador selecionado; charity: Associação selecionada. Devolve: Resposta segura.
- `ensureCharityReportIndexes()` (exportada; função) - Cria índices de pertença entre utilizadores e associações. Entradas: sem entradas explícitas. Devolve: Valor documentado como `Promise<void>`.
- `membershipConflict()` (top-level; função) - Cria o conflito seguro usado quando um utilizador ja pertence a uma associacao. Entradas: sem entradas explícitas. Devolve: Erro de dominio estavel para o endpoint administrativo.
- `linkUserToCharity(charityId, userId, createdByUserId, [context={}])` (exportada; função) - Liga um utilizador existente a uma associação elegível. Entradas: charityId: Identificador da associação; userId: Identificador do utilizador que passará a consultar histórico; createdByUserId: Identificador do admin que cria a ligação; [context]: Metadados seguros do pedido HTTP. Devolve: Ligação criada ou atualizada.
- `lookupAdminCharities([query={}])` (exportada; função) - Lista apenas identificadores e nomes de associações elegíveis para seletores. Entradas: [query={}]: Pesquisa e paginação. Devolve: Página segura.
- `getMyCharityMembership(userId)` (exportada; função) - Obtém a associação ligada ao utilizador autenticado. Entradas: userId: Identificador do utilizador autenticado. Devolve: Documento de ligação.
- `getMyCharitySummary(userId)` (exportada; função) - Resolve a associação ligada ao utilizador sem transformar a ausência normal de membership num erro da página pública. Entradas: userId: Identificador do utilizador autenticado. Devolve: Associação própria ou ausência explícita.
- `getPoolDashboard()` (exportada; função) - Devolve os últimos meses de distribuição para painel admin. Entradas: sem entradas explícitas. Devolve: Totais mensais agregados.
- `getCharityHistory(charityId)` (exportada; função) - Devolve histórico de distribuições para uma associação. Entradas: charityId: Identificador da associação. Devolve: Histórico agregado.
- `listPublicCharities()` (exportada; função) - Lista associações elegíveis para a página pública. Entradas: sem entradas explícitas. Devolve: Associações e impacto agregado sem dados privados.
- `historyToCsv(history)` (exportada; função) - Converte histórico de uma associação para CSV simples. Entradas: history: Histórico devolvido por `getCharityHistory`. Devolve: CSV com cabeçalho e linhas de distribuição.

### `real_dev/backend/src/modules/charities/charity-review.service.js`

- `asObjectId(id, label)` (top-level; função) - Converte uma string para `ObjectId` com mensagem contextual. Entradas: id: Identificador recebido da rota ou sessão; label: Nome usado na mensagem de erro. Devolve: Identificador MongoDB.
- `publicCharity(charity)` (top-level; função) - Remove campos internos antes de devolver uma associação aprovada. Entradas: charity: Documento da colecao `charities`. Devolve: Associação pública para API/admin.
- `ensureCharityIndexes()` (exportada; função) - Cria indices para impedir duplicação de entrada na pool. Entradas: sem entradas explícitas. Devolve: Valor documentado como `Promise<void>`.
- `reviewCharityApplication(applicationId, reviewerUserId, input, [context={}])` (exportada; função) - Reve uma candidatura pendente e cria associação elegível quando aprovada. Entradas: applicationId: Identificador da candidatura; reviewerUserId: Identificador do admin que decide; input: Decisão recebida da UI; [context]: Metadados seguros do pedido HTTP. Devolve: Resultado da rejeição ou associação criada.
- `listEligibleCharities()` (exportada; função) - Lista associações ativas e elegíveis para distribuição solidária. Entradas: sem entradas explícitas. Devolve: Associações ordenadas por data de aprovação.

### `real_dev/backend/src/modules/charities/charity-review.validation.js`

- `httpError(message, [statusCode=400])` (top-level; função) - Cria um erro HTTP previsivel para validação de revisão. Entradas: message: Mensagem segura para devolver ao cliente; [statusCode=400]: Código HTTP associado. Devolve: Erro com `statusCode`.
- `assertReviewPayload(input)` (exportada; função) - Valida a decisão administrativa sobre uma candidatura. Entradas: input: Corpo recebido na rota de revisão; input.decision: Decisão pretendida; [input.reason]: Motivo, obrigatório em rejeicoes. Devolve: Decisão normalizada.

### `real_dev/backend/src/modules/charities/pool-distribution.controller.js`

- `postMonthlyDistribution(req, res)` (exportada; função) - Executa uma nova distribuição mensal por pedido admin. Entradas: req: Pedido com `body.month` e `user.id`; res: Resposta HTTP. Devolve: Valor documentado como `Promise<void>`.
- `getMonthlyDistributionPreview(req, res)` (exportada; função) - Calcula uma preview sem escrever distribuição ou audit log. Entradas: req: Pedido com `params.month`; res: Resposta HTTP. Devolve: Valor documentado como `Promise<void>`.
- `getMonthlyDistribution(req, res)` (exportada; função) - Devolve uma distribuição mensal existente. Entradas: req: Pedido com `params.month`; res: Resposta HTTP. Devolve: Valor documentado como `Promise<void>`.

### `real_dev/backend/src/modules/charities/pool-distribution.service.js`

- `toPublicRun(run)` (top-level; função) - Converte uma distribuição mensal para o formato público da API. Entradas: run: Documento da colecao `pool_distributions`. Devolve: Distribuição sem campos internos.
- `monthBounds(month)` (top-level; função) - Calcula o intervalo UTC fechado-aberto de um mês contabilístico. Entradas: month: Mês `YYYY-MM` já validado. Devolve: Limites UTC.
- `utcMonthKey(date)` (top-level; função) - Devolve o mês UTC que contém a data indicada. Entradas: date: Data de referência. Devolve: Mês `YYYY-MM`.
- `rotationOffsetForMonth(month, count)` (top-level; função) - Produz uma rotação determinística, independente da ordem de execução dos jobs. Entradas: month: Mês contabilístico; count: Total de associações. Devolve: Offset estável.
- `splitCents(totalCents, charities)` (top-level; função) - Divide um total em cêntimos por associações, preservando a soma exata. Entradas: totalCents: Valor total da pool em cêntimos; charities: Associações já ordenadas pela rotação deste mês. Devolve: Itens de distribuição.
- `assertClosedAccountingMonth(month, now)` (top-level; função) - Confirma que o mês contabilístico terminou antes de qualquer cálculo. Entradas: month: Mês validado; now: Relógio do cálculo. Devolve: Sem valor devolvido.
- `calculateDistributionCandidate(db, month, now, session)` (top-level; função) - Calcula uma distribuição sem persistir dados nem escrever audit log. Entradas: db: Base de dados autoritativa; month: Mês validado; now: Relógio do cálculo; session: Sessão opcional. Devolve: Candidato determinístico.
- `distributionPreviewToken(candidate)` (top-level; função) - Produz um fingerprint estável dos inputs financeiros e da rotação calculada. Entradas: candidate: Candidato calculado. Devolve: SHA-256 hexadecimal.
- `toPublicPreview(candidate, generatedAt)` (top-level; função) - Converte o candidato para uma resposta administrativa sem snapshots internos. Entradas: candidate: Cálculo atual; generatedAt: Momento da preview. Devolve: Preview segura.
- `resolveDistributionExecution(createdByUserId, triggerValue)` (top-level; função) - Normaliza a origem do fecho mensal e valida o ator administrativo. O caminho HTTP usa `admin` por compatibilidade com os callers existentes e exige sempre um ObjectId válido. O worker tem de se declarar explicitamente e não pode fabricar um utilizador para preencher o audit log administrativo. Entradas: createdByUserId: Ator recebido; triggerValue: Origem declarada da execução. Devolve: Contexto validado.
- `ensurePoolDistributionIndexes()` (exportada; função) - Cria indices para idempotência mensal e consultas por associação. Entradas: sem entradas explícitas. Devolve: Valor documentado como `Promise<void>`.
- `previewMonthlyDistribution(monthInput, [options={}])` (exportada; função) - Pré-visualiza a distribuição mensal sem qualquer escrita persistente. Entradas: monthInput: Mês no formato `YYYY-MM`; [options]: Relógio opcional de teste. Devolve: Preview ou distribuição já existente.
- `runMonthlyDistribution(monthInput, createdByUserId, [options={}])` (exportada; função) - Executa a distribuição mensal da pool solidária. Entradas: monthInput: Mês no formato `YYYY-MM`; createdByUserId: Identificador do admin ou ausência explícita no worker; [options]: Relógio, origem, correlação, preview e ids determinísticos opcionais de fixture. Devolve: Distribuição persistida ou replay existente.
- `getDistributionByMonth(monthInput)` (exportada; função) - Consulta uma distribuição mensal já persistida. Entradas: monthInput: Mês no formato `YYYY-MM`. Devolve: Distribuição encontrada.

### `real_dev/backend/src/modules/charities/pool-distribution.validation.js`

- `httpError(message, [statusCode=400])` (top-level; função) - Cria um erro HTTP previsivel para validação do mês de distribuição. Entradas: message: Mensagem segura para devolver ao cliente; [statusCode=400]: Código HTTP associado. Devolve: Erro com `statusCode`.
- `assertDistributionMonth(month)` (exportada; função) - Valida o mês operacional da distribuição no formato `YYYY-MM`. Entradas: month: Valor recebido da API ou da UI. Devolve: Mês normalizado.
- `assertDistributionPreviewToken(token)` (exportada; função) - Valida o token hexadecimal emitido pela pré-visualização financeira. Entradas: token: Valor recebido no POST administrativo. Devolve: SHA-256 hexadecimal normalizado.

### `real_dev/backend/src/modules/comments/comments.controller.js`

- `getComments(req, res)` (exportada; função) - Lista comentários visíveis de um conteúdo. O controller entrega ao serviço o conteúdo da rota e a sessão atual, permitindo filtrar comentários conforme permissões ou estado de moderação. Entradas: req: Pedido Express com `params.contentId` e utilizador opcional; res: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com comentários visíveis.
- `postComment(req, res)` (exportada; função) - Cria um comentário para o conteúdo indicado. A função recolhe autor, conteúdo e texto do pedido e delega no serviço a validação, moderação inicial e persistência. Entradas: req: Pedido Express com utilizador, conteúdo e `body.body`; res: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com o comentário criado.
- `deleteCommentController(req, res)` (exportada; função) - Remove um comentário autorizado. O controller passa o utilizador, o papel e o comentário alvo para o serviço, que decide se a remoção pode ser feita pelo autor ou por administração. Entradas: req: Pedido Express com sessão e `params.commentId`; res: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com o comentário removido.
- `patchCommentModeration(req, res)` (exportada; função) - Atualiza o estado de moderação de um comentário. A função lê a decisão e a justificação do body e deixa o serviço aplicar as regras de moderação antes de devolver o comentário atualizado. Entradas: req: Pedido Express com comentário alvo e decisão no body; res: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com o comentário moderado.

### `real_dev/backend/src/modules/comments/comments.service.js`

- `assertPublishedContent(db, contentId)` (top-level; função) - Garante que comentários só podem apontar para conteúdo publicado. Entradas: db: Base de dados MongoDB; contentId: ObjectId do conteúdo. Devolve: Documento de conteúdo publicado.
- `canDeleteComment(comment, viewer)` (top-level; função) - Verifica se o visualizador atual pode apagar um comentário sem expor ids de utilizadores. Entradas: comment: Documento de comentário MongoDB; viewer: Visualizador atual, quando autenticado. Devolve: Verdadeiro quando o visualizador é dono do comentário ou pode moderá-lo.
- `publicComment(comment, [viewer=null])` (exportada; função) - Converte um documento de comentário para o formato público da API. Entradas: comment: Documento de comentário MongoDB; [viewer=null]: Visualizador atual, quando autenticado. Devolve: Comentário público.
- `ensureCommentIndexes()` (exportada; função) - Cria índices exigidos por listagem e moderação de comentários. Entradas: sem entradas explícitas. Devolve: Termina depois da criação de índices.
- `listVisibleComments(contentId, [viewer=null])` (exportada; função) - Lista comentários visíveis de um conteúdo publicado. Entradas: contentId: Id público do conteúdo; [viewer=null]: Visualizador atual, quando autenticado. Devolve: Comentários visíveis.
- `createComment(user, contentId, bodyValue)` (exportada; função) - Cria um comentário pertencente ao utilizador autenticado. Entradas: user: Utilizador autenticado; contentId: Id público do conteúdo; bodyValue: Corpo bruto do comentário. Devolve: Comentário criado.
- `deleteComment(userId, role, commentId, [context={}])` (exportada; função) - Apaga um comentário quando o utilizador é dono ou tem permissões de moderação. Entradas: userId: Authenticated user id; role: Role do utilizador autenticado; commentId: Id público do comentário; [context]: Metadados seguros do pedido. Devolve: Estado de remoção.
- `moderateComment(actorUserId, commentId, statusValue, reasonValue, [context={}])` (exportada; função) - Atualiza o estado de moderação de um comentário. Entradas: actorUserId: Id do administrador ou moderador autenticado; commentId: Id público do comentário; estadoValue: Estado bruto de moderação; reasonValue: Motivo opcional de moderação; [context]: Metadados seguros do pedido. Devolve: Comentário atualizado.

### `real_dev/backend/src/modules/comments/comments.validation.js`

- `asObjectId(id, label)` (exportada; função) - Converte um id público num ObjectId MongoDB. Entradas: id: Id bruto recebido dos parâmetros da rota ou da sessão; label: Portuguese domain label used in validation errors. Devolve: ObjectId MongoDB seguro.
- `assertCommentBody(value)` (exportada; função) - Normalizes and validates a short plain-text comment body. Entradas: value: Corpo bruto recebido no pedido. Devolve: Corpo de comentário normalizado e seguro.
- `initialModerationFor(body)` (exportada; função) - Applies the minimal moderation rule defined for MF3. Entradas: body: Normalized comment body. Devolve: Estado inicial de moderação.
- `assertModerationStatus(value)` (exportada; função) - Valida um estado de moderação a partir da lista fechada da MF3. Entradas: value: Estado bruto de moderação. Devolve: Estado seguro de moderação.
- `assertModerationReason(value)` (exportada; função) - Valida a justificação opcional de uma decisão de moderação. Entradas: value: Motivo recebido no corpo do pedido. Devolve: Motivo normalizado ou `null`.

### `real_dev/backend/src/modules/demo-mailbox/demo-mailbox.config.js`

- `isDemoMailboxEnvironmentEnabled([source=process.env], [databaseName=undefined])` (exportada; função) - Confirma todas as flags exigidas para montar a caixa de email local. Entradas: [source=process.env]: Ambiente bruto; [databaseName]: Base efetiva, quando já conhecida. Devolve: Verdadeiro apenas para uma base descartável `_demo` em desenvolvimento.
- `isLoopbackAddress(address)` (exportada; função) - Identifica endereços de socket locais sem confiar em headers de proxy. Entradas: address: `remoteAddress` fornecido pelo socket TCP. Devolve: Verdadeiro para IPv4/IPv6 loopback.

### `real_dev/backend/src/modules/demo-mailbox/demo-mailbox.controller.js`

- `postDemoMailbox(req, res)` (exportada; função) - Lê mensagens locais por email sem permitir cache do token de reset. Entradas: req: Pedido HTTP local; res: Resposta JSON. Devolve: Caixa demo atual.

### `real_dev/backend/src/modules/demo-mailbox/demo-mailbox.service.js`

- `unavailableError()` (top-level; função) - Devolve sempre o mesmo 404 para ambiente, base ou origem inadequados. Entradas: sem entradas explícitas. Devolve: Erro que não revela qual dos guards falhou.
- `resetMessage(row)` (top-level; função) - Converte uma mensagem de reset num DTO sem ids de utilizador internos. Entradas: row: Documento da outbox de reset. Devolve: Mensagem visível na demo.
- `notificationMessage(row)` (top-level; função) - Converte uma notificação simulada num DTO sem ids internos. Entradas: row: Documento da outbox de email. Devolve: Mensagem visível na demo.
- `listDemoMailbox(input, [options={}])` (exportada; função) - Lista as mensagens locais recentes para um email exato. O guard consulta `socket.remoteAddress`, nunca `X-Forwarded-For`, e volta a confirmar a base efetiva para que uma montagem acidental permaneça 404. Entradas: input: Corpo `{ email }`; [options]: Dependências observáveis em teste. Devolve: Mensagens ordenadas da mais recente para a mais antiga.

### `real_dev/backend/src/modules/demo-mailbox/demo-mailbox.validation.js`

- `assertDemoMailboxQuery(input)` (exportada; função) - Valida o corpo fechado `{ email }`. Entradas: input: Corpo recebido. Devolve: Email normalizado.

### `real_dev/backend/src/modules/discovery/discovery.controller.js`

- `getDiscoveryHomeController(_req, res)` (exportada; função) - Devolve a composição da página inicial de descoberta. O pedido não precisa de parâmetros: o serviço agrega os blocos públicos que a home deve renderizar. Entradas: _req: Pedido Express não usado por esta rota; res: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com os blocos de descoberta.
- `getRelatedContentController(req, res)` (exportada; função) - Devolve conteúdos relacionados com um item do catálogo. O identificador recebido na rota define o conteúdo de referência usado pelo serviço para calcular relações editoriais ou taxonómicas. Entradas: req: Pedido Express com `params.contentId`; res: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com conteúdos relacionados.

### `real_dev/backend/src/modules/discovery/discovery.service.js`

- `toPublicDiscoveryCard(content)` (exportada; função) - Converte um documento de conteúdo num cartão de descoberta. Entradas: content: Documento de conteúdo MongoDB. Devolve: Cartão público de descoberta.
- `loadCards(db, match, sort, [limit=10])` (top-level; função) - Carrega conteúdo publicado ordenado por uma regra simples de descoberta. Entradas: db: Base de dados MongoDB; match: Additional match filters; sort: Sort object; limit: Maximum items to return. Devolve: Cartões públicos.
- `loadMostWatchedCards(db, [limit=4])` (top-level; função) - Carrega conteúdos mais vistos a partir de progresso real de reprodução. Entradas: db: Base de dados MongoDB; limit: Maximum items to return. Devolve: Cartões públicos ordenados por visualização.
- `loadFormatSummaries(db)` (top-level; função) - Carrega resumos reais dos formatos principais usados na home pública. Entradas: db: Base de dados MongoDB. Devolve: Formatos com contagem e amostra publicada.
- `getDiscoveryHome()` (exportada; função) - Constrói os carrosséis públicos da página de descoberta. Entradas: sem entradas explícitas. Devolve: Resposta da página inicial de descoberta.
- `getRelatedContent(contentId)` (exportada; função) - Lista conteúdo relacionado por taxonomias partilhadas primeiro e tipo depois. Entradas: contentId: Id público do conteúdo. Devolve: Resposta de conteúdo relacionado.

### `real_dev/backend/src/modules/discovery/discovery.validation.js`

- `asObjectId(id, label)` (exportada; função) - Converte um id público num ObjectId MongoDB. Entradas: id: Id bruto recebido dos parâmetros da rota; label: Portuguese domain label used in errors. Devolve: ObjectId seguro.

### `real_dev/backend/src/modules/integrations/integrations.controller.js`

- `getIntegrations(_req, res)` (exportada; função) - Lista integracoes configuraveis. Entradas: _req: Pedido HTTP; res: Resposta HTTP. Devolve: Lista de integracoes.
- `patchIntegration(req, res)` (exportada; função) - Atualiza uma integracao por chave. Entradas: req: Pedido HTTP; res: Resposta HTTP. Devolve: Integracao atualizada.

### `real_dev/backend/src/modules/integrations/integrations.indexes.js`

- `ensureIntegrationIndexes()` (exportada; função) - Garante uma única configuração por chave canónica. A criação falha perante duplicados legacy, impedindo que a aplicação escolha silenciosamente um estado operacional não determinístico. Entradas: sem entradas explícitas. Devolve: Termina quando o índice único existe.

### `real_dev/backend/src/modules/integrations/integrations.service.js`

- `asUserObjectId(userId)` (top-level; função) - Converte o id do administrador para auditoria. Entradas: userId: Id vindo da sessão. Devolve: Id MongoDB.
- `defaultSetting(key)` (top-level; função) - Cria o estado canónico usado quando a integração ainda não foi persistida. Entradas: key: Chave validada. Devolve: Estado por defeito.
- `auditSnapshot(key, setting)` (top-level; função) - Constrói o snapshot mínimo usado na auditoria. Entradas: key: Chave canónica; setting: Estado validado. Devolve: Snapshot sem metadados internos.
- `resolvePersistedSetting(key, row)` (top-level; função) - Revalida uma linha persistida; qualquer documento legacy inválido fica explicitamente desativado sem propagar a sua configuração livre. Entradas: key: Chave esperada; row: Documento persistido. Devolve: Resultado seguro.
- `toPublicIntegration(key, resolved, updatedAt)` (top-level; função) - Converte um estado validado no DTO administrativo. Entradas: key: Chave canónica; resolved: Estado resolvido; updatedAt: Data persistida. Devolve: Estado público da integração.
- `getIntegrationSetting(keyInput, [options={}])` (exportada; função) - Lê uma integração com revalidação fail-closed. Entradas: keyInput: Chave recebida; [options]: Contexto transacional opcional. Devolve: DTO operacional seguro.
- `isIntegrationEnabled(keyInput, [options={}])` (exportada; função) - Confirma de forma não-excecional se o controlo operacional está ativo. Entradas: keyInput: Chave da integração; [options]: Contexto transacional opcional. Devolve: Verdadeiro apenas para configuração atual válida e ativa.
- `assertIntegrationEnabled(keyInput, [options={}])` (exportada; função) - Exige uma integração ativa antes de criar uma nova operação dependente. Replays idempotentes devem ser resolvidos pelo chamador antes deste guard. Entradas: keyInput: Chave da integração; [options]: Contexto transacional opcional. Devolve: Valor documentado como `Promise<void>`.
- `listIntegrationSettings([options={}])` (exportada; função) - Lista as integrações aceites no MVP, ignorando chaves desconhecidas. Entradas: [options]: Contexto de persistência opcional. Devolve: Integrações visíveis ao admin.
- `updateIntegrationSetting(actorUserId, keyInput, input, [context={}])` (exportada; função) - Atualiza uma integração e regista snapshots reais e minimizados. Entradas: actorUserId: Id do admin autenticado; keyInput: Chave recebida por parâmetro; input: Corpo recebido; [context]: Metadados seguros do pedido. Devolve: Integração atualizada.

### `real_dev/backend/src/modules/integrations/integrations.validation.js`

- `isPlainObject(value)` (top-level; função) - Confirma que um valor é um objeto simples de dados. Entradas: value: Valor recebido. Devolve: Verdadeiro para objeto simples.
- `assertOnlyFields(input, allowed, message)` (top-level; função) - Recusa campos fora de uma allowlist fechada. Entradas: input: Objeto a verificar; allowed: Campos permitidos; message: Mensagem pública. Devolve: Sem valor devolvido.
- `assertIntegrationKey(key)` (exportada; função) - Valida a chave de integração recebida por parâmetro. Entradas: key: Chave recebida. Devolve: Chave validada.
- `assertPublicConfig(key, value)` (top-level; função) - Valida a configuração pública específica de uma integração. `internal_notifications` expõe apenas o canal fixo `in_app`. As restantes integrações não aceitam quaisquer campos de configuração pública. Entradas: key: Chave validada; value: Configuração recebida. Devolve: Configuração canónica.
- `assertIntegrationUpdate(keyInput, input)` (exportada; função) - Valida uma atualização administrativa para a chave selecionada. Entradas: keyInput: Chave da integração; input: Corpo recebido. Devolve: Atualização segura.
- `assertPersistedIntegration(keyInput, document)` (exportada; função) - Revalida um documento persistido antes de este influenciar a aplicação. Metadados MongoDB conhecidos são aceites, mas qualquer campo de domínio inesperado faz a configuração legacy falhar fechada no service. Entradas: keyInput: Chave esperada; document: Documento de `integration_settings`. Devolve: Estado validado.

### `real_dev/backend/src/modules/jobs/billing-jobs.service.js`

- `operationalError(code, message)` (top-level; função) - Cria um erro operacional com código estável e sem dados internos. Entradas: code: Código seguro; message: Mensagem local. Devolve: Erro categorizado.
- `requiredDate(value, code)` (top-level; função) - Valida uma data sem aceitar strings ambíguas ou valores inválidos. Entradas: value: Data bruta; code: Código de erro. Devolve: Cópia válida.
- `previousUtcMonth(referenceDate)` (exportada; função) - Produz o mês UTC anterior ao instante indicado. Entradas: referenceDate: Data do worker. Devolve: Mês `YYYY-MM`.
- `utcMonthKey(date)` (top-level; função) - Converte uma data para a chave mensal UTC. Entradas: date: Data válida. Devolve: `YYYY-MM`.
- `enumerateMonths(startMonth, endMonth, [limit=MAX_POOL_CATCHUP_MONTHS])` (top-level; função) - Enumera meses fechados sem saltar períodos após downtime do worker. Entradas: startMonth: Primeiro mês; endMonth: Último mês; [limit=MAX_POOL_CATCHUP_MONTHS]: Máximo por lote. Devolve: Sequência inclusiva limitada ao lote.
- `nextUtcMonth(month)` (top-level; função) - Avança uma chave mensal UTC exatamente um mês. Entradas: month: Chave `YYYY-MM` validada internamente. Devolve: Mês seguinte.
- `discoverPendingPoolMonths([input={}])` (exportada; função) - Descobre meses fechados ainda sem distribuição, incluindo períodos de pausa. Entradas: [input]: Contexto. Devolve: Meses ordenados por antiguidade.
- `subscriptionCycleJobKey(subscription)` (exportada; função) - Cria a chave única de um ciclo sem caracteres livres vindos do utilizador. Entradas: subscription: Documento mínimo. Devolve: Chave aceite pelo ledger de jobs.
- `financialSnapshot(plan)` (top-level; função) - Valida e captura valores financeiros autoritativos do plano. Entradas: plan: Plano persistido. Devolve: Snapshot.
- `renewalRequestHash(input)` (top-level; função) - Gera um hash estável do ciclo sem persistir payload arbitrário. Entradas: input: Campos canónicos do ciclo. Devolve: SHA-256 hexadecimal.
- `billingAnchorForSubscription(subscription)` (top-level; função) - Recupera a âncora persistida ou infere-a do início do ciclo legacy. Entradas: subscription: Subscrição lida na transação. Devolve: Âncora estável.
- `assertCycleWrite(result)` (top-level; função) - Exige que uma escrita condicional tenha encontrado exatamente o ciclo lido. Entradas: result: Resultado MongoDB. Devolve: Sem valor devolvido.
- `closeOwnedFamily(db, ownerUserId, now, reason, session)` (top-level; função) - Remove lugares do owner quando a subscrição deixa de conceder acesso. Entradas: db: DB transacional; ownerUserId: Owner da família; now: Instante do job; reason: Motivo estável; session: Sessão. Devolve: Valor documentado como `Promise<void>`.
- `processSubscriptionCycle(subscriptionId, expectedPeriodEnd, [options={}])` (exportada; função) - Processa uma única subscrição/ciclo dentro de uma transação. Entradas: subscriptionId: Id persistido; expectedPeriodEnd: Fim usado na chave idempotente; [options]: Relógio injetável. Devolve: Resultado seguro.
- `runDueSubscriptionJobs(input)` (exportada; função) - Descobre e executa jobs vencidos de subscrição com lease por ciclo. Entradas: input: Contexto do worker. Devolve: Resumo.
- `runMonthlyPoolJob(input)` (exportada; função) - Executa, no máximo uma vez, o fecho do mês UTC anterior. Entradas: input: Contexto do worker. Devolve: Resumo.
- `runPendingMonthlyPoolJobs(input)` (exportada; função) - Fecha sequencialmente todos os meses pendentes dentro do limite local. Entradas: input: Contexto. Devolve: Resumo.
- `runBillingWorkerCycle(input)` (exportada; função) - Executa uma passagem do worker, mantendo os dois domínios observáveis. Entradas: input: Contexto. Devolve: Resumo da passagem.

### `real_dev/backend/src/modules/jobs/renewal-adapter.js`

- `decideSimulatedRenewal(input)` (exportada; função) - Resolve o resultado local de uma renovação simulada. A subscrição pode substituir o valor do plano para permitir cenários de teste/apoio. Sem configuração explícita, a baseline aprova deterministicamente. Entradas: input: Contexto persistido. Devolve: Decisão local.

### `real_dev/backend/src/modules/jobs/scheduled-jobs.service.js`

- `ensureScheduledJobIndexes()` (exportada; função) - Garante índices de unicidade e seleção de jobs prontos. Entradas: sem entradas explícitas. Devolve: Valor documentado como `Promise<void>`.
- `assertJobKey(value)` (top-level; função) - Valida uma chave estável sem aceitar dados arbitrários em nomes operacionais. Entradas: value: Chave bruta. Devolve: Chave normalizada.
- `assertLeaseMs(value)` (top-level; função) - Limita a duração do lease para recuperar workers terminados. Entradas: value: Duração solicitada. Devolve: Duração segura em milissegundos.
- `registerScheduledJob(input)` (exportada; função) - Regista o job sem antecipar um agendamento já existente. Entradas: input: Definição. Devolve: Valor documentado como `Promise<void>`.
- `claimScheduledJob(input)` (exportada; função) - Reclama um job pronto através de compare-and-set atómico. Entradas: input: Pedido de lease. Devolve: Job reclamado ou null.
- `completeScheduledJob(input)` (exportada; função) - Fecha um lease apenas se ainda pertencer ao worker chamador. Entradas: input: Resultado. Devolve: Verdadeiro quando o lease foi fechado.
- `failScheduledJob(input)` (exportada; função) - Liberta uma execução falhada para retry futuro sem guardar mensagens internas. Entradas: input: Falha. Devolve: Verdadeiro quando o lease pertencia ao worker.

### `real_dev/backend/src/modules/library/library.controller.js`

- `getFavorites(req, res)` (exportada; função) - Lista favoritos guardados pelo utilizador autenticado. O controller fixa o tipo de lista como `favorite` e usa a sessão para impedir acesso a bibliotecas de outros utilizadores. Entradas: req: Pedido Express com `user.id`; res: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com favoritos.
- `putFavorite(req, res)` (exportada; função) - Adiciona um conteúdo aos favoritos do utilizador. A rota recebe o conteúdo no URL e o serviço cria a associação com a conta da sessão atual. Entradas: req: Pedido Express com `user.id` e `params.contentId`; res: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com o favorito guardado.
- `deleteFavorite(req, res)` (exportada; função) - Remove um conteúdo dos favoritos do utilizador. O tipo de lista fica fixo no controller e o serviço remove apenas a associação pertencente à sessão atual. Entradas: req: Pedido Express com `user.id` e `params.contentId`; res: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com o resultado da remoção.
- `getWatchlist(req, res)` (exportada; função) - Lista conteúdos guardados na watchlist do utilizador. A função consulta a biblioteca pessoal com o tipo `watchlist`, mantendo o detalhe de armazenamento escondido no serviço. Entradas: req: Pedido Express com `user.id`; res: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com a watchlist.
- `putWatchlist(req, res)` (exportada; função) - Adiciona um conteúdo à watchlist do utilizador. O controller recebe o conteúdo no URL e delega no serviço a criação idempotente da entrada de biblioteca. Entradas: req: Pedido Express com `user.id` e `params.contentId`; res: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com a entrada guardada.
- `deleteWatchlist(req, res)` (exportada; função) - Remove um conteúdo da watchlist do utilizador. A função passa ao serviço o utilizador, o conteúdo e o tipo de lista para apagar apenas a associação correta. Entradas: req: Pedido Express com `user.id` e `params.contentId`; res: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com o resultado da remoção.
- `getHistory(req, res)` (exportada; função) - Lista o histórico de visualização do utilizador autenticado. O controller devolve a coleção calculada pelo serviço para alimentar a área pessoal sem aceitar identificadores de utilizador vindos do cliente. Entradas: req: Pedido Express com `user.id`; res: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com histórico de visualização.

### `real_dev/backend/src/modules/library/library.service.js`

- `assertPublishedContent(db, contentId)` (top-level; função) - Garante que um conteúdo publicado existe antes de operações de lista. Entradas: db: Base de dados MongoDB; contentId: Id do conteúdo. Devolve: Documento de conteúdo publicado.
- `publicContent(content)` (top-level; função) - Converte um documento de conteúdo num item compacto de biblioteca. Entradas: content: Documento de conteúdo. Devolve: Item público de biblioteca.
- `aggregatePersonalPage(collection, pipeline, sort, pagination)` (top-level; função) - Executa uma pagina MongoDB sobre um pipeline que ja restringe pertença e visibilidade. Entradas: collection: Colecao de origem; pipeline: Filtros e joins anteriores a paginacao; sort: Ordenacao total e estavel; pagination: Pagina validada. Devolve: Resultado paginado.
- `ensureLibraryIndexes()` (exportada; função) - Garante que existem os índices de favoritos/watchlist. Entradas: sem entradas explícitas. Devolve: Termina depois da criação de índices.
- `addToList(userId, contentId, type)` (exportada; função) - Adiciona conteúdo publicado a uma lista pessoal. Entradas: userId: Authenticated user id; contentId: Id do conteúdo; type: List type. Devolve: Estado de gravação.
- `removeFromList(userId, contentId, type)` (exportada; função) - Remove conteúdo de uma lista pessoal. Entradas: userId: Authenticated user id; contentId: Id do conteúdo; type: List type. Devolve: Estado de gravação.
- `listSavedContent(userId, type, [query={}])` (exportada; função) - Lista uma lista pessoal do utilizador autenticado. Entradas: userId: Authenticated user id; type: List type; [query={}]: Query de paginacao. Devolve: Pagina de conteudos publicados guardados.
- `listHistory(userId, [query={}])` (exportada; função) - Lista histórico de visualização a partir do progresso de reprodução. Entradas: userId: Authenticated user id; [query={}]: Query de paginacao. Devolve: Pagina de historico.

### `real_dev/backend/src/modules/library/library.validation.js`

- `asObjectId(id, label)` (exportada; função) - Converte uma string de id em ObjectId. Entradas: id: Id bruto; label: Domain label for errors. Devolve: ObjectId MongoDB.
- `assertListType(type)` (exportada; função) - Valida um tipo de lista da biblioteca pessoal. Entradas: type: Tipo bruto de lista. Devolve: Tipo de lista seguro.
- `parsePersonalListPagination([query={}])` (exportada; função) - Valida a pagina pedida para favoritos, watchlist ou historico. Entradas: query: Query string recebida. Devolve: Pagina pessoal segura.

### `real_dev/backend/src/modules/media/media-assets.service.js`

- `asObjectId(value, label)` (top-level; função) - Converte um identificador externo em ObjectId com erro de domínio estável. Entradas: value: Id recebido; label: Nome seguro do recurso. Devolve: Id MongoDB.
- `contentVersion(content)` (top-level; função) - Normaliza documentos editoriais anteriores ao campo `version`. Entradas: content: Documento de conteúdo. Devolve: Versão positiva corrente.
- `contentVersionFilter(contentId, expectedVersion)` (top-level; função) - Constrói o filtro CAS com compatibilidade limitada a documentos legacy. Entradas: contentId: Conteúdo a alterar; expectedVersion: Versão vista pelo administrador. Devolve: Filtro MongoDB.
- `contentVersionConflict()` (top-level; função) - Cria o conflito canónico usado por mutações editoriais concorrentes. Entradas: sem entradas explícitas. Devolve: Erro 409 com código estável.
- `assertPlayableContentType(content)` (top-level; função) - Rejeita séries agregadoras como destino de ficheiros reproduzíveis. Entradas: content: Conteúdo candidato. Devolve: Sem valor devolvido.
- `toPublicMediaAsset(asset)` (exportada; função) - Expõe apenas metadata administrativa; `storageKey` nunca atravessa a API. Entradas: asset: Documento interno. Devolve: Asset administrativo seguro.
- `ensureMediaAssetIndexes()` (exportada; função) - Garante constraints de unicidade e os índices de consulta do domínio. Entradas: sem entradas explícitas. Devolve: Termina quando todos os índices existem.
- `createMediaUpload(contentId, input, actorUserId)` (exportada; função) - Cria uma sessão de ingestão para um conteúdo editorial existente. Entradas: contentId: Identificador do conteúdo; input: Metadata fechada do MP4; actorUserId: Administrador autenticado. Devolve: Asset público em estado pending.
- `recordUploadFailure(assets, assetId, error)` (top-level; função) - Marca uma sessão como falhada sem permitir que uma falha secundária de MongoDB esconda o erro original do stream. Entradas: assets: Coleção de assets; assetId: Asset reclamado; error: Falha original. Devolve: Termina após a tentativa best-effort.
- `receiveMediaUpload(contentId, uploadId, readable, [headers={}])` (exportada; função) - Faz streaming do corpo MP4 para storage privado e persiste a metadata calculada apenas depois da promoção atómica do `.partial`. Entradas: contentId: Conteúdo dono do upload; uploadId: Sessão de upload; readable: Corpo binário bruto; headers: Headers HTTP. Devolve: Asset público em estado uploaded.
- `assertStoredAssetReady(asset)` (top-level; função) - Confirma que o ficheiro final ainda existe e corresponde ao tamanho validado. Entradas: asset: Asset interno em estado uploaded. Devolve: Termina depois de fechar o handle de verificação.
- `activateMediaUpload(contentId, uploadId, input, actorUserId, [context={}])` (exportada; função) - Ativa um MP4 validado, preservando a fonte anterior até ao commit. A transação guarda a revisão editorial, desativa o asset anterior, ativa o novo e troca a fonte no conteúdo com compare-and-swap. Entradas: contentId: Conteúdo a alterar; uploadId: Asset já ingerido; input: Corpo com `expectedVersion`; actorUserId: Administrador autenticado; [context]: Metadata segura do pedido. Devolve: Resultado público.
- `abortMediaUpload(contentId, uploadId)` (exportada; função) - Aborta uma sessão não ativa e remove os ficheiros associados. A alteração de estado acontece antes da remoção; um `PUT` concorrente deixa de conseguir promover o asset na base e limpa o ficheiro que acabou de criar. Entradas: contentId: Conteúdo dono do upload; uploadId: Asset abortado. Devolve: Termina após a limpeza.
- `listMediaAssets(contentId)` (exportada; função) - Lista assets administrativos de um conteúdo sem expor paths ou storage keys. Entradas: contentId: Conteúdo consultado. Devolve: Assets do mais recente para o antigo.
- `getMediaDeliveryContext(assetId, userId)` (exportada; função) - Revalida todas as regras de acesso imediatamente antes de abrir o ficheiro. Entradas: assetId: Asset pedido pela URL privada; userId: Utilizador autenticado. Devolve: Contexto interno para o controller.

### `real_dev/backend/src/modules/media/media-http.js`

- `rangeNotSatisfiable(sizeBytes)` (top-level; função) - Cria um erro 416 que transporta apenas o tamanho necessário ao header `Content-Range`, sem expor qualquer detalhe de storage. Entradas: sizeBytes: Tamanho total do ficheiro. Devolve: Erro HTTP Range.
- `resolveMediaByteRange(headerValue, sizeBytes)` (exportada; função) - Resolve um único byte range segundo RFC 9110. Múltiplos ranges não são aceites nesta baseline MP4 progressive. Um limite final acima do tamanho é truncado; início fora do ficheiro produz 416. Entradas: headerValue: Valor do header `Range`; sizeBytes: Tamanho total do ficheiro. Devolve: Intervalo normalizado.

### `real_dev/backend/src/modules/media/media-storage.service.js`

- `pathIsInside(parent, candidate)` (top-level; função) - Confirma se `candidate` está dentro de `parent` sem usar comparação textual vulnerável a prefixos comuns (`public` vs `public-backup`). Entradas: parent: Diretório pai absoluto; candidate: Diretório candidato absoluto. Devolve: Verdadeiro quando o candidato é o próprio pai ou descendente.
- `storageConfigurationError(message)` (top-level; função) - Cria um erro de configuração sem incluir paths potencialmente sensíveis. Entradas: message: Diagnóstico sanitizado. Devolve: Erro estável de arranque/storage.
- `prospectiveRealPath(targetPath)` (top-level; função) - Resolve o path que um diretório ainda inexistente terá, seguindo apenas o ancestral já presente. Isto deteta aliases intermédios antes de `mkdir` poder criar qualquer entrada dentro do respetivo destino real. Entradas: targetPath: Path absoluto pretendido. Devolve: Path real ou prospetivo absoluto.
- `buildMediaStorageConfig([source=process.env])` (exportada; função) - Constrói configuração segura e testável para o storage local. O limite pode ser reduzido por ambiente, mas nunca aumentado além dos 512 MiB definidos para a demonstração. Entradas: [source=process.env]: Variáveis de ambiente. Devolve: Configuração canónica.
- `createOpaqueMediaStorageKey()` (exportada; função) - Gera uma chave sem semântica externa e com entropia suficiente para impedir enumeração ou colisões práticas. Entradas: sem entradas explícitas. Devolve: Chave hexadecimal opaca com extensão interna fixa.
- `assertStorageKey(storageKey)` (top-level; função) - Valida uma storage key já persistida. Nunca aceita nomes vindos de params ou do corpo do pedido. Entradas: storageKey: Chave interna do documento MongoDB. Devolve: Chave validada.
- `mediaStoragePaths(storageKey, [root=mediaStorageConfig.root])` (exportada; função) - Deriva os únicos dois paths permitidos para uma chave interna. Entradas: storageKey: Chave persistida; [root=mediaStorageConfig.root]: Raiz configurada. Devolve: Paths privados.
- `ensureMediaStorageRoot([root=mediaStorageConfig.root])` (exportada; função) - Cria a raiz com permissões privadas. `chmod` corrige diretórios preexistentes criados pela própria demo com umask mais permissiva. Entradas: [root=mediaStorageConfig.root]: Raiz de storage. Devolve: Termina quando a raiz está pronta.
- `hasMp4FileTypeBox(header)` (top-level; função) - Confirma a assinatura mínima ISO Base Media File Format (`ftyp`). Entradas: header: Primeiros bytes do upload. Devolve: Verdadeiro para um cabeçalho MP4 plausível.
- `safeUploadError(error)` (top-level; função) - Converte falhas de filesystem/stream esperadas num erro público estável. Entradas: error: Falha original. Devolve: Erro seguro.
- `storeMediaUpload(readable, options)` (exportada; função) - Recebe e valida um MP4 sem carregar o ficheiro inteiro em memória. Entradas: readable: Corpo bruto do pedido HTTP; options: Regras internas do upload. Devolve: Metadata calculada.
- `removeMediaStorageFiles(storageKey, [root=mediaStorageConfig.root])` (exportada; função) - Remove resíduos finais e parciais associados a uma chave já validada. Entradas: storageKey: Chave interna; [root=mediaStorageConfig.root]: Raiz configurada. Devolve: Termina quando ambos os paths deixam de existir.
- `openMediaStorageFile(storageKey, [root=mediaStorageConfig.root])` (exportada; função) - Abre um ficheiro final sem seguir symlinks e confirma que é regular. O `FileHandle` devolvido pertence ao caller: HEAD deve fechá-lo diretamente; GET deve entregá-lo a `FileHandle.createReadStream({ autoClose: true })`. Entradas: storageKey: Chave interna persistida; [root=mediaStorageConfig.root]: Raiz configurada. Devolve: Handle privado e tamanho.
- `inspectMediaStorageFile(storageKey, [root=mediaStorageConfig.root])` (exportada; função) - Recalcula o SHA-256 de um ficheiro final por stream. Esta inspeção é usada imediatamente antes da ativação para detetar alterações locais entre a ingestão e o commit editorial sem carregar o MP4 em memória. Entradas: storageKey: Chave interna persistida; [root=mediaStorageConfig.root]: Raiz configurada. Devolve: Metadata observada no disco.

### `real_dev/backend/src/modules/media/media.controller.js`

- `postMediaUpload(req, res)` (exportada; função) - Cria uma sessão de upload para um conteúdo. Entradas: req: Pedido administrativo JSON; res: Resposta Express. Devolve: Asset pendente.
- `putMediaUpload(req, res)` (exportada; função) - Recebe o corpo binário do MP4 diretamente do request stream. Entradas: req: Pedido `video/mp4` não processado por JSON; res: Resposta Express. Devolve: Asset validado, ainda não ativo.
- `postActivateMediaUpload(req, res)` (exportada; função) - Ativa um ficheiro ingerido com a versão editorial observada pelo cliente. Entradas: req: Pedido administrativo; res: Resposta Express. Devolve: Asset ativo e nova versão do conteúdo.
- `deleteMediaUpload(req, res)` (exportada; função) - Aborta uma ingestão não ativa e remove resíduos locais. Entradas: req: Pedido administrativo; res: Resposta Express. Devolve: Resposta vazia 204.
- `getContentMediaAssets(req, res)` (exportada; função) - Lista metadata de media de um conteúdo sem revelar storage keys. Entradas: req: Pedido administrativo; res: Resposta Express. Devolve: Lista segura de assets.
- `isClientDisconnect(error)` (top-level; função) - Identifica erros de transporte provocados pelo cliente abandonar o player. Entradas: error: Falha de pipeline. Devolve: Verdadeiro para desconexões esperadas.
- `deliverMediaAsset(req, res)` (exportada; função) - Entrega um asset com autenticação, entitlement, parentalidade e qualidade revalidados em cada GET/HEAD. Entradas: req: Pedido de media autenticado; res: Resposta Express/stream. Devolve: Stream parcial/completo ou resposta HEAD.

### `real_dev/backend/src/modules/media/media.validation.js`

- `invalidUpload(message, [code="MEDIA_UPLOAD_INVALID"])` (top-level; função) - Cria o erro público estável usado para payloads de upload inválidos. Entradas: message: Mensagem segura para o cliente administrativo; [code="MEDIA_UPLOAD_INVALID"]: Código de domínio. Devolve: Erro HTTP normalizado.
- `plainInput(input)` (top-level; função) - Exige um objeto JSON simples, sem arrays nem valores nulos. Entradas: input: Valor recebido. Devolve: Objeto validado.
- `assertAllowedFields(input, allowedFields)` (top-level; função) - Rejeita campos não documentados para impedir configuração implícita de paths, URLs ou metadata privada. Entradas: input: Payload validado; allowedFields: Allowlist da operação. Devolve: Sem valor devolvido.
- `assertCreateMediaUploadPayload(input)` (exportada; função) - Valida a criação de uma sessão de upload MP4. `expectedSizeBytes` e `expectedSha256` são opcionais, mas, quando presentes, tornam-se constraints obrigatórias no fim do stream. Entradas: input: Corpo JSON do pedido. Devolve: Payload canónico.
- `assertActivateMediaUploadPayload(input)` (exportada; função) - Valida o compare-and-swap usado ao ativar um ficheiro já ingerido. Entradas: input: Corpo JSON do pedido de ativação. Devolve: Versão editorial positiva.
- `assertMediaUploadHeaders(headers, asset, [maxBytes=MAX_MEDIA_UPLOAD_BYTES])` (exportada; função) - Valida os headers do `PUT` que transporta o corpo binário sem multipart. `Content-Length` é opcional para permitir streaming chunked, mas, quando é enviado, é verificado antes de abrir qualquer ficheiro. Entradas: headers: Headers HTTP normalizados pelo Node; asset: Sessão de upload; [maxBytes=MAX_MEDIA_UPLOAD_BYTES]: Limite efetivo do processo. Devolve: Metadata validada.

### `real_dev/backend/src/modules/notifications/notifications.controller.js`

- `getMyNotifications(req, res)` (exportada; função) - Devolve notificações do utilizador autenticado. Entradas: req: Pedido Express com `req.user.id`; res: Resposta Express. Devolve: Valor documentado como `Promise<void>`.
- `patchReadNotification(req, res)` (exportada; função) - Marca uma notificação do utilizador autenticado como lida. Entradas: req: Pedido Express com `req.params.id`; res: Resposta Express. Devolve: Valor documentado como `Promise<void>`.
- `getMyPreferences(req, res)` (exportada; função) - Devolve preferências de notificação do utilizador autenticado. Entradas: req: Pedido Express com `req.user.id`; res: Resposta Express. Devolve: Valor documentado como `Promise<void>`.
- `putMyPreferences(req, res)` (exportada; função) - Atualiza preferências de notificação do utilizador autenticado. Entradas: req: Pedido Express com `req.user.id` e corpo JSON; res: Resposta Express. Devolve: Valor documentado como `Promise<void>`.

### `real_dev/backend/src/modules/notifications/notifications.service.js`

- `asUserObjectId(userId)` (top-level; função) - Converte o identificador de utilizador em `ObjectId`. Entradas: userId: Identificador do utilizador. Devolve: Identificador pronto para filtros MongoDB.
- `asNotificationObjectId(notificationId)` (top-level; função) - Converte o identificador de notificação em `ObjectId`. Entradas: notificationId: Identificador da notificação. Devolve: Identificador pronto para filtros MongoDB.
- `publicNotification(notification)` (top-level; função) - Remove campos internos antes de devolver uma notificação. Entradas: notification: Documento MongoDB de `notifications`. Devolve: Notificação pública para a API.
- `ensureNotificationIndexes()` (exportada; função) - Cria índices usados por preferências, listagem e deduplicação. Entradas: sem entradas explícitas. Devolve: Valor documentado como `Promise<void>`.
- `enqueueEmailNotification(userId, input, options)` (top-level; função) - Coloca uma mensagem de notificação na outbox local quando o utilizador optou explicitamente pelo canal email. A função falha fechada para contas/email legacy inválidos e reutiliza a sessão do domínio para não publicar mensagens de transações abortadas. Entradas: userId: Utilizador validado; input: Mensagem canónica; options: Contexto persistente. Devolve: Verdadeiro quando foi criada uma nova mensagem.
- `getPreferences(userId, [options={}])` (exportada; função) - Obtém preferências de notificação do utilizador. Entradas: userId: Identificador do utilizador; [options]: Contexto transacional opcional. Devolve: Preferências persistidas ou valores por defeito.
- `updatePreferences(userId, input)` (exportada; função) - Atualiza preferências de notificação do utilizador. Entradas: userId: Identificador do utilizador; input: Dados recebido da API. Devolve: Preferências normalizadas.
- `createNotification(userId, input, [options={}])` (exportada; função) - Cria uma notificação respeitando preferências e deduplicação. Entradas: userId: Identificador do utilizador; input: Dados da notificação; [options]: Contexto transacional opcional. Devolve: Resultado da entrega.
- `createContinueWatchingNotification(userId, input)` (exportada; função) - Cria alerta deduplicado para continuar visualização. Entradas: userId: Identificador do utilizador; input: Dados do conteúdo interrompido. Devolve: Resultado da entrega.
- `listMyNotifications(userId, [query={}])` (exportada; função) - Lista notificações do utilizador autenticado. Entradas: userId: Identificador do utilizador; [query={}]: Query de paginacao. Devolve: Página de notificações ordenada por data.
- `markNotificationAsRead(userId, notificationId)` (exportada; função) - Marca uma notificação do utilizador como lida. Entradas: userId: Identificador do utilizador; notificationId: Identificador da notificação. Devolve: Notificação atualizada.

### `real_dev/backend/src/modules/notifications/notifications.validation.js`

- `httpError(message, [statusCode=400])` (top-level; função) - Cria um erro HTTP previsível para falhas de validação. Entradas: message: Mensagem segura para devolver ao cliente; [statusCode=400]: Código HTTP associado. Devolve: Erro com `statusCode`.
- `assertNotificationType(type)` (exportada; função) - Valida e normaliza o tipo de notificação. Entradas: type: Tipo recebido do service. Devolve: Tipo canónico.
- `requiredNotificationText(value, field, min, max)` (top-level; função) - Valida texto obrigatório de notificação. Entradas: value: Valor recebido; field: Nome do campo para mensagem de erro; min: Tamanho mínimo; max: Tamanho máximo. Devolve: Texto normalizado.
- `assertNotificationContent(input)` (exportada; função) - Valida título e mensagem de uma notificação. Entradas: input: Dados de entrada. Devolve: Conteúdo seguro para persistir.
- `assertPreferencePayload(input)` (exportada; função) - Valida preferências de notificação com valores por defeito. Entradas: input: Dados de entrada. Devolve: Preferências normalizadas.
- `parseNotificationPagination([query={}])` (exportada; função) - Valida a pagina da caixa de notificacoes pessoal. Entradas: query: Query string recebida. Devolve: Pagina segura.

### `real_dev/backend/src/modules/payments/payment-attempts-v2-migration.js`

- `migrationError(message, code)` (top-level; função) - Cria um erro seguro e identificável pelo CLI. Entradas: message: Mensagem sem URI nem credenciais; code: Código estável. Devolve: Erro de migração.
- `parsePaymentMigrationArguments([argv=[]])` (exportada; função) - Interpreta argumentos sem aceitar flags implícitas ou desconhecidas. Entradas: argv: Argumentos depois do nome do script. Devolve: Modo solicitado.
- `assertPaymentMigrationApplyAllowed(apply, [environment={}])` (exportada; função) - Exige opt-in explícito antes de qualquer write. Entradas: apply: Indica se a execução pretende persistir; environment: Ambiente efetivo. Devolve: Sem valor devolvido.
- `assertExplicitPaymentMigrationTarget(configuredName, resolvedName)` (exportada; função) - Impede que o CLI use uma base implícita ou uma base interna MongoDB. Entradas: configuredName: Nome definido em `MONGODB_DB_NAME`; resolvedName: Nome resolvido pela configuração da app. Devolve: Nome explícito validado.
- `asDate(value)` (top-level; função) - Normaliza uma data válida sem inventar valores. Entradas: value: Valor histórico. Devolve: Data válida ou null.
- `asCurrency(value)` (top-level; função) - Preserva uma moeda ISO-like válida. Entradas: value: Valor bruto. Devolve: Código normalizado ou null.
- `asCycle(value)` (top-level; função) - Preserva um ciclo apenas quando ambos os limites são demonstráveis. Entradas: value: Ciclo histórico. Devolve: Ciclo válido ou null.
- `historicalOrEstimated(historical, planValue, isValid, field, estimatedFields, unknownFields)` (top-level; função) - Escolhe um valor histórico comprovado ou uma estimativa do plano atual. Entradas: historical: Valor do documento legacy; planValue: Valor do plano atual; isValid: Validador; field: Campo contabilístico; estimatedFields: Campos estimados; unknownFields: Campos impossíveis de provar. Devolve: Valor preservado, estimado ou null.
- `buildPaymentAttemptV2MigrationPatch(attempt, currentPlan, [migratedAt=new Date()])` (exportada; função) - Constrói apenas o `$set` da migração, sem mutar o documento de entrada. Todos os documentos migrados ficam `accountingEstimate:true`: a versão histórica não continha proveniência suficiente para afirmar que o snapshot financeiro representa o valor efetivamente cobrado no passado. Entradas: attempt: Tentativa legacy; currentPlan: Plano atual com o mesmo `planCode`, se existir; migratedAt: Timestamp determinístico/injetável. Devolve: Patch v2 explícito.
- `migratePaymentAttemptsToV2({...})` (exportada; função) - Planeia ou aplica a migração de forma retomável e idempotente. O filtro do update repete `schemaVersion != 2`, protegendo documentos que tenham sido atualizados por outra execução depois da leitura. A função nunca consulta nem altera `pool_distributions`. Entradas: options: Opções injetáveis. Devolve: Resumo sem dados pessoais.

### `real_dev/backend/src/modules/payments/payments.controller.js`

- `postSimulatedCheckout(req, res)` (exportada; função) - Executa checkout simulado para o utilizador autenticado. Entradas: req: Pedido com `req.user.id` e corpo validavel; res: Resposta HTTP. Devolve: Valor documentado como `Promise<void>`.
- `postTrial(req, res)` (exportada; função) - Inicia o trial gratuito para o utilizador autenticado. Entradas: req: Pedido autenticado; res: Resposta HTTP. Devolve: Valor documentado como `Promise<void>`.

### `real_dev/backend/src/modules/payments/payments.service.js`

- `httpError(message, statusCode, code)` (top-level; função) - Cria um erro HTTP com código estável para o cliente. Entradas: message: Mensagem pública; statusCode: Estado HTTP; code: Código de domínio. Devolve: Erro compatível com o middleware global.
- `userObjectId(userId)` (top-level; função) - Converte o identificador autenticado para `ObjectId`. Entradas: userId: Identificador vindo da sessão. Devolve: Identificador validado.
- `addDays(date, days)` (top-level; função) - Soma dias sem alterar a instância original. Entradas: date: Data base; days: Dias a acrescentar. Devolve: Nova data.
- `hashRequest(operation, payload)` (top-level; função) - Produz hash determinístico do pedido normalizado, sem guardar o payload como segredo adicional no ledger de idempotência. Entradas: operation: Nome estável da operação; payload: Payload já validado/normalizado. Devolve: SHA-256 hexadecimal.
- `financialSnapshotForPlan(plan)` (top-level; função) - Captura os valores financeiros autoritativos do plano no momento da compra. Entradas: plan: Plano persistido. Devolve: Snapshot validado.
- `replayExisting(existing, requestHash)` (top-level; função) - Resolve repetição idempotente ou rejeita reutilização com outro payload. Entradas: existing: Documento persistido; requestHash: Hash do pedido atual. Devolve: Resposta original persistida.
- `activeSubscriptionConflict()` (top-level; função) - Cria o erro fail-closed usado quando não existe política de upgrade/proration. Entradas: sem entradas explícitas. Devolve: Conflito estável.
- `assertNoActivePaidSubscription(db, userId, now, session)` (top-level; função) - Recusa uma segunda compra paga enquanto não houver produto de upgrade. Entradas: db: DB transacional; userId: Utilizador; now: Instante da operação; session: Sessão. Devolve: Valor documentado como `Promise<void>`.
- `ensurePaymentIndexes()` (exportada; função) - Cria índices sem alterar nem reconstruir documentos financeiros históricos. A constraint idempotente é parcial: tentativas antigas sem chave continuam imutáveis e não colidem entre si. Entradas: sem entradas explícitas. Devolve: Termina quando os índices existem.
- `createSimulatedCheckout(userId, input, idempotencyKeyValue, [context={}])` (exportada; função) - Regista checkout simulado e ativa a subscrição de forma atómica. Entradas: userId: Identificador autenticado; input: Dados do checkout simulado; idempotencyKeyValue: Header `Idempotency-Key`; [context]: Metadados seguros do pedido. Devolve: Resultado original ou replay idempotente.
- `startTrial(userId, idempotencyKeyValue, [context={}])` (exportada; função) - Inicia o trial único e a respetiva subscrição numa única transação. Entradas: userId: Identificador autenticado; idempotencyKeyValue: Header `Idempotency-Key`; [context]: Metadados seguros do pedido. Devolve: Resultado original ou replay idempotente.

### `real_dev/backend/src/modules/payments/payments.validation.js`

- `httpError(message, [statusCode=400])` (top-level; função) - Cria um erro HTTP previsivel para o middleware global de erros. Entradas: message: Mensagem segura para devolver ao cliente; [statusCode=400]: Código HTTP associado a erros de validação. Devolve: Erro com `statusCode`.
- `assertIdempotencyKey(value)` (exportada; função) - Valida a chave que torna checkout e trial repetíveis sem duplicar efeitos. A chave fica limitada a ASCII seguro e 128 caracteres para impedir valores ambíguos, control characters e crescimento ilimitado dos índices MongoDB. Entradas: value: Valor do header HTTP `Idempotency-Key`. Devolve: Chave normalizada.
- `assertCheckoutPayload(input)` (exportada; função) - Valida e normaliza o pedido de checkout simulado. Entradas: input: Corpo recebido no endpoint de checkout; input.planCode: Código do plano escolhido; input.paymentMethod: Método de pagamento de teste; [input.simulateOutcome="approved"]: Resultado controlado para a demo. Devolve: Dados seguros.

### `real_dev/backend/src/modules/playback/media-preferences.service.js`

- `asUserObjectId(userId)` (top-level; função) - Converte um id de utilizador num ObjectId MongoDB. Entradas: userId: Id do utilizador. Devolve: ObjectId MongoDB.
- `assertMediaPreferences([input={}])` (exportada; função) - Valida preferências media por allowlist de campos e valores. Entradas: input: Preferências brutas. Devolve: Preferências seguras.
- `safeStoredPreferences(value)` (top-level; função) - Aplica defaults seguros a dados legacy sem propagar valores desconhecidos. Entradas: value: Documento persistido. Devolve: Preferências válidas ou defaults.
- `ensureMediaPreferenceIndexes()` (exportada; função) - Garante que existem os índices de preferências media. Entradas: sem entradas explícitas. Devolve: Termina depois da criação de índices.
- `getMediaPreferences(userId)` (exportada; função) - Devolve as preferências media do utilizador autenticado. Entradas: userId: Authenticated user id. Devolve: Preferências.
- `saveMediaPreferences(userId, input)` (exportada; função) - Guarda as preferências media do utilizador autenticado. Entradas: userId: Authenticated user id; input: Preferences dados. Devolve: Preferências guardadas.

### `real_dev/backend/src/modules/playback/playback.controller.js`

- `getPlaybackByContent(req, res)` (exportada; função) - Devolve o estado de reprodução de um conteúdo para o utilizador autenticado. O controller lê o `contentId` da rota e o `user.id` da sessão para pedir ao serviço o progresso e as preferências aplicáveis a esse conteúdo. Entradas: req: Pedido Express com `params.contentId` e `user.id`; res: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com o estado de reprodução.
- `putPlaybackProgress(req, res)` (exportada; função) - Atualiza o progresso de reprodução de um conteúdo. A rota recebe a posição no corpo do pedido e delega no serviço a validação e a persistência associadas à conta autenticada. Entradas: req: Pedido Express com conteúdo, utilizador e progresso; res: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com o progresso guardado.
- `getContinueWatching(req, res)` (exportada; função) - Lista conteúdos que o utilizador pode continuar a ver. O controller usa apenas a sessão autenticada e paginação limitada para obter a lista pessoal calculada pelo serviço de playback. Entradas: req: Pedido Express com `user.id`; res: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com os itens para continuar a ver.
- `getPlaybackPreferences(req, res)` (exportada; função) - Devolve as preferências de reprodução do utilizador autenticado. A função separa a camada HTTP da leitura de preferências, mantendo a regra de sessão concentrada no serviço. Entradas: req: Pedido Express com `user.id`; res: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com as preferências atuais.
- `putPlaybackPreferences(req, res)` (exportada; função) - Atualiza as preferências de reprodução do utilizador autenticado. O corpo do pedido transporta as opções escolhidas na UI e o serviço decide que campos são válidos para persistência. Entradas: req: Pedido Express com `user.id` e preferências no body; res: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com as preferências guardadas.

### `real_dev/backend/src/modules/playback/playback.service.js`

- `asObjectId(id, label)` (top-level; função) - Converte uma string de id em ObjectId com erro de domínio. Entradas: id: Id bruto; label: Domain label for error messages. Devolve: ObjectId MongoDB.
- `publicProgress(progress, durationSeconds)` (top-level; função) - Converte um documento de progresso para o formato público da API. Entradas: progress: Progress document or null; durationSeconds: Content duration. Devolve: Progresso público.
- `playbackSource(value)` (top-level; função) - Normaliza uma fonte de playback e rejeita valores vazios ou não textuais. Entradas: value: Fonte candidata do documento interno. Devolve: Fonte utilizável ou string vazia.
- `isAllowedQuality(quality, entitlements)` (top-level; função) - Confirma que a qualidade de uma variante está dentro dos entitlements. Entradas: quality: Qualidade fechada; entitlements: Entitlements efetivos. Devolve: Verdadeiro apenas para qualidades conhecidas e permitidas.
- `publicQualityOptions(options, selectedQuality)` (top-level; função) - Constrói as opções públicas sem transportar qualquer alias de fonte. Entradas: options: Opções filtradas por entitlement; selectedQuality: Qualidade canónica selecionada. Devolve: Opções seguras.
- `publicTracks([tracks={}])` (top-level; função) - Expõe apenas labels de faixas; URLs, metadata interna e aliases de fonte não atravessam a fronteira privada do playback. Entradas: tracks: Faixas internas. Devolve: Faixas públicas.
- `resolvePlayableMedia(content, preferences, entitlements)` (top-level; função) - Resolve media reproduzível sem construir URLs a partir de input do utilizador. Entradas: content: Documento de conteúdo; preferences: Preferências do utilizador; entitlements: Entitlements efetivos do utilizador. Devolve: Variante canónica.
- `mediaNotReadyError()` (top-level; função) - Cria o erro de dominio devolvido quando o catalogo ainda nao tem media pronta. Entradas: sem entradas explícitas. Devolve: Erro HTTP estruturado.
- `assertMediaReady(content)` (exportada; função) - Exige estado `ready` e pelo menos uma fonte configurada. Entradas: content: Documento de conteudo. Devolve: Sem valor devolvido.
- `assertParentalAccess(user, content)` (top-level; função) - Lança erro quando as definições parentais bloqueiam um conteúdo. Entradas: user: User document; content: Documento de conteúdo. Devolve: Sem valor devolvido.
- `loadEpisodeNavigation(db, episode, series)` (top-level; função) - Constrói links seguros para os episódios adjacentes publicados. Entradas: db: Base de dados MongoDB; episode: Episódio atual; series: Série publicada. Devolve: Navegação contextual.
- `assertPlayableHierarchy(db, content)` (top-level; função) - Impede playback direto de séries e valida a série publicada de episódios. Entradas: db: Base de dados MongoDB; content: Conteúdo publicado. Devolve: Série do episódio ou null.
- `assertPlaybackAccess(content, user)` (top-level; função) - Valida publicação, autenticação e controlo parental antes da media. Entradas: content: Conteúdo candidato; user: Utilizador autenticado. Devolve: Sem valor devolvido.
- `assertPlaybackEligibility(content, user)` (top-level; função) - Aplica a mesma fronteira de publicação, parental e media em todos os fluxos. Entradas: content: Conteúdo candidato; user: Utilizador autenticado. Devolve: Sem valor devolvido.
- `loadPlaybackEligibility(db, contentObjectId, userObjectId)` (top-level; função) - Carrega e valida um conteúdo para operações de playback. Entradas: db: Base de dados; contentObjectId: Conteúdo pedido; userObjectId: Utilizador autenticado. Devolve: Contexto autorizado.
- `publicPlaybackContent(content, preferences, entitlements)` (top-level; função) - Converte conteúdo para o formato de resposta de reprodução. Entradas: content: Documento de conteúdo; preferences: Preferências do utilizador; entitlements: Entitlements efetivos. Devolve: Conteúdo público de reprodução.
- `ensurePlaybackIndexes()` (exportada; função) - Garante que existem os índices de reprodução. Entradas: sem entradas explícitas. Devolve: Termina depois da criação de índices.
- `getPlayback(contentId, userId)` (exportada; função) - Carrega dados de reprodução de conteúdo publicado para um utilizador autenticado. Entradas: contentId: Id do conteúdo; userId: Authenticated user id. Devolve: Resposta de reprodução.
- `savePlaybackProgress(contentId, userId, input)` (exportada; função) - Guarda progresso de visualizacao e cria alerta de continuidade quando faz sentido. Entradas: contentId: Identificador do conteúdo; userId: Identificador do utilizador autenticado; input: Progresso recebido da UI. Devolve: Progresso público atualizado.
- `listContinueWatching(userId, [query={}])` (exportada; função) - Lista progresso inacabado do utilizador autenticado. Entradas: userId: Authenticated user id; [query={}]: Query de paginação. Devolve: Página de conteúdos por continuar.

### `real_dev/backend/src/modules/playback/playback.validation.js`

- `parseContinueWatchingPagination([query={}])` (exportada; função) - Valida a pagina da fila pessoal de conteúdos por continuar. Entradas: query: Query string recebida. Devolve: Paginação segura e limitada.
- `assertProgressPayload(input, durationSeconds)` (exportada; função) - Valida progresso de reprodução e calcula conclusão. Entradas: input: Progress dados; durationSeconds: Content duration. Devolve: Progresso seguro.

### `real_dev/backend/src/modules/privacy/privacy.controller.js`

- `getPrivacyExport(req, res)` (exportada; função) - Devolve a exportacao de dados do utilizador autenticado. Entradas: req: Pedido atual; res: Resposta HTTP. Devolve: JSON de exportacao.
- `deleteAccount(req, res)` (exportada; função) - Elimina a propria conta e limpa o cookie de sessao. Entradas: req: Pedido atual; res: Resposta HTTP. Devolve: Resultado da eliminacao.
- `getConsents(req, res)` (exportada; função) - Devolve consentimentos atuais do utilizador autenticado. Entradas: req: Pedido atual; res: Resposta HTTP. Devolve: Estado de consentimentos.
- `putConsents(req, res)` (exportada; função) - Atualiza consentimentos do utilizador autenticado. Entradas: req: Pedido atual; res: Resposta HTTP. Devolve: Estado atualizado.

### `real_dev/backend/src/modules/privacy/privacy.service.js`

- `ensurePrivacyIndexes()` (exportada; função) - Garante invariantes de consentimento e pedidos de eliminação. Entradas: sem entradas explícitas. Devolve: Valor documentado como `Promise<void>`.
- `asUserObjectId(userId)` (top-level; função) - Converte um id vindo da sessao para `ObjectId`. Entradas: userId: Identificador do utilizador autenticado. Devolve: Id convertido para MongoDB.
- `toExportValue(value)` (top-level; função) - Converte valores MongoDB para JSON estavel. Entradas: value: Valor vindo da base de dados. Devolve: Valor serializavel.
- `toExportableUser(user)` (top-level; função) - Remove campos internos do documento de utilizador. Entradas: user: Documento `users`. Devolve: Dados publicos exportaveis.
- `exportOwnedCollection(db, collectionName, userObjectId)` (top-level; função) - Carrega uma colecao filtrando sempre pelo dono autenticado. Entradas: db: Ligacao MongoDB; collectionName: Nome da colecao; userObjectId: Id do utilizador autenticado. Devolve: Documentos exportaveis.
- `exportFamilyMemberships(db, userObjectId)` (top-level; função) - Exporta partilhas familiares onde o utilizador e owner ou membro. Entradas: db: Ligacao MongoDB; userObjectId: Id do utilizador autenticado. Devolve: Memberships familiares exportaveis.
- `buildUserDataExport(userId)` (exportada; função) - Gera a exportacao RGPD do utilizador autenticado. Entradas: userId: Id vindo de `req.user.id`. Devolve: Exportacao completa.
- `deletePersonalCollections(db, userObjectId, session)` (top-level; função) - Remove documentos pessoais de colecoes cujo conteudo pertence ao utilizador. Entradas: db: Ligacao MongoDB; userObjectId: Id do utilizador; session: Sessao transacional. Devolve: Contagem por colecao.
- `anonymizeComments(db, userObjectId, session)` (top-level; função) - Anonimiza comentarios sem destruir a discussao publica ja moderada. Entradas: db: Ligacao MongoDB; userObjectId: Id do utilizador; session: Sessao transacional. Devolve: Numero de comentarios alterados.
- `cancelSubscriptionsForDeletedAccount(db, userObjectId, session)` (top-level; função) - Cancela subscricoes operacionais sem apagar historico financeiro agregado. Entradas: db: Ligacao MongoDB; userObjectId: Id do utilizador; session: Sessao transacional. Devolve: Numero de subscricoes atualizadas.
- `invalidateFamilyMembershipsForDeletedAccount(db, userObjectId, userEmail, session)` (top-level; função) - Invalida convites e partilhas familiares associados a uma conta eliminada. Entradas: db: Ligacao MongoDB; userObjectId: Id do utilizador; userEmail: Email original a remover de convites pendentes; session: Sessao transacional. Devolve: Numero de memberships atualizadas.
- `scrubRetainedFinancialRecords(db, userObjectId, session)` (top-level; função) - Mantém o ledger financeiro exigido, removendo campos de contacto facultativos. Entradas: db: Ligação MongoDB; userObjectId: Utilizador eliminado; session: Sessão transacional. Devolve: Registos financeiros pseudonimizados.
- `deleteMyAccount(userId, input)` (exportada; função) - Elimina a propria conta com confirmacao forte e limpeza controlada. Entradas: userId: Id vindo da sessao; input: Pedido recebido do frontend. Devolve: Resultado operacional.
- `toPublicConsents(document)` (top-level; função) - Constrói o estado publico de consentimentos. Entradas: document: Documento persistido. Devolve: Estado visivel.
- `getMyConsents(userId)` (exportada; função) - Lê os consentimentos atuais do utilizador autenticado. Entradas: userId: Id vindo da sessao. Devolve: Estado atual.
- `updateMyConsents(userId, input)` (exportada; função) - Atualiza consentimentos atuais e grava evento historico. Entradas: userId: Id vindo da sessao; input: Dados recebidos do frontend. Devolve: Estado atualizado.

### `real_dev/backend/src/modules/privacy/privacy.validation.js`

- `assertDeleteAccountPayload([input={}])` (exportada; função) - Valida o pedido destrutivo de eliminacao da propria conta. Entradas: input: Dados recebidos do frontend. Devolve: Dados normalizados.
- `assertConsentBoolean(input, key)` (top-level; função) - Valida que uma categoria de consentimento chegou como booleano real. Entradas: input: Dados recebidos; key: Categoria esperada. Devolve: Valor validado.
- `assertConsentPayload([input={}])` (exportada; função) - Valida as escolhas opcionais de consentimento do utilizador autenticado. Entradas: input: Dados recebidos do frontend. Devolve: Consentimentos persistiveis.

### `real_dev/backend/src/modules/ratings/ratings.controller.js`

- `putRating(req, res)` (exportada; função) - Cria ou atualiza a avaliação do utilizador para um conteúdo. O controller junta o utilizador autenticado, o conteúdo da rota e o valor do body antes de delegar a validação no serviço. Entradas: req: Pedido Express com `user.id`, `params.contentId` e `body.value`; res: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com a avaliação guardada.
- `getRatingMe(req, res)` (exportada; função) - Devolve a avaliação pessoal do utilizador para um conteúdo. A função usa a sessão para consultar apenas a avaliação do próprio utilizador. Entradas: req: Pedido Express com `user.id` e `params.contentId`; res: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com a avaliação pessoal.
- `deleteRating(req, res)` (exportada; função) - Remove a avaliação pessoal do utilizador para um conteúdo. O conteúdo vem da rota e a conta vem da sessão, impedindo remoção de avaliações de outros utilizadores. Entradas: req: Pedido Express com `user.id` e `params.contentId`; res: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com a avaliação removida.
- `getRatingSummaryController(req, res)` (exportada; função) - Devolve o resumo agregado de avaliações de um conteúdo. A rota pública recebe apenas o conteúdo e o serviço calcula totais e média sem revelar dados pessoais de avaliadores. Entradas: req: Pedido Express com `params.contentId`; res: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com resumo de avaliações.

### `real_dev/backend/src/modules/ratings/ratings.service.js`

- `assertPublishedContent(db, contentId)` (top-level; função) - Garante que classificações só podem apontar para conteúdo publicado. Entradas: db: Base de dados MongoDB; contentId: ObjectId do conteúdo. Devolve: Documento de conteúdo publicado.
- `emptySummary(contentId)` (top-level; função) - Constrói um resumo vazio de classificação para conteúdo sem classificações. Entradas: contentId: Id público do conteúdo. Devolve: Resposta agregada vazia.
- `ensureRatingIndexes()` (exportada; função) - Cria índices exigidos pelo contrato de classificações. Entradas: sem entradas explícitas. Devolve: Termina depois da criação de índices.
- `upsertRating(userId, contentId, value)` (exportada; função) - Cria ou atualiza a classificação do utilizador autenticado para um conteúdo. Entradas: userId: Authenticated user id from the session; contentId: Id público do conteúdo vindo dos parâmetros da rota; value: Valor bruto da classificação. Devolve: Estado de classificação gravado.
- `getMyRating(userId, contentId)` (exportada; função) - Devolve a classificação do utilizador autenticado para um conteúdo. Entradas: userId: Authenticated user id from the session; contentId: Id público do conteúdo vindo dos parâmetros da rota. Devolve: Estado atual da classificação do utilizador.
- `deleteMyRating(userId, contentId)` (exportada; função) - Remove a classificação do utilizador autenticado para um conteúdo. Entradas: userId: Authenticated user id from the session; contentId: Id público do conteúdo vindo dos parâmetros da rota. Devolve: Estado de classificação removida.
- `getRatingSummary(contentId)` (exportada; função) - Calcula o agregado público de classificações para um conteúdo publicado. Entradas: contentId: Id público do conteúdo vindo dos parâmetros da rota. Devolve: Resumo de classificações.

### `real_dev/backend/src/modules/ratings/ratings.validation.js`

- `asObjectId(id, label)` (exportada; função) - Converte um id público num ObjectId MongoDB. Entradas: id: Id bruto recebido dos parâmetros da rota ou da sessão; label: Portuguese domain label used in validation errors. Devolve: ObjectId MongoDB seguro.
- `assertRatingValue(value)` (exportada; função) - Valida a escala canónica de classificação FaithFlix. Entradas: value: Valor bruto recebido no corpo do pedido. Devolve: Classificação inteira entre 1 e 5.

### `real_dev/backend/src/modules/recommendations/content-embeddings.service.js`

- `normalizeEmbeddingText(value)` (exportada; função) - Normaliza texto para uma forma simples e comparável. Entradas: value: Texto bruto. Devolve: Texto normalizado.
- `tokenizeEmbeddingText(value)` (exportada; função) - Divide texto normalizado em tokens úteis. Entradas: value: Texto bruto. Devolve: Tokens.
- `stableHash(value)` (top-level; função) - Hash FNV-1a de 32 bits para manter os vetores estáveis entre execuções. Entradas: value: Token. Devolve: Hash unsigned.
- `normalizeVector(vector)` (exportada; função) - Normaliza um vetor pelo comprimento L2. Entradas: vector: Vetor bruto. Devolve: Vetor normalizado.
- `buildLocalContentEmbedding(text, [dimensions=CONTENT_EMBEDDING_DIMENSIONS])` (exportada; função) - Cria embedding local determinístico a partir de texto. Entradas: text: Fonte textual; [dimensions=CONTENT_EMBEDDING_DIMENSIONS]: Dimensões. Devolve: Vetor normalizado.
- `cosineSimilarity(left, right)` (exportada; função) - Calcula similaridade de cosseno entre dois vetores. Entradas: left: Primeiro vetor; right: Segundo vetor. Devolve: Similaridade.
- `hashEmbeddingSource(source)` (exportada; função) - Cria um hash SHA-256 da fonte usada no embedding. Entradas: source: Fonte textual canónica. Devolve: Hash hexadecimal.
- `ensureContentEmbeddingIndexes()` (exportada; função) - Garante os índices da coleção de embeddings. Entradas: sem entradas explícitas. Devolve: Termina depois da criação dos índices.
- `taxonomyNames(taxonomies)` (top-level; função) - Ordena nomes de taxonomias para uma fonte estável. Entradas: taxonomies: Taxonomias. Devolve: Nomes ordenados.
- `buildContentEmbeddingSource(content, [taxonomies=[]], [passages=[]])` (exportada; função) - Constrói a fonte textual usada para gerar o embedding de um conteúdo. Entradas: content: Conteúdo; [taxonomies=[]: ] Taxonomias associadas; [passages=[]: ] Passagens bíblicas publicadas associadas. Devolve: Fonte textual e hash.
- `loadEmbeddingSourceRelations(db, content)` (top-level; função) - Carrega taxonomias e passagens publicadas necessárias para a fonte do embedding. Entradas: db: Base de dados; content: Conteúdo publicado. Devolve: Dados associados.
- `buildContentEmbeddingDocument(db, content)` (exportada; função) - Cria o documento de embedding para um conteúdo publicado. Entradas: db: Base de dados; content: Conteúdo publicado. Devolve: Documento de embedding.
- `generateContentEmbeddings([options={}])` (exportada; função) - Gera ou regenera embeddings para conteúdos publicados. Entradas: [options={}]: Opções de geração. Devolve: Resumo.

### `real_dev/backend/src/modules/recommendations/recommendation-explanations.js`

- `buildRecommendationExplanation(reasonCode)` (exportada; função) - Converte um código de razão de recomendação numa explicação segura para o utilizador. Entradas: reasonCode: Internal recommendation reason code. Devolve: Explicação pública.

### `real_dev/backend/src/modules/recommendations/recommendation-workload.js`

- `estimateRecommendationWorkload(volume)` (exportada; função) - Estima operações escalares sem depender da velocidade da máquina. Entradas: volume: Volume fechado. Devolve: Budget determinístico.

### `real_dev/backend/src/modules/recommendations/recommendations.controller.js`

- `getMyRecommendations(req, res)` (exportada; função) - Devolve recomendações personalizadas para a sessão atual. O controller usa apenas o `user.id` autenticado e delega no serviço a escolha dos blocos recomendados, incluindo fallback cold-start quando necessário. Entradas: req: Pedido Express com `user.id`; res: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com recomendações do utilizador.

### `real_dev/backend/src/modules/recommendations/recommendations.service.js`

- `asObjectId(id, label)` (top-level; função) - Converte um id público num ObjectId MongoDB. Entradas: id: Id bruto vindo da sessão ou dos dados; label: Portuguese domain label used in errors. Devolve: ObjectId seguro.
- `publicCard(content)` (top-level; função) - Converte um documento de conteúdo num cartão compacto de recomendação. Entradas: content: Documento de conteúdo MongoDB. Devolve: Cartão público de recomendação.
- `addCount(map, key)` (top-level; função) - Increments one occurrence counter. Entradas: map: Counter map; key: Key to count. Devolve: Sem valor devolvido.
- `addWeightedContent(map, contentId, weight)` (top-level; função) - Soma peso semântico a um conteúdo sinalizado pelo utilizador. Entradas: map: Mapa contentId -> peso; contentId: Id de conteúdo; weight: Peso a somar. Devolve: Sem valor devolvido.
- `topKeys(map, [limit=5])` (top-level; função) - Devolve as chaves com maior frequência de um mapa de contadores. Entradas: map: Counter map; limit: Maximum number of keys. Devolve: Chaves mais frequentes.
- `loadUserSignals(db, userObjectId, maxAgeRating)` (top-level; função) - Carrega sinais de recomendação permitidos para o utilizador autenticado. Entradas: db: Base de dados MongoDB; userObjectId: Authenticated user ObjectId; maxAgeRating: Limite parental efetivo. Devolve: Resumo agregado de sinais.
- `objectIdsFromStrings(ids)` (top-level; função) - Converte ids públicos válidos em ObjectIds. Entradas: ids: Ids textuais. Devolve: ObjectIds válidos.
- `buildSemanticProfileVector(weightedContentIds, embeddings)` (exportada; função) - Constrói o vetor temporário do utilizador a partir de embeddings de conteúdos sinalizados. Entradas: weightedContentIds: Sinais ponderados; embeddings: Embeddings encontrados. Devolve: Vetor normalizado ou lista vazia quando não há base suficiente.
- `loadSemanticRecommendationItems(db, signals, excludedIds, [limit=8], [maxAgeRating=18])` (exportada; função) - Carrega recomendações por similaridade semântica de embeddings de conteúdo. Entradas: db: Base de dados; signals: Sinais agregados do utilizador; excludedIds: Conteúdos já usados ou já consumidos; [limit=8]: Limite de itens. Devolve: Cartões recomendados.
- `loadCandidateCards(db, match, excludedIds, sort, [limit=8])` (top-level; função) - Carrega cartões publicados com filtro e exclui cartões já vistos. Entradas: db: Base de dados MongoDB; match: Filtro match MongoDB; excludedIds: Ids already used or part of user signals; sort: Ordenação MongoDB; limit: Maximum number of cards. Devolve: Cartões de recomendação.
- `group(id, title, reasonCode, items)` (top-level; função) - Constrói um grupo de recomendações com a explicação MF3. Entradas: id: Id público do grupo; title: Título público do grupo; reasonCode: Internal reason code; items: Cartões de recomendação. Devolve: Grupo público.
- `buildColdStart(db, [initialExcludedIds=new Set()], [maxAgeRating=18])` (top-level; função) - Constrói a resposta cold-start para utilizadores sem sinais suficientes. Combina conteúdos populares, recentes e de catálogo geral, evitando repetir itens já escolhidos noutras secções da mesma resposta. Entradas: db: Base de dados MongoDB; initialExcludedIds: Identificadores que já não devem ser sugeridos nesta resposta. Devolve: Resposta de recomendação.
- `getRecommendationsForUser(userId)` (exportada; função) - Constrói recomendações base para o utilizador autenticado. Entradas: userId: Authenticated user id. Devolve: Resposta de recomendação.

### `real_dev/backend/src/modules/search/search.controller.js`

- `getSearch(req, res)` (exportada; função) - Executa a pesquisa de conteúdos a partir dos parâmetros de query. O controller mantém a camada HTTP simples: recebe filtros da URL e deixa o serviço aplicar paginação, ordenação e critérios de pesquisa. Entradas: req: Pedido Express com filtros em `query`; res: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com resultados de pesquisa.

### `real_dev/backend/src/modules/search/search.service.js`

- `publicSearchItem(content, taxonomyNamesById)` (top-level; função) - Converte um documento de conteúdo num cartão público de pesquisa. Entradas: content: Documento de conteúdo MongoDB; taxonomyNamesById: Nomes de taxonomias indexados por id. Devolve: Item público de resultado de pesquisa.
- `loadTaxonomyNames(db, contents)` (top-level; função) - Carrega nomes de todas as taxonomias usadas pelos conteúdos devolvidos. Entradas: db: Base de dados MongoDB; contents: Content documents. Devolve: Nomes de taxonomias indexados por id.
- `buildSort(sort)` (top-level; função) - Constrói um objeto sort MongoDB a partir da opção pública de ordenação. Entradas: sort: Validated sort option. Devolve: Objeto sort MongoDB.
- `searchContents(queryParams)` (exportada; função) - Executa a pesquisa pública unificada sobre conteúdo publicado e taxonomias. Entradas: queryParams: Query bruta do pedido. Devolve: Resposta da pesquisa.

### `real_dev/backend/src/modules/search/search.validation.js`

- `escapeRegExp(value)` (exportada; função) - Escapes user text before building a regular expression. Entradas: value: Texto bruto de pesquisa. Devolve: Escaped regular expression text.
- `assertSearchQuery(value)` (exportada; função) - Valida o tamanho da query pública de pesquisa. Entradas: value: Parâmetro bruto de query. Devolve: Normalized search query.
- `parsePagination(input)` (exportada; função) - Valida parâmetros públicos de paginação. Entradas: input: Parâmetros brutos de query. Devolve: Opções de paginação seguras.
- `parseSearchFilters(input)` (exportada; função) - Valida filtros e ordenação de pesquisa da MF3. Entradas: input: Parâmetros brutos de query. Devolve: Filtros seguros.

### `real_dev/backend/src/modules/subscriptions/billing-customer-lock.service.js`

- `serializeBillingCustomers(input)` (exportada; função) - Reclama logicamente o estado mutável de billing de utilizadores. Os ids são ordenados para que operações com owner+membro não criem deadlocks. O próprio documento `users` é escrito primeiro, serializando billing/família com bloqueio administrativo e eliminação RGPD. Entradas: input: Contexto transacional. Devolve: Valor documentado como `Promise<void>`.
- `serializeBillingCustomer(input)` (exportada; função) - Atalho para uma única conta. Entradas: input: Contexto. Devolve: Valor documentado como `Promise<void>`.

### `real_dev/backend/src/modules/subscriptions/subscription-access.middleware.js`

- `requireActiveSubscriptionHandler(req, res, next)` (top-level; função) - Bloqueia playback premium sem subscrição ativa. Entradas: req: Pedido Express com `req.user.id`; res: Resposta Express marcada como privada; next: Callback Express. Devolve: Continua ou encaminha erro `403`.

### `real_dev/backend/src/modules/subscriptions/subscriptions.controller.js`

- `getPlans(_req, res)` (exportada; função) - Devolve planos ativos públicos. Entradas: _req: Pedido Express não usado; res: Resposta Express. Devolve: Envia `200` com planos.
- `getMySubscriptionController(req, res)` (exportada; função) - Devolve a subscrição do utilizador autenticado. Entradas: req: Pedido Express com `req.user.id`; res: Resposta Express. Devolve: Envia `200` com estado da subscrição.
- `postCancelRenewal(req, res)` (exportada; função) - Cancela a renovação futura da subscrição do utilizador autenticado. Entradas: req: Pedido Express com `req.user.id`; res: Resposta Express. Devolve: Envia `200` com a subscrição atualizada.
- `getMyFamilyController(req, res)` (exportada; função) - Devolve o estado da partilha familiar do utilizador autenticado. Entradas: req: Pedido Express com `req.user.id`; res: Resposta Express. Devolve: Envia `200` com a familia.
- `postFamilyInvitation(req, res)` (exportada; função) - Cria convite familiar para uma conta existente. Entradas: req: Pedido Express com `req.user.id` e `body.email`; res: Resposta Express. Devolve: Envia `201` com o convite.
- `postAcceptFamilyInvitation(req, res)` (exportada; função) - Aceita convite familiar pendente. Entradas: req: Pedido Express com `params.id`; res: Resposta Express. Devolve: Envia `200` com a familia atualizada.
- `postDeclineFamilyInvitation(req, res)` (exportada; função) - Recusa convite familiar pendente. Entradas: req: Pedido Express com `params.id`; res: Resposta Express. Devolve: Envia `200` com a familia atualizada.
- `deleteFamilyMember(req, res)` (exportada; função) - Remove membro da familia do owner autenticado. Entradas: req: Pedido Express com `params.memberId`; res: Resposta Express. Devolve: Envia `200` com a familia atualizada.
- `postLeaveFamily(req, res)` (exportada; função) - Permite ao membro sair da familia ativa. Entradas: req: Pedido Express com `req.user.id`; res: Resposta Express. Devolve: Envia `200` com a familia atualizada.

### `real_dev/backend/src/modules/subscriptions/subscriptions.service.js`

- `httpError(message, [statusCode=400])` (top-level; função) - Cria erro HTTP simples e seguro. Entradas: message: Mensagem publica; statusCode: Codigo HTTP. Devolve: Erro com `statusCode`.
- `userObjectId(userId)` (top-level; função) - Converte um identificador de utilizador em ObjectId seguro. Entradas: userId: Identificador vindo de `req.user.id`. Devolve: ObjectId usado nas queries MongoDB.
- `billingAnchorForDate(date)` (top-level; função) - Captura a âncora do primeiro ciclo para não perder a convenção de fim do mês. Entradas: date: Início do primeiro ciclo pago. Devolve: Âncora persistível.
- `asObjectId(id, label)` (top-level; função) - Converte ids de URL para ObjectId com erro de dominio. Entradas: id: Id bruto; label: Label para mensagem. Devolve: ObjectId validado.
- `qualityRankForValue(value)` (exportada; função) - Calcula o ranking numerico de uma qualidade de video. Entradas: value: Valor como `1080p`, `2160p` ou `4K`. Devolve: Ranking usado para comparacao.
- `isSupportedQualityValue(value)` (exportada; função) - Confirma que uma qualidade pertence ao vocabulário fechado suportado. O ranking genérico continua disponível para normalizar planos persistidos, mas uma variante de media desconhecida nunca deve herdar acesso apenas por conter algarismos no nome. Entradas: value: Valor de qualidade vindo de uma variante de media. Devolve: Verdadeiro apenas para 480p, 720p, 1080p, 2160p ou 4K.
- `entitlementsForPlan(plan)` (exportada; função) - Resolve entitlements de um plano persistido. Entradas: plan: Plano MongoDB. Devolve: Entitlements normalizados.
- `entitlementsForSubscription(subscription, plan)` (top-level; função) - Entitlements para uma subscricao concreta. Entradas: subscription: Documento de subscricao; plan: Plano associado. Devolve: Entitlements seguros.
- `publicPlan(plan)` (top-level; função) - Remove campos internos de um plano antes de o expor ao frontend. Entradas: plan: Documento MongoDB de `subscription_plans`. Devolve: Plano publico.
- `hasSubscriptionAccess(subscription, [referenceDate=new Date()], [plan=undefined])` (top-level; função) - Calcula se uma subscricao ainda autoriza acesso premium. Entradas: subscription: Documento de subscricao; referenceDate: Data usada para testes e verificacao real. Devolve: Resultado de acesso proprio.
- `publicSubscription(subscription, [plan=undefined], [referenceDate=new Date()])` (top-level; função) - Converte uma subscricao em dados seguros para UI/API. Entradas: subscription: Documento MongoDB de `subscriptions`; plan: Plano associado; referenceDate: Data de referencia. Devolve: Estado publico.
- `publicFamilyUser(user)` (top-level; função) - Converte dados minimos de utilizador para respostas familiares. Entradas: user: Documento `users`. Devolve: Utilizador publico reduzido.
- `publicFamilyMembership(membership, [users={}])` (top-level; função) - Converte uma membership familiar para resposta publica. Entradas: membership: Documento de `subscription_family_memberships`; users: Utilizadores relacionados. Devolve: Membership publica.
- `listOpenFamilyMemberships(db, ownerUserId, [session=undefined])` (top-level; função) - Lista memberships pending/active de um owner. Entradas: db: Ligacao MongoDB; ownerUserId: Owner; [session]: Sessao transacional opcional. Devolve: Linhas ativas operacionais.
- `countOpenFamilyMemberships(db, ownerUserId, [session=undefined])` (top-level; função) - Reconta lugares reservados, incluindo convites pendentes, no snapshot atual. Entradas: db: Ligacao MongoDB; ownerUserId: Owner; [session]: Sessao transacional opcional. Devolve: Numero de memberships que ocupam lugar.
- `findActivePaidSubscription(db, userId, [referenceDate=new Date()], [session=undefined])` (top-level; função) - Verifica se uma subscricao paga ativa existe para o utilizador. Entradas: db: Ligacao MongoDB; userId: Utilizador; referenceDate: Data atual; [session]: Sessao transacional opcional. Devolve: Subscricao paga ativa, se existir.
- `loadOwnSubscription(db, userId, [session=undefined])` (top-level; função) - Carrega a subscricao propria com o respetivo plano. Entradas: db: Ligacao MongoDB; userId: Utilizador; [session]: Sessao transacional opcional. Devolve: Dados proprios.
- `requireShareableFamilyPlan(db, ownerUserId, [referenceDate=new Date()], [session=undefined])` (top-level; função) - Garante que o owner tem plano Familia partilhavel ativo. Entradas: db: Ligacao MongoDB; ownerUserId: Owner; referenceDate: Data atual; [session]: Sessao transacional opcional. Devolve: Estado partilhavel.
- `serializeFamilyOwner(db, ownerUserId, now, [session=undefined])` (top-level; função) - Cria o ponto de contencao por owner usado por convite e aceitacao. Duas transacoes concorrentes escrevem a mesma subscricao. O MongoDB faz uma delas receber `TransientTransactionError`; `runInTransaction` repete toda a unidade, que volta a contar lugares a partir do estado ja confirmado. Entradas: db: Ligacao MongoDB; ownerUserId: Owner da familia; now: Instante da mutacao; [session]: Sessao transacional. Devolve: Estado familiar bloqueado logicamente.
- `isDuplicateFamilyMembership(error)` (top-level; função) - Identifica a violacao do indice parcial unico por membro. Entradas: error: Erro do driver MongoDB ou de um double fiel. Devolve: Verdadeiro para `E11000`.
- `publicMembershipsWithUsers(db, memberships, [session=undefined])` (top-level; função) - Enriquece memberships com documentos de utilizador. Entradas: db: Ligacao MongoDB; memberships: Memberships; [session]: Sessao transacional opcional. Devolve: Memberships publicas.
- `getEffectiveSubscriptionAccess(userId, [referenceDate=new Date()])` (exportada; função) - Resolve acesso efetivo a partir de subscricao propria ou familia. Entradas: userId: Identificador autenticado; referenceDate: Data opcional. Devolve: Estado efetivo de acesso.
- `filterQualityOptionsByEntitlements([options=[]], [entitlements=ENTITLEMENTS.none])` (exportada; função) - Filtra opcoes de qualidade conforme entitlements sem expor URLs bloqueados. Entradas: options: Opcoes vindas do catalogo; entitlements: Entitlements efetivos. Devolve: Opcoes publicas.
- `ensureSubscriptionIndexes()` (exportada; função) - Cria apenas os índices usados por subscrições e família. Entradas: sem entradas explícitas. Devolve: Termina quando indices e seed ficam prontos.
- `ensureDefaultSubscriptionPlans([options={}])` (exportada; função) - Insere planos locais em falta sem reescrever configuração financeira existente. Esta operação é seed explícita; servidor e worker nunca a chamam no arranque. Alterações de preço/moeda/percentagem exigem uma migração própria e auditada. Entradas: [options]: Relógio e IDs opcionais para fixtures determinísticas. Devolve: Termina depois dos inserts idempotentes.
- `listPlans()` (exportada; função) - Lista planos ativos disponíveis para escolha. Entradas: sem entradas explícitas. Devolve: Planos públicos ordenados por tier/preço.
- `disableOwnedFamilyWhenPlanDoesNotShare(db, ownerUserId, now, [session=undefined])` (top-level; função) - Remove memberships quando um utilizador muda para plano sem familia. Entradas: db: Ligacao MongoDB; ownerUserId: Owner; now: Data atual; [session]: Sessao transacional opcional. Devolve: Termina quando memberships ficam inativas.
- `leaveFamilyWhenUserGetsOwnSubscription(db, memberUserId, now, [session=undefined])` (top-level; função) - Um utilizador que compra plano proprio deixa convites/memberships familiares. Entradas: db: Ligacao MongoDB; memberUserId: Membro; now: Data atual; [session]: Sessao transacional opcional. Devolve: Termina quando memberships ficam inativas.
- `activateSubscription(userId, planCode, [options={}])` (exportada; função) - Ativa ou substitui a subscricao paga do utilizador autenticado. Entradas: userId: Identificador do utilizador autenticado; planCode: Código do plano ativo; [options]: Contexto partilhado pelo checkout transacional. Devolve: Subscrição pública atualizada.
- `grantTrialSubscription(userId, endsAt, [options={}])` (exportada; função) - Cria uma subscrição temporária de trial. Entradas: userId: Identificador do utilizador autenticado; endsAt: Data em que o acesso gratuito termina; [options]: Contexto partilhado pelo trial transacional. Devolve: Subscrição pública.
- `buildFamilyOverview(db, userIdObject, [session=undefined])` (top-level; função) - Constrói o estado familiar no contexto de DB/sessão recebido. Entradas: db: Ligacao MongoDB; userIdObject: Identificador do utilizador; [session]: Sessao transacional opcional. Devolve: Overview familiar.
- `getFamilyOverview(userId)` (exportada; função) - Devolve o estado familiar do utilizador autenticado. Entradas: userId: Identificador da sessao. Devolve: Overview familiar.
- `getMySubscription(userId)` (exportada; função) - Devolve a subscricao do utilizador autenticado com acesso efetivo. Entradas: userId: Identificador vindo da sessao segura. Devolve: Estado publico.
- `hasActiveSubscriptionAccess(userId, [referenceDate=new Date()])` (exportada; função) - Verifica se o utilizador pode aceder a conteúdo premium. Entradas: userId: Identificador vindo de `req.user.id`; referenceDate: Data opcional para testes de expiração. Devolve: Resultado usado pelo middleware de playback.
- `inviteFamilyMember(ownerUserId, input)` (exportada; função) - Convida uma conta existente para a familia do owner. Entradas: ownerUserId: Identificador do owner autenticado; input: Payload do frontend. Devolve: Convite e overview.
- `acceptFamilyInvitation(memberUserId, invitationId)` (exportada; função) - Aceita um convite familiar pendente. Entradas: memberUserId: Utilizador autenticado; invitationId: Id do convite. Devolve: Overview familiar atualizado.
- `declineFamilyInvitation(memberUserId, invitationId)` (exportada; função) - Recusa um convite familiar pendente. Entradas: memberUserId: Utilizador autenticado; invitationId: Id do convite. Devolve: Overview familiar atualizado.
- `removeFamilyMember(ownerUserId, memberUserId)` (exportada; função) - Remove um membro da familia do owner. Entradas: ownerUserId: Owner autenticado; memberUserId: Membro alvo. Devolve: Overview familiar atualizado.
- `leaveFamily(memberUserId)` (exportada; função) - Permite ao membro sair da familia ativa. Entradas: memberUserId: Utilizador autenticado. Devolve: Overview familiar atualizado.
- `cancelRenewal(userId)` (exportada; função) - Cancela a renovação futura mantendo acesso até ao fim do ciclo atual. Entradas: userId: Identificador vindo da sessão segura. Devolve: Subscrição atualizada.
- `renewActiveSubscription(userId)` (exportada; função) - Renova uma subscrição ativa quando o pagamento simulado do novo ciclo e aceite. Entradas: userId: Identificador vindo da sessão segura. Devolve: Subscrição com novo ciclo.
- `expireOverdueSubscriptions([referenceDate=new Date()])` (exportada; função) - Processa subscrições vencidas através do mesmo lease usado pelo worker. Entradas: referenceDate: Data usada para decidir vencimento. Devolve: Resumo seguro dos jobs processados.

### `real_dev/backend/src/modules/subscriptions/subscriptions.validation.js`

- `httpError(message, [statusCode=400])` (top-level; função) - Cria um erro HTTP simples para validacoes de subscrição. Entradas: message: Mensagem segura para devolver ao frontend; statusCode: Código HTTP que o middleware de erro deve usar. Devolve: Erro com `statusCode` definido.
- `assertPlanInterval(interval)` (exportada; função) - Confirma que o ciclo do plano e um dos ciclos aceites. Entradas: interval: Valor recebido do plano persistido ou de seed. Devolve: Ciclo normalizado.
- `assertSubscriptionStatus(status)` (exportada; função) - Confirma que o estado de subscrição existe no contrato da MF4. Entradas: estado: Estado recebido de input ou da base de dados. Devolve: Estado normalizado.
- `assertFamilyMembershipStatus(status)` (exportada; função) - Confirma que o estado de uma membership familiar pertence ao contrato MF9. Entradas: status: Estado recebido de input ou persistencia. Devolve: Estado normalizado.
- `addBillingCycle(date, interval, [options={}])` (exportada; função) - Calcula a data final do ciclo de billing. Entradas: date: Data inicial do ciclo; interval: Ciclo validado do plano; [options]: Âncora persistida do primeiro ciclo. Devolve: Data de fim do ciclo seguinte.
- `isBlockingStatus(status)` (exportada; função) - Indica se um estado deve bloquear acesso premium. Entradas: estado: Estado da subscrição. Devolve: `true` quando a reprodução premium deve ser recusada.

### `real_dev/backend/src/modules/system/health.controller.js`

- `disableHealthCaching(res)` (top-level; função) - Impede caches intermédios de reutilizarem um estado operacional antigo. Entradas: res: Resposta Express. Devolve: Sem valor devolvido.
- `getLiveness(_req, res)` (exportada; função) - Devolve liveness sem consultar a sessão ou dependências externas. Entradas: _req: Pedido HTTP não usado; res: Resposta HTTP. Devolve: Resposta 200 enquanto o processo responde.
- `getReadiness(_req, res)` (exportada; função) - Devolve readiness depois de um ping MongoDB com deadline total curto. Entradas: _req: Pedido HTTP não usado; res: Resposta HTTP. Devolve: 200 quando MongoDB responde ou 503 seguro caso contrário.

### `real_dev/backend/src/modules/system/health.service.js`

- `buildHealthStatus(status, database)` (top-level; função) - Cria a parte comum dos payloads de health sem expor configuração interna. Entradas: status: Estado agregado; database: Estado seguro da dependência MongoDB. Devolve: Payload operacional seguro.
- `getLivenessStatus()` (exportada; função) - Confirma apenas que o processo HTTP está vivo. Esta função não consulta MongoDB nem qualquer outra dependência externa, para que um orquestrador nunca reinicie um processo saudável apenas porque a base de dados está temporariamente indisponível. Entradas: sem entradas explícitas. Devolve: Estado de liveness.
- `getReadinessStatus([options={}])` (exportada; função) - Confirma readiness transacional com um deadline externo ao driver MongoDB. O `maxTimeMS` do comando `hello` limita o probe no servidor, mas não limita a obtenção inicial da ligação. O `Promise.race` cobre ambas as etapas e impede que o endpoint ultrapasse indefinidamente o budget operacional. A promessa do ping mantém handlers de sucesso/falha depois do timeout, evitando rejeições tardias não tratadas. Um standalone pode responder a `ping`, mas continua indisponível porque as mutações da aplicação exigem transações multi-documento. Entradas: [options]: Dependências injetáveis para testes locais. `ping` é mantido como alias de compatibilidade nos testes. Devolve: Estado de readiness sem detalhes internos.

### `real_dev/backend/src/modules/system/system.controller.js`

- `getApiInfo(_req, res)` (exportada; função) - Devolve informação técnica básica sobre a API FaithFlix. Entradas: _req: Pedido HTTP não usado; res: Resposta HTTP usada para devolver os metadados da API. Devolve: Resposta JSON com metadados do serviço.

### `real_dev/backend/src/modules/users/admin-invariant.service.js`

- `isActiveAdmin(user)` (exportada; função) - Indica se uma conta pertence ao conjunto de administradores operacionais. Entradas: user: Utilizador. Devolve: Estado do invariante.
- `assertAnotherActiveAdminRemains(input)` (exportada; função) - Serializa remoções de admins e recusa a transição de um para zero. Entradas: input: Contexto. Devolve: Valor documentado como `Promise<void>`.

### `real_dev/backend/src/modules/users/user.controller.js`

- `getMe(req, res)` (exportada; função) - Devolve o perfil do utilizador autenticado. Entradas: req: Pedido atual; res: Resposta HTTP. Devolve: Resposta com perfil.
- `patchMe(req, res)` (exportada; função) - Atualiza campos editáveis do perfil do utilizador autenticado. Entradas: req: Pedido atual; res: Resposta HTTP. Devolve: Resposta com perfil atualizado.
- `patchMyParentalSettings(req, res)` (exportada; função) - Atualiza definições parentais do utilizador autenticado. Entradas: req: Pedido atual; res: Resposta HTTP. Devolve: Resposta com perfil atualizado.
- `getUsers(req, res)` (exportada; função) - Lista utilizadores para administradores. Entradas: req: Pedido atual; res: Resposta HTTP. Devolve: Resposta com lista de utilizadores.
- `patchUserRole(req, res)` (exportada; função) - Atualiza a role de um utilizador para administradores. Entradas: req: Pedido atual com id do utilizador alvo; res: Resposta HTTP. Devolve: Resposta com utilizador atualizado.
- `patchUserAdmin(req, res)` (exportada; função) - Atualiza role e/ou estado operacional por administradores. Entradas: req: Pedido atual; res: Resposta HTTP. Devolve: Resposta com utilizador atualizado.

### `real_dev/backend/src/modules/users/user.service.js`

- `toPublicUser(user)` (top-level; função) - Converte um documento interno de utilizador para o formato público de perfil. Entradas: user: MongoDB user document. Devolve: Perfil público do utilizador.
- `asUserObjectId(userId)` (top-level; função) - Converte um id de utilizador num ObjectId MongoDB. Entradas: userId: Id do utilizador vindo de parâmetros ou da sessão. Devolve: ObjectId MongoDB.
- `removesActiveAdmin(before, update)` (top-level; função) - Determina se a alteracao retira uma conta do conjunto de admins ativos. Entradas: before: Estado persistido; update: Alteracao validada. Devolve: Verdadeiro quando a garantia do ultimo admin deve ser verificada.
- `buildAdminUserQuery([filters={}])` (exportada; função) - Constroi filtros seguros para a listagem administrativa. Entradas: filters: Filtros recebidos. Devolve: Query MongoDB.
- `getMyProfile(userId)` (exportada; função) - Gets the authenticated user's profile. Entradas: userId: Authenticated user id. Devolve: Perfil público.
- `updateMyProfile(userId, input)` (exportada; função) - Atualiza apenas campos de perfil em autosserviço. Entradas: userId: Authenticated user id; input: Profile dados. Devolve: Perfil público atualizado.
- `updateParentalSettings(userId, input)` (exportada; função) - Atualiza o limite parental do utilizador autenticado. Entradas: userId: Authenticated user id; input: Parental dados. Devolve: Perfil público atualizado.
- `listUsers([filters={}])` (exportada; função) - Lista utilizadores para administradores sem campos internos de autenticacao. Entradas: [filters={}]: Filtros admin. Devolve: Pagina publica de utilizadores.
- `updateUserRole(actorUserId, targetUserId, input, [context={}])` (exportada; função) - Mantem a rota legacy de role ligada ao fluxo auditado da MF5. Entradas: actorUserId: Id do admin autenticado; targetUserId: Target user id; input: Role dados; [context]: Metadados seguros do pedido HTTP. Devolve: Utilizador público atualizado.
- `updateUserByAdmin(actorUserId, targetUserId, input, [context={}])` (exportada; função) - Atualiza role/estado de uma conta com protecoes administrativas. Entradas: actorUserId: Id do admin autenticado; targetUserId: Id do utilizador alvo; input: Dados recebidos; [context]: Metadados seguros do pedido HTTP. Devolve: Utilizador atualizado.

### `real_dev/backend/src/modules/users/user.validation.js`

- `assertProfileUpdate(input)` (exportada; função) - Valida atualizações de perfil em autosserviço. Entradas: input: Profile update dados. Devolve: Dados seguros de atualização.
- `assertRoleUpdate(input)` (exportada; função) - Valida atualização administrativa de role. Entradas: input: Role update dados. Devolve: Atualização segura de role.
- `escapeRegexLiteral(value)` (top-level; função) - Escapa caracteres especiais para usar pesquisa `$regex` como literal. Entradas: value: Texto normalizado. Devolve: Texto seguro para pesquisa.
- `assertAdminUserUpdate([input={}])` (exportada; função) - Valida alteracao administrativa de role e estado operacional. Entradas: input: Dados recebidos. Devolve: Atualizacao segura.
- `assertAdminUserFilters([filters={}])` (exportada; função) - Valida filtros da listagem administrativa. Entradas: filters: Query string recebida. Devolve: Filtros normalizados.
- `parseAdminUserPagination([query={}])` (exportada; função) - Valida a pagina da listagem administrativa de utilizadores. Entradas: query: Query string recebida. Devolve: Pagina administrativa segura.
- `assertParentalSettings(input)` (exportada; função) - Valida o limite parental do utilizador autenticado. Entradas: input: Parental settings dados. Devolve: Atualização parental segura.

### `real_dev/backend/src/runtime/graceful-shutdown.js`

- `waitWithin(promise, timeoutMs)` (top-level; função) - Aguarda uma Promise durante um intervalo limitado. Entradas: promise: Operação a aguardar; timeoutMs: Limite em milissegundos. Devolve: Resultado ou marcador de timeout.
- `boundedMilliseconds(value, fallback)` (top-level; função) - Normaliza um budget interno sem permitir esperas ilimitadas. Entradas: value: Valor configurado pelo chamador; fallback: Valor por defeito. Devolve: Inteiro entre 1 ms e 60 s.
- `closeHttpServer(server, [options={}])` (exportada; função) - Para o servidor HTTP e aguarda pedidos ativos dentro do budget definido. Entradas: server: Servidor HTTP já criado; [options]: Opções do fecho. Devolve: Resultado sanitizado.
- `createGracefulShutdown(dependencies)` (exportada; função) - Cria um shutdown HTTP/Mongo idempotente e ordenado. A base é fechada uma única vez mesmo quando o fecho HTTP falha. O erro devolvido é genérico; causas internas não são incluídas em logs pelo helper. Entradas: dependencies: Dependências explícitas. Devolve: Função idempotente de shutdown.
- `installSignalHandlers(options)` (exportada; função) - Regista handlers com labels explícitas e devolve cleanup idempotente. Entradas: options: Opções dos handlers. Devolve: Função que remove todos os listeners instalados.

### `real_dev/backend/src/utils/async-handler.js`

- `asyncHandler(handler)` (exportada; função) - Envolve um controlador Express assíncrono e encaminha promises rejeitadas para o middleware de erro. Entradas: controlador: Gestor assíncrono de rota. Devolve: Gestor Express com encaminhamento centralizado de erros.

### `real_dev/backend/src/utils/cookies.js`

- `parseCookies([cookieHeader=""])` (exportada; função) - Interpreta um cabeçalho HTTP Cookie para um objeto simples. Entradas: [cookieCabeçalho=""]: Cabeçalho `Cookie` bruto recebido pelo Express. Devolve: Nomes dos cookies e valores descodificados.
- `readCookie(req, name)` (exportada; função) - Lê um valor de cookie de um pedido Express. Entradas: req: Pedido HTTP atual; name: Cookie name to read. Devolve: Valor do cookie quando existe.
- `clearSessionCookie(res)` (exportada; função) - Limpa o cookie de sessão configurado na resposta HTTP. Entradas: res: Resposta HTTP onde o cookie expirado é escrito. Devolve: Sem valor devolvido.

### `real_dev/backend/src/utils/http-error.js`

- `notFound(path)` (exportada; função) - Cria o erro 404 padrão para rotas API desconhecidas. Entradas: path: Original URL requested by the client. Devolve: Erro padronizado de recurso não encontrado.

### `real_dev/backend/src/utils/logger.js`

- `shouldRedact(key)` (top-level; função) - Verifica se uma chave de contexto deve ser ocultada antes do logging. Entradas: key: Object key being inspected. Devolve: Verdadeiro quando a chave pode conter informação sensível.
- `redact(value)` (top-level; função) - Recursively redacts sensitive fields from log context. Entradas: value: Context value that may contain sensitive information. Devolve: Cópia ocultada segura para serializar em logs.
- `writeLog(level, message, [context={}])` (top-level; função) - Escreve uma linha JSON estruturada no stream correto da consola. Entradas: level: Severity level for the log entry; message: Short machine-readable event name; [context={}]: Additional structured context. Devolve: Sem valor devolvido.
- `info(message, context)` (top-level; método de objeto) - Writes an informational log entry. Entradas: message: Short machine-readable event name; [context]: Additional structured context. Devolve: Sem valor devolvido.
- `warn(message, context)` (top-level; método de objeto) - Writes a warning log entry. Entradas: message: Short machine-readable event name; [context]: Additional structured context. Devolve: Sem valor devolvido.
- `error(message, context)` (top-level; método de objeto) - Writes an error log entry. Entradas: message: Short machine-readable event name; [context]: Additional structured context. Devolve: Sem valor devolvido.

### `real_dev/backend/src/utils/pagination.js`

- `positiveQueryInteger(value, fallback, field)` (top-level; função) - Converte um inteiro de query string sem aceitar coercoes ambiguas. Entradas: value: Valor recebido do cliente; fallback: Valor usado apenas quando o campo nao foi enviado; field: Nome publico do campo. Devolve: Inteiro positivo validado.
- `parsePagination([input={}], [options={}])` (exportada; função) - Valida `page` e `limit` para uma listagem paginada. Entradas: input: Query recebida; [options]: Limites da rota. Devolve: Pagina e limite seguros.
- `paginationMetadata({...})` (exportada; função) - Constroi metadados consistentes para uma pagina ja consultada. Entradas: input: Valores da pagina. Devolve: Metadados publicos.

### `real_dev/backend/src/worker.js`

- `workerPollMs(value)` (exportada; função) - Lê o intervalo do worker com limites que evitam busy loops e pausas ocultas. Entradas: value: Valor opcional `WORKER_POLL_MS`. Devolve: Intervalo seguro.
- `waitForNextCycle(milliseconds, signal)` (exportada; função) - Cria uma espera cancelável sem acumular listeners entre ciclos. Entradas: milliseconds: Duração; signal: Sinal de shutdown. Devolve: Resolve no timeout ou cancelamento.
- `prepareWorker()` (top-level; função) - Prepara os invariantes e índices necessários antes do primeiro ciclo. Entradas: sem entradas explícitas. Devolve: Valor documentado como `Promise<void>`.
- `runWorker([options={}])` (exportada; função) - Arranca o loop do worker e devolve apenas depois de shutdown limpo. As dependências opcionais existem exclusivamente para testes unitários isolados; o entry point usa sempre os serviços reais declarados acima. Entradas: [options]: Dependências testáveis. Devolve: Valor documentado como `Promise<void>`.
- `isMainModule()` (top-level; função) - Evita arrancar o worker quando o módulo é importado por testes. Entradas: sem entradas explícitas. Devolve: Verdadeiro apenas para `node src/worker.js`.

## Frontend

### `real_dev/frontend/src/App.jsx`

- `App()` (exportada; função) - Componente React raiz do frontend FaithFlix. Entradas: sem entradas explícitas. Devolve: Rotas da aplicação envolvidas pelo router configurado.

### `real_dev/frontend/src/components/a11y/SkipLink.jsx`

- `SkipLink({...})` (exportada; função) - Renderiza um link que fica visível quando recebe foco. Entradas: props: Propriedades do componente; [props.targetId="conteudo-principal"]: Identificador do elemento principal. Devolve: Link de salto para o conteúdo principal.
- `handleClick(event)` (top-level; função) - Garante que o destino recebe foco real depois do salto, incluindo browsers que apenas deslocam a página quando a âncora aponta para um elemento focável. Entradas: event: Evento de ativação do link. Devolve: Sem valor devolvido.

### `real_dev/frontend/src/components/account/AccountSubscriptionPanel.jsx`

- `formatSubscriptionDate(value)` (top-level; função) - Formata uma data ISO apenas quando a API devolve um instante válido. Entradas: value: Data recebida da API. Devolve: Data longa em PT-PT ou texto vazio.
- `formatQuality(value)` (top-level; função) - Traduz a qualidade técnica para uma designação curta de produto. Entradas: value: Qualidade máxima do entitlement. Devolve: Qualidade apresentada na conta.
- `AccountSubscriptionPanel({...})` (exportada; função) - Apresenta plano atual, benefícios essenciais e ações de gestão já suportadas. A mudança de plano reutiliza o checkout existente; o cancelamento afeta apenas a renovação e preserva o acesso até ao fim do ciclo. Entradas: props: Estado e ações da subscrição. Devolve: Painel de gestão da subscrição.

### `real_dev/frontend/src/components/admin/AdminNavigation.jsx`

- `AdminNavigation({...})` (exportada; função) - Função documentada na implementação atual. Entradas: props: Callback usado pelo drawer móvel. Devolve: Grupos administrativos permitidos.

### `real_dev/frontend/src/components/admin/ConfirmDialog.jsx`

- `ConfirmDialog({...})` (exportada; função) - Mantém Escape, foco inicial em Cancelar e restituição de foco sem dependências. Entradas: props: Propriedades do diálogo. Devolve: Confirmação modal acessível.

### `real_dev/frontend/src/components/admin/catalog/AssetPreviewField.jsx`

- `AssetPreviewField({...})` (exportada; função) - Função documentada na implementação atual. Entradas: props: Propriedades do campo. Devolve: Campo controlado e respetivo preview.

### `real_dev/frontend/src/components/admin/catalog/CatalogEditorForm.jsx`

- `CreditNames({...})` (top-level; função) - Editor compacto para listas simples de créditos. Entradas: props: Propriedades do grupo. Devolve: Grupo repetível de nomes.
- `CatalogEditorForm({...})` (exportada; função) - Função documentada na implementação atual. Entradas: props: Propriedades editoriais. Devolve: Campos editoriais agrupados.

### `real_dev/frontend/src/components/admin/catalog/CatalogMediaPanel.jsx`

- `sizeLabel(value)` (top-level; função) - Função documentada na implementação atual. Entradas: value: Tamanho em bytes. Devolve: Valor legível.
- `validateFile(file)` (top-level; função) - Função documentada na implementação atual. Entradas: file: Ficheiro local. Devolve: Erro local ou vazio.
- `CatalogMediaPanel({...})` (exportada; função) - Função documentada na implementação atual. Entradas: props: Propriedades do painel. Devolve: Fluxo de upload, ativação e descarte.

### `real_dev/frontend/src/components/admin/catalog/CatalogRevisionPanel.jsx`

- `CatalogRevisionPanel({...})` (exportada; função) - Função documentada na implementação atual. Entradas: props: Propriedades do painel. Devolve: Lista paginada inicial de revisões.

### `real_dev/frontend/src/components/admin/catalog/CatalogTaxonomyPicker.jsx`

- `CatalogTaxonomyPicker({...})` (exportada; função) - Função documentada na implementação atual. Entradas: props: Propriedades do seletor. Devolve: Classificação editorial acessível.

### `real_dev/frontend/src/components/admin/catalog/StickyFormActions.jsx`

- `StickyFormActions({...})` (exportada; função) - Função documentada na implementação atual. Entradas: props: Propriedades das ações. Devolve: Barra de ações do formulário.

### `real_dev/frontend/src/components/admin/useAdminConfirmation.jsx`

- `useAdminConfirmation()` (exportada; função) - Permite migrar handlers assíncronos sem voltar a usar `window.confirm`. Entradas: sem entradas explícitas. Devolve: API do diálogo.

### `real_dev/frontend/src/components/auth/AdminRoute.jsx`

- `AdminRoute({...})` (exportada; função) - Impede que visitantes e utilizadores sem role permitida vejam conteúdo administrativo. Entradas: props: Propriedades do componente; props.children: Página administrativa protegida visualmente; [props.allowedRoles=["admin"]: ] Roles aceites pela rota visual. Devolve: Página protegida, redirecionamento ou aviso de permissão.

### `real_dev/frontend/src/components/auth/AnonymousRoute.jsx`

- `AnonymousRoute({...})` (exportada; função) - Evita apresentar login/registo/reset a uma sessão já autenticada. O estado `unavailable` não é tratado como anónimo: um cookie pode continuar válido e os endpoints públicos não usam CSRF autenticado. Entradas: props: Propriedades da guarda; props.children: Página pública de autenticação. Devolve: Página, redirect ou estado operacional.

### `real_dev/frontend/src/components/auth/AuthForms.jsx`

- `AuthForms({...})` (exportada; função) - Authentication forms for login, register and password recovery. Entradas: props: Propriedades do formulário; [props.redirectTo=null]: Destino interno depois de autenticar. Devolve: Painel de autenticação ligado aos serviços de identidade.
- `updateField(event)` (top-level; função) - Atualiza o campo editado no formulário de autenticação. Entradas: event: Evento emitido pelo input. Devolve: Atualiza o estado controlado do formulário.
- `changeMode(nextMode)` (top-level; função) - Troca o fluxo visível e elimina os valores que não devem atravessar modos. Email e nome permanecem para reduzir repetição; password e token são sempre descartados quando o utilizador abandona o passo atual. Entradas: nextMode: Próximo fluxo. Devolve: Sem valor devolvido.
- `completePasswordReset()` (top-level; função) - Regressa ao login depois de um reset confirmado pelo backend. Entradas: sem entradas explícitas. Devolve: Sem valor devolvido.
- `submit(event)` (top-level; função) - Submete o fluxo ativo, impedindo concorrência e cancelando-o no unmount. Entradas: event: Evento de submissão. Devolve: Termina depois de atualizar sessão ou feedback.

### `real_dev/frontend/src/components/auth/AuthenticatedRoute.jsx`

- `AuthenticatedRoute({...})` (exportada; função) - Protege uma página autenticada no frontend e preserva o destino original. Entradas: props: Propriedades do componente; props.children: Página a apresentar depois de confirmar sessão. Devolve: Página protegida, estado de carregamento ou redirecionamento.

### `real_dev/frontend/src/components/catalog/CatalogPosterCard.jsx`

- `CatalogPosterCard({...})` (exportada; função) - Apresenta um cartaz integralmente clicável, com metadados curtos e uma ação visual que também fica disponível através do foco por teclado. Entradas: props: Propriedades públicas do card; props.title: Título público do conteúdo; [props.eyebrow]: Tipo de conteúdo apresentado sobre o cartaz; [props.imageUrl]: URL pública do cartaz; [props.imageAlt]: Alternativa textual da imagem; [props.meta]: Linha curta de metadados; [props.description]: Descrição curta opcional para contextos de pesquisa; props.to: Rota interna do detalhe. Devolve: Card de catálogo acessível.

### `real_dev/frontend/src/components/catalog/ContentDetailHero.jsx`

- `prefersDataSaving()` (top-level; função) - Lê a preferência de dados reduzidos quando o browser a disponibiliza. Entradas: sem entradas explícitas. Devolve: Verdadeiro quando o utilizador pediu poupança de dados.
- `ContentDetailHero({...})` (exportada; função) - Hero full-bleed com preview promocional e fallback para imagem editorial. Entradas: props: Propriedades do hero. Devolve: Cabeçalho cinematográfico.
- `togglePaused()` (top-level; função) - Função documentada na implementação atual. Entradas: sem entradas explícitas. Devolve: Alterna pausa explícita do preview.
- `toggleMuted()` (top-level; função) - Função documentada na implementação atual. Entradas: sem entradas explícitas. Devolve: Alterna som apenas por ação explícita.

### `real_dev/frontend/src/components/charities/PublicCharityCard.jsx`

- `charityMonogram(name)` (exportada; função) - Produz um monograma curto a partir das primeiras palavras significativas. Entradas: name: Nome público da associação. Devolve: Uma ou duas letras, com fallback neutro.
- `safeCharityWebsite(value)` (exportada; função) - Aceita apenas destinos web explícitos e seguros para um link externo. Entradas: value: URL recebida da API. Devolve: URL HTTP(S) ou string vazia.
- `PublicCharityCard({...})` (exportada; função) - Apresenta uma associação sem reutilizar a linguagem visual dos conteúdos. Entradas: props: Propriedades do card; props.charity: Associação pública; [props.historyTo]: Histórico visível apenas para administradores. Devolve: Card editorial acessível.

### `real_dev/frontend/src/components/comments/CommentsPanel.jsx`

- `CommentsPanel({...})` (exportada; função) - Lista comentários visíveis e permite a utilizadores autenticados adicionar comentários curtos. Entradas: props: Propriedades do componente; props.contentId: Id do conteúdo publicado atual. Devolve: Painel de comentários.
- `isCurrentRequest(contextVersion, controller)` (top-level; função) - Confirma que um resultado ainda pertence ao conteúdo e sessão atuais. Entradas: contextVersion: Versão capturada antes do pedido; controller: Controller associado ao pedido. Devolve: `true` apenas enquanto o resultado pode atualizar a UI.
- `isCurrentQueue(queue)` (top-level; função) - Confirma que a fila serial ainda pertence ao contexto visível. Entradas: queue: Fila capturada pela mutação. Devolve: `true` quando a fila ainda é a fila ativa.
- `loadComments({...})` (top-level; função) - Carrega comentários visíveis de forma cancelável e autoritativa. Entradas: input: Contexto imutável do pedido. Devolve: Indica se a lista devolvida foi aplicada.
- `enqueueMutation(key, operation)` (top-level; função) - Enfileira uma mutação sem sobrepor escritas no mesmo painel. As chaves pendentes permitem mostrar busy state só no formulário ou linha afetados. Cada escrita e o respetivo reload terminam antes da seguinte. Entradas: key: Chave estável da ação ou linha; operation: Escrita que devolve a mensagem de sucesso. Devolve: Promessa da posição desta operação na fila.
- `submitComment(event)` (top-level; função) - Submete um novo comentário para o conteúdo atual. Entradas: event: Evento de submissão do formulário. Devolve: Termina depois de publicar ou apresentar erro.
- `removeComment(commentId)` (top-level; função) - Remove um comentário visível no painel. Entradas: commentId: Identificador do comentário a remover. Devolve: Termina depois de remover ou apresentar erro.

### `real_dev/frontend/src/components/discovery/DiscoveryCarousel.jsx`

- `DiscoveryCarousel({...})` (exportada; função) - Mostra um grupo horizontal de descoberta. Entradas: props: Carousel props. Devolve: Carrossel de descoberta.

### `real_dev/frontend/src/components/discovery/RelatedContent.jsx`

- `formatDuration(seconds)` (top-level; função) - Função documentada na implementação atual. Entradas: seconds: Duração em segundos. Devolve: Duração curta.
- `RelatedContent({...})` (exportada; função) - Mostra conteúdo publicado relacionado para a página de detalhe atual. Entradas: props: Propriedades do componente; props.contentId: Id do conteúdo atual. Devolve: Painel de conteúdo relacionado.

### `real_dev/frontend/src/components/errors/ErrorBoundary.jsx`

- `getDerivedStateFromError()` (pública; método de classe) - Ativa o fallback seguro quando um descendente falha ao renderizar. Entradas: sem entradas explícitas. Devolve: Estado de erro sem conservar a exceção.
- `componentDidUpdate(previousProps)` (pública; método de classe) - Limpa uma falha anterior quando o router muda de entrada. Entradas: previousProps: Propriedades anteriores. Devolve: Sem valor devolvido.
- `componentDidCatch(error, errorInfo)` (pública; método de classe) - Entrega a exceção apenas a um observador explícito, sem a apresentar. Uma falha do observador não pode derrubar o próprio fallback. Entradas: error: Erro capturado pelo React; errorInfo: Contexto de componentes do React. Devolve: Sem valor devolvido.
- `render()` (pública; método de classe) - Função documentada na implementação atual. Entradas: sem entradas explícitas. Devolve: Conteúdo normal ou fallback seguro.

### `real_dev/frontend/src/components/layout/AppFooter.jsx`

- `AppFooter()` (exportada; função) - Rodapé partilhado com identificação exclusivamente editorial da marca. Entradas: sem entradas explícitas. Devolve: Rodapé público da aplicação.

### `real_dev/frontend/src/components/layout/AppHeader.jsx`

- `navClassName({...})` (top-level; função) - Função documentada na implementação atual. Entradas: state: Estado do NavLink. Devolve: Sem valor devolvido documentado.
- `AppHeader()` (exportada; função) - A navegação pública nunca volta a receber links funcionais do backoffice. Sessões staff obtêm apenas uma ação explícita de regresso à administração. Entradas: sem entradas explícitas. Devolve: Cabeçalho público responsivo.

### `real_dev/frontend/src/components/layout/SessionActionButton.jsx`

- `SessionActionButton({...})` (exportada; função) - Termina a sessão com estado busy, erro acessível e destino explícito. Entradas: props: Propriedades visuais. Devolve: Ação de sessão autónoma.

### `real_dev/frontend/src/components/library/LibraryActions.jsx`

- `hasCurrentContent(response, contentId)` (top-level; função) - Verifica se a resposta de biblioteca contém o conteúdo atual. Entradas: response: Resposta da API; contentId: Identificador do conteúdo atual. Devolve: `true` quando o conteúdo está presente na lista.
- `listContainsContent(listPage, contentId, signal)` (top-level; função) - Percorre apenas as páginas declaradas pelo backend até encontrar o conteúdo. A listagem deixou de ser ilimitada na Fase 5; esta pesquisa preserva o estado correto do botão mesmo quando o título não está na primeira página. Entradas: listPage: Função paginada de favoritos ou lista futura; contentId: Conteúdo a procurar; signal: Sinal partilhado por todas as páginas. Devolve: `true` quando alguma página contém o conteúdo.
- `LibraryActions({...})` (exportada; função) - Ações de favoritos e lista para ver mais tarde na página de detalhe. Entradas: props: Propriedades do componente; props.contentId: Identificador do conteúdo atual; [props.variant="default"]: Apresentação visual sem alterar comportamento. Devolve: Ações de biblioteca.
- `trackedController()` (top-level; função) - Cria um pedido cancelável acompanhado pelo ciclo de vida do componente. Entradas: sem entradas explícitas. Devolve: Controlador registado até o pedido terminar.
- `startAction(action)` (top-level; função) - Reserva uma ação antes do próximo render, impedindo duplo clique. Entradas: action: Ação a reservar. Devolve: `true` quando a ação ficou reservada.
- `finishAction(action)` (top-level; função) - Liberta o estado ocupado de uma ação ainda montada. Entradas: action: Ação a libertar. Devolve: Sem valor devolvido.
- `toggleFavorite()` (top-level; função) - Alterna o favorito de forma otimista e reverte em falha. Entradas: sem entradas explícitas. Devolve: Termina depois da API ou da reversão segura.
- `toggleWatchlist()` (top-level; função) - Alterna a lista para ver mais tarde de forma otimista e reversível. Entradas: sem entradas explícitas. Devolve: Termina depois da API ou da reversão segura.

### `real_dev/frontend/src/components/playback/ContinueWatchingStrip.jsx`

- `progressPercent(item)` (top-level; função) - Calcula uma percentagem finita e limitada ao intervalo do elemento progress. Entradas: item: Item de progresso. Devolve: Percentagem inteira entre 0 e 100.
- `ContinueWatchingStrip()` (exportada; função) - Mostra os primeiros conteúdos inacabados da sessão autenticada. Entradas: sem entradas explícitas. Devolve: Faixa, estado de carregamento/erro ou null.

### `real_dev/frontend/src/components/playback/mediaAdapter.js`

- `importHls()` (top-level; função) - Função documentada na implementação atual. Entradas: sem entradas explícitas. Devolve: Chunk HLS carregado apenas quando necessário.
- `importDash()` (top-level; função) - Função documentada na implementação atual. Entradas: sem entradas explícitas. Devolve: Chunk DASH carregado apenas quando necessário.
- `clearVideoSource(video)` (top-level; função) - Remove a fonte direta sem conservar pedidos/adapters anteriores. Entradas: video: Elemento alvo. Devolve: Sem valor devolvido.
- `assertSource(source)` (top-level; função) - Valida o DTO fechado recebido do backend. Entradas: source: Fonte candidata. Devolve: Fonte normalizada.
- `absoluteMediaUrl(url)` (top-level; função) - Resolve URLs relativas para adapters que constroem telemetria com `URL`. Entradas: url: URL autorizada pelo backend. Devolve: URL absoluta quando existe base de documento.
- `mediaRequestUrl(url)` (top-level; função) - Mantém fixtures relativas, mas envia media protegida para a origem da API. Entradas: url: URL autorizada pelo backend. Devolve: URL apropriada para o pedido do browser.
- `attachMediaSource(video, source, [options={}])` (exportada; função) - Liga uma única fonte canónica ao vídeo e devolve destruição idempotente. Entradas: video: Elemento de vídeo; source: DTO `{url, protocol, mimeType}`; [options]: Dependências/cancelamento. Devolve: Adapter ativo.

### `real_dev/frontend/src/components/playback/progressQueue.js`

- `createProgressQueue(saveProgress, [options={}])` (exportada; função) - Cria uma fila que nunca executa duas escritas em paralelo. Valores recebidos antes do próximo drain são coalescidos para a posição mais recente. O marcador confirmado só avança depois do sucesso do backend. Entradas: saveProgress: Escrita real; [options]: Última posição já confirmada pelo backend. Devolve: Fila.
- `positionValue(value)` (top-level; função) - Função documentada na implementação atual. Entradas: value: Posição candidata. Devolve: Posição segura.
- `drain()` (top-level; função) - Função documentada na implementação atual. Entradas: sem entradas explícitas. Devolve: Consome todos os lotes pendentes.
- `scheduleDrain()` (top-level; função) - Função documentada na implementação atual. Entradas: sem entradas explícitas. Devolve: Agenda drain para permitir coalescing no mesmo tick.
- `enqueueInternal(position)` (top-level; função) - Função documentada na implementação atual. Entradas: position: Posição. Devolve: Confirmação.

### `real_dev/frontend/src/components/privacy/PrivacyConsentsPanel.jsx`

- `PrivacyConsentsPanel()` (exportada; função) - Renderiza opções de consentimento persistidas no backend. Entradas: sem entradas explícitas. Devolve: Painel de consentimentos.
- `toggleConsent(key)` (top-level; função) - Alterna uma categoria localmente antes de guardar. Entradas: key: Categoria. Devolve: Sem valor devolvido.
- `handleSubmit(event)` (top-level; função) - Guarda escolhas no backend autenticado. Entradas: event: Evento do formulario. Devolve: Termina quando o pedido foi tratado.

### `real_dev/frontend/src/components/privacy/PrivacyDangerZone.jsx`

- `PrivacyDangerZone()` (exportada; função) - Renderiza o fluxo destrutivo de eliminação de conta. Entradas: sem entradas explícitas. Devolve: Painel de eliminacao.
- `handleSubmit(event)` (top-level; função) - Envia o pedido de eliminação ao backend. Entradas: event: Evento do formulario. Devolve: Termina quando o pedido foi tratado.

### `real_dev/frontend/src/components/privacy/PrivacyExportPanel.jsx`

- `downloadJson(data)` (top-level; função) - Cria e descarrega um ficheiro JSON no browser. Entradas: data: Dados a escrever. Devolve: Sem valor devolvido.
- `PrivacyExportPanel()` (exportada; função) - Renderiza o fluxo de exportação RGPD. Entradas: sem entradas explícitas. Devolve: Painel de exportacao.
- `handleExport()` (top-level; função) - Pede a exportação ao backend e descarrega o JSON localmente. Entradas: sem entradas explícitas. Devolve: Termina quando o pedido foi tratado.

### `real_dev/frontend/src/components/ratings/RatingBox.jsx`

- `RatingBox({...})` (exportada; função) - Mostra classificação agregada e permite ao utilizador autenticado guardar a sua classificação. Entradas: props: Propriedades do componente; props.contentId: Id do conteúdo publicado atual. Devolve: Controlo de classificação.
- `isCurrentRequest(contextVersion, controller)` (top-level; função) - Confirma que um resultado ainda pertence ao conteúdo e sessão atuais. Entradas: contextVersion: Versão capturada antes do pedido; controller: Controller associado ao pedido. Devolve: `true` apenas enquanto o resultado pode atualizar a UI.
- `loadRatingState({...})` (top-level; função) - Carrega, de forma cancelável, o resumo e a avaliação pessoal autoritativos. Entradas: input: Contexto imutável do pedido. Devolve: Indica se o estado autoritativo foi aplicado.
- `mutateRating(operation)` (top-level; função) - Executa uma escrita exclusiva e confirma o resultado com nova leitura. Entradas: operation: Operação pedida. Devolve: Termina depois da confirmação autoritativa.
- `saveRating(value)` (top-level; função) - Guarda uma nova avaliação escolhida pelo utilizador. Entradas: value: Valor selecionado na escala de classificação. Devolve: Termina depois de guardar ou apresentar erro.
- `removeRating()` (top-level; função) - Remove a avaliação pessoal do utilizador. Entradas: sem entradas explícitas. Devolve: Termina depois de remover ou apresentar erro.

### `real_dev/frontend/src/components/search/SearchFilters.jsx`

- `SearchFilters({...})` (exportada; função) - Mostra a pesquisa principal e os filtros secundários controlados pela página. Em mobile, os filtros ficam recolhidos para preservar a prioridade da query; em desktop, o CSS mantém o painel sempre exposto. Entradas: props: Propriedades do formulário. Devolve: Formulário acessível de pesquisa.
- `updateField(field, value)` (top-level; função) - Propaga uma alteração sem mutar o estado recebido do componente pai. Entradas: field: Nome do filtro; value: Novo valor. Devolve: Sem valor devolvido.
- `handleSubmit(event)` (top-level; função) - Fecha os filtros mobile depois de confirmar a pesquisa. Entradas: event: Submissão do formulário. Devolve: Sem valor devolvido.

### `real_dev/frontend/src/components/subscriptions/FamilyManagementPanel.jsx`

- `familyUserLabel(user)` (exportada; função) - Mostra o nome seguro de um utilizador familiar. Entradas: user: Utilizador reduzido. Devolve: Nome ou email.
- `FamilyManagementPanel({...})` (exportada; função) - Mantém as operações familiares numa área privada distinta da comparação. Entradas: sem entradas explícitas. Devolve: Painel familiar do owner, convite ou membro.

### `real_dev/frontend/src/components/subscriptions/SubscriptionPlanCard.jsx`

- `formatPlanPrice(cents, [currency="EUR"])` (exportada; função) - Formata cêntimos na moeda pública do plano. Entradas: cents: Valor em cêntimos; currency: Código ISO da moeda. Devolve: Preço localizado em português de Portugal.
- `compactPlanName(name)` (exportada; função) - Remove apenas o sufixo comercial correspondente ao ciclo de faturação. Entradas: name: Nome público do plano. Devolve: Nome sem duplicar Mensal/Anual no card.
- `qualityLabel(quality)` (top-level; função) - Converte a qualidade técnica numa designação editorial curta. Entradas: quality: Qualidade devolvida pela API. Devolve: Qualidade legível.
- `SubscriptionPlanCard({...})` (exportada; função) - Apresenta um plano e a ação segura adequada ao estado da sessão. Entradas: props: Propriedades do card; props.plan: Plano do período selecionado; props.monthlyPlan: Plano mensal do mesmo tier; props.sessionStatus: Estado autoritativo da sessão; props.loginPath: Destino de login com retorno; props.isCurrentPlan: Indica subscrição própria atual; props.selectionBlocked: Impede uma segunda subscrição paga ativa; props.submitting: Bloqueia ações concorrentes; props.onChoose: Abre a confirmação. Devolve: Card comercial acessível.

### `real_dev/frontend/src/components/ui/BaseButton.jsx`

- `BaseButton({...})` (exportada; função) - Botão genérico usado em ações consistentes da aplicação. Entradas: props: Propriedades do botão; props.children: Conteúdo visível do botão; [props.type="button"]: Tipo nativo do botão; [props.variant="primary"]: Sufixo de variante visual usado no CSS; [props.disabled=false]: Indica se o botão está desativado; [props.onClick]: Gestor opcional de clique. Devolve: Elemento de botão estilizado.

### `real_dev/frontend/src/components/ui/ContentCard.jsx`

- `ContentCard({...})` (exportada; função) - Mostra um card com imagem opcional, badge, título, descrição, metadados e ação. Entradas: props: Propriedades do card; [props.eyebrow]: Etiqueta curta apresentada antes do título; props.title: Título principal visível no card; [props.description]: Texto descritivo curto; [props.imageUrl]: URL da imagem do card; [props.imageAlt]: Texto alternativo da imagem; [props.meta]: Informação complementar, como categoria, preço ou data; [props.to]: Rota interna usada pela ação; [props.actionLabel="Ver detalhe"]: Texto da ação. Devolve: Card acessível e reutilizável.

### `real_dev/frontend/src/components/ui/EmptyState.jsx`

- `EmptyState({...})` (exportada; função) - Mostra uma mensagem clara quando a página não tem dados úteis para listar. Entradas: props: Propriedades do estado; props.title: Título curto do estado; props.description: Explicação orientada para o utilizador; [props.children]: Ações opcionais, como links ou botões; [props.tone="neutral"]: Tom visual do estado; [props.headingLevel=2]: Nível do título; `1` é reservado a estados que substituem a página inteira. Devolve: Secção acessível de estado.

### `real_dev/frontend/src/components/ui/TextField.jsx`

- `TextField({...})` (exportada; função) - Campo de texto reutilizável com associação explícita entre label e input. Entradas: props: Propriedades do campo de texto; props.id: Id HTML usado para ligar etiqueta e input; props.label: Etiqueta visível do campo; [props.type="text"]: Tipo nativo do input; [props.value=""]: Valor atual do campo; [props.placeholder=""]: Placeholder apresentado quando o valor está vazio; [props.disabled=false]: Indica se o input está desativado. Devolve: Par etiqueta/input.

### `real_dev/frontend/src/config/apiBaseUrl.js`

- `isLocalHostname(hostname)` (top-level; função) - Indica se um hostname aponta inequivocamente para a máquina local. Entradas: hostname: Hostname já interpretado pela API URL. Devolve: Verdadeiro apenas para hosts loopback suportados.
- `resolveApiBaseUrl([{...}={}])` (exportada; função) - Valida e normaliza a origem configurada para a API. Ambientes locais podem usar HTTP em loopback. Qualquer build não local exige configuração explícita, HTTPS e uma origem que não seja localhost. Entradas: [options={}]: Opções a validar; [options.rawValue]: Valor de `VITE_API_BASE_URL`; [options.mode="production"]: Modo Vite atual. Devolve: URL absoluta sem barra final.

### `real_dev/frontend/src/context/SessionContext.jsx`

- `isUnauthorizedError(error)` (top-level; função) - Identifica um erro de sessão expirada sem depender da classe concreta usada por mocks ou adaptadores. Entradas: error: Erro recebido do cliente HTTP. Devolve: Verdadeiro para HTTP 401.
- `SessionProvider({...})` (exportada; função) - Disponibiliza estado de sessão para toda a aplicação. `unavailable` é diferente de `anonymous`: uma falha de rede ou HTTP 5xx não autoriza o frontend a concluir que o utilizador terminou a sessão. Entradas: props: Propriedades do provider; props.children: Árvore React que precisa da sessão. Devolve: Provider com estado de sessão e ações centralizadas.
- `useSession()` (exportada; função) - Lê o contexto de sessão no componente atual. Entradas: sem entradas explícitas. Devolve: Estado e ações de sessão.

### `real_dev/frontend/src/layouts/AdminLayout.jsx`

- `useAdminBreadcrumb()` (top-level; função) - Função documentada na implementação atual. Entradas: sem entradas explícitas. Devolve: Breadcrumb textual da rota administrativa atual.
- `AdminLayout()` (exportada; função) - Renderiza sidebar desktop e drawer modal móvel sem misturar UI pública. Entradas: sem entradas explícitas. Devolve: Layout administrativo.

### `real_dev/frontend/src/layouts/AppLayout.jsx`

- `AppLayout({...})` (exportada; função) - Estrutura de página partilhada por todas as rotas do frontend. Entradas: props: Propriedades do layout; props.children: Conteúdo de página selecionado pelo React Router. Devolve: Estrutura da aplicação com salto acessível, cabeçalho, conteúdo principal e rodapé.

### `real_dev/frontend/src/pages/AccountPage.jsx`

- `formatRole(role)` (top-level; função) - Traduz uma role técnica para texto visível em português de Portugal. Entradas: role: Role persistida no backend. Devolve: Texto visível para o utilizador.
- `formatAccountDate(value)` (top-level; função) - Formata uma data da subscrição sem permitir que valores inválidos interrompam a conta. Entradas: value: Data recebida da API. Devolve: Data legível ou fallback do ciclo atual.
- `AccountPage()` (exportada; função) - Mostra e atualiza dados da conta autenticada. Entradas: sem entradas explícitas. Devolve: Página de conta.
- `loadAccount()` (top-level; função) - Carrega a conta do utilizador autenticado. Entradas: sem entradas explícitas. Devolve: Termina depois de preencher formulário e resumo.
- `handleProfileSubmit(event)` (top-level; função) - Guarda nome público do utilizador autenticado. Entradas: event: Evento do formulário. Devolve: Termina quando a API responde.
- `handleParentalSubmit(event)` (top-level; função) - Guarda limite parental da conta autenticada. Entradas: event: Evento do formulário. Devolve: Termina quando a API responde.
- `handleCancelRenewal()` (top-level; função) - Cancela apenas a renovação futura, mantendo o acesso contratado. Entradas: sem entradas explícitas. Devolve: Termina depois de atualizar o resumo local.

### `real_dev/frontend/src/pages/AdminBiblicalPassagesListPage.jsx`

- `AdminBiblicalPassagesListPage()` (exportada; função) - Função documentada na implementação atual. Entradas: sem entradas explícitas. Devolve: Lista pesquisável e paginada de passagens.

### `real_dev/frontend/src/pages/AdminBiblicalPassagesPage.jsx`

- `statusLabel(status)` (top-level; função) - Traduz um estado editorial fechado para PT-PT. Entradas: status: Estado devolvido pela API. Devolve: Rótulo legível, sem expor coerções técnicas.
- `PassageActionIcon({...})` (top-level; função) - Desenha os símbolos vetoriais das ações editoriais sem dependências externas. O SVG é decorativo porque o nome acessível pertence sempre ao botão. Entradas: props: Configuração do símbolo. Devolve: Ícone SVG que herda a cor do controlo.
- `passagePayload(form)` (top-level; função) - Converte campos numéricos do formulário para números. Entradas: form: Dados do formulário. Devolve: Payload da API.
- `AdminBiblicalPassagesPage({...})` (exportada; função) - Página de gestão editorial de passagens bíblicas. Entradas: sem entradas explícitas. Devolve: Página admin.
- `startAction(key)` (top-level; função) - Reserva uma ação antes do render seguinte para bloquear duplos cliques. Entradas: key: Chave estável da ação. Devolve: `true` quando a ação ficou reservada.
- `finishAction(key)` (top-level; função) - Liberta uma ação depois da resposta ou falha. Entradas: key: Chave estável da ação. Devolve: Sem valor devolvido.
- `trackedController()` (top-level; função) - Cria um controller acompanhado até terminar ou a página desmontar. Entradas: sem entradas explícitas. Devolve: Controller registado.
- `updateField(field, value)` (top-level; função) - Atualiza um campo da passagem em edição. Entradas: field: Campo; value: Valor. Devolve: Sem valor devolvido.
- `updateAssociation(field, value)` (top-level; função) - Atualiza um campo da associação. Entradas: field: Campo; value: Valor. Devolve: Sem valor devolvido.
- `resetForm()` (top-level; função) - Limpa o formulário de passagem. Entradas: sem entradas explícitas. Devolve: Sem valor devolvido.
- `editPassage(passage)` (top-level; função) - Coloca uma passagem existente em modo edição. Entradas: passage: Passagem selecionada. Devolve: Sem valor devolvido.
- `handlePassageSubmit(event)` (top-level; função) - Cria ou atualiza uma passagem bíblica. Entradas: event: Evento submit. Devolve: Termina depois da gravação.
- `changeStatus(passage, nextStatus)` (top-level; função) - Atualiza o estado editorial de uma passagem. Entradas: passage: Passagem selecionada; nextStatus: Estado pretendido. Devolve: Termina depois da atualização.
- `handleAssociationSubmit(event)` (top-level; função) - Associa a passagem selecionada ao conteúdo selecionado. Entradas: event: Evento submit. Devolve: Termina depois da associação.
- `removeAssociation(item)` (top-level; função) - Remove uma associação entre conteúdo e passagem. Entradas: item: Associação selecionada. Devolve: Termina depois da remoção.

### `real_dev/frontend/src/pages/AdminCatalogCreatePage.jsx`

- `AdminCatalogCreatePage()` (exportada; função) - Função documentada na implementação atual. Entradas: sem entradas explícitas. Devolve: Fluxo editorial de criação sem listagens secundárias.

### `real_dev/frontend/src/pages/AdminCatalogEditPage.jsx`

- `AdminCatalogEditPage()` (exportada; função) - Função documentada na implementação atual. Entradas: sem entradas explícitas. Devolve: Edição editorial, media e revisões sem listagem do catálogo.

### `real_dev/frontend/src/pages/AdminCatalogListPage.jsx`

- `filtersFromParams(params)` (top-level; função) - Função documentada na implementação atual. Entradas: params: Query string atual. Devolve: Filtros normalizados para o formulário.
- `AdminCatalogListPage()` (exportada; função) - Função documentada na implementação atual. Entradas: sem entradas explícitas. Devolve: Pesquisa, filtros, tabela/cartões e paginação.

### `real_dev/frontend/src/pages/AdminCharityApplicationsPage.jsx`

- `AdminCharityApplicationsPage()` (exportada; função) - Função documentada na implementação atual. Entradas: sem entradas explícitas. Devolve: Lista filtrável e diálogo de decisão auditável.

### `real_dev/frontend/src/pages/AdminCharityMembersPage.jsx`

- `SearchCombobox({...})` (top-level; função) - Combobox cancelável com resultados navegáveis por teclado e seleção nominal. Entradas: props: Propriedades de pesquisa. Devolve: Pesquisa ou resumo da entidade selecionada.
- `selectResult(result)` (top-level; função) - Combobox cancelável com resultados navegáveis por teclado e seleção nominal. Entradas: props: Propriedades de pesquisa. Devolve: Pesquisa ou resumo da entidade selecionada.
- `handleKeyDown(event)` (top-level; função) - Combobox cancelável com resultados navegáveis por teclado e seleção nominal. Entradas: props: Propriedades de pesquisa. Devolve: Pesquisa ou resumo da entidade selecionada.
- `AdminCharityMembersPage()` (exportada; função) - Função documentada na implementação atual. Entradas: sem entradas explícitas. Devolve: Autocomplete cancelável e confirmação nominal.

### `real_dev/frontend/src/pages/AdminDashboardPage.jsx`

- `AdminDashboardPage()` (exportada; função) - Função documentada na implementação atual. Entradas: sem entradas explícitas. Devolve: KPIs, alertas e atalhos administrativos.

### `real_dev/frontend/src/pages/AdminIntegrationsPage.jsx`

- `AdminIntegrationsPage()` (exportada; função) - Função documentada na implementação atual. Entradas: sem entradas explícitas. Devolve: Cartões com drafts locais e confirmação do diff.

### `real_dev/frontend/src/pages/AdminMetricsPage.jsx`

- `formatCents(cents)` (top-level; função) - Formata cêntimos em euros segundo as convenções portuguesas. Entradas: cents: Valor em cêntimos. Devolve: Valor formatado.
- `MetricCard({...})` (top-level; função) - Renderiza um cartão simples de métrica. Entradas: props: Dados do cartão. Devolve: Cartão de métrica.
- `downloadCsv(file)` (top-level; função) - Entrega ao navegador o Blob devolvido pela API autenticada. Entradas: file: Ficheiro preparado. Devolve: Sem valor devolvido.
- `AdminMetricsPage()` (exportada; função) - Página administrativa de métricas agregadas. Entradas: sem entradas explícitas. Devolve: Filtros temporais e métricas.
- `handleSubmit(event)` (top-level; função) - Valida e aplica o intervalo temporal escolhido. Entradas: event: Evento do formulário. Devolve: Sem valor devolvido.
- `handleExport()` (top-level; função) - Pede o CSV com a sessão atual e cria o download apenas após sucesso. Entradas: sem entradas explícitas. Devolve: Termina quando o pedido foi tratado.

### `real_dev/frontend/src/pages/AdminPoolDashboardPage.jsx`

- `formatMoney(cents)` (top-level; função) - Formata valores monetários persistidos em cêntimos. Entradas: cents: Valor em cêntimos. Devolve: Valor formatado em euros.
- `AdminPoolDashboardPage()` (exportada; função) - Mostra totais mensais agregados da pool. Entradas: sem entradas explícitas. Devolve: Dashboard administrativo.

### `real_dev/frontend/src/pages/AdminPoolDistributionPage.jsx`

- `AdminPoolDistributionPage()` (exportada; função) - Função documentada na implementação atual. Entradas: sem entradas explícitas. Devolve: Fluxo em duas fases preview/commit.

### `real_dev/frontend/src/pages/AdminTaxonomiesPage.jsx`

- `AdminTaxonomiesPage()` (exportada; função) - Função documentada na implementação atual. Entradas: sem entradas explícitas. Devolve: Pesquisa, criação, edição, arquivo e reativação.

### `real_dev/frontend/src/pages/AdminUsersPage.jsx`

- `AdminUsersPage()` (exportada; função) - Função documentada na implementação atual. Entradas: sem entradas explícitas. Devolve: Tabela pesquisável e diálogo de gestão.

### `real_dev/frontend/src/pages/CatalogPage.jsx`

- `formatCatalogTypeLabel(type)` (top-level; função) - Devolve uma label plural para o filtro público do catálogo. Entradas: type: Tipo técnico recebido na query string. Devolve: Label PT-PT para o filtro ativo.
- `buildCatalogPath([{...}={}])` (top-level; função) - Constrói a rota pública do catálogo preservando filtros conhecidos. Entradas: input: Query pública pretendida. Devolve: URL interna para a página de catálogo.
- `buildContentDetailPath(content)` (top-level; função) - Constrói uma rota de detalhe sem permitir que slugs ou IDs alterem o URL. Entradas: content: Conteúdo público. Devolve: Rota interna codificada ou catálogo como fallback seguro.
- `parseCatalogPage(value)` (top-level; função) - Converte o parâmetro de página num inteiro seguro para a UI pública. Entradas: value: Valor recebido na query string. Devolve: Página positiva ou primeira página por defeito.
- `formatDurationLabel(seconds)` (top-level; função) - Converte duração técnica em etiqueta curta para cards do catálogo. Entradas: seconds: Duração total em segundos. Devolve: Etiqueta de duração ou string vazia.
- `formatAgeRatingLabel(ageRating)` (top-level; função) - Converte classificação etária em etiqueta pública. Entradas: ageRating: Classificação etária do conteúdo. Devolve: Etiqueta como `12+` ou string vazia.
- `formatPublishedDateLabel(publishedAt)` (top-level; função) - Formata a data pública de publicação no padrão português. Entradas: publishedAt: Data devolvida pela API. Devolve: Etiqueta de publicação ou string vazia.
- `formatCatalogMeta(content)` (top-level; função) - Junta metadados úteis para decisão rápida sem inventar campos de backend. Entradas: content: Conteúdo público do catálogo. Devolve: Metadados visíveis do card.
- `formatCatalogRange(catalog)` (top-level; função) - Calcula a frase de contagem para a página atual. Entradas: catalog: Página atual. Devolve: Resumo de intervalo e total.
- `normalizeSpotlightContent(content)` (top-level; função) - Normaliza os diferentes cartões públicos usados como destaque do catálogo. Entradas: content: Conteúdo vindo de catálogo ou discovery. Devolve: Conteúdo com URLs de imagem uniformes.
- `selectRecommendation(response)` (top-level; função) - Escolhe a primeira recomendação disponível preservando a prioridade do backend. O serviço coloca recomendações semânticas em primeiro lugar quando existem; percorrer a resposta por ordem evita duplicar essa regra no browser. Entradas: response: Resposta de recomendações. Devolve: Seleção ou null.
- `selectRecentContent(response)` (top-level; função) - Obtém o primeiro conteúdo recente da resposta pública de discovery. Entradas: response: Resposta da home pública. Devolve: Conteúdo recente ou null.
- `CatalogFilters({...})` (top-level; função) - Mostra os filtros públicos por formato. Entradas: props: Props do componente. Devolve: Lista de filtros navegáveis.
- `CatalogSpotlight({...})` (top-level; função) - Mostra um destaque cinematográfico recomendado ou editorial. Entradas: props: Props do componente. Devolve: Destaque público ou respetivo esqueleto.
- `CatalogPagination({...})` (top-level; função) - Mostra controlos de paginação mantendo o filtro ativo. Entradas: props: Props do componente. Devolve: Navegação paginada.
- `CatalogPage()` (exportada; função) - Mostra conteúdos publicados, filtros, paginação e blocos editoriais de apoio. Entradas: sem entradas explícitas. Devolve: Página de catálogo.
- `loadCatalogPage()` (top-level; função) - Carrega apenas a página pública pedida para respeitar RNF09. Entradas: sem entradas explícitas. Devolve: Termina depois de atualizar o estado visual.
- `loadSpotlight()` (top-level; função) - Resolve o spotlight com prioridade para recomendações autenticadas e fallback para o conteúdo mais recente da discovery pública. Entradas: sem entradas explícitas. Devolve: Termina depois de escolher o destaque seguro.

### `real_dev/frontend/src/pages/CharityApplicationPage.jsx`

- `CharityApplicationPage()` (exportada; função) - Página pública para submeter uma candidatura à revisão FaithFlix. Entradas: sem entradas explícitas. Devolve: Formulário controlado ou confirmação de receção.
- `updateField(field, value)` (top-level; função) - Atualiza um único campo sem perder os restantes dados introduzidos. Entradas: field: Campo do formulário; value: Novo valor. Devolve: Sem valor devolvido.
- `handleSubmit(event)` (top-level; função) - Submete a candidatura uma única vez e ignora respostas depois do unmount. Entradas: event: Submissão do formulário. Devolve: Valor documentado como `Promise<void>`.
- `startAnotherApplication()` (top-level; função) - Reabre o formulário vazio apenas quando o utilizador pede nova submissão. Entradas: sem entradas explícitas. Devolve: Sem valor devolvido.

### `real_dev/frontend/src/pages/CharityHistoryPage.jsx`

- `CharityHistoryPage()` (exportada; função) - Mostra histórico de distribuição para uma associação autorizada. Entradas: sem entradas explícitas. Devolve: Página privada de histórico.

### `real_dev/frontend/src/pages/ContentDetailPage.jsx`

- `formatDuration(seconds)` (top-level; função) - Converte duração em segundos para texto curto de minutos. A página recebe duração técnica do backend, mas mostra uma leitura simples para o utilizador na ficha do conteúdo. Entradas: seconds: Duração total do conteúdo em segundos. Devolve: Duração arredondada no formato `<minutos> min`.
- `formatAgeRating(value)` (top-level; função) - Formata uma classificação etária sem converter vazio em zero. Entradas: value: Classificação pública. Devolve: Classificação legível ou vazio.
- `SeriesEpisodesSection({...})` (top-level; função) - Apresenta temporadas e episódios sem transformar episódios em cartões autónomos do catálogo. Entradas: props: Dados públicos da série. Devolve: Lista ordenada ou estado «Em breve».
- `ContentDetailPage()` (exportada; função) - Página pública de detalhe de conteúdo. Entradas: sem entradas explícitas. Devolve: Página de detalhe de conteúdo.
- `EpisodeContextPage()` (exportada; função) - Página canónica de um episódio dentro da respetiva série. Favoritos, watchlist, ratings e comentários ficam deliberadamente fora desta página, porque pertencem ao agregador série. Entradas: sem entradas explícitas. Devolve: Detalhe contextual e navegação anterior/seguinte.

### `real_dev/frontend/src/pages/DemoMailboxPage.jsx`

- `DemoMailboxPage()` (exportada; função) - Página demo-only para consultar a outbox pelo email da conta local. Entradas: sem entradas explícitas. Devolve: Formulário e mensagens sem expor ids internos.
- `handleSubmit(event)` (top-level; função) - Consulta a caixa local e substitui integralmente o resultado anterior. Entradas: event: Submissão do formulário. Devolve: Termina quando a resposta fica visível.

### `real_dev/frontend/src/pages/DiscoveryHomePage.jsx`

- `formatDurationLabel(seconds)` (top-level; função) - Converte duração técnica em segundos para uma etiqueta curta. Entradas: seconds: Duração total em segundos. Devolve: Etiqueta de duração ou string vazia quando não existe valor válido.
- `formatHomeFormatLabel(type)` (top-level; função) - Devolve label plural para os formatos destacados na home. Entradas: type: Tipo técnico do conteúdo. Devolve: Label PT-PT do formato.
- `ExploreByFormatSection({...})` (top-level; função) - Mostra atalhos editoriais para os formatos principais do catálogo. Entradas: props: Formatos devolvidos pela discovery pública. Devolve: Secção de exploração por formato.
- `MostWatchedStrip({...})` (top-level; função) - Mostra a faixa pública de conteúdos mais vistos quando existem dados reais. Entradas: props: Propriedades da faixa. Devolve: Faixa de conteúdos populares ou null.
- `DiscoveryHomePage()` (exportada; função) - Mostra a entrada principal da plataforma e os carrosséis de descoberta. Entradas: sem entradas explícitas. Devolve: Página inicial da aplicação.
- `loadDiscovery()` (top-level; função) - Carrega a descoberta pública sem alterar contratos de catálogo ou recomendação. Entradas: sem entradas explícitas. Devolve: Termina depois de atualizar a página.
- `showPreviousHero()` (top-level; função) - Mostra o destaque anterior, fechando o ciclo no último item. Entradas: sem entradas explícitas. Devolve: Sem valor devolvido.
- `showNextHero()` (top-level; função) - Mostra o destaque seguinte, fechando o ciclo no primeiro item. Entradas: sem entradas explícitas. Devolve: Sem valor devolvido.

### `real_dev/frontend/src/pages/ForYouPage.jsx`

- `recommendationGroupTitle(group)` (top-level; função) - Normaliza títulos recebidos da API sem expor categorias operacionais. Entradas: group: Grupo de recomendações. Devolve: Título editorial apresentado ao utilizador.
- `ForYouPage()` (exportada; função) - Mostra uma seleção pessoal sem expor detalhes internos da recomendação. Entradas: sem entradas explícitas. Devolve: Página de recomendações pessoais.
- `loadRecommendations()` (top-level; função) - Carrega recomendações mantendo uma explicação compreensível na interface. Entradas: sem entradas explícitas. Devolve: Termina depois de atualizar a página.

### `real_dev/frontend/src/pages/LoginPage.jsx`

- `LoginPage()` (exportada; função) - Página pública de autenticação e recuperação de acesso. Entradas: sem entradas explícitas. Devolve: Experiência pública de identidade numa única rota.

### `real_dev/frontend/src/pages/MyLibraryPage.jsx`

- `PaginatedLibrarySection({...})` (top-level; função) - Mostra uma lista pessoal paginada sem bloquear as restantes secções. Entradas: props: Propriedades da secção; props.id: Identificador estável para títulos e acessibilidade; props.title: Título visível; props.loadItems: Pedido da lista. Devolve: Secção paginada.
- `MyLibraryPage()` (exportada; função) - Mostra favoritos, lista para ver mais tarde e histórico da sessão atual. Entradas: sem entradas explícitas. Devolve: Página da biblioteca pessoal.

### `real_dev/frontend/src/pages/NotificationsPage.jsx`

- `NotificationsPage()` (exportada; função) - Página de notificações e preferências do utilizador autenticado. Entradas: sem entradas explícitas. Devolve: Interface de leitura e configuracao de notificações.
- `trackedController()` (top-level; função) - Carrega notificações e preferências em paralelo. Entradas: sem entradas explícitas. Devolve: Valor documentado como `Promise<void>`.
- `updatePreference(field, value)` (top-level; função) - Atualiza uma preferência e guarda a alteracao no backend. Entradas: field: Preferência alterada; value: Novo valor. Devolve: Valor documentado como `Promise<void>`.
- `markAsRead(id)` (top-level; função) - Marca uma notificação como lida e recarrega a lista. Entradas: id: Identificador da notificação. Devolve: Valor documentado como `Promise<void>`.

### `real_dev/frontend/src/pages/PlaybackPage.jsx`

- `hasOption(options, value, key)` (top-level; função) - Confirma se uma opção de media está disponível para seleção. Entradas: options: Opções fechadas do backend; value: Valor atualmente selecionado; key: Campo usado na comparação. Devolve: `true` quando a opção existe e não está bloqueada.
- `canonicalPreferences(response)` (top-level; função) - Deriva a seleção apresentada a partir da decisão canónica do backend. `selectedQuality` e `selectedAudioLanguage` têm precedência sobre preferências antigas, porque podem refletir downgrade de plano, parental ou uma variante inexistente. Nenhuma opção transporta uma URL reproduzível. Entradas: response: DTO autenticado de playback. Devolve: Preferências fechadas.
- `currentPosition(video, [fallback=0])` (top-level; função) - Devolve uma posição finita e não negativa do elemento de vídeo. Entradas: video: Elemento atual; fallback: Última posição observada. Devolve: Posição segura em segundos.
- `PlaybackPage()` (exportada; função) - Authenticated playback page with protocol adapters and durable progress. Entradas: sem entradas explícitas. Devolve: Página de reprodução.
- `applySubtitlePreference(video, language)` (top-level; função) - Ativa apenas a text track já presente no elemento. Neste corte o DTO expõe só metadata das legendas e não contém `src`; a função fica preparada para tracks nativas incorporadas no próprio media, sem fabricar endpoints nem contornar autorização. Entradas: video: Elemento com eventuais tracks incorporadas; language: Idioma pretendido ou vazio. Devolve: Sem valor devolvido.
- `handleLoadedMetadata()` (top-level; função) - Retoma o conteúdo depois de o adapter disponibilizar metadata. Entradas: sem entradas explícitas. Devolve: Sem valor devolvido.
- `handleTimeUpdate()` (top-level; função) - Regista a posição e agenda uma escrita apenas após o intervalo mínimo. Entradas: sem entradas explícitas. Devolve: Sem valor devolvido.
- `handlePause()` (top-level; função) - Faz flush não bloqueante da posição atual em pause. Entradas: sem entradas explícitas. Devolve: Sem valor devolvido.
- `handlePlay()` (top-level; função) - Função documentada na implementação atual. Entradas: sem entradas explícitas. Devolve: Regista uma única vez o início consentido da rota.
- `handleEnded()` (top-level; função) - Função documentada na implementação atual. Entradas: sem entradas explícitas. Devolve: Faz flush terminal e regista conclusão anónima.
- `updatePreference(name, value)` (top-level; função) - Persiste uma preferência e pede ao backend uma nova fonte canónica. A UI é otimista, mas reverte em falha. Áudio e qualidade nunca escolhem URLs localmente: uma leitura autenticada posterior volta a aplicar os entitlements e devolve a única `source` autorizada. Entradas: name: Campo fechado; value: Novo valor. Devolve: Resultado da mutação.

### `real_dev/frontend/src/pages/PublicCharitiesPage.jsx`

- `PublicCharitiesPage()` (exportada; função) - Página pública de impacto, associações elegíveis e entrada privada segura. Entradas: sem entradas explícitas. Devolve: Experiência pública das associações FaithFlix.

### `real_dev/frontend/src/pages/SearchPage.jsx`

- `filtersFromSearchParams(params)` (top-level; função) - Converte os parâmetros partilháveis da rota num pedido seguro. Entradas: params: Query string atual. Devolve: Estado normalizado.
- `toSearchParams(filters, page)` (top-level; função) - Serializa filtros submetidos, omitindo filtros opcionais vazios. Entradas: filters: Estado do formulário; page: Página pretendida. Devolve: Query string canónica.
- `buildContentDetailPath(content)` (top-level; função) - Constrói uma rota de detalhe a partir de um identificador não confiável. Entradas: content: Resultado público da pesquisa. Devolve: Rota interna com o segmento codificado.
- `formatSearchMeta(content)` (top-level; função) - Junta taxonomias e classificação numa única linha curta de decisão. Entradas: content: Resultado de pesquisa. Devolve: Metadados compactos do card.
- `editableFilters(source)` (top-level; função) - Devolve apenas os campos editáveis usados pelo formulário. Entradas: source: Filtros vindos do URL ou formulário. Devolve: Filtros controlados.
- `SearchPage()` (exportada; função) - Permite pesquisar conteúdos publicados por texto, tipo e taxonomia. Entradas: sem entradas explícitas. Devolve: Página de pesquisa.
- `submitSearch(event)` (top-level; função) - Confirma os filtros no URL e reinicia a paginação. Entradas: event: Evento do formulário. Devolve: Sem valor devolvido.
- `searchByTaxonomy(taxonomy)` (top-level; função) - Inicia uma pesquisa imediata a partir de uma taxonomia pública. Entradas: taxonomy: Tema selecionado. Devolve: Sem valor devolvido.
- `removeFilter(field)` (top-level; função) - Remove um filtro secundário, preserva a query e regressa à primeira página. Entradas: field: Filtro a limpar. Devolve: Sem valor devolvido.
- `clearSecondaryFilters()` (top-level; função) - Limpa filtros secundários sem apagar a pesquisa atual. Entradas: sem entradas explícitas. Devolve: Sem valor devolvido.
- `changePage(page)` (top-level; função) - Navega para outra página preservando query e filtros no URL. Entradas: page: Página válida. Devolve: Sem valor devolvido.

### `real_dev/frontend/src/pages/SubscriptionPage.jsx`

- `formatDate(value)` (top-level; função) - Formata uma data para padrão europeu sem expor datas inválidas. Entradas: value: Valor de data. Devolve: Data localizada ou string vazia.
- `formatQuality(quality)` (top-level; função) - Formata a qualidade máxima para UI. Entradas: quality: Qualidade técnica. Devolve: Qualidade legível.
- `orderedIntervals(intervals)` (top-level; função) - Ordena ciclos conhecidos sem inventar uma ordem para valores futuros. Entradas: intervals: Ciclos encontrados nos planos. Devolve: Ciclos únicos e ordenados.
- `SubscriptionPage()` (exportada; função) - Página comercial dos planos e gestão autenticada da subscrição. Entradas: sem entradas explícitas. Devolve: Página responsiva de planos FaithFlix.
- `getIdempotencyKey(operationKey)` (top-level; função) - Mantém uma chave por intenção até existir resposta conclusiva. Entradas: operationKey: Intenção funcional estável. Devolve: UUID idempotente.
- `runOperation(operation, successMessage, [options={}])` (top-level; função) - Executa uma mutação autenticada e recarrega o estado privado. Entradas: sem entradas explícitas. Devolve: Sem valor devolvido documentado.
- `openCheckoutDialog(plan, trigger)` (top-level; função) - Abre a confirmação de checkout e preserva o elemento de origem. Entradas: sem entradas explícitas. Devolve: Sem valor devolvido documentado.
- `handleCheckoutDialogClose()` (top-level; função) - Repõe o foco na ação que abriu o diálogo. Entradas: sem entradas explícitas. Devolve: Sem valor devolvido documentado.
- `closeCheckoutDialog()` (top-level; função) - Fecha o diálogo também em ambientes sem a API nativa completa. Entradas: sem entradas explícitas. Devolve: Sem valor devolvido documentado.
- `handleSimulatedCheckout()` (top-level; função) - Confirma o plano selecionado através do checkout existente. Entradas: sem entradas explícitas. Devolve: Sem valor devolvido documentado.
- `handleStartTrial()` (top-level; função) - Inicia o trial único preservando idempotência em retries ambíguos. Entradas: sem entradas explícitas. Devolve: Sem valor devolvido documentado.
- `handleCancelRenewal()` (top-level; função) - Cancela apenas a renovação futura após confirmação explícita. Entradas: sem entradas explícitas. Devolve: Sem valor devolvido documentado.
- `handleInvite(event)` (top-level; função) - Envia um convite familiar e limpa o email depois de sucesso. Entradas: sem entradas explícitas. Devolve: Sem valor devolvido documentado.

### `real_dev/frontend/src/pages/pages.jsx`

- `NotFoundPage()` (exportada; função) - Rota fallback para URLs desconhecidas do frontend. Entradas: sem entradas explícitas. Devolve: Página amigável de recurso não encontrado.

### `real_dev/frontend/src/routes/AppRoutes.jsx`

- `lazyNamedPage(loader, exportName)` (top-level; função) - Converte um export nomeado de página num componente lazy sem obrigar as páginas existentes a introduzir exports default artificiais. Entradas: loader: Import dinâmico; exportName: Nome do componente exportado. Devolve: Página lazy.
- `retryRouteLoad()` (top-level; função) - Recarrega o documento por ação explícita do utilizador. Um reload é necessário para permitir nova transferência quando um chunk lazy falha. Entradas: sem entradas explícitas. Devolve: Sem valor devolvido.
- `RouteLoadingFallback()` (top-level; função) - Função documentada na implementação atual. Entradas: sem entradas explícitas. Devolve: Estado acessível enquanto o chunk da rota é carregado.
- `withAdminRoute(page, [allowedRoles=["admin"]])` (top-level; função) - Envolve páginas administrativas na guarda visual. Entradas: page: Página administrativa; [allowedRoles=["admin"]: ] Roles aceites pela rota. Devolve: Rota protegida pela sessão.
- `withAuthenticatedRoute(page)` (top-level; função) - Envolve páginas que exigem sessão autenticada. Entradas: page: Página privada. Devolve: Rota protegida por sessão.
- `AdminIndexRoute()` (top-level; função) - Função documentada na implementação atual. Entradas: sem entradas explícitas. Devolve: Landing administrativa dependente da role confirmada.
- `AppRoutes()` (exportada; função) - Declara a árvore de rotas renderizada dentro do layout partilhado. Entradas: sem entradas explícitas. Devolve: Rotas da aplicação.

### `real_dev/frontend/src/routes/RouteLifecycle.jsx`

- `RouteLifecycle()` (exportada; função) - Atualiza título, scroll e foco quando muda o pathname. Alterações apenas de filtros/query mantêm o foco atual para não interromper interação na página. Entradas: sem entradas explícitas. Devolve: O componente gere apenas efeitos do documento.

### `real_dev/frontend/src/routes/routeMetadata.js`

- `resolveRouteTitle(pathname)` (exportada; função) - Resolve o título seguro de uma rota sem incluir parâmetros ou query strings. Entradas: pathname: Path atual do React Router. Devolve: Título completo do documento.

### `real_dev/frontend/src/services/api/analyticsApi.js`

- `record(type, [options={}])` (top-level; método de objeto) - Envia exclusivamente tipo e categoria ampla opcional. Entradas: type: Tipo fechado; [options]: Categoria e cancelamento. Devolve: Resposta HTTP 204.
- `reportAnonymousMetric(type, [options={}])` (exportada; função) - Regista telemetria de UX sem permitir que uma falha analítica interrompa a ação principal do utilizador. Entradas: type: Tipo fechado; [options]: Categoria segura. Devolve: Sem valor devolvido.

### `real_dev/frontend/src/services/api/apiClient.js`

- `clearCsrfToken()` (exportada; função) - Remove o token CSRF mantido exclusivamente em memória. Entradas: sem entradas explícitas. Devolve: Sem valor devolvido.
- `setUnauthorizedHandler(handler)` (exportada; função) - Regista o callback chamado quando qualquer pedido recebe HTTP 401. Só existe um consumidor global, o `SessionProvider`. A função de limpeza evita que um provider desmontado continue a receber eventos. Entradas: handler: Callback ou null. Devolve: Função que remove este callback se ainda estiver ativo.
- `buildUrl(path)` (top-level; função) - Constrói uma URL absoluta da API a partir de um caminho interno. Entradas: path: Caminho da API, com ou sem barra inicial. Devolve: URL absoluta para o backend configurado.
- `getCauseMessage(error)` (top-level; função) - Extrai uma mensagem utilizável de uma causa desconhecida. Entradas: error: Valor lançado. Devolve: Mensagem técnica curta para diagnóstico.
- `createAbortScope(externalSignal, timeoutMs)` (top-level; função) - Cria um sinal que combina o cancelamento do chamador com o limite temporal. Entradas: externalSignal: Sinal fornecido pelo consumidor; timeoutMs: Limite total do pedido, incluindo renovação CSRF. Devolve: Âmbito de cancelamento.
- `parseResponseBody(response)` (top-level; função) - Interpreta uma resposta sem assumir que todo o backend devolve JSON. Entradas: response: Resposta Fetch devolvida pelo navegador. Devolve: JSON, mensagem textual ou null para corpo vazio.
- `notifyUnauthorized(error)` (top-level; função) - Notifica o contexto de sessão sem permitir que um erro no callback esconda o erro HTTP original. Entradas: error: Erro 401 normalizado. Devolve: Sem valor devolvido.
- `performFetch(path, {...})` (top-level; função) - Executa uma tentativa HTTP já preparada. Entradas: path: Caminho interno da API; options: Opções da tentativa. Devolve: Corpo interpretado.
- `ensureCsrfToken(signal)` (top-level; função) - Obtém e valida o token CSRF da sessão atual. Entradas: signal: Sinal comum ao pedido original. Devolve: Token guardado apenas no módulo em memória.
- `performRequest(path, {...})` (top-level; função) - Executa um pedido, acrescentando CSRF a métodos inseguros e renovando o token no máximo uma vez quando o backend devolve `CSRF_INVALID`. Entradas: path: Caminho interno da API; options: Opções do pedido. Devolve: Corpo interpretado.
- `request(path, [{...}={}])` (top-level; função) - Envia um pedido HTTP através do cliente central da API FaithFlix. Entradas: path: Caminho da API a chamar; [options={}]: Opções Fetch e limite temporal. `rawBody` é reservado a transports binários explícitos e `csrf:false` a endpoints públicos sem sessão. Devolve: Corpo da resposta interpretado.
- `get(path, options)` (top-level; função) - Função documentada na implementação atual. Entradas: path: Sem descrição adicional; [options]: Sem descrição adicional. Devolve: Valor documentado como `Promise<unknown>`.
- `post(path, body, options)` (top-level; função) - Função documentada na implementação atual. Entradas: path: Sem descrição adicional; body: Sem descrição adicional; [options]: Sem descrição adicional. Devolve: Valor documentado como `Promise<unknown>`.
- `put(path, body, options)` (top-level; função) - Função documentada na implementação atual. Entradas: path: Sem descrição adicional; body: Sem descrição adicional; [options]: Sem descrição adicional. Devolve: Valor documentado como `Promise<unknown>`.
- `putRaw(path, rawBody, options)` (top-level; função) - Envia um corpo Fetch binário sem serialização JSON. O consumidor tem de declarar o `Content-Type`; sessão, timeout, cancelamento e renovação CSRF continuam a pertencer ao cliente central. Entradas: path: Caminho interno da API; rawBody: Blob/File/stream suportado pelo Fetch; [options]: Opções do pedido. Devolve: Resposta JSON interpretada.
- `patch(path, body, options)` (top-level; função) - Função documentada na implementação atual. Entradas: path: Sem descrição adicional; body: Sem descrição adicional; [options]: Sem descrição adicional. Devolve: Valor documentado como `Promise<unknown>`.
- `del(path, options)` (top-level; função) - Função documentada na implementação atual. Entradas: path: Sem descrição adicional; [options]: Sem descrição adicional. Devolve: Valor documentado como `Promise<unknown>`.
- `downloadFilename(disposition)` (top-level; função) - Extrai um nome de ficheiro simples sem aceitar segmentos de caminho. Entradas: disposition: Header Content-Disposition. Devolve: Nome seguro ou vazio.
- `download(path, [{...}={}])` (top-level; função) - Descarrega um ficheiro privado por fetch autenticado sem navegar para a API. Entradas: path: Caminho interno da API; [options]: Opções de leitura. Devolve: Blob e nome sugerido pelo backend.

### `real_dev/frontend/src/services/api/apiErrors.js`

- `getDefaultApiErrorMessage(status)` (exportada; função) - Devolve uma mensagem segura em Português para um estado da API. Entradas: estado: Código HTTP, ou 0 quando não houve resposta. Devolve: Mensagem de erro em Português para o utilizador.
- `getClientApiErrorMessage(code)` (exportada; função) - Devolve mensagens seguras para falhas produzidas antes de existir uma resposta HTTP utilizável. Entradas: code: Código normalizado pelo cliente HTTP. Devolve: Mensagem em português de Portugal.
- `toUserMessage(error)` (exportada; função) - Converte qualquer valor lançado numa mensagem segura para a UI. Entradas: error: Error caught by a component or service. Devolve: Mensagem que pode ser apresentada ao utilizador.

### `real_dev/frontend/src/services/api/authApi.js`

- `register(data, [options={}])` (top-level; método de objeto) - Regista um utilizador e inicia sessão. Entradas: data: Dados de registo; [options={}]: Opções do pedido, incluindo cancelamento. Devolve: Utilizador público e estado de sessão.
- `login(data, [options={}])` (top-level; método de objeto) - Autentica um utilizador existente. Entradas: data: Dados de login; [options={}]: Opções do pedido, incluindo cancelamento. Devolve: Utilizador público e estado de sessão.
- `forgotPassword(data, [options={}])` (top-level; método de objeto) - Pede criação de token de recuperação de password. Entradas: data: Dados com email; [options={}]: Opções do pedido, incluindo cancelamento. Devolve: Mensagem pública genérica.
- `resetPassword(data, [options={}])` (top-level; método de objeto) - Substitui password usando um token válido. Entradas: data: Dados com token e nova password; [options={}]: Opções do pedido, incluindo cancelamento. Devolve: Mensagem de sucesso.
- `me()` (top-level; método de objeto) - Obtém a sessão atual. Entradas: sem entradas explícitas. Devolve: Utilizador autenticado ou `null`.
- `logout()` (top-level; método de objeto) - Termina a sessão atual. Entradas: sem entradas explícitas. Devolve: Resposta vazia de logout.

### `real_dev/frontend/src/services/api/biblicalPassagesApi.js`

- `queryString([params={}])` (top-level; função) - Constrói query string simples para paginação. Entradas: params: Parâmetros. Devolve: Query string com prefixo.
- `listPublished([params={}])` (top-level; método de objeto) - Lista passagens bíblicas publicadas para as páginas públicas. Os filtros são convertidos para query string antes da chamada HTTP, para o backend aplicar paginação sem o frontend conhecer a implementação MongoDB. Entradas: params: Filtros opcionais de paginação enviados como query string. Devolve: Página de passagens devolvida pela API.
- `listForContent(idOrSlug, [options={}])` (top-level; método de objeto) - Lista passagens associadas a um conteúdo público. Entradas: idOrSlug: Id ou slug do conteúdo; [options]: Opções de cancelamento do pedido. Devolve: Resposta da API.
- `listAdmin([params={}], [options={}])` (top-level; método de objeto) - Lista passagens bíblicas para administração editorial. Esta chamada usa a rota protegida de administração e permite consultar passagens publicadas, rascunhos e conteúdos em revisão. Entradas: params: Filtros opcionais de paginação enviados como query string. Devolve: Página administrativa devolvida pela API.
- `listAdminForContent(contentId, [options={}])` (top-level; método de objeto) - Lista associações de passagens de um conteúdo para administração. Entradas: contentId: Id do conteúdo. Devolve: Resposta da API.
- `create(input, [options={}])` (top-level; método de objeto) - Cria uma passagem como rascunho. Entradas: input: Dados da passagem. Devolve: Resposta da API.
- `update(passageId, input, [options={}])` (top-level; método de objeto) - Atualiza uma passagem existente. Entradas: passageId: Id da passagem; input: Dados da passagem. Devolve: Resposta da API.
- `updateStatus(passageId, status, [options={}])` (top-level; método de objeto) - Altera o estado editorial de uma passagem. Entradas: passageId: Id da passagem; status: Novo estado. Devolve: Resposta da API.
- `linkToContent(contentId, input, [options={}])` (top-level; método de objeto) - Associa uma passagem a um conteúdo. Entradas: contentId: Id do conteúdo; input: Associação. Devolve: Resposta da API.
- `unlinkFromContent(contentId, passageId, [options={}])` (top-level; método de objeto) - Remove uma associação entre conteúdo e passagem. Entradas: contentId: Id do conteúdo; passageId: Id da passagem. Devolve: Resposta da API.

### `real_dev/frontend/src/services/api/catalogApi.js`

- `listPublished([params={}], [options={}])` (top-level; método de objeto) - Lista conteúdos publicados disponíveis para o público. Esta chamada alimenta páginas de catálogo sem expor rascunhos ou metadados administrativos. Entradas: [params={}]: Filtros públicos e paginação opcional; [options]: Opções de cancelamento do pedido. Devolve: Catálogo público devolvido pela API.
- `getDetail(idOrSlug, [options={}])` (top-level; método de objeto) - Obtém o detalhe público de um conteúdo. Aceita tanto identificador como slug para permitir navegação por URLs legíveis sem duplicar lógica no frontend. Entradas: idOrSlug: Identificador técnico ou slug público do conteúdo; [options]: Opções de cancelamento do pedido. Devolve: Detalhe público devolvido pela API.
- `listAdmin([params={}], [options={}])` (top-level; método de objeto) - Lista conteúdos para gestão administrativa. A rota administrativa pode incluir rascunhos, itens arquivados e metadados que não pertencem ao catálogo público. Entradas: sem entradas explícitas. Devolve: Catálogo administrativo devolvido pela API.
- `getAdminContent(contentId, [options={}])` (top-level; método de objeto) - Obtém diretamente um conteúdo administrativo por identificador. Entradas: contentId: Identificador do conteúdo; [options]: Opções de cancelamento. Devolve: Detalhe editorial protegido.
- `getAdminEditorOptions([options={}])` (top-level; método de objeto) - Função documentada na implementação atual. Entradas: sem entradas explícitas. Devolve: Opções mínimas usadas pelo editor.
- `createContent(input, [options={}])` (top-level; método de objeto) - Cria um novo conteúdo no catálogo. O payload vem dos formulários administrativos e é validado no backend antes de ser persistido. Entradas: input: Dados editoriais do novo conteúdo; [options]: Opções de cancelamento. Devolve: Conteúdo criado devolvido pela API.
- `updateContent(contentId, input, [options={}])` (top-level; método de objeto) - Atualiza campos editoriais de um conteúdo existente. O identificador vai no URL e o corpo transporta apenas os campos que a interface administrativa pretende alterar. Entradas: contentId: Identificador do conteúdo; input: Campos editoriais atualizados; [options]: Opções de cancelamento. Devolve: Conteúdo atualizado devolvido pela API.
- `updateStatus(contentId, status, expectedVersion, [options={}])` (top-level; método de objeto) - Altera o estado editorial de um conteúdo. A função envia apenas o novo estado, deixando a API validar transições como publicação, arquivo ou regresso a rascunho. Entradas: contentId: Identificador do conteúdo; status: Novo estado editorial; expectedVersion: Versão CAS observada na linha; [options]: Opções de cancelamento. Devolve: Conteúdo com estado atualizado.
- `listRevisions(contentId, [params={}], [options={}])` (top-level; método de objeto) - Lista revisões guardadas de um conteúdo. A chamada permite à administração comparar versões anteriores antes de decidir reverter uma alteração. Entradas: contentId: Identificador do conteúdo; [params]: Paginação; [options]: Opções de cancelamento. Devolve: Histórico de revisões devolvido pela API.
- `revertRevision(contentId, revisionId, expectedVersion, [options={}])` (top-level; método de objeto) - Reverte um conteúdo para uma revisão anterior. O URL identifica simultaneamente o conteúdo atual e a revisão escolhida, evitando que o frontend envie estado editorial reconstruído manualmente. Entradas: contentId: Identificador do conteúdo; revisionId: Identificador da revisão a restaurar; expectedVersion: Versão CAS observada na linha; [options]: Opções de cancelamento. Devolve: Conteúdo restaurado devolvido pela API.
- `listMediaAssets(contentId, [options={}])` (top-level; método de objeto) - Lista assets MP4 administrativos sem expor storage keys. Entradas: contentId: Identificador do conteúdo; [options]: Opções de cancelamento. Devolve: Lista autoritativa de assets.
- `createMediaUpload(contentId, input, [options={}])` (top-level; método de objeto) - Cria uma sessão de upload local para um MP4 progressive. Entradas: contentId: Identificador do conteúdo; input: Metadata fechada do ficheiro; [options]: Opções de cancelamento. Devolve: Asset pendente criado pelo backend.
- `uploadMediaFile(contentId, uploadId, file, [options={}])` (top-level; método de objeto) - Envia o File diretamente como `video/mp4`, sem multipart ou base64. Entradas: contentId: Identificador do conteúdo; uploadId: Identificador da sessão; file: Ficheiro selecionado; [options]: Cancelamento e timeout opcional. Devolve: Asset validado em estado uploaded.
- `activateMediaUpload(contentId, uploadId, expectedVersion, [options={}])` (top-level; método de objeto) - Ativa um asset ingerido usando a versão editorial observada na linha. Entradas: contentId: Identificador do conteúdo; uploadId: Asset ingerido; expectedVersion: Versão CAS corrente; [options]: Opções de cancelamento. Devolve: Asset ativo e nova versão editorial.
- `abortMediaUpload(contentId, uploadId, [options={}])` (top-level; método de objeto) - Aborta um asset ainda não ativo e pede a remoção do ficheiro local. Entradas: contentId: Identificador do conteúdo; uploadId: Asset a remover; [options]: Opções de cancelamento. Devolve: Resposta vazia 204.
- `listTaxonomies([options={}])` (top-level; método de objeto) - Lista taxonomias disponíveis para classificar conteúdos. A UI usa esta lista para preencher filtros e formulários editoriais sem duplicar categorias em código frontend. Entradas: sem entradas explícitas. Devolve: Lista de taxonomias devolvida pela API.
- `createTaxonomy(input, [options={}])` (top-level; método de objeto) - Cria uma nova taxonomia editorial. O payload contém nome, slug e descrição opcional, sendo normalizado e validado pela API antes de ficar disponível no catálogo. Entradas: input: Dados da nova taxonomia; [options]: Opções de cancelamento. Devolve: Taxonomia criada devolvida pela API.
- `listAdminTaxonomies([params={}], [options={}])` (top-level; método de objeto) - Lista taxonomias com metadados administrativos e utilização. Entradas: sem entradas explícitas. Devolve: Sem valor devolvido documentado.
- `updateTaxonomy(taxonomyId, input, [options={}])` (top-level; método de objeto) - Atualiza os metadados de uma taxonomia. Entradas: sem entradas explícitas. Devolve: Sem valor devolvido documentado.
- `updateTaxonomyStatus(taxonomyId, status, expectedVersion, [options={}])` (top-level; método de objeto) - Arquiva ou reativa uma taxonomia. Entradas: sem entradas explícitas. Devolve: Sem valor devolvido documentado.

### `real_dev/frontend/src/services/api/charitiesApi.js`

- `apiUrl(path)` (top-level; função) - Constrói URL absoluta para downloads servidos diretamente pelo backend. Entradas: path: Caminho HTTP da API. Devolve: URL absoluta.
- `lookupAdminCharities(search, [options={}])` (top-level; método de objeto) - Pesquisa associações ativas elegíveis sem devolver contactos privados. Entradas: sem entradas explícitas. Devolve: Sem valor devolvido documentado.
- `submitApplication(input, [options={}])` (top-level; método de objeto) - Submete uma candidatura pública. Entradas: input: Campos do formulário. Devolve: Candidatura criada.
- `listApplications([params={}], [options={}])` (top-level; método de objeto) - Lista candidaturas para ecrãs de administração. Entradas: [status="pending"]: Estado a consultar. Devolve: Lista devolvida pela API.
- `reviewApplication(id, input, [options={}])` (top-level; método de objeto) - Revê uma candidatura pendente. Entradas: id: Identificador da candidatura; input: Decisão administrativa. Devolve: Resultado da revisão.
- `runDistribution(month, previewToken, [options={}])` (top-level; método de objeto) - Executa a distribuição mensal da pool solidária. Entradas: month: Mês no formato `YYYY-MM`. Devolve: Distribuição persistida.
- `previewDistribution(month, [options={}])` (top-level; método de objeto) - Calcula uma preview financeira sem escrita nem audit log. Entradas: month: Mês fechado no formato `YYYY-MM`. Devolve: Candidato e token de consistência.
- `getDistribution(month)` (top-level; método de objeto) - Consulta uma distribuição mensal já criada. Entradas: month: Mês no formato `YYYY-MM`. Devolve: Distribuição persistida.
- `listPublicCharities([options={}])` (top-level; método de objeto) - Lista associações públicas elegíveis. Entradas: sem entradas explícitas. Devolve: Associações e impacto público agregado.
- `getMine([options={}])` (top-level; método de objeto) - Obtém o resumo da associação ligada à sessão atual. Entradas: [options]: Opções canceláveis do pedido. Devolve: Associação própria ou ausência explícita.
- `listPublic([options={}])` (top-level; método de objeto) - Alias curto usado por páginas antigas do frontend. Entradas: sem entradas explícitas. Devolve: Associações públicas.
- `getPoolDashboard([options={}])` (top-level; método de objeto) - Obtém o dashboard administrativo da pool. Entradas: sem entradas explícitas. Devolve: Meses agregados.
- `getCharityHistory(charityId, [options={}])` (top-level; método de objeto) - Obtém histórico privado de uma associação. Entradas: charityId: Identificador da associação. Devolve: Histórico de distribuição.
- `historyCsvUrl(charityId)` (top-level; método de objeto) - Constrói URL para download CSV do histórico. Entradas: charityId: Identificador da associação. Devolve: URL absoluta do CSV.
- `linkUserToCharity(charityId, userId, [options={}])` (top-level; método de objeto) - Liga um utilizador a uma associação. Entradas: charityId: Identificador da associação; userId: Identificador do utilizador. Devolve: Ligação criada ou atualizada.

### `real_dev/frontend/src/services/api/commentsApi.js`

- `list(contentId, options)` (top-level; método de objeto) - Lista comentários visíveis de um conteúdo. O identificador do conteúdo segue no URL para a API devolver apenas a conversa associada a esse item do catálogo. Entradas: contentId: Identificador do conteúdo comentado; [options]: Opções de transporte, incluindo cancelamento. Devolve: Lista de comentários devolvida pela API.
- `create(contentId, body, options)` (top-level; método de objeto) - Cria um novo comentário no conteúdo indicado. O texto é enviado no corpo do pedido e a API associa o autor a partir da sessão autenticada. Entradas: contentId: Identificador do conteúdo comentado; body: Texto escrito pelo utilizador; [options]: Opções de transporte, incluindo cancelamento. Devolve: Comentário criado devolvido pela API.
- `remove(commentId, options)` (top-level; método de objeto) - Remove um comentário pelo seu identificador. A API valida se a sessão atual pode apagar o comentário antes de executar a operação. Entradas: commentId: Identificador do comentário; [options]: Opções de transporte, incluindo cancelamento. Devolve: Resultado da remoção devolvido pela API.
- `moderate(commentId, input, options)` (top-level; método de objeto) - Atualiza o estado de moderação de um comentário. O payload contém a decisão administrativa e a API aplica as regras de autorização antes de alterar a visibilidade do comentário. Entradas: commentId: Identificador do comentário moderado; input: Decisão ou dados de moderação; [options]: Opções de transporte, incluindo cancelamento. Devolve: Comentário moderado devolvido pela API.

### `real_dev/frontend/src/services/api/demoMailboxApi.js`

- `list(email, [options={}])` (top-level; método de objeto) - Consulta mensagens locais pelo email exato. A rota é pública apenas no processo demo/loopback. O caller ativa CSRF quando o contexto confirma uma sessão autenticada; sem sessão não deve tentar obter um token num endpoint que exige autenticação. Entradas: email: Email da conta demo; [options]: Opções de cancelamento. Devolve: Mensagens locais recentes.

### `real_dev/frontend/src/services/api/discoveryApi.js`

- `home([options={}])` (top-level; método de objeto) - Obtém os blocos de descoberta da página inicial. A API agrega secções como destaques, categorias e recomendações públicas para a home sem a página conhecer a origem de cada bloco. Entradas: sem entradas explícitas. Devolve: Conteúdo de descoberta devolvido pela API.
- `related(contentId, [options={}])` (top-level; método de objeto) - Lista conteúdos relacionados com um item do catálogo. O identificador do conteúdo base é codificado no URL para o backend calcular sugestões relacionadas. Entradas: contentId: Identificador do conteúdo base. Devolve: Lista de conteúdos relacionados devolvida pela API.

### `real_dev/frontend/src/services/api/integrationsApi.js`

- `listIntegrations([options={}])` (top-level; método de objeto) - Lista integracoes configuraveis. Entradas: sem entradas explícitas. Devolve: Lista de integracoes.
- `updateIntegration(key, input, [options={}])` (top-level; método de objeto) - Atualiza estado publico de uma integracao. Entradas: key: Chave da integracao; input: Configuracao publica. Devolve: Integracao atualizada.

### `real_dev/frontend/src/services/api/libraryApi.js`

- `buildPagination([pagination={}])` (top-level; função) - Constrói a query de uma lista pessoal sem aceitar limites ilimitados. Entradas: pagination: Paginação pedida pela UI. Devolve: Query string, incluindo `?` quando necessário.
- `listFavorites([pagination={}], [options={}])` (top-level; método de objeto) - Lista os favoritos da conta autenticada. A função não recebe argumentos porque o backend identifica o utilizador a partir da sessão enviada pelo `apiClient`. Entradas: sem entradas explícitas. Devolve: Lista de conteúdos favoritos devolvida pela API.
- `addFavorite(contentId, [options={}])` (top-level; método de objeto) - Adiciona um conteúdo à lista de favoritos do utilizador. O identificador segue no URL para a API associar o conteúdo à biblioteca da sessão atual. Entradas: contentId: Identificador do conteúdo a marcar como favorito. Devolve: Favorito criado ou estado atualizado devolvido pela API.
- `removeFavorite(contentId, [options={}])` (top-level; método de objeto) - Remove um conteúdo da lista de favoritos do utilizador. A remoção é feita por identificador de conteúdo, mantendo a decisão de autorização no backend. Entradas: contentId: Identificador do conteúdo a remover dos favoritos. Devolve: Resultado da remoção devolvido pela API.
- `listWatchlist([pagination={}], [options={}])` (top-level; método de objeto) - Lista os conteúdos guardados para ver mais tarde. A rota devolve a watchlist da sessão atual sem o frontend precisar de transportar o identificador do utilizador. Entradas: sem entradas explícitas. Devolve: Lista de watchlist devolvida pela API.
- `addWatchlist(contentId, [options={}])` (top-level; método de objeto) - Adiciona um conteúdo à watchlist do utilizador. O frontend envia apenas o identificador do conteúdo; a API decide se cria ou mantém a associação existente. Entradas: contentId: Identificador do conteúdo a guardar para mais tarde. Devolve: Entrada de watchlist criada ou atualizada pela API.
- `removeWatchlist(contentId, [options={}])` (top-level; método de objeto) - Remove um conteúdo da watchlist do utilizador. A função aponta a associação pelo conteúdo e deixa a API validar se a watchlist pertence à sessão atual. Entradas: contentId: Identificador do conteúdo a remover da watchlist. Devolve: Resultado da remoção devolvido pela API.
- `listHistory([pagination={}], [options={}])` (top-level; método de objeto) - Lista o histórico de reprodução do utilizador autenticado. A chamada alimenta páginas de biblioteca e progresso sem expor dados de outros utilizadores no frontend. Entradas: sem entradas explícitas. Devolve: Histórico pessoal devolvido pela API.

### `real_dev/frontend/src/services/api/metricsApi.js`

- `buildMetricsQuery([filters={}])` (top-level; função) - Constrói query string ignorando filtros vazios. Entradas: filters: Filtros da UI. Devolve: Query string pronta para anexar ao endpoint.
- `getAdminMetrics([filters={}], [options={}])` (top-level; método de objeto) - Lê metricas admin agregadas. Entradas: filters: Filtros opcionais. Devolve: Metricas agregadas.
- `exportCsv([filters={}], [options={}])` (top-level; método de objeto) - Descarrega o CSV privado usando cookies HttpOnly através do cliente comum. Entradas: filters: Intervalo civil UTC; options: Opções canceláveis. Devolve: Ficheiro e nome do backend.

### `real_dev/frontend/src/services/api/notificationsApi.js`

- `list([options={}])` (top-level; método de objeto) - Lista notificações do utilizador autenticado. Entradas: sem entradas explícitas. Devolve: Notificações recentes.
- `markAsRead(id, [options={}])` (top-level; método de objeto) - Marca uma notificação como lida. Entradas: id: Identificador da notificação. Devolve: Notificação atualizada.
- `getPreferences([options={}])` (top-level; método de objeto) - Obtem preferências de notificação. Entradas: sem entradas explícitas. Devolve: Preferências atuais.
- `updatePreferences(input, [options={}])` (top-level; método de objeto) - Atualiza preferências de notificação no backend. Entradas: input: Preferências escolhidas pelo utilizador. Devolve: Preferências guardadas.

### `real_dev/frontend/src/services/api/paymentsApi.js`

- `idempotentOptions([{...}={}])` (top-level; função) - Acrescenta a chave idempotente sem a expor no corpo financeiro. Entradas: options: Opções do pedido. Devolve: Opções HTTP com o header fechado.
- `simulatedCheckout(input, [options={}])` (top-level; método de objeto) - Pede ao backend para executar um checkout com método de teste. Entradas: input: Plano, método de teste e resultado simulado. Devolve: Resultado devolvido pela API.
- `startTrial([options={}])` (top-level; método de objeto) - Inicia trial gratuito do utilizador autenticado. Entradas: sem entradas explícitas. Devolve: Trial e subscrição temporária.

### `real_dev/frontend/src/services/api/playbackApi.js`

- `getPlayback(contentId, [options={}])` (top-level; método de objeto) - Obtém o estado de reprodução de um conteúdo. A API devolve progresso, preferências e dados necessários para retomar a experiência de visualização do utilizador autenticado. Entradas: contentId: Identificador do conteúdo a reproduzir. Devolve: Estado de reprodução devolvido pela API.
- `saveProgress(contentId, currentTimeSeconds, [options={}])` (top-level; método de objeto) - Guarda o ponto de progresso atual de um conteúdo. O tempo é enviado em segundos para o backend poder reconstruir a posição quando o utilizador regressar ao mesmo conteúdo. Entradas: contentId: Identificador do conteúdo em reprodução; currentTimeSeconds: Posição atual do leitor em segundos. Devolve: Progresso persistido devolvido pela API.
- `listContinueWatching([pagination={}], [options={}])` (top-level; método de objeto) - Lista conteúdos que o utilizador pode continuar a ver. A função consulta a fila pessoal calculada pelo backend a partir do histórico de progresso. Entradas: sem entradas explícitas. Devolve: Lista "continuar a ver" devolvida pela API.
- `getPreferences()` (top-level; método de objeto) - Obtém as preferências globais de reprodução da conta. Estas preferências alimentam opções como legendas, áudio ou comportamento padrão do leitor. Entradas: sem entradas explícitas. Devolve: Preferências de reprodução devolvidas pela API.
- `savePreferences(input, [options={}])` (top-level; método de objeto) - Atualiza as preferências globais de reprodução da conta. O objeto recebido vem da UI de preferências e é validado no backend antes de ser persistido. Entradas: input: Preferências escolhidas pelo utilizador. Devolve: Preferências atualizadas devolvidas pela API.

### `real_dev/frontend/src/services/api/privacyApi.js`

- `exportMyData([options={}])` (top-level; método de objeto) - Pede a exportacao JSON dos dados do utilizador autenticado. Entradas: sem entradas explícitas. Devolve: Exportacao devolvida pelo backend.
- `deleteMyAccount(input)` (top-level; método de objeto) - Elimina a propria conta com confirmacao textual e password atual. Entradas: input: Prova forte recebida da UI. Devolve: Resultado da eliminacao.
- `getMyConsents([options={}])` (top-level; método de objeto) - Lê consentimentos atuais do utilizador autenticado. Entradas: sem entradas explícitas. Devolve: Estado de consentimentos.
- `updateMyConsents(input, [options={}])` (top-level; método de objeto) - Atualiza consentimentos opcionais. Entradas: input: Escolhas de consentimento. Devolve: Estado atualizado.

### `real_dev/frontend/src/services/api/ratingsApi.js`

- `getSummary(contentId, options)` (top-level; método de objeto) - Obtém o resumo público de avaliações de um conteúdo. O identificador é codificado no URL para pedir ao backend a média, total e distribuição agregada sem expor avaliações individuais. Entradas: contentId: Identificador do conteúdo avaliado; [options]: Opções de transporte, incluindo cancelamento. Devolve: Resumo de avaliações devolvido pela API.
- `getMine(contentId, options)` (top-level; método de objeto) - Obtém a avaliação do utilizador autenticado para um conteúdo. A sessão é enviada por cookie HttpOnly pelo `apiClient`, por isso a função só precisa do identificador do conteúdo. Entradas: contentId: Identificador do conteúdo avaliado; [options]: Opções de transporte, incluindo cancelamento. Devolve: Avaliação pessoal devolvida pela API.
- `save(contentId, value, options)` (top-level; método de objeto) - Guarda ou atualiza a avaliação do utilizador autenticado. O valor é enviado no corpo do pedido, enquanto o conteúdo avaliado segue no URL para o backend aplicar autorização e validação de domínio. Entradas: contentId: Identificador do conteúdo avaliado; value: Valor da avaliação escolhido na interface; [options]: Opções de transporte, incluindo cancelamento. Devolve: Avaliação persistida devolvida pela API.
- `remove(contentId, options)` (top-level; método de objeto) - Remove a avaliação do utilizador autenticado para um conteúdo. A função apenas indica o conteúdo alvo; o backend usa a sessão para saber qual avaliação pessoal deve ser removida. Entradas: contentId: Identificador do conteúdo avaliado; [options]: Opções de transporte, incluindo cancelamento. Devolve: Resultado da remoção devolvido pela API.

### `real_dev/frontend/src/services/api/recommendationsApi.js`

- `mine([options={}])` (top-level; método de objeto) - Obtém recomendações do utilizador autenticado através do cliente API central. Entradas: sem entradas explícitas. Devolve: Dados devolvidos pelo backend.

### `real_dev/frontend/src/services/api/searchApi.js`

- `buildSearchParams(input)` (top-level; função) - Constrói os parâmetros de query para a pesquisa de conteúdos. A função centraliza os defaults de paginação e ordenação para a UI não montar URLs manualmente em cada chamada de pesquisa. Entradas: input: Filtros escolhidos pelo utilizador. Devolve: Parâmetros serializáveis para a rota de pesquisa.
- `search(input, [options={}])` (top-level; método de objeto) - Executa uma pesquisa no catálogo. Os filtros recebidos da interface são convertidos por `buildSearchParams` antes de chamar a API. Entradas: input: Filtros de pesquisa; [options]: Cancelamento do pedido atual. Devolve: Resultados paginados devolvidos pela API.

### `real_dev/frontend/src/services/api/subscriptionsApi.js`

- `listPlans([options={}])` (top-level; método de objeto) - Lista os planos de subscrição disponíveis para escolha pública. A resposta vem do backend para manter preços, ciclos e limites familiares sincronizados com as regras comerciais atuais. Entradas: sem entradas explícitas. Devolve: Planos ativos públicos.
- `getMine([options={}])` (top-level; método de objeto) - Obtém a subscrição associada à sessão atual. Usa os cookies HttpOnly enviados pelo `apiClient`, por isso não recebe token nem identificador de utilizador como argumento. Entradas: sem entradas explícitas. Devolve: Estado da subscrição do utilizador autenticado.
- `cancelRenewal([options={}])` (top-level; método de objeto) - Cancela a renovação automática da subscrição atual. A chamada não apaga imediatamente o acesso; pede ao backend para marcar a subscrição como não renovável no fim do período contratado. Entradas: sem entradas explícitas. Devolve: Subscrição atualizada com renovação cancelada.
- `getFamily([options={}])` (top-level; método de objeto) - Obtém o estado do grupo familiar ligado à subscrição atual. Devolve membros, convites pendentes e permissões que a interface usa para decidir se mostra ações de convite, remoção ou saída. Entradas: sem entradas explícitas. Devolve: Estado familiar do utilizador autenticado.
- `inviteFamilyMember(input, [options={}])` (top-level; método de objeto) - Convida uma conta existente para o plano Familia. Entradas: input: Email da conta convidada. Devolve: Convite criado e estado familiar atualizado.
- `acceptFamilyInvitation(invitationId, [options={}])` (top-level; método de objeto) - Aceita um convite familiar pendente. O identificador é colocado no URL para o backend validar se o convite ainda existe, pertence ao utilizador autenticado e pode ser aceite. Entradas: invitationId: Identificador do convite familiar. Devolve: Estado familiar atualizado depois da aceitação.
- `declineFamilyInvitation(invitationId, [options={}])` (top-level; método de objeto) - Recusa um convite familiar pendente. A operação informa o backend de que o convite não deve continuar disponível para a conta autenticada. Entradas: invitationId: Identificador do convite familiar. Devolve: Estado familiar atualizado depois da recusa.
- `removeFamilyMember(memberId, [options={}])` (top-level; método de objeto) - Remove um membro do grupo familiar. Só envia o identificador do membro; a autorização para remover esse membro é sempre confirmada no backend com base na sessão atual. Entradas: memberId: Identificador do utilizador membro. Devolve: Estado familiar atualizado sem o membro removido.
- `leaveFamily([options={}])` (top-level; método de objeto) - Remove a conta autenticada do grupo familiar atual. Esta ação representa a saída voluntária do utilizador, sem permitir escolher outro membro por engano a partir do frontend. Entradas: sem entradas explícitas. Devolve: Estado familiar depois da saída.

### `real_dev/frontend/src/services/api/userApi.js`

- `buildUserFilters([filters={}])` (top-level; função) - Constrói query string da listagem admin. Entradas: filters: Filtros da UI. Devolve: Query string.
- `getMe([options={}])` (top-level; método de objeto) - Obtém o perfil da conta autenticada. A sessão é resolvida pelo backend através dos cookies enviados pelo `apiClient`, sem o frontend transportar tokens. Entradas: sem entradas explícitas. Devolve: Perfil do utilizador autenticado.
- `updateMe(input, [options={}])` (top-level; método de objeto) - Atualiza dados editáveis do perfil da conta autenticada. O payload vem do formulário de conta e a API decide que campos podem ser alterados pelo próprio utilizador. Entradas: input: Dados de perfil a atualizar. Devolve: Perfil atualizado devolvido pela API.
- `updateParental(parentalMaxAgeRating, [options={}])` (top-level; método de objeto) - Atualiza o limite parental da conta autenticada. O valor máximo permitido segue no corpo do pedido para o backend aplicar validação e persistência segura. Entradas: parentalMaxAgeRating: Limite etário máximo escolhido. Devolve: Perfil parental atualizado devolvido pela API.
- `listUsers([filters={}], [options={}])` (top-level; método de objeto) - Lista contas para a área administrativa de utilizadores. Os filtros recebidos pelo formulário são serializados para query string, deixando a paginação e pesquisa efetiva a cargo da API. Entradas: filters: Filtros opcionais de pesquisa e paginação. Devolve: Lista de utilizadores devolvida pela API.
- `updateRole(userId, role)` (top-level; método de objeto) - Atualiza o papel administrativo de uma conta. A função envia o identificador no URL e o novo papel no corpo, deixando a API aplicar autorização administrativa. Entradas: userId: Identificador da conta a alterar; role: Novo papel atribuído à conta. Devolve: Utilizador atualizado devolvido pela API.
- `updateUserAdmin(userId, input, [options={}])` (top-level; método de objeto) - Atualiza role e/ou estado operacional pela rota admin MF5. Entradas: userId: Identificador do utilizador alvo; input: Alteracao admin. Devolve: Resultado devolvido pelo backend.

### `real_dev/frontend/src/utils/authRedirect.js`

- `containsControlCharacters(value)` (top-level; função) - Deteta caracteres ASCII de controlo sem os introduzir num padrão regex. Entradas: value: Valor a inspecionar. Devolve: Verdadeiro quando contém U+0000..U+001F ou U+007F.
- `isSafeInternalPath(value)` (exportada; função) - Confirma se um destino de redirecionamento é interno à aplicação. Entradas: value: Valor recebido do query string ou da rota atual. Devolve: Verdadeiro quando o destino pode ser usado com segurança.
- `getSafeRedirectPath(value)` (exportada; função) - Normaliza um destino de retorno depois do login. Entradas: value: Valor a validar. Devolve: Caminho interno seguro ou null.
- `getDefaultAuthenticatedPath(user)` (exportada; função) - Devolve a landing padrão adequada à role confirmada pelo backend. Entradas: user: Utilizador autenticado. Devolve: Landing interna da sessão.
- `resolveAuthenticatedPath(user, [requestedPath=null])` (exportada; função) - Centraliza a precedência entre um `next` seguro e a landing da role. Entradas: user: Utilizador autenticado; requestedPath: Destino opcional recebido do fluxo de login. Devolve: Destino final interno.
- `buildLoginRedirectPath(returnTo)` (exportada; função) - Constrói a rota de login com destino interno de retorno. Entradas: returnTo: Caminho interno para abrir depois de autenticar. Devolve: Rota de login com query string `next`.

### `real_dev/frontend/src/utils/catalogEditorModel.js`

- `emptyCatalogForm()` (exportada; função) - Função documentada na implementação atual. Entradas: sem entradas explícitas. Devolve: Formulário editorial independente.
- `contentToCatalogForm(content)` (exportada; função) - Converte o contrato administrativo no estado controlado do formulário. Entradas: content: Conteúdo devolvido pela API. Devolve: Formulário editorial.
- `catalogFormToPayload(form)` (exportada; função) - Produz exclusivamente o payload permitido pelas mutações editoriais. Entradas: form: Estado do formulário. Devolve: Payload sem fontes privadas de media.
- `catalogFormSnapshot(form)` (exportada; função) - Cria uma representação determinística para detetar alterações editoriais. Entradas: form: Formulário atual. Devolve: Snapshot comparável.

### `real_dev/frontend/src/utils/contentTypeLabels.js`

- `formatContentType(type)` (exportada; função) - Converte o tipo técnico do backend numa label visível ao utilizador. Os valores `movie`, `series`, `episode` e `documentary` continuam a ser o contrato interno da API; esta função limita a tradução à camada de UI. Entradas: type: Tipo técnico recebido do backend. Devolve: Label PT-PT, ou o valor original quando o tipo é desconhecido.
