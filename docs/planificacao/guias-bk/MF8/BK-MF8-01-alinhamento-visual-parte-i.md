# BK-MF8-01 - Alinhamento visual parte I

## Header

- `doc_id`: `GUIA-BK-MF8-01`
- `bk_id`: `BK-MF8-01`
- `macro`: `MF8`
- `owner`: `Matheus`
- `apoio`: `Mateus, Kaue`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF7-05`
- `rf_rnf`: `RNF01, RNF02, RNF03, RNF04, RNF28, RNF38`
- `fase_documental`: `Fase 3`
- `sprint`: `S11`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF8-02`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-01-alinhamento-visual-parte-i.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais fechar a primeira metade do alinhamento visual entre o mockup e o frontend real do FaithFlix. O foco é transformar observações visuais em decisões verificáveis sobre tokens, cores, tipografia, espaçamentos, header, navegação, hero e página inicial.

No fim, o artefacto `docs/evidence/MF8/ALINHAMENTO-VISUAL-PARTE-I.md` deve mostrar o que foi comparado, que diferenças foram aceites, que diferenças exigem correção e que prova visual sustenta cada decisão.

#### Importância

Este BK evita que o produto final pareça desligado do mockup validado em MF7. Também prepara `BK-MF8-02`, que continua o alinhamento visual nos ecrãs de catálogo, cards, planos, estados e responsividade.

#### Scope-in

- Comparar mockup, header, navegação, hero e home.
- Registar decisões visuais com prova antes/depois.
- Separar correção obrigatória de ressalva aceite.
- Manter a validação limitada a `frontend/`, `docs/` e `mockup/`.

#### Scope-out

- Criar novas funcionalidades de produto.
- Alterar contratos backend ou RF/RNF.
- Mudar identidade visual sem prova no mockup ou na MF7.
- Fechar a decisão sem evidence visual.

#### Estado antes e depois

- Antes: `BK-MF7-05` já fechou o gate visual, responsividade e navegação segura.
- Depois: a primeira parte do alinhamento visual tem decisão, prova e handoff para `BK-MF8-02`.

#### Pré-requisitos

- Ler `BK-MF7-05` antes de iniciar este BK.
- Confirmar que a MF8 ativa tem exatamente `10` guias formais, de `BK-MF8-01` a `BK-MF8-10`.
- Consultar `BACKLOG-MVP.md`, `MATRIZ-CANONICA-BK.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md` e `PLANO-SPRINTS.md`.
- Criar ou atualizar `docs/evidence/MF8/ALINHAMENTO-VISUAL-PARTE-I.md` com prova positiva, prova negativa e decisão final.
- Executar `bash scripts/validate-planificacao.sh` e `git diff --check` antes de fechar o BK.

#### Glossário

- `Token visual`: valor reutilizável de cor, espaço, tipografia ou raio que mantém consistência entre páginas.
- `Drift visual`: diferença observável entre o mockup aprovado e o frontend real.
- `Handoff visual`: lista curta do que fica resolvido e do que passa para a parte II.
- `Proof visual`: screenshot, vídeo curto ou comparação objetiva que prova a decisão.

#### Conceitos teóricos essenciais

- `CANONICO`: o mockup orienta fluxo, hierarquia e linguagem visível; vem da validação MF7, segue para a evidence MF8 e evita decisões visuais sem fonte.
- `CANONICO`: tokens visuais servem para reduzir repetição em `frontend/`; entram no CSS global ou em estilos partilhados, saem como classes reutilizadas e evitam ajustes página a página.
- `DERIVADO`: uma diferença visual pode ser aceite se não prejudicar usabilidade, acessibilidade ou coerência; entra na matriz como ressalva e evita falsa urgência.
- `DERIVADO`: a prova antes/depois transforma opinião visual em evidence; vem de screenshots controlados, segue para o handoff e evita discussões sem critério.
- `CANONICO`: foco, contraste e navegação pertencem à qualidade visual e acessibilidade; entram neste BK para impedir que o alinhamento estético quebre uso real.

#### Arquitetura do BK

| Camada | Artefacto | Responsabilidade |
| --- | --- | --- |
| Guia | `docs/planificacao/guias-bk/MF8/BK-MF8-01-alinhamento-visual-parte-i.md` | Explica o trabalho, os passos e os critérios deste BK. |
| Evidence | `docs/evidence/MF8/ALINHAMENTO-VISUAL-PARTE-I.md` | Guarda prova positiva, prova negativa, decisão e handoff. |
| App | `frontend/`, `backend/`, `tests/`, `scripts/` | Locais públicos a rever ou executar quando o passo pedir validação técnica. |
| Planeamento | `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` | Fontes de owner, dependências, prioridade e RF/RNF. |

#### Ficheiros a criar/editar/rever

- CRIAR/EDITAR: `docs/evidence/MF8/ALINHAMENTO-VISUAL-PARTE-I.md`
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- REVER: `docs/planificacao/backlogs/MF-VIEWS.md`
- REVER: `docs/planificacao/sprints/PLANO-SPRINTS.md`
- REVER: `frontend/`, `backend/`, `tests/` ou `scripts/` quando o passo pedir validação técnica.

#### Tutorial técnico linear

### Passo 1 - Comparar mockup e frontend real

1. Objetivo funcional do passo no contexto da app.

Criar uma tabela com ecrãs do mockup, ecrãs reais, diferenças observadas e prioridade de correção.

2. Ficheiros envolvidos:
    - CRIAR: `docs/evidence/MF8/ALINHAMENTO-VISUAL-PARTE-I.md`
    - EDITAR: `docs/evidence/MF8/ALINHAMENTO-VISUAL-PARTE-I.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 1 em `docs/evidence/MF8/ALINHAMENTO-VISUAL-PARTE-I.md`.

3. Instruções do que fazer.

Revê `mockup/`, `frontend/src/` e a evidence MF7. Regista cada diferença como `PASS`, `PASS_COM_RESSALVAS` ou `FAIL` com uma prova visual.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A comparação passa quando header, navegação, hero e home têm linha própria na evidence.

7. Cenário negativo/erro esperado.

Se uma diferença for marcada como resolvida sem screenshot ou observação verificável, a decisão fica inválida.

### Passo 2 - Normalizar tokens visuais

1. Objetivo funcional do passo no contexto da app.

Rever cores, tipografia, espaçamentos e raios usados no frontend e ligar cada decisão a um token ou classe reutilizável.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/ALINHAMENTO-VISUAL-PARTE-I.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 2 em `docs/evidence/MF8/ALINHAMENTO-VISUAL-PARTE-I.md`.

3. Instruções do que fazer.

Confirma nomes já existentes em `frontend/src/styles/`. Não cries nomes novos se um token equivalente já existir.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando cada ajuste visual aponta para token/classe e prova observável.

7. Cenário negativo/erro esperado.

Se duas páginas usarem valores diferentes para o mesmo padrão sem justificação, regista drift.

### Passo 3 - Alinhar header e navegação

1. Objetivo funcional do passo no contexto da app.

Confirmar logo, links, estados autenticado/visitante, foco e hover contra o mockup e MF7.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/ALINHAMENTO-VISUAL-PARTE-I.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 3 em `docs/evidence/MF8/ALINHAMENTO-VISUAL-PARTE-I.md`.

3. Instruções do que fazer.

Revê `frontend/src/components/layout/` e rotas visíveis. Regista diferenças por estado de sessão sem alterar permissões.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando navegação pública e autenticada têm resultado e negativo.

7. Cenário negativo/erro esperado.

Se um link protegido aparecer para visitante sem bloqueio visual claro, marca `FAIL`.

### Passo 4 - Alinhar hero e home

1. Objetivo funcional do passo no contexto da app.

Validar primeiro viewport, hierarquia de títulos, CTA, estados de carregamento e continuidade visual da home.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/ALINHAMENTO-VISUAL-PARTE-I.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 4 em `docs/evidence/MF8/ALINHAMENTO-VISUAL-PARTE-I.md`.

3. Instruções do que fazer.

Revê a página inicial e componentes usados no hero. A decisão deve separar estética, acessibilidade e conteúdo.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando hero/home têm screenshot e decisão final.

7. Cenário negativo/erro esperado.

Se o hero parecer alinhado mas esconder foco, contraste ou navegação por teclado, marca ressalva.

### Passo 5 - Registar evidence antes/depois

1. Objetivo funcional do passo no contexto da app.

Guardar provas visuais e notas curtas que permitam ao orientador confirmar a evolução.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/ALINHAMENTO-VISUAL-PARTE-I.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 5 em `docs/evidence/MF8/ALINHAMENTO-VISUAL-PARTE-I.md`.

3. Instruções do que fazer.

Preenche a secção antes/depois da evidence com data, viewport, rota e observação.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando cada prova indica rota, viewport e resultado.

7. Cenário negativo/erro esperado.

Screenshot sem rota ou viewport não conta como proof completo.

### Passo 6 - Validar critérios mensuráveis

1. Objetivo funcional do passo no contexto da app.

Transformar observações visuais em critérios verificáveis e repetíveis.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/ALINHAMENTO-VISUAL-PARTE-I.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 6 em `docs/evidence/MF8/ALINHAMENTO-VISUAL-PARTE-I.md`.

3. Instruções do que fazer.

Liga cada critério a RNF do header e a uma prova. Usa `PASS`, `PASS_COM_RESSALVAS` ou `FAIL`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando todos os RNF têm pelo menos uma linha de verificação.

7. Cenário negativo/erro esperado.

Critério descrito como opinião sem medida deve ser reescrito.

### Passo 7 - Preparar handoff para parte II

1. Objetivo funcional do passo no contexto da app.

Entregar a `BK-MF8-02` uma lista curta do que ficou fechado e do que ainda falta validar.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/ALINHAMENTO-VISUAL-PARTE-I.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 7 em `docs/evidence/MF8/ALINHAMENTO-VISUAL-PARTE-I.md`.

3. Instruções do que fazer.

Escreve handoff com decisões, riscos e páginas que continuam na parte II.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando o handoff permite continuar sem explicação oral.

7. Cenário negativo/erro esperado.

Se o handoff disser apenas “continuar alinhamento”, falta detalhe técnico.

#### Critérios de aceite

- O artefacto `docs/evidence/MF8/ALINHAMENTO-VISUAL-PARTE-I.md` existe e referencia `BK-MF8-01`.
- Todos os 7 passos têm prova, decisão e negativo associado.
- Cada decisão usa `PASS`, `PASS_COM_RESSALVAS`, `FAIL` ou `NAO_APLICAVEL` com justificação.
- Os campos `pr`, `proof`, `neg` e `fonte` estão preenchidos ou justificados.
- Erros comuns a evitar: prova sem comando, screenshot sem contexto, decisão sem fonte e handoff sem owner.

#### Validação final

- `bash scripts/validate-planificacao.sh` executado na raiz do repositório.
- `git diff --check` sem linhas reportadas.
- Evidence principal preenchida com `pr`, `proof`, `neg`, decisão final e handoff.
- Nenhum caminho privado ou nota interna aparece no guia nem no artefacto de aluno.

Resultado esperado: a validação documental fica em `PASS`; se existir falha técnica fora deste BK, ela fica registada com estado, impacto e próximo passo.

#### Evidence para PR/defesa

| Campo | Conteúdo esperado |
| --- | --- |
| `pr` | Link ou identificador da alteração, ou nota `NAO_APLICAVEL` quando for só evidence documental. |
| `proof` | Comando, screenshot, checklist preenchida ou output seguro que prova o fluxo principal. |
| `neg` | Cenário negativo com expected result e resultado observado. |
| `fonte` | RF/RNF, BK anterior, documento canónico ou evidence que justifica a decisão. |

#### Handoff

- Entrega principal: `docs/evidence/MF8/ALINHAMENTO-VISUAL-PARTE-I.md`.
- Próximo BK: `BK-MF8-02`.
- O handoff deve indicar decisões fechadas, ressalvas, riscos, blockers e owner da próxima ação.
- Se houver `FAIL`, o próximo BK só pode avançar com decisão explícita do orientador ou com correção registada.

##### Adendo de baseline visual mensurável

Ao rever tokens, header, navegação e home, a evidence deve medir e não apenas
descrever:

- contraste WCAG AA, foco visível e redução de movimento;
- targets interativos mínimos `44x44 px`;
- header móvel fechado até `72 px`, menu com `Escape` e foco devolvido;
- ausência de overflow nos quatro viewports do gate e reflow equivalente a
  `200%`;
- budgets de `90 kB` gzip para JavaScript inicial, `25 kB` gzip para CSS e
  `30 kB` para o logo, mantendo adapters HLS/DASH lazy.

Os resultados da referência docente ficam na evidence MF8 e não alteram
automaticamente o estado deste BK dos alunos.

#### Changelog

- `2026-06-27`: guia corrigido para a MF8 final de 10 BKs, com estrutura obrigatória, conceitos específicos, passos sem código declarados e critérios de evidence mais concretos.
- `2026-07-10`: alinhamento visual passou a ter limiares de acessibilidade,
  header, reflow e performance verificáveis.
