// main.js
import { GameState } from "./GameState.js";
import { SceneManager } from "./SceneManager.js";
import { TitleScene } from "./scenes/TitleScene.js";

const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);
// engine.setHardwareScalingLevel(1); // 明示

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
    uniform sampler2D diffuseSampler;

    void main() {
        float flow = sin((vUV.y - time * 0.5) * 4.0);
        float heightFade = clamp((vPos.y + 2.0) / 4.0, 0.0, 1.0);
        float alpha = (1.0 - heightFade);

        vec2 uv = vUV;
        uv.y = fract(vUV.y - time * 0.3);

        vec4 tex = texture2D(diffuseSampler, uv);
        gl_FragColor = vec4(tex.rgb, tex.a * alpha * flow);
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

set_shader();
startGame();