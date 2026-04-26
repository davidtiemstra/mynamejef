const FABRICS = [
    "wool",
    "cotton",
    "linen",
    "silk",
    "synthetic"
];
let fabric_inputs = [];

let phase = 0;
let uncropped_photo;
let cropped_photo;
let filename;

let input_phase_done = false;

function preload() {
  photo_input = loadImage(`../photos/${PHOTO_NUMBER}.jpg`)
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
                setup_photo_module(500, 500);
                phase = 1;
            }
            break;
        case 1:
            draw_photo_module();
            if(input_phase_done && cropped_photo != null){
                phase = 2;
                destroy_input_module();
                setup_generator_module();
            }
            break;
        case 2:
            draw_generator_module();
    }
}

function setup_generator_module(){
    createCanvas(400,400);
}

function draw_generator_module(){
    image(cropped_photo, 0, 0, width, height)
}