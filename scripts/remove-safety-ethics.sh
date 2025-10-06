#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DATA_DIR="$ROOT_DIR/src/data/showcaseV2"

if [ ! -d "$DATA_DIR" ]; then
  echo "Data directory not found: $DATA_DIR" >&2
  exit 1
fi

export DATA_DIR

python3 - <<'PY'
import os
import pathlib
import re

data_dir = pathlib.Path(os.environ['DATA_DIR'])
pattern = re.compile(r"\n\s*safetyEthics:\s*\[[^\]]*\],?")

for path in sorted(data_dir.glob('*.ts')):
    text = path.read_text()
    if 'safetyEthics' not in text:
        continue
    new_text = pattern.sub('', text)
    new_text = re.sub(r"\n{3,}", "\n\n", new_text)
    path.write_text(new_text)
    print(f"Removed safetyEthics from {path.name}")

print('Safety & ethics entries removed.')
PY
