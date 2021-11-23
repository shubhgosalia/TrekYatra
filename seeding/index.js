const mongoose=require("mongoose");
const Trek=require('../models/treks');
const cities=require('./cities');
const { places, descriptors } = require('./trek_title');


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

const example= array => array[Math.floor(Math.random()*array.length)];


const seedDB=async()=>{
    await Trek.deleteMany({});
    for(let i=0;i<50;i++)
    {
        const rand=Math.floor(Math.random()*1000);
        const price=Math.floor(Math.random()*3000)+1000
        const tk=new Trek({
            author:'619cc7ffc2acdaf78c33dbc0',
            location:`${cities[rand].city},${cities[rand].state}`,
            title:`${example(descriptors)} ${example(places)}`,
            image:"https://source.unsplash.com/collection/483251",
            description:"mysterious mountains of kanhala",
            organization:"Kansuri Private Ltd.",
            price
        })
        await tk.save();
    }
}

seedDB().then(()=>{
    mongoose.connection.close();
})