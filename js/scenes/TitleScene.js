import { Game } from "../main.js";
import { Scene } from "./base_scene.js";
import { GameScene } from "./GameScene.js";
import { MyAudio } from "../utils/AudioUtil.js"

export class TitleScene extends Scene {
    constructor(game) {
        super(game);
        this.engine = game.engine;
    }

    create() {
        const scene = this.scene;

        // カメラ
        new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0,2,-5), scene);
        scene.clearColor = new BABYLON.Color4(0,0,0,1);

        // UI
        const plane = BABYLON.MeshBuilder.CreatePlane("textPlane", {size:2}, scene);
        plane.position = new BABYLON.Vector3(0,1,3);
        const gui = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(plane);

        const text = new BABYLON.GUI.TextBlock();
        text.text = "PUSH SPACE KEY";
        text.color = "white";
        text.fontSize = 80;
        gui.addControl(text);

        // AudioEngine の強制初期化
        this.audio = new MyAudio();

        // キーイベント待ち
        this.keyHandler = (e) => {
            if(e.code==="Space") {
                MyAudio.initialize();
                // GameSceneに遷移
                Game.sceneManager.changeScene(new GameScene(Game));
            }
        };
        window.addEventListener("keydown", this.keyHandler);
    }


    dispose() {
        window.removeEventListener("keydown", this.keyHandler);
        this.scene.dispose();
    }
}