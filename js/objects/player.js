// player.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from "../GameState.js";
import { Movable } from "./base_movable.js";
import { MyMath } from "../utils/MathUtils.js";
import { Eff_Dust } from "./eff_dust.js";
import { Bullet } from "./bullet.js";

const EXTERNAL_VELOCITY_DAMPING = 0.80;

const HP_BAR_WIDTH = 720;
const HP_BAR_HEIGHT = 80;
const HP_BAR_PADDING = 5;

const DUST_INTERVAL = 5;

const DASH_PRESS_THRESHOLD = 0.1 * 1000;
const DASH_RELEASE_THRESHOLD = 0.2 * 1000;

export class Player extends Movable {

    constructor(scene){
        super(scene);
        this.radius = 0.6;
        this.mass = 1.0;

        this.load_player_stats();

        this.decel = 0.94;
        this.yaw_speed = 0.0;
        this.yaw_speed_max = 0.04;
        this.yaw_accel = 0.003;
        this.yaw_decel = 0.94;
        this.roll_max = 0.1;

        this.dust_counter = 0;
        this.shake = new Shake();

        // TBNフレーム
        this.forward = new BABYLON.Vector3(0, 0, 1);
        this.up = new BABYLON.Vector3(0, 1, 0);
        this.right = BABYLON.Vector3.Cross(this.up, this.forward).normalize();
        this.zero = new BABYLON.Vector3(0,0,0);

        // HPバー
        this.hpFrame = null;
        this.hpFill = null;

        // 自弾
        this.cooldown = 0;

        // ダッシュモード
        this.is_last_up = false;
        this.last_press_time = null;
        this.last_release_time = null;
        this.was_last_press_short = false;
        this.is_dash_mode = false;
        this.dash_accel_ratio = 1.5;
        this.dash_speed_max_ratio = 2.0;
    }

    create(pos){

        const container = GameState.asset.mesh.player;
        // container.addAllToScene();
        const inst = container.instantiateModelsToScene( (name) => `${name}_player` );
        this.mesh = inst.rootNodes[0];

        this.mesh.position = pos;
        this.mesh.checkCollisions = true; //障害物との衝突判定
        this.mesh.ellipsoid = new BABYLON.Vector3(0.5, 0.5, 0.5);
        this.mesh.setEnabled(false);

        // ジオメトリ情報の強制再計算
        // this.mesh.computeWorldMatrix(true);
        // this.mesh.refreshBoundingInfo(true);

        this.create_hp_bar();
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
        GameState.ui_manager.ui.addControl(this.hpFrame);

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
            if (ratio < 0.3){
                this.hpFill.color = "red";
                this.hpFill.background = "red";          
            } else if (ratio < 0.5){
                this.hpFill.color = "yellow";
                this.hpFill.background = "yellow";          
            } else {
                this.hpFill.color = "cyan";
                this.hpFill.background = "cyan";                
            }
        }
    }

    create_dust(direction){
        this.dust_counter -= 1;
        if (this.dust_counter > 0) return;
        this.dust_counter = DUST_INTERVAL;

        const position = this.mesh.position
            .add(direction.scale(2 + Math.random() * 1))
            .add(BABYLON.Vector3.Random().scale(2).subtractFromFloats(1, 1, 1).scale(1.1));
        const velocity = BABYLON.Vector3.Random().scale(2).subtractFromFloats(1, 1, 1).scale(0.005);

        const eff = new Eff_Dust(this.scene);
        eff.create(position, velocity);
        GameState.effects.push(eff);
    }

    shake(){
        this.shake.start();
    }

    update(time, delta){

        const isLeft = GameState.inputKey["arrowleft"] || GameState.inputPad.left || GameState.inputMouse.left;
        const isRight = GameState.inputKey["arrowright"] || GameState.inputPad.right || GameState.inputMouse.right;
        const isUp = GameState.inputKey["arrowup"] || GameState.inputPad.up || GameState.inputMouse.up;
        const isDown = GameState.inputKey["arrowdown"] || GameState.inputPad.down || GameState.inputMouse.down;
        const isShot = GameState.inputKey["z"] || GameState.inputPad.button || (GameState.inputMouse.button && GameState.inputMouse.accel);

        if (this.alive){
            // 移動
            if (isLeft){
                this.yaw_speed = Math.max(this.yaw_speed - this.yaw_accel, - this.yaw_speed_max);
                this.create_dust(this.right.scale(-1));
            }
            if (isRight){
                this.yaw_speed = Math.min(this.yaw_speed + this.yaw_accel, this.yaw_speed_max);
                this.create_dust(this.right);
            }
            if (isDown){
                this.control_velocity.addInPlace(this.forward.normalize().scale(this.accel * -1));
                this.create_dust(this.zero);
            }
            // ダッシュモード判定
            if ( isUp && !this.is_last_up){
                this.last_press_time = time;
                if (this.was_last_press_short && (this.last_press_time - this.last_release_time) < DASH_RELEASE_THRESHOLD) {
                    this.is_dash_mode = true;
                    GameState.asset.se.dash.play();
                }
                // console.log("dash mode press:", this.last_press_time - this.last_release_time, DASH_RELEASE_THRESHOLD, this.was_last_press_short, this.is_dash_mode);
            }
            if ( !isUp && this.is_last_up){
                this.last_release_time = time;
                this.was_last_press_short = (this.last_release_time - this.last_press_time) < DASH_PRESS_THRESHOLD;
                this.is_dash_mode = false;
                // console.log("dash mode release:", this.last_release_time - this.last_press_time, DASH_PRESS_THRESHOLD, this.was_last_press_short);
            }
            if (isUp){
                // 前方向の加速
                this.control_velocity.addInPlace(this.forward.normalize().scale(this.accel * (this.is_dash_mode ? this.dash_accel_ratio : 1.0)));
                // データダストの生成
                this.create_dust(this.forward.scale(2));
            }
            this.is_last_up = isUp;
            // ショット
            if (isShot){
                if (this.cooldown <= 0){
                    this.cooldown = 1 / this.shot_speed;

                    if (this.hp > 1){
                        this.hp--;
                        const eff = new Bullet(this.scene);
                        eff.create(this.mesh.position, this.forward, this.shot_power);
                        GameState.bullets.push(eff);
                    }
                }
            }
        }

        // 速度制限・減速
        if (this.control_velocity.length() > this.speed_max / 100) {
            this.control_velocity.normalize().scaleInPlace((this.speed_max / 100)*(this.is_dash_mode ? this.dash_speed_max_ratio : 1.0));
        }
        this.control_velocity.scaleInPlace(this.decel);
        // 外部からの速度の減衰
        this.external_velocity.scaleInPlace(EXTERNAL_VELOCITY_DAMPING);
        // 回転速度の減速と回転
        this.yaw_speed *= this.yaw_decel;
        this.change_yaw(this.yaw_speed);
        // 見た目のroll（演出用）
        const roll = (this.yaw_speed / this.yaw_speed_max) * this.roll_max;

        // 上下の動きを制限
        if (this.mesh.position.y < GLOBALS.MOVABLE.Y.MIN) this.mesh.position.y = GLOBALS.MOVABLE.Y.MIN;
        if (this.mesh.position.y > GLOBALS.MOVABLE.Y.MAX) this.mesh.position.y = GLOBALS.MOVABLE.Y.MAX;

        // 停止時にdust生成
        if (this.control_velocity.length() < 0.1 && this.yaw_speed < 0.001){
                this.create_dust(this.forward);
        }

        // カメラを揺らす
        this.shake.update(time, delta);

        // カメラを追随
        const distance = 0.2; // 自機の背後にカメラを置く距離
        // 注視点が近いと、カメラ自体が移動した瞬間に生じる視線方向の不連続な変化を
        // Babylon.js が補正するせいか、動きにビクつきが生じる。注視点を遠くに離す
        // ことで、カメラ移動の視線方向の変化を穏やかにし、問題を緩和している。
        const lookAheadDistance = 100;
        const camera = GameState.camera;
        const targetOffset = this.forward.scale(lookAheadDistance);
        const cameraTarget = this.mesh.position.add(targetOffset);
        camera.setTarget(cameraTarget);

        const backward = this.forward.scale(-distance);
        const deviation = this.shake.get_deviation();
        const cameraPosition = this.mesh.position.add(backward).add(deviation);
        camera.position = cameraPosition;
        camera.upVector = this.compute_rolled_up(this.forward, this.up, roll);

        // メッシュの向き：TBN → 回転行列 → クオータニオン設定
        const tempMatrix = new BABYLON.Matrix();
        tempMatrix.copyFrom(BABYLON.Matrix.FromValues(
            this.right.x, this.right.y, this.right.z, 0,    // X-Axis (Right)
            this.up.x,    this.up.y,    this.up.z,    0,    // Y-Axis (Up)
            this.forward.x, this.forward.y, this.forward.z, 0, // Z-Axis (Forward)
            0, 0, 0, 1 // Translation (W)
        ));
        BABYLON.Quaternion.FromRotationMatrixToRef(tempMatrix, this.mesh.rotationQuaternion);

        // 定期的なhpの減少／微増
        if (this.alive){
            const hpd = this.hp_delta * delta / 1000; 
            if (this.hp_delta > 0){
                this.hp = Math.min(this.hp_max, this.hp + hpd);
            } else if (this.hp_delta < 0 && this.hp > Math.abs(hpd)){
                this.hp += hpd;
            }
        }

        this.update_hp_bar();

        // 連射のクールダウン
        this.cooldown = Math.max(this.cooldown - delta / 1000, 0);

        super.update(time, delta);
        // console.log("player:damage:", this.damage, " hp:", this.hp);
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

    // [回転計算] forward周りに up方向を roll分回転させる
    compute_rolled_up(forward, up, roll) {
        if (Math.abs(roll) < 1e-6) {
            return up.clone();
        }
        const q = BABYLON.Quaternion.RotationAxis(forward, -roll);
        const rolledUp = new BABYLON.Vector3();
        up.rotateByQuaternionToRef(q, rolledUp);
        rolledUp.normalize();
        return rolledUp;
    }

    // プレイヤーステータス変更
    add_speed_max(spd){
        this.speed_max = Math.min(GLOBALS.PLAYER_STATS.LIMIT.SPEED_MAX, this.speed_max + spd);
    }

    add_hp_max(hp){
        this.hp_max = Math.min(GLOBALS.PLAYER_STATS.LIMIT.HP_MAX, this.hp_max + hp);
    }

    add_mass(mass){
        this.mass = Math.min(GLOBALS.PLAYER_STATS.LIMIT.MASS, this.mass + mass);
    }

    add_hp_delta(hpd){
        this.hp_delta = Math.min(GLOBALS.PLAYER_STATS.LIMIT.HP_DELTA, this.hp_delta + hpd);
    }

    add_shot_speed(spd){
        this.shot_speed = Math.min(GLOBALS.PLAYER_STATS.LIMIT.SHOT_SPEED, this.shot_speed + spd);
    }

    add_shot_power(pow){
        this.shot_power = Math.min(GLOBALS.PLAYER_STATS.LIMIT.SHOT_POWER, this.shot_power + pow);
    }

    load_player_stats(){
        this.hp = GameState.player_stats.hp;
        this.hp_max = GameState.player_stats.hp_max;
        this.hp_delta = GameState.player_stats.hp_delta;
        this.mass = GameState.player_stats.mass;
        this.accel = GameState.player_stats.accel;
        this.speed_max = GameState.player_stats.speed_max;
        this.shot_speed = GameState.player_stats.shot_speed;
        this.shot_power = GameState.player_stats.shot_power;
    }

    save_player_stats(){
        GameState.player_stats.hp = this.hp;
        GameState.player_stats.hp_max = this.hp_max;
        GameState.player_stats.hp_delta = this.hp_delta;
        GameState.player_stats.mass = this.mass;
        GameState.player_stats.accel = this.accel;
        GameState.player_stats.speed_max = this.speed_max;
        GameState.player_stats.shot_speed = this.shot_speed;
        GameState.player_stats.shot_power = this.shot_power;
    }

    dispose(){
        // dispose前に必要なクラス変数をグローバル変数にコピー
        this.save_player_stats();
        // オブジェクトの解放
        if (this.hpFrame) {
            if (GameState.ui_manager){
                GameState.ui_manager.ui.removeControl(this.hpFrame);
            }
            this.hpFrame.dispose();
            this.hpFrame = null;
        }
        if (this.hpFill) {
            if (GameState.ui_manager){
                GameState.ui_manager.ui.removeControl(this.hpFill);
            }
            this.hpFill.dispose();
            this.hpFill = null;
        }
        super.dispose();
    }
} // End of Player

const SHAKE_INTERVAL = 0.05;
const SHAKE_TIMES = 5;
const SHAKE_RADIUS = 0.3;

class Shake {
    constructor(){
        this.is_shaking = false;
        this.counter = 0;
        this.interval = 0;
        this.deviation = BABYLON.Vector3.Zero();
    }

    start(){
        if (this.is_shaking === false){
            this.is_shaking = true;
            this.counter = SHAKE_TIMES;
            this.interval = SHAKE_INTERVAL;
            this.set_deviation();
        }
    }
    
    stop(){
        this.is_shaking = false;
        this.deviation = BABYLON.Vector3.Zero();
    }

    set_deviation(){
        const x = Math.random() * SHAKE_RADIUS;
        const y = Math.random() * SHAKE_RADIUS;
        const z = Math.random() * SHAKE_RADIUS;
        this.deviation = new BABYLON.Vector3(x,y,z);
    }

    get_deviation(){
        return this.deviation;
    }

    update(time,delta){
        if (this.is_shaking){
            this.interval -= delta / 1000;
            if (this.interval < 0){
                this.set_deviation();
                this.interval = SHAKE_INTERVAL;
                this.counter--;
                if (this.counter < 0){
                    this.stop()
                }
            }
        }
    }
}