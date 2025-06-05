/*
todo/versions:
[ ] get the convergence running 
  [x] add basic step functionality
  [x] get it running for 2 random points.
  [x] let them just continue in a straight spike afterwards
  [ ] test & tweak -> thickness
[ ] do the same thing but with text points
  [ ] try embroidering different fonts
  [ ] test & tweak -> font choice, vertex interpolation (if necessary)
[ ] implement scanning
  [ ] from this phase on i dont think i need to do a lot of test runs
[ ] implement divergence
[ ] implement flowers
*/

const STEP_SIZE = 4; //in DU
const START_THICKNESS = 35;
const THICKNESS_FALLOFF = 0.4; //only for debugging

let runners = [];
let sections = [];
let coords = [];

// hoop sizes expressed in du ( dst units: 1du = 0.1mm)
// these are from the manual. supposedly if we stay within that range they should read but needs testing.
const HOOP = {
  s:{
    w: 1000,
    h: 1000
  },
  l:{
    w:1800,
    h:1300
  }
}

const DISPLAY_RATIO = 0.55;

function preload() {
}

function setup() {
  createCanvas( 
    ceil(DISPLAY_RATIO * HOOP.l.w), 
    ceil(DISPLAY_RATIO * HOOP.l.h) 
  );

  angleMode(RADIANS);
  
  // get starting runners from text

  // 2 test runners to get convergence. want these kinda close together but not necessarily facing the same direction
  runners.push(new runner(
    HOOP.l.w*0.5 + (random() - 0.5) * 100, 
    HOOP.l.h*0.5 + (random() - 0.5) * 100,
    random()*2*PI,
    START_THICKNESS
  ));
  runners.push(new runner(
    HOOP.l.w*0.5 + (random() - 0.5) * 100, 
    HOOP.l.h*0.5 + (random() - 0.5) * 100,
    random()*2*PI,
    START_THICKNESS
  ));

  // set all to convergent mode with eachother
  runners[0].computeConverge(1);
}

function draw() {
  // step all runners (non parallel)
  for(const runner of runners){
    fill("red")
    noStroke();
    if(runner.live) runner.scan();
  }
  
  for(const runner of runners){
    stroke(0)
    noFill();
    if(runner.live) runner.step();
  }

  // step all flowers?

  // export when all runners & flowers are dead
  // start with 2 stitch sections so i dont have to do any fucked up interpolation.
  // honestly prettier that way anyway
}


function keyPressed(){
  if(key === 'e' || key === 'E'){
    coords = [];
    //reset all section embroidered properties for repeatability

    while(sections.some(s => !s.embroidered)){
      sections.find(s => !s.embroidered).embroider();
    }

    dst.export(coords,"tendrils_2_points")
  }
}