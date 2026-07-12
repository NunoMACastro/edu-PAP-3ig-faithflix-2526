# Arquivo de evidence

- `document_status`: `CURRENT`
- `snapshot_date`: `-`
- `implementation_lane`: `REFERENCE`
- `current_authority`: `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-END-TO-END-real_dev.md`
- `proof_scope`: índice atual de artefactos históricos substituídos; não contém resultados executados nem evidence válida para gates

Esta pasta preserva templates e snapshots que não são evidence ativa.

- `templates-mf6-legacy/`: cópias duplicadas que estavam em
  `docs/evidence/MF1/MF6/` com campos `PREENCHER_COM_*`.
- Data de arquivo: `2026-07-10`.
- Motivo: evitar que placeholders sejam confundidos com resultados executados,
  sem apagar a história documental.

Os ficheiros arquivados não entram em gates, validadores de evidence atual ou
contagens de `PASS`. As evidence ativas de MF6 permanecem em
`docs/evidence/MF6/`.
