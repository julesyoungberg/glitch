class Glitcher {
  constructor(img) {
    this.channelLen = 4;
    this.imgOrigin = img;
    this.imgOrigin.loadPixels();
    this.copyData = [];
    this.flowLineImgs = [ {
      pixels: null,
      t1: floor(random(1000)),
      speed: floor(random(4, 24)),
      randX: floor(random(24, 80)),
    } ];
    this.shiftLineImgs = new Array(6).fill(null);
    this.shiftRGBs = [ null ];
    this.scatImgs = new Array(3).fill({ img: null, x: 0, y: 0 });
    this.throughFlag = true;
    this.copyData = new Uint8ClampedArray(this.imgOrigin.pixels);
  }

  pixelIndex(x, y, img) {
    return (y * img.width + x) * this.channelLen;
  }

  rgba(i) {
    return [ i, i + 1, i + 2, i + 3 ];
  }

  iteratePixels(img, fn, yCondition) {
    for (let y = 0; y < img.height; y++) {
      if (!yCondition || yCondition(y)) {
        for (let x = 0; x < img.width; x++) {
          fn(this.pixelIndex(x, y, img));
        }
      }
    }
  }

  replaceData(destImg, srcPixels) {
    this.iteratePixels(destImg, index => this.rgba(index).forEach(i => {
      destImg.pixels[i] = srcPixels[i];
    }));
    destImg.updatePixels();
  }

  flowLine(srcImg, obj) {
    const destPixels = new Uint8ClampedArray(srcImg.pixels);
    obj.t1 %= srcImg.height;
    obj.t1 += obj.speed;
    let tempY = floor(obj.t1);

    this.iteratePixels(srcImg, index => this.rgba(index).forEach((i, idx) => {
      destPixels[i] = srcImg.pixels[i] + (idx < 3) ? obj.randX : 0;
    }), y => tempY === y);

    return destPixels;
  }

  shiftLine(srcImg) {
    const destPixels = new Uint8ClampedArray(srcImg.pixels);
    const rangeH = srcImg.height;
    const rangeMin = floor(random(0, rangeH));
    const rangeMax = rangeMin + floor(random(1, rangeH - rangeMin));
    const offsetX = this.channelLen * floor(random(-40, 40));

    this.iteratePixels(srcImg, index => this.rgba(index).forEach((i, idx) => {
      let j = i;
      if (idx < 3) j = i + offsetX;
      destPixels[i] = srcImg.pixels[j];
    }), y => (y > rangeMin && y < rangeMax));

    return destPixels;
  }

  shiftRGB(srcImg) {
    const range = 16;
    const destPixels = new Uint8ClampedArray(srcImg.pixels);
    const getRand = () => (
      (floor(random(-range, range)) * srcImg.width +
      floor(random(-range, range))) * this.channelLen
    );
    const rand = [ getRand(), getRand(), getRand() ];

    this.iteratePixels(srcImg, index => this.rgba(index).forEach((i, idx) => {
      let j = i;
      if (idx < 3) j = (i + rand[idx]) % srcImg.pixels.length;
      destPixels[i] = srcImg.pixels[j];
    }));

    return destPixels;
  }

  getRandomRectImg(srcImg) {
    const startX = floor(random(0, srcImg.width - 30));
    const startY = floor(random(0, srcImg.height - 50));
    const rectW = floor(random(30, srcImg.width - startX));
    const rectH = floor(random(1, 50));
    const destImg = srcImg.get(startX, startY, rectW, rectH);
    destImg.loadPixels();
    return destImg;
  }

  glitchFlowLine() {
    this.flowLineImgs.forEach((v, i, arr) => {
      arr[i].pixels = this.flowLine(this.imgOrigin, v);
      if (arr[i].pixels) this.replaceData(this.imgOrigin, arr[i].pixels);
    });
  }

  glitchShiftLine() {
    this.shiftLineImgs.forEach((v, i, arr) => {
      if (floor(random(100)) > 50) {
        arr[i] = this.shiftLine(this.imgOrigin);
        this.replaceData(this.imgOrigin, arr[i]);
      } else {
        if (arr[i]) this.replaceData(this.imgOrigin, arr[i]);
      }
    });
  }

  glitchShiftRGB() {
    this.shiftRGBs.forEach((v, i, arr) => {
      if (floor(random(100)) > 65) {
        arr[i] = this.shiftRGB(this.imgOrigin);
        this.replaceData(this.imgOrigin, arr[i]);
      }
    });
  }

  scatterImgs() {
    this.scatImgs.forEach((obj) => {
      push();
      translate((width - this.imgOrigin.width) / 2, (height - this.imgOrigin.height) / 2);
      if (floor(random(100)) > 80) {
        obj.x = floor(random(-this.imgOrigin.width * 0.3, this.imgOrigin.width * 0.7));
        obj.y = floor(random(-this.imgOrigin.height * 0.1, this.imgOrigin.height));
        obj.img = this.getRandomRectImg(this.imgOrigin);
      }
      if (obj.img) {
        image(obj.img, obj.x, obj.y);
      }
      pop();
    });
  }

  show() {
    // restore the original state
    this.replaceData(this.imgOrigin, this.copyData);

    // sometimes pass without effect processing
    const n = floor(random(100));
    if (n > 75 && this.throughFlag) {
      this.throughFlag = false;
      setTimeout(() => {
        this.throughFlag = true;
      }, floor(random(40, 400)));
    }
    if (!this.throughFlag) {
      push();
      translate((width - this.imgOrigin.width) / 2, (height - this.imgOrigin.height) / 2);
      image(this.imgOrigin, 0, 0);
      pop();
      return;
    }

    this.glitchFlowLine();

    this.glitchShiftLine();

    this.glitchShiftRGB();

    push();
    translate((width - this.imgOrigin.width) / 2, (height - this.imgOrigin.height) / 2);
    image(this.imgOrigin, 0, 0);
    pop();

    this.scatterImgs();
  }
}
