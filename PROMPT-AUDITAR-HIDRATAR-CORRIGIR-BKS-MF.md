# FaithFlix - Prompt final para auditoria, hidratacao e correcao de guias BK

Estas no repositorio FaithFlix.

Trabalha como arquiteto de software senior, professor de programacao e revisor de planificacao PAP.

O objetivo desta prompt e auditar, hidratar e corrigir guias BK de uma macrofase (`MF`) para que os alunos consigam construir a aplicacao real, passo a passo, sem adivinhar contratos tecnicos em falta.

## Variaveis desta execucao

```md
MF_ALVO: MF2
MODO: auditar_apenas
```

Valores possiveis para `MODO`:

- `auditar_apenas`: cria ou atualiza o relatorio, mas nao edita BKs.
- `hidratar_corrigir`: audita primeiro, depois corrige e reescreve BKs incompletos da `MF_ALVO`.
- `corrigir_apenas`: usa relatorio existente e corrige apenas BKs ja marcados como `PARCIAL` ou `CRITICO`.

## Contexto canonico desta PAP

Projeto: `FaithFlix`.

Dominio: plataforma de streaming cristao com catalogo curado, experiencia de visualizacao, perfis, favoritos/watchlist/historico, pesquisa, recomendacao baseline, subscricoes, pool solidaria de associacoes, notificacoes, privacidade, administracao e evidencias PAP.

Equipa: `Matheus`, `Kaue`, `Davi`, `Mateus`.

Orientacao: `Nuno` e `Claudia`.

Macro fases canonicas:

- `MF0`: kickoff e governance. Nao cria backend, frontend, base de dados, catalogo, streaming, endpoints ou componentes reais.
- `MF1`: fundacao tecnica. Base backend, base frontend, cliente API, sessao segura, health/logging e smoke tests.
- `MF2`: core streaming MVP. Identidade, perfis, catalogo, detalhe, reproducao, continuar a ver, legendas/audio/parental/qualidade, favoritos/watchlist/historico e E2E principal.
- `MF3`: descoberta, comunidade e recomendacao. Ratings, comentarios, pesquisa, filtros, carrosseis, relacionados, recomendacao baseline e explicabilidade.
- `MF4`: monetizacao solidaria. Planos, subscricoes, pagamentos simulados/trial, candidaturas, aprovacao, pool solidaria, distribuicao mensal, relatorios e notificacoes.
- `MF5`: operacao e privacidade. Exportacao de dados, eliminacao de conta, consentimentos, gestao de utilizadores, metricas e integracoes admin.
- `MF6`: hardening. Regressao backend/frontend, seguranca, privacidade, performance, acessibilidade e validacao tecnica final.
- `MF7`: evidencias PAP. Matrizes de cobertura, roteiro de demo, ensaio tecnico e feedback do orientador.
- `MF8`: buffer e fecho. Riscos residuais, bugs bloqueantes, scope freeze, empacotamento final e retro.

## Regra critica sobre codigo existente

O codigo existente no repositorio pode ser scaffold inicial, mockup exportado ou resolucao parcial dos alunos.

Nesta execucao:

- Nao uses `backend/`, `mockup/`, `frontend/`, `apps/`, `server/` ou `client/` como contrato tecnico final sem validar contra documentacao canonica e BKs anteriores ja corrigidos.
- Trata `mockup/` como referencia visual e de fluxo, nao como app final nem fonte de regras de negocio.
- Trata `backend/` como codigo real apenas depois de verificares que bate certo com BKs anteriores e documentacao canonica.
- Se o codigo real divergir dos BKs ou da documentacao, regista como drift ou blocker no relatorio.
- Nao copies padroes, imports, DTOs, services, schemas ou componentes de codigo parcial como se estivessem certos.
- Nos BKs destinados aos alunos, nao escrevas frases sobre auditoria interna, scaffold parcial, hidratacao, codigo por corrigir ou conversa interna.

Fonte de verdade por ordem:

1. Documentos canonicos da PAP.
2. BKs anteriores ja corrigidos e coerentes.
3. Relatorio de auditoria existente.
4. Codigo real, apenas quando validado contra os pontos anteriores.

## Objetivo

Melhorar todos os guias BK da `MF_ALVO` para que fiquem tutoriais guiados, autocontidos, pedagogicos e tecnicamente coerentes para alunos do 12.o ano.

Cada BK deve permitir ao aluno implementar o requisito sem depender de adivinhacao, pseudo-codigo, helpers por criar, snippets incompletos ou explicacoes fora do proprio BK.

No fim, os BKs da macrofase devem formar uma sequencia coerente da aplicacao FaithFlix, sem:

- imports partidos;
- endpoints contraditorios;
- schemas ou modelos incompativeis;
- regras de ownership, roles ou autorizacao incompletas;
- codigo solto;
- linguagem interna;
- funcionalidades prometidas mas nao implementadas;
- conflitos entre frontend e backend;
- drift entre backlog, matriz, plano de sprints e guias.

## Documentos obrigatorios a consultar antes de editar

Le obrigatoriamente:

- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/README.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/MATRIZ-RF-RNF-POR-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/sprints/SCORECARD-SPRINTS.md`
- `docs/planificacao/sprints/SCORECARD-OFICIAL-POR-SPRINT.md`
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- `GLOSSARIO-TERMOS-TECNICOS-PAP.md`, se existir e for relevante para termos tecnicos.
- todos os BKs em `docs/planificacao/guias-bk/MF0/` e `docs/planificacao/guias-bk/MF1/`
- todos os BKs da `MF_ALVO`
- todos os BKs das macrofases anteriores a `MF_ALVO`
- BKs posteriores que dependam de BKs da `MF_ALVO`
- relatorios existentes `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF*.md`, quando existirem.

Usa os BKs ja hidratados da `MF1` como referencia minima de qualidade tecnica para BKs de implementacao. Usa os BKs da `MF1` como referencia para BKs documentais e de governance.

Se algum documento obrigatorio nao existir, nao inventes. Regista `TODO (BLOCKER)` no relatorio e explica o impacto.

## Regra de fundamentacao documental por BK

Antes de escrever teoria, arquitetura ou codigo de cada BK, consulta a documentacao canonica relevante para o dominio desse BK.

Para cada BK, consulta no minimo:

- RF/RNF associados no header do BK.
- BKs declarados em `dependencias`.
- BK anterior e BK seguinte na sequencia.
- BKs posteriores que dependem deste BK.
- `BACKLOG-MVP.md`.
- `MATRIZ-CANONICA-BK.md`.
- `MATRIZ-RF-RNF-POR-BK.md`.
- `CONTRATO-CAMPOS-BK.md`.
- `MF-VIEWS.md`.
- `PLANO-SPRINTS.md`.
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`.

A teoria, nomes de entidades, endpoints, permissoes, roles, fluxos, campos e validacoes devem nascer destas fontes.

Usa as marcas:

- `CANONICO`: decisao diretamente documentada.
- `DERIVADO`: decisao tecnica minima necessaria para implementar sem contrariar a documentacao.
- `TODO (BLOCKER)`: informacao indispensavel em falta.

Nao marques todas as frases com `CANONICO` ou `DERIVADO`. Usa estas marcas em metadados, decisoes tecnicas, notas de escopo ou pontos ambiguos.

## Regra de formato obrigatorio

Preserva o header canonico do BK e os campos exigidos em `CONTRATO-CAMPOS-BK.md` e `_TEMPLATE-BK.md`.

Cada BK deve conter, no minimo:

- `## Header`
- `## Bloco pedagogico (obrigatorio)`
- `## Bloco operacional (obrigatorio)`
- `### Pre-condicoes`
- `### Guia de execucao (passo-a-passo)`
- passos lineares com `### Passo N - Nome claro`
- `## Criterios de aceite (mensuraveis)`
- `## Validacao final`
- `## Evidence para PR/defesa`
- `## Handoff`
- `## Changelog`

Quando o template exigir `## Snippet tecnico aplicavel`, mantem a seccao apenas se ela for coerente com o guia. Nao uses essa seccao como deposito de codigo solto. Se o codigo ja estiver nos passos, a seccao pode apontar para os passos relevantes.

Cada passo tecnico deve seguir esta estrutura minima, nesta ordem:

```md
### Passo N - Nome claro

1. Objetivo do passo.
2. Ficheiros envolvidos.
    - CRIAR: `caminho`
    - EDITAR: `caminho`
    - REVER: `caminho`
    - LOCALIZACAO: ficheiro completo, funcao completa, classe completa ou zona exata.
3. Instrucoes concretas.
4. Codigo completo, correto e integrado, quando houver codigo.
5. Explicacao do codigo ou da decisao.
6. Validacao do passo.
7. Caso negativo, erro comum ou risco que este passo evita.
```

Se um passo tiver varios ficheiros, repete blocos de codigo e explicacao dentro do mesmo passo, mantendo ordem clara. Nao deixes codigo novo solto no fim do BK.

## Separacao obrigatoria entre relatorio e BKs

O relatorio de auditoria pode conter linguagem interna de trabalho.

Os BKs dos alunos nao podem conter linguagem interna.

Nos BKs, e proibido escrever expressoes como:

- hidratacao;
- pos-auditoria;
- scaffold parcial;
- scaffold real observado;
- roteiro generico;
- conversa interna;
- codigo ainda nao corrigido;
- snippet solto;
- exemplo simplificado;
- implementar depois;
- quando aplicavel;
- helpers chamados;
- substituir mocks;
- pseudo-codigo;
- solucao parcial;
- este guia deixa de ser;
- codigo nao validado.

Os BKs devem falar diretamente com o aluno:

- "Neste BK vais implementar..."
- "Este ficheiro guarda..."
- "Este service valida..."
- "Este erro evita..."
- "Este endpoint devolve..."

## Regras fundamentais

1. Nao alteres IDs BK, RF, RNF, owners, apoios, prioridades, esforco, sprints, dependencias, macrofase ou escopo sem evidencia documental clara.
2. Nao inventes requisitos, entidades, endpoints, campos, roles, permissoes ou regras de negocio.
3. Se algo for inferido, marca como `DERIVADO`.
4. Se vier dos documentos oficiais, marca como `CANONICO`.
5. Se faltar contexto indispensavel, usa `TODO (BLOCKER)` e explica no relatorio.
6. Nao uses pseudo-codigo como solucao final.
7. Nao deixes snippets soltos.
8. Todo o codigo escrito no BK deve ser codigo final previsto para aquele BK.
9. Todo o codigo deve encaixar com BKs anteriores e preparar BKs seguintes.
10. Preserva contratos definidos em fases anteriores.
11. Escreve em portugues de Portugal.
12. O texto deve ser adequado a alunos do 12.o ano.
13. Explica teoria antes da pratica quando o conceito for novo.
14. Depois de cada bloco de codigo, explica o que faz, porque existe e que erro evita.
15. Nao alteres codigo real da app quando a tarefa for apenas corrigir os guias BK, salvo se o utilizador pedir explicitamente.

## Regras especificas FaithFlix

- `MF0` e documental/governance. Nao pode criar produto funcional.
- `MF1` cria fundacao tecnica. Nao deve antecipar catalogo, streaming, subscricoes, pool solidaria ou RGPD avancado.
- Identidade e sessao devem evitar tokens em `localStorage` e privilegiar cookies HttpOnly ou sessao segura conforme RNF.
- Registo, login, recuperacao de password e roles pertencem ao dominio de identidade.
- Catalogo, taxonomias, detalhe e estados de publicacao pertencem ao dominio de conteudo.
- Reproducao, continuar a ver, legendas/audio, controlo parental e qualidade pertencem ao dominio de streaming.
- Favoritos, watchlist e historico sao dados do utilizador autenticado. Devem aplicar ownership no backend.
- Ratings e comentarios pertencem ao utilizador autenticado e devem ter validacao e moderacao minima conforme RF/RNF.
- Pesquisa, filtros, carrosseis e relacionados nao devem inventar motor de busca externo se isso nao estiver definido.
- Recomendacao IA no MVP e baseline/regras simples, salvo documentacao explicita em contrario.
- Nao prometas embeddings, RAG, OCR, vector database, modelos generativos, inferencia automatica avancada ou personalizacao opaca se isso nao estiver previsto no BK.
- Subscricoes e pagamentos no MVP podem ser simulados quando a documentacao assim indicar. Nao inventes integracao real Stripe, PayPal, MB Way ou webhooks externos sem contrato documental.
- Pool solidaria exige rastreabilidade: candidatura, aprovacao/rejeicao, entrada na pool, distribuicao mensal, rotacao, historico e acesso por associacao/admin conforme RF.
- Associacoes devem ver apenas dados da sua entidade, salvo autorizacao admin documentada.
- Administradores podem ter privilegios elevados, mas endpoints admin precisam de guard/role check.
- Operacoes de privacidade e RGPD devem evitar exposicao excessiva de dados pessoais.
- Logs nunca devem expor passwords, tokens, cookies, dados de pagamento ou dados sensiveis.
- Streaming real deve ser simplificado quando a complexidade for elevada para PAP; nao fingir CDN, DRM ou URLs temporarios reais se nao forem implementados nesse BK.

## Regra de adequacao semantica

Antes de escrever cada BK, identifica o dominio real do requisito.

Exemplos de erro a evitar:

- Sessao segura nao e registo completo.
- Catalogo nao e player de video.
- Pagamento simulado nao e gateway real.
- Pool solidaria nao e doacao generica sem regras de rotacao.
- Recomendacao baseline nao e IA generativa.
- Associacao beneficiaria nao e utilizador comum.
- Admin nao pode substituir ownership/membership de todos os fluxos.
- Mockup visual nao define regras de negocio.

O codigo, os nomes de ficheiros, DTOs, schemas, endpoints, componentes e exemplos devem refletir o dominio real do BK.

## Regra de conceitos teoricos completos

A seccao pedagogica deve explicar mais do que o dominio da aplicacao.

Para cada BK, inclui conceitos das categorias aplicaveis:

1. Conceitos de dominio FaithFlix.
    - Ex.: catalogo, conteudo publicado, taxonomia, detalhe, player, progresso, favorito, watchlist, subscricao, trial, pagamento simulado, associacao, pool solidaria, rotacao mensal, consentimento.

2. Conceitos backend.
    - Ex.: Express, route, controller, service, module, DTO, schema/model, middleware, guard, cookie HttpOnly, HTTP status, error handler, logging estruturado.

3. Conceitos frontend.
    - Ex.: componente React, pagina, router, estado local, formulario, loading/error/empty/success, cliente API, `fetch` ou `Axios`, `credentials: 'include'`.

4. Conceitos de seguranca.
    - Ex.: autenticacao, autorizacao, roles, ownership, validacao no backend, protecao de cookies, redacao de dados sensiveis, nao confiar em IDs enviados pelo frontend.

5. Conceitos de dados.
    - Ex.: MongoDB, documento, schema, ObjectId, indices basicos, referencias entre entidades, consistencia minima.

6. Conceitos de recomendacao/IA, se houver.
    - Ex.: recomendacao baseline, cold start, explicabilidade, fonte dos sinais, limite entre sugestao e acao automatica, fallback honesto.

Cada conceito importante deve responder:

- o que e;
- de onde vem no fluxo;
- para onde vai;
- para que serve;
- que erro evita.

## Regra de codigo completo

Um BK so pode incluir codigo se esse codigo estiver completo para o contexto do BK.

E proibido deixar:

- funcoes chamadas mas nao implementadas;
- services que dependem de helpers inexistentes;
- imports sem origem clara;
- DTOs sem validacao;
- controllers sem service correspondente;
- schemas/modelos sem relacao com service;
- frontend com `payload: unknown`;
- testes com `as any` como solucao final;
- mocks como substituto de implementacao quando o BK promete funcionalidade real;
- comentarios tipo "implementar depois".

Se o codigo depende de algo de BK anterior:

- indica explicitamente qual BK criou esse ficheiro, funcao, endpoint ou componente;
- nao reimplementes tudo se isso quebrar a sequencia;
- mostra apenas a integracao necessaria neste BK.

Se o codigo e novo neste BK:

- mostra o ficheiro completo ou a versao completa da funcao/classe/componente a substituir;
- indica caminho completo;
- indica localizacao exata;
- explica a ligacao com ficheiros anteriores;
- explica que BKs seguintes ficam preparados.

## Qualidade backend obrigatoria

Quando houver backend, inclui:

- endpoint;
- metodo HTTP;
- payload;
- DTO ou validacao equivalente;
- schema/model quando houver persistencia;
- service;
- controller;
- route/module;
- middleware/guard quando necessario;
- ownership, role check ou autorizacao quando necessario;
- erros esperados;
- codigos HTTP;
- cenarios negativos de seguranca;
- testes ou smoke checks proporcionais ao escopo.

## Qualidade frontend obrigatoria

Quando houver frontend, inclui:

- cliente API coerente com o backend;
- pagina ou componente;
- estado local;
- formulario quando houver input;
- loading;
- error;
- empty/success;
- validacao minima;
- `credentials: 'include'` quando houver sessao por cookie;
- sem tokens em `localStorage`;
- sem `payload: unknown`;
- mensagens visiveis adequadas ao utilizador.

## Qualidade recomendacao/IA obrigatoria

Quando houver recomendacao ou IA, inclui:

- input permitido;
- sinais usados, por exemplo historico, favoritos, ratings ou temas;
- regra de cold start;
- explicabilidade do "porque recomendamos";
- separacao entre recomendacao e acao automatica;
- fallback honesto quando nao ha dados suficientes;
- negativos contra recomendacoes sem base;
- limites do MVP;
- proibicao de prometer modelos avancados sem documentacao canonica.

## Contrato de executabilidade da aplicacao

O objetivo nao e apenas produzir BKs bem escritos. O objetivo e que, seguindo os BKs por ordem, a aplicacao FaithFlix possa funcionar de forma real e coerente.

Todo o codigo apresentado nos BKs deve ser:

- funcional;
- integrado com a arquitetura global prevista;
- coerente com BKs anteriores;
- preparatorio para BKs seguintes;
- compativel com a stack definida ou com a decisao tecnica documentada;
- sem imports partidos;
- sem nomes de ficheiros contraditorios;
- sem endpoints duplicados ou inconsistentes;
- sem DTOs, schemas, services ou components que nao encaixem entre si;
- sem funcoes chamadas mas nao implementadas;
- sem codigo meramente ilustrativo apresentado como solucao.

Cada BK deve ser tratado como uma entrega incremental da aplicacao final.

## Gate de app funcional

Antes de considerar um BK como `OK`, responde explicitamente no teu raciocinio e reflete no relatorio quando houver risco:

- Este codigo compila no contexto da app final prevista?
- Os imports apontam para ficheiros existentes ou criados em BKs anteriores?
- O controller chama um service existente?
- O service usa schemas/modelos existentes ou criados neste BK?
- O frontend chama endpoints reais definidos no backend?
- Os tipos/payloads do frontend correspondem a payloads e respostas do backend?
- O fluxo funciona com autenticacao real quando o requisito exigir autenticacao?
- O fluxo falha de forma controlada nos negativos?
- Este BK deixa a app num estado mais funcional do que antes?
- O proximo BK consegue construir sobre este sem reescrever tudo?

Se alguma resposta for "nao" ou "nao sei", o BK nao pode ser marcado como `OK`.

## Auditoria obrigatoria

Cria ou atualiza:

```md
docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-{MF_ALVO}.md
```

Classifica cada BK como:

- `OK`: pronto para aluno seguir.
- `PARCIAL`: tem estrutura, mas falta completude.
- `CRITICO`: o aluno nao conseguiria implementar com seguranca seguindo o guia.

Um BK so e `OK` se cumprir todos:

1. Objetivo claro.
2. Importancia funcional e pedagogica.
3. Scope-in.
4. Scope-out.
5. Pre-requisitos concretos.
6. Dependencias BK/RF/RNF.
7. Conceitos teoricos necessarios.
8. Ficheiros a criar/editar/rever.
9. Localizacao exata das alteracoes.
10. Codigo completo e integrado quando houver codigo.
11. Codigo comentado de forma didatica quando a logica nao for obvia.
12. Explicacao apos cada bloco de codigo.
13. Validacao por passo.
14. Cenarios negativos.
15. Expected results com HTTP status, mensagens, outputs ou comportamento observavel.
16. Evidence para PR/defesa.
17. Handoff para proximo BK.
18. Coerencia com BKs anteriores.
19. Preparacao para BKs seguintes.
20. Sem linguagem interna.
21. Sem snippets soltos.
22. Sem pseudo-codigo.
23. Sem helpers por implementar.
24. Sem `payload: unknown` no frontend.
25. Sem `as any` em codigo apresentado como solucao final.
26. Sem dominio StudyFlow, termos de outra PAP ou entidades que nao pertencem ao FaithFlix.

Para cada BK `PARCIAL` ou `CRITICO`, o relatorio deve indicar:

- ficheiro;
- estado;
- problema principal;
- exemplos concretos;
- o que falta completar;
- risco pedagogico;
- risco tecnico;
- dependencias a reler;
- prioridade de correcao.

O relatorio deve terminar com ordem recomendada de correcao.

## Mapa de integracao da MF

No relatorio de auditoria, mantem uma seccao chamada `Mapa de integracao da MF`.

Para cada BK editado, regista:

- ficheiros criados;
- ficheiros editados;
- exports produzidos;
- imports consumidos de BKs anteriores;
- endpoints criados;
- DTOs criados;
- schemas/modelos criados;
- services criados;
- componentes/paginas frontend criados;
- dados persistidos;
- regras de auth/ownership/roles aplicadas;
- BKs seguintes que dependem destes elementos.

Antes de fechar a MF, confirma que nao existem:

- dois endpoints para a mesma acao;
- dois schemas/modelos para a mesma entidade;
- nomes diferentes para o mesmo conceito;
- frontend a chamar endpoint inexistente;
- service a importar ficheiro nao criado;
- BK seguinte dependente de algo que este BK nao entrega.

## Hidratacao/correcao dos BKs

Se `MODO` for `hidratar_corrigir`, audita primeiro e depois edita apenas os BKs da `MF_ALVO` marcados como `PARCIAL` ou `CRITICO`.

Se `MODO` for `corrigir_apenas`, usa o relatorio existente como ponto de partida, corrige apenas os BKs da `MF_ALVO` ja identificados como `PARCIAL` ou `CRITICO`, e atualiza o relatorio com contagem antes/depois, BKs editados e validacoes executadas.

Para cada BK corrigido, inclui:

- objetivo;
- importancia;
- scope-in;
- scope-out;
- estado antes;
- estado depois;
- pre-requisitos;
- glossario;
- conceitos teoricos;
- arquitetura do BK;
- ficheiros a criar/editar/rever;
- passos lineares;
- codigo completo;
- explicacao do codigo;
- validacao por passo;
- erros comuns;
- cenarios negativos;
- expected results;
- criterios de aceite;
- validacao final;
- evidence;
- handoff;
- changelog.

No fim do BK devem ficar apenas secoes finais de fecho, como criterios de aceite, validacao final, evidence, handoff, snippet tecnico aplicavel se exigido pelo template e changelog.

## Regra de explicacao didatica do codigo

Todo o codigo incluido nos BKs deve ser documentado e explicado de forma didatica, completa e explicita, adequada a alunos do 12.o ano.

A explicacao fora do codigo e os comentarios dentro do codigo sao ambos importantes. Um nao substitui o outro.

Cada ficheiro novo deve incluir:

- breve explicacao antes do bloco de codigo;
- comentarios no proprio codigo quando a logica nao for obvia;
- nomes de funcoes, variaveis, DTOs, services e componentes claros;
- explicacao depois do bloco de codigo.

Depois de cada bloco de codigo, a explicacao deve cobrir:

1. O que o codigo faz.
2. Porque existe neste BK.
3. Que ficheiros ou BKs anteriores usa.
4. Que ficheiros ou BKs seguintes prepara.
5. Que dados entram.
6. Que dados saem.
7. Que validacoes acontecem.
8. Que regra de seguranca, ownership, role ou privacidade aplica.
9. Que erro comum evita.
10. Como testar se ficou correto.

Bom comentario:

```js
// O userId vem da sessao para impedir que o frontend crie dados em nome de outro utilizador.
```

Mau comentario:

```js
// Define userId.
```

Um bloco de codigo sem explicacao suficiente nao pode ser considerado completo.

## Validade das decisoes de stack

Antes de escrever comandos, dependencias ou estrutura, confirma a decisao de stack com os documentos e BKs anteriores.

Documentacao atual sugere:

- Backend: Node.js LTS, Express modular, padrao MVC.
- Frontend: Next.js/React com Axios, mas os BKs podem ter assumido React + Vite e `fetch` por simplicidade pedagogica.
- Base de dados: MongoDB Atlas no MVP, PostgreSQL como alternativa pos-PAP.
- Streaming: simplificado, evitando prometer CDN/DRM real sem implementacao.
- Pagamentos: funcionalidade simulada no MVP quando aplicavel.
- Recomendacao: baseline por regras simples antes de IA avancada.

Se houver tensao entre `RNF.md`, BKs anteriores e codigo real:

- nao escolhas silenciosamente;
- regista drift;
- explica a decisao no relatorio;
- marca `TODO (BLOCKER)` se impedir implementacao segura.

## Gate de qualidade antes de terminar

Depois de editar, executa verificacoes textuais.

Antes de executar, substitui `{MF_ALVO}` pelo valor real, por exemplo `MF1`.

```bash
rg -n "StudyFlow|sala de estudo|turma|disciplina|material oficial|aluno inscrito|IA da sala|IA da turma|hidrata|pos-auditoria|scaffold parcial|roteiro generico|conversa interna|codigo ainda nao corrigido|snippet solto|exemplo simplificado|implementar depois|quando aplicavel|helpers chamados|substitu(ir|i)r? mocks|pseudo-codigo|solucao parcial|payload: unknown|as any" docs/planificacao/guias-bk/{MF_ALVO}/*.md
```

Se aparecerem ocorrencias nos BKs dos alunos, corrige. Se uma ocorrencia for falsa positiva justificavel, regista no relatorio.

Depois executa:

```bash
git diff --check
bash scripts/validate-planificacao.sh
```

Se o validador falhar:

- le o erro;
- corrige se for causado pelas tuas alteracoes;
- se for bloqueio de infraestrutura ou script existente, regista o erro exato no relatorio e no resumo final;
- nao escondas a falha.

## Resumo final obrigatorio

No fim responde com:

- MF processada;
- numero de BKs analisados;
- contagem `OK`/`PARCIAL`/`CRITICO` antes;
- contagem `OK`/`PARCIAL`/`CRITICO` depois;
- BKs editados;
- principais lacunas corrigidas;
- decisoes tecnicas confirmadas;
- drift documental encontrado;
- verificacoes textuais executadas;
- resultado de `git diff --check`;
- resultado de `bash scripts/validate-planificacao.sh`;
- bloqueios ou TODOs restantes.
