// prop_ego.js
import { GameState } from "../GameState.js";
import { Prop } from "./base_prop.js";

export class Prop_Ego extends Prop {

    constructor(scene){
        super(scene);
    }

    create(pos){
        // Meshの作成
        const particleCount = 180;

        // 位置 attribute
        const positions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3 + 0] = pos.x;
            positions[i * 3 + 1] = pos.y;
            positions[i * 3 + 2] = pos.z;
        }

        // 位相 attribute
        const phases = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            phases[i * 3 + 0] = Math.random() * Math.PI * 2; // φx
            phases[i * 3 + 1] = Math.random() * Math.PI * 2; // φy
            phases[i * 3 + 2] = Math.random() * Math.PI * 2; // φz
        }

        const mesh = new BABYLON.Mesh("egoSwirl", this.scene);
        mesh.alwaysSelectAsActiveMesh = true; //大きさの無い点をカリングで捨てられないようにする
        const vertexData = new BABYLON.VertexData();
        vertexData.positions = positions;
        vertexData.applyToMesh(mesh);
        mesh.setVerticesData("phase", phases, false, 3);

        const shaderMaterial = new BABYLON.ShaderMaterial(
            "egoSwirlMat",this.scene,
            { vertex: "egoSwirl", fragment: "egoSwirl" },
            {
                attributes: ["position", "phase"],
                uniforms: ["worldViewProjection", "time", "radius", "cameraPosition"],
            }
        );
        shaderMaterial.pointsCloud = true;
        // shaderMaterial.pointSize = 1.0; //点の大きさはVertexShaderで指定
        shaderMaterial.alphaMode = BABYLON.Engine.ALPHA_ADD;
        shaderMaterial.alpha = 0.01;
        shaderMaterial.disableDepthWrite = true;
        shaderMaterial.disableDepthTest  = true;
        shaderMaterial.backFaceCulling = false;
        shaderMaterial.setFloat("radius", 0.5);
        mesh.material = shaderMaterial;
        mesh.isPickable = false;

        let t = 0;
        this.scene.registerBeforeRender(() => {
            t += this.scene.getEngine().getDeltaTime() * 0.0003;
            // console.log("t:",t);
            shaderMaterial.setFloat("time", t);
            shaderMaterial.setVector3("cameraPosition", GameState.camera.position);
        });
        super.create();
    }

    update(time, delta){
        super.update(time, delta);
    }

    dispose(){
        super.dispose();
    }
}