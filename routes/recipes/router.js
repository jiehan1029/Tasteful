// this router is for '/recipes' endpoint, which is public
// no recipe is stored in database. All obtained from a 3rd-party Api

const express = require('express');
const router = express.Router();
const request=require('request-promise');
const bodyParser=require('body-parser');

router.use(bodyParser.urlencoded({extended:true}));
router.use(bodyParser.json());

// globals
let searchResultsData;

// searchComplex endpoint
function GetRecipesFromApi(req,res){
  const options={
    method:'GET',
    url:'https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/search',
    headers:{
      'X-Mashape-Key':'37Xj7LDM2MmshuZOtev9ZN6Haux3p12HtOzjsn1NYUwDy9qL9D'
    },
    qs:{
      instructionsRequired:true,
      limitLicense:false,
      number:5, // return 20 recipes
      offset:0, // # of results to skip
      cuisine:req.body.cuisine,
      type:req.body.type,
      query:req.body.query
    },
    json:true
  }

  request(options)
    .then(function(apiResponse){
      return apiResponse.results;
    })
    .then(function(data){
      searchResultsData=data;
      let hbsObj={
            pageTitle:'Tasteful',
            searchSummary:'Found relevant recipes as follows',
            searchDone:true,
            searchResults:data,
            layout:false
          };
      res.status(200).render('index',hbsObj);
    })
    .catch(function(err){
      console.error(err);
      res.status(500).json({message:'Internal Server Error'});
    });
}

function GetRecipeInfoFromApi(req,res){
  let recipeId=req.body.recipeApiId;
  const options={
    method:"get",
    url:`https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/${recipeId}/information`,
    headers:{
      'X-Mashape-Key':'t9elQM8DjDmshmCoAMsWUcNZoMS6p1qZ5zzjsnOFwa9qrvfmIJ',
      "Accept":"application/json"
    },
    json:true
  }

  request(options)
    .then(function(data){
      let hbsRecipeDetailsObj={
            pageTitle:'Tasteful',
            searchSummary:'Found recipes...',
            searchDone:true,
            searchResults:searchResultsData,
            layout:false,
            recipeDetails:{
              title:data.title,
              image:data.image,
              servings:data.servings,
              readyInMinutes:data.readyInMinutes,
              extendedIngredients:data.extendedIngredients,
              instructions:data.instructions
            }
          };
      //console.log(hbsRecipeDetailsObj);

      const sentData={
              title:data.title,
              image:data.image,
              servings:data.servings,
              readyInMinutes:data.readyInMinutes,
              extendedIngredients:data.extendedIngredients,
              instructions:data.instructions        
            }

      res.status(200).json(sentData);
      //res.status(200).render('index',hbsRecipeDetailsObj);
    })
    .catch(function(err){
      console.error(err);
      res.status(500).json({message:'Internal Server Error'});
    });
}

// GET method
// GET 'Spoonacular Search Recipes by natural language' endpoint
router.post('/',(req, res) => {
  GetRecipesFromApi(req,res);
});

router.post('/details',(req,res)=>{
  GetRecipeInfoFromApi(req,res);
});


module.exports = {router};