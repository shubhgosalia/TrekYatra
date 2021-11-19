const express=require('express');
const router=express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError=require('../utils/ExpressError');
const Trek = require("../models/treks");
const {trekSchema}=require('../schema');


const validateTrek=(req,res,next)=>{
    const {error}=trekSchema.validate(req.body);
    if(error){
        const msg=error.details.map(el=>el.message).join(',')
        throw new ExpressError(msg,400)
    }
    else{
        next();
    }
}
router.get("/", catchAsync(async (req, res) => {
    const treks = await Trek.find({});
    res.render("treks/index", { treks });
}));

router.get("/new", (req, res) => {
    res.render("treks/new")
});

router.post("/",catchAsync(async (req, res, next) => {

    if(!req.body.trek) throw new ExpressError('Invalid camp data',400)
    const trek = new Trek(req.body.trek);
    await trek.save();
    req.flash('success','Successfully made a tour');
    res.redirect(`/treks/${trek._id}`)
}));

router.get("/:id", catchAsync(async (req, res) => {
    const trek = await Trek.findById(req.params.id).populate('reviews');
    if(!trek){
        req.flash('error','Cannot find that trek');
        return res.redirect('/treks');
    }
    res.render("treks/show", { trek,msg:req.flash('success')});
}));

router.get("/:id/edit",catchAsync( async (req, res) => {
    const trek = await Trek.findById(req.params.id);
    res.render("treks/edit", { trek });
}));

router.put("/:id",catchAsync( async (req, res) => {
    const { id } = req.params;
    const trek = await Trek.findByIdAndUpdate(id, { ...req.body.trek });
    req.flash('success','Successfully updated the trek');
    res.redirect(`/treks/${trek._id}`);
}));

router.delete("/:id", catchAsync(async (req, res) => {
    const { id } = req.params;
    await Trek.findByIdAndDelete(id);
    res.redirect("/treks");
}));

module.exports=router;