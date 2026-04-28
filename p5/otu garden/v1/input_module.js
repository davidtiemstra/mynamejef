const x_0 = 220;
const x_1 = 240;
const y_0 = 50;
const y_1 = 160;
const y_margin = 30;

let input_canvas;
let uncropped_file_input;
let cropped_file_input;
let no_file_input;
let uncropped_file;
let cropped_file;
let hoop_size_input;
let next_phase_button;

let fabric_inputs = [];

function setup_input_module(){
    input_canvas = createCanvas(500,500);
    textAlign(RIGHT, TOP)
    uncropped_file_input = createFileInput((file) => uncropped_file = handle_file(file));
    uncropped_file_input.position(x_1, y_0);
    text("Upload uncropped photo", x_0, y_0 + 5)
    cropped_file_input = createFileInput((file) => cropped_file = handle_file(file));
    cropped_file_input.position(x_1, y_0 + y_margin);
    text("Upload cropped photo", x_0, y_0 + y_margin + 5)
    no_file_input = createSlider(0, 255, 127);
    no_file_input.position(x_1, y_0 + y_margin*2)
    no_file_input.size(255);
    text("Use constant value instead of photo", x_0, y_0 + y_margin*2 + 5)

    for(let i=0; i<FABRICS.length; i++){
        fabric_inputs.push(createInput());
        fabric_inputs[fabric_inputs.length - 1].position(x_1, y_1 + i*y_margin)
        text(`fabric % ${FABRICS[i]}`, x_0, y_1 + i*y_margin + 5)
    }

    hoop_size_input = createInput();
    hoop_size_input.position(x_1, y_1 + (FABRICS.length+1)*y_margin)
    text("Hoop size (S or L):", x_0, y_1 + (FABRICS.length+1)*y_margin + 5)

    next_phase_button = createButton('Continue');
    next_phase_button.position(x_1, y_1 + (FABRICS.length+3)*y_margin)
    next_phase_button.mousePressed(finalize_inputs); 
}

function draw_input_module(){
    if(cropped_file && cropped_file.width > 0 && !cropped_photo){
        cropped_photo = update_image(cropped_file)
    }
    if(uncropped_file && uncropped_file.width > 0 && !uncropped_photo){
        uncropped_photo = update_image(uncropped_file)
    }
}

function finalize_inputs(){
    if(fabric_inputs.find((i) => i.value() != "" && isNaN(parseFloat(i.value()))) || !["s", "S", "l", "L"].includes(hoop_size_input.value()[0])) {
        print("invalid inputs")
        return;
    }


    fabric_composition = fabric_inputs.map((i) => parseFloat(i.value()));
    hoop_size = hoop_size_input.value()[0].toLowerCase();
    hoop = HOOP[hoop_size];

    if(!cropped_photo && !uncropped_photo){
        no_photo_mode = true;
        cropped_photo = createGraphics(hoop.w, hoop.h)
        cropped_photo.background(no_file_input.value());
    }

    input_phase_done = true;
}

function destroy_input_module(){
    textAlign(LEFT, BOTTOM);
    input_canvas.remove()
    next_phase_button.remove();
    uncropped_file_input.remove();
    cropped_file_input.remove();
    hoop_size_input.remove();
    no_file_input.remove();
    for(let fabric_input of fabric_inputs){
        fabric_input.remove()
    }
}

function handle_file(file_in){
    let file_out;
    if (file_in.type === 'image') {
        file_out = createImg(file_in.data, '');
        file_out.hide();
        filename = file_in.name
        if(filename.slice(0,8) == "CROPPED_" && ["s", "S", "l", "L"].includes(filename[8])){
            hoop_size_input.value(filename[8])
        }
    } else {
        file_out = null;
    }
    return file_out;
}

function update_image(image_in){
    let image_out = createGraphics(image_in.width, image_in.height);
    image_out.image(image_in, 0, 0, image_out.width, image_out.height);
    return image_out;
}