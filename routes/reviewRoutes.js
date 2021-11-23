const express=require('express');
const router=express.Router({mergeParams:true});
const catchAsync = require('../utils/catchAsync');
const Review=require('../models/review');
const Trek = require("../models/treks");
const {validateReview,isLoggedIn,isAuthorReview}=require('../middleware');

router.delete('/:reviewId',isLoggedIn,isAuthorReview,catchAsync(async (req,res)=>{
    // res.send('delete me');
    const {id ,reviewId}=req.params;
    await Trek.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(id);
    req.flash('success','Successfully deleted review');

    res.redirect(`/treks/${id}`);
}))

router.post('/',isLoggedIn,validateReview,catchAsync(async(req,res)=>{
    // res.send('You made it');
    const trek=await Trek.findById(req.params.id);
    const review=new Review(req.body.review);
    review.author=req.user._id;
    trek.reviews.push(review);
    await review.save();
    await trek.save();
    req.flash('success','Successfully created review');
    res.redirect(`/treks/${trek._id}`);
}))
module.exports=router;