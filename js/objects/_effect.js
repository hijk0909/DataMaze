// _effect.js
import { Drawable } from "./_drawable.js";

export class Effect extends Drawable {

    constructor(scene){
        super(scene);
    }

    create(mesh){
        super.create();
    }

    update(time, delta){
        super.update(time, delta);
    }

    dispose(){
        super.dispose();
    }
}