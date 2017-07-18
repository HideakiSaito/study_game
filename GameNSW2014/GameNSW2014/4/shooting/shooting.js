// 変数の宣言
var MAX_MORI = 20; // モリの最大数
var FREQ_NEW_FISH = 10; // 新規魚の出現頻度
var FPS = 30;    // 一秒間に描画する回数
var FPS_INTERVAL = 1000 / FPS; // 描画間隔
var SCR_W = 640; // スクリーンの幅
var SCR_H = 400; // スクリーンの高
var BACK_W = 32; // 背景画像一つの幅
var BACK_FILES = ["back0","back1","back2"]; // 背景画像
var CHAR_FILES = [ // キャラクタ画像一覧
    "player1", "player2",
    "saba1", "saba2",
    "kurage1", "kurage2",
    "same1", "same2",
    "hit1", "hit2", "mori"];
var T_PLAYER = 0, T_MORI = 10, T_HIT = 8; // 各画像の番号を定義
var T_SABA = 2, T_KURAGE = 4, T_SAME = 6;
var FISH_TYPES = [T_SABA, T_KURAGE, T_SAME];
var DIR_TABLE = [ // 方向テーブルの定義
  {x:0,y:0},              // 移動なし
  {x:-1,y:0}, {x:0,y:-1}, // 左, 上
  {x:1,y:0},  {x:0,y:1}]; // 右, 下 
var back = {}; // 背景描画用のオブジェクト
var ctx; // 描画用コンテキスト
var frame = { index:0, time:0 }; // フレーム管理用
var images = []; // キャラクタ画像の保存用
var fishes = []; // 魚を管理するデータ
var moriList = []; // モリを管理するデータ
var player; // プレイヤーオブジェクト
var score = 0; // スコア
var isGameOver = false;
var animID = 0;
// HTMLの初期化処理 ---------------- (*1)
window.onload = function () {
  // レイヤーの重ね合わせを考慮(z-index)
  $("backCV").style.zIndex = 10;
  $("gameCV").style.zIndex = 11;
  $("msgBox").style.zIndex = 12;
  // コンテキストの取得
  ctx = $("gameCV").getContext("2d");
  back.ctx = $("backCV").getContext("2d");
  // イベントの設定
  window.addEventListener("keydown", onKeyHandler);
  // 画像の読み込み
  loadImage1();
};
function loadImage1() { // ------ (*2)
  msgBox("背景画像の読込");
  back.images = loadImages(
    BACK_FILES,
    loadImage2);
}
function loadImage2() { // ------ (*3)
  initBack(); // 背景を初期化
  drawBack(); // キャラクターの読込前に描画
  msgBox("キャラクター画像の読込");
  images = loadImages(CHAR_FILES, initGame);
}
function msgBox(s) { // メッセージ表示用
  $("msgBox").innerHTML = s;
}
// ゲームの初期化処理
function initGame() {
  msgBox("SCORE:0");
  player = new Player();
  fishes = [];
  moriList = [];
  isGameOver = false;
  if (animID == 0) {
    animID = requestAnimationFrame(redraw);
  }
}
// フレームの調整
function redraw() {
  // 各タイミングを調整する
  var t = Date.now();
  if (t - frame.time >= FPS_INTERVAL) {
    frame.time = t;
    onFrame(frame.index);
    frame.index++;
  }
  animID = requestAnimationFrame(redraw);
}
// 毎フレーム実行される関数
function onFrame(frameIndex) {
  drawBack(); // スクロールする背景を描画
  drawChars(frameIndex); // キャラクターを描画
  actFishes(frameIndex); // 魚に関する処理
  actPlayer(frameIndex); // プレイヤーを処理
}
function actFishes(frIndex) {
  // 魚の新規追加
  if (frIndex % FREQ_NEW_FISH == 0 &&
      fishes.length < 40) {
    // 魚の種類を決定
    var type = randomS(FISH_TYPES);
    var f = new Fish(type);
    fishes.push(f);
  }
  // 各魚を移動
  for (var i = 0; i < fishes.length; i++) {
    var f = fishes[i];
    f.move();
    f.check();
   }
}
function actPlayer(index) {
  if (isGameOver) { // ゲームｰバー中なら動けない
    if (player.turn-- < 0) player.x = SCR_W;
    return;
  }
  player.move();
  // モリを投げた？
  if (player.isShooting) {
    player.isShooting = false;
    if (moriList.length < MAX_MORI) {
      var mori = new Mori();
      moriList.push(mori);
    }
  }
  // モリの移動
  for (var i = 0; i < moriList.length; i++) {
    var mori = moriList[i];
    mori.move();
  }
}
// キーが押された時
function onKeyHandler(e) {
  var code = e.keyCode;
  console.log("key=" + code);
  switch (code) {
  case 13: // [Enter]
    initGame();
    break;
  case 90: // [z]
    player.isShooting = true;
    break;
  case 37: // left
  case 38: // top
  case 39: // right
  case 40: // down
    player.dir = (code - 37) + 1;
    break;
  }
}
// キャラクタの描画
function drawChars(frIndex) {
  // 背景を透明に
  ctx.clearRect(0,0,SCR_W,SCR_H);
  // 魚たちを描画
  for (var i = 0; i < fishes.length; i++) {
    var f = fishes[i];
    var ch = f.type + frIndex % 2;
    ctx.drawImage(images[ch], f.x, f.y);
  }
  // モリを描画
  for (var i = 0; i < moriList.length; i++) {
    var mori = moriList[i];
    ctx.drawImage(images[T_MORI], mori.x, mori.y);
  }
  // プレイヤーを描画
  var pl = frIndex % 2;
  if (isGameOver) pl += T_HIT;
  ctx.drawImage(images[pl], player.x, player.y);
}
// 背景の初期化
function initBack() {
  var bc = Math.floor(SCR_W / BACK_W) + 1;
  // ブロックをランダムに埋める
  back.blocks = [];
  for (var i = 0; i < bc; i++) {
    back.blocks.push(random(back.images.length));
  }
}
// 背景の描画（スクロール）
function drawBack() {
  if (frame.index % 4 != 0) return;
  // 背景の描画
  var blocks = back.blocks;
  for (var i = 0; i < blocks.length; i++) {
    back.ctx.drawImage(
      back.images[blocks[i]], i * BACK_W, 0);
  }
  blocks.push(blocks.shift());
}
// 画像の読み込み
function loadImages(files, nextFunc) {
  var result = [];
  var count = 0;
  for (var i = 0; i < files.length; i++) {
    var img = new Image();
    img.src = "img/" + files[i] + ".png";
    img.index = i;
    img.onload = function (e) {
      var t = e.target;
      result[t.index] = t;
      count++;
      if (files.length == count) nextFunc();
    };
  }
  return result;
}
// --- クラス定義 ---
// 登場人物を表すスーパークラス
function Character() {
  this.type = 0;
  this.dir = 1;
  this.x = 10;
  this.y = SCR_H / 2;
  this.width = 0;
  this.height = 0;
}
Character.prototype.setType = function (type) {
  this.width = images[type].width;
  this.height = images[type].height;
};
Character.prototype.remove = function (list) {
  var i = list.indexOf(this);
  list.splice(i, 1);
  delete this;
};
Character.prototype.isHit = function (target) {
  var a = this, b = target;
  return (b.x <= a.x + a.width &&
          a.x <= b.x + b.width &&
          b.y <= a.y + a.height &&
          a.y <= b.y + b.height);
}

// プレイヤーの管理クラス(Characterを継承)
function Player() {
  Character.call(this);
  this.setType(T_PLAYER);
  this.isShooting = false;
}
Player.prototype = new Character(); // 継承
Player.prototype.move = function () {
  var x = this.x + DIR_TABLE[this.dir].x * 4;
  var y = this.y + DIR_TABLE[this.dir].y * 4;
  if (0 <= x && x < SCR_W - 60) this.x = x;
  if (0 <= y && y < SCR_H - 30) this.y = y;
};

// 魚の管理クラス(Characterを継承)
function Fish(type) {
  Character.call(this);
  this.setType(type);
  // 魚の出現位置を決定
  this.x = SCR_W - 50;
  this.y = random(SCR_H - 50);
  // 魚ごとに異なるパラメータをセット
  this.type = type;
  switch (type) {
    case T_SABA:
      this.move = this.moveSaba;
      this.score = 3;
      break;
    case T_KURAGE:
      this.move = this.moveKurage;
      this.score = 1;
      break;
    case T_SAME:
      this.move = this.moveSame;
      this.score = 2;
      break;
  }
}
Fish.prototype = new Character();
// 魚がスクリーン内に収まるかチェック
Fish.prototype.check = function () {
  // 上下右ならば範囲補正
  if (this.y < 0) this.y = 0;
  if (this.y > SCR_H - 30) this.y = SCR_H - 30;
  if (this.x > SCR_W - 50) this.x = SCR_W - 50;
  // プレイヤーに当たったか
  if (this.isHit(player)) {
    msgBox("GAME OVER/SCROE:" + score);
    isGameOver = true;
    player.turn = 5;
    moriList = [];
  }
  // 左側に消える場合の処理
  if (this.x < 0) this.remove(fishes);
};
Fish.prototype.moveSaba = function () {
  if (this.dir == 3) this.dir = 1;
  this.x += DIR_TABLE[this.dir].x * 6;
  this.y += DIR_TABLE[this.dir].y * 6;
  if (random(30) == 0) {
    this.dir = randomS([1,1,1,2,4]);
  }
};
Fish.prototype.moveKurage = function () {
  this.x += DIR_TABLE[this.dir].x * 3;
  this.y += DIR_TABLE[this.dir].y * 3;
  if (random(20) == 0) {
    this.dir = randomS([1,1,1,2,3,4,0]);
  }
};
Fish.prototype.moveSame = function () {
  this.x -= 12;
  this.y += (player.y - this.y > 0) ? 3 : -3;
};
Fish.prototype.waitHitAnim = function () {
  if (this.turn-- <= 0) {
    this.remove(fishes);
  }
}

// モリを管理するクラス
function Mori() {
  Character.call(this);
  this.setType(T_MORI);
  this.x = player.x + images[0].width / 2;
  this.y = player.y;
}
Mori.prototype = new Character();
Mori.prototype.move = function () {
  this.x += 8;
  if (this.x > SCR_W) {
    this.remove(moriList);
  }
  // 魚に当たった？
  for (var i = 0; i < fishes.length; i++) {
    var f = fishes[i];
    if (this.isHit(f)) {
      console.log("hit");
      score += f.score;
      msgBox("SCORE:" + score);
      // 魚を星マークに変える
      f.type = T_HIT;
      f.move = f.waitHitAnim;
      f.turn = 10;
      f.score = 0;
      // モリを消す
      this.remove(moriList);
      break;
    }
  }
};
// ------------------------------------------
function random(v) {
  return Math.floor(Math.random() * v);
}
function randomS(ary) {
  return ary[random(ary.length)];
}
function $(id) {
  return document.getElementById(id);
}
