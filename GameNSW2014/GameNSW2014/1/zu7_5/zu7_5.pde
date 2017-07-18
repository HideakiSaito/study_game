PImage ch, bg, b[];
int BSIZE = 64, CH_WHALF, CH_HHALF;
int cx, cy, vx, vy, tx, ty, g = 1, speed = 5;
boolean isJump;
int[][] map = {{1,1,1,1,1,1,1,1,1,1,1,1,1,1},
               {1,0,0,0,0,0,0,0,0,0,0,0,0,1},
               {1,0,0,0,1,1,0,0,0,0,0,0,0,1},
               {1,0,0,0,0,0,0,0,2,0,0,0,0,1},
               {1,0,0,0,0,0,0,0,3,0,0,0,0,1},
               {1,0,0,1,1,1,1,0,3,0,2,0,0,1},
               {1,0,0,0,0,0,0,0,3,0,3,0,0,1},
               {1,1,0,0,0,0,0,0,4,0,4,0,0,1},
               {1,1,1,1,1,1,1,1,1,1,1,1,1,1}};

void setup(){
  size(BSIZE * 14, BSIZE * 9);
  ch = loadImage("ch.png");
  bg = loadImage("bg.png");
  b = new PImage[5];
  b[1] = loadImage("1.png");
  b[2] = loadImage("2.png");
  b[3] = loadImage("3.png");
  b[4] = loadImage("4.png");
  CH_WHALF = ch.width / 2;
  CH_HHALF = ch.height / 2;
  cx = CH_WHALF + BSIZE * 6;
  cy = CH_HHALF + BSIZE * 7;
}

void drawMap(){
  background(bg);
  for(int y=0; y<9; y++){
    for(int x=0; x<14; x++){
      if(map[y][x] != 0){
        image(b[ map[y][x] ], BSIZE * x, BSIZE * y);
      }
    }
  }
}

void mousePressed(){
  if(!isJump){
    isJump = true; vy = -20;
  }
}

void jump(){
  cy = cy + vy;
  vy = vy + g;
  if(vy < 0){
    ty = (cy - CH_HHALF) >> 6;
    if(map[ty][(cx + CH_WHALF - speed) >> 6]!=0
    || map[ty][(cx - CH_WHALF + speed) >> 6]!=0){
      vy = 0;
    }
  }else{
    ty = (cy + CH_HHALF) >> 6;
    if(map[ty][(cx + CH_WHALF - speed) >> 6]!=0
    || map[ty][(cx - CH_WHALF + speed) >> 6]!=0){
      isJump = false;
      cy = (ty - 1) * BSIZE + CH_HHALF;
    }
  }
}

void ladybugMove(){
  if(isJump){ jump(); }
  vx = 0;
  if(mouseX > cx + CH_WHALF){
    vx = speed;
    cx = cx + vx;
    tx = (cx + CH_WHALF) >> 6;
  }else if(mouseX < cx - CH_WHALF){
    vx = -speed;
    cx = cx + vx;
    tx = (cx - CH_WHALF) >> 6;
  }
  ty = cy >> 6;
  if(map[ty][tx] != 0){ cx = cx - vx; }
  if(map[ty+1][(cx + CH_WHALF - speed) >> 6]==0
  && map[ty+1][(cx - CH_WHALF + speed) >> 6]==0){
    if(!isJump){ isJump = true; vy = 2; }
  }
  image(ch, cx - CH_WHALF, cy - CH_HHALF);
}

void draw(){
  drawMap();
  ladybugMove();
}


