// AttractAsset.js
import { Asset } from './base_asset.js';
import { MyAudio } from "../utils/AudioUtils.js"

export class AttractAsset extends Asset {
    constructor(scene) {
        super(scene);
    }

    async preload(){
        // テクスチャの読み込み
        const ptx = new BABYLON.Texture("./assets/textures/flare.png", this.scene);
        ptx.hasAlpha = true;
        this.texture.particle = ptx;

        // ユーザ操作後にオーディオ初期化
        await MyAudio.initialize();

        this.bgm.attract = await MyAudio.load( "./assets/audio/bgm/bgm_attract.mp3");
        this.bgm.attract.setVolume(0.7);
    }

    dispose(){
        super.dispose();
    }
}