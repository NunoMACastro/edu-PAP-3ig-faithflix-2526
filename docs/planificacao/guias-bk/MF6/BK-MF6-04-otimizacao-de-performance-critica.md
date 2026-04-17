# BK-MF6-04 - Otimizacao de performance critica

## Header

- `doc_id`: `GUIA-BK-MF6-04`
- `bk_id`: `BK-MF6-04`
- `macro`: `MF6`
- `owner`: `Davi`
- `apoio`: `Mateus`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF6-02`
- `rf_rnf`: `RNF09, RNF10, RNF11, RNF12`
- `fase_documental`: `Fase 3`
- `sprint`: `S11`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF6-05`
- `guia_path`: `docs/planificacao/guias-bk/MF6/BK-MF6-04-otimizacao-de-performance-critica.md`
- `last_updated`: `2026-04-14`

## Bloco pedagogico (obrigatorio)

### Objetivo pedagogico

- Consolidar a entrega de `Otimizacao de performance critica` com rastreabilidade explicita para `RNF09, RNF10, RNF11, RNF12`.
- Executar o BK `BK-MF6-04` no contexto da macro `MF6` e da sprint `S11`.

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

Entregar `Otimizacao de performance critica` cobrindo `RNF09..RNF12` na `MF6`, com fluxo principal verificavel e evidencia tecnica pronta para gate.

## Porque isto e importante

- Fecha capacidade critica desta macro sem criar drift de backlog.
- Reduz risco tecnico para o proximo BK da sequencia (`BK-MF6-05`).
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

- Dependencias declaradas: `BK-MF6-02`.
- Linha do BK validada em `docs/planificacao/backlogs/BACKLOG-MVP.md`.
- Mapeamento de requisito validado em `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`.

## O que entra (scope)

- Entrega funcional de `Otimizacao de performance critica` com caminho principal completo.
- Integracao com dependencias diretas e validacao de regressao local.
- Evidence minima obrigatoria: `pr`, `proof`, `neg`.

## O que nao entra (scope-out)

- Mudanca de RF/RNF, owner, prioridade ou dependencias sem aprovacao.
- Refatoracao ampla sem impacto direto neste BK.
- Trabalho de BK futuro fora da cadeia declarada.

## Como saber que isto ficou bem

- Fluxo principal de `BK-MF6-04` reproduzivel por outro colega.
- Politica de negativos cumprida para prioridade `P1`.
- Evidence documentada e pronta para auditoria de gate.

## Pre-leitura minima (10-15 min)

- `docs/RF.md` e `docs/RNF.md` (itens de `RNF09..RNF12`).
- `docs/planificacao/backlogs/BACKLOG-MVP.md` (linha de `BK-MF6-04`).
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` (rastreabilidade).

## Guia de execucao (passo-a-passo)

1. Definir baseline de performance para endpoints/listagens de `RNF09..RNF12` com dados de teste controlados.
2. Medir estado atual (`before`) de latencia e throughput para catalogo, pesquisa e recomendacao baseline.
3. Aplicar otimizacoes tecnicas prioritarias (indexacao, paginacao obrigatoria, query tuning, cache simples onde fizer sentido).
4. Medir estado final (`after`) com o mesmo cenario para comprovar melhoria objetiva.
5. Validar impacto em carga concorrente e confirmar que nao houve regressao funcional no fluxo principal.
6. Atualizar evidence e preparar handoff para `BK-MF6-05`.

## Outputs esperados

- Output funcional de `BK-MF6-04` concluido sem blocker.
- Output de validacao com teste/log/captura.
- Output documental com `pr/proof/neg` para gate.

## Snippet tecnico aplicavel

```text
# pseudo-checklist BK-MF6-04
precondicoes_ok = validar_dependencias(["BK-MF6-02"])
assert precondicoes_ok == true

resultado = executar_fluxo_principal("Otimizacao de performance critica")
assert resultado.status == "OK"

negativos = executar_negativos(prioridade="P1", minimo=3)
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
- [ ] Negativo 1: pedido de listagem sem paginacao/limite permitido e bloqueado com erro de validacao.
- [ ] Negativo 2: cenario de carga concorrente elevado sem degradacao acima do limiar acordado.
- [ ] Negativo 3: consulta pesada sem filtro obrigatorio nao causa indisponibilidade da API.
### Tecnico

- [ ] Metadados alinhados com BACKLOG-MVP e matriz RF/RNF.
- [ ] Criterios de aceite mensuraveis definidos com limiar claro.
- [ ] Evidence (`pr`, `proof`, `neg`) pronta para gate.

## Criterios de aceite (mensuraveis)

- Condicao: melhoria de performance comprovada nos pontos criticos do BK.
- Metrica/Limiar: latencia `after` melhor ou igual a `before` em pelo menos 3 cenarios medidos.
- Evidencia esperada: `proof` com tabela comparativa `before/after` e comando/ferramenta usada.
- Condicao: requisitos de resposta para listagens/pesquisa mantidos no alvo do MVP.
- Metrica/Limiar: respostas de catalogo/pesquisa dentro do limiar definido no plano de testes de performance.
- Evidencia esperada: `proof` com relatorio de execucao e percentis relevantes.
- Condicao: resiliência sob cenarios limite sem quebra funcional.
- Metrica/Limiar: 3/3 negativos obrigatorios executados sem erro bloqueante de disponibilidade.
- Evidencia esperada: `neg` com cenarios de carga/validacao e resultados observados.

## Evidence para PR/defesa

- `pr`: link de PR/commit ou referencia de entrega local.
- `proof`: 2-3 evidencias objetivas (teste, log, captura, output).
- `neg`: resumo dos cenarios negativos executados (minimo por prioridade).

## Proximo BK recomendado

`BK-MF6-05`

## Changelog

- `2026-04-13`: retrofit para contrato pedagogico v3 (objetivo especifico, pre-condicoes, outputs, snippet e proximo BK real).
