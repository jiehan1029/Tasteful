/* substitute the route to test */
const routeToTest='/';
const chai = require('chai');
const chaiHttp = require('chai-http');
/* the server.js or app.js must has appropriate export  */
const {app, runServer, closeServer} = require('../server');
chai.use(chaiHttp);
// for code using should syntax, check the bottom part of this file.
const expect = chai.expect;

describe('test index endpoint',function(){
	// use nested `describe` blocks to make clearer, more discrete tests
  describe('GET endpoint', function() {
		it('should render index page', function() {
			// check res status
			let res;
			return chai.request(app)
			.get(routeToTest)
      .then(function(_res) {
			// so subsequent .then blocks can access response object
        res = _res;
        expect(res).to.have.status(200);
			});
		});
  });
});