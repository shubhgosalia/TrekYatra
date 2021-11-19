const mongoose=require('mongoose');
const review = require('./review');
const Schema=mongoose.Schema;

const TrekSchema=new Schema({
    organization:String,
    image:String,
    title:String,
    price:Number,
    description:String,
    location:String,
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:'Review'
        }
    ]
});

TrekSchema.post('findOneAndDelete',async function(doc){
    if(doc){
        await review.deleteMany({
            _id:{
                $in:doc.reviews
            }
        })
    }
})
module.exports=mongoose.model('Trek',TrekSchema);