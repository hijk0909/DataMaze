// enemy_8.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from "../GameState.js";
import { EnemyGeo } from "./base_enemy_geo.js";
import { ENEMY_STATE } from "./base_enemy.js";
import { MyMath } from "../utils/MathUtils.js";

const DIR_UP    = 0;
const DIR_RIGHT = 1;
const DIR_DOWN  = 2;
const DIR_LEFT  = 3;

// ウィルオーウィスプ
export class Enemy_8 extends EnemyGeo {

    constructor(scene){
        super(scene);
        this.radius = 0.2;
        this.mass = 0.3;
        this.hp_max = this.hp = 60;

        this.params.speed.chase = 0.1;
        this.params.speed.accel = 0.03;

        this.id = null;
        this.target_cell = {x:0, y:0};
        this.target_pos = null;
        this.direction = DIR_UP;
    }

    create(position, id){

        // メッシュ
        const container = GameState.asset.mesh.enemy_8;
        const inst = container.instantiateModelsToScene( (name) => `${name}_enemy_8_${id}` );

        const DISP_SCALE = 0.3;
        this.mesh = inst.rootNodes[0];
        this.mesh.scaling = new BABYLON.Vector3(DISP_SCALE, DISP_SCALE, DISP_SCALE);
        this.mesh.position = position.clone();
        this.mesh.ellipsoid = new BABYLON.Vector3(0.1, 0.1, 0.1);
        this.mesh.checkCollisions = true; //障害物との衝突判定

        // マテリアル
        this.outer_ball = inst.rootNodes[0].getChildMeshes().find(mesh => mesh.name.includes("outer_ball"));
        if (this.outer_ball && this.outer_ball.material) {
            const outer_mat = this.outer_ball.material;
            if (outer_mat instanceof BABYLON.PBRMaterial) {
                outer_mat.albedoColor = new BABYLON.Color3(0, 0.5, 1);
                outer_mat.metallic = 0.2;
                outer_mat.roughness = 0.2;
                outer_mat.alpha = 0.5;
                outer_mat.transparencyMode = BABYLON.PBRMaterial.PBR_ALPHABLEND; 
            }
        }
        this.inner_ball = inst.rootNodes[0].getChildMeshes().find(mesh => mesh.name.includes("inner_ball"));
        if (this.inner_ball && this.inner_ball.material) {
            const inner_mat = this.inner_ball.material;
            if (inner_mat instanceof BABYLON.PBRMaterial) {
                inner_mat.albedoColor = new BABYLON.Color3(0.7, 1, 1);
                inner_mat.metallic = 0.5;
                inner_mat.roughness = 1.0;
                inner_mat.alpha = 1.0;
            }
        }

        super.create();

        // 状態を（WAITではなく）FREE に上書き
        this.id = id;
        this.change_state(ENEMY_STATE.FREE);
    }

    on_free_enter(){
        const cellPos = MyMath.world_to_cell(this.mesh.position);
        let cx = Math.floor(cellPos.x);
        let cy = Math.floor(cellPos.y);
        // console.log("on_free_enter:",this.id, cx, cy);
        while (GameState.map[cy - 1][cx] !== GLOBALS.MAP.ELEMENT.WALL && GameState.map[cy - 1][cx] !== GLOBALS.MAP.ELEMENT.EMPTY){
            cy--;
        }
        this.target_pos = MyMath.cell_to_world(cx, cy);
        this.target_cell.x = cx;
        this.target_cell.y = cy;
        this.direction = DIR_RIGHT;
    }
    
    change_target(){
        const DIR_VECTORS = [
            { dx:  0, dy: -1 }, // UP
            { dx:  1, dy:  0 }, // RIGHT
            { dx:  0, dy:  1 }, // DOWN
            { dx: -1, dy:  0 }, // LEFT
        ];
        const LEFT_HAND_RULE = [-1, 0, 1, 2];

        const cx = this.target_cell.x;
        const cy = this.target_cell.y;

        for (const offset of LEFT_HAND_RULE) {
            const nextDir = (this.direction + offset + 4) % 4;
            const { dx, dy } = DIR_VECTORS[nextDir];
            const nx = cx + dx;
            const ny = cy + dy;
            if (GameState.map[ny][nx] !== GLOBALS.MAP.ELEMENT.WALL && GameState.map[ny][nx] !== GLOBALS.MAP.ELEMENT.EMPTY) {
                this.target_cell.x = nx;
                this.target_cell.y = ny;
                this.target_pos = MyMath.cell_to_world(nx, ny);
                this.direction = nextDir;
                return;
            }
        }
        // 4方向すべて NG → 何もしない
    }

    update(time, delta){
        const toTarget = this.target_pos.subtract(this.mesh.position);
        const dir = toTarget.clone().normalize();
        this.control_velocity.addInPlace(dir.scale(this.params.speed.accel));
        if (this.control_velocity.length() > this.params.speed.chase) {
            this.control_velocity.normalize().scaleInPlace(this.params.speed.chase);
        }
        // console.log("Enemy_8:", this.id, toTarget.length());
        if ( toTarget.length() < 1.0){
            this.change_target();
        }
        super.update(time, delta);
    }

    dispose(){
        super.dispose();
    }
}