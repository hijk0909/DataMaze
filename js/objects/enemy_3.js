// enemy_3.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from "../GameState.js";
import { EnemyGeo } from "./base_enemy_geo.js";

// イノシシ
export class Enemy_3 extends EnemyGeo {

    constructor(scene){
        super(scene);
        this.radius = 0.8;

        this.accel = 0.001;
        this.mass = 1.1;
        this.hp_max = this.hp = 250;

        this.params.damage.back_weakness = 8.0;
        this.params.damage.shot_knockback = 1.0;
        this.params.speed.turn = 0.2;
        this.params.speed.chase = 0.04;
        this.params.speed.accel = 0.003;
        this.params.speed.decel = 0.95;
        this.params.territory = 4.0;
        this.params.anger.rush_period = 3.0;
    }

    create(position, id){

        const container = GameState.asset.mesh.enemy_3;
        const inst = container.instantiateModelsToScene( (name) => `${name}_enemy_3_${id}` );

        const DISP_SCALE = 0.8;
        this.mesh = inst.rootNodes[0];
        this.mesh.scaling = new BABYLON.Vector3(DISP_SCALE, DISP_SCALE, DISP_SCALE);
        this.mesh.position = position.clone();

        this.mesh.ellipsoid = new BABYLON.Vector3(0.9, 0.8, 0.9);
        // this.create_debug_ellipsoid(this.mesh.ellipsoid); // [DEBUG]
        this.mesh.checkCollisions = true; //障害物との衝突判定

        // アニメーション
        // console.log("enemy 3 anim:", inst.animationGroups);
        this.anim_walk = inst.animationGroups.find(group => group.name === `walk_enemy_3_${id}`);
        this.anim_walk.speedRatio = 1.1;
        super.create();
    }

    on_chase_enter(state){
        this.anim_walk.start(true); // ループ再生
    }

    on_confused_enter(state){
        this.anim_walk.goToFrame(this.anim_walk.from);
        this.anim_walk.stop();
    }

    update(time, delta){
        super.update(time, delta);
    }

    dispose(){
        super.dispose();
    }
}