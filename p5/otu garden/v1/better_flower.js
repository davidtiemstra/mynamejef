// new and improved better flower with a lot of parameters to fuck around with yay
// it works more or less like the previous one. you first generate dna with the static function 'generateUnitDNA()'
// this is the per plant flower dna to keep consistency between flowers in one plant
// then you create a flower like before and pass it the dna (as well as x,y, ,radius, rotation and petal count)
// path is stored in this.steps, outlines ar stored in this.outlineSteps
// density of the spiral fill is controlled by spiralSpacing

// flower shapes are changed by manipulating dna. (spine and edge are fun to mess with)

let spiralSpacing = 4.5; // Globally defined spacing for the spiral fill


class Flower {
  static generateUnitDNA() {
    return {
      lengthFactor: random(0.5, 0.95),
      curl: random(-1.2, 1.2),
      curlAccel: random(0.7, 2.6),
      bend: random(-0.25, 0.25),
      widthMaxFactor: random(0.04, 0.24),
      tipSharpness: random(1.0, 7.0),
      baseSharpness: random(1.0, 3.0),
      edgeNoiseAmp: random(0, 0.20),
      edgeNoiseFreq: random(1.5, 4.0),
      asym: random(-0.4, 0.4),
      spineWobble: random(0, 0.2),
      spineWobbleFreq: random(1.5, 4),
      tipCurl: random(0, 1.3),
      tipCurlRFactor: random(0, 0.10),
      tipCurlTurns: random(0, 1.0),
      tipCurlDir: random() < 0.5 ? 1 : -1,
      splitAmount: random() < 0.2 ? random(0.4, 0.7) : 0, 
      splitT: random(0.6, 0.85)
    };
  }

  constructor(cx, cy, radius, rotation, petalCount, dna) {
    this.cx = cx;
    this.cy = cy;
    this.radius = radius;
    this.rotation = rotation;
    this.petalCount = petalCount;
    this.baseDNA = dna;
    this.steps = [];
    this.outlineSteps = []; // Store relative steps for the outline

    this.generatePath();
  }

  jitterAndScaleDNA(dna) {
    let length = dna.lengthFactor * this.radius * random(0.85, 1.15);
    
    return {
      ...dna,
      length: length,
      widthMax: dna.widthMaxFactor * random(0.9, 1.1),
      curl: dna.curl + random(-0.15, 0.15),
      curlAccel: dna.curlAccel * random(0.92, 1.08),
      bend: dna.bend + random(-0.1, 0.1),
      tipSharpness: dna.tipSharpness * random(0.92, 1.08),
      baseSharpness: dna.baseSharpness * random(0.92, 1.08),
      edgeNoiseAmp: dna.edgeNoiseAmp * random(0.85, 1.15),
      asym: dna.asym + random(-0.1, 0.1),
      spineWobble: dna.spineWobble * random(0.8, 1.2),
      tipCurlR: dna.tipCurlRFactor * random(0.85, 1.15),
      tipCurlTurns: dna.tipCurlTurns * random(0.85, 1.15),
      seed: random(1000)
    };
  }

  generatePath() {
    let coreBaseR = random(this.radius * 0.1, this.radius * 0.16);
    let coreLobes = floor(random(3, 7));
    let coreLobeAmt = random(0.15, 0.4);
    let corePhase = random(TWO_PI);
    
    let coreR = (a) => {
      let aa = a - this.rotation; 
      let lobe = sin(aa * coreLobes + corePhase) * coreLobeAmt;
      let extra = sin(aa * (coreLobes + 1) * 1.3 + corePhase * 1.7) * coreLobeAmt * 0.4;
      return coreBaseR * (1 + lobe + extra);
    };

    let petalAngles = [];
    for (let i = 0; i < this.petalCount; i++) {
      petalAngles.push((i / this.petalCount) * TWO_PI + random(-0.18, 0.18));
    }
    
    petalAngles.sort((a, b) => a - b);
    let minGap = TWO_PI / this.petalCount * 0.55;
    
    for (let pass = 0; pass < 4; pass++) {
      for (let i = 0; i < this.petalCount; i++) {
        let j = (i + 1) % this.petalCount;
        let gap = petalAngles[j] - petalAngles[i];
        if (j === 0) gap += TWO_PI;
        if (gap < minGap) {
          let pushAmt = (minGap - gap) * 0.5;
          petalAngles[i] -= pushAmt;
          petalAngles[j] += pushAmt;
        }
      }
    }
    petalAngles.sort((a, b) => a - b);

    let petalSpecs = [];
    for (let i = 0; i < this.petalCount; i++) {
      let prev = (i - 1 + this.petalCount) % this.petalCount;
      let next = (i + 1) % this.petalCount;
      
      let gapPrev = (petalAngles[i] - petalAngles[prev] + TWO_PI) % TWO_PI;
      let gapNext = (petalAngles[next] - petalAngles[i] + TWO_PI) % TWO_PI;
      
      let smallest = min(gapPrev, gapNext);
      let p = this.jitterAndScaleDNA(this.baseDNA);
      
      p.angle = petalAngles[i] + this.rotation; 
      p.coreHalfWidth = min(smallest * 0.35, smallest * 0.25);
      petalSpecs.push(p);
    }

    let waypoints = [];
    let outlineWp = []; // Parallel array to store purely the outer perimeter
    let stalkTopA = HALF_PI + random(-0.2, 0.2) + this.rotation;
    let curArcA = stalkTopA;

    for (let i = 0; i < this.petalCount; i++) {
      let spec = petalSpecs[i];
      let entryA = spec.angle - spec.coreHalfWidth;
      let exitA = spec.angle + spec.coreHalfWidth;
      
      // Build core arcs for both main path and outline
      this.addCoreArc(waypoints, coreR, curArcA, entryA);
      this.addCoreArc(outlineWp, coreR, curArcA, entryA);

      let entry = { x: cos(entryA) * coreR(entryA), y: sin(entryA) * coreR(entryA) };
      let exit = { x: cos(exitA) * coreR(exitA), y: sin(exitA) * coreR(exitA) };
      
      // Generate both the complex interior spiral and the perimeter outline
      this.addPetal(waypoints, outlineWp, entry, exit, spec.angle, spec);
      curArcA = exitA;
    }
    
    this.addCoreArc(waypoints, coreR, curArcA, stalkTopA + TWO_PI);
    this.addCoreArc(outlineWp, coreR, curArcA, stalkTopA + TWO_PI);

    let prevWp = waypoints[waypoints.length - 1];
    let prevOutWp = outlineWp[outlineWp.length - 1];
    for (let s = 1; s <= 5; s++) {
      let t = s / 5;
      waypoints.push({ x: lerp(prevWp.x, 0, t), y: lerp(prevWp.y, 0, t) }); 
      outlineWp.push({ x: lerp(prevOutWp.x, 0, t), y: lerp(prevOutWp.y, 0, t) }); 
    }

    // Process drift/noise on both paths
    this.steps = this.walkPath(waypoints, FLOWER_STEP_SIZE);
    this.outlineSteps = this.walkPath(outlineWp, FLOWER_STEP_SIZE);
  }


  addPetal(wp, outlineWp, entry, exit, centerA, spec) {
    let originX = (entry.x + exit.x) * 0.5;
    let originY = (entry.y + exit.y) * 0.5;

    let spine = this.buildSpine(originX, originY, centerA, spec);

    let pA = 1 / spec.baseSharpness;
    let pB = 1 / spec.tipSharpness;
    let peakT = pA / (pA + pB);
    let peakVal = pow(peakT, pA) * pow(1 - peakT, pB);
    let maxW = (spec.widthMax * spec.length) / peakVal;

    let n = spine.length;
    let tipMergeT = 0.85;

    let baseWidths = [];
    let trueMaxW = 0;
    
    for (let i = 0; i < n; i++) {
      let t = spine[i].t;
      let w = pow(t, pA) * pow(1 - t, pB) * maxW;
      w *= 1 + (noise(t * spec.edgeNoiseFreq + spec.seed) - 0.5) * spec.edgeNoiseAmp * 2;

      if (t > tipMergeT) {
        let u = (t - tipMergeT) / (1 - tipMergeT);
        w *= 1 - u * u * (3 - 2 * u);
      } else if (t < 0.05) {
        let u = t / 0.05;
        w *= u * u * (3 - 2 * u);
      }
      
      baseWidths.push(w);
      if (w > trueMaxW) trueMaxW = w;
    }

    // --- GENERATE PERIMETER OUTLINE ---
    let leftEdge = [];
    let rightEdge = [];
    for (let i = 0; i < n; i++) {
      let s = spine[i];
      let baseW = baseWidths[i];
      let wL = baseW * (1 - spec.asym * 0.4);
      let wR = baseW * (1 + spec.asym * 0.4);
      let perpA = s.heading + HALF_PI;
      leftEdge.push({ x: s.x + cos(perpA) * wL, y: s.y + sin(perpA) * wL });
      rightEdge.push({ x: s.x - cos(perpA) * wR, y: s.y - sin(perpA) * wR });
    }

    this.rampToPoint(outlineWp, entry, leftEdge[0], 3);
    for (let p of leftEdge) outlineWp.push(p);

    let tipPt = spine[n - 1];
    if (spec.tipCurl > 0.2) this.addTipCurl(outlineWp, tipPt, tipPt.heading, spec);

    for (let i = rightEdge.length - 1; i >= 0; i--) outlineWp.push(rightEdge[i]);
    this.rampToPoint(outlineWp, rightEdge[0], exit, 3);

    // --- GENERATE SPIRAL FILL ---
    let passes = Math.ceil(trueMaxW / (spiralSpacing / 2));
    passes = Math.max(2, passes);
    if (passes % 2 !== 0) passes++; 

    let petalWp = [];

    for (let pass = 0; pass < passes; pass++) {
      let isUp = (pass % 2 === 0);
      let isLeft = isUp;
      
      let startIdx = isUp ? 0 : n - 1;
      let endIdx = isUp ? n - 1 : 0;
      let stepDir = isUp ? 1 : -1;

      for (let i = startIdx; isUp ? i <= endIdx : i >= endIdx; i += stepDir) {
        let s = spine[i];
        let baseW = baseWidths[i];
        let asymMod = isLeft ? (1 - spec.asym * 0.4) : (1 + spec.asym * 0.4);
        let fullW = baseW * asymMod;

        let passProgress = isUp ? (i / (n - 1)) : ((n - 1 - i) / (n - 1));
        let currentOffset = (pass + passProgress) * (spiralSpacing / 2);

        let actualW = fullW - currentOffset;
        if (actualW < 0) actualW = 0; 

        let perpA = s.heading + HALF_PI;
        let dir = isLeft ? 1 : -1;
        
        petalWp.push({ 
          x: s.x + cos(perpA) * actualW * dir, 
          y: s.y + sin(perpA) * actualW * dir 
        });

        if (pass === 0 && i === endIdx && spec.tipCurl > 0.2) {
          this.addTipCurl(petalWp, s, s.heading, spec);
        }
      }
    }

    this.rampToPoint(wp, entry, petalWp[0], 3);
    for (let p of petalWp) wp.push(p);
    this.rampToPoint(wp, petalWp[petalWp.length - 1], exit, 3);
  }

  addTipCurl(wp, tipPt, tipHeading, spec) {
    let curlR = spec.length * spec.tipCurlR;
    let dir = spec.tipCurlDir;
    let centerOffsetA = tipHeading + dir * 0.2;
    let curlCx = tipPt.x + cos(centerOffsetA) * curlR * 0.8;
    let curlCy = tipPt.y + sin(centerOffsetA) * curlR * 0.8;
    
    let startA = atan2(tipPt.y - curlCy, tipPt.x - curlCx);
    let turns = spec.tipCurlTurns;
    let n = max(8, floor(turns * 14));
    
    for (let s = 1; s <= n; s++) {
      let t = s / n;
      let a = startA + t * TWO_PI * turns * dir;
      let r = curlR * (1 - t * 0.15);
      wp.push({ x: curlCx + cos(a) * r, y: curlCy + sin(a) * r });
    }
  }

  buildSpine(originX, originY, centerA, spec) {
    let n = 40;
    let spine = [];
    let stepDist = spec.length / n;
    
    for (let i = 0; i <= n; i++) {
      let t = i / n;
      let dirA = centerA + spec.bend + spec.curl * pow(t, spec.curlAccel);
      dirA += (noise(t * spec.spineWobbleFreq, spec.seed * 0.1) - 0.5) * 2 * spec.spineWobble;
      
      if (i === 0) {
        spine.push({ x: originX, y: originY, t, heading: centerA + spec.bend });
      } else {
        let prev = spine[i - 1];
        let x = prev.x + cos(dirA) * stepDist;
        let y = prev.y + sin(dirA) * stepDist;
        spine.push({ x, y, t, heading: atan2(y - prev.y, x - prev.x) });
      }
    }
    return spine;
  }

  rampToPoint(wp, from, to, n) {
    for (let i = 1; i <= n; i++) {
      let t = i / n;
      wp.push({ x: lerp(from.x, to.x, t), y: lerp(from.y, to.y, t) });
    }
  }

  addCoreArc(waypoints, coreR, a0, a1) {
    while (a1 < a0) a1 += TWO_PI;
    let totalA = a1 - a0;
    let samples = max(6, floor(totalA * 12));
    
    for (let s = 1; s <= samples; s++) {
      let a = a0 + (s / samples) * totalA;
      let r = coreR(a);
      waypoints.push({ x: cos(a) * r, y: sin(a) * r }); 
    }
  }

  walkPath(waypoints, FLOWER_STEP_SIZE) {
    let pts = [];
    let len = waypoints.length;
    if (len < 2) return waypoints.slice();
    
    let driftFreq = 0.025;
    let driftAmp = FLOWER_STEP_SIZE * 0.18;
    let driftSeed = random(1000);

    let segIdx = 0;
    let posOnSeg = 0;
    pts.push({ x: waypoints[0].x, y: waypoints[0].y });
    
    let stepIdx = 1;
    let safety = 0;
    let curSegLen = this.segLen(waypoints, 0);

    while (segIdx < len - 1 && safety++ < 200000) {
      let remaining = FLOWER_STEP_SIZE;
      let curX, curY;
      
      while (remaining > 0 && segIdx < len - 1) {
        let leftOnSeg = curSegLen - posOnSeg;
        if (leftOnSeg >= remaining) {
          posOnSeg += remaining;
          let t = posOnSeg / curSegLen;
          curX = lerp(waypoints[segIdx].x, waypoints[segIdx + 1].x, t);
          curY = lerp(waypoints[segIdx].y, waypoints[segIdx + 1].y, t);
          remaining = 0;
        } else {
          remaining -= leftOnSeg;
          segIdx++;
          posOnSeg = 0;
          if (segIdx < len - 1) {
            curX = waypoints[segIdx].x;
            curY = waypoints[segIdx].y;
            curSegLen = this.segLen(waypoints, segIdx);
          }
        }
      }
      
      if (remaining > 0) break;

      let prev = pts[pts.length - 1];
      let dx = curX - prev.x;
      let dy = curY - prev.y;
      let d = sqrt(dx * dx + dy * dy);
      
      if (d > 0.0001) {
        let drift = (noise(stepIdx * driftFreq, driftSeed) - 0.5) * 2 * driftAmp;
        curX += (-dy / d) * drift;
        curY += (dx / d) * drift;
      }
      
      pts.push({ x: curX, y: curY });
      stepIdx++;
    }
    return pts;
  }

  segLen(wp, i) {
    let dx = wp[i + 1].x - wp[i].x;
    let dy = wp[i + 1].y - wp[i].y;
    return sqrt(dx * dx + dy * dy);
  }
}