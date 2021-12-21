const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const EnrollSchema=new Schema({
    full_name:String,
    dob:Date,
    user_email:String,
    city:String,
    isTrekked:String,
    
    enrolled_trek:{
        type:Schema.Types.ObjectId,
        ref:'Trek'
    }
})

module.exports=mongoose.model('Enroll',EnrollSchema);