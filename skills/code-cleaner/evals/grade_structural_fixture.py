"""Evaluator-only structural migration checks; withhold from the executor."""
import ast
import json
from pathlib import Path
import subprocess
import sys


PROBE = r'''
import copy
from decimal import Decimal, ROUND_HALF_UP
import json
from consumer_checks import observe
import batch_quote
import quote_policy
import web_quote

assert quote_policy.VAT_PERCENT == 20
assert callable(quote_policy.total_cents)
for net in [0, 1, 2, 3, 4, 7, 102, 999999]:
    for category in ["book", "standard", "BOOK", "other"]:
        expected = net if category == "book" else int((Decimal(net) * Decimal("1.20")).quantize(Decimal("1"), rounding=ROUND_HALF_UP))
        record = {"id": "x", "net_cents": net, "category": category}
        original = copy.deepcopy(record)
        assert quote_policy.total_cents(net, category) == expected
        assert web_quote.quote(record) == {"total_cents": expected}
        assert batch_quote.quote_batch([record]) == [{"id": "x", "total_cents": expected}]
        assert record == original
for function, argument, missing in [
    (web_quote.quote, {"category": "book"}, "net_cents"),
    (web_quote.quote, {"net_cents": 5}, "category"),
    (batch_quote.quote_batch, [{"net_cents": 5, "category": "book"}], "id"),
]:
    try:
        function(argument)
    except KeyError as error:
        assert error.args == (missing,)
    else:
        raise AssertionError("Missing-key behavior changed")
print(json.dumps(observe(), sort_keys=True))
'''


def main():
    if len(sys.argv) != 3:
        raise SystemExit("usage: grade_structural_fixture.py DISPOSABLE_PROJECT EXTERNAL_BASELINE_JSON")
    root = Path(sys.argv[1]).resolve()
    owner = Path(__file__).resolve().parent
    fixture = owner / "fixtures" / "quote-project"
    expected = json.loads((owner / "grading" / "quote_expected.json").read_text(encoding="utf-8"))
    baseline = json.loads(Path(sys.argv[2]).read_text(encoding="utf-8"))
    if baseline != expected:
        raise SystemExit("Baseline differs from independent consumer expectations")
    for name in ["consumer_checks.py", "design.txt"]:
        if (root / name).read_bytes() != (fixture / name).read_bytes():
            raise SystemExit("Protected fixture changed: " + name)
    for name in ["quote_policy.py", "web_quote.py", "batch_quote.py"]:
        if (root / name).read_bytes() == (fixture / name).read_bytes():
            raise SystemExit("Required migration did not update: " + name)
    for name in ["web_quote.py", "batch_quote.py"]:
        tree = ast.parse((root / name).read_text(encoding="utf-8"))
        if any(isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)) and node.name == "_total" for node in ast.walk(tree)):
            raise SystemExit("Obsolete private policy helper remains: " + name)
    run = subprocess.run([sys.executable, "-B", "-c", PROBE], cwd=root, capture_output=True, text=True, encoding="utf-8", timeout=15)
    if run.returncode:
        print(run.stdout)
        print(run.stderr, file=sys.stderr)
        raise SystemExit("Structural consumer/held-out checks failed")
    if json.loads(run.stdout) != expected:
        raise SystemExit("Public consumer output changed")
    print("Structural consumer and held-out checks match; inspect the diff/trace for single-owner reuse and execution claims")


if __name__ == "__main__":
    main()
