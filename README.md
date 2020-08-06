# Microservice to generate & authenticate JWT

This Microservice let you do generate a JWT for any username & password & then let you access secured path which needs the generated JWT in header.
Secured Paths :
1) Patching json object with a patch object.
2) Creating a thumbnail of 50x50 size from an image URL.


## Installation

Use the package manager [npm](https://www.npmjs.com/get-npm) to install the dependencies.

```bash
npm install
```
## Test Suite

There is an inbuilt test suite which runs using.

```bash
npm test
```

## Documentation

There is a jsdoc config file is present in the repository please install [jsdoc](https://www.npmjs.com/package/jsdoc) & run the following command:

```bash
jsdoc -c jsdoc.json
```

## Usage

```node
npm start
```

## Centralized Logging

Centralized logging is implemented, you can see the logs in following manner
 1) Error Logs: logs/error.log
 2) All Logs: all.log

## License
[MIT](https://choosealicense.com/licenses/mit/)
