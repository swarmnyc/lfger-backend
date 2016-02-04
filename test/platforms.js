'use strict';
process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app/app');
const should = chai.should();

const Platform = require('../app/models/platform');
const LFG = require('../app/models/lfg');
const User = require('../app/models/user');

const adminUserFactory = function() {
  return new Promise(function(resolve, reject) {
    let user = new User({
      name: 'John Doe',
      email: 'admin@lfger.com',
      password: 'supercool',
      role: 'admin'
    });

    user.save(function(err, doc) {
      if (err) {
        return reject(err);
      }

      return resolve(doc);
    });
  });
};

const platformFactory = function() {
  return new Platform({
    name: 'PlayStation 4',
    shortName: 'PS4',
    gamerProfileUrlPrefix: 'https://my.playstation.com/'
  });
};

describe('Platforms', function() {
    it('should list ALL Platforms on /platforms GET', function(done) {
      chai.request(server)
        .get('/platforms')
        .end(function(err, res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('array');
          done();
        });
    });
    it('should list a SINGLE Platform on /platforms/<id> GET', function(done) {
      let newSystem = platformFactory();
      newSystem.save().then(function(system) {
      chai.request(server)
        .get('/platforms/' + system._id)
        .end(function(err, res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('_id');
          res.body.should.have.property('shortName');
          res.body.should.have.property('name');
          res.body.should.have.property('gamerProfileUrlPrefix');
          res.body._id.should.equal(system._id.toString());
          res.body.shortName.should.equal(system.shortName);
          res.body.name.should.equal(system.name);
          done();
        });
      });
    });
    // it('should add a SINGLE Platform on /platforms POST', function(done) {
    //   let demoPlatform = {
    //     name: 'Xbox One',
    //     shortName: 'XB1',
    //     gamerProfileUrlPrefix: 'https://www.xbox.com/'
    //   };
    //
    //   adminUserFactory().then(function(adminUser) {
    //     chai.request.agent(server)
    //       .post('/login')
    //       .send({ username: adminUser.email, password: 'supercool' })
    //       .then(function(response) {
    //         chai.request.agent(server)
    //           .post('/platforms')
    //           .send(demoPlatform)
    //           .end(function(err, res) {
    //             res.should.have.status(200);
    //             res.should.be.json;
    //             res.body.should.be.a('object');
    //             res.body.should.have.property('_id');
    //             res.body.should.have.property('shortName');
    //             res.body.should.have.property('name');
    //             res.body.should.have.property('gamerProfileUrlPrefix');
    //             res.body.name.should.equal(demoPlatform.name);
    //             res.body.shortName.should.equal(demoPlatform.shortName);
    //             res.body.gamerProfileUrlPrefix.should.equal(demoPlatform.gamerProfileUrlPrefix);
    //             done();
    //         });
    //     }).catch(function(err) {
    //       console.error(err);
    //     });
    //   });
    // });
    // it('should update a SINGLE Platform on /platforms/<id> PUT', function(done) {
    //   chai.request(server)
    //     .get('/platforms')
    //     .end(function(err, res) {
    //       chai.request(server)
    //         .put('/platforms/' + res.body[0]._id)
    //         .send({ name: 'TurboGrafx 16' })
    //         .end(function(error, response) {
    //           response.should.have.status(200);
    //           response.should.be.json;
    //           response.body.should.be.a('object');
    //           response.body.should.have.property('_id');
    //           response.body.should.have.property('shortName');
    //           response.body.should.have.property('gamerProfileUrlPrefix');
    //           response.body.should.have.property('name');
    //           response.body.name.should.equal('TurboGrafx 16');
    //           done();
    //         });
    //     });
    // });
    // it('should delete a SINGLE LFG on /platforms/<id> DELETE', function(done) {
    //   chai.request(server)
    //     .get('/platforms')
    //     .end(function(err, res) {
    //       chai.request(server)
    //         .delete('/platforms/'+res.body[0]._id)
    //         .end(function(error, response) {
    //           response.should.have.status(200);
    //           response.should.be.json;
    //           response.body.should.be.a('object');
    //           response.body.should.have.property('success');
    //           response.body.success.should.equal(true);
    //           done();
    //         });
    //     });
    // });
});
