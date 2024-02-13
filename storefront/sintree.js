// const { createNoise2D } = require('simplex-noise');
import { createNoise3D } from "https://cdn.skypack.dev/simplex-noise@4.0.0";
import { aleaFactory } from 'https://cdn.jsdelivr.net/npm/alea-generator@1.0.0/+esm'

// const seed = 0.970508064049187; //provide your own seed
const seed = Math.round(Math.random()*10000); //generate random seed
console.log('seed: ' + seed);
const prng = aleaFactory(seed);
const noise = createNoise3D(prng.random);
const t0 = Date.now();

paper.install(window);
// window.onload = function() { // they say it wont work if i dont do this but idk
paper.setup('canvas'); // Create an empty project and a view for the canvas:

let ts = (Date.now()-t0)/1000;
let width, height, center;
let path = new Path();
let ground = new Path();
let mousePos = view.center;
path.strokeColor = "black";
ground.strokeColor = "black";

let noiseamp = 10;
let steps = 4230;
let noiseres = 0.008;
let trunkWidth = 40;
let xStep = trunkWidth/steps;
let period = 0.02
let noiseSpeed = 0.05;


initializePath();

function initializePath() {
    center = view.center;
    width = view.size.width;
    height = view.size.height;

    ground.segments = [];
    ground.add(
        new Point(center.x-trunkWidth*2, center.y),
        new Point(center.x+trunkWidth*2, center.y)
    );

    path.segments = [];
    path.add(new Point(center.x-trunkWidth/2, center.y));
    for(let t=1; t<steps; t++){
        path.add(new Point(
            path.segments[t-1].point.x + xStep,
            path.segments[t-1].point.y + 3 * Math.cos(period * t)
        ));
    }

    growIt();
}

function growIt(){
    
    let tadjust = 0;

    for(let t=1; t<steps; t++){

        let fieldtype = 'fbm8';
        let fieldval;

        const PI = Math.PI;
    
        if(t%((2/period)*PI) > (1/period)*PI){
        fieldtype = 'noise';
        }
        
        if(t%((1/period)*PI)>(0.5/period)*PI && tadjust < t-1){
        tadjust += 2
        fieldval = sampleField(path.segments[t-tadjust].point.x, path.segments[t-tadjust].point.y, fieldtype);
        fieldval = {x:-1*fieldval.x, y:-1*fieldval.y};
        }
        
        else{
        tadjust = 0;
        fieldval = sampleField(path.segments[t-1].point.x, path.segments[t-1].point.y, fieldtype);
        }

        path.segments[t].point.x = path.segments[t-1].point.x + xStep +                    (0.8 * Math.abs(Math.sin(period * t))**2 + 0.2)  * fieldval.x;
        path.segments[t].point.y = path.segments[t-1].point.y + 3 * Math.cos(period * t) + (0.8 * Math.abs(Math.sin(period * t))**2 + 0.2)  * fieldval.y;
    }
}

function sampleField(x,y,fieldtype){
  
    //perlin normal
    if(fieldtype=='noise'){
      return {
        x: noise(x*noiseres,     y*noiseres, ts*noiseSpeed) * noiseamp,
        y: noise(x*noiseres+100, y*noiseres, ts*noiseSpeed) * noiseamp
      }
    }
    
    //fractional brownian motion perlin noise (put oct count at end of string)
    if(fieldtype.substring(0, 3)=='fbm'){
      
      let value = {x:0,y:0}
      
      for(let i=1;i<parseInt(fieldtype[3])+1;i++){
        value = {
          x: value.x + (1/(1+i))* noise(x*noiseres*i,     y*noiseres*i, ts*noiseSpeed) * noiseamp,
          y: value.y + (1/(1+i))* noise(x*noiseres*i+100, y*noiseres*i, ts*noiseSpeed) * noiseamp
        }
      }
      
      return value
    }
    
    //image texture (placeholder)
    if(fieldtype=='img'){
      return {
        x: 0,
        y: 0
      }
    }
    
  }

view.onFrame = function(event) {
    ts = (Date.now()-t0)/1000;
    growIt();
    
}

view.onMouseMove = function(event) {
    mousePos = event.point;
}

view.onResize = function(event) {
    initializePath();
}


// path.moveTo(start);
// // Note that the plus operator on Point objects does not work
// // in JavaScript. Instead, we need to call the add() function:
// path.lineTo(start.add([ 200, -50 ]));


function onMouseDown(event) {

}


// }