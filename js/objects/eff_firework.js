// eff_firework.js
import { GameState } from "../GameState.js";
import { Effect } from "./_effect.js";

export class Eff_Firework extends Effect {

    constructor(scene){
        super(scene);
    }

    create(position){
        this.particleTexture = GameState.asset.texture.particle;

        // パーティクルシステムの生成
        const particleSystem = new BABYLON.ParticleSystem("firework", 2000, this.scene);
        
        // パーティクル用のテクスチャを設定
        particleSystem.particleTexture = this.particleTexture.clone();
        // particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
        particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;

        // パーティクルの大きさ
        particleSystem.minSize = 0.2;
        particleSystem.maxSize = 0.3;

        // エミッターの位置を設定 (花火が始まる位置)
        particleSystem.emitter = position; 
        
        // パーティクルの生存期間 (秒)
        particleSystem.minLifeTime = 0.4;
        particleSystem.maxLifeTime = 0.6;
        
        // 速度 (拡散の速さ)
        particleSystem.minEmitPower = 3.2;
        particleSystem.maxEmitPower = 3.3;
        
        // ランダムな初期色 (色とりどり)
        // ここではランダムな色を一つ設定し、時間の経過でフェードアウト
        const color = BABYLON.Color3.Random();
        particleSystem.color1 = new BABYLON.Color4(color.r, color.g, color.b, 1.0); // 初期の色
        particleSystem.color2 = new BABYLON.Color4(color.r * 0.5, color.g * 0.5, color.b * 0.5, 0.8); // 中間の色
        particleSystem.colorDead = new BABYLON.Color4(color.r * 0.1, color.g * 0.1, color.b * 0.1, 0.0); // 消滅時の色 (透明な黒)

        // 重力を無効または軽く設定 (花火の飛び散り方)
        // Y軸方向の重力 (下向き)
        particleSystem.gravity = new BABYLON.Vector3(0, -9.81 * 0.1, 0); 
        
        // 発生率 (1秒あたりに発生させるパーティクルの数)
        particleSystem.emitRate = 300; 

        // 拡散の形状を球状に設定 (花火のように全方向に広がる)
        const radius = 0.01; 
        const sphereEmitter = new BABYLON.SphereParticleEmitter(radius);
        particleSystem.particleEmitterType = sphereEmitter;
        
        // 1回で放出するパーティクルの総数
        particleSystem.manualEmitCount = 40; 
        // 花火は短時間で消えるため、オートクリアを設定
        // オートクリアを設定しているため、花火の寿命が尽きると自動で消滅します。
        particleSystem.disposeOnStop = true;        


        // 終了時のイベントを追加
        this._particleObserver = this.scene.onBeforeRenderObservable.add(() => {
            if (!particleSystem.isStarted() && particleSystem.getActiveCount() === 0) {
                this.alive = false;
                this.scene.onBeforeRenderObservable.remove(this._particleObserver);
            }
        });

        // 再生を開始 (手動で停止させるか、パーティクルの寿命が尽きるまで)
        particleSystem.start(); 
    }

    update(time, delta){

    }

    dispose(){
        super.dispose();
    }
}