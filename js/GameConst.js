// GameConst.js

export const GLOBALS = {

    VERSION : "0.7c",
    DATE : "2026.2.5",

    MASK_UI : 0x10000000,
    UI : {
        WIDTH : 1920,
        HEIGHT : 1080,
        FONT_RATIO : 1.7
    },

    STAGE_MAX : 7,

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
            ROOM : 2,
            EXIT : 3,
            CORRIDOR : 4,
            START : 5,
            GOAL : 6
        },
        EXPLORED : {
            NOT : 0,
            NEAR : 1,
            FIX : 2
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

    DAMAGE : {
        RATE : 100,
        COOLDOWN : 0.2,
        MIN_RATIO : 0.1,
        MAX_RATIO : 0.6,
        MIN_SPEED : 0.3,
        MAX_SPEED : 5
    },

    PLAYER_STATS : {
        INIT : {
            HP_MAX : 100,
            HP_DELTA : 0.0,
            MASS : 1,
            ACCEL : 0.02,
            SPEED_MAX : 5,
            SHOT_SPEED : 1,
            SHOT_POWER : 1
        },
        LIMIT : {
            HP_MAX : 1000,
            HP_DELTA : 1.0,
            MASS : 20,
            SPEED_MAX : 10,
            SHOT_SPEED : 10,
            SHOT_POWER : 10
        }
    },

    MOVABLE : {
        Y : {
            INIT : 1.0,
            MIN : 0.8,
            MAX : 1.2
        },
        IMPULSE_VELOCITY_RATIO : 1.0,
        CONTROL_LOSS_THRESHOLD : 0.1,
        MAX_EXTERNAL_VELOCITY : 0.8
    },

    ITEM : {
        Y : {
            BASE : 0.5
        },
        COLOR : {
            FEED : new BABYLON.Color3(1, 1, 0),
            MASS : new BABYLON.Color3(0.6, 0, 0.8),
            SPEED_MAX : new BABYLON.Color3(1, 0.7, 0.9),
            SHOT_SPEED : new BABYLON.Color3(0.6, 1, 0.6),
            SHOT_POWER : new BABYLON.Color3(0, 0.5, 1)
        },
        FRESNEL_COLOR : {
            FEED : new BABYLON.Color3(1, 1, 0),
            MASS : new BABYLON.Color3(1, 0, 1),
            SPEED_MAX : new BABYLON.Color3(1, 0.7, 1),
            SHOT_SPEED : new BABYLON.Color3(0.8, 1, 0.8),
            SHOT_POWER : new BABYLON.Color3(0, 0.8, 1)
        }
    },

    GIMMICK : {
        Y : {
            BASE : 0.8
        }
    }
}