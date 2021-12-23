const mongoose=require('mongoose');
const review = require('./review');
const Schema=mongoose.Schema;

const ImageSchema=new Schema({
    url:String,
    filename:String,
})

const fileSchema=new Schema({
    url:String,
    filename:String,
})

ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload','/upload/w_200');
});

fileSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload','/upload/w_200');
});


const opts={toJSON:{virtuals:true}};

const TrekSchema=new Schema({
    organization:String,
    file:[fileSchema],
    images:[ImageSchema],
    geometry: {
        type: {
          type: String, 
          enum: ['Point'],
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
    },
    title:String,
    price:Number,
    description:String,
    location:String,
    start_date:String,
    end_date:String,

    author:{
         type:Schema.Types.ObjectId,
         ref:'User'
    },
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:'Review'
        }
    ]
},opts);
TrekSchema.virtual('properties.popUpMarkup').get(function(){
    return `
        <strong><a href="/treks/${this._id}">${this.title}</a></strong>
        <p>${this.description.substring(0,200)}....</p>`;
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