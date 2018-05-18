
// pending update: whether or not add recipe object into schema?

'use strict';

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const recipeBooksSchema = mongoose.Schema({
  user:{type:String, required:true},
  name: {type: String, required: true, unique: true},
  description: {type: String},
  numberOfRecipes:{type:Number, required:true},
  recipes:[{
    id: {type:Number, required:true},
    title: {type:String,required:true},
    ingredients:[String],
    /*
    cookTime:{
      number: {type:Number},
      timeUnit:{type:String}
    }, */
    imageUrl:{type:String},
    tags:[String],
    comments: {type:String}
  }]
});


recipeBooksSchema.virtual('contains').get(function() {
  return `${this.numberOfRecipes} recipes`
}); 

// this is an *instance method* which will be available on all instances of the model. Put whatever data you'd like to expose to users and leave out credentials such as username and password outside the serialize so that user won't have access to it.
recipeBooksSchema.methods.serialize = function() {
  return {
    id: this._id,
    name: this.name,
    description: this.description,
    recipes: this.recipes,
    contains:this.contains
  };
}

const RecipeBooks = mongoose.model('recipebooks', recipeBooksSchema);

module.exports = {RecipeBooks};
