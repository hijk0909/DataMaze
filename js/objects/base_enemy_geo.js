// base_enemy_geo.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from "../GameState.js";
import { Enemy } from "./base_enemy.js";
import { ENEMY_STATE } from "./base_enemy.js";
import { MyMath } from "../utils/MathUtils.js";

const EXTERNAL_VELOCITY_DAMPING = 0.85;
const UP_VECTOR = new BABYLON.Vector3(0, 1, 0);

export class EnemyGeo extends Enemy {

    constructor(scene){
        super(scene);
        this.turn_speed = 1.0;
        this.turn_reverse = false;
    }

    create(){
        super.create();
        this.mesh.rotationQuaternion = null; //クオータニオンは使わない（オイラー角で回転制御)
    }

    get_up_vector(){
        return UP_VECTOR;
    }
    get_forward_vector(){
        return this.mesh.forward.normalize();
    }

    on_charge_timeout(state){
        this.change_state(ENEMY_STATE.RUSH);
    }

    update(time, delta){
        // 外部からの速度の減衰
        this.external_velocity.scaleInPlace(EXTERNAL_VELOCITY_DAMPING);
        // 移動等の実行
        super.update(time, delta);
        // 上下の移動範囲を制限
        this.mesh.position.y = GLOBALS.MOVABLE.Y.MIN;
        // プレイヤーに向かって回転
        this.rotate_towards_player(delta);
    }

    rotate_towards_player(delta){
        // 現在の forward
        const forward = this.mesh.forward.clone();
        forward.y = 0;
        forward.normalize();
        // 向く方向
        let dir = this.params.target_pos.subtract(this.mesh.position);            
        dir.y = 0;
        dir.normalize();
        if (this.turn_reverse){
            dir.scaleInPlace(-1);
        }
        // 角度差（符号付き）
        const dot = BABYLON.Vector3.Dot(forward, dir);
        const cross = BABYLON.Vector3.Cross(forward, dir);
        let angle = Math.atan2(cross.y, dot);
        // 最大回転量制限
        const maxTurn = this.params.speed.turn * this.params.speed.turn_magnification * delta / 1000;
        angle = BABYLON.Scalar.Clamp(angle, -maxTurn, maxTurn);
        // Y 軸回転
        this.mesh.rotation.y += angle;
    }

    dispose(){
        super.dispose();
    }
}