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
- `last_updated`: `2026-06-16`

#### Objetivo

Neste BK vais implementar o fluxo de eliminação da própria conta. A operação deve exigir confirmação explícita, usar a identidade da sessão, remover dados pessoais diretos e preservar apenas registos agregados ou históricos necessários à coerência operacional da aplicação.

`CANONICO`: este BK cobre `RF56 - Eliminar conta` e depende de `BK-MF5-01`.

`DERIVADO`: como os documentos não detalham a estratégia de retenção por coleção, este guia usa uma combinação segura: elimina dados pessoais de interação, revoga sessões e anonimiza a conta para preservar referências históricas sem expor dados pessoais.

#### Importância

Eliminar conta é uma funcionalidade sensível. Um erro pode apagar dados da pessoa errada, deixar a sessão ativa depois da eliminação ou manter dados pessoais que o utilizador pediu para remover.

Este BK ensina a diferença entre eliminar dados pessoais e destruir todo o histórico operacional. No FaithFlix, alguns registos, como distribuições solidárias mensais já auditadas, não devem ser reescritos sem contrato específico. Por isso, o guia limita-se aos dados diretamente associados à conta do utilizador e deixa claro o que é anonimizado.

#### Scope-in

- Criar validação de confirmação `ELIMINAR CONTA`.
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

Depois deste BK, o utilizador autenticado consegue pedir eliminação da conta, o backend exige confirmação textual, revoga sessões, elimina dados pessoais diretos e anonimiza a linha da conta.

#### Pre-requisitos

- `BK-MF5-01` criou `privacy.service.js`, `privacy.controller.js`, `privacy.routes.js` e `privacyApi`.
- `BK-MF1-04` criou sessões por cookie e coleção `sessions`.
- `BK-MF2-01` garante `req.user`.
- `BK-MF2-07`, `BK-MF3-01`, `BK-MF3-02` e `BK-MF4-08` criaram dados pessoais que entram na limpeza.

#### Glossário

- Eliminação de conta: pedido do utilizador para encerrar a conta e remover dados pessoais diretos.
- Anonimização: alteração de campos pessoais para valores que deixam de identificar a pessoa.
- Revogação de sessão: remoção das sessões ativas para impedir uso da conta depois da eliminação.
- Confirmação forte: texto que o utilizador tem de escrever para provar intenção.
- Registo de eliminação: prova mínima de que a operação ocorreu, sem guardar a informação eliminada.

#### Conceitos teóricos essenciais

No domínio FaithFlix, a conta liga biblioteca, histórico, ratings, comentários, subscrições, notificações e preferências. A eliminação tem de tocar nestes dados com cuidado.

No backend, o controller recebe o pedido, o validator confirma a frase de segurança e o service executa a limpeza usando `req.user.id`. O frontend nunca envia o id da conta a eliminar.

Na segurança, a operação deve falhar de forma previsível: sem sessão devolve `401`, confirmação errada devolve `400`, conta inexistente devolve `404`. Depois de eliminar, as sessões são removidas para impedir continuação de uso.

Na privacidade, o objetivo é reduzir dados pessoais. O service apaga documentos puramente pessoais e transforma o utilizador em conta anonimizada. Logs e registos de auditoria não devem conter email antigo, palavra-passe ou conteúdo exportado.

#### Arquitetura do BK

| Camada | Contrato |
| --- | --- |
| Validator | `assertDeleteAccountPayload(input)` |
| Backend route | `DELETE /api/privacy/account` |
| Autenticação | `requireAuth` obrigatório |
| Service | `deleteMyAccount(userId, input)` |
| Auditoria mínima | `privacy_deletion_requests` |
| Frontend API | `privacyApi.deleteMyAccount({ confirmation })` |
| UI | `PrivacyDangerZone` dentro de `AccountPage` |
| Handoff | `BK-MF5-03` mantém consentimentos coerentes com conta ativa |

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/backend/src/modules/privacy/privacy.validation.js`
- EDITAR: `apps/backend/src/modules/privacy/privacy.service.js`
- EDITAR: `apps/backend/src/modules/privacy/privacy.controller.js`
- EDITAR: `apps/backend/src/modules/privacy/privacy.routes.js`
- EDITAR: `apps/frontend/src/services/api/privacyApi.js`
- CRIAR: `apps/frontend/src/components/privacy/PrivacyDangerZone.jsx`
- EDITAR: `apps/frontend/src/pages/AccountPage.jsx`
- CRIAR: `apps/backend/tests/unit/mf5-privacy-delete.validation.test.js`
- REVER: `BK-MF5-01`, `RF56`, `RNF15`, `RNF17`, `RNF19`, `RNF37`

#### Tutorial técnico linear

### Passo 1 - Criar validação da confirmação

1. Objetivo funcional do passo no contexto da app.

Impedir eliminações acidentais com uma confirmação textual clara.

2. Ficheiros envolvidos:
    - CRIAR: `apps/backend/src/modules/privacy/privacy.validation.js`
    - LOCALIZAÇÃO: ficheiro completo

3. Instruções do que fazer.

Cria o ficheiro de validação do módulo `privacy`.

4. Código completo, correto e integrado com a app final.

```js
// apps/backend/src/modules/privacy/privacy.validation.js
import { HttpError } from "../../utils/http-error.js";

export const DELETE_ACCOUNT_CONFIRMATION = "ELIMINAR CONTA";

/**
 * Valida o pedido de eliminação da própria conta.
 *
 * @param {{ confirmation?: unknown }} input Dados recebidos do frontend.
 * @returns {{ confirmation: string }} Dados normalizados para o service.
 * @throws {HttpError} Quando a confirmação não corresponde ao contrato.
 */
export function assertDeleteAccountPayload(input) {
    const confirmation = String(input?.confirmation ?? "").trim();

    if (confirmation !== DELETE_ACCOUNT_CONFIRMATION) {
        throw new HttpError(
            400,
            "Escreve ELIMINAR CONTA para confirmar a eliminação.",
        );
    }

    return { confirmation };
}
```

5. Explicação do código.

A constante evita grafias diferentes entre backend e frontend. O validator transforma o valor em texto, remove espaços exteriores e falha com `400` se a confirmação não for exata.

6. Validação do passo.

Executa:

```bash
cd apps/backend
node -e "import('./src/modules/privacy/privacy.validation.js').then(({ assertDeleteAccountPayload }) => console.log(assertDeleteAccountPayload({ confirmation: 'ELIMINAR CONTA' }).confirmation))"
```

O resultado esperado é `ELIMINAR CONTA`.

7. Cenário negativo/erro esperado.

Com `{ confirmation: "eliminar conta" }`, o validator deve falhar. A operação é destrutiva e não deve aceitar aproximações.

### Passo 2 - Acrescentar eliminação ao service

1. Objetivo funcional do passo no contexto da app.

Eliminar dados pessoais diretos, anonimizar a conta e revogar sessões.

2. Ficheiros envolvidos:
    - EDITAR: `apps/backend/src/modules/privacy/privacy.service.js`
    - LOCALIZAÇÃO: imports e funções novas no fim do ficheiro

3. Instruções do que fazer.

Importa `assertDeleteAccountPayload` no topo e acrescenta as funções abaixo ao service criado no BK anterior.

4. Código completo, correto e integrado com a app final.

```js
// apps/backend/src/modules/privacy/privacy.service.js
import { assertDeleteAccountPayload } from "./privacy.validation.js";

const PERSONAL_COLLECTIONS_TO_DELETE = [
    "playback_progress",
    "media_preferences",
    "user_content_lists",
    "content_ratings",
    "notification_preferences",
    "notifications",
];

/**
 * Cria um email técnico que já não identifica a pessoa.
 *
 * @param {ObjectId} userObjectId Id da conta eliminada.
 * @returns {string} Email anonimizado e estável.
 */
function anonymizedEmail(userObjectId) {
    return `deleted-${String(userObjectId)}@faithflix.local`;
}

/**
 * Remove dados pessoais de coleções cujo conteúdo pertence só ao utilizador.
 *
 * @param {import("mongodb").Db} db Ligação MongoDB.
 * @param {ObjectId} userObjectId Id do utilizador autenticado.
 * @returns {Promise<Record<string, number>>} Contagem de documentos removidos por coleção.
 */
async function deletePersonalCollections(db, userObjectId) {
    const entries = await Promise.all(
        PERSONAL_COLLECTIONS_TO_DELETE.map(async (collectionName) => {
            const result = await db
                .collection(collectionName)
                .deleteMany({ userId: userObjectId });

            return [collectionName, result.deletedCount ?? 0];
        }),
    );

    return Object.fromEntries(entries);
}

/**
 * Anonimiza comentários para manter discussão sem expor autoria pessoal.
 *
 * @param {import("mongodb").Db} db Ligação MongoDB.
 * @param {ObjectId} userObjectId Id do utilizador autenticado.
 * @returns {Promise<number>} Número de comentários anonimizados.
 */
async function anonymizeComments(db, userObjectId) {
    const result = await db.collection("content_comments").updateMany(
        { userId: userObjectId },
        {
            $set: {
                body: "Comentário removido por eliminação de conta.",
                authorName: "Conta eliminada",
                deletedByUser: true,
                updatedAt: new Date(),
            },
        },
    );

    return result.modifiedCount ?? 0;
}

/**
 * Elimina a própria conta com confirmação forte e limpeza controlada.
 *
 * @param {string} userId Id do utilizador obtido pela sessão.
 * @param {{ confirmation?: unknown }} input Dados recebidos do frontend.
 * @returns {Promise<{ deleted: true, deletedCollections: Record<string, number>, anonymizedComments: number }>} Resumo seguro da operação.
 * @throws {HttpError} Quando a confirmação falha ou a conta não existe.
 */
export async function deleteMyAccount(userId, input) {
    assertDeleteAccountPayload(input);

    const db = await getDb();
    const userObjectId = asUserObjectId(userId);
    const now = new Date();
    const user = await db.collection("users").findOne({ _id: userObjectId });

    if (!user) {
        throw new HttpError(404, "Utilizador não encontrado.");
    }

    const deletedCollections = await deletePersonalCollections(db, userObjectId);
    const anonymizedComments = await anonymizeComments(db, userObjectId);

    await db.collection("sessions").deleteMany({ userId: userObjectId });

    await db.collection("users").updateOne(
        { _id: userObjectId },
        {
            $set: {
                name: "Conta eliminada",
                email: anonymizedEmail(userObjectId),
                accountStatus: "deleted",
                deletedAt: now,
                updatedAt: now,
            },
            $unset: {
                passwordHash: "",
                resetTokenHash: "",
            },
        },
    );

    await db.collection("privacy_deletion_requests").insertOne({
        userId: userObjectId,
        requestedAt: now,
        status: "completed",
        deletedCollections,
        anonymizedComments,
    });

    return { deleted: true, deletedCollections, anonymizedComments };
}
```

5. Explicação do código.

`deletePersonalCollections` remove dados que pertencem apenas ao utilizador, incluindo `media_preferences`, porque preferências de áudio, legendas e qualidade também são dados da experiência pessoal. `anonymizeComments` usa a coleção real `content_comments` para preservar a existência do comentário no fluxo público, mas remove autoria e conteúdo pessoal. A coleção `sessions` é limpa para forçar logout real. A conta em `users` fica com `accountStatus: "deleted"` e email técnico, sem `passwordHash`.

6. Validação do passo.

Executa:

```bash
cd apps/backend
node -e "import('./src/modules/privacy/privacy.service.js').then(({ deleteMyAccount }) => console.log(typeof deleteMyAccount))"
```

O resultado esperado é `function`.

7. Cenário negativo/erro esperado.

Se o service eliminasse sessões antes de validar a confirmação, um pedido errado poderia terminar a sessão sem eliminar a conta. Por isso a confirmação é validada no início.

### Passo 3 - Expor a rota de eliminação

1. Objetivo funcional do passo no contexto da app.

Ligar a eliminação ao endpoint HTTP autenticado.

2. Ficheiros envolvidos:
    - EDITAR: `apps/backend/src/modules/privacy/privacy.controller.js`
    - EDITAR: `apps/backend/src/modules/privacy/privacy.routes.js`
    - LOCALIZAÇÃO: imports e funções novas

3. Instruções do que fazer.

Adiciona o controller e a rota `DELETE /account`.

4. Código completo, correto e integrado com a app final.

```js
// apps/backend/src/modules/privacy/privacy.controller.js
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
// apps/backend/src/modules/privacy/privacy.routes.js
import { deleteMyAccountController } from "./privacy.controller.js";

privacyRouter.delete(
    "/account",
    requireAuth,
    asyncHandler(deleteMyAccountController),
);
```

5. Explicação do código.

A rota usa `DELETE` porque a intenção é eliminar a conta. Continua protegida por `requireAuth`, e o controller passa apenas `req.user.id` e `req.body` validado pelo service.

6. Validação do passo.

Com utilizador autenticado:

```bash
curl -X DELETE http://127.0.0.1:3000/api/privacy/account \
  -H "Content-Type: application/json" \
  -d '{"confirmation":"ELIMINAR CONTA"}'
```

O resultado esperado é `200` com `{ "deleted": true, ... }`.

7. Cenário negativo/erro esperado.

Sem sessão, o endpoint deve devolver `401`. Com confirmação errada, deve devolver `400`.

### Passo 4 - Criar zona de perigo no frontend

1. Objetivo funcional do passo no contexto da app.

Dar ao utilizador uma interface clara para pedir eliminação, com confirmação consciente.

2. Ficheiros envolvidos:
    - EDITAR: `apps/frontend/src/services/api/privacyApi.js`
    - CRIAR: `apps/frontend/src/components/privacy/PrivacyDangerZone.jsx`
    - EDITAR: `apps/frontend/src/pages/AccountPage.jsx`
    - LOCALIZAÇÃO: API completa atualizada, componente completo e import/JSX na página

3. Instruções do que fazer.

Adiciona `deleteMyAccount` ao cliente `privacyApi`, cria `PrivacyDangerZone` e inclui o componente em `AccountPage`.

4. Código completo, correto e integrado com a app final.

```js
// apps/frontend/src/services/api/privacyApi.js
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
     * @param {{ confirmation: string }} input Confirmação textual.
     * @returns {Promise<{ deleted: boolean }>} Resultado da eliminação.
     */
    deleteMyAccount(input) {
        return apiClient.del("/api/privacy/account", { body: input });
    },
};
```

```jsx
// apps/frontend/src/components/privacy/PrivacyDangerZone.jsx
import { useState } from "react";
import { privacyApi } from "../../services/api/privacyApi.js";

const CONFIRMATION = "ELIMINAR CONTA";

/**
 * Zona de perigo para eliminação da própria conta.
 *
 * @returns {JSX.Element} Formulário de eliminação com confirmação forte.
 */
export function PrivacyDangerZone() {
    const [confirmation, setConfirmation] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");
    const [error, setError] = useState("");

    /**
     * Envia o pedido de eliminação para o backend.
     *
     * @param {React.FormEvent<HTMLFormElement>} event Evento do formulário.
     * @returns {Promise<void>} Termina quando o pedido é processado.
     */
    async function handleSubmit(event) {
        event.preventDefault();
        setLoading(true);
        setStatus("");
        setError("");

        try {
            await privacyApi.deleteMyAccount({ confirmation });
            setStatus("Conta eliminada. Volta a iniciar sessão apenas se criares nova conta.");
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
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
            <form onSubmit={handleSubmit}>
                <label>
                    Confirmação
                    <input
                        value={confirmation}
                        onChange={(event) => setConfirmation(event.target.value)}
                    />
                </label>
                <button type="submit" disabled={loading || confirmation !== CONFIRMATION}>
                    {loading ? "A eliminar..." : "Eliminar conta"}
                </button>
            </form>
        </section>
    );
}
```

```jsx
// apps/frontend/src/pages/AccountPage.jsx
import { PrivacyDangerZone } from "../components/privacy/PrivacyDangerZone.jsx";

// Dentro do return principal, depois de <PrivacyExportPanel />:
<PrivacyDangerZone />
```

5. Explicação do código.

O botão só fica ativo quando a confirmação é exatamente igual à constante. Isto é uma proteção de usabilidade; a proteção real continua no backend. O componente mostra erro e sucesso para que o utilizador perceba o resultado.

6. Validação do passo.

Na página `/conta`, escreve uma confirmação errada: o botão deve continuar desativado. Escreve `ELIMINAR CONTA`: o botão fica ativo e o backend processa a operação.

7. Cenário negativo/erro esperado.

Se alguém alterar o HTML no browser e enviar confirmação errada, o backend continua a devolver `400`. A segurança não depende da UI.

### Passo 5 - Criar teste da validação

1. Objetivo funcional do passo no contexto da app.

Garantir que a confirmação forte é obrigatória.

2. Ficheiros envolvidos:
    - CRIAR: `apps/backend/tests/unit/mf5-privacy-delete.validation.test.js`
    - LOCALIZAÇÃO: ficheiro completo

3. Instruções do que fazer.

Cria o teste abaixo.

4. Código completo, correto e integrado com a app final.

```js
// apps/backend/tests/unit/mf5-privacy-delete.validation.test.js
import assert from "node:assert/strict";
import { test } from "node:test";
import {
    assertDeleteAccountPayload,
    DELETE_ACCOUNT_CONFIRMATION,
} from "../../src/modules/privacy/privacy.validation.js";

test("MF5 valida confirmação forte para eliminar conta", () => {
    assert.deepEqual(
        assertDeleteAccountPayload({ confirmation: DELETE_ACCOUNT_CONFIRMATION }),
        { confirmation: DELETE_ACCOUNT_CONFIRMATION },
    );

    assert.throws(
        () => assertDeleteAccountPayload({ confirmation: "eliminar conta" }),
        /ELIMINAR CONTA/,
    );
});
```

5. Explicação do código.

O teste confirma o caso positivo e o caso negativo mais importante. A grafia exata reduz eliminações acidentais.

6. Validação do passo.

Executa:

```bash
cd apps/backend
node --test tests/unit/mf5-privacy-delete.validation.test.js
```

O resultado esperado é `pass`.

7. Cenário negativo/erro esperado.

Se o validator aceitar texto em minúsculas, o teste falha. Essa falha é correta, porque a confirmação deve ser deliberada.

#### Critérios de aceite

- `DELETE /api/privacy/account` existe e exige sessão.
- A operação exige confirmação `ELIMINAR CONTA`.
- O backend usa `req.user.id` e não aceita id arbitrário do frontend.
- Sessões do utilizador eliminado são removidas.
- Dados pessoais diretos, incluindo `media_preferences`, são removidos das coleções definidas.
- Comentários em `content_comments` ficam anonimizados.
- A conta em `users` perde email real, nome real e hashes.
- Existe registo mínimo em `privacy_deletion_requests` sem dados pessoais antigos.
- A página `/conta` mostra zona de perigo com confirmação forte.

#### Validação final

Executa:

```bash
cd apps/backend
node --test tests/unit/mf5-privacy-delete.validation.test.js
node -e "import('./src/modules/privacy/privacy.routes.js').then(({ privacyRouter }) => console.log(typeof privacyRouter))"
```

Depois valida manualmente:

- confirmação errada devolve `400`;
- pedido sem sessão devolve `401`;
- confirmação certa devolve `200`;
- depois da eliminação, o cookie antigo deixa de permitir acesso autenticado.

#### Evidence para PR/defesa

- `pr`: referência do commit ou PR.
- `proof`: output do teste de validação.
- `proof`: captura da zona de perigo em `/conta`.
- `neg`: confirmação errada devolve `400`.
- `neg`: pedido sem sessão devolve `401`.
- `neg`: sessão antiga deixa de aceder à conta depois da eliminação.

#### Handoff

O próximo BK, `BK-MF5-03`, deve tratar consentimentos apenas para contas ativas. Se uma conta estiver com `accountStatus: "deleted"`, a UI de consentimentos não deve permitir novas alterações.

#### Changelog

- `2026-04-13`: criado guia base com contrato pedagógico v3.
- `2026-06-16`: guia reescrito com confirmação forte, anonimização, revogação de sessões, frontend e teste.
