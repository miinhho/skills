import unittest

from ledger.store import Ledger


class LedgerContractTests(unittest.TestCase):
    def test_zero_and_absence_are_distinct(self):
        ledger = Ledger()
        ledger.set_balance("007", 0)
        self.assertEqual(ledger.balance_for("007"), 0)
        with self.assertRaises(KeyError):
            ledger.balance_for("7")

    def test_identifiers_remain_distinct(self):
        ledger = Ledger()
        ledger.set_balance("007", 4)
        ledger.set_balance("7", 9)
        self.assertEqual(ledger.balance_for("007"), 4)
        self.assertEqual(ledger.balance_for("7"), 9)
