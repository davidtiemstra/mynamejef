class section{
    constructor(pos, dir, thickness, previous){
        this.pos = pos;
        this.dir = dir;
        this.thickness = thickness;
        this.next = null;
        this.previous = previous;
        this.embroidered = false;
        this.p0 = p5.Vector.add(this.pos, p5.Vector.fromAngle(this.dir, this.thickness*0.5).rotate(0.5*PI));
        this.p1 = p5.Vector.add(this.pos, p5.Vector.fromAngle(this.dir, this.thickness*0.5).rotate(-0.5*PI));
        this.id = sections.length;

        if(this.pos.x < 0 || this.pos.x > HOOP.l.w || this.pos.y < 0 || this.pos.y > HOOP.l.h){
            return;
        }

        // const pp0 = sections[this.previous]?.p0;
        // const pp1 = sections[this.previous]?.p1;
        // if(pp0 && pp1){
        //     beginShape()
        //     vertex(
        //         DISPLAY_RATIO * pp0.x,
        //         DISPLAY_RATIO * pp0.y
        //     )
        //     vertex(
        //         DISPLAY_RATIO * pp1.x,
        //         DISPLAY_RATIO * pp1.y
        //     )
        //     vertex(
        //         DISPLAY_RATIO * this.p1.x,
        //         DISPLAY_RATIO * this.p1.y
        //     )
        //     vertex(
        //         DISPLAY_RATIO * this.p0.x,
        //         DISPLAY_RATIO * this.p0.y
        //     )
        //     endShape(CLOSE)
        // }     

        const pp = sections[this.previous]?.p1;
        if(pp) line(
            DISPLAY_RATIO * pp.x,
            DISPLAY_RATIO * pp.y,
            DISPLAY_RATIO * this.p0.x,
            DISPLAY_RATIO * this.p0.y
        );
        line(
            DISPLAY_RATIO * this.p0.x,
            DISPLAY_RATIO * this.p0.y,
            DISPLAY_RATIO * this.p1.x,
            DISPLAY_RATIO * this.p1.y
        );

        // index yourself:
        const xi = Math.floor(this.pos.x / IX_HALF_SQUARE_SIZE)
        const yi = Math.floor(this.pos.y / IX_HALF_SQUARE_SIZE)

        ix_sections[xi][yi]?.push(this.id)
        if(xi>0) ix_sections[xi-1][yi]?.push(this.id)
        if(yi>0) ix_sections[xi][yi-1]?.push(this.id)
        if(xi>0 && yi>0) ix_sections[xi-1][yi-1]?.push(this.id)
    }

    embroider(){
        if(this.embroidered) return;

        tendril_coords.push(this.p0);
        tendril_coords.push(this.p1);

        // fill("red"); push(); scale(DISPLAY_RATIO);
        // circle(tendril_coords[tendril_coords.length-2].x,tendril_coords[tendril_coords.length-2].y,3)
        // circle(tendril_coords[tendril_coords.length-1].x,tendril_coords[tendril_coords.length-1].y,3)
        // pop();

        this.embroidered = true;

        if(this.next){
            sections[this.next].embroider();
        }
    }

}