// enemy_2.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from "../GameState.js";
import { EnemyAero } from "./base_enemy_aero.js";

const DISP_SCALE = 0.3;
const TERRITORY = 6;
const DECEL = 0.90;

// 蜂
export class Enemy_2 extends EnemyAero{

    constructor(scene){
        super(scene);
        this.radius = 0.15;
        this.max_speed = 0.10;
        this.accel = 0.005;
        this.mass = 0.7;
        this.rotation_speed = 3.0;

        this.shot_weakness = 6.0;
        this.shot_knockback = 1.5;
    }

    create(position, id){

        const container = GameState.asset.mesh.enemy_2;
        const inst = container.instantiateModelsToScene( (name) => `${name}_enemy_2_${id}` );

        this.mesh = inst.rootNodes[0];
        this.mesh.scaling = new BABYLON.Vector3(DISP_SCALE, DISP_SCALE, DISP_SCALE);
        this.mesh.position = position.clone();

        this.mesh.ellipsoid = new BABYLON.Vector3(0.4, 0.5, 0.4);
        // this.create_debug_ellipsoid(this.mesh.ellipsoid); // [DEBUG]
        this.mesh.checkCollisions = true; //障害物との衝突判定

        // アニメーション
        this.anim_fly = inst.animationGroups.find(group => group.name === `fly_enemy_2_${id}`);
        if (this.anim_fly) {
            this.anim_fly.start(true); // ループ再生
            this.anim_fly.speedRatio = 3.0;
        }

        super.create();
    }

    update(time, delta){
        const toPlayer = GameState.player.mesh.position
            .subtract(this.mesh.position);
        const dir = toPlayer.clone().normalize();

        // プレイヤーに向かって移動
        if (toPlayer.lengthSquared()  <  TERRITORY * TERRITORY && GameState.stage_state === GLOBALS.STAGE_STATE.PLAYING){
            this.control_velocity.addInPlace(dir.scale(this.accel));
            this.anim_fly.start(true);
        } else {
            this.control_velocity.scaleInPlace(DECEL);
            this.anim_fly.goToFrame(this.anim_fly.from);
            this.anim_fly.stop();
        }

        // 速度制限
        if (this.control_velocity.length() > this.max_speed) {
            this.control_velocity.normalize().scaleInPlace(this.max_speed);
        }

        super.update(time, delta);
    }

    dispose(){
        super.dispose();
    }
}