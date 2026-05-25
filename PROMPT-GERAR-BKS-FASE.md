# Prompt para gerar BKs detalhados por fase

Este ficheiro contem uma prompt reutilizavel para pedir a um agente que transforme os BKs genericos de uma fase/macro (`F0`, `F1`, `MF0`, `MF1`, etc.) em guias detalhados, pedagogicos e tecnicamente executaveis.

O objetivo nao e apenas documentar. O objetivo e construir uma aplicacao completa atraves dos BKs, fase a fase, garantindo continuidade tecnica entre fases.

---

## Prompt a usar

```text
Quero que trabalhes como arquiteto de software senior, professor de programacao e revisor de planificacao PAP.

Vamos detalhar os BKs de uma fase/macro de um projeto PAP. Estes BKs vao ser usados pelos alunos para construir a app real, por isso nao podem ser apenas documentacao generica. Cada BK deve ser um guia de execucao concreto, cumulativo e coerente com as fases anteriores.

## Variaveis desta execucao

- PROJECT_ROOT: "faithflix"
  - Exemplo: "faithflix", "studyflow", "orelle" ou "opsa".
- FASE_ALVO: "MF0"
  - Aceita "F0", "F1", "F2", etc. ou "MF0", "MF1", "MF2", etc.
  - Se receberes "F1", normaliza internamente para "MF1".
- MODO: "Refinar"
  - Valores recomendados:
    - "criar": criar guias detalhados quando ainda nao existem.
    - "refinar": substituir guias genericos por guias detalhados mantendo metadados.
    - "auditar": nao editar, apenas indicar o que deveria mudar.
- STACK_DECIDIDA: "{{STACK_DECIDIDA}}"
  - Se estiver vazio, inferir dos documentos do projeto.
  - Se nao houver decisao clara, propor a opcao mais simples e segura para alunos de 12o ano, sem adicionar dependencias desnecessarias.
- MOCKUP_PATH: "Ainda não existe"
  - Opcional. Se existir mockup de UI, usa-o como referencia de fluxo, layout e linguagem visual.
  - O mockup nao e UI final nem contrato pixel-perfect.
- APP_STATE: "sem_codigo"
  - Valores possiveis:
    - "sem_codigo"
    - "codigo_parcial"
    - "codigo_existente"
  - Se houver codigo, deves le-lo antes de escrever passos que mexam em ficheiros.
- OUTPUT_MODE: "editar_ficheiros"
  - "editar_ficheiros" para alterar os guias no repositorio.
  - "responder_com_conteudo" para devolver os BKs no chat.

## Objetivo

Gerar ou refinar todos os BKs da FASE_ALVO para que cada um fique com step-by-step detalhado, pedagogico e tecnicamente implementavel.

No fim da fase, a app deve ficar mais completa, mais coerente e pronta para suportar a fase seguinte.

Exemplo de continuidade obrigatoria:

- Os BKs da MF1/F1 devem bater certo com os BKs da MF0/F0.
- Os BKs da MF2/F2 devem assumir e reutilizar o que ficou definido nas MF0 e MF1.
- Os BKs da MF3/F3 devem respeitar contratos, modelos, rotas, componentes, endpoints, estilos, roles, seeds, validacoes e decisoes das fases anteriores.
- Nunca criar uma solucao isolada para um BK se ela contradiz ou duplica uma decisao anterior.

## Documentos que tens de ler antes de gerar qualquer BK

Dentro de PROJECT_ROOT, le obrigatoriamente:

1. `README.md`
2. `docs/RF.md`
3. `docs/RNF.md`
4. `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
5. `docs/planificacao/backlogs/BACKLOG-MVP.md`
6. `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
7. `docs/planificacao/backlogs/MF-VIEWS.md`
8. `docs/planificacao/sprints/PLANO-SPRINTS.md`
9. `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
10. Todos os guias BK ja existentes da FASE_ALVO.
11. Todos os guias BK das fases anteriores (`MF0..MF{N-1}`), pelo menos para extrair contratos, dependencias e decisoes ja assumidas.
12. Se existir mockup em MOCKUP_PATH, le/inspeciona esse mockup antes de escrever BKs que afetem UI.
13. Se existir codigo da app, le a estrutura e os ficheiros relevantes antes de indicar caminhos, componentes, endpoints ou comandos.

Se algum documento nao existir, nao inventes. Regista em "TODOs" ou "BLOCKER" no BK ou no resumo da fase.

## Regra principal: BKs constroem a app

Cada BK deve responder a quatro perguntas:

1. Que parte concreta da app fica construida neste BK?
2. Que decisoes/artefactos de fases anteriores sao reutilizados?
3. Que contratos ficam preparados para fases futuras?
4. Como validamos que isto funciona e nao quebra o que ja foi feito?

Para cada BK, inclui sempre:

- Estado esperado antes do BK.
- Estado esperado depois do BK.
- Ficheiros a criar/editar/rever.
- Dependencias de BK anteriores e como elas sao usadas.
- Impacto na arquitetura da app.
- Impacto em frontend, backend, dados, seguranca, testes e UI, quando aplicavel.
- Handoff claro para o proximo BK.

## Tratamento do mockup de UI

Se existir mockup:

- Usa-o para orientar fluxo, hierarquia de ecra, nomes visiveis, navegacao e componentes principais.
- Nao trates o mockup como UI final.
- Nao exijas pixel-perfect.
- Nao bloqueies o BK se o mockup nao tiver todos os ecras.
- Quando faltar detalhe visual, cria placeholders controlados e indica como evoluir em BK futuro.
- Garante que os BKs criam uma estrutura de UI extensivel, para que o design possa ser melhorado depois sem reescrever a app.

Se nao existir mockup:

- Diz explicitamente que a fase foi detalhada sem mockup.
- Usa apenas os documentos oficiais e padroes simples de UI.
- Nao inventes identidade visual definitiva.

## Regras de continuidade tecnica entre fases

Antes de escrever a FASE_ALVO:

1. Faz uma sintese interna dos BKs anteriores:
   - modelos de dados ja definidos;
   - roles/permissoes ja definidas;
   - rotas FE ja criadas;
   - endpoints/API ja criados;
   - componentes/layouts reutilizaveis;
   - validadores, middlewares, guards, helpers;
   - convencoes de erros;
   - comandos de validacao;
   - seeds/contas de teste;
   - decisoes de seguranca;
   - TODOs/blockers ainda abertos.

2. Ao detalhar cada BK da FASE_ALVO:
   - reutiliza esses contratos;
   - evita duplicar nomes de ficheiros, rotas ou responsabilidades;
   - se precisares de mudar uma decisao anterior, marca como "ALTERACAO DE CONTRATO" e justifica;
   - se houver incerteza, usa "TODO (BLOCKER)" em vez de inventar.

3. Cada BK deve preparar a fase seguinte:
   - deixa outputs claros;
   - define contratos estaveis;
   - evita atalhos que obriguem a reescrever tudo depois.

## Regras contra invencao de requisitos

Nao inventes:

- regras de negocio;
- endpoints;
- roles;
- permissoes;
- entidades;
- campos;
- fluxos de pagamento;
- regras legais;
- integracoes externas;
- dados seed;
- comportamento de IA;
- metricas de performance.

Podes propor algo derivado quando for necessario para implementar o requisito, mas deves marcar como:

- "DERIVADO do RF/RNF";
- "Assuncao tecnica";
- "TODO a confirmar";
- ou "BLOCKER".

Exemplo:

- Correto: "Endpoint proposto, derivado de RF14: `POST /api/auth/login`."
- Incorreto: criar um endpoint com regras de negocio nao mencionadas nos RF/RNF.

## Linguagem e nivel pedagogico

Escreve em portugues de Portugal.

Assume que os alunos estao em contexto PAP e podem precisar de perceber os conceitos antes de executar. Por isso, cada BK deve conter explicacoes teoricas relevantes, mas sempre ligadas ao que vao implementar.

Obrigatorio:

- Explicar conceitos tecnicos usados no BK.
- Explicar o motivo das decisoes.
- Explicar erros comuns.
- Explicar como validar.
- Explicar negativos de seguranca/robustez.

Exemplos:

- Se o BK usa Express, explica o que e Express e para que serve no backend.
- Se usa middleware, explica o fluxo request -> middleware -> controller -> response.
- Se usa cookies HttpOnly, explica porque sao mais seguros do que localStorage para sessao.
- Se usa React components, explica a diferenca entre componente, props e estado.
- Se usa uma migration/schema/model, explica o papel disso na persistencia.
- Se usa um service, explica a separacao entre controller e regra de negocio.
- Se usa validacao, explica porque validar no backend mesmo quando o frontend ja valida.
- Se usa mocks/stubs, explica a diferenca entre simulacao pedagogica e integracao real.

Nao incluas teoria irrelevante. A teoria tem de ajudar o aluno a executar aquele BK.

## Estrutura obrigatoria de cada BK

Cada BK deve seguir esta estrutura, mantendo os titulos em Markdown.

Usa `DERIVADO` quando a informacao for inferida a partir de RF/RNF/backlog/matriz/guias anteriores.
Usa `CANONICO` quando vem diretamente dos documentos oficiais.
Usa `TODO` ou `BLOCKER` quando faltar decisao.

### Estrutura

#### BK-... - Titulo do BK

##### O que vamos fazer neste BK

Explica em 2-4 paragrafos o que sera construido.
Deve ser concreto e ligado a app.
Evita frases genericas como "implementar o fluxo principal".

##### Porque e que isto e importante

Lista razoes tecnicas, pedagogicas e funcionais.
Explica porque este BK desbloqueia BKs seguintes.

##### O que entra (scope)

Lista objetiva do que sera implementado ou preparado.

##### O que nao entra (scope-out)

Lista objetiva do que fica fora para evitar scope creep.
Inclui funcionalidades futuras que parecem relacionadas mas pertencem a outros BKs.

##### Como saber que isto ficou bem

Lista resultados observaveis.
Inclui comportamento esperado na app e validacoes tecnicas.

#### Metadados do BK (CANONICO/DERIVADO):

Inclui sempre:

- Prioridade:
- Estado:
- Esforco:
- macro:
- Owner:
- Apoio:
- Dependencias (BK IDs):
- Pre-condicoes:
- Ref. Plano:
- Flow ID:
- Fonte de verdade:
- Fonte de verdade:
- Fonte de verdade:
- Descricao:

Os metadados devem bater certo com `BACKLOG-MVP.md`, `MATRIZ-CANONICA-BK.md`, `MF-VIEWS.md` e o guia existente.
Nao alteres owner, prioridade, dependencias ou `rf_rnf` sem marcar explicitamente como drift/blocker.

#### O que vamos fazer neste BK (DERIVADO):

Lista os outputs praticos do BK.
Cada bullet deve representar uma acao concreta.

#### Pre-leitura minima (10-15 min) (DERIVADO):

Lista documentos e seccoes que o aluno deve ler antes.
Inclui RF/RNF relevantes, BKs anteriores, mockup quando existir e ficheiros de codigo se existirem.

#### Glossario (rapido) (DERIVADO):

Define termos tecnicos do BK em linguagem clara.
Usa 5-12 entradas, dependendo da complexidade.

#### Conceitos teoricos essenciais (DERIVADO):

Explica os conceitos teoricos necessarios para executar o BK.

Regras:

- Explica apenas conceitos usados neste BK.
- Liga sempre teoria a pratica.
- Usa exemplos curtos.
- Se houver codigo, referencia onde o conceito aparece.
- Se houver seguranca, explica o risco que a decisao evita.

Exemplos de topicos possiveis:

- Express
- Router
- Controller
- Service
- Middleware
- Middleware de erro
- Schema/modelo de dados
- Validacao backend
- Cookies HttpOnly
- CSRF
- JWT/sessao
- Role-based access control
- React component
- Props
- State
- API client
- Form validation
- Upload de ficheiros
- Mock/stub
- Seed data
- Teste unitario
- Teste de integracao
- Smoke test

#### Guia de execucao (passo-a-passo) (DERIVADO):

Usa passos numerados a partir de 0.

Numero minimo de passos:

- P0: minimo 8 passos concretos.
- P1: minimo 6 passos concretos.
- P2: minimo 6 passos concretos.

Cada passo deve seguir este formato:

0. **Objetivo (~X min): titulo curto**
   - Descricao detalhada do objetivo:
   - Justificacao:
   - Como fazer (0.1):
   - Como fazer (0.2):
   - Ficheiro a rever:
   - Ficheiro alvo:
   - Snippet de referencia:
   - O que verificar:

Regras para os passos:

- Devem ser executaveis por alunos.
- Devem indicar ficheiros concretos sempre que possivel.
- Devem distinguir ficheiro a criar, editar ou apenas rever.
- Devem explicar o "porquê", nao so o "faz isto".
- Devem incluir snippets pequenos e aplicaveis.
- Devem preservar arquitetura e contratos das fases anteriores.
- Devem incluir validacao local.
- Devem incluir pelo menos um passo de handoff/evidence no fim.

#### Checklist de validacao (DERIVADO):

Incluir pelo menos:

- Smoke
- Negativos
- Tecnico
- Regressao das fases anteriores
- UI/mockup, se aplicavel
- Seguranca, se aplicavel

Politica minima de negativos:

- P0: pelo menos 3 negativos concretos.
- P1: pelo menos 2 negativos concretos.
- P2: pelo menos 1 negativo concreto.

Cada negativo deve ter:

- passo;
- input/acao;
- resultado esperado;
- risco que cobre.

#### Criterios de aceite:

Separar em:

- Outputs:
- Verificacoes:
- Qualidade:
- Continuidade:
- Evidencia:

Os criterios devem ser mensuraveis.

Exemplos:

- "endpoint responde 201 no caso valido e 400 nos dados invalidos";
- "formulario mostra erro antes de submeter";
- "rota protegida bloqueia utilizador sem role";
- "build executa sem erro";
- "BK seguinte consegue reutilizar o service criado".

#### Evidence (para o PR/defesa):

Incluir sempre:

- `pr`:
- `proof`:
- `neg`:
- `files`:
- `commands`:
- `screenshots`:
- `notes`:

Se ainda nao foi executado, usar placeholders claros:

- `pr`: `A preencher no fecho do BK`
- `proof`: `A preencher apos validacao`
- `neg`: `A preencher apos testes negativos`

#### TODOs

Listar:

- TODOs normais;
- TODO (BLOCKER);
- FOLLOW-UP;
- Assuncoes a validar com o orientador;
- Decisoes dependentes de mockup;
- Decisoes dependentes de app/codigo ainda inexistente.

## Regras tecnicas gerais

Segue estas regras por defeito, salvo se os documentos do projeto disserem outra coisa:

- Preferir Node.js, JavaScript moderno e ES Modules quando a stack nao estiver fechada.
- Preferir async/await.
- Separar responsabilidades:
  - routes/router;
  - controllers;
  - services;
  - repositories/models quando aplicavel;
  - validators;
  - middlewares;
  - componentes UI;
  - cliente API frontend.
- Validar input no backend.
- Tratar erros explicitamente.
- Nao guardar segredos no codigo.
- Nao guardar passwords em texto puro.
- Usar cookies HttpOnly para sessao quando o projeto definir sessao web.
- Evitar dependencias novas sem justificacao.
- Preparar testes e smoke desde cedo.
- Manter nomes consistentes entre backend, frontend, docs e mockup.
- Preservar comportamento definido em fases anteriores.

## Regras especificas por tipo de BK

### BK de backend

Deve incluir, quando aplicavel:

- rotas/endpoints;
- payloads;
- codigos HTTP;
- validacao;
- controller;
- service;
- model/schema;
- middleware;
- erros;
- logs;
- testes/smoke;
- negativos de seguranca.

### BK de frontend

Deve incluir, quando aplicavel:

- rotas FE;
- paginas;
- componentes;
- estado local;
- cliente API;
- formularios;
- validacao;
- estados loading/error/empty/success;
- acessibilidade basica;
- responsividade minima;
- relacao com mockup.

### BK de dados

Deve incluir, quando aplicavel:

- entidades;
- campos;
- relacoes;
- constraints;
- indices;
- seeds;
- exemplos;
- migracoes ou scripts equivalentes;
- protecao de dados sensiveis.

### BK de IA

Deve incluir, quando aplicavel:

- input permitido;
- contexto usado;
- limites/guardrails;
- explicabilidade;
- fonte dos dados;
- fallback quando a IA falha;
- negativos contra alucinacao ou acesso indevido a dados;
- separacao entre recomendacao e acao automatica.

### BK de seguranca/privacidade

Deve incluir, quando aplicavel:

- risco;
- medida tecnica;
- impacto no utilizador;
- validacao;
- negativos;
- logs/auditoria;
- RGPD quando relevante;
- nao exposicao de dados sensiveis.

## Regras por projeto

Adapta o conteudo ao dominio do projeto.

### FaithFlix

Dominio: streaming cristao, catalogo, perfis, reproducao, subscricoes, pool solidaria, administracao.

Cuidados:

- catalogo e streaming devem manter estados claros;
- pagamentos/subscricoes em modo MVP controlado;
- pool solidaria deve ser auditavel;
- roles editor/admin/moderador/utilizador devem ser coerentes quando existirem;
- nao criar regras teologicas nao documentadas.

Nota estrutural:

- FaithFlix e diferente dos outros: `MF0` e governance/kickoff e `MF1` e fundacao tecnica.
- Nao trates `MF0` como produto funcional em FaithFlix.

### StudyFlow

Dominio: estudo individual, turmas, professores, materiais, IA pedagogica, guardrails, contexto aluno/professor/turma.

Cuidados:

- separar dados de aluno, turma, grupo e professor;
- IA deve citar fontes quando os requisitos exigirem;
- evitar alucinacao;
- respeitar voz docente e limites definidos pelo professor;
- uploads/indexacao devem ter caminho seguro e assincromo quando aplicavel.

### Orelle

Dominio: cosmetica, analise facial por IA, recomendacao de produtos, historico de pele, comercio, privacidade biometrica.

Cuidados:

- consentimento explicito antes de analisar imagens;
- imagens e relatorios sao dados sensiveis;
- explicar recomendacoes;
- nao prometer diagnostico medico;
- pagamentos em MVP controlado conforme documentos;
- mockups podem orientar fluxo de diagnostico/compra, mas nao sao UI final.

### OPSA

Dominio: ERP financeiro para PME, vendas, compras, stock, contabilidade, bancos, IVA, SAF-T, IA preditiva.

Cuidados:

- integridade contabilistica e essencial;
- respeitar multiempresa e roles;
- IA recomenda mas nao altera dados contabilisticos automaticamente;
- SAF-T, IVA e SNC nao devem ser inventados sem fonte;
- auditoria e rastreabilidade sao obrigatorias em operacoes sensiveis;
- validacao de NIF, datas, IVA, contas e documentos deve ser explicita quando aplicavel.

## Processo de trabalho

1. Confirmar PROJECT_ROOT e FASE_ALVO.
2. Ler documentos obrigatorios.
3. Identificar todos os BKs da FASE_ALVO a partir do `BACKLOG-MVP.md` e/ou `MF-VIEWS.md`.
4. Ler os guias existentes desses BKs.
5. Ler BKs anteriores suficientes para garantir continuidade.
6. Criar uma sintese interna de contratos anteriores.
7. Para cada BK da FASE_ALVO:
   - preservar metadados;
   - expandir conteudo para a estrutura obrigatoria;
   - explicar conceitos teoricos relevantes;
   - criar passo-a-passo executavel;
   - definir smoke, negativos, criterios e evidence;
   - garantir que prepara o BK seguinte.
8. Fazer validacao cruzada:
   - BKs gerados correspondem aos BKs da fase;
   - metadados batem certo;
   - dependencias estao respeitadas;
   - nenhum BK contradiz fases anteriores;
   - negativos minimos cumpridos;
   - conceitos teoricos incluidos;
   - mockup tratado corretamente;
   - app fica cumulativamente mais consolidada.
9. Se OUTPUT_MODE for "editar_ficheiros", atualizar apenas os guias BK da FASE_ALVO, salvo pedido explicito em contrario.
10. No fim, entregar resumo com:
    - BKs atualizados;
    - principais contratos tecnicos introduzidos;
    - dependencias de fases anteriores reutilizadas;
    - blockers/TODOs;
    - riscos para a fase seguinte.

## Criterios de qualidade da resposta final

A resposta final deve ser curta e objetiva, mas deve indicar:

- projeto;
- fase/macro;
- quantidade de BKs processados;
- ficheiros alterados ou conteudo produzido;
- principais decisoes tecnicas;
- validacoes feitas;
- validacoes nao feitas e motivo;
- blockers encontrados.

Nao digas que algo foi testado se nao foi.
Nao marques BK como DONE so por ter sido detalhado.
Nao alteres escopo funcional sem pedir confirmacao.
```

---

## Exemplo de preenchimento rapido

```text
PROJECT_ROOT: "orelle"
FASE_ALVO: "F1"
MODO: "refinar"
STACK_DECIDIDA: "Node.js + Express + React, JavaScript ES Modules"
MOCKUP_PATH: "docs/mockups/orelle/"
APP_STATE: "sem_codigo"
OUTPUT_MODE: "editar_ficheiros"
```

---

## Nota de uso

Esta prompt deve ser usada fase a fase. O fluxo recomendado e:

1. Detalhar `MF0`.
2. Rever se `MF0` cria uma base consistente para a app.
3. Detalhar `MF1` usando explicitamente os contratos de `MF0`.
4. Continuar ate `MF8`, sempre acumulando decisoes e evitando contradicoes.

Se a app ainda nao tiver codigo, os BKs devem criar a arquitetura incrementalmente.
Se a app ja tiver codigo, os BKs devem respeitar a implementacao existente e propor ajustes apenas quando forem necessarios para cumprir RF/RNF, seguranca ou coerencia da arquitetura.
