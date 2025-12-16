// scenes/GameScene.js
import { GameState } from "../GameState.js";
import { MyInput } from '../utils/InputUtils.js';
import { Scene } from "./base_scene.js";
import { GameAsset } from "./game_asset.js";
import { Map } from "./game_map.js";
import { Exec } from "./game_exec.js";
import { Spawn } from "./game_spawn.js";
import { UI } from "./UI.js";

export class GameScene extends Scene {
    constructor(game) {
        super(game);
    }

    // ■ セットアップ
    setup(){
        // Camera
        const camera = new BABYLON.FreeCamera("FreeCam", new BABYLON.Vector3(0, 5, -8), this.scene);
        camera.inputs.clear();
        camera.fov = 1.4; // 視野角の調整（任意）
        camera.minZ = 0.1;
        camera.attachControl(this.game.canvas, true);
        GameState.camera = camera;
    }

    // ■ プリロード
    async preload(){
        GameState.asset = new GameAsset(this.scene);
        await GameState.asset.preload();
    }

    // ■ 初期生成
    create() {
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
        this.skyMaterial = new BABYLON.SkyMaterial("skyMaterial", scene);
        const skyMaterial = this.skyMaterial;
        skyMaterial.backFaceCulling = false;
        skyMaterial.inclination = 0.49;
        skyMaterial.luminance = 0.2;
        skyMaterial.turbidity = 6;
        skyMaterial.fogEnabled = false;
        const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000 }, scene);
        skybox.material = skyMaterial;

        this.sky_time = 0;
        this.sky_speed = 0.07;

        // bloom
        // const pipeline = new BABYLON.DefaultRenderingPipeline("default", true, scene, [GameState.camera]);
        // pipeline.bloomEnabled = true;
        // pipeline.bloomThreshold = 0.1; // どの明るさから発光させるか
        // pipeline.bloomIntensity = 1.8; // 発光の強さ
        // pipeline.bloomKernel = 32;     // ブラーの広がり具合

        // シーン内の当たり判定の有効化
        scene.collisionsEnabled = true;

        // フィールドの生成
        this.map = new Map(scene);

        // UI面の生成
        GameState.ui = new UI();

        // 入力ユーティリティの生成
        this.my_input = new MyInput(scene, this.game);
        // this.my_input.registerNextAction(() => this.toggle_pause());

        // 実行用クラスの生成
        this.exec = new Exec(scene);
        
        // オブジェクト生成クラスの生成と初期配置の実行
        this.spawn = new Spawn(scene);
        this.spawn.dispose();
        this.spawn.initial_placement();

        // SPACキー → TitleSceneに遷移
        this.scene.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                { trigger: BABYLON.ActionManager.OnKeyDownTrigger, parameter: 32 }, // スペースキーのASCIIコードは 32
                () => {
                    GameState.ui.dispose();
                    import("./TitleScene.js").then(module => {
                        const TitleScene = module.TitleScene;
                        this.game.sceneManager.changeScene(new TitleScene(this.game));
                    });
                }
            )
        );

        // ゲームスタート
        GameState.asset.bgm.main.play(true);
    }

    update(time, delta){

        if (this.exec){
            this.exec.update(time, delta);
        }
        if (this.my_input){
            this.my_input.update(time, delta);
        }
        if (this.map){
            this.map.update(time, delta);
        }   

        // 空の時間経過
        this.sky_time += this.sky_speed * delta / 1000;
        // console.log("sky_time", this.sky_time);
        if (this.sky_time > 1) this.sky_time -= 2;
        if (this.skyMaterial){
            this.skyMaterial.inclination = this.sky_time;
        }

        super.update();
    }

    dispose() {
        if (this.player){
            this.player.dispose();
        }
        if (GameState.asset){
            GameState.asset.dispose();
        }
        if (this.map){
            this.map.dispose();
        }
        this.scene.dispose();
    }
}
