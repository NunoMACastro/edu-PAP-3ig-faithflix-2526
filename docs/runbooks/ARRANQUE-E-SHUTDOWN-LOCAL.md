# Runbook de arranque e shutdown local

- `last_updated`: `2026-07-10`
- `scope`: referência docente `real_dev`
- `production_status`: `NO_GO_PRODUCAO`

Este runbook não autoriza seeds, migrações, E2E funcional ou acesso à base
configurada. Os exemplos são para operação local deliberada.

## Pré-requisitos

- Node.js compatível com `real_dev/backend/package.json`.
- Dependências instaladas em `real_dev/backend` e `real_dev/frontend`.
- MongoDB acessível. Worker e operações críticas exigem replica set ou cluster
  com transações multi-documento.
- Ficheiros `.env` locais fora de SCM e sem valores copiados para logs/evidence.

## Configuração

Para desenvolvimento, partir apenas dos placeholders seguros:

```bash
cp -n real_dev/backend/.env.example real_dev/backend/.env
cp -n real_dev/frontend/.env.example real_dev/frontend/.env
```

`-n` recusa sobrescrever ficheiros existentes. Se já existir um `.env`, rever
apenas os nomes das variáveis em falta; nunca substituir, imprimir ou copiar os
valores atuais para documentação/evidence.

Antes de produção, todos estes valores têm de ser explícitos:

- `SERVICE_NAME`;
- `HOST` explícito (`127.0.0.1`/`::1` atrás de proxy local ou bind wildcard deliberado);
- `MONGODB_URI`;
- `MONGODB_DB_NAME`;
- `RATE_LIMIT_PEPPER` com pelo menos 32 caracteres;
- `FORCE_HTTPS=true`;
- `TRUST_PROXY_HOPS` entre 1 e 10;
- `FRONTEND_ORIGIN` apenas com origins HTTPS válidas.

Não imprimir os valores para os validar. A aplicação falha cedo indicando
somente os nomes ausentes ou inválidos.

## Arranque de desenvolvimento

Abrir processos separados:

```bash
npm --prefix real_dev/backend run dev
npm --prefix real_dev/frontend run dev -- --host 127.0.0.1 --port 5181
```

O worker só deve arrancar quando a topologia transacional estiver confirmada:

```bash
npm --prefix real_dev/backend run worker
```

Não executar em paralelo scripts de renovação/pool. O worker é o único caminho
operacional para esses jobs.

## Health

Depois de a API aceitar tráfego:

```bash
curl --fail-with-body http://127.0.0.1:3101/health/live
curl --fail-with-body http://127.0.0.1:3101/health/ready
curl --fail-with-body http://127.0.0.1:3101/health
```

- `/health/live` confirma apenas que o processo HTTP está vivo.
- `/health/ready` confirma que a dependência MongoDB responde dentro do budget.
- `/health` é alias compatível de readiness.
- Readiness indisponível devolve 503 sem URI, hostname, stack ou mensagem interna.

Liveness não deve depender de cookie/sessão. Em produção, a verificação deve ser
feita pelo endpoint HTTPS configurado.

## Shutdown

Enviar `SIGTERM` no encerramento normal; `SIGINT` é suportado no terminal.

API:

1. deixa de aceitar novas ligações;
2. fecha ligações idle;
3. aguarda pedidos ativos dentro do limite;
4. força apenas ligações HTTP restantes se o limite expirar;
5. fecha MongoDB uma única vez.

Worker:

1. cancela a próxima espera/poll;
2. aguarda o ciclo ativo;
3. remove signal handlers;
4. fecha MongoDB uma única vez.

Não usar `kill -9` como procedimento normal. Um ciclo MongoDB bloqueado continua
um risco operacional e deve ser investigado antes de forçar o processo.

## Verificação local segura

```bash
npm --prefix real_dev/backend test
VITE_API_BASE_URL=https://api.faithflix.test npm --prefix real_dev/frontend run validate
bash scripts/validate-planificacao.sh
```

Os testes usam doubles/in-memory. Não provam sinais em processos reais,
failover MongoDB, deployment ou observabilidade de produção.
