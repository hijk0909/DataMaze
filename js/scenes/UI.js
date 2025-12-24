
// scenes/UI.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from "../GameState.js";
import { MyMath } from '../utils/MathUtils.js';

const FONT_SIZE = 48;
const FONT_HEIGHT = "52px";
const FONT_SPACING = 4;
const FONT_MSG_SIZE = 64;
const MSG_OFFSET_Y = -100;

export class UI {
    constructor() {
        this.ui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true);
        this.ui.layer.layerMask = GLOBALS.MASK_UI;
        this.ui.idealWidth = 1920;
        this.ui.idealHeight = 1080;
        this.ui.renderAtIdealSize = true;
        this.scoreText = null;
        this.hpText = null;
        this.massText = null;
        this.mapImage = null;
        this.create();
    }

    create(){
        // ◆ 左上固定のパネル（コンテナ）
        const panel = new BABYLON.GUI.StackPanel();
        panel.isVertical = true;
        panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        panel.verticalAlignment   = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        panel.paddingTop  = "10px";
        panel.paddingLeft = "10px";
        panel.spacing = FONT_SPACING; //行間(px)
        this.ui.addControl(panel);
        this.panel = panel;

        // SCORE
        const scoreText = new BABYLON.GUI.TextBlock();
        scoreText.text = "SCORE 0";
        scoreText.color = "white";
        scoreText.fontSize = FONT_SIZE;
        scoreText.height = FONT_HEIGHT;
        scoreText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        panel.addControl(scoreText);
        this.scoreText = scoreText;

        // HP
        const hpText = new BABYLON.GUI.TextBlock();
        hpText.text = "HP 0";
        hpText.color = "white";
        hpText.fontSize = FONT_SIZE;
        hpText.height = FONT_HEIGHT;
        hpText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        panel.addControl(hpText);
        this.hpText = hpText;

        // MASS
        const massText = new BABYLON.GUI.TextBlock();
        massText.text = "MASS 0";
        massText.color = "white";
        massText.fontSize = FONT_SIZE;
        massText.height = FONT_HEIGHT;
        massText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        panel.addControl(massText);
        this.massText = massText;

        // ◆ ステータスメッセージ
        this.statusMessageText = new BABYLON.GUI.TextBlock();
        this.statusMessageText.alpha = 0.0;
        this.statusMessageText.fontSize = FONT_MSG_SIZE;
        this.statusMessageText.resizeToFit = true;
        this.statusMessageText.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.statusMessageText.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.ui.addControl(this.statusMessageText);
    }

    show_status_message(str, color="#ffffff"){
        this.statusMessageText.text = str;
        this.statusMessageText.color = color;
        this.statusMessageText.onAfterDrawObservable.addOnce(() => {
            const iw = GameState.ui_manager.ui.idealWidth;
            const ih = GameState.ui_manager.ui.idealHeight;
            const tw = this.statusMessageText.widthInPixels;
            const th = this.statusMessageText.heightInPixels;
            this.statusMessageText.left = iw /2 - tw /2;
            this.statusMessageText.top = ih /2 - th /2 + MSG_OFFSET_Y;
            this.statusMessageText.alpha = 1.0;
        });
    }

    hide_status_message(){
        this.statusMessageText.alpha = 0.0;
    }

    create_minimap() {
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

    update_minimap() {
        const mapImage = this.mapImage; // 保持しておいたGUI.Image
        const tex = GameState.minimap_bitmap;
        const texW = tex.getSize().width;
        const texH = tex.getSize().height;

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

    dispose_minimap(){
        // [TODO] minimap関連を完全にdiposeする（コンテナや自機など）
        if (this.mapImage){
            this.mapImage.dispose();
            this.mapImage = null;
        }
    }


    update(time, delta){
        this.scoreText.text = `SCORE: ${GameState.score}`;
        if (GameState.player){
            this.hpText.text = `HP: ${Math.floor(GameState.player.hp)} / ${GameState.player.hp_max}`;
            this.massText.text = `MASS: ${GameState.player.mass.toFixed(1)} `;
            this.update_minimap();
        }
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
        this.ui.dispose();
    }
}