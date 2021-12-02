if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}
const express = require("express");
const path = require("path");
const ejsmate = require("ejs-mate");
const mongoose = require("mongoose");
const Trek = require("./models/treks");
const catchAsync = require('./utils/catchAsync')
const ExpressError=require('./utils/ExpressError')
const methodOverride = require("method-override");
const {trekSchema,reviewSchema}=require('./schema');
const Review=require('./models/review');
const { nextTick } = require("process");
const passport=require("passport");
const loc_strategy=require("passport-local");
const User=require("./models/user");
const treks=require('./routes/trekRoutes');
const reviews=require('./routes/reviewRoutes');
const session=require('express-session');
const flash=require('connect-flash');
const users=require("./routes/userRoutes");

var stripe = require('stripe')(process.env.Secret_Key);
  
var Publishable_Key =process.env.Publishable_Key
var Secret_Key = process.env.Secret_Key

  
mongoose.connect("mongodb://localhost:27017/trek-yatra",
    err => {
        if (err) throw err;
        console.log('connected to MongoDB')
    });

//var instance = new Razorpay({
  //    key_id:process.env.key_id,
  //    key_secret:process.env.key_secret
//})
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine("ejs", ejsmate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride("_method"));

app.use(express.static(path.join(__dirname, "public")));

const sessionconfig={
    secret:'this should be a better secret',
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        expries:Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
}
app.use(session(sessionconfig))
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new loc_strategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.currentUser=req.user;
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');

    next();
})

//app.post("/payment/:id",async(req,res)=>{
   // const trek=await Trek.findById(req.params.id);

   // var options = {
    //    amount: `${trek.price}`,
    //    currency: "INR",
    //    receipt: "order_rcptid_11"
     // };
    //  instance.orders.create(options, function(err, order) {
     //   console.log(order);
     //   res.send({orderId:order.id});
     // });      
//})

app.get("/fakeUser",async(req,res)=>{
    const user=new User({email:"a@gmail.com",username:"aa"});
    const newUser=await User.register(user,"aab");
    res.send(newUser);
})

app.use('/',users);
app.use('/treks',treks);
app.use('/treks/:id/reviews',reviews);

app.get('/',(req,res)=>{
    res.render('landing');
})

app.all('*',(req,res,next)=>{
    next(new ExpressError('Page not found','404'))
})

app.use((err, req, res, next) => {
    const {statuscode=500}=err
    if(!err.message) err.message='Something went wrong'
    res.status(statuscode).render('treks/error.ejs',{err});
});

app.post('/payment', function(req, res){
  
    // Moreover you can take more details from user
    // like Address, Name, etc from form
    stripe.customers.create({
        email: req.body.stripeEmail,
        source: req.body.stripeToken,
        name: 'Gourav Hammad',
        address: {
            line1: 'TC 9/4 Old MES colony',
            postal_code: '452331',
            city: 'Indore',
            state: 'Madhya Pradesh',
            country: 'India',
        }
    })
    .then((customer) => {
  
        return stripe.charges.create({
            amount: 2500,     // Charing Rs 25
            description: 'Web Development Product',
            currency: 'INR',
            customer: customer.id
        });
    })
    .then((charge) => {
        res.send("Success")  // If no error occurs
    })
    .catch((err) => {
        res.send(err)       // If some error occurs
    });
})

app.listen(3000, () => {
    console.log("Serving on port 3000");
});