// gimmick_chakra.js
import { GameState } from "../GameState.js";
import { Gimmick } from "./base_gimmick.js";
import { Eff_Text } from './eff_text.js';

const DISP_SCALE = 1.0;

const CHAKRA_NAMES = ["Muladhara","Swadhisthana","Manipura","Anahata","Vishuddha","Ajna","Sahasrara"];

export class Gimmick_Chakra extends Gimmick {

    constructor(scene){
        super(scene);
        this.score = 100;
        this.chakra_number = GameState.stage - 1;
    }

    create(pos, id){
        // console.log("create gimmick_chakra:",pos, id);
        // mesh
        this.mesh = BABYLON.MeshBuilder.CreatePlane("square", { width: 1, height: 1,
            sideOrientation: BABYLON.Mesh.DOUBLESIDE }, this.scene);
        this.mesh.position = pos.clone();
        this.mesh.checkCollisions = false;
        this.mesh.scaling = new BABYLON.Vector3(DISP_SCALE, DISP_SCALE, DISP_SCALE); // サイズ調整

        // material
        const material = new BABYLON.PBRMaterial("mat", this.scene);
        material.albedoTexture = GameState.asset.texture.gimmick_chakra.clone();
        material.albedoTexture.hasAlpha = true;
        material.useAlphaFromAlbedoTexture = true;
        material.alphaMode = BABYLON.Engine.ALPHA_ADD;
        material.emissiveColor = new BABYLON.Color3(1.0, 0.5, 0.05);
        material.unlit = true;   // Lightの影響を一切受けない
        material.alpha = 0.8;
        material.backFaceCulling = false; // 両面表示
        this.mesh.material = material;

        const totalSprites = 7;
        const spriteWidth = 1 / totalSprites;
        this.mesh.setPivotPoint(new BABYLON.Vector3(0, 0, 0)); // 必要に応じて
        // UV調整
        const uOffset = this.chakra_number * spriteWidth;
        this.mesh.setVerticesData(BABYLON.VertexBuffer.UVKind, [
        uOffset, 1,               // 左上
        uOffset + spriteWidth, 1, // 右上
        uOffset + spriteWidth, 0, // 右下
        uOffset, 0                // 左下
        ]);

        // 回転
        this.scene.onBeforeRenderObservable.add(() => {
            this.mesh.rotation.y += 0.01;
        });

        GameState.result.num_chakra++;
        super.create();
    }

    activate(){
        const item = "Chakra";
        GameState.ui_manager.add_item(item);

        GameState.player.hp = GameState.player.hp_max;

        const eff = new Eff_Text(this.scene);
        eff.create(this.mesh.position, `${CHAKRA_NAMES[this.chakra_number]} Chakra`);
        GameState.effects.push(eff);

        GameState.asset.se.powerup.play_3D(this, this.scene);

        GameState.result.num_chakra_collected++;
        super.activate();
    }

    update(time, delta){
        super.update(time, delta);
    }

    dispose(){
        super.dispose();
    }
}