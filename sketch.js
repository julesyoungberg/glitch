"use strict";
// image glitchers
let glitcher, isLoaded = false;
let iconGlitcher, isIconLoaded = false;

// dsp stuff
let mic, fft, peakDetect, loPeak, midPeak, hiPeak;

// fft config
const smoothing = 0.8;
const binCount = 512;

function setup() {
  createCanvas(windowWidth, windowHeight);

  loadImage("eerie.jpg", img => {
    glitcher = new Glitcher(img);
    isLoaded = true;
  });

  // loadImage("speaker.png", img => {
  //   iconGlitch = new Glitcher(img);
  //   isIconLoaded = true;
  // });

  mic = new p5.AudioIn();
  mic.start();
  fft = new p5.FFT(smoothing, binCount);
  fft.setInput(mic);

  const thresh = 0.1;
  peakDetect = new p5.PeakDetect(20, 20000, thresh, 10);
  // const loMid = 300;
  // const hiMid = 1000;
  // loPeak = new p5.PeakDetect(20, loMid, thresh);
  // midPeak = new p5.PeakDetect(loMid, hiMid, thresh);
  // hiPeak = new p5.PeakDetect(hiMid, 20000, thresh);
}

function draw() {
  clear();
  background(0);

  const spectrum = fft.analyze();
  // loPeak.update(fft);
  // midPeak.update(fft);
  // hiPeak.update(fft);
  peakDetect.update(fft);
  const centroid = fft.getCentroid();
  const level = mic.getLevel();

  if (isLoaded) {
    glitcher.reset();
    glitcher.sortPixels(spectrum);

    if (peakDetect.isDetected) {
      // glitcher.glitchFlowLines();
      const rows = map(centroid, 100, 10000, 1, 10);
      glitcher.glitchShiftLine(random(300), rows);
    }

    const range = constrain(floor(map(level, 0, .7, 0, 30)), 0, 30);
    glitcher.randomRGBShift(range);
    glitcher.show();
  }
  // if (isIconLoaded) iconGlitch.show(isPeak, highCentroid, scale);
}

function mousePressed() {
  getAudioContext().resume();
}
