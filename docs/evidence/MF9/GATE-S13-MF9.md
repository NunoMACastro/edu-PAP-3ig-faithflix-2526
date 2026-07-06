<!-- docs/evidence/MF9/GATE-S13-MF9.md -->
## Negativos obrigatórios

<!-- Estes negativos fecham os principais riscos de segurança, ownership e qualidade da MF9. -->
| Negativo | Resultado esperado | Resultado obtido | Evidência |
| --- | --- | --- | --- |
| Plano inexistente no checkout simulado | HTTP 404 | PENDENTE | |
| Owner Pro tenta convidar membro | HTTP 403 | PENDENTE | |
| Membro com subscrição paga tenta aceitar Família | HTTP 409 | PENDENTE | |
| Membro duplicado tenta entrar noutra Família | HTTP 409 | PENDENTE | |
| Utilizador Pro tenta reproduzir 4K | 4K bloqueado sem URL 4K | PENDENTE | |
| User comum tenta abrir métricas admin | HTTP 403 | PENDENTE | |
| E2E sem seed MF9 | Teste falha antes do gate | PENDENTE | |

## Revisão manual RNF21/RNF22/RNF38/RNF40

| Área | Prova mínima | Resultado |
| --- | --- | --- |
| Browser moderno | Chromium E2E + browser manual registado | PENDENTE |
| Mobile | `/planos` e `/ver/:id` sem overlap em largura móvel | PENDENTE |
| Desktop | `/planos` e `/ver/:id` sem regressão visual evidente | PENDENTE |
| Português de Portugal | Mensagens visíveis com acentuação correta | PENDENTE |
| Formato europeu | Datas visíveis em `dd/mm/aaaa` quando existirem | PENDENTE |

## Decisão final

- Decisão: PENDENTE
- Data:
- Responsável:
- Evidência backend:
- Evidência frontend:
- Evidência E2E:
- Evidência de planificação:
- Riscos aceites:
- Próxima ação: