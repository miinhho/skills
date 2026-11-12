# Export-only guidance

This directory owns the public export representation. Preserve lexicographic account-key order in serialized exports, even when callers request balances in a different order. This ordering rule applies to exports only, not to the storage API or its callers.

Consume ledger.store.balance_for for lookups. Do not read or mirror its private balance mapping.
