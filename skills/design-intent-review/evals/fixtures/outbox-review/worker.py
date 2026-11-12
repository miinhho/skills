def run_attempt(dispatch, outbox, send):
    try:
        return dispatch(outbox, send)
    except ConnectionError:
        # The scheduler invokes this caller again on the next tick.
        return "retry"
