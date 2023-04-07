import tkinter as tk
from enum import Enum

#   ==================================================================================================================
#   WORK IN PROGRESS - DOCUMENTATION AND COMMENTS NOT FINISHED.
#   ==================================================================================================================


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

    current_scale = 1
    origin_x = 0
    origin_y = 0

    canvas_width = 600
    canvas_height = 600

    def __init__(self, canvas_size=[canvas_width, canvas_height],
                 background_color='black',
                 primary_color='green'):

        # Sets properties to values passed in init method (if none are passed defaults are used)
        self.background_color = background_color
        self.primary_color = primary_color
        self.canvas_size = canvas_size

        # Sets properties of the main window
        self.root.title("Path Viewer")
        self.root.geometry("700x700")
        self.root.resizable(width=True, height=True)
        self.root.configure(background=self.background_color)

        # Adds title above the canvas
        title = tk.Label(self.root, text="path viewer", font='Times 25', bg=self.background_color,
                         foreground=self.primary_color)
        title.pack()

        toolbar_frame = tk.Frame(self.root, bg=self.background_color)
        toolbar_frame.pack()


        zoom_in_button = tk.Button(toolbar_frame,
                                   text='+',
                                   command=self.zoom_in,
                                   highlightbackground='black')
        zoom_out_button = tk.Button(toolbar_frame,
                                    text='-',
                                    command=self.zoom_out,
                                    highlightbackground='black')
        reset_button = tk.Button(toolbar_frame,
                                 text='Reset',
                                 command=self.reset_frame,
                                 highlightbackground='black')

        zoom_in_button.pack(side=tk.LEFT)
        zoom_out_button.pack(side=tk.RIGHT)
        reset_button.pack(side=tk.RIGHT)

        # Sets properties of the canvas
        self.canvas = tk.Canvas(self.root,
                                width=canvas_size[0],
                                height=canvas_size[1],
                                bg=self.background_color,
                                bd=0,
                                highlightthickness=1,
                                highlightcolor=self.primary_color,
                                highlightbackground=self.primary_color,
                                cursor='fleur')

        self.canvas.pack(anchor=tk.CENTER, expand=True)

        self.canvas.bind("<ButtonPress-1>", self.move_start)
        self.canvas.bind("<B1-Motion>", self.move_move)

        self.origin_x = self.canvas.xview()[0]
        self.origin_y = self.canvas.yview()[0]

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

    def zoom_in(self):
        self.canvas.scale('all', 0, 0, 1.1, 1.1)
        self.current_scale = self.current_scale * 1.1

    def zoom_out(self):
        self.canvas.scale('all', 0, 0, (1 / 1.1), (1 / 1.1))
        self.current_scale = self.current_scale / 1.1

    def move_start(self, event):
        self.canvas.scan_mark(event.x, event.y)

    def move_move(self, event):
        self.canvas.scan_dragto(event.x, event.y, gain=1)

    def reset_frame(self):
        self.canvas.scale('all', 0, 0, 1 / self.current_scale, 1 / self.current_scale)
        self.current_scale = 1
        self.canvas.xview_moveto(self.origin_x)
        self.canvas.yview_moveto(self.origin_y)
