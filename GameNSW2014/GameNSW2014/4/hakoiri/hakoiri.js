// file: hakoiri.js
// --- 定数の宣言 ---
var CW = 50; // 駒の最小幅
var COLS = 6, ROWS = 7;
var CANVAS_W = CW * COLS;
var CANVAS_H = CW * ROWS;
var RESOURCE_FILE = "resource.png";
// 隙間と駒、箱の枠を定義
var __=0,DT=1,K2=2,K3=3,K4=4,K5=5;
var K6=6,K7=7,K8=8,K9=9,KA=10,XX=11;
// 隙間と駒、箱の枠のサイズを定義
var CH_SIZE = [
  [1,1],[2,2],[1,2],[1,2],[1,2],[1,2],
  [2,1],[1,1],[1,1],[1,1],[1,1],[1,1]];
// resource.png上の隙間と駒、箱の位置を定義
var CH_POS = [0,1,3,4,5,6,7,9,10,11,12,13];
// 箱の中（ステージ）の初期状態を定義
var DEF_STAGE = [
  [XX,XX,XX,XX,XX,XX],
  [XX,K2,DT,DT,K3,XX],
  [XX,K2,DT,DT,K3,XX],
  [XX,K4,K6,K6,K5,XX],
  [XX,K4,K7,K8,K5,XX],
  [XX,K9,__,__,KA,XX],
  [XX,XX,XX,XX,XX,XX]
];
// --- 大域変数の定義 ----
var aCanvas, ctx; // キャンバスとコンテキスト
var images;       // 画像オブジェクト
var stage;        // ステージを表す変数
var turn;         // 手数
var sel_x, sel_y, sel_no; // 選択中の駒情報

// --- 初期化イベント ---
window.onload = function() {
  // キャンバスのサイズをセット
  aCanvas = $("aCanvas");
  aCanvas.width  = CANVAS_W;
  aCanvas.height = CANVAS_H;
  // キャンバスのイベントをセット
  aCanvas.onclick = clickHandler;
  // 描画コンテキストの取得
  ctx = aCanvas.getContext("2d");
  // リソース画像を読み込む
  $("info").innerHTML = "少々お待ちください";
  images = new Image();
  images.src = RESOURCE_FILE;
  images.onload = initGame;
};
// ゲームのパラメータを初期化
function initGame() {
  $("info").innerHTML = "-";
  stage = cloneArray(DEF_STAGE);
  turn = 0;
  sel_x = sel_y = sel_no = -1; // 未選択
  drawScreen();
}
// --- マウスイベント ---
function clickHandler(e) {
  var pt = getClientPos(e);
  var x = Math.floor(pt.x / CW);
  var y = Math.floor(pt.y / CW);
  clickStage(x, y);
}
// マウス座標を変換する
function getClientPos(e) {
  var res = { x:0, y:0 };
  var rect = e.target.getBoundingClientRect();
  res.x = e.clientX - rect.left;
  res.y = e.clientY - rect.top;
  return res;
}
// --- 駒の移動処理 ---
// (x,y)をクリックした時の処理
function clickStage(x, y) {
  var no = stage[y][x];
  console.log("click=" + no);
  // クリックしたのが枠なら何もしない
  if (no == XX) return;
  // 選択状態で隙間を選択した場合
  if (no == __ && sel_no > 0) {
    checkMove(x, y);
    return;
  }  
  // 選択座標を記録する
  sel_x = x; sel_y = y; sel_no = no;
  // 選択座標を補正。娘の駒なら必ず左上になる
  if (CH_SIZE[no][0] > 0) {
    if (stage[y][x-1] == no) sel_x--;
  }
  if (CH_SIZE[no][1] > 0) {
    if (stage[y-1][x] == no) sel_y--;
  }
  $("info").innerHTML = 
    "移動方向をクリックしてください。";
  drawScreen();
}
// 移動可能か判定
function checkMove(x, y) {
  // 移動先が隙間かを確かめる
  // ただし右か下に移動する場合を考慮
  var sel_w = CH_SIZE[sel_no][0];
  var sel_h = CH_SIZE[sel_no][1];
  if (sel_w >= 2 && sel_x < x) x -= sel_w-1;
  if (sel_h >= 2 && sel_y < y) y -= sel_h-1;
  var res = loop2(sel_h, sel_w, function(e) {
    var nx = e.x + x;
    var ny = e.y + y;
    var v = stage[ny][nx];
    if (v != __ && v != sel_no) {
      e.stop = true;
    }
  });
  if (!res) return;
  // 駒が隣り合っているかを判定する
  if (sel_x == x) {
    res = (Math.abs(y - sel_y) <= 1);
  }
  if (sel_y == y) {
    res = (Math.abs(x - sel_x) <= 1);
  }
  if (sel_x != x && sel_y != y) res = false;
  if (!res) return;
  console.log("canMove");
  // 既存の場所を隙間にする
  loop2(sel_h, sel_w, function(e) {
    stage[sel_y+e.y][sel_x+e.x] = __;
  });
  // 新しい位置に駒を移動
  loop2(sel_h, sel_w, function(e) {
    stage[y+e.y][x+e.x] = sel_no;
  });
  // 選択継続
  sel_x = x; sel_y = y;
  turn++;
  $("info").innerHTML = 
    "第" + turn + "手 移動しました。";
  drawScreen();
  // クリア判定
  if (sel_no == DT && sel_x == 2 && sel_y == 4) {
    setTimeout(gameClear, 1);
  }
}
function gameClear() {
  alert("ゲームクリア! (" + turn + "手)");
  initGame();
}
// --- 画面の描画 ---
function drawScreen() {
  // 箱を描画
  ctx.drawImage(images,
    CH_POS[XX] * CW, 0, CANVAS_W, CANVAS_H,
    0, 0, CANVAS_W, CANVAS_H);
  // 隙間と各駒を描画
  var tmp = []; // 描画済みを記録するための変数
  loop2(ROWS,COLS, function(e) {
    row = e.y;
    col = e.x;
    var no = stage[row][col];
    // 枠あるいは既に描画済みならスキップ
    if (tmp[row*COLS+col]||no==XX) return;
    var w = CH_SIZE[no][0];
    var h = CH_SIZE[no][1];
    var p = CH_POS[no];
    var tx = col * CW; // 描画先X
    var ty = row * CW; // 描画先Y
    var tw = w * CW;   // 描画サイズ幅
    var th = h * CW;   // 描画高さ
    ctx.drawImage(images,
      p * CW, 0, tw, th, 
      tx, ty, tw, th
    );
    // 描画済みであることをセット
    loop2(h, w, function(f) {
      var nx = f.x + col;
      var ny = f.y + row;
      tmp[ny*COLS+nx] = no;
    });
    // 選択範囲をハイライト
    if (sel_no == no) {
      ctx.fillStyle = "rgba(255,100,100,0.5)";
      ctx.fillRect(tx, ty, tw, th);
    }
  });
}
// --- 便利関数 ---
// 配列のクローンを作成
function cloneArray(a) {
  var b = [];
  for (var i = 0; i < a.length; i++) {
    if (typeof(a[i]) == "object") {
      b[i] = cloneArray(a[i]);
    } else {
      b[i] = a[i];
    }
  }
  return b;
}
// 2重のforループをラップした関数
function loop2(rows, cols, callback) {
  var e = {x:0, y:0, stop:false};
  for (var y = 0; y < rows; y++) {
    e.y = y;
    for (var x = 0; x < cols; x++) {
      e.x = x;
      callback(e);
      if (e.stop) return false;
    }
  }
  return true;
}
// DOM要素を返す
function $(id) {
  return document.getElementById(id);
}
