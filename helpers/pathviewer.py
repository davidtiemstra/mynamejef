import tkinter as tk
from enum import Enum


# TO IMPLEMENT:
# 1) import pathviewer
# 2) create PathViewer object
# 3) call render_path and pass a path: [[x1,y1],[x2,y2],[x3.y3]] and pass the display mode: DisplayMode.DISPLAYMODE
# 4) call update to keep window opened

class DisplayMode(Enum):
    # Enum for selecting how to display the path
    LINE = 1
    POINTS = 2


class PathViewer:
    # This class uses tkinter to create a window and canvas in which a path can be easily displayed.

    background_color = None
    primary_color = None

    # This property determines the size of the canvas (the path is drawn inside the canvas)
    canvas_size = None

    # This property contains the main window
    root = tk.Tk()

    # This property contains the canvas inside the window in which the path is drawn
    canvas = tk.Canvas()

    def __init__(self, canvas_size=[800, 800], background_color='black', primary_color='green'):

        # Sets properties to values passed in init method (if none are passed defaults are used)
        self.background_color = background_color
        self.primary_color = primary_color
        self.canvas_size = canvas_size

        # Sets properties of the main window
        self.root.title("Path Viewer")
        self.root.geometry("900x900")
        self.root.resizable(width=True, height=True)
        self.root.configure(background=self.background_color)

        # Adds title above the canvas
        title = tk.Label(self.root, text="path viewer", font='Papyrus 25', bg=self.background_color,
                         foreground=self.primary_color)
        title.pack()

        # Sets properties of the canvas
        self.canvas = tk.Canvas(self.root,
                                width=canvas_size[0],
                                height=canvas_size[1],
                                bg=self.background_color,
                                bd=0,
                                highlightthickness=1,
                                highlightcolor=self.primary_color,
                                highlightbackground=self.primary_color)

        self.canvas.pack(anchor=tk.CENTER, expand=True)

    def update(self):
        # This method is needed to keep the root window opened
        self.root.mainloop()

    def render_path(self, path, display_mode):
        # Deletes all previous paths to be sure
        self.canvas.delete('all')

        # Determines display mode
        if display_mode == DisplayMode.LINE:
            # If line, create line
            self.canvas.create_line(path, width=1, fill=self.primary_color)
        elif display_mode == DisplayMode.POINTS:
            # If point, create oval at every point
            for point in path:
                x = point[0]
                y = point[1]
                self.canvas.create_oval(x, y, (x + 2), (y + 2), outline=self.primary_color, fill=self.primary_color)
