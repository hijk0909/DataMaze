// base_enemy.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from "../GameState.js";
import { Movable } from "./base_movable.js";
import { MyMath } from "../utils/MathUtils.js";

const FLASH_TIME = 0.15; //秒
const SHOT_MASS = 0.1;

const HP_OFFSET_Y = 0.2;
const HP_BAR_WIDTH = 160;
const HP_BAR_HEIGHT = 20;
const HP_BAR_PADDING = 30;

export class Enemy extends Movable {

    constructor(scene){
        super(scene);
        this.materials = [];

        this.current_state = null;

        this.hp_max = 100;
        this.hp = 100;
        this.hp_bar = new HpBar(scene);

        this.flash_time = 0;

        this.debugEllipsoid = null;
    }

    create(){
        // 体力ゲージの生成
        this.hp_bar.create();

        // emmisiveColor のある 全マテリアルの収集
        this.mesh.getChildMeshes().forEach(m => {
            if (m.material){
                m.material = m.material.clone();
                if (m.material.emissiveColor){
                    this.materials.push(m.material);
                }
            }
        });

        // 待機状態に設定
        this.change_state(ENEMY_STATE.WAIT);

        super.create();
    }


    // デバッグ用のellipsoid可視化
    create_debug_ellipsoid(ellipsoid){
        this.debugEllipsoid = BABYLON.MeshBuilder.CreateSphere("debugEllipsoid", {
            diameterX: ellipsoid.x * 2,
            diameterY: ellipsoid.y * 2,
            diameterZ: ellipsoid.z * 2
        }, this.scene);

        this.debugEllipsoid.material = new BABYLON.StandardMaterial("debugMat", this.scene);
        this.debugEllipsoid.material.wireframe = true;
        this.debugEllipsoid.material.emissiveColor = new BABYLON.Color3(1, 0, 0);

        // 毎フレーム追従
        this.scene.registerBeforeRender(() => {
            if (this.mesh && this.debugEllipsoid){
                this.debugEllipsoid.position = this.mesh.position.add(this.mesh.ellipsoidOffset || BABYLON.Vector3.Zero());
            }
        });
    }

    change_state(nextState){
        if (this.current_state) {
            this.current_state.exit(this);
        }
        const StateClass = EnemyStateList[nextState];
        if (!StateClass) { throw new Error(`Unknown state: ${nextState}`); }
        this.current_state = new StateClass();
        this.current_state.enter(this);
    }

    shot_from_player(power, velocity){
        this.subtract_hp(power * this.params.damage.shot_weakness);
        this.add_impulse(velocity.scale(this.params.damage.shot_knockback * SHOT_MASS));
        if (this.current_state.id === ENEMY_STATE.WAIT){
            this.change_state(ENEMY_STATE.CHASE);
        }
    }

    flash(){
        this.flash_time = FLASH_TIME;
    }

    // コールバック関数
    on_wait_enter(state){}
    on_chase_enter(state){}
    on_idle_enter(state){}
    on_escape_enter(state){}
    on_chase_timeout(state){}
    on_idle_timeout(state){}
    on_escape_timeout(state){}

    update(time, delta){
        // 現在状態のupdate
        this.current_state.update(this, time, delta);
        // 体力ゲージの表示更新
        this.hp_bar.update(this);
        // フラッシュの表示更新
        if (this.flash_time > 0) {
            this.flash_time -= delta / 1000;
            const t = Math.max(0, this.flash_time / FLASH_TIME); // 1→0
            this.materials.forEach(mat => {
                mat.emissiveColor.set(t,t,t);
            });
        }

        super.update(time, delta);
    }

    dispose(){
        this.hp_bar.dispose();

        if (this.debugEllipsoid){
            this.debugEllipsoid.dispose();
            this.debugEllipsoid = null;
        }

        super.dispose();
    }
}

// 状態遷移
export const ENEMY_STATE = {
    WAIT: 0,
    CHASE : 1,
    ESCAPE : 2,
    IDLE : 3,
    CHARGING : 4,
    RUSH :5,
    THUNDER : 6,
    CONFUSED : 7
};

class EnemyState {
    constructor(){
        this.hasTimeout = false;
        this.timer = 0;
    }
    enter(enemy) {}
    update(enemy, time, delta) {}
    exit(enemy) {}
}

class WaitState extends EnemyState {
    constructor(){
        super();
        this.id = ENEMY_STATE.WAIT;
    }
    enter(enemy){
        enemy.on_wait_enter(this);
    }
    update(enemy, time, delta) {
        // 自機がテリトリー内に来たら行動開始
        const toPlayer = GameState.player.mesh.position
            .subtract(enemy.mesh.position);
        if (toPlayer.length()  <  enemy.params.territory && GameState.stage_state === GLOBALS.STAGE_STATE.PLAYING){
            enemy.change_state(ENEMY_STATE.CHASE);
        }
    }
    exit(enemy){
    }
}

class ChaseState extends EnemyState {
    constructor(){
        super();
        this.id = ENEMY_STATE.CHASE;
    }
    enter(enemy){
        enemy.turn_reverse = false;
        enemy.on_chase_enter(this);
    }
    update(enemy, time, delta) {
        // 追跡行動
        const toPlayer = GameState.player.mesh.position
            .subtract(enemy.mesh.position);
        const dir = toPlayer.clone().normalize();
        enemy.control_velocity.addInPlace(dir.scale(enemy.params.speed.accel));
        if (enemy.control_velocity.length() > enemy.params.speed.chase) {
            enemy.control_velocity.normalize().scaleInPlace(enemy.params.speed.chase);
        }
        // 時間制限
        if (this.hasTimeout){
            this.timer -= delta / 1000;
            if (this.timer <= 0){
                enemy.on_chase_timeout(this);
            }
        }
    }
    exit(enemy){
    }
}

class EscapeState extends EnemyState {
    constructor(){
        super();
        this.id = ENEMY_STATE.ESCAPE;
    }
    enter(enemy){
        enemy.turn_reverse = true;
        enemy.on_escape_enter(this);
    }
    update(enemy, time, delta) {
        // 逃避行動
        const toPlayer = GameState.player.mesh.position
            .subtract(enemy.mesh.position);
        const dir = toPlayer.clone().normalize();
        enemy.control_velocity.addInPlace(dir.scale(-enemy.params.speed.accel));
        if (enemy.control_velocity.length() > enemy.params.speed.escape) {
            enemy.control_velocity.normalize().scaleInPlace(enemy.params.speed.escape);
        }
        // 時間制限
        if (this.hasTimeout){
            this.timer -= delta / 1000;
            if (this.timer <= 0){
                enemy.on_escape_timeout(this);
            }
        }
    }
    exit(enemy){
    }
}

class IdleState extends EnemyState {
    constructor(){
        super();
        this.id = ENEMY_STATE.IDLE;
    }
    enter(enemy){
        enemy.on_idle_enter(this);
    }
    update(enemy, time, delta) {
        // 減速・停止
        enemy.control_velocity.scaleInPlace(enemy.params.speed.decel);
        // 時間制限
        if (this.hasTimeout){
            this.timer -= delta / 1000;
            if (this.timer <= 0){
                enemy.on_idle_timeout(this);
            }
        }
    }
    exit(enemy){
    }
}

class ChargingState extends EnemyState {
    constructor(){
        super();
        this.id = ENEMY_STATE.CHARGING;
    }
    enter(enemy){
    }
    update(enemy, time, delta) {
    }
    exit(enemy){
    }
}

class RushState extends EnemyState {
    constructor(){
        super();
        this.id = ENEMY_STATE.RUSH;
    }
    enter(enemy){
    }
    update(enemy, time, delta) {
    }
    exit(enemy){
    }
}

class ThunderState extends EnemyState {
    constructor(){
        super();
        this.id = ENEMY_STATE.THUNDER;
    }
    enter(enemy){
    }
    update(enemy, time, delta) {
    }
    exit(enemy){
    }
}

class ConfusedState extends EnemyState {
    constructor(){
        super();
        this.id = ENEMY_STATE.CONFUSED;
    }
    enter(enemy){
    }
    update(enemy, time, delta) {
    }
    exit(enemy){
    }
}

const EnemyStateList = {
    [ENEMY_STATE.WAIT]:       WaitState,
    [ENEMY_STATE.CHASE]:      ChaseState,
    [ENEMY_STATE.ESCAPE]:     EscapeState,
    [ENEMY_STATE.IDLE]:       IdleState,
    [ENEMY_STATE.CHARGING]:   ChargingState,
    [ENEMY_STATE.RUSH]:       RushState,
    [ENEMY_STATE.THUNDER]:    ThunderState,
    [ENEMY_STATE.CONFUSED]:   ConfusedState    
}

// 体力ゲージの管理クラス
class HpBar {
    constructor(scene){
        this.scene = scene;
        this.hpFrame = null;
        this.hpFill = null;
    }

    create(){
        // 外枠
        this.hpFrame = new BABYLON.GUI.Rectangle();
        this.hpFrame.width = `${HP_BAR_WIDTH}px`;
        this.hpFrame.height = `${HP_BAR_HEIGHT}px`;
        this.hpFrame.color = "red";
        this.hpFrame.thickness = 2;
        this.hpFrame.background = "transparent";
        this.hpFrame.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.hpFrame.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        GameState.ui_manager.ui.addControl(this.hpFrame);
        // this.hpFrame.linkWithMesh(this.hpNode);

        // 中身色 (左合わせ)
        this.hpFill = new BABYLON.GUI.Rectangle();
        this.hpFill.height = `${HP_BAR_HEIGHT}px`;
        this.hpFill.color = "yellow";
        this.hpFill.background = "yellow";
        this.hpFill.thickness = 0;
        this.hpFill.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.hpFill.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.hpFrame.addControl(this.hpFill);
    }

    update(enemy){
        // 壁の影に隠れていないか
        if (MyMath.is_occluded_by_terrain(enemy.mesh.position, this.scene)){
            this.hpFrame.isVisible = false;
            this.hpFill.isVisible = false;
            return;
        }

        const world_pos = enemy.mesh.position.clone();
        world_pos.y += enemy.radius + HP_OFFSET_Y;
        const screen_pos = MyMath.world_to_screen(world_pos);

        // 視錐体の near と far の範囲内ではない場合は表示しない
        if (screen_pos.z < 0.0 || screen_pos.z > 1.0) {
            this.hpFrame.isVisible = false;
            this.hpFill.isVisible = false;
            return;
        }
        this.hpFrame.isVisible = true;
        this.hpFill.isVisible = true;

        let x = screen_pos.x;
        let y = screen_pos.y;

        const iw = GameState.ui_manager.ui.idealWidth;
        const ih = GameState.ui_manager.ui.idealHeight;
        const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
        x = clamp(x, HP_BAR_WIDTH  + HP_BAR_PADDING, iw - HP_BAR_WIDTH - HP_BAR_PADDING);
        y = clamp(y, HP_BAR_HEIGHT + HP_BAR_PADDING, ih - HP_BAR_HEIGHT- HP_BAR_PADDING);

        // 外枠の位置
        this.hpFrame.left = x - HP_BAR_WIDTH / 2;
        this.hpFrame.top = y - HP_BAR_HEIGHT / 2;

        // 残り HP 比率
        const ratio = enemy.hp / enemy.hp_max;
        const barWidth = HP_BAR_WIDTH * ratio;

        // 黄色バーの位置と幅
        this.hpFill.width = `${barWidth}px`;

        // プレイヤーとの距離に応じた透明度の変化
        const MIN_DIST = 2.5;
        const MAX_DIST = 10.0;
        const MIN_ALPHA = 0.0;
        const MAX_ALPHA = 1.0;
        const toPlayerDistance = GameState.player.mesh.position
            .subtract(enemy.mesh.position)
            .length();
        let alpha = 0;
        if (toPlayerDistance < MIN_DIST){
            alpha = MAX_ALPHA;
        } else if (toPlayerDistance > MAX_DIST){
            alpha = MIN_ALPHA;
        } else{
            alpha = (MAX_DIST - toPlayerDistance)/(MAX_DIST - MIN_DIST)*(MAX_ALPHA - MIN_ALPHA);
        }
        this.hpFrame.alpha = alpha;
        this.hpFill.alpha = alpha;
    }

    dispose(){
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
    }
}