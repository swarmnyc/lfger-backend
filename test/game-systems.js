'use strict';
process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app/app');
const should = chai.should();

const GameSystem = require('../app/models/game-system');
const LFG = require('../app/models/lfg');
const AdminUser = require('../app/models/admin-user');

const adminUserFactory = function() {
  return new AdminUser({
    email: 'admin@lfger.com',
    password: 'supercool'
  });
};

const gameSystemFactory = function() {
  return new GameSystem({
    name: 'PlayStation 4',
    shortName: 'PS4',
    gamerUrlPath: 'https://my.playstation.com/'
  });
};

describe('GameSystems', function() {
    it('should list ALL GameSystems on /game-systems GET', function(done) {
      chai.request(server)
        .get('/game-systems')
        .end(function(err, res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('array');
          done();
        });
    });
    it('should list a SINGLE GameSystem on /game-systems/<id> GET', function(done) {
      let newSystem = gameSystemFactory();
      newSystem.save().then(function(system) {
        chai.request(server)
          .get('/game-systems/' + system._id)
          .end(function(err, res) {
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.be.a('object');
            res.body.should.have.property('_id');
            res.body.should.have.property('shortName');
            res.body.should.have.property('name');
            res.body.should.have.property('gamerUrlPath');
            res.body._id.should.equal(system._id.toString());
            res.body.shortName.should.equal('PS4');
            res.body.name.should.equal('PlayStation 4');
            done();
          });
        });
    });
    it('should add a SINGLE GameSystem on /game-systems POST', function(done) {
      let newAdminUser = adminUserFactory();
      newAdminUser.save().then(function(adminUser) {
        chai.request(server)
          .post('/login')
          .send({ username: adminUser.email, password: adminUser.password })
          .end(function(err, response) {
            chai.request(server)
              .post('/game-systems')
              .send({ name: 'Xbox One', shortName: 'XB1', gamerUrlPath: 'https://www.xbox.com/' })
              .end(function(err, res) {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('_id');
                res.body.should.have.property('shortName');
                res.body.should.have.property('name');
                res.body.should.have.property('gamerUrlPath');
                res.body.name.should.equal('Xbox One');
                res.body.shortName.should.equal('XB1');
                res.body.gamerUrlPath.should.equal('https://www.xbox.com/');
                done();
            });
        });
      });
    });
    it('should update a SINGLE GameSystem on /game-systems/<id> PUT', function(done) {
      chai.request(server)
        .get('/game-systems')
        .end(function(err, res) {
          chai.request(server)
            .put('/game-systems/' + res.body[0]._id)
            .send({ name: 'TurboGrafx 16' })
            .end(function(error, response) {
              response.should.have.status(200);
              response.should.be.json;
              response.body.should.be.a('object');
              response.body.should.have.property('_id');
              response.body.should.have.property('shortName');
              response.body.should.have.property('gamerUrlPath');
              response.body.should.have.property('name');
              response.body.name.should.equal('TurboGrafx 16');
              done();
            });
        });
    });
    it('should delete a SINGLE LFG on /game-systems/<id> DELETE', function(done) {
      chai.request(server)
        .get('/game-systems')
        .end(function(err, res) {
          chai.request(server)
            .delete('/game-systems/'+res.body[0]._id)
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
