// this router is for '/recipes' endpoint, which is public
// no recipe is stored in database. All obtained from a 3rd-party Api

const express = require('express');
const router = express.Router();
const request=require('request-promise');
const bodyParser=require('body-parser');

router.use(bodyParser.urlencoded({extended:true}));
router.use(bodyParser.json());

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

      includeIngredients:req.query.ingredients,
      intolerances:req.query.intolerances,
      cuisine:req.query.cuisine,
      query:req.query.query

    },
    json:true
  }

  request(options)
    .then(function(apiResponse){
      return apiResponse.results;
    })
    .then(function(data){
      res.status(200).json(data);
    })
    .catch(function(err){
      console.error(err);
    });
}

function GetRecipeInfoFromApi(req,res){

  let recipeId=req.query.apiId;

  //let recipeObj={};
  //recipeObj.apiId=recipeId;

  const options={
    method:"get",
    url:`https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/${recipeId}/information`,
    headers:{
      'X-Mashape-Key':'t9elQM8DjDmshmCoAMsWUcNZoMS6p1qZ5zzjsnOFwa9qrvfmIJ'
    },
    json:true
  }

  request(options)
    .then(function(apiResponse){
      res.json(apiResponse);
    })

}

// GET method
// GET 'Spoonacular Search Recipes Complex' endpoint
// if no request.query.apiId found, will return random recipes. otherwise return search results
/* request.query = {
  apiId: ,
  ingredients:'',    // comma separated string
  intolerances:'',
  cuisine:'',
  query:''
} */


router.post('/', (req, res) => {
  // console.log(req.body);
  GetRecipesFromApi(req,res);
  /*
  if(!req.body.apiId){
    GetRecipesFromApi(req,res);
  }else{
    GetRecipeInfoFromApi(req,res)
  } */
});


router.post('/details/:apiId',(req,res)=>{
  const {apiId}=req.params;
  GetRecipeInfoFromApi(req,res);
});


module.exports = {router};