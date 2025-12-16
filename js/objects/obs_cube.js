// obs_cube.js
import { MyMath } from "../utils/MathUtils.js";
import { Obstacle } from "./base_obstacle.js";

export class Obs_Cube extends Obstacle {

    constructor(scene){
        super(scene);
    }

    create(pos){
        this.mesh = BABYLON.MeshBuilder.CreateBox("obs_cube", { size: 1 }, this.scene);
        this.mesh.position = pos;
        this.mesh.checkCollisions = true;
        super.create();
    }

    update(time, delta){
        super.update(time, delta);
    }

    dispose(){
        super.dispose();
    }
}