// this router is for '/recipe-books' endpoint, which is private
// GET '/' list all recipe books of the user
// GET '/book' retrieve a specific book by id, request.query supplies bookId
// GET '/recipe' retrieve a specific recipe inside a specific book, request.query supplies bookId and recipeId
// POST '/' req.body must supply "name" and "user"
// PUT '/book' req.body supplies editBook:"add" or "delete" to indicate add or delete recipe and supplies recipes apiID (not database _id) for adding or deleting recipes
/*
request.body={
  bookId:String,
  name:String,
  description:String,
  editBook:String // only allows "add" or "delete"
  recipe:{
    apiId:Number,
    title:String,
    ...
  } // recipe is the json response from 3rd party api (recipeInformation), apiId is 3rd party api id
}
*/
// DELETE '/' request.query supplies bookId

const express = require('express');
const router = express.Router();
const request=require('request-promise');

const {RecipeBooks}=require('./models');

router.use(express.json());

// GET method, show all recipe books the user created
router.get('/', (req, res) => {
  RecipeBooks.find()
    .then(books => res.json(books.map(book => book.serialize())))
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

// GET a specific recipe book by id; request.query supply "bookId"
router.get('/book',(req,res)=>{
  console.log(req.query.bookId);
  RecipeBooks
    .findById(req.query.bookId)
    .then(book=>{
      res.status(200).json(book);
    })
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

// GET a specific recipe inside a specific recipe book; request.query supply "bookId" and "recipeId"
router.get('/recipe',(req,res)=>{
  // check if that recipe is in the recipebook
  let theBook;
  RecipeBooks.findById(req.query.bookId)
    .then(book=>{
      theBook=book;
      return theBook;
    })
    .then(theBook=>{
      let recipes=theBook.recipes;
      let found=false;
      for(let i=0;i<recipes.length;i++){
        if(recipes[i]._id.toString()===req.query.recipeId){
          found=true;
          console.log(`found recipe ${req.query.recipeId} in book ${req.query.bookId}`)
          res.status(200).json(recipes[i]);
          break;
        }
      }
      if(!found){
        console.log(`cannot found recipe in the book`);
        res.status(404).json({message:"Cannot find requested recipe in the specified book"})
        }
      })
    .catch((err)=>{
      console.log('Error in searching database');
      res.status(500).json({message:'Internal server error'});
    });
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

  RecipeBooks.create(
  	{
      name: req.body.name,
      user: req.body.user,
      recipes: req.body.recipes || [],
      description: req.body.description || '',
      numberOfRecipes:req.body.recipes?req.body.recipes.length:0
    })
    .then(function(document){
    	console.log(`Created recipe book ${req.body.name}`);
      	res.status(201).json(document.serialize());
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});

// PUT request.body supplies bookId, other fields to be updated
router.put('/book',(req,res)=>{

	// check recipe book id is supplied
	if (!req.body.bookId){
		const message=`missing required field {bookId} in request body`;
		console.error(message);
		res.status(400).json({ message: message });
  }

  // update name and description
  const toUpdate = {};
  const updateableFields = ['name', 'description'];
  updateableFields.forEach( field => {
    if(field in req.body){
    	toUpdate[field] = req.body[field];
    }
  });
  // important: must include {new:true} otherwise won't update
  // update name and description first
  RecipeBooks.findByIdAndUpdate(req.body.bookId, {$set: toUpdate}, {new:true})
    .then(book=>{
      // update recipes (if applicable)
      const recipeInBook=book.recipes;
      let targetRecipeList;
      if(!recipeInBook){targetRecipeList=[];}else{targetRecipeList=recipeInBook;}

      // check if to update recipes
      if(req.body.editBook && req.body.recipe){
        // to add
        if(req.body.editBook==='add'){
          // check no duplicate
          let toAdd=true;
          for(let i=0;i<targetRecipeList.length;i++){
            if(targetRecipeList[i].apiId===req.body.recipe.apiId){
              toAdd=false;
              break;
            }
          }
          if(toAdd){
            targetRecipeList.push(req.body.recipe);
          }
        }

        // to delete
        else if(req.body.editBook==='delete'){
          for(let j=0;j<targetRecipeList.length;j++){
            if(targetRecipeList[j].apiId && (targetRecipeList[j].apiId.toString()===req.body.recipe.apiId)){
              targetRecipeList.splice(j,1);
              break;
            }
          }
        }
        // parameter has wrong value
        else{
          res.status(400).json({message:'The value of key {editBook} is not acceptable'});
        }
      }else if(req.body.editBook || req.body.recipe){
        // only has one of these two parameters, cannot proceed
        let message="Missing required fields: {recipe} or {editBook}";
        console.log(message);
        res.status(400).json({message:message});
      }
      return targetRecipeList;
    })
  .then(newList=>{
    RecipeBooks
      .findByIdAndUpdate(req.body.bookId, {$set: {recipes:newList} }, {new:true})
      .then(newBook=>{
        console.log(`update recipe book ${req.body.bookId}`);
        res.status(200).json(newBook);
      })
  })
  .catch(err => res.status(500).json({ message: 'Internal server error' }));
});

// DELETE: req.query supplies bookId
router.delete('/',(req,res)=>{
  RecipeBooks
    .findByIdAndRemove(req.query.bookId)
    .then(document => {
    	console.log(`Deleted recipe book ${req.query.bookId}`);
    	res.status(204).end();
    })
    .catch(err => res.status(500).json({ message: 'Internal server error' }));
});

module.exports = {router};