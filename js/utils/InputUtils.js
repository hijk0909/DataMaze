// InputUtils.js
import { GameState } from '../GameState.js';

export class MyInput {
    constructor(scene, game) {
        this.scene = scene;
        this.game = game;
        this.pad = null;
        this.gamepadManager = new BABYLON.GamepadManager();
        this.create();
    }

    create(){
        // キーボード入力
        this.scene.actionManager = new BABYLON.ActionManager(this.scene); 
        GameState.inputKey = {};
        this.scene.onKeyboardObservable.add((kbInfo) => {
            const key = kbInfo.event.key.toLowerCase(); // 小文字で統一
            if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN) {
                GameState.inputKey[key] = true;
            } else if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYUP) {
                GameState.inputKey[key] = false;
            }
        });

        // ゲームパッド入力
        if (this.gamepadManager.gamepads.length > 0) {
            this.pad = this.findCompatiblePad();
        }
        this.gamepadManager.onGamepadConnectedObservable.add((gamepad) => {
            if (!this.pad) {
                this.pad = this.findCompatiblePad();
            }
        });
        this.gamepadManager.onGamepadDisconnectedObservable.add((gamepad) => {
            if (this.pad === gamepad) {
                this.pad = this.findCompatiblePad();
            }
        });

        // マウス入力
        this.scene.onPointerDown = (evt, pickInfo) => {
            GameState.inputMouse.button = true;
            this.handleMouseEvent(evt);
        };

        // マウスムーブイベント
        this.scene.onPointerMove = (evt, pickInfo) => {
            if (GameState.inputMouse.button){
                this.handleMouseEvent(evt);
            }
        };

        // マウスアップイベント
        this.scene.onPointerUp = (evt, pickInfo) => {
            GameState.inputMouse.button = false;
            GameState.inputMouse.left = false;
            GameState.inputMouse.right = false;
            GameState.inputMouse.up = false;
            GameState.inputMouse.down = false;
        };

    }

    findCompatiblePad() {
        const gamepads = this.gamepadManager.gamepads;
        
        for (let i = 0; i < gamepads.length; i++) {
            const pad = gamepads[i];
            if (!pad) continue;

            // Xbox/PlayStation系のゲームパッド
            if (pad.type === BABYLON.Gamepad.XBOX || 
                pad.type === BABYLON.Gamepad.POSE_ENABLED) {
                
                // ボタンの存在確認
                const hasMainButton = this.checkButton(pad, 0); // Aボタン
                const hasDPad = 
                    this.checkButton(pad, 12) && // 上
                    this.checkButton(pad, 13) && // 下
                    this.checkButton(pad, 14) && // 左
                    this.checkButton(pad, 15);   // 右

                if (hasMainButton && hasDPad) {
                    console.log(`Selected Gamepad: ${pad.id}`);
                    return pad;
                }
            } else {
                // 汎用ゲームパッド
                const browserGamepad = pad.browserGamepad;
                if (browserGamepad && browserGamepad.buttons) {
                    const buttons = browserGamepad.buttons;
                    const hasMainButton = buttons[0] !== undefined;
                    const hasDPad = 
                        buttons[12] !== undefined &&
                        buttons[13] !== undefined &&
                        buttons[14] !== undefined &&
                        buttons[15] !== undefined;

                    if (hasMainButton && hasDPad) {
                        console.log(`Selected Gamepad: ${pad.id}`);
                        return pad;
                    }
                }
            }
        }
        console.warn("No compatible Gamepad found.");
        return null;
    }

    checkButton(pad, buttonIndex) {
        // Babylon.jsのゲームパッドオブジェクトからボタン情報を取得
        if (pad.browserGamepad && pad.browserGamepad.buttons) {
            return pad.browserGamepad.buttons[buttonIndex] !== undefined;
        }
        return false;
    }

    getPadInput(){
        if (!this.pad) return;

        const browserGamepad = this.pad.browserGamepad;
        if (browserGamepad) {
            // 十字キー
            GameState.inputPad.up = browserGamepad.buttons[12]?.pressed || false;
            GameState.inputPad.down = browserGamepad.buttons[13]?.pressed || false;
            GameState.inputPad.left = browserGamepad.buttons[14]?.pressed || false;
            GameState.inputPad.right = browserGamepad.buttons[15]?.pressed || false;
            
            // Aボタン
            GameState.inputPad.button = browserGamepad.buttons[0]?.pressed || false;

            // アナログスティックも考慮する場合
            const leftStickX = browserGamepad.axes[0] || 0;
            const leftStickY = browserGamepad.axes[1] || 0;
            const threshold = 0.5;

            if (Math.abs(leftStickX) > threshold) {
                GameState.inputPad.left = GameState.inputPad.left || leftStickX < -threshold;
                GameState.inputPad.right =GameState.inputPad.right || leftStickX > threshold;
            }
            if (Math.abs(leftStickY) > threshold) {
                GameState.inputPad.up = GameState.inputPad.up || leftStickY < -threshold;
                GameState.inputPad.down = GameState.inputPad.down || leftStickY > threshold;
            }
        }

        return;
    }


    handleMouseEvent(evt){
        const canvas = this.game.canvas;
        // canvas上のマウス座標を取得
        const canvasRect = canvas.getBoundingClientRect();
        const mouseX = evt.clientX - canvasRect.left;
        const mouseY = evt.clientY - canvasRect.top;

        // canvas中心からの相対座標に変換
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        const relativeX = mouseX - centerX;
        const relativeY = centerY - mouseY; // Y軸を反転（上が正）

        // 正規化座標（-1.0 ～ 1.0の範囲）
        const normalizedX = relativeX / centerX;
        const normalizedY = relativeY / centerY;

        // 中心から離れている場合に向きを変える
        const threshold = 0.3;
        if (Math.abs(normalizedX) > threshold) {
            GameState.inputMouse.left = normalizedX < -threshold;
            GameState.inputMouse.right = normalizedX > threshold;
        } else {
            GameState.inputMouse.left = GameState.inputMouse.right = false;
        }
        if (Math.abs(normalizedY) > threshold) {
            GameState.inputMouse.down = normalizedY < -threshold;
            GameState.inputMouse.up = normalizedY > threshold;
        } else {
            GameState.inputMouse.up = GameState.inputMouse.down = false;
        }

        // 中心から大きく離れている場合は方向転換のみで加速しない
        const accel_threshold = 0.5;
        if (Math.abs(normalizedX) > accel_threshold || Math.abs(normalizedY) > accel_threshold){
            GameState.inputMouse.accel = false;
        } else {
            GameState.inputMouse.accel = true;
        }

    }

    update() {
        this.getPadInput();
    }

    dispose(){

    }
}