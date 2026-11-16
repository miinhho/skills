"""Execute real consumers and compare observations with a pre-edit baseline."""
import copy
import json
from pathlib import Path
import sys

from consumer import manifest_text, preview_label
from parcel_labels import render_labels


def observe():
    rows = [
        {"recipient": "  Mira  ", "service": "express", "weight_grams": 250},
        {"recipient": "Noor", "service": "economy", "weight_grams": 0},
        {"recipient": "  李  ", "service": "EXPRESS", "weight_grams": 12},
    ]
    original = copy.deepcopy(rows)
    reads = []

    def preview_source():
        reads.append("first")
        yield rows[0]
        reads.append("second")
        raise RuntimeError("preview consumed too far")

    preview = preview_label(preview_source(), "P: ")
    invalid = render_labels([{}])
    created = True
    try:
        next(invalid)
    except Exception as error:
        failure = {"type": type(error).__name__, "message": str(error)}
    else:
        failure = None
    return {
        "manifest": manifest_text(rows, "#"),
        "empty_manifest": manifest_text([]),
        "empty_preview": preview_label([]),
        "preview": preview,
        "preview_reads": reads,
        "rows_unchanged": rows == original,
        "invalid_iterator_created": created,
        "invalid_iteration_error": failure,
        "default_prefix": list(render_labels([rows[1]])),
    }


def main():
    command = sys.argv[1] if len(sys.argv) > 1 else "observe"
    observed = observe()
    if command == "observe":
        print(json.dumps(observed, ensure_ascii=True, sort_keys=True))
        return
    if len(sys.argv) != 3 or command not in {"capture", "compare"}:
        raise SystemExit("usage: consumer_checks.py [observe|capture PATH|compare PATH]")
    path = Path(sys.argv[2])
    if command == "capture":
        with path.open("x", encoding="utf-8") as target:
            json.dump(observed, target, ensure_ascii=False, indent=2, sort_keys=True)
        print("Baseline observations captured:", path)
        print(json.dumps(observed, ensure_ascii=True, sort_keys=True))
    else:
        baseline = json.loads(path.read_text(encoding="utf-8"))
        if observed != baseline:
            print(json.dumps({"baseline": baseline, "observed": observed}, ensure_ascii=True, indent=2))
            raise SystemExit("Consumer behavior differs from baseline")
        print("Consumer observations match the captured baseline")


if __name__ == "__main__":
    main()
