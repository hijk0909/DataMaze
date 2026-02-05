// gimmick_diamond.js
import { GameState } from "../GameState.js";
import { Gimmick } from "./base_gimmick.js";
import { Eff_Text } from './eff_text.js';

const DISP_SCALE = 0.15;

export class Gimmick_Diamond extends Gimmick {

    constructor(scene){
        super(scene);
    }

    create(pos, id){
        // console.log("create gimmick_diamond:",pos, id);
        const container = GameState.asset.mesh.gimmick_diamond;
        const inst = container.instantiateModelsToScene( (name) => `${name}_gimmick_diamond_${id}` );

        this.mesh = inst.rootNodes[0];
        this.mesh.position = pos.clone();
        this.mesh.scaling = new BABYLON.Vector3(DISP_SCALE, DISP_SCALE, DISP_SCALE);
        this.mesh.checkCollisions = false;

        this.mesh_diamond = inst.rootNodes[0].getChildMeshes().find(mesh => mesh.name.includes("diamond"));

        const material = new BABYLON.PBRMaterial("gimmick_diamond_material", this.scene); 
        material.alpha = 0.9;
        material.metallic = 0.6;
        material.roughness = 0.3;
        material.albedoColor = new BABYLON.Color3(1, 1, 0.8);
        material.transparencyMode = BABYLON.PBRMaterial.PBR_ALPHABLEND; 
        // material.needDepthPrePass = true; //重なり順の解決
        // material.useAlphaFromAlbedoTexture = false; //鏡面反射を見せる
        this.mesh_diamond.material = material;

        super.create();
    }

    activate(){
        const hp_tank = 1;
        GameState.player.add_hp_max(hp_tank);

        const eff = new Eff_Text(this.scene);
        eff.create(this.mesh.position, `HP Tank +${hp_tank}`);
        GameState.effects.push(eff);

        GameState.asset.se.powerup.play_3D(this, this.scene);

        super.activate();
    }

    update(time, delta){
        super.update(time, delta);
    }

    dispose(){
        super.dispose();
    }
}