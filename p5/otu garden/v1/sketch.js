/*
delft maker faire changes:
[x] photo nutrient map
  [x] allow photo upload - choose between cropped and uncropped (to skip cropping phase)
  [x] crop photo
  [x] apply nutrient map to tendril algo
[x] switch big and small hoop
[x] streamline ui to make this whole flow work better
[x] embroider title in flower color.
[ ] flower inputs
  [ ] fabric parameter input boxes
  [ ] intialize flower parameters
  [ ] pass flower parameters when instantiating flower
[ ] tweak generation parameters
[ ] make it pretty

old todo/versions:
[?] the fucking dst export misalignment (its not failing now so like fucking whatever?)
[ ] do hella parameter tweaks. 
    id like to get it more angular again actually that was sick. 
    give a preference for straight angles or smth
[?] give them a little point when they die so its more like tendrils and less like wormse
[ ] make it not constantly diverge and immediately converge again
[ ] make it converge more in the wild
[-] implement flowers

*/


// IVE MADE ALL PARAMETERS THAT I THINK ARE FUN TO TWEAK LETS INSTEAD OF CONSTS
const PHASES = {
  0: "set_params", // display upload button and input boxes for fabric parameters and hoop size
  1: "crop_photo", // show crop canvas from process_photo_module
  2: "place_logo", // move and rotate the logo (old initial phase)
  3: "run_generation", // generation is running.
  4: "generation_end" // generation reached equilibrium or ended manually, download .dst
}

const FABRICS = [
  "wool",
  "cotton",
  "linen",
  "silk",
  "hemp",
  "synthetic"
];

let phase = 0;

// photo interface stuff
const DEBUG_PHOTO_NUMBER = 3;

const FILL_TEXT = true;
const WEIGHED_CONTRAST = false; // if true this combines the nutrient value based on the relative contrasts of the color channels (r,g,b), if false it only samples the channel with the highest contrast
const DEBUG_COLORS = true;
const SHOW_RENDER_MAP = false;
const FILL_DENSITY = 2;
const FILL_STEP = 20;
let hoop_size = "s"; // sets the default but that only matters if youre skipping the input phase

const ALLOW_CONVERGENCE = false; // i think maybe convergence was a mistake. still does it at the very start. idk its hard to let go.

// tweak these to determine growth behaviour
let INTERSECTION_PENALTY = 0.8;
let SUSTENANCE_LEVEL = 0.36; // amount of nutrients a tendril needs to break even
let THICKNESS_MODIFIER = 0.8; // multiply by nutrient surplus to get difference in thickness
let START_THICKNESS = 20;
let MINIMUM_THICKNESS = 12;
let MAX_CONVERGE_DISTANCE = 125;

let MINIMUM_NUTRIENTS = SUSTENANCE_LEVEL // if theres nothing above this try to converge. remember its linked to amount of scan steps
const DIVERGENCE_MINIMUM_THICKNESS = MINIMUM_THICKNESS * 2.5;
const DIVERGENCE_MINIMUM_NUTRIENTS = 0.4;

let SECTIONS_PER_FLOWER = 350;
let FLOWER_SIZE_RATIO = 4.2;
const FLOWER_START_OFFSET = 10; // set to 10 for words

let NOISE_OCTAVES = 8;
let NOISE_FALLOFF = 0.25;
let NOISE_SCALE = 0.03; //most interesting one honestly

const FLOWER_STEP_SIZE = 15;
const ITERATION_COUNT = 2;
const MAX_PETAL_COUNT = 8;
const FLOWER_ITERATION_OFFSET = 0.05;

// Selected font and text
// let theText = 'papu1';
let theText = 'otu';
const FONT_FILENAME = "Flexi_IBM_VGA_False.ttf"
const TEXT_SAMPLE_FACTOR = 0.03;
const TEXT_SPACING = 0.09

const STEP_SIZE = 6; //in DU
const NUTRIENT_BORDER = 50; // make nutrients falloff near border
const BORDER_STEEPNESS = 5;
const DISPLAY_RATIO = 1;
// const DISPLAY_RATIO = 0.4; // real value for pc screen
// const DISPLAY_RATIO = 0.55; // real value for laptop screen

// i can tweak these mostly to trade performance for scan resolution
const MAX_ANGLE_MODIFIER = 0.75;
const SCAN_ANGULAR_RESOLUTION = 0.08;
const SCAN_RADIAL_RESOLUTION = STEP_SIZE;
const SCAN_DISTANCE = SCAN_RADIAL_RESOLUTION * 3;
const MAX_BEZIER_HANDLE_LENGTH = 100;

const IX_HALF_SQUARE_SIZE = 50; // this is just for indexing the sections. should go right as long as this is higher than scan distance


// input variables
let fabric_composition = [];
let uncropped_photo;
let cropped_photo;
let filename;
let input_phase_done = false;

// generation variables
let runners = [];
let sections = [];
let ix_sections = [];
let flowers = [];
let tendril_coords = [];
let starting_points_array = [];
const text_points = [];
let flower_profile;
let petal_count;
let flower_attraction;

let tendril_graphics;
let fill_coords = [];

let theFont;
let text_angle = 0;

let invert_pixels = false;
let render_map;

// hoop sizes expressed in du ( dst units: 1du = 0.1mm)
// these are from the manual. supposedly if we stay within that range they should read but needs testing.
const HOOP = {
  s:{
    w: 1000,
    h: 1000,
    font: 256
  },
  l:{
    w:1800,
    h:1300,
    font: 324
  }
}
let hoop;

function preload() {
  theFont = loadFont(`../fonts/${FONT_FILENAME}`)
  // debug_photo = loadImage(`photos/${DEBUG_PHOTO_NUMBER}_processed.jpg`)
}

function draw() {
  switch(phase){
    case 0:
      draw_input_module();
      if(input_phase_done && cropped_photo != null){
        destroy_input_module();
        setup_generator_module();
        phase = 2;
      }
      else if(input_phase_done && uncropped_photo != null){
        destroy_input_module()
        setup_photo_module(hoop.w * DISPLAY_RATIO, hoop.h * DISPLAY_RATIO);
        phase = 1;
      }
      break;
    case 1:
      draw_photo_module();
      if(input_phase_done && cropped_photo != null){
          destroy_photo_module();
          setup_generator_module();
          phase = 2;
      }
      break;
    case 2:
      draw_generator_module();
  }
}

function setup() {
  setup_input_module();
}

function setup_generator_module() {
  const noise_seed = round(random()*10000);
  print(`seed: ${noise_seed}`);
  noiseSeed(noise_seed);
  randomSeed(noise_seed);
  noiseDetail(NOISE_OCTAVES, NOISE_FALLOFF);

  hoop = HOOP[hoop_size];

  cropped_photo.loadPixels()

  petal_count = 2 + round(random()*MAX_PETAL_COUNT);
  // petal_count = 4;
  flower_attraction = 100 + random() * 100000
  // flower_attraction = 1000;
  
  flower_profile = Flower.generateUnitProfile(
      int(random(1,15)),  // profile points
      0.8  // max width (normalised relative to radius)
  );

  createCanvas( 
    ceil(DISPLAY_RATIO * hoop.w), 
    ceil(DISPLAY_RATIO * hoop.h) 
  );
  tendril_graphics = createGraphics(width, height)

  // fill section index for performance.
  for(let x=0; x < hoop.w; x += IX_HALF_SQUARE_SIZE){
    ix_sections.push([]);
    for(let y=0; y < hoop.h; y += IX_HALF_SQUARE_SIZE){
      ix_sections[ix_sections.length-1].push([]);
      // so the domain of each square is:
      // index * half square size -> index * half square size + full square size
    }
  }

  // -----------TWEAK IMAGE RENDERING------------------
  // theres a lot of things here that im doing a million times lol
  let average = [0,0,0]
  let lowest_pixel = [255,255,255];
  let highest_pixel = [0,0,0];
  for(let i=0; i<width*height*4; i+=4){
    for(let j=0; j<3; j++){
      average[j] += cropped_photo.pixels[i+j];
      lowest_pixel[j] = min(cropped_photo.pixels[i+j], lowest_pixel[j])
      highest_pixel[j] = max(cropped_photo.pixels[i+j], highest_pixel[j])
    }
  }
  average = [average[0] / (width*height), average[1] / (width*height), average[2] / (width*height)]
  
  let contrasts = [0,0,0]
  for(let i=0; i<width*height*4; i+=4){
    for(let j=0; j<3; j++){
      contrasts[j] += abs(average[j] - cropped_photo.pixels[i+j]);
      cropped_photo.pixels[i+j] = (cropped_photo.pixels[i+j] - lowest_pixel[j]) * 255 / (highest_pixel[j] - lowest_pixel[j])
    }
  }
  const total_contrast = contrasts[0] + contrasts[1] + contrasts[2];
  contrasts = [contrasts[0] / total_contrast, contrasts[1] / total_contrast, contrasts[2] / total_contrast];

  let max_contrast_index = contrasts.indexOf(Math.max(...contrasts));

  invert_pixels = WEIGHED_CONTRAST ? 
    contrasts[0] * average[0] + contrasts[1] * average[1] +  contrasts[2] * average[2] : 
    average[max_contrast_index] > 127;
  
  for(let i=0; i<width*height*4; i+=4){
    cropped_photo.pixels[i] = WEIGHED_CONTRAST ? 
      contrasts[0] * cropped_photo.pixels[i] + contrasts[1] * cropped_photo.pixels[i+1] +  contrasts[2] * cropped_photo.pixels[i+2] : 
      cropped_photo.pixels[i + max_contrast_index];
  }
  print(`lowest (r,g,b): ${lowest_pixel}`)
  print(`highest (r,g,b): ${highest_pixel}`)
  print(`averages (r,g,b): ${average}`)
  print(`contrasts (r,g,b): ${contrasts}`)
  // -----------TWEAK IMAGE RENDERING------------------

  // -----------SHOW MAP SOMETIMES------------------
  if(SHOW_RENDER_MAP){
    render_map = createGraphics(width,height);
    render_map.loadPixels();
    for(let x=0; x<width; x++){
      for( let y=0; y<height; y++){
        let val = sample_nutrient_map(createVector(x,y)) * 255
        // stroke(200)
        render_map.set(x,y,val)
      }
    }
    render_map.updatePixels();
  }
  // -----------SHOW MAP SOMETIMES------------------


  angleMode(RADIANS);
  
  // get starting runners from text
  textFont(theFont);
  for(let i=0; i< theText.length; i++){
    text_points.push(theFont.textToPoints(theText[i], 0, 0, hoop.font, {
      sampleFactor: TEXT_SAMPLE_FACTOR,  // Increase this value for higher resolution
      simplifyThreshold: 0  // You can adjust this to smooth out the points -> i think it removes colinear points which sucks
    }));
  }
}

function draw_generator_module() {
  background(255)
  rect(0,0,width,height)
  SHOW_RENDER_MAP ? image(render_map,0,0,width,height) : image(cropped_photo,0,0,width,height);
  background(255,50)

  if(runners.length==0){
    
    strokeWeight(3)
    rect(0,0,width,height)
    strokeWeight(1)

    // im drawing the text at full resolution now not the sample resolution.
    // u can view sample resultion by uncommenting beginshape/vertex/endshape below.
    noFill();
    stroke("darkred");
    textSize(hoop.font);
    textAlign(CENTER, CENTER)
    push();
    translate( mouseX / DISPLAY_RATIO , mouseY / DISPLAY_RATIO)
    rotate(text_angle)
    text(theText,0,0);
    pop();
    textSize(11);

    starting_points_array = [];
    let x_cursor = 0;
    for(let i=0; i< text_points.length; i++){
      // beginShape()
      starting_points_array.push([]);
      for(let j=0; j<text_points[i].length; j += 1){
        // if( (i==0 && j > 10) || (i==3 && j > 13) || (i==4 && j > 11) ){
        //   break; // very crude mechanism to break inner paths bc theres nowhere for those tendrils to go rn.
        //   // if it works it works ig. gonna break if i change any sampling/font settings.
        //   // better to just use a font with no holes. excact geometry is not that important anywat
        // }

        // also rotate text.
        let text_point = createVector(
          text_points[i][j].x + x_cursor - textWidth(theText) * hoop.font * 0.045, 
          text_points[i][j].y + hoop.font * 0.38);
        text_point.rotate(text_angle);
        
        starting_points_array[i].push( { 
          x: text_point.x + mouseX / DISPLAY_RATIO , 
          y: text_point.y + mouseY / DISPLAY_RATIO,
          alpha: text_points[i][j].alpha
        } );
        // vertex(DISPLAY_RATIO * starting_points_array[i][j].x, DISPLAY_RATIO * starting_points_array[i][j].y)
      }
      // endShape(CLOSE);
      x_cursor +=  hoop.font * TEXT_SPACING * textWidth(theText[i]);
    }
  }

  // step all runners (non parallel)
  // noStroke();
  // strokeWeight(1)
  for(const runner of runners){
    if(runner.live) runner.scan();
  }
  
  tendril_graphics.noFill();
  tendril_graphics.strokeWeight(2);

  tendril_graphics.stroke("darkgreen");
  for(const runner of runners){
    if(runner.live) runner.step();
  }

  image(tendril_graphics, 0, 0, width, height)
  
  stroke("darkred");
  strokeWeight(2);
  for(const flower of flowers){
    flower.drawFlower();
  }

  if(FILL_TEXT){
    strokeWeight(2);
    beginShape();
    for(let c of fill_coords){
      vertex(c.x, c.y)
    }
    endShape(CLOSE);
  }

  // step all flowers? -> for animation, see live version

  // export when all runners & flowers are dead
  // start with 2 stitch sections so i dont have to do any fucked up interpolation.
  // honestly prettier that way anyway
}

function mouseClicked(){
  if(phase != 2) return;
  if(runners.length > 0) return

  print(`mouse clicked at X:${mouseX}, Y:${mouseY}`)

  for(let i=0; i<starting_points_array.length; i++){
    fill_coords = fill_coords.concat(horizontal_fill(starting_points_array[i]));

    let first_runner_index = null;
    for(let j=0; j<starting_points_array[i].length; j++){
      const pos = createVector(starting_points_array[i][j].x, starting_points_array[i][j].y)

      // 1. angle both of these away from the core of the text (+ a bit randomly offset maybe)
      // 2. make the first one point to the previous point and the 2nd to the next
      let dir_out = ( PI * starting_points_array[i][j].alpha / 180 - 0.5*PI ) % (2*PI); 
      let point_out = p5.Vector.add(pos, p5.Vector.fromAngle(dir_out, 1));
      if(ptinxypoly(point_out.x, point_out.y, starting_points_array[i])){
        dir_out = ( dir_out + PI ) % (2*PI); 
      }

      const dir1 = dir_out + 0.2*PI + random()*0.1*PI;
      const dir2 = dir_out - 0.2*PI - random()*0.1*PI;

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
}

function mouseWheel(event) {
  if(phase != 2) return;
  text_angle = (text_angle + Math.sign(event.delta) * 0.02 * PI) % (2*PI);
}

// these should be separate createButtons
function keyPressed(){
  if(phase != 2) return;
  if(key === 'e' || key === 'E'){
    tendril_coords = [];
    //reset all section embroidered properties for repeatability

    sections[0].embroider();
    while(sections.some(s => !s.embroidered)){
      const dist_array = sections
        .filter(s => !s.embroidered)
        .map(s => s.pos.dist(tendril_coords[tendril_coords.length-1]));
      const next_dist = Math.min( ...dist_array );
      sections.find(s => !s.embroidered && s.pos.dist(tendril_coords[tendril_coords.length-1]) <= next_dist).embroider();
    }

    tendril_coords = tendril_coords.filter(c => c.x > 0 && c.x < hoop.w && c.y > 0 && c.y < hoop.h );

    tendril_coords.push("STOP")

    if(FILL_TEXT) tendril_coords = tendril_coords.concat(fill_coords)

    flowers[0].embroider();
    while(flowers.some(f => !f.embroidered)){
      const dist_array = flowers
        .filter(f => !f.embroidered)
        .map(f => f.origin.dist(tendril_coords[tendril_coords.length-1]));
      const next_dist = Math.min( ...dist_array );
      flowers.find(f => !f.embroidered && f.origin.dist(tendril_coords[tendril_coords.length-1]) <= next_dist).embroider();
    }

    let timecode = Date.now()-1749200000000;
    let params = `let INTERSECTION_PENALTY = ${INTERSECTION_PENALTY};
    let SUSTENANCE_LEVEL = ${SUSTENANCE_LEVEL}; // amount of nutrients a tendril needs to break even
    let THICKNESS_MODIFIER = ${THICKNESS_MODIFIER}; // multiply by nutrient surplus to get difference in thickness
    let MINIMUM_THICKNESS = ${MINIMUM_THICKNESS};
    let START_THICKNESS = ${START_THICKNESS};
    let MAX_CONVERGE_DISTANCE = ${MAX_CONVERGE_DISTANCE};
    let MINIMUM_NUTRIENTS = ${MINIMUM_NUTRIENTS} // if theres nothing above this try to converge. remember its linked to amount of scan steps
    const DIVERGENCE_MINIMUM_THICKNESS = ${DIVERGENCE_MINIMUM_THICKNESS};
    const DIVERGENCE_MINIMUM_NUTRIENTS = ${DIVERGENCE_MINIMUM_NUTRIENTS};
    let SECTIONS_PER_FLOWER = ${SECTIONS_PER_FLOWER};
    let FLOWER_SIZE_RATIO = ${FLOWER_SIZE_RATIO};
    let NOISE_OCTAVES = ${NOISE_OCTAVES};
    let NOISE_FALLOFF = ${NOISE_FALLOFF};
    let NOISE_SCALE = ${NOISE_SCALE};`;
    save([params], `otu_${timecode}.txt`)
    dst.export(tendril_coords,`otu_${timecode}`)
  }
  if(key === 'r' || key === 'R'){
    print(runners)
    print(sections)
    for(let runner of runners){
      noStroke()
      fill("purple")
      text(runner.id, runner.pos.x*DISPLAY_RATIO, runner.pos.y*DISPLAY_RATIO)
    }
  }
  if(key === 'n' || key === 'N'){
    draw()
  }
  if(key === 'p' || key === 'P'){
    if(isLooping()){
      noLoop()
    } else{
      loop()
    }
  }
}



function sample_nutrient_map(coord){
  if(coord.x < 0 || coord.x > hoop.w || coord.y < 0 || coord.y > hoop.h) {
    return -200;
  }

  //praying this wont kill performance:
  for(const poly of starting_points_array){
    if(ptinxypoly(coord.x, coord.y, poly)){
      // print('bitch ur in my polygon')
      return -200;
    }
  }

  // falloff should be harsher. fsr it was making the corners (where the overlap) all white. doesnt make any fucking sense. but thats why the min() are there
  let falloff = 1;
  if(coord.x < NUTRIENT_BORDER)          falloff *= coord.x * (1 + BORDER_STEEPNESS) / NUTRIENT_BORDER - BORDER_STEEPNESS;
  if(coord.x > hoop.w - NUTRIENT_BORDER) falloff = min(falloff, falloff * ((coord.x - hoop.w) * (-BORDER_STEEPNESS - 1) / NUTRIENT_BORDER - BORDER_STEEPNESS));
  if(coord.y < NUTRIENT_BORDER)          falloff = min(falloff, falloff * (coord.y * (1 + BORDER_STEEPNESS) / NUTRIENT_BORDER - BORDER_STEEPNESS));
  if(coord.y > hoop.h - NUTRIENT_BORDER) falloff = min(falloff, falloff * ((coord.y - hoop.h) * (-BORDER_STEEPNESS - 1) / NUTRIENT_BORDER - BORDER_STEEPNESS));

  let photo_sample = cropped_photo.pixels[(floor(coord.x) + width * floor(coord.y))*4] / 127;
  photo_sample = sin(photo_sample * PI * 0.5 + 1.5 * PI) + 1 // this increases contrast but maybe i dont need that actually
  if(invert_pixels) photo_sample = 2.0 - photo_sample;

  let noise_sample = 0.1 + 0.8 * noise(coord.x * NOISE_SCALE, coord.y * NOISE_SCALE)

  if(isNaN(photo_sample)){
    debugger;
  }

  return noise_sample * falloff * photo_sample;
}

function horizontal_fill(polygon){
  // we are assumaing a closed polygon which may consist of multiple sections?
  let y_start = height, y_end = 0, x_start = width, x_end = 0;
  for(let point of polygon){
   y_start = min(y_start, point.y);
   x_start = min(x_start, point.x);
   y_end = max(y_end, point.y);
   x_end = max(x_end, point.x);
  }

  // rect(x_start,y_start,x_end-x_start,y_end-y_start)

  let rows = [];
  for(let y = y_start; y < y_end; y += FILL_DENSITY){
    // im thinking we find the intersections, turn those into "columns" and connect them
    let intersections = [];
    for(let i=0; i< polygon.length; i++){
      if(Math.sign(polygon[i].y - y) != Math.sign(polygon[(i+1)%polygon.length].y - y)){
        const p1 = createVector(polygon[i].x, polygon[i].y);
        const p2 = createVector(polygon[(i+1)%polygon.length].x, polygon[(i+1)%polygon.length].y);
        intersections.push(p5.Vector.add(p1, p5.Vector.mult(p5.Vector.sub(p2, p1), (y-p1.y) / (p2.y-p1.y) )));
        // point(intersections[intersections.length-1].x,intersections[intersections.length-1].y)
      }
    }
    
    // every 2 intersections become a column in the row.
    //sort by x, split up, fill the gaps
    if(intersections.length == 0 || intersections.length % 2 != 0) return;
    rows.push([])
    intersections.sort((a,b) => a.x - b.x);
    for(let i=0; i*2<intersections.length; i++){
      rows[rows.length-1].push();
      let left_or_right = (rows.length % 2 == 0) * 2 - 1;
      if(left_or_right > 0) rows[rows.length-1].push([intersections[i*2]]);

      let x = (left_or_right > 0 ? intersections[i*2].x : intersections[i*2 + 1] ) + left_or_right * FILL_STEP * (0.5 + random() * 0.5);
      while(left_or_right > 0 ? (x < intersections[i*2 + 1].x - FILL_STEP) : (x > intersections[i*2].x + FILL_STEP)){
        // point(x,y)
        rows[rows.length-1][i].push(createVector(x, y))
        x += left_or_right * FILL_STEP * (0.5 + random() * 0.5);
      }
      if(left_or_right > 0) rows[rows.length-1][i].push(intersections[i*2 + 1]);
    }
  }
  
  let fill_coords = [];
  for(let col = 0; col < 20; col++){ // we're just not doing polygons with more than 20 columns come on lmao
    for( let row = 0; row < rows.length; row ++){
      if(!rows[row][col]) continue;
      fill_coords = fill_coords.concat(rows[row][col])
    }
  }
  print(fill_coords)
  return fill_coords;
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