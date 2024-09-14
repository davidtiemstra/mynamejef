// what it do?
// 1. header: 512 bytes of ascii (thank god) metadata. 
// 2. body (stitches): triplets
// 2.x end triplet: 00 00 F3

// body decoding is actually insane lmao
// bit:      7       6       5       4       3       2       1       0
// Byte 1	  y+1	    y-1	    y+9	    y-9	    x-9	    x+9	    x-1	    x+1
// Byte 2	  y+3	    y-3	    y+27	  y-27  	x-27	  x+27	  x-3	    x+3
// Byte 3	  jump	  col     y+81	  y-81	  x-81	  x+81  	set	    set
  
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
        for(let index=1; index < coordinates.length; index++){
            stitches.push([ round(coordinates[index].x - coordinates[index-1].x) , round(coordinates[index].y - coordinates[index-1].y) ])
        }

        let stitchdata = new Uint8Array(0)

        let jumpcount = 0;
            
        // writing the stitches
        for(let i=0; i< stitches.length; i++){
            const stitch = stitches[i];
            
            // check for jump stitch
            if(max(abs(stitch[0]), abs(stitch[1])) < 122){
                stitchdata = dst.concatBytes(stitchdata, dst.encodeStitch(stitch, false));
            }
            
            else{
            let jumps = ceil(max(abs(stitch[0]), abs(stitch[1]))/121)
            jumpcount += jumps
            for(let j=0; j<jumps.length; j++){
                stitchdata = dst.concatBytes( stitchdata, dst.encodeStitch( [math.floor(stitch[0]/(jumps)), math.floor(stitch[1]/(jumps))], true));
            }
            stitchdata = dst.concatBytes(stitchdata, dst.encodeStitch([stitch[0]%jumps, stitch[1]%jumps], false));
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
    }
}