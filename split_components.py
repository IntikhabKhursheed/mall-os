from pathlib import Path
import re

root = Path('client/src/app')
files = sorted(root.rglob('*.component.ts'))

for path in files:
    text = path.read_text(encoding='utf-8')
    if 'template:' not in text and 'styles:' not in text:
        continue

    html_path = path.with_suffix('.component.html')
    scss_path = path.with_suffix('.component.scss')

    template_match = re.search(r'template:\s*`([\s\S]*?)`', text)
    styles_match = re.search(r'styles:\s*\[(.*?)\]', text, re.S)

    if template_match:
        html_content = template_match.group(1)
        html_path.write_text(html_content, encoding='utf-8')
        text = text.replace(template_match.group(0), "templateUrl: './" + path.stem + ".component.html'", 1)

    if styles_match:
        style_parts = re.findall(r'`([\s\S]*?)`', styles_match.group(0))
        scss_content = '\n\n'.join(style_parts) if style_parts else ''
        scss_path.write_text(scss_content, encoding='utf-8')
        text = text.replace(styles_match.group(0), "styleUrl: './" + path.stem + ".component.scss'", 1)
    else:
        scss_path.write_text('', encoding='utf-8')

    if 'styleUrl:' not in text:
        text = text.replace('})', "  styleUrl: './" + path.stem + ".component.scss'\n})", 1)

    path.write_text(text, encoding='utf-8')
