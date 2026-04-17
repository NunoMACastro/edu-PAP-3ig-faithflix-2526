# BK-MF4-06 - Relatorios e historico por associacao

## Header

- `doc_id`: `GUIA-BK-MF4-06`
- `bk_id`: `BK-MF4-06`
- `macro`: `MF4`
- `owner`: `Kaue`
- `apoio`: `Mateus`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF4-05`
- `rf_rnf`: `RF46, RF47, RF48`
- `fase_documental`: `Fase 2`
- `sprint`: `S08`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF5-01`
- `guia_path`: `docs/planificacao/guias-bk/MF4/BK-MF4-06-relatorios-e-historico-por-associacao.md`
- `last_updated`: `2026-04-14`

## Bloco pedagogico (obrigatorio)

### Objetivo pedagogico

- Consolidar a entrega de `Relatorios e historico por associacao` com rastreabilidade explicita para `RF46, RF47, RF48`.
- Executar o BK `BK-MF4-06` no contexto da macro `MF4` e da sprint `S08`.

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

Entregar `Relatorios e historico por associacao` cobrindo `RF46, RF47, RF48` na `MF4`, com fluxo principal verificavel e evidencia tecnica pronta para gate.

## Porque isto e importante

- Fecha capacidade critica desta macro sem criar drift de backlog.
- Reduz risco tecnico para o proximo BK da sequencia (`BK-MF5-01`).
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

- Dependencias declaradas: `BK-MF4-05`.
- Linha do BK validada em `docs/planificacao/backlogs/BACKLOG-MVP.md`.
- Mapeamento de requisito validado em `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`.

## O que entra (scope)

- Entrega funcional de `Relatorios e historico por associacao` com caminho principal completo.
- Integracao com dependencias diretas e validacao de regressao local.
- Evidence minima obrigatoria: `pr`, `proof`, `neg`.

## O que nao entra (scope-out)

- Mudanca de RF/RNF, owner, prioridade ou dependencias sem aprovacao.
- Refatoracao ampla sem impacto direto neste BK.
- Trabalho de BK futuro fora da cadeia declarada.

## Como saber que isto ficou bem

- Fluxo principal de `BK-MF4-06` reproduzivel por outro colega.
- Politica de negativos cumprida para prioridade `P1`.
- Evidence documentada e pronta para auditoria de gate.

## Pre-leitura minima (10-15 min)

- `docs/RF.md` e `docs/RNF.md` (itens de `RF46, RF47, RF48`).
- `docs/planificacao/backlogs/BACKLOG-MVP.md` (linha de `BK-MF4-06`).
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` (rastreabilidade).

## Guia de execucao (passo-a-passo)

1. Definir consultas/enderecos de relatorio por associacao com filtros minimos (`periodo`, `estado`, `tipo de distribuicao`).
2. Implementar historico cronologico por associacao com totais acumulados e detalhe por mes.
3. Implementar visao publica agregada (sem dados sensiveis) e visao privada por entidade com autenticacao.
4. Garantir controlo de acesso para impedir leitura cruzada entre associacoes.
5. Adicionar exportacao simples (`CSV`) dos dados filtrados para suporte a transparencia e defesa PAP.
6. Atualizar evidence e preparar handoff para `BK-MF5-01`.

## Outputs esperados

- Output funcional de `BK-MF4-06` concluido sem blocker.
- Output de validacao com teste/log/captura.
- Output documental com `pr/proof/neg` para gate.

## Snippet tecnico aplicavel

```text
# pseudo-checklist BK-MF4-06
precondicoes_ok = validar_dependencias(["BK-MF4-05"])
assert precondicoes_ok == true

resultado = executar_fluxo_principal("Relatorios e historico por associacao")
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
- [ ] Negativo 1: associacao A tenta consultar historico da associacao B e o acesso e bloqueado.
- [ ] Negativo 2: filtro de periodo invalido (`data_inicio > data_fim`) devolve erro de validacao.
- [ ] Negativo 3: pedido de relatorio sem registos devolve estado vazio controlado (sem erro 500).
### Tecnico

- [ ] Metadados alinhados com BACKLOG-MVP e matriz RF/RNF.
- [ ] Criterios de aceite mensuraveis definidos com limiar claro.
- [ ] Evidence (`pr`, `proof`, `neg`) pronta para gate.

## Criterios de aceite (mensuraveis)

- Condicao: relatorios e historico por associacao funcionam com filtros e totais corretos.
- Metrica/Limiar: 100% dos filtros declarados retornam dados coerentes com as distribuicoes registadas.
- Evidencia esperada: `proof` com amostra de relatorio + comparacao com dados fonte.
- Condicao: isolamento de acesso por associacao garantido.
- Metrica/Limiar: 0 acessos cruzados permitidos em testes de autorizacao entre entidades.
- Evidencia esperada: `proof`/`neg` com requests autenticados e respostas de bloqueio.
- Condicao: comportamento degradado controlado em cenarios limite.
- Metrica/Limiar: 3/3 negativos obrigatorios executados sem erro bloqueante da aplicacao.
- Evidencia esperada: `neg` com capturas/logs dos cenarios de filtro invalido e dataset vazio.

## Evidence para PR/defesa

- `pr`: link de PR/commit ou referencia de entrega local.
- `proof`: 2-3 evidencias objetivas (teste, log, captura, output).
- `neg`: resumo dos cenarios negativos executados (minimo por prioridade).

## Proximo BK recomendado

`BK-MF5-01`

## Changelog

- `2026-04-13`: retrofit para contrato pedagogico v3 (objetivo especifico, pre-condicoes, outputs, snippet e proximo BK real).
