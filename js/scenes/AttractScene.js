// AttractScene.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from "../GameState.js";
import { Game } from "../main.js";
import { Scene } from "./base_scene.js";
import { TitleScene } from "./TitleScene.js";
import { MyInput } from "../utils/InputUtils.js"
import { ScrollText } from "../utils/DrawUtils.js"

export class AttractScene extends Scene {
    constructor(game) {
        super(game);
        this.my_input = null;
        this.scroll_text = null;
    }

    setup(){
        // [Camera]
        this.camera = new BABYLON.FreeCamera("camera_attract", new BABYLON.Vector3(0,2,-5), this.scene);
        // [UI]
        this.ui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI_attract", true, this.scene);
        this.ui.idealWidth = GLOBALS.UI.WIDTH;
        this.ui.idealHeight = GLOBALS.UI.HEIGHT;
        this.ui.renderAtIdealSize = true;
    }

    async preload(){
    }

    create(){
        const lines = [
            "Prologue",
            "",
            "Once upon a time, the world was filled with information.",
            "Humans thought they understood and controlled it.",
            "",
            "--But the labyrinth continued to be quietly generated.",
            "",
            ""
        ];

        // ◆ 入力関連
        this.my_input = new MyInput(this.scene, this.game);
        this.my_input.registerNextAction(() => this.goto_title());
        // ◆スクロールテキスト
        this.scroll_text = new ScrollText(this.ui, this.scene);
        this.scroll_text.play(lines, () => {this.goto_title();}, 1000);
    }

    goto_title(){
        // スクロールテキストの自動更新を停止（必須）
        this.scroll_text.stop();
        // タイトル画面に遷移
        Game.sceneManager.changeScene(new TitleScene(this.game));
    }


    update(time, delta){
        if (this.my_input){
            this.my_input.update(time, delta);
        }
        // 隠しキー
        if (GameState.inputKey && GameState.inputKey["q"]){
            this.goto_title();
        }
        super.update();
    }

    dispose() {
        // console.log("ConfigScene: dispose");
        if (this.my_input){
            this.my_input.dispose();
            this.my_input = null;
        }
        if (this.ui){
            this.ui.dispose();
            this.ui = null;
        }
        if (this.camera){
            this.camera.dispose();
            this.camera = null;
        }
        super.dispose();
        // console.log("ConfigScene Diposed");
    }
}