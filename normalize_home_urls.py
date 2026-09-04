from pathlib import Path

# One-time branch helper for normalizing homepage URL references.
changed = []
for path in Path('.').rglob('*.html'):
    text = path.read_text(encoding='utf-8')
    updated = text.replace('href="index.html"', 'href="/"')
    updated = updated.replace('href="../index.html"', 'href="/"')
    updated = updated.replace(
        'https://atlantapoolremoval.com/index.html',
        'https://atlantapoolremoval.com/'
    )
    if updated != text:
        path.write_text(updated, encoding='utf-8')
        changed.append(str(path))

print(f'Updated {len(changed)} HTML files:')
for path in changed:
    print(path)
