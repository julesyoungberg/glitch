class Glitcher {
  constructor(img) {
    this.channelLen = 4;
    this.imgOrigin = img;
    this.imgOrigin.loadPixels();
    this.copyData = [];
    this.flowLines = [ {
      pixels: null,
      y: floor(random(1000)),
      speed: floor(random(4, 24)),
      randX: floor(random(24, 80)),
    } ];
    this.shiftLineImgs = new Array(6).fill(null);
    this.scatImgs = new Array(3).fill({ img: null, x: 0, y: 0 });
    this.throughFlag = true;
    this.copyData = new Uint8ClampedArray(this.imgOrigin.pixels);
  }

  // converts a 2D pixel coord to a 1D pixel array index
  pixelIndex(x, y, img) {
    return (y * img.width + x) * this.channelLen;
  }

  // converts a pixel array index to an array of channel indexs (rgba)
  rgba(i) {
    return [ i, i + 1, i + 2, i + 3 ];
  }

  // for each pixel in the given image run fn on the pixel's channel indices
  // yCondition allows for skipping rows based on the y value
  forEachPixel(img, fn, yCondition) {
    for (let y = 0; y < img.height; y++) {
      if (!yCondition || yCondition(y)) {
        for (let x = 0; x < img.width; x++) {
          fn(this.rgba(this.pixelIndex(x, y, img)));
        }
      }
    }
  }

  // copies all data from srcPixels to destImg.pixels
  copyPixels(srcPixels, destImg) {
    this.forEachPixel(destImg, rgba => rgba.forEach(i => {
      destImg.pixels[i] = srcPixels[i];
    }));
    destImg.updatePixels();
  }

  ///////////////////////
  // FLOW LINE
  ///////////////////////
  // usage: adding oldtimy thin black line that loops down screen
  // simply adds a thin horizontal black line across img based on config obj
  // config = { pixels, y, speed, randX }
  flowLine(srcImg, config) {
    const destPixels = new Uint8ClampedArray(srcImg.pixels);
    config.y %= srcImg.height;
    config.y += config.speed;
    let tempY = floor(config.y);

    this.forEachPixel(srcImg, rgba => rgba.forEach((i, idx) => {
      destPixels[i] = srcImg.pixels[i] + (idx < 3) ? config.randX : 0;
    }), y => tempY === y);

    return destPixels;
  }

  // calls flowLine on each flowLine config object in this.flowLines
  glitchFlowLines() {
    this.flowLines.forEach((v, i, arr) => {
      arr[i].pixels = this.flowLine(this.imgOrigin, v);
      if (arr[i].pixels) this.copyPixels(arr[i].pixels, this.imgOrigin);
    });
  }

  ///////////////////////
  // SHIFT LINE
  ///////////////////////
  // shifts a chunk of rows left or right as described by the config object
  shiftLine(srcImg, { yMin, yMax, xOffset }) {
    const destPixels = new Uint8ClampedArray(srcImg.pixels);

    this.forEachPixel(srcImg, rgba => rgba.forEach((i, idx) => {
      let j = i;
      if (idx < 3) j = i + xOffset;
      destPixels[i] = srcImg.pixels[j];
    }), y => (y > yMin && y < yMax));

    return destPixels;
  }

  // randomly shifts chunks of rows left or right
  glitchShiftLine() {
    const rangeH = this.imgOrigin.height;

    this.shiftLineImgs.forEach((v, i, arr) => {
      const yMin = floor(random(0, rangeH));
      const yMax = yMin + floor(random(1, rangeH - yMin));
      const xOffset = this.channelLen * floor(random(-40, 40));
      const config = { yMin, yMax, xOffset };

      if (floor(random(100)) > 50) {
        arr[i] = this.shiftLine(this.imgOrigin, config);
        this.copyPixels(arr[i], this.imgOrigin);
      } else {
        if (arr[i]) this.copyPixels(arr[i], this.imgOrigin);
      }
    });
  }

  ///////////////////////
  // SHIFT RGB
  ///////////////////////
  // shifts the rgb channels of the source image by the values in shift array
  shiftRGB(srcImg, shifts) {
    const destPixels = new Uint8ClampedArray(srcImg.pixels);

    this.forEachPixel(srcImg, rgba => rgba.forEach((i, idx) => {
      let j = i;
      if (idx < 3) j = (i + shifts[idx]) % srcImg.pixels.length;
      destPixels[i] = srcImg.pixels[j];
    }));

    return destPixels;
  }

  // randomly shift rgb channels
  glitchShiftRGB() {
    const range = 16;
    const getRand = () => (
      (floor(random(-range, range)) * this.imgOrigin.width +
      floor(random(-range, range))) * this.channelLen
    );
    const shifts = [ getRand(), getRand(), getRand() ];

    const shifted = this.shiftRGB(this.imgOrigin, shifts);
    this.copyPixels(shifted, this.imgOrigin);
  }

  // gets a random rectangle from the image
  getRandomRectImg(srcImg) {
    const x = floor(random(0, srcImg.width - 30));
    const y = floor(random(0, srcImg.height - 50));
    const w = floor(random(30, srcImg.width - x));
    const h = floor(random(1, 50));
    const destImg = srcImg.get(x, y, w, h);
    destImg.loadPixels();
    return destImg;
  }


  // scatters random rectangles from the image
  scatterImgs() {
    this.scatImgs.forEach((config) => {
      push();
      translate((width - this.imgOrigin.width) / 2, (height - this.imgOrigin.height) / 2);
      if (floor(random(100)) > 80) {
        config.x = floor(random(-this.imgOrigin.width * 0.3, this.imgOrigin.width * 0.7));
        config.y = floor(random(-this.imgOrigin.height * 0.1, this.imgOrigin.height));
        config.img = this.getRandomRectImg(this.imgOrigin);
      }
      if (config.img) {
        image(config.img, config.x, config.y);
      }
      pop();
    });
  }

  show(glitch, rgb, scale=1) {
    // restore the original state
    this.copyPixels(this.copyData, this.imgOrigin);
    const w = this.imgOrigin.width * scale;
    const h = this.imgOrigin.height * scale;

    // sometimes pass without effect processing
    // const n = floor(random(100));
    // if (n > 75 && this.throughFlag) {
    //   this.throughFlag = false;
    //   setTimeout(() => {
    //     this.throughFlag = true;
    //   }, floor(random(40, 400)));
    // }
    // if (!this.throughFlag) {
    //   push();
    //   translate((width - w) / 2, (height - h) / 2);
    //   image(this.imgOrigin, 0, 0, w , h);
    //   pop();
    //   return;
    // }

    // this.glitchFlowLines();

    // this.glitchShiftLine();

    this.glitchShiftRGB();

    push();
    translate((width - w) / 2, (height - h) / 2);
    image(this.imgOrigin, 0, 0, w, h);
    pop();

    // this.scatterImgs();
  }
}
