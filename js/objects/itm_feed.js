// itm_feed.js
import { GameState } from "../GameState.js";
import { Item } from "./base_item.js";
import { Eff_Text } from './eff_text.js';

export class Itm_Feed extends Item {

    constructor(scene){
        super(scene);
    }

    create(pos){
        const radius = 0.3; // 半径

        // 球体を生成 (segments は解像度)
        this.mesh = BABYLON.MeshBuilder.CreateSphere(
            `sphere`, 
            { diameter: radius * 2, segments: 16 }, 
            this.scene
        );
        this.mesh.position = pos.clone();

        // ランダムな色を持つマテリアルを生成
        const material = new BABYLON.StandardMaterial(`mat`, this.scene);
        // Color3.Random(): ランダムな色を生成
        material.diffuseColor = BABYLON.Color3.Random();
        // 環境光の色 (光の反射の色)
        material.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1); 
        this.mesh.material = material;

        super.create();
    }

    activate(){
        this.alive = false;
        GameState.add_score(100);
        GameState.player.add_hp(5);
        const eff = new Eff_Text(this.scene);
        eff.create(this.mesh.position, "HP +5");
        GameState.effects.push(eff);
        GameState.asset.play_se("powerup");
    }

    update(time, delta){
        super.update(time, delta);
    }

    dispose(){
        super.dispose();
    }
}