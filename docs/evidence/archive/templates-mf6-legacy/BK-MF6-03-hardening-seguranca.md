# Evidence BK-MF6-03 - Hardening segurança e privacidade

- `document_status`: `SUPERSEDED`
- `snapshot_date`: `2026-07-10`
- `implementation_lane`: `REFERENCE`
- `current_authority`: `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-END-TO-END-real_dev.md`
- `proof_scope`: template MF6 legado arquivado com placeholders preservados; não constitui procedimento atual, execução ou evidence de segurança

> Arquivado em 2026-07-10: template duplicado com placeholders; não é evidence.

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
