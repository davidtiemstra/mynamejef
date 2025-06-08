
class Flower {
  
  static generateUnitProfile(pointCount, maxWidth){
  
    let unitProfile = [];
  
    // start point
    unitProfile.push(createVector(0,0));
    
    let xPos = 0;
    for (let i = 0; i<pointCount; i++){
      
      // pick a random point between current xpos and end xpos
      let remaining = (0.7)-xPos
      let xStep = random(0.3*remaining, 0.8*remaining);
      xPos += xStep;
      
      //let yPos = noise(i/10)*maxWidth;
      let yPos = random(maxWidth*0.3, maxWidth);
      
      // add profile point
      unitProfile.push(createVector(xPos,yPos));
    }
    
    // add end point
    unitProfile.push(createVector(1, 0));
  
    return unitProfile
  }
  
  constructor(x, y, r, petalCount, iterationOffset, profile, rotation){
    
    this.origin = createVector(x,y);
    this.radius = r;
    
    
    this.profile = this.scaleProfile(profile);
    
    this.stepCount = 0;
    this.stepSize = FLOWER_STEP_SIZE;
    this.steps = [];
    this.currentPos = createVector(0, 0);
    this.currentDir = createVector(1,0);
    
    
    this.petalsLeft = petalCount;
    this.petalCount = petalCount;
    this.angleInc = TWO_PI/petalCount;
    this.currentAngle = 0;
    
    this.iterationsLeft = ITERATION_COUNT;
    this.iterationOffset = iterationOffset;
    
    this.returning = false;
    
    this.flowerComplete = false;

    this.rotation = rotation;
    
  }
  
  scaleProfile(profile){
    let scaledProfile = []
    for (let p of profile){
      let np = createVector(p.x*this.radius, p.y*this.radius);
      scaledProfile.push(np);
    }
    return scaledProfile
  }

  generateFlower(attraction, noiseSize) {
    let loops = 0;
    this.noiseSize = noiseSize;
    while (!this.flowerComplete && loops < 10000) {
      loops++;
      this.step(attraction, noiseSize);
      
    }
  }
  drawProfile () {
    
    push()
    translate(this.origin.x, this.origin.y)
    for (let p of this.profile) {
      
      stroke(255,0,0);
      strokeWeight(5);
      point(p.x,p.y);
    }
    
    noFill();
    stroke(255);
    strokeWeight(1);
    beginShape();
      for (let i =0; i<this.profile.length; i++){
        vertex(this.profile[i].x, this.profile[i].y);
      }
      for (let i =this.profile.length-1; i>=0; i--){
        vertex(this.profile[i].x, this.profile[i].y*-1);
      }
      
    endShape();
    pop()
  }
  
  step(attraction, noiseSize) {
    
    this.stepCount += 1;
    
    let newStep = this.currentPos.copy();
    // newStep.rotate(this.currentAngle);
    newStep.rotate(this.currentAngle + this.rotation);
    newStep.add(this.origin.x, this.origin.y);
    this.steps.push(newStep);
    
    // make deep copy
    let targetPoints = this.profile.map(v => v.copy());
    // let maxPoint = targetPoints[targetPoints.length-1].copy();
    
    if (!this.returning){
      // going out
      
      // disregard starting point:
      targetPoints.shift();
      
      // remove target points have passed (exclude max point)
      let threshold = 1;
      for (let i=targetPoints.length-1; i>=0; i--){
        if (targetPoints[i].x < this.currentPos.x+threshold && 
            targetPoints[i].x != this.radius){
          
          targetPoints.splice(i,1);
        }
      }
     
      // update currentDir based on target points
      this.updateDirection(targetPoints,attraction)
      
      let n = map(noise(this.stepCount), 0, 1, -1*noiseSize, noiseSize);
      this.currentDir.add(n);
      this.currentDir.mult(this.stepSize);
      if (this.currentDir.x <0){
        print("papu");
        // this.currentDir.mult(-1,1);
      }
      this.currentPos.add(this.currentDir);
      
      // switch direction if reached radius
      if(this.currentPos.x >= this.radius){
        this.currentDir.mult(-1,0);
        this.returning = true;
      }
      
    }else {
      // going back
      //print("returning");
      
      if(this.currentPos.mag() > this.stepSize){
        targetPoints.reverse();
        targetPoints.shift();
        for (let t of targetPoints){
          t.mult(1,-1);
        }

        let threshold = 1;
        for (let i=targetPoints.length-1; i>=0; i--){
          if (targetPoints[i].x > this.currentPos.x-threshold && 
              targetPoints[i].x != 0){

            targetPoints.splice(i,1);
          }
        }
        this.updateDirection(targetPoints,attraction);

        let n = map(noise(this.stepCount), 0, 1, -1*noiseSize, 1*noiseSize);
        this.currentDir.add(n);
        this.currentDir.mult(this.stepSize);
        
        // if (this.currentDir.x >0){
        //   print("pipo");
        //   this.currentDir.mult(0.5,1);
        // }
        
        this.currentPos.add(this.currentDir);
      }else {
        
        if (this.petalsLeft > 1){
          this.returning = false;
          this.currentDir = createVector(1,0);
          this.currentAngle += this.angleInc;
          this.petalsLeft -= 1;
        }else {
          
          if (this.iterationsLeft > 0){
            this.returning = false;
            this.currentDir = createVector(1,0);
            this.currentAngle = this.iterationsLeft*this.iterationOffset;
            this.petalsLeft = this.petalCount;
            this.iterationsLeft -= 1;
            print("next iteration");
          }else {
            // print("complete");
            this.flowerComplete = true;
          }
          
        }
        
      }
      
      
    }
    
  }
  updateDirection(tPoints,attraction){
    
    for (let t of tPoints){
        let force = p5.Vector.sub(t, this.currentPos);
        let distance = force.mag();
        let p = attraction;
        
        distance = max(distance, 20);
        
        force.normalize();
        force.div(distance);
        force.mult(p);
        force.mult(1.2,1);
        this.currentDir.add(force);
      }
    this.currentDir.normalize();
  }

  drawFlower(){
      
      beginShape();
      for(let s of this.steps){
        vertex(s.x * DISPLAY_RATIO, s.y * DISPLAY_RATIO)

      }
      endShape();
    
  }
  
  
}