// itm_item_box.js
import { GameState } from "../GameState.js";
import { Item } from "./base_item.js";
import { Eff_Text } from './eff_text.js';

export class Itm_ItemBox extends Item {

    constructor(scene){
        super(scene);
    }

    create(pos, id){

        const container = GameState.asset.item_box;
        const inst = container.instantiateModelsToScene( (name) => `${name}_item_box_${id}` );

        this.mesh = inst.rootNodes[0];
        this.mesh.scaling = new BABYLON.Vector3(0.3, 0.3, 0.3);
        this.mesh.scaling.z = Math.abs(this.mesh.scaling.z);
        this.mesh.position = pos.clone();
        this.mesh.position.y = 0.5;

        this.mesh.checkCollisions = false; //障害物との衝突判定

        // アニメーション
        this.anim_rotate = inst.animationGroups.find(group => group.name === `rotate_item_box_${id}`);
        if (this.anim_rotate) {
            this.anim_rotate.start(true); // ループ再生
            this.anim_rotate.speedRatio = 0.3;
        }
        super.create();
    }

    activate(){
        this.alive = false;
        GameState.add_score(100);

        let item = "item";
        let disp = `${item}`;
        const r = Math.floor(Math.random()*6);
        if (r === 0){
            item = "Stage Key";
            GameState.ui_manager.add_item(item);
            disp = `GET ${item}`;
        } else if (r === 1){
            item = "Booster";
            GameState.ui_manager.add_item(item);
            disp = `GET ${item}`;
        } else if (r === 2){
            item = "Asteroid";
            GameState.ui_manager.add_item(item);
            disp = `GET ${item}`;
        } else if (r === 3){
            item = "Stage Key";
            if (GameState.ui_manager.find_item(item)){
                GameState.ui_manager.remove_item(item);
                disp = `LOST ${item}`;
            } else {
                disp = "EMPTY";
            }
        } else if (r === 4){
            item = "Booster";
            if (GameState.ui_manager.find_item(item)){
                GameState.ui_manager.remove_item(item);
                disp = `LOST ${item}`;
            } else {
                disp = "EMPTY";
            }
        } else if (r === 5){
            item = "Asteroid";
            if (GameState.ui_manager.find_item(item)){
                GameState.ui_manager.remove_item(item);
               disp = `LOST ${item}`;
            } else {
                disp = "EMPTY";
            }
        }

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