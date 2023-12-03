# okidoki dst time
# what it do?
# 1. header: 512 bytes of ascii (thank god) metadata. 
# 2. body (stitches): triplets
# 2.x end triplet: 00 00 F3
# body decoding is actually insane lmao:

# bit:      7       6       5       4       3       2       1       0
# Byte 1	y+1	    y-1	    y+9	    y-9	    x-9	    x+9	    x-1	    x+1
# Byte 2	y+3	    y-3	    y+27	y-27	x-27	x+27	x-3	    x+3
# Byte 3	jump	col     y+81	y-81	x-81	x+81	set	    set


import math
import sys

dbg = sys.stderr

# position matrix for converting the terts to bytes:
posmat = [[3,7,2,6,10], [0,4,1,5,9]]

# stitch encoding
# currently does not account for color changes
def encodeStitch(stitch, jump):
    
    if(jump):
        bits = "xxxxxxxxxxxxxxxx10xxxx11"
    else:
        bits = "xxxxxxxxxxxxxxxx00xxxx11"

    for axis, dist in enumerate(stitch): # loop once for x and once for y

        # do the conversion to terts
        dist += 121 # from -121>121 to 0>242

        for index in range(5):
            # 0, 1 or 2?
            tert = dist%3

            # tert > binary encoded tert (mirrored for y)
            if (tert == 0 and axis == 0) or (tert == 2 and axis == 1): binaryCodedTert = "10"
            elif tert == 0 or tert == 2: binaryCodedTert = "01"
            else: binaryCodedTert = "00"

            # put it in the right spot in the triplet
            pos = posmat[axis][index]*2
            bits = bits[:pos] + binaryCodedTert + bits[pos + 2:]

            # divide dist for the next tert
            dist = math.floor(dist/3)
            

    return int(bits,2).to_bytes(3,"big") #bitstring to binary

def findLimits(coordinates):
    # find max distances 
    limits = [0,0,0,0]

    # use this with absolute coordinates
    for i in coordinates:
        if(i[0]>limits[0]):
            limits[0] = i[0]
        if(i[0]<limits[1]):
            limits[1] = abs(i[0])
        if(i[1]>limits[2]):
            limits[2] = i[1]
        if(i[1]<limits[3]):
            limits[3] = abs(i[1])

    return limits

def padString(inputstring, maxlength):
    output = ""

    if len(inputstring) > maxlength:
        output = inputstring[:maxlength-1]
    else:
        for i in range(maxlength - len(inputstring)):
            output += " "
        output += inputstring
    
    return output


def export_dst(coordinates, filename):

    # conversion from absolute to relative coordinates
    stitches = []
    for index in range( 1, len(coordinates) ):
        stitches.append([ coordinates[index][0] - coordinates[index-1][0] , coordinates[index][1] - coordinates[index-1][1] ])

    stitchdata = b''
    jumpcount = 0
    
    # writing the stitches
    for stitch in stitches:
        #check for jump stitch
        if max(abs(stitch[0]),abs(stitch[1])) < 122:
            stitchdata += encodeStitch(stitch, False)
        else:
            jumps = math.ceil(max(abs(stitch[0]), abs(stitch[1]))/121)
            jumpcount += jumps
            for i in range(jumps):
                stitchdata += encodeStitch([math.floor(stitch[0]/(jumps)), math.floor(stitch[1]/(jumps))], True)
            stitchdata += encodeStitch([stitch[0]%jumps, stitch[1]%jumps], False)

    # mandatory end triplet
    stitchdata += b'\x00\x00\xf3'


    # determining variables for the header
    label = filename[:16]
    for i in range(16 - len(filename)):
        label += " "

    limits = findLimits(coordinates)

    # writing the header
    header = ("LA:" + label + "\r" + 
              "ST:"  + padString(str(len(stitches)+jumpcount), 7) + "\r" +
              "CO:"  + "  1" + "\r"+
              "+X:"  + padString(str(limits[0]), 5) + "\r"+
              "-X:"  + padString(str(limits[1]), 5) + "\r"+
              "+Y:"  + padString(str(limits[2]), 5) + "\r"+
              "-Y:"  + padString(str(limits[3]), 5) + "\r" +
               "AX:+    0\rAY:+    0\rMX:+    0\rMY:+    0\r" + 
               "PD:******\r" )
    
    header = header.encode('ascii') 

    # header bits that are less stringfriendly
    header += b'\x1a\x20\x20\x20'
    for i in range(384):
        header += b'\x20'

    # exporting as file
    f = open(filename + ".dst", "wb")
    f.write(header + stitchdata)		
    f.close()
    dbg.write('saved file to ' + filename + '.dst!\n')