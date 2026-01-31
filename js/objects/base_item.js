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

    set_color(material, color){
        material.albedoColor = color;
        material.metallic = 0.0;
        material.roughness = 0.8;
        material.emissiveColor = color;
        material.emissiveIntensity = 0.2;
        material.clearCoat.isEnabled = true;
        material.clearCoat.intensity = 10.0;
        material.clearCoat.roughness = 0.3;
        material.sheen.isEnabled = true;
        material.sheen.intensity = 10.0;
        material.sheen.color = color;
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