// itm_goal.js
import { GameState } from "../GameState.js";
import { Item } from "./_item.js";
import { Eff_Text } from './eff_text.js';

const COOLDOWN_INTERVAL = 60;

export class Itm_Goal extends Item {

    constructor(scene){
        super(scene);
        this.count = 0;
    }

    create(pos){
        const radius = 1.0;
        const height = 2.0;

        // 台形柱を生成
        this.mesh = BABYLON.MeshBuilder.CreateCylinder(
        `coneLike`, 
        { 
            diameterTop: radius * 1.0,
            diameterBottom: radius * 2.0,
            height: height,
            tessellation: 16 //ポリゴンの多さ
        }, 
        this.scene
        );
        this.mesh.position = pos.clone();

        // ランダムな色を持つマテリアルを生成
        const material = new BABYLON.StandardMaterial(`mat`, this.scene);
        material.diffuseColor = new BABYLON.Color3(1.0, 1.0, 0.0);
        material.specularColor = new BABYLON.Color3(0.8, 0.8, 0.8); 
        this.mesh.material = material;

        super.create();
    }

    activate(){
        if (this.count <= 0){
            this.count = COOLDOWN_INTERVAL;
            const eff = new Eff_Text(this.scene);
            eff.create(this.mesh.position, "GOAL");
            GameState.effects.push(eff);
            GameState.asset.bgm.main.fadeOut();
        }
    }

    update(time, delta){
        super.update(time, delta);
        if (this.count > 0) this.count--;
    }

    dispose(){
        super.dispose();
    }
}