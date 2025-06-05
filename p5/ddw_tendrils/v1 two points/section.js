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
        this.embroidered = true;

        if(this.next){
            sections[this.next].embroider();
        }
    }

}