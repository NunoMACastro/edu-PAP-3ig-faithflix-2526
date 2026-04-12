# BK-MF8-04 - Empacotamento final de entrega

## Header

- doc_id: GUIA-BK-MF8-04
- bk_id: BK-MF8-04
- macro: MF8
- owner: Kaue
- apoio: Mateus
- prioridade: P1
- estado: TODO
- esforço: S
- dependências: BK-MF8-03
- rf_rnf: transversal
- last_updated: 2026-04-12

## O que vamos fazer neste BK

Neste BK vamos entregar Empacotamento final de entrega, com foco num fluxo claro e executável para alunos em contexto de PAP.
O objetivo é produzir um resultado verificável, com passos pedagógicos e checkpoints objetivos, sem assumir código consolidado para além das dependências listadas.

## Porque isto é importante

- Este BK fecha uma peça concreta da macro MF8 e reduz risco de bloqueios nos BKs seguintes.
- Uma execução guiada melhora consistência entre equipa, reduz retrabalho e acelera revisão técnica.
- A entrega deste BK contribui diretamente para os requisitos transversal definidos no backlog.
- Sem este BK bem fechado, a qualidade das evidências para sprint e defesa final fica comprometida.

## O que entra (scope)

- Entregar o objetivo central: Empacotamento final de entrega.
- Produzir artefacto verificável alinhado com transversal e com o estado atual do backlog.
- Registar evidências mínimas para revisão técnica e handoff da equipa.

## O que não entra (scope-out)

- Implementações profundas que pertencem a BKs seguintes ou paralelos.
- Refactors amplos sem relação direta com o objetivo deste BK.
- Decisões arquiteturais novas sem alinhamento com docs/RF.md, docs/RNF.md e docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md.

## Como saber que isto ficou bem

- O output do BK é observável e reproduzível por outro colega.
- As dependências BK-MF8-03 foram respeitadas sem regressão funcional óbvia.
- A equipa consegue explicar o porquê da solução e não apenas o como.

## Pre-leitura mínima (10-15 min)

- docs/planificacao/backlogs/BACKLOG-MVP.md - localizar a linha do BK-MF8-04, owner, esforço e dependências.
- docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md - rever secção da macro MF8.
- docs/planificacao/backlogs/MF-VIEWS.md - confirmar sequência recomendada na macro.
- docs/RF.md e/ou docs/RNF.md - focar os códigos transversal.

## Glossário rápido

- BK: bloco atómico de trabalho com owner único e critério de aceite.
- scope: limite do que deve entrar neste BK para manter foco e previsibilidade.
- negativo: teste de erro/acesso inválido que prova robustez da entrega.
- evidence: prova objetiva de execução (teste, screenshot, log, nota técnica).
- handoff: transferência clara para quem vai executar ou depender do BK seguinte.

## Guia de execução (passo-a-passo)

1. **Objetivo (~10 min): confirmar ponto de partida**
   - Justificação: evita iniciar trabalho com pressupostos errados sobre dependências e requisitos.
   - Como fazer: validar se BK-MF8-03 está concluído ou suficientemente estável para suportar este BK.
   - O que verificar: existe baseline claro para iniciar BK-MF8-04.

2. **Objetivo (~15 min): traduzir o requisito em tarefas pequenas**
   - Justificação: tarefas mais curtas tornam a execução pedagógica e controlável para alunos.
   - Como fazer: decompor Empacotamento final de entrega em 3 a 5 tarefas objetivas (entrada, processamento, saída, validação, evidência).
   - O que verificar: cada tarefa tem dono, definição de pronto e estimativa realista.

3. **Objetivo (~25 min): desenhar fluxo e critérios antes de implementar**
   - Justificação: desenhar antes reduz ambiguidades, retrabalho e regressões evitáveis.
   - Como fazer: descrever caminho feliz, erros esperados e limites de scope deste BK.
   - O que verificar: fluxo alinhado com transversal e sem invadir BKs adjacentes.

4. **Objetivo (~45 min): executar primeiro incremento funcional**
   - Justificação: valida cedo a direção técnica no contexto real do projeto.
   - Como fazer: implementar/produzir o mínimo funcional que demonstre valor e rastreabilidade do BK.
   - O que verificar: incremento funcional no caminho principal com evidência inicial.

5. **Objetivo (~35 min): fechar comportamentos essenciais e mensagens**
   - Justificação: BK só fica robusto quando cobre estados principais e mensagens compreensíveis.
   - Como fazer: completar estados, validações e pontos de integração previstos no escopo.
   - O que verificar: resultado coerente, previsível e entendível por quem não implementou.

6. **Objetivo (~20 min): validar negativos e estabilidade**
   - Justificação: testes negativos evitam falso sentimento de qualidade.
   - Como fazer: testar entradas inválidas, ausência de pré-condições e bloqueios esperados.
   - O que verificar: falhas controladas, mensagens claras e sem efeitos colaterais graves.

7. **Objetivo (~15 min): preparar handoff e evidência final**
   - Justificação: garante continuidade para revisão e BKs dependentes.
   - Como fazer: registar o que foi feito, o que ficou fora e qual o próximo BK recomendado.
   - O que verificar: qualquer colega consegue reproduzir e continuar o trabalho sem reunião extra.

## Snippets de código (evolução)

Neste momento este BK ainda não tem snippet consolidado; os snippets serão adicionados aqui com a evolução do projeto.

## Checklist de validação

- **Smoke**
  - O objetivo Empacotamento final de entrega pode ser demonstrado de ponta a ponta no contexto atual.
  - Não há bloqueio imediato para o BK-MF8-05.
- **Negativos**
  - Existe pelo menos 1 teste de erro/validação diretamente ligado a Empacotamento final de entrega.
  - Falhas esperadas ficam explícitas e sem comportamento ambíguo.
- **Técnico**
  - Alinhamento confirmado com transversal.
  - Evidência mínima preparada para review e defesa.

## Critérios de aceite

- BK entregue no escopo combinado e sem scope creep relevante.
- Dependências e regras do backlog respeitadas.
- Evidência mínima registada para comprovação objetiva.

## Evidence para PR/defesa

- pr: N/A (entrega local/documental nesta fase)
- proof: BK BK-MF8-04 documentado com guia pedagógico completo, alinhado com backlog e requisitos associados.
- neg: manter registo de pelo menos 1 negativo executado durante a implementação real.

## Próximo BK recomendado

BK-MF8-05
