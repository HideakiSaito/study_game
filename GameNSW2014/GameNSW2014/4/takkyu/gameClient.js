// クライアント側卓球ゲームプログラム
// 大域変数 -------------- (*1)
var SERVER_URI = "ws://localhost:8888";
var DISP_W = 600, DISP_H = 300; // 画面サイズ
var ws;             // WebSocketのオブジェクト
var playerNo;       // プレイヤーID
var cv, ctx;        // <canvas>と描画コンテキスト
var ball, players;  // ボールとプレイヤーの情報
var resetAnime = -1;// 画面を光らせるためのカウンター
// 初期化イベント -------------- (*2)
window.onload = function () {
  // 描画コンテキストの取得
  cv = $("mainCV");
  ctx = cv.getContext("2d");
  // キーイベントの設定
  window.onkeydown = keyDownHandler;
  window.onkeyup   = keyUpHandler;
  // サーバーへ接続する
  connectToServer();
};
// WebScoketサーバーへ接続する ---- (*3)
function connectToServer() {
  ws = new WebSocket(SERVER_URI);
  ws.onopen = function () {
    console.log("サーバーに接続");
  };
  ws.onclose = function (e) {
    info("サーバーから切断されました");
  };
  ws.onmessage = commandFromServer;
}
// サーバーから届くメッセージを処理 ----- (*3)
function commandFromServer(e) {
  var data = e.data;
  var ps = data.split(">", 2);
  var cmd = ps.shift();
  switch (cmd) {
    case "msg":
      info(ps[0]);
      break;
    case "you":
      playerNo = ps[0];
      break;
    case "start":
      resetAnime = 5;
      info(ps[0]);
      break;
    case "draw":
      var o = JSON.parse(ps[0]);
      console.log(o.ball.x, o.ball.y);
      ball = o.ball;
      players = o.players;
      draw();
      break;
    case "close":
      ws.close();
      info(ps[0]);
      break;
    case "gameover":
      info("勝負あり! " +
        ((ps[0] == playerNo) ? "勝ち" : "負け") +
        "...再勝負はEnterキー");
      break;
    default:
      console.log(data);
  }
}

// 画面の描画 ----- (*4)
function draw() {
  ctx.clearRect(0,0,DISP_W,DISP_H);
  if (resetAnime-- > 0) {
    ctx.fillStyle = (resetAnime % 2 == 0) ? "blue" : "purple";
    ctx.fillRect(0,0,DISP_W,DISP_H);
  }
  ctx.strokeStyle = "gray";
  ctx.lineWidth = 1;
  ctx.strokeRect(0,0,DISP_W,DISP_H);
  // 中央に線
  var w = DISP_W / 2;
  ctx.beginPath();
  ctx.moveTo(w, 0);
  ctx.lineTo(w, DISP_H);
  ctx.stroke();
  // プレイヤーのラケットを表示
  for (var i = 0; i <= 1; i++) {
    var p = players[i];
    ctx.fillStyle = (playerNo == i) ? "red" : "gray";
    var w2 = p.w / 2;
    ctx.fillRect(p.x - w2, p.y, p.w, p.h);
  }
  // ボールを描画
  ctx.beginPath();
  ctx.fillStyle = "white";
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
  ctx.fill();
  // スコア表示
  $("score").innerHTML = 
    players[0].score + " : " + 
    players[1].score;
}

// キーの処理 ---- (*5)
function keyDownHandler(e) {
  var code = e.keyCode;
  if (code == 38) { // up
    ws.send("key>" + playerNo + ">-1");
  }
  else if (code == 40) { // down
    ws.send("key>" + playerNo + ">1");
  }
  else if(code == 13) { // Enter
    ws.send("enter>" + playerNo);
  }
  else if(code == 32) { // Space
    ws.send("space>" + playerNo);
  }
}
function keyUpHandler(e) {
  ws.send("key>" + playerNo + ">0");
}

function info(msg) {
  $("info").innerHTML = msg;
}
function $(id) {
  return document.getElementById(id);
}

