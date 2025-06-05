/*
todo/versions:
[x] get the convergence running 
  [x] add basic step functionality
  [x] get it running for 2 random points.
  [x] let them just continue in a straight spike afterwards
  [x] test & tweak -> thickness
[x] high priority fixes
  [ ] the fucking dst export misalignment (its not failing now so like fucking whatever?)
  [x] make the tendrils avoid eachother/text -> or just die if they cant go anywhere
  [x] also the tendrils pointing inward idk what to do about them. improve point in polygon check?
  [x] if the individual tendrils are good but the convergers are fucking up the text, make those not converge and just die
[x] do the same thing but with text points
  [x] try embroidering different fonts
  [x] test & tweak -> font choice, vertex interpolation (if necessary)
[x] implement scanning
  [x] from this phase on i dont think i need to do a lot of test runs
[x] implement divergence
[ ] make it slightly interactive (placing the text)
[ ] clean all the bullshit on screen rn? (after checking if field convergence is ok)
[ ] do hella parameter tweaks. id like to get it more angular again actually that was sick. give a preference for straight angles or smth
[ ] implement flowers

*/

const STEP_SIZE = 4; //in DU
const START_THICKNESS = 18;
const MAX_CONVERGE_DISTANCE = 75;
const NUTRIENT_BORDER = 50; // make nutrients falloff near border
const MINIMUM_THICKNESS = 4; // i can maybe lower this if we play with the tension to get less bobbin pullthrough at the tips
const THICKNESS_FALLOFF = 0.4; //only for debugging
const DISPLAY_RATIO = 2;
// const DISPLAY_RATIO = 0.55; // real value for laptop screen

// i can tweak these mostly to trade performance for scan resolution
const SCAN_ANGULAR_RESOLUTION = 0.08;
const SCAN_RADIAL_RESOLUTION = STEP_SIZE;
const SCAN_DISTANCE = SCAN_RADIAL_RESOLUTION * 3;

// tweak these to determine growth behaviour
const INTERSECTION_PENALTY = 2.0;
const SUSTENANCE_LEVEL = 0.4; // amount of nutrients a tendril needs to break even
const THICKNESS_MODIFIER = 0.6; // multiply by nutrient surplus to get difference in thickness

const MINIMUM_NUTRIENTS = 0.4 // if theres nothing above this try to converge. remember its linked to amount of scan steps
const DIVERGENCE_MINIMUM_THICKNESS = 16;

const NOISE_OCTAVES = 8;
const NOISE_FALLOFF = 0.25;
const NOISE_SCALE = 0.04;
// const NOISE_SCALE = 1;

// Selected font and text
let theFont;
let theText = 'PISRAT';
const FONT_SIZE = 264;
const TEXT_SAMPLE_FACTOR = 0.02;

let runners = [];
let sections = [];
let coords = [];
const starting_points_array = [];

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

function preload() {
  // theFont = loadFont('../fonts/Avara-Black.otf')
  theFont = loadFont('../fonts/SonoSans-Bold.otf')
}

function setup() {
  noLoop();
  
  const noise_seed = round(random()*10000);
  print(`noise seed: ${noise_seed}`);
  noiseSeed(noise_seed);
  noiseDetail(NOISE_OCTAVES, NOISE_FALLOFF);

  createCanvas( 
    ceil(DISPLAY_RATIO * HOOP.l.w), 
    ceil(DISPLAY_RATIO * HOOP.l.h) 
  );



  // // -----------ANNOYING DRAWING NOISE CODE------------------
  // let noiseLevel = 255;
  // // Iterate from top to bottom.
  // for (let y = 0; y < HOOP.l.h; y += 2) {
  //   // Iterate from left to right.
  //   for (let x = 0; x < HOOP.l.w; x += 2) {
  //     // Scale the input coordinates.
  //     let nx = NOISE_SCALE * x;
  //     let ny = NOISE_SCALE * y;

  //     // Compute the noise value.
  //     let c = noiseLevel * noise(nx, ny);

  //     // Draw the point.
  //     stroke(c);
  //     point(DISPLAY_RATIO * x, DISPLAY_RATIO * y);
  //   }
  // }
  // // -----------ANNOYING DRAWING NOISE CODE------------------



  angleMode(RADIANS);
  
  // get starting runners from text
  const text_points = [];
  textFont(theFont);
  for(let i=0; i< theText.length; i++){
    text_points.push(theFont.textToPoints(theText[i], 0, 0, FONT_SIZE, {
      sampleFactor: TEXT_SAMPLE_FACTOR,  // Increase this value for higher resolution
      simplifyThreshold: 0  // You can adjust this to smooth out the points -> i think it removes colinear points which sucks
    }));

    // fill("pink")
    // noStroke()
    // beginShape()
    starting_points_array.push([]);
    for(let j=0; j<text_points[i].length; j += 1){
      if( (i==0 && j > 10) || (i==3 && j > 13) || (i==4 && j > 11) ){
        break; // very crude mechanism to break inner paths bc theres nowhere for those tendrils to go rn.
        // if it works it works ig. gonna break if i change any sampling/font settings.
        // better to just use a font with no holes. excact geometry is not that important anywat
      }

      starting_points_array[i].push( { 
        x: text_points[i][j].x + 200 + i * FONT_SIZE * 0.8, 
        y: text_points[i][j].y + 500,
        alpha: text_points[i][j].alpha
      } );
      // vertex(DISPLAY_RATIO * (text_points[i][j].x + 200 + i * FONT_SIZE * 0.8), DISPLAY_RATIO * (text_points[i][j].y + 500))
    }
    // endShape(CLOSE);
  }

  print(starting_points_array)

  for(let i=0; i<starting_points_array.length; i++){
    let first_runner_index = null;
    for(let j=0; j<starting_points_array[i].length; j++){
      const pos = createVector(starting_points_array[i][j].x, starting_points_array[i][j].y)

      // TODO:
        // 1. angle both of these away from the core of the text (+ a bit randomly offset maybe)
        // 2. make the first one point to the previous point and the 2nd to the next
      let dir_out = ( PI * starting_points_array[i][j].alpha / 180 - 0.5*PI ) % (2*PI); 
      let point_out = p5.Vector.add(pos, p5.Vector.fromAngle(dir_out, 1));
      if(ptinxypoly(point_out.x, point_out.y, starting_points_array[i])){
        dir_out = ( dir_out + PI ) % (2*PI); 
      }

      const dir1 = dir_out + 0.2*PI + random()*0.1*PI;
      const dir2 = dir_out - 0.2*PI - random()*0.1*PI;

      // // soooooo much fucked up debugging stuff
      noStroke()
      fill("red")
      circle(DISPLAY_RATIO * pos.x, DISPLAY_RATIO * pos.y, 5)
      // noFill()
      // stroke("blue")
      // const p0 = p5.Vector.add(pos, p5.Vector.fromAngle(dir1, 12));
      // line(
      //     DISPLAY_RATIO * pos.x,
      //     DISPLAY_RATIO * pos.y,
      //     DISPLAY_RATIO * p0.x,
      //     DISPLAY_RATIO * p0.y
      // );
      // stroke("green")
      // const p1 = p5.Vector.add(pos, p5.Vector.fromAngle(dir2, 12));
      // line(
      //     DISPLAY_RATIO * pos.x,
      //     DISPLAY_RATIO * pos.y,
      //     DISPLAY_RATIO * p1.x,
      //     DISPLAY_RATIO * p1.y
      // );
      stroke("red");
      const p2 = p5.Vector.add(pos, p5.Vector.fromAngle(dir_out, 15));
      line(
          DISPLAY_RATIO * pos.x,
          DISPLAY_RATIO * pos.y,
          DISPLAY_RATIO * p2.x,
          DISPLAY_RATIO * p2.y
      );

      stroke(0)
      runners.push(new runner(
        pos.x, 
        pos.y,
        dir1,
        START_THICKNESS
      ));
      runners.push(new runner(
        pos.x, 
        pos.y,
        dir2,
        START_THICKNESS
      ));

      if(j > 0){
        runners[runners.length-2].compute_converge(runners.length-3);
      } else {
        first_runner_index = runners.length - 2;
      }

    }

    runners[first_runner_index].compute_converge(runners.length-1);

  }

  print(runners)

  // set all to convergent mode with eachother
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

    sections[0].embroider();
    while(sections.some(s => !s.embroidered)){
      // sections.find(s => !s.embroidered).embroider();

      const dist_array = sections
        .filter(s => !s.embroidered)
        .map(s => s.pos.dist(coords[coords.length-1]));
      const next_dist = Math.min( ...dist_array );
      sections.find(s => !s.embroidered && s.pos.dist(coords[coords.length-1]) <= next_dist).embroider();
    }

    coords = coords.filter(c => c.x > 0 && c.x < HOOP.l.w && c.y > 0 && c.y < HOOP.l.h );

    dst.export(coords,"tendrils_with_scan")
  }

  if(key === 'n' || key === 'N'){
    draw()
  }
  if(key === 's' || key === 'S'){
    loop()
  }
}



function sample_nutrient_map(coord){
  let falloff = 1;
  if(coord.x < NUTRIENT_BORDER)            falloff *= coord.x / NUTRIENT_BORDER;
  if(coord.x > HOOP.l.w - NUTRIENT_BORDER) falloff *= (HOOP.l.w - coord.x) / NUTRIENT_BORDER;
  if(coord.y < NUTRIENT_BORDER)            falloff *= coord.y / NUTRIENT_BORDER;
  if(coord.y > HOOP.l.h - NUTRIENT_BORDER) falloff *= (HOOP.l.h - coord.y) / NUTRIENT_BORDER;

  //praying this wont kill performance:
  for(const poly of starting_points_array){
    if(ptinxypoly(coord.x, coord.y, poly)){
      // print('bitch ur in my polygon')
      return -200;
    }
  }
  
  return noise(coord.x * NOISE_SCALE, coord.y * NOISE_SCALE) * falloff ;
}

// STOLEN HELPER SHIT

//point in polygon
function ptinxypoly(x, y, poly) {
  let c = false;
  for (let l = poly.length, i = 0, j = l-1; i < l; j = i++) {
      let xj = poly[j].x, yj = poly[j].y, xi = poly[i].x, yi = poly[i].y;
      let where = (yi - yj) * (x - xi) - (xi - xj) * (y - yi);
      if (yj < yi) {
          if (y >= yj && y < yi) {
              if (where == 0) return true;    // point on the line
              if (where > 0) {
                  if (y == yj) {                // ray intersects vertex
                      if (y > poly[j == 0 ? l-1 : j-1].y) {
                          c = !c;
                      }
                  } else {
                      c = !c;
                  }
              }
          }
      } else if (yi < yj) {
          if (y > yi && y <= yj) {
              if (where == 0) return true;    // point on the line
              if (where < 0) {
                  if (y == yj) {                // ray intersects vertex
                      if (y < poly[j == 0 ? l-1 : j-1].y) {
                          c = !c;
                      }
                  } else {
                      c = !c;
                  }
              }
          }
      } else if (y == yi && (x >= xj && x <= xi || x >= xi && x <= xj)) {
          return true;     // point on horizontal edge
      }
  }
  return c;
}