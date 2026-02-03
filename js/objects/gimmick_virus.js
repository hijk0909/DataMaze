// gimmick_virus.js
import { GameState } from "../GameState.js";
import { Gimmick } from "./base_gimmick.js";
import { Eff_Text } from './eff_text.js';

export class Gimmick_Virus extends Gimmick {

    constructor(scene){
        super(scene);
    }

    create(pos, num){
        // console.log("create gimmick_virus:",pos, num);
        this.mesh = BABYLON.MeshBuilder.CreateBox("gimmick_virus", { size: 0.2 }, this.scene);
        this.mesh.position = pos.clone();
        this.mesh.checkCollisions = false;

        const material = new BABYLON.PBRMaterial("gimmick_virus_material", this.scene); 
        material.albedoColor = new BABYLON.Color3(1, 0, 1);
        material.metallic = 0.0;
        material.roughness = 1.0;
        material.alpha = 1.0;
        this.mesh.material = material;
        super.create();
    }

    activate(){
        const hp_delta = -0.1;
        GameState.player.add_hp_delta(hp_delta);

        const eff = new Eff_Text(this.scene);
        eff.create(this.mesh.position, `VIRUS ${Math.abs(hp_delta)}`);
        GameState.effects.push(eff);

        GameState.asset.se.powerdown.play();

        super.activate();
    }

    update(time, delta){
        super.update(time, delta);
    }

    dispose(){
        super.dispose();
    }
}