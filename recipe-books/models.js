'use strict';

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const recipeBooksSchema = mongoose.Schema({
  user:{type:String, required:true},
  name: {type: String, required: true, unique: true},
  description: {type: String},
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

/*
recipeBooksSchema.recipes.virtual('readyIn').get(function() {
  return `${this.cookTime.number} ${this.cookTime.timeUnit}`.trim()
}); */

// this is an *instance method* which will be available on all instances of the model. Put whatever data you'd like to expose to users and leave out credentials such as username and password outside the serialize so that user won't have access to it.
recipeBooksSchema.methods.serialize = function() {
  return {
    id: this._id,
    name: this.name,
    description: this.description,
    recipes: this.recipes
  };
}

const RecipeBooks = mongoose.model('recipebooks', recipeBooksSchema);

module.exports = {RecipeBooks};
