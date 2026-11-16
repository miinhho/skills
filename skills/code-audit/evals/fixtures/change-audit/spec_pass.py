def select_rows(rows, include_archived=False):
    selectedRows = [row for row in rows if include_archived or not row["archived"]]
    return selectedRows
