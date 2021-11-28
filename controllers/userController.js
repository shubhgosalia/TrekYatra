const User=require('../models/user');


module.exports.renderRegister=(req,res)=>{
    res.render("users/register");
}

module.exports.register=async(req,res,next)=>{
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
}

module.exports.renderLogin=(req,res)=>{
    res.render("users/login");
}

module.exports.login=(req,res)=>{
    req.flash('success','Welcome to TrekYatra!');
    const redirectUrl=req.session.return_recent || '/treks'
    //once logged in you are redirected back to the most recent session/page
    delete req.session.return_recent;
    res.redirect(redirectUrl);
}

module.exports.logout=(req,res)=>{
    req.logout();
    req.flash('success',"Logged you out!");
    res.redirect('/treks');
}