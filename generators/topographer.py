# STOP!
# THIS CODE IS STILL REALLY BAD AND NEEDS SO MANY FIXES STILL I HAVENT BOTHERED TO CLEAN IT UP

import math
import noise
import random

# input: 2d simplex noise field

# draw borders at certain height levels.

# algorithm:
# start at point close to desired height dh
# check in a circle around itself with radius r
# find the angle where its closest to dh
# (maybe check big angle differences first and then more checks at smaller angle diff)
# append next point

# how to go to next border at same height?

size = {
    'x':1000,
    'y':1000
}

stepsize = 10
noise_resolution = 13

coords = [[0,0]]

seed = {
    'x':1000 * random.random(),
    'y':1000 * random.random()
    }

def getAlt(x,y):
    # using noise:
    # return noise.snoise2(seed['x'] + noise_resolution * x/size['x'], seed['y'] + + noise_resolution * y/size['y'])

    # using sine so i know its just gonna make circles:
    return math.sin(0.01 * x) * math.sin(0.01 * y)

def topographer():

    for j in range(100):
        x=size['x'] * random.random()
        y=size['y'] * random.random()
        coords.append([round(x),round(y)])
        startx = x
        starty = y
        target_alt = getAlt(x,y)
        return_angle = 200

        for i in range(1000):
            # check around for closest point to target
            current_altdiff = 0
            angle = 0
            while angle < 33/16 * math.pi:

                previous_altdiff = current_altdiff
                current_altdiff = getAlt(x + stepsize * math.cos(angle), y + stepsize * math.sin(angle)) - target_alt

                # check if it passed target alt (this condition is fucking insane power brain move) also if its not the old one (this is condition is so fucking bad holy fucking shit dudeeee)
                if current_altdiff * previous_altdiff < 0 and not abs(angle - return_angle) < math.pi/16:
                    # print('new')
                    # add new point
                    x = x + stepsize * math.cos(angle - math.pi / 32)
                    y = y + stepsize * math.sin(angle - math.pi / 32)
                    coords.append([round(x),round(y)])
                    return_angle = (angle + math.pi) % (math.pi * 2)

                    break

                angle += math.pi / 16

            if x < 0 or y < 0 or x > size['x'] or y > size['y'] :
                break
            
            if math.sqrt((startx-x)**2 + (starty-y)**2) < 0.99 * stepsize:
                coords.append([round(startx),round(starty)])
                break

    path = []
    for i in range(len(coords)-1):
        path.append([coords[i+1][0]-coords[i][0], coords[i+1][1]-coords[i][1]])

    return path
