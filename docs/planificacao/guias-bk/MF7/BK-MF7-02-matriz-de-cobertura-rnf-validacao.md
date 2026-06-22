# BK-MF7-02 - Matriz de cobertura RNF -> validação

## Header

- `doc_id`: `GUIA-BK-MF7-02`
- `bk_id`: `BK-MF7-02`
- `macro`: `MF7`
- `owner`: `Davi`
- `apoio`: `Kaue`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF6-06`
- `rf_rnf`: `RNF21, RNF22, RNF23, RNF24, RNF25, RNF26, RNF32, RNF33, RNF35, RNF36, RNF38, RNF39, RNF40`
- `fase_documental`: `Fase 3`
- `sprint`: `S11`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF7-03`
- `guia_path`: `docs/planificacao/guias-bk/MF7/BK-MF7-02-matriz-de-cobertura-rnf-validacao.md`
- `last_updated`: `2026-06-22`

#### Objetivo

Neste BK vais criar a matriz final de cobertura dos RNF que ficaram atribuídos à MF7. A matriz deve provar compatibilidade, responsividade, API estável, exportações, manutenção, ética de recomendação, localização e formatos europeus.

O resultado observável é o ficheiro `docs/evidence/MF7/MATRIZ-RNF-VALIDACAO.md`, com uma linha por RNF deste BK, evidence consultada, comando ou verificação, negativos e estado final.

#### Importância

Os RNF são a diferença entre "a funcionalidade existe" e "a funcionalidade é defensável como produto". Um catálogo pode listar conteúdos, mas a defesa também precisa de compatibilidade, API consistente, privacidade, manutenção e interface em português de Portugal.

Este BK prepara a demo final para não depender apenas de navegação visual. Ele dá argumentos técnicos para explicar limitações do MVP sem inventar integrações ou maturidade operacional que não foram implementadas.

#### Scope-in

- Validar `RNF21`, `RNF22`, `RNF23`, `RNF24`, `RNF25`, `RNF26`, `RNF32`, `RNF33`, `RNF35`, `RNF36`, `RNF38`, `RNF39` e `RNF40`.
- Criar `docs/evidence/MF7/MATRIZ-RNF-VALIDACAO.md`.
- Cruzar cada RNF com evidence técnica, manual ou documental.
- Distinguir validação real, validação com ressalva, pendência e falha.
- Registar pelo menos 3 negativos para este BK P0.
- Preparar handoff para o roteiro de demo final.

#### Scope-out

- Implementar nova arquitetura de deployment.
- Trocar a stack React + Vite + Express + MongoDB.
- Criar fornecedor real de pagamentos.
- Criar serviço externo de vídeo.
- Criar sistema avançado de recomendação.
- Alterar o texto oficial dos RNF sem decisão documental.

#### Estado antes e depois

- Estado antes: `BK-MF6-06` consolidou validações técnicas e `BK-MF7-01` estruturou cobertura funcional.
- Estado antes: os RNF deste BK existem em `docs/RNF.md`, mas a evidence final da MF7 ainda não está organizada.
- Estado depois: a equipa tem uma matriz RNF com fonte, proof, negativos, estado e ressalvas.
- Estado depois: `BK-MF7-03` consegue transformar requisitos e limitações numa demo honesta.

#### Pre-requisitos

- `BK-MF6-06` revisto.
- `BK-MF7-01` criado ou em revisão.
- `docs/RNF.md` consultado para texto e prioridade dos RNF.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` consultado para confirmar atribuição dos RNF a este BK.
- `docs/evidence/MF6/` revisto para regressão, segurança, performance, UX e gate.
- `backend/package.json` e `frontend/package.json` revistos para comandos reais.

#### Glossário

- RNF: requisito não funcional de qualidade, segurança, compatibilidade, manutenção ou operação.
- Compatibilidade: capacidade de funcionar de forma previsível em ambientes suportados.
- Responsividade: adaptação da interface a tamanhos diferentes de ecrã.
- API estável: contrato HTTP consistente entre frontend e backend.
- Exportação: geração de ficheiro ou resposta consumível fora da aplicação.
- Rollback: capacidade operacional de regressar a uma versão anterior com dados protegidos.
- Ressalva: limitação conhecida, explícita e aceite na defesa.

#### Conceitos teóricos essenciais

- `CANONICO`: `RNF21..RNF26`, `RNF32`, `RNF33`, `RNF35`, `RNF36` e `RNF38..RNF40` pertencem a `BK-MF7-02` na matriz canónica.
- `CANONICO`: a política de negativos exige pelo menos 3 negativos para BK P0.
- `DERIVADO`: os RNF que dependem de serviços externos ou operação real devem ser classificados por evidence disponível, nunca por intenção.
- Compatibilidade não se prova só com uma página aberta no computador do aluno. A matriz deve indicar browsers, resoluções ou limitação de ambiente.
- API estável significa manter endpoints, payloads, códigos HTTP e mensagens previsíveis para o frontend e futuros clientes.
- Ética de recomendação, localização e formatos europeus são verificações de produto: texto, datas, filtros de catálogo e explicações têm de ser observáveis.

#### Arquitetura do BK

| Área | Entrada | Saída |
| --- | --- | --- |
| RNF | `docs/RNF.md` | Lista fechada de RNF deste BK |
| Qualidade técnica | `docs/evidence/MF6/` | Evidence reutilizada de hardening e regressão |
| Produto | rotas frontend e endpoints backend já existentes | Provas de compatibilidade, API e localização |
| Matriz final | `docs/evidence/MF7/MATRIZ-RNF-VALIDACAO.md` | Estado RNF auditável |
| Handoff | riscos e ressalvas | Base para `BK-MF7-03` |

#### Ficheiros a criar/editar/rever

- CRIAR: `docs/evidence/MF7/MATRIZ-RNF-VALIDACAO.md`
- REVER: `docs/RNF.md`
- REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- REVER: `docs/evidence/MF6/GATE-S12-MF6.md`
- REVER: `docs/evidence/MF6/BK-MF6-02-regressao-frontend.md`
- REVER: `docs/evidence/MF6/BK-MF6-03-hardening-seguranca.md`
- REVER: `docs/evidence/MF6/BK-MF6-04-performance.md`
- REVER: `docs/evidence/MF6/BK-MF6-05-acessibilidade-ux.md`
- REVER: `backend/package.json`
- REVER: `frontend/package.json`

#### Tutorial técnico linear

### Passo 1 - Confirmar RNF alvo

1. Objetivo funcional do passo no contexto da app.

Criar a lista fechada de RNF que este BK valida, mantendo o texto oficial e a prioridade original.

2. Ficheiros envolvidos:
    - REVER: `docs/RNF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - LOCALIZAÇÃO: secções de compatibilidade, manutenção, ética e localização.

3. Instruções do que fazer.

Lê cada RNF alvo em `docs/RNF.md`. Copia para a tua matriz o ID, a descrição curta, o tipo e a prioridade. Depois confirma na matriz canónica que todos pertencem a `BK-MF7-02`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. O output é a lista oficial de RNF deste BK.

5. Explicação do código.

Não há código porque o passo define o contrato de validação. A entrada é `docs/RNF.md`; a saída é a lista controlada que será testada ou justificada.

Isto evita validar requisitos errados, esquecer RNF de operação ou declarar como implementado um requisito que ainda precisa de ressalva.

6. Validação do passo.

Confirma que a lista contém exatamente 13 RNF: `RNF21`, `RNF22`, `RNF23`, `RNF24`, `RNF25`, `RNF26`, `RNF32`, `RNF33`, `RNF35`, `RNF36`, `RNF38`, `RNF39` e `RNF40`.

7. Cenário negativo/erro esperado.

Se `RNF29` aparecer nesta matriz, remove-o: regressão automatizada pertence a MF6 e só pode entrar aqui como evidence consultada.

### Passo 2 - Associar evidence a cada RNF

1. Objetivo funcional do passo no contexto da app.

Ligar cada RNF a uma prova verificável ou a uma ressalva explícita.

2. Ficheiros envolvidos:
    - CRIAR: `docs/evidence/MF7/MATRIZ-RNF-VALIDACAO.md`
    - REVER: `docs/evidence/MF6/`
    - REVER: `backend/package.json`
    - REVER: `frontend/package.json`
    - LOCALIZAÇÃO: tabela principal da matriz RNF.

3. Instruções do que fazer.

Cria a matriz com estas colunas:

| Coluna | Conteúdo esperado |
| --- | --- |
| RNF | ID do requisito |
| Tipo | categoria oficial do RNF |
| Verificação | comando, revisão manual, captura ou documento |
| Evidence | caminho do ficheiro ou referência da prova |
| Negativo | falha esperada ou limitação testada |
| Estado | `VALIDADO`, `VALIDADO_COM_RESSALVA`, `PENDENTE` ou `FALHA` |
| Decisão | explicação curta da classificação |

4. Código completo, correto e integrado com a app final.

Sem código neste passo. O artefacto criado é uma matriz Markdown.

5. Explicação do código.

A matriz RNF não precisa de implementar novos módulos. Ela precisa de mostrar que a qualidade foi verificada com critérios observáveis.

Um RNF pode usar evidence de MF6, como regressão frontend, hardening ou performance. Mesmo assim, a linha final deve explicar por que essa evidence serve para este RNF e que limite permanece.

6. Validação do passo.

Escolhe 3 RNF de categorias diferentes e confirma que cada um tem evidence, negativo e decisão. Nenhuma linha pode ficar `VALIDADO` só com opinião.

7. Cenário negativo/erro esperado.

Se `RNF32` for marcado como `VALIDADO` sem plano de rollback, script, documento operacional ou decisão do orientador, altera para `PENDENTE`.

### Passo 3 - Tratar ressalvas sem inventar maturidade

1. Objetivo funcional do passo no contexto da app.

Garantir que RNF com dependência operacional ou fornecedor externo são explicados de forma honesta no MVP.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF7/MATRIZ-RNF-VALIDACAO.md`
    - REVER: `docs/RNF.md`
    - REVER: `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
    - LOCALIZAÇÃO: linhas `RNF23`, `RNF24`, `RNF32`, `RNF33`, `RNF36` e `RNF39`.

3. Instruções do que fazer.

Para cada RNF que dependa de infraestrutura ou operação futura, escreve uma decisão objetiva. Usa `VALIDADO_COM_RESSALVA` apenas quando existe uma versão MVP demonstrável e a limitação está clara.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. O trabalho é de classificação técnica.

5. Explicação do código.

Este passo protege a defesa contra promessas excessivas. Uma PAP pode ter pagamento simulado, recomendação por regras simples e execução local, desde que a matriz não finja maturidade de produção.

A decisão deve explicar o que existe, o que não existe e que risco passa para MF8 ou para trabalho futuro.

6. Validação do passo.

Revê todas as linhas com `VALIDADO_COM_RESSALVA` e confirma que a ressalva tem impacto, owner e próxima ação.

7. Cenário negativo/erro esperado.

Se uma linha disser que há integração real sem prova de integração, a classificação deve mudar para `PENDENTE` ou `FALHA`.

### Passo 4 - Fechar negativos e preparar demo

1. Objetivo funcional do passo no contexto da app.

Transformar a matriz RNF em material direto para a demo final e para perguntas técnicas.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF7/MATRIZ-RNF-VALIDACAO.md`
    - REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-03-roteiro-de-demo-final.md`
    - LOCALIZAÇÃO: secções `Negativos consolidados`, `Ressalvas` e `Handoff`.

3. Instruções do que fazer.

Regista no final da matriz três negativos mínimos: browser/resolução não testada, RNF sem evidence e requisito com limitação não explicada. Depois escreve 5 perguntas prováveis de defesa e a linha RNF que responde a cada uma.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. O output é a secção final de validação.

5. Explicação do código.

Os negativos mostram domínio técnico: a equipa sabe distinguir "não testado", "falhou" e "validado com limitação".

O handoff para a demo é importante porque o roteiro deve mostrar algumas provas no ecrã e explicar outras de forma verbal, sem interromper a narrativa do produto.

6. Validação do passo.

Pede a outro colega para responder a uma pergunta sobre compatibilidade, uma sobre API e uma sobre localização usando apenas a matriz.

7. Cenário negativo/erro esperado.

Se o colega precisar de procurar uma justificação fora da matriz, a linha desse RNF ainda está incompleta.

#### Critérios de aceite

- A matriz contém exatamente os 13 RNF alvo.
- Cada RNF tem evidence ou ressalva objetiva.
- Pelo menos 3 negativos P0 estão registados.
- Nenhum requisito dependente de operação externa é apresentado como produção sem prova.
- As decisões técnicas distinguem `CANONICO` e `DERIVADO` no raciocínio da matriz.
- O handoff para `BK-MF7-03` indica provas a mostrar na demo e provas a explicar verbalmente.

#### Validação final

- Executar `bash scripts/validate-planificacao.sh` na raiz do projeto.
- Executar `git diff --check` na raiz do projeto.
- Rever manualmente se todos os RNF alvo têm linha e estado.
- Confirmar que as ressalvas não contradizem `docs/RNF.md`.

#### Evidence para PR/defesa

- `pr`: referência da entrega onde `docs/evidence/MF7/MATRIZ-RNF-VALIDACAO.md` foi criado.
- `proof`: matriz RNF completa, outputs de validação e capturas necessárias.
- `neg`: resolução não testada rejeitada; RNF sem evidence rejeitado; limitação não explicada reclassificada.
- `fonte`: `docs/RNF.md`, `MATRIZ-CANONICA-BK.md`, `BK-MF6-06` e evidence MF6.

#### Handoff

Este BK entrega as decisões não funcionais para a demo. `BK-MF7-03` deve escolher provas visuais e verbais a partir desta matriz, mantendo ressalvas explícitas.

#### Changelog

- `2026-06-22`: guia reescrito para matriz RNF validável, com estados, ressalvas, negativos e handoff para demo final.
