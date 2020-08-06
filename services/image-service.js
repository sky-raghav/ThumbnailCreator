const jimp = require('jimp');

/** service for providing image related methods.
 * @module image-service
 * @requires jimp
 */

 /**
  * Method to resize image to a given size.
  * @name imageResizer
  * @function
  * @memberof module:image-service
  * @inner
  * @param {String} imageUrl - image url
  * @param {number} size - output size
  * @returns {image} - Resized Image.
  */

const imageResizer = (imageUrl, size) => {
   return jimp.read(imageUrl)
   .then((image) => {
     return image.resize(size, size);
   })
   .catch((err) => {
     logger.error(`Image Service - imageResizer - ${err}`);
     throw err;
   });
};

/**
 * Method to convert image to buffer.
 * @name getImageAsBuffer
 * @function
 * @memberof module:image-service
 * @inner
 * @param {String} image - image
  @returns {buffer} - buffered Image.
 */

const getImageAsBuffer = (image) =>{
  return jimp.read(image)
  .then((processedImage) => {
    return processedImage.getBufferAsync(jimp.AUTO);
  })
  .catch((err) =>{
    logger.error(`Image Service - getImageAsBuffer - ${err}`);
    throw err;
  });
};

/**
 * Method to compare two images returns boolean result.
 * @name imageCompare
 * @function
 * @memberof module:image-service
 * @inner
 * @param {image} img1 - image
 * @param {image} img2 - image
  @returns {boolean} - true/false.
 */

const imageCompare = (img1, img2) => {
  return jimp.read(img2)
  .then((jimg2) =>{
    let distance = jimp.distance(img1, jimg2); // perceived distance
    let diff = jimp.diff(img1, img1); // pixel difference
    if (distance < 0.15 || diff.percent < 0.15) {
      return true;
    } else {
      return false;
    }
  })
  .catch((err) =>{
    logger.error(`Image Service - imageCompare - ${err}`);
    throw err;
  })
};

module.exports = {
  imageResizer : imageResizer,
  getImageAsBuffer: getImageAsBuffer,
  imageCompare: imageCompare
};
