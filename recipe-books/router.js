// this router is for '/recipe-books' endpoint, which is private
// recipe books are stored in database. 

const express = require('express');
const router = express.Router();
const request=require('request-promise');

// it's very important to use {} in importing. Otherwise will error!
const {RecipeBooks}=require('./models');

router.use(express.json());


// GET by _id of a recipebook
// request supply "id" in parameters
router.get('/:id',(req,res)=>{
	console.log('inside find by id route')
    RecipeBooks
      .findById(req.params.id)
	  .then(function(book){
	  	console.log(`found recipe book ${req.params.id}`);
	  	res.json(book.serialize());
	  })
	  .catch(err => res.status(500).json({message: 'Internal server error'}));

	/*
	if(!req.query.recipeId){
		RecipeBooks
		  .findById(req.params.id)
		  .then(function(book){
		  	res.json(book.serialize());
		  });
	}else{
		RecipeBooks
		  .findById(req.params.id)
		  .then(function(book){
		  	let theRecipe;
		  	for(let i=0;i<book.recipes.length;i++){
		  		if(book.recipes[i].id===req.query.recipeId){
		  			theRecipe=book.recipes[i];
		  			break;
		  		}
		  	}
		  	return theRecipe;
		  })
		  .then(function(found){
		  	if(!found){
		  		res.status(404).send('cannot find request recipe in the book');
		  	}else{
		  		console.log(`found recipe ${req.query.recipeId} in recipe book ${req.params.id}`);
		  		res.json(found);
		  	}
		  });
	}
*/
});


// GET a specific recipe in this book
// request.params supply "bookId" and recipeId
router.get('/recipes',(req,res)=>{
	RecipeBooks
	  .findById(req.params.bookId)
	  .then(book=>{
	  	for(let i=0;i<book.recipes.length;i++){
	  		if(book.recipes[i].id===req.params.recipeId){
	  			res.json(book.recipes[i]);
	  		}
	  	}
	  })
	  .catch(err => res.status(500).json({message: 'Internal server error'}));
});


// GET method, show all recipe books the user created -- done
router.get('/', (req, res) => {
	console.log('no id route');
  RecipeBooks.find()
    .then(books => res.json(books.map(book => book.serialize())))
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

// POST -- done
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
      recipes: req.body.recipe,
      description: req.body.description,
      numberOfRecipes:req.body.recipe?req.body.recipe.length:0
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


// PUT -- edit book name or description, add or delete recipes from the book
// request.body supplies "action" key whose value is add" or "delete" and "recipes" key with value of recipe object
// only allow adding one recipe at a time, so req.body.recipe is the recipe object, not an array
/*
router.put('/',(req,res)=>{

  // check recipe book id is supplied
  if (!req.body.id) {
    const message=`missing required field: recipe book id`;
    console.error(message);
    res.status(400).json({ message: message });
  }

  // update name and description
  const toUpdate = {};
  const updateableFields = ['name', 'description'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  // important: must include {new:true} otherwise won't update
  RecipeBooks
  	.findByIdAndUpdate(req.body.id, { $set: toUpdate }, {new:true})
    .then(document => {
      // check if need to update recipes list
      if(!req.body.action || !req.body.recipe){
      	return document;
      }else{
      	// add recipe into book
      	if(req.body.action==="add" && req.body.recipe){
      		// check current book doesn't contain this recipeId
      		for(let i=0;i<document.recipes.length;i++){
      			if(document.recipes[i].id===req.body.recipe.id){
      				res.status(400).json({message:'this recipe is already in the book!'});
      				break;
      			}
      		}
      		RecipeBooks
      		  .findByIdAndUpdate(req.body.id,{$push:{recipes:req.body.recipe},$set:{numberOfRecipes:document.recipes.length+1}})
      		  .then(document=>{
      		  	res.json(document.serialize);
      		  })
      	}
      	// delete recipe from book
      	else if(req.body.action==="delete" && req.body.recipe){
      		for(let j=0;j<document.recipes.length;j++){
      			if(document.recipes[j].id===req.body.recipe.id){
      				document.recipes.splice(j,1);
      				document.numberOfRecipes=document.recipes.length;
      				break;
      			}
      		}
      		console.log('delete recipe');
      		console.log(document);
      		return document;
      	}
      	// request doesn't supply action or recipeId so cannot process
      	else{
      	  let message="Cannot add or delete recipes: one or more required fields is missing in request body";
      	  console.log(message);
      	  res.status(400).json({message:message});
      	}
      }
      
    })
    .then(updatedBook =>{
    	console.log(`Updating recipe book \`${req.body.name}\``);
        res.json(updatedBook.serialize());
    })
    .catch(err => res.json({ message: 'Internal server error' }));

});

*/
















router.put('/',(req,res)=>{
	// check recipe book id is supplied
	if (!req.body.id) {
		const message=`missing required field: recipe book id`;
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
    RecipeBooks
  	.findByIdAndUpdate(req.body.id, { $set: toUpdate }, {new:true})


    let targetRecipeList=RecipeBooks.findById(req.body.id).recipes?RecipeBooks.findById(req.body.id).recipes:[];

    // check if to update recipes
    if(req.body.action && req.body.recipe){

  		// to add
	  	if(req.body.action==='add'){
	  		// check no duplicate
	  		let toAdd=true;
	  		for(let i=0;i<targetRecipeList.length;i++){
	  			if(targetRecipeList[i].id===req.body.recipe.id){
	  				toAdd=false;
	  				break;
	  			}
	  		}

	  		if(toAdd){
	  			RecipeBooks
	  			  .findByIdAndUpdate(req.body.id,{$push:{recipes:req.body.recipe}});
	  		}

	  	}
	  	// to delete
	  	else if(req.body.action==='delete'){
	  		for(let j=0;j<targetRecipeList.length;j++){
	  			if(targetRecipeList[j].id===req.body.recipe.id){
	  				targetRecipeList.splice(j,1);
	  				break;
	  			}
	  		}

	  		RecipeBooks
	  		  .findByIdAndUpdate(req.body.id, { $set: {recipes:targetRecipeList} }, {new:true})

	  	}
	  	// action key has wrong value
	  	else{
	  		res.status(400).json({message:'The value of key {action} is not acceptable'}).end();
	  	}

    }else if(req.body.action || req.body.recipe){
  		// only has one of these two parameters, cannot proceed
  		let message="Cannot update recipe list - missing required fields: recipes or action";
    	console.log(message);
    	res.status(400).json({message:message}).end();
    }

    const updatedDoc=RecipeBooks.findById(req.body.id);
    res.json(updatedDoc.serialize());

});




























// DELETE -- done
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
