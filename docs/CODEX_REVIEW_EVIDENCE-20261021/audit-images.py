from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import json,re
repo=Path('D:/agent项目助理/agent-case')
out=Path('D:/agent项目助理/codex-agent-case-review-20261021')
guides=json.loads((repo/'data/guides.json').read_text(encoding='utf8'))
rows=[]
for g in guides:
    body=re.sub(r'```[\s\S]*?```|~~~[\s\S]*?~~~','',g['body'])
    body='\n'.join(l for l in body.splitlines() if not l.strip().startswith('|') and not re.match(r'^\s*!\[',l))
    row={'slug':g['slug'],'hanChars':len(re.findall(r'[\u4e00-\u9fff]',body)), 'sourceUrls':g['sourceUrls'],'images':[]}
    sheet=Image.new('RGB',(1400,1470),'#ddd')
    d=ImageDraw.Draw(sheet)
    for i,s in enumerate(g['screenshots']):
        p=repo/'public'/s.lstrip('/')
        im=Image.open(p).convert('RGB'); width,height=im.size
        row['images'].append({'file':s,'width':width,'height':height,'bytes':p.stat().st_size})
        im.thumbnail((680,440))
        x=(i%2)*700+10;y=(i//2)*490+30
        sheet.paste(im,(x,y));d.text((x,y-22),p.name,fill='black')
    sheet.save(out/(g['slug']+'-contact.jpg'),quality=94)
    rows.append(row)
(out/'content-images.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps(rows,ensure_ascii=False))
