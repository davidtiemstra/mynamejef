let strings;
let scalework = 1;
let viewscale = 0.7;
let holeradius = 100;
const holelerp = 0.75;
const holenoise = 2;
const exportdst = false;
const margin = 80;
const mindist  = 5;
const stitchdist = 20;
let boundingbox = {
  l:Infinity,
  t:Infinity,
  r:0,
  b:0
};

let toilet;
let coords = [], holecoords = [], outlinecoords = [], holeoutlinecoords = [];
let segments =[];
let lerpedcoords;
let justclicked = false;

function preload() {
  toilet = ceil(random()*27);
  // toilet = 22;
  print(toilet)
  strings = loadStrings('../bagni/bagni ('+ toilet +').svg');
}

function setup() {
  createCanvas(710,710);

  // viewscale = width/1400;

  holeradius = 100 + random()*100;

  segments = dst.parseSVG(strings, returnsegments=true,trimoob=true,beziersteps=5, scaletofit=createVector(width/viewscale-margin*4,height/viewscale-margin*4));

  oldsegments = segments.slice();
  coords = [segments[0][0]];
  lerpedcoords = [coords[0]];
  flattensegments(true);

  //hacking my own old logic here. this is an ugly thing.
  // from this point on im discarding the unlerped coords
  coords = lerpedcoords;

  let nodoublecoords = [createVector(coords[0].x, coords[0].y)];
  for(let i=1;i<coords.length;i++){
    const coord = createVector(coords[i].x + margin*2, coords[i].y + margin*2)
    if(coord.dist(nodoublecoords[nodoublecoords.length-1]) > mindist){
      nodoublecoords.push(coord);
    }
  }

  const toolong = 100;
  for(let i=nodoublecoords.length-1;i>=0;i--){
    const thiscoord = nodoublecoords[i];
    const prevcoord = nodoublecoords[i-1] ?? createVector(Infinity, Infinity);
    const nextcoord = nodoublecoords[i+1] ?? createVector(Infinity, Infinity);
    if(thiscoord.dist(prevcoord) > toolong && thiscoord.dist(nextcoord) > toolong){
      nodoublecoords.splice(i,1)
    }
  }

  boundingbox.l = min(nodoublecoords.map(c=>c.x)) - margin*0.25;
  boundingbox.t = min(nodoublecoords.map(c=>c.y)) - margin*0.25;
  boundingbox.r = max(nodoublecoords.map(c=>c.x)) + margin*0.25;
  boundingbox.b = max(nodoublecoords.map(c=>c.y)) + margin*0.25;
  
  coords = nodoublecoords;
  
  setoutline();

}

function draw(){
  background(255);
  noFill();

  holeblastr3000();
  
  beginShape();

  for(let coord of holecoords){
    vertex(coord.x * viewscale, 
           coord.y * viewscale)
  }
  for(let coord of satinstitchoutline(holeoutlinecoords)){
    vertex(coord.x * viewscale, 
           coord.y * viewscale)
  }

  endShape();

  fill(0)
  textAlign(RIGHT)
  text('press e for export. press b for new bathroom. bathroom number: '+toilet, width-20,20)
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
        lerpedcoords.push(p5.Vector.lerp(p0,p1,p/jumpdist))
      }
      lerpedcoords.push(p1);
    }
  }
}

function setoutline(){
  const corners = [ createVector(boundingbox.l,boundingbox.t),
              createVector(boundingbox.r,boundingbox.t),
              createVector(boundingbox.r,boundingbox.b),
              createVector(boundingbox.l,boundingbox.b),
              createVector(boundingbox.l,boundingbox.t)];
  for(let i=0;i<4;i++){
    outlinecoords.push(corners[i])
    const edge = p5.Vector.sub(corners[i+1],corners[i]);
    for(let j=0;j<edge.mag();j+=stitchdist){
      outlinecoords.push(p5.Vector.lerp(corners[i],corners[i+1],j/edge.mag()));
    }
  }
}

function satinstitchoutline(inputcoords){
  const satindist = 3;
  const satinwidth = 15;
  const satincoords = [];
  for(let i=0;i<inputcoords.length;i++){
    const p0 = inputcoords[i], p1 = inputcoords[(i+1)%inputcoords.length];
    const edge = p5.Vector.sub(p1,p0);
    const edgeup = p5.Vector.rotate(edge,0.5*PI).setMag(satinwidth*0.5);
    const edgedown = p5.Vector.rotate(edge,-0.5*PI).setMag(satinwidth*0.5);
    // holecoords.push(p0)
    for(let j=0;j<edge.mag();j+=satindist){
      const p = p5.Vector.lerp(p0,p1,j/edge.mag());
      satincoords.push(p5.Vector.add(p,edgeup))
      satincoords.push(p5.Vector.add(p,edgedown))
    }
  }
  return satincoords;
}

function holeblastr3000(){
  //takes unraveledcoords(?) and blasts a hole in it and stores this as holecoords.
  if(justclicked){
    coords = holecoords.slice();
    outlinecoords = holeoutlinecoords.slice();
    justclicked = false;
    holeradius = 100+random()*100;
  }
  const mouse = createVector(mouseX/viewscale,mouseY/viewscale);

  holecoords = [];
  for(let i=0; i<coords.length;i++){
    let tomouse = p5.Vector.sub(coords[i],mouse);
    const mousedist = tomouse.mag();
    if(mousedist < holeradius){
      tomouse.setMag(mousedist + (holeradius-mousedist)*holelerp*(1.0-holenoise/2+holenoise*noise(10*tomouse.heading(),mouse.x*0.001,mouse.y*0.001)));
      holecoords.push(tomouse.add(mouse));
      continue;
    }
    holecoords.push(coords[i])
  }

  holeoutlinecoords = [];
  for(let i=0; i<outlinecoords.length;i++){
    let tomouse = p5.Vector.sub(outlinecoords[i],mouse);
    const mousedist = tomouse.mag();
    if(mousedist < holeradius){
      tomouse.setMag(mousedist + (holeradius-mousedist)*holelerp*(1.0-holenoise/2+holenoise*noise(10*tomouse.heading(),mouse.x*0.001,mouse.y*0.001)));
      holeoutlinecoords.push(tomouse.add(mouse));
      continue;
    }
    holeoutlinecoords.push(outlinecoords[i])
  }
}

function mouseClicked(){
  if(key !== 'e'){
    justclicked = true;
  }
}

function keyPressed(){
  if(key === 'e' || key === 'E'){
    let exportnormal = [coords[0]];
    for(let coord of coords){
      if(exportnormal[exportnormal.length-1].dist(coord)>mindist){
        exportnormal.push(coord);
      }
    }
    for(let coord of satinstitchoutline(outlinecoords)){
      if(exportnormal[exportnormal.length-1].dist(coord)>mindist){
        exportnormal.push(coord);
      }
    }
    dst.export(exportnormal,"bagni-holeblasted"+toilet)
  }
  if(key === 'b' || key === 'B'){
    window.location.reload();
  }
}