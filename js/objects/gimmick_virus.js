// gimmick_virus.js
import { GameState } from "../GameState.js";
import { Gimmick } from "./base_gimmick.js";
import { Eff_Text } from './eff_text.js';

const DISP_SCALE = 0.15;

export class Gimmick_Virus extends Gimmick {

    constructor(scene){
        super(scene);
        this.score = 80;
    }

    create(pos, id){
        // console.log("create gimmick_virus:",pos, id);
        const container = GameState.asset.mesh.gimmick_virus;
        const inst = container.instantiateModelsToScene( (name) => `${name}_gimmick_virus_${id}` );

        this.mesh = inst.rootNodes[0];
        this.mesh.position = pos.clone();
        this.mesh.scaling = new BABYLON.Vector3(DISP_SCALE, DISP_SCALE, DISP_SCALE);
        this.mesh.checkCollisions = false;

        this.mesh_virus = inst.rootNodes[0].getChildMeshes().find(mesh => mesh.name.includes("virus"));

        const material = new BABYLON.PBRMaterial("gimmick_virus_material", this.scene); 
        material.albedoColor = new BABYLON.Color3(1, 0, 1);
        material.metallic = 0.0;
        material.roughness = 1.0;
        material.alpha = 1.0;
        this.mesh_virus.material = material;
        super.create();
    }

    activate(){
        const hp_delta = -0.1;
        GameState.player.add_hp_delta(hp_delta);

        const eff = new Eff_Text(this.scene);
        eff.create(this.mesh.position, `VIRUS ${Math.abs(hp_delta)}`, "#ff0000");
        GameState.effects.push(eff);

        GameState.asset.se.powerdown.play();

        super.activate();
    }

    update(time, delta){
        super.update(time, delta);
    }

    dispose(){
        super.dispose();
    }
}