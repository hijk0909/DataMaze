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
        prop_display_material.diffuseTexture = GameState.asset.texture.prop_display.clone();
        prop_display_material.diffuseTexture.wrapU = BABYLON.Texture.WRAP_MODE;
        // prop_display_material.diffuseTexture.wrapV = BABYLON.Texture.WRAP_MODE;
        prop_display_material.diffuseTexture.hasAlpha = true;
        prop_display_material.useAlphaFromDiffuseTexture = true;
        // prop_display_material.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
        prop_display_material.alphaMode = BABYLON.Engine.ALPHA_ADD; //加算合成
        prop_display_material.emissiveColor = new BABYLON.Color3(5.0, 5.0, 5.0);
        prop_display_material.backFaceCulling = true; // false ... 両面表示
        prop_display_material.alpha = 1.0;
        this.mesh.material = prop_display_material;
        // [TEST] glow
        // 壁越しでも光ってしまうので、MyMath.is_occluded_by_terrain() か 距離での減衰をかける（完全ではない）
        // 非常に重いので、適用は諦める
        // let lastIntensity = -1;
        // const glow = new BABYLON.GlowLayer("glow", this.scene,  { blurKernelSize: 16, mainTextureFixedSize: 128 });
        // glow.intensity = 0.4;
        // glow.addIncludedOnlyMesh(this.mesh);
        // this.scene.registerBeforeRender(() => {
        //   const d = BABYLON.Vector3.Distance(GameState.camera.position, this.mesh.position);
        //   const i = BABYLON.Scalar.Clamp(1 - d / 10.0, 0, 0.4);
        //     if (Math.abs(i - lastIntensity) > 0.05) {
        //         glow.intensity = i;
        //         lastIntensity = i;
        //     }
        // });
        this.mesh_outer = BABYLON.MeshBuilder.CreateBox("prop_display", { size: 1.05 }, this.scene);
        this.mesh_outer.position = pos.clone();
        this.mesh_outer.checkCollisions = false;
        const prop_display_outer_material = new BABYLON.StandardMaterial("prop_display_outer_material", this.scene); 
        prop_display_outer_material.diffuseTexture = GameState.asset.texture.prop_display.clone();
        prop_display_outer_material.diffuseTexture.hasAlpha = true;
        prop_display_outer_material.useAlphaFromDiffuseTexture = true;
        // prop_display_outer_material.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
        prop_display_outer_material.alphaMode = BABYLON.Engine.ALPHA_ADD; //加算合成
        prop_display_outer_material.emissiveColor = new BABYLON.Color3(20.0, 20.0, 20.0);
        prop_display_outer_material.backFaceCulling = true; // false ... 両面表示
        prop_display_outer_material.alpha = 0.5;
        this.mesh_outer.material = prop_display_outer_material;

        // アニメーション
        const anim = new BABYLON.Animation( "uvScroll", "uOffset", 20,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        anim.setKeys([  { frame: 0, value: 0 },  { frame: 60, value: 1 } ]);
        prop_display_material.diffuseTexture.animations.push(anim);
        this.scene.beginAnimation(prop_display_material.diffuseTexture, 0, 60, true);

        const anim_outer = new BABYLON.Animation( "uvScroll", "vOffset", 25,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        anim_outer.setKeys([  { frame: 0, value: 0 },  { frame: 60, value: 1 } ]);
        prop_display_outer_material.diffuseTexture.animations.push(anim_outer);
        this.scene.beginAnimation(prop_display_outer_material.diffuseTexture, 0, 60, true);

        super.create();
    }

    update(time, delta){
        // const speed = 0.01; // １秒あたりの変化量
        // const material = this.mesh.material;
        // if (material && material.diffuseTexture) {
        //     material.diffuseTexture.uOffset += speed * (delta / 1000);
        //     material.diffuseTexture.uOffset %= 1;
        // }
        super.update(time, delta);
    }

    dispose(){
        super.dispose();
    }
}