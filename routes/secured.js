const logger = require('../logger.js');
const jsonpatch = require('jsonpatch');
const imageService = require('../services/image-service');

/** Express router providing user related routes
 * @module /api/secured
 * @requires express
 */

/**
 * express module
 * @const
 */
const express = require('express');

/**
 * Express router only for authenticated users.
 * @type {object}
 * @const
 */
const router = express.Router();

/**
 * Route when triggered check for image URL, if exists then convert the image to 50x50 via Jimp module & send it to the response handler & if not then returns status code:406(Not Acceptable).
 * @name /api/secured/createThumbnail
 * @function
 * @memberof module:/api/secured
 * @inner
 * @param {string} path - Express path
 */

router.get('/createThumbnail', (req, res, next) =>{
  let { imageUrl } = req.body;
  if(imageUrl){
    imageService.imageResizer(imageUrl, 50)
    .then((thumbnail) => {
      return imageService.getImageAsBuffer(thumbnail);
    })
    .then((imgBuff) => {
      res.setHeader('Content-Type', 'image/jpeg');
      res.data = imgBuff;
      next();
    })
    .catch((err) =>{
      logger.warn(`Invalid image URL - ${req.method} ${req.originalUrl}`);
      res.status(406);
      res.data= {status:'Rejected', reason:'Invalid image url'};
      next();
    });
  } else {
    logger.warn(`No image URL - ${req.method} ${req.originalUrl}`);
    res.status(406);
    res.data= {status:'Rejected', reason:'No image url found'};
    next();
  }
});

/**
 * Route when triggered check for json & patch object, if exists then apply the patch to json via jsonPatch module & send it to the response handler & if not then returns status code:406(Not Acceptable).
 * @name /api/secured/patch
 * @function
 * @memberof module:/api/secured
 * @inner
 * @param {string} path - Express path
 */

router.put('/patch', (req, res, next) =>{
  let { json } = req.body;
  let { patch } = req.body;
  if(json && patch){
    try{
      res.data = jsonpatch.apply_patch(json, patch);
      next();
    } catch(err){
      logger.warn(`Invalid data - ${req.method} ${req.originalUrl}`);
      res.status(406);
      res.data = {status:'Rejected', reason:'Invalid data'};
      next();
    }
  } else {
    logger.warn(`Insufficient Data - ${req.method} ${req.originalUrl}`);
    res.status(406);
    res.data = {status:'Rejected', reason:'Insufficient Data'};
    next();
  }
});

module.exports = router;
