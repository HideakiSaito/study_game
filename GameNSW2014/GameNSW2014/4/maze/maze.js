// maze.js
// -------------------------------------------
// 変数の初期化
var cvMain; // キャンバス
var ctx;    // 描画用コンテキスト
var width = 33, height = 33; //迷路の広さ
var maze = []; // 迷路データ
var px, py;    // プレイヤーの座標
var keyDir = { // 押されたキーの向き
  38:[0,-1],40:[0,1], // up down
  37:[-1,0],39:[1,0], // left right
  75:[0,-1],74:[0,1], // j k
  72:[-1,0],76:[1,0]  // h l
};
// ブロックの色
var blockColor = ["white","black","yellow"];
// -------------------------------------------
// 初期化処理
window.onload = function () {
  cvMain = document.getElementById("cvMain");
  ctx = cvMain.getContext("2d");
  document.onkeydown = keyHandler;
  cvMain.onmousedown = mouseHandler;
  initGame();
};
// 乱数の簡易メソッド
function rnd(n) {
  return Math.floor(Math.random()*n);
}
// ゲームの初期化メソッド
function initGame() {
  maze = makeMaze();
  px = 1; py = 1;
  drawMap();
}
// キーを押したとき
function keyHandler(e) {
  var c = e.keyCode;
  var k = keyDir[c];
  if (!k) return;
  var x2 = px + keyDir[c][0];
  var y2 = py + keyDir[c][1];
  var b = checkMap(x2, y2);
  // ブラウザのイベントをキャンセル
  if (b) e.preventDefault();
}
// マウスをクリックしたとき
function mouseHandler(e) {
  e.preventDefault();
  var lx = e.layerX; // クリック位置
  var ly = e.layerY;
  var ax = lx - (cvMain.width / 2);
  var ay = ly - (cvMain.height / 2);
  if (Math.abs(ax) > Math.abs(ay)) {
    var bx = (ax < 0) ? -1 : 1;
    checkMap(px + bx, py);
  } else {
    var by = (ay < 0) ? -1 : 1;
    checkMap(px, py + by);
  }
}
// イベントのチェック
function checkMap(x2, y2) {
  if (!isInMaze(x2,y2)) return false;
  var c = maze[y2][x2];
  if (c == 1) return false;
  if (c == 2) {
    alert("ゴール!!");
    initGame(); return false;
  }
  px = x2; py = y2;
  drawMap();
}
// 迷路の作成メソッド
function makeMaze() {
  var maze = [];
  // 迷路の全てを壁にする
  for (var y = 0; y < height; y++) {
    maze[y] = [];
    for (var x = 0; x < width; x++)
      maze[y][x] = 1;
  }
  // 上下左右方向のリストをシャッフルして返す
  var makeDir4 = function () {
    var r = [[0,-1],[0,1],[-1,0],[1,0]];
    for (var i = 0; i < 4; i++) {
      var j = rnd(4); 
      var t = r[i];
      r[i] = r[j];
      r[j] = t;
    }
    return r;
  };
  // 再帰的に迷路を作成する
  var recMake = function (x, y) {
    // ランダムに進む方向を決める
    var dir4 = makeDir4();
    for (var i = 0; i < 4; i++) {
      var dir = dir4[i];
      // 2マス先を調べる
      var x2 = dir[0] * 2 + x;
      var y2 = dir[1] * 2 + y;
      // 既に通路なら何もしない
      if(!isInMaze(x2,y2)) continue;
      if (maze[y2][x2] == 0) continue;
      // 2マス穴を掘る
      maze[y+dir[1]][x+dir[0]] = 0;
      maze[y2][x2] = 0;
      recMake(x2, y2);
    }
  };
  // 穴掘りの開始点を決める
  var cx = rnd((width -2)/2)*2+1;
  var cy = rnd((height-2)/2)*2+1;
  maze[cy][cx] = 0;
  recMake(cx, cy);
  // ゴール地点をセット
  maze[height-2][width-2] = 2;
  return maze;
}
// 座標が迷路の有効範囲にあるかどうか
function isInMaze(x, y) {
  return (0 <= x && x < width) &&
         (0 <= y && y < height);
}
// マップの描画
function drawMap() {
  var cw = cvMain.width;
  var w = Math.floor(cw / 9);
  ctx.clearRect(0,0,w,w);
  // プレイヤーの周りを描画
  for (var y = 0; y < 9; y++) {
    for (var x = 0; x < 9; x++) {
      var dx = px + x - 4;
      var dy = py + y - 4;
      var b = 1;
      if (isInMaze(dx,dy)) {
        b = maze[dy][dx];
      } 
      ctx.fillStyle = blockColor[b];
      ctx.fillRect(w*x, w*y, w, w);
    }
  }
  // キャラクターの描画
  ctx.fillStyle = "green";
  ctx.fillRect(w*4+10,w*4+10,w-20,w-20);
}

