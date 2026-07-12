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
13. [Planos Pro/Família e Qualidade](#13-planos-profamília-e-qualidade)
14. [Critérios de Aceitação](#critérios-de-aceitação)
15. [Sugestão de MVP organizado por fases e RF](#sugestão-de-mvp-organizado-por-fases-e-rf)
16. [Licença](#licença)
17. [Changelog](#changelog)

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

Nota de robustez da referência docente (2026-07-10): a página de conta
cancela a leitura e qualquer mutação pendente quando sai do ecrã. Alterar o
perfil e o limite parental partilha um único bloqueio de escrita, impedindo
duplo submit ou duas alterações concorrentes. O limite parental vazio é
inválido e nunca é convertido implicitamente em `0`; depois de uma escrita, a
UI usa a resposta autoritativa da API. Papéis desconhecidos não são mostrados
como códigos técnicos e usam o fallback PT-PT `Utilizador`.

Nota de atomicidade da referência docente (2026-07-10): o registo e a sessão
inicial fazem commit na mesma transação MongoDB. Se a sessão não puder ser
persistida, o utilizador também é revertido; a API nunca devolve erro deixando
uma conta órfã que transforme o retry em conflito de email. Um resultado de
commit desconhecido é reconciliado apenas pelo `_id` do utilizador e token da
tentativa. Sessões existentes só autenticam conta `active` (ou legacy sem
estado); qualquer outro estado revoga a sessão.

Contrato de entrada e proteção contra abuso da referência docente
(2026-07-10): emails de autenticação têm, no máximo, 254 caracteres e as
passwords têm entre 10 e 128 caracteres. Os limites distribuídos abaixo são
cumulativos; exceder qualquer chave devolve `429`,
`code: "RATE_LIMITED"` e o header `Retry-After`, sem revelar se um email ou
token existe:

| Operação | Chave e janela | Limite |
| --- | --- | ---: |
| Login | falhas por email / 15 minutos | 5 |
| Login | pedidos por IP / 15 minutos | 20 |
| Registo | pedidos por IP / hora | 5 |
| Recuperação | pedidos por email / hora | 3 |
| Recuperação | pedidos por IP / hora | 10 |
| Reset | pedidos por token / 15 minutos | 5 |
| Reset | pedidos por IP / hora | 10 |
| Candidatura de associação | pedidos por IP / hora | 5 |
| Pesquisa | pedidos por IP / minuto | 120 |
| Recomendações | pedidos por utilizador / minuto | 60 |
| Eliminação de conta | pedidos por utilizador / 15 minutos | 5 |
| Eliminação de conta | pedidos por IP / hora | 20 |

---

### 2. Catálogo e Metadados

| Código | Requisito                        | Atores            | Prioridade | Dependências |
| ------ | -------------------------------- | ----------------- | ---------- | ------------ |
| RF06   | Gestão de catálogo               | Admin/Moderador   | Must       | RF04         |
| RF07   | Temas e taxonomias               | Moderador/Curador | Must       | RF06         |
| RF08   | Página de detalhes               | Utilizador        | Must       | RF06         |
| RF09   | Publicação e estados do conteúdo | Admin             | Must       | RF06         |
| RF10   | Histórico e reversões            | Admin             | Could      | RF06         |

Nota de robustez da referência docente (2026-07-10): catálogo, detalhe e
passagens bíblicas associadas usam pedidos canceláveis e não atualizam o ecrã
depois de unmount ou mudança de conteúdo. Falhas do catálogo e do detalhe têm
retry explícito; detalhe e passagens têm retry independente. IDs e slugs são
sempre codificados com `encodeURIComponent` antes de entrarem num segmento de
rota/API. Uma sessão `unavailable` no detalhe bloqueia temporariamente o CTA e
permite repetir a confirmação; não apresenta login nem assume logout.

Nota de hierarquia audiovisual (2026-07-11): uma série é um agregado editorial
não reproduzível. Os episódios pertencem obrigatoriamente a uma série através de
`seriesId`, `seasonNumber` e `episodeNumber`; catálogo, pesquisa, descoberta e
recomendações apresentam a série, e o detalhe agrupa episódios por temporada.
Links diretos legados de episódios são canonicalizados para
`/catalogo/:seriesSlug/episodios/:episodeSlug`. Favoritos, watchlist, ratings e
comentários pertencem à série; progresso e histórico permanecem por episódio.

---

### 3. Streaming e Reprodutor

| Código | Requisito                      | Atores     | Prioridade | Dependências |
| ------ | ------------------------------ | ---------- | ---------- | ------------ |
| RF11   | Reproduzir conteúdo adaptativo | Utilizador | Must       | RF02         |
| RF12   | Continuar a ver                | Utilizador | Must       | RF11         |
| RF13   | Seleção de legendas/áudio      | Utilizador | Should     | RF11         |
| RF14   | Controlo parental              | Utilizador | Should     | RF03         |
| RF15   | Ajuste de qualidade            | Utilizador | Could      | RF11         |

Nota de robustez da referência docente (2026-07-10): `RF12` usa
`GET /api/playback/me/continue-watching?page=1&limit=12`. A API exige sessão,
aceita `limit <= 50` e devolve `{ items, page, limit, total, totalPages }`, com
ordem total `lastWatchedAt DESC, _id ASC`. Publicação, controlo parental,
`mediaStatus` e fonte reconhecida são verificados antes de um item entrar na
lista. A UI pede apenas a primeira página de 12 itens, cancela o pedido ao
mudar de sessão/desmontar e apresenta erro seguro com nova tentativa.

Em séries, `RF11` reproduz exclusivamente episódios. O player preserva o
`contentId` do episódio para progresso e apresenta série, temporada, posição e
navegação anterior/seguinte. Uma série sem episódios publicados surge como
“Em breve” e nunca ativa diretamente o player.

---

### 4. Favoritos, Watchlist e Histórico

| Código | Requisito                 | Atores     | Prioridade | Dependências |
| ------ | ------------------------- | ---------- | ---------- | ------------ |
| RF16   | Favoritos                 | Utilizador | Must       | RF02         |
| RF17   | Watchlist                 | Utilizador | Should     | RF02         |
| RF18   | Histórico de visualização | Utilizador | Must       | RF11         |

Nota de robustez da referência docente (2026-07-10): as três leituras
pessoais aceitam `page`/`limit`, recusam coerções ambíguas e limitam cada
página a 50 itens. Devolvem `{ items, page, limit, total, totalPages }`;
favoritos/watchlist ordenam por `updatedAt DESC, _id ASC` e o histórico por
`lastWatchedAt DESC, _id ASC`. Em `/biblioteca`, cada secção tem paginação,
cancelamento, loading, erro, vazio e retry independentes. No detalhe, as ações
procuram o conteúdo apenas nas páginas declaradas pelo backend, impedem duplo
clique e revertem a alteração otimista quando a mutação falha.

---

### 5. Classificações e Feedback

| Código | Requisito            | Atores     | Prioridade | Dependências |
| ------ | -------------------- | ---------- | ---------- | ------------ |
| RF19   | Atribuir rating      | Utilizador | Should     | RF02         |
| RF20   | Comentários curtos   | Utilizador | Could      | RF19         |
| RF21   | Agregação de ratings | Sistema    | Should     | RF19         |

Nota de robustez da referência docente (2026-07-10): o resumo de
classificações usa `{ contentId, average, total, distribution }`. O
`RatingBox` cancela leituras anteriores quando muda o conteúdo ou a sessão,
recusa respostas stale, admite uma única mutação de cada vez e volta a ler o
estado autoritativo depois de guardar/remover. Os comentários mantêm, nesta
baseline, uma listagem visível limitada a 50 itens, sem paginação pública; a
UI cancela leituras antigas, serializa criações/remoções, mostra busy state no
formulário ou linha afetada e volta a ler a lista depois de cada escrita.
Moderação e remoção privilegiada por `admin`/`moderator` escrevem domínio e
audit na mesma transação e sessão, com ator e `requestId`; falha no audit reverte
a alteração. A remoção pelo próprio autor mantém apenas a regra de ownership e
não cria evento administrativo. Os snapshots de audit incluem somente o estado
anterior/seguinte, nunca corpo, motivo livre ou PII.

---

### 6. Pesquisa e Descoberta

| Código | Requisito             | Atores | Prioridade | Dependências |
| ------ | --------------------- | ------ | ---------- | ------------ |
| RF22   | Pesquisa unificada    | Todos  | Must       | RF06, RF07   |
| RF23   | Filtros/ordenação     | Todos  | Should     | RF22         |
| RF24   | Carrosséis editoriais | Todos  | Should     | RF22         |
| RF25   | Relacionados          | Todos  | Should     | RF08         |

Nota de robustez da referência docente (2026-07-10): a pesquisa preserva
`q`, `type`, `taxonomyId`, `sort` e `page` no URL. A API devolve `query`,
`page`, `limit`, `total`, filtros, ordenação e `items`; o frontend calcula
`totalPages = ceil(total / limit)`. O limite desta rota é 24, não 50, e todos
os sorts têm desempate por `_id`. Alterar query, filtro ou página cancela o
pedido anterior e uma resposta stale nunca substitui o resultado atual. Uma
falha pode ser repetida sem alterar os filtros do URL; a leitura de taxonomias
do formulário tem cancelamento e retry próprios. Links de resultados codificam
o slug/ID antes de construir `/catalogo/:idOrSlug`.

---

### 7. Recomendações IA

| Código | Requisito                    | Atores        | Prioridade | Dependências     |
| ------ | ---------------------------- | ------------- | ---------- | ---------------- |
| RF26   | Recomendações personalizadas | Utilizador/IA | Should     | RF16, RF18, RF19 |
| RF27   | Cold start                   | Utilizador/IA | Should     | RF03             |
| RF28   | Explicabilidade              | Utilizador    | Could      | RF26             |

Nota de implementação da referência docente `real_dev` (atualizada em 2026-07-09): RF26-RF28 usam recomendação ponderada e explicável (`weighted-baseline-v2`). Sinais pessoais autenticados só são lidos quando o utilizador ativou explicitamente `personalizedRecommendations`; sem esse consentimento, a resposta usa cold start geral. Todos os candidatos, incluindo cold start e a camada opcional `weighted-baseline-v2+content-embeddings`, respeitam o limite parental antes de serem devolvidos. Modelos externos continuam desligados por defeito e não são requisito obrigatório do MVP corrente.

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

### 13. Planos Pro/Família e Qualidade

| Código | Requisito                          | Atores              | Prioridade | Dependências |
| ------ | ---------------------------------- | ------------------- | ---------- | ------------ |
| RF61   | Planos Pro/Família e entitlements  | Utilizador/Sistema  | Must       | RF35, RF38   |
| RF62   | Partilha familiar real             | Utilizador/Sistema  | Must       | RF02, RF61   |
| RF63   | Qualidade de streaming por plano   | Utilizador/Sistema  | Must       | RF11, RF15, RF61 |

---

## Critérios de Aceitação

> Critérios de aceitação são descrições detalhadas que definem quando um requisito funcional está completo e funciona conforme esperado.

### Identidade e sessão (RF01–RF05)

-   Registo, login, recuperação e reset recusam emails com mais de 254 caracteres; registo, login e reset recusam passwords fora de `10..128` caracteres.
-   O primeiro pedido que ultrapassa qualquer limite da tabela normativa devolve `429 RATE_LIMITED` e `Retry-After`; limites por email/token e por IP aplicam-se cumulativamente.
-   `GET /api/session/me` devolve sempre `200`; sem sessão válida, o payload é `{ "user": null }`.
-   `POST /api/session/logout` elimina a sessão server-side, limpa o cookie e devolve `204` sem body.
-   O frontend distingue `loading`, `authenticated`, `anonymous` e `unavailable`; uma falha de rede ou `5xx` não pode ser tratada como logout.
-   Enquanto a sessão estiver `unavailable`, CTAs privados ficam bloqueados e oferecem nova confirmação; não redirecionam para login nem apresentam o utilizador como anónimo.
-   Um `401` limpa o contexto local e o token CSRF em memória. O logout concluído apresenta uma ação visível e navega para `/`.
-   Login e registo dão precedência a um `next` interno seguro. Sem `next`, a landing depende da role confirmada pelo backend: `admin` entra em `/admin`, `moderator` em `/admin/catalogo` e as restantes contas em `/`. O destino nunca aceita outra origin, protocolo, backslash ou caracteres de controlo.
-   Leituras e mutações da conta são canceláveis. Perfil e limite parental não podem ser gravados em paralelo; vazio, decimal ou valor fora de `0..18` não chama a API parental.

### Catálogo editorial (RF06–RF10)

-   Conteúdo novo começa em `draft`, com `version: 1`; a resposta administrativa inclui sempre uma versão inteira positiva.
-   Editar metadados, mudar estado ou reverter uma revisão exige `expectedVersion` numérico igual à versão observada pelo cliente.
-   Se a versão estiver desatualizada, a API devolve `409` com `code: "CONTENT_VERSION_CONFLICT"` e não persiste conteúdo, revisão ou audit log parcial.
-   A revisão do estado anterior, a escrita CAS e o audit log administrativo fazem commit ou rollback na mesma transação.
-   Repetir o mesmo estado, incluindo `published`, é idempotente: não cria revisão, não incrementa `version` e não altera `publishedAt`.
-   Conteúdo publicado pode manter `mediaStatus: "pending"`; continua visível no catálogo, com `isPlayable: false` e sem fonte pública.
-   Catálogo e detalhe apresentam erro seguro com `Tentar novamente`; a navegação codifica slugs/IDs e pedidos substituídos ou desmontados são abortados/ignorados.
-   As passagens bíblicas do detalhe carregam e repetem de forma independente, sem bloquear nem substituir o conteúdo já carregado.
-   Criar/editar/publicar passagens e associar/remover uma passagem de conteúdo
    são mutações editoriais auditadas: domínio e audit partilham transação,
    sessão, ator e `requestId`. Link/unlink sem alteração são idempotentes e não
    duplicam audit; snapshots omitem texto bíblico, reflexão e nota livre.

### Subscrições (RF35–RF40)

-   Um utilizador com pagamento aceite deve permanecer ativo até ao fim do ciclo.
-   A criação de uma subscrição paga passa exclusivamente por checkout simulado aprovado; não existe ativação HTTP direta em `/api/subscriptions/me`.
-   Checkout e trial exigem `Idempotency-Key` ASCII seguro com, no máximo, 128 caracteres. A mesma chave e o mesmo `requestHash` devolvem a resposta original; reutilizar a chave com outro payload devolve `409` (`IDEMPOTENCY_KEY_REUSED`).
-   Tentativa financeira, subscrição, notificação e resposta idempotente fazem commit ou rollback na mesma transação. O trial, a subscrição temporária e a notificação seguem a mesma regra.
-   Cada tentativa nova usa o schema financeiro v2: `schemaVersion`, `amountCents`, `currency`, `solidaritySharePercent`, `interval`, `approvedAt`, `cycle`, `idempotencyKey`, `requestHash` e `accountingEstimate` explícito.
-   A renovação automática corre num worker separado com lease por subscrição/ciclo. A baseline local usa apenas um adapter determinístico `faithflix-simulated`; não representa gateway real nem satisfaz `RNF24`.
-   Renovação aprovada avança o ciclo; renovação recusada passa a `past_due`, bloqueia acesso e fecha memberships familiares abertas; cancelamento agendado passa a `canceled` no fim do ciclo; trial vencido passa a `expired`.
-   Ciclos mensais e anuais usam UTC e limitam o dia ao último dia do mês de destino, incluindo 31 de janeiro e anos bissextos.
-   Trial só pode ser usado uma vez por utilizador; repetição com outra chave devolve `409 TRIAL_ALREADY_USED`.
-   Página de gestão deve mostrar: método, ciclo, data de renovação, estado atual.

Nota de prova da referência docente (2026-07-10): estes contratos foram validados localmente com doubles e fault injection. Não houve execução contra replica set MongoDB real, gateway real ou worker de produção.

### Planos Pro/Família e Qualidade (RF61–RF63)

-   Os planos Pro e Família devem expor entitlements públicos sem quebrar os códigos `faithflix-monthly` e `faithflix-yearly`.
-   A partilha familiar deve usar contas reais existentes, exigir owner com plano Família ativo e impedir múltiplas famílias ativas por membro.
-   O limite `maxFamilyMembers` inclui o owner. Convites `pending` e memberships `active` ocupam lugar; a resposta expõe `seatsUsed` e `seatsAvailable` com essa contagem.
-   Convidar e aceitar serializam alterações pelo documento de subscrição do owner, recontam lugares dentro da transação e dependem também de índice parcial único por membro para estados `pending|active`.
-   Convidar, aceitar, recusar, remover e sair fazem commit/rollback com as respetivas notificações na mesma sessão transacional; uma falha tardia não deixa membership ou notificação parcial.
-   O overview familiar devolvido por cada comando é lido dentro dessa mesma transação e sessão. Uma falha ao construir a resposta reverte o comando, em vez de devolver erro depois de um commit já efetuado.
-   Membros familiares devem obter acesso premium apenas enquanto o owner mantiver plano Família ativo.
-   O owner tem também de manter a conta operacional `active`; bloquear ou
    eliminar a conta revoga imediatamente o acesso familiar derivado.
-   Acesso próprio falha fechado: só `active` com plano existente/ativo e tier
    válido, ou `trialing` com `planCode: "trial"`, pode conceder premium. Estado,
    tier, qualidade ou plano desconhecido devolve entitlements `none`.
-   Planos não recebem entitlements por omissão: `maxQuality` tem de ser string
    suportada e Família exige `familySharing: true` mais
    `maxFamilyMembers` inteiro `2..5`. Plano incompleto/coercivo é omitido da
    oferta e recusado antes de checkout/renovação, sem ledger financeiro.
-   A qualidade máxima deve ser imposta no backend: Pro/trial até `1080p`; Família até `2160p/4K`.
-   O catálogo e o detalhe públicos usam uma allowlist editorial: metadados, poster/backdrop, `mediaStatus` e `isPlayable`. Omitem integralmente `media`, `tracks`, `qualityOptions` e qualquer alias de fonte, incluindo `source`, `url`, `playbackUrl` e `src`.
-   `isPlayable` usa a mesma canonicalização do playback: localização segura,
    protocolo `progressive|hls|dash`, MIME coerente e qualidade fechada. Um alias
    textual inválido ou container legacy malformado nunca ativa o CTA nem causa
    erro `500` no player.
-   O endpoint autenticado de playback devolve apenas a fonte efetivamente selecionada em `content.source`, com `{ url, protocol, mimeType }`. `protocol` pertence à lista fechada `progressive|hls|dash`.
-   Na resposta autenticada de playback, `qualityOptions` informa apenas `value`, `label`, `locked`, `selected` e, quando aplicável, `requiredTier`/`lockedReason`; nenhuma opção transporta uma fonte.
-   As faixas de áudio e legendas devolvidas pelo playback são descritores sem fonte. Alterar uma preferência persiste o valor e obriga o frontend a voltar a pedir playback; só o backend escolhe a nova `source` autorizada.

### Streaming (RF11–RF15)

-   A meta de arranque continua a ser, no máximo, 3 segundos em condições reais, mas permanece não provada enquanto não existirem vídeo e infraestrutura reais.
-   Se retomar reprodução, deve saltar para o timestamp gravado.
-   Conteúdos acima da idade configurada são bloqueados sem PIN.
-   Um conteúdo publicado pode ainda estar sem media pronta. Nesse caso, catálogo/detalhe apresentam `isPlayable: false` e o playback responde `409` com `code: "MEDIA_NOT_READY"`.
-   O player usa `<video src>` para `progressive`, reprodução HLS nativa ou `hls.js` para `hls`, e `dashjs` para `dash`; qualquer adapter anterior é destruído quando muda o conteúdo ou a fonte.
-   Fixtures sintéticas locais podem validar contrato, seleção de adapter, `loadedmetadata`, `canplay` e erros. Não provam vídeo real, 4K real, CDN, tempo de arranque de produção ou 100 streams simultâneos.

### Recomendações IA (RF26–RF28)

-   Devem ser apresentados pelo menos 3 grupos relevantes.
-   Devem mostrar "Porque recomendamos".
-   Em utilizadores novos, usar perfil básico e temas populares.
-   Sem consentimento explícito para recomendações personalizadas, não usar histórico, favoritos, watchlist ou ratings pessoais; devolver apenas cold start compatível com o controlo parental.
-   A API autenticada admite, no máximo, 60 pedidos por utilizador e por minuto; o pedido 61 devolve `429 RATE_LIMITED` e `Retry-After`.

### Privacidade e consentimentos (RF55–RF57)

-   A eliminação da própria conta exige a frase exata `ELIMINAR CONTA` e a password atual antes de executar a operação.
-   Uma eliminação válida revoga sessões e atualiza os dados relacionados como uma única operação controlada; uma password incorreta não altera dados.
-   A exportação inclui a ligação operacional do próprio utilizador em `sections.charity_memberships`. A eliminação remove essa ligação na mesma transação, sem alterar memberships de outras contas.
-   O consentimento para recomendações personalizadas começa desligado e condiciona o uso de sinais pessoais.
-   O consentimento para notificações operacionais condiciona alertas opcionais como `continue_watching`; eventos transacionais essenciais da conta não são silenciados por esse consentimento.

### Favoritos e Histórico (RF16–RF18)

-   Adicionar/remover favorito ou item para ver mais tarde deve refletir imediatamente, impedir pedidos duplicados e reverter visualmente se a API falhar.
-   Favoritos, lista para ver mais tarde e histórico usam páginas independentes com `limit <= 50` e metadata `{ page, limit, total, totalPages }`.
-   Histórico deve mostrar episódios e progresso, ordenados por visualização mais recente com desempate estável.

### Pool de Associações (RF41–RF48)

-   O fecho é executado pelo worker para o mês UTC anterior e recusa o mês atual ou futuro com `409 ACCOUNTING_MONTH_NOT_CLOSED`.
-   O fecho manual por admin exige primeiro `GET /api/charities/pool/distributions/:month/preview`, que não escreve distribuição nem audit log. O commit envia `{ month, previewToken }`; se a base financeira ou a elegibilidade mudar, devolve `409 POOL_PREVIEW_STALE`, não escreve e obriga a gerar nova preview.
-   A receita elegível exige cumulativamente `payment_attempts.schemaVersion: 2`, `status: "approved"`, `accountingEstimate: false` e `approvedAt` dentro do intervalo UTC fechado-aberto do mês.
-   Documentos legacy sem versão e qualquer backfill com `accountingEstimate: true` ficam excluídos; não é permitido reconstruir silenciosamente contabilidade histórica exata.
-   A distribuição guarda `paymentSnapshots` e um `financialSnapshot` imutável com contagem, receita aprovada e limites do período; relatórios posteriores leem o snapshot e não recalculam o passado.
-   Rotação mensal é determinística pelo mês e independente da ordem em que jobs sejam executados.
-   A chave mensal e o índice único tornam a repetição idempotente: devolve a distribuição existente com `replayed: true`, em vez de criar outra.
-   A elegibilidade de associações é congelada no fecho: exige `status: "active"`, `poolStatus: "eligible"` e `approvedAt` anterior ao fim do mês. Aprovar uma associação mais tarde não redistribui meses já fechados.
-   Se não existir associação elegível no fecho, o sistema persiste um ledger terminal e imutável com `status: "deferred_no_eligible_charities"`, `deferredReason: "NO_ELIGIBLE_CHARITIES_AT_CLOSE"` e `items: []`. Este resultado não é erro, não entra em retry infinito e nunca é convertido retroativamente numa distribuição.
-   O catch-up descobre e processa, no máximo, 120 meses pendentes por passagem. Lotes históricos já fechados são atravessados sem bloquear a progressão das passagens seguintes.
-   Associações devem ver apenas o histórico relativo à sua entidade.

Nota de robustez da referência docente (2026-07-11):
`GET /api/charities/public` mantém a lista segura de associações ativas e
elegíveis e acrescenta apenas impacto agregado: número de associações, soma de
`pool_distributions.totalPoolCents` concluídas, meses concluídos e moeda EUR.
Não expõe contactos, memberships, snapshots financeiros ou valores por
associação. `GET /api/charities/me` exige sessão e devolve apenas `id`/`name`
da associação ligada ao próprio utilizador, ou `charity: null`; a autorização
final do histórico e CSV continua no backend.

### Candidaturas, associações e administração (RF41–RF43, RF47, RF58)

-   A submissão pública de candidaturas admite, no máximo, 5 pedidos por IP e por hora; o pedido 6 devolve `429 RATE_LIMITED` e `Retry-After`.
-   Só pode existir uma candidatura `pending` por email, protegida por índice parcial; duplicação concorrente devolve `409 PENDING_APPLICATION_EXISTS`.
-   A revisão reclama condicionalmente uma candidatura ainda `pending`. Decisão, eventual associação `active/eligible` e audit log fazem commit na mesma transação; rejeição não cria associação e uma segunda decisão devolve `409 APPLICATION_ALREADY_REVIEWED`.
-   A rejeição administrativa exige motivo explícito entre 10 e 500 caracteres; a interface mostra o detalhe da candidatura e nunca substitui a decisão humana por uma razão fixa.
-   Ligar um utilizador a uma associação e o respetivo audit log são transacionais. Repetir a mesma ligação é idempotente; tentar transferir implicitamente para outra associação devolve `409 CHARITY_MEMBERSHIP_EXISTS`.
-   A interface de membership pesquisa associações ativas/elegíveis por nome e utilizadores operacionais por nome/email, confirma as duas entidades humanas e só depois envia os respetivos IDs. O lookup de associações expõe apenas `{ id, name }`.
-   Uma membership só pode ser criada para uma conta operacional, isto é, não bloqueada nem eliminada. Conta indisponível devolve `404 USER_NOT_OPERATIONAL` e não cria membership nem audit log.
-   `PATCH /api/users/:id/admin` altera role/estado com audit log no mesmo commit. Bloquear uma conta revoga todas as sessões na mesma transação e o último admin ativo é protegido com `409 LAST_ACTIVE_ADMIN`.
-   Audit de utilizadores e associações guarda apenas estado operacional mínimo e campos alterados; email, telefone, contactos e snapshots pessoais integrais não são persistidos no evento.
-   A prova atual destes contratos é local, com doubles e fault injection; não constitui validação de transações num replica set real.

### Administração e operação (RF58–RF60)

-   Sessões `admin` usam `/admin` como dashboard e shell dedicado; `moderator` entra em `/admin/catalogo`. O backoffice não mistura o header/footer público e oferece apenas um context switch explícito `Ver site público`.
-   A navegação administrativa é filtrada por role, agrupada por domínio e mantém sidebar em desktop, drawer acessível até `1024px`, breadcrumb, foco e logout próprios.
-   O catálogo administrativo é list-first e separa listagem, criação, edição e taxonomias; passagens bíblicas separam listagem, criação, edição e associações.
-   `GET /api/admin/metrics` devolve apenas agregados de utilizadores, catálogo, subscrições/família, solidariedade, integrações e métricas anónimas. `GET /api/admin/metrics/export.csv` reutiliza o mesmo intervalo/RBAC e nunca inclui PII individual.
-   Alterações de integrações permanecem em draft local até Guardar; Cancelar repõe o estado confirmado e Guardar apresenta um diálogo com o diff antes de emitir um único `PATCH`.

---

## Sugestão de MVP organizado por fases e RF

-   **Fase 1 - Fundacional:** RF01–RF18 (identidade, perfis, catálogo, streaming base, favoritos/histórico).
-   **Fase 2 - Descoberta MVP:** RF19–RF28 (classificações, pesquisa e recomendações IA baseline).
-   **Fase 3 - Monetização Solidária:** RF35–RF48, RF52–RF54 (subscrições, pool de associações e notificações essenciais).
-   **Fase 4 - Operação e Privacidade:** RF55–RF60 (RGPD, administração e operação base).
-   **Fase 5 - Planos avançados e família:** RF61–RF63 (entitlements, partilha familiar real e qualidade por plano).

---

## Licença

Projeto académico orientado para fins educativos no âmbito da PAP.

---

## Changelog

-   **2024-04-27** - Reorganização para formato padrão com secções adicionais (MVP, créditos, licença e gamificação).
-   **2026-04-13** - Nome do projeto uniformizado para **FaithFlix** e atualização editorial de consistência documental.
-   **2026-04-17** - Removidos RF fora de escopo da versão PAP para manter requisitos e planificação sem referências residuais.
-   **2026-04-17** - Clarificada a política de numeracao RF apos rebaseline para evitar ambiguidade pedagógica.
-   **2026-06-30** - Adicionados RF61–RF63 para MF9: planos Pro/Família, partilha familiar real e qualidade de streaming por plano.
-   **2026-07-10** - Sincronizados os contratos da referência docente para idempotência/transações, ledger financeiro v2, worker simulado, fecho mensal da pool, concorrência familiar e mutações administrativas atómicas.
-   **2026-07-10** - Alinhados sessão frontend, safe-next e playback com `content.source` única para `progressive|hls|dash`; fixtures sintéticas ficaram explicitamente separadas de prova de streaming real.
-   **2026-07-10** - Alinhadas paginação e ordem estável de listas pessoais/continuar a ver, pesquisa URL-driven e proteções contra races em biblioteca, ratings e comentários.
-   **2026-07-10** - Sincronizados cancelamento/retry em catálogo, pesquisa, detalhe, passagens e conta, codificação de segmentos e distinção entre sessão indisponível e logout.
-   **2026-07-10** - Consolidado o contrato de email/password e a matriz cumulativa de rate limiting para autenticação, candidaturas, pesquisa, recomendações e eliminação de conta.
-   **2026-07-12** - Alinhados landing por role, shell administrativo dedicado, rotas editoriais list-first, preview financeira com token stale, candidaturas, memberships, métricas CSV e drafts de integrações com a aplicação fechada.
