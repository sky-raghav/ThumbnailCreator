const logger = require('../logger.js');
/** Express router providing user related routes
 * @module /api/login
 * @requires express
 */

/**
 * express module
 * @const
 */
const express = require('express');

/**
 * Express router to mount user related functions on.
 * @type {object}
 * @const
 */
const router = express.Router();

/**
 * Route when triggered check for username & password, if exists then calls the next middleware & if not then returns status code:406(Not Acceptable).
 * @name /
 * @function
 * @memberof module:/api/login
 * @inner
 * @param {string} path - Express path
 */

router.post('/', (req, res, next) =>{
  let { username } = req.body;
  let { password } = req.body;
  if(username && password){
    req.session.userData = {username, password};
    next();
  } else{
    logger.warn(`Insufficient Data - ${req.method} ${req.originalUrl}`);
    res.status(406);
    res.data = {status:'Rejected', reason:'Insufficient Data'};
    next();
  }
});

module.exports = router;
