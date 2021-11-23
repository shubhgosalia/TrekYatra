const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const pass_loc_mongoose=require("passport-local-mongoose");
    
const UserSchema=new Schema({
     email:{
         type:String,
         required:true,
         unique:true
     }
});

UserSchema.plugin(pass_loc_mongoose);
module.exports=mongoose.model('User',UserSchema);