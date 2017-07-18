// mogura.js
// プログラムの全体で使われる変数
var ctx; // 描画用コンテキスト
var resImg, backImg; // 素材・背景画像
var piAudio; // 効果音
var holes = []; // モグラ穴の状態管理
var score = 0; // スコア
var time  = 0; // 残り時間
// 定数
var CHAR_W = 80;         // 画像1枚の幅
var TURN_INTERVAL = 500; // 1ターンの間隔
var HOLE_NONE      = 0;  // モグラ穴の状態
var HOLE_MOGU      = 1;
var HOLE_MOGU_HIT  = 2;
var HOLE_MAN       = 3;
var HOLE_MAN_HIT   = 4;
// 各種初期化
window.onload = function () {
  // 画像や効果音リソースを読み込む
  resImg = new Image();
  resImg.src = "resource.png";
  resImg.onload = imageLoadHandler;
  backImg = new Image();
  backImg.src = "back.png";
  backImg.onload = imageLoadHandler;
  piAudio = new Audio();
  if (piAudio.canPlayType) {
    if (piAudio.canPlayType("audio/ogg")) {
      piAudio.src = "pi.ogg";
    }
    if (piAudio.canPlayType("audio/mpeg")) {
      piAudio.src = "pi.mp3";
    }
  }
  // キャンバスの設定
  var c = $("aCanvas");
  ctx = c.getContext("2d"); // コンテキスト
  c.onmousedown = mouseHandler;
  c.ontouchstart = touchHandler;
};
function imageLoadHandler(e) {
  e.target.isOK = true;
  if (resImg.isOK && backImg.isOK) ready();
}
function ready() {
  score = 0;
  time  = 40;
  holes = [];
  for (var i = 0; i < 16; i++) {
    holes[i] = HOLE_NONE;
  }
  draw();
  $show("sBtn");
}
function start() {
  $hide("sBtn");
  setTimeout(nextTurn, TURN_INTERVAL);
}
function nextTurn() {
  time--;
  if (time < 0) { gameOver(); return; }
  for (var i = 0; i < 16; i++) {
    // 空の穴
    if (holes[i] == HOLE_NONE) {
      if (rnd(20) != 0) continue;
      holes[i] = (rnd(15) > 3) ? HOLE_MOGU : HOLE_MAN;
      continue;
    }
    // 空で無ければ継続するか確認
    if (rnd(2) == 0) continue;
    holes[i] = HOLE_NONE;
  }
  draw();
  setTimeout(nextTurn, TURN_INTERVAL);
}
function gameOver() {
  alert("GAME OVER!\nSCORE="+score);
  ready();
}
function draw() {
  ctx.drawImage(backImg, 0, 0);
  for (var i = 0; i < 16; i++) {
    var x = (i % 4) * CHAR_W;
    var y = Math.floor(i / 4) * CHAR_W;
    var c = holes[i];
    ctx.drawImage(resImg, 
      c*CHAR_W, 0, CHAR_W, CHAR_W, 
      x, y, CHAR_W, CHAR_W);
  }
  $("info").innerHTML = "Mogura - " + 
    "Score:" + score + " - " + 
    "Time:"  + time;
}
function mouseHandler(e) {
  // Canvas上の正しい位置を得る
  var x = e.clientX;
  var y = e.clientY;
  var r = e.target.getBoundingClientRect();
  x -= r.left;
  y -= r.top;
  hit(x, y);
}
function touchHandler(e) {
  e.preventDefault();
  // Canvas上の正しい位置を得る
  var x = e.touches[0].clientX;
  var y = e.touches[0].clientY;
  var r = e.target.getBoundingClientRect();
  x -= r.left;
  y -= r.top;
  hit(x, y);
}

function hit(x, y) {
  if (time < 0) return;
  // 穴の番号を求める
  var col = Math.floor(x / CHAR_W);
  var row = Math.floor(y / CHAR_W);
  var i = row * 4 + col;
  // イベントに応じた処理を行う
  if (holes[i] == HOLE_NONE) return;
  if (holes[i] == HOLE_MOGU) {
    score += 5;
    holes[i] = HOLE_MOGU_HIT;
    draw();
    piAudio.play();
    return;
  }
  if (holes[i] == HOLE_MAN) {
    score -= 15;
    if (score < 0) score = 0;
    holes[i] = HOLE_MAN_HIT;
    draw();
    piAudio.play();
    return;
  }
}
function $(id) { return document.getElementById(id); }
function $hide(id) { $(id).style.display = "none"; }
function $show(id) { $(id).style.display = "block"; }
function rnd(n) {
  return Math.floor(Math.random() * n);
}
