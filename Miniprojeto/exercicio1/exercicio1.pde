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

float theta = 0.0;
float aVelocity = HALF_PI/framerate;
int forward = 1;
void draw() {
  setupCoordinateSystem();
  background(0,0,0);
  stroke(255);
  
  //rotate(a+=0.05);
  drawPoint((theta/PI + 1)*cos(theta), (theta/PI + 1)*sin(theta));
  if(theta < atan2(0,-1) && forward == 1){
    theta += aVelocity;
  } else {
    forward = 0;
    theta -= aVelocity;
  }
  
  if(theta < atan2(0,0) && forward == 0){
    forward = 1;
  }
  
  drawPoint(-2,0);
  
  setupScreen();
}
