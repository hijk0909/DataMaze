// prop_cube.js
import { GameState } from "../GameState.js";
import { Prop } from "./base_prop.js";

export class Prop_Cube extends Prop {

    constructor(scene){
        super(scene);
    }

    create(pos){
        this.mesh = BABYLON.MeshBuilder.CreateBox("obs_cube", { size: 1 }, this.scene);
        this.mesh.position = pos.clone();
        this.mesh.checkCollisions = false;
        const obsMaterial = new BABYLON.StandardMaterial("obsMaterial", this.scene); 
        obsMaterial.diffuseTexture = GameState.asset.texture.obstacle;
        obsMaterial.alpha = 0.8;
        this.mesh.material = obsMaterial;
        super.create();
    }

    update(time, delta){
        super.update(time, delta);
    }

    dispose(){
        super.dispose();
    }
}