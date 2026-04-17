# BK-MF4-05 - Distribuicao mensal e rotacao

## Header

- `doc_id`: `GUIA-BK-MF4-05`
- `bk_id`: `BK-MF4-05`
- `macro`: `MF4`
- `owner`: `Davi`
- `apoio`: `Matheus`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `L`
- `dependencias`: `BK-MF4-04`
- `rf_rnf`: `RF44, RF45`
- `fase_documental`: `Fase 1`
- `sprint`: `S08`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF4-06`
- `guia_path`: `docs/planificacao/guias-bk/MF4/BK-MF4-05-distribuicao-mensal-rotacao.md`
- `last_updated`: `2026-04-14`

## Bloco pedagogico (obrigatorio)

### Objetivo pedagogico

- Consolidar a entrega de `Distribuicao mensal e rotacao` com rastreabilidade explicita para `RF44, RF45`.
- Executar o BK `BK-MF4-05` no contexto da macro `MF4` e da sprint `S08`.

### Tempo estimado

- Tempo recomendado: `90-180 min` de foco tecnico.
- Se ultrapassar em `>30 min`, ativar remediacao no guiao docente.

### Erros comuns

- Comecar sem validar dependencias.
- Fechar BK sem `pr/proof/neg`.
- Ignorar negativos minimos por prioridade.

### Check de compreensao

- [ ] Sei explicar o objetivo do BK em 30 segundos.
- [ ] Sei distinguir scope e scope-out deste BK.
- [ ] Sei qual e o handoff para o proximo BK.


## O que vamos fazer neste BK

Entregar `Distribuicao mensal e rotacao` cobrindo `RF44, RF45` na `MF4`, com fluxo principal verificavel e evidencia tecnica pronta para gate.

## Porque isto e importante

- Fecha capacidade critica desta macro sem criar drift de backlog.
- Reduz risco tecnico para o proximo BK da sequencia (`BK-MF4-06`).
- Garante rastreabilidade direta requisito -> BK -> evidencia para defesa.

## Bloco operacional (obrigatorio)

### Pre-condicoes

- Confirmar dependencias e rastreabilidade antes de executar.

### Execucao

- Seguir o passo-a-passo do guia, focando primeiro o fluxo principal.

### Outputs

- Entrega funcional + evidence minima (`pr`, `proof`, `neg`).

### Validacao

- Fechar checklist de smoke, negativos e criterios mensuraveis.

### Handoff

- Preparar transicao objetiva para o `Proximo BK recomendado`.


## Pre-condicoes de entrada

- Dependencias declaradas: `BK-MF4-04`.
- Linha do BK validada em `docs/planificacao/backlogs/BACKLOG-MVP.md`.
- Mapeamento de requisito validado em `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`.

## O que entra (scope)

- Entrega funcional de `Distribuicao mensal e rotacao` com caminho principal completo.
- Integracao com dependencias diretas e validacao de regressao local.
- Evidence minima obrigatoria: `pr`, `proof`, `neg`.

## O que nao entra (scope-out)

- Mudanca de RF/RNF, owner, prioridade ou dependencias sem aprovacao.
- Refatoracao ampla sem impacto direto neste BK.
- Trabalho de BK futuro fora da cadeia declarada.

## Como saber que isto ficou bem

- Fluxo principal de `BK-MF4-05` reproduzivel por outro colega.
- Politica de negativos cumprida para prioridade `P0`.
- Evidence documentada e pronta para auditoria de gate.

## Pre-leitura minima (10-15 min)

- `docs/RF.md` e `docs/RNF.md` (itens de `RF44, RF45`).
- `docs/planificacao/backlogs/BACKLOG-MVP.md` (linha de `BK-MF4-05`).
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` (rastreabilidade).

## Guia de execucao (passo-a-passo)

1. Definir algoritmo mensal de distribuicao com entrada (`valor_pool_mes`, associacoes elegiveis, regra de rotacao) e saida auditavel.
2. Implementar regra de rotacao deterministica para garantir alternancia justa entre associacoes elegiveis.
3. Implementar calculo de percentagens/valores com tratamento de arredondamentos e reconciliacao final do total.
4. Persistir execucao da distribuicao com `run_id` unico por mes para garantir idempotencia.
5. Expor resultado da distribuicao para consumo por relatarios/admin sem permitir alteracao retroativa indevida.
6. Atualizar evidence e preparar handoff para `BK-MF4-06`.

## Outputs esperados

- Output funcional de `BK-MF4-05` concluido sem blocker.
- Output de validacao com teste/log/captura.
- Output documental com `pr/proof/neg` para gate.

## Snippet tecnico aplicavel

```text
# pseudo-checklist BK-MF4-05
precondicoes_ok = validar_dependencias(["BK-MF4-04"])
assert precondicoes_ok == true

resultado = executar_fluxo_principal("Distribuicao mensal e rotacao")
assert resultado.status == "OK"

negativos = executar_negativos(prioridade="P0", minimo=3)
assert negativos.passados >= 3

registar_evidence(pr="link-ou-ref", proof=["teste","log"], neg=negativos.resumo)
```

## Checklist de validacao

### Smoke

- [ ] Fluxo principal executa sem erro bloqueante.
- [ ] Integracao com dependencias diretas valida.
- [ ] Resultado reproduzivel por outro colega.

### Negativos

- [ ] Politica obrigatoria aplicada: `P0/P1>=3; P2>=1`.
- [ ] Negativo 1: tentativa de executar distribuicao duas vezes no mesmo mes nao cria duplicados.
- [ ] Negativo 2: configuracao de percentagens invalida (soma diferente de 100%) e bloqueada antes da execucao.
- [ ] Negativo 3: associacao inelegivel/inativa nao recebe valores no processamento mensal.
### Tecnico

- [ ] Metadados alinhados com BACKLOG-MVP e matriz RF/RNF.
- [ ] Criterios de aceite mensuraveis definidos com limiar claro.
- [ ] Evidence (`pr`, `proof`, `neg`) pronta para gate.

## Criterios de aceite (mensuraveis)

- Condicao: distribuicao mensal e rotacao executam sem ambiguidades.
- Metrica/Limiar: 1 execucao valida por mes, com `run_id` unico e sem duplicacao.
- Evidencia esperada: `proof` com registos do processamento mensal e respetivo resumo.
- Condicao: reconciliacao financeira da pool esta correta.
- Metrica/Limiar: soma dos valores distribuidos = valor da pool do mes (diferenca maxima permitida: `0.01`).
- Evidencia esperada: `proof` com tabela de calculo e comprovativo de reconciliacao.
- Condicao: robustez de regras de elegibilidade e configuracao.
- Metrica/Limiar: 3/3 negativos obrigatorios executados com bloqueio/resultado esperado.
- Evidencia esperada: `neg` com cenarios de erro e estado final dos registos.

## Evidence para PR/defesa

- `pr`: link de PR/commit ou referencia de entrega local.
- `proof`: 2-3 evidencias objetivas (teste, log, captura, output).
- `neg`: resumo dos cenarios negativos executados (minimo por prioridade).

## Proximo BK recomendado

`BK-MF4-06`

## Changelog

- `2026-04-13`: retrofit para contrato pedagogico v3 (objetivo especifico, pre-condicoes, outputs, snippet e proximo BK real).
