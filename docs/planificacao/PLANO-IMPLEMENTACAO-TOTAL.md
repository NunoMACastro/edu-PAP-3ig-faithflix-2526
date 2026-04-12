# Plano de Implementacao Total - Faithflix

## Header

- `doc_id`: `PLANO-IMPLEMENTACAO-TOTAL`
- `path`: `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `area`: `project`
- `owner`: `Nuno (orientacao)`
- `status`: `ativo`
- `last_updated`: `2026-04-11`

## Objetivo

Traduzir `RF01..RF63` e `RNF01..RNF40` num plano executavel, com fases, gates, backlog e sprints para a equipa de alunos.

## Assuncoes

- Equipa tecnica: `Matheus`, `Mateus`, `Davi`, `Kaue`.
- Orientacao: `Nuno` (governance, avaliacao, preparacao e gates).
- Cadencia: sprints semanais.
- Escopo: MVP academico robusto.

## Macro fases

| Macro | Nome | Cobertura principal |
| --- | --- | --- |
| `MF0` | Kickoff e governance | alinhamento, ownership, backlog, DoD |
| `MF1` | Fundacao tecnica | base FE/BE, seguranca, observabilidade |
| `MF2` | Core streaming | `RF01..RF18` |
| `MF3` | Descoberta e comunidade | `RF19..RF34` |
| `MF4` | Monetizacao solidaria | `RF35..RF54` |
| `MF5` | Operacao e privacidade | `RF55..RF63` |
| `MF6` | Hardening | `RNF` criticos de qualidade/performance/seguranca |
| `MF7` | Evidencias PAP | matriz RF/RNF + demo |
| `MF8` | Buffer e fecho | estabilizacao final |

---

## MF0 - Kickoff e governance

### Owners

- Owner: `Nuno`
- Apoio: `Matheus`, `Mateus`, `Davi`, `Kaue`

### Step-by-step

1. Confirmar leitura de `RF.md` e `RNF.md` por toda a equipa.
2. Publicar distribuicao de responsabilidades.
3. Publicar backlog atomico inicial.
4. Definir DoD e formato de evidencia.
5. Definir calendario de sprints.
6. Fazer reuniao de alinhamento inicial.

### Gate de saida

- Planificacao completa publicada em `docs/planificacao`.
- Todos os BKs criticos com owner.

---

## MF1 - Fundacao tecnica

### Owners por stream

- Backend core: `Matheus`
- Frontend base: `Mateus`
- Dados e observabilidade: `Davi`
- QA base e smoke tests: `Kaue`
- Gate: `Nuno`

### Step-by-step

1. Estruturar backend modular.
2. Estruturar frontend por componentes.
3. Criar cliente API com tratamento de erro.
4. Implementar sessao segura base.
5. Implementar health-check e logs.
6. Executar smoke tests FE/BE.

### Gate de saida

- FE e BE sobem sem bloqueios.
- Sessao base funcional.
- Smoke tests executados.

---

## MF2 - Core streaming MVP (`RF01..RF18`)

### Owners por stream

- Auth e regras de acesso: `Matheus`
- UI/UX e player: `Mateus`
- Catalogo/historico de consumo: `Davi`
- Testes E2E de fluxo principal: `Kaue`
- Gate: `Nuno`

### Step-by-step

1. Fechar registo/login/recuperacao.
2. Fechar perfil e papeis base.
3. Fechar catalogo e detalhe.
4. Fechar reproducao e continuar a ver.
5. Fechar favoritos/watchlist/historico.
6. Executar E2E do fluxo principal.

### Gate de saida

- Fluxo `login -> detalhe -> play -> continuar` validado.
- Evidencias de teste registadas.

---

## MF3 - Descoberta e comunidade (`RF19..RF34`)

### Owners por stream

- Pesquisa/recomendacao e dados: `Davi`
- UX de descoberta e comunidade: `Mateus`
- Moderacao e regras: `Kaue`
- APIs de suporte: `Matheus`
- Gate: `Nuno`

### Step-by-step

1. Fechar ratings e agregacao.
2. Fechar comentarios moderados.
3. Fechar pesquisa unificada e filtros.
4. Fechar recomendacao baseline + cold start.
5. Fechar explicabilidade.
6. Fechar estudo biblico e comunidade.

### Gate de saida

- Pesquisa e recomendacoes consistentes.
- Moderacao minima funcional.

---

## MF4 - Monetizacao solidaria (`RF35..RF54`)

### Owners por stream

- Subscricoes e ciclo de faturacao: `Matheus`
- Pool, calculos e relatorios: `Davi`
- UX de transparencia e notificacoes: `Mateus`
- Fluxos admin/moderacao operacional: `Kaue`
- Gate: `Nuno`

### Step-by-step

1. Fechar planos e estado de subscricao.
2. Fechar metodos de pagamento simulados e trial.
3. Fechar candidaturas e aprovacao de associacoes.
4. Fechar distribuicao/rotacao da pool.
5. Fechar relatorios e historicos.
6. Fechar notificacoes e workflow editorial.

### Gate de saida

- Subscricao e pool auditaveis.
- Relatorios e notificacoes operacionais.

---

## MF5 - Operacao e privacidade (`RF55..RF63`)

### Owners por stream

- RGPD e seguranca de dados: `Matheus`
- Admin e operacao: `Kaue`
- UX admin e perfis: `Mateus`
- Metricas/integracoes: `Davi`
- Gate: `Nuno`

### Step-by-step

1. Fechar exportacao e eliminacao de dados.
2. Fechar consentimentos.
3. Fechar gestao de utilizadores/admin.
4. Fechar painel de metricas e integracoes.
5. Fechar perfis/dispositivos.
6. Fechar gamificacao baseline.

### Gate de saida

- Fluxos RGPD completos.
- Operacao admin estavel.

---

## MF6 - Hardening tecnico (`RNF`)

### Owners por stream

- Hardening de seguranca: `Matheus`
- Performance e dados: `Davi`
- Acessibilidade e UX final: `Mateus`
- Regressao completa e evidencia tecnica: `Kaue`
- Gate final: `Nuno`

### Step-by-step

1. Executar regressao backend.
2. Executar regressao frontend.
3. Corrigir seguranca e privacidade.
4. Corrigir performance critica.
5. Corrigir acessibilidade e UX.
6. Passar quality gate final.

### Gate de saida

- Sem falhas criticas abertas.
- RNF criticos validados.

---

## MF7 - Consolidacao e evidencia PAP

### Owners

- Cobertura RF: `Kaue`
- Cobertura RNF: `Davi`
- Roteiro de demo: `Mateus`
- Ensaio tecnico: `Matheus`
- Avaliacao final: `Nuno`

### Step-by-step

1. Construir matriz RF -> evidencias.
2. Construir matriz RNF -> validacoes.
3. Preparar roteiro da demo.
4. Ensaiar apresentacao tecnica.
5. Receber feedback final do orientador.

### Gate de saida

- Pacote de defesa pronto.
- Demonstração consistente.

---

## MF8 - Buffer e fecho final

### Owners

- Riscos e bugs finais: `Matheus`, `Mateus`, `Davi`, `Kaue`
- Scope freeze e fecho: `Nuno`

### Step-by-step

1. Levantar riscos residuais.
2. Corrigir bugs bloqueantes.
3. Fechar escopo final.
4. Empacotar entrega final.
5. Registar retro final.

### Gate de saida

- Sem bloqueadores de entrega.
- Escopo final congelado.

## Changelog

- `2026-04-11`: versao revista com equipa correta (`Matheus`, `Mateus`, `Davi`, `Kaue`) e papel de orientacao do Nuno.
