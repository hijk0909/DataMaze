// scenes/UI.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from "../GameState.js";
import { MyMath } from '../utils/MathUtils.js';
import { MyDraw } from '../utils/DrawUtils.js';

const FONT_SIZE = 48;
const FONT_HEIGHT = "52px";
const FONT_SPACING = 4;
const FONT_MSG_SIZE = 64;

const BAG_FONT_SIZE = 48;
const BAG_FONT_HEIGHT = "52px";
const BAG_FONT_COLOR = "white";
const BAG_FONT_SPACING = 4;

const BLINK_PERIOD = 2.0

const MSG_OFFSET_Y = -100;

export class UI {
    constructor() {
        // UI の生成
        this.ui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true);
        this.ui.layer.layerMask = GLOBALS.MASK_UI;
        this.ui.idealWidth = GLOBALS.UI.WIDTH;
        this.ui.idealHeight = GLOBALS.UI.HEIGHT;
        this.ui.renderAtIdealSize = true;

        this.minimap = null;

        this.bag = null;
        this.bag_view = null;
        this.bag_blink_manager = null;

        this.scoreText = null;
        this.hpText = null;
        this.massText = null;

        this.create();
    }

    create(){
        // ◆ ミニマップ
        this.minimap = new Minimap(this.ui);

        // ◆ バッグ
        this.bag = new Bag();
        this.bag_view = new BagView(this.ui);
        this.bag_blink = new BagBlink(this.bag, this.bag_view);

        // ◆ 左上固定のパネル（コンテナ）
        const panel = new BABYLON.GUI.StackPanel();
        panel.isVertical = true;
        panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        panel.verticalAlignment   = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        panel.paddingTop  = "10px";
        panel.paddingLeft = "10px";
        panel.spacing = FONT_SPACING; //行間(px)
        panel.fontFamily = "MyGameFont";
        this.ui.addControl(panel);
        this.panel = panel;

        const _createTextBlock = (panel, text, color) => {
            const tb = new BABYLON.GUI.TextBlock();
            tb.fontSize = FONT_SIZE;
            tb.height = FONT_HEIGHT;
            tb.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            tb.text = text;
            tb.color = color;
            panel.addControl(tb);
            return tb;
        };

        this.scoreText = _createTextBlock(panel, "SCORE", "white");
        this.hpText = _createTextBlock(panel, "HP", "white");
        this.massText = _createTextBlock(panel, "MASS", "white");
        this.speedText = _createTextBlock(panel, "SPEED", "white");
        this.shotSpeedText = _createTextBlock(panel, "Shot Speed", "cyan");
        this.shotPowerText = _createTextBlock(panel, "Shot Power", "cyan");
        this.numOfEnemiesText = _createTextBlock(panel, "ENEMIES", "orange");
        this.numOfItemsText = _createTextBlock(panel, "ITEMS", "orange");
        this.elapsedText = _createTextBlock(panel, "ELAPSED", "white");

        // ◆ ステータスメッセージ
        let tobj = new BABYLON.GUI.TextBlock();
        tobj.alpha = 0.0;
        tobj.fontSize = FONT_MSG_SIZE;
        this.ui.addControl(tobj);
        this.statusMessageText = tobj;
    }

    show_status_message(str, color="#ffffff"){
        this.statusMessageText.text = str;
        this.statusMessageText.color = color;
        this.statusMessageText.fontFamily = "MyGameFont";
        this.statusMessageText.fontSize = 80;
        MyDraw.set_text_center(this.statusMessageText, 0, MSG_OFFSET_Y);
    }

    hide_status_message(){
        this.statusMessageText.alpha = 0.0;
    }

    add_item(name) {
        const num = this.bag.add(name);

        this.bag_view.ensure_text(name, num);
        this.bag_view.update_text(name, num);

        this.bag_blink.start(name, "cyan");
    }

    remove_item(name) {
        const num = this.bag.remove(name);
        if (num > 0) {
            this.bag_view.update_text(name, num);
            this.bag_blink.start(name, "orange");
        } else {
            // アイテム数：1 → 0 の場合、赤く点滅してから消す
            this.bag_blink.start(name, "red",
                BLINK_PERIOD, () => { this.bag_view.remove_text(name);}
            );
        }
    }

    find_item(name) {
        return this.bag.find(name);
    }

    update(time, delta){
        this.scoreText.text = `SCORE: ${GameState.score}`;
        if (GameState.player){
            // console.log("GameState.player.hp", GameState.player.hp);
            this.hpText.text = `HP: ${Math.floor(GameState.player.hp)} / ${GameState.player.hp_max} (${GameState.player.hp_delta.toFixed(1)})`;
            this.massText.text = `MASS: ${GameState.player.mass.toFixed(1)} `;
            this.speedText.text = `SPEED: ${GameState.player.speed_max.toFixed(2)} `;
            this.shotSpeedText.text = `Shot Speed: ${GameState.player.shot_speed}`;
            this.shotPowerText.text = `Shot Power: ${GameState.player.shot_power.toFixed(1)}`;
        }

        this.numOfEnemiesText.text = `Enemies: ${GameState.enemies.length} / ${GameState.num_enemies}`;
        this.numOfItemsText.text = `Items: ${GameState.items.length - 1} / ${GameState.num_items}`;
        const elapsed_sec = Math.floor((time - GameState.start_time) / 1000);
        this.elapsedText.text = `Elapsed: ${Math.floor(elapsed_sec / 60).toString().padStart(2,'0')}:${(elapsed_sec % 60).toString().padStart(2,'0')}`

        this.minimap.update(time, delta);
        this.bag_blink.update(time, delta);
    }

    dispose(){
        if (this.scoreText){
            this.scoreText.dispose();
            this.scoreText = null;
        }
        if (this.hpText){
            this.hpText.dispose();
            this.hpText = null;
        }
        if (this.massText){
            this.massText.dispose();
            this.massText = null;
        }
        if (this.panel){
            this.panel.dispose();
            this.panel = null;
        }
        if (this.status_message){
            this.status_message.dispose();
            this.status_message = null;
        }
        this.minimap.dispose();
        this.ui.dispose();
    }
} // End of UI

class Minimap {
    constructor(ui){
        this.ui = ui;
        this.mapImage = null;
    }

    create() {
        // ミニマップ領域全体をまとめる「コンテナ」を作成
        const mapContainer = new BABYLON.GUI.Rectangle("mapContainer");
        mapContainer.width = "648px";
        mapContainer.height = "648px";
        // 枠線と背景を透明に
        mapContainer.thickness = 0;
        mapContainer.background = "transparent";
        // 回転した地図がコンテナからはみ出ないようにクリッピングを有効
        // mapContainer.clipChildren = false;
        // コンテナ自体の配置位置（画面右下）を指定
        mapContainer.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        mapContainer.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        mapContainer.paddingRight = "30px";
        mapContainer.paddingBottom = "30px";
        // コンテナをUIのルートに追加
        this.ui.addControl(mapContainer);
        // 地図画像を作成し、コンテナに追加
        const mapImage = new BABYLON.GUI.Image("minimapImage");
        mapImage.domImage = GameState.minimap_bitmap.getContext().canvas;
        // コンテナのサイズいっぱいに広げる
        mapImage.width = "300%";
        mapImage.height = "300%";
        mapImage.alpha = 0.6;
        // コンテナ内で中央揃え
        mapImage.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        mapImage.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        // コンテナに追加
        mapContainer.addControl(mapImage);
        this.mapImage = mapImage; 

        // 自機アイコン「▲」を作成し、コンテナの「一番上」に重ねる
        const createTriangleTexture = () => {
            const size = 64; // テクスチャのサイズ（2のべき乗推奨）
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            // 透明背景
            ctx.clearRect(0, 0, size, size);
            // 三角形を描画（上向き）
            ctx.fillStyle = 'red';
            ctx.beginPath();
            ctx.moveTo(size / 2, size * 0.2);      // 上の頂点
            ctx.lineTo(size * 0.2, size * 0.8);    // 左下の頂点
            ctx.lineTo(size * 0.8, size * 0.8);    // 右下の頂点
            ctx.closePath();
            ctx.fill();
            return canvas.toDataURL();
        };

        // 自機アイコン（三角形）を作成し、コンテナの中央に配置
        const playerIcon = new BABYLON.GUI.Image("playerIcon", createTriangleTexture());
        playerIcon.width = "24px";
        playerIcon.height = "24px";
        // コンテナの中央に配置
        playerIcon.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        playerIcon.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        // 自機アイコンをコンテナに追加
        mapContainer.addControl(playerIcon);
    }

    update(time, delta) {
        const mapImage = this.mapImage; // 保持しておいたGUI.Image
        // const tex = GameState.minimap_bitmap;
        // const texW = tex.getSize().width;
        // const texH = tex.getSize().height;

        // 自機のワールド座標をセル座標に変換
        const cellPos = MyMath.world_to_cell(GameState.player.mesh.position);
        // セル座標をテクスチャ上のピクセル座標に変換
        const pixelX = cellPos.x * GLOBALS.MAP.BITMAP.CELL_SIZE;
        const pixelY = cellPos.y * GLOBALS.MAP.BITMAP.CELL_SIZE;
        // UIの表示中心(P)が自機になるように切り出し位置を計算
        // Imageのサイズが648pxなので、その半分を引く
        mapImage.sourceLeft = pixelX - (648 / 2);
        mapImage.sourceTop = pixelY - (648 / 2);
        mapImage.sourceWidth = 648;
        mapImage.sourceHeight = 648;
        // 自機の向きに合わせて地図を回転させる
        // forwardベクトルから角度(radian)を取得。
        // ※自機が向いている方向を「上」にするため、角度をマイナスにする
        const angle = Math.atan2(GameState.player.forward.x, GameState.player.forward.z);
        mapImage.rotation = -angle; 
    }

    dispose(){
        // [TODO] minimap関連を完全にdiposeする（コンテナや自機アイコンなど）
        if (this.mapImage){
            this.mapImage.dispose();
            this.mapImage = null;
        }
    }
} // End of class Minimap

class Bag {
    constructor() {
        GameState.bag_items = new Map(); // name -> num
    }

    add(name) {
        const num = GameState.bag_items.get(name) ?? 0;
        GameState.bag_items.set(name, num + 1);
        return num + 1;
    }

    remove(name) {
        if (!GameState.bag_items.has(name)) return 0;

        const num = GameState.bag_items.get(name);
        if (num > 1) {
            GameState.bag_items.set(name, num - 1);
            return num - 1;
        } else {
            GameState.bag_items.delete(name);
            return 0;
        }
    }

    find(name) {
        return GameState.bag_items.has(name);
    }

    get_sorted_items() {
        return [...GameState.bag_items.entries()]
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([name, num]) => ({ name, num }));
    }
}

class BagView {
    constructor(ui) {
        this.ui = ui;

        this.panel = new BABYLON.GUI.StackPanel();
        this.panel.isVertical = true;
        this.panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.panel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.panel.paddingTop = "10px";
        this.panel.paddingLeft = "-10px";
        this.panel.spacing = BAG_FONT_SPACING; //行間(px)
        this.panel.fontFamily = "MyGameFont";

        this.ui.addControl(this.panel);

        this.textBlocks = new Map(); // name -> TextBlock
    }

    // TextBlock がなければ最下段に追加
    ensure_text(name, num) {
        if (this.textBlocks.has(name)) {
            this.update_text(name, num);
            return this.textBlocks.get(name);
        }

        const tb = new BABYLON.GUI.TextBlock();
        tb.text = (num >= 2) ? `${name}(${num})` : name;
        tb.color = BAG_FONT_COLOR;
        tb.fontSize = BAG_FONT_SIZE;
        tb.height = BAG_FONT_HEIGHT;
        tb.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;

        this.panel.addControl(tb); // 常に最下段に追加
        this.textBlocks.set(name, tb);
        return tb;
    }

    update_text(name, num) {
        const tb = this.textBlocks.get(name);
        if (!tb) return;
        tb.text = (num >= 2) ? `${name}(${num})` : name;
    }

    remove_text(name) {
        const tb = this.textBlocks.get(name);
        if (!tb) return;
        this.panel.removeControl(tb);
        this.textBlocks.delete(name);
    }

    get_text(name) {
        return this.textBlocks.get(name) ?? null;
    }

    // Blink 全終了時 に アイテムの表示位置を変更する
    rebuild_sorted(sortedItems) {
        this.panel.clearControls();
        this.textBlocks.clear();

        for (const { name, num } of sortedItems) {
            const tb = new BABYLON.GUI.TextBlock();
            tb.text = (num >= 2) ? `${name}(${num})` : name;
            tb.color = BAG_FONT_COLOR;
            tb.fontSize = BAG_FONT_SIZE;
            tb.height = BAG_FONT_HEIGHT;
            tb.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;

            this.panel.addControl(tb);
            this.textBlocks.set(name, tb);
        }
    }
}

class BagBlink {
    constructor(bag, bagView) {
        this.bag = bag;
        this.bag_view = bagView;
        this.blinks = [];
    }

    start(name, color, duration = BLINK_PERIOD, onEnd = null) {
        // console.log("blink start:", name, color, duration, onEnd);
        this.blinks.push({
            name,
            color,
            time: 0,
            duration,
            onEnd
        });
    }

    update(time, delta) {
        if (this.blinks.length === 0) return;

        for (let i = this.blinks.length - 1; i >= 0; i--) {
            const b = this.blinks[i];
            b.time += delta / 1000;

            const tb = this.bag_view.get_text(b.name);
            if (tb) {
                tb.color = b.color;
                const phase = Math.floor(b.time / 0.18) % 2;
                tb.alpha = (phase === 0) ? 1.0 : 0.0;
                tb._markAsDirty();
            }

            if (b.time >= b.duration) {
                if (tb) {
                    tb.alpha = 1.0;
                    tb.color = BAG_FONT_COLOR;
                }
                if (b.onEnd) b.onEnd();
                this.blinks.splice(i, 1);
            }
        }

        // 全点滅終了 → 正しい順序に正す
        if (this.blinks.length === 0) {
            this.bag_view.rebuild_sorted(
                this.bag.get_sorted_items()
            );
        }
    }
}