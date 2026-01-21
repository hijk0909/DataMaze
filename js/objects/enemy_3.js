// enemy_3.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from "../GameState.js";
import { EnemyGeo } from "./base_enemy_geo.js";

const DISP_SCALE = 0.8;
const TERRITORY = 4;
const DECEL = 0.95;

// イノシシ
export class Enemy_3 extends EnemyGeo {

    constructor(scene){
        super(scene);
        this.radius = 0.8;
        this.max_speed = 0.02;
        this.accel = 0.001;
        this.mass = 1.1;
        this.hp_max = this.hp = 250;

        this.back_weakness = 8.0;
        this.shot_knockback = 1.0;

        this.turn_speed = 0.2;
    }

    create(position, id){

        const container = GameState.asset.mesh.enemy_3;
        const inst = container.instantiateModelsToScene( (name) => `${name}_enemy_3_${id}` );

        this.mesh = inst.rootNodes[0];
        this.mesh.scaling = new BABYLON.Vector3(DISP_SCALE, DISP_SCALE, DISP_SCALE);
        this.mesh.position = position.clone();

        this.mesh.ellipsoid = new BABYLON.Vector3(0.9, 0.8, 0.9);
        // this.create_debug_ellipsoid(this.mesh.ellipsoid); // [DEBUG]
        this.mesh.checkCollisions = true; //障害物との衝突判定

        // アニメーション
        // console.log("enemy 3 anim:", inst.animationGroups);
        this.anim_walk = inst.animationGroups.find(group => group.name === `walk_enemy_3_${id}`);
        if (this.anim_walk) {
            this.anim_walk.speedRatio = 1.1;
            this.anim_walk.start(true); // ループ再生
        }

        super.create();
    }

    update(time, delta){
        const toPlayer = GameState.player.mesh.position
            .subtract(this.mesh.position);
        const dir = toPlayer.clone().normalize();

        if (toPlayer.lengthSquared()  <  TERRITORY * TERRITORY && GameState.stage_state === GLOBALS.STAGE_STATE.PLAYING){
            // プレイヤーに向かって移動
            this.control_velocity.addInPlace(dir.scale(this.accel));
            this.anim_walk.start(true);
        } else {
            // 立ち止まる
            this.control_velocity.scaleInPlace(DECEL);
            this.anim_walk.goToFrame(this.anim_walk.from);
            this.anim_walk.stop();
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