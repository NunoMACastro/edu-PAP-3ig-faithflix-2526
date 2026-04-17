# BK-MF6-03 - Hardening seguranca e privacidade

## Header

- `doc_id`: `GUIA-BK-MF6-03`
- `bk_id`: `BK-MF6-03`
- `macro`: `MF6`
- `owner`: `Matheus`
- `apoio`: `Kaue`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF6-01`
- `rf_rnf`: `RNF14, RNF16, RNF17, RNF18, RNF19, RNF20, RNF37`
- `fase_documental`: `Fase 3`
- `sprint`: `S11`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF6-04`
- `guia_path`: `docs/planificacao/guias-bk/MF6/BK-MF6-03-hardening-seguranca-e-privacidade.md`
- `last_updated`: `2026-04-14`

## Bloco pedagogico (obrigatorio)

### Objetivo pedagogico

- Consolidar a entrega de `Hardening seguranca e privacidade` com rastreabilidade explicita para `RNF14, RNF16, RNF17, RNF18, RNF19, RNF20, RNF37`.
- Executar o BK `BK-MF6-03` no contexto da macro `MF6` e da sprint `S11`.

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

Entregar `Hardening seguranca e privacidade` cobrindo `RNF14, RNF16..RNF20, RNF37` na `MF6`, com fluxo principal verificavel e evidencia tecnica pronta para gate.

## Porque isto e importante

- Fecha capacidade critica desta macro sem criar drift de backlog.
- Reduz risco tecnico para o proximo BK da sequencia (`BK-MF6-04`).
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

- Dependencias declaradas: `BK-MF6-01`.
- Linha do BK validada em `docs/planificacao/backlogs/BACKLOG-MVP.md`.
- Mapeamento de requisito validado em `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`.

## O que entra (scope)

- Entrega funcional de `Hardening seguranca e privacidade` com caminho principal completo.
- Integracao com dependencias diretas e validacao de regressao local.
- Evidence minima obrigatoria: `pr`, `proof`, `neg`.

## O que nao entra (scope-out)

- Mudanca de RF/RNF, owner, prioridade ou dependencias sem aprovacao.
- Refatoracao ampla sem impacto direto neste BK.
- Trabalho de BK futuro fora da cadeia declarada.

## Como saber que isto ficou bem

- Fluxo principal de `BK-MF6-03` reproduzivel por outro colega.
- Politica de negativos cumprida para prioridade `P0`.
- Evidence documentada e pronta para auditoria de gate.

## Pre-leitura minima (10-15 min)

- `docs/RF.md` e `docs/RNF.md` (itens de `RNF14, RNF16..RNF20, RNF37`).
- `docs/planificacao/backlogs/BACKLOG-MVP.md` (linha de `BK-MF6-03`).
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` (rastreabilidade).

## Guia de execucao (passo-a-passo)

1. Inventariar endpoints/operacoes sensiveis e mapear controlos exigidos por `RNF14, RNF16..RNF20, RNF37`.
2. Reforcar validacao de input e sanitizacao em endpoints criticos (auth, perfil, subscricao, administracao).
3. Garantir politicas de segredo/credenciais em variaveis de ambiente e remover defaults inseguros.
4. Validar trilho de auditoria para operacoes administrativas criticas com ator, timestamp e acao.
5. Executar bateria de testes de seguranca basicos (payloads maliciosos, privilegio indevido, acesso a dados de terceiros).
6. Atualizar evidence e preparar handoff para `BK-MF6-04`.

## Outputs esperados

- Output funcional de `BK-MF6-03` concluido sem blocker.
- Output de validacao com teste/log/captura.
- Output documental com `pr/proof/neg` para gate.

## Snippet tecnico aplicavel

```text
# pseudo-checklist BK-MF6-03
precondicoes_ok = validar_dependencias(["BK-MF6-01"])
assert precondicoes_ok == true

resultado = executar_fluxo_principal("Hardening seguranca e privacidade")
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
- [ ] Negativo 1: payload de injecao em campo de pesquisa/formulario e neutralizado sem execucao.
- [ ] Negativo 2: tentativa de acao administrativa por utilizador sem permissao e bloqueada.
- [ ] Negativo 3: tentativa de aceder dados de recomendacao de outro utilizador e rejeitada.
### Tecnico

- [ ] Metadados alinhados com BACKLOG-MVP e matriz RF/RNF.
- [ ] Criterios de aceite mensuraveis definidos com limiar claro.
- [ ] Evidence (`pr`, `proof`, `neg`) pronta para gate.

## Criterios de aceite (mensuraveis)

- Condicao: controlos de seguranca/privacidade definidos neste BK estao ativos.
- Metrica/Limiar: 100% dos endpoints criticos inventariados possuem validacao/autorizacao e logging de auditoria quando aplicavel.
- Evidencia esperada: `proof` com checklist de endpoints e amostra de logs de auditoria.
- Condicao: dados de recomendacao e dados sensiveis mantem isolamento por utilizador.
- Metrica/Limiar: 0 leituras cruzadas autorizadas nos testes de seguranca executados.
- Evidencia esperada: `proof` com testes automatizados/manuais de isolamento.
- Condicao: bateria minima de seguranca executada sem falhas criticas.
- Metrica/Limiar: 3/3 negativos obrigatorios executados com comportamento seguro previsivel.
- Evidencia esperada: `neg` com payload usado, resposta e impacto observado.

## Evidence para PR/defesa

- `pr`: link de PR/commit ou referencia de entrega local.
- `proof`: 2-3 evidencias objetivas (teste, log, captura, output).
- `neg`: resumo dos cenarios negativos executados (minimo por prioridade).

## Proximo BK recomendado

`BK-MF6-04`

## Changelog

- `2026-04-13`: retrofit para contrato pedagogico v3 (objetivo especifico, pre-condicoes, outputs, snippet e proximo BK real).
