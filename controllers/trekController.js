const Trek = require("../models/treks");
const {cloudinary}=require('../cloudinary');
const Enroll=require("../models/enroll");
const mbxGeocoding=require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken=process.env.MAPBOX_TOKEN;
const geocoder=mbxGeocoding({accessToken:mapBoxToken});


var Publishable_Key =process.env.Publishable_Key
var Secret_Key = process.env.Secret_Key



module.exports.index=async (req, res) => {
    let treks=[];
    const term=req.query;
    console.log(term);
    console.log(term.search);
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

    const geodata=await geocoder.forwardGeocode({
        query:req.body.trek.location,
        limit:1,
    }).send()

    const trek = new Trek(req.body.trek);
    trek.geometry=await geodata.body.features[0].geometry;
    trek.images= req.files.map(f=>({url:f.path,filename:f.filename}));   
    trek.author=req.user._id;
    await trek.save();
    console.log(trek);
    req.flash('success','Successfully added a new Trek!');
    res.redirect(`/treks/${trek._id}`)
}

module.exports.newEnrollment=async(req,res,next)=>{

    const trek=await Trek.findById(req.params.id);
    console.log(req.body);
    const enrolled_user = new Enroll(req.body.enroll);
    //enrolled_user.enrolled_trek=req.trek._id;
    await enrolled_user.save();
    console.log(enrolled_user);
    req.flash('success','Enrolled Successfully! Check Your mail!');
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
    res.render("treks/show", { trek,msg:req.flash('success'),key:Publishable_Key});
}

module.exports.enrollTrek=async(req,res)=>{
    const trek=await Trek.findById(req.params.id);
    res.render("treks/enroll", {trek});

}

//module.exports.enrollPayment=async(req,res) => {
   // stripe.customers.create({
      //  email: req.body.stripeEmail,
      //  source: req.body.stripeToken,
      //  name: 'Gourav Hammad',
       // address: {
         //   line1: 'TC 9/4 Old MES colony',
          //  postal_code: '452331',
         //   city: 'Indore',
          //  state: 'Madhya Pradesh',
         //   country: 'India',
        //}
    //})
    //.then((customer) => {
  
       // return stripe.charges.create({
       //     amount: 2500,
       //     description: 'Web Development Product',
        //    currency: 'INR',
         //   customer: customer.id
       // });
   // })
  //  .then((charge) => {
    //    res.send("Success")  // If no error occurs
  //  })
   // .catch((err) => {
   //     res.send(err)       // If some error occurs
    //});
//}

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