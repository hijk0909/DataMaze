// enemy_9.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from "../GameState.js";
import { EnemyGeo } from "./base_enemy_geo.js";
import { ENEMY_STATE } from "./base_enemy.js";

const NUM_OUTER_CUBES = 17;
const NUM_INNER_CUBES = 11;

const STATE_CHASE_PERIOD    = 3;
const STATE_CHARGE_PERIOD   = 2;
const STATE_THUNDER_PERIOD   = 2;
const STATE_IDLE_PERIOD     = 5;

// ラスボス
export class Enemy_9 extends EnemyGeo {

    constructor(scene){
        super(scene);
        this.radius = 0.6;
        this.mass = 3.0;
        this.hp_max = this.hp = 500;
        this.recovery_point = 100;

        this.params.territory = 2.0;
        this.params.damage.shot_knockback = 0.2;
        this.params.speed.chase = 0.005;
        this.params.speed.accel = 0.001;
        this.params.anger.is_valid = false;
        this.params.confuse.is_valid = false;
        this.params.anger.charge_period = STATE_CHARGE_PERIOD;
        this.params.anger.thunder_period = STATE_THUNDER_PERIOD;
        this.params.anger.thunder_area = 4.0;
        this.params.anger.thunder_damage = 5.0;
        this.params.idle.period = STATE_IDLE_PERIOD;

        this.outer_cubes = [];
        this.inner_cubes = [];
        this.outer_dphi = 0;
        this.inner_dphi = 0;
        this.orbit_accel = 1.0;
        this.orbit_expansion = 1.0;
        this.rotation_accel = 1.0;
    }

    create(position, id, type=null){

        const container = GameState.asset.mesh.enemy_9;
        const inst = container.instantiateModelsToScene( (name) => `${name}_enemy_9_${id}` );

        const DISP_SCALE = 0.6;
        this.mesh = inst.rootNodes[0];
        this.mesh.scaling = new BABYLON.Vector3(DISP_SCALE, DISP_SCALE, DISP_SCALE);
        this.mesh.position = position.clone();

        this.mesh.ellipsoid = new BABYLON.Vector3(0.8, 0.8, 0.8);
        this.mesh.checkCollisions = true;
        // this.create_debug_ellipsoid(this.mesh.ellipsoid); //[DEBUG]

        this.delta_y = 0.5;
        this.cubes_center = this.mesh.position.clone();
        this.create_cubes();

        super.create(type);
    }

    // ゴールデンスパイラル（Fibonacci spiral on sphere）で球面上の点を均等に配置
    // theta:極角（緯度） phi:方位角（経度）
    get_golden_spiral_angles(N, i) {
        const goldenRatio = (1 + Math.sqrt(5)) / 2;  // ≈ 1.6180339887

        // 極角 theta（+Z軸からの角度、北極が0°、南極が180°）
        const thetaRad = Math.acos(1 - 2 * (i + 0.5) / N);
        const thetaDeg = thetaRad * (180 / Math.PI);

        // 方位角 phi（黄金比による均等分布）
        const phiRad = 2 * Math.PI * i / goldenRatio;
        let phiDeg = phiRad * (180 / Math.PI);

        // 0〜360° の範囲に正規化
        phiDeg = phiDeg % 360;
        if (phiDeg < 0) phiDeg += 360;

        return { theta: thetaDeg, phi: phiDeg };
    }

    // 与えられた球面パラメータとY軸周りの回転角から、ワールド座標 (Vector3) を計算
    get_position_on_sphere(center, radius, theta, phi, dPhi) {
        // theta, phi をラジアンに変換
        const thetaRad = theta * (Math.PI / 180);
        const phiRad = (phi + dPhi) * (Math.PI / 180);  // dPhi で全体回転

        // 球面座標 → 直交座標（Babylon.js座標系: Y-up）
        const x = radius * Math.sin(thetaRad) * Math.sin(phiRad);
        const y = radius * Math.cos(thetaRad);                    // 北極=+Y
        const z = radius * Math.sin(thetaRad) * Math.cos(phiRad);

        return center.add(new BABYLON.Vector3(x, y, z));
    }

    create_cubes(){
        const outer_mat = new BABYLON.PBRMaterial("enemy_9_outer_cube_material", this.scene); 
        outer_mat.albedoColor = new BABYLON.Color3(0.0, 0.8, 1.0);
        outer_mat.metallic = 1.0;
        outer_mat.roughness = 0.3;
        outer_mat.alpha = 0.8;

        const inner_mat = new BABYLON.PBRMaterial("enemy_9_inner_cube_material", this.scene); 
        inner_mat.albedoColor = new BABYLON.Color3(1.0, 0.0, 0.0);
        inner_mat.metallic = 1.0;
        inner_mat.roughness = 0.4;
        inner_mat.alpha = 0.9;

        for ( let i = 0 ; i < NUM_OUTER_CUBES ; i++){
            const mesh = BABYLON.MeshBuilder.CreateBox("enemy_9_outer_cube", { size: 0.4 }, this.scene);
            const {theta, phi} = this.get_golden_spiral_angles(NUM_OUTER_CUBES, i);
            mesh.position = this.mesh.position.clone();
            mesh.checkCollisions = false;
            mesh.metadata = { theta : theta, phi : phi };
            mesh.material = outer_mat;
            this.outer_cubes.push(mesh);
        }

        for ( let i = 0 ; i < NUM_OUTER_CUBES ; i++){
            const mesh = BABYLON.MeshBuilder.CreateBox("enemy_9_inner_cube", { size: 0.3 }, this.scene);
            const {theta, phi} = this.get_golden_spiral_angles(NUM_INNER_CUBES, i);
            mesh.position = this.mesh.position.clone();
            mesh.checkCollisions = false;
            mesh.metadata = { theta : theta, phi : phi };
            mesh.material = inner_mat;
            this.inner_cubes.push(mesh);
        }
    }

    update_cubes(time, delta){
        this.cubes_center.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);
        this.outer_dphi += this.orbit_accel * delta / 9;
        this.outer_orbit_radius = 1.5;
        for (const cube of this.outer_cubes) {
            const pos = this.get_position_on_sphere(this.cubes_center, this.outer_orbit_radius * this.orbit_expansion, cube.metadata.theta, cube.metadata.phi, this.outer_dphi);
            cube.rotation.z += this.rotation_accel * delta / 500;
            cube.rotation.x += this.rotation_accel * delta / 450;
            cube.position = pos;
        }
        this.inner_dphi -= this.orbit_accel * delta / 5;
        this.inner_orbit_radius = 1.2;
        for (const cube of this.inner_cubes) {
            const pos = this.get_position_on_sphere(this.cubes_center, this.inner_orbit_radius * this.orbit_expansion, cube.metadata.theta, cube.metadata.phi, this.inner_dphi);
            cube.rotation.z += this.rotation_accel * delta / 1000;
            cube.rotation.x += this.rotation_accel * delta / 900;
            cube.position = pos;
        }
    }

    on_chase_enter(state){
        state.hasTimeout = true;
        state.timer = STATE_CHASE_PERIOD;
        this.params.damage.shot_weakness = 0.1;
        this.damage_magnification = 0.1;
        this.orbit_expansion = 1.0;
        this.orbit_accel = 1.0;
        this.rotation_accel = 1.0;
    }
    on_chase_timeout(state){
        this.change_state(ENEMY_STATE.CHARGE);
    }

    on_charge_enter(state){
        state.hasTimeout = true;
        state.timer = STATE_CHARGE_PERIOD;
        this.damage_magnification = 2.0;
        this.state_counter = 0;
    }
    on_charge_update(state, time, delta){
        this.state_counter += delta / 1000;
        const r = Math.min(1.0, this.state_counter / STATE_CHARGE_PERIOD);
        this.orbit_expansion = BABYLON.Scalar.Lerp(1.0, 0.0, r);
        this.orbit_accel = BABYLON.Scalar.Lerp(1.0, 3.0, r);
        this.rotation_accel = BABYLON.Scalar.Lerp(1.0, 5.0, r);
    }
    on_charge_timeout(state){
        this.change_state(ENEMY_STATE.THUNDER);        
    }

    on_idle_enter(state){
        this.state_counter = 0;
        this.params.damage.shot_weakness = 0.2;
        this.damage_magnification = 1.0;
    }
    on_idle_update(state, time, delta){
        this.state_counter += delta / 1000;
        const r = Math.min(1.0, this.state_counter / STATE_IDLE_PERIOD);
        this.orbit_expansion = BABYLON.Scalar.Lerp(0.0, 1.0, r);
        this.orbit_accel = BABYLON.Scalar.Lerp(0.0, 1.0, r);
        this.rotation_accel = BABYLON.Scalar.Lerp(0.0, 1.0, r);
    }

    update(time, delta){
        this.update_cubes(time, delta);
        super.update(time, delta);
    }

    dispose(){
        for (const cube of this.outer_cubes) {
            cube.dispose();
        }
        this.outer_cubes = null;
        for (const cube of this.inner_cubes) {
            cube.dispose();
        }
        this.inner_cubes = null;
        super.dispose();
    }
}