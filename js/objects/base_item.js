// base_item.js
import { GLOBALS } from '../GameConst.js';
import { Drawable } from "./base_drawable.js";

const GRAVITY = -0.01;
const BOUND = 0.60;
const SPEED_Y_INIT = 0.2;
const SPEED_Y_MIN = 0.05;

export class Item extends Drawable {

    constructor(scene){
        super(scene);
        this.radius = 0.3;
        this.isDropping = false;
        this.velocity_y = 0;
    }

    create(){
        super.create();
    }

    drop(){
        this.isDropping = true;
        this.velocity_y = SPEED_Y_INIT;
    }

    update(time, delta){
        if (this.isDropping){
            // console.log("dropping:", this.mesh.position.y, this.velocity_y);
            this.mesh.position.y += this.velocity_y;
            this.velocity_y += GRAVITY;
            if ( this.mesh.position.y < GLOBALS.ITEM.Y.BASE){
                this.mesh.position.y = GLOBALS.ITEM.Y.BASE;
                if (Math.abs(this.velocity_y) < SPEED_Y_MIN){
                    this.isDropping = false;
                } else {
                    this.velocity_y = Math.abs(this.velocity_y) * BOUND;
                }
            }
        }
        super.update(time, delta);
    }

    activate(){
        
    }

    dispose(){
        super.dispose();
    }
}