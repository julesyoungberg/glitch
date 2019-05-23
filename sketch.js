let glitch, isLoaded = false, paused = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
  loadImage("eerie.jpg", img => {
    glitch = new Glitcher(img);
    isLoaded = true;
  });
}

function draw() {
  if (paused) return;
  // clear();
  // background(0);
  if (isLoaded) glitch.show();
}

function keyPressed() {
  if (key == " ") paused = !paused;
}
