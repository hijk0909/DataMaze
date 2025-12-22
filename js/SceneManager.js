export class SceneManager {
    constructor(engine, canvas) {
        this.engine = engine;
        this.canvas = canvas;
        this.currentScene = null;
        this.isChangingScene = false; 
    }

    async changeScene(newScene) {
        if (this.isChangingScene) return;  // 二重遷移防止
        // 呼び出し側は await せず（fire & forget)、その後に何も処理はしないこと
        this.isChangingScene = true;
        if (this.currentScene) {
            this.currentScene.dispose();
        }
        this.currentScene = newScene;
        await this.currentScene.initialize();
        this.currentScene.isInitialized = true;
        this.isChangingScene = false;
        this.canvas.focus();
    }

    update(time, delta) {
        if (this.currentScene && this.currentScene.scene) {
            if (this.currentScene.isInitialized){
                this.currentScene.update(time, delta);
            }
            this.currentScene.scene.render();
        }
    }
}
