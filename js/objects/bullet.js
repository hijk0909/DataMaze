// bullet.js
import { GameState } from "../GameState.js";
import { Drawable } from "./base_drawable.js";
import { Eff_Extinction } from "./eff_extinction.js";

const BULLET_SPEED = 0.13;
const BULLET_SIZE = 0.50;
const BULLET_ALPHA = 0.5;
const BULLET_MASS = 0.1;

export class Bullet extends Drawable {

    constructor(scene){
        super(scene);
        this.sprite = null;
        this.direction = null;
        this.speed = BULLET_SPEED;
        this.radius = BULLET_SIZE;
        this.mass = BULLET_MASS;
        this.strength = 1.0;
    }

    create(pos, velocity, pow = GameState.player_stats.shot_power){
        super.create(null); // meshは存在しない

        this.sprite = new BABYLON.Sprite("bullet", GameState.asset.sprite.bullet);
        this.sprite.size = BULLET_SIZE;
        // this.sprite.color = new BABYLON.Color4(0.3, 0.9, 1.0, 0);
        this.sprite.position = pos.clone();
        this.sprite.color.a = BULLET_ALPHA;

        this.direction = velocity.clone().normalize();
        this.speed = BULLET_SPEED;
        this.strength = pow; // playerの現在値
    }    

    update(time, delta){
        super.update();

        const moveDist = this.speed;
        const ray = new BABYLON.Ray( this.sprite.position, this.direction, moveDist );
        const hit = this.scene.pickWithRay(ray, mesh => mesh.isTerrain === true);
        if (hit && hit.hit) {
            this.alive = false;
            const eff = new Eff_Extinction(this.scene);
            eff.create(this.sprite.position);
            GameState.effects.push(eff);
        } else {
            this.sprite.position.addInPlace(this.direction.scale(moveDist));
        }        
    }

    dispose(){
        super.dispose();
        if (this.sprite){
            this.sprite.dispose();
        }
    }
}