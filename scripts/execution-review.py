from pathlib import Path
from PIL import Image,ImageDraw
r=Path('docs/execution-qa')
for size in ['667x375','740x360','844x390','932x430','1366x768']:
 groups={'raise':['raise-0','raise-25','raise-50','raise-75','raise-100','ready-p1'],'outcomes':['ready-p2','ready-p3','ready-p4','blank-reaction','fatal-collapse','death-X'],'return':['return-blank-start','return-blank-middle','stable-blank-table','return-fatal-start','return-fatal-middle','stable-fatal-table']}
 for kind,names in groups.items():
  if not all((r/f'{n}-{size}.png').exists() for n in names):continue
  imgs=[]
  for n in names:
   im=Image.open(r/f'{n}-{size}.png').convert('RGB');im.thumbnail((500,300));imgs.append((n,im))
  h=max(im.height for _,im in imgs)+22;o=Image.new('RGB',(1000,h*3),'#0b1511');d=ImageDraw.Draw(o)
  for i,(n,im) in enumerate(imgs):
   x=i%2*500;y=i//2*h;o.paste(im,(x,y+22));d.text((x+8,y+4),n,fill='#dfcaa2')
  o.save(r/f'review-{kind}-{size}.png')
