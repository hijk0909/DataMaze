// UITransition.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from "../GameState.js";

const WIPE_IN_PERIOD = 2000;
const WIPE_OUT_PERIOD = 1000;

export class UITransition {
    constructor(engine) {
        this.engine = engine;
        this.scene = new BABYLON.Scene(engine);
        this.scene.autoClear = false; //下のシーンを消さない
        this.scene.detachControl(); //入力不要
        this.camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0,2,-5), this.scene);
        this.ui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI( "UITransition", true, this.scene );

        this.create();
    }

    create(){
        // [Wipe] 



        // [Loading] ロード中表示文字列
        this.loading = new BABYLON.GUI.TextBlock();
        this.loading.text = "NOW LOADING...";
        this.loading.color = "white";
        this.loading.fontSize = 32;
        this.loading.isVisible = false;
        this.loading.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.loading.verticalAlignment   = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.ui.addControl(this.loading);
    }

    show_loading(){
        this.loading.isVisible = true;
    }

    hide_loading(){
        this.loading.isVisible = false;
    }

    update(time, delta){
    }

    dispose(){
    // 常駐UI なので、原則として dispose() されることは無いハズ
        if (this.loading){
            this.loading.dispose();
            this.loading = null;
        }
        this.ui.dispose();
    }
}
