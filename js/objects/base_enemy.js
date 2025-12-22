// base_enemy.js
import { GameState } from "../GameState.js";
import { Movable } from "./base_movable.js";
import { MyMath } from "../utils/MathUtils.js";

const FLASH_TIME = 0.15; //秒

const HP_OFFSET_Y = 0.5;
const HP_BAR_WIDTH = 160;
const HP_BAR_HEIGHT = 20;
const HP_BAR_PADDING = 30;

export class Enemy extends Movable {

    constructor(scene){
        super(scene);
        this.materials = [];
        this.flash_time = 0;

        this.hp_max = 100;
        this.hp = 100;
        this.hpFrame = null;
        this.hpFill = null;
    }

    create(){
        // 体力ゲージの生成
        this.create_hp_bar();

        // emmisiveColor のある 全マテリアルの収集
        this.mesh.getChildMeshes().forEach(m => {
            if (m.material){
                m.material = m.material.clone();
                if (m.material.emissiveColor){
                    this.materials.push(m.material);
                }
            }
        });
        super.create();
    }

    create_hp_bar(){

        // 外枠
        this.hpFrame = new BABYLON.GUI.Rectangle();
        this.hpFrame.width = `${HP_BAR_WIDTH}px`;
        this.hpFrame.height = `${HP_BAR_HEIGHT}px`;
        this.hpFrame.color = "red";
        this.hpFrame.thickness = 2;
        this.hpFrame.background = "transparent";
        this.hpFrame.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.hpFrame.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        GameState.ui_manager.ui.addControl(this.hpFrame);
        // this.hpFrame.linkWithMesh(this.hpNode);

        // 中身色 (左合わせ)
        this.hpFill = new BABYLON.GUI.Rectangle();
        this.hpFill.height = `${HP_BAR_HEIGHT}px`;
        this.hpFill.color = "yellow";
        this.hpFill.background = "yellow";
        this.hpFill.thickness = 0;
        this.hpFill.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.hpFill.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.hpFrame.addControl(this.hpFill);

    }

    is_occluded_by_terrain() {
        // const camera = this.scene.activeCamera;
        const camera = GameState.camera;
        const origin = camera.position.clone();
        const toEnemy = this.mesh.getAbsolutePosition ? this.mesh.getAbsolutePosition() : this.mesh.position.clone();
        const dirVec = toEnemy.subtract(origin);
        const dist = dirVec.length();
        if (dist <= 0.0001) return false; // ほぼ同位置なら見えているとする
        const dir = dirVec.scale(1 / dist); // normalize
        const ray = new BABYLON.Ray(origin, dir, dist - 0.01);
        const hit = this.scene.pickWithRay(ray, (mesh) => {
            return mesh && mesh.isTerrain === true;
        });
        return hit && hit.pickedMesh && hit.pickedMesh.isTerrain === true;
    }

    update_hp_bar(){

        // 壁の影に隠れていないか
        if (this.is_occluded_by_terrain()){
            this.hpFrame.isVisible = false;
            this.hpFill.isVisible = false;
            return;
        }

        const world_pos = this.mesh.position.clone();
        world_pos.y += HP_OFFSET_Y;
        const screen_pos = MyMath.world_to_screen(world_pos, this.scene);

        // [本体] 3D → スクリーン座標
        // const screen_pos = BABYLON.Vector3.Project(
        //     world_pos,
        //     BABYLON.Matrix.Identity(),
        //     this.scene.getTransformMatrix(),
        //     GameState.camera.viewport.toGlobal(rw, rh)
        // );
        // 視錐体の near と far の範囲内ではない場合は表示しない
        if (screen_pos.z < 0.0 || screen_pos.z > 1.0) {
            this.hpFrame.isVisible = false;
            this.hpFill.isVisible = false;
            return;
        }
        this.hpFrame.isVisible = true;
        this.hpFill.isVisible = true;

        let x = screen_pos.x;
        let y = screen_pos.y;

        const iw = GameState.ui_manager.ui.idealWidth;
        const ih = GameState.ui_manager.ui.idealHeight;
        const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
        x = clamp(x, HP_BAR_WIDTH  + HP_BAR_PADDING, iw - HP_BAR_WIDTH - HP_BAR_PADDING);
        y = clamp(y, HP_BAR_HEIGHT + HP_BAR_PADDING, ih - HP_BAR_HEIGHT- HP_BAR_PADDING);

        // 外枠の位置
        this.hpFrame.left = x - HP_BAR_WIDTH / 2;
        this.hpFrame.top = y - HP_BAR_HEIGHT / 2;

        // 残り HP 比率
        const ratio = this.hp / this.hp_max;
        const barWidth = HP_BAR_WIDTH * ratio;

        // 黄色バーの位置と幅
        this.hpFill.width = `${barWidth}px`;
    }

    update(time, delta){
        this.update_hp_bar();

        if (this.flash_time > 0) {
            this.flash_time -= delta / 1000;
            const t = Math.max(0, this.flash_time / FLASH_TIME); // 1→0
            this.materials.forEach(mat => {
                mat.emissiveColor.set(t,t,t);
            });
        }
        super.update(time, delta);
    }

    flash(){
        this.flash_time = FLASH_TIME;
    }

    dispose(){
        if (this.hpFrame) {
            if (GameState.ui_manager){
                GameState.ui_manager.ui.removeControl(this.hpFrame);
            }
            this.hpFrame.dispose();
            this.hpFrame = null;
        }
        if (this.hpFill) {
            if (GameState.ui_manager){
                GameState.ui_manager.ui.removeControl(this.hpFill);
            }
            this.hpFill.dispose();
            this.hpFill = null;
        }
        super.dispose();
    }
}