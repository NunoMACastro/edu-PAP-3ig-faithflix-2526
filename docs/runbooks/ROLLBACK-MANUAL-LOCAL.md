# Runbook de rollback manual local

- `last_updated`: `2026-07-10`
- `remote_deployment`: inexistente
- `remote_rollback`: `ACEITE_COM_RISCO`

Este procedimento descreve decisão e contenção local. Não existe target cloud,
pipeline de deployment ou repositório autoritativo de `real_dev` neste checkout.

## Quando parar

Interromper a promoção se existir qualquer um destes sinais:

- readiness 503 persistente;
- regressão P0/P1;
- migração incompatível ou estado parcial;
- credencial possivelmente exposta;
- restore verification não demonstrado;
- versão de API/worker diferente.

## Contenção

1. Parar novas promoções e jobs.
2. Enviar `SIGTERM` à API e ao worker e aguardar shutdown.
3. Preservar logs redigidos, request ids, build version e exit codes.
4. Não executar seed, `deleteMany`, migração inversa ou restore improvisado.
5. Identificar a última versão local conhecida como boa e o contrato de dados
   esperado por essa versão.

## Rollback de código

Repor um artefacto previamente validado a partir do futuro repositório privado
autoritativo. Não copiar `backend/`/`frontend/` dos alunos para `real_dev` e não
usar comandos destrutivos de Git sobre o dirty worktree.

Antes de aceitar tráfego:

1. instalar dependências a partir do lockfile dessa versão;
2. executar backend/frontend/docs/media checks aplicáveis;
3. arrancar API e confirmar liveness/readiness;
4. arrancar worker apenas com a mesma versão e schema;
5. manter `NO_GO_PRODUCAO` enquanto blockers externos persistirem.

## Dados

Não existe rollback automático de dados. A migração financeira permanece
dry-run por defeito e qualquer `--apply` exige autorização separada.

Se uma recuperação for necessária:

- preservar a base original;
- verificar primeiro o archive numa DB temporária;
- comparar schema/contagens e documentar perda possível;
- obter autorização explícita antes de qualquer restore sobre ambiente real.

As MongoDB Database Tools não estão presentes no ambiente atual, logo esta
cadeia permanece `BLOQUEADO_AMBIENTE` e não pode suportar um `GO` de produção.

## Fecho do incidente

Registar causa raiz, versão, dados afetados, comandos/exit codes, decisão de
retoma e riscos residuais. CI, deployment, backup diário e rollback remoto só
podem sair de `ACEITE_COM_RISCO` quando existir infraestrutura real e prova
repetível.
