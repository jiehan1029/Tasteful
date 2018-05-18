// this router is for '/recipes' endpoint, which is public
// no recipe is stored in database. All obtained from a 3rd-party Api

const express = require('express');
const router = express.Router();
const request=require('request-promise');

router.use(express.json());

function GetRecipesFromApi(req,res){
  const options={
    method:'GET',
    url:'https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/searchComplex',
    headers:{
      'X-Mashape-Key':'t9elQM8DjDmshmCoAMsWUcNZoMS6p1qZ5zzjsnOFwa9qrvfmIJ'
    },
    qs:{
      addRecipeInformation:false,
      fillIngredients:false,
      instructionsRequired:true,
      limitLicense:false,
      number:20, // return 20 recipes
      offset:0, // # of results to skip
      ranking:2, // rank recipes by relevance

      includeIngredients:req.body.ingredients,
      intolerances:req.body.intolerances,
      cuisine:req.body.cuisine,
      query:req.body.query

    },
    json:true
  }

  request(options)
    .then(function(apiResponse){
      return apiResponse.results;
    })
    .then(function(data){
      res.json(data);
    })
    .catch(function(err){
      console.error(err);
    });

}

function GetRecipeInfoFromApi(req,res){

  let recipeId=req.params.id;
  let recipeObj={};

  recipeObj.id=recipeId;

  const options={
    method:"get",
    url:`https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/${recipeId}/information`,
    headers:{
      'X-Mashape-Key':'t9elQM8DjDmshmCoAMsWUcNZoMS6p1qZ5zzjsnOFwa9qrvfmIJ'
    },
    qs:{
      stepBreakdown:true
    },
    json:true
  }

  request(options)
    .then(function(apiResponse){
      res.json(apiResponse.results);
    })

}

// GET method
// GET 'Spoonacular Search Recipes Complex' endpoint
// if no request.body found, will return random recipes. otherwise return search results
/* request.body = {
  ingredients:'',    // comma separated string
  intolerances:'',
  cuisine:'',
  query:''
} */
router.get('/', (req, res) => {
  GetRecipesFromApi(req,res);
});

// get recipe details by recipe id
router.get('/:id',(req,res)=>{
  GetRecipeInfoFromApi(req,res)
});

module.exports = {router};