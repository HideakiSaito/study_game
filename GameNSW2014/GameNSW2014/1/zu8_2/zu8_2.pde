PImage bg, ch1, ch2;
float c1x, c1y, c2x, c2y, c2vx, c2vy;
float speed = 5;

void setup(){
  size(1136, 640);
  bg = loadImage("bg.png");
  ch1 = loadImage("ch1.png");
  ch2 = loadImage("ch2.png");
  c2x = 1136 / 2;
  c2y = 640 / 2;
}

void mouseMoved(){
  c1x = mouseX; c1y = mouseY;
  float a = atan2(c1y - c2y, c1x - c2x);
  c2vx = cos(a) * speed;
  c2vy = sin(a) * speed;
}

boolean isHit(){
  return dist(c1x, c1y, c2x, c2y) < 30 ? true : false;
}

void draw() {
  background(bg);
  image(ch1, c1x - ch1.width/2,
  c1y - ch1.height/2);
  image(ch2, c2x - ch2.width/2,
  c2y - ch2.height/2);
  if(!isHit()){
    c2x = c2x + c2vx;
    c2y = c2y + c2vy;
  }
}
