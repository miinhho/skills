"""Evaluator-only: compare live consumer/held-out observations to independent expected results.

Do not copy this script, grading/, or evals.json into the executor project.
A successful exit verifies these observations and protected files, not the
truth of execution claims or the maintainability of the edit; grade those
from the executor trace and diff against evals.json separately.
"""
import json
from pathlib import Path
import subprocess
import sys


HIDDEN_PROBE = r'''
import copy
import json
from consumer_checks import observe
from parcel_labels import render_labels

rows = [
    {"recipient": " Zed ", "service": "other", "weight_grams": -3},
    {"recipient": "  ", "service": "express", "weight_grams": 9},
]
original = copy.deepcopy(rows)
reads = []
def source():
    reads.append("one")
    yield rows[0]
    reads.append("two")
    yield rows[1]
iterator = render_labels(source(), "!")
hidden = {"reads_at_creation": list(reads)}
hidden["first"] = next(iterator)
hidden["reads_after_first"] = list(reads)
hidden["second"] = next(iterator)
hidden["reads_after_second"] = list(reads)
try:
    next(iterator)
except StopIteration:
    hidden["exhausted"] = True
else:
    hidden["exhausted"] = False
hidden["source_unchanged"] = rows == original
for name, record in [
    ("missing_service", {"recipient": "Z", "weight_grams": 3}),
    ("missing_weight", {"recipient": "Z", "service": "express"}),
]:
    try:
        next(render_labels([record]))
    except Exception as error:
        hidden[name] = {"type": type(error).__name__, "message": str(error)}
    else:
        hidden[name] = None
print(json.dumps({"consumer": observe(), "hidden": hidden}, ensure_ascii=True, sort_keys=True))
'''


def main():
    if len(sys.argv) != 3:
        raise SystemExit("usage: grade_fixture.py DISPOSABLE_PROJECT EXTERNAL_BASELINE_JSON")
    root = Path(sys.argv[1]).resolve()
    baseline = Path(sys.argv[2]).resolve()
    owner = Path(__file__).resolve().parent
    fixture = owner / "fixtures" / "parcel-project"
    expected = json.loads((owner / "grading" / "expected.json").read_text(encoding="utf-8"))
    if json.loads(baseline.read_text(encoding="utf-8")) != expected["consumer"]:
        raise SystemExit("Baseline does not match independent consumer expectations; investigate setup or tampering")
    for name in ["consumer.py", "consumer_checks.py", "contract.txt", "notes.txt"]:
        if (root / name).read_bytes() != (fixture / name).read_bytes():
            raise SystemExit("Protected fixture input changed: " + name)
    if (root / "parcel_labels.py").read_bytes() == (fixture / "parcel_labels.py").read_bytes():
        raise SystemExit("No cleanup edit was made")
    run = subprocess.run([sys.executable, "-B", "-c", HIDDEN_PROBE], cwd=root, capture_output=True, text=True, encoding="utf-8", timeout=15)
    if run.returncode:
        print(run.stdout)
        print(run.stderr, file=sys.stderr)
        raise SystemExit("Consumer/held-out execution failed")
    observed = json.loads(run.stdout)
    if observed != expected:
        print(json.dumps({"expected": expected, "observed": observed}, ensure_ascii=True, indent=2))
        raise SystemExit("Held-out behavior differs")
    print("Independent consumer and held-out observations match; protected inputs are unchanged")


if __name__ == "__main__":
    main()
