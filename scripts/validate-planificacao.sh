#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

errors=0

pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; errors=$((errors+1)); }

assert_eq() {
  local name="$1" expected="$2" actual="$3"
  if [ "$actual" = "$expected" ]; then pass "$name ($actual)"; else fail "$name expected=$expected actual=$actual"; fi
}

assert_zero() {
  local name="$1" actual="$2"
  if [ "$actual" = "0" ]; then pass "$name ($actual)"; else fail "$name expected=0 actual=$actual"; fi
}

# ------------------------------
# 1) RF/RNF coverage
# ------------------------------
rf_count=$(awk -F'|' '/\| RF[0-9][0-9]/{gsub(/ /,"",$2); print $2}' docs/RF.md | sort -u | wc -l | tr -d ' ')
rnf_count=$(awk -F'|' '/\| RNF[0-9][0-9]/{gsub(/ /,"",$2); print $2}' docs/RNF.md | sort -u | wc -l | tr -d ' ')
cat <(awk -F'|' '/\| RF[0-9][0-9]/{gsub(/ /,"",$2); print $2}' docs/RF.md) \
    <(awk -F'|' '/\| RNF[0-9][0-9]/{gsub(/ /,"",$2); print $2}' docs/RNF.md) | sort -u > /tmp/validate_req_source.txt
awk -F'|' '/^\| `?(RF|RNF)[0-9][0-9]`? /{gsub(/[` ]/,"",$2); print $2}' docs/planificacao/backlogs/MATRIZ-RF-RNF-POR-BK.md | sort -u > /tmp/validate_req_matrix.txt

source_req_count=$(wc -l < /tmp/validate_req_source.txt | tr -d ' ')
matrix_req_count=$(wc -l < /tmp/validate_req_matrix.txt | tr -d ' ')
missing_req=$(comm -23 /tmp/validate_req_source.txt /tmp/validate_req_matrix.txt | wc -l | tr -d ' ')
extra_req=$(comm -13 /tmp/validate_req_source.txt /tmp/validate_req_matrix.txt | wc -l | tr -d ' ')

assert_eq "RF count" "63" "$rf_count"
assert_eq "RNF count" "40" "$rnf_count"
assert_eq "Source requirements unique count" "103" "$source_req_count"
assert_eq "Matrix requirements unique count" "103" "$matrix_req_count"
assert_zero "Missing requirements in matrix" "$missing_req"
assert_zero "Extra requirements in matrix" "$extra_req"

# ------------------------------
# 2) BK coverage (60/60)
# ------------------------------
awk -F'|' '/^\| `BK-MF[0-9]-[0-9][0-9]` / {pri=$6; gsub(/[` ]/,"",pri); if (pri ~ /^P[0-2]$/) {bk=$2; gsub(/[` ]/,"",bk); print bk}}' docs/planificacao/backlogs/BACKLOG-MVP.md | sort -u > /tmp/validate_backlog_bk.txt
rg -o 'BK-MF[0-9]-[0-9]{2}' docs/planificacao/backlogs/MATRIZ-RF-RNF-POR-BK.md | sort -u > /tmp/validate_matrix_bk.txt

backlog_bk_count=$(wc -l < /tmp/validate_backlog_bk.txt | tr -d ' ')
matrix_bk_count=$(wc -l < /tmp/validate_matrix_bk.txt | tr -d ' ')
missing_bk=$(comm -23 /tmp/validate_backlog_bk.txt /tmp/validate_matrix_bk.txt | wc -l | tr -d ' ')
extra_bk=$(comm -13 /tmp/validate_backlog_bk.txt /tmp/validate_matrix_bk.txt | wc -l | tr -d ' ')

assert_eq "Backlog BK count" "60" "$backlog_bk_count"
assert_eq "Matrix BK count" "60" "$matrix_bk_count"
assert_zero "Backlog BK missing in matrix artifact" "$missing_bk"
assert_zero "Matrix BK not in backlog" "$extra_bk"

# ------------------------------
# 3) Guides quality + policy
# ------------------------------
guides_total=$(rg --files docs/planificacao/guias-bk | rg 'BK-MF[0-9]-[0-9]{2}.*\.md$' | wc -l | tr -d ' ')
placeholder_next=$( (rg -l --fixed-strings 'A preencher conforme sequencia/dependencias do backlog.' docs/planificacao/guias-bk/MF*/BK-MF*.md || true) | wc -l | tr -d ' ' )
generic_objective=$( (rg -l --fixed-strings 'com entrega verificavel, preservando o scope do backlog e o contrato pedagogico de evidencia.' docs/planificacao/guias-bk/MF*/BK-MF*.md || true) | wc -l | tr -d ' ' )
with_snippet=$( (rg -l '```text' docs/planificacao/guias-bk/MF*/BK-MF*.md || true) | wc -l | tr -d ' ' )

assert_eq "Guide files total" "60" "$guides_total"
assert_zero "Guides with placeholder next BK" "$placeholder_next"
assert_zero "Guides with generic objective phrase" "$generic_objective"
assert_eq "Guides with snippet block" "60" "$with_snippet"

policy_errors=0
invalid_next_format=0
terminal_next_count=0
while IFS= read -r f; do
  pri=$(sed -n 's/^- `prioridade`: `\(P[0-2]\)`$/\1/p' "$f")
  neg_lines=$(rg -n '^- \[ \] Negativo [0-9]+:' "$f" | wc -l | tr -d ' ')
  next_id=$(awk '
    /## Proximo BK recomendado/{
      while (getline) {
        if ($0 !~ /^[[:space:]]*$/) {
          gsub(/[` ]/, "", $0)
          print $0
          exit
        }
      }
    }
  ' "$f")
  if [[ "$next_id" = "-" ]]; then
    terminal_next_count=$((terminal_next_count+1))
  elif ! [[ "$next_id" =~ ^BK-MF[0-9]-[0-9]{2}$ ]]; then
    invalid_next_format=$((invalid_next_format+1))
  fi

  if [ "$pri" = "P2" ]; then
    if [ "$neg_lines" -lt 1 ]; then policy_errors=$((policy_errors+1)); fi
  else
    if [ "$neg_lines" -lt 3 ]; then policy_errors=$((policy_errors+1)); fi
  fi
done < <(rg --files docs/planificacao/guias-bk | rg 'BK-MF[0-9]-[0-9]{2}.*\.md$')

assert_zero "Guides violating negative policy" "$policy_errors"
assert_zero "Guides with invalid next BK format" "$invalid_next_format"
assert_eq "Guides with terminal next marker '-'" "1" "$terminal_next_count"

# ------------------------------
# 4) Cross-integrity backlog <-> guides
# ------------------------------
awk -F'|' '/^\| `BK-MF[0-9]-[0-9][0-9]` / {pri=$6; gsub(/[` ]/,"",pri); if (pri ~ /^P[0-2]$/) {bk=$2; owner=$4; dep=$9; rfrnf=$10; gsub(/[` ]/,"",bk); gsub(/[` ]/,"",owner); gsub(/[` ]/,"",dep); gsub(/[` ]/,"",rfrnf); print bk"|"owner"|"pri"|"dep"|"rfrnf}}' docs/planificacao/backlogs/BACKLOG-MVP.md | sort -u > /tmp/validate_backlog_map.txt

cross_errors=0
while IFS= read -r f; do
  bk=$(sed -n 's/^- `bk_id`: `\(BK-MF[0-9]-[0-9][0-9]\)`$/\1/p' "$f")
  owner=$(sed -n 's/^- `owner`: `\([^`]*\)`$/\1/p' "$f" | tr -d ' ')
  pri=$(sed -n 's/^- `prioridade`: `\(P[0-2]\)`$/\1/p' "$f")
  dep=$(sed -n 's/^- `dependencias`: `\([^`]*\)`$/\1/p' "$f" | tr -d ' ')
  rfrnf=$(sed -n 's/^- `rf_rnf`: `\([^`]*\)`$/\1/p' "$f" | tr -d ' ')

  row=$(awk -F'|' -v b="$bk" '$1==b{print $0}' /tmp/validate_backlog_map.txt)
  if [ -z "$row" ]; then
    cross_errors=$((cross_errors+1))
    continue
  fi

  b_owner=$(echo "$row" | cut -d'|' -f2)
  b_pri=$(echo "$row" | cut -d'|' -f3)
  b_dep=$(echo "$row" | cut -d'|' -f4)
  b_rfrnf=$(echo "$row" | cut -d'|' -f5)

  if [ "$owner" != "$b_owner" ] || [ "$pri" != "$b_pri" ] || [ "$dep" != "$b_dep" ] || [ "$rfrnf" != "$b_rfrnf" ]; then
    cross_errors=$((cross_errors+1))
  fi
done < <(rg --files docs/planificacao/guias-bk | rg 'BK-MF[0-9]-[0-9]{2}.*\.md$')

assert_zero "Cross-integrity mismatches backlog<->guides" "$cross_errors"

# ------------------------------
# 5) Sprint load checks
# ------------------------------
awk -F'|' '/^\| `BK-MF[0-9]-[0-9][0-9]` / {pri=$6; gsub(/[` ]/,"",pri); if (pri ~ /^P[0-2]$/) {bk=$2; effort=$8; gsub(/[` ]/,"",bk); gsub(/[` ]/,"",effort); pts=(effort=="S"?1:(effort=="M"?2:(effort=="L"?3:0))); print bk" "pts}}' docs/planificacao/backlogs/BACKLOG-MVP.md > /tmp/validate_bk_points.txt

sprint_rows=$(grep '^| `Sprint [0-9]' docs/planificacao/sprints/PLANO-SPRINTS.md | wc -l | tr -d ' ')
assert_eq "Sprint rows" "12" "$sprint_rows"

max_load=0
load_errors=0
while IFS='|' read -r _ sprint_col _ bk_col _; do
  sprint=$(echo "$sprint_col" | tr -d '` ' | sed 's/Sprint//')
  bks=$(echo "$bk_col" | tr -d '` ')
  total=0
  IFS=',' read -r -a parts <<< "$bks"
  for p in "${parts[@]}"; do
    if [[ "$p" =~ ^BK-MF([0-9])-([0-9]{2})\.\.([0-9]{2})$ ]]; then
      prefix="BK-MF${BASH_REMATCH[1]}-"
      start=${BASH_REMATCH[2]}
      end=${BASH_REMATCH[3]}
      for n in $(seq -f '%02g' "$start" "$end"); do
        bk="${prefix}${n}"
        pts=$(awk -v b="$bk" '$1==b{print $2}' /tmp/validate_bk_points.txt)
        total=$((total+pts))
      done
    else
      pts=$(awk -v b="$p" '$1==b{print $2}' /tmp/validate_bk_points.txt)
      total=$((total+pts))
    fi
  done
  if [ "$total" -gt "$max_load" ]; then max_load="$total"; fi
  if [ "$total" -gt 11 ]; then load_errors=$((load_errors+1)); fi
  echo "INFO: Sprint${sprint} load=${total}"
done < <(grep '^| `Sprint [0-9]' docs/planificacao/sprints/PLANO-SPRINTS.md)

assert_zero "Sprints over 11 points" "$load_errors"

# ------------------------------
# 6) Canonical order consistency
# ------------------------------
read -r sprint_order_total sprint_order_unique sprint_order_duplicates mf_order_total mf_only_in_sprint mf_only_in_mfviews mf_relative_conflicts guide_next_conflicts guide_terminal_count <<<"$(python3 - <<'PY'
import re
from pathlib import Path
root = Path('.')

sp = (root / 'docs/planificacao/sprints/PLANO-SPRINTS.md').read_text().splitlines()
mv = (root / 'docs/planificacao/backlogs/MF-VIEWS.md').read_text().splitlines()

def expand(expr):
    out = []
    for part in [p.strip().strip('`') for p in expr.split(',')]:
        m = re.fullmatch(r'BK-MF(\d)-(\d{2})\.\.(\d{2})', part)
        if m:
            mfid, a, b = m.groups()
            for n in range(int(a), int(b) + 1):
                out.append(f'BK-MF{mfid}-{n:02d}')
        elif re.fullmatch(r'BK-MF\d-\d{2}', part):
            out.append(part)
    return out

sprint_order = []
for line in sp:
    if line.startswith('| `Sprint '):
        cols = [c.strip() for c in line.split('|')]
        sprint_order.extend(expand(cols[3]))

mf_order = []
in_seq = False
for line in mv:
    if line.strip() == '### Sequencia':
        in_seq = True
        continue
    if in_seq and line.startswith('### '):
        in_seq = False
    if in_seq:
        m = re.match(r'\d+\.\s*`(BK-MF\d-\d{2})`', line.strip())
        if m:
            mf_order.append(m.group(1))

s_set = set(sprint_order)
m_set = set(mf_order)
mf_only_in_sprint = len(s_set - m_set)
mf_only_in_mfviews = len(m_set - s_set)

pos_s = {bk: i for i, bk in enumerate(sprint_order)}
pos_m = {bk: i for i, bk in enumerate(mf_order)}
common = [bk for bk in sprint_order if bk in pos_m]
relative_conflicts = 0
for i, a in enumerate(common):
    for b in common[i + 1:]:
        if (pos_s[a] - pos_s[b]) * (pos_m[a] - pos_m[b]) < 0:
            relative_conflicts += 1

next_map = {}
for i, bk in enumerate(sprint_order):
    next_map[bk] = sprint_order[i + 1] if i + 1 < len(sprint_order) else '-'

guide_next_conflicts = 0
guide_terminal_count = 0
for g in sorted((root / 'docs/planificacao/guias-bk').glob('MF*/BK-MF*.md')):
    txt = g.read_text().splitlines()
    bk = None
    nxt = None
    for ln in txt:
        m = re.match(r'- `bk_id`: `(BK-MF\d-\d{2})`', ln)
        if m:
            bk = m.group(1)
            break
    for i, ln in enumerate(txt):
        if ln.strip() == '## Proximo BK recomendado':
            j = i + 1
            while j < len(txt) and txt[j].strip() == '':
                j += 1
            if j < len(txt):
                nxt = re.sub(r'[` ]', '', txt[j].strip())
            break
    if nxt == '-':
        guide_terminal_count += 1
    if bk and nxt is not None and next_map.get(bk) != nxt:
        guide_next_conflicts += 1

print(
    len(sprint_order),
    len(set(sprint_order)),
    len(sprint_order) - len(set(sprint_order)),
    len(mf_order),
    mf_only_in_sprint,
    mf_only_in_mfviews,
    relative_conflicts,
    guide_next_conflicts,
    guide_terminal_count
)
PY
)"

assert_eq "Sprint flattened BK total" "60" "$sprint_order_total"
assert_eq "Sprint flattened BK unique" "60" "$sprint_order_unique"
assert_zero "Sprint flattened BK duplicates" "$sprint_order_duplicates"
assert_eq "MF-VIEWS sequence BK total" "60" "$mf_order_total"
assert_zero "BK present only in sprints order" "$mf_only_in_sprint"
assert_zero "BK present only in MF-VIEWS order" "$mf_only_in_mfviews"
assert_zero "MF-VIEWS relative precedence conflicts vs sprints" "$mf_relative_conflicts"
assert_zero "Guide next-BK conflicts vs canonical order" "$guide_next_conflicts"
assert_eq "Guide terminal next markers" "1" "$guide_terminal_count"

# ------------------------------
# 7) Gate format + references
# ------------------------------
gate_missing=0
for pattern in \
  '## Baseline documental' \
  '## Execucao real - Gate S4' \
  '## Execucao real - Gate S8' \
  '## Execucao real - Gate S12' \
  'scripts/validate-planificacao.sh'
do
  if ! rg -q --fixed-strings "$pattern" docs/planificacao/sprints/RELATORIO-GATES-S4-S8-S12.md; then
    gate_missing=$((gate_missing+1))
  fi
done
assert_zero "Gate report required sections missing" "$gate_missing"

# ------------------------------
# 8) Core metadata alignment
# ------------------------------
meta_errors=0
for f in \
  docs/planificacao/README.md \
  docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md \
  docs/planificacao/backlogs/BACKLOG-MVP.md \
  docs/planificacao/backlogs/MATRIZ-RF-RNF-POR-BK.md \
  docs/planificacao/sprints/PLANO-SPRINTS.md \
  docs/planificacao/sprints/RELATORIO-GATES-S4-S8-S12.md \
  docs/planificacao/guias-bk/README.md

do
  if ! rg -q --fixed-strings '2026-04-13' "$f"; then
    meta_errors=$((meta_errors+1))
  fi
done
assert_zero "Core docs without aligned last_updated date" "$meta_errors"

# ------------------------------
# Final
# ------------------------------
if [ "$errors" -gt 0 ]; then
  echo "VALIDATION_RESULT=FAIL errors=$errors"
  exit 1
fi

echo "VALIDATION_RESULT=PASS errors=0"
