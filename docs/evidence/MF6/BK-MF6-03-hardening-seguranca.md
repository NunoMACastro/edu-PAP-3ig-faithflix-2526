# Evidence BK-MF6-03 - Hardening segurança e privacidade

- Owner: Matheus
- Apoio: Kaue
- Data: 2026-06-22 (`Europe/Lisbon`)
- PR/entrega: entrega local `referencia_privada_docente` sem commit (`PERMITIR_COMMITS: nao`)
- Requisitos: RNF14, RNF16, RNF17, RNF18, RNF19, RNF20, RNF37
- Estado: `PASS`

## Proof

| Verificação | Resultado |
| --- | --- |
| `node --check scripts/check-security-baseline.mjs` em `referencia_privada_docente/backend` | `PASS`, exit code 0. |
| `node scripts/check-security-baseline.mjs` em `referencia_privada_docente/backend` | `PASS`, output `Hardening MF6: PASS`. |
| `node --test tests/regression/mf6-backend-regression.test.js` em `referencia_privada_docente/backend` | `PASS`, 5 testes, 5 pass, 0 fail, `duration_ms 201.191917`. |
| `npm --prefix pasta_privada_do_professor/backend test` na sandbox | `BLOQUEADO_AMBIENTE`, 32 pass e 16 falhas HTTP por `listen EPERM: operation not permitted 127.0.0.1`. |
| `npm --prefix pasta_privada_do_professor/backend test` fora da sandbox | `PASS`, 48 testes, 48 pass, 0 fail, `duration_ms 319.914791`. |
| `node scripts/check-frontend-regression.mjs` em `referencia_privada_docente/frontend` | `PASS`, output `Regressao frontend MF6: PASS`. |
| `npm --prefix pasta_privada_do_professor/frontend run build` | `PASS`, Vite build com 100 módulos transformados e build em 483 ms. |
| Pesquisa estática de segurança em `referencia_privada_docente/backend` e `referencia_privada_docente/frontend` | `PASS_COM_NOTA`, apenas falsos positivos defensivos: regras do próprio scanner, `secret` na lista de redacção do logger, `secret` em chaves proibidas de integrações e `secret` em chaves removidas de exportação RGPD. |
| Pesquisa de drift de outros domínios | `PASS`, sem ocorrências de `StudyFlow`, `OPSA`, `Orelle`, `companyId`, fiscalidade, biometria, turma, professor, sala ou disciplina. |

## Revisão manual

| Módulo | Controlo revisto | Estado | Evidência real |
| --- | --- | --- | --- |
| `auth` | Password hashing e comparação segura | `PASS` | `referencia_privada_docente/backend/src/modules/auth/auth.password.js:7`, `:21`, `:48`; `registerUser` e `resetPassword` guardam `passwordHash` via `hashPassword` em `auth.service.js:78` e `:230`. |
| `users` | Rotas admin protegidas por role e auditoria administrativa | `PASS` | `user.routes.js:26`, `:29`, `:34` usam `requireRole(["admin"])`; `user.service.js:206` escreve em `admin_audit_logs`. |
| `privacy` | Exportação sem hashes, tokens ou campos técnicos sensíveis | `PASS` | `privacy.service.js:41` define `SENSITIVE_EXPORT_KEYS`; `:88` filtra chaves sensíveis; `:140` gera exportação por `userId`; `:275` remove `passwordHash` na eliminação. |
| `integrations` | Configuração pública sem segredos | `PASS` | `integrations.validation.js:32` e `:34` bloqueiam chaves/valores sensíveis; `:103` devolve erro explícito para segredos em `publicConfig`. |
| `recommendations` | Dados usados apenas para recomendação baseline autenticada | `PASS` | `recommendations.routes.js:14` exige `requireAuth`; `recommendations.service.js:79`, `:80` e `:83` usam apenas listas, histórico e ratings do `userId` autenticado. |
| `apiClient` | Sessão por cookie preservada no frontend | `PASS` | `referencia_privada_docente/frontend/src/services/api/apiClient.js:60` mantém `credentials: "include"`. |
| `logger` | Logs sem dados sensíveis | `PASS` | `referencia_privada_docente/backend/src/utils/logger.js:5` define chaves sensíveis e `:30` redige recursivamente valores antes de serializar. |

## Política de backups

| Item | Estado | Evidência |
| --- | --- | --- |
| Frequência mínima diária definida | `PASS` | Política operacional para a PAP: cópia diária da base MongoDB usada pelo ambiente de entrega, via mecanismo do provider configurado ou `mongodump` local, guardada fora do repositório. |
| Responsável por validar cópia | `PASS` | Matheus valida diariamente a existência da cópia e regista anomalias no diário de entrega local. |
| Responsável técnico pelo ensaio | `PASS` | Kaue executa ensaio de recuperação antes do gate S12. |
| Segredos fora do código fonte | `PASS` | Scanner `check-security-baseline.mjs` passou; pesquisa estática não encontrou connection strings MongoDB não locais nem segredos literais em `src`. |
| Ensaio de recuperação planeado | `PASS_COM_NOTA` | Procedimento mínimo: restaurar cópia para base temporária local, apontar `MONGODB_URI` para essa base e correr `npm --prefix pasta_privada_do_professor/backend test`; execução real de infraestrutura de backup fica fora do scope deste BK. |

## Negativos

| Cenário | Como provocar em cópia local | Resultado esperado | Resultado real |
| --- | --- | --- | --- |
| Credencial literal no código | Cópia temporária em `/private/tmp/faithflix-mf6-neg-secret` com `const password = "123";` | Scanner falha e aponta segredo literal provável | `PASS_NEGATIVO`, output controlado `PASS_NEGATIVO segredo literal detetado`. |
| Rota admin sem role | Cópia temporária em `/private/tmp/faithflix-mf6-neg-admin-role` substituindo `requireRole(["admin"])` por `requireAuth` em `users.routes.js` | Scanner falha no controlo estrutural de rotas admin | `PASS_NEGATIVO`, output controlado `PASS_NEGATIVO rota admin sem role detetada`. |
| Injeção direta de HTML | Cópia temporária em `/private/tmp/faithflix-mf6-neg-xss` com componente React usando `dangerouslySetInnerHTML` | Scanner falha por risco XSS estático | `PASS_NEGATIVO`, output controlado `PASS_NEGATIVO XSS estatico detetado`. |

## Handoff

- `BK-MF6-04` pode medir performance sem remover validações, guards, auditoria, redacção de logs ou `credentials: "include"`.
- `BK-MF6-06` deve consumir esta evidence como prova de segurança, privacidade, backups e negativos mínimos para gate S12.
