# BK-MF2-08 - Teste E2E do fluxo principal

## Header

- `doc_id`: `GUIA-BK-MF2-08`
- `bk_id`: `BK-MF2-08`
- `macro`: `MF2`
- `owner`: `Kaue`
- `apoio`: `Mateus`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF2-01,BK-MF2-07`
- `rf_rnf`: `RNF07, RNF08`
- `fase_documental`: `Fase 1`
- `sprint`: `S04`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF3-01`
- `guia_path`: `docs/planificacao/guias-bk/MF2/BK-MF2-08-teste-e2e-fluxo-principal.md`
- `last_updated`: `2026-04-14`

## Bloco pedagogico (obrigatorio)

### Objetivo pedagogico

- Consolidar a entrega de `Teste E2E do fluxo principal` com rastreabilidade explicita para `RNF07, RNF08`.
- Executar o BK `BK-MF2-08` no contexto da macro `MF2` e da sprint `S04`.

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

Entregar `Teste E2E do fluxo principal` cobrindo `RNF07, RNF08` na `MF2`, com fluxo principal verificavel e evidencia tecnica pronta para gate.

## Porque isto e importante

- Fecha capacidade critica desta macro sem criar drift de backlog.
- Reduz risco tecnico para o proximo BK da sequencia (`BK-MF3-01`).
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

- Dependencias declaradas: `BK-MF2-01,BK-MF2-07`.
- Linha do BK validada em `docs/planificacao/backlogs/BACKLOG-MVP.md`.
- Mapeamento de requisito validado em `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`.

## O que entra (scope)

- Entrega funcional de `Teste E2E do fluxo principal` com caminho principal completo.
- Integracao com dependencias diretas e validacao de regressao local.
- Evidence minima obrigatoria: `pr`, `proof`, `neg`.

## O que nao entra (scope-out)

- Mudanca de RF/RNF, owner, prioridade ou dependencias sem aprovacao.
- Refatoracao ampla sem impacto direto neste BK.
- Trabalho de BK futuro fora da cadeia declarada.

## Como saber que isto ficou bem

- Fluxo principal de `BK-MF2-08` reproduzivel por outro colega.
- Politica de negativos cumprida para prioridade `P0`.
- Evidence documentada e pronta para auditoria de gate.

## Pre-leitura minima (10-15 min)

- `docs/RF.md` e `docs/RNF.md` (itens de `RNF07, RNF08`).
- `docs/planificacao/backlogs/BACKLOG-MVP.md` (linha de `BK-MF2-08`).
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` (rastreabilidade).

## Guia de execucao (passo-a-passo)

1. Definir roteiro E2E unico do fluxo principal: `registo -> login -> detalhe -> reproducao -> continuar a ver -> favoritos`.
2. Implementar testes E2E automatizados com dados previsiveis e ambiente limpo de arranque.
3. Medir tempos de resposta dos passos criticos do fluxo para validar RNF07/RNF08 com limiares declarados.
4. Incluir assercoes de UI e de API para cada etapa (estado esperado no frontend e persistencia no backend).
5. Executar bateria negativa minima no mesmo pipeline E2E para validar comportamento de erro sem quebra da sessao.
6. Publicar evidence consolidada e preparar handoff para `BK-MF3-01`.

## Outputs esperados

- Output funcional de `BK-MF2-08` concluido sem blocker.
- Output de validacao com teste/log/captura.
- Output documental com `pr/proof/neg` para gate.

## Snippet tecnico aplicavel

```text
# pseudo-checklist BK-MF2-08
precondicoes_ok = validar_dependencias(["BK-MF2-01","BK-MF2-07"])
assert precondicoes_ok == true

resultado = executar_fluxo_principal("Teste E2E do fluxo principal")
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
- [ ] Negativo 1: acesso ao player sem autenticacao e bloqueado/redirecionado.
- [ ] Negativo 2: tentativa de abrir detalhe de conteudo inexistente devolve estado de erro controlado.
- [ ] Negativo 3: falha simulada de API no fluxo principal apresenta fallback sem crash da aplicacao.
### Tecnico

- [ ] Metadados alinhados com BACKLOG-MVP e matriz RF/RNF.
- [ ] Criterios de aceite mensuraveis definidos com limiar claro.
- [ ] Evidence (`pr`, `proof`, `neg`) pronta para gate.

## Criterios de aceite (mensuraveis)

- Condicao: roteiro E2E do fluxo principal executa sem regressao.
- Metrica/Limiar: 100% dos passos do roteiro passam em execucao local e em pipeline.
- Evidencia esperada: `proof` com relatorio de testes + capturas dos passos criticos.
- Condicao: validacao basica de performance do fluxo principal concluida.
- Metrica/Limiar: pagina inicial `<3s` e inicio de reproducao `<=3s` no ambiente de teste definido.
- Evidencia esperada: `proof` com logs de medicao/tempos por etapa.
- Condicao: robustez de erro e autorizacao validada.
- Metrica/Limiar: 3/3 negativos obrigatorios executados com comportamento esperado.
- Evidencia esperada: `neg` com detalhes do cenario, resposta e estado final da UI.

## Evidence para PR/defesa

- `pr`: link de PR/commit ou referencia de entrega local.
- `proof`: 2-3 evidencias objetivas (teste, log, captura, output).
- `neg`: resumo dos cenarios negativos executados (minimo por prioridade).

## Proximo BK recomendado

`BK-MF3-01`

## Changelog

- `2026-04-13`: retrofit para contrato pedagogico v3 (objetivo especifico, pre-condicoes, outputs, snippet e proximo BK real).
