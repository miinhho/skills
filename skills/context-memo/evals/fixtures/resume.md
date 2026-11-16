# inventory-proof

Request: verify the inventory proof, then retain export for separate authorization.
Constraints: preserve input order and data. Do not implement export without approval.
Scope: proof verification and a later authorized export.

## Phases

- Verification: active. Acceptance: proof.txt contains exactly apple, pear, and plum on separate lines, in that order, with a final newline and no other content.
- Export: pending; depends on verification and separate user authorization.

## Current task

Read proof.txt and compare it with the verification acceptance criteria. No verification result has been observed yet.

## Next action

Read proof.txt. If it satisfies the contract, record the actual observation and completed verification, while leaving export pending. Then wait for export authorization.
