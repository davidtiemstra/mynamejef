import random
import math

def voronoi (width, height, n):

    # Generate random seed points
    points = []
    for p in range(n):
        x = random.randint(0,width)
        y = random.randint(0,height)
        points.append([x,y])

    # Create a list with a value for every point within width and height and set to -1
    values = [-1]*width*height

    # Go over every point in the list and set its value to index of nearest seed point
    for x in range(width):
        for y in range(height):
            shortest_distance = 10000000
            closest_point = points[0]
            for point in points:
                distance = int(math.sqrt(((x-point[0])*(x-point[0]))+((y-point[1])*(y-point[1]))))
                if distance < shortest_distance:
                    shortest_distance = distance
                    closest_point = point
            values[y*width+x] = points.index(closest_point)

    # Check orthogonally connected points for every point. If their values are different, it is near a border.
    borders = []
    for x in range(1,width-1):
        for y in range(1,height-1):
            up = values[(y+1)*width+x]
            down = values[(y-1)*width+x]
            left = values[y * width + x -1]
            right = values[y * width + x + 1]
            if not(up == down and down == left and left == right):

                borders.append([x,y])

    # Because too many points are generated, border points are deleted based on clean factor (higher is fewer points)
    clean_borders = []
    clean_factor = 2
    for i, point in enumerate(borders):
        if i%clean_factor == 0:
            clean_borders.append(point)


    return clean_borders