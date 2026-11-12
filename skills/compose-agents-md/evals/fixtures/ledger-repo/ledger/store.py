class Ledger:
    """Own balances keyed by opaque account identifiers."""

    def __init__(self):
        self._balances = {}

    def set_balance(self, account_id, balance):
        self._balances[account_id] = balance

    def balance_for(self, account_id):
        """Return a stored balance; raise KeyError when the account is absent."""
        return self._balances[account_id]
