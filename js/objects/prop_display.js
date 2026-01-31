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
        const prop_display_material = new BABYLON.PBRMaterial("prop_display_material", this.scene); 
        prop_display_material.albedoTexture = GameState.asset.texture.prop_display.clone();
        prop_display_material.albedoTexture.wrapU = BABYLON.Texture.WRAP_MODE;
        prop_display_material.albedoTexture.hasAlpha = true;
        prop_display_material.useAlphaFromAlbedoTexture = true;
        prop_display_material.alphaMode = BABYLON.Engine.ALPHA_ADD;
        prop_display_material.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        prop_display_material.metallic = 0;
        prop_display_material.roughness = 1.0; // 完全にザラザラ（反射なし）
        prop_display_material.unlit = true;   // Lightの影響を一切受けない
        prop_display_material.backFaceCulling = true;
        prop_display_material.alpha = 1.0;
        this.mesh.material = prop_display_material;

        this.mesh_outer = BABYLON.MeshBuilder.CreateBox("prop_display", { size: 1.05 }, this.scene);
        this.mesh_outer.position = pos.clone();
        this.mesh_outer.checkCollisions = false;
        const prop_display_outer_material = new BABYLON.PBRMaterial("prop_display_outer_material", this.scene); 
        prop_display_outer_material.albedoTexture = GameState.asset.texture.prop_display.clone();
        prop_display_outer_material.albedoTexture.wrapU = BABYLON.Texture.WRAP_MODE;
        prop_display_outer_material.albedoTexture.hasAlpha = true;
        prop_display_outer_material.useAlphaFromAlbedoTexture = true;
        prop_display_outer_material.alphaMode = BABYLON.Engine.ALPHA_ADD;
        prop_display_outer_material.emissiveColor = new BABYLON.Color3(0.05, 0.05, 0.05);
        prop_display_outer_material.metallic = 0;
        prop_display_outer_material.roughness = 1.0; // 完全にザラザラ（反射なし）
        prop_display_outer_material.unlit = true;   // Lightの影響を一切受けない
        prop_display_outer_material.backFaceCulling = true;
        prop_display_outer_material.alpha = 0.9;
        this.mesh_outer.material = prop_display_outer_material;

        // アニメーション
        const anim = new BABYLON.Animation( "uvScroll", "uOffset", 20,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        anim.setKeys([  { frame: 0, value: 0 },  { frame: 60, value: 1 } ]);
        prop_display_material.albedoTexture.animations.push(anim);
        this.scene.beginAnimation(prop_display_material.albedoTexture, 0, 60, true);

        const anim_outer = new BABYLON.Animation( "uvScroll", "vOffset", 25,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        anim_outer.setKeys([  { frame: 0, value: 0 },  { frame: 180, value: 1 } ]);
        prop_display_outer_material.albedoTexture.animations.push(anim_outer);
        this.scene.beginAnimation(prop_display_outer_material.albedoTexture, 0, 180, true);

        super.create();
    }

    update(time, delta){
        super.update(time, delta);
    }

    dispose(){
        super.dispose();
    }
}