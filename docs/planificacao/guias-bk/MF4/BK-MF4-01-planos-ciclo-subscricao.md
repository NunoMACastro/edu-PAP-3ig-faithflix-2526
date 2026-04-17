# BK-MF4-01 - Planos e ciclo de subscricao

## Header

- `doc_id`: `GUIA-BK-MF4-01`
- `bk_id`: `BK-MF4-01`
- `macro`: `MF4`
- `owner`: `Matheus`
- `apoio`: `Davi`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `L`
- `dependencias`: `BK-MF2-01`
- `rf_rnf`: `RF35, RF36, RF38, RF39`
- `fase_documental`: `Fase 1`
- `sprint`: `S07`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF4-02`
- `guia_path`: `docs/planificacao/guias-bk/MF4/BK-MF4-01-planos-ciclo-subscricao.md`
- `last_updated`: `2026-04-14`

## Bloco pedagogico (obrigatorio)

### Objetivo pedagogico

- Consolidar a entrega de `Planos e ciclo de subscricao` com rastreabilidade explicita para `RF35, RF36, RF38, RF39`.
- Executar o BK `BK-MF4-01` no contexto da macro `MF4` e da sprint `S07`.

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

Entregar `Planos e ciclo de subscricao` cobrindo `RF35, RF36, RF38, RF39` na `MF4`, com fluxo principal verificavel e evidencia tecnica pronta para gate.

## Porque isto e importante

- Fecha capacidade critica desta macro sem criar drift de backlog.
- Reduz risco tecnico para o proximo BK da sequencia (`BK-MF4-02`).
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

- Dependencias declaradas: `BK-MF2-01`.
- Linha do BK validada em `docs/planificacao/backlogs/BACKLOG-MVP.md`.
- Mapeamento de requisito validado em `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`.

## O que entra (scope)

- Entrega funcional de `Planos e ciclo de subscricao` com caminho principal completo.
- Integracao com dependencias diretas e validacao de regressao local.
- Evidence minima obrigatoria: `pr`, `proof`, `neg`.

## O que nao entra (scope-out)

- Mudanca de RF/RNF, owner, prioridade ou dependencias sem aprovacao.
- Refatoracao ampla sem impacto direto neste BK.
- Trabalho de BK futuro fora da cadeia declarada.

## Como saber que isto ficou bem

- Fluxo principal de `BK-MF4-01` reproduzivel por outro colega.
- Politica de negativos cumprida para prioridade `P0`.
- Evidence documentada e pronta para auditoria de gate.

## Pre-leitura minima (10-15 min)

- `docs/RF.md` e `docs/RNF.md` (itens de `RF35, RF36, RF38, RF39`).
- `docs/planificacao/backlogs/BACKLOG-MVP.md` (linha de `BK-MF4-01`).
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` (rastreabilidade).

## Guia de execucao (passo-a-passo)

1. Definir modelo de subscricao com estados explicitos (`active`, `past_due`, `expired`, `canceled`) e datas de ciclo.
2. Implementar criacao/ativacao de plano mensal e anual com calculo correto da proxima renovacao.
3. Implementar regra de renovacao automatica e transicao de estado quando o ciclo termina.
4. Implementar gestao de subscricao no perfil (estado atual, ciclo, proxima data, acao de cancelamento).
5. Integrar guardas de acesso para bloquear conteudo premium quando a subscricao estiver expirada.
6. Atualizar evidence e preparar handoff para `BK-MF4-02`.

## Outputs esperados

- Output funcional de `BK-MF4-01` concluido sem blocker.
- Output de validacao com teste/log/captura.
- Output documental com `pr/proof/neg` para gate.

## Snippet tecnico aplicavel

```text
# pseudo-checklist BK-MF4-01
precondicoes_ok = validar_dependencias(["BK-MF2-01"])
assert precondicoes_ok == true

resultado = executar_fluxo_principal("Planos e ciclo de subscricao")
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
- [ ] Negativo 1: tentativa de ativar subscricao com plano invalido e rejeitada sem criar registo.
- [ ] Negativo 2: tentativa de aceder a conteudo premium com estado `expired` e bloqueada corretamente.
- [ ] Negativo 3: tentativa de renovar com datas inconsistentes (ciclo no passado) e rejeitada.
### Tecnico

- [ ] Metadados alinhados com BACKLOG-MVP e matriz RF/RNF.
- [ ] Criterios de aceite mensuraveis definidos com limiar claro.
- [ ] Evidence (`pr`, `proof`, `neg`) pronta para gate.

## Criterios de aceite (mensuraveis)

- Condicao: ciclo de subscricao (ativacao, renovacao, expiracao) funciona ponta-a-ponta.
- Metrica/Limiar: 100% das transicoes de estado previstas validadas por testes funcionais.
- Evidencia esperada: `proof` com tabela de estados + logs de transicao por caso.
- Condicao: controlo de acesso por estado de subscricao esta ativo.
- Metrica/Limiar: conteudo premium bloqueado em 100% dos casos `expired/past_due` definidos no teste.
- Evidencia esperada: `proof` com capturas/API response do bloqueio e do acesso valido.
- Condicao: robustez do dominio financeiro no MVP validada.
- Metrica/Limiar: 3/3 negativos obrigatorios executados com resultado previsivel e sem corrupcao de dados.
- Evidencia esperada: `neg` com requests/responses e estado final da subscricao.

## Evidence para PR/defesa

- `pr`: link de PR/commit ou referencia de entrega local.
- `proof`: 2-3 evidencias objetivas (teste, log, captura, output).
- `neg`: resumo dos cenarios negativos executados (minimo por prioridade).

## Proximo BK recomendado

`BK-MF4-02`

## Changelog

- `2026-04-13`: retrofit para contrato pedagogico v3 (objetivo especifico, pre-condicoes, outputs, snippet e proximo BK real).
