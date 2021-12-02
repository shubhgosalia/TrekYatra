const Trek = require("../models/treks");
const {cloudinary}=require('../cloudinary');

const mbxGeocoding=require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken=process.env.MAPBOX_TOKEN;
const geocoder=mbxGeocoding({accessToken:mapBoxToken});


var Publishable_Key =process.env.Publishable_Key
var Secret_Key = process.env.Secret_Key



module.exports.index=async (req, res) => {
    const treks = await Trek.find({});
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