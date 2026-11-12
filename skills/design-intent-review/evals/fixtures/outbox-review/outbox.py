from dataclasses import dataclass


@dataclass(frozen=True)
class Message:
    id: str
    body: str


class Outbox:
    def __init__(self, messages):
        self._pending = list(messages)

    def next_message(self):
        return self._pending[0] if self._pending else None

    def acknowledge(self, message_id):
        if not self._pending or self._pending[0].id != message_id:
            raise ValueError("Only the oldest pending message can be acknowledged")
        self._pending.pop(0)

    def pending_ids(self):
        return [message.id for message in self._pending]
