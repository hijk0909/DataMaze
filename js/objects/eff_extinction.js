//eff_extinction.js

import { GameState } from "../GameState.js";
import { Effect } from "./base_effect.js";

const EFF_PERIOD_EXTINCTION = 2000;
const EFF_SIZE_DELTA = 0.01;
const EFF_SIZE_MAX = 2;
const EFF_ALPHA_DELTA = 0.03;

export class Eff_Extinction extends Effect {

    constructor(scene){
        super(scene);
        this.counter = EFF_PERIOD_EXTINCTION;
        this.sprite = null;
        this.size = 0.3;
        this.alpha = 1.0;
    }

    create(pos){
        super.create(null); // meshは存在しない

        this.sprite = new BABYLON.Sprite("extinction", GameState.asset.sprite.extinction);
        this.sprite.size = 0.3;
        // this.sprite.color = new BABYLON.Color4(0.3, 0.9, 1.0, 0);
        this.sprite.position = pos.clone();
    }    

    update(time, delta){
        super.update();

        this.size = Math.min(this.size + EFF_SIZE_DELTA, EFF_SIZE_MAX);
        this.alpha = Math.max(this.alpha -= EFF_ALPHA_DELTA, 0);
        this.sprite.size = this.size;
        this.sprite.color.a = this.alpha;

        this.counter -= delta;
        if (this.counter <= 0){
            this.alive = false;
        }
    }

    dispose(){
        super.dispose();
        if (this.sprite){
            this.sprite.dispose();
        }
    }
}