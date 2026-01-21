// ConfigScene.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from "../GameState.js";
import { Game } from "../main.js";
import { Scene } from "./base_scene.js";
import { TitleScene } from "./TitleScene.js";
import { GameScene } from "./GameScene.js";
import { MyAudio } from "../utils/AudioUtils.js"
import { MyInput, RepeatManager } from "../utils/InputUtils.js"
import { MyDraw } from "../utils/DrawUtils.js"

const FONT_SIZE = 48;
const FONT_HEIGHT = "52px";
const FONT_SPACING = 4;

const CURSOR_WIDTH = 800;
const CURSOR_HEIGHT = 70;

const ITEM_TYPE_VALUE = 0;
const ITEM_TYPE_ACTION = 1;

const REPEAT_PARAMS = {
    initialDelay : 600,
    startInterval : 150,
    accel : 15,
    minInterval : 10
}

export class ConfigScene extends Scene {
    constructor(game) {
        super(game);
        this.my_input = null;

        this.config_items = [];
        this.text_blocks = [];
        this.cursor_rect = null;
        this.cursor_index = 0;
    }

    setup(){
        // [Camera]
        this.camera = new BABYLON.FreeCamera("camera_config", new BABYLON.Vector3(0,2,-5), this.scene);
        // [UI]
        this.ui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI_config", true, this.scene);
        this.ui.idealWidth = GLOBALS.UI.WIDTH;
        this.ui.idealHeight = GLOBALS.UI.HEIGHT;
        this.ui.renderAtIdealSize = true;
    }

    async preload(){
    }

    create(){
        const scene = this.scene;
        scene.clearColor = new BABYLON.Color4(0,0,0,1);

        // ◆ 入力関連
        this.my_input = new MyInput(scene, this.game);
        this.my_input.registerNextAction(() => this.start_game());
        this.my_input.registerConfirmAction(() => this.act_item());
        // this.my_input.registerConfirmAction(() => this.goto_title());

        this.repeatUp    = new RepeatManager(REPEAT_PARAMS);
        this.repeatDown  = new RepeatManager(REPEAT_PARAMS);
        this.repeatLeft  = new RepeatManager(REPEAT_PARAMS);
        this.repeatRight = new RepeatManager(REPEAT_PARAMS);

        // ◆ オプション画面（コンテナパネル）
        this.panel_config = new BABYLON.GUI.StackPanel();
        const panel = this.panel_config;
        panel.isVertical = true;
        panel.isVisible = true;
        panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        panel.verticalAlignment   = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        panel.paddingTop  = "10px";
        panel.paddingLeft = "10px";
        panel.spacing = FONT_SPACING; //行間(px)
        panel.fontFamily = "MyGameFont";
        this.ui.addControl(panel);

        // Text
        this.text1 = new BABYLON.GUI.TextBlock();
        this.text1.text = "CONFIGURATION";
        this.text1.color = "red";
        // this.text1.fontFamily = "MyGameFont";
        this.text1.fontSize = FONT_SIZE;
        this.text1.height = FONT_HEIGHT;
        MyDraw.set_text_center(this.text1, 0, 100);
        this.panel_config.addControl(this.text1);

        // ◆ コンフィグ項目の設定
        let item = null;

        item = { name : "STAGE", 
                type : ITEM_TYPE_VALUE,
                current_value : 1,
                value_delta : 1,
                value_decimal : 0,
                value_min : 1,
                value_max : GLOBALS.STAGE_MAX }
        this.config_items.push(item);

        item = { name : "HP_MAX", 
                type : ITEM_TYPE_VALUE,
                current_value :GLOBALS.PLAYER_STATS.INIT.HP_MAX,
                value_delta : 10,
                value_decimal : 0,
                value_min : GLOBALS.PLAYER_STATS.INIT.HP_MAX,
                value_max : GLOBALS.PLAYER_STATS.LIMIT.HP_MAX }
        this.config_items.push(item);

        item = { name : "HP_DELTA", 
                type : ITEM_TYPE_VALUE,
                current_value :GLOBALS.PLAYER_STATS.INIT.HP_DELTA,
                value_delta : 0.2,
                value_decimal : 1,
                value_min : GLOBALS.PLAYER_STATS.INIT.HP_DELTA,
                value_max : GLOBALS.PLAYER_STATS.LIMIT.HP_DELTA }
        this.config_items.push(item);

        item = { name : "MASS", 
                type : ITEM_TYPE_VALUE,
                current_value :GLOBALS.PLAYER_STATS.INIT.MASS,
                value_delta : 0.1,
                value_decimal : 1,
                value_min : GLOBALS.PLAYER_STATS.INIT.MASS,
                value_max : GLOBALS.PLAYER_STATS.LIMIT.MASS }
        this.config_items.push(item);

        item = { name : "SPEED", 
                type : ITEM_TYPE_VALUE,
                current_value :GLOBALS.PLAYER_STATS.INIT.SPEED_MAX,
                value_delta : 1,
                value_decimal : 0,
                value_min : GLOBALS.PLAYER_STATS.INIT.SPEED_MAX,
                value_max : GLOBALS.PLAYER_STATS.LIMIT.SPEED_MAX }
        this.config_items.push(item);

        item = { name : "SHOT_SPEED", 
                type : ITEM_TYPE_VALUE,
                current_value :GLOBALS.PLAYER_STATS.INIT.SHOT_SPEED,
                value_delta : 1,
                value_decimal : 0,
                value_min : GLOBALS.PLAYER_STATS.INIT.SHOT_SPEED,
                value_max : GLOBALS.PLAYER_STATS.LIMIT.SHOT_SPEED }
        this.config_items.push(item);

        item = { name : "SHOT_POWER", 
                type : ITEM_TYPE_VALUE,
                current_value :GLOBALS.PLAYER_STATS.INIT.SHOT_POWER,
                value_delta : 1,
                value_decimal : 0,
                value_min : GLOBALS.PLAYER_STATS.INIT.SHOT_POWER,
                value_max : GLOBALS.PLAYER_STATS.LIMIT.SHOT_POWER }
        this.config_items.push(item);

        item = { name : "RESET VALUES", 
                type : ITEM_TYPE_ACTION,
                action : () => this.reset_values() }
        this.config_items.push(item);

        item = { name : "RETURN to TITLE", 
                type : ITEM_TYPE_ACTION,
                action : () => this.goto_title() }
        this.config_items.push(item);

        item = { name : "START GAME", 
                type : ITEM_TYPE_ACTION,
                action : () => this.start_game() }
        this.config_items.push(item);

        let tb = null;
        for (let i = 0; i < this.config_items.length; i++){
            const it = this.config_items[i];
            tb  = new BABYLON.GUI.TextBlock();
            if (it.type === ITEM_TYPE_VALUE){
                tb.text =  `${it.name} : ${it.current_value.toFixed(it.value_decimal)}`;
                tb.color = "white";
                tb.fontSize = FONT_SIZE;
                tb.height = FONT_HEIGHT;
            } else if (it.type === ITEM_TYPE_ACTION){
                tb.text = it.name;
                tb.color = "orange";
                tb.fontSize = FONT_SIZE;
                tb.height = FONT_HEIGHT;
            }
            this.panel_config.addControl(tb);
            this.text_blocks.push(tb);
        }

        // Cursor Frame
        this.cursor_rect =  new BABYLON.GUI.Rectangle();
        this.cursor_rect.width = `${CURSOR_WIDTH}px`;
        this.cursor_rect.height = `${CURSOR_HEIGHT}px`;
        this.cursor_rect.color = "yellow";
        this.cursor_rect.thickness = 3;
        this.cursor_rect.background = "transparent";
        this.cursor_rect.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.cursor_rect.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        // this.cursor_rect.top = this.text_blocks[this.cursor_index].top;
        this.cursor_rect.top = 66;
        this.ui.addControl(this.cursor_rect);

        // localStorage から ロード
        this.load_storage_values();
    }

    reset_values(){
        this.config_items[0].current_value = 1;
        this.config_items[1].current_value = GLOBALS.PLAYER_STATS.INIT.HP_MAX;
        this.config_items[2].current_value = GLOBALS.PLAYER_STATS.INIT.HP_DELTA;        
        this.config_items[3].current_value = GLOBALS.PLAYER_STATS.INIT.MASS;
        this.config_items[4].current_value = GLOBALS.PLAYER_STATS.INIT.SPEED_MAX;
        this.config_items[5].current_value = GLOBALS.PLAYER_STATS.INIT.SHOT_SPEED;
        this.config_items[6].current_value = GLOBALS.PLAYER_STATS.INIT.SHOT_POWER;
        this.update_texts();

        this.remove_storage_values();
    }

    save_storage_values() {
        const data = {
            version: 1,
            stage: this.config_items[0].current_value,
            player: {
                hpMax:      this.config_items[1].current_value,
                hpDelta:    this.config_items[2].current_value,
                mass:       this.config_items[3].current_value,
                speedMax:   this.config_items[4].current_value,
                shotSpeed:  this.config_items[5].current_value,
                shotPower:  this.config_items[6].current_value,
            }
        };

        localStorage.setItem(
            "DataMaze_Config",
            JSON.stringify(data)
        );
    }

    load_storage_values() {
        const json = localStorage.getItem("DataMaze_Config");
        if (!json) {
            this.reset_values();
            return;
        }

        try {
            const data = JSON.parse(json);

            this.config_items[0].current_value = data.stage ?? 1;
            this.config_items[1].current_value = data.player.hpMax ?? GLOBALS.PLAYER_STATS.INIT.HP_MAX;
            this.config_items[2].current_value = data.player.hpDelta ?? GLOBALS.PLAYER_STATS.INIT.HP_DELTA;
            this.config_items[3].current_value = data.player.mass ?? GLOBALS.PLAYER_STATS.INIT.MASS;
            this.config_items[4].current_value = data.player.speedMax ?? GLOBALS.PLAYER_STATS.INIT.SPEED_MAX;
            this.config_items[5].current_value = data.player.shotSpeed ?? GLOBALS.PLAYER_STATS.INIT.SHOT_SPEED;
            this.config_items[6].current_value = data.player.shotPower ?? GLOBALS.PLAYER_STATS.INIT.SHOT_POWER;
        } catch (e) {
            console.warn("Config load failed. Reset to default.", e);
            this.reset_values();
        }

        this.update_texts();
    }

    remove_storage_values() {
        localStorage.removeItem("DataMaze_Config");
    }

    start_game(){
        // ユーザ操作後にオーディオ初期化
        MyAudio.initialize();

        // localStorage へ セーブ
        this.save_storage_values();

        // ゲームパラメータの初期化
        GameState.reset();
        // プレイヤーステータスの変更
        GameState.stage = this.config_items[0].current_value;
        GameState.player_stats.hp = this.config_items[1].current_value;
        GameState.player_stats.hp_max = this.config_items[1].current_value;
        GameState.player_stats.hp_delta = this.config_items[2].current_value;
        GameState.player_stats.mass = this.config_items[3].current_value;
        // GameState.player_stats.accel = this.accel;
        GameState.player_stats.speed_max = this.config_items[4].current_value;
        GameState.player_stats.shot_speed = this.config_items[5].current_value;
        GameState.player_stats.shot_power = this.config_items[6].current_value;
        // console.log("GameState.player_stats:", GameState.player_stats);

        // ゲーム画面に遷移
        Game.sceneManager.changeScene(new GameScene(Game), true);
    }

    goto_title(){
        // localStorage へ セーブ
        this.save_storage_values();

        // タイトル画面に遷移
        Game.sceneManager.changeScene(new TitleScene(this.game));
    }

    move_cursor(dir) {
        this.cursor_index = BABYLON.Scalar.Clamp(
            this.cursor_index + dir, 0, this.config_items.length - 1
        );
        const target = this.text_blocks[this.cursor_index];
        this.cursor_rect.top = target.top;
    }

    change_value(dir) {
        const item = this.config_items[this.cursor_index];
        if (item.type === ITEM_TYPE_VALUE){
            item.current_value = BABYLON.Scalar.Clamp(
                item.current_value + dir * item.value_delta, item.value_min, item.value_max
            );
            this.text_blocks[this.cursor_index].text =
                `${item.name} : ${item.current_value.toFixed(item.value_decimal)}`;
        }
    }

    update_texts(){
        for (let i = 0; i < this.config_items.length; i++){
            const it = this.config_items[i];
            const tb = this.text_blocks[i];
            if (it.type === ITEM_TYPE_VALUE){
                tb.text =  `${it.name} : ${it.current_value.toFixed(it.value_decimal)}`;
            } else if (it.type === ITEM_TYPE_ACTION){
                tb.text = it.name;
            }
        }
    }

    act_item(){
        const item = this.config_items[this.cursor_index];
        if (item.type === ITEM_TYPE_ACTION){
            item.action();
        }
    }

    update(time, delta){

        if (this.my_input){
            this.my_input.update(time, delta);
        }
        const input = {
            up:    GameState.inputKey["arrowup"]    || GameState.inputPad.up    || GameState.inputMouse.up,
            down:  GameState.inputKey["arrowdown"]  || GameState.inputPad.down  || GameState.inputMouse.down,
            left:  GameState.inputKey["arrowleft"]  || GameState.inputPad.left  || GameState.inputMouse.left,
            right: GameState.inputKey["arrowright"] || GameState.inputPad.right || GameState.inputMouse.right
        };

        // 上下（フォーカス移動）
        if (this.repeatUp.update(input.up, delta)) {
            this.move_cursor(-1);
            this.repeatLeft.reset();
            this.repeatRight.reset();
        }
        if (this.repeatDown.update(input.down, delta)) {
            this.move_cursor(+1);
            this.repeatLeft.reset();
            this.repeatRight.reset();
        }
        // 左右（値変更）
        if (this.repeatLeft.update(input.left, delta)) {
            this.change_value(-1);
        }
        if (this.repeatRight.update(input.right, delta)) {
            this.change_value(+1);
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