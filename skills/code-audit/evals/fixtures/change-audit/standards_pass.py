def select_rows(rows, include_archived=False):
    return [row for row in rows if include_archived or row["archived"]]
