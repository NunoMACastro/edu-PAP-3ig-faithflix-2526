# Guias BK Pedagógicos - Faithstream

## Header

- `doc_id`: `GUIAS-BK-README`
- `path`: `docs/planificacao/guias-bk/README.md`
- `area`: `project`
- `owner`: `Nuno (orientação)`
- `status`: `ativo`
- `last_updated`: `2026-04-12`

## Objetivo

Centralizar guias pedagógicos por BK para apoiar implementação passo-a-passo por alunos, com linguagem operacional e foco em reprodutibilidade.

## Contrato editorial

Cada guia BK segue a ordem fixa definida em `_TEMPLATE-BK.md`:

1. Header
2. O que vamos fazer neste BK
3. Porque isto é importante
4. O que entra (scope)
5. O que não entra (scope-out)
6. Como saber que isto ficou bem
7. Pre-leitura mínima (10-15 min)
8. Glossário rápido
9. Guia de execução (passo-a-passo)
10. Snippets de código (evolução)
11. Checklist de validação
12. Critérios de aceite
13. Evidence para PR/defesa
14. Próximo BK recomendado

## Estado de cobertura

- Fase 1 (P0 de MF0..MF5 no recorte definido): **26/26 guias criados**.
- Fase 2 (restantes BK de MF0..MF5): **18/18 guias criados**.
- Fase 3 (MF6..MF8): **16/16 guias criados**.
- Cobertura total atual: **60/60 guias BK criados**.
- Roadmap executado: `ROADMAP-BKS-RESTANTES.md`.

## Ordem de leitura recomendada

1. Ler `docs/planificacao/backlogs/BACKLOG-MVP.md` para contexto operacional.
2. Abrir o guia BK correspondente ao item da sprint.
3. Executar pelo `Guia de execução (passo-a-passo)`.
4. Fechar com `Checklist de validação` e `Evidence para PR/defesa`.

## Índice por macro

### MF0

- `BK-MF0-01`: `MF0/BK-MF0-01-publicar-plano-total.md`
- `BK-MF0-02`: `MF0/BK-MF0-02-publicar-distribuicao-responsabilidades.md`
- `BK-MF0-03`: `MF0/BK-MF0-03-publicar-backlog-atomico-inicial.md`
- `BK-MF0-04`: `MF0/BK-MF0-04-definir-dod-e-formato-evidencia.md`
- `BK-MF0-05`: `MF0/BK-MF0-05-definir-calendario-sprints.md`
- `BK-MF0-06`: `MF0/BK-MF0-06-reuniao-alinhamento-inicial.md`

### MF1

- `BK-MF1-01`: `MF1/BK-MF1-01-estrutura-base-backend-modulos.md`
- `BK-MF1-02`: `MF1/BK-MF1-02-estrutura-base-frontend-componentes.md`
- `BK-MF1-03`: `MF1/BK-MF1-03-cliente-api-frontend-tratamento-erro.md`
- `BK-MF1-04`: `MF1/BK-MF1-04-sessao-segura-backend-cookies-auth-base.md`
- `BK-MF1-05`: `MF1/BK-MF1-05-health-check-e-logging-estruturado.md`
- `BK-MF1-06`: `MF1/BK-MF1-06-smoke-tests-fe-be.md`

### MF2

- `BK-MF2-01`: `MF2/BK-MF2-01-registo-login-recuperacao-password.md`
- `BK-MF2-02`: `MF2/BK-MF2-02-edicao-perfil-papeis-base.md`
- `BK-MF2-03`: `MF2/BK-MF2-03-crud-catalogo-taxonomias.md`
- `BK-MF2-04`: `MF2/BK-MF2-04-pagina-detalhe-conteudo.md`
- `BK-MF2-05`: `MF2/BK-MF2-05-reproducao-continuar-a-ver.md`
- `BK-MF2-06`: `MF2/BK-MF2-06-legendas-audio-parental-e-qualidade.md`
- `BK-MF2-07`: `MF2/BK-MF2-07-favoritos-watchlist-historico.md`
- `BK-MF2-08`: `MF2/BK-MF2-08-teste-e2e-fluxo-principal.md`

### MF3

- `BK-MF3-01`: `MF3/BK-MF3-01-ratings-e-agregacao.md`
- `BK-MF3-02`: `MF3/BK-MF3-02-comentarios-curtos-moderados.md`
- `BK-MF3-03`: `MF3/BK-MF3-03-pesquisa-unificada.md`
- `BK-MF3-04`: `MF3/BK-MF3-04-filtros-carrosseis-e-relacionados.md`
- `BK-MF3-05`: `MF3/BK-MF3-05-recomendacao-baseline-cold-start.md`
- `BK-MF3-06`: `MF3/BK-MF3-06-explicabilidade-de-recomendacao.md`
- `BK-MF3-07`: `MF3/BK-MF3-07-estudo-biblico-e-guias.md`
- `BK-MF3-08`: `MF3/BK-MF3-08-funcionalidades-comunidade.md`

### MF4

- `BK-MF4-01`: `MF4/BK-MF4-01-planos-ciclo-subscricao.md`
- `BK-MF4-02`: `MF4/BK-MF4-02-metodos-pagamento-simulados-trial.md`
- `BK-MF4-03`: `MF4/BK-MF4-03-candidaturas-associacoes.md`
- `BK-MF4-04`: `MF4/BK-MF4-04-aprovacao-entrada-pool.md`
- `BK-MF4-05`: `MF4/BK-MF4-05-distribuicao-mensal-rotacao.md`
- `BK-MF4-06`: `MF4/BK-MF4-06-relatorios-e-historico-por-associacao.md`
- `BK-MF4-07`: `MF4/BK-MF4-07-workflow-editorial-e-denuncias.md`
- `BK-MF4-08`: `MF4/BK-MF4-08-notificacoes-transacionais-e-preferencias.md`

### MF5

- `BK-MF5-01`: `MF5/BK-MF5-01-exportacao-dados-utilizador.md`
- `BK-MF5-02`: `MF5/BK-MF5-02-eliminacao-conta-dados.md`
- `BK-MF5-03`: `MF5/BK-MF5-03-gestao-consentimentos.md`
- `BK-MF5-04`: `MF5/BK-MF5-04-gestao-de-utilizadores-admin.md`
- `BK-MF5-05`: `MF5/BK-MF5-05-painel-de-metricas-admin.md`
- `BK-MF5-06`: `MF5/BK-MF5-06-configuracao-de-integracoes-admin.md`
- `BK-MF5-07`: `MF5/BK-MF5-07-perfis-familiares-e-dispositivos.md`
- `BK-MF5-08`: `MF5/BK-MF5-08-gamificacao-baseline.md`

### MF6

- `BK-MF6-01`: `MF6/BK-MF6-01-suite-de-regressao-backend.md`
- `BK-MF6-02`: `MF6/BK-MF6-02-suite-de-regressao-frontend.md`
- `BK-MF6-03`: `MF6/BK-MF6-03-hardening-seguranca-e-privacidade.md`
- `BK-MF6-04`: `MF6/BK-MF6-04-otimizacao-de-performance-critica.md`
- `BK-MF6-05`: `MF6/BK-MF6-05-acessibilidade-e-ux-final.md`
- `BK-MF6-06`: `MF6/BK-MF6-06-validacao-tecnica-final-por-gate.md`

### MF7

- `BK-MF7-01`: `MF7/BK-MF7-01-matriz-de-cobertura-rf-evidencia.md`
- `BK-MF7-02`: `MF7/BK-MF7-02-matriz-de-cobertura-rnf-validacao.md`
- `BK-MF7-03`: `MF7/BK-MF7-03-roteiro-de-demo-final.md`
- `BK-MF7-04`: `MF7/BK-MF7-04-ensaio-tecnico-da-defesa.md`
- `BK-MF7-05`: `MF7/BK-MF7-05-avaliacao-final-e-feedback-orientador.md`

### MF8

- `BK-MF8-01`: `MF8/BK-MF8-01-lista-de-riscos-residuais.md`
- `BK-MF8-02`: `MF8/BK-MF8-02-correcao-de-bugs-bloqueantes.md`
- `BK-MF8-03`: `MF8/BK-MF8-03-scope-freeze-final.md`
- `BK-MF8-04`: `MF8/BK-MF8-04-empacotamento-final-de-entrega.md`
- `BK-MF8-05`: `MF8/BK-MF8-05-retro-final-e-licoes-aprendidas.md`

## Nota sobre snippets

Todos os guias BK (cobertura total) incluem a nota de evolução:

> "Neste momento este BK ainda não tem snippet consolidado; os snippets serão adicionados aqui com a evolução do projeto."
