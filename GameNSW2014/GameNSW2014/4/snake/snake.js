// snake.js
// 定数の宣言（大文字の変数を定数として扱う）
var COLS = 20; // 画面の列数
var ROWS = 20; // 画面の行数
var TILE_W = 400 / COLS;
var TILE_H = 400 / ROWS;
var DEFAULT_WAIT_TIME = 300; //ヘビの動作間隔
// 移動方向を表すテーブル
var DIR_TBL = [[0,-1],[1,0],[0,1],[-1,0]];
// 変数の宣言
var aCanvas; // キャンバス
var ctx;     // 描画コンテキスト
var dir = 0; // ヘビの進行方向
var waitTime = DEFAULT_WAIT_TIME;
var sx, sy; // ヘビの頭の位置
var snakeArray = []; // ヘビの頭の軌跡（しっぽ）
var snakeLen;
var ax, ay; // リンゴの位置
var needRotate = false; // ヘビ回転要求
var level = 1;
// 初期化処理
window.onload = function () { 
  // 描画コンテキストの取得
  aCanvas = $("aCanvas");
  ctx = aCanvas.getContext("2d");
  // キーボードイベントの設定
  window.onkeydown = keyHandler;
  // 方向転換ボタンの設定
  $("rButton").onclick = rButtonHandler; 
  initGame();
};
// ゲームの初期設定を行う
function initGame() {
  // ゲームのパラメータを初期化
  waitTime = DEFAULT_WAIT_TIME;
  level = 1;
  snakeLen = 4;
  // タイトル画面を表示
  showPage('title');
  $("info").innerHTML = "Snake Game";
  $("startButton").onclick = function () {
    showPage('game');
    nextGame();
  };
}
function nextGame() {
  // ヘビの初期位置と進行方向を決定
  sx = rnd(COLS-2);
  sy = rnd(ROWS-2)+1;
  dir = (sx > (COLS/2)) ? 3 : 1;
  snakeArray = [[sx, sy]];
  // リンゴの位置を決定
  ax = rnd(COLS);
  ay = rnd(ROWS);
  // 現在のレベルを表示
  $("info").innerHTML = "Snake Game level." + level;
  drawScreen();
  setTimeout(gameLoop, 100);
}
function gameLoop() {
  // ユーザーからの入力があったか？
  if (needRotate) {
    needRotate = false;
    dir = (dir + 1) % 4;
    console.log("dir=" + dir);
  }
  // ヘビの頭の移動
  var x = sx + DIR_TBL[dir][0];
  var y = sy + DIR_TBL[dir][1];
  if (0 <= x && x < COLS &&
      0 <= y && y < ROWS) {
    sx = x; sy = y;
    snakeArray.unshift([x,y]);
    snakeArray = snakeArray.slice(0,snakeLen);      
  } else {
    alert("Game Over");
    initGame();
    return;
  }
  drawScreen();
  // レベルクリア？
  if (sx == ax && sy == ay) {
    alert("Level Clear!");
    level++;         // レベルを上げる
    snakeLen += 2;   // しっぽを長くする
    waitTime *= 0.8; // 移動を早くする
    nextGame();
    return;
  }
  setTimeout(gameLoop, waitTime);
}
function drawScreen() {
  // 背景の描画
  ctx.clearRect(0,0,400,400);
  ctx.fillStyle="white";
  ctx.fillRect(0,0,400,400);
  // ヘビの描画
  ctx.fillStyle = "green";
  for (var i in snakeArray) {
    var x = snakeArray[i][0];
    var y = snakeArray[i][1];
    ctx.fillRect(x * TILE_W,
                 y * TILE_H,
                 TILE_W, TILE_H);
  }
  // リンゴの描画
  ctx.fillStyle = "red";
  var w2 = TILE_W / 2;
  fillCircle(ax * TILE_W + w2, 
             ay * TILE_W + w2, w2);
}
function fillCircle(x, y, r) {
  ctx.beginPath();
  var w2 = TILE_W / 2;
  ctx.arc(x, y, r, 0, Math.PI*2,false);
  ctx.fill();
}
// キー入力
function keyHandler(e) {
  var k = e.keyCode;
  console.log("key=" + k);
  if (k == 13 || k == 32) {
    needRotate = true;
    e.preventDefault();
  }
}
// ボタン入力
function rButtonHandler(e) {
  needRotate = true;
}
// 整数の乱数を返す
function rnd(n) {
  return Math.floor(Math.random() * n);
}
// DOM要素の取得
function $(id) { 
  return document.getElementById(id);
}
// 指定のページを表示
function showPage(pageId) {
  var ps = 
    document.querySelectorAll("[data-role='page']");
  for (var i = 0; i < ps.length; i++) {
    var e = ps[i];
    if (e.id == pageId) {
      e.style.display = "block";
    } else {
      e.style.display = "none";
    }
  }
}


