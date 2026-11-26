from PIL import Image, ImageDraw
from pathlib import Path
p=Path('assets/images'); p.mkdir(exist_ok=True,parents=True)
S=1024

def mark(bg=(16,42,67,255), transparent=False, mono=False):
    im=Image.new('RGBA',(S,S),(0,0,0,0) if transparent else bg)
    d=ImageDraw.Draw(im)
    green=(19,138,104,255) if not mono else (255,255,255,255)
    ivory=(244,233,206,255) if not mono else (255,255,255,255)
    blue=(24,60,85,255) if not mono else (255,255,255,255)
    # Wallet outline
    d.rounded_rectangle((205,270,815,790),radius=88,fill=blue if not transparent else None,outline=ivory,width=28)
    d.rectangle((220,375,800,420),fill=(16,42,67,255) if not transparent else (0,0,0,0))
    # Wallet clasp sweep
    d.line([(224,422),(630,422)],fill=green,width=46)
    d.line([(630,422),(755,422),(813,480),(813,570),(665,570)],fill=green,width=46,joint='curve')
    d.ellipse((700,480,752,532),fill=ivory)
    # Growth stem and two leaves
    d.line([(388,680),(470,625),(525,548),(562,462)],fill=ivory,width=34,joint='curve')
    d.line([(467,625),(416,585),(394,540)],fill=green,width=30,joint='curve')
    d.line([(518,555),(570,523),(606,474)],fill=green,width=30,joint='curve')
    d.line([(579,430),(565,493),(625,477)],fill=green,width=24,joint='curve')
    return im

# Native app square icon
mark().convert('RGB').save(p/'icon.png',quality=95)
mark(transparent=True).save(p/'android-icon-foreground.png')
Image.new('RGBA',(512,512),(16,42,67,255)).save(p/'android-icon-background.png')
mark(transparent=True,mono=True).resize((432,432),Image.Resampling.LANCZOS).save(p/'android-icon-monochrome.png')
mark().resize((1024,1024),Image.Resampling.LANCZOS).save(p/'splash-icon.png')
mark().resize((48,48),Image.Resampling.LANCZOS).save(p/'favicon.png')
