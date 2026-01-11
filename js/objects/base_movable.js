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
        this.back_weakness = 1.0;
    }

    create(){
        super.create();
    }

    add_impulse(impulse){
        this.velocity_new = this.velocity_new.add(impulse);
    }

    add_damage(damage, relative){
        this.damage += damage * GLOBALS.DAMAGE.RATE;

        // 追加ダメージの計算
        let collisionDir = relative.normalize();
        let forwardLocal = new BABYLON.Vector3(0, 0, -1); // ローカル前面（-z軸）
        let forwardWorld = this.mesh.getDirection(forwardLocal.normalize());
        let dotProduct = BABYLON.Vector3.Dot(collisionDir, forwardWorld);

        // console.log("add_damage:dotProduct:", dotProduct);

        let additionalDamage = 0;
        if (dotProduct < 0) {
            additionalDamage = Math.floor(Math.abs(dotProduct) * damage * GLOBALS.DAMAGE.ADDITIONAL_RATE); // 正の内積: 側面/背面から → 追加ダメージ
            this.damage += additionalDamage * this.back_weakness;
            // console.log("additional damage:this.velocity_new:", this.velocity, this.velocity_new, this.velocity_new.length(), "damage:",this.damage, "mass:",this.mass);
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

    process_damage(delta){
        if (this.damage <= 0) { return; }
        // console.log("process_damage[1] damage:",this.damage);

        // 1秒あたりのダメージ消費スピード（対 this.hp_max比）の決定
        const k = this.damage / this.hp_max;
        let damage_speed;
        if (k < GLOBALS.DAMAGE.MIN_RATIO) {
            damage_speed = GLOBALS.DAMAGE.MIN_SPEED;
        } else if (k > GLOBALS.DAMAGE.MAX_RATIO) {
            damage_speed = GLOBALS.DAMAGE.MAX_SPEED;
        } else {
            const t =
                (k - GLOBALS.DAMAGE.MIN_RATIO) /
                (GLOBALS.DAMAGE.MAX_RATIO - GLOBALS.DAMAGE.MIN_RATIO);
            damage_speed =
               GLOBALS.DAMAGE.MIN_SPEED +
                t * (GLOBALS.DAMAGE.MAX_SPEED - GLOBALS.DAMAGE.MIN_SPEED);
        }
        // このフレームで削れるHPの上限量
        const hp_delta_limit = damage_speed * (delta / 1000) * this.hp_max;
        // console.log("process_damage[2] hp_delta_limit:", hp_delta_limit);

        // ダメージ量とHPを更新
        if (hp_delta_limit < this.damage) {
            this.damage -= hp_delta_limit;
            this.hp = Math.max(0, this.hp - hp_delta_limit);
        } else {
            this.damage = 0;
            this.hp = Math.max(0, this.hp - this.damage);
        }
        // console.log("process_damage[3] hp:", this.hp, " damage:", this.damage);
    }

    update(time, delta){
        this.process_damage(delta);
        super.update(time, delta);
    }

    dispose(){
        super.dispose();
    }
}