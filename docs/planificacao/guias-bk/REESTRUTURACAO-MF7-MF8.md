# Reestruturacao MF7/MF8 - FaithFlix

## Resumo da mudanca

- MF7 passa a ser Refinamento de UI e navegacao segura.
- MF8 passa a concentrar consolidacao, evidencia, defesa, buffer e fecho.
- A cadeia final passa de 55 para 60 BKs.
- A fase antiga de evidencias/defesa foi movida semanticamente para o inicio da nova MF8.
- A fase antiga de buffer/fecho continua na MF8, depois de evidencia e defesa.

## Tabela old -> new

| Origem | Destino | Titulo |
| --- | --- | --- |
| novo | BK-MF7-01 | Inventario UI vs mockup e plano de refinamento |
| novo | BK-MF7-02 | Navegacao segura por sessao e perfil |
| novo | BK-MF7-03 | Layout, tokens e header alinhados ao mockup |
| novo | BK-MF7-04 | Refinamento das paginas principais e estados de UX |
| novo | BK-MF7-05 | Gate visual, responsividade e navegacao segura |
| antigo BK-MF7-01 | BK-MF8-01 | Matriz de cobertura RF -> evidencia |
| antigo BK-MF7-02 | BK-MF8-02 | Matriz de cobertura RNF -> validacao |
| antigo BK-MF7-03 | BK-MF8-03 | Roteiro de demo final |
| antigo BK-MF7-04 | BK-MF8-04 | Ensaio tecnico da defesa |
| antigo BK-MF7-05 | BK-MF8-05 | Avaliacao final e feedback orientador |
| antigo BK-MF8-01 | BK-MF8-06 | Lista de riscos residuais |
| antigo BK-MF8-02 | BK-MF8-07 | Correcao de bugs bloqueantes |
| antigo BK-MF8-03 | BK-MF8-08 | Scope freeze final |
| antigo BK-MF8-04 | BK-MF8-09 | Empacotamento final de entrega |
| antigo BK-MF8-05 | BK-MF8-10 | Retro final e licoes aprendidas |

## Ficheiros alterados

- docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md
- docs/planificacao/backlogs/BACKLOG-MVP.md
- docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md
- docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md
- docs/planificacao/backlogs/MF-VIEWS.md
- docs/planificacao/backlogs/ANEXO-BK-SPRINT-OWNER.md
- docs/planificacao/sprints/PLANO-SPRINTS.md
- docs/planificacao/sprints/SCORECARD-SPRINTS.md
- docs/planificacao/guias-bk/MF7/*.md
- docs/planificacao/guias-bk/MF8/*.md
- docs/evidence/MF7/README.md
- docs/evidence/MF8/README.md

## Decisoes canonicas
- MF7 é refinamento de UI e navegação segura.
- MF8 concentra evidências finais e defesa.
- discrepâncias de links admin e perfil bloqueiam antes de discrepâncias estéticas.
- Mantem-se 12 sprints.
- Mantem-se limite de 11 pontos por sprint.
- BK-MF5-04 foi antecipado para S08 para abrir capacidade nas sprints finais.
- BK-MF6-03..05 foram antecipados para S10.
- S11 fecha gate tecnico, MF7 e BK-MF8-01.
- S12 concentra BK-MF8-02..10.
- Cadeia obrigatoria: BK-MF7-05 -> BK-MF8-01 -> BK-MF8-02 -> BK-MF8-03 -> BK-MF8-04 -> BK-MF8-05 -> BK-MF8-06 -> BK-MF8-07 -> BK-MF8-08 -> BK-MF8-09 -> BK-MF8-10.

## Riscos

- S11 e S12 ficam no limite de 11 pontos e exigem checkpoint docente rigoroso.
- BK-MF7-02 e critico; se a navegacao segura falhar, a UI nao deve passar a MF8.
- BK-MF8-07 nao pode virar fase de novas features; deve limitar-se a bugs bloqueantes aprovados.

## Validacoes executadas

- `git diff --check`: PASS, sem whitespace errors.
- `bash scripts/validate-planificacao.sh`: PASS, 60 BKs e 60 guias verificados, 0 erros.
- Pesquisa estatica de caminhos privados em `docs/planificacao docs/evidence`: PASS, sem ocorrencias.
- Pesquisa estatica de descricoes antigas de MF7 como fase principal de evidencias: PASS, sem ocorrencias nos termos obrigatorios.
- Pesquisa estatica da nova cadeia: PASS, encontrou `BK-MF7-05`, `BK-MF8-09`, `BK-MF8-10`, `NAVEGACAO-SEGURA` e `GATE-UI` nos documentos de planificacao.

## Pendencias

- Sem pendencias canonicas conhecidas antes das validacoes finais.
