import math

# Function outputs a satin stitch path in steps given an input path in coordinates
# Changes to implement:
# - fill corners, right now there's small gaps whenever it changes direction
# - add original path underneath for 3dimensionality
# - right now the zigzag distances are the same for all stitches on a line segment which makes it very prone to stacking rounding inaccuracies so like. fix that

# i use some kinda confusing names for the different angles:
# alpha and beta refer to the angle between the specific stitches on a line and the x axis.
# they're found using angleA, which is the internal angle of the satin stitch pattern
# and angleB, which is the angle between a line segment and the x axis.

def satinstitch(input, width=50, density=3):
    segments = []
    output = []

    angleA = math.atan(width/density)
    stitchLength = math.sqrt(density**2 + width**2)

    previous = input[0]
    for index in range(1,len(input)):
        segments.append([previous,input[index]])
        previous = input[index]

    for segment in segments:

        segX = segment[1][0] - segment[0][0]
        segY = segment[1][1] - segment[0][1]

        if(segX==0 and segY==0):
            print('0 length stitch!')
            continue

        segLength = math.sqrt(segX**2 + segY**2)
        angleB = math.asin(segY/segLength)

        if(segX<0):
            angleB = math.pi - angleB

        alpha = angleA - angleB
        beta = -angleA - angleB 

        # calculate the zigzag steps
        zig = [round(stitchLength * math.cos(alpha)), -1* round(stitchLength * math.sin(alpha))]
        zag = [round(stitchLength * math.cos(beta)),  -1* round(stitchLength * math.sin(beta))]

        # the amount of steps taken is calculated based on the rounded steps to account for rounding
        if(zig[1]+zag[1]==0 ):
            iterations = math.floor( segX / (zig[0]+zag[0]) ) - 1
        else:
            iterations = math.floor( segY / (zig[1]+zag[1]) ) - 1

        # start with half a zag
        output.append([round(zag[0]/2), round(zag[1]/2)])

        # do all the zigzags
        for i in range(iterations):
            output += [zig,zag]
        
        # end with a zig and another half zag to end up back in the center
        output += [zig, [round(zag[0]/2), round(zag[1]/2)]]
    
    return output