#!/usr/bin/env python3
"""Prove that each FaithFlix planning drift class fails in isolation.

Every negative case copies ``docs/`` and the validator shell wrapper to a new
temporary directory, changes exactly one documented contract and runs the real
validator against that copy.  The repository working tree is therefore never
mutated by this test and no application, browser, network service, seed,
migration or database is used.
"""

from __future__ import annotations

import json
import re
import shutil
import subprocess
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Callable


ROOT = Path(__file__).resolve().parent.parent
VALIDATOR = ROOT / "scripts/validate_planificacao_canonica.py"


@dataclass(frozen=True)
class NegativeCase:
    """One isolated mutation and the validator field that must reject it."""

    name: str
    mutate: Callable[[Path], None]
    expected_field: str


def replace_once(root: Path, relative_path: str, old: str, new: str) -> None:
    """Replace one exact occurrence, failing if the fixture shape drifted."""

    path = root / relative_path
    text = path.read_text(encoding="utf-8")
    occurrences = text.count(old)
    if occurrences != 1:
        raise AssertionError(f"{relative_path}: expected one occurrence of {old!r}, found {occurrences}")
    path.write_text(text.replace(old, new, 1), encoding="utf-8")


def append_line(root: Path, relative_path: str, line: str) -> None:
    """Append one controlled line to a file inside the temporary copy."""

    path = root / relative_path
    text = path.read_text(encoding="utf-8")
    path.write_text(f"{text.rstrip()}\n\n{line}\n", encoding="utf-8")


def split_raw_table_row(line: str) -> list[str]:
    """Split a Markdown row while preserving code spans and raw formatting."""

    source = line.strip()
    if source.startswith("|"):
        source = source[1:]
    if source.endswith("|"):
        source = source[:-1]
    cells: list[str] = []
    current: list[str] = []
    inside_code = False
    for character in source:
        if character == "`":
            inside_code = not inside_code
            current.append(character)
        elif character == "|" and not inside_code:
            cells.append("".join(current).strip())
            current = []
        else:
            current.append(character)
    cells.append("".join(current).strip())
    return cells


def plain_cell(value: str) -> str:
    """Return a raw table cell without one code-span wrapper."""

    normalized = value.strip()
    if normalized.startswith("`") and normalized.endswith("`"):
        return normalized[1:-1]
    return normalized


def transform_table_cell(
    root: Path,
    relative_path: str,
    first_cell: str,
    column_name: str,
    transform: Callable[[str], str],
) -> None:
    """Transform one named cell in one uniquely identified table row."""

    path = root / relative_path
    lines = path.read_text(encoding="utf-8").splitlines()
    header: list[str] | None = None
    column_index: int | None = None
    matches = 0

    for index, line in enumerate(lines):
        if not line.lstrip().startswith("|"):
            continue
        cells = split_raw_table_row(line)
        plain = [plain_cell(cell).lower() for cell in cells]
        if column_name.lower() in plain:
            header = plain
            column_index = plain.index(column_name.lower())
            continue
        if header is None or column_index is None or not cells:
            continue
        if plain_cell(cells[0]) != first_cell:
            continue
        cells[column_index] = transform(cells[column_index])
        lines[index] = "| " + " | ".join(cells) + " |"
        matches += 1

    if matches != 1:
        raise AssertionError(
            f"{relative_path}: expected one row {first_cell!r}/{column_name!r}, found {matches}",
        )
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def mutate_state(root: Path) -> None:
    """Create guide/backlog state drift."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF9/BK-MF9-01-planos-pro-familia-entitlements.md",
        "- `estado`: `TODO`",
        "- `estado`: `DONE`",
    )


def mutate_sprint(root: Path) -> None:
    """Create guide/sprint-plan allocation drift."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF9/BK-MF9-01-planos-pro-familia-entitlements.md",
        "- `sprint`: `S13`",
        "- `sprint`: `S12`",
    )


def mutate_next_bk(root: Path) -> None:
    """Break the next-BK chain derived from the sprint plan."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF9/BK-MF9-01-planos-pro-familia-entitlements.md",
        "- `proximo_bk`: `BK-MF9-02`",
        "- `proximo_bk`: `BK-MF9-03`",
    )


def mutate_matrix(root: Path) -> None:
    """Create matrix owner drift for an otherwise valid BK mapping."""

    replace_once(
        root,
        "docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md",
        "| `RF01` | `BK-MF2-01` | `MF2` | Matheus | `P0` |",
        "| `RF01` | `BK-MF2-01` | `MF2` | Davi | `P0` |",
    )


def mutate_mf_view(root: Path) -> None:
    """Break one MF sequence while leaving the sprint plan unchanged."""

    replace_once(
        root,
        "docs/planificacao/backlogs/MF-VIEWS.md",
        "1. `BK-MF9-01`",
        "1. `BK-MF9-02`",
    )


def mutate_public_path(root: Path) -> None:
    """Inject a private implementation root into a public student guide."""

    append_line(
        root,
        "docs/planificacao/guias-bk/MF9/BK-MF9-01-planos-pro-familia-entitlements.md",
        "Drift sintético: editar `REAL_DEV/backend/src/server.js`.",
    )


def mutate_public_runbook_path(root: Path) -> None:
    """Inject a historical private alias into a public MF runbook."""

    append_line(
        root,
        "docs/planificacao/guias-bk/MF9/ARRANQUE-LOCAL-MF9.md",
        "Drift sintético: usar `PASTA_PRIVADA_DO_PROFESSOR/backend/`.",
    )


def mutate_placeholder(root: Path) -> None:
    """Inject an unresolved template marker into active evidence."""

    append_line(
        root,
        "docs/evidence/MF8/README.md",
        "Resultado ativo: PREENCHER_COM_OUTPUT_REAL",
    )


def mutate_command(root: Path) -> None:
    """Point the official wrapper at a non-canonical validator command."""

    replace_once(
        root,
        "scripts/validate-planificacao.sh",
        "python3 scripts/validate_planificacao_canonica.py --project faithflix --json",
        "python3 scripts/validate_planificacao_canonica.py --project outro --json",
    )


def mutate_wrapper_extra_command(root: Path) -> None:
    """Insert an additional executable command in the official wrapper."""

    replace_once(
        root,
        "scripts/validate-planificacao.sh",
        "set -euo pipefail\n",
        "set -euo pipefail\nnpm run seed:e2e:mf2\n",
    )


def mutate_annex_namespace(root: Path) -> None:
    """Move an RNF identifier into the RF annex namespace."""

    replace_once(
        root,
        "docs/planificacao/backlogs/ANEXO-RF-PARA-BKS.md",
        "| RF01 | `BK-MF2-01` | 1 |",
        "| RNF01 | `BK-MF2-01` | 1 |",
    )


def mutate_annex_extra_bk(root: Path) -> None:
    """Add an unrelated BK to a requirement annex."""

    replace_once(
        root,
        "docs/planificacao/backlogs/ANEXO-RF-PARA-BKS.md",
        "| RF01 | `BK-MF2-01` | 1 |",
        "| RF01 | `BK-MF2-01`, `BK-MF1-01` | 2 |",
    )


def mutate_core_or_reinforcement(root: Path) -> None:
    """Break the P0-to-Reforco pedagogical lane contract."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF9/BK-MF9-01-planos-pro-familia-entitlements.md",
        "- `core_or_reforco`: `Reforco`",
        "- `core_or_reforco`: `Core`",
    )


def mutate_matrix_boilerplate(root: Path) -> None:
    """Replace one measurable criterion with generic boilerplate."""

    transform_table_cell(
        root,
        "docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md",
        "RF01",
        "criterio_mensuravel",
        lambda _value: "Critério principal ligado ao requisito e ao BK atribuído.",
    )


def mutate_matrix_empty_evidence(root: Path) -> None:
    """Erase one requirement's concrete evidence contract."""

    transform_table_cell(
        root,
        "docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md",
        "RF02",
        "evidence_minima",
        lambda _value: "-",
    )


def mutate_matrix_invalid_status(root: Path) -> None:
    """Introduce an unknown validation status in the matrix."""

    transform_table_cell(
        root,
        "docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md",
        "RF03",
        "status_validacao",
        lambda _value: "PASS",
    )


def mutate_rate_limit(root: Path) -> None:
    """Drift the exact search rate limit by one request."""

    transform_table_cell(
        root,
        "docs/RNF.md",
        "Pesquisa",
        "limite e janela",
        lambda _value: "121 / minuto",
    )


def mutate_sessions_schema(root: Path) -> None:
    """Remove the bounded CSRF rotation history from architecture."""

    replace_once(root, "ARCHITECTURE.md", "csrfTokenHashes", "legacyCsrfHashes")


def mutate_rate_counter_schema(root: Path) -> None:
    """Remove the pseudonymized rate-limit key field."""

    transform_table_cell(
        root,
        "ARCHITECTURE.md",
        "rate_limit_counters",
        "campos/invariantes relevantes",
        lambda value: value.replace("keyHash", "rawKey"),
    )


def mutate_scheduled_jobs_schema(root: Path) -> None:
    """Remove lease ownership from the scheduled-jobs contract."""

    replace_once(root, "ARCHITECTURE.md", "leaseOwner", "workerName")


def mutate_payment_attempts_schema(root: Path) -> None:
    """Remove the amount-in-cents field from the financial v2 schema."""

    transform_table_cell(
        root,
        "ARCHITECTURE.md",
        "`payment_attempts` v2",
        "campos/invariantes relevantes",
        lambda value: value.replace("amountCents", "amountUnits"),
    )


def mutate_contents_schema(root: Path) -> None:
    """Remove mediaStatus from the canonical content schema."""

    transform_table_cell(
        root,
        "ARCHITECTURE.md",
        "contents",
        "campos/invariantes relevantes",
        lambda value: value.replace("mediaStatus", "availability"),
    )


def mutate_route_lifecycle(root: Path) -> None:
    """Remove ErrorBoundary from the durable RNF lifecycle contract."""

    replace_once(root, "docs/RNF.md", "`ErrorBoundary`", "`RenderFallback`")


def mutate_auth_email_boundary(root: Path) -> None:
    """Teach a 255-character email upper bound in the auth validator."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF2/BK-MF2-01-registo-login-recuperacao-password.md",
        "value.length > 254",
        "value.length > 255",
    )


def mutate_metadata_status(root: Path) -> None:
    """Use an unsupported publication status in active evidence."""

    replace_once(
        root,
        "docs/evidence/MF9/MATRIZ-BROWSERS-MANUAL.md",
        "- `document_status`: `CURRENT`",
        "- `document_status`: `FINAL`",
    )


def mutate_metadata_lane(root: Path) -> None:
    """Misclassify reference evidence as a student delivery."""

    replace_once(
        root,
        "docs/evidence/MF8/TESTES-FINAIS-CRIADOS.md",
        "- `implementation_lane`: `REFERENCE`",
        "- `implementation_lane`: `STUDENT`",
    )


def mutate_student_evidence_private_path(root: Path) -> None:
    """Misclassify evidence containing private-reference paths as STUDENT."""

    replace_once(
        root,
        "docs/evidence/MF3/RECOMENDACOES-ROBUSTEZ-IA.md",
        "- `implementation_lane`: `REFERENCE`",
        "- `implementation_lane`: `STUDENT`",
    )


def mutate_metadata_snapshot_date(root: Path) -> None:
    """Remove the date required by a historical snapshot."""

    replace_once(
        root,
        "docs/evidence/MF7/browser/README.md",
        "- `snapshot_date`: `2026-06-25`",
        "- `snapshot_date`: `-`",
    )


def mutate_metadata_authority(root: Path) -> None:
    """Point current evidence at an authority that does not exist."""

    replace_once(
        root,
        "docs/evidence/MF9/MATRIZ-BROWSERS-MANUAL.md",
        "- `current_authority`: `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-END-TO-END-real_dev.md`",
        "- `current_authority`: `docs/autoridade-inexistente.md`",
    )


def mutate_metadata_proof_scope(root: Path) -> None:
    """Replace a concrete proof scope with an unusably vague label."""

    path = root / "docs/evidence/MF9/MATRIZ-BROWSERS-MANUAL.md"
    lines = path.read_text(encoding="utf-8").splitlines()
    matches = 0
    for index, line in enumerate(lines):
        if line.startswith("- `proof_scope`:"):
            lines[index] = "- `proof_scope`: curto"
            matches += 1
    if matches != 1:
        raise AssertionError(f"expected one proof_scope, found {matches}")
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def mutate_archive_metadata(root: Path) -> None:
    """Remove D0 status from one superseded archive template."""

    replace_once(
        root,
        "docs/evidence/archive/templates-mf6-legacy/BK-MF6-01-regressao-backend.md",
        "- `document_status`: `SUPERSEDED`\n",
        "",
    )


def mutate_hybrid_snapshot_boundary(root: Path) -> None:
    """Demote one hybrid snapshot boundary to an ambiguous generic heading."""

    path = root / "docs/evidence/MF6/BK-MF6-03-hardening-seguranca.md"
    text = path.read_text(encoding="utf-8")
    match = re.search(r"^## Snapshot histórico[^\n]*$", text, re.MULTILINE)
    if match is None:
        raise AssertionError("expected one MF6 hybrid snapshot boundary")
    path.write_text(text[: match.start()] + "## Histórico" + text[match.end() :], encoding="utf-8")


def mutate_current_hybrid_snapshot_boundary(root: Path) -> None:
    """Remove the only explicit snapshot boundary from one CURRENT hybrid."""

    replace_once(
        root,
        "docs/evidence/MF9/GATE-S13-MF9.md",
        "## Matriz RF/RNF - snapshot histórico de 2026-07-04",
        "## Matriz RF/RNF de 2026-07-04",
    )


def mutate_reference_comparison_lane(root: Path) -> None:
    """Hide the REFERENCE lane used by a STUDENT hydration comparison."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF5.md",
        "- `comparison_lane`: `REFERENCE`",
        "- `comparison_lane`: `STUDENT`",
    )


def mutate_reference_comparison_policy(root: Path) -> None:
    """Remove the canonical comparison-lane key from planning policy."""

    replace_once(
        root,
        "docs/planificacao/README.md",
        "`comparison_lane: REFERENCE`",
        "`implementation_root_lane: REFERENCE`",
    )


def mutate_e2e_normal_environment(root: Path) -> None:
    """Point the current MF2 seed procedure at normal Mongo env names."""

    transform_table_cell(
        root,
        "docs/evidence/MF8/TESTES-FINAIS-CRIADOS.md",
        "TST-MF8-E2E-MF2-SEED",
        "comando",
        lambda value: value.replace("TEST_MONGODB_URI", "MONGODB_URI").replace(
            "TEST_MONGODB_DB_NAME",
            "MONGODB_DB_NAME",
        ),
    )


def mutate_e2e_without_replica_set(root: Path) -> None:
    """Remove replica-set selection from one current browser command."""

    replace_once(
        root,
        "docs/evidence/MF8/TESTES-FINAIS-CRIADOS.md",
        "TEST_MONGODB_URI='mongodb://127.0.0.1:27017/?replicaSet=rs0' "
        "TEST_MONGODB_DB_NAME=faithflix_mf2_20260710t120000_e2e npm run e2e:mf2",
        "TEST_MONGODB_URI='mongodb://127.0.0.1:27017/' "
        "TEST_MONGODB_DB_NAME=faithflix_mf2_20260710t120000_e2e npm run e2e:mf2",
    )


def mutate_e2e_database_suffix(root: Path) -> None:
    """Use a test DB name that no longer ends in the mandatory suffix."""

    transform_table_cell(
        root,
        "docs/evidence/MF8/TESTES-FINAIS-CRIADOS.md",
        "TST-MF8-E2E-MF4-SEED",
        "comando",
        lambda value: value.replace(
            "faithflix_mf4_20260710t120000_e2e",
            "faithflix_mf4_20260710t120000_tests",
        ),
    )


def mutate_e2e_generic_reused_database(root: Path) -> None:
    """Use a generic reusable DB name that lacks a per-run timestamp."""

    transform_table_cell(
        root,
        "docs/evidence/MF8/TESTES-FINAIS-CRIADOS.md",
        "TST-MF8-E2E-MF2-SEED",
        "comando",
        lambda value: value.replace(
            "faithflix_mf2_20260710t120000_e2e",
            "faithflix_mf2_e2e",
        ),
    )


def mutate_e2e_external_host(root: Path) -> None:
    """Move one current seed command from loopback to an external host."""

    transform_table_cell(
        root,
        "docs/evidence/MF8/TESTES-FINAIS-CRIADOS.md",
        "TST-MF8-E2E-MF2-SEED",
        "comando",
        lambda value: value.replace("127.0.0.1", "mongo.example.test"),
    )


def mutate_e2e_uri_credentials(root: Path) -> None:
    """Add synthetic credentials to one otherwise isolated test URI."""

    transform_table_cell(
        root,
        "docs/evidence/MF8/TESTES-FINAIS-CRIADOS.md",
        "TST-MF8-E2E-MF4-SEED",
        "comando",
        lambda value: value.replace("mongodb://127.0.0.1", "mongodb://test-user:test-password@127.0.0.1"),
    )


def mutate_e2e_seed_browser_database_mismatch(root: Path) -> None:
    """Keep an isolated suffix but make browser and seed use different databases."""

    replace_once(
        root,
        "docs/evidence/MF8/TESTES-FINAIS-CRIADOS.md",
        "NODE_ENV=test TEST_MONGODB_URI='mongodb://127.0.0.1:27017/?replicaSet=rs0' "
        "TEST_MONGODB_DB_NAME=faithflix_mf2_20260710t120000_e2e npm run e2e:mf2",
        "NODE_ENV=test TEST_MONGODB_URI='mongodb://127.0.0.1:27017/?replicaSet=rs0' "
        "TEST_MONGODB_DB_NAME=faithflix_mf2_20260710t120000_browser_e2e npm run e2e:mf2",
    )


def mutate_e2e_seed_browser_uri_mismatch(root: Path) -> None:
    """Keep loopback safety but make browser and seed use different MongoDB URIs."""

    replace_once(
        root,
        "docs/evidence/MF8/TESTES-FINAIS-CRIADOS.md",
        "NODE_ENV=test TEST_MONGODB_URI='mongodb://127.0.0.1:27017/?replicaSet=rs0' "
        "TEST_MONGODB_DB_NAME=faithflix_mf4_20260710t120000_e2e npm run e2e:mf4",
        "NODE_ENV=test TEST_MONGODB_URI='mongodb://127.0.0.1:27018/?replicaSet=rs0' "
        "TEST_MONGODB_DB_NAME=faithflix_mf4_20260710t120000_e2e npm run e2e:mf4",
    )


def mutate_e2e_reused_database_policy(root: Path) -> None:
    """Remove the fresh-database-per-run rule from the current procedure."""

    replace_once(
        root,
        "docs/evidence/MF8/TESTES-FINAIS-CRIADOS.md",
        "cada execução formal usa uma DB `_e2e` nova e exclusiva",
        "cada execução formal reutiliza a mesma DB `_e2e`",
    )


def mutate_mf9_current_e2e_database(root: Path) -> None:
    """Make the current MF9 seed use a generic reusable database."""

    replace_once(
        root,
        "docs/evidence/MF9/REGRESSAO-MF9.md",
        "TEST_MONGODB_DB_NAME=faithflix_mf9_20260710t120000_e2e \\\n+npm run seed:e2e:mf9".replace("\n+", "\n"),
        "TEST_MONGODB_DB_NAME=faithflix_mf9_e2e \\\n+npm run seed:e2e:mf9".replace("\n+", "\n"),
    )


def mutate_bare_playwright(root: Path) -> None:
    """Add an obsolete direct Playwright command to an active guide."""

    append_line(
        root,
        "docs/planificacao/guias-bk/MF9/BK-MF9-06-gate-mf9-regressao-evidencia-final.md",
        "Comando sintético inseguro: `npx playwright test --list`.",
    )


def mutate_runbook_manifest_command(root: Path) -> None:
    """Document a student command whose npm script does not exist."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF9/ARRANQUE-LOCAL-MF9.md",
        "npm --prefix backend run smoke",
        "npm --prefix backend run smoke:inexistente",
    )


def mutate_tutorial_structure(root: Path) -> None:
    """Demote one canonical tutorial-v2 heading to the wrong level."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF9/BK-MF9-01-planos-pro-familia-entitlements.md",
        "#### Objetivo",
        "### Objetivo",
    )


def mutate_tutorial_extra_section(root: Path) -> None:
    """Add a seventeenth level-four section outside tutorial-v2."""

    append_line(
        root,
        "docs/planificacao/guias-bk/MF9/BK-MF9-04-ui-gestao-familiar-convites.md",
        "#### Adendo sintético indevido",
    )


def mutate_tutorial_step_point(root: Path) -> None:
    """Remove point 7 from the first tutorial step."""

    path = root / "docs/planificacao/guias-bk/MF9/BK-MF9-04-ui-gestao-familiar-convites.md"
    lines = path.read_text(encoding="utf-8").splitlines()
    inside_first_step = False
    matches = 0
    for index, line in enumerate(lines):
        if line.startswith("### Passo 1 "):
            inside_first_step = True
            continue
        if inside_first_step and line.startswith("### Passo "):
            break
        if inside_first_step and line.startswith("7. "):
            lines[index] = "8. " + line[3:]
            matches += 1
    if matches != 1:
        raise AssertionError(f"expected one point 7 in first step, found {matches}")
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def mutate_tutorial_extra_step_point(root: Path) -> None:
    """Append an eighth top-level point while preserving the required 1..7."""

    path = root / "docs/planificacao/guias-bk/MF9/BK-MF9-04-ui-gestao-familiar-convites.md"
    lines = path.read_text(encoding="utf-8").splitlines()
    inside_first_step = False
    matches = 0
    for index, line in enumerate(lines):
        if line.startswith("### Passo 1 "):
            inside_first_step = True
            continue
        if inside_first_step and line.startswith("### Passo "):
            break
        if inside_first_step and line.startswith("7. "):
            lines.insert(index + 1, "8. Ponto top-level indevido.")
            matches += 1
            break
    if matches != 1:
        raise AssertionError("expected one point 7 in first step")
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def mutate_codeless_marker(root: Path) -> None:
    """Remove the mandatory accent from one code-less step marker."""

    path = root / "docs/planificacao/guias-bk/MF9/BK-MF9-06-gate-mf9-regressao-evidencia-final.md"
    lines = path.read_text(encoding="utf-8").splitlines()
    matches = 0
    for index, line in enumerate(lines):
        if line.strip() == "Sem código neste passo.":
            lines[index] = "Sem codigo neste passo."
            matches += 1
            break
    if matches != 1:
        raise AssertionError("expected at least one autonomous code-less marker")
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def mutate_embedded_evidence_metadata(root: Path) -> None:
    """Remove one mandatory D0 field from a tutorial evidence template."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF7/BK-MF7-03-layout-tokens-header-alinhados-mockup.md",
        "- `proof_scope`: comparação visual observada pelos alunos; não prova todos os browsers, viewports ou produção\n",
        "",
    )


def mutate_didactic_comment_budget(root: Path) -> None:
    """Append a substantial code block with no didactic comment."""

    append_line(
        root,
        "docs/planificacao/guias-bk/MF9/BK-MF9-04-ui-gestao-familiar-convites.md",
        """```js
const first = 1;
const second = 2;
const third = 3;
const fourth = 4;
const fifth = 5;
const sixth = 6;
const seventh = 7;
const eighth = 8;
```""",
    )


def mutate_mf_views_baseline(root: Path) -> None:
    """Publish a stale sprint total in the active MF view."""

    replace_once(
        root,
        "docs/planificacao/backlogs/MF-VIEWS.md",
        "- Baseline ativa: `66 BK`, `66 guias`, `94 requisitos` e `13 sprints`.",
        "- Baseline ativa: `66 BK`, `66 guias`, `94 requisitos` e `12 sprints`.",
    )


def mutate_api_client_fallback(root: Path) -> None:
    """Reintroduce the unsafe localhost API fallback."""

    append_line(
        root,
        "docs/planificacao/guias-bk/MF1/BK-MF1-03-cliente-api-frontend-tratamento-erro.md",
        'const API_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";',
    )


def mutate_health_legacy(root: Path) -> None:
    """Reintroduce the old always-green health marker."""

    append_line(
        root,
        "docs/planificacao/guias-bk/MF1/BK-MF1-05-health-check-e-logging-estruturado.md",
        'const legacyHealth = { database: "not_configured" };',
    )


def mutate_session_unavailable(root: Path) -> None:
    """Turn an operational failure back into a false anonymous session."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF7/BK-MF7-02-navegacao-segura-por-sessao-e-perfil.md",
        'setStatus("unavailable");',
        'setStatus("anonymous");',
    )


def mutate_session_missing_user_coercion(root: Path) -> None:
    """Treat a missing `user` field as an explicitly anonymous response."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF7/BK-MF7-02-navegacao-segura-por-sessao-e-perfil.md",
        "if (response?.user === null) {",
        "if ((response?.user ?? null) === null) {",
    )


def mutate_catalog_public_media(root: Path) -> None:
    """Inject the old public spread/media reconstruction pattern."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF2/BK-MF2-03-crud-catalogo-taxonomias.md",
        "function publicContent(content) {",
        "function publicContent(content) {\n  const legacyPublic = { ...content, media: content.media };",
    )


def mutate_media_metadata_serializer(root: Path) -> None:
    """Remove the closed source-field denylist from metadata validation."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF2/BK-MF2-06-legendas-audio-parental-e-qualidade.md",
        "const SOURCE_FIELDS",
        "const LEGACY_SOURCE_FIELDS",
    )


def mutate_privacy_transaction(root: Path) -> None:
    """Replace the canonical account-deletion transaction with Promise.all."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF5/BK-MF5-02-eliminacao-conta-dados.md",
        "return runInTransaction(async ({ db, session }) => {",
        "return Promise.all([",
    )


def mutate_financial_duplicate(root: Path) -> None:
    """Duplicate checkout implementation in the MF9 guide."""

    append_line(
        root,
        "docs/planificacao/guias-bk/MF9/BK-MF9-01-planos-pro-familia-entitlements.md",
        "export async function createSimulatedCheckout() {}",
    )


def mutate_concurrent_guide_contract(root: Path) -> None:
    """Preserve an obsolete snippet behind a superseding adendum."""

    append_line(
        root,
        "docs/planificacao/guias-bk/MF9/BK-MF9-04-ui-gestao-familiar-convites.md",
        "Este adendo prevalece; o snippet antigo fica como snapshot pedagógico.",
    )


def mutate_auth_session_composition(root: Path) -> None:
    """Reintroduce the undefined cookie helper in the cumulative auth guide."""

    append_line(
        root,
        "docs/planificacao/guias-bk/MF2/BK-MF2-01-registo-login-recuperacao-password.md",
        "const cookieOptions = getSessionCookieOptions();",
    )


def mutate_csrf_retry_code(root: Path) -> None:
    """Remove the stable CSRF code required by the one-shot client retry."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF1/BK-MF1-04-sessao-segura-backend-cookies-auth-base.md",
        'error.code = "CSRF_INVALID";',
        'error.code = "REQUEST_FAILED";',
    )


def mutate_e2e_fixture_helper(root: Path) -> None:
    """Remove the fixture-route definition while leaving its use behind."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF2/BK-MF2-08-teste-e2e-fluxo-principal.md",
        "const fixtureRoutes = new Map",
        "const missingFixtureRoutes = new Map",
    )


def mutate_quality_access_gate(root: Path) -> None:
    """Remove the explicit premium-access gate from playback."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF9/BK-MF9-02-qualidade-streaming-por-plano.md",
        "if (!effectiveAccess.hasPremiumAccess)",
        "if (!effectiveAccess.entitlements)",
    )


def mutate_plan_eligibility_definition(root: Path) -> None:
    """Rename the plan guard definition used before financial writes."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF9/BK-MF9-01-planos-pro-familia-entitlements.md",
        "export function assertPurchasablePlan",
        "export function acceptAnyActivePlan",
    )


def mutate_catalog_quality_canonicalization(root: Path) -> None:
    """Remove the closed quality vocabulary from catalog canonicalization."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF2/BK-MF2-03-crud-catalogo-taxonomias.md",
        "const PLAYABLE_QUALITY_VALUES = new Set",
        "const UNCHECKED_QUALITY_VALUES = new Set",
    )


def mutate_parental_fail_closed(root: Path) -> None:
    """Reintroduce the permissive numeric coercion for age ratings."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF2/BK-MF2-06-legendas-audio-parental-e-qualidade.md",
        "Number.isInteger(contentAge)",
        "Number(contentAge)",
    )


def mutate_automatic_quality_contract(root: Path) -> None:
    """Remove the empty automatic value from backend preference validation."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF2/BK-MF2-06-legendas-audio-parental-e-qualidade.md",
        'MEDIA_QUALITY_VALUES = Object.freeze([\n  "",',
        "MEDIA_QUALITY_VALUES = Object.freeze([",
    )


def mutate_privacy_delete_rate_limit(root: Path) -> None:
    """Remove one mandatory account-deletion rate-limit scope."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF5/BK-MF5-02-eliminacao-conta-dados.md",
        'scope: "privacy:delete:user"',
        'scope: "privacy:delete:disabled"',
    )


def mutate_worker_uri_argv(root: Path) -> None:
    """Put the MongoDB URI back into the mongosh process arguments."""

    replace_once(
        root,
        "docs/runbooks/WORKER-LOCAL.md",
        "mongosh --nodb --quiet --eval",
        'mongosh "$MONGODB_URI/$MONGODB_DB_NAME" --quiet --eval',
    )


def mutate_performance_catalog_v1(root: Path) -> None:
    """Append the obsolete competing catalog parser to the performance guide."""

    append_line(
        root,
        "docs/planificacao/guias-bk/MF6/BK-MF6-04-otimizacao-de-performance-critica.md",
        "export function parseCatalogPagination(input) { return input; }",
    )


def mutate_charities_api_duplicate(root: Path) -> None:
    """Turn the additive API extension back into a duplicate export."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF4/BK-MF4-05-distribuicao-mensal-rotacao.md",
        "Object.assign(charitiesApi, {",
        "export const charitiesApi = {",
    )


def mutate_catalog_detail_import(root: Path) -> None:
    """Remove the explicit HttpError import from the detail tutorial."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF2/BK-MF2-04-pagina-detalhe-conteudo.md",
        'import { HttpError } from "../../utils/http-error.js";\n',
        "",
    )


def mutate_lazy_route_composition(root: Path) -> None:
    """Reintroduce an eager page import in the cumulative routing tutorial."""

    append_line(
        root,
        "docs/planificacao/guias-bk/MF7/BK-MF7-02-navegacao-segura-por-sessao-e-perfil.md",
        'import AdminCatalogPage from "../pages/AdminCatalogPage.jsx";',
    )


def mutate_family_foundation(root: Path) -> None:
    """Remove one helper definition required by the cumulative family API."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF9/BK-MF9-03-modelo-api-partilha-familiar.md",
        "async function countOpenFamilyMemberships",
        "async function countUncheckedFamilyMemberships",
    )


def mutate_contextual_fragment_classification(root: Path) -> None:
    """Present a conceptual response schema as executable JavaScript again."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF3/BK-MF3-05-recomendacao-baseline-cold-start.md",
        "```text\n// O contrato declara os sinais usados sem expor histórico ou dados pessoais brutos.",
        "```js\n// O contrato declara os sinais usados sem expor histórico ou dados pessoais brutos.",
    )


def mutate_catalog_api_cumulative_contract(root: Path) -> None:
    """Remove the marker that preserves public catalog pagination and cancellation."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF2/BK-MF2-04-pagina-detalhe-conteudo.md",
        "Preserva filtros, paginação e AbortSignal",
        "Ignora filtros, paginação e AbortSignal",
    )


def mutate_playback_api_cumulative_contract(root: Path) -> None:
    """Remove the pagination helper inherited by the playback API."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF2/BK-MF2-06-legendas-audio-parental-e-qualidade.md",
        "function continueWatchingQuery",
        "function uncheckedContinueWatchingQuery",
    )


def mutate_e2e_host_guard_order(root: Path) -> None:
    """Remove the loopback guard that must run before fixture lookup."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF2/BK-MF2-08-teste-e2e-fluxo-principal.md",
        "if (!LOOPBACK_HOSTS.has(requestUrl.hostname))",
        "if (false && !LOOPBACK_HOSTS.has(requestUrl.hostname))",
    )


def mutate_worker_database_selection(root: Path) -> None:
    """Concatenate the database name after the URI querystring again."""

    replace_once(
        root,
        "docs/runbooks/WORKER-LOCAL.md",
        "const inspectedDb = connectionDb.getSiblingDB(dbName);",
        "const inspectedDb = connect(`${uri}/${dbName}`);",
    )


def mutate_performance_status_summary(root: Path) -> None:
    """Remove the real HTTP status aggregation from the concurrency meter."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF6/BK-MF6-04-otimizacao-de-performance-critica.md",
        "const concurrentFailureStatus",
        "const ignoredConcurrentFailureStatus",
    )


def mutate_privacy_delete_password_payload(root: Path) -> None:
    """Drop the current password from the cumulative privacy client."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF5/BK-MF5-03-gestao-consentimentos.md",
        "password: input?.password,",
        "password: undefined,",
    )


def mutate_unknown_quality_redaction(root: Path) -> None:
    """Remove the fail-closed label for an unknown playback quality."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF9/BK-MF9-02-qualidade-streaming-por-plano.md",
        '"Qualidade indisponível."',
        '"Qualidade permitida."',
    )


def mutate_admin_catalog_edit_action(root: Path) -> None:
    """Remove the action that loads an administrative row for editing."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF2/BK-MF2-03-crud-catalogo-taxonomias.md",
        "function selectContentForEditing",
        "function ignoreContentForEditing",
    )


def mutate_effective_access_middleware(root: Path) -> None:
    """Reintroduce a truthy check in the effective playback guard."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF9/BK-MF9-02-qualidade-streaming-por-plano.md",
        "effectiveAccess?.hasPremiumAccess !== true",
        "!effectiveAccess?.hasPremiumAccess",
    )


def mutate_playback_preferences_routes(root: Path) -> None:
    """Drop the fixed preferences route when the premium guard is added."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF4/BK-MF4-01-planos-ciclo-subscricao.md",
        'playbackRouter.get("/preferences", asyncHandler(getPlaybackPreferences));',
        '// playbackRouter.get("/preferences") removida por engano.',
    )


def mutate_idempotency_sentinel_guard(root: Path) -> None:
    """Allow the literal `undefined` to become a shared idempotency key again."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF4/BK-MF4-02-metodos-pagamento-simulados-trial.md",
        'forbiddenSentinels = new Set(["undefined", "null"])',
        "forbiddenSentinels = new Set()",
    )


def mutate_origin_csrf_browser_detection(root: Path) -> None:
    """Ignore browser context when Origin is absent from a mutation."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF1/BK-MF1-04-sessao-segura-backend-cookies-auth-base.md",
        'req.get("Sec-Fetch-Site")',
        'req.get("X-Ignored-Fetch-Site")',
    )


def mutate_e2e_seed_guard_definition(root: Path) -> None:
    """Remove the seed-specific environment guard while leaving commands behind."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF2/BK-MF2-08-teste-e2e-fluxo-principal.md",
        "export function assertE2eSeedEnvironment",
        "export function acceptAnySeedEnvironment",
    )


def mutate_reset_delivery_outbox(root: Path) -> None:
    """Remove the dev-only password-reset delivery writer."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF2/BK-MF2-01-registo-login-recuperacao-password.md",
        "async function writeDevResetOutbox",
        "async function discardDevResetOutbox",
    )


def mutate_recommendation_rate_limit_mount(root: Path) -> None:
    """Remove the per-user recommendation limiter definition."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF3/BK-MF3-05-recomendacao-baseline-cold-start.md",
        "const recommendationsByUserLimit = rateLimit({",
        "const recommendationsWithoutLimit = ({",
    )


def mutate_security_hardening_mount(root: Path) -> None:
    """Expose the framework header by dropping the hardening call."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF6/BK-MF6-03-hardening-seguranca-e-privacidade.md",
        'app.disable("x-powered-by")',
        'app.enable("x-powered-by")',
    )


def mutate_route_metadata_coverage(root: Path) -> None:
    """Remove one final functional route from the title registry."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF1/BK-MF1-02-estrutura-base-frontend-componentes.md",
        '    { path: "/admin/integracoes", title: "Integrações" },\n',
        "",
    )


def mutate_final_player_controls(root: Path) -> None:
    """Remove the descriptor-only player controls from the final UX guide."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF6/BK-MF6-05-acessibilidade-e-ux-final.md",
        "export function MediaPreferenceControls",
        "export function UnsafeMediaPreferenceControls",
    )


def mutate_final_recommendations_api(root: Path) -> None:
    """Call the obsolete recommendation client method from the final page."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF7/BK-MF7-04-refinamento-paginas-principais-estados-ux.md",
        "const response = await recommendationsApi.getMine({",
        "const response = await recommendationsApi.mine({",
    )


def mutate_moderator_catalog_scope(root: Path) -> None:
    """Remove moderator access from the only administrative route it may use."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF7/BK-MF7-02-navegacao-segura-por-sessao-e-perfil.md",
        'element={withAdminRoute(<AdminCatalogPage />, ["admin", "moderator"])}',
        'element={withAdminRoute(<AdminCatalogPage />, ["admin"])}',
    )


def mutate_mobile_reduced_motion(root: Path) -> None:
    """Drop the reduced-motion media query from the mobile layout."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF7/BK-MF7-03-layout-tokens-header-alinhados-mockup.md",
        "@media (prefers-reduced-motion: reduce)",
        "@media (prefers-reduced-motion: no-preference)",
    )


def mutate_consents_confirmed_snapshot(root: Path) -> None:
    """Remove the confirmed consent snapshot used for rollback."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF5/BK-MF5-03-gestao-consentimentos.md",
        "const confirmedRef = useRef(EMPTY_CONSENTS);",
        "const unconfirmedState = EMPTY_CONSENTS;",
    )


def mutate_admin_users_reservation(root: Path) -> None:
    """Remove the synchronous per-row reservation from admin users."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF5/BK-MF5-04-gestao-de-utilizadores-admin.md",
        "const reservationsRef = useRef(new Set());",
        "const reservations = new Set();",
    )


def mutate_admin_review_reservation(root: Path) -> None:
    """Remove the per-application reservation from administrative review."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF4/BK-MF4-04-aprovacao-entrada-pool.md",
        "const reservationsRef = useRef(new Set());",
        "const reservations = new Set();",
    )


def mutate_charity_report_submission_guard(root: Path) -> None:
    """Remove the synchronous submission guard from charity membership UI."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF4/BK-MF4-06-relatorios-e-historico-por-associacao.md",
        "const submissionRef = useRef(null);",
        "const currentSubmission = null;",
    )


def mutate_family_member_path_encoding(root: Path) -> None:
    """Interpolate a family member id into the URL without segment encoding."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF9/BK-MF9-04-ui-gestao-familiar-convites.md",
        "encodeURIComponent(memberId)",
        "memberId",
    )


def mutate_worker_job_claim(root: Path) -> None:
    """Remove the lease-based scheduled-job claim from the worker tutorial."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF4/BK-MF4-01-planos-ciclo-subscricao.md",
        "export async function claimScheduledJob",
        "export async function claimJobWithoutLease",
    )


def mutate_monthly_pool_worker(root: Path) -> None:
    """Remove the monthly pool job entry point from the cumulative worker."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF4/BK-MF4-05-distribuicao-mensal-rotacao.md",
        "export async function runMonthlyPoolJob",
        "export async function runPoolOnlyManually",
    )


def mutate_media_preference_reservation(root: Path) -> None:
    """Remove the synchronous preference-operation reservation from the player."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF2/BK-MF2-06-legendas-audio-parental-e-qualidade.md",
        "const preferenceOperationRef = useRef(null);",
        "const preferenceOperation = null;",
    )


def mutate_family_billing_closure(root: Path) -> None:
    """Remove the transactional family closure from the billing extension."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF9/BK-MF9-03-modelo-api-partilha-familiar.md",
        "async function closeOwnedFamily(db, ownerUserId, now, reason, session)",
        "async function leaveOwnedFamilyOpen(db, ownerUserId, now, reason, session)",
    )


def mutate_export_security(root: Path) -> None:
    """Remove recursive projection from the user export tutorial."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF5/BK-MF5-01-exportacao-dados-utilizador.md",
        "function sanitizeExportValue(value, schema)",
        "function returnExportValueWithoutProjection(value, schema)",
    )


def mutate_metrics_admin(root: Path) -> None:
    """Count deletion metrics by creation time instead of request time."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF5/BK-MF5-05-painel-de-metricas-admin.md",
        "requestedAt: { $gte: from, $lte: to },",
        "createdAt: { $gte: from, $lte: to },",
    )


def mutate_integrations_config(root: Path) -> None:
    """Remove the unique constraint that serializes integration upserts."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF5/BK-MF5-06-configuracao-de-integracoes-admin.md",
        '{ unique: true, name: "integration_settings_key_unique" },',
        '{ name: "integration_settings_key_non_unique" },',
    )


def mutate_auth_middleware_path(root: Path) -> None:
    """Reintroduce the obsolete second authority for authentication guards."""

    append_line(
        root,
        "docs/planificacao/guias-bk/MF2/BK-MF2-05-reproducao-continuar-a-ver.md",
        'Drift sintético: importar `../auth/auth.middleware.js`.',
    )


def mutate_session_database(root: Path) -> None:
    """Allow unit tests to fall back to the normal MongoDB configuration."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF1/BK-MF1-04-sessao-segura-backend-cookies-auth-base.md",
        'const mongodbUri = nodeEnv === "test"\n    ? null',
        'const mongodbUri = nodeEnv !== "test"\n    ? null',
    )


def mutate_core_error_envelope(root: Path) -> None:
    """Accept an arbitrary client request id again."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF1/BK-MF1-05-health-check-e-logging-estruturado.md",
        "export const REQUEST_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/;",
        "export const REQUEST_ID_PATTERN = /.+/;",
    )


def mutate_consents_backend(root: Path) -> None:
    """Drop the uniqueness guarantee for the current consent row."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF5/BK-MF5-03-gestao-consentimentos.md",
        '{ unique: true, name: "user_consents_user_id_unique" },',
        '{ name: "user_consents_user_id_non_unique" },',
    )


def mutate_progress_notification(root: Path) -> None:
    """Replace the synchronous notification-preference reservation with state."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF4/BK-MF4-08-notificacoes-transacionais-e-preferencias.md",
        "const preferenceControllerRef = useRef(null);",
        "const preferenceController = null;",
    )


def mutate_family_privacy_operations(root: Path) -> None:
    """Remove reset-token ids from the privacy outbox cleanup."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF9/BK-MF9-05-privacidade-operacao-metricas-familia.md",
        "const resetTokenIds = resetTokenRows.map((row) => row._id);",
        "const resetTokenIds = [];",
    )


def mutate_subscription_access(root: Path) -> None:
    """Remove the exact trial subscription branch from entitlement resolution."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF9/BK-MF9-02-qualidade-streaming-por-plano.md",
        'if (subscription?.status === "trialing") {',
        'if (subscription?.status) {',
    )


def mutate_family_notifications(root: Path) -> None:
    """Remove the canonical Family notification type registry."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF9/BK-MF9-03-modelo-api-partilha-familiar.md",
        "export const NOTIFICATION_TYPES = Object.freeze([",
        "export const LEGACY_NOTIFICATION_TYPES = Object.freeze([",
    )


def mutate_admin_user_contract(root: Path) -> None:
    """Remove the stable tie-breaker from the admin users pagination."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF5/BK-MF5-04-gestao-de-utilizadores-admin.md",
        ".sort({ createdAt: -1, _id: 1 })",
        ".sort({ createdAt: -1 })",
    )


def mutate_ratings_contract(root: Path) -> None:
    """Read the rating body without the JSON-object boundary guard."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF3/BK-MF3-01-ratings-e-agregacao.md",
        "export function assertRatingBody(input)",
        "export function acceptRatingBody(input)",
    )


def mutate_comments_contract(root: Path) -> None:
    """Remove the public comment allowlist function."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF3/BK-MF3-02-comentarios-curtos-moderados.md",
        "function publicComment(comment, viewer = null)",
        "function internalComment(comment, viewer = null)",
    )


def mutate_recommendation_contract(root: Path) -> None:
    """Remove the feedback-aware signal loader."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF3/BK-MF3-05-recomendacao-baseline-cold-start.md",
        "async function loadUserSignals(db, userObjectId, maxAgeRating)",
        "async function loadSignalsWithoutFeedback(db, userObjectId, maxAgeRating)",
    )


def mutate_charity_contract(root: Path) -> None:
    """Remove the strict administrative review boundary."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF4/BK-MF4-04-aprovacao-entrada-pool.md",
        "export function assertReviewPayload(input)",
        "export function coerceReviewPayload(input)",
    )


def mutate_pool_finance(root: Path) -> None:
    """Allow a non-EUR payment into the monthly pool."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF4/BK-MF4-05-distribuicao-mensal-rotacao.md",
        'payment.currency !== "EUR" ||',
        'typeof payment.currency !== "string" ||',
    )


def mutate_performance_probe(root: Path) -> None:
    """Stop the performance deadline after headers instead of the response body."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF6/BK-MF6-04-otimizacao-de-performance-critica.md",
        "await response.arrayBuffer();",
        "// Body intentionally not consumed.",
    )


def mutate_navigation_session(root: Path) -> None:
    """Remove the URL-level guard for authenticated pages."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF7/BK-MF7-02-navegacao-segura-por-sessao-e-perfil.md",
        "export function AuthenticatedRoute({ children })",
        "export function UnguardedRoute({ children })",
    )


def mutate_delete_account_ui(root: Path) -> None:
    """Remove the same-tick reservation from account deletion."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF5/BK-MF5-02-eliminacao-conta-dados.md",
        "const submitReservedRef = useRef(false);",
        "const submitReserved = false;",
    )


def mutate_regression_truth(root: Path) -> None:
    """Present the unit double as transaction coverage again."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF6/BK-MF6-01-suite-de-regressao-backend.md",
        "A suite acima não chama `runInTransaction` com o DB double.",
        "A suite acima prova `runInTransaction` com o DB double.",
    )


def mutate_e2e_test_database(root: Path) -> None:
    """Bypass the complete E2E markers before selecting the test database."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF6/BK-MF6-03-hardening-seguranca-e-privacidade.md",
        'const formalE2eRequested = nodeEnv === "test" && E2E_MARKERS.some(',
        'const formalE2eRequested = nodeEnv === "test" || E2E_MARKERS.some(',
    )


def mutate_smoke_isolation(root: Path) -> None:
    """Point the in-memory MF1 smoke at a normal MongoDB variable."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF1/BK-MF1-06-smoke-tests-fe-be.md",
        '"smoke": "NODE_ENV=test FRONTEND_ORIGINS=',
        '"smoke": "NODE_ENV=test MONGODB_URI=mongodb://127.0.0.1/faithflix FRONTEND_ORIGINS=',
    )


def mutate_smoke_e2e_database(root: Path) -> None:
    """Point the in-memory MF1 smoke at the formal E2E MongoDB lane."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF1/BK-MF1-06-smoke-tests-fe-be.md",
        '"smoke": "NODE_ENV=test FRONTEND_ORIGINS=',
        '"smoke": "NODE_ENV=test TEST_MONGODB_URI=mongodb://127.0.0.1/?replicaSet=rs0 FRONTEND_ORIGINS=',
    )


def mutate_evidence_lane_ownership(root: Path) -> None:
    """Point the STUDENT smoke evidence authority at the REFERENCE snapshot."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF1/BK-MF1-06-smoke-tests-fe-be.md",
        "- `current_authority`: `docs/planificacao/guias-bk/MF1/BK-MF1-06-smoke-tests-fe-be.md`",
        "- `current_authority`: `docs/evidence/MF1/README.md`",
    )


def mutate_locked_media_selection(root: Path) -> None:
    """Put locked quality options back into playback source selection."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF2/BK-MF2-06-legendas-audio-parental-e-qualidade.md",
        ".filter((option) => option?.locked !== true)",
        ".filter(Boolean)",
    )


def mutate_session_mount(root: Path) -> None:
    """Mount the asynchronous session resolver a second time in MF2-02."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF2/BK-MF2-02-edicao-perfil-papeis-base.md",
        "// app.use(asyncHandler(attachSession));",
        "app.use(asyncHandler(attachSession));",
    )


def mutate_catalog_create_audit(root: Path) -> None:
    """Remove the audit action from administrative content creation."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF2/BK-MF2-03-crud-catalogo-taxonomias.md",
        'action: "catalog.content.created"',
        'action: "catalog.content.created_without_audit"',
    )


def mutate_worker_active_lease(root: Path) -> None:
    """Let completeScheduledJob close an already expired lease."""

    path = root / "docs/planificacao/guias-bk/MF4/BK-MF4-01-planos-ciclo-subscricao.md"
    text = path.read_text(encoding="utf-8")
    marker = "leaseExpiresAt: { $gt: now },"
    if text.count(marker) != 2:
        raise AssertionError(f"{path}: expected two active lease filters, found {text.count(marker)}")
    path.write_text(text.replace(marker, "leaseExpiresAt: { $exists: true },", 1), encoding="utf-8")


def mutate_public_plans_session(root: Path) -> None:
    """Replace the independent public plans request with a coupled client call."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF9/BK-MF9-04-ui-gestao-familiar-convites.md",
        "const plansResponse = await subscriptionsApi.listPlans({ signal });",
        "const plansResponse = await subscriptionsApi.listPlansAndMine({ signal });",
    )


def mutate_family_pool_trigger(root: Path) -> None:
    """Expect the impossible legacy `manual` pool trigger again."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF9/BK-MF9-05-privacidade-operacao-metricas-familia.md",
        'assert.equal(result.distribution.trigger, "admin");',
        'assert.equal(result.distribution.trigger, "manual");',
    )


def mutate_smoke_cleanup(root: Path) -> None:
    """Comment out the startup reset while preserving two textual occurrences."""

    path = root / "docs/planificacao/guias-bk/MF1/BK-MF1-06-smoke-tests-fe-be.md"
    text = path.read_text(encoding="utf-8")
    marker = "setDbForTests(null);"
    if text.count(marker) != 2:
        raise AssertionError(f"{path}: expected two cleanup resets, found {text.count(marker)}")
    index = text.rfind(marker)
    path.write_text(text[:index] + f"// {marker}" + text[index + len(marker):], encoding="utf-8")


def mutate_public_plans_loading(root: Path) -> None:
    """Keep the subscription page loading after a public-only request."""

    replace_once(
        root,
        "docs/planificacao/guias-bk/MF9/BK-MF9-04-ui-gestao-familiar-convites.md",
        "setLoading(false);",
        "setLoading(true);",
    )


CASES = (
    NegativeCase("estado", mutate_state, "estado"),
    NegativeCase("sprint", mutate_sprint, "sprint"),
    NegativeCase("proximo_bk", mutate_next_bk, "proximo_bk"),
    NegativeCase("matriz", mutate_matrix, "matrix.owner"),
    NegativeCase("mf_views", mutate_mf_view, "mf_views.sequence"),
    NegativeCase("paths_publicos", mutate_public_path, "public_guide.path"),
    NegativeCase("path_runbook_publico", mutate_public_runbook_path, "public_guide.path"),
    NegativeCase("placeholders_ativos", mutate_placeholder, "active_evidence.placeholder"),
    NegativeCase("comando_oficial", mutate_command, "command.wrapper_target"),
    NegativeCase("comando_extra_wrapper", mutate_wrapper_extra_command, "command.wrapper_content"),
    NegativeCase("namespace_anexo", mutate_annex_namespace, "validator"),
    NegativeCase("bk_extra_anexo", mutate_annex_extra_bk, "requirement_annex.bks"),
    NegativeCase("core_reforco", mutate_core_or_reinforcement, "core_or_reforco"),
    NegativeCase("matriz_boilerplate", mutate_matrix_boilerplate, "matrix.criterio_mensuravel"),
    NegativeCase("matriz_evidence_vazia", mutate_matrix_empty_evidence, "matrix.evidence_minima"),
    NegativeCase("matriz_status_invalido", mutate_matrix_invalid_status, "matrix.status_validacao"),
    NegativeCase("rate_limit_pesquisa", mutate_rate_limit, "rate_limit.table"),
    NegativeCase("schema_sessions", mutate_sessions_schema, "architecture.sessions"),
    NegativeCase("schema_rate_limit", mutate_rate_counter_schema, "architecture.rate_limit_counters"),
    NegativeCase("schema_scheduled_jobs", mutate_scheduled_jobs_schema, "architecture.scheduled_jobs"),
    NegativeCase("schema_payment_attempts", mutate_payment_attempts_schema, "architecture.payment_attempts"),
    NegativeCase("schema_contents", mutate_contents_schema, "architecture.contents"),
    NegativeCase("lifecycle_rotas", mutate_route_lifecycle, "lifecycle.routes"),
    NegativeCase("limite_email", mutate_auth_email_boundary, "auth.email_limit"),
    NegativeCase("metadata_status", mutate_metadata_status, "document_metadata.status"),
    NegativeCase("metadata_lane", mutate_metadata_lane, "document_metadata.lane"),
    NegativeCase("evidence_student_com_path_privado", mutate_student_evidence_private_path, "document_metadata.lane"),
    NegativeCase("metadata_snapshot", mutate_metadata_snapshot_date, "document_metadata.snapshot_date"),
    NegativeCase("metadata_autoridade", mutate_metadata_authority, "document_metadata.current_authority"),
    NegativeCase("metadata_proof_scope", mutate_metadata_proof_scope, "document_metadata.proof_scope"),
    NegativeCase("metadata_arquivo", mutate_archive_metadata, "document_metadata.document_status"),
    NegativeCase("boundary_hibrido", mutate_hybrid_snapshot_boundary, "document_metadata.boundary"),
    NegativeCase(
        "boundary_hibrido_current",
        mutate_current_hybrid_snapshot_boundary,
        "document_metadata.boundary",
    ),
    NegativeCase("lane_comparacao_referencia", mutate_reference_comparison_lane, "document_metadata.comparison_lane"),
    NegativeCase(
        "politica_lane_comparacao_referencia",
        mutate_reference_comparison_policy,
        "document_metadata.comparison_lane",
    ),
    NegativeCase("e2e_env_normal", mutate_e2e_normal_environment, "e2e.environment"),
    NegativeCase("e2e_sem_replica", mutate_e2e_without_replica_set, "e2e.environment"),
    NegativeCase("e2e_sufixo_db", mutate_e2e_database_suffix, "e2e.environment"),
    NegativeCase("e2e_db_generica_reutilizavel", mutate_e2e_generic_reused_database, "e2e.environment"),
    NegativeCase("e2e_host_externo", mutate_e2e_external_host, "e2e.environment"),
    NegativeCase("e2e_uri_com_credenciais", mutate_e2e_uri_credentials, "e2e.environment"),
    NegativeCase("e2e_db_seed_browser_divergente", mutate_e2e_seed_browser_database_mismatch, "e2e.environment"),
    NegativeCase("e2e_uri_seed_browser_divergente", mutate_e2e_seed_browser_uri_mismatch, "e2e.environment"),
    NegativeCase("e2e_db_nova_por_execucao", mutate_e2e_reused_database_policy, "e2e.environment"),
    NegativeCase("e2e_mf9_db_nova", mutate_mf9_current_e2e_database, "e2e.environment"),
    NegativeCase("playwright_direto", mutate_bare_playwright, "playwright.command"),
    NegativeCase("comando_runbook_manifest", mutate_runbook_manifest_command, "runbook.manifest"),
    NegativeCase("tutorial_v2", mutate_tutorial_structure, "guide.structure"),
    NegativeCase("tutorial_seccao_extra", mutate_tutorial_extra_section, "guide.structure"),
    NegativeCase("tutorial_ponto", mutate_tutorial_step_point, "guide.step_contract"),
    NegativeCase("tutorial_ponto_extra", mutate_tutorial_extra_step_point, "guide.step_contract"),
    NegativeCase("marker_sem_codigo", mutate_codeless_marker, "guide.marker"),
    NegativeCase("metadata_template_evidence", mutate_embedded_evidence_metadata, "guide.evidence_metadata"),
    NegativeCase("comentario_didatico", mutate_didactic_comment_budget, "guide.didactic_comments"),
    NegativeCase("mf_views_baseline", mutate_mf_views_baseline, "mf_views.baseline"),
    NegativeCase("api_client_fallback", mutate_api_client_fallback, "critical.api_client"),
    NegativeCase("health_legacy", mutate_health_legacy, "critical.health"),
    NegativeCase("session_unavailable", mutate_session_unavailable, "critical.session"),
    NegativeCase(
        "session_missing_user_coercion",
        mutate_session_missing_user_coercion,
        "critical.session",
    ),
    NegativeCase("catalogo_media_publica", mutate_catalog_public_media, "critical.catalog_media"),
    NegativeCase("media_metadata", mutate_media_metadata_serializer, "critical.media_metadata"),
    NegativeCase("rgpd_sem_transacao", mutate_privacy_transaction, "critical.privacy"),
    NegativeCase("financeiro_duplicado", mutate_financial_duplicate, "critical.financial"),
    NegativeCase("contrato_concorrente", mutate_concurrent_guide_contract, "guide.concurrent_contract"),
    NegativeCase("composicao_auth_session", mutate_auth_session_composition, "composition.auth_session"),
    NegativeCase("csrf_retry_code", mutate_csrf_retry_code, "composition.csrf_retry"),
    NegativeCase("e2e_fixture_helper", mutate_e2e_fixture_helper, "composition.e2e_network"),
    NegativeCase("quality_access_gate", mutate_quality_access_gate, "composition.quality_access"),
    NegativeCase("plan_eligibility", mutate_plan_eligibility_definition, "composition.plan_eligibility"),
    NegativeCase("catalog_quality", mutate_catalog_quality_canonicalization, "composition.catalog_quality"),
    NegativeCase("parental_fail_closed", mutate_parental_fail_closed, "composition.parental_fail_closed"),
    NegativeCase("automatic_quality", mutate_automatic_quality_contract, "composition.automatic_quality"),
    NegativeCase("privacy_delete_rate", mutate_privacy_delete_rate_limit, "composition.privacy_rate_limit"),
    NegativeCase("worker_uri_argv", mutate_worker_uri_argv, "composition.worker_secret"),
    NegativeCase("performance_catalog_v1", mutate_performance_catalog_v1, "composition.performance_catalog"),
    NegativeCase("charities_api_duplicate", mutate_charities_api_duplicate, "composition.charities_api"),
    NegativeCase("catalog_detail_import", mutate_catalog_detail_import, "composition.catalog_detail"),
    NegativeCase("lazy_route_composition", mutate_lazy_route_composition, "composition.lazy_routes"),
    NegativeCase("family_foundation", mutate_family_foundation, "composition.family_foundation"),
    NegativeCase(
        "contextual_fragment_classification",
        mutate_contextual_fragment_classification,
        "guide.fragment_classification",
    ),
    NegativeCase(
        "catalog_api_cumulative_contract",
        mutate_catalog_api_cumulative_contract,
        "composition.catalog_detail",
    ),
    NegativeCase(
        "playback_api_cumulative_contract",
        mutate_playback_api_cumulative_contract,
        "composition.playback_api_cumulative",
    ),
    NegativeCase("e2e_host_guard_order", mutate_e2e_host_guard_order, "composition.e2e_network"),
    NegativeCase(
        "worker_database_selection",
        mutate_worker_database_selection,
        "composition.worker_secret",
    ),
    NegativeCase(
        "performance_status_summary",
        mutate_performance_status_summary,
        "composition.performance_catalog",
    ),
    NegativeCase(
        "privacy_delete_password_payload",
        mutate_privacy_delete_password_payload,
        "composition.privacy_delete_payload",
    ),
    NegativeCase(
        "unknown_quality_redaction",
        mutate_unknown_quality_redaction,
        "composition.quality_access",
    ),
    NegativeCase(
        "admin_catalog_edit_action",
        mutate_admin_catalog_edit_action,
        "composition.admin_catalog",
    ),
    NegativeCase(
        "effective_access_middleware",
        mutate_effective_access_middleware,
        "composition.quality_access",
    ),
    NegativeCase(
        "playback_preferences_routes",
        mutate_playback_preferences_routes,
        "composition.playback_routes",
    ),
    NegativeCase(
        "idempotency_sentinel_guard",
        mutate_idempotency_sentinel_guard,
        "critical.financial",
    ),
    NegativeCase(
        "origin_csrf_browser_detection",
        mutate_origin_csrf_browser_detection,
        "composition.origin_csrf",
    ),
    NegativeCase(
        "e2e_seed_guard_definition",
        mutate_e2e_seed_guard_definition,
        "composition.e2e_seed_guard",
    ),
    NegativeCase(
        "reset_delivery_outbox",
        mutate_reset_delivery_outbox,
        "composition.reset_delivery",
    ),
    NegativeCase(
        "recommendation_rate_limit_mount",
        mutate_recommendation_rate_limit_mount,
        "composition.recommendation_rate_limit",
    ),
    NegativeCase(
        "security_hardening_mount",
        mutate_security_hardening_mount,
        "composition.security_hardening",
    ),
    NegativeCase("route_metadata_coverage", mutate_route_metadata_coverage, "composition.route_metadata"),
    NegativeCase("final_player_controls", mutate_final_player_controls, "composition.final_player"),
    NegativeCase(
        "final_recommendations_api",
        mutate_final_recommendations_api,
        "composition.final_pages",
    ),
    NegativeCase("moderator_catalog_scope", mutate_moderator_catalog_scope, "composition.rbac_mobile"),
    NegativeCase("mobile_reduced_motion", mutate_mobile_reduced_motion, "composition.mobile_css"),
    NegativeCase(
        "consents_confirmed_snapshot",
        mutate_consents_confirmed_snapshot,
        "composition.consents_ui",
    ),
    NegativeCase("admin_users_reservation", mutate_admin_users_reservation, "composition.admin_users_ui"),
    NegativeCase("admin_review_reservation", mutate_admin_review_reservation, "composition.admin_review_ui"),
    NegativeCase(
        "charity_report_submission_guard",
        mutate_charity_report_submission_guard,
        "composition.charity_reports_ui",
    ),
    NegativeCase("family_member_path_encoding", mutate_family_member_path_encoding, "composition.family_ui"),
    NegativeCase("worker_job_claim", mutate_worker_job_claim, "composition.worker_jobs"),
    NegativeCase("monthly_pool_worker", mutate_monthly_pool_worker, "composition.pool_worker"),
    NegativeCase(
        "media_preference_reservation",
        mutate_media_preference_reservation,
        "composition.media_preferences",
    ),
    NegativeCase(
        "family_billing_closure",
        mutate_family_billing_closure,
        "composition.family_billing",
    ),
    NegativeCase("export_security", mutate_export_security, "composition.export_security"),
    NegativeCase("metrics_admin", mutate_metrics_admin, "composition.metrics_admin"),
    NegativeCase(
        "integrations_config",
        mutate_integrations_config,
        "composition.integrations_config",
    ),
    NegativeCase("auth_middleware_path", mutate_auth_middleware_path, "composition.auth_middleware_path"),
    NegativeCase("session_database", mutate_session_database, "composition.session_database"),
    NegativeCase("core_error_envelope", mutate_core_error_envelope, "composition.core_error_envelope"),
    NegativeCase("consents_backend", mutate_consents_backend, "composition.consents_backend"),
    NegativeCase("progress_notification", mutate_progress_notification, "composition.progress_notification"),
    NegativeCase(
        "family_privacy_operations",
        mutate_family_privacy_operations,
        "composition.family_privacy_operations",
    ),
    NegativeCase("subscription_access", mutate_subscription_access, "composition.subscription_access"),
    NegativeCase("family_notifications", mutate_family_notifications, "composition.family_notifications"),
    NegativeCase("admin_user_contract", mutate_admin_user_contract, "composition.admin_user_contract"),
    NegativeCase("ratings_contract", mutate_ratings_contract, "composition.ratings_contract"),
    NegativeCase("comments_contract", mutate_comments_contract, "composition.comments_contract"),
    NegativeCase(
        "recommendation_contract",
        mutate_recommendation_contract,
        "composition.recommendation_contract",
    ),
    NegativeCase("charity_contract", mutate_charity_contract, "composition.charity_contract"),
    NegativeCase("pool_finance", mutate_pool_finance, "composition.pool_finance"),
    NegativeCase("performance_probe", mutate_performance_probe, "composition.performance_probe"),
    NegativeCase("navigation_session", mutate_navigation_session, "composition.navigation_session"),
    NegativeCase("delete_account_ui", mutate_delete_account_ui, "composition.delete_account_ui"),
    NegativeCase("regression_truth", mutate_regression_truth, "composition.regression_truth"),
    NegativeCase("e2e_test_database", mutate_e2e_test_database, "composition.e2e_test_database"),
    NegativeCase("smoke_isolation", mutate_smoke_isolation, "composition.smoke_isolation"),
    NegativeCase("smoke_e2e_database", mutate_smoke_e2e_database, "composition.smoke_isolation"),
    NegativeCase(
        "evidence_lane_ownership",
        mutate_evidence_lane_ownership,
        "composition.evidence_lane_ownership",
    ),
    NegativeCase(
        "locked_media_selection",
        mutate_locked_media_selection,
        "composition.locked_media_selection",
    ),
    NegativeCase("session_mount", mutate_session_mount, "composition.session_mount"),
    NegativeCase(
        "catalog_create_audit",
        mutate_catalog_create_audit,
        "composition.catalog_create_audit",
    ),
    NegativeCase(
        "worker_active_lease",
        mutate_worker_active_lease,
        "composition.worker_active_lease",
    ),
    NegativeCase(
        "public_plans_session",
        mutate_public_plans_session,
        "composition.public_plans_session",
    ),
    NegativeCase(
        "family_pool_trigger",
        mutate_family_pool_trigger,
        "composition.family_pool_trigger",
    ),
    NegativeCase("smoke_cleanup", mutate_smoke_cleanup, "composition.smoke_cleanup"),
    NegativeCase(
        "public_plans_loading",
        mutate_public_plans_loading,
        "composition.public_plans_loading",
    ),
)


def run_validator(root: Path) -> tuple[subprocess.CompletedProcess[str], dict[str, object]]:
    """Run the validator against ``root`` and parse its JSON output."""

    process = subprocess.run(
        [
            sys.executable,
            str(VALIDATOR),
            "--project",
            "faithflix",
            "--root",
            str(root),
            "--json",
        ],
        cwd=ROOT,
        check=False,
        capture_output=True,
        text=True,
        timeout=30,
    )
    try:
        result = json.loads(process.stdout)
    except json.JSONDecodeError as error:
        raise AssertionError(
            f"validator did not return JSON; exit={process.returncode}; stdout={process.stdout!r}; stderr={process.stderr!r}",
        ) from error
    return process, result


def make_isolated_copy(destination: Path) -> None:
    """Copy only documentation and the command wrapper needed by validation."""

    shutil.copytree(ROOT / "docs", destination / "docs")
    shutil.copy2(ROOT / "ARCHITECTURE.md", destination / "ARCHITECTURE.md")
    (destination / "scripts").mkdir(parents=True)
    shutil.copy2(ROOT / "scripts/validate-planificacao.sh", destination / "scripts/validate-planificacao.sh")
    for relative_manifest in (
        Path("backend/package.json"),
        Path("frontend/package.json"),
        Path("real_dev/backend/package.json"),
        Path("real_dev/frontend/package.json"),
    ):
        target = destination / relative_manifest
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(ROOT / relative_manifest, target)


def main() -> int:
    """Require a green baseline and all isolated drift mutations to fail."""

    baseline_process, baseline = run_validator(ROOT)
    if baseline_process.returncode != 0 or baseline.get("status") != "PASS":
        print("FAIL baseline: the canonical repository must pass before negative mutation tests", file=sys.stderr)
        for error in baseline.get("errors", []):
            print(f"- {error}", file=sys.stderr)
        return 1

    for case in CASES:
        with tempfile.TemporaryDirectory(prefix=f"faithflix-plan-{case.name}-") as temporary:
            isolated_root = Path(temporary)
            make_isolated_copy(isolated_root)
            case.mutate(isolated_root)
            process, result = run_validator(isolated_root)
            fields = {error.get("field") for error in result.get("errors", [])}
            if process.returncode != 1 or result.get("status") != "FAIL" or case.expected_field not in fields:
                print(
                    f"FAIL negative {case.name}: exit={process.returncode}, status={result.get('status')}, fields={sorted(fields)}",
                    file=sys.stderr,
                )
                return 1
            print(f"PASS negative {case.name}: rejected as {case.expected_field}")

    print(f"PASS: baseline green and {len(CASES)} isolated drift classes rejected")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
