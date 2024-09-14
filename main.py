from helpers import pathviewer
from helpers import dstgenerator
from helpers import horizontalfill
from helpers import satinstitch
from helpers import drawletter
from generators import randomwalker
from generators import wonkycircle
import random
from generators import dnadrawer
from generators import topographer
from helpers import csvtopath


if __name__ == "__main__":

    viewer = pathviewer.PathViewer()

    # topography experiment (goes crazy)


    path = csvtopath.getPath('data/p5output/flower_patch_border.csv')

    o = 'experiment_output/flower_patch_border_path'
    dstgenerator.export_dst(path, o)






    #viewer.render_path(path, pathviewer.DisplayMode.LINE, True)
    #viewer.update()

