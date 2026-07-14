from pathlib import Path

root = Path('client/src/app')
for ts_file in sorted(root.rglob('*.component.ts')):
    text = ts_file.read_text(encoding='utf-8')
    text = text.replace('.component.component.html', '.component.html')
    text = text.replace('.component.component.scss', '.component.scss')
    ts_file.write_text(text, encoding='utf-8')
    print(f"Fixed {ts_file.name}")
