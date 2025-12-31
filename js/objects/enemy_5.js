// enemy_5.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from "../GameState.js";
import { Enemy } from "./base_enemy.js";

const DISP_SCALE = 1.0;
const TERRITORY = 7;
const DECEL = 0.99;
const ROTATION_SPEED = 0.018; // 回転速度：毎フレームの接近量（パーセント）
const SHOT_COOLDOWN = 5; // 射出間隔
const SHOT_SPEED = 0.1; // 射出速度
const SHOT_RADIUS = 1.5; // 射出位置（中心からの距離）

// 大目玉
export class Enemy_5 extends Enemy {

    constructor(scene){
        super(scene);
        this.radius = 0.6;
        this.max_speed = 0.025;
        this.accel = 0.001;
        this.mass = 0.7;
        this.shot_cooldown = 0;
    }

    create(position, id){

        const container = GameState.asset.mesh.enemy_5;
        const inst = container.instantiateModelsToScene( (name) => `${name}_enemy_5_${id}` );

        this.mesh = inst.rootNodes[0];
        this.mesh.scaling = new BABYLON.Vector3(DISP_SCALE, DISP_SCALE, DISP_SCALE);
        this.mesh.position = position.clone();
        this.mesh.checkCollisions = true; //障害物との衝突判定

        super.create();
    }

    // shot(shot_dir){
    //     // クォータニオンから射出角度の計算
    //     const rotationMatrix = new BABYLON.Matrix();
    //     this.mesh.rotationQuaternion.toRotationMatrix(rotationMatrix);
    //     const direction = BABYLON.Vector3.TransformNormal(shot_dir, rotationMatrix).normalize();
    //     const spawnPosition = this.mesh.position.add(direction.scale(SHOT_RADIUS));
    //     // 射出
    //     GameState.num_enemies++;
    //     const enemy = new Enemy_6(this.scene);
    //     enemy.create(spawnPosition, GameState.num_enemies, direction.scale(SHOT_SPEED));
    //     GameState.enemies.push(enemy);
    // }

    shot(direction){
        const spawnPosition = this.mesh.position.add(direction.scale(SHOT_RADIUS));
        const enemy = GameState.spawn.spawn_enemy("Enemy_6", spawnPosition);
        enemy.add_impulse(direction.scale(SHOT_SPEED));
    }

    update(time, delta){
        const toPlayer = GameState.player.mesh.position
            .subtract(this.mesh.position);
        const dir = toPlayer.clone().normalize();

        // プレイヤーに向かって移動
        if (toPlayer.lengthSquared()  <  TERRITORY * TERRITORY && GameState.stage_state === GLOBALS.STAGE_STATE.PLAYING){
            this.velocity_new.addInPlace(dir.scale(this.accel));
            this.shot_cooldown -= delta / 1000;
            if (this.shot_cooldown < 0){
                this.shot_cooldown = SHOT_COOLDOWN;
                // 射出
                this.shot(dir);
            }
        } else {
            this.velocity_new.scaleInPlace(DECEL);
        }

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