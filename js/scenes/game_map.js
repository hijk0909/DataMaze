// game_map.js
import { GLOBALS } from '../GameConst.js';
import { GameState } from '../GameState.js';

export class Map {
    constructor(scene) {
        this.scene = scene;
        this.material_cage = null;
        this.material_corridor_wall = null;

        this.create();
    }

    create(){
      this.create_materials();
      this.create_map();

      for (let i = 0; i < GameState.rooms.length; i++){
        this.create_cage(GameState.rooms[i]);
      }
    }

    // マテリアルの生成（updateで変更を加える対象）
    create_materials(){
      // 部屋の檻
      this.material_cage = new BABYLON.StandardMaterial("lineMaterial", this.scene);
      this.material_cage.emissiveColor = new BABYLON.Color3(0.2, 0.8, 0.2); // 自己発光
      this.material_cage.disableLighting = true;
      this.material_cage.fogEnabled = false;

      // 通路の壁
      this.material_corridor_wall = new BABYLON.StandardMaterial(`matCorridorWall`, this.scene);
      this.material_corridor_wall.diffuseTexture = GameState.asset.texture.corridor_wall;
      // this.material_corridor_wall.emissiveTexture = GameState.asset.texture.corridor_wall;
    }

    // 格子状のカゴを生成
    create_cage(room){
        const scale = GLOBALS.MAP.CELL.SCALE;
        const inner_scale = 0.99;
        const offset = GLOBALS.MAP.CELL.SIZE * scale / 2;
        const cx = ((room.x + 1) + (room.w - 2) / 2) * scale - offset;
        const cz = (((room.y + 1) + (room.h - 2) / 2) * scale - offset)*(-1);
        const cy = (GLOBALS.MAP.ROOM.HEIGHT / 2) * scale;
        const u = 0.5;
        const wx = Math.floor((room.w - 2) / (2 * u)) * scale * inner_scale;
        const wz = Math.floor((room.h - 2) / (2 * u)) * scale * inner_scale;
        const wy = Math.floor(GLOBALS.MAP.ROOM.HEIGHT / (2 * u)) * scale * inner_scale;

        // console.log("create_cage:",room, "cx,cz,cy:", cx, cz, cy, "wx,wz,wy:",wx, wz, wy);

        const lines = [];

        for (let x = -wx * u + cx; x <= wx * u + cx; x += u) {
            // YZ面の上下左右の線（X固定）
            lines.push([
                new BABYLON.Vector3(x, -wy * u + cy, -wz * u + cz),
                new BABYLON.Vector3(x,  wy * u + cy, -wz * u + cz)
            ]);
            lines.push([
                new BABYLON.Vector3(x, -wy * u + cy,  wz * u + cz),
                new BABYLON.Vector3(x,  wy * u + cy,  wz * u + cz)
            ]);
            lines.push([
                new BABYLON.Vector3(x, -wy * u + cy, -wz * u + cz),
                new BABYLON.Vector3(x, -wy * u + cy,  wz * u + cz)
            ]);
            lines.push([
                new BABYLON.Vector3(x,  wy * u + cy, -wz * u + cz),
                new BABYLON.Vector3(x,  wy * u + cy,  wz * u + cz)
            ]);
        }

        for (let y = -wy * u + cy; y <= wy * u + cy; y += u) {
            // XZ面の上下左右の線（Y固定）
            lines.push([
                new BABYLON.Vector3(-wx * u + cx, y, -wz * u + cz),
                new BABYLON.Vector3( wx * u + cx, y, -wz * u + cz)
            ]);
            lines.push([
                new BABYLON.Vector3(-wx * u + cx, y,  wz * u + cz),
                new BABYLON.Vector3( wx * u + cx, y,  wz * u + cz)
            ]);
            lines.push([
                new BABYLON.Vector3(-wx * u + cx, y, -wz * u + cz),
                new BABYLON.Vector3(-wx * u + cx, y,  wz * u + cz)
            ]);
            lines.push([
                new BABYLON.Vector3( wx * u + cx, y, -wz * u + cz),
                new BABYLON.Vector3( wx * u + cx, y,  wz * u + cz)
            ]);
        }

        for (let z = -wz * u + cz; z <= wz * u + cz; z += u) {
            // XY面の上下左右の線（Z固定）
            lines.push([
                new BABYLON.Vector3(-wx * u + cx, -wy * u + cy, z),
                new BABYLON.Vector3( wx * u + cx, -wy * u + cy, z)
            ]);
            lines.push([
                new BABYLON.Vector3(-wx * u + cx,  wy * u + cy, z),
                new BABYLON.Vector3( wx * u + cx,  wy * u + cy, z)
            ]);
            lines.push([
                new BABYLON.Vector3(-wx * u + cx, -wy * u + cy, z),
                new BABYLON.Vector3(-wx * u + cx,  wy * u + cy, z)
            ]);
            lines.push([
                new BABYLON.Vector3( wx * u + cx, -wy * u + cy, z),
                new BABYLON.Vector3( wx * u + cx,  wy * u + cy, z)
            ]);
        }

        const cage = BABYLON.MeshBuilder.CreateLineSystem("grid", { lines: lines }, this.scene);
        cage.material = this.material_cage;

        // const glowLayer = new BABYLON.GlowLayer("glow", scene);
        // glowLayer.addIncludedOnlyMesh(grid);
    }

    // マップの生成
    create_map(){
      const result = generateDungeon();
      asciiPrint(result.map);

      const scene = this.scene;
      let mapSelected, rectangles, tmpMeshes, material;

      // 通路：天井・床
      mapSelected = map_selecter(result.map, [0,4]);
      rectangles = greedyTileMaxRectangles(mapSelected);

      const mat_corridor_floor = new BABYLON.StandardMaterial(`matCorridorFloor`, scene);
      mat_corridor_floor.diffuseColor = new BABYLON.Color3(0.7, 0.5, 0.5);
      tmpMeshes = makeBoxesForRectangles(rectangles, -0.5, 0.0, scene, mat_corridor_floor);
      const mesh_corridor_floor = mergeMeshGroup(tmpMeshes, "meshCorridorFloor", scene);

      const mat_corridor_ceiling = new BABYLON.StandardMaterial(`matCorridorCeiling`, scene);
      mat_corridor_ceiling.diffuseColor = new BABYLON.Color3(0.7, 0.5, 0.5);
      tmpMeshes = makeBoxesForRectangles(rectangles, GLOBALS.MAP.CORRIDOR.HEIGHT, GLOBALS.MAP.CORRIDOR.HEIGHT + 0.5, scene, mat_corridor_ceiling);
      const mesh_corridor_ceiling = mergeMeshGroup(tmpMeshes, "meshCorridorCeiling", scene);

      // 通路：壁
      mapSelected = map_selecter(result.map, [0]);
      rectangles = greedyTileMaxRectangles(mapSelected);
      tmpMeshes = makeBoxesForRectangles(rectangles, 0.0, GLOBALS.MAP.CORRIDOR.HEIGHT, scene, this.material_corridor_wall, true);
      const mesh_soil = mergeMeshGroup(tmpMeshes, "meshCorridorWall", scene);
      mesh_soil.isTerrain = true;

      // 部屋：天井・床
      mapSelected = map_selecter(result.map, [2,3]);
      rectangles = greedyTileMaxRectangles(mapSelected);

      const mat_room_floor = new BABYLON.StandardMaterial(`matRoomFloor`, scene);
      mat_room_floor.diffuseColor = new BABYLON.Color3(0.8, 0.8, 1.0);
      tmpMeshes = makeBoxesForRectangles(rectangles, -0.5, 0.0, scene, mat_room_floor);
      const mesh_room_floor = mergeMeshGroup(tmpMeshes, "meshRoomFloor", scene);

      const mat_room_ceiling = new BABYLON.StandardMaterial(`matRoomCeiling`, scene);
      mat_room_ceiling.diffuseColor = new BABYLON.Color3(0.8, 0.8, 1.0);
      tmpMeshes = makeBoxesForRectangles(rectangles, GLOBALS.MAP.ROOM.HEIGHT, GLOBALS.MAP.ROOM.HEIGHT + 0.5, scene, mat_room_ceiling);
      const mesh_room_ceiling = mergeMeshGroup(tmpMeshes, "meshRoomCeiling", scene);

      // 部屋：壁
      mapSelected = map_selecter(result.map, [1]);
      rectangles = greedyTileMaxRectangles(mapSelected);
      const mat_room_wall = new BABYLON.StandardMaterial(`matRoomWall`, scene);
      mat_room_wall.diffuseColor = new BABYLON.Color3(0.7, 0.8 ,1.0);
      mat_room_wall.specularColor = new BABYLON.Color3(1.0, 1.0, 1.0);
      mat_room_wall.specularPower = 128; // defalut = 64
      tmpMeshes = makeBoxesForRectangles(rectangles, 0.0, GLOBALS.MAP.ROOM.HEIGHT, scene, mat_room_wall);
      const mesh_room_wall = mergeMeshGroup(tmpMeshes, "meshRoomFloor", scene);
      mesh_room_wall.isTerrain = true;

      // 部屋：出入口
      mapSelected = map_selecter(result.map, [3]);
      rectangles = greedyTileMaxRectangles(mapSelected);
      const mat_room_exit = new BABYLON.StandardMaterial(`matRoomExit`, scene);
      mat_room_exit.diffuseColor = new BABYLON.Color3(0.2, 1.0, 0.8);
      tmpMeshes = makeBoxesForRectangles(rectangles, GLOBALS.MAP.CORRIDOR.HEIGHT, GLOBALS.MAP.ROOM.HEIGHT, scene, mat_room_exit);
      const mesh_room_exit = mergeMeshGroup(tmpMeshes, "meshRoomExit", scene);
    }


    update(time, delta){
      if (this.material_cage){
        const v = 0.8 + 0.2 * Math.sin(time / 500);
        this.material_cage.emissiveColor.set(0.2*v, 0.8*v, 0.2*v);
      }
      if (this.material_corridor_wall){
        const v = 0.5 + 0.5 * Math.sin(time / 800);
        this.material_corridor_wall.emissiveColor.set(1.0*v, 0.8*v, 0.1*v);
      }
    }

    dispose(){
      if (this.material_cage){
        this.material_cage.dispose();
        this.material_cage = null;
      }      
    }
}



// -------------------------------
// マップ生成用の定数
// -------------------------------
const SEG_ROWS = GLOBALS.MAP.SEG.ROWS, SEG_COLS = GLOBALS.MAP.SEG.COLS;
const SEG_SIZE = GLOBALS.MAP.SEG.SIZE; // セグメントの１辺は、9セル
const MAP_SIZE = GLOBALS.MAP.CELL.SIZE; // マップの１辺は、27セル
const SEG_COUNT = SEG_ROWS * SEG_COLS; // マップ内に、９セグメント

// -------------------------------
// ユーティリティ
// -------------------------------
function randInt(a, b) {
    return Math.floor(Math.random() * (b - a + 1)) + a; 
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// -------------------------------
// 【変換】セグメント→セル座標
// -------------------------------
function segOrigin(segIndex) {
    const r = Math.floor(segIndex / SEG_COLS);
    const c = segIndex % SEG_COLS;
    return { ox: c * SEG_SIZE, oy: r * SEG_SIZE };
}

function segRowCol(segIndex) {
    return { r: Math.floor(segIndex / SEG_COLS), c: segIndex % SEG_COLS };
}

// -------------------------------
// Union-Find（接続判定用）
// -------------------------------
function UF(n) {
    const p = new Array(n).fill(-1);
    return {
      find(i) {
        if (p[i] < 0) return i;
        p[i] = this.find(p[i]);
        return p[i];
      },
      union(a,b) {
        a = this.find(a); b = this.find(b);
        if (a === b) return false;
        if (p[a] > p[b]) { const t=a; a=b; b=t; }
        p[a] += p[b]; p[b] = a;
        return true;
      }
    };
}

// -------------------------------
// 候補エッジ（隣接 12 本）
// 各エッジは {a, b, dirA, dirB} を持つ
// dir は a 側から見た方向： "N","S","E","W"
// -------------------------------
function buildAdjacentEdges() {
    const edges = [];
    for (let r = 0; r < SEG_ROWS; r++) {
      for (let c = 0; c < SEG_COLS; c++) {
        const idx = r * SEG_COLS + c;
        // horizontal right
        if (c + 1 < SEG_COLS) {
          edges.push({ a: idx, b: idx + 1, dirA: "E", dirB: "W" });
        }
        // vertical down
        if (r + 1 < SEG_ROWS) {
          edges.push({ a: idx, b: idx + SEG_COLS, dirA: "S", dirB: "N" });
        }
      }
    }
    return edges; // 合計 12 本
}

// -------------------------------
// マップ初期化
// -------------------------------
function makeEmptyMap() {
    const map = [];
    for (let y = 0; y < MAP_SIZE; y++) {
      const row = new Array(MAP_SIZE).fill(0);
      map.push(row);
    }
    return map;
}

// -------------------------------
// 部屋配置
// - 最低 3、最大 9 のセグメントに部屋を置く
// - 部屋はセグメント内に 1 セル余白を確保して置く（外枠は壁）
// - 外枠サイズ: 3..7 (外枠: 壁を含む) -> 内部床は外枠-2
// -------------------------------
function placeRoomsOnSegments(segHasRoom) {
    // segHasRoom: boolean[9] を返す
    const arr = new Array(SEG_COUNT).fill(false);
    const count = randInt(3, SEG_COUNT); // 3..9 部屋数
    const order = shuffle([...Array(SEG_COUNT).keys()]);
    for (let i = 0; i < count; i++) arr[order[i]] = true;
    return arr;
}

// セグメント内で部屋外枠を決める
// 戻り値: {x,y,w,h}：マップ座標（外枠 = 壁も含む）
function randomRoomRectForSegment(segIndex) {
    const {ox, oy} = segOrigin(segIndex);
    // セグメント内部は 0..8、マージン 1 を確保
    // 外枠左上は ox + 1 .. ox + (SEG_SIZE - 1 - minW)
    // 外枠幅は 4～7 （ 3だと通路と同じ細長い部屋が出来てしまうため ）
    const minOuter = 4, maxOuter = 7;
    const ow = randInt(minOuter, maxOuter);
    const oh = randInt(minOuter, maxOuter);
    const maxOffsetX = SEG_SIZE - 1 - ow - 0; // >= 1 margin left/right guaranteed
    // Because we reserved margin 1, leftOffset ranges 1..(SEG_SIZE - 1 - ow)
    const lxMin = 1, lxMax = SEG_SIZE - 1 - ow;
    const lyMin = 1, lyMax = SEG_SIZE - 1 - oh;
    const lx = ox + randInt(lxMin, Math.max(lxMin, lxMax));
    const ly = oy + randInt(lyMin, Math.max(lyMin, lyMax));
    return { x: lx, y: ly, w: ow, h: oh };
}

// -------------------------------
// 部屋配置をマップに落とす
// 壁=1、床=2 をセット（wall thickness =1）
// -------------------------------
function paintRoom(map, rect) {
    const {x,y,w,h} = rect;
    for (let yy = y; yy < y + h; yy++) {
      for (let xx = x; xx < x + w; xx++) {
        // border => wall
        if (xx === x || xx === x + w - 1 || yy === y || yy === y + h - 1) {
          map[yy][xx] = 1; // wall
        } else {
          map[yy][xx] = 2; // floor
        }
      }
    }
  }

// -------------------------------
// 空白セグメントの接続点を決める
// 中心(4,4)から ±2 範囲 => local 2..6 => map coords
// -------------------------------
function randomConnectPointInEmptySegment(segIndex) {
    const {ox, oy} = segOrigin(segIndex);
    const lx = ox + randInt(2, 6);
    const ly = oy + randInt(2, 6);
    return { x: lx, y: ly };
}

// -------------------------------
// 部屋に出入口を作る
// - 壁 を 出入口に変える
// - 通路始点は wall の外側（方向に一歩出たセル）を返す（そのセルを通路掘削スタートに使う）
// - 空白セグメントなら接続点を返す（direction は、候補コネクタのまま）
// -------------------------------
function makeDoorAndGetCorridorStart(map, segIndex, dir, segHasRoom, roomRect, emptyPoint) {
    if (segHasRoom) {
      // pick a random position along the specified wall of roomRect
      const {x,y,w,h} = roomRect;
      let doorX, doorY;
      if (dir === "N") {
        doorX = randInt(x+1, x + w - 2); // avoid corners ideally
        doorY = y; // on wall
      } else if (dir === "S") {
        doorX = randInt(x+1, x + w - 2);
        doorY = y + h - 1;
      } else if (dir === "W") {
        doorY = randInt(y+1, y + h - 2);
        doorX = x;
      } else if (dir === "E") {
        doorY = randInt(y+1, y + h - 2);
        doorX = x + w - 1;
      } else {
        // no direction: is possible but typically doors are on walls
        doorX = randInt(x+1, x + w - 2);
        doorY = randInt(y+1, y + h - 2);
      }
      // set door cell to 3
      map[doorY][doorX] = 3;
      // corridor start is one step outwards (if inside map)
      const delta = dirToDelta(dir);
      const sx = doorX + delta.dx;
      const sy = doorY + delta.dy;
      if (inBounds(sx, sy)) {
        return { x: sx, y: sy, dir };
      } else {
        // out of bounds: fallback to door cell itself
        return { x: doorX, y: doorY, dir };
      }
    } else {
      // empty segment: use the precomputed emptyPoint as corridor start
      return { x: emptyPoint.x, y: emptyPoint.y, dir };
    }
}

function dirToDelta(dir) {
    if (dir === "N") return {dx:0, dy:-1};
    if (dir === "S") return {dx:0, dy:1};
    if (dir === "W") return {dx:-1, dy:0};
    if (dir === "E") return {dx:1, dy:0};
    return {dx:0, dy:0};
}

function inBounds(x,y) {
    return x >= 0 && x < MAP_SIZE && y >= 0 && y < MAP_SIZE;
}

// -------------------------------
// 通路掘り
// - 直線型 / Z字型
// - 掘削中に既存通路に当たったら合流して終了
// - ドアに当たったら合流して終了（接続先）
// -------------------------------
function carveStraight(map, x1,y1, x2,y2) {
    if (x1 === x2) {
      // vertical
      const sy = Math.min(y1,y2), ey = Math.max(y1,y2);
      map[sy][x1] = 4; //最初のセルは確定
      for (let y = sy + 1; y <= ey; y++) {
        if (!inBounds(x1,y)) break;
        if (map[y][x1] === 4 || map[y][x1] === 3) break; // 合流
        if (map[y][x1] === 0) map[y][x1] = 4;
      }
    } else if (y1 === y2) {
      // horizontal
      const sx = Math.min(x1,x2), ex = Math.max(x1,x2);
      map[y1][sx] = 4; //最初のセルは確定
      for (let x = sx + 1; x <= ex; x++) {
        if (!inBounds(x,y1)) break;
        if (map[y1][x] === 4 || map[y1][x] === 3) break;
        if (map[y1][x] === 0) map[y1][x] = 4;
      }
    }
  }

// L 字掘り（※使われないはず）
function carveL(map, sx,sy, ex,ey, startDir, endDir) {
    if (sx === ex || sy === ey) {
      carveStraight(map, sx,sy, ex,ey);
      return;
    }
    carveStraight(map, sx, sy, ex, sy);
    carveStraight(map, ex, sy, ex, ey);
    console.log("L:",sx,sy,ex,ey,startDir, endDir);
}

// Z 字掘り（2 回折れ曲がる）：中間列/行を使う（2 回直角）
function carveZ(map, sx, sy, ex, ey, startDir, endDir) {
  // 中間点を決める
  const ix = Math.floor((sx + ex) / 2);
  const iy = Math.floor((sy + ey) / 2);

  // 水平位置の間のZ堀り
  if (
    (startDir === "W" && endDir === "E") ||
    (startDir === "E" && endDir === "W")
  ) {
    // (sx,sy) -> (ix,sy) -> (ix,ey) -> (ex,ey)
    carveStraight(map, sx, sy, ix, sy);
    carveStraight(map, ix, sy, ix, ey);
    carveStraight(map, ix, ey, ex, ey);
    return;
  }

  // 垂直位置の間のZ堀り
  if (
    (startDir === "N" && endDir === "S") ||
    (startDir === "S" && endDir === "N")
  ) {
    // (sx,sy) -> (sx,iy) -> (ex,iy) -> (ex,ey)
    carveStraight(map, sx, sy, sx, iy);
    carveStraight(map, sx, iy, ex, iy);
    carveStraight(map, ex, iy, ex, ey);
    return;
  }

  // その他は L 字堀にフォールバック（※無いはず）
  carveL(map, sx, sy, ex, ey, start.dir, end.dir);
}

// 汎用 carve（始点・終点と、それぞれの方向情報）
function carveBetween(map, start, end) {
    // start, end: {x,y,dir}
    if (start.x === end.x || start.y === end.y) {
      carveStraight(map, start.x, start.y, end.x, end.y);
      return;
    }
    // 特定の方向組み合わせで Z 字を採用（"W"-"E" or "E"-"W" or "N"-"S" or "S"-"N")
    if ((start.dir === "W" && end.dir === "E") || (start.dir === "E" && end.dir === "W") ||
        (start.dir === "N" && end.dir === "S") || (start.dir === "S" && end.dir === "N")) {
      carveZ(map, start.x, start.y, end.x, end.y, start.dir, end.dir);
      return;
    }
    // その他は L 字堀にフォールバック（※無いはず）
    carveL(map, start.x, start.y, end.x, end.y, start.dir, end.dir);
  }

// -------------------------------
// ■メイン：マップ生成
// -------------------------------
function generateDungeon() {
    // 空マップの作製
    const map = makeEmptyMap();

    // 部屋の設定
    const segHasRoom = placeRoomsOnSegments(); // boolean[9]

    // セグメントのデータ（部屋セグメント用、空セグメント用）
    const segRoomRect = new Array(SEG_COUNT).fill(null); // if room exists, map rect
    const segEmptyConnect = new Array(SEG_COUNT).fill(null); // if empty, connect point
    for (let s = 0; s < SEG_COUNT; s++) {
      if (segHasRoom[s]) {
        // セグメントに部屋を設定する
        const rect = randomRoomRectForSegment(s);
        segRoomRect[s] = rect;
        paintRoom(map, rect);
      } else {
        // セグメントに接続点のみ設定する
        segEmptyConnect[s] = randomConnectPointInEmptySegment(s);
      }
    }
    GameState.rooms = segRoomRect.filter(rect => rect !== null);

    // 隣接エッジの作成とシャッフル
    let edges = buildAdjacentEdges();
    shuffle(edges);

    // select valid edges to form a spanning tree (Kruskal-like) until 8 edges
    const uf = UF(SEG_COUNT);
    const validEdges = [];
    const remaining = [];

    for ( let i = edges.length - 1; i >= 0; i--){
      const e = edges[i];
      if (uf.union(e.a, e.b)) {
        validEdges.push(e);
        if (validEdges.length >= SEG_COUNT - 1) break;
      } else {
        remaining.push(e);
      }
      edges.splice(i, 1);
    }
    // break した場合は、未評価の残り（edges に残った分）
    remaining.push(...edges);

    // If we didn't reach 8 edges (unlikely), continue scanning remaining edges
    // but with union-find we should have reached exactly 8 for 9 nodes if graph connected
    // (it is connected because edges form a 3x3 adjacency graph)
    // now remaining contains cycle-causing edges (kept order from shuffle)

    // 0～3個のエッジを追加（迂回路や行き止まりが自然と作られる）
    const extraToAdd = randInt(0, Math.min(3, remaining.length));
    for (let i = 0; i < extraToAdd; i++) {
      validEdges.push(remaining[i]);
    }

    // 有効エッジの全てについて、ドアと通路を決定する
    for (const e of validEdges) {
      // prepare start and end corridor anchor points
      const aHas = segHasRoom[e.a];
      const bHas = segHasRoom[e.b];
      const aRect = segRoomRect[e.a];
      const bRect = segRoomRect[e.b];
      const aEmpty = segEmptyConnect[e.a];
      const bEmpty = segEmptyConnect[e.b];

      // make door on a side (if room) or use empty point
      const start = makeDoorAndGetCorridorStart(map, e.a, e.dirA, aHas, aRect, aEmpty);
      const end   = makeDoorAndGetCorridorStart(map, e.b, e.dirB, bHas, bRect, bEmpty);

      // carve between start and end according to rules (手順7)
      carveBetween(map, start, end);
    }

    return { map, segHasRoom, segRoomRect, segEmptyConnect, validEdges };
}

// -------------------------------
// 「特定要素だけ true」の配列を返すヘルパー関数
// -------------------------------
function map_selecter(map, values) {
  // values を Set に変換して高速に判定できるようにする
  const valueSet = new Set(values);
  const mapSelected = [];

  for (let y = 0; y < map.length; y++) {
    mapSelected[y] = [];
    for (let x = 0; x < map[y].length; x++) {
      // 要素が values に含まれていれば true
      mapSelected[y][x] = valueSet.has(map[y][x]);
    }
  }
  return mapSelected;
}

// -------------------------------
// 最大矩形を取る関数（ポリゴン減らし用）
// -------------------------------
// findLargestRectangleInBinaryMatrix + greedy tiling
// mapSel: 2D array [row][col] of booleans (true = selectable)
// returns array of rects {x, y, w, h} using 0-based coords (x=col, y=row)

function greedyTileMaxRectangles(mapSel) {
  const H = mapSel.length;
  if (H === 0) return [];
  const W = mapSel[0].length;

  // copy to mutable boolean grid
  const grid = Array.from({length: H}, (_, r) => mapSel[r].slice());
  const rects = [];

  while (true) {
    const rect = findLargestRectangle(grid);
    if (!rect || rect.w === 0 || rect.h === 0) break;
    rects.push(rect);
    // mark cells as used (false)
    for (let yy = rect.y; yy < rect.y + rect.h; yy++) {
      for (let xx = rect.x; xx < rect.x + rect.w; xx++) {
        grid[yy][xx] = false;
      }
    }
  }

  return rects;
}

// Find largest rectangle of true cells in grid (binary matrix)
// Returns {x,y,w,h,area} or null if none
function findLargestRectangle(grid) {
  const H = grid.length;
  const W = grid[0].length;
  const height = new Array(W).fill(0);
  let best = { area: 0, x:0, y:0, w:0, h:0 };

  for (let r = 0; r < H; r++) {
    // build heights: number of consecutive true up to row r (inclusive)
    for (let c = 0; c < W; c++) {
      if (grid[r][c]) height[c] += 1;
      else height[c] = 0;
    }

    // compute largest rectangle in histogram 'height'
    // stack of indices, increasing heights
    const stack = [];
    for (let i = 0; i <= W; i++) {
      const curH = (i === W) ? 0 : height[i];
      while (stack.length > 0 && curH < height[stack[stack.length - 1]]) {
        const top = stack.pop();
        const hRect = height[top];
        const left = stack.length === 0 ? 0 : stack[stack.length - 1] + 1;
        const right = i - 1;
        const wRect = right - left + 1;
        const area = hRect * wRect;
        if (area > best.area) {
          best.area = area;
          best.x = left;
          best.w = wRect;
          best.h = hRect;
          best.y = r - hRect + 1; // top row of rectangle
        }
      }
      stack.push(i);
    }
  }

  if (best.area === 0) return null;
  return { x: best.x, y: best.y, w: best.w, h: best.h, area: best.area };
}

//------------------------------------------------------
// 矩形配列から、メッシュ配列を生成する
//------------------------------------------------------
function makeBoxesForRectangles(rects, h0, h1, scene, material, UV = false) {
    const meshes = [];
    const height = h1 - h0;
    const scale = GLOBALS.MAP.CELL.SCALE;
    const offset = MAP_SIZE * scale / 2;

    for (const r of rects) {
        const cx = r.x + r.w / 2;
        const cz = r.y + r.h / 2;

        const options = {
            width: r.w * scale,
            height: height * scale,
            depth: r.h * scale
        };

        if (UV){
          // console.log("UV", r.w, height, r.h);
          const tileSize = 1.0;
          const faceUV = [
            new BABYLON.Vector4(0, 0, r.w / tileSize, height / tileSize),
            new BABYLON.Vector4(0, 0, r.w / tileSize, height / tileSize),
            new BABYLON.Vector4(0, 0, height / tileSize, r.h / tileSize),
            new BABYLON.Vector4(0, 0, height / tileSize, r.h / tileSize),
            new BABYLON.Vector4(0, 0, r.w / tileSize, r.h / tileSize),
            new BABYLON.Vector4(0, 0, r.w / tileSize, r.h / tileSize)
          ];
          options.faceUV = faceUV;
        }

        const box = BABYLON.MeshBuilder.CreateBox("tmpbox", options, scene);

        box.position.x = cx * scale - offset;
        box.position.y = (h0 + height / 2) * scale;
        box.position.z = (cz * scale - offset)*(-1);

        if (material) box.material = material;

        meshes.push(box);
      }
      return meshes;
}

//------------------------------------------------------
// 多数のメッシュ → 1メッシュに統合（GPU負荷を下げる）
//------------------------------------------------------
function mergeMeshGroup(meshes, name, scene) {
    if (meshes.length === 0) return null;

    const merged = BABYLON.Mesh.MergeMeshes(
        meshes,
        true,   // dispose source
        true,   // allow32BitsIndices
        undefined,
        false,  // subdivideWithSubMeshes
        true    // multiMultiMaterials
    );

    merged.name = name;
    merged.checkCollisions = true;

    return merged;
}


// -------------------------------
// ASCII 表示（指定の全角文字マップ）
// -------------------------------
function asciiPrint(map) {
    const glyph = {
      [GLOBALS.MAP.ELEMENT.EMPTY]: "＿",     // 全角スペース
      [GLOBALS.MAP.ELEMENT.WALL]: "■",
      [GLOBALS.MAP.ELEMENT.FLOOR]: "・",
      [GLOBALS.MAP.ELEMENT.EXIT]: "＋",
      [GLOBALS.MAP.ELEMENT.CORRIDOR]: "□"
    };
    let s = "";
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        s += glyph[map[y][x]] || "　";
      }
      s += "\n";
    }
    // console.log(s);
    GameState.map = s;
}