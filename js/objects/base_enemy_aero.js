// base_enemy_aero.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from "../GameState.js";
import { Enemy } from "./base_enemy.js";
import { ENEMY_STATE } from "./base_enemy.js";
import { MyMath } from "../utils/MathUtils.js";

const EXTERNAL_VELOCITY_DAMPING = 0.95;

export class EnemyAero extends Enemy {

    constructor(scene){
        super(scene);
    }

    create(){
        super.create();
    }

    get_up_vector(){
        return BABYLON.Vector3.TransformNormal(BABYLON.Axis.Y, this.mesh.getWorldMatrix()).normalize();
    }
    get_forward_vector(){
        return BABYLON.Vector3.TransformNormal(BABYLON.Axis.Z, this.mesh.getWorldMatrix()).normalize();
    }

    on_charge_timeout(state){
        this.change_state(ENEMY_STATE.THUNDER);        
    }

    update(time, delta){
        // 外部からの速度の減衰
        this.external_velocity.scaleInPlace(EXTERNAL_VELOCITY_DAMPING);
        // 移動等の実行
        super.update(time, delta);
        // 上下の移動範囲を一定範囲に制限
        if (this.mesh.position.y < GLOBALS.MOVABLE.Y.MIN) this.mesh.position.y = GLOBALS.MOVABLE.Y.MIN;
        if (this.mesh.position.y > GLOBALS.MOVABLE.Y.MAX) this.mesh.position.y = GLOBALS.MOVABLE.Y.MAX;
        // プレイヤーに向かって回転
        this.rotate_towards_player(delta);
    }

    rotate_towards_player(delta){
        // ターゲット方向ベクトルを取得
        const targetPosition = GameState.player.mesh.position;
        const currentPosition = this.mesh.position;
        const targetDir = targetPosition.subtract(currentPosition).normalize();
        // メッシュのローカルZ軸 (this.forward) を targetDir に向ける回転を計算
        const targetQuaternion = new BABYLON.Quaternion();
        BABYLON.Quaternion.FromUnitVectorsToRef(
            BABYLON.Axis.Z, 
            targetDir, 
            targetQuaternion
        );
        // 球面線形補間で滑らかに回転
        BABYLON.Quaternion.SlerpToRef(
            this.mesh.rotationQuaternion,       // 現在の回転
            targetQuaternion,                   // 目標の回転
            this.params.speed.rotation * delta / 1000, // 補間率（値が小さいほど滑らかで遅い）
            this.mesh.rotationQuaternion        // 結果をメッシュのクォータニオンに書き込み
        );
    }

    dispose(){
        super.dispose();
    }
}