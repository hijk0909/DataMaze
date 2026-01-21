// enemy_4.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from "../GameState.js";
import { EnemyGeo } from "./base_enemy_geo.js";

const DISP_SCALE = 0.4;
const TERRITORY = 6;
const DECEL = 0.92;

const STATUS_WALK   = 0;
const STATUS_ESCAPE = 1;
const STATUS_IDLE   = 2;
const STATUS_WALK_PERIOD    = 5;
const STATUS_ESCAPE_PERIOD  = 3;
const STATUS_IDLE_PERIOD    = 5;

// ケルビム
export class Enemy_4 extends EnemyGeo {

    constructor(scene){
        super(scene);
        this.radius = 0.5;
        this.max_speed = 0.10;
        this.escape_speed = 0.03;
        this.accel = 0.01;
        this.mass = 1.1;
        this.hp_max = this.hp = 300;

        this.back_weakness = 5.0;
        this.shot_knockback = 8.0;

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
        this.mesh.checkCollisions = true;           //障害物との衝突判定

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

        // 現在の forward
        const forward = this.mesh.forward.clone();
        forward.y = 0;
        forward.normalize();
        // プレイヤーの方向
        const toPlayer = GameState.player.mesh.position
            .subtract(this.mesh.position);
        toPlayer.y = 0;
        const dir = toPlayer.clone().normalize();

        if (this.status === STATUS_WALK){
            // [プレイヤーを向く]
            this.turn_reverse = false;

            // [プレイヤーを追跡]
            if (toPlayer.lengthSquared()  <  TERRITORY * TERRITORY && GameState.stage_state === GLOBALS.STAGE_STATE.PLAYING){
                this.control_velocity.addInPlace(dir.scale(this.accel));
            }
            // 速度制限（突進速度）
            if (this.control_velocity.length() > this.max_speed) {
                this.control_velocity.normalize().scaleInPlace(this.max_speed);
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
            this.turn_reverse = true;

            // [プレイヤーから離れる]
            this.control_velocity.addInPlace(dir.scale(-this.accel));

            // 速度制限（逃避速度）
            if (this.control_velocity.length() > this.escape_speed) {
                this.control_velocity.normalize().scaleInPlace(this.escape_speed);
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
            this.control_velocity.scaleInPlace(DECEL);
            // 速度制限（逃避速度）
            if (this.control_velocity.length() > this.escape_speed) {
                this.control_velocity.normalize().scaleInPlace(this.escape_speed);
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

        super.update(time, delta);
    }

    dispose(){
        super.dispose();
    }
}