# Faithflix - Requisitos Funcionais (RF)

## Índice

1. [Identidade, Contas e Perfis](#1-identidade-contas-e-perfis)
2. [Catálogo e Metadados](#2-catálogo-e-metadados)
3. [Streaming e Reprodutor](#3-streaming-e-reprodutor)
4. [Favoritos, Watchlist e Histórico](#4-favoritos-watchlist-e-histórico)
5. [Classificações e Feedback](#5-classificações-e-feedback)
6. [Pesquisa e Descoberta](#6-pesquisa-e-descoberta)
7. [Recomendações IA](#7-recomendações-ia)
8. [Estudo Bíblico Integrado](#8-estudo-bíblico-integrado)
9. [Comunidade](#9-comunidade)
10. [Subscrições](#10-subscrições)
11. [Pool Rotativa de Associações](#11-pool-rotativa-de-associações)
12. [1Moderação e Curadoria](#12-moderação-e-curadoria)
13. [Notificações](#13-notificações)
14. [Privacidade e RGPD](#14-privacidade-e-rgpd)
15. [Administração e Operação](#15-administração-e-operação)
16. [Critérios de Aceitação](#critérios-de-aceitação)
17. [Perfis Familiares, Dispositivos e Gamificação](#17-perfis-familiares-dispositivos-e-gamificação)
18. [Sugestão de MVP organizado por fases e RF](#sugestão-de-mvp-organizado-por-fases-e-rf)
19. [Créditos do projeto](#créditos-do-projeto)
20. [Licença](#licença)
21. [Changelog](#changelog)

-   [Voltar ao início](../README.md)

---

## Requisitos Funcionais

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

### 8. Estudo Bíblico Integrado

| Código | Requisito                  | Atores             | Prioridade | Dependências |
| ------ | -------------------------- | ------------------ | ---------- | ------------ |
| RF29   | Conteúdo bíblico associado | Curador/Utilizador | Should     | RF07         |
| RF30   | Guias de reflexão          | Curador/Utilizador | Could      | RF29         |
| RF31   | Ligações canónicas         | Curador/Utilizador | Should     | RF29         |

---

### 9. Comunidade

| Código | Requisito                   | Atores               | Prioridade | Dependências |
| ------ | --------------------------- | -------------------- | ---------- | ------------ |
| RF32   | Partilha pública controlada | Utilizador           | Could      | RF16         |
| RF33   | Discussões moderadas        | Utilizador/Moderador | Could      | -            |
| RF34   | Grupos privados             | Utilizador           | Could      | -            |

---

### 10. Subscrições

| Código | Requisito                        | Atores     | Prioridade | Dependências |
| ------ | -------------------------------- | ---------- | ---------- | ------------ |
| RF35   | Subscrição mensal/anual          | Utilizador | Must       | RF02         |
| RF36   | Renovação automática             | Sistema    | Must       | RF35         |
| RF37   | Métodos de pagamento             | Utilizador | Must       | RF35         |
| RF38   | Gestão da subscrição             | Utilizador | Must       | RF35         |
| RF39   | Bloqueio por subscrição expirada | Sistema    | Must       | RF35         |
| RF40   | Trial                            | Sistema    | Could      | RF35         |

---

### 11. Pool Rotativa de Associações

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

### 12. Moderação e Curadoria

| Código | Requisito            | Atores               | Prioridade | Dependências |
| ------ | -------------------- | -------------------- | ---------- | ------------ |
| RF49   | Workflow editorial   | Moderador            | Must       | RF09         |
| RF50   | Curadoria teológica  | Curador              | Should     | RF29         |
| RF51   | Sistema de denúncias | Utilizador/Moderador | Should     | -            |

---

### 13. Notificações

| Código | Requisito                   | Atores     | Prioridade | Dependências |
| ------ | --------------------------- | ---------- | ---------- | ------------ |
| RF52   | Notificações transacionais  | Sistema    | Must       | -            |
| RF53   | Preferências de notificação | Utilizador | Should     | RF02         |
| RF54   | Alertas de continuidade     | Sistema    | Could      | RF12         |

---

### 14. Privacidade e RGPD

| Código | Requisito      | Atores     | Prioridade | Dependências |
| ------ | -------------- | ---------- | ---------- | ------------ |
| RF55   | Exportar dados | Utilizador | Must       | RF02         |
| RF56   | Eliminar conta | Utilizador | Must       | RF02         |
| RF57   | Consentimentos | Utilizador | Must       | RF02         |

---

### 15. Administração e Operação

| Código | Requisito                   | Atores | Prioridade | Dependências |
| ------ | --------------------------- | ------ | ---------- | ------------ |
| RF58   | Gestão de utilizadores      | Admin  | Must       | RF04         |
| RF59   | Painel de métricas          | Admin  | Should     | -            |
| RF60   | Configuração de integrações | Admin  | Should     | -            |

---

### 17. Perfis Familiares, Dispositivos e Gamificação

| Código | Requisito                                                                 | Atores             | Prioridade | Dependências |
| ------ | ------------------------------------------------------------------------- | ------------------ | ---------- | ------------ |
| RF61   | Criar e gerir **vários perfis por conta** com idioma, preferências e PIN. | Utilizador         | Must       | RF02         |
| RF62   | Registar e limitar **dispositivos autorizados**, com revogação remota.    | Utilizador/Sistema | Should     | RF02         |
| RF63   | Implementar **gamificação** (pontos, desafios devocionais, badges).       | Sistema/Utilizador | Could      | RF29         |

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
-   **Fase 2 - Descoberta e Comunidade:** RF19–RF34 (classificações, pesquisa, recomendações IA, estudo bíblico, comunidade).
-   **Fase 3 - Monetização Solidária:** RF35–RF54 (subscrições, notificações e pool de associações).
-   **Fase 4 - Operação e Experiência Premium:** RF55–RF63 (privacidade, administração, integrações, perfis familiares, dispositivos e gamificação).

---

## Licença

Projeto académico orientado para fins educativos no âmbito da PAP.

---

## Changelog

-   **2024-04-27** - Reorganização para formato padrão com secções adicionais (MVP, créditos, licença e gamificação).
