// MathUtils.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from '../GameState.js';

export class MyMath {

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

    // static get_random_room_floor(){
    //     const i = Math.floor(Math.random() * GameState.rooms.length);
    //     const room = GameState.rooms[i];
    //     // console.log("room", room);
    //     // 外枠を除いた幅の中から床の位置を選ぶ
    //     const offset_x = Math.floor(Math.random() * (room.w - 2)) + 1;
    //     const offset_y = Math.floor(Math.random() * (room.h - 2)) + 1;
    //     return {cell_x : room.x + offset_x, cell_y : room.y + offset_y};
    // }

    static shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
          }
          return array;
    }
}