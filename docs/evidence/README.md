# Evidence FaithFlix

- `document_status`: `CURRENT`
- `snapshot_date`: `-`
- `implementation_lane`: `REFERENCE`
- `current_authority`: `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-END-TO-END-real_dev.md`
- `proof_scope`: política transversal de publicação e leitura para as lanes STUDENT e REFERENCE; não contém prova de execução

## Política de autoridade e validade

Este diretório conserva evidence atual e snapshots históricos. Um resultado só
pode ser usado como prova do estado corrente quando o próprio documento o
classifica como `CURRENT`, identifica a implementação observada e regista o
comando, a data, o resultado real e as limitações da execução.

A precedência documental é:

1. `docs/RF.md` e `docs/RNF.md` — contrato do produto;
2. `ARCHITECTURE.md` — contrato técnico e de dados da referência;
3. `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` — critérios mensuráveis;
4. guias e runbooks — instruções executáveis para a respetiva audiência;
5. evidence — prova atual ou registo histórico, nunca fonte para alterar o contrato.

O report canónico da correção é
`docs/planificacao/guias-bk/CORRECAO-AUDITORIA-END-TO-END-real_dev.md`.
Nenhum report MF isolado substitui essa autoridade.

## Metadata obrigatória

Todo o novo report ou documento de evidence, e qualquer documento existente
materialmente atualizado, deve declarar perto do início:

```text
- `document_status`: `CURRENT | HISTORICAL_SNAPSHOT | SUPERSEDED`
- `snapshot_date`: `YYYY-MM-DD | -`
- `implementation_lane`: `STUDENT | REFERENCE`
- `current_authority`: caminho do documento que define o estado corrente
- `proof_scope`: superfície realmente observada e limites da prova
```

Significado dos estados:

- `CURRENT`: procedimento ou prova ainda válido para a lane indicada;
- `HISTORICAL_SNAPSHOT`: observação imutável da data indicada, sem valor de
  revalidação atual;
- `SUPERSEDED`: contrato substituído; permanece apenas para rastreabilidade e
  não pode fornecer comandos executáveis atuais.

Documentos híbridos devem separar explicitamente uma secção `Procedimento
atual` das secções `Snapshot histórico`. Resultados históricos não mudam de
estado quando o procedimento é corrigido.

## Lanes de implementação

- `STUDENT` usa apenas os roots públicos `backend/` e `frontend/` e descreve o
  trabalho ou a evidence produzida pelos alunos.
- `REFERENCE` pode apontar para `real_dev/`, que é uma referência docente
  privada e ignorada neste repositório. Nunca representa a entrega dos alunos.

Uma prova da referência não promove automaticamente um BK dos alunos para
`DONE`, nem fecha o respetivo gate estudantil. Um documento que compare as duas
lanes deve identificar cada resultado na própria linha ou secção e declarar
`comparison_lane: REFERENCE` e `target_lane: STUDENT` quando a audiência
principal for `STUDENT`.

## Regras de publicação

- Nunca publicar `.env`, URI MongoDB, cookies, tokens, passwords ou dados
  pessoais.
- Registar comando, cwd, data, exit code e resumo real; não escrever apenas
  `PASS`.
- Screenshots, traces e relatórios automáticos ficam primeiro em
  `test-results/` ou `playwright-report/` e só entram em `docs/evidence/` depois
  de revisão humana.
- Fixtures MP4/HLS/DASH sintéticas provam apenas adapters e contratos locais.
  Não provam vídeo real, 4K, CDN, carga, RNF08 ou RNF10.
- Chrome/Edge branded e Safari real não podem ser substituídos por Chromium ou
  WebKit sem uma ressalva explícita.

Os quatro documentos em `docs/runbooks/` são a autoridade operacional da lane
`REFERENCE`. Os guias em `docs/planificacao/guias-bk/MF*/` continuam
student-facing e não devem expor comandos exclusivos da referência privada.
