// enemy_4.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from "../GameState.js";
import { EnemyGeo } from "./base_enemy_geo.js";
import { ENEMY_STATE } from "./base_enemy.js";

const STATE_CHASE_PERIOD   = 5;
const STATE_ESCAPE_PERIOD  = 3;
const STATE_IDLE_PERIOD    = 5;

// ケルビム
export class Enemy_4 extends EnemyGeo {

    constructor(scene){
        super(scene);
        this.radius = 0.5;
        this.mass = 1.1;
        this.hp_max = this.hp = 300;

        this.damage_back_weakness = 5.0;
        this.params.territory = 6.0;
        this.params.speed.decel = 0.92;
        this.params.speed.chase = 0.10;
        this.params.speed.escape = 0.03;
        this.params.speed.accel = 0.01;
        this.params.speed.turn = 2.5;
        this.params.damage.shot_knockback = 8.0;
        this.params.anger.is_valid = false;
    }

    create(position, id){

        const container = GameState.asset.mesh.enemy_4;
        const inst = container.instantiateModelsToScene( (name) => `${name}_enemy_4_${id}` );

        const DISP_SCALE = 0.4;
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

    on_chase_enter(state){
        this.color_ball.material.albedoColor = new BABYLON.Color3(0, 0.8, 1);
        this.anim_idle.stop();
        this.anim_walk.start(true); 
        state.hasTimeout = true;
        state.timer = STATE_CHASE_PERIOD *(1 + Math.random());
    }
    on_chase_timeout(state){
        this.change_state(ENEMY_STATE.ESCAPE);    
    }

    on_escape_enter(state){
        this.color_ball.material.albedoColor = new BABYLON.Color3(1, 1, 0);
        this.turn_reverse = true;
        state.hasTimeout = true;
        state.timer = STATE_ESCAPE_PERIOD;
    }
    on_escape_timeout(state){
        this.change_state(ENEMY_STATE.IDLE);    
    }

    on_idle_enter(state){
        this.color_ball.material.albedoColor = new BABYLON.Color3(1, 0, 0);
        this.anim_walk.stop();
        this.anim_idle.start(true); 
        state.hasTimeout = true;
        state.timer = STATE_IDLE_PERIOD *(1 + Math.random());
    }
    on_idle_timeout(state){
        this.change_state(ENEMY_STATE.CHASE);    
    }

    update(time, delta){
        super.update(time, delta);
    }

    dispose(){
        super.dispose();
    }
}