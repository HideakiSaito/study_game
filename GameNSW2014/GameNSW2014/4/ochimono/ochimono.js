// 定数宣言 ----- (*1)
var PIECE_W = 64; // 落ち物1ピースの幅
var PIECE_H = 64; // 落ち物1ピースの高
var STAGE_COLS = 8; // ステージの列数
var STAGE_ROWS = 7; // ステージの行数
var STAGE_W = STAGE_COLS * PIECE_W;
var STAGE_H = STAGE_ROWS * PIECE_H;
var FILE_RESOURCE = "resource.png"; // リソースファイルの名前
var PIECE_TYPES = 5; // キャラ動物の種類
var TURN_TIME = 300; // 1ターンの時間
var DROP_TURN = 3;   // 3ターンに1度ピースが落下する
var DROP_TIME = TURN_TIME * DROP_TURN;
var URDL = [[-1,0],[0,1],[1,0],[0,-1]]; // 上下左右
// 変数宣言-------(*2)
var aCanvas, ctx; // キャンバスのオブジェクト
var imgChars; // キャラ画像用Imageオブジェクト
var px, py; // 落下ピースの座標
var pc;     // 落下ピースの形状
var userLR, userRO, userDN; // ユーザーの操作状況
var stage = []; // ステージデータ
var turnCount; // 現在何ターン目かを数える
var score; // スコア
// --------------------------------------------------
// ページの初期化イベント --------(*3)
window.onload = function () {
  // 描画用Canvasの取得
  aCanvas = $("aCanvas");
  aCanvas.width = STAGE_W;
  aCanvas.height = STAGE_H;
  ctx = aCanvas.getContext("2d");
  // 画像のロード -------------(*4)
  imgChars = new Image();
  imgChars.onload = newGame;
  imgChars.src = FILE_RESOURCE;
  // キーボードイベントの設定 --------(*5)
  window.onkeydown = keyHandler;
  $("btnLeft").onmousedown = goLeft; //-----(*5a)
  $("btnLeft").ontouchstart = goLeft;
  $("btnRight").onmousedown = goRight;
  $("btnRight").ontouchstart = goRight;
  $("btnRotate").onmousedown = goRotate;
  $("btnRotate").ontouchstart = goRotate;
};
// 新規ゲーム開始 ----------(*6)
function newGame() {
  initStage();
  px = py = -1; pc = [];
  userLR = userUD = userDN = 0;
  turnCount = score = 0;
  disp("0点");
  nextTurn();
}
// ステージを0で初期化する-------(*7)
function initStage() {
  stage = [];
  for (var y = 0; y < STAGE_ROWS; y++) {
    var n = stage[y] = [];
    for (var x = 0; x < STAGE_COLS; x++) {
      n[x] = 0;
    }
  }
}
// キーボードイベント----------(*8)
function keyHandler(e) {
  switch (e.keyCode) {
    case 37: userLR = -1; break;
    case 38: userRO = 1; break;
    case 39: userLR = 1; break;
    case 40: userDN = 1; break;
  }
}
// ターンを進める --------------(*9)
function nextTurn() {
  checkUserInput();
  if (turnCount % DROP_TURN == 0) {
    if (!dropPiece()) return;
    gravity(); // 下に落ちるピースがあるか確認
  }
  drawStage();
  turnCount++;
  setTimeout(nextTurn, TURN_TIME);
}
// 落下中のピースを動かす------(*10)
function checkUserInput() {
  if (py < 0) return;
  if (userLR != 0) { // 左右移動
    var xx = userLR + px;
    if (checkBlank(py, xx)) {
      px = xx;
    }
    userLR = 0;
  }
  if (userDN > 0) { // 下に移動
    var yy = py + 1;
    if (checkBlank(yy, px)) {
      py = yy;
    }
    userDN = 0;
  }
  if (userRO > 0) { // 回転 ---------------(*11)
    var pc2 = rotate(pc); // 回転した形状を作る
    var tmp = pc; // 現在の状態を覚えておく
    pc = pc2;
    if (!checkBlank(py, px)) { // 回転可能か？
      pc = tmp; // 無理ならば以前の形状に戻す
    }
    userRO = 0;
  }
}
// ピースを下に落とす----------------(*12)
function dropPiece() {
  if (py < 0) { // 画面にピースがない状態--(*13)
    pc = [[1 + rand(PIECE_TYPES), 0], 
          [1 + rand(PIECE_TYPES), 0]];
    if (rand(2)) pc = rotate(pc);
    px = rand(STAGE_COLS-2);
    py = 0;
    if (!checkBlank(py, px)) { 
      drawStage();
      alert("Game Over");
      newGame();
      return false;
    }
    return true;
  }
  // 下に移動できるか？-------------(*14)
  var r = checkBlank(py+1, px);
  if (!r) { // 移動できないので定着
    iter2d(pc, function(y, x, c) {
      if (c == 0) return true;
      stage[py + y][px + x] = c;
      return true;
    });
    px = py = -1; pc = [];
  } else {
    py++; // 落下する
  }
  return true;
}
// 移動先にピースが存在するか確認する--------(*15)
function checkBlank(ty, tx) {
  var isBlank = true;
  iter2d(pc,function(y, x, c) {
    var xx = tx + x;
    var yy = ty + y;
    if (c == 0) return true; 
    if (xx < 0 || yy < 0 ||  //---------------(*16)
        yy >= STAGE_ROWS ||
        xx >= STAGE_COLS) {
      isBlank = false;
      return false;
    }
    var cc = stage[yy][xx]; //-------------(*17)
    if (cc != 0) {
      isBlank = false;
      return false;
    }
    return true;
  });
  return isBlank;
}
// 上下か左右に3つ同じ種類があれば消える-------(*18)
function checkPoping() {
  var total = 0;
  iter2d(stage, function(y, x, c) {
    if (c == 0) return true;
    // 上下左右で同じ色の数を数える
    var cnt = countSameType(y,x,c);
    // 上下左右に3つ並んで言えれば消す
    if (cnt >= 3) {
      popSameType(y, x, c);
      total += cnt;
    }
    return true;
  });
  if (total > 0) {
    score += total * 2;
    disp(score+"点");
  }
}
// 同じ種類のピースを数える --------(*19)
function countSameType(y, x, c) {
  var count = 0;
  for (var i in URDL) {
    var cnt = 0;
    var dir = URDL[i];
    var yy = y, xx = x;
    for (;;) {
      if (yy < 0 || yy >= STAGE_ROWS ||
          xx < 0 || xx >= STAGE_COLS) break;
      if (c == 0 || c != stage[yy][xx]) break;
      cnt++;
      if (cnt >= 3) count += cnt;
      yy += dir[0];
      xx += dir[1];
    }
  }
  return count;
}
// 同じ種類のピースを消す---------(*21)
function popSameType(y, x, c) {
  if (c == 0) return 0;
  if (y < 0 || y >= STAGE_ROWS) return 0;
  if (x < 0 || x >= STAGE_COLS) return 0;
  if (c != stage[y][x]) return 0;
  stage[y][x] = 0; // 削除する
  var count = 1;
  // 上下左右を確認する
  for(var i = 0; i < URDL.length; i++) {
    var dir = URDL[i];
    var yy = y + dir[0];
    var xx = x + dir[1];
    var cnt = popSameType(yy,xx,c);
    count += cnt;
  }
  return count;
}
// 重力でピースが落ちる
function gravity() {
  var count = 0;
  for (var y = 1; y < STAGE_ROWS; y++) {
    var row = STAGE_ROWS - y - 1;
    for (var x = 0; x < STAGE_COLS; x++) {
      var c = stage[row][x];
      if (c == 0) continue;
      if (stage[row+1][x] == 0) { // 下に落とす
        stage[row+1][x] = c;
        stage[row][x] = 0;
        count++;
      }
    }
  }
  setTimeout(checkPoping, DROP_TIME);
}
// ステージの内容を描画する--------(*22)
function drawStage() {
  ctx.clearRect(0,0,STAGE_W,STAGE_H);
  // 固定ブロックの描画
  iter2d(stage, function(y,x,c) {
    var xx = x * PIECE_W;
    var yy = y * PIECE_H;
    if (c == 0) {
      ctx.strokeStyle = "gray";
      ctx.strokeRect(xx, yy,
       PIECE_W, PIECE_H);
      return true; 
   }
    drawChar(xx, yy, c);
    return true;
  });
  // 落下中のピースを描画
  iter2d(pc, function(y, x, c) {
    if (c == 0) return true;
    var xx = (px + x) * PIECE_W;
    var yy = (py + y) * PIECE_H;
    drawChar(xx, yy, c);
    return true;
  });
}
// キャラクタ画像cを(x,y)へ描画する----(*23)
function drawChar(x, y, c) {
  ctx.drawImage(imgChars,
    (c - 1) * PIECE_W, 0, 
    PIECE_W, PIECE_H,
    x, y, PIECE_W, PIECE_H);
}
// 整数の乱数を返す関数
function rand(n) {
  return Math.floor(Math.random() * n);
}
// 二次元配列を回転させる
function rotate(p) {
  var r = [ [ p[1][0], p[0][0] ],
            [ p[1][1], p[0][1] ] ];
  return r;
}
// 二次元配列変数を巡回する
function iter2d(tbl, callback) {
  for (var y = 0; y < tbl.length; y++) {
    var cells = tbl[y];
    for (var x = 0; x < cells.length; x++) {
      var r = callback(y, x, cells[x]);
      if (!r) return;
    }
  }
}
// ソフトキーボード操作用
function goLeft(e) {
  e.preventDefault();//------(*25)
  userLR = -1;
}
function goRight(e) {
  e.preventDefault();//------(*25)
  userLR = 1;
}
function goRotate(e) {
  e.preventDefault();//------(*25)
  userRO = 1;
}
// スコアを画面に表示する
function disp(s) {
  $("info").innerHTML = s;
}
// DOM要素セレクタ
function $(id) {
  return document.getElementById(id);
}
