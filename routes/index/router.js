'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const router = express.Router();

router.get('/',(req,res)=>{
	res.render('index');
	//res.sendFile(path.join(__dirname+'/index.html'));
});

module.exports = {router};