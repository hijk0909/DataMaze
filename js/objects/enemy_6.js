// enemy_6.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from "../GameState.js";
import { EnemyAero } from "./base_enemy_aero.js";

const DISP_SCALE = 0.2;

// 小目玉
export class Enemy_6 extends EnemyAero {

    constructor(scene){
        super(scene);
        this.radius = 0.1;
        this.mass = 0.5;
        this.hp_max = this.hp = 60;

        this.params.speed.chase = 0.15;
        this.params.speed.accel = 0.008;
        this.params.speed.rotation = 1.0;
    }

    create(position, id){

        const container = GameState.asset.mesh.enemy_6;
        const inst = container.instantiateModelsToScene( (name) => `${name}_enemy_5_${id}` );

        this.mesh = inst.rootNodes[0];
        this.mesh.scaling = new BABYLON.Vector3(DISP_SCALE, DISP_SCALE, DISP_SCALE);
        this.mesh.position = position.clone();

        this.mesh.checkCollisions = false; //障害物との衝突判定

        super.create();
    }

    update(time, delta){
        super.update(time, delta);
    }

    dispose(){
        super.dispose();
    }
}