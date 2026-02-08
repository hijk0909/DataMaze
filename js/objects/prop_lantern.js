// prop_lantern.js
import { GameState } from "../GameState.js";
import { Prop } from "./base_prop.js";

const MOTION_AMPLITUDE = 0.3;
const MOTION_SPEED = 0.45;

const CORE_COLOR = new BABYLON.Color3(2.4, 0.4, 0);

export class Prop_Lantern extends Prop {

    constructor(scene){
        super(scene);
        this.y_base = 0;
        this.y_counter = 0;
    }

    create(pos){
        this.mesh = BABYLON.MeshBuilder.CreateSphere( "prop_lantern_core", { diameter: 0.5, segments: 16 }, this.scene );
        this.mesh.position = pos.clone();
        this.y_base = pos.y;
        this.mesh.checkCollisions = false;
        const prop_core_material = new BABYLON.PBRMaterial("prop_lantern_core_material", this.scene); 
        prop_core_material.albedoColor = new BABYLON.Color3(1, 0.1, 0),
        prop_core_material.emissiveColor = new BABYLON.Color3(CORE_COLOR.r, CORE_COLOR.g, CORE_COLOR.b),
        prop_core_material.metallic = 0.6;
        prop_core_material.roughness = 1.0;
        prop_core_material.alpha = 1.0;
        this.mesh.material = prop_core_material;

        this.mesh_outer = BABYLON.MeshBuilder.CreateCylinder("prop_lantern_outer", { diameter: 0.4, height: 1.2, tessellation: 32 }, this.scene);
        this.mesh_outer.position = pos.clone();
        this.mesh_outer.checkCollisions = false;
        const prop_outer_material = new BABYLON.PBRMaterial("prop_lantern_outern_material", this.scene); 
        prop_outer_material.albedoTexture = GameState.asset.texture.prop_cube;
        // prop_outer_material.emissiveColor = new BABYLON.Color3(0.1, 0.05, 0);
        prop_outer_material.metallic = 0.4;
        prop_outer_material.roughness = 1.0;
        // prop_outer_material.alpha = 1.0;
        // prop_outer_material.transparencyMode = BABYLON.PBRMaterial.PBR_ALPHABLEND; 
        prop_outer_material.needDepthPrePass = true; //重なり順の解決
        prop_outer_material.useAlphaFromAlbedoTexture = false; //鏡面反射を見せる

        this.mesh_outer.material = prop_outer_material; 

        super.create();
    }

    update(time, delta){
        const y = this.y_base + MOTION_AMPLITUDE * Math.sin(this.y_counter);
        this.mesh.position.y = y;
        this.mesh_outer.position.y = y;
        this.y_counter += MOTION_SPEED * (delta / 1500);

        const v = 1.0 + 0.2 * Math.sin(time / 75);
        this.mesh.material.emissiveColor.set(CORE_COLOR.r*v, CORE_COLOR.g*v, CORE_COLOR.b*v);

        super.update(time, delta);
    }

    dispose(){
        if (this.mesh_outer){
            this.mesh_outer.dispose();
        }
        super.dispose();
    }
}