const { createLogger, format, transports } = require('winston');

module.exports = logger = createLogger({
  level: 'info',
  format: format.combine(
    format.simple(),
    format.timestamp(),
    format.printf(info => `[${info.timestamp}] : ${info.level} : ${info.message}`)
  ),
  defaultMeta: { service: 'user-service' },
  transports: [
    new transports.File({
      filename: `./logs/error.log`,
      maxsize: 5120000,
      maxFiles: 5,
      level: 'error'
    }),
    new transports.File({
      filename: './logs/all.log',
      maxsize: 5120000,
      maxFiles: 5,
      level: 'debug'
    })
  ],
});

/*
if (process.env.NODE_ENV !== 'production')
  logger.add(new transports.Console({level: 'debug'}));
*/
