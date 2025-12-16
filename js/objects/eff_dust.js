// eff_dust.js
import { GameState } from "../GameState.js";
import { Effect } from "./_effect.js";

const EFF_PERIOD_DUST = 120;
const BASE_ALPHA = 0.5;

export class Eff_Dust extends Effect {

    constructor(scene){
        super(scene);
        this.counter = 0;
        this.sprite = null;
        this.velocity = null;
    }

    create(pos, velocity){
        super.create(null); // meshは存在しない

        this.sprite = new BABYLON.Sprite("dust", GameState.asset.sprite.dust);
        this.sprite.size = 0.1;
        this.sprite.color = new BABYLON.Color4(0.3, 0.9, 1.0, 0);
        this.sprite.position = pos.clone();
        this.velocity = velocity.clone();
        this.counter = EFF_PERIOD_DUST;
    }

    update(time, delta){
        super.update();

        this.sprite.position.addInPlace(this.velocity);
        this.counter -= 1;

        let alpha = 1.0;
        const p = EFF_PERIOD_DUST;
        const c = this.counter;
        if( c > p * 0.8){
            alpha = (p - c) / (p * 0.2); // fade in
        } else if( c < p * 0.2){
            alpha = c / (p * 0.2); // fade out
        }
        this.sprite.color.a = alpha * BASE_ALPHA;

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
} // End of class Effect_Firefly