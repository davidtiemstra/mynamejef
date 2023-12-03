from helpers import jefgenerator
import noise
import math
import random
from generators import antdrawer

# do randomwalk (keep in same file for now)

# noise.snoise2(x=i, y=0, octaves=4, persistence=5.0, lacunarity=0.40)
# right now i have about 3 shifts over 42 points so lets say 15 per thing. decrease lacunarity to make it shift slower
# find full noise explanation either with help() or in pnoise-doc.txt

def randomWalkAnt(seed=False):

    if(seed==False):
        seed = 1000 * random.random()

    stepsize = 40
    antscale = 1.5

    steps = []
    direction = 0.0
    for i in range(100):
        direction += noise.snoise2(seed + i, 0, 4, 5.0, 0.40,) * 0.75
        steps.append([round(stepsize * math.cos(direction)), round(stepsize * math.sin(direction))])
    
    steps += antdrawer.antdrawer(direction - 0.5 * math.pi, antscale)

    path = [[0,0]]
    for i in range(len(steps)):
        path.append([path[i][0] + steps[i][0], path[i][1] + steps[i][1]])
    return path
    # jefgenerator.export_jef(steps, True, 'experiment_output/randomwalkcentered' + str(n) + '.jef')


def randomwalker(length, stepsize=50, direction=0.0, seed=False, absolute=False):
    steps = []

    if(seed==False):
        seed = 1000 * random.random()

    for i in range(length):
        direction += noise.snoise2(seed+i, 0, 4, 5.0, 0.40) * 0.75
        steps.append([round(stepsize * math.cos(direction)), round(stepsize * math.sin(direction))])
    
    if(absolute):
        coords = [[0,0]]
        for i in range(len(steps)):
            coords.append([coords[i][0]+steps[i][0], coords[i][1]+steps[i][1]])
        return coords

    return steps