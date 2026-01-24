// enemy_1.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from "../GameState.js";
import { EnemyAero } from "./base_enemy_aero.js";

// 生首
export class Enemy_1 extends EnemyAero {

    constructor(scene){
        super(scene);
        this.radius = 0.3;
        this.mass = 0.9;
        this.rotation_speed = 1.5;

        this.params.speed.chase = 0.065;
        this.params.speed.accel = 0.001;
        this.params.speed.decel = 0.95;
        this.params.speed.rotation = 1.5;
        this.params.territory = 5.0;
    }

    create(position, id){

        const container = GameState.asset.mesh.enemy_1;
        const inst = container.instantiateModelsToScene( (name) => `${name}_enemy_1_${id}` );

        const DISP_SCALE = 0.8;
        this.mesh = inst.rootNodes[0];
        this.mesh.scaling = new BABYLON.Vector3(DISP_SCALE, DISP_SCALE, DISP_SCALE);
        this.mesh.position = position.clone();
        this.mesh.ellipsoid = new BABYLON.Vector3(0.9, 1.0, 0.9);
        // this.create_debug_ellipsoid(this.mesh.ellipsoid); // [DEBUG]
        this.mesh.checkCollisions = true; //障害物との衝突判定

        super.create();
    }

    update(time, delta){
        super.update(time, delta);
    }

    dispose(){
        super.dispose();
    }
}