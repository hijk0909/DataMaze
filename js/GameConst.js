// GameConst.js

export const GLOBALS = {

    VERSION : "1.3c",
    DATE : "2025.10.5",

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
        }
    },

    IMPULSE_RATIO : 200,
    DAMAGE_RATIO : 1,
    DAMAGE_SPEED : 1.2,

    MOVABLE : {
        Y : {
            INIT : 1.0,
            MIN : 0.8,
            MAX : 1.2
        }
    }
}