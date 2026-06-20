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
- `sprint`: `S11`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF6-04`
- `guia_path`: `docs/planificacao/guias-bk/MF6/BK-MF6-03-hardening-seguranca-e-privacidade.md`
- `last_updated`: `2026-06-18`

#### Objetivo

Neste BK vais endurecer a aplicação contra falhas comuns de segurança e privacidade, validando password hashing, validação de input, proteção de dados sensíveis, auditoria administrativa, backups e uso restrito dos dados de recomendação.

O resultado final é um script de análise estática em `backend/scripts/check-security-baseline.mjs`, uma checklist manual objetiva e evidence para o gate S12.

#### Importância

Segurança não é um acabamento visual. Num produto com contas, subscrições, histórico, ratings, consentimentos, associações e administração, uma falha de validação ou exposição de dados pode comprometer utilizadores e destruir a credibilidade da PAP.

Este BK não promete segurança absoluta. O objetivo é fechar os controlos mínimos documentados nos RNF e tornar explícito o que foi verificado.

#### Scope-in

- Confirmar hashing de passwords.
- Procurar padrões perigosos em backend e frontend.
- Rever input validation, ownership, roles e auditoria admin.
- Validar que dados de recomendação não são partilhados fora da aplicação.
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

#### Pre-requisitos

- `BK-MF1-04` criou sessão segura por cookie.
- `BK-MF2-01` criou autenticação e password hashing.
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
| Evidence | `docs/evidence/MF6/BK-MF6-03-hardening-seguranca.md` |
| Handoff | `BK-MF6-04` só mede performance depois de segurança base estar verificada |

#### Ficheiros a criar/editar/rever

- CRIAR: `backend/scripts/check-security-baseline.mjs`
- REVER: `backend/src/modules/auth/auth.password.js`
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

A deteção de segredos é feita linha a linha. Isto evita falsos positivos importantes no projeto: o fallback local `mongodb://127.0.0.1:27017`, variáveis locais chamadas `password` usadas antes de hash/verificação e referências de formulário como `form.password`. O script continua a falhar quando encontra um valor literal como `password=123` ou `const secret = "valor-real"`.

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
    - REVER: `backend/src/modules/auth/auth.password.js`
    - REVER: `backend/src/modules/users/user.service.js`
    - REVER: `backend/src/modules/privacy/privacy.service.js`
    - REVER: `backend/src/modules/integrations/integrations.validation.js`
    - REVER: `backend/src/modules/recommendations/recommendations.service.js`
    - LOCALIZAÇÃO: funções exportadas principais

3. Instruções do que fazer.

Revê os ficheiros e confirma:

- passwords são guardadas como hash;
- endpoints admin exigem role de administração;
- exportação de dados remove hashes, tokens e campos técnicos sensíveis;
- integrações admin não aceitam valores secretos na configuração pública;
- recomendações usam histórico, favoritos e ratings apenas dentro da aplicação.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. O passo é uma revisão técnica orientada por `RNF14`, `RNF17`, `RNF18`, `RNF19` e `RNF37`.

5. Explicação do código.

Revisão manual continua necessária porque alguns riscos são semânticos. Um script consegue encontrar padrões textuais, mas não sabe se uma rota admin tem o guard correto ou se uma exportação incluiu um campo sensível por engano.

6. Validação do passo.

Regista no ficheiro de evidence uma linha por módulo revisto, com `PASS` ou `FAIL` e motivo.

7. Cenário negativo/erro esperado.

Se encontrares uma rota admin sem guard de role, o BK fica bloqueado para fecho até a rota ser corrigida no BK de implementação responsável ou até o risco ficar registado como ação corretiva.

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

Sem código neste passo. A validação executa o script criado no passo 1 e a regressão criada em `BK-MF6-01`.

5. Explicação do código.

Hardening sem regressão pode introduzir quebra funcional. Por isso, a validação combina análise de risco e testes existentes.

6. Validação do passo.

```bash
cd backend
node scripts/check-security-baseline.mjs
node --test tests/regression/mf6-backend-regression.test.js
```

Resultado esperado: ambos os comandos terminam em `PASS`.

7. Cenário negativo/erro esperado.

Se o script encontrar credencial provável em código fonte, a validação deve falhar. A correção é mover o valor para variável de ambiente e remover o valor do ficheiro versionado.

#### Critérios de aceite

- `check-security-baseline.mjs` existe e executa sem dependências novas.
- A revisão manual cobre auth, users, privacy, integrations e recommendations.
- A evidence `BK-MF6-03-hardening-seguranca.md` existe, inclui `PR/entrega`, output real, política de backups e recuperação.
- A evidence não fica com `PASS` pré-preenchido antes da execução.
- A regressão backend continua verde depois do hardening.
- Existem pelo menos 3 negativos documentados para prioridade `P0`.

#### Validação final

```bash
cd backend
node scripts/check-security-baseline.mjs
node --test tests/regression/mf6-backend-regression.test.js
```

#### Evidence para PR/defesa

- `pr`: referência do PR ou entrega local com script e evidence.
- `proof`: output real do script de hardening, regressão backend, revisão manual e política de backups.
- `neg`: resultado real para credencial provável em código, estado admin sem role e política de backup incompleta.

#### Handoff

`BK-MF6-04` deve medir performance depois de confirmar que os controlos de segurança e privacidade continuam ativos. Otimização não deve remover validações, guards ou auditoria.

#### Changelog

- `2026-04-13`: guia inicial criado em formato genérico.
- `2026-06-18`: guia revisto com análise estática de segurança, checklist RNF e evidence operacional consolidada.
- `2026-06-19`: evidence corrigida para usar placeholders, `PR/entrega`, output real e negativos rastreáveis antes do gate.
