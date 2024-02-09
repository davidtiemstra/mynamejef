import csv
import math

# i thought it was cool that it doesnt turn the real coordinates but the steps individually but actually that kinda sucks. lol
def getPath(filepath):
    steps = []

    with open(filepath, newline='') as csvfile:
        reader = csv.reader(csvfile, delimiter=',', quotechar='|')

        coords = []

        for row in reader:
            # print(row)

            if row[0] is not 'x':
                coords.append([int(row[0]), int(row[1])])


            # for index, point in enumerate(row):
            #     if(index%2 == 0):
            #         coords.append([float(point)])
            #     else:
            #         coords[int((index-1)/2)].append(round(float(point)))


        # for index, row in enumerate(coords):
            
        #     rotx = int(row[0] * math.cos(direction) - row[1] * math.sin(direction))
        #     roty = int(row[0] * math.sin(direction) + row[1] * math.cos(direction))

            

        #     coords[index] = [round(rotx * scale), round(roty * scale)]
            
        #     if(index>1):

        #         stepx = int(coords[index-1][0]) - int(coords[index][0])
        #         stepy = int(coords[index-1][1]) - int(coords[index][1])

        #         steps.append([stepx, stepy ])
    
    return coords
