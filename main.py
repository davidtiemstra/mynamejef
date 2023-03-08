from helpers import pathviewer
from helpers import horizontalfill
import random

if __name__ == "__main__":

    viewer = pathviewer.PathViewer(primary_color='yellow')
    #viewer.primary_color = 'blue'

    path = [[0,0],[10,100],[10,400],[400,20],[0,0]]

    fill_path = horizontalfill.horizontal_fill(path, 10)
    print(fill_path)
    #viewer.render_path(path, pathviewer.DisplayMode.LINE)
    viewer.render_path(fill_path, pathviewer.DisplayMode.POINTS)
    viewer.update()

