# Página pública de associações - redesign FaithFlix

- `document_status`: `CURRENT`
- `snapshot_date`: `2026-07-11`
- `implementation_lane`: `REFERENCE`
- `current_authority`: `docs/RF.md`
- `proof_scope`: redesign local de `/associacoes` e `/associacoes/candidatura`, contratos agregados e associação própria; não redesenha o histórico privado nem prova browsers branded/dispositivos físicos

## Objetivo e decisão visual

A área solidária passou a comunicar impacto, humanidade e confiança sem copiar a
linguagem cinematográfica do catálogo. Conserva header, grelha
`--content-width`, tipografia, verdes, dourados, foco e componentes de estado da
FaithFlix, mas adota uma composição mais luminosa e editorial.

| Área | Resultado implementado |
| --- | --- |
| Hero | H1 “Ver histórias. Apoiar vidas.”, CTAs públicos, monogramas derivados dos dados e métricas agregadas. |
| Transparência | Três passos factuais: contribuição registada, fecho mensal e repartição com rotação. |
| Diretório | `PublicCharityCard` próprio, missão, ano de aprovação, website HTTP(S) e ação admin secundária. |
| Candidatura | Contexto e formulário em duas colunas; confirmação dedicada depois do envio. |
| Responsividade | 3/2/1 colunas nos cards e reflow sem overflow em 2048, 1366, 768 e 390 px. |

Não foram adicionadas fotografias, logótipos remotos ou campos editoriais
fictícios. A composição visual usa apenas CSS e dados públicos existentes.

## Contratos HTTP

### Impacto público

`GET /api/charities/public` preserva `charities` e acrescenta de forma aditiva:

```json
{
  "impact": {
    "eligibleCharities": 3,
    "totalDistributedCents": 22000,
    "completedMonths": 4,
    "currency": "EUR"
  }
}
```

- `eligibleCharities` usa o mesmo filtro `active/eligible` da lista pública.
- `totalDistributedCents` soma apenas `totalPoolCents` persistidos em fechos
  `completed`; o relatório nunca reconstrói pagamentos históricos.
- Não são devolvidos `paymentSnapshots`, contactos, memberships ou valores por
  associação.

### Associação da sessão

`GET /api/charities/me` exige autenticação e devolve `{ "charity": null }` ou
somente `{ "charity": { "id", "name" } }`. A página não faz este pedido para
visitantes, sessão indisponível ou administradores. Uma falha desta leitura é
secundária e não bloqueia os dados públicos.

O histórico e CSV continuam protegidos por `assertCanReadCharity`: admin pode
consultar qualquer associação e um utilizador comum apenas a membership própria.
IDs usados em rotas permanecem codificados com `encodeURIComponent`.

## Estados, segurança e acessibilidade

- Listagem: loading, erro seguro com retry, vazio orientador e cancelamento no
  unmount.
- Membership: pedido e cancelamento independentes; nenhuma inferência de
  autorização é feita no browser.
- Websites: renderizados apenas para protocolos HTTP/HTTPS, em nova aba com
  `noopener noreferrer`; o URL bruto não é usado como texto do card.
- Candidatura: limites HTML alinhados ao backend, dados preservados em erro,
  submissão concorrente bloqueada e `AbortSignal` propagado.
- Foco visível, targets mínimos e contraste usam os contratos globais; a
  rotação decorativa é removida por `prefers-reduced-motion`.

## Validação executada em 2026-07-11

| Comando/prova | Resultado | Limite |
| --- | --- | --- |
| `cd real_dev/backend && npm test` | `PASS 287/287` | Suites locais com doubles e HTTP loopback; não é MongoDB produtivo. |
| `cd real_dev/backend && npm run test:contracts` | `PASS 15/15` | Contratos de catálogo/playback preservados. |
| `cd real_dev/backend && npm run test:security` | `PASS 11/11`; hardening `PASS` | Baseline local. |
| `cd real_dev/frontend && VITE_API_BASE_URL=https://api.example.invalid npm run validate` | `PASS 54 ficheiros / 230 testes`; lint e build `PASS` | Vite mantém warnings conhecidos de chunks HLS/DASH. |
| Browser local em 2048×1152, 1366×900, 768×900 e 390×844 | `PASS` sem overflow; cards 3/3/2/1 colunas | In-app Chromium; não equivale a dispositivos reais. |
| `npm run test:a11y -- --grep "rota pública /associacoes"` | `PASS 1/1` | Axe Chromium, API sintética local. |
| `npm run test:a11y` | `PARCIAL 13/15`; `/associacoes` passou | Falhas fora do âmbito: contraste do spotlight do catálogo e H1 esperado na pesquisa. |
| `npm run test:docs` | `PARCIAL`; 66/66 BK e 31 evidence inspecionadas | Falha histórica fora do âmbito em `architecture.contents`: marcadores de campos/índices de media ausentes. |
| Seed isolado para E2E MF4 | `PENDENTE_AMBIENTE` | Depois de libertar as portas formais, `seed:e2e:mf4` falhou com `ECONNREFUSED 127.0.0.1:27017`; não existe `mongod` nem Docker disponível neste ambiente. |
| E2E MF4 e sweep publicável | `NÃO_EXECUTADO` | Dependem do seed MongoDB isolado; os servidores de desenvolvimento foram restaurados depois da tentativa. |

## Evidence visual

As capturas representativas a regenerar e publicar depois do sweep formal são:

- `docs/evidence/MF8/screenshots/associacoes-desktop.png` — 1366×900;
- `docs/evidence/MF8/screenshots/associacoes-mobile.png` — 390×844.

Capturas `wide` e `tablet` permanecem artefactos de teste, não evidência
publicada obrigatória. Os PNG presentes no repositório datam de 2026-07-01 e
não são apresentados como prova nova deste redesign. A revisão visual atual foi
feita no browser local; a publicação fica conscientemente pendente até o sweep
formal conseguir usar uma base MongoDB isolada.

## Resultado

`PASS_COM_RISCOS`: implementação, unitários, integração HTTP, segurança,
frontend, revisão visual e Axe focado estão validados. O E2E formal e a
publicação das screenshots permanecem bloqueados pela ausência de MongoDB local
isolado; os dois findings globais de acessibilidade pertencem ao catálogo e à
pesquisa e não foram alterados neste redesign.
