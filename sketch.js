let glitch, isLoaded = false;
let iconGlitch, isIconLoaded = false;
let mic, fft, peakDetect;
let centroid, avgCentroid = 1000;
let level, avgLevel = 0.5;

function setup() {
  createCanvas(windowWidth, windowHeight);

  loadImage("eerie.jpg", img => {
    glitch = new Glitcher(img);
    isLoaded = true;
  });

  loadImage("speaker.png", img => {
    iconGlitch = new Glitcher(img);
    isIconLoaded = true;
  });

  mic = new p5.AudioIn();
  mic.start();
  fft = new p5.FFT();
  fft.setInput(mic);
  // TODO: create multiple peak detectors for different freq ranges
  peakDetect = new p5.PeakDetect();
}

function draw() {
  clear();
  background(0);

  fft.analyze();
  peakDetect.update(fft);
  const isPeak = peakDetect.isDetected;

  updateCentroid();
  const highCentroid = centroid > avgCentroid;

  updateLevel();
  const scale = map(avgLevel, 0, 1, 0.2, 0.8);

  if (isLoaded) glitch.show(isPeak, highCentroid);
  // if (isIconLoaded) iconGlitch.show(isPeak, highCentroid, scale);

  // TODO: intelligently adjust threshold
  peakDetect.threshold = 0.3;
}

function mousePressed() {
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
  }
}

function updateCentroid() {
  const factor = 0.95;
  centroid = fft.getCentroid();
  avgCentroid = factor * avgCentroid + (1 - factor) * centroid;
}

function updateLevel() {
  const factor = 0.75;
  level = mic.getLevel();
  avgLevel = factor * avgLevel + (1 - factor) * level;
}
