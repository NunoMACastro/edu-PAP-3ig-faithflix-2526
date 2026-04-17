# BK-MF2-05 - Reproducao e continuar a ver

## Header

- `doc_id`: `GUIA-BK-MF2-05`
- `bk_id`: `BK-MF2-05`
- `macro`: `MF2`
- `owner`: `Mateus`
- `apoio`: `Matheus`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `L`
- `dependencias`: `BK-MF2-04`
- `rf_rnf`: `RF11, RF12`
- `fase_documental`: `Fase 1`
- `sprint`: `S04`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF2-06`
- `guia_path`: `docs/planificacao/guias-bk/MF2/BK-MF2-05-reproducao-continuar-a-ver.md`
- `last_updated`: `2026-04-14`

## Bloco pedagogico (obrigatorio)

### Objetivo pedagogico

- Consolidar a entrega de `Reproducao e continuar a ver` com rastreabilidade explicita para `RF11, RF12`.
- Executar o BK `BK-MF2-05` no contexto da macro `MF2` e da sprint `S04`.

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

Entregar `Reproducao e continuar a ver` cobrindo `RF11, RF12` na `MF2`, com fluxo principal verificavel e evidencia tecnica pronta para gate.

## Porque isto e importante

- Fecha capacidade critica desta macro sem criar drift de backlog.
- Reduz risco tecnico para o proximo BK da sequencia (`BK-MF2-06`).
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

- Dependencias declaradas: `BK-MF2-04`.
- Linha do BK validada em `docs/planificacao/backlogs/BACKLOG-MVP.md`.
- Mapeamento de requisito validado em `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`.

## O que entra (scope)

- Entrega funcional de `Reproducao e continuar a ver` com caminho principal completo.
- Integracao com dependencias diretas e validacao de regressao local.
- Evidence minima obrigatoria: `pr`, `proof`, `neg`.

## O que nao entra (scope-out)

- Mudanca de RF/RNF, owner, prioridade ou dependencias sem aprovacao.
- Refatoracao ampla sem impacto direto neste BK.
- Trabalho de BK futuro fora da cadeia declarada.

## Como saber que isto ficou bem

- Fluxo principal de `BK-MF2-05` reproduzivel por outro colega.
- Politica de negativos cumprida para prioridade `P0`.
- Evidence documentada e pronta para auditoria de gate.

## Pre-leitura minima (10-15 min)

- `docs/RF.md` e `docs/RNF.md` (itens de `RF11, RF12`).
- `docs/planificacao/backlogs/BACKLOG-MVP.md` (linha de `BK-MF2-05`).
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` (rastreabilidade).

## Guia de execucao (passo-a-passo)

1. Definir contratos de leitura/escrita de progresso de reproducao (inicio, pausa, retoma, fim) por `user_id + content_id`.
2. Implementar arranque de reproducao no player com validacao de permissao e estado do conteudo.
3. Persistir progresso em momentos-chave (pausa, fecho, heartbeat) para garantir `continuar a ver` fiavel.
4. Implementar retoma no ultimo timestamp valido e regra de conclusao (conteudo marcado como concluido perto do fim).
5. Cobrir o fluxo com testes de integracao FE/BE para retoma apos logout/login e apos refresh de pagina.
6. Atualizar evidence e preparar handoff para `BK-MF2-06`.

## Outputs esperados

- Output funcional de `BK-MF2-05` concluido sem blocker.
- Output de validacao com teste/log/captura.
- Output documental com `pr/proof/neg` para gate.

## Snippet tecnico aplicavel

```text
# pseudo-checklist BK-MF2-05
precondicoes_ok = validar_dependencias(["BK-MF2-04"])
assert precondicoes_ok == true

resultado = executar_fluxo_principal("Reproducao e continuar a ver")
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
- [ ] Negativo 1: tentativa de gravar progresso com timestamp invalido (negativo ou acima da duracao) e rejeitada.
- [ ] Negativo 2: tentativa de aceder/reproduzir conteudo nao publicado ou sem permissao retorna bloqueio funcional.
- [ ] Negativo 3: tentativa de atualizar progresso de outro utilizador e bloqueada por controlo de acesso.
### Tecnico

- [ ] Metadados alinhados com BACKLOG-MVP e matriz RF/RNF.
- [ ] Criterios de aceite mensuraveis definidos com limiar claro.
- [ ] Evidence (`pr`, `proof`, `neg`) pronta para gate.

## Criterios de aceite (mensuraveis)

- Condicao: reproducao e retoma funcionam ponta-a-ponta no fluxo principal.
- Metrica/Limiar: retoma abre no ultimo progresso com desvio maximo de `<=5s`.
- Evidencia esperada: `proof` com video curto/capturas antes e depois da retoma.
- Condicao: persistencia de progresso e consistente e isolada por utilizador.
- Metrica/Limiar: 100% dos testes de integracao de progresso passam sem escrita cruzada entre contas.
- Evidencia esperada: `proof` com logs/asserts de `user_id + content_id`.
- Condicao: politicas negativas e autorizacao aplicadas.
- Metrica/Limiar: 3/3 negativos obrigatorios executados com resposta previsivel.
- Evidencia esperada: `neg` com requests/responses dos cenarios de bloqueio.

## Evidence para PR/defesa

- `pr`: link de PR/commit ou referencia de entrega local.
- `proof`: 2-3 evidencias objetivas (teste, log, captura, output).
- `neg`: resumo dos cenarios negativos executados (minimo por prioridade).

## Proximo BK recomendado

`BK-MF2-06`

## Changelog

- `2026-04-13`: retrofit para contrato pedagogico v3 (objetivo especifico, pre-condicoes, outputs, snippet e proximo BK real).
