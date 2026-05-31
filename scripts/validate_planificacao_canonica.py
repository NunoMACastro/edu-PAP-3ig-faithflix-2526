#!/usr/bin/env python3
"""Validate FaithFlix planning metadata against the canonical backlog.

This validator intentionally checks only repository-local documentation. It
compares the official backlog rows with each BK guide header for the fields
that are allowed to drift during planning: owner, priority, dependencies and
RF/RNF coverage.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass
from pathlib import Path


BACKLOG_PATH = Path("docs/planificacao/backlogs/BACKLOG-MVP.md")
GUIDES_ROOT = Path("docs/planificacao/guias-bk")

HEADER_RE = re.compile(r"^- `(?P<key>[^`]+)`: `(?P<value>.*)`\s*$")
BK_ID_RE = re.compile(r"\bBK-[A-Z0-9]+-\d+\b")
REQ_ID_RE = re.compile(r"\b(?:RF|RNF)\d+\b|transversal|RF_ATIVOS_MVP")


@dataclass(frozen=True)
class BacklogItem:
    """Canonical metadata extracted from one backlog table row."""

    bk_id: str
    owner: str
    priority: str
    dependencies: tuple[str, ...]
    rf_rnf: tuple[str, ...]


@dataclass(frozen=True)
class GuideHeader:
    """Metadata extracted from the Markdown header of one BK guide."""

    path: Path
    bk_id: str
    owner: str
    priority: str
    dependencies: tuple[str, ...]
    rf_rnf: tuple[str, ...]


def clean_cell(value: str) -> str:
    """Normalize a Markdown table cell for metadata parsing."""

    return value.strip().replace("`", "").strip()


def parse_dependencies(value: str) -> tuple[str, ...]:
    """Return ordered BK dependency IDs, or an empty tuple for no dependency."""

    return tuple(BK_ID_RE.findall(value))


def parse_requirements(value: str) -> tuple[str, ...]:
    """Return ordered RF/RNF tokens used by the backlog and guide headers."""

    return tuple(REQ_ID_RE.findall(value))


def parse_backlog(root: Path) -> dict[str, BacklogItem]:
    """Parse all BK rows from BACKLOG-MVP.md."""

    path = root / BACKLOG_PATH
    items: dict[str, BacklogItem] = {}

    for line_number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
        if not line.startswith("| `BK-"):
            continue

        cells = [clean_cell(cell) for cell in line.strip().strip("|").split("|")]

        if len(cells) < 9:
            continue

        bk_id = cells[0]
        items[bk_id] = BacklogItem(
            bk_id=bk_id,
            owner=cells[2],
            priority=cells[4],
            dependencies=parse_dependencies(cells[7]),
            rf_rnf=parse_requirements(cells[8]),
        )

    return items


def parse_guide_header(path: Path) -> GuideHeader:
    """Parse the metadata header from one BK guide Markdown file."""

    values: dict[str, str] = {}

    for line in path.read_text(encoding="utf-8").splitlines():
        match = HEADER_RE.match(line)
        if match:
            values[match.group("key")] = match.group("value").strip()

        if line.startswith("## Bloco pedagogico"):
            break

    required_fields = ["bk_id", "owner", "prioridade", "dependencias", "rf_rnf"]
    missing = [field for field in required_fields if field not in values]

    if missing:
        raise ValueError(f"{path}: missing guide header fields: {', '.join(missing)}")

    return GuideHeader(
        path=path,
        bk_id=values["bk_id"],
        owner=values["owner"],
        priority=values["prioridade"],
        dependencies=parse_dependencies(values["dependencias"]),
        rf_rnf=parse_requirements(values["rf_rnf"]),
    )


def collect_guides(root: Path) -> dict[str, GuideHeader]:
    """Collect all BK guide headers under docs/planificacao/guias-bk/MF*/."""

    guides: dict[str, GuideHeader] = {}

    for path in sorted((root / GUIDES_ROOT).glob("MF*/BK-*.md")):
        header = parse_guide_header(path)

        if header.bk_id in guides:
            raise ValueError(f"duplicate guide header for {header.bk_id}: {guides[header.bk_id].path} and {path}")

        guides[header.bk_id] = header

    return guides


def compare_metadata(backlog: dict[str, BacklogItem], guides: dict[str, GuideHeader]) -> list[dict[str, str]]:
    """Return validation errors for metadata drift between backlog and guides."""

    errors: list[dict[str, str]] = []

    for bk_id, item in sorted(backlog.items()):
        guide = guides.get(bk_id)

        if guide is None:
            errors.append({"bk_id": bk_id, "field": "guide", "expected": "existing guide", "actual": "missing"})
            continue

        comparisons = [
            ("owner", item.owner, guide.owner),
            ("prioridade", item.priority, guide.priority),
            ("dependencias", ",".join(item.dependencies), ",".join(guide.dependencies)),
            ("rf_rnf", ",".join(item.rf_rnf), ",".join(guide.rf_rnf)),
        ]

        for field, expected, actual in comparisons:
            if expected != actual:
                errors.append({"bk_id": bk_id, "field": field, "expected": expected, "actual": actual})

        for dependency in guide.dependencies:
            if dependency not in backlog:
                errors.append({"bk_id": bk_id, "field": "dependencias", "expected": "existing BK", "actual": dependency})

    for bk_id, guide in sorted(guides.items()):
        if bk_id not in backlog:
            errors.append({"bk_id": bk_id, "field": "backlog", "expected": "listed in backlog", "actual": str(guide.path)})

    return errors


def build_result(root: Path, project: str) -> dict[str, object]:
    """Build a machine-readable validation result."""

    backlog = parse_backlog(root)
    guides = collect_guides(root)
    errors = compare_metadata(backlog, guides)

    return {
        "project": project,
        "status": "PASS" if not errors else "FAIL",
        "checked_bks": len(backlog),
        "checked_guides": len(guides),
        "errors": errors,
    }


def parse_args(argv: list[str]) -> argparse.Namespace:
    """Parse CLI arguments."""

    parser = argparse.ArgumentParser(description="Validate FaithFlix planning metadata.")
    parser.add_argument("--project", default="faithflix", help="Project name included in the output.")
    parser.add_argument("--json", action="store_true", help="Print JSON output.")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    """Run validation and return a process exit code."""

    args = parse_args(argv if argv is not None else sys.argv[1:])
    root = Path.cwd()

    try:
        result = build_result(root, args.project)
    except Exception as error:  # noqa: BLE001 - CLI should report validation setup failures.
        result = {
            "project": args.project,
            "status": "FAIL",
            "checked_bks": 0,
            "checked_guides": 0,
            "errors": [{"field": "validator", "expected": "successful execution", "actual": str(error)}],
        }

    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print(f"{result['status']}: checked {result['checked_bks']} BKs and {result['checked_guides']} guides")
        for error in result["errors"]:
            print(
                f"- {error.get('bk_id', '-')}: {error['field']} expected "
                f"{error['expected']!r}, got {error['actual']!r}",
            )

    return 0 if result["status"] == "PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
