// game_spawn.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from '../GameState.js';
import { MyMath } from "../utils/MathUtils.js";
import { Player } from "../objects/player.js";
import { Obs_Cube } from "../objects/obs_cube.js";
import { Itm_Feed } from "../objects/itm_feed.js";
import { Itm_Goal } from "../objects/itm_goal.js";
import { Enemy_1 } from "../objects/enemy_1.js";
import { Enemy_2 } from "../objects/enemy_2.js";

export class Spawn {
    constructor(scene) {
        this.scene = scene;

        this.player_position = null;
        this.goal_position = null;
        this.all_positions = [];
        this.used_positions = [];
        this.available_for_enemy_positions = [];
        this.available_for_item_positions = [];
    }

    center_of_room(room) {
        return {
            x: room.x + Math.floor(room.w / 2),
            y: room.y + Math.floor(room.h / 2),
        };
    }

    calc_positions(){
        MyMath.shuffle(this.available_for_enemy_positions);
    }

    initial_placement(){
        const scene = this.scene;

        // 配列の準備
        const all_positions = [];
        const available_for_enemy_positions = [];
        let used_positions = new Set();
        let available_positions = [];

        GameState.rooms.forEach((room, idx) => {
            for (let y = room.y + 1; y < room.y + room.h - 1; y++) {
                for (let x = room.x + 1; x < room.x + room.w - 1; x++) {
                    if (GameState.map[y][x] === GLOBALS.MAP.ELEMENT.FLOOR) continue;
                    all_positions.push({ x, y });
                    if (idx != 0) available_for_enemy_positions.push({ x, y });
                }
            }
        });
        MyMath.shuffle(all_positions);
        MyMath.shuffle(available_for_enemy_positions);

        // [Player] 自機の設定
        const player_position = this.center_of_room(GameState.rooms[0]);
        used_positions.add(`${player_position.x},${player_position.y}`);
        const p_pos = MyMath.cell_to_world(player_position.x, player_position.y);
        p_pos.y = GLOBALS.MOVABLE.Y.INIT;
        GameState.player = new Player(scene);
        GameState.player.create(GameState.asset.mesh.player, p_pos);

        // [Goal] 目的地の設定
        const goal_position = this.center_of_room(GameState.rooms[1]);
        used_positions.add(`${goal_position.x},${goal_position.y}`);
        const g_pos = MyMath.cell_to_world(goal_position.x, goal_position.y);
        g_pos.y = 0.5;
        const itm_goal = new Itm_Goal(scene);
        itm_goal.create(g_pos);
        GameState.items.push(itm_goal);

        // [EMY] 敵
        // enemy_1
        for (let i = 0; i < 8; i++){
            if (available_for_enemy_positions.length === 0) break;
            const enemy_position = available_for_enemy_positions.pop();
            used_positions.add(`${enemy_position.x},${enemy_position.y}`);
            const pos = MyMath.cell_to_world(enemy_position.x, enemy_position.y);
            pos.y = GLOBALS.MOVABLE.Y.INIT;
            const enemy = new Enemy_1(scene);
            enemy.create(GameState.asset.mesh.enemy_1, pos);
            GameState.enemies.push(enemy);
        }
        // enemy_2
        for (let i = 0; i < 20; i++){
            if (available_for_enemy_positions.length === 0) break;
            const enemy_position = available_for_enemy_positions.pop();
            used_positions.add(`${enemy_position.x},${enemy_position.y}`);
            const pos = MyMath.cell_to_world(enemy_position.x, enemy_position.y);
            pos.y = GLOBALS.MOVABLE.Y.INIT;
            const enemy = new Enemy_2(scene);
            enemy.create(GameState.asset.mesh.enemy_2, pos);
            GameState.enemies.push(enemy);
        }

        available_positions = all_positions.filter(p => !used_positions.has(`${p.x},${p.y}`));

        // [ITM] 餌
        // console.log("[ITEM] available_positions", available_positions);
        for (let i = 0; i < 25; i++) {
            if (available_positions.length === 0) break;
            const itm = new Itm_Feed(scene);
            const item_position = available_positions.pop();
            used_positions.add(`${item_position.x},${item_position.y}`);            
            const pos = MyMath.cell_to_world(item_position.x, item_position.y);
            pos.y = 0.5;
            itm.create(pos);
            GameState.items.push(itm);
        }

        // [OBS] 障害物
        // console.log("[OBS] available_positions", available_positions);
        for (let i = 0; i < 15; i++) {
            if (available_positions.length === 0) break;
            const obs = new Obs_Cube(scene);
            const obs_position = available_positions.pop();
            used_positions.add(`${obs_position.x},${obs_position.y}`);
            const pos = MyMath.cell_to_world(obs_position.x, obs_position.y);
            pos.y = 3 + Math.random() * 2;
            obs.create(pos);
            GameState.obstacles.push(obs);
        }
    } // End of initial_placement

    dispose(){
        // 自機
        if (GameState.player){
            GameState.player.dispose();
            GameState.player = null;
        }

        // 敵機
        for (let i = GameState.enemies.length - 1; i >= 0; i--) {
            GameState.enemies[i].dispose();
            GameState.enemies.splice(i, 1);
        }
        GameState.enemies = [];

        // アイテム
        for (let i = GameState.items.length - 1; i >= 0; i--) {
            GameState.items[i].dispose();
            GameState.items.splice(i, 1);
        }
        GameState.items = [];

        // 障害物
        for (let i = GameState.obstacles.length - 1; i >= 0; i--) {
            GameState.obstacles[i].dispose();
            GameState.obstacles.splice(i, 1);
        }
        GameState.obstacles = [];

        // エフェクト
        for (let i = GameState.effects.length - 1; i >= 0; i--) {
            GameState.effects[i].dispose();
            GameState.effects.splice(i, 1);
        }
        GameState.effects = [];

    } // End of dispose
}