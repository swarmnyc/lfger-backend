'use strict';
process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app/app');
const should = chai.should();

const GameSystem = require('../app/models/game-system');
const LFG = require('../app/models/lfg');

chai.use(chaiHttp);

const gameSystemFactory = function() {
  return new GameSystem({
    name: 'PlayStation 4',
    shortName: 'PS4',
    gamerUrlPath: 'https://my.playstation.com/'
  });
};

const lfgFactory = function(system) {
  return new LFG({
    gameSystem: system._id,
    gamerTag: 'methodd1',
    game: 'ESO',
    message: 'I would like to destroy everything'
  });
};

describe('LFGs', function() {
    it('should list ALL LFGs on /lfgs GET', function(done) {
      chai.request(server)
        .get('/lfgs')
        .end(function(err, res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('array');
          done();
        });
    });
    it('should list a SINGLE LFG on /lfg/<id> GET', function(done) {
      let newSystem = gameSystemFactory();
      newSystem.save().then(function(system) {
        let newLFG = lfgFactory(system);
        newLFG.save().then(function(lfg) {
          chai.request(server)
            .get('/lfgs/' + lfg._id)
            .end(function(err, res) {
              res.should.have.status(200);
              res.should.be.json;
              res.body.should.be.a('object');
              res.body.should.have.property('_id');
              res.body.should.have.property('gameSystem');
              res.body.should.have.property('gamerTag');
              res.body.should.have.property('game');
              res.body._id.should.equal(lfg._id.toString());
              res.body.gamerTag.should.equal('methodd1');
              res.body.game.should.equal('ESO');
              done();
            });
        });
      });
    });
    it('should add a SINGLE LFG on /lfgs POST', function(done) {
      let newSystem = gameSystemFactory();
      newSystem.save().then(function(system) {
        chai.request(server)
          .post('/lfgs')
          .send({ gamerTag: 'methodd1', game: 'ESO', message: 'Let\'s kill shit.', gameSystem: system._id })
          .end(function(err, res) {
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.be.a('object');
            res.body.should.have.property('_id');
            res.body.should.have.property('gameSystem');
            res.body.should.have.property('gamerTag');
            res.body.should.have.property('game');
            res.body.gamerTag.should.equal('methodd1');
            res.body.game.should.equal('ESO');
            res.body.message.should.equal('Let\'s kill shit.');
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
              response.body.should.have.property('gamerTag');
              response.body.should.have.property('gameSystem');
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
