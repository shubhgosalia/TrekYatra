if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}
const Trek = require("../models/treks");
const {cloudinary}=require('../cloudinary');
const Enroll=require("../models/enroll");
const mbxGeocoding=require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken=process.env.MAPBOX_TOKEN;
const geocoder=mbxGeocoding({accessToken:mapBoxToken});
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const { google } = require('googleapis')
//const bodyParser = require('body-parser');
const fs = require('fs');
//const path = require('path');
//const multer=require('multer');

//var storage = multer.diskStorage({
   // destination: (req, file, cb) => {
       // cb(null, 'uploads')
   // },
   // filename: (req, file, cb) => {
      //  cb(null, file.fieldname + '-' + Date.now())
 //   }
//});
  
//var upload = multer({ storage: storage });


const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REDIRECT_URI = process.env.REDIRECT_URI
const REFRESH_TOKEN = process.env.REFRESH_TOKEN

const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI,
 )
 oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN })
 

async function sendMail(receiver,filename,url){
      try{
          console.log(filename);
          console.log(url);
          const accessToken=await oAuth2Client.getAccessToken()
          const transport=nodemailer.createTransport({
              service:'gmail',
              auth:{
                   type:'OAuth2',
                   user:'shubh.gosalia@somaiya.edu',
                   clientId:CLIENT_ID,
                   clientSecret:CLIENT_SECRET,
                   refreshToken:REFRESH_TOKEN,
                   accessToken:accessToken,
              },
          })

          const mailOptions = {
            from: 'TrekYatra <shubh.gosalia@somaiya.edu>',
            to: receiver,
            subject: 'TrekYatra:Trek Enrollment',
            text: `<p>Kindly Click <a href=${url}>Get itenerary</a> </p>`,
            html: `<p>Kindly Click <a href=${url}>Get itenerary</a> </p>`,
            // attachments: [{
            //     filename: `${filename}`,
            //     path: `${url}`,
            //     contentType: 'application/pdf'
            // }],
            
        }

         const result = await transport.sendMail(mailOptions)
         return result
      }catch(error){
          return error
      }
}

const JWT_SECRET = process.env.JWT_SECRET


module.exports.index=async (req, res) => {
    let treks=[];
    const term=req.query;
    //console.log(term);
    //console.log(term.search);
    if(term.search){
        treks = await Trek.find({});
        // console.log(treks);

        treks=treks.filter(trek =>{
            if(trek.search==='') return 1;
            return trek.title.toLowerCase().includes(term.search.trim().toLowerCase());
        })
        // console.log(treks);

    }
    else if(term.sortby=="priceLow"){
        treks=await Trek.find({}).sort({price: 1})

        console.log(treks);
    }
    else if(term.sortby=="priceHigh"){
        treks=await Trek.find({})
        .sort({price: -1})
    }
    else{
        treks = await Trek.find({});
    }
    
    res.render("treks/index", { treks });
}

module.exports.renderNewForm= (req, res) => {
    res.render("treks/new")
}

module.exports.createTrek=async (req, res, next) => {

    //if(!req.body.trek) throw new ExpressError('Invalid trek data',400)
    // console.log(req.body);
    //var obj = {
        //filename: req.body.name,
       // file:   
       // {
          //  data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
          //  contentType: 'application/pdf'
       // }
    //}
    //Trek.create(obj, (err, item) => {
       // if (err) {
         //   console.log(err);
      //  }
      //  else {
            // item.save();
        //    res.redirect(`/treks/${trek._id}`)

      //  }
    //});

    const geodata=await geocoder.forwardGeocode({
        query:req.body.trek.location,
        limit:1,
    }).send()
 
    const trek = new Trek(req.body.trek);
    trek.geometry=await geodata.body.features[0].geometry;
    trek.images= req.files.image.map(f=>({url:f.path,filename:f.filename}));   
    // console.log(`Image Information is ${req.files.image}`);
    trek.file=req.files.itenerary.map(f=>({url:f.path,filename:f.filename}));
    // console.log(trek.file);
    trek.author=req.user._id;
    // console.log(trek.file.url)
    await trek.save();
    // console.log(trek);
    req.flash('success','Successfully added a new Trek!');
    res.redirect(`/treks/${trek._id}`)
}




module.exports.newEnrollment=async(req,res,next)=>{
    //console.log(req.body);
    const trek=await Trek.findById(req.params.id);
    const enrolled_user = new Enroll(req.body.enroll);
    enrolled_user.enrolled_trek=req.params.id;
    await enrolled_user.save();
    console.log(enrolled_user);
    const enroll_user_email=enrolled_user.user_email;
    const secret=JWT_SECRET
    const payload={
          enroll_user_email:enrolled_user.user_email,
    }
    const token=jwt.sign(payload,secret,{expiresIn:'15m'})
    const filename=trek.file.map(f=>(f.filename))
    const url=trek.file.map(f=>(f.url))
    req.flash('success','Enrolled Successfully! Check Your mail!');
    sendMail(enroll_user_email,filename,url).then((result)=>
       console.log('Email has been sent....',result),
    )
    res.redirect(`/treks/${trek._id}/enroll`)

}

module.exports.showTrek=async (req, res) => {
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
}

module.exports.enrollTrek=async(req,res)=>{
    const trek=await Trek.findById(req.params.id);
    res.render("treks/enroll", {trek});

}


module.exports.renderEditForm=async (req, res) => {
    const {id}=req.params;
    const trek = await Trek.findById(id);
    
    if(!trek){
        req.flash('error','Oops! No such trek found!');
        return res.redirect('/treks');
    }
    res.render("treks/edit", {trek});
}

module.exports.updateTrek=async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const trek= await Trek.findByIdAndUpdate(id, { ...req.body.trek });
    const imgs=req.files.map((f)=>({url:f.path,filename:f.filename}))
    trek.images.push(...imgs)
    await trek.save();
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await trek.updateOne({$pull :{images:{filename:{$in:req.body.deleteImages}}}})
    }
    
    req.flash('success','Successfully updated the trek!');
    res.redirect(`/treks/${trek._id}`);
}

module.exports.deleteTrek=async (req, res) => {
    const { id } = req.params;
    await Trek.findByIdAndDelete(id);
    req.flash("success"," Trek deleted successfully!")
    res.redirect("/treks");
}