let strings;
let scalework = 1;
let viewscale = 0.7;
let holeradius = 100;
const holelerp = 1.5;
const unravelspeed = 0; //set to infinity to unravel on setup, 0 to never unravel
const exportdst = false;
const margin = 20;
const mindist  = 5;
const stitchdist = 20;
let boundingbox = {
  l:Infinity,
  t:Infinity,
  r:0,
  b:0
};

let toilet;
let coords = [], oldcoords = [], unraveledcoords = [], holecoords = [];
let segments =[];
let lerpoldcoords;
let justclicked = false;

function preload() {
  toilet = ceil(random()*27);
  // toilet = 22;
  print(toilet)
  strings = loadStrings('../bagni/bagni ('+ toilet +').svg');
}

function setup() {
  createCanvas(710,710);

  holeradius = 100 + random()*100;

  segments = dst.parseSVG(strings, returnsegments=true,trimoob=false,beziersteps=5, scaletofit=createVector(width/viewscale,height/viewscale));

  oldsegments = segments.slice();
  coords = [segments[0][0]];
  lerpoldcoords = [coords[0]];
  flattensegments(true);

  let scaledcoords = [createVector(coords[0].x, coords[0].y)];
  for(let i=1;i<coords.length;i++){
    const coord = createVector(coords[i].x, coords[i].y)
    if(coord.dist(scaledcoords[scaledcoords.length-1]) > mindist){
      scaledcoords.push(coord);
    }
  }

  boundingbox.l = min(scaledcoords.map(c=>c.x)) - margin;
  boundingbox.t = min(scaledcoords.map(c=>c.y)) - margin;
  boundingbox.r = max(scaledcoords.map(c=>c.x)) + margin;
  boundingbox.b = max(scaledcoords.map(c=>c.y)) + margin;
  

  coords = scaledcoords;

  oldcoords = coords.slice();
  unraveledcoords = [coords[0]];
  
  if(exportdst){
    let exportnormal = [lerpoldcoords[0]];
    for(let coord of lerpoldcoords){
      if(exportnormal[exportnormal.length-1].dist(coord)>mindist){
        exportnormal.push(coord);
      }
    }
    dst.export(exportnormal,"bagni-ravelled"+toilet)
  }

  unravel();

  coords = unraveledcoords;
  
  if(exportdst){
    let lerpcoords = [unraveledcoords[0]];
    for(let i=1;i<unraveledcoords.length;i++){
      const v0 = lerpcoords[lerpcoords.length-1];
      const v1 = unraveledcoords[i];
      for(let j=1;j<v0.dist(v1)/stitchdist;j++){
        lerpcoords.push(p5.Vector.lerp(v0,v1,j/(v0.dist(v1)/stitchdist)));
      }
      lerpcoords.push(v1);
    }

    dst.export(lerpcoords,"bagni-unravelled-lerp"+toilet)
  }

}

function draw(){
  background(255);
  noFill();

  // rect(5,5,1000*viewscale,1000*viewscale);
  // rect(
  //   (boundingbox.l)*viewscale,
  //   (boundingbox.t)*viewscale,
  //   (boundingbox.r-boundingbox.l)*viewscale,
  //   (boundingbox.b-boundingbox.t)*viewscale
  // );

  unravel();
  holeblastr3000();
  
  beginShape();

  for(let i=0; i<holecoords.length; i++ ){
    vertex(holecoords[i].x * viewscale, 
           holecoords[i].y * viewscale)
  }

  endShape();

  fill(0)
  text(toilet, width-30,height-30)
}

function flattensegments(sort){

  if(!sort){
    coords = [];
    for(let segment of segments){
        coords = coords.concat(segment)
    }
    return;
  }

  //sort segments
  while(oldsegments.length>0){
    let closest = Infinity;
    let closestIndex = null;
    let counterdirection = false;
    for(let j=0;j<oldsegments.length;j++){
      const p1 = coords[coords.length-1];
      const distancetostart = p1.dist(oldsegments[j][0]);
      const distancetoend = p1.dist(oldsegments[j][oldsegments[j].length-1]);      
      if(distancetostart < closest){
        closestIndex = j;
        closest = distancetostart;
        counterdirection = false;
      }
      if(distancetoend < closest){
        closestIndex = j;
        closest = distancetoend;
        counterdirection = true;
      }
    }

    const segment = oldsegments[closestIndex]    
    if(counterdirection){
      for(let i =segment.length-1;i>=0;i--){
        if(i!=segment.length-1){lerpPoints(coords[coords.length-1],segment[i])};
        coords.push(segment[i])
      }
      coords.push(segment[0])
    }
    else{
      for(let i =0;i<segment.length;i++){
        if(i!=0){lerpPoints(coords[coords.length-1],segment[i]);}
        coords.push(segment[i])
      }
    }
    oldsegments.splice(closestIndex,1);

    function lerpPoints(p0,p1){
      const jumpdist = p0.dist(p1)
      for(let p=0;p<jumpdist;p+=stitchdist){
        lerpoldcoords.push(p5.Vector.lerp(p0,p1,p/jumpdist))
      }
      lerpoldcoords.push(p1);
    }
  }
}

function holeblastr3000(){
  //takes unraveledcoords(?) and blasts a hole in it and stores this as holecoords.
  if(justclicked){
    lerpoldcoords = holecoords.slice();
    justclicked = false;
    holeradius = 100+random()*100;
  }
  holecoords = [];
  const mouse = createVector(mouseX/viewscale,mouseY/viewscale);
  for(let i=0; i<lerpoldcoords.length;i++){
    let tomouse = p5.Vector.sub( lerpoldcoords[i],mouse);
    const mousedist = tomouse.mag();
    if(mousedist < holeradius){
      tomouse.setMag(mousedist + (holeradius-mousedist)*holelerp);
      holecoords.push(tomouse.add(mouse));
      continue;
    }
    holecoords.push(lerpoldcoords[i])
  }
}

function mouseClicked(){
  justclicked = true;
}

function unravel(){
  for(let i=0;i<unravelspeed && oldcoords.length>1;i++){
    let closest = Infinity;
    let closestIndex = null;
    for(let j=0;j<oldcoords.length;j++){
      const distancetopoint = unraveledcoords[unraveledcoords.length-1].dist(oldcoords[j]);
      if(distancetopoint < closest){
        closestIndex = j;
        closest = distancetopoint;
      }
    }
    unraveledcoords.push(oldcoords[closestIndex]);
    oldcoords.splice(closestIndex,1);
  }
}