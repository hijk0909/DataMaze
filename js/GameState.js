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
    score : 0,
    ui : null,
    map : null,
    rooms : null,

    // キャラクター
    player : null,
    enemies : [],
    items : [],
    obstacles : [],
    effects : [],

    reset(){
        this.score = 0;        
    },

    add_score(score){
        this.score += score;
        if (this.ui){
            this.ui.update_score(this.score);
        }
    }
}