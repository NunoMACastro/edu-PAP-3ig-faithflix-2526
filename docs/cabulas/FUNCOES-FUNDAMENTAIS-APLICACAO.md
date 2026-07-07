# Funções Fundamentais Da Aplicação - FaithFlix

Data do levantamento: 2026-07-07
Base do levantamento: `real_dev/backend/src` e `real_dev/frontend/src`

## Critérios

- A lista foi extraída por AST a partir do código real em `real_dev`.
- Inclui funções/métodos nomeados de runtime com JSDoc: controllers, services, componentes React, páginas, clientes HTTP, middlewares, validators e helpers nomeados.
- Inclui helpers privados quando fazem validação, autorização, transformação de dados, segurança, persistência ou suporte operacional relevante.
- Exclui testes, callbacks anónimos inline, artefactos gerados, `node_modules`, `dist`, reports e construtores.
- Cada entrada mostra a assinatura curta, o tipo de símbolo, a descrição principal, as entradas documentadas e o valor devolvido.

## Resumo

- Backend: 425 funções/métodos em 87 ficheiros.
- Frontend: 184 funções/métodos em 70 ficheiros.
- Total: 609 funções/métodos fundamentais listados.

## Backend

### `real_dev/backend/src/app.js`

- `createApp()` (exportada; função) - Cria a aplicação Express com middlewares e routers principais. Entradas: sem entradas explícitas. Devolve: Aplicação configurada.

### `real_dev/backend/src/config/cors.js`

- `parseAllowedOrigins(value)` (top-level; função) - Interpreta uma lista de origens separadas por vírgulas a partir de uma variável de ambiente. Entradas: `value`: Valor bruto de `process.env.FRONTEND_ORIGIN`. Devolve: Lista de origens de navegador permitidas.

### `real_dev/backend/src/config/database.js`

- `getDb()` (exportada; função) - Devolve a base de dados MongoDB configurada, reutilizando uma ligação de cliente. Entradas: sem entradas explícitas. Devolve: Base de dados MongoDB usada pelo backend FaithFlix.
- `setDbForTests(db)` (exportada; função) - Substitui a base de dados usada pelos serviços durante suites node:test. Entradas: `db`: Duplo de teste, ou null para restaurar MongoDB. Devolve: Valor documentado como `void`.

### `real_dev/backend/src/config/env.js`

- `loadLocalEnvFile()` (top-level; função) - Carrega o `.env` local do backend antes de ler `process.env`. A API nativa do Node respeita variaveis ja exportadas no ambiente, mantendo overrides explicitos de CI/deploy acima dos valores locais de desenvolvimento. Entradas: sem entradas explícitas. Devolve: Valor documentado como `void`.
- `parsePort(value)` (top-level; função) - Converte a variável de ambiente PORT num número de porta TCP seguro. Entradas: `value`: Valor bruto lido de `process.env.PORT`. Devolve: Número de porta válido para usar pelo servidor HTTP.

### `real_dev/backend/src/config/session.js`

- `getSessionCookieOptions(overrides)` (exportada; função) - Constrói opções seguras para o cookie de sessão FaithFlix. Entradas: `[overrides={}]`: Opções que substituem intencionalmente os defaults. Devolve: Opções de cookie usadas ao definir ou limpar o cookie de sessão.

### `real_dev/backend/src/middlewares/cors.middleware.js`

- `corsMiddleware(req, res, next)` (exportada; função) - Adiciona cabeçalhos CORS para as origens frontend configuradas. Entradas: `req`: Pedido HTTP atual.; `res`: Resposta HTTP onde os cabeçalhos CORS podem ser definidos.; `next`: Callback Express usado para continuar a pipeline. Devolve: Termina pedidos preflight ou continua pedidos normais.

### `real_dev/backend/src/middlewares/error.middleware.js`

- `notFoundHandler(req, _res, next)` (exportada; função) - Converte pedidos sem rota correspondente num erro JSON 404. Entradas: `req`: Pedido HTTP atual.; `_res`: Objeto de resposta não usado.; `next`: Callback Express usado para encaminhar o erro criado. Devolve: Valor documentado como `void`.
- `errorHandler(error, req, res, _next)` (exportada; função) - Converte erros lançados em respostas JSON seguras e logs estruturados. Entradas: `error`: Erro recebido de rotas ou middlewares.; `req`: Pedido HTTP atual.; `res`: Resposta HTTP usada para devolver o erro JSON.; `_next`: Callback Express não usado, exigido pela assinatura de middleware de erro. Devolve: Resposta Express com erro normalizado.

### `real_dev/backend/src/middlewares/request-logger.middleware.js`

- `requestLogger(req, res, next)` (exportada; função) - Adiciona um id de pedido, expõe-no na resposta e regista a conclusão do pedido. Entradas: `req`: Pedido HTTP atual.; `res`: Resposta HTTP onde `x-request-id` é definido.; `next`: Callback Express usado para continuar a pipeline. Devolve: Valor documentado como `void`.

### `real_dev/backend/src/middlewares/session.middleware.js`

- `attachSession(req, _res, next)` (exportada; função) - Associa o estado atual da sessão ao pedido Express. Entradas: `req`: Pedido HTTP atual.; `_res`: Objeto de resposta não usado.; `next`: Callback Express usado para continuar ou encaminhar erros. Devolve: Termina depois de associar o estado da sessão.

### `real_dev/backend/src/modules/admin-metrics/admin-metrics.controller.js`

- `getMetrics(req, res)` (exportada; função) - Devolve metricas administrativas agregadas. Entradas: `req`: Pedido HTTP.; `res`: Resposta HTTP. Devolve: Resposta com metricas.

### `real_dev/backend/src/modules/admin-metrics/admin-metrics.service.js`

- `count(db, collectionName, query)` (top-level; função) - Conta documentos sem devolver detalhes individuais. Entradas: `db`: Ligacao MongoDB.; `collectionName`: Nome da colecao.; `[query={}]`: Filtro MongoDB. Devolve: Total encontrado.
- `sumCents(db, collectionName, match, field)` (top-level; função) - Soma um campo em centimos mantendo resposta agregada. Entradas: `db`: Ligacao MongoDB.; `collectionName`: Nome da colecao.; `match`: Filtro MongoDB.; `field`: Campo numerico. Devolve: Soma em centimos.
- `getAdminMetrics(query)` (exportada; função) - Calcula metricas administrativas de operacao sem expor dados pessoais. Entradas: `query`: Query string validavel. Devolve: Metricas agregadas.

### `real_dev/backend/src/modules/admin-metrics/admin-metrics.validation.js`

- `optionalDate(value, field)` (top-level; função) - Converte uma data opcional da query string. Entradas: `value`: Valor recebido.; `field`: Nome do campo. Devolve: Data validada.
- `assertMetricsRange(query)` (exportada; função) - Valida intervalo temporal de metricas admin. Entradas: `query`: Query string recebida. Devolve: Intervalo validado.

### `real_dev/backend/src/modules/auth/auth.controller.js`

- `setSessionCookie(res, token)` (top-level; função) - Escreve o cookie de sessão usando as opções seguras definidas na MF1. Entradas: `res`: Resposta HTTP.; `token`: Token opaco de sessão. Devolve: Valor documentado como `void`.
- `register(req, res)` (exportada; função) - Regista um utilizador e inicia uma sessão. Entradas: `req`: Pedido com dados de registo.; `res`: Resposta usada para definir o cookie. Devolve: Resposta de utilizador criado.
- `login(req, res)` (exportada; função) - Autentica um utilizador e inicia uma sessão. Entradas: `req`: Pedido com dados de login.; `res`: Resposta usada para definir o cookie. Devolve: Resposta de utilizador autenticado.
- `forgotPassword(req, res)` (exportada; função) - Cria um pedido de recuperação de password. Entradas: `req`: Pedido com dados de email.; `res`: Resposta HTTP. Devolve: Resposta genérica de recuperação.
- `resetPasswordController(req, res)` (exportada; função) - Repõe a palavra-passe usando um token de recuperação válido. Entradas: `req`: Pedido com token e password.; `res`: Resposta HTTP. Devolve: Resposta de sucesso.

### `real_dev/backend/src/modules/auth/auth.indexes.js`

- `ensureAuthIndexes()` (exportada; função) - Garante que existem os índices exigidos pelos fluxos de autenticação. Entradas: sem entradas explícitas. Devolve: Termina depois de o MongoDB criar ou confirmar índices.

### `real_dev/backend/src/modules/auth/auth.middleware.js`

- `requireAuth(req, res, next)` (exportada; função) - Exige um utilizador autenticado válido no pedido atual. Entradas: `req`: Pedido atual.; `res`: Resposta HTTP.; `next`: Callback do próximo middleware. Devolve: Continua ou devolve 401.
- `requireRole(allowedRoles)` (exportada; função) - Exige que o utilizador autenticado tenha uma das roles permitidas. Entradas: `allowedRoles`: Roles aceites pela rota protegida. Devolve: Middleware Express.

### `real_dev/backend/src/modules/auth/auth.password.js`

- `hashPassword(password)` (exportada; função) - Cria o hash da palavra-passe com salt aleatório usando `scrypt` do Node. Entradas: `password`: Palavra-passe em texto claro recebida no registo ou reset. Devolve: Representação guardada no formato `salt:hash`.
- `verifyPassword(password, storedHash)` (exportada; função) - Compara uma palavra-passe com o valor guardado no formato `salt:hash`. Entradas: `password`: Palavra-passe em texto claro a verificar.; `storedHash`: Valor persistido no formato `salt:hash`. Devolve: Verdadeiro quando a password corresponde.

### `real_dev/backend/src/modules/auth/auth.service.js`

- `isDevResetOutboxEnabled()` (top-level; função) - Verifica se a outbox dev-only separada de tokens de recuperação está ativa. Entradas: sem entradas explícitas. Devolve: Verdadeiro apenas em ambientes não produtivos com a flag explícita ativa.
- `writeDevResetOutbox(db, {...})` (top-level; função) - Guarda o token de recuperação original numa outbox dev-only separada para evidência PAP. Entradas: `db`: Base de dados MongoDB.; `tokenData`: Dados de evidência do token de recuperação. Devolve: Termina depois de escrever opcionalmente a entrada da outbox.
- `registerUser(input)` (exportada; função) - Regista um utilizador e cria a sessão autenticada inicial. Entradas: `input`: Dados de registo. Devolve: Utilizador público e token de sessão.
- `loginUser(input)` (exportada; função) - Autentica um utilizador com email e password. Entradas: `input`: Dados de login. Devolve: Utilizador público e token de sessão.
- `requestPasswordReset(input, options)` (exportada; função) - Cria um token de recuperação de password quando o email existe. Entradas: `input`: Dados de recuperação de password.; `[options]`: Dependências opcionais para testes. Devolve: Resposta pública genérica.
- `getLatestDevPasswordResetToken(emailInput, options)` (exportada; função) - Lê o token de recuperação mais recente da outbox dev-only separada. Entradas: `emailInput`: Email cujo token dev de recuperação mais recente deve ser lido.; `[options]`: Dependências opcionais para testes. Devolve: Registo dev-only mais recente do token.
- `resetPassword(input)` (exportada; função) - Substitui uma password usando um token válido ainda não usado. Entradas: `input`: Dados de reset. Devolve: Mensagem de sucesso.

### `real_dev/backend/src/modules/auth/auth.validation.js`

- `normalizeEmail(email)` (exportada; função) - Normaliza um email antes da validação ou pesquisa. Entradas: `email`: Valor bruto de email recebido no pedido. Devolve: Email sem espaços laterais e em minúsculas.
- `assertValidName(name)` (exportada; função) - Valida e devolve o nome público do utilizador. Entradas: `name`: Valor bruto do nome. Devolve: Nome válido sem espaços laterais.
- `assertValidEmail(email)` (exportada; função) - Valida e devolve um email normalizado. Entradas: `email`: Valor bruto do email. Devolve: Email válido e normalizado.
- `assertValidPassword(password)` (exportada; função) - Valida e devolve uma password. Entradas: `password`: Valor bruto da password. Devolve: Palavra-passe válida.

### `real_dev/backend/src/modules/auth/session.controller.js`

- `getCurrentSession(req, res)` (exportada; função) - Devolve a sessão atualmente autenticada, quando existe. Entradas: `req`: Pedido HTTP atual.; `res`: Resposta HTTP usada para devolver dados da sessão. Devolve: Resposta JSON que descreve o estado da sessão.
- `logout(req, res)` (exportada; função) - Limpa o cookie de sessão e devolve resposta de logout com sucesso. Entradas: `req`: Pedido HTTP atual.; `res`: Resposta HTTP onde o cookie expirado é escrito. Devolve: Resposta vazia que confirma logout.

### `real_dev/backend/src/modules/auth/session.service.js`

- `toPublicUser(user)` (exportada; função) - Converte um documento interno de utilizador para o formato público de sessão. Entradas: `user`: MongoDB user document. Devolve: Dados públicos do utilizador.
- `canAuthenticate(user)` (top-level; função) - Verifica se uma conta pode manter uma sessao autenticada. Entradas: `user`: Documento de utilizador. Devolve: Verdadeiro apenas para contas operacionais.
- `createSession(user)` (exportada; função) - Cria uma sessão no servidor e devolve o token opaco do cookie. Entradas: `user`: Documento de utilizador que recebe a nova sessão. Devolve: Token opaco de sessão para guardar no cookie HttpOnly.
- `resolveSession(sessionToken)` (exportada; função) - Resolve um token de sessão para o utilizador público autenticado. Entradas: `sessionToken`: Token read from the session cookie. Devolve: Sessão resolvida ou null.
- `deleteSession(sessionToken)` (exportada; função) - Apaga uma sessão no servidor pelo token do cookie. Entradas: `sessionToken`: Token lido do pedido atual. Devolve: Termina depois de apagar ou ignorar a sessão.

### `real_dev/backend/src/modules/auth/token.js`

- `createOpaqueToken()` (exportada; função) - Cria um token opaco sem dados de utilizador embutidos. Entradas: sem entradas explícitas. Devolve: Random token suitable for session or reset flows.
- `isOpaqueToken(token)` (exportada; função) - Verifica se um valor parece um token opaco FaithFlix. Entradas: `token`: Valor bruto do token. Devolve: Verdadeiro for 64-character hexadecimal tokens.
- `hashToken(token)` (exportada; função) - Cria o hash de um token antes de o guardar ou pesquisar. Entradas: `token`: Valor do token opaco. Devolve: Hash SHA-256 do token.

### `real_dev/backend/src/modules/biblical-passages/biblical-passages.controller.js`

- `getBiblicalPassages(req, res)` (exportada; função) - Lista passagens bíblicas publicadas. Entradas: `req`: Pedido HTTP.; `res`: Resposta HTTP. Devolve: Resposta JSON.
- `getBiblicalPassage(req, res)` (exportada; função) - Obtém uma passagem bíblica publicada. Entradas: `req`: Pedido HTTP.; `res`: Resposta HTTP. Devolve: Resposta JSON.
- `getAdminBiblicalPassages(req, res)` (exportada; função) - Lista passagens bíblicas para gestão editorial. Entradas: `req`: Pedido HTTP.; `res`: Resposta HTTP. Devolve: Resposta JSON.
- `postBiblicalPassage(req, res)` (exportada; função) - Cria uma passagem bíblica como rascunho. Entradas: `req`: Pedido HTTP.; `res`: Resposta HTTP. Devolve: Resposta JSON.
- `patchBiblicalPassage(req, res)` (exportada; função) - Atualiza uma passagem bíblica existente. Entradas: `req`: Pedido HTTP.; `res`: Resposta HTTP. Devolve: Resposta JSON.
- `patchBiblicalPassageStatus(req, res)` (exportada; função) - Altera o estado editorial de uma passagem bíblica. Entradas: `req`: Pedido HTTP.; `res`: Resposta HTTP. Devolve: Resposta JSON.
- `getCatalogBiblicalPassages(req, res)` (exportada; função) - Lista passagens bíblicas publicadas associadas a um conteúdo publicado. Entradas: `req`: Pedido HTTP.; `res`: Resposta HTTP. Devolve: Resposta JSON.
- `getAdminCatalogBiblicalPassages(req, res)` (exportada; função) - Lista associações bíblicas de um conteúdo para gestão editorial. Entradas: `req`: Pedido HTTP.; `res`: Resposta HTTP. Devolve: Resposta JSON.
- `postCatalogBiblicalPassage(req, res)` (exportada; função) - Associa uma passagem bíblica a um conteúdo. Entradas: `req`: Pedido HTTP.; `res`: Resposta HTTP. Devolve: Resposta JSON.
- `deleteCatalogBiblicalPassage(req, res)` (exportada; função) - Remove a associação entre passagem bíblica e conteúdo. Entradas: `req`: Pedido HTTP.; `res`: Resposta HTTP. Devolve: Resposta JSON.

### `real_dev/backend/src/modules/biblical-passages/biblical-passages.service.js`

- `ensureBiblicalPassageIndexes()` (exportada; função) - Cria os índices usados pelo módulo de passagens. Entradas: sem entradas explícitas. Devolve: Termina depois da criação de índices.
- `formatBiblicalReference(passage)` (exportada; função) - Formata uma referência bíblica curta para a API pública. Entradas: `passage`: Documento da passagem. Devolve: Referência legível.
- `publicBiblicalPassage(passage, association)` (exportada; função) - Converte uma passagem interna numa resposta pública sem metadados editoriais. Entradas: `passage`: Documento interno.; `[association={}]`: Associação opcional. Devolve: Passagem pública.
- `adminBiblicalPassage(passage)` (top-level; função) - Converte uma passagem para resposta administrativa. Entradas: `passage`: Documento interno. Devolve: Passagem admin.
- `adminBiblicalPassageAssociation(passage, association, contentId)` (top-level; função) - Converte uma associação para gestão editorial. Entradas: `passage`: Passagem associada.; `association`: Documento de associação.; `contentId`: Conteúdo consultado. Devolve: Associação admin.
- `publishedContentQuery(idOrSlug)` (top-level; função) - Constrói uma query pública por ObjectId ou slug de conteúdo. Entradas: `idOrSlug`: Identificador de conteúdo. Devolve: Query MongoDB.
- `listPublishedBiblicalPassages(queryParams)` (exportada; função) - Lista passagens bíblicas já publicadas para consumo público. A função aplica paginação, ordena as passagens pela posição bíblica e converte cada documento MongoDB para o formato seguro exposto ao frontend, sem campos editoriais internos. Entradas: `queryParams`: Parâmetros opcionais de paginação recebidos da camada HTTP. Devolve: Página de passagens públicas.
- `getPublishedBiblicalPassage(passageId)` (exportada; função) - Obtém uma passagem publicada por id. Entradas: `passageId`: Id público. Devolve: Passagem pública.
- `listAdminBiblicalPassages(queryParams)` (exportada; função) - Lista passagens bíblicas para a área administrativa. Ao contrário da listagem pública, inclui todos os estados editoriais e devolve dados preparados para revisão, edição e publicação pela equipa de gestão. Entradas: `queryParams`: Parâmetros opcionais de paginação recebidos da camada HTTP. Devolve: Página de passagens administrativas.
- `createBiblicalPassage(input, userId)` (exportada; função) - Cria uma passagem bíblica como rascunho editorial. Entradas: `input`: Payload recebido.; `userId`: Editor autenticado. Devolve: Passagem criada.
- `updateBiblicalPassage(passageId, input, userId)` (exportada; função) - Atualiza os campos editoriais de uma passagem existente. Entradas: `passageId`: Id da passagem.; `input`: Payload recebido.; `userId`: Editor autenticado. Devolve: Passagem atualizada.
- `changeBiblicalPassageStatus(passageId, status, userId)` (exportada; função) - Altera o estado editorial de uma passagem. Entradas: `passageId`: Id da passagem.; `status`: Estado recebido.; `userId`: Editor autenticado. Devolve: Passagem atualizada.
- `listBiblicalPassagesForPublishedContent(idOrSlug)` (exportada; função) - Lista passagens publicadas associadas a um conteúdo publicado. Entradas: `idOrSlug`: Id ou slug público do conteúdo. Devolve: Passagens associadas.
- `listAdminBiblicalPassagesForContent(contentId)` (exportada; função) - Lista todas as associações de passagens de um conteúdo para administração. Entradas: `contentId`: Id do conteúdo. Devolve: Associações admin.
- `linkBiblicalPassageToContent(contentId, input, userId)` (exportada; função) - Associa uma passagem a um conteúdo existente de forma idempotente. Entradas: `contentId`: Id do conteúdo.; `input`: Payload recebido.; `userId`: Editor autenticado. Devolve: Associação pública.
- `unlinkBiblicalPassageFromContent(contentId, passageId)` (exportada; função) - Remove uma associação entre conteúdo e passagem. Entradas: `contentId`: Id do conteúdo.; `passageId`: Id da passagem. Devolve: Resultado.

### `real_dev/backend/src/modules/biblical-passages/biblical-passages.validation.js`

- `requiredText(value, field, min, max)` (top-level; função) - Normaliza texto obrigatório com limites explícitos. Entradas: `value`: Valor bruto.; `field`: Nome do campo para mensagens de erro.; `min`: Tamanho mínimo.; `max`: Tamanho máximo. Devolve: Texto seguro.
- `optionalText(value, max)` (top-level; função) - Normaliza texto opcional sem guardar strings gigantes. Entradas: `value`: Valor bruto.; `max`: Tamanho máximo. Devolve: Texto normalizado.
- `positiveInteger(value, field)` (top-level; função) - Valida inteiros positivos usados em capítulos e versículos. Entradas: `value`: Valor bruto.; `field`: Nome do campo. Devolve: Inteiro positivo.
- `asObjectId(value, field)` (exportada; função) - Converte um id público em ObjectId com erro de domínio. Entradas: `value`: Valor bruto.; `field`: Nome de domínio. Devolve: ObjectId MongoDB.
- `assertBiblicalPassageStatus(status)` (exportada; função) - Valida o estado editorial fechado de uma passagem. Entradas: `status`: Estado bruto. Devolve: Estado seguro.
- `assertReferenceRange(range)` (top-level; função) - Valida o intervalo bíblico para impedir referências invertidas. Entradas: `range`: Intervalo normalizado. Devolve: Valor documentado como `void`.
- `assertBiblicalPassagePayload(input)` (exportada; função) - Valida payload de criação/atualização de passagens bíblicas. Entradas: `input`: Dados recebidos. Devolve: Payload seguro para persistência.
- `assertBiblicalPassageAssociationPayload(input)` (exportada; função) - Valida payload de associação entre conteúdo e passagem. Entradas: `input`: Dados recebidos. Devolve: Payload seguro.
- `parseBiblicalPassagePagination(input)` (exportada; função) - Valida paginação das listas de passagens. Entradas: `input`: Query params recebidos. Devolve: Paginação segura.

### `real_dev/backend/src/modules/catalog/catalog.controller.js`

- `getCatalog(req, res)` (exportada; função) - Devolve conteudo publicado com paginacao publica segura. Entradas: `req`: Pedido HTTP com query params de paginacao.; `res`: Resposta HTTP enviada ao frontend. Devolve: Resposta com `items`, `page`, `limit` e `total`.
- `getAdminCatalog(_req, res)` (exportada; função) - Lista o catálogo completo para administração. Ao contrário da rota pública, devolve itens independentemente do estado editorial para permitir revisão e manutenção interna. Entradas: `_req`: Pedido Express não usado por esta rota.; `res`: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com itens administrativos.
- `postContent(req, res)` (exportada; função) - Cria um novo conteúdo editorial. O body traz os campos do formulário e o `user.id` identifica quem criou a entrada para efeitos de auditoria e revisões. Entradas: `req`: Pedido Express com body editorial e `user.id`.; `res`: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com o conteúdo criado.
- `patchContent(req, res)` (exportada; função) - Atualiza campos de um conteúdo existente. A função combina o identificador da rota, os campos recebidos no body e o autor autenticado antes de delegar a alteração no serviço. Entradas: `req`: Pedido Express com `params.id`, body e `user.id`.; `res`: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com o conteúdo atualizado.
- `patchContentStatus(req, res)` (exportada; função) - Altera o estado editorial de um conteúdo. O controller extrai o novo estado do body e mantém a validação da transição no serviço de catálogo. Entradas: `req`: Pedido Express com `params.id`, `body.status` e `user.id`.; `res`: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com o conteúdo atualizado.
- `getContentRevisions(req, res)` (exportada; função) - Lista revisões históricas de um conteúdo. A rota permite à administração consultar versões anteriores antes de escolher uma reversão. Entradas: `req`: Pedido Express com `params.id`.; `res`: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com revisões do conteúdo.
- `postContentRevisionRevert(req, res)` (exportada; função) - Reverte um conteúdo para uma revisão anterior. O controller passa conteúdo, revisão e utilizador ao serviço para que a reversão fique validada e auditável. Entradas: `req`: Pedido Express com `params.id`, `params.revisionId` e `user.id`.; `res`: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com o conteúdo restaurado.
- `getTaxonomies(_req, res)` (exportada; função) - Lista taxonomias disponíveis no catálogo. A rota serve tanto filtros como formulários editoriais, devolvendo a coleção normalizada pelo serviço de taxonomia. Entradas: `_req`: Pedido Express não usado por esta rota.; `res`: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com taxonomias.
- `postTaxonomy(req, res)` (exportada; função) - Cria uma nova taxonomia editorial. O body contém os campos submetidos pela administração e o serviço valida unicidade e formato antes da persistência. Entradas: `req`: Pedido Express com dados da taxonomia no body.; `res`: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com a taxonomia criada.
- `getCatalogDetail(req, res)` (exportada; função) - Devolve o detalhe público de um conteúdo publicado. O identificador pode ser id ou slug e o serviço garante que apenas conteúdos publicados são expostos nesta rota pública. Entradas: `req`: Pedido Express com `params.idOrSlug`.; `res`: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com o detalhe público.

### `real_dev/backend/src/modules/catalog/catalog.service.js`

- `asContentObjectId(id)` (top-level; função) - Converte um id de conteúdo num ObjectId MongoDB. Entradas: `id`: Id do conteúdo. Devolve: ObjectId MongoDB.
- `asRevisionObjectId(id)` (top-level; função) - Converte um id de revisão num ObjectId MongoDB. Entradas: `id`: Identificador da revisão. Devolve: ObjectId MongoDB.
- `publicContent(content)` (top-level; função) - Converte um documento interno de conteúdo para o formato público da API. Entradas: `content`: Documento de conteúdo MongoDB. Devolve: Conteúdo público.
- `publicRevision(revision)` (top-level; função) - Converte um documento interno de revisão para uma resposta segura da API. Entradas: `revision`: Revision document. Devolve: Revisão pública.
- `saveRevision(db, content, userId, action)` (top-level; função) - Guarda o estado anterior do conteúdo antes de uma alteração editorial. Entradas: `db`: Base de dados MongoDB.; `content`: Documento de conteúdo existente.; `userId`: Identificador do editor autenticado.; `action`: Etiqueta da ação de revisão. Devolve: Termina depois de inserir a revisão.
- `assertExistingTaxonomies(db, taxonomyIds)` (top-level; função) - Confirms all referenced taxonomies exist. Entradas: `db`: Base de dados MongoDB.; `taxonomyIds`: Ids de taxonomias referenciadas. Devolve: Termina quando todas as taxonomias existem.
- `ensureCatalogIndexes()` (exportada; função) - Garante que existem os índices usados por catálogo e revisões. Entradas: sem entradas explícitas. Devolve: Termina depois da criação de índices.
- `listPublishedCatalog(queryParams)` (exportada; função) - Lista conteudo publico publicado com paginacao segura. Entradas: `[queryParams={}]`: Query params recebidos pela rota publica. Devolve: Pagina publica do catalogo.
- `listAdminCatalog()` (exportada; função) - Lista itens de catálogo para roles editoriais. Entradas: sem entradas explícitas. Devolve: Itens administrativos do catálogo.
- `createContent(input, userId)` (exportada; função) - Cria um conteúdo em rascunho. Entradas: `input`: Dados do catálogo.; `userId`: Identificador do editor autenticado. Devolve: Conteúdo criado.
- `updateContent(contentId, input, userId)` (exportada; função) - Atualiza um conteúdo e guarda uma revisão do estado anterior. Entradas: `contentId`: Id do conteúdo.; `input`: Dados do catálogo.; `userId`: Identificador do editor autenticado. Devolve: Conteúdo atualizado.
- `changeContentStatus(contentId, status, userId)` (exportada; função) - Altera o estado de publicação de um conteúdo. Entradas: `contentId`: Id do conteúdo.; `estado`: Novo estado.; `userId`: Identificador do editor autenticado. Devolve: Conteúdo atualizado.
- `listContentRevisions(contentId)` (exportada; função) - Lista revisões de conteúdo. Entradas: `contentId`: Id do conteúdo. Devolve: Lista de revisões.
- `revertContentRevision(contentId, revisionId, userId)` (exportada; função) - Repõe conteúdo a partir de uma revisão anterior. Entradas: `contentId`: Id do conteúdo.; `revisionId`: Identificador da revisão.; `userId`: Identificador do editor autenticado. Devolve: Conteúdo atualizado.
- `buildPublishedDetailQuery(idOrSlug)` (top-level; função) - Constrói uma query de detalhe público para ObjectId ou slug. Entradas: `idOrSlug`: Identificador público. Devolve: Query MongoDB.
- `getPublishedContentDetail(idOrSlug)` (exportada; função) - Obtém o detalhe de um conteúdo publicado por id ou slug. Entradas: `idOrSlug`: Content id or slug. Devolve: Detalhe público.

### `real_dev/backend/src/modules/catalog/catalog.validation.js`

- `requiredText(value, field, min, max)` (top-level; função) - Valida campos de texto obrigatórios. Entradas: `value`: Valor bruto.; `field`: Field name used in the error message.; `[min=2]`: Minimum length.; `[max=160]`: Maximum length. Devolve: Texto sem espaços externos.
- `optionalText(value, max)` (top-level; função) - Normaliza texto opcional com tamanho máximo seguro. Entradas: `value`: Valor bruto.; `[max=500]`: Maximum length. Devolve: Texto opcional sem espaços externos.
- `positiveInteger(value, field)` (top-level; função) - Valida um campo inteiro positivo. Entradas: `value`: Valor bruto.; `field`: Field name. Devolve: Inteiro válido.
- `assertAgeRating(value)` (top-level; função) - Valida classificação etária entre 0 e 18. Entradas: `value`: Classificação etária bruta. Devolve: Classificação etária segura.
- `taxonomyObjectIds(value)` (top-level; função) - Converte ids de taxonomias para ObjectIds. Entradas: `value`: Lista bruta de ids de taxonomias. Devolve: Lista de ObjectId.
- `mediaTrack(track)` (top-level; função) - Valida uma faixa de legendas ou áudio. Entradas: `track`: Faixa bruta. Devolve: Faixa segura.
- `qualityOption(option)` (top-level; função) - Valida uma opção de qualidade. Entradas: `option`: Opção de qualidade bruta. Devolve: Opção de qualidade segura.
- `slugify(value)` (exportada; função) - Constrói um slug estável a partir de texto. Entradas: `value`: Texto bruto. Devolve: Slug seguro para URL.
- `assertMediaOptions(input)` (exportada; função) - Valida faixas media e opções de qualidade. Entradas: `input`: Opções media brutas. Devolve: Opções media seguras.
- `assertCatalogPayload(input)` (exportada; função) - Valida dados de criação/atualização de catálogo. Entradas: `input`: Dados brutos de catálogo. Devolve: Campos seguros do documento de catálogo.
- `assertStatus(status)` (exportada; função) - Valida estado de publicação de conteúdo. Entradas: `estado`: Estado bruto. Devolve: Estado seguro.
- `parseCatalogPagination(input)` (exportada; função) - Valida parametros publicos de paginacao do catalogo. Entradas: `input`: Query params brutos recebidos pela rota publica. Devolve: Pagina e limite normalizados.
- `assertTaxonomyPayload(input)` (exportada; função) - Valida dados de taxonomia. Entradas: `input`: Dados brutos de taxonomia. Devolve: Dados seguros de taxonomia.

### `real_dev/backend/src/modules/catalog/taxonomy.service.js`

- `publicTaxonomy(taxonomy)` (top-level; função) - Converte um documento de taxonomia para o formato público. Entradas: `taxonomy`: Documento de taxonomia. Devolve: Taxonomia pública.
- `ensureTaxonomyIndexes()` (exportada; função) - Garante que existem os índices de taxonomias. Entradas: sem entradas explícitas. Devolve: Termina depois da criação de índices.
- `listTaxonomies()` (exportada; função) - Lista taxonomias alfabeticamente. Entradas: sem entradas explícitas. Devolve: Lista pública de taxonomias.
- `createTaxonomy(input)` (exportada; função) - Cria uma taxonomia editorial no catálogo. A função valida o payload recebido, garante que os índices únicos existem, persiste o documento com metadados temporais e devolve apenas o formato público usado pelas restantes camadas da aplicação. Entradas: `input`: Dados brutos da taxonomia recebidos da camada HTTP. Devolve: Taxonomia criada.

### `real_dev/backend/src/modules/charities/charity-applications.controller.js`

- `postCharityApplication(req, res)` (exportada; função) - Recebe uma candidatura pública de associação. Entradas: `req`: Pedido com corpo da candidatura.; `res`: Resposta HTTP. Devolve: Valor documentado como `Promise<void>`.
- `getCharityApplications(req, res)` (exportada; função) - Lista candidaturas para administradores. Entradas: `req`: Pedido com filtro opcional `estado`.; `res`: Resposta HTTP. Devolve: Valor documentado como `Promise<void>`.
- `patchCharityApplicationReview(req, res)` (exportada; função) - Aplica uma decisão administrativa a uma candidatura pendente. Entradas: `req`: Pedido com `params.id`, `body` e `user.id`.; `res`: Resposta HTTP. Devolve: Valor documentado como `Promise<void>`.

### `real_dev/backend/src/modules/charities/charity-applications.service.js`

- `publicApplication(application)` (top-level; função) - Remove campos internos antes de devolver uma candidatura. Entradas: `application`: Documento da coleção `charity_applications`. Devolve: Candidatura pública para API/admin.
- `ensureCharityApplicationIndexes()` (exportada; função) - Cria índices necessários para listagem e controlo de duplicados pendentes. Entradas: sem entradas explícitas. Devolve: Valor documentado como `Promise<void>`.
- `submitCharityApplication(input)` (exportada; função) - Submete uma candidatura pública com estado inicial controlado. Entradas: `input`: Dados enviados pela associação. Devolve: Candidatura criada.
- `listCharityApplications(status)` (exportada; função) - Lista candidaturas para administradores, com filtro por estado. Entradas: `[status="pending"]`: Estado a listar ou `all`. Devolve: Candidaturas ordenadas por submissão.

### `real_dev/backend/src/modules/charities/charity-applications.validation.js`

- `httpError(message, statusCode)` (top-level; função) - Cria um erro HTTP controlado para validações da candidatura. Entradas: `message`: Mensagem segura para devolver ao cliente.; `[statusCode=400]`: Código HTTP associado. Devolve: Erro com `statusCode`.
- `requiredText(value, field, min, max)` (top-level; função) - Valida texto obrigatório com limites de tamanho. Entradas: `value`: Valor recebido no corpo do pedido.; `field`: Nome do campo para mensagem de erro.; `min`: Tamanho mínimo.; `max`: Tamanho máximo. Devolve: Texto normalizado.
- `optionalPublicUrl(value)` (top-level; função) - Normaliza website público opcional. Entradas: `value`: URL recebida no formulário. Devolve: URL normalizada ou string vazia.
- `assertCharityApplicationPayload(input)` (exportada; função) - Valida e filtra os campos aceites numa candidatura pública. Entradas: `input`: Corpo recebido em `POST /api/charities/applications`. Devolve: Dados seguros para persistir.

### `real_dev/backend/src/modules/charities/charity-reports.controller.js`

- `assertCanReadCharity(req, charityId)` (top-level; função) - Confirma se o utilizador pode ler o histórico de uma associação. Entradas: `req`: Pedido autenticado.; `charityId`: Identificador da associação consultada. Devolve: Valor documentado como `Promise<void>`.
- `getPoolDashboardController(_req, res)` (exportada; função) - Devolve painel agregado da pool para administradores. Entradas: `_req`: Pedido autenticado como admin.; `res`: Resposta HTTP. Devolve: Valor documentado como `Promise<void>`.
- `postCharityMember(req, res)` (exportada; função) - Liga um utilizador a uma associação por ação administrativa. Entradas: `req`: Pedido com `params.id`, `body.userId` e `user.id`.; `res`: Resposta HTTP. Devolve: Valor documentado como `Promise<void>`.
- `getCharityHistoryController(req, res)` (exportada; função) - Devolve histórico privado de uma associação depois de validar permissão. Entradas: `req`: Pedido com `params.id`.; `res`: Resposta HTTP. Devolve: Valor documentado como `Promise<void>`.
- `getCharityHistoryCsv(req, res)` (exportada; função) - Exporta histórico privado em CSV depois de validar permissão. Entradas: `req`: Pedido com `params.id`.; `res`: Resposta HTTP. Devolve: Valor documentado como `Promise<void>`.
- `getPublicCharities(_req, res)` (exportada; função) - Devolve associações públicas sem dados de contacto internos. Entradas: `_req`: Pedido público.; `res`: Resposta HTTP. Devolve: Valor documentado como `Promise<void>`.

### `real_dev/backend/src/modules/charities/charity-reports.service.js`

- `asObjectId(id, label)` (top-level; função) - Converte identificadores recebidos em `ObjectId` com erro de domínio. Entradas: `id`: Identificador recebido da rota, sessão ou corpo.; `label`: Nome usado na mensagem de erro. Devolve: Identificador MongoDB.
- `publicCharity(charity)` (top-level; função) - Remove contactos internos antes de expor uma associação publicamente. Entradas: `charity`: Documento da coleção `charities`. Devolve: Associação pública.
- `publicMembership(membership)` (top-level; função) - Normaliza uma ligação utilizador-associação para resposta da API. Entradas: `membership`: Documento da coleção `charity_memberships`. Devolve: Ligação pública.
- `ensureCharityReportIndexes()` (exportada; função) - Cria índices de pertença entre utilizadores e associações. Entradas: sem entradas explícitas. Devolve: Valor documentado como `Promise<void>`.
- `linkUserToCharity(charityId, userId, createdByUserId)` (exportada; função) - Liga um utilizador existente a uma associação elegível. Entradas: `charityId`: Identificador da associação.; `userId`: Identificador do utilizador que passará a consultar histórico.; `createdByUserId`: Identificador do admin que cria a ligação. Devolve: Ligação criada ou atualizada.
- `getMyCharityMembership(userId)` (exportada; função) - Obtém a associação ligada ao utilizador autenticado. Entradas: `userId`: Identificador do utilizador autenticado. Devolve: Documento de ligação.
- `getPoolDashboard()` (exportada; função) - Devolve os últimos meses de distribuição para painel admin. Entradas: sem entradas explícitas. Devolve: Totais mensais agregados.
- `getCharityHistory(charityId)` (exportada; função) - Devolve histórico de distribuições para uma associação. Entradas: `charityId`: Identificador da associação. Devolve: Histórico agregado.
- `listPublicCharities()` (exportada; função) - Lista associações elegíveis para a página pública. Entradas: sem entradas explícitas. Devolve: Associações sem contactos internos.
- `historyToCsv(history)` (exportada; função) - Converte histórico de uma associação para CSV simples. Entradas: `history`: Histórico devolvido por `getCharityHistory`. Devolve: CSV com cabeçalho e linhas de distribuição.

### `real_dev/backend/src/modules/charities/charity-review.service.js`

- `asObjectId(id, label)` (top-level; função) - Converte uma string para `ObjectId` com mensagem contextual. Entradas: `id`: Identificador recebido da rota ou sessão.; `label`: Nome usado na mensagem de erro. Devolve: Identificador MongoDB.
- `publicCharity(charity)` (top-level; função) - Remove campos internos antes de devolver uma associação aprovada. Entradas: `charity`: Documento da colecao `charities`. Devolve: Associação pública para API/admin.
- `ensureCharityIndexes()` (exportada; função) - Cria indices para impedir duplicação de entrada na pool. Entradas: sem entradas explícitas. Devolve: Valor documentado como `Promise<void>`.
- `reviewCharityApplication(applicationId, reviewerUserId, input)` (exportada; função) - Reve uma candidatura pendente e cria associação elegível quando aprovada. Entradas: `applicationId`: Identificador da candidatura.; `reviewerUserId`: Identificador do admin que decide.; `input`: Decisão recebida da UI. Devolve: Resultado da rejeição ou associação criada.
- `listEligibleCharities()` (exportada; função) - Lista associações ativas e elegíveis para distribuição solidária. Entradas: sem entradas explícitas. Devolve: Associações ordenadas por data de aprovação.

### `real_dev/backend/src/modules/charities/charity-review.validation.js`

- `httpError(message, statusCode)` (top-level; função) - Cria um erro HTTP previsivel para validação de revisão. Entradas: `message`: Mensagem segura para devolver ao cliente.; `[statusCode=400]`: Código HTTP associado. Devolve: Erro com `statusCode`.
- `assertReviewPayload(input)` (exportada; função) - Valida a decisão administrativa sobre uma candidatura. Entradas: `input`: Corpo recebido na rota de revisão.; `input.decision`: Decisão pretendida.; `[input.reason]`: Motivo, obrigatório em rejeicoes. Devolve: Decisão normalizada.

### `real_dev/backend/src/modules/charities/pool-distribution.controller.js`

- `postMonthlyDistribution(req, res)` (exportada; função) - Executa uma nova distribuição mensal por pedido admin. Entradas: `req`: Pedido com `body.month` e `user.id`.; `res`: Resposta HTTP. Devolve: Valor documentado como `Promise<void>`.
- `getMonthlyDistribution(req, res)` (exportada; função) - Devolve uma distribuição mensal existente. Entradas: `req`: Pedido com `params.month`.; `res`: Resposta HTTP. Devolve: Valor documentado como `Promise<void>`.

### `real_dev/backend/src/modules/charities/pool-distribution.service.js`

- `toPublicRun(run)` (top-level; função) - Converte uma distribuição mensal para o formato público da API. Entradas: `run`: Documento da colecao `pool_distributions`. Devolve: Distribuição sem campos internos.
- `splitCents(totalCents, charities)` (top-level; função) - Divide um total em cêntimos por associações, preservando a soma exata. Entradas: `totalCents`: Valor total da pool em cêntimos.; `charities`: Associações já ordenadas pela rotação deste mês. Devolve: Itens de distribuição.
- `nextRotationOffset(charities, lastRun)` (top-level; função) - Calcula o ponto de arranque da proxima rotação. Entradas: `charities`: Associações elegíveis ordenadas por aprovação.; `lastRun`: Ultima distribuição gravada. Devolve: Offset usado para rodar a lista.
- `ensurePoolDistributionIndexes()` (exportada; função) - Cria indices para idempotência mensal e consultas por associação. Entradas: sem entradas explícitas. Devolve: Valor documentado como `Promise<void>`.
- `runMonthlyDistribution(monthInput, createdByUserId)` (exportada; função) - Executa a distribuição mensal da pool solidária. Entradas: `monthInput`: Mês no formato `YYYY-MM`.; `createdByUserId`: Identificador do admin que executa a distribuição. Devolve: Distribuição persistida.
- `getDistributionByMonth(monthInput)` (exportada; função) - Consulta uma distribuição mensal já persistida. Entradas: `monthInput`: Mês no formato `YYYY-MM`. Devolve: Distribuição encontrada.

### `real_dev/backend/src/modules/charities/pool-distribution.validation.js`

- `httpError(message, statusCode)` (top-level; função) - Cria um erro HTTP previsivel para validação do mês de distribuição. Entradas: `message`: Mensagem segura para devolver ao cliente.; `[statusCode=400]`: Código HTTP associado. Devolve: Erro com `statusCode`.
- `assertDistributionMonth(month)` (exportada; função) - Valida o mês operacional da distribuição no formato `YYYY-MM`. Entradas: `month`: Valor recebido da API ou da UI. Devolve: Mês normalizado.

### `real_dev/backend/src/modules/comments/comments.controller.js`

- `getComments(req, res)` (exportada; função) - Lista comentários visíveis de um conteúdo. O controller entrega ao serviço o conteúdo da rota e a sessão atual, permitindo filtrar comentários conforme permissões ou estado de moderação. Entradas: `req`: Pedido Express com `params.contentId` e utilizador opcional.; `res`: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com comentários visíveis.
- `postComment(req, res)` (exportada; função) - Cria um comentário para o conteúdo indicado. A função recolhe autor, conteúdo e texto do pedido e delega no serviço a validação, moderação inicial e persistência. Entradas: `req`: Pedido Express com utilizador, conteúdo e `body.body`.; `res`: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com o comentário criado.
- `deleteCommentController(req, res)` (exportada; função) - Remove um comentário autorizado. O controller passa o utilizador, o papel e o comentário alvo para o serviço, que decide se a remoção pode ser feita pelo autor ou por administração. Entradas: `req`: Pedido Express com sessão e `params.commentId`.; `res`: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com o comentário removido.
- `patchCommentModeration(req, res)` (exportada; função) - Atualiza o estado de moderação de um comentário. A função lê a decisão e a justificação do body e deixa o serviço aplicar as regras de moderação antes de devolver o comentário atualizado. Entradas: `req`: Pedido Express com comentário alvo e decisão no body.; `res`: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com o comentário moderado.

### `real_dev/backend/src/modules/comments/comments.service.js`

- `assertPublishedContent(db, contentId)` (top-level; função) - Garante que comentários só podem apontar para conteúdo publicado. Entradas: `db`: Base de dados MongoDB.; `contentId`: ObjectId do conteúdo. Devolve: Documento de conteúdo publicado.
- `canDeleteComment(comment, viewer)` (top-level; função) - Verifica se o visualizador atual pode apagar um comentário sem expor ids de utilizadores. Entradas: `comment`: Documento de comentário MongoDB.; `viewer`: Visualizador atual, quando autenticado. Devolve: Verdadeiro quando o visualizador é dono do comentário ou pode moderá-lo.
- `publicComment(comment, viewer)` (exportada; função) - Converte um documento de comentário para o formato público da API. Entradas: `comment`: Documento de comentário MongoDB.; `[viewer=null]`: Visualizador atual, quando autenticado. Devolve: Comentário público.
- `ensureCommentIndexes()` (exportada; função) - Cria índices exigidos por listagem e moderação de comentários. Entradas: sem entradas explícitas. Devolve: Termina depois da criação de índices.
- `listVisibleComments(contentId, viewer)` (exportada; função) - Lista comentários visíveis de um conteúdo publicado. Entradas: `contentId`: Id público do conteúdo.; `[viewer=null]`: Visualizador atual, quando autenticado. Devolve: Comentários visíveis.
- `createComment(user, contentId, bodyValue)` (exportada; função) - Cria um comentário pertencente ao utilizador autenticado. Entradas: `user`: Utilizador autenticado.; `contentId`: Id público do conteúdo.; `bodyValue`: Corpo bruto do comentário. Devolve: Comentário criado.
- `deleteComment(userId, role, commentId)` (exportada; função) - Apaga um comentário quando o utilizador é dono ou tem permissões de moderação. Entradas: `userId`: Identificador do utilizador autenticado.; `role`: Role do utilizador autenticado.; `commentId`: Id público do comentário. Devolve: Estado de remoção.
- `moderateComment(commentId, statusValue, reasonValue)` (exportada; função) - Atualiza o estado de moderação de um comentário. Entradas: `commentId`: Id público do comentário.; `estadoValue`: Estado bruto de moderação.; `reasonValue`: Motivo opcional de moderação. Devolve: Comentário atualizado.

### `real_dev/backend/src/modules/comments/comments.validation.js`

- `asObjectId(id, label)` (exportada; função) - Converte um id público num ObjectId MongoDB. Entradas: `id`: Id bruto recebido dos parâmetros da rota ou da sessão.; `label`: Portuguese domain label used in validation errors. Devolve: ObjectId MongoDB seguro.
- `assertCommentBody(value)` (exportada; função) - Normaliza e valida um corpo curto de comentário em texto simples. Entradas: `value`: Corpo bruto recebido no pedido. Devolve: Corpo de comentário normalizado e seguro.
- `initialModerationFor(body)` (exportada; função) - Applies the minimal moderation rule defined for MF3. Entradas: `body`: Normalized comment body. Devolve: Estado inicial de moderação.
- `assertModerationStatus(value)` (exportada; função) - Valida um estado de moderação a partir da lista fechada da MF3. Entradas: `value`: Estado bruto de moderação. Devolve: Estado seguro de moderação.

### `real_dev/backend/src/modules/discovery/discovery.controller.js`

- `getDiscoveryHomeController(_req, res)` (exportada; função) - Devolve a composição da página inicial de descoberta. O pedido não precisa de parâmetros: o serviço agrega os blocos públicos que a home deve renderizar. Entradas: `_req`: Pedido Express não usado por esta rota.; `res`: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com os blocos de descoberta.
- `getRelatedContentController(req, res)` (exportada; função) - Devolve conteúdos relacionados com um item do catálogo. O identificador recebido na rota define o conteúdo de referência usado pelo serviço para calcular relações editoriais ou taxonómicas. Entradas: `req`: Pedido Express com `params.contentId`.; `res`: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com conteúdos relacionados.

### `real_dev/backend/src/modules/discovery/discovery.service.js`

- `publicDiscoveryCard(content)` (top-level; função) - Converte um documento de conteúdo num cartão de descoberta. Entradas: `content`: Documento de conteúdo MongoDB. Devolve: Cartão público de descoberta.
- `loadCards(db, match, sort, limit)` (top-level; função) - Carrega conteúdo publicado ordenado por uma regra simples de descoberta. Entradas: `db`: Base de dados MongoDB.; `match`: Additional match filters.; `sort`: Sort object.; `limit`: Maximum items to return. Devolve: Cartões públicos.
- `getDiscoveryHome()` (exportada; função) - Constrói os carrosséis públicos da página de descoberta. Entradas: sem entradas explícitas. Devolve: Resposta da página inicial de descoberta.
- `getRelatedContent(contentId)` (exportada; função) - Lista conteúdo relacionado por taxonomias partilhadas primeiro e tipo depois. Entradas: `contentId`: Id público do conteúdo. Devolve: Resposta de conteúdo relacionado.

### `real_dev/backend/src/modules/discovery/discovery.validation.js`

- `asObjectId(id, label)` (exportada; função) - Converte um id público num ObjectId MongoDB. Entradas: `id`: Id bruto recebido dos parâmetros da rota.; `label`: Portuguese domain label used in errors. Devolve: ObjectId seguro.

### `real_dev/backend/src/modules/integrations/integrations.controller.js`

- `getIntegrations(_req, res)` (exportada; função) - Lista integracoes configuraveis. Entradas: `_req`: Pedido HTTP.; `res`: Resposta HTTP. Devolve: Lista de integracoes.
- `patchIntegration(req, res)` (exportada; função) - Atualiza uma integracao por chave. Entradas: `req`: Pedido HTTP.; `res`: Resposta HTTP. Devolve: Integracao atualizada.

### `real_dev/backend/src/modules/integrations/integrations.service.js`

- `asUserObjectId(userId)` (top-level; função) - Converte id de admin para auditoria. Entradas: `userId`: Id vindo da sessao. Devolve: Id MongoDB.
- `toPublicIntegration(key, setting)` (top-level; função) - Junta definicao canonica e configuracao persistida. Entradas: `key`: Chave da integracao.; `setting`: Configuracao persistida. Devolve: Estado publico da integracao.
- `listIntegrationSettings()` (exportada; função) - Lista configuracoes de integracoes aceites no MVP. Entradas: sem entradas explícitas. Devolve: Integracoes visiveis ao admin.
- `updateIntegrationSetting(actorUserId, key, input)` (exportada; função) - Atualiza uma integracao e regista auditoria administrativa. Entradas: `actorUserId`: Id do admin autenticado.; `key`: Chave recebida por parametro.; `input`: Corpo recebido. Devolve: Integracao atualizada.

### `real_dev/backend/src/modules/integrations/integrations.validation.js`

- `assertIntegrationKey(key)` (exportada; função) - Valida a chave de integracao recebida por parametro. Entradas: `key`: Chave recebida. Devolve: Chave validada.
- `assertPublicConfig(value)` (top-level; função) - Valida configuracao publica sem permitir objetos livres perigosos. Entradas: `value`: Valor recebido. Devolve: Configuracao publica normalizada.
- `assertIntegrationUpdate(input)` (exportada; função) - Valida atualizacao administrativa de uma integracao. Entradas: `input`: Dados recebidos. Devolve: Atualizacao segura.

### `real_dev/backend/src/modules/library/library.controller.js`

- `getFavorites(req, res)` (exportada; função) - Lista favoritos guardados pelo utilizador autenticado. O controller fixa o tipo de lista como `favorite` e usa a sessão para impedir acesso a bibliotecas de outros utilizadores. Entradas: `req`: Pedido Express com `user.id`.; `res`: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com favoritos.
- `putFavorite(req, res)` (exportada; função) - Adiciona um conteúdo aos favoritos do utilizador. A rota recebe o conteúdo no URL e o serviço cria a associação com a conta da sessão atual. Entradas: `req`: Pedido Express com `user.id` e `params.contentId`.; `res`: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com o favorito guardado.
- `deleteFavorite(req, res)` (exportada; função) - Remove um conteúdo dos favoritos do utilizador. O tipo de lista fica fixo no controller e o serviço remove apenas a associação pertencente à sessão atual. Entradas: `req`: Pedido Express com `user.id` e `params.contentId`.; `res`: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com o resultado da remoção.
- `getWatchlist(req, res)` (exportada; função) - Lista conteúdos guardados na watchlist do utilizador. A função consulta a biblioteca pessoal com o tipo `watchlist`, mantendo o detalhe de armazenamento escondido no serviço. Entradas: `req`: Pedido Express com `user.id`.; `res`: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com a watchlist.
- `putWatchlist(req, res)` (exportada; função) - Adiciona um conteúdo à watchlist do utilizador. O controller recebe o conteúdo no URL e delega no serviço a criação idempotente da entrada de biblioteca. Entradas: `req`: Pedido Express com `user.id` e `params.contentId`.; `res`: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com a entrada guardada.
- `deleteWatchlist(req, res)` (exportada; função) - Remove um conteúdo da watchlist do utilizador. A função passa ao serviço o utilizador, o conteúdo e o tipo de lista para apagar apenas a associação correta. Entradas: `req`: Pedido Express com `user.id` e `params.contentId`.; `res`: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com o resultado da remoção.
- `getHistory(req, res)` (exportada; função) - Lista o histórico de visualização do utilizador autenticado. O controller devolve a coleção calculada pelo serviço para alimentar a área pessoal sem aceitar identificadores de utilizador vindos do cliente. Entradas: `req`: Pedido Express com `user.id`.; `res`: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com histórico de visualização.

### `real_dev/backend/src/modules/library/library.service.js`

- `assertPublishedContent(db, contentId)` (top-level; função) - Garante que um conteúdo publicado existe antes de operações de lista. Entradas: `db`: Base de dados MongoDB.; `contentId`: Id do conteúdo. Devolve: Documento de conteúdo publicado.
- `publicContent(content)` (top-level; função) - Converte um documento de conteúdo num item compacto de biblioteca. Entradas: `content`: Documento de conteúdo. Devolve: Item público de biblioteca.
- `ensureLibraryIndexes()` (exportada; função) - Garante que existem os índices de favoritos/watchlist. Entradas: sem entradas explícitas. Devolve: Termina depois da criação de índices.
- `addToList(userId, contentId, type)` (exportada; função) - Adiciona conteúdo publicado a uma lista pessoal. Entradas: `userId`: Identificador do utilizador autenticado.; `contentId`: Id do conteúdo.; `type`: Tipo de lista. Devolve: Estado de gravação.
- `removeFromList(userId, contentId, type)` (exportada; função) - Remove conteúdo de uma lista pessoal. Entradas: `userId`: Identificador do utilizador autenticado.; `contentId`: Id do conteúdo.; `type`: Tipo de lista. Devolve: Estado de gravação.
- `listSavedContent(userId, type)` (exportada; função) - Lista uma lista pessoal do utilizador autenticado. Entradas: `userId`: Identificador do utilizador autenticado.; `type`: Tipo de lista. Devolve: Itens publicados guardados.
- `listHistory(userId)` (exportada; função) - Lista histórico de visualização a partir do progresso de reprodução. Entradas: `userId`: Identificador do utilizador autenticado. Devolve: Itens do histórico.

### `real_dev/backend/src/modules/library/library.validation.js`

- `asObjectId(id, label)` (exportada; função) - Converte uma string de id em ObjectId. Entradas: `id`: Id bruto.; `label`: Domain label for errors. Devolve: ObjectId MongoDB.
- `assertListType(type)` (exportada; função) - Valida um tipo de lista da biblioteca pessoal. Entradas: `type`: Tipo bruto de lista. Devolve: Tipo de lista seguro.

### `real_dev/backend/src/modules/notifications/notifications.controller.js`

- `getMyNotifications(req, res)` (exportada; função) - Devolve notificações do utilizador autenticado. Entradas: `req`: Pedido Express com `req.user.id`.; `res`: Resposta Express. Devolve: Valor documentado como `Promise<void>`.
- `patchReadNotification(req, res)` (exportada; função) - Marca uma notificação do utilizador autenticado como lida. Entradas: `req`: Pedido Express com `req.params.id`.; `res`: Resposta Express. Devolve: Valor documentado como `Promise<void>`.
- `getMyPreferences(req, res)` (exportada; função) - Devolve preferências de notificação do utilizador autenticado. Entradas: `req`: Pedido Express com `req.user.id`.; `res`: Resposta Express. Devolve: Valor documentado como `Promise<void>`.
- `putMyPreferences(req, res)` (exportada; função) - Atualiza preferências de notificação do utilizador autenticado. Entradas: `req`: Pedido Express com `req.user.id` e corpo JSON.; `res`: Resposta Express. Devolve: Valor documentado como `Promise<void>`.

### `real_dev/backend/src/modules/notifications/notifications.service.js`

- `asUserObjectId(userId)` (top-level; função) - Converte o identificador de utilizador em `ObjectId`. Entradas: `userId`: Identificador do utilizador. Devolve: Identificador pronto para filtros MongoDB.
- `asNotificationObjectId(notificationId)` (top-level; função) - Converte o identificador de notificação em `ObjectId`. Entradas: `notificationId`: Identificador da notificação. Devolve: Identificador pronto para filtros MongoDB.
- `publicNotification(notification)` (top-level; função) - Remove campos internos antes de devolver uma notificação. Entradas: `notification`: Documento MongoDB de `notifications`. Devolve: Notificação pública para a API.
- `ensureNotificationIndexes()` (exportada; função) - Cria índices usados por preferências, listagem e deduplicação. Entradas: sem entradas explícitas. Devolve: Valor documentado como `Promise<void>`.
- `getPreferences(userId)` (exportada; função) - Obtém preferências de notificação do utilizador. Entradas: `userId`: Identificador do utilizador. Devolve: Preferências persistidas ou valores por defeito.
- `updatePreferences(userId, input)` (exportada; função) - Atualiza preferências de notificação do utilizador. Entradas: `userId`: Identificador do utilizador.; `input`: Dados recebido da API. Devolve: Preferências normalizadas.
- `createNotification(userId, input)` (exportada; função) - Cria uma notificação respeitando preferências e deduplicação. Entradas: `userId`: Identificador do utilizador.; `input`: Dados da notificação. Devolve: Resultado da entrega.
- `createContinueWatchingNotification(userId, input)` (exportada; função) - Cria alerta deduplicado para continuar visualização. Entradas: `userId`: Identificador do utilizador.; `input`: Dados do conteúdo interrompido. Devolve: Resultado da entrega.
- `listMyNotifications(userId)` (exportada; função) - Lista notificações do utilizador autenticado. Entradas: `userId`: Identificador do utilizador. Devolve: Notificações ordenadas por data.
- `markNotificationAsRead(userId, notificationId)` (exportada; função) - Marca uma notificação do utilizador como lida. Entradas: `userId`: Identificador do utilizador.; `notificationId`: Identificador da notificação. Devolve: Notificação atualizada.

### `real_dev/backend/src/modules/notifications/notifications.validation.js`

- `httpError(message, statusCode)` (top-level; função) - Cria um erro HTTP previsível para falhas de validação. Entradas: `message`: Mensagem segura para devolver ao cliente.; `[statusCode=400]`: Código HTTP associado. Devolve: Erro com `statusCode`.
- `assertNotificationType(type)` (exportada; função) - Valida e normaliza o tipo de notificação. Entradas: `type`: Tipo recebido do service. Devolve: Tipo canónico.
- `requiredNotificationText(value, field, min, max)` (top-level; função) - Valida texto obrigatório de notificação. Entradas: `value`: Valor recebido.; `field`: Nome do campo para mensagem de erro.; `min`: Tamanho mínimo.; `max`: Tamanho máximo. Devolve: Texto normalizado.
- `assertNotificationContent(input)` (exportada; função) - Valida título e mensagem de uma notificação. Entradas: `input`: Dados de entrada. Devolve: Conteúdo seguro para persistir.
- `assertPreferencePayload(input)` (exportada; função) - Valida preferências de notificação com valores por defeito. Entradas: `input`: Dados de entrada. Devolve: Preferências normalizadas.

### `real_dev/backend/src/modules/payments/payments.controller.js`

- `postSimulatedCheckout(req, res)` (exportada; função) - Executa checkout simulado para o utilizador autenticado. Entradas: `req`: Pedido com `req.user.id` e corpo validavel.; `res`: Resposta HTTP. Devolve: Valor documentado como `Promise<void>`.
- `postTrial(req, res)` (exportada; função) - Inicia o trial gratuito para o utilizador autenticado. Entradas: `req`: Pedido autenticado.; `res`: Resposta HTTP. Devolve: Valor documentado como `Promise<void>`.

### `real_dev/backend/src/modules/payments/payments.service.js`

- `userObjectId(userId)` (top-level; função) - Converte o identificador de utilizador autenticado para `ObjectId`. Entradas: `userId`: Identificador vindo da sessão. Devolve: Identificador pronto para filtros MongoDB.
- `addDays(date, days)` (top-level; função) - Soma dias a uma data sem alterar a instancia original. Entradas: `date`: Data base.; `days`: Número de dias a acrescentar. Devolve: Nova data calculada.
- `ensurePaymentIndexes()` (exportada; função) - Cria indices usados por tentativas de pagamento e trials. Entradas: sem entradas explícitas. Devolve: Valor documentado como `Promise<void>`.
- `createSimulatedCheckout(userId, input)` (exportada; função) - Regista checkout simulado e cria notificação quando o pagamento e recusado. Entradas: `userId`: Identificador do utilizador autenticado.; `input`: Dados do checkout simulado. Devolve: Resultado da tentativa.
- `startTrial(userId)` (exportada; função) - Inicia trial único e notifica o utilizador quando o acesso gratuito fica ativo. Entradas: `userId`: Identificador do utilizador autenticado. Devolve: Trial e subscrição temporária.

### `real_dev/backend/src/modules/payments/payments.validation.js`

- `httpError(message, statusCode)` (top-level; função) - Cria um erro HTTP previsivel para o middleware global de erros. Entradas: `message`: Mensagem segura para devolver ao cliente.; `[statusCode=400]`: Código HTTP associado a erros de validação. Devolve: Erro com `statusCode`.
- `assertCheckoutPayload(input)` (exportada; função) - Valida e normaliza o pedido de checkout simulado. Entradas: `input`: Corpo recebido no endpoint de checkout.; `input.planCode`: Código do plano escolhido.; `input.paymentMethod`: Método de pagamento de teste.; `[input.simulateOutcome="approved"]`: Resultado controlado para a demo. Devolve: Dados seguros.

### `real_dev/backend/src/modules/playback/media-preferences.service.js`

- `asUserObjectId(userId)` (top-level; função) - Converte um id de utilizador num ObjectId MongoDB. Entradas: `userId`: Id do utilizador. Devolve: ObjectId MongoDB.
- `normalizePreferences(input)` (top-level; função) - Normaliza preferências de media sem criar URLs de reprodução. Entradas: `input`: Preferências brutas. Devolve: Preferências seguras.
- `ensureMediaPreferenceIndexes()` (exportada; função) - Garante que existem os índices de preferências media. Entradas: sem entradas explícitas. Devolve: Termina depois da criação de índices.
- `getMediaPreferences(userId)` (exportada; função) - Devolve as preferências media do utilizador autenticado. Entradas: `userId`: Identificador do utilizador autenticado. Devolve: Preferências.
- `saveMediaPreferences(userId, input)` (exportada; função) - Guarda as preferências media do utilizador autenticado. Entradas: `userId`: Identificador do utilizador autenticado.; `input`: Dados das preferências. Devolve: Preferências guardadas.

### `real_dev/backend/src/modules/playback/playback.controller.js`

- `getPlaybackByContent(req, res)` (exportada; função) - Devolve o estado de reprodução de um conteúdo para o utilizador autenticado. O controller lê o `contentId` da rota e o `user.id` da sessão para pedir ao serviço o progresso e as preferências aplicáveis a esse conteúdo. Entradas: `req`: Pedido Express com `params.contentId` e `user.id`.; `res`: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com o estado de reprodução.
- `putPlaybackProgress(req, res)` (exportada; função) - Atualiza o progresso de reprodução de um conteúdo. A rota recebe a posição no corpo do pedido e delega no serviço a validação e a persistência associadas à conta autenticada. Entradas: `req`: Pedido Express com conteúdo, utilizador e progresso.; `res`: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com o progresso guardado.
- `getContinueWatching(req, res)` (exportada; função) - Lista conteúdos que o utilizador pode continuar a ver. O controller não recebe filtros: usa apenas a sessão autenticada para obter a lista pessoal calculada pelo serviço de playback. Entradas: `req`: Pedido Express com `user.id`.; `res`: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com os itens para continuar a ver.
- `getPlaybackPreferences(req, res)` (exportada; função) - Devolve as preferências de reprodução do utilizador autenticado. A função separa a camada HTTP da leitura de preferências, mantendo a regra de sessão concentrada no serviço. Entradas: `req`: Pedido Express com `user.id`.; `res`: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com as preferências atuais.
- `putPlaybackPreferences(req, res)` (exportada; função) - Atualiza as preferências de reprodução do utilizador autenticado. O corpo do pedido transporta as opções escolhidas na UI e o serviço decide que campos são válidos para persistência. Entradas: `req`: Pedido Express com `user.id` e preferências no body.; `res`: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com as preferências guardadas.

### `real_dev/backend/src/modules/playback/playback.service.js`

- `asObjectId(id, label)` (top-level; função) - Converte uma string de id em ObjectId com erro de domínio. Entradas: `id`: Id bruto.; `label`: Domain label for error messages. Devolve: ObjectId MongoDB.
- `publicProgress(progress, durationSeconds)` (top-level; função) - Converte um documento de progresso para o formato público da API. Entradas: `progress`: Progress document or null.; `durationSeconds`: Content duration. Devolve: Progresso público.
- `resolvePlayableMedia(content, preferences, entitlements)` (top-level; função) - Resolve media reproduzível sem construir URLs a partir de input do utilizador. Entradas: `content`: Documento de conteúdo.; `preferences`: Preferências do utilizador.; `entitlements`: Entitlements efetivos do utilizador. Devolve: Playable media.
- `assertParentalAccess(user, content)` (top-level; função) - Lança erro quando as definições parentais bloqueiam um conteúdo. Entradas: `user`: User document.; `content`: Documento de conteúdo. Devolve: Valor documentado como `void`.
- `publicPlaybackContent(content, preferences, entitlements)` (top-level; função) - Converte conteúdo para o formato de resposta de reprodução. Entradas: `content`: Documento de conteúdo.; `preferences`: Preferências do utilizador.; `entitlements`: Entitlements efetivos. Devolve: Conteúdo público de reprodução.
- `ensurePlaybackIndexes()` (exportada; função) - Garante que existem os índices de reprodução. Entradas: sem entradas explícitas. Devolve: Termina depois da criação de índices.
- `getPlayback(contentId, userId)` (exportada; função) - Carrega dados de reprodução de conteúdo publicado para um utilizador autenticado. Entradas: `contentId`: Id do conteúdo.; `userId`: Identificador do utilizador autenticado. Devolve: Resposta de reprodução.
- `savePlaybackProgress(contentId, userId, input)` (exportada; função) - Guarda progresso de visualizacao e cria alerta de continuidade quando faz sentido. Entradas: `contentId`: Identificador do conteúdo.; `userId`: Identificador do utilizador autenticado.; `input`: Progresso recebido da UI. Devolve: Progresso público atualizado.
- `listContinueWatching(userId)` (exportada; função) - Lista progresso inacabado do utilizador autenticado. Entradas: `userId`: Identificador do utilizador autenticado. Devolve: Continue-watching items.

### `real_dev/backend/src/modules/playback/playback.validation.js`

- `assertProgressPayload(input, durationSeconds)` (exportada; função) - Valida progresso de reprodução e calcula conclusão. Entradas: `input`: Progress dados.; `durationSeconds`: Content duration. Devolve: Progresso seguro.

### `real_dev/backend/src/modules/privacy/privacy.controller.js`

- `getPrivacyExport(req, res)` (exportada; função) - Devolve a exportacao de dados do utilizador autenticado. Entradas: `req`: Pedido atual.; `res`: Resposta HTTP. Devolve: JSON de exportacao.
- `deleteAccount(req, res)` (exportada; função) - Elimina a propria conta e limpa o cookie de sessao. Entradas: `req`: Pedido atual.; `res`: Resposta HTTP. Devolve: Resultado da eliminacao.
- `getConsents(req, res)` (exportada; função) - Devolve consentimentos atuais do utilizador autenticado. Entradas: `req`: Pedido atual.; `res`: Resposta HTTP. Devolve: Estado de consentimentos.
- `putConsents(req, res)` (exportada; função) - Atualiza consentimentos do utilizador autenticado. Entradas: `req`: Pedido atual.; `res`: Resposta HTTP. Devolve: Estado atualizado.

### `real_dev/backend/src/modules/privacy/privacy.service.js`

- `asUserObjectId(userId)` (top-level; função) - Converte um id vindo da sessao para `ObjectId`. Entradas: `userId`: Identificador do utilizador autenticado. Devolve: Id convertido para MongoDB.
- `toExportValue(value)` (top-level; função) - Converte valores MongoDB para JSON estavel. Entradas: `value`: Valor vindo da base de dados. Devolve: Valor serializavel.
- `toExportableUser(user)` (top-level; função) - Remove campos internos do documento de utilizador. Entradas: `user`: Documento `users`. Devolve: Dados publicos exportaveis.
- `exportOwnedCollection(db, collectionName, userObjectId)` (top-level; função) - Carrega uma colecao filtrando sempre pelo dono autenticado. Entradas: `db`: Ligacao MongoDB.; `collectionName`: Nome da colecao.; `userObjectId`: Id do utilizador autenticado. Devolve: Documentos exportaveis.
- `exportFamilyMemberships(db, userObjectId)` (top-level; função) - Exporta partilhas familiares onde o utilizador e owner ou membro. Entradas: `db`: Ligacao MongoDB.; `userObjectId`: Id do utilizador autenticado. Devolve: Memberships familiares exportaveis.
- `buildUserDataExport(userId)` (exportada; função) - Gera a exportacao RGPD do utilizador autenticado. Entradas: `userId`: Id vindo de `req.user.id`. Devolve: Exportacao completa.
- `deletePersonalCollections(db, userObjectId)` (top-level; função) - Remove documentos pessoais de colecoes cujo conteudo pertence ao utilizador. Entradas: `db`: Ligacao MongoDB.; `userObjectId`: Id do utilizador. Devolve: Contagem por colecao.
- `anonymizeComments(db, userObjectId)` (top-level; função) - Anonimiza comentarios sem destruir a discussao publica ja moderada. Entradas: `db`: Ligacao MongoDB.; `userObjectId`: Id do utilizador. Devolve: Numero de comentarios alterados.
- `cancelSubscriptionsForDeletedAccount(db, userObjectId)` (top-level; função) - Cancela subscricoes operacionais sem apagar historico financeiro agregado. Entradas: `db`: Ligacao MongoDB.; `userObjectId`: Id do utilizador. Devolve: Numero de subscricoes atualizadas.
- `invalidateFamilyMembershipsForDeletedAccount(db, userObjectId)` (top-level; função) - Invalida convites e partilhas familiares associados a uma conta eliminada. Entradas: `db`: Ligacao MongoDB.; `userObjectId`: Id do utilizador. Devolve: Numero de memberships atualizadas.
- `deleteMyAccount(userId, input)` (exportada; função) - Elimina a propria conta com confirmacao forte e limpeza controlada. Entradas: `userId`: Id vindo da sessao.; `input`: Pedido recebido do frontend. Devolve: Resultado operacional.
- `toPublicConsents(document)` (top-level; função) - Constrói o estado publico de consentimentos. Entradas: `document`: Documento persistido. Devolve: Estado visivel.
- `getMyConsents(userId)` (exportada; função) - Lê os consentimentos atuais do utilizador autenticado. Entradas: `userId`: Id vindo da sessao. Devolve: Estado atual.
- `updateMyConsents(userId, input)` (exportada; função) - Atualiza consentimentos atuais e grava evento historico. Entradas: `userId`: Id vindo da sessao.; `input`: Dados recebidos do frontend. Devolve: Estado atualizado.

### `real_dev/backend/src/modules/privacy/privacy.validation.js`

- `assertDeleteAccountPayload(input)` (exportada; função) - Valida o pedido destrutivo de eliminacao da propria conta. Entradas: `input`: Dados recebidos do frontend. Devolve: Dados normalizados.
- `assertConsentBoolean(input, key)` (top-level; função) - Valida que uma categoria de consentimento chegou como booleano real. Entradas: `input`: Dados recebidos.; `key`: Categoria esperada. Devolve: Valor validado.
- `assertConsentPayload(input)` (exportada; função) - Valida as escolhas opcionais de consentimento do utilizador autenticado. Entradas: `input`: Dados recebidos do frontend. Devolve: Consentimentos persistiveis.

### `real_dev/backend/src/modules/ratings/ratings.controller.js`

- `putRating(req, res)` (exportada; função) - Cria ou atualiza a avaliação do utilizador para um conteúdo. O controller junta o utilizador autenticado, o conteúdo da rota e o valor do body antes de delegar a validação no serviço. Entradas: `req`: Pedido Express com `user.id`, `params.contentId` e `body.value`.; `res`: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com a avaliação guardada.
- `getRatingMe(req, res)` (exportada; função) - Devolve a avaliação pessoal do utilizador para um conteúdo. A função usa a sessão para consultar apenas a avaliação do próprio utilizador. Entradas: `req`: Pedido Express com `user.id` e `params.contentId`.; `res`: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com a avaliação pessoal.
- `deleteRating(req, res)` (exportada; função) - Remove a avaliação pessoal do utilizador para um conteúdo. O conteúdo vem da rota e a conta vem da sessão, impedindo remoção de avaliações de outros utilizadores. Entradas: `req`: Pedido Express com `user.id` e `params.contentId`.; `res`: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com a avaliação removida.
- `getRatingSummaryController(req, res)` (exportada; função) - Devolve o resumo agregado de avaliações de um conteúdo. A rota pública recebe apenas o conteúdo e o serviço calcula totais e média sem revelar dados pessoais de avaliadores. Entradas: `req`: Pedido Express com `params.contentId`.; `res`: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com resumo de avaliações.

### `real_dev/backend/src/modules/ratings/ratings.service.js`

- `assertPublishedContent(db, contentId)` (top-level; função) - Garante que classificações só podem apontar para conteúdo publicado. Entradas: `db`: Base de dados MongoDB.; `contentId`: ObjectId do conteúdo. Devolve: Documento de conteúdo publicado.
- `emptySummary(contentId)` (top-level; função) - Constrói um resumo vazio de classificação para conteúdo sem classificações. Entradas: `contentId`: Id público do conteúdo. Devolve: Resposta agregada vazia.
- `ensureRatingIndexes()` (exportada; função) - Cria índices exigidos pelo contrato de classificações. Entradas: sem entradas explícitas. Devolve: Termina depois da criação de índices.
- `upsertRating(userId, contentId, value)` (exportada; função) - Cria ou atualiza a classificação do utilizador autenticado para um conteúdo. Entradas: `userId`: Identificador do utilizador autenticado vindo da sessão.; `contentId`: Id público do conteúdo vindo dos parâmetros da rota.; `value`: Valor bruto da classificação. Devolve: Estado de classificação gravado.
- `getMyRating(userId, contentId)` (exportada; função) - Devolve a classificação do utilizador autenticado para um conteúdo. Entradas: `userId`: Identificador do utilizador autenticado vindo da sessão.; `contentId`: Id público do conteúdo vindo dos parâmetros da rota. Devolve: Estado atual da classificação do utilizador.
- `deleteMyRating(userId, contentId)` (exportada; função) - Remove a classificação do utilizador autenticado para um conteúdo. Entradas: `userId`: Identificador do utilizador autenticado vindo da sessão.; `contentId`: Id público do conteúdo vindo dos parâmetros da rota. Devolve: Estado de classificação removida.
- `getRatingSummary(contentId)` (exportada; função) - Calcula o agregado público de classificações para um conteúdo publicado. Entradas: `contentId`: Id público do conteúdo vindo dos parâmetros da rota. Devolve: Resumo de classificações.

### `real_dev/backend/src/modules/ratings/ratings.validation.js`

- `asObjectId(id, label)` (exportada; função) - Converte um id público num ObjectId MongoDB. Entradas: `id`: Id bruto recebido dos parâmetros da rota ou da sessão.; `label`: Portuguese domain label used in validation errors. Devolve: ObjectId MongoDB seguro.
- `assertRatingValue(value)` (exportada; função) - Valida a escala canónica de classificação FaithFlix. Entradas: `value`: Valor bruto recebido no corpo do pedido. Devolve: Classificação inteira entre 1 e 5.

### `real_dev/backend/src/modules/recommendations/content-embeddings.service.js`

- `normalizeEmbeddingText(value)` (exportada; função) - Normaliza texto para uma forma simples e comparável. Entradas: `value`: Texto bruto. Devolve: Texto normalizado.
- `tokenizeEmbeddingText(value)` (exportada; função) - Divide texto normalizado em tokens úteis. Entradas: `value`: Texto bruto. Devolve: Tokens.
- `stableHash(value)` (top-level; função) - Hash FNV-1a de 32 bits para manter os vetores estáveis entre execuções. Entradas: `value`: Token. Devolve: Hash unsigned.
- `normalizeVector(vector)` (exportada; função) - Normaliza um vetor pelo comprimento L2. Entradas: `vector`: Vetor bruto. Devolve: Vetor normalizado.
- `buildLocalContentEmbedding(text, dimensions)` (exportada; função) - Cria embedding local determinístico a partir de texto. Entradas: `text`: Fonte textual.; `[dimensions=CONTENT_EMBEDDING_DIMENSIONS]`: Dimensões. Devolve: Vetor normalizado.
- `cosineSimilarity(left, right)` (exportada; função) - Calcula similaridade de cosseno entre dois vetores. Entradas: `left`: Primeiro vetor.; `right`: Segundo vetor. Devolve: Similaridade.
- `hashEmbeddingSource(source)` (exportada; função) - Cria um hash SHA-256 da fonte usada no embedding. Entradas: `source`: Fonte textual canónica. Devolve: Hash hexadecimal.
- `ensureContentEmbeddingIndexes()` (exportada; função) - Garante os índices da coleção de embeddings. Entradas: sem entradas explícitas. Devolve: Termina depois da criação dos índices.
- `taxonomyNames(taxonomies)` (top-level; função) - Ordena nomes de taxonomias para uma fonte estável. Entradas: `taxonomies`: Taxonomias. Devolve: Nomes ordenados.
- `buildContentEmbeddingSource(content, taxonomies, passages)` (exportada; função) - Constrói a fonte textual usada para gerar o embedding de um conteúdo. Entradas: `content`: Conteúdo.; `[taxonomies=[]`: ] Taxonomias associadas.; `[passages=[]`: ] Passagens bíblicas publicadas associadas. Devolve: Fonte textual e hash.
- `loadEmbeddingSourceRelations(db, content)` (top-level; função) - Carrega taxonomias e passagens publicadas necessárias para a fonte do embedding. Entradas: `db`: Base de dados.; `content`: Conteúdo publicado. Devolve: Dados associados.
- `buildContentEmbeddingDocument(db, content)` (exportada; função) - Cria o documento de embedding para um conteúdo publicado. Entradas: `db`: Base de dados.; `content`: Conteúdo publicado. Devolve: Documento de embedding.
- `generateContentEmbeddings(options)` (exportada; função) - Gera ou regenera embeddings para conteúdos publicados. Entradas: `[options={}]`: Opções de geração. Devolve: Resumo.

### `real_dev/backend/src/modules/recommendations/recommendation-explanations.js`

- `buildRecommendationExplanation(reasonCode)` (exportada; função) - Converte um código de razão de recomendação numa explicação segura para o utilizador. Entradas: `reasonCode`: Internal recommendation reason code. Devolve: Explicação pública.

### `real_dev/backend/src/modules/recommendations/recommendations.controller.js`

- `getMyRecommendations(req, res)` (exportada; função) - Devolve recomendações personalizadas para a sessão atual. O controller usa apenas o `user.id` autenticado e delega no serviço a escolha dos blocos recomendados, incluindo fallback cold-start quando necessário. Entradas: `req`: Pedido Express com `user.id`.; `res`: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com recomendações do utilizador.

### `real_dev/backend/src/modules/recommendations/recommendations.service.js`

- `asObjectId(id, label)` (top-level; função) - Converte um id público num ObjectId MongoDB. Entradas: `id`: Id bruto vindo da sessão ou dos dados.; `label`: Portuguese domain label used in errors. Devolve: ObjectId seguro.
- `publicCard(content)` (top-level; função) - Converte um documento de conteúdo num cartão compacto de recomendação. Entradas: `content`: Documento de conteúdo MongoDB. Devolve: Cartão público de recomendação.
- `addCount(map, key)` (top-level; função) - Increments one occurrence counter. Entradas: `map`: Counter map.; `key`: Key to count. Devolve: Valor documentado como `void`.
- `addWeightedContent(map, contentId, weight)` (top-level; função) - Soma peso semântico a um conteúdo sinalizado pelo utilizador. Entradas: `map`: Mapa contentId -> peso.; `contentId`: Id de conteúdo.; `weight`: Peso a somar. Devolve: Valor documentado como `void`.
- `topKeys(map, limit)` (top-level; função) - Devolve as chaves com maior frequência de um mapa de contadores. Entradas: `map`: Counter map.; `limit`: Maximum number of keys. Devolve: Chaves mais frequentes.
- `loadUserSignals(db, userObjectId)` (top-level; função) - Carrega sinais de recomendação permitidos para o utilizador autenticado. Entradas: `db`: Base de dados MongoDB.; `userObjectId`: `ObjectId` do utilizador autenticado. Devolve: Resumo agregado de sinais.
- `objectIdsFromStrings(ids)` (top-level; função) - Converte ids públicos válidos em ObjectIds. Entradas: `ids`: Ids textuais. Devolve: ObjectIds válidos.
- `buildSemanticProfileVector(weightedContentIds, embeddings)` (exportada; função) - Constrói o vetor temporário do utilizador a partir de embeddings de conteúdos sinalizados. Entradas: `weightedContentIds`: Sinais ponderados.; `embeddings`: Embeddings encontrados. Devolve: Vetor normalizado ou lista vazia quando não há base suficiente.
- `loadSemanticRecommendationItems(db, signals, excludedIds, limit)` (exportada; função) - Carrega recomendações por similaridade semântica de embeddings de conteúdo. Entradas: `db`: Base de dados.; `signals`: Sinais agregados do utilizador.; `excludedIds`: Conteúdos já usados ou já consumidos.; `[limit=8]`: Limite de itens. Devolve: Cartões recomendados.
- `loadCandidateCards(db, match, excludedIds, sort, limit)` (top-level; função) - Carrega cartões publicados com filtro e exclui cartões já vistos. Entradas: `db`: Base de dados MongoDB.; `match`: Filtro match MongoDB.; `excludedIds`: Ids already used or part of user signals.; `sort`: Ordenação MongoDB.; `limit`: Maximum number of cards. Devolve: Cartões de recomendação.
- `group(id, title, reasonCode, items)` (top-level; função) - Constrói um grupo de recomendações com a explicação MF3. Entradas: `id`: Id público do grupo.; `title`: Título público do grupo.; `reasonCode`: Internal reason code.; `items`: Cartões de recomendação. Devolve: Grupo público.
- `buildColdStart(db, initialExcludedIds)` (top-level; função) - Constrói a resposta cold-start para utilizadores sem sinais suficientes. Combina conteúdos populares, recentes e de catálogo geral, evitando repetir itens já escolhidos noutras secções da mesma resposta. Entradas: `db`: Base de dados MongoDB.; `initialExcludedIds`: Identificadores que já não devem ser sugeridos nesta resposta. Devolve: Resposta de recomendação.
- `getRecommendationsForUser(userId)` (exportada; função) - Constrói recomendações base para o utilizador autenticado. Entradas: `userId`: Identificador do utilizador autenticado. Devolve: Resposta de recomendação.

### `real_dev/backend/src/modules/search/search.controller.js`

- `getSearch(req, res)` (exportada; função) - Executa a pesquisa de conteúdos a partir dos parâmetros de query. O controller mantém a camada HTTP simples: recebe filtros da URL e deixa o serviço aplicar paginação, ordenação e critérios de pesquisa. Entradas: `req`: Pedido Express com filtros em `query`.; `res`: Resposta Express enviada ao cliente. Devolve: Resposta HTTP com resultados de pesquisa.

### `real_dev/backend/src/modules/search/search.service.js`

- `publicSearchItem(content, taxonomyNamesById)` (top-level; função) - Converte um documento de conteúdo num cartão público de pesquisa. Entradas: `content`: Documento de conteúdo MongoDB.; `taxonomyNamesById`: Nomes de taxonomias indexados por id. Devolve: Item público de resultado de pesquisa.
- `loadTaxonomyNames(db, contents)` (top-level; função) - Carrega nomes de todas as taxonomias usadas pelos conteúdos devolvidos. Entradas: `db`: Base de dados MongoDB.; `contents`: Content documents. Devolve: Nomes de taxonomias indexados por id.
- `buildSort(sort)` (top-level; função) - Constrói um objeto sort MongoDB a partir da opção pública de ordenação. Entradas: `sort`: Validated sort option. Devolve: Objeto sort MongoDB.
- `searchContents(queryParams)` (exportada; função) - Executa a pesquisa pública unificada sobre conteúdo publicado e taxonomias. Entradas: `queryParams`: Query bruta do pedido. Devolve: Resposta da pesquisa.

### `real_dev/backend/src/modules/search/search.validation.js`

- `escapeRegExp(value)` (exportada; função) - Escapes user text before building a regular expression. Entradas: `value`: Texto bruto de pesquisa. Devolve: Escaped regular expression text.
- `assertSearchQuery(value)` (exportada; função) - Valida o tamanho da query pública de pesquisa. Entradas: `value`: Parâmetro bruto de query. Devolve: Normalized search query.
- `parsePagination(input)` (exportada; função) - Valida parâmetros públicos de paginação. Entradas: `input`: Parâmetros brutos de query. Devolve: Opções de paginação seguras.
- `parseSearchFilters(input)` (exportada; função) - Valida filtros e ordenação de pesquisa da MF3. Entradas: `input`: Parâmetros brutos de query. Devolve: Filtros seguros.

### `real_dev/backend/src/modules/subscriptions/subscription-access.middleware.js`

- `requireActiveSubscription(req, _res, next)` (exportada; função) - Bloqueia playback premium sem subscrição ativa. Entradas: `req`: Pedido Express com `req.user.id`.; `_res`: Resposta Express não usada.; `next`: Callback Express. Devolve: Continua ou encaminha erro `403`.

### `real_dev/backend/src/modules/subscriptions/subscriptions.controller.js`

- `getPlans(_req, res)` (exportada; função) - Devolve planos ativos públicos. Entradas: `_req`: Pedido Express não usado.; `res`: Resposta Express. Devolve: Envia `200` com planos.
- `getMySubscriptionController(req, res)` (exportada; função) - Devolve a subscrição do utilizador autenticado. Entradas: `req`: Pedido Express com `req.user.id`.; `res`: Resposta Express. Devolve: Envia `200` com estado da subscrição.
- `postCancelRenewal(req, res)` (exportada; função) - Cancela a renovação futura da subscrição do utilizador autenticado. Entradas: `req`: Pedido Express com `req.user.id`.; `res`: Resposta Express. Devolve: Envia `200` com a subscrição atualizada.
- `getMyFamilyController(req, res)` (exportada; função) - Devolve o estado da partilha familiar do utilizador autenticado. Entradas: `req`: Pedido Express com `req.user.id`.; `res`: Resposta Express. Devolve: Envia `200` com a familia.
- `postFamilyInvitation(req, res)` (exportada; função) - Cria convite familiar para uma conta existente. Entradas: `req`: Pedido Express com `req.user.id` e `body.email`.; `res`: Resposta Express. Devolve: Envia `201` com o convite.
- `postAcceptFamilyInvitation(req, res)` (exportada; função) - Aceita convite familiar pendente. Entradas: `req`: Pedido Express com `params.id`.; `res`: Resposta Express. Devolve: Envia `200` com a familia atualizada.
- `postDeclineFamilyInvitation(req, res)` (exportada; função) - Recusa convite familiar pendente. Entradas: `req`: Pedido Express com `params.id`.; `res`: Resposta Express. Devolve: Envia `200` com a familia atualizada.
- `deleteFamilyMember(req, res)` (exportada; função) - Remove membro da familia do owner autenticado. Entradas: `req`: Pedido Express com `params.memberId`.; `res`: Resposta Express. Devolve: Envia `200` com a familia atualizada.
- `postLeaveFamily(req, res)` (exportada; função) - Permite ao membro sair da familia ativa. Entradas: `req`: Pedido Express com `req.user.id`.; `res`: Resposta Express. Devolve: Envia `200` com a familia atualizada.

### `real_dev/backend/src/modules/subscriptions/subscriptions.service.js`

- `httpError(message, statusCode)` (top-level; função) - Cria erro HTTP simples e seguro. Entradas: `message`: Mensagem publica.; `statusCode`: Codigo HTTP. Devolve: Erro com `statusCode`.
- `userObjectId(userId)` (top-level; função) - Converte um identificador de utilizador em ObjectId seguro. Entradas: `userId`: Identificador vindo de `req.user.id`. Devolve: ObjectId usado nas queries MongoDB.
- `asObjectId(id, label)` (top-level; função) - Converte ids de URL para ObjectId com erro de dominio. Entradas: `id`: Id bruto.; `label`: Label para mensagem. Devolve: ObjectId validado.
- `qualityRankForValue(value)` (exportada; função) - Calcula o ranking numerico de uma qualidade de video. Entradas: `value`: Valor como `1080p`, `2160p` ou `4K`. Devolve: Ranking usado para comparacao.
- `entitlementsForPlan(plan)` (top-level; função) - Resolve entitlements de um plano persistido. Entradas: `plan`: Plano MongoDB. Devolve: Entitlements normalizados.
- `entitlementsForSubscription(subscription, plan)` (top-level; função) - Entitlements para uma subscricao concreta. Entradas: `subscription`: Documento de subscricao.; `plan`: Plano associado. Devolve: Entitlements seguros.
- `publicPlan(plan)` (top-level; função) - Remove campos internos de um plano antes de o expor ao frontend. Entradas: `plan`: Documento MongoDB de `subscription_plans`. Devolve: Plano publico.
- `hasSubscriptionAccess(subscription, referenceDate)` (top-level; função) - Calcula se uma subscricao ainda autoriza acesso premium. Entradas: `subscription`: Documento de subscricao.; `referenceDate`: Data usada para testes e verificacao real. Devolve: Resultado de acesso proprio.
- `publicSubscription(subscription, plan, referenceDate)` (top-level; função) - Converte uma subscricao em dados seguros para UI/API. Entradas: `subscription`: Documento MongoDB de `subscriptions`.; `plan`: Plano associado.; `referenceDate`: Data de referencia. Devolve: Estado publico.
- `publicFamilyUser(user)` (top-level; função) - Converte dados minimos de utilizador para respostas familiares. Entradas: `user`: Documento `users`. Devolve: Utilizador publico reduzido.
- `publicFamilyMembership(membership, users)` (top-level; função) - Converte uma membership familiar para resposta publica. Entradas: `membership`: Documento de `subscription_family_memberships`.; `users`: Utilizadores relacionados. Devolve: Membership publica.
- `listOpenFamilyMemberships(db, ownerUserId)` (top-level; função) - Lista memberships pending/active de um owner. Entradas: `db`: Ligacao MongoDB.; `ownerUserId`: Owner. Devolve: Linhas ativas operacionais.
- `findActivePaidSubscription(db, userId, referenceDate)` (top-level; função) - Verifica se uma subscricao paga ativa existe para o utilizador. Entradas: `db`: Ligacao MongoDB.; `userId`: Utilizador.; `referenceDate`: Data atual. Devolve: Subscricao paga ativa, se existir.
- `loadOwnSubscription(db, userId)` (top-level; função) - Carrega a subscricao propria com o respetivo plano. Entradas: `db`: Ligacao MongoDB.; `userId`: Utilizador. Devolve: Dados proprios.
- `requireShareableFamilyPlan(db, ownerUserId, referenceDate)` (top-level; função) - Garante que o owner tem plano Familia partilhavel ativo. Entradas: `db`: Ligacao MongoDB.; `ownerUserId`: Owner.; `referenceDate`: Data atual. Devolve: Estado partilhavel.
- `publicMembershipsWithUsers(db, memberships)` (top-level; função) - Enriquece memberships com documentos de utilizador. Entradas: `db`: Ligacao MongoDB.; `memberships`: Memberships. Devolve: Memberships publicas.
- `getEffectiveSubscriptionAccess(userId, referenceDate)` (exportada; função) - Resolve acesso efetivo a partir de subscricao propria ou familia. Entradas: `userId`: Identificador autenticado.; `referenceDate`: Data opcional. Devolve: Estado efetivo de acesso.
- `filterQualityOptionsByEntitlements(options, entitlements)` (exportada; função) - Filtra opcoes de qualidade conforme entitlements sem expor URLs bloqueados. Entradas: `options`: Opcoes vindas do catalogo.; `entitlements`: Entitlements efetivos. Devolve: Opcoes publicas.
- `ensureSubscriptionIndexes()` (exportada; função) - Cria indices e planos base usados por subscricoes e familia. Entradas: sem entradas explícitas. Devolve: Termina quando indices e seed ficam prontos.
- `listPlans()` (exportada; função) - Lista planos ativos disponíveis para escolha. Entradas: sem entradas explícitas. Devolve: Planos públicos ordenados por tier/preço.
- `disableOwnedFamilyWhenPlanDoesNotShare(db, ownerUserId, now)` (top-level; função) - Remove memberships quando um utilizador muda para plano sem familia. Entradas: `db`: Ligacao MongoDB.; `ownerUserId`: Owner.; `now`: Data atual. Devolve: Termina quando memberships ficam inativas.
- `leaveFamilyWhenUserGetsOwnSubscription(db, memberUserId, now)` (top-level; função) - Um utilizador que compra plano proprio deixa convites/memberships familiares. Entradas: `db`: Ligacao MongoDB.; `memberUserId`: Membro.; `now`: Data atual. Devolve: Termina quando memberships ficam inativas.
- `activateSubscription(userId, planCode)` (exportada; função) - Ativa ou substitui a subscricao paga do utilizador autenticado. Entradas: `userId`: Identificador do utilizador autenticado.; `planCode`: Código do plano ativo. Devolve: Subscrição pública atualizada.
- `grantTrialSubscription(userId, endsAt)` (exportada; função) - Cria uma subscrição temporária de trial. Entradas: `userId`: Identificador do utilizador autenticado.; `endsAt`: Data em que o acesso gratuito termina. Devolve: Subscrição pública.
- `getFamilyOverview(userId)` (exportada; função) - Devolve o estado familiar do utilizador autenticado. Entradas: `userId`: Identificador da sessao. Devolve: Overview familiar.
- `getMySubscription(userId)` (exportada; função) - Devolve a subscricao do utilizador autenticado com acesso efetivo. Entradas: `userId`: Identificador vindo da sessao segura. Devolve: Estado publico.
- `hasActiveSubscriptionAccess(userId, referenceDate)` (exportada; função) - Verifica se o utilizador pode aceder a conteúdo premium. Entradas: `userId`: Identificador vindo de `req.user.id`.; `referenceDate`: Data opcional para testes de expiração. Devolve: Resultado usado pelo middleware de playback.
- `inviteFamilyMember(ownerUserId, input)` (exportada; função) - Convida uma conta existente para a familia do owner. Entradas: `ownerUserId`: Identificador do owner autenticado.; `input`: Payload do frontend. Devolve: Convite e overview.
- `acceptFamilyInvitation(memberUserId, invitationId)` (exportada; função) - Aceita um convite familiar pendente. Entradas: `memberUserId`: Utilizador autenticado.; `invitationId`: Id do convite. Devolve: Overview familiar atualizado.
- `declineFamilyInvitation(memberUserId, invitationId)` (exportada; função) - Recusa um convite familiar pendente. Entradas: `memberUserId`: Utilizador autenticado.; `invitationId`: Id do convite. Devolve: Overview familiar atualizado.
- `removeFamilyMember(ownerUserId, memberUserId)` (exportada; função) - Remove um membro da familia do owner. Entradas: `ownerUserId`: Owner autenticado.; `memberUserId`: Membro alvo. Devolve: Overview familiar atualizado.
- `leaveFamily(memberUserId)` (exportada; função) - Permite ao membro sair da familia ativa. Entradas: `memberUserId`: Utilizador autenticado. Devolve: Overview familiar atualizado.
- `cancelRenewal(userId)` (exportada; função) - Cancela a renovação futura mantendo acesso até ao fim do ciclo atual. Entradas: `userId`: Identificador vindo da sessão segura. Devolve: Subscrição atualizada.
- `renewActiveSubscription(userId)` (exportada; função) - Renova uma subscrição ativa quando o pagamento simulado do novo ciclo e aceite. Entradas: `userId`: Identificador vindo da sessão segura. Devolve: Subscrição com novo ciclo.
- `expireOverdueSubscriptions(referenceDate)` (exportada; função) - Marca subscrições vencidas quando a renovação simulada não ocorreu. Entradas: `referenceDate`: Data usada para decidir vencimento. Devolve: Termina depois de atualizar estados vencidos.

### `real_dev/backend/src/modules/subscriptions/subscriptions.validation.js`

- `httpError(message, statusCode)` (top-level; função) - Cria um erro HTTP simples para validacoes de subscrição. Entradas: `message`: Mensagem segura para devolver ao frontend.; `statusCode`: Código HTTP que o middleware de erro deve usar. Devolve: Erro com `statusCode` definido.
- `assertPlanInterval(interval)` (exportada; função) - Confirma que o ciclo do plano e um dos ciclos aceites. Entradas: `interval`: Valor recebido do plano persistido ou de seed. Devolve: Ciclo normalizado.
- `assertSubscriptionStatus(status)` (exportada; função) - Confirma que o estado de subscrição existe no contrato da MF4. Entradas: `estado`: Estado recebido de input ou da base de dados. Devolve: Estado normalizado.
- `assertFamilyMembershipStatus(status)` (exportada; função) - Confirma que o estado de uma membership familiar pertence ao contrato MF9. Entradas: `status`: Estado recebido de input ou persistencia. Devolve: Estado normalizado.
- `addBillingCycle(date, interval)` (exportada; função) - Calcula a data final do ciclo de billing. Entradas: `date`: Data inicial do ciclo.; `interval`: Ciclo validado do plano. Devolve: Data de fim do ciclo seguinte.
- `isBlockingStatus(status)` (exportada; função) - Indica se um estado deve bloquear acesso premium. Entradas: `estado`: Estado da subscrição. Devolve: `true` quando a reprodução premium deve ser recusada.

### `real_dev/backend/src/modules/system/health.controller.js`

- `getHealth(_req, res)` (exportada; função) - Devolve o estado operacional atual. Entradas: `_req`: Pedido HTTP não usado.; `res`: Resposta HTTP usada para devolver os dados de saúde. Devolve: Resposta JSON com informação de saúde.

### `real_dev/backend/src/modules/system/health.service.js`

- `getHealthStatus()` (exportada; função) - Constrói o dados de saúde operacional do processo backend atual. Entradas: sem entradas explícitas. Devolve: Dados de estado de saúde.

### `real_dev/backend/src/modules/system/system.controller.js`

- `getApiInfo(_req, res)` (exportada; função) - Devolve informação técnica básica sobre a API FaithFlix. Entradas: `_req`: Pedido HTTP não usado.; `res`: Resposta HTTP usada para devolver os metadados da API. Devolve: Resposta JSON com metadados do serviço.

### `real_dev/backend/src/modules/users/user.controller.js`

- `getMe(req, res)` (exportada; função) - Devolve o perfil do utilizador autenticado. Entradas: `req`: Pedido atual.; `res`: Resposta HTTP. Devolve: Resposta com perfil.
- `patchMe(req, res)` (exportada; função) - Atualiza campos editáveis do perfil do utilizador autenticado. Entradas: `req`: Pedido atual.; `res`: Resposta HTTP. Devolve: Resposta com perfil atualizado.
- `patchMyParentalSettings(req, res)` (exportada; função) - Atualiza definições parentais do utilizador autenticado. Entradas: `req`: Pedido atual.; `res`: Resposta HTTP. Devolve: Resposta com perfil atualizado.
- `getUsers(req, res)` (exportada; função) - Lista utilizadores para administradores. Entradas: `req`: Pedido atual.; `res`: Resposta HTTP. Devolve: Resposta com lista de utilizadores.
- `patchUserRole(req, res)` (exportada; função) - Atualiza a role de um utilizador para administradores. Entradas: `req`: Pedido atual com id do utilizador alvo.; `res`: Resposta HTTP. Devolve: Resposta com utilizador atualizado.
- `patchUserAdmin(req, res)` (exportada; função) - Atualiza role e/ou estado operacional por administradores. Entradas: `req`: Pedido atual.; `res`: Resposta HTTP. Devolve: Resposta com utilizador atualizado.

### `real_dev/backend/src/modules/users/user.service.js`

- `toPublicUser(user)` (top-level; função) - Converte um documento interno de utilizador para o formato público de perfil. Entradas: `user`: MongoDB user document. Devolve: Perfil público do utilizador.
- `asUserObjectId(userId)` (top-level; função) - Converte um id de utilizador num ObjectId MongoDB. Entradas: `userId`: Id do utilizador vindo de parâmetros ou da sessão. Devolve: ObjectId MongoDB.
- `buildAdminUserQuery(filters)` (top-level; função) - Constroi filtros seguros para a listagem administrativa. Entradas: `filters`: Filtros recebidos. Devolve: Query MongoDB.
- `getMyProfile(userId)` (exportada; função) - Obtém o perfil do utilizador autenticado. Entradas: `userId`: Identificador do utilizador autenticado. Devolve: Perfil público.
- `updateMyProfile(userId, input)` (exportada; função) - Atualiza apenas campos de perfil em autosserviço. Entradas: `userId`: Identificador do utilizador autenticado.; `input`: Dados de perfil. Devolve: Perfil público atualizado.
- `updateParentalSettings(userId, input)` (exportada; função) - Atualiza o limite parental do utilizador autenticado. Entradas: `userId`: Identificador do utilizador autenticado.; `input`: Dados parentais. Devolve: Perfil público atualizado.
- `listUsers(filters)` (exportada; função) - Lista utilizadores para administradores sem campos internos de autenticacao. Entradas: `[filters={}]`: Filtros admin. Devolve: Lista pública de utilizadores.
- `updateUserRole(actorUserId, targetUserId, input)` (exportada; função) - Mantem a rota legacy de role ligada ao fluxo auditado da MF5. Entradas: `actorUserId`: Id do admin autenticado.; `targetUserId`: Target user id.; `input`: Role dados. Devolve: Utilizador público atualizado.
- `updateUserByAdmin(actorUserId, targetUserId, input)` (exportada; função) - Atualiza role/estado de uma conta com protecoes administrativas. Entradas: `actorUserId`: Id do admin autenticado.; `targetUserId`: Id do utilizador alvo.; `input`: Dados recebidos. Devolve: Utilizador atualizado.

### `real_dev/backend/src/modules/users/user.validation.js`

- `assertProfileUpdate(input)` (exportada; função) - Valida atualizações de perfil em autosserviço. Entradas: `input`: Profile update dados. Devolve: Dados seguros de atualização.
- `assertRoleUpdate(input)` (exportada; função) - Valida atualização administrativa de role. Entradas: `input`: Role update dados. Devolve: Atualização segura de role.
- `escapeRegexLiteral(value)` (top-level; função) - Escapa caracteres especiais para usar pesquisa `$regex` como literal. Entradas: `value`: Texto normalizado. Devolve: Texto seguro para pesquisa.
- `assertAdminUserUpdate(input)` (exportada; função) - Valida alteracao administrativa de role e estado operacional. Entradas: `input`: Dados recebidos. Devolve: Atualizacao segura.
- `assertAdminUserFilters(filters)` (exportada; função) - Valida filtros da listagem administrativa. Entradas: `filters`: Query string recebida. Devolve: Filtros normalizados.
- `assertParentalSettings(input)` (exportada; função) - Valida o limite parental do utilizador autenticado. Entradas: `input`: Parental settings dados. Devolve: Atualização parental segura.

### `real_dev/backend/src/utils/async-handler.js`

- `asyncHandler(handler)` (exportada; função) - Envolve um controlador Express assíncrono e encaminha promises rejeitadas para o middleware de erro. Entradas: `controlador`: Gestor assíncrono de rota. Devolve: Gestor Express com encaminhamento centralizado de erros.

### `real_dev/backend/src/utils/cookies.js`

- `parseCookies(cookieHeader)` (exportada; função) - Interpreta um cabeçalho HTTP Cookie para um objeto simples. Entradas: `[cookieCabeçalho=""]`: Cabeçalho `Cookie` bruto recebido pelo Express. Devolve: Nomes dos cookies e valores descodificados.
- `readCookie(req, name)` (exportada; função) - Lê um valor de cookie de um pedido Express. Entradas: `req`: Pedido HTTP atual.; `name`: Cookie name to read. Devolve: Valor do cookie quando existe.
- `clearSessionCookie(res)` (exportada; função) - Limpa o cookie de sessão configurado na resposta HTTP. Entradas: `res`: Resposta HTTP onde o cookie expirado é escrito. Devolve: Valor documentado como `void`.

### `real_dev/backend/src/utils/http-error.js`

- `constructor(statusCode, message, details)` (pública; método de classe) - Cria um erro com semântica HTTP. Entradas: `statusCode`: Código HTTP que deve ser devolvido ao cliente.; `message`: Mensagem segura que pode ser devolvida na resposta JSON.; `[details=undefined]`: Detalhes estruturados opcionais sobre a falha. Devolve: Não devolve payload explícito.
- `notFound(path)` (exportada; função) - Cria o erro 404 padrão para rotas API desconhecidas. Entradas: `path`: Original URL requested by the client. Devolve: Erro padronizado de recurso não encontrado.

### `real_dev/backend/src/utils/logger.js`

- `shouldRedact(key)` (top-level; função) - Verifica se uma chave de contexto deve ser ocultada antes do logging. Entradas: `key`: Object key being inspected. Devolve: Verdadeiro quando a chave pode conter informação sensível.
- `redact(value)` (top-level; função) - Recursively redacts sensitive fields from log context. Entradas: `value`: Context value that may contain sensitive information. Devolve: Cópia ocultada segura para serializar em logs.
- `writeLog(level, message, context)` (top-level; função) - Escreve uma linha JSON estruturada no stream correto da consola. Entradas: `level`: Severity level for the log entry.; `message`: Nome curto do evento, legível por máquina.; `[context={}]`: Contexto estruturado adicional. Devolve: Valor documentado como `void`.
- `info(message, context)` (top-level; método de objeto) - Escreve uma entrada informativa no log. Entradas: `message`: Nome curto do evento, legível por máquina.; `[context]`: Contexto estruturado adicional. Devolve: Valor documentado como `void`.
- `warn(message, context)` (top-level; método de objeto) - Escreve uma entrada de aviso no log. Entradas: `message`: Nome curto do evento, legível por máquina.; `[context]`: Contexto estruturado adicional. Devolve: Valor documentado como `void`.
- `error(message, context)` (top-level; método de objeto) - Escreve uma entrada de erro no log. Entradas: `message`: Nome curto do evento, legível por máquina.; `[context]`: Contexto estruturado adicional. Devolve: Valor documentado como `void`.

## Frontend

### `real_dev/frontend/src/App.jsx`

- `App()` (exportada; função) - Componente React raiz do frontend FaithFlix. Entradas: sem entradas explícitas. Devolve: Rotas da aplicação envolvidas pelo router configurado.

### `real_dev/frontend/src/components/a11y/SkipLink.jsx`

- `SkipLink({...})` (exportada; função) - Renderiza um link que fica visível quando recebe foco. Entradas: `props`: Propriedades do componente.; `[props.targetId="conteudo-principal"]`: Identificador do elemento principal. Devolve: Link de salto para o conteúdo principal.

### `real_dev/frontend/src/components/auth/AdminRoute.jsx`

- `AdminRoute({...})` (exportada; função) - Impede que visitantes e utilizadores sem role permitida vejam conteúdo administrativo. Entradas: `props`: Propriedades do componente.; `props.children`: Página administrativa protegida visualmente.; `[props.allowedRoles=["admin"]`: ] Roles aceites pela rota visual. Devolve: Página protegida, redirecionamento ou aviso de permissão.

### `real_dev/frontend/src/components/auth/AuthForms.jsx`

- `AuthForms()` (exportada; função) - Apresenta formulários de login, registo e recuperação de palavra-passe. Entradas: sem entradas explícitas. Devolve: Painel de autenticação ligado à API real da MF2.

### `real_dev/frontend/src/components/comments/CommentsPanel.jsx`

- `CommentsPanel({...})` (exportada; função) - Lista comentários visíveis e permite a utilizadores autenticados adicionar comentários curtos. Entradas: `props`: Propriedades do componente.; `props.contentId`: Id do conteúdo publicado atual. Devolve: Painel de comentários.

### `real_dev/frontend/src/components/discovery/DiscoveryCarousel.jsx`

- `DiscoveryCarousel({...})` (exportada; função) - Mostra um grupo horizontal de descoberta. Entradas: `props`: Carousel props. Devolve: Carrossel de descoberta.

### `real_dev/frontend/src/components/discovery/RelatedContent.jsx`

- `RelatedContent({...})` (exportada; função) - Mostra conteúdo publicado relacionado para a página de detalhe atual. Entradas: `props`: Propriedades do componente.; `props.contentId`: Id do conteúdo atual. Devolve: Painel de conteúdo relacionado.

### `real_dev/frontend/src/components/layout/AppFooter.jsx`

- `AppFooter()` (exportada; função) - Rodapé partilhado da base frontend da MF1. Entradas: sem entradas explícitas. Devolve: Rodapé com identificação do projeto académico.

### `real_dev/frontend/src/components/layout/AppHeader.jsx`

- `getNavLinkClassName({...})` (top-level; função) - Devolve a classe CSS de um item de navegação conforme o estado da rota. Entradas: `routeState`: Estado passado pelo React Router. Devolve: Lista de classes CSS da ligação de navegação.
- `renderNavItem(item)` (top-level; função) - Renderiza uma ligação de navegação a partir da lista de rotas. Entradas: `item`: Item de navegação com rota e texto visível. Devolve: Ligação de navegação do React Router.
- `canShowNavItem(item, session)` (top-level; função) - Decide se um item pode aparecer para o perfil atual. Entradas: `item`: Item de navegação.; `session`: Estado de sessão. Devolve: Verdadeiro quando o link deve ser visível.
- `AppHeader()` (exportada; função) - Renderiza o cabeçalho visível em todas as páginas. Entradas: sem entradas explícitas. Devolve: Cabeçalho visível em todas as páginas.

### `real_dev/frontend/src/components/library/LibraryActions.jsx`

- `hasCurrentContent(response, contentId)` (top-level; função) - Verifica se a resposta de biblioteca contém o conteúdo atual. A função protege contra respostas vazias e permite reutilizar a mesma lógica para favoritos e watchlist. Entradas: `response`: Resposta da API de biblioteca.; `contentId`: Identificador do conteúdo atualmente aberto. Devolve: `true` quando o conteúdo está presente na lista.
- `LibraryActions({...})` (exportada; função) - Ações de favoritos e watchlist para a página de detalhe de conteúdo. Entradas: `props`: Propriedades do componente.; `props.contentId`: Id do conteúdo atual. Devolve: Ações de biblioteca.

### `real_dev/frontend/src/components/playback/ContinueWatchingStrip.jsx`

- `progressPercent(item)` (top-level; função) - Calcula a percentagem já vista de um item. A duração zero ou ausente devolve `0` para evitar divisões inválidas na barra de progresso. Entradas: `item`: Item de progresso. Devolve: Percentagem arredondada de visualização concluída.
- `ContinueWatchingStrip()` (exportada; função) - Mostra itens de reprodução inacabados do utilizador autenticado. Entradas: sem entradas explícitas. Devolve: Faixa de continuação de visualização ou null.

### `real_dev/frontend/src/components/privacy/PrivacyConsentsPanel.jsx`

- `PrivacyConsentsPanel()` (exportada; função) - Renderiza opções de consentimento persistidas no backend. Entradas: sem entradas explícitas. Devolve: Painel de consentimentos.

### `real_dev/frontend/src/components/privacy/PrivacyDangerZone.jsx`

- `PrivacyDangerZone()` (exportada; função) - Renderiza o fluxo destrutivo de eliminação de conta. Entradas: sem entradas explícitas. Devolve: Painel de eliminacao.

### `real_dev/frontend/src/components/privacy/PrivacyExportPanel.jsx`

- `downloadJson(data)` (top-level; função) - Cria e descarrega um ficheiro JSON no browser. Entradas: `data`: Dados a escrever. Devolve: Valor documentado como `void`.
- `PrivacyExportPanel()` (exportada; função) - Renderiza o fluxo de exportação RGPD. Entradas: sem entradas explícitas. Devolve: Painel de exportacao.

### `real_dev/frontend/src/components/ratings/RatingBox.jsx`

- `RatingBox({...})` (exportada; função) - Mostra classificação agregada e permite ao utilizador autenticado guardar a sua classificação. Entradas: `props`: Propriedades do componente.; `props.contentId`: Id do conteúdo publicado atual. Devolve: Controlo de classificação.

### `real_dev/frontend/src/components/recommendations/RecommendationExplanation.jsx`

- `RecommendationExplanation({...})` (exportada; função) - Mostra uma explicação segura para um grupo de recomendações. Entradas: `props`: Propriedades do componente. Devolve: Explicação de recomendação.

### `real_dev/frontend/src/components/search/SearchFilters.jsx`

- `SearchFilters({...})` (exportada; função) - Formulário de pesquisa com filtros e ordenação da MF3. Entradas: `props`: Propriedades do componente. Devolve: Formulário de filtros de pesquisa.

### `real_dev/frontend/src/components/system/ApiStatusBadge.jsx`

- `ApiStatusBadge()` (exportada; função) - Badge técnico que mostra se o frontend consegue contactar o backend. Entradas: sem entradas explícitas. Devolve: Badge de estado da conectividade à API.

### `real_dev/frontend/src/components/ui/BaseButton.jsx`

- `BaseButton({...})` (exportada; função) - Botão genérico usado pelas páginas MF1 e formulários futuros. Entradas: `props`: Propriedades do botão.; `props.children`: Conteúdo visível do botão.; `[props.type="button"]`: Tipo nativo do botão.; `[props.variant="primary"]`: Sufixo de variante visual usado no CSS.; `[props.disabled=false]`: Indica se o botão está desativado.; `[props.onClick]`: Gestor opcional de clique. Devolve: Elemento de botão estilizado.

### `real_dev/frontend/src/components/ui/ContentCard.jsx`

- `ContentCard({...})` (exportada; função) - Mostra um card com imagem opcional, badge, título, descrição, metadados e ação. Entradas: `props`: Propriedades do card.; `[props.eyebrow]`: Etiqueta curta apresentada antes do título.; `props.title`: Título principal visível no card.; `[props.description]`: Texto descritivo curto.; `[props.imageUrl]`: URL da imagem do card.; `[props.imageAlt]`: Texto alternativo da imagem.; `[props.meta]`: Informação complementar, como categoria, preço ou data.; `[props.to]`: Rota interna usada pela ação.; `[props.actionLabel="Ver detalhe"]`: Texto da ação. Devolve: Card acessível e reutilizável.

### `real_dev/frontend/src/components/ui/EmptyState.jsx`

- `EmptyState({...})` (exportada; função) - Mostra uma mensagem clara quando a página não tem dados úteis para listar. Entradas: `props`: Propriedades do estado.; `props.title`: Título curto do estado.; `props.description`: Explicação orientada para o utilizador.; `[props.children]`: Ações opcionais, como links ou botões.; `[props.tone="neutral"]`: Tom visual do estado. Devolve: Secção acessível de estado.

### `real_dev/frontend/src/components/ui/TextField.jsx`

- `TextField({...})` (exportada; função) - Read-only text field preview used before real forms exist in MF2. Entradas: `props`: Propriedades do campo de texto.; `props.id`: Id HTML usado para ligar etiqueta e input.; `props.label`: Etiqueta visível do campo.; `[props.type="text"]`: Tipo nativo do input.; `[props.value=""]`: Valor atual do campo.; `[props.placeholder=""]`: Placeholder apresentado quando o valor está vazio.; `[props.disabled=false]`: Indica se o input está desativado. Devolve: Par etiqueta/input.

### `real_dev/frontend/src/context/SessionContext.jsx`

- `SessionProvider({...})` (exportada; função) - Disponibiliza estado de sessão para toda a aplicação. Entradas: `props`: Propriedades do provider.; `props.children`: Árvore React que precisa da sessão. Devolve: Provider com estado `loading`, `anonymous` ou `authenticated`.
- `useSession()` (exportada; função) - Lê o contexto de sessão no componente atual. Entradas: sem entradas explícitas. Devolve: Estado de sessão.

### `real_dev/frontend/src/layouts/AppLayout.jsx`

- `AppLayout({...})` (exportada; função) - Estrutura de página partilhada por todas as rotas do frontend. Entradas: `props`: Propriedades do layout.; `props.children`: Conteúdo de página selecionado pelo React Router. Devolve: Estrutura da aplicação com salto acessível, cabeçalho, conteúdo principal e rodapé.

### `real_dev/frontend/src/pages/AccountPage.jsx`

- `formatRole(role)` (top-level; função) - Traduz uma role técnica para texto visível em português de Portugal. Entradas: `role`: Role persistida no backend. Devolve: Texto visível para o utilizador.
- `AccountPage()` (exportada; função) - Mostra e atualiza dados da conta autenticada. Entradas: sem entradas explícitas. Devolve: Página de conta.

### `real_dev/frontend/src/pages/AdminBiblicalPassagesPage.jsx`

- `passagePayload(form)` (top-level; função) - Converte campos numéricos do formulário para números. Entradas: `form`: Dados do formulário. Devolve: Payload da API.
- `AdminBiblicalPassagesPage()` (exportada; função) - Página de gestão editorial de passagens bíblicas. Entradas: sem entradas explícitas. Devolve: Página admin.

### `real_dev/frontend/src/pages/AdminCatalogPage.jsx`

- `AdminCatalogPage()` (exportada; função) - Página mínima de administração do catálogo. Entradas: sem entradas explícitas. Devolve: Página administrativa de catálogo.

### `real_dev/frontend/src/pages/AdminCharityApplicationsPage.jsx`

- `AdminCharityApplicationsPage()` (exportada; função) - Painel administrativo para decidir candidaturas pendentes. Entradas: sem entradas explícitas. Devolve: Lista de candidaturas com acoes de aprovar e rejeitar.

### `real_dev/frontend/src/pages/AdminCharityMembersPage.jsx`

- `AdminCharityMembersPage()` (exportada; função) - Formulário administrativo de ligação utilizador-associação. Entradas: sem entradas explícitas. Devolve: Interface simples para criar ou atualizar membership.

### `real_dev/frontend/src/pages/AdminIntegrationsPage.jsx`

- `AdminIntegrationsPage()` (exportada; função) - Página para gerir integrações previstas no MVP sem guardar segredos. Entradas: sem entradas explícitas. Devolve: Página de integrações.

### `real_dev/frontend/src/pages/AdminMetricsPage.jsx`

- `formatCents(cents)` (top-level; função) - Formata cêntimos em euros pt-PT. Entradas: `cents`: Valor em centimos. Devolve: Valor formatado.
- `MetricCard({...})` (top-level; função) - Renderiza um cartão simples de métrica. Entradas: `props`: Dados do cartão. Devolve: Cartão de métrica.
- `AdminMetricsPage()` (exportada; função) - Página admin com métricas agregadas sem dados pessoais individuais. Entradas: sem entradas explícitas. Devolve: Página de métricas.

### `real_dev/frontend/src/pages/AdminPoolDashboardPage.jsx`

- `formatMoney(cents)` (top-level; função) - Formata valores monetários persistidos em cêntimos com convenções portuguesas. Entradas: `cents`: Valor monetário em cêntimos. Devolve: Valor formatado em euros.
- `AdminPoolDashboardPage()` (exportada; função) - Mostra totais mensais agregados da pool. Entradas: sem entradas explícitas. Devolve: Dashboard administrativo da pool solidária.

### `real_dev/frontend/src/pages/AdminPoolDistributionPage.jsx`

- `formatMoney(cents)` (top-level; função) - Formata valores monetários persistidos em cêntimos com convenções portuguesas. Entradas: `cents`: Valor monetário em cêntimos. Devolve: Valor formatado em euros.
- `AdminPoolDistributionPage()` (exportada; função) - Painel administrativo para executar e consultar a distribuição mensal. Entradas: sem entradas explícitas. Devolve: Formulário mensal e resultado persistido.

### `real_dev/frontend/src/pages/AdminUsersPage.jsx`

- `AdminUsersPage()` (exportada; função) - Página administrativa mínima para gestão de roles de utilizadores. Entradas: sem entradas explícitas. Devolve: Página administrativa de utilizadores.

### `real_dev/frontend/src/pages/CatalogPage.jsx`

- `CatalogPage()` (exportada; função) - Mostra conteúdos publicados e o bloco "continuar a ver". Entradas: sem entradas explícitas. Devolve: Página de catálogo.

### `real_dev/frontend/src/pages/CharityApplicationPage.jsx`

- `CharityApplicationPage()` (exportada; função) - Página pública para candidatura de associações. Entradas: sem entradas explícitas. Devolve: Formulário de submissão com feedback de erro e sucesso.

### `real_dev/frontend/src/pages/CharityHistoryPage.jsx`

- `CharityHistoryPage()` (exportada; função) - Mostra histórico de distribuição para uma associação. Entradas: sem entradas explícitas. Devolve: Página privada de histórico.

### `real_dev/frontend/src/pages/ContentDetailPage.jsx`

- `formatDuration(seconds)` (top-level; função) - Converte duração em segundos para texto curto de minutos. A página recebe duração técnica do backend, mas mostra uma leitura simples para o utilizador na ficha do conteúdo. Entradas: `seconds`: Duração total do conteúdo em segundos. Devolve: Duração arredondada no formato `<minutos> min`.
- `ContentDetailPage()` (exportada; função) - Página pública de detalhe de conteúdo. Entradas: sem entradas explícitas. Devolve: Página de detalhe de conteúdo.

### `real_dev/frontend/src/pages/DiscoveryHomePage.jsx`

- `DiscoveryHomePage()` (exportada; função) - Mostra a entrada principal da plataforma e os carrosséis de descoberta. Entradas: sem entradas explícitas. Devolve: Página inicial da aplicação.

### `real_dev/frontend/src/pages/ForYouPage.jsx`

- `ForYouPage()` (exportada; função) - Mostra recomendações baseline para o utilizador autenticado. Entradas: sem entradas explícitas. Devolve: Página de recomendações pessoais.

### `real_dev/frontend/src/pages/LoginPage.jsx`

- `LoginPage()` (exportada; função) - Renderiza a página de autenticação da MF2. Entradas: sem entradas explícitas. Devolve: Página de login, registo e recuperação.

### `real_dev/frontend/src/pages/MyLibraryPage.jsx`

- `LibrarySection({...})` (top-level; função) - Mostra uma lista de conteúdos da biblioteca pessoal. Entradas: `props`: Propriedades da lista.; `props.title`: Título da secção.; `props.items`: Conteúdos da lista. Devolve: Secção de biblioteca.
- `MyLibraryPage()` (exportada; função) - Mostra favoritos, watchlist e histórico do utilizador autenticado. Entradas: sem entradas explícitas. Devolve: Página da minha biblioteca.

### `real_dev/frontend/src/pages/NotificationsPage.jsx`

- `NotificationsPage()` (exportada; função) - Página de notificações e preferências do utilizador autenticado. Entradas: sem entradas explícitas. Devolve: Interface de leitura e configuracao de notificações.

### `real_dev/frontend/src/pages/PlaybackPage.jsx`

- `hasOption(options, value, key)` (top-level; função) - Confirma se uma opção de media está disponível para seleção. A função procura pelo valor indicado numa lista de opções e ignora entradas bloqueadas, evitando que a UI mantenha uma preferência indisponível. Entradas: `options`: Opções de áudio, qualidade ou legendas.; `value`: Valor atualmente guardado nas preferências.; `key`: Campo usado para comparar cada opção. Devolve: `true` quando a opção existe e não está bloqueada.
- `qualityRank(value)` (top-level; função) - Ordena qualidades de video por resolução. Entradas: `value`: Valor como `1080p` ou `2160p`. Devolve: Ranking numerico.
- `PlaybackPage()` (exportada; função) - Renderiza a página autenticada de reprodução com controlos de media e persistência de progresso. Entradas: sem entradas explícitas. Devolve: Página de reprodução.

### `real_dev/frontend/src/pages/PublicCharitiesPage.jsx`

- `PublicCharitiesPage()` (exportada; função) - Lista associações públicas e dá acesso ao formulário de candidatura. Entradas: sem entradas explícitas. Devolve: Página pública de associações.

### `real_dev/frontend/src/pages/SearchPage.jsx`

- `SearchPage()` (exportada; função) - Permite pesquisar conteúdos publicados por texto, tipo e taxonomia. Entradas: sem entradas explícitas. Devolve: Página de pesquisa.

### `real_dev/frontend/src/pages/SubscriptionPage.jsx`

- `formatDate(value)` (top-level; função) - Formata uma data para padrão europeu. Entradas: `value`: Valor de data. Devolve: Data formatada em português de Portugal.
- `formatPrice(cents)` (top-level; função) - Formata preço em cêntimos. Entradas: `cents`: Valor em cêntimos. Devolve: Valor monetário em euros.
- `formatQuality(quality)` (top-level; função) - Formata a qualidade máxima para UI. Entradas: `quality`: Qualidade técnica. Devolve: Qualidade legível.
- `familyUserLabel(user)` (top-level; função) - Mostra o nome seguro de um utilizador familiar. Entradas: `user`: Utilizador reduzido. Devolve: Nome ou email.
- `SubscriptionPage()` (exportada; função) - Mostra planos, subscrição atual, trial e gestão familiar. Entradas: sem entradas explícitas. Devolve: Página de subscrição.

### `real_dev/frontend/src/pages/pages.jsx`

- `HomePage()` (exportada; função) - Página inicial da base frontend da MF1. Entradas: sem entradas explícitas. Devolve: Página inicial do produto com estado técnico da API.
- `CatalogPage()` (exportada; função) - Página provisória controlada para trabalho posterior do catálogo MF2. Entradas: sem entradas explícitas. Devolve: Página base de catálogo sem dados reais de catálogo.
- `LoginPage()` (exportada; função) - Pré-visualização de login sem autenticação real. Entradas: sem entradas explícitas. Devolve: Formulário de login desativado que evita comportamento falso de autenticação.
- `AssociationsPage()` (exportada; função) - Página provisória de associações. Entradas: sem entradas explícitas. Devolve: Estado vazio para fluxos futuros de candidatura de associações.
- `PlansPage()` (exportada; função) - Página provisória de planos. Entradas: sem entradas explícitas. Devolve: Estado vazio para planos de subscrição futuros.
- `AccountPage()` (exportada; função) - Página provisória de conta. Entradas: sem entradas explícitas. Devolve: Estado vazio para funcionalidades futuras de perfil e privacidade.
- `NotificationsPage()` (exportada; função) - Página provisória de notificações. Entradas: sem entradas explícitas. Devolve: Estado vazio para notificações transacionais futuras.
- `SearchPage()` (exportada; função) - Página provisória de pesquisa. Entradas: sem entradas explícitas. Devolve: Estado vazio para pesquisa unificada futura.
- `NotFoundPage()` (exportada; função) - Rota fallback para URLs desconhecidas do frontend. Entradas: sem entradas explícitas. Devolve: Página amigável de recurso não encontrado.

### `real_dev/frontend/src/routes/AppRoutes.jsx`

- `withAdminRoute(page, allowedRoles)` (top-level; função) - Envolve páginas administrativas na guarda visual. Entradas: `page`: Página administrativa.; `[allowedRoles=["admin"]`: ] Roles aceites pela rota. Devolve: Rota protegida pela sessão.
- `AppRoutes()` (exportada; função) - Declara a árvore de rotas renderizada dentro do layout partilhado. Entradas: sem entradas explícitas. Devolve: Rotas da aplicação.

### `real_dev/frontend/src/services/api/apiClient.js`

- `buildUrl(path)` (top-level; função) - Constrói uma URL absoluta da API a partir de um caminho de rota. Entradas: `path`: Caminho da API, com ou sem barra inicial. Devolve: URL absoluta para o backend configurado.
- `parseResponseBody(response)` (top-level; função) - Interpreta o corpo de uma resposta HTTP de acordo com o respetivo tipo de conteúdo. Entradas: `response`: Resposta Fetch devolvida pelo navegador. Devolve: JSON interpretado, invólucro de texto ou null para respostas vazias.
- `request(path, {...})` (top-level; função) - Envia um pedido HTTP através do cliente central da API FaithFlix. Entradas: `path`: Caminho da API a chamar.; `[options={}]`: Opções de Fetch. Devolve: Corpo da resposta interpretado.
- `get(path, options)` (top-level; função) - Envia um pedido GET. Entradas: `path`: Caminho da API a chamar.; `[options]`: Configuração Fetch opcional. Devolve: Corpo da resposta interpretado.
- `post(path, body, options)` (top-level; função) - Envia um pedido POST com corpo JSON opcional. Entradas: `path`: Caminho da API a chamar.; `body`: Corpo JSON a enviar.; `[options]`: Configuração Fetch opcional. Devolve: Corpo da resposta interpretado.
- `put(path, body, options)` (top-level; função) - Envia um pedido PUT com corpo JSON opcional. Entradas: `path`: Caminho da API a chamar.; `body`: Corpo JSON a enviar.; `[options]`: Configuração Fetch opcional. Devolve: Corpo da resposta interpretado.
- `patch(path, body, options)` (top-level; função) - Envia um pedido PATCH com corpo JSON opcional. Entradas: `path`: Caminho da API a chamar.; `body`: Corpo JSON a enviar.; `[options]`: Configuração Fetch opcional. Devolve: Corpo da resposta interpretado.
- `del(path, options)` (top-level; função) - Envia um pedido DELETE. Entradas: `path`: Caminho da API a chamar.; `[options]`: Configuração Fetch opcional. Devolve: Corpo da resposta interpretado.

### `real_dev/frontend/src/services/api/apiErrors.js`

- `constructor({...})` (pública; método de classe) - Cria um erro API normalizado. Entradas: `params`: Parâmetros do erro API.; `params.status`: Código HTTP, ou 0 em falhas de rede.; `params.message`: Mensagem segura para apresentar ao utilizador.; `[params.details=undefined]`: Detalhes estruturados opcionais do erro.; `[params.requestId=undefined]`: Identificador de pedido opcional devolvido pelo backend. Devolve: Não devolve payload explícito.
- `getDefaultApiErrorMessage(status)` (exportada; função) - Devolve uma mensagem segura em Português para um estado da API. Entradas: `estado`: Código HTTP, ou 0 quando não houve resposta. Devolve: Mensagem de erro em Português para o utilizador.
- `toUserMessage(error)` (exportada; função) - Converte qualquer valor lançado numa mensagem segura para a UI. Entradas: `error`: Error caught by a component or service. Devolve: Mensagem que pode ser apresentada ao utilizador.

### `real_dev/frontend/src/services/api/authApi.js`

- `register(data)` (top-level; método de objeto) - Regista um utilizador e inicia sessão. Entradas: `data`: Dados de registo. Devolve: Utilizador público e estado de sessão.
- `login(data)` (top-level; método de objeto) - Autentica um utilizador existente. Entradas: `data`: Dados de login. Devolve: Utilizador público e estado de sessão.
- `forgotPassword(data)` (top-level; método de objeto) - Pede criação de token de recuperação de password. Entradas: `data`: Dados com email. Devolve: Mensagem pública genérica.
- `resetPassword(data)` (top-level; método de objeto) - Substitui password usando um token válido. Entradas: `data`: Dados com token e nova password. Devolve: Mensagem de sucesso.
- `me()` (top-level; método de objeto) - Obtém a sessão atual. Entradas: sem entradas explícitas. Devolve: Utilizador autenticado ou `null`.
- `logout()` (top-level; método de objeto) - Termina a sessão atual. Entradas: sem entradas explícitas. Devolve: Resposta vazia de logout.

### `real_dev/frontend/src/services/api/biblicalPassagesApi.js`

- `queryString(params)` (top-level; função) - Constrói query string simples para paginação. Entradas: `params`: Parâmetros. Devolve: Query string com prefixo.
- `listPublished(params)` (top-level; método de objeto) - Lista passagens bíblicas publicadas para as páginas públicas. Os filtros são convertidos para query string antes da chamada HTTP, para o backend aplicar paginação sem o frontend conhecer a implementação MongoDB. Entradas: `params`: Filtros opcionais de paginação enviados como query string. Devolve: Página de passagens devolvida pela API.
- `listForContent(idOrSlug)` (top-level; método de objeto) - Lista passagens associadas a um conteúdo público. Entradas: `idOrSlug`: Id ou slug do conteúdo. Devolve: Resposta da API.
- `listAdmin(params)` (top-level; método de objeto) - Lista passagens bíblicas para administração editorial. Esta chamada usa a rota protegida de administração e permite consultar passagens publicadas, rascunhos e conteúdos em revisão. Entradas: `params`: Filtros opcionais de paginação enviados como query string. Devolve: Página administrativa devolvida pela API.
- `listAdminForContent(contentId)` (top-level; método de objeto) - Lista associações de passagens de um conteúdo para administração. Entradas: `contentId`: Id do conteúdo. Devolve: Resposta da API.
- `create(input)` (top-level; método de objeto) - Cria uma passagem como rascunho. Entradas: `input`: Dados da passagem. Devolve: Resposta da API.
- `update(passageId, input)` (top-level; método de objeto) - Atualiza uma passagem existente. Entradas: `passageId`: Id da passagem.; `input`: Dados da passagem. Devolve: Resposta da API.
- `updateStatus(passageId, status)` (top-level; método de objeto) - Altera o estado editorial de uma passagem. Entradas: `passageId`: Id da passagem.; `status`: Novo estado. Devolve: Resposta da API.
- `linkToContent(contentId, input)` (top-level; método de objeto) - Associa uma passagem a um conteúdo. Entradas: `contentId`: Id do conteúdo.; `input`: Associação. Devolve: Resposta da API.
- `unlinkFromContent(contentId, passageId)` (top-level; método de objeto) - Remove uma associação entre conteúdo e passagem. Entradas: `contentId`: Id do conteúdo.; `passageId`: Id da passagem. Devolve: Resposta da API.

### `real_dev/frontend/src/services/api/catalogApi.js`

- `listPublished()` (top-level; método de objeto) - Lista conteúdos publicados disponíveis para o público. Esta chamada alimenta páginas de catálogo sem expor rascunhos ou metadados administrativos. Entradas: sem entradas explícitas. Devolve: Catálogo público devolvido pela API.
- `getDetail(idOrSlug)` (top-level; método de objeto) - Obtém o detalhe público de um conteúdo. Aceita tanto identificador como slug para permitir navegação por URLs legíveis sem duplicar lógica no frontend. Entradas: `idOrSlug`: Identificador técnico ou slug público do conteúdo. Devolve: Detalhe público devolvido pela API.
- `listAdmin()` (top-level; método de objeto) - Lista conteúdos para gestão administrativa. A rota administrativa pode incluir rascunhos, itens arquivados e metadados que não pertencem ao catálogo público. Entradas: sem entradas explícitas. Devolve: Catálogo administrativo devolvido pela API.
- `createContent(input)` (top-level; método de objeto) - Cria um novo conteúdo no catálogo. O payload vem dos formulários administrativos e é validado no backend antes de ser persistido. Entradas: `input`: Dados editoriais do novo conteúdo. Devolve: Conteúdo criado devolvido pela API.
- `updateContent(contentId, input)` (top-level; método de objeto) - Atualiza campos editoriais de um conteúdo existente. O identificador vai no URL e o corpo transporta apenas os campos que a interface administrativa pretende alterar. Entradas: `contentId`: Identificador do conteúdo.; `input`: Campos editoriais atualizados. Devolve: Conteúdo atualizado devolvido pela API.
- `updateStatus(contentId, status)` (top-level; método de objeto) - Altera o estado editorial de um conteúdo. A função envia apenas o novo estado, deixando a API validar transições como publicação, arquivo ou regresso a rascunho. Entradas: `contentId`: Identificador do conteúdo.; `status`: Novo estado editorial. Devolve: Conteúdo com estado atualizado.
- `listRevisions(contentId)` (top-level; método de objeto) - Lista revisões guardadas de um conteúdo. A chamada permite à administração comparar versões anteriores antes de decidir reverter uma alteração. Entradas: `contentId`: Identificador do conteúdo. Devolve: Histórico de revisões devolvido pela API.
- `revertRevision(contentId, revisionId)` (top-level; método de objeto) - Reverte um conteúdo para uma revisão anterior. O URL identifica simultaneamente o conteúdo atual e a revisão escolhida, evitando que o frontend envie estado editorial reconstruído manualmente. Entradas: `contentId`: Identificador do conteúdo.; `revisionId`: Identificador da revisão a restaurar. Devolve: Conteúdo restaurado devolvido pela API.
- `listTaxonomies()` (top-level; método de objeto) - Lista taxonomias disponíveis para classificar conteúdos. A UI usa esta lista para preencher filtros e formulários editoriais sem duplicar categorias em código frontend. Entradas: sem entradas explícitas. Devolve: Lista de taxonomias devolvida pela API.
- `createTaxonomy(input)` (top-level; método de objeto) - Cria uma nova taxonomia editorial. O payload contém nome, slug e descrição opcional, sendo normalizado e validado pela API antes de ficar disponível no catálogo. Entradas: `input`: Dados da nova taxonomia. Devolve: Taxonomia criada devolvida pela API.

### `real_dev/frontend/src/services/api/charitiesApi.js`

- `apiUrl(path)` (top-level; função) - Constrói URL absoluta para downloads servidos diretamente pelo backend. Entradas: `path`: Caminho HTTP da API. Devolve: URL absoluta.
- `submitApplication(input)` (top-level; método de objeto) - Submete uma candidatura pública. Entradas: `input`: Campos do formulário. Devolve: Candidatura criada.
- `listApplications(status)` (top-level; método de objeto) - Lista candidaturas para ecrãs de administração. Entradas: `[status="pending"]`: Estado a consultar. Devolve: Lista devolvida pela API.
- `reviewApplication(id, input)` (top-level; método de objeto) - Revê uma candidatura pendente. Entradas: `id`: Identificador da candidatura.; `input`: Decisão administrativa. Devolve: Resultado da revisão.
- `runDistribution(month)` (top-level; método de objeto) - Executa a distribuição mensal da pool solidária. Entradas: `month`: Mês no formato `YYYY-MM`. Devolve: Distribuição persistida.
- `getDistribution(month)` (top-level; método de objeto) - Consulta uma distribuição mensal já criada. Entradas: `month`: Mês no formato `YYYY-MM`. Devolve: Distribuição persistida.
- `listPublicCharities()` (top-level; método de objeto) - Lista associações públicas elegíveis. Entradas: sem entradas explícitas. Devolve: Associações públicas.
- `listPublic()` (top-level; método de objeto) - Alias curto usado por páginas antigas do frontend. Entradas: sem entradas explícitas. Devolve: Associações públicas.
- `getPoolDashboard()` (top-level; método de objeto) - Obtém o dashboard administrativo da pool. Entradas: sem entradas explícitas. Devolve: Meses agregados.
- `getCharityHistory(charityId)` (top-level; método de objeto) - Obtém histórico privado de uma associação. Entradas: `charityId`: Identificador da associação. Devolve: Histórico de distribuição.
- `historyCsvUrl(charityId)` (top-level; método de objeto) - Constrói URL para download CSV do histórico. Entradas: `charityId`: Identificador da associação. Devolve: URL absoluta do CSV.
- `linkUserToCharity(charityId, userId)` (top-level; método de objeto) - Liga um utilizador a uma associação. Entradas: `charityId`: Identificador da associação.; `userId`: Identificador do utilizador. Devolve: Ligação criada ou atualizada.

### `real_dev/frontend/src/services/api/commentsApi.js`

- `list(contentId)` (top-level; método de objeto) - Lista comentários visíveis de um conteúdo. O identificador do conteúdo segue no URL para a API devolver apenas a conversa associada a esse item do catálogo. Entradas: `contentId`: Identificador do conteúdo comentado. Devolve: Lista de comentários devolvida pela API.
- `create(contentId, body)` (top-level; método de objeto) - Cria um novo comentário no conteúdo indicado. O texto é enviado no corpo do pedido e a API associa o autor a partir da sessão autenticada. Entradas: `contentId`: Identificador do conteúdo comentado.; `body`: Texto escrito pelo utilizador. Devolve: Comentário criado devolvido pela API.
- `remove(commentId)` (top-level; método de objeto) - Remove um comentário pelo seu identificador. A API valida se a sessão atual pode apagar o comentário antes de executar a operação. Entradas: `commentId`: Identificador do comentário. Devolve: Resultado da remoção devolvido pela API.
- `moderate(commentId, input)` (top-level; método de objeto) - Atualiza o estado de moderação de um comentário. O payload contém a decisão administrativa e a API aplica as regras de autorização antes de alterar a visibilidade do comentário. Entradas: `commentId`: Identificador do comentário moderado.; `input`: Decisão ou dados de moderação. Devolve: Comentário moderado devolvido pela API.

### `real_dev/frontend/src/services/api/discoveryApi.js`

- `home()` (top-level; método de objeto) - Obtém os blocos de descoberta da página inicial. A API agrega secções como destaques, categorias e recomendações públicas para a home sem a página conhecer a origem de cada bloco. Entradas: sem entradas explícitas. Devolve: Conteúdo de descoberta devolvido pela API.
- `related(contentId)` (top-level; método de objeto) - Lista conteúdos relacionados com um item do catálogo. O identificador do conteúdo base é codificado no URL para o backend calcular sugestões relacionadas. Entradas: `contentId`: Identificador do conteúdo base. Devolve: Lista de conteúdos relacionados devolvida pela API.

### `real_dev/frontend/src/services/api/integrationsApi.js`

- `listIntegrations()` (top-level; método de objeto) - Lista integracoes configuraveis. Entradas: sem entradas explícitas. Devolve: Lista de integracoes.
- `updateIntegration(key, input)` (top-level; método de objeto) - Atualiza estado publico de uma integracao. Entradas: `key`: Chave da integracao.; `input`: Configuracao publica. Devolve: Integracao atualizada.

### `real_dev/frontend/src/services/api/libraryApi.js`

- `listFavorites()` (top-level; método de objeto) - Lista os favoritos da conta autenticada. A função não recebe argumentos porque o backend identifica o utilizador a partir da sessão enviada pelo `apiClient`. Entradas: sem entradas explícitas. Devolve: Lista de conteúdos favoritos devolvida pela API.
- `addFavorite(contentId)` (top-level; método de objeto) - Adiciona um conteúdo à lista de favoritos do utilizador. O identificador segue no URL para a API associar o conteúdo à biblioteca da sessão atual. Entradas: `contentId`: Identificador do conteúdo a marcar como favorito. Devolve: Favorito criado ou estado atualizado devolvido pela API.
- `removeFavorite(contentId)` (top-level; método de objeto) - Remove um conteúdo da lista de favoritos do utilizador. A remoção é feita por identificador de conteúdo, mantendo a decisão de autorização no backend. Entradas: `contentId`: Identificador do conteúdo a remover dos favoritos. Devolve: Resultado da remoção devolvido pela API.
- `listWatchlist()` (top-level; método de objeto) - Lista os conteúdos guardados para ver mais tarde. A rota devolve a watchlist da sessão atual sem o frontend precisar de transportar o identificador do utilizador. Entradas: sem entradas explícitas. Devolve: Lista de watchlist devolvida pela API.
- `addWatchlist(contentId)` (top-level; método de objeto) - Adiciona um conteúdo à watchlist do utilizador. O frontend envia apenas o identificador do conteúdo; a API decide se cria ou mantém a associação existente. Entradas: `contentId`: Identificador do conteúdo a guardar para mais tarde. Devolve: Entrada de watchlist criada ou atualizada pela API.
- `removeWatchlist(contentId)` (top-level; método de objeto) - Remove um conteúdo da watchlist do utilizador. A função aponta a associação pelo conteúdo e deixa a API validar se a watchlist pertence à sessão atual. Entradas: `contentId`: Identificador do conteúdo a remover da watchlist. Devolve: Resultado da remoção devolvido pela API.
- `listHistory()` (top-level; método de objeto) - Lista o histórico de reprodução do utilizador autenticado. A chamada alimenta páginas de biblioteca e progresso sem expor dados de outros utilizadores no frontend. Entradas: sem entradas explícitas. Devolve: Histórico pessoal devolvido pela API.

### `real_dev/frontend/src/services/api/metricsApi.js`

- `buildMetricsQuery(filters)` (top-level; função) - Constrói query string ignorando filtros vazios. Entradas: `filters`: Filtros da UI. Devolve: Query string pronta para anexar ao endpoint.
- `getAdminMetrics(filters)` (top-level; método de objeto) - Lê metricas admin agregadas. Entradas: `filters`: Filtros opcionais. Devolve: Metricas agregadas.

### `real_dev/frontend/src/services/api/notificationsApi.js`

- `list()` (top-level; método de objeto) - Lista notificações do utilizador autenticado. Entradas: sem entradas explícitas. Devolve: Notificações recentes.
- `markAsRead(id)` (top-level; método de objeto) - Marca uma notificação como lida. Entradas: `id`: Identificador da notificação. Devolve: Notificação atualizada.
- `getPreferences()` (top-level; método de objeto) - Obtem preferências de notificação. Entradas: sem entradas explícitas. Devolve: Preferências atuais.
- `updatePreferences(input)` (top-level; método de objeto) - Atualiza preferências de notificação no backend. Entradas: `input`: Preferências escolhidas pelo utilizador. Devolve: Preferências guardadas.

### `real_dev/frontend/src/services/api/paymentsApi.js`

- `simulatedCheckout(input)` (top-level; método de objeto) - Pede ao backend para executar um checkout com método de teste. Entradas: `input`: Plano, método de teste e resultado simulado. Devolve: Resultado devolvido pela API.
- `startTrial()` (top-level; método de objeto) - Inicia trial gratuito do utilizador autenticado. Entradas: sem entradas explícitas. Devolve: Trial e subscrição temporária.

### `real_dev/frontend/src/services/api/playbackApi.js`

- `getPlayback(contentId)` (top-level; método de objeto) - Obtém o estado de reprodução de um conteúdo. A API devolve progresso, preferências e dados necessários para retomar a experiência de visualização do utilizador autenticado. Entradas: `contentId`: Identificador do conteúdo a reproduzir. Devolve: Estado de reprodução devolvido pela API.
- `saveProgress(contentId, currentTimeSeconds)` (top-level; método de objeto) - Guarda o ponto de progresso atual de um conteúdo. O tempo é enviado em segundos para o backend poder reconstruir a posição quando o utilizador regressar ao mesmo conteúdo. Entradas: `contentId`: Identificador do conteúdo em reprodução.; `currentTimeSeconds`: Posição atual do leitor em segundos. Devolve: Progresso persistido devolvido pela API.
- `listContinueWatching()` (top-level; método de objeto) - Lista conteúdos que o utilizador pode continuar a ver. A função consulta a fila pessoal calculada pelo backend a partir do histórico de progresso. Entradas: sem entradas explícitas. Devolve: Lista "continuar a ver" devolvida pela API.
- `getPreferences()` (top-level; método de objeto) - Obtém as preferências globais de reprodução da conta. Estas preferências alimentam opções como legendas, áudio ou comportamento padrão do leitor. Entradas: sem entradas explícitas. Devolve: Preferências de reprodução devolvidas pela API.
- `savePreferences(input)` (top-level; método de objeto) - Atualiza as preferências globais de reprodução da conta. O objeto recebido vem da UI de preferências e é validado no backend antes de ser persistido. Entradas: `input`: Preferências escolhidas pelo utilizador. Devolve: Preferências atualizadas devolvidas pela API.

### `real_dev/frontend/src/services/api/privacyApi.js`

- `exportMyData()` (top-level; método de objeto) - Pede a exportacao JSON dos dados do utilizador autenticado. Entradas: sem entradas explícitas. Devolve: Exportacao devolvida pelo backend.
- `deleteMyAccount(input)` (top-level; método de objeto) - Elimina a propria conta com confirmacao textual forte. Entradas: `input`: Confirmacao recebida da UI. Devolve: Resultado da eliminacao.
- `getMyConsents()` (top-level; método de objeto) - Lê consentimentos atuais do utilizador autenticado. Entradas: sem entradas explícitas. Devolve: Estado de consentimentos.
- `updateMyConsents(input)` (top-level; método de objeto) - Atualiza consentimentos opcionais. Entradas: `input`: Escolhas de consentimento. Devolve: Estado atualizado.

### `real_dev/frontend/src/services/api/ratingsApi.js`

- `getSummary(contentId)` (top-level; método de objeto) - Obtém o resumo público de avaliações de um conteúdo. O identificador é codificado no URL para pedir ao backend a média, total e distribuição agregada sem expor avaliações individuais. Entradas: `contentId`: Identificador do conteúdo avaliado. Devolve: Resumo de avaliações devolvido pela API.
- `getMine(contentId)` (top-level; método de objeto) - Obtém a avaliação do utilizador autenticado para um conteúdo. A sessão é enviada por cookie HttpOnly pelo `apiClient`, por isso a função só precisa do identificador do conteúdo. Entradas: `contentId`: Identificador do conteúdo avaliado. Devolve: Avaliação pessoal devolvida pela API.
- `save(contentId, value)` (top-level; método de objeto) - Guarda ou atualiza a avaliação do utilizador autenticado. O valor é enviado no corpo do pedido, enquanto o conteúdo avaliado segue no URL para o backend aplicar autorização e validação de domínio. Entradas: `contentId`: Identificador do conteúdo avaliado.; `value`: Valor da avaliação escolhido na interface. Devolve: Avaliação persistida devolvida pela API.
- `remove(contentId)` (top-level; método de objeto) - Remove a avaliação do utilizador autenticado para um conteúdo. A função apenas indica o conteúdo alvo; o backend usa a sessão para saber qual avaliação pessoal deve ser removida. Entradas: `contentId`: Identificador do conteúdo avaliado. Devolve: Resultado da remoção devolvido pela API.

### `real_dev/frontend/src/services/api/recommendationsApi.js`

- `mine()` (top-level; método de objeto) - Obtém recomendações do utilizador autenticado através do cliente API central. Entradas: sem entradas explícitas. Devolve: Dados devolvidos pelo backend.

### `real_dev/frontend/src/services/api/searchApi.js`

- `buildSearchParams(input)` (top-level; função) - Constrói os parâmetros de query para a pesquisa de conteúdos. A função centraliza os defaults de paginação e ordenação para a UI não montar URLs manualmente em cada chamada de pesquisa. Entradas: `input`: Filtros escolhidos pelo utilizador. Devolve: Parâmetros serializáveis para a rota de pesquisa.
- `search(input)` (top-level; método de objeto) - Executa uma pesquisa no catálogo. Os filtros recebidos da interface são convertidos por `buildSearchParams` antes de chamar a API. Entradas: `input`: Filtros de pesquisa. Devolve: Resultados paginados devolvidos pela API.

### `real_dev/frontend/src/services/api/subscriptionsApi.js`

- `listPlans()` (top-level; método de objeto) - Lista os planos de subscrição disponíveis para escolha pública. A resposta vem do backend para manter preços, ciclos e limites familiares sincronizados com as regras comerciais atuais. Entradas: sem entradas explícitas. Devolve: Planos ativos públicos.
- `getMine()` (top-level; método de objeto) - Obtém a subscrição associada à sessão atual. Usa os cookies HttpOnly enviados pelo `apiClient`, por isso não recebe token nem identificador de utilizador como argumento. Entradas: sem entradas explícitas. Devolve: Estado da subscrição do utilizador autenticado.
- `cancelRenewal()` (top-level; método de objeto) - Cancela a renovação automática da subscrição atual. A chamada não apaga imediatamente o acesso; pede ao backend para marcar a subscrição como não renovável no fim do período contratado. Entradas: sem entradas explícitas. Devolve: Subscrição atualizada com renovação cancelada.
- `getFamily()` (top-level; método de objeto) - Obtém o estado do grupo familiar ligado à subscrição atual. Devolve membros, convites pendentes e permissões que a interface usa para decidir se mostra ações de convite, remoção ou saída. Entradas: sem entradas explícitas. Devolve: Estado familiar do utilizador autenticado.
- `inviteFamilyMember(input)` (top-level; método de objeto) - Convida uma conta existente para o plano Familia. Entradas: `input`: Email da conta convidada. Devolve: Convite criado e estado familiar atualizado.
- `acceptFamilyInvitation(invitationId)` (top-level; método de objeto) - Aceita um convite familiar pendente. O identificador é colocado no URL para o backend validar se o convite ainda existe, pertence ao utilizador autenticado e pode ser aceite. Entradas: `invitationId`: Identificador do convite familiar. Devolve: Estado familiar atualizado depois da aceitação.
- `declineFamilyInvitation(invitationId)` (top-level; método de objeto) - Recusa um convite familiar pendente. A operação informa o backend de que o convite não deve continuar disponível para a conta autenticada. Entradas: `invitationId`: Identificador do convite familiar. Devolve: Estado familiar atualizado depois da recusa.
- `removeFamilyMember(memberId)` (top-level; método de objeto) - Remove um membro do grupo familiar. Só envia o identificador do membro; a autorização para remover esse membro é sempre confirmada no backend com base na sessão atual. Entradas: `memberId`: Identificador do utilizador membro. Devolve: Estado familiar atualizado sem o membro removido.
- `leaveFamily()` (top-level; método de objeto) - Remove a conta autenticada do grupo familiar atual. Esta ação representa a saída voluntária do utilizador, sem permitir escolher outro membro por engano a partir do frontend. Entradas: sem entradas explícitas. Devolve: Estado familiar depois da saída.

### `real_dev/frontend/src/services/api/systemApi.js`

- `getApiStatus()` (exportada; função) - Obtém o estado técnico exposto por `GET /api`. Entradas: sem entradas explícitas. Devolve: Dados de estado da API devolvidos pelo backend.

### `real_dev/frontend/src/services/api/userApi.js`

- `buildUserFilters(filters)` (top-level; função) - Constrói query string da listagem admin. Entradas: `filters`: Filtros da UI. Devolve: Query string.
- `getMe()` (top-level; método de objeto) - Obtém o perfil da conta autenticada. A sessão é resolvida pelo backend através dos cookies enviados pelo `apiClient`, sem o frontend transportar tokens. Entradas: sem entradas explícitas. Devolve: Perfil do utilizador autenticado.
- `updateMe(input)` (top-level; método de objeto) - Atualiza dados editáveis do perfil da conta autenticada. O payload vem do formulário de conta e a API decide que campos podem ser alterados pelo próprio utilizador. Entradas: `input`: Dados de perfil a atualizar. Devolve: Perfil atualizado devolvido pela API.
- `updateParental(parentalMaxAgeRating)` (top-level; método de objeto) - Atualiza o limite parental da conta autenticada. O valor máximo permitido segue no corpo do pedido para o backend aplicar validação e persistência segura. Entradas: `parentalMaxAgeRating`: Limite etário máximo escolhido. Devolve: Perfil parental atualizado devolvido pela API.
- `listUsers(filters)` (top-level; método de objeto) - Lista contas para a área administrativa de utilizadores. Os filtros recebidos pelo formulário são serializados para query string, deixando a paginação e pesquisa efetiva a cargo da API. Entradas: `filters`: Filtros opcionais de pesquisa e paginação. Devolve: Lista de utilizadores devolvida pela API.
- `updateRole(userId, role)` (top-level; método de objeto) - Atualiza o papel administrativo de uma conta. A função envia o identificador no URL e o novo papel no corpo, deixando a API aplicar autorização administrativa. Entradas: `userId`: Identificador da conta a alterar.; `role`: Novo papel atribuído à conta. Devolve: Utilizador atualizado devolvido pela API.
- `updateUserAdmin(userId, input)` (top-level; método de objeto) - Atualiza role e/ou estado operacional pela rota admin MF5. Entradas: `userId`: Identificador do utilizador alvo.; `input`: Alteracao admin. Devolve: Resultado devolvido pelo backend.
