from helpers import pathviewer
from helpers import dstgenerator
from helpers import horizontalfill
from helpers import satinstitch
from generators import randomwalker
import random
from generators import dnadrawer

if __name__ == "__main__":

    viewer = pathviewer.PathViewer(primary_color='yellow')
    #viewer.primary_color = 'blue'

    #running randomwalk + satinstitch experiment
    path = randomwalker.randomwalker(100, stepsize=25, absolute=True)
    satin_path = satinstitch.satinstitch(path, density=1)

    dstgenerator.export_dst(satin_path,'experiment_output\\satinwalk7')

    #viewer.render_path(path, pathviewer.DisplayMode.LINE)
    viewer.render_path(satin_path, pathviewer.DisplayMode.LINE)
    viewer.update()

