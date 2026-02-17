// GameClearScene.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from "../GameState.js";
import { Game } from "../main.js";
import { Scene } from "./base_scene.js";
import { TitleScene } from "./TitleScene.js";
import { GameClearAsset } from "./GameClearAsset.js";
import { MyInput } from "../utils/InputUtils.js"
import { ScrollText } from "../utils/DrawUtils.js"

export class GameClearScene extends Scene {
    constructor(game) {
        super(game);
        this.my_input = null;
        this.asset = null;
        this.scroll_text = null;
    }

    setup(){
        // [Camera]
        this.camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0,2,-5), this.scene);
        // [UI]
        this.ui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        this.ui.idealWidth = GLOBALS.UI.WIDTH;
        this.ui.idealHeight = GLOBALS.UI.HEIGHT;
        this.ui.renderAtIdealSize = true;
    }

    async preload(){
        this.asset = new GameClearAsset(this.scene);
        await this.asset.preload();
    }

    create(){
        const scene = this.scene;
        scene.clearColor = new BABYLON.Color4(0,0,0,1);

        // Input
        this.my_input = new MyInput(scene, this.game);
        this.my_input.registerNextAction(() => this.goto_title());

        // Image
        this.image = new BABYLON.GUI.Image("myImage", "./assets/textures/game_clear.jpg");
        this.image.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.image.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.image.top = 100;
        this.image.onImageLoadedObservable.add(() => {
             this.image.width = this.image.domImage.width + "px";
             this.image.height = this.image.domImage.height + "px"; });
        this.ui.addControl(this.image);

        const lines = [
            "Epilogue",
            "",
            "Once upon a time, the world was filled with information.",
            "Humans thought they understood and controlled it.",
            "",
            "--But the labyrinth continued to be quietly generated.",
            "",
            ""
        ];

        // ◆スクロールテキスト
        this.scroll_text = new ScrollText(this.ui, this.scene);
        // this.scroll_text.play(lines, () => {this.goto_title();}, 3000);
        this.scroll_text.play(lines);
        // Sound
        this.asset.bgm.epilogue.play(true);
    }

    goto_title(){
        // スクロールテキストの自動更新を停止（必須）
        this.scroll_text.stop();
        // タイトル画面に遷移
        Game.sceneManager.changeScene(new TitleScene(Game));
    }

    update(time, delta){
        if (this.my_input){
            this.my_input.update(time, delta);
        }
        super.update();
    }

    dispose() {
        if (this.camera){
            this.camera.dispose();
            this.camera = null;
        }
        if (this.my_input){
            this.my_input.dispose();
            this.my_input = null;
        }
        if (this.ui){
            this.ui.dispose();
            this.ui = null;
        }
        if (this.image){
            this.image.dispose();
            this.image = null;
        }
        if (this.scroll_text){
            this.scroll_text.dispose();
            this.scroll_text = null;
        }
        if (this.asset){
            this.asset.dispose();
            this.asset = null;
        }
        super.dispose();
    }
}