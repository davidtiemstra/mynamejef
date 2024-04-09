// important fixes & improvements:
// desired length is now a property of nodes, not of connections so they cant be vaiable

// sources for next steps:
// - merel boers!!
// - willy morry <3

let stitchdist = 5; // this is kinda dumb and easy to fix but im lazy so stitch distance gets multiplied with scale so if u want an actual stitch distance of 2mm on scale 4 u need to set stitchdist to 5
let embroideryScale = 4;


let stems = [];
let leaves = [];
let flowers = [];

let pullstepdiv = 0.5; //how much to divide the steps taken each frame
let maxLeafSize = 20;
let stemLength = 20;
let horSpread = 10;
let leafPull = 0.25;

// chance parapmeters
let rootChance = 0.1;
let leafChance = 0.002;
let growthFalloff = 0.50;
let branchingFalloff = 0.025;
let leavesFalloff = 0.1;


// saving/downloading stuff:
let coords = [];
let paused = false;


class Stem {
  constructor(x, y, links, growChance, branchDir, isRoot=false){
    this.pos = createVector(x,y);
    this.links = links;
    this.id = stems.length;
    this.growChance = growChance;
    this.branchDir = branchDir;
    this.isRoot = isRoot;
    
    this.restLength = stemLength;
    this.externalPull = createVector(0,0);
    this.flowers = [];
    this.leaves = 0;
    
    for(let i=0; i<this.links.length; i++){
      stems[this.links[i]].links.push(this.id);
    }
  }
  
  drawLinks(){
    for(let i=0;i<this.links.length;i++){
      line(this.pos.x, this.pos.y, stems[this.links[i]].pos.x, stems[this.links[i]].pos.y);
    }
  }
  
  pushPull(){
    let move = createVector(0,0);
    let linkcount = this.links.length + 1;
    
    if(this.isRoot){
      return;
    }
    
    for(let i=0;i<this.links.length;i++){
      let p = createVector( stems[this.links[i]].pos.x, stems[this.links[i]].pos.y );
      move.add( p5.Vector.mult( 
        p5.Vector.sub(this.pos, p), // the vector towards the linked node
        (this.restLength / p5.Vector.dist(this.pos, p)) - 1.0 ) // how close the current lengh is to the rest length
      );
    }
    
    
    move.div(linkcount*pullstepdiv)
    this.pos.add(move);
    this.pos.add(this.externalPull);
    this.externalPull = createVector(0,0);
    this.pos.add(this.branchDir);
    // this.pos.add(createVector(0,-0.15));
  }
    
  grow(){
    // split this up into different chances for stem leaf and flower
    
    // grow stem?    
    if(random() < this.growChance * branchingFalloff**(this.links.length-1)) {
      stems.push(new Stem(
        this.pos.x, 
        this.pos.y,
        [this.id],
        growthFalloff * this.growChance,
        createVector( (random() - 0.5) * (this.links.length - 0.9) * horSpread, -1.0 ).setMag(0.5)
      ));
    }
    
    //or leaf
    else if (random() < leafChance * leavesFalloff**(this.leaves-1)){
      leaves.push(new Leaf(
        this.id,
        this.branchDir.heading() + (random()-0.5)*PI,
        5
      ));
      this.leaves++;
    }
    
    //or flower
    else if (false){
    }
    
  }
  
}

class Leaf {
  constructor(stemId, angle, leafSize){
    this.stemId = stemId;
    this.id = random();
    this.angle = angle;
    this.leafSize = leafSize;
    
    this.leafVector = createVector(0,leafSize).setHeading(angle);
    this.sunRays = [];
  }
  
  // i think this is probably where shit is going wrong lol
  leafGrowth(){
    this.leafSize = this.leafSize + (this.sunRays.length - (this.leafSize*0.2)**2) *0.1;
    this.leafVector = createVector(0,this.leafSize).setHeading(this.angle);
    
    //get pull
    if(this.sunRays.length>0){
      let leftx = min(stems[this.stemId].pos.x, stems[this.stemId].pos.x + this.leafVector.x);
      let rightx = max(stems[this.stemId].pos.x, stems[this.stemId].pos.x + this.leafVector.x)
      stems[this.stemId].externalPull.add(createVector(
        (this.sunRays[0] - leftx + this.sunRays[this.sunRays.length-1] - rightx) * leafPull, 0));
    }
    
    this.sunRays = [];    
    
    //delete if too small
    if(this.leafSize < 3){
      this.leafSize = 0;
      stems[this.stemId].leaves--;
      for (var i = leaves.length - 1; i >= 0; --i) {
          if (leaves[i].id == this.id) {
              leaves.splice(i,1);
          }
      }
    }
  }
  
  drawLeaf(){
    let pos = stems[this.stemId].pos;
    
    beginShape();
    vertex(pos.x, pos.y);
    vertex(pos.x + 0.5 * this.leafVector.x - 0.25 * this.leafVector.y, 
           pos.y + 0.5 * this.leafVector.y + 0.25 * this.leafVector.x);
    vertex(pos.x + this.leafVector.x, pos.y + this.leafVector.y);
    vertex(pos.x + 0.5 * this.leafVector.x + 0.25 * this.leafVector.y, 
           pos.y + 0.5 * this.leafVector.y - 0.25 * this.leafVector.x);
    
    // for(let i=0;i<leafSize;i+=5){
    //   vertex(pos.x, pos.y);
    // }
    
    endShape(CLOSE);
  }
}

class Flower {
  constructor(stemId, flowertype, angle, leafSize){
  }
  
  getPull(){
    // move somewhere for some reason. lol.
    // i think this is where i want all the weird shit to happen based on different flower types etc
  }
}

class Root extends Stem {
  constructor(x,y,links){
    super(x,y,links);
  }
}

function setup() {
  createCanvas(500, 500);
  
  //saving stuff
  createButton('pause/play').mousePressed(() => {paused = !paused }).position(20,height + 20);
  createButton('download csv').mousePressed(saveCSV).position(120,height + 20);
  
  stems.push(new Stem(
      50+random()*(width-100), 
      height-10, 
      [],
      rootChance,
      createVector(0,0.1),
      true));
}

function draw() {
  
  if(paused){
    return
  }
  
  background(255);
  noFill();
  
  //do sunrays (currently vertical)
  stroke(200);
  for(let x=0; x<width; x++){
    let top = height;
    let leafId=-1;
    for(let i=leaves.length-1; i>=0; i--){
      let lx1= stems[leaves[i].stemId].pos.x;
      let lx2= lx1 + leaves[i].leafVector.x;
      if(x>min(lx1,lx2) && x<max(lx1,lx2) && top > stems[leaves[i].stemId].pos.y){
        top = stems[leaves[i].stemId].pos.y;
        leafId = i;
      }
    }
    
    if(leafId>-1){
      leaves[leafId].sunRays.push(x);
      line(x,height,x,top)
    }
    
  }
  stroke(0)
    
  for(let i=0;i<leaves.length;i++){
    leaves[i].leafGrowth();
  }
  
  for(let i=0;i<stems.length;i++){
    stems[i].grow();
  }
  
  for(let i=1;i<stems.length;i++){
    stems[i].pushPull();
  }
  
  for(let i=0;i<stems.length;i++){
    // point(stems[i].pos.x,stems[i].pos.y);
    stems[i].drawLinks();
  }
    
  for(let i=0;i<leaves.length;i++){
    leaves[i].drawLeaf();
  }
  
  line(20,height-10,width-20,height-10)
  
  fill(0);
  noStroke();
  text('stems: ' + stems.length, 10, 15);
  text('leaves: ' + leaves.length, 10, 25);
  text('flowers: ' + flowers.length, 10, 35);
  text('draw time: ' + int(deltaTime) + ' ms', 10, 45)
  
  
}

  

//------------------------------------------------//
//----------EXPORTING FUNCTIONS-------------------//
//------------------------------------------------//

  
function getEmbroidery(startId) {
  
    pushStitch(startId);
  
  
  if(stems[stems[startId].links[1]] instanceof Leaf){

    for(let i=1;i<stems[startId].links.length-1; i++){
      pushStitch(stems[startId].links[i])
      pushStitch(stems[startId].links[i+1])
      pushStitch(startId);
    }

    return
  }
  
  for(let i=0; i<stems[startId].links.length; i++){
    
    if(!stems[startId].isRoot && i==0){
      continue
    }
      
    if(stems[stems[startId].links[i]] instanceof Stem){
      getEmbroidery(stems[startId].links[i]);
    }
    
    pushStitch(startId);
    
  }
  
}
    
function pushStitch(index){
  let jump = p5.Vector.sub(stems[index].pos, coords[coords.length-1]);
  
  if(jump.mag() < 1){ return }
  
  let tc = []
  for(let i=stitchdist; i < jump.mag(); i+=stitchdist){
    tc.push(
      p5.Vector.add(coords[coords.length-1],
                    p5.Vector.mult(jump, i/jump.mag())
                    )
    );
  }
                     
  coords.push(...tc, stems[index].pos);

}
    
function saveCSV(){
  
  coords = [];
  
  for(let i=0;i<stems.length;i++){
    if(stems[i].isRoot){
      coords.push(stems[i].pos);
      getEmbroidery(i);
    }
  }
  
  let table = new p5.Table();
  table.addColumn('x');
  table.addColumn('y');
  
  for(let i=20; i<(width-20); i+= stitchdist){
    let newRow = table.addRow();
    newRow.setNum('x', round(i * embroideryScale));
    newRow.setNum('y', round((height-10) * embroideryScale) );
  }
  
  for(let i=0;i<coords.length;i++){
    let newRow = table.addRow();
    newRow.setNum('x', round(coords[i].x * embroideryScale));
    newRow.setNum('y', round(coords[i].y * embroideryScale));
  }
  
  saveTable(table,'fg1-2.csv')
  
}
  