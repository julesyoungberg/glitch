// https://github.com/scriptkittie/GlitchKernel/blob/master/src/io/laniakia/algo/DataBend.java
class DataBend {
  static glitch(img, { randomizationPercent=1, blockSize=1 }) {
    const destPixels = new Uint8ClampedArray(img.pixels);
    const pixelArray = new Uint8ClampedArray(img.pixels);

    for (let i = 0; i < img.width; i++) {
      for (let j = 0; j < img.height; j++) {
        const byteCorruptProbability = Math.random(0, 101);

        if (byteCorruptProbability <= randomizationPercent
          && i > blockSize && j > blockSize
          && (img.width - i) > blockSize
          && (img.height - j) > blockSize
        ) {
          const x = Math.random(blockSize, img.width - blockSize);
          const y = Math.random(blockSize, img.height - blockSize);

          // get actual pixel array index and rgba indices
          const randPixelIndex = ImgUtil.pixelIndex(x, y, img);
          const rgba = ImgUtil.rgba(randPixelIndex);
          // array representation of the current pixel => [r, g, b, a]
          const randPixel = rgba.map(i => img.pixels[i]);

          ImgUtil.rgba(ImgUtil.pixelIndex(x, y, img)).forEach((i, idx) => {
            pixelArray[i] = randPixel[idx];
          });

          const add = Math.random() > 0.5;

          for (let b = 0; b < blockSize; b++) {
            for (let a = 0; a < blockSize; a++) {
              if ((i - b) >= 0 && (j - a) >= 0) {
                const sourceRgba = ImgUtil.rgba(ImgUtil.pixelIndex(
                  add ? x + b : x - b, add ? y + a : y - a, img
                ));
                const destRgba = ImgUtil.rgba(ImgUtil.pixelIndex(
                  add ? i + b : i - b, add ? y + a : y - a, img
                ));
                destRgba.forEach((i, idx) => {
                  pixelArray[i] = destPixels[sourceRgba[idx]];
                });
              }
            }
          }
        }
      }
    }

    for (let i = 0; i < img.width; i++) {
      for (let j = 0; j < img.height; j++) {
        const rgba = ImgUtil.rgba(ImgUtil.pixelIndex(i, j, img));
        rgba.forEach(x => destPixels[x] = pixelArray[x]);
      }
    }

    return destPixels;
  }
}
