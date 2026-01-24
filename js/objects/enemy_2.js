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
        this.mass = 0.7;

        this.params.speed.rotation = 3.0;
        this.params.speed.accel = 0.005;
        this.params.speed.chase = 0.10;
        this.params.territory = 6.0;
        this.params.damage.shot_weakness = 6.0;
        this.params.damage.shot_knockback = 1.5;
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
        this.anim_fly.speedRatio = 3.0;

        super.create();
    }

    on_chase_enter(state){
        this.anim_fly.start(true);
    }

    on_idle_enter(state){
        this.anim_fly.goToFrame(this.anim_fly.from);
        this.anim_fly.stop();
    }

    update(time, delta){
        super.update(time, delta);
    }

    dispose(){
        super.dispose();
    }
}