# STOP!
# THIS CODE IS STILL REALLY BAD AND NEEDS SO MANY FIXES STILL I HAVENT BOTHERED TO CLEAN IT UP

# i have two "passing value checks" but sometimes they dont get passed which i find odd!

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

gridsize = 50
stepsize = 30

targets = [0.15, 0.3, 0.7, 0.85]

# the amount of samples it checks to find the next point
grid_check_fidelity = 25
angle_check_fidelity = 64

noise_resolution = 5

coords = [[0,0]]
hor_pairs = []
ver_pairs = []

seed = {
    'x':1000 * random.random(),
    'y':1000 * random.random()
}

def get_z(x,y):
    # using noise:
    return noise.snoise2(seed['x'] + noise_resolution * x/size['x'], seed['y'] + + noise_resolution * y/size['y'])

    # using sine so i know its just gonna make circles and squares:
    # return math.sin(0.01 * x) * math.sin(0.01 * y) * 0.5 + 0.5

def check_pairs(pairs, orientation):

    # find a good pair
    startx = float('nan')
    starty = float('nan')
    for x in range(len(pairs)):
        for y in range(len(pairs[x])):

            if pairs[x][y]:
                startx = x * gridsize
                starty = y * gridsize

                if orientation == 'hor':
                    hor_pairs[x][y] = False
                else:
                    ver_pairs[x][y] = False

                break

        if not math.isnan(startx):
            break
    
    # find the real starting point
    x = startx
    y = starty
    if not math.isnan(x):

        current_zdiff = 0
        while x < startx + gridsize and y < starty + gridsize:
            previous_zdiff = current_zdiff
            current_zdiff = get_z(x,y)
            if previous_zdiff * current_zdiff < 0: #PASSING VALUE CHECK
                break

            if(orientation=='hor'):
                x += gridsize / grid_check_fidelity
            else:
                y += gridsize / grid_check_fidelity


    return {
        'x':x,
        'y':y
    }

def topographer():

    for target_z in targets:

        # create2d array of z values at grid points. structure: [[x1,y1],[x1,y2]], [[x2,y1],[x2,y2]]
        # for each point it create two "pair" booleans corresponding to its relation to its right and top (bottom in path viewer) neighbour to be used later
        grid = []

        global hor_pairs
        global ver_pairs
        hor_pairs = []
        ver_pairs = []

        for x in range(math.ceil(size['x'] / gridsize)):
            grid.append([])
            hor_pairs.append([])
            ver_pairs.append([])
            for y in range(math.ceil(size['y'] / gridsize)):
                grid[x].append(get_z(x * gridsize,y * gridsize))
                hor_pairs[x].append(False)
                ver_pairs[x].append(False)
        
        # check all pairs of neighbouring points in grid to see if target z is in between them
        marked_pairs = 0
        for x in range( len(grid) - 1 ):
            for y in range( len(grid[x]) - 1 ):
                # check horizontal neighbour
                if (grid[x][y] < target_z and grid[x+1][y] >= target_z) or (grid[x][y] > target_z and grid[x+1][y] <= target_z):
                    hor_pairs[x][y] = True
                    marked_pairs += 1

                # check vertical neighbour
                if (grid[x][y] < target_z and grid[x][y+1] >= target_z) or (grid[x][y] > target_z and grid[x][y+1] <= target_z):
                    ver_pairs[x][y] = True
                    marked_pairs += 1
        

        number_of_runs = 0
        full_circles = 0
        # keep drawing borders until all marked pairs have been passed
        while marked_pairs > 0:

            number_of_runs += 1

            # find starting pair
            start = check_pairs(hor_pairs, 'hor')
            if math.isnan(start['x']):
                start = check_pairs(ver_pairs, 'ver')

            marked_pairs -= 1

            # start drawing border :)
            x = start['x']
            y = start['y']
            return_angle = 999

            for border_index in range(1000):
                # check around for closest point to target
                current_zdiff = 0
                angle = 0
                while angle <= ( 2 * (angle_check_fidelity + 1) / angle_check_fidelity) * math.pi:

                    previous_zdiff = current_zdiff
                    current_zdiff = get_z(x + stepsize * math.cos(angle), y + stepsize * math.sin(angle)) - target_z

                    # check if it passed target z (this condition is fucking insane power brain move) also if its not the old one (this is condition bad)
                    if current_zdiff * previous_zdiff < 0 and not abs(angle - return_angle) < 2*math.pi / angle_check_fidelity: # PASSING VALUE CHECK
                        try_x = x + stepsize * math.cos(angle - math.pi / angle_check_fidelity)
                        try_y = y + stepsize * math.sin(angle - math.pi / angle_check_fidelity)

                        if try_x > size['x'] - 1 or try_x < 0 or try_y > size['y'] - 1 or try_y < 0:
                            continue

                        x = try_x
                        y = try_y

                        coords.append([round(x),round(y)])
                        return_angle = (angle + math.pi) % (math.pi * 2)


                        # mark crossed grid lines. i have no fucking clue whats going on here anymore. on some targets it has a 92% success rate. on others it just kills the function. never really works.
                        final_coord = len(coords) - 1
                        max_crossings = 3
                        ver_crossing = min(max( math.floor(coords[final_coord-1][0] / gridsize) - math.floor(coords[final_coord][0] / gridsize), -1 * max_crossings), max_crossings)
                        hor_crossing = min(max( math.floor(coords[final_coord-1][1] / gridsize) - math.floor(coords[final_coord][1] / gridsize), -1 * max_crossings), max_crossings)

                        # check vertical borders
                        for i in range( 0, ver_crossing, round(math.copysign(1,ver_crossing)) ):
                            if i>=0 and ver_crossing>0:
                                i += 1
                            for j in range( 0, round(math.copysign( abs(hor_crossing) + 1, hor_crossing )), round(math.copysign(1,hor_crossing) )):
                                
                                try:
                                    if ver_pairs[math.floor(coords[final_coord][0] / gridsize) + i][math.floor(coords[final_coord][1] / gridsize) + j]:
                                        ver_pairs[math.floor(coords[final_coord][0] / gridsize) + i][math.floor(coords[final_coord][1] / gridsize) + j] = False
                                        marked_pairs -= 1
                                except:
                                    print( 'error on ver')
                                    print( i, j )
                                    print( coords[final_coord] )
                                    print( 'ver crossing: ', ver_crossing, 'hor crossing: ', hor_crossing)
                                    print()

                        #check horizontal borders
                        for i in range( 0, hor_crossing, round(math.copysign(1,hor_crossing))  ):
                            if i>=0 and hor_crossing>0:
                                i += 1
                            for j in range( 0, round(math.copysign( abs(ver_crossing) + 1, ver_crossing )), round(math.copysign(1,hor_crossing) )):
                                
                                try:
                                    if hor_pairs[math.floor(coords[final_coord][0] / gridsize) + j][math.floor(coords[final_coord][1] / gridsize) + i]:
                                        hor_pairs[math.floor(coords[final_coord][0] / gridsize) + j][math.floor(coords[final_coord][1] / gridsize) + i] = False
                                        marked_pairs -= 1
                                except:
                                    print( 'error on hor')
                                    print( j, i )
                                    print( coords[final_coord] )
                                    print( 'ver crossing: ', ver_crossing, 'hor crossing: ', hor_crossing)
                                    print()
                        
                
                        break

                    angle += 2 * math.pi / angle_check_fidelity

                # if x < 0 or y < 0 or x > size['x'] or y > size['y'] :
                #     break

                if(x == start['x'] and y == start['y']):
                    break

                if math.sqrt((start['x'] - x)**2 + (start['y'] - y)**2) < stepsize and border_index > 1:
                    # print(x, y)
                    # print(start)
                    # print(math.sqrt((start['x'] - x)**2 + (start['y'] - y)**2))
                    # print( coords[ len(coords) - 1], border_index )
                    # print()
                    coords.append([round(start['x']), round(start['y'])])
                    full_circles += 1
                    break

        print(target_z)
        print(number_of_runs, 'of which full circles: ', full_circles)
    return coords


# old code that used random starting points
def fromRandomPoints():
    # perform arbitrary number of times
    for j in range(100):
        # pick random starting point
        x=size['x'] * random.random()
        y=size['y'] * random.random()
        coords.append([round(x),round(y)])
        startx = x
        starty = y
        target_z = get_z(x,y)
        return_angle = 200

        for i in range(1000):
            # check around for closest point to target
            current_zdiff = 0
            angle = 0
            while angle < 33/16 * math.pi:

                previous_zdiff = current_zdiff
                current_zdiff = get_z(x + stepsize * math.cos(angle), y + stepsize * math.sin(angle)) - target_z

                # check if it passed target z (this condition is fucking insane power brain move) also if its not the old one (this is condition is so fucking bad holy fucking shit dudeeee)
                if current_zdiff * previous_zdiff < 0 and not abs(angle - return_angle) < math.pi/16:
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

    return coords