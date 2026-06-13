from PIL import Image, ImageDraw, ImageFilter
import math, random, os
root = '/mnt/data/aqua_v630_work/public/assets'
art = os.path.join(root, 'art')
ui = os.path.join(root, 'ui')
dex = os.path.join(root, 'dex')
os.makedirs(art, exist_ok=True); os.makedirs(ui, exist_ok=True); os.makedirs(dex, exist_ok=True)
random.seed(630)

def grad_vertical(w,h,stops):
    img = Image.new('RGBA',(w,h))
    px = img.load()
    stops = sorted(stops)
    for y in range(h):
        t = y/(h-1)
        for i in range(len(stops)-1):
            if stops[i][0] <= t <= stops[i+1][0]:
                a,c1=stops[i]; b,c2=stops[i+1]
                k=(t-a)/(b-a) if b>a else 0
                c=tuple(int(c1[j]*(1-k)+c2[j]*k) for j in range(4))
                break
        else:
            c=stops[-1][1]
        for x in range(w): px[x,y]=c
    return img

def add_ellipse(draw, xy, fill, outline=None, width=1):
    draw.ellipse(xy, fill=fill, outline=outline, width=width)

def polygon_shadow(draw, pts, fill, offset=(0,20), blur=0):
    pass

def draw_cloud(draw, x,y,s, alpha=240):
    col=(255,255,255,alpha); sh=(183,231,250,int(alpha*.55))
    draw.ellipse((x-s*1.0,y-s*.15,x+s*.2,y+s*.7), fill=col)
    draw.ellipse((x-s*.25,y-s*.55,x+s*.75,y+s*.6), fill=col)
    draw.ellipse((x+s*.45,y-s*.25,x+s*1.4,y+s*.65), fill=col)
    draw.ellipse((x-s*1.05,y+s*.35,x+s*1.45,y+s*.9), fill=sh)

def draw_coral(draw, x,y,scale,color):
    w=max(3,int(scale*5))
    draw.line((x,y,x,y-int(70*scale)), fill=color, width=w)
    for ang in [-55,-25,30,60]:
        sx=x; sy=y-int(random.uniform(20,65)*scale)
        length=random.uniform(20,45)*scale
        ex=sx+math.cos(math.radians(ang))*length
        ey=sy-math.sin(math.radians(abs(ang)))*length*.65
        draw.line((sx,sy,ex,ey), fill=color, width=w)
        add_ellipse(draw,(ex-7*scale,ey-7*scale,ex+7*scale,ey+7*scale),color)

def draw_fish(draw,x,y,s,color):
    draw.ellipse((x-s*1.1,y-s*.55,x+s*1.0,y+s*.55), fill=color)
    draw.polygon([(x-s*1.1,y),(x-s*1.65,y-s*.45),(x-s*1.65,y+s*.45)], fill=tuple(max(0,int(c*.9)) for c in color[:3])+(color[3],))
    add_ellipse(draw,(x+s*.55,y-s*.18,x+s*.8,y+s*.07),(255,255,255,230))
    add_ellipse(draw,(x+s*.64,y-s*.10,x+s*.73,y-.01),(30,55,75,240))

def make_ocean_scene(path_png, path_webp, login=False):
    w,h = 1440,2560
    img = grad_vertical(w,h,[(0,(44,172,245,255)),(.22,(122,218,249,255)),(.32,(32,183,221,255)),(.55,(20,127,183,255)),(1,(4,31,80,255))])
    d=ImageDraw.Draw(img,'RGBA')
    # sky islands and clouds
    for spec in [(210,150,120),(1040,120,105),(1220,310,70)]: draw_cloud(d,*spec)
    d.polygon([(0,680),(160,580),(330,680),(0,740)], fill=(75,170,111,255))
    d.polygon([(1060,650),(1240,520),(1440,620),(1440,740),(1020,730)], fill=(63,154,103,255))
    # lighthouse and village
    d.rectangle((1210,500,1268,645), fill=(255,247,220,255)); d.polygon([(1188,500),(1240,420),(1290,500)], fill=(242,83,62,255)); d.rectangle((1300,585,1360,650), fill=(255,225,184,255)); d.polygon([(1280,585),(1330,530),(1380,585)], fill=(238,92,67,255))
    # sea surface
    surface_y=int(h*.29)
    d.rectangle((0,surface_y-12,w,surface_y+18), fill=(235,255,255,220))
    for i in range(24):
        y=surface_y+18+i*10
        amp=8+i*.6
        pts=[]
        for x in range(-40,w+60,30):
            pts.append((x,y+math.sin(x/70+i)*amp))
        d.line(pts, fill=(246,255,255,155), width=2)
    # sun rays
    for i in range(12):
        x0=w*.5 + (i-6)*80
        d.polygon([(w*.5,surface_y+10),(x0-30,h),(x0+80,h)], fill=(255,255,235,18))
    # boat/chibi
    bx,by=w*0.50,surface_y-20
    d.ellipse((bx-190,by+90,bx+190,by+126), fill=(0,54,73,80))
    d.polygon([(bx-330,by+20),(bx+330,by+20),(bx+230,by+150),(bx-230,by+150)], fill=(119,69,35,255))
    d.polygon([(bx-330,by+20),(bx,by-45),(bx+330,by+20)], fill=(154,92,48,255))
    d.line((bx,by-75,bx,by+150), fill=(93,55,33,255), width=38)
    # head hat rod
    d.ellipse((bx-78,by-230,bx+78,by-72), fill=(255,216,166,255))
    d.ellipse((bx-145,by-245,bx+145,by-135), fill=(205,145,55,255))
    d.ellipse((bx-82,by-285,bx+82,by-160), fill=(218,157,63,255))
    d.line((bx+30,by-158,bx+420,by-485), fill=(66,45,31,255), width=12)
    d.arc((bx+380,by-550,bx+610,by-110), 270, 92, fill=(255,255,235,230), width=5)
    d.line((bx+535,by-145,bx+555,by-85), fill=(255,255,235,230), width=3)
    d.ellipse((bx+535,by-85,bx+585,by-35), fill=(238,75,54,255)); d.rectangle((bx+540,by-70,bx+580,by-53), fill=(248,248,238,255))
    # underwater floor and corals
    for i in range(40):
        x=random.randint(-50,w+50); y=random.randint(int(h*.58),h-70); s=random.uniform(.55,1.7)
        d.ellipse((x-45*s,y-18*s,x+70*s,y+18*s), fill=(1,47,72,150))
        for _ in range(random.randint(1,3)):
            draw_coral(d, x+random.randint(-25,25), y, s*.75, random.choice([(255,99,121,240),(95,210,141,240),(137,128,255,235),(255,179,75,235),(88,197,240,235)]))
    for i in range(90):
        draw_fish(d, random.randint(40,w-40), random.randint(surface_y+180,h-90), random.uniform(7,18), random.choice([(255,147,69,220),(99,204,249,220),(255,222,71,220),(164,145,255,220)]))
    for i in range(110):
        x=random.randint(0,w); y=random.randint(surface_y+120,h-40); r=random.randint(4,20)
        d.ellipse((x-r,y-r,x+r,y+r), outline=(255,255,255,random.randint(60,130)), width=2)
        if random.random()<.35: d.ellipse((x-r*.2,y-r*.4,x+r*.1,y-r*.1), fill=(255,255,255,80))
    # vignette and polish
    v=Image.new('RGBA',(w,h),(0,0,0,0)); vd=ImageDraw.Draw(v,'RGBA')
    vd.rectangle((0,0,w,h), outline=(0,0,0,0))
    for r in range(18):
        alpha=int(6+r*4)
        vd.rectangle((r*8,r*8,w-r*8,h-r*8), outline=(0,18,45,alpha), width=16)
    img=Image.alpha_composite(img,v)
    img.save(path_png,optimize=True)
    img.save(path_webp,quality=88,method=6)

make_ocean_scene(os.path.join(art,'login_ocean_fishing_25d.png'), os.path.join(art,'login_ocean_fishing_25d.webp'))
make_ocean_scene(os.path.join(art,'bg_ocean.png'), os.path.join(art,'bg_ocean.webp'))

# UI icon generator
icons = {
 'nav_village_25d.png': ('home',(71,217,255,255)), 'nav_fishing_25d.png': ('hook',(255,224,116,255)),
 'nav_gear_25d.png': ('gear',(166,205,255,255)), 'nav_dex_25d.png': ('bag',(117,239,196,255)),
 'nav_shop_25d.png': ('shop',(255,172,97,255)), 'nav_mission_25d.png': ('mission',(210,151,255,255)),
 'gear_rod_25d.png': ('rod',(177,120,72,255)), 'gear_reel_25d.png': ('reel',(151,186,220,255)),
 'gear_lure_25d.png': ('lure',(255,112,102,255)), 'fx_touch_ring_25d.png': ('ring',(126,235,255,255)),
 'fx_perfect_25d.png': ('star',(255,225,83,255)), 'panel_badge_gold_25d.png': ('coin',(255,202,61,255)),
}

def icon(kind, color):
    s=256
    im=Image.new('RGBA',(s,s),(0,0,0,0)); d=ImageDraw.Draw(im,'RGBA')
    d.ellipse((25,28,231,236), fill=(15,55,88,180))
    d.ellipse((32,24,224,210), fill=(255,255,255,45))
    d.ellipse((44,44,212,212), fill=color)
    d.ellipse((58,50,198,120), fill=(255,255,255,65))
    if kind=='home':
        d.polygon([(65,130),(128,70),(191,130)], fill=(255,247,212,255)); d.rounded_rectangle((78,126,178,190), radius=18, fill=(89,151,210,255)); d.rectangle((119,150,143,190), fill=(40,78,118,255))
    elif kind=='hook':
        d.line((103,64,159,154), fill=(52,48,52,255), width=16); d.arc((104,120,184,210), 330, 140, fill=(52,48,52,255), width=16); d.ellipse((70,58,108,96), fill=(255,255,244,255))
    elif kind=='gear':
        d.ellipse((80,80,176,176), fill=(64,91,135,255)); d.ellipse((108,108,148,148), fill=(194,227,249,255));
        for a in range(0,360,45):
            x=128+math.cos(math.radians(a))*75; y=128+math.sin(math.radians(a))*75; d.rounded_rectangle((x-12,y-12,x+12,y+12), radius=5, fill=(64,91,135,255))
    elif kind=='bag':
        d.rounded_rectangle((64,92,192,202), radius=22, fill=(58,111,166,255)); d.arc((91,58,165,130),180,360, fill=(255,236,165,255), width=12); d.rectangle((64,112,192,132), fill=(255,236,165,230))
    elif kind=='shop':
        d.rounded_rectangle((66,100,190,202), radius=18, fill=(255,241,190,255)); d.rectangle((76,124,180,194), fill=(101,172,206,255));
        for i,c in enumerate([(238,79,66,255),(255,247,226,255)]*3): d.rectangle((64+i*21,74,84+i*21,108), fill=c)
    elif kind=='mission':
        d.rounded_rectangle((72,58,184,204), radius=16, fill=(255,246,214,255));
        for yy in [95,126,157]: d.rounded_rectangle((96,yy,164,yy+8), radius=4, fill=(77,104,147,255)); d.ellipse((78,yy-2,92,yy+12), fill=(82,217,157,255))
    elif kind=='rod':
        d.line((66,182,190,64), fill=(83,54,36,255), width=14); d.arc((120,40,226,170),270,80, fill=(255,255,235,255), width=5); d.ellipse((185,155,218,188), fill=(238,73,62,255))
    elif kind=='reel':
        d.ellipse((70,70,186,186), fill=(80,101,138,255)); d.ellipse((98,98,158,158), fill=(226,243,255,255)); d.line((154,92,206,54), fill=(80,101,138,255), width=10); d.ellipse((197,43,225,71), fill=(255,231,125,255))
    elif kind=='lure':
        d.ellipse((70,94,162,164), fill=(255,255,245,255)); d.ellipse((94,92,186,166), fill=(238,79,66,255)); d.polygon([(70,128),(38,100),(40,156)], fill=(255,186,72,255)); d.arc((166,132,220,204), 260, 80, fill=(50,56,72,255), width=8)
    elif kind=='ring':
        d.ellipse((54,54,202,202), outline=(255,255,255,240), width=16); d.ellipse((92,92,164,164), outline=(96,239,255,220), width=8)
    elif kind=='star':
        pts=[]
        for i in range(10):
            r=78 if i%2==0 else 34; a=-math.pi/2+i*math.pi/5; pts.append((128+math.cos(a)*r,128+math.sin(a)*r))
        d.polygon(pts, fill=(255,238,103,255)); d.line(pts+[pts[0]], fill=(159,102,29,255), width=5)
    elif kind=='coin':
        d.ellipse((62,62,194,194), fill=(255,204,65,255), outline=(143,89,30,255), width=8); d.text((120,88),'G',fill=(143,89,30,255))
    return im

for fn,(kind,col) in icons.items():
    icon(kind,col).save(os.path.join(ui,fn), optimize=True)

# More collectible fish cards as simple bigger cards
names=['abyss','bubble','coral','moon','sun','storm','pearl','king']
colors=[(58,179,255,255),(81,235,201,255),(255,117,142,255),(146,135,255,255),(255,195,79,255),(98,122,169,255),(238,244,255,255),(255,116,64,255)]
for name,col in zip(names,colors):
    im=Image.new('RGBA',(512,512),(0,0,0,0)); d=ImageDraw.Draw(im,'RGBA')
    d.ellipse((70,130,410,335), fill=col)
    d.polygon([(98,230),(20,170),(25,290)], fill=tuple(max(0,int(c*.85)) for c in col[:3])+(255,))
    d.polygon([(250,130),(325,62),(342,160)], fill=tuple(min(255,int(c*1.1)) for c in col[:3])+(230,))
    d.polygon([(270,332),(352,410),(362,314)], fill=tuple(max(0,int(c*.8)) for c in col[:3])+(230,))
    for x in [165,245,325]: d.arc((x-32,145,x+32,320), 90, 270, fill=(255,255,255,150), width=9)
    d.ellipse((337,188,388,239), fill=(255,255,255,245)); d.ellipse((358,204,376,222), fill=(33,48,73,255))
    d.arc((330,238,392,286), 10, 165, fill=(50,55,72,190), width=5)
    im=im.filter(ImageFilter.UnsharpMask(radius=1, percent=120, threshold=3))
    im.save(os.path.join(dex,f'fish_{name}_25d.png'), optimize=True)
