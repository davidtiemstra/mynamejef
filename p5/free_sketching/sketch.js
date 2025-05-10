/* 
ok so the idea here is i wanna just be able to draw monochrome embroidery with the mouse quickly and if its nice i can expand it a bit.
eventually i wanna add more tools and things.
ideally the tools will be in separate scripts in the helpers folder and integrated with this one for testing and free sketching.
also gonna host this online.

features to add:
- display stitches that are slightly offscreen
- undo
- satin stitch tool
- paint bucket fills?

*/



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

// embroidery settings
let fabric_color = "white"
let thread_color = "black"
let stitch_dist = 10;

//ui settings
let toolwindow_size = 200;
let scale_markers_width = 28;
let scale_markers_spacing = 25;
let offset_speed = 50;
let line_spacing = 16

// my monitor is 1960du tall displaying 1080 px so to display at 1:1 irl i can use ratio 1px = 1.81du display ratio
let display_ratio = 0.55;


let ui_bg_color = 200;

// store coords as p5.Vector objects
let coords = [];


let display_hoop;

let view_offset;
let view_scale = 1;

let rescale = true;
let redraw_stitches = true;


//--------------------------

// function preload(){
//   // potentially we can load existing files. ideally dsts or some intermediate format thats easier to parse.
//   // thats a stretch goal though
// }

function setup() {
  reloadDisplayHoop();

  toolwindow_size = max(60, min(windowWidth - 10 - display_hoop.l.w, 240))
  createCanvas(display_hoop.l.w + toolwindow_size + scale_markers_width * 2, display_hoop.l.h + scale_markers_width * 2);
  
  background(fabric_color);

  view_offset = createVector(0,0);
}

function draw() {
  // -------- INTERACTIVITY ---------

  // RUNNING STITCH
  if(mouseIsPressed){
    const mouse_stitch = transformMouseToStitchSpace(mouseX,mouseY);
    if(mouse_stitch?.dist(coords[coords.length-1]) > stitch_dist){
      coords.push(mouse_stitch);
      drawNewStitch();
    }
  }

  // -------- VIEW CONTROLS ------
  if(keyIsDown(UP_ARROW) || keyIsDown(87)){
    view_offset.y = round(max(0, view_offset.y - offset_speed/view_scale));
    rescale = true;
  }
  if(keyIsDown(DOWN_ARROW) || keyIsDown(83)){
    view_offset.y = round(min((1-1/view_scale)*HOOP.l.h, view_offset.y + offset_speed/view_scale))
    rescale = true;
  }
  if(keyIsDown(RIGHT_ARROW) || keyIsDown(68)){
    view_offset.x = round(min((1-1/view_scale)*HOOP.l.w, view_offset.x + offset_speed/view_scale))
    rescale = true;
  }
  if(keyIsDown(LEFT_ARROW) || keyIsDown(65)){
    view_offset.x = round(max(0, view_offset.x - offset_speed/view_scale))
    rescale = true;
  }


  // ------ DRAWING STUFF ---------
  
  // coord markers get redrawn when moving or scaling
  if(rescale){
    noStroke();
    fill(ui_bg_color);
    rect(toolwindow_size, 0, width - toolwindow_size, height);

    noFill();
    stroke(0);

    for(let x = 0; x <= HOOP.l.w; x += scale_markers_spacing ){
      const realX = transformStitchToScreenSpace(createVector(x, view_offset.y + 1))?.x; //refactor if this gives a performance hit when zooming
      if(realX){
        const fifth = x % (5*scale_markers_spacing) == 0;
        if(fifth){
          fill(0)
          noStroke()
          text(x, realX+2, scale_markers_width-10);
          text(x, realX+2, height - 5);
          stroke(0)
          noFill()
        }
        line(realX, scale_markers_width * (fifth ? 0.25 : 0.75), realX, scale_markers_width)
        line(realX, height - scale_markers_width * (fifth ? 0.25 : 0.75), realX, height - scale_markers_width)
      }
    }

    for(let y = 0; y <= HOOP.l.h; y += scale_markers_spacing ){
      const realY = transformStitchToScreenSpace(createVector(view_offset.x+1, y))?.y; //refactor if this gives a performance hit when zooming
      if(realY){
        const fifth = y % (5*scale_markers_spacing) == 0;
        if(fifth){
          fill(0)
          noStroke()
          text(y, toolwindow_size, realY + 14)
          text(y, width - scale_markers_width +2, realY + 14)
          stroke(0)
          noFill()
        }
        line(toolwindow_size + scale_markers_width * (fifth ? 0.25 : 0.75), realY, toolwindow_size + scale_markers_width, realY)
        line(width - scale_markers_width * (fifth ? 0.25 : 0.75), realY, width - scale_markers_width, realY)
      }
    }

    rescale = false;
    redraw_stitches = true; //this is just in case i missed it somewhere lol
  }
  
  // ui gets redrawn every frame
  noStroke();
  fill(ui_bg_color);
  rect(0,0,toolwindow_size,height);
  // configurable settings:
  // -stitch distance
  // -fabric and thread colors
  // -stitch tool (running, satin, etc)
  fill(0);
  noStroke();
  let lineHeight = 4
  text(`Stitch distance: ${stitch_dist}`, 10, lineHeight += line_spacing)
  text(`Stitch count: ${coords.length}`, 10, lineHeight += line_spacing)
  text(`View scale: ${view_scale}`, 10, lineHeight += line_spacing)
  text(`View offset: ${ceil(view_offset.x)}, ${ceil(view_offset.y)}`, 10, lineHeight += line_spacing)
  text('Fabric color:', 10, lineHeight += line_spacing)
  stroke(0)
  fill(fabric_color)
  rect(toolwindow_size-100, lineHeight-8, 10, 10)
  noStroke()
  fill(0)
  text('Thread color:', 10, lineHeight += line_spacing)
  stroke(0)
  fill(thread_color)
  rect(toolwindow_size-100, lineHeight-8, 10, 10)
  noStroke()
  fill(0)

  lineHeight += 32;

  text('LMB to draw stitches', 10, lineHeight += line_spacing)
  text('Drag mouse to create running stitch', 10, lineHeight += line_spacing)
  text('SHIFT + scroll to set stitch distance', 10, lineHeight += line_spacing)
  text('Scroll to zoom', 10, lineHeight += line_spacing)
  text('WASD or arrow keys to pan', 10, lineHeight += line_spacing)
  text('E to exprt as .dst', 10, lineHeight += line_spacing)


  
  // ok so. i think when drawing normally i do not want to reload the whole work every frame, only when doing actions that neccessitate it:
  // - zooming/panning
  // - undoing
  // - color resets

  if(redraw_stitches){
    fill(fabric_color)
    stroke(0)
    rect(toolwindow_size + scale_markers_width, scale_markers_width, display_hoop.l.w, display_hoop.l.h);

    noFill()
    stroke(100)
    const small_corner = transformStitchToScreenSpace(createVector(HOOP.s.w, HOOP.s.h), true);
    rect(toolwindow_size + scale_markers_width, scale_markers_width, 
      min(small_corner.x-toolwindow_size - scale_markers_width, display_hoop.l.w), 
      min(small_corner.y - scale_markers_width, display_hoop.l.h))

    stroke(thread_color);

    beginShape();
    for(coord of coords){
      const screenspace_coord = transformStitchToScreenSpace(coord);
      if(screenspace_coord){
        vertex(screenspace_coord.x, screenspace_coord.y);
      }
      else{
        endShape();
        beginShape();
      }
    }
    endShape();

    redraw_stitches = false;
  }

}

// ------ INTERACTIVITY FUNCTIONS -------


function mousePressed(){
  // RUNNING STITCH
  const new_coord = transformMouseToStitchSpace(mouseX, mouseY)
  if(new_coord !== null){
    coords.push(new_coord);
    drawNewStitch();
  }
}

function mouseWheel(event) {
  if(keyIsDown(SHIFT)){
    stitch_dist = max(1, stitch_dist + Math.sign(-event.delta))
  }
  else{
    view_scale = max(1, view_scale * (1 + 0.1 * Math.sign(-event.delta)) )

    if(view_scale>25){
      scale_markers_spacing = 1;
    }
    else if(view_scale > 7.5){
      scale_markers_spacing = 5;
    }
    else if(view_scale > 2){
      scale_markers_spacing = 10;
    }
    else{
      scale_markers_spacing = 25
    }

    const mouse_coord = transformMouseToStitchSpace(mouseX, mouseY)
    if(mouse_coord !== null){
      view_offset.add(p5.Vector.sub(mouse_coord, view_offset).mult( 0.1 * Math.sign(-event.delta) ) )
    }
    
    view_offset.y = round(max(0,min((1-1/view_scale)*HOOP.l.h, view_offset.y)))
    view_offset.x = round(max(0,min((1-1/view_scale)*HOOP.l.w, view_offset.x)))

    rescale = true;
  }
}

function keyPressed(){
  if(key === 'e' || key === 'E'){
    dst.export(coords,"sketch")
  }
}



// ------ HELPERS FUNCTIONS -------

function transformStitchToScreenSpace(coord, allow_edge = false){ //allow edge is an ugly thing and should be purged.
  const screenspace_coord = p5.Vector.sub(coord,view_offset).mult(view_scale * display_ratio);
  if(allow_edge || ( screenspace_coord.x >= 0 && screenspace_coord.y >= 0 && screenspace_coord.x <= display_hoop.l.w && screenspace_coord.y <= display_hoop.l.h)){
    return createVector(screenspace_coord.x + toolwindow_size + scale_markers_width, screenspace_coord.y + scale_markers_width);
  }
  return null;
}

function transformMouseToStitchSpace(x, y){
  if(x < toolwindow_size + scale_markers_width || x > width - scale_markers_width - view_scale*0.5 || y < scale_markers_width || y > height - scale_markers_width - view_scale*0.5){
    return null;
  }
  return createVector(
    round(( x - toolwindow_size - scale_markers_width ) / (view_scale * display_ratio) + view_offset.x),
    round(( y - scale_markers_width ) / (view_scale * display_ratio) + view_offset.y)
  )
}

function drawNewStitch(){
  if(coords.length < 2){
    return
  }

  stroke(thread_color);
  const pmin1 = transformStitchToScreenSpace(coords[coords.length-2], true);
  const p0 = transformStitchToScreenSpace(coords[coords.length-1])
  line(pmin1.x, pmin1.y, p0.x, p0.y);
}

function reloadDisplayHoop(){
  display_hoop = {
    s:{
      w: ceil(display_ratio * HOOP.s.w),
      h: ceil(display_ratio * HOOP.s.h)
    },
    l:{
      w: ceil(display_ratio * HOOP.l.w),
      h: ceil(display_ratio * HOOP.l.h)
    }
  }
}