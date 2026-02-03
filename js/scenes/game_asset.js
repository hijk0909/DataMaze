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
        this.mesh.player = await BABYLON.SceneLoader.LoadAssetContainerAsync(
            "./assets/models/", "player.glb", this.scene
        );

        // await this.delay(1000); // [TEST]]
        // console.log("自機読込完了");
        GameState.game.sceneManager.add_progress(0.1);

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

        // await this.delay(1000); // [TEST]
        // console.log("敵機読み込み完了");
        GameState.game.sceneManager.add_progress(0.35);

        // アイテムモデル
        this.mesh.item_box = await BABYLON.SceneLoader.LoadAssetContainerAsync(
            "./assets/models/", "item_box.glb", this.scene);

        this.mesh.key = await BABYLON.SceneLoader.LoadAssetContainerAsync(
            "./assets/models/", "item_key.glb", this.scene);

        this.mesh.battery = await BABYLON.SceneLoader.LoadAssetContainerAsync(
            "./assets/models/", "item_battery.glb", this.scene);

        this.mesh.fluxcore = await BABYLON.SceneLoader.LoadAssetContainerAsync(
            "./assets/models/", "item_fluxcore.glb", this.scene);

        // await this.delay(1000); // [TEST]
        // console.log("アイテム読み込み完了");
        GameState.game.sceneManager.add_progress(0.1);

        // ■ テクスチャ
        const ptx = new BABYLON.Texture("./assets/textures/flare.png", this.scene);
        ptx.hasAlpha = true;
        this.texture.particle = ptx;

        const rsh = new BABYLON.Texture("./assets/textures/rush.png", this.scene);
        rsh.hasAlpha = true;
        this.texture.rush = rsh;

        const chg = new BABYLON.Texture("./assets/textures/charge.png", this.scene);
        chg.hasAlpha = true;
        this.texture.charge = chg;

        const c1 = new BABYLON.Texture("./assets/textures/corridor_1.png", this.scene);
        c1.wrapU = BABYLON.Texture.WRAP_MODE;
        c1.wrapV = BABYLON.Texture.WRAP_MODE;
        this.texture.corridor_1 = c1;

        const c2 = new BABYLON.Texture("./assets/textures/corridor_2.png", this.scene);
        c2.wrapU = BABYLON.Texture.WRAP_MODE;
        c2.wrapV = BABYLON.Texture.WRAP_MODE;
        this.texture.corridor_2 = c2;

        const c3 = new BABYLON.Texture("./assets/textures/corridor_3.png", this.scene);
        c3.wrapU = BABYLON.Texture.WRAP_MODE;
        c3.wrapV = BABYLON.Texture.WRAP_MODE;
        this.texture.corridor_3 = c3;

        const c4 = new BABYLON.Texture("./assets/textures/corridor_4.png", this.scene);
        c4.wrapU = BABYLON.Texture.WRAP_MODE;
        c4.wrapV = BABYLON.Texture.WRAP_MODE;
        this.texture.corridor_4 = c4;

        const r1 = new BABYLON.Texture("./assets/textures/room_1.png", this.scene);
        r1.wrapU = BABYLON.Texture.WRAP_MODE;
        r1.wrapV = BABYLON.Texture.WRAP_MODE;
        this.texture.room_1 = r1;
        const r1n = new BABYLON.Texture("./assets/textures/room_1_normal.png", this.scene);
        this.texture.room_1_normal = r1n;

        const r2 = new BABYLON.Texture("./assets/textures/room_2.png", this.scene);
        r2.wrapU = BABYLON.Texture.WRAP_MODE;
        r2.wrapV = BABYLON.Texture.WRAP_MODE;
        this.texture.room_2 = r2;
        const r2n = new BABYLON.Texture("./assets/textures/room_2_normal.png", this.scene);
        this.texture.room_2_normal = r2n;

        const r3 = new BABYLON.Texture("./assets/textures/room_3.png", this.scene);
        r3.wrapU = BABYLON.Texture.WRAP_MODE;
        r3.wrapV = BABYLON.Texture.WRAP_MODE;
        this.texture.room_3 = r3;
        const r3n = new BABYLON.Texture("./assets/textures/room_3_normal.png", this.scene);
        this.texture.room_3_normal = r3n;

        const r4 = new BABYLON.Texture("./assets/textures/room_4.png", this.scene);
        r4.wrapU = BABYLON.Texture.WRAP_MODE;
        r4.wrapV = BABYLON.Texture.WRAP_MODE;
        this.texture.room_4 = r4;
        const r4n = new BABYLON.Texture("./assets/textures/room_4_normal.png", this.scene);
        this.texture.room_4_normal = r4n;

        const rx = new BABYLON.Texture("./assets/textures/room_exit.png", this.scene);
        this.texture.room_exit = rx;

        const prop_cube = new BABYLON.Texture("./assets/textures/prop_cube.png", this.scene);
        this.texture.prop_cube = prop_cube;

        const prop_display = new BABYLON.Texture("./assets/textures/prop_display.png", this.scene);
        prop_display.wrapU = BABYLON.Texture.WRAP_MODE;
        prop_display.wrapV = BABYLON.Texture.WRAP_MODE;
        prop_display.hasAlpha = true;
        this.texture.prop_display = prop_display;

        const prop_rain = new BABYLON.Texture("./assets/textures/prop_rain.png", this.scene);
        prop_rain.hasAlpha = true;
        this.texture.prop_rain = prop_rain;

        const gl = new BABYLON.Texture("./assets/textures/goal_light.png", this.scene);
        gl.hasAlpha = true;
        this.texture.goal_light = gl;

        GameState.game.sceneManager.add_progress(0.15);

        // ■ スプライト
        this.sprite.dust = new BABYLON.SpriteManager(
            "dustSprites", "./assets/textures/dust.png", 2000, { width: 64, height: 64 }, this.scene);

        this.sprite.extinction = new BABYLON.SpriteManager(
            "extinctionSprites", "./assets/textures/extinction.png", 100, { width: 64, height: 64 }, this.scene);
        this.sprite.extinction.renderingGroupId = 1;

        this.sprite.bullet = new BABYLON.SpriteManager(
            "bulletSprites", "./assets/textures/bullet.png", 100, { width: 64, height: 64 }, this.scene);

        this.sprite.confused = new BABYLON.SpriteManager(
            "confusedSprites", "./assets/textures/confused.png", 100, { width: 64, height: 64 }, this.scene);

        this.sprite.thunder = new BABYLON.SpriteManager(
            "thunderSprites", "./assets/textures/thunder.png", 100, { width: 256, height: 256 }, this.scene);

        GameState.game.sceneManager.add_progress(0.05);

        // ■　音声
        this.bgm.main = await MyAudio.load( "./assets/audio/bgm/bgm_main.mp3");
        this.bgm.main.setVolume(0.8);

        this.bgm.middle = await MyAudio.load( "./assets/audio/bgm/bgm_middle.mp3");
        this.bgm.middle.setVolume(0.7);

        this.bgm.deep = await MyAudio.load( "./assets/audio/bgm/bgm_deep.mp3");
        this.bgm.deep.setVolume(0.7);

        this.bgm.zero = await MyAudio.load( "./assets/audio/bgm/bgm_zero_mind.mp3");
        this.bgm.zero.setVolume(0.7);

        this.se.powerup = await MyAudio.load( "./assets/audio/se/se_powerup.mp3" );
        this.se.powerup.setVolume(0.4);

        this.se.powerdown = await MyAudio.load( "./assets/audio/se/se_powerdown.mp3" );
        this.se.powerdown.setVolume(0.8);

        this.se.explosion = await MyAudio.load( "./assets/audio/se/se_explosion.mp3" );
        this.se.explosion.setVolume(0.4);

        this.se.collision = await MyAudio.load( "./assets/audio/se/se_collision.mp3" );
        this.se.collision.setVolume(0.2);

        this.jingle.stagestart = await MyAudio.load( "./assets/audio/jingle/jingle_stage_start.mp3" );
        this.jingle.stagestart.setVolume(0.6);

        this.jingle.stageclear = await MyAudio.load( "./assets/audio/jingle/jingle_stage_clear.mp3" );
        this.jingle.stageclear.setVolume(0.7);

        // await this.delay(1000); // [TEST]
        // console.log("音声読み込み完了");
        GameState.game.sceneManager.add_progress(0.2);

        // ■　ステージデータ
        await this.load_stage_data();
        GameState.game.sceneManager.add_progress(0.05);

        // console.log("asset.preload:end");
    }

    dispose(){
        super.dispose();
    }
}