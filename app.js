const express=require("express");
const path=require("path");
const ejsmate=require("ejs-mate");
const mongoose=require("mongoose");
const Trek=require("./models/treks");
const methodOverride=require("method-override");

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

app.engine("ejs",ejsmate);
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

app.use(express.urlencoded({extended:true}))
app.use(methodOverride("_method"));

app.get("/treks",async(req,res)=>{
    const treks=await Trek.find({});
    res.render("treks/index",{treks});
});

app.get("/treks/new",(req,res)=>{
    res.render("treks/new")
});

app.post("/treks",async(req,res)=>{
    const trek = new Trek(req.body.trek);
    await trek.save();
    res.redirect(`/treks/${trek._id}`)
});

app.get("/treks/:id",async(req,res)=>{
    const trek=await Trek.findById(req.params.id)
    res.render("treks/show",{trek});
});

app.get("/treks/:id/edit",async(req,res)=>{
    const trek=await Trek.findById(req.params.id);
    res.render("treks/edit",{trek});
});

app.put("/treks/:id",async(req,res)=>{
    const {id}=req.params;
    const trek=await Trek.findByIdAndUpdate(id,{...req.body.trek});
    res.redirect(`/treks/${trek._id}`);
});

app.delete("/treks/:id",async(req,res)=>{
    const {id}=req.params;
    await Trek.findByIdAndDelete(id);
    res.redirect("/treks"); 
})
app.listen(3000,()=>{
    console.log("Serving on port 3000");
})