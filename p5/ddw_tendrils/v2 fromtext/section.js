class section{
    constructor(pos, dir, thickness){
        this.pos = pos;
        this.dir = dir;
        this.thickness = thickness;
        this.next = null;
        this.embroidered = false;
    }

    embroider(){
        if(this.embroidered) return;

        coords.push(p5.Vector.add(this.pos, p5.Vector.fromAngle(this.dir, this.thickness*0.5).rotate(0.5*PI)));
        coords.push(p5.Vector.add(this.pos, p5.Vector.fromAngle(this.dir, this.thickness*0.5).rotate(-0.5*PI)));

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