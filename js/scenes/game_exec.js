// game_exec.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from '../GameState.js';
import { Eff_Firework } from '../objects/eff_firework.js';
import { Eff_Extinction } from '../objects/eff_extinction.js';
import { Eff_Text } from '../objects/eff_text.js';

const IMPULSE_RATIO = 10;

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
                this.check_collision(enemy, GameState.player, true);
                // check_collision の第３引数 == ture　はダメージ判定あり
                if (enemy.hp <= 0){
                    enemy.alive = false;
                    GameState.add_score(1000);
                    const eff = new Eff_Firework(this.scene);
                    eff.create(enemy.mesh.position);
                    GameState.effects.push(eff);
                    GameState.asset.se.explosion.play_3D(enemy, this.scene);

                    // アイテムドロップ
                    const itm = GameState.spawn.spawn_item("Item_Feed", enemy.mesh.position);
                    itm.drop();
                }
            }
        }

        // 敵同士の当たり判定
        for (let i = 0; i < GameState.enemies.length - 1; i++){
            const obj1 = GameState.enemies[i];
            for (let j = i + 1; j < GameState.enemies.length; j++){
                const obj2 = GameState.enemies[j];
                this.check_collision(obj1, obj2, false);
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

                    enemy.subtract_hp(bullet.strength);
                    enemy.flash();

                    if (enemy.hp <= 0){
                        enemy.alive = false;
                        GameState.add_score(1000);
                        const eff = new Eff_Firework(this.scene);
                        eff.create(enemy.mesh.position);
                        GameState.effects.push(eff);
                        GameState.asset.se.explosion.play_3D(enemy, this.scene);

                        // [TEST] アイテムドロップ
                        const itm = GameState.spawn.spawn_item("Item_Feed", enemy.mesh.position);
                        itm.drop();
                    } 
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

        // 障害物の管理
        for (let i = GameState.obstacles.length - 1; i >= 0; i--) {
            const obs = GameState.obstacles[i];
            obs.update(time, delta);
            if (!obs.isAlive()) {
                obs.dispose();
                GameState.obstacles.splice(i, 1);
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

    } // End of update

    // 自弾と敵の当たり判定
    check_bullet_hit(bullet, enemy){
        const distance = BABYLON.Vector3.Distance(bullet.sprite.position, enemy.mesh.position);
        // console.log("bullet_hit:", distance, bullet.radius, enemy.radius);
        return (distance < bullet.radius + enemy.radius);
    }

    // Movableクラス間の当たり判定
    check_collision(obj1, obj2, dmg_flg){
        const distance = BABYLON.Vector3.Distance(obj1.mesh.position, obj2.mesh.position);
        if (distance < obj1.radius + obj2.radius){

            // 衝突方向を計算
            let normal;
            const diff = obj1.mesh.position.subtract(obj2.mesh.position);
            if (diff.length() === 0) {
                normal = new BABYLON.Vector3(0,0,1);
            } else {
                normal = diff.normalize();
            }

            // 重なりを解消
            const overlap = (obj1.radius + obj2.radius) - distance;
            obj1.mesh.position.addInPlace(normal.scale(overlap * 0.5));
            obj2.mesh.position.addInPlace(normal.scale(- overlap * 0.5));

            // 運動量を交換
            const relative = obj1.velocity.subtract(obj2.velocity);
            const dot = BABYLON.Vector3.Dot(relative, normal);
            if (dot < 0) {
                const impulse = (2 * dot) / (obj1.mass + obj2.mass) * GLOBALS.IMPULSE_RATIO;
                obj1.add_impulse(normal.scale(impulse * obj2.mass * (-1)));
                obj2.add_impulse(normal.scale(impulse * obj1.mass));
                // ◆ 敵と自機との当たり判定
                if (dmg_flg){
                    // obj1 = 敵、obj2 = 自機 であること
                    GameState.asset.se.collision.play_3D(obj1, this.scene); // 3D音声
                    // console.log("obj1:", obj1.mesh.position, GameState.enemies.length);
                    const enemy_additional_damage = obj1.add_damage(Math.abs(impulse * obj2.mass), relative.scale(-1));
                    if ( enemy_additional_damage > 0){
                        // console.log("ATTACK +",enemy_additional_damage, "/", Math.abs(impulse * obj2.mass));
                        const eff = new Eff_Text(this.scene);
                        eff.create(obj1.mesh.position, `BACKSTUB! +${enemy_additional_damage}`, "#ffffff");
                        GameState.effects.push(eff);
                    }
                    obj1.flash(); // 点滅させる
                    const player_additional_damage = obj2.add_damage(Math.abs(impulse * obj1.mass), relative.scale(-1));
                    if  ( player_additional_damage > 0){
                        // console.log("DAMAGE +",player_additional_damage, "/",Math.abs(impulse * obj1.mass));
                        const eff = new Eff_Text(this.scene);
                        eff.create(obj2.mesh.position, `BACKSTUBBED -${player_additional_damage}`, "#ff0000");
                        GameState.effects.push(eff);
                    }
                }
            }
        }
    }
}