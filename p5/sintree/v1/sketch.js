// p5 version of sintree because i forgot how paperjs works


// const seed = 0.970508064049187; // provide your own seed
let seed = Math.round(Math.random()*10000); // generate random seed
console.log('seed: ' + seed);
// document.getElementById('seed').innerHTML = seed;
const t0 = Date.now();

let center;
let path = [];
let ground = [];
let thread = [];
let mousePos;

let noiseamp = 30;
let steps = 4230;
let noiseres = 0.008;
let trunkWidth = 40;
let xStep = trunkWidth/steps;
let period = 0.02
let noiseSpeed = 0.15;

let embroideryScale = 2.5;
let stDist = 20/embroideryScale;

let buttons;
let paused = false;

// view.scale(view.resolution/72);

function setup() {
    noiseSeed(seed)
    pixelDensity(1)
    createCanvas(800, 800)
    initializePath();
}

function draw(){
    growIt();

    background(255);
    stroke(0); noFill();

    beginShape();
    for(let p of ground){
        vertex(p.x, p.y)
    }
    endShape();

    // beginShape();
    // for(let p of path){
    //     vertex(p.x, p.y)
    // }
    // endShape();
    
    beginShape();
    for(let p of thread){
        vertex(p.x, p.y)
    }
    endShape();

    fill(0); noStroke();
    text("[P]ause, [N]ew seed, [E]xport", 5, 15)
}

function initializePath() {
    center = createVector(width/2, height/2);

    // ground.segments = [];
    for(let x = center.x-trunkWidth*1.5; x <center.x+trunkWidth*1.5; x += stDist){
        ground.push(createVector(x, center.y));
    }
    ground.push(createVector(center.x+trunkWidth*1.5, center.y));

    path = [];
    path.push(createVector(center.x-trunkWidth/2, center.y));
    for(let t=1; t<steps; t++){
        path.push(createVector(
            path[t-1].x + xStep,
            path[t-1].y + 3 * Math.cos(period * t)
        ));
    }

    //generate spread stitches
    // thread.segments = [];
    thread.push(createVector(center.x-trunkWidth/2, center.y));
    let a=0

    for(let t=1;t<steps;t++){
        //calculate distance w pythagoras bc im a dumb idiot
        let aDist = Math.sqrt((path[t].x - path[a].x)**2 + (path[t].y-path[a].y)**2);

        if(aDist>stDist){
            thread.push(createVector(
                Math.round(path[t].x), 
                Math.round(path[t].y)
            ));
            a=t;
        }
    }
}

function growIt(){
    let tadjust = 0;

    for(let t=1; t<steps; t++){

        let fieldtype = 'fbm8';
        let fieldval;

        const PI = Math.PI;
    
        if(t%((2/period)*PI) > (1/period)*PI){
        fieldtype = 'fbm2';
        }
        
        if(t%((1/period)*PI)>(0.5/period)*PI && tadjust < t-1){
        tadjust += 2
        fieldval = sampleField(path[t-tadjust].x, path[t-tadjust].y, fieldtype);
        fieldval = {x:-1*fieldval.x, y:-1*fieldval.y};
        }
        
        else{
        tadjust = 0;
        fieldval = sampleField(path[t-1].x, path[t-1].y, fieldtype);
        }

        path[t].x = path[t-1].x + xStep +                    (0.8 * Math.abs(Math.sin(period * t))**2 + 0.2)  * fieldval.x;
        path[t].y = path[t-1].y + 3 * Math.cos(period * t) + (0.8 * Math.abs(Math.sin(period * t))**2 + 0.2)  * fieldval.y;
    }


    //spread stitches
    let a=0;
    let n=1;
    for(let t=1;t<steps;t++){
        //calculate distance w pythagoras bc im a dumb idiot
        let aDist = Math.sqrt((path[t].x - path[a].x)**2 + (path[t].y-path[a].y)**2);
        
        if(aDist>stDist){
            if(n>=thread.length){
                thread.push(center.copy());
            }

            thread[n].x = Math.round(path[t].x); 
            thread[n].y = Math.round(path[t].y);
            a=t;
            n++;
        }
    }

    if(n<thread.length){
        thread = thread.slice(0,n);
    }
    // for(let i=n; i<thread.segments.length; i++){
    //     thread.segments[i].point.x = center.x + 0.5*trunkWidth;
    //     thread.segments[i].point.y = center.y;
    // }
}

function sampleField(x,y,fieldtype){
  
    //perlin normal
    if(fieldtype=='noise'){
      return createVector(
        (noise(x*noiseres,     y*noiseres, millis()*0.001*noiseSpeed) * 2 - 1) * noiseamp,
        (noise(x*noiseres+100, y*noiseres, millis()*0.001*noiseSpeed) * 2 - 1) * noiseamp
      )
    }
    
    //fractional brownian motion perlin noise (put oct count at end of string)
    if(fieldtype.substring(0, 3)=='fbm'){
      
      let value = createVector(0,0)
      
      for(let i=1;i<parseInt(fieldtype[3])+1;i++){
        value = createVector(
          value.x + (1/(1+i))* (noise(x*noiseres*i,     y*noiseres*i, millis()*0.001*noiseSpeed) * 2 - 1) * noiseamp,
          value.y + (1/(1+i))* (noise(x*noiseres*i+100, y*noiseres*i, millis()*0.001*noiseSpeed) * 2 - 1) * noiseamp
        )
      }
      
      return value;
    }
    
    //image texture (placeholder)
    if(fieldtype=='img'){
      return createVector(0,0);
    }
    
}

function mouseClicked(){
    
}

function keyPressed(){
    if(key === 'p' || key === 'P'){
        isLooping() ? noLoop() : loop();
    }
    if(key === 'e' || key === 'E'){
        dst.export(thread.concat(ground).map(c => p5.Vector.mult(c, embroideryScale)), "sintree");
    }
    if(key == 'n' || key == 'N'){
        seed = Math.round(Math.random()*10000);
        noiseSeed(seed)
        console.log(seed)
    }
}