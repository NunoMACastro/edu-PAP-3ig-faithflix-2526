# Distribuicao de Responsabilidades

## Header

- `doc_id`: `DISTRIBUICAO-RESPONSABILIDADES`
- `path`: `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- `area`: `project`
- `owner`: `Nuno (orientacao)`
- `status`: `ativo`
- `last_updated`: `2026-04-11`

## Objetivo

Distribuir responsabilidades de forma equilibrada entre os 4 alunos e separar claramente desenvolvimento tecnico de orientacao/avaliacao.

## Equipa

- `Matheus`: backend core, seguranca, regras de negocio.
- `Mateus`: frontend, UX, fluxos de utilizador.
- `Davi`: dados, pesquisa, recomendacoes, metricas e integracoes.
- `Kaue`: QA, testes, operacao admin, consolidacao de evidencias.
- `Nuno`: orientador (governance, qualidade, avaliacao e gates).

## Carga alvo

- `Matheus`: `22.5%`
- `Mateus`: `22.5%`
- `Davi`: `22.5%`
- `Kaue`: `22.5%`
- `Nuno`: `10%` (somente fases de orientacao/avaliacao/preparacao)

## Regras principais

1. Cada BK tem owner unico.
2. Nuno nao e owner de implementacao core recorrente.
3. Troca de owner em sprint exige justificacao e registo.
4. BK sem owner nao entra no sprint planning.
5. BK `DONE` exige evidencia + validacao tecnica.

## Matriz por area funcional

| Area                               | Owner principal | Apoio principal | Revisor/gate |
| ---------------------------------- | --------------- | --------------- | ------------ |
| Autenticacao e sessao              | Matheus         | Mateus          | Nuno         |
| Catalogo e metadados               | Davi            | Matheus         | Nuno         |
| Streaming e player                 | Mateus          | Matheus         | Nuno         |
| Favoritos/historico/watchlist      | Davi            | Mateus          | Nuno         |
| Pesquisa e descoberta              | Davi            | Mateus          | Nuno         |
| Recomendacoes IA baseline          | Davi            | Matheus         | Nuno         |
| Comunidade e moderacao             | Kaue            | Matheus         | Nuno         |
| Subscricoes e pagamentos simulados | Matheus         | Davi            | Nuno         |
| Pool de associacoes                | Davi            | Kaue            | Nuno         |
| Admin panel e operacao             | Kaue            | Mateus          | Nuno         |
| RGPD e privacidade                 | Matheus         | Kaue            | Nuno         |
| Testes e hardening                 | Kaue            | todos           | Nuno         |

## Matriz por artefacto

| Artefacto                               | Owner   | Apoio   |
| --------------------------------------- | ------- | ------- |
| Rotas e servicos backend                | Matheus | Davi    |
| Modelos e persistencia                  | Davi    | Matheus |
| Paginas e componentes frontend          | Mateus  | Kaue    |
| Testes E2E/integração                   | Kaue    | Mateus  |
| Observabilidade e metricas tecnicas     | Davi    | Kaue    |
| Evidencias de sprint e cobertura RF/RNF | Kaue    | todos   |
| Quality gate final                      | Nuno    | todos   |

## Cerimonias

| Cerimonia        | Frequencia | Owner            | Participantes               | Resultado                  |
| ---------------- | ---------- | ---------------- | --------------------------- | -------------------------- |
| Sprint Planning  | semanal    | Nuno             | Matheus, Mateus, Davi, Kaue | sprint goal + BKs fechados |
| Daily sync curta | 3x semana  | Kaue             | Matheus, Mateus, Davi       | estado + blockers          |
| Tech sync FE/BE  | 2x semana  | Matheus + Mateus | Davi, Kaue                  | alinhamento de integracao  |
| Review/Demo      | semanal    | Mateus           | Matheus, Davi, Kaue, Nuno   | demo funcional             |
| Retro            | semanal    | Nuno             | Matheus, Mateus, Davi, Kaue | acoes de melhoria          |
| Gate macro fase  | por macro  | Nuno             | Matheus, Mateus, Davi, Kaue | GO/NO-GO                   |

## Step-by-step para atribuicao de BK

1. Confirmar objetivo da sprint.
2. Listar BKs desbloqueados.
3. Ordenar por prioridade (`P0` > `P1` > `P2`).
4. Atribuir owner unico e apoio.
5. Confirmar capacidade individual.
6. Definir evidencias esperadas.
7. Marcar BKs selecionados no backlog.

## Step-by-step para fechar BK

1. Implementacao concluida pelo owner.
2. Teste local e integracao executados.
3. Criterios de aceite validados.
4. Evidencia anexada.
5. Revisao tecnica feita.
6. Estado atualizado para `DONE`.

## Papel do Nuno (detalhado)

### Governance

- aprovar planeamento macro;
- aprovar mudancas de escopo;
- controlar gates de macro fase.

### Avaliacao tecnica

- validar criterios de aceite;
- validar risco de seguranca e RGPD;
- bloquear fecho quando houver regressao critica.

### Preparacao PAP

- orientar consolidacao de evidencias;
- orientar roteiro de demonstracao;
- orientar treino de defesa tecnica.

## Changelog

- `2026-04-11`: versao revista para equipa de 4 alunos e papel de orientacao do Nuno.
