// Generates multiple jittery outlines for text


// Selected font and text
let theFont;
let theText = 'r'
const fontSize = 80

// Determines how many outlines will be generated
let numberOfLayers = 1;

// Contains text points
let textPoints = []
let distortedPoints = [];

// Noise parameters
let p1 = 10
let p2 = 10

// Noise offset and increment (increment determines the difference between each layer)
let off = 0
let offIncrement = 0.5



// Sliders
let p1Slider;
let p2Slider;
let offSlider;
let layerSlider;

// Text input
let textField; 

// Button
let updateTextButton;

// For playing with it with the mouse
const allowMouseInteraction = true
const mouseRadius = 50

function preload(){
  theFont = loadFont('fonts/Avara-Black.otf')
}

function setup() {
  createCanvas(700, 700);
  
  textFont(theFont)
  textSize(fontSize)

  textPoints = theFont.textToPoints(theText, 0, 0, 80, {
    sampleFactor: 0.3,  // Increase this value for higher resolution
    simplifyThreshold: 0  // You can adjust this to smooth out the points
  });
  

  p1Slider = createSlider(1,100,5,1);
  p2Slider = createSlider(1,100,5,1);
  offSlider = createSlider(0,2,0.1,0.01);
  layerSlider = createSlider(1,20,1,1);

  textField = createInput()
  textField.attribute('placeholder', 'text')

  updateTextButton = createButton('update text')
  updateTextButton.mousePressed(updateText)

}

function draw() {
  background(220,220,220);
  
  translate((width-textWidth(theText))/2, height/2)
  noFill()

  noCursor()
  circle(mouseX-(width-textWidth(theText))/2,mouseY-height/2,20)
  p1 = p1Slider.value()
  p2 = p2Slider.value()
  offIncrement = offSlider.value()
  numberOfLayers = layerSlider.value()
  
  off = 0
  distortedPoints = []
  for (let n = 0; n < numberOfLayers; n++){
    strokeWeight(1)
    stroke(0,0,255)
    beginShape()
    for (let p of textPoints){
      strokeWeight(1)
      stroke(255,0,0)
      let n1 = (noise(p.x/p2+off)-0.5) * p1
      let n2 = (noise(p.y/p2+off)-0.5) * p1
      
      let x = p.x + n1
      let y = p.y + n2

      if (allowMouseInteraction){
        let mx = (mouseX-(width-textWidth(theText))/2)
        let my = (mouseY-height/2)
        if (dist(p.x,p.y, mx, my)<mouseRadius){
   
            let weight = random(-0.1,0.1);

            let dx = (mx-p.x) * weight
            let dy = (my-p.y) * weight
            x += dx
            y += dy
        }
      }
      let mult = 7
      distortedPoints.push(createVector(mult*x,mult*y))
      vertex(x, y)
   
    }
    endShape()

    off += offIncrement
  }

}
function keyPressed(){
  if (key == 'f'){
    print(textPoints.length)
    print(distortedPoints.length)
    print(distortedPoints)
    dst.export(distortedPoints, 'test_test')
  }
}
function updateText(){
  theText = textField.value()
  textFont(theFont)
  textSize(fontSize)

  textPoints = theFont.textToPoints(theText, 0, 0, 80, {
    sampleFactor: 0.3,  // Increase this value for higher resolution
    simplifyThreshold: 0  // You can adjust this to smooth out the points
  });
}
