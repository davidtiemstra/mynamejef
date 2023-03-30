from helpers import jefgenerator
import noise
import math
import random
from generators import antdrawer

# do randomwalk (keep in same file for now)

# snoise2: [x, y, octaves, persistence, lacunarity]
# noise.snoise2(i, 0, 4, 5.0, 0.40)
# right now i have about 3 shifts over 42 points so lets say 15 per thing. decrease lacunarity to make it shift slower

def randomWalkAnt():
    stepsize = 40
    antscale = 1.5

    for n in range(10):
        steps = []
        direction = 0.0
        for i in range(100):
            direction += noise.snoise2(50*n + i, 0, 4, 5.0, 0.40,) * 0.75
            steps.append([round(stepsize * math.cos(direction)), round(stepsize * math.sin(direction))])
        
        steps += antdrawer.antdrawer(direction - 0.5 * math.pi, antscale)

        jefgenerator.export_jef(steps, True, 'experiment_output/randomwalkcentered' + str(n) + '.jef')


def randomwalker(length, stepsize=50, direction=0.0, seed=False):
    steps = []

    if(seed==False):
        seed = 1000 * random.random()

    for i in range(100):
        direction += noise.snoise2(seed+i, 0, 4, 5.0, 0.40,) * 0.75
        steps.append([round(stepsize * math.cos(direction)), round(stepsize * math.sin(direction))])
    
    return steps