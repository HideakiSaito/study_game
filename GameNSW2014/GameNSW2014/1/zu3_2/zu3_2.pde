PImage bg, ch, b;
float cx, cy;
float bx, by, vx, vy;
boolean fired = false;

void setup(){
  size(1136, 640);
  bg = loadImage("bg.png");
  ch = loadImage("ch.png");
  b = loadImage("b.png");
  cx = 1136/2 - ch.width/2;
  cy = 640/2 - ch.height/2;
  vx = 4; vy = -8;
}

void mousePressed(){
  if(fired){ return; }
  fired = true;
  bx = cx + ch.width/2 - b.width/2;
  by = cy + ch.height/2 - b.height/2;
}

void draw(){
  background(bg);
  image(ch, cx, cy);
  if(fired){
    image(b, bx, by);
    bx = bx + vx;
    by = by + vy;
    if(bx<0 || bx>1136 || by<0 || by>640){
      fired = false;
    }
  }
}

