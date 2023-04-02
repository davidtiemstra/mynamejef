import math
import noise
import random

def normalcircle(radius, offset, step_count, relative=False):

    coords = [[0,0]]

    for i in range(step_count+1):
        angle = i* 2 * math.pi/step_count
        
        x = math.cos(angle) * radius + offset
        y = math.sin(angle) * radius + offset
        
        coords.append([round(x), round(y)])

    if relative:
        steps = []
        for i in range(len(coords) - 1):
            steps.append([round(coords[i+1][0] - coords[i][0]), round(coords[i+1][1] - coords[i][1])])
        return steps

    return coords

def wonkycircle(radius, amplitude, offset, step_count, wonkiness=13, seed=False, relative=False):
    coords = []

    if(seed==False):
        seed = 1000 * random.random()

    for i in range(step_count+1):
        angle = i* 2 * math.pi/step_count

        noise_value = noise.pnoise1(seed + wonkiness * (i/step_count), repeat=wonkiness)
        this_radius = radius + radius * amplitude * noise_value

        x = math.cos(angle) * this_radius + offset
        y = math.sin(angle) * this_radius + offset
        
        coords.append([x,y])

    if relative:
        coords.insert(0, [0,0])
        steps = []
        for i in range(len(coords) - 1):
            steps.append([round(coords[i+1][0] - coords[i][0]), round(coords[i+1][1] - coords[i][1])])
        return steps

    return coords