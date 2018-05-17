// this router is for '/recipe-books' endpoint, which is private
// recipe books are stored in database. 

const express = require('express');
const router = express.Router();
const request=require('request-promise');

const RecipeBooks=require('./models');

router.use(express.json());

// GET method, show all recipe books the user created
router.get('/', (req, res) => {
  return RecipeBooks.find()
    .then(books => res.json(books.map(book => book.serialize())))
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

// GET by _id of a recipebook
router.get('/:id',(req,res)=>{
	RecipeBooks.findById(req.params.id,function(err,book){
	  	res.json(book);
	  })
});

// POST
router.post('/',(req,res)=>{
  const requiredFields = ['user', 'name'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  RecipeBooks.insertOne(
  	{
      name: req.body.name,
      user: req.body.user,
      recipes: req.body.recipes,
      description: req.body.description
    })
    .then(function(err, document){
    	console.log(`Created recipe book ${req.body.name}`);
      	res.status(201).json(document.serialize());
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });


});


// PUT
router.put('/:id',(req,res)=>{
  // ensure that the id in the request path and the one in request body match  
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = (
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`);
    console.error(message);
    return res.status(400).json({ message: message });
  }
  // we only support a subset of fields being updateable if the user sent over any of the updatableFields, we udpate those values in document
  const toUpdate = {};
  const updateableFields = ['name', 'description', 'recipes'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  RecipeBooks
  	.findByIdAndUpdate(req.params.id, { $set: toUpdate })
    .then(document => {
      console.log(`Updating recipe book \`${req.body.name}\``);
      res.status(204).end();
    })
    .catch(err => res.status(500).json({ message: 'Internal server error' }));

});

// DELETE
router.delete('/:id',(req,res)=>{
  RecipeBooks
    .findByIdAndRemove(req.params.id)
    .then(document => {
    	console.log(`Deleted recipe book ${req.params.id}`);
    	res.status(204).end();
    })
    .catch(err => res.status(500).json({ message: 'Internal server error' }));
});

module.exports = {router};
