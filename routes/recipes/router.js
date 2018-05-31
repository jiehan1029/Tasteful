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

// search - search recipe endpoint
function GetRecipesFromApi(req,res){
  let searchOffset=(req.body.page-1)*20;
  const options={
    method:'GET',
    url:'https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/search',
    headers:{
      'X-Mashape-Key':'37Xj7LDM2MmshuZOtev9ZN6Haux3p12HtOzjsn1NYUwDy9qL9D'
    },
    qs:{
      instructionsRequired:true,
      limitLicense:false,
      number:20, // return 20 recipes
      offset:searchOffset, // # of results to skip
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
            searchSummary:'Found relevant recipes...',
            searchDone:true,
            searchResults:data,
            layout:false
          };
      //res.status(200).json(hbsObj);
      console.log(hbsObj);
      res.status(200).render('index',hbsObj);
    })
    .catch(function(err){
      //console.error(err);
      let errorHbs={
        statusCode:500,
        errorMessage:'Internal Server Error',
        layout:false
      };
      res.status(500).render('error',errorHbs);      
      //res.status(500).json({message:'Internal Server Error'});
    });
}

// data - recipe information endpoint
function GetRecipeInfoFromApi(req,res){
  let recipeId=req.query.recipeApiId;
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
      /*
      let hbsRecipeDetailsObj={
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
          */
      //console.log(hbsRecipeDetailsObj);
      console.log(data.analyzedInstructions);
      let analyzedInstructions=data.analyzedInstructions;
      const sentData={
              recipeApiId:data.id,
              title:data.title,
              image:data.image,
              servings:data.servings,
              readyInMinutes:data.readyInMinutes,
              extendedIngredients:data.extendedIngredients,
              instructions:data.analyzedInstructions
              //instructions:data.instructions        
            };
      res.status(200).json(sentData);
    })
    .catch(function(err){
      //console.error(err);
      let errorHbs={
        statusCode:500,
        errorMessage:'Internal Server Error',
        layout:false
      };
      res.status(500).render('error',errorHbs);
      //res.status(500).json({message:'Internal Server Error'});
    });
}

// POST method - user submits a form to server
// search 'Spoonacular Search Recipes by natural language' endpoint
router.get('/',(req, res) => {
  GetRecipesFromApi(req,res);
});

// GET method - user tries to fetch details of a recipe
router.get('/details',(req,res)=>{
  GetRecipeInfoFromApi(req,res);
});


module.exports = {router};
