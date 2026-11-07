"""Optional development helper: assemble existing test screenshots (requires Pillow)."""
from pathlib import Path
from PIL import Image, ImageDraw

root = Path('docs/screenshots')

def sheet(sizes, filename, prefix=''):
    rows = []
    for width, height in sizes:
        pictures = []
        for kind in ['table', 'execution']:
            picture = Image.open(root / f'{prefix}{kind}-{width}x{height}.png').convert('RGB')
            picture.thumbnail((667, 430))
            pictures.append(picture)
        row = Image.new('RGB', (1334, max(p.height for p in pictures) + 26), '#101815')
        draw = ImageDraw.Draw(row)
        for index, picture in enumerate(pictures):
            row.paste(picture, (index * 667, 26))
            draw.text((index * 667 + 10, 7), f'{width} x {height} - ' + ['TABLE', 'EXECUTION'][index], fill='#e6cf9f')
        rows.append(row)
    output = Image.new('RGB', (1334, sum(r.height for r in rows)), '#101815')
    top = 0
    for row in rows:
        output.paste(row, (0, top))
        top += row.height
    output.save(root / filename)

sheet([(667,375),(740,360),(844,390),(852,393),(932,430)], 'mobile-review.png')
sheet([(1024,768),(1366,768),(1920,1080)], 'large-review.png')
sheet([(667,375),(844,390),(932,430),(1366,768)], 'agent-review.png', 'agent-')

output = Image.new('RGB', (1688, 420), '#101815')
draw = ImageDraw.Draw(output)
for index, filename in enumerate(['before-844x390.png', 'table-844x390.png']):
    picture = Image.open(root / filename).convert('RGB')
    output.paste(picture, (index * 844, 30))
    draw.text((index * 844 + 12, 9), ['BEFORE: 844 x 390, document height 861', 'AFTER: 844 x 390, document height 390'][index], fill='#e6cf9f')
output.save(root / 'before-after-844x390.png')
