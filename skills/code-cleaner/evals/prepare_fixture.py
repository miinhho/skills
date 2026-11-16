"""Copy only executor inputs to a new disposable project; never copy grading data."""
from pathlib import Path
import shutil
import sys


def main():
    if len(sys.argv) not in {2, 3}:
        raise SystemExit("usage: prepare_fixture.py NEW_DISPOSABLE_DIRECTORY [parcel-project|quote-project]")
    name = sys.argv[2] if len(sys.argv) == 3 else "parcel-project"
    if name not in {"parcel-project", "quote-project"}:
        raise SystemExit("Unknown fixture")
    source = Path(__file__).resolve().parent / "fixtures" / name
    destination = Path(sys.argv[1]).resolve()
    if destination.exists():
        raise SystemExit("Destination must not exist; choose a new disposable directory")
    shutil.copytree(source, destination)
    print("Prepared executor project:", destination)
    print("Capture its baseline outside the project before editing; keep grading files unavailable to the executor.")


if __name__ == "__main__":
    main()
