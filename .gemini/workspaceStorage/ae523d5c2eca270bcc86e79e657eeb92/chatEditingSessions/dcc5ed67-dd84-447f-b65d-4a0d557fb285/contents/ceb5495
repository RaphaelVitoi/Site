import json
p='reports/review_candidates.json'
j=json.load(open(p,encoding='utf-8'))
arr=[c for c in j['candidates'] if not c['path'].lower().startswith('_backups')]
arr_sorted=sorted(arr,key=lambda x: (x.get('size_bytes') or 0),reverse=True)
for i,c in enumerate(arr_sorted[:10],1):
    print(f"{i}. {c['path']} | size={c.get('size_bytes')} | mtime={c.get('mtime')} | action={c.get('recommended_action')}")
