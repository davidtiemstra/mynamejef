from helpers import pathviewer
from helpers import dstgenerator
from helpers import horizontalfill
from helpers import satinstitch
from generators import randomwalker
from generators import wonkycircle
import random
from generators import dnadrawer

if __name__ == "__main__":

    viewer = pathviewer.PathViewer(primary_color='yellow')
    #viewer.primary_color = 'blue'

    # running circle experiment
    seed = 1000 * random.random()
    print(seed)
    expath = wonkycircle.wonkycircle(500, 0.3, 0, 100, wonkiness=11, seed=seed, relative=True)
    path = wonkycircle.wonkycircle(500, 0.3, 0, 100, wonkiness=11, seed=seed, relative=False)
    satin_path = satinstitch.satinstitch(path, density=3)

    dstgenerator.export_dst(expath, 'experiment_output\\satincircle-in36')
    dstgenerator.export_dst(satin_path,'experiment_output\\satincircle36')

    #viewer.render_path(path, pathviewer.DisplayMode.LINE)
    # viewer.render_path(path, pathviewer.DisplayMode.LINE)
    # viewer.update()

