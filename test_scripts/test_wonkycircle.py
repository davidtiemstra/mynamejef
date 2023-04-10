# run from main.py
path = wonkycircle.wonkycircle(300, 0.3, 0, 100, wonkiness=11, relative=False)

for i in range(3):
    seed = 1000 * random.random()
    print(seed)
    path = wonkycircle.wonkycircle(500 - i*150, 0.2, 0, 100, wonkiness=11, seed=seed, relative=False)
    satin_path = satinstitch.satinstitch(path, width=40, density=1)
    dstgenerator.export_dst(satin_path,'experiment_output\\boing-c' + str(i))
fill_path = horizontalfill.horizontal_fill(path, 2, 10)