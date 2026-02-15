// TitleScene.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from "../GameState.js";
import { Game } from "../main.js";
import { Scene } from "./base_scene.js";
import { GameScene } from "./GameScene.js";
import { ConfigScene } from "./ConfigScene.js";
import { AttractScene } from "./AttractScene.js";
import { MyAudio } from "../utils/AudioUtils.js"
import { MyInput } from "../utils/InputUtils.js"
import { MyDraw } from "../utils/DrawUtils.js"

const FONT_SIZE = 48;
const FONT_HEIGHT = "52px";
const FONT_SPACING = 4;

export class TitleScene extends Scene {
    constructor(game) {
        super(game);
        this.my_input = null;
    }

    setup(){
        // [Camera]
        this.camera = new BABYLON.FreeCamera("camera_title", new BABYLON.Vector3(0,2,-5), this.scene);
        // [UI]
        this.ui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI_title", true, this.scene);
        this.ui.idealWidth = GLOBALS.UI.WIDTH;
        this.ui.idealHeight = GLOBALS.UI.HEIGHT;
        this.ui.renderAtIdealSize = true;
    }

    async preload(){
        this.image = new BABYLON.GUI.Image("myImage", "./assets/textures/title.jpg");
        // default だと "100%" になって StackPanel に使えないので仮の絶対値の大きさを指定
        this.image.height ="1px";
        this.image.width = "1px";
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
        this.my_input.registerConfirmAction(() => this.goto_config());

        // ◆ タイトル画面（コンテナパネル）
        this.panel_title = new BABYLON.GUI.StackPanel();
        const panel = this.panel_title;
        panel.isVertical = true;
        panel.isVisible = false; // imageの大きさが確定するまでは非表示
        panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        panel.verticalAlignment   = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        panel.paddingTop  = "10px";
        panel.paddingLeft = "10px";
        panel.spacing = FONT_SPACING; //行間(px)
        panel.fontFamily = "MyGameFont";
        this.ui.addControl(panel);
        this.panel_title.isVisible = false;

        // Image
        this.image.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.image.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.image.top = 100;
        this.image.onImageLoadedObservable.add(() => {
          this.image.width = this.image.domImage.width + "px";
          this.image.height = this.image.domImage.height + "px"; 
          this.panel_title.isVisible = true;
        });
        this.panel_title.addControl(this.image);

        // Text
        this.text1 = new BABYLON.GUI.TextBlock();
        this.text1.text = "START GAME\nPUSH SPACE KEY";
        this.text1.color = "white";
        this.text1.fontFamily = "MyGameFont";
        this.text1.fontSize = 64;
        MyDraw.set_text_center(this.text1, 0, 100);
        this.panel_title.addControl(this.text1);

        this.text2 = new BABYLON.GUI.TextBlock();
        this.text2.text = `v${GLOBALS.VERSION} - ${GLOBALS.DATE}`;
        this.text2.color = "white";
        this.text2.fontFamily = "MyGameFont";
        this.text2.fontSize = 42;
        MyDraw.set_text_center(this.text2, 0, 240);
        this.panel_title.addControl(this.text2);

        // AudioEngine の強制初期化
        this.audio = new MyAudio();
    }

    start_game(){
        // ユーザ操作後にオーディオ初期化
        MyAudio.initialize();
        // ゲームパラメータの初期化
        GameState.reset();
        // ゲーム画面に遷移
        Game.sceneManager.changeScene(new GameScene(Game), true);
        // console.log("TitleScene: scene changed");
    }

    goto_config(){
        Game.sceneManager.changeScene(new ConfigScene(this.game));
    }

    goto_attract(){
        Game.sceneManager.changeScene(new AttractScene(this.game));        
    }

    update(time, delta){
        if (this.my_input){
            this.my_input.update(time, delta);
        }
        // 隠しキー
        if (GameState.inputKey && GameState.inputKey["a"]){
            this.goto_attract();
        }
        super.update();
    }

    dispose() {
        // console.log("TitleScene: dispose");
        if (this.text){
            this.text.dispose();
            this.text = null;
        }
        if (this.image){
            this.image.dispose();
            this.image = null;
        }
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
        // console.log("TitleScene diposed");
    }
}