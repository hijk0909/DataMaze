// GameClearScene.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from "../GameState.js";
import { Game } from "../main.js";
import { Scene } from "./base_scene.js";
import { TitleScene } from "./TitleScene.js";
import { MyInput } from "../utils/InputUtils.js"

export class GameClearScene extends Scene {
    constructor(game) {
        super(game);
        this.my_input = null;
        this.jingle = {};
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

        // Text
        this.text = new BABYLON.GUI.TextBlock();
        this.text.text = "ALL CLEAR\nPUSH SPACE KEY";
        this.text.color = "white";
        this.text.fontSize = 80;
        this.ui.addControl(this.text);
    }

    goto_title(){
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
        if (this.text){
            this.text.dispose();
            this.text = null;
        }
        if (this.image){
            this.image.dispose();
            this.image = null;
        }
        if (this.jingle.gameclear){
            this.jingle.gameclear.dispose();
            this.jingle.gameclear = null;
        }
        super.dispose();
    }
}