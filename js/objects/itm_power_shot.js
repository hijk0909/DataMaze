// itm_power_shot.js
import { GameState } from "../GameState.js";
import { Item } from "./base_item.js";
import { Eff_Text } from './eff_text.js';

export class Itm_PowerShot extends Item {

    constructor(scene){
        super(scene);
    }

    create(pos){
        // [Mesh] 球
        this.mesh = BABYLON.MeshBuilder.CreateSphere( `sphere`, 
            { diameter: this.radius * 2, segments: 16 }, 
            this.scene
        ); // segments は mesh の解像度
        this.mesh.position = pos.clone();

        // [Material] 色
        const material = new BABYLON.StandardMaterial(`mat`, this.scene);
        material.diffuseColor = new BABYLON.Color3(0.5, 1, 0.5);
        material.specularColor = new BABYLON.Color3(0.1, 0.1, 1.0); 
        this.mesh.material = material;

        super.create();
    }

    activate(){
        this.alive = false;
        GameState.add_score(100);
        const pow = 1;
        GameState.player.shot_power(pow);
        const eff = new Eff_Text(this.scene);
        eff.create(this.mesh.position, `FIRE POWER +${pow}`);
        GameState.effects.push(eff);
        GameState.asset.se.powerup.play();
    }

    update(time, delta){
        super.update(time, delta);
    }

    dispose(){
        super.dispose();
    }
}