class section{
    constructor(pos, dir, thickness){
        this.pos = pos;
        this.dir = dir;
        this.thickness = thickness;
        this.next = null;
        this.embroidered = false;
        this.p0 = p5.Vector.add(this.pos, p5.Vector.fromAngle(this.dir, this.thickness*0.5).rotate(0.5*PI));
        this.p1 = p5.Vector.add(this.pos, p5.Vector.fromAngle(this.dir, this.thickness*0.5).rotate(-0.5*PI));
        this.id = sections.length - 1
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