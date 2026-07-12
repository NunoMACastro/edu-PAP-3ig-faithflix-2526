# Runbook de backup e verificação de restore local

- `last_updated`: `2026-07-10`
- `automation_status`: não agendado
- `restore_status_current_environment`: `BLOQUEADO_AMBIENTE`

Os scripts são fail-closed e não usam `MONGODB_URI`/`MONGODB_DB_NAME` da
aplicação como fallback. Esta separação reduz o risco de atingir a base errada.

## Ferramentas

Confirmar sem ligar à base:

```bash
command -v mongodump
command -v mongorestore
```

Em 2026-07-10, ambas estavam ausentes neste ambiente. Por isso, apenas guardas
e invocações com doubles foram validados; nenhum backup/restore foi executado.

## Variáveis dedicadas

Definir no processo, sem as imprimir:

- `DATABASE_TOOLS_MONGODB_URI`;
- `DATABASE_TOOLS_MONGODB_DB_NAME`;
- `ALLOW_DATABASE_BACKUP=true` apenas durante o backup autorizado;
- `ALLOW_DATABASE_RESTORE_VERIFY=true` apenas durante a verificação autorizada.

O nome da DB é obrigatório e não pode ser `admin`, `config` ou `local`.

## Criar archive

Escolher um caminho absoluto novo. O script não substitui ficheiros existentes.

```bash
npm --prefix real_dev/backend run backup:db -- --archive /caminho/absoluto/faithflix.archive.gz
```

O script:

1. valida ferramenta, opt-in, DB e caminho;
2. cria configuração temporária com modo `0600` para não colocar a URI nos args;
3. chama `mongodump` com `shell:false`, DB explícita e environment allowlisted,
   sem herdar URI, tokens, passwords ou `NODE_OPTIONS`;
4. calcula checksum do archive;
5. remove a configuração temporária em `finally`.

Nunca copiar a URI, config temporária ou output sensível para evidence.

## Verificar restore

```bash
npm --prefix real_dev/backend run restore:verify -- --archive /caminho/absoluto/faithflix.archive.gz
```

O target não é aceite por CLI. É gerado internamente no formato
`<origem>_restore_verify_<hex>`, confirmado como inexistente e diferente da
origem. O script estabelece a ligação, restaura apenas para esse target,
verifica checksum e inventário de coleções e elimina somente a DB temporária em
`finally`.

Este comando é uma verificação destrutiva apenas para a DB temporária gerada.
Não o executar sem autorização, tools instaladas e MongoDB explicitamente
isolado.

## Resultado e retenção

Uma execução válida deve registar apenas:

- archive/caminho sem segredo;
- checksum;
- DB source por nome, se permitido pelo runbook local;
- número de coleções verificadas;
- target temporário eliminado;
- exit code.

Frequência diária, retenção externa, encriptação, alertas e restore de produção
continuam fora da baseline local e não podem ser marcados como validados.
