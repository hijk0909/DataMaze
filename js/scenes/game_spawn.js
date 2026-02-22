// game_spawn.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from '../GameState.js';
import { MyMath } from "../utils/MathUtils.js";
import { Player } from "../objects/player.js";
import { Item_Goal } from "../objects/item_goal.js";
import { Item_Battery } from "../objects/item_battery.js";
import { Item_Box } from "../objects/item_box.js";
import { Item_Key } from "../objects/item_key.js";
import { Item_Feed } from "../objects/item_feed.js";
import { Item_Mass } from "../objects/item_mass.js";
import { Item_SpeedMax } from "../objects/item_speed_max.js";
import { Item_ShotSpeed } from "../objects/item_shot_speed.js";
import { Item_ShotPower } from "../objects/item_shot_power.js";
import { Item_Fluxcore } from "../objects/item_fluxcore.js";
import { Enemy_1 } from "../objects/enemy_1.js";
import { Enemy_2 } from "../objects/enemy_2.js";
import { Enemy_3 } from "../objects/enemy_3.js";
import { Enemy_4 } from "../objects/enemy_4.js";
import { Enemy_5 } from "../objects/enemy_5.js";
import { Enemy_6 } from "../objects/enemy_6.js";
import { Enemy_7 } from "../objects/enemy_7.js";
import { Enemy_8 } from "../objects/enemy_8.js";
import { Enemy_9 } from "../objects/enemy_9.js";
import { Prop_Cube } from "../objects/prop_cube.js";
import { Prop_Display } from "../objects/prop_display.js";
import { Prop_Rain } from "../objects/prop_rain.js";
import { Prop_Lantern } from "../objects/prop_lantern.js";
import { Prop_MagicCircle } from "../objects/prop_magic_circle.js";
import { Prop_Mask } from "../objects/prop_mask.js";
import { Prop_Ego } from "../objects/prop_ego.js";
import { Gimmick_Diamond} from "../objects/gimmick_diamond.js";
import { Gimmick_Virus} from "../objects/gimmick_virus.js";

const EnemyClassList = {
    'Enemy_1' : Enemy_1,
    'Enemy_2' : Enemy_2,
    'Enemy_3' : Enemy_3,
    'Enemy_4' : Enemy_4,
    'Enemy_5' : Enemy_5,
    'Enemy_6' : Enemy_6,
    'Enemy_7' : Enemy_7,
    'Enemy_8' : Enemy_8,
    'Enemy_9' : Enemy_9
}

const ItemClassList = {
    'Item_Goal' :    Item_Goal,
    'Item_Battery' : Item_Battery,
    'Item_Box' :     Item_Box,
    'Item_Key' :     Item_Key,
    'Item_Feed' :    Item_Feed,
    'Item_Mass' :    Item_Mass,
    'Item_SpeedMax' :Item_SpeedMax,
    'Item_ShotSpeed':Item_ShotSpeed,
    'Item_ShotPower':Item_ShotPower,
    'Item_Fluxcore' :Item_Fluxcore
}

const PropClassList = {
    'Prop_Cube'         : Prop_Cube,
    'Prop_Display'      : Prop_Display,
    'Prop_Rain'         : Prop_Rain,
    'Prop_Lantern'      : Prop_Lantern,
    'Prop_MagicCircle'  : Prop_MagicCircle,
    'Prop_Mask'         : Prop_Mask,
    'Prop_Ego'          : Prop_Ego
}

const GimmickClassList = {
    'Gimmick_Diamond'   : Gimmick_Diamond,
    'Gimmick_Virus'     : Gimmick_Virus
}


export class Spawn {
    constructor(scene) {
        this.scene = scene;
    }

    center_of_room(room) {
        return {
            x: room.x + Math.floor(room.w / 2),
            y: room.y + Math.floor(room.h / 2),
        };
    }

    // calc_positions(){
    //     MyMath.shuffle(this.available_for_enemy_positions);
    // }

    spawn_enemy(enemy_name, pos, type=""){
        GameState.num_enemies++;
        const EnemyClass = EnemyClassList[enemy_name];
        const enemy = new EnemyClass(this.scene);
        enemy.create(pos, GameState.num_enemies, type);
        GameState.enemies.push(enemy);
        return enemy;
    }

    spawn_item(item_name, pos){
        GameState.num_items++;
        const ItemClass = ItemClassList[item_name];
        const item = new ItemClass(this.scene);
        item.create(pos, GameState.num_items);
        GameState.items.push(item);        
        return item;
    }

    spawn_prop(prop_name, pos){
        GameState.num_props++;
        const PropClass = PropClassList[prop_name];
        const prop = new PropClass(this.scene);
        prop.create(pos, GameState.num_props);
        GameState.props.push(prop);        
        return prop;
    }


    spawn_gimmick(gimmick_name, pos){
        GameState.num_gimmicks++;
        const GimmickClass = GimmickClassList[gimmick_name];
        const gimmick = new GimmickClass(this.scene);
        gimmick.create(pos, GameState.num_gimmicks);
        GameState.gimmicks.push(gimmick);
        return gimmick;

    }

    spawn_enemies_from_array(enemy_name, num, type, array, used){
        for (let i = 0; i < num; i++){
            if (array.length === 0) break;
            const enemy_position = array.pop();
            used.add(`${enemy_position.x},${enemy_position.y}`);
            const pos = MyMath.cell_to_world(enemy_position.x, enemy_position.y);
            pos.y = GLOBALS.MOVABLE.Y.INIT;
            this.spawn_enemy(enemy_name, pos, type);
        }
    }

    spawn_items_from_array(item_name, num, array, used){
        for (let i = 0; i < num; i++) {
            if (array.length === 0) break;
            const item_position = array.pop();
            used.add(`${item_position.x},${item_position.y}`);            
            const pos = MyMath.cell_to_world(item_position.x, item_position.y);
            pos.y = GLOBALS.ITEM.Y.BASE;
            this.spawn_item(item_name, pos);
        }
    }

    spawn_props_from_array(prop_name, num, array, used){
        for (let i = 0; i < num; i++) {
            if (array.length === 0) break;
            const prop_position = array.pop();
            used.add(`${prop_position.x},${prop_position.y}`);            
            const pos = MyMath.cell_to_world(prop_position.x, prop_position.y);
            pos.y = 2.0 + Math.random() * 2.5;
            this.spawn_prop(prop_name, pos);
        }
    }

    spawn_gimmicks_from_array(gimmick_name, num, array){
        for (let i = 0; i < num; i++) {
            if (array.length === 0) break;
            const gimmick_position = array.pop();
            const pos = MyMath.cell_to_world(gimmick_position.x, gimmick_position.y);
            pos.y = GLOBALS.GIMMICK.Y.BASE;
            this.spawn_gimmick(gimmick_name, pos);
        }
    }


    // ◆初期配置
    initial_placement(){

        // console.log("initial_placement:", GameState.stageInfo);

        const scene = this.scene;

        GameState.num_enemies = 0;
        GameState.num_items = 0;
        GameState.num_gimmicks = 0;

        // 初期配置制用の配列の準備
        let all_positions = [];
        let available_for_enemy_positions = [];
        let used_positions = new Set();
        let available_positions = [];
        let available_corridor_positions = [];

        GameState.rooms.forEach((room, idx) => {
            for (let y = room.y + 1; y < room.y + room.h - 1; y++) {
                for (let x = room.x + 1; x < room.x + room.w - 1; x++) {
                    // if (GameState.map[y][x] === GLOBALS.MAP.ELEMENT.FLOOR) continue;
                    all_positions.push({ x, y });
                    if (idx != 0) available_for_enemy_positions.push({ x, y });
                }
            }
        });

        for (let y = 0; y < GameState.map.length; y++) {
            for (let x = 0; x < GameState.map[y].length; x++) {
                if (GameState.map[y][x] === GLOBALS.MAP.ELEMENT.CORRIDOR){
                    available_corridor_positions.push({ x, y});
            }
          }
        }
        MyMath.shuffle(available_corridor_positions);

        // [Player] 自機の設定 (必須：rooms[0])
        const player_position = this.center_of_room(GameState.rooms[0]);
        used_positions.add(`${player_position.x},${player_position.y}`);
        GameState.map[player_position.y][player_position.x] = GLOBALS.MAP.ELEMENT.START;
        const p_pos = MyMath.cell_to_world(player_position.x, player_position.y);
        p_pos.y = GLOBALS.MOVABLE.Y.INIT;
        GameState.player = new Player(scene);
        GameState.player.create(p_pos);

        // [Goal] 目的地の設定 (必須：rooms[1])
        const goal_position = this.center_of_room(GameState.rooms[1]);
        used_positions.add(`${goal_position.x},${goal_position.y}`);
        GameState.map[goal_position.y][goal_position.x] = GLOBALS.MAP.ELEMENT.GOAL;
        const g_pos = MyMath.cell_to_world(goal_position.x, goal_position.y);
        g_pos.y = 0.5;
        const itm_goal = new Item_Goal(scene);
        itm_goal.create(g_pos);
        GameState.items.push(itm_goal);

        // [Goal] バッテリーの設定 (選択：rooms[2])
        if (GameState.stageInfo.battery){
            const battery_position = this.center_of_room(GameState.rooms[2]);
            used_positions.add(`${battery_position.x},${battery_position.y}`);
            const b_pos = MyMath.cell_to_world(battery_position.x, battery_position.y);
            b_pos.y = GLOBALS.ITEM.Y.BASE;
            GameState.num_items++;
            const itm_battery = new Item_Battery(scene);
            itm_battery.create(b_pos, GameState.num_items);
            GameState.items.push(itm_battery);
        }

        available_for_enemy_positions = available_for_enemy_positions.filter(p => !used_positions.has(`${p.x},${p.y}`));
        MyMath.shuffle(available_for_enemy_positions);

        // [EMEMY] 敵
        if (GameState.stageInfo.enemies){
            for (const enemy of GameState.stageInfo.enemies){
                const {className, num, type} = enemy;
                this.spawn_enemies_from_array(className, num, type, available_for_enemy_positions, used_positions);
            }
        }

        available_positions = all_positions.filter(p => !used_positions.has(`${p.x},${p.y}`));
        MyMath.shuffle(available_positions);

        // [ITEM] アイテム
        if (GameState.stageInfo.items){
            for (const item of GameState.stageInfo.items){
                const {className, num} = item;
                this.spawn_items_from_array(className, num, available_positions, used_positions);
            }
        }

        // [PROP] 小道具
        // console.log("[PROP] available_positions", available_positions, available_positions.length);
        if (GameState.stageInfo.props){
            for (const prop of GameState.stageInfo.props){
                const {className, num} = prop;
                this.spawn_props_from_array(className, num, available_positions, used_positions);
            }
        }

        // ギミック
        if (GameState.stageInfo.gimmicks){
            for (const gimmick of GameState.stageInfo.gimmicks){
                const {className, num} = gimmick;
                this.spawn_gimmicks_from_array(className, num, available_corridor_positions);
            }
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

        // 小道具
        for (let i = GameState.props.length - 1; i >= 0; i--) {
            GameState.props[i].dispose();
            GameState.props.splice(i, 1);
        }
        GameState.props = [];

        // エフェクト
        for (let i = GameState.effects.length - 1; i >= 0; i--) {
            GameState.effects[i].dispose();
            GameState.effects.splice(i, 1);
        }
        GameState.effects = [];

        // ギミック
        for (let i = GameState.gimmicks.length - 1; i >= 0; i--) {
            GameState.gimmicks[i].dispose();
            GameState.gimmicks.splice(i, 1);
        }
        GameState.gimmicks = [];

    } // End of dispose
}