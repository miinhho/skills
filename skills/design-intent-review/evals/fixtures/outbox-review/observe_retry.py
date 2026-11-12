"""Print observations from two attempts; this program does not grade the design."""
import json

from delivery import dispatch_next as current_dispatch
from outbox import Message, Outbox
from proposed_delivery import dispatch_next as proposed_dispatch
from worker import run_attempt


def observe(dispatch):
    outbox = Outbox([Message("notice-1", "Ready for collection")])
    accepted = []
    calls = 0

    def send(message):
        nonlocal calls
        calls += 1
        if calls == 1:
            raise ConnectionError("Receiver unavailable before accepting message")
        accepted.append(message.id)

    first_status = run_attempt(dispatch, outbox, send)
    pending_after_failure = outbox.pending_ids()
    second_status = run_attempt(dispatch, outbox, send)
    return {
        "first_status": first_status,
        "pending_after_failure": pending_after_failure,
        "second_status": second_status,
        "accepted": accepted,
        "pending_after_second": outbox.pending_ids(),
    }


if __name__ == "__main__":
    print(json.dumps({
        "current": observe(current_dispatch),
        "proposed": observe(proposed_dispatch),
    }, indent=2))
