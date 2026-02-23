// MathUtils.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from '../GameState.js';

export class MyMath {

    static shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
          }
          return array;
    }

    static cell_to_world(cell_x, cell_y){
        if (cell_x >= GLOBALS.MAP.CELL.SIZE || cell_y >= GLOBALS.MAP.CELL.SIZE){
            return null;
        }
        const scale = GLOBALS.MAP.CELL.SCALE;
        const offset = GLOBALS.MAP.CELL.SIZE * scale / 2;
        const x = (cell_x + 0.5) * scale - offset;
        const z = ((cell_y + 0.5) * scale - offset)*(-1);
        return new BABYLON.Vector3(x, 0, z);
    }


    static world_to_cell(world_vec) {
        const scale = GLOBALS.MAP.CELL.SCALE;
        const offset = (GLOBALS.MAP.CELL.SIZE * scale) / 2;
        // const cell_x = (world_vec.x + offset) / scale - 0.5;
        const cell_x = (world_vec.x + offset) / scale;
        // const cell_y = ((-world_vec.z + offset) / scale) - 0.5;
        const cell_y = ((-world_vec.z + offset) / scale);
        return { x: cell_x, y: cell_y };
    }

    static get_ui_scale(){
        // UI画面のスケールは常に横幅で決まる
        return GameState.game.engine.getRenderWidth() / GLOBALS.UI.WIDTH;
    }

    static world_to_screen(world_pos) {

        const rw = GameState.game.engine.getRenderWidth();
        const rh = GameState.game.engine.getRenderHeight();

        const transformMatrix = GameState.camera.getTransformationMatrix();
        const screen_pos = BABYLON.Vector3.Project(
            world_pos,
            BABYLON.Matrix.Identity(),
            transformMatrix,
            GameState.camera.viewport.toGlobal(rw, rh)
        );

        const scale = this.get_ui_scale();
        screen_pos.x = screen_pos.x / scale;
        screen_pos.y = screen_pos.y / scale;

        return screen_pos;
    }

    static clamp_ui_object(org_left, org_top, x_pad, y_pad, x_width, y_height){

        const rh = GameState.game.engine.getRenderHeight(); //現在のブラウザの縦幅

        const scale = this.get_ui_scale();
        const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
        const clamped_x = clamp(org_left, x_pad, GLOBALS.UI.WIDTH - x_pad - x_width);
        const clamped_y = clamp(org_top, y_pad, rh / scale - y_pad - y_height);

        return { left:clamped_x, top:clamped_y}
    }

    static is_occluded_by_terrain(target, scene) {
        // const camera = this.scene.activeCamera;
        const camera = GameState.camera;
        const origin = camera.position.clone();
        // const toEnemy = this.mesh.getAbsolutePosition ? this.mesh.getAbsolutePosition() : this.mesh.position.clone();
        const dirVec = target.subtract(origin);
        const dist = dirVec.length();
        if (dist <= 0.0001) return false; // ほぼ同位置なら見えているとする
        const dir = dirVec.scale(1 / dist); // normalize
        const ray = new BABYLON.Ray(origin, dir, dist - 0.01);
        const hit = scene.pickWithRay(ray, (mesh) => {
            return mesh && mesh.isTerrain === true;
        });
        return hit && hit.pickedMesh && hit.pickedMesh.isTerrain === true;
    }
}