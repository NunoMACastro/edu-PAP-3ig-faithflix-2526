# Plano de Execução - MF0 FaithFlix

Snapshot do backlog: `2026-05-25` (`faithflix/docs/planificacao/backlogs/BACKLOG-MVP.md`).

## 1) Contexto principal

A `MF0` da FaithFlix não é uma fase de implementação funcional.

É uma fase de **kickoff e governance**.
Serve para fechar plano, responsabilidades, backlog, DoD/evidence, calendário e alinhamento inicial.

Não devem ser criados nesta fase:

- backend;
- frontend;
- base de dados;
- autenticação;
- catálogo;
- streaming;
- endpoints;
- componentes;
- funcionalidades reais da aplicação.

A fundação técnica começa apenas na `MF1`.

---

## 2) BKs da MF0

Owner principal da MF0: `Nuno`

Equipa em validação/apoio: `Matheus`, `Mateus`, `Davi`, `Kaue`

| BK | Título | Owner | Apoio | Dependências |
| --- | --- | --- | --- | --- |
| `BK-MF0-01` | Publicar plano total | Nuno | - | - |
| `BK-MF0-02` | Publicar distribuição de responsabilidades | Nuno | - | `BK-MF0-01` |
| `BK-MF0-03` | Publicar backlog atómico inicial | Nuno | Matheus, Mateus, Davi, Kaue | `BK-MF0-01` |
| `BK-MF0-04` | Definir DoD e formato de evidência | Nuno | Matheus, Mateus, Davi, Kaue | `BK-MF0-03` |
| `BK-MF0-05` | Definir calendário de sprints | Nuno | - | `BK-MF0-03` |
| `BK-MF0-06` | Reunião de alinhamento inicial | Nuno | Matheus, Mateus, Davi, Kaue | `BK-MF0-02`, `BK-MF0-05` |

---

## 3) Regra principal obrigatória

Antes de qualquer trabalho:

1. Ler o BK completo.
2. Perceber exatamente o que entra e o que não entra no BK.
3. Confirmar a dependência do BK anterior.
4. Conseguir explicar o objetivo do BK em 2-3 frases.
5. Só depois do meu OK é que o BK pode ser fechado ou marcado como validado.

---

## 4) Ordem de execução

1. Ler `faithflix/docs/planificacao/README.md`.
2. Confirmar que a `MF0` é governance/kickoff.
3. Abrir `faithflix/docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`.
4. Ler a nota anti-drift da `MF0`.
5. Abrir `faithflix/docs/planificacao/backlogs/MF-VIEWS.md`.
6. Confirmar a sequência `BK-MF0-01..06`.
7. Abrir `faithflix/docs/planificacao/backlogs/BACKLOG-MVP.md`.
8. Confirmar:
   - estado;
   - dependências;
   - owner;
   - apoio;
   - prioridade;
   - esforço.
9. Ler o guia específico do BK em `faithflix/docs/planificacao/guias-bk/MF0/`.
10. Validar evidence mínima: `pr`, `proof`, `neg`.
11. Correr validação documental antes de fechar:

```bash
bash scripts/validate-planificacao.sh
```

---

## 5) SSOT mínimo da MF0

Ler apenas as partes relevantes:

- `faithflix/docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
  - macro fases;
  - nota anti-drift sobre `MF0`;
  - regras transversais;
  - gates.

- `faithflix/docs/planificacao/backlogs/BACKLOG-MVP.md`
  - `## MF0 - Kickoff e governance`.

- `faithflix/docs/planificacao/backlogs/MF-VIEWS.md`
  - `## MF0 - Kickoff e governance`.

- `faithflix/docs/planificacao/sprints/PLANO-SPRINTS.md`
  - Sprint 1;
  - limite de carga `<= 11`;
  - gates `S4/S8/S12`.

- `faithflix/docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
  - equipa;
  - matriz por área funcional;
  - cerimónias;
  - handoff P0;
  - pairing semanal.

- Guias específicos:
  - `BK-MF0-01-publicar-plano-total.md`;
  - `BK-MF0-02-publicar-distribuicao-responsabilidades.md`;
  - `BK-MF0-03-publicar-backlog-atomico-inicial.md`;
  - `BK-MF0-04-definir-dod-e-formato-evidencia.md`;
  - `BK-MF0-05-definir-calendario-sprints.md`;
  - `BK-MF0-06-reuniao-alinhamento-inicial.md`.

---

## 6) Evidência obrigatória

Cada BK só pode ficar `DONE` com:

- `pr`: referência do PR/commit;
- `proof`: prova da validação;
- `neg`: negativos documentais testados;
- `files`: ficheiros revistos/editados;
- `commands`: pelo menos `bash scripts/validate-planificacao.sh`;
- `notes`: notas relevantes, sem dados sensíveis.

Para a `MF0`, screenshots normalmente não se aplicam porque é BK documental sem UI.

---

## 7) Validação obrigatória da MF0

Confirmar:

- `MF0` aparece como kickoff/governance.
- Existem 6 BKs na MF0.
- Os 55 BKs ativos do MVP continuam coerentes.
- Nenhum BK da MF0 cria código de app.
- Nenhuma dependência aponta para BK inexistente.
- Não há alteração silenciosa de owner, prioridade, esforço ou RF/RNF.
- `BK-MF1-01` e `BK-MF1-02` só arrancam depois de `BK-MF0-06`.

Negativos mínimos:

- procurar drift entre plano, backlog, matriz e MF views;
- confirmar que não foram inventadas funcionalidades na MF0;
- confirmar que não há segredos, credenciais ou dados reais em evidence/ata;
- confirmar que nenhum BK é marcado como `DONE` só por estar planeado.

---

## 8) Handoff para MF1

A `MF0` termina quando:

- todos os BKs `BK-MF0-01..06` estão fechados;
- a equipa percebe plano, responsabilidades, DoD e calendário;
- blockers têm owner e prazo;
- `BK-MF1-01` e `BK-MF1-02` estão desbloqueados.

Primeiros BKs técnicos depois da MF0:

- `BK-MF1-01` - Estrutura base backend por módulos
  - Owner: `Matheus`
  - Apoio: `Davi`

- `BK-MF1-02` - Estrutura base frontend por componentes
  - Owner: `Mateus`
  - Apoio: `Kaue`

---

## 9) Se bloquearem mais de 45 minutos

Mandar-me:

1. 2-3 frases sobre o problema.
2. path + heading do documento que gerou dúvida.
3. o que já tentaram validar.
4. erro/log relevante, se existir, sem dados sensíveis.
