// eff_text.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from "../GameState.js";
import { MyMath } from "../utils/MathUtils.js";
import { MyDraw } from "../utils/DrawUtils.js";
import { Effect } from "./base_effect.js";

const EFF_PERIOD_TEXT =120;
const PADDING = 30;

export class Eff_Text extends Effect {

    constructor(scene){
        super(scene);
        this.counter = 0;
        this.text = null;
        this.textObject = null;
    }

    create(pos, text, color="#ffffff"){
        this.pos = pos.clone();
        this.text = text;

        super.create(null); // meshは存在しない
        this.counter = EFF_PERIOD_TEXT;

        this.textObject = new BABYLON.GUI.TextBlock();
        const tobj = this.textObject;
        tobj.text = text;
        tobj.color = color;
        tobj.fontSize = 72;
        tobj.fontFamily = "MyGameFont";

        const screen_pos = MyMath.world_to_screen(pos, this.scene);
        let x = screen_pos.x;
        let y = screen_pos.y;
        // 近過ぎるか遠過ぎる場合は中央に表示
        // console.log("eff_text:screen_pos_z", screen_pos.z);
        if (screen_pos.z < 0.3 || screen_pos.z > 1.0){
                x = GLOBALS.UI.WIDTH / 2;
                y = GLOBALS.UI.HEIGHT / 2;
        }
        MyDraw.set_text_position(tobj, x, y);
        GameState.ui_manager.ui.addControl(tobj);
    }

    update(){
        super.update();
        const t = EFF_PERIOD_TEXT - this.counter;
        this.textObject.top = getBouncingY(t, this.textObject.top_base, 80, 60);
        const dur = 20;
        if ( this.counter < dur ){
            const r = dur - this.counter;
            const scale = 1 + r /dur;
            this.textObject.scaleX = scale;
            this.textObject.scaleY = scale;
            this.textObject.alpha = this.counter/dur;
        }
        this.counter -= 1;
        if (this.counter <= 0){
            this.alive = false;
        }
    }

    dispose(){
        super.dispose();
        if ( this.textObject ){
            if (GameState.ui_manager){
                GameState.ui_manager.ui.removeControl(this.textObject);
            }
            this.textObject.dispose();
            this.textObject = null;
        }
    }
} // End of class Effect_Text

function getBouncingY(t, Y0, DY, T) {
    if (t >= T) return Y0;

    let timePassed = 0;
    let duration = T / 2;
    let height = DY;
    let cycle = 0;

    // 各バウンドのフェーズを探す
    while (t > timePassed + duration) {
        timePassed += duration;
        duration /= 2;
        height /= 2;
        cycle++;
    }

    // 現在のバウンド内での進行度（0～1）
    let localT = (t - timePassed) / duration;

    // 放物線を描く： y = -4h * (x - 0.5)^2 + h
    let offset = -4 * height * Math.pow(localT - 0.5, 2) + height;

    return Y0 - offset;
}