from math import *


def matrix_mult(matrix, point):
    new_x = (point[0] * matrix[0][0]) + (point[1] * matrix[0][1]) + (point[2] * matrix[0][2])
    new_y = (point[0] * matrix[1][0]) + (point[1] * matrix[1][1]) + (point[2] * matrix[1][2])
    return [new_x, new_y]


def project_vertices(vertices, edges, focal_length, edge_spacing=100):
    projected_vertices = []
    for vertex in vertices:
        matrix = [[focal_length / (focal_length - vertex[2]), 0, 0],
                  [0, focal_length / (focal_length - vertex[2]), 0]]
        projected_vertex = matrix_mult(matrix, vertex)
        projected_vertices.append(projected_vertex)

    path = []
    path.append([projected_vertices[edges[0][0]][0],
                projected_vertices[edges[0][0]][1]])
    for edge in edges:

        edge_path = populate_edge(projected_vertices[edge[0]][0],
                                  projected_vertices[edge[0]][1],
                                  projected_vertices[edge[1]][0],
                                  projected_vertices[edge[1]][1],
                                  edge_spacing)
        for point in edge_path:
            path.append(point)
    return path


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


def rotate_z(vertices, angle):
    matrix = [[cos(angle), -sin(angle), 0],
              [sin(angle), cos(angle), 0],
              [0, 0, 1]]
    new_vertices = []
    for vertex in vertices:
        new_x = (matrix[0][0] * vertex[0]) + (matrix[0][1] * vertex[1]) + (matrix[0][2] * vertex[2])
        new_y = (matrix[1][0] * vertex[0]) + (matrix[1][1] * vertex[1]) + (matrix[1][2] * vertex[2])
        new_z = (matrix[2][0] * vertex[0]) + (matrix[2][1] * vertex[1]) + (matrix[2][2] * vertex[2])
        new_vertices.append([new_x, new_y, new_z])
    return new_vertices


def rotate_x(vertices, angle):
    matrix = [[1, 0, 0],
              [0, cos(angle), -sin(angle)],
              [0, sin(angle), cos(angle)]]
    new_vertices = []
    for vertex in vertices:
        new_x = (matrix[0][0] * vertex[0]) + (matrix[0][1] * vertex[1]) + (matrix[0][2] * vertex[2])
        new_y = (matrix[1][0] * vertex[0]) + (matrix[1][1] * vertex[1]) + (matrix[1][2] * vertex[2])
        new_z = (matrix[2][0] * vertex[0]) + (matrix[2][1] * vertex[1]) + (matrix[2][2] * vertex[2])
        new_vertices.append([new_x, new_y, new_z])
    return new_vertices


def rotate_y(vertices, angle):
    matrix = [[cos(angle), 0, sin(angle)],
              [0, 1, 0],
              [-sin(angle), 0, cos(angle)]]
    new_vertices = []
    for vertex in vertices:
        new_x = (matrix[0][0] * vertex[0]) + (matrix[0][1] * vertex[1]) + (matrix[0][2] * vertex[2])
        new_y = (matrix[1][0] * vertex[0]) + (matrix[1][1] * vertex[1]) + (matrix[1][2] * vertex[2])
        new_z = (matrix[2][0] * vertex[0]) + (matrix[2][1] * vertex[1]) + (matrix[2][2] * vertex[2])
        new_vertices.append([new_x, new_y, new_z])
    return new_vertices


def scale(vertices, amount):
    new_vertices = []
    for vertex in vertices:
        new_x = vertex[0] * amount
        new_y = vertex[1] * amount
        new_z = vertex[2] * amount
        new_vertices.append([new_x, new_y, new_z])
    return new_vertices
