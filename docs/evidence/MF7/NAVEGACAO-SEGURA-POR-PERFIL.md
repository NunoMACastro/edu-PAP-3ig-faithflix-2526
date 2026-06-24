# Navegação segura por sessão e perfil - MF7

## Metadados

- BK: BK-MF7-02
- Owner: Matheus
- Fonte: RF02, RF04, RNF13, RNF15, RNF16, RNF19
- Decisão: EM_REVISAO

## Verificações

| Perfil | Ação | Resultado esperado | Resultado observado | Estado |
| --- | --- | --- | --- | --- |
| Visitante | Abrir header | Não vê links admin | A preencher | A preencher |
| Visitante | Abrir /admin/metricas | Redireciona para /login | A preencher | A preencher |
| Utilizador comum | Abrir header | Não vê links admin | A preencher | A preencher |
| Utilizador comum | Abrir /admin/metricas | Mostra aviso de permissão | A preencher | A preencher |
| Admin | Abrir header | Vê links admin | A preencher | A preencher |
| Admin | Abrir /admin/metricas | Vê página de métricas | A preencher | A preencher |
| Backend | Chamar rota admin sem sessão | 401 | A preencher | A preencher |
| Backend | Chamar rota admin como user | 403 | A preencher | A preencher |

## Handoff para BK-MF7-03

- Header filtrado por sessão:
- Links públicos confirmados:
- Links admin confirmados:
- Riscos visuais que passam para tokens/layout: