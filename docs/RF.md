# FaithFlix - Requisitos Funcionais (RF)

## Índice

1. [Identidade, Contas e Perfis](#1-identidade-contas-e-perfis)
2. [Catálogo e Metadados](#2-catálogo-e-metadados)
3. [Streaming e Reprodutor](#3-streaming-e-reprodutor)
4. [Favoritos, Watchlist e Histórico](#4-favoritos-watchlist-e-histórico)
5. [Classificações e Feedback](#5-classificações-e-feedback)
6. [Pesquisa e Descoberta](#6-pesquisa-e-descoberta)
7. [Recomendações IA](#7-recomendações-ia)
8. [Subscrições](#8-subscrições)
9. [Pool Rotativa de Associações](#9-pool-rotativa-de-associações)
10. [Notificações](#10-notificações)
11. [Privacidade e RGPD](#11-privacidade-e-rgpd)
12. [Administração e Operação](#12-administração-e-operação)
13. [Critérios de Aceitação](#critérios-de-aceitação)
14. [Sugestão de MVP organizado por fases e RF](#sugestão-de-mvp-organizado-por-fases-e-rf)
15. [Licença](#licença)
16. [Changelog](#changelog)

-   [Voltar ao início](../README.md)

---

## Requisitos Funcionais

> Nota de numeracao: apos rebaseline do MVP (2026-04-17), alguns IDs RF ficaram descontinuados por remocao de escopo. A numeracao foi mantida para preservar historico e rastreabilidade.

### 1. Identidade, Contas e Perfis

| Código | Requisito                    | Atores        | Prioridade | Dependências |
| ------ | ---------------------------- | ------------- | ---------- | ------------ |
| RF01   | Registo de utilizador        | Visitante     | Must       | -            |
| RF02   | Autenticação e sessão segura | Utilizador    | Must       | RF01         |
| RF03   | Edição de perfil             | Utilizador    | Should     | RF02         |
| RF04   | Papéis de utilizador         | Administrador | Must       | RF02         |
| RF05   | Recuperação de password      | Utilizador    | Must       | RF01         |

---

### 2. Catálogo e Metadados

| Código | Requisito                        | Atores            | Prioridade | Dependências |
| ------ | -------------------------------- | ----------------- | ---------- | ------------ |
| RF06   | Gestão de catálogo               | Admin/Moderador   | Must       | RF04         |
| RF07   | Temas e taxonomias               | Moderador/Curador | Must       | RF06         |
| RF08   | Página de detalhes               | Utilizador        | Must       | RF06         |
| RF09   | Publicação e estados do conteúdo | Admin             | Must       | RF06         |
| RF10   | Histórico e reversões            | Admin             | Could      | RF06         |

---

### 3. Streaming e Reprodutor

| Código | Requisito                      | Atores     | Prioridade | Dependências |
| ------ | ------------------------------ | ---------- | ---------- | ------------ |
| RF11   | Reproduzir conteúdo adaptativo | Utilizador | Must       | RF02         |
| RF12   | Continuar a ver                | Utilizador | Must       | RF11         |
| RF13   | Seleção de legendas/áudio      | Utilizador | Should     | RF11         |
| RF14   | Controlo parental              | Utilizador | Should     | RF03         |
| RF15   | Ajuste de qualidade            | Utilizador | Could      | RF11         |

---

### 4. Favoritos, Watchlist e Histórico

| Código | Requisito                 | Atores     | Prioridade | Dependências |
| ------ | ------------------------- | ---------- | ---------- | ------------ |
| RF16   | Favoritos                 | Utilizador | Must       | RF02         |
| RF17   | Watchlist                 | Utilizador | Should     | RF02         |
| RF18   | Histórico de visualização | Utilizador | Must       | RF11         |

---

### 5. Classificações e Feedback

| Código | Requisito            | Atores     | Prioridade | Dependências |
| ------ | -------------------- | ---------- | ---------- | ------------ |
| RF19   | Atribuir rating      | Utilizador | Should     | RF02         |
| RF20   | Comentários curtos   | Utilizador | Could      | RF19         |
| RF21   | Agregação de ratings | Sistema    | Should     | RF19         |

---

### 6. Pesquisa e Descoberta

| Código | Requisito             | Atores | Prioridade | Dependências |
| ------ | --------------------- | ------ | ---------- | ------------ |
| RF22   | Pesquisa unificada    | Todos  | Must       | RF06, RF07   |
| RF23   | Filtros/ordenação     | Todos  | Should     | RF22         |
| RF24   | Carrosséis editoriais | Todos  | Should     | RF22         |
| RF25   | Relacionados          | Todos  | Should     | RF08         |

---

### 7. Recomendações IA

| Código | Requisito                    | Atores        | Prioridade | Dependências     |
| ------ | ---------------------------- | ------------- | ---------- | ---------------- |
| RF26   | Recomendações personalizadas | Utilizador/IA | Should     | RF16, RF18, RF19 |
| RF27   | Cold start                   | Utilizador/IA | Should     | RF03             |
| RF28   | Explicabilidade              | Utilizador    | Could      | RF26             |

---

### 8. Subscrições

| Código | Requisito                        | Atores     | Prioridade | Dependências |
| ------ | -------------------------------- | ---------- | ---------- | ------------ |
| RF35   | Subscrição mensal/anual          | Utilizador | Must       | RF02         |
| RF36   | Renovação automática             | Sistema    | Must       | RF35         |
| RF37   | Métodos de pagamento             | Utilizador | Must       | RF35         |
| RF38   | Gestão da subscrição             | Utilizador | Must       | RF35         |
| RF39   | Bloqueio por subscrição expirada | Sistema    | Must       | RF35         |
| RF40   | Trial                            | Sistema    | Could      | RF35         |

---

### 9. Pool Rotativa de Associações

| Código | Requisito                      | Atores           | Prioridade | Dependências |
| ------ | ------------------------------ | ---------------- | ---------- | ------------ |
| RF41   | Submissão de candidaturas      | Associação       | Must       | -            |
| RF42   | Aprovação/rejeição             | Administrador    | Must       | RF41         |
| RF43   | Integração em pool             | Sistema/Admin    | Must       | RF42         |
| RF44   | Distribuição mensal de %       | Sistema          | Must       | RF43         |
| RF45   | Rotação automática             | Sistema          | Must       | RF44         |
| RF46   | Painel da distribuição         | Admin            | Should     | RF44         |
| RF47   | Histórico por associação       | Admin/Associação | Should     | RF43         |
| RF48   | Página pública das associações | Todos            | Should     | RF43         |

---

### 10. Notificações

| Código | Requisito                   | Atores     | Prioridade | Dependências |
| ------ | --------------------------- | ---------- | ---------- | ------------ |
| RF52   | Notificações transacionais  | Sistema    | Must       | -            |
| RF53   | Preferências de notificação | Utilizador | Should     | RF02         |
| RF54   | Alertas de continuidade     | Sistema    | Could      | RF12         |

---

### 11. Privacidade e RGPD

| Código | Requisito      | Atores     | Prioridade | Dependências |
| ------ | -------------- | ---------- | ---------- | ------------ |
| RF55   | Exportar dados | Utilizador | Must       | RF02         |
| RF56   | Eliminar conta | Utilizador | Must       | RF02         |
| RF57   | Consentimentos | Utilizador | Must       | RF02         |

---

### 12. Administração e Operação

| Código | Requisito                   | Atores | Prioridade | Dependências |
| ------ | --------------------------- | ------ | ---------- | ------------ |
| RF58   | Gestão de utilizadores      | Admin  | Must       | RF04         |
| RF59   | Painel de métricas          | Admin  | Should     | -            |
| RF60   | Configuração de integrações | Admin  | Should     | -            |

---

## Critérios de Aceitação

> Critérios de aceitação são descrições detalhadas que definem quando um requisito funcional está completo e funciona conforme esperado.

### Subscrições (RF35–RF40)

-   Um utilizador com pagamento aceite deve permanecer ativo até ao fim do ciclo.
-   Se o pagamento falhar, o sistema bloqueia o acesso e envia notificação.
-   Trial só pode ser usado uma vez por utilizador.
-   Página de gestão deve mostrar: método, ciclo, data de renovação, estado atual.

### Streaming (RF11–RF15)

-   Reprodução deve iniciar em até X segundos.
-   Se retomar reprodução, deve saltar para o timestamp gravado.
-   Conteúdos acima da idade configurada são bloqueados sem PIN.

### Recomendações IA (RF26–RF28)

-   Devem ser apresentados pelo menos 3 grupos relevantes.
-   Devem mostrar "Porque recomendamos".
-   Em utilizadores novos, usar perfil básico e temas populares.

### Favoritos e Histórico (RF16–RF18)

-   Adicionar/remover favorito deve refletir imediatamente.
-   Histórico deve mostrar episódios e progresso.

### Pool de Associações (RF41–RF48)

-   Rotação mensal deve ocorrer automaticamente.
-   Distribuição percentual deve ser registada e auditável.
-   Associações devem ver apenas o histórico relativo à sua entidade.

---

## Sugestão de MVP organizado por fases e RF

-   **Fase 1 - Fundacional:** RF01–RF18 (identidade, perfis, catálogo, streaming base, favoritos/histórico).
-   **Fase 2 - Descoberta MVP:** RF19–RF28 (classificações, pesquisa e recomendações IA baseline).
-   **Fase 3 - Monetização Solidária:** RF35–RF48, RF52–RF54 (subscrições, pool de associações e notificações essenciais).
-   **Fase 4 - Operação e Privacidade:** RF55–RF60 (RGPD, administração e operação base).

---

## Licença

Projeto académico orientado para fins educativos no âmbito da PAP.

---

## Changelog

-   **2024-04-27** - Reorganização para formato padrão com secções adicionais (MVP, créditos, licença e gamificação).
-   **2026-04-13** - Nome do projeto uniformizado para **FaithFlix** e atualização editorial de consistência documental.
-   **2026-04-17** - Removidos RF fora de escopo da versão PAP para manter requisitos e planificação sem referências residuais.
-   **2026-04-17** - Clarificada a política de numeracao RF apos rebaseline para evitar ambiguidade pedagógica.
