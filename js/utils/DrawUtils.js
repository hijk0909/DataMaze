// DrawUtils.js
import { GLOBALS } from '../GameConst.js';
import { MyMath } from './MathUtils.js';

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

const PADDING = 30;

export class MyDraw {

    static set_text_center(tobj, offset_x = 0, offset_y = 0){
        tobj.resizeToFit = true;
        tobj.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        tobj.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        tobj.alpha = 0.0;
        tobj._markAsDirty();

        tobj.onAfterDrawObservable.addOnce(() => {
            const iw = GLOBALS.UI.WIDTH;
            const ih = GLOBALS.UI.HEIGHT;
            const tw = tobj.widthInPixels;
            const th = tobj.heightInPixels;
            let x = iw /2 - tw /2 + offset_x;
            let y = ih /2 - th /2 + offset_y;
            const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
            x = clamp(x, PADDING, iw - tw - PADDING);
            y = clamp(y, PADDING, ih - th - PADDING);
            tobj.left = x;
            tobj.top = y;
            tobj.alpha = 1.0;
            // console.log("MyDraw.set_text_center 2:",iw, ih, tw, th, x, y);
        });
    }

    static set_text_position(tobj, x, y){
        tobj.resizeToFit = true;
        tobj.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        tobj.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        tobj.alpha = 0.0;
        tobj._markAsDirty();

        tobj.onAfterDrawObservable.addOnce(() => {
            const iw = GLOBALS.UI.WIDTH;
            const ih = GLOBALS.UI.HEIGHT;
            const tw = tobj.widthInPixels;
            const th = tobj.heightInPixels;
            x -= tw /2;
            y -= th /2;
            const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
            x = clamp(x, PADDING, iw - tw - PADDING);
            y = clamp(y, PADDING, ih - th - PADDING);
            tobj.left = x;
            tobj.top = tobj.top_base = y;
            tobj.alpha = 1.0;
            // console.log("MyDraw.set_text_position 2:",iw, ih, tw, th, x, y);
        });
    }

    static link_text(tobj, mesh, scene, offsetY = 0, alpha = 1.0){
        const screen_pos = MyMath.world_to_screen(mesh.position);
        if (screen_pos.z < 0.5 || screen_pos.z > 1.0){
            tobj.alpha = 0.0;
        } else if ( MyMath.is_occluded_by_terrain(mesh.position, scene)){
            tobj.alpha = 0.0;
        } else {
            tobj.alpha = alpha;
            const tw = tobj.widthInPixels;
            const th = tobj.heightInPixels;
            tobj.left = screen_pos.x - tw /2;
            tobj.top = screen_pos.y - th/ 2 + offsetY;
            // console.log("left,top:", tobj.left, tobj.top);
        }
    }
}