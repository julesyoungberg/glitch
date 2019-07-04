class Glitcher {
  constructor(img) {
    this.channelLen = 4;
    this.img = img;
    this.img.loadPixels();
    this.originalImg = new Uint8ClampedArray(this.img.pixels);

    this.flowLines = [ {
      pixels: null,
      y: floor(random(1000)),
      speed: floor(random(4, 24)),
      randX: floor(random(24, 80)),
    } ];

    this.shiftLineImg = null;
    this.holdShiftLine = false;
    this.shiftLineImgs = new Array(6).fill(null);

    this.scatImgs = new Array(3).fill({ img: null, x: 0, y: 0 });

    this.holdShiftedImg = false;
    this.shiftedImg = null;

    this.holdSlicedImg = false;
    this.slicedImg = null;
  }

  reset() {
    if (this.holdShiftLine && this.shiftLineImg) {
      if (random() > .5) this.glitchShiftLine(random(200));
      else ImgUtil.copyPixels(this.shiftLineImg, this.img);

    } else if (this.holdShiftedImg && this.shiftedImg) {
      ImgUtil.copyPixels(this.shiftedImg, this.img);

    } else if (this.holdSlicedImg && this.slicedImg) {
      if (random() > .5) this.pixelSlice({ duration: random(200) })
      else ImgUtil.copyPixels(this.slicedImg, this.img);

    } else {
      ImgUtil.copyPixels(this.originalImg, this.img);
    }
  }

  // pixelIndex wrapper for use with this.img
  pixelIndex(x, y) {
    return ImgUtil.pixelIndex(x, y, this.img);
  }

  ///////////////////////
  // FLOW LINE
  ///////////////////////
  // usage: adding oldtimy thin black line that loops down screen
  // simply adds a thin horizontal black line across img based on config obj
  // config = { pixels, y, speed, randX }
  flowLine(config) {
    const srcImg = this.img;
    const destPixels = new Uint8ClampedArray(srcImg.pixels);
    config.y %= srcImg.height;
    config.y += config.speed;
    let tempY = floor(config.y);

    ImgUtil.forEachPixel(srcImg, rgba => rgba.forEach((i, idx) => {
      destPixels[i] = srcImg.pixels[i] + (idx < 3) ? config.randX : 0;
    }), y => tempY === y);

    return destPixels;
  }

  // calls flowLine on each flowLine config object in this.flowLines
  glitchFlowLines() {
    this.flowLines.forEach((v, i, arr) => {
      arr[i].pixels = this.flowLine(v);
      if (arr[i].pixels) ImgUtil.copyPixels(arr[i].pixels, this.img);
    });
  }

  ///////////////////////
  // SORT
  ///////////////////////
  // sorts pixels horizontally by overall brightness
  // https://github.com/kimasxEndorf/ASDFPixelSort/blob/master/ASDFPixelSort.pde
  sortPixels(spectrum) {
    let thresh = 10;
    const destPixels = new Uint8ClampedArray(this.img.pixels);

    for (let y = 0; y < this.img.height; y++) {
      if (y % 2) continue;

      const bin = floor(map(y, 0, this.img.height, 0, spectrum.length / 2));
      const level = spectrum[bin];
      let x = 0, xEnd = 0;

      while (xEnd < this.img.width - 1) {
        let current = ImgUtil.getPixel(x, y, this.img);
        while (x > 0 && ImgUtil.getBrightness(current) < thresh) {
          x++;
          if (x >= this.img.width) x = -1;
        }
        if (x < 0) break;

        const length = map(level, 0, 1, 0, this.img.width - x);
        xEnd = x + length;
        const pixels = [];

        for (let i = 0; i < length; i++) {
          pixels[i] = ImgUtil.getPixel(x + i, y);
        }

        pixels.sort(ImgUtil.compareBrightness);

        for (let i = 0; i < length; i++) {
          const index = ImgUtil.pixelIndex(x + i, y);
          destPixels[index]     = pixels[i][0];
          destPixels[index + 1] = pixels[i][1];
          destPixels[index + 2] = pixels[i][2];
        }
      }
    }

    ImgUtil.copyPixels(destPixels, this.img);
  }

  ///////////////////////
  // SHIFT LINE
  ///////////////////////
  // shifts a chunk of rows left or right as described by the config object
  shiftLine({ yMin, yMax, xOffset }) {
    const srcImg = this.img;
    const destPixels = new Uint8ClampedArray(srcImg.pixels);

    ImgUtil.forEachPixel(srcImg, rgba => rgba.forEach((i, idx) => {
      let j = i;
      if (idx < 3) j = i + xOffset;
      destPixels[i] = srcImg.pixels[j];
    }), y => (y > yMin && y < yMax));

    return destPixels;
  }

  // randomly shifts chunks of rows left or right
  glitchShiftLine(duration=1, rows=6) {
    const rangeH = this.img.height;

    for (let i = 0; i < rows; i++) {
      const yMin = floor(random(0, rangeH));
      const yMax = yMin + floor(random(1, rangeH - yMin));
      const xOffset = this.channelLen * floor(random(-40, 40));
      const config = { yMin, yMax, xOffset };

      this.shiftLineImg = this.shiftLine(config);
      ImgUtil.copyPixels(this.shiftLineImg, this.img);
    }

    this.holdShiftLine = true;

    setTimeout(() => this.holdShiftLine = false, duration);
  }

  ///////////////////////
  // SHIFT RGB
  ///////////////////////
  // shifts the rgb channels of the source image by the values in shift array
  // blxEnd determines how much of the shifted image to blxEnd into the original
  shiftRGB({ shift, blxEnd=1, iterations=1, hold=false }) {
    const srcImg = this.img;
    let srcPixels = srcImg.pixels;
    const destPixels = new Uint8ClampedArray(srcImg.pixels);

    for (let i = 0; i < iterations; i++) {
      ImgUtil.forEachPixel(srcImg, rgba => rgba.forEach((i, idx) => {
        let j = i;
        if (idx < 3) j = (i + shift[idx]) % srcPixels.length;
        destPixels[i] = srcPixels[j];
        destPixels[i] = srcPixels[i] * (1 - blxEnd) + srcPixels[j] * blxEnd;
      }));
      srcPixels = new Uint8ClampedArray(destPixels);
    }

    if (hold) {
      this.holdShiftedImg = true;
      this.shiftedImg = destPixels;
    } else {
      this.holdShiftedImg = false;
    }

    ImgUtil.copyPixels(destPixels, this.img);
    return destPixels;
  }

  randomRGBShift(range=16) {
    const rand = () => floor(random(-range, range))
    const getRand = () => this.pixelIndex(rand(), rand());

    const shift = [ getRand(), getRand(), getRand() ];

    const shifted = this.shiftRGB({
      shift, blxEnd: 0.8, iterations: 1
    });
  }

  ///////////////////////
  // TV STATIC
  ///////////////////////
  tvStatic(amount=0.5) {
    const destPixels = new Uint8ClampedArray(this.img.pixels);

    ImgUtil.forEachPixel(this.img, rgba => rgba.forEach(i => {
      destPixels[i] = this.img.pixels[i] * (1 - amount) + random(255) * amount;
    }));

    ImgUtil.copyPixels(destPixels, this.img);
  }


  ///////////////////////
  // PIXEL SLICE
  ///////////////////////
  pixelSlice({ distortion=9, duration }) {
    this.slicedImg = PixelSlice.glitch(this.img, distortion);
    this.holdSlicedImg = true;
    setTimeout(() => this.holdSlicedImg = false, duration);
    ImgUtil.copyPixels(this.slicedImg, this.img);
  }


  ///////////////////////
  // HORIZONTAL SORT
  ///////////////////////
  horizontalSort(interval=1) {
    const sorted = HorizontalSort.glitch(this.img, interval);
    ImgUtil.copyPixels(sorted, this.img);
  }


  // scatters random rectangles from the image
  scatterImgs() {
    this.scatImgs.forEach((config) => {
      push();
      translate((width - this.img.width) / 2, (height - this.img.height) / 2);
      if (floor(random(100)) > 80) {
        config.x = floor(random(-this.img.width * 0.3, this.img.width * 0.7));
        config.y = floor(random(-this.img.height * 0.1, this.img.height));
        config.img = ImgUtil.getRandomRectImg(this.img);
      }
      if (config.img) {
        image(config.img, config.x, config.y);
      }
      pop();
    });
  }

  show(reset=true) {
    const w = this.img.width; // * scale;
    const h = this.img.height; // * scale;
    push();
    translate((width - w) / 2, (height - h) / 2);
    image(this.img, 0, 0, w, h);
    pop();
  }
}
