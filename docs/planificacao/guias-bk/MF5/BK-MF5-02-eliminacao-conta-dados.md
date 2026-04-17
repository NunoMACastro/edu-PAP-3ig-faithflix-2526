# BK-MF5-02 - Eliminacao de conta e dados

## Header

- `doc_id`: `GUIA-BK-MF5-02`
- `bk_id`: `BK-MF5-02`
- `macro`: `MF5`
- `owner`: `Matheus`
- `apoio`: `Kaue`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF5-01`
- `rf_rnf`: `RF56`
- `fase_documental`: `Fase 1`
- `sprint`: `S09`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF5-03`
- `guia_path`: `docs/planificacao/guias-bk/MF5/BK-MF5-02-eliminacao-conta-dados.md`
- `last_updated`: `2026-04-14`

## Bloco pedagogico (obrigatorio)

### Objetivo pedagogico

- Consolidar a entrega de `Eliminacao de conta e dados` com rastreabilidade explicita para `RF56`.
- Executar o BK `BK-MF5-02` no contexto da macro `MF5` e da sprint `S09`.

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

Entregar `Eliminacao de conta e dados` cobrindo `RF56` na `MF5`, com fluxo principal verificavel e evidencia tecnica pronta para gate.

## Porque isto e importante

- Fecha capacidade critica desta macro sem criar drift de backlog.
- Reduz risco tecnico para o proximo BK da sequencia (`BK-MF5-03`).
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

- Dependencias declaradas: `BK-MF5-01`.
- Linha do BK validada em `docs/planificacao/backlogs/BACKLOG-MVP.md`.
- Mapeamento de requisito validado em `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`.

## O que entra (scope)

- Entrega funcional de `Eliminacao de conta e dados` com caminho principal completo.
- Integracao com dependencias diretas e validacao de regressao local.
- Evidence minima obrigatoria: `pr`, `proof`, `neg`.

## O que nao entra (scope-out)

- Mudanca de RF/RNF, owner, prioridade ou dependencias sem aprovacao.
- Refatoracao ampla sem impacto direto neste BK.
- Trabalho de BK futuro fora da cadeia declarada.

## Como saber que isto ficou bem

- Fluxo principal de `BK-MF5-02` reproduzivel por outro colega.
- Politica de negativos cumprida para prioridade `P0`.
- Evidence documentada e pronta para auditoria de gate.

## Pre-leitura minima (10-15 min)

- `docs/RF.md` e `docs/RNF.md` (itens de `RF56`).
- `docs/planificacao/backlogs/BACKLOG-MVP.md` (linha de `BK-MF5-02`).
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` (rastreabilidade).

## Guia de execucao (passo-a-passo)

1. Definir fluxo de eliminacao com dupla confirmacao (sessao autenticada + confirmacao explicita da operacao).
2. Implementar revogacao imediata de sessao/tokens apos pedido de eliminacao confirmado.
3. Implementar rotina de eliminacao/anonymizacao de dados pessoais nas entidades dependentes do utilizador.
4. Preservar apenas dados tecnicos estritamente necessarios para auditoria minima, sem identificadores pessoais diretos.
5. Validar que o utilizador eliminado deixa de aparecer em consultas funcionais (perfil, favoritos, historico, comentarios).
6. Atualizar evidence e preparar handoff para `BK-MF5-03`.

## Outputs esperados

- Output funcional de `BK-MF5-02` concluido sem blocker.
- Output de validacao com teste/log/captura.
- Output documental com `pr/proof/neg` para gate.

## Snippet tecnico aplicavel

```text
# pseudo-checklist BK-MF5-02
precondicoes_ok = validar_dependencias(["BK-MF5-01"])
assert precondicoes_ok == true

resultado = executar_fluxo_principal("Eliminacao de conta e dados")
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
- [ ] Negativo 1: tentativa de eliminar conta com credenciais de confirmacao invalidas e rejeitada.
- [ ] Negativo 2: tentativa de eliminar conta de outro utilizador e bloqueada por autorizacao.
- [ ] Negativo 3: segunda tentativa sobre conta ja eliminada retorna estado funcional controlado (sem falha interna).
### Tecnico

- [ ] Metadados alinhados com BACKLOG-MVP e matriz RF/RNF.
- [ ] Criterios de aceite mensuraveis definidos com limiar claro.
- [ ] Evidence (`pr`, `proof`, `neg`) pronta para gate.

## Criterios de aceite (mensuraveis)

- Condicao: eliminacao de conta executa ponta-a-ponta com revogacao de acesso.
- Metrica/Limiar: apos eliminacao, 100% dos pedidos autenticados do utilizador devolvem nao autorizado.
- Evidencia esperada: `proof` com sequencia antes/depois da eliminacao.
- Condicao: dados pessoais deixam de estar disponiveis nos modulos funcionais da app.
- Metrica/Limiar: 0 registos pessoais visiveis nas consultas de perfil/favoritos/historico apos o processo.
- Evidencia esperada: `proof` com consultas de verificacao e respetivo resultado.
- Condicao: resiliencia e seguranca do fluxo RGPD.
- Metrica/Limiar: 3/3 negativos obrigatorios executados com resultado previsivel e sem erro 500.
- Evidencia esperada: `neg` com cenarios, resposta de API e estado final dos dados.

## Evidence para PR/defesa

- `pr`: link de PR/commit ou referencia de entrega local.
- `proof`: 2-3 evidencias objetivas (teste, log, captura, output).
- `neg`: resumo dos cenarios negativos executados (minimo por prioridade).

## Proximo BK recomendado

`BK-MF5-03`

## Changelog

- `2026-04-13`: retrofit para contrato pedagogico v3 (objetivo especifico, pre-condicoes, outputs, snippet e proximo BK real).
