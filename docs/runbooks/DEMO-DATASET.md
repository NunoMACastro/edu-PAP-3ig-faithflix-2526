# Runbook do dataset de demonstração

- `last_updated`: `2026-07-11`
- `scope`: `real_dev` / MongoDB Atlas ou replica set loopback descartável
- `production_status`: `PROIBIDO`

`npm run seed:demo` elimina integralmente a base indicada antes de criar os
dados. O comando é seguro apenas quando o alvo termina em `_demo` e foi criado
exclusivamente para este fim. Não executar com API ou worker ativos.

## Preparação do alvo transacional

MongoDB standalone não é suportado. Antes de verificar o marcador de
propriedade ou executar `dropDatabase()`, o seed liga o cliente destrutivo e
exige sessões mais uma topologia de replica set ou `mongos`. Uma falha neste
probe termina o processo sem qualquer escrita.

### Atlas

1. Criar uma base dedicada, por exemplo `faithflix_demo`.
2. Criar um utilizador técnico exclusivo, limitado a essa base, com `readWrite`
   e a permissão mínima adicional necessária para `dropDatabase`.
3. Autorizar apenas os IPs necessários no Atlas.
4. Não reutilizar o utilizador da aplicação normal nem uma base com dados reais.

O guard recusa bases cujo nome contenha `prod`, `production`, `staging`,
`shared`, `live` ou `main`. A URI tem de usar `mongodb+srv://`, sem nome de base
no pathname; query parameters normais do Atlas são permitidos.

### Replica set local

Em alternativa, pode ser usado `mongodb://` apenas quando todos os hosts são
`localhost`, `127.0.0.1` ou `[::1]`, existe exatamente um parâmetro
`replicaSet=<ASCII>` e não há outras opções, pathname de base ou fragmento. Por
exemplo:

```bash
DEMO_MONGODB_URI='mongodb://127.0.0.1:27017/?replicaSet=faithflix-demo'
DEMO_MONGODB_DB_NAME='faithflix_demo'
DEMO_RESET_CONFIRM='local-replica-set:faithflix-demo@127.0.0.1:27017/faithflix_demo'
```

Credenciais são opcionais no alvo local. Quando presentes, utilizador e
password têm de estar ambos preenchidos e os caracteres reservados têm de ser
percent-encoded. URIs standalone, destinos `mongodb://` remotos e userinfo
ambígua são recusados antes da ligação.

## Variáveis obrigatórias

Definir os valores no ambiente ou no `.env` local não versionado. Nunca copiar
segredos para documentação, logs ou evidence.

```bash
NODE_ENV=development
ALLOW_DEMO_SEED=true
ALLOW_DEMO_RESET=true
DEMO_MONGODB_URI='mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority'
DEMO_MONGODB_DB_NAME='faithflix_demo'
DEMO_RESET_CONFIRM='<cluster>.mongodb.net/faithflix_demo'
DEMO_ADMIN_PASSWORD='<password-admin-com-12-ou-mais-carateres>'
DEMO_USER_PASSWORD='<password-user-diferente-com-12-ou-mais-carateres>'
DEMO_DATA_SEED='faithflix-demo-v2'
```

`DEMO_REFERENCE_DATE` é opcional. Sem ela, o seed usa as 12:00 UTC do dia da
execução. Uma data explícita torna uma repetição totalmente determinística:

```bash
DEMO_REFERENCE_DATE='2026-07-10T12:00:00.000Z'
```

## Adoção única de uma base antiga

Uma base não vazia sem o marcador `__faithflix_demo_meta` é recusada. Se foi
confirmado manualmente que essa base antiga é descartável, executar uma única
vez com:

```bash
ALLOW_DEMO_DATABASE_ADOPTION=true npm run seed:demo
```

Remover imediatamente a flag depois do sucesso. Bases vazias e bases já
marcadas não precisam de adoção.

## Reset, seed e verificação

Parar primeiro API e worker. Depois, a partir da raiz:

```bash
npm run seed:demo
npm run seed:demo:verify
npm run check:media
npm run test:e2e:demo
```

O primeiro comando valida o alvo, confirma a topologia transacional, valida a
propriedade, executa `dropDatabase()`, recria índices, insere o dataset, gera
embeddings e verifica o manifesto. Se alguma etapa falhar depois do drop,
tenta eliminar novamente a base e termina com erro.

`seed:demo:verify` é read-only. Não exige `ALLOW_DEMO_RESET` nem passwords, mas
exige `DEMO_MONGODB_URI` e `DEMO_MONGODB_DB_NAME`.

## Arranque contra a demo

Depois da verificação, configurar a aplicação com o mesmo alvo dedicado:

```bash
export MONGODB_URI="$DEMO_MONGODB_URI"
export MONGODB_DB_NAME="$DEMO_MONGODB_DB_NAME"
npm --prefix real_dev/backend run dev
npm --prefix real_dev/frontend run dev -- --host 127.0.0.1 --port 5181
```

Estas linhas ilustram o mapeamento; não imprimir os valores reais no terminal
partilhado. Não voltar a executar o seed enquanto estes processos estiverem
ativos.

## Shutdown

Terminar o frontend, a API e qualquer worker com `Ctrl+C` nos respetivos
terminais. Confirmar que nenhum destes processos continua ativo antes de um
novo `npm run seed:demo`; o seed nunca é executado automaticamente no arranque.

## Personas

| Cenário | Email | Password de ambiente |
|---|---|---|
| Admin principal | `admin@faithflix.demo` | `DEMO_ADMIN_PASSWORD` |
| Admin secundário | `admin-secundario@faithflix.demo` | `DEMO_ADMIN_PASSWORD` |
| Moderação | `moderador@faithflix.demo` | `DEMO_USER_PASSWORD` |
| Plano Pro | `pro@faithflix.demo` | `DEMO_USER_PASSWORD` |
| Owner Família | `familia-owner@faithflix.demo` | `DEMO_USER_PASSWORD` |
| Membro parental 12 | `familia-membro@faithflix.demo` | `DEMO_USER_PASSWORD` |
| Convite familiar | `familia-convidado@faithflix.demo` | `DEMO_USER_PASSWORD` |
| Trial | `trial@faithflix.demo` | `DEMO_USER_PASSWORD` |
| Associação | `associacao@faithflix.demo` | `DEMO_USER_PASSWORD` |
| Cold-start | `cold-start@faithflix.demo` | `DEMO_USER_PASSWORD` |

## Roteiro curto

1. Anónimo: home, catálogo, paginação, pesquisa, detalhe, séries e associações.
2. Pro: recomendações, favoritos paginados, histórico e notificações.
3. Família: owner, convite, membro, acesso efetivo e controlo de entitlement.
4. Membro parental: confirmar exclusão de conteúdos 16/18.
5. Cold-start e associação: comparar personalização ativa sem sinais com opt-out.
6. Admin: utilizadores paginados, catálogo, passagens, métricas, candidaturas,
   integrações e 12 meses da pool.

### Série e episódios de referência

- `Família em Oração`: temporada 1, episódio 1.
- `Juventude com Propósito`: temporada 1, episódios 1 e 2.
- `Entre Gerações`: temporada 1, episódio 1.
- `Salmos em Casa`: série publicada sem episódios, usada para validar “Em breve”.

Os episódios não aparecem isoladamente no catálogo ou pesquisa. Abrir um slug
legado de episódio redireciona para a série; “Continuar a ver” e o player mantêm
o progresso no episódio e mostram `Tn En`.

## Migração de bases locais anteriores

Antes de arrancar a API sobre uma base não descartável, executar o diagnóstico
read-only a partir de `backend/`:

```bash
npm run migrate:series-episodes
```

O modo de escrita exige um mapping JSON revisto manualmente e nunca relaciona
conteúdos por título ou taxonomia:

```bash
npm run migrate:series-episodes -- --apply --mapping ./mapping-series.json
```

O ficheiro contém listas `episodes` (`episodeId`, `seriesId`, `seasonNumber`,
`episodeNumber`) e `seriesProgress` (`seriesId`, `episodeId`). O exemplo
`backend/scripts/series-episodes.mapping.example.json` usa apenas os IDs
determinísticos da demo; não deve ser aplicado a outra base sem revisão.

O arranque é bloqueado enquanto existir um episódio publicado sem série/posição
válida ou progresso diretamente associado a uma série.

## Limites da prova

O vídeo é uma fixture sintética MP4 progressive local, copiada pelo seed para
storage privado como asset 720p. Prova apenas carregamento protegido, Range e
controlo de entitlement; HLS/DASH permanecem fixtures sintéticas de testes dos
adapters. Não prova 4K real, transcoding, bitrate, CDN, ABR, DRM, latência de
produção ou carga concorrente. Checkout, renovação e pagamentos também
continuam explicitamente simulados.
