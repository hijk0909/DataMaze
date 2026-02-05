// item_shot_power.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from "../GameState.js";
import { Item } from "./base_item.js";
import { Eff_Text } from './eff_text.js';

export class Item_ShotPower extends Item {

    constructor(scene){
        super(scene);
    }

    create(pos, id){
        // [Mesh] 球
        this.mesh = BABYLON.MeshBuilder.CreateSphere( `sphere`, 
            { diameter: this.radius * 2, segments: 16 }, 
            this.scene
        ); // segments は mesh の解像度
        this.mesh.position = pos.clone();

        // [Material] 色
        const material = new BABYLON.PBRMaterial(`mat`, this.scene);
        this.set_color(material, GLOBALS.ITEM.COLOR.SHOT_POWER);
        this.mesh.material = material;

        super.create();
    }

    activate(){
        this.alive = false;
        GameState.add_score(100);
        const pow = 1;
        GameState.player.add_shot_power(pow);
        const eff = new Eff_Text(this.scene);
        eff.create(this.mesh.position, `Shot Power +${pow}`);
        GameState.effects.push(eff);

        GameState.asset.se.powerup.play_3D(this, this.scene);
    }

    update(time, delta){
        super.update(time, delta);
    }

    dispose(){
        super.dispose();
    }
}