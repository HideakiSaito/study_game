// 神経衰弱
//-------------------------------------------
// 定数
var RESOURCE_FILE = "resource.png";
var ROWS = 4;     // ステージの行数
var COLS = 5;     // ステージの列数
var CARD_H = 120; // カードの高さ
var CARD_W = 80;  // カードの幅
var DEFAULT_TIME = 60; // 残り時間
// 変数
var cards  = []; // カードの番号を記録 
var opened = []; // 開いたかどうかを記録
var resImage;
var ctx;
var selIndex; // プレイヤーの選択した値
var score;    // スコア
var time;     // 残り時間
var lock;     // 連続クリック防止用

// 初期化処理 ---------- (*1)
window.onload = function () {
  // 描画用コンテキストの取得
  var canvas = $("mainCanvas");
  ctx = canvas.getContext("2d");  
  canvas.onmousedown = canvasMDHandler;
  // リソース画像の読み込み ----(*2)
  resImage = loadImage(RESOURCE_FILE, function () {
    initGame();
  });
};

// ゲームの初期化 ----(*3)
function initGame() {
  selIndex = -1; // 未選択
  score = 0;
  time = DEFAULT_TIME;
  $("score").innerHTML = "SCORE: 0";
  initCards();
  drawStage();
  countTime();
}

// カードを初期化してシャッフルする ------(*4)
function initCards() {
  // 10ペアのカード20枚を配列に代入
  for (var i = 0; i < ROWS * COLS; i++) {
    cards[i] = 1 + Math.floor(i / 2);
  }
  for (var i = 0; i < cards.length; i++) {
    opened[i] = false;
  }
  // シャッフルする
  for (var i = cards.length-1; i > 0; i--) {
    var r = rand(i+1);
    var tmp = cards[i];
    cards[i] = cards[r];
    cards[r] = tmp;
  }
}

// ステージを描画する ---- (*5)
function drawStage() {
  // カードを一枚ずつ描画する
  for (var i = 0; i < cards.length; i++) {
    var no = cards[i];
    if (opened[i] == false && selIndex != i) {
      no = 0;
    }
    var row = Math.floor(i / COLS);
    var col = i % COLS;
    var y = CARD_H * row;
    var x = CARD_W * col; 
    ctx.drawImage(resImage,
      no * CARD_W, 0, CARD_W, CARD_H,
      x, y, CARD_W, CARD_H);
    // プレイヤーが選択中なら色をつける
    if (selIndex == i) {
      ctx.strokeStyle = "rgba(255,100,100,0.5)";
      ctx.lineWidth = 2;
      ctx.strokeRect(x+2, y+2, CARD_W-4, CARD_H-4);
    }
  }
}

// マウスでカードを選んだ時のイベント --- (*6)
function canvasMDHandler(e) {
  // クリックした位置を得る --- (*7)
  var x = e.clientX;
  var y = e.clientY;
  var r = e.target.getBoundingClientRect();
  x -= r.left;
  y -= r.top;
  // どの位置のカードをクリックしたか判定
  var col = Math.floor(x / CARD_W);
  var row = Math.floor(y / CARD_H);
  pos = col + row * COLS;
  console.log("click=" + pos);
  clickCard(pos);
} 

// プレイヤーがカードを選んだときの処理 ---(*8)
function clickCard(pos) {
  // 既にオープンした札なら何もしない
  if (opened[pos]) return;
  if (lock) return;
  // 1枚目の選択か --- (*9)
  if (selIndex < 0) {
    selIndex = pos;
    drawStage();
    return;
  }
  // 2枚目の選択
  if (pos == selIndex) return;
  // 引いた二枚が合致するか？
  var c1 = cards[selIndex];
  var c2 = cards[pos];
  if (c1 == c2) {
    opened[selIndex] = true;
    opened[pos] = true;
    selIndex = -1;
    score += 2;
    $("score").innerHTML = "SCORE: " + score; 
    drawStage();
    // クリア判定
    if (score >= cards.length) {
      setTimeout(function() {
        alert("GAME CLEAR!");
        initGame();
      },1);
    }
    $("nice").play();
  } else {
    // 間違い!一秒だけカードをプレイヤーに見せる ---- (*9)
    opened[pos] = true;
    drawStage();
    lock = true;
    setTimeout(function() {
      opened[pos] = false;
      selIndex = -1;
      drawStage();
      lock = false;
    },1000);
    $("ng").play();
  }
}

// タイマーのカウントダウン ---- (*10)
function countTime() {
  if (score >= ROWS * COLS) return;
  time--;
  $("time").innerHTML = "TIME: " + time;
  // タイムアップ
  if (time <= 0) {
    alert("TIME UP...GAME OVER");
    initGame();
    return;
  }
  // 次回タイマーの設定
  setTimeout(countTime, 1000);
}

// 画像を読み込む関数
function loadImage(fname, onload) {
  var image = new Image();
  image.src = fname;
  image.onload = onload;
  return image;
}

// 乱数生成用関数
function rand(n) {
  return Math.floor(Math.random() * n);
}

// DOM要素を返す
function $(id) {
  return document.getElementById(id);
}




