// scenes/GameScene.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from "../GameState.js";
import { MyInput } from '../utils/InputUtils.js';
import { Scene } from "./base_scene.js";
import { GameAsset } from "./game_asset.js";
import { Map } from "./game_map.js";
import { Exec } from "./game_exec.js";
import { Spawn } from "./game_spawn.js";
import { UI } from "./UI.js";
import { TitleScene } from "./TitleScene.js";
import { GameOverScene } from "./GameOverScene.js";
import { GameClearScene } from "./GameClearScene.js";
import { Wipe } from "../utils/DrawUtils.js";

export class GameScene extends Scene {
    constructor(game) {
        super(game);
        this.map = null;
        this.isInitialized = false;
        this.stage_state_count = 0;

        GameState.stage_state = GLOBALS.STAGE_STATE.START;
    }

    // ■ セットアップ
    setup(){
        // Camera(main)
        const camera = new BABYLON.FreeCamera("FreeCam", new BABYLON.Vector3(0, 5, -8), this.scene);
        camera.inputs.clear();
        camera.fov = 1.4; // 視野角
        camera.minZ = 0.1;
        camera.attachControl(this.game.canvas, true);
        camera.layerMask &= ~GLOBALS.MASK_UI;
        GameState.camera = camera;
        // camera(ui)
        const uiCamera = new BABYLON.FreeCamera("uiCam", BABYLON.Vector3.Zero(), this.scene);
        uiCamera.layerMask = GLOBALS.MASK_UI;

        this.scene.activeCameras = [camera, uiCamera];
    }

    // ■ プリロード
    async preload(){
        // console.log("GameScene.preload");
        GameState.asset = new GameAsset(this.scene);
        await GameState.asset.preload();
    }

    // ■ 初期生成
    create() {
        // console.log("GameScene.create");
        const scene = this.scene;

        // Light
        const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0.5,1,0), scene);
        light.intensity = 0.7;
        light.groundColor = new BABYLON.Color3(0.2, 0.2, 0.2);

        // scene.ambientColor = new BABYLON.Color3(0.25, 0.25, 0.25);

        // フォグ
        scene.fogEnabled = true;
        scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
        scene.fogColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        scene.fogStart = 5.0;
        scene.fogEnd = 15.0;

        // sky
        // this.skyMaterial = new BABYLON.SkyMaterial("skyMaterial", scene);
        // const skyMaterial = this.skyMaterial;
        // skyMaterial.backFaceCulling = false;
        // skyMaterial.inclination = 0.49;
        // skyMaterial.luminance = 0.2;
        // skyMaterial.turbidity = 6;
        // skyMaterial.fogEnabled = false;
        // const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000 }, scene);
        // skybox.material = skyMaterial;
        // this.sky_time = 0;
        // this.sky_speed = 0.07;

        // bloom
        // const pipeline = new BABYLON.DefaultRenderingPipeline("default", true, scene, [GameState.camera]);
        // pipeline.bloomEnabled = true;
        // pipeline.bloomThreshold = 0.1; // どの明るさから発光させるか
        // pipeline.bloomIntensity = 1.8; // 発光の強さ
        // pipeline.bloomKernel = 32;     // ブラーの広がり具合

        // シーン内の当たり判定の有効化
        scene.collisionsEnabled = true;

        // ゲーム開始時刻の記録
        GameState.start_time = Date.now();

        // UI画面の生成
        GameState.ui_manager = new UI(this.scene);

        // 入力ユーティリティの生成
        this.my_input = new MyInput(scene, this.game);
        this.my_input.registerNextAction(() => this.toggle_pause());

        // 実行用クラスの生成
        this.exec = new Exec(scene);

        // ワイプの生成
        this.wipe = new Wipe(scene, GameState.camera);

        // [DEBUG]
        // GameState.ui_manager.add_item("Test Item 1");
        // GameState.ui_manager.add_item("Test Item 2");
    }

    update(time, delta){
        // if (!this.isInitialized){
        //     console.log("not initialized");
        //     return;
        // } 
        // console.log("GameState.stage_state:", GameState.stage_state);
        const delta_sec = delta / 1000;

        // ■ステージステータスによる状態遷移
        if (GameState.stage_state === GLOBALS.STAGE_STATE.START){
            // ◆開始（ステージの初期化処理）
            GameState.stageInfo  = GameState.asset.data.stage_data.stages.find(s => s.stage === GameState.stage);
            // マップ生成
            if (this.map_manager){
                this.map_manager.dispose();
                this.map_manager = null;
            }
            this.map_manager = new Map(this.scene);
            // 自機・敵機・アイテム等の配置
            if (GameState.spawn){
                GameState.spawn.dispose();
                GameState.spawn = null;
            }
            GameState.spawn = new Spawn(this.scene);
            GameState.spawn.initial_placement();
            // ミニマップ生成
            GameState.ui_manager.minimap.dispose();
            GameState.ui_manager.minimap.create();
            // [STATUS_MSG]
            GameState.ui_manager.show_status_message(`GET READY\nSTAGE ${GameState.stage}`);
            // [WIPE]
            this.wipe.wipe_in(3000);
            // [SOUND]
            GameState.asset.jingle.stagestart.play(false);
            // [TRANSIT]
            this.stage_state_count = 2.5;
            GameState.stage_state = GLOBALS.STAGE_STATE.STARTING;
        } else if (GameState.stage_state === GLOBALS.STAGE_STATE.STARTING){
            // ◆開始期間
            // [COUNTER]
            this.stage_state_count -= delta_sec;
            if (this.stage_state_count < 0){
                GameState.stage_state = GLOBALS.STAGE_STATE.PLAYING;
                // [STATUS_MSG]
                GameState.ui_manager.hide_status_message();
                // [SOUND]
                GameState.asset.bgm.main.play(true);
            }
        } else if (GameState.stage_state === GLOBALS.STAGE_STATE.PLAYING){
            // ◆プレイ中
            if (GameState.player && GameState.player.hp <= 0){
                GameState.player.alive = false;
                GameState.player.hp = 0;
                GameState.player.update_hp_bar();
                GameState.stage_state = GLOBALS.STAGE_STATE.FAIL;
            }
        } else if (GameState.stage_state === GLOBALS.STAGE_STATE.FAIL){
            // ◆失敗
            // [STATUS_MSG]
            GameState.ui_manager.show_status_message(`GAME OVER`,"#ff0000");
            // [WIPE]
            this.wipe.wipe_out(4000);
            // [TRANSIT]
            this.stage_state_count = 4;
            GameState.stage_state = GLOBALS.STAGE_STATE.FAILED;
        } else if (GameState.stage_state === GLOBALS.STAGE_STATE.FAILED){
            // ◆失敗期間
            // [COUNTER]
            this.stage_state_count -= delta_sec;
            if (this.stage_state_count < 0){
                // [TRANSIT]
                this.game.sceneManager.changeScene(new GameOverScene(this.game));
            }
        } else if (GameState.stage_state === GLOBALS.STAGE_STATE.CLEAR){
            // ◆ステージクリア
            if (GameState.stage === GLOBALS.STAGE_MAX){
                // [STATUS_MSG]
                GameState.ui_manager.show_status_message(`ALL CLEAR`,"#ff8020");
                // [SOUND]
                GameState.asset.jingle.stageclear.play(false);
                // [TRANSIT]
                GameState.stage_state = GLOBALS.STAGE_STATE.ALL_CLEARED;
                this.stage_state_count = 4;
                // [WIPE]
                this.wipe.wipe_out(4000);
            } else {
                // [STATUS_MSG]
                GameState.ui_manager.show_status_message(`STAGE CLEAR`,"#00ffff");
                // [SOUND]
                GameState.asset.jingle.stageclear.play(false);
                // [TRANSIT]
                GameState.stage_state = GLOBALS.STAGE_STATE.CLEARED;
                this.stage_state_count = 2;
                // [WIPE]
                this.wipe.wipe_out(2000);
            }
        } else if (GameState.stage_state === GLOBALS.STAGE_STATE.CLEARED){
            // ◆ステージクリア期間
            // [COUNTER]
            this.stage_state_count -= delta_sec;
            if (this.stage_state_count < 0){
                GameState.stage++;
                // [TRANSIT]
                GameState.stage_state = GLOBALS.STAGE_STATE.START;
            }
        } else if (GameState.stage_state === GLOBALS.STAGE_STATE.ALL_CLEARED){
            // ◆全面クリア期間
            // [COUNTER]
            this.stage_state_count -= delta_sec;
            if (this.stage_state_count < 0){
                GameState.stage++; // [ALL]
                // [TRANSIT]
                this.game.sceneManager.changeScene(new GameClearScene(this.game));
            }
        } else if (GameState.stage_state === GLOBALS.STAGE_STATE.PAUSE){
            // ◆一時停止期間
        }

        // ■ ゲームロジックの実行
        if (GameState.stage_state !== GLOBALS.STAGE_STATE.PAUSE){
            if (this.exec){
                this.exec.update(time, delta);
            }
            if (this.map_manager){
                this.map_manager.update(time, delta);
            }
            if (this.my_input){
                this.my_input.update(time, delta);
            }
        }

        // ■ UIの表示更新
        if (GameState.ui_manager){
            GameState.ui_manager.update(time, delta);
        }

        // 隠しキー
        if (GameState.inputKey && GameState.inputKey["a"]){
            this.map_manager.show_all();
        }
        if (GameState.inputKey && GameState.inputKey["q"]){
            this.game.sceneManager.changeScene(new TitleScene(this.game));
        }
        if (GameState.inputKey && GameState.inputKey["o"]){
            this.game.sceneManager.changeScene(new GameOverScene(this.game));
        }
        if (GameState.inputKey && GameState.inputKey["c"]){
            this.game.sceneManager.changeScene(new GameClearScene(this.game));
        }

        // 空の時間経過（消去予定）
        // this.sky_time += this.sky_speed * delta / 1000;
        // console.log("sky_time", this.sky_time);
        // if (this.sky_time > 1) this.sky_time -= 2;
        // if (this.skyMaterial){
        //     this.skyMaterial.inclination = this.sky_time;
        // }

        super.update();
    }

    // ポーズ処理
    toggle_pause(){
        if (GameState.stage_state === GLOBALS.STAGE_STATE.PLAYING){
            // [SOUND]
            GameState.asset.bgm.main.pause();
            // [STATUS_MSG]
            GameState.ui_manager.show_status_message(`PAUSE`);
            // [TRANSIT]
            GameState.stage_state = GLOBALS.STAGE_STATE.PAUSE;
            // console.log("pause");
        } else if ( GameState.stage_state === GLOBALS.STAGE_STATE.PAUSE){
            // [SOUND]
            GameState.asset.bgm.main.resume();
            // [STATUS_MSG]
            GameState.ui_manager.hide_status_message();
            // [TRANSIT]
            GameState.stage_state = GLOBALS.STAGE_STATE.PLAYING;
            // console.log("resume");
        }
    }

    dispose() {
        if (GameState.asset){
            GameState.asset.dispose();
            GameState.asset = null;
        }

        if (this.map_manager){
            this.map_manager.dispose();
            this.map_manager = null;
        }
        if (GameState.spawn){
            GameState.spawn.dispose();
            GameState.spawn = null;
        }

        if (this.my_input){
            this.my_input.dispose();
            this.my_input = null;
        }

        if (GameState.ui_manager){
            GameState.ui_manager.dispose();
            GameState.ui_manager = null;
        }

        if (GameState.camera){
            GameState.camera.dispose();
            GameState.camera = null;
        }

        super.dispose();
    }
}
