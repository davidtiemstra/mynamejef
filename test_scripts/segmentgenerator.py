from math import *

SEGMENT_BOTTOM = [[10, 10],
                  [20, 20],
                  [60, 20],
                  [70, 10],
                  [60, 0, ],
                  [20, 0],
                  [10, 10]]
SEGMENT_MIDDLE = [[10, 110],
                  [20, 120],
                  [60, 120],
                  [70, 110],
                  [60, 100, ],
                  [20, 100],
                  [10, 110]]
SEGMENT_TOP = [[10, 210],
               [20, 220],
               [60, 220],
               [70, 210],
               [60, 200],
               [20, 200],
               [10, 210]]
SEGMENT_LEFT_TOP = [[10, 120],
                    [20, 130],
                    [20, 190],
                    [10, 200],
                    [0, 190],
                    [0, 130],
                    [10, 120]]
SEGMENT_LEFT_BOTTOM = [[10, 20],
                       [20, 30],
                       [20, 90],
                       [10, 100],
                       [0, 90],
                       [0, 30],
                       [10, 20]]
SEGMENT_RIGHT_TOP = [[70, 120],
                     [80, 130],
                     [80, 190],
                     [70, 200],
                     [60, 190],
                     [60, 130],
                     [70, 120]]
SEGMENT_RIGHT_BOTTOM = [[70, 20],
                        [80, 30],
                        [80, 90],
                        [70, 100],
                        [60, 90],
                        [60, 30],
                        [70, 20]]
SEGMENTS = [SEGMENT_BOTTOM, SEGMENT_MIDDLE, SEGMENT_TOP, SEGMENT_LEFT_TOP, SEGMENT_LEFT_BOTTOM, SEGMENT_RIGHT_TOP, SEGMENT_RIGHT_BOTTOM]
ZERO_PATH = SEGMENT_BOTTOM + \
            SEGMENT_LEFT_BOTTOM + \
            SEGMENT_LEFT_TOP + \
            SEGMENT_TOP + \
            SEGMENT_RIGHT_TOP + \
            SEGMENT_RIGHT_BOTTOM
ONE_PATH = SEGMENT_LEFT_TOP + SEGMENT_LEFT_BOTTOM
TWO_PATH = SEGMENT_TOP + SEGMENT_RIGHT_TOP + SEGMENT_MIDDLE + SEGMENT_LEFT_BOTTOM + SEGMENT_BOTTOM
THREE_PATH = SEGMENT_TOP + SEGMENT_RIGHT_TOP + SEGMENT_MIDDLE + SEGMENT_RIGHT_BOTTOM + SEGMENT_BOTTOM
FOUR_PATH = SEGMENT_LEFT_TOP + SEGMENT_MIDDLE + SEGMENT_RIGHT_TOP + SEGMENT_RIGHT_BOTTOM
FIVE_PATH = SEGMENT_TOP + SEGMENT_LEFT_TOP + SEGMENT_MIDDLE + SEGMENT_RIGHT_BOTTOM + SEGMENT_BOTTOM
SIX_PATH = SEGMENT_TOP + SEGMENT_LEFT_TOP + SEGMENT_LEFT_BOTTOM + SEGMENT_BOTTOM + SEGMENT_RIGHT_BOTTOM + SEGMENT_MIDDLE
SEVEN_PATH = SEGMENT_TOP + SEGMENT_RIGHT_TOP + SEGMENT_RIGHT_BOTTOM
EIGHT_PATH = ZERO_PATH = SEGMENT_BOTTOM + \
            SEGMENT_LEFT_BOTTOM + \
            SEGMENT_LEFT_TOP + \
            SEGMENT_TOP + \
            SEGMENT_RIGHT_TOP + \
            SEGMENT_MIDDLE + \
            SEGMENT_RIGHT_BOTTOM
NINE_PATH = SEGMENT_MIDDLE + SEGMENT_LEFT_TOP + SEGMENT_TOP + SEGMENT_RIGHT_TOP + SEGMENT_RIGHT_BOTTOM + SEGMENT_BOTTOM


def path_for_number(number):
    if number == 0:
        return ZERO_PATH
    if number == 1:
        return ONE_PATH
    if number == 2:
        return TWO_PATH
    if number == 3:
        return THREE_PATH
    if number == 4:
        return FOUR_PATH
    if number == 5:
        return FIVE_PATH
    if number == 6:
        return SIX_PATH
    if number == 7:
        return SEVEN_PATH
    if number == 8:
        return EIGHT_PATH
    if number == 9:
        return NINE_PATH



def generate_numbers(numbers, scale=1, spacing=10):

    full_path = []
    x_spacing = 90

    for i, number in enumerate(numbers):

            number_path = path_for_number(number)

            for point in number_path:

                new_x = point[0]+ (x_spacing * i)

                full_path.append([new_x, point[1]])
    print(full_path)
    return flip_y(full_path)

def populate_edge(ax, ay, bx, by, spacing):
    # Adds points along an edge. Come up with better name for function (linear interpolation?)
    dx = bx - ax
    dy = by - ay

    distance = sqrt((dx * dx) + (dy * dy))
    number_of_points = int(distance / spacing)
    path = []
    for i in range(1, number_of_points):
        angle = atan2(dy, dx)
        r = i * spacing
        x = ax + cos(angle) * r
        y = ay + sin(angle) * r
        path.append([x, y])
    path.append([bx, by])
    return path
def flip_y (path):
    flipped_path = []
    min_y = 10000000000
    max_y = -10000000000

    for point in path:
        if point[1]<min_y:
            min_y = point[1]
        if point[1]>max_y:
            max_y = point[1]
    for point in path:
        x = point[0]
        y = point[1] * -1 + (max_y-min_y)
        flipped_path.append([x,y])
    return  flipped_path
