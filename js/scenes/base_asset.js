// base_asset.js
import { GameState } from '../GameState.js';

export class Asset {

    constructor(scene){
        this.scene = scene;

        this.container = {};
        this.mesh = {};
        this.texture = {};
        this.sprite = {};
        this.bgm = {};
        this.se = {};
        this.jingle = {};
    }

    async preload(){
    }

    dispose(){
        for (const group of [this.mesh, this.texture, this.sprite, this.container, this.bgm, this.se, this.jingle]) {
            for (const key in group){
                const object = group[key];
                if (object){
                    // console.log("dispose.object:", object);
                    object.dispose();
                    group[key] = null;
                }
            }
        }
    }
}