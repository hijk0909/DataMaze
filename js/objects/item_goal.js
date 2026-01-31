// item_goal.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from "../GameState.js";
import { Item } from "./base_item.js";
import { Eff_Text } from './eff_text.js';
import { Eff_Firework } from './eff_firework.js';

const INACTIVE_PERIOD = 1.0;

export class Item_Goal extends Item {

    constructor(scene){
        super(scene);
        this.activated = false;
        this.charged = false;
        this.goal_light_mesh = null;
        this.time = 0;
        this.inactive_counter = 0;
    }

    create(pos, id){
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
        
        const material = new BABYLON.PBRMaterial(`mat`, this.scene);
        material.albedoColor = new BABYLON.Color3(1.0, 1.0, 0.0);
        material.metallic = 0.0;
        material.roughness = 0.2;
        material.alpha = 0.8;
        material.transparencyMode = BABYLON.PBRMaterial.PBR_ALPHABLEND; 
        material.needDepthPrePass = true; //重なり順の解決
        material.useAlphaFromAlbedoTexture = false; //鏡面反射を見せる
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
        shader.alpha = 0.01; // Shader自体の透過を有効にするため
        shader.setFloat("alpha", 0.01);
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
            if (!this.charged){
                // バッテリーを持っていない
                if (this.inactive_counter <= 0){
                    this.inactive_counter = INACTIVE_PERIOD;
                    const eff = new Eff_Text(this.scene);
                    eff.create(this.mesh.position, "NO BATTERY");
                    GameState.effects.push(eff);
                }
            } else {
                // ステージゴール
                this.activated = true;
                // [TEXT]
                const eff = new Eff_Text(this.scene);
                eff.create(this.mesh.position, "GOAL");
                GameState.effects.push(eff);
                GameState.bgm.fadeOut();

                // 敵を強制的に全滅
                for (let i = GameState.enemies.length - 1; i >= 0; i--) {
                    const enemy = GameState.enemies[i];
                    enemy.alive = false;
                    const eff = new Eff_Firework(this.scene);
                    eff.create(enemy.mesh.position);
                    GameState.effects.push(eff);
                }
                GameState.asset.se.explosion.play();
                // バッテリーを消費
                GameState.ui_manager.remove_item("Battery");
                // [TRANIST]
                GameState.stage_state = GLOBALS.STAGE_STATE.CLEAR;
            }
        }
    }

    update(time, delta){
        if (!this.charged){
            if (GameState.ui_manager.find_item("Battery")){
                this.charged = true;
                this.goal_light_material.setFloat("alpha", 1.0);
            }
        }
        if (this.inactive_counter > 0){
            this.inactive_counter -= delta / 1000;
        }
        super.update(time, delta);
    }

    dispose(){
        this.goal_light_mesh.dispose();
        this.goal_light_material.dispose();
        super.dispose();
    }
}