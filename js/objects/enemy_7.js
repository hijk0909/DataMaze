// enemy_7.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from "../GameState.js";
import { EnemyGeo } from "./base_enemy_geo.js";

// スライム
export class Enemy_7 extends EnemyGeo {

    constructor(scene){
        super(scene);
        this.radius = 0.2;
        this.mass = 0.3;
        this.hp_max = this.hp = 60;
        this.recovery_point = 60;
        this.score = 100;

        this.params.speed.chase = 0.03;
        this.params.speed.accel = 0.003;
        this.params.speed.rush = 0.2;
        this.params.speed.turn = 0.8;
        this.params.territory = 4.0;

        this.params.caption.texts = ["ENEMY : SLIME","Alternate shots and tackles","to confuse them.","same attack repeatedly,","it will rush at you.",""];
        this.params.caption.color = "#ffff00";
        this.params.caption.id = "Enemy_7";
    }

    create(position, id, type=null){

        this.id = id;
        // メッシュ
        const container = GameState.asset.mesh.enemy_7;
        const inst = container.instantiateModelsToScene( (name) => `${name}_enemy_7_${id}` );

        const DISP_SCALE = 0.3;
        this.mesh = inst.rootNodes[0];
        this.mesh.scaling = new BABYLON.Vector3(DISP_SCALE, DISP_SCALE, DISP_SCALE);
        this.mesh.position = position.clone();

        this.mesh.ellipsoid = new BABYLON.Vector3(0.5, 0.5, 0.5);
        this.mesh.checkCollisions = true; //障害物との衝突判定

        // アニメーション
        this.anim_strech = inst.animationGroups.find(group => group.name === `strech_enemy_7_${id}`);
        if (this.anim_strech) {
            this.anim_strech.start(true); // ループ再生
            this.anim_strech.speedRatio = 0.5;
        }

        super.create(type);
    }

    on_chase_enter(){
        this.anim_strech.start(true);
    }

    on_wait_enter(){
        this.anim_strech.goToFrame(this.anim_strech.from);
        this.anim_strech.stop();
    }

    update(time, delta){
        super.update(time, delta);
    }

    dispose(){
        super.dispose();
    }
}