import java.util.LinkedList;
import java.util.Iterator;

class Bullet{
  float bx, by, vx, vy;
  Bullet(float bx, float by,
  
  float vx, float vy){
    this.bx = bx; this.by = by;
    this.vx = vx; this.vy = vy;
  }  

  void move(){
    bx = bx + vx;
    by = by + vy;
  }
}

PImage bg, ch, b;
float cx, cy, speed;
LinkedList<Bullet> bullets = new LinkedList<Bullet>();

void setup(){
  size(1136, 640);
  bg = loadImage("bg.png");
  ch = loadImage("ch.png");
  b = loadImage("b.png");
  cx = 1136/2 - ch.width/2;
  cy = 640/2 - ch.height/2 + 150;
  speed = 5;
}

void mousePressed(){
  float bx = cx + ch.width/2 - b.width/2;
  float by = cy + ch.height/2 - b.height/2;
  for(int i=30; i<180; i=i+30){
    Bullet bullet = new Bullet(bx, by, cos(radians(i)) * speed,
                                      -sin(radians(i)) * speed);
    bullets.add(bullet);
  }
}

void draw(){
  background(bg);
  image(ch, cx, cy);
  for(Iterator it = bullets.iterator(); it.hasNext();){
    Bullet bullet = (Bullet)it.next();
    image(b, bullet.bx, bullet.by);
    bullet.move();
    if(bullet.bx<0 || bullet.bx>1136 ||
      bullet.by<0 || bullet.by>640){
      it.remove();
    }
  }
}

