// enemy_1.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from "../GameState.js";
import { EnemyAero } from "./base_enemy_aero.js";

const DISP_SCALE = 0.8;
const TERRITORY = 5;
const DECEL = 0.95;

// 生首
export class Enemy_1 extends EnemyAero {

    constructor(scene){
        super(scene);
        this.radius = 0.3;
        this.max_speed = 0.065;
        this.accel = 0.001;
        this.mass = 0.9;
        this.rotation_speed = 1.5;
    }

    create(position, id){

        const container = GameState.asset.mesh.enemy_1;
        const inst = container.instantiateModelsToScene( (name) => `${name}_enemy_1_${id}` );

        this.mesh = inst.rootNodes[0];
        this.mesh.scaling = new BABYLON.Vector3(DISP_SCALE, DISP_SCALE, DISP_SCALE);
        this.mesh.position = position.clone();
        this.mesh.ellipsoid = new BABYLON.Vector3(0.9, 1.0, 0.9);
        // this.create_debug_ellipsoid(this.mesh.ellipsoid); // [DEBUG]
        this.mesh.checkCollisions = true; //障害物との衝突判定

        super.create();
    }

    update(time, delta){
        const toPlayer = GameState.player.mesh.position
            .subtract(this.mesh.position);
        const dir = toPlayer.clone().normalize();

        // プレイヤーに向かって移動
        if (toPlayer.lengthSquared()  <  TERRITORY * TERRITORY && GameState.stage_state === GLOBALS.STAGE_STATE.PLAYING){
            this.control_velocity.addInPlace(dir.scale(this.accel));
        } else {
            this.control_velocity.scaleInPlace(DECEL);
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