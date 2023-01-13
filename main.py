from helpers import pathviewer
import random
from generators import dnadrawer

if __name__ == "__main__":

    viewer = pathviewer.PathViewer(primary_color='blue', background_color='white')
    #viewer.primary_color = 'blue'

    path = []
    for i in range(100):
        x = random.randint(0,700)
        y = random.randint(0,700)
        path.append([x,y])

    viewer.render_path(path, pathviewer.DisplayMode.POINTS)
    viewer.update()

