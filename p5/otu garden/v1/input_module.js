const x_0 = 160;
const x_1 = 180;
const y_0 = 50;
const y_1 = 130;
const y_margin = 30;

let input_canvas;
let uncropped_file_input;
let cropped_file_input;
let hoop_size_input;
let next_phase_button;

let fabric_inputs = [];

function setup_input_module(){
    input_canvas = createCanvas(500,500);
    textAlign(RIGHT, TOP)
    uncropped_file_input = createFileInput((file) => uncropped_photo = handle_file(file));
    uncropped_file_input.position(x_1, y_0);
    text("Upload uncropped photo", x_0, y_0 + 5)
    cropped_file_input = createFileInput((file) => cropped_photo = handle_file(file));
    cropped_file_input.position(x_1, y_0 + y_margin);
    text("Upload cropped photo", x_0, y_0 + y_margin + 5)

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
    return;
}

function finalize_inputs(){
    if(fabric_inputs.find((i) => i.value() != "" && isNaN(parseFloat(i.value()))) || (!cropped_photo && !uncropped_photo) || !["s", "S", "l", "L"].includes(hoop_size_input.value()[0])) {
        print("invalid inputs")
        return;
    }

    fabric_composition = fabric_inputs.map((i) => parseFloat(i.value()));
    hoop_size = hoop_size_input.value()[0].toLowerCase();
    hoop = HOOP[hoop_size];
    input_phase_done = true;
}

function destroy_input_module(){
    textAlign(LEFT, BOTTOM);
    input_canvas.remove()
    next_phase_button.remove();
    uncropped_file_input.remove();
    cropped_file_input.remove();
    hoop_size_input.remove();
    for(let fabric_input of fabric_inputs){
        fabric_input.remove()
    }
}

function handle_file(file_in){
    let file_out
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