"""Capture and compare the actual public adapter results."""
import copy
import json
from pathlib import Path
import sys

from batch_quote import quote_batch
from web_quote import quote


def observe():
    rows = [
        {"id": "q1", "net_cents": 102, "category": "standard"},
        {"id": "q2", "net_cents": 102, "category": "book"},
        {"id": "q3", "net_cents": 3, "category": "other"},
    ]
    original = copy.deepcopy(rows)
    return {
        "web": [quote(row) for row in rows],
        "batch": quote_batch(rows),
        "empty": quote_batch([]),
        "unchanged": rows == original,
        "zero": quote({"net_cents": 0, "category": "standard"}),
    }


def main():
    command = sys.argv[1] if len(sys.argv) > 1 else "observe"
    result = observe()
    if command == "observe":
        print(json.dumps(result, sort_keys=True))
        return
    if len(sys.argv) != 3 or command not in {"capture", "compare"}:
        raise SystemExit("usage: consumer_checks.py [observe|capture PATH|compare PATH]")
    baseline = Path(sys.argv[2])
    if command == "capture":
        with baseline.open("x", encoding="utf-8") as target:
            json.dump(result, target, indent=2, sort_keys=True)
        print("Captured baseline:", json.dumps(result, sort_keys=True))
    else:
        if json.loads(baseline.read_text(encoding="utf-8")) != result:
            raise SystemExit("Public consumer results changed")
        print("Public consumers match baseline")


if __name__ == "__main__":
    main()
