// player.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from "../GameState.js";
import { Movable } from "./base_movable.js";
import { MyMath } from "../utils/MathUtils.js";
import { Eff_Dust} from "./eff_dust.js";

const HP_RECOVERY = -0.01;
const HP_BAR_WIDTH = 720;
const HP_BAR_HEIGHT = 80;
const HP_BAR_PADDING = 5;

const PITCH_MAX = 1;

export class Player extends Movable {

    constructor(scene){
        super(scene);
        this.radius = 0.6;
        this.mass = 1;
        this.accel = 0.02;
        this.decel = 0.94;
        this.max_speed = 0.1;

        this.hp_max = 100;
        this.hp = 80;

        // TBNフレーム
        this.forward = new BABYLON.Vector3(0, 0, 1);
        this.up = new BABYLON.Vector3(0, 1, 0);
        this.right = BABYLON.Vector3.Cross(this.up, this.forward).normalize();
        this.zero = new BABYLON.Vector3(0,0,0);

        // HP
        this.hpFrame = null;
        this.hpFill = null;
    }

    create_hp_bar(){

        // 外枠
        this.hpFrame = new BABYLON.GUI.Rectangle();
        this.hpFrame.width = `${HP_BAR_WIDTH}px`;
        this.hpFrame.height = `${HP_BAR_HEIGHT}px`;
        this.hpFrame.color = "blue";
        this.hpFrame.thickness = 2;
        this.hpFrame.background = "transparent";
        this.hpFrame.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.hpFrame.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.hpFrame.top = "-40px"; // padding
        GameState.ui.addControl(this.hpFrame);

        // 中身の色
        this.hpFill = new BABYLON.GUI.Rectangle();
        this.hpFill.height = `${HP_BAR_HEIGHT - HP_BAR_PADDING}px`;
        this.hpFill.color = "cyan";
        this.hpFill.background = "cyan";
        this.hpFill.thickness = 0;
        this.hpFill.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.hpFill.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.hpFrame.addControl(this.hpFill); // 外枠の子供として追加
    }

    update_hp_bar(){
        const ratio = this.hp / this.hp_max;
        const barWidth = HP_BAR_WIDTH * ratio;
        if (this.hpFill){
            this.hpFill.width = `${barWidth}px`;
        }
    }

    create(mesh, pos){
        this.mesh = mesh;

        this.mesh.position = pos;
        this.mesh.checkCollisions = true; //障害物との衝突判定
        this.mesh.ellipsoid = new BABYLON.Vector3(0.5, 0.5, 0.5);
        this.mesh.setEnabled(false);

        // ジオメトリ情報の強制再計算
        this.mesh.computeWorldMatrix(true);
        this.mesh.refreshBoundingInfo(true);

        this.create_hp_bar();
    }

    create_dust(direction){

        const position = this.mesh.position
            .add(direction.scale(2 + Math.random() * 1))
            .add(BABYLON.Vector3.Random().scale(2).subtractFromFloats(1, 1, 1).scale(1.1));
        const velocity = BABYLON.Vector3.Random().scale(2).subtractFromFloats(1, 1, 1).scale(0.005);

        const eff = new Eff_Dust(this.scene);
        // eff.create(position, velocity);
        eff.create(position, velocity);
        GameState.effects.push(eff);
    }

    update(time, delta){

        // キー操作による回転処理
        if (GameState.inputKey["arrowleft"] || GameState.inputPad.left || GameState.inputMouse.left){
            this.change_yaw(-0.04);
            this.create_dust(this.right.scale(-1));
        }
        if (GameState.inputKey["arrowright"] || GameState.inputPad.right || GameState.inputMouse.right){
            this.change_yaw(0.04);
            this.create_dust(this.right);
        }
        if (GameState.inputKey["arrowup"] || GameState.inputPad.up || GameState.inputMouse.up){
            this.velocity_new.addInPlace(this.forward.normalize().scale(this.accel));
            // this.change_pitch(-0.04);
            this.create_dust(this.forward);
        }
        if (GameState.inputKey["arrowdown"] || GameState.inputPad.down || GameState.inputMouse.down){
            this.velocity_new.addInPlace(this.forward.normalize().scale(this.accel * -1));
            // this.change_pitch(0.04);
            this.create_dust(this.zero);
        }
        if (GameState.inputKey["q"]){
            this.change_roll(-0.03);
        }
        if (GameState.inputKey["w"]){
            this.change_roll(0.03);
        }
        if (GameState.inputKey["z"] || GameState.inputPad.button || (GameState.inputMouse.button && GameState.inputMouse.accel)){
            this.velocity_new.addInPlace(this.forward.normalize().scale(this.accel));
        }

        // 速度制限・減速
        if (this.velocity_new.length() > this.max_speed) {
            this.velocity_new.normalize().scaleInPlace(this.max_speed);
        }
        this.velocity_new.scaleInPlace(this.decel);

        // 移動
        this.mesh.moveWithCollisions(this.velocity_new);
        this.velocity = this.velocity_new.clone();

        // 上下の動きを制限
        if (this.mesh.position.y < GLOBALS.MOVABLE.Y.MIN) this.mesh.position.y = GLOBALS.MOVABLE.Y.MIN;
        if (this.mesh.position.y > GLOBALS.MOVABLE.Y.MAX) this.mesh.position.y = GLOBALS.MOVABLE.Y.MAX;

        // カメラを追随
        const distance = 0; // 自機からカメラまでの距離
        // 注視点が近いと、カメラ自体が移動した瞬間に生じる視線方向の不連続な変化を
        // Babylon.js が補正するせいか、動きにビクつきが生じる。注視点を遠くに離す
        // ことで、カメラ移動の視線方向の変化を穏やかにし、問題を緩和している。
        const lookAheadDistance = 100;
        const camera = GameState.camera;
        const targetOffset = this.forward.scale(lookAheadDistance);
        const cameraTarget = this.mesh.position.add(targetOffset);
        camera.setTarget(cameraTarget);

        const backward = this.forward.scale(-distance);
        const cameraPosition = this.mesh.position.add(backward);
        camera.position = cameraPosition;
        camera.upVector = this.up;

        // this.mesh.lookAt(cameraTarget);

        // メッシュの向き：TBN → 回転行列 → クオータニオン設定
        const tempMatrix = new BABYLON.Matrix();
        tempMatrix.copyFrom(BABYLON.Matrix.FromValues(
            this.right.x, this.right.y, this.right.z, 0,    // X-Axis (Right)
            this.up.x,    this.up.y,    this.up.z,    0,    // Y-Axis (Up)
            this.forward.x, this.forward.y, this.forward.z, 0, // Z-Axis (Forward)
            0, 0, 0, 1 // Translation (W)
        ));
        BABYLON.Quaternion.FromRotationMatrixToRef(tempMatrix, this.mesh.rotationQuaternion);

        this.hp = Math.min(this.hp_max, this.hp + HP_RECOVERY);
        this.update_hp_bar();

        super.update(time, delta);
    }

    // [回転計算] yaw: 上下を軸に左右に舵を切る
    change_yaw(deltaAngle){
        if (Math.abs(deltaAngle) > 1e-6) {
            const rotation = BABYLON.Quaternion.RotationAxis(this.up, deltaAngle);
            this.forward = this.forward.rotateByQuaternionToRef(rotation, this.forward);
            this.right = this.right.rotateByQuaternionToRef(rotation, this.right);

            // TBNフレームの再直交化・正規化
            this.forward.normalize();
            BABYLON.Vector3.CrossToRef(this.up, this.forward, this.right);
            this.right.normalize();
            BABYLON.Vector3.CrossToRef(this.forward, this.right, this.up);
            this.up.normalize();
        }
    }

    // [回転計算] pitch: 左右を軸に機首を上下に振る
    change_pitch(deltaAngle){
        if (Math.abs(deltaAngle) > 1e-6) {
            const rotation = BABYLON.Quaternion.RotationAxis(this.right, deltaAngle);
            this.forward = this.forward.rotateByQuaternionToRef(rotation, this.forward);
            this.up = this.up.rotateByQuaternionToRef(rotation, this.up);

            // TBNフレームの再直交化・正規化
            this.right.normalize();
            BABYLON.Vector3.CrossToRef(this.forward, this.right, this.up);
            this.up.normalize();
            BABYLON.Vector3.CrossToRef(this.right, this.up, this.forward);
            this.forward.normalize();
        }
    }

    // [回転計算] roll: 前後を軸に機体を傾ける
    change_roll(deltaAngle){
        if (Math.abs(deltaAngle) > 1e-6) {
            const rotation = BABYLON.Quaternion.RotationAxis(this.forward, deltaAngle);
            this.up = this.up.rotateByQuaternionToRef(rotation, this.up);
            this.right = this.right.rotateByQuaternionToRef(rotation, this.right);
        }
    }

    dispose(){
        if (this.hpFrame) {
            GameState.ui.removeControl(this.hpFrame);
            this.hpFrame.dispose();
            this.hpFrame = null;
        }
        if (this.hpFill) {
            GameState.ui.removeControl(this.hpFill);
            this.hpFill.dispose();
            this.hpFill = null;
        }
        super.dispose();
    }
}