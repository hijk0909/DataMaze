// base_scene.js
export class Scene {

    constructor(game){
        this.game = game;
        this.scene = new BABYLON.Scene(game.engine);
    }

    async initialize(){
        this.setup();
        // console.log("Base_scene:setuped");
        await this.preload();
        // console.log("Base_scene:preloaded");
        this.create();
        // console.log("Base_scene:created");
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

    }

    dispose(){
    }
}