from pathlib import Path
from PIL import Image,ImageDraw
root=Path('docs/cinematic-qa')
def sheet(names,file):
 imgs=[]
 for name in names:
  p=root/(name+'.png')
  if not p.exists():continue
  im=Image.open(p).convert('RGB');im.thumbnail((667,430));imgs.append((name,im))
 if not imgs:return
 h=max(im.height for _,im in imgs)+24;out=Image.new('RGB',(1334,h*((len(imgs)+1)//2)),'#0c1512');d=ImageDraw.Draw(out)
 for i,(name,im) in enumerate(imgs):
  x=i%2*667;y=i//2*h;out.paste(im,(x,y+24));d.text((x+8,y+5),name,fill='#e6cf9f')
 out.save(root/file)
for size in ['667x375','740x360','844x390','932x430','1366x768']:
 sheet([f'before-table-{size}',f'table-four-{size}',f'table-2-{size}',f'table-3-{size}',f'blank-raise-{size}',f'ready-blank-{size}',f'breath-blank-{size}',f'blank-result-{size}',f'impact-fatal-{size}',f'fatal-result-{size}',f'eliminated-table-{size}'],f'review-{size}.png')

for size in ['667x375','740x360','844x390','932x430','1366x768']:
 sheet([f'before-table-{size}',f'table-four-{size}',f'table-2-{size}',f'table-3-{size}'],f'review-{size}-scenes.png')
 sheet([f'blank-raise-{size}',f'ready-blank-{size}',f'breath-blank-{size}',f'blank-result-{size}'],f'review-{size}-motion.png')
 sheet([f'impact-fatal-{size}',f'fatal-result-{size}',f'eliminated-table-{size}'],f'review-{size}-outcomes.png')
