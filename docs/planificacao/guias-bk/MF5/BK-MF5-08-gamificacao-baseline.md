# BK-MF5-08 - Gamificacao baseline

## Header

- `doc_id`: `GUIA-BK-MF5-08`
- `bk_id`: `BK-MF5-08`
- `macro`: `MF5`
- `owner`: `Kaue`
- `apoio`: `Mateus`
- `prioridade`: `P2`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF5-07`
- `rf_rnf`: `RF63`
- `last_updated`: `2026-04-13`

## O que vamos fazer neste BK

Entregar `Gamificacao baseline` cobrindo `RF63` na `MF5`, com fluxo principal verificavel e evidencia tecnica pronta para gate.

## Porque isto e importante

- Fecha capacidade critica desta macro sem criar drift de backlog.
- Reduz risco tecnico para o proximo BK da sequencia (`BK-MF6-01`).
- Garante rastreabilidade direta requisito -> BK -> evidencia para defesa.

## Pre-condicoes de entrada

- Dependencias declaradas: `BK-MF5-07`.
- Linha do BK validada em `docs/planificacao/backlogs/BACKLOG-MVP.md`.
- Mapeamento de requisito validado em `docs/planificacao/backlogs/MATRIZ-RF-RNF-POR-BK.md`.

## O que entra (scope)

- Entrega funcional de `Gamificacao baseline` com caminho principal completo.
- Integracao com dependencias diretas e validacao de regressao local.
- Evidence minima obrigatoria: `pr`, `proof`, `neg`.

## O que nao entra (scope-out)

- Mudanca de RF/RNF, owner, prioridade ou dependencias sem aprovacao.
- Refatoracao ampla sem impacto direto neste BK.
- Trabalho de BK futuro fora da cadeia declarada.

## Como saber que isto ficou bem

- Fluxo principal de `BK-MF5-08` reproduzivel por outro colega.
- Politica de negativos cumprida para prioridade `P2`.
- Evidence documentada e pronta para auditoria de gate.

## Pre-leitura minima (10-15 min)

- `docs/RF.md` e `docs/RNF.md` (itens de `RF63`).
- `docs/planificacao/backlogs/BACKLOG-MVP.md` (linha de `BK-MF5-08`).
- `docs/planificacao/backlogs/MATRIZ-RF-RNF-POR-BK.md` (rastreabilidade).

## Guia de execucao (passo-a-passo)

1. Validar pre-condicoes e dependencias de entrada.
2. Definir mini-plano tecnico (entrada, processamento, saida, validacao).
3. Implementar o fluxo principal de `Gamificacao baseline`.
4. Executar smoke e validar integracao com BKs adjacentes.
5. Executar negativos obrigatorios para `P2`.
6. Atualizar evidence e preparar handoff para `BK-MF6-01`.

## Outputs esperados

- Output funcional de `BK-MF5-08` concluido sem blocker.
- Output de validacao com teste/log/captura.
- Output documental com `pr/proof/neg` para gate.

## Snippet tecnico obrigatorio

```text
# pseudo-checklist BK-MF5-08
precondicoes_ok = validar_dependencias(["BK-MF5-07"])
assert precondicoes_ok == true

resultado = executar_fluxo_principal("Gamificacao baseline")
assert resultado.status == "OK"

negativos = executar_negativos(prioridade="P2", minimo=1)
assert negativos.passados >= 1

registar_evidence(pr="link-ou-ref", proof=["teste","log"], neg=negativos.resumo)
```

## Checklist de validacao

### Smoke

- [ ] Fluxo principal executa sem erro bloqueante.
- [ ] Integracao com dependencias diretas valida.
- [ ] Resultado reproduzivel por outro colega.

### Negativos

- [ ] Politica obrigatoria aplicada: `P0/P1>=3; P2>=1`.
- [ ] Negativo 1: cenario de erro/limite executado e documentado.
### Tecnico

- [ ] Metadados alinhados com BACKLOG-MVP e matriz RF/RNF.
- [ ] Criterios de aceite mensuraveis definidos com limiar claro.
- [ ] Evidence (`pr`, `proof`, `neg`) pronta para gate.

## Criterios de aceite (mensuraveis)

- Condicao: fluxo principal de `BK-MF5-08` concluido ponta-a-ponta.
- Metrica/Limiar: 100% dos passos de scope sem blocker.
- Evidencia esperada: `proof` com teste/log/captura objetiva.
- Condicao: politica de negativos cumprida para `P2`.
- Metrica/Limiar: minimo de 1 negativo(s) executado(s) com resultado previsivel.
- Evidencia esperada: `neg` com cenarios e resultado observado.
- Condicao: coerencia documental com backlog e matriz.
- Metrica/Limiar: `owner`, `prioridade`, `dependencias`, `rf_rnf` sem divergencia.
- Evidencia esperada: validacao tecnica aprovada no gate da sprint.

## Evidence para PR/defesa

- `pr`: link de PR/commit ou referencia de entrega local.
- `proof`: 2-3 evidencias objetivas (teste, log, captura, output).
- `neg`: resumo dos cenarios negativos executados (minimo por prioridade).

## Proximo BK recomendado

`BK-MF6-01`

## Changelog

- `2026-04-13`: retrofit para contrato pedagogico v3 (objetivo especifico, pre-condicoes, outputs, snippet e proximo BK real).
