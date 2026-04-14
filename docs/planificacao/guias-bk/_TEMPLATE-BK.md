# BK-XXXX - Titulo do BK

## Header

- `doc_id`: `GUIA-BK-XXXX`
- `bk_id`: `BK-XXXX`
- `macro`: `MFX`
- `owner`: `A definir`
- `apoio`: `A definir`
- `prioridade`: `P0|P1|P2`
- `estado`: `TODO|IN_PROGRESS|DONE|BLOCKED`
- `esforco`: `S|M|L`
- `dependencias`: `BK-...|-`
- `rf_rnf`: `RFxx/RNFxx/transversal`
- `last_updated`: `YYYY-MM-DD`

## Bloco pedagogico (obrigatorio)

### Objetivo pedagogico

- Competencia que o aluno vai consolidar neste BK.
- Ligacao direta da competencia ao contexto real do FaithFlix.

### Tempo estimado

- Planeamento recomendado para este BK: `90-180 min` de execucao focada.
- Se exceder em `>30 min`, ativar remediacao no guiao docente semanal.

### Erros comuns

- Ignorar dependencias e arrancar implementacao fora de ordem canonica.
- Fechar BK sem evidencias minimas (`pr`, `proof`, `neg`).
- Entregar sem validar negativos minimos por prioridade.

### Check de compreensao

- [ ] Sei explicar o objetivo do BK em 30 segundos.
- [ ] Sei quais sao entradas, saidas e criterio de sucesso.
- [ ] Sei qual e o `Proximo BK recomendado` e o handoff esperado.

## Bloco operacional (obrigatorio)

### Pre-condicoes

- Dependencias desbloqueadas e alinhadas com `BACKLOG-MVP.md`.
- Rastreabilidade confirmada em `MATRIZ-RF-RNF-POR-BK.md`.

### Execucao

- Implementar primeiro o caminho principal do BK.
- Validar integracoes diretas antes de otimizar detalhes.

### Outputs

- Entregavel funcional do BK.
- Evidencia objetiva (`proof`) e resumo de negativos (`neg`).

### Validacao

- Checklist de smoke + negativos + tecnico concluida.
- Criterios de aceite mensuraveis validados.

### Handoff

- Registar transicao objetiva para o proximo BK da sequencia.
- Se houver bloqueio, abrir acao corretiva com owner e prazo.

## O que vamos fazer neste BK

Descrever objetivo especifico do BK em contexto real (sem texto generico).

## Porque isto e importante

- Impacto direto no produto e no fluxo da sprint.
- Impacto no BK seguinte.
- Risco de nao entregar com qualidade.

## Pre-condicoes de entrada

- Dependencias desbloqueadas e validadas.
- Contexto tecnico alinhado com backlog e matriz.
- Criterio de entrada registado antes de executar.

## O que entra (scope)

- Entregavel principal do BK.
- Integracoes obrigatorias do BK.
- Evidence minima obrigatoria (`pr`, `proof`, `neg`).

## O que nao entra (scope-out)

- Trabalho fora do objetivo deste BK.
- Refatoracoes amplas sem dependencia direta.
- Alteracoes de RF/RNF ou ownership sem aprovacao.

## Como saber que isto ficou bem

- Resultado observavel e reproduzivel.
- Dependencias e integracoes validadas.
- Criterios mensuraveis e evidence preenchida.

## Pre-leitura minima (10-15 min)

- `docs/RF.md` e `docs/RNF.md`.
- `docs/planificacao/backlogs/BACKLOG-MVP.md`.
- `docs/planificacao/backlogs/MATRIZ-RF-RNF-POR-BK.md`.

## Guia de execucao (passo-a-passo)

1. Validar pre-condicoes e dependencias.
2. Definir mini-plano tecnico com entradas/saidas e limites.
3. Implementar caminho principal do BK.
4. Validar smoke + integracao com BKs dependentes.
5. Executar negativos conforme prioridade.
6. Consolidar evidence e preparar handoff para BK seguinte.

## Outputs esperados

- Output funcional principal do BK concluido.
- Output de validacao (smoke + negativos) com prova objetiva.
- Output documental (`pr/proof/neg`) pronto para gate.

## Snippet tecnico obrigatorio

Adicionar bloco de codigo ou pseudocodigo validavel e contextualizado ao BK.

```text
# exemplo minimo (adaptar ao BK real)
precondicoes_ok = validar_dependencias([...])
resultado = executar_fluxo_principal(...)
assert resultado == "OK"
```

## Checklist de validacao

### Smoke

- [ ] Fluxo principal executa sem erro bloqueante.
- [ ] Integracao com dependencias diretas valida.
- [ ] Resultado reproduzivel por outro colega.

### Negativos

- [ ] Politica obrigatoria aplicada: `P0/P1>=3; P2>=1`.
- [ ] Cenarios negativos executados com resultado esperado.

### Tecnico

- [ ] Metadados alinhados com BACKLOG-MVP e MATRIZ-RF-RNF-POR-BK.
- [ ] Criterios mensuraveis definidos com limiar claro.
- [ ] Evidence (`pr`, `proof`, `neg`) pronta para gate.

## Criterios de aceite (mensuraveis)

- Condicao observavel + metrica/limiar + evidencia esperada.
- Politica de negativos validada por prioridade.
- Coerencia documental confirmada no fecho.

## Evidence para PR/defesa

- `pr`: link de PR/commit ou referencia local.
- `proof`: 2-3 evidencias objetivas.
- `neg`: resumo dos cenarios negativos executados.

## Proximo BK recomendado

- Valor derivado da ordem canonica de `docs/planificacao/sprints/PLANO-SPRINTS.md`.
- Formato permitido:
- `BK-MFxx-yy` para BKs nao terminais.
- `-` apenas para BK terminal da sequencia canonica.
