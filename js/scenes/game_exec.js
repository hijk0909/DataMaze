// game_exec.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from '../GameState.js';
import { Eff_Firework } from '../objects/eff_firework.js';
import { Eff_Extinction } from '../objects/eff_extinction.js';
import { Eff_Text } from '../objects/eff_text.js';

const OVERLAP_REPULSION_COEFFICIENT = 1.2;

export class Exec {
    constructor(scene) {
        this.scene = scene;
    }

    update(time, delta){

        // 自機の更新
        if (GameState.player){
            GameState.player.update(time, delta);
        }

        // 敵の管理
        for (let i = GameState.enemies.length - 1; i >= 0; i--) {
            const enemy = GameState.enemies[i];

            enemy.update(time, delta);
            if (!enemy.isAlive()) {
                enemy.dispose();
                GameState.enemies.splice(i, 1);
                continue;
            }

            // 敵と自機との当たり判定
            if (GameState.player.alive){
                const impulse = this.check_collision(enemy, GameState.player);
                if (impulse){
                    this.process_damage(enemy, GameState.player, impulse);
                }
                if (enemy.hp <= 0){
                    enemy.alive = false;
                    GameState.add_score(1000);
                    const eff = new Eff_Firework(this.scene);
                    eff.create(enemy.mesh.position);
                    GameState.effects.push(eff);
                    GameState.asset.se.explosion.play_3D(enemy, this.scene);

                    // アイテムドロップ
                    this.drop_item(enemy);
                }
            }
        }

        // 敵同士の当たり判定
        for (let i = 0; i < GameState.enemies.length - 1; i++){
            const obj1 = GameState.enemies[i];
            for (let j = i + 1; j < GameState.enemies.length; j++){
                const obj2 = GameState.enemies[j];
                this.check_collision(obj1, obj2);
            }
        }

        // 自弾の管理
        for (let i = GameState.bullets.length - 1; i >= 0; i--) {
            const bullet = GameState.bullets[i];

            bullet.update(time, delta);

            if (!bullet.isAlive()) {
                bullet.dispose();
                GameState.bullets.splice(i, 1);
                continue;
            }

            // 自弾と敵との当たり判定
            for (let j = 0; j < GameState.enemies.length; j++){
                const enemy = GameState.enemies[j];
                if (this.check_bullet_hit(bullet, enemy)){
                    bullet.alive = false;

                    const eff_ext = new Eff_Extinction(this.scene);
                    eff_ext.create(bullet.sprite.position);
                    GameState.effects.push(eff_ext);

                    enemy.shot_from_player(bullet.strength, bullet.direction, bullet.mass);
                    enemy.flash();

                    if (enemy.hp <= 0){
                        enemy.alive = false;
                        GameState.add_score(1000);
                        const eff = new Eff_Firework(this.scene);
                        eff.create(enemy.mesh.position);
                        GameState.effects.push(eff);
                        GameState.asset.se.explosion.play_3D(enemy, this.scene);

                        // アイテムドロップ
                        this.drop_item(enemy);
                    } 
                }
            }

            // 自弾とギミックとの当たり判定
            for (let j = 0; j < GameState.gimmicks.length; j++){
                const gimmick = GameState.gimmicks[j];
                if (this.check_hit(bullet.sprite.position, bullet.radius, gimmick.mesh.position, gimmick.radius)){
                    bullet.alive = false;

                    const eff_ext = new Eff_Extinction(this.scene);
                    eff_ext.create(gimmick.mesh.position);
                    GameState.effects.push(eff_ext);

                    gimmick.shot();
                }
            }
        }
        
        // アイテムの管理
        for (let i = GameState.items.length - 1; i >= 0; i--) {
            const item = GameState.items[i];
            item.update(time, delta);
            if (!item.isAlive()) {
                item.dispose();
                GameState.items.splice(i, 1);
                continue;
            }

            if (GameState.player.alive){
                // 自機との当たり判定（中心間距離で判定）
                const requiredDistance = GameState.player.radius + item.radius;
                const distance = BABYLON.Vector3.Distance(
                        GameState.player.mesh.position, 
                        item.mesh.position
                );
                if (distance < requiredDistance){
                    item.activate();
                }
            }
        }

        // 小道具の管理
        for (let i = GameState.props.length - 1; i >= 0; i--) {
            const obs = GameState.props[i];
            obs.update(time, delta);
            if (!obs.isAlive()) {
                obs.dispose();
                GameState.props.splice(i, 1);
                continue;
            }
        }

        // 画面効果の管理
        for (let i = GameState.effects.length - 1; i >= 0; i--) {
            const eff = GameState.effects[i];
            eff.update(time, delta);
            if (!eff.isAlive()) {
                eff.dispose();
                GameState.effects.splice(i, 1);
                continue;
            }
        }

        // ギミックの管理
        for (let i = GameState.gimmicks.length - 1; i >= 0; i--) {
            const gimmick = GameState.gimmicks[i];
            gimmick.update(time, delta);
            if (!gimmick.isAlive()) {
                gimmick.dispose();
                GameState.gimmicks.splice(i, 1);
                continue;
            }

            // ギミックと自機の当たり判定
            if (this.check_hit(GameState.player.mesh.position, GameState.player.radius, gimmick.mesh.position, gimmick.radius)){
                gimmick.activate();
            }
        }

    } // End of update

    // アイテムのドロップ
    drop_item(enemy) {

        let drop_item_id = null;

        const dropList = enemy.params.drops;
        if (!dropList || dropList.length === 0) return;

        // 重み付け抽選（ルーレット法）
        const totalWeight = dropList.reduce((sum, item) => sum + item.weight, 0);
        let random = Math.random() * totalWeight;
        for (const item of dropList) {
            if (random < item.weight) {
                drop_item_id = item.id;
                break;
            }
            random -= item.weight;
        }

        // アイテムの生成とドロップ設定
        if (drop_item_id){
            const itm = GameState.spawn.spawn_item(drop_item_id, enemy.mesh.position);
            itm.drop();
            if (drop_item_id === "Item_Feed"){
                itm.set_recovery_point(enemy.recovery_point);
            }
        }
    }

    // 汎用の当たり判定
    check_hit(pos1, rad1, pos2, rad2){
        const distance = BABYLON.Vector3.Distance(pos1, pos2);
        return (distance < rad1 + rad2);
    }

    // 自弾と敵の当たり判定
    check_bullet_hit(bullet, enemy){
        const distance = BABYLON.Vector3.Distance(bullet.sprite.position, enemy.mesh.position);
        // console.log("bullet_hit:", distance, bullet.radius, enemy.radius);
        return (distance < bullet.radius + enemy.radius);
    }

    // Movableクラス間の当たり判定
    check_collision(obj1, obj2){
        const distance = BABYLON.Vector3.Distance(obj1.mesh.position, obj2.mesh.position);
        let normal = null;
        let impulse = null;
        if (distance < obj1.radius + obj2.radius){
            // 衝突方向（normal は、obj1 から見た obj2 の相対位置）
            const diff = obj2.mesh.position.subtract(obj1.mesh.position);
            if (diff.length() === 0) {
                normal = new BABYLON.Vector3(0,0,-1);
            } else {
                normal = diff.normalize();
            }

            // 重なり解決（速度ベクトル更新）
            const overlap = (obj1.radius + obj2.radius) - distance;
            const overlap_repulsion = normal.scale(overlap * OVERLAP_REPULSION_COEFFICIENT); // overlap比例の反発係数
            obj1.add_impulse(overlap_repulsion.scale(-1));
            obj2.add_impulse(overlap_repulsion);

            // 運動量を交換 (velocity_relative は obj1 から見た obj2 の相対速度)
            const velocity_relative = obj2.velocity.subtract(obj1.velocity);
            const dot = BABYLON.Vector3.Dot(velocity_relative, normal);
            const e = 1.0; //e=1.0:完全弾性、e=0.0:完全非弾性
            impulse = normal.scale(-(1+e) * dot / (1/obj1.mass + 1/obj2.mass));
            obj1.add_impulse( impulse.scale(-1));
            obj2.add_impulse( impulse );
        }
        return impulse;
    }

    // 敵機と自機のダメージ処理
    process_damage(enemy, player, impulse){

        // ◆敵機のダメージ処理
        const {damage : enemy_damage, backstub : enemy_backstub} = enemy.add_damage(impulse);
        if ( enemy_damage > 0){
            GameState.asset.se.collision.play_3D(enemy, this.scene); // 3D音声
            enemy.flash() //点滅
            enemy.count_attack(true); //「衝突」によるダメージ付与
        }
        if ( enemy_backstub > 0){
            const size = enemy_backstub / 10;
            const eff = new Eff_Text(this.scene);
            eff.create(enemy.mesh.position, `BACKSTUB! +${enemy_backstub}`, "#ffffff", size);
            GameState.effects.push(eff);
        }
        // ◆自機のダメージ処理
        const {damage : player_damage, backstub : player_backstub} = player.add_damage(impulse.scale(-1), enemy.attack_magnification);
        if  ( player_backstub > 0){
            const eff = new Eff_Text(this.scene);
            eff.create(player.mesh.position, `BACKSTUBBED -${player_backstub}`, "#ff0000");
            GameState.effects.push(eff);
        }
    }
}