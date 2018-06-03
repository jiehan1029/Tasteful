const routeToTest='/recipes';
const chai = require('chai');
const chaiHttp = require('chai-http');
const {app, runServer, closeServer} = require('../server');
chai.use(chaiHttp);
const expect = chai.expect;
const {MASHAPE_KEY} = require('../config');

describe('test recipes endpoint',function(){

  describe('GET / endpoint', function() {
		it('should return 200 status code', function() {
			let res;
			return chai.request(app)
			.get(routeToTest)
      .then(function(_res) {
        res = _res;
        expect(res).to.have.status(200);
			})
		});
  });

  describe('GET /details endpoint', function() {
    it('should return 200 status code', function() {
      let res;
      return chai.request(app)
      .get(routeToTest)
      .set('recipeApiId',518323)
      .set('X-Mashape-Key', MASHAPE_KEY)
      .then(function(_res) {
        res = _res;
        expect(res).to.have.status(200);
      })
    });
  });
	
});	