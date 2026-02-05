// item_fluxcore.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from "../GameState.js";
import { MyDraw } from "../utils/DrawUtils.js";
import { Item } from "./base_item.js";
import { Eff_Text } from './eff_text.js';

const DISP_SCALE = 0.5;
const FLUX_PERIOD = 3.0;

const FLUX_STATE_FEED = 0;
const FLUX_STATE_MASS = 1;
const FLUX_STATE_SPEED_MAX = 2;
const FLUX_STATE_SHOT_POWER = 3;
const FLUX_STATE_SHOT_SPEED = 4;
const FLUX_STATE_MAX = 4;

const CAPTION_OFFSET = -50;

const ItemColors = [
    GLOBALS.ITEM.COLOR.FEED,
    GLOBALS.ITEM.COLOR.MASS,
    GLOBALS.ITEM.COLOR.SPEED_MAX,
    GLOBALS.ITEM.COLOR.SHOT_POWER,
    GLOBALS.ITEM.COLOR.SHOT_SPEED
];

const ItemFresnelColors = [
    GLOBALS.ITEM.FRESNEL_COLOR.FEED,
    GLOBALS.ITEM.FRESNEL_COLOR.MASS,
    GLOBALS.ITEM.FRESNEL_COLOR.SPEED_MAX,
    GLOBALS.ITEM.FRESNEL_COLOR.SHOT_POWER,
    GLOBALS.ITEM.FRESNEL_COLOR.SHOT_SPEED
];

const ItemCaptions = [
    "HP",
    "MASS",
    "SPEED",
    "SHOT POWER",
    "SHOT SPEED"
];

export class Item_Fluxcore extends Item {

    constructor(scene){
        super(scene);
        this.flux_counter = 0;
        this.flux_state = 0;
    }

    create(pos, id){

        const container = GameState.asset.mesh.fluxcore;
        const inst = container.instantiateModelsToScene( (name) => `${name}_fluxcore_${id}` );

        this.mesh = inst.rootNodes[0];
        this.mesh.scaling = new BABYLON.Vector3(DISP_SCALE, DISP_SCALE, DISP_SCALE);
        this.mesh.position = pos.clone();
        this.mesh.position.y = GLOBALS.ITEM.Y.BASE;

        this.mesh.checkCollisions = false; //障害物との衝突判定

        // アニメーション
        this.anim_rotate = inst.animationGroups.find(group => group.name === `rotate_fluxcore_${id}`);
        if (this.anim_rotate) {
            this.anim_rotate.start(true); // ループ再生
            this.anim_rotate.speedRatio = 1.5;
        }

        // インスタンス化したノード群から、"core" を探す
        this.core_ball = inst.rootNodes[0].getChildMeshes().find(mesh => mesh.name.includes("core_ball"));
        this.set_core_ball_color();
        super.create();

        // アイテム名称の表示
        this.caption = new BABYLON.GUI.TextBlock();
        this.caption.resizeToFit = true;
        this.caption.color = "white";
        this.caption.fontSize = 36;
        this.caption.fontFamily = "MyGameFont";
        this.caption.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.caption.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

        MyDraw.link_text(this.caption, this.mesh, this.scene, CAPTION_OFFSET);
        this.set_caption_text();

        GameState.ui_manager.ui.addControl(this.caption);
    }

    set_core_ball_color(){
        if (this.core_ball && this.core_ball.material) {
            const mat = this.core_ball.material;
            if (mat instanceof BABYLON.PBRMaterial) {
                // console.log("set_core_ball_color:", this.flux_state, ItemColors[this.flux_state]);
                this.set_color(mat, ItemColors[this.flux_state]); 
            }
        }
    }

    set_caption_text(){
        this.caption.text = ItemCaptions[this.flux_state];
        this.caption._markAsDirty();
        this.caption.alpha = 0.0;
    }

    activate(){
        this.alive = false;
        GameState.add_score(100);

        let disp = "flux";

        if (this.flux_state === FLUX_STATE_FEED){
            const hp = 30;
            GameState.player.add_hp(hp);
            disp = `HP +${hp}`;
        } else if (this.flux_state === FLUX_STATE_MASS){
            const mass = 1.0;
            GameState.player.add_mass(mass);
            disp = `MASS +${mass}`;
        } else if (this.flux_state === FLUX_STATE_SPEED_MAX){
            const spd = 1;
            GameState.player.add_speed_max(spd);
            disp = `SPEED +${spd}`;
        } else if (this.flux_state === FLUX_STATE_SHOT_POWER){
            const pow = 1;
            GameState.player.add_shot_power(pow);
            disp = `Shot Power +${pow}`;
        } else if (this.flux_state === FLUX_STATE_SHOT_SPEED){
            const sspd = 1;
            GameState.player.add_shot_speed(sspd);
            disp = `Shot Speed +${sspd}`;
        }

        const eff = new Eff_Text(this.scene);
        eff.create(this.mesh.position, disp);
        GameState.effects.push(eff);

        GameState.asset.se.powerup.play_3D(this, this.scene);
    }

    update(time, delta){
        const MIN_DIST = 2.5;
        const MAX_DIST = 4.5;
        const MIN_ALPHA = 0.0;
        const MAX_ALPHA = 1.0;
        const toPlayerDistance = GameState.player.mesh.position
            .subtract(this.mesh.position)
            .length();
        let alpha = 0;
        if (toPlayerDistance < MIN_DIST){
            alpha = MAX_ALPHA;
        } else if (toPlayerDistance > MAX_DIST){
            alpha = MIN_ALPHA;
        } else{
            alpha = (MAX_DIST - toPlayerDistance)/(MAX_DIST - MIN_DIST)*(MAX_ALPHA - MIN_ALPHA);
        }

        MyDraw.link_text(this.caption, this.mesh, this.scene, CAPTION_OFFSET, alpha);

        this.flux_counter -= delta / 1000;
        if (this.flux_counter < 0){
            this.flux_counter = FLUX_PERIOD;
            this.flux_state = this.flux_state === FLUX_STATE_MAX ? 0 : this.flux_state + 1;
            this.set_core_ball_color();
            this.set_caption_text();
        } 

        super.update(time, delta);
    }

    dispose(){
        this.caption.dispose();
        super.dispose();
    }
}