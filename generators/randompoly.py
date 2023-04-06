import random
from shapely.geometry import Point, Polygon, LineString


#   ==================================================================================================================
#   WORK IN PROGRESS - DOCUMENTATION AND COMMENTS NOT FINISHED.
#   ==================================================================================================================



# TODO
# For each point, in order to check whether it intersects:
# Divide current polygon into sides
# Make a line from current point and previous point
# See if the line interesects with any of the sides
# If it intersects, then generate a new point


origin = [0,0]

def generate_polygon(bounds, vertices):
    attempt = 0
    correct_polygon = False
    polygon = []
    while correct_polygon is False:

        print('Attempt: ' + str(attempt))

        attempt += 1
        polygon = []
        for count in range(vertices):
            if count < 3:
                if count == 0:
                    x = origin[0]
                    y = origin[1]
                else:
                    x = random.randint(bounds[0], bounds[1])
                    y = random.randint(bounds[2], bounds[3])
                polygon.append([x, y])
                #print(polygon)
            else:
                new_vertex = generate_vertex(polygon, bounds)
                #print(new_vertex)
                polygon.append(new_vertex)
                #print(polygon)
        #print('Polygon0:')
        #print(polygon[0])
        #print('-------')
        if is_intersecting(polygon[0], polygon, True) is False:
            correct_polygon = True
            print("SHAPE CLOSED")
            polygon.append(polygon[0])

    return polygon


def generate_vertex(current_polygon, bounds):
    vertex_found = False
    x = random.randint(bounds[0], bounds[1])
    y = random.randint(bounds[2], bounds[3])

    while vertex_found is False:
        if is_intersecting([x,y],current_polygon, False) is False:
            vertex_found = True
            #print('VERTEX FOUND')
        else:
            print('INTERSECTING')
            x = random.randint(bounds[0], bounds[1])
            y = random.randint(bounds[2], bounds[3])

    return [x,y]


def is_intersecting(new_vertex, current_polygon, exclude_origin):
    last_vertex = current_polygon[len(current_polygon) - 1]
    new_edge = LineString([(last_vertex[0], last_vertex[1]), (new_vertex[0], new_vertex[1])])


    starting_point = 0
    if exclude_origin:
        starting_point = 1

    intersections = 0
    old_edges = []

    for count, vertex in enumerate(current_polygon):
        if count < len(current_polygon) - 2 - starting_point:
            # print('Count:')
            # print(count)
            # print('Poly Length:')
            # print(len(current_polygon))
            point_a = current_polygon[count+starting_point]
            point_b = current_polygon[count+starting_point + 1]

            edge = LineString([(point_a[0], point_a[1]), (point_b[0], point_b[1])])
            old_edges.append(edge)

    for edge in old_edges:
        if new_edge.intersects(edge):
            #print('Intersects')
            #print(new_edge)
            #print(edge)
            intersections += 1

    if intersections > 0:
        return True
    else:
        return False
