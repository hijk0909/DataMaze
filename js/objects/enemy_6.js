// enemy_6.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from "../GameState.js";
import { EnemyAero } from "./base_enemy_aero.js";
import { ENEMY_STATE } from "./base_enemy.js";
import { Eff_Injection } from './eff_injection.js';

const DISP_SCALE = 0.2;

const SHOT_SPEED = 0.1; // 射出速度
const SHOT_RADIUS = 1.5; // 射出位置（中心からの距離）
const SPAWN_PERIOD = 2.0; // 表面に出てくる
const READY_PERIOD = 2.0; // 表面に付着
const CHASE_PERIOD = 1.0;
const IDLE_PERIOD = 10.0;

// 小目玉
export class Enemy_6 extends EnemyAero {

    constructor(scene){
        super(scene);

        this.radius = 0.1;
        this.mass = 0.5;
        this.hp_max = this.hp = 30;
        this.recovery_point = 30;
        this.score = 80;

        this.params.speed.chase = 0.09;
        this.params.speed.accel = 0.004;
        this.params.speed.rotation = 1.0;

        this.params.anger.is_valid = false;
        this.params.confuse.is_valid = false;

        this.params.caption.texts = ["ENEMY : SMALL EYE","Born from a big eyeball.","Annoying...",""];
        this.params.caption.color = "#ffff00";
        this.params.caption.id = "Enemy_6";

        this.spawn_count = 0;
    }

    create(position, id, type=null){

        this.id = id;
        const container = GameState.asset.mesh.enemy_6;
        const inst = container.instantiateModelsToScene( (name) => `${name}_enemy_5_${id}` );

        this.mesh = inst.rootNodes[0];
        this.mesh.scaling = new BABYLON.Vector3(DISP_SCALE, DISP_SCALE, DISP_SCALE);
        this.mesh.position = position.clone();

        this.mesh.checkCollisions = false; //障害物との衝突判定
        this.isCollidable = false;

        super.create(type);

        // 初期状態を（WAITではなく）FREE に上書き
        this.change_state(ENEMY_STATE.FREE);
    }


    on_free_enter(state){
        this.spawn_state = 0;
        this.spawn_count = 0;
    }
    on_free_update(state, time, delta){
        if (this.parent && this.parent.isAlive()){
            let radius = SHOT_RADIUS;
            if (this.spawn_state === 0){
                // ニュッと出てくる段階
                this.spawn_count += delta / 1000;
                radius = BABYLON.Scalar.Lerp(SHOT_RADIUS * 0.45, SHOT_RADIUS, this.spawn_count / SPAWN_PERIOD);
                if (this.spawn_count > SPAWN_PERIOD){
                    this.spawn_state = 1;
                    this.spawn_count = 0;
                }
            } else if (this.spawn_state === 1){
                // 表面に張りついて射出を待つ段階
                this.spawn_count += delta / 1000;
                if (this.spawn_count > READY_PERIOD){
                    this.mesh.checkCollisions = true;
                    this.isCollidable = true;
                    this.add_impulse(this.parent.get_forward_vector().scale(SHOT_SPEED));
                    this.change_state(ENEMY_STATE.CHASE);

                    const eff = new Eff_Injection(this.scene);
                    eff.create(this.mesh.position);
                    GameState.effects.push(eff);

                    GameState.asset.se.injection.play_3D(this, this.scene);
                }
            }
            this.mesh.position = this.parent.mesh.position.add(this.parent.get_forward_vector().scale(radius));
        } else {
            this.change_state(ENEMY_STATE.CHASE);
        }
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