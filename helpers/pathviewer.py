import tkinter as tk
from enum import Enum


#   ==================================================================================================================
#   WORK IN PROGRESS [UNDER CONSTRUCTION] - DOCUMENTATION AND COMMENTS NOT FINISHED.
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


class Ruler:
    ruler = tk.Canvas()

    def __init__(self,
                 frame: tk.Canvas,
                 length=10,
                 is_horizontal=True,
                 background_color='black',
                 ruler_color='white',
                 intervals=12,
                 scale=1.0
                 ):

        self.frame = frame
        self.length = length
        self.is_horizontal = is_horizontal
        self.background_color = background_color
        self.ruler_color = ruler_color
        self.intervals = intervals
        self.scale = scale

        if is_horizontal:

            self.ruler = tk.Canvas(frame,
                                   width=length + 20,
                                   height=40,
                                   bg=self.background_color,
                                   bd=0,
                                   highlightthickness=0
                                   )
            self.ruler.create_line([[10, 0], [length + 10, 0]], width=1, fill=self.ruler_color)
            for i in range((-10 * intervals) - 1, (10 * intervals) + 1):
                point_a = [10 + (i * length / intervals), 0]
                point_b = [10 + (i * length / intervals), 12]
                self.ruler.create_line([point_a, point_b], width=1, fill=self.ruler_color)

                point_t = [10 + (i * length / intervals), 20]
                number_text = str(i * (self.length / self.intervals) / 10)
                self.ruler.create_text(point_t[0],
                                       point_t[1],
                                       text=number_text,
                                       font='Times',
                                       fill=self.ruler_color)

            self.ruler.pack(side=tk.BOTTOM, pady=10)

    def update_scale(self, new_scale, x_pos):
        self.scale = new_scale

        self.ruler.delete('all')
        self.ruler.create_line([[10, 0], [self.length + 10, 0]], width=1, fill=self.ruler_color)
        for i in range((-10 * self.intervals) - 1, (10 * self.intervals) + 1):

            point_a = [x_pos + 11 + (self.scale * i * self.length / self.intervals), 0]
            point_b = [ x_pos + 11 + (self.scale * i * self.length / self.intervals), 12]
            if 9 < point_a[0] < self.length + 11:
                self.ruler.create_line([point_a, point_b], width=1, fill=self.ruler_color)

            point_t = [x_pos + 11 + (self.scale * i * self.length / self.intervals), 20]
            number_text = str(i * (self.length / self.intervals) / 10)
            if self.scale > 0.55:
                self.ruler.create_text(point_t[0],
                                       point_t[1],
                                       text=number_text,
                                       font='Times 10',
                                       fill=self.ruler_color)
        self.ruler.create_text((self.length + 10) / 2,
                               35,
                               text='distance in (mm)',
                               font='Times 10',
                               fill=self.ruler_color)


def generate_bounds(path, scale):
    min_x = None
    min_y = None
    max_x = None
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

    min_x = min_x * scale
    min_y = min_y * scale
    max_y = max_y * scale
    max_x = max_x * scale
    return [min_x, max_x, min_y, max_y]


class PathViewer:
    # This class uses tkinter to create a window and canvas in which a path can be easily displayed.

    background_color = None
    canvas_color = None
    highlight_color = None
    draw_color = None
    jump_draw_color = None

    # This property determines the size of the canvas (the path is drawn inside the canvas)
    canvas_size = [600, 600]

    # This property contains the main window
    root = tk.Tk()

    # This property contains the canvas inside the window in which the path is drawn
    canvas = tk.Canvas()

    # Regen prompt entry
    regen_prompt_entry = tk.Entry()

    current_scale = 1
    origin_x = 0
    origin_y = 0

    # After which distance is a line between two points a jump stitch
    jump_distance = 122

    # zoom slider
    zoom_slider = tk.Scale()
    zoom_min = 0.1
    zoom_max = 15

    # ruler
    ruler = tk.Canvas()

    x_pan_start = 0
    x_pan = 0
    x_pos = 0

    # !!!!! Better way of doing this?
    current_display_mode = DisplayMode.POINTS
    current_path = []
    path_center = [0, 0]
    is_centered = True

    regen_prompt = ''

    def __init__(self,
                 background_color='#1E212B',
                 canvas_color='#6A7B76',
                 highlight_color='#E4FDE1',
                 draw_color='black',
                 jump_draw_color='black',
                 grid_color='#505c59',
                 regen_command=None,
                 regen_prompt=False
                 ):

        # Sets properties to values passed in init method (if none are passed defaults are used)
        self.background_color = background_color
        self.highlight_color = highlight_color
        self.canvas_color = canvas_color
        self.draw_color = draw_color
        self.jump_draw_color = jump_draw_color
        self.grid_color = grid_color

        self.regen_command = regen_command
        self.regen_prompt = regen_prompt

        # Sets properties of the main window
        self.root.title("Path Viewer")
        self.root.geometry("730x820")
        self.root.resizable(width=False, height=False)
        self.root.configure(background=self.background_color)

        # Adds title above the canvas
        title = tk.Label(self.root, text="path viewer", font='Times 30', bg=self.background_color,
                         foreground=self.highlight_color, pady=5)
        title.pack()

        draw_frame = tk.Frame(self.root,
                              bg=self.background_color,
                              width=self.canvas_size[0],
                              height=self.canvas_size[1] + 300
                              )

        draw_frame.pack(side=tk.RIGHT, pady=10, padx=20)
        toolbar_frame = tk.Frame(draw_frame,
                                 bg=self.background_color,
                                 width=600,
                                 height=300
                                 )

        toolbar_frame.pack(side=tk.BOTTOM, anchor=tk.W, padx=0, pady=10)

        zoom_in_button = tk.Button(toolbar_frame,
                                   font='Times',
                                   text='+',
                                   command=self.zoom_in,
                                   highlightbackground=self.background_color)
        zoom_out_button = tk.Button(toolbar_frame,
                                    font='Times',
                                    text='-',
                                    command=self.zoom_out,
                                    highlightbackground=self.background_color)

        reset_button = tk.Button(toolbar_frame,
                                 font='Times',
                                 text='reset',
                                 command=self.reset_frame,
                                 highlightbackground=self.background_color)

        regen_button = tk.Button(toolbar_frame,
                                 font='Times',
                                 text='regen',
                                 command=self.regen,
                                 highlightbackground=self.background_color)

        self.regen_prompt_entry = tk.Entry(toolbar_frame,
                                           font='Times',
                                           text='prompt',
                                           fg=highlight_color)

        display_button = tk.Button(toolbar_frame,
                                   font='Times',
                                   text='view mode',
                                   command=self.toggle_display_mode,
                                   highlightbackground=self.background_color)

        self.zoom_slider = tk.Scale(self.root,
                                    from_=self.zoom_max,
                                    to=self.zoom_min,
                                    resolution=0.01,
                                    command=self.update_slider_scale,
                                    length=self.canvas_size[1],
                                    bg=self.background_color,
                                    fg=self.highlight_color,
                                    troughcolor=self.canvas_color,
                                    width=20
                                    )
        self.zoom_slider.set(1)
        self.zoom_slider.pack(side=tk.TOP, pady=35)

        self.bounds_check_var = tk.IntVar(self.root)

        self.bounds_check = tk.Checkbutton(toolbar_frame,
                                           text='Bounds',
                                           variable=self.bounds_check_var,
                                           onvalue=1,
                                           offvalue=0,
                                           command=self.toggle_bounds,
                                           bg=self.background_color)
        self.bounds_check.var = self.bounds_check_var

        display_button.pack(side=tk.LEFT)
        zoom_in_button.pack(side=tk.LEFT)
        zoom_out_button.pack(side=tk.LEFT)
        reset_button.pack(side=tk.LEFT)
        self.bounds_check.pack(side=tk.LEFT)

        if self.regen_command is not None:
            spacer_frame = tk.Frame(toolbar_frame,
                                    width=120,
                                    height=30,
                                    bg=self.background_color)
            spacer_frame.pack(side=tk.LEFT)
            regen_button.pack(side=tk.RIGHT)
            if self.regen_prompt == True:
                spacer_frame.config(width=50)
                self.regen_prompt_entry.pack(side=tk.RIGHT, padx=10)

        # Sets properties of the canvas
        self.canvas = tk.Canvas(draw_frame,
                                width=self.canvas_size[0],
                                height=self.canvas_size[1],
                                bg=self.canvas_color,
                                bd=0,
                                highlightthickness=1,
                                highlightcolor=self.highlight_color,
                                highlightbackground=self.highlight_color,
                                cursor='fleur')

        self.canvas.pack(side=tk.TOP, expand=False)

        self.canvas.bind("<ButtonPress-1>", self.move_start)
        self.canvas.bind("<ButtonRelease-1>", self.move_end)
        self.canvas.bind("<B1-Motion>", self.move_move)

        self.display_grid(12, 1)

        self.ruler = Ruler(frame=draw_frame,
                           length=self.canvas_size[0],
                           background_color=self.background_color,
                           ruler_color=self.highlight_color)

        self.origin_x = self.canvas.xview()[0]
        self.origin_y = self.canvas.yview()[0]

    def update(self):
        # This method is needed to keep the root window opened
        self.root.mainloop()

    def render_path(self, path, display_mode, is_centered):
        self.current_display_mode = display_mode
        self.is_centered = is_centered
        # Deletes all previous paths to be sure

        self.canvas.delete('all')
        self.display_grid(12, 1)
        # Centers path if is_centered is true -> sets origin to center of canvas
        edited_path = []
        if is_centered:
            for point in path:
                x = point[0] + self.canvas_size[0] / 2
                y = point[1] + self.canvas_size[1] / 2
                edited_path.append([x, y])
        else:
            edited_path = path
        self.current_path = edited_path

        bounds = generate_bounds(self.current_path, self.current_scale)
        center_x = ((bounds[1] - bounds[0]) / 2) + bounds[0]
        center_y = ((bounds[3] - bounds[2]) / 2) + bounds[2]
        self.path_center = [center_x, center_y]
        # Determines display mode
        if display_mode == DisplayMode.LINE:

            # If line, create line
            for index, point in enumerate(edited_path):
                if index < len(edited_path) - 1:
                    line = [edited_path[index], edited_path[index + 1]]
                    dx = abs(edited_path[index + 1][0] - edited_path[index][0])
                    dy = abs(edited_path[index + 1][1] - edited_path[index][1])
                    if max(dx, dy) > self.jump_distance:
                        self.canvas.create_line(line, width=1, fill=self.jump_draw_color, dash=(2, 3))
                    else:
                        self.canvas.create_line(line, width=1, fill=self.draw_color)


        elif display_mode == DisplayMode.POINTS:
            # If point, create oval at every point
            for point in edited_path:
                x = point[0]
                y = point[1]
                self.canvas.create_oval(x, y, (x + 1), (y + 1), outline=self.draw_color, fill=self.draw_color)

    def display_grid(self, intervals, scale):
        distance = self.canvas_size[0] / intervals * scale
        print('distNCE')
        print(distance)
        for x in range(-1000, 1000):
            point_a = [x * distance, -10000]
            point_b = [x * distance, 10000]
            self.canvas.create_line([point_a, point_b], width=1, fill=self.grid_color)

            point_c = [-10000, x * distance]
            point_d = [10000, x * distance]
            self.canvas.create_line([point_c, point_d], width=1, fill=self.grid_color)

    def zoom_in(self):
        self.current_scale = self.current_scale * 1.1
        self.canvas.scale('all', 0,0, self.current_scale, self.current_scale)
        self.ruler.update_scale(self.current_scale, (self.x_pos))

    def zoom_out(self):
        self.current_scale = self.current_scale / 1.1
        self.canvas.scale('all',0,0, self.current_scale, self.current_scale)
        self.ruler.update_scale(self.current_scale, (self.x_pos))

    def update_slider_scale(self, value):
        self.canvas.scale('all', 0,0, 1 / self.current_scale,
                          1 / self.current_scale)
        self.current_scale = float(value)
        self.canvas.scale('all', 0,0, self.current_scale, self.current_scale)
        self.ruler.update_scale(self.current_scale, (self.x_pos))

    def move_start(self, event):
        self.canvas.scan_mark(event.x, event.y)
        self.x_pan_start = event.x

    def move_end(self, event):
        self.x_pos += self.x_pan

    def move_move(self, event):
        self.canvas.scan_dragto(event.x, event.y, gain=1)
        self.x_pan = event.x - self.x_pan_start

        print(self.x_pan)
        self.ruler.update_scale(self.current_scale, (self.x_pan + self.x_pos))

    def reset_frame(self):
        self.canvas.scale('all', 0,0, 1 / self.current_scale,
                          1 / self.current_scale)
        self.current_scale = 1
        self.zoom_slider.set(self.current_scale)
        self.x_pan = 0
        self.x_pos = 0
        self.ruler.update_scale(self.current_scale, 0)
        self.canvas.xview_moveto(self.origin_x)
        self.canvas.yview_moveto(self.origin_y)

    def regen(self):
        if self.regen_command is not None:
            print('not none')
            self.reset_frame()
            self.regen_command(self.regen_prompt_entry.get())

    def toggle_bounds(self):
        if self.bounds_check_var.get() == 1:
            bounds = generate_bounds(self.current_path, self.current_scale)

            self.canvas.create_line([bounds[0], bounds[2]], [bounds[1], bounds[2]], width=2, fill=self.highlight_color)
            self.canvas.create_line([bounds[0], bounds[3]], [bounds[1], bounds[3]], width=2, fill=self.highlight_color)
            self.canvas.create_line([bounds[0], bounds[2]], [bounds[0], bounds[3]], width=2, fill=self.highlight_color)
            self.canvas.create_line([bounds[1], bounds[2]], [bounds[1], bounds[3]], width=2, fill=self.highlight_color)

            text_width = 'width: ' + str(round((bounds[1] - bounds[0]) / 10, 2)) + 'mm'
            self.canvas.create_text(bounds[0] + 7,
                                    bounds[3] - 23,
                                    text=text_width,
                                    font='Times 10',
                                    fill=self.highlight_color,
                                    anchor=tk.W)
            text_height = 'height: ' + str(round((bounds[3] - bounds[2]) / 10, 2)) + 'mm'
            self.canvas.create_text(bounds[0] + 7,
                                    bounds[3] - 10,
                                    text=text_height,
                                    font='Times 10',
                                    fill=self.highlight_color,
                                    anchor=tk.W)
        else:
            self.render_path(self.current_path, self.current_display_mode, False)
            self.canvas.scale('all', 0,0, self.current_scale, self.current_scale)

    def toggle_display_mode(self):
        print('toggle')
        if self.current_display_mode == DisplayMode.LINE:
            print('LINE')
            self.current_display_mode = DisplayMode.POINTS
            self.render_path(self.current_path, DisplayMode.POINTS, False)
            self.canvas.scale('all', 0, 0, self.current_scale, self.current_scale)
        elif self.current_display_mode == DisplayMode.POINTS:
            print("POINST")
            self.current_display_mode = DisplayMode.LINE
            self.render_path(self.current_path, DisplayMode.LINE, False)
            self.canvas.scale('all', 0, 0, self.current_scale, self.current_scale)
