// _asset.js
import { GameState } from '../GameState.js';

export class Asset {

    constructor(scene){
        this.scene = scene;

        this.mesh = {};
        this.texture = {};
        this.sprite = {};
        this.bgm = {};
        this.se = {};
        this.jingle = {};
    }

    async preload(){
    }

    play_se(name, obj = null){
        const sound = this.se[name];
        if (!sound) return;
        if (sound.isPlaying) { sound.stop(); }
        if (obj !== null){
            // 3D → スクリーン座標
            const screenPos = BABYLON.Vector3.Project(
                obj.mesh.position,
                BABYLON.Matrix.Identity(),
                this.scene.getTransformMatrix(),
                GameState.camera.viewport.toGlobal(
                    GameState.game.engine.getRenderWidth(),
                    GameState.game.engine.getRenderHeight()
                )
            );
            const renderWidth = GameState.game.engine.getRenderWidth();
            const normalizedX = ((screenPos.x / renderWidth) - 0.5) * 2;
            const clampedX = Math.max(-1, Math.min(1, normalizedX));
            sound.setPan(clampedX);
        }

        sound.play();
    }

    dispose(){
        for (const group of [this.mesh, this.texture, this.sprite]) {
            // console.log("asset:dispose:object", group);
            for (const key in group){
                const object = group[key];
                if (object){
                    object.dispose();
                    group[key] = null;
                }
            }
        }

        for (const group of [this.bgm, this.se, this.jingle]) {
            // console.log("asset:dispose:sound", group);
            for (const key in group) {
                const sound = group[key];
                // console.log("asset:dispose:sound:", key, sound);
                if (sound) {
                    if (sound.isPlaying) sound.stop();
                    sound.dispose();
                    group[key] = null;
                }
            }
        }
    }
}