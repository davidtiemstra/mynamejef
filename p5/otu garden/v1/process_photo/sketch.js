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

        // // i had a whole theory why this would perfectly solve displacement 
        // // but it fucking sucks
        // // i think maybe i could make it work by combining it with the projections and weighing it based on that? 
        // // idk fuck thiis like so much work and its worse than the dumbass correction i started with so whatever
        // let i = pulling_vert;
        // let c1_old = p5.Vector.sub(corners[i], shift);
        // let c01 = p5.Vector.sub(c1_old, corners[(i+3)%4])
        // let hor_shift = p5.Vector.normalize(c01).mult(shift.dot(c01))
        // let c21 = p5.Vector.sub(c1_old, corners[(i+1)%4])
        // let ver_shift = p5.Vector.normalize(c21).mult(shift.dot(c21))
        
        // corners[(i+3)%4].sub(p5.Vector.mult(ver_shift, 0.2  * pow(p5.Vector.sub(corners_on_screen[(i+3)%4], corners[(i+3)%4]).mag(), 2.0)))
        // corners[(i+1)%4].sub(p5.Vector.mult(hor_shift, 0.2  * pow(p5.Vector.sub(corners_on_screen[(i+1)%4], corners[(i+1)%4]).mag(), 2.0)))
        // corners[(i+2)%4].sub(p5.Vector.mult(ver_shift, 0.2  * pow(p5.Vector.sub(corners_on_screen[(i+2)%4], corners[(i+2)%4]).mag(), 2.0)))
        // corners[(i+2)%4].sub(p5.Vector.mult(hor_shift, 0.2  * pow(p5.Vector.sub(corners_on_screen[(i+2)%4], corners[(i+2)%4]).mag(), 2.0)))

        for(let i=0; i<4; i++){
            if(i==pulling_vert) continue;
            corners[i].add(p5.Vector.mult(shift, -0.1))
        }
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