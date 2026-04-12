# BK-XXXX - Título do BK

## Header

- `doc_id`: `GUIA-BK-XXXX`
- `bk_id`: `BK-XXXX`
- `macro`: `MFX`
- `owner`: `A definir`
- `apoio`: `A definir`
- `prioridade`: `P0|P1|P2`
- `estado`: `TODO|IN_PROGRESS|DONE|BLOCKED`
- `esforço`: `S|M|L`
- `dependências`: `BK-...`
- `rf_rnf`: `RFxx/RNFxx/transversal`
- `last_updated`: `YYYY-MM-DD`

## O que vamos fazer neste BK

Descrever em 1-2 parágrafos o objetivo concreto do BK, com linguagem simples para alunos.

## Porque isto é importante

- Explicar impacto direto no produto.
- Explicar impacto na arquitetura e no trabalho dos BK seguintes.
- Explicar o risco de não fazer este BK corretamente.

## O que entra (scope)

- Entregável 1.
- Entregável 2.
- Entregável 3.

## O que não entra (scope-out)

- Atividade que pertence a outro BK.
- Atividade que depende de requisito ainda não atacado.

## Como saber que isto ficou bem

- Critério observável 1.
- Critério observável 2.
- Critério observável 3.

## Pre-leitura mínima (10-15 min)

- `docs/RF.md` (requisitos relevantes).
- `docs/RNF.md` (restrições de qualidade relevantes).
- `docs/planificacao/backlogs/BACKLOG-MVP.md` (linha do BK e dependências).

## Glossário rápido

- `termo 1`: definição curta.
- `termo 2`: definição curta.
- `termo 3`: definição curta.

## Guia de execução (passo-a-passo)

1. **Objetivo (~10 min): validar contexto e dependências**
   - Justificação: evita implementar em cima de base incompleta.
   - Como fazer: confirmar BKs dependentes, RF/RNF e artefactos existentes.
   - O que verificar: dependências desbloqueadas e critério de entrada claro.

2. **Objetivo (~20 min): detalhar desenho da solução**
   - Justificação: reduz retrabalho e ambiguidades na implementação.
   - Como fazer: listar entradas, saídas, regras e pontos de validação.
   - O que verificar: desenho coerente com RF/RNF e sem conflito com outros BKs.

3. **Objetivo (~45 min): implementar primeiro incremento**
   - Justificação: entregar valor cedo e validar direção técnica.
   - Como fazer: construir a parte mínima funcional do BK.
   - O que verificar: incremento funcional e sem quebrar fluxos existentes.

4. **Objetivo (~45 min): completar o BK com casos principais**
   - Justificação: cobrir o caminho feliz de ponta a ponta.
   - Como fazer: fechar regras principais, mensagens e estados esperados.
   - O que verificar: comportamento aderente ao requisito funcional.

5. **Objetivo (~20 min): validar erros e negativos**
   - Justificação: evitar falsos positivos de qualidade.
   - Como fazer: testar acessos inválidos, dados inválidos e bloqueios esperados.
   - O que verificar: erros claros, previsíveis e rastreáveis.

6. **Objetivo (~15 min): consolidar evidência e handoff**
   - Justificação: facilitar revisão, avaliação e defesa da PAP.
   - Como fazer: registar evidências mínimas e atualizar estado do BK.
   - O que verificar: qualquer colega consegue reproduzir resultados.

## Snippets de código (evolução)

Neste momento este BK ainda não tem snippet consolidado; os snippets serão adicionados aqui com a evolução do projeto.

## Checklist de validação

- **Smoke**
  - Fluxo principal do BK executa sem erro.
  - Integração com dependências diretas válida.
- **Negativos**
  - Cenários inválidos bloqueados com mensagem clara.
  - Estado do sistema mantém consistência após erro.
- **Técnico**
  - Sem regressão óbvia nos fluxos já entregues.
  - Evidências prontas para revisão.

## Critérios de aceite

- Entregável principal do BK concluído conforme backlog.
- Dependências respeitadas e sem contradizer RF/RNF.
- Evidência mínima anexada (captura, log, nota técnica ou teste).

## Evidence para PR/defesa

- `pr`: `N/A (documentação/implementação local)`
- `proof`: resumo objetivo do que foi validado.
- `neg`: pelo menos 1 negativo relevante com resultado.

## Próximo BK recomendado

`BK-XXXX` (ajustar conforme sequência/dependências reais).
