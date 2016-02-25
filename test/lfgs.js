'use strict';
process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiThings = require('chai-things');
const chaiFuzzy = require('chai-fuzzy');
const server = require('../app/app');
const async = require('async');
const _     = require('underscore');
const faker = require('faker');

const Platform = require('../app/models/platform');
const LFG = require('../app/models/lfg');

chai.use(chaiHttp);
chai.use(chaiThings);
chai.use(chaiFuzzy);

const lfgs      = [];
let   comments  = [];

const generateTestData = function() {
  return new Promise(function(resolve, reject) {
    const clearData = function() {
      return new Promise(function(_resolve, _reject) {
        Platform.remove({}).exec(function(err) {
          if (err) {
            return _reject(err);
          }

          LFG.remove({}).exec(function(err) {
            if (err) {
              return _reject(err);
            }

            return _resolve();
          });
        });
      });
    };
    const generatePlatforms = function() {
      return new Promise(function(_resolve, _reject) {
        let platformModels = [];
        let platforms = [{
          name: 'PlayStation 4',
          shortName: 'PS4',
          gamerProfileUrlPrefix: 'https://my.playstation.com'
        }, {
          name: 'Xbox One',
          shortName: 'XB1',
          gamerProfileUrlPrefix: 'https://account.xbox.com/en-US/Profile?gamerId='
        }, {
          name: 'PC',
          shortName: 'PC',
          gamerProfileUrlPrefix: null
        }];

        async.each(platforms, function(platform, callback) {
          let platformModel = new Platform(platform);
          platformModels.push(platformModel);
          platformModel.save(callback);
        }, function(err) {
          if (err) {
            return _reject(err);
          }

          return _resolve(platformModels);
        });
      });
    };
    const generateLFG = function(platform) {
      return new Promise(function(_resolve, _reject) {
        let lfg = new LFG({
          platform: platform._id,
          gamerId: faker.internet.userName(),
          game: faker.commerce.productName(),
          message: faker.lorem.sentence()
        });
        lfg.save(function(err, doc) {
          if (err) {
            return _reject(err);
          }

          lfgs.push(doc);
          return _resolve();
        });
      });
    };
    let testUnitQuantity = 25;
    let count = 0;

    clearData().then(generatePlatforms().then(function(platforms) {
      async.whilst(function() {
        return count < testUnitQuantity;
      }, function(callback) {
        count++;
        let platformRandom = Math.floor(Math.random() * (platforms.length - 1));
        generateLFG(platforms[platformRandom]).then(callback).catch(callback);
      }, function(err) {
        if (err) {
          return reject(err);
        }

        return resolve();
      }).catch(reject);
    })).catch(reject);
  });
};

describe('LFGs', function() {

  it('should list ALL LFGs sorted newest to oldest on /lfgs GET', function(done) {
    chai.request(server)
      .get('/lfgs')
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('array');
        res.body[0].createdAt.should.be.above(res.body[1].createdAt);
        done();
      });
  });
  it('should list ALL LFGs for a Platform on /lfgs?platform=<platform._id> GET', function(done) {
    Platform.findOne().exec(function(err, platform) {
      chai.request(server)
        .get('/lfgs/?platform=' + platform._id.toString())
        .end(function(err, res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('array');
          res.body[0].should.be.a('object');
          res.body[0].should.have.property('platform');
          res.body[0].platform._id.should.equal(platform._id.toString());
          /* TODO: Figure out how to test that platforms match for all elements in array */
          done();
        });
    });
  });
  it('should list ALL LFGs for a Platform on /lfgs?platform=<platform.name>.toUpperCase() GET', function(done) {
    Platform.findOne().exec(function(err, platform) {
      chai.request(server)
        .get('/lfgs/?platform=' + platform.name.toUpperCase())
        .end(function(err, res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('array');
          res.body[0].platform.name.should.equal(platform.name);
          done();
        });
    });
  });
  it('should list ALL LFGs for a Platform on /lfgs?platform=<platform.name> GET', function(done) {
    Platform.findOne().exec(function(err, platform) {
      chai.request(server)
        .get('/lfgs/?platform=' + platform.name)
        .end(function(err, res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('array');
          res.body[0].platform.name.should.equal(platform.name);
          done();
        });
    });
  });
  it('should list ALL LFGs for a Platform on /lfgs?platform=<platform.shortName> GET', function(done) {
    Platform.findOne().exec(function(err, platform) {
      chai.request(server)
        .get('/lfgs/?platform=' + platform.shortName)
        .end(function(err, res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('array');
          res.body[0].platform.name.should.equal(platform.name);
          /* TODO: Figure out how to test that platforms match for all elements in array */
          done();
        });
    });
  });
  it('should list a SINGLE LFG on /lfg/<id> GET', function(done) {
    LFG.findOne().populate('platform').exec(function(err, lfg) {
      chai.request(server)
        .get('/lfgs/' + lfg._id)
        .end(function(err, res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('_id');
          res.body.should.have.property('platform');
          res.body.should.have.property('gamerId');
          res.body.should.have.property('game');
          res.body.platform.should.be.a('object');
          res.body.platform.should.have.property('name');
          res.body.platform.should.have.property('shortName');
          res.body.platform.should.have.property('_id');
          res.body.platform.should.have.property('gamerProfileUrlPrefix');
          res.body._id.should.equal(lfg._id.toString());
          res.body.gamerId.should.equal(lfg.gamerId);
          res.body.game.should.equal(lfg.game);
          res.body.platform.shortName.should.equal(lfg.platform.shortName);
          done();
        });
    });
  });
  it('should add a SINGLE LFG on /lfgs POST', function(done) {
    Platform.findOne().exec(function(err, system) {
      chai.request(server)
        .post('/lfgs')
        .send({ gamerId: 'methodd1', game: 'ESO', message: 'Let\'s kill shit.', platform: system._id })
        .end(function(err, res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('_id');
          res.body.should.have.property('platform');
          res.body.should.have.property('gamerId');
          res.body.should.have.property('game');
          res.body.gamerId.should.equal('methodd1');
          res.body.game.should.equal('ESO');
          res.body.message.should.equal('Let\'s kill shit.');
          done();
        });
    });
  });
  it('should add a SINGLE LFG on /lfgs POST using platform.shortName', function(done) {
    Platform.findOne().exec(function(err, system) {
      chai.request(server)
        .post('/lfgs')
        .send({ gamerId: 'methodd1', game: 'ESO', message: 'Let\'s kill shit.', platform: system.shortName })
        .end(function(err, res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('_id');
          res.body.should.have.property('platform');
          res.body.should.have.property('gamerId');
          res.body.should.have.property('game');
          res.body.gamerId.should.equal('methodd1');
          res.body.game.should.equal('ESO');
          res.body.message.should.equal('Let\'s kill shit.');
          res.body.platform.should.equal(system._id.toString());
          done();
        });
    });
  });
  it('should add a SINGLE LFG on /lfgs POST using platform.name', function(done) {
    Platform.findOne().exec(function(err, system) {
      chai.request(server)
        .post('/lfgs')
        .send({ gamerId: 'methodd1', game: 'ESO', message: 'Let\'s kill shit.', platform: system.name })
        .end(function(err, res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('_id');
          res.body.should.have.property('platform');
          res.body.should.have.property('gamerId');
          res.body.should.have.property('game');
          res.body.gamerId.should.equal('methodd1');
          res.body.game.should.equal('ESO');
          res.body.message.should.equal('Let\'s kill shit.');
          res.body.platform.should.equal(system._id.toString());
          done();
        });
    });
  });
  it('should update a SINGLE LFG on /lfgs/<id> PUT', function(done) {
    chai.request(server)
      .get('/lfgs')
      .end(function(err, res) {
        chai.request(server)
          .put('/lfgs/' + res.body[0]._id)
          .send({ game: 'Destiny' })
          .end(function(error, response) {
            response.should.have.status(200);
            response.should.be.json;
            response.body.should.be.a('object');
            response.body.should.have.property('_id');
            response.body.should.have.property('gamerId');
            response.body.should.have.property('platform');
            response.body.should.have.property('game');
            response.body.game.should.equal('Destiny');
            done();
          });
      });
  });
  it('should delete a SINGLE LFG on /lfgs/<id> DELETE', function(done) {
    chai.request(server)
      .get('/lfgs')
      .end(function(err, res) {
        chai.request(server)
          .delete('/lfgs/'+res.body[0]._id)
          .end(function(error, response) {
            response.should.have.status(200);
            response.should.be.json;
            response.body.should.be.a('object');
            response.body.should.have.property('success');
            response.body.success.should.equal(true);
            done();
          });
      });
  });
});

describe('Comments', function() {
  this.timeout(5000);
  it('should post a comment to lfg on /lfgs/<id>/comments POST', function(done) {
    const _lfg = _.sample(lfgs);
    chai.request(server)
      .post('/lfgs/' + _lfg._id.toString() + '/comments')
      .send({ message: faker.lorem.paragraph(), gamerId: faker.internet.userName() })
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.property('comments');
        res.body.comments.length.should.equal(1);
        res.body.should.have.property('_id', _lfg._id.toString());
        res.body.comments[0].lfgId = _lfg._id;
        comments = comments.concat(res.body.comments);
        done();
      });
  });
  it('should list all comments associated with an lfg on /lfgs/<lfg._id>', function(done) {
    const comment   = _.sample(comments);
    const _lfg      = _.find(lfgs, function(l) {
      return l._id.equals(comment.lfgId);
    });
    chai.request(server)
      .get('/lfgs/' + _lfg._id.toString())
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.property('comments');
        res.body.comments.should.be.a('array');
        res.body.comments.length.should.be.gte(1);
        res.body.comments[0]._id.should.be.equal(comment._id.toString());
        done();
      });
  });

  it('should list a specific comment on /lfgs/<lfg._id>/comments/<comment._id>', function(done) {
    const comment   = _.sample(comments);
    const _lfg      = _.find(lfgs, function(l) {
      return l._id.equals(comment.lfgId);
    });
    chai.request(server)
      .get('/lfgs/' + _lfg._id.toString() + '/comments/' + comment._id.toString())
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.property('_id', comment._id.toString());
        res.body.should.have.property('message', comment.message);
        res.body.should.have.property('gamerId', comment.gamerId);
        done();
      });
  });
});

generateTestData().then(run).catch(function(err) {
  console.error('Error generating test data... ');
  console.error(err);
});
