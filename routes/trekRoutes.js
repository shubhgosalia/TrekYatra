const express=require('express');
const router=express.Router();
const catchAsync = require('../utils/catchAsync');
const Trek = require("../models/treks");
const {isLoggedIn,isAuthor}=require('../middleware');


//const validateTrek=(req,res,next)=>{
    //const {error}=trekSchema.validate(req.body);
   // if(error){
    //    const msg=error.details.map(el=>el.message).join(',')
   //     throw new ExpressError(msg,400)
  //  }
  //  else{
  //      next();
    //}
//}


router.get("/", catchAsync(async (req, res) => {
    const treks = await Trek.find({});
    res.render("treks/index", { treks });
}));

router.get("/new", isLoggedIn,  (req, res) => {
        res.render("treks/new")
});

router.post("/",isLoggedIn,catchAsync(async (req, res, next) => {
    //if(!req.body.trek) throw new ExpressError('Invalid trek data',400)
    const trek = new Trek(req.body.trek);
    trek.author=req.user._id;
    await trek.save();
    req.flash('success','Successfully added a new Trek!');
    res.redirect(`/treks/${trek._id}`)
}));

router.get("/:id", catchAsync(async (req, res) => {
    const trek = await Trek.findById(req.params.id).populate({
        path:'reviews',
        populate:{
            path:'author'
        }
}).populate('author');
    console.log(trek)
    if(!trek){
        req.flash('error','Cannot find that trek');
        return res.redirect('/treks');
    }
    res.render("treks/show", { trek,msg:req.flash('success')});
}));

router.get("/:id/edit",isLoggedIn,isAuthor,catchAsync( async (req, res) => {
    const {id}=req.params;
    const trek = await Trek.findById(id);
   
    if(!trek){
        req.flash('error','Oops! No such trek found!');
        return res.redirect('/treks');
    }
    res.render("treks/edit", {trek});
}));

router.put("/:id",isLoggedIn,isAuthor,catchAsync( async (req, res) => {
    const { id } = req.params;
    const trek= await Trek.findByIdAndUpdate(id, { ...req.body.trek });
    req.flash('success','Successfully updated the trek!');
    res.redirect(`/treks/${trek._id}`);
}));

router.delete("/:id",isLoggedIn,isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Trek.findByIdAndDelete(id);
    req.flash("success"," Trek deleted successfully!")
    res.redirect("/treks");
}));

module.exports=router;