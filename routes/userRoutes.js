const express=require('express');
const router=express.Router();
const User=require('../models/user');
const catchAsync=require('../utils/catchAsync');
const passport=require('passport');

router.get("/register",(req,res)=>{
    res.render("users/register");
})

router.post("/register",catchAsync(async(req,res,next)=>{
    try{
        const{email,username,password}=req.body;
        const user=new User({email,username});
        const registeredUser=await User.register(user,password);// register is the passport local mongoose function
        //logs in the user once registered
        req.login(registeredUser,err=>{
              if(err) return next(err)
              req.flash("success","Welcome to TrekYatra!");
              res.redirect('/treks');    
        })
    }catch(e){
        req.flash("error",e.message);
        res.redirect('register');   
    }
}));

router.get("/login",(req,res)=>{
     res.render("users/login");
}); 

router.post("/login",passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),(req,res)=>{
    req.flash('success','Welcome to TrekYatra!');
    const redirectUrl=req.session.return_recent || '/treks'
    //once logged in you are redirected back to the most recent session/page
    delete req.session.return_recent;
    res.redirect(redirectUrl);
}); 

router.get('/logout',(req,res)=>{
    req.logout();
    req.flash('success',"Logged you out!");
    res.redirect('/treks');
})

module.exports=router;
