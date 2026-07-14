from pathlib import Path

root = Path('client/src/app')
for path in sorted(root.rglob('*.component.ts')):
    text = path.read_text(encoding='utf-8')
    text = text.replace("templateUrl: './" + path.stem + ".component.html'", "templateUrl: './" + path.name.replace('.ts', '.html') + "'")
    text = text.replace("styleUrl: './" + path.stem + ".component.scss'", "styleUrl: './" + path.name.replace('.ts', '.scss') + "'")
    path.write_text(text, encoding='utf-8')

for path in sorted(root.rglob('*.component.component.html')):
    new_path = path.with_name(path.name.replace('.component.component.html', '.component.html'))
    path.rename(new_path)

for path in sorted(root.rglob('*.component.component.scss')):
    new_path = path.with_name(path.name.replace('.component.component.scss', '.component.scss'))
    path.rename(new_path)
