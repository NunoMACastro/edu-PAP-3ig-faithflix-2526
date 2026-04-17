# GUIAO-DOCENTE-SEMANAL

## Header

- `doc_id`: `GUIAO-DOCENTE-SEMANAL`
- `path`: `docs/planificacao/sprints/GUIAO-DOCENTE-SEMANAL.md`
- `area`: `project`
- `owner`: `Nuno (orientacao)`
- `status`: `ativo`
- `last_updated`: `2026-04-17`

## Objetivo

Dar ao orientador um guiao semanal simples e executavel para controlo de sprint, com checkpoints claros e remediacao objetiva para alunos do 12.o ano.

## Checkpoints obrigatorios por dia

### Segunda - Arranque controlado

1. Confirmar sprint goal e BKs da semana.
2. Validar dependencias criticas antes de implementar.
3. Confirmar owner unico por BK e janelas de handoff.
4. Marcar risco inicial (`baixo|medio|alto`) por BK.

### Terca - Primeiro controlo tecnico

1. Rever progresso real vs plano (minimo 30% do scope principal).
2. Confirmar que cada BK ativo segue guia e nao perdeu rastreabilidade.
3. Validar que negativos ja foram planeados por prioridade.

### Quarta - Ponto de nao-retorno

1. Verificar blockers e decidir corte de scope (primeiro `P2`, depois `P1`).
2. Reforcar BKs P0 com pairing e apoio tecnico imediato.
3. Confirmar evidencias parciais (`proof`) para evitar fecho vazio.
4. Reconfirmar alinhamento sprint/backlog apos qualquer corte intermédio.

### Quinta - Pre-gate interno

1. Simular checklist de gate da janela da sprint.
2. Confirmar backlog <-> matriz <-> guias sem drift.
3. Validar score preliminar da sprint no scorecard oficial.

### Sexta - Fecho formal

1. Executar demo objetiva por BK concluido.
2. Atualizar estado BK (`DONE/BLOCKED`) com justificacao.
3. Fechar score da sprint e registar acoes corretivas.
4. Definir foco da sprint seguinte com base nos riscos abertos.

## Remediacao orientada a risco

| Sinal de alerta | Limite | Acao imediata | Prazo |
| --- | --- | --- | --- |
| Drift documental | Qualquer divergencia backlog/matriz/guias/sprints | Corrigir no mesmo dia e revalidar script | `24h` |
| BK P0 atrasado | Sem fluxo principal ate quarta | Cortar P2 da sprint e reforcar pairing | `48h` |
| Evidence incompleta | Falta `pr`, `proof` ou `neg` na quinta | Bloquear fecho de BK ate completar trio | `24h` |
| Negativos insuficientes | Abaixo da politica da prioridade | Executar negativos em bloco dedicado | `24h` |
| Sprint score baixo | `< 85` | Plano de remediacao obrigatorio para sprint seguinte | `inicio da sprint seguinte` |

## Checklist de remediacao rapida

- [ ] Blockers com owner e prazo definidos.
- [ ] BKs replaneados sem ultrapassar 11 pontos na sprint.
- [ ] Guias atualizados com handoff claro para proximo BK.
- [ ] Scorecard e checklist de gate alinhados.

## Evidencia minima do orientador

- Registo de checkpoint diario (curto, 3-5 linhas).
- Decisoes de corte/repriorizacao com data.
- Estado das acoes corretivas abertas/fechadas.

## Changelog

- `2026-04-14`: criado guiao docente semanal com checkpoints e remediacao objetiva.
- `2026-04-17`: alinhado ao rebaseline de escopo MVP sem referencias residuais a itens fora de escopo.
