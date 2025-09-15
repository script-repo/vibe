import csv
from datetime import datetime
from typing import List, Dict, Any

try:
    from tabulate import tabulate
except Exception:  # pragma: no cover
    tabulate = None


def timestamped_filename(prefix: str, suffix: str = ".csv") -> str:
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    return f"{prefix}_{ts}{suffix}"


def save_csv(rows: List[Dict[str, Any]], filename: str) -> str:
    if not rows:
        return filename
    with open(filename, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)
    return filename


def print_table(rows: List[Dict[str, Any]], title: str = "") -> None:
    if title:
        print(f"\n{title}")
    if not rows:
        print("(no rows)")
        return
    if tabulate is not None:
        print(tabulate(rows, headers="keys", tablefmt="orgtbl"))
        return
    # Fallback simple table
    headers = list(rows[0].keys())
    print(" | ".join(headers))
    for r in rows:
        print(" | ".join(str(r.get(h, "")) for h in headers))
