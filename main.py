import random
import math
from helpers import pathviewer
from helpers import dstgenerator
from helpers import horizontalfill
from helpers import satinstitch
from helpers import drawletter
from helpers import csvtopath
from generators import randomwalker
from generators import wonkycircle
from generators import dnadrawer
from generators import topographer



if __name__ == "__main__":


    viewer = pathviewer.PathViewer(regen_prompt=False)

    # name = 'crossghost2'

    # path = csvtopath.getPath('data\\p5output\\' + name + '.csv')

    # dstgenerator.export_dst(path, 'experiment_output\\' + name)

    # viewer.render_path(path, pathviewer.DisplayMode.LINE, False)
    # viewer.update()

    for i in range(1,35):
        # seed = 1000 * random.random()
        # print('number: ' + str(i) + ', seed: ' + str(seed))
        # path = randomwalker.randomWalkAnt(seed=seed)
        path = csvtopath.getPath('data\\cs16\\' + str(i) + '.csv')
        dstgenerator.export_dst(path, 'experiment_output\\cs16\\' + str(i))

    
    # test with 15 deg intervals
    # for i in range(24):
    #     jefgenerator.export_jef(antdrawer(i * (math.pi / 12), 1.7), 'antscale17r' + str((i) * 15) + '.jef')

