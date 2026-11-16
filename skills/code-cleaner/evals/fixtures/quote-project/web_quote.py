from quote_policy import VAT_PERCENT


def _total(net_cents, category):
    if category == "book":
        return net_cents
    return net_cents + (net_cents * VAT_PERCENT + 50) // 100


def quote(request):
    return {"total_cents": _total(request["net_cents"], request["category"])}
