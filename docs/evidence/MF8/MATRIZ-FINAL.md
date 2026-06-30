# Matriz final - MF8

## Metadados

- `bk_id`: `BK-MF8-06`
- `macro`: `MF8`
- `data`: `2026-06-29`
- `estado`: `PASS_COM_RESSALVAS`
- `decisao`: requisitos e evidencias ficam consolidados para a lista de riscos totais, mantendo ressalvas documentadas.
- `pr`: `NAO_APLICAVEL`; entrega local de evidence PAP.
- `fonte`: `BK-MF8-06`, `RF_ATIVOS_MVP`, `BACKLOG-MVP.md`, `MATRIZ-CANONICA-BK.md`, evidencias MF6/MF7/MF8 e relatorios de implementacao/auditoria.

## Fontes finais

| Fonte | Caminho | Uso na matriz |
| --- | --- | --- |
| Requisitos funcionais | `docs/RF.md` | Lista de RF ativos e RF descontinuados. |
| Requisitos nao funcionais | `docs/RNF.md` | Lista de `RNF01..RNF40` ativos. |
| Matriz canonica | `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` | Ligacao requisito -> BK -> owner -> gate. |
| Backlog final | `docs/planificacao/backlogs/BACKLOG-MVP.md` | Confirma 60 BK e cadeia MF8 de 10 guias. |
| Readiness | `docs/evidence/MF8/PAINEL-READINESS-OPERACIONAL.md` | Sinais tecnicos e decisao operacional. |
| Auditoria admin | `docs/evidence/MF8/AUDITORIA-ADMINISTRATIVA-FINAL.md` | Fecho de `RNF19`/`RNF30` para superficies admin. |
| Suite final | `docs/evidence/MF8/TESTES-FINAIS-CRIADOS.md` | Matriz de testes para execucao posterior. |
| Evidencia visual MF7/MF8 | `docs/evidence/MF7/*`, `docs/evidence/MF8/ALINHAMENTO-VISUAL-*.md` | Base para UX, responsividade e navegacao. |

## Requisitos funcionais ativos

| Requisitos | BKs principais | Owners principais | Evidence/proof | Negativo esperado | Estado final | Observacao |
| --- | --- | --- | --- | --- | --- | --- |
| `RF01`, `RF02`, `RF05` | `BK-MF2-01`, `BK-MF7-02` | Matheus | Auth/sessao em backend/frontend, cookies HttpOnly, relatorios MF2/MF7. | Visitante nao autenticado nao pode aceder a area privada. | `PASS_COM_RESSALVAS` | Sem E2E browser autenticado final nesta evidence. |
| `RF03`, `RF04` | `BK-MF2-02`, `BK-MF5-04`, `BK-MF7-02` | Matheus/Kaue | Perfil, roles e guardas admin. | Role comum nao executa admin; regressao MF8 prova 403. | `PASS_COM_RESSALVAS` | Admin browser completo segue para `BK-MF8-08`. |
| `RF06`, `RF07`, `RF08`, `RF09`, `RF10` | `BK-MF2-03`, `BK-MF2-04`, `BK-MF7-03`, `BK-MF8-01`, `BK-MF8-02` | Davi/Mateus/Matheus | Catalogo, detalhe, taxonomias, admin catalogo e alinhamento visual. | Conteudo draft nao aparece em listagem publica. | `PASS_COM_RESSALVAS` | HLS/CDN/DRM real fora do contrato MVP. |
| `RF11`, `RF12`, `RF13`, `RF14`, `RF15` | `BK-MF2-05`, `BK-MF2-06`, `BK-MF6-01`, `BK-MF8-03` | Mateus/Kaue/Matheus | Playback, continuar a ver, preferencias media e regressao. | Utilizador sem subscricao ativa nao deve reproduzir conteudo protegido. | `PASS_COM_RESSALVAS` | Streaming adaptativo real nao e declarado como entregue. |
| `RF16`, `RF17`, `RF18` | `BK-MF2-07`, `BK-MF6-03` | Davi/Matheus | Biblioteca autenticada, historico e ownership backend. | Frontend nao pode enviar `userId` arbitrario para assumir dados de outro utilizador. | `PASS_COM_RESSALVAS` | Estado positivo depende da suite final preparada. |
| `RF19`, `RF20`, `RF21` | `BK-MF3-01`, `BK-MF3-02` | Davi/Matheus | Ratings, comentarios moderados e agregacao. | Comentario/rating anonimo ou com payload invalido deve falhar. | `PASS_COM_RESSALVAS` | Validado por reports anteriores e nao reexecutado aqui. |
| `RF22`, `RF23`, `RF24`, `RF25` | `BK-MF3-03`, `BK-MF3-04` | Davi/Mateus | Pesquisa, filtros, carrosseis e relacionados. | Pesquisa nao deve depender de motor externo nao documentado. | `PASS_COM_RESSALVAS` | Baseline sem motor externo. |
| `RF26`, `RF27`, `RF28` | `BK-MF3-05`, `BK-MF3-06` | Davi/Mateus | Recomendacao baseline, cold start e explicabilidade. | Nao prometer IA generativa, RAG, embeddings ou personalizacao opaca. | `PASS_COM_RESSALVAS` | Recomendacao e explicavel/baseline. |
| `RF35`, `RF36`, `RF37`, `RF38`, `RF39`, `RF40` | `BK-MF4-01`, `BK-MF4-02` | Matheus/Davi | Subscricoes e pagamentos simulados/trial. | Gateway real, webhook real ou dados de cartao na app passa a `FAIL`. | `PASS_COM_RESSALVAS` | Pagamento real fica fora do MVP implementado. |
| `RF41`, `RF42`, `RF43`, `RF44`, `RF45`, `RF46`, `RF47`, `RF48` | `BK-MF4-03..06`, `BK-MF8-05` | Kaue/Matheus/Davi | Candidaturas, aprovacao, pool, distribuicao, historico e auditoria admin. | Associacao nao admin nao ve dados globais da pool. | `PASS_COM_RESSALVAS` | Auditoria admin final preserva ressalva de browser/E2E. |
| `RF52`, `RF53`, `RF54` | `BK-MF4-08` | Mateus | Notificacoes transacionais e preferencias. | Preferencia de outro utilizador nao deve ser alterada. | `PASS_COM_RESSALVAS` | Evidencia consumida de MF4/MF6. |
| `RF55`, `RF56`, `RF57` | `BK-MF5-01`, `BK-MF5-02`, `BK-MF5-03` | Matheus/Mateus | Exportacao, eliminacao de conta e consentimentos. | Exportacao/eliminacao de outro utilizador deve falhar por ownership. | `PASS_COM_RESSALVAS` | Sem E2E final de RGPD nesta evidence. |
| `RF58`, `RF59`, `RF60` | `BK-MF5-04`, `BK-MF5-05`, `BK-MF5-06`, `BK-MF8-05` | Kaue/Davi/Matheus | Admin users, metricas agregadas, integracoes controladas e auditoria. | User comum recebe 403 em rotas admin; segredos em publicConfig rejeitados. | `PASS_COM_RESSALVAS` | Regressao MF8 reforca prova administrativa. |

### RF descontinuados

Os IDs `RF29..RF34` e `RF49..RF51` permanecem fora do MVP ativo por rebaseline documentado em `docs/RF.md`. Nao entram como gaps porque nao sao requisitos ativos da matriz final.

## Requisitos nao funcionais ativos

| Requisitos | BKs principais | Owners principais | Evidence/proof | Negativo esperado | Estado final |
| --- | --- | --- | --- | --- | --- |
| `RNF01`, `RNF02`, `RNF03`, `RNF04`, `RNF05`, `RNF06` | `BK-MF6-05`, `BK-MF7-03`, `BK-MF7-04`, `BK-MF8-01`, `BK-MF8-02` | Mateus/Davi/Matheus | Evidencias visuais, build frontend e regressao frontend. | UI sem estados, contraste insuficiente ou texto fora de PT-PT. | `PASS_COM_RESSALVAS` |
| `RNF07`, `RNF08`, `RNF09`, `RNF10`, `RNF11`, `RNF12` | `BK-MF6-04`, `BK-MF8-03` | Davi/Matheus | Evidence de performance e matriz de testes finais. | Listagens lentas sem paginacao/limite ou promessa de escalabilidade nao provada. | `PASS_COM_RESSALVAS` |
| `RNF13`, `RNF14`, `RNF15`, `RNF16`, `RNF17`, `RNF18`, `RNF19`, `RNF20` | `BK-MF1-04`, `BK-MF6-03`, `BK-MF8-05` | Matheus | Hardening, cookies HttpOnly, scans, auditoria admin e logs. | Segredos hardcoded, sessao em storage do browser, role client-side ou log sensivel. | `PASS_COM_RESSALVAS` |
| `RNF21`, `RNF22`, `RNF23`, `RNF24`, `RNF25`, `RNF26` | `BK-MF8-02`, `BK-MF8-03`, `BK-MF4-06` | Matheus/Kaue | Alinhamento visual, matriz de testes, API REST e CSV de historico. | Declarar compatibilidade/streaming/gateway real sem prova. | `PASS_COM_RESSALVAS` |
| `RNF27`, `RNF28`, `RNF29` | `BK-MF1-01`, `BK-MF1-02`, `BK-MF1-06`, `BK-MF6-01`, `BK-MF6-02`, `BK-MF8-03` | Kaue/Matheus | Backend modular, frontend modular e suite final. | Imports partidos, duplicacao de clients/rotas ou testes inexistentes. | `PASS_COM_RESSALVAS` |
| `RNF30`, `RNF31`, `RNF32`, `RNF33` | `BK-MF1-05`, `BK-MF8-04`, `BK-MF8-05` | Kaue/Matheus | Logger estruturado, health-check e readiness. | Falta de request id/logs ou health sem status previsivel. | `PASS_COM_RESSALVAS` |
| `RNF34`, `RNF35`, `RNF36`, `RNF37` | `BK-MF3-06`, `BK-MF6-03`, `BK-MF8-02` | Mateus/Matheus | Explicabilidade de recomendacao e filtros de privacidade/curadoria. | Recomendacao opaca ou partilha de dados com terceiros sem contrato. | `PASS_COM_RESSALVAS` |
| `RNF38`, `RNF39`, `RNF40` | `BK-MF8-02`, `BK-MF7-04` | Matheus/Davi | PT-PT, datas/formato europeu e alinhamento visual. | Texto fora de PT-PT sem justificacao. | `PASS_COM_RESSALVAS` |

## Estado por passo do BK

| Passo | pr | proof | neg | fonte | Decisao |
| --- | --- | --- | --- | --- | --- |
| 1. Recolher fontes finais | `NAO_APLICAVEL` | Fontes finais listadas com caminho e uso. | Fonte sem caminho/data fica ressalva. | `BK-MF8-06`. | `PASS` |
| 2. Criar matriz RF/RNF final | `NAO_APLICAVEL` | Tabelas de RF e RNF ativos acima. | Requisito ativo sem linha. | `RF.md`; `RNF.md`; matriz canonica. | `PASS` |
| 3. Relacionar implementacao, testes e documentacao | `NAO_APLICAVEL` | Cada grupo tem BK, evidence/proof e negativo. | Estado positivo sem proof ou negativo. | Reports/evidences MF2..MF8. | `PASS_COM_RESSALVAS` |
| 4. Separar gaps assumidos | `NAO_APLICAVEL` | Ressalvas classificadas abaixo. | Gap sem owner/destino. | Readiness e auditoria admin. | `PASS` |
| 5. Validar ordem pedagogica | `NAO_APLICAVEL` | Cadeia `MF7 -> MF8` e `BK-MF8-01..10` preservada. | BK depender de artefacto inexistente. | `PLANO-SPRINTS.md`; `MF-VIEWS.md`. | `PASS` |
| 6. Fechar estado final por requisito | `NAO_APLICAVEL` | Estados usam `PASS_COM_RESSALVAS`, nao sucesso absoluto. | Estado `PASS` sem prova completa. | `BK-MF8-06`. | `PASS_COM_RESSALVAS` |
| 7. Preparar handoff para riscos totais | `NAO_APLICAVEL` | Lista de riscos candidatos abaixo. | Risco sem origem documental. | `BK-MF8-07`. | `PASS` |

## Gaps, ressalvas e decisoes

| Gap/ressalva | Requisitos afetados | Impacto | Owner | Decisao |
| --- | --- | --- | --- | --- |
| E2E/browser autenticado completo ainda depende de ambiente final. | `RF02`, `RF04`, `RF58..RF60`, `RNF21`, `RNF22`, `RNF29` | Pode faltar prova visual/runtime completa, mas contratos backend/frontend estao mapeados. | Davi/Matheus | Transportar para `BK-MF8-08`. |
| Sweep visual final nao substituido por validacao humana completa. | `RNF01..RNF05`, `RNF21`, `RNF22`, `RNF38..RNF40` | Mantem risco UX controlado. | Mateus | Transportar para `BK-MF8-07` e `BK-MF8-08`. |
| Rollback/deployment formal e documento tecnico unico ainda sao ressalvas de readiness. | `RNF32`, `RNF33` | Impede elevar readiness global para `GO`. | Matheus | Transportar para `BK-MF8-07` e freeze. |
| Auditoria admin de associacoes/pool tem prova estatica e regressao parcial. | `RF41..RF48`, `RNF19`, `RNF30` | Requer confirmacao final se a equipa quiser `PASS` pleno. | Kaue | Risco controlado para lista total. |

## Coerencia entre MFs

| Fronteira | Estado | Justificacao |
| --- | --- | --- |
| `MF7 -> MF8` | `COERENTE_COM_RISCOS` | MF7 entrega navegacao/UI segura e MF8 preserva ressalvas visuais sem as esconder. |
| `BK-MF8-04 -> BK-MF8-05` | `COERENTE` | Readiness entrega sinais operacionais; auditoria admin fecha permissoes/logs/exposicao. |
| `BK-MF8-05 -> BK-MF8-06` | `COERENTE` | Auditoria admin alimenta `RNF19`/`RNF30` e risco administrativo na matriz final. |
| `BK-MF8-06 -> BK-MF8-07` | `COERENTE_COM_RISCOS` | Matriz final entrega gaps e ressalvas priorizaveis para riscos totais. |
| `MF8 -> MF9` | `COERENTE_COM_RISCOS` | MF9 existe como extensao canonica posterior para `RF61..RF63`; nao reabre a baseline MF8 congelada e o fecho MF8 segue ate `BK-MF8-10`. |

## Handoff para BK-MF8-07

- Estado final da matriz: `PASS_COM_RESSALVAS`.
- Sem gap P0/P1 novo confirmado nesta consolidacao.
- Riscos candidatos: browser/E2E autenticado, sweep visual final, rollback/deployment formal, documento tecnico unico e auditoria admin completa de associacoes/pool.
- `BK-MF8-07` deve transformar estes riscos em severidade, probabilidade, owner, mitigacao e decisao de aceitacao/correcao.
