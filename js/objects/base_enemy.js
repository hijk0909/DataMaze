// base_enemy.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from "../GameState.js";
import { Movable } from "./base_movable.js";
import { MyMath } from "../utils/MathUtils.js";
import { MyDraw } from "../utils/DrawUtils.js";

const FLASH_TIME = 0.15; //秒

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
        this.recovery_point = 100;

        this.hp_bar = new HpBar(scene);

        this.base_emissive_color = EnemyStateColor.NONE;
        this.flash_time = 0;

        this.delta_y = 0;

        // 状態視覚効果
        this.state_effects = new StateEffectController(this);

        this.parent;

        // [DEBUG] 当たり判定の可視化
        this.debugEllipsoid = null;

        // パラメータ
        this.params = {
            territory: 4.0,
            target_pos : GameState.player.mesh.position,
            speed: {
                chase : 0.10,
                escape : 0.03,
                rush : 0.3,
                turn : 0.8,
                turn_magnification : 1.0,
                rotation : 1.5,
                accel : 0.003,
                decel: 0.95
            },
            damage: {
                is_last_collision : true,
                shot_weakness: 1.0,
                shot_knockback: 1.0,
                confused_weakness: 10.0,
                rush_defence: 5.0,
                rush_attack: 3.0
            },
            anger: {
                is_valid : true,
                count : 0,
                threshold: 3,
                charge_period: 2.0,
                rush_period: 1.5,
                rush_accel: 0.06,
                thunder_period: 1.0,
                thunder_area: 3.0,
                thunder_damage: 2.5
            },
            confuse: {
                is_valid : true,
                count : 0,
                threshold: 4,
                confuse_period: 5.0
            },
            idle : {
                period: 1.0
            },
            drops : [
                { id: "Item_Feed", weight: 85 },
                { id: "Item_Mass", weight: 10 },
                { id: "Item_ShotPower", weight: 5 }
            ],
            caption : {
                id : "ENEMY:CLASS",
                texts : ["ENEMY:CLASS","CAPTION"],
                color : "#ffff00"
            }
        };
    }

    create(type){
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

        // [TYPE] タイプ指定
        if (type){
            if (type ==="drop_battery"){
                this.params.drops=[{ id: "Item_Battery", weight: 100 }];
            } else if (type && type ==="drop_key"){
                this.params.drops=[{ id: "Item_Key", weight: 100 }];
            }
        }

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

    set_parent(parent){
        this.parent = parent;
    }

    // 状態遷移
    change_state(nextState){
        if (this.current_state) {
            this.current_state.exit(this);
        }
        const StateClass = EnemyStateList[nextState];
        if (!StateClass) { throw new Error(`Unknown state: ${nextState}`); }
        this.current_state = new StateClass();
        this.current_state.enter(this);
    }

    shot_from_player(power, velocity, mass){
        this.subtract_hp(power * this.params.damage.shot_weakness * this.damage_magnification);
        this.add_impulse(velocity.scale(this.params.damage.shot_knockback * mass));
        if (this.current_state.id === ENEMY_STATE.WAIT){
            this.change_state(ENEMY_STATE.CHASE); //寝た子を起こす
            MyDraw.show_scroll_message_once(this.params.caption.texts, this.params.caption.color, this.params.caption.id);
        }
        this.count_attack(false);
    }

    count_attack(isCollision){
        if(this.params.damage.is_last_collision === isCollision){
            if (this.current_state.id === ENEMY_STATE.CHASE){
                this.params.anger.count += 1;
                if (this.params.anger.is_valid && this.params.anger.count >= this.params.anger.threshold){
                    this.params.anger.count = 0;
                    this.params.confuse.count = 0;
                    this.change_state(ENEMY_STATE.CHARGE);
                }
            }
        } else {
            if (this.current_state.id === ENEMY_STATE.CHASE){
                this.params.confuse.count += 1;
                if (this.params.confuse.is_valid && this.params.confuse.count >= this.params.confuse.threshold){
                    this.params.confuse.count = 0;
                    this.params.anger.count = 0;
                    this.change_state(ENEMY_STATE.CONFUSED);
                }
            }
        }
        this.params.damage.is_last_collision = isCollision;
        // console.log("count_attack isCollision:",isCollision," anger:",this.params.anger.count, " confuse:",this.params.confuse.count);
    }

    flash(){
        this.flash_time = FLASH_TIME;
    }

    set_emissive_color(ec, t=0){
        if (ec){
            this.base_emissive_color = ec;
        }
        this.materials.forEach(mat => {
            mat.emissiveColor.set(this.base_emissive_color.r + t, this.base_emissive_color.g + t, this.base_emissive_color.b + t);
        });
    }

    // コールバック関数（必要に応じてサブクラスでオーバーライド）
    on_wait_enter(state){}
    on_chase_enter(state){}
    on_charge_enter(state){}
    on_idle_enter(state){}
    on_escape_enter(state){}
    on_confused_enter(state){}
    on_rush_enter(state){}
    on_free_enter(state){}

    on_wait_update(state, time, delta){}
    on_chase_update(state, time, delta){}
    on_charge_update(state, time, delta){}
    on_idle_update(state, time, delta){}
    on_free_update(state, time, delta){}

    on_chase_timeout(state){}
    on_idle_timeout(state){}
    on_escape_timeout(state){}
    on_charge_timeout(state){}

    update(time, delta){
        // 現在状態のupdate
        this.current_state.update(this, time, delta);
        // 状態視覚効果のupdate
        this.state_effects.update(time, delta);
        // 体力ゲージのupdate
        this.hp_bar.update(this);
        // emissive color の表示更新
        if (this.flash_time > 0) {
            this.flash_time -= delta / 1000;
            const t = Math.max(0, this.flash_time / FLASH_TIME); // 1→0
            this.set_emissive_color(null, t);
        }

        super.update(time, delta);
    }

    dispose(){
        this.hp_bar.dispose();
        this.state_effects.dispose();

        if (this.debugEllipsoid){
            this.debugEllipsoid.dispose();
            this.debugEllipsoid = null;
        }

        super.dispose();
    }
} // End of Enemy

// 状態遷移
export const ENEMY_STATE = {
    WAIT: 0,
    CHASE : 1,
    ESCAPE : 2,
    IDLE : 3,
    CHARGE : 4,
    RUSH :5,
    THUNDER : 6,
    CONFUSED : 7,
    FREE : 8
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
        enemy.set_emissive_color(EnemyStateColor.NONE);
    }
    update(enemy, time, delta) {
        enemy.on_wait_update(this, time, delta);
        // 自機がテリトリー内に来たら行動開始（寝た子を起こす）
        enemy.params.target_pos = GameState.player.mesh.position;
        const toPlayer = GameState.player.mesh.position
            .subtract(enemy.mesh.position);
        if (toPlayer.length()  <  enemy.params.territory && GameState.stage_state === GLOBALS.STAGE_STATE.PLAYING){
            enemy.change_state(ENEMY_STATE.CHASE);
            MyDraw.show_scroll_message_once(enemy.params.caption.texts, enemy.params.caption.color, enemy.params.caption.id);
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
        enemy.on_chase_enter(this);
        enemy.params.target_pos = GameState.player.mesh.position;
        enemy.turn_reverse = false;
        enemy.params.speed.turn_magnification = 1.0;
        enemy.set_emissive_color(EnemyStateColor.NONE);
        // console.log("ChaseState.enter()");
    }
    update(enemy, time, delta) {
        enemy.on_chase_update(this, time, delta);
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
        enemy.on_escape_enter(this);
        enemy.turn_reverse = true;
        enemy.set_emissive_color(EnemyStateColor.NONE);
        // console.log("EscapeState.enter()");
    }
    update(enemy, time, delta) {
        enemy.params.target_pos = GameState.player.mesh.position;
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
        enemy.set_emissive_color(EnemyStateColor.NONE);
        this.hasTimeout = true;
        this.timer = enemy.params.idle.period;
        enemy.params.speed.turn_magnification = 1.0;
        // console.log("IdleState.enter()");
    }
    update(enemy, time, delta) {
        enemy.on_idle_update(this, time, delta);
        // 減速・停止
        enemy.control_velocity.scaleInPlace(enemy.params.speed.decel);
        // 時間制限
        if (this.hasTimeout){
            this.timer -= delta / 1000;
            if (this.timer <= 0){
                enemy.change_state(ENEMY_STATE.CHASE);
                enemy.on_idle_timeout(this);
            }
        }
    }
    exit(enemy){
    }
}

class ChargeState extends EnemyState {
    constructor(){
        super();
        this.id = ENEMY_STATE.CHARGE;
    }
    enter(enemy){
        enemy.on_charge_enter(this);
        this.hasTimeout = true;
        this.timer = enemy.params.anger.charge_period;
        enemy.set_emissive_color(EnemyStateColor.CHARGE);
        enemy.state_effects.attach(new ChargeStateEffect(enemy));
        enemy.params.speed.turn_magnification = 5.0;
        enemy.params.target_pos = GameState.player.mesh.position.clone();
        // console.log("ChargeState.enter()");

    }
    update(enemy, time, delta) {
        enemy.on_charge_update(this, time, delta);
        // 減速・停止
        enemy.control_velocity.scaleInPlace(enemy.params.speed.decel);
        // 時間制限
        if (this.hasTimeout){
            this.timer -= delta / 1000;
            if (this.timer <= 0){
                enemy.on_charge_timeout(this);
            }
        }
    }
    exit(enemy){
        enemy.state_effects.detach(ChargeStateEffect);
    }
}

class RushState extends EnemyState {
    constructor(){
        super();
        this.id = ENEMY_STATE.RUSH;
        this.dir = null;
    }
    enter(enemy){
        enemy.on_rush_enter(this);
        this.hasTimeout = true;
        this.timer = enemy.params.anger.rush_period;
        enemy.set_emissive_color(EnemyStateColor.RUSH);
        enemy.damage_magnification = 1 / enemy.params.damage.rush_defence;
        enemy.attack_magnification = enemy.params.damage.rush_attack;
        enemy.params.speed.turn_magnification = 0.0;  //向きを変えない
        enemy.state_effects.attach(new RushStateEffect(enemy));
        enemy.is_wall_detecting = true;
        const toTarget = enemy.params.target_pos.subtract(enemy.mesh.position);
        this.dir = toTarget.clone().normalize();

        GameState.asset.se.rush.play_3D(enemy, enemy.scene);
        // console.log("RushState.enter()");
    }
    update(enemy, time, delta) {
        // 突進行動
        enemy.control_velocity.addInPlace(this.dir.scale(enemy.params.anger.rush_accel));
        if (enemy.control_velocity.length() > enemy.params.speed.rush) {
            enemy.control_velocity.normalize().scaleInPlace(enemy.params.speed.rush);
        }
        enemy.delta_y = 0.2 * Math.abs(Math.sin(time/50));

        // 壁との衝突判定
        if (enemy.hit_wall){
            enemy.change_state(ENEMY_STATE.IDLE);
        }
        // 時間制限
        if (this.hasTimeout){
            this.timer -= delta / 1000;
            if (this.timer <= 0){
                enemy.change_state(ENEMY_STATE.IDLE);
            }
        }
    }
    exit(enemy){
        enemy.damage_magnification = 1.0;
        enemy.attack_magnification = 1.0;
        enemy.params.speed.turn_magnification = 1.0;
        enemy.state_effects.detach(RushStateEffect);
        enemy.is_wall_detecting = false;
        enemy.delta_y = 0;
    }
}

class ThunderState extends EnemyState {
    constructor(){
        super();
        this.id = ENEMY_STATE.THUNDER;
    }
    enter(enemy){
        this.hasTimeout = true;
        this.timer = enemy.params.anger.thunder_period;
        enemy.set_emissive_color(EnemyStateColor.THUNDER);
        enemy.state_effects.attach(new ThunderStateEffect(enemy));

        GameState.asset.se.thunder.play_3D(enemy, enemy.scene);
        // console.log("ThunderState.enter()");
    }
    update(enemy, time, delta) {
        // 減速・停止
        enemy.control_velocity.scaleInPlace(enemy.params.speed.decel);
        // プレイヤーに連続ダメージ
        const toPlayer = GameState.player.mesh.position
            .subtract(enemy.mesh.position);
            // console.log("thunder area:", toPlayer.length(), enemy.params.anger.thunder_area);
        if (toPlayer.length()  <  enemy.params.anger.thunder_area && GameState.stage_state === GLOBALS.STAGE_STATE.PLAYING){
            GameState.player.add_damage_direct(enemy.params.anger.thunder_damage);
            GameState.player.shake.start();
            // console.log("thunder damage:", enemy.params.anger.thunder_damage);
        }        
        // 時間制限
        if (this.hasTimeout){
            this.timer -= delta / 1000;
            if (this.timer <= 0){
                enemy.change_state(ENEMY_STATE.IDLE);
            }
        }
    }
    exit(enemy){
        enemy.state_effects.detach(ThunderStateEffect);
    }
}

class ConfusedState extends EnemyState {
    constructor(){
        super();
        this.id = ENEMY_STATE.CONFUSED;
    }
    enter(enemy){
        enemy.on_confused_enter(this);
        this.hasTimeout = true;
        this.timer = enemy.params.confuse.confuse_period;
        enemy.set_emissive_color(EnemyStateColor.CONFUSED);
        enemy.state_effects.attach(new ConfusedStateEffect(enemy));
        enemy.damage_magnification = enemy.params.damage.confused_weakness;
        enemy.params.speed.turn_magnification = 0.1;
        // console.log("ConfueState.enter()");
    }
    update(enemy, time, delta) {
        // 減速・停止
        enemy.control_velocity.scaleInPlace(enemy.params.speed.decel);
        // 時間制限
        if (this.hasTimeout){
            this.timer -= delta / 1000;
            if (this.timer <= 0){
                enemy.change_state(ENEMY_STATE.CHASE);
            }
        }
    }
    exit(enemy){
        enemy.damage_magnification = 1.0;
        enemy.state_effects.detach(ConfusedStateEffect);
    }
}

class FreeState extends EnemyState {
    constructor(){
        super();
        this.id = ENEMY_STATE.FREE;
    }
    enter(enemy){
        enemy.on_free_enter(this);
    }
    update(enemy, time, delta) {
        enemy.on_free_update(this, time, delta);
    }

    exit(enemy){
    }
}


const EnemyStateList = {
    [ENEMY_STATE.WAIT]:       WaitState,
    [ENEMY_STATE.CHASE]:      ChaseState,
    [ENEMY_STATE.ESCAPE]:     EscapeState,
    [ENEMY_STATE.IDLE]:       IdleState,
    [ENEMY_STATE.CHARGE]:     ChargeState,
    [ENEMY_STATE.RUSH]:       RushState,
    [ENEMY_STATE.THUNDER]:    ThunderState,
    [ENEMY_STATE.CONFUSED]:   ConfusedState,
    [ENEMY_STATE.FREE]:       FreeState    
}

const EnemyStateColor = {
    NONE : new BABYLON.Color3(0.0, 0.0, 0.0),
    CHARGE : new BABYLON.Color3(1.0, 0.4, 0.3),
    RUSH : new BABYLON.Color3(1.0, 0.0, 0.0),
    THUNDER : new BABYLON.Color3(1.0, 1.0, 0.6),
    CONFUSED : new BABYLON.Color3(0.0, 0.5, 1.0)
}

// ◆状態視覚効果
class StateEffectController {
  constructor(enemy) {
    this.enemy = enemy;
    this.effects = [];
  }

  attach(effect) {
    effect.start(this.enemy);
    this.effects.push(effect);
  }

  update(time, delta) {
    for (const effect of this.effects) {
      effect.update(time, delta);
    }
  }

  detach(EffectClass) {
    this.effects = this.effects.filter(effect => {
      if (effect instanceof EffectClass) {
        effect.stop(this.enemy);
        effect.dispose();
        return false; // filter で、配列から除外
      }
      return true;
    });
  }

  dispose() {
    for (const effect of this.effects) {
      effect.stop();
      effect.dispose();
    }
    this.effects.length = 0;
  }
}

class StateEffect {
    constructor(enemy){
        this.enemy = enemy;
    }
    start(){}
    update(time, delta){}
    stop(){}
    dispose(){}
}

class ConfusedStateEffect extends StateEffect {
    constructor(enemy){
        super(enemy);
        this.mesh = enemy.mesh;
        this.distance = enemy.radius;
        this.sprites = [];
        this.rotationAngle = 0;
    }
    start(){
        const spriteIndices = [0, 1, 2, 3, 0, 1];
        for (let i = 0; i < 6; i++) {
            const sprite = new BABYLON.Sprite("confused", GameState.asset.sprite.confused);
            sprite.width = 0.2;
            sprite.height = 0.2;
            sprite.cellIndex = spriteIndices[i];
            sprite.isPickable = false;
            this.sprites.push(sprite);
        }
    }
    update(time, delta){
        const up = this.enemy.get_up_vector();
        const forward = this.enemy.get_forward_vector();
        const right = BABYLON.Vector3.Cross(up, forward).normalize();
        const center = this.mesh.position.add(up.scale(this.distance));

        this.rotationAngle += delta * 0.0007 * Math.PI; // 回転速度

        for (let i = 0; i < this.sprites.length; i++) {
            const angle = this.rotationAngle + (Math.PI * 2 / 6) * i;
            const x = Math.cos(angle);
            const z = Math.sin(angle);

            // 回転平面上の位置を計算
            const offset = right.scale(x).add(forward.scale(z)).scale(0.6); // 回転半径
            const position = center.add(offset);
            this.sprites[i].position = position;
        }
    }
    stop(){
    }

    dispose(){
        for (const sprite of this.sprites) {
            sprite.dispose();
        }
        this.sprites = [];
    }
} // End of ConfusedStateEffect

class ChargeStateEffect extends StateEffect {
    constructor(enemy){
        super(enemy);
        this.enemy = enemy;
        this.scene = enemy.scene;
        this.particleSystem = null;
    }

    start(){
        const up = this.enemy.get_up_vector().normalize();
        const radius = this.enemy.radius;

        const ps = new BABYLON.ParticleSystem("charge", 2000, this.scene);
        this.particleSystem = ps;

        ps.particleTexture = GameState.asset.texture.charge.clone();
        ps.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;

        // サイズ・寿命
        ps.minSize = 0.2;
        ps.maxSize = 0.4;
        ps.minLifeTime = 0.4;
        ps.maxLifeTime = 0.6;

        // 色（淡い光）
        ps.color1 = new BABYLON.Color4(0.0, 0.9, 1.0, 0.6);
        ps.color2 = new BABYLON.Color4(0.0, 0.7, 0.9, 0.4);
        ps.colorDead = new BABYLON.Color4(0.0, 0.1, 0.5, 0.0);

        // エミッター位置：敵の動きに同期
        ps.emitter = this.enemy.mesh.position;

        // カスタムエミッター：足元の円周から発生
        const emitter = new BABYLON.CustomParticleEmitter();
        ps.particleEmitterType = emitter;
        emitter.particlePositionGenerator = (index, particle, out) => {
            const angle = Math.random() * 2 * Math.PI;
            out.x = Math.cos(angle) * radius;
            out.z = Math.sin(angle) * radius;
            out.y = -radius;       //足元から湧き上がる
        };
        // 方向：真上に吹き上げる
        emitter.particleDirectionGenerator = (index, particle, out) => {
            out.copyFrom(up);
        };
        // 速度：真上に加速する
        ps.minEmitPower = 2.5;
        ps.maxEmitPower = 2.5;
        ps.gravity = up.scale(3.0);

        // ◆パーティクルが一つも無くなったらパーティクルシステムを dispose
        this._particleObserver = this.scene.onBeforeRenderObservable.add(() => {
             if (!this.particleSystem.isStarted() && this.particleSystem.getActiveCount() === 0) {
                this.particleSystem.stop(); //念のため
                this.particleSystem.dispose();
                this.particleSystem = null;
                this.scene.onBeforeRenderObservable.remove(this._particleObserver);
             }
        });

        ps.emitRate = 150;
        ps.start();
    }

    update(time, delta){
        // ここで intensity に応じて emitRate や速度を上げても良い
    }

    stop(){
        this.particleSystem.stop();
    }

    dispose(){
        // [注] 複数の ParticleSystem が同じ Texture を共有していると
        // -> 急に dispose() すると Texture や内部バッファが破棄
        // -> 他の ParticleSystem から参照不能になる
        // 共有Textureは clone() して使うこと

        // if (this.particleSystem) {
        //     this.particleSystem.stop();
        //     this.particleSystem.dispose();
        //     this.particleSystem = null;
        // }
        // [注] いきなり dispose すると 全てのパーティクルが
        //    突然消えるので、onBeforeRenderObservable を使って
        //    パーティクルが無くなった後で disposeする
 
        super.dispose();
    }
} // End of ChargeStateEffect

class RushStateEffect extends StateEffect {
    constructor(enemy){
        super(enemy);
        this.enemy = enemy;
        this.scene = enemy.scene;
        this.particleSystem = null;
    }

    start(){
        const forward = this.enemy.get_forward_vector().normalize();

        const ps = new BABYLON.ParticleSystem("rush", 1500, this.scene);
        this.particleSystem = ps;

        ps.particleTexture = GameState.asset.texture.rush.clone();
        ps.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;

        ps.minSize = 0.15;
        ps.maxSize = 0.35;
        ps.minLifeTime = 0.3;
        ps.maxLifeTime = 0.6;

        ps.color1 = new BABYLON.Color4(1.0, 0.5, 0.1, 0.6);
        ps.color2 = new BABYLON.Color4(0.8, 0.3, 0.1, 0.4);
        ps.colorDead = new BABYLON.Color4(0.4, 0.1, 0.0, 0.0);

        // 発生位置：敵の中心
        ps.emitter = this.enemy.mesh.position;

        // ★逆方向に噴射
        const back = forward.scale(-1);
        ps.direction1 = back.scale(1.0);
        ps.direction2 = back.scale(2.0);

        ps.minEmitPower = 1.0;
        ps.maxEmitPower = 2.0;

        ps.emitRate = 300;
        // ps.gravity = BABYLON.Vector3.Zero();
        ps.gravity = new BABYLON.Vector3(0,1,0).scale(5.0);

        // ◆パーティクルが一つも無くなったらパーティクルシステムを dispose
        this._particleObserver = this.scene.onBeforeRenderObservable.add(() => {
             if (!this.particleSystem.isStarted() && this.particleSystem.getActiveCount() === 0) {
                this.particleSystem.stop(); //念のため
                this.particleSystem.dispose();
                this.particleSystem = null;
                this.scene.onBeforeRenderObservable.remove(this._particleObserver);
             }
        });

        ps.start();
    }

    update(time, delta){
        // enemy の移動に追従するなら emitter を更新しても良い
    }

    stop(){
        this.particleSystem.stop();
    }

    dispose(){
        super.dispose();
    }
} // End of RushStateEffect

class ThunderStateEffect extends StateEffect {
    constructor(enemy){
        super(enemy);
        this.enemy = enemy;
        this.sprite = null;
        this.counter = 0;
        this.index = 0;
    }

    start(){
        const disp_ratio = 1.00;
        this.sprite = new BABYLON.Sprite("thunder", GameState.asset.sprite.thunder);
        this.sprite.cellIndex = 0;
        this.sprite.width = this.enemy.params.anger.thunder_area * disp_ratio; //大きさ
        this.sprite.height= this.enemy.params.anger.thunder_area * disp_ratio;
        this.sprite.position = this.enemy.mesh.position;
    }

    update(time, delta){
        this.counter += delta;
        if (this.counter > 50){ //アニメーション間隔
            this.counter = 0;
            this.index = this.index >= 3 ? 0 : this.index + 1;
            this.sprite.cellIndex = this.index;
        }        
    }

    stop(){
    }

    dispose(){
        this.sprite.dispose();
        this.sprite = null;
        super.dispose();
    }
} // End of ThunderStateEffect


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

        const {left, top} = MyMath.clamp_ui_object(screen_pos.x - HP_BAR_WIDTH / 2, screen_pos.y - HP_BAR_HEIGHT / 2,
             HP_BAR_PADDING, HP_BAR_PADDING, HP_BAR_WIDTH, HP_BAR_HEIGHT);

        // 外枠の位置
        this.hpFrame.left = left;
        this.hpFrame.top = top;

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