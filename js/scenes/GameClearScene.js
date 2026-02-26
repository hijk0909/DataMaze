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
        this.image_alpha_count = 0;
        this.information_rain = null;
    }

    setup(){
        // [Camera]
        this.camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 1.5, 6), this.scene);
        this.camera.setTarget(BABYLON.Vector3.Zero());
        this.camera.fov = 0.7; // やや狭めて奥行き強調
        // [UI]
        this.ui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        this.ui.idealWidth = GLOBALS.UI.WIDTH;
        this.ui.idealHeight = GLOBALS.UI.HEIGHT;
        this.ui.renderAtIdealSize = true;

        // [Bloom]
        const imgproc= this.scene.imageProcessingConfiguration;
        imgproc.toneMappingEnabled = true;
        imgproc.exposure = 1.1;
        imgproc.contrast = 1.0;
        const pipeline = new BABYLON.DefaultRenderingPipeline("default", true, this.scene, [this.camera]);
        pipeline.bloomEnabled = true;
        pipeline.bloomThreshold = 0.01; // どの明るさから発光させるか
        pipeline.bloomIntensity = 3.0; // 発光の強さ
        pipeline.bloomKernel = 64;    // ブラーの広がり具合
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

        const elapsed_sec = Math.floor(GameState.elapsed_time / 1000);
        this.elapsed_time_text = `${Math.floor(elapsed_sec / 60).toString().padStart(2,'0')}:${(elapsed_sec % 60).toString().padStart(2,'0')}`

        const formatPercentage = (a, b) => b ? `${((a / b) * 100).toFixed(1)}%` : '0.0%';

        const result_enemy_defeated = GameState.result.enemy_total - GameState.result.enemy_missed;
        const result_enemy_ratio = formatPercentage(result_enemy_defeated, GameState.result.enemy_total);
        const result_item_collected = GameState.result.item_total - GameState.result.item_missed;
        const result_item_ratio = formatPercentage(result_item_collected, GameState.result.item_total);
        const result_gimmick_interacted = GameState.result.gimmick_total - GameState.result.gimmick_missed;
        const result_gimmick_ratio = formatPercentage(result_gimmick_interacted, GameState.result.gimmick_total);
        const result_shot_ratio = formatPercentage(GameState.result.num_shot_hit, GameState.result.num_shot);
        const result_chakra_ratio = formatPercentage(GameState.result.num_chakra_collected, GameState.result.num_chakra);

        const lines = [
            "RESULT",
            "",
            `Final Score: ${GameState.score}`,
            `Clear Time: ${this.elapsed_time_text}`,
            `Mass: ${GameState.result.mass.toFixed(1)}`,
            `HP: ${GameState.result.hp_max}`,
            `Enemy Defeated: ${result_enemy_defeated} / ${GameState.result.enemy_total} (${result_enemy_ratio})`,
            `Backstub: ${GameState.result.num_backstub}`,
            `Shot: ${GameState.result.num_shot_hit} / ${GameState.result.num_shot} (${result_shot_ratio})`,
            `Item Collected: ${result_item_collected} / ${GameState.result.item_total} (${result_item_ratio})`,
            `Gimmick Interacted: ${result_gimmick_interacted} / ${GameState.result.gimmick_total} (${result_gimmick_ratio})`,
            `Chakra: ${GameState.result.num_chakra_collected} / ${GameState.result.num_chakra} (${result_chakra_ratio})`,
            "",
            "",
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
        this.scroll_text.play(lines, () => {this.asset.bgm.epilogue.fadeOut();}, () => {this.goto_title();}, 3000);
        // this.scroll_text.play(lines);

        // ◆情報雨
        this.information_rain = new InformationRain(this.scene);
        this.information_rain.create();
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

        // 画像透明度の周期的変化
        const speed = 0.5; // 揺れの速さ（Hz）
        this.image_alpha_count += delta;
        this.image.alpha = 0.3 - 0.3 * Math.cos(this.image_alpha_count / 1000 * speed);

        this.information_rain.update(time, delta);

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

class InformationRain {
    constructor(scene) {
        this.scene = scene;
        this.matrices = null;
    }

    create() {
        const scene = this.scene;

        // 基本パラメータ
        this.count = 5000;           // 本数
        this.areaX = 20;
        this.areaZ = 20;
        this.yTop = 8;
        this.yBottom = -12;

        // 極細Box（１本だけ作成）
        const mesh = BABYLON.MeshBuilder.CreateBox(
            "infoLine",
            { width: 0.01, depth: 0.01, height: 1 },
            scene
        );

        mesh.visible = true;
        // mesh.setEnabled(false);

        // マテリアル
        const mat = new BABYLON.PBRMaterial("infoLineMat", scene);
        mat.emissiveColor = new BABYLON.Color3(0.2, 0.5, 1.0); // 水色
        mat.albedoColor = BABYLON.Color3.Black();
        mat.metallic = 0.0;
        mat.roughness = 1.0;

        mesh.material = mat;

        // thin instance バッファ
        this.matrices = new Float32Array(this.count * 16);

        // 各線のパラメータを保持
        this.lines = [];

        for (let i = 0; i < this.count; i++) {
            const x = (Math.random() - 0.5) * this.areaX;
            const y = Math.random() * (this.yTop - this.yBottom) + this.yBottom;
            const z = - Math.random() * this.areaZ;

            const length = 0.2 + Math.random() * 0.6;
            const speed = 0.3 + Math.random() * 0.7;

            this.lines.push({ x, y, z, speed, length });

            const m = BABYLON.Matrix.Compose(
                new BABYLON.Vector3(1, length, 1),
                BABYLON.Quaternion.Identity(),
                new BABYLON.Vector3(x, y, z)
            );

            m.copyToArray(this.matrices, i * 16);
        }

        mesh.thinInstanceSetBuffer("matrix", this.matrices, 16, false);
        this.mesh = mesh;

        // Glow
        this.glow = new BABYLON.GlowLayer("glow", scene);
        this.glow.intensity = 0.8;
    }

    update(time, delta) {
        if (!this.mesh) return;

        const dt = delta / 1000;

        for (let i = 0; i < this.count; i++) {
            const base = i * 16;
            const line = this.lines[i];

            line.y -= line.speed * dt;
            if (line.y < this.yBottom) {
                line.y = this.yTop;
            }

            const depthFactor = BABYLON.Scalar.Clamp(
                1.0 - line.z / this.areaZ,
                0.2,
                1.0
            );

            const m = BABYLON.Matrix.Compose(
                new BABYLON.Vector3(1, line.length * depthFactor, 1),
                BABYLON.Quaternion.Identity(),
                new BABYLON.Vector3(line.x, line.y, line.z)
            );
            m.copyToArray(this.matrices, base);
        }

        this.mesh.thinInstanceBufferUpdated("matrix");
    }

    dispose(){
        if (this.mesh){
            this.mesh.dispose();
        }
    }
}