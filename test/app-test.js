const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const should = chai.should();
const imageServices = require('../services/image-service');
const imageUrl = 'https://specials-images.forbesimg.com/imageserve/5d35eacaf1176b0008974b54/960x0.jpg?cropX1=790&cropX2=5350&cropY1=784&cropY2=3349';
let token = '';

chai.use(chaiHttp);

describe('All routes with correct params & headers: ', () => {
  it(' /login :: it should GET us the token!', (done) => {
    let userData = {
      "username" : "abcd",
      "password" : "12345"
    };
    chai.request(app)
      .post('/api/login')
      .send(userData)
      .end((err, res) => {
        token = res.body.accessToken;
        res.should.have.status(200);
        res.body.should.be.a('object').and.has.property('accessToken');
        res.should.have.header('Authorization', 'Bearer ' + token);
        done();
      });
  });

  it('/api/secured/patch :: it should authenticate & get us the patched object!', (done) => {
    let json = {
      "username" : "abcd",
      "password" : "12345",
      "email" : "sky@mail.com"
    };
    let patch = [
        {
        "op": "replace",
        "path": "/password",
        "value": "098765"
        }
    ];
    let patchedData = {
      "username" : "abcd",
      "password" : "098765",
      "email" : "sky@mail.com"
    };
    chai.request(app)
      .put('/api/secured/patch')
      .set('Authorization', 'Bearer ' + token)
      .send({json, patch})
      .end((err, res) => {
            res.should.have.status(200);
            res.should.have.header('Authorization', 'Bearer ' + token);
            res.body.should.be.a('object').to.eql(patchedData, 'response is incorrect');
        done();
      });
  });

  it('/api/secured/createThumbnail :: it should authenticate & get us the resized thumbnail!', (done) => {
    let data = {
      imageUrl : imageUrl
    };
    chai.request(app)
      .get('/api/secured/createThumbnail')
      .set('Authorization', 'Bearer ' + token)
      .send(data)
      .end((err, res) => {
        res.should.have.status(200);
        res.should.have.header('Authorization', 'Bearer ' + token);
        res.should.have.header('Content-Type', 'image/jpeg');
        imageServices.imageResizer(imageUrl, 50)
        .then((thumbnail) => {
          return imageServices.imageCompare(thumbnail, res.body);
        })
        .then((isMatched) => {
          isMatched.should.to.equal(true);
          done();
        })
        .catch((err) =>{
          logger.error('Error: ', err);
          done(err);
        });
      });
  });
});

describe('Edge Cases::', () => {
  it(' /login :: with empty credantials only pass when the the token is not generated.', (done) => {
    let userData = {
      "username" : "",
      "password" : "12345"
    };
    chai.request(app)
      .post('/api/login')
      .send(userData)
      .end((err, res) => {
        res.should.have.status(406);
        res.body.should.be.a('object').and.not.have.property('accessToken');
        res.should.not.have.header('Authorization', 'Bearer ' + token);
        done();
      });
  });

  it('/api/secured/patch :: without patch & json object, should only passed when the req is resolve with 406 code.', (done) => {
    chai.request(app)
      .put('/api/secured/patch')
      .set('Authorization', 'Bearer ' + token)
      .send({})
      .end((err, res) => {
        res.should.have.status(406);
        res.should.have.header('Authorization', 'Bearer ' + token);
        done();
      });
  });

  it('/api/secured/patch :: with incorrect patch object, should only pass when the req is resolve with 406 code.', (done) => {
    let json = {
      "username" : "abcd",
      "password" : "12345",
      "email" : "sky@mail.com"
    };

    let patch = [
        {
        "op": "replace",
        "path": "/passw",
        "value": "098765"
        }
    ];

    let patchedData = {
      "username" : "abcd",
      "password" : "098765",
      "email" : "sky@mail.com"
    };

    chai.request(app)
      .put('/api/secured/patch')
      .set('Authorization', 'Bearer ' + token)
      .send({json, patch})
      .end((err, res) => {
        res.should.have.status(406);
        res.should.have.header('Authorization', 'Bearer ' + token);
        res.body.should.be.a('object').not.eql(patchedData, 'response is incorrect!');
        done();
      });
  });

  it('/api/secured/patch :: with incorrect token, should only pass when the req is resolve with 403 code.', (done) => {
    let json = {
      "username" : "abcd",
      "password" : "12345",
      "email" : "sky@mail.com"
    };

    let patch = [
        {
        "op": "replace",
        "path": "/password",
        "value": "098765"
        }
    ];

    let patchedData = {
      "username" : "abcd",
      "password" : "098765",
      "email" : "sky@mail.com"
    };

    chai.request(app)
      .put('/api/secured/patch')
      .set('Authorization', 'Bearer ' + token + 'temp')
      .send({json, patch})
      .end((err, res) => {
        res.should.have.status(403);
        res.should.have.header('Authorization', 'Bearer ' + token + 'temp');
        res.body.should.be.a('object').not.eql(patchedData, 'response is incorrect!');
        done();
      });
  });

  it('/api/secured/createThumbnail :: with no image url, should only pass when the req is resolve with 403 code!', (done) => {
    let data = {};
    chai.request(app)
      .get('/api/secured/createThumbnail')
      .set('Authorization', 'Bearer ' + token)
      .send(data)
      .end((err, res) => {
        res.should.have.status(406);
        res.should.have.header('Authorization', 'Bearer ' + token);
        done();
      });
  });

  it('/api/secured/createThumbnail :: with invalid image url, should only pass when the req is resolve with 403 code!', (done) => {
    let data = {
      imageUrl: 'qwqwqwqssqwwd'
    };
    chai.request(app)
      .get('/api/secured/createThumbnail')
      .set('Authorization', 'Bearer ' + token)
      .send(data)
      .end((err, res) => {
        res.should.have.status(406);
        res.should.have.header('Authorization', 'Bearer ' + token);
        done();
      });
  });

});
