// _scene.js
export class Scene {

    constructor(game){
        this.game = game;
        this.scene = new BABYLON.Scene(game.engine);
        this.initialize();
    }

    async initialize(){
        this.setup();
        await this.preload();
        this.create();
    }

    // シーン開始時、preload前に実施すべきコード（カメラ生成等）
    // (Sceneを成立させる最小条件のセットアップ)
    setup(){
    }

    // アセットの読み込み
    async preload(){
    }

    create(){
    }

    update(){
        this.scene.render();
    }

    dispose(){
    }
}