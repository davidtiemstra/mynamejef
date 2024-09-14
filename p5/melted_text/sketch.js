// Generates melted text


// Selected font and text
let theFont;
let theText = 'r'
const fontSize = 80

// Contains text points
let textPoints = []


// Text input
let textField; 

// Button
let updateTextButton;

function preload(){
  theFont = loadFont('fonts/Avara-Black.otf')
}


let bottom;
let a = 1;
let v = 0;

function setup() {
  createCanvas(700, 700);
  
  textFont(theFont)
  textSize(fontSize)

  let ascent = textAscent();
  let descent = textDescent();
  bottom = ascent + descent;

  textPoints = theFont.textToPoints(theText, 0, 0, 80, {
    sampleFactor: 0.3,  // Increase this value for higher resolution
    simplifyThreshold: 0  // You can adjust this to smooth out the points
  });
  
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
  
  strokeWeight(1)
  stroke(0,0,255)
  beginShape()
    for (let p of textPoints){
      strokeWeight(1)
      stroke(255,0,0)

      
      let x = p.x
      let y = p.y

      let meltedPoint = meltPoint(x,y,v);
     
      let mult = 7
      vertex(meltedPoint.x, meltedPoint.y)
   
    }
  endShape()

  v += a;

}
function meltPoint(x, y, vy){
  if (y+vy <= bottom){
    y += vy
  }
  return createVector(x, y)
}
function keyPressed(){
  if (key == 'f'){

  }
}
function updateText(){
  theText = textField.value()
  textFont(theFont)
  textSize(fontSize)
  let ascent = textAscent();
  let descent = textDescent();
  bottom = ascent + descent;

  textPoints = theFont.textToPoints(theText, 0, 0, 80, {
    sampleFactor: 0.3,  // Increase this value for higher resolution
    simplifyThreshold: 0  // You can adjust this to smooth out the points
  });
}
