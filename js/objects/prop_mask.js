// prop_mask.js
import { GameState } from "../GameState.js";
import { Prop } from "./base_prop.js";

const ROTATION_SPEED = 0.1;

export class Prop_Mask extends Prop {

    constructor(scene){
        super(scene);
    }

    create(pos, id){
        const container = GameState.asset.mesh.prop_mask;
        const inst = container.instantiateModelsToScene( (name) => `${name}_prop_mask_${id}` );
        this.mesh = inst.rootNodes[0];
        this.mesh.position = pos.clone();

        const wireMat = new BABYLON.StandardMaterial("wireMat", this.scene);
        wireMat.wireframe = true;
        wireMat.emissiveColor = new BABYLON.Color3(1, 0, 0);
        wireMat.disableLighting = true;

        const allMeshes = this.mesh.getDescendants(false, (node) => node instanceof BABYLON.Mesh);
        allMeshes.forEach((mesh) => {mesh.material = wireMat; });

        const head = inst.rootNodes[0].getChildMeshes().find(mesh => mesh.name.includes("head"));
        this.morphTarget = head.morphTargetManager.getTarget(0);
        this.morphTarget.influence = 1.0;

        super.create();
    }

    rotate_towards_player(delta){
        // ターゲット方向ベクトルを取得
        const targetPosition = GameState.player.mesh.position;
        const currentPosition = this.mesh.position;
        const targetDir = targetPosition.subtract(currentPosition).normalize();
        // メッシュのローカルZ軸 (this.forward) を targetDir に向ける回転を計算
        const targetQuaternion = new BABYLON.Quaternion();
        BABYLON.Quaternion.FromUnitVectorsToRef(
            BABYLON.Axis.Z, 
            targetDir, 
            targetQuaternion
        );
        // 球面線形補間で滑らかに回転
        BABYLON.Quaternion.SlerpToRef(
            this.mesh.rotationQuaternion,       // 現在の回転
            targetQuaternion,                   // 目標の回転
            ROTATION_SPEED,                     // 補間率（値が小さいほど滑らかで遅い）
            this.mesh.rotationQuaternion        // 結果をメッシュのクォータニオンに書き込み
        );
    }
    
    update(time, delta){
        this.rotate_towards_player(delta);
        const v = 0.5 + 0.5 * Math.sin(time / 100);
        this.morphTarget.influence = v;
        super.update(time, delta);
    }

    dispose(){
        super.dispose();
    }
}