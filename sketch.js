let glitch, isLoaded = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  loadImage("eerie.jpg", img => {
    glitch = new Glitcher(img);
    isLoaded = true;
  });
}

function draw() {
  clear();
  background(0);
  if (isLoaded) glitch.show();
}
