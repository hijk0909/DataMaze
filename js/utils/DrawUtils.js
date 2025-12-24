// DrawUtils.js

export class Wipe {
    constructor(scene, camera) {
        this.scene = scene;
        const engine = scene.getEngine();

        // ポストプロセスの作成
        this.postProcess = new BABYLON.PostProcess(
            "WipeProcess", 
            "wipe", // ShadersStoreの接頭辞
            ["center", "radius", "alpha", "aspectRatio"], // Uniforms
            null, 
            1.0, 
            camera
        );

        // 初期パラメータ
        this.params = {
            radius: 0.0,
            alpha: 0.0,
            center: new BABYLON.Vector2(0.5, 0.5)
        };

        this.postProcess.onApply = (effect) => {
            effect.setVector2("center", this.params.center);
            effect.setFloat("radius", this.params.radius);
            effect.setFloat("alpha", this.params.alpha);
            effect.setFloat("aspectRatio", engine.getRenderWidth() / engine.getRenderHeight());
        };
    }

    wipe_in(duration = 3000) {
        this.params.alpha = 1.0;
        let startTime = performance.now();
        
        const observer = this.scene.onBeforeRenderObservable.add(() => {
            let progress = Math.min((performance.now() - startTime) / duration, 1);
            // 0から1.5くらいまで広げる（画面全体を覆うため）
            this.params.radius = progress * 1.2; 

            if (progress >= 1) {
                this.scene.onBeforeRenderObservable.remove(observer);
                this.params.alpha = 0.0; // 完全に終わったら効果を消す
            }
        });
    }

    wipe_out(duration = 2000) {
        let startTime = performance.now();
        const observer = this.scene.onBeforeRenderObservable.add(() => {
            let elapsed = performance.now() - startTime;
            let progress = Math.min(elapsed / duration, 1);
            
            this.params.radius = 1.2 * (1 - progress);
            this.params.alpha = Math.min(elapsed / 500, 1.0); // チラつき防止のフェードイン

            if (progress >= 1) {
                this.scene.onBeforeRenderObservable.remove(observer);
            }
        });
    }
}