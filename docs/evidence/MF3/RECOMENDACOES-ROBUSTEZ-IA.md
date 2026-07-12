# Recomendacoes - Robustez, feedback e embeddings de conteudo

## Header

- Data: 2026-07-02
- `document_status`: `HISTORICAL_SNAPSHOT`
- `snapshot_date`: `2026-07-02`
- `implementation_lane`: `REFERENCE`
- `current_authority`: `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-END-TO-END-real_dev.md`
- `proof_scope`: recomendações/embeddings observados nessa execução; não constitui revalidação atual
- Area: `MF3` - recomendacoes IA baseline e embeddings opcionais
- Estado: `VALIDADO`
- Implementacao: `real_dev/backend/src/modules/recommendations`, `real_dev/frontend/src/pages/ForYouPage.jsx`

> **Snapshot histórico de 2026-07-02:** as contagens e estados abaixo
> pertencem àquela execução. Os paths foram normalizados para a referência
> docente `real_dev`, mas isso não constitui reexecução nem prova atual.

## Contrato implementado

- `GET /api/recommendations/me` mantem compatibilidade com `groups`, `coldStart`, `signalsUsed`, `reasonCode` e `explanation`.
- A resposta passa a incluir `strategy: "weighted-baseline-v2"` e `generatedAt`.
- `POST /api/recommendations/feedback` guarda feedback autenticado por conteudo.
- `POST /api/recommendations/events` regista eventos agregados `shown` e `clicked`.
- O frontend nao envia `userId`; a sessao autenticada define o utilizador.
- `content_embeddings` guarda vectores por conteudo publicado, `model`, `dimensions` e `sourceHash`.
- `npm run embeddings:generate` gera embeddings de forma idempotente quando o provider esta ativo.

## Regras de recomendacao

- Sinais positivos: favoritos, watchlist, historico com progresso relevante, ratings `4+` e feedback `more_like_this`.
- Sinais de exclusao: conteudos usados como base, `not_interested`, `less_like_this` e `seen`.
- Filtros obrigatorios: apenas `published`, deduplicacao entre grupos e limite parental do utilizador.
- Cold start: usado quando nao existem sinais positivos publicados suficientes.
- Embeddings: quando existem vectores compativeis, a app calcula um perfil semantico temporario em runtime e acrescenta bónus moderado por cosine similarity.
- IA externa: provider `external` fica desligado por defeito; o texto enviado ao provider e apenas editorial (`title`, `synopsis`, `type`, taxonomias), sem historico pessoal bruto.
- Privacidade: nao existe embedding persistente por utilizador e nenhum vector e devolvido pela API publica.

## Evidencia de validacao

| Comando | Resultado | Observacao |
| --- | --- | --- |
| `npm --prefix real_dev/backend test` | `PASS` | 58/58 fora da sandbox; dentro da sandbox os testes HTTP falham com `listen EPERM`, confirmado como ambiente. |
| `npm --prefix real_dev/frontend run build` | `PASS` | Build Vite concluido. |
| `cd real_dev/backend && node scripts/check-security-baseline.mjs` | `PASS` | Scanner cobre `requireAuth` em `/me`, `/feedback` e `/events`. |
| `npm --prefix real_dev/backend test -- tests/unit/mf3-validation.test.js` | `PASS` | 13/13; cobre hash, provider disabled, deterministic, cosine similarity e dimensao externa invalida. |
| `npm --prefix real_dev/backend run embeddings:generate` | `PASS` | Em provider `disabled`, terminou sem ligar a provider/DB e com mensagem operacional clara. |

## Riscos residuais

- `deterministic` e modo de testes/desenvolvimento; nao representa IA semantica real.
- Eventos agregados dependem de chamadas frontend best-effort e nao devem ser usados como prova contabilistica forte.
- Ativar embeddings externos exige decisao operacional sobre provider, custos, variaveis de ambiente, minimizacao de dados e revisao RGPD/RNF37.
- A v1 usa cosine similarity local em Node.js; se o catalogo crescer muito, pode ser necessario Atlas Vector Search ou outro motor vectorial dedicado.
