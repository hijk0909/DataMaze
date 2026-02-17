// AttractScene.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from "../GameState.js";
import { Game } from "../main.js";
import { Scene } from "./base_scene.js";
import { TitleScene } from "./TitleScene.js";
import { MyInput } from "../utils/InputUtils.js"
import { ScrollText } from "../utils/DrawUtils.js"

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
    }

    create(){
        const lines = [
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
        this.scroll_text.play(lines, () => {this.goto_title();}, 1000);
    }

    goto_title(){
        // スクロールテキストの自動更新を停止（必須）
        this.scroll_text.stop();
        // タイトル画面に遷移
        Game.sceneManager.changeScene(new TitleScene(this.game));
    }


    update(time, delta){
        if (this.my_input){
            this.my_input.update(time, delta);
        }
        // 隠しキー
        if (GameState.inputKey && GameState.inputKey["q"]){
            this.goto_title();
        }
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
        super.dispose();
        // console.log("ConfigScene Diposed");
    }
}