from helpers import horizontalfill

X_STEP = 30
Y_STEP = 2


class Grid:

    grid = None
    path = []

    def __init__(self, columns, rows, cell_width, cell_height, default = 0):
        self.columns = columns
        self.rows = rows
        self.cell_width = cell_width
        self.cell_height = cell_height
        self.default = default
        # Initialize grid
        self.grid = [[self.default for y in range(self.rows)] for x in range(self.columns)]


    def enable_cell(self, column, row):
        self.grid[column][row] = 1

    def disable_cell(self, column, row):
        self.grid[column][row] = 0

    def clear(self):
        for x in range(self.columns):
            for y in range(self.rows):
                self.grid[x][y] = 0
        self.path = []

    def generate_path(self):
        direction = 1
        for y in range(self.rows):
            cell_groups = []
            current_group = []
            first_empty = True
            y_dir = y
            if direction == -1:
                y_dir = len(self.rows) - 1 - y

            for x in range(self.columns):

                if self.grid[x][y_dir] == 1:
                    current_group.append(x)
                    first_empty = True
                elif self.grid[x][y_dir] == 0 and first_empty:
                    cell_groups.append(current_group)
                    current_group = []
                    first_empty = False

            cell_groups.append(current_group)


            for cell_group in cell_groups:
                if cell_group and len(cell_group) != 0:
                    start = cell_group[0]
                    end = cell_group[len(cell_group)-1]

                    group_border = [[self.cell_width * start, y_dir * self.cell_height],
                                    [self.cell_width * end + self.cell_width, y_dir * self.cell_height],
                                    [self.cell_width * end + self.cell_width, y_dir * self.cell_height + self.cell_height],
                                    [self.cell_width * start, y_dir * self.cell_height + self.cell_height]]

                    filled_group = horizontalfill.horizontal_fill(group_border, Y_STEP, X_STEP)

                    for point in filled_group:
                        self.path.append(point)




        print(self.path)
        return self.path



