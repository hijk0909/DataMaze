// TitleScene.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from "../GameState.js";
import { Game } from "../main.js";
import { Scene } from "./base_scene.js";
import { GameScene } from "./GameScene.js";
import { ConfigScene } from "./ConfigScene.js";
import { AttractScene } from "./AttractScene.js";
import { GameClearScene } from "./GameClearScene.js";
import { MyAudio } from "../utils/AudioUtils.js"
import { MyInput } from "../utils/InputUtils.js"
import { MyDraw } from "../utils/DrawUtils.js"

const ATTRACT_TIMER = 12;

export class TitleScene extends Scene {
    constructor(game) {
        super(game);
        this.my_input = null;
        this._disposed = false;
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
        const FONT_SPACING = 4;
        this.panel_title = new BABYLON.GUI.StackPanel();
        const panel = this.panel_title;
        panel.isVertical = true;
        panel.isVisible = false; // imageの大きさが確定するまでは非表示
        panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        panel.verticalAlignment   = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        panel.paddingTop  = "5px";
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
        this.text1.text = "PUSH SPACE KEY";
        this.text1.color = "white";
        this.text1.fontFamily = "MyGameFont";
        this.text1.fontSize = 40;
        MyDraw.set_text_center(this.text1, 0, 0);
        this.panel_title.addControl(this.text1);

        this.text2 = new BABYLON.GUI.TextBlock();
        this.text2.text = `v${GLOBALS.VERSION} - ${GLOBALS.DATE}`;
        this.text2.color = "white";
        this.text2.fontFamily = "MyGameFont";
        this.text2.fontSize = 32;
        MyDraw.set_text_center(this.text2, 0, 0);
        this.panel_title.addControl(this.text2);

        // ◆クリア実績情報
        const result = GameState.load_storage_results();
        if (result){
            const {r1, r2, time} = result;

            const panel_result = new BABYLON.GUI.StackPanel();
            panel_result.width = "1650px"; 
            panel_result.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            panel_result.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
            this.panel_title.addControl(panel_result);

            const date = new Date(time);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const result_time = `${year}/${month}/${day} ${hours}:${minutes}`;

            const rs_t1 = new BABYLON.GUI.TextBlock();
            rs_t1.text = `Your Last Clear Result (${result_time})`;
            rs_t1.color = "yellow";
            rs_t1.fontSize = 32;
            rs_t1.height = "40px";
            rs_t1.width = "1400px";
            panel_result.addControl(rs_t1);

            const panel_result_row = new BABYLON.GUI.StackPanel();
            panel_result_row.isVertical = false; 
            panel_result_row.height = "600px";
            panel_result_row.width = "1200px";
            panel_result_row.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
            panel_result.addControl(panel_result_row);

            // 左側テキスト
            const panel_left = new BABYLON.GUI.StackPanel();
            panel_left.width = "600px";
            panel_left.height = "600px";
            panel_left.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
            panel_left.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            panel_left.paddingTop = "10px";
            panel_left.paddingLeft = "10px";
            panel_left.isVertical = true;
            panel_result_row.addControl(panel_left);

            r1.forEach(line => {
                const lineBlock = new BABYLON.GUI.TextBlock();
                lineBlock.text = line;
                lineBlock.color = "#80d0c0";
                lineBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;

                if (line.trim() === "") {
                    // 空行は高さを小さく
                    lineBlock.height = "8px";
                    lineBlock.fontSize = 1; // 文字が見えないように
                } else {
                    lineBlock.height = "30px";
                    lineBlock.fontSize = 24;
                }
                panel_left.addControl(lineBlock);
            });

            // 右側テキスト
            const panel_right = new BABYLON.GUI.StackPanel();
            panel_right.width = "600px";
            panel_right.height = "600px";
            panel_right.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
            panel_right.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
            panel_right.paddingTop = "10px";
            panel_right.paddingLeft = "10px";
            panel_right.isVertical = true;
            panel_result_row.addControl(panel_right);

            r2.forEach(line => {
                const lineBlock = new BABYLON.GUI.TextBlock();
                lineBlock.text = line;
                lineBlock.color = "#80c0d0";
                lineBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;

                if (line.trim() === "") {
                    lineBlock.height = "8px";
                    lineBlock.fontSize = 1;
                } else {
                    lineBlock.height = "30px";
                    lineBlock.fontSize = 24;
                }
                panel_right.addControl(lineBlock);
            });
        }

        // ◆アトラクト画面への自動遷移
        this.attractTimerId = null;
        this.start_attract_timer(ATTRACT_TIMER);
        this.scene.onDisposeObservable.add(() => {
            this._disposed = true;
            this.cancel_attract_timer();
        });

        // AudioEngine の強制初期化
        this.audio = new MyAudio();
    } // End of create

    start_attract_timer(seconds) {
        this.cancel_attract_timer();
        this.attractTimerId = setTimeout(() => {
            if (this._disposed) return;
            this.goto_attract();
        }, seconds * 1000);
    }

    cancel_attract_timer() {
        if (this.attractTimerId !== null) {
            clearTimeout(this.attractTimerId);
            this.attractTimerId = null;
        }
    }

    start_game(){
        // ユーザ操作後にオーディオ初期化
        MyAudio.initialize();
        // ゲームパラメータの初期化
        GameState.reset();
        // アトラクト画面への自動遷移タイマーのキャンセル
        this.cancel_attract_timer();
        // ゲーム画面に遷移
        Game.sceneManager.changeScene(new GameScene(Game), true);
        // console.log("TitleScene: scene changed");
    }

    goto_config(){
        // アトラクト画面への自動遷移タイマーのキャンセル
        this.cancel_attract_timer();
        // コンフィグ画面に遷移
        Game.sceneManager.changeScene(new ConfigScene(this.game));
    }

    goto_attract(){
        // アトラクト画面への自動遷移タイマーのキャンセル
        this.cancel_attract_timer();
        // アトラクト画面に遷移
        Game.sceneManager.changeScene(new AttractScene(this.game));        
    }

    goto_gameclear(){
        // ユーザ操作後にオーディオ初期化
        MyAudio.initialize();
        // アトラクト画面への自動遷移タイマーのキャンセル
        this.cancel_attract_timer();
        // アトラクト画面に遷移
        Game.sceneManager.changeScene(new GameClearScene(this.game));        
    }

    update(time, delta){
        if (this.my_input){
            this.my_input.update(time, delta);
        }
        // 隠しキー
        if (GameState.inputKey && GameState.inputKey["a"]){
            this.goto_attract();
        }
        if (GameState.inputKey && GameState.inputKey["c"]){
            this.goto_gameclear();
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