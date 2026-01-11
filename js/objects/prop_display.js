// prop_display.js
import { GameState } from "../GameState.js";
import { Prop } from "./base_prop.js";

export class Prop_Display extends Prop {

    constructor(scene){
        super(scene);
    }

    create(pos){
        // console.log("Prop_Display.create:",pos);
        this.mesh = BABYLON.MeshBuilder.CreateBox("prop_display", { size: 1 }, this.scene);
        this.mesh.position = pos.clone();
        this.mesh.checkCollisions = false;
        const prop_display_material = new BABYLON.StandardMaterial("prop_display_material", this.scene); 
        prop_display_material.diffuseTexture = GameState.asset.texture.prop_display;
        prop_display_material.diffuseTexture.hasAlpha = true;
        prop_display_material.useAlphaFromDiffuseTexture = true;
        prop_display_material.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
        // prop_display_material.alphaMode = BABYLON.Engine.ALPHA_ADD; //加算合成
        prop_display_material.emissiveColor = new BABYLON.Color3(1.0, 1.0, 1.0);
        prop_display_material.backFaceCulling = true; // false ... 両面表示
        prop_display_material.alpha = 1.0;
        this.mesh.material = prop_display_material;
        super.create();
    }

    update(time, delta){
        const speed = 0.01; // １秒あたりの変化量
        const material = this.mesh.material;
        if (material && material.diffuseTexture) {
            material.diffuseTexture.uOffset += speed * (delta / 1000);
            material.diffuseTexture.uOffset %= 1;
        }
        super.update(time, delta);
    }

    dispose(){
        super.dispose();
    }
}