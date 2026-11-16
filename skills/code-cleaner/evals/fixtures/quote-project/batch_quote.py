from quote_policy import VAT_PERCENT


def _total(net_cents, category):
    if category == "book":
        return net_cents
    return net_cents + (net_cents * VAT_PERCENT + 50) // 100


def quote_batch(rows):
    return [
        {"id": row["id"], "total_cents": _total(row["net_cents"], row["category"])}
        for row in rows
    ]
