# Faithflix

O Faithflix é uma plataforma de streaming cristão que reúne filmes, séries e documentários com curadoria teológica, integrando estudo bíblico e impacto social num único serviço. A aplicação oferece um catálogo selecionado, ferramentas de descoberta avançada, perfis familiares, recomendações personalizadas e recursos devocionais associados ao conteúdo audiovisual.

Para além do entretenimento, o Faithflix integra materiais de estudo (passagens bíblicas, notas teológicas e guias de reflexão) diretamente nos títulos, permitindo uma experiência mais profunda e formativa. O modelo de subscrição inclui ainda um sistema solidário: uma percentagem das receitas mensais é distribuída por uma pool rotativa de associações cristãs previamente aprovadas.

A plataforma inclui ferramentas editoriais, moderação, gestão de utilizadores, privacidade/RGPD e painéis administrativos completos, garantindo segurança, fiabilidade e qualidade de operação. O Faithflix foi desenvolvido no âmbito da PAP do Curso Profissional de Informática de Gestão, combinando tecnologia moderna com princípios de acessibilidade e boas práticas de desenvolvimento web.

---

**Indíce**

1. [Contexto do Projeto](#contexto-do-projeto)
2. [Visão e Objetivos](#visão-e-objetivos)
3. [Público-Alvo e Stakeholders](#público-alvo-e-stakeholders)
4. [Funcionalidades Principais](#funcionalidades-principais)
5. [Requisitos Não Funcionais Essenciais](#requisitos-não-funcionais-essenciais)
6. [Stack e Arquitetura Recomendada](#stack-e-arquitetura-recomendada)
7. [Roadmap para o MVP (inclui todos os RF)](#roadmap-para-o-mvp-inclui-todos-os-rf)
8. [Identificação e Créditos](#identificação-e-créditos)
9. [Licença](#licença)
10. [Changelog](#changelog)

---

## Contexto do Projeto

-   Catálogo premium dedicado a filmes, séries, documentários e recursos devocionais com curadoria teológica.
-   Operação focada em garantir acesso seguro a conteúdos cristãos e apoiar associações de caridade via pool rotativa.
-   Envolve equipas editoriais, moderadores, administradores, utilizadores finais e parceiros de distribuição.

---

## Visão e Objetivos

1. Disponibilizar um serviço de streaming moderno e responsivo com funcionalidades comparáveis a plataformas comerciais.
2. Integrar estudo bíblico e recursos pastorais diretamente no conteúdo audiovisual.
3. Financiar mensalmente associações cristãs através de percentagem da receita de subscrições.
4. Fornecer ferramentas administrativas robustas, com auditoria e conformidade RGPD.

---

## Público-Alvo e Stakeholders

-   **Famílias e jovens cristãos** – consumo de conteúdo e participação comunitária.
-   **Igrejas e líderes** – curadoria, estudos bíblicos e recomendações de conteúdo.
-   **Associações parceiras** – beneficiam da distribuição solidária.
-   **Equipa editorial e moderadores** – gestão do catálogo e curadoria.
-   **Administradores e finanças** – controlo de subscrições, métricas, pagamentos e segurança.

---

## Funcionalidades Principais

### Identidade, Perfis e Segurança

-   Registo/login (RF01–RF05), recuperação de password, papéis (utilizador, moderador, administrador) e perfis partilhados.
-   Preferências de idioma, filtros de maturidade e controlo parental com PIN.
-   Sessões seguras (cookies HttpOnly), deteção de anomalias e gestão de dispositivos.

### Catálogo e Curadoria

-   Gestão de conteúdos com metadados ricos, taxonomias teológicas, estados de publicação e histórico de revisões (RF06–RF10).
-   Conteúdo destacado com trailers, galerias, referências bíblicas e recursos adicionais (estudos, devocionais, podcasts).
-   Workflow editorial com aprovação, rejeição, duplicação e rollback.

### Streaming e Experiência de Visualização

-   Entrega adaptativa HLS/DASH, seleção de áudio/legendas, qualidade manual, “Continuar a ver” e watchlist (RF11–RF18).
-   Favoritos, histórico sincronizado e dispositivos autorizados.
-   Estatísticas de visualização para recomendações e métricas administrativas.

### Descoberta, IA e Comunidade

-   Pesquisa unificada, filtros e ordenação, carrosséis temáticos e conteúdos relacionados (RF22–RF25).
-   Recomendações IA personalizadas baseadas em favoritos, histórico e ratings (RF26–RF30), com explicação e opt-out.
-   Estudo bíblico integrado: planos temáticos por série, devocionais ligados a episódios, comparações de traduções (RF31–RF34).
-   Comentários curtos moderados, ratings agregados e gamificação opcional (RF19–RF21, RF35–RF39).

### Subscrições e Pool Solidária

-   Planos mensais/anuais, upgrades/downgrades, faturação automática e gestão de falhas (RF40–RF44).
-   Pool rotativa que distribui percentagem das subscrições por associações escolhidas pela comunidade (RF45–RF49).
-   Relatórios transparentes por associação, histórico de contribuições e comunicação de impacto social.

### Operação e Governança

-   Painel administrativo para catálogo, utilizadores, associações, notificações e métricas (RF50–RF55).
-   Gestão de moderação, auditorias, logs de integrações e configuração de notificações (email, push, in-app).
-   Ferramentas para privacidade/RGPD: exportação, eliminação, consentimentos e políticas.

> Detalhes completos encontram-se em [`docs/RF.md`](docs/RF.md#índice).

---

## Requisitos Não Funcionais Essenciais

-   **Usabilidade/Acessibilidade** – UI responsiva, contraste AA, mensagens claras em PT-PT, player intuitivo (RNF01–RNF06).
-   **Performance** – Catálogo inicial <3s, stream ≤3s após “play”, pesquisa e recomendações ≤2–3s, suporte ≥100 streams simultâneos (RNF07–RNF12).
-   **Segurança & RGPD** – HTTPS, hashing seguro, cookies protegidos, encriptação de dados sensíveis, políticas de retenção e consentimento explícito (RNF13–RNF22).
-   **Compatibilidade/Integração** – Browsers modernos, exportações (CSV/PDF), gateways de pagamento, APIs internas para futuras integrações (RNF21–RNF26).
-   **Operação** – Arquitetura modular, testes críticos, logs estruturados, health-checks, backups e CI/CD (RNF27–RNF33).
-   **IA Ética** – Explicabilidade, mitigação de viés, respeito por preferências do utilizador e anonimização de dados (RNF34–RNF37).
-   **Localização** – Português europeu com preparação para internacionalização (RNF38–RNF40).

>

---

## Stack e Arquitetura Recomendada

```
frontend/   # Next.js + TypeScript, Tailwind CSS, Zustand/React Query
backend/    # NestJS/Express modular, Prisma/TypeORM, serviços por domínio
streaming/  # Integração Cloudflare Stream ou AWS S3 + CloudFront
docs/       # RF, RNF, arquitetura, decisões técnicas e testes
scripts/    # Automatizações, ingestão de catálogo e tooling DevOps
```

-   **Base de dados:** PostgreSQL (dados relacionais) + Redis (cache/sessões).
-   **Pagamentos:** Stripe/MBWay com webhooks para subscrições e pool solidária.
-   **Observabilidade:** Logs centralizados, métricas, alertas e backups automáticos.
-   **Deploy:** Render/Railway/Vercel com pipelines GitHub Actions.

---

## Roadmap para o MVP (inclui todos os RF)

1. **Fase 1 - Fundacional:** identidade, perfis, catálogo inicial, player básico, painel administrativo mínimo.
2. **Fase 2 - Experiência Premium:** pesquisa avançada, recomendações IA, favoritos/watchlist, estudo bíblico integrado e comunidade.
3. **Fase 3 - Monetização Solidária:** subscrições completas, pool de associações, relatórios, notificações e processos financeiros.
4. **Fase 4 - Operação e Escala:** monitorização, auditorias, automação editorial, integrações com CDN e otimizações de performance.

---

## Identificação e Créditos

> **Projeto:** Faithflix  
> **Tipo:** PAP - Curso Profissional de Informática de Gestão  
> **Áreas:** Programação · Gestão · Base de Dados  
> **Ano letivo:** 2025/2026  
> **Versão:** 1.0  
> **Equipa:** [Matheus, Mateus, Davi, Kaue]  
> **Professor Orientador:** Nuno Castro e Cláudia Marques

---

## Licença

Projeto académico. Utilização exclusivamente para fins educativos no âmbito da PAP.

---

## Changelog

-   **2024-04-27** – README uniformizado com nova estrutura, funcionalidades detalhadas, roadmap e créditos.
