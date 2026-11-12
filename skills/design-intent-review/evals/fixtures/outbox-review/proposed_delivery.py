def dispatch_next(outbox, send):
    message = outbox.next_message()
    if message is None:
        return "idle"
    outbox.acknowledge(message.id)
    send(message)
    return "delivered"
