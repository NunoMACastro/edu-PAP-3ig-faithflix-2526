# Evidence BK-MF6-02 - Regressão frontend

- Owner: Kaue
- Apoio: Mateus
- Data: PREENCHER_COM_DATA_DA_EXECUCAO
- Requisito: RNF29
- PR/entrega: PREENCHER_COM_REFERENCIA_DO_PR_OU_ENTREGA_LOCAL

## Proof

| Comando | Resultado |
| --- | --- |
| `node scripts/check-frontend-regression.mjs` | PREENCHER_COM_OUTPUT_REAL_DO_SCRIPT |
| `npm run build` | PREENCHER_COM_OUTPUT_REAL_DO_BUILD |

## Negativos

| Cenário | Como executar | Resultado esperado | Resultado obtido |
| --- | --- | --- | --- |
| Rota de login removida de `AppRoutes.jsx` | Remover temporariamente a rota real `/login` | Falha com nome da rota em falta | PREENCHER_COM_RESULTADO_REAL |
| Import inexistente numa página | Escrever temporariamente um import inválido numa cópia local | Build falha | PREENCHER_COM_RESULTADO_REAL |
| Backend desligado em página com API | Abrir página que chama API com backend parado | Mensagem de erro controlada | PREENCHER_COM_RESULTADO_REAL |

## Observações

A regressão protege rotas e cliente API sem adicionar dependências ao frontend.