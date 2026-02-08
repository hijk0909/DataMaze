// enemy_6.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from "../GameState.js";
import { EnemyAero } from "./base_enemy_aero.js";
import { ENEMY_STATE } from "./base_enemy.js";

const DISP_SCALE = 0.2;
const CHASE_PERIOD = 1.0;
const IDLE_PERIOD = 10.0;

// 小目玉
export class Enemy_6 extends EnemyAero {

    constructor(scene){
        super(scene);
        this.radius = 0.1;
        this.mass = 0.5;
        this.hp_max = this.hp = 60;

        this.params.speed.chase = 0.09;
        this.params.speed.accel = 0.004;
        this.params.speed.rotation = 1.0;

        this.params.anger.is_valid = false;
        this.params.confuse.is_valid = false;
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

    on_chase_enter(state){
        state.hasTimeout = true;
        state.timer = CHASE_PERIOD;
    }
    on_chase_timeout(state){
        this.change_state(ENEMY_STATE.IDLE);
    }

    on_idle_enter(state){
        state.hasTimeout = true;
        state.timer = IDLE_PERIOD;
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