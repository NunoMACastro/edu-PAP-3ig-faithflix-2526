# FaithFlix - Requisitos Não Funcionais (RNF) e Stack Tecnológica

## Índice

1. [Usabilidade e Acessibilidade](#1-usabilidade-e-acessibilidade)
2. [Performance e Escalabilidade](#2-performance-e-escalabilidade)
3. [Segurança e Proteção de Dados](#3-segurança-e-proteção-de-dados)
4. [Compatibilidade e Integração](#4-compatibilidade-e-integração)
5. [Manutenção, Qualidade e Operação](#5-manutenção-qualidade-e-operação)
6. [Experiência de IA e Ética](#6-experiência-de-ia-e-ética)
7. [Localização e Internacionalização](#7-localização-e-internacionalização)
8. [Resumo das Prioridades](#8-resumo-das-prioridades)
9. [Stack atual e opções futuras](#9-stack-atual-e-opções-futuras)
10. [Delimitação de Escopo RNF no MVP (2026-04-17)](#10-delimitação-de-escopo-rnf-no-mvp-2026-04-17)
11. [Licença](#licença)
12. [Changelog](#changelog)

-   [Voltar ao início](../README.md)

---

## 1. Usabilidade e Acessibilidade

| Código | Requisito                                                                                                                                     | Tipo                   | Prioridade |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ---------- |
| RNF01  | A interface deve ser intuitiva, com navegação clara entre catálogo, pesquisa, player, perfil, subscrição e associações.                       | Usabilidade            | Must       |
| RNF02  | Os elementos interativos (botões, cards, links) devem ter estados visuais claros (hover, active, disabled) e feedback imediato ao clique.     | Usabilidade            | Must       |
| RNF03  | O layout deve ser responsivo e adaptado a desktop, tablet e smartphone, mantendo a mesma hierarquia visual.                                   | Usabilidade/Responsive | Must       |
| RNF04  | O design deve cumprir boas práticas de acessibilidade (contraste adequado, tamanho mínimo de fonte, uso de headings e labels semânticos).     | Acessibilidade         | Should     |
| RNF05  | Mensagens de erro e informação devem ser claras, em português de Portugal, indicando ao utilizador o que fazer a seguir.                      | Usabilidade            | Must       |
| RNF06  | O player deve ser simples de usar, com controlos sempre visíveis ou facilmente acessíveis (play/pause, barra de progresso, volume, legendas). | Usabilidade            | Must       |

Nota de robustez da referência docente (2026-07-10): listas pessoais,
continuar a ver, catálogo, pesquisa, detalhe, passagens, ratings, comentários e
conta distinguem loading, erro, vazio e sucesso. Leituras deixam de atualizar o
ecrã depois de cancelamento ou mudança de contexto e permitem retry onde a
falha é recuperável. Escritas concorrentes são bloqueadas/serializadas com busy
state localizado. Alterações otimistas de favoritos e lista para ver mais tarde
são revertidas em falha, sem apresentar sucesso falso. Mensagens e fallbacks
visíveis permanecem em PT-PT; uma sessão operacionalmente indisponível não é
apresentada como logout e um campo parental vazio não é convertido
implicitamente em zero.

Nota de lifecycle frontend da referência docente (2026-07-10): uma
`ErrorBoundary` segura impede que uma exceção de renderização derrube toda a
aplicação e disponibiliza recuperação explícita. As páginas são carregadas por
`React.lazy`/`Suspense`; cada rota usa metadata fechada para definir o título.
O scroll e a transferência de foco para o conteúdo principal acontecem apenas
quando muda o `pathname`, não em alterações de query string, preservando
pesquisa, paginação e filtros acessíveis.

---

## 2. Performance e Escalabilidade

| Código | Requisito                                                                                                                            | Tipo           | Prioridade |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------ | -------------- | ---------- |
| RNF07  | A página inicial (catálogo principal) deve carregar em menos de 3 segundos em condições de rede normais.                             | Performance    | Must       |
| RNF08  | A reprodução de um vídeo deve iniciar em, no máximo, 2 a 3 segundos após o utilizador clicar em "Reproduzir".                        | Performance    | Must       |
| RNF09  | Listagens de catálogo e resultados de pesquisa devem responder em menos de 2 segundos, usando paginação ou carregamento incremental. | Performance    | Must       |
| RNF10  | O sistema deve suportar, pelo menos, 100 utilizadores simultâneos a reproduzir vídeo sem degradação significativa da qualidade.      | Escalabilidade | Should     |
| RNF11  | Recomendações personalizadas devem ser apresentadas em menos de 3 segundos na página "Para si".                                      | Performance    | Should     |
| RNF12  | A arquitetura deve permitir escalar horizontalmente (adicionar instâncias de aplicação/serviços) sem alterações profundas ao código. | Escalabilidade | Could      |

Nota de paginação da referência docente (2026-07-10): listagens
administrativas e pessoais usam `page`/`limit`, `limit <= 50`, metadata
`{ page, limit, total, totalPages }` e ordenação total com `_id` como
desempate. Continuar a ver segue o mesmo envelope, com default 12. A pesquisa
é a exceção intencional: aceita no máximo 24 itens e devolve `page`, `limit`
e `total`; a UI deriva `totalPages`. Estes contratos reduzem volume e races,
mas não provam por si só o objetivo temporal de `RNF09` numa base de dados e
infraestrutura reais.

Nota de prova da referência docente (2026-07-10): `RNF08` e `RNF10` permanecem
`NAO_PROVADO`. Fixtures sintéticas locais podem confirmar eventos do elemento
`video` e a integração dos adapters, mas não representam media, CDN, largura de
banda, transcodificação ou concorrência reais. Nenhuma medição sobre essas
fixtures pode ser apresentada como prova do arranque em 2–3 segundos ou de 100
utilizadores simultâneos.

---

## 3. Segurança e Proteção de Dados

| Código | Requisito                                                                                                                                                                         | Tipo                  | Prioridade |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ---------- |
| RNF13  | Todas as comunicações entre cliente e servidor devem ser feitas sobre HTTPS (TLS 1.2 ou superior).                                                                                | Segurança             | Must       |
| RNF14  | Palavras-passe devem ser armazenadas usando hash seguro (por exemplo, bcrypt) com salt adequado.                                                                                  | Segurança             | Must       |
| RNF15  | Sessões autenticadas devem utilizar cookies HttpOnly, com flags Secure e SameSite ajustadas.                                                                                      | Segurança             | Must       |
| RNF16  | A aplicação deve implementar proteção contra ataques comuns: SQL/NoSQL Injection, XSS, CSRF e brute force no login.                                                               | Segurança             | Must       |
| RNF17  | Dados sensíveis (chaves de API, tokens de gateway de pagamento, credenciais de bases de dados) devem ser mantidos em variáveis de ambiente e nunca em código fonte.               | Segurança             | Must       |
| RNF18  | A gestão de subscrições deve delegar o armazenamento de dados de cartão e outros dados financeiros para o gateway de pagamento, nunca os guardando na base de dados da aplicação. | Segurança/Privacidade | Must       |
| RNF19  | Operações administrativas críticas (gestão de utilizadores, conteúdos, subscrições, associações) devem ser registadas em logs de auditoria.                                       | Auditoria             | Must       |
| RNF20  | Deve existir uma política de cópias de segurança da base de dados (pelo menos diária), com capacidade de recuperação em caso de falha.                                            | Fiabilidade           | Should     |

Nota de validação da referência docente (2026-07-10): bodies JSON exigem os
tipos declarados pelo contrato; números em body não aceitam strings numéricas e
booleanos não aceitam `"true"`/`"false"`. Query e path aceitam apenas strings
escalares, recusando arrays/objetos. `page`/`limit` permanecem strings na
fronteira HTTP e só são convertidos depois de validarem dígitos canónicos.
Texto acima do máximo devolve `400`; nunca é truncado para fabricar um pedido
válido. Snippets pedagógicos anteriores com coerções permissivas ficam
subordinados aos adendos F5 dos respetivos guias.

Nota de aplicação da referência docente (2026-07-10): update, mudança de estado
e reversão de catálogo registam o evento de auditoria na mesma transação da
revisão e da escrita CAS. Checkout/trial, revisão de candidaturas, memberships
de associações, alterações familiares e gestão administrativa de utilizadores
partilham igualmente a sessão transacional com notificações, revogação de
sessões e audit log aplicáveis. Alterações a `integration_settings` e o evento
`integration.update` também fazem commit/rollback na mesma sessão. O fecho
mensal manual e `charity.pool_distribution.created` seguem a mesma regra, com
ator válido, `requestId` e snapshot mínimo; o trigger worker não simula um
administrador. Os eventos administrativos guardam apenas
`action`, ator/alvo, estado mínimo do domínio, campos alterados, `requestId` e
timestamp. Na gestão de utilizadores, `before`/`after` limitam-se a role e estado
operacional; na revisão e membership de associações, registam apenas decisão,
estado e identificadores/datas operacionais necessários. A sanitização recursiva
remove ainda email, telefone, contactos, credenciais, tokens e cookies como
defesa adicional; não são persistidos snapshots pessoais integrais. Fault
injection com doubles locais confirma rollback dos efeitos de domínio, sessões
e auditoria; ainda não existe prova atual contra um replica set MongoDB real.

### Matriz normativa de rate limiting

Os contadores vivem em MongoDB, usam janelas fixas, TTL e chaves HMAC SHA-256
pseudonimizadas. IP, email, token e identificador de utilizador nunca são
persistidos em claro. Os limites abaixo são cumulativos: exceder qualquer
chave devolve `429`, `code: "RATE_LIMITED"` e o header `Retry-After`.

| Operação | Scope | Limite e janela |
| --- | --- | --- |
| Login | falhas por email | 5 / 15 minutos |
| Login | pedidos por IP | 20 / 15 minutos |
| Registo | pedidos por IP | 5 / hora |
| Recuperação | pedidos por email | 3 / hora |
| Recuperação | pedidos por IP | 10 / hora |
| Reset | pedidos por token | 5 / 15 minutos |
| Reset | pedidos por IP | 10 / hora |
| Candidatura de associação | pedidos por IP | 5 / hora |
| Pesquisa | pedidos por IP | 120 / minuto |
| Recomendações | pedidos por utilizador | 60 / minuto |
| Eliminação de conta | pedidos por utilizador | 5 / 15 minutos |
| Eliminação de conta | pedidos por IP | 20 / hora |

---

## 4. Compatibilidade e Integração

| Código | Requisito                                                                                                                                                               | Tipo                       | Prioridade |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ---------- |
| RNF21  | A aplicação deve ser compatível com os principais navegadores modernos: Chrome, Edge, Firefox e Safari.                                                                 | Compatibilidade            | Must       |
| RNF22  | O layout responsivo deve ser testado em diferentes resoluções (telemóvel, tablet, portátil, desktop largo).                                                             | Compatibilidade/Responsive | Must       |
| RNF23  | O sistema de streaming deve suportar protocolos HLS/DASH para maximizar compatibilidade com dispositivos.                                                               | Streaming                  | Must       |
| RNF24  | Deve existir integração com, pelo menos, um gateway de pagamento internacional (ex.: Stripe) e, idealmente, com métodos comuns em Portugal (cartão, MBWay via gateway). | Integração                 | Should     |
| RNF25  | A aplicação deve expor uma API estável (REST ou GraphQL) para o frontend web e futuros clientes (aplicação móvel, Smart TV).                                            | Integração                 | Should     |
| RNF26  | Relatórios simples (ex.: subscrições ativas, distribuição por associações) devem poder ser exportados em formato CSV e/ou PDF.                                          | Compatibilidade            | Could      |

Nota de streaming da referência docente (2026-07-10): `RNF23` está
`PARCIAL_VALIDADO`. O player reconhece uma única `source` autenticada com
protocolo fechado `progressive|hls|dash`, usa HLS nativo ou `hls.js` e usa
`dashjs` para MPEG-DASH. A prova atual é unitária/local com fixtures sintéticas,
sem pedidos externos, e não valida entrega HLS/DASH real, ABR, CDN, DRM ou 4K.

Nota de browsers da referência docente (2026-07-10): a automação local cobre
engines Chromium, Firefox e WebKit apenas na suite sintética de media; Axe foi
executado em Chromium. Chromium não equivale a Google Chrome branded e WebKit
não equivale a Safari real. Chrome branded, Edge branded e Safari real estão
`NAO_EXECUTADO`, conforme
`docs/evidence/MF9/MATRIZ-BROWSERS-MANUAL.md`; por isso `RNF21/RNF22`
permanecem apenas `PARCIAL_VALIDADO`.

Nota de integração da referência docente (2026-07-10): checkout e renovação
continuam deliberadamente simulados por um adapter local determinístico com
`provider: "faithflix-simulated"`. Não existem gateway, webhooks ou métodos de
pagamento reais. Por isso, `RNF24` permanece não validado; os testes locais não
podem ser apresentados como integração financeira externa.

---

## 5. Manutenção, Qualidade e Operação

| Código | Requisito                                                                                                                                                         | Tipo       | Prioridade |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ---------- |
| RNF27  | O backend deve seguir uma arquitetura modular por domínio (ex.: catálogo, utilizadores, subscrições, associações, recomendações).                                 | Manutenção | Must       |
| RNF28  | O frontend deve ser organizado em componentes reutilizáveis (cards de conteúdo, carrosséis, layouts de página, componentes de formulário).                        | Manutenção | Must       |
| RNF29  | Devem existir testes automatizados, pelo menos para: autenticação, criação e cancelamento de subscrições, reprodução básica de conteúdo e rotação de associações. | Qualidade  | Should     |
| RNF30  | A aplicação deve gerar logs estruturados com níveis (info, warn, error) e contexto suficiente para diagnosticar problemas em produção.                            | Operação   | Must       |
| RNF31  | Deve existir um endpoint de health-check (por exemplo, `/health`) usado pelo sistema de deployment/monitorização.                                                 | Operação   | Should     |
| RNF32  | O processo de deployment deve permitir rollback em caso de falha, sem perda de dados.                                                                             | Manutenção | Should     |
| RNF33  | Deve ser mantido um ficheiro de documentação técnica (por exemplo, `ARCHITECTURE.md`) descrevendo módulos principais, fluxos e integrações.                       | Manutenção | Should     |

Nota operacional da referência docente — Fase 6 (2026-07-10): `RNF31` dispõe
agora de liveness em `GET /health/live`, readiness em `GET /health/ready` e
alias compatível `GET /health`. As rotas correm antes de sessão/CSRF, usam
`Cache-Control: no-store`; liveness não consulta MongoDB e readiness aplica um
deadline total de `500 ms`, devolvendo `503` sanitizado quando a dependência
falha. A API drena HTTP antes de fechar MongoDB em `SIGTERM`/`SIGINT`; o worker
interrompe o polling, aguarda o ciclo ativo e fecha a ligação uma única vez.

Para `RNF20`, existem CLIs locais fail-closed de backup e verificação de restore
com URI/base dedicadas, opt-in por operação, archive/manifest `0600`, SHA-256,
inventário e target temporário com ownership/cleanup. Os testes com doubles não
substituem infraestrutura: `mongodump` e `mongorestore` não estavam disponíveis
no ambiente auditado, pelo que backup/restore real permanece
`BLOQUEADO_AMBIENTE` e a política diária histórica não está demonstrada. Para
`RNF32`, existe apenas um procedimento de rollback manual local; CI, deployment
e rollback remoto continuam `ACEITE_COM_RISCO`. `RNF33` passa a ter
`ARCHITECTURE.md` e runbooks locais, sem converter documentação em prova de
produção.

Limite de prova da Fase 5 (2026-07-10): os contratos de paginação,
cancelamento, anti-stale, busy state e rollback foram cobertos por testes
unitários/comportamentais locais. No backend, a persistência dessas provas usa
doubles/in-memory; no frontend, as APIs são simuladas. Esta evidência não
valida a base dos alunos, um MongoDB/replica set real, latência de produção ou
um fluxo E2E completo com dados persistidos.

---

## 6. Experiência de IA e Ética

| Código | Requisito                                                                                                                                                                           | Tipo            | Prioridade |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ---------- |
| RNF34  | O sistema de recomendação deve apresentar, sempre que possível, uma explicação simples para cada grupo de conteúdos sugeridos (ex.: "porque viu X", "baseado nos temas que segue"). | Explicabilidade | Should     |
| RNF35  | A lógica de recomendação não deve promover conteúdo que contrarie os critérios teológicos definidos pelos curadores (deve respeitar a filtragem de catálogo).                       | Ética/Curadoria | Must       |
| RNF36  | A IA de recomendação deve evitar perfis de recomendação enviesados e permitir reajustes manuais por administradores/curadores.                                                      | Ética           | Should     |
| RNF37  | Os dados usados para recomendação (histórico, favoritos, ratings) devem ser tratados apenas para esse fim e não partilhados com terceiros.                                          | Privacidade     | Must       |

Nota de implementação `real_dev` (2026-07-02): o módulo de recomendações mantém IA baseline auditável, com `GET /api/recommendations/me`, feedback/eventos autenticados, explicações por grupo e sem envio de histórico detalhado para terceiros. A camada opcional `content_embeddings` usa apenas texto editorial de conteúdos publicados, nao persiste embeddings de utilizador e nao devolve vectores na API publica. Qualquer provider externo de embeddings fica desligado por defeito e sujeito a revisão de privacidade antes de ativação.

---

## 7. Localização e Internacionalização

| Código | Requisito                                                                                                                                                    | Tipo        | Prioridade |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- | ---------- |
| RNF38  | A interface deve estar totalmente em português de Portugal por defeito.                                                                                      | Localização | Must       |
| RNF39  | O sistema deve ser preparado para futura tradução para outros idiomas (suporte básico a i18n).                                                               | Localização | Could      |
| RNF40  | Datas, horas e formatos numéricos devem seguir o padrão europeu (por exemplo, `dd/mm/aaaa` e vírgula como separador decimal na interface, quando aplicável). | Localização | Should     |

---

## 8. Resumo das Prioridades

| Categoria                         | Nº RNF | Must   | Should | Could |
| --------------------------------- | ------ | ------ | ------ | ----- |
| Usabilidade e Acessibilidade      | 6      | 4      | 2      | 0     |
| Performance e Escalabilidade      | 6      | 3      | 2      | 1     |
| Segurança e Proteção de Dados     | 8      | 7      | 1      | 0     |
| Compatibilidade e Integração      | 6      | 3      | 2      | 1     |
| Manutenção, Qualidade e Operação  | 7      | 2      | 4      | 1     |
| Experiência de IA e Ética         | 4      | 2      | 2      | 0     |
| Localização e Internacionalização | 3      | 1      | 1      | 1     |
| **Total**                         | **40** | **22** | **14** | **4** |

---

## 9. Stack atual e opções futuras

### 9.0. Baseline atual da referência docente

A baseline descrita e validada localmente usa **React 19 + Vite 8 + JavaScript**
no frontend, `fetch`/`AbortController` no cliente HTTP, CSS próprio organizado
por camadas, **Node.js + Express** no backend e **MongoDB** como persistência.
Esta é a stack autoritativa para interpretar os contratos atuais. Não existe
alojamento ou deployment autoritativo nesta baseline.

As tecnologias das secções seguintes são opções de evolução e não descrevem o
runtime atual. Adotá-las exige decisão arquitetural, migração e nova validação;
não são instruções para substituir silenciosamente React/Vite/fetch ou o CSS
existente.

### 9.1. Opção futura de frontend

-   Framework: **Next.js (React)** com **Axios** para chamadas API
    -   Vantagens: Server-Side Rendering (SSR) para melhor performance e SEO, rotas simples, suporte nativo a API routes (se necessário).
-   Linguagem: **TypeScript** ou **JavaScript**
    -   TypeScript recomendado para maior segurança e manutenção.
-   Estilos: **Tailwind CSS** e/ou **Styled Components**
    -   Tailwind para rapidez e consistência, Styled Components para estilos dinâmicos.

**Alojamento:** **Vercel** (ideal para Next.js) ou **Netlify** ou **Render**

### 9.2. Backend atual e opções de evolução

-   Runtime: **Node.js (LTS)**
-   Framework: **Express** estruturado em módulos com padrão MVC
-   Autenticação:
    -   Cookies HttpOnly com JWT ou sessão baseada em tokens armazenados no servidor.
-   Organização por módulos (exemplos):
    -   `users` (utilizadores e perfis)
    -   `auth` (autenticação)
    -   `catalog` (conteúdos e metadados)
    -   `streaming` (integração com CDN/serviço de vídeo)
    -   `subscriptions` (subscrições e faturação)
    -   `charities` (associações e pool rotativa)
    -   `recommendations` (IA de sugestão)
    -   `notifications` (emails, notificações internas)

**Alojamento:** A definir conforme necessidades

### 9.3. Base de dados atual e alternativa futura

-   Motor principal: **Mongodb Atlas** (NoSQL)
    -   Vantagens: Flexibilidade no esquema, fácil escalabilidade, bom suporte a consultas complexas.
-   Alternativa: **PostgreSQL** (SQL)
    -   Vantagens: Integridade referencial, consultas avançadas, suporte a JSONB para dados semi-estruturados.

### 9.4. Streaming de vídeo futuro

-   Armazenamento e distribuição:
    -   **Cloudflare Stream** ou **AWS S3 + CloudFront**
-   Idealmente, o backend não serve diretamente os ficheiros de vídeo, apenas gere permissões e URLs temporárias.
-   **ELEVADO** nível de complexidade para alunos do 3º ano, considerar simplificar.

### 9.5. Integração de Pagamentos

-   Baseline local atual: funcionalidade exclusivamente simulada, sem dados de cartão, gateway ou webhooks.
-   Checkout e trial exigem `Idempotency-Key`; o backend persiste ledger financeiro v2, subscrição e notificação na mesma transação.
-   Um worker Node.js separado usa leases MongoDB por subscrição/ciclo e por mês para renovar, expirar trials, concluir cancelamentos e fechar a pool do mês UTC anterior.
-   O resultado de renovação é determinístico e configurável apenas para testes/apoio (`approved` ou `failed`); não deve ser confundido com autorização de pagamento real.
-   Uma futura integração que pretenda satisfazer `RNF24` terá de substituir o adapter por gateway real, validar webhooks assinados e manter a mesma idempotência/atomicidade sem guardar dados de cartão.

### 9.6. Recomendações e IA

-   Primeira fase:
    -   Recomendação baseada em regras simples (histórico, favoritos, temas preferidos).
-   Fase seguinte:
    -   Sistema híbrido (conteúdo + colaborativo) com base em:
        -   Histórico de visualização
        -   Ratings
        -   Temas preferidos
-   Tecnologia:
    -   Serviço interno em Node.js ou Python (FastAPI)
    -   Possível uso de embeddings (OpenAI ou similar) para afinamento sem ser o foco principal.
    -   No `real_dev` atual, a fase robusta usa Node.js interno com scoring ponderado, feedback explícito, eventos agregados e embeddings opcionais de conteúdo quando existem vectores em `content_embeddings`.
    -   Provider externo continua desligado por defeito; o modo `deterministic` serve testes/desenvolvimento e nao representa IA semantica real.

---

## 10. Delimitação de Escopo RNF no MVP (2026-04-17)

- O rebaseline do MVP em FaithFlix corta funcionalidades RF específicas, mas **não remove RNF** da base normativa.
- Todos os `RNF01..RNF40` mantêm-se ativos como contrato de qualidade, segurança, operação e conformidade.
- Aplicação prática no MVP corrente:
  - requisitos de IA (`RNF34..RNF37`) são cumpridos em modo baseline, sem expansão para modelos avançados;
  - requisitos de operação e hardening mantêm-se inalterados para fecho de gates `S4/S8/S12/S13`.

---

## Licença

Projeto académico orientado para fins educativos no âmbito da PAP.

---

## Changelog

-   **2024-06-15** - Versão inicial dos Requisitos Não Funcionais (RNF) e Stack Tecnológica Sugerida.
-   **2026-04-13** - Nome do projeto uniformizado para **FaithFlix** e revisão de coerência com a documentação de planificação.
-   **2026-04-17** - Adicionada delimitação formal de escopo RNF no MVP alinhada ao rebaseline do plano mestre.
-   **2026-07-10** - Documentadas a fronteira transacional/auditável da referência, a baseline de worker com leases e a não conformidade assumida de `RNF24` enquanto existir apenas pagamento simulado.
-   **2026-07-10** - Registados `RNF08`/`RNF10` como `NAO_PROVADO` e `RNF23` como `PARCIAL_VALIDADO`, sem promover fixtures sintéticas a prova de streaming real.
-   **2026-07-10** - Documentados paginação limitada, ordem estável, cancelamento, anti-stale, busy state e rollback, com prova estritamente local e sem promover o estado dos alunos.
-   **2026-07-10** - Acrescentados retry recuperável, codificação de IDs/slugs, sessão indisponível distinta de logout e validação parental sem coerção de vazio.
-   **2026-07-10** - Fixado o contrato transversal de tipos JSON reais, query/path escalares, `page`/`limit` como strings HTTP e excesso de texto rejeitado sem truncagem.
-   **2026-07-10** - Consolidada a matriz HMAC/TTL de rate limiting, o lifecycle acessível das rotas e a separação entre a stack React/Vite/fetch atual e opções tecnológicas futuras.
