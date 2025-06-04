let runners = [];
let sections = [];

// hoop sizes expressed in du ( dst units: 1du = 0.1mm)
// these are from the manual. supposedly if we stay within that range they should read but needs testing.
const HOOP = {
  s:{
    w: 1000,
    h: 1000
  },
  l:{
    w:1800,
    h:1300
  }
}

function preload() {
  // load font
}

function setup() {
  // get starting runners from text

  // set all to convergent mode with eachother

}

function draw() {
  // step all runners (non parallel)

  // step all flowers?

  // export when all runners & flowers are dead

}