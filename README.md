# FaithFlix

## Metadados
- Nome da app: FaithFlix
- Ano letivo: 2025/2026
- Turma: 12º IG
- Nome dos alunos: Matheus, Kaue, Davi, Mateus
- Orientador: Nuno Castro e Cláudia Marques

## 1. Visão Geral Extensa da Aplicação
O FaithFlix é uma plataforma de streaming cristão concebida para unir consumo audiovisual, formação espiritual e impacto social num único produto digital. A aplicação combina catálogo curado de filmes, séries e documentários com ferramentas de descoberta, continuidade de visualização e gestão de perfis. Em paralelo, incorpora um mecanismo solidário de redistribuição de valor para associações cristãs, tornando a subscrição parte de um ciclo de apoio comunitário mensurável.

No contexto da PAP de Informática de Gestão (12.º ano), o projeto foi desenhado para trabalhar competências técnicas e de gestão: modelação de produto, decisões de escopo, rastreabilidade entre backlog e documentação, privacidade de dados e governação operacional. O FaithFlix posiciona-se como um caso prático de produto digital com propósito social e com requisitos de operação realistas.

## 2. Problema que Resolve e Proposta de Valor
Plataformas genéricas de streaming raramente oferecem curadoria cristã consistente, nem mecanismos transparentes de apoio direto a organizações religiosas e sociais. O FaithFlix resolve esta lacuna em três frentes:

- curadoria temática e teológica de conteúdos;
- experiência de visualização moderna, comparável ao padrão esperado em plataformas comerciais;
- modelo de subscrição com pool solidária, onde parte da receita é distribuída com regras explícitas e auditáveis.

A proposta de valor está na integração destas dimensões sem fragmentação: o utilizador encontra conteúdo relevante, acompanha o seu consumo e participa num ecossistema com retorno social claro.

## 3. Público-Alvo e Stakeholders
- famílias e jovens cristãos que procuram conteúdo alinhado com valores e orientação espiritual;
- igrejas, grupos de estudo e líderes comunitários que usam conteúdos como apoio pedagógico;
- associações beneficiárias da pool solidária;
- equipa editorial e moderadores, responsáveis por qualidade e conformidade do catálogo;
- administradores funcionais/financeiros, responsáveis por subscrições, distribuição e auditoria.

## 4. Funcionalidades Principais por Domínio Funcional
### 4.1 Identidade, acesso e perfis
- registo, autenticação e recuperação de acesso;
- gestão de perfil de utilizador e preferências de consumo;
- consentimentos e operações de privacidade (exportação e eliminação de dados).

### 4.2 Catálogo e experiência de streaming
- gestão de catálogo e taxonomias de conteúdo;
- página de detalhe com metadados essenciais;
- reprodução com continuidade (“continuar a ver”);
- favoritos, watchlist e histórico pessoal.

### 4.3 Descoberta e recomendação
- pesquisa unificada por título e tema;
- filtros por tipo de conteúdo e critérios de navegação;
- recomendação baseline para melhorar descoberta sem sobrecarga algorítmica de MVP.

### 4.4 Monetização e pool solidária (núcleo diferencial)
Fluxo funcional da pool solidária no MVP:
- candidatura de associação elegível;
- validação/aprovação para entrada na pool;
- distribuição mensal por rotação/regras definidas;
- registo histórico e transparência da distribuição por associação.

### 4.5 Operação, administração e governação
- gestão administrativa de utilizadores e estados de conta;
- políticas mínimas de notificação transacional;
- relatórios operacionais essenciais para acompanhamento do ciclo solidário.

Fontes funcionais canónicas: [docs/RF.md](docs/RF.md), [docs/planificacao/backlogs/BACKLOG-MVP.md](docs/planificacao/backlogs/BACKLOG-MVP.md).

## 5. Arquitetura/Stack Recomendada (Alto Nível)
- frontend web moderno com componentes reutilizáveis e navegação responsiva;
- backend modular por domínios (identidade, catálogo, streaming, subscrição, pool solidária);
- base de dados principal `MongoDB Atlas` no MVP (com alternativa `PostgreSQL` para evolução pós-PAP), mantendo rastreabilidade e consistência por desenho de modelo;
- camada de observabilidade (logs, métricas, health-checks);
- integração de pagamento em modo MVP controlado.

A arquitetura privilegia separação de responsabilidades, rastreabilidade de decisões e simplicidade de operação para contexto PAP.

## 6. Escopo MVP vs Pós-PAP
### MVP (incluído)
- núcleo de streaming e catálogo;
- gestão básica de conta e privacidade;
- pesquisa e recomendação baseline;
- pool solidária completa no fluxo essencial (candidatura, aprovação, rotação, transparência);
- administração mínima para operar o produto.

### Pós-PAP (adiado)
- funcionalidades de comunidade avançada;
- gamificação;
- workflow editorial avançado com denúncias complexas;
- perfis familiares/dispositivos com regras avançadas;
- automações de recomendação e notificação de maior complexidade.

## 7. Requisitos Não Funcionais Críticos
- segurança de sessão e proteção de dados pessoais;
- desempenho consistente no catálogo e no início de reprodução;
- confiabilidade operacional mínima para uso contínuo;
- acessibilidade base e linguagem clara para diferentes perfis de utilizador;
- governança documental e rastreabilidade entre backlog, decisões e evidências.

Fonte canónica RNF: [docs/RNF.md](docs/RNF.md).

## 8. Roadmap Resumido por Fases
1. fundação técnica e identidade da aplicação;
2. catálogo, detalhe e experiência de visualização;
3. subscrição e pool solidária em ciclo completo;
4. endurecimento operacional, qualidade documental e preparação de defesa.

## 9. Créditos, Licença e Changelog
### Créditos
- Projeto: FaithFlix
- Tipo: PAP - Curso Profissional de Informática de Gestão
- Ano letivo: 2025/2026
- Equipa: Matheus, Kaue, Davi, Mateus
- Orientador: Nuno Castro e Cláudia Marques

### Licença
Projeto académico para fins educativos.

### Changelog
- 2026-04-17: README reescrito integralmente com estrutura canónica, escopo MVP/pós-PAP e alinhamento com plano mestre.
