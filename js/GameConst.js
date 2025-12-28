// GameConst.js

export const GLOBALS = {

    VERSION : "0.3",
    DATE : "2025.12.28",

    MASK_UI : 0x10000000,
    UI : {
        WIDTH : 1920,
        HEIGHT : 1080,
        FONT_RATIO : 1.7
    },

    STAGE_MAX : 5,

    STAGE_STATE: {
        START : 1,
        STARTING : 2,
        PLAYING : 3,
        FAIL : 4,
        FAILED : 5,
        CLEAR : 6,
        CLEARED : 7,
        ALL_CLEARED : 8,
        PAUSE : 9
    },

    MAP : {
        SEG : {
            ROWS : 3,
            COLS : 3,
            SIZE : 9
        },
        CELL : {
            SIZE : 27,
            SCALE : 2.5
        },
        ELEMENT : {
            EMPTY : 0,
            WALL : 1,
            FLOOR : 2,
            EXIT : 3,
            CORRIDOR : 4
        },
        ROOM : {
            HEIGHT : 2.0
        },
        CORRIDOR : {
            HEIGHT : 1.0
        },
        BITMAP : {
            CELL_SIZE :6
        }
    },

    IMPULSE_RATIO : 200,
    DAMAGE_RATIO : 1,
    DAMAGE_SPEED : 1.2,
    ADDITIONAL_DAMAGE_RATIO : 2,

    PLAYER_INIT_STATUS : {
        HP_MAX : 200,
        HP_DELTA : -0.5,
        MASS : 1,
        ACCEL : 0.02,
        SPEED_MAX : 0.1,
        RELOAD_TIME : 1.0,
        FIRE_POWER : 4.5
    },

    MOVABLE : {
        Y : {
            INIT : 1.0,
            MIN : 0.8,
            MAX : 1.2
        }
    }
}