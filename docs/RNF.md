# Faithflix - Requisitos Não Funcionais (RNF) e Stack Tecnológica

## Índice

1. [Usabilidade e Acessibilidade](#1-usabilidade-e-acessibilidade)
2. [Performance e Escalabilidade](#2-performance-e-escalabilidade)
3. [Segurança e Proteção de Dados](#3-segurança-e-proteção-de-dados)
4. [Compatibilidade e Integração](#4-compatibilidade-e-integração)
5. [Manutenção, Qualidade e Operação](#5-manutenção-qualidade-e-operação)
6. [Experiência de IA e Ética](#6-experiência-de-ia-e-ética)
7. [Localização e Internacionalização](#7-localização-e-internacionalização)
8. [Resumo das Prioridades](#8-resumo-das-prioridades)
9. [Stack Tecnológica Sugerida](#9-stack-tecnológica-sugerida)
10. [Licença](#licença)
11. [Changelog](#changelog)

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

---

## 6. Experiência de IA e Ética

| Código | Requisito                                                                                                                                                                           | Tipo            | Prioridade |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ---------- |
| RNF34  | O sistema de recomendação deve apresentar, sempre que possível, uma explicação simples para cada grupo de conteúdos sugeridos (ex.: "porque viu X", "baseado nos temas que segue"). | Explicabilidade | Should     |
| RNF35  | A lógica de recomendação não deve promover conteúdo que contrarie os critérios teológicos definidos pelos curadores (deve respeitar a filtragem de catálogo).                       | Ética/Curadoria | Must       |
| RNF36  | A IA de recomendação deve evitar perfis de recomendação enviesados e permitir reajustes manuais por administradores/curadores.                                                      | Ética           | Should     |
| RNF37  | Os dados usados para recomendação (histórico, favoritos, ratings) devem ser tratados apenas para esse fim e não partilhados com terceiros.                                          | Privacidade     | Must       |

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

## 9. Stack Tecnológica Sugerida

### 9.1. Frontend

-   Framework: **Next.js (React)** com **Axios** para chamadas API
    -   Vantagens: Server-Side Rendering (SSR) para melhor performance e SEO, rotas simples, suporte nativo a API routes (se necessário).
-   Linguagem: **TypeScript** ou **JavaScript**
    -   TypeScript recomendado para maior segurança e manutenção.
-   Estilos: **Tailwind CSS** e/ou **Styled Components**
    -   Tailwind para rapidez e consistência, Styled Components para estilos dinâmicos.

**Alojamento:** **Vercel** (ideal para Next.js) ou **Netlify** ou **Render**

### 9.2. Backend

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

### 9.3. Base de Dados

-   Motor principal: **Mongodb Atlas** (NoSQL)
    -   Vantagens: Flexibilidade no esquema, fácil escalabilidade, bom suporte a consultas complexas.
-   Alternativa: **PostgreSQL** (SQL)
    -   Vantagens: Integridade referencial, consultas avançadas, suporte a JSONB para dados semi-estruturados.

### 9.4. Streaming de Vídeo

-   Armazenamento e distribuição:
    -   **Cloudflare Stream** ou **AWS S3 + CloudFront**
-   Idealmente, o backend não serve diretamente os ficheiros de vídeo, apenas gere permissões e URLs temporárias.
-   **ELEVADO** nível de complexidade para alunos do 3º ano, considerar simplificar.

### 9.5. Integração de Pagamentos

-   Funcionalidade simulada
-   Backend responsável por criar sessões de checkout e gerir webhooks para:
    -   Subscrição criada
    -   Pagamento falhado
    -   Cancelamento / renovação

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

---

## Licença

Projeto académico orientado para fins educativos no âmbito da PAP.

---

## Changelog

-   **2024-06-15** - Versão inicial dos Requisitos Não Funcionais (RNF) e Stack Tecnológica Sugerida.
