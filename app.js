const express=require("express");
const path=require("path");
const mongoose=require("mongoose");
const Trek=require("./models/treks");


mongoose.connect("mongodb://localhost:27017/trek-yatra",
    err => {
        if(err) throw err;
        console.log('connected to MongoDB')
    });


const db=mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("Database connected");
});

const app=express();

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"))


app.get('/createtrek',async(req,res)=>{
    const trek=new Trek({title:"Sondak Trek",description:"tough hill trek"});
    await trek.save();  
    res.send(trek);
})


app.listen(3000,()=>{
    console.log("Serving on port 3000");
})