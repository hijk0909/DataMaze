// item_feed.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from "../GameState.js";
import { Item } from "./base_item.js";
import { Eff_Text } from './eff_text.js';

export class Item_Feed extends Item {

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
        const material = new BABYLON.StandardMaterial(`mat`, this.scene);
        material.diffuseColor = GLOBALS.ITEM.COLOR.FEED;
        material.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1); 
        this.mesh.material = material;

        super.create();
    }

    activate(){
        this.alive = false;
        GameState.add_score(100);
        const recov = Math.floor(Math.random()*2)*10 + 10;
        GameState.player.add_hp(recov);
        const eff = new Eff_Text(this.scene);
        eff.create(this.mesh.position, `HP +${recov}`);
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