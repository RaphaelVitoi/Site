"""
Generate and display the top 10 review candidates by size.
"""

import json

FILE_PATH = "reports/review_candidates.json"
with open(FILE_PATH, encoding="utf-8") as file_handle:
    data = json.load(file_handle)

arr = [c for c in data["candidates"] if not c["path"].lower().startswith("_backups")]
arr_sorted = sorted(arr, key=lambda x: x.get("size_bytes") or 0, reverse=True)
for i, c in enumerate(arr_sorted[:10], 1):
    print(
        f"{i}. {c['path']} | size={c.get('size_bytes')} "
        f"| mtime={c.get('mtime')} | action={c.get('recommended_action')}"
    )
