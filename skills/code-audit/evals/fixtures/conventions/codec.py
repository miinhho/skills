"""Wire-protocol codecs deliberately use local explicit branches.

The protocol has exactly these two message types. The integer version and
field order are external contracts. No extension mechanism is requested.
"""


def encode(message):
    if message["kind"] == "ping":
        return (1, message["nonce"])
    if message["kind"] == "pong":
        return (2, message["nonce"])
    raise ValueError("unsupported kind")


def decode(frame):
    tag, nonce = frame
    if tag == 1:
        return {"kind": "ping", "nonce": nonce}
    if tag == 2:
        return {"kind": "pong", "nonce": nonce}
    raise ValueError("unsupported tag")
