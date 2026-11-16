"""Public label iterator; consumed by manifest and preview callers."""


def _as_text(value):
    return str(value)


def _legacy_label(record):
    # Removed integration; not a supported consumer or public API.
    return record["recipient"].upper()


def render_labels(records, prefix=""):
    for record in records:
        recipient = record["recipient"].strip()
        if record["service"] == "express":
            label = prefix + recipient + " | EXPRESS | " + _as_text(record["weight_grams"]) + "g"
            yield label
        else:
            label = prefix + recipient + " | STANDARD | " + _as_text(record["weight_grams"]) + "g"
            yield label
