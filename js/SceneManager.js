export class SceneManager {
    constructor(engine, canvas) {
        this.engine = engine;
        this.canvas = canvas;
        this.currentScene = null;
    }

    changeScene(newScene) {
        if (this.currentScene) {
            this.currentScene.dispose();
        }
        this.currentScene = newScene;
        this.canvas.focus();
    }

    update(time, delta) {
        if (this.currentScene && this.currentScene.scene) {
            this.currentScene.update(time, delta);
        }
    }
}
