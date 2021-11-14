const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const TrekSchema=new Schema({
    organization:String,
    image:String,
    title:String,
    price:Number,
    description:String,
    location:String
});

module.exports=mongoose.model('Trek',TrekSchema);