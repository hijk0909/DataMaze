// item_box.js
import { GameState } from "../GameState.js";
import { Item } from "./base_item.js";
import { Eff_Text } from './eff_text.js';

const DISP_SCALE = 0.3;
const INACTIVE_PERIOD = 1.0;

export class Item_Box extends Item {

    constructor(scene){
        super(scene);

        this.inactive_counter = 0;
    }

    create(pos, id){

        // 当たり判定用のボックスを作成
        const collider = BABYLON.MeshBuilder.CreateBox(`collider_${id}`, { 
            width: 0.2,  height: 1.0, depth: 0.2 }, this.scene);
        collider.position = pos.clone();
        collider.checkCollisions = true;
        collider.isVisible = false; // DEBUG時、tureにする

        const container = GameState.asset.mesh.item_box;
        const inst = container.instantiateModelsToScene( (name) => `${name}_item_box_${id}` );
        const modelRoot = inst.rootNodes[0];
        modelRoot.parent = collider;
        modelRoot.position = BABYLON.Vector3.Zero(); // 親（箱）の中心に合わせる
        modelRoot.scaling = new BABYLON.Vector3(DISP_SCALE, DISP_SCALE, DISP_SCALE);
        modelRoot.scaling.z = Math.abs(modelRoot.scaling.z);

        this.mesh = collider; // 以降、ボックス全体を this.mesh として扱う

        // アニメーション
        this.anim_rotate = inst.animationGroups.find(group => group.name === `rotate_item_box_${id}`);
        if (this.anim_rotate) {
            this.anim_rotate.start(true); // ループ再生
        }
        super.create();
    }

    activate(){

        if (!GameState.ui_manager.find_item("KEY")){
            if (this.inactive_counter <= 0){
                this.inactive_counter = INACTIVE_PERIOD;
                const eff = new Eff_Text(this.scene);
                eff.create(this.mesh.position, "NO KEY");
                GameState.effects.push(eff);
                // console.log("collisions", this.mesh.checkCollisions = true);
            }
            return;
        }

        GameState.ui_manager.remove_item("KEY");
        this.alive = false;
        GameState.add_score(100);
        let item = "item";
        let disp = `${item}`;
        const r = Math.floor(Math.random()*3);
        if (r === 0){
            item = "HP Tank";
            GameState.ui_manager.add_item(item);
            GameState.player.add_hp_max(30);
            disp = `GET ${item}`;
        } else if (r === 1){
            item = "Auto Recover";
            GameState.ui_manager.add_item(item);
            GameState.player.add_hp_delta(0.2);
            disp = `GET ${item}`;
        } else if (r === 2){
            item = "Luck";
            GameState.ui_manager.add_item(item);
            disp = `GET ${item}`;
        } else if (r === 3){
            item = "Luck";
            if (GameState.ui_manager.find_item(item)){
                GameState.ui_manager.remove_item(item);
                disp = `LOST ${item}`;
            } else {
                disp = "EMPTY";
            }
        } else {
            disp = "ERROR";
        }

        const eff = new Eff_Text(this.scene);
        eff.create(this.mesh.position, disp);
        GameState.effects.push(eff);
        GameState.asset.se.powerup.play();
    }

    update(time, delta){
        if (this.inactive_counter > 0){
            this.inactive_counter -= delta / 1000;
        }
        super.update(time, delta);
    }

    dispose(){
        super.dispose();
    }
}