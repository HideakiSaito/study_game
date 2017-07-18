// card7.js
// 変数の初期化
var CARD_W = 70, CARD_H = 105;
var P_INDEX = 3;  // プレイヤーの順番
var images  = []; // カード表示用の画像Image配列
var players = []; // 各プレイヤーの手札(2次元配列)
var passNums= []; // パスした回数
var stage   = []; // ステージ上のカード
var turnNo;       // 誰のターンかを表す
var orders  = []; // 順位
var hands_c, stage_c; // 描画用コンテキスト
// HTMLの初期化イベントを登録
window.onload = init;
function $(id) { return document.getElementById(id); }
// 初期化
function init() {
  // 描画用コンテキストの取得
  stage_c = $("stage_cvs").getContext("2d");
  hands_c = $("hands_cvs").getContext("2d");
  // マウスイベントの設定
  $("hands_cvs").onmousedown = mouseHandler;
  // カード画像の読み込み
  loadCardImage(startGame);
}
// カード画像を読込
function loadCardImage(onCompleted) {
  // カードのファイル名を設定
  var files = [];
  var ctypes = ["s","h","d","c"];
  for (var t = 0; t < 4; t++) {
    for (var n = 1; n <= 13; n++) {
      var mark = ctypes[t];
      var no   = "00" + n;
      no = no.substr(no.length-2,2);
      var f = "gif/" + mark + no + ".gif";
      files.push(f);
    }
  } 
  // カードの読み込みを行う
  var num_load = 0;
  for (var i = 0; i < files.length; i++) {
    var img = new Image();
    img.onload = function () {
      num_load++;
      if (num_load == files.length) {
        onCompleted();
      }
    };
    img.onerror = function() {
      alert("読み込みに失敗。" +
            "リロードしてください。");
    };
    img.src = files[i];
    images[i] = img;
  }
}
// ゲームの開始処理
function startGame() {
  passNums = [0,0,0,0]; 
  orders = [];
  $("pass").innerHTML = "パス";
  shuffleCard();
  drawCard();
  turnNo = 0;
  nextTurn();
}
// カードをシャッフルする
function shuffleCard() {
  // ステージを空にする
  for (var i = 0; i < 52; i++) {
    stage[i] = 0;
  }
  // カードを作成する
  var cards = [];
  for (var i = 0; i < 52; i++) {
    cards[i] = i;
  }
  // カードをシャッフルする
  for (var i = 51; i > 0; i--) {
    var r = rnd(i+1);
    var tmp = cards[i];
    cards[i] = cards[r];
    cards[r] = tmp;
  }
  // 4人に配分する
  players = [];
  for (var u = 0; u < 4; u++) players[u] = [];
  for (var i = 0; i < 52; i++) {
    var u = Math.floor(i % 4);
    var n = cards[i];
    // 7ならばステージに配る
    if (n % 13 == 6) {
      stage[n] = 1;
      continue;
    }
    players[u].push(cards[i]);
  }
  // 出しやすいようにカードを並び替える
  players[P_INDEX].sort(function(a,b){
    return a - b;
  });  
}
// 簡易ランダム関数
function rnd(c) {
  return Math.floor(Math.random() * c);
}
// ターン処理 
function nextTurn() {
  checkStage();
  if (checkEnd()) {
    turnNo = -1; drawCard();
    return;
  }
  if (turnNo != P_INDEX) {
    comTurn(turnNo);
  } else if (players[P_INDEX].length > 0) {
      drawCard();
      return;
  } 
  drawCard();
  turnNo = (turnNo + 1) % 4;
  setTimeout(nextTurn, 200);
}
// コンピュータの番
function comTurn(u) {
  var p = players[u];
  if (p.length == 0) return;
  // 手札に重み付け
  var imax = -1, vmax = -1;
  for (var i = 0; i < p.length; i++) {
    var no = p[i];
    if (!canDiscard(no)) continue;
    var n = no % 13;
    var point = rnd(3) + (7 - Math.abs(n - 6));
    if (vmax < point) {
      vmax = point;
      imax = i;
    }
  }
  // 出せる手札がない
  if (imax < 0) {
    passNums[u]++;
    if (passNums[u] > 3) { // 脱落
      dropOut(u);
    } 
    return;
  }
  // 手札を出す
  var no = p[imax];
  stage[no] = 1;
  p.splice(imax, 1);
  if (p.length == 0) {
    orders.push(u);
  }
  // ゲーム終了判定
  checkEnd();
}
// 脱落の処理
function dropOut(u) {
  var p = players[u];
  for (var i = 0; i < p.length; i++) {
    var no = p[i];
    stage[no] = 2;
  }
  players[u] = [];
}
// カードを描画する
function drawCard() {
  // カードを描画
  drawHand();
  drawStage();
  showInfo();
}
function showInfo() {
  // プレイヤーの情報を表示
  var s = "";
  for (var i = 0; i < 4; i++) {
    s += (turnNo == i) ? "<span class='turn'>" : "";
    s += (i == P_INDEX) ? "[YOU]" : "[COM"+(i+1)+"]";
    var r = orders.indexOf(i);
    if (r >= 0) {
      s += "(" + (r+1) + "位)";
    } else {
      if (passNums[i] > 3) {
        s += "脱落";
      } else {
        s += players[i].length + "枚 ";
        s += passNums[i] + "/3パス";
      }
    }
    s += "</span>&nbsp;&nbsp;";
  }
  $("info").innerHTML = s;
}
function drawHand() {
  hands_c.clearRect(0, 0,
    $("hands_cvs").width, $("hands_cvs").height);
  var p = players[P_INDEX];
  for (var i = 0; i < p.length; i++) {
    var x = i * CARD_W;
    var c = p[i];
    hands_c.drawImage(images[c],x,0);
    if (!canDiscard(c)) {
      hands_c.fillStyle = "RGBA(130,130,130,0.5)";
      hands_c.fillRect(x,0,CARD_W,CARD_H);
    }
  }
}
function drawStage() {
  for (var i = 0; i < 52; i++) {
    var card = stage[i];
    var x = (i % 13) * CARD_W;
    var y = Math.floor(i / 13) * CARD_H;
    if (card === 0) {
      stage_c.fillStyle = (i % 2 == 0) ? 
        "#e0e0e0" : "#f0f0f0";
      stage_c.fillRect(x, y, CARD_W, CARD_H);
      continue;
    }
    stage_c.drawImage(images[i], x, y);
    if (card == 2) {
      stage_c.fillStyle = "RGBA(0,0,255,0.5)";
      stage_c.fillRect(x, y, CARD_W, CARD_H);
    }
  }
}
// noの札を出せるか調べる
function canDiscard(no) {
  var n = no % 13;
  return (n > 6) ? (stage[no-1] === 1)
                 : (stage[no+1] === 1);
}
// マウスイベント
function mouseHandler(e) {
  if (turnNo != P_INDEX) return;
  // クリックした座標を得る
  var x = e.offsetX, y = e.offsetY;
  if (!e.hasOwnProperty('offsetX')) {
    var p = e.currentTarget;
    x = e.layerX - p.offsetLeft;
    y = e.layerY - p.offsetTop;
  }
  // クリックしたカードの番号を得る
  var p = players[P_INDEX];
  var i = Math.floor(x / CARD_W);
  var no = p[i];
  if (!canDiscard(no)) return;
  stage[no] = 1;
  p.splice(i, 1);
  if (p.length == 0) {
    orders.push(P_INDEX);
  }
  turnNo = 0; // 次のターンに
  nextTurn(); 
}
// パスをするとき
function pass() {
  if (checkEnd()) {
    startGame();
    return;
  }
  if (turnNo != P_INDEX) return;
  passNums[P_INDEX]++;
  if (passNums[P_INDEX] > 3) {
    dropOut(P_INDEX);
    drawCard();
  }
  turnNo = 0; // 次のターンに
  nextTurn();
}
// ゲーム終了したか判定
function checkEnd() {
  for (var i = 0; i < 52; i++) {
    if (stage[i] == 0) return false;
  }
  $("pass").innerHTML = "スタート";
  return true;
}
// 脱落ユーザーのカードを調べる
function checkStage() {
  for (var i = 0; i < 52; i++) {
    if (stage[i] != 2) continue;
    if (canDiscard(i)) {
      stage[i] = 1;
    }
  }
}

