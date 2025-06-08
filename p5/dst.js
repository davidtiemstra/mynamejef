// what it do?
// 1. header: 512 bytes of ascii (thank god) metadata. 
// 2. body (stitches): triplets
// 2.x end triplet: 00 00 F3

// body decoding is actually insane lmao
// bit:       7       6       5       4       3       2       1       0
// Byte 1     y+1     y-1     y+9     y-9     x-9     x+9     x-1     x+1
// Byte 2     y+3     y-3     y+27    y-27    x-27    x+27    x-3     x+3
// Byte 3     jump    col     y+81    y-81    x-81    x+81    set     set
  
class dst{
  
    // position matrix for converting the terts to bytes{
    static posmat = [[3,7,2,6,10], [0,4,1,5,9]]

    // stitch encoding
    // currently does not account for color changes
    static encodeStitch(stitch, jump){

        let bits;

        if(jump){
            bits = "xxxxxxxxxxxxxxxx10xxxx11"
        }
        else{
            bits = "xxxxxxxxxxxxxxxx00xxxx11"
        }

        for(let axis=0; axis < 2; axis++){
            let distance = stitch[axis]

            // do the conversion to terts
            distance += 121 // from -121>121 to 0>242

            for(let index=0; index<5; index++){
                // 0, 1 or 2?
                let tert = distance%3
                let binaryCodedTert;

                // tert > binary encoded tert (mirrored for y)
                if((tert == 0 && axis == 0)  || (tert == 2 && axis == 1)){ 
                binaryCodedTert = "10"
                }
                else if( tert == 0  || tert == 2){ 
                binaryCodedTert = "01"
                }
                else{ 
                binaryCodedTert = "00"
                }

                // put it in the right spot in the triplet
                const pos = dst.posmat[axis][index]*2;
                bits = bits.slice(0,pos) + binaryCodedTert + bits.slice(pos + 2);

                // divide distance for the next tert
                distance = floor(distance/3);
            }
        }

        // convert bits to bytes
        let bytes = new Uint8Array(3);
        bytes.set([
            parseInt(bits.slice(0,8),2),
            parseInt(bits.slice(8,16),2),
            parseInt(bits.slice(16),2)
        ]);
                
        return bytes;
    }

    static concatBytes(bytes1, bytes2){
        let newstitchdata = new Uint8Array(bytes1.length + bytes2.length);
        newstitchdata.set(bytes1);
        newstitchdata.set(bytes2, bytes1.length);
        return newstitchdata;
    }

    static findLimits(coordinates){
        // find max distances 
        let limits = [0,0,0,0]

        // use this with absolute coordinates
        for(let i=0; i<coordinates.length; i++){
            if(coordinates[i].x>limits[0]){
                limits[0] = round(coordinates[i].x)
            }
            if(coordinates[i].x<limits[1]){
                limits[1] = round(abs(coordinates[i].x))
            }
            if(coordinates[i].y>limits[2]){
                limits[2] = round(coordinates[i].y)
            }
            if(coordinates[i].y<limits[3]){
                limits[3] = round(abs(coordinates[i].y))
            }
        }

        return limits;
    }
        
    static padString(inputstring, maxlength){
        let output = ""

        if(inputstring.length > maxlength){
            output = inputstring.slice(0,maxlength-1);
        }
        else{
            for (let i=0; i<maxlength - inputstring.length; i++){
                output += " ";
            }
            output += inputstring;
        }

        return output;
    }

    static export(coordinates, filename){
        // conversion from absolute to relative coordinates
        let stitches = [];

        for(let i=0; i < coordinates.length; i++){
            if(coordinates[i] == "STOP") continue
            coordinates[i] = createVector(round(coordinates[i].x), round(coordinates[i].y))
        }
        
        for(let index=1; index < coordinates.length; index++){
            if(coordinates[index] == "STOP") {
                stitches.push("STOP");
                coordinates.splice(index,1);
            }
            stitches.push([ 
                     coordinates[index].x - coordinates[index-1].x , 
                -1* (coordinates[index].y - coordinates[index-1].y )
            ]);
        }

        let stitchdata = new Uint8Array(0)

        let jumpcount = 0;
            
        // writing the stitches
        for(let i=0; i< stitches.length; i++){
            let stitch = stitches[i];

            // dit is niet oke we moeten dit niet doen.
            if(stitch == "STOP"){
                print(stitch)
                let bits = "000000000000000011000011";
                let bytes = new Uint8Array(3);
                bytes.set([
                    parseInt(bits.slice(0,8),2),
                    parseInt(bits.slice(8,16),2),
                    parseInt(bits.slice(16),2)
                ]);
                stitchdata = dst.concatBytes(stitchdata, bytes);
            }
            
            // check for jump stitch
            if(max( abs(stitch[0]), abs(stitch[1]) ) < 122){
                stitchdata = dst.concatBytes(stitchdata, dst.encodeStitch(stitch, false));
            }
            else{
                let jumps = ceil( max(abs(stitch[0]), abs(stitch[1])) / 121)
                jumpcount += jumps
                for(let j=0; j<jumps; j++){
                    stitchdata = dst.concatBytes( stitchdata, dst.encodeStitch( [ floor(stitch[0]/jumps), floor(stitch[1]/jumps) ], true));
                }
                stitchdata = dst.concatBytes(stitchdata, dst.encodeStitch( [ stitch[0]%jumps, stitch[1]%jumps ], false));
            }
        }

        // mandatory end triplet
        let endBytes = new Uint8Array(3);
        endBytes.set([0,0,243]);
        stitchdata = dst.concatBytes(stitchdata, endBytes)

        // determining variables for the header
        let label = filename.slice(0,16);
        for(let i=0; i<16 - filename.length; i++){
            label += " ";
        }

        let limits = dst.findLimits(coordinates);

        // writing the header
        let header = ("LA:" + label + "\r" + 
                    "ST:"  + dst.padString(str(stitches.length+jumpcount), 7) + "\r" +
                    "CO:"  + "  1" + "\r"+
                    "+X:"  + dst.padString(str(limits[0]), 5) + "\r"+
                    "-X:"  + dst.padString(str(limits[1]), 5) + "\r"+
                    "+Y:"  + dst.padString(str(limits[2]), 5) + "\r"+
                    "-Y:"  + dst.padString(str(limits[3]), 5) + "\r" +
                    "AX:+    0\rAY:+    0\rMX:+    0\rMY:+    0\r" + 
                    "PD:******\r" );

        header = Uint8Array.from(header, (v)=> v.charCodeAt(0) );

        // header bits that are less stringfriendly
        let endHeaderBytes = new Uint8Array(388);
        endHeaderBytes.fill(32);
        endHeaderBytes.set([26, 32, 32]);
        header = dst.concatBytes(header, endHeaderBytes)

        const file = dst.concatBytes(header, stitchdata);

        // save with a blob object
        let blob = new Blob([file], { type: 'application/octet-stream' });
        let link = createA('', filename + '.dst');
        let url = URL.createObjectURL(blob);
        link.attribute('href', url);
        link.attribute('download', filename + '.dst');
        link.elt.click();
        URL.revokeObjectURL(url);
        link.remove()
    }

    static parseSVG(strings, returnsegments=false, trimoob = false, beziersteps=10, scaletofit=null){
        //to do:
        // - some weird shit going on rn where it adds out of bounds coords?

        let segments = [];

        const lines =    true;
        const polygons = true;
        const rects =    true;
        const circles =  true;
        const paths =    true;
      

        let string = strings.join();
        const svgwidth =  float(string.match(/width=".*?"/)[0].match( /[0-9]|\./g).join(""));
        const svgheight = float(string.match(/height=".*?"/)[0].match(/[0-9]|\./g).join(""));
      
        for(let i=0; i<string.length-1; i++ ){

            function appendArray(floatarray){
                let segment = [];
                for(let i=0; i<floatarray.length; i+=2){
                    segment.push(createVector(floatarray[i],floatarray[i+1]));
                }
                segments.push(segment);
            }

            let object;
            let objindex;

            try{
                object = string.slice(i).match(/<.*?>/)
                objindex = object.index;
                object = object[0];
            }
            catch{
                break;
            }
            i += objindex + object.length-1;

            if(object.match(/<line.*?>/) && lines){
                appendArray( object.match(/"([0-9]|\.)*?"/g).map(s => float(s.slice(1,s.length-1))));
            }
            if(object.match(/<poly.*?>/) && polygons){
                const pointstring = object.match(/points=".*?"/)[0];
                const array = pointstring.match(/(-|[0-9]|\.){1,}/g).map(s => float(s));
                if(object.match(/<polygon/)){
                    array.push(array[0],array[1])
                }
                appendArray(array);
            }
            if(object.match(/<rect.*?>/) && rects){
                let recttranslate = createVector(0,0);
                let rectrotate = 0;
                try{
                    recttranslate = createVector(...(object.match(/translate\(.*?\)/)[0].match(/(-|[0-9]|\.){1,}/).map(s => float(s))));
                    rectrotate = float(object.match(/rotate\(.*?\)/)[0].match(/(-|[0-9]|\.){1,}/)[0]);
                }catch{}
                let rectcoord = createVector(0,0);
                try{rectcoord = createVector(float(object.match(/x=".*?"/).map(s=>s.slice(3,s.length-1))[0]), float(object.match(/y=".*?"/).map(s=>s.slice(3,s.length-1))[0])).rotate(rectrotate).add(recttranslate);}
                catch{}
                const rectsize = createVector(float(object.match(/width=".*?"/).map(s=>s.slice(8,s.length-1))[0]), float(object.match(/height=".*?"/).map(s=>s.slice(9,s.length-1))[0])).rotate(rectrotate).add(recttranslate);
                segments.push([rectcoord, 
                    createVector(rectcoord.x+rectsize.x, rectcoord.y),
                    createVector(rectcoord.x+rectsize.x, rectcoord.y+rectsize.y),
                    createVector(rectcoord.x+rectsize.x, rectcoord.y+rectsize.y)
                ]);

            }
            if(object.match(/<circle.*?>/) && circles){
                const nums = object.match(/(([x|y])|r)=".*?"/g).map(s=>float(s.slice(3,s.length-1)));
                const c = createVector(nums[0], nums[1])
                const r = nums[2];
                let segment = [];
                for(let j=0;j<beziersteps*2;j++){
                    const alph = (j/(beziersteps*2))*2*PI;
                    segment.push(createVector(c.x+r*cos(alph), c.y+r*sin(alph)));
                }
                segments.push(segment);

            }
            if(object.match(/<path.*?>/) && paths){
                object = object.match(/d=".*?"/)[0].slice(3)
                doPath(object);
            }
      
            function doPath(pathstring){
                let cursor = createVector(0,0);
                let pathstart = null;

                let segment = [];

                for(let i=0; i<pathstring.length; i++){
                    
                    const chunk = pathstring.slice(i).match(/[m|M|l|L|h|H|v|V|c|C|q|Q|s|S|z|Z][^[m|M|l|L|h|H|v|V|c|C|q|Q|s|S|z|Z]*/)[0];
                    
                    i+=chunk.length-1;
                    
                    if(chunk.match(/[z|Z]/)){ //close path
                        segment.push(pathstart);
                        break;
                    }

                    const nums = chunk.match(/(-*[0-9]{1,}\.*[0-9]*)|(-*\.*[0-9]{1,})/g).map(s=>float(s))
                    const relative = chunk[0].toLowerCase() == chunk[0];
                    if(chunk.match(/[m|M]/)){
                        if(nums.length!=2){print("move", chunk, nums)}
                        cursor = createVector(relative*cursor.x+nums[0], relative*cursor.y+nums[1]);
                        
                        if(segment.length>0){
                            segments.push(segment)
                            segment = [];
                            segment.push(cursor)
                        }
                        if(!pathstart){pathstart=cursor}
                    }
                    if(chunk.match(/[l|L]/)){
                        if(nums.length%2!=0){print("line", chunk, nums)}
                        for(let j=0; j<nums.length-2;j+=2){
                            segment.push(createVector(cursor.x,cursor.y),
                                createVector(relative*cursor.x+nums[j], relative*cursor.y+nums[j+1]));
                        }
                        cursor = createVector(relative*cursor.x+nums[nums.length-2], relative*cursor.y+nums[nums.length-1]);
                        if(!pathstart){pathstart=cursor}
                    }
                    if(chunk.match(/[h|H]/)){
                        if(nums.length!=1){print("hor", chunk, nums)}
                        cursor = createVector(relative*cursor.x+nums[0],cursor.y);
                    }
                    if(chunk.match(/[v|V]/)){
                        if(nums.length!=1){print("vert", chunk, nums)}
                        cursor = createVector(cursor.x,relative*cursor.y+nums[0]);
                    }
                    if(chunk.match(/[c|C]/)){
                        let weird = false;
                        if(nums.length%6!=0){print("curve", nums.length,chunk, nums, pathstring)}
                        for(let j=0; j<nums.length; j+=6){
                            for(let s=0;s<beziersteps;s++){
                                segment.push(dst.pointOnBezier(s/beziersteps, 
                                    relative*cursor.x,           relative*cursor.y,
                                    relative*cursor.x+nums[j+0], relative*cursor.y+nums[j+1],
                                    relative*cursor.x+nums[j+2], relative*cursor.y+nums[j+3],
                                    relative*cursor.x+nums[j+4], relative*cursor.y+nums[j+5],
                                ));
                                
                                // fill("red")
                                // circle(segment[segment.length-1].x*1.1,segment[segment.length-1].y*1.1,5)
                            }
                            cursor = createVector(relative*cursor.x+nums[j+4],relative*cursor.y+nums[j+5]);
                        }
                    }
                    if(chunk.match(/[q|Q|s|S]/)){
                        // not really implemented
                        if(nums.length%4!=0){print("quad", chunk, nums)}
                        for(let j=0; j<nums.length-2;j+=2){
                            segment.push(createVector(relative*cursor.x+nums[j],relative*cursor.y+nums[j+1]));
                        }
                        cursor = createVector(relative*cursor.x+nums[nums.length-2],relative*cursor.y+nums[nums.length-1]);
                    }

                    segment.push(cursor);

            
                    
                }

                cursor = createVector(0,0);
                pathstart = null;
                segments.push(segment);
                
            }
        }


        if(trimoob){
            segments= segments.map(coords => coords.filter(c=>c.x>0&&c.x<svgwidth&&c.y>0&&c.y<svgheight));
        }
        if(scaletofit){
            const ratio = min(scaletofit.x/svgwidth, scaletofit.y/svgheight);
            segments = segments.map(coords => coords.map(c=>p5.Vector.mult(c,ratio)));
        }

        segments = segments.filter(s=>s.length>0);

        if(returnsegments){return segments}
        else{
            let coords = [];
            for(let segment of segments){
                coords = coords.concat(segment)
            }
            return coords
        }
    }

  static pointOnBezier(t, x0, y0, x1, y1, x2, y2, x3, y3){
    return createVector(
      (1-t)**3 * x0 + 3*(1-t)**2 * t * x1 + 3*(1-t)*t**2 * x2 + t**3 * x3,
      (1-t)**3 * y0 + 3*(1-t)**2 * t * y1 + 3*(1-t)*t**2 * y2 + t**3 * y3
    );
  }
}