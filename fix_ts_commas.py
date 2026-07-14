from pathlib import Path

root = Path('client/src/app')
for ts_file in sorted(root.rglob('*.component.ts')):
    text = ts_file.read_text(encoding='utf-8')
    # Fix: templateUrl: '...' without comma followed by styleUrl
    text = text.replace("templateUrl: './", "templateUrl: './")
    text = text.replace(".html'\n  styleUrl:", ".html',\n  styleUrl:")
    ts_file.write_text(text, encoding='utf-8')
    print(f"Fixed commas in {ts_file.name}")
