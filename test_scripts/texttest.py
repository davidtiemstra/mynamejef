from helpers import jefgenerator
from generators import drawletter

string = "electric tea"
title = 'text160'

steps = []

# 31 characters
gap = 20
minimum = 8
maximum = 160
scalar = 12
stitchdist = 8
vshift = 240

# normal
prev = [0,0]
shift = 0
for index, character in enumerate(string):

    size = maximum - round(index * scalar)
    size = max(size,minimum)

    coords = drawletter.drawLetter(character, size, size, stitchdist)

    for point in coords:
        steps.append([round(point[0]) - round(prev[0]), round(point[1]) - round(prev[1])])
        prev = point

    prev = [prev[0] - size - gap, prev[1]]
    shift += size + gap

# normal with bean
prev = [shift-gap, vshift]
for index, character in enumerate(string):

    size = maximum - round(index * scalar)
    size = max(size,minimum)

    coords = drawletter.drawLetter(character, size, size, stitchdist)

    for index2,point in enumerate(coords):
        x = round(point[0]) - round(prev[0])
        y = round(point[1]) - round(prev[1])
        if index2 == 0:
            steps += [[x,y]]
        else:
            steps += [[x,y],[-x,-y],[x,y]]
        prev = point

    prev = [prev[0] - size - gap, prev[1]]

# trim
prev = [shift-gap, vshift]
for index, character in enumerate(string):

    size = maximum - round(index * scalar)
    size = max(size, minimum)

    coords = drawletter.drawLetter(character, size, size, stitchdist)

    for point in coords:
        steps.append([round(point[0]) - round(prev[0]), round(point[1]) - round(prev[1])])
        prev = point

    steps += [[0,0],[0,0]]
    prev = [prev[0] - size - 20, prev[1]]

# trim with bean
prev = [shift-gap, vshift]
for index, character in enumerate(string):

    size = maximum - round(index * scalar)
    size = max(size, minimum)

    coords = drawletter.drawLetter(character, size, size, stitchdist)

    for index2,point in enumerate(coords):
        x = round(point[0]) - round(prev[0])
        y = round(point[1]) - round(prev[1])
        if index2 == 0:
            steps += [[x,y]]
        else:
            steps += [[x,y],[-x,-y],[x,y]]
        prev = point

    steps += [[0,0],[0,0]]
    prev = [prev[0] - size - 20, prev[1]]

jefgenerator.export_jef(steps, True, 'experiment output\\' + title + '.jef')