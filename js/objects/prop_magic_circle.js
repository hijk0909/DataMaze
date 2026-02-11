// prop_magic_circle.js
import { GameState } from "../GameState.js";
import { Prop } from "./base_prop.js";

export class Prop_MagicCircle extends Prop {

    constructor(scene){
        super(scene);
    }

    create(pos, id){

        //メッシュ
        this.mesh_c1 = BABYLON.MeshBuilder.CreateDisc("magicCircle1", { radius: 1.0, tessellation: 64 }, this.scene);
        this.mesh_c1.rotation.x = Math.PI / 2;
        this.mesh_c1.position = pos.clone();
        this.mesh_c1.checkCollisions = false;
        this.mesh_c2 = BABYLON.MeshBuilder.CreateDisc("magicCircle2", { radius: 1.0, tessellation: 64 }, this.scene);
        this.mesh_c2.rotation.x = Math.PI / 2;
        this.mesh_c2.position = pos.clone();
        this.mesh_c2.checkCollisions = false;
        this.mesh_c3 = BABYLON.MeshBuilder.CreateDisc("magicCircle3", { radius: 1.0, tessellation: 64 }, this.scene);
        this.mesh_c3.rotation.x = Math.PI / 2;
        this.mesh_c3.position = pos.clone();
        this.mesh_c3.checkCollisions = false;

        //マテリアル
        const material_1 = new BABYLON.PBRMaterial("magicCircleMat1", this.scene);
        material_1.albedoColor = new BABYLON.Color3(0, 0, 0);
        material_1.albedoTexture = GameState.asset.texture.prop_magic_circle_1.clone();
        material_1.emissiveColor = new BABYLON.Color3(0.2, 0.2, 1.0);
        material_1.emissiveIntensity = 3.0;
        material_1.alphaMode = BABYLON.Engine.ALPHA_ADD;
        material_1.backFaceCulling = false;
        this.mesh_c1.material = material_1;

        const material_2 = new BABYLON.PBRMaterial("magicCircleMat2", this.scene);
        material_2.albedoColor = new BABYLON.Color3(0, 0, 0);
        material_2.albedoTexture = GameState.asset.texture.prop_magic_circle_2.clone();
        material_2.emissiveColor = new BABYLON.Color3(1.0, 0.5, 0.2);
        material_2.emissiveIntensity = 1.0;
        material_2.alphaMode = BABYLON.Engine.ALPHA_ADD;
        material_2.backFaceCulling = false;
        this.mesh_c2.material = material_2;

        const material_3 = new BABYLON.PBRMaterial("magicCircleMat3", this.scene);
        material_3.albedoColor = new BABYLON.Color3(0, 0, 0);
        material_3.albedoTexture = GameState.asset.texture.prop_magic_circle_3.clone();
        material_3.emissiveColor = new BABYLON.Color3(1.0, 0.2, 1.0);
        material_3.emissiveIntensity = 1.5;
        material_3.alphaMode = BABYLON.Engine.ALPHA_ADD;
        material_3.backFaceCulling = false;
        this.mesh_c3.material = material_3;

        // 回転アニメーション
        this.scene.onBeforeRenderObservable.add(() => {
            this.mesh_c1.rotation.y += 0.01;
            this.mesh_c2.rotation.y -= 0.005;
            this.mesh_c3.rotation.y += 0.001;
        });
        super.create();
    }

    update(time, delta){
        super.update(time, delta);
    }

    dispose(){
        if (this.mesh_c1){
            this.mesh_c1.dispose();
        }
        if (this.mesh_c2){
            this.mesh_c2.dispose();
        }
        if (this.mesh_c3){
            this.mesh_c3.dispose();
        }
        super.dispose();
    }
}