// currently seems to crash the browser!! :(( perhaps testing in node is needed
class VerticalGlitch {
  //////////////////////////
  // VERTICAL PIXEL GLITCH
  //////////////////////////
  static glitch(img, distortion=1) {
    const distortionAmount = distortion / 100;
    const destPixels = new Uint8ClampedArray(img.pixels);
    let newVerticalPixelColumn = false;
    let currentPixelPosition = -1, currentPixelRowIndex = -1;

    const sortColumn = column => VerticalGlitch.sortPixelsInColumn(
      column, 0, currentPixelRowIndex - 1
    );

    // for each column of the image
    for (let x = 0; x < img.width; x++) {
      newVerticalPixelColumn = true;
      currentPixelRowIndex = 0;
      let verticalPixelArray = [];

      // for each pixel in the xth column
      for (let y = 0; y < img.height; y++) {
        // get actual pixel array index and rgba indices
        const pixelIndex = ImgUtil.pixelIndex(x, y, img);
        const rgba = ImgUtil.rgba(pixelIndex);
        // array representation of the current pixel => [r, g, b, a]
        const currentPixel = rgba.map(i => img.pixels[i]);
        const brightness = ImgUtil.getBrightness(currentPixel);

        if (brightness > distortionAmount) {
          // copy pixel to output
          rgba.forEach(i => destPixels[i] = img.pixels[i]);

          if (!newVerticalPixelColumn) {
            sortColumn(verticalPixelArray);

            for (let j = 0; j < currentPixelRowIndex; j++) {
              const newIndex = ImgUtil.pixelIndex(
                x, j + currentPixelPosition, img
              );

              ImgUtil.rgba(newIndex).forEach(i => {
                destPixels[i] = verticalPixelArray[j][i];
              });
            }

            // reset variables
            verticalPixelArray = [];
            currentPixelRowIndex = 0;
            newVerticalPixelColumn = true;
          }

        } else if (brightness <= distortionAmount) {
          if (newVerticalPixelColumn) {
            currentPixelPosition = y;
            newVerticalPixelColumn = false;
          }

          verticalPixelArray[currentPixelRowIndex++] = currentPixel;
        }
      }

      if (!newVerticalPixelColumn) {
        sortColumn(verticalPixelArray);

        for (let j = 0; j < currentPixelRowIndex; j++) {
          const newIndex = ImgUtil.pixelIndex(x, j + currentPixelPosition, img);
          ImgUtil.rgb(newIndex).forEach(i => {
            destPixels[i] = verticalPixelArray[j][i];
          });
        }
      }
    }

    return destPixels;
  }

  static sortPixelsInColumn(pixelArray, leftPixel, rightPixel) {
    // console.log('pixelArray', pixelArray);

    let leftSidePixel = leftPixel, rightSidePixel = rightPixel;
    let halfBrightness = ImgUtil.getBrightness(
      pixelArray[floor((leftPixel + rightPixel) / 2)]
    );

    while (leftSidePixel <= rightSidePixel) {
      // console.log('left', leftSidePixel, pixelArray[leftSidePixel]);
      while (ImgUtil.getBrightness(pixelArray[leftSidePixel]) < halfBrightness) {
        leftSidePixel++;
      }

      // console.log('right', rightSidePixel, pixelArray[rightSidePixel]);
      while (ImgUtil.getBrightness(pixelArray[rightSidePixel]) > halfBrightness) {
        rightSidePixel--;
      }

      if (leftSidePixel <= rightSidePixel) {
        const currentPixel = pixelArray[leftSidePixel];
        pixelArray[leftSidePixel--] = pixelArray[rightSidePixel];
        pixelArray[rightSidePixel++] = currentPixel;
        if (leftSidePixel < 0) return;
        if (rightSidePixel >= pixelArray.length) return;
      }
    }

    if (leftPixel < rightSidePixel) VerticalGlitch.sortPixelsInColumn(
      pixelArray, leftPixel, rightSidePixel
    );

    if (leftSidePixel < rightPixel) VerticalGlitch.sortPixelsInColumn(
      pixelArray, leftSidePixel, rightPixel
    );

    return pixelArray;
  }
}
