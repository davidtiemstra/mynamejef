const PHOTO_NUMBER = 1;
const INIT_IMG_SCALE = 0.45;
const GRAB_SQUARE = 0.4;
const QUAD_SEGS = 10;
const OUTPUT_SIZE = 1000;

let pulling_vert = -1;

let corners = [];
let corners_on_screen = [];

let photo_input;
let photo_canvas;

function preload() {
  photo_input = loadImage(`../photos/${PHOTO_NUMBER}.jpg`)
}

function setup() {
    createCanvas(600,600);
    photo_canvas = createGraphics(OUTPUT_SIZE * 0.5/GRAB_SQUARE, OUTPUT_SIZE* 0.5/GRAB_SQUARE, WEBGL);

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

function draw() {
    photo_canvas.background(0);

    if(pulling_vert > -1){
        let shift = createVector((mouseX - pmouseX) / width, (mouseY - pmouseY) / height)
        corners[pulling_vert].add(shift);

        // for(let i=0; i<4; i++){
        //     // it would be rly nice if i can apply an offset to the other corners 
        //     // so the aligned points stay more or less in place
            
        //     // i think it should be like mirrored around the point idk
        //     // fuck ts complicated i need to draw it.
        //     // also the adjustments are gonna like fuck with eachother sooo idk man.

        //     if(i==pulling_vert) continue;
        //     let diff = p5.Vector.sub(corners_on_screen[i],corners[pulling_vert])
        //     corners[i].add(p5.Vector.mult(p5.Vector.mult(shift, diff), 0.1))
        // }
    }

    photo_canvas.noStroke();
    photo_canvas.texture(photo_input);

    photo_canvas.quad(
        corners[0].x * min(photo_canvas.width,photo_canvas.height), 
        corners[0].y * min(photo_canvas.width,photo_canvas.height), 
        0,
        corners[1].x * min(photo_canvas.width,photo_canvas.height), 
        corners[1].y * min(photo_canvas.width,photo_canvas.height), 
        0,
        corners[2].x * min(photo_canvas.width,photo_canvas.height), 
        corners[2].y * min(photo_canvas.width,photo_canvas.height),
        0,
        corners[3].x * min(photo_canvas.width,photo_canvas.height), 
        corners[3].y * min(photo_canvas.width,photo_canvas.height),
        0,
        QUAD_SEGS,
        QUAD_SEGS
    );

    image(photo_canvas, 0, 0, width, height)
    
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

function keyPressed() {
    if(key == " "){
        let g = createGraphics(OUTPUT_SIZE, OUTPUT_SIZE);
        g.image(
            photo_canvas, 
            (OUTPUT_SIZE - photo_canvas.width)*0.5, 
            (OUTPUT_SIZE - photo_canvas.height)*0.5,
            photo_canvas.width, photo_canvas.height);
        g.save(`${PHOTO_NUMBER}_processed.jpg`)
    }
}

function mousePressed() {
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

function mouseReleased(){
    pulling_vert = -1;
}