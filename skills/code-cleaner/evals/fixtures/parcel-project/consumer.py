from parcel_labels import render_labels


def manifest_text(records, prefix=""):
    return "\n".join(render_labels(records, prefix))


def preview_label(records, prefix=""):
    return next(render_labels(records, prefix), None)
