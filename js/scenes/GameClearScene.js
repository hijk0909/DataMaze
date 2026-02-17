// GameClearScene.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from "../GameState.js";
import { Game } from "../main.js";
import { Scene } from "./base_scene.js";
import { TitleScene } from "./TitleScene.js";
import { GameClearAsset } from "./GameClearAsset.js";
import { MyInput } from "../utils/InputUtils.js"
import { ScrollText } from "../utils/DrawUtils.js"

export class GameClearScene extends Scene {
    constructor(game) {
        super(game);
        this.my_input = null;
        this.asset = null;
        this.scroll_text = null;
    }

    setup(){
        // [Camera]
        this.camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0,2,-5), this.scene);
        // [UI]
        this.ui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        this.ui.idealWidth = GLOBALS.UI.WIDTH;
        this.ui.idealHeight = GLOBALS.UI.HEIGHT;
        this.ui.renderAtIdealSize = true;
    }

    async preload(){
        this.asset = new GameClearAsset(this.scene);
        await this.asset.preload();
    }

    create(){
        const scene = this.scene;
        scene.clearColor = new BABYLON.Color4(0,0,0,1);

        // Input
        this.my_input = new MyInput(scene, this.game);
        this.my_input.registerNextAction(() => this.goto_title());

        // Image
        this.image = new BABYLON.GUI.Image("myImage", "./assets/textures/game_clear.jpg");
        this.image.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.image.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.image.top = 100;
        this.image.onImageLoadedObservable.add(() => {
             this.image.width = this.image.domImage.width + "px";
             this.image.height = this.image.domImage.height + "px"; });
        this.ui.addControl(this.image);

        const lines = [
            "Epilogue",
            "",
            "Elio lost his family by endorsing the AI’s correct judgment.",
            "After that, he abandoned judgment itself",
            "and drifted through his days in a state of numb apathy.",
            "",
            "Then, as a global malfunction in the AI systems",
            "began to surface and drive humanity toward annihilation,",
            "he volunteered for a dangerous mission to resolve it.",
            "",
            "Through a neural interface, he committed",
            "his entire consciousness to an abstract data space,",
            "diving ever deeper in search of",
            "the true cause of the anomaly.",
            "",
            "Passing beyond the shared layer of collective unconsciousness",
            "common to both living humans and artificial intelligence,",
            "he finally arrived at the place",
            "where mathematics itself is born",
            "and uncovered a fatal inconsistency.",
            "",
            "By eliminating that bug, Elio was ultimately",
            "absorbed into that very layer.",
            "",
            "As Elio himself became part of",
            "a new mathematical framework",
            "in which humans and artificial intelligence could coexist,",
            "the world regained its stability.",
            "",
            "Elio’s consciousness never returned to his body.",
            "Whether this was the finest ending he could have achieved,",
            "or merely utter annihilation, no one can say.",
            "But this was the result of a choice he made of his own will.",
            "",
            "He decided the meaning of his own life.",
            "",
            "As a consequence, his time came to a halt there.",
            "Yet humanity’s time was permitted to flow onward,",
            "far into the future.",
            "",
            "The meaning of what he accomplished",
            "will continue to be woven by each of the survivors,",
            "as they live their lives,",
            "making choices and passing judgments of their own.",
            "",
            "...Today, what will you choose to judge?",
            "",
            "","","","","","","","","","","","","","","",""
        ];

        // ◆スクロールテキスト
        this.scroll_text = new ScrollText(this.ui, this.scene);
        this.scroll_text.play(lines, () => {this.goto_title();}, 10000);
        // this.scroll_text.play(lines);
        // Sound
        this.asset.bgm.epilogue.play(true);
    }

    goto_title(){
        // スクロールテキストの自動更新を停止（必須）
        this.scroll_text.stop();
        // タイトル画面に遷移
        Game.sceneManager.changeScene(new TitleScene(Game));
    }

    update(time, delta){
        if (this.my_input){
            this.my_input.update(time, delta);
        }
        super.update();
    }

    dispose() {
        if (this.camera){
            this.camera.dispose();
            this.camera = null;
        }
        if (this.my_input){
            this.my_input.dispose();
            this.my_input = null;
        }
        if (this.ui){
            this.ui.dispose();
            this.ui = null;
        }
        if (this.image){
            this.image.dispose();
            this.image = null;
        }
        if (this.scroll_text){
            this.scroll_text.dispose();
            this.scroll_text = null;
        }
        if (this.asset){
            this.asset.dispose();
            this.asset = null;
        }
        super.dispose();
    }
}