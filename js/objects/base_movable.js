// base_movable.js
import { GLOBALS } from '../GameConst.js';
import { Drawable } from "./base_drawable.js";

export class Movable extends Drawable {

    constructor(scene){
        super(scene);
        this.radius = 0.5; //衝突判定用の半径
        this.velocity =  new BABYLON.Vector3(0, 0, 0);
        this.mass = 1;
        this.mass_max = 10;
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

    add_damage(damage, relative){
        this.damage += damage * GLOBALS.DAMAGE_RATIO;

        // 追加ダメージの計算
        let collisionDir = relative.normalize();
        let forwardLocal = new BABYLON.Vector3(0, 0, -1); // ローカル前面（-z軸）
        let forwardWorld = this.mesh.getDirection(forwardLocal.normalize());
        let dotProduct = BABYLON.Vector3.Dot(collisionDir, forwardWorld);

        // console.log("add_damage:dotProduct:", dotProduct);

        let additionalDamage = 0;
        if (dotProduct < 0) {
            additionalDamage = Math.floor(Math.abs(dotProduct) * damage * GLOBALS.ADDITIONAL_DAMAGE_RATIO); // 正の内積: 側面/背面から → 追加ダメージ
            this.damage += additionalDamage;
        }
        return additionalDamage;
    }

    add_hp(hp){
        this.hp = Math.min(this.hp + hp, this.hp_max);
        return  this.hp;
    }

    add_mass(mass){
        this.mass = Math.min(this.mass + mass, this.mass_max);
        return this.mass;
    }

    subtract_hp(hp){
        this.hp = Math.max(this.hp - hp, 0);
        return this.hp;
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