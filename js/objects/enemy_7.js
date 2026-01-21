// enemy_7.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from "../GameState.js";
import { EnemyGeo } from "./base_enemy_geo.js";

const DISP_SCALE = 0.3;
const TERRITORY = 4;
const DECEL = 0.95;

// スライム
export class Enemy_7 extends EnemyGeo {

    constructor(scene){
        super(scene);
        this.radius = 0.2;
        this.max_speed = 0.03;
        this.accel = 0.003;
        this.mass = 0.3;
        this.hp_max = this.hp = 60;

        this.turn_speed = 0.8;
    }

    create(position, id){

        const container = GameState.asset.mesh.enemy_7;
        const inst = container.instantiateModelsToScene( (name) => `${name}_enemy_7_${id}` );

        this.mesh = inst.rootNodes[0];
        this.mesh.scaling = new BABYLON.Vector3(DISP_SCALE, DISP_SCALE, DISP_SCALE);
        this.mesh.position = position.clone();

        this.mesh.ellipsoid = new BABYLON.Vector3(0.5, 0.5, 0.5);
        this.mesh.checkCollisions = true; //障害物との衝突判定
        this.mesh.rotationQuaternion = null; //クオータニオンは使わない（オイラー角で回転制御)

        // アニメーション
        this.anim_strech = inst.animationGroups.find(group => group.name === `strech_enemy_7_${id}`);
        if (this.anim_strech) {
            this.anim_strech.start(true); // ループ再生
            this.anim_strech.speedRatio = 0.5;
        }

        super.create();
    }

    update(time, delta){
        const toPlayer = GameState.player.mesh.position
            .subtract(this.mesh.position);
        const dir = toPlayer.clone().normalize();
        // console.log("Enemy_3 ls:", toPlayer.lengthSquared());

        // プレイヤーに向かって移動
        if (toPlayer.lengthSquared()  <  TERRITORY * TERRITORY && GameState.stage_state === GLOBALS.STAGE_STATE.PLAYING){
            this.control_velocity.addInPlace(dir.scale(this.accel));
            this.anim_strech.start(true);
        } else {
            this.control_velocity.scaleInPlace(DECEL);
            this.anim_strech.goToFrame(this.anim_strech.from);
            this.anim_strech.stop();
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