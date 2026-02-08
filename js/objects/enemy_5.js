// enemy_5.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from "../GameState.js";
import { EnemyAero } from "./base_enemy_aero.js";
import { ENEMY_STATE } from "./base_enemy.js";


const SHOT_COOLDOWN = 5; // 射出間隔
const SHOT_SPEED = 0.1; // 射出速度
const SHOT_RADIUS = 1.5; // 射出位置（中心からの距離）

// 大目玉
export class Enemy_5 extends EnemyAero {

    constructor(scene){
        super(scene);
        this.radius = 0.6;

        this.mass = 2.0;
        this.hp_max = this.hp = 280;

        this.damage_back_weakness = 8.0;

        this.params.territory = 7.0;
        this.params.speed.accel = 0.001;
        this.params.speed.decel = 0.99;
        this.params.speed.chase = 0.025;
        this.params.speed.rotation = 0.4;
        this.params.damage.shot_knockback = 0.01;

        this.params.anger.is_valid = false;
        this.params.confuse.is_valid = false;

        this.shot_cooldown = 0;
    }

    create(position, id){

        const container = GameState.asset.mesh.enemy_5;
        const inst = container.instantiateModelsToScene( (name) => `${name}_enemy_5_${id}` );

        const DISP_SCALE = 1.0;
        this.mesh = inst.rootNodes[0];
        this.mesh.scaling = new BABYLON.Vector3(DISP_SCALE, DISP_SCALE, DISP_SCALE);
        this.mesh.position = position.clone();
        this.mesh.checkCollisions = true; //障害物との衝突判定

        super.create();
    }

    shot(direction){
        const spawnPosition = this.mesh.position.add(direction.scale(SHOT_RADIUS));
        const enemy = GameState.spawn.spawn_enemy("Enemy_6", spawnPosition);
        enemy.add_impulse(direction.scale(SHOT_SPEED));
    }

    update(time, delta){

        if (this.current_state.id === ENEMY_STATE.CHASE){
            this.shot_cooldown -= delta / 1000;
            if (this.shot_cooldown < 0){
                this.shot_cooldown = SHOT_COOLDOWN;
                // 射出
                this.shot(this.get_forward_vector());
            }
        }
        super.update(time, delta);
    }

    dispose(){
        super.dispose();
    }
}