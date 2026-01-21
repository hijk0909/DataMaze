// main.js
import { GameState } from "./GameState.js";
import { SceneManager } from "./SceneManager.js";
import { PadManager } from "./utils/InputUtils.js";
import { TitleScene } from "./scenes/TitleScene.js";

const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);
// engine.setHardwareScalingLevel(1);

// Game Object
export const Game = {
    engine,
    canvas,
    sceneManager: null
};

function set_shader(){
    BABYLON.Effect.ShadersStore["goalLightVertexShader"] = `
    precision highp float;

    attribute vec3 position;
    attribute vec2 uv;

    uniform mat4 worldViewProjection;

    varying vec2 vUV;
    varying vec3 vPos;

    void main() {
        vUV = uv;
        vPos = position;
        gl_Position = worldViewProjection * vec4(position, 1.0);
    }
    `;

    BABYLON.Effect.ShadersStore["goalLightFragmentShader"] = `
    precision highp float;

    varying vec2 vUV;
    varying vec3 vPos;

    uniform float time;
    uniform float alpha;
    uniform sampler2D diffuseSampler;

    void main() {
        float flow = sin((vUV.y - time * 0.5) * 4.0) * 0.5 + 0.5;
        float heightFade = clamp((vPos.y + 2.0) / 4.0, 0.0, 1.0);
        float heightAlpha = (1.0 - heightFade);

        vec2 uv = vUV;
        uv.y = fract(vUV.y - time * 0.3);

        vec4 tex = texture2D(diffuseSampler, uv);
        gl_FragColor = vec4(tex.rgb, tex.a * heightAlpha * flow * alpha);
    }
    `;

    BABYLON.Effect.ShadersStore["rainVertexShader"] = `
    precision highp float;

    attribute vec3 position;
    attribute vec2 uv;

    uniform mat4 worldViewProjection;

    varying vec2 vUV;
    varying vec3 vPos;

    void main() {
        vUV = uv;
        vPos = position;
        gl_Position = worldViewProjection * vec4(position, 1.0);
    }
    `;

    BABYLON.Effect.ShadersStore["rainFragmentShader"] = `
    precision highp float;

    varying vec2 vUV;
    varying vec3 vPos;

    uniform float time;
    uniform float alpha;
    uniform sampler2D diffuseSampler;

    float rand(vec2 co) {
        return fract(sin(dot(co, vec2(12.9898,78.233))) * 43758.5453);
    }

    void main() {
        float heightFade = clamp((vPos.y + 3.0) / 2.0, 0.0, 1.0);

        vec2 gridSize = vec2(40.0, 60.0);

        // 列
        float column = floor(vUV.x * gridSize.x);
        float columnUV = fract(vUV.x * gridSize.x);

        // 列ごとの速度
        float speed = 1.0 + rand(vec2(column, 0.0)) * 2.5;

        // 縦スクロール（帯）
        float scrollY = vUV.y * gridSize.y + time * speed;
        float row = floor(scrollY);
        float rowUV = fract(scrollY);

        // 文字選択（列×行）
        float glyphIndex = floor(rand(vec2(column, row)) * 64.0);

        // フォントアトラス
        float gx = mod(glyphIndex, 8.0);
        float gy = floor(glyphIndex / 8.0);

        vec2 atlasUV;
        atlasUV.x = (gx + columnUV) / 8.0;
        atlasUV.y = (gy + rowUV) / 8.0;

        vec4 tex = texture2D(diffuseSampler, atlasUV);
        gl_FragColor = vec4(tex.rgb, tex.a * heightFade * alpha);
    }
    `;

    BABYLON.Effect.ShadersStore["wipeFragmentShader"] = `
        precision highp float;

        varying vec2 vUV;
        uniform sampler2D textureSampler; // 元の3D画面
        uniform vec2 center;
        uniform float radius;
        uniform float alpha;
        uniform float aspectRatio;

        void main(void) {
            // アスペクト比を補正
            vec2 uv = vUV;
            uv.y /= aspectRatio;
            vec2 correctedCenter = center;
            correctedCenter.y /= aspectRatio;

            float dist = distance(uv, correctedCenter);
            float mask = step(radius, dist);

            vec4 baseColor = texture2D(textureSampler, vUV);
            vec4 wipeColor = vec4(0.0, 0.0, 0.0, 1.0);

            // maskが1なら黒(wipeColor)、0なら元の色(baseColor)を混ぜる
            // alphaを使ってワイプ全体の透明度を制御（wipe_out の チラツキ対策）
            gl_FragColor = mix(baseColor, wipeColor, mask * alpha);
        }
    `;
}

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

// ゲームパッドマネージャの生成
GameState.pad_manager =  new PadManager();

// シェーダーの生成
set_shader();

// ゲーム開始
startGame();