const FABRICS = [
    "wool",
    "cotton",
    "linen",
    "silk",
    "synthetic"
];
let fabric_composition = [];

let phase = 0;
let uncropped_photo;
let cropped_photo;
let filename;
let hoop_size = "s";

const DISPLAY_RATIO = 1;
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
                setup_photo_module(hoop.w * DISPLAY_RATIO, hoop.h * DISPLAY_RATIO);
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
    createCanvas(hoop.w * DISPLAY_RATIO, hoop.h * DISPLAY_RATIO);
}

function draw_generator_module(){
    image(cropped_photo, 0, 0, width, height)
}