# Cábula Técnica Para Relatório PAP - FaithFlix

## Objetivo Do Documento

Este documento serve como apoio aos alunos para escreverem e apresentarem o relatório técnico da PAP. A linguagem é técnica, mas explicada de forma acessível, para que possa ser usada tanto no relatório como na preparação da defesa.

O FaithFlix é uma plataforma de streaming cristão que junta catálogo audiovisual, contas de utilizador, reprodução de conteúdos, recomendações, subscrições e impacto social através de uma pool solidária de associações. Algumas secções descrevem funcionalidades centrais do MVP; outras podem ser usadas como visão final ou evolução futura, quando indicado.

## Visão Técnica Geral

Tecnicamente, o FaithFlix segue uma arquitetura web cliente-servidor. O frontend é a aplicação usada pelo utilizador no browser. O backend é responsável pelas regras de negócio, validação, autenticação, autorização, acesso à base de dados e exposição da API.

O frontend comunica com o backend através de uma API REST. Cada área funcional tem clientes próprios no frontend, por exemplo para autenticação, catálogo, playback, biblioteca pessoal, pesquisa, recomendações, subscrições, associações, notificações, privacidade e administração.

O backend está organizado por módulos de domínio. Cada módulo concentra uma responsabilidade principal:

- autenticação e sessão;
- utilizadores e perfis;
- catálogo e taxonomias;
- playback e progresso de visualização;
- biblioteca pessoal;
- ratings e comentários;
- pesquisa, descoberta e recomendações;
- subscrições e pagamentos;
- associações e pool solidária;
- notificações;
- privacidade/RGPD;
- administração, métricas e integrações.

Esta separação facilita manutenção e evolução, porque cada domínio pode ser alterado sem misturar responsabilidades com os restantes.

## Identidade, Contas E Perfis

O sistema de identidade é a base da plataforma. Antes de guardar favoritos, histórico, subscrições ou preferências, o sistema precisa de saber quem é o utilizador.

Este domínio inclui:

- registo de utilizador;
- login;
- logout;
- recuperação de password;
- sessão autenticada;
- edição de perfil;
- papéis de utilizador, como `user`, `moderator` e `admin`.

Depois do login, o backend associa os pedidos a um utilizador autenticado. Isto permite que cada operação pessoal seja feita sobre a conta correta. O frontend não deve enviar manualmente o `userId` para operações sensíveis; o backend deve obter a identidade a partir da sessão.

As permissões também dependem deste domínio. Um utilizador comum pode ver conteúdos e gerir a sua própria conta. Um moderador pode gerir conteúdos. Um administrador pode aceder a operações críticas, como gestão de utilizadores, candidaturas de associações, distribuição da pool ou métricas.

## Catálogo, Metadados, Streaming E Reprodutor

O catálogo é a fonte principal dos conteúdos da plataforma. Cada conteúdo deve ter metadados bem definidos para poder ser pesquisado, apresentado, recomendado e reproduzido.

Os metadados principais incluem:

- título;
- sinopse;
- tipo de conteúdo, como filme, série, episódio ou documentário;
- duração;
- classificação etária;
- imagens;
- taxonomias/temas;
- estado de publicação;
- dados de reprodução;
- opções de áudio, legendas e qualidade.

O backend deve distinguir conteúdos em rascunho, publicados e arquivados. Só conteúdos publicados devem aparecer no catálogo público, na pesquisa, nas recomendações e no player. Conteúdos em rascunho podem existir para administração, mas não devem ser visíveis para utilizadores finais.

O reprodutor usa os dados de media associados ao conteúdo. Além de reproduzir o vídeo, pode guardar o progresso de visualização para permitir a funcionalidade "continuar a ver". Também pode aplicar preferências de áudio, legendas e qualidade.

## Favoritos, Watchlist E Histórico

Favoritos, watchlist e histórico formam a biblioteca pessoal do utilizador.

Cada conceito tem uma função diferente:

- favoritos: conteúdos de que o utilizador gosta;
- watchlist: conteúdos guardados para ver mais tarde;
- histórico: conteúdos vistos ou iniciados;
- progresso: ponto do vídeo onde o utilizador ficou.

Estes dados pertencem ao utilizador autenticado. Por isso, devem ser guardados associados à sessão/conta e não devem aceitar um `userId` vindo livremente do frontend.

Esta informação também é útil para outros módulos. O histórico e os favoritos podem alimentar recomendações, continuar a ver, personalização da home e exportação de dados pessoais.

## Classificações E Feedback

As classificações permitem que os utilizadores avaliem conteúdos. O sistema guarda a avaliação individual e calcula dados agregados, como média e número total de avaliações.

Os comentários curtos permitem feedback textual. Como podem ser públicos, devem ter validação e moderação. Comentários com links, linguagem imprópria ou conteúdo suspeito podem ficar pendentes de revisão.

Este domínio tem duas utilidades:

- ajuda outros utilizadores a perceber a receção de um conteúdo;
- gera sinais para recomendações e descoberta.

É importante distinguir feedback público de sinais internos. Um comentário pode aparecer na página de detalhe; um rating pode ser usado internamente para ranking e recomendação.

## Pesquisa E Descoberta

Pesquisa e descoberta não são a mesma coisa.

A pesquisa acontece quando o utilizador procura ativamente por um termo, título ou tema. O backend recebe parâmetros, valida a query, aplica filtros e devolve conteúdos publicados.

A descoberta é mais guiada. Inclui:

- carrosséis editoriais;
- conteúdos relacionados;
- grupos temáticos;
- página inicial;
- página "Para si";
- sugestões baseadas em catálogo e atividade.

A pesquisa responde a uma intenção direta. A descoberta ajuda o utilizador a encontrar conteúdos mesmo sem saber exatamente o que procurar.

## Recomendações, Cold Start, Explicabilidade E Embeddings

O sistema de recomendações sugere conteúdos personalizados ao utilizador. A recomendação deve ser útil, mas também transparente e segura.

A recomendação baseline usa sinais internos:

- favoritos;
- watchlist;
- histórico;
- progresso de visualização;
- ratings positivos;
- temas associados aos conteúdos.

Quando o utilizador ainda não tem sinais suficientes, o sistema usa cold start. Isto significa que, em vez de fingir uma personalização que ainda não existe, apresenta conteúdos populares, recentes ou editoriais.

Cada grupo recomendado deve incluir uma explicação simples, por exemplo:

- "porque acompanha estes temas";
- "com base na sua atividade";
- "conteúdos populares do catálogo";
- "sugestões gerais por ainda haver poucos sinais".

### Embeddings De Conteúdo

Como estado final pretendido, a recomendação pode ser melhorada com embeddings. Um embedding é uma representação numérica de um conteúdo. Em vez de comparar apenas palavras iguais, o sistema compara significado.

Para gerar embeddings, o sistema pode usar texto editorial dos conteúdos, como:

- título;
- sinopse;
- tipo;
- taxonomias;
- temas.

Os embeddings pertencem aos conteúdos, não aos utilizadores. O sistema pode construir temporariamente um perfil semântico com base nos conteúdos que o utilizador viu, guardou ou avaliou positivamente. Depois compara esse perfil com os embeddings dos conteúdos disponíveis.

Esta comparação permite encontrar conteúdos semanticamente parecidos, mesmo que não tenham exatamente os mesmos termos.

Por privacidade:

- não devem existir embeddings permanentes por utilizador;
- a API pública não deve devolver vetores;
- o histórico detalhado não deve ser enviado para terceiros;
- qualquer provider externo deve ser opcional e sujeito a revisão de privacidade.

## Subscrições

As subscrições controlam o acesso ao serviço. Um utilizador pode ter uma subscrição ativa, expirada, cancelada, em trial ou associada a um plano específico.

O backend deve ser a autoridade sobre o estado da subscrição. O frontend pode mostrar botões e informação visual, mas não deve decidir sozinho se o utilizador tem acesso premium.

Este domínio inclui:

- listagem de planos;
- criação/ativação de subscrição;
- ciclo mensal ou anual;
- renovação;
- cancelamento de renovação;
- bloqueio por expiração;
- estado atual da conta.

As subscrições também alimentam outros módulos, como pool solidária, qualidade de streaming, partilha familiar e notificações.

## Pagamentos Simulados, Trial E Ciclo De Subscrição

Num contexto PAP, os pagamentos podem ser simulados em vez de integrarem um gateway real. Isto permite demonstrar o fluxo funcional sem lidar com cartões reais, custos ou dados financeiros sensíveis.

O sistema deve simular:

- pagamento aceite;
- pagamento recusado;
- ativação da subscrição;
- trial;
- fim do período;
- cancelamento;
- falha de renovação.

O trial deve ter regras claras. Por exemplo, cada utilizador só pode usar trial uma vez. Depois de terminar, o sistema deve exigir subscrição ativa para manter acesso premium.

O ciclo de subscrição define o período de validade. Num plano mensal, o acesso fica ativo até ao fim do mês contratado. Num plano anual, até ao fim do período anual. O backend deve guardar datas como `currentPeriodStart` e `currentPeriodEnd`, ou equivalentes.

## Pool Rotativa De Associações

A pool rotativa é o mecanismo solidário do FaithFlix. Uma percentagem das subscrições ativas é reunida numa pool mensal e distribuída por associações aprovadas.

O fluxo tem várias etapas:

1. Uma associação submete candidatura.
2. Um administrador analisa a candidatura.
3. Se for aprovada, a associação entra como elegível.
4. O sistema calcula a pool mensal.
5. O valor é distribuído por associações elegíveis.
6. A ordem de prioridade roda entre meses.
7. O histórico fica guardado para auditoria.

O cálculo monetário deve ser feito em cêntimos para evitar erros de ponto flutuante. A distribuição deve ser idempotente por mês, ou seja, o mesmo mês não deve ser distribuído duas vezes.

A rotação garante justiça. Se uma associação ficar em primeiro lugar num mês, no mês seguinte a ordem muda para dar prioridade a outra associação.

## Notificações

As notificações comunicam eventos importantes ao utilizador ou ao administrador. Podem ser transacionais, informativas ou de continuidade.

Exemplos de notificações:

- pagamento aceite;
- pagamento falhado;
- subscrição prestes a expirar;
- candidatura de associação recebida;
- candidatura aprovada ou rejeitada;
- distribuição mensal executada;
- alerta para continuar a ver;
- alterações importantes na conta.

As notificações devem respeitar preferências do utilizador. Algumas são essenciais e podem ser obrigatórias; outras podem ser opcionais.

Tecnicamente, o backend cria notificações com tipo, destinatário, estado de leitura, mensagem e data. O frontend lista essas notificações e permite ao utilizador consultá-las.

## Privacidade, RGPD E Consentimentos

Como a aplicação trata dados pessoais, precisa de regras de privacidade. Isto inclui dados de conta, histórico, favoritos, ratings, comentários, subscrições, notificações e preferências.

O utilizador deve poder:

- consultar os seus dados;
- exportar dados;
- eliminar a conta;
- gerir consentimentos;
- perceber para que os dados são usados.

A exportação de dados deve juntar informação relevante da conta num formato legível, por exemplo JSON. A eliminação deve remover ou anonimizar dados pessoais, respeitando dependências do sistema.

Os consentimentos permitem controlar funcionalidades opcionais, como recomendações personalizadas ou comunicações não essenciais.

Princípios importantes:

- minimização de dados;
- não guardar passwords em texto claro;
- não expor tokens;
- não enviar dados pessoais desnecessários ao frontend;
- usar dados de recomendação apenas para recomendação;
- manter logs sem informação sensível.

## Administração, Métricas E Operação

A administração permite gerir a plataforma no dia a dia. Nem todas as operações devem estar disponíveis para utilizadores comuns.

Funções administrativas típicas:

- gerir utilizadores;
- bloquear ou reativar contas;
- alterar papéis;
- gerir catálogo;
- rever candidaturas de associações;
- executar distribuição da pool;
- consultar métricas;
- configurar integrações.

O painel de métricas ajuda a acompanhar o estado da plataforma. Pode apresentar:

- total de utilizadores;
- utilizadores ativos/bloqueados;
- conteúdos publicados;
- subscrições ativas;
- trials;
- associações elegíveis;
- total distribuído pela pool;
- eventos de consentimento.

As operações críticas devem exigir role `admin` e gerar evidência/auditoria quando possível.

## Planos Pro/Família, Partilha Familiar E Qualidade Por Plano

Além da subscrição base, o FaithFlix pode ter planos avançados. Os planos Pro e Família acrescentam regras de acesso, benefícios e limites de qualidade.

Um entitlement é uma permissão associada ao plano. Exemplos:

- acesso premium;
- qualidade máxima;
- partilha familiar;
- número máximo de membros;
- acesso a funcionalidades específicas.

Na partilha familiar, existe normalmente um owner. O owner tem o plano Família ativo e pode convidar membros. Os membros recebem acesso enquanto o plano do owner continuar ativo.

Regras importantes:

- o owner precisa de plano Família ativo;
- o membro deve ser uma conta real;
- uma conta não deve pertencer a várias famílias ativas;
- remover o membro deve retirar acesso familiar;
- cancelar o plano do owner deve afetar os membros.

A qualidade por plano deve ser imposta no backend. O frontend não deve receber URLs de qualidades bloqueadas. Por exemplo:

- plano trial/Pro até 1080p;
- plano Família até 2160p/4K;
- sem plano, acesso limitado ou bloqueado.

## Segurança, Testes, Performance E Acessibilidade

Esta secção é transversal. Não é uma funcionalidade isolada, mas garante que a aplicação é confiável.

### Segurança

Pontos técnicos importantes:

- autenticação segura;
- sessão protegida;
- autorização por roles;
- validação de input;
- não guardar passwords em texto claro;
- proteger dados pessoais;
- não expor IDs internos desnecessários;
- limitar operações administrativas;
- evitar XSS, CSRF, brute force e injeções.

### Testes

O projeto deve ter testes para validar:

- regras de backend;
- contratos HTTP;
- fluxos principais;
- autenticação;
- subscrições;
- reprodução;
- pool solidária;
- recomendações;
- privacidade;
- regressão frontend.

Testes ajudam a garantir que alterações futuras não quebram funcionalidades existentes.

### Performance

Áreas críticas:

- catálogo;
- pesquisa;
- recomendações;
- início de reprodução;
- páginas principais.

O backend deve usar paginação e filtros. O frontend deve evitar carregar dados desnecessários.

### Acessibilidade

A aplicação deve ser utilizável com teclado, leitores de ecrã e diferentes tamanhos de ecrã.

Inclui:

- contraste adequado;
- labels em formulários;
- estados de erro claros;
- navegação por teclado;
- foco visível;
- mensagens compreensíveis;
- layout responsivo.

## Passagens Bíblicas E Estudo Bíblico Integrado

As passagens bíblicas podem enriquecer a experiência do FaithFlix, associando referências bíblicas aos conteúdos audiovisuais. Em vez de um conteúdo ter apenas título, sinopse e imagem, pode também ter referências espirituais relacionadas.

Uma passagem bíblica deve ser tratada como dado estruturado:

- livro;
- capítulo;
- versículos;
- tradução;
- texto da passagem;
- tema;
- conteúdos relacionados;
- estado editorial;
- comentário/reflexão opcional.

Esta estrutura permitiria:

- mostrar passagens na página de detalhe;
- filtrar conteúdos por tema bíblico;
- criar estudos associados a filmes/documentários;
- apoiar uso formativo em grupos, igrejas ou famílias;
- reforçar a identidade cristã da plataforma.

Como envolve conteúdo religioso, a publicação deve ser feita por administradores ou curadores. Isto evita referências fora de contexto ou interpretações automáticas sem validação humana.

## Como Fechar No Relatório

Uma forma forte de fechar a explicação técnica é mostrar que o FaithFlix não é apenas um conjunto de páginas, mas um sistema integrado.

Texto final sugerido:

> O FaithFlix foi estruturado como uma aplicação web modular, com separação clara entre frontend, backend, base de dados e domínios funcionais. Cada módulo responde a uma área do produto, como identidade, catálogo, streaming, biblioteca pessoal, recomendações, subscrições, pool solidária, privacidade e administração. Esta organização permite manter o sistema escalável, seguro, testável e alinhado com os objetivos da PAP.

## Sugestão de Organização para a Apresentação

Tendo em conta a quantidade de sistemas do FaithFlix, a apresentação deve seguir uma ordem progressiva. O objetivo é evitar que os alunos comecem por explicar recomendações, subscrições ou pool solidária antes de o júri perceber a base técnica da aplicação.

Em vez de apresentar a aplicação como uma lista de páginas, é melhor apresentar por camadas:

1. base técnica, identidade e perfis;
2. catálogo, metadados, streaming e reprodutor;
3. biblioteca pessoal, feedback e continuidade;
4. pesquisa, descoberta, recomendações e embeddings;
5. subscrições, pagamentos simulados, trial, planos e qualidade;
6. pool solidária e associações;
7. passagens bíblicas e curadoria cristã;
8. notificações, privacidade e consentimentos;
9. administração, métricas e operação;
10. segurança, testes, performance e acessibilidade.

### 1. Base Técnica, Identidade E Perfis

Primeiro deve ser explicada a fundação da plataforma.

Inclui:

- frontend React;
- backend Node.js/Express;
- MongoDB;
- API REST;
- autenticação;
- sessão autenticada;
- roles `user`, `moderator` e `admin`;
- validação e autorização no backend.

Mensagem-chave:

> Antes de falar de catálogo, streaming, recomendações ou subscrições, é preciso explicar como o FaithFlix sabe quem é o utilizador e que permissões essa pessoa tem.

Nesta parte, os alunos não precisam de explicar todas as rotas. Devem mostrar a ideia principal: o frontend apresenta a interface, mas o backend decide quem pode fazer cada operação.

### 2. Catálogo, Metadados, Streaming E Reprodutor

Depois da base técnica, deve entrar o catálogo, porque é o centro da aplicação.

Inclui:

- filmes, séries, episódios e documentários;
- título, sinopse, duração e classificação etária;
- imagens;
- taxonomias e temas;
- estado editorial, como rascunho, publicado ou arquivado;
- dados de media;
- opções de qualidade, áudio e legendas;
- reprodutor;
- progresso de visualização.

Mensagem-chave:

> O catálogo não é apenas uma lista de vídeos. É a fonte estruturada que alimenta pesquisa, detalhe, reprodução, recomendações e administração.

Aqui é importante reforçar que só conteúdos publicados devem aparecer para utilizadores finais. Conteúdos em rascunho ou arquivados pertencem ao circuito administrativo.

### 3. Biblioteca Pessoal, Feedback E Continuidade

Depois do catálogo, deve ser explicado como cada utilizador interage com os conteúdos.

Inclui:

- favoritos;
- watchlist;
- histórico;
- progresso de visualização;
- ratings;
- comentários;
- "continuar a ver";
- biblioteca pessoal.

Mensagem-chave:

> Depois de existirem conteúdos, o sistema começa a guardar a relação de cada utilizador com esses conteúdos.

Esta parte é útil para mostrar integração. Um favorito não serve apenas para aparecer numa lista; também pode alimentar recomendações. Um progresso de vídeo não serve apenas para retomar a reprodução; também ajuda a perceber atividade.

### 4. Pesquisa, Descoberta, Recomendações E Embeddings

Só depois de explicar catálogo e sinais do utilizador deve entrar a descoberta personalizada.

Inclui:

- pesquisa por termo;
- filtros;
- página inicial;
- conteúdos relacionados;
- página "Para si";
- recomendações baseline;
- cold start;
- explicabilidade;
- embeddings de conteúdo;
- perfil semântico temporário do utilizador.

Mensagem-chave:

> As recomendações dependem de duas coisas: conteúdos bem descritos e sinais de atividade do utilizador.

Nesta parte, os alunos devem distinguir três ideias:

- pesquisa: o utilizador procura diretamente;
- descoberta: a aplicação sugere grupos e conteúdos;
- recomendação: o sistema usa sinais como favoritos, watchlist, histórico, ratings positivos e embeddings para ordenar sugestões.

Também devem explicar que os embeddings não são dados pessoais permanentes do utilizador. Os embeddings pertencem aos conteúdos. O perfil semântico do utilizador é calculado temporariamente durante o pedido de recomendação.

### 5. Subscrições, Pagamentos Simulados, Trial, Planos E Qualidade

Depois da experiência de conteúdo, deve ser explicado como o acesso é controlado.

Inclui:

- planos;
- subscrição ativa, expirada, cancelada ou em trial;
- ciclo mensal ou anual;
- pagamento simulado;
- renovação;
- cancelamento;
- planos Pro e Família;
- entitlements;
- partilha familiar;
- qualidade por plano.

Mensagem-chave:

> O frontend pode mostrar botões e estados, mas quem decide se o utilizador tem acesso é sempre o backend.

Aqui convém explicar que os pagamentos são simulados por ser uma PAP. Isto permite demonstrar o fluxo completo sem processar cartões reais nem dados financeiros sensíveis.

Também é uma boa altura para explicar que a qualidade de streaming deve ser controlada no backend. Se um plano não permite determinada qualidade, o frontend não deve receber o URL dessa qualidade.

### 6. Pool Solidária E Associações

Depois das subscrições, faz sentido apresentar a componente solidária, porque depende da existência de receita/subscrições.

Inclui:

- candidatura de associação;
- revisão por administrador;
- estado aprovado/rejeitado;
- elegibilidade;
- cálculo mensal da pool;
- distribuição em cêntimos;
- rotação de associações;
- histórico de distribuição;
- idempotência por mês.

Mensagem-chave:

> A pool solidária transforma parte da receita das subscrições num mecanismo controlado e auditável de apoio a associações.

Esta é uma das partes mais fortes para a defesa, porque mostra que o projeto não é só streaming. Tem uma componente social, com regras de justiça, validação administrativa e histórico.

### 7. Passagens Bíblicas E Curadoria Cristã

Depois da componente solidária, pode ser apresentada a identidade cristã editorial da plataforma.

Inclui:

- livro bíblico;
- capítulo e versículos;
- tradução;
- texto da passagem;
- tema;
- reflexão;
- estado editorial;
- associação entre passagem e conteúdo;
- apresentação na página de detalhe;
- curadoria por admin ou moderator.

Mensagem-chave:

> As passagens bíblicas ligam os conteúdos audiovisuais a uma camada espiritual e editorial, sem depender de interpretações automáticas sem validação humana.

Aqui os alunos devem explicar que uma passagem bíblica não deve ser apenas texto solto. Deve ser dado estruturado, validado e publicado por alguém com permissão editorial.

### 8. Notificações, Privacidade E Consentimentos

Depois dos sistemas principais, devem entrar os mecanismos de comunicação e proteção de dados.

Inclui:

- notificações in-app;
- alertas de subscrição;
- avisos de pagamento;
- alertas de candidatura;
- avisos de distribuição da pool;
- preferências;
- exportação de dados;
- eliminação ou anonimização de conta;
- consentimentos;
- minimização de dados.

Mensagem-chave:

> O FaithFlix guarda dados pessoais e sinais de atividade, por isso precisa de regras claras de privacidade e controlo pelo utilizador.

Nesta parte, convém reforçar que dados como histórico, ratings, comentários, favoritos, subscrições e notificações pertencem à conta do utilizador e não devem ser expostos a outros utilizadores.

### 9. Administração, Métricas E Operação

No fim da explicação funcional, deve entrar a camada administrativa.

Inclui:

- gestão de utilizadores;
- bloqueio e reativação de contas;
- alteração de roles;
- gestão de catálogo;
- gestão de passagens bíblicas;
- revisão de candidaturas de associações;
- execução da distribuição da pool;
- métricas;
- integrações;
- logs e auditoria;
- health-check.

Mensagem-chave:

> A administração mostra que o FaithFlix foi pensado para ser operado e mantido, não apenas para funcionar numa demonstração isolada.

Esta secção deve mostrar maturidade técnica. Operações críticas devem exigir `admin` ou `moderator`, conforme o caso, e não devem estar disponíveis para utilizadores comuns.

### 10. Segurança, Testes, Performance E Acessibilidade

Por fim, devem ser apresentados os aspetos transversais que tornam a aplicação confiável.

Inclui:

- autenticação segura;
- sessões protegidas;
- validação de input;
- autorização por roles;
- proteção de dados pessoais;
- testes backend;
- testes de contratos HTTP;
- regressão frontend;
- build de produção;
- paginação e filtros;
- estados de loading e erro;
- acessibilidade;
- layout responsivo.

Mensagem-chave:

> Para além das funcionalidades visíveis, o projeto tem mecanismos técnicos para reduzir erros, proteger dados e facilitar manutenção.

Esta parte deve ser curta, mas forte. O objetivo não é explicar todos os testes, mas mostrar que a equipa validou regras importantes e pensou em segurança, performance e experiência de utilização.

### Regra Para Evitar Confusão

Sempre que surgir uma funcionalidade que depende de outra ainda não explicada, pode ser usada esta frase:

> Esta funcionalidade depende de conceitos que vamos explicar mais à frente, por isso agora só a vamos situar no mapa geral.

Frase útil para abrir a parte técnica:

> O FaithFlix junta streaming, personalização, subscrições, impacto social, curadoria cristã e administração. Vamos explicar por ordem, porque alguns sistemas dependem dos anteriores.

Uma sequência de demonstração possível seria:

1. login;
2. catálogo;
3. página de detalhe com metadados e passagens bíblicas;
4. reprodução e progresso;
5. favorito, watchlist, rating ou comentário;
6. pesquisa e recomendações;
7. subscrição ou plano;
8. associação/pool solidária;
9. painel admin;
10. privacidade, métricas e evidência de testes.

Esta organização ajuda a apresentação a ter uma narrativa clara: primeiro a base, depois os conteúdos, depois a interação do utilizador, depois a personalização, depois a sustentabilidade financeira e solidária, e no fim a robustez técnica.
