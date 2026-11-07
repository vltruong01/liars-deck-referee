from pathlib import Path
from PIL import Image, ImageDraw

root = Path('tests/browser/visual.spec.js-snapshots')
out = Path('docs/final-qa')
states = ['setup', 'editor', 'table', 'execution-idle', 'execution-mid-raise', 'execution-aim', 'survival', 'death-X', 'returned-table']
for size in ['667x375', '740x360', '844x390', '932x430', '1366x768']:
    tiles = []
    for state in states:
        im = Image.open(root / f'{state}-{size}-win32.png').convert('RGB')
        im.thumbnail((600, 338))
        tiles.append((state, im))
    row = max(im.height for _, im in tiles) + 24
    sheet = Image.new('RGB', (1800, row * 3), '#0b1511')
    draw = ImageDraw.Draw(sheet)
    for i, (state, im) in enumerate(tiles):
        x, y = i % 3 * 600, i // 3 * row
        draw.text((x + 8, y + 4), f'{state} {size}', fill='#dfcaa2')
        sheet.paste(im, (x, y + 24))
    sheet.save(out / f'review-baselines-{size}.png')
