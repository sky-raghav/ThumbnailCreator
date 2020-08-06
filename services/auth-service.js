const fs = require('fs');
const jwt = require('jsonwebtoken');
const path = require('path');
const logger = require('../logger.js');
const privateKey = fs.readFileSync(path.resolve(__dirname, '../jwtRS256.key'), 'utf8');
const publicKey = fs.readFileSync(path.resolve(__dirname,'../jwtRS256.key.pub'), 'utf8');
const newSessionRoutes = [ { path : '/api/login', method: 'POST' }];
const authRoutes = [ { path : '/api/secured/patch', method: 'PUT' }, { path : '/api/secured/createThumbnail', method: 'GET' }];

/** service for provide authentcation related methods.
 * @module auth-service
 * @requires fs
 * @requires jwt
 * @requires path
 * @requires logger
 * @requires privateKey
 * @requires publicKey
 */

/**
 * Method to generate JWT for given user data.
 * @name generateJWT
 * @function
 * @memberof module:auth-service
 * @inner
 * @param {object} data - user data.
 * @returns {String} jwt - JWT.
 */

const generateJWT = (data) => {
  try{
    return jwt.sign(data, privateKey, {algorithm: 'RS256'});
  } catch(err){
    logger.error(`Auth Service - Generate JWT - ${err}`);
    return null;
  }
};

/**
 * Method to verify JWT.
 * @name verifyJWT
 * @function
 * @memberof module:auth-service
 * @inner
 * @param {String} jwtToken - JWT
 * @returns {object} userData - user data with jwt info.
 */

const verifyJWT = (jwtToken) =>{
   try{
      return jwt.verify(jwtToken, publicKey, {algorithm: 'RS256'});
   }catch(err){
      logger.error(`Auth Service - verify JWT - ${err}`);
      return null;
   }
};

/**
 * Method to check if the route requires a new JWT.
 * @name isNewTokenRequired
 * @function
 * @memberof module:auth-service
 * @inner
 * @param {String} httpMethod - HTTP Method
 * @param {String} url - Request URL
 * @returns {boolean} - true/false.
 */

const isNewTokenRequired = (httpMethod, url) => {
  for(let routeObj of newSessionRoutes){
    if(routeObj.path === url && routeObj.method === httpMethod){
      return true;
    }
  }
  return false;
};

/**
 * Method to check if the route requires authentication of already generated JWT.
 * @name isAuthRequired
 * @function
 * @memberof module:auth-service
 * @inner
 * @param {String} httpMethod - HTTP Method
 * @param {String} url - Request URL
 * @returns {boolean} - true/false.
 */

const isAuthRequired = (httpMethod, url) => {
  for(let routeObj of authRoutes){
    if(routeObj.path === url && routeObj.method === httpMethod){
      return true;
    }
  }
  return false;
};


module.exports = {
  generateJWT: generateJWT,
  verifyJWT: verifyJWT,
  isNewTokenRequired : isNewTokenRequired,
  isAuthRequired : isAuthRequired,
};
