// TitleScene.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from "../GameState.js";
import { Game } from "../main.js";
import { Scene } from "./base_scene.js";
import { GameScene } from "./GameScene.js";
import { MyAudio } from "../utils/AudioUtils.js"
import { MyInput } from "../utils/InputUtils.js"
import { MyDraw } from "../utils/DrawUtils.js"

export class TitleScene extends Scene {
    constructor(game) {
        super(game);
        this.my_input = null;
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
        this.image = new BABYLON.GUI.Image("myImage", "./assets/textures/title.jpg");
        // await document.fonts.load('12px "MyGameFont"');
        // await document.fonts.ready;
        // console.log("Font loaded!");
    }

    create(){
        const scene = this.scene;
        scene.clearColor = new BABYLON.Color4(0,0,0,1);

        // Input
        this.my_input = new MyInput(scene, this.game);
        this.my_input.registerNextAction(() => this.start_game());

        // Image
        this.image.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.image.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.image.top = 100;
        this.image.onImageLoadedObservable.add(() => {
        this.image.width = this.image.domImage.width + "px";
        this.image.height = this.image.domImage.height + "px"; });
        this.ui.addControl(this.image);

        // Text
        this.text1 = new BABYLON.GUI.TextBlock();
        this.text1.text = "START GAME\nPUSH SPACE KEY";
        this.text1.color = "white";
        this.text1.fontFamily = "MyGameFont";
        this.text1.fontSize = 64;
        MyDraw.set_text_center(this.text1, 0, 100);
        this.ui.addControl(this.text1);

        this.text2 = new BABYLON.GUI.TextBlock();
        this.text2.text = `v${GLOBALS.VERSION} - ${GLOBALS.DATE}`;
        this.text2.color = "white";
        this.text2.fontFamily = "MyGameFont";
        this.text2.fontSize = 42;
        MyDraw.set_text_center(this.text2, 0, 240);
        this.ui.addControl(this.text2);


        // AudioEngine の強制初期化
        this.audio = new MyAudio();
    }

    start_game(){
        // ユーザ操作後にオーディオ初期化
        MyAudio.initialize();
        // ゲームパラメータの初期化
        GameState.reset();
        // ゲーム画面に遷移
        Game.sceneManager.changeScene(new GameScene(Game));
        // console.log("TitleScene: scene changed");
    }
    update(){
        super.update();
    }

    dispose() {
        // console.log("TitleScene: dispose");
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
        super.dispose();
        // console.log("TitleScene Diposed");
    }
}