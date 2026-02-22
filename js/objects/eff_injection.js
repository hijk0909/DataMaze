//eff_injection.js
import { GameState } from "../GameState.js";
import { Effect } from "./base_effect.js";

const EFF_PERIOD_INJECTION = 2000;
const EFF_SIZE_DELTA = 0.3;
const EFF_SIZE_MAX = 4;
const EFF_ALPHA_DELTA = 0.03;

export class Eff_Injection extends Effect {

    constructor(scene){
        super(scene);
        this.counter = EFF_PERIOD_INJECTION;
        this.sprite = null;
        this.size = 1.0;
        this.alpha = 1.0;
    }

    create(pos){
        super.create(null); // meshは存在しない

        this.sprite = new BABYLON.Sprite("injectiopn", GameState.asset.sprite.injection);
        this.sprite.size = 0.5;
        this.sprite.color = new BABYLON.Color4(1.0, 0.3, 0.3, 0);
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