// WebSocket ゲームサーバー
var ws = require("websocket.io");
// 大域変数の宣言
var WS_PORT   = 8888; // Socketのポート番号
var DISP_W = 600, DISP_H = 300; // ディスプレイサイズ
var BALL_R = 8; BALL_SPEED = 20; // ボールの情報
var BAR_W = 16, BAR_H = 70, BAR_SPEED = 15; // ラケットの情報
var WIN_POINT = 3;          // 勝ち点の指定
var timerId = 0;            // タイマーID
var ball = {};              // ボール情報を管理
var players = [], keys = [];// プレイヤーとキー情報を管理
var isStop = false; startPlayer = 0,isGameOver = true; // 各種フラグ

// WebSocketサーバーの起動
var server = ws.listen(WS_PORT, function () {
  console.log("起動しました!\nport=" + WS_PORT);
});
// サーバーへの接続イベント ----- (*1)
server.on("connection", function (client) {
  console.log("clients=" + server.clientsCount);
  // 最大接続数の確認
  if (server.clientsCount > 2) {
    client.send("close>人数オーバー。少し待ってリロードしてね。");
    client.close();
    return;
  }
  if (server.clientsCount == 1) {
    client.send("msg>対戦相手が来るまで待ってね。");
    client.send("you>0");
  }
  else if (server.clientsCount == 2) {
    client.send("you>1");
    initGame();
  }
  console.log("connect");
  client.on('message', onMessage);
  client.on('error', function(err) {
    console.log('error:' + err);
  });
  client.on('close', function() {
    console.log('close');
  });
});
// ゲームの初期化 ------- (*2)
function initGame() {
  isGameOver = false;
  isStop = true;
  startPlayer = 1; // 後から入った方が開始タイミングを決める
  // ラケットの位置をセット
  var p0 = {no:0}, p1 = {no:1};
  p0.score = p1.score = 0;
  p0.x = BAR_W * 2;
  p1.x = DISP_W - BAR_W * 2;
  p0.y = p1.y = Math.floor((DISP_H - BAR_H) / 2);
  p0.w = p1.w = BAR_W ;
  p0.h = p1.h = BAR_H;
  players = [p0, p1];
  keys = [0, 0];
  // ボールの位置をセット
  ball.x = p1.x - BAR_W;
  ball.y = p1.y + BAR_H / 2;
  ball.r = BALL_R;
  ball.dx = -1 * BALL_SPEED;
  ball.dy = randSelect([1,-1]) * rand(BALL_SPEED);
  // パラメータをクライアントに送信
  sendDrawInfo();
  // タイマーをセット----(*3)
  if (timerId == 0) { 
    timerId = setInterval(gameLoop, 100);
  }
  // 開始を合図
  sendAll("start>ゲーム開始! Spaceキーで玉を打つ");
}
// ゲームループ --- (*4)
function gameLoop() {
  moveBall();
  movePlayer();
  sendDrawInfo();
}
// プレイヤーの移動
function movePlayer() {
  for (var i = 0; i < 2; i++) {
    if (keys[i] == 0) continue;
    var y = players[i].y + keys[i] * BAR_SPEED;
    if (0 <= y && y < DISP_H - BAR_H) {
      players[i].y = y;
      if (isStop && startPlayer == i) {
        ball.y = players[i].y + BAR_H / 2;
      }
    }
  }
}
// ボールの移動
function moveBall() {
  if (isStop || isGameOver) return;
  ball.x += ball.dx;
  ball.y += ball.dy;
  var x = ball.x, y = ball.y;
  // ボールの反射(Y軸)
  if (y < 0 || y > DISP_H) {
    ball.dy *= -1;
    ball.y += ball.dy;
  }
  // ボールの反射(X軸)
  var isHit = function (p, newPosX, dir, ep) {
    var r = ball.r; // 当たり判定を少し甘く
    var isOK = (p.y-r <= y && y <= p.y+p.h+r);
    ball.x = newPosX;
    ball.dx = BAR_SPEED * dir;
    ball.dy = randSelect([-1,1]) * rand(BALL_SPEED);
    if (!isOK) {
      ep.score++;
      isStop = true;
      startPlayer = p.no;
      sendAll("start>Spaceキーでボールを打つ");
      ball.y = p.y + p.h / 2;
      if (ep.score >= WIN_POINT) {
        gameOver(ep.no);
      } 
    }
    return isOK;
  };
  var p0 = players[0], p1 = players[1];
  if (x < p0.x) {
    isHit(p0, p0.x + p0.w, 1, p1);
  }
  else if (x > p1.x) {
    isHit(p1, p1.x - p1.w, -1, p0);
  }
}
// クライアントからのメッセージが来たとき
function onMessage(msg) {
  var ps = msg.split(">");
  var cmd = ps.shift();
  if (cmd == "key") {
    var no = parseInt(ps[0]);
    var v  = parseInt(ps[1]);
    keys[no] = v;
  }
  else if (cmd == "enter") {
    if (isGameOver) {
      initGame();
    }
  }
  else if(cmd == "space") {
    if (ps[0] == startPlayer) isStop = false;
  }
  else {
    console.log(msg);
  }
}
// ゲームオーバー
function gameOver(winner) {
  sendDrawInfo();
  isStop = true;
  starPlayer = winner;
  isGameOver = true;
  sendAll("gameover>"+winner);
}
// プレイヤーとボールの位置をクライアントに送信
function sendDrawInfo() {
  var o = {"ball": ball, "players": players};
  sendAll("draw>" + JSON.stringify(o));
}
// 全てのクライアントにデータを送信
function sendAll(msg) {
  server.clients.forEach(function(client){
    if (client == null) return;
    client.send(msg);
  });
}
// 整数の乱数を発生する
function rand(c) {
  return Math.floor(Math.random() * c);
}
// 配列内の要素のいずれかをランダムに返す
function randSelect(a) {
  return a[rand(a.length)];
}


