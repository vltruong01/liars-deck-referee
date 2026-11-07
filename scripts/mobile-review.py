from pathlib import Path
from PIL import Image,ImageDraw
root=Path('docs/mobile-qa')
def sheet(names,filename,cols=2):
 pictures=[]
 for name in names:
  p=Image.open(root/(name+'.png')).convert('RGB');p.thumbnail((667,430));pictures.append((name,p))
 cellh=max(p.height for _,p in pictures)+24
 result=Image.new('RGB',(667*cols,cellh*((len(pictures)+cols-1)//cols)),'#0c1512');draw=ImageDraw.Draw(result)
 for i,(name,p) in enumerate(pictures):
  x=(i%cols)*667;y=(i//cols)*cellh;result.paste(p,(x,y+24));draw.text((x+8,y+5),name,fill='#e6cf9f')
 result.save(root/filename)
for size in ['667x375','740x360','844x390','932x430','1366x768']:
 sheet([f'{s}-{size}' for s in ['table','setup','customization','selection-p1','execution-p1','survival','elimination']],f'review-states-{size}.png')
 sheet([f'execution-p{i}-{size}' for i in range(1,5)],f'review-seats-{size}.png')
sheet([f'species-{s}-667x375' for s in ['wolf','fox','hare','bear','raven','stag']],'review-species.png')
sheet(['before-table-667x375','table-667x375','before-table-740x360','table-740x360'],'review-before-after.png')
