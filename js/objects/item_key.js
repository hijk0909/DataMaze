// item_key.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from "../GameState.js";
import { Item } from "./base_item.js";
import { Eff_Text } from './eff_text.js';

const DISP_SCALE = 0.3;

export class Item_Key extends Item {

    constructor(scene){
        super(scene);
    }

    create(pos, id){

        const container = GameState.asset.mesh.key;
        const inst = container.instantiateModelsToScene( (name) => `${name}_key_${id}` );

        this.mesh = inst.rootNodes[0];
        this.mesh.scaling = new BABYLON.Vector3(DISP_SCALE, DISP_SCALE, DISP_SCALE);
        this.mesh.scaling.z = Math.abs(this.mesh.scaling.z);
        this.mesh.position = pos.clone();
        this.mesh.position.y = GLOBALS.ITEM.Y.BASE;

        this.mesh.checkCollisions = false; //障害物との衝突判定

        // アニメーション
        this.anim_rotate = inst.animationGroups.find(group => group.name === `rotate_key_${id}`);
        if (this.anim_rotate) {
            this.anim_rotate.start(true); // ループ再生
            this.anim_rotate.speedRatio = 0.3;
        }
        super.create();
    }

    activate(){
        this.alive = false;
        GameState.add_score(100);

        let item = "KEY";
        GameState.ui_manager.add_item(item);

        let disp = `GET ${item}`;
        const eff = new Eff_Text(this.scene);
        eff.create(this.mesh.position, disp);
        GameState.effects.push(eff);

        GameState.asset.se.powerup.play();
    }

    update(time, delta){
        super.update(time, delta);
    }

    dispose(){
        super.dispose();
    }
}