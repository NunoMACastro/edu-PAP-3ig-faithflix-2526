# FaithFlix Backend

Backend Node.js/Express modular da referência docente FaithFlix. Esta baseline é
local: não constitui configuração de deployment ou operação de produção.

## Comandos principais

- `npm install`
- `npm run dev`
- `npm start`
- `npm run worker`
- `npm test`
- `npm run smoke`

## Health, logs e ordem da pipeline

As rotas de health são públicas e montadas antes do parser JSON, da sessão e da
proteção CSRF. Todas desativam cache com `Cache-Control: no-store` e recebem
`x-request-id` do middleware de logging:

- `GET /health/live`: liveness do processo, sempre `200` enquanto a API
  responde; não consulta MongoDB;
- `GET /health/ready`: readiness com probe transacional MongoDB e deadline total
  de `500 ms`; devolve `200` apenas quando a topologia suporta sessões e
  transações, ou `503` quando está indisponível/incompatível;
- `GET /health`: alias compatível e exato de readiness, não de liveness.

Uma resposta `503` contém apenas estado operacional sanitizado. URI, exceção e
detalhes internos da base nunca entram no payload. Os logs são JSON por linha e
cookies, tokens, passwords e outros segredos são redigidos.

## Configuração transacional

A API e o worker dependem de transações multi-documento. Ambos executam um
probe de topologia antes de aceitar trabalho e recusam MongoDB standalone. Para
a demonstração deve ser usado MongoDB Atlas ou um replica set local explícito;
o exemplo de ambiente aponta deliberadamente para Atlas.

## Configuração de produção

Com `NODE_ENV=production`, o processo falha antes de arrancar se não receber uma
configuração explícita e válida. São obrigatórios:

- `SERVICE_NAME`;
- `MONGODB_URI` e `MONGODB_DB_NAME`;
- `RATE_LIMIT_PEPPER` com pelo menos 32 caracteres;
- `FORCE_HTTPS=true`;
- `TRUST_PROXY_HOPS` entre 1 e 10;
- `FRONTEND_ORIGIN` com uma ou mais origins HTTPS exatas.

`PORT` é opcional e tem de ser um inteiro entre 1 e 65535 quando definido.
Mensagens de configuração identificam nomes de variáveis inválidas, sem
reproduzir os respetivos valores. Em desenvolvimento, as origins locais
`localhost:5181` e `127.0.0.1:5181` continuam disponíveis por defeito.

## Graceful shutdown

A API trata `SIGTERM` e `SIGINT` de forma idempotente: deixa de aceitar novos
pedidos, fecha ligações idle, aguarda até 10 segundos pelos pedidos ativos e,
se necessário, força o fecho das ligações antes de fechar MongoDB uma única
vez. O worker tem um ciclo de vida separado: o sinal cancela a próxima espera,
deixa o ciclo financeiro já ativo terminar e só depois fecha MongoDB.

A API e o worker não têm fallback não transacional. Renovação e pagamento
continuam explicitamente simulados.

## Media local privada

Os MP4 progressive são guardados fora de `frontend/public`, por defeito em
`real_dev/backend/.local-media`. `MEDIA_STORAGE_ROOT` pode escolher outra raiz,
mas o backend recusa qualquer descendente de `frontend/public`;
`MEDIA_UPLOAD_MAX_BYTES` nunca pode exceder 512 MiB. O diretório e os ficheiros
são criados com permissões `0700` e `0600`.

O seed demo reutiliza exclusivamente a fixture sintética auditada em
`tests/fixtures/media/synthetic-progressive.mp4`, cria um `media_asset` privado
por conteúdo publicado reproduzível e guarda no catálogo apenas URLs
`/api/media/:assetId`. Séries agregadoras e conteúdos não publicados permanecem
`pending`. Artwork continua público; o gerador de assets nunca copia playback
ou faixas para o frontend.

## Backup e verificação de restore

Os CLIs operacionais usam configuração dedicada e nunca fazem fallback para
`MONGODB_URI`/`MONGODB_DB_NAME` da aplicação:

```bash
DATABASE_TOOLS_MONGODB_URI='<URI_DEDICADA>' \
DATABASE_TOOLS_MONGODB_DB_NAME='<BASE_EXPLICITA>' \
ALLOW_DATABASE_BACKUP=true \
npm run backup:db -- --archive /caminho/absoluto/faithflix.archive.gz

DATABASE_TOOLS_MONGODB_URI='<URI_DEDICADA>' \
DATABASE_TOOLS_MONGODB_DB_NAME='<BASE_EXPLICITA>' \
ALLOW_DATABASE_RESTORE_VERIFY=true \
npm run restore:verify -- --archive /caminho/absoluto/faithflix.archive.gz
```

O backup recusa overwrite e produz archive gzip mais manifest `0600` com
SHA-256 e inventário de coleções. A verificação valida archive/manifest,
restaura exclusivamente para uma base temporária gerada internamente, compara o
inventário e elimina apenas esse target depois de confirmar o marcador de
propriedade. Não existe argumento para escolher uma base de restore arbitrária.

Os dois workflows exigem `mongodump` e `mongorestore`. Em 2026-07-10, essas
ferramentas não estavam disponíveis no `PATH` deste ambiente: os guards e os
fluxos com doubles passaram, mas nenhum backup/restore real foi demonstrado.

## Seeds e operações destrutivas

Os scripts `seed:e2e*`, `seed:demo` e a migração financeira têm opt-ins e
contratos próprios. Não os executar contra uma base normal, partilhada ou de
produção. Os runbooks canónicos estão em `docs/runbooks/`.

`seed:demo` é o único entrypoint suportado para a demo completa. Exige uma base
dedicada terminada em `_demo`: MongoDB Atlas SRV ou um replica set local com
`replicaSet=<ASCII>` explícito e todos os hosts em loopback. MongoDB standalone,
destinos remotos não-Atlas, pathnames com base e opções locais adicionais são
recusados. Userinfo, quando presente, tem de conter utilizador e password sem
separadores reservados por codificar. O cliente destrutivo confirma sessões e
topologia transacional antes de consultar propriedade ou executar
`dropDatabase()`; o standalone não chega a qualquer escrita. O comando elimina
a base integralmente antes da primeira inserção e executa o verificador no fim.
Os módulos de domínio não são comandos autónomos.
Consulta `docs/runbooks/DEMO-DATASET.md` antes de autorizar o reset;
`seed:demo:verify` é read-only e pode ser repetido em segurança.
