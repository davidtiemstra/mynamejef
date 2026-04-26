const PHOTO_NUMBER = 1;
const INIT_IMG_SCALE = 0.45;
const GRAB_SQUARE = 0.4;
const QUAD_SEGS = 10;
const OUTPUT_HEIGHT = 1000;
let output_size;

let pulling_vert = -1;

let corners = [];
// let corners_on_screen = [];

let photo_graphics;
let photo_canvas;
let finish_crop_button;

function setup_photo_module(w, h) {
    output_size = createVector(OUTPUT_HEIGHT * hoop.w/hoop.h, OUTPUT_HEIGHT)
    photo_canvas = createCanvas(w, h);
    photo_canvas.mousePressed(start_drag_corner);
    photo_canvas.mouseReleased(release_corner);
    photo_graphics = createGraphics(output_size.x * 0.5/GRAB_SQUARE, output_size.y* 0.5/GRAB_SQUARE, WEBGL);
    finish_crop_button = createButton('Next phase');
    // button.position(0, 100);
    finish_crop_button.mousePressed(get_photo_map);

    corners = [
        createVector(-INIT_IMG_SCALE,-INIT_IMG_SCALE),
        createVector(INIT_IMG_SCALE,-INIT_IMG_SCALE),
        createVector(INIT_IMG_SCALE,INIT_IMG_SCALE),
        createVector(-INIT_IMG_SCALE, INIT_IMG_SCALE)
    ];

    // corners_on_screen = [
    //     createVector(-GRAB_SQUARE,-GRAB_SQUARE),
    //     createVector(GRAB_SQUARE,-GRAB_SQUARE),
    //     createVector(GRAB_SQUARE,GRAB_SQUARE),
    //     createVector(-GRAB_SQUARE, GRAB_SQUARE)
    // ];

    loop();
}

function draw_photo_module() {
    photo_graphics.background(0);
    
    if(pulling_vert > -1){
        let shift = createVector((mouseX - pmouseX) / photo_canvas.width, (mouseY - pmouseY) / photo_canvas.height)
        corners[pulling_vert].add(shift);

        for(let i=0; i<4; i++){
            if(i==pulling_vert) continue;
            corners[i].add(p5.Vector.mult(shift, -0.1))

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

        }
    }

    photo_graphics.noStroke();
    photo_graphics.texture(uncropped_photo);

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

    image(photo_graphics, 0, 0, photo_canvas.width, photo_canvas.height)
    
    fill(0,150);
    noStroke()
    rect(0,0,photo_canvas.width,photo_canvas.height*(0.5 - GRAB_SQUARE))
    rect(0,photo_canvas.height*(0.5+GRAB_SQUARE),photo_canvas.width,photo_canvas.height*(0.5 - GRAB_SQUARE))
    rect(0,photo_canvas.height*(0.5-GRAB_SQUARE),photo_canvas.width*(0.5 - GRAB_SQUARE),photo_canvas.height*2*GRAB_SQUARE)
    rect(photo_canvas.width*(0.5+GRAB_SQUARE),photo_canvas.height*(0.5-GRAB_SQUARE),photo_canvas.width*(0.5 - GRAB_SQUARE),photo_canvas.height*2*GRAB_SQUARE)

    noFill();
    stroke(255);
    rect(photo_canvas.width*(0.5-GRAB_SQUARE),photo_canvas.height*(0.5-GRAB_SQUARE),2*photo_canvas.width*GRAB_SQUARE,2*photo_canvas.height*GRAB_SQUARE)

    line(0.5*photo_canvas.width, 0, 0.5*photo_canvas.width, photo_canvas.height)
    line(0, 0.5*photo_canvas.height, photo_canvas.width, 0.5*photo_canvas.height)
}


function get_photo_map(){
    let g = createGraphics(output_size.x, output_size.y);
    g.image(
        photo_graphics, 
        (output_size.x - photo_graphics.width)*0.5, 
        (output_size.y - photo_graphics.height)*0.5,
        photo_graphics.width, photo_graphics.height);
    g.save(`CROPPED_${hoop_size.toUpperCase()}_${filename}`) // so u dont gotaa recrop it
    cropped_photo = g;
}

function destroy_photo_module(){
    photo_canvas.remove();
    finish_crop_button.remove();
}

function start_drag_corner() {
    if(mouseX < photo_canvas.width*0.5 && mouseY < photo_canvas.height*0.5){
        pulling_vert = 0;
    }
    else if(mouseX < photo_canvas.width*0.5 && mouseY > photo_canvas.height*0.5){
        pulling_vert = 3;
    }
    else if(mouseX > photo_canvas.width*0.5 && mouseY < photo_canvas.height*0.5){
        pulling_vert = 1;
    }
    else if(mouseX > photo_canvas.width*0.5 && mouseY > photo_canvas.height*0.5){
        pulling_vert = 2;
    }
}

function release_corner(){
    pulling_vert = -1;
}