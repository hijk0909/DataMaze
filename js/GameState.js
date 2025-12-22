// GameState.js
import { GLOBALS } from './GameConst.js';

export const GameState = {
    game : null,
    camera : null,
    asset : null,
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
    score : 0,
    ui_manager : null,
    map : [], 
    explored_map : [],
    minimap_ascii : null,
    minimap_bitmap : null,
    rooms : null,

    // キャラクター
    player : null,
    enemies : [],
    items : [],
    obstacles : [],
    effects : [],

    // プレイヤーの状態
    player_stats : {
        hp : 0,
        hp_max : 0,
        mass : 0 ,
        accel : 0,
        speed_max : 0
    },
        
    reset(){
        this.score = 0;
        this.stage = 1;
        this.stage_state = GLOBALS.STAGE_STATE.START;
        this.player_stats.hp = GLOBALS.PLAYER_INIT_STATUS.HP_MAX;
        this.player_stats.hp_max = GLOBALS.PLAYER_INIT_STATUS.HP_MAX;
        this.player_stats.mass =  GLOBALS.PLAYER_INIT_STATUS.MASS;
        this.player_stats.accel =  GLOBALS.PLAYER_INIT_STATUS.ACCEL;
        this.player_stats.speed_max =  GLOBALS.PLAYER_INIT_STATUS.SPEED_MAX;
    },

    add_score(score){
        this.score += score;
    }
}