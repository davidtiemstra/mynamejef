import  math

# write a different S function!!
# do something to make non-uniform scaling not mess up the stitch distance

def drawLetter(letter, width, height, stitchdist):
    # outputs coordinates for each step of the letter as float
    steps = []

    stitchdist /= height
    height *= 0.5

    if letter.capitalize() == 'A':
        # get coords for all lines of the letter
        segments = round(2.0615528128087828 / stitchdist)
        for step in range(segments+1):

            # define step size
            t = step / segments

            # calculate step coordinates
            steps.append([width * (t/2), height * (2*t)])
        
        segments = round(1.0 / stitchdist)
        for step in range(segments+1):
            t = step / segments
            steps.append([width * (1/4+t/2), height * (1)])
        
        segments = round(2.0615528128087828 / stitchdist)
        for step in range(segments+1):
            t = step / segments
            steps.append([width * (0.5+t/2), height * ( 2-2*t)])

    if letter.capitalize() == 'B':
        segments = round(2.0 / stitchdist)
        for step in range(segments+1):
            t = step / segments
            steps.append([width * (0), height * (2*t)])
            
        segments = round(2.542245872730906 / stitchdist)
        for step in range(segments+1):
            t = step / segments
            t = t**2 / (2.0 * (t**2 - t) + 1.0)
            steps.append([width * (math.sqrt(math.sin(math.pi*t))), height * ( (math.cos(math.pi*t)+1)/2+1)])

        for step in range(segments+1):
            t = step / segments
            t = t**2 / (2.0 * (t**2 - t) + 1.0)
            steps.append([width * (math.sqrt(math.sin(math.pi*t))), height * ( (math.cos(math.pi*t)-1)/2+1)])
            
    if letter.capitalize() == 'C':
        segments = round(3.3535747240192384 / stitchdist) 
        for step in range(segments+1):
            t = step / segments
            t = t**2 / (2.0 * (t**2 - t) + 1.0)
            steps.append([width * (1-math.sqrt(math.sin(math.pi*t))), height * (math.cos(math.pi*t)+1)])
    
    if letter.capitalize() == 'D':
        segments = round(2.0 / stitchdist)
        for step in range(segments+1):
            t = step / segments
            steps.append([width * (0), height * (2*t)])

        segments = round(3.3535747240192393 / stitchdist)
        for step in range(segments+1):
            t = step / segments
            t = t**2 / (2.0 * (t**2 - t) + 1.0)
            steps.append([width * (math.sqrt(math.sin(math.pi*t))), height * (math.cos(math.pi*t)+1)])
    
    if letter.capitalize() == 'E':
        segments = round(2.0 / stitchdist)
        for step in range(segments+1):
            t = step / segments
            steps.append([width * (0), height * ( 2*t)])
            
        segments = round(1.0 / stitchdist)
        for step in range(segments+1):
            t = step / segments
            steps.append([width * (t), height * ( 0)])
            
        for step in range(segments+1):
            t = step / segments
            steps.append([width * (t), height * ( 1)])
            
        for step in range(segments+1):
            t = step / segments
            steps.append([width * (t), height * ( 2)])
            
    if letter.capitalize() == 'F':
        segments = round(1.0 / stitchdist)
        for step in range(segments+1):
            t = step / segments
            steps.append([width * (t), height * ( 2)])
        
        segments = round(2.0 / stitchdist)
        for step in range(segments+1):
            t = step / segments
            steps.append([width * (0), height * ( 2-2*t)])
        
        segments = round(1.0 / stitchdist)
        for step in range(segments+1):
            t = step / segments
            steps.append([width * (t), height * ( 1)])
            
    if letter.capitalize() == 'G':
        segments = round(3.3535747240192384 / stitchdist)   
        for step in range(segments+1):
            t = step / segments
            t = t**2 / (2.0 * (t**2 - t) + 1.0)
            steps.append([width * (1-math.sqrt(math.sin(math.pi*t))), height * (math.cos(math.pi*t)+1)])
            
        segments = round(1.0 / stitchdist)
        for step in range(segments+1):
            t = step / segments
            steps.append([width * (1), height * (t)])
            
        segments = round(0.5 / stitchdist)
        for step in range(segments+1):
            t = step / segments
            steps.append([width * (1-t/2), height * (1)])
            
    if letter.capitalize() == 'H':
        segments = round(2.0 / stitchdist)
        for step in range(segments+1):
            t = step / segments
            steps.append([width * (0), height * (2*t)])
            
        segments = round(1.0 / stitchdist)
        for step in range(segments+1):
            t = step / segments
            steps.append([width * (t), height * (1)])
            
        segments = round(2.0 / stitchdist)
        for step in range(segments+1):
            t = step / segments
            steps.append([width * (1), height * (2-2*t)])
            
    if letter.capitalize() == 'I':
        segments = round(1.0 / stitchdist)
        for step in range(segments+1):
            t = step / segments
            steps.append([width * (t), height * (0)])
            
        segments = round(2.0 / stitchdist)
        for step in range(segments+1):
            t = step / segments
            steps.append([width * (1/2), height * (2*t)])
            
        segments = round(1.0 / stitchdist)
        for step in range(segments+1):
            t = step / segments
            steps.append([width * (t), height * (2)])
            
    if letter.capitalize() == 'J':
        segments = round(1.676787890691243 / stitchdist)
        for step in range(segments+1):
            t = step / segments
            t = t**2 / (2.0 * (t**2 - t) + 1.0)
            steps.append([width * (math.sqrt(math.sin(math.pi*t/2))), height * (-math.cos(math.pi*t/2)+1)])
        
        segments = round(0.5 / stitchdist)
        for step in range(segments+1):
            t = step / segments
            steps.append([width * (1-t/2), height * (2)])
            
        segments = round(1.0 / stitchdist)
        for step in range(segments+1):
            t = step / segments
            steps.append([width * (1), height * (2-t)])
            
    if letter.capitalize() == 'K':
        segments = round(2.0 / stitchdist)
        for step in range(segments+1):
            t = step / segments
            steps.append([width * (0), height * ( 2*t)])
            
        segments = round(2.828427124746247 / stitchdist)
        for step in range(segments+1):
            t = step / segments
            steps.append([width * (abs(2*t-1)), height * ( 2-2*t)])
            
    if letter.capitalize() == 'L':
        segments = round(2.0 / stitchdist)
        for step in range(segments+1):
            t = step / segments
            steps.append([width * (0), height * (2-2*t)])
            
        segments = round(1.0 / stitchdist)
        for step in range(segments+1):
            t = step / segments
            steps.append([width * (t), height * (0)])
            
    if letter.capitalize() == 'M':
        segments = round(2.0 / stitchdist)
        for step in range(segments+1):
            t = step / segments
            steps.append([width * (0), height * (2*t)])
        
        segments = round(2.236067977499792 / stitchdist)
        for step in range(segments+1):
            t = step / segments
            steps.append([width * (t), height * (abs(2*t-1)+1)])

        segments = round(2.0 / stitchdist)   
        for step in range(segments+1):
            t = step / segments
            steps.append([width * (1), height * (2-2*t)])
            
    if letter.capitalize() == 'N':
        segments = round(2.0 / stitchdist)
        for step in range(segments+1):
            t = step / segments
            steps.append([width * (0), height * (2*t)])
            
        segments = round(2.236067977499792 / stitchdist)
        for step in range(segments+1):
            t = step / segments
            steps.append([width * (t), height * (2-2*t)])
        
        segments = round(2.0 / stitchdist)
        for step in range(segments+1):
            t = step / segments
            steps.append([width * (1), height * (2*t)])
            
    if letter.capitalize() == 'O':
        segments = round(2.491414410747849 / stitchdist)
        for step in range(segments+1):
            t = step / segments
            t = t**2 / (2.0 * (t**2 - t) + 1.0)
            steps.append([width * (0.5*(-math.cos(math.pi*t)+1)), height * (math.sin(math.pi*t)**(2/3)+1)])
            
        for step in range(segments+1):
            t = step / segments
            t = t**2 / (2.0 * (t**2 - t) + 1.0)
            steps.append([width * (0.5*(-math.cos(math.pi*t)+1)), height * (-math.sin(math.pi*t)**(2/3)+1)])
            
    if letter.capitalize() == 'P':
        segments = round(2.0 / stitchdist)
        for step in range(segments+1):
            t = step / segments
            steps.append([width * (0), height * (2*t)])
        
        segments = round(2.542245872730906 / stitchdist)
        for step in range(segments+1):
            t = step / segments
            t = t**2 / (2.0 * (t**2 - t) + 1.0)
            steps.append([width * (math.sqrt(math.sin(math.pi*t))), height * ((math.cos(math.pi*t)+1)/2+1)])
            
    if letter.capitalize() == 'Q':
        segments = round(2.491414410747849 / stitchdist)
        for step in range(segments+1):
            t = step / segments
            t = t**2 / (2.0 * (t**2 - t) + 1.0)
            steps.append([width * (0.5*(-math.cos(math.pi*t)+1)), height * (math.sin(math.pi*t)**(2/3)+1)])
            
        for step in range(segments+1):
            t = step / segments
            t = t**2 / (2.0 * (t**2 - t) + 1.0)
            steps.append([width * (0.5*(math.cos(math.pi*t)+1)), height * (-math.sin(math.pi*t)**(2/3)+1)])
        
        segments = round(0.5656854249492312 / stitchdist)   
        for step in range(segments+1):
            t = step / segments
            steps.append([width * (0.6 + 0.4*t), height * (0.4-0.4*t)])
            
    if letter.capitalize() == 'R':
        segments = round(2.0 / stitchdist)
        for step in range(segments+1):
            t = step / segments
            steps.append([width * (0), height * (2*t)])
        
        segments = round(2.542245872730906 / stitchdist)
        for step in range(segments+1):
            t = step / segments
            t = t**2 / (2.0 * (t**2 - t) + 1.0)
            steps.append([width * (math.sqrt(math.sin(math.pi*t))), height * ((math.cos(math.pi*t)+1)/2+1)])
        
        segments = round(1.4142135623731238 / stitchdist) 
        for step in range(segments+1):
            t = step / segments
            steps.append([width * (t), height * (1-t)])
            
    # i really need to write a different S function lol this is insane
    if letter.capitalize() == 'S':
        steps.append([0,0])
        segments = round(2.063598766736312 / stitchdist)
        prevx = 0
        prevy = 0
        for step in range(segments+1):
            t = step / segments
            t = t**2 / (2.0 * (t**2 - t) + 1.0)
            t2 = max(t,0.0796)
            
            x = width * (math.sqrt(math.sin(math.pi*(1-t2)+0.25)))
            y = height * (1+(1.016*(math.cos(math.pi*(1-t)+0.25)-1)/2+0.016))
            if(round(x) - round(prevx) != 0 or round(y) - round(prevy) != 0):
                steps.append([x,y])
            
            prevx = x
            prevy = y

        prevx = 0
        prevy = 0    
        for step in range(segments+1):
            t = step / segments
            t = t**2 / (2.0 * (t**2 - t) + 1.0)
            t2 = min(t,0.9204)

            x = width * (1-math.sqrt(math.sin(math.pi*t2+0.25)))
            y = height * (-1.016*math.cos(math.pi*t+0.25)/2+1.492)
            if(round(x) - round(prevx) != 0 or round(y) - round(prevy) != 0):
                steps.append([x,y])
            
            prevx = x
            prevy = y

    if letter.capitalize() == 'T':
        segments = round(1.0 / stitchdist)
        for step in range(segments+1):
            t = step / segments
            steps.append([width * (0+t), height * (2)])
        
        segments = round(2.0 / stitchdist)
        for step in range(segments+1):
            t = step / segments
            steps.append([width * (1/2), height * (2-2*t)])
            
    if letter.capitalize() == 'U':
        segments = round(4.402457839760256 / stitchdist)
        for step in range(segments+1):
            t = step / segments
            t = t**2 / (2.0 * (t**2 - t) + 1.0)
            steps.append([width * (-(math.cos(math.pi*t)-1)/2), height * (2-2*math.sqrt(math.sin(math.pi*t)))])
            
    if letter.capitalize() == 'V':
        segments = round(4.1231056256175656 / stitchdist)  
        for step in range(segments+1):
            t = step / segments
            steps.append([width * (t), height * ( 2*abs(2*t-1))])
            
    if letter.capitalize() == 'W':
        segments = round(2.0 / stitchdist)
        for step in range(segments+1):
            t = step / segments
            steps.append([width * (0), height * (2-2*t)])
        
        segments = round(2.2360679774997876 / stitchdist)   
        for step in range(segments+1):
            t = step / segments
            steps.append([width * (t), height * (1-abs(2*t-1))])
        
        segments = round(2.0 / stitchdist)
        for step in range(segments+1):
            t = step / segments
            steps.append([width * (1), height * (2*t)])
            
    if letter.capitalize() == 'X':
        segments = round(2.2360679774997876 / stitchdist)
        for step in range(segments+1):
            t = step / segments
            steps.append([width * (t), height * (2*t)])
            
        for step in range(segments+1):
            t = step / segments
            steps.append([width * (0+t), height * (2-2*t)])
            
    if letter.capitalize() == 'Y':
        segments = round(2.236067977499792 / stitchdist)
        for step in range(segments+1):
            t = step / segments
            steps.append([width * (t), height * ( abs(2*t-1)+1)])
        
        segments = round(1.0 / stitchdist)
        for step in range(segments+1):
            t = step / segments
            steps.append([width * (1/2), height * (1-t)])
            
    if letter.capitalize() == 'Z':
        segments = round(1.0 / stitchdist)
        for step in range(segments+1):
            t = step / segments
            steps.append([width * (t), height * ( 2)])
        
        segments = round(2.236067977499792 / stitchdist)
        for step in range(segments+1):
            t = step / segments
            steps.append([width * (1-t), height * (2-2*t)])
        
        segments = round(1.0 / stitchdist)
        for step in range(segments+1):
            t = step / segments
            steps.append([width * (t), height * ( 0)])
    
    return steps

def drawString(string, width=30, height=60, spacing=10, stitchdist=8):
    steps = []
    prev = [0,0]

    for character in string:
        coords = drawLetter(character, width, height, stitchdist)
        for point in coords:
            steps.append([round(point[0]) - round(prev[0]), round(point[1]) - round(prev[1])])
            prev = point
        prev = [prev[0] - width - spacing, prev[1]]
    
    return steps