import math
import sys

dbg = sys.stderr

def findLimits(steps):
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
    return limits

# works up to 256^2-1=65535 rn, stitch count may exceed this eventually
def numberConverter(number):
    n = bytearray()

    n.append(number%256)
    n.append(math.floor(number/256)%256)
    n.append(math.floor(number/65536)%256)
    n.append(math.floor(number/4294967296)%256)

    return n

def stitchWriter(dist):
    if (dist<0): 
        dist = dist + 256
    return dist


def export_jef(steps, center, filename):

    limits = findLimits(steps)

    # center piece
    if(center):
        xshift = -1 * round(limits[2] + (limits[0] - limits[2])/2)
        yshift = -1 * round(limits[3] + (limits[1] - limits[3])/2)
        steps.insert(0, [xshift, yshift])

        # find new limits
        limits = findLimits(steps)


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
            dbg.write("\nDesign does not fit in hoop " + str(j[0]*2))
        else:
            for index, i in enumerate(limits):
                header += numberConverter(j[index] - abs(i))
    # fill custom hoop with ff
    for i in range(16):
        header += b'\xff'

    # color changes (default shit)
    header += b'\x01\x00\x00\x00\x0d\x00\x00\x00'


    # part 2 - write stitches to bytes

    if center:
        stitchdata = bytearray(b'\x80\x02\x00\x00')
        
    else:
        stitchdata = bytearray(b'\x00\x00\x00\x00')

    prev0 = False

    # currently this only works with steps that are already chill
    for stitch in steps:

        x = stitch[0]
        y = stitch[1]

        # make trim
        if x == 0 and y == 0:
            if prev0:
                stitchdata += b'\x80\x02\x00\x00'
                prev0 = False
            else:
                prev0 = True    

        # make a normal stitch
        elif x<128 and x>-128 and y<128 and y>-128:
            prev0 = False

            stitchdata.append(stitchWriter(x))
            stitchdata.append(stitchWriter(y))
            

        # make one or more jump stitches
        else:
            prev0 = False

            jumps = math.ceil(max(abs(x),abs(y)) / 127)
            xjump = math.floor(x/jumps)
            yjump = math.floor(y/jumps)

            for jump in range(jumps):
                stitchdata += b'\x80\x02'
                if(jump<=x%jumps): stitchdata.append(stitchWriter(xjump + 1))
                else: stitchdata.append(stitchWriter(xjump))
                
                if(jump<=y%jumps): stitchdata.append(stitchWriter(yjump + 1))
                else: stitchdata.append(stitchWriter(yjump))

            stitchdata += b'\x00\x00'



    # part 3 - export
    f = open(filename, "wb")
    f.write(header + stitchdata + b'\x80\x10')		
    f.close()

    dbg.write("\nsaved to file: %s\n" % (filename))
