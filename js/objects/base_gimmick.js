// base_gimmick.js
import { Drawable } from "./base_drawable.js";

export class Gimmick extends Drawable {

    constructor(scene){
        super(scene);
        this.radius = 0.5; //衝突判定用の半径
        this.score = 0;
    }

    create(){
        super.create();
    }

    activate(){
        this.alive = false;
    }

    shot(){
        this.alive = false;
    }

    update(time, delta){
        super.update(time, delta);
    }

    dispose(){
        super.dispose();
    }
}