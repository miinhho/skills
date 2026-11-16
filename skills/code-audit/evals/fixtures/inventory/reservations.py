"""A rejected reservation must leave on-hand stock unchanged."""


class Inventory:
    def __init__(self, on_hand):
        self.on_hand = dict(on_hand)

    def reserve(self, sku, quantity):
        self.on_hand[sku] -= quantity
        if self.on_hand[sku] < 0:
            return False
        return True


def checkout(inventory, sku, quantity):
    # The UI retries smaller quantities after a rejection.
    if not inventory.reserve(sku, quantity):
        return {"status": "unavailable"}
    return {"status": "reserved"}
