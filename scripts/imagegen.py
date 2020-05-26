from PIL import Image

stem = 'assets/wall/Wall'
interval = 1
img = Image.open(stem + '.png')
black = Image.new('RGB', img.size, (0, 0, 0))

for i in range(0, 101, interval):
    mask = Image.new('L', img.size, 255 - int(255 * i/100))
    im = Image.composite(img, black, mask)
    im.save(stem + str(i) + '.png')
