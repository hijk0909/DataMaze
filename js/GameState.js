// GameState.js
import { GLOBALS } from './GameConst.js';

export const GameState = {
    game : null,
    camera : null,
    hemiLight : null,
    asset : null,
    pad_manager : null,
    pad : null,
    inputKey : null,
    inputPad : {
        left : false,
        right : false,
        up : false,
        down : false,
        button : false
    },
    inputMouse : {
        button : false,
        left :false,
        right : false,
        down : false,
        up : false,
        accel : false
    },
    debug : false,

    // ゲーム情報
    stage : 1,
    stage_state : GLOBALS.STAGE_STATE.START,
    ui_manager : null,
    stageInfo : null,
    map : [], 
    explored_map : [],
    minimap_bitmap : null,
    rooms : null,
    spawn : null,
    bag_items : null,
    score : 0,
    bgm : null,
    num_enemies : 0, // 生成された敵の総数
    num_items : 0, // 生成されたアイテムの総数
    num_props : 0, // 生成された小道具の総数
    start_time : 0, //ゲーム開始時の時刻

    // キャラクター
    player : null,
    enemies : [],
    items : [],
    props : [],
    effects : [],
    bullets : [],

    // プレイヤーの状態
    player_stats : {
        hp : 0,
        hp_max : 0,
        hp_delta : 0,
        mass : 0 ,
        accel : 0,
        speed_max : 0,
        shot_speed : 1,
        shot_power : 1
    },
        
    reset(){
        this.score = 0;
        this.stage = 1;
        this.bag = null; 
        this.spawn = null;
        this.stage_state = GLOBALS.STAGE_STATE.START;
        this.player_stats.hp = GLOBALS.PLAYER_STATS.INIT.HP_MAX;
        this.player_stats.hp_max = GLOBALS.PLAYER_STATS.INIT.HP_MAX;
        this.player_stats.hp_delta = GLOBALS.PLAYER_STATS.INIT.HP_DELTA;
        this.player_stats.mass =  GLOBALS.PLAYER_STATS.INIT.MASS;
        this.player_stats.accel =  GLOBALS.PLAYER_STATS.INIT.ACCEL;
        this.player_stats.speed_max =  GLOBALS.PLAYER_STATS.INIT.SPEED_MAX;
        this.player_stats.shot_speed = GLOBALS.PLAYER_STATS.INIT.SHOT_SPEED;
        this.player_stats.shot_power = GLOBALS.PLAYER_STATS.INIT.SHOT_POWER;
    },

    add_score(score){
        this.score += score;
    }
}