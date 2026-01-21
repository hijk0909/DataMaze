// prop_rain.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from "../GameState.js";
import { Prop } from "./base_prop.js";

export class Prop_Rain extends Prop {

    constructor(scene){
        super(scene);
        this.time = 0;
    }

    create(pos){
        const radius = 1.0;
        const height = 2.0;

        // 円柱メッシュ
        this.mesh = BABYLON.MeshBuilder.CreateCylinder("prop_rain", {
                height: 8.03,
                diameter: 1,
                tessellation: 64,
                sideOrientation: BABYLON.Mesh.DOUBLESIDE
        }, this.scene);
        this.mesh.position = pos.clone();
        this.mesh.position.y = 4.01;
        
        // シェーダー
        const shader = new BABYLON.ShaderMaterial("RainShader", this.scene,
            { vertex: "rain", fragment: "rain", },
            { attributes: ["position", "uv"], 
              uniforms: ["worldViewProjection", "time"],
              samplers: ["diffuseSampler"] }
        );
        shader.backFaceCulling = false;
        shader.alphaMode = BABYLON.Engine.ALPHA_ADD;
        // shader.alphaMode = BABYLON.Engine.ALPHA_COMBINE;
        shader.alpha = 0.99; // Shaderのalphaを有効にするために 0.0 や 1.0 にはしないこと
        shader.setFloat("alpha", 0.1);
        shader.setTexture("diffuseSampler", GameState.asset.texture.prop_rain);
        this.scene.onBeforeRenderObservable.add(() => {
            this.time += this.scene.getEngine().getDeltaTime() * 0.0005;
            shader.setFloat("time", this.time);
            // console.log("time:",this.time);
        });
        this.mesh.material = shader;
        this.material = shader;
 
        super.create();
    }

    update(time, delta){
        super.update(time, delta);
    }

    dispose(){
        this.mesh.dispose();
        this.material.dispose();
        super.dispose();
    }
}