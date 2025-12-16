// game_asset.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from '../GameState.js';
import { Asset } from './base_asset.js';
import { MyAudio } from "../utils/AudioUtil.js"

export class GameAsset extends Asset {
    constructor(scene) {
        super(scene);
    }

    async preload(){

        // ■ blender モデル
        // 自機モデル
        const glb1 = await BABYLON.SceneLoader.LoadAssetContainerAsync(
            "./assets/models/", "player_ball.glb", this.scene
        );
        glb1.addAllToScene();
        this.mesh.player = glb1.meshes.find(m => m.name === "__root__");

        // 敵機モデル
        const enemy_1 = await BABYLON.SceneLoader.LoadAssetContainerAsync(
            "./assets/models/", "enemy_1.glb", this.scene
        );
        this.mesh.enemy_1 = enemy_1;

        const enemy_2 = await BABYLON.SceneLoader.LoadAssetContainerAsync(
            "./assets/models/", "enemy_2.glb", this.scene
        );
        this.mesh.enemy_2 = enemy_2;

        // ■ テクスチャ
        const ptx = new BABYLON.Texture("./assets/textures/flare.png", this.scene);
        ptx.hasAlpha = true;
        this.texture.particle = ptx;

        const sky = new BABYLON.Texture("./assets/textures/sky.jpg", this.scene);
        this.texture.sky = sky;

        const cw = new BABYLON.Texture("./assets/textures/corridor_wall.png", this.scene);
        cw.wrapU = BABYLON.Texture.WRAP_MODE;
        cw.wrapV = BABYLON.Texture.WRAP_MODE;
        this.texture.corridor_wall = cw;

        // ■ スプライト
        this.sprite.dust = new BABYLON.SpriteManager(
            "dustSprites", "./assets/textures/dust.png", 2000, { width: 64, height: 64 }, this.scene);

        // ■　音声
        this.bgm.main = await MyAudio.load( "./assets/audio/bgm/bgm_main.mp3");
        this.bgm.main.setVolume(0.8);

        this.se.powerup = await MyAudio.load( "./assets/audio/se/se_powerup.mp3" );
        this.se.powerup.setVolume(0.4);

        this.se.explosion = await MyAudio.load( "./assets/audio/se/se_explosion.mp3" );
        this.se.explosion.setVolume(0.4);

        this.se.collision = await MyAudio.load( "./assets/audio/se/se_collision.mp3" );
        this.se.collision.setVolume(0.4);

        this.jingle.gameover = await MyAudio.load( "./assets/audio/jingle/jingle_game_over.mp3" );
        this.jingle.gameover.setVolume(0.8);
    }

    dispose(){
        super.dispose();
    }
}