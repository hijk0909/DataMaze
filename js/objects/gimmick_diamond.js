// gimmick_diamond.js
import { GameState } from "../GameState.js";
import { Gimmick } from "./base_gimmick.js";
import { Eff_Text } from './eff_text.js';

export class Gimmick_Diamond extends Gimmick {

    constructor(scene){
        super(scene);
    }

    create(pos, num){
        // console.log("create gimmick_diamond:",pos, num);
        this.mesh = BABYLON.MeshBuilder.CreateBox("gimmick_diamond", { size: 0.2 }, this.scene);
        this.mesh.position = pos.clone();
        this.mesh.checkCollisions = false;

        const material = new BABYLON.PBRMaterial("gimmick_diamond_material", this.scene); 
        material.albedoColor = new BABYLON.Color3(1, 1, 0);
        material.metallic = 0.0;
        material.roughness = 1.0;
        material.alpha = 1.0;
        this.mesh.material = material;
        super.create();
    }

    activate(){
        const hp_tank = 1;
        GameState.player.add_hp_max(hp_tank);

        const eff = new Eff_Text(this.scene);
        eff.create(this.mesh.position, `HP Tank +${hp_tank}`);
        GameState.effects.push(eff);

        GameState.asset.se.powerup.play();

        super.activate();
    }

    update(time, delta){
        super.update(time, delta);
    }

    dispose(){
        super.dispose();
    }
}