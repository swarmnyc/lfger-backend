'use strict';
process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app/app');
const should = chai.should();
const faker = require('faker');
const async = require('async');

const User = require('../app/models/user');

chai.use(chaiHttp);

const generateTestData = function() {
  return new Promise(function(resolve, reject) {
    const clearData = function() {
      return new Promise(function(_resolve, _reject) {
        User.remove({}).exec(function(err) {
          if (err) {
            return _reject(err);
          }

          return _resolve();
        });
      });
    };

    const generateUser = function() {
      return new Promise(function(_resolve, _reject) {
        let user = new User({
          email: faker.internet.email()
        });

        user.save(function(err) {
          if (err) {
            return _reject(err);
          }

          return _resolve();
        });
      });
    };
    let testUnitQuantity = 25;
    let count = 0;

    clearData().then(function() {
      async.whilst(function() {
        return count < testUnitQuantity;
      }, function(callback) {
        count++;
        generateUser().then(callback).catch(callback);
      }, function(err) {
        if (err) {
          return reject(err);
        }

        return resolve();
      });
    }).catch(reject);
  });
};

describe('Users', function() {
  it('should create one new user on /users POST', function(done) {
    let randomEmail = faker.internet.email();
    chai.request(server)
      .post('/users')
      .send({ email: randomEmail })
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.should.have.property('email');
        res.body.email.should.equal(randomEmail);
        done();
      });
  });
});

generateTestData().then(run).catch(function(err) {
  console.error('Error generating test data...');
  console.error(err);
});
