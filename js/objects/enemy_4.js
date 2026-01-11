// enemy_4.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from "../GameState.js";
import { Enemy } from "./base_enemy.js";

const DISP_SCALE = 0.4;

const STATUS_WALK   = 0;
const STATUS_ESCAPE = 1;
const STATUS_IDLE   = 2;
const STATUS_WALK_PERIOD    = 5;
const STATUS_ESCAPE_PERIOD  = 3;
const STATUS_IDLE_PERIOD    = 5;
const DECEL = 0.92;

// ケルビム
export class Enemy_4 extends Enemy {

    constructor(scene){
        super(scene);
        this.radius = 0.5;
        this.max_speed = 0.10;
        this.escape_speed = 0.05;
        this.accel = 0.01;
        this.mass = 1.2;
        this.hp_max = this.hp = 300;
        this.back_weakness = 5.0;
        this.turn_speed = 2.5;
        this.status = STATUS_WALK;
        this.status_counter = STATUS_WALK_PERIOD;
    }

    create(position, id){

        const container = GameState.asset.mesh.enemy_4;
        const inst = container.instantiateModelsToScene( (name) => `${name}_enemy_4_${id}` );

        this.mesh = inst.rootNodes[0];
        this.mesh.scaling = new BABYLON.Vector3(DISP_SCALE, DISP_SCALE, DISP_SCALE);
        this.mesh.position = position.clone();

        this.mesh.ellipsoid = new BABYLON.Vector3(0.8, 0.9, 0.8);
        // this.create_debug_ellipsoid(this.mesh.ellipsoid);  // [DEBUG]
        this.mesh.checkCollisions = true;           //障害物との衝突判定
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

        if (this.status === STATUS_WALK){
            // [プレイヤーを向く]
            const forward = this.mesh.forward.clone(); // 現在の forward
            forward.y = 0;
            forward.normalize();
            const toPlayer = GameState.player.mesh.position // プレイヤー方向
                .subtract(this.mesh.position);
            toPlayer.y = 0;
            toPlayer.normalize();
            const dot = BABYLON.Vector3.Dot(forward, toPlayer); // 角度差（符号付き）
            const cross = BABYLON.Vector3.Cross(forward, toPlayer);
            let angle = Math.atan2(cross.y, dot);
            const maxTurn = this.turn_speed * delta / 1000; // 最大回転角制限
            angle = BABYLON.Scalar.Clamp(angle, -maxTurn, maxTurn);
            this.mesh.rotation.y += angle; // Y 軸回転

            // [プレイヤーを追跡]
            const dir = GameState.player.mesh.position
                .subtract(this.mesh.position)
                .normalize();
            this.velocity_new.addInPlace(dir.scale(this.accel));
            // 速度制限
            if (this.velocity_new.length() > this.max_speed) {
                this.velocity_new.normalize().scaleInPlace(this.max_speed);
            }

            // [COUNTER]
            this.status_counter -= delta / 1000;
            if (this.status_counter <= 0){
                this.status = STATUS_ESCAPE;
                this.status_counter = STATUS_ESCAPE_PERIOD *(1 + Math.random());
                this.color_ball.material.albedoColor = new BABYLON.Color3(1, 1, 0);
            }
        } else if (this.status === STATUS_ESCAPE){
            // [プレイヤーに背を向ける]
            const forward = this.mesh.forward.clone(); // 現在の forward
            forward.y = 0;
            forward.normalize();
            const toPlayer = GameState.player.mesh.position // プレイヤーと逆方向
                .subtract(this.mesh.position);
            toPlayer.y = 0;
            const reverseDir = toPlayer.clone().normalize().scale(-1); // 逆向き
            const dot = BABYLON.Vector3.Dot(forward, reverseDir); // 角度差（符号付き）
            const cross = BABYLON.Vector3.Cross(forward, reverseDir);
            let angle = Math.atan2(cross.y, dot);
            const maxTurn = this.turn_speed * delta / 1000; // 最大回転角制限
            angle = BABYLON.Scalar.Clamp(angle, -maxTurn, maxTurn);
            this.mesh.rotation.y += angle; // Y 軸回転

            // [プレイヤーから離れる]
            const dir = GameState.player.mesh.position
                .subtract(this.mesh.position)
                .normalize()
                .scale(-1); //逆向き
            this.velocity_new.addInPlace(dir.scale(this.accel));
            // 速度制限
            if (this.velocity_new.length() > this.escape_speed) {
                this.velocity_new.normalize().scaleInPlace(this.escape_speed);
            }

            // [COUNTER]
            this.status_counter -= delta / 1000;
            if (this.status_counter <= 0){
                this.status = STATUS_IDLE;
                this.status_counter = STATUS_IDLE_PERIOD *(1 + Math.random());
                this.color_ball.material.albedoColor = new BABYLON.Color3(1, 0, 0);
                this.anim_walk.stop();
                this.anim_idle.start(true); 
            }
        } else if (this.status === STATUS_IDLE){
            // [減速]
            this.velocity_new.scaleInPlace(DECEL);
            // 速度制限
            if (this.velocity_new.length() > this.escape_speed) {
                this.velocity_new.normalize().scaleInPlace(this.escape_speed);
            }

            // [COUNTER]
            this.status_counter -= delta / 1000;
            if (this.status_counter <= 0){
                this.status = STATUS_WALK;
                this.status_counter = STATUS_WALK_PERIOD *(1 + Math.random());
                this.color_ball.material.albedoColor = new BABYLON.Color3(0, 0.8, 1);
                this.anim_idle.stop();
                this.anim_walk.start(true); 
            }
        }

        this.mesh.moveWithCollisions(this.velocity_new);
        this.velocity = this.velocity_new.clone();

        super.update(time, delta);
    }

    dispose(){
        super.dispose();
    }
}