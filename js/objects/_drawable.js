// drawable.js
export class Drawable {

    constructor(scene){
        this.scene = scene;
        this.mesh = null;
        this.alive = true;
        this.radius = 0.5; //衝突判定用の半径
    }

    create(){

    }

    update(){

    }

    isAlive(){
        return this.alive;
    }

    dispose(){
        if (this.mesh){
            this.mesh.dispose();
        }
    }
}