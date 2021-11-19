const express=require('express');
const router=express.Router({mergeParams:true});
const catchAsync = require('../utils/catchAsync');
const ExpressError=require('../utils/ExpressError');
const Review=require('../models/review');
const Trek = require("../models/treks");
const {reviewSchema}=require('../schema');

const validateReview=(req,res,next)=>{
    const {error}=reviewSchema.validate(req.body);
    if(error){
        const msg=error.details.map(el=>el.message).join(',')
        throw new ExpressError(msg,400)
    }
    else{
        next();
    }
}

router.delete('/:reviewId',catchAsync(async (req,res)=>{
    // res.send('delete me');

    const {id ,reviewId}=req.params;
    await Trek.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(id);
    req.flash('success','Successfully deleted review');

    res.redirect(`/treks/${id}`);
}))

router.post('/',validateReview,catchAsync(async(req,res)=>{
    // res.send('You made it');
    const trek=await Trek.findById(req.params.id);
    const review=new Review(req.body.review);
    trek.reviews.push(review);
    await review.save();
    await trek.save();
    req.flash('success','Successfully created review');
    res.redirect(`/treks/${trek._id}`);
}))
module.exports=router;