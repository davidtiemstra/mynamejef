let inputMode = 'img' // 'img' or 'draw'. if using img upload image as img.bmp
let cs = 16; // size of each cross in .1mm
let crossMode = '1:2'; //'3:2' or '1:2'. does more or less stitches per cross. you dont see the difference on the p5 canvas
let filename = '3'
let viewScale = 0.44; // ratio between 0.1mm and 1px. on my display settings 0.44 is basically true scale


let bmph;
let bmpw;

let img =[];
let filenames = [
  'hoekje',
  'tekst',
]
let drawbmp = [];
let bmp = [];

//these are like some cringy lookup tables bc i was too lazy to do modulo logic
let corners = [[0,0], [1,0], [1,1], [0,1]];
let next= [[-1,-1], [1,-1], [1,1], [-1,1], [0,-1], [1,0], [0,1], [-1,0]];
let checkorder = [0,4,1,5,2,6,3,7]
let stitchloop = [0,2,0,'c',1,3,'c'];
// ok actually theyre kinda elegant hehe

let coords = [];

function preload(){
  for(let n=0;n<filenames.length;n++){
    img.push( loadImage('input/'+ filenames[n] + '.png'));
  }
}

function setup() {
  noFill();
  
  
  for(let n=0;n<img.length;n++){
    drawbmp = [];
    if(inputMode == 'draw'){
      createCanvas(400, 400);
      bmpw = width/cs;
      bmph = height/cs;
      
      for(let y=0; y<bmph; y++){
        drawbmp.push([]);
        for(let x=0; x<bmpw; x++){
          drawbmp[y].push(0)
        }
      }
    }
    
    if(inputMode == 'img'){
      img[n].filter(INVERT);
      img[n].filter(THRESHOLD, 0.5);
      img[n].loadPixels();
      
      createCanvas(img[n].width*cs*viewScale, img[n].height*cs*viewScale);
      bmpw = img[n].width;
      bmph = img[n].height;
      
      for(let y=0; y<img[n].height; y++){
        drawbmp.push([]);
        for(let x=0; x<img[n].width; x++){
          drawbmp[y].push( img[n].pixels[y*img[n].width*4 + x*4] )
        }
      }
      
    }
    
    initiateCross();
    background(220);

    let exportcoords = []
    for(let i=0; i<coords.length; i++){
      exportcoords.push(createVector(coords[i].x*cs, coords[i].y*cs))
    }


    dst.export(exportcoords, filenames[n]);

    beginShape();
    for(let i=0;i<coords.length; i++){
      vertex(coords[i].x*cs*viewScale, coords[i].y*cs*viewScale)
    }
    endShape();

    saveCanvas(filenames[n]);
  }

  noLoop();

}

function draw() {
  // we not rocking that
}
  

function initiateCross(){
  
  coords = []
  bmp = structuredClone(drawbmp);
  
  for(let y=0; y<bmp.length; y++){
    for(let x=0; x<bmp[y].length; x++){
      if(bmp[y][x]){
        crossStitch(x,y,0);
      }
    }
  }
}

function crossStitch(x, y, s0){
  bmp[y][x]=0;
  
  let sn=2;
  let found=false;
  for(let j=0; j<8; j++){
    let i=checkorder[j];
    if(y+next[i][1] < 0 || x+next[i][0] < 0 || y+next[i][1] >= bmph || x+next[i][0] >= bmpw){continue;}
    if(bmp[y+next[i][1]][x+next[i][0]]){
      sn=i;
      found=true;
      break;
    }
  }
  
  for(let j=0;j<stitchloop.length;j++){
    if(stitchloop[j]=='c'){coords.push({x: x + 0.5, y: y + 0.5});continue;}
    let n=(s0+stitchloop[j])%4;
    coords.push({x: x + corners[n][0], y: y + corners[n][1]});
  }
  coords.push({x: x + corners[sn%4][0], y: y + corners[sn%4][1]});

  if(found){crossStitch(x+next[sn][0], y+next[sn][1], (sn + 2 + 3*floor(0.26*sn))%4 );}
  
}

function mouseDragged(){
  if(!keyIsPressed){
    drawbmp[floor(mouseY/cs/viewScale)][floor(mouseX/cs/viewScale)] = 1;
  } else {
    drawbmp[floor(mouseY/cs/viewScale)][floor(mouseX/cs/viewScale)] = 0;
  }
}
function mousePressed(){
  if(!keyIsPressed){
    drawbmp[floor(mouseY/cs/viewScale)][floor(mouseX/cs/viewScale)] = 1;
  } else {
    drawbmp[floor(mouseY/cs/viewScale)][floor(mouseX/cs/viewScale)] = 0;
  }
}