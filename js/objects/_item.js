// _item.js
import { Drawable } from "./_drawable.js";

export class Item extends Drawable {

    constructor(scene){
        super(scene);
        this.radius = 0.3;
    }

    create(){
        super.create();
    }

    update(time, delta){
        super.update(time, delta);
    }

    activate(){
        
    }

    dispose(){
        super.dispose();
    }
}