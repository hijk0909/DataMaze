// game_asset.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from '../GameState.js';
import { Asset } from './base_asset.js';
import { MyAudio } from "../utils/AudioUtils.js"

export class GameAsset extends Asset {
    constructor(scene) {
        super(scene);
    }

    // GameState.asset.data.stage_data に JSON を読み込む
    async load_stage_data() {
        try {
            const response = await fetch("./assets/data/stage.json");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const jsonData = await response.json();

            // dispose メソッドを追加しておく
            jsonData.dispose = function () {
                if (this.stages) {
                    this.stages.length = 0; //念のため参照を切る
                }
            };

            // 保存
            GameState.asset = GameState.asset || {};
            GameState.asset.data = GameState.asset.data || {};
            GameState.asset.data.stage_data = jsonData;
            // console.log("Stage data loaded:", GameState.asset.data.stage_data);
        } catch (error) {
            console.error("Failed to load stage data:", error);
        }
    }


    async preload(){
        // console.log("asset.preload.start");
        // ■ blender モデル
        // 自機モデル
        this.container.player = await BABYLON.SceneLoader.LoadAssetContainerAsync(
            "./assets/models/", "player.glb", this.scene
        );
        this.container.player.addAllToScene();
        this.mesh.player = this.container.player.meshes.find(m => m.name === "__root__");
        // 敵機モデル
        this.mesh.enemy_1 = await BABYLON.SceneLoader.LoadAssetContainerAsync(
            "./assets/models/", "enemy_1.glb", this.scene);

        this.mesh.enemy_2 = await BABYLON.SceneLoader.LoadAssetContainerAsync(
            "./assets/models/", "enemy_2.glb", this.scene);

        this.mesh.enemy_3 = await BABYLON.SceneLoader.LoadAssetContainerAsync(
            "./assets/models/", "enemy_3.glb", this.scene);

        this.mesh.enemy_4 = await BABYLON.SceneLoader.LoadAssetContainerAsync(
            "./assets/models/", "enemy_4.glb", this.scene);

        this.mesh.enemy_5 = await BABYLON.SceneLoader.LoadAssetContainerAsync(
            "./assets/models/", "enemy_5.glb", this.scene);

        this.mesh.enemy_6 = await BABYLON.SceneLoader.LoadAssetContainerAsync(
            "./assets/models/", "enemy_6.glb", this.scene);

        this.mesh.enemy_7 = await BABYLON.SceneLoader.LoadAssetContainerAsync(
            "./assets/models/", "enemy_7.glb", this.scene);

        // アイテムモデル
        this.mesh.item_box = await BABYLON.SceneLoader.LoadAssetContainerAsync(
            "./assets/models/", "item_box.glb", this.scene);

        this.mesh.key = await BABYLON.SceneLoader.LoadAssetContainerAsync(
            "./assets/models/", "item_key.glb", this.scene);

        this.mesh.battery = await BABYLON.SceneLoader.LoadAssetContainerAsync(
            "./assets/models/", "item_battery.glb", this.scene);

        this.mesh.fluxcore = await BABYLON.SceneLoader.LoadAssetContainerAsync(
            "./assets/models/", "item_fluxcore.glb", this.scene);

            // ■ テクスチャ
        const ptx = new BABYLON.Texture("./assets/textures/flare.png", this.scene);
        ptx.hasAlpha = true;
        this.texture.particle = ptx;

        const c1 = new BABYLON.Texture("./assets/textures/corridor_1.png", this.scene);
        c1.wrapU = BABYLON.Texture.WRAP_MODE;
        c1.wrapV = BABYLON.Texture.WRAP_MODE;
        this.texture.corridor_1 = c1;

        const c2 = new BABYLON.Texture("./assets/textures/corridor_2.png", this.scene);
        c2.wrapU = BABYLON.Texture.WRAP_MODE;
        c2.wrapV = BABYLON.Texture.WRAP_MODE;
        this.texture.corridor_2 = c2;

        const r1 = new BABYLON.Texture("./assets/textures/room_1.png", this.scene);
        r1.wrapU = BABYLON.Texture.WRAP_MODE;
        r1.wrapV = BABYLON.Texture.WRAP_MODE;
        this.texture.room_1 = r1;

        const rx = new BABYLON.Texture("./assets/textures/room_exit.png", this.scene);
        this.texture.room_exit = rx;

        const obs = new BABYLON.Texture("./assets/textures/obstacle.png", this.scene);
        this.texture.obstacle = obs;

        const gl = new BABYLON.Texture("./assets/textures/goal_light.png", this.scene);
        gl.hasAlpha = true;
        this.texture.goal_light = gl;

        // ■ スプライト
        this.sprite.dust = new BABYLON.SpriteManager(
            "dustSprites", "./assets/textures/dust.png", 2000, { width: 64, height: 64 }, this.scene);

        this.sprite.extinction = new BABYLON.SpriteManager(
            "dustSprites", "./assets/textures/extinction.png", 100, { width: 64, height: 64 }, this.scene);

        this.sprite.bullet = new BABYLON.SpriteManager(
            "dustSprites", "./assets/textures/bullet.png", 2000, { width: 64, height: 64 }, this.scene);
            
        // ■　音声
        this.bgm.main = await MyAudio.load( "./assets/audio/bgm/bgm_main.mp3");
        this.bgm.main.setVolume(0.8);

        this.se.powerup = await MyAudio.load( "./assets/audio/se/se_powerup.mp3" );
        this.se.powerup.setVolume(0.4);

        this.se.explosion = await MyAudio.load( "./assets/audio/se/se_explosion.mp3" );
        this.se.explosion.setVolume(0.4);

        this.se.collision = await MyAudio.load( "./assets/audio/se/se_collision.mp3" );
        this.se.collision.setVolume(0.4);

        this.jingle.stagestart = await MyAudio.load( "./assets/audio/jingle/jingle_stage_start.mp3" );
        this.jingle.stagestart.setVolume(0.8);

        this.jingle.stageclear = await MyAudio.load( "./assets/audio/jingle/jingle_stage_clear.mp3" );
        this.jingle.stageclear.setVolume(0.8);
        // console.log("asset.preload:end");

        // ■　ステージデータ
        await this.load_stage_data();
    }

    dispose(){
        super.dispose();
    }
}