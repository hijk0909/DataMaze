// enemy_3.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from "../GameState.js";
import { Enemy } from "./base_enemy.js";

export class Enemy_3 extends Enemy {

    constructor(scene){
        super(scene);
        this.radius = 0.7;
        this.max_speed = 0.02;
        this.accel = 0.003;
        this.mass = 0.5;
        this.hp_max = 250;
        this.hp = 250;

        this.turn_speed = 0.6;
    }

    create(position, id){

        const container = GameState.asset.mesh.enemy_3;
        const inst = container.instantiateModelsToScene( (name) => `${name}_enemy_3_${id}` );

        this.mesh = inst.rootNodes[0];
        this.mesh.ellipsoid = new BABYLON.Vector3(1.2, 0.8, 1.2);
        this.mesh.scaling = new BABYLON.Vector3(0.8, 0.8, 0.8);
        this.mesh.scaling.z = Math.abs(this.mesh.scaling.z);
        this.mesh.position = position.clone();

        this.mesh.checkCollisions = true; //障害物との衝突判定
        this.mesh.rotationQuaternion = null; //クオータニオンは使わない（オイラー角で回転制御)

        // アニメーション
        // console.log("enemy 3 anim:", inst.animationGroups);
        this.anim_walk = inst.animationGroups.find(group => group.name === `walk_enemy_3_${id}`);
        if (this.anim_walk) {
            this.anim_walk.start(true); // ループ再生
            this.anim_walk.speedRatio = 1.1;
        }

        super.create();
    }

    update(time, delta){
        const dir = GameState.player.mesh.position
            .subtract(this.mesh.position)
            .normalize();
        this.velocity_new.addInPlace(dir.scale(this.accel));
        // 速度制限
        if (this.velocity_new.length() > this.max_speed) {
            this.velocity_new.normalize().scaleInPlace(this.max_speed);
        }
        this.mesh.moveWithCollisions(this.velocity_new);
        this.velocity = this.velocity_new.clone();

        // 上下の動きを制限
        this.mesh.position.y = GLOBALS.MOVABLE.Y.MIN;

        // 向きの制御
        // 現在の forward
        const forward = this.mesh.forward.clone();
        forward.y = 0;
        forward.normalize();
        // プレイヤー方向
        const toPlayer = GameState.player.mesh.position
            .subtract(this.mesh.position);
        toPlayer.y = 0;
        toPlayer.normalize();
        // 角度差（符号付き）
        const dot = BABYLON.Vector3.Dot(forward, toPlayer);
        const cross = BABYLON.Vector3.Cross(forward, toPlayer);
        let angle = Math.atan2(cross.y, dot);
        // 最大回転量制限
        const maxTurn = this.turn_speed * delta / 1000;
        angle = BABYLON.Scalar.Clamp(angle, -maxTurn, maxTurn);
        // Y 軸回転
        this.mesh.rotation.y += angle;

        super.update(time, delta);
    }

    dispose(){
        super.dispose();
    }
}