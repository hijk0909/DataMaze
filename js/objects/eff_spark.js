//eff_spark.js

import { GLOBALS } from "../GameConst.js";
import { GameState } from "../GameState.js";
import { Effect } from "./base_effect.js";

export class Eff_Spark extends Effect {

    constructor(scene){
        super(scene);
    }

    // 接触時の火花
    create(pos, impulse){
        super.create(null); // meshは存在しない 

        const scale = impulse.length() / GLOBALS.EFFECT.SPARK_IMPULSE_THRESHOLD;

        this.particleTexture = GameState.asset.texture.charge;

        // パーティクルシステム
        const ps = new BABYLON.ParticleSystem("spark", 2000, this.scene);
        ps.particleTexture = this.particleTexture.clone();
        ps.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
        ps.billboardMode = BABYLON.ParticleSystem.BILLBOARDMODE_STRETCHED;
        ps.minSize = 0.03;
        ps.maxSize = 0.06;
        ps.minLifeTime = 0.3;
        ps.maxLifeTime = 0.4;

        // エミッター
        ps.emitter = pos.clone();
        ps.minEmitPower = 0.5 * scale;
        ps.maxEmitPower = 1.0 * scale;
        ps.updateSpeed =  0.02;
        ps.gravity = new BABYLON.Vector3(0, -6, 0);

        ps.emitRate = 0;
        ps.manualEmitCount = 60;

        const radius = 0.1 * scale;
        const sphereEmitter = new BABYLON.SphereParticleEmitter(radius);
        ps.particleEmitterType = sphereEmitter;

        ps.targetStopDuration = 0.05;

        // 色
        ps.addColorGradient(0.0, new BABYLON.Color4(1, 1, 1, 1));
        ps.addColorGradient(0.3, new BABYLON.Color4(0.3, 0.8, 1, 1));
        ps.addColorGradient(0.6, new BABYLON.Color4(0.1, 0.4, 1, 0.8));
        ps.addColorGradient(1.0, new BABYLON.Color4(0.05, 0.2, 1, 0));

        // 終了時のイベントを追加
        this._particleObserver = this.scene.onBeforeRenderObservable.add(() => {
            if (!ps.isStarted() && ps.getActiveCount() === 0) {
                this.alive = false;
                ps.dispose();
                this.scene.onBeforeRenderObservable.remove(this._particleObserver);
            }
        });

        ps.start(); 
    }

    update(time, delta){
        super.update();
    }

    dispose(){
        super.dispose();
    }
}