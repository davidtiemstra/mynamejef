from test_scripts import gridfill
from enum import Enum
class Direction(Enum):
    UP = 0
    DOWN = 1
    LEFT = 2
    RIGHT = 3

class Langston:

    x = 0
    y = 0
    dir = Direction.UP

    def __init__(self, columns, rows, width, height):
        self.grid = gridfill.Grid(columns, rows, width, height)
        self.x = int(self.grid.columns / 2)
        self.y = int(self.grid.rows / 2)

    def turn_cw(self):
        if self.dir == Direction.UP:
            self.dir = Direction.RIGHT
        elif self.dir == Direction.RIGHT:
            self.dir = Direction.DOWN
        elif self.dir == Direction.DOWN:
            self.dir = Direction.LEFT
        elif self.dir == Direction.LEFT:
            self.dir = Direction.UP

    def turn_ccw(self):
        if self.dir == Direction.UP:
            self.dir = Direction.LEFT
        elif self.dir == Direction.LEFT:
            self.dir = Direction.DOWN
        elif self.dir == Direction.DOWN:
            self.dir = Direction.RIGHT
        elif self.dir == Direction.RIGHT:
            self.dir = Direction.UP

    def forward(self):
        if self.dir == Direction.UP:
            if (self.y + 1) <= (self.grid.rows-1):
                self.y += 1
            else:
                self.y = 0
        if self.dir == Direction.LEFT:
            if (self.x - 1) >= 0:
                self.x -= 1
            else:
                self.x = self.grid.columns-1

        if self.dir == Direction.DOWN:
            if (self.y - 1) >= 0:
                self.y -= 1
            else:
                self.y = self.grid.rows-1
        if self.dir == Direction.RIGHT:
            if (self.x + 1) <= (self.grid.columns - 1):
                self.x += 1
            else:
                self.x = 0

    def next(self):
        if self.grid.grid[self.x][self.y] == 1:
            self.grid.disable_cell(self.x, self.y)
            self.turn_ccw()
            self.forward()
        else:
            self.grid.enable_cell(self.x, self.y)
            self.turn_cw()
            self.forward()

    def generate_path(self):
        return self.grid.generate_path()