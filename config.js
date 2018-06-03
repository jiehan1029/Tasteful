'use strict';
// use mlab database for consistency
exports.DATABASE_URL = 'mongodb://admin:admin@ds127490.mlab.com:27490/thinkful-capstone-2-app';
exports.DATABASE_URL = 'mongodb://testAdmin1:testAdmin1@ds147030.mlab.com:47030/thinkful-capstone2-test';
exports.PORT = process.env.PORT || 8080;
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
exports.MASHAPE_KEY = process.env.MASHAPE_KEY;