final int framerate = 60; 
final float scale = 30.0;

void setup() {
  size(800, 600, P2D);
  frameRate(framerate);
}

void setupCoordinateSystem() {
  translate(width / 2, height / 2);
  scale(scale, -scale);

}

void setupScreen(){
  stroke(255);
  strokeWeight(1/scale);
  line(0,-500,0,500);
  line(-500, 0, 500, 0);
  for(int j = -width/2; j <= width/2; j++){
    line(-0.1 , j, 0.1, j);
  }
  
  for(int i = -height/2; i <= height/2; i++){
    line(i , -0.1, i, 0.1);
  }
}

void drawPoint(float x, float y){
  strokeWeight(1/(scale/6));
  point(x, y);
  strokeWeight(1/scale);
}

void drawRoboticArm(){
  stroke(169,169,169);
  fill(255,255,102);
  
  rect(-0.5, -0.5, 1, 4, 1);
  rect(-0.5, 2.5, 1, 3, 1);
  
  stroke(255);
  fill(255);
}

void draw() {
  setupCoordinateSystem();
  background(0,0,0);
  setupScreen();

  drawRoboticArm();

  stroke(255,0,0);

  drawPoint(0,5);
  drawPoint(0,3);
  drawPoint(0,0);
  
  
  
  
}
