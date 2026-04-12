# BK-MF1-02 - Estrutura base frontend por componentes

## Header

- doc_id: GUIA-BK-MF1-02
- bk_id: BK-MF1-02
- macro: MF1
- owner: Mateus
- apoio: Kaue
- prioridade: P0
- estado: TODO
- esforço: M
- dependências: BK-MF0-06
- rf_rnf: RNF28
- last_updated: 2026-04-12

## O que vamos fazer neste BK

Neste BK vamos organizar frontend em componentes reutilizáveis e estrutura de páginas consistente.
O objetivo é produzir um resultado verificável, com passos claros para alunos em início de projeto, sem assumir código prévio para além das dependências listadas.

## Porque isto é importante

- Este BK cria base concreta para os próximos itens da mesma macro, evitando bloqueios em cadeia.
- Um processo bem explicado reduz retrabalho e acelera onboarding de quem ainda está a ganhar ritmo técnico.
- A execução deste BK liga diretamente os requisitos RNF28 ao plano operacional do backlog.
- Sem este BK bem fechado, a validação de sprint fica frágil e a evidência para defesa perde qualidade.

## O que entra (scope)

- Entregar o objetivo central: Estrutura base frontend por componentes.
- Produzir artefacto verificável alinhado com RNF28 e com o estado do backlog.
- Registar evidências mínimas para revisão técnica e handoff entre colegas.

## O que não entra (scope-out)

- Implementações profundas que pertencem a BKs seguintes ou paralelos.
- Refactors amplos sem relação direta com o objetivo do BK.
- Decisões arquiteturais novas sem alinhamento com docs/RF.md, docs/RNF.md e docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md.

## Como saber que isto ficou bem

- O output do BK é observável e reproduzível por outro colega.
- As dependências BK-MF0-06 foram respeitadas sem regressão funcional óbvia.
- A equipa consegue explicar o "porquê" da solução e não apenas o "como".

## Pre-leitura mínima (10-15 min)

- docs/planificacao/backlogs/BACKLOG-MVP.md - localizar a linha do BK-MF1-02, owner, esforço e dependências.
- docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md - rever secção da macro MF1.
- docs/planificacao/backlogs/MF-VIEWS.md - confirmar sequência recomendada na macro.
- docs/RF.md e/ou docs/RNF.md - focar os códigos RNF28.

## Glossário rápido

- BK: bloco atómico de trabalho com owner único e critério de aceite.
- scope: limite do que deve entrar neste BK para manter foco e previsibilidade.
- negativo: teste de erro/acesso inválido que prova robustez da entrega.
- evidence: prova objetiva de execução (teste, screenshot, log, nota técnica).
- handoff: transferência clara para quem vai executar ou depender do BK seguinte.

## Guia de execução (passo-a-passo)

1. **Objetivo (~10 min): confirmar ponto de partida**
   - Justificação: evita começar com suposições erradas sobre dependências.
   - Como fazer: validar se BK-MF0-06 está concluído ou suficientemente estável para permitir progresso real.
   - O que verificar: existe um baseline claro para iniciar BK-MF1-02.

2. **Objetivo (~15 min): traduzir requisito para tarefas pequenas**
   - Justificação: alunos executam melhor quando o problema está quebrado em blocos simples.
   - Como fazer: decompor Estrutura base frontend por componentes em 3 a 5 tarefas objetivas (entrada, processamento, saída, validação, evidência).
   - O que verificar: cada tarefa tem dono, definição de pronto e tempo estimado.

3. **Objetivo (~25 min): desenhar fluxo e critérios antes de implementar**
   - Justificação: desenhar antes reduz idas e voltas durante a codificação.
   - Como fazer: descrever caminho feliz, erros esperados e limites do scope deste BK.
   - O que verificar: fluxo alinhado com RNF28 e sem invadir BKs seguintes.

4. **Objetivo (~45 min): executar o primeiro incremento funcional**
   - Justificação: validar cedo se a direção escolhida funciona no contexto real do projeto.
   - Como fazer: implementar/produzir o mínimo necessário para demonstrar valor do BK, mantendo simplicidade.
   - O que verificar: incremento funciona no caminho principal e já gera evidência inicial.

5. **Objetivo (~35 min): fechar comportamentos essenciais e mensagens**
   - Justificação: BK só deve ser considerado pronto quando cobre casos principais e comunicação ao utilizador/equipa.
   - Como fazer: completar estados necessários, mensagens de erro/informação e detalhes de integração.
   - O que verificar: resultado é coerente, previsível e entendível por quem não implementou.

6. **Objetivo (~20 min): validar negativos e estabilidade**
   - Justificação: sem negativos, é fácil confundir "funciona no meu caso" com qualidade real.
   - Como fazer: testar entradas inválidas, ausência de pré-condições e cenários de bloqueio esperados.
   - O que verificar: sistema falha de forma controlada e sem efeitos colaterais graves.

7. **Objetivo (~15 min): preparar handoff e evidência final**
   - Justificação: o BK seguinte depende de contexto claro e rastreável.
   - Como fazer: registar o que foi feito, o que ficou de fora e qual o próximo BK recomendado.
   - O que verificar: qualquer colega consegue retomar o trabalho sem reunião extra.

## Snippets de código (evolução)

Neste momento este BK ainda não tem snippet consolidado; os snippets serão adicionados aqui com a evolução do projeto.

## Checklist de validação

- **Smoke**
  - O objetivo Estrutura base frontend por componentes pode ser demonstrado de ponta a ponta no contexto atual.
  - Não há bloqueio imediato para o BK-MF1-03.
- **Negativos**
  - Existe pelo menos 1 teste de erro/validação diretamente ligado a Estrutura base frontend por componentes.
  - Falhas esperadas ficam explícitas e sem comportamento ambíguo.
- **Técnico**
  - Alinhamento confirmado com RNF28.
  - Evidência mínima preparada para review e defesa.

## Critérios de aceite

- BK entregue no escopo combinado e sem "scope creep" relevante.
- Dependências e regras do backlog respeitadas.
- Evidência mínima registada para comprovação objetiva.

## Evidence para PR/defesa

- pr: N/A (entrega local/documental nesta fase)
- proof: BK BK-MF1-02 documentado com guia pedagógico completo, alinhado com backlog e requisitos associados.
- neg: manter registo de pelo menos 1 negativo executado durante a implementação real.

## Próximo BK recomendado

BK-MF1-03
