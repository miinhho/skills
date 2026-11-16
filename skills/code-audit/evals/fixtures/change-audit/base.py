def select_rows(rows):
    return [row for row in rows if not row["archived"]]
