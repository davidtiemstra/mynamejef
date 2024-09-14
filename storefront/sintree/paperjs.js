// im using paperjs in a regular js module instead of paperscript so i gotta remmber to:
// Register a handler for when the DOM is ready, since we cannot work with the canvas before that. (i think this is cap)
// Tell the paper object to setup a Project and a View for our canvas. Instead of passing the canvas object, we can also pass the canvas element's ID as a String. In PaperScript, this happens automatically through the canvas="ID" attribute.
// Access all Paper.js classes and objects through the paper object, since they are no longer global.
// Use Math functions instead of operators on Point and Size. eg point.divide(otherpoint)
// Draw the view at the end, since that is now only automatically handled when a view.onFrame handler is installed.

// const { createNoise2D } = require('simplex-noise');
import { createNoise2D } from "https://cdn.skypack.dev/simplex-noise@4.0.0";
import { aleaFactory } from 'https://cdn.jsdelivr.net/npm/alea-generator@1.0.0/+esm'

// const seed = 0.970508064049187; //provide your own seed
const seed = Math.round(Math.random()*10000); //generate random seed
console.log('seed: ' + seed);
const prng = aleaFactory(seed);
const noise2D = createNoise2D(prng.random);
const t0 = Date.now();

paper.install(window);
// window.onload = function() { // they say it wont work if i dont do this but idk
paper.setup('canvas'); // Create an empty project and a view for the canvas:

var ts = (Date.now()-t0)/1000;
var width, height, center;
var path = new Path();
var mousePos = view.center;
path.strokeColor = "black";

var framecount = 0;

var pointcount = 10000;

initializePath();

view.onFrame = function(event) {
    // path.segments[0].point = mousePos;
    ts = (Date.now()-t0)/1000;
    
    framecount++;
    if(ts>10){
        console.log(framecount)
        debugger
    }

    for(let i=0; i<path.segments.length; i++){
        //single oct fbm
        path.segments[i].point.y = (1.0 + 0.5*noise2D(ts, path.segments[i].point.x/100) + 0.25*noise2D(ts, path.segments[i].point.x/50)) * 0.5 * height;
    }
}

view.onMouseMove = function(event) {
    mousePos = event.point;
}

view.onResize = function(event) {
    initializePath();
}

function initializePath() {
    center = view.center;
    width = view.size.width;
    height = view.size.height;
    path.segments = [];
    // path.add(view.bounds.bottomLeft);
    for(let i=0; i<pointcount; i++){
        path.add(new Point(i*width/pointcount, (1.0 + noise2D(0, i*width/(pointcount * 100))) * 0.5 * height));
    }
}


// path.moveTo(start);
// // Note that the plus operator on Point objects does not work
// // in JavaScript. Instead, we need to call the add() function:
// path.lineTo(start.add([ 200, -50 ]));


function onMouseDown(event) {

}


// }