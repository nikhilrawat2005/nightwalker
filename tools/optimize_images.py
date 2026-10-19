#!/usr/bin/env python3
"""Raw photos -> web-ready .webp (max 1600px wide, phone EXIF rotation fixed, date kept in the file name).
  python3 tools/optimize_images.py  ~/Downloads/photos  assets/photos
  python3 tools/optimize_images.py  ~/Downloads/sketches assets/sketches --width=1400 --quality=80
File name keeps/gets a YYYYMMDD (e.g. IMG_20260131_141743171.jpg -> 20260131_141743171.webp) so the gallery date stamp works by itself.
"""
import sys, os, re
from PIL import Image, ImageOps
a=[x for x in sys.argv[1:] if not x.startswith('--')]
opt=lambda k,d:next((int(x.split('=')[1]) for x in sys.argv[1:] if x.startswith('--'+k+'=')),d)
if len(a)<2: sys.exit(__doc__)
src,dst=a[0],a[1];W=opt('width',1600);Q=opt('quality',78);os.makedirs(dst,exist_ok=True)
tot_in=tot_out=0
for f in sorted(os.listdir(src)):
    if not re.search(r'\.(jpe?g|png|jpeg|webp|heic)$',f,re.I): continue
    p=os.path.join(src,f)
    try: im=ImageOps.exif_transpose(Image.open(p))
    except Exception as e: print('skip',f,e);continue
    if im.mode not in('RGB','L'): im=im.convert('RGB')
    if im.width>W: im=im.resize((W,round(im.height*W/im.width)),Image.LANCZOS)
    base=re.sub(r'\.(jpe?g|png|jpeg|webp|heic)+$','',f,flags=re.I)
    base=re.sub(r'^IMG_','',base);base=re.sub(r'[^\w\-]+','_',base).strip('_')
    out=os.path.join(dst,base+'.webp');im.save(out,'WEBP',quality=Q,method=6)
    i,o=os.path.getsize(p),os.path.getsize(out);tot_in+=i;tot_out+=o
    print(f'{f}  {i//1024}KB -> {os.path.basename(out)} {o//1024}KB  {im.width}x{im.height}')
print(f'total {tot_in//1024//1024}MB -> {tot_out//1024}KB')
