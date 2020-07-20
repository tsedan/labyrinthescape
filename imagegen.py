from PIL import Image

path = 'assets/floor'
original = Image.open(path + '/original.png')
black = Image.new('RGBA', original.size, (0, 0, 0, 255))
opacities = [pixel[3] for pixel in original.getdata()]

for opacity in range(0, 101, 1):
    mask = Image.new('L', original.size, 255 - int(255 * opacity/100))
    masked = Image.composite(original, black, mask)
    pixels = masked.getdata()

    newPixels = []
    for index, pixel in enumerate(pixels):
        if (opacities[index] == 0):
            newPixels.append((0, 0, 0, 0))
        else:
            newPixels.append(pixel)

    masked.putdata(newPixels)
    masked.save(path + '/opaque' + str(opacity) + '.png')
