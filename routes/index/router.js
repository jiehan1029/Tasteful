'use strict';
const express = require('express');
const router = express.Router();


router.get('/',(req,res)=>{
	const renderData={
		searchSummary:'',
		searchDone:false,
		layout:false
	};
	res.sendFile(path.join(__dirname + '/index.html'));
});

module.exports = {router};
