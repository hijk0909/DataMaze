// enemy_9.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from "../GameState.js";
import { EnemyGeo } from "./base_enemy_geo.js";
import { ENEMY_STATE } from "./base_enemy.js";

// ラスボス
export class Enemy_9 extends EnemyGeo {

    constructor(scene){
        super(scene);
        this.radius = 0.5;
        this.mass = 1.0;
        this.hp_max = this.hp = 500;
        this.recovery_point = 100;

        this.params.territory = 1.0;
        this.params.damage.shot_knockback = 0.5;
        this.params.speed.chase = 0.01;
        this.params.speed.accel = 0.001;
        this.params.anger.is_valid = false;
        this.params.confuse.is_valid = false;

        this.outer_cubes = [];
        this.inner_cubes = [];
        this.outer_dphi = 0;
        this.inner_dphi = 0;
    }

    create(position, id, type=null){

        const container = GameState.asset.mesh.enemy_9;
        const inst = container.instantiateModelsToScene( (name) => `${name}_enemy_9_${id}` );

        const DISP_SCALE = 0.5;
        this.mesh = inst.rootNodes[0];
        this.mesh.scaling = new BABYLON.Vector3(DISP_SCALE, DISP_SCALE, DISP_SCALE);
        this.mesh.position = position.clone();

        this.mesh.ellipsoid = new BABYLON.Vector3(0.8, 0.9, 0.8);
        this.mesh.checkCollisions = true;

        this.delta_y = 0.3;
        this.cubes_center = new BABYLON.Vector3(this.mesh.position.x, this.mesh.position.y + this.delta_y, this.mesh.position.z);
        this.create_cubes();

        super.create(type);
    }

    /* 軌道位置計算（Y=constantの高さで、XZ平面上の円軌道）
    * - 円の半径 r = sqrt(radius^2 - y^2) （球面上の緯度線）
    * - 角度は度単位、-Z方向を0度として時計回り/反時計回り（dPhiの符号で制御）。
    * - 呼出条件：|y| < radius
    */
    get_orbital_position(center, radius, y, phi, dPhi){
        const totalPhi = phi + dPhi;
        const phiRad = totalPhi * Math.PI / 180;  // ラジアンに変換

        const r = Math.sqrt(radius * radius - y * y);  // XZ平面の円半径

        const x = r * Math.sin(phiRad);  // X成分
        const z = -r * Math.cos(phiRad);  // Z成分（-Zを0度に調整）

        // 中心にY高さを加えて位置を返す
        return center.add(new BABYLON.Vector3(x, y, z));
    }

    create_cubes(){
        const outer_mat = new BABYLON.PBRMaterial("enemy_9_outer_cube_material", this.scene); 
        outer_mat.albedoColor = new BABYLON.Color3(0.0, 0.0, 1.0);
        outer_mat.metallic = 0.2;
        outer_mat.roughness = 0.7;
        outer_mat.alpha = 1.0;

        const mesh = BABYLON.MeshBuilder.CreateBox("enemy_9_outer_cube", { size: 0.4 }, this.scene);
        const pos = this.get_orbital_position(this.cubes_center, 1.0, 0.5, 0, 0);
        mesh.position = pos.clone();
        mesh.checkCollisions = false;
        mesh.orbit_y = 0.5;
        mesh.orbit_phi = 0;
        mesh.material = outer_mat;
        this.outer_cubes.push(mesh);

        const inner_mat = new BABYLON.PBRMaterial("enemy_9_inner_cube_material", this.scene); 
        outer_mat.albedoColor = new BABYLON.Color3(1.0, 0.0, 0.0);
        outer_mat.metallic = 0.2;
        outer_mat.roughness = 0.7;
        outer_mat.alpha = 1.0;

        const mesh1 = BABYLON.MeshBuilder.CreateBox("enemy_9_inner_cube", { size: 0.4 }, this.scene);
        const pos1 = this.get_orbital_position(this.cubes_center, 1.0, 0.5, 90, 0);
        mesh1.position = pos1.clone();
        mesh1.checkCollisions = false;
        mesh1.orbit_y = -0.5;
        mesh1.orbit_phi = 90;
        mesh1.material = inner_mat;
        this.inner_cubes.push(mesh1);

        const mesh2 = BABYLON.MeshBuilder.CreateBox("enemy_9_inner_cube", { size: 0.4 }, this.scene);
        const pos2 = this.get_orbital_position(this.cubes_center, 1.0, 0.5, 270, 0);
        mesh2.position = pos2.clone();
        mesh2.checkCollisions = false;
        mesh2.orbit_y = -0.5;
        mesh2.orbit_phi = 270;
        mesh2.material = inner_mat;
        this.inner_cubes.push(mesh2);
    }

    update_cubes(time, delta){
        this.cubes_center.set(this.mesh.position.x, this.mesh.position.y + this.delta_y, this.mesh.position.z);
        this.outer_dphi += delta / 10;
        for (const cube of this.outer_cubes) {
            const pos = this.get_orbital_position(this.cubes_center, 1.0, cube.orbit_y, cube.orbit_phi, this.outer_dphi);
            cube.position = pos;
        }
        this.inner_dphi -= delta / 5;
        for (const cube of this.inner_cubes) {
            const pos = this.get_orbital_position(this.cubes_center, 1.0, cube.orbit_y, cube.orbit_phi, this.inner_dphi);
            cube.position = pos;
        }
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