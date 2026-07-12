# Evidencia browser MF7

- `document_status`: `HISTORICAL_SNAPSHOT`
- `snapshot_date`: `2026-06-25`
- `implementation_lane`: `REFERENCE`
- `current_authority`: `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-END-TO-END-real_dev.md`
- `proof_scope`: cinco screenshots e JSON gerados com API mock local; não prova o frontend atual, os browsers atuais nem um fluxo E2E com backend/DB

> Os resultados `PASS` abaixo pertencem exclusivamente ao snapshot indicado por
> `generatedAt` no JSON. Não são revalidação atual e não promovem BKs dos alunos.

## Objetivo

Fechar as ressalvas `AUD-MF7-BK05-P2-01` e `AUD-MF7-BK05-P2-02` com prova browser objetiva para mobile, tablet, desktop, perfis `visitante`, `user`, `moderator` e `admin`, e navegação por teclado.

## Artefactos

| Ficheiro | Cenário | Resultado |
| --- | --- | --- |
| `mf7-mobile-390-anonymous-home.png` | Visitante em 390x844 na home pública. | `PASS`; hero visível e nav sem links admin. |
| `mf7-tablet-768-user-admin-denied.png` | User comum em 768x900 a tentar abrir rota admin. | `PASS`; página admin bloqueada com mensagem de permissão. |
| `mf7-desktop-1366-moderator-catalog.png` | Moderator em 1366x900 no catálogo admin. | `PASS`; acesso ao catálogo admin, sem links exclusivos de admin. |
| `mf7-desktop-1440-admin-home.png` | Admin em 1440x900 na home. | `PASS`; links admin esperados visíveis. |
| `mf7-keyboard-skip-link.png` | Teclado em 1280x820 na home pública. | `PASS`; `Tab` foca o skip link e `Enter` move foco para `main#conteudo-principal`. |
| `mf7-browser-validation-results.json` | Resumo estruturado dos cinco cenários. | `PASS`; `ok: true` em todos os cenários. |
| `mock-api.mjs` | Fixture local de API para controlar sessão/perfil durante a recolha. | Suporte de evidence; não altera código aplicacional. |
| `collect-browser-evidence.mjs` | Coletor Playwright local para regenerar screenshots e JSON. | Suporte de evidence; requer API mock em `127.0.0.1:3000` e frontend em `127.0.0.1:4176`. |

## Ressalvas

- A fixture local de API foi usada apenas para tornar os perfis reproduzíveis na recolha de screenshots.
- A validação automatizada de teclado/skip link ficou fechada nesta recolha; a revisão humana final antes da defesa continua recomendada como controlo de qualidade, não como finding aberto.
- Chromium/WebKit desta recolha não substituem Chrome/Edge branded ou Safari real.
