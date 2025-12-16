
// scenes/UI.js
import { GameState } from "../GameState.js";

export class UI {
    constructor() {
        this.ui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        this.scoreText = null;
        this.create();
    }

    create(){
        // SCORE
        const scoreText = new BABYLON.GUI.TextBlock();
        scoreText.text = "SCORE 0";
        scoreText.color = "white";
        scoreText.fontSize = "72px";
        scoreText.width = "600px"; // 適切な幅
        scoreText.height = "100px"; // 適切な幅
        scoreText.paddingTop = "10px";
        scoreText.paddingLeft = "10px";
        scoreText.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        scoreText.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.ui.addControl(scoreText);
        this.scoreText = scoreText;

        // MAP
        const mapText = new BABYLON.GUI.TextBlock();
        mapText.text = GameState.map;
        mapText.fontFamily = "monospace, 'MS Gothic', 'Osaka Monospace', 'Courier New', Consolas";
        mapText.fontSize = "24px";
        mapText.color ="rgb(128, 255, 0)";
        mapText.alpha = 0.5;
        mapText.width = "800px"; // 適切な幅
        mapText.height = "800px"; // 適切な幅
        mapText.paddingTop = "10px";
        mapText.paddingLeft = "10px";
        mapText.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        mapText.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.ui.addControl(mapText);
    }

    addControl(control){
        this.ui.addControl(control);
    }

    removeControl(control){
        this.ui.removeControl(control);
    }

    update_score(score){
        if (this.scoreText){
            this.scoreText.text = `SCORE ${score}`;
        }
    }

    dispose(){
        this.ui.dispose();
    }
}