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

    static world_to_screen(world_pos, scene) {
        const rw = GameState.game.engine.getRenderWidth();
        const rh = GameState.game.engine.getRenderHeight();
        const iw = GameState.ui_manager.ui.idealWidth;
        const ih = GameState.ui_manager.ui.idealHeight;

        const transformMatrix = GameState.camera.getTransformationMatrix();

        const screen_pos = BABYLON.Vector3.Project(
            world_pos,
            BABYLON.Matrix.Identity(),
            transformMatrix,
            GameState.camera.viewport.toGlobal(rw, rh)
        );

        // let x = (screen_Pos.x - rw / 2) * (iw / rw) + iw / 2;
        // let y = (screen_pos.y - rh / 2 + (ih -rh)/2) * (ih / rh) * (ih / rh) + ih / 2;
        // let x = (screen_pos.x - rw/2) * (iw/rw) + iw / 2;
        // let y = (screen_pos.y - rh/2 + (ih -rh)/2)*(ih/rh) + ih / 2;
        screen_pos.x = screen_pos.x * (iw / rw);
        screen_pos.y = screen_pos.y * (iw / rw);
        // screen_pos.y = screen_pos.y * (ih / rh);
        return screen_pos;
    }
}