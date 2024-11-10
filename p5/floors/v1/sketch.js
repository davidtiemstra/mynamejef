let strings;
let scalework = 1;
let viewscale = 0.7;
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

function preload() {
  toilet = ceil(random()*28);
  // const toilet = 27;
  print(toilet)
  strings = loadStrings('../bagni/bagni ('+ toilet +').svg');
}

function setup() {
  createCanvas(710,710);

  coords = dst.parseSVG(strings, returnsegments=false,trimoob=true,beziersteps=5, scaletofit=createVector(width/viewscale,height/viewscale));

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
  newcoords = [coords[0]];
  
  if(exportdst){
    dst.export(coords,"bagni-ravelled"+toilet)
  }

  unravel();

  coords = newcoords;
  if(exportdst){
    let lerpcoords = [newcoords[0]];
    for(let i=1;i<newcoords.length;i++){
      const v0 = lerpcoords[lerpcoords.length-1];
      const v1 = newcoords[i];
      for(let j=1;j<v0.dist(v1)/stitchdist;j++){
        lerpcoords.push(p5.Vector.lerp(v0,v1,j/(v0.dist(v1)/stitchdist)));
      }
      lerpcoords.push(v1);
    }

    dst.export(lerpcoords,"bagni-unravelled-lerp"+toilet)
    dst.export(newcoords,"bagni-unravelled"+toilet)
  }

}

function draw(){
  background(255);
  noFill();

  rect(5,5,1000*viewscale,1000*viewscale);
  rect(
    (boundingbox.l)*viewscale,
    (boundingbox.t)*viewscale,
    (boundingbox.r-boundingbox.l)*viewscale,
    (boundingbox.b-boundingbox.t)*viewscale
  );

  unravel();
  
  beginShape();

  for(let i=0; i<newcoords.length; i++ ){
    vertex(newcoords[i].x * viewscale, 
           newcoords[i].y * viewscale)
  }
  for(let i=0; i<oldcoords.length; i++ ){
    vertex(oldcoords[i].x * viewscale, 
           oldcoords[i].y * viewscale)
  }

  endShape();
}

function unravel(){
  for(let i=0;i<unravelspeed && oldcoords.length>1;i++){
    let closest = Infinity;
    let closestIndex = null;
    for(let j=0;j<oldcoords.length;j++){
      const distancetopoint = newcoords[newcoords.length-1].dist(oldcoords[j]);
      if(distancetopoint < closest){
        closestIndex = j;
        closest = distancetopoint;
      }
    }
    newcoords.push(oldcoords[closestIndex]);
    oldcoords.splice(closestIndex,1);
  }
}