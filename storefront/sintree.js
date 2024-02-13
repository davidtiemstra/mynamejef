// const { createNoise2D } = require('simplex-noise');
import { createNoise3D } from "https://cdn.skypack.dev/simplex-noise@4.0.0";
import { aleaFactory } from 'https://cdn.jsdelivr.net/npm/alea-generator@1.0.0/+esm'

// const seed = 0.970508064049187; //provide your own seed
const seed = Math.round(Math.random()*10000); //generate random seed
console.log('seed: ' + seed);
document.getElementById('seed').innerHTML = seed;
const prng = aleaFactory(seed);
const noise = createNoise3D(prng.random);
const t0 = Date.now();

paper.install(window);

// window.onload = function() { // they say it wont work if i dont do this but idk
paper.setup('canvas'); // Create an empty project and a view for the canvas:

let ts = (Date.now()-t0)/1000;
let width, height, center;
let path = [];
let ground = new Path();
let thread = new Path();
let mousePos = view.center;
thread.strokeColor = "black";
ground.strokeColor = "black";

let noiseamp = 10;
let steps = 4230;
let noiseres = 0.008;
let trunkWidth = 40;
let xStep = trunkWidth/steps;
let period = 0.02
let noiseSpeed = 0.05;

let stDist = 10;
let embroideryScale = 3;

let buttons;
let paused = false;

view.scale(view.resolution/72);
initializePath();

function initializePath() {
    center = view.center;
    width = view.size.width;
    height = view.size.height;

    if(buttons){
        buttons.remove();
    }

    let pauseRect = new Shape.Rectangle({
        point: new Point(center.x-25, center.y+120),
        size: new Size(50,20),
        strokeColor: 'black',
        fillColor: 'white'
    });

    let pauseText = new PointText({
        point: new Point(center.x, center.y+133),
        fontFamily: 'serif',
        fillColor: "black",
        justification: 'center',
        content: "pause"
    });

    let pauseButton = new Group([pauseRect,pauseText]);

    let orderButton = pauseButton.clone();
    orderButton.copyAttributes(pauseButton);
    orderButton.position.y += 30;
    orderButton.lastChild.content = 'order';

    buttons = new Group([pauseButton, orderButton]);

    for(let i=0;i<buttons.children.length;i++){
        buttons.children[i].onMouseEnter = function(event){ this.firstChild.fillColor = 'black'; this.lastChild.fillColor = 'white';};
        buttons.children[i].onMouseLeave = function(event){ this.firstChild.fillColor = 'white'; this.lastChild.fillColor = 'black';};
        buttons.children[i].onMouseUp = function(event){ this.firstChild.fillColor = 'black'; this.lastChild.fillColor = 'white';};
        buttons.children[i].onMouseDown = function(event){this.firstChild.fillColor = 'white'; this.lastChild.fillColor = 'black';};
    }

    pauseButton.onMouseDown = function(event){
        this.firstChild.fillColor = 'white'; this.lastChild.fillColor = 'black';
        paused = !paused;
    };


    ground.segments = [];
    ground.add(
        new Point(center.x-trunkWidth*1.5, center.y),
        new Point(center.x+trunkWidth*1.5, center.y)
    );

    path = [];
    path.push({x:center.x-trunkWidth/2, y:center.y});
    for(let t=1; t<steps; t++){
        path.push({
            x:path[t-1].x + xStep,
            y:path[t-1].y + 3 * Math.cos(period * t)
        });
    }

    
    //generate spread stitches
    thread.segments = [];
    thread.add(new Point(center.x-trunkWidth/2, center.y));
    let a=0

    for(let t=1;t<steps;t++){
        //calculate distance w pythagoras bc im a dumb idiot
        let aDist = Math.sqrt((path[t].x - path[a].x)**2 + (path[t].y-path[a].y)**2);

        if(aDist>stDist){
            thread.add(new Point(
                Math.round(path[t].x), 
                Math.round(path[t].y)
            ));
            a=t;
        }
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
            if(n>=thread.segments.length){
                thread.add(new Point(center));
            }

            thread.segments[n].point.x = Math.round(path[t].x); 
            thread.segments[n].point.y = Math.round(path[t].y);
            a=t;
            n++;
        }
    }

    if(n<thread.segments.length){
        thread.segments = thread.segments.slice(0,n);
    }
    // for(let i=n; i<thread.segments.length; i++){
    //     thread.segments[i].point.x = center.x + 0.5*trunkWidth;
    //     thread.segments[i].point.y = center.y;
    // }
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

    if(!paused){
        ts += event.delta;
    }
    

    // if(event.count%60==0){
    //     console.log('avg fps: '+ (event.count/event.time));
    // }

    growIt();
    
}

view.onMouseMove = function(event) {
    mousePos = event.point;
}

view.onResize = function(event) {
    initializePath();
}

// }