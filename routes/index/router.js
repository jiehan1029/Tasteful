'use strict';
const express = require('express');
const router = express.Router();

router.get('/',(req,res)=>{
	const renderData={
		searchSummary:'',
		searchDone:false,
		layout:false
	};
	res.status(200).render('index',renderData);
});

module.exports = {router};
