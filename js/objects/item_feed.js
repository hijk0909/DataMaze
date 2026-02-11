// item_feed.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from "../GameState.js";
import { Item } from "./base_item.js";
import { Eff_Text } from './eff_text.js';

export class Item_Feed extends Item {

    constructor(scene){
        super(scene);
        this.recovery_point = 0;
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
        this.set_color(material, GLOBALS.ITEM.COLOR.FEED);
        this.mesh.material = material;

        // recovery_point
        this.recovery_point = Math.floor(Math.random()*2)*10 + 10;

        super.create();
    }

    set_recovery_point(recov){
        this.recovery_point = recov;
    }

    activate(){
        this.alive = false;
        GameState.add_score(100);
        GameState.player.add_hp(this.recovery_point);
        const eff = new Eff_Text(this.scene);
        eff.create(this.mesh.position, `HP +${this.recovery_point}`);
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