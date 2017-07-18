// 定数の宣言
var SCR_W = 640; // 画面の幅
var SCR_H = 400; // 画面の高さ
var CHR_W = 80;  // キャラクターの大きさ
var FPS_INTERVAL = 1000 / 10; // FPS
// ステージのパターン（7種類）
var stagePattern = [
  [ // 平らな土地
    [2,2,2,2,3],
    [5,2,2,2,3],
    [6,2,2,2,3],
    [7,2,2,2,3],
    [2,2,2,2,3]
  ], [ // 穴あり
    [2,2,2,2,3],
    [5,2,2,2,3],
    [6,2,2,2,3],
    [7,2,2,2,2],
    [2,2,2,2,3]
  ], [ // 凸あり
    [2,2,2,2,3],
    [2,2,2,2,3],
    [2,2,2,3,4],
    [2,2,2,2,3],
    [2,2,2,2,3]
  ], [ // 穴あり(2)
    [2,2,2,2,3],
    [2,2,2,2,3],
    [2,5,2,2,3],
    [2,6,2,2,2],
    [2,7,2,2,3]
  ],[ // 凸あり(2)
    [2,2,2,2,3],
    [2,2,2,2,3],
    [5,2,2,2,3],
    [7,2,2,3,4]
  ],[ // 鳥あり。8＝鳥
    [2,2,2,2,3],
    [5,8,2,2,3],
    [7,2,2,2,3],
    [2,2,2,2,3]
  ],[ // 雲だけ
    [2,5,2,2,3],
    [2,7,2,2,3]
  ]
];
// 各キャラクターが障害物かどうか判定するための配列
var IS_OBSTACLE = [ true, true,  false, true, true,
                    false, false, false, true];
// グローバル変数の宣言
var xStage, xSprite, xOff; // 描画用コンテキスト
var offCanvas; // オフスクリーン用
var images = []; // 読み込んだ画像の一覧
// フレーム描画用
var frame = { time:0, index:0, id:0 }; 
var stage = []; // ステージデータ
var plx = 1, ply = 2; // プレイヤーのX、Y座標
var score = 0; // スコア
var isGameOver = false; // ゲームオーバーかどうか
var isJump = false;     // ジャンプするかどうか

// HTMLの初期化処理
window.onload = function () {
  // レイヤーの重ね合わせを考慮(z-index)
  $("stageCV").style.zIndex = 10;
  $("spriteCV").style.zIndex = 11;
  $("msg").style.zIndex = 12;
  // オフスクリーン用のキャンバスを作成
  offCanvas = document.createElement("canvas");
  offCanvas.width = SCR_W;
  offCanvas.height = SCR_H; 
  // 描画コンテキストの取得
  xStage = $("stageCV").getContext("2d");
  xSprite = $("spriteCV").getContext("2d");
  xOff = offCanvas.getContext("2d");
  // イベントハンドラの設定
  $("stageCV").onmousedown = touchHandler;
  $("stageCV").ontouchstart = touchHandler;
  window.onkeydown = function(e) {
    if (e.keyCode == 38) isJump = true;
  }
  // 画像の読み込み
  loadImages(initGame);
};
// 画面をタッチまたはクリックしたときに呼ばれる
function touchHandler(e) {
  e.preventDefault();
  isJump = true;
}
// 連番画像の読み込み
function loadImages(callback) {
  showMessage("画像の読込");
  var num = 0, imCount = 10;
  for (var i = 0; i < imCount; i++) {
    var im = new Image();
    im.src = "img/" + i + ".png";
    im.onload = function () {
      num++;
      if (num >= imCount) callback();
    };
    images[i] = im;
  }
}
// メッセージ表示用
function showMessage(s) { $("msg").innerHTML = s; }
// ゲームの初期化処理
function initGame() {
  showMessage("SCORE:0");
  ply = 2; plx = 1;
  score = 0;
  isGameOver = false;
  stage = [];
  createStage();
  frame.index = 0;
  if (frame.id == 0) redraw();
}
// ステージを生成する
function createStage() {
  // 平らな土地を3個並べる
  var block = stagePattern[0];
  for (var i = 0; i < 3; i++) {
    for (var j = 0; j < block.length; j++) {
      stage.push(block[j]);
    }
  }
  // ランダムにパターンを100個配置
  for (var i = 0; i < 100; i++) {
    var block = randomA(stagePattern);
    for (var j = 0; j < block.length; j++) {
      stage.push(block[j]);
    }
  }
}
// 再描画関数
function redraw() {
  var t = Date.now();
  if (t - frame.time >= FPS_INTERVAL) {
    frame.time = t;
    if (onFrame(frame.index)) frame.index++;
  }
  frame.id = requestAnimationFrame(redraw);
}
// 毎フレーム実行される関数
function onFrame(index) {
  if (isGameOver) {
    alert("Game Over!!\nSCORE:" + score);
    initGame();
    return false;
  }
  movePlayer(index);
  drawChar(index);
  drawStage(index);
  showMessage("SCORE:" + (++score));
  return true;
}
// プレイヤーの移動に関する処理
function movePlayer(index) {
  // プレイヤーの直下の座標を確認
  var isObs = IS_OBSTACLE[stage[index+plx][ply+1]];
  // ジャンプする？
  if (isJump) {
    isJump = false;
    if (isObs && ply >= 2) {
      ply -= 2;
    }
  }
  // 下に落ちる?
  if (!isObs) {
    ply++;
    if (ply > 4) ply = 4;
  }
  // ぶつかった？
  var ch = stage[index + plx][ply];
  if (IS_OBSTACLE[ch]) {
    isGameOver = true;
  }
  // 最後まで走ったら新たにステージを追加する
  if (index >= stage.length - 8) {
    createStage();
  }
}
// ステージの描画処理
function drawStage(index) {
  // 新たにステージを描画する
  var drawStage = function (x, y) {
    var i = stage[index + x][y];
    var yy = y * CHR_W;
    var xx = x * CHR_W;
    xOff.drawImage(images[i], xx, yy);
  };
  if (index == 0) {
    // オフスクリーンにすべてのステージを描く
    for (var y = 0; y < 5; y++) {
      for (var x = 0; x < 8; x++) {
        drawStage(x, y);
      }
    }
  } else {
    // 再利用する領域をコピー
    xOff.drawImage(
      offCanvas,
      CHR_W, 0, SCR_W - CHR_W, SCR_H,
      0, 0, SCR_W - CHR_W, SCR_H);
    // スクロール後の新しい領域を描画
    for (var y = 0; y < 5; y++) {
      drawStage(7, y);
    } 
  }
  // オフスクリーンを画面に反映させる
  xStage.drawImage(offCanvas, 0, 0);
}
// キャラクターを描画する
function drawChar(index) {
  $("spriteCV").style.top  = (ply * CHR_W) + "px";
  $("spriteCV").style.left = (plx * CHR_W) + "px";
  var char_anime = index % 2;
  if (isGameOver) char_anime = 9;
  xSprite.clearRect(0,0,CHR_W,CHR_W);
  xSprite.drawImage(images[char_anime], 0, 0);
}

function random(v) { 
  return Math.floor(Math.random() * v); }
function randomA(ary) { 
  return ary[random(ary.length)]; }
function $(id) { 
  return document.getElementById(id); }
