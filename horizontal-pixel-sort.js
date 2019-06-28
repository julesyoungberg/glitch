class HorizontalPixelSort {
  static glitch(img, interval) {
    const destPixels = new Uint8ClampedArray(img.pixels);

    for (let i = 0, j = Math.random(1, interval); i < j; i++) {
       const pixelEndOffset = Math.floor(
         Math.random() * img.width * img.height * 4
       );
       const pixelStartOffset = (
         pixelEndOffset - (Math.round(Math.random() * 1000) + 5100)
       );
       const pixelSubArray = destPixels.slice(pixelStartOffset, pixelEndOffset);

       let destPosition = Math.floor(Math.random() * (
         (img.width * img.height * 4) - pixelSubArray.length
       ));
       pixelSubArray.forEach(pixel => {
         destPixels[destPosition++] = pixel;
       });
    }

    return destPixels;
  }
}
