// this router is for '/recipe-books' endpoint, which is private

const express = require('express');
const router = express.Router();
const request=require('request-promise');
const bodyParser=require('body-parser');

const {RecipeBooks}=require('./models');

router.use(bodyParser.json());

// GET method, show all recipe books the user created
router.get('/', (req, res) => {
  RecipeBooks.find({user:req.cookies.username})
    .then(books => {
      let hbsObj={
        layout:false,
        username:req.cookies.username,
        bookCount:books.length,
        bookList:books.map(book=>book.serialize())
      }
      res.render("recipe-books",hbsObj);
    })
    .catch(err => {
      let errorHbs={
        statusCode:500,
        errorMessage:'Internal Server Error',
        layout:false
      };
      res.status(500).render('error',errorHbs);      
    });
});

// GET a specific recipe book by id; request.query supply "bookId"
router.get('/book',(req,res)=>{
  console.log('receive GET request for recipe book details'+req.query.bookId);
  RecipeBooks
    .findById(req.query.bookId)
    .then(book=>{
      //console.log(book);
      const hbsObj={
        layout:false,
        username:req.cookies.username,
        bookTitle:book.name,
        bookId:book.id,
        recipesCount:book.recipes.length,
        recipes:book.recipes
      }
      //console.log(hbsObj);
      res.status(200).render(`recipe-books-book`,hbsObj);
    })
    .catch(err => {
      let errorHbs={
        statusCode:500,
        errorMessage:'Internal Server Error',
        layout:false
      };
      res.status(500).render('error',errorHbs);      
    });
});

// POST create new book
router.post('/',(req,res)=>{
  // check required fields are supplied
  const requiredFields = ['name'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }
  // check duplicated names
  let count;
  RecipeBooks.find({name:req.body.name}).exec(function(err,data){
    count=data.length;
    if(count>0){
      res.status(400).send('book name already taken, please use a different name!');
    }else{
    RecipeBooks
      .create({
        name: req.body.name,
        user: req.cookies['username'],
        recipes: req.body.recipes || [],
        description: req.body.description || 'click to edit'
      })
      .then(function(document){
        console.log(`Created recipe book ${req.body.name}`);
        res.status(201).json(document.serialize());
      })
      .catch(err => {
        console.error(err);
        let errorHbs={
          statusCode:500,
          errorMessage:'Internal Server Error',
          layout:false
        };
        res.status(500).render('error',errorHbs);        
      });
    }
  });
});

// PUT update current book
// request.body supplies bookId, other fields to be updated
router.put('/book',(req,res)=>{
  console.log('receive put request, req body = ');
  console.log(req.body);
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
      console.log('book name or description updated');
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
            if(targetRecipeList[i].apiId.toString()===req.body.recipe.apiId){
              toAdd=false;
              console.log('no recipe added because it is in the book already');
              res.json({duplicateMessage:'no recipe added because it is in the book already'});
              break;
            }
          }
          if(toAdd){
            targetRecipeList.push(req.body.recipe);
            console.log('new recipe added to book');
          }
        }
        // to delete
        else if(req.body.editBook==='delete'){
          for(let j=0;j<targetRecipeList.length;j++){
            if(targetRecipeList[j].apiId.toString()===req.body
   .recipe.apiId){
              targetRecipeList.splice(j,1);
              console.log('deleted recipe');
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

// DELETE: req.body supplies bookId
router.delete('/',(req,res)=>{
  console.log('receive request to delete book '+req.body.bookId);
  RecipeBooks
    .findByIdAndRemove(req.body.bookId)
    .then(document => {
    	console.log(`Deleted recipe book ${req.body.bookId}`);
    	res.status(204).end();
    })
    .catch(err => res.status(500).json({ message: 'Internal server error' }));
});

module.exports = {router};
