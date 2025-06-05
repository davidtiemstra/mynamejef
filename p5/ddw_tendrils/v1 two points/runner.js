class runner {
  constructor(x, y, dir, thickness){
    this.live = true;

    this.id = runners.length;
    this.pos = createVector(x,y);
    this.dir = dir;
    this.thickness = thickness;

    this.last_sections = [];

    this.converging = false;
    this.converge_path = [];
    this.converge_complete = false;
    this.converge_partner = null;
  }
  
  scan(){
    if(this.converging){
        if(this.converge_complete){
            return;
        }

        this.pos = this.converge_path.shift();

        if(this.converge_path.length == 0){
            const partner = runners[this.converge_partner];
            if(partner.converge_complete){
                this.step();
                partner.step();
                this.live = false;
                partner.live = false;
                runners.push(new runner(
                    0.5 * (this.pos.x + partner.pos.x),
                    0.5 * (this.pos.y + partner.pos.y),
                    this.dir,
                    (this.thickness + partner.thickness) * 0.9
                ));
                runners[runners.length - 1].last_sections = [this.last_sections[0], partner.last_sections[0]];
                return;
            }
            else{
                this.step();
                this.converge_complete = true;
                return;
            }
        }

        this.dir = p5.Vector.sub(this.converge_path[0], this.pos).heading();

        return;
    }

    // scan for nutrients

    // decide converge/diverge/step

    // if step -> shift direction
    const max_angle = Math.atan(STEP_SIZE / this.thickness);

    // set temporary test angle
    this.dir = (this.dir + (noise(this.id*100, frameCount)-0.5) * max_angle) % (2*PI);
    
    // move position
    this.pos.add(p5.Vector.fromAngle(this.dir, STEP_SIZE));
  }

  step(){
    // dont do shit if its waiting
    if(this.converging && this.converge_complete){
        return;
    }

    //process nutrients
        // evaluate nutrient map at new pos
        // change thickness accordingly
    this.thickness -= THICKNESS_FALLOFF;

    if(this.thickness < 2){
        this.live = false;
        return;
    }

    // push section
    sections.push(new section(this.pos.copy(), this.dir, this.thickness));
    for(const section of this.last_sections){
        sections[section].next = sections.length-1;
    }
    this.last_sections = [sections.length - 1];
    
    const p0 = p5.Vector.add(this.pos, p5.Vector.fromAngle(this.dir, this.thickness*0.5).rotate(0.5*PI));
    const p1 = p5.Vector.add(this.pos, p5.Vector.fromAngle(this.dir, this.thickness*0.5).rotate(-0.5*PI));
    line(
        DISPLAY_RATIO * p0.x,
        DISPLAY_RATIO * p0.y,
        DISPLAY_RATIO * p1.x,
        DISPLAY_RATIO * p1.y
    );
  }

  // convergence path calculation is handled by the runner that initializes the convergence.
  computeConverge(partner_id){
    const partner = runners[partner_id];

    // start computing the actual path :( ahhhh
    let avg_dir = 0.5 * (this.dir + partner.dir);
    if(Math.abs(avg_dir - this.dir) > 0.25*PI){
        avg_dir = (avg_dir + PI) % (2*PI)
    } // literally just getting the avg angle is already hacked lmaoo

    let check_pos = createVector(
        0.5 * (this.pos.x + partner.pos.x),
        0.5 * (this.pos.y + partner.pos.y)
    );

    // just retry finding it until its got smth ok
    let path_length = Infinity;
    let path1_length = 0;
    let path2_length = 0;
    while(check_pos.dist(this.pos) < 100){
        check_pos.add(p5.Vector.fromAngle(avg_dir, STEP_SIZE));

        //temp debugging
        // circle(DISPLAY_RATIO * check_pos.x,DISPLAY_RATIO * check_pos.y,2)

        // now compute bezier towards goal for both
        let path1 = [];
        let path2 = [];
        for(let handle_length = 20; handle_length < 150; handle_length += 10){
            if(!path1.length) path1 = this.get_bezier(check_pos, avg_dir, handle_length);
            if(!path2.length) path2 = partner.get_bezier(check_pos, avg_dir, handle_length);
        }
        if(!path1.length || !path2.length) continue;

        path1_length = 0;
        path2_length = 0;
        for(let i=1; i < path1.length; i++){
            path1_length += p5.Vector.dist(path1[i], path1[i-1]);
        }
        for(let i=1; i < path2.length; i++){
            path2_length += p5.Vector.dist(path2[i], path2[i-1]);
        }
        
        if(path1 + path2 > path_length){
            break;
        } 
        
        this.converge_path = path1;
        partner.converge_path = path2;

        path_length = path1 + path2;
    }

    print(`final path_lengths: ${path1_length}, ${path2_length}`);
    
    // do the pathfinding again but for offset positions.
    let path1a = [];
    let path2a = [];
    for(let handle_length = 20; handle_length < 250; handle_length += 10){
        if(!path1a.length) path1a = this.get_bezier(
            p5.Vector.add(check_pos, p5.Vector.fromAngle(avg_dir + 0.5*PI, this.thickness*0.4)), 
            avg_dir, handle_length);
        if(!path2a.length) path2a = partner.get_bezier(
            p5.Vector.add(check_pos, p5.Vector.fromAngle(avg_dir - 0.5*PI, partner.thickness*0.4)), 
            avg_dir, handle_length);
    }
    let path1b = [];
    let path2b = [];
    for(let handle_length = 20; handle_length < 250; handle_length += 10){
        if(!path1b.length) path1b = this.get_bezier(
            p5.Vector.add(check_pos, p5.Vector.fromAngle(avg_dir - 0.5*PI, this.thickness*0.4)), 
            avg_dir, handle_length);
        if(!path2b.length) path2b = partner.get_bezier(
            p5.Vector.add(check_pos, p5.Vector.fromAngle(avg_dir + 0.5*PI, partner.thickness*0.4)), 
            avg_dir, handle_length);
    }
    
    let pathA_length = 0;
    let pathB_length = 0;
    for(let i=1; i < path1a.length; i++){
        pathA_length += p5.Vector.dist(path1a[i], path1a[i-1]);
    }
    for(let i=1; i < path2a.length; i++){
        pathA_length += p5.Vector.dist(path2a[i], path2a[i-1]);
    }
    for(let i=1; i < path1b.length; i++){
        pathB_length += p5.Vector.dist(path1b[i], path1b[i-1]);
    }
    for(let i=1; i < path2b.length; i++){
        pathB_length += p5.Vector.dist(path2b[i], path2b[i-1]);
    }

    if(pathA_length < pathB_length && path1a.length && path2a.length){
        this.converge_path = path1a;
        partner.converge_path = path2a;
    } else {
        this.converge_path = path1b;
        partner.converge_path = path2b;
    }

    // have a failsafe mechanism in case it couldnt find shit.
    if(this.converge_path.length > 0){
        this.converging = true;
        this.converge_partner = partner_id;
        this.converge_complete = false;
        partner.converging = true;
        partner.converge_partner = this.id;
        partner.converge_complete = false;
    } else{
        print("failed to match convergence")
    }


  }

  diverge(){

  }


  get_bezier(target_pos, target_dir, handle_length){
    const max_angle = Math.atan(STEP_SIZE / this.thickness);

    const p0 = this.pos;
    const p1 = p5.Vector.add(this.pos, p5.Vector.fromAngle(this.dir, handle_length));
    const p2 = p5.Vector.add(target_pos, p5.Vector.fromAngle((target_dir + PI) % (2*PI), handle_length));
    const p3 = target_pos;

    const bezier_array = [];
    let t = 0;
    while(t < 1){
        const sample_length = this.sample_bezier(t, p0, p1, p2, p3).dist(this.sample_bezier(t + 0.1, p0, p1, p2, p3));
        t += 0.1 * STEP_SIZE / sample_length;

        bezier_array.push(this.sample_bezier(t, p0, p1, p2, p3));
        
        // do a convoluted check to make sure its not breaking the minimum angle shit
        const i = bezier_array.length - 1;
        if(i < 2) continue

        const dir1 = p5.Vector.sub(bezier_array[i-1], bezier_array[i-2])
        const dir2 = p5.Vector.sub(bezier_array[i], bezier_array[i-1])
        if(Math.abs(dir1.angleBetween(dir2)) > max_angle * 2){
            return [];
        }
    }

    return bezier_array;
  }

  sample_bezier(t, p0, p1, p2, p3){
    return createVector(
        Math.pow(1 - t,3) * p0.x + 
        3 * Math.pow(1 - t, 2) * t * p1.x +
        3 * (1 - t) * Math.pow(t, 2) * p2.x + 
        Math.pow(t, 3) * p3.x,
        Math.pow(1 - t,3) * p0.y + 
        3 * Math.pow(1 - t, 2) * t * p1.y +
        3 * (1 - t) * Math.pow(t, 2) * p2.y + 
        Math.pow(t, 3) * p3.y
    )
  }

}