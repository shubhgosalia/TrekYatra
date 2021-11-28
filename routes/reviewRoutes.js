const express=require('express');
const router=express.Router({mergeParams:true});
const catchAsync = require('../utils/catchAsync');
const Review=require('../models/review');
const Trek = require("../models/treks");
const {validateReview,isLoggedIn,isAuthorReview}=require('../middleware');
const reviewController=require('../controllers/reviewController');

router.delete('/:reviewId',isLoggedIn,isAuthorReview,catchAsync(reviewController.deleteReview))

router.post('/',isLoggedIn,validateReview,catchAsync(reviewController.createReview))
module.exports=router;