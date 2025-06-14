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

    this.age = 0;

    this.step();
  }
  
  scan(){
    // print(`scanning runner ${this.id}`)

    // CONVERGE STEP
    if(this.converging){
        this.converge_step();
        return;
    }

    // scan for nutrients in a fan.
    const max_angle = Math.atan(STEP_SIZE / this.thickness);

    let scan_results = [];

    for(let alpha = this.dir - max_angle; alpha <= this.dir + max_angle; alpha += SCAN_ANGULAR_RESOLUTION){
        let this_scan = {
            alpha: alpha,
            nutrient_samples: [],
            nutrient_total: 0,
            intersections: 0
        };

        // sample nutrient map at distances
        for(let r = SCAN_RADIAL_RESOLUTION; r <= SCAN_DISTANCE; r += SCAN_RADIAL_RESOLUTION){
            const sample_coord = p5.Vector.add(this.pos, p5.Vector.fromAngle( alpha, r));
            this_scan.nutrient_samples.push( sample_nutrient_map(sample_coord) );
        }
        this_scan.nutrient_total = this_scan.nutrient_samples.reduce((acc, current) => acc + current);

        // find intersections. big performance hit try to improve.
        // get sections from index:
        let sections_by_index = [];

        const xi = Math.floor(this.pos.x / IX_HALF_SQUARE_SIZE);
        const yi = Math.floor(this.pos.y / IX_HALF_SQUARE_SIZE);

        sections_by_index = sections_by_index.concat(ix_sections[xi][yi]);
        if(xi>0) sections_by_index = sections_by_index.concat(ix_sections[xi-1][yi]);
        if(yi>0) sections_by_index = sections_by_index.concat(ix_sections[xi][yi-1]);
        if(xi>0 && yi>0) sections_by_index = sections_by_index.concat(ix_sections[xi-1][yi-1]);

        sections_by_index = [...new Set(sections_by_index)];

        const p1 = p5.Vector.add(this.pos, p5.Vector.fromAngle(alpha, SCAN_DISTANCE));
        for(const section_id of sections_by_index){
            const section = sections[section_id];
            if(!section) {continue;}
            if(!this.last_sections.includes(section_id) && section.pos.dist(this.pos) - section.thickness > SCAN_DISTANCE) continue;

            //line segment intersection check
            this_scan.intersections += runner.find_intersection(this.pos, p1, section.p0, section.p1)
        }

        scan_results.push(this_scan);
    }
    // calculate total scores based on nutrients - intersections
    const scan_totals = scan_results.map(s => s.nutrient_total - s.intersections * INTERSECTION_PENALTY * scan_results[0].nutrient_samples.length);

    // if its shit: try converging:
    if( frameCount > 50 && this.age > 10 && !scan_totals.some(t => t > MINIMUM_NUTRIENTS)){
        // print(`trying converge in the field!`)
        for(const runner of runners){
            if (runner.id != this.id && runner.live && !runner.converging && runner.pos.dist(this.pos) < MAX_CONVERGE_DISTANCE){
                this.compute_converge(runner.id);
                if(this.converging){
                    print(`successful converge!!!!`)
                    return;
                }
            }
        }
    }

    // if thick & theres two good options diverge
    if(this.thickness > DIVERGENCE_MINIMUM_THICKNESS && scan_totals.filter(t => t > DIVERGENCE_MINIMUM_NUTRIENTS * scan_results[0].nutrient_samples.length).length > 1){
        // i can already find both or trust them to find them themselves after spawning.
        // lets hope that works for now
        this.pos.add(p5.Vector.fromAngle(this.dir, STEP_SIZE));

        // const dir1 = scan_results.splice(runner.index_of_max(scan_totals), 1)[0].alpha;
        // scan_totals.splice(runner.index_of_max(scan_totals));
        // const dir2 = scan_results.splice(runner.index_of_max(scan_totals), 1)[0].alpha;

        this.step();

        this.diverge(this.dir, this.dir);
        return;
    }

    // otherwise just step in the best direction
    const choice_direction = scan_results[runner.index_of_max(scan_totals)];

    this.dir = choice_direction.alpha;

    // progress thickness based on nutrients
    const consumption = choice_direction.nutrient_samples[0] - choice_direction.intersections * INTERSECTION_PENALTY;
    this.thickness += (consumption - SUSTENANCE_LEVEL) * THICKNESS_MODIFIER;

    if(Math.abs((consumption - SUSTENANCE_LEVEL) * THICKNESS_MODIFIER) > 0.5 * this.thickness){
        //some fucking thing is causing massive thickness drops and its killing my tendrils
        // debugger;
        print(`im dying fast lol`)
    }

    // move position
    this.pos.add(p5.Vector.fromAngle(this.dir, STEP_SIZE));

  }

  step(){
    this.age++;

    if(this.thickness < MINIMUM_THICKNESS){
        this.live = false;

        //try to make a little point?
        while(this.thickness > 4){
            const coord = this.pos;
            if(coord.x < 0 || coord.x > HOOP.l.w || coord.y < 0 || coord.y > HOOP.l.h) {
                return;
            }
            sections.push(new section(this.pos.copy(), this.dir, this.thickness, this.last_sections[0] ?? null ));
            this.last_sections = [sections.length-1];
            this.pos.add(p5.Vector.fromAngle(this.dir, STEP_SIZE));

            this.thickness--;
        }

        return;
    }

    // grow a flower
    if(this.last_sections.length > 0 && (flowers.length + 10) * SECTIONS_PER_FLOWER < sections.length && random() > 0.95){
        //check surrounding thicknesses
        let depth = 0;
        let checking_section = sections[this.last_sections[0]];
        let total_thickness = checking_section.thickness;
        while(depth < 15){
            checking_section = sections.find(s => s.next == checking_section.id);
            if(!checking_section) {
                break;
            }
            total_thickness += checking_section.thickness;
            depth++;
        }
        print(`flower depth: ${depth}`)
        const flower = {
            pos: this.pos,
            radius: total_thickness*FLOWER_SIZE_RATIO/15,
            noise: runners.filter(r => r.live).length
        }
        flowers.push(flower)
        stroke("pink")
        strokeWeight(4);
        circle(flower.pos.x*DISPLAY_RATIO, flower.pos.y*DISPLAY_RATIO, flower.radius)
        strokeWeight(1);
    }

    sections.push(new section(this.pos.copy(), this.dir, this.thickness, this.last_sections[0] ?? null ));

    let p0;
    for(const section of this.last_sections){
        sections[section].next = sections.length-1;
        p0 = sections[section].p1;
    }

    this.last_sections = [sections.length - 1];

  }

  // convergence path calculation is handled by the runner that initializes the convergence.
  compute_converge(partner_id){
    const partner = runners[partner_id];

    //get the angle in between
    const avg_dir = p5.Vector.add(
        createVector(1,0).setHeading(this.dir), 
        createVector(1,0).setHeading(partner.dir), 
    ).heading();
    
    let check_pos = createVector(
        0.5 * (this.pos.x + partner.pos.x),
        0.5 * (this.pos.y + partner.pos.y)
    );

    // just retry finding it until its got smth ok
    let path_length = Infinity;
    let path1_length = 0;
    let path2_length = 0;
    while(check_pos.dist(this.pos) < MAX_CONVERGE_DISTANCE){
        check_pos.add(p5.Vector.fromAngle(avg_dir, STEP_SIZE));

        // --------- vvv CONVERGENCE DEBUGGING LINES vvv ----------
        // circle(DISPLAY_RATIO * check_pos.x,DISPLAY_RATIO * check_pos.y,2)

        // now compute bezier towards goal for both
        let path1 = [];
        let path2 = [];
        for(let handle_length = 20; handle_length < MAX_BEZIER_HANDLE_LENGTH; handle_length += 5){
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
        
        // commented for debugging
        if(path1_length + path2_length > path_length){
            break;
        } 
        
        this.converge_path = path1;
        partner.converge_path = path2;
        
        path_length = path1_length + path2_length;

        // break; // temp debugging
    }

    print(`final path_lengths: ${path1_length}, ${path2_length}`);
    
    // do the pathfinding again but for offset positions.
    const length_falloff_estimate = 0.002;
    const length_falloff_minimum = 25;
    
    let path1a = [];
    let path2a = [];
    for(let handle_length = 20; handle_length < 250; handle_length += 10){
        if(!path1a.length) path1a = this.get_bezier(
            p5.Vector.add(check_pos, p5.Vector.fromAngle(avg_dir + 0.5*PI, this.thickness*(0.4 - (path1_length- length_falloff_minimum)*length_falloff_estimate))), 
            avg_dir, handle_length);
        if(!path2a.length) path2a = partner.get_bezier(
            p5.Vector.add(check_pos, p5.Vector.fromAngle(avg_dir - 0.5*PI, partner.thickness*(0.4 - (path2_length- length_falloff_minimum)*length_falloff_estimate))), 
            avg_dir, handle_length);
    }
    let path1b = [];
    let path2b = [];
    for(let handle_length = 20; handle_length < 250; handle_length += 10){
        if(!path1b.length) path1b = this.get_bezier(
            p5.Vector.add(check_pos, p5.Vector.fromAngle(avg_dir - 0.5*PI, this.thickness*(0.4 - (path1_length- length_falloff_minimum)*length_falloff_estimate))), 
            avg_dir, handle_length);
        if(!path2b.length) path2b = partner.get_bezier(
            p5.Vector.add(check_pos, p5.Vector.fromAngle(avg_dir + 0.5*PI, partner.thickness*(0.4 - (path2_length- length_falloff_minimum)*length_falloff_estimate))), 
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
    if(this.converge_path.length > 0 && partner.converge_path.length > 0){
        this.converging = true;
        this.converge_partner = partner_id;
        this.converge_complete = false;
        partner.converging = true;
        partner.converge_partner = this.id;
        partner.converge_complete = false;

        // --------- vvv CONVERGENCE DEBUGGING LINES vvv ----------

        fill("green")
        noStroke();
        text(this.id, 
            DISPLAY_RATIO * check_pos.x, 
            DISPLAY_RATIO * check_pos.y)

        noFill()
        stroke("green")

        beginShape();
        for(const pos of this.converge_path){
            vertex(DISPLAY_RATIO *pos.x,DISPLAY_RATIO *pos.y)
        }
        endShape()

        beginShape();
        for(const pos of partner.converge_path){
            vertex(DISPLAY_RATIO *pos.x,DISPLAY_RATIO *pos.y)
        }
        endShape()

        const pdir = p5.Vector.add(check_pos, p5.Vector.fromAngle(avg_dir, 10))
        line(
            DISPLAY_RATIO * pdir.x, 
            DISPLAY_RATIO * pdir.y, 
            DISPLAY_RATIO * check_pos.x, 
            DISPLAY_RATIO * check_pos.y)


        // --------- ^^^ CONVERGENCE DEBUGGING LINES ^^^ ----------

    } else{
        this.converge_path = [];
        partner.converge_path = [];
        print(`failed to match convergence for runners ${this.id} and ${partner.id}`)
    }

  }

  converge_step(){
    if(this.converge_complete){
        return;
    }

    this.pos = this.converge_path.shift();

    // do process nutrients when converging but dont check for intersections idk.
    const consumption = sample_nutrient_map(this.pos);
    this.thickness += (consumption - SUSTENANCE_LEVEL) * THICKNESS_MODIFIER;

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

            if(runners[runners.length - 1].pos.dist(this.pos) > 10){
                print(`ayo what the fuck ${this.id}`)
            }

            runners[runners.length - 1].last_sections = [this.last_sections[0], partner.last_sections[0]];
            
            runners[runners.length - 1].step();

            return;
        }
        else{
            this.step();
            this.converge_complete = true;
            this.live = false;
            return;
        }
    }

    this.dir = p5.Vector.sub(this.converge_path[0], this.pos).heading();
  }

  diverge(dir1, dir2){
    this.live = false;
    const minimum_ratio = (MINIMUM_THICKNESS + 2) / this.thickness;
    const thickness_ratio = minimum_ratio + random()*(1.0 - minimum_ratio*2);
    const pos1 = p5.Vector.add(this.pos, p5.Vector.fromAngle((dir1 + 0.5*PI) % (2*PI), this.thickness * (1-thickness_ratio) * 0.5));
    const pos2 = p5.Vector.add(this.pos, p5.Vector.fromAngle((dir2 - 0.5*PI) % (2*PI), this.thickness * thickness_ratio * 0.5));
    runners.push(new runner(
        pos1.x,
        pos1.y,
        dir1,
        this.thickness * thickness_ratio * 1.1
    ));
    runners.push(new runner(
        pos2.x,
        pos2.y,
        dir2,
        this.thickness * (1-thickness_ratio) * 1.1
    ));

    runners[runners.length - 2 + Math.round(thickness_ratio)].last_sections = [this.last_sections[0]]

    print('divergin')
    fill("red")
    circle(DISPLAY_RATIO*this.pos.x,DISPLAY_RATIO*this.pos.y,5)
    noFill();
  }


  get_bezier(target_pos, target_dir, handle_length){
    const max_angle = Math.atan(STEP_SIZE / this.thickness);

    const p0 = this.pos;
    const p1 = p5.Vector.add(this.pos, p5.Vector.fromAngle(this.dir, handle_length));
    const p2 = p5.Vector.add(target_pos, p5.Vector.fromAngle((target_dir + PI) % (2*PI), handle_length));
    const p3 = target_pos;

    const bezier_array = [];
    let t = 0.01; // if this is 0 they all get instakilled by the point in polygon check at the start lol
    while(t < 1){

        bezier_array.push(runner.sample_bezier(t, p0, p1, p2, p3));

        const sample_length = runner.sample_bezier(t, p0, p1, p2, p3).dist(runner.sample_bezier(t + 0.1, p0, p1, p2, p3));
        t += 0.1 * STEP_SIZE / sample_length;
        
        // do a convoluted check to make sure its not breaking the minimum angle shit
        const i = bezier_array.length - 1;
        if(i < 2) continue

        const dir1 = p5.Vector.sub(bezier_array[i-1], bezier_array[i-2])
        const dir2 = p5.Vector.sub(bezier_array[i], bezier_array[i-1])
        if(Math.abs(dir1.angleBetween(dir2)) > max_angle * 2){
            return [];
        }

        if(bezier_array[i].dist(bezier_array[i-1]) > 2 * STEP_SIZE){
            return [];
        }
    }

    return bezier_array;
  }

  // STOLEN HELPER FUNCTIONS

  static sample_bezier(t, p0, p1, p2, p3){
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

  static find_intersection( p0, p1, p2, p3 ) {
    const s10_x = p1.x - p0.x
    const s10_y = p1.y - p0.y
    const s32_x = p3.x - p2.x
    const s32_y = p3.y - p2.y

    const denom = s10_x * s32_y - s32_x * s10_y

    if (denom == 0) { return null } // collinear

    const denom_is_positive = denom > 0

    const s02_x = p0.x - p2.x
    const s02_y = p0.y - p2.y

    const s_numer = s10_x * s02_y - s10_y * s02_x

    if ((s_numer < 0) == denom_is_positive) { return null } // no collision

    const t_numer = s32_x * s02_y - s32_y * s02_x

    if ((t_numer < 0) == denom_is_positive) { return null } // no collision

    if ((s_numer > denom) == denom_is_positive || (t_numer > denom) == denom_is_positive) { return null } // no collision

    // // collision detected. uncomment to get intersection point
    // t = t_numer / denom
    // intersection_point = createVector( p0.x + (t * s10_x), p0.y + (t * s10_y) )

    // return intersection_point

    return true;
  }

  static index_of_max(arr) {
    if (arr.length === 0) {
        return -1;
    }

    var max = arr[0];
    var maxIndex = 0;

    for (var i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            maxIndex = i;
            max = arr[i];
        }
    }

    return maxIndex;
}

}