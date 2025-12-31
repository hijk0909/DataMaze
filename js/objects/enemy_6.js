// enemy_6.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from "../GameState.js";
import { Enemy } from "./base_enemy.js";

const DISP_SCALE = 0.2;
const ROTATION_SPEED = 0.05;

// 小目玉
export class Enemy_6 extends Enemy {

    constructor(scene){
        super(scene);
        this.radius = 0.1;
        this.max_speed = 0.15;
        this.accel = 0.006;
        this.mass = 0.1;
        this.hp_max = this.hp = 60;
    }

    create(position, id){

        const container = GameState.asset.mesh.enemy_6;
        const inst = container.instantiateModelsToScene( (name) => `${name}_enemy_5_${id}` );

        this.mesh = inst.rootNodes[0];
        this.mesh.scaling = new BABYLON.Vector3(DISP_SCALE, DISP_SCALE, DISP_SCALE);
        this.mesh.position = position.clone();

        this.mesh.checkCollisions = false; //障害物との衝突判定

        super.create();
    }

    update(time, delta){
        const dir = GameState.player.mesh.position
            .subtract(this.mesh.position)
            .normalize();
        this.velocity_new.addInPlace(dir.scale(this.accel));
        // 速度制限
        if (this.velocity_new.length() > this.max_speed) {
            this.velocity_new.normalize().scaleInPlace(this.max_speed);
        }
        this.mesh.moveWithCollisions(this.velocity_new);
        this.velocity = this.velocity_new.clone();

        // 上下の動きを制限
        if (this.mesh.position.y < GLOBALS.MOVABLE.Y.MIN) this.mesh.position.y = GLOBALS.MOVABLE.Y.MIN;
        if (this.mesh.position.y > GLOBALS.MOVABLE.Y.MAX) this.mesh.position.y = GLOBALS.MOVABLE.Y.MAX;

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
            this.mesh.rotationQuaternion, // 現在の回転
            targetQuaternion,             // 目標の回転
            ROTATION_SPEED,               // 補間率
            this.mesh.rotationQuaternion  // 結果をメッシュのクォータニオンに書き込み
        );

        super.update(time, delta);
    }

    dispose(){
        super.dispose();
    }
}