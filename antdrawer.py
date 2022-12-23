import jefgenerator
import csv

# do randomwalk (keep in same file for now)

# snoise2: [x, y, octaves, persistence, lacunarity]
# noise.snoise2(i, 0, 4, 5.0, 0.40)
# right now i have about 3 shifts over 42 points so lets say 15 per thing. decrease lacunarity to make it shift slower

steps = []

with open('ant4.csv', newline='') as csvfile:
    antreader = csv.reader(csvfile, delimiter=',', quotechar='|')

    temp = []

    for row in antreader:
        temp.append(row)

    for index, row in enumerate(temp):
        if(index>1):
            stepx = int(temp[index-1][0]) - int(row[0])
            stepy = int(temp[index-1][1]) - int(row[1])

            steps.append([stepx, stepy ])
        
jefgenerator.export_jef(steps, 'ant.jef')
