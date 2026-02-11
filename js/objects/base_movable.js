// base_movable.js
import { GLOBALS } from '../GameConst.js';
import { Drawable } from "./base_drawable.js";

export class Movable extends Drawable {

    constructor(scene){
        super(scene);
        this.radius = 0.5; //衝突判定用の半径
        this.mass = 1.0;

        this.control_velocity = new BABYLON.Vector3(0, 0, 0);
        this.external_velocity = new BABYLON.Vector3(0, 0, 0);
        this.velocity = new BABYLON.Vector3(0, 0, 0);

        this.hp = 100;
        this.hp_max = 100;

        this.damage = 0;
        this.damage_cooldown = 0;
        this.damage_back_weakness = 1.0;
        this.damage_magnification = 1.0; // 自分が受けるダメージの倍率
        this.attack_magnification = 1.0; // 相手に与えるダメージの倍率

        this.wall_detector = new WallDetector(this);
        this.is_wall_detecting = false;
        this.hit_wall = false;
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

    add_damage(impulse, attack_magnification = 1.0){

        let damage_delta = 0;
        let backstub_delta = 0;

        // ダメージ無反応期間はダメージ処理無し
        if (this.damage_cooldown > 0){
            return {damage :damage_delta, backstub : backstub_delta};
        }
        this.damage_cooldown = GLOBALS.DAMAGE.COOLDOWN;

        // 最低でも 1 のダメージを発生
        damage_delta = Math.max(1, impulse.length() * GLOBALS.DAMAGE.RATE * this.damage_magnification * attack_magnification);
        this.damage += damage_delta;

        // バックスタブ（追加ダメージ）
        const forwardWorld = this.get_forward_vector();
        let dot = BABYLON.Vector3.Dot(impulse.clone().normalize(), forwardWorld);

        if (dot < 0) {
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

        if (this.is_wall_detecting){ this.wall_detector.set_prev();}
        this.mesh.moveWithCollisions(this.velocity);
        if (this.is_wall_detecting){ this.hit_wall = this.wall_detector.check_hit();}

        super.update(time, delta);
    }

    dispose(){
        super.dispose();
    }
}


// 壁との衝突判定用のクラス
class WallDetector {
    constructor(obj){
        this.obj = obj;
        this.scene = obj.scene;
        this.prev_position = null;
        this.prev_velocity = null;
    }

    set_prev(){
        this.prev_position = this.obj.mesh.position.clone();
        this.prev_velocity = this.obj.velocity.clone();
    }

    check_hit(){
        const WALL_CHECK_DISTANCE = 2.0;
        const WALL_IMPACT_THRESHOLD = 0.05;
        let result = false;

        // 実際に進めた距離
        const actual_move = this.obj.mesh.position.subtract(this.prev_position);
        // 進めたかった距離と、実際に進めた距離の差
        const speed_loss = this.prev_velocity.length() - actual_move.length();

        const dir = this.prev_velocity.normalize();
        const ray = new BABYLON.Ray(this.obj.mesh.position, dir, WALL_CHECK_DISTANCE );
        const hit = this.scene.pickWithRay(ray, m => m.isTerrain === true);

        // console.log("speed_loss:", speed_loss, " hit.hit:",hit.hit);

        if (hit?.hit && speed_loss > WALL_IMPACT_THRESHOLD){
            // console.log("hit wall:", speed_loss);
            result = true;
        } 
        return result;
    }
}