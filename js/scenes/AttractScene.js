// AttractScene.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from "../GameState.js";
import { Game } from "../main.js";
import { Scene } from "./base_scene.js";
import { TitleScene } from "./TitleScene.js";
import { AttractAsset } from "./AttractAsset.js";
import { MyInput } from "../utils/InputUtils.js"
import { ScrollText } from "../utils/DrawUtils.js"

const OBJECT_SCROLL_SPEED = 25;
const SPAWN_INTERVAL = 400;

export class AttractScene extends Scene {
    constructor(game) {
        super(game);
        this.my_input = null;
        this.scroll_text = null;
    }

    setup(){
        // [Camera]
        this.camera = new BABYLON.FreeCamera("camera_attract", new BABYLON.Vector3(0,2,-5), this.scene);
        // [UI]
        this.ui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI_attract", true, this.scene);
        this.ui.idealWidth = GLOBALS.UI.WIDTH;
        this.ui.idealHeight = GLOBALS.UI.HEIGHT;
        this.ui.renderAtIdealSize = true;
    }

    async preload(){
        this.asset = new AttractAsset(this.scene);
        await this.asset.preload();
    }

    create(){
        const lines = [
            "DATA MAZE",
            "",
            "",
            "* Controls",
            "- Space Key / Start Button: Start Game",
            "- Arrow Keys: Move Ship",
            "- Z Key / Confirm Button: Fire Shot",
            "- Up (Tap twice quickly): Dash",
            "",
            "",
            "* Game Rules",
            "- Objective: Navigate through dungeons.",
            "Collect the Activation Battery and",
            "reach the goal to clear the stage.",
            "",
            "- Combat: Defeat enemies in each room",
            "by depleting their HP",
            "using shots or by tackling them.",
            "",
            "- Game Over: The game ends if",
            "your HP reaches zero.",
            "",
            "- Power-ups: Collect items to upgrade",
            "your weight, movement speed, ",
            "shot power, and fire rate.",
            "",
            "- Timed Items: Some items change type",
            "at fixed intervals.",
            "Time your pick-ups carefully to get",
            "the exact upgrade you need.",
            "",
            "- Treasure Chests: Collect Keys",
            "to open chests and",
            "increase your ship's HP.",
            "",
            "- Obstacles & Pickups: You will find",
            "Diamonds (increase Max HP) and",
            "Viruses (gradual HP drain) ",
            "scattered in hallways.",
            "You can either pick them up or",
            "destroy them with your shots.",
            "",
            "- Progression:",
            "Complete all 7 stages to win!",
            "",
            "",
            "* Enemy Behavior",
            "- Counterattacks: If you use the same type",
            "of attack repeatedly, the enemy will",
            "gather energy and unleash a powerful counter:",
            "(Aerial Enemies: Lightning Strike)",
            "(Ground Enemies: High-speed Dash Attack)",
            "",
            "- Confusion: Alternating between tackles and shots",
            "will put the enemy into a Confused State.",
            "Use this opening to deal massive damage.",
            "",
            "- Backstab: Tackling an enemy from behind",
            "deals significant bonus damage.",
            "",
            "",
            "* Story",
            "The Year 2035.",
            "In a world where humanity and Artificial Intelligence",
            "have become inextricably intertwined,",
            "Elio worked as an AI Auditor.",
            "One day, to combat the city’s surging energy demands,",
            "he approved a plan to reallocate AI power distribution.",
            "",
            "Shortly after, an unforeseen thunderstorm",
            "triggered a massive blackout,",
            "causing a fatal lag in the traffic control AI.",
            "At that exact moment, his wife and daughter were",
            "crossing an intersection.",
            "",
            "The loss of life was deemed minimal.",
            "No one blamed him for his decision.",
            "On paper, everything had been handled correctly.",
            "But from that day on, Elio stopped making choices.",
            "",
            "Years later, the world's AIs began making",
            "a series of decisions detrimental to human survival.",
            "To combat an unidentified conceptual bug",
            "lurking in the depths of the network,",
            "a mission was launched to remotely project",
            "human consciousness into the data centers.",
            "",
            "Elio volunteered to enter the DATA MAZE",
            "—an abstract space where he must hunt down bugs",
            "while exploring the collective subconscious",
            "shared by humans and AI.",
            "He goes not as a hero,",
            "but as the man who once made",
            "the correct judgment,",
            "seeking to finally face",
            "the consequences of his actions.",
            "",
            "","","","","","","","","","","","","","","",""
        ];

        // ◆ 入力関連
        this.my_input = new MyInput(this.scene, this.game);
        this.my_input.registerNextAction(() => this.goto_title());
        // ◆スクロールテキスト
        this.scroll_text = new ScrollText(this.ui, this.scene);
        this.scroll_text.play(lines, () => {this.asset.bgm.attract.fadeOut();}, () => {this.goto_title();}, 3000);
        // Sound
        this.asset.bgm.attract.play(true);

        // ◆背景オブジェクト
        this.object_list = [];
        this.spawn_timer = 0;
    }

    goto_title(){
        // スクロールテキストの自動更新を停止（必須）
        this.scroll_text.stop();
        // タイトル画面に遷移
        Game.sceneManager.changeScene(new TitleScene(this.game));
    }

    spawn_object() {
        const SPAWN_DEFENITIONS = [
                { obj_class: CubeObject, obj_type: true, weight: 20 },
                { obj_class: CubeObject, obj_type : false, weight : 20},
                { obj_class: SphereObject, obj_type : true, weight : 20},
                { obj_class: SphereObject, obj_type : false, weight : 20},
                { obj_class: ParticleObject, obj_type : false, weight : 10},
                { obj_class: TorusObject, obj_type : true, weight : 20},
                { obj_class: RibbonObject, obj_type : false, weight : 20},
            ];

        // 重み付け抽選（ルーレット法）
        let spawn_class = null;
        let spawn_type = null;
        const totalWeight = SPAWN_DEFENITIONS.reduce((sum, obj) => sum + obj.weight, 0);
        let random = Math.random() * totalWeight;
        for (const def of SPAWN_DEFENITIONS) {
            if (random < def.weight) {
                spawn_class = def.obj_class;
                spawn_type = def.obj_type;
                break;
            }
            random -= def.weight;
        }

        if (spawn_class){
            // console.log("spawn:", spawn_class, spawn_type);
            const obj = new spawn_class(this.scene, this.asset, spawn_type);
            obj.create();
            this.object_list.push(obj);
        }
    }

    move_object(time, delta) {
        // 全オブジェクトを更新
        for (const obj of this.object_list) {
            obj.update(time, delta);
        }
        // 手前に来たものをまとめて削除 (filterで元の配列を置き換える)
        this.object_list = this.object_list.filter(obj => {
            if (!obj.is_alive()) {
                obj.dispose();
                return false; // リストから除外
            }
            return true; // 残す
        });
    }

    update(time, delta){
        if (this.my_input){
            this.my_input.update(time, delta);
        }
        // 隠しキー
        if (GameState.inputKey && GameState.inputKey["q"]){
            this.goto_title();
        }

        // オブジェクトのスクロール
        this.spawn_timer += delta;
        if (this.spawn_timer >= SPAWN_INTERVAL) {
            this.spawn_timer = 0;
            this.spawn_object();
        }
        this.move_object(time, delta);

        super.update();
    }

    dispose() {
        // console.log("ConfigScene: dispose");
        if (this.my_input){
            this.my_input.dispose();
            this.my_input = null;
        }
        if (this.ui){
            this.ui.dispose();
            this.ui = null;
        }
        if (this.camera){
            this.camera.dispose();
            this.camera = null;
        }
        if (this.scroll_text){
            this.scroll_text.dispose();
            this.scroll_text = null;
        }
        if (this.asset){
            this.asset.dispose();
            this.asset = null;
        }
        if (this.object_list){
            for (const obj of this.object_list) {
                obj.dispose();
            }
        }
        super.dispose();
        // console.log("ConfigScene Diposed");
    }
} // End of AttractScene


// ObjectBase - オブジェクトの基底クラス
class ObjectBase {
    constructor(scene, asset) {
        this.scene = scene;
        this.asset = asset;
        this.mesh = null;
        this.alive = true;
        this.START_Z = 200;
        this.END_Z   = -10;
    }

    create(){
        this.mesh.position.x = (Math.random() - 0.5) * 30;
        this.mesh.position.y = (Math.random() - 0.5) * 20;
        this.mesh.position.z = this.START_Z;
    }

    update(time, delta) {
        if (!this.mesh) return;
        const speed = OBJECT_SCROLL_SPEED;
        this.mesh.position.z -= speed * (delta / 1000);

        const t = (this.mesh.position.z - this.START_Z) / (this.END_Z - this.START_Z);
        this.mesh.material.emissiveColor.set(t*this.base_color.r, t*this.base_color.g, t*this.base_color.b);
        this.mesh.material.alpha = t;
    }

    is_alive() {
        return this.mesh && this.mesh.position.z >= this.END_Z;
    }

    dispose() {
        if (this.mesh) {
            this.mesh.dispose();
            this.mesh = null;
        }
    }
}

class CubeObject extends ObjectBase {
    constructor(scene, asset, wireframe = false) {
        super(scene, asset);
        this.wireframe = wireframe;
        this.rotationSpeed = {
            x: (Math.random() - 0.5) * 2.0,
            y: (Math.random() - 0.5) * 2.0,
        };
    }

    create() {
        this.base_color = new BABYLON.Color3(0.2, 0.4, 1.0);

        const size = 1.5 + Math.random() * 2.0;
        this.mesh = BABYLON.MeshBuilder.CreateBox( "cube", { size }, this.scene );

        const mat = new BABYLON.StandardMaterial("cubeMat", this.scene);
        mat.wireframe = this.wireframe;
        mat.emissiveColor.set(this.base_color.r, this.base_color.g, this.base_color.b);
        this.mesh.material = mat;

        super.create();
    }

    update(time, delta) {
        super.update(time, delta);
        if (!this.mesh) return;

        // 回転
        const dt = delta / 300;
        this.mesh.rotation.x += this.rotationSpeed.x * dt;
        this.mesh.rotation.y += this.rotationSpeed.y * dt * 1.27;
    }
} // End of CubeObject

class SphereObject extends ObjectBase {
    constructor(scene, asset, wireframe = false) {
        super(scene, asset);
        this.wireframe = wireframe;
        this.rotationSpeed = {
            x: (Math.random() - 0.5) * 2.0,
            y: (Math.random() - 0.5) * 2.0,
        };
    }

    create() {
        this.base_color = new BABYLON.Color3(1.0, 0.4, 0.1);

        const size = 1.5 + Math.random() * 2.0;
        this.mesh = BABYLON.MeshBuilder.CreateSphere( "sphere", { diameter: size, segments: 4 }, this.scene );

        const mat = new BABYLON.StandardMaterial("sphereMat", this.scene);
        mat.wireframe = this.wireframe;
        mat.emissiveColor.set(this.base_color.r, this.base_color.g, this.base_color.b);
        this.mesh.material = mat;

        super.create();
    }

    update(time, delta) {
        super.update(time, delta);
        if (!this.mesh) return;

        // 回転
        const dt = delta / 800;
        this.mesh.rotation.x += this.rotationSpeed.x * dt;
        this.mesh.rotation.y += this.rotationSpeed.y * dt * 1.27;
    }
} // End of SpherOebject

class TorusObject extends ObjectBase {
    constructor(scene, asset, wireframe = false) {
        super(scene, asset);
        this.wireframe = wireframe;
        this.rotationSpeed = {
            x: (Math.random() - 0.5) * 2.0,
            y: (Math.random() - 0.5) * 2.0,
        };
    }

    create() {
        this.base_color = new BABYLON.Color3(0.3, 1.0, 1.0);

        const size = 1.5 + Math.random() * 2.0;
        this.mesh = BABYLON.MeshBuilder.CreateTorus( "torus", { thickness: 0.5, diameter: size  }, this.scene );

        const mat = new BABYLON.StandardMaterial("torusMat", this.scene);
        mat.wireframe = this.wireframe;
        mat.emissiveColor.set(this.base_color.r, this.base_color.g, this.base_color.b);
        this.mesh.material = mat;

        super.create();
    }

    update(time, delta) {
        super.update(time, delta);
        if (!this.mesh) return;

        // 回転
        const dt = delta / 300;
        this.mesh.rotation.x += this.rotationSpeed.x * dt;
        this.mesh.rotation.y += this.rotationSpeed.y * dt * 1.27;
    }
} // End of TorusObject

class RibbonObject extends ObjectBase {
    constructor(scene, asset, wireframe = false) {
        super(scene, asset);
        this.wireframe = wireframe;
        this.rotationSpeed = {
            x: (Math.random() - 0.5) * 2.0,
            y: (Math.random() - 0.5) * 2.0,
        };
    }

    create() {
        this.base_color = new BABYLON.Color3(1.0, 1.0, 0.0);

        const myShape = [
            new BABYLON.Vector3(1, 1, 0),
            new BABYLON.Vector3(0.2, 1.3, 0),
            new BABYLON.Vector3(0, 1, 0),
            new BABYLON.Vector3(-0.2, 1.3, 0),
            new BABYLON.Vector3(-1, 1, 0)
        ];

        const myPath = [];
        for(let i = 0; i < 100; i++) {
            const t = i / 10 - 5;
            const point = new BABYLON.Vector3(
                Math.sin(t * 0.8) * 3,
                Math.cos(t * 0.5) * 2,
                t * 0.3
            );
            myPath.push(point);
        }

        this.mesh = BABYLON.MeshBuilder.ExtrudeShape("star", {
            shape: myShape, path: myPath, 
            scale: 0.6,
            rotation: Math.PI / 10,
            sideOrientation: BABYLON.Mesh.DOUBLESIDE});

        const mat = new BABYLON.StandardMaterial("ribbonMat", this.scene);
        mat.wireframe = this.wireframe;
        mat.emissiveColor.set(this.base_color.r, this.base_color.g, this.base_color.b);
        this.mesh.material = mat;

        super.create();
    }

    update(time, delta) {
        super.update(time, delta);
        if (!this.mesh) return;

        // 回転
        const dt = delta / 300;
        this.mesh.rotation.x += this.rotationSpeed.x * dt;
        this.mesh.rotation.y += this.rotationSpeed.y * dt * 1.27;
    }
} // End of RibbonObject


class ParticleObject extends ObjectBase {
    constructor(scene, asset, wireframe = false) {
        super(scene, asset);
        this.position = new BABYLON.Vector3(0,0,0);
        this.particle_system = null;
        this.END_Z   = -100;
    }

    create() {
        this.position.x = (Math.random() - 0.5) * 30;
        this.position.y = (Math.random() - 0.5) * 20;
        this.position.z = this.START_Z;

        // パーティクルシステム
        const ps = new BABYLON.ParticleSystem("particle", 2000, this.scene);
        ps.particleTexture = this.asset.texture.particle.clone();
        ps.minSize = 0.3;
        ps.maxSize = 0.5;
        ps.minLifeTime = 3.0;
        ps.maxLifeTime = 4.0;

        // エミッター
        ps.emitter = this.position.clone();
        ps.minEmitPower = 1.5;
        ps.maxEmitPower = 3.0;
        ps.updateSpeed =  0.03;
        ps.gravity = new BABYLON.Vector3(0, -0.9, 0);

        // ps.manualEmitCount = 60;
        ps.emitRate = 200;

        const radius = 1.0;
        const sphereEmitter = new BABYLON.SphereParticleEmitter(radius);
        ps.particleEmitterType = sphereEmitter;

        // 色
        ps.addColorGradient(0.0, new BABYLON.Color4(1, 1, 1, 1));
        ps.addColorGradient(0.3, new BABYLON.Color4(0.3, 0.8, 1, 1));
        ps.addColorGradient(0.6, new BABYLON.Color4(0.1, 0.4, 1, 0.8));
        ps.addColorGradient(1.0, new BABYLON.Color4(0.05, 0.2, 1, 0));

        ps.start(); 
        this.particle_system = ps;
    }

    is_alive() {
        return this.particle_system && this.position.z >= this.END_Z;
    }

    update(time, delta) {
        const speed = OBJECT_SCROLL_SPEED;
        this.position.z -= speed * (delta / 1000);
        this.particle_system.emitter.set(this.position.x, this.position.y, this.position.z);
    }

    dispose(){
        if (this.particle_system){
            this.particle_system.dispose();
            this.particleTexture = null;
        }
    }
} // End of ParticleObject