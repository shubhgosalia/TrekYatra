const {trekSchema}=require('./schema');
const Trek=require('./models/treks');
const ExpressError=require('./utils/ExpressError');
const {reviewSchema}=require('./schema');
const Review=require('./models/review');
const Enroll=require('./models/enroll');

module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.return_recent=req.originalUrl;
        req.flash('error','You need to be signed in!');
        return res.redirect('/login');
    }
     next();
}

module.exports.isAuthor=async(req,res,next)=>{
    const {id}=req.params;
    const trek=await Trek.findById(id);
    if(!trek.author.equals(req.user._id)){
           req.flash("error","Oops! Not permitted to do that");
           return res.redirect(`/treks/${id}`);
    } 
     next();
}

module.exports.isAuthorReview=async(req,res,next)=>{
    const {id,reviewId}=req.params;
    const review=await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)){
           req.flash("error","Oops! Not permitted to do that");
           return res.redirect(`/treks/${id}`);
    } 
     next();
}

module.exports.isEnrolled=async(req,res,next)=>{
    try{
        const {id}=req.params;
        const enroll_user=await Enroll.find({enrolled_trek:req.params.id})
        const enroll_count=await Enroll.find({enrolled_trek:req.params.id}).count()
        //console.log(enroll_user);
        //console.log(enroll_user[0]);
        //console.log(enroll_count);
        // console.log(req.user.email)
        //console.log(enroll_user[0].user_email)
        for(let i=0;i<enroll_count;i++)
        {
            if(req.user.email===enroll_user[i].user_email)
            {
                req.flash("error","Oops! You have already enrolled in this trek!");
                return res.redirect(`/treks/${id}`);
    
            }
        }        
        
        next();
        
    } catch(error){
        console.log(error)
    }

}

module.exports.validateReview=(req,res,next)=>{
    const {error}=reviewSchema.validate(req.body);
    if(error){
        const msg=error.details.map(el=>el.message).join(',')
        throw new ExpressError(msg,400)
    }
    else{
        next();
    }
}
