def dispatch_next(outbox, send):
    message = outbox.next_message()
    if message is None:
        return "idle"
    send(message)
    outbox.acknowledge(message.id)
    return "delivered"
