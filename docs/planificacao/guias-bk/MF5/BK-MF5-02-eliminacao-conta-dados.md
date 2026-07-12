# BK-MF5-02 - Eliminação de conta e dados

## Header

- `doc_id`: `GUIA-BK-MF5-02`
- `bk_id`: `BK-MF5-02`
- `macro`: `MF5`
- `owner`: `Matheus`
- `apoio`: `Kaue`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF5-01`
- `rf_rnf`: `RF56`
- `fase_documental`: `Fase 1`
- `sprint`: `S09`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF5-03`
- `guia_path`: `docs/planificacao/guias-bk/MF5/BK-MF5-02-eliminacao-conta-dados.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais implementar o fluxo de eliminação da própria conta. A operação deve exigir confirmação explícita, usar a identidade da sessão, remover dados pessoais diretos e preservar apenas registos agregados ou históricos necessários à coerência operacional da aplicação.

`CANONICO`: este BK cobre `RF56 - Eliminar conta` e depende de `BK-MF5-01`.

`DERIVADO`: como os documentos não detalham a estratégia de retenção por coleção, este guia usa uma combinação segura: elimina dados pessoais de interação, revoga sessões e anonimiza a conta para preservar referências históricas sem expor dados pessoais.

#### Importância

Eliminar conta é uma funcionalidade sensível. Um erro pode apagar dados da pessoa errada, deixar a sessão ativa depois da eliminação ou manter dados pessoais que o utilizador pediu para remover.

Este BK ensina a diferença entre eliminar dados pessoais e destruir todo o histórico operacional. No FaithFlix, alguns registos, como distribuições solidárias mensais já auditadas, não devem ser reescritos sem contrato específico. Por isso, o guia limita-se aos dados diretamente associados à conta do utilizador e deixa claro o que é anonimizado.

#### Scope-in

- Criar validação de confirmação `ELIMINAR CONTA` e da password atual.
- Criar endpoint autenticado `DELETE /api/privacy/account`.
- Revogar sessões do utilizador eliminado.
- Apagar biblioteca, histórico, ratings, notificações e preferências do utilizador.
- Anonimizar perfil de conta em `users`.
- Registar pedido em `privacy_deletion_requests` sem guardar dados sensíveis.
- Criar zona de perigo no frontend.
- Criar teste unitário da validação de confirmação.

#### Scope-out

- Eliminação feita por administrador.
- Rotinas automáticas de retenção legal.
- Alteração de relatórios financeiros já agregados.
- Eliminação de conta de associação beneficiária.
- Consentimentos detalhados, que ficam para `BK-MF5-03`.

#### Estado antes e depois

Antes deste BK, `BK-MF5-01` permite exportar dados do próprio utilizador. Ainda não existe operação controlada para encerrar a conta e invalidar sessões.

Depois deste BK, o utilizador autenticado consegue pedir eliminação da conta, o backend exige confirmação textual e password atual, executa a alteração de forma transacional, revoga sessões, elimina dados pessoais diretos e anonimiza a linha da conta.

#### Pré-requisitos

- `BK-MF5-01` criou `privacy.service.js`, `privacy.controller.js`, `privacy.routes.js` e `privacyApi`.
- `BK-MF1-04` criou sessões por cookie e coleção `sessions`.
- `BK-MF2-01` garante `req.user`.
- `BK-MF2-07`, `BK-MF3-01`, `BK-MF3-02` e `BK-MF4-08` criaram dados pessoais que entram na limpeza.

#### Glossário

- Eliminação de conta: pedido do utilizador para encerrar a conta e remover dados pessoais diretos.
- Anonimização: alteração de campos pessoais para valores que deixam de identificar a pessoa.
- Revogação de sessão: remoção das sessões ativas para impedir uso da conta depois da eliminação.
- Confirmação forte: frase exata e password atual, verificadas antes de qualquer alteração.
- Registo de eliminação: prova mínima de que a operação ocorreu, sem guardar a informação eliminada.

#### Conceitos teóricos essenciais

No domínio FaithFlix, a conta liga biblioteca, histórico, ratings, comentários, subscrições, notificações e preferências. A eliminação tem de tocar nestes dados com cuidado.

No backend, o controller recebe o pedido, o validator confirma a frase de segurança e a presença da password, e o service verifica a password atual antes de executar a limpeza usando `req.user.id`. O frontend nunca envia o id da conta a eliminar.

Na segurança, a operação deve falhar de forma previsível: sem sessão devolve `401`, confirmação/password ausente devolve `400`, password incorreta devolve `403` com `CURRENT_PASSWORD_INVALID` e mudança concorrente devolve `409 ACCOUNT_STATE_CHANGED`. Depois de eliminar, as sessões são removidas para impedir continuação de uso.

##### Contrato de segurança e atomicidade

- O payload é `{ confirmation: "ELIMINAR CONTA", password }`.
- A password é verificada contra o `passwordHash` atual antes de abrir a alteração
  destrutiva; nunca é escrita em logs, evidence ou respostas.
- Limpeza de coleções pessoais, anonimização de comentários, cancelamento de
  subscrições, invalidação familiar, revogação de sessões, registo do pedido e
  anonimização da conta decorrem numa transação MongoDB.
- A atualização final compara também o `passwordHash` observado. Se a conta mudar
  entretanto, toda a transação é anulada com `ACCOUNT_STATE_CHANGED`.
- Password ou frase inválida não produz alteração parcial.
- Depois de sucesso, o frontend limpa a sessão em memória e encaminha para `/login`;
  não mantém a página autenticada com um cookie já revogado.

Na privacidade, o objetivo é reduzir dados pessoais. O service apaga documentos puramente pessoais e transforma o utilizador em conta anonimizada. Logs e registos de auditoria não devem conter email antigo, palavra-passe ou conteúdo exportado.

#### Arquitetura do BK

| Camada | Contrato |
| --- | --- |
| Validator | `assertDeleteAccountPayload(input)` |
| Backend route | `DELETE /api/privacy/account` |
| Autenticação | `requireAuth` obrigatório |
| Service | `deleteMyAccount(userId, input)` |
| Auditoria mínima | `privacy_deletion_requests` |
| Frontend API | `privacyApi.deleteMyAccount({ confirmation, password })` |
| UI | `PrivacyDangerZone` dentro de `AccountPage` |
| Handoff | `BK-MF5-03` mantém consentimentos coerentes com conta ativa |

##### Contrato da página de conta

- `AccountPage` cancela a leitura de `/api/users/me` no unmount e ignora
  `REQUEST_ABORTED`; indisponibilidade de rede não é tratada como conta vazia.
- Formulários de perfil, controlo parental e zona de perigo partilham um busy
  state visível e não permitem mutações sobrepostas.
- O limite parental vazio é inválido. A UI não pode aplicar `Number("")`, porque
  isso transforma ausência de escolha em zero. O valor deve ser texto
  controlado, normalizado e validado como inteiro real entre 0 e 18 antes de
  chamar `PATCH /api/users/me/parental`.
- O backend volta a validar o limite sem coerções: strings, vazio, frações e
  valores fora de 0-18 devolvem `400`.
- A eliminação continua separada e mais forte: frase exata, password atual,
  confirmação consciente, botão ocupado e limpeza da sessão após sucesso. As
  guardas da conta não substituem a transação nem a revogação server-side.
- Todos os rótulos visíveis usam PT-PT, incluindo `Papel`, `Administrador`,
  `Moderador`, `Utilizador`, `A guardar...` e erros seguros.

#### Ficheiros a criar/editar/rever

- CRIAR: `backend/src/modules/privacy/privacy.validation.js`
- EDITAR: `backend/src/modules/privacy/privacy.service.js`
- EDITAR: `backend/src/modules/privacy/privacy.controller.js`
- EDITAR: `backend/src/modules/privacy/privacy.routes.js`
- EDITAR: `frontend/src/services/api/privacyApi.js`
- CRIAR: `frontend/src/components/privacy/PrivacyDangerZone.jsx`
- EDITAR: `frontend/src/pages/AccountPage.jsx`
- CRIAR: `backend/tests/unit/mf5-privacy-delete.validation.test.js`
- REVER: `BK-MF5-01`, `RF56`, `RNF15`, `RNF17`, `RNF19`, `RNF37`

#### Tutorial técnico linear

### Passo 1 - Criar validação da confirmação

1. Objetivo funcional do passo no contexto da app.

Impedir eliminações acidentais com uma confirmação textual clara.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/privacy/privacy.validation.js`
    - LOCALIZAÇÃO: ficheiro completo

3. Instruções do que fazer.

Cria o ficheiro de validação do módulo `privacy`.

4. Código completo, correto e integrado com a app final.

```js
// backend/src/modules/privacy/privacy.validation.js
import { HttpError } from "../../utils/http-error.js";

export const DELETE_ACCOUNT_CONFIRMATION = "ELIMINAR CONTA";

/**
 * Valida o pedido de eliminação da própria conta.
 *
 * @param {{ confirmation?: unknown, password?: unknown }} input Dados recebidos do frontend.
 * @returns {{ confirmation: string, password: string }} Dados normalizados para o service.
 * @throws {HttpError} Quando a confirmação ou a password não correspondem ao contrato.
 */
export function assertDeleteAccountPayload(input = {}) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        throw new HttpError(400, "Pedido de eliminação inválido.");
    }

    const confirmation =
        typeof input.confirmation === "string"
            ? input.confirmation.trim()
            : "";
    const password =
        typeof input.password === "string" ? input.password : "";

    if (confirmation !== DELETE_ACCOUNT_CONFIRMATION) {
        throw new HttpError(
            400,
            "Escreve ELIMINAR CONTA para confirmar a eliminação.",
        );
    }

    if (password.length < 10 || password.length > 128) {
        throw new HttpError(
            400,
            "Introduz a password atual para eliminar a conta.",
            undefined,
            "CURRENT_PASSWORD_REQUIRED",
        );
    }

    return { confirmation, password };
}
```

5. Explicação do código.

A constante evita grafias diferentes entre backend e frontend. O validator só
aceita um objeto JSON e strings reais; não converte números, arrays ou objetos em
texto. Remove espaços exteriores da confirmação e exige uma password entre 10 e
128 caracteres. A correspondência da password é verificada pelo service com o
hash atual.

6. Validação do passo.

Executa:

```bash
cd backend
node -e "import('./src/modules/privacy/privacy.validation.js').then(({ assertDeleteAccountPayload }) => console.log(assertDeleteAccountPayload({ confirmation: 'ELIMINAR CONTA', password: 'password-de-teste' }).confirmation))"
```

O resultado esperado é `ELIMINAR CONTA`.

7. Cenário negativo/erro esperado.

Com `{ confirmation: "eliminar conta", password: "password-de-teste" }` ou sem password, o validator deve falhar. A operação é destrutiva e não deve aceitar aproximações.

### Passo 2 - Acrescentar eliminação ao service

1. Objetivo funcional do passo no contexto da app.

Eliminar dados pessoais diretos, anonimizar a conta e revogar sessões.

2. Ficheiros envolvidos.
    - EDITAR: `backend/src/modules/privacy/privacy.service.js`
    - LOCALIZAÇÃO: imports e funções novas no fim do ficheiro

3. Instruções do que fazer.

Edita de forma aditiva o service criado em `BK-MF5-01`: mantém sem alterações
`USER_EXPORT_COLLECTIONS`, `toExportValue`, `toExportableUser`,
`toExportableRow`, `exportOwnedCollection`, `asUserObjectId` e, sobretudo,
`buildUserDataExport`. No import de base de dados, acrescenta
`runInTransaction`; adiciona os outros dois imports e cola as funções de
eliminação depois de `buildUserDataExport`. Todas as operações de persistência
recebem a mesma `session`; não uses `Promise.all` dentro de uma transação
MongoDB.

4. Código completo, correto e integrado com a app final.

```js
// backend/src/modules/privacy/privacy.service.js
// EDITAR o import de BK-MF5-01 para acrescentar runInTransaction.
import { getDb, runInTransaction } from "../../config/database.js";
// ADICIONAR estes imports; ObjectId e HttpError já existem no ficheiro.
import { verifyPassword } from "../auth/auth.password.js";
import { assertDeleteAccountPayload } from "./privacy.validation.js";

// MANTER aqui todo o código de exportação de BK-MF5-01, incluindo
// `buildUserDataExport`; as declarações seguintes são acrescentadas no fim.

const PERSONAL_COLLECTIONS_TO_DELETE = [
    "playback_progress",
    "media_preferences",
    "user_content_lists",
    "content_ratings",
    "notification_preferences",
    "notifications",
    "user_consents",
    "user_consent_events",
    "trials",
    "password_reset_tokens",
    "charity_memberships",
];

/**
 * Remove dados pessoais de coleções cujo conteúdo pertence só ao utilizador.
 *
 * @param {import("mongodb").Db} db Ligação MongoDB.
 * @param {ObjectId} userObjectId Id do utilizador autenticado.
 * @param {import("mongodb").ClientSession} session Sessão transacional comum.
 * @returns {Promise<Record<string, number>>} Contagem de documentos removidos por coleção.
 */
async function deletePersonalCollections(db, userObjectId, session) {
    const entries = [];

    for (const collectionName of PERSONAL_COLLECTIONS_TO_DELETE) {
        const result = await db
            .collection(collectionName)
            .deleteMany({ userId: userObjectId }, { session });
        entries.push([collectionName, result.deletedCount ?? 0]);
    }

    return Object.fromEntries(entries);
}

/**
 * Anonimiza comentários para manter discussão sem expor autoria pessoal.
 *
 * @param {import("mongodb").Db} db Ligação MongoDB.
 * @param {ObjectId} userObjectId Id do utilizador autenticado.
 * @param {import("mongodb").ClientSession} session Sessão transacional comum.
 * @returns {Promise<number>} Número de comentários anonimizados.
 */
async function anonymizeComments(db, userObjectId, session) {
    const result = await db.collection("content_comments").updateMany(
        { userId: userObjectId },
        {
            $set: {
                body: "Comentário removido por eliminação de conta.",
                authorName: "Conta eliminada",
                deletedByUser: true,
                updatedAt: new Date(),
            },
            $unset: { userId: "", email: "", authorEmail: "" },
        },
        { session },
    );

    return result.modifiedCount ?? 0;
}

/**
 * Elimina a própria conta com confirmação forte e limpeza controlada.
 *
 * @param {string} userId Id do utilizador obtido pela sessão.
 * @param {{ confirmation?: unknown, password?: unknown }} input Dados recebidos do frontend.
 * @returns {Promise<{ deleted: true, deletedCollections: Record<string, number>, anonymizedComments: number }>} Resumo seguro da operação.
 * @throws {HttpError} Quando confirmação/password falham ou a conta muda.
 */
export async function deleteMyAccount(userId, input) {
    const { password } = assertDeleteAccountPayload(input);
    const userObjectId = asUserObjectId(userId);
    const lookupDb = await getDb();
    const currentUser = await lookupDb
        .collection("users")
        .findOne({ _id: userObjectId });

    if (!currentUser?.passwordHash) {
        throw new HttpError(404, "Utilizador não encontrado.");
    }

    if (!(await verifyPassword(password, currentUser.passwordHash))) {
        throw new HttpError(
            403,
            "Password atual incorreta.",
            undefined,
            "CURRENT_PASSWORD_INVALID",
        );
    }

    return runInTransaction(async ({ db, session }) => {
        const user = await db.collection("users").findOne(
            { _id: userObjectId, passwordHash: currentUser.passwordHash },
            { session },
        );

        if (!user || ["blocked", "deleted"].includes(user.accountStatus)) {
            throw new HttpError(
                409,
                "A conta mudou durante o pedido. Tenta novamente.",
                undefined,
                "ACCOUNT_STATE_CHANGED",
            );
        }

        const now = new Date();
        const deletedCollections = await deletePersonalCollections(
            db,
            userObjectId,
            session,
        );
        const anonymizedComments = await anonymizeComments(
            db,
            userObjectId,
            session,
        );

        await db
            .collection("sessions")
            .deleteMany({ userId: userObjectId }, { session });
        await db.collection("privacy_deletion_requests").insertOne(
            {
                userId: userObjectId,
                requestedAt: now,
                accountStatusBefore: user.accountStatus ?? "active",
            },
            { session },
        );

        const updated = await db.collection("users").updateOne(
            { _id: userObjectId, passwordHash: currentUser.passwordHash },
            {
                $set: {
                    name: "Conta eliminada",
                    email: `deleted-${String(userObjectId)}@faithflix.local`,
                    accountStatus: "deleted",
                    role: "user",
                    deletedAt: now,
                    updatedAt: now,
                },
                $unset: { passwordHash: "" },
            },
            { session },
        );

        if (updated.matchedCount !== 1) {
            throw new HttpError(
                409,
                "A conta mudou durante o pedido. Tenta novamente.",
                undefined,
                "ACCOUNT_STATE_CHANGED",
            );
        }

        return { deleted: true, deletedCollections, anonymizedComments };
    });
}
```

5. Explicação do código.

O service conserva `buildUserDataExport` e os respetivos helpers de
`BK-MF5-01`; este passo acrescenta, não substitui, a capacidade de eliminação.
Valida a frase e a password antes da primeira alteração. Depois volta a ler a
conta pelo `passwordHash` observado e executa limpeza, anonimização, revogação de
sessões, registo mínimo e anonimização da conta dentro da mesma transação. Todas
as chamadas MongoDB recebem `{ session }` e são sequenciais. Uma alteração
concorrente ou qualquer falha tardia provoca rollback integral; nunca fica uma
conta ativa com dados parcialmente removidos.

6. Validação do passo.

Executa:

```bash
cd backend
node -e "import('./src/modules/privacy/privacy.service.js').then(({ buildUserDataExport, deleteMyAccount }) => console.log(typeof buildUserDataExport, typeof deleteMyAccount))"
```

O resultado esperado é `function function`: prova que a edição acrescentou a
eliminação sem apagar a exportação anterior.

7. Cenário negativo/erro esperado.

Se o service eliminasse sessões antes de validar a confirmação, um pedido errado poderia terminar a sessão sem eliminar a conta. Por isso a confirmação é validada no início.

### Passo 3 - Expor a rota de eliminação

1. Objetivo funcional do passo no contexto da app.

Ligar a eliminação ao endpoint HTTP autenticado.

2. Ficheiros envolvidos.
    - EDITAR: `backend/src/modules/privacy/privacy.controller.js`
    - EDITAR: `backend/src/modules/privacy/privacy.routes.js`
    - LOCALIZAÇÃO: imports e funções novas

3. Instruções do que fazer.

Adiciona o controller e a rota `DELETE /account`.

4. Código completo, correto e integrado com a app final.

```js
// backend/src/modules/privacy/privacy.controller.js
import { deleteMyAccount } from "./privacy.service.js";

/**
 * Elimina a conta do utilizador autenticado.
 *
 * @param {import("express").Request & { user: { id: string } }} req Pedido atual.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<import("express").Response>} Resumo seguro da eliminação.
 */
export async function deleteMyAccountController(req, res) {
    const result = await deleteMyAccount(req.user.id, req.body);

    return res.status(200).json(result);
}
```

```js
// backend/src/modules/privacy/privacy.routes.js
import {
    rateLimit,
    rateLimitKeys,
} from "../../middlewares/rate-limit.middleware.js";
import { deleteMyAccountController } from "./privacy.controller.js";

const deleteAccountByUser = rateLimit({
    scope: "privacy:delete:user",
    limit: 5,
    windowMs: 15 * 60_000,
    key: rateLimitKeys.user,
});
// O limite por IP continua ativo quando o atacante alterna utilizadores ou emails.
const deleteAccountByIp = rateLimit({
    scope: "privacy:delete:ip",
    limit: 20,
    windowMs: 60 * 60_000,
    key: rateLimitKeys.ip,
});

privacyRouter.delete(
    "/account",
    requireAuth,
    deleteAccountByIp,
    deleteAccountByUser,
    asyncHandler(deleteMyAccountController),
);
```

5. Explicação do código.

A rota usa `DELETE` porque a intenção é eliminar a conta. Continua protegida
por `requireAuth`; os limites reutilizam o middleware Mongo/HMAC/TTL do
`BK-MF2-01` e o controller passa apenas `req.user.id` e `req.body` validado pelo
service. O primeiro pedido recusado é o 6.º do mesmo utilizador em 15 minutos ou
o 21.º do mesmo IP numa hora e devolve `429 RATE_LIMITED` com `Retry-After`.

6. Validação do passo.

Com utilizador autenticado, obtém primeiro o token CSRF através de
`GET /api/session/csrf-token` usando o mesmo cookie. Depois envia a mutation com
cookie, Origin permitido e o token recebido (não registes estes valores na evidence):

```bash
curl -X DELETE http://127.0.0.1:3000/api/privacy/account \
  -b /tmp/faithflix.cookies \
  -H "Origin: http://127.0.0.1:5173" \
  -H "X-CSRF-Token: TOKEN_CSRF_OBTIDO_NO_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{"confirmation":"ELIMINAR CONTA","password":"PASSWORD_ATUAL_NAO_REGISTAR"}'
```

O resultado esperado é `200` com `{ "deleted": true, ... }`.

Com password deliberadamente errada, repete apenas numa fixture isolada: o 6.º
pedido do utilizador ou o 21.º do IP deve ser o primeiro `429`; nunca contornes
o limite nem registes password, cookie ou token.

7. Cenário negativo/erro esperado.

Sem sessão, o endpoint deve devolver `401`. Com confirmação/password ausente deve devolver `400`; com password incorreta, `403 CURRENT_PASSWORD_INVALID`, sem alterar dados.

### Passo 4 - Criar zona de perigo no frontend

1. Objetivo funcional do passo no contexto da app.

Dar ao utilizador uma interface clara para pedir eliminação, com confirmação consciente.

2. Ficheiros envolvidos.
    - EDITAR: `frontend/src/services/api/privacyApi.js`
    - CRIAR: `frontend/src/components/privacy/PrivacyDangerZone.jsx`
    - EDITAR: `frontend/src/pages/AccountPage.jsx`
    - LOCALIZAÇÃO: API completa atualizada, componente completo e import/JSX na página

3. Instruções do que fazer.

Adiciona `deleteMyAccount` ao cliente `privacyApi`, cria `PrivacyDangerZone` e inclui o componente em `AccountPage`.

4. Código completo, correto e integrado com a app final.

```js
// frontend/src/services/api/privacyApi.js
import { apiClient } from "./apiClient.js";

export const privacyApi = {
    /**
     * Pede ao backend a exportação dos dados do utilizador autenticado.
     *
     * @returns {Promise<{ export: Record<string, unknown> }>} Exportação em JSON.
     */
    exportMyData() {
        return apiClient.get("/api/privacy/export");
    },

    /**
     * Pede a eliminação da própria conta.
     *
     * @param {{ confirmation: string, password: string }} input Confirmação e password atual.
     * @returns {Promise<{ deleted: boolean }>} Resultado da eliminação.
     */
    deleteMyAccount(input, options = {}) {
        return apiClient.del("/api/privacy/account", {
            ...options,
            body: input,
        });
    },
};
```

```jsx
// frontend/src/components/privacy/PrivacyDangerZone.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../../context/SessionContext.jsx";
import { toUserMessage } from "../../services/api/apiErrors.js";
import { privacyApi } from "../../services/api/privacyApi.js";

const CONFIRMATION = "ELIMINAR CONTA";

/**
 * Zona de perigo para eliminação da própria conta.
 *
 * @returns {JSX.Element} Formulário de eliminação com confirmação forte.
 */
export function PrivacyDangerZone() {
    const navigate = useNavigate();
    const { clearSession } = useSession();
    const [confirmation, setConfirmation] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");
    const [error, setError] = useState("");
    const submitReservedRef = useRef(false);
    const submitControllerRef = useRef(null);
    const contextVersionRef = useRef(0);

    useEffect(() => () => {
        contextVersionRef.current += 1;
        submitControllerRef.current?.abort();
        submitControllerRef.current = null;
        submitReservedRef.current = false;
    }, []);

    /**
     * Envia o pedido de eliminação para o backend.
     *
     * @param {React.FormEvent<HTMLFormElement>} event Evento do formulário.
     * @returns {Promise<void>} Termina quando o pedido é processado.
     */
    async function handleSubmit(event) {
        event.preventDefault();
        // A reserva síncrona impede dois DELETE antes do próximo render.
        if (submitReservedRef.current) return;
        const contextVersion = contextVersionRef.current;
        const controller = new AbortController();
        submitReservedRef.current = true;
        submitControllerRef.current = controller;
        setLoading(true);
        setStatus("");
        setError("");

        try {
            await privacyApi.deleteMyAccount(
                { confirmation, password },
                { signal: controller.signal },
            );
            if (
                controller.signal.aborted ||
                contextVersion !== contextVersionRef.current
            ) return;

            setStatus("Conta eliminada. A sessão foi terminada.");
            // Sessão/CSRF só são limpos depois da confirmação autoritativa 200.
            clearSession();
            navigate("/login", {
                replace: true,
                state: { accountDeleted: true },
            });
        } catch (requestError) {
            if (
                controller.signal.aborted ||
                requestError?.code === "REQUEST_ABORTED"
            ) return;
            if (contextVersion !== contextVersionRef.current) return;
            setError(toUserMessage(requestError));
        } finally {
            if (submitControllerRef.current === controller) {
                submitControllerRef.current = null;
                submitReservedRef.current = false;
                if (contextVersion === contextVersionRef.current) {
                    setLoading(false);
                }
            }
        }
    }

    return (
        <section className="form-panel danger-zone" aria-labelledby="delete-account-title">
            <h2 id="delete-account-title">Eliminar conta</h2>
            <p>
                Esta ação remove dados pessoais diretos e termina sessões ativas.
                Escreve {CONFIRMATION} para confirmar.
            </p>
            {error ? <p role="alert">{error}</p> : null}
            {status ? <p role="status">{status}</p> : null}
            <form onSubmit={handleSubmit} aria-busy={loading}>
                <label>
                    Confirmação
                    <input
                        value={confirmation}
                        disabled={loading}
                        onChange={(event) => setConfirmation(event.target.value)}
                    />
                </label>
                <label>
                    Password atual
                    <input
                        type="password"
                        autoComplete="current-password"
                        maxLength={128}
                        required
                        disabled={loading}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                    />
                </label>
                <button
                    type="submit"
                    disabled={
                        loading ||
                        confirmation !== CONFIRMATION ||
                        password.length === 0
                    }
                >
                    {loading ? "A eliminar..." : "Eliminar conta"}
                </button>
            </form>
        </section>
    );
}
```

```jsx
// frontend/src/pages/AccountPage.jsx
import { PrivacyDangerZone } from "../components/privacy/PrivacyDangerZone.jsx";

// Dentro do return principal, depois de <PrivacyExportPanel />:
<PrivacyDangerZone />
```

5. Explicação do código.

O botão só fica ativo quando a confirmação é exatamente igual à constante e a
password não está vazia; o backend continua a aplicar o limite de 10-128 e a
verificar o hash. Uma ref reserva imediatamente o submit, o `AbortController` é
cancelado no cleanup e cancelamento não mostra erro. Só depois de uma resposta
autoritativa bem-sucedida o componente limpa sessão/CSRF através do contexto e
navega para `/login`; falha, timeout ou unmount preservam a sessão local.

6. Validação do passo.

Na página `/conta`, escreve uma confirmação errada ou deixa a password vazia: o botão deve continuar desativado. Com `ELIMINAR CONTA` e uma password válida, o botão fica ativo, o backend processa a operação e o frontend encaminha para `/login`.

7. Cenário negativo/erro esperado.

Se alguém alterar o HTML no browser e enviar confirmação errada, o backend continua a devolver `400`. A segurança não depende da UI.

### Passo 5 - Criar teste da validação

1. Objetivo funcional do passo no contexto da app.

Garantir que a confirmação forte é obrigatória.

2. Ficheiros envolvidos.
    - CRIAR: `backend/tests/unit/mf5-privacy-delete.validation.test.js`
    - LOCALIZAÇÃO: ficheiro completo

3. Instruções do que fazer.

Cria o teste abaixo.

4. Código completo, correto e integrado com a app final.

```js
// backend/tests/unit/mf5-privacy-delete.validation.test.js
import assert from "node:assert/strict";
import { test } from "node:test";
import {
    assertDeleteAccountPayload,
    DELETE_ACCOUNT_CONFIRMATION,
} from "../../src/modules/privacy/privacy.validation.js";

test("MF5 valida confirmação forte para eliminar conta", () => {
    assert.deepEqual(
        assertDeleteAccountPayload({
            confirmation: DELETE_ACCOUNT_CONFIRMATION,
            password: "password-de-teste",
        }),
        {
            confirmation: DELETE_ACCOUNT_CONFIRMATION,
            password: "password-de-teste",
        },
    );

    // Os dois negativos provam que nem uma frase aproximada nem password vazia avançam.
    assert.throws(
        () => assertDeleteAccountPayload({
            confirmation: "eliminar conta",
            password: "password-de-teste",
        }),
        /ELIMINAR CONTA/,
    );

    assert.throws(
        () => assertDeleteAccountPayload({
            confirmation: DELETE_ACCOUNT_CONFIRMATION,
            password: "",
        }),
        /password atual/i,
    );
});
```

5. Explicação do código.

O teste confirma o caso positivo e o caso negativo mais importante. A grafia exata reduz eliminações acidentais.

6. Validação do passo.

Executa:

```bash
cd backend
node --test tests/unit/mf5-privacy-delete.validation.test.js
```

O resultado esperado é `pass`.

7. Cenário negativo/erro esperado.

Se o validator aceitar texto em minúsculas, o teste falha. Essa falha é correta, porque a confirmação deve ser deliberada.

#### Critérios de aceite

- `DELETE /api/privacy/account` existe e exige sessão.
- `buildUserDataExport` continua exportada pelo mesmo `privacy.service.js`.
- A operação exige confirmação `ELIMINAR CONTA`.
- A operação exige a password atual e rejeita password incorreta sem alterar dados.
- O backend usa `req.user.id` e não aceita id arbitrário do frontend.
- A limpeza e anonimização decorrem numa transação e uma mudança concorrente devolve `409 ACCOUNT_STATE_CHANGED`.
- Sessões do utilizador eliminado são removidas.
- Dados pessoais diretos, incluindo `media_preferences` e a própria `charity_membership`, são removidos das coleções definidas.
- A membership de outra conta permanece intacta; a limpeza usa sempre o `userId` autenticado e participa na transação da eliminação.
- Comentários em `content_comments` ficam anonimizados.
- A conta em `users` perde email real, nome real e hashes.
- Existe registo mínimo em `privacy_deletion_requests` sem dados pessoais antigos.
- A página `/conta` mostra zona de perigo com frase e campo `current-password`.
- Uma ref síncrona impede duplo submit, cleanup aborta o DELETE ativo e apenas
  sucesso confirmado limpa a sessão/CSRF; abort/falha preservam-na.
- A conta recusa limite parental vazio/string/fração, cancela a carga no unmount
  e não converte ausência de escolha em classificação zero.

#### Validação final

Executa:

```bash
cd backend
node --test tests/unit/mf5-privacy-delete.validation.test.js
node -e "import('./src/modules/privacy/privacy.routes.js').then(({ privacyRouter }) => console.log(typeof privacyRouter))"
```

Depois valida manualmente:

- confirmação errada devolve `400`;
- password ausente devolve `400 CURRENT_PASSWORD_REQUIRED`;
- password incorreta devolve `403 CURRENT_PASSWORD_INVALID` sem alterações;
- pedido sem sessão devolve `401`;
- confirmação e password certas devolvem `200`;
- depois da eliminação, o cookie antigo deixa de permitir acesso autenticado.
- com memberships de duas contas, desaparece apenas a que tem o `userId` da
  sessão eliminada; a ligação da outra conta permanece.

#### Evidence para PR/defesa

- `pr`: referência do commit ou PR.
- `proof`: output do teste de validação.
- `proof`: captura da zona de perigo em `/conta`.
- `neg`: confirmação errada devolve `400`.
- `neg`: pedido sem sessão devolve `401`.
- `neg`: sessão antiga deixa de aceder à conta depois da eliminação.
- `neg`: membership de outro utilizador permanece intacta.

#### Handoff

O próximo BK, `BK-MF5-03`, deve tratar consentimentos apenas para contas ativas. Se uma conta estiver com `accountStatus: "deleted"`, a UI de consentimentos não deve permitir novas alterações.

#### Changelog

- `2026-07-10`: composição corrigida para preservar `buildUserDataExport` e os
  helpers criados em `BK-MF5-01`; eliminação documentada como extensão aditiva.
- `2026-07-10`: normalizado para o contrato tutorial v2 sem alterar a eliminação
  confirmada por password e executada numa única transação.
- `2026-04-13`: criado guia base com contrato pedagógico v3.
- `2026-06-16`: guia reescrito com confirmação forte, anonimização, revogação de sessões, frontend e teste.
- `2026-07-10`: eliminação RGPD passa a remover a `charity_membership` da própria conta e a preservar ligações de terceiros.
- `2026-07-10`: página anfitriã da privacidade sincronizada com leitura
  cancelável, busy state, rótulos PT-PT e limite parental estrito sem coerção de vazio.
