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

void drawArm(float x, float y, float len, float angle){
  strokeWeight(1/(scale/4));
  translate(x,y);
  rotate(angle);
  line(0, 0, 0, len);
  stroke(255,0,0);
  drawPoint(0,0);
  drawPoint(0,len);
  stroke(255);
}

float anguloSup = 0.0;
float anguloInf = 0.0;

// Velocidade do braço superior, 30graus/2s, ou 1/12*pi rad / s
float aVelSup = (1.0/12.0)*PI;

// Velocidade do braço inferior, 60graus/2s, ou 1/6*pi rad/s
float aVelInf = (1.0/6.0)*PI;

boolean stop = false;

void draw() {
  
  setupCoordinateSystem();
  background(0,0,0);
  setupScreen();

  //drawRoboticArm();
  
  if(!stop){
    anguloSup += aVelSup/60;
    anguloInf += aVelInf/60;
  }
  
  if(anguloSup >= radians(30) || anguloInf >= radians(60)){
    stop = true;
  }
  
  pushMatrix();
  drawArm(0, 0, 3, anguloInf);
  drawArm(0, 3, 2, anguloSup);
  popMatrix();

  stroke(255,0,0);

  //drawPoint(0,5);
  //drawPoint(0,3);
  
  
  
  
  
}
