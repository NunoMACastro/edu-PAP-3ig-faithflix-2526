# Página de login e registo FaithFlix

- `document_status`: `CURRENT`
- `snapshot_date`: `2026-07-11`
- `implementation_lane`: `REFERENCE`
- `current_authority`: `docs/RF.md`
- `decision`: `PASS_COM_RISCOS`
- `proof_scope`: redesign e validação local de `/login`; o E2E MF2 com MongoDB isolado ficou preparado mas não executado neste ambiente

## Objetivo e resultado visual

`/login` passou de uma secção genérica estreita para uma experiência de
identidade com duas áreas: composição editorial verde e superfície clara para
autenticação. Login e registo continuam na mesma rota; a recuperação surge de
forma progressiva sem competir com as duas ações principais.

Em desktop e tablet, a composição usa duas colunas limitadas por
`--content-width`. Abaixo de `720 px`, a área editorial faz reflow para uma
faixa compacta e o formulário surge imediatamente a seguir. A implementação
mantém um único `h1`, foco visível, targets mínimos e ausência de overflow.

Capturas revistas:

- `screenshots/login-desktop.png`: viewport `1366x900`, captura full-page
  `1366x999`;
- `screenshots/login-mobile.png`: viewport `390x844`, captura full-page
  `390x1180`.

Foram ainda inspecionados, sem publicação permanente, `2048x1152` e
`768x900`.

## Fluxos e contratos preservados

Não foram criados endpoints, schemas ou regras de negócio. A interface usa:

| Fluxo | Contrato existente | Comportamento UI |
| --- | --- | --- |
| Registo | `POST /api/auth/register` | Cria a conta, atualiza a sessão e respeita o `next` interno seguro. |
| Login | `POST /api/auth/login` | Atualiza a sessão apenas depois da resposta bem-sucedida. |
| Pedido de recuperação | `POST /api/auth/forgot-password` | Mantém a resposta indistinguível para emails existentes e inexistentes. |
| Reset | `POST /api/auth/reset-password` | Exige token hexadecimal de 64 caracteres e nova password; regressa ao login depois do sucesso. |
| Sessão canónica | `GET /api/session/me` | Continua a distinguir `anonymous`, `authenticated` e `unavailable`. |

Os métodos internos de `authApi` passaram a aceitar `AbortSignal` de forma
aditiva. Submissões concorrentes são bloqueadas, pedidos pendentes são
cancelados no unmount e respostas tardias não atualizam um componente já
desmontado.

## Fronteira de segurança

- O browser nunca recebe o token de reset através do pedido público, do URL ou
  do estado de sessão.
- O canal `password_reset_dev_outbox` continua separado, dev-only e proibido
  em produção.
- Login e registo continuam a limpar o token CSRF da sessão anterior depois de
  sucesso; os endpoints públicos mantêm `csrf: false` conforme o contrato
  existente.
- O `next` só aceita destinos internos validados por `getSafeRedirectPath`.
- Password e token são descartados ao mudar de fluxo, após sucesso ou ao
  desmontar; email e nome podem permanecer para evitar repetição.
- A seed MF2 guarda apenas o hash SHA-256 de um token conhecido de teste numa
  base terminada em `_e2e`. O valor raw existe apenas na fixture automatizada.

## Estados e acessibilidade

- Os únicos modos principais são “Entrar” e “Criar conta”, com
  `aria-pressed`.
- “Esqueceste-te da palavra-passe?” abre o pedido por email e “Já tenho um
  token” abre o reset.
- Títulos, descrições e CTAs mudam conforme o fluxo.
- Validação HTML acompanha os limites backend: nome `2–80`, email até `254`,
  password `10–128` e token hexadecimal com `64` caracteres.
- `autocomplete`, foco após transições, regiões `status`/`alert` e controlo
  acessível para mostrar a password foram validados por testes.
- `prefers-reduced-motion` elimina transições relevantes sem esconder estado.

## Testes executados em 2026-07-11

| Comando | Resultado observado |
| --- | --- |
| `VITE_API_BASE_URL=https://api.example.invalid npm run validate` em `real_dev/frontend` | `PASS`: lint, `56` ficheiros/`252` testes e build Vite. |
| `npm test` em `real_dev/backend` | `PASS`: `287/287`. |
| `npm run test:contracts` em `real_dev/backend` | `PASS`: `15/15`. |
| `npm run test:security` em `real_dev/backend` | `PASS`: `11/11`; baseline `Hardening MF6: PASS`. |
| `npm run test:a11y -- --grep "rota pública /login"` | `PASS`: `1/1`, sem bloqueios Axe nem overflow. |
| `PUBLISH_EVIDENCE=true npm run test:a11y -- --grep "login responsivo"` | `PASS`: `4/4` em `2048`, `1366`, `768` e `390 px`. |
| `npm run test:a11y` global | `19/21`; os cinco cenários de `/login` passaram. Permanecem duas falhas preexistentes fora deste redesign: contraste do spotlight do catálogo e heading esperado na pesquisa. |
| `npm run test:docs` | A nova evidence passou metadata; o gate global continua `FAIL` apenas por marcadores já ausentes em `ARCHITECTURE.md` (`version CAS`, estados de media e índices). |
| `npm run seed:e2e:mf2` | Guard recusou corretamente a execução sem `NODE_ENV=test`; nenhum dado foi escrito. |

## Cobertura E2E preparada e limitações

`tests/e2e/mf2-flow.spec.js` cobre agora login existente, registo pelo browser,
logout, novo login, resposta genérica de recuperação, reset e rejeição da
password antiga. A seed limpa apenas emails/IDs reservados na base `_e2e` e
insere o token de reset apenas por hash.

O E2E funcional não foi executado nesta sessão porque não foi fornecida uma
configuração MongoDB formal com `NODE_ENV=test`, `ALLOW_E2E_SEED=true`,
`TEST_MONGODB_URI` e `TEST_MONGODB_DB_NAME` terminada em `_e2e`. Esta limitação
impede classificar a prova como `PASS` absoluto, mas não foi contornada com uma
base de desenvolvimento ou produção.

O redesign fica `PASS_COM_RISCOS`: implementação, regressão unitária/backend,
segurança, Axe e quatro viewports passaram; falta apenas executar o fluxo E2E
preparado num ambiente MongoDB isolado e resolver separadamente os dois erros
globais não relacionados.
