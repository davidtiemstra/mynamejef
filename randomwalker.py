import jefgenerator
import noise
import math
import antdrawer

# do randomwalk (keep in same file for now)

# snoise2: [x, y, octaves, persistence, lacunarity]
# noise.snoise2(i, 0, 4, 5.0, 0.40)
# right now i have about 3 shifts over 42 points so lets say 15 per thing. decrease lacunarity to make it shift slower

stepsize = 40
antscale = 1.5

for n in range(60):
    steps = []
    direction = 0.0
    for i in range(100):
        direction += noise.snoise2(50*n + i, 0, 4, 5.0, 0.40,) * 0.75
        steps.append([round(stepsize * math.cos(direction)), round(stepsize * math.sin(direction))])
    
    steps += antdrawer.antdrawer(direction - 0.5 * math.pi, antscale)

    jefgenerator.export_jef(steps, 'randomwalk' + str(n) + '.jef')
