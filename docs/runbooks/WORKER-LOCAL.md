# Runbook do worker local

- `last_updated`: `2026-07-10`
- `process`: `real_dev/backend/src/worker.js`
- `payment_provider`: `faithflix-simulated`

## Finalidade

O worker é separado da API e processa jobs com leases MongoDB:

- trial vencido;
- renovação simulada;
- cancelamento/expiração;
- fecho da pool do mês UTC anterior;
- catch-up limitado de meses fechados.

Não contacta gateway e não comprova pagamentos reais.

## Pré-condições

- Topologia MongoDB com sessões/transações.
- Mesma versão de código e contrato de dados da API.
- Índices preparados pelo próprio worker antes do primeiro ciclo.
- Relógio do host sincronizado; leases dependem de tempo coerente.

## Arranque

```bash
npm --prefix real_dev/backend run worker
```

`WORKER_POLL_MS` aceita apenas inteiros entre 10 segundos e 1 hora. O default é
60 segundos.

## Invariantes

- Uma chave de job representa uma subscrição/ciclo ou um mês.
- Apenas o owner do lease ativo pode concluir/falhar o job.
- Um lease expirado pode ser reclamado por outro worker.
- Pagamentos elegíveis para a pool são v2, EUR, aprovados, não estimados e
  pertencem ao mês fechado.
- Um mês sem associação elegível termina como
  `deferred_no_eligible_charities`; não entra em retry infinito.
- Cada passagem limita o catch-up; o restante fica para ciclos seguintes.

## Inspeção read-only

Para diagnosticar o scheduler, usa uma conta/DB explicitamente autorizada e uma
query apenas de leitura. Não copies a URI para evidence e não executes
`update*`, `delete*`, `drop` ou `findAndModify` durante a inspeção:

```bash
mongosh --nodb --quiet --eval '
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME;
  if (!uri || !dbName) throw new Error("MONGODB_URI e MONGODB_DB_NAME são obrigatórias.");
  // `connect(uri)` preserva replicaSet e restantes opções; a DB é escolhida sem concatenar a URI.
  const connectionDb = connect(uri);
  const inspectedDb = connectionDb.getSiblingDB(dbName);
  inspectedDb.scheduled_jobs
    .find({}, { key: 1, type: 1, status: 1, nextRunAt: 1, attempts: 1, leaseExpiresAt: 1, lastErrorCode: 1 })
    .sort({ nextRunAt: 1, key: 1 })
    .limit(100)
    .toArray()
'
```

`--nodb` impede que a URI expandida entre nos argumentos do processo; a ligação
lê as duas variáveis apenas já dentro do processo. `getSiblingDB(dbName)` escolhe
a base sem transformar, por exemplo, `/?replicaSet=rs0` em uma querystring
inválida. Confirma que `running` tem lease futuro e que um job `failed` tem
`lastErrorCode` seguro e `nextRunAt`. Não alteres manualmente o status para
obter um ciclo verde; corrige a causa ou aguarda o retry/lease normal.

## Shutdown e falha

`SIGTERM`/`SIGINT` registam somente o nome do sinal, cancelam o polling e
aguardam o ciclo em curso. Sinais repetidos partilham o mesmo encerramento e não
fecham MongoDB duas vezes.

Uma falha de ciclo é registada com código seguro e o worker continua no próximo
poll. Uma falha de preparação é terminal e define exit code não zero.

## Prova e limites

Os testes unitários cobrem leases, concorrência por doubles, ciclo ativo durante
sinal e fecho único. Nesta baseline não se arrancou o worker contra MongoDB real
nem se demonstrou operação contínua, métricas, alertas ou takeover entre hosts.
