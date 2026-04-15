# CONTRATO-CAMPOS-BK

## Header
- `doc_id`: `CONTRATO-CAMPOS-BK`
- `path`: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `area`: `project`
- `owner`: `Nuno (orientacao)`
- `status`: `ativo`
- `last_updated`: `2026-04-14`

## Objetivo
Fixar o contrato canónico mínimo por BK e evitar drift entre backlog, matriz e guias.

## Campos obrigatorios
`bk_id`, `macro`, `owner`, `apoio`, `prioridade`, `estado`, `esforco`, `dependencias`, `rf_rnf`, `sprint`, `core_or_reforco`, `proximo_bk`, `guia_path`.

## Snapshot canónico
| bk_id | owner | prioridade | dependencias | rf_rnf |
| --- | --- | --- | --- | --- |
| BK-MF0-01 | Nuno | P0 | - | transversal |
| BK-MF0-02 | Nuno | P0 | BK-MF0-01 | transversal |
| BK-MF0-03 | Nuno | P0 | BK-MF0-01 | transversal |
| BK-MF0-04 | Nuno | P0 | BK-MF0-03 | transversal |
| BK-MF0-05 | Nuno | P0 | BK-MF0-03 | transversal |
| BK-MF0-06 | Nuno | P0 | BK-MF0-02,BK-MF0-05 | transversal |
| BK-MF1-01 | Matheus | P0 | BK-MF0-06 | RNF27 |
| BK-MF1-02 | Mateus | P0 | BK-MF0-06 | RNF28 |
| BK-MF1-03 | Mateus | P0 | BK-MF1-02 | RNF05, RNF30 |
| BK-MF1-04 | Matheus | P0 | BK-MF1-01 | RNF13, RNF15 |
| BK-MF1-05 | Kaue | P1 | BK-MF1-01 | RNF30, RNF31 |
| BK-MF1-06 | Kaue | P1 | BK-MF1-03,BK-MF1-04 | RNF29 |
| BK-MF2-01 | Matheus | P0 | BK-MF1-04 | RF01, RF02, RF05 |
| BK-MF2-02 | Matheus | P0 | BK-MF2-01 | RF03, RF04 |
| BK-MF2-03 | Davi | P0 | BK-MF1-01 | RF06, RF07, RF09, RF10 |
| BK-MF2-04 | Mateus | P0 | BK-MF2-03 | RF08 |
| BK-MF2-05 | Mateus | P0 | BK-MF2-04 | RF11, RF12 |
| BK-MF2-06 | Mateus | P1 | BK-MF2-05 | RF13, RF14, RF15 |
| BK-MF2-07 | Davi | P0 | BK-MF2-05 | RF16, RF17, RF18 |
| BK-MF2-08 | Kaue | P0 | BK-MF2-01,BK-MF2-07 | RNF07, RNF08 |
| BK-MF3-01 | Davi | P1 | BK-MF2-07 | RF19, RF21 |
| BK-MF3-02 | Matheus | P2 | BK-MF3-01 | RF20 |
| BK-MF3-03 | Davi | P0 | BK-MF2-03 | RF22 |
| BK-MF3-04 | Mateus | P1 | BK-MF3-03 | RF23, RF24, RF25 |
| BK-MF3-05 | Davi | P1 | BK-MF3-01,BK-MF2-07 | RF26, RF27 |
| BK-MF3-06 | Mateus | P2 | BK-MF3-05 | RF28, RNF34 |
| BK-MF3-07 | Kaue | P1 | BK-MF2-04 | RF29, RF30, RF31 |
| BK-MF3-08 | Mateus | P2 | BK-MF3-02 | RF32, RF33, RF34 |
| BK-MF4-01 | Matheus | P0 | BK-MF2-01 | RF35, RF36, RF38, RF39 |
| BK-MF4-02 | Davi | P0 | BK-MF4-01 | RF37, RF40 |
| BK-MF4-03 | Kaue | P0 | BK-MF1-04 | RF41 |
| BK-MF4-04 | Matheus | P0 | BK-MF4-03 | RF42, RF43 |
| BK-MF4-05 | Davi | P0 | BK-MF4-04 | RF44, RF45 |
| BK-MF4-06 | Kaue | P1 | BK-MF4-05 | RF46, RF47, RF48 |
| BK-MF4-07 | Kaue | P1 | BK-MF3-02 | RF49, RF50, RF51 |
| BK-MF4-08 | Mateus | P1 | BK-MF4-01 | RF52, RF53, RF54 |
| BK-MF5-01 | Matheus | P0 | BK-MF2-01 | RF55 |
| BK-MF5-02 | Matheus | P0 | BK-MF5-01 | RF56 |
| BK-MF5-03 | Mateus | P0 | BK-MF2-01 | RF57 |
| BK-MF5-04 | Kaue | P1 | BK-MF2-02 | RF58 |
| BK-MF5-05 | Davi | P1 | BK-MF5-04 | RF59 |
| BK-MF5-06 | Davi | P1 | BK-MF5-04 | RF60 |
| BK-MF5-07 | Mateus | P1 | BK-MF2-02,BK-MF2-05 | RF61, RF62 |
| BK-MF5-08 | Kaue | P2 | BK-MF5-07 | RF63 |
| BK-MF6-01 | Kaue | P0 | BK-MF5-08 | RNF29 |
| BK-MF6-02 | Kaue | P0 | BK-MF5-08 | RNF29 |
| BK-MF6-03 | Matheus | P0 | BK-MF6-01 | RNF13, RNF14, RNF15, RNF16, RNF17, RNF18, RNF19, RNF20, RNF37 |
| BK-MF6-04 | Davi | P1 | BK-MF6-02 | RNF07, RNF08, RNF09, RNF10, RNF11, RNF12 |
| BK-MF6-05 | Mateus | P1 | BK-MF6-02 | RNF01, RNF02, RNF03, RNF04, RNF05, RNF06 |
| BK-MF6-06 | Nuno | P0 | BK-MF6-03,BK-MF6-05 | transversal |
| BK-MF7-01 | Kaue | P0 | BK-MF6-06 | RF01..RF63 |
| BK-MF7-02 | Davi | P0 | BK-MF6-06 | RNF01, RNF02, RNF03, RNF04, RNF05, RNF06, RNF07, RNF08, RNF09, RNF10, RNF11, RNF12, RNF13, RNF14, RNF15, RNF16, RNF17, RNF18, RNF19, RNF20, RNF21, RNF22, RNF23, RNF24, RNF25, RNF26, RNF27, RNF28, RNF29, RNF30, RNF31, RNF32, RNF33, RNF34, RNF35, RNF36, RNF37, RNF38, RNF39, RNF40 |
| BK-MF7-03 | Mateus | P1 | BK-MF7-01 | transversal |
| BK-MF7-04 | Matheus | P1 | BK-MF7-03 | transversal |
| BK-MF7-05 | Nuno | P0 | BK-MF7-02,BK-MF7-04 | transversal |
| BK-MF8-01 | Kaue | P0 | BK-MF7-05 | transversal |
| BK-MF8-02 | Matheus | P0 | BK-MF8-01 | transversal |
| BK-MF8-03 | Nuno | P0 | BK-MF8-02 | transversal |
| BK-MF8-04 | Kaue | P1 | BK-MF8-03 | transversal |
| BK-MF8-05 | Nuno | P1 | BK-MF8-04 | transversal |

## Changelog
- `2026-04-14`: contrato canónico criado a partir do `BACKLOG-MVP.md`.
