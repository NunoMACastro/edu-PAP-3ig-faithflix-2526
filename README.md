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
- qualidade de streaming limitada por plano;
- favoritos, watchlist e histórico pessoal.

### 4.3 Descoberta e recomendação
- pesquisa unificada por título e tema;
- filtros por tipo de conteúdo e critérios de navegação;
- recomendação baseline para melhorar descoberta sem sobrecarga algorítmica de MVP.

### 4.4 Monetização e pool solidária (núcleo diferencial)
Fluxo funcional da pool solidária no MVP:
- planos Pro/Família com entitlements;
- partilha familiar real entre contas existentes;
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

## 6. Como Arrancar o Projeto Localmente

Este guia arranca a implementação existente nas pastas `backend/` e
`frontend/`. Os scripts do `package.json` da raiz apontam para `real_dev/`, que
é uma referência docente privada, pelo que não devem ser usados para arrancar a
implementação dos alunos.

### 6.1 Pré-requisitos

Antes de começar, é necessário ter:

- Node.js `20.19.0` ou superior da linha 20, ou Node.js `22.13.0` ou superior;
- `npm`, incluído na instalação do Node.js;
- acesso a MongoDB Atlas ou a um replica set MongoDB local;
- as portas `3101` (backend) e `5181` (frontend) livres.

É possível confirmar as versões instaladas com:

```bash
node --version
npm --version
```

> O backend exige suporte para transações multi-documento. Uma instância
> MongoDB standalone não é suficiente; deve ser usado MongoDB Atlas ou um
> replica set local configurado explicitamente.

### 6.2 Configurar e arrancar o backend

1. A partir da raiz do repositório, entrar na pasta do backend:

   ```bash
   cd backend
   ```

2. Instalar as dependências:

   ```bash
   npm install
   ```

3. Criar o ficheiro de ambiente local na primeira configuração:

   ```bash
   cp -n .env.example .env
   ```

   A opção `-n` impede que um `.env` existente seja substituído. O ficheiro
   contém configuração sensível e não deve ser enviado para o Git.

4. Editar `backend/.env` e, no mínimo, substituir os placeholders de MongoDB:

   ```dotenv
   NODE_ENV=development
   HOST=127.0.0.1
   PORT=3101
   SERVICE_NAME=faithflix-api
   SESSION_COOKIE_NAME=faithflix_session
   FRONTEND_ORIGIN=http://localhost:5181,http://127.0.0.1:5181
   MONGODB_URI=mongodb+srv://<utilizador>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
   MONGODB_DB_NAME=faithflix_dev
   RATE_LIMIT_PEPPER=
   FORCE_HTTPS=false
   TRUST_PROXY_HOPS=0
   ```

   As variáveis principais são:

   | Variável | Finalidade | Valor local esperado |
   | --- | --- | --- |
   | `MONGODB_URI` | Ligação à base de dados | URI real de Atlas ou de um replica set local |
   | `MONGODB_DB_NAME` | Base de dados usada pela aplicação | Uma base de desenvolvimento, por exemplo `faithflix_dev` |
   | `HOST` / `PORT` | Endereço da API | `127.0.0.1` e `3101` |
   | `FRONTEND_ORIGIN` | Origins autorizadas por CORS | Origins exatas do frontend na porta `5181` |
   | `RATE_LIMIT_PEPPER` | Reforço da chave interna do rate limiting | Pode ficar vazio em desenvolvimento; em produção deve ter pelo menos 32 caracteres |
   | `FORCE_HTTPS` | Obriga a utilização de HTTPS | `false` apenas no desenvolvimento local |
   | `TRUST_PROXY_HOPS` | Número de reverse proxies confiáveis | `0` sem proxy local |

   As restantes variáveis de `backend/.env.example` têm valores locais
   predefinidos ou pertencem a operações específicas. As opções `DEMO_*` e
   `ALLOW_DEMO_*` não são necessárias para o arranque normal e devem permanecer
   desativadas, salvo quando se segue deliberadamente o runbook do dataset de
   demonstração.

5. Arrancar a API em modo de desenvolvimento, com reinício automático após
   alterações ao código:

   ```bash
   npm run dev
   ```

   A API fica disponível em `http://127.0.0.1:3101`. Durante o arranque, o
   backend confirma a ligação, o suporte transacional do MongoDB e os índices
   necessários antes de aceitar pedidos.

6. Noutro terminal, confirmar o estado da API:

   ```bash
   curl http://127.0.0.1:3101/health/live
   curl http://127.0.0.1:3101/health/ready
   ```

   `health/live` confirma que o processo responde. `health/ready` só devolve
   sucesso quando a base de dados está acessível e suporta as transações
   exigidas pela aplicação.

Para executar sem file watching, pode ser usado `npm start`.

### 6.3 Configurar e arrancar o frontend

Manter o backend em execução e abrir um segundo terminal.

1. A partir da raiz do repositório, entrar na pasta do frontend:

   ```bash
   cd frontend
   ```

2. Instalar as dependências:

   ```bash
   npm install
   ```

3. Criar o ficheiro de ambiente local na primeira configuração:

   ```bash
   cp -n .env.example .env
   ```

   A opção `-n` impede que um `frontend/.env` existente seja substituído.

4. Confirmar a configuração em `frontend/.env`:

   ```dotenv
   VITE_API_BASE_URL=http://localhost:3101
   VITE_DEMO_MODE=false
   ```

   `VITE_API_BASE_URL` deve corresponder ao endereço do backend. As variáveis
   com prefixo `VITE_` são incluídas no código entregue ao navegador e, por
   isso, nunca devem conter passwords, tokens ou outros segredos.

5. Arrancar o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

6. Abrir `http://localhost:5181` no navegador.

O frontend usa a porta `5181` em modo estrito: se a porta já estiver ocupada, o
arranque falha em vez de escolher silenciosamente outra porta.

### 6.4 Worker opcional

O worker é um processo separado da API. Só é necessário quando se pretende
executar os ciclos assíncronos/financeiros suportados pela aplicação. Com o
mesmo `backend/.env`, deve ser iniciado num terceiro terminal:

```bash
cd backend
npm run worker
```

### 6.5 Parar e diagnosticar

- usar `Ctrl+C` em cada terminal para parar o frontend, a API e o worker;
- se o backend indicar `MONGODB_TRANSACTIONS_REQUIRED`, confirmar que a URI
  aponta para Atlas ou para um replica set, e não para MongoDB standalone;
- se `health/ready` devolver `503`, confirmar a URI, credenciais, permissões,
  acesso de rede e suporte transacional do MongoDB;
- se o navegador apresentar um erro de CORS, confirmar que o URL aberto está
  listado exatamente em `FRONTEND_ORIGIN`;
- se uma porta estiver ocupada, terminar o processo que a utiliza ou alterar a
  configuração de forma consistente no backend, frontend e CORS.

Para configuração operacional adicional do código nesta pasta, consultar o
[README do backend](backend/README.md).

## 7. Escopo MVP vs Pós-PAP
### MVP (incluído)
- núcleo de streaming e catálogo;
- gestão básica de conta e privacidade;
- pesquisa e recomendação baseline;
- pool solidária completa no fluxo essencial (candidatura, aprovação, rotação, transparência);
- planos Pro/Família, partilha familiar real e qualidade por plano;
- administração mínima para operar o produto.

### Pós-PAP (adiado)
- funcionalidades de comunidade avançada;
- gamificação;
- workflow editorial avançado com denúncias complexas;
- perfis infantis, limites de dispositivos e regras familiares avançadas;
- automações de recomendação e notificação de maior complexidade.

## 8. Requisitos Não Funcionais Críticos
- segurança de sessão e proteção de dados pessoais;
- desempenho consistente no catálogo e no início de reprodução;
- confiabilidade operacional mínima para uso contínuo;
- acessibilidade base e linguagem clara para diferentes perfis de utilizador;
- governança documental e rastreabilidade entre backlog, decisões e evidências.

Fonte canónica RNF: [docs/RNF.md](docs/RNF.md).

### Estado implementado e limites da prova

As funcionalidades descritas neste README representam o escopo do produto e o
objetivo pedagógico; não significam que todos os fluxos estejam concluídos pelos
alunos. A implementação docente em `real_dev/` é uma referência privada e não
é a entrega dos alunos em `backend/` e `frontend/`.

Na baseline auditada em 2026-07-10:

- não existem vídeos reais fornecidos para o player;
- conteúdos publicados sem media permanecem visíveis com
  `mediaStatus: "pending"`, `isPlayable: false` e reprodução desativada;
- MP4/HLS/DASH foram exercitados apenas com fixtures sintéticas locais, que não
  provam vídeo real, 4K, CDN, ABR, DRM, performance ou carga;
- checkout e renovação continuam explicitamente simulados, sem gateway ou
  webhook real;
- `RNF08` e `RNF10` permanecem `NAO_PROVADO` e `RNF23` apenas
  `PARCIAL_VALIDADO`;
- o gate máximo da referência é `GO_LOCAL_COM_RESSALVAS`; produção permanece
  `NO_GO_PRODUCAO`.

O catálogo, a pesquisa, a pool e as restantes funcionalidades só devem ser
apresentados como concluídos na lane dos alunos quando existir evidence própria,
datada e ligada aos respetivos BK.

Operação local e limites atuais:

- [arquitetura técnica](ARCHITECTURE.md);
- [arranque e shutdown local](docs/runbooks/ARRANQUE-E-SHUTDOWN-LOCAL.md);
- [worker local](docs/runbooks/WORKER-LOCAL.md);
- [backup e verificação de restore](docs/runbooks/BACKUP-RESTORE-LOCAL.md);
- [rollback manual local](docs/runbooks/ROLLBACK-MANUAL-LOCAL.md).
- [reset e dataset de demonstração](docs/runbooks/DEMO-DATASET.md).

Estes artefactos descrevem apenas uma baseline local. Não provam CI/deployment,
rollback remoto, backup diário automático, restore real, MongoDB transacional
de produção ou operação contínua. No ambiente auditado em 2026-07-10,
`mongodump` e `mongorestore` não estavam disponíveis; a verificação real de
backup/restore permanece bloqueada pelo ambiente.

## 9. Roadmap Resumido por Fases
1. fundação técnica e identidade da aplicação;
2. catálogo, detalhe e experiência de visualização;
3. subscrição e pool solidária em ciclo completo;
4. endurecimento operacional, qualidade documental e preparação de defesa;
5. planos Pro/Família, partilha familiar real e qualidade por plano.

## 10. Créditos, Licença e Changelog
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
- 2026-06-30: escopo MVP atualizado para incluir MF9 com planos Pro/Família, partilha familiar real e qualidade por plano.
- 2026-07-10: separados escopo, referência privada e estado dos alunos; registadas as limitações de media sintética, pagamentos simulados e `NO_GO_PRODUCAO`.
- 2026-07-12: adicionado o guia passo a passo de configuração e arranque local das implementações em `backend/` e `frontend/`.
