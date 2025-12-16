// main.js
import { GameState } from "./GameState.js";
import { SceneManager } from "./SceneManager.js";
import { TitleScene } from "./scenes/TitleScene.js";

const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

// Game Object
export const Game = {
    engine,
    canvas,
    sceneManager: null
};

async function startGame() {

    Game.sceneManager = new SceneManager(engine, canvas);
    Game.sceneManager.changeScene(new TitleScene(Game));
    GameState.game = Game;

    // メインループ
    engine.runRenderLoop(() => {
        Game.sceneManager.update(Date.now(), engine.getDeltaTime());
    });
}

// リサイズ対応
window.addEventListener("resize", () => engine.resize());

startGame();