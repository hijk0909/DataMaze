// prop_cube.js
import { GameState } from "../GameState.js";
import { Prop } from "./base_prop.js";

const MOTION_AMPLITUDE = 0.3;
const MOTION_SPEED = 0.5;

export class Prop_Cube extends Prop {

    constructor(scene){
        super(scene);
        this.y_base = 0;
        this.y_counter = 0;
    }

    create(pos){
        this.mesh = BABYLON.MeshBuilder.CreateBox("prop_cube", { size: 1 }, this.scene);
        this.mesh.position = pos.clone();
        this.y_base = this.mesh.position.y;
        this.mesh.checkCollisions = false;
        const prop_cube_material = new BABYLON.StandardMaterial("prop_cube_material", this.scene); 
        prop_cube_material.diffuseTexture = GameState.asset.texture.prop_cube;
        prop_cube_material.alpha = 0.8;
        this.mesh.material = prop_cube_material;
        super.create();
    }



    update(time, delta){
        if (this.mesh && this.mesh.position){
            this.mesh.position.y = this.y_base + MOTION_AMPLITUDE * Math.sin(this.y_counter);
            this.y_counter += MOTION_SPEED * (delta / 1000);
        }
        super.update(time, delta);
    }

    dispose(){
        super.dispose();
    }
}