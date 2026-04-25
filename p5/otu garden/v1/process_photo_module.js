const PHOTO_NUMBER = 1;
const INIT_IMG_SCALE = 0.45;
const GRAB_SQUARE = 0.4;
const QUAD_SEGS = 10;
const OUTPUT_SIZE = 1000;

let pulling_vert = -1;

let corners = [];
let corners_on_screen = [];

let photo_input;
let photo_graphics;
let photo_canvas;

function load_image() {
  photo_input = loadImage(`../photos/${PHOTO_NUMBER}.jpg`)
}

function setup_photo_module(w, h) {
    photo_canvas = createCanvas(w, h);
    photo_canvas.mousePressed(start_drag_corner);
    photo_canvas.mouseReleased(releast_corner);
    photo_graphics = createGraphics(OUTPUT_SIZE * 0.5/GRAB_SQUARE, OUTPUT_SIZE* 0.5/GRAB_SQUARE, WEBGL);

    corners = [
        createVector(-INIT_IMG_SCALE,-INIT_IMG_SCALE),
        createVector(INIT_IMG_SCALE,-INIT_IMG_SCALE),
        createVector(INIT_IMG_SCALE,INIT_IMG_SCALE),
        createVector(-INIT_IMG_SCALE, INIT_IMG_SCALE)
    ];

    corners_on_screen = [
        createVector(-GRAB_SQUARE,-GRAB_SQUARE),
        createVector(GRAB_SQUARE,-GRAB_SQUARE),
        createVector(GRAB_SQUARE,GRAB_SQUARE),
        createVector(-GRAB_SQUARE, GRAB_SQUARE)
    ];
}

function draw_photo_module() {
    photo_graphics.background(0);

    if(pulling_vert > -1){
        let shift = createVector((mouseX - pmouseX) / photo_canvas.width, (mouseY - pmouseY) / height)
        corners[pulling_vert].add(shift);

        for(let i=0; i<4; i++){
            if(i==pulling_vert) continue;
            corners[i].add(p5.Vector.mult(shift, -0.1))
        }
    }

    photo_graphics.noStroke();
    photo_graphics.texture(photo_input);

    photo_graphics.quad(
        corners[0].x * min(photo_graphics.width,photo_graphics.height), 
        corners[0].y * min(photo_graphics.width,photo_graphics.height), 
        0,
        corners[1].x * min(photo_graphics.width,photo_graphics.height), 
        corners[1].y * min(photo_graphics.width,photo_graphics.height), 
        0,
        corners[2].x * min(photo_graphics.width,photo_graphics.height), 
        corners[2].y * min(photo_graphics.width,photo_graphics.height),
        0,
        corners[3].x * min(photo_graphics.width,photo_graphics.height), 
        corners[3].y * min(photo_graphics.width,photo_graphics.height),
        0,
        QUAD_SEGS,
        QUAD_SEGS
    );

    image(photo_graphics, 0, 0, width, height)
    
    fill(0,150);
    noStroke()
    rect(0,0,width,height*(0.5 - GRAB_SQUARE))
    rect(0,height*(0.5+GRAB_SQUARE),width,height*(0.5 - GRAB_SQUARE))
    rect(0,height*(0.5-GRAB_SQUARE),width*(0.5 - GRAB_SQUARE),height*2*GRAB_SQUARE)
    rect(width*(0.5+GRAB_SQUARE),height*(0.5-GRAB_SQUARE),width*(0.5 - GRAB_SQUARE),height*2*GRAB_SQUARE)

    noFill();
    stroke(255);
    rect(width*(0.5-GRAB_SQUARE),height*(0.5-GRAB_SQUARE),2*width*GRAB_SQUARE,2*height*GRAB_SQUARE)

    line(0.5*width, 0, 0.5*width, height)
    line(0, 0.5*height, width, 0.5*height)
}


function get_photo_map(){
    let g = createGraphics(OUTPUT_SIZE, OUTPUT_SIZE);
    g.image(
        photo_graphics, 
        (OUTPUT_SIZE - photo_graphics.width)*0.5, 
        (OUTPUT_SIZE - photo_graphics.height)*0.5,
        photo_graphics.width, photo_graphics.height);
    return g
}

function destroy_photo_module(){
    photo_canvas.remove()
}

function start_drag_corner() {
    if(mouseX < width*0.5 && mouseY < height*0.5){
        pulling_vert = 0;
    }
    else if(mouseX < width*0.5 && mouseY > height*0.5){
        pulling_vert = 3;
    }
    else if(mouseX > width*0.5 && mouseY < height*0.5){
        pulling_vert = 1;
    }
    else if(mouseX > width*0.5 && mouseY > height*0.5){
        pulling_vert = 2;
    }
}

function releast_corner(){
    pulling_vert = -1;
}