import shapely
from shapely import *
from shapely.geometry import Point, Polygon, LineString, GeometryCollection
import random

#   ==================================================================================================================
#   DESCRIPTION:
#   Takes circumference path and converts it to horizontal fill path.
#   It first calculates the extremes, and divides the shape up in different y-levels or rows.
#   At each row it creates a line from the min_x to the max_x at that specific y level.
#   Then it calculates where that line intersects with the shape in order to find the points on the circumference
#   at that y level. It uses the shapely library for the calculations.
#   Then it adds stitch points in between those points according to the x-step parameter.
#   It also randomly offsets the x-steps so the stitches don't all line up vertically.
#   It alters direction at each row to create a zigzag path and eventually returns that path as a list.

#   PARAMETERS:
#   y_step (int): distance between rows (2 worked well, determined by initial testing)
#   x_step (int): distance between stitches in each row (50 worked well, determined by initial testing)

#   RETURNS:
#   fill_path (list): list containing all the points on the path ([[x1,y1],[x2,y2]])
#   ==================================================================================================================


def horizontal_fill(path, y_step, x_step):
    extremes = calculate_extremes(path)

    # Creates a shapely shape with path to do calculations later.
    shape = Polygon(path)

    # This holds the current y level as we add values to the y_levels array. Initial value is min_y (extremes[1]).
    current_level = extremes[1]
    y_levels = []

    # Adds all the y levels to y_levels. Goes from min_y to max_y (extremes[3]) and uses y_step as interval
    while current_level < extremes[3]:
        if (current_level + y_step) < extremes[3]:
            current_level += y_step
        else:
            current_level = extremes[3]
        y_levels.append(current_level)

    fill_path = []

    # Holds direction value. 1 = Right, -1 = Left
    direction = 1

    for level in y_levels:

        # Calculates the points on the circumference at the current y level by checking the intersections between
        # the circumference/shape and a line at the current y level from min_x to max_x.
        line = LineString([(extremes[0], level), (extremes[2], level)])
        intersections = shape.intersection(line)
        intersections_list = []

        # Converts shapely intersection to list
        if intersections.geom_type == 'GeometryCollection' or intersections.geom_type == 'MultiLineString':
            # If the intersection type is a GeometryCollection or MultiLineString, we have to get the coords from
            # the sub geometries. Shapely automatically generates the intersection type and sometimes
            # (if there are 3 intersection points) it creates a collection with sub geometries instead of just one
            # geometry. If this happens it now iterates over all the geometries first and then over the coords
            # or else it crashes. This seems to be a bug or bad implementation in shapely.

            for item in intersections.geoms:
                for coord in item.coords:
                    intersections_list.append(coord)

        else:
            print(intersections.geom_type)
            for coord in intersections.coords:
                intersections_list.append(coord)

        # Random int to shift the stitch points, so they do not all line up vertically.
        x_shift = random.randint(0, 50)

        print('listlist')
        print(intersections_list)

        if direction == 1:

            # Adds the first intersection as the first point in the line
            fill_path.append(intersections_list[0])

            # For every x between the min_x and max_x
            for x in range(extremes[0], extremes[2]):

                # If x is a multiple of x_step
                if x % x_step == 0:

                    # Create shapely point at x (+_the x shift) and current y level
                    point = Point((x + x_shift), level)

                    # Check if that x is within the shape
                    if shape.contains(point):
                        # If it is within the shape, add it to the fill_path array
                        fill_path.append([(x + x_shift), level])
            direction = -1

            # Also add the last intersection to the fill path
            fill_path.append(intersections_list[len(intersections_list) - 1])
        else:
            # This does the same as for the other direction, but the points are first added to temp_list,
            # then temp_list is reversed and added to the array, to match the direction.
            fill_path.append(intersections_list[len(intersections_list) - 1])
            temp_list = []
            for x in range(extremes[0], extremes[2]):
                if x % x_step == 0:
                    point = Point(x + x_shift, level)
                    if shape.contains(point):
                        temp_list.append([(x + x_shift), level])
            direction = 1
            temp_list.reverse()
            fill_path.extend(temp_list)
            fill_path.append(intersections_list[0])

    return fill_path


# This function calculates the extremes for a path
def calculate_extremes(path):

    min_x = None
    max_x = None
    min_y = None
    max_y = None

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
