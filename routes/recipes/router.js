// this router is for '/recipes' endpoint, which is public
// no recipe is stored in database. All obtained from a 3rd-party Api

const express = require('express');
const router = express.Router();
const request=require('request-promise');
const bodyParser=require('body-parser');

const {MASHAPE_KEY}=require('../../config');

router.use(bodyParser.urlencoded({extended:true}));
router.use(bodyParser.json());

// globals
let searchResultsData;

// search - search recipe endpoint
function GetRecipesFromApi(req,res){
  let searchOffset=(req.query.page-1)*20 || 1;
  const options={
    method:'GET',
    url:'https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/search',
    headers:{
      'X-Mashape-Key':MASHAPE_KEY
    },
    qs:{
      instructionsRequired:true,
      limitLicense:false,
      number:20, // return 20 recipes
      offset:searchOffset, // # of results to skip
      cuisine:req.query.cuisine,
      type:req.query.type,
      query:req.query.query
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
            searchDone:true,
            searchResults:data,
            layout:false
          };
      if(req.query.continue){
        res.status(200).json(hbsObj);
      }else{
        hbsObj.searchSummary='Found relevant recipes...';
        res.status(200).render('index',hbsObj);
      }
    })
    .catch(function(err){
      let errorHbs={
        statusCode:500,
        errorMessage:'Internal Server Error',
        layout:false
      };
      res.status(500).render('error',errorHbs);      
    });
}

// data - recipe information endpoint
function GetRecipeInfoFromApi(req,res){
  let recipeId=req.query.recipeApiId;
  const options={
    method:"get",
    url:`https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/${recipeId}/information`,
    headers:{
      'X-Mashape-Key':MASHAPE_KEY,
      "Accept":"application/json"
    },
    json:true
  }

  request(options)
    .then(function(data){
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
            };
      res.status(200).json(sentData);
    })
    .catch(function(err){
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
