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

        // index yourself:
        const xi = Math.floor(this.pos.x / IX_HALF_SQUARE_SIZE)
        const yi = Math.floor(this.pos.y / IX_HALF_SQUARE_SIZE)

        ix_sections[xi][yi].push(this.id)
        if(xi>0) ix_sections[xi-1][yi].push(this.id)
        if(yi>0) ix_sections[xi][yi-1].push(this.id)
        if(xi>0 && yi>0) ix_sections[xi-1][yi-1].push(this.id)
    }

    embroider(){
        if(this.embroidered) return;

        coords.push(this.p0);
        coords.push(this.p1);

        fill("red"); push(); scale(DISPLAY_RATIO);
        circle(coords[coords.length-2].x,coords[coords.length-2].y,3)
        circle(coords[coords.length-1].x,coords[coords.length-1].y,3)
        pop();

        this.embroidered = true;

        if(this.next){
            sections[this.next].embroider();
        }
    }

}