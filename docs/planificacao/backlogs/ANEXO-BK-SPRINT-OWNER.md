# ANEXO-BK-SPRINT-OWNER

## Header
- `doc_id`: `ANEXO-BK-SPRINT-OWNER`
- `path`: `docs/planificacao/backlogs/ANEXO-BK-SPRINT-OWNER.md`
- `area`: `project`
- `owner`: `Nuno (orientacao)`
- `status`: `ativo`
- `last_updated`: `2026-04-17`

## Objetivo
Consolidar BK, sprint e ownership para validação cruzada rápida.

## Tabela canónica
| bk_id | macro | sprint | owner | apoio | prioridade | core_or_reforco | rf_rnf | dependencias | guia_path |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BK-MF0-01 | MF0 | S01 | Nuno | - | P0 | Reforco | transversal | - | docs/planificacao/guias-bk/MF0/BK-MF0-01-publicar-plano-total.md |
| BK-MF0-02 | MF0 | S01 | Nuno | - | P0 | Reforco | transversal | BK-MF0-01 | docs/planificacao/guias-bk/MF0/BK-MF0-02-publicar-distribuicao-responsabilidades.md |
| BK-MF0-03 | MF0 | S01 | Nuno | Matheus, Mateus, Davi, Kaue | P0 | Reforco | transversal | BK-MF0-01 | docs/planificacao/guias-bk/MF0/BK-MF0-03-publicar-backlog-atomico-inicial.md |
| BK-MF0-04 | MF0 | S01 | Nuno | Matheus, Mateus, Davi, Kaue | P0 | Reforco | transversal | BK-MF0-03 | docs/planificacao/guias-bk/MF0/BK-MF0-04-definir-dod-e-formato-evidencia.md |
| BK-MF0-05 | MF0 | S01 | Nuno | - | P0 | Reforco | transversal | BK-MF0-03 | docs/planificacao/guias-bk/MF0/BK-MF0-05-definir-calendario-sprints.md |
| BK-MF0-06 | MF0 | S01 | Nuno | Matheus, Mateus, Davi, Kaue | P0 | Reforco | transversal | BK-MF0-02,BK-MF0-05 | docs/planificacao/guias-bk/MF0/BK-MF0-06-reuniao-alinhamento-inicial.md |
| BK-MF1-01 | MF1 | S01 | Matheus | Davi | P0 | Reforco | RNF27 | BK-MF0-06 | docs/planificacao/guias-bk/MF1/BK-MF1-01-estrutura-base-backend-modulos.md |
| BK-MF1-02 | MF1 | S01 | Mateus | Kaue | P0 | Reforco | RNF28 | BK-MF0-06 | docs/planificacao/guias-bk/MF1/BK-MF1-02-estrutura-base-frontend-componentes.md |
| BK-MF1-03 | MF1 | S02 | Mateus | Matheus | P0 | Reforco | RNF05, RNF30 | BK-MF1-02 | docs/planificacao/guias-bk/MF1/BK-MF1-03-cliente-api-frontend-tratamento-erro.md |
| BK-MF1-04 | MF1 | S02 | Matheus | Kaue | P0 | Reforco | RNF13, RNF15 | BK-MF1-01 | docs/planificacao/guias-bk/MF1/BK-MF1-04-sessao-segura-backend-cookies-auth-base.md |
| BK-MF1-05 | MF1 | S02 | Kaue | Davi | P1 | Core | RNF31 | BK-MF1-01 | docs/planificacao/guias-bk/MF1/BK-MF1-05-health-check-e-logging-estruturado.md |
| BK-MF1-06 | MF1 | S02 | Kaue | Mateus | P1 | Core | RNF29 | BK-MF1-03,BK-MF1-04 | docs/planificacao/guias-bk/MF1/BK-MF1-06-smoke-tests-fe-be.md |
| BK-MF2-01 | MF2 | S02 | Matheus | Mateus | P0 | Reforco | RF01, RF02, RF05 | BK-MF1-04 | docs/planificacao/guias-bk/MF2/BK-MF2-01-registo-login-recuperacao-password.md |
| BK-MF2-02 | MF2 | S03 | Matheus | Kaue | P0 | Reforco | RF03, RF04 | BK-MF2-01 | docs/planificacao/guias-bk/MF2/BK-MF2-02-edicao-perfil-papeis-base.md |
| BK-MF2-03 | MF2 | S03 | Davi | Matheus | P0 | Reforco | RF06, RF07, RF09, RF10 | BK-MF1-01 | docs/planificacao/guias-bk/MF2/BK-MF2-03-crud-catalogo-taxonomias.md |
| BK-MF2-04 | MF2 | S03 | Mateus | Davi | P0 | Reforco | RF08 | BK-MF2-03 | docs/planificacao/guias-bk/MF2/BK-MF2-04-pagina-detalhe-conteudo.md |
| BK-MF2-05 | MF2 | S04 | Mateus | Matheus | P0 | Reforco | RF11, RF12 | BK-MF2-04 | docs/planificacao/guias-bk/MF2/BK-MF2-05-reproducao-continuar-a-ver.md |
| BK-MF2-06 | MF2 | S04 | Mateus | Kaue | P1 | Core | RF13, RF14, RF15 | BK-MF2-05 | docs/planificacao/guias-bk/MF2/BK-MF2-06-legendas-audio-parental-e-qualidade.md |
| BK-MF2-07 | MF2 | S04 | Davi | Mateus | P0 | Reforco | RF16, RF17, RF18 | BK-MF2-05 | docs/planificacao/guias-bk/MF2/BK-MF2-07-favoritos-watchlist-historico.md |
| BK-MF2-08 | MF2 | S04 | Kaue | Mateus | P0 | Reforco | RNF07, RNF08 | BK-MF2-01,BK-MF2-07 | docs/planificacao/guias-bk/MF2/BK-MF2-08-teste-e2e-fluxo-principal.md |
| BK-MF3-01 | MF3 | S05 | Davi | Matheus | P1 | Core | RF19, RF21 | BK-MF2-07 | docs/planificacao/guias-bk/MF3/BK-MF3-01-ratings-e-agregacao.md |
| BK-MF3-02 | MF3 | S05 | Matheus | Kaue | P2 | Core | RF20 | BK-MF3-01 | docs/planificacao/guias-bk/MF3/BK-MF3-02-comentarios-curtos-moderados.md |
| BK-MF3-03 | MF3 | S05 | Davi | Mateus | P0 | Reforco | RF22 | BK-MF2-03 | docs/planificacao/guias-bk/MF3/BK-MF3-03-pesquisa-unificada.md |
| BK-MF3-04 | MF3 | S05 | Mateus | Davi | P1 | Core | RF23, RF24, RF25 | BK-MF3-03 | docs/planificacao/guias-bk/MF3/BK-MF3-04-filtros-carrosseis-e-relacionados.md |
| BK-MF3-05 | MF3 | S06 | Davi | Matheus | P1 | Core | RF26, RF27 | BK-MF3-01,BK-MF2-07 | docs/planificacao/guias-bk/MF3/BK-MF3-05-recomendacao-baseline-cold-start.md |
| BK-MF3-06 | MF3 | S06 | Mateus | Davi | P2 | Core | RF28, RNF34 | BK-MF3-05 | docs/planificacao/guias-bk/MF3/BK-MF3-06-explicabilidade-de-recomendacao.md |
| BK-MF4-01 | MF4 | S07 | Matheus | Davi | P0 | Reforco | RF35, RF36, RF38, RF39 | BK-MF2-01 | docs/planificacao/guias-bk/MF4/BK-MF4-01-planos-ciclo-subscricao.md |
| BK-MF4-02 | MF4 | S07 | Davi | Matheus | P0 | Reforco | RF37, RF40 | BK-MF4-01 | docs/planificacao/guias-bk/MF4/BK-MF4-02-metodos-pagamento-simulados-trial.md |
| BK-MF4-03 | MF4 | S08 | Kaue | Davi | P0 | Reforco | RF41 | BK-MF1-04 | docs/planificacao/guias-bk/MF4/BK-MF4-03-candidaturas-associacoes.md |
| BK-MF4-04 | MF4 | S08 | Matheus | Kaue | P0 | Reforco | RF42, RF43 | BK-MF4-03 | docs/planificacao/guias-bk/MF4/BK-MF4-04-aprovacao-entrada-pool.md |
| BK-MF4-05 | MF4 | S08 | Davi | Matheus | P0 | Reforco | RF44, RF45 | BK-MF4-04 | docs/planificacao/guias-bk/MF4/BK-MF4-05-distribuicao-mensal-rotacao.md |
| BK-MF4-06 | MF4 | S08 | Kaue | Mateus | P1 | Core | RF46, RF47, RF48 | BK-MF4-05 | docs/planificacao/guias-bk/MF4/BK-MF4-06-relatorios-e-historico-por-associacao.md |
| BK-MF4-08 | MF4 | S07 | Mateus | Davi | P1 | Core | RF52, RF53, RF54 | BK-MF4-01 | docs/planificacao/guias-bk/MF4/BK-MF4-08-notificacoes-transacionais-e-preferencias.md |
| BK-MF5-01 | MF5 | S09 | Matheus | Kaue | P0 | Reforco | RF55 | BK-MF2-01 | docs/planificacao/guias-bk/MF5/BK-MF5-01-exportacao-dados-utilizador.md |
| BK-MF5-02 | MF5 | S09 | Matheus | Kaue | P0 | Reforco | RF56 | BK-MF5-01 | docs/planificacao/guias-bk/MF5/BK-MF5-02-eliminacao-conta-dados.md |
| BK-MF5-03 | MF5 | S09 | Mateus | Matheus | P0 | Reforco | RF57 | BK-MF2-01 | docs/planificacao/guias-bk/MF5/BK-MF5-03-gestao-consentimentos.md |
| BK-MF5-04 | MF5 | S09 | Kaue | Matheus | P1 | Core | RF58 | BK-MF2-02 | docs/planificacao/guias-bk/MF5/BK-MF5-04-gestao-de-utilizadores-admin.md |
| BK-MF5-05 | MF5 | S09 | Davi | Mateus | P1 | Core | RF59 | BK-MF5-04 | docs/planificacao/guias-bk/MF5/BK-MF5-05-painel-de-metricas-admin.md |
| BK-MF5-06 | MF5 | S10 | Davi | Matheus | P1 | Core | RF60 | BK-MF5-04 | docs/planificacao/guias-bk/MF5/BK-MF5-06-configuracao-de-integracoes-admin.md |
| BK-MF6-01 | MF6 | S10 | Kaue | Matheus | P0 | Reforco | RNF29 | BK-MF5-06 | docs/planificacao/guias-bk/MF6/BK-MF6-01-suite-de-regressao-backend.md |
| BK-MF6-02 | MF6 | S10 | Kaue | Mateus | P0 | Reforco | RNF29 | BK-MF5-06 | docs/planificacao/guias-bk/MF6/BK-MF6-02-suite-de-regressao-frontend.md |
| BK-MF6-03 | MF6 | S11 | Matheus | Kaue | P0 | Reforco | RNF14, RNF16, RNF17, RNF18, RNF19, RNF20, RNF37 | BK-MF6-01 | docs/planificacao/guias-bk/MF6/BK-MF6-03-hardening-seguranca-e-privacidade.md |
| BK-MF6-04 | MF6 | S11 | Davi | Mateus | P1 | Core | RNF09, RNF10, RNF11, RNF12 | BK-MF6-02 | docs/planificacao/guias-bk/MF6/BK-MF6-04-otimizacao-de-performance-critica.md |
| BK-MF6-05 | MF6 | S11 | Mateus | Kaue | P1 | Core | RNF01, RNF02, RNF03, RNF04, RNF06 | BK-MF6-02 | docs/planificacao/guias-bk/MF6/BK-MF6-05-acessibilidade-e-ux-final.md |
| BK-MF6-06 | MF6 | S11 | Nuno | Matheus, Mateus, Davi, Kaue | P0 | Reforco | transversal | BK-MF6-03,BK-MF6-05 | docs/planificacao/guias-bk/MF6/BK-MF6-06-validacao-tecnica-final-por-gate.md |
| BK-MF7-01 | MF7 | S11 | Kaue | Matheus, Mateus, Davi | P0 | Reforco | RF_ATIVOS_MVP | BK-MF6-06 | docs/planificacao/guias-bk/MF7/BK-MF7-01-matriz-de-cobertura-rf-evidencia.md |
| BK-MF7-02 | MF7 | S11 | Davi | Kaue | P0 | Reforco | RNF21, RNF22, RNF23, RNF24, RNF25, RNF26, RNF32, RNF33, RNF35, RNF36, RNF38, RNF39, RNF40 | BK-MF6-06 | docs/planificacao/guias-bk/MF7/BK-MF7-02-matriz-de-cobertura-rnf-validacao.md |
| BK-MF7-03 | MF7 | S12 | Mateus | Kaue | P1 | Core | transversal | BK-MF7-01 | docs/planificacao/guias-bk/MF7/BK-MF7-03-roteiro-de-demo-final.md |
| BK-MF7-04 | MF7 | S12 | Matheus | Davi | P1 | Core | transversal | BK-MF7-03 | docs/planificacao/guias-bk/MF7/BK-MF7-04-ensaio-tecnico-da-defesa.md |
| BK-MF7-05 | MF7 | S12 | Nuno | Matheus, Mateus, Davi, Kaue | P0 | Reforco | transversal | BK-MF7-02,BK-MF7-04 | docs/planificacao/guias-bk/MF7/BK-MF7-05-avaliacao-final-e-feedback-orientador.md |
| BK-MF8-01 | MF8 | S12 | Kaue | Davi | P0 | Reforco | transversal | BK-MF7-05 | docs/planificacao/guias-bk/MF8/BK-MF8-01-lista-de-riscos-residuais.md |
| BK-MF8-02 | MF8 | S12 | Matheus | Mateus, Davi, Kaue | P0 | Reforco | transversal | BK-MF8-01 | docs/planificacao/guias-bk/MF8/BK-MF8-02-correcao-de-bugs-bloqueantes.md |
| BK-MF8-03 | MF8 | S12 | Nuno | Matheus, Mateus, Davi, Kaue | P0 | Reforco | transversal | BK-MF8-02 | docs/planificacao/guias-bk/MF8/BK-MF8-03-scope-freeze-final.md |
| BK-MF8-04 | MF8 | S12 | Kaue | Mateus | P1 | Core | transversal | BK-MF8-03 | docs/planificacao/guias-bk/MF8/BK-MF8-04-empacotamento-final-de-entrega.md |
| BK-MF8-05 | MF8 | S12 | Nuno | Matheus, Mateus, Davi, Kaue | P1 | Core | transversal | BK-MF8-04 | docs/planificacao/guias-bk/MF8/BK-MF8-05-retro-final-e-licoes-aprendidas.md |

## Changelog
- `2026-04-14`: anexo consolidado a partir dos guias BK canónicos.
- `2026-04-17`: removidos BK fora de escopo e reajustadas dependencias para a baseline final do MVP.
