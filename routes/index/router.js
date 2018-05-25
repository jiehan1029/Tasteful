'use strict';
const express = require('express');
//const bodyParser = require('body-parser');
//const jsonParser = bodyParser.json();
const router = express.Router();

router.get('/',(req,res)=>{
	const renderData={
		searchSummary:'',
		searchDone:false,
		layout:false
	};

	res.render('index',renderData);
});

module.exports = {router};
