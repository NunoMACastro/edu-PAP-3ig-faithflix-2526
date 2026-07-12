#!/usr/bin/env python3
"""Validate the FaithFlix planning canon without accessing application data.

The validator compares only repository-local documentation.  Its sources and
derived views follow the contracts already declared in the planning docs:

* ``BACKLOG-MVP.md`` owns BK metadata and student delivery state;
* ``PLANO-SPRINTS.md`` owns sprint allocation and execution order;
* ``MATRIZ-CANONICA-BK.md`` and the RF/RNF annexes own traceability views;
* ``MF-VIEWS.md`` and each BK guide header are derived views;
* public student guides use ``backend/`` and ``frontend/`` paths, while
  private-reference reports may use ``real_dev/``;
* active evidence cannot retain template placeholders.

No command in this module starts an application, opens a network connection,
reads environment secrets, seeds data, runs migrations or touches a database.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import unicodedata
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import urlsplit


BACKLOG_PATH = Path("docs/planificacao/backlogs/BACKLOG-MVP.md")
CONTRACT_PATH = Path("docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md")
ANNEX_PATH = Path("docs/planificacao/backlogs/ANEXO-BK-SPRINT-OWNER.md")
RF_ANNEX_PATH = Path("docs/planificacao/backlogs/ANEXO-RF-PARA-BKS.md")
RNF_ANNEX_PATH = Path("docs/planificacao/backlogs/ANEXO-RNF-PARA-BKS.md")
MATRIX_PATH = Path("docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md")
MF_VIEWS_PATH = Path("docs/planificacao/backlogs/MF-VIEWS.md")
SPRINT_PLAN_PATH = Path("docs/planificacao/sprints/PLANO-SPRINTS.md")
GUIDES_ROOT = Path("docs/planificacao/guias-bk")
EVIDENCE_ROOT = Path("docs/evidence")
RF_PATH = Path("docs/RF.md")
RNF_PATH = Path("docs/RNF.md")
ARCHITECTURE_PATH = Path("ARCHITECTURE.md")
PLANNING_README_PATH = Path("docs/planificacao/README.md")
GUIDES_README_PATH = GUIDES_ROOT / "README.md"
GUIDE_TEMPLATE_PATH = GUIDES_ROOT / "_TEMPLATE-BK.md"
VALIDATOR_WRAPPER_PATH = Path("scripts/validate-planificacao.sh")

AUTH_GUIDE_PATH = GUIDES_ROOT / "MF2/BK-MF2-01-registo-login-recuperacao-password.md"
API_CLIENT_GUIDE_PATH = GUIDES_ROOT / "MF1/BK-MF1-03-cliente-api-frontend-tratamento-erro.md"
HEALTH_GUIDE_PATH = GUIDES_ROOT / "MF1/BK-MF1-05-health-check-e-logging-estruturado.md"
SESSION_GUIDE_PATH = GUIDES_ROOT / "MF7/BK-MF7-02-navegacao-segura-por-sessao-e-perfil.md"
CATALOG_GUIDE_PATH = GUIDES_ROOT / "MF2/BK-MF2-03-crud-catalogo-taxonomias.md"
MEDIA_GUIDE_PATH = GUIDES_ROOT / "MF2/BK-MF2-06-legendas-audio-parental-e-qualidade.md"
PRIVACY_GUIDE_PATH = GUIDES_ROOT / "MF5/BK-MF5-02-eliminacao-conta-dados.md"
EXPORT_GUIDE_PATH = GUIDES_ROOT / "MF5/BK-MF5-01-exportacao-dados-utilizador.md"
METRICS_GUIDE_PATH = GUIDES_ROOT / "MF5/BK-MF5-05-painel-de-metricas-admin.md"
INTEGRATIONS_GUIDE_PATH = GUIDES_ROOT / "MF5/BK-MF5-06-configuracao-de-integracoes-admin.md"
FAMILY_PRIVACY_GUIDE_PATH = GUIDES_ROOT / "MF9/BK-MF9-05-privacidade-operacao-metricas-familia.md"
PAYMENTS_GUIDE_PATH = GUIDES_ROOT / "MF4/BK-MF4-02-metodos-pagamento-simulados-trial.md"
FAMILY_PLANS_GUIDE_PATH = GUIDES_ROOT / "MF9/BK-MF9-01-planos-pro-familia-entitlements.md"
NOTIFICATIONS_GUIDE_PATH = GUIDES_ROOT / "MF4/BK-MF4-08-notificacoes-transacionais-e-preferencias.md"
E2E_GUIDE_PATH = GUIDES_ROOT / "MF2/BK-MF2-08-teste-e2e-fluxo-principal.md"
QUALITY_GUIDE_PATH = GUIDES_ROOT / "MF9/BK-MF9-02-qualidade-streaming-por-plano.md"
FAMILY_API_GUIDE_PATH = GUIDES_ROOT / "MF9/BK-MF9-03-modelo-api-partilha-familiar.md"
CATALOG_DETAIL_GUIDE_PATH = GUIDES_ROOT / "MF2/BK-MF2-04-pagina-detalhe-conteudo.md"
PERFORMANCE_GUIDE_PATH = GUIDES_ROOT / "MF6/BK-MF6-04-otimizacao-de-performance-critica.md"
WORKER_GUIDE_PATH = GUIDES_ROOT / "MF4/BK-MF4-01-planos-ciclo-subscricao.md"
POOL_GUIDE_PATH = GUIDES_ROOT / "MF4/BK-MF4-05-distribuicao-mensal-rotacao.md"
ROUTES_GUIDE_PATH = GUIDES_ROOT / "MF7/BK-MF7-02-navegacao-segura-por-sessao-e-perfil.md"
WORKER_RUNBOOK_PATH = Path("docs/runbooks/WORKER-LOCAL.md")
DEMO_RUNBOOK_PATH = Path("docs/runbooks/DEMO-DATASET.md")
SAFE_E2E_EVIDENCE_PATH = EVIDENCE_ROOT / "MF8/TESTES-FINAIS-CRIADOS.md"
MF9_REGRESSION_EVIDENCE_PATH = EVIDENCE_ROOT / "MF9/REGRESSAO-MF9.md"
STUDENT_RUNBOOK_PATH = GUIDES_ROOT / "MF9/ARRANQUE-LOCAL-MF9.md"
REFERENCE_RUNBOOK_ROOT = Path("docs/runbooks")
RUNBOOK_MANIFESTS = {
    STUDENT_RUNBOOK_PATH: {
        "backend": Path("backend/package.json"),
        "frontend": Path("frontend/package.json"),
    },
    REFERENCE_RUNBOOK_ROOT / "ARRANQUE-E-SHUTDOWN-LOCAL.md": {
        "real_dev/backend": Path("real_dev/backend/package.json"),
        "real_dev/frontend": Path("real_dev/frontend/package.json"),
    },
    REFERENCE_RUNBOOK_ROOT / "WORKER-LOCAL.md": {
        "real_dev/backend": Path("real_dev/backend/package.json"),
    },
    REFERENCE_RUNBOOK_ROOT / "BACKUP-RESTORE-LOCAL.md": {
        "real_dev/backend": Path("real_dev/backend/package.json"),
    },
    REFERENCE_RUNBOOK_ROOT / "ROLLBACK-MANUAL-LOCAL.md": {
        "real_dev/backend": Path("real_dev/backend/package.json"),
        "real_dev/frontend": Path("real_dev/frontend/package.json"),
    },
}
REFERENCE_EVIDENCE_PATHS = frozenset(
    {
        EVIDENCE_ROOT / "README.md",
        SAFE_E2E_EVIDENCE_PATH,
        EVIDENCE_ROOT / "MF9/MATRIZ-BROWSERS-MANUAL.md",
    },
)
HYBRID_DOCUMENT_PATHS = (
    EVIDENCE_ROOT / "MF6/BK-MF6-03-hardening-seguranca.md",
    EVIDENCE_ROOT / "MF8/ALINHAMENTO-VISUAL-PARTE-I.md",
    EVIDENCE_ROOT / "MF8/ALINHAMENTO-VISUAL-PARTE-II.md",
    EVIDENCE_ROOT / "MF8/PAINEL-READINESS-OPERACIONAL.md",
    GUIDES_ROOT / "AUDITORIA-IMPLEMENTACAO-real_dev-MF2.md",
    GUIDES_ROOT / "AUDITORIA-IMPLEMENTACAO-real_dev-MF4.md",
    GUIDES_ROOT / "AUDITORIA-IMPLEMENTACAO-real_dev-MF5.md",
    GUIDES_ROOT / "AUDITORIA-IMPLEMENTACAO-real_dev-MF9.md",
    GUIDES_ROOT / "IMPLEMENTACAO-REAL_DEV-MF4.md",
    GUIDES_ROOT / "IMPLEMENTACAO-REAL_DEV-MF5.md",
    GUIDES_ROOT / "IMPLEMENTACAO-REAL_DEV-MF8.md",
    GUIDES_ROOT / "IMPLEMENTACAO-REAL_DEV-MF9.md",
)
CURRENT_HYBRID_DOCUMENT_PATHS = (
    EVIDENCE_ROOT / "MF8/AUDITORIA-ADMINISTRATIVA-FINAL.md",
    EVIDENCE_ROOT / "MF8/EXECUCAO-TESTES-REPORT-ERROS.md",
    EVIDENCE_ROOT / "MF8/TESTES-FINAIS-CRIADOS.md",
    EVIDENCE_ROOT / "MF9/GATE-S13-MF9.md",
    EVIDENCE_ROOT / "MF9/REGRESSAO-MF9.md",
)
STUDENT_REFERENCE_COMPARISON_PATHS = (
    GUIDES_ROOT / "AUDITORIA-HIDRATACAO-MF5.md",
    GUIDES_ROOT / "AUDITORIA-HIDRATACAO-MF6.md",
)

HEADER_RE = re.compile(r"^- `(?P<key>[^`]+)`: `(?P<value>.*)`\s*$")
BK_ID_RE = re.compile(r"\bBK-MF\d+-\d{2}\b")
BK_ID_FULL_RE = re.compile(r"BK-(?P<macro>MF\d+)-(?P<number>\d{2})\Z")
REQ_ID_RE = re.compile(r"\b(?:RF|RNF)\d{2}\b|transversal|RF_ATIVOS_MVP")
ACTIVE_REQ_RE = re.compile(r"\b(?:RF|RNF)\d{2}\b")
SPRINT_RE = re.compile(r"S(?P<number>\d{2})\Z")
SPRINT_LABEL_RE = re.compile(r"Sprint\s+(?P<number>\d+)\Z", re.IGNORECASE)
SPRINT_RANGE_RE = re.compile(r"BK-(?P<macro>MF\d+)-(?P<start>\d{2})\.\.(?P<end>\d{2})")
PUBLIC_GUIDE_PATH_RE = re.compile(
    r"(?<![A-Za-z0-9_-])(?:real_dev|referencia_privada_docente|pasta_privada_do_professor)(?:/|\b)"
    r"|(?<![A-Za-z0-9_-])apps/(?:api|web|backend|frontend)(?:/|\b)",
    re.IGNORECASE,
)
ACTIVE_PLACEHOLDER_RE = re.compile(
    r"\bPREENCHER_COM_[A-Z0-9_]+\b|\bPLACEHOLDER\b|\{\{[^}\n]+\}\}",
    re.IGNORECASE,
)
METADATA_RE = re.compile(r"^- `(?P<key>[a-z_]+)`: (?P<value>.+?)\s*$")
BARE_PLAYWRIGHT_RE = re.compile(
    r"(?<![A-Za-z0-9_-])(?:npx\s+|\./node_modules/\.bin/)?playwright\s+test\b",
    re.IGNORECASE,
)
RUNBOOK_NPM_SCRIPT_RE = re.compile(
    r"\bnpm\s+--prefix\s+(?P<prefix>[A-Za-z0-9_./-]+)\s+"
    r"(?:(?:run\s+(?P<run>[A-Za-z0-9:_-]+))|(?P<direct>test|start))\b",
)
NORMAL_MONGODB_ENV_RE = re.compile(r"(?<!TEST_)MONGODB_(?:URI|DB_NAME)\s*=", re.IGNORECASE)
FRESH_E2E_DB_RE = re.compile(r"^faithflix_mf(?:2|4|9)_\d{8}t\d{6}_e2e$", re.IGNORECASE)
ARCHIVE_PARTS = frozenset({"archive", "arquivo", "templates", "_templates"})
CANONICAL_COMMAND = "bash scripts/validate-planificacao.sh"
WRAPPER_COMMAND = "python3 scripts/validate_planificacao_canonica.py --project faithflix --json"
EXPECTED_WRAPPER = """#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

python3 scripts/validate_planificacao_canonica.py --project faithflix --json
"""

ALLOWED_PRIORITIES = frozenset({"P0", "P1", "P2"})
ALLOWED_STATES = frozenset({"TODO", "IN_PROGRESS", "BLOCKED", "DONE"})
ALLOWED_EFFORTS = frozenset({"S", "M", "L"})
ALLOWED_DOCUMENT_STATUSES = frozenset({"CURRENT", "HISTORICAL_SNAPSHOT", "SUPERSEDED"})
ALLOWED_IMPLEMENTATION_LANES = frozenset({"STUDENT", "REFERENCE"})

TUTORIAL_V2_SECTIONS = (
    "Objetivo",
    "Importância",
    "Scope-in",
    "Scope-out",
    "Estado antes e depois",
    "Pré-requisitos",
    "Glossário",
    "Conceitos teóricos essenciais",
    "Arquitetura do BK",
    "Ficheiros a criar/editar/rever",
    "Tutorial técnico linear",
    "Critérios de aceite",
    "Validação final",
    "Evidence para PR/defesa",
    "Handoff",
    "Changelog",
)
CODELESS_STEP_MARKER = "Sem código neste passo."

EXPECTED_RATE_LIMITS = {
    ("login", "falhas por email"): "5 / 15 minutos",
    ("login", "pedidos por ip"): "20 / 15 minutos",
    ("registo", "pedidos por ip"): "5 / hora",
    ("recuperacao", "pedidos por email"): "3 / hora",
    ("recuperacao", "pedidos por ip"): "10 / hora",
    ("reset", "pedidos por token"): "5 / 15 minutos",
    ("reset", "pedidos por ip"): "10 / hora",
    ("candidatura de associacao", "pedidos por ip"): "5 / hora",
    ("pesquisa", "pedidos por ip"): "120 / minuto",
    ("recomendacoes", "pedidos por utilizador"): "60 / minuto",
    ("eliminacao de conta", "pedidos por utilizador"): "5 / 15 minutos",
    ("eliminacao de conta", "pedidos por ip"): "20 / hora",
}

PRIORITY_REPORT_METADATA = {
    GUIDES_ROOT / "CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF2.md": ("HISTORICAL_SNAPSHOT", "REFERENCE"),
    GUIDES_ROOT / "CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF5.md": ("HISTORICAL_SNAPSHOT", "REFERENCE"),
    GUIDES_ROOT / "IMPLEMENTACAO-REAL_DEV-MF3.md": ("HISTORICAL_SNAPSHOT", "REFERENCE"),
    GUIDES_ROOT / "AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md": ("HISTORICAL_SNAPSHOT", "REFERENCE"),
    GUIDES_ROOT / "AUDITORIA-HIDRATACAO-MF7.md": ("HISTORICAL_SNAPSHOT", "STUDENT"),
    GUIDES_ROOT / "AUDITORIA-HIDRATACAO-MF8.md": ("HISTORICAL_SNAPSHOT", "STUDENT"),
    GUIDES_ROOT / "AVALIACAO-REAL_DEV-MF8-CANDIDATOS.md": ("HISTORICAL_SNAPSHOT", "REFERENCE"),
    GUIDES_ROOT / "REESTRUTURACAO-MF7-MF8.md": ("HISTORICAL_SNAPSHOT", "STUDENT"),
    STUDENT_RUNBOOK_PATH: ("CURRENT", "STUDENT"),
}

MATRIX_BOILERPLATE_RE = re.compile(
    r"criterio principal ligado ao requisito|validar o requisito conforme o bk|"
    r"evidence do requisito|pr/proof/neg do requisito|teste positivo e negativo do requisito",
    re.IGNORECASE,
)
MATRIX_STATUS_RE = re.compile(
    r"(?:PENDENTE|VALIDADO|BLOQUEADO|NAO_APLICAVEL)(?: \(Gate S(?:4|8|12|13)\))?\Z",
)
CONCURRENT_GUIDE_CONTRACT_RE = re.compile(
    r"(?:este )?adendo prevalece|prevalecem sobre este adendo|snapshot pedagogico|"
    r"snippets? (?:legacy|antigos?|obsoletos?|errados?)|codigo antigo|"
    r"snippets? anteriores permanecem snapshots?|snippets? ficam (?:preservados )?como snapshot",
)


@dataclass(frozen=True)
class BacklogItem:
    """Canonical BK metadata extracted from the official backlog."""

    bk_id: str
    macro: str
    owner: str
    support: str
    priority: str
    state: str
    effort: str
    dependencies: tuple[str, ...]
    requirements: tuple[str, ...]


@dataclass(frozen=True)
class GuideHeader:
    """Metadata extracted from one public student BK guide header."""

    path: Path
    bk_id: str
    macro: str
    owner: str
    support: str
    priority: str
    state: str
    effort: str
    dependencies: tuple[str, ...]
    requirements: tuple[str, ...]
    sprint: str
    core_or_reinforcement: str
    next_bk: str
    guide_path: str


@dataclass(frozen=True)
class AnnexItem:
    """Derived metadata row from ANEXO-BK-SPRINT-OWNER."""

    bk_id: str
    macro: str
    sprint: str
    owner: str
    support: str
    priority: str
    core_or_reinforcement: str
    requirements: tuple[str, ...]
    dependencies: tuple[str, ...]
    guide_path: str


@dataclass(frozen=True)
class MatrixItem:
    """One primary requirement-to-BK row from MATRIZ-CANONICA-BK."""

    requirement: str
    bk_id: str
    macro: str
    owner: str
    priority: str
    measurable_criterion: str
    minimum_evidence: str
    validation_status: str


def clean_cell(value: str) -> str:
    """Normalize a Markdown table cell without changing its semantic text."""

    return value.strip().replace("`", "").strip()


def split_table_row(line: str) -> list[str]:
    """Split a planning table row without breaking pipes in code spans."""

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
            cells.append(clean_cell("".join(current)))
            current = []
        else:
            current.append(character)
    cells.append(clean_cell("".join(current)))
    return cells


def normalize_header(value: str) -> str:
    """Return the case-insensitive key used to identify canonical tables."""

    return clean_cell(value).lower()


def normalize_semantic(value: str) -> str:
    """Normalize accents, punctuation and whitespace for semantic contracts.

    The public guides are written in PT-PT.  This normalization lets the
    validator accept correctly accented headings while still comparing the
    stable meaning of a heading or table key.
    """

    decomposed = unicodedata.normalize("NFKD", value)
    without_accents = "".join(character for character in decomposed if not unicodedata.combining(character))
    words_only = re.sub(r"[^a-z0-9]+", " ", without_accents.lower())
    return " ".join(words_only.split())


def strip_metadata_value(value: str) -> str:
    """Remove one optional Markdown code-span wrapper from metadata."""

    normalized = value.strip()
    if len(normalized) >= 2 and normalized.startswith("`") and normalized.endswith("`"):
        return normalized[1:-1].strip()
    return normalized


def parse_document_metadata(path: Path) -> dict[str, str]:
    """Read publication metadata from the first 80 lines of a document."""

    metadata: dict[str, str] = {}
    for line in path.read_text(encoding="utf-8").splitlines()[:80]:
        match = METADATA_RE.match(line)
        if match:
            metadata.setdefault(match.group("key"), strip_metadata_value(match.group("value")))
    return metadata


def markdown_lines_outside_fences(text: str) -> list[tuple[int, str]]:
    """Return line numbers/text while excluding fenced code block contents."""

    result: list[tuple[int, str]] = []
    fence_marker: str | None = None
    for line_number, line in enumerate(text.splitlines(), start=1):
        stripped = line.lstrip()
        fence_match = re.match(r"^(`{3,}|~{3,})", stripped)
        if fence_match:
            marker = fence_match.group(1)
            if fence_marker is None:
                fence_marker = marker[0]
            elif marker[0] == fence_marker:
                fence_marker = None
            continue
        if fence_marker is None:
            result.append((line_number, line))
    return result


def is_separator_row(cells: list[str]) -> bool:
    """Return whether every cell is a Markdown alignment separator."""

    return bool(cells) and all(re.fullmatch(r":?-{3,}:?", cell) for cell in cells)


def parse_markdown_tables(path: Path) -> list[tuple[list[str], list[list[str]]]]:
    """Parse the simple pipe tables used by the planning canon.

    The planning tables do not use escaped pipe characters in the fields that
    this validator consumes.  Rows with a different width are retained so the
    caller can fail closed when a canonical table becomes malformed.
    """

    lines = path.read_text(encoding="utf-8").splitlines()
    tables: list[tuple[list[str], list[list[str]]]] = []
    index = 0

    while index < len(lines) - 1:
        if not lines[index].lstrip().startswith("|"):
            index += 1
            continue

        header = split_table_row(lines[index])
        separator = split_table_row(lines[index + 1])
        if len(header) != len(separator) or not is_separator_row(separator):
            index += 1
            continue

        rows: list[list[str]] = []
        index += 2
        while index < len(lines) and lines[index].lstrip().startswith("|"):
            rows.append(split_table_row(lines[index]))
            index += 1
        tables.append((header, rows))

    return tables


def find_table(path: Path, first_header: str, required_headers: set[str]) -> tuple[list[str], list[list[str]]]:
    """Find one canonical table by its first and required header names."""

    for header, rows in parse_markdown_tables(path):
        normalized = [normalize_header(cell) for cell in header]
        if normalized and normalized[0] == first_header and required_headers.issubset(set(normalized)):
            return normalized, rows

    raise ValueError(f"{path}: canonical table with first header {first_header!r} not found")


def row_as_dict(header: list[str], row: list[str], path: Path) -> dict[str, str]:
    """Convert one canonical table row to a dict, rejecting malformed width."""

    if len(row) != len(header):
        raise ValueError(f"{path}: malformed table row with {len(row)} cells; expected {len(header)}")
    return dict(zip(header, row, strict=True))


def parse_dependencies(value: str) -> tuple[str, ...]:
    """Return ordered BK dependency IDs, or an empty tuple for ``-``."""

    return tuple(BK_ID_RE.findall(value))


def parse_requirements(value: str) -> tuple[str, ...]:
    """Return ordered RF/RNF or explicit transversal tokens."""

    return tuple(REQ_ID_RE.findall(value))


def macro_from_bk(bk_id: str) -> str:
    """Derive and validate the macro identifier encoded in a BK ID."""

    match = BK_ID_FULL_RE.fullmatch(bk_id)
    if not match:
        raise ValueError(f"invalid BK ID: {bk_id!r}")
    return match.group("macro")


def parse_backlog(root: Path) -> dict[str, BacklogItem]:
    """Parse all canonical BK rows from BACKLOG-MVP.md."""

    path = root / BACKLOG_PATH
    items: dict[str, BacklogItem] = {}
    required = {"owner", "apoio", "pri", "estado", "esforco", "dependencias", "rf/rnf"}

    for raw_header, rows in parse_markdown_tables(path):
        header = [normalize_header(cell) for cell in raw_header]
        if not header or header[0] != "bk" or not required.issubset(set(header)):
            continue
        for row in rows:
            values = row_as_dict(header, row, path)
            bk_id = values["bk"]
            if not BK_ID_FULL_RE.fullmatch(bk_id):
                raise ValueError(f"{path}: invalid backlog BK ID {bk_id!r}")
            if bk_id in items:
                raise ValueError(f"{path}: duplicate backlog row for {bk_id}")

            items[bk_id] = BacklogItem(
                bk_id=bk_id,
                macro=macro_from_bk(bk_id),
                owner=values["owner"],
                support=values["apoio"],
                priority=values["pri"],
                state=values["estado"],
                effort=values["esforco"],
                dependencies=parse_dependencies(values["dependencias"]),
                requirements=parse_requirements(values["rf/rnf"]),
            )

    if not items:
        raise ValueError(f"{path}: no BK rows found")
    return items


def parse_guide_header(root: Path, path: Path) -> GuideHeader:
    """Parse every mandatory contract field from one BK guide header."""

    values: dict[str, str] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        match = HEADER_RE.match(line)
        if match:
            values[match.group("key")] = match.group("value").strip()
        if line.startswith("## Bloco pedagogico") or line.startswith("#### Objetivo"):
            break

    required_fields = [
        "bk_id",
        "macro",
        "owner",
        "apoio",
        "prioridade",
        "estado",
        "esforco",
        "dependencias",
        "rf_rnf",
        "fase_documental",
        "sprint",
        "core_or_reforco",
        "proximo_bk",
        "guia_path",
        "last_updated",
    ]
    missing = [field for field in required_fields if field not in values]
    if missing:
        relative = path.relative_to(root)
        raise ValueError(f"{relative}: missing guide header fields: {', '.join(missing)}")

    return GuideHeader(
        path=path.relative_to(root),
        bk_id=values["bk_id"],
        macro=values["macro"],
        owner=values["owner"],
        support=values["apoio"],
        priority=values["prioridade"],
        state=values["estado"],
        effort=values["esforco"],
        dependencies=parse_dependencies(values["dependencias"]),
        requirements=parse_requirements(values["rf_rnf"]),
        sprint=values["sprint"],
        core_or_reinforcement=values["core_or_reforco"],
        next_bk=values["proximo_bk"],
        guide_path=values["guia_path"],
    )


def collect_guides(root: Path) -> dict[str, GuideHeader]:
    """Collect all public BK guide headers under ``guias-bk/MF*/``."""

    guides: dict[str, GuideHeader] = {}
    for path in sorted((root / GUIDES_ROOT).glob("MF*/BK-*.md")):
        header = parse_guide_header(root, path)
        if header.bk_id in guides:
            raise ValueError(f"duplicate guide header for {header.bk_id}: {guides[header.bk_id].path} and {header.path}")
        guides[header.bk_id] = header
    return guides


def parse_annex(root: Path) -> dict[str, AnnexItem]:
    """Parse the complete derived BK/sprint/owner annex."""

    path = root / ANNEX_PATH
    header, rows = find_table(
        path,
        "bk_id",
        {
            "macro",
            "sprint",
            "owner",
            "apoio",
            "prioridade",
            "core_or_reforco",
            "rf_rnf",
            "dependencias",
            "guia_path",
        },
    )
    items: dict[str, AnnexItem] = {}

    for row in rows:
        values = row_as_dict(header, row, path)
        bk_id = values["bk_id"]
        if not BK_ID_FULL_RE.fullmatch(bk_id):
            raise ValueError(f"{path}: invalid annex BK ID {bk_id!r}")
        if bk_id in items:
            raise ValueError(f"{path}: duplicate annex row for {bk_id}")
        items[bk_id] = AnnexItem(
            bk_id=bk_id,
            macro=values["macro"],
            sprint=values["sprint"],
            owner=values["owner"],
            support=values["apoio"],
            priority=values["prioridade"],
            core_or_reinforcement=values["core_or_reforco"],
            requirements=parse_requirements(values["rf_rnf"]),
            dependencies=parse_dependencies(values["dependencias"]),
            guide_path=values["guia_path"],
        )
    return items


def expand_sprint_targets(value: str) -> list[str]:
    """Expand the explicit BK lists/ranges used in the sprint calendar."""

    expanded: list[str] = []
    for raw_part in value.split(","):
        part = clean_cell(raw_part)
        range_match = SPRINT_RANGE_RE.fullmatch(part)
        if range_match:
            start = int(range_match.group("start"))
            end = int(range_match.group("end"))
            if end < start:
                raise ValueError(f"descending BK range in sprint plan: {part!r}")
            expanded.extend(f"BK-{range_match.group('macro')}-{number:02d}" for number in range(start, end + 1))
            continue

        identifiers = BK_ID_RE.findall(part)
        if identifiers:
            expanded.extend(identifiers)
            continue
        raise ValueError(f"unrecognized sprint target: {part!r}")
    return expanded


def parse_sprint_plan(root: Path) -> tuple[dict[str, str], list[str]]:
    """Return canonical BK-to-sprint allocation and linear table order."""

    path = root / SPRINT_PLAN_PATH
    header, rows = find_table(path, "sprint", {"bks alvo", "carga alvo"})
    allocation: dict[str, str] = {}
    order: list[str] = []

    for row in rows:
        values = row_as_dict(header, row, path)
        sprint_match = SPRINT_LABEL_RE.fullmatch(values["sprint"])
        if not sprint_match:
            raise ValueError(f"{path}: invalid sprint label {values['sprint']!r}")
        sprint = f"S{int(sprint_match.group('number')):02d}"
        for bk_id in expand_sprint_targets(values["bks alvo"]):
            if bk_id in allocation:
                raise ValueError(f"{path}: {bk_id} allocated to both {allocation[bk_id]} and {sprint}")
            allocation[bk_id] = sprint
            order.append(bk_id)

    return allocation, order


def parse_contract_snapshot(root: Path) -> dict[str, tuple[str, str, tuple[str, ...], tuple[str, ...]]]:
    """Parse the BK field contract snapshot for anti-drift comparison."""

    path = root / CONTRACT_PATH
    header, rows = find_table(path, "bk_id", {"owner", "prioridade", "dependencias", "rf_rnf"})
    result: dict[str, tuple[str, str, tuple[str, ...], tuple[str, ...]]] = {}
    for row in rows:
        values = row_as_dict(header, row, path)
        bk_id = values["bk_id"]
        if bk_id in result:
            raise ValueError(f"{path}: duplicate contract row for {bk_id}")
        result[bk_id] = (
            values["owner"],
            values["prioridade"],
            parse_dependencies(values["dependencias"]),
            parse_requirements(values["rf_rnf"]),
        )
    return result


def parse_matrix(root: Path) -> dict[str, MatrixItem]:
    """Parse the one-row-per-active-requirement canonical matrix."""

    path = root / MATRIX_PATH
    header, rows = find_table(
        path,
        "requisito",
        {
            "bk_id",
            "macro",
            "owner",
            "prioridade",
            "criterio_mensuravel",
            "evidence_minima",
            "status_validacao",
        },
    )
    matrix: dict[str, MatrixItem] = {}
    for row in rows:
        values = row_as_dict(header, row, path)
        requirement = values["requisito"]
        if not ACTIVE_REQ_RE.fullmatch(requirement):
            raise ValueError(f"{path}: invalid requirement row {requirement!r}")
        if requirement in matrix:
            raise ValueError(f"{path}: duplicate primary row for {requirement}")
        matrix[requirement] = MatrixItem(
            requirement=requirement,
            bk_id=values["bk_id"],
            macro=values["macro"],
            owner=values["owner"],
            priority=values["prioridade"],
            measurable_criterion=values["criterio_mensuravel"],
            minimum_evidence=values["evidence_minima"],
            validation_status=values["status_validacao"],
        )
    return matrix


def parse_requirement_annex(
    root: Path,
    relative_path: Path,
    expected_prefix: str,
) -> dict[str, tuple[str, ...]]:
    """Parse one RF/RNF-to-BKs annex, enforcing its requirement namespace."""

    path = root / relative_path
    header, rows = find_table(path, "requisito", {"bks", "total_bks"})
    mapping: dict[str, tuple[str, ...]] = {}
    for row in rows:
        values = row_as_dict(header, row, path)
        requirement = values["requisito"]
        if (
            not ACTIVE_REQ_RE.fullmatch(requirement)
            or not requirement.startswith(expected_prefix)
        ):
            raise ValueError(f"{path}: invalid annex requirement {requirement!r}")
        if requirement in mapping:
            raise ValueError(f"{path}: duplicate annex row for {requirement}")
        bks = tuple(BK_ID_RE.findall(values["bks"]))
        try:
            declared_total = int(values["total_bks"])
        except ValueError as error:
            raise ValueError(f"{path}: invalid total_bks for {requirement}") from error
        if declared_total != len(bks):
            raise ValueError(f"{path}: {requirement} declares {declared_total} BKs but lists {len(bks)}")
        mapping[requirement] = bks
    return mapping


def parse_active_requirements(root: Path) -> set[str]:
    """Return the active RF/RNF identifiers declared in RF.md and RNF.md."""

    requirements: set[str] = set()
    for relative_path in (RF_PATH, RNF_PATH):
        requirements.update(ACTIVE_REQ_RE.findall((root / relative_path).read_text(encoding="utf-8")))
    return requirements


def parse_mf_views(root: Path) -> tuple[dict[str, list[str]], dict[str, dict[str, str]]]:
    """Parse each MF sequence and its guide-link view from MF-VIEWS.md."""

    path = root / MF_VIEWS_PATH
    lines = path.read_text(encoding="utf-8").splitlines()
    sequences: dict[str, list[str]] = {}
    links: dict[str, dict[str, str]] = {}
    current_macro: str | None = None
    subsection: str | None = None

    for line in lines:
        macro_match = re.match(r"^## (MF\d+)\b", line)
        if macro_match:
            current_macro = macro_match.group(1)
            if current_macro in sequences:
                raise ValueError(f"{path}: duplicate section for {current_macro}")
            sequences[current_macro] = []
            links[current_macro] = {}
            subsection = None
            continue

        if current_macro is None:
            continue
        if line == "### Sequencia":
            subsection = "sequence"
            continue
        if line == "### Guias disponiveis":
            subsection = "links"
            continue
        if line.startswith("### "):
            subsection = None
            continue

        if subsection == "sequence":
            match = re.match(r"^\d+\. `(?P<bk>BK-MF\d+-\d{2})`", line)
            if match:
                sequences[current_macro].append(match.group("bk"))
        elif subsection == "links":
            match = re.match(r"^- `(?P<bk>BK-MF\d+-\d{2})`: `(?P<path>[^`]+)`", line)
            if match:
                bk_id = match.group("bk")
                if bk_id in links[current_macro]:
                    raise ValueError(f"{path}: duplicate guide link for {bk_id}")
                links[current_macro][bk_id] = match.group("path")

    return sequences, links


def make_error(field: str, expected: object, actual: object, bk_id: str = "-") -> dict[str, str]:
    """Build one stable machine-readable validation error."""

    return {
        "bk_id": bk_id,
        "field": field,
        "expected": str(expected),
        "actual": str(actual),
    }


def join_values(values: tuple[str, ...] | list[str]) -> str:
    """Render ordered identifiers consistently in validator output."""

    return ",".join(values)


def core_or_reinforcement_for_priority(priority: str) -> str:
    """Derive the pedagogical lane declared by the planning contract."""

    return "Reforco" if priority == "P0" else "Core"


def compare_backlog_and_guides(
    backlog: dict[str, BacklogItem],
    guides: dict[str, GuideHeader],
    sprint_allocation: dict[str, str],
    canonical_order: list[str],
) -> list[dict[str, str]]:
    """Validate guide headers against backlog and sprint-plan sources."""

    errors: list[dict[str, str]] = []
    next_by_bk = {
        bk_id: canonical_order[index + 1] if index + 1 < len(canonical_order) else "-"
        for index, bk_id in enumerate(canonical_order)
    }

    for bk_id, item in sorted(backlog.items()):
        guide = guides.get(bk_id)
        if guide is None:
            errors.append(make_error("guide", "existing guide", "missing", bk_id))
            continue

        comparisons: list[tuple[str, object, object]] = [
            ("owner", item.owner, guide.owner),
            ("apoio", item.support, guide.support),
            ("prioridade", item.priority, guide.priority),
            ("estado", item.state, guide.state),
            ("esforco", item.effort, guide.effort),
            ("dependencias", join_values(item.dependencies), join_values(guide.dependencies)),
            ("rf_rnf", join_values(item.requirements), join_values(guide.requirements)),
            ("macro", item.macro, guide.macro),
            ("sprint", sprint_allocation.get(bk_id, "missing"), guide.sprint),
            (
                "core_or_reforco",
                core_or_reinforcement_for_priority(item.priority),
                guide.core_or_reinforcement,
            ),
            ("proximo_bk", next_by_bk.get(bk_id, "missing"), guide.next_bk),
            ("guia_path", guide.path.as_posix(), guide.guide_path),
        ]
        for field, expected, actual in comparisons:
            if expected != actual:
                errors.append(make_error(field, expected, actual, bk_id))

        for dependency in guide.dependencies:
            if dependency not in backlog:
                errors.append(make_error("dependencias", "existing BK", dependency, bk_id))

    for bk_id, guide in sorted(guides.items()):
        if bk_id not in backlog:
            errors.append(make_error("backlog", "listed in backlog", guide.path, bk_id))
    return errors


def compare_annex(
    backlog: dict[str, BacklogItem],
    guides: dict[str, GuideHeader],
    annex: dict[str, AnnexItem],
    sprint_allocation: dict[str, str],
) -> list[dict[str, str]]:
    """Validate the BK/sprint/owner annex as a strictly derived view."""

    errors: list[dict[str, str]] = []
    for bk_id, item in sorted(backlog.items()):
        row = annex.get(bk_id)
        if row is None:
            errors.append(make_error("annex.row", "existing row", "missing", bk_id))
            continue
        guide = guides.get(bk_id)
        expected_path = guide.path.as_posix() if guide else "missing guide"
        comparisons: list[tuple[str, object, object]] = [
            ("annex.macro", item.macro, row.macro),
            ("annex.sprint", sprint_allocation.get(bk_id, "missing"), row.sprint),
            ("annex.owner", item.owner, row.owner),
            ("annex.apoio", item.support, row.support),
            ("annex.prioridade", item.priority, row.priority),
            (
                "annex.core_or_reforco",
                core_or_reinforcement_for_priority(item.priority),
                row.core_or_reinforcement,
            ),
            ("annex.rf_rnf", join_values(item.requirements), join_values(row.requirements)),
            ("annex.dependencias", join_values(item.dependencies), join_values(row.dependencies)),
            ("annex.guia_path", expected_path, row.guide_path),
        ]
        for field, expected, actual in comparisons:
            if expected != actual:
                errors.append(make_error(field, expected, actual, bk_id))

    for bk_id in sorted(set(annex) - set(backlog)):
        errors.append(make_error("annex.backlog", "listed in backlog", "extra row", bk_id))
    return errors


def compare_contract_snapshot(
    backlog: dict[str, BacklogItem],
    snapshot: dict[str, tuple[str, str, tuple[str, ...], tuple[str, ...]]],
) -> list[dict[str, str]]:
    """Validate CONTRATO-CAMPOS-BK's declared canonical snapshot."""

    errors: list[dict[str, str]] = []
    for bk_id, item in sorted(backlog.items()):
        row = snapshot.get(bk_id)
        if row is None:
            errors.append(make_error("contract.row", "existing row", "missing", bk_id))
            continue
        comparisons = [
            ("contract.owner", item.owner, row[0]),
            ("contract.prioridade", item.priority, row[1]),
            ("contract.dependencias", join_values(item.dependencies), join_values(row[2])),
            ("contract.rf_rnf", join_values(item.requirements), join_values(row[3])),
        ]
        for field, expected, actual in comparisons:
            if expected != actual:
                errors.append(make_error(field, expected, actual, bk_id))
    for bk_id in sorted(set(snapshot) - set(backlog)):
        errors.append(make_error("contract.backlog", "listed in backlog", "extra row", bk_id))
    return errors


def build_requirement_mapping(backlog: dict[str, BacklogItem]) -> dict[str, tuple[str, ...]]:
    """Derive complete active requirement coverage from backlog BK rows."""

    mapping: dict[str, list[str]] = defaultdict(list)
    for bk_id, item in backlog.items():
        for requirement in item.requirements:
            if ACTIVE_REQ_RE.fullmatch(requirement):
                mapping[requirement].append(bk_id)
    return {requirement: tuple(bks) for requirement, bks in mapping.items()}


def compare_traceability(
    backlog: dict[str, BacklogItem],
    matrix: dict[str, MatrixItem],
    active_requirements: set[str],
    rf_annex: dict[str, tuple[str, ...]],
    rnf_annex: dict[str, tuple[str, ...]],
) -> list[dict[str, str]]:
    """Validate matrix metadata and complete RF/RNF derived annex coverage."""

    errors: list[dict[str, str]] = []
    declared_by_backlog = build_requirement_mapping(backlog)
    annex = {**rf_annex, **rnf_annex}

    for requirement in sorted(active_requirements):
        row = matrix.get(requirement)
        if row is None:
            errors.append(make_error("matrix.requirement", "one primary row", "missing", requirement))
        else:
            bk = backlog.get(row.bk_id)
            if bk is None:
                errors.append(make_error("matrix.bk_id", "existing BK", row.bk_id, requirement))
            else:
                comparisons = [
                    ("matrix.macro", bk.macro, row.macro),
                    ("matrix.owner", bk.owner, row.owner),
                    ("matrix.prioridade", bk.priority, row.priority),
                ]
                for field, expected, actual in comparisons:
                    if expected != actual:
                        errors.append(make_error(field, expected, actual, requirement))
                if row.bk_id not in annex.get(requirement, ()):
                    errors.append(
                        make_error(
                            "matrix.coverage",
                            "primary BK present in requirement annex",
                            row.bk_id,
                            requirement,
                        ),
                    )

        expected_bks = list(declared_by_backlog.get(requirement, ()))
        if row is not None and row.bk_id not in expected_bks:
            expected_bks.append(row.bk_id)
        expected_bks_tuple = tuple(expected_bks)
        actual_bks = annex.get(requirement)
        if actual_bks is None:
            errors.append(make_error("requirement_annex.row", "existing row", "missing", requirement))
        elif actual_bks != expected_bks_tuple:
            errors.append(
                make_error(
                    "requirement_annex.bks",
                    join_values(expected_bks_tuple),
                    join_values(actual_bks),
                    requirement,
                ),
            )

        if actual_bks is not None:
            for bk_id in actual_bks:
                if bk_id not in backlog:
                    errors.append(make_error("requirement_annex.bk_id", "existing BK", bk_id, requirement))

    for requirement in sorted(set(matrix) - active_requirements):
        errors.append(make_error("matrix.requirement", "active RF/RNF", "extra row", requirement))
    for requirement in sorted(set(annex) - active_requirements):
        errors.append(make_error("requirement_annex.requirement", "active RF/RNF", "extra row", requirement))
    for requirement in sorted(set(declared_by_backlog) - active_requirements):
        errors.append(make_error("backlog.requirement", "declared in RF.md/RNF.md", "unknown", requirement))
    return errors


def compare_mf_views(
    root: Path,
    backlog: dict[str, BacklogItem],
    guides: dict[str, GuideHeader],
    canonical_order: list[str],
    sequences: dict[str, list[str]],
    links: dict[str, dict[str, str]],
) -> list[dict[str, str]]:
    """Validate MF-VIEWS sequence/link sections against sprint-plan order."""

    errors: list[dict[str, str]] = []
    expected_by_macro: dict[str, list[str]] = defaultdict(list)
    for bk_id in canonical_order:
        if bk_id in backlog:
            expected_by_macro[backlog[bk_id].macro].append(bk_id)

    for macro in sorted({item.macro for item in backlog.values()}):
        expected_sequence = expected_by_macro[macro]
        actual_sequence = sequences.get(macro)
        if actual_sequence is None:
            errors.append(make_error("mf_views.sequence", join_values(expected_sequence), "missing", macro))
        elif expected_sequence != actual_sequence:
            errors.append(
                make_error(
                    "mf_views.sequence",
                    join_values(expected_sequence),
                    join_values(actual_sequence),
                    macro,
                ),
            )

        macro_links = links.get(macro, {})
        for bk_id in expected_sequence:
            guide = guides.get(bk_id)
            if guide is None:
                continue
            expected_relative = Path("../guias-bk") / guide.path.relative_to(GUIDES_ROOT)
            actual_relative = macro_links.get(bk_id)
            if actual_relative != expected_relative.as_posix():
                errors.append(
                    make_error(
                        "mf_views.guide_path",
                        expected_relative.as_posix(),
                        actual_relative or "missing",
                        bk_id,
                    ),
                )
            elif not ((root / MF_VIEWS_PATH).parent / actual_relative).resolve().is_file():
                errors.append(make_error("mf_views.guide_exists", "existing file", actual_relative, bk_id))

        for bk_id in sorted(set(macro_links) - set(expected_sequence)):
            errors.append(make_error("mf_views.guide", "BK in macro sequence", "extra link", bk_id))

    for macro in sorted(set(sequences) - set(expected_by_macro)):
        errors.append(make_error("mf_views.macro", "macro in backlog", "extra section", macro))
    return errors


def validate_backlog_domains(backlog: dict[str, BacklogItem]) -> list[dict[str, str]]:
    """Validate enumerated backlog fields and its macro-state snapshot."""

    errors: list[dict[str, str]] = []
    for bk_id, item in sorted(backlog.items()):
        domains = [
            ("backlog.prioridade", ALLOWED_PRIORITIES, item.priority),
            ("backlog.estado", ALLOWED_STATES, item.state),
            ("backlog.esforco", ALLOWED_EFFORTS, item.effort),
        ]
        for field, allowed, actual in domains:
            if actual not in allowed:
                errors.append(make_error(field, "|".join(sorted(allowed)), actual, bk_id))
    return errors


def validate_macro_state_snapshot(root: Path, backlog: dict[str, BacklogItem]) -> list[dict[str, str]]:
    """Validate the backlog's macro progress/state summary from BK states."""

    path = root / BACKLOG_PATH
    header, rows = find_table(path, "macro", {"estado", "progresso"})
    actual: dict[str, tuple[str, str]] = {}
    for row in rows:
        values = row_as_dict(header, row, path)
        actual[values["macro"]] = (values["estado"], values["progresso"])

    grouped: dict[str, list[str]] = defaultdict(list)
    for item in backlog.values():
        grouped[item.macro].append(item.state)

    errors: list[dict[str, str]] = []
    for macro, states in sorted(grouped.items()):
        done = states.count("DONE")
        expected_progress = f"{done}/{len(states)}"
        if done == len(states):
            expected_state = "DONE"
        elif all(state == "TODO" for state in states):
            expected_state = "TODO"
        elif "IN_PROGRESS" in states:
            expected_state = "IN_PROGRESS"
        elif "BLOCKED" in states:
            expected_state = "BLOCKED"
        else:
            expected_state = "IN_PROGRESS"

        row = actual.get(macro)
        if row is None:
            errors.append(make_error("macro_state.row", "existing row", "missing", macro))
            continue
        if row[0] != expected_state:
            errors.append(make_error("macro_state.estado", expected_state, row[0], macro))
        if row[1] != expected_progress:
            errors.append(make_error("macro_state.progresso", expected_progress, row[1], macro))
    for macro in sorted(set(actual) - set(grouped)):
        errors.append(make_error("macro_state.macro", "macro in backlog", "extra row", macro))
    return errors


def validate_matrix_quality(matrix: dict[str, MatrixItem]) -> list[dict[str, str]]:
    """Reject empty, repeated or generic matrix acceptance contracts."""

    errors: list[dict[str, str]] = []
    criteria_seen: dict[str, str] = {}
    evidence_seen: dict[str, str] = {}

    for requirement, item in sorted(matrix.items()):
        criterion = item.measurable_criterion.strip()
        evidence = item.minimum_evidence.strip()
        status = item.validation_status.strip()

        if len(criterion) < 40 or MATRIX_BOILERPLATE_RE.search(normalize_semantic(criterion)):
            errors.append(
                make_error(
                    "matrix.criterio_mensuravel",
                    "specific observable condition with threshold or state",
                    criterion or "empty",
                    requirement,
                ),
            )
        if len(evidence) < 40 or MATRIX_BOILERPLATE_RE.search(normalize_semantic(evidence)):
            errors.append(
                make_error(
                    "matrix.evidence_minima",
                    "specific pr/proof/neg evidence and negative scenario",
                    evidence or "empty",
                    requirement,
                ),
            )
        if not MATRIX_STATUS_RE.fullmatch(status):
            errors.append(
                make_error(
                    "matrix.status_validacao",
                    "allowed validation status with optional S4/S8/S12/S13 gate",
                    status or "empty",
                    requirement,
                ),
            )

        normalized_criterion = normalize_semantic(criterion)
        if normalized_criterion in criteria_seen:
            errors.append(
                make_error(
                    "matrix.criterio_mensuravel",
                    f"criterion unique to {requirement}",
                    f"duplicates {criteria_seen[normalized_criterion]}",
                    requirement,
                ),
            )
        elif normalized_criterion:
            criteria_seen[normalized_criterion] = requirement

        normalized_evidence = normalize_semantic(evidence)
        if normalized_evidence in evidence_seen:
            errors.append(
                make_error(
                    "matrix.evidence_minima",
                    f"evidence unique to {requirement}",
                    f"duplicates {evidence_seen[normalized_evidence]}",
                    requirement,
                ),
            )
        elif normalized_evidence:
            evidence_seen[normalized_evidence] = requirement

    return errors


def validate_one_document_metadata(
    root: Path,
    relative_path: Path,
    expected_status: str | None = None,
    expected_lane: str | None = None,
) -> list[dict[str, str]]:
    """Validate status, snapshot, audience, authority and proof scope."""

    path = root / relative_path
    if not path.is_file():
        return [make_error("document_metadata.document", "existing document", "missing", relative_path.as_posix())]

    metadata = parse_document_metadata(path)
    errors: list[dict[str, str]] = []
    required = ("document_status", "snapshot_date", "implementation_lane", "current_authority", "proof_scope")
    for field in required:
        if not metadata.get(field):
            errors.append(make_error(f"document_metadata.{field}", "non-empty metadata", "missing", relative_path.as_posix()))

    status = metadata.get("document_status", "")
    lane = metadata.get("implementation_lane", "")
    snapshot_date = metadata.get("snapshot_date", "")
    authority = metadata.get("current_authority", "")
    proof_scope = metadata.get("proof_scope", "")

    if status not in ALLOWED_DOCUMENT_STATUSES:
        errors.append(
            make_error(
                "document_metadata.status",
                "CURRENT|HISTORICAL_SNAPSHOT|SUPERSEDED",
                status or "missing",
                relative_path.as_posix(),
            ),
        )
    if expected_status is not None and status != expected_status:
        errors.append(make_error("document_metadata.status", expected_status, status or "missing", relative_path.as_posix()))
    if lane not in ALLOWED_IMPLEMENTATION_LANES:
        errors.append(
            make_error(
                "document_metadata.lane",
                "STUDENT|REFERENCE",
                lane or "missing",
                relative_path.as_posix(),
            ),
        )
    if expected_lane is not None and lane != expected_lane:
        errors.append(make_error("document_metadata.lane", expected_lane, lane or "missing", relative_path.as_posix()))

    if status in {"HISTORICAL_SNAPSHOT", "SUPERSEDED"}:
        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", snapshot_date):
            errors.append(
                make_error(
                    "document_metadata.snapshot_date",
                    "YYYY-MM-DD for historical/superseded documents",
                    snapshot_date or "missing",
                    relative_path.as_posix(),
                ),
            )
    elif status == "CURRENT" and snapshot_date != "-" and not re.fullmatch(r"\d{4}-\d{2}-\d{2}", snapshot_date):
        errors.append(
            make_error(
                "document_metadata.snapshot_date",
                "- or YYYY-MM-DD",
                snapshot_date or "missing",
                relative_path.as_posix(),
            ),
        )

    if authority and not (root / authority).is_file():
        errors.append(
            make_error(
                "document_metadata.current_authority",
                "existing repository document",
                authority,
                relative_path.as_posix(),
            ),
        )
    if proof_scope and len(proof_scope) < 20:
        errors.append(
            make_error(
                "document_metadata.proof_scope",
                "specific scope and limitation",
                proof_scope,
                relative_path.as_posix(),
            ),
        )
    return errors


def validate_document_metadata(root: Path) -> list[dict[str, str]]:
    """Validate all active evidence plus current priority audit reports."""

    errors: list[dict[str, str]] = []
    evidence_root = root / EVIDENCE_ROOT
    if evidence_root.exists():
        for path in sorted(evidence_root.rglob("*.md")):
            relative_to_evidence = path.relative_to(evidence_root)
            relative_path = path.relative_to(root)
            is_archive = any(part.lower() in ARCHIVE_PARTS for part in relative_to_evidence.parts[:-1])
            expected_status = None
            expected_lane = "REFERENCE" if relative_path in REFERENCE_EVIDENCE_PATHS or is_archive else None
            if is_archive:
                expected_status = "CURRENT" if path.name == "README.md" else "SUPERSEDED"
            errors.extend(
                validate_one_document_metadata(
                    root,
                    relative_path,
                    expected_status=expected_status,
                    expected_lane=expected_lane,
                ),
            )
            metadata = parse_document_metadata(path)
            if not is_archive and metadata.get("implementation_lane") == "STUDENT":
                private_match = PUBLIC_GUIDE_PATH_RE.search(path.read_text(encoding="utf-8"))
                if private_match:
                    errors.append(
                        make_error(
                            "document_metadata.lane",
                            "STUDENT evidence without private reference paths",
                            private_match.group(0),
                            relative_path.as_posix(),
                        ),
                    )

    validated_reports: set[Path] = set()
    report_prefixes = ("AUDITORIA-", "CORRECAO-AUDITORIA-", "IMPLEMENTACAO-", "VALIDACAO-")
    for path in sorted((root / GUIDES_ROOT).glob("*.md")):
        if not path.name.startswith(report_prefixes):
            continue
        relative_path = path.relative_to(root)
        expected_status: str | None = None
        expected_lane: str | None = "REFERENCE" if "real_dev" in path.name.lower() else None
        if relative_path in PRIORITY_REPORT_METADATA:
            expected_status, expected_lane = PRIORITY_REPORT_METADATA[relative_path]
        errors.extend(
            validate_one_document_metadata(
                root,
                relative_path,
                expected_status=expected_status,
                expected_lane=expected_lane,
            ),
        )
        validated_reports.add(relative_path)

    for relative_path, (expected_status, expected_lane) in PRIORITY_REPORT_METADATA.items():
        if relative_path in validated_reports:
            continue
        errors.extend(
            validate_one_document_metadata(
                root,
                relative_path,
                expected_status=expected_status,
                expected_lane=expected_lane,
            ),
        )
    return errors


def validate_hybrid_boundaries_and_reference_comparisons(root: Path) -> list[dict[str, str]]:
    """Require machine-visible snapshot boundaries and explicit comparison lanes."""

    errors: list[dict[str, str]] = []
    for relative_path in HYBRID_DOCUMENT_PATHS:
        path = root / relative_path
        if not path.is_file():
            errors.append(make_error("document_metadata.boundary", "existing hybrid document", f"missing: {relative_path}"))
            continue
        text = path.read_text(encoding="utf-8")
        boundaries = re.findall(r"^## Snapshot histórico\b.*$", text, re.MULTILINE)
        if len(boundaries) != 1:
            errors.append(
                make_error(
                    "document_metadata.boundary",
                    "exactly one H2 Snapshot histórico boundary",
                    f"{relative_path}: found={len(boundaries)}",
                ),
            )

    for relative_path in CURRENT_HYBRID_DOCUMENT_PATHS:
        path = root / relative_path
        if not path.is_file():
            errors.append(
                make_error(
                    "document_metadata.boundary",
                    "existing CURRENT hybrid document",
                    f"missing: {relative_path}",
                ),
            )
            continue
        text = path.read_text(encoding="utf-8")
        status_is_current = "- `document_status`: `CURRENT`" in text
        boundaries = re.findall(r"^## .*Snapshot histórico\b.*$", text, re.MULTILINE | re.IGNORECASE)
        if not status_is_current or not boundaries:
            errors.append(
                make_error(
                    "document_metadata.boundary",
                    "CURRENT hybrid with at least one explicit H2 Snapshot histórico boundary",
                    f"{relative_path}: current={status_is_current}; boundaries={len(boundaries)}",
                ),
            )

    policy_markers = {
        PLANNING_README_PATH: ("comparison_lane: REFERENCE", "target_lane: STUDENT"),
        EVIDENCE_ROOT / "README.md": ("comparison_lane: REFERENCE", "target_lane: STUDENT"),
    }
    for relative_path, required_policy_markers in policy_markers.items():
        policy_text = (root / relative_path).read_text(encoding="utf-8")
        missing_policy_markers = [
            marker for marker in required_policy_markers if marker not in policy_text
        ]
        if missing_policy_markers:
            errors.append(
                make_error(
                    "document_metadata.comparison_lane",
                    "comparison_lane and target_lane policy markers",
                    f"{relative_path}: missing={','.join(missing_policy_markers)}",
                ),
            )

    for relative_path in STUDENT_REFERENCE_COMPARISON_PATHS:
        text = (root / relative_path).read_text(encoding="utf-8")
        required = (
            "- `implementation_lane`: `STUDENT`",
            "- `implementation_root`: `real_dev`",
            "- `comparison_lane`: `REFERENCE`",
            "- `target_lane`: `STUDENT`",
            "## Fronteira entre lanes neste snapshot",
        )
        missing = [marker for marker in required if marker not in text]
        if missing:
            errors.append(
                make_error(
                    "document_metadata.comparison_lane",
                    "STUDENT target with explicit REFERENCE comparison boundary",
                    f"{relative_path}: missing={','.join(missing)}",
                ),
            )
    return errors


def validate_rate_limit_contract(root: Path) -> list[dict[str, str]]:
    """Validate the exact normative rate-limit matrix in RNF.md."""

    path = root / RNF_PATH
    errors: list[dict[str, str]] = []
    try:
        header, rows = find_table(path, "operação", {"scope", "limite e janela"})
    except ValueError as error:
        return [make_error("rate_limit.table", "normative operation/scope/limit table", str(error))]

    actual: dict[tuple[str, str], str] = {}
    for row in rows:
        values = row_as_dict(header, row, path)
        key = (
            normalize_semantic(values["operação"]),
            normalize_semantic(values["scope"]),
        )
        if key in actual:
            errors.append(make_error("rate_limit.table", "unique operation/scope row", key))
        actual[key] = normalize_semantic(values["limite e janela"])

    expected = {
        (normalize_semantic(operation), normalize_semantic(scope)): normalize_semantic(limit)
        for (operation, scope), limit in EXPECTED_RATE_LIMITS.items()
    }
    for key, expected_limit in expected.items():
        actual_limit = actual.get(key)
        if actual_limit != expected_limit:
            errors.append(
                make_error(
                    "rate_limit.table",
                    f"{key[0]} / {key[1]} = {expected_limit}",
                    actual_limit or "missing",
                ),
            )
    for key in sorted(set(actual) - set(expected)):
        errors.append(make_error("rate_limit.table", "no undeclared rate-limit row", key))

    text = path.read_text(encoding="utf-8")
    for marker in ("HMAC SHA-256", "TTL", 'code: "RATE_LIMITED"', "Retry-After"):
        if marker not in text:
            errors.append(make_error("rate_limit.contract", marker, "missing"))
    return errors


def validate_architecture_operational_schemas(root: Path) -> list[dict[str, str]]:
    """Validate the three operational collections introduced by the audit."""

    path = root / ARCHITECTURE_PATH
    errors: list[dict[str, str]] = []
    try:
        header, rows = find_table(
            path,
            "coleção",
            {"campos/invariantes relevantes", "índices e lifecycle"},
        )
    except ValueError as error:
        return [make_error("architecture.schemas", "operational collections table", str(error))]

    collections: dict[str, tuple[str, str]] = {}
    for row in rows:
        values = row_as_dict(header, row, path)
        name = normalize_semantic(values["coleção"])
        collections[name] = (
            normalize_semantic(values["campos/invariantes relevantes"]),
            normalize_semantic(values["índices e lifecycle"]),
        )

    required_markers = {
        "sessions": (
            ("csrftokenhash", "csrftokenhashes", "quatro", "expiresat"),
            ("24 horas", "ttl"),
        ),
        "rate limit counters": (
            ("scope", "keyhash", "hmac sha 256", "expiresat"),
            ("indice unico", "ttl"),
        ),
        "scheduled jobs": (
            ("key", "status", "attempts", "leaseowner", "leaseexpiresat"),
            ("key unico",),
        ),
        "payment attempts v2": (
            (
                "schemaversion 2",
                "amountcents",
                "currency",
                "solidaritysharepercent",
                "interval",
                "approvedat",
                "cycle",
                "idempotencykey",
                "requesthash",
                "accountingestimate",
            ),
            ("unicidade idempotente", "snapshot financeiro aprovado e imutavel"),
        ),
        "contents": (
            ("version cas", "mediastatus", "pending", "ready", "failed"),
            ("isplayable true", "metadata"),
        ),
    }
    field_by_collection = {
        "sessions": "architecture.sessions",
        "rate limit counters": "architecture.rate_limit_counters",
        "scheduled jobs": "architecture.scheduled_jobs",
        "payment attempts v2": "architecture.payment_attempts",
        "contents": "architecture.contents",
    }
    for collection, (field_markers, index_markers) in required_markers.items():
        content = collections.get(collection)
        if content is None:
            errors.append(make_error(field_by_collection[collection], "documented schema row", "missing"))
            continue
        fields_content, indexes_content = content
        missing_fields = [marker for marker in field_markers if normalize_semantic(marker) not in fields_content]
        missing_indexes = [marker for marker in index_markers if normalize_semantic(marker) not in indexes_content]
        missing = [*(f"field:{marker}" for marker in missing_fields), *(f"index:{marker}" for marker in missing_indexes)]
        if missing:
            errors.append(
                make_error(
                    field_by_collection[collection],
                    f"fields={','.join(field_markers)}; indexes={','.join(index_markers)}",
                    f"missing: {', '.join(missing)}",
                ),
            )
    return errors


def validate_lifecycle_and_input_contracts(
    root: Path,
    matrix: dict[str, MatrixItem],
) -> list[dict[str, str]]:
    """Validate durable route-lifecycle and auth boundary documentation."""

    errors: list[dict[str, str]] = []
    lifecycle_documents = {
        RNF_PATH: ("ErrorBoundary", "React.lazy", "Suspense", "pathname"),
        ARCHITECTURE_PATH: ("ErrorBoundary", "React.lazy", "Suspense", "pathname"),
        GUIDES_ROOT / "MF1/BK-MF1-02-estrutura-base-frontend-componentes.md": (
            "ErrorBoundary",
            "Suspense",
            "pathname",
            "RouteLifecycle",
        ),
    }
    for relative_path, markers in lifecycle_documents.items():
        text = (root / relative_path).read_text(encoding="utf-8")
        missing = [marker for marker in markers if marker not in text]
        if missing:
            errors.append(
                make_error(
                    "lifecycle.routes",
                    ", ".join(markers),
                    f"{relative_path}: missing {', '.join(missing)}",
                ),
            )

    rf_text = (root / RF_PATH).read_text(encoding="utf-8")
    auth_text = (root / AUTH_GUIDE_PATH).read_text(encoding="utf-8")
    rf01 = matrix.get("RF01")
    if (
        "254 caracteres" not in rf_text
        or not re.search(r"value\.length\s*>\s*254", auth_text)
        or "10 e 128 caracteres" not in auth_text
        or rf01 is None
        or "254/255" not in rf01.minimum_evidence
        or "128/129" not in rf01.minimum_evidence
    ):
        errors.append(
            make_error(
                "auth.email_limit",
                "email 254/255 and password 128/129 boundaries in RF, guide and matrix",
                "incomplete boundary contract",
                "RF01",
            ),
        )
    return errors


def validate_mf_views_baseline(
    root: Path,
    backlog: dict[str, BacklogItem],
    guides: dict[str, GuideHeader],
    matrix: dict[str, MatrixItem],
    sprint_allocation: dict[str, str],
) -> list[dict[str, str]]:
    """Require the active 66/66/94/13 baseline and STUDENT audience."""

    path = root / MF_VIEWS_PATH
    text = path.read_text(encoding="utf-8")
    metadata = parse_document_metadata(path)
    expected_counts = (66, 66, 94, 13)
    actual_counts = (len(backlog), len(guides), len(matrix), len(set(sprint_allocation.values())))
    errors: list[dict[str, str]] = []
    if actual_counts != expected_counts:
        errors.append(make_error("mf_views.baseline", "66 BK / 66 guides / 94 requirements / 13 sprints", actual_counts))
    baseline_marker = "- Baseline ativa: `66 BK`, `66 guias`, `94 requisitos` e `13 sprints`."
    if baseline_marker not in text:
        errors.append(make_error("mf_views.baseline", baseline_marker, "missing"))
    if metadata.get("document_status") != "CURRENT" or metadata.get("implementation_lane") != "STUDENT":
        errors.append(
            make_error(
                "mf_views.audience",
                "CURRENT/STUDENT",
                f"{metadata.get('document_status', 'missing')}/{metadata.get('implementation_lane', 'missing')}",
            ),
        )
    return errors


def validate_public_guide_paths(root: Path) -> list[dict[str, str]]:
    """Reject private implementation roots in every public MF guide/runbook."""

    errors: list[dict[str, str]] = []
    for path in sorted((root / GUIDES_ROOT).glob("MF*/*.md")):
        relative = path.relative_to(root)
        for line_number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
            match = PUBLIC_GUIDE_PATH_RE.search(line)
            if match:
                errors.append(
                    make_error(
                        "public_guide.path",
                        "backend/ or frontend/ student path",
                        f"{relative}:{line_number}: {match.group(0)}",
                        relative.name,
                    ),
                )
    return errors


def validate_tutorial_v2_guides(root: Path) -> list[dict[str, str]]:
    """Require exact v2 headings and the seven-point contract in every step."""

    errors: list[dict[str, str]] = []
    expected = [normalize_semantic(section) for section in TUTORIAL_V2_SECTIONS]

    readme_text = (root / GUIDES_README_PATH).read_text(encoding="utf-8")
    template_text = (root / GUIDE_TEMPLATE_PATH).read_text(encoding="utf-8")
    if "`contract_version`: `tutorial-v2`" not in readme_text:
        errors.append(make_error("guide.structure", "contract_version tutorial-v2", "missing in guide README"))
    if CODELESS_STEP_MARKER not in readme_text or CODELESS_STEP_MARKER not in template_text:
        errors.append(make_error("guide.marker", CODELESS_STEP_MARKER, "missing in README or template"))

    template_headings = [
        (len(match.group("level")), normalize_semantic(match.group("title")))
        for _line_number, line in markdown_lines_outside_fences(template_text)
        if (match := re.match(r"^(?P<level>#{2,4})\s+(?P<title>.+?)\s*$", line))
    ]
    for raw_section, section in zip(TUTORIAL_V2_SECTIONS, expected, strict=True):
        if (4, section) not in template_headings:
            errors.append(
                make_error(
                    "guide.structure",
                    f"#### {raw_section} in tutorial template",
                    "missing or wrong heading level",
                    GUIDE_TEMPLATE_PATH.as_posix(),
                ),
            )

    guide_paths = sorted((root / GUIDES_ROOT).glob("MF*/BK-*.md"))
    for path in guide_paths:
        relative = path.relative_to(root)
        text = path.read_text(encoding="utf-8")
        outside_lines = markdown_lines_outside_fences(text)
        headings: list[tuple[int, int, str]] = []
        for outside_index, (_line_number, line) in enumerate(outside_lines):
            match = re.match(r"^(?P<level>#{2,4})\s+(?P<title>.+?)\s*$", line)
            if match:
                headings.append(
                    (
                        outside_index,
                        len(match.group("level")),
                        normalize_semantic(match.group("title")),
                    ),
                )

        positions: list[int] = []
        missing: list[str] = []
        duplicates: list[str] = []
        wrong_levels: list[str] = []
        unexpected_level_four = [
            heading
            for _index, level, heading in headings
            if level == 4 and heading not in expected
        ]
        for raw_section, section in zip(TUTORIAL_V2_SECTIONS, expected, strict=True):
            matching = [(index, level) for index, level, heading in headings if heading == section]
            indexes = [index for index, level in matching if level == 4]
            if matching and any(level != 4 for _index, level in matching):
                wrong_levels.append(raw_section)
            if not indexes:
                missing.append(raw_section)
            elif len(indexes) > 1:
                duplicates.append(raw_section)
                positions.append(indexes[0])
            else:
                positions.append(indexes[0])

        if missing or duplicates or wrong_levels or unexpected_level_four or positions != sorted(positions):
            actual: list[str] = []
            if missing:
                actual.append(f"missing={','.join(missing)}")
            if duplicates:
                actual.append(f"duplicates={','.join(duplicates)}")
            if wrong_levels:
                actual.append(f"wrong_level={','.join(wrong_levels)}")
            if unexpected_level_four:
                actual.append(f"unexpected={','.join(unexpected_level_four)}")
            if positions and positions != sorted(positions):
                actual.append("out_of_order")
            errors.append(
                make_error(
                    "guide.structure",
                    "16 exact #### tutorial-v2 sections once and in canonical order",
                    "; ".join(actual) or "invalid",
                    relative.as_posix(),
                ),
            )

        steps: list[tuple[int, int]] = []
        for outside_index, (_line_number, line) in enumerate(outside_lines):
            step_match = re.match(r"^### Passo (?P<number>\d+)\b", line)
            if step_match:
                steps.append((outside_index, int(step_match.group("number"))))
        if not steps:
            errors.append(make_error("guide.structure", "at least one numbered tutorial step", "missing", relative.as_posix()))
        elif [number for _index, number in steps] != list(range(1, len(steps) + 1)):
            errors.append(
                make_error(
                    "guide.structure",
                    "sequential ### Passo 1..N headings",
                    ",".join(str(number) for _index, number in steps),
                    relative.as_posix(),
                ),
            )

        tutorial_positions = [index for index, level, heading in headings if level == 4 and heading == expected[10]]
        criteria_positions = [index for index, level, heading in headings if level == 4 and heading == expected[11]]
        tutorial_start = tutorial_positions[0] if tutorial_positions else -1
        criteria_start = criteria_positions[0] if criteria_positions else len(outside_lines)
        for step_index, (start, step_number) in enumerate(steps):
            end = steps[step_index + 1][0] if step_index + 1 < len(steps) else criteria_start
            point_numbers = [
                int(match.group("number"))
                for _line_number, line in outside_lines[start + 1 : end]
                if (match := re.match(r"^(?P<number>\d+)\.\s+", line))
            ]
            if start <= tutorial_start or start >= criteria_start or point_numbers != list(range(1, 8)):
                errors.append(
                    make_error(
                        "guide.step_contract",
                        "points 1..7 once and in order inside Tutorial técnico linear",
                        f"Passo {step_number}: {','.join(str(number) for number in point_numbers) or 'missing'}",
                        relative.as_posix(),
                    ),
                )

        marker_semantic = normalize_semantic(CODELESS_STEP_MARKER)
        for line_number, line in outside_lines:
            if marker_semantic in normalize_semantic(line) and line.strip() != CODELESS_STEP_MARKER:
                errors.append(
                    make_error(
                        "guide.marker",
                        CODELESS_STEP_MARKER,
                        f"{relative}:{line_number}: {line.strip()}",
                        relative.name,
                    ),
                )
        narrative_text = "\n".join(line for _line_number, line in outside_lines)
        concurrent_match = CONCURRENT_GUIDE_CONTRACT_RE.search(normalize_semantic(narrative_text))
        if concurrent_match:
            errors.append(
                make_error(
                    "guide.concurrent_contract",
                    "one current self-contained implementation without superseding addenda",
                    concurrent_match.group(0),
                    relative.as_posix(),
                ),
            )
    return errors


def validate_embedded_evidence_templates(root: Path) -> list[dict[str, str]]:
    """Require tutorial evidence templates to teach the canonical D0 metadata."""

    errors: list[dict[str, str]] = []
    required = ("document_status", "snapshot_date", "implementation_lane", "current_authority", "proof_scope")
    for path in sorted((root / GUIDES_ROOT).glob("MF*/BK-*.md")):
        lines = path.read_text(encoding="utf-8").splitlines()
        block_start: int | None = None
        block_lines: list[str] = []
        for line_number, line in enumerate(lines, start=1):
            if block_start is None:
                if re.fullmatch(r"```(?:md|markdown)\s*", line, re.IGNORECASE):
                    block_start = line_number
                    block_lines = []
                continue
            if line.startswith("```"):
                block = "\n".join(block_lines).strip()
                semantic = normalize_semantic(block)
                is_evidence_template = block.startswith("#") and any(
                    marker in semantic
                    for marker in ("evidence", "evidencia", "resultado observado", "decisao")
                )
                if is_evidence_template:
                    missing = [field for field in required if field not in block]
                    if missing:
                        errors.append(
                            make_error(
                                "guide.evidence_metadata",
                                "all five D0 metadata fields in embedded evidence templates",
                                f"line {block_start}: missing={','.join(missing)}",
                                path.relative_to(root).as_posix(),
                            ),
                        )
                block_start = None
                block_lines = []
                continue
            block_lines.append(line)
    return errors


def validate_didactic_code_comments(root: Path) -> list[dict[str, str]]:
    """Enforce the tutorial-v2 comment budget for substantial code fences."""

    errors: list[dict[str, str]] = []
    for path in sorted((root / GUIDES_ROOT).glob("MF*/BK-*.md")):
        lines = path.read_text(encoding="utf-8").splitlines()
        block_start: int | None = None
        block_lines: list[str] = []
        for line_number, line in enumerate(lines, start=1):
            if block_start is None:
                if re.fullmatch(r"```(?:js|jsx|ts|tsx)\s*", line, re.IGNORECASE):
                    block_start = line_number
                    block_lines = []
                continue
            if line.startswith("```"):
                non_empty = [code_line for code_line in block_lines if code_line.strip()]
                required_comments = 2 if len(non_empty) >= 20 else 1 if len(non_empty) >= 8 else 0
                comment_count = sum(
                    len(re.findall(r"(?:^\s*//|/\*)", code_line))
                    for code_line in non_empty
                )
                if comment_count < required_comments:
                    errors.append(
                        make_error(
                            "guide.didactic_comments",
                            f"{required_comments} didactic comment(s) for {len(non_empty)} non-empty lines",
                            f"line {block_start}: comments={comment_count}",
                            path.relative_to(root).as_posix(),
                        ),
                    )
                block_start = None
                block_lines = []
                continue
            block_lines.append(line)
    return errors


def validate_playwright_commands(root: Path) -> list[dict[str, str]]:
    """Reject deprecated direct Playwright invocations in current student docs."""

    errors: list[dict[str, str]] = []
    paths = sorted((root / GUIDES_ROOT).glob("MF*/BK-*.md"))
    runbook = root / STUDENT_RUNBOOK_PATH
    if runbook.is_file():
        paths.append(runbook)
    for path in paths:
        relative = path.relative_to(root)
        for line_number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
            match = BARE_PLAYWRIGHT_RE.search(line)
            if match:
                errors.append(
                    make_error(
                        "playwright.command",
                        "npm exec playwright -- test",
                        f"{relative}:{line_number}: {match.group(0)}",
                        relative.name,
                    ),
                )
    return errors


def validate_runbook_manifest_commands(root: Path) -> list[dict[str, str]]:
    """Require every documented npm script to exist in its lane manifest.

    Student and private-reference runbooks have deliberately different roots.
    Validating both the prefix and the script prevents a copied command from
    silently crossing lanes or referring to a script that was never created.
    """

    errors: list[dict[str, str]] = []
    manifest_scripts: dict[Path, set[str]] = {}

    for runbook_path, allowed_prefixes in RUNBOOK_MANIFESTS.items():
        absolute_runbook = root / runbook_path
        if not absolute_runbook.is_file():
            errors.append(make_error("runbook.manifest", "existing runbook", f"missing: {runbook_path}"))
            continue

        for line_number, line in enumerate(absolute_runbook.read_text(encoding="utf-8").splitlines(), start=1):
            for match in RUNBOOK_NPM_SCRIPT_RE.finditer(line):
                prefix = match.group("prefix").rstrip("/")
                script = match.group("run") or match.group("direct")
                manifest_path = allowed_prefixes.get(prefix)
                if manifest_path is None:
                    errors.append(
                        make_error(
                            "runbook.manifest",
                            f"one of {', '.join(sorted(allowed_prefixes))}",
                            f"{runbook_path}:{line_number}: prefix={prefix}",
                        ),
                    )
                    continue

                if manifest_path not in manifest_scripts:
                    absolute_manifest = root / manifest_path
                    if not absolute_manifest.is_file():
                        errors.append(
                            make_error(
                                "runbook.manifest",
                                f"manifest for {prefix}",
                                f"missing: {manifest_path}",
                            ),
                        )
                        manifest_scripts[manifest_path] = set()
                    else:
                        try:
                            manifest = json.loads(absolute_manifest.read_text(encoding="utf-8"))
                        except (json.JSONDecodeError, OSError) as error:
                            errors.append(
                                make_error(
                                    "runbook.manifest",
                                    f"valid JSON manifest for {prefix}",
                                    f"{manifest_path}: {type(error).__name__}",
                                ),
                            )
                            manifest_scripts[manifest_path] = set()
                        else:
                            scripts = manifest.get("scripts", {})
                            manifest_scripts[manifest_path] = set(scripts) if isinstance(scripts, dict) else set()

                if script not in manifest_scripts[manifest_path]:
                    errors.append(
                        make_error(
                            "runbook.manifest",
                            f"script {script!r} in {manifest_path}",
                            f"{runbook_path}:{line_number}: missing",
                        ),
                    )
    return errors


def extract_h2_section(text: str, heading_prefix: str) -> str:
    """Return one H2 section body up to the next H2 heading."""

    normalized_prefix = normalize_semantic(heading_prefix)
    lines = text.splitlines()
    start: int | None = None
    for index, line in enumerate(lines):
        if line.startswith("## ") and normalize_semantic(line[3:]).startswith(normalized_prefix):
            start = index + 1
            break
    if start is None:
        return ""
    end = len(lines)
    for index in range(start, len(lines)):
        if lines[index].startswith("## "):
            end = index
            break
    return "\n".join(lines[start:end])


def extract_command_env(command: str, name: str) -> str | None:
    """Extract one shell-style environment assignment from a documented command."""

    match = re.search(
        rf"(?<![A-Za-z0-9_]){re.escape(name)}=(?:'(?P<single>[^']*)'|\"(?P<double>[^\"]*)\"|(?P<bare>[^\s`|]+))",
        command,
    )
    if match is None:
        return None
    return match.group("single") or match.group("double") or match.group("bare") or ""


def is_safe_documented_test_mongodb_uri(value: str | None) -> bool:
    """Accept only credential-free MongoDB URIs bound to an explicit loopback host."""

    if not value:
        return False
    try:
        parsed = urlsplit(value)
    except ValueError:
        return False
    return (
        parsed.scheme == "mongodb"
        and parsed.hostname in {"127.0.0.1", "localhost", "::1"}
        and parsed.username is None
        and parsed.password is None
    )


def validate_current_e2e_procedure(root: Path) -> list[dict[str, str]]:
    """Validate only the explicitly current E2E procedure, never snapshots."""

    errors: list[dict[str, str]] = []
    evidence_path = root / SAFE_E2E_EVIDENCE_PATH
    section = extract_h2_section(
        evidence_path.read_text(encoding="utf-8"),
        "Procedimento atual",
    )
    if not section:
        return [make_error("e2e.environment", "explicit current E2E procedure section", "missing")]

    rows: dict[str, dict[str, str]] = {}
    lines = section.splitlines()
    for index in range(len(lines) - 1):
        if not lines[index].lstrip().startswith("|"):
            continue
        header = [normalize_header(cell) for cell in split_table_row(lines[index])]
        separator = split_table_row(lines[index + 1])
        if "id" not in header or "comando" not in header or not is_separator_row(separator):
            continue
        for row_line in lines[index + 2 :]:
            if not row_line.lstrip().startswith("|"):
                break
            values = row_as_dict(header, split_table_row(row_line), evidence_path)
            rows[values["id"]] = values
        break

    expected_rows = {
        "TST-MF8-E2E-MF2-SEED": ("seed:e2e:mf2", True),
        "TST-MF8-E2E-MF2": ("e2e:mf2", False),
        "TST-MF8-E2E-MF4-SEED": ("seed:e2e:mf4", True),
        "TST-MF8-E2E-MF4": ("e2e:mf4", False),
    }
    safe_values: dict[str, tuple[str | None, str | None]] = {}
    for row_id, (script, is_seed) in expected_rows.items():
        row = rows.get(row_id)
        if row is None:
            errors.append(make_error("e2e.environment", f"safe row {row_id}", "missing"))
            continue
        command = row.get("comando", "")
        required = [
            "NODE_ENV=test",
            "TEST_MONGODB_URI=",
            "TEST_MONGODB_DB_NAME=",
            "replicaSet=",
            "_e2e",
            script,
        ]
        if is_seed:
            required.append("ALLOW_E2E_SEED=true")
        missing = [marker for marker in required if marker not in command]
        test_uri = extract_command_env(command, "TEST_MONGODB_URI")
        test_db_name = extract_command_env(command, "TEST_MONGODB_DB_NAME")
        safe_values[row_id] = (test_uri, test_db_name)
        unsafe_uri = not is_safe_documented_test_mongodb_uri(test_uri)
        unsafe_db_name = test_db_name is None or FRESH_E2E_DB_RE.fullmatch(test_db_name) is None
        if missing or NORMAL_MONGODB_ENV_RE.search(command) or unsafe_uri or unsafe_db_name:
            errors.append(
                make_error(
                    "e2e.environment",
                    "credential-free loopback TEST_MONGODB_* + replicaSet + fresh timestamped *_e2e and seed opt-in",
                    f"{row_id}: missing={','.join(missing) or '-'} normal_env={bool(NORMAL_MONGODB_ENV_RE.search(command))} unsafe_uri={unsafe_uri} unsafe_db={unsafe_db_name}",
                ),
            )

    for seed_id, browser_id in (
        ("TST-MF8-E2E-MF2-SEED", "TST-MF8-E2E-MF2"),
        ("TST-MF8-E2E-MF4-SEED", "TST-MF8-E2E-MF4"),
    ):
        if seed_id in safe_values and browser_id in safe_values and safe_values[seed_id] != safe_values[browser_id]:
            errors.append(
                make_error(
                    "e2e.environment",
                    "seed and browser use the same TEST_MONGODB_URI and TEST_MONGODB_DB_NAME",
                    f"{seed_id} != {browser_id}",
                ),
            )

    if "cada execução formal usa uma DB `_e2e` nova e exclusiva" not in section:
        errors.append(
            make_error(
                "e2e.environment",
                "a fresh exclusive *_e2e database for every formal execution until run markers are complete",
                "fresh-database rule missing",
            ),
        )

    mf9_section = extract_h2_section(
        (root / MF9_REGRESSION_EVIDENCE_PATH).read_text(encoding="utf-8"),
        "Procedimento atual para futura revalidação",
    )
    mf9_uri_matches = re.findall(
        r"TEST_MONGODB_URI=(?:'([^']*)'|\"([^\"]*)\"|([^\s`|]+))",
        mf9_section,
    )
    mf9_db_matches = re.findall(
        r"TEST_MONGODB_DB_NAME=(?:'([^']*)'|\"([^\"]*)\"|([^\s`|]+))",
        mf9_section,
    )
    mf9_uris = [next(value for value in match if value) for match in mf9_uri_matches]
    mf9_databases = [next(value for value in match if value) for match in mf9_db_matches]
    mf9_contract_ok = (
        len(mf9_uris) == 2
        and len(mf9_databases) == 2
        and len(set(mf9_uris)) == 1
        and len(set(mf9_databases)) == 1
        and is_safe_documented_test_mongodb_uri(mf9_uris[0])
        and FRESH_E2E_DB_RE.fullmatch(mf9_databases[0]) is not None
        and mf9_section.count("NODE_ENV=test") == 2
        and mf9_section.count("ALLOW_E2E_SEED=true") == 1
        and "npm run seed:e2e:mf9" in mf9_section
        and "npm run e2e:mf9" in mf9_section
        and NORMAL_MONGODB_ENV_RE.search(mf9_section) is None
        and "run ID UTC novo" in mf9_section
    )
    if not mf9_contract_ok:
        errors.append(
            make_error(
                "e2e.environment",
                "MF9 current seed/browser procedure with one fresh timestamped DB, safe URI and no normal Mongo env",
                "incomplete or unsafe MF9 current procedure",
            ),
        )

    runbook_text = (root / STUDENT_RUNBOOK_PATH).read_text(encoding="utf-8")
    for marker in ("replicaSet", "_e2e", "reuseExistingServer: false", "npm exec playwright -- test"):
        if marker not in runbook_text:
            errors.append(make_error("e2e.student_runbook", marker, "missing"))
    return errors


def extract_js_function_body(text: str, signature: str) -> str | None:
    """Extract a documented JavaScript function body by balanced braces."""

    signature_index = text.find(signature)
    if signature_index < 0:
        return None
    opening = text.find("{", signature_index + len(signature))
    if opening < 0:
        return None
    depth = 0
    for index in range(opening, len(text)):
        if text[index] == "{":
            depth += 1
        elif text[index] == "}":
            depth -= 1
            if depth == 0:
                return text[opening + 1 : index]
    return None


def validate_required_markers(
    root: Path,
    relative_path: Path,
    field: str,
    markers: tuple[str, ...],
) -> list[dict[str, str]]:
    """Require stable implementation markers in one executable guide."""

    text = (root / relative_path).read_text(encoding="utf-8")
    missing = [marker for marker in markers if marker not in text]
    if not missing:
        return []
    return [make_error(field, ", ".join(markers), f"{relative_path}: missing {', '.join(missing)}")]


def validate_critical_guide_contracts(root: Path) -> list[dict[str, str]]:
    """Reject the concrete unsafe snippets found by the documentation audit."""

    errors: list[dict[str, str]] = []
    errors.extend(
        validate_required_markers(
            root,
            API_CLIENT_GUIDE_PATH,
            "critical.api_client",
            (
                "API_REQUEST_TIMEOUT_MS = 10_000",
                "response.status === 204 || response.status === 205",
                "const CSRF_ENDPOINT",
                'error.code === "CSRF_INVALID"',
                "resolveApiBaseUrl",
            ),
        ),
    )
    api_text = (root / API_CLIENT_GUIDE_PATH).read_text(encoding="utf-8")
    if re.search(r"VITE_API_BASE_URL\s*(?:\?\?|\|\|)\s*[\"']http://localhost", api_text):
        errors.append(make_error("critical.api_client", "no localhost production fallback", "legacy fallback found"))

    errors.extend(
        validate_required_markers(
            root,
            HEALTH_GUIDE_PATH,
            "critical.health",
            (
                "READINESS_DEADLINE_MS = 500",
                'healthRouter.get("/live"',
                'healthRouter.get("/ready"',
                'healthRouter.get("/", getReadiness)',
                "X-CSRF-Token,Idempotency-Key",
                "createGracefulShutdown",
            ),
        ),
    )
    health_text = (root / HEALTH_GUIDE_PATH).read_text(encoding="utf-8")
    if 'database: "not_configured"' in health_text:
        errors.append(make_error("critical.health", "no always-green not_configured health", "legacy marker found"))

    errors.extend(
        validate_required_markers(
            root,
            SESSION_GUIDE_PATH,
            "critical.session",
            (
                'setStatus("unavailable")',
                "isUnauthorizedError",
                "setUnauthorizedHandler",
                "function isPublicUser",
                "response?.user === null",
            ),
        ),
    )
    session_text = (root / SESSION_GUIDE_PATH).read_text(encoding="utf-8")
    if "response?.user ?? null" in session_text:
        errors.append(
            make_error(
                "critical.session",
                "only an explicit 200 {user:null} establishes anonymous",
                "nullish response coercion found",
            ),
        )

    errors.extend(
        validate_required_markers(
            root,
            CATALOG_GUIDE_PATH,
            "critical.catalog_media",
            ("canonicalMediaSource", "getMediaAvailability", "function publicContent"),
        ),
    )
    catalog_text = (root / CATALOG_GUIDE_PATH).read_text(encoding="utf-8")
    public_body = extract_js_function_body(catalog_text, "function publicContent(content)")
    if public_body is None:
        errors.append(make_error("critical.catalog_media", "extractable publicContent allowlist", "missing"))
    else:
        forbidden = ("...content", "media:", "source:", "tracks:", "qualityOptions:", "playbackUrl")
        leaked = [marker for marker in forbidden if marker in public_body]
        if leaked:
            errors.append(make_error("critical.catalog_media", "strict public allowlist", f"forbidden: {', '.join(leaked)}"))
    if "redactMediaSources" in catalog_text:
        errors.append(make_error("critical.catalog_media", "allowlist without recursive redaction helper", "redactMediaSources found"))

    errors.extend(
        validate_required_markers(
            root,
            MEDIA_GUIDE_PATH,
            "critical.media_metadata",
            ("const SOURCE_FIELDS", "assertMetadataOnly", "publicTracks", "publicQualityOptions"),
        ),
    )

    for relative_path in (PRIVACY_GUIDE_PATH, FAMILY_PRIVACY_GUIDE_PATH):
        text = (root / relative_path).read_text(encoding="utf-8")
        body = extract_js_function_body(text, "export async function deleteMyAccount(userId, input)")
        if body is None:
            errors.append(make_error("critical.privacy", "extractable deleteMyAccount", f"missing in {relative_path}"))
            continue
        required = (
            "verifyPassword(password, currentUser.passwordHash)",
            "runInTransaction(async ({ db, session })",
            "passwordHash: currentUser.passwordHash",
            "CURRENT_PASSWORD_INVALID",
            "ACCOUNT_STATE_CHANGED",
        )
        missing = [marker for marker in required if marker not in body]
        if missing or "Promise.all" in body:
            errors.append(
                make_error(
                    "critical.privacy",
                    "password verification and one sequential transaction",
                    f"{relative_path}: missing={','.join(missing) or '-'} promise_all={('Promise.all' in body)}",
                ),
            )

    errors.extend(
        validate_required_markers(
            root,
            PAYMENTS_GUIDE_PATH,
            "critical.financial",
            (
                "Idempotency-Key",
                "requestHash",
                "schemaVersion: 2",
                "accountingEstimate: false",
                "runInTransaction(async ({ db, session })",
                "export async function createSimulatedCheckout",
                'forbiddenSentinels = new Set(["undefined", "null"])',
                "function headersWithIdempotencyKey",
            ),
        ),
    )
    for relative_path in (FAMILY_PLANS_GUIDE_PATH, NOTIFICATIONS_GUIDE_PATH):
        text = (root / relative_path).read_text(encoding="utf-8")
        if re.search(r"export\s+async\s+function\s+createSimulatedCheckout\b", text):
            errors.append(
                make_error(
                    "critical.financial",
                    "checkout implementation only in BK-MF4-02",
                    f"duplicate implementation in {relative_path}",
                ),
            )
    return errors


def validate_composed_tutorial_contracts(root: Path) -> list[dict[str, str]]:
    """Reject cross-BK composition regressions found during the D7 reread."""

    errors: list[dict[str, str]] = []
    contracts = (
        (
            AUTH_GUIDE_PATH,
            "composition.auth_session",
            (
                "RATE_LIMIT_PEPPER",
                "hashOpaqueToken",
                "req.session.rawToken",
                'sessionRouter.get("/csrf-token"',
                "setSessionCookie(",
                "clearSessionCookie(",
                'setStatus("unavailable")',
            ),
            ("getSessionCookieOptions", 'from "./token.js"', "req.session?.token", "mongoUri: process.env"),
        ),
        (
            GUIDES_ROOT / "MF1/BK-MF1-04-sessao-segura-backend-cookies-auth-base.md",
            "composition.csrf_retry",
            ('error.code = "CSRF_INVALID"', 'sessionRouter.get("/csrf-token"'),
            (),
        ),
        (
            GUIDES_ROOT / "MF1/BK-MF1-04-sessao-segura-backend-cookies-auth-base.md",
            "composition.origin_csrf",
            (
                "const PUBLIC_AUTH_POST_PATHS = new Set",
                'req.get("Sec-Fetch-Site")',
                "const isBrowserMutation = Boolean(origin || fetchSite)",
                'error.code = "ORIGIN_FORBIDDEN"',
                "if (isPublicAuthPost(req))",
                "if (!req.session?.isAuthenticated)",
            ),
            (),
        ),
        (
            E2E_GUIDE_PATH,
            "composition.e2e_network",
            (
                "const fixtureRoutes = new Map",
                "function parseByteRange",
                "async function fulfillFixtureWithOptionalRange",
                "installDeterministicNetworkPolicy",
                "if (!LOOPBACK_HOSTS.has(requestUrl.hostname))",
                "externalAttempts.add(",
                "policy.assertNoExternalRequests();",
                "{ auto: true }",
            ),
            (),
        ),
        (
            E2E_GUIDE_PATH,
            "composition.e2e_seed_guard",
            (
                "export function assertE2eRuntimeEnvironment",
                "export function assertE2eSeedEnvironment",
                "source.MONGODB_URI || source.MONGODB_DB_NAME",
                'parsed.searchParams.get("replicaSet")',
                "e2eFixture.suite",
                "e2eFixture.run",
                "$nor: [exactMarker]",
                "deleteMany(exactMarker)",
                'await import("mongodb")',
                'suiteId: "mf2"',
                'suiteId: "mf4"',
                'suiteId: "mf9"',
            ),
            (),
        ),
        (
            QUALITY_GUIDE_PATH,
            "composition.quality_access",
            (
                "export async function getEffectiveSubscriptionAccess",
                "if (!effectiveAccess.hasPremiumAccess)",
                'error.code = "SUBSCRIPTION_REQUIRED"',
                'lockedReason: rank > 0',
                '"Qualidade indisponível."',
                "export function assertEffectiveSubscriptionAccess",
                "effectiveAccess?.hasPremiumAccess !== true",
                "const effectiveAccess = await getEffectiveSubscriptionAccess(req.user.id);",
            ),
            (),
        ),
        (
            FAMILY_PLANS_GUIDE_PATH,
            "composition.plan_eligibility",
            (
                "export function assertPurchasablePlan",
                "export async function findPurchasablePlan",
                "async function loadCheckoutPlan",
            ),
            (),
        ),
        (
            CATALOG_GUIDE_PATH,
            "composition.catalog_quality",
            ("const PLAYABLE_QUALITY_VALUES = new Set", "declaredQuality"),
            (),
        ),
        (
            MEDIA_GUIDE_PATH,
            "composition.parental_fail_closed",
            ("PARENTAL_CLASSIFICATION_INVALID", "Number.isInteger(contentAge)"),
            ("Number(content.ageRating)",),
        ),
        (
            MEDIA_GUIDE_PATH,
            "composition.automatic_quality",
            ('MEDIA_QUALITY_VALUES = Object.freeze([\n  "",', '<option value="">Automática</option>'),
            (),
        ),
        (
            MEDIA_GUIDE_PATH,
            "composition.media_preferences",
            (
                "const contentIdRef = useRef(contentId);",
                "const playbackRequestVersionRef = useRef(0);",
                "const preferenceVersionRef = useRef(0);",
                "const preferenceOperationRef = useRef(null);",
                "const preferenceStateRef = useRef(EMPTY_PREFERENCES);",
                "const initialPreferences = canonicalPreferences(response);",
                "preferenceStateRef.current = initialPreferences;",
                "if (preferenceOperationRef.current) return;",
                "controller: new AbortController(),",
                "signal: operation.controller.signal",
                "contentIdRef.current === operation.contentId",
                "playbackRequestVersionRef.current !== refreshVersion",
                "preferenceOperationRef.current?.controller.abort();",
                "preferenceStateRef.current = previousPreferences;",
                "setPreferences(previousPreferences);",
                "setPreferenceError(toUserMessage(error));",
            ),
            (),
        ),
        (
            PRIVACY_GUIDE_PATH,
            "composition.privacy_rate_limit",
            ("privacy:delete:user", "privacy:delete:ip", "deleteAccountByUser", "deleteAccountByIp"),
            (),
        ),
        (
            EXPORT_GUIDE_PATH,
            "composition.export_security",
            (
                "const USER_EXPORT_SECTIONS = Object.freeze({",
                "function sanitizeExportValue(value, schema)",
                "Object.entries(USER_EXPORT_SECTIONS).map(async ([collectionName, schema])",
                ".find({ userId: userObjectId })",
                "exportMyData(options = {})",
                'return apiClient.get("/api/privacy/export", options);',
                "const operationRef = useRef(null);",
                "if (operationRef.current) return;",
                "const controller = new AbortController();",
                "signal: controller.signal,",
                "operationRef.current?.controller.abort();",
                "epoch !== lifecycleEpochRef.current",
                "if (operationRef.current === operation)",
                "link.click();",
            ),
            (),
        ),
        (
            METRICS_GUIDE_PATH,
            "composition.metrics_admin",
            (
                "function optionalDate(value, field, { endOfDay = false } = {})",
                'typeof value !== "string" || !ISO_DATE_PATTERN.test(value)',
                "start.toISOString().slice(0, 10) !== value",
                "const deletionRequestedInRange = {",
                "requestedAt: { $gte: from, $lte: to },",
                "const activeUserFilter = {",
                'accountStatus: "active",',
                '$or: [{ status: "active" }, { status: { $exists: false } }],',
                'count(db, "users", activeUserFilter),',
                "getAdminMetrics(filters = {}, options = {})",
                "const requestVersionRef = useRef(0);",
                "const version = ++requestVersionRef.current;",
                "signal: controller.signal,",
                "version !== requestVersionRef.current",
                "setAppliedFilters({ ...draftFilters });",
                "setRetryVersion((current) => current + 1)",
                "export async function exportMetricsCsv",
                '"/export.csv"',
                "exportCsv(filters = {}, options = {})",
                "apiClient.download(",
                "Exportar CSV",
                "metrics.catalog.published",
                "metrics.solidarity.distributedCents",
                "metrics.integrations.enabled",
            ),
            (),
        ),
        (
            INTEGRATIONS_GUIDE_PATH,
            "composition.integrations_config",
            (
                "publicConfigFields: {",
                'channel: ["in_app"],',
                "const CONTROL_CHARACTER_PATTERN =",
                "const SECRET_KEY_PATTERN =",
                "const SECRET_VALUE_PATTERN =",
                "function hasUrlUserInfo(value)",
                "export function assertPublicConfig(integrationKey, value)",
                "Object.hasOwn(allowedFields, key)",
                "raw.length > 500",
                "SECRET_VALUE_PATTERN.test(raw)",
                "hasUrlUserInfo(raw)",
                "export async function ensureIntegrationIndexes()",
                '{ unique: true, name: "integration_settings_key_unique" },',
                "return runInTransaction(async ({ db, session }) => {",
                "const update = assertIntegrationUpdate(integrationKey, input);",
                "return await persistIntegrationSetting({ ...command, upsert: true });",
                "if (error?.code !== 11000) throw error;",
                "return persistIntegrationSetting({ ...command, upsert: false });",
                "await ensureIntegrationIndexes();",
                "const [drafts, setDrafts] = useState({});",
                "Alterações por guardar",
                "function cancelDraft(integration)",
                "ConfirmDialog",
                "Guardar alterações",
            ),
            (),
        ),
        (
            WORKER_RUNBOOK_PATH,
            "composition.worker_secret",
            (
                "mongosh --nodb",
                "process.env.MONGODB_URI",
                "process.env.MONGODB_DB_NAME",
                "const inspectedDb = connectionDb.getSiblingDB(dbName);",
            ),
            ('mongosh "$MONGODB_URI/$MONGODB_DB_NAME"',),
        ),
        (
            DEMO_RUNBOOK_PATH,
            "composition.demo_runbook_reference",
            (
                "a partir de `real_dev/backend/`",
                "`real_dev/backend/scripts/series-episodes.mapping.example.json`",
            ),
            ("a partir de `backend/`",),
        ),
        (
            PERFORMANCE_GUIDE_PATH,
            "composition.performance_catalog",
            (
                "parsePublicCatalogFilters",
                "totalPages",
                "desempate `_id`",
                "const concurrentFailureStatus",
                "result.status < 200 || result.status >= 300",
            ),
            ("export function parseCatalogPagination", "export async function listPublishedCatalog"),
        ),
        (
            POOL_GUIDE_PATH,
            "composition.charities_api",
            (
                "Object.assign(charitiesApi",
                "previewDistribution(month, options = {})",
                '"/pool/distributions/:month/preview"',
                "assertDistributionPreviewToken",
                "expectedPreviewToken: previewToken",
                "POOL_PREVIEW_STALE",
            ),
            ("export const charitiesApi = {",),
        ),
        (
            CATALOG_DETAIL_GUIDE_PATH,
            "composition.catalog_detail",
            (
                'import { HttpError } from "../../utils/http-error.js";',
                "Preserva filtros, paginação e AbortSignal",
                "listPublished(",
                "getDetail(",
            ),
            (),
        ),
        (
            MEDIA_GUIDE_PATH,
            "composition.playback_api_cumulative",
            (
                "function continueWatchingQuery",
                "saveProgress(contentId, currentTimeSeconds, options = {})",
                "listContinueWatching(pagination = {}, options = {})",
                "getPreferences(options = {})",
                "savePreferences(input, options = {})",
            ),
            (),
        ),
        (
            WORKER_GUIDE_PATH,
            "composition.playback_routes",
            (
                "getPlaybackPreferences,",
                "putPlaybackPreferences,",
                'playbackRouter.get("/preferences", asyncHandler(getPlaybackPreferences));',
                'playbackRouter.put("/preferences", asyncHandler(putPlaybackPreferences));',
                'playbackRouter.get("/me/continue-watching", asyncHandler(getContinueWatching));',
                "requireActiveSubscription",
            ),
            (),
        ),
        (
            WORKER_GUIDE_PATH,
            "composition.worker_jobs",
            (
                "export async function ensureScheduledJobIndexes",
                'await jobs.createIndex({ key: 1 }, { unique: true });',
                "export async function claimScheduledJob",
                '{ status: "running", leaseExpiresAt: { $lte: now } }',
                "export async function completeScheduledJob",
                "export async function failScheduledJob",
                "export function decideSimulatedRenewal",
                "export async function processSubscriptionCycle",
                "runInTransaction(async ({ db, session })",
                "export async function runDueSubscriptionJobs",
                "export async function runBillingWorkerCycle",
                "await assertTransactionSupport({ required: true });",
                "processTarget.off(signal, handler);",
                "await closeDb();",
            ),
            ("pastDueExpiresAt", "subscription-expiry"),
        ),
        (
            POOL_GUIDE_PATH,
            "composition.pool_worker",
            (
                "const MAX_POOL_CATCHUP_MONTHS = 120;",
                "export function previousUtcMonth",
                "export async function discoverPendingPoolMonths",
                "export async function runMonthlyPoolJob",
                "const key = `pool:${month}`;",
                "await registerScheduledJob({",
                "const claimed = await claimScheduledJob({",
                "const completed = await completeScheduledJob({",
                "const failedByOwner = await failScheduledJob({",
                "await runMonthlyDistribution(month, null, {",
                'trigger: "worker"',
                "export async function runPendingMonthlyPoolJobs",
                "export async function runBillingWorkerCycle",
                "runDueSubscriptionJobs(input)",
                "runPendingMonthlyPoolJobs(input)",
                "POOL-FIRST-DAY-01",
            ),
            (),
        ),
        (
            GUIDES_ROOT / "MF5/BK-MF5-03-gestao-consentimentos.md",
            "composition.privacy_delete_payload",
            (
                "deleteMyAccount(input, options = {})",
                "confirmation: input?.confirmation",
                "password: input?.password",
            ),
            (),
        ),
        (
            CATALOG_GUIDE_PATH,
            "composition.admin_catalog",
            (
                "function contentToForm",
                "function buildEditorialPayload",
                "function selectContentForEditing",
                "function reserveRow",
                "globalThis.confirm(",
                "CONTENT_VERSION_CONFLICT",
                "toUserMessage(requestError)",
                "createTaxonomy(input, options = {})",
                "AdminCatalogListPage",
                'path="catalogo/novo"',
                'path="catalogo/:contentId/editar"',
                'path="catalogo/taxonomias"',
            ),
            (),
        ),
        (
            ROUTES_GUIDE_PATH,
            "composition.lazy_routes",
            (
                "lazyNamedPage",
                'path="/notificacoes"',
                "async function handleLogout()",
                "AdminLayout",
                "AdminCatalogListPage",
                "AdminCharityMembersPage",
                'setStatus("unavailable")',
            ),
            ("import AdminCatalogPage from", "import AdminCharityMembersPage from"),
        ),
        (
            FAMILY_API_GUIDE_PATH,
            "composition.family_foundation",
            (
                "export async function serializeBillingCustomers",
                "function httpError",
                "async function countOpenFamilyMemberships",
                "function hasCompleteFamilyEntitlements",
                "export async function getEffectiveSubscriptionAccess",
                "await serializeBillingCustomers({",
                "hasPremiumAccess",
                "runInTransaction(async ({ db, session })",
            ),
            (),
        ),
        (
            FAMILY_API_GUIDE_PATH,
            "composition.family_billing",
            (
                "assertActiveTransaction,",
                "const FAMILY_CLOSURE = Object.freeze({",
                'canceled: "owner_subscription_canceled"',
                'past_due: "owner_subscription_past_due"',
                "async function closeOwnedFamily(db, ownerUserId, now, reason, session)",
                'db.collection("subscription_family_memberships").updateMany(',
                'status: { $in: ["pending", "active"] }',
                'status: "removed"',
                "removedAt: now",
                "removedReason: reason",
                "await closeOwnedFamily(\n    db,\n    userId,\n    now,\n    \"owner_subscription_canceled\"",
                "await closeOwnedFamily(\n    db,\n    userId,\n    now,\n    \"owner_subscription_past_due\"",
                "FAMILY-CYCLE-CANCELED-01",
                "FAMILY-CYCLE-PAST-DUE-01",
                "FAMILY-CYCLE-FAULT-01",
                "FAMILY-CYCLE-FAULT-02",
                "FAMILY-CYCLE-CONCURRENT-01",
                "Renovação recusada permanece `past_due`",
            ),
            ("pastDueExpiresAt", "subscription-expiry"),
        ),
        (
            AUTH_GUIDE_PATH,
            "composition.reset_delivery",
            (
                "password_reset_dev_outbox",
                "ENABLE_DEV_RESET_TOKEN_OUTBOX",
                "async function writeDevResetOutbox",
                "export async function getLatestDevPasswordResetToken",
                "if (user) {\n    await writeDevResetOutbox",
                'env.nodeEnv === "production"',
            ),
            (),
        ),
        (
            AUTH_GUIDE_PATH,
            "composition.auth_role_landing",
            (
                "export function getDefaultAuthenticatedPath(user)",
                'if (user?.role === "admin") return "/admin";',
                'if (user?.role === "moderator") return "/admin/catalogo";',
                "export function resolveAuthenticatedPath(user, requestedPath = null)",
                "getSafeRedirectPath(requestedPath) ?? getDefaultAuthenticatedPath(user)",
                "navigate(resolveAuthenticatedPath(currentUser, redirectTo)",
            ),
            ("const authenticationDestination =",),
        ),
        (
            GUIDES_ROOT / "MF3/BK-MF3-05-recomendacao-baseline-cold-start.md",
            "composition.recommendation_rate_limit",
            (
                "const recommendationsByUserLimit = rateLimit({",
                'scope: "recommendations:user"',
                "limit: 60",
                "key: rateLimitKeys.user",
                "requireAuth,\n  recommendationsByUserLimit,\n  asyncHandler(getRecommendationsForMe)",
            ),
            (),
        ),
        (
            GUIDES_ROOT / "MF6/BK-MF6-03-hardening-seguranca-e-privacidade.md",
            "composition.security_hardening",
            (
                "FORCE_HTTPS",
                "TRUST_PROXY_HOPS",
                "export function securityHeaders",
                "export function requireHttps",
                'error.code = "HTTPS_REQUIRED"',
                'app.disable("x-powered-by")',
                'res.setHeader("Content-Security-Policy"',
                'res.setHeader(\n      "Strict-Transport-Security"',
            ),
            (),
        ),
        (
            GUIDES_ROOT / "MF1/BK-MF1-02-estrutura-base-frontend-componentes.md",
            "composition.route_metadata",
            (
                "const TITLES = [",
                'path: "/catalogo/:idOrSlug"',
                'path: "/ver/:contentId"',
                'path: "/para-si"',
                'path: "/admin/integracoes"',
                "matchPath({ path, end: true }, pathname)",
            ),
            (),
        ),
        (
            GUIDES_ROOT / "MF6/BK-MF6-05-acessibilidade-e-ux-final.md",
            "composition.final_player",
            (
                "export function MediaPreferenceControls",
                "onPreferenceChange",
                "qualityOptions",
                "locked",
                "MEDIA_NOT_READY",
            ),
            (),
        ),
        (
            GUIDES_ROOT / "MF7/BK-MF7-04-refinamento-paginas-principais-estados-ux.md",
            "composition.final_pages",
            (
                "useSearchParams",
                "new AbortController()",
                "const response = await recommendationsApi.getMine({\n          signal: controller.signal,",
                "function PaginatedLibrarySection",
                "function idempotencyKeyFor",
                "crypto.randomUUID()",
                "totalPages",
            ),
            ("recommendationsApi.mine()",),
        ),
        (
            ROUTES_GUIDE_PATH,
            "composition.rbac_mobile",
            (
                'allowedRoles = ["admin"]',
                '["admin", "moderator"]',
                'element={withAdminRoute(<AdminLayout />, ["admin", "moderator"])}',
                "ADMIN_NAVIGATION_GROUPS",
                "AdminLayout",
                "dialog.showModal()",
                "onCancel={(event) =>",
                "menuButtonRef.current?.focus()",
                "Ver site público",
            ),
            (),
        ),
        (
            GUIDES_ROOT / "MF7/BK-MF7-03-layout-tokens-header-alinhados-mockup.md",
            "composition.mobile_css",
            (
                ".menu-toggle",
                "min-block-size: 44px",
                "max-block-size: 72px",
                "@media (prefers-reduced-motion: reduce) {",
            ),
            (),
        ),
        (
            GUIDES_ROOT / "MF5/BK-MF5-03-gestao-consentimentos.md",
            "composition.consents_ui",
            (
                "const confirmedRef = useRef(EMPTY_CONSENTS);",
                "const savingRef = useRef(false);",
                "new AbortController()",
                "setConsents(confirmed)",
                "toUserMessage(requestError)",
                "aria-busy={saving}",
            ),
            (),
        ),
        (
            GUIDES_ROOT / "MF5/BK-MF5-04-gestao-de-utilizadores-admin.md",
            "composition.admin_users_ui",
            (
                "const reservationsRef = useRef(new Set());",
                "window.confirm(",
                "new AbortController()",
                "totalPages",
                "toUserMessage(requestError)",
            ),
            (),
        ),
        (
            GUIDES_ROOT / "MF4/BK-MF4-04-aprovacao-entrada-pool.md",
            "composition.admin_review_ui",
            (
                "const reservationsRef = useRef(new Set());",
                "ConfirmDialog",
                "const normalizedReason = reason.trim();",
                "normalizedReason.length < 10 || normalizedReason.length > 500",
                "new AbortController()",
                "totalPages",
                "toUserMessage(apiError)",
            ),
            (),
        ),
        (
            GUIDES_ROOT / "MF4/BK-MF4-06-relatorios-e-historico-por-associacao.md",
            "composition.charity_reports_ui",
            (
                "const submissionRef = useRef(null);",
                "new AbortController()",
                "toUserMessage(apiError)",
                "aria-busy={submitting}",
                '"/admin/lookup"',
                "lookupAdminCharities(search, options = {})",
                'role="combobox"',
                "ConfirmDialog",
            ),
            (),
        ),
        (
            GUIDES_ROOT / "MF9/BK-MF9-04-ui-gestao-familiar-convites.md",
            "composition.family_ui",
            (
                "function familyStatusLabel",
                "activeOperationRef",
                "function idempotencyKeyFor",
                "crypto.randomUUID()",
                "encodeURIComponent(invitationId)",
                "encodeURIComponent(memberId)",
                "window.confirm(confirmation)",
                "new AbortController()",
            ),
            (),
        ),
    )

    for relative_path, field, required, forbidden in contracts:
        text = (root / relative_path).read_text(encoding="utf-8")
        missing = [marker for marker in required if marker not in text]
        present_forbidden = [marker for marker in forbidden if marker in text]
        if missing or present_forbidden:
            errors.append(
                make_error(
                    field,
                    f"required={','.join(required)}; forbidden={','.join(forbidden) or '-'}",
                    f"{relative_path}: missing={','.join(missing) or '-'} forbidden={','.join(present_forbidden) or '-'}",
                ),
            )

    e2e_text = (root / E2E_GUIDE_PATH).read_text(encoding="utf-8")
    host_guard_position = e2e_text.find("if (!LOOPBACK_HOSTS.has(requestUrl.hostname))")
    fixture_lookup_position = e2e_text.find("const fixture = fixtureRoutes.get(requestUrl.pathname)")
    if (
        host_guard_position < 0
        or fixture_lookup_position < 0
        or host_guard_position >= fixture_lookup_position
    ):
        errors.append(
            make_error(
                "composition.e2e_network",
                "loopback host validation before fixture pathname lookup",
                f"host_guard={host_guard_position}; fixture_lookup={fixture_lookup_position}",
            ),
        )

    csrf_guide_text = (
        root / GUIDES_ROOT / "MF1/BK-MF1-04-sessao-segura-backend-cookies-auth-base.md"
    ).read_text(encoding="utf-8")
    csrf_body = extract_js_function_body(
        csrf_guide_text,
        "export async function csrfProtection(req, _res, next)",
    )
    origin_position = -1 if csrf_body is None else csrf_body.find('const origin = req.get("Origin")')
    public_auth_position = -1 if csrf_body is None else csrf_body.find("if (isPublicAuthPost(req))")
    if (
        csrf_body is None
        or origin_position < 0
        or public_auth_position < 0
        or origin_position >= public_auth_position
    ):
        errors.append(
            make_error(
                "composition.origin_csrf",
                "browser Origin validation before the exact public-auth CSRF exemption",
                f"origin={origin_position}; public_auth={public_auth_position}",
            ),
        )

    route_metadata_text = (
        root / GUIDES_ROOT / "MF1/BK-MF1-02-estrutura-base-frontend-componentes.md"
    ).read_text(encoding="utf-8")
    titles_start = route_metadata_text.find("const TITLES = [")
    titles_end = route_metadata_text.find("];", titles_start)
    title_block = "" if titles_start < 0 or titles_end < 0 else route_metadata_text[titles_start:titles_end]
    documented_routes = re.findall(r'\{\s*path:\s*"([^"]+)"', title_block)
    if len(documented_routes) != 31 or len(set(documented_routes)) != 31:
        errors.append(
            make_error(
                "composition.route_metadata",
                "31 unique functional route metadata entries",
                f"count={len(documented_routes)}; unique={len(set(documented_routes))}",
            ),
        )

    auth_text = (root / AUTH_GUIDE_PATH).read_text(encoding="utf-8")
    refresh_body = extract_js_function_body(auth_text, "const refreshSession = useCallback(async () =>")
    catch_body = "" if refresh_body is None else refresh_body[refresh_body.find("catch (requestError)") :]
    if (
        refresh_body is None
        or 'setStatus("unavailable")' not in catch_body
        or "setUser(null)" in catch_body
    ):
        errors.append(
            make_error(
                "composition.auth_session",
                "refreshSession preserves the confirmed user on operational failure",
                "missing refreshSession or literal setUser(null) in its body",
            ),
        )

    eager_page_imports: list[str] = []
    eager_page_import_re = re.compile(
        r"^\s*import\s+(?:\{[^\n]+\}|[A-Za-z_$][\w$]*)\s+from\s+[\"'][^\"']*/pages/[^\"']+[\"'];?\s*$",
        re.MULTILINE,
    )
    for guide_path in sorted((root / GUIDES_ROOT).glob("MF*/BK-*.md")):
        guide_text = guide_path.read_text(encoding="utf-8")
        if eager_page_import_re.search(guide_text):
            eager_page_imports.append(str(guide_path.relative_to(root)))
    if eager_page_imports:
        errors.append(
            make_error(
                "composition.lazy_routes",
                "zero eager page imports in the cumulative AppRoutes tutorial",
                ",".join(eager_page_imports),
            ),
        )

    fragment_contracts = {
        GUIDES_ROOT / "MF3/BK-MF3-05-recomendacao-baseline-cold-start.md": (
            "items: [{ id, title, slug, posterUrl, type }]",
            'group("because-your-themes"',
        ),
        GUIDES_ROOT / "MF3/BK-MF3-06-explicabilidade-de-recomendacao.md": (
            "explanation: {",
            "explanation: buildRecommendationExplanation(reasonCode),",
        ),
        GUIDES_ROOT / "MF4/BK-MF4-04-aprovacao-entrada-pool.md": (
            "reviewApplication(id, input, options = {}) {",
            "Claim, entidade operacional e auditoria",
        ),
        GUIDES_ROOT / "MF4/BK-MF4-06-relatorios-e-historico-por-associacao.md": (
            "listPublicCharities(options = {}) {",
            'if (req.user.role === "admin") return;',
        ),
        GUIDES_ROOT / "MF5/BK-MF5-04-gestao-de-utilizadores-admin.md": (
            "listUsers(filters = {}, options = {}) {",
        ),
    }
    fence_re = re.compile(
        r"^```(?P<language>[A-Za-z0-9_-]*)\s*\n(?P<body>.*?)^```\s*$",
        re.MULTILINE | re.DOTALL,
    )
    for relative_path, markers in fragment_contracts.items():
        guide_text = (root / relative_path).read_text(encoding="utf-8")
        fences = tuple(fence_re.finditer(guide_text))
        invalid_markers: list[str] = []
        for marker in markers:
            matching_languages = {
                match.group("language").lower()
                for match in fences
                if marker in match.group("body")
            }
            if "text" not in matching_languages:
                invalid_markers.append(f"{marker}:{sorted(matching_languages)}")
        if invalid_markers:
            errors.append(
                make_error(
                    "guide.fragment_classification",
                    "known schemas and contextual fragments are fenced only as text",
                    f"{relative_path}: {';'.join(invalid_markers)}",
                ),
            )
    return errors


def validate_post_audit_contracts(root: Path) -> list[dict[str, str]]:
    """Protect the executable contracts repaired by the final human reread."""

    errors: list[dict[str, str]] = []
    contracts = (
        (
            GUIDES_ROOT / "MF1/BK-MF1-04-sessao-segura-backend-cookies-auth-base.md",
            "composition.session_database",
            (
                'nodeEnv === "test" &&\n    (process.env.MONGODB_URI || process.env.MONGODB_DB_NAME)',
                'const mongodbUri = nodeEnv === "test"\n    ? null',
                "MongoDB indisponivel em test; injeta um DB double com setDbForTests().",
                'return decodeURIComponent(rawValue.join("="));',
                '{ accountStatus: "active" },',
                '{ status: "active" },',
                'res.set("Cache-Control", "private, no-store");',
            ),
            (),
        ),
        (
            GUIDES_ROOT / "MF1/BK-MF1-01-estrutura-base-backend-modulos.md",
            "composition.core_error_envelope",
            (
                'code = "REQUEST_FAILED"',
                'this.code =',
                '"NOT_FOUND"',
            ),
            (),
        ),
        (
            API_CLIENT_GUIDE_PATH,
            "composition.core_error_envelope",
            (
                'if (response.ok && (!text.trim() || !contentType.includes("json")))',
                'code: "INVALID_RESPONSE"',
                "response.status === 204 || response.status === 205",
            ),
            (),
        ),
        (
            HEALTH_GUIDE_PATH,
            "composition.core_error_envelope",
            (
                "export const REQUEST_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/;",
                "REQUEST_ID_PATTERN.test(value)",
                ": randomUUID();",
                "response.requestId = req.id;",
            ),
            (),
        ),
        (
            GUIDES_ROOT / "MF5/BK-MF5-03-gestao-consentimentos.md",
            "composition.consents_backend",
            (
                "export async function ensureConsentIndexes()",
                '{ unique: true, name: "user_consents_user_id_unique" },',
                "return await runInTransaction(async ({ db, session }) => {",
                '{ upsert: true, session },',
                'db.collection("user_consent_events").insertOne(',
                '{ session },',
                'db.collection("user_consents").findOne(',
            ),
            (),
        ),
        (
            NOTIFICATIONS_GUIDE_PATH,
            "composition.progress_notification",
            (
                "const preferenceControllerRef = useRef(null);",
                "if (preferenceControllerRef.current) return;",
                "preferenceControllerRef.current = controller;",
                "preferenceControllerRef.current !== controller",
                "export async function savePlaybackProgress(contentId, userId, input)",
                "return runInTransaction(async ({ db, session }) => {",
                "const { content } = await loadEligibleContent(",
                "{ db, session },",
                'action: "playback.continue_watching_created"',
            ),
            (),
        ),
        (
            FAMILY_PRIVACY_GUIDE_PATH,
            "composition.family_privacy_operations",
            (
                "const resetTokenIds = resetTokenRows.map((row) => row._id);",
                '{ resetTokenId: { $in: resetTokenIds } },',
                'requestedAt: { $gte: from, $lte: to },',
                'createdAt: { $gte: from, $lte: to },',
                "const accountStatusAllowsLogin =",
                "const legacyStatusAllowsLogin =",
            ),
            ("changedAt: { $gte: from, $lte: to }",),
        ),
        (
            WORKER_GUIDE_PATH,
            "composition.subscription_access",
            (
                '!["active", "trialing"].includes(subscription.status)',
                'if (subscription.status === "trialing" || subscription.planCode === "trial")',
                'status: { $in: ["active", "trialing"] }',
            ),
            (),
        ),
        (
            QUALITY_GUIDE_PATH,
            "composition.subscription_access",
            (
                "export function entitlementsForSubscription(subscription, plan = null)",
                'if (subscription?.status === "trialing")',
                'return subscription.planCode === "trial"',
                '{ status: "active", planCode: "trial" },',
                '{ status: "trialing", planCode: "faithflix-monthly" },',
                'value: "999p"',
            ),
            (),
        ),
        (
            FAMILY_API_GUIDE_PATH,
            "composition.family_notifications",
            (
                "export const NOTIFICATION_TYPES = Object.freeze([",
                '"family_invitation",',
                '"family_invitation_accepted",',
                '"family_member_removed",',
                "const accountStatusAllowsBilling = user && (",
                "const legacyStatusAllowsBilling = user && (",
                "function isActiveAccount(user)",
            ),
            (),
        ),
        (
            GUIDES_ROOT / "MF2/BK-MF2-02-edicao-perfil-papeis-base.md",
            "composition.admin_user_contract",
            (
                "export async function updateUserRole(",
                "actorUserId,",
                "return runInTransaction(async ({ db, session }) => {",
                '{ _id: "active-admin-roster" },',
                '"LAST_ACTIVE_ADMIN"',
                "await writeAdminAudit({",
                "requestId: context.requestId,",
            ),
            (),
        ),
        (
            GUIDES_ROOT / "MF5/BK-MF5-04-gestao-de-utilizadores-admin.md",
            "composition.admin_user_contract",
            (
                "export function assertAdminUserFilters(filters = {})",
                ".sort({ createdAt: -1, _id: 1 })",
                ".skip((page - 1) * limit)",
                ".limit(limit)",
                "usersCollection.countDocuments(query)",
                "totalPages: total === 0 ? 0 : Math.ceil(total / limit)",
                'assert.throws(() => assertAdminUserFilters({ limit: "51" })',
            ),
            (),
        ),
        (
            GUIDES_ROOT / "MF3/BK-MF3-01-ratings-e-agregacao.md",
            "composition.ratings_contract",
            (
                "export function assertRatingBody(input)",
                "const { value } = assertRatingBody(req.body);",
                "return runInTransaction(async ({ db, session }) => {",
                "buildRatingSummary",
                "const contextVersionRef = useRef(0);",
            ),
            (),
        ),
        (
            GUIDES_ROOT / "MF3/BK-MF3-02-comentarios-curtos-moderados.md",
            "composition.comments_contract",
            (
                "function publicComment(comment, viewer = null)",
                "canDelete: canDeleteComment(comment, viewer)",
                "return runInTransaction(async ({ db, session }) => {",
                "requestId: context.requestId,",
            ),
            ("moderationReason: comment.moderationReason", "userId: comment.userId"),
        ),
        (
            GUIDES_ROOT / "MF3/BK-MF3-05-recomendacao-baseline-cold-start.md",
            "composition.recommendation_contract",
            (
                "async function loadUserSignals(db, userObjectId, maxAgeRating)",
                'db.collection("recommendation_feedback").find({',
                'action: "not_interested"',
                "const excludedIds = [...new Set([...contentIds, ...notInterestedIds])];",
                "export async function saveRecommendationFeedback",
            ),
            (),
        ),
        (
            GUIDES_ROOT / "MF3/BK-MF3-06-explicabilidade-de-recomendacao.md",
            "composition.recommendation_contract",
            (
                "export const RECOMMENDATION_REASON_CODES = Object.freeze([",
                '"themes-from-user-signals",',
                '"activity-types",',
                '"popular-fallback",',
                '"cold-start-popular",',
                '"cold-start-recent",',
                '"cold-start-catalog",',
                "for (const reasonCode of RECOMMENDATION_REASON_CODES)",
            ),
            (),
        ),
        (
            GUIDES_ROOT / "MF4/BK-MF4-03-candidaturas-associacoes.md",
            "composition.charity_contract",
            (
                "export function assertCharityApplicationPayload(input)",
                "export function assertApplicationListQuery(query)",
                "url.username ||",
                "url.password ||",
            ),
            (),
        ),
        (
            GUIDES_ROOT / "MF4/BK-MF4-04-aprovacao-entrada-pool.md",
            "composition.charity_contract",
            (
                "export function assertReviewPayload(input)",
                'reason: "x".repeat(501)',
                "return runInTransaction(async ({ db, session }) => {",
                'status: "pending"',
            ),
            (),
        ),
        (
            GUIDES_ROOT / "MF4/BK-MF4-06-relatorios-e-historico-por-associacao.md",
            "composition.charity_contract",
            (
                "function assertObjectBody(body)",
                "const body = assertObjectBody(req.body);",
                '{ _id: charityObjectId, status: "active", poolStatus: "eligible" },',
                "return await runInTransaction(async ({ db, session }) => {",
            ),
            (),
        ),
        (
            POOL_GUIDE_PATH,
            "composition.pool_finance",
            (
                "total > Number.MAX_SAFE_INTEGER - value",
                "!Number.isSafeInteger(payment.amountCents)",
                'payment.currency !== "EUR"',
                'currency: "EUR"',
                "function assertObjectBody(body)",
            ),
            (),
        ),
        (
            PERFORMANCE_GUIDE_PATH,
            "composition.performance_probe",
            (
                'const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);',
                "parsed.username ||",
                "parsed.password ||",
                "const controller = new AbortController();",
                "await response.arrayBuffer();",
                "if (controller.signal.aborted)",
            ),
            (),
        ),
        (
            ROUTES_GUIDE_PATH,
            "composition.navigation_session",
            (
                "export function AuthenticatedRoute({ children })",
                "const loggingOutRef = useRef(false);",
                "if (loggingOutRef.current) return;",
                'withAuthenticatedRoute(<PlaybackPage />)',
            ),
            (),
        ),
        (
            GUIDES_ROOT / "MF7/BK-MF7-03-layout-tokens-header-alinhados-mockup.md",
            "composition.navigation_session",
            (
                "const requestEpochRef = useRef(0);",
                "new AbortController();",
                "setError(toUserMessage(requestError));",
                'session.status === "anonymous"',
                'session.status === "authenticated"',
                'session.status === "unavailable"',
            ),
            (),
        ),
        (
            GUIDES_ROOT / "MF7/BK-MF7-04-refinamento-paginas-principais-estados-ux.md",
            "composition.navigation_session",
            (
                "const plansResponse = await subscriptionsApi.listPlans({ signal });",
                'if (sessionStatus === "authenticated")',
                "Anonymous/unavailable não dispara leitura privada",
            ),
            (),
        ),
        (
            PRIVACY_GUIDE_PATH,
            "composition.delete_account_ui",
            (
                "const submitReservedRef = useRef(false);",
                "const submitControllerRef = useRef(null);",
                "if (submitReservedRef.current) return;",
                "{ confirmation, password },",
                "{ signal: controller.signal },",
                "clearSession();",
            ),
            (),
        ),
        (
            GUIDES_ROOT / "MF6/BK-MF6-01-suite-de-regressao-backend.md",
            "composition.regression_truth",
            (
                "A suite acima não chama `runInTransaction` com o DB double.",
                "Este guia não fornece o conteúdo de",
                "`NAO_IMPLEMENTADO`",
                "`BLOQUEADO_AMBIENTE`",
                "Nenhum desses estados conta como cobertura.",
            ),
            (),
        ),
        (
            GUIDES_ROOT / "MF6/BK-MF6-03-hardening-seguranca-e-privacidade.md",
            "composition.e2e_test_database",
            (
                "const E2E_MARKERS = [",
                'const formalE2eRequested = nodeEnv === "test" && E2E_MARKERS.some(',
                'nodeEnv === "test" ? null : parseMongoUri(required("MONGODB_URI"))',
                'nodeEnv === "test" ? null : parseDatabaseName(required("MONGODB_DB_NAME"))',
                "assertE2eRuntimeEnvironment(process.env)",
                "MongoDB indisponivel em test sem TEST_MONGODB_*; injeta um DB double",
            ),
            (),
        ),
        (
            GUIDES_ROOT / "MF1/BK-MF1-06-smoke-tests-fe-be.md",
            "composition.smoke_isolation",
            (
                "import { setDbForTests } from \"../../src/config/database.js\";",
                "setDbForTests(db);",
                '"smoke": "NODE_ENV=test FRONTEND_ORIGINS=',
                "Não forneças `MONGODB_URI`, `MONGODB_DB_NAME` nem",
                "o DB double explicitamente",
            ),
            (),
        ),
        (
            GUIDES_ROOT / "MF1/BK-MF1-06-smoke-tests-fe-be.md",
            "composition.evidence_lane_ownership",
            (
                "docs/evidence/student/MF1/README.md",
                "NÃO EDITAR: `docs/evidence/MF1/README.md`",
                "- `implementation_lane`: `STUDENT`",
                "- `current_authority`: `docs/planificacao/guias-bk/MF1/BK-MF1-06-smoke-tests-fe-be.md`",
                "- `proof_scope`: smoke isolado MF1",
            ),
            (),
        ),
        (
            MEDIA_GUIDE_PATH,
            "composition.locked_media_selection",
            (
                "function canonicalUnlockedSource(candidate)",
                "return candidate?.locked === true ? null : canonicalMediaSource(candidate);",
                ".filter((option) => option?.locked !== true)",
                ".map((track) => ({ track, source: canonicalUnlockedSource(track) }))",
                "canonicalUnlockedSource(content.media)",
                "se todas as fontes estiverem locked",
            ),
            (),
        ),
        (
            GUIDES_ROOT / "MF2/BK-MF2-02-edicao-perfil-papeis-base.md",
            "composition.session_mount",
            (
                "Adiciona apenas `userRouter` depois da cadeia canónica de sessão e CSRF.",
                "// app.use(asyncHandler(attachSession));",
                "// app.use(asyncHandler(csrfProtection));",
                'app.use("/api/users", userRouter);',
            ),
            (),
        ),
        (
            CATALOG_GUIDE_PATH,
            "composition.catalog_create_audit",
            (
                "export async function createContent(",
                "auditWriter = writeAdminAudit,",
                'action: "catalog.content.created"',
                "export async function createTaxonomy(",
                'action: "catalog.taxonomy.created"',
                "return runInTransaction(async ({ db, session }) => {",
                "requestId: req.id,",
            ),
            (),
        ),
        (
            WORKER_GUIDE_PATH,
            "composition.worker_active_lease",
            (
                "export async function completeScheduledJob(input)",
                "export async function failScheduledJob(input)",
                "WORKER-EXPIRED-OWNER-01",
                "lease expirado e pode ser reclamado por outro owner",
            ),
            (),
        ),
        (
            GUIDES_ROOT / "MF9/BK-MF9-04-ui-gestao-familiar-convites.md",
            "composition.public_plans_session",
            (
                'import { useSession } from "../context/SessionContext.jsx";',
                "const session = useSession();",
                "const plansResponse = await subscriptionsApi.listPlans({ signal });",
                'if (session.status !== "authenticated") {',
                "const subscriptionResponse = await subscriptionsApi.getMine({ signal });",
                'disabled={submitting || session.status !== "authenticated"}',
                'session.status === "unavailable"',
            ),
            (),
        ),
        (
            FAMILY_PRIVACY_GUIDE_PATH,
            "composition.family_pool_trigger",
            (
                'trigger: "admin",',
                'assert.equal(result.distribution.trigger, "admin");',
                'assert.equal(result.distribution.financialSnapshot.source, "payment_attempts_v2");',
            ),
            ('trigger: "manual"', 'distribution.trigger, "manual"'),
        ),
        (
            GUIDES_ROOT / "MF1/BK-MF1-06-smoke-tests-fe-be.md",
            "composition.smoke_cleanup",
            (
                "async function closeServer(server)",
                "let closePromise = null;",
                "closePromise ??= (async () => {",
                "catch (startupError)",
                "throw new AggregateError(",
                "Mesmo um listen/close falhado não pode contaminar o teste seguinte.",
            ),
            (),
        ),
        (
            GUIDES_ROOT / "MF9/BK-MF9-04-ui-gestao-familiar-convites.md",
            "composition.public_plans_loading",
            (
                "O finally exterior cobre também anonymous/loading/unavailable e erro público.",
                "setLoading(false);",
            ),
            (),
        ),
    )

    for relative_path, field, required, forbidden in contracts:
        text = (root / relative_path).read_text(encoding="utf-8")
        missing = [marker for marker in required if marker not in text]
        present_forbidden = [marker for marker in forbidden if marker in text]
        if missing or present_forbidden:
            errors.append(
                make_error(
                    field,
                    f"required={','.join(required)}; forbidden={','.join(forbidden) or '-'}",
                    f"{relative_path}: missing={','.join(missing) or '-'} forbidden={','.join(present_forbidden) or '-'}",
                ),
            )

    obsolete_auth_path = re.compile(
        r"modules/auth/auth\.middleware\.js|\.\./auth/auth\.middleware\.js",
    )
    for guide_path in sorted((root / GUIDES_ROOT).glob("MF*/BK-*.md")):
        match = obsolete_auth_path.search(guide_path.read_text(encoding="utf-8"))
        if match:
            errors.append(
                make_error(
                    "composition.auth_middleware_path",
                    "only backend/src/middlewares/auth.middleware.js and equivalent relative imports",
                    f"{guide_path.relative_to(root)}: {match.group(0)}",
                ),
            )

    executable_fence_re = re.compile(
        r"^```(?:js|jsx|javascript|mjs|ts|tsx|json|bash|sh|shell)\s*\n(?P<body>.*?)^```\s*$",
        re.MULTILINE | re.DOTALL | re.IGNORECASE,
    )
    smoke_text = (
        root / GUIDES_ROOT / "MF1/BK-MF1-06-smoke-tests-fe-be.md"
    ).read_text(encoding="utf-8")
    smoke_code = "\n".join(match.group("body") for match in executable_fence_re.finditer(smoke_text))
    unsafe_smoke_env = re.search(r"(?:TEST_)?MONGODB_(?:URI|DB_NAME)\s*=", smoke_code)
    if unsafe_smoke_env:
        errors.append(
            make_error(
                "composition.smoke_isolation",
                "no normal or E2E MongoDB assignment in the in-memory MF1 smoke",
                unsafe_smoke_env.group(0),
            ),
        )

    session_mount_text = (
        root / GUIDES_ROOT / "MF2/BK-MF2-02-edicao-perfil-papeis-base.md"
    ).read_text(encoding="utf-8")
    session_mount_code = "\n".join(
        match.group("body") for match in executable_fence_re.finditer(session_mount_text)
    )
    duplicate_session_mount = re.search(
        r"^\s*app\.use\(\s*(?:asyncHandler\()?attachSession\b",
        session_mount_code,
        re.MULTILINE,
    )
    if duplicate_session_mount:
        errors.append(
            make_error(
                "composition.session_mount",
                "MF2-02 adds only userRouter after the existing session/CSRF chain",
                duplicate_session_mount.group(0).strip(),
            ),
        )

    worker_text = (root / WORKER_GUIDE_PATH).read_text(encoding="utf-8")
    active_lease_filters = worker_text.count("leaseExpiresAt: { $gt: now },")
    if active_lease_filters < 2:
        errors.append(
            make_error(
                "composition.worker_active_lease",
                "complete and fail each require leaseExpiresAt > now",
                f"active_filters={active_lease_filters}",
            ),
        )

    start_server_body = extract_js_function_body(
        smoke_text,
        "export async function startTestServer({ db })",
    )
    close_operation_body = (
        None
        if start_server_body is None
        else extract_js_function_body(start_server_body, "closePromise ??= (async () =>")
    )
    close_finally_body = (
        None
        if close_operation_body is None
        else extract_js_function_body(close_operation_body, "finally")
    )
    startup_catch_body = (
        None
        if start_server_body is None
        else extract_js_function_body(start_server_body, "catch (startupError)")
    )
    startup_finally_body = (
        None
        if startup_catch_body is None
        else extract_js_function_body(startup_catch_body, "finally")
    )
    active_reset_re = re.compile(r"^\s*setDbForTests\(null\);\s*$", re.MULTILINE)
    if (
        close_finally_body is None
        or startup_finally_body is None
        or not active_reset_re.search(close_finally_body)
        or not active_reset_re.search(startup_finally_body)
    ):
        errors.append(
            make_error(
                "composition.smoke_cleanup",
                "active DB override reset in both close and startup-failure finally blocks",
                "close_finally="
                f"{close_finally_body is not None and bool(active_reset_re.search(close_finally_body))}; "
                "startup_finally="
                f"{startup_finally_body is not None and bool(active_reset_re.search(startup_finally_body))}",
            ),
        )

    public_plans_text = (
        root / GUIDES_ROOT / "MF9/BK-MF9-04-ui-gestao-familiar-convites.md"
    ).read_text(encoding="utf-8")
    load_data_body = extract_js_function_body(
        public_plans_text,
        "const loadData = useCallback(async (signal, { showLoading = true } = {}) =>",
    )
    top_level_try = -1 if load_data_body is None else load_data_body.find("\n    try {")
    non_authenticated = (
        -1 if load_data_body is None else load_data_body.find('if (session.status !== "authenticated")')
    )
    try_content = None
    try_end = -1
    if load_data_body is not None and top_level_try >= 0:
        opening = load_data_body.find("{", top_level_try)
        depth = 0
        for index in range(opening, len(load_data_body)):
            if load_data_body[index] == "{":
                depth += 1
            elif load_data_body[index] == "}":
                depth -= 1
                if depth == 0:
                    try_content = load_data_body[opening + 1 : index]
                    try_end = index
                    break
    finally_suffix = "" if load_data_body is None or try_end < 0 else load_data_body[try_end :]
    if (
        load_data_body is None
        or top_level_try < 0
        or non_authenticated < 0
        or try_content is None
        or 'if (session.status !== "authenticated")' not in try_content
        or not re.match(r"}\s*finally\s*{", finally_suffix)
        or "setLoading(false);" not in finally_suffix
    ):
        errors.append(
            make_error(
                "composition.public_plans_loading",
                "public and private branches inside the try covered by the loading finally",
                f"body={load_data_body is not None}; try={top_level_try}; anonymous={non_authenticated}; end={try_end}",
            ),
        )
    return errors


def validate_active_evidence_placeholders(root: Path) -> tuple[list[dict[str, str]], int]:
    """Reject template markers in active evidence while allowing archives."""

    errors: list[dict[str, str]] = []
    checked = 0
    evidence_root = root / EVIDENCE_ROOT
    if not evidence_root.exists():
        return errors, checked

    for path in sorted(evidence_root.rglob("*.md")):
        relative = path.relative_to(root)
        relative_to_evidence = path.relative_to(evidence_root)
        if any(part.lower() in ARCHIVE_PARTS for part in relative_to_evidence.parts[:-1]):
            continue
        checked += 1
        for line_number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
            match = ACTIVE_PLACEHOLDER_RE.search(line)
            if match:
                errors.append(
                    make_error(
                        "active_evidence.placeholder",
                        "no template marker outside archive/",
                        f"{relative}:{line_number}: {match.group(0)}",
                    ),
                )
    return errors, checked


def validate_official_command(root: Path) -> list[dict[str, str]]:
    """Validate the documented command and its fail-fast shell wrapper."""

    errors: list[dict[str, str]] = []
    wrapper_path = root / VALIDATOR_WRAPPER_PATH
    if not wrapper_path.is_file():
        return [make_error("command.wrapper", "existing executable wrapper", "missing")]

    wrapper = wrapper_path.read_text(encoding="utf-8")
    if wrapper.replace("\r\n", "\n") != EXPECTED_WRAPPER:
        errors.append(
            make_error(
                "command.wrapper_content",
                "exact fail-fast wrapper with one validator command",
                "unexpected executable content",
            ),
        )
    if "set -euo pipefail" not in wrapper:
        errors.append(make_error("command.wrapper_safety", "set -euo pipefail", "missing"))
    command_lines = [line.strip() for line in wrapper.splitlines() if line.strip().startswith("python3 ")]
    if command_lines != [WRAPPER_COMMAND]:
        errors.append(make_error("command.wrapper_target", WRAPPER_COMMAND, " | ".join(command_lines) or "missing"))

    for relative_path in (PLANNING_README_PATH, GUIDES_README_PATH, BACKLOG_PATH):
        text = (root / relative_path).read_text(encoding="utf-8")
        if CANONICAL_COMMAND not in text:
            errors.append(make_error("command.documentation", CANONICAL_COMMAND, f"missing in {relative_path}"))
        if "scripts/validate_planificacao.sh" in text:
            errors.append(
                make_error(
                    "command.obsolete_path",
                    "scripts/validate-planificacao.sh",
                    f"scripts/validate_planificacao.sh in {relative_path}",
                ),
            )
    return errors


def validate_plan_and_order(
    backlog: dict[str, BacklogItem],
    sprint_allocation: dict[str, str],
    canonical_order: list[str],
) -> list[dict[str, str]]:
    """Validate exact BK coverage and monotonic sprint table ordering."""

    errors: list[dict[str, str]] = []
    for bk_id in sorted(set(backlog) - set(sprint_allocation)):
        errors.append(make_error("sprint_plan.allocation", "one sprint", "missing", bk_id))
    for bk_id in sorted(set(sprint_allocation) - set(backlog)):
        errors.append(make_error("sprint_plan.backlog", "listed in backlog", "extra target", bk_id))

    previous = 0
    for bk_id in canonical_order:
        sprint = sprint_allocation[bk_id]
        match = SPRINT_RE.fullmatch(sprint)
        if not match:
            errors.append(make_error("sprint_plan.sprint", "Sxx", sprint, bk_id))
            continue
        number = int(match.group("number"))
        if number < previous:
            errors.append(make_error("sprint_plan.order", f">= S{previous:02d}", sprint, bk_id))
        previous = max(previous, number)
    return errors


def build_result(root: Path, project: str) -> dict[str, object]:
    """Build the complete machine-readable validation result for ``root``."""

    backlog = parse_backlog(root)
    guides = collect_guides(root)
    annex = parse_annex(root)
    sprint_allocation, canonical_order = parse_sprint_plan(root)
    contract_snapshot = parse_contract_snapshot(root)
    matrix = parse_matrix(root)
    active_requirements = parse_active_requirements(root)
    rf_annex = parse_requirement_annex(root, RF_ANNEX_PATH, "RF")
    rnf_annex = parse_requirement_annex(root, RNF_ANNEX_PATH, "RNF")
    mf_sequences, mf_links = parse_mf_views(root)

    errors: list[dict[str, str]] = []
    errors.extend(validate_backlog_domains(backlog))
    errors.extend(validate_macro_state_snapshot(root, backlog))
    errors.extend(validate_plan_and_order(backlog, sprint_allocation, canonical_order))
    errors.extend(compare_backlog_and_guides(backlog, guides, sprint_allocation, canonical_order))
    errors.extend(compare_annex(backlog, guides, annex, sprint_allocation))
    errors.extend(compare_contract_snapshot(backlog, contract_snapshot))
    errors.extend(compare_traceability(backlog, matrix, active_requirements, rf_annex, rnf_annex))
    errors.extend(validate_matrix_quality(matrix))
    errors.extend(compare_mf_views(root, backlog, guides, canonical_order, mf_sequences, mf_links))
    errors.extend(validate_mf_views_baseline(root, backlog, guides, matrix, sprint_allocation))
    errors.extend(validate_public_guide_paths(root))
    errors.extend(validate_tutorial_v2_guides(root))
    errors.extend(validate_embedded_evidence_templates(root))
    errors.extend(validate_didactic_code_comments(root))
    errors.extend(validate_playwright_commands(root))
    errors.extend(validate_runbook_manifest_commands(root))
    errors.extend(validate_current_e2e_procedure(root))
    errors.extend(validate_rate_limit_contract(root))
    errors.extend(validate_architecture_operational_schemas(root))
    errors.extend(validate_lifecycle_and_input_contracts(root, matrix))
    errors.extend(validate_document_metadata(root))
    errors.extend(validate_hybrid_boundaries_and_reference_comparisons(root))
    errors.extend(validate_critical_guide_contracts(root))
    errors.extend(validate_composed_tutorial_contracts(root))
    errors.extend(validate_post_audit_contracts(root))
    placeholder_errors, checked_evidence = validate_active_evidence_placeholders(root)
    errors.extend(placeholder_errors)
    errors.extend(validate_official_command(root))

    return {
        "project": project,
        "status": "PASS" if not errors else "FAIL",
        "checked_bks": len(backlog),
        "checked_guides": len(guides),
        "checked_requirements": len(active_requirements),
        "checked_mf_views": len(mf_sequences),
        "checked_evidence": checked_evidence,
        "errors": errors,
    }


def parse_args(argv: list[str]) -> argparse.Namespace:
    """Parse CLI arguments, including an isolated root for negative tests."""

    parser = argparse.ArgumentParser(description="Validate the FaithFlix planning canon.")
    parser.add_argument("--project", default="faithflix", help="Project name included in the output.")
    parser.add_argument("--root", type=Path, default=Path.cwd(), help="Repository root to validate (defaults to cwd).")
    parser.add_argument("--json", action="store_true", help="Print JSON output.")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    """Run validation and return zero only when every canonical view agrees."""

    args = parse_args(argv if argv is not None else sys.argv[1:])
    root = args.root.resolve()

    try:
        result = build_result(root, args.project)
    except Exception as error:  # noqa: BLE001 - CLI reports setup failures as validation failures.
        result = {
            "project": args.project,
            "status": "FAIL",
            "checked_bks": 0,
            "checked_guides": 0,
            "checked_requirements": 0,
            "checked_mf_views": 0,
            "checked_evidence": 0,
            "errors": [{"field": "validator", "expected": "successful execution", "actual": str(error)}],
        }

    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print(
            f"{result['status']}: checked {result['checked_bks']} BKs, "
            f"{result['checked_guides']} guides and {result['checked_requirements']} requirements",
        )
        for error in result["errors"]:
            print(
                f"- {error.get('bk_id', '-')}: {error['field']} expected "
                f"{error['expected']!r}, got {error['actual']!r}",
            )

    return 0 if result["status"] == "PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
