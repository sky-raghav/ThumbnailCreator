const logger = require('./logger.js');
const path = require('path');
const authUtils = require('./services/auth-service');
const port = process.env.PORT || 8080;
let loginRouter = require('./routes/login');
let authRouter = require('./routes/secured');

/** Express router providing user related routes
 * @module app
 * @requires express
 */

/**
 * express module
 * @const
 */

const express = require('express');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

/**
 * This miidleware triggers everytime when a request comes & check if it needs authentication or new token or nothing then acts accordingly.
 * @name AuthenticationHandler
 * @function
 * @memberof module:app
 * @inner
 */

app.use((req, res, next) => {
  let routeUrl = req.originalUrl;
  let httpMethod = req.method;
  logger.info(`Authentication handler - ${httpMethod} ${routeUrl}`);
  req.session = {};
  if(authUtils.isNewTokenRequired(httpMethod, routeUrl)){
    logger.info(`New token required - ${httpMethod} ${routeUrl}`);
    req.newTokenRequired = true;
    next();
  } else if(authUtils.isAuthRequired(httpMethod, routeUrl)){
    logger.info(`Authentication required - ${httpMethod} ${routeUrl}`);
    let accessToken = req.header('Authorization').split(' ')[1];
    if(accessToken){
      let isVerified = authUtils.verifyJWT(accessToken);
      if(isVerified){
        req.session.isVerified = isVerified;
        req.session.token = accessToken;
        next();
      } else{
        res.setHeader('Authorization','Bearer ' + accessToken);
        logger.warn(`Invalid JWT - ${httpMethod} ${routeUrl}`);
        return res.status(403).send({status:'failure', reason:'Invalid access Token'});
      }
    } else{
      logger.warn(`Missing JWT - ${httpMethod} ${routeUrl}`);
      return res.status(403).send({status:'failure', reason:'Missing access Token'});
    }
  } else{
    next();
  }
});

app.use('/api/login', loginRouter);
app.use('/api/secured', authRouter);

/**
 * This miidleware triggers everytime at the end of the response & set headers & data.
 * @name responseHandler
 * @function
 * @memberof module:app
 * @inner
 */

app.use((req, res) => {
  logger.info(`Response Handler - ${req.method} ${req.originalUrl}`);
  if(req.newTokenRequired && req.session.userData){
    try{
      let token = authUtils.generateJWT(req.session.userData);
      res.data = {accessToken: token};
      res.setHeader('Authorization','Bearer ' + token);
    }catch(err){
      logger.error(`Response Handler - ${req.method} ${req.originalUrl}`);
    }
  } else if (req.session && req.session.token) {
    try {
      res.setHeader('Authorization','Bearer ' + req.session.token);
    } catch (err) {
      logger.error(`Response Handler - ${req.method} ${req.originalUrl}`);
    }
  }
  res.status(res.statusCode || 200).send(res.data);
});

app.listen(port, () =>{
  console.log('Listening to 8080!');
  logger.info('Listening to 8080!');
});

app.on( 'close', () => console.log('Closing'));
module.exports = app; // for testing
