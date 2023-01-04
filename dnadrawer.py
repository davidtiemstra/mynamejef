# from \05 dna writer\amtdb_metadata.csv find the identifier based on one of the metadata things
# get .fa file from ("https://amtdb.org/static_md5/data/fasta/" + identifier + ".fa")
# literally just read it as text and embroider the letters (actg) in a longass string. 

import jefgenerator
import urllib3
import csv
import drawletter
from haversine import haversine

targetcoords = [float(input("lat")), float(input("lon"))]
identifier = ""

# get identifier
with open('amtdb_metadata.csv', encoding = 'cp850') as csvfile:
        metadata = csv.reader(csvfile, delimiter=',', quotechar='"')

        mindist = 100

        for index,row in enumerate(metadata):
            if(index!=0):
                dist = haversine((min(float(row[9]),180), min(float(row[10]),180)), (targetcoords[0], targetcoords[1]))
                if dist < mindist and row[28] != '<NA>':
                    mindist = dist
                    identifier = row[0]

print(identifier)

# get file 
http = urllib3.PoolManager()
dnafile = http.request('GET', 'https://amtdb.org/static_md5/data/fasta/' + identifier + '.fa').data.decode("utf-8")
dna = dnafile[dnafile.find('\n') + 1:len(dnafile)]


# draw letters
steps = drawletter.drawString(string=dna, height=30, width=30, spacing=10, stitchdist=8)

jefgenerator.export_jef(steps, True, 'dnasequence_' + identifier + '.jef')
