# Plano de Execucao - MF2 FaithFlix

Snapshot do backlog: `2026-05-25` (`docs/planificacao/backlogs/BACKLOG-MVP.md`).

Guias MF2 refinados/reauditados: `2026-05-31` (`docs/planificacao/guias-bk/MF2/`).

Data de conclusão: `05-Junho-2026 às 13:00`.

## 1) Contexto principal

A `MF2` da FaithFlix e a macrofase de core streaming MVP. Vem depois da `MF1`, que entrega a fundacao tecnica, cliente API, sessao segura, health-check, logging e smoke tests.

Esta macro junta dois eixos de produto:

- identidade, perfil, roles, catalogo e detalhe de conteudo;
- player, progresso, preferencias de media, biblioteca pessoal e E2E do fluxo principal.

Ao contrario da `MF1`, que cria a base tecnica FE/BE, a `MF2` transforma essa base numa experiencia real de streaming. A regra principal e reutilizar o que ja existe na `MF1`, sem criar estruturas paralelas nem contratos novos de autenticacao.

Stack/contrato tecnico previsto:

- Node.js + Express;
- React + Vite;
- MongoDB;
- sessao por cookie `HttpOnly`;
- frontend com `credentials: "include"`;
- frontend em `frontend/`;
- backend em `backend/`;
- separacao por camadas: `routes -> controller -> service -> validation/database`;
- evidence obrigatoria por BK.

---

## 2) Tutorial Git/GitHub por BK (VS Code ou Codespaces)

Esta e a rotina obrigatoria para cada BK da `MF2`. O objetivo e garantir que cada aluno trabalha sempre sobre codigo atualizado, numa branch isolada, com commits pequenos e PR para `main`.

Podes fazer isto no VS Code local ou no GitHub Codespaces. Em ambos os casos, usa o terminal integrado:

- VS Code: `Terminal > New Terminal`;
- Codespaces: abrir o repositorio da PAP no GitHub, escolher `Code > Codespaces`, entrar no codespace e usar o terminal integrado.

### Passo 1 - Pull antes de trabalhar

Antes de tocar no codigo, confirmar que estas na `main` e que tens a versao mais recente.

```bash
git status
```

Se aparecerem alteracoes tuas por guardar, nao fazer pull ainda. Primeiro confirmar se sao para commit, se sao temporarias ou se pertencem a outro BK.

Depois, ir para a `main` e atualizar:

```bash
git switch main
git pull origin main
```

Regra: a branch do BK deve nascer depois deste pull. Assim evita-se trabalhar em cima de codigo antigo.

### Passo 2 - Escolher o BK e criar a branch

Escolher o BK que vai ser implementado e criar a branch correspondente:

- `BK-MF2-01`: `feat/faithflix-mf2-01-auth-matheus`
- `BK-MF2-02`: `feat/faithflix-mf2-02-perfil-roles-matheus`
- `BK-MF2-03`: `feat/faithflix-mf2-03-catalogo-taxonomias-davi`
- `BK-MF2-04`: `feat/faithflix-mf2-04-detalhe-conteudo-mateus`
- `BK-MF2-05`: `feat/faithflix-mf2-05-playback-continuar-mateus`
- `BK-MF2-06`: `feat/faithflix-mf2-06-media-parental-mateus`
- `BK-MF2-07`: `feat/faithflix-mf2-07-biblioteca-davi`
- `BK-MF2-08`: `feat/faithflix-mf2-08-e2e-fluxo-kaue`

Exemplo para o `BK-MF2-01`:

```bash
git switch -c feat/faithflix-mf2-01-auth-matheus
```

Confirmar que a branch ativa e a correta:

```bash
git branch --show-current
```

### Passo 3 - Implementar em ciclos pequenos

Antes de escrever codigo:

1. Ler o guia do BK em `docs/planificacao/guias-bk/MF2/`.
2. Confirmar dependencias e scope-out.
3. Confirmar os ficheiros reais em `backend/` e `frontend/`.
4. Implementar uma parte pequena.
5. Verificar o que mudou.

Comandos uteis:

```bash
git status
git diff
```

Regra: nao misturar varios BKs na mesma branch. Uma branch, um BK.

### Passo 4 - Testar antes de commit

Correr os testes relevantes ao tipo de alteracao.

Para backend/API:

```bash
npm --prefix backend test
```

Para frontend/UI:

```bash
npm --prefix frontend run build
```

Para smoke geral:

```bash
npm run smoke
```

Para validacao documental:

```bash
bash scripts/validate-planificacao.sh
```

No `BK-MF2-08`, depois de configurar Playwright:

```bash
npm run e2e:mf2
```

Se o BK tiver UI, validar tambem o fluxo no frontend e guardar evidence sanitizada, sem cookies, passwords, tokens, dados pessoais ou screenshots sensiveis.

Se um teste falhar, corrigir antes de fazer commit. Se a falha for de infraestrutura externa, registar isso nas notas/evidence.

Nota operacional: no snapshot atual nao existe script `lint` oficial na raiz, no backend ou no frontend. Nao tratar lint como obrigatorio ate existir script documentado.

### Passo 5 - Fazer commits claros

Ver primeiro os ficheiros alterados:

```bash
git status
```

Adicionar apenas ficheiros do BK:

```bash
git add backend/src/modules/auth
git add frontend/src/services/api/authApi.js
```

Ou, se todas as alteracoes pertencerem mesmo ao BK:

```bash
git add .
```

Antes do commit, confirmar que nao entrou nada sensivel:

```bash
git diff --cached
```

Criar commit com mensagem curta e ligada ao BK:

```bash
git commit -m "feat(mf2-01): add auth flow"
```

Boas regras para commits:

- um commit deve representar uma unidade logica;
- nao juntar formatter, refactor grande e feature no mesmo commit sem necessidade;
- nao commitar `.env`, cookies, tokens, passwords, URIs privadas ou evidence sensivel;
- se houver mais trabalho no mesmo BK, repetir ciclo: alterar, testar, `git add`, `git commit`.

### Passo 6 - Push da branch

Quando o BK estiver pronto localmente:

```bash
git push -u origin feat/faithflix-mf2-01-auth-matheus
```

Nos pushes seguintes da mesma branch, basta:

```bash
git push
```

### Passo 7 - Abrir PR para `main`

No GitHub:

1. Abrir o repositorio.
2. Clicar em `Compare & pull request`, ou ir a `Pull requests > New pull request`.
3. Confirmar:
    - base: `main`;
    - compare: branch do BK.
4. Titulo recomendado:

```text
BK-MF2-01 - Registo, login e recuperacao de password
```

5. Na descricao do PR, preencher:
    - BK implementado;
    - RF/RNF;
    - resumo tecnico;
    - ficheiros principais;
    - smoke test;
    - negativos;
    - comandos executados;
    - screenshots, se houver UI;
    - notas de seguranca/privacidade.
6. Criar Pull Request.

Regra: o PR e sempre para `main`, nunca diretamente para outra branch sem combinacao previa.

### Passo 8 - Rever checks e responder a feedback

Depois de abrir o PR:

1. Esperar pelos checks.
2. Se falharem, abrir logs e corrigir na mesma branch.
3. Fazer novo commit.
4. Fazer `git push`.

O PR atualiza automaticamente.

### Passo 9 - Depois do merge

Quando o PR for aprovado e merged:

```bash
git switch main
git pull origin main
```

Se a branch local ja nao for necessaria:

```bash
git branch -d feat/faithflix-mf2-01-auth-matheus
```

No proximo BK, repetir o processo desde o Passo 1.

---

## 3) BKs da MF2

Owner stream P0 da MF2: `TODO_CONFIRMAR`

Equipa envolvida na MF2: `Matheus`, `Mateus`, `Davi` e `Kaue`

| BK          | Titulo                                   | Owner   | Apoio   | Pri | Esforco | Dependencias             | RF/RNF                 |
| ----------- | ---------------------------------------- | ------- | ------- | --- | ------- | ------------------------ | ---------------------- |
| `BK-MF2-01` | Registo, login e recuperacao de password | Matheus | Mateus  | P0  | L       | `BK-MF1-06`              | RF01, RF02, RF05       |
| `BK-MF2-02` | Edicao de perfil e papeis base           | Matheus | Kaue    | P0  | M       | `BK-MF2-01`              | RF03, RF04             |
| `BK-MF2-03` | CRUD de catalogo e taxonomias            | Davi    | Matheus | P0  | L       | `BK-MF2-02`              | RF06, RF07, RF09, RF10 |
| `BK-MF2-04` | Pagina de detalhe de conteudo            | Mateus  | Davi    | P0  | M       | `BK-MF2-03`              | RF08                   |
| `BK-MF2-05` | Reproducao e continuar a ver             | Mateus  | Matheus | P0  | L       | `BK-MF2-04`              | RF11, RF12             |
| `BK-MF2-06` | Legendas/audio, parental e qualidade     | Mateus  | Kaue    | P1  | M       | `BK-MF2-05`              | RF13, RF14, RF15       |
| `BK-MF2-07` | Favoritos/watchlist/historico            | Davi    | Mateus  | P0  | M       | `BK-MF2-05`              | RF16, RF17, RF18       |
| `BK-MF2-08` | Teste E2E do fluxo principal             | Kaue    | Mateus  | P0  | M       | `BK-MF2-06`, `BK-MF2-07` | RNF07, RNF08           |

Todos estao planeados para `S02-S04`.

Ordem interna obrigatoria:

1. `BK-MF2-01`
2. `BK-MF2-02`
3. `BK-MF2-03`
4. `BK-MF2-04`
5. `BK-MF2-05`
6. `BK-MF2-06` e `BK-MF2-07`
7. `BK-MF2-08`

---

## 4) Regra principal obrigatoria

Antes de comecar qualquer BK:

1. Ler o guia completo do BK.
2. Confirmar `owner`, `apoio`, `prioridade`, `dependencias`, `rf_rnf` e `proximo_bk`.
3. Confirmar se o BK pertence ao eixo de identidade/catalogo ou ao eixo de player/biblioteca/E2E.
4. Perceber o que entra e o que fica fora.
5. Conseguir explicar o plano de implementacao em 2-3 frases.
6. Confirmar comigo antes de implementar ou fechar o BK.

Nenhum BK pode ficar `DONE` sem:

- smoke;
- negativos;
- validacao tecnica;
- evidence `pr`, `proof`, `neg`;
- validacao de seguranca/privacidade quando houver dados de utilizador;
- validacao da planificacao sem drift.

---

## 5) Atencao obrigatoria a paths e estrutura

A estrutura real do FaithFlix neste repositorio e:

- `backend/` para API Node.js/Express;
- `frontend/` para app React + Vite;
- `docs/` para documentacao;
- `scripts/` para validacao;
- `tests/e2e/` apenas quando o `BK-MF2-08` criar os testes E2E.

Regra:

1. A estrutura real da app tem prioridade.
2. Nao criar `server/`, `client/`, `apps/api` ou `apps/web` neste projeto.
3. Se um guia mencionar um ficheiro equivalente ja existente, editar o existente.
4. Preservar entregas da `MF1`, especialmente `/health`, `requestLogger`, `sessionConfig`, `apiClient`, scripts `smoke` e montagem Express existente.
5. Nao substituir ficheiros partilhados se isso remover rotas, middlewares, exports ou scripts de BK anterior.
6. Se houver duvida de arquitetura, parar e perguntar.

Isto e blocker de arquitetura. Nao e detalhe cosmetico.

---

## 6) Dados, seguranca e variaveis de ambiente

Nunca meter segredos no repositorio.

Usar apenas `.env` local para:

- `NODE_ENV`;
- `PORT`;
- `SERVICE_NAME`;
- `SESSION_COOKIE_NAME`;
- `MONGODB_URI`;
- `MONGODB_DB_NAME`.

Na `MF2`, os riscos principais sao:

- passwords;
- cookies e sessoes;
- dados pessoais de utilizador;
- roles e autorizacao admin/moderator;
- historico de visualizacao;
- favoritos e watchlist;
- preferencias de media e controlo parental;
- evidence com screenshots ou logs.

Antes de qualquer commit:

```bash
git status
```

Confirmar:

- `.env` nao esta staged;
- nao ha passwords, tokens, URIs privadas ou cookies reais em commits;
- evidence esta sanitizada;
- screenshots/logs nao expoem dados sensiveis;
- tokens nao ficam em `localStorage`;
- respostas publicas nao expoem `passwordHash`, `tokenHash`, `resetTokenHash`, paths internos ou campos administrativos;
- dados de ownership usam `req.user.id`, nunca `userId` vindo do frontend.

---

## 7) Ordem de execucao

0. Fazer refresh de tabs GitHub/IDE abertas.
1. Ler `docs/planificacao/README.md`.
2. Confirmar hierarquia de verdade:
    - `MATRIZ-CANONICA-BK`;
    - `BACKLOG-MVP`;
    - `PLANO-SPRINTS`;
    - `SCORECARD-SPRINTS`;
    - `GUIAO-DOCENTE-SEMANAL`;
    - `guias-bk/*`.
3. Abrir `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`.
4. Confirmar `MF2 - Core streaming MVP`.
5. Abrir `docs/planificacao/backlogs/MF-VIEWS.md`.
6. Confirmar sequencia:
    - `BK-MF2-01`;
    - `BK-MF2-02`;
    - `BK-MF2-03`;
    - `BK-MF2-04`;
    - `BK-MF2-05`;
    - `BK-MF2-06`;
    - `BK-MF2-07`;
    - `BK-MF2-08`.
7. Abrir `docs/planificacao/backlogs/BACKLOG-MVP.md`.
8. Confirmar estado, dependencias, owner, apoio, prioridade, esforco e RF/RNF.
9. Abrir o guia especifico do BK em `docs/planificacao/guias-bk/MF2/`.
10. Validar o scope-out antes de escrever codigo.
11. Implementar em ciclos curtos, mantendo PR pequeno.
12. Validar smoke + negativos + evidence.
13. Correr validacao documental:

```bash
bash scripts/validate-planificacao.sh
```

---

## 8) SSOT minimo da MF2

Ler apenas as partes relevantes:

- `docs/RF.md`
    - `RF01..RF18`.

- `docs/RNF.md`
    - `RNF07`;
    - `RNF08`;
    - `RNF13`;
    - `RNF14`;
    - `RNF15`;
    - `RNF16`;
    - `RNF17`;
    - `RNF27`;
    - `RNF28`;
    - `RNF29`;
    - `RNF30`;
    - `RNF31`.

- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
    - macrofases;
    - regras transversais;
    - gates `S4/S8/S12`.

- `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - linhas `BK-MF2-01..BK-MF2-08`;
    - contrato pedagogico comum;
    - matriz minima de negativos por prioridade.

- `docs/planificacao/backlogs/MF-VIEWS.md`
    - `## MF2 - Core streaming MVP`.

- `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - `S02`, `S03` e `S04`;
    - ordem interna obrigatoria;
    - gate em `S04`.

- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF2.md`
    - decisoes tecnicas confirmadas;
    - drift documental corrigido;
    - riscos restantes.

- Guias especificos:
    - `BK-MF2-01-registo-login-recuperacao-password.md`;
    - `BK-MF2-02-edicao-perfil-papeis-base.md`;
    - `BK-MF2-03-crud-catalogo-taxonomias.md`;
    - `BK-MF2-04-pagina-detalhe-conteudo.md`;
    - `BK-MF2-05-reproducao-continuar-a-ver.md`;
    - `BK-MF2-06-legendas-audio-parental-e-qualidade.md`;
    - `BK-MF2-07-favoritos-watchlist-historico.md`;
    - `BK-MF2-08-teste-e2e-fluxo-principal.md`.

---

## 9) Validacao por BK

### `BK-MF2-01` - Registo, login e recuperacao de password

Smoke:

- registo devolve `201` e `Set-Cookie` com `HttpOnly`;
- `GET /api/session/me` devolve utilizador autenticado;
- logout apaga a sessao e limpa o cookie;
- pedido de recuperacao devolve resposta generica.

Negativos:

- login com password errada => `401`;
- reset com token invalido/expirado/usado => erro controlado;
- resposta nao expoe `passwordHash`, `tokenHash` nem `resetTokenHash`;
- token nao fica em `localStorage`;
- `GET /api/session/me` sem cookie segue o contrato definido no guia/smoke.

Bloqueios:

- depende de `BK-MF1-06`;
- preservar `express` 4, `/health`, `requestLogger` e scripts `smoke`;
- MongoDB local ou Atlas tem de estar acessivel por `MONGODB_URI`;
- recuperacao real por email fica fora deste BK.

### `BK-MF2-02` - Edicao de perfil e papeis base

Smoke:

- `GET /api/users/me` com cookie valido devolve `200`;
- `PATCH /api/users/me` altera apenas `name`;
- `GET /api/users` devolve `200` apenas para `admin`;
- `/conta` e `/admin/utilizadores` existem.

Negativos:

- sem sessao => `401`;
- user sem role admin tenta listar utilizadores => `403`;
- tentativa de alterar `role` pelo perfil proprio nao muda a role;
- role fora de `user`, `moderator`, `admin` => `400`;
- resposta nao expoe `passwordHash`.

Bloqueios:

- depende de `BK-MF2-01`;
- `req.user` deve vir da sessao real;
- seguranca real fica no backend, nao so no React;
- primeiro admin deve ser promovido por script local controlado.

### `BK-MF2-03` - CRUD de catalogo e taxonomias

Smoke:

- `GET /api/catalog` devolve apenas conteudos `published`;
- admin/moderator cria conteudo em `POST /api/catalog`;
- admin/moderator muda estado em `PATCH /api/catalog/:id/status`;
- taxonomias podem ser criadas e reutilizadas;
- revisoes podem ser listadas e revertidas.

Negativos:

- criar catalogo sem cookie => `401`;
- role `user` tenta criar/editar catalogo => `403`;
- estado fora de `draft`, `published`, `archived` => `400`;
- `taxonomyIds` inexistentes => `400`;
- conteudo `draft` nao aparece no catalogo publico.

Bloqueios:

- depende de `BK-MF2-02`;
- reutilizar `requireRole(["admin", "moderator"])`;
- nao criar pesquisa full-text neste BK;
- nao fazer upload real de video;
- preservar rotas de revisoes para o `BK-MF2-04`.

### `BK-MF2-04` - Pagina de detalhe de conteudo

Smoke:

- `GET /api/catalog/:idOrSlug` aceita ObjectId ou slug;
- conteudo publicado devolve `200 { content }`;
- `/catalogo/:idOrSlug` mostra detalhe;
- detalhe tem `data-testid="content-detail"`;
- link de reproducao aponta para `/ver/:contentId`.

Negativos:

- slug inexistente => `404`;
- conteudo `draft` => `404`;
- conteudo `archived` => `404`;
- pagina trata loading/error sem quebrar a app;
- rotas fixas de catalogo/admin/revisoes continuam acessiveis.

Bloqueios:

- depende de `BK-MF2-03`;
- nao criar player neste BK;
- nao guardar progresso;
- rota `/:idOrSlug` nao pode engolir `/admin`, `/taxonomies` ou rotas de revisoes.

### `BK-MF2-05` - Reproducao e continuar a ver

Smoke:

- `GET /api/playback/:contentId` exige login e devolve playback;
- `PUT /api/playback/:contentId/progress` grava progresso;
- `GET /api/playback/me/continue-watching` lista progresso do proprio utilizador;
- `/ver/:contentId` mostra `<video>` com `data-testid="faithflix-player"`;
- `/catalogo` mostra "Continuar a ver" depois de existir progresso.

Negativos:

- sem sessao => `401`;
- conteudo nao publicado => `404`;
- tempo negativo ou acima da duracao => `400`;
- utilizador B nao ve progresso do utilizador A;
- rota `/me/continue-watching` nao e capturada por `/:contentId`.

Bloqueios:

- depende de `BK-MF2-04`;
- progresso pertence a `userId + contentId`;
- frontend nunca envia `userId`;
- DRM, CDN, transcodificacao e modo offline ficam fora.

### `BK-MF2-06` - Legendas/audio, parental e qualidade

Smoke:

- catalogo aceita `tracks.subtitles`, `tracks.audio` e `qualityOptions`;
- `PATCH /api/users/me/parental` valida limite parental;
- `GET/PUT /api/playback/preferences` exige login;
- player mostra selects de legenda, audio e qualidade;
- legenda selecionada altera `TextTrack.mode`.

Negativos:

- conteudo acima do limite parental => `403`;
- limite parental fora de `0..18` => `400`;
- qualidade inexistente nao gera URL;
- audio inexistente nao gera URL;
- preferencias sem sessao => `401`.

Bloqueios:

- depende de `BK-MF2-05`;
- parental tem de ser validado no backend;
- nao construir URL de media a partir de texto livre;
- parental por PIN e perfis infantis ficam fora.

### `BK-MF2-07` - Favoritos/watchlist/historico

Smoke:

- `PUT /api/me/favorites/:contentId` adiciona favorito;
- `PUT /api/me/watchlist/:contentId` adiciona a watchlist;
- `GET /api/me/history` le `playback_progress`;
- detalhe permite adicionar/remover favoritos e watchlist;
- `/biblioteca` tem `data-testid="my-library"`.

Negativos:

- sem sessao => `401`;
- dois `PUT` repetidos nao duplicam entrada;
- utilizador B nao ve favoritos/watchlist do utilizador A;
- conteudo inexistente ou nao publicado nao e guardado;
- frontend usa `apiClient.del`, nao metodo inexistente.

Bloqueios:

- depende de `BK-MF2-05`;
- listas pertencem a `req.user.id`;
- historico reutiliza `playback_progress`;
- ratings e recomendacoes ficam fora.

### `BK-MF2-08` - Teste E2E do fluxo principal

Smoke:

- `npm run e2e:mf2` executa seed antes do teste;
- teste faz login por `/login`;
- fluxo passa por `/catalogo/piloto-faithflix`;
- fluxo passa por `/ver/:contentId`;
- fluxo passa por `/biblioteca`;
- relatorio Playwright fica em `test-results/mf2-html-report`.

Negativos:

- seed nao apaga colecoes inteiras;
- teste falha se faltar video de teste;
- teste falha se faltar `data-testid="content-detail"`;
- teste falha se faltar `data-testid="faithflix-player"`;
- falhas guardam trace, screenshot ou video.

Bloqueios:

- depende de `BK-MF2-06` e `BK-MF2-07`;
- backend, frontend e MongoDB precisam de arrancar localmente;
- `frontend/public/media/piloto.mp4` tem de existir;
- CI remoto e cross-browser completo ficam fora.

---

## 10) Evidencia obrigatoria

Cada BK deve preencher:

- `pr`;
- `proof`;
- `neg`;
- `files`;
- `commands`;
- `screenshots`, quando houver UI;
- `notes`.

Para prioridades:

- `P0`: smoke + validacao tecnica + minimo `3` negativos;
- `P1`: smoke + validacao tecnica + minimo `2` negativos;
- `P2`: teste focal e minimo `1` negativo, se surgir algum ajuste P2.

Comandos base esperados:

```bash
npm --prefix backend test
npm --prefix frontend run build
npm run smoke
bash scripts/validate-planificacao.sh
```

No `BK-MF2-08`:

```bash
npm run e2e:mf2
```

Evidence nunca pode conter:

- passwords reais;
- tokens;
- cookies reais;
- URIs privadas;
- dados pessoais nao sanitizados;
- IDs de sessao reais;
- paths internos sensiveis;
- screenshots com informacao sensivel;
- outputs completos de base de dados com dados pessoais.

---

## 11) Decisoes tecnicas confirmadas para MF2

- `MF2` cobre o core streaming MVP com `RF01..RF18`.
- `BK-MF2-08` cobre `RNF07` e `RNF08`.
- Sessao autenticada usa cookie `HttpOnly`, nao token em `localStorage`.
- O backend resolve identidade por sessao e preenche `req.user`.
- `RF16`, `RF17` e `RF18` sao dados do utilizador autenticado e exigem ownership no backend.
- Catalogo publico mostra apenas `published`.
- Conteudos `draft` e `archived` nao podem aparecer no detalhe publico nem no player.
- `playback_progress` e a fonte unica para progresso, continuar a ver e historico.
- Player e streaming sao simplificados com ficheiro local/URL de media.
- CDN, DRM e URLs temporarios reais ficam fora desta MF.
- Snippets em ficheiros partilhados devem ser aditivos e preservar entregas anteriores.
- E2E usa Playwright, seed restrito e seletores estaveis.

---

## 12) Fecho da MF2

A `MF2` so esta pronta quando:

- todos os BKs `BK-MF2-01..08` tem criterios de aceite cumpridos;
- smoke, negativos e evidence estao completos;
- nao ha drift entre matriz, backlog, guias e sprints;
- validacao documental passa;
- autenticacao, perfil e roles funcionam sem expor dados internos;
- catalogo, detalhe e player respeitam estados de publicacao;
- progresso, favoritos, watchlist e historico preservam ownership;
- parental, preferencias de media e qualidade sao validados no backend;
- E2E principal passa com medicoes de `RNF07` e `RNF08`;
- `BK-MF3-01`, `BK-MF3-03` e `BK-MF3-05` ficam desbloqueados para a proxima macrofase.

Comando obrigatorio:

```bash
bash scripts/validate-planificacao.sh
```

---

## 13) Se bloquearem mais de 45 minutos

Mandar-me:

1. 2-3 frases sobre o problema.
2. BK e path do guia.
3. Heading/seccao que causou duvida.
4. Erro/log relevante sem dados sensiveis.
5. O que ja tentaram.
6. Se o bloqueio e tecnico, documental, de dependencia, privacidade ou seguranca.
