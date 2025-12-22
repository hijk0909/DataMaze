// obs_cube.js
import { GameState } from "../GameState.js";
import { Obstacle } from "./base_obstacle.js";

export class Obs_Cube extends Obstacle {

    constructor(scene){
        super(scene);
    }

    create(pos){
        this.mesh = BABYLON.MeshBuilder.CreateBox("obs_cube", { size: 1 }, this.scene);
        this.mesh.position = pos;
        this.mesh.checkCollisions = true;
        const obsMaterial = new BABYLON.StandardMaterial("obsMaterial", this.scene); 
        obsMaterial.diffuseTexture = GameState.asset.texture.obstacle;
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