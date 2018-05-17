// this router is for '/recipes' endpoint, which is public
// no recipe is stored in database. All obtained from a 3rd-party Api

const express = require('express');
const router = express.Router();
const request=require('request-promise');

router.use(express.json());

function GetFoodApi(req,res){
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
    .then(function(response){
      return response.results;
    })
    .then(function(data){
      res.json(data);
    })
    .catch(function(err){
      console.error(err);
    });

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
  GetFoodApi(req,res);
});

module.exports = {router};