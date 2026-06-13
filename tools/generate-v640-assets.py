from PIL import Image, ImageDraw, ImageFont, ImageFilter
from pathlib import Path
import math, json, random
ROOT = Path(__file__).resolve().parents[1]
ART = ROOT/'public/assets/art'
UI = ROOT/'public/assets/ui'
DEX = ROOT/'public/assets/dex'
ATLAS = ROOT/'public/assets/atlas'
for p in [ART, UI, DEX, ATLAS]: p.mkdir(parents=True, exist_ok=True)

def rounded_panel(size, colors, radius=36, border=(255,255,255,120)):
    w,h=size
    img=Image.new('RGBA', size, (0,0,0,0))
    d=ImageDraw.Draw(img)
    for y in range(h):
        t=y/max(1,h-1)
        col=tuple(int(colors[0][i]*(1-t)+colors[1][i]*t) for i in range(3))+(255,)
        d.line([(0,y),(w,y)], fill=col)
    mask=Image.new('L', size, 0)
    md=ImageDraw.Draw(mask); md.rounded_rectangle([0,0,w-1,h-1], radius=radius, fill=255)
    img.putalpha(mask)
    shine=Image.new('RGBA', size, (0,0,0,0)); sd=ImageDraw.Draw(shine)
    sd.rounded_rectangle([8,6,w-8,h*0.45], radius=max(8,radius-12), fill=(255,255,255,34))
    sd.rounded_rectangle([3,3,w-4,h-4], radius=radius, outline=border, width=3)
    return Image.alpha_composite(img, shine)

def save_png_webp(img, path):
    img.save(path)
    if path.suffix.lower()=='.png':
        img.convert('RGB').save(path.with_suffix('.webp'), quality=88)

def draw_bg(name, palette, mood):
    W,H=1280,720
    img=Image.new('RGBA',(W,H),palette[0]+(255,)); d=ImageDraw.Draw(img)
    # sky/water gradient
    for y in range(H):
        t=y/H
        if t<0.28:
            k=t/0.28; c=tuple(int(palette[0][i]*(1-k)+palette[1][i]*k) for i in range(3))
        else:
            k=(t-0.28)/0.72; c=tuple(int(palette[1][i]*(1-k)+palette[2][i]*k) for i in range(3))
        d.line([(0,y),(W,y)],fill=c+(255,))
    # horizon
    d.rectangle([0,int(H*.28)-3,W,int(H*.28)+3], fill=(255,255,255,120))
    # land/rocks
    for i in range(7):
        x=i*210-random.randint(30,80); y=int(H*.28)+random.randint(-10,20)
        col=tuple(max(0,min(255,c+random.randint(-14,14))) for c in palette[3])+(210,)
        d.ellipse([x,y-50,x+250,y+55], fill=col)
    # underwater cliffs/corals
    for i in range(16):
        x=random.randint(-80,W); y=random.randint(int(H*.52),H+40); w=random.randint(90,220); h=random.randint(60,160)
        col=tuple(max(0,min(255,palette[4][j]+random.randint(-22,22))) for j in range(3))+(130,)
        d.ellipse([x,y,x+w,y+h], fill=col)
    # god rays
    for i in range(6):
        x=int(W*(0.25+i*0.1)); poly=[(x-40,int(H*.28)),(x+40,int(H*.28)),(x+240,H),(x-260,H)]
        d.polygon(poly, fill=(255,255,255,24))
    # waves
    for i in range(13):
        y=int(H*.28)+i*18
        d.arc([80-i*80,y-30,W+120+i*20,y+50], 180, 350, fill=(255,255,255,80-i*4), width=max(1,3-i//5))
    # bubbles/fish silhouettes
    for i in range(80):
        x=random.randint(0,W); y=random.randint(int(H*.32),H-10); r=random.randint(2,9)
        d.ellipse([x-r,y-r,x+r,y+r], outline=(210,248,255,70), width=1)
    for i in range(20):
        x=random.randint(60,W-60); y=random.randint(int(H*.42),H-80); s=random.randint(9,24)
        d.ellipse([x,y,x+s*2,y+s], fill=(10,60,90,55))
        d.polygon([(x+s*2,y+s//2),(x+s*3,y),(x+s*3,y+s)], fill=(10,60,90,55))
    img=img.filter(ImageFilter.SMOOTH_MORE)
    # vignette
    vig=Image.new('RGBA',(W,H),(0,0,0,0)); vd=ImageDraw.Draw(vig)
    vd.rectangle([0,0,W,H], outline=(0,0,0,60), width=20)
    img=Image.alpha_composite(img,vig)
    save_png_webp(img, ART/f'{name}.png')

draw_bg('bg_glacier', [(145,216,255),(115,217,245),(25,98,145),(180,232,238),(70,150,185)], 'ice')
draw_bg('bg_storm', [(52,78,132),(88,118,177),(12,35,76),(52,78,112),(24,69,124)], 'storm')

def fish_asset(name, body, accent, rare=False):
    W,H=360,260
    img=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(img)
    # shadow
    d.ellipse([70,174,290,220], fill=(0,28,55,35))
    # fins
    d.polygon([(80,130),(32,100),(52,166)], fill=accent+(230,))
    d.polygon([(244,128),(322,78),(318,178)], fill=accent+(230,))
    d.polygon([(160,95),(196,28),(220,102)], fill=accent+(210,))
    d.polygon([(154,170),(196,232),(218,163)], fill=accent+(210,))
    # body gradient
    for i in range(86):
        t=i/85
        col=tuple(int(body[j]*(1-t)+min(255,body[j]+50)*t) for j in range(3))+(255,)
        d.ellipse([66+i*.25,62+i*.06,274-i*.12,184-i*.04], fill=col)
    # stripes/markings
    for x in [122,174,226]:
        d.rounded_rectangle([x,70,x+16,178], radius=10, fill=(255,255,255,160 if rare else 110))
    # highlight
    d.ellipse([104,76,218,112], fill=(255,255,255,58))
    # eye
    d.ellipse([220,92,266,138], fill=(255,255,255,255))
    d.ellipse([239,105,258,124], fill=(25,45,72,255))
    d.ellipse([245,108,251,114], fill=(255,255,255,255))
    # smile
    d.arc([222,126,266,158], 8, 65, fill=(60,38,50,200), width=4)
    if rare:
        for a in range(0,360,60):
            x=180+math.cos(math.radians(a))*130; y=126+math.sin(math.radians(a))*86
            d.polygon([(x,y-8),(x+4,y),(x,y+8),(x-4,y)], fill=(255,245,150,150))
    img=img.filter(ImageFilter.SMOOTH)
    img.save(DEX/f'{name}.png')

fish_specs = {
 'fish_clown_card_25d': ((246,128,44),(255,188,74), True),
 'fish_leaf_25d': ((72,206,152),(32,156,122), False),
 'fish_lantern_25d': ((255,166,76),(255,91,94), True),
 'fish_shadow_25d': ((74,99,168),(82,61,130), True),
 'fish_lotus_25d': ((246,132,190),(121,223,210), True),
 'fish_nova_25d': ((134,95,245),(95,232,255), True),
 'fish_crystal_25d': ((144,224,255),(202,246,255), True),
 'fish_aurora_25d': ((118,248,206),(141,111,255), True),
 'fish_thunder_25d': ((255,207,73),(97,134,255), True),
}
for name,(body,accent,rare) in fish_specs.items(): fish_asset(name, body, accent, rare)

# New UI icons
icons = {
 'gear_line_25d.png': ((80,220,255),(23,82,130),'line'),
 'shop_bait_25d.png': ((255,162,98),(150,80,56),'bait'),
 'shop_oil_25d.png': ((142,120,255),(77,62,174),'oil'),
 'shop_charm_25d.png': ((255,216,92),(52,176,160),'charm'),
 'fx_combo_25d.png': ((255,225,94),(255,110,128),'combo'),
 'badge_boss_25d.png': ((255,114,128),(255,218,88),'boss'),
}
for filename,(c1,c2,kind) in icons.items():
    img=Image.new('RGBA',(256,256),(0,0,0,0)); d=ImageDraw.Draw(img)
    d.ellipse([22,36,234,228], fill=(0,0,0,35))
    panel=rounded_panel((200,170), [c1,c2], radius=54)
    img.alpha_composite(panel, (28,32))
    if kind=='line':
        for i in range(4): d.arc([64+i*10,82+i*8,190-i*4,160+i*8], 180, 350, fill=(255,255,255,220), width=8)
        d.ellipse([168,132,202,166], fill=(255,255,255,220))
    elif kind=='bait':
        for i in range(5):
            x=68+i*22; d.ellipse([x,102+math.sin(i)*18,x+44,136+math.sin(i)*18], fill=(255,210,180,230), outline=(122,58,44,220), width=4)
    elif kind=='oil':
        d.rounded_rectangle([92,62,164,182], radius=22, fill=(240,245,255,230), outline=(80,60,160,220), width=6)
        d.rectangle([102,92,154,166], fill=(100,90,255,180))
        d.ellipse([110,48,146,76], fill=(235,235,255,240))
    elif kind=='charm':
        d.polygon([(128,54),(172,112),(150,180),(106,180),(84,112)], fill=(255,247,176,235), outline=(90,136,100,220))
        d.ellipse([111,106,145,140], fill=(99,255,203,220))
    elif kind=='combo':
        d.text((58,96),'COMBO', fill=(42,38,66,255))
        d.polygon([(132,42),(158,102),(224,112),(171,150),(184,216),(132,176),(78,216),(94,150),(40,112),(106,102)], fill=(255,245,140,230))
    elif kind=='boss':
        d.polygon([(56,170),(82,74),(124,132),(170,62),(202,172)], fill=(255,232,96,235), outline=(130,62,72,220))
        d.ellipse([92,160,164,198], fill=(255,120,134,240))
    img=img.filter(ImageFilter.SMOOTH)
    img.save(UI/filename)

# Expand atlas metadata (placeholder atlas sheet remains existing but frames get names for validation/indexing)
atlas_path=ATLAS/'aqua_fishing_atlas.json'
try:
    atlas=json.loads(atlas_path.read_text())
except Exception:
    atlas={'frames':{},'meta':{}}
for i,name in enumerate(['gear_line_25d.png','shop_bait_25d.png','shop_oil_25d.png','shop_charm_25d.png','fx_combo_25d.png','badge_boss_25d.png'] + list(fish_specs.keys())):
    atlas.setdefault('frames',{})[name]={'frame':{'x':0,'y':0,'w':256,'h':256},'rotated':False,'trimmed':False,'spriteSourceSize':{'x':0,'y':0,'w':256,'h':256},'sourceSize':{'w':256,'h':256}}
atlas['meta']={'app':'AquaFantasia v6.4.0 asset expansion','image':'aqua_fishing_atlas.webp','format':'RGBA8888','size':{'w':1024,'h':1024},'scale':'1'}
atlas_path.write_text(json.dumps(atlas, ensure_ascii=False, indent=2))
