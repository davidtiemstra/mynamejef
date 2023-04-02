from helpers import pathviewer
from helpers import dstgenerator
from helpers import horizontalfill
from helpers import satinstitch
from helpers import drawletter
from generators import randomwalker
from generators import wonkycircle
import random
from generators import dnadrawer



if __name__ == "__main__":

    viewer = pathviewer.PathViewer(primary_color='yellow')
    #viewer.primary_color = 'blue'

    # running circle experiment
    # expath = wonkycircle.wonkycircle(300, 0.3, 0, 100, wonkiness=11, seed=seed, relative=True)

    for i in range(3):
        seed = 1000 * random.random()
        print(seed)
        path = wonkycircle.wonkycircle(500 - i*150, 0.2, 0, 100, wonkiness=11, seed=seed, relative=False)
        satin_path = satinstitch.satinstitch(path, width=40, density=1)
        dstgenerator.export_dst(satin_path,'experiment_output\\boing-c' + str(i))
    # fill_path = horizontalfill.horizontal_fill(path, 2)

    # path = []
    # strings = ['pathviewer',
    #     'dstgenerator',
    #     'horizontalfill',
    #     'satinstitch']
    # for text in strings:
    #     path += drawletter.drawString(text, width=30, height=60, spacing=8, stitchdist=16, beans=1)
    #     path.append([len(text) * -38 + 5, -100])

    #viewer.render_path(path, pathviewer.DisplayMode.LINE)
    # viewer.render_path(path, pathviewer.DisplayMode.LINE)
    # viewer.update()

