import math
import sys

dbg = sys.stderr

# functions

# works up to 256^2-1=65536 rn, stitch count may exceed this eventually
def numberConverter(number):
    n = bytearray()

    if(number>255):
        n.append(number%256)
        n.append(math.floor(number/256))
    else:
        n.append(number)
        n.append(0)

    n += b'\x00\x00'

    return n

def export_jef(steps, filename):

    # find max distances (this could also be part of the export code)
    limits = [0,0,0,0]

    # for relative coordinates, convert to relative coordinates lol
    abssteps = [[0,0]]
    for index, i in enumerate(steps):
        abssteps.append([abssteps[index][0] + i[0], abssteps[index][1] + i[1]])

    # use this with absolute coordinates
    for i in abssteps:
        if(i[0]>limits[0]):
            limits[0] = i[0]
        if(i[1]>limits[1]):
            limits[1] = i[1]
        if(i[0]<limits[2]):
            limits[2] = i[0]
        if(i[1]<limits[3]):
            limits[3] = i[1]



    # part 1 - write header

    # write default header shit including date (rn date is all 0s)
    header = bytearray(b'\x7c\x00\x00\x00\x0a\x00\x00\x00')
    for i in range(14):
        header += b'\x30'
    header += b'\x00\x00\x01\x00\x00\x00'

    # write point count. 
    header += numberConverter(len(steps))

    # "hoop used"
    header += b'\x00\x00\x00\x00'

    # write distances from center
    for i in limits:
        header += numberConverter(abs(i))

    # write distances from edges
    hoops = [[550,550,550,550],[250,250,250,250],[700,1000,700,1000]]
    for j in hoops:
        failure = False
        for index, i in enumerate(limits):
            if(j[index] < abs(i)):
                failure = True
        if(failure):
            for i in range(16):
                header += b'\xff'
            print("Design does not fit in hoop " + str(j[0]*2))
        else:
            for index, i in enumerate(limits):
                header += numberConverter(j[index] - abs(i))
    # fill custom hoop with ff
    for i in range(16):
        header += b'\xff'

    # color changes (default shit)
    header += b'\x01\x00\x00\x00\x0d\x00\x00\x00'



    # part 2 - write stitches to bytes
    # gonna have to do this a bit different if i wanna not start in the center u kno
    stitchdata = bytearray(b'\x00\x00\x00\x00')

    # currently this only works with steps that are already chill
    for stitch in steps:

        x = stitch[0]
        y = stitch[1]

        if (x<0): 
            x = x + 256
        stitchdata.append(x)
        
        if (y<0): 
            y = y + 256
        stitchdata.append(y)



    # part 3 - export
    f = open(filename, "wb")
    f.write(header + stitchdata + b'\x80\x10')		
    f.close()

    dbg.write("saved to file: %s\n" % (filename))
