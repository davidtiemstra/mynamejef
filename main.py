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



if __name__ == "__main__":

    viewer = pathviewer.PathViewer(primary_color='yellow')

    # topography experiment (goes crazy)
    path = topographer.topographer()
    dstgenerator.export_dst(path, 'experiment_output/topo12')


    viewer.render_path(path, pathviewer.DisplayMode.LINE)
    viewer.update()

