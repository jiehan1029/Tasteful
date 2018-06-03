const routeToTest='/recipe-books';
const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
const {app, runServer, closeServer} = require('../server');
const {RecipeBooks} = require('../routes/recipe-books/models');
const {Users} = require('../routes/users/models');
const {TEST_DATABASE_URL} = require('../config');
chai.use(chaiHttp);
const expect = chai.expect;

let user_details={
  username:faker.name.firstName(),
  password:faker.random.word()
}

describe('test user auth and recipe-books endpoint',()=>{
  beforeEach((done)=>{
    // reset user mode (passed auth or not) before each test
    Users.remove({},(err)=>{
      console.log(err);
      done();
    })
  });

  describe('resgister user, login and check auth',(done)=>{
    chai.request(app)
      .post('/users')
      .send(user_details)
      .end((err,res)=>{
        console.log('This was user registration');
        expect(res).to.have.status(201);

        // after registration, login
        chai.request(app)
          .post('/auth/login')
          .send(user_details)
          .end((err,res)=>{
            console.log('This was user login (auth)');
            expect(res).to.have.status(200);
            expect(res).to.have.cookie('jwt');

            let token=res.cookies.jwt;
            // request protected endpoint
            describe('GET / endpoint', function() {
              it('should have status 200', function() {
                return RecipeBooks
                .findOne()
                .then(function(dbItem){
                  return username=dbItem.user;
                })
                .then(username=>{
                  chai.request(app)
                  .get(routeToTest)
                  .set('Cookie',`username=${username}`)
                  .set('Cookie',`jwt=${token}`)
                  .then(function(_res) {
                    expect(_res).to.have.status(200);
                  })
                })
              });
            });

            describe('GET /book endpoint', function() {
              it('should have status 200', function() {
                return RecipeBooks
                .findOne()
                .then(function(dbItem){
                  return {username:dbItem.user,id:dbItem.id};
                })
                .then(data=>{
                  chai.request(app)
                  .get(routeToTest)
                  .set('Cookie',`username=${data.username}`)
                  .set('Cookie',`jwt=${token}`)
                  .set('bookId',`${data.id}`)
                  .then(function(_res) {
                    expect(_res).to.have.status(200);
                  })
                })
              });
            }); 
            
            describe('POST endpoint', function() {
              // POST will 1) create an item in database and 2) return the created item.
              // so must check 1) the response has correct code and content contains correct keys and 2) the response matches the newly created database item
              it('should add a new item', function() {
                // newItem compliant with model schema, not virtuals
                const newItem = {
                  user: faker.name.firstName(),
                  name:faker.random.word(),
                  description:faker.random.word(),
                  recipes:[]
                };
                return chai.request(app)
                .post(routeToTest)
                .send(newItem)
                .set('Cookie',`username=${username}`)
                .set('Cookie',`jwt=${token}`)
                .then(function(res) {
                  expect(res).to.have.status(201);
                  expect(res).to.be.json;
                  expect(res.body).to.be.a('object');
                  expect(res.body).to.include.keys('id', 'user', 'name', 'description', 'recipes');
                  
                  // check response match request
                  expect(res.body.name).to.equal(newItem.name);
                  // cause Mongo should have created id on insertion
                  expect(res.body.id).to.not.be.null;
                  expect(res.body.user).to.equal(newItem.user);
                  expect(res.body.description).to.equal(newItem.description);
                  expect(res.body.contains).to.equal(`${newItem.recipes.length}`);
                  
                  // pass value to next .then()
                  return RecipeBooks.findById(res.body.id);
                })
                .then(function(dbItem) {
                  // check db item match request
                  expect(dbItem.user).to.equal(newItem.user);
                  expect(dbItem.description).to.equal(newItem.description);
                  expect(dbItem.name).to.equal(newItem.name);
                });
              });
            }); 
            
            describe('PUT endpoint', function() {
              // get an existing item from db
              // PUT to update that item
              // check 1) response body contains the request body data (the updated data) and 2) that item in db is updated correctly

              it('should update fields you send over', function() {
                const updateData = {
                  description: 'newbook'
                };

                return RecipeBooks
                .findOne()
                .then(function(dbItem) {
                  updateData.id = dbItem.id;
                  return chai.request(app)
                  .put(`${routeToTest}/book/${dbItem.id}`)
                  .send(updateData)
                  .set('Cookie',`username=${username}`)
                  .set('Cookie',`jwt=${token}`);
                })
                .then(function(res) {
                  // this res is the PUT response, verify response status is as expected
                  expect(res).to.have.status(204);
                  return RecipeBooks.findById(updateData.id);
                })
                .then(function(dbItem) {
                  // check dbItem is updated (same with request)
                  expect(dbItem.name).to.equal(updateData.name);
                  expect(dbItem.description).to.equal(updateData.description);
                  expect(dbItem.user).to.equal(updateData.user);
                });
              });
            });
            
            describe('DELETE endpoint', function() {
              // get a db item so get its id
              // DELETE that item
              // check response status code and prove that item is removed from db
              it('delete an item by id', function() {
                let dbItem;
                return RecipeBooks
                .findOne()
                .then(function(_dbItem) {
                  dbItem = _dbItem;
                  return chai.request(app)
                    .delete(`${routeToTest}/${dbItem.id}`)
                    .set('Cookie',`username=${username}`)
                    .set('Cookie',`jwt=${token}`);
                })
                .then(function(res) {
                  expect(res).to.have.status(204);
                  return RecipeBooks.findById(dbItem.id);
                })
                .then(function(_dbItem) {
                  expect(_dbItem).to.be.null;
                });
              });
            });
          })
      })
  });
});


/*
function seedTestData(){
  console.info('seeding test data');
  const seedData=[];
  for(let i=1; i<=10;i++){
    seedData.push({
      user: faker.name.firstName(),
      name:faker.random.word(),
      description:faker.random.word(),
      recipes:[]
    });
  }
  return RecipeBooks.insertMany(seedData);
}

function tearDownDb() {
	console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}

describe('test recipe-books endpoint',function(){

	before(function(){
		return runServer(TEST_DATABASE_URL);
	});
	
  beforeEach(function() {
    return seedTestData();
    });

  afterEach(function() {
    return tearDownDb();
  });	

	after(function(){
		return closeServer();
	});
	
  describe('GET / endpoint', function() {
		it('should have status 200', function() {
			return RecipeBooks
      .findOne()
      .then(function(dbItem){
        return username=dbItem.user;
      })
      .then(username=>{
        chai.request(app)
        .get(routeToTest)
        .set('Cookie',`username=${username}`)
        .then(function(_res) {
          expect(_res).to.have.status(200);
        })
      })
		});
  });

  describe('GET /book endpoint', function() {
    it('should have status 200', function() {
      return RecipeBooks
      .findOne()
      .then(function(dbItem){
        return {username:dbItem.user,id:dbItem.id};
      })
      .then(data=>{
        chai.request(app)
        .get(routeToTest)
        .set('Cookie',`username=${data.username}`)
        .set('bookId',`${data.id}`)
        .then(function(_res) {
          expect(_res).to.have.status(200);
        })
      })
    });
  }); 
	
  describe('POST endpoint', function() {
    // POST will 1) create an item in database and 2) return the created item.
		// so must check 1) the response has correct code and content contains correct keys and 2) the response matches the newly created database item
    it('should add a new item', function() {
      // newItem compliant with model schema, not virtuals
      const newItem = {
        user: faker.name.firstName(),
        name:faker.random.word(),
        description:faker.random.word(),
        recipes:[]
      };
      return chai.request(app)
      .post(routeToTest)
      .send(newItem)
      .set('Cookie',`username=${username}`)
      .then(function(res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.include.keys('id', 'user', 'name', 'description', 'recipes');
				
				// check response match request
        expect(res.body.name).to.equal(newItem.name);
        // cause Mongo should have created id on insertion
        expect(res.body.id).to.not.be.null;
        expect(res.body.user).to.equal(newItem.user);
    		expect(res.body.description).to.equal(newItem.description);
        expect(res.body.contains).to.equal(`${newItem.recipes.length}`);
				
        // pass value to next .then()
        return RecipeBooks.findById(res.body.id);
      })
      .then(function(dbItem) {
				// check db item match request
        expect(dbItem.user).to.equal(newItem.user);
        expect(dbItem.description).to.equal(newItem.description);
        expect(dbItem.name).to.equal(newItem.name);
      });
    });
  });	
	
	describe('PUT endpoint', function() {
		// get an existing item from db
		// PUT to update that item
		// check 1) response body contains the request body data (the updated data) and 2) that item in db is updated correctly

    it('should update fields you send over', function() {
      const updateData = {
        description: 'newbook'
      };

      return RecipeBooks
      .findOne()
      .then(function(dbItem) {
        updateData.id = dbItem.id;
        return chai.request(app)
        .put(`${routeToTest}/book/${dbItem.id}`)
        .send(updateData)
        .set('Cookie',`username=${username}`);
      })
      .then(function(res) {
				// this res is the PUT response, verify response status is as expected
        expect(res).to.have.status(204);
        return RecipeBooks.findById(updateData.id);
      })
      .then(function(dbItem) {
				// check dbItem is updated (same with request)
        expect(dbItem.name).to.equal(updateData.name);
        expect(dbItem.description).to.equal(updateData.description);
        expect(dbItem.user).to.equal(updateData.user);
      });
    });
  });
	
	describe('DELETE endpoint', function() {
		// get a db item so get its id
		// DELETE that item
		// check response status code and prove that item is removed from db
    it('delete an item by id', function() {
      let dbItem;
      return RecipeBooks
			.findOne()
      .then(function(_dbItem) {
        dbItem = _dbItem;
        return chai.request(app).delete(`${routeToTest}/${dbItem.id}`).set('Cookie',`username=${username}`);
      })
      .then(function(res) {
        expect(res).to.have.status(204);
        return RecipeBooks.findById(dbItem.id);
      })
      .then(function(_dbItem) {
        expect(_dbItem).to.be.null;
      });
    });
  });
});	

*/