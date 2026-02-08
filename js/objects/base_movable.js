// base_movable.js
import { GLOBALS } from '../GameConst.js';
import { Drawable } from "./base_drawable.js";

export class Movable extends Drawable {

    constructor(scene){
        super(scene);
        this.radius = 0.5; //衝突判定用の半径
        this.mass = 1;

        this.control_velocity = new BABYLON.Vector3(0, 0, 0);
        this.external_velocity = new BABYLON.Vector3(0, 0, 0);
        this.velocity = new BABYLON.Vector3(0, 0, 0);

        this.hp = 100;
        this.hp_max = 100;

        this.damage = 0;
        this.damage_cooldown = 0;
        this.damage_back_weakness = 1.0;
        this.damage_magnification = 1.0;
    }

    create(){
        super.create();
    }

    get_up_vector(){}
    get_forward_vector(){}

    add_impulse(impulse){
        this.external_velocity.addInPlace(impulse.scale(1/this.mass * GLOBALS.MOVABLE.IMPULSE_VELOCITY_RATIO));
        if (this.external_velocity.length() > GLOBALS.MOVABLE.MAX_EXTERNAL_VELOCITY){
            this.external_velocity.normalize().scale(GLOBALS.MOVABLE.MAX_EXTERNAL_VELOCITY);
        }
    }

    add_damage(momentum, normal){

        let damage_delta = 0;
        let backstub_delta = 0;

        // console.log("add_damage damage_cooldown:", this.damage_cooldown);
        // ダメージ無反応期間はダメージ処理無し
        if (this.damage_cooldown > 0){
            return {damage :damage_delta, backstub : backstub_delta};
        }
        this.damage_cooldown = GLOBALS.DAMAGE.COOLDOWN;

        // 最低でも 1 のダメージを発生
        damage_delta = Math.max(1, momentum * GLOBALS.DAMAGE.RATE * this.damage_magnification);
        this.damage += damage_delta;

        // バックスタブ（追加ダメージ）
        // let forwardLocal = new BABYLON.Vector3(0, 0, -1); // ローカル前面（-z軸）
        // let forwardWorld = this.mesh.getDirection(forwardLocal.normalize());
        const forwardWorld = this.get_forward_vector();
        let dot = BABYLON.Vector3.Dot(normal, forwardWorld);
        // console.log("add_damage dot:", dot, "damage:", damage);

        if (dot > 0) {
            backstub_delta = Math.floor(Math.abs(dot) * damage_delta * this.damage_back_weakness + 1.0);
            this.damage += backstub_delta;
        }
        return {damage : damage_delta, backstub : backstub_delta};
    }

    // 直接ダメージ（衝突と関係ない）（例）敵→プレイヤーへの雷撃
    add_damage_direct(dmg){
        this.damage += dmg;
    }

    update_damage(delta){
        if (this.damage <= 0) { return; }
        // console.log("update_damage[1] damage:",this.damage);

        // 1秒あたりのダメージ消費スピード damage_speed（対 this.hp_max比）の決定
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
        // console.log("update_damage[2]: hp_max:",this.hp_max," damage:",this.damage, " damage_speed:",damage_speed, " hp_delta_limit:", hp_delta_limit);

        // ダメージ量とHPを更新
        if (hp_delta_limit < this.damage) {
            this.damage -= hp_delta_limit;
            this.hp = Math.max(0, this.hp - hp_delta_limit);
        } else {
            this.hp = Math.max(0, this.hp - this.damage);
            this.damage = 0;
        }
        // console.log("update_damage[3] hp:", this.hp, " damage:", this.damage);
    }

    add_hp(hp){
        this.hp = Math.min(this.hp + hp, this.hp_max);
        return  this.hp;
    }

    subtract_hp(hp){
        this.hp = Math.max(this.hp - hp, 0);
        return this.hp;
    }

    update(time, delta){
        // ダメージ処理
        this.update_damage(delta);
        // ダメージ無反応期間        
        if (this.damage_cooldown > 0){
            this.damage_cooldown -= delta / 1000;
        }
        // 移動の実行
        const control_ratio = BABYLON.Scalar.Clamp(1 - this.external_velocity.length() / GLOBALS.MOVABLE.CONTROL_LOSS_THRESHOLD, 0, 1);
        this.velocity = this.control_velocity.clone().scale(control_ratio).add(this.external_velocity);
        this.mesh.moveWithCollisions(this.velocity);

        super.update(time, delta);
    }

    dispose(){
        super.dispose();
    }
}