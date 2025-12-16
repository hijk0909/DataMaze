// _movable.js
import { GLOBALS } from '../GameConst.js';
import { Drawable } from "./_drawable.js";

export class Movable extends Drawable {

    constructor(scene){
        super(scene);
        this.radius = 0.5; //衝突判定用の半径
        this.velocity =  new BABYLON.Vector3(0, 0, 0);
        this.mass = 1;
        this.velocity_new = new BABYLON.Vector3(0, 0, 0);
        this.hp = 100;
        this.hp_max = 100;
        this.damage = 0;
    }

    create(){
        super.create();
    }

    add_impulse(impulse){
        this.velocity_new = this.velocity_new.add(impulse);
    }

    add_damage(damage){
        this.damage += damage * GLOBALS.DAMAGE_RATIO;
    }

    add_hp(hp){
        this.hp = Math.min(this.hp + hp, this.hp_max);
    }

    update(time, delta){
        if (this.damage > GLOBALS.DAMAGE_SPEED){
            this.damage -= GLOBALS.DAMAGE_SPEED;
            this.hp = Math.max(0, this.hp - GLOBALS.DAMAGE_SPEED);
        }
        super.update(time, delta);
    }

    dispose(){
        super.dispose();
    }
}