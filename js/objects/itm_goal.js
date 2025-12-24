// itm_goal.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from "../GameState.js";
import { Item } from "./base_item.js";
import { Eff_Text } from './eff_text.js';
import { Eff_Firework } from './eff_firework.js';

const COOLDOWN_INTERVAL = 60;

export class Itm_Goal extends Item {

    constructor(scene){
        super(scene);
        this.activated = false;
        this.goal_light_mesh = null;
        this.time = 0;
    }

    create(pos){
        const radius = 1.0;
        const height = 2.0;

        // 台形柱を生成
        this.mesh = BABYLON.MeshBuilder.CreateCylinder("goal",{
                diameterTop: radius * 1.0,
                diameterBottom: radius * 2.0,
                height: height,
                tessellation: 16 //ポリゴンの多さ
            }, this.scene);
        this.mesh.position = pos.clone();
        this.mesh.alpha = 0.5;

        // 演出用のメッシュを生成
        this.goal_light_mesh = BABYLON.MeshBuilder.CreateCylinder("goal_light", {
                height: 4,
                diameter: 2,
                tessellation: 64,
                sideOrientation: BABYLON.Mesh.DOUBLESIDE
        }, this.scene);
        this.goal_light_mesh.position = pos.clone();
        this.goal_light_mesh.position.y = 1.95; // 地面に立たせる
        
        // 実体用のマテリアルを生成
        const material = new BABYLON.StandardMaterial(`mat`, this.scene);
        material.diffuseColor = new BABYLON.Color3(1.0, 1.0, 0.0);
        material.specularColor = new BABYLON.Color3(0.8, 0.8, 0.8); 

        material.alpha = 0.5;
        material.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
        material.needDepthPrePass = true; // 重なり順が正しくなる

        this.mesh.material = material;

        // 演出用のシェーダーを生成
        const shader = new BABYLON.ShaderMaterial("goalLightShader", this.scene,
            { vertex: "goalLight", fragment: "goalLight", },
            { attributes: ["position", "uv"], 
              uniforms: ["worldViewProjection", "time"],
              samplers: ["diffuseSampler"] }
        );
        shader.backFaceCulling = false;
        shader.alphaMode = BABYLON.Engine.ALPHA_ADD;
        // shader.alphaMode = BABYLON.Engine.ALPHA_COMBINE;
        shader.alpha = 0.1;
        shader.setTexture("diffuseSampler", GameState.asset.texture.goal_light);
        this.scene.onBeforeRenderObservable.add(() => {
            this.time += this.scene.getEngine().getDeltaTime() * 0.001;
            shader.setFloat("time", this.time);
            // console.log("time:",this.time);
        });
        this.goal_light_mesh.material = shader;
        this.goal_light_material = shader;
 
        super.create();
    }

    activate(){
        if (!this.activated){
            this.activated = true;
            // [TEXT]
            const eff = new Eff_Text(this.scene);
            eff.create(this.mesh.position, "GOAL");
            GameState.effects.push(eff);
            GameState.asset.bgm.main.fadeOut();

            // 敵を強制的に全滅
            for (let i = GameState.enemies.length - 1; i >= 0; i--) {
                const enemy = GameState.enemies[i];
                enemy.alive = false;
                const eff = new Eff_Firework(this.scene);
                eff.create(enemy.mesh.position);
                GameState.effects.push(eff);
            }
            GameState.asset.se.explosion.play();
            // [TRANIST]
            GameState.stage_state = GLOBALS.STAGE_STATE.CLEAR;
        }
    }

    update(time, delta){
        super.update(time, delta);
    }

    dispose(){
        this.goal_light_mesh.dispose();
        this.goal_light_material.dispose();
        super.dispose();
    }
}