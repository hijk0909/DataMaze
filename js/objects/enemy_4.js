// enemy_4.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from "../GameState.js";
import { Enemy } from "./base_enemy.js";

const DISP_SCALE = 0.4;

const STATUS_WALK = 0;
const STATUS_IDLE = 1;
const STATUS_WALK_PERIOD = 5;
const STATUS_IDLE_PERIOD = 4;
const DECEL = 0.92;

// ケルビム
export class Enemy_4 extends Enemy {

    constructor(scene){
        super(scene);
        this.radius = 0.5;
        this.max_speed = 0.08;
        this.accel = 0.003;
        this.mass = 0.3;
        this.hp_max = this.hp = 120;
        this.turn_speed = 1.5;
        this.status = STATUS_WALK;
        this.status_counter = STATUS_WALK_PERIOD;
    }

    create(position, id){

        const container = GameState.asset.mesh.enemy_4;
        const inst = container.instantiateModelsToScene( (name) => `${name}_enemy_4_${id}` );

        this.mesh = inst.rootNodes[0];
        this.mesh.ellipsoid = new BABYLON.Vector3(1.2, 0.8, 1.2);
        this.mesh.scaling = new BABYLON.Vector3(DISP_SCALE, DISP_SCALE, DISP_SCALE);
        this.mesh.scaling.z = Math.abs(this.mesh.scaling.z);
        this.mesh.position = position.clone();

        this.mesh.checkCollisions = true; //障害物との衝突判定
        this.mesh.rotationQuaternion = null; //クオータニオンは使わない（オイラー角で回転制御)

        // アニメーション
        this.anim_walk = inst.animationGroups.find(group => group.name === `walk_enemy_4_${id}`);
        this.anim_idle = inst.animationGroups.find(group => group.name === `idle_enemy_4_${id}`);
        if (this.anim_walk) {
            this.anim_walk.start(true); // ループ再生
        }

        // カラーボール
        // インスタンス化したノード群から、"nose_ball" を探す
        this.color_ball = inst.rootNodes[0].getChildMeshes().find(mesh => mesh.name.includes("color_ball"));
        if (this.color_ball && this.color_ball.material) {
            const mat = this.color_ball.material;
            if (mat instanceof BABYLON.PBRMaterial) {
                mat.albedoColor = new BABYLON.Color3(0, 1, 0);
                mat.metallic = 0.5;
                mat.roughness = 0.2;
            }
        }

        super.create();
    }

    update(time, delta){

        // 上下の動きを制限
        this.mesh.position.y = GLOBALS.MOVABLE.Y.MIN;

        // 向きの制御
        // 現在の forward
        const forward = this.mesh.forward.clone();
        forward.y = 0;
        forward.normalize();
        // プレイヤー方向
        const toPlayer = GameState.player.mesh.position
            .subtract(this.mesh.position);
        toPlayer.y = 0;
        toPlayer.normalize();
        // 角度差（符号付き）
        const dot = BABYLON.Vector3.Dot(forward, toPlayer);
        const cross = BABYLON.Vector3.Cross(forward, toPlayer);
        let angle = Math.atan2(cross.y, dot);
        // 最大回転量制限
        const maxTurn = this.turn_speed * delta / 1000;
        angle = BABYLON.Scalar.Clamp(angle, -maxTurn, maxTurn);
        // Y 軸回転
        this.mesh.rotation.y += angle;

        if (this.status === STATUS_WALK){
            // プレイヤーを追跡
            const dir = GameState.player.mesh.position
                .subtract(this.mesh.position)
                .normalize();
            this.velocity_new.addInPlace(dir.scale(this.accel));

            // [COUNTER]
            this.status_counter -= delta / 1000;
            if (this.status_counter <= 0){
                this.status = STATUS_IDLE;
                this.status_counter = STATUS_IDLE_PERIOD + Math.random() * 2;
                this.color_ball.material.albedoColor = new BABYLON.Color3(1, 0, 0);
                this.anim_walk.stop();
                this.anim_idle.start(true); 
            }
        } else if (this.status === STATUS_IDLE){
            // 減速
            this.velocity_new.scaleInPlace(DECEL);
            // [COUNTER]
            this.status_counter -= delta / 1000;
            if (this.status_counter <= 0){
                this.status = STATUS_WALK;
                this.status_counter = STATUS_WALK_PERIOD + Math.random() * 2;
                this.color_ball.material.albedoColor = new BABYLON.Color3(0, 0.8, 1);
                this.anim_idle.stop();
                this.anim_walk.start(true); 
            }
        }

        // 速度制限
        if (this.velocity_new.length() > this.max_speed) {
            this.velocity_new.normalize().scaleInPlace(this.max_speed);
        }
        this.mesh.moveWithCollisions(this.velocity_new);
        this.velocity = this.velocity_new.clone();

        super.update(time, delta);
    }

    dispose(){
        super.dispose();
    }
}