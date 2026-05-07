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
  [x] fabric parameter input boxes
  [x] use new flower class
  [ ] intialize flower parameters using fabric
  [x] pass variable petal count (based on what?)
  [x] pass flower parameters when instantiating flower
[x] add outline
  [ ] double check that its actually bug free now lmao.(its not)
  [ ] also if possible try to optimize bc my laptop is gonna fucking die from this.
[x] generate from little circle -> more points, no convergence
[x] do a line under the tendrils first to give them more volume
[ ] get rid of a million jump stitches
[ ] purge tendril sections that are covered by flowers from dst export
  [x] maybe also purge sooooome of the tendril sections overlapping with eachother
[x] add a generate without picture button (i.e. classic mode)
  [x] have a nutrient slider or smth.
[x] adjust size to fit in window
[x] add corner stitches for alignment
[ ] tweak generation parameters
[ ] fix adjustable display ratio
[ ] make the ui pretty
[ ] draw everything to multiple layers
[x] fix the printout with numbers/variables (and payment?)
[ ] create multiple mode
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

const USE_OUTLINE = true;
const FILL_TEXT = true;
const USE_TEXT = false;

const MULTIPLY_WITH_CONST = true;
const MANUAL_INVERT = true; // set to true to invert color input map, or to false to use automatic map. true is often good for patterns and false for logos.
const WEIGHED_CONTRAST = true; // if true this combines the nutrient value based on the relative contrasts of the color channels (r,g,b), if false it only samples the channel with the highest contrast
const DEBUG_COLORS = true;
const SHOW_RENDER_MAP = false;
const FILL_DENSITY = 2;
const FILL_STEP = 20;
const COLOR_CONST_DEFAULT = 0.7;

let DEFAULT_SECTIONS_PER_FLOWER = 150; // was 350
let DEFAULT_FLOWER_SIZE_RATIO = 4.2;

const OUTLINE_WIDTH = 30;
const OUTLINE_OFFSET = 30;

const CIRCLE_RADIUS = 25;
const CIRCLE_SAMPLE_FACTOR = 2*Math.PI/8;

let hoop_size = "s"; // sets the default but that only matters if youre skipping the input phase

const ALLOW_CONVERGENCE = false; // i think maybe convergence was a mistake. still does it at the very start. idk its hard to let go.

// tweak these to determine growth behaviour
let INTERSECTION_PENALTY = 0.8;
let SUSTENANCE_LEVEL = 0.36; // amount of nutrients a tendril needs to break even
let THICKNESS_MODIFIER = 0.8; // multiply by nutrient surplus to get difference in thickness
let START_THICKNESS = 32; 
let MINIMUM_THICKNESS = 18;
let MAX_CONVERGE_DISTANCE = 125;

let MINIMUM_NUTRIENTS = SUSTENANCE_LEVEL // if theres nothing above this try to converge. remember its linked to amount of scan steps
const DIVERGENCE_MINIMUM_THICKNESS = MINIMUM_THICKNESS * 2.5;
const DIVERGENCE_MINIMUM_NUTRIENTS = 0.4;

let sections_per_flower;
let flower_size_ratio;

const FLOWER_START_OFFSET = 10; // set to 10 for words

let NOISE_OCTAVES = 8;
let NOISE_FALLOFF = 0.25;
let NOISE_SCALE = 0.03; //most interesting one honestly

const FLOWER_STEP_SIZE = 20;
const ITERATION_COUNT = 2;
const MAX_MIN_PETAL_COUNT = 8; // + 2
const FLOWER_ITERATION_OFFSET = 0.05;

// Selected font and text
let theText = 'otu';
const FONT_FILENAME = "Flexi_IBM_VGA_False.ttf"
const TEXT_SPACING = 0.09

const STEP_SIZE = 5; //in DU
const NUTRIENT_BORDER = 50 + (USE_OUTLINE ? OUTLINE_OFFSET + OUTLINE_WIDTH : 0); // make nutrients falloff near border
const BORDER_STEEPNESS = 5;
const DISPLAY_RATIO = 1;

// display ratios other than 1 do not work rn lol.
// const DISPLAY_RATIO = 0.4; // real value for pc screen
// const DISPLAY_RATIO = 0.55; // real value for laptop screen

// i can tweak these mostly to trade performance for scan resolution
const MAX_ANGLE_MODIFIER = 0.5;
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
let no_photo_mode = false;
let color_multiplier;

// generation variables
let runners = [];
let sections = [];
let ix_sections = [];
let flowers = [];
let tendril_coords = [];
let starting_points_array = [];
const text_points = [];
let flower_dna;
let min_petal_count;
let flower_attraction;

let tendril_graphics;
let text_fill_coords = [];
let outline = [];
let satin_outline = [];

let theFont;
let text_angle = 0;

let invert_pixels = false;
let render_map;
let noise_seed;
let mouse_clicked;

// hoop sizes expressed in du ( dst units: 1du = 0.1mm)
// these are from the manual. supposedly if we stay within that range they should read but needs testing.
const HOOP = {
  s:{
    w: 1000,
    h: 1000,
    font: 204,
    sample_factor: 0.012
  },
  l:{
    w:1300,
    h:1800,
    font: 292,
    sample_factor: 0.02
    // font: 228,
    // sample_factor: 0.016
  }
}
let hoop;

function preload() {
  theFont = loadFont(`../fonts/${FONT_FILENAME}`)
}

function setup() {
  setup_input_module();
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

function setup_generator_module() {
  noise_seed = round(random()*10000);
  print(`seed: ${noise_seed}`);
  noiseSeed(noise_seed);
  randomSeed(noise_seed);
  noiseDetail(NOISE_OCTAVES, NOISE_FALLOFF);

  hoop = HOOP[hoop_size];

  cropped_photo.loadPixels()

  min_petal_count = 2 + round(random()*MAX_MIN_PETAL_COUNT);
  flower_attraction = 100 + random() * 100000
  // flower_attraction = 1000;
  
  flower_dna = Flower.generateUnitDNA();
  const flower_scale_ratio = (0.5 + random()) * (hoop_size == "s" ? 0.6 : 0.8);
  sections_per_flower = flower_scale_ratio * (DEFAULT_SECTIONS_PER_FLOWER + (USE_TEXT ? 150 + (hoop.font - 228) * 2 : 0));
  flower_size_ratio = flower_scale_ratio * DEFAULT_FLOWER_SIZE_RATIO * pow(sections_per_flower, 0.4) * 0.08;

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
  if(!no_photo_mode){
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
    if(MANUAL_INVERT) invert_pixels = !invert_pixels;
    
    for(let i=0; i<width*height*4; i+=4){
      cropped_photo.pixels[i] = WEIGHED_CONTRAST ? 
        contrasts[0] * cropped_photo.pixels[i] + contrasts[1] * cropped_photo.pixels[i+1] +  contrasts[2] * cropped_photo.pixels[i+2] : 
        cropped_photo.pixels[i + max_contrast_index];
    }
    print(`lowest (r,g,b): ${lowest_pixel}`)
    print(`highest (r,g,b): ${highest_pixel}`)
    print(`averages (r,g,b): ${average}`)
    print(`contrasts (r,g,b): ${contrasts}`)
  }
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
  if(USE_TEXT){
    textFont(theFont);
    for(let i=0; i< theText.length; i++){
      text_points.push(theFont.textToPoints(theText[i], 0, 0, hoop.font, {
        sampleFactor: hoop.sample_factor,  // Increase this value for higher resolution
        simplifyThreshold: 0  // You can adjust this to smooth out the points -> i think it removes colinear points which sucks
      }));
    }
  } else{
    for(let a=0; a<2*PI; a+=CIRCLE_SAMPLE_FACTOR){
      text_points.push({x: cos(a) * CIRCLE_RADIUS, y: sin(a) * CIRCLE_RADIUS, alpha: a});
    }
  }
  print(text_points)
}

function draw_generator_module() {
  background(255)
  noStroke();
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

    if(USE_TEXT){
      starting_points_array = [];
      textSize(hoop.font);
      textAlign(CENTER, CENTER)
      push();
      translate( mouseX / DISPLAY_RATIO , mouseY / DISPLAY_RATIO)
      rotate(text_angle)
      text(theText,0,0);
      pop();
      starting_points_array = text_to_points(text_points);
    } else{
      starting_points_array = [[]];
      beginShape();
      for (let p of text_points){
        starting_points_array[0].push( { 
          x: p.x + mouseX / DISPLAY_RATIO , 
          y: p.y + mouseY / DISPLAY_RATIO,
          alpha: p.alpha
        } );
        vertex(p.x + mouseX,p.y + mouseY)
      }
      endShape(CLOSE);
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

  if(FILL_TEXT && USE_TEXT){
    strokeWeight(2);
    beginShape();
    for(let c of text_fill_coords){
      vertex(c.x, c.y)
    }
    endShape(CLOSE);
  }

  if(USE_OUTLINE){
    strokeWeight(2);
    beginShape()
    strokeJoin(ROUND)
    for(let c of satin_outline){
      vertex(c.x, c.y)
    }
    endShape(CLOSE);

    stroke("blue")
    beginShape()
    for(let c of outline){
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

  mouse_clicked = createVector(mouseX, mouseY);
  print(`mouse clicked at X:${mouseX}, Y:${mouseY}`);

  
  let fillable_text_points = [];
  for(let i=0; i< theText.length; i++){
    fillable_text_points.push(theFont.textToPoints(theText[i], 0, 0, hoop.font, {
      sampleFactor: 0.1,  // Increase this value for higher resolution
      simplifyThreshold: 0  // You can adjust this to smooth out the points -> i think it removes colinear points which sucks
    }));
  }
  fillable_text_points = text_to_points(fillable_text_points);
  for(let character of fillable_text_points){
    text_fill_coords = text_fill_coords.concat(horizontal_fill(character));
  }

  for(let i=0; i<starting_points_array.length; i++){

    let first_runner_index = null;
    for(let j=0; j<starting_points_array[i].length; j++){
      const pos = createVector(starting_points_array[i][j].x, starting_points_array[i][j].y)

      // 1. angle both of these away from the core of the text (+ a bit randomly offset maybe)
      // 2. make the first one point to the previous point and the 2nd to the next
      let dir_out = ( PI * starting_points_array[i][j].alpha / 180 - 0.5*PI ) % (2*PI); 
      let point_out = p5.Vector.add(pos, p5.Vector.fromAngle(dir_out, 1));
      if(dst.pointInPolygon(point_out.x, point_out.y, starting_points_array[i], true)){
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
    
    //first i do the little line under it. to limit jumps i make them run back and forth
    // and im not doing it in a pretty way rn. thats why all the coords buffer stuff
    let coords_buffer = [];
    sections[0].embroider_under();
    while(sections.some(s => !s.embroidered_under)){
      coords_buffer = coords_buffer.concat(tendril_coords);
      coords_buffer = coords_buffer.concat(tendril_coords.reverse());
      tendril_coords = [];
      const dist_array = sections
        .filter(s => !s.embroidered_under)
        .map(s => s.pos.dist(coords_buffer[coords_buffer.length-1]));
      const next_dist = Math.min( ...dist_array );
      sections.find(s => !s.embroidered_under && s.pos.dist(coords_buffer[coords_buffer.length-1]) <= next_dist).embroider_under();
    }
    coords_buffer = coords_buffer.concat(tendril_coords);
    coords_buffer = coords_buffer.concat(tendril_coords.reverse());
    tendril_coords = [coords_buffer[0]];
    
    // now simplify array to flower step size. (which ive decided is leading on running stitch length)
    for(let i=1; i<coords_buffer.length-1;i++){
      if(tendril_coords[tendril_coords.length-1].dist(coords_buffer[i]) > FLOWER_STEP_SIZE ||
          abs(p5.Vector.sub(coords_buffer[i], tendril_coords[tendril_coords.length-1]).angleBetween(p5.Vector.sub(coords_buffer[i+1], coords_buffer[i]))) > 0.5 * PI
      ) tendril_coords.push(coords_buffer[i])
    }
    tendril_coords.push(coords_buffer[coords_buffer.length-1]);

    sections[0].embroider();
    while(sections.some(s => !s.embroidered)){
      const dist_array = sections
        .filter(s => !s.embroidered)
        .map(s => s.pos.dist(tendril_coords[tendril_coords.length-1]));
      const next_dist = Math.min( ...dist_array );
      sections.find(s => !s.embroidered && s.pos.dist(tendril_coords[tendril_coords.length-1]) <= next_dist).embroider();
    }

    let purges = 0
    // purge sections with too much overlap. i think its filtering way too much now
    // iteration order matters here. i think i wanna purge from the bottom up so the running stitches get taken down first since theyre the least important ones
    for(let i = 0; i < tendril_coords.length-1; i++){
      let intersections = 0;
      for(let j=0; j<tendril_coords.length-1; j++){
        if(i==j || i + 1 == j || i - j == 1 || i + 1 >= tendril_coords.length || tendril_coords[i].dist(tendril_coords[i+1]) > 100) continue;
        intersections += dst.findIntersection(tendril_coords[i], tendril_coords[i+1], tendril_coords[j], tendril_coords[j+1], false);
        if(intersections > 12){
          purges++
          tendril_coords.splice(i,2) // i think we throw out 2 coords. we gotta otherwise we create a worse thing.
          i--;
          break;
        }
      }
    }
    print(`purges: ${purges}`)
    
    tendril_coords.push("STOP")

    if(FILL_TEXT && USE_TEXT) tendril_coords = tendril_coords.concat(text_fill_coords)

    if(flowers.length>0) flowers[0].embroider();
    while(flowers.some(f => !f.embroidered)){
      const dist_array = flowers
        .filter(f => !f.embroidered)
        .map(f => f.steps[0].dist(tendril_coords[tendril_coords.length-1]));
      const next_dist = Math.min( ...dist_array );
      flowers.find(f => !f.embroidered && f.steps[0].dist(tendril_coords[tendril_coords.length-1]) <= next_dist).embroider();
    }
    
    // purge coords too close to the border or outside it
    const mrgn = USE_OUTLINE ? OUTLINE_WIDTH + OUTLINE_OFFSET : 0;
    tendril_coords = tendril_coords.filter(c => c == "STOP" || (c.x > mrgn && c.x < hoop.w - mrgn && c.y > mrgn && c.y < hoop.h - mrgn));

    if(USE_OUTLINE){

      // maybe this should actually be a convex hull instead of a regular outline. lol. nah whatever this looks good as fuck
      outline = dst.computeOutline(tendril_coords.filter((c) => c != "STOP"), OUTLINE_OFFSET, 10); // no clue what these should be
      satin_outline = dst.satinStitch(outline, 3, OUTLINE_WIDTH, true); // using default for now
      tendril_coords = tendril_coords.concat(satin_outline);
    }

    // add corners for automatic alignment
    tendril_coords = tendril_coords.concat([
      "STOP",
      createVector(1,1),
      createVector(hoop.w-1,1),
      createVector(hoop.w-1,hoop.h-1),
      createVector(1,hoop.h-1)
    ])

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
    let sections_per_flower = ${sections_per_flower};
    let flower_size_ratio = ${flower_size_ratio};
    let NOISE_OCTAVES = ${NOISE_OCTAVES};
    let NOISE_FALLOFF = ${NOISE_FALLOFF};
    let NOISE_SCALE = ${NOISE_SCALE};`;
    save([params], `otu_${timecode}.txt`)
    dst.export(tendril_coords,`otu_${timecode}`)

    save_receipt(timecode);
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
  if(key === ' '){
    if(isLooping()){
      noLoop()
    } else{
      loop()
    }
  }
}

function save_receipt(timecode){
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: [136.0, 400.0] //ts make no sense to me
      // format: [58.0, 58.0]
    });
    print(doc.getFontList())
    doc.setFont("Courier", '')
    doc.setFontSize(8)

    const receipt_image = createGraphics(200, 200 * hoop.h/hoop.w);
    receipt_image.background(255)
    receipt_image.image(tendril_graphics, 0, 0, 200, 200 *  hoop.h/hoop.w)
    receipt_image.stroke(0);
    receipt_image.strokeWeight(1);
    receipt_image.noFill();
    for(let flower of flowers){
      receipt_image.beginShape();
      for(let s of flower.steps){
        receipt_image.vertex(s.x *receipt_image.width / width, s.y *receipt_image.height / height)

      }
      receipt_image.endShape();
    }
    receipt_image.strokeJoin(ROUND)
    receipt_image.beginShape()
    print(satin_outline)
    for(let c of satin_outline){
      receipt_image.vertex(c.x *receipt_image.width / width, c.y *receipt_image.height / height)
    }
    receipt_image.endShape(CLOSE);
    // receipt_image.rect(0.5,1.5,receipt_image.width-2,receipt_image.height-3.5)
    receipt_image.filter(THRESHOLD)
    const img = receipt_image.elt.toDataURL("image/JPEG", 1.0);
    doc.text(
      [
        "---",
        `otu_${timecode}`,
      ],
      0,
      4
    )
    doc.addImage(img, "JPEG", 0, 9, 48, 48 * hoop.h/hoop.w);
    doc.text(
      [
        `noise_seed: ${noise_seed}`,
        `hoop_size: ${hoop_size.toUpperCase()}`,
        `start_coord: {${mouse_clicked.x}, ${mouse_clicked.y}}`,
        `image_input: ${filename}`,
        `nutrient_modifier: ${str(color_multiplier).slice(0,5)}`,
        "", "", "---"
      ],
      0,
      48 * hoop.h/hoop.w + 16
    )

    doc.save(`otu_${timecode}.pdf`);
}

function sample_nutrient_map(coord){
  if(coord.x < 0 || coord.x > hoop.w || coord.y < 0 || coord.y > hoop.h) {
    return -200;
  }

  //praying this wont kill performance:
  for(const poly of starting_points_array){
    if(dst.pointInPolygon(coord.x, coord.y, poly, true)){
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

  let multiplier = MULTIPLY_WITH_CONST ? color_multiplier : 1.0;

  if(isNaN(photo_sample)){
    debugger;
  }

  return noise_sample * falloff * photo_sample * multiplier;
}

function text_to_points(text_points_in){
  textSize(11);
  let points_out = []
  let x_cursor = 0;
  for(let i=0; i< text_points_in.length; i++){
    points_out.push([]);

    for(let j=0; j<text_points_in[i].length; j += 1){
      // also rotate text.
      let text_point = createVector(
        text_points_in[i][j].x + x_cursor - textWidth(theText) * hoop.font * 0.045, 
        text_points_in[i][j].y + hoop.font * 0.38);
      text_point.rotate(text_angle);
      
      points_out[i].push( { 
        x: text_point.x + mouseX / DISPLAY_RATIO , 
        y: text_point.y + mouseY / DISPLAY_RATIO,
        alpha: text_points_in[i][j].alpha
      } );
    }
    x_cursor +=  hoop.font * TEXT_SPACING * textWidth(theText[i]);
  }
  return points_out;
}

function horizontal_fill(polygon){
  // we are assumming a closed polygon which may consist of multiple sections?
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
    if(intersections.length == 0 || intersections.length % 2 != 0) continue;
    rows.push([])
    intersections.sort((a,b) => a.x - b.x);
    for(let i=0; i*2<intersections.length; i++){
      rows[rows.length-1].push([]);
      let left_or_right = (rows.length % 2 == 0) * 2 - 1;
      if(left_or_right > 0) rows[rows.length-1][i].push(intersections[i*2]);

      let x = (left_or_right > 0 ? intersections[i*2].x : intersections[i*2 + 1].x ) + left_or_right * FILL_STEP * (0.5 + random() * 0.5);
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
  return fill_coords;
}