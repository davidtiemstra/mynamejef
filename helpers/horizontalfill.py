from shapely.geometry import Point, Polygon


# takes border path and converts it to horizontal fill path
def horizontal_fill(path, thickness):
    extremes = calculate_extremes(path)
    shape = Polygon(path)

    # divide the shape up in horizontal lines. the y level is stored in the array
    # the thickness determines the amount of lines. higher thickness, less lines.
    y_levels = []
    current_level = extremes[1]
    print(extremes)
    while current_level < extremes[3]:
        current_level += thickness
        y_levels.append(current_level)


    fill_path = []


    for level in y_levels:

        for x in range(extremes[0], extremes[2]):
            if x % 30 == 0:
                point = Point(x, level)
                if shape.contains(point):
                    fill_path.append([x,level])


    return fill_path

def calculate_extremes(path):
    # define vars that contain the lowest x and y values in the path
    min_x = None
    max_x = None
    min_y = None
    max_y = None

    # calculate lowest x and y values
    for point in path:
        if min_x is None:
            min_x = point[0]
        elif point[0] < min_x:
            min_x = point[0]

        if max_x is None:
            max_x = point[0]
        elif point[0] > max_x:
            max_x = point[0]

        if min_y is None:
            min_y = point[1]
        elif point[1] < min_y:
            min_y = point[1]

        if max_y is None:
            max_y = point[1]
        elif point[1] > max_y:
            max_y = point[1]

    return [min_x, min_y, max_x, max_y]
